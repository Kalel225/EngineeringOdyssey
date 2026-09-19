import React, { useState, useEffect } from 'react';

interface CockpitLoadingScreenProps {
  onComplete: () => void;
}

export const CockpitLoadingScreen: React.FC<CockpitLoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState<number>(0);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);

  const steps = [
    { threshold: 15, label: 'SYSTÈME PROPULSION // AMORÇAGE DU CŒUR QUANTIQUE' },
    { threshold: 38, label: 'MATRICE ORBITALE // CHARGEMENT DE SOL & DES CORPS CÉLESTES' },
    { threshold: 65, label: 'TÉLÉMÉTRIE VECTEUR // SYNCHRONISATION DES COORDONNÉES STELLAIRES' },
    { threshold: 88, label: 'PROTOCOLES DE SÉCURITÉ // INITIALISATION DU REGISTRE D\'OFFICIER' },
    { threshold: 100, label: 'VERROUILLAGE TRAJECTOIRE // COCKPIT OPÉRATIONNEL' },
  ];

  const bootLogs = [
    'BOOT: Initializing WebGL2 Hardware Accelerator (Three.js r128)...',
    'GPU: 60 FPS Target Buffer Acquired • High Precision Shaders Loaded',
    'ASTRONOMY: Computing Ephemeris Vector for Sector 12-Vega (Sol Base)',
    'PHYSICS: Gravitational Constants & Orbital Resonance Matrices locked',
    'STACK_SCAN: Planet Next.js 15 Edge SSR Cluster detected at 3.48 AU',
    'ASTEROIDS: Mining 5.82 AU Open Source Belt & RFCs repository',
    'DEVOPS_STATION: 8.41 AU Kubernetes Pods & Prometheus stream linked',
    'AVIONICS: Calibrating Reticle Crosshairs & Inertial Navigational Sensors',
    'SYNTHESIZER: Audio Engine loaded (44.1kHz Dual Oscillator Sub-Bass)',
    'CLEARANCE: Officer Access Level 4 ready for manual flight control',
  ];

  useEffect(() => {
    let currentLogIndex = 0;
    const logInterval = setInterval(() => {
      if (currentLogIndex < bootLogs.length) {
        setLogs((prev) => [...prev, bootLogs[currentLogIndex]]);
        currentLogIndex++;
      }
    }, 75);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(logInterval);
          // Brief pause at 100% then quick fade
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              onComplete();
            }, 250);
          }, 100);
          return 100;
        }

        // Fast cyberpunk boot increment
        const increment = Math.floor(Math.random() * 6) + 4;
        const nextVal = Math.min(100, prev + increment);

        // Update step index
        for (let i = steps.length - 1; i >= 0; i--) {
          if (nextVal >= steps[i].threshold) {
            setCurrentStepIndex(i);
            break;
          }
        }

        return nextVal;
      });
    }, 18);

    return () => {
      clearInterval(progressInterval);
      clearInterval(logInterval);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 120);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#04060d] text-[#e1e2ee] flex flex-col justify-between p-4 sm:p-8 select-none transition-all duration-300 overflow-hidden ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background cyber grid & deep radial glow */}
      <div className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(to_right,rgba(0,242,254,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,242,254,0.08)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#00f2fe]/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Header info */}
      <div className="relative z-10 flex items-center justify-between w-full border-b border-[#3a494b]/30 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#00f2fe] animate-ping shadow-[0_0_10px_#00f2fe]" />
          <div className="flex flex-col">
            <span className="font-mono text-xs sm:text-sm font-bold tracking-widest text-[#e0fdff] uppercase">
              ODYSSEY // BOOT_SEQUENCE
            </span>
            <span className="font-mono text-[10px] text-[#849495]">
              BUILD V4.52 • SECTOR 12-VEGA • NAV PROTOCOL ACTIVE
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#191b24]/90 hover:bg-[#272a33] text-[#00f2fe] border border-cyan-500/40 font-mono text-xs uppercase font-semibold transition-all cursor-pointer shadow-[0_0_10px_rgba(0,242,254,0.2)] hover:shadow-[0_0_16px_rgba(0,242,254,0.5)]"
        >
          <span>Passer l'amorce</span>
          <span className="material-symbols-outlined text-[16px]">fast_forward</span>
        </button>
      </div>

      {/* Centerpiece: Holographic Gyro & Radar Boot Visualizer */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto py-6">
        {/* Radar Hologram */}
        <div className="relative w-56 h-56 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Outer Rotating Celestial Ring */}
          <div
            className="absolute inset-0 rounded-full border border-cyan-500/30 border-dashed animate-spin"
            style={{ animationDuration: '30s' }}
          />
          {/* Reverse Outer Ring */}
          <div
            className="absolute inset-2 rounded-full border-t border-b border-[#00f2fe]/40 animate-spin"
            style={{ animationDuration: '14s', animationDirection: 'reverse' }}
          />
          {/* Middle Hex/Coordinate Ring */}
          <div className="absolute inset-6 rounded-full border border-purple-500/25 flex items-center justify-center">
            <div className="absolute top-1 text-[9px] font-mono text-[#00f2fe]/60 tracking-widest">
              N 00°
            </div>
            <div className="absolute bottom-1 text-[9px] font-mono text-[#00f2fe]/60 tracking-widest">
              S 180°
            </div>
            <div className="absolute left-1 text-[9px] font-mono text-[#00f2fe]/60 tracking-widest">
              W 270°
            </div>
            <div className="absolute right-1 text-[9px] font-mono text-[#00f2fe]/60 tracking-widest">
              E 090°
            </div>
          </div>
          {/* Inner Pulsing Radar Core */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#0b0e16]/90 border border-[#00f2fe]/50 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,242,254,0.25)]">
            <span className="material-symbols-outlined text-[#00f2fe] text-[36px] sm:text-[44px] animate-pulse">
              radar
            </span>
            <span className="font-mono text-xs sm:text-sm font-bold text-[#e1e2ee] mt-1">
              {progress}%
            </span>
          </div>

          {/* Sweeping Radar Beam */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(0,242,254,0.35)_360deg)] animate-spin"
            style={{ animationDuration: '4s' }}
          />
        </div>

        {/* Phase Header & Description */}
        <div className="flex flex-col items-center text-center mt-6 max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[11px] text-cyan-400 font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30">
              PHASE 0{currentStepIndex + 1} / 05
            </span>
          </div>
          <h2 className="font-['Space_Grotesk'] text-lg sm:text-2xl font-bold text-[#e1e2ee] tracking-wide">
            {steps[currentStepIndex].label}
          </h2>
          <p className="font-mono text-xs sm:text-sm text-[#849495] mt-1">
            Établissement du réseau orbital • Vecteur de visée Sol vers Station DevOps
          </p>
        </div>

        {/* Main Glowing Progress Bar */}
        <div className="w-full max-w-xl mt-6">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#849495] tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Télémétrie d'Amorçage
            </span>
            <span className="text-[#00f2fe] font-bold tracking-widest">{progress}% CHARGÉ</span>
          </div>

          <div className="w-full h-3 bg-[#191b24] rounded-full overflow-hidden p-0.5 border border-[#3a494b]/40 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#00dce6] via-[#00f2fe] to-[#dcb8ff] rounded-full transition-all duration-150 shadow-[0_0_12px_rgba(0,242,254,0.8)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Terminal Feed */}
      <div className="relative z-10 w-full max-w-3xl mx-auto bg-[#0b0e16]/80 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-[#3a494b]/30 shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-[#3a494b]/30 mb-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00f2fe] text-[16px]">terminal</span>
            <span className="font-mono text-[10px] text-[#849495] uppercase tracking-wider">
              Console de Démarrage Système (STD_LOGS)
            </span>
          </div>
          <span className="font-mono text-[10px] text-emerald-400">STATUS: ACTIVE_FEED</span>
        </div>

        <div className="h-16 overflow-y-auto font-mono text-[11px] text-[#849495] flex flex-col gap-0.5 scrollbar-none">
          {logs.slice(-4).map((log, idx) => (
            <div key={idx} className="flex items-center gap-2 truncate">
              <span className="text-[#00f2fe]/70">{'>'}</span>
              <span className={idx === logs.slice(-4).length - 1 ? 'text-[#e1e2ee]' : 'text-[#849495]'}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
