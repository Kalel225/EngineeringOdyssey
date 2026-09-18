import React from 'react';
import { WaypointKey, CelestialTarget } from '../types';

interface CockpitHudOverlayProps {
  activeWaypoint: WaypointKey;
  targetInfo: CelestialTarget;
  coordX: number;
  coordY: number;
  coordZ: number;
  distAU: number;
  warpProfile: string;
  freecam: boolean;
  audioActive: boolean;
  onNavigate: (key: WaypointKey) => void;
  onInspectTarget: () => void;
  onToggleFreecam: () => void;
  onToggleAudio: () => void;
}

export const CockpitHudOverlay: React.FC<CockpitHudOverlayProps> = ({
  activeWaypoint,
  targetInfo,
  coordX,
  coordY,
  coordZ,
  distAU,
  warpProfile,
  freecam,
  audioActive,
  onNavigate,
  onInspectTarget,
  onToggleFreecam,
  onToggleAudio,
}) => {
  const waypoints = [
    {
      key: 'sun' as WaypointKey,
      code: '[00] SOL BASE',
      label: 'Fondations C/Algo (0.0 AU)',
      dotColor: 'bg-amber-400',
      borderClass: 'border-amber-500/30 hover:border-amber-400',
    },
    {
      key: 'nextjs' as WaypointKey,
      code: '[01] PLANÈTE NEXT.JS',
      label: 'SSR 15 & Glass Case (3.5 AU)',
      dotColor: 'bg-[#00f2fe]',
      borderClass: 'border-cyan-500/30 hover:border-cyan-400',
    },
    {
      key: 'asteroids' as WaypointKey,
      code: '[02] CEINTURE OPEN SOURCE',
      label: 'PRs & Astéroïdes (5.8 AU)',
      dotColor: 'bg-[#dcb8ff]',
      borderClass: 'border-purple-500/30 hover:border-purple-400',
    },
    {
      key: 'station' as WaypointKey,
      code: '[03] STATION DEVOPS',
      label: 'Cloud & Multi-Zone (8.4 AU)',
      dotColor: 'bg-[#00f5d4]',
      borderClass: 'border-emerald-500/30 hover:border-emerald-400',
    },
  ];

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    if (ratio < 0.25) onNavigate('sun');
    else if (ratio < 0.55) onNavigate('nextjs');
    else if (ratio < 0.8) onNavigate('asteroids');
    else onNavigate('station');
  };

  return (
    <div className="hidden lg:flex absolute inset-0 pointer-events-none flex-col justify-between p-4 z-30 select-none">
      {/* Tactical Grid Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,rgba(0,242,254,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,242,254,0.06)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

      {/* Central Crosshairs & Navigational Reticle */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="relative w-72 h-72 rounded-full border border-[#00f2fe]/10 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border-t border-[#00f2fe]/30 animate-spin"
            style={{ animationDuration: '24s' }}
          />
          <div className="w-2 h-2 rounded-full bg-[#00f2fe]/40" />
          <div className="absolute -top-3 text-[#00f2fe]/50 font-mono text-[10px] tracking-widest">
            NAV.VECT 358°
          </div>
          <div className="absolute -bottom-3 text-[#00f2fe]/50 font-mono text-[10px] tracking-widest">
            NADIR LOCK
          </div>
          <div className="absolute left-2 w-3 h-[1px] bg-[#00f2fe]/40" />
          <div className="absolute right-2 w-3 h-[1px] bg-[#00f2fe]/40" />
        </div>
      </div>

      {/* TOP SECTION: Cockpit telemetry bar + Quick Waypoint selector */}
      <div className="flex flex-col gap-2.5 w-full">
        {/* Cockpit Status Bar */}
        <div className="flex items-center justify-between bg-[#0b0e16]/85 backdrop-blur-md px-4 py-2 rounded-lg border border-[#3a494b]/30 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-ping" />
              <span className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-[#e0fdff] uppercase tracking-wider">
                Engineering Odyssey
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#272a33] text-[#00f2fe] border border-[#00f2fe]/20">
                V4.5 // INTERACTIVE SYSTEM
              </span>
            </div>
            <div className="hidden sm:block h-4 w-[1px] bg-[#3a494b]/50" />
            <div className="hidden md:flex items-center gap-2">
              <span className="font-mono text-[10px] text-[#849495] uppercase">
                Engine Profile:
              </span>
              <span className="font-mono text-xs font-semibold text-[#00f2fe]">
                {warpProfile}
              </span>
            </div>
          </div>

          {/* Coordinates */}
          <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs">
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] text-[#849495]">X</span>
              <span className="text-[#00f2fe] font-bold">
                {coordX >= 0 ? '+' : ''}
                {coordX.toFixed(3)}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-[10px] text-[#849495]">Y</span>
              <span className="text-[#00f2fe] font-bold">
                {coordY >= 0 ? '+' : ''}
                {coordY.toFixed(3)}
              </span>
            </div>
            <div className="hidden sm:flex items-baseline gap-1">
              <span className="text-[10px] text-[#849495]">Z</span>
              <span className="text-[#00f2fe] font-bold">
                {coordZ >= 0 ? '+' : ''}
                {coordZ.toFixed(3)}
              </span>
            </div>
            <div className="flex items-baseline gap-1 bg-[#272a33] px-2 py-0.5 rounded border border-[#3a494b]/40">
              <span className="text-[10px] text-[#849495]">CHRONO-AU</span>
              <span className="text-[#dcb8ff] font-bold">
                {distAU.toFixed(2)} AU
              </span>
            </div>
          </div>
        </div>

        {/* Quick Waypoints Pills */}
        <div className="flex items-center gap-2 justify-center pointer-events-auto flex-wrap">
          {waypoints.map((wp) => {
            const isSelected = activeWaypoint === wp.key;
            return (
              <button
                key={wp.key}
                type="button"
                onClick={() => onNavigate(wp.key)}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0b0e16]/85 backdrop-blur-md transition-all shadow-md cursor-pointer border ${
                  isSelected
                    ? 'ring-2 ring-[#00f2fe] bg-[#1d1f28] text-[#00f2fe]'
                    : `text-[#b9cacb] hover:bg-[#272a33] hover:text-[#e1e2ee] ${wp.borderClass}`
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${wp.dotColor} ${isSelected ? 'animate-pulse' : ''}`} />
                <span className="font-mono text-xs tracking-wider uppercase font-semibold">
                  {wp.code}
                </span>
                <span className="font-body text-xs text-[#849495] hidden xl:inline">
                  • {wp.label}
                </span>
              </button>
            );
          })}

          {/* Reset button: Vue Globale */}
          <button
            type="button"
            onClick={() => onNavigate('reset')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shadow-md cursor-pointer border ${
              activeWaypoint === 'reset'
                ? 'bg-[#1d1f28] ring-2 ring-[#00f2fe] text-[#00f2fe] border-[#00f2fe]/40'
                : 'bg-[#272a33] hover:bg-[#363943] text-[#e1e2ee] border-[#3a494b]/40'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-[#00f2fe]">
              filter_tilt_shift
            </span>
            <span className="font-mono text-xs uppercase tracking-wider font-semibold">
              Vue Globale
            </span>
          </button>
        </div>
      </div>

      {/* CENTER HUD: Floating Target Scanner Reticle Card */}
      <div className="flex justify-center items-start w-full relative">
        <div
          id="scanner-reticle"
          className="transition-all duration-300 opacity-95 pointer-events-auto bg-[#0b0e16]/90 backdrop-blur-xl p-3 sm:p-4 rounded-xl shadow-2xl flex items-center gap-3 sm:gap-4 max-w-xl border border-[#00f2fe]/35"
        >
          <div className="relative w-10 h-10 rounded-lg bg-[#1d1f28] flex items-center justify-center border border-[#00f2fe]/30 flex-shrink-0">
            <span className="material-symbols-outlined text-[#00f2fe] text-[22px] animate-pulse">
              {targetInfo.icon || 'radar'}
            </span>
          </div>

          <div className="flex flex-col min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe]" />
              <span className="font-mono text-[10px] text-[#849495] uppercase tracking-wider truncate">
                {targetInfo.category || 'OPTICAL SENSOR ACQUIRED'}
              </span>
            </div>
            <div className="font-['Space_Grotesk'] text-sm sm:text-base font-bold text-[#e1e2ee] truncate">
              {targetInfo.name}
            </div>
            <div className="font-mono text-[10px] text-[#00f2fe] truncate">
              {targetInfo.meta || `${targetInfo.subtitle} • ${targetInfo.au.toFixed(2)} AU`}
            </div>
          </div>

          <button
            type="button"
            onClick={onInspectTarget}
            className="px-3 py-1.5 bg-[#00f2fe]/20 hover:bg-[#00f2fe] text-[#00f2fe] hover:text-[#002022] rounded-lg transition-all font-mono text-xs uppercase font-bold whitespace-nowrap border border-[#00f2fe]/40 shadow-[0_0_10px_rgba(0,242,254,0.2)] cursor-pointer flex-shrink-0"
          >
            Inspecter
          </button>
        </div>
      </div>

      {/* BOTTOM SECTION: Chronological Timeline, Flight Guides, and Thrusters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end w-full">
        {/* Left: Interactive Chronological Odyssey Vector */}
        <div className="md:col-span-5 bg-[#0b0e16]/85 backdrop-blur-md p-3 rounded-lg shadow-lg pointer-events-auto flex flex-col gap-1.5 border border-[#3a494b]/30">
          <div className="flex items-center justify-between text-[#849495] font-mono text-[10px]">
            <span className="uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-[#dcb8ff]">
                timeline
              </span>{' '}
              Vecteur Chronologique d'Odyssée
            </span>
            <span className="text-[#00f2fe] font-mono">
              0.0 AU (Origines) → 8.41 AU (Cloud)
            </span>
          </div>

          {/* Interactive Colored Bar */}
          <div
            onClick={handleTimelineClick}
            className="relative w-full h-2.5 rounded-full bg-[#32343e] overflow-hidden flex cursor-pointer"
            title="Cliquez pour naviguer le long de la chronologie spatiale"
          >
            <div
              className="h-full bg-amber-400 hover:opacity-80 transition-all"
              style={{ width: '22%' }}
              title="0.0 AU : Sol Base (Origines C/Algo)"
            />
            <div
              className="h-full bg-[#00f2fe] hover:opacity-80 transition-all"
              style={{ width: '33%' }}
              title="3.48 AU : Planète Next.js (Architecture SSR)"
            />
            <div
              className="h-full bg-[#dcb8ff] hover:opacity-80 transition-all"
              style={{ width: '25%' }}
              title="5.82 AU : Ceinture Open Source (PRs & RFCs)"
            />
            <div
              className="h-full bg-[#00f5d4] hover:opacity-80 transition-all"
              style={{ width: '20%' }}
              title="8.41 AU : Station DevOps (Multi-Cloud & K8s)"
            />
          </div>

          <p className="font-body text-[11px] text-[#849495] italic leading-tight">
            "Plus le vaisseau s'éloigne de Sol, plus les technologies cartographiées sont contemporaines, distribuées et massives."
          </p>
        </div>

        {/* Center: Flight Instructions */}
        <div className="md:col-span-4 bg-[#0b0e16]/85 backdrop-blur-md px-4 py-2.5 rounded-lg shadow-lg pointer-events-auto flex items-center justify-between border border-[#3a494b]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#1d1f28] flex items-center justify-center border border-[#00f2fe]/20">
              <span className="material-symbols-outlined text-[#00f2fe] text-[18px]">
                navigation
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs text-[#00f2fe] uppercase font-semibold">
                Pilotage Spatial Actif
              </span>
              <span className="font-body text-[11px] text-[#849495]">
                Survol d'un astre • Clic 3D pour approche
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-[#849495]">
            <kbd className="px-1.5 py-0.5 rounded bg-[#1d1f28] border border-[#3a494b]/50">
              SURVOL
            </kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-[#1d1f28] border border-[#3a494b]/50">
              CLIC
            </kbd>
          </div>
        </div>

        {/* Right: Propulsion and Toggles */}
        <div className="md:col-span-3 bg-[#0b0e16]/85 backdrop-blur-md p-3 rounded-lg shadow-lg pointer-events-auto flex items-center justify-between border border-[#3a494b]/30">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-[#849495] uppercase">
              Thrusters
            </span>
            <span className="font-mono text-xs text-[#00f2fe] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe] animate-pulse" />
              IONIC DRIVE 98%
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleAudio}
              className={`p-1.5 rounded transition-colors cursor-pointer border ${
                audioActive
                  ? 'bg-[#1d1f28] border-[#00f2fe]/50 text-[#00f2fe]'
                  : 'bg-[#272a33] border-[#3a494b]/40 text-[#849495] hover:text-[#e1e2ee]'
              }`}
              title="Toggle Synthesizer Audio Hum"
            >
              <span className="material-symbols-outlined text-[18px]">
                {audioActive ? 'volume_up' : 'volume_off'}
              </span>
            </button>

            <button
              type="button"
              onClick={onToggleFreecam}
              className={`p-1.5 rounded transition-colors cursor-pointer border ${
                freecam
                  ? 'bg-[#1d1f28] border-[#00f2fe] text-[#00f2fe]'
                  : 'bg-[#272a33] border-[#3a494b]/40 text-[#849495] hover:text-[#e1e2ee]'
              }`}
              title="Toggle Free-camera mode"
            >
              <span className="material-symbols-outlined text-[18px]">
                videocam
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
