import { useState, useEffect, useRef, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import { useFrame } from '@react-three/fiber';
import { $panel, $rotationSteps } from '@/stores/signup';
import type { PanelId } from '@/utils/signup-flow';

/**
 * A still of the sphere, exported from this same shader, used only when WebGL
 * is unavailable. If the asset is missing the page falls back to Canvas Black
 * rather than showing a broken image.
 */
const SPHERE_STILL_SRC = '/images/sphere-still.webp';
import {
  PANEL_FRAMING,
  PANEL_TRANSITION_MS,
  ROTATION_DELTA_RAD,
  easeOutExpo,
} from '@/utils/signup-motion';
import {
  SHADER_PRESET_A,
  SHADER_PRESET_B,
  SHADER_PRESET_C,
  SHADER_PRESET_D,
  DEFAULT_CANVAS_OPTIONS,
  type ShaderGradientConfig,
  type ShaderPresetKey,
} from './shaderConfig';

/**
 * A yaw move in progress. The Adoption Portal drives this so the camera and the
 * CSS panel slide share one timeline instead of a spring and an ease landing
 * near each other. See `signup-motion.ts` for the contract.
 */
export interface FlowRotation {
  from: number;
  to: number;
  startedAt: number;
  durationMs: number;
}

interface ParallaxRigProps {
  mouseRef: React.RefObject<{ x: number; y: number }>;
  scrollRef: React.RefObject<number>;
  flowRotationRef: React.RefObject<FlowRotation | null>;
  isSuspended: boolean;
  prefersReducedMotion: boolean;
}

function WebGLParallaxRig({
  mouseRef,
  scrollRef,
  flowRotationRef,
  isSuspended,
  prefersReducedMotion,
}: ParallaxRigProps) {
  // Parallax is smoothed per-frame; the flow's yaw is authored on an exact
  // duration. They are summed rather than blended so neither can swallow the
  // other.
  const parallaxRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useFrame(({ scene }) => {
    const move = flowRotationRef.current;
    let flowY = 0;
    if (move) {
      const elapsed = performance.now() - move.startedAt;
      const progress = move.durationMs <= 0 ? 1 : elapsed / move.durationMs;
      flowY = move.from + (move.to - move.from) * easeOutExpo(progress);
      if (progress >= 1) {
        flowRotationRef.current = { ...move, from: move.to, startedAt: 0, durationMs: 0 };
      }
    }

    if (isSuspended || prefersReducedMotion) {
      scene.rotation.y = flowY;
      scene.rotation.x = 0;
      return;
    }

    const targetRotY = (mouseRef.current?.x ?? 0) * 0.12 + (scrollRef.current ?? 0) * 0.04;
    const targetRotX = (mouseRef.current?.y ?? 0) * 0.06;
    parallaxRef.current.x += (targetRotY - parallaxRef.current.x) * 0.05;
    parallaxRef.current.y += (targetRotX - parallaxRef.current.y) * 0.05;

    scene.rotation.y = flowY + parallaxRef.current.x;
    scene.rotation.x = parallaxRef.current.y;
  });
  return null;
}

export interface ShaderBackgroundProps {
  /**
   * Optional manual preset override.
   * If omitted, dynamically managed by scroll/IntersectionObserver.
   */
  forcedPreset?: ShaderPresetKey;
  /**
   * Binds the camera to the Adoption Portal's panel state: yaw accumulates one
   * fixed delta per transition, framing is absolute per panel.
   */
  flow?: 'signup';
  /**
   * 'immediate' skips the idle deferral and the ambient fade. The confirmation
   * page uses it so the sphere is present on first paint, where a hole would
   * land exactly where the flow is meant to feel continuous.
   */
  mountMode?: 'idle' | 'immediate';
  /**
   * Seeds the panel the camera opens on. The confirmation page opens on the
   * commit framing so the sphere is already small and to the right, rather
   * than snapping there a frame after the page paints.
   */
  initialPanel?: PanelId;
  /**
   * Optional custom className for outer wrapper.
   */
  className?: string;
}

export default function ShaderBackground({
  forcedPreset,
  flow,
  mountMode = 'idle',
  initialPanel,
  className,
}: ShaderBackgroundProps) {
  const isImmediate = mountMode === 'immediate';
  const [isIdle, setIsIdle] = useState<boolean>(isImmediate);
  const [activePresetKey, setActivePresetKey] = useState<ShaderPresetKey>(
    forcedPreset ?? 'presetA'
  );
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isReadyForTransitions, setIsReadyForTransitions] = useState<boolean>(false);
  const [isPresetSwapping, setIsPresetSwapping] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  /**
   * True when there is no canvas to freeze: WebGL was refused outright, or the
   * context was lost mid-session. Distinct from reduced motion, where the mesh
   * is still rendered and simply stops animating.
   */
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);
  const [stillFailed, setStillFailed] = useState<boolean>(false);

  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollTargetRef = useRef<number>(0);
  const prevPresetRef = useRef<ShaderPresetKey>(activePresetKey);

  // ---------------------------------------------------------------------------
  // Adoption Portal binding. Inert on every other surface.
  // ---------------------------------------------------------------------------
  const storedPanel = useStore($panel);
  const flowSteps = useStore($rotationSteps);
  const [isSeeded, setIsSeeded] = useState<boolean>(false);

  /**
   * The opening framing applies on the very first render, before the store has
   * been told about it, so the confirmation page paints with the sphere already
   * small and to the right rather than snapping there a frame later. The store
   * is updated in an effect, for any other island that reads it.
   */
  const flowPanel = !isSeeded && initialPanel ? initialPanel : storedPanel;

  useEffect(() => {
    if (!initialPanel) return;
    $panel.set(initialPanel);
    setIsSeeded(true);
  }, [initialPanel]);
  const flowRotationRef = useRef<FlowRotation | null>(null);
  const isFlowBound = flow === 'signup';

  useEffect(() => {
    if (!isFlowBound) return;

    const to = flowSteps * ROTATION_DELTA_RAD;
    const current = flowRotationRef.current;
    const from = current
      ? current.from + (current.to - current.from) * easeOutExpo(
          current.durationMs <= 0 ? 1 : (performance.now() - current.startedAt) / current.durationMs
        )
      : 0;

    // Reduced motion keeps the world where it is: the panels cross-fade instead.
    flowRotationRef.current = prefersReducedMotion
      ? { from: 0, to: 0, startedAt: 0, durationMs: 0 }
      : { from, to, startedAt: performance.now(), durationMs: PANEL_TRANSITION_MS };
  }, [isFlowBound, flowSteps, prefersReducedMotion]);

  // ---------------------------------------------------------------------------
  // 0. Idle mount deferral (timeout: 800ms)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isImmediate) return;
    if ('requestIdleCallback' in window) {
      const handle = (window as Window & { requestIdleCallback: any; cancelIdleCallback: any }).requestIdleCallback(
        () => setIsIdle(true),
        { timeout: 800 }
      );
      return () => (window as Window & { cancelIdleCallback: any }).cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(() => setIsIdle(true), 200);
      return () => clearTimeout(timer);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // 1. First-paint fade-in trigger & initial coordinate snap
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isImmediate) {
      setIsLoaded(true);
      setIsReadyForTransitions(true);
      return;
    }
    // Reveal canvas and enable native damping only after initial mount snap
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setIsReadyForTransitions(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [isImmediate]);

  // ---------------------------------------------------------------------------
  // 2. Prefers-reduced-motion detection
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // ---------------------------------------------------------------------------
  // 2a. WebGL availability and context loss
  //
  // Hardened browsers refuse WebGL outright, and a thermally throttled phone
  // can lose the context part-way through a session. Either way there is
  // nothing to freeze, so a still stands in — the same sphere, pre-rendered,
  // which DESIGN.md's Mesh Noise Splash Rule sanctions as the system's other
  // primary rather than as a degraded version of it.
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const probe = document.createElement('canvas');
      const context =
        probe.getContext('webgl2') ||
        probe.getContext('webgl') ||
        probe.getContext('experimental-webgl');
      if (!context) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    const onContextLost = () => setHasWebGL(false);
    window.addEventListener('webglcontextlost', onContextLost, true);
    return () => window.removeEventListener('webglcontextlost', onContextLost, true);
  }, []);

  // ---------------------------------------------------------------------------
  // 2b. Instant preset swap (temporarily disable transition on section change)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (prevPresetRef.current !== activePresetKey) {
      prevPresetRef.current = activePresetKey;
      // Force enableTransition to false during exact moment of section transition
      // so we swap presets instantly without camera glide
      setIsPresetSwapping(true);
      const raf = requestAnimationFrame(() => {
        setIsPresetSwapping(false);
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [activePresetKey]);

  // ---------------------------------------------------------------------------
  // 3. Observer-Ready Section Seams (Direction 2: Decoupled Latch & Suspension)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (forcedPreset) {
      setActivePresetKey(forcedPreset);
      return;
    }

    const sectionSelectors = [
      { selector: '.hero-fullscreen', preset: 'presetA' as const },
      { selector: '#routes-featured', preset: 'presetB' as const },
      { selector: '#bottom-cta', preset: 'presetA' as const },
    ];

    const observedElements: { element: Element; preset: ShaderPresetKey; isIntersecting: boolean }[] = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const match = observedElements.find((item) => item.element === target);
          if (!match) return;

          match.isIntersecting = entry.isIntersecting;

          if (entry.isIntersecting) {
            setActivePresetKey(match.preset);
          }
        });

        // Suspend rendering ONLY when no transparent section is visible (e.g. inside opaque curtains)
        const anyVisible = observedElements.some((item) => item.isIntersecting);
        setIsSuspended(!anyVisible);
      },
      {
        threshold: 0,
        rootMargin: '50px 0px 50px 0px',
      }
    );

    const attachAvailableElements = () => {
      sectionSelectors.forEach(({ selector, preset }) => {
        const el = document.querySelector(selector);
        if (el && !observedElements.some((item) => item.element === el)) {
          observedElements.push({ element: el, preset, isIntersecting: false });
          observer.observe(el);
        }
      });
    };

    // Initial scan on React mount
    attachAvailableElements();

    return () => {
      observer.disconnect();
    };
  }, [forcedPreset]);

  // ---------------------------------------------------------------------------
  // 4. Subtle Cursor & Scroll Momentum Parallax (Pure WebGL useFrame, 0 React Rerenders)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (prefersReducedMotion) return;

    const handlePointerMove = (e: PointerEvent) => {
      // Ignore touch events to preserve native touch scrolling
      if (e.pointerType === 'touch') return;

      const normX = (e.clientX / window.innerWidth) * 2 - 1; // -1 to 1
      const normY = (e.clientY / window.innerHeight) * 2 - 1; // -1 to 1

      mouseTargetRef.current = { x: normX, y: normY };
    };

    const handleScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      scrollTargetRef.current = maxScroll > 0 ? (scrollY / maxScroll) * 2 - 1 : 0;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [prefersReducedMotion]);

  // ---------------------------------------------------------------------------
  // 5. Active Configuration Computation
  // ---------------------------------------------------------------------------
  const activeConfig: ShaderGradientConfig = useMemo(() => {
    const base =
      activePresetKey === 'presetB'
        ? SHADER_PRESET_B
        : activePresetKey === 'presetC'
          ? SHADER_PRESET_C
          : activePresetKey === 'presetD'
            ? SHADER_PRESET_D
            : SHADER_PRESET_A;

    // Apply reduced motion and suspension flags
    const effectiveAnimate =
      isSuspended || prefersReducedMotion ? 'off' : base.animate;

    // Force enableTransition to false on initial mount, during instant preset swaps, or for reduced motion
    const effectiveEnableTransition =
      isReadyForTransitions && !isPresetSwapping && !prefersReducedMotion;

    return {
      ...base,
      animate: effectiveAnimate,
      enableTransition: effectiveEnableTransition,
      cAzimuthAngle: base.cAzimuthAngle,
      cPolarAngle: base.cPolarAngle,
      // Framing is absolute per panel, unlike yaw, because the commit panel's
      // layout depends on the sphere sitting small and to the right.
      cameraZoom: isFlowBound ? PANEL_FRAMING[flowPanel].cameraZoom : base.cameraZoom,
    };
  }, [
    activePresetKey,
    isSuspended,
    prefersReducedMotion,
    isReadyForTransitions,
    isPresetSwapping,
    isFlowBound,
    flowPanel,
  ]);

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        inset: '0 0 calc(-1 * var(--safe-inset-bottom)) 0',
        pointerEvents: 'none',
        zIndex: -1,
        opacity: isLoaded ? 1 : 0,
        transition: isImmediate
          ? 'none'
          : 'opacity var(--duration-ambient) cubic-bezier(0.25, 0.1, 0.25, 1)',
        overflow: 'hidden',
      }}
      data-flow-panel={isFlowBound ? flowPanel : undefined}
      aria-hidden="true"
    >
      {!hasWebGL && !stillFailed && (
        <img
          className="shader-background-still"
          src={SPHERE_STILL_SRC}
          alt=""
          onError={() => setStillFailed(true)}
        />
      )}

      {isIdle && hasWebGL && (
        <ShaderGradientCanvas
          style={{
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          pixelDensity={DEFAULT_CANVAS_OPTIONS.pixelDensity}
          fov={DEFAULT_CANVAS_OPTIONS.fov}
          pointerEvents="none"
          lazyLoad={DEFAULT_CANVAS_OPTIONS.lazyLoad}
          powerPreference={DEFAULT_CANVAS_OPTIONS.powerPreference}
        >
          <WebGLParallaxRig
            mouseRef={mouseTargetRef}
            scrollRef={scrollTargetRef}
            flowRotationRef={flowRotationRef}
            isSuspended={isSuspended}
            prefersReducedMotion={prefersReducedMotion}
          />
          <ShaderGradient
            type={activeConfig.type}
            animate={activeConfig.animate}
            uTime={activeConfig.uTime}
            uSpeed={activeConfig.uSpeed}
            uStrength={activeConfig.uStrength}
            uDensity={activeConfig.uDensity}
            uFrequency={activeConfig.uFrequency}
            uAmplitude={activeConfig.uAmplitude}
            color1={activeConfig.color1}
            color2={activeConfig.color2}
            color3={activeConfig.color3}
            reflection={activeConfig.reflection}
            wireframe={activeConfig.wireframe}
            shader={activeConfig.shader}
            positionX={activeConfig.positionX}
            positionY={activeConfig.positionY}
            positionZ={activeConfig.positionZ}
            rotationX={activeConfig.rotationX}
            rotationY={activeConfig.rotationY}
            rotationZ={activeConfig.rotationZ}
            cAzimuthAngle={activeConfig.cAzimuthAngle}
            cPolarAngle={activeConfig.cPolarAngle}
            cDistance={activeConfig.cDistance}
            cameraZoom={activeConfig.cameraZoom}
            lightType={activeConfig.lightType}
            brightness={activeConfig.brightness}
            envPreset={activeConfig.envPreset}
            grain={activeConfig.grain}
            grainBlending={activeConfig.grainBlending}
            range={activeConfig.range}
            rangeStart={activeConfig.rangeStart}
            rangeEnd={activeConfig.rangeEnd}
            loop={activeConfig.loop}
            loopDuration={activeConfig.loopDuration}
            control={activeConfig.control}
            urlString={activeConfig.urlString}
            enableTransition={activeConfig.enableTransition}
            smoothTime={activeConfig.smoothTime}
            enableCameraUpdate={activeConfig.enableCameraUpdate}
            toggleAxis={activeConfig.toggleAxis}
            zoomOut={activeConfig.zoomOut}
            hoverState={activeConfig.hoverState}
            rotSpringOption={activeConfig.rotSpringOption}
            posSpringOption={activeConfig.posSpringOption}
          />
        </ShaderGradientCanvas>
      )}
    </div>
  );
}
