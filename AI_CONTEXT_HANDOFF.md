# AI CONTEXT & MODEL HANDOFF DOCUMENT — ENGINEERING ODYSSEY

> **OBJECTIF DE CE DOCUMENT** : Ce fichier transmet **100 % du contexte technique, visuel, sécuritaire, performant et historique** du projet **Engineering Odyssey** à une autre Intelligence Artificielle (LLM / Agent de code) en cas de bascule de modèle au cours du développement.

---

## 1. Identité & Direction Artistique Actuelle du Projet

- **Nom de l'application** : `Engineering Odyssey` (défini dans `metadata.json` et `index.html` — **ne jamais renommer**).
- **Concept** : Portfolio d'ingénierie logicielle et planisphère céleste interactif (WebGL / Three.js) organisé autour d'un système solaire héliocentrique réaliste dans le *Secteur 12-Vega*.
- **Positionnement Visuel** : **« Planisphère Écliptique Réaliste & Observatoire Astrophysique de Haute Précision »**.
  - Le système solaire est **coplanaire sur le plan écliptique ($Y = 0$)** avec une vue par défaut en **Planisphère 2D** et un commutateur instantané vers la vue **Observatoire** oblique (touche `P`).
  - Palette d'observatoire calibrée : fond spatial `#020307`, surfaces HUD mates `#060911` / `#0a0f1a` (`rgba(10, 15, 26, 0.92)`), bordures fines `1px solid rgba(148, 163, 184, 0.16)`, accents calibrés **Solar Amber `#e5a93c`** et **Ice Sky `#38bdf8`**.
  - Typographie : `Plus Jakarta Sans` (`font-display`), `IBM Plex Sans` (`font-body`), `JetBrains Mono` (`font-mono tabular-nums`).
- **Langue de l'interface** : Français.

---

## 2. Invariants Stricts & Préférences Utilisateur (À NE JAMAIS RÉGRESSER)

1. **Pas d'orbes de données lumineux autour des astres** : Retirés définitivement à la demande de l'utilisateur.
2. **Pas de bouton « Inspecter » séparé dans `#scanner-reticle`** : Toute la carte de survol est cliquable (`onClick={onInspectTarget}`).
3. **Performance & Réactivité Immédiate (Pas de Freeze WebGL / CSS)** :
   - **Ne jamais réintroduire de `backdrop-filter: blur(...)`** sur les panneaux flottants superposés au canvas WebGL actif (cela cause des lectures framebuffer coûteuses et des freezes visuels).
   - Conserver le shader solaire rapide à **3 octaves Domain-Warped FBM + 3 octaves Ridged Magma**, l'**`InstancedMesh` (1 draw call)** pour les astéroïdes de fond, et la **régulation `afterDraw` (`gl.fenceSync`)** lorsque `isSoftwareGl` est détecté.
4. **Réalisme Astrophysique & Design Épuré** :
   - Conserver les orbites coplanaires ($Y = 0$), le `RoomEnvironment` + `PMREMGenerator` pour les reflets métalliques PBR, le halo solaire optique (`CanvasTexture` + `SpriteMaterial`), la Lune orbitale, les mondes de référence (interne rocheux et géante gazeuse à anneaux) et les étiquettes astrométriques projetées à l'écran.
   - Zéro point clignotant décoratif (`animate-ping` / `animate-pulse`) et zéro préfixe de commentaire `//` dans les titres HUD.
5. **Séquence d'Amorce (`CockpitLoadingScreen.tsx`)** : Active au démarrage sur toutes les résolutions (~420 ms, non bloquante), avec bouton d'accès immédiat et relance via `restart_alt`.

---

## 3. Sécurité & Durcissement Implémentés (`src/utils/security.ts`)

- **`sanitizeExternalUrl(rawUrl)`** : Valide chaque URL de projet via `new URL()` et impose `https:` ou `http:`.
- **`sanitizeTextInput(raw, maxLength)`** : Filtre les chevrons HTML `<>`, caractères de contrôle, et borne la longueur.
- **`validateOfficerSession(raw)`** : Valide la session `localStorage` avant hydratation React.
- **`verifyOfficerCredentials(email, passcode)` & `checkAuthRateLimit()`** : Vérification sans mot de passe en clair dans le state + verrouillage 30s après 5 échecs.
- **Nettoyage VRAM WebGL** : Libération complète des géométries, matériaux, textures et `PMREMGenerator` au démontage de `ThreeSpaceCanvas.tsx`.

---

## 4. Architecture Détaillée des Fichiers

```text
/
├── index.html                                    # Entrée HTML ("Engineering Odyssey") + Fonts Plus Jakarta / IBM Plex / JetBrains Mono
├── metadata.json                                 # Métadonnées AI Studio ("Engineering Odyssey")
├── README.md                                     # Documentation générale du projet
├── SECURITY_AND_QUALITY_AUDIT.md                 # Rapport d'audit de sécurité, performance WebGL & UX
├── AI_CONTEXT_HANDOFF.md                         # CE DOCUMENT (Contexte de transfert inter-modèles IA)
├── docs/
│   └── AI_MODEL_HANDOFF_CONTEXT.md               # Copie miroir du contexte IA dans /docs
└── src/
    ├── index.css                                 # Design system matte d'observatoire (.obsidian-glass sans backdrop-blur, .tabular-nums)
    ├── types.ts                                  # Interfaces TS : WaypointKey, ScanMode, CelestialTarget, OrbitalParams, SpectralProfile
    ├── App.tsx                                   # Orchestrateur principal, viewProjection ('planisphere' | 'observatory'), raccourcis PC
    ├── data/
    │   └── spaceData.ts                          # Données CELESTIAL_TARGETS (orbitalParams + spectralData), projets OS et logs initiaux
    ├── utils/
    │   ├── audioSynth.ts                         # Web Audio API SpaceSynthesizer
    │   └── security.ts                           # Sanitisation XSS/URL, validation localStorage et rate-limiting d'authentification
    └── components/
        ├── ThreeSpaceCanvas.tsx                  # Planisphère coplanaire, shaders rapides, InstancedMesh, PBR RoomEnvironment, labels projetés
        ├── CockpitLoadingScreen.tsx              # Séquence d'amorce rapide (~420ms) et responsive
        ├── CockpitHeader.tsx                     # Header flottant Desktop (Index, Switch Planisphère 2D/Observatoire, Exploration/Voyage, Spectre)
        ├── CockpitHudOverlay.tsx                 # HUD Desktop (Cartouche Éditorial 00-03, Popup de survol cliquable, Dock Orbital)
        ├── CockpitMultispectralScanner.tsx       # Tiroir droit : Oscilloscope Canvas 2D temps réel + télémétrie spectrale + onde radar
        ├── CockpitSidebar.tsx                    # Tiroir gauche (Index Stellaire + Aide-mémoire PC & Tactile)
        ├── CockpitModals.tsx                     # Modales d'études de cas, canal de contact ('modal-contact'), auth sécurisée & ajout de projet
        └── CockpitFooter.tsx                     # Barre de statut télémétrique inférieure sur Desktop
```

---

## 5. Guide Rapide pour une IA Reprenant le Projet

1. **Persistance du Contexte WebGL** : Le `useEffect` principal de `ThreeSpaceCanvas.tsx` garde un tableau de dépendances `[]` ; les changements d'état (`activeWaypoint`, `scanMode`, `navigationMode`, `viewProjection`) passent par des `useRef` et les étiquettes projetées à l'écran se mettent à jour via DOM `style.transform` directement dans `animate()` (zéro re-render React).
2. **Sécurité** : Toute nouvelle entrée utilisateur ou URL externe doit passer par `sanitizeTextInput` ou `sanitizeExternalUrl` depuis `src/utils/security.ts`.
3. **Vérification du Build** : Exécutez toujours `compile_applet` et `lint_applet` ensemble après toute modification.
