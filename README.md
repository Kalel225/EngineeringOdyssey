# Engineering Odyssey — Planisphère Écliptique & Observatoire Astrophysique

**Engineering Odyssey** est une expérience interactive d'ingénierie logicielle et de cartographie céleste inspirée des instruments d'observation scientifiques (*NASA Eyes on the Solar System*, planisphères célestes de haute précision et observatoires spatiaux), conçue pour présenter des projets d'architecture distribuée et de contributions Open Source au sein d'un système solaire héliocentrique réaliste et réactif.

---

## 1. Architecture Astrophysique Réaliste & Performance WebGL (`src/components/ThreeSpaceCanvas.tsx`)

### A. Plan Écliptique Coplanaire ($Y = 0$) & Double Projection (`Planisphère 2D` / `Observatoire`)
- **Planisphère Écliptique 2D (Vue par défaut)** :
  - Tous les corps célestes et la ceinture principale d'astéroïdes orbitent sur le même plan écliptique plat ($Y = 0$) conformément à la mécanique céleste réelle.
  - Les planètes, la Lune et la station orbitale se déplacent en temps réel le long de leurs ellipses képlériennes ($r(\theta) = \frac{a(1 - e^2)}{1 + e\cos\theta}$) avec suivi automatique de la caméra lorsqu'un astre est verrouillé.
  - Un **Planisphère Astrométrique** gradué (cercles concentriques d'Unités Astronomiques et graduations azimutales) ainsi que des **étiquettes astrométriques projetées à l'écran** (`00 SOL G2V`, `01 NEXT.JS`, `02 CEINTURE OS`, `03 STATION DEVOPS`) offrent une lisibilité immédiate de carte céleste sans re-render React.
  - Bascule instantanée entre **Planisphère 2D** (vue zénithale de carte céleste) et **Observatoire** (vue oblique) via le bouton du header ou la touche `P`.

### B. Shaders GLSL Rapides, PBR & Corps Célestes Réalistes
1. **Fond Stellaire de Classe Spectrale Harvard & Voie Lactée** :
   - Fond d'observatoire profond (`#020307`) traversé par une subtile bande de poussière stellaire de la Voie Lactée et 4 800 à 6 500 étoiles calibrées selon la classification spectrale de Harvard (O, B, A, F, G, K, M).
2. **Soleil G2V à 5 778 K — Sol Base 0.00 AU (`SOLAR_PLASMA_FRAGMENT_SHADER`)** :
   - **Assombrissement Centre-Bord Physique (*Limb Darkening*)** : Loi radiative $I(\mu) = 1 - u(1 - \mu)^{0.62}$.
   - **Convection FBM Optimisée (3 octaves Domain-Warped FBM + 3 octaves Ridged Magma)** : Granulation solaire, taches magnétiques, fissures de plasma et **couronne optique de diffusion Thomson (`SpriteMaterial` avec `CanvasTexture` radial)** offrant un rendu instantané à l'ouverture sans surcharge GPU.
3. **Planète Tellurique Next.js & Satellite Naturel — 3.48 AU** :
   - **Rendu *Blue Marble* Réaliste** : Océans profonds, continents, calottes glaciaires polaires, couche nuageuse cirrus, diffusion atmosphérique Rayleigh au limbe et lueurs urbaines nocturnes ambre-sodium (`#ffca68`).
   - **Anneaux Planétaires Silicatés** + **Lune Cratérisée en Orbite** autour de la planète.
4. **Ceinture Principale d'Astéroïdes (`THREE.InstancedMesh` à 1 Draw Call) & Mondes de Référence** :
   - **194 Astéroïdes de Fond** rendus en **un seul draw call (`InstancedMesh`)** avec coloration minérale par instance, complétés par 6 astéroïdes M-type inspectables et des corps de référence du système (monde rocheux interne de type Mercure et géante gazeuse externe annelée).
   - **Station Orbitale Aérospatiale & Réflexions PBR (`RoomEnvironment` + `PMREMGenerator`)** : Coque en titane brossé, isolant thermique multicouche en **Kapton doré** et panneaux photovoltaïques saphir reflétant fidèlement l'éclairage d'environnement.

### C. Démarrage Rapide & Régulation Multi-Matériel
- **Pré-compilation GPU (`renderer.compile`)** + séquence d'amorce rapide (~420 ms) dans `CockpitLoadingScreen.tsx`.
- **Régulation `afterDraw` (`gl.fenceSync`)** en environnement logiciel (`SwiftShader` / `LLVMpipe`), suppression complète des flous CSS coûteux (`backdrop-filter`) au-dessus du WebGL et repli d'état sécurisé en cas de perte de contexte WebGL.

---

## 2. Ergonomie Multi-Support : PC (Desktop), Tablette & Mobile

- **Raccourcis Clavier PC** : `P` (Planisphère 2D / Observatoire), `←` / `→` (Chapitre précédent / suivant), `0`–`4` (Accès direct aux astres), `S` (Scanner Multispectral), `V` (Voyage / Libre), `Échap` (Fermer ou Vue Globale).
- **Tablette & Mobile (`< 1024px`)** : Barre supérieure matte avec bascule `2D Plan / Oblique`, contrôle tactile 1 doigt (orbite) / 2 doigts (zoom) et dock inférieur accessible.

---

## 3. Sécurité & Structure des Fichiers

- **`src/utils/security.ts` & `SECURITY_AND_QUALITY_AUDIT.md`** : Validation stricte d'URL (`sanitizeExternalUrl`), sanitisation des entrées (`sanitizeTextInput`), validation `localStorage` (`validateOfficerSession`) et rate-limiting d'authentification (`verifyOfficerCredentials`).
- **Typographie & Tokens (`src/index.css`, `index.html`)** : `Plus Jakarta Sans` (titres), `IBM Plex Sans` (corps éditorial) et `JetBrains Mono` (`.tabular-nums` pour la télémétrie) sur surfaces mates haute lisibilité (`#060911` / `#0a0f1a`).
