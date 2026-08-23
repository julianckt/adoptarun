import React, { useState, useEffect } from 'react'
import ShaderStudio from './components/ShaderStudio'
import PresetGallery from './components/PresetGallery'
import SplitComparison from './components/SplitComparison'
import PrototypeSwitcher from './components/PrototypeSwitcher'

export default function App() {
  // Read initial variant from URL query param ?variant=
  const getInitialVariant = () => {
    const params = new URLSearchParams(window.location.search)
    const v = params.get('variant')?.toUpperCase()
    return ['A', 'B', 'C'].includes(v) ? v : 'A'
  }

  const [variant, setVariant] = useState(getInitialVariant)

  const handleVariantChange = (newVariant) => {
    setVariant(newVariant)
    const url = new URL(window.location.href)
    url.searchParams.set('variant', newVariant)
    window.history.replaceState({}, '', url)
  }

  // Handle URL back/forward popstate
  useEffect(() => {
    const handlePopState = () => {
      const v = getInitialVariant()
      setVariant(v)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return (
    <div className="w-full min-h-screen bg-black text-white relative">
      {variant === 'A' && <ShaderStudio />}
      {variant === 'B' && <PresetGallery onSelectPreset={() => handleVariantChange('A')} />}
      {variant === 'C' && <SplitComparison />}

      {/* Floating prototype variant switcher */}
      <PrototypeSwitcher current={variant} onChange={handleVariantChange} />
    </div>
  )
}
