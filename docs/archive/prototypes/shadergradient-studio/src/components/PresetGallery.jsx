import React, { useState } from 'react'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import { PRESETS } from './ControlsPanel'

export default function PresetGallery({ onSelectPreset }) {
  const [selectedIdx, setSelectedIdx] = useState(0)

  return (
    <div className="relative w-full min-h-screen bg-[#08080c] p-6 sm:p-10 font-mono text-white flex flex-col justify-between overflow-y-auto">
      {/* Header */}
      <header className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/15 pb-6">
        <div>
          <div className="text-[#ccff00] text-xs font-bold uppercase tracking-widest flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 bg-[#ccff00] rounded-full animate-pulse"></span>
            PROTOTYPE VARIANT B // PRESET THEME GALLERY
          </div>
          <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
            SHADERGRADIENT PALETTES
          </h2>
        </div>
        <p className="text-xs text-gray-400 max-w-md leading-relaxed">
          Curated 3D WebGL shader presets for hero backgrounds. Click any card to customize it live in the interactive studio.
        </p>
      </header>

      {/* Grid of Presets */}
      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 my-auto">
        {PRESETS.map((preset, idx) => (
          <div
            key={idx}
            onClick={() => {
              setSelectedIdx(idx)
              onSelectPreset(preset.config)
            }}
            className={`group relative h-80 rounded-2xl overflow-hidden border transition-all cursor-pointer shadow-2xl ${
              selectedIdx === idx 
                ? 'border-[#ccff00] shadow-[0_0_35px_rgba(204,255,0,0.3)] ring-2 ring-[#ccff00]/50' 
                : 'border-white/15 hover:border-white/40'
            }`}
          >
            {/* Live 3D Shader Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
              <ShaderGradientCanvas style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}>
                <ShaderGradient
                  control="props"
                  {...preset.config}
                />
              </ShaderGradientCanvas>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 w-full h-full bg-gradient-to-t from-black/90 via-black/30 to-black/60 p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="bg-black/80 border border-[#ccff00]/60 text-[#ccff00] text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider backdrop-blur-md">
                  THEME 0{idx + 1}
                </span>
                <span className="bg-black/60 text-xs text-gray-300 font-mono px-2.5 py-1 rounded border border-white/15 backdrop-blur-md">
                  {preset.config.type}
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-black text-white uppercase group-hover:text-[#ccff00] transition-colors mb-2">
                  {preset.name}
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                  <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: preset.config.color1 }}></span>
                  <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: preset.config.color2 }}></span>
                  <span className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ backgroundColor: preset.config.color3 }}></span>
                  <span className="ml-2 text-gray-300">Speed: {preset.config.uSpeed} &bull; Grain: {preset.config.grain}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-white/15 flex justify-between items-center text-xs">
                <span className="text-gray-400 group-hover:text-white transition-colors">
                  Click to open in Live Studio &rarr;
                </span>
                <span className="text-[#ccff00] opacity-0 group-hover:opacity-100 transition-opacity font-bold uppercase">
                  [SELECT THEME]
                </span>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full text-center text-xs text-gray-500 pt-8 border-t border-white/10">
        Switch between variants using the bottom floating switcher bar or keyboard arrow keys &larr; &rarr;.
      </footer>
    </div>
  )
}
