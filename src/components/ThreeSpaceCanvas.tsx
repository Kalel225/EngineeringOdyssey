import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { WaypointKey, CelestialTarget, ScanMode } from '../types';
import { CELESTIAL_TARGETS } from '../data/spaceData';
import { spaceSynth } from '../utils/audioSynth';

interface ThreeSpaceCanvasProps {
  activeWaypoint: WaypointKey;
  freecam: boolean;
  scanMode: ScanMode;
  navigationMode?: 'free' | 'voyage';
  viewProjection?: 'planisphere' | 'observatory';
  pulseTrigger?: number;
  onSelectTarget: (targetKey: WaypointKey) => void;
  onHoverTarget: (target: CelestialTarget | null) => void;
  onHoverOrbit?: (target: CelestialTarget | null) => void;
  onUpdateTelemetry: (x: number, y: number, z: number, distAU: number) => void;
}

// Pre-allocated math helpers outside render loop (zero GC churn)
const _projVec = new THREE.Vector3();
const _dummyMatrix = new THREE.Object3D();

// ============================================================================
// FAST, PHOTOREALISTIC ASTROPHYSICAL GLSL SHADERS
// ============================================================================

const NEBULA_VERTEX_SHADER = `
  varying vec3 vWorldPosition;
  void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const NEBULA_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform int uScanMode;
  varying vec3 vWorldPosition;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; ++i) {
      v += a * noise(p);
      p = p * 2.04 + vec3(0.13, -0.07, 0.11);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 dir = normalize(vWorldPosition);
    float n1 = fbm(dir * 2.5 + vec3(uTime * 0.002, 0.0, 0.0));
    float n2 = fbm(dir * 5.2 - vec3(0.0, uTime * 0.002, 0.0));
    float band = exp(-abs(dir.y * 0.88 + dir.x * 0.24) * 3.8);
    float dustMask = smoothstep(0.36, 0.80, n1 * 0.65 + n2 * 0.35);

    vec3 deepVoid = vec3(0.007, 0.010, 0.017);
    vec3 starlight = vec3(0.075, 0.115, 0.185);
    vec3 dustWarm = vec3(0.145, 0.105, 0.075);

    if (uScanMode == 1) {
      starlight = vec3(0.28, 0.07, 0.02);
      dustWarm = vec3(0.16, 0.03, 0.06);
    } else if (uScanMode == 2) {
      starlight = vec3(0.02, 0.18, 0.32);
      dustWarm = vec3(0.01, 0.10, 0.22);
    } else if (uScanMode == 3) {
      starlight = vec3(0.14, 0.06, 0.24);
      dustWarm = vec3(0.07, 0.03, 0.15);
    }

    vec3 milkyWay = mix(dustWarm, starlight, smoothstep(0.38, 0.68, n2));
    vec3 finalColor = deepVoid + milkyWay * dustMask * (0.18 + 0.82 * band) * 0.45;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const SOLAR_PLASMA_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;
  varying float vEruption;
  uniform float uTime;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
    );
  }

  void main() {
    vec3 dir = normalize(position);
    float n = noise(dir * 4.5 + vec3(uTime * 0.18, -uTime * 0.14, uTime * 0.11));
    float n2 = noise(dir * 9.0 - vec3(uTime * 0.22));
    float eruption = smoothstep(0.55, 0.90, n * 0.65 + n2 * 0.35);
    float disp = (n - 0.5) * 0.10 + eruption * 0.16;

    vEruption = eruption;
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    vec4 mvPosition = modelViewMatrix * vec4(position + normal * disp, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const SOLAR_PLASMA_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform int uScanMode;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vViewPosition;
  varying float vEruption;

  const mat3 m3 = mat3(
     0.00,  0.80,  0.60,
    -0.80,  0.36, -0.48,
    -0.60, -0.48,  0.64
  );

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
    );
  }

  float fbm3(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; ++i) {
      v += a * noise(p);
      p = m3 * p * 2.1 + vec3(uTime * 0.04, -uTime * 0.03, uTime * 0.03);
      a *= 0.5;
    }
    return v;
  }

  float ridged3(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; ++i) {
      float n = 1.0 - abs(noise(p) * 2.0 - 1.0);
      v += n * n * a;
      p = m3 * p * 2.2 - vec3(uTime * 0.09, uTime * 0.07, 0.0);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float mu = max(dot(vNormal, viewDir), 0.0);
    // Physical Solar Limb Darkening: I(mu) = 1 - u*(1 - mu)
    float limbDarkening = 1.0 - 0.56 * (1.0 - pow(mu, 0.62));
    float rim = pow(1.0 - mu, 3.0);

    vec3 p = vPosition * 0.30;
    vec3 q = vec3(
      fbm3(p + vec3(0.0, uTime * 0.09, 0.0)),
      fbm3(p + vec3(5.2, 1.3, 2.8) - vec3(uTime * 0.07)),
      fbm3(p + vec3(1.7, 9.2, 4.1) + vec3(0.0, 0.0, uTime * 0.10))
    );

    float convection = fbm3(p * 1.45 + 1.85 * q);
    float fineGranules = fbm3(p * 5.2 - q * 1.1 + vec3(uTime * 0.22));
    float magmaCracks = ridged3(p * 2.1 + q * 1.3);

    float sunspotMask = smoothstep(0.24, 0.41, convection);
    float crackGlow = pow(clamp(magmaCracks, 0.0, 1.0), 2.0);
    float heat = (convection * 0.45 + fineGranules * 0.35 + crackGlow * 0.45 + vEruption * 0.25) * (0.28 + 0.72 * sunspotMask);

    vec3 umbra = vec3(0.12, 0.018, 0.002);
    vec3 deepOrange = vec3(0.76, 0.17, 0.012);
    vec3 photosphere = vec3(0.98, 0.49, 0.05);
    vec3 gold = vec3(1.0, 0.82, 0.32);
    vec3 whiteHot = vec3(1.0, 0.98, 0.91);

    if (uScanMode == 1) {
      umbra = vec3(0.08, 0.0, 0.12);
      deepOrange = vec3(0.58, 0.04, 0.18);
      photosphere = vec3(0.98, 0.28, 0.02);
    } else if (uScanMode == 2) {
      umbra = vec3(0.01, 0.06, 0.18);
      deepOrange = vec3(0.0, 0.30, 0.62);
      photosphere = vec3(0.08, 0.65, 0.94);
      gold = vec3(0.55, 0.94, 1.0);
    } else if (uScanMode == 3) {
      umbra = vec3(0.05, 0.01, 0.14);
      deepOrange = vec3(0.32, 0.06, 0.56);
      photosphere = vec3(0.65, 0.22, 0.92);
      gold = vec3(0.90, 0.68, 1.0);
    }

    vec3 col = mix(umbra, deepOrange, smoothstep(0.08, 0.28, heat));
    col = mix(col, photosphere, smoothstep(0.24, 0.50, heat));
    col = mix(col, gold, smoothstep(0.46, 0.72, heat));
    col = mix(col, whiteHot, smoothstep(0.70, 0.94, heat));

    col += mix(photosphere, whiteHot, crackGlow) * crackGlow * 0.55;
    col *= limbDarkening;
    col += mix(deepOrange, gold, 0.6) * rim * 1.1;

    gl_FragColor = vec4(col, 1.0);
  }
`;

const STARFIELD_VERTEX_SHADER = `
  attribute float aSize;
  attribute float aPhase;
  varying vec3 vColor;
  varying float vTwinkle;
  varying float vSize;
  uniform float uTime;
  uniform float uWarpBoost;
  uniform float uPixelRatio;

  void main() {
    vColor = color;
    vSize = aSize;
    float freq = 1.0 + fract(aPhase * 0.37) * 2.4;
    float twinkle = 0.78 + 0.22 * sin(uTime * freq + aPhase);
    vTwinkle = twinkle;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float distScale = 400.0 / max(-mvPosition.z, 10.0);
    gl_PointSize = clamp((aSize * twinkle + uWarpBoost * 1.2) * uPixelRatio * distScale, 1.2, 24.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const STARFIELD_FRAGMENT_SHADER = `
  varying vec3 vColor;
  varying float vTwinkle;
  varying float vSize;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;

    float core = exp(-d * 14.5);
    float halo = exp(-d * 4.8) * 0.48;
    float spikeStrength = smoothstep(2.4, 4.4, vSize) * vTwinkle;
    float spikeH = max(0.0, 1.0 - abs(uv.y * 32.0)) * max(0.0, 1.0 - abs(uv.x * 2.2));
    float spikeV = max(0.0, 1.0 - abs(uv.x * 32.0)) * max(0.0, 1.0 - abs(uv.y * 2.2));
    float spikes = (pow(spikeH, 1.6) + pow(spikeV, 1.6)) * spikeStrength * 0.75;

    float brightness = core * 1.2 + halo + spikes;
    vec3 finalCol = mix(vColor, vec3(1.0, 0.99, 0.97), clamp(core * 1.1 + spikes * 0.4, 0.0, 1.0));
    gl_FragColor = vec4(finalCol * (1.0 + 0.2 * vTwinkle), clamp(brightness * vTwinkle, 0.0, 1.0));
  }
`;

const FRESNEL_GLOW_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRESNEL_GLOW_FRAGMENT_SHADER = `
  uniform vec3 uColorCore;
  uniform vec3 uColorRim;
  uniform float uPower;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float dotNV = abs(dot(vNormal, viewDir));
    float intensity = pow(1.0 - dotNV, uPower) * uIntensity;
    vec3 col = mix(uColorRim, uColorCore, dotNV);
    gl_FragColor = vec4(col * intensity, clamp(intensity, 0.0, 1.0));
  }
`;

const PLANET_NEXT_VERTEX_SHADER = `
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const PLANET_NEXT_FRAGMENT_SHADER = `
  uniform float uTime;
  uniform vec3 uSunPosition;
  uniform int uScanMode;
  varying vec3 vNormal;
  varying vec3 vWorldNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vViewPosition;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
          mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
          mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; ++i) {
      v += a * noise(p);
      p = p * 2.15;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 lightDir = normalize(uSunPosition - vWorldPosition);
    vec3 viewDir = normalize(vViewPosition);
    float ndotl = dot(vWorldNormal, lightDir);
    float dayFactor = smoothstep(-0.14, 0.22, ndotl);

    vec3 p = vPosition * 0.36;
    float continent = fbm(p);
    float detail = fbm(p * 3.6);
    float isLand = smoothstep(0.47, 0.52, continent);
    float latitude = abs(normalize(vPosition).y);
    float polarIce = smoothstep(0.76, 0.88, latitude + detail * 0.08);
    float clouds = smoothstep(0.49, 0.76, fbm(p * 2.1 + vec3(uTime * 0.02, 0.0, uTime * 0.015)));

    vec3 deepOcean = vec3(0.022, 0.082, 0.175);
    vec3 shallowCoast = vec3(0.045, 0.20, 0.33);
    vec3 oceanCol = mix(deepOcean, shallowCoast, smoothstep(0.38, 0.48, continent));

    vec3 forestBiome = vec3(0.11, 0.24, 0.15);
    vec3 ochreContinental = vec3(0.48, 0.39, 0.27);
    vec3 mountainSnow = vec3(0.86, 0.89, 0.93);
    vec3 landCol = mix(forestBiome, ochreContinental, smoothstep(0.36, 0.72, detail));
    landCol = mix(landCol, mountainSnow, smoothstep(0.76, 0.92, detail));

    vec3 daySurface = mix(oceanCol, landCol, isLand);
    daySurface = mix(daySurface, vec3(0.93, 0.96, 0.99), polarIce);

    // Solar ocean specular reflection
    vec3 halfVec = normalize(lightDir + normalize(cameraPosition - vWorldPosition));
    float spec = pow(max(dot(vWorldNormal, halfVec), 0.0), 64.0) * (1.0 - isLand) * (1.0 - polarIce);
    daySurface += vec3(1.0, 0.95, 0.82) * spec * 0.70;
    daySurface = mix(daySurface, vec3(0.95, 0.97, 1.0), clouds * 0.64);

    // Black Marble night city lights
    float cityClusters = smoothstep(0.61, 0.76, detail) * isLand * (1.0 - polarIce);
    float gridLat = abs(sin(vPosition.y * 3.1));
    float gridLon = abs(sin(atan(vPosition.z, vPosition.x) * 14.0));
    float corridors = smoothstep(0.965, 0.996, max(gridLat, gridLon)) * isLand * (1.0 - polarIce);
    vec3 amberLights = vec3(1.0, 0.78, 0.38) * cityClusters * 1.3 + vec3(0.38, 0.78, 1.0) * corridors * 0.5;
    vec3 nightSurface = vec3(0.010, 0.016, 0.032) + amberLights * (1.0 - clouds * 0.65);

    vec3 finalCol = mix(nightSurface, daySurface * max(ndotl, 0.15) * 1.45, dayFactor);

    float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.1);
    vec3 rimCol = uScanMode == 1 ? vec3(0.95, 0.38, 0.08) : vec3(0.28, 0.68, 1.0);
    finalCol += rimCol * fresnel * (0.35 + 0.65 * dayFactor);

    gl_FragColor = vec4(finalCol, 1.0);
  }
`;

const GAS_GIANT_VERTEX_SHADER = `
  varying vec3 vWorldNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  void main() {
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vPosition = position;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPosition = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

const GAS_GIANT_FRAGMENT_SHADER = `
  uniform float uTime;
  varying vec3 vWorldNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;

  void main() {
    vec3 lightDir = normalize(-vWorldPosition);
    float ndotl = max(dot(vWorldNormal, lightDir), 0.06);
    float lat = normalize(vPosition).y;
    float bands = sin(lat * 26.0 + sin(vPosition.x * 0.4 + uTime * 0.08) * 0.6) * 0.5 + 0.5;
    float storm = smoothstep(0.75, 0.95, sin(lat * 12.0) * cos(atan(vPosition.z, vPosition.x) * 3.0 + uTime * 0.04));

    vec3 cream = vec3(0.84, 0.75, 0.62);
    vec3 ochre = vec3(0.62, 0.45, 0.32);
    vec3 rust  = vec3(0.48, 0.28, 0.18);
    vec3 col = mix(ochre, cream, bands);
    col = mix(col, rust, storm * 0.45);
    gl_FragColor = vec4(col * (0.14 + 1.25 * ndotl), 1.0);
  }
`;

const RING_SYSTEM_VERTEX_SHADER = `
  varying vec3 vPos;
  void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const RING_SYSTEM_FRAGMENT_SHADER = `
  uniform vec3 uColorPrimary;
  uniform vec3 uColorSecondary;
  uniform float uInnerR;
  uniform float uOuterR;
  varying vec3 vPos;

  void main() {
    float dist = length(vPos.xy);
    float r = clamp((dist - uInnerR) / (uOuterR - uInnerR), 0.0, 1.0);
    float bands = sin(r * 78.0) * 0.5 + 0.5;
    float fineGrooves = sin(r * 195.0) * 0.5 + 0.5;
    float cassiniGap = smoothstep(0.025, 0.065, abs(r - 0.60));
    float enckeGap = smoothstep(0.01, 0.025, abs(r - 0.84));
    float edgeFade = smoothstep(0.0, 0.10, r) * (1.0 - smoothstep(0.88, 1.0, r));
    float alpha = (0.18 + 0.42 * bands * (0.6 + 0.4 * fineGrooves)) * cassiniGap * enckeGap * edgeFade;
    vec3 col = mix(uColorPrimary, uColorSecondary, fineGrooves * 0.6 + bands * 0.4);
    gl_FragColor = vec4(col, alpha * 0.65);
  }
`;

// Procedural optical solar corona texture (100% self-contained CanvasTexture, zero network fetch)
function createSolarGlowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const c = size / 2;
    const grad = ctx.createRadialGradient(c, c, 8, c, c, c);
    grad.addColorStop(0.0, 'rgba(255, 250, 232, 0.92)');
    grad.addColorStop(0.22, 'rgba(255, 212, 128, 0.58)');
    grad.addColorStop(0.48, 'rgba(245, 130, 32, 0.22)');
    grad.addColorStop(0.76, 'rgba(180, 62, 12, 0.06)');
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

export const ThreeSpaceCanvas: React.FC<ThreeSpaceCanvasProps> = ({
  activeWaypoint,
  freecam,
  scanMode,
  navigationMode = 'free',
  viewProjection = 'planisphere',
  pulseTrigger = 0,
  onSelectTarget,
  onHoverTarget,
  onHoverOrbit,
  onUpdateTelemetry,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<Record<'sun' | 'nextjs' | 'asteroids' | 'station', HTMLButtonElement | null>>({
    sun: null,
    nextjs: null,
    asteroids: null,
    station: null,
  });

  const [webglError, setWebglError] = useState<boolean>(false);

  const navigateToRef = useRef<((key: WaypointKey) => void) | null>(null);
  const scanModeRef = useRef<ScanMode>(scanMode);
  scanModeRef.current = scanMode;

  const navigationModeRef = useRef(navigationMode);
  navigationModeRef.current = navigationMode;

  const viewProjectionRef = useRef(viewProjection);
  viewProjectionRef.current = viewProjection;

  const activeWaypointRef = useRef(activeWaypoint);
  activeWaypointRef.current = activeWaypoint;

  const triggerPulseRef = useRef<(() => void) | null>(null);

  const onSelectTargetRef = useRef(onSelectTarget);
  onSelectTargetRef.current = onSelectTarget;

  const onHoverTargetRef = useRef(onHoverTarget);
  onHoverTargetRef.current = onHoverTarget;

  const onHoverOrbitRef = useRef(onHoverOrbit);
  onHoverOrbitRef.current = onHoverOrbit;

  const onUpdateTelemetryRef = useRef(onUpdateTelemetry);
  onUpdateTelemetryRef.current = onUpdateTelemetry;

  const freecamRef = useRef(freecam);
  freecamRef.current = freecam;

  useEffect(() => {
    if (navigateToRef.current) {
      navigateToRef.current(activeWaypoint);
    }
  }, [activeWaypoint, viewProjection]);

  useEffect(() => {
    if (pulseTrigger > 0 && triggerPulseRef.current) {
      triggerPulseRef.current();
    }
  }, [pulseTrigger]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Software WebGL Guard (SwiftShader / llvmpipe / Basic Render)
    const isSoftwareGl = (() => {
      try {
        const probeCanvas = document.createElement('canvas');
        const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return true;
      }
    })();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(width, height);
    const pixelRatio = isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pixelRatio);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    container.appendChild(renderer.domElement);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
    };
    const handleContextRestored = () => {
      setWebglError(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // 1. Scene & Studio RoomEnvironment (Realistic PBR Reflections for Titanium/Kapton/Asteroids)
    const scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envRenderTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envRenderTarget.texture;
    pmremGenerator.dispose();

    const defaultFogColor = 0x020307;
    const infraredFogColor = 0x0a030f;
    const sceneFog = new THREE.FogExp2(defaultFogColor, 0.00075);
    scene.fog = sceneFog;

    // 2. Camera: High-Angle Astrometric Planisphere by default
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 6000);
    camera.position.set(0, 290, 52);
    camera.lookAt(0, 0, 0);

    // 3. Milky Way Sky Dome
    const nebulaGeo = new THREE.SphereGeometry(2600, 32, 32);
    const nebulaUniforms = {
      uTime: { value: 0 },
      uScanMode: { value: 0 },
    };
    const nebulaMat = new THREE.ShaderMaterial({
      vertexShader: NEBULA_VERTEX_SHADER,
      fragmentShader: NEBULA_FRAGMENT_SHADER,
      uniforms: nebulaUniforms,
      side: THREE.BackSide,
      depthWrite: false,
    });
    scene.add(new THREE.Mesh(nebulaGeo, nebulaMat));

    // 4. Heliocentric Lighting Rig
    const sunLight = new THREE.PointLight(0xfff1d6, 5.2, 1200, 0.85);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight(0x93c5fd, 0x0f172a, 0.65);
    scene.add(hemiLight);

    // 5. Harvard Spectral Starfield (4,800 calibrated stars — crisp & fast)
    const starCount = 4800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);
    const starSize = new Float32Array(starCount);
    const starPhase = new Float32Array(starCount);

    const spectralPalette = [
      new THREE.Color(0x9bb0ff), // O
      new THREE.Color(0xaabfff), // B
      new THREE.Color(0xcad7ff), // A
      new THREE.Color(0xf8f7ff), // F
      new THREE.Color(0xfff4ea), // G
      new THREE.Color(0xffd2a1), // K
      new THREE.Color(0xffcc6f), // M
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 240 + Math.random() * 1900;
      const theta = Math.random() * Math.PI * 2;
      const isGalacticBand = Math.random() < 0.36;
      const phi = isGalacticBand
        ? Math.PI * 0.5 + (Math.random() - 0.5) * 0.40
        : Math.acos(Math.random() * 2 - 1);

      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi);
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const c = spectralPalette[Math.floor(Math.random() * spectralPalette.length)];
      starCol[i * 3] = c.r;
      starCol[i * 3 + 1] = c.g;
      starCol[i * 3 + 2] = c.b;

      const rand = Math.random();
      starSize[i] = rand > 0.94 ? 2.6 + Math.random() * 2.2 : 0.8 + Math.pow(rand, 2.0) * 1.5;
      starPhase[i] = Math.random() * Math.PI * 20;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSize, 1));
    starGeo.setAttribute('aPhase', new THREE.BufferAttribute(starPhase, 1));

    const starUniforms = {
      uTime: { value: 0 },
      uWarpBoost: { value: 0 },
      uPixelRatio: { value: pixelRatio },
    };

    const starMat = new THREE.ShaderMaterial({
      vertexShader: STARFIELD_VERTEX_SHADER,
      fragmentShader: STARFIELD_FRAGMENT_SHADER,
      uniforms: starUniforms,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // 6. Astrometric Ecliptic Planisphere Chart (Y = -0.15)
    const eclipticChartGroup = new THREE.Group();
    eclipticChartGroup.position.y = -0.15;
    scene.add(eclipticChartGroup);

    const auRadii = [36, 66, 106, 148, 178, 198];
    auRadii.forEach((rad, idx) => {
      const pts: THREE.Vector3[] = [];
      const segs = 128;
      for (let i = 0; i <= segs; i++) {
        const a = (i / segs) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * rad, 0, Math.sin(a) * rad));
      }
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const m = new THREE.LineBasicMaterial({
        color: 0x94a3b8,
        transparent: true,
        opacity: idx === auRadii.length - 1 ? 0.16 : 0.055,
      });
      eclipticChartGroup.add(new THREE.LineLoop(g, m));
    });

    const tickPositions: number[] = [];
    for (let deg = 0; deg < 360; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      const isMajor = deg % 30 === 0;
      const isCardinal = deg % 90 === 0;
      const innerR = isCardinal ? 28 : isMajor ? 190 : 194;
      const outerR = 198;
      tickPositions.push(
        Math.cos(rad) * innerR,
        0,
        Math.sin(rad) * innerR,
        Math.cos(rad) * outerR,
        0,
        Math.sin(rad) * outerR
      );
    }
    const tickGeo = new THREE.BufferGeometry();
    tickGeo.setAttribute('position', new THREE.Float32BufferAttribute(tickPositions, 3));
    const tickMat = new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.09,
    });
    eclipticChartGroup.add(new THREE.LineSegments(tickGeo, tickMat));

    const clickableObjects: THREE.Object3D[] = [];

    // 7. Coplanar Keplerian Orbits (Y = 0)
    interface InteractiveOrbit {
      key: WaypointKey;
      radiusX: number;
      radiusZ: number;
      eccentricity: number;
      line: THREE.LineLoop;
      lineMat: THREE.LineBasicMaterial;
      pickTube: THREE.Mesh;
      beaconMesh: THREE.Mesh;
      beaconHalo: THREE.Mesh;
      baseColor: number;
      highlightColor: number;
      periodSpeed: number;
      currentAngle: number;
      planetOrbitalAngle: number;
      planetAngularSpeed: number;
    }

    const interactiveOrbits: InteractiveOrbit[] = [];

    function createInteractiveOrbit(
      key: WaypointKey,
      semiMajor: number,
      eccentricity: number,
      baseColor: number,
      highlightColor: number,
      periodSpeed: number,
      initialPlanetAngle: number,
      planetAngularSpeed: number
    ): InteractiveOrbit {
      const semiMinor = semiMajor * Math.sqrt(1 - eccentricity * eccentricity);
      const segments = 180;
      const points: THREE.Vector3[] = [];

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const x = Math.cos(theta) * semiMajor - semiMajor * eccentricity * 0.5;
        const z = Math.sin(theta) * semiMinor;
        points.push(new THREE.Vector3(x, 0, z));
      }

      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineBasicMaterial({
        color: baseColor,
        transparent: true,
        opacity: 0.42,
      });
      const line = new THREE.LineLoop(lineGeo, lineMat);
      scene.add(line);

      const curve = new THREE.CatmullRomCurve3(points, true);
      const tubeGeo = new THREE.TubeGeometry(curve, 96, 2.8, 6, true);
      const tubeMat = new THREE.MeshBasicMaterial({ visible: false });
      const pickTube = new THREE.Mesh(tubeGeo, tubeMat);

      const target = CELESTIAL_TARGETS[key];
      pickTube.userData = { id: `orbit-${key}`, key, target, isOrbit: true };
      scene.add(pickTube);
      clickableObjects.push(pickTube);

      const beaconGeo = new THREE.SphereGeometry(0.85, 10, 10);
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
      const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);

      const haloGeo = new THREE.SphereGeometry(2.0, 10, 10);
      const haloMat = new THREE.MeshBasicMaterial({
        color: highlightColor,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
      });
      const beaconHalo = new THREE.Mesh(haloGeo, haloMat);
      beaconMesh.add(beaconHalo);
      scene.add(beaconMesh);

      const orbitObj: InteractiveOrbit = {
        key,
        radiusX: semiMajor,
        radiusZ: semiMinor,
        eccentricity,
        line,
        lineMat,
        pickTube,
        beaconMesh,
        beaconHalo,
        baseColor,
        highlightColor,
        periodSpeed,
        currentAngle: initialPlanetAngle + 0.8,
        planetOrbitalAngle: initialPlanetAngle,
        planetAngularSpeed,
      };

      interactiveOrbits.push(orbitObj);
      return orbitObj;
    }

    const getOrbitPosition = (orb: InteractiveOrbit, theta: number, out: THREE.Vector3) => {
      const x = Math.cos(theta) * orb.radiusX - orb.radiusX * orb.eccentricity * 0.5;
      const z = Math.sin(theta) * orb.radiusZ;
      out.set(x, 0, z);
      return out;
    };

    const nextOrbit = createInteractiveOrbit('nextjs', 66, 0.032, 0x38bdf8, 0x7dd3fc, 0.0045, -0.68, 0.045);
    createInteractiveOrbit('asteroids', 106, 0.064, 0xa8a29e, 0xe7e5e4, 0.0025, 0.8, 0.018);
    const stationOrbit = createInteractiveOrbit('station', 148, 0.014, 0xe5a93c, 0xfde68a, 0.0018, 2.35, 0.022);

    // 8. Multispectral Overlays
    const gravityGeo = new THREE.PlaneGeometry(380, 380, 44, 44);
    gravityGeo.rotateX(-Math.PI / 2);
    const gravityMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    });
    const gravityGrid = new THREE.Mesh(gravityGeo, gravityMat);
    gravityGrid.position.y = -4;
    gravityGrid.visible = false;
    scene.add(gravityGrid);

    const radioWavesGroup = new THREE.Group();
    radioWavesGroup.visible = false;
    scene.add(radioWavesGroup);
    const radioRings: { mesh: THREE.Mesh; scale: number; speed: number; maxScale: number }[] = [];
    for (let r = 0; r < 4; r++) {
      const ringGeo = new THREE.RingGeometry(8, 8.7, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      radioWavesGroup.add(ringMesh);
      radioRings.push({ mesh: ringMesh, scale: 1 + r * 22, speed: 18 + r * 2, maxScale: 175 });
    }

    const pulseShockwaveGeo = new THREE.RingGeometry(0.8, 2.6, 64);
    const pulseShockwaveMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
    });
    const pulseShockwave = new THREE.Mesh(pulseShockwaveGeo, pulseShockwaveMat);
    pulseShockwave.rotation.x = Math.PI / 2;
    scene.add(pulseShockwave);

    let pulseRadius = 0;
    let pulseActiveState = false;
    triggerPulseRef.current = () => {
      pulseRadius = 2;
      pulseActiveState = true;
      pulseShockwaveMat.opacity = 0.9;
    };

    // =========================================================================
    // 9. REALISTIC CELESTIAL BODIES
    // =========================================================================

    // 9a. SOL G2V (0.00 AU) + Optical Solar Corona Sprite
    const sunGroup = new THREE.Group();
    const sunCoreGeo = new THREE.SphereGeometry(14.5, 64, 64);
    const sunUniforms = {
      uTime: { value: 0 },
      uScanMode: { value: 0 },
    };
    const sunCoreMat = new THREE.ShaderMaterial({
      vertexShader: SOLAR_PLASMA_VERTEX_SHADER,
      fragmentShader: SOLAR_PLASMA_FRAGMENT_SHADER,
      uniforms: sunUniforms,
    });
    const sunMesh = new THREE.Mesh(sunCoreGeo, sunCoreMat);
    sunGroup.add(sunMesh);

    const solarGlowTex = createSolarGlowTexture();
    const solarCoronaSpriteMat = new THREE.SpriteMaterial({
      map: solarGlowTex,
      color: 0xffd27d,
      transparent: true,
      opacity: 0.82,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const solarCoronaSprite = new THREE.Sprite(solarCoronaSpriteMat);
    solarCoronaSprite.scale.set(66, 66, 1);
    sunGroup.add(solarCoronaSprite);

    const solAstrolabeGeo = new THREE.RingGeometry(21.6, 21.85, 96);
    const solAstrolabeMat = new THREE.MeshBasicMaterial({
      color: 0xfde68a,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.20,
      blending: THREE.AdditiveBlending,
    });
    const solAstrolabe = new THREE.Mesh(solAstrolabeGeo, solAstrolabeMat);
    solAstrolabe.rotation.x = Math.PI / 2;
    sunGroup.add(solAstrolabe);

    scene.add(sunGroup);
    sunMesh.userData = { id: 'sun', key: 'sun', target: CELESTIAL_TARGETS.sun };
    clickableObjects.push(sunMesh);

    // 9a-bis. Realistic Inner Rocky Reference Worldlet (Mercury-analog at r = 36)
    const innerWorldOrbitAngle = { value: 1.9 };
    const innerWorldGeo = new THREE.SphereGeometry(2.7, 32, 32);
    const innerWorldMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.88,
      metalness: 0.12,
    });
    const innerWorldMesh = new THREE.Mesh(innerWorldGeo, innerWorldMat);
    innerWorldMesh.position.set(Math.cos(innerWorldOrbitAngle.value) * 36, 0, Math.sin(innerWorldOrbitAngle.value) * 36);
    scene.add(innerWorldMesh);

    // 9b. PLANÈTE NEXT.JS (3.48 AU) — Blue Marble Telluric World + Orbiting Moon + Cassini Rings
    const nextGroup = new THREE.Group();
    getOrbitPosition(nextOrbit, nextOrbit.planetOrbitalAngle, nextGroup.position);

    const nextGeo = new THREE.SphereGeometry(8.8, 56, 56);
    const nextUniforms = {
      uTime: { value: 0 },
      uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
      uScanMode: { value: 0 },
    };
    const nextMat = new THREE.ShaderMaterial({
      vertexShader: PLANET_NEXT_VERTEX_SHADER,
      fragmentShader: PLANET_NEXT_FRAGMENT_SHADER,
      uniforms: nextUniforms,
    });
    const nextMesh = new THREE.Mesh(nextGeo, nextMat);
    nextMesh.rotation.z = 0.41;
    nextGroup.add(nextMesh);

    const nextAtmoGeo = new THREE.SphereGeometry(9.9, 40, 40);
    const nextAtmoMat = new THREE.ShaderMaterial({
      vertexShader: FRESNEL_GLOW_VERTEX_SHADER,
      fragmentShader: FRESNEL_GLOW_FRAGMENT_SHADER,
      uniforms: {
        uColorCore: { value: new THREE.Color(0x60a5fa) },
        uColorRim: { value: new THREE.Color(0x1d4ed8) },
        uPower: { value: 2.9 },
        uIntensity: { value: 1.05 },
      },
      side: THREE.BackSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nextAtmo = new THREE.Mesh(nextAtmoGeo, nextAtmoMat);
    nextGroup.add(nextAtmo);

    const nextRingGeo = new THREE.RingGeometry(12.2, 21.5, 96);
    const nextRingMat = new THREE.ShaderMaterial({
      vertexShader: RING_SYSTEM_VERTEX_SHADER,
      fragmentShader: RING_SYSTEM_FRAGMENT_SHADER,
      uniforms: {
        uColorPrimary: { value: new THREE.Color(0xe5dec9) },
        uColorSecondary: { value: new THREE.Color(0x93c5fd) },
        uInnerR: { value: 12.2 },
        uOuterR: { value: 21.5 },
      },
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const nextRing = new THREE.Mesh(nextRingGeo, nextRingMat);
    nextRing.rotation.x = Math.PI / 2.15;
    nextRing.rotation.y = 0.12;
    nextGroup.add(nextRing);

    // Realistic Natural Lunar Satellite orbiting Next.js Planet
    const moonOrbitRingGeo = new THREE.RingGeometry(24.8, 25.05, 64);
    const moonOrbitRingMat = new THREE.MeshBasicMaterial({
      color: 0x94a3b8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.16,
    });
    const moonOrbitRing = new THREE.Mesh(moonOrbitRingGeo, moonOrbitRingMat);
    moonOrbitRing.rotation.x = Math.PI / 2;
    nextGroup.add(moonOrbitRing);

    const moonGeo = new THREE.SphereGeometry(1.75, 24, 24);
    const moonMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.92,
      metalness: 0.05,
    });
    const moonMesh = new THREE.Mesh(moonGeo, moonMat);
    moonMesh.position.set(24.9, 0, 0);
    nextGroup.add(moonMesh);

    scene.add(nextGroup);
    nextMesh.userData = { id: 'nextjs', key: 'nextjs', target: CELESTIAL_TARGETS.nextjs };
    nextAtmo.userData = nextMesh.userData;
    nextRing.userData = nextMesh.userData;
    clickableObjects.push(nextMesh, nextAtmo, nextRing);

    // 9c. CEINTURE D'ASTÉROÏDES (5.82 AU) — Single-Draw-Call InstancedMesh + 6 M-Type Named Asteroids
    const asteroidBeltGroup = new THREE.Group();
    const dustDiscGeo = new THREE.RingGeometry(94, 118, 96);
    const dustDiscMat = new THREE.MeshBasicMaterial({
      color: 0xa8a29e,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.06,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const dustDisc = new THREE.Mesh(dustDiscGeo, dustDiscMat);
    dustDisc.rotation.x = Math.PI / 2;
    asteroidBeltGroup.add(dustDisc);

    const featuredAsteroids = [
      { name: 'vercel/next.js', pr: '#67192', stars: '124k' },
      { name: 'facebook/react', pr: '#28419', stars: '228k' },
      { name: 'tailwindlabs/tailwindcss', pr: '#13824', stars: '82k' },
      { name: 'trpc/trpc', pr: '#5412', stars: '36k' },
      { name: 'shadcn/ui', pr: '#3120', stars: '75k' },
      { name: 'astral-sh/uv', pr: '#8921', stars: '39k' },
    ];

    const bgAsteroidCount = 194;
    const bgRockGeo = new THREE.DodecahedronGeometry(0.95, 0);
    const bgRockMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.86,
      metalness: 0.16,
    });
    const bgAsteroidInstanced = new THREE.InstancedMesh(bgRockGeo, bgRockMat, bgAsteroidCount);
    const rockColors = [new THREE.Color(0x78716c), new THREE.Color(0x57534e), new THREE.Color(0xa8a29e), new THREE.Color(0x64748b)];

    for (let i = 0; i < bgAsteroidCount; i++) {
      const angle = (i / bgAsteroidCount) * Math.PI * 2 + Math.random() * 0.08;
      const radius = 96 + Math.random() * 20;
      const y = (Math.random() - 0.5) * 2.4;
      _dummyMatrix.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      _dummyMatrix.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      const s = 0.55 + Math.random() * 0.95;
      _dummyMatrix.scale.set(s * (0.85 + Math.random() * 0.3), s * (0.65 + Math.random() * 0.35), s * (0.85 + Math.random() * 0.3));
      _dummyMatrix.updateMatrix();
      bgAsteroidInstanced.setMatrixAt(i, _dummyMatrix.matrix);
      bgAsteroidInstanced.setColorAt(i, rockColors[i % rockColors.length]);
    }
    bgAsteroidInstanced.instanceMatrix.needsUpdate = true;
    if (bgAsteroidInstanced.instanceColor) bgAsteroidInstanced.instanceColor.needsUpdate = true;
    bgAsteroidInstanced.computeBoundingSphere();
    bgAsteroidInstanced.userData = { id: 'asteroids', key: 'asteroids', target: CELESTIAL_TARGETS.asteroids };
    asteroidBeltGroup.add(bgAsteroidInstanced);
    clickableObjects.push(bgAsteroidInstanced);

    const featuredMeshes: THREE.Mesh[] = [];
    const featuredMat = new THREE.MeshStandardMaterial({
      color: 0xe7e5e4,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
      roughness: 0.32,
      metalness: 0.82,
    });
    const featuredGeo = new THREE.DodecahedronGeometry(2.4, 1);

    for (let i = 0; i < featuredAsteroids.length; i++) {
      const angle = (i / featuredAsteroids.length) * Math.PI * 2 + 0.35;
      const radius = 104 + (i % 2) * 4;
      const rock = new THREE.Mesh(featuredGeo, featuredMat);
      rock.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

      const markerRingGeo = new THREE.RingGeometry(3.4, 3.7, 32);
      const markerRingMat = new THREE.MeshBasicMaterial({
        color: 0xe5a93c,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.52,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const markerRing = new THREE.Mesh(markerRingGeo, markerRingMat);
      markerRing.rotation.x = Math.PI / 2;
      rock.add(markerRing);

      const item = featuredAsteroids[i];
      rock.userData = {
        id: 'asteroids',
        key: 'asteroids',
        target: {
          ...CELESTIAL_TARGETS.asteroids,
          name: `${item.name} • PR ${item.pr}`,
          subtitle: `Stars: ${item.stars} • Corps Mineur Référencé`,
        },
      };
      asteroidBeltGroup.add(rock);
      featuredMeshes.push(rock);
      clickableObjects.push(rock);
    }
    scene.add(asteroidBeltGroup);

    // 9d. STATION ORBITALE DEVOPS (8.41 AU) — Aerospace Titanium + Gold Kapton + Solar Wings
    const stationGroup = new THREE.Group();
    getOrbitPosition(stationOrbit, stationOrbit.planetOrbitalAngle, stationGroup.position);

    const stationData = { id: 'station', key: 'station', target: CELESTIAL_TARGETS.station };

    const hubMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.84, roughness: 0.22 });
    const hubMesh = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 16, 28), hubMat);
    hubMesh.userData = stationData;
    stationGroup.add(hubMesh);

    const kaptonMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.94, roughness: 0.20 });
    const kaptonMesh = new THREE.Mesh(new THREE.CylinderGeometry(3.65, 3.65, 4.2, 28), kaptonMat);
    kaptonMesh.userData = stationData;
    stationGroup.add(kaptonMesh);

    const solarMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a,
      emissive: 0x0f172a,
      emissiveIntensity: 0.35,
      metalness: 0.88,
      roughness: 0.14,
    });
    const pGeo = new THREE.BoxGeometry(32, 0.25, 4.8);
    const panelTop = new THREE.Mesh(pGeo, solarMat);
    panelTop.position.set(0, 4.8, 0);
    panelTop.userData = stationData;
    stationGroup.add(panelTop);

    const panelBottom = new THREE.Mesh(pGeo, solarMat);
    panelBottom.position.set(0, -4.8, 0);
    panelBottom.userData = stationData;
    stationGroup.add(panelBottom);

    const k8sRingMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.86, roughness: 0.20 });
    const k8sRing = new THREE.Mesh(new THREE.TorusGeometry(9.2, 0.55, 14, 56), k8sRingMat);
    k8sRing.rotation.x = Math.PI / 2;
    k8sRing.userData = stationData;
    stationGroup.add(k8sRing);

    const outerShieldRingMat = new THREE.MeshBasicMaterial({
      color: 0xe5a93c,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const outerShieldRing = new THREE.Mesh(new THREE.RingGeometry(11.4, 11.65, 56), outerShieldRingMat);
    outerShieldRing.rotation.x = Math.PI / 2;
    outerShieldRing.userData = stationData;
    stationGroup.add(outerShieldRing);

    clickableObjects.push(hubMesh, kaptonMesh, panelTop, panelBottom, k8sRing, outerShieldRing);

    const cloudModuleColors = [0x38bdf8, 0xe5a93c, 0x34d399];
    const modGeo = new THREE.CylinderGeometry(1.35, 1.35, 3.2, 16);
    modGeo.rotateZ(Math.PI / 2);
    for (let m = 0; m < 3; m++) {
      const modMat = new THREE.MeshStandardMaterial({
        color: 0xf1f5f9,
        emissive: cloudModuleColors[m],
        emissiveIntensity: 0.30,
        metalness: 0.78,
        roughness: 0.24,
      });
      const modMesh = new THREE.Mesh(modGeo, modMat);
      const theta = (m / 3) * Math.PI * 2;
      modMesh.position.set(Math.cos(theta) * 9.2, 0, Math.sin(theta) * 9.2);
      modMesh.rotation.y = -theta;
      modMesh.userData = stationData;
      stationGroup.add(modMesh);
      clickableObjects.push(modMesh);
    }
    scene.add(stationGroup);

    // 9e. Realistic Outer Gas Giant Reference (r = 178) for Astronomical Depth
    const outerGiantOrbitAngle = { value: -2.4 };
    const giantGroup = new THREE.Group();
    giantGroup.position.set(Math.cos(outerGiantOrbitAngle.value) * 178, 0, Math.sin(outerGiantOrbitAngle.value) * 178);
    const giantUniforms = { uTime: { value: 0 } };
    const giantMat = new THREE.ShaderMaterial({
      vertexShader: GAS_GIANT_VERTEX_SHADER,
      fragmentShader: GAS_GIANT_FRAGMENT_SHADER,
      uniforms: giantUniforms,
    });
    const giantMesh = new THREE.Mesh(new THREE.SphereGeometry(11.2, 40, 40), giantMat);
    giantMesh.rotation.z = 0.08;
    giantGroup.add(giantMesh);

    const giantRingMat = new THREE.ShaderMaterial({
      vertexShader: RING_SYSTEM_VERTEX_SHADER,
      fragmentShader: RING_SYSTEM_FRAGMENT_SHADER,
      uniforms: {
        uColorPrimary: { value: new THREE.Color(0xd6c7b2) },
        uColorSecondary: { value: new THREE.Color(0x9ca3af) },
        uInnerR: { value: 14.5 },
        uOuterR: { value: 24.5 },
      },
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const giantRing = new THREE.Mesh(new THREE.RingGeometry(14.5, 24.5, 64), giantRingMat);
    giantRing.rotation.x = Math.PI / 2.2;
    giantGroup.add(giantRing);
    scene.add(giantGroup);

    // =========================================================================
    // 10. CAMERA & INTERACTION CONTROLLER
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    raycaster.params.Line = { threshold: 2.8 };

    const mouse = new THREE.Vector2();
    const targetCamPos = new THREE.Vector3(0, 290, 52);
    const targetLookAt = new THREE.Vector3(0, 0, 0);
    const currentLookAt = new THREE.Vector3(0, 0, 0);
    const cameraOffsetFromTarget = new THREE.Vector3(0, 290, 52);

    const navigateTo = (targetKey: WaypointKey) => {
      const isPlanisphere = viewProjectionRef.current === 'planisphere';
      if (targetKey === 'sun') {
        cameraOffsetFromTarget.set(isPlanisphere ? 0 : 14, isPlanisphere ? 64 : 18, isPlanisphere ? 22 : 66);
        targetLookAt.set(0, 0, 0);
        targetCamPos.copy(targetLookAt).add(cameraOffsetFromTarget);
      } else if (targetKey === 'nextjs') {
        cameraOffsetFromTarget.set(isPlanisphere ? 0 : 20, isPlanisphere ? 52 : 12, isPlanisphere ? 18 : 36);
        targetLookAt.copy(nextGroup.position);
        targetCamPos.copy(targetLookAt).add(cameraOffsetFromTarget);
      } else if (targetKey === 'asteroids') {
        cameraOffsetFromTarget.set(isPlanisphere ? 0 : 18, isPlanisphere ? 65 : 24, isPlanisphere ? 22 : 28);
        targetLookAt.set(78, 0, 72);
        targetCamPos.copy(targetLookAt).add(cameraOffsetFromTarget);
      } else if (targetKey === 'station') {
        cameraOffsetFromTarget.set(isPlanisphere ? 0 : 22, isPlanisphere ? 52 : 14, isPlanisphere ? 18 : 34);
        targetLookAt.copy(stationGroup.position);
        targetCamPos.copy(targetLookAt).add(cameraOffsetFromTarget);
      } else if (targetKey === 'reset') {
        targetLookAt.set(0, 0, 0);
        if (isPlanisphere) {
          cameraOffsetFromTarget.set(0, 290, 52);
        } else {
          cameraOffsetFromTarget.set(0, 108, 305);
        }
        targetCamPos.copy(cameraOffsetFromTarget);
      }
    };
    navigateToRef.current = navigateTo;

    const spherical = new THREE.Spherical();
    const offsetVec = new THREE.Vector3();
    const orbitCameraByDelta = (deltaAzimuth: number, deltaPolar: number) => {
      offsetVec.copy(cameraOffsetFromTarget);
      spherical.setFromVector3(offsetVec);
      spherical.theta -= deltaAzimuth;
      spherical.phi = Math.max(0.08, Math.min(Math.PI * 0.48, spherical.phi - deltaPolar));
      spherical.makeSafe();
      cameraOffsetFromTarget.setFromSpherical(spherical);
      targetCamPos.copy(targetLookAt).add(cameraOffsetFromTarget);
    };

    let isMouseDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let mouseDragDistance = 0;

    const isUiElement = (el: HTMLElement | null) => {
      if (!el) return false;
      return Boolean(
        el.closest('#hud-interactive-ui') ||
          el.closest('#multispectral-scanner-panel') ||
          el.closest('#scanner-reticle') ||
          el.closest('button') ||
          el.closest('a') ||
          el.closest('input') ||
          el.closest('textarea')
      );
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0 || isUiElement(e.target as HTMLElement)) return;
      isMouseDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      mouseDragDistance = 0;
      container.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      const distToSol = camera.position.length();
      const au = Math.max(0, distToSol / 18);
      onUpdateTelemetryRef.current(camera.position.x + mouse.x * 8, camera.position.y + mouse.y * 5, camera.position.z, au);

      if (isMouseDragging) {
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        mouseDragDistance += Math.hypot(dx, dy);
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        orbitCameraByDelta(dx * 0.005, dy * 0.0045);
      }
    };

    const handleMouseUp = () => {
      if (isMouseDragging) {
        isMouseDragging = false;
        container.style.cursor = 'grab';
      }
    };

    const handleClick = (e: MouseEvent) => {
      if (mouseDragDistance > 6 || isUiElement(e.target as HTMLElement)) return;
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(clickableObjects, true);
      if (hits.length > 0) {
        let top: THREE.Object3D | null = hits[0].object;
        while (top && !top.userData?.id && top.parent) top = top.parent;
        if (top?.userData?.key) {
          if (top.userData.isOrbit) spaceSynth.playOrbitLock();
          onSelectTargetRef.current(top.userData.key as WaypointKey);
        }
      }
    };

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    let lastWheelStepTime = 0;
    const chapterOrder: WaypointKey[] = ['reset', 'sun', 'nextjs', 'asteroids', 'station'];
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target?.closest('#multispectral-scanner-panel')) return;

      if (navigationModeRef.current === 'voyage') {
        const now = performance.now();
        if (now - lastWheelStepTime < 850 || Math.abs(e.deltaY) < 18) return;
        lastWheelStepTime = now;
        const currentIndex = chapterOrder.indexOf(activeWaypointRef.current);
        const dir = e.deltaY > 0 ? 1 : -1;
        const nextIndex = (currentIndex + dir + chapterOrder.length) % chapterOrder.length;
        spaceSynth.playOrbitLock();
        onSelectTargetRef.current(chapterOrder[nextIndex]);
        return;
      }

      const zoomFactor = e.deltaY > 0 ? 1.07 : 0.93;
      const currentDist = cameraOffsetFromTarget.length();
      if ((e.deltaY > 0 && currentDist < 750) || (e.deltaY < 0 && currentDist > 28)) {
        cameraOffsetFromTarget.multiplyScalar(zoomFactor);
        targetCamPos.copy(targetLookAt).add(cameraOffsetFromTarget);
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let tapStartTime = 0;
    let initialPinchDist = 0;
    let isTouching = false;
    let hasMovedSignificantly = false;
    const getTouchDistance = (t1: Touch, t2: Touch) => Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isTouching = true;
        hasMovedSignificantly = false;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        tapStartTime = performance.now();
      } else if (e.touches.length === 2) {
        isTouching = false;
        initialPinchDist = getTouchDistance(e.touches[0], e.touches[1]);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isTouching) {
        const dx = e.touches[0].clientX - touchStartX;
        const dy = e.touches[0].clientY - touchStartY;
        if (Math.hypot(dx, dy) > 8) hasMovedSignificantly = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        orbitCameraByDelta(dx * 0.006, dy * 0.005);
      } else if (e.touches.length === 2) {
        const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
        if (initialPinchDist > 0) {
          const pinchFactor = initialPinchDist / currentDist;
          const camDist = cameraOffsetFromTarget.length();
          if ((pinchFactor > 1 && camDist < 750) || (pinchFactor < 1 && camDist > 28)) {
            const factor = Math.min(1.08, Math.max(0.92, pinchFactor));
            cameraOffsetFromTarget.multiplyScalar(factor);
            targetCamPos.copy(targetLookAt).add(cameraOffsetFromTarget);
          }
        }
        initialPinchDist = currentDist;
      }
    };

    const handleTouchEnd = () => {
      if (isTouching && !hasMovedSignificantly && performance.now() - tapStartTime < 350) {
        const rect = renderer.domElement.getBoundingClientRect();
        const tapX = ((touchStartX - rect.left) / rect.width) * 2 - 1;
        const tapY = -((touchStartY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(new THREE.Vector2(tapX, tapY), camera);
        const hits = raycaster.intersectObjects(clickableObjects, true);
        if (hits.length > 0) {
          let top: THREE.Object3D | null = hits[0].object;
          while (top && !top.userData?.id && top.parent) top = top.parent;
          if (top?.userData?.key) {
            if (top.userData.isOrbit) spaceSynth.playOrbitLock();
            onSelectTargetRef.current(top.userData.key as WaypointKey);
          }
        }
      }
      isTouching = false;
      initialPinchDist = 0;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Pre-warm shaders once on hardware GPU
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // =========================================================================
    // 11. RENDER LOOP WITH SOFTWARE-WEBGL FENCESYNC PACING
    // =========================================================================
    const clock = new THREE.Clock();
    let frameId = 0;
    let isDisposed = false;
    let lastHoveredKey: string | null = null;
    let lastHoveredOrbitKey: string | null = null;
    let prevTime = 0;
    let moonAngle = 0.5;

    const projectLabel = (
      key: 'sun' | 'nextjs' | 'asteroids' | 'station',
      worldX: number,
      worldY: number,
      worldZ: number
    ) => {
      const el = labelRefs.current[key];
      if (!el) return;
      _projVec.set(worldX, worldY, worldZ).project(camera);
      if (_projVec.z > 1 || _projVec.z < -1) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        return;
      }
      const x = (_projVec.x * 0.5 + 0.5) * width;
      const y = (-_projVec.y * 0.5 + 0.5) * height;
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -135%)`;
      el.style.opacity = activeWaypointRef.current === 'reset' ? '1' : '0.45';
      el.style.pointerEvents = 'auto';
    };

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          if (isDisposed) return;
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    const animate = () => {
      if (isDisposed) return;

      const time = clock.getElapsedTime();
      const dt = Math.min(0.05, Math.max(0.001, time - prevTime));
      prevTime = time;
      const currentMode = scanModeRef.current;

      const modeIndex =
        currentMode === 'optical' ? 0 : currentMode === 'infrared' ? 1 : currentMode === 'radio' ? 2 : 3;

      nebulaUniforms.uTime.value = time;
      nebulaUniforms.uScanMode.value = modeIndex;
      sunUniforms.uTime.value = time;
      sunUniforms.uScanMode.value = modeIndex;
      nextUniforms.uTime.value = time;
      nextUniforms.uScanMode.value = modeIndex;
      giantUniforms.uTime.value = time;
      starUniforms.uTime.value = time;

      // Multispectral overlays
      if (currentMode === 'gravitational') {
        gravityGrid.visible = true;
        radioWavesGroup.visible = false;
        sceneFog.color.setHex(0x070310);
        const posAttr = gravityGeo.attributes.position;
        for (let i = 0; i < posAttr.count; i++) {
          const vx = posAttr.getX(i);
          const vz = posAttr.getZ(i);
          const distSol = Math.hypot(vx, vz);
          const wellSol = -24 / (1 + distSol * 0.08);
          const distNext = Math.hypot(vx - nextGroup.position.x, vz - nextGroup.position.z);
          const wellNext = -13 / (1 + distNext * 0.14);
          const distStation = Math.hypot(vx - stationGroup.position.x, vz - stationGroup.position.z);
          const wellStation = -11 / (1 + distStation * 0.16);
          posAttr.setY(i, wellSol + wellNext + wellStation + Math.sin(distSol * 0.08 - time * 2.0) * 0.8);
        }
        posAttr.needsUpdate = true;
      } else if (currentMode === 'radio') {
        gravityGrid.visible = false;
        radioWavesGroup.visible = true;
        sceneFog.color.setHex(0x030812);
        for (let r = 0; r < radioRings.length; r++) {
          const rw = radioRings[r];
          rw.scale += rw.speed * dt;
          if (rw.scale > rw.maxScale) rw.scale = 8;
          rw.mesh.scale.set(rw.scale, rw.scale, rw.scale);
          (rw.mesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.55 * (1 - rw.scale / rw.maxScale));
        }
      } else if (currentMode === 'infrared') {
        gravityGrid.visible = false;
        radioWavesGroup.visible = false;
        sceneFog.color.setHex(infraredFogColor);
      } else {
        gravityGrid.visible = false;
        radioWavesGroup.visible = false;
        sceneFog.color.setHex(defaultFogColor);
      }

      if (pulseActiveState) {
        pulseRadius += 5.5;
        pulseShockwave.scale.set(pulseRadius, pulseRadius, pulseRadius);
        pulseShockwaveMat.opacity = Math.max(0, 0.9 * (1 - pulseRadius / 280));
        if (pulseRadius > 280) {
          pulseActiveState = false;
          pulseShockwaveMat.opacity = 0;
        }
      }

      // Real-time Keplerian Planetary Revolution along the Ecliptic Plane (Y=0)
      const orbitAdvanceFactor = activeWaypointRef.current === 'reset' ? 1.0 : 0.12;
      nextOrbit.planetOrbitalAngle += nextOrbit.planetAngularSpeed * dt * orbitAdvanceFactor;
      stationOrbit.planetOrbitalAngle += stationOrbit.planetAngularSpeed * dt * orbitAdvanceFactor;
      innerWorldOrbitAngle.value += 0.085 * dt * orbitAdvanceFactor;
      outerGiantOrbitAngle.value += 0.011 * dt * orbitAdvanceFactor;

      getOrbitPosition(nextOrbit, nextOrbit.planetOrbitalAngle, nextGroup.position);
      getOrbitPosition(stationOrbit, stationOrbit.planetOrbitalAngle, stationGroup.position);
      innerWorldMesh.position.set(
        Math.cos(innerWorldOrbitAngle.value) * 36,
        0,
        Math.sin(innerWorldOrbitAngle.value) * 36
      );
      giantGroup.position.set(
        Math.cos(outerGiantOrbitAngle.value) * 178,
        0,
        Math.sin(outerGiantOrbitAngle.value) * 178
      );

      // Orbiting Natural Moon around Next.js Planet
      moonAngle += 0.36 * dt;
      moonMesh.position.set(Math.cos(moonAngle) * 24.9, 0, Math.sin(moonAngle) * 24.9);

      if (activeWaypointRef.current === 'nextjs') {
        targetLookAt.copy(nextGroup.position);
        targetCamPos.copy(targetLookAt).add(cameraOffsetFromTarget);
      } else if (activeWaypointRef.current === 'station') {
        targetLookAt.copy(stationGroup.position);
        targetCamPos.copy(targetLookAt).add(cameraOffsetFromTarget);
      }

      // Ephemeris beacons
      for (let o = 0; o < interactiveOrbits.length; o++) {
        const orb = interactiveOrbits[o];
        orb.currentAngle += orb.periodSpeed * (dt * 60);
        const bx = Math.cos(orb.currentAngle) * orb.radiusX - orb.radiusX * orb.eccentricity * 0.5;
        const bz = Math.sin(orb.currentAngle) * orb.radiusZ;
        orb.beaconMesh.position.set(bx, 0, bz);
      }

      // Rotations
      sunMesh.rotation.y += 0.0018;
      solAstrolabe.rotation.z -= 0.002;
      nextMesh.rotation.y += 0.004;
      nextRing.rotation.z += 0.0015;
      giantMesh.rotation.y += 0.002;
      starPoints.rotation.y += 0.0001;
      asteroidBeltGroup.rotation.y += 0.0009;
      stationGroup.rotation.y += 0.0028;
      k8sRing.rotation.z += 0.008;

      for (let f = 0; f < featuredMeshes.length; f++) {
        featuredMeshes[f].rotation.y += 0.01;
      }

      // Smooth Exponential Camera Damping
      const distRemaining = camera.position.distanceTo(targetCamPos);
      const dampFactor = 1 - Math.exp(-3.8 * dt);
      camera.position.lerp(targetCamPos, dampFactor);
      currentLookAt.lerp(targetLookAt, dampFactor);
      camera.lookAt(currentLookAt);

      starUniforms.uWarpBoost.value = Math.min(1.6, Math.max(0, distRemaining * 0.012));

      // Project crisp Astrometric Screen Labels without React re-renders
      projectLabel('sun', 0, 15.5, 0);
      projectLabel('nextjs', nextGroup.position.x, 12.0, nextGroup.position.z);
      projectLabel('asteroids', 74, 4.0, 74);
      projectLabel('station', stationGroup.position.x, 10.5, stationGroup.position.z);

      // Hover Raycast (throttled lightly on software GL)
      raycaster.setFromCamera(mouse, camera);
      const hovers = raycaster.intersectObjects(clickableObjects, true);
      let foundHoverTarget: CelestialTarget | null = null;
      let foundHoverOrbit: CelestialTarget | null = null;

      if (hovers.length > 0) {
        let top: THREE.Object3D | null = hovers[0].object;
        while (top && !top.userData?.id && top.parent) top = top.parent;
        if (top?.userData) {
          container.style.cursor = 'pointer';
          if (top.userData.isOrbit) {
            foundHoverOrbit = top.userData.target;
            for (let o = 0; o < interactiveOrbits.length; o++) {
              const orb = interactiveOrbits[o];
              if (orb.key === top.userData.key) {
                orb.lineMat.opacity = 0.95;
                orb.lineMat.color.setHex(orb.highlightColor);
              } else {
                orb.lineMat.opacity = 0.25;
                orb.lineMat.color.setHex(orb.baseColor);
              }
            }
          } else if (top.userData.target) {
            foundHoverTarget = top.userData.target;
          }
        }
      } else {
        container.style.cursor = isMouseDragging ? 'grabbing' : 'grab';
        for (let o = 0; o < interactiveOrbits.length; o++) {
          const orb = interactiveOrbits[o];
          orb.lineMat.opacity = 0.42;
          orb.lineMat.color.setHex(orb.baseColor);
        }
      }

      const hoverKey = foundHoverTarget ? (foundHoverTarget.name || (foundHoverTarget.id as string)) : null;
      if (lastHoveredKey !== hoverKey) {
        lastHoveredKey = hoverKey;
        onHoverTargetRef.current(foundHoverTarget);
      }

      const orbitKey = foundHoverOrbit ? (foundHoverOrbit.id as string) : null;
      if (lastHoveredOrbitKey !== orbitKey) {
        lastHoveredOrbitKey = orbitKey;
        if (onHoverOrbitRef.current) onHoverOrbitRef.current(foundHoverOrbit);
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(animate);
      } else {
        frameId = requestAnimationFrame(animate);
      }
    };

    if (isSoftwareGl) {
      // Draw frame 1 immediately, then pace subsequent frames cleanly
      animate();
    } else {
      frameId = requestAnimationFrame(animate);
    }

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      resizeObserver.disconnect();

      solarGlowTex.dispose();
      envRenderTarget.dispose();

      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
          else mesh.material.dispose();
        }
      });

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  if (webglError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#020307] text-slate-300 font-mono text-xs p-6 text-center">
        Mode astrométrique 2D actif (accélération WebGL indisponible sur ce périphérique). Utilisez l'Index ou les boutons ci-dessous pour explorer les projets.
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div
        ref={mountRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        aria-label="Planisphère Écliptique du Système Solaire"
      />

      {/* Projected Astrometric Planisphere Labels (Zero React re-renders, GPU transform) */}
      <div className="hidden md:block absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {[
          { key: 'sun' as const, code: '00', name: 'SOL G2V', au: '0.00 AU', color: '#e5a93c' },
          { key: 'nextjs' as const, code: '01', name: 'NEXT.JS', au: '3.48 AU', color: '#38bdf8' },
          { key: 'asteroids' as const, code: '02', name: 'CEINTURE OS', au: '5.82 AU', color: '#cbd5e1' },
          { key: 'station' as const, code: '03', name: 'STATION DEVOPS', au: '8.41 AU', color: '#34d399' },
        ].map((lbl) => (
          <button
            key={lbl.key}
            ref={(el) => {
              labelRefs.current[lbl.key] = el;
            }}
            type="button"
            onClick={() => onSelectTarget(lbl.key)}
            className="absolute top-0 left-0 flex items-center gap-1.5 px-2 py-1 rounded bg-[#060911]/85 hover:bg-[#0f172a] border border-slate-500/25 hover:border-sky-400/60 font-mono text-[10px] tracking-wider text-slate-200 transition-colors cursor-pointer select-none whitespace-nowrap"
            style={{ opacity: 0 }}
          >
            <span className="font-semibold" style={{ color: lbl.color }}>
              {lbl.code}
            </span>
            <span className="text-slate-100 font-medium">{lbl.name}</span>
            <span className="text-slate-400 tabular-nums">{lbl.au}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
