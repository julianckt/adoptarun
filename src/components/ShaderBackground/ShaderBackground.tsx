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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  // Tilt offsets smoothly interpolated via lerp
  const [cameraTilt, setCameraTilt] = useState<{ azimuth: number; polar: number }>({
    azimuth: 0,
    polar: 0,
  });

  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const scrollTargetRef = useRef<number>(0);
  const currentTiltRef = useRef<{ azimuth: number; polar: number }>({ azimuth: 0, polar: 0 });
  const rafIdRef = useRef<number | null>(null);

  // ---------------------------------------------------------------------------
  // 1. First-paint fade-in trigger
  // ---------------------------------------------------------------------------
  useEffect(() => {
    // Reveal canvas smoothly after client mount
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
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
  // 3. Observer-Ready Section Seams (Hero, Routes, Bottom CTA)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (forcedPreset) {
      setActivePresetKey(forcedPreset);
      return;
    }

    // Transparent sections that reveal the background shader
    const sectionSelectors = [
      { selector: '.hero-fullscreen', preset: 'presetA' as const },
      { selector: '#routes-featured', preset: 'presetB' as const },
      { selector: '#bottom-cta', preset: 'presetA' as const },
    ];

    const observedElements: { element: Element; preset: 'presetA' | 'presetB' }[] = [];
    sectionSelectors.forEach(({ selector, preset }) => {
      const el = document.querySelector(selector);
      if (el) {
        observedElements.push({ element: el, preset });
      }
    });

    // If no transparent elements are found at all, stay visible on presetA
    if (observedElements.length === 0) {
      return;
    }

    const activeElements = new Map<Element, { preset: 'presetA' | 'presetB'; ratio: number }>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const target = entry.target;
          const match = observedElements.find((item) => item.element === target);
          if (!match) return;

          if (entry.isIntersecting && entry.intersectionRatio > 0) {
            activeElements.set(target, { preset: match.preset, ratio: entry.intersectionRatio });
          } else {
            activeElements.delete(target);
          }
        });

        // Determine active preset & suspension state
        if (activeElements.size === 0) {
          // Opaque curtain sections cover the viewport: suspend rendering to save GPU/battery
          setIsSuspended(true);
        } else {
          setIsSuspended(false);
          // Prioritize section with dominant visibility in viewport
          let dominantPreset: 'presetA' | 'presetB' = 'presetA';
          let highestRatio = -1;
          activeElements.forEach(({ preset, ratio }) => {
            if (ratio > highestRatio) {
              highestRatio = ratio;
              dominantPreset = preset;
            }
          });
          setActivePresetKey(dominantPreset);
        }
      },
      {
        threshold: [0, 0.05, 0.1, 0.25, 0.5],
        rootMargin: '50px 0px 50px 0px',
      }
    );

    observedElements.forEach(({ element }) => observer.observe(element));

    return () => {
      observer.disconnect();
    };
  }, [forcedPreset]);

  // ---------------------------------------------------------------------------
  // 4. Subtle Cursor & Scroll Camera Parallax (Option B, no touch capture)
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

    // Smooth animation loop using lerp
    let running = true;
    const animateLoop = () => {
      if (!running) return;

      if (!isSuspended && !prefersReducedMotion) {
        // Max tilt range: +/- 8 degrees azimuth, +/- 4 degrees polar
        const targetAzimuth = mouseTargetRef.current.x * 8 + scrollTargetRef.current * 4;
        const targetPolar = mouseTargetRef.current.y * 4;

        // Linear interpolation with damping factor 0.05
        currentTiltRef.current.azimuth +=
          (targetAzimuth - currentTiltRef.current.azimuth) * 0.05;
        currentTiltRef.current.polar +=
          (targetPolar - currentTiltRef.current.polar) * 0.05;

        setCameraTilt({
          azimuth: currentTiltRef.current.azimuth,
          polar: currentTiltRef.current.polar,
        });
      }

      rafIdRef.current = requestAnimationFrame(animateLoop);
    };

    rafIdRef.current = requestAnimationFrame(animateLoop);

    return () => {
      running = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
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

    return {
      ...base,
      animate: effectiveAnimate,
      // Apply subtle tilt shifts to camera angles
      cAzimuthAngle: base.cAzimuthAngle + cameraTilt.azimuth,
      cPolarAngle: base.cPolarAngle + cameraTilt.polar,
    };
  }, [activePresetKey, isSuspended, prefersReducedMotion, cameraTilt]);

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: -1,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
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
