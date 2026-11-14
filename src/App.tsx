import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WaypointKey, CelestialTarget, OpenSourceProject, ClusterLog, CelestialType, OfficerUser, ScanMode } from './types';
import { CELESTIAL_TARGETS, INITIAL_OPEN_SOURCE_PROJECTS, INITIAL_CLUSTER_LOGS } from './data/spaceData';
import { spaceSynth } from './utils/audioSynth';
import { sanitizeExternalUrl, sanitizeTextInput, validateOfficerSession } from './utils/security';
import { ThreeSpaceCanvas } from './components/ThreeSpaceCanvas';
import { CockpitSidebar } from './components/CockpitSidebar';
import { CockpitHeader } from './components/CockpitHeader';
import { CockpitHudOverlay } from './components/CockpitHudOverlay';
import { CockpitMultispectralScanner } from './components/CockpitMultispectralScanner';
import { CockpitModals } from './components/CockpitModals';
import { CockpitFooter } from './components/CockpitFooter';
import { CockpitLoadingScreen } from './components/CockpitLoadingScreen';

export default function App() {
  // Loading screen state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  // Sidebar hidden in a button for large screens
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  // Multispectral Scanner drawer state
  const [scannerOpen, setScannerOpen] = useState<boolean>(false);
  // Active spectral scanning mode
  const [scanMode, setScanMode] = useState<ScanMode>('optical');
  // Dual navigation mode: 'free' (exploration) or 'voyage' (guided scroll storytelling)
  const [navigationMode, setNavigationMode] = useState<'free' | 'voyage'>('free');
  // Realistic projection mode: 'planisphere' (High-angle 2D Ecliptic Chart) or 'observatory' (Oblique perspective)
  const [viewProjection, setViewProjection] = useState<'planisphere' | 'observatory'>('planisphere');
  // Radar shockwave pulse trigger timestamp
  const [pulseTrigger, setPulseTrigger] = useState<number>(0);
  // Currently hovered interactive orbit target
  const [hoveredOrbitTarget, setHoveredOrbitTarget] = useState<CelestialTarget | null>(null);

  // Target card popup visible on hover over solar system elements or on selection
  const [showTargetPopup, setShowTargetPopup] = useState<boolean>(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isOverReticleCardRef = useRef<boolean>(false);

  // Start in wide-angle, de-zoomed overview
  const [activeWaypoint, setActiveWaypoint] = useState<WaypointKey>('reset');
  const [targetInfo, setTargetInfo] = useState<CelestialTarget>({
    id: 'reset',
    name: 'Système Solaire Odyssée • Planisphère Écliptique',
    subtitle: 'Secteur 12-Vega • Éphémérides Képlériennes Réelles',
    category: 'WIDE SYSTEM SCAN • NOMINAL',
    meta: '4 CORPS CÉLESTES MAJEURS IDENTIFIÉS • CLIQUEZ POUR APPROCHE',
    icon: 'public',
    colorClass: 'bg-[#38bdf8]',
    au: 8.89,
  });
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [freecam, setFreecam] = useState<boolean>(false);
  const [audioActive, setAudioActive] = useState<boolean>(false);

  // Validated Officer Session from localStorage (prevents broken/tampered JSON)
  const [officerUser, setOfficerUser] = useState<OfficerUser | null>(() => {
    try {
      const saved = localStorage.getItem('odyssey_officer_user');
      if (!saved) return null;
      return validateOfficerSession(JSON.parse(saved));
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const isAuthFlag = localStorage.getItem('odyssey_officer_authenticated') === 'true';
      const saved = localStorage.getItem('odyssey_officer_user');
      if (!isAuthFlag || !saved) return false;
      return validateOfficerSession(JSON.parse(saved)) !== null;
    } catch {
      return false;
    }
  });

  const [projects, setProjects] = useState<OpenSourceProject[]>(INITIAL_OPEN_SOURCE_PROJECTS);
  const [logs, setLogs] = useState<ClusterLog[]>(INITIAL_CLUSTER_LOGS);

  // Telemetry real-time values
  const [coords, setCoords] = useState({ x: 0.0, y: 195.0, z: 72.0 });
  const [distAU, setDistAU] = useState<number>(8.89);
  const [velocityC, setVelocityC] = useState<number>(0.428);
  const [warpProfile, setWarpProfile] = useState<string>('PLANISPHÈRE ÉCLIPTIQUE — 8.89 AU');
  const [elevation, setElevation] = useState<number>(14.282);
  const [azimuth, setAzimuth] = useState<number>(312.049);
  const [pingMs, setPingMs] = useState<number>(12);
  const [coreIntegrity, setCoreIntegrity] = useState<number>(99.84);
  const [warpHarmonic] = useState<string>('SYNC-0');
  const [cinematicPure, setCinematicPure] = useState<boolean>(false);
  const [showTouchHint, setShowTouchHint] = useState<boolean>(true);

  // Auto-fade touch hint after 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTouchHint(false);
    }, 6000);
    return () => {
      clearTimeout(timer);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // Handle officer authentication
  const handleAuthenticate = useCallback((officer: OfficerUser) => {
    const validated = validateOfficerSession(officer);
    if (!validated) return;
    setIsAuthenticated(true);
    setOfficerUser(validated);
    try {
      localStorage.setItem('odyssey_officer_authenticated', 'true');
      localStorage.setItem('odyssey_officer_user', JSON.stringify(validated));
    } catch {
      // Storage ignored
    }
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setOfficerUser(null);
    try {
      localStorage.removeItem('odyssey_officer_authenticated');
      localStorage.removeItem('odyssey_officer_user');
    } catch {
      // Storage ignored
    }
  }, []);

  // Handle waypoint navigation
  const handleNavigate = useCallback((key: WaypointKey) => {
    setActiveWaypoint(key);

    if (key === 'reset') {
      setShowTargetPopup(false);
      setTargetInfo({
        id: 'reset',
        name: 'Système Solaire Odyssée • Planisphère Écliptique',
        subtitle: 'Secteur 12-Vega • Éphémérides Képlériennes Réelles',
        category: 'WIDE SYSTEM SCAN • NOMINAL',
        meta: '4 CORPS CÉLESTES MAJEURS IDENTIFIÉS • CLIQUEZ POUR APPROCHE',
        icon: 'public',
        colorClass: 'bg-[#38bdf8]',
        au: 8.89,
      });
      setWarpProfile('PLANISPHÈRE ÉCLIPTIQUE — 8.89 AU');
      setCoords({ x: 0.0, y: 195.0, z: 72.0 });
      setDistAU(8.89);
    } else {
      setShowTargetPopup(true);
      const target = CELESTIAL_TARGETS[key];
      if (target) {
        setTargetInfo(target);
        if (key === 'sun') {
          setWarpProfile('SOLAR PHOTOSPHERE — G2V 5778K');
          setCoords({ x: 0.0, y: 0.0, z: 0.0 });
          setDistAU(0.0);
        } else if (key === 'nextjs') {
          setWarpProfile('KEPLER ORBIT LOCK — 3.48 AU');
          setCoords({ x: 50.0, y: 0.0, z: -40.0 });
          setDistAU(3.48);
        } else if (key === 'asteroids') {
          setWarpProfile('MAIN BELT TRANSIT — 5.82 AU');
          setCoords({ x: 75.0, y: 0.0, z: 75.0 });
          setDistAU(5.82);
        } else if (key === 'station') {
          setWarpProfile('STATION DOCKING VECTOR — 8.41 AU');
          setCoords({ x: -100.0, y: 0.0, z: 100.0 });
          setDistAU(8.41);
        }
      }
    }
  }, []);

  // Inspect current target (uses hovered target modal or active waypoint modal)
  const handleInspectTarget = useCallback(() => {
    if (targetInfo?.modalId) {
      setActiveModal(targetInfo.modalId);
    } else if (activeWaypoint !== 'reset' && CELESTIAL_TARGETS[activeWaypoint]) {
      setActiveModal(CELESTIAL_TARGETS[activeWaypoint].modalId || 'modal-sun');
    } else {
      setActiveModal('modal-nextjs');
    }
  }, [activeWaypoint, targetInfo]);

  // Hover target update from Three.js - shows popup on hover over solar system elements
  const handleHoverTarget = useCallback((target: CelestialTarget | null) => {
    if (target) {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setTargetInfo(target);
      setShowTargetPopup(true);
    } else {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        if (!isOverReticleCardRef.current) {
          setShowTargetPopup(false);
        }
      }, 450);
    }
  }, []);

  // Telemetry stream update from Three.js
  const handleUpdateTelemetry = useCallback((x: number, y: number, z: number, au: number) => {
    setCoords({ x, y, z });
    setDistAU(au);
  }, []);

  // Toggle ambient audio synthesizer
  const handleToggleAudio = useCallback(() => {
    const isNowActive = spaceSynth.toggle();
    setAudioActive(isNowActive);
  }, []);

  // Toggle free camera
  const handleToggleFreecam = useCallback(() => {
    setFreecam((prev) => !prev);
  }, []);

  // Toggle between 2D Ecliptic Planisphere and Oblique Observatory view
  const handleToggleViewProjection = useCallback(() => {
    setViewProjection((prev) => (prev === 'planisphere' ? 'observatory' : 'planisphere'));
  }, []);

  // Add new custom engineering project (with strict XSS & URL protocol sanitization)
  const handleAddProject = useCallback((newProj: {
    title: string;
    type: CelestialType;
    stack: string;
    url: string;
    desc: string;
  }) => {
    const safeTitle = sanitizeTextInput(newProj.title, 80) || 'Module Orbital';
    const safeStack = sanitizeTextInput(newProj.stack, 100) || 'TypeScript • Rust';
    const safeDesc = sanitizeTextInput(newProj.desc, 280) || 'Architecture distribuée haute disponibilité.';
    const safeUrl = sanitizeExternalUrl(newProj.url);

    const projectItem: OpenSourceProject = {
      id: `proj-${Date.now()}`,
      name: safeTitle,
      title: safeTitle,
      stars: 'NOUVEAU ★',
      pr: 'PR #001 • Merged',
      desc: safeDesc,
      url: safeUrl,
      stack: safeStack,
    };
    setProjects((prev) => [projectItem, ...prev]);

    // Also add log event
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour12: false }),
        source: 'gitops.deploy',
        type: 'info',
        message: `Nouveau module orbital '${safeTitle}' synchronisé avec succès !`,
      },
      ...prev.slice(0, 5),
    ]);
  }, []);

  const [mobileCardExpanded, setMobileCardExpanded] = useState<boolean>(true);

  // Subtle telemetry ambient drift ticker
  useEffect(() => {
    const interval = setInterval(() => {
      setElevation((prev) => +(prev + (Math.random() - 0.5) * 0.008).toFixed(3));
      setAzimuth((prev) => +(prev + (Math.random() - 0.5) * 0.01).toFixed(3));
      setPingMs((prev) => Math.max(8, Math.min(24, Math.floor(prev + (Math.random() - 0.5) * 2))));
      setVelocityC((prev) => +(0.428 + (Math.random() - 0.5) * 0.004).toFixed(3));
      setCoreIntegrity((prev) => +(99.84 + (Math.random() - 0.5) * 0.03).toFixed(2));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  // PC Keyboard Shortcuts for fast, intuitive desktop navigation
  useEffect(() => {
    const order: WaypointKey[] = ['reset', 'sun', 'nextjs', 'asteroids', 'station'];
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Escape') {
        if (activeModal) {
          setActiveModal(null);
        } else if (scannerOpen) {
          setScannerOpen(false);
        } else if (sidebarOpen) {
          setSidebarOpen(false);
        } else if (activeWaypoint !== 'reset') {
          handleNavigate('reset');
        }
        return;
      }

      if (activeModal) return;

      if (e.key === 'ArrowRight') {
        const idx = order.indexOf(activeWaypoint);
        const next = order[(idx + 1) % order.length];
        spaceSynth.playOrbitLock();
        handleNavigate(next);
      } else if (e.key === 'ArrowLeft') {
        const idx = order.indexOf(activeWaypoint);
        const prev = order[(idx - 1 + order.length) % order.length];
        spaceSynth.playOrbitLock();
        handleNavigate(prev);
      } else if (e.key === '0') {
        handleNavigate('reset');
      } else if (e.key === '1') {
        handleNavigate('sun');
      } else if (e.key === '2') {
        handleNavigate('nextjs');
      } else if (e.key === '3') {
        handleNavigate('asteroids');
      } else if (e.key === '4') {
        handleNavigate('station');
      } else if (e.key === 's' || e.key === 'S') {
        setScannerOpen((prev) => !prev);
      } else if (e.key === 'p' || e.key === 'P') {
        setViewProjection((prev) => (prev === 'planisphere' ? 'observatory' : 'planisphere'));
      } else if (e.key === 'v' || e.key === 'V') {
        setNavigationMode((prev) => {
          const next = prev === 'free' ? 'voyage' : 'free';
          if (next === 'voyage' && activeWaypoint === 'reset') {
            handleNavigate('sun');
          }
          return next;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeWaypoint, activeModal, scannerOpen, sidebarOpen, handleNavigate]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#020307] text-[#e1e2ee] font-body select-none">
      {/* 0. Cockpit Boot & Loading Sequence */}
      {isLoading && (
        <CockpitLoadingScreen onComplete={() => setIsLoading(false)} />
      )}

      {/* 1. Left Cockpit Navigation Sidebar (Hidden on Tablet & Mobile, toggleable drawer on Desktop) */}
      <CockpitSidebar
        activeWaypoint={activeWaypoint}
        onNavigate={(key) => {
          handleNavigate(key);
        }}
        coreIntegrity={coreIntegrity}
        warpHarmonic={warpHarmonic}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onReboot={() => setIsLoading(true)}
        onOpenScanner={() => setScannerOpen(true)}
      />

      {/* Main Cockpit Area (100% full screen, no fixed offset) */}
      <div className="w-full h-full relative flex flex-col">
        {/* 2. Top Cockpit Telemetry Header (Hidden on Tablet & Mobile) */}
        <CockpitHeader
          coordX={coords.x}
          coordY={coords.y}
          distAU={distAU}
          velocityC={velocityC}
          audioActive={audioActive}
          isAuthenticated={isAuthenticated}
          officerUser={officerUser}
          sidebarOpen={sidebarOpen}
          scannerOpen={scannerOpen}
          navigationMode={navigationMode}
          viewProjection={viewProjection}
          scanMode={scanMode}
          onToggleNavigationMode={() =>
            setNavigationMode((prev) => {
              const next = prev === 'free' ? 'voyage' : 'free';
              if (next === 'voyage' && activeWaypoint === 'reset') {
                handleNavigate('sun');
              }
              return next;
            })
          }
          onToggleViewProjection={handleToggleViewProjection}
          onChangeScanMode={setScanMode}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onToggleScanner={() => setScannerOpen((prev) => !prev)}
          onToggleAudio={handleToggleAudio}
          onOpenNewProject={() => setActiveModal('modal-add-project')}
          onOpenProfile={() => {
            handleNavigate('sun');
            setActiveModal('modal-sun');
          }}
          onOpenAuth={() => setActiveModal('modal-auth')}
        />

        {/* 3. Main Space Viewport & HUD */}
        <main className="relative w-full h-full overflow-hidden bg-[#020307]">
          {/* Realistic Coplanar Solar System & Planisphere Canvas */}
          <ThreeSpaceCanvas
            activeWaypoint={activeWaypoint}
            freecam={freecam}
            scanMode={scanMode}
            navigationMode={navigationMode}
            viewProjection={viewProjection}
            pulseTrigger={pulseTrigger}
            onSelectTarget={(key) => {
              if (activeWaypoint === key && key !== 'reset' && CELESTIAL_TARGETS[key]) {
                setActiveModal(CELESTIAL_TARGETS[key].modalId || 'modal-sun');
              } else {
                handleNavigate(key);
              }
            }}
            onHoverTarget={handleHoverTarget}
            onHoverOrbit={(target) => setHoveredOrbitTarget(target)}
            onUpdateTelemetry={handleUpdateTelemetry}
          />

          {/* Anamorphic Optical Vignette Overlay */}
          <div className="absolute inset-0 pointer-events-none cinematic-vignette z-10" />

          {/* Interactive Cockpit HUD Overlay (Hidden on Tablet & Mobile) */}
          <CockpitHudOverlay
            activeWaypoint={activeWaypoint}
            targetInfo={targetInfo}
            showTargetPopup={showTargetPopup}
            coordX={coords.x}
            coordY={coords.y}
            coordZ={coords.z}
            distAU={distAU}
            warpProfile={warpProfile}
            freecam={freecam}
            audioActive={audioActive}
            scanMode={scanMode}
            navigationMode={navigationMode}
            viewProjection={viewProjection}
            hoveredOrbitTarget={hoveredOrbitTarget}
            scannerOpen={scannerOpen}
            onToggleScanner={() => setScannerOpen((prev) => !prev)}
            onToggleViewProjection={handleToggleViewProjection}
            onChangeScanMode={setScanMode}
            onNavigate={handleNavigate}
            onInspectTarget={handleInspectTarget}
            onCloseTargetPopup={() => setShowTargetPopup(false)}
            onCardMouseEnter={() => {
              isOverReticleCardRef.current = true;
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
                hoverTimeoutRef.current = null;
              }
            }}
            onCardMouseLeave={() => {
              isOverReticleCardRef.current = false;
              setShowTargetPopup(false);
            }}
            onToggleFreecam={handleToggleFreecam}
            onToggleAudio={handleToggleAudio}
          />

          {/* Multispectral Scanner Drawer HUD */}
          <CockpitMultispectralScanner
            isOpen={scannerOpen}
            onClose={() => setScannerOpen(false)}
            scanMode={scanMode}
            onChangeScanMode={setScanMode}
            targetInfo={targetInfo}
            activeWaypoint={activeWaypoint}
            onNavigate={handleNavigate}
            onTriggerPulseScan={() => setPulseTrigger(Date.now())}
          />

          {/* Tablet & Mobile Top Studio Bar (lg:hidden) */}
          {!cinematicPure && (
            <div className="lg:hidden fixed top-3 inset-x-3 z-40 obsidian-glass rounded-2xl px-3 py-2 flex items-center justify-between gap-2 pointer-events-auto">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="w-10 h-10 rounded-xl bg-[#0d1422] hover:bg-[#141f35] border border-slate-400/15 text-slate-100 flex items-center justify-center shrink-0 cursor-pointer"
                  aria-label="Ouvrir l'index"
                >
                  <span className="material-symbols-outlined text-[18px]">drag_handle</span>
                </button>
                <div className="flex flex-col min-w-0">
                  <span className="font-display text-xs font-bold tracking-wider uppercase text-slate-100 truncate">
                    Odyssey
                  </span>
                  <span className="font-mono text-[9px] text-sky-400 uppercase truncate tabular-nums">
                    {activeWaypoint === 'reset'
                      ? `${distAU.toFixed(1)} AU • ${viewProjection === 'planisphere' ? 'Planisphère 2D' : 'Observatoire'}`
                      : targetInfo.id}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {/* 2D Planisphere vs Oblique Observatory Toggle on Tablet/Mobile */}
                <button
                  type="button"
                  onClick={handleToggleViewProjection}
                  className={`px-2.5 h-9 rounded-xl font-mono text-[9px] tracking-wider uppercase flex items-center gap-1 border cursor-pointer transition-all ${
                    viewProjection === 'planisphere'
                      ? 'bg-sky-400/15 text-sky-300 border-sky-400/40 font-bold'
                      : 'bg-[#0d1422] text-slate-300 border-slate-400/15'
                  }`}
                  title="Basculer entre Planisphère 2D et Vue Observatoire"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {viewProjection === 'planisphere' ? 'explore' : 'visibility'}
                  </span>
                  <span className="hidden sm:inline">
                    {viewProjection === 'planisphere' ? '2D Plan' : 'Oblique'}
                  </span>
                </button>

                {/* Voyage vs Free Mode Toggle on Tablet/Mobile */}
                <button
                  type="button"
                  onClick={() =>
                    setNavigationMode((prev) => {
                      const next = prev === 'free' ? 'voyage' : 'free';
                      if (next === 'voyage' && activeWaypoint === 'reset') {
                        handleNavigate('sun');
                      }
                      return next;
                    })
                  }
                  className={`px-2.5 h-9 rounded-xl font-mono text-[9px] tracking-wider uppercase flex items-center gap-1 border cursor-pointer transition-all ${
                    navigationMode === 'voyage'
                      ? 'bg-sky-400/20 text-sky-300 border-sky-400/45 font-bold'
                      : 'bg-[#0d1422] text-slate-300 border-slate-400/15'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {navigationMode === 'voyage' ? 'movie_filter' : '3d_rotation'}
                  </span>
                  <span className="hidden sm:inline">
                    {navigationMode === 'voyage' ? 'Voyage' : 'Libre'}
                  </span>
                </button>

                {/* Quick Spectral Cycle Button */}
                <button
                  type="button"
                  onClick={() => {
                    const modes: ScanMode[] = ['optical', 'infrared', 'radio', 'gravitational'];
                    const next = modes[(modes.indexOf(scanMode) + 1) % modes.length];
                    setScanMode(next);
                  }}
                  className="px-2.5 h-9 rounded-xl bg-[#0d1422] border border-slate-400/15 font-mono text-[9px] text-slate-100 uppercase flex items-center gap-1.5 cursor-pointer"
                  title="Changer de bande spectrale"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>{scanMode.slice(0, 3).toUpperCase()}</span>
                </button>

                {/* Scanner Drawer Toggle */}
                <button
                  type="button"
                  onClick={() => setScannerOpen((prev) => !prev)}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center cursor-pointer ${
                    scannerOpen
                      ? 'bg-sky-400/20 text-sky-300 border-sky-400/50'
                      : 'bg-[#0d1422] text-slate-300 border-slate-400/15'
                  }`}
                  aria-label="Scanner Multispectral"
                >
                  <span className="material-symbols-outlined text-[17px]">sensors</span>
                </button>
              </div>
            </div>
          )}

          {/* Tablet & Mobile Touch Hint (Fades out automatically) */}
          {showTouchHint && (
            <div
              onClick={() => setShowTouchHint(false)}
              className="lg:hidden fixed top-16 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-xl obsidian-glass text-sky-300 text-[10px] font-mono shadow-lg flex items-center gap-2 pointer-events-auto transition-opacity animate-in fade-in"
            >
              <span>⟲ 1 Doigt: Orbite • ⤢ 2 Doigts: Zoom • Taper un astre</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTouchHint(false);
                }}
                className="text-white/50 hover:text-white text-xs cursor-pointer ml-1"
                aria-label="Fermer le guide"
              >
                ✕
              </button>
            </div>
          )}

          {/* Tablet & Mobile Bottom Controls + Active Chapter Showcase Card */}
          {!cinematicPure ? (
            <div className="lg:hidden fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-lg flex flex-col gap-2 pointer-events-auto">
              {/* Responsive Chapter Card when a celestial body is selected on Tablet/Mobile */}
              {activeWaypoint !== 'reset' && (
                <div className="obsidian-glass rounded-2xl p-3.5 border border-slate-400/20 flex flex-col gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      onClick={handleInspectTarget}
                      className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-xl bg-sky-400/12 border border-sky-400/35 flex items-center justify-center text-sky-400 shrink-0">
                        <span className="material-symbols-outlined text-[18px]">
                          {targetInfo.icon || 'public'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-[8px] tracking-[0.2em] text-sky-400 uppercase block truncate">
                          {targetInfo.category}
                        </span>
                        <h3 className="font-display text-sm font-bold text-slate-100 truncate">
                          {targetInfo.name}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setMobileCardExpanded((prev) => !prev)}
                        className="w-8 h-8 rounded-lg bg-[#0d1422] text-slate-400 flex items-center justify-center cursor-pointer"
                        aria-label="Réduire ou agrandir"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {mobileCardExpanded ? 'expand_more' : 'expand_less'}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleNavigate('reset')}
                        className="w-8 h-8 rounded-lg bg-[#0d1422] text-slate-400 flex items-center justify-center cursor-pointer"
                        aria-label="Retour Vue Globale"
                      >
                        <span className="material-symbols-outlined text-[15px]">close</span>
                      </button>
                    </div>
                  </div>

                  {mobileCardExpanded && (
                    <>
                      <p className="font-mono text-[10px] text-slate-300 leading-snug line-clamp-2 tabular-nums">
                        {targetInfo.subtitle} • {targetInfo.au.toFixed(2)} AU
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleInspectTarget}
                          className="flex-1 py-2 px-3 rounded-xl bg-sky-400 hover:bg-sky-300 text-[#050810] font-mono text-[10px] font-bold tracking-[0.14em] uppercase flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
                        >
                          <span>Étude de Cas Complète</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Bottom Navigation Dock */}
              <div className="obsidian-glass rounded-2xl p-2 flex flex-col gap-1.5">
                {/* Waypoints Selection Chips */}
                <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none px-0.5">
                  {[
                    { key: 'reset', label: 'Système', icon: 'public' },
                    { key: 'sun', label: '00 Sol', icon: 'wb_sunny' },
                    { key: 'nextjs', label: '01 Next', icon: 'rocket_launch' },
                    { key: 'asteroids', label: '02 Open', icon: 'hub' },
                    { key: 'station', label: '03 Cloud', icon: 'dns' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        handleNavigate(item.key as WaypointKey);
                        setMobileCardExpanded(true);
                      }}
                      className={`flex-1 py-1.5 px-1 rounded-xl font-mono text-[9px] uppercase flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer min-h-[44px] ${
                        activeWaypoint === item.key
                          ? 'bg-sky-400/15 text-sky-300 border border-sky-400/45 font-bold'
                          : 'text-slate-400 hover:text-slate-100 bg-[#0b101b] border border-transparent'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
                      <span className="truncate max-w-full">{item.label}</span>
                    </button>
                  ))}
                </div>

                {/* Action bar */}
                <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-400/15 px-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setActiveModal('modal-auth')}
                      className={`px-2.5 h-9 rounded-xl font-mono text-[10px] uppercase border flex items-center gap-1 cursor-pointer ${
                        isAuthenticated && officerUser
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35'
                          : 'bg-[#0d1422] text-slate-300 border-slate-400/15'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {isAuthenticated ? 'verified_user' : 'lock'}
                      </span>
                      <span>{isAuthenticated && officerUser ? officerUser.callsign : 'Accès'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModal('modal-add-project')}
                      className="px-2.5 h-9 rounded-xl bg-[#11192a] hover:bg-sky-400 text-slate-100 hover:text-[#050810] font-mono text-[10px] uppercase font-bold flex items-center gap-1 border border-slate-400/20 cursor-pointer transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">add</span>
                      <span>Déployer</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setIsLoading(true)}
                      className="w-9 h-9 rounded-xl bg-[#0d1422] text-sky-400 border border-slate-400/15 flex items-center justify-center transition-all cursor-pointer"
                      title="Relancer l'amorce cockpit (Loading Screen)"
                      aria-label="Amorce cockpit"
                    >
                      <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleAudio}
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                        audioActive
                          ? 'bg-sky-400/20 text-sky-300 border-sky-400/50'
                          : 'bg-[#0d1422] text-slate-400 border-slate-400/15'
                      }`}
                      title="Ambiance audio cockpit"
                      aria-label="Ambiance audio"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {audioActive ? 'graphic_eq' : 'volume_off'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCinematicPure(true)}
                      className="w-9 h-9 rounded-xl bg-[#0d1422] text-slate-400 hover:text-slate-100 border border-slate-400/15 flex items-center justify-center transition-all cursor-pointer"
                      title="Mode Cinématique Pur (masquer l'interface)"
                      aria-label="Masquer l'interface"
                    >
                      <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCinematicPure(false)}
              className="lg:hidden fixed bottom-4 right-4 z-40 px-3.5 py-2.5 rounded-xl obsidian-glass text-sky-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer min-h-[44px]"
              title="Afficher les contrôles de vol"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Interface</span>
            </button>
          )}
        </main>

        {/* 4. Bottom Cockpit Telemetry Footer (Hidden on Tablet & Mobile) */}
        <CockpitFooter
          elevation={elevation}
          azimuth={azimuth}
          pingMs={pingMs}
        />
      </div>

      {/* 5. Mission & Case Study Interactive Modals (With Security & Contact Support) */}
      <CockpitModals
        activeModal={activeModal}
        projects={projects}
        logs={logs}
        isAuthenticated={isAuthenticated}
        officerUser={officerUser}
        onClose={() => setActiveModal(null)}
        onOpenContact={() => setActiveModal('modal-contact')}
        onNavigate={handleNavigate}
        onAddProject={handleAddProject}
        onAuthenticate={handleAuthenticate}
        onLogout={handleLogout}
      />
    </div>
  );
}
