import React, { useState } from 'react'
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'
import { PRESETS } from './ControlsPanel'

export default function SplitComparison() {
  const [configA, setConfigA] = useState(PRESETS[0].config)
  const [configB, setConfigB] = useState(PRESETS[1].config)

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-mono flex flex-col">
      {/* Header Bar */}
      <header className="bg-black/90 border-b border-white/15 px-6 py-3.5 flex justify-between items-center z-30 shadow-xl">
        <div className="flex items-center gap-3">
          <span className="bg-[#ccff00] text-black text-[10px] font-bold px-2.5 py-1 rounded uppercase">
            VARIANT C
          </span>
          <span className="text-white font-bold text-sm uppercase tracking-wider">
            SPLIT SHADER COMPARISON STUDIO
          </span>
        </div>
        <div className="text-xs text-gray-400 hidden sm:block">
          Compare 2 shader configurations side-by-side
        </div>
      </header>

      {/* Split Screen Container */}
      <main className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 relative">
        {/* Left Side: Config A */}
        <div className="relative border-r border-white/20 overflow-hidden">
          {/* Canvas */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <ShaderGradientCanvas style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}>
              <ShaderGradient control="props" {...configA} />
            </ShaderGradientCanvas>
          </div>

          {/* Overlay Label & Controls */}
          <div className="relative z-10 p-6 flex flex-col justify-between h-full bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none">
            <div className="flex justify-between items-start pointer-events-auto">
              <span className="bg-black/80 border border-[#ccff00] text-[#ccff00] px-3 py-1.5 rounded text-xs font-bold uppercase backdrop-blur-md">
                OPTION A: {PRESETS.find(p => p.config === configA)?.name || 'Custom A'}
              </span>
              <select
                value={PRESETS.findIndex(p => p.config === configA)}
                onChange={(e) => setConfigA(PRESETS[e.target.value].config)}
                className="bg-black/90 border border-white/30 text-white text-xs px-3 py-1.5 rounded outline-none focus:border-[#ccff00] cursor-pointer"
              >
                {PRESETS.map((p, i) => (
                  <option key={i} value={i}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="max-w-md my-auto text-center pointer-events-auto mx-auto">
              <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight drop-shadow-lg mb-3">
                DYNAMIC <span className="text-[#ccff00]">MESH A</span>
              </h2>
              <p className="text-xs text-gray-200 bg-black/70 p-4 rounded-xl border-l-2 border-[#ccff00] backdrop-blur-md text-left">
                Type: {configA.type} geometry with colors {configA.color1} &amp; {configA.color2}.
              </p>
            </div>

            <div className="bg-black/80 border border-white/15 p-3.5 rounded-xl text-[10px] text-gray-300 backdrop-blur-md grid grid-cols-2 gap-2 pointer-events-auto">
              <div>Type: <span className="text-white font-bold">{configA.type}</span></div>
              <div>Speed: <span className="text-white font-bold">{configA.uSpeed}</span></div>
              <div>Grain: <span className="text-white font-bold">{configA.grain}</span></div>
              <div>Density: <span className="text-white font-bold">{configA.uDensity}</span></div>
            </div>
          </div>
        </div>

        {/* Right Side: Config B */}
        <div className="relative overflow-hidden">
          {/* Canvas */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <ShaderGradientCanvas style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, pointerEvents: 'none' }}>
              <ShaderGradient control="props" {...configB} />
            </ShaderGradientCanvas>
          </div>

          {/* Overlay Label & Controls */}
          <div className="relative z-10 p-6 flex flex-col justify-between h-full bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none">
            <div className="flex justify-between items-start pointer-events-auto">
              <span className="bg-black/80 border border-[#00f0ff] text-[#00f0ff] px-3 py-1.5 rounded text-xs font-bold uppercase backdrop-blur-md">
                OPTION B: {PRESETS.find(p => p.config === configB)?.name || 'Custom B'}
              </span>
              <select
                value={PRESETS.findIndex(p => p.config === configB)}
                onChange={(e) => setConfigB(PRESETS[e.target.value].config)}
                className="bg-black/90 border border-white/30 text-white text-xs px-3 py-1.5 rounded outline-none focus:border-[#00f0ff] cursor-pointer"
              >
                {PRESETS.map((p, i) => (
                  <option key={i} value={i}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="max-w-md my-auto text-center pointer-events-auto mx-auto">
              <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight drop-shadow-lg mb-3">
                DYNAMIC <span className="text-[#00f0ff]">MESH B</span>
              </h2>
              <p className="text-xs text-gray-200 bg-black/70 p-4 rounded-xl border-l-2 border-[#00f0ff] backdrop-blur-md text-left">
                Type: {configB.type} geometry with colors {configB.color1} &amp; {configB.color2}.
              </p>
            </div>

            <div className="bg-black/80 border border-white/15 p-3.5 rounded-xl text-[10px] text-gray-300 backdrop-blur-md grid grid-cols-2 gap-2 pointer-events-auto">
              <div>Type: <span className="text-white font-bold">{configB.type}</span></div>
              <div>Speed: <span className="text-white font-bold">{configB.uSpeed}</span></div>
              <div>Grain: <span className="text-white font-bold">{configB.grain}</span></div>
              <div>Density: <span className="text-white font-bold">{configB.uDensity}</span></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
