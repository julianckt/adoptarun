import React, { useState } from 'react'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import HeroOverlay from './HeroOverlay'
import ControlsPanel, { DEFAULT_CONFIG } from './ControlsPanel'

export default function ShaderStudio() {
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [heroOpacity, setHeroOpacity] = useState(1.0)

  return (
    <div 
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        backgroundColor: '#050508',
        color: '#ffffff',
        overflow: 'hidden',
        fontFamily: 'JetBrains Mono, monospace'
      }}
    >
      {/* Background 3D Shader Canvas (Fixed at zIndex 0, pointerEvents none) */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      >
        <ShaderGradientCanvas 
          pointerEvents="none"
          style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}
        >
          <ShaderGradient
            control="props"
            type={config.type}
            color1={config.color1}
            color2={config.color2}
            color3={config.color3}
            animate={config.animate}
            uSpeed={config.uSpeed}
            uStrength={config.uStrength}
            uDensity={config.uDensity}
            uFrequency={config.uFrequency}
            uAmplitude={config.uAmplitude}
            grain={config.grain}
            lightType={config.lightType}
            brightness={config.brightness}
            reflection={config.reflection}
            wireframe={config.wireframe}
            cAzimuthAngle={config.cAzimuthAngle}
            cPolarAngle={config.cPolarAngle}
            cDistance={config.cDistance}
            cameraZoom={config.cameraZoom}
          />
        </ShaderGradientCanvas>
      </div>

      {/* Floating Status Tag (Top Left - zIndex 9999) */}
      <div 
        style={{
          position: 'fixed',
          top: '20px',
          left: '20px',
          zIndex: 9999,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          fontSize: '11px',
          fontFamily: 'monospace'
        }}
      >
        <div 
          style={{
            background: 'rgba(0,0,0,0.85)',
            border: '1px solid #ccff00',
            color: '#ccff00',
            padding: '6px 12px',
            borderRadius: '6px',
            fontWeight: 'bold',
            letterSpacing: '1px',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
          }}
        >
          VARIANT A &bull; SHADER LAB
        </div>
        <div 
          style={{
            background: 'rgba(0,0,0,0.75)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#dddddd',
            padding: '4px 10px',
            borderRadius: '6px',
            backdropFilter: 'blur(8px)'
          }}
        >
          TYPE: <strong style={{ color: '#fff' }}>{config.type}</strong> | SPEED: <strong style={{ color: '#fff' }}>{config.uSpeed}</strong>
        </div>
      </div>

      {/* Hero UI Overlay Layer (zIndex 10) */}
      <HeroOverlay opacity={heroOpacity} />

      {/* Live Controls Panel (zIndex 99999) */}
      <ControlsPanel
        config={config}
        setConfig={setConfig}
        heroOpacity={heroOpacity}
        setHeroOpacity={setHeroOpacity}
      />
    </div>
  )
}
