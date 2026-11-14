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
    <footer className="hidden lg:flex fixed bottom-0 left-0 right-0 h-8 bg-[#050811]/95 z-30 px-6 items-center justify-between border-t border-slate-800/80 select-none font-mono text-[10px] tracking-[0.16em] text-slate-400 uppercase tabular-nums">
      <div className="flex items-center gap-4">
        <span className="text-slate-300">Éphéméride Kepler Coplanaire</span>
        <span className="text-slate-700">·</span>
        <span>Secteur 12-Vega</span>
      </div>

      <div className="flex items-center gap-6">
        <span>
          ELV <strong className="text-slate-200 font-normal">{elevation >= 0 ? '+' : ''}{elevation.toFixed(2)}°</strong>
        </span>
        <span>
          AZM <strong className="text-slate-200 font-normal">{azimuth.toFixed(2)}°</strong>
        </span>
        <span>
          SYNC <strong className="text-emerald-400 font-normal">{pingMs}ms</strong>
        </span>
      </div>

      <div className="text-slate-500">
        <span>Observatoire Astrométrique</span>
      </div>
    </footer>
  );
};
