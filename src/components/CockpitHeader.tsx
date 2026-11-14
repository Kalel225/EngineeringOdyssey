import React from 'react';
import { OfficerUser, ScanMode } from '../types';

interface CockpitHeaderProps {
  coordX: number;
  coordY: number;
  distAU: number;
  velocityC: number;
  audioActive: boolean;
  isAuthenticated: boolean;
  officerUser: OfficerUser | null;
  sidebarOpen: boolean;
  scannerOpen?: boolean;
  navigationMode?: 'free' | 'voyage';
  viewProjection?: 'planisphere' | 'observatory';
  scanMode?: ScanMode;
  onToggleNavigationMode?: () => void;
  onToggleViewProjection?: () => void;
  onChangeScanMode?: (mode: ScanMode) => void;
  onToggleSidebar: () => void;
  onToggleScanner?: () => void;
  onToggleAudio: () => void;
  onOpenNewProject: () => void;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}

export const CockpitHeader: React.FC<CockpitHeaderProps> = ({
  coordX,
  coordY,
  distAU,
  velocityC,
  audioActive,
  isAuthenticated,
  officerUser,
  sidebarOpen,
  scannerOpen = false,
  navigationMode = 'free',
  viewProjection = 'planisphere',
  scanMode = 'optical',
  onToggleNavigationMode,
  onToggleViewProjection,
  onChangeScanMode,
  onToggleSidebar,
  onToggleScanner,
  onToggleAudio,
  onOpenNewProject,
  onOpenProfile,
  onOpenAuth,
}) => {
  const formattedRA = `${Math.abs(Math.floor(coordX / 8)) % 24}h ${Math.abs(Math.floor(coordY / 2)) % 60}m`;
  const formattedDEC = `${coordY >= 0 ? '+' : '-'}${Math.abs(Math.floor(coordY)) % 90}°`;

  const bands: { key: ScanMode; tag: string; color: string }[] = [
    { key: 'optical', tag: 'VIS', color: '#38bdf8' },
    { key: 'infrared', tag: 'IR', color: '#f97316' },
    { key: 'radio', tag: 'RF', color: '#60a5fa' },
    { key: 'gravitational', tag: 'GW', color: '#a78bfa' },
  ];

  return (
    <header className="hidden lg:flex fixed top-4 left-6 right-6 h-13 obsidian-glass rounded-xl z-40 px-4 items-center justify-between select-none gap-4">
      {/* Left: Observatory Brand & Index Trigger */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-[11px] tracking-[0.14em] uppercase transition-colors cursor-pointer border whitespace-nowrap shrink-0 ${
            sidebarOpen
              ? 'bg-sky-400 text-[#04111d] border-sky-400 font-semibold'
              : 'bg-slate-800/60 hover:bg-slate-800 text-slate-200 border-slate-600/35'
          }`}
          title="Ouvrir l'index des chapitres et commandes"
        >
          <span className="material-symbols-outlined text-[16px]">
            {sidebarOpen ? 'menu_open' : 'drag_handle'}
          </span>
          <span>Index</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-700/60" />

        <div className="flex flex-col min-w-0">
          <span className="font-display text-xs font-semibold tracking-[0.18em] uppercase text-slate-100 whitespace-nowrap">
            Engineering Odyssey
          </span>
          <span className="font-mono text-[10px] tracking-[0.12em] text-slate-400 uppercase tabular-nums whitespace-nowrap">
            RA {formattedRA} · DEC {formattedDEC} · {distAU.toFixed(2)} AU
          </span>
        </div>
      </div>

      {/* Center: Projection Switcher & Navigation Mode */}
      <div className="flex items-center gap-2 shrink-0">
        {onToggleViewProjection && (
          <div className="flex items-center bg-[#04070e] p-1 rounded-lg border border-slate-700/50">
            <button
              type="button"
              onClick={() => viewProjection !== 'planisphere' && onToggleViewProjection()}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] tracking-[0.1em] uppercase transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                viewProjection === 'planisphere'
                  ? 'bg-slate-800 text-sky-300 font-semibold border border-slate-600/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vue Planisphère Écliptique 2D (Raccourci P)"
            >
              <span className="material-symbols-outlined text-[14px]">explore</span>
              <span>Planisphère 2D</span>
            </button>

            <button
              type="button"
              onClick={() => viewProjection !== 'observatory' && onToggleViewProjection()}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] tracking-[0.1em] uppercase transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                viewProjection === 'observatory'
                  ? 'bg-slate-800 text-sky-300 font-semibold border border-slate-600/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Vue Observatoire Oblique (Raccourci P)"
            >
              <span className="material-symbols-outlined text-[14px]">visibility</span>
              <span>Observatoire</span>
            </button>
          </div>
        )}

        {onToggleNavigationMode && (
          <div className="flex items-center bg-[#04070e] p-1 rounded-lg border border-slate-700/50">
            <button
              type="button"
              onClick={() => navigationMode !== 'free' && onToggleNavigationMode()}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] tracking-[0.1em] uppercase transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                navigationMode === 'free'
                  ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-600/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[14px]">3d_rotation</span>
              <span>Exploration</span>
            </button>

            <button
              type="button"
              onClick={() => navigationMode !== 'voyage' && onToggleNavigationMode()}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[10px] tracking-[0.1em] uppercase transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                navigationMode === 'voyage'
                  ? 'bg-sky-500/20 text-sky-300 font-semibold border border-sky-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Mode Voyage Cinématique : molette pour naviguer de chapitre en chapitre"
            >
              <span className="material-symbols-outlined text-[14px]">movie_filter</span>
              <span>Voyage</span>
            </button>
          </div>
        )}
      </div>

      {/* Right: Spectral Band Switcher, Scanner, Deploy, Officer Access, Audio & Profile */}
      <div className="flex items-center gap-2 shrink-0">
        {onChangeScanMode && (
          <div className="hidden xl:flex items-center gap-1 bg-[#04070e] p-1 rounded-lg border border-slate-700/50">
            {bands.map((b) => {
              const active = scanMode === b.key;
              return (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => onChangeScanMode(b.key)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-[10px] tracking-wider transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-600/50'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={`Bande spectrale : ${b.tag}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: b.color }} />
                  <span>{b.tag}</span>
                </button>
              );
            })}
          </div>
        )}

        {onToggleScanner && (
          <button
            type="button"
            onClick={onToggleScanner}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors font-mono text-[10px] tracking-[0.12em] uppercase cursor-pointer border whitespace-nowrap shrink-0 ${
              scannerOpen
                ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
                : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300'
            }`}
            title="Ouvrir le scanner multispectral"
          >
            <span className="material-symbols-outlined text-[15px] text-sky-400">sensors</span>
            <span className="hidden 2xl:inline">Spectre</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenNewProject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-white text-slate-950 transition-colors font-mono text-[10px] tracking-[0.12em] uppercase font-semibold cursor-pointer whitespace-nowrap shrink-0"
          title="Ajouter un projet dans le registre orbital"
        >
          <span className="material-symbols-outlined text-[15px]">add</span>
          <span className="hidden xl:inline">Déployer</span>
        </button>

        <button
          type="button"
          onClick={onOpenAuth}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-mono text-[10px] tracking-wider uppercase cursor-pointer border transition-colors whitespace-nowrap shrink-0 ${
            isAuthenticated && officerUser
              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/35 hover:bg-emerald-500/20'
              : 'bg-slate-800/50 text-amber-300 border-amber-500/30 hover:bg-slate-800'
          }`}
          title="Accréditation Officier"
        >
          <span className="material-symbols-outlined text-[14px]">
            {isAuthenticated ? 'verified_user' : 'lock'}
          </span>
          <span className="hidden 2xl:inline">
            {isAuthenticated && officerUser ? officerUser.callsign : 'Accès'}
          </span>
        </button>

        <button
          type="button"
          onClick={onToggleAudio}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer border shrink-0 ${
            audioActive
              ? 'bg-sky-500/20 border-sky-400/50 text-sky-300'
              : 'bg-slate-800/50 border-slate-700/60 text-slate-400 hover:text-slate-200'
          }`}
          title={`Synthétiseur Spatial (${velocityC.toFixed(2)}c)`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {audioActive ? 'graphic_eq' : 'volume_off'}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-600/50 flex items-center justify-center text-slate-200 hover:text-amber-300 cursor-pointer transition-colors shrink-0"
          title="Dossier de l'Architecte & Origines"
        >
          <span className="material-symbols-outlined text-[16px]">person</span>
        </button>
      </div>
    </header>
  );
};
