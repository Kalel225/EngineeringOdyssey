import React from 'react';
import { WaypointKey } from '../types';

interface CockpitSidebarProps {
  activeWaypoint: WaypointKey;
  onNavigate: (key: WaypointKey) => void;
  coreIntegrity: number;
  warpHarmonic: string;
  isOpen: boolean;
  onClose: () => void;
  onReboot?: () => void;
  onOpenScanner?: () => void;
}

export const CockpitSidebar: React.FC<CockpitSidebarProps> = ({
  activeWaypoint,
  onNavigate,
  coreIntegrity,
  warpHarmonic,
  isOpen,
  onClose,
  onReboot,
  onOpenScanner,
}) => {
  const navItems = [
    {
      key: 'reset' as WaypointKey,
      code: 'SYS',
      label: 'Planisphère du Système',
      icon: 'public',
      sublabel: 'Secteur 12-Vega • Écliptique',
    },
    {
      key: 'sun' as WaypointKey,
      code: '00',
      label: 'Sol Base • Origines',
      icon: 'wb_sunny',
      sublabel: '0.00 AU • Fondations C/C++ & Algo',
    },
    {
      key: 'nextjs' as WaypointKey,
      code: '01',
      label: 'Planète Next.js • Edge',
      icon: 'rocket_launch',
      sublabel: '3.48 AU • SSR 15 & Cache Global',
    },
    {
      key: 'asteroids' as WaypointKey,
      code: '02',
      label: 'Ceinture Open Source',
      icon: 'hub',
      sublabel: '5.82 AU • 6 PRs Majeures & RFCs',
    },
    {
      key: 'station' as WaypointKey,
      code: '03',
      label: 'Station DevOps • Cloud',
      icon: 'dns',
      sublabel: '8.41 AU • Kubernetes & Multi-Cloud',
    },
  ];

  return (
    <>
      {/* Matte Backdrop (no expensive backdrop-filter over WebGL) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 z-40 transition-opacity animate-in fade-in"
          title="Cliquer pour refermer l'index"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-80 max-w-[88vw] obsidian-glass z-50 flex flex-col justify-between p-5 border-r border-slate-400/15 select-none transition-all duration-300 ease-out ${
          isOpen
            ? 'translate-x-0 opacity-100 pointer-events-auto'
            : '-translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-5 overflow-y-auto pr-1">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-400/15 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[#e5a93c]" />
              <div>
                <span className="font-display text-sm font-bold tracking-[0.16em] text-slate-100 uppercase block">
                  Index Stellaire
                </span>
                <span className="font-mono text-[9px] tracking-[0.18em] text-slate-400 uppercase">
                  Navigation & Raccourcis
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg bg-[#0d1422] hover:bg-[#141f35] text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors cursor-pointer border border-slate-400/15"
              title="Fermer l'index (Échap)"
              aria-label="Fermer l'index"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          {/* Waypoints Navigation List */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between px-1 pb-1">
              <span className="font-mono text-[9px] tracking-[0.22em] text-slate-400 uppercase">
                Chapitres Orbitaux
              </span>
              <span className="font-mono text-[9px] text-sky-400/90 tabular-nums">TOUCHES 0–4</span>
            </div>

            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive = activeWaypoint === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      onNavigate(item.key);
                      onClose();
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer group border ${
                      isActive
                        ? 'bg-sky-400/12 text-slate-50 border-sky-400/45'
                        : 'bg-[#0b101b] hover:bg-[#11192a] text-slate-300 hover:text-slate-100 border-slate-400/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center border shrink-0 transition-colors ${
                          isActive
                            ? 'bg-sky-400 text-[#050810] border-sky-400'
                            : 'bg-[#101829] text-slate-400 group-hover:text-sky-400 border-slate-400/15'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {item.icon}
                        </span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[9px] text-sky-400 uppercase tabular-nums">
                            [{item.code}]
                          </span>
                          <span className="font-display text-xs font-semibold truncate">
                            {item.label}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 truncate mt-0.5 tabular-nums">
                          {item.sublabel}
                        </span>
                      </div>
                    </div>

                    <span className="material-symbols-outlined text-[15px] text-slate-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all">
                      arrow_forward
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* PC & Touch Ergonomics Cheat Sheet */}
          <div className="bg-[#0b101b] rounded-xl p-3.5 border border-slate-400/15 space-y-2.5">
            <span className="font-mono text-[9px] tracking-[0.2em] text-sky-400 uppercase block">
              Commandes PC & Tactiles
            </span>
            <div className="space-y-1.5 font-mono text-[10px] text-slate-300">
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">Planisphère / Observ.</span>
                <span className="text-slate-200">Touche [P]</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">Orbite 360°</span>
                <span className="text-slate-200">Clic + Glisser / 1 Doigt</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">Zoom Caméra</span>
                <span className="text-slate-200">Molette / Pincer</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">Chapitre Suiv./Préc.</span>
                <span className="text-slate-200">Touches ← / →</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">Mode Voyage / Libre</span>
                <span className="text-slate-200">Touche [V]</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-400">Scanner Spectral</span>
                <span className="text-slate-200">Touche [S]</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions & Telemetry */}
        <div className="flex flex-col gap-2.5 pt-4 border-t border-slate-400/15">
          {onOpenScanner && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenScanner();
              }}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-sky-400/12 hover:bg-sky-400/20 text-sky-300 border border-sky-400/35 text-xs font-mono transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">sensors</span>
                <span>Scanner Multispectral</span>
              </span>
              <span className="text-[9px] tracking-widest uppercase text-sky-400">DSP Live</span>
            </button>
          )}

          {onReboot && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onReboot();
              }}
              className="flex items-center justify-between px-3.5 py-2 rounded-lg bg-[#0d1422] hover:bg-[#141f35] text-slate-300 hover:text-slate-100 border border-slate-400/15 text-xs font-mono transition-all cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                <span>Relancer l'Amorce</span>
              </span>
              <span className="text-[9px] text-slate-400 uppercase">Boot</span>
            </button>
          )}

          <div className="flex items-center justify-between text-slate-400 font-mono text-[9px] pt-1 px-1 tabular-nums">
            <span>INTÉGRITÉ {coreIntegrity.toFixed(1)}%</span>
            <span className="text-amber-300">{warpHarmonic}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
