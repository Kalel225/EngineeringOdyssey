export type WaypointKey = 'reset' | 'sun' | 'nextjs' | 'asteroids' | 'station';

export type CelestialType = 'sun' | 'planet' | 'asteroid' | 'station';

export interface CelestialTarget {
  id: WaypointKey | string;
  name: string;
  subtitle: string;
  category: string;
  meta: string;
  icon: string;
  colorClass: string;
  au: number;
  modalId?: string;
  techStack?: string[];
  metrics?: Record<string, string>;
}

export interface OpenSourceProject {
  id: string;
  name: string;
  title: string;
  stars: string;
  pr: string;
  desc: string;
  url: string;
  stack?: string;
  badge?: string;
}

export interface TelemetryState {
  x: number;
  y: number;
  z: number;
  distSol: number;
  velocity: number;
  warpProfile: string;
  elevation: number;
  azimuth: number;
  ping: number;
  coreIntegrity: number;
  warpHarmonic: string;
}

export interface ClusterLog {
  id: string;
  timestamp: string;
  source: string;
  type: 'info' | 'aws' | 'gcp' | 'warn';
  message: string;
}

export interface OfficerUser {
  name: string;
  rank: string;
  callsign: string;
  clearanceLevel: number;
  email: string;
}

export interface NewProjectFormData {
  title: string;
  type: CelestialType;
  stack: string;
  url: string;
  desc: string;
  metrics: string;
}

