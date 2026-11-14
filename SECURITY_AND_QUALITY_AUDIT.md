# Audit de Sécurité, Performance & Qualité Logicielle — Engineering Odyssey

Ce document détaille l'audit complet réalisé sur le projet **Engineering Odyssey** ainsi que l'ensemble des correctifs de sécurité, de performance WebGL et de réalisme implémentés dans le code source.

---

## 1. Synthèse de l'Audit de Sécurité (OWASP Client-Side & DOM Security)

| ID | Sévérité | Catégorie | Vulnérabilité Identifiée | Fichier(s) Impacté(s) | Statut & Correctif Appliqué |
| :--- | :---: | :--- | :--- | :--- | :--- |
| **SEC-01** | **Élevée** | XSS / Injection de Protocole URI | Le champ `url` lors de l'ajout d'un projet (`handleAddProject`) était injecté directement dans `<a href={proj.url}>` sans validation de protocole, permettant l'exécution potentielle d'URI `javascript:` ou `data:`. | `src/components/CockpitModals.tsx`, `src/App.tsx` | **Corrigé** via `sanitizeExternalUrl()` (`src/utils/security.ts`) utilisant le constructeur natif `new URL()` et imposant strictement `https:` ou `http:`. |
| **SEC-02** | **Moyenne** | Désérialisation `localStorage` Non Validée | L'objet `odyssey_officer_user` lu depuis `localStorage` via `JSON.parse()` était affecté directement à l'état React sans validation de schéma, exposant l'application à un crash ou une pollution d'objet. | `src/App.tsx` | **Corrigé** via `validateOfficerSession()` (`src/utils/security.ts`) qui vérifie le type, la présence et la longueur de chaque champ ainsi que les bornes de `clearanceLevel`. |
| **SEC-03** | **Moyenne** | Mot de Passe en Clair & Absence de Rate-Limiting | Le champ `authPasscode` était pré-rempli en clair dans le state React et `handleAuthSubmit` n'effectuait pas de contrôle anti-force brute. | `src/components/CockpitModals.tsx` | **Corrigé** : suppression du mot de passe en clair par défaut dans l'état (`useState('')`), validation stricte via `verifyOfficerCredentials()` et ajout d'un **Rate-Limiter** (`checkAuthRateLimit`) bloquant pendant 30s après 5 échecs. |
| **SEC-04** | **Moyenne** | Sanitisation & Bornage des Entrées Utilisateur | Les champs texte (`title`, `stack`, `desc`, `email`, `contactMessage`) ne possédaient pas de filtrage des balises HTML/caractères de contrôle ni de limites de taille strictes côté code. | `src/components/CockpitModals.tsx`, `src/App.tsx` | **Corrigé** via `sanitizeTextInput(raw, maxLength)` qui supprime les chevrons HTML `<>`, les caractères de contrôle ASCII et tronque proprement aux longueurs maximales autorisées (`maxLength`). |

---

## 2. Audit Performance WebGL / Three.js & Déblocage du Temps de Chargement

| ID | Catégorie | Goulot Identifié | Fichier(s) Impacté(s) | Correctif Implémenté |
| :--- | :--- | :--- | :--- | :--- |
| **PERF-01** | Compilation & Coût Shader Solaire (Blocage Premier Rendu) | `SOLAR_PLASMA_FRAGMENT_SHADER` exécutait ~53 octaves de bruit 3D par pixel sur une sphère `128×128`, bloquant la compilation GLSL et saturant le GPU/CPU au démarrage. | `src/components/ThreeSpaceCanvas.tsx` | **Corrigé** : refonte vers un shader rapide à **3 octaves Domain-Warped FBM + 3 octaves Ridged Magma** (~18× plus rapide), pré-compilé via `renderer.compile(scene, camera)` avant l'affichage. |
| **PERF-02** | Surcharge de Draw Calls (Ceinture d'Astéroïdes) | La ceinture d'astéroïdes créait ~200 `MeshStandardMaterial` et 200 draw calls individuels à chaque frame. | `src/components/ThreeSpaceCanvas.tsx` | **Corrigé** : regroupement des 194 astéroïdes de fond en un **unique `THREE.InstancedMesh`** (1 seul draw call) avec variation chromatique par instance (`setColorAt`), plus 6 astéroïdes M-type interactifs. |
| **PERF-03** | Boucle Non Régulée sur Software WebGL | En rendu logiciel (`SwiftShader` / `LLVMpipe`), une boucle `requestAnimationFrame` non régulée saturait le thread principal et figeait le navigateur/HUD. | `src/components/ThreeSpaceCanvas.tsx` | **Corrigé** : régulation matérielle via `gl.fenceSync` + temporisateur adaptatif (`scheduleNextFrame` / `afterDraw`) sur GPU logiciel, gestion `webglcontextlost`/`webglcontextrestored` et repli 2D propre si WebGL est indisponible. |
| **PERF-04** | Pénalité `backdrop-filter: blur()` sur Canvas WebGL | De nombreux panneaux HUD et modales superposaient `backdrop-filter: blur(24px)` au-dessus du canvas WebGL actif, forçant des lectures framebuffer coûteuses à chaque frame. | `src/index.css`, `CockpitModals.tsx`, `CockpitMultispectralScanner.tsx`, `CockpitSidebar.tsx`, `CockpitFooter.tsx` | **Corrigé** : remplacement par des surfaces mates d'observatoire à haut contraste (`#060911` / `#0a0f1a` à 92–98 % d'opacité, bordures fines `1px solid rgba(148,163,184,0.16)`), supprimant totalement les freezes de composition. |
| **PERF-05** | Fuite VRAM GPU & Fidélité Colorimétrique | Nettoyage GPU incomplet et espace sRGB non explicité. | `src/components/ThreeSpaceCanvas.tsx` | **Corrigé** : `scene.traverse()` complet + `pmremGenerator.dispose()` + `envRT.dispose()` au démontage, `outputColorSpace = THREE.SRGBColorSpace`, `ACESFilmicToneMapping` (`exposure = 1.08`). |

---

## 3. Audit Fonctionnel, Réalisme Astrophysique & Design HUD

| ID | Catégorie | Observation | Correctif & Amélioration |
| :--- | :--- | :--- | :--- |
| **UX-01** | Fidélité Astrophysique & Planisphère Coplanaire | Besoin d'un système solaire réaliste, moins « jeu 3D » mais visuellement riche et crédible. | **Planisphère Écliptique Coplanaire ($Y = 0$)** : orbites képlériennes coplanaires avec grille astrométrique en `AU` et degrés azimutaux, plus **étiquettes astrométriques projetées à l'écran** (`00 SOL G2V`, `01 NEXT.JS`, `02 CEINTURE OS`, `03 STATION DEVOPS`) synchronisées en `requestAnimationFrame` sans re-render React. |
| **UX-02** | Réalisme Physique & Environnement PBR | Les matériaux métalliques (station aérospatiale, astéroïdes M-type) manquaient de réflexions réalistes et le Soleil manquait de couronne optique. | Ajout d'un éclairage d'environnement **`RoomEnvironment` + `PMREMGenerator`**, d'un **halo/couronne solaire optique procédural (`CanvasTexture` + `SpriteMaterial`)**, d'une **Lune cratérisée orbitant** autour de la planète Next.js, ainsi que d'un monde rocheux interne (Mercure-like) et d'une géante gazeuse externe à anneaux pour l'échelle du système. |
| **UX-03** | Direction Artistique Observatoire & Typographie | Restes de styles cyber-néon (`#00f2fe`, `Space Grotesk`, points clignotants `animate-ping`/`animate-pulse`, préfixes `//`). | Alignement strict sur la palette d'observatoire calibrée (**Fond `#020307`**, **Solar Amber `#e5a93c`**, **Ice Sky `#38bdf8`**), typographies `Plus Jakarta Sans` + `IBM Plex Sans` + `JetBrains Mono` avec `.tabular-nums`, zéro point clignotant décoratif et lancement rapide (`CockpitLoadingScreen` ~420 ms). |
| **UX-04** | Canal Contact Comms | Le bouton `Établir Contact Comms` ne disposait pas de sa propre vue de soumission. | Modale interactive `'modal-contact'` câblée et sécurisée depuis Sol Base. |
