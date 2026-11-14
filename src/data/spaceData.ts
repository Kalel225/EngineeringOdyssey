import { CelestialTarget, OpenSourceProject, ClusterLog } from '../types';

export const CELESTIAL_TARGETS: Record<string, CelestialTarget> = {
  sun: {
    id: 'sun',
    name: 'Sol Base • Origines & Fondations Algorithmiques',
    subtitle: 'Profil de l\'Ingénieur • Genèse Technologique',
    category: 'ÉTOILE G2V • MATRICE ORIGINELLE (0.00 AU)',
    meta: 'C/C++ • STRUCTURES FONDAMENTALES • WEBGL • BIO INGÉNIEUR',
    icon: 'wb_sunny',
    colorClass: 'bg-amber-400',
    au: 0.0,
    modalId: 'modal-sun',
    techStack: ['C99 / C++', 'Algorithmes de Tri', 'Arbres B+', 'Protocoles TCP/UDP', 'Assembleur'],
    metrics: {
      experience: '8+ Ans',
      commits: '4,920+',
      status: 'En Orbite',
      integrity: '100%'
    },
    gravitationalDepth: 28.5,
    orbitalParams: {
      semiMajorAxisAu: 0.0,
      simRadius: 0,
      periodDays: 0,
      velocityKmS: 0.0,
      eccentricity: 0.0,
      inclinationDeg: 0.0,
      periapsisAu: 0.0,
      apoapsisAu: 0.0,
      vectorLabel: 'BARYCENTRE HÉLIOCENTRIQUE • ATTRACTEUR CENTRAL'
    },
    spectralData: {
      optical: {
        bandName: 'OPTIQUE (VIS 380-750 nm)',
        wavelength: '520 nm (Émission Pic)',
        frequency: '576 THz',
        intensityDbm: -18.2,
        snrDb: 64.8,
        fluxDensity: '1,361 W/m²',
        thermalTempK: 5778,
        colorHex: '#e5a93c',
        signatureDesc: 'Photosphère G2V et granulation convective active. Raies d\'absorption Fraunhofer en H-alpha et Ca II.',
        details: [
          'Spectre de corps noir G2V stabilisé à 5 778 K',
          'Vent solaire continu mesuré à 450 km/s',
          'Couronne radiative en expansion à 1.5 × 10⁶ K'
        ],
        anomalies: ['Cycle magnétique de 11.2 ans nominal', 'Boucle coronale dense active sur le limbe nord']
      },
      infrared: {
        bandName: 'INFRAROUGE THERMIQUE (IR 3-15 µm)',
        wavelength: '9.6 µm',
        frequency: '31.2 THz',
        intensityDbm: -12.4,
        snrDb: 58.2,
        fluxDensity: '840 W/m²',
        thermalTempK: 6200,
        colorHex: '#f97316',
        signatureDesc: 'Gradient thermique radiatif issu du cœur thermonucléaire et des protubérances magnétiques.',
        details: [
          'Luminosité bolométrique : 3.828 × 10²⁶ W',
          'Taches solaires froides (Ombra) à 4 200 K',
          'Émission synchrotron secondaire dans les arcs'
        ],
        anomalies: ['Zone active chromosphérique mesurée à 7 800 K']
      },
      radio: {
        bandName: 'RADIO TÉLÉMÉTRIE (RF 1.42 - 10 GHz)',
        wavelength: '21.1 cm (Raie HI)',
        frequency: '1.420 GHz',
        intensityDbm: -42.8,
        snrDb: 48.0,
        fluxDensity: '2.4 × 10⁶ Jy',
        colorHex: '#38bdf8',
        signatureDesc: 'Bruit radio thermique solaire et sursauts de type III à dérive de fréquence rapide.',
        details: [
          'Émission cyclotron des électrons coronaux',
          'Fond diffus masqué par le lobe principal',
          'Horloge atomique de référence du système'
        ],
        anomalies: ['Balise de référence temporelle nominale']
      },
      gravitational: {
        bandName: 'ONDES GRAVITATIONNELLES (LISA 0.1-100 mHz)',
        wavelength: '3.0 × 10⁹ m',
        frequency: '0.1 mHz',
        intensityDbm: -8.0,
        snrDb: 88.4,
        fluxDensity: '28.0 G-units',
        colorHex: '#a78bfa',
        signatureDesc: 'Puits gravitationnel central dominant la métrique écliptique du système.',
        details: [
          'Masse stellaire : 1.989 × 10³⁰ kg',
          'Vitesse de libération : 617.7 km/s',
          'Gravité photosphérique : 274.0 m/s²'
        ],
        anomalies: ['Tenseur métrique stable sans dérive séculaire']
      }
    }
  },
  nextjs: {
    id: 'nextjs',
    name: 'Planète Next.js • Étude de Cas & SSR Edge',
    subtitle: 'Architecture Distribuée • Performance Edge SSR',
    category: 'PLANÈTE TELLURIQUE • ARCHITECTURE ENTERPRISE (3.48 AU)',
    meta: 'REACT SERVER COMPONENTS • TURBOPACK • 45MS TTFB • LIGHTHOUSE 100',
    icon: 'rocket_launch',
    colorClass: 'bg-sky-400',
    au: 3.48,
    modalId: 'modal-nextjs',
    techStack: [
      'Next.js 15 (App Router)',
      'React Server Components',
      'Edge Middleware (Geo-routing)',
      'Streaming SSR & Suspense',
      'Tailwind CSS & Design Tokens'
    ],
    metrics: {
      conversion: '+340%',
      ttfb: '45 ms',
      lighthouse: '100/100',
      availability: '99.99%'
    },
    gravitationalDepth: 14.2,
    orbitalParams: {
      semiMajorAxisAu: 3.48,
      simRadius: 66,
      periodDays: 482.4,
      velocityKmS: 24.2,
      eccentricity: 0.032,
      inclinationDeg: 0.0,
      periapsisAu: 3.37,
      apoapsisAu: 3.59,
      vectorLabel: 'ORBITE COPLANAIRE STABILISÉE • EXCENTRICITÉ 0.032'
    },
    spectralData: {
      optical: {
        bandName: 'OPTIQUE (VIS 380-750 nm)',
        wavelength: '488 nm (Diffusion Rayleigh)',
        frequency: '614 THz',
        intensityDbm: -34.6,
        snrDb: 52.3,
        fluxDensity: '412 W/m²',
        thermalTempK: 288,
        colorHex: '#38bdf8',
        signatureDesc: 'Océans profonds, couverture nuageuse troposphérique dynamique et anneaux de silicates/glace.',
        details: [
          'Albédo géométrique : 0.42 (Réflectance continentale & nuages)',
          'Anneaux planétaires avec division de Cassini résolue',
          'Satellite naturel lunaire verrouillé en orbite synchrone'
        ],
        anomalies: ['Lueurs métropolitaines nocturnes sur l\'hémisphère sombre']
      },
      infrared: {
        bandName: 'INFRAROUGE THERMIQUE (IR 3-15 µm)',
        wavelength: '10.2 µm',
        frequency: '29.4 THz',
        intensityDbm: -38.1,
        snrDb: 44.9,
        fluxDensity: '210 W/m²',
        thermalTempK: 295,
        colorHex: '#f97316',
        signatureDesc: 'Bilan radiatif tempéré à 288 K avec points thermiques sur les grappes de calcul Edge.',
        details: [
          'Refroidissement radiatif stabilisé',
          'Amplitude thermique jour/nuit : 18 K',
          'Rendement photovoltaïque orbital optimal'
        ],
        anomalies: ['Point chaud à 340 K lors des recompilations ISR globales']
      },
      radio: {
        bandName: 'RADIO TÉLÉMÉTRIE (RF 1.42 - 10 GHz)',
        wavelength: '5.2 cm',
        frequency: '5.80 GHz (Bande ISM)',
        intensityDbm: -28.4,
        snrDb: 62.1,
        fluxDensity: '8.2 × 10³ Jy',
        colorHex: '#38bdf8',
        signatureDesc: 'Liaison montante et descendante transportant le streaming HTTP/3 et React Server Components.',
        details: [
          'Bande passante Edge mesurée : 400 Gbps',
          'Gigue de synchronisation : < 0.2 ms',
          'Chiffrement TLS 1.3 actif'
        ],
        anomalies: ['Salves asynchrones lors du routage géographique multi-POP']
      },
      gravitational: {
        bandName: 'ONDES GRAVITATIONNELLES (LISA 0.1-100 mHz)',
        wavelength: '4.5 × 10⁹ m',
        frequency: '0.067 mHz',
        intensityDbm: -22.4,
        snrDb: 59.7,
        fluxDensity: '9.8 G-units',
        colorHex: '#a78bfa',
        signatureDesc: 'Puits gravitationnel tellurique maintenant l\'orbite de son satellite naturel.',
        details: [
          'Masse planétaire : 6.2 × 10²⁴ kg (1.04 Terre)',
          'Vitesse de libération : 11.4 km/s',
          'Gravité de surface : 9.81 m/s²'
        ],
        anomalies: ['Marées gravitationnelles nominales']
      }
    }
  },
  asteroids: {
    id: 'asteroids',
    name: 'Ceinture Principale • Open Source & RFCs',
    subtitle: 'Contributions majeures, revues de code & RFCs communautaires',
    category: 'CEINTURE D\'ASTÉROÏDES S/C-TYPE • OPEN SOURCE (5.82 AU)',
    meta: 'NEXT.JS • REACT • TAILWIND • TRPC • SHADCN • UV',
    icon: 'hub',
    colorClass: 'bg-stone-300',
    au: 5.82,
    modalId: 'modal-asteroids',
    gravitationalDepth: 6.8,
    orbitalParams: {
      semiMajorAxisAu: 5.82,
      simRadius: 106,
      periodDays: 1240.6,
      velocityKmS: 17.8,
      eccentricity: 0.064,
      inclinationDeg: 0.0,
      periapsisAu: 5.45,
      apoapsisAu: 6.19,
      vectorLabel: 'CEINTURE COPLANAIRE • 200 CORPS S/C/M-TYPE'
    },
    spectralData: {
      optical: {
        bandName: 'OPTIQUE (VIS 380-750 nm)',
        wavelength: '560 nm (Spectre Silicaté)',
        frequency: '535 THz',
        intensityDbm: -48.2,
        snrDb: 39.4,
        fluxDensity: '88 W/m²',
        thermalTempK: 145,
        colorHex: '#d6d3d1',
        signatureDesc: 'Régolithes silicatés (type S), chondrites carbonées (type C) et corps métalliques nickel-fer (type M).',
        details: [
          'Albédo moyen : 0.068 à 0.22 selon la classe spectrale',
          'Disque de poussière zodiacale diffusant la lumière solaire',
          '6 astéroïdes métalliques majeurs référencés'
        ],
        anomalies: ['Réflectance métallique élevée sur les 6 astéroïdes M-type']
      },
      infrared: {
        bandName: 'INFRAROUGE THERMIQUE (IR 3-15 µm)',
        wavelength: '12.8 µm',
        frequency: '23.4 THz',
        intensityDbm: -52.0,
        snrDb: 35.8,
        fluxDensity: '42 W/m²',
        thermalTempK: 152,
        colorHex: '#f59e0b',
        signatureDesc: 'Régime thermique cryogénique à faible inertie sous éclairement solaire oblique.',
        details: [
          'Température d\'équilibre radiatif : 145 K (-128 °C)',
          'Variations thermiques rapides selon la rotation',
          'Absence totale d\'atmosphère'
        ],
        anomalies: ['Inversion thermique ponctuelle sur le corps UV-PR (+22 K)']
      },
      radio: {
        bandName: 'RADIO TÉLÉMÉTRIE (RF 1.42 - 10 GHz)',
        wavelength: '21.1 cm & 3 cm',
        frequency: '1.420 GHz / 10 GHz',
        intensityDbm: -36.5,
        snrDb: 54.2,
        fluxDensity: '3.1 × 10⁴ Jy',
        colorHex: '#38bdf8',
        signatureDesc: 'Réseau maillé décentralisé diffusant les empreintes cryptographiques de commits.',
        details: [
          'Topologie P2P tolérante aux pannes',
          'Consensus distribué actif',
          'Horodatage atomique inter-nœuds'
        ],
        anomalies: ['Synchronisation globale lors des releases majeures']
      },
      gravitational: {
        bandName: 'ONDES GRAVITATIONNELLES (LISA 0.1-100 mHz)',
        wavelength: '8.2 × 10⁹ m',
        frequency: '0.036 mHz',
        intensityDbm: -31.8,
        snrDb: 42.1,
        fluxDensity: '3.4 G-units',
        colorHex: '#a78bfa',
        signatureDesc: 'Micro-perturbations de résonance orbitale réparties le long des lacunes de Kirkwood.',
        details: [
          'Masse combinée estimée : 3.2 × 10²¹ kg',
          'Lacunes de Kirkwood résolues dans le plan écliptique',
          'Forces de marée faibles'
        ],
        anomalies: ['Oscillations stables aux points de Lagrange L4 et L5']
      }
    }
  },
  station: {
    id: 'station',
    name: 'Station DevOps • Haute Disponibilité Cloud',
    subtitle: 'Modules Actifs : Docker • AWS Cloud • Google Cloud • K8s Live',
    category: 'CITADELLE ORBITALE • TÉLÉMÉTRIE MULTI-CLOUD (8.41 AU)',
    meta: 'DOCKER • AWS FARGATE • GOOGLE CLOUD GKE • KUBERNETES LIVE',
    icon: 'dns',
    colorClass: 'bg-emerald-400',
    au: 8.41,
    modalId: 'modal-station',
    gravitationalDepth: 18.0,
    orbitalParams: {
      semiMajorAxisAu: 8.41,
      simRadius: 148,
      periodDays: 2860.2,
      velocityKmS: 12.4,
      eccentricity: 0.014,
      inclinationDeg: 0.0,
      periapsisAu: 8.29,
      apoapsisAu: 8.53,
      vectorLabel: 'STATIONKEEPING SYNCHRONISÉ • MULTI-CLOUD GATEWAY'
    },
    spectralData: {
      optical: {
        bandName: 'OPTIQUE (VIS 380-750 nm)',
        wavelength: '532 nm (Réflectance Titane & Kapton)',
        frequency: '563 THz',
        intensityDbm: -31.2,
        snrDb: 58.7,
        fluxDensity: '310 W/m²',
        thermalTempK: 298,
        colorHex: '#10b981',
        signatureDesc: 'Structure pressurisée en titane brossé, isolant thermique Kapton doré et panneaux photovoltaïques saphir.',
        details: [
          'Albédo spéculaire : 0.88 sur les ailes photovoltaïques',
          'Feux de position anticollision babord/tribord actifs',
          'Anneau centrifuge pressurisé pour gravité interne'
        ],
        anomalies: ['Panneaux orientés selon le vecteur solaire']
      },
      infrared: {
        bandName: 'INFRAROUGE THERMIQUE (IR 3-15 µm)',
        wavelength: '8.4 µm',
        frequency: '35.7 THz',
        intensityDbm: -26.9,
        snrDb: 61.4,
        fluxDensity: '480 W/m²',
        thermalTempK: 410,
        colorHex: '#f59e0b',
        signatureDesc: 'Radiateurs dissipant la charge thermique des clusters Kubernetes et nœuds de calcul.',
        details: [
          'Température des échangeurs : 410 K',
          'Efficacité de refroidissement : 96.4%',
          'Bouclier thermique Kapton nominal'
        ],
        anomalies: ['Pointes radiatives corrélées aux déploiements ArgoCD']
      },
      radio: {
        bandName: 'RADIO TÉLÉMÉTRIE (RF 1.42 - 10 GHz)',
        wavelength: '1.07 cm (Bande Ka)',
        frequency: '28.0 GHz',
        intensityDbm: -19.5,
        snrDb: 72.8,
        fluxDensity: '4.8 × 10⁵ Jy',
        colorHex: '#38bdf8',
        signatureDesc: 'Antennes à balayage électronique assurant la liaison directe AWS Direct Connect & GCP Cloud Interconnect.',
        details: [
          'Liaison optique inter-satellitaire : 100 Gbps',
          'Télémétrie Kubernetes diffusée à 60 Hz',
          'Latence p99 mesurée : 18 ms'
        ],
        anomalies: ['Resynchronisation multi-région nominale toutes les 60 s']
      },
      gravitational: {
        bandName: 'ONDES GRAVITATIONNELLES (LISA 0.1-100 mHz)',
        wavelength: '1.2 × 10¹⁰ m',
        frequency: '0.025 mHz',
        intensityDbm: -27.1,
        snrDb: 53.6,
        fluxDensity: '6.2 G-units',
        colorHex: '#10b981',
        signatureDesc: 'Gravité artificielle centrifuge maintenue à 0.85 G dans le tore d\'habitation.',
        details: [
          'Masse orbitale : 4.8 × 10⁸ kg',
          'Volants d\'inertie magnétiques stabilisés',
          'Maintien à poste continu : 0.002 m/s²'
        ],
        anomalies: ['Harmoniques de rotation nominales']
      }
    }
  }
};

export const INITIAL_OPEN_SOURCE_PROJECTS: OpenSourceProject[] = [
  {
    id: 'nextjs-pr',
    name: 'vercel/next.js',
    title: 'Next.js App Runtime Bugfix & RFC',
    stars: '124k',
    pr: 'PR #67192 • Merged',
    desc: 'Optimisation de la résolution des route handlers et streaming SSR Edge multi-région.',
    url: 'https://github.com/vercel/next.js/pull/67192',
    stack: 'TypeScript / Turbopack'
  },
  {
    id: 'react-pr',
    name: 'facebook/react',
    title: 'React Server Actions Reconciliation',
    stars: '228k',
    pr: 'PR #28419 • Merged',
    desc: 'Amélioration de la gestion des transitions asynchrones en concurrent mode sans flicker.',
    url: 'https://github.com/facebook/react',
    stack: 'React Core / Fiber'
  },
  {
    id: 'tailwind-pr',
    name: 'tailwindlabs/tailwindcss',
    title: 'Tailwind CSS JIT Engine Refactor',
    stars: '82k',
    pr: 'PR #13824 • Merged',
    desc: 'Accélération du parseur de classes dynamiques et variables arbitraires CSS.',
    url: 'https://github.com/tailwindlabs/tailwindcss',
    stack: 'Rust / Lightning CSS'
  },
  {
    id: 'trpc-pr',
    name: 'trpc/trpc',
    title: 'tRPC End-to-End Type Safety',
    stars: '36k',
    pr: 'PR #5412 • Merged',
    desc: 'Typage strict des erreurs transverses et validation de payload Zod zero-copy.',
    url: 'https://github.com/trpc/trpc',
    stack: 'TypeScript / WebSocket'
  },
  {
    id: 'shadcn-pr',
    name: 'shadcn/ui',
    title: 'Accessible Radial Command Palette',
    stars: '75k',
    pr: 'PR #3120 • Merged',
    desc: 'Composants HUD accessibles conformes WAI-ARIA pour dashboards critiques.',
    url: 'https://github.com/shadcn-ui/ui',
    stack: 'Radix UI / Tailwind'
  },
  {
    id: 'uv-pr',
    name: 'astral-sh/uv',
    title: 'Ultra-fast Python Package Resolver',
    stars: '39k',
    pr: 'PR #8921 • Merged',
    desc: 'Benchmarks de concurrence multi-thread et cache distribué.',
    url: 'https://github.com/astral-sh/uv',
    stack: 'Rust / Tokio'
  }
];

export const INITIAL_CLUSTER_LOGS: ClusterLog[] = [
  {
    id: 'log-1',
    timestamp: '14:28:10',
    source: 'docker.daemon',
    type: 'info',
    message: 'container swarm node healthcheck 0 errs — 64/64 replicas online'
  },
  {
    id: 'log-2',
    timestamp: '14:28:12',
    source: 'cloudfront',
    type: 'aws',
    message: 'cache hit ratio 99.42% on edge POP CDG50-P2 (Paris Direct)'
  },
  {
    id: 'log-3',
    timestamp: '14:28:15',
    source: 'gke-autopilot',
    type: 'gcp',
    message: 'scaling event +2 pods triggered by traffic spike — p99 latency 18ms'
  },
  {
    id: 'log-4',
    timestamp: '14:28:18',
    source: 'argo-cd',
    type: 'info',
    message: 'Sync state is Synced to target revision HEAD (7a892b1)'
  }
];
