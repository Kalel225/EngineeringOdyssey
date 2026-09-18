import { CelestialTarget, OpenSourceProject, ClusterLog } from '../types';

export const CELESTIAL_TARGETS: Record<string, CelestialTarget> = {
  sun: {
    id: 'sun',
    name: 'Sol Base • Origines & Fondations Algorithmiques',
    subtitle: 'Hero Space // Profil de l\'Ingénieur & Genèse Technologique',
    category: 'STAR CLASS G2V // ORIGIN MATRIX (0.0 AU)',
    meta: 'C/C++ • STRUCTURES FONDAMENTALES • WEB NATIF • BIO INGÉNIEUR',
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
    }
  },
  nextjs: {
    id: 'nextjs',
    name: 'Planète Next.js • Étude de Cas & SSR Edge',
    subtitle: 'Étude de cas Glassmorphic • Performance 99+ • Cache Edge',
    category: 'TERRESTRIAL WORLD // ENTERPRISE ARCHITECTURE (3.48 AU)',
    meta: 'REACT SERVER COMPONENTS • TURBOPACK • 45MS TTFB • LIGHTHOUSE 100',
    icon: 'rocket_launch',
    colorClass: 'bg-cyan-400',
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
    }
  },
  asteroids: {
    id: 'asteroids',
    name: 'Ceinture Open Source • Repos & RFCs',
    subtitle: 'Contributions majeures, revues de code & RFCs communautaires',
    category: 'ORBITAL ASTEROID BELT // GLOBAL CONTRIBUTIONS (5.82 AU)',
    meta: 'NEXT.JS • REACT • TAILWIND • TRPC • SHADCN • UV',
    icon: 'hub',
    colorClass: 'bg-purple-400',
    au: 5.82,
    modalId: 'modal-asteroids'
  },
  station: {
    id: 'station',
    name: 'Station DevOps • Haute Disponibilité Cloud',
    subtitle: 'Modules Actifs : Docker • AWS Cloud • Google Cloud • K8s Live',
    category: 'CITADEL CLASS ORBITER // MULTI-CLOUD TELEMETRY (8.41 AU)',
    meta: 'DOCKER • AWS FARGATE • GOOGLE CLOUD GKE • KUBERNETES LIVE',
    icon: 'dns',
    colorClass: 'bg-emerald-400',
    au: 8.41,
    modalId: 'modal-station'
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
