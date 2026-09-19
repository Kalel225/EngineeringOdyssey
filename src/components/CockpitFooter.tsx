import React from 'react';

interface CockpitFooterProps {
  elevation: number;
  azimuth: number;
  pingMs: number;
}

export const CockpitFooter: React.FC<CockpitFooterProps> = ({
  elevation,
  azimuth,
  pingMs,
}) => {
  return (
    <footer className="hidden lg:flex fixed bottom-0 left-0 right-0 h-16 bg-[#0b0e16]/90 backdrop-blur-xl z-40 px-4 xl:px-6 items-center justify-between border-t border-[#3a494b]/30 shadow-[0_-1px_12px_rgba(0,0,0,0.4)] select-none">
      {/* Left target acquisition info */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#1d1f28] border border-[#00f2fe]/30">
          <span className="material-symbols-outlined text-[#00f2fe] text-[18px] animate-spin" style={{ animationDuration: '8s' }}>
            sync
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] text-[#849495] uppercase tracking-wider">
            Orbital Sweep Reticle
          </span>
          <span className="font-mono text-xs font-semibold text-[#e1e2ee]">
            TARGET ACQUIRED: PERIAPSIS 42,108 KM
          </span>
        </div>
      </div>

      {/* Center angle telemetry */}
      <div className="hidden md:flex items-center gap-6">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] text-[#849495] uppercase">
            ELEVATION
          </span>
          <span className="font-mono text-xs font-semibold text-[#dcb8ff]">
            {elevation >= 0 ? '+' : ''}
            {elevation.toFixed(3)}°
          </span>
        </div>

        <div className="flex items-center gap-1.5 border-l border-[#3a494b]/30 pl-4">
          <span className="font-mono text-[10px] text-[#849495] uppercase">
            AZIMUTH
          </span>
          <span className="font-mono text-xs font-semibold text-[#dcb8ff]">
            {azimuth.toFixed(3)}°
          </span>
        </div>

        <div className="flex items-center gap-1.5 border-l border-[#3a494b]/30 pl-4">
          <span className="font-mono text-[10px] text-[#849495] uppercase">
            PING
          </span>
          <span className="font-mono text-xs font-semibold text-[#00f5d4]">
            {pingMs}ms
          </span>
        </div>
      </div>

      {/* Right feed status */}
      <div className="flex items-center gap-2 text-[#849495] font-mono text-[11px]">
        <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse shadow-[0_0_8px_#00f2fe]" />
        <span className="uppercase tracking-wider">RADAR FEED 60Hz</span>
      </div>
    </footer>
  );
};
