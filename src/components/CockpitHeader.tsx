import React from 'react';
import { OfficerUser } from '../types';

interface CockpitHeaderProps {
  coordX: number;
  coordY: number;
  distAU: number;
  velocityC: number;
  audioActive: boolean;
  isAuthenticated: boolean;
  officerUser: OfficerUser | null;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
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
  onToggleSidebar,
  onToggleAudio,
  onOpenNewProject,
  onOpenProfile,
  onOpenAuth,
}) => {
  // Format coordinate telemetry
  const formattedRA = `RA ${Math.abs(Math.floor(coordX / 8)) % 24}h ${Math.abs(Math.floor(coordY / 2)) % 60}m`;
  const formattedDEC = `DEC ${coordY >= 0 ? '+' : '-'}${Math.abs(Math.floor(coordY)) % 90}°${Math.abs(Math.floor(coordX)) % 60}′`;

  return (
    <header className="hidden lg:flex fixed top-0 left-0 right-0 h-16 bg-[#0b0e16]/85 backdrop-blur-xl z-40 px-4 xl:px-6 items-center justify-between border-b border-[#3a494b]/30 shadow-[0_1px_12px_rgba(0,0,0,0.4)] select-none gap-4">
      {/* Left controls & telemetry readouts */}
      <div className="flex items-center gap-3 xl:gap-5 min-w-0">
        {/* Sidebar Toggle Button (Flight Deck Drawer) */}
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs uppercase font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(0,242,254,0.15)] shrink-0 ${
            sidebarOpen
              ? 'bg-[#00f2fe] text-[#002022] border-[#00f2fe]'
              : 'bg-[#191b24] hover:bg-[#272a33] text-[#00f2fe] border-cyan-500/40 hover:border-cyan-400'
          }`}
          title={sidebarOpen ? "Réduire la console latérale (Flight Deck)" : "Déployer la console latérale (Flight Deck)"}
        >
          <span className="material-symbols-outlined text-[18px]">
            {sidebarOpen ? 'menu_open' : 'menu'}
          </span>
          <span className="hidden sm:inline font-mono">Flight Deck</span>
        </button>

        <div className="flex flex-col shrink-0">
          <span className="font-mono text-[10px] text-[#849495] uppercase tracking-wider">
            Vector Coords
          </span>
          <span className="font-mono text-xs xl:text-sm font-bold text-[#00f2fe] tracking-wide">
            {formattedRA} / {formattedDEC}
          </span>
        </div>

        <div className="flex flex-col border-l border-[#3a494b]/30 pl-3 xl:pl-4 shrink-0">
          <span className="font-mono text-[10px] text-[#849495] uppercase tracking-wider">
            Velocity
          </span>
          <span className="font-mono text-xs xl:text-sm font-semibold text-[#e1e2ee]">
            {velocityC.toFixed(3)}{' '}
            <span className="text-[10px] xl:text-[11px] text-[#849495] font-normal">c</span>
          </span>
        </div>

        <div className="flex flex-col border-l border-[#3a494b]/30 pl-3 xl:pl-4 shrink-0">
          <span className="font-mono text-[10px] text-[#849495] uppercase tracking-wider">
            Dist. Sol
          </span>
          <span className="font-mono text-xs xl:text-sm font-semibold text-[#e1e2ee]">
            {distAU.toFixed(3)}{' '}
            <span className="text-[10px] xl:text-[11px] text-[#849495] font-normal">AU</span>
          </span>
        </div>

        <div className="hidden 2xl:flex items-center gap-2 bg-[#1d1f28] px-3 py-1 rounded border border-[#3a494b]/40 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00dce6] animate-ping" />
          <span className="font-mono text-[11px] text-[#e0fdff] uppercase tracking-wider">
            Sector 12-Vega // NOMINAL
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2.5 xl:gap-3 shrink-0">
        {/* Authentication Status Badge */}
        {isAuthenticated && officerUser ? (
          <div
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono text-[11px] cursor-pointer hover:bg-emerald-500/25 transition-all shrink-0"
            title="Officier Authentifié - Cliquez pour gérer la session"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="uppercase font-semibold">{officerUser.callsign} // CL-{officerUser.clearanceLevel}</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#272a33] hover:bg-[#363943] text-amber-400 border border-amber-500/30 font-mono text-[11px] cursor-pointer transition-all shrink-0"
            title="Connexion Requise pour l'enregistrement orbital"
          >
            <span className="material-symbols-outlined text-[14px]">lock</span>
            <span className="uppercase font-semibold">Authentification</span>
          </button>
        )}

        {/* Nouveau Projet Button */}
        <button
          type="button"
          onClick={onOpenNewProject}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#00f2fe]/15 hover:bg-[#00f2fe] text-[#00f2fe] hover:text-[#002022] border border-[#00f2fe]/40 transition-all font-mono text-xs uppercase font-bold shadow-[0_0_10px_rgba(0,242,254,0.2)] hover:shadow-[0_0_16px_rgba(0,242,254,0.5)] cursor-pointer shrink-0"
          title="Ajouter une étude de cas ou un projet dans le registre orbital"
        >
          <span className="material-symbols-outlined text-[16px]">add_circle</span>
          <span className="hidden xl:inline">Nouveau Projet</span>
        </button>

        {/* Ambient Space Synthesizer Toggle */}
        <button
          type="button"
          onClick={onToggleAudio}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all font-mono text-xs uppercase cursor-pointer border shrink-0 ${
            audioActive
              ? 'bg-[#1d1f28] border-[#00f2fe] text-[#00f2fe] shadow-[0_0_10px_rgba(0,242,254,0.25)]'
              : 'bg-[#272a33] border-[#3a494b]/40 text-[#849495] hover:text-[#e1e2ee] hover:bg-[#363943]'
          }`}
          title="Activer/Désactiver l'ambiance sonore du cockpit spatial"
        >
          <span className="material-symbols-outlined text-[16px]">
            {audioActive ? 'graphic_eq' : 'volume_off'}
          </span>
          <span className="hidden 2xl:inline">
            Synthesizer: {audioActive ? 'Active' : 'Muted'}
          </span>
        </button>

        {/* Profile Avatar / Pilot Bio */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00dce6] to-[#6ff6ff] p-0.5 flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#00f2fe] transition-all shadow-[0_0_8px_rgba(0,242,254,0.4)] shrink-0"
          title="Profil de l'Ingénieur & Origines"
        >
          <div className="w-full h-full rounded-full bg-[#10131c] flex items-center justify-center text-[#00f2fe] hover:text-[#fff]">
            <span className="material-symbols-outlined text-[18px]">person</span>
          </div>
        </button>
      </div>
    </header>
  );
};

