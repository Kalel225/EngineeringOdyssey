# AI CONTEXT & MODEL HANDOFF DOCUMENT — ENGINEERING ODYSSEY

> **OBJECTIF DE CE DOCUMENT** : Ce fichier est conçu spécifiquement pour transmettre **100 % du contexte technique, visuel, sécuritaire, performant et historique** du projet **Engineering Odyssey** à une autre Intelligence Artificielle (LLM / Agent de code) en cas de bascule de modèle au cours du développement. (Voir également `/AI_CONTEXT_HANDOFF.md`).

---

## 1. Identité & Direction Artistique Actuelle du Projet

- **Nom de l'application** : `Engineering Odyssey` (défini dans `metadata.json` et `index.html` — **ne jamais renommer**).
- **Concept** : Portfolio d'ingénierie logicielle et planisphère céleste interactif (WebGL / Three.js) organisé autour d'un système solaire héliocentrique réaliste dans le *Secteur 12-Vega*.
- **Positionnement Visuel** : **« Planisphère Écliptique Réaliste & Observatoire Astrophysique de Haute Précision »**.
  - Le système solaire est **coplanaire sur le plan écliptique ($Y = 0$)** avec une vue par défaut en **Planisphère 2D** et un commutateur instantané vers la vue **Observatoire** oblique (touche `P`).
  - Design d'observatoire mat haute lisibilité (`#020307`, `#060911`, `#e5a93c` Solar Amber, `#38bdf8` Ice Sky), typographies `Plus Jakarta Sans` + `IBM Plex Sans` + `JetBrains Mono` (`.tabular-nums`).

---

## 2. Invariants Stricts, Performance WebGL & Sécurité

1. **Pas d'orbes de données lumineux autour des astres** (retirés à la demande de l'utilisateur).
2. **Pas de bouton « Inspecter » séparé dans les popups de survol (`#scanner-reticle`)** (toute la carte est cliquable).
3. **Performance & Rendu Sans Blocage** :
   - Zéro `backdrop-filter: blur(...)` au-dessus du canvas WebGL actif (surfaces mates à haute opacité).
   - Shader solaire optimisé (3 octaves Domain-Warped FBM + 3 octaves Ridged Magma), ceinture d'astéroïdes en `THREE.InstancedMesh` (1 draw call), `RoomEnvironment` PBR, couronne optique solaire, Lune orbitale, étiquettes astrométriques projetées à l'écran et régulation `afterDraw` (`gl.fenceSync`) sur Software WebGL.
4. **Planisphère Écliptique Coplanaire ($Y = 0$) & Commutateur `Planisphère 2D` / `Observatoire` (touche `P`)**.
5. **Module de Sécurité (`src/utils/security.ts`)** :
   - `sanitizeExternalUrl`, `sanitizeTextInput`, `validateOfficerSession`, `verifyOfficerCredentials` & `checkAuthRateLimit`.
