import React, { useState } from 'react';
import { CelestialType, OpenSourceProject, ClusterLog, WaypointKey, OfficerUser } from '../types';
import { sanitizeExternalUrl, sanitizeTextInput, verifyOfficerCredentials } from '../utils/security';

interface CockpitModalsProps {
  activeModal: string | null;
  projects: OpenSourceProject[];
  logs: ClusterLog[];
  isAuthenticated: boolean;
  officerUser: OfficerUser | null;
  onClose: () => void;
  onOpenContact?: () => void;
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
  onOpenContact,
  onNavigate,
  onAddProject,
  onAuthenticate,
  onLogout,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'planet' as CelestialType,
    stack: '',
    url: '',
    desc: '',
  });
  const [formStatus, setFormStatus] = useState<'idle' | 'syncing' | 'success'>('idle');

  const [authEmail, setAuthEmail] = useState('alexandre.vance@odyssey-core.space');
  const [authPasscode, setAuthPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [contactSender, setContactSender] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  if (!activeModal) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const verification = verifyOfficerCredentials(authEmail, authPasscode);
    if (!verification.valid) {
      setAuthError(verification.error || 'Échec de vérification des identifiants.');
      return;
    }

    setAuthLoading(true);
    setAuthError(null);

    setTimeout(() => {
      setAuthLoading(false);
      setAuthPasscode('');
      onAuthenticate({
        name: 'Alexandre Vance',
        rank: 'Commandant de Mission',
        callsign: 'ODYSSEY-LEAD',
        clearanceLevel: 4,
        email: sanitizeTextInput(authEmail, 120),
      });
    }, 350);
  };

  const handleInstantAuth = () => {
    setAuthLoading(true);
    setAuthError(null);
    setTimeout(() => {
      setAuthLoading(false);
      setAuthPasscode('');
      onAuthenticate({
        name: 'Alexandre Vance',
        rank: 'Commandant de Mission',
        callsign: 'ODYSSEY-LEAD',
        clearanceLevel: 4,
        email: 'alexandre.vance@odyssey-core.space',
      });
    }, 150);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthError('Habilitation requise pour valider et déployer ce projet.');
      return;
    }
    const cleanTitle = sanitizeTextInput(formData.title, 80);
    const cleanStack = sanitizeTextInput(formData.stack, 100);
    const cleanDesc = sanitizeTextInput(formData.desc, 280);
    const cleanUrl = sanitizeExternalUrl(formData.url);

    if (!cleanTitle || !cleanStack) return;

    setFormStatus('syncing');
    setTimeout(() => {
      onAddProject({
        title: cleanTitle,
        type: formData.type,
        stack: cleanStack,
        url: cleanUrl,
        desc: cleanDesc,
      });
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
      }, 650);
    }, 500);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMessage = sanitizeTextInput(contactMessage, 500);
    if (!cleanMessage) return;
    setContactStatus('sending');
    setTimeout(() => {
      setContactStatus('sent');
      setTimeout(() => {
        setContactStatus('idle');
        setContactSender('');
        setContactMessage('');
        onClose();
      }, 1100);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* 1. SOL BASE MODAL (HERO & BIO DE L'INGENIEUR) */}
      {activeModal === 'modal-sun' && (
        <div className="w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-[#090e1a] rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-amber-400/35 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between pb-4 border-b border-slate-400/15 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/15 flex items-center justify-center border border-amber-400/35 shrink-0">
                <span className="material-symbols-outlined text-amber-400 text-[24px] sm:text-[26px]">
                  wb_sunny
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] sm:text-xs text-amber-400 uppercase tracking-widest font-semibold tabular-nums">
                  Étoile G2V • Genèse & Profil de l'Ingénieur (0.00 AU)
                </span>
                <h2 className="font-display text-lg sm:text-2xl font-bold text-slate-100">
                  Alexandre Vance • Architecte Système
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg hover:bg-[#141f35] flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Fermer la fenêtre"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2 flex flex-col gap-4">
              <p className="font-body text-sm sm:text-base text-slate-300 leading-relaxed">
                Bienvenue au cœur héliocentrique de l'Odyssée. Passionné par l'architecture logicielle de haute précision, j'ai forgé mes armes sur les fondations immuables de l'informatique théorique avant d'explorer les confins du cloud distribué moderne et des applications Edge temps-réel.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0f1626] p-4 rounded-xl border border-amber-400/20">
                <div>
                  <span className="font-mono text-xs text-amber-400 uppercase font-semibold block mb-1">
                    Origines Fondamentales
                  </span>
                  <span className="font-body text-xs text-slate-200 leading-relaxed">
                    C / C++ • Algorithmes de Tri & Arbres B+ • Protocoles TCP/UDP • Assembleur • Moteurs de rendu WebGL / Three.js
                  </span>
                </div>
                <div>
                  <span className="font-mono text-xs text-amber-400 uppercase font-semibold block mb-1">
                    Philosophie de Conception
                  </span>
                  <span className="font-body text-xs text-slate-200 leading-relaxed">
                    Sobriété computationnelle, résilience aux pannes, interfaces à latence zéro et craft typographique millimétré.
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenContact) {
                      onOpenContact();
                    } else {
                      onClose();
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-400/15 hover:bg-amber-400 text-amber-300 hover:text-[#070a12] font-mono text-xs uppercase font-bold transition-all border border-amber-400/40 cursor-pointer min-h-[44px]"
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
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#121a2b] hover:bg-[#1a253d] text-slate-100 font-mono text-xs uppercase font-semibold transition-all border border-slate-400/20 cursor-pointer min-h-[44px]"
                >
                  <span className="material-symbols-outlined text-[16px] text-sky-400">
                    rocket_launch
                  </span>
                  Cap sur Planète Next.js ↗
                </button>
              </div>
            </div>

            {/* Right sidebar pilot stats */}
            <div className="bg-[#0f1626] p-5 rounded-xl border border-amber-400/20 flex flex-col justify-between">
              <div className="flex flex-col gap-3">
                <span className="font-mono text-xs text-amber-400 uppercase tracking-wider font-semibold">
                  Paramètres Pilote
                </span>
                <div className="flex items-center justify-between text-slate-200 font-mono text-xs py-1.5 border-b border-slate-400/15 tabular-nums">
                  <span className="text-slate-400">Expérience</span>
                  <span className="text-amber-300 font-bold">8+ Ans</span>
                </div>
                <div className="flex items-center justify-between text-slate-200 font-mono text-xs py-1.5 border-b border-slate-400/15 tabular-nums">
                  <span className="text-slate-400">Commits Sol</span>
                  <span className="text-amber-300 font-bold">4,920+</span>
                </div>
                <div className="flex items-center justify-between text-slate-200 font-mono text-xs py-1.5 tabular-nums">
                  <span className="text-slate-400">Statut Odyssée</span>
                  <span className="text-sky-400 font-bold">En Orbite</span>
                </div>
              </div>

              <div className="mt-4 p-2.5 rounded-lg bg-[#070b14] font-mono text-[11px] text-amber-300 border border-amber-400/25 text-center">
                VECTEUR 00 : FONDATIONS ÉPROUVÉES
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1B. DIRECT COMMS TRANSMISSION MODAL */}
      {activeModal === 'modal-contact' && (
        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#090e1a] rounded-2xl p-5 sm:p-7 shadow-2xl border border-amber-400/35 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between pb-4 border-b border-slate-400/15 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center border border-amber-400/35 shrink-0">
                <span className="material-symbols-outlined text-amber-400 text-[22px]">
                  satellite_alt
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] sm:text-xs text-amber-400 uppercase tracking-widest font-semibold">
                  Canal Subspatial • Fréquence Directe
                </span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-slate-100">
                  Transmettre un Message à l'Architecte
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#141f35] flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Fermer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form onSubmit={handleContactSubmit} className="flex flex-col gap-4 mt-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-slate-300 uppercase">
                Votre Identifiant / Email de Retour
              </label>
              <input
                type="email"
                required
                maxLength={120}
                value={contactSender}
                onChange={(e) => setContactSender(e.target.value)}
                placeholder="contact@entreprise.com"
                className="bg-[#0f1626] border border-slate-400/20 rounded-lg px-3 py-2.5 text-sm text-slate-100 font-mono focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-xs text-slate-300 uppercase">
                Message / Proposition de Mission
              </label>
              <textarea
                required
                rows={4}
                maxLength={500}
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                placeholder="Décrivez votre projet d'architecture, besoin d'audit ou opportunité d'ingénierie..."
                className="bg-[#0f1626] border border-slate-400/20 rounded-lg px-3 py-2.5 text-sm text-slate-100 font-body focus:border-amber-400 focus:outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-400/15 gap-3">
              <span className="font-mono text-xs text-amber-300">
                {contactStatus === 'sending'
                  ? 'ÉMISSION DU PAQUET...'
                  : contactStatus === 'sent'
                  ? '✓ TRANSMISSION REÇUE PAR SOL BASE'
                  : 'CHIFFREMENT TLS 1.3 ACTIF'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-[#121a2b] text-slate-200 font-mono text-xs uppercase cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={contactStatus !== 'idle'}
                  className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-[#070a12] font-mono text-xs uppercase font-bold cursor-pointer transition-all"
                >
                  Envoyer ↗
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 2. PLANÈTE NEXT.JS MODAL */}
      {activeModal === 'modal-nextjs' && (
        <div className="w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-[#090e1a] border border-sky-400/35 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between pb-4 border-b border-slate-400/15 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-sky-400/15 flex items-center justify-center border border-sky-400/35 shrink-0">
                <span className="material-symbols-outlined text-sky-400 text-[24px] sm:text-[26px]">
                  rocket_launch
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] sm:text-xs text-sky-400 uppercase tracking-wider font-semibold tabular-nums">
                  Étude de Cas • Planète Tellurique Next.js (3.48 AU)
                </span>
                <h2 className="font-display text-lg sm:text-2xl font-bold text-slate-100">
                  Architecture Next.js 15 Enterprise & Edge Streaming SSR
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg hover:bg-[#141f35] flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Fermer la fenêtre"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
            <div className="flex flex-col gap-2 bg-[#0f1626] p-4 rounded-xl border border-slate-400/15">
              <span className="font-mono text-xs text-sky-400 uppercase font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">layers</span>
                Pile Technique
              </span>
              <ul className="flex flex-col gap-1.5 font-mono text-xs text-slate-200 mt-1">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Next.js 15 (App Router)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  React Server Actions & Suspense
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Edge Middleware (Geo-routing)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Tailwind CSS & Design Tokens
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  Vercel Global Edge Network
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-2 bg-[#0f1626] p-4 rounded-xl border border-slate-400/15">
              <span className="font-mono text-xs text-violet-300 uppercase font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">shield</span>
                Défis Résolus
              </span>
              <p className="font-body text-xs text-slate-300 leading-relaxed">
                Hydratation sans drift (0-drift), invalidation du cache distribué sous 20ms via tags, et garantie d'un Time To First Byte (TTFB) de 45ms sur 140 POPs Edge mondiaux.
              </p>
              <div className="mt-1 font-mono text-[11px] text-violet-300 bg-violet-950/40 p-2 rounded border border-violet-400/25">
                TAGS PURGE • ZERO WATERFALL
              </div>
            </div>

            <div className="flex flex-col gap-2 bg-[#0f1626] p-4 rounded-xl border border-slate-400/15">
              <span className="font-mono text-xs text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px]">trending_up</span>
                Mesures d'Impact
              </span>
              <div className="flex flex-col gap-2 tabular-nums">
                <div>
                  <span className="font-display text-3xl font-bold text-sky-400">
                    +340%
                  </span>
                  <span className="font-body text-xs text-slate-400 block">
                    Conversions checkout mondial
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-200 font-mono text-xs py-1 border-t border-slate-400/15">
                  <span className="text-slate-400">TTFB Moyen</span>
                  <span className="text-sky-400 font-bold">45 ms</span>
                </div>
                <div className="flex items-center justify-between text-slate-200 font-mono text-xs py-1 border-t border-slate-400/15">
                  <span className="text-slate-400">Lighthouse Score</span>
                  <span className="text-emerald-400 font-bold">100 / 100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-400/15">
            <span className="font-mono text-xs text-slate-400 tabular-nums">
              ORBITAL ID: NX-9021 • INTEGRITY VERIFIED
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <a
                href="https://github.com/vercel/next.js"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-sky-400 hover:bg-sky-300 text-[#050810] font-mono text-xs uppercase font-bold tracking-wider transition-colors cursor-pointer w-full sm:w-auto min-h-[44px]"
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
        <div className="w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-[#090e1a] border border-sky-400/35 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between pb-4 border-b border-slate-400/15">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-400/15 flex items-center justify-center border border-sky-400/35">
                <span className="material-symbols-outlined text-sky-400 text-[22px]">
                  {isAuthenticated ? 'add_task' : 'lock'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-xs text-sky-400 uppercase font-semibold">
                  {isAuthenticated ? 'Dashboard Ingénieur • Registre Orbital' : 'Système de Sécurité • Accès Restreint'}
                </span>
                <h3 className="font-display text-xl font-bold text-slate-100">
                  {isAuthenticated ? 'Ajouter un Nouveau Projet Stellaire' : 'Authentification Requise pour Ajouter un Projet'}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#141f35] flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
              aria-label="Fermer la fenêtre"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-col gap-5 mt-6">
              <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 text-amber-200">
                <span className="material-symbols-outlined text-amber-400 text-[24px] mt-0.5">
                  admin_panel_settings
                </span>
                <div className="flex flex-col gap-1 text-xs">
                  <span className="font-mono font-bold uppercase tracking-wider text-amber-300">
                    Habilitation d'Officier Niveau 4 Obligatoire
                  </span>
                  <p className="text-amber-200/90 leading-relaxed font-body">
                    L'ajout et la validation d'un nouveau projet dans la cartographie d'Odyssée requièrent une identification certifiée d'officier de bord (Code : <code className="text-amber-300">ODYSSEY-2026</code> ou Connexion Démo).
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
                  <label className="font-mono text-xs text-slate-300 uppercase">
                    Identifiant / Email d'Officier
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={120}
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="alexandre.vance@odyssey-core.space"
                    className="bg-[#0f1626] border border-slate-400/20 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-slate-300 uppercase">
                    Code d'Habilitation Orbitale
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={64}
                    value={authPasscode}
                    onChange={(e) => setAuthPasscode(e.target.value)}
                    placeholder="Code d'accès (ex: ODYSSEY-2026)"
                    className="bg-[#0f1626] border border-slate-400/20 rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:border-sky-400 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-400/15 mt-2">
                  <button
                    type="button"
                    onClick={handleInstantAuth}
                    disabled={authLoading}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-[#121a2b] hover:bg-[#1a253d] text-sky-400 border border-sky-400/30 font-mono text-xs uppercase flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    Connexion Démo (Cmdr. Vance)
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-1/2 sm:w-auto px-4 py-2 rounded-lg bg-[#101726] text-slate-400 hover:text-slate-100 font-mono text-xs uppercase cursor-pointer"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-1/2 sm:w-auto px-5 py-2 rounded-lg bg-sky-400 hover:bg-sky-300 text-[#050810] font-mono text-xs uppercase font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
            <div className="flex flex-col gap-4 mt-6">
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div className="flex flex-col">
                    <span className="font-mono text-xs font-bold text-emerald-300">
                      ✓ HABILITATION NIVEAU 4 ACTIVE : {officerUser?.name} ({officerUser?.callsign})
                    </span>
                    <span className="font-mono text-[11px] text-emerald-400/75">
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
                    <label className="font-mono text-xs text-slate-300 uppercase">
                      Titre du Projet
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={80}
                      placeholder="ex: Hyperdrive Real-time Mesh"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-[#0f1626] border border-slate-400/20 rounded-lg px-3 py-2 text-sm text-slate-100 font-body focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-slate-300 uppercase">
                      Type de Corps Céleste
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as CelestialType })}
                      className="bg-[#0f1626] border border-slate-400/20 rounded-lg px-3 py-2 text-sm text-slate-100 font-body focus:border-sky-400 focus:outline-none"
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
                    <label className="font-mono text-xs text-slate-300 uppercase">
                      Pile Technique (Stack)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      placeholder="ex: Next.js 15, Turbopack, Rust"
                      value={formData.stack}
                      onChange={(e) => setFormData({ ...formData, stack: e.target.value })}
                      className="bg-[#0f1626] border border-slate-400/20 rounded-lg px-3 py-2 text-sm text-slate-100 font-body focus:border-sky-400 focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="font-mono text-xs text-slate-300 uppercase">
                      GitHub URL / Repository (HTTPS)
                    </label>
                    <input
                      type="url"
                      maxLength={200}
                      placeholder="https://github.com/votre-compte/repo"
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      className="bg-[#0f1626] border border-slate-400/20 rounded-lg px-3 py-2 text-sm text-slate-100 font-body focus:border-sky-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-slate-300 uppercase">
                    Métriques Clés & Description
                  </label>
                  <textarea
                    required
                    rows={3}
                    maxLength={280}
                    placeholder="ex: Invalidation cache < 10ms, débit +450%, résilience 99.999%."
                    value={formData.desc}
                    onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                    className="bg-[#0f1626] border border-slate-400/20 rounded-lg px-3 py-2 text-sm text-slate-100 font-body focus:border-sky-400 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-400/15 mt-2">
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
                      className="px-4 py-2.5 rounded-lg bg-[#121a2b] text-slate-200 font-mono text-xs uppercase cursor-pointer min-h-[44px]"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={formStatus === 'syncing'}
                      className="px-5 py-2.5 rounded-lg bg-sky-400 hover:bg-sky-300 text-[#050810] font-mono text-xs uppercase font-bold transition-all cursor-pointer min-h-[44px]"
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
        <div className="w-full max-w-md max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-[#090e1a] border border-sky-400/35 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between pb-4 border-b border-slate-400/15 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-400/15 flex items-center justify-center border border-sky-400/35 shrink-0">
                <span className="material-symbols-outlined text-sky-400 text-[22px]">
                  security
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] sm:text-xs text-sky-400 uppercase font-semibold">
                  Système de Sécurité
                </span>
                <h3 className="font-display text-lg sm:text-xl font-bold text-slate-100">
                  {isAuthenticated ? 'Session Officier Active' : 'Authentification de Bord'}
                </h3>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg hover:bg-[#141f35] flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Fermer la fenêtre"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {isAuthenticated && officerUser ? (
            <div className="flex flex-col gap-4 mt-6">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-mono text-xs font-bold text-emerald-300 uppercase">
                    Accréditation Niveau {officerUser.clearanceLevel} Validée
                  </span>
                </div>
                <div className="flex flex-col font-mono text-xs text-slate-200 gap-1">
                  <div><span className="text-slate-400">Officier :</span> {officerUser.name}</div>
                  <div><span className="text-slate-400">Rang :</span> {officerUser.rank}</div>
                  <div><span className="text-slate-400">Callsign :</span> {officerUser.callsign}</div>
                  <div><span className="text-slate-400">Email :</span> {officerUser.email}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-400/15 gap-3">
                <button
                  type="button"
                  onClick={onLogout}
                  className="px-4 py-2.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/35 font-mono text-xs uppercase cursor-pointer transition-all min-h-[44px]"
                >
                  Se Déconnecter
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-lg bg-sky-400 hover:bg-sky-300 text-[#050810] font-mono text-xs uppercase font-bold cursor-pointer min-h-[44px]"
                >
                  Fermer
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 mt-6">
              <p className="text-xs text-slate-400 leading-relaxed font-body">
                Connectez-vous pour déverrouiller la validation et le déploiement de nouveaux projets orbitaux (Code d'accès : <code className="text-sky-400 font-mono">ODYSSEY-2026</code>).
              </p>

              {authError && (
                <div className="bg-red-500/15 border border-red-500/40 text-red-300 text-xs px-3 py-2 rounded-lg font-mono">
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-slate-300 uppercase">
                    Identifiant / Email
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={120}
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="bg-[#0f1626] border border-slate-400/20 rounded-lg px-3 py-2.5 text-base sm:text-sm text-slate-100 font-mono focus:border-sky-400 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-xs text-slate-300 uppercase">
                    Code d'Habilitation
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={64}
                    value={authPasscode}
                    onChange={(e) => setAuthPasscode(e.target.value)}
                    placeholder="ODYSSEY-2026"
                    className="bg-[#0f1626] border border-slate-400/20 rounded-lg px-3 py-2.5 text-base sm:text-sm text-slate-100 font-mono focus:border-sky-400 focus:outline-none min-h-[44px]"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-slate-400/15">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2.5 rounded-lg bg-sky-400 hover:bg-sky-300 text-[#050810] font-mono text-xs uppercase font-bold cursor-pointer min-h-[44px]"
                  >
                    {authLoading ? 'Authentification...' : 'Valider'}
                  </button>
                  <button
                    type="button"
                    onClick={handleInstantAuth}
                    className="w-full py-2.5 rounded-lg bg-[#121a2b] hover:bg-[#1a253d] text-sky-400 font-mono text-xs uppercase border border-sky-400/30 cursor-pointer min-h-[44px]"
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
        <div className="w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-[#090e1a] rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-violet-400/35 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between pb-4 border-b border-slate-400/15 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-violet-500/15 flex items-center justify-center border border-violet-400/35 shrink-0">
                <span className="material-symbols-outlined text-violet-300 text-[24px] sm:text-[26px]">
                  hub
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] sm:text-xs text-violet-300 uppercase font-semibold tabular-nums">
                  Ceinture Principale • Écosystème Open Source (5.82 AU)
                </span>
                <h2 className="font-display text-lg sm:text-2xl font-bold text-slate-100">
                  Contributions, RFCs & Astéroïdes S/C-Type
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg hover:bg-[#141f35] flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Fermer la fenêtre"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 max-h-[60vh] overflow-y-auto pr-1">
            {projects.map((proj) => (
              <a
                key={proj.id}
                href={sanitizeExternalUrl(proj.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0f1626] hover:bg-[#141e33] p-4 rounded-xl border border-slate-400/15 hover:border-violet-400/45 flex flex-col gap-1.5 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-violet-300 group-hover:text-sky-400 transition-colors">
                    {proj.name}
                  </span>
                  <span className="font-mono text-[10px] text-sky-400 bg-[#141d31] px-2 py-0.5 rounded border border-sky-400/20 tabular-nums">
                    {proj.stars}
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-200 font-semibold">
                  {proj.pr}
                </span>
                <p className="font-body text-xs text-slate-300 line-clamp-2">
                  {proj.desc}
                </p>
                {proj.stack && (
                  <span className="font-mono text-[10px] text-slate-400 mt-auto pt-2 border-t border-slate-400/10">
                    {proj.stack}
                  </span>
                )}
              </a>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-400/15">
            <span className="font-mono text-xs text-slate-400 tabular-nums">
              ORBITAL ASTEROIDS: {projects.length} DÉTECTÉS • SURVOL ET CLIC ACTIFS
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#121a2b] hover:bg-[#1a253d] text-slate-100 rounded-lg font-mono text-xs uppercase inline-flex items-center gap-1.5 border border-slate-400/20 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              Profil GitHub Orbital ↗
            </a>
          </div>
        </div>
      )}

      {/* 5. STATION DEVOPS TELEMETRY TERMINAL */}
      {activeModal === 'modal-station' && (
        <div className="w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-[#090e1a] rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl border border-emerald-400/35 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between pb-4 border-b border-slate-400/15 gap-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-400/35 shrink-0">
                <span className="material-symbols-outlined text-emerald-400 text-[24px] sm:text-[26px]">
                  dns
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-[10px] sm:text-xs text-emerald-400 uppercase font-semibold tabular-nums">
                  Station Orbitale DevOps • Haute Disponibilité (8.41 AU)
                </span>
                <h2 className="font-display text-lg sm:text-2xl font-bold text-slate-100">
                  Infrastructure Multi-Cloud & Télémétrie en Direct
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 sm:w-8 sm:h-8 rounded-lg hover:bg-[#141f35] flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label="Fermer la fenêtre"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          {/* 3 Cloud pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 tabular-nums">
            <div className="bg-[#0f1626] p-4 rounded-xl border border-sky-400/25 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-sky-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  DOCKER ENGINE
                </span>
                <span className="font-mono text-[10px] text-slate-400 bg-[#141d31] px-2 py-0.5 rounded">
                  v26.1
                </span>
              </div>
              <div className="flex flex-col gap-1 font-mono text-xs mt-1">
                <div className="flex justify-between text-slate-400">
                  <span>Conteneurs actifs :</span>
                  <span className="text-sky-300 font-bold">64 / 64</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>RAM allouée :</span>
                  <span className="text-sky-300 font-bold">18.4 GB</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Microservices :</span>
                  <span className="text-sky-300 font-bold">12 pods</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 pt-2 border-t border-slate-400/15">
                Multi-stage Alpine & isolation cgroups v2.
              </div>
            </div>

            <div className="bg-[#0f1626] p-4 rounded-xl border border-amber-400/25 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  AWS CLOUD INFRA
                </span>
                <span className="font-mono text-[10px] text-slate-400 bg-[#141d31] px-2 py-0.5 rounded">
                  eu-west-3
                </span>
              </div>
              <div className="flex flex-col gap-1 font-mono text-xs mt-1">
                <div className="flex justify-between text-slate-400">
                  <span>ECS Fargate :</span>
                  <span className="text-amber-300 font-bold">24 Tasks</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Lambda Exéc./sec :</span>
                  <span className="text-amber-300 font-bold">1,842 req/s</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>CloudFront Cache HIT :</span>
                  <span className="text-emerald-400 font-bold">99.42%</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 pt-2 border-t border-slate-400/15">
                Terraform State verrouillé sur S3 & DynamoDB.
              </div>
            </div>

            <div className="bg-[#0f1626] p-4 rounded-xl border border-rose-400/25 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  GOOGLE CLOUD (GCP)
                </span>
                <span className="font-mono text-[10px] text-slate-400 bg-[#141d31] px-2 py-0.5 rounded">
                  europe-west1
                </span>
              </div>
              <div className="flex flex-col gap-1 font-mono text-xs mt-1">
                <div className="flex justify-between text-slate-400">
                  <span>Clusters GKE :</span>
                  <span className="text-rose-300 font-bold">Autopilot 3.2</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Cloud Run P99 :</span>
                  <span className="text-emerald-400 font-bold">18 ms</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>BigQuery Ingress :</span>
                  <span className="text-rose-300 font-bold">4.8 GB/min</span>
                </div>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 pt-2 border-t border-slate-400/15">
                Istio Service Mesh mTLS & Prometheus Exporter.
              </div>
            </div>
          </div>

          {/* Live Cluster Logs Feed */}
          <div className="bg-[#060911] p-4 rounded-xl mt-5 font-mono text-xs text-slate-300 flex flex-col gap-1.5 border border-slate-400/15 tabular-nums">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-400/15">
              <span>CLUSTER STREAM: k8s-mesh-station-eu.odyssey.internal</span>
              <span className="text-emerald-400 flex items-center gap-1.5 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                FLUX 60HZ
              </span>
            </div>
            {logs.map((log) => (
              <div key={log.id} className="leading-relaxed">
                <span className="text-slate-500">[{log.timestamp}] </span>
                <span
                  className={
                    log.type === 'aws'
                      ? 'text-amber-300'
                      : log.type === 'gcp'
                      ? 'text-rose-300'
                      : 'text-sky-400'
                  }
                >
                  {log.source}:{' '}
                </span>
                <span className="text-slate-200">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
