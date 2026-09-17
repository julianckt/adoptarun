import { useState, useEffect, useRef, useMemo } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import { useFrame } from '@react-three/fiber';
import {
  SHADER_PRESET_A,
  SHADER_PRESET_B,
  DEFAULT_CANVAS_OPTIONS,
  type ShaderGradientConfig,
} from './shaderConfig';

interface ParallaxRigProps {
  mouseRef: React.RefObject<{ x: number; y: number }>;
  scrollRef: React.RefObject<number>;
  isSuspended: boolean;
  prefersReducedMotion: boolean;
}

function WebGLParallaxRig({ mouseRef, scrollRef, isSuspended, prefersReducedMotion }: ParallaxRigProps) {
  useFrame(({ scene }) => {
    if (isSuspended || prefersReducedMotion) return;
    const targetRotY = (mouseRef.current?.x ?? 0) * 0.12 + (scrollRef.current ?? 0) * 0.04;
    const targetRotX = (mouseRef.current?.y ?? 0) * 0.06;
    scene.rotation.y += (targetRotY - scene.rotation.y) * 0.05;
    scene.rotation.x += (targetRotX - scene.rotation.x) * 0.05;
  });
  return null;
}

export interface ShaderBackgroundProps {
  /**
   * Optional manual preset override ('presetA' | 'presetB').
   * If omitted, dynamically managed by scroll/IntersectionObserver.
   */
  forcedPreset?: 'presetA' | 'presetB';
  /**
   * Optional custom className for outer wrapper.
   */
  className?: string;
}

export default function ShaderBackground({
  forcedPreset,
  className,
}: ShaderBackgroundProps) {
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [activePresetKey, setActivePresetKey] = useState<'presetA' | 'presetB'>(
    forcedPreset ?? 'presetA'
  );
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isReadyForTransitions, setIsReadyForTransitions] = useState<boolean>(false);
  const [isPresetSwapping, setIsPresetSwapping] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollTargetRef = useRef<number>(0);
  const prevPresetRef = useRef<'presetA' | 'presetB'>(activePresetKey);

  // ---------------------------------------------------------------------------
  // 0. Idle mount deferral (timeout: 800ms)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
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
    // Reveal canvas and enable native damping only after initial mount snap
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setIsReadyForTransitions(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

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

    const observedElements: { element: Element; preset: 'presetA' | 'presetB'; isIntersecting: boolean }[] = [];

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
    const base = activePresetKey === 'presetB' ? SHADER_PRESET_B : SHADER_PRESET_A;

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
    };
  }, [
    activePresetKey,
    isSuspended,
    prefersReducedMotion,
    isReadyForTransitions,
    isPresetSwapping,
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
        transition: 'opacity var(--duration-ambient) cubic-bezier(0.25, 0.1, 0.25, 1)',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      {isIdle && (
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
