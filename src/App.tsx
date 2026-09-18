import React, { useState, useEffect, useCallback } from 'react';
import { WaypointKey, CelestialTarget, OpenSourceProject, ClusterLog, CelestialType, OfficerUser } from './types';
import { CELESTIAL_TARGETS, INITIAL_OPEN_SOURCE_PROJECTS, INITIAL_CLUSTER_LOGS } from './data/spaceData';
import { spaceSynth } from './utils/audioSynth';
import { ThreeSpaceCanvas } from './components/ThreeSpaceCanvas';
import { CockpitSidebar } from './components/CockpitSidebar';
import { CockpitHeader } from './components/CockpitHeader';
import { CockpitHudOverlay } from './components/CockpitHudOverlay';
import { CockpitModals } from './components/CockpitModals';
import { CockpitFooter } from './components/CockpitFooter';

export default function App() {
  // Start in wide-angle, de-zoomed overview
  const [activeWaypoint, setActiveWaypoint] = useState<WaypointKey>('reset');
  const [targetInfo, setTargetInfo] = useState<CelestialTarget>({
    id: 'reset',
    name: 'Système Solaire Odyssée • Vue Globale',
    subtitle: 'Secteur 12-Vega // Cartographie des Architectures',
    category: 'WIDE SYSTEM SCAN // NOMINAL',
    meta: '4 CORPS CÉLESTES MAJEURS IDENTIFIÉS • CLIQUEZ POUR APPROCHE',
    icon: 'public',
    colorClass: 'bg-[#00f2fe]',
    au: 8.89,
  });
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [freecam, setFreecam] = useState<boolean>(false);
  const [audioActive, setAudioActive] = useState<boolean>(false);

  // Authentication State for adding projects
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('odyssey_officer_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [officerUser, setOfficerUser] = useState<OfficerUser | null>(() => {
    try {
      const saved = localStorage.getItem('odyssey_officer_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [projects, setProjects] = useState<OpenSourceProject[]>(INITIAL_OPEN_SOURCE_PROJECTS);
  const [logs, setLogs] = useState<ClusterLog[]>(INITIAL_CLUSTER_LOGS);

  // Telemetry real-time values
  const [coords, setCoords] = useState({ x: 0.0, y: 30.0, z: 160.0 });
  const [distAU, setDistAU] = useState<number>(8.89);
  const [velocityC, setVelocityC] = useState<number>(0.428);
  const [warpProfile, setWarpProfile] = useState<string>('WARP 0.1 — VUE GLOBALE');
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
    return () => clearTimeout(timer);
  }, []);

  // Handle officer authentication
  const handleAuthenticate = useCallback((officer: OfficerUser) => {
    setIsAuthenticated(true);
    setOfficerUser(officer);
    try {
      localStorage.setItem('odyssey_officer_authenticated', 'true');
      localStorage.setItem('odyssey_officer_user', JSON.stringify(officer));
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
      setTargetInfo({
        id: 'reset',
        name: 'Système Solaire Odyssée • Vue Globale',
        subtitle: 'Secteur 12-Vega // Cartographie des Architectures',
        category: 'WIDE SYSTEM SCAN // NOMINAL',
        meta: '4 CORPS CÉLESTES MAJEURS IDENTIFIÉS • CLIQUEZ POUR APPROCHE',
        icon: 'public',
        colorClass: 'bg-[#00f2fe]',
        au: 8.89,
      });
      setWarpProfile('WARP 0.1 — VUE GLOBALE');
      setCoords({ x: 0.0, y: 30.0, z: 160.0 });
      setDistAU(8.89);
    } else {
      const target = CELESTIAL_TARGETS[key];
      if (target) {
        setTargetInfo(target);
        if (key === 'sun') {
          setWarpProfile('SOLAR DOCK — IMPULSE 0.0');
          setCoords({ x: 0.12, y: 0.05, z: 0.01 });
          setDistAU(0.0);
        } else if (key === 'nextjs') {
          setWarpProfile('WARP 0.4 — SYNCHRONIZED');
          setCoords({ x: 50.0, y: 8.0, z: -40.0 });
          setDistAU(3.48);
        } else if (key === 'asteroids') {
          setWarpProfile('SUBLIGHT 0.22 — ASTEROID FIELD');
          setCoords({ x: 75.0, y: 18.0, z: 75.0 });
          setDistAU(5.82);
        } else if (key === 'station') {
          setWarpProfile('STATION DOCKING VECTOR — ACTIVE');
          setCoords({ x: -100.0, y: 14.0, z: 100.0 });
          setDistAU(8.41);
        }
      }
    }
  }, []);

  // Inspect current target
  const handleInspectTarget = useCallback(() => {
    if (activeWaypoint !== 'reset' && CELESTIAL_TARGETS[activeWaypoint]) {
      setActiveModal(CELESTIAL_TARGETS[activeWaypoint].modalId || 'modal-sun');
    } else {
      setActiveModal('modal-nextjs');
    }
  }, [activeWaypoint]);

  // Hover target update from Three.js
  const handleHoverTarget = useCallback((target: CelestialTarget | null) => {
    if (target) {
      setTargetInfo((prev) => ({
        ...prev,
        name: target.name,
        subtitle: target.subtitle,
        category: target.category || prev.category,
        meta: target.meta || prev.meta,
        icon: target.icon || prev.icon,
      }));
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

  // Add new custom engineering project
  const handleAddProject = useCallback((newProj: {
    title: string;
    type: CelestialType;
    stack: string;
    url: string;
    desc: string;
  }) => {
    const projectItem: OpenSourceProject = {
      id: `proj-${Date.now()}`,
      name: newProj.title,
      title: newProj.title,
      stars: 'NOUVEAU ★',
      pr: 'PR #001 • Merged',
      desc: newProj.desc,
      url: newProj.url || 'https://github.com',
      stack: newProj.stack,
    };
    setProjects((prev) => [projectItem, ...prev]);

    // Also add log event
    setLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour12: false }),
        source: 'gitops.deploy',
        type: 'info',
        message: `Nouveau module orbital '${newProj.title}' synchronisé avec succès !`,
      },
      ...prev.slice(0, 5),
    ]);
  }, []);

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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#10131c] text-[#e1e2ee] font-body select-none">
      {/* 1. Left Cockpit Navigation Sidebar (Hidden on Tablet & Mobile) */}
      <CockpitSidebar
        activeWaypoint={activeWaypoint}
        onNavigate={handleNavigate}
        coreIntegrity={coreIntegrity}
        warpHarmonic={warpHarmonic}
      />

      {/* Main Cockpit Area (On tablet/mobile: 100% full screen, no pl-64 offset) */}
      <div className="w-full h-full relative flex flex-col lg:pl-64">
        {/* 2. Top Cockpit Telemetry Header (Hidden on Tablet & Mobile) */}
        <CockpitHeader
          coordX={coords.x}
          coordY={coords.y}
          distAU={distAU}
          velocityC={velocityC}
          audioActive={audioActive}
          isAuthenticated={isAuthenticated}
          officerUser={officerUser}
          onToggleAudio={handleToggleAudio}
          onOpenNewProject={() => setActiveModal('modal-add-project')}
          onOpenProfile={() => {
            handleNavigate('sun');
            setActiveModal('modal-sun');
          }}
          onOpenAuth={() => setActiveModal('modal-auth')}
        />

        {/* 3. Main 3D Space Viewport & HUD (On tablet/mobile: 0 padding, full cinematic viewport) */}
        <main className="relative w-full h-full overflow-hidden bg-[#04060d] pt-0 pb-0 lg:pt-16 lg:pb-16">
          {/* 3D Three.js Scene */}
          <ThreeSpaceCanvas
            activeWaypoint={activeWaypoint}
            freecam={freecam}
            onSelectTarget={(key) => {
              handleNavigate(key);
              if (CELESTIAL_TARGETS[key]) {
                setActiveModal(CELESTIAL_TARGETS[key].modalId || 'modal-sun');
              }
            }}
            onHoverTarget={handleHoverTarget}
            onUpdateTelemetry={handleUpdateTelemetry}
          />

          {/* Interactive Cockpit HUD Overlay (Hidden on Tablet & Mobile) */}
          <CockpitHudOverlay
            activeWaypoint={activeWaypoint}
            targetInfo={targetInfo}
            coordX={coords.x}
            coordY={coords.y}
            coordZ={coords.z}
            distAU={distAU}
            warpProfile={warpProfile}
            freecam={freecam}
            audioActive={audioActive}
            onNavigate={handleNavigate}
            onInspectTarget={handleInspectTarget}
            onToggleFreecam={handleToggleFreecam}
            onToggleAudio={handleToggleAudio}
          />

          {/* Tablet & Mobile Touch Hint (Fades out automatically) */}
          {showTouchHint && (
            <div
              onClick={() => setShowTouchHint(false)}
              className="lg:hidden fixed top-3 left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-[#00f2fe] text-[11px] font-mono shadow-lg flex items-center gap-2 pointer-events-auto transition-opacity animate-in fade-in"
            >
              <span>⟲ Glisser • ⤢ Pincer • Taper un astre</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTouchHint(false);
                }}
                className="text-[#849495] hover:text-white text-xs cursor-pointer ml-1"
                aria-label="Fermer le guide"
              >
                ✕
              </button>
            </div>
          )}

          {/* Tablet & Mobile Pure Cinematic Floating Overlay */}
          {!cinematicPure ? (
            <div className="lg:hidden fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-md bg-[#0b0e16]/85 backdrop-blur-xl border border-cyan-500/35 rounded-2xl p-2 shadow-[0_4px_28px_rgba(0,0,0,0.65)] flex flex-col gap-1.5 pointer-events-auto">
              {/* Waypoints Selection Chips */}
              <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none px-0.5">
                {[
                  { key: 'sun', label: 'Sol', icon: 'wb_sunny' },
                  { key: 'nextjs', label: 'Next.js', icon: 'rocket_launch' },
                  { key: 'asteroids', label: 'Astéroïdes', icon: 'hub' },
                  { key: 'station', label: 'Station', icon: 'dns' },
                  { key: 'reset', label: 'Système', icon: 'radar' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleNavigate(item.key as WaypointKey)}
                    className={`flex-1 py-1 px-1 rounded-lg font-mono text-[10px] uppercase flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer min-h-[40px] ${
                      activeWaypoint === item.key
                        ? 'bg-cyan-500/25 text-[#00f2fe] border border-cyan-400/60 shadow-[0_0_8px_rgba(0,242,254,0.3)] font-bold'
                        : 'text-[#849495] hover:text-[#e1e2ee] bg-[#191b24]/50 border border-transparent'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[15px]">{item.icon}</span>
                    <span className="truncate max-w-full">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Action bar: Details button, Add Project button, Audio toggle, and Hide dock */}
              <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-cyan-500/20 px-1">
                <div className="flex items-center gap-1.5">
                  {activeWaypoint !== 'reset' && (
                    <button
                      type="button"
                      onClick={handleInspectTarget}
                      className="px-2.5 py-1 rounded-md bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-[#002022] font-mono text-[11px] uppercase font-bold border border-cyan-400/40 flex items-center gap-1 transition-all cursor-pointer min-h-[36px]"
                    >
                      <span>Détails</span>
                      <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                    </button>
                  )}
                  {isAuthenticated && officerUser ? (
                    <button
                      type="button"
                      onClick={() => setActiveModal('modal-auth')}
                      className="px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] uppercase border border-emerald-500/40 flex items-center gap-1 cursor-pointer min-h-[36px]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>{officerUser.callsign}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActiveModal('modal-auth')}
                      className="px-2 py-1 rounded-md bg-[#191b24] text-[#849495] hover:text-[#e1e2ee] font-mono text-[10px] uppercase border border-[#3a494b]/40 flex items-center gap-1 cursor-pointer min-h-[36px]"
                    >
                      <span className="material-symbols-outlined text-[13px]">lock</span>
                      <span>Auth</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveModal('modal-add-project')}
                    className="px-2.5 py-1 rounded-md bg-[#00f2fe] text-[#002022] font-mono text-[11px] uppercase font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(0,242,254,0.3)] cursor-pointer min-h-[36px]"
                  >
                    <span className="material-symbols-outlined text-[14px]">add_circle</span>
                    <span>Projet</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleAudio}
                    className={`w-9 h-9 rounded-md border flex items-center justify-center transition-all cursor-pointer ${
                      audioActive
                        ? 'bg-cyan-500/25 text-[#00f2fe] border-cyan-400/50 shadow-[0_0_8px_rgba(0,242,254,0.3)]'
                        : 'bg-[#191b24] text-[#849495] border-[#3a494b]/40'
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
                    className="w-9 h-9 rounded-md bg-[#191b24] hover:bg-[#272a33] text-[#849495] hover:text-white border border-[#3a494b]/40 flex items-center justify-center transition-all cursor-pointer"
                    title="Mode Cinématique Pur (masquer la barre)"
                    aria-label="Masquer la barre"
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility_off</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCinematicPure(false)}
              className="lg:hidden fixed bottom-4 right-4 z-40 px-3 py-2 rounded-full bg-slate-950/75 backdrop-blur-md border border-cyan-500/35 text-cyan-300 font-mono text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,242,254,0.25)] cursor-pointer hover:bg-slate-900 transition-all min-h-[44px]"
              title="Afficher les contrôles de vol"
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              <span>Contrôles</span>
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

      {/* 5. Mission & Case Study Interactive Modals (With Authentication Support) */}
      <CockpitModals
        activeModal={activeModal}
        projects={projects}
        logs={logs}
        isAuthenticated={isAuthenticated}
        officerUser={officerUser}
        onClose={() => setActiveModal(null)}
        onNavigate={handleNavigate}
        onAddProject={handleAddProject}
        onAuthenticate={handleAuthenticate}
        onLogout={handleLogout}
      />
    </div>
  );
}
