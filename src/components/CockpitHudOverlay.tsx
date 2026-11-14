import React from 'react';
import { WaypointKey, CelestialTarget, ScanMode } from '../types';
import { CELESTIAL_TARGETS } from '../data/spaceData';

interface CockpitHudOverlayProps {
  activeWaypoint: WaypointKey;
  targetInfo: CelestialTarget;
  showTargetPopup: boolean;
  coordX: number;
  coordY: number;
  coordZ: number;
  distAU: number;
  warpProfile: string;
  freecam: boolean;
  audioActive: boolean;
  scanMode: ScanMode;
  navigationMode?: 'free' | 'voyage';
  viewProjection?: 'planisphere' | 'observatory';
  hoveredOrbitTarget: CelestialTarget | null;
  scannerOpen: boolean;
  onToggleScanner: () => void;
  onToggleViewProjection?: () => void;
  onChangeScanMode: (mode: ScanMode) => void;
  onNavigate: (key: WaypointKey) => void;
  onInspectTarget: () => void;
  onCloseTargetPopup: () => void;
  onCardMouseEnter?: () => void;
  onCardMouseLeave?: () => void;
  onToggleFreecam: () => void;
  onToggleAudio: () => void;
}

const CHAPTER_METADATA: Record<
  Exclude<WaypointKey, 'reset'>,
  {
    number: string;
    eyebrow: string;
    headline: string;
    summary: string;
    accentColor: string;
    stats: { label: string; value: string }[];
  }
> = {
  sun: {
    number: '00',
    eyebrow: 'Étoile G2V · 0.00 AU',
    headline: 'Fondations & Noyau Algorithmique',
    summary:
      'Architecture bas-niveau C/C++, structures de données haute performance et modélisation mathématique au cœur du système.',
    accentColor: '#e5a93c',
    stats: [
      { label: 'EXPÉRIENCE', value: '8+ Ans' },
      { label: 'COMMITS', value: '4,920+' },
      { label: 'PHOTOSPHÈRE', value: '5,778 K' },
    ],
  },
  nextjs: {
    number: '01',
    eyebrow: 'Planète Tellurique · 3.48 AU',
    headline: 'Planète Next.js & Edge SSR',
    summary:
      'Architecture distribuée React Server Components, streaming temps réel multi-région et cache Edge sub-50ms.',
    accentColor: '#38bdf8',
    stats: [
      { label: 'CONVERSION', value: '+340%' },
      { label: 'LATENCE TTFB', value: '45 ms' },
      { label: 'LIGHTHOUSE', value: '100/100' },
    ],
  },
  asteroids: {
    number: '02',
    eyebrow: 'Ceinture Principale · 5.82 AU',
    headline: 'Essaim Open Source & RFCs',
    summary:
      'Contributions directes aux écosystèmes majeurs : Next.js, React Core, Tailwind CSS, tRPC, shadcn/ui et Astral UV.',
    accentColor: '#cbd5e1',
    stats: [
      { label: 'ÉTOILES CUMULÉES', value: '584k+' },
      { label: 'PULL REQUESTS', value: '6 Majeures' },
      { label: 'CORPS S/C-TYPE', value: '200 Astres' },
    ],
  },
  station: {
    number: '03',
    eyebrow: 'Orbite Synchrone · 8.41 AU',
    headline: 'Station DevOps Multi-Cloud',
    summary:
      'Orchestration Kubernetes haute disponibilité, clusters Docker Swarm, déploiements continus ArgoCD et télémétrie AWS/GCP.',
    accentColor: '#34d399',
    stats: [
      { label: 'DISPONIBILITÉ SLA', value: '99.99%' },
      { label: 'LATENCE P99', value: '18 ms' },
      { label: 'RÉPLICAS ACTIFS', value: '64/64' },
    ],
  },
};

const ORDERED_WAYPOINTS: WaypointKey[] = ['reset', 'sun', 'nextjs', 'asteroids', 'station'];

export const CockpitHudOverlay: React.FC<CockpitHudOverlayProps> = ({
  activeWaypoint,
  targetInfo,
  showTargetPopup,
  coordX,
  coordY,
  coordZ,
  distAU,
  warpProfile,
  freecam,
  navigationMode = 'free',
  viewProjection = 'planisphere',
  hoveredOrbitTarget,
  onToggleViewProjection,
  onNavigate,
  onInspectTarget,
  onCloseTargetPopup,
  onCardMouseEnter,
  onCardMouseLeave,
  onToggleFreecam,
}) => {
  const waypoints = [
    { key: 'sun' as WaypointKey, index: '00', title: 'Sol Base', sub: '0.0 AU', dot: '#e5a93c' },
    { key: 'nextjs' as WaypointKey, index: '01', title: 'Next.js Edge', sub: '3.5 AU', dot: '#38bdf8' },
    { key: 'asteroids' as WaypointKey, index: '02', title: 'Open Source', sub: '5.8 AU', dot: '#cbd5e1' },
    { key: 'station' as WaypointKey, index: '03', title: 'Station DevOps', sub: '8.4 AU', dot: '#34d399' },
  ];

  const handleStepChapter = (delta: number) => {
    const idx = ORDERED_WAYPOINTS.indexOf(activeWaypoint);
    const nextIdx = (idx + delta + ORDERED_WAYPOINTS.length) % ORDERED_WAYPOINTS.length;
    onNavigate(ORDERED_WAYPOINTS[nextIdx]);
  };

  const activeChapter =
    activeWaypoint !== 'reset' ? CHAPTER_METADATA[activeWaypoint] : null;
  const activeTargetData =
    activeWaypoint !== 'reset' ? CELESTIAL_TARGETS[activeWaypoint] : null;

  return (
    <div className="hidden lg:flex absolute inset-x-0 top-20 bottom-12 pointer-events-none flex-col justify-between px-6 z-30 select-none overflow-hidden">
      {/* HOVERED ORBITAL TRAJECTORY FLOATING BAR */}
      {hoveredOrbitTarget && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-auto obsidian-glass px-4 py-2.5 rounded-xl border border-sky-400/40 flex items-center gap-4 z-40 max-w-xl">
          <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-600/50 flex items-center justify-center text-sky-400 shrink-0">
            <span className="material-symbols-outlined text-[17px]">alt_route</span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 font-mono text-[10px]">
              <span className="text-sky-400 uppercase font-semibold tracking-wider">
                Éphéméride Kepler
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-300 tabular-nums">
                e = {hoveredOrbitTarget.orbitalParams?.eccentricity ?? '0.00'}
              </span>
            </div>
            <div className="font-display text-sm font-semibold text-slate-100 truncate">
              {hoveredOrbitTarget.name}
            </div>
            <div className="font-mono text-[10px] text-slate-400 tabular-nums truncate">
              Vitesse {hoveredOrbitTarget.orbitalParams?.velocityKmS ?? 20} km/s · Période{' '}
              {hoveredOrbitTarget.orbitalParams?.periodDays ?? 365} j
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate(hoveredOrbitTarget.id as WaypointKey)}
            className="px-3 py-1.5 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-mono text-[10px] font-bold tracking-[0.12em] uppercase cursor-pointer transition-colors shrink-0"
          >
            Approcher
          </button>
        </div>
      )}

      {/* TOP ROW: Editorial Overview & Hover Target Reticle */}
      <div className="flex items-start justify-between w-full relative z-20">
        {activeWaypoint === 'reset' ? (
          <div className="flex flex-col max-w-md pointer-events-auto">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-sky-400 mb-1.5">
              {navigationMode === 'voyage'
                ? 'Mode Voyage Cinématique · Défilez pour Explorer'
                : viewProjection === 'planisphere'
                ? 'Planisphère Écliptique Réel · Secteur 12-Vega'
                : 'Observatoire Héliocentrique · Secteur 12-Vega'}
            </div>
            <h1 className="font-display text-3xl xl:text-4xl font-semibold tracking-tight text-gradient-metallic leading-[1.1] max-w-md">
              Architecture & Ingénierie à l'Échelle Stellaire.
            </h1>
            <p className="font-body text-xs text-slate-400 mt-2.5 leading-relaxed max-w-sm">
              Cartographie héliocentrique coplanaire conforme aux lois de Kepler. Cliquez sur un astre ou une trajectoire elliptique pour inspecter l'étude de cas.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-4">
              <button
                type="button"
                onClick={() => onNavigate('sun')}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-white text-slate-950 font-mono text-[10px] font-bold tracking-[0.14em] uppercase flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Lancer la Visite</span>
                <span className="material-symbols-outlined text-[15px]">east</span>
              </button>

              {onToggleViewProjection && (
                <button
                  type="button"
                  onClick={onToggleViewProjection}
                  className="obsidian-glass hover:border-sky-400/50 px-3 py-2 rounded-lg flex items-center gap-1.5 font-mono text-[10px] text-slate-200 uppercase tracking-wider transition-colors cursor-pointer"
                  title="Basculer entre Planisphère 2D et Vue Observatoire (Touche P)"
                >
                  <span className="material-symbols-outlined text-[14px] text-sky-400">
                    {viewProjection === 'planisphere' ? 'explore' : 'visibility'}
                  </span>
                  <span>
                    {viewProjection === 'planisphere' ? 'Planisphère 2D' : 'Observatoire'}
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div />
        )}

        {/* Floating Hover Reticle Card (Directly clickable, no duplicate Inspect button) */}
        {showTargetPopup && targetInfo && targetInfo.id !== 'reset' && (
          <div
            id="scanner-reticle"
            onMouseEnter={onCardMouseEnter}
            onMouseLeave={onCardMouseLeave}
            className="pointer-events-auto obsidian-glass-interactive p-3 rounded-xl flex items-center gap-3 max-w-md ml-auto"
          >
            <div
              onClick={onInspectTarget}
              className="flex items-center gap-3 flex-1 cursor-pointer min-w-0 group"
              title="Cliquer pour ouvrir le dossier complet"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-600/50 group-hover:border-sky-400/60 flex items-center justify-center text-sky-400 shrink-0 transition-colors">
                <span className="material-symbols-outlined text-[20px]">
                  {targetInfo.icon || 'radar'}
                </span>
              </div>

              <div className="flex flex-col min-w-0 pr-2 flex-1">
                <span className="font-mono text-[9px] tracking-[0.16em] text-sky-400 uppercase truncate">
                  {targetInfo.category}
                </span>
                <div className="font-display text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors truncate mt-0.5">
                  {targetInfo.name}
                </div>
                <div className="font-mono text-[10px] text-slate-400 truncate">
                  {targetInfo.subtitle}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTargetPopup();
              }}
              className="w-7 h-7 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Fermer"
              aria-label="Fermer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}
      </div>

      {/* MIDDLE LEFT: CHAPTER INSPECTOR CARD (When focused on a celestial body) */}
      {activeChapter && activeTargetData && (
        <div
          id="hud-interactive-ui"
          className="pointer-events-auto my-auto max-w-md w-full obsidian-glass rounded-2xl p-6 border border-slate-600/30 flex flex-col gap-4"
        >
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
            <div className="flex items-center gap-2">
              <span
                className="font-display text-xl font-semibold tracking-tight tabular-nums"
                style={{ color: activeChapter.accentColor }}
              >
                {activeChapter.number}
              </span>
              <span className="text-slate-600 font-mono text-xs">/ 03</span>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-slate-400 ml-1">
                {activeChapter.eyebrow}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('reset')}
              className="px-2.5 py-1 rounded-md bg-slate-800/70 hover:bg-slate-800 text-slate-300 hover:text-white font-mono text-[10px] tracking-[0.12em] uppercase flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Planisphère</span>
              <span className="material-symbols-outlined text-[13px]">close_fullscreen</span>
            </button>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-slate-100 leading-tight">
              {activeChapter.headline}
            </h2>
            <p className="font-body text-xs xl:text-sm text-slate-300 mt-2 leading-relaxed">
              {activeChapter.summary}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-1">
            {activeChapter.stats.map((st) => (
              <div
                key={st.label}
                className="bg-[#04070e] border border-slate-700/50 rounded-xl p-3 flex flex-col"
              >
                <span className="font-mono text-[9px] tracking-[0.14em] text-slate-400 uppercase">
                  {st.label}
                </span>
                <span className="font-display text-lg font-semibold text-slate-100 tabular-nums mt-1">
                  {st.value}
                </span>
              </div>
            ))}
          </div>

          {activeTargetData.techStack && (
            <div className="font-mono text-[11px] text-slate-400 leading-relaxed border-t border-slate-800 pt-3">
              {activeTargetData.techStack.join(' · ')}
            </div>
          )}

          <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-700/60">
            <button
              type="button"
              onClick={onInspectTarget}
              className="flex-1 py-2.5 px-4 rounded-lg bg-sky-400 hover:bg-sky-300 text-slate-950 font-mono text-[11px] font-bold tracking-[0.14em] uppercase flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Ouvrir l'Étude de Cas</span>
              <span className="material-symbols-outlined text-[16px]">arrow_outward</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleStepChapter(-1)}
                className="w-10 h-10 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600/40 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Chapitre précédent"
              >
                <span className="material-symbols-outlined text-[18px]">west</span>
              </button>
              <button
                type="button"
                onClick={() => handleStepChapter(1)}
                className="w-10 h-10 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600/40 text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
                title="Chapitre suivant"
              >
                <span className="material-symbols-outlined text-[18px]">east</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM BAR: Coordinates, Orbital Dock, Heliocentric Radius */}
      <div className="flex items-end justify-between gap-4 w-full relative z-20 mt-auto">
        <div className="obsidian-glass px-4 py-2 rounded-xl pointer-events-auto flex items-center gap-4 font-mono text-[10px]">
          <div className="flex flex-col">
            <span className="text-[9px] tracking-[0.16em] text-slate-400 uppercase">
              Éphéméride Active
            </span>
            <span className="text-sky-400 font-semibold tracking-wider mt-0.5">
              {warpProfile}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-slate-700/60" />
          <div className="flex items-center gap-3 text-slate-300 tabular-nums">
            <span>
              <strong className="text-slate-500 font-normal">X</strong> {coordX >= 0 ? '+' : ''}
              {coordX.toFixed(1)}
            </span>
            <span>
              <strong className="text-slate-500 font-normal">Y</strong> {coordY >= 0 ? '+' : ''}
              {coordY.toFixed(1)}
            </span>
            <span>
              <strong className="text-slate-500 font-normal">Z</strong> {coordZ >= 0 ? '+' : ''}
              {coordZ.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Center Orbital Chapter Dock */}
        <div className="obsidian-glass p-1.5 rounded-xl pointer-events-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNavigate('reset')}
            className={`px-3 py-1.5 rounded-lg font-mono text-[10px] tracking-[0.14em] uppercase transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeWaypoint === 'reset'
                ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-600/60'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-sky-400">public</span>
            <span>Planisphère</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-700/60 mx-0.5" />

          {waypoints.map((wp) => {
            const isSelected = activeWaypoint === wp.key;
            return (
              <button
                key={wp.key}
                type="button"
                onClick={() => onNavigate(wp.key)}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                  isSelected
                    ? 'bg-slate-800 text-slate-100 border border-slate-500/60 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: wp.dot }} />
                <span className="font-mono text-[9px] text-slate-500">{wp.index}</span>
                <span className="font-display text-xs font-medium">{wp.title}</span>
                <span className="font-mono text-[9px] text-slate-500 hidden 2xl:inline tabular-nums">
                  {wp.sub}
                </span>
              </button>
            );
          })}
        </div>

        <div className="obsidian-glass px-4 py-2 rounded-xl pointer-events-auto flex items-center gap-3">
          <div className="flex flex-col text-right font-mono">
            <span className="text-[9px] tracking-[0.16em] text-slate-400 uppercase">
              Rayon Héliocentrique
            </span>
            <span className="text-xs font-semibold text-amber-300 tabular-nums">
              {distAU.toFixed(2)} AU
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleFreecam}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer border ${
              freecam
                ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
            title="Verrouiller / Libérer l'angle caméra"
          >
            <span className="material-symbols-outlined text-[16px]">videocam</span>
          </button>
        </div>
      </div>
    </div>
  );
};
