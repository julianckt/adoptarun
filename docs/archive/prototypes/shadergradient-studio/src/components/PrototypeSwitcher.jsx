import React, { useEffect } from 'react'

const VARIANTS = [
  { key: 'A', label: 'Live Shader Studio & Lab' },
  { key: 'B', label: 'Preset Theme Gallery' },
  { key: 'C', label: 'Split Config Comparison' }
]

export default function PrototypeSwitcher({ current, onChange }) {
  const currentIndex = VARIANTS.findIndex(v => v.key === current)

  const handlePrev = () => {
    const nextIdx = (currentIndex - 1 + VARIANTS.length) % VARIANTS.length
    onChange(VARIANTS[nextIdx].key)
  }

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % VARIANTS.length
    onChange(VARIANTS[nextIdx].key)
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName.toLowerCase()
      if (['input', 'select', 'textarea'].includes(tag) || document.activeElement?.isContentEditable) {
        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  const currentVariantObj = VARIANTS[currentIndex] || VARIANTS[0]

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 99999,
        background: 'rgba(0, 0, 0, 0.95)',
        border: '2px solid #ccff00',
        borderRadius: '30px',
        padding: '8px 20px',
        display: 'flex',
        alignItems: 'center',
        fontFamily: 'monospace',
        fontSize: '12px',
        boxShadow: '0 0 30px rgba(204, 255, 0, 0.4)',
        backdropFilter: 'blur(16px)',
        pointerEvents: 'auto'
      }}
    >
      <button 
        onClick={handlePrev} 
        title="Previous Variant (Left Arrow)"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ccff00',
          fontWeight: 'bold',
          padding: '4px 10px',
          cursor: 'pointer'
        }}
      >
        &larr; PREV
      </button>

      <div 
        style={{
          margin: '0 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderLeft: '1px solid rgba(255,255,255,0.2)',
          borderRight: '1px solid rgba(255,255,255,0.2)',
          padding: '2px 14px'
        }}
      >
        <span 
          style={{
            background: '#ccff00',
            color: '#000000',
            fontWeight: 'bold',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px'
          }}
        >
          VAR {currentVariantObj.key}
        </span>
        <span style={{ color: '#ffffff', fontWeight: 'bold' }}>
          {currentVariantObj.label}
        </span>
      </div>

      <button 
        onClick={handleNext} 
        title="Next Variant (Right Arrow)"
        style={{
          background: 'transparent',
          border: 'none',
          color: '#ccff00',
          fontWeight: 'bold',
          padding: '4px 10px',
          cursor: 'pointer'
        }}
      >
        NEXT &rarr;
      </button>
    </div>
  )
}
