import React, { useState } from 'react';
import { CelestialType, OpenSourceProject, ClusterLog, WaypointKey, OfficerUser } from '../types';

interface CockpitModalsProps {
  activeModal: string | null;
  projects: OpenSourceProject[];
  logs: ClusterLog[];
  isAuthenticated: boolean;
  officerUser: OfficerUser | null;
  onClose: () => void;
  onNavigate: (key: WaypointKey) => void;
  onAddProject: (newProject: {
    title: string;
    type: CelestialType;
    stack: string;
    url: string;
    desc: string;
  }) => void;
  onAuthenticate: (officer: OfficerUser) => void;
  onLogout: () => void;
}

export const CockpitModals: React.FC<CockpitModalsProps> = ({
  activeModal,
  projects,
  logs,
  isAuthenticated,
  officerUser,
  onClose,
  onNavigate,
  onAddProject,
  onAuthenticate,
  onLogout,
}) => {
  // Add project form state
  const [formData, setFormData] = useState({
    title: '',
    type: 'planet' as CelestialType,
    stack: '',
    url: '',
    desc: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'syncing' | 'success'>('idle');

  // Authentication form state
  const [authEmail, setAuthEmail] = useState('alexandre.vance@odyssey-core.space');
  const [authPasscode, setAuthPasscode] = useState('ODYSSEY-2026');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Contact form state
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  if (!activeModal) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || !authPasscode.trim()) {
      setAuthError('Veuillez renseigner un identifiant et un code d’habilitation.');
      return;
    }
    setAuthLoading(true);
    setAuthError(null);

    setTimeout(() => {
      setAuthLoading(false);
      onAuthenticate({
        name: 'Alexandre Vance',
        rank: 'Commandant de Mission',
        callsign: 'ODYSSEY-LEAD',
        clearanceLevel: 4,
        email: authEmail.trim(),
      });
    }, 450);
  };

  const handleInstantAuth = () => {
    setAuthLoading(true);
    setTimeout(() => {
      setAuthLoading(false);
      onAuthenticate({
        name: 'Alexandre Vance',
        rank: 'Commandant de Mission',
        callsign: 'ODYSSEY-LEAD',
        clearanceLevel: 4,
        email: 'alexandre.vance@odyssey-core.space',
      });
    }, 200);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthError('Habilitation requise pour valider et déployer ce projet.');
      return;
    }
    if (!formData.title.trim() || !formData.stack.trim()) return;

    setFormStatus('syncing');
    setTimeout(() => {
      onAddProject(formData);
      setFormStatus('success');
      setTimeout(() => {
        setFormStatus('idle');
        setFormData({
          title: '',
          type: 'planet',
          stack: '',
          url: '',
          desc: '',
        });
        onClose();
        if (formData.type === 'asteroid') onNavigate('asteroids');
        else if (formData.type === 'station') onNavigate('station');
        else if (formData.type === 'sun') onNavigate('sun');
        else onNavigate('nextjs');
      }, 700);
    }, 600);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactStatus('sending');
    setTimeout(() => {
      setContactStatus('sent');
      setTimeout(() => {
        setContactStatus('idle');
        setContactMessage('');
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-300"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 1. SOL BASE MODAL (HERO & BIO DE L'INGENIEUR) */}
      {activeModal === 'modal-sun' && (
        <div className="w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-[#0b0e16]/95 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-amber-500/40 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between pb-4 border-b border-[#32343e] gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.3)] shrink-0">
                <span className="material-symbols-outlined text-amber-400 text-[24px] sm:text-[26px]">
                  wb_sunny
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] sm:text-xs text-amber-400 uppercase tracking-widest font-semibold">
                  Base Stellaire // Genèse & Profil de l'Ingénieur (0.0 AU)
                </span>
                <h2 className="font-['Space_Grotesk'] text-lg sm:text-2xl font-bold text-[#e1e2ee]">
                  Alexandre Vance • Architecte Système
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg hover:bg-[#272a33] flex items-center justify-center text-[#849495] hover:text-[#fff] transition-colors cursor-pointer shrink-0"
              aria-label="Fermer la fenêtre"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2 flex flex-col gap-4">
              <p className="font-body text-sm sm:text-base text-[#b9cacb] leading-relaxed">
                Bienvenue à la base de départ de l'Odyssée. Passionné par l'architecture logicielle de haute volée, j'ai forgé mes armes sur les fondations immuables de l'informatique théorique avant d'explorer les confins du cloud distribué moderne et des applications Edge temps-réel.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#191b24]/80 p-4 rounded-xl border border-amber-500/20">
                <div>
                  <span className="font-mono text-xs text-amber-400 uppercase font-semibold block mb-1">
                    Origines Fondamentales
                  </span>
                  <span className="font-body text-xs text-[#e1e2ee]">
                    C / C++ • Algorithmes de Tri & Arbres B+ • Protocoles TCP/UDP • Assembleur • Moteurs de rendu WebGL / Three.js
                  </span>
                </div>
                <div>
                  <span className="font-mono text-xs text-amber-400 uppercase font-semibold block mb-1">
                    Philosophie de Conception
                  </span>
                  <span className="font-body text-xs text-[#e1e2ee]">
                    Sobriété computationnelle, résilience aux pannes, interfaces à latence zéro et craft typographique millimétré.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-[#0b0e16] font-mono text-xs uppercase font-bold transition-all border border-amber-400/40 cursor-pointer min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-[16px]">mail</span>
                  Établir Contact Comms
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigate('nextjs');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#272a33] hover:bg-[#363943] text-[#e1e2ee] font-mono text-xs uppercase font-semibold transition-all border border-[#3a494b]/40 cursor-pointer min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#00f2fe]">
                    rocket_launch
                  </span>
                  Cap sur Planète Next.js ↗
                </button>
              </div>
            </div>

            {/* Right sidebar pilot stats */}
            <div className="bg-[#191b24]/90 p-5 rounded-xl border border-amber-500/25 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <span className="font-mono text-xs text-amber-400 uppercase tracking-wider font-semibold">
                  Paramètres Pilote
                </span>
                <div className="flex items-center justify-between text-[#e1e2ee] font-mono text-xs py-1.5 border-b border-[#32343e]">
                  <span className="text-[#849495]">Expérience</span>
                  <span className="text-amber-400 font-bold">8+ Ans</span>
                </div>
                <div className="flex items-center justify-between text-[#e1e2ee] font-mono text-xs py-1.5 border-b border-[#32343e]">
                  <span className="text-[#849495]">Commits Sol</span>
                  <span className="text-amber-400 font-bold">4,920+</span>
                </div>
                <div className="flex items-center justify-between text-[#e1e2ee] font-mono text-xs py-1.5">
                  <span className="text-[#849495]">Statut Odyssée</span>
                  <span className="text-[#00f2fe] font-bold">En Orbite</span>
                </div>
              </div>

              <div className="mt-4 p-2.5 rounded-lg bg-[#10131c] font-mono text-[11px] text-amber-300 border border-amber-500/30 text-center">
                VECTEUR_00 : FONDATIONS ÉPROUVÉES
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PLANÈTE NEXT.JS MODAL (ARCHITECTURE & GLASS DASHBOARD) */}
      {activeModal === 'modal-nextjs' && (
        <div className="w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-slate-900/90 backdrop-blur-2xl border border-cyan-500/40 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between pb-4 border-b border-cyan-500/25 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-400/40 shadow-[0_0_12px_rgba(0,242,254,0.3)] shrink-0">
                <span className="material-symbols-outlined text-[#00f2fe] text-[24px] sm:text-[26px]">
                  rocket_launch
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] sm:text-xs text-[#00f2fe] uppercase tracking-wider font-semibold">
                  Étude de Cas Glassmorphique // Planète Next.js (3.48 AU)
                </span>
                <h2 className="font-['Space_Grotesk'] text-lg sm:text-2xl font-bold text-[#e1e2ee]">
                  Architecture Next.js 15 Enterprise & Edge Streaming SSR
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg hover:bg-[#272a33] flex items-center justify-center text-[#849495] hover:text-[#fff] transition-colors cursor-pointer shrink-0"
                aria-label="Fermer la fenêtre"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            {/* Col 1: Tech Stack */}
            <div className="flex flex-col gap-2 bg-slate-950/70 p-4 rounded-xl border border-cyan-500/20">
              <span className="font-mono text-xs text-[#00f2fe] uppercase font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">layers</span>
                Pile Technique
              </span>
              <ul className="flex flex-col gap-1.5 font-mono text-xs text-[#e1e2ee] mt-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe]" />
                  Next.js 15 (App Router)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe]" />
                  React Server Actions & Suspense
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe]" />
                  Edge Middleware (Geo-routing)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe]" />
                  Tailwind CSS & Design Tokens
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe]" />
                  Vercel Global Edge Network
                </li>
              </ul>
            </div>

            {/* Col 2: Engineering Challenges */}
            <div className="flex flex-col gap-2 bg-slate-950/70 p-4 rounded-xl border border-cyan-500/20">
              <span className="font-mono text-xs text-[#dcb8ff] uppercase font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">shield</span>
                Défis Résolus
              </span>
              <p className="font-body text-xs text-[#b9cacb] leading-relaxed">
                Hydratation sans drift (0-drift), invalidation du cache distribué sous 20ms via tags, et garantie d'un Time To First Byte (TTFB) de 45ms sur 140 POPs Edge mondiaux.
              </p>
              <div className="mt-1 font-mono text-[11px] text-[#dcb8ff] bg-purple-950/50 p-2 rounded border border-purple-500/30">
                TAGS PURGE • ZERO WATERFALL
              </div>
            </div>

            {/* Col 3: Impact */}
            <div className="flex flex-col gap-2 bg-slate-950/70 p-4 rounded-xl border border-cyan-500/20">
              <span className="font-mono text-xs text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">trending_up</span>
                Mesures d'Impact
              </span>
              <div className="flex flex-col gap-2">
                <div>
                  <span className="font-['Space_Grotesk'] text-3xl font-bold text-[#00f2fe]">
                    +340%
                  </span>
                  <span className="font-body text-xs text-[#849495] block">
                    Conversions checkout mondial
                  </span>
                </div>
                <div className="flex items-center justify-between text-[#e1e2ee] font-mono text-xs py-1 border-t border-cyan-500/20">
                  <span className="text-[#849495]">TTFB Moyen</span>
                  <span className="text-[#00f2fe] font-bold">45 ms</span>
                </div>
                <div className="flex items-center justify-between text-[#e1e2ee] font-mono text-xs py-1 border-t border-cyan-500/20">
                  <span className="text-[#849495]">Lighthouse Score</span>
                  <span className="text-emerald-400 font-bold">100 / 100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-cyan-500/25">
            <span className="font-mono text-xs text-[#849495]">
              ORBITAL ID: NX-9021 • HULL INTEGRITY VERIFIED
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <a
                href="https://github.com/vercel/next.js"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#00f2fe] text-[#002022] font-mono text-xs uppercase font-bold tracking-wider hover:opacity-90 transition-opacity shadow-[0_0_12px_rgba(0,242,254,0.4)] cursor-pointer w-full sm:w-auto min-h-[44px]"
              >
                <span className="material-symbols-outlined text-[16px]">terminal</span>
                Explorer le Code Source
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 3. DYNAMIC PROJECT REGISTRATION MODAL ("NOUVEAU PROJET") */}
      {activeModal === 'modal-add-project' && (
        <div className="w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/50 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between pb-4 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-400/40">
                <span className="material-symbols-outlined text-[#00f2fe] text-[22px]">
                  {isAuthenticated ? 'add_task' : 'lock'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs text-[#00f2fe] uppercase font-semibold">
                  {isAuthenticated ? 'Dashboard Ingénieur // Registre Orbital' : 'Système de Sécurité // Accès Restreint'}
                </span>
                <h3 className="font-['Space_Grotesk'] text-xl font-bold text-[#e1e2ee]">
                  {isAuthenticated ? 'Ajouter un Nouveau Projet Stellaire' : 'Authentification Requise pour Ajouter un Projet'}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#272a33] flex items-center justify-center text-[#849495] hover:text-[#fff] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {!isAuthenticated ? (
            /* STEP 1: AUTHENTICATION GATE */
            <div className="flex flex-col gap-5 mt-6">
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-200">
                <span className="material-symbols-outlined text-amber-400 text-[24px] mt-0.5">
                  admin_panel_settings
                </span>
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-mono font-bold uppercase tracking-wider text-amber-300">
                    Habilitation d'Officier Niveau 4 Obligatoire
                  </span>
                  <p className="text-amber-200/90 leading-relaxed font-body">
                    L'ajout et la validation d'un nouveau projet dans la cartographie d'Odyssée requièrent une identification certifiée d'officier de bord.
                  </p>
                </div>
              </div>

              {authError && (
                <div className="bg-red-500/15 border border-red-500/40 text-red-300 text-xs px-3 py-2 rounded-lg font-mono flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-[#b9cacb] uppercase">
                    Identifiant / Email d'Officier
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="alexandre.vance@odyssey-core.space"
                    className="bg-[#191b24] border border-[#3a494b]/60 rounded-lg px-3 py-2 text-sm text-[#e1e2ee] font-mono focus:border-[#00f2fe] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-[#b9cacb] uppercase">
                    Code d'Habilitation Orbitale / Passcode
                  </label>
                  <input
                    type="password"
                    required
                    value={authPasscode}
                    onChange={(e) => setAuthPasscode(e.target.value)}
                    placeholder="••••••••••••"
                    className="bg-[#191b24] border border-[#3a494b]/60 rounded-lg px-3 py-2 text-sm text-[#e1e2ee] font-mono focus:border-[#00f2fe] focus:outline-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#32343e] mt-2">
                  <button
                    type="button"
                    onClick={handleInstantAuth}
                    disabled={authLoading}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-[#272a33] hover:bg-[#363943] text-cyan-400 border border-cyan-500/30 font-mono text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                    title="Connexion 1-clic pour tester directement"
                  >
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    Connexion Démo (Cmdr. Vance)
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-1/2 sm:w-auto px-4 py-2 rounded-lg bg-[#1d1f28] text-[#849495] hover:text-[#e1e2ee] font-mono text-xs uppercase cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-1/2 sm:w-auto px-5 py-2 rounded-lg bg-[#00f2fe] hover:bg-[#00dce6] text-[#002022] font-mono text-xs uppercase font-bold transition-all shadow-[0_0_12px_rgba(0,242,254,0.4)] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {authLoading ? (
                        <>
                          <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                          Vérification...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px]">verified_user</span>
                          Valider l'Accréditation
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            /* STEP 2: UNLOCKED PROJECT FORM */
            <div className="flex flex-col gap-4 mt-6">
              {/* Authenticated Officer Header Banner */}
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold text-emerald-300">
                      ✓ HABILITATION NIVEAU 4 ACTIVE : {officerUser?.name} ({officerUser?.callsign})
                    </span>
                    <span className="font-mono text-[11px] text-emerald-400/70">
                      Compte : {officerUser?.email}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="font-mono text-[11px] text-red-400 hover:text-red-300 underline uppercase cursor-pointer"
                >
                  Déconnexion
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 mt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[#b9cacb] uppercase">
                      Titre du Projet
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Hyperdrive Real-time Mesh"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-[#191b24] border border-[#3a494b]/60 rounded-lg px-3 py-2 text-sm text-[#e1e2ee] font-body focus:border-[#00f2fe] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[#b9cacb] uppercase">
                      Type de Corps Céleste
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as CelestialType })}
                      className="bg-[#191b24] border border-[#3a494b]/60 rounded-lg px-3 py-2 text-sm text-[#e1e2ee] font-body focus:border-[#00f2fe] focus:outline-none"
                    >
                      <option value="planet">Planète (Étude de Cas Majeure)</option>
                      <option value="asteroid">Astéroïde (Contribution Open Source)</option>
                      <option value="station">Station Spatiale (Infra DevOps / Cloud)</option>
                      <option value="sun">Étoile / Sol (Architecture Fondamentale)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[#b9cacb] uppercase">
                      Pile Technique (Stack)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ex: Next.js 15, Turbopack, Rust"
                      value={formData.stack}
                      onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
                      className="bg-[#191b24] border border-[#3a494b]/60 rounded-lg px-3 py-2 text-sm text-[#e1e2ee] font-body focus:border-[#00f2fe] focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-[#b9cacb] uppercase">
                      GitHub URL / Repository
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/votre-compte/repo"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="bg-[#191b24] border border-[#3a494b]/60 rounded-lg px-3 py-2 text-sm text-[#e1e2ee] font-body focus:border-[#00f2fe] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-[#b9cacb] uppercase">
                    Métriques Clés & Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="ex: Invalidation cache < 10ms, débit +450%, résilience 99.999%."
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    className="bg-[#191b24] border border-[#3a494b]/60 rounded-lg px-3 py-2 text-sm text-[#e1e2ee] font-body focus:border-[#00f2fe] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-[#32343e] mt-2">
                  <span className="font-mono text-xs text-emerald-400 text-center sm:text-left">
                    {formStatus === 'syncing'
                      ? 'SYNCHRONISATION AU REGISTRE ORBITAL...'
                      : formStatus === 'success'
                      ? '✓ PROJET VALIDÉ ET DÉPLOYÉ DANS LE SECTEUR !'
                      : 'AUTHENTIFIÉ • PRÊT POUR VALIDATION'}
                  </span>
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-lg bg-[#272a33] text-[#e1e2ee] font-mono text-xs uppercase cursor-pointer min-h-[44px]"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={formStatus === 'syncing'}
                      className="px-5 py-2.5 rounded-lg bg-[#00f2fe] hover:bg-[#00dce6] text-[#002022] font-mono text-xs uppercase font-bold transition-all shadow-[0_0_12px_rgba(0,242,254,0.4)] cursor-pointer min-h-[44px]"
                    >
                      Valider & Déployer en Orbite ↗
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 3B. DEDICATED AUTHENTICATION MODAL ("AUTHENTIFICATION") */}
      {activeModal === 'modal-auth' && (
        <div className="w-full max-w-md max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-slate-950/95 backdrop-blur-2xl border border-cyan-500/50 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between pb-4 border-b border-cyan-500/20 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center border border-cyan-400/40 shrink-0">
                <span className="material-symbols-outlined text-[#00f2fe] text-[22px]">
                  security
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] sm:text-xs text-[#00f2fe] uppercase font-semibold">
                  Système de Sécurité
                </span>
                <h3 className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-[#e1e2ee]">
                  {isAuthenticated ? 'Session Officier Active' : 'Authentification de Bord'}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg hover:bg-[#272a33] flex items-center justify-center text-[#849495] hover:text-[#fff] transition-colors cursor-pointer shrink-0"
              aria-label="Fermer la fenêtre"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {isAuthenticated && officerUser ? (
            <div className="flex flex-col gap-4 mt-6">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-xs font-bold text-emerald-300 uppercase">
                    Accréditation Niveau {officerUser.clearanceLevel} Validée
                  </span>
                </div>
                <div className="flex flex-col font-mono text-xs text-[#e1e2ee] gap-1">
                  <div><span className="text-[#849495]">Officier :</span> {officerUser.name}</div>
                  <div><span className="text-[#849495]">Rang :</span> {officerUser.rank}</div>
                  <div><span className="text-[#849495]">Callsign :</span> {officerUser.callsign}</div>
                  <div><span className="text-[#849495]">Email :</span> {officerUser.email}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#32343e] gap-3">
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-mono text-xs uppercase cursor-pointer transition-all min-h-[44px]"
                >
                  Se Déconnecter
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg bg-[#00f2fe] text-[#002022] font-mono text-xs uppercase font-bold cursor-pointer min-h-[44px]"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-6">
              <p className="text-xs text-[#849495] leading-relaxed">
                Connectez-vous pour déverrouiller la validation et le déploiement de nouveaux projets orbitaux.
              </p>

              {authError && (
                <div className="bg-red-500/15 border border-red-500/40 text-red-300 text-xs px-3 py-2 rounded-lg font-mono">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-[#b9cacb] uppercase">
                    Identifiant / Email
                  </label>
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="bg-[#191b24] border border-[#3a494b]/60 rounded-lg px-3 py-2.5 text-base sm:text-sm text-[#e1e2ee] font-mono focus:border-[#00f2fe] focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-[#b9cacb] uppercase">
                    Code d'Habilitation
                  </label>
                  <input
                    type="password"
                    required
                    value={authPasscode}
                    onChange={(e) => setAuthPasscode(e.target.value)}
                    className="bg-[#191b24] border border-[#3a494b]/60 rounded-lg px-3 py-2.5 text-base sm:text-sm text-[#e1e2ee] font-mono focus:border-[#00f2fe] focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-[#32343e]">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 rounded-lg bg-[#00f2fe] text-[#002022] font-mono text-xs uppercase font-bold cursor-pointer shadow-[0_0_12px_rgba(0,242,254,0.4)] min-h-[44px]"
                  >
                    {authLoading ? 'Authentification...' : 'Valider'}
                  </button>
                  <button
                    type="button"
                    onClick={handleInstantAuth}
                    className="w-full py-2.5 rounded-lg bg-[#272a33] hover:bg-[#363943] text-cyan-400 font-mono text-xs uppercase border border-cyan-500/30 cursor-pointer min-h-[44px]"
                  >
                    Connexion Démo Immédiate
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* 4. ASTEROID BELT INSPECTOR MODAL */}
      {activeModal === 'modal-asteroids' && (
        <div className="w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-[#0b0e16]/95 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-purple-500/40 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between pb-4 border-b border-purple-500/25 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)] shrink-0">
                <span className="material-symbols-outlined text-[#dcb8ff] text-[24px] sm:text-[26px]">
                  hub
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] sm:text-xs text-[#dcb8ff] uppercase font-semibold">
                  Ceinture d'Astéroïdes // Écosystème Open Source (5.82 AU)
                </span>
                <h2 className="font-['Space_Grotesk'] text-lg sm:text-2xl font-bold text-[#e1e2ee]">
                  Contributions, RFCs & Astéroïdes
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg hover:bg-[#272a33] flex items-center justify-center text-[#849495] hover:text-[#fff] transition-colors cursor-pointer shrink-0"
              aria-label="Fermer la fenêtre"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 max-h-[60vh] overflow-y-auto pr-1">
            {projects.map((proj) => (
              <a
                key={proj.id}
                href={proj.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#191b24]/80 hover:bg-[#1d1f28] p-4 rounded-xl border border-purple-500/20 hover:border-purple-400 flex flex-col gap-1.5 transition-all group shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-purple-300 group-hover:text-[#00f2fe] transition-colors">
                    {proj.name}
                  </span>
                  <span className="font-mono text-[10px] text-[#00f2fe] bg-[#272a33] px-2 py-0.5 rounded border border-[#00f2fe]/20">
                    {proj.stars}
                  </span>
                </div>
                <span className="font-mono text-xs text-[#dcb8ff] font-semibold">
                  {proj.pr}
                </span>
                <p className="font-body text-xs text-[#b9cacb] line-clamp-2">
                  {proj.desc}
                </p>
                {proj.stack && (
                  <span className="font-mono text-[10px] text-[#849495] mt-auto pt-2 border-t border-[#32343e]/50">
                    {proj.stack}
                  </span>
                )}
              </a>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-purple-500/25">
            <span className="font-mono text-xs text-[#849495]">
              ORBITAL ASTEROIDS: {projects.length} DÉTECTÉS • SURVOL ET CLIC 3D ACTIFS
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#272a33] hover:bg-[#363943] text-[#e1e2ee] rounded-lg font-mono text-xs uppercase inline-flex items-center gap-1.5 border border-[#3a494b]/40 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Profil GitHub Orbital ↗
            </a>
          </div>
        </div>
      )}

      {/* 5. STATION DEVOPS TELEMETRY TERMINAL */}
      {activeModal === 'modal-station' && (
        <div className="w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-[#0b0e16]/95 backdrop-blur-2xl rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-emerald-500/40 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between pb-4 border-b border-emerald-500/25 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)] shrink-0">
                <span className="material-symbols-outlined text-emerald-400 text-[24px] sm:text-[26px]">
                  dns
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] sm:text-xs text-emerald-400 uppercase font-semibold">
                  Station Orbitale DevOps // Haute Disponibilité (8.41 AU)
                </span>
                <h2 className="font-['Space_Grotesk'] text-lg sm:text-2xl font-bold text-[#e1e2ee]">
                  Infrastructure Multi-Cloud & Télémétrie en Direct
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg hover:bg-[#272a33] flex items-center justify-center text-[#849495] hover:text-[#fff] transition-colors cursor-pointer shrink-0"
              aria-label="Fermer la fenêtre"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* 3 Cloud pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {/* Docker */}
            <div className="bg-[#191b24] p-4 rounded-xl border border-sky-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                  DOCKER ENGINE
                </span>
                <span className="font-mono text-[10px] text-[#849495] bg-[#272a33] px-2 py-0.5 rounded">
                  v26.1
                </span>
              </div>
              <div className="flex flex-col gap-1 font-mono text-xs mt-1">
                <div className="flex justify-between text-[#849495]">
                  <span>Conteneurs actifs :</span>
                  <span className="text-sky-300 font-bold">64 / 64</span>
                </div>
                <div className="flex justify-between text-[#849495]">
                  <span>RAM allouée :</span>
                  <span className="text-sky-300 font-bold">18.4 GB</span>
                </div>
                <div className="flex justify-between text-[#849495]">
                  <span>Microservices :</span>
                  <span className="text-sky-300 font-bold">12 pods</span>
                </div>
              </div>
              <div className="text-[11px] text-[#849495] mt-1 pt-2 border-t border-[#32343e]">
                Multi-stage Alpine & isolation cgroups v2.
              </div>
            </div>

            {/* AWS */}
            <div className="bg-[#191b24] p-4 rounded-xl border border-amber-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  AWS CLOUD INFRA
                </span>
                <span className="font-mono text-[10px] text-[#849495] bg-[#272a33] px-2 py-0.5 rounded">
                  eu-west-3
                </span>
              </div>
              <div className="flex flex-col gap-1 font-mono text-xs mt-1">
                <div className="flex justify-between text-[#849495]">
                  <span>ECS Fargate :</span>
                  <span className="text-amber-300 font-bold">24 Tasks</span>
                </div>
                <div className="flex justify-between text-[#849495]">
                  <span>Lambda Exéc./sec :</span>
                  <span className="text-amber-300 font-bold">1,842 req/s</span>
                </div>
                <div className="flex justify-between text-[#849495]">
                  <span>CloudFront Cache HIT :</span>
                  <span className="text-emerald-400 font-bold">99.42%</span>
                </div>
              </div>
              <div className="text-[11px] text-[#849495] mt-1 pt-2 border-t border-[#32343e]">
                Terraform State verrouillé sur S3 & DynamoDB.
              </div>
            </div>

            {/* GCP */}
            <div className="bg-[#191b24] p-4 rounded-xl border border-red-500/30 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                  GOOGLE CLOUD (GCP)
                </span>
                <span className="font-mono text-[10px] text-[#849495] bg-[#272a33] px-2 py-0.5 rounded">
                  europe-west1
                </span>
              </div>
              <div className="flex flex-col gap-1 font-mono text-xs mt-1">
                <div className="flex justify-between text-[#849495]">
                  <span>Clusters GKE :</span>
                  <span className="text-red-300 font-bold">Autopilot 3.2</span>
                </div>
                <div className="flex justify-between text-[#849495]">
                  <span>Cloud Run P99 :</span>
                  <span className="text-emerald-400 font-bold">18 ms</span>
                </div>
                <div className="flex justify-between text-[#849495]">
                  <span>BigQuery Ingress :</span>
                  <span className="text-red-300 font-bold">4.8 GB/min</span>
                </div>
              </div>
              <div className="text-[11px] text-[#849495] mt-1 pt-2 border-t border-[#32343e]">
                Istio Service Mesh mTLS & Prometheus Exporter.
              </div>
            </div>
          </div>

          {/* Live Cluster Logs Feed */}
          <div className="bg-[#10131c] p-4 rounded-xl mt-5 font-mono text-xs text-[#b9cacb] flex flex-col gap-1.5 border border-[#32343e]">
            <div className="flex items-center justify-between text-[#849495] pb-2 border-b border-[#32343e]">
              <span>CLUSTER STREAM: k8s-mesh-station-eu.odyssey.internal</span>
              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE STREAMING 60HZ
              </span>
            </div>
            {logs.map((log) => (
              <div key={log.id} className="leading-relaxed">
                <span className="text-[#849495]">[{log.timestamp}] </span>
                <span
                  className={
                    log.type === 'aws'
                      ? 'text-amber-300'
                      : log.type === 'gcp'
                      ? 'text-red-300'
                      : 'text-[#00f2fe]'
                  }
                >
                  {log.source}:{' '}
                </span>
                <span className="text-[#e1e2ee]">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
