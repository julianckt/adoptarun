/**
 * Adopt a Run - ShaderGradient Configuration Module
 *
 * Exposes all configurable variables supported by @shadergradient/react and Three.js canvas.
 * Every option includes inline JSDoc comments detailing accepted values, behavior,
 * and mode applicability so that any property can be tweaked individually.
 */

export type ShaderMeshType = 'waterPlane' | 'plane' | 'sphere';
export type ShaderAnimateToggle = 'on' | 'off';
export type ShaderGrainToggle = 'on' | 'off';
export type ShaderLightType = '3d' | 'env';
export type ShaderEnvPreset = 'city' | 'dawn' | 'lobby';

/**
 * Full configuration interface encompassing every single parameter supported
 * by @shadergradient/react (v2.4.x).
 */
export interface ShaderGradientConfig {
  // ---------------------------------------------------------------------------
  // 1. GEOMETRY & SHAPE
  // ---------------------------------------------------------------------------
  /**
   * 3D Geometry mesh type:
   * - 'waterPlane': Liquid, undulating ocean-like surface wave plane.
   * - 'plane': Deformed surface plane with noise elevation.
   * - 'sphere': 3D floating orb / ball mesh.
   */
  type: ShaderMeshType;

  /**
   * Wireframe overlay mode:
   * - false: Solid shaded 3D surface (standard).
   * - true: Skeletal wireframe mesh lines.
   */
  wireframe: boolean;

  /**
   * Shader algorithm preset:
   * - 'defaults': Standard simplex noise deformation algorithm.
   */
  shader: string;

  // ---------------------------------------------------------------------------
  // 2. ANIMATION & WAVE DYNAMICS
  // ---------------------------------------------------------------------------
  /**
   * Master animation loop toggle:
   * - 'on': Continuously render moving waves / turbulence.
   * - 'off': Pause animation (used for reduced motion or when suspended).
   */
  animate: ShaderAnimateToggle;

  /**
   * Starting time offset / seed phase for noise generation.
   * Typical range: 0.0 - 100.0.
   */
  uTime: number;

  /**
   * Animation speed multiplier:
   * - 0.0: Frozen in place.
   * - 0.1 - 0.2: Calm, subtle ambient drift (recommended for backgrounds).
   * - 0.4 - 0.6: Energetic, rapid wave motion.
   */
  uSpeed: number;

  /**
   * Wave distortion / turbulence strength:
   * - Controls the depth and dramatic cresting of peaks and valleys.
   * - Typical range: 0.0 to 5.0 (e.g. 1.5 - 3.5).
   */
  uStrength: number;

  /**
   * Wave density / spatial frequency across the surface:
   * - Lower values (0.5 - 1.0) produce broad, sweeping swells.
   * - Higher values (1.5 - 3.0) produce tight, dense ripples.
   */
  uDensity: number;

  /**
   * Secondary noise frequency:
   * - Fine-tunes the micro-detail of the surface texture.
   * - Typical range: 0.0 to 10.0 (default 5.5).
   */
  uFrequency: number;

  /**
   * Wave crest displacement amplitude:
   * - In 'sphere' and 'plane', controls bump protrusion height.
   * - In 'waterPlane', often 0.0 or subtle (0.1 - 1.0).
   */
  uAmplitude: number;

  // ---------------------------------------------------------------------------
  // 3. COLOR PALETTE
  // ---------------------------------------------------------------------------
  /**
   * Primary gradient color (Hex string).
   * Preset A uses Adopt a Run brand `route-orange` (#f5ae66).
   */
  color1: string;

  /**
   * Secondary gradient color (Hex string).
   * Preset A uses Adopt a Run brand `route-coral` (#ff8484).
   */
  color2: string;

  /**
   * Tertiary gradient color (Hex string).
   * Preset A uses Adopt a Run brand `canvas-black` / dusk charcoal (#181311)
   * to guarantee deep background contrast behind white hero text.
   */
  color3: string;

  /**
   * Surface specularity / reflectivity:
   * - 0.0: Completely matte.
   * - 0.1 - 0.3: Subtle satin sheen (recommended).
   * - 1.0: Glossy mirror-like highlights.
   */
  reflection: number;

  // ---------------------------------------------------------------------------
  // 4. POSITION & 3D ROTATION
  // ---------------------------------------------------------------------------
  /**
   * X coordinate in 3D world space.
   * Negative shifts left, positive shifts right.
   */
  positionX: number;

  /**
   * Y coordinate in 3D world space.
   * For 'waterPlane', negative values (-1.5 to -2.5) place the horizon
   * naturally across the middle/lower half of the viewport.
   */
  positionY: number;

  /**
   * Z coordinate in 3D world space (depth relative to camera).
   */
  positionZ: number;

  /**
   * Mesh rotation around X axis (pitch) in degrees (0 - 360).
   */
  rotationX: number;

  /**
   * Mesh rotation around Y axis (yaw) in degrees (0 - 360).
   */
  rotationY: number;

  /**
   * Mesh rotation around Z axis (roll / flow direction) in degrees (0 - 360).
   */
  rotationZ: number;

  // ---------------------------------------------------------------------------
  // 5. CAMERA & VIEW
  // ---------------------------------------------------------------------------
  /**
   * Camera azimuth angle (horizontal orbit around center) in degrees (0 - 360).
   */
  cAzimuthAngle: number;

  /**
   * Camera polar angle (vertical elevation angle) in degrees:
   * - 0: Looking straight down from above (bird's eye).
   * - 90: Looking straight at the horizon.
   * - 95 - 105: Low-angle perspective looking slightly upward.
   */
  cPolarAngle: number;

  /**
   * Camera distance from mesh origin:
   * - Smaller values bring camera closer (more immersive / zoomed in).
   * - Larger values zoom out to see mesh edges.
   */
  cDistance: number;

  /**
   * Camera zoom multiplier (default 1.0).
   */
  cameraZoom: number;

  // ---------------------------------------------------------------------------
  // 6. LIGHTING & ENVIRONMENT
  // ---------------------------------------------------------------------------
  /**
   * Scene lighting engine:
   * - '3d': Three-point directional & ambient lighting.
   * - 'env': Image-based HDRI environment lighting.
   */
  lightType: ShaderLightType;

  /**
   * Scene exposure / brightness multiplier (default 1.0 - 1.5).
   */
  brightness: number;

  /**
   * HDRI environment preset:
   * - 'city': Cool urban reflections.
   * - 'dawn': Warm sunrise ambient tones.
   * - 'lobby': Balanced neutral architectural lighting.
   */
  envPreset: ShaderEnvPreset;

  // ---------------------------------------------------------------------------
  // 7. GRAIN & POST-PROCESSING
  // ---------------------------------------------------------------------------
  /**
   * Film grain texture overlay:
   * - 'on': Adds subtle analog film grain (reduces 8-bit color banding).
   * - 'off': Smooth digital gradient.
   */
  grain: ShaderGrainToggle;

  /**
   * Film grain blending opacity multiplier (0.0 to 1.0).
   */
  grainBlending?: number;

  // ---------------------------------------------------------------------------
  // 8. RANGE & LOOPING (Used in timeline/render exports)
  // ---------------------------------------------------------------------------
  /**
   * Range bounding mode:
   * - 'disabled': Continuous infinite runtime.
   * - 'enabled': Bounded frame window.
   */
  range: 'disabled' | 'enabled' | string;

  /**
   * Start frame/time when range is enabled.
   */
  rangeStart: number;

  /**
   * End frame/time when range is enabled.
   */
  rangeEnd: number;

  /**
   * Loop toggle for periodic wave cycles:
   * - 'on' | 'off'.
   */
  loop?: 'on' | 'off';

  /**
   * Loop duration in seconds.
   */
  loopDuration?: number;

  // ---------------------------------------------------------------------------
  // 9. ADVANCED & STATE CONTROLS
  // ---------------------------------------------------------------------------
  /**
   * Parameter driver mode:
   * - 'props': Explicitly passed React props (default).
   * - 'query': Parses parameters from `urlString`.
   */
  control: 'props' | 'query';

  /**
   * Optional URL string exported directly from https://shadergradient.co/
   * (e.g. "https://shadergradient.co/customize?animate=on&color1=...").
   * When set and `control` is 'query', this will drive the shader.
   */
  urlString?: string;

  /**
   * Smooth physics interpolation duration in seconds when updating props.
   */
  smoothTime?: number;

  /**
   * Enable spring physics transitions between prop updates.
   */
  enableTransition?: boolean;

  /**
   * Allow dynamic camera position updates.
   */
  enableCameraUpdate?: boolean;

  /**
   * Toggle 3D XYZ coordinate debug axes.
   */
  toggleAxis?: boolean;

  /**
   * Quick zoom-out toggle.
   */
  zoomOut?: boolean;

  /**
   * Hover state identifier.
   */
  hoverState?: string;

  /**
   * Custom spring physics options for rotation morphing.
   */
  rotSpringOption?: any;

  /**
   * Custom spring physics options for position morphing.
   */
  posSpringOption?: any;
}

// =============================================================================
// PRESET A: HERO & BOTTOM CTA
// Signature Adopt a Run sunset palette (route-orange, route-coral, canvas-black)
// Flowing liquid waterPlane horizon with calm ambient speed.
// =============================================================================
export const SHADER_PRESET_A: ShaderGradientConfig = {
  // 1. Geometry
  type: 'sphere',
  wireframe: false,
  shader: 'defaults',

  // 2. Animation & Waves
  animate: 'on',
  uTime: 0.2,
  uSpeed: 0.1,          // Gentle, calm wave motion
  uStrength: 0.3,        // Pronounced liquid folds
  uDensity: 0.8,         // Balanced wave frequency
  uFrequency: 5.5,
  uAmplitude: 3.2,       // Organic spiral distortion for 3D sphere

  // 3. Colors (Adopt a Run Brand Tokens)
  color1: '#73bfc4',     // var(--color-route-orange)
  color2: '#ff810a',     // var(--color-route-coral)
  color3: '#8da0ce',     // var(--color-canvas-black) / deep dusk base
  reflection: 0.4,

  // 4. Position & Rotation
  positionX: 0,
  positionY: 0,       // Centers the sphere in the viewport
  positionZ: 0,
  rotationX: 0,
  rotationY: 130,
  rotationZ: 70,        // Diagonal flow matching the wordmark typography angle

  // 5. Camera & View
  cAzimuthAngle: 270,
  cPolarAngle: 180,       // Slight upward look for dramatic scale
  cDistance: 0.54,
  cameraZoom: 15.0,

  // 6. Lighting & Environment
  lightType: 'env',
  brightness: 0.8,
  envPreset: 'city',

  // 7. Grain
  grain: 'on',           // Adds subtle texture, eliminating digital banding
  grainBlending: 0.5,

  // 8. Range & Looping
  range: 'disabled',
  rangeStart: 0,
  rangeEnd: 40,
  loop: 'on',
  loopDuration: 0,

  // 9. Advanced Controls
  control: 'props',
  enableTransition: true,
  smoothTime: 0.3,
  enableCameraUpdate: true,
  toggleAxis: false,
  zoomOut: false,
};

// =============================================================================
// PRESET B: ROUTES FEATURE SECTION
// Nocturnal blush palette with deeper coral, blush, and night sky tones.
// Ready for the middle section curtain reveal.
// =============================================================================
export const SHADER_PRESET_B: ShaderGradientConfig = {
  // 1. Geometry
  type: 'waterPlane',
  wireframe: false,
  shader: 'defaults',

  // 2. Animation & Waves
  animate: 'on',
  uTime: 0.5,
  uSpeed: 0.22,
  uStrength: 3.2,
  uDensity: 1.8,
  uFrequency: 5.5,
  uAmplitude: 0.0,

  // 3. Colors (Light Brand-Derived Palette)
  color1: '#ffd1b3',     // Peach
  color2: '#f2d6dc',     // Pale blush
  color3: '#e8e3f5',     // Soft lavender
  reflection: 0.18,

  // 4. Position & Rotation
  positionX: 0.2,
  positionY: -1.9,
  positionZ: 0,
  rotationX: 10,
  rotationY: 5,
  rotationZ: 200,

  // 5. Camera & View
  cAzimuthAngle: 160,
  cPolarAngle: 90,
  cDistance: 2.8,
  cameraZoom: 1.0,

  // 6. Lighting & Environment
  lightType: '3d',
  brightness: 1.05,
  envPreset: 'dawn',

  // 7. Grain
  grain: 'on',
  grainBlending: 0.5,

  // 8. Range & Looping
  range: 'disabled',
  rangeStart: 0,
  rangeEnd: 40,
  loop: 'on',
  loopDuration: 0,

  // 9. Advanced Controls
  control: 'props',
  enableTransition: true,
  smoothTime: 0.3,
  enableCameraUpdate: true,
  toggleAxis: false,
  zoomOut: false,
};

/**
 * Canvas environment options passed to ShaderGradientCanvas.
 */
export interface ShaderCanvasOptions {
  pixelDensity: number;
  fov: number;
  pointerEvents: 'none' | 'auto';
  lazyLoad: boolean;
  powerPreference: WebGLPowerPreference;
}

export const DEFAULT_CANVAS_OPTIONS: ShaderCanvasOptions = {
  pixelDensity: 1,          // Crisp rendering without 4K GPU overkill
  fov: 45,
  pointerEvents: 'none',      // Never intercept user clicks or gestures
  lazyLoad: false,
  powerPreference: 'low-power',
};
