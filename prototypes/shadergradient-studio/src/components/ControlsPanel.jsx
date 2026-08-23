import React, { useState } from 'react'

export const DEFAULT_CONFIG = {
  type: 'waterPlane',
  color1: '#ccff00',
  color2: '#00f0ff',
  color3: '#ff5500',
  animate: 'on',
  uSpeed: 0.4,
  uStrength: 2.5,
  uDensity: 1.2,
  uFrequency: 2.0,
  uAmplitude: 1.0,
  grain: 'on',
  lightType: '3d',
  brightness: 1.2,
  reflection: 0.4,
  wireframe: false,
  cAzimuthAngle: 180,
  cPolarAngle: 120,
  cDistance: 3.5,
  cameraZoom: 1.0,
  rotationX: 0,
  rotationY: 0,
  rotationZ: 0,
  envPreset: 'city'
}

export const PRESETS = [
  {
    name: 'Electric Volt',
    config: {
      type: 'waterPlane',
      color1: '#ccff00',
      color2: '#00f0ff',
      color3: '#ff5500',
      animate: 'on',
      uSpeed: 0.4,
      uStrength: 2.5,
      uDensity: 1.2,
      uFrequency: 2.0,
      uAmplitude: 1.0,
      grain: 'on',
      lightType: '3d',
      brightness: 1.2,
      reflection: 0.4,
      wireframe: false,
      cAzimuthAngle: 180,
      cPolarAngle: 120,
      cDistance: 3.5,
      cameraZoom: 1.0
    }
  },
  {
    name: 'Liquid Cyber',
    config: {
      type: 'sphere',
      color1: '#ff0055',
      color2: '#00ffff',
      color3: '#7000ff',
      animate: 'on',
      uSpeed: 0.8,
      uStrength: 4.0,
      uDensity: 2.0,
      uFrequency: 3.0,
      uAmplitude: 2.0,
      grain: 'on',
      lightType: '3d',
      brightness: 1.5,
      reflection: 0.8,
      wireframe: false,
      cAzimuthAngle: 210,
      cPolarAngle: 90,
      cDistance: 2.8,
      cameraZoom: 1.2
    }
  },
  {
    name: 'Golden Hour',
    config: {
      type: 'plane',
      color1: '#ff4500',
      color2: '#ffb700',
      color3: '#6a00ff',
      animate: 'on',
      uSpeed: 0.3,
      uStrength: 1.5,
      uDensity: 1.0,
      uFrequency: 1.5,
      uAmplitude: 0.8,
      grain: 'on',
      lightType: 'env',
      envPreset: 'dawn',
      brightness: 1.1,
      reflection: 0.5,
      wireframe: false,
      cAzimuthAngle: 160,
      cPolarAngle: 140,
      cDistance: 4.0,
      cameraZoom: 1.0
    }
  },
  {
    name: 'Matrix Wireframe',
    config: {
      type: 'waterPlane',
      color1: '#00ff66',
      color2: '#003311',
      color3: '#ccff00',
      animate: 'on',
      uSpeed: 0.5,
      uStrength: 3.0,
      uDensity: 2.5,
      uFrequency: 2.5,
      uAmplitude: 1.5,
      grain: 'off',
      lightType: '3d',
      brightness: 1.4,
      reflection: 0.2,
      wireframe: true,
      cAzimuthAngle: 180,
      cPolarAngle: 100,
      cDistance: 3.0,
      cameraZoom: 1.0
    }
  }
]

export default function ControlsPanel({ config, setConfig, heroOpacity, setHeroOpacity }) {
  const [isOpen, setIsOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('geometry')
  const [copied, setCopied] = useState(false)

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  const generateJsxCode = () => {
    return `<ShaderGradientCanvas style={{ position: 'absolute', inset: 0 }}>
  <ShaderGradient
    control="props"
    type="${config.type}"
    color1="${config.color1}"
    color2="${config.color2}"
    color3="${config.color3}"
    animate="${config.animate}"
    uSpeed={${config.uSpeed}}
    uStrength={${config.uStrength}}
    uDensity={${config.uDensity}}
    uFrequency={${config.uFrequency}}
    uAmplitude={${config.uAmplitude}}
    grain="${config.grain}"
    lightType="${config.lightType}"
    brightness={${config.brightness}}
    reflection={${config.reflection}}
    wireframe={${config.wireframe}}
    cAzimuthAngle={${config.cAzimuthAngle}}
    cPolarAngle={${config.cPolarAngle}}
    cDistance={${config.cDistance}}
    cameraZoom={${config.cameraZoom}}
  />
</ShaderGradientCanvas>`
  }

  const copyCode = () => {
    navigator.clipboard.writeText(generateJsxCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)} 
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          background: '#000000',
          border: '2px solid #ccff00',
          color: '#ccff00',
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 'bold',
          padding: '10px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 0 20px rgba(204,255,0,0.4)',
          pointerEvents: 'auto'
        }}
      >
        &#9881; SHADER CONTROLS
      </button>
    )
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 99999,
        width: '380px',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10, 10, 15, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.25)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95)',
        borderRadius: '12px',
        overflow: 'hidden',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#e0e0e0',
        pointerEvents: 'auto',
        backdropFilter: 'blur(16px)'
      }}
    >
      {/* Panel Header */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#000000',
          borderBottom: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '12px 16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ccff00' }}></span>
          <span style={{ fontWeight: 'bold', color: '#ffffff', letterSpacing: '1px' }}>SHADER CONTROLS</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={copyCode} 
            style={{
              padding: '4px 10px',
              background: '#ccff00',
              color: '#000000',
              fontWeight: 'bold',
              fontSize: '10px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {copied ? 'COPIED!' : 'COPY CODE'}
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            style={{
              background: 'transparent',
              border: 'none',
              color: '#aaaaaa',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0 4px'
            }}
          >
            &#215;
          </button>
        </div>
      </div>

      {/* Preset Selector */}
      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '10px', color: '#ccff00', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '6px' }}>
          Presets
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setConfig(p.config)}
              style={{
                fontSize: '10px',
                textAlign: 'left',
                padding: '6px 8px',
                background: 'rgba(0,0,0,0.8)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#ffffff',
                borderRadius: '4px',
                cursor: 'pointer',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis'
              }}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Control Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.6)' }}>
        {['geometry', 'colors', 'motion', 'camera'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              flex: 1,
              padding: '10px 0',
              textAlign: 'center',
              background: activeTab === tab ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === tab ? '#ccff00' : '#888888',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #ccff00' : 'none',
              fontWeight: 'bold',
              fontSize: '10px',
              textTransform: 'uppercase',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Scrollable Control Inputs */}
      <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Tab 1: GEOMETRY */}
        {activeTab === 'geometry' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: '#aaaaaa', marginBottom: '4px' }}>
                Geometry Type (`type`)
              </label>
              <select
                value={config.type}
                onChange={(e) => handleChange('type', e.target.value)}
                style={{
                  width: '100%',
                  background: '#000000',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '8px',
                  borderRadius: '4px',
                  color: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="waterPlane">waterPlane</option>
                <option value="plane">plane</option>
                <option value="sphere">sphere</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
              <label>Wireframe Mode (`wireframe`)</label>
              <input
                type="checkbox"
                checked={config.wireframe}
                onChange={(e) => handleChange('wireframe', e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#ccff00' }}
              />
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#aaaaaa' }}>Strength (`uStrength`)</span>
                <span style={{ color: '#ccff00', fontWeight: 'bold' }}>{config.uStrength}</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.1"
                value={config.uStrength}
                onChange={(e) => handleChange('uStrength', parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#ccff00' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#aaaaaa' }}>Density (`uDensity`)</span>
                <span style={{ color: '#ccff00', fontWeight: 'bold' }}>{config.uDensity}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={config.uDensity}
                onChange={(e) => handleChange('uDensity', parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#ccff00' }}
              />
            </div>
          </>
        )}

        {/* Tab 2: COLORS */}
        {activeTab === 'colors' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#aaaaaa', marginBottom: '4px' }}>Color 1</label>
                <input
                  type="color"
                  value={config.color1}
                  onChange={(e) => handleChange('color1', e.target.value)}
                  style={{ width: '100%', height: '36px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', cursor: 'pointer' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#aaaaaa', marginBottom: '4px' }}>Color 2</label>
                <input
                  type="color"
                  value={config.color2}
                  onChange={(e) => handleChange('color2', e.target.value)}
                  style={{ width: '100%', height: '36px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', cursor: 'pointer' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '10px', color: '#aaaaaa', marginBottom: '4px' }}>Color 3</label>
                <input
                  type="color"
                  value={config.color3}
                  onChange={(e) => handleChange('color3', e.target.value)}
                  style={{ width: '100%', height: '36px', background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '4px', cursor: 'pointer' }}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
              <label style={{ display: 'block', fontSize: '10px', color: '#aaaaaa', marginBottom: '4px' }}>Grain Effect (`grain`)</label>
              <select
                value={config.grain}
                onChange={(e) => handleChange('grain', e.target.value)}
                style={{
                  width: '100%',
                  background: '#000000',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '8px',
                  borderRadius: '4px',
                  color: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="on">on</option>
                <option value="off">off</option>
              </select>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#aaaaaa' }}>Brightness (`brightness`)</span>
                <span style={{ color: '#ccff00', fontWeight: 'bold' }}>{config.brightness}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.1"
                value={config.brightness}
                onChange={(e) => handleChange('brightness', parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#ccff00' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#aaaaaa' }}>Reflection (`reflection`)</span>
                <span style={{ color: '#ccff00', fontWeight: 'bold' }}>{config.reflection}</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={config.reflection}
                onChange={(e) => handleChange('reflection', parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#ccff00' }}
              />
            </div>
          </>
        )}

        {/* Tab 3: MOTION */}
        {activeTab === 'motion' && (
          <>
            <div>
              <label style={{ display: 'block', fontSize: '10px', color: '#aaaaaa', marginBottom: '4px' }}>Animate (`animate`)</label>
              <select
                value={config.animate}
                onChange={(e) => handleChange('animate', e.target.value)}
                style={{
                  width: '100%',
                  background: '#000000',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '8px',
                  borderRadius: '4px',
                  color: '#ffffff',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="on">on</option>
                <option value="off">off</option>
              </select>
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#aaaaaa' }}>Speed (`uSpeed`)</span>
                <span style={{ color: '#ccff00', fontWeight: 'bold' }}>{config.uSpeed}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.05"
                value={config.uSpeed}
                onChange={(e) => handleChange('uSpeed', parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#ccff00' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#aaaaaa' }}>Frequency (`uFrequency`)</span>
                <span style={{ color: '#ccff00', fontWeight: 'bold' }}>{config.uFrequency}</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="5.0"
                step="0.1"
                value={config.uFrequency}
                onChange={(e) => handleChange('uFrequency', parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#ccff00' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#aaaaaa' }}>Amplitude (`uAmplitude`)</span>
                <span style={{ color: '#ccff00', fontWeight: 'bold' }}>{config.uAmplitude}</span>
              </div>
              <input
                type="range"
                min="0"
                max="5.0"
                step="0.1"
                value={config.uAmplitude}
                onChange={(e) => handleChange('uAmplitude', parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#ccff00' }}
              />
            </div>
          </>
        )}

        {/* Tab 4: CAMERA */}
        {activeTab === 'camera' && (
          <>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#aaaaaa' }}>Azimuth Angle (`cAzimuthAngle`)</span>
                <span style={{ color: '#ccff00', fontWeight: 'bold' }}>{config.cAzimuthAngle}&deg;</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={config.cAzimuthAngle}
                onChange={(e) => handleChange('cAzimuthAngle', parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#ccff00' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#aaaaaa' }}>Polar Angle (`cPolarAngle`)</span>
                <span style={{ color: '#ccff00', fontWeight: 'bold' }}>{config.cPolarAngle}&deg;</span>
              </div>
              <input
                type="range"
                min="0"
                max="180"
                step="5"
                value={config.cPolarAngle}
                onChange={(e) => handleChange('cPolarAngle', parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#ccff00' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#aaaaaa' }}>Camera Distance (`cDistance`)</span>
                <span style={{ color: '#ccff00', fontWeight: 'bold' }}>{config.cDistance}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.2"
                value={config.cDistance}
                onChange={(e) => handleChange('cDistance', parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#ccff00' }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#aaaaaa' }}>Camera Zoom (`cameraZoom`)</span>
                <span style={{ color: '#ccff00', fontWeight: 'bold' }}>{config.cameraZoom}</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3.0"
                step="0.1"
                value={config.cameraZoom}
                onChange={(e) => handleChange('cameraZoom', parseFloat(e.target.value))}
                style={{ width: '100%', cursor: 'pointer', accentColor: '#ccff00' }}
              />
            </div>
          </>
        )}

      </div>

      {/* Hero Content Visibility Control */}
      <div style={{ padding: '12px', background: '#000000', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#aaaaaa', marginBottom: '4px' }}>
          <span>Hero Text Opacity</span>
          <span style={{ color: '#ffffff', fontWeight: 'bold' }}>{Math.round(heroOpacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={heroOpacity}
          onChange={(e) => setHeroOpacity(parseFloat(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: '#ccff00' }}
        />
      </div>
    </div>
  )
}
