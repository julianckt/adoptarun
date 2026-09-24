import { useState, useEffect, useRef } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import {
  SHADER_PRESET_A,
  SHADER_PRESET_B,
  SHADER_PRESET_C,
  SHADER_PRESET_D,
  DEFAULT_CANVAS_OPTIONS,
  type ShaderPresetKey,
} from '@/components/ShaderBackground/shaderConfig';

/**
 * Same fallback still as the homepage ShaderBackground — DESIGN.md's Mesh
 * Noise Splash Rule sanctions it as the system's other primary, not a
 * degraded version of the shader.
 */
const SPHERE_STILL_SRC = '/images/sphere-still.webp';

const PRESETS = {
  presetA: SHADER_PRESET_A,
  presetB: SHADER_PRESET_B,
  presetC: SHADER_PRESET_C,
  presetD: SHADER_PRESET_D,
} as const;

export interface PageHeaderShaderBackgroundProps {
  /** Which shaderConfig preset drives this header's gradient. Never hardcoded here. */
  preset: ShaderPresetKey;
  className?: string;
}

/**
 * A deliberately lighter sibling of homepage ShaderBackground: no cursor/scroll
 * parallax, no signup-flow binding, no idle-mount fade. Boxed to its parent's
 * size (the PageHeader band) rather than the viewport, and the canvas is fully
 * unmounted — not just paused — while scrolled out of view.
 */
export default function PageHeaderShaderBackground({
  preset,
  className,
}: PageHeaderShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [stillFailed, setStillFailed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

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

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0, rootMargin: '50px 0px 50px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const config = PRESETS[preset];

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {!hasWebGL && !stillFailed && (
        <img
          className="page-header-shader-still"
          src={SPHERE_STILL_SRC}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={() => setStillFailed(true)}
        />
      )}

      {isVisible && hasWebGL && (
        <ShaderGradientCanvas
          style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
          pixelDensity={DEFAULT_CANVAS_OPTIONS.pixelDensity}
          fov={DEFAULT_CANVAS_OPTIONS.fov}
          pointerEvents="none"
          lazyLoad={DEFAULT_CANVAS_OPTIONS.lazyLoad}
          powerPreference={DEFAULT_CANVAS_OPTIONS.powerPreference}
        >
          <ShaderGradient
            type={config.type}
            animate={prefersReducedMotion ? 'off' : config.animate}
            uTime={config.uTime}
            uSpeed={config.uSpeed}
            uStrength={config.uStrength}
            uDensity={config.uDensity}
            uFrequency={config.uFrequency}
            uAmplitude={config.uAmplitude}
            color1={config.color1}
            color2={config.color2}
            color3={config.color3}
            reflection={config.reflection}
            wireframe={config.wireframe}
            shader={config.shader}
            positionX={config.positionX}
            positionY={config.positionY}
            positionZ={config.positionZ}
            rotationX={config.rotationX}
            rotationY={config.rotationY}
            rotationZ={config.rotationZ}
            cAzimuthAngle={config.cAzimuthAngle}
            cPolarAngle={config.cPolarAngle}
            cDistance={config.cDistance}
            cameraZoom={config.cameraZoom}
            lightType={config.lightType}
            brightness={config.brightness}
            envPreset={config.envPreset}
            grain={config.grain}
            grainBlending={config.grainBlending}
            range={config.range}
            rangeStart={config.rangeStart}
            rangeEnd={config.rangeEnd}
            loop={config.loop}
            loopDuration={config.loopDuration}
            control={config.control}
            urlString={config.urlString}
            enableTransition={false}
            smoothTime={config.smoothTime}
            enableCameraUpdate={false}
            toggleAxis={config.toggleAxis}
            zoomOut={config.zoomOut}
            hoverState={config.hoverState}
            rotSpringOption={config.rotSpringOption}
            posSpringOption={config.posSpringOption}
          />
        </ShaderGradientCanvas>
      )}
    </div>
  );
}
