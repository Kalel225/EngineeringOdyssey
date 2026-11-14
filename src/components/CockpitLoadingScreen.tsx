import React, { useState, useEffect, useCallback } from 'react';

interface CockpitLoadingScreenProps {
  onComplete: () => void;
}

const BOOT_STEPS = [
  { code: 'GLSL.01', label: 'Calibration Photosphère G2V & Couronne Solaire', status: 'PRÊT' },
  { code: 'ATMO.02', label: 'Synthèse Atmosphérique Rayleigh & Limbe Planétaire', status: 'PRÊT' },
  { code: 'KEPL.03', label: 'Éphémérides Képlériennes du Plan Écliptique', status: 'PRÊT' },
  { code: 'SPEC.04', label: 'Spectromètre VIS · IR · RF · LISA-GW', status: 'ACTIF' },
];

export const CockpitLoadingScreen: React.FC<CockpitLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(20);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  const handleFinish = useCallback(() => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 220);
  }, [onComplete]);

  useEffect(() => {
    const stepTimer = setInterval(() => {
      setActiveStepIndex((prev) => (prev < BOOT_STEPS.length - 1 ? prev + 1 : prev));
    }, 90);

    const progTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progTimer);
          return 100;
        }
        return Math.min(100, prev + 14);
      });
    }, 25);

    return () => {
      clearInterval(stepTimer);
      clearInterval(progTimer);
    };
  }, []);

  useEffect(() => {
    if (progress === 100 && !isFadingOut) {
      const doneTimer = setTimeout(() => {
        handleFinish();
      }, 90);
      return () => clearTimeout(doneTimer);
    }
  }, [progress, isFadingOut, handleFinish]);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#020307] text-[#e2e8f0] flex flex-col justify-between p-6 sm:p-10 lg:p-14 select-none overflow-hidden transition-opacity duration-200 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Subtle Astronomical Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:5rem_5rem]" />

      {/* Top Bar: Observatory Header & Skip Trigger */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-500/20 pb-4">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] sm:text-xs tracking-[0.24em] uppercase text-slate-300">
            Engineering Odyssey · Observatoire Écliptique
          </span>
        </div>

        <button
          type="button"
          onClick={handleFinish}
          className="px-4 py-2 min-h-[44px] rounded-lg bg-[#0d1424] hover:bg-[#152036] border border-slate-500/30 font-mono text-[10px] sm:text-xs tracking-[0.18em] uppercase text-slate-200 hover:text-sky-300 flex items-center gap-2 cursor-pointer transition-colors"
        >
          <span>Accéder au Planisphère</span>
          <span className="material-symbols-outlined text-[15px]">north_east</span>
        </button>
      </div>

      {/* Centerpiece: Astrolabe SVG Geometry & Monumental Counter */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-4">
        <div className="relative w-52 h-52 sm:w-64 sm:h-64 lg:w-72 lg:h-72 flex items-center justify-center">
          <svg
            className="absolute inset-0 w-full h-full animate-spin"
            style={{ animationDuration: '32s' }}
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="94" fill="none" stroke="rgba(148,163,184,0.14)" strokeWidth="0.75" />
            <circle
              cx="100"
              cy="100"
              r="94"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="1.1"
              strokeDasharray="60 240"
              strokeLinecap="round"
            />
            <circle
              cx="100"
              cy="100"
              r="76"
              fill="none"
              stroke="rgba(148,163,184,0.1)"
              strokeWidth="0.75"
              strokeDasharray="2 6"
            />
          </svg>

          <svg
            className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] animate-spin"
            style={{ animationDuration: '20s', animationDirection: 'reverse' }}
            viewBox="0 0 200 200"
          >
            <circle
              cx="100"
              cy="100"
              r="82"
              fill="none"
              stroke="rgba(229,169,60,0.3)"
              strokeWidth="1"
              strokeDasharray="30 150"
            />
          </svg>

          <div className="flex flex-col items-center text-center">
            <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.28em] uppercase text-sky-400/80 mb-1">
              Initialisation Optique
            </span>
            <div className="font-display text-6xl sm:text-7xl font-light tracking-tighter text-gradient-metallic leading-none tabular-nums">
              {String(progress).padStart(2, '0')}
              <span className="text-2xl sm:text-3xl text-sky-400 font-normal ml-1">%</span>
            </div>
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-slate-400 mt-2">
              Secteur 12-Vega · 4 Astres
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Pipeline Steps & Progress Line */}
      <div className="relative z-10 flex flex-col gap-3 max-w-3xl w-full mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {BOOT_STEPS.map((step, idx) => {
            const isDone = idx <= activeStepIndex;
            return (
              <div
                key={step.code}
                className={`flex items-center justify-between px-3.5 py-2 rounded-lg border font-mono text-[10px] transition-colors ${
                  isDone
                    ? 'bg-[#0b111e] border-slate-500/25 text-slate-200'
                    : 'bg-transparent border-slate-700/20 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className={isDone ? 'text-sky-400' : 'text-slate-600'}>
                    {step.code}
                  </span>
                  <span className="truncate">{step.label}</span>
                </div>
                <span className={`text-[9px] tracking-widest ${isDone ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {isDone ? step.status : 'ATT'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="w-full h-[2px] bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-400 via-slate-100 to-amber-400 transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
