import React, { useState, useEffect, useRef } from 'react';
import { ScanMode, CelestialTarget, WaypointKey } from '../types';
import { spaceSynth } from '../utils/audioSynth';

interface CockpitMultispectralScannerProps {
  scanMode: ScanMode;
  onChangeScanMode: (mode: ScanMode) => void;
  targetInfo: CelestialTarget;
  activeWaypoint: WaypointKey;
  onNavigate: (key: WaypointKey) => void;
  onTriggerPulseScan?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const SCAN_MODES: {
  key: ScanMode;
  label: string;
  badge: string;
  range: string;
  icon: string;
  color: string;
  borderClass: string;
}[] = [
  {
    key: 'optical',
    label: 'Optique Visible',
    badge: 'VIS • 380-750nm',
    range: '400 - 700 nm',
    icon: 'visibility',
    color: '#38bdf8',
    borderClass: 'border-sky-400/45',
  },
  {
    key: 'infrared',
    label: 'Infrarouge Thermique',
    badge: 'IR • 3-15µm',
    range: '3.0 - 15.0 µm',
    icon: 'thermostat',
    color: '#e5a93c',
    borderClass: 'border-amber-400/45',
  },
  {
    key: 'radio',
    label: 'Radio Fréquences',
    badge: 'RF • 1.42-28GHz',
    range: '1.42 - 28.0 GHz',
    icon: 'settings_input_antenna',
    color: '#7dd3fc',
    borderClass: 'border-sky-300/45',
  },
  {
    key: 'gravitational',
    label: 'Ondes Gravitationnelles',
    badge: 'GW • 0.1-100mHz',
    range: '0.1 - 100 mHz',
    icon: 'cyclone',
    color: '#a78bfa',
    borderClass: 'border-violet-400/45',
  },
];

export const CockpitMultispectralScanner: React.FC<CockpitMultispectralScannerProps> = ({
  scanMode,
  onChangeScanMode,
  targetInfo,
  activeWaypoint,
  onNavigate,
  onTriggerPulseScan,
  isOpen,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pulseActive, setPulseActive] = useState<boolean>(false);
  const [pulseMessage, setPulseMessage] = useState<string | null>(null);

  const currentProfile = targetInfo.spectralData?.[scanMode];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      phase += 0.04;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Astrometric reticle grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
      ctx.lineWidth = 1;
      const gridStep = 18;
      for (let x = 0; x < width; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Center baseline
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      let strokeColor = '#38bdf8';
      let freqFactor = 1.0;
      let harmonic2 = 0.3;

      if (scanMode === 'infrared') {
        strokeColor = '#e5a93c';
        freqFactor = 0.6;
        harmonic2 = 0.5;
      } else if (scanMode === 'radio') {
        strokeColor = '#7dd3fc';
        freqFactor = 2.4;
        harmonic2 = 0.7;
      } else if (scanMode === 'gravitational') {
        strokeColor = '#a78bfa';
        freqFactor = 0.35;
        harmonic2 = 0.8;
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 1.75;
      ctx.beginPath();

      const midY = height / 2;
      const amp = height * 0.32;

      for (let x = 0; x < width; x++) {
        const normX = x / width;
        let y = midY;

        if (scanMode === 'optical') {
          const w1 = Math.sin(normX * Math.PI * 6 * freqFactor + phase);
          const w2 = Math.sin(normX * Math.PI * 18 + phase * 1.5) * 0.15;
          const noise = (Math.random() - 0.5) * 1.6;
          y = midY + (w1 + w2) * amp * 0.8 + noise;
        } else if (scanMode === 'infrared') {
          const envelope = Math.sin(normX * Math.PI);
          const w1 = Math.sin(normX * Math.PI * 4 + phase) * envelope;
          const w2 = Math.cos(normX * Math.PI * 12 + phase * 2) * harmonic2;
          y = midY + (w1 + w2) * amp * 0.75;
        } else if (scanMode === 'radio') {
          const burst = Math.exp(-Math.pow((normX * 8 - ((phase * 2) % 8)), 2));
          const carrier = Math.sin(normX * Math.PI * 22 * freqFactor + phase * 3);
          y = midY + carrier * amp * 0.45 + burst * amp * 0.6;
        } else if (scanMode === 'gravitational') {
          const w1 = Math.sin(normX * Math.PI * 3 * freqFactor + phase);
          const w2 = Math.cos(normX * Math.PI * 6 + phase * 0.5) * harmonic2;
          y = midY + (w1 + w2) * amp * 0.85;
        }

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Peak marker
      const peakX = (Math.sin(phase * 0.8) * 0.4 + 0.5) * width;
      ctx.fillStyle = strokeColor;
      ctx.fillRect(peakX - 1, 4, 2, height - 8);

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = 'rgba(226, 232, 240, 0.85)';
      ctx.fillText(`FREQ-LOCK: ${(phase * 42.1).toFixed(1)} MHz`, 8, 14);
      ctx.fillText(`PEAK λ: ${currentProfile?.wavelength || 'N/A'}`, width - 135, 14);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [scanMode, isOpen, currentProfile]);

  const handleModeSelect = (mode: ScanMode) => {
    onChangeScanMode(mode);
    spaceSynth.playScanChirp(mode === 'optical' ? 880 : mode === 'infrared' ? 620 : mode === 'radio' ? 1200 : 440);
  };

  const handleTriggerPulse = () => {
    setPulseActive(true);
    setPulseMessage('ÉMISSION D\'UNE IMPULSION MULTISPECTRALE...');
    spaceSynth.playSonarPulse();
    if (onTriggerPulseScan) {
      onTriggerPulseScan();
    }

    setTimeout(() => {
      setPulseMessage('BALAYAGE SPECTROMÉTRIQUE VERROUILLÉ (SNR +64 dB)');
    }, 650);

    setTimeout(() => {
      setPulseActive(false);
      setPulseMessage(null);
    }, 3000);
  };

  if (!isOpen) return null;

  return (
    <div
      id="multispectral-scanner-panel"
      className="fixed inset-y-16 right-0 w-full sm:w-[460px] 2xl:w-[500px] z-50 bg-[#070b14] border-l border-slate-400/20 shadow-[-12px_0_32px_rgba(0,0,0,0.85)] flex flex-col select-none animate-in slide-in-from-right duration-300 pointer-events-auto"
    >
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-400/15 bg-[#0b111e] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#11192a] border border-sky-400/35 flex items-center justify-center text-sky-400">
            <span className="material-symbols-outlined text-[20px]">sensors</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <h2 className="font-display text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wider">
                Scanner Multispectral
              </h2>
            </div>
            <p className="font-mono text-[10px] text-slate-400">
              Sonde Optique • Infrarouge • RF • Gravitationnel
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-lg hover:bg-[#141f35] text-slate-400 hover:text-slate-100 flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-slate-400/20"
          title="Fermer le scanner"
          aria-label="Fermer"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-3 bg-[#090e19] border-b border-slate-400/15 shrink-0">
        {SCAN_MODES.map((m) => {
          const isSelected = scanMode === m.key;
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => handleModeSelect(m.key)}
              className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all cursor-pointer border ${
                isSelected
                  ? `bg-[#121a2b] ${m.borderClass} ring-1 ring-sky-400/25`
                  : 'bg-[#0b101b] border-slate-400/10 hover:bg-[#11192a] hover:border-slate-400/25 text-slate-400'
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px] shrink-0"
                style={{ color: m.color }}
              >
                {m.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div
                  className={`font-mono text-[11px] font-bold uppercase truncate ${
                    isSelected ? 'text-slate-100' : 'text-slate-400'
                  }`}
                >
                  {m.label}
                </div>
                <div className="font-mono text-[9px] text-slate-500 truncate tabular-nums">
                  {m.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Oscilloscope Canvas Card */}
        <div className="bg-[#0b111e] rounded-xl border border-slate-400/15 p-3 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              Oscilloscope Spectrométrique
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#121a2b] text-sky-400 border border-sky-400/25">
              DSP LIVE
            </span>
          </div>

          <div className="relative w-full h-28 bg-[#04070e] rounded-lg border border-slate-400/15 overflow-hidden">
            <canvas
              ref={canvasRef}
              width={420}
              height={112}
              className="w-full h-full block"
            />
          </div>

          {/* Oscilloscope Mini Stats */}
          <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-400/15 text-center font-mono text-[10px] tabular-nums">
            <div>
              <span className="text-slate-400 block">INTENSITÉ</span>
              <span className="text-sky-400 font-bold">
                {currentProfile ? `${currentProfile.intensityDbm.toFixed(1)} dBm` : '-32.0 dBm'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">RAPPORT S/B</span>
              <span className="text-emerald-400 font-bold">
                {currentProfile ? `+${currentProfile.snrDb.toFixed(1)} dB` : '+54.0 dB'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">DENSITÉ DE FLUX</span>
              <span className="text-amber-300 font-bold">
                {currentProfile ? currentProfile.fluxDensity : '1.2 kW/m²'}
              </span>
            </div>
          </div>
        </div>

        {/* Selected Target Status */}
        <div className="bg-[#0b111e] rounded-xl border border-slate-400/15 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
              Cible Télémétrique Verrouillée
            </span>
            <span className="font-mono text-[10px] text-sky-400 font-bold tabular-nums">
              {targetInfo.au.toFixed(2)} AU
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#121a2b] border border-sky-400/30 flex items-center justify-center text-sky-400 shrink-0">
              <span className="material-symbols-outlined text-[22px]">
                {targetInfo.icon || 'public'}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-sm font-bold text-slate-100 truncate">
                {targetInfo.name}
              </h3>
              <p className="font-mono text-[10px] text-slate-400 truncate">
                {targetInfo.category}
              </p>
            </div>
          </div>

          {activeWaypoint !== targetInfo.id && targetInfo.id !== 'reset' && (
            <button
              type="button"
              onClick={() => onNavigate(targetInfo.id as WaypointKey)}
              className="w-full mt-1 py-1.5 px-3 rounded-lg bg-[#121a2b] hover:bg-[#192338] text-sky-300 border border-sky-400/35 text-xs font-mono font-semibold uppercase flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">navigation</span>
              Approche Orbitale ({targetInfo.id})
            </button>
          )}
        </div>

        {/* Current Band Signature Analysis */}
        {currentProfile ? (
          <div className="bg-[#0b111e] rounded-xl border border-slate-400/15 p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-400/15 pb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: currentProfile.colorHex }}
                />
                <span className="font-mono text-xs font-bold text-slate-100">
                  {currentProfile.bandName}
                </span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                λ {currentProfile.wavelength}
              </span>
            </div>

            <p className="font-body text-xs text-slate-300 leading-relaxed">
              {currentProfile.signatureDesc}
            </p>

            {/* Metric badges */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono tabular-nums">
              <div className="bg-[#11192a] p-2 rounded border border-slate-400/15">
                <span className="text-slate-400 text-[10px] block">FRÉQUENCE</span>
                <span className="text-sky-400 font-semibold">{currentProfile.frequency}</span>
              </div>
              <div className="bg-[#11192a] p-2 rounded border border-slate-400/15">
                <span className="text-slate-400 text-[10px] block">
                  {currentProfile.thermalTempK ? 'TEMP. SURFACE' : 'SIGNAL QUAL'}
                </span>
                <span className="text-slate-100 font-semibold">
                  {currentProfile.thermalTempK ? `${currentProfile.thermalTempK} K` : '99.9% COHÉRENT'}
                </span>
              </div>
            </div>

            {/* Spectroscopic Details */}
            <div className="space-y-1.5">
              <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider block">
                Observations Spectroscopiques :
              </span>
              <ul className="space-y-1">
                {currentProfile.details.map((detail, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 font-mono text-[11px] text-slate-300 leading-tight"
                  >
                    <span className="text-sky-400 mt-0.5">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detected Anomalies */}
            {currentProfile.anomalies.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 space-y-1">
                <span className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  Anomalie de Spectre Détectée
                </span>
                {currentProfile.anomalies.map((ano, idx) => (
                  <p key={idx} className="font-mono text-[10px] text-amber-200/90 leading-tight">
                    {ano}
                  </p>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#0b111e] rounded-xl border border-slate-400/15 p-4 text-center font-mono text-xs text-slate-400">
            Sélectionnez un corps céleste pour charger les données spectroscopiques détaillées.
          </div>
        )}

        {/* Orbital Trajectory Summary Card */}
        {targetInfo.orbitalParams && (
          <div className="bg-[#0b111e] rounded-xl border border-slate-400/15 p-3.5 space-y-2">
            <span className="font-mono text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[14px] text-sky-400">
                alt_route
              </span>
              Paramètres Orbitaux Kepler
            </span>
            <div className="grid grid-cols-2 gap-2 font-mono text-[10px] tabular-nums">
              <div className="bg-[#11192a] p-2 rounded border border-slate-400/15">
                <span className="text-slate-400 block">VITESSE ORBITALE</span>
                <span className="text-sky-400 font-bold">
                  {targetInfo.orbitalParams.velocityKmS} km/s
                </span>
              </div>
              <div className="bg-[#11192a] p-2 rounded border border-slate-400/15">
                <span className="text-slate-400 block">PÉRIODE DE RÉVOLUTION</span>
                <span className="text-slate-100 font-bold">
                  {targetInfo.orbitalParams.periodDays} j
                </span>
              </div>
              <div className="bg-[#11192a] p-2 rounded border border-slate-400/15">
                <span className="text-slate-400 block">EXCENTRICITÉ (e)</span>
                <span className="text-violet-300 font-bold">
                  {targetInfo.orbitalParams.eccentricity}
                </span>
              </div>
              <div className="bg-[#11192a] p-2 rounded border border-slate-400/15">
                <span className="text-slate-400 block">INCLINAISON (i)</span>
                <span className="text-emerald-400 font-bold">
                  {targetInfo.orbitalParams.inclinationDeg}°
                </span>
              </div>
            </div>
            <p className="font-mono text-[10px] text-slate-400 italic">
              {targetInfo.orbitalParams.vectorLabel}
            </p>
          </div>
        )}
      </div>

      {/* Pulse Scan Trigger Footer */}
      <div className="p-4 border-t border-slate-400/15 bg-[#0b111e] space-y-2 shrink-0">
        <button
          type="button"
          onClick={handleTriggerPulse}
          disabled={pulseActive}
          className={`w-full py-2.5 px-4 rounded-lg font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
            pulseActive
              ? 'bg-sky-500/25 text-sky-300 border border-sky-400/50'
              : 'bg-sky-400 hover:bg-sky-300 text-[#050810] border border-sky-400'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {pulseActive ? 'radar' : 'wifi_tethering'}
          </span>
          <span>{pulseActive ? 'Émission en cours...' : 'Émission Impulsion Multispectrale'}</span>
        </button>

        {pulseMessage && (
          <div className="font-mono text-[10px] text-sky-300 text-center animate-in fade-in duration-200 tabular-nums">
            {pulseMessage}
          </div>
        )}
      </div>
    </div>
  );
};
