import React from 'react'

export default function HeroOverlay({ opacity = 1 }) {
  return (
    <div 
      style={{
        position: 'relative',
        zIndex: 1000,
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justify: 'space-between',
        padding: '30px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        opacity: opacity,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      {/* 1. Header Navigation Bar */}
      <header 
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(10, 10, 15, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '12px 20px',
          borderRadius: '10px',
          pointerEvents: 'auto',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'monospace' }}>
          <span style={{ width: '10px', height: '10px', background: '#ccff00', borderRadius: '50%', boxShadow: '0 0 10px #ccff00' }}></span>
          <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#ffffff', letterSpacing: '1px' }}>
            SHADERGRADIENT <span style={{ color: '#ccff00', fontWeight: 'normal' }}>// PROTOTYPE LAB</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'monospace' }}>
          <a
            href="https://github.com/ruucm/shadergradient"
            target="_blank"
            rel="noreferrer"
            style={{
              fontSize: '11px',
              padding: '6px 12px',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ccff00',
              textDecoration: 'none',
              borderRadius: '6px',
              background: 'rgba(0,0,0,0.6)'
            }}
          >
            ruucm/shadergradient &rarr;
          </a>
        </div>
      </header>

      {/* 2. Central Hero Content */}
      <main 
        style={{
          width: '100%',
          maxWidth: '900px',
          margin: 'auto',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto'
        }}
      >
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(0,0,0,0.9)',
            border: '1px solid #ccff00',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '11px',
            color: '#ccff00',
            fontFamily: 'monospace',
            fontWeight: 'bold',
            letterSpacing: '1px',
            marginBottom: '20px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 0 20px rgba(204,255,0,0.3)'
          }}
        >
          REACT 3D SHADER GRADIENT CANVAS
        </div>

        <h1 
          style={{
            fontSize: 'clamp(40px, 8vw, 90px)',
            fontWeight: 900,
            letterSpacing: '-2px',
            color: '#ffffff',
            textTransform: 'uppercase',
            lineHeight: 1,
            marginBottom: '20px',
            textShadow: '0 10px 40px rgba(0,0,0,0.95)'
          }}
        >
          DYNAMIC <span style={{ color: '#ccff00' }}>SHADER</span> MESH
        </h1>

        <p 
          style={{
            maxWidth: '650px',
            fontSize: '14px',
            color: '#eeeeee',
            background: 'rgba(10, 10, 15, 0.85)',
            padding: '16px 24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(16px)',
            fontFamily: 'monospace',
            lineHeight: 1.6,
            boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
          }}
        >
          Explore real-time WebGL shader gradients with live controls for geometry, colors, motion noise, lighting, and camera positioning.
        </p>
      </main>

      {/* 3. Hero Bottom Info Bar */}
      <footer 
        style={{
          width: '100%',
          maxWidth: '900px',
          margin: '0 auto',
          display: 'flex',
          justifySpaceBetween: 'space-between',
          alignItems: 'center',
          background: 'rgba(10, 10, 15, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '10px 20px',
          borderRadius: '10px',
          fontSize: '11px',
          fontFamily: 'monospace',
          color: '#888888',
          pointerEvents: 'auto',
          backdropFilter: 'blur(16px)'
        }}
      >
        <div>
          <span style={{ color: '#ccff00', fontWeight: 'bold' }}>PROTOTYPE MODE</span>
          <span style={{ margin: '0 8px', color: '#444' }}>|</span>
          <span style={{ color: '#aaa' }}>WebGL 3D Mesh Layer</span>
        </div>
        <div style={{ color: '#cccccc' }}>
          Use control panel (top-right) to tweak parameters live
        </div>
      </footer>
    </div>
  )
}
