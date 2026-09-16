import { useState, useEffect, useRef, useMemo } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import {
  SHADER_PRESET_A,
  SHADER_PRESET_B,
  DEFAULT_CANVAS_OPTIONS,
  type ShaderGradientConfig,
} from './shaderConfig';

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
  const [activePresetKey, setActivePresetKey] = useState<'presetA' | 'presetB'>(
    forcedPreset ?? 'presetA'
  );
  const [isSuspended, setIsSuspended] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isReadyForTransitions, setIsReadyForTransitions] = useState<boolean>(false);
  const [isPresetSwapping, setIsPresetSwapping] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Target tilt offsets driven by cursor & scroll momentum
  const [cameraTilt, setCameraTilt] = useState<{ azimuth: number; polar: number }>({
    azimuth: 0,
    polar: 0,
  });

  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollTargetRef = useRef<number>(0);
  const scrollVelocityRef = useRef<number>(0);
  const lastScrollYRef = useRef<number>(0);
  const lastScrollTimeRef = useRef<number>(0);
  const prevPresetRef = useRef<'presetA' | 'presetB'>(activePresetKey);

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

    // 1. Initial scan on React mount
    attachAvailableElements();

    // 2. If any element hasn't streamed or loaded into the DOM yet, observe mutations
    let mutationObserver: MutationObserver | null = null;
    if (observedElements.length < sectionSelectors.length) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachAvailableElements, { once: true });
      }

      if (typeof MutationObserver !== 'undefined') {
        mutationObserver = new MutationObserver(() => {
          attachAvailableElements();
          if (observedElements.length >= sectionSelectors.length) {
            mutationObserver?.disconnect();
            mutationObserver = null;
          }
        });

        const rootTarget = document.body || document.documentElement;
        if (rootTarget) {
          mutationObserver.observe(rootTarget, {
            childList: true,
            subtree: true,
          });
        }
      }
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', attachAvailableElements);
      mutationObserver?.disconnect();
      observer.disconnect();
    };
  }, [forcedPreset]);

  // ---------------------------------------------------------------------------
  // 4. Subtle Cursor & Scroll Momentum Parallax (Native Damping, 0 Idle Renders)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (prefersReducedMotion) return;

    let updateScheduled = false;
    let scrollEndTimer: ReturnType<typeof setTimeout> | null = null;

    const scheduleUpdate = () => {
      if (updateScheduled) return;
      updateScheduled = true;
      requestAnimationFrame(() => {
        updateScheduled = false;
        if (isSuspended || prefersReducedMotion) return;

        // Max tilt range: +/- 8 deg azimuth, +/- 4 deg polar + scroll momentum
        const targetAzimuth =
          mouseTargetRef.current.x * 8 +
          scrollTargetRef.current * 3 +
          scrollVelocityRef.current;
        const targetPolar = mouseTargetRef.current.y * 4;

        setCameraTilt({
          azimuth: targetAzimuth,
          polar: targetPolar,
        });
      });
    };

    const handlePointerMove = (e: PointerEvent) => {
      // Ignore touch events to preserve native touch scrolling
      if (e.pointerType === 'touch') return;

      const normX = (e.clientX / window.innerWidth) * 2 - 1; // -1 to 1
      const normY = (e.clientY / window.innerHeight) * 2 - 1; // -1 to 1

      mouseTargetRef.current = { x: normX, y: normY };
      scheduleUpdate();
    };

    const handleScroll = () => {
      const now = performance.now();
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset;
      const deltaY = scrollY - lastScrollYRef.current;
      const deltaTime = Math.max(1, now - lastScrollTimeRef.current);

      // Instantaneous scroll momentum (clamped to +/- 6 degrees)
      scrollVelocityRef.current = Math.min(Math.max((deltaY / deltaTime) * 5, -6), 6);
      lastScrollYRef.current = scrollY;
      lastScrollTimeRef.current = now;
      scrollTargetRef.current = maxScroll > 0 ? (scrollY / maxScroll) * 2 - 1 : 0;

      scheduleUpdate();

      // Coast momentum to rest shortly after scrolling stops
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        scrollVelocityRef.current = 0;
        scheduleUpdate();
      }, 120);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (scrollEndTimer) clearTimeout(scrollEndTimer);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isSuspended, prefersReducedMotion]);

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
      // Apply subtle tilt shifts to camera angles
      cAzimuthAngle: base.cAzimuthAngle + cameraTilt.azimuth,
      cPolarAngle: base.cPolarAngle + cameraTilt.polar,
    };
  }, [
    activePresetKey,
    isSuspended,
    prefersReducedMotion,
    cameraTilt,
    isReadyForTransitions,
    isPresetSwapping,
  ]);

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 'calc(-1 * var(--safe-inset-bottom))',
        width: '100vw',
        height: '100lvh',
        minHeight: '100vh',
        pointerEvents: 'none',
        zIndex: -1,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity var(--duration-ambient) cubic-bezier(0.25, 0.1, 0.25, 1)',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
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
    </div>
  );
}
