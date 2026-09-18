import React from 'react';
import { WaypointKey } from '../types';

interface CockpitSidebarProps {
  activeWaypoint: WaypointKey;
  onNavigate: (key: WaypointKey) => void;
  coreIntegrity: number;
  warpHarmonic: string;
}

export const CockpitSidebar: React.FC<CockpitSidebarProps> = ({
  activeWaypoint,
  onNavigate,
  coreIntegrity,
  warpHarmonic,
}) => {
  const navItems = [
    {
      key: 'reset' as WaypointKey,
      label: 'Flight Deck',
      icon: 'radar',
      sublabel: 'Vue Globale',
    },
    {
      key: 'nextjs' as WaypointKey,
      label: 'Orbital Chart',
      icon: 'explore',
      sublabel: 'Planète Next.js',
    },
    {
      key: 'sun' as WaypointKey,
      label: 'Sol Base (Origines)',
      icon: 'wb_sunny',
      sublabel: 'Genèse & Profil',
    },
    {
      key: 'station' as WaypointKey,
      label: 'Station DevOps',
      icon: 'memory',
      sublabel: 'Cloud K8s & Observabilité',
    },
    {
      key: 'asteroids' as WaypointKey,
      label: 'Ceinture Open Source',
      icon: 'public',
      sublabel: 'Contributions & RFCs',
    },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-[#0b0e16]/90 backdrop-blur-xl z-50 flex-col justify-between p-4 border-r border-[#3a494b]/30 select-none shadow-[2px_0_16px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col gap-6">
        {/* Logo and system status */}
        <div className="flex items-center gap-2 px-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00f2fe] animate-pulse shadow-[0_0_8px_#00f2fe]" />
          <span className="font-mono text-sm font-semibold tracking-widest text-[#e0fdff] uppercase">
            Odyssey // Core
          </span>
        </div>

        {/* Waypoints Navigation list */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-2 pb-1 border-b border-[#3a494b]/30">
            <span className="font-mono text-[10px] tracking-wider text-[#849495] uppercase">
              Waypoints // Nav
            </span>
            <span className="font-mono text-[10px] text-[#00f2fe]/70">SYS.LOC</span>
          </div>

          <nav className="flex flex-col gap-1 mt-1">
            {navItems.map((item) => {
              const isActive = activeWaypoint === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onNavigate(item.key)}
                  className={`flex items-center justify-between px-3 py-2 rounded transition-all text-left group ${
                    isActive
                      ? 'bg-[#1d1f28] text-[#00f2fe] font-semibold border-l-2 border-[#00f2fe] shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]'
                      : 'text-[#b9cacb] hover:bg-[#272a33] hover:text-[#e1e2ee] border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-[#00f2fe]' : 'text-[#849495] group-hover:text-[#00f2fe]'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="font-mono text-xs tracking-wide truncate">
                      {item.label}
                    </span>
                  </div>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe] animate-ping" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Core Integrity & Warp Harmonic telemetry footer */}
      <div className="flex flex-col gap-3 bg-[#191b24]/80 p-3 rounded border border-[#3a494b]/30 shadow-inner">
        <div className="flex items-center justify-between text-[#b9cacb] font-mono text-[10px]">
          <span className="tracking-wider">CORE INTEGRITY</span>
          <span className="text-[#00f2fe] text-xs font-bold font-mono">
            {coreIntegrity.toFixed(2)}%
          </span>
        </div>

        <div className="w-full h-1.5 bg-[#32343e] rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#00dce6] to-[#00f2fe] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,242,254,0.6)]"
            style={{ width: `${coreIntegrity}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[#b9cacb] font-mono text-[10px] pt-1 border-t border-[#3a494b]/20">
          <span className="tracking-wider">WARP HARMONIC</span>
          <span className="text-[#dcb8ff] text-xs font-semibold font-mono tracking-wider">
            {warpHarmonic}
          </span>
        </div>
      </div>
    </aside>
  );
};
