import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WaypointKey, CelestialTarget } from '../types';
import { CELESTIAL_TARGETS } from '../data/spaceData';

interface ThreeSpaceCanvasProps {
  activeWaypoint: WaypointKey;
  freecam: boolean;
  onSelectTarget: (targetKey: WaypointKey) => void;
  onHoverTarget: (target: CelestialTarget | null) => void;
  onUpdateTelemetry: (x: number, y: number, z: number, distAU: number) => void;
}

export const ThreeSpaceCanvas: React.FC<ThreeSpaceCanvasProps> = ({
  activeWaypoint,
  freecam,
  onSelectTarget,
  onHoverTarget,
  onUpdateTelemetry,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const navigateToRef = useRef<((key: WaypointKey) => void) | null>(null);

  // Keep callback refs fresh to avoid stale closures inside Three.js animation loop
  const onSelectTargetRef = useRef(onSelectTarget);
  onSelectTargetRef.current = onSelectTarget;

  const onHoverTargetRef = useRef(onHoverTarget);
  onHoverTargetRef.current = onHoverTarget;

  const onUpdateTelemetryRef = useRef(onUpdateTelemetry);
  onUpdateTelemetryRef.current = onUpdateTelemetry;

  const freecamRef = useRef(freecam);
  freecamRef.current = freecam;

  // React to activeWaypoint changes
  useEffect(() => {
    if (navigateToRef.current) {
      navigateToRef.current(activeWaypoint);
    }
  }, [activeWaypoint]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060d, 0.0014);

    // 2. Camera: De-zoomed panoramic FOV
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 5000);
    camera.position.set(0, 95, 330);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x1a233a, 1.4);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffb703, 4.2, 800, 1.1);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x00f2fe, 0.75);
    rimLight.position.set(120, 90, 80);
    scene.add(rimLight);

    const backGlow = new THREE.DirectionalLight(0x8a2be2, 0.45);
    backGlow.position.set(-100, -40, -100);
    scene.add(backGlow);

    // 5. Starfield Generator (4200 particles)
    const starCount = 4200;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCol = new Float32Array(starCount * 3);

    const palette = [
      new THREE.Color(0x00f2fe),
      new THREE.Color(0xffffff),
      new THREE.Color(0x9d4edd),
      new THREE.Color(0xffb703),
      new THREE.Color(0x38bdf8),
    ];

    for (let i = 0; i < starCount; i++) {
      const r = 240 + Math.random() * 1400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      starCol[i * 3] = c.r;
      starCol[i * 3 + 1] = c.g;
      starCol[i * 3 + 2] = c.b;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starCol, 3));
    const starMat = new THREE.PointsMaterial({
      size: 2.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
    });
    const starPoints = new THREE.Points(starGeo, starMat);
    scene.add(starPoints);

    // Orbit Helper
    function addOrbit(radius: number, color = 0x00f2fe, opacity = 0.2) {
      const pts: THREE.Vector3[] = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
      const loop = new THREE.LineLoop(geo, mat);
      scene.add(loop);
      return loop;
    }

    const clickableObjects: THREE.Object3D[] = [];

    // ==========================================
    // 1. LE SOLEIL (SOL BASE / 0.0 AU)
    // ==========================================
    const sunGroup = new THREE.Group();
    const sunCoreGeo = new THREE.SphereGeometry(15, 36, 36);
    const sunCoreMat = new THREE.MeshBasicMaterial({ color: 0xffa000 });
    const sunMesh = new THREE.Mesh(sunCoreGeo, sunCoreMat);
    sunGroup.add(sunMesh);

    // Corona 1: Wireframe flame
    const corona1Geo = new THREE.SphereGeometry(17, 32, 32);
    const corona1Mat = new THREE.MeshBasicMaterial({
      color: 0xff6200,
      transparent: true,
      opacity: 0.35,
      wireframe: true,
    });
    const corona1 = new THREE.Mesh(corona1Geo, corona1Mat);
    sunGroup.add(corona1);

    // Corona 2: Outer diffuse glow
    const corona2Geo = new THREE.SphereGeometry(19.5, 32, 32);
    const corona2Mat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.16,
      wireframe: false,
    });
    const corona2 = new THREE.Mesh(corona2Geo, corona2Mat);
    sunGroup.add(corona2);

    scene.add(sunGroup);
    sunMesh.userData = {
      id: 'sun',
      key: 'sun',
      target: CELESTIAL_TARGETS.sun,
    };
    clickableObjects.push(sunMesh);

    // ==========================================
    // 2. PLANÈTE NEXT.JS (3.48 AU)
    // ==========================================
    addOrbit(64, 0x00f2fe, 0.25);
    const nextGroup = new THREE.Group();
    nextGroup.position.set(50, 8, -40); // R ~ 64

    const nextGeo = new THREE.SphereGeometry(9.5, 36, 36);
    const nextMat = new THREE.MeshPhongMaterial({
      color: 0x071529,
      emissive: 0x011b33,
      specular: 0x00f2fe,
      shininess: 45,
    });
    const nextMesh = new THREE.Mesh(nextGeo, nextMat);
    nextGroup.add(nextMesh);

    // Atmospheric cage
    const nextAtmoGeo = new THREE.SphereGeometry(10.3, 32, 32);
    const nextAtmoMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.32,
      wireframe: true,
    });
    const nextAtmo = new THREE.Mesh(nextAtmoGeo, nextAtmoMat);
    nextGroup.add(nextAtmo);

    // Accretion Rings
    const nextRingGeo = new THREE.RingGeometry(13.5, 22, 64);
    const nextRingMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.62,
    });
    const nextRing = new THREE.Mesh(nextRingGeo, nextRingMat);
    nextRing.rotation.x = Math.PI / 2.5;
    nextRing.rotation.y = 0.15;
    nextGroup.add(nextRing);

    scene.add(nextGroup);
    nextMesh.userData = {
      id: 'nextjs',
      key: 'nextjs',
      target: CELESTIAL_TARGETS.nextjs,
    };
    clickableObjects.push(nextMesh);

    // ==========================================
    // 3. CEINTURE D'ASTÉROÏDES (5.82 AU)
    // ==========================================
    addOrbit(102, 0xa855f7, 0.22);
    const asteroidBeltGroup = new THREE.Group();

    const featuredAsteroids = [
      { name: 'vercel/next.js', pr: '#67192', stars: '124k' },
      { name: 'facebook/react', pr: '#28419', stars: '228k' },
      { name: 'tailwindlabs/tailwindcss', pr: '#13824', stars: '82k' },
      { name: 'trpc/trpc', pr: '#5412', stars: '36k' },
      { name: 'shadcn/ui', pr: '#3120', stars: '75k' },
      { name: 'astral-sh/uv', pr: '#8921', stars: '39k' },
    ];

    const asteroidCount = 160;
    for (let i = 0; i < asteroidCount; i++) {
      const angle = (i / asteroidCount) * Math.PI * 2 + Math.random() * 0.08;
      const radius = 94 + Math.random() * 20;
      const y = (Math.random() - 0.5) * 14;

      const isFeatured = i < featuredAsteroids.length;
      const rockGeo = new THREE.DodecahedronGeometry(isFeatured ? 2.6 : 0.8 + Math.random() * 1.5, 0);

      let rockMat: THREE.Material;
      if (isFeatured) {
        rockMat = new THREE.MeshPhongMaterial({
          color: 0xc084fc,
          emissive: 0x4c1d95,
          specular: 0xffffff,
          shininess: 40,
        });
      } else {
        rockMat = new THREE.MeshStandardMaterial({
          color: i % 4 === 0 ? 0x9333ea : 0x475569,
          roughness: 0.85,
          metalness: 0.2,
        });
      }

      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      asteroidBeltGroup.add(rock);

      if (isFeatured) {
        const item = featuredAsteroids[i];
        rock.userData = {
          id: 'asteroids',
          key: 'asteroids',
          target: {
            ...CELESTIAL_TARGETS.asteroids,
            name: `${item.name} • PR ${item.pr}`,
            subtitle: `Stars: ${item.stars} • Astéroïde Clé d'Odyssée`,
          },
        };
        clickableObjects.push(rock);
      }
    }
    scene.add(asteroidBeltGroup);

    // ==========================================
    // 4. STATION ORBITALE DEVOPS (8.41 AU)
    // ==========================================
    addOrbit(142, 0x10b981, 0.25);
    const stationGroup = new THREE.Group();
    stationGroup.position.set(-100, 14, 100); // R ~ 142

    // Hub Central
    const hubGeo = new THREE.CylinderGeometry(4, 4, 16, 16);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.25,
    });
    const hubMesh = new THREE.Mesh(hubGeo, hubMat);
    stationGroup.add(hubMesh);

    // Double Solar Array
    const solarMat = new THREE.MeshPhongMaterial({
      color: 0x06b6d4,
      emissive: 0x083344,
      specular: 0xffffff,
      shininess: 60,
    });
    const pGeo = new THREE.BoxGeometry(26, 0.35, 4.5);
    const panelTop = new THREE.Mesh(pGeo, solarMat);
    panelTop.position.set(0, 4.5, 0);
    stationGroup.add(panelTop);

    const panelBottom = new THREE.Mesh(pGeo, solarMat);
    panelBottom.position.set(0, -4.5, 0);
    stationGroup.add(panelBottom);

    // Kubernetes Wireframe Ring
    const k8sRingGeo = new THREE.TorusGeometry(8.5, 0.85, 12, 32);
    const k8sRingMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true });
    const k8sRing = new THREE.Mesh(k8sRingGeo, k8sRingMat);
    k8sRing.rotation.x = Math.PI / 2;
    stationGroup.add(k8sRing);

    // 3 Pulsing Modules (Docker, AWS, Google Cloud)
    const cloudModules = [
      { name: 'Docker Engine // Containers', color: 0x0284c7, pulseSpeed: 2.8 },
      { name: 'AWS Cloud Infra // Terraform', color: 0xf59e0b, pulseSpeed: 1.9 },
      { name: 'Google Cloud Platform // K8s', color: 0xef4444, pulseSpeed: 2.3 },
    ];

    interface ModuleItem {
      mesh: THREE.Mesh;
      speed: number;
      baseColor: number;
    }
    const moduleMeshes: ModuleItem[] = [];

    for (let m = 0; m < 3; m++) {
      const modGeo = new THREE.BoxGeometry(2.8, 2.8, 2.8);
      const modMat = new THREE.MeshStandardMaterial({
        color: cloudModules[m].color,
        emissive: cloudModules[m].color,
        emissiveIntensity: 0.6,
        metalness: 0.5,
        roughness: 0.3,
      });
      const modMesh = new THREE.Mesh(modGeo, modMat);
      const theta = (m / 3) * Math.PI * 2;
      modMesh.position.set(Math.cos(theta) * 8.5, 0, Math.sin(theta) * 8.5);
      stationGroup.add(modMesh);

      modMesh.userData = {
        id: 'station',
        key: 'station',
        target: {
          ...CELESTIAL_TARGETS.station,
          name: cloudModules[m].name,
        },
      };
      clickableObjects.push(modMesh);
      moduleMeshes.push({ mesh: modMesh, speed: cloudModules[m].pulseSpeed, baseColor: cloudModules[m].color });
    }

    hubMesh.userData = {
      id: 'station',
      key: 'station',
      target: CELESTIAL_TARGETS.station,
    };
    clickableObjects.push(hubMesh);
    scene.add(stationGroup);

    // ==========================================
    // CAMERA FLIGHT CONTROLLER
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const targetCamPos = new THREE.Vector3(0, 95, 330);
    const targetLookAt = new THREE.Vector3(0, 0, 0);
    const currentLookAt = new THREE.Vector3(0, 0, 0);
    let isTransitioning = false;

    const navigateTo = (targetKey: WaypointKey) => {
      isTransitioning = true;
      if (targetKey === 'sun') {
        targetCamPos.set(0, 24, 76);
        targetLookAt.set(0, 0, 0);
      } else if (targetKey === 'nextjs') {
        targetCamPos.set(nextGroup.position.x + 24, nextGroup.position.y + 14, nextGroup.position.z + 44);
        targetLookAt.copy(nextGroup.position);
      } else if (targetKey === 'asteroids') {
        targetCamPos.set(105, 32, 105);
        targetLookAt.set(90, 0, 90);
      } else if (targetKey === 'station') {
        targetCamPos.set(stationGroup.position.x + 28, stationGroup.position.y + 16, stationGroup.position.z + 42);
        targetLookAt.copy(stationGroup.position);
      } else if (targetKey === 'reset') {
        targetCamPos.set(0, 95, 330);
        targetLookAt.set(0, 0, 0);
      }
    };

    navigateToRef.current = navigateTo;

    // Mouse Move listener
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Telemetry computation
      const distToSol = camera.position.length();
      const au = Math.max(0, distToSol / 18);
      const simX = camera.position.x + mouse.x * 12;
      const simY = camera.position.y + mouse.y * 8;
      const simZ = camera.position.z;

      onUpdateTelemetryRef.current(simX, simY, simZ, au);

      if (!isTransitioning && !freecamRef.current) {
        camera.position.x += (mouse.x * 12 - camera.position.x * 0.05) * 0.025;
        camera.position.y += (-mouse.y * 10 - (camera.position.y - 30) * 0.05) * 0.025;
      }
    };

    // Click handler for 3D raycasting
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.closest('#hud-interactive-ui') || target.closest('button') || target.closest('a') || target.closest('input') || target.closest('textarea'))) {
        return;
      }

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(clickableObjects, true);

      if (hits.length > 0) {
        let top: THREE.Object3D | null = hits[0].object;
        while (top && !top.userData?.id && top.parent) top = top.parent;
        if (top && top.userData && top.userData.key) {
          onSelectTargetRef.current(top.userData.key as WaypointKey);
        }
      }
    };

    // Resize handler with ResizeObserver
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    // Mouse Wheel Zoom
    const handleWheel = (e: WheelEvent) => {
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      const currentDist = targetCamPos.distanceTo(targetLookAt);
      if ((e.deltaY > 0 && currentDist < 750) || (e.deltaY < 0 && currentDist > 35)) {
        targetCamPos.sub(targetLookAt).multiplyScalar(zoomFactor).add(targetLookAt);
      }
    };

    // Advanced Touch controls for tablets & mobile devices (Orbit, Pinch-to-Zoom & Tap-to-Select)
    let touchStartX = 0;
    let touchStartY = 0;
    let tapStartTime = 0;
    let initialPinchDist = 0;
    let isTouching = false;
    let hasMovedSignificantly = false;

    const getTouchDistance = (t1: Touch, t2: Touch) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.hypot(dx, dy);
    };

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
        if (Math.hypot(dx, dy) > 8) {
          hasMovedSignificantly = true;
        }
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;

        targetCamPos.x -= dx * 0.45;
        targetCamPos.y += dy * 0.35;
      } else if (e.touches.length === 2) {
        // Two-finger pinch to zoom
        const currentDist = getTouchDistance(e.touches[0], e.touches[1]);
        if (initialPinchDist > 0) {
          const pinchFactor = initialPinchDist / currentDist;
          const camDist = targetCamPos.distanceTo(targetLookAt);
          if ((pinchFactor > 1 && camDist < 750) || (pinchFactor < 1 && camDist > 35)) {
            const factor = Math.min(1.08, Math.max(0.92, pinchFactor));
            targetCamPos.sub(targetLookAt).multiplyScalar(factor).add(targetLookAt);
          }
        }
        initialPinchDist = currentDist;
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isTouching && !hasMovedSignificantly && performance.now() - tapStartTime < 350) {
        // Detected clean single-finger tap on 3D object
        const rect = renderer.domElement.getBoundingClientRect();
        const tapX = ((touchStartX - rect.left) / rect.width) * 2 - 1;
        const tapY = -((touchStartY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(new THREE.Vector2(tapX, tapY), camera);
        const hits = raycaster.intersectObjects(clickableObjects, true);

        if (hits.length > 0) {
          let top: THREE.Object3D | null = hits[0].object;
          while (top && !top.userData?.id && top.parent) top = top.parent;
          if (top && top.userData && top.userData.key) {
            onSelectTargetRef.current(top.userData.key as WaypointKey);
          }
        }
      }
      isTouching = false;
      initialPinchDist = 0;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    // Animation Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Rotations
      sunGroup.rotation.y += 0.0025;
      corona1.rotation.y -= 0.005;
      corona2.rotation.z += 0.003;

      nextMesh.rotation.y += 0.007;
      nextAtmo.rotation.y += 0.01;
      nextRing.rotation.z += 0.003;

      asteroidBeltGroup.rotation.y += 0.0016;

      stationGroup.rotation.y += 0.0045;
      k8sRing.rotation.z += 0.014;

      // Pulse DevOps Cloud modules
      for (let m = 0; m < moduleMeshes.length; m++) {
        const item = moduleMeshes[m];
        const pulse = 0.3 + 0.7 * Math.abs(Math.sin(time * item.speed));
        (item.mesh.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
      }

      // Smooth Camera Lerp
      camera.position.lerp(targetCamPos, 0.045);
      currentLookAt.lerp(targetLookAt, 0.045);
      camera.lookAt(currentLookAt);

      if (camera.position.distanceTo(targetCamPos) < 0.3) {
        isTransitioning = false;
      }

      // Raycast hover check
      raycaster.setFromCamera(mouse, camera);
      const hovers = raycaster.intersectObjects(clickableObjects, true);
      if (hovers.length > 0) {
        let top: THREE.Object3D | null = hovers[0].object;
        while (top && !top.userData?.id && top.parent) top = top.parent;
        if (top && top.userData?.target) {
          container.style.cursor = 'pointer';
          onHoverTargetRef.current(top.userData.target);
        }
      } else {
        container.style.cursor = 'default';
        onHoverTargetRef.current(null);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      resizeObserver.disconnect();
      cancelAnimationFrame(animId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      id="odyssey-canvas-container"
      className="absolute inset-0 w-full h-full overflow-hidden bg-[#04060d]"
    />
  );
};
