import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Plant3DExperienceProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const Plant3DExperience: React.FC<Plant3DExperienceProps> = ({ onComplete, onSkip }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [isWatering, setIsWatering] = useState<boolean>(true);
  const [soilMoisture, setSoilMoisture] = useState<number>(32);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  // Ref to pass current watering state to the Three.js animation loop
  const wateringRef = useRef<boolean>(true);
  useEffect(() => {
    wateringRef.current = isWatering;
  }, [isWatering]);

  // Dynamic soil moisture simulation while watering is active
  useEffect(() => {
    const moistureInterval = setInterval(() => {
      setSoilMoisture((prev) => {
        if (wateringRef.current) {
          return prev < 75 ? Math.min(75, prev + 2) : 75;
        } else {
          return prev > 35 ? Math.max(35, prev - 1) : 35;
        }
      });
    }, 250);

    return () => clearInterval(moistureInterval);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let reqId: number | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;

    try {
      // Test WebGL support
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl');
      if (!gl) {
        throw new Error('WebGL not supported in current environment');
      }

      // --- THREE.JS SCENE SETUP ---
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x051f20, 0.07);

      camera = new THREE.PerspectiveCamera(
        42,
        container.clientWidth / (container.clientHeight || 1),
        0.1,
        100
      );
      camera.position.set(0, 2.4, 5.8);
      camera.lookAt(0, 1.3, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);

      // --- LIGHTING ---
      const ambientLight = new THREE.AmbientLight(0xd8efd8, 0.85);
      scene.add(ambientLight);

      const mainSunLight = new THREE.DirectionalLight(0xe8f5e9, 2.5);
      mainSunLight.position.set(4, 9, 5);
      scene.add(mainSunLight);

      const waterReflectLight = new THREE.PointLight(0x38bdf8, 1.8, 8);
      waterReflectLight.position.set(0, 3.2, 1.5);
      scene.add(waterReflectLight);

      const plantGlow = new THREE.PointLight(0x4ade80, 1.2, 7);
      plantGlow.position.set(0, 1.5, 2);
      scene.add(plantGlow);

      // --- MAIN ROOT GROUP ---
      const plantGroup = new THREE.Group();
      scene.add(plantGroup);

      // Pot (Modern Minimalist Terracotta/Slate)
      const potGroup = new THREE.Group();
      plantGroup.add(potGroup);

      const potGeo = new THREE.CylinderGeometry(0.72, 0.52, 0.85, 32);
      const potMat = new THREE.MeshStandardMaterial({
        color: 0x183933,
        roughness: 0.55,
        metalness: 0.15,
      });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.y = 0.425;
      potGroup.add(pot);

      // Pot Rim Accent
      const rimGeo = new THREE.TorusGeometry(0.72, 0.035, 16, 32);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x24554a,
        roughness: 0.4,
        metalness: 0.25,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.84;
      potGroup.add(rim);

      // Soil Disk (Procedurally reactive to water)
      const soilGeo = new THREE.CylinderGeometry(0.69, 0.69, 0.08, 32);
      const drySoilColor = new THREE.Color(0x3d2817);
      const wetSoilColor = new THREE.Color(0x0f241a);
      const soilMat = new THREE.MeshStandardMaterial({
        color: wetSoilColor.clone(),
        roughness: 0.85,
        metalness: 0.1,
      });
      const soil = new THREE.Mesh(soilGeo, soilMat);
      soil.position.y = 0.83;
      plantGroup.add(soil);

      // Stem (Curving Organic Tube)
      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.82, 0),
        new THREE.Vector3(0.06, 1.25, 0.04),
        new THREE.Vector3(-0.04, 1.7, -0.03),
        new THREE.Vector3(0.02, 2.15, 0.02),
        new THREE.Vector3(0, 2.45, 0),
      ]);
      const stemGeo = new THREE.TubeGeometry(stemCurve, 28, 0.042, 12, false);
      const stemMat = new THREE.MeshStandardMaterial({
        color: 0x22543d,
        roughness: 0.45,
      });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      plantGroup.add(stem);

      // Foliage / Leaves Setup
      const leafGeo = new THREE.SphereGeometry(0.38, 20, 16);
      leafGeo.scale(1.0, 0.16, 1.85);

      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x4ade80,
        roughness: 0.32,
        metalness: 0.08,
      });

      const leavesData = [
        { pos: [0.24, 1.25, 0.12], rot: [0.42, 0.45, -0.55], scale: 0.95 },
        { pos: [-0.22, 1.5, -0.1], rot: [-0.35, -0.6, 0.65], scale: 1.1 },
        { pos: [0.2, 1.82, -0.16], rot: [-0.38, 0.8, -0.45], scale: 1.15 },
        { pos: [-0.18, 2.05, 0.18], rot: [0.36, -0.75, 0.52], scale: 1.05 },
        { pos: [0.12, 2.25, 0.08], rot: [0.2, 0.3, -0.25], scale: 0.9 },
        { pos: [-0.02, 2.45, -0.05], rot: [-0.15, 0.1, 0.15], scale: 0.75 },
      ];

      const leafMeshes: THREE.Mesh[] = [];
      leavesData.forEach((ld) => {
        const leaf = new THREE.Mesh(leafGeo, leafMat.clone());
        leaf.position.set(ld.pos[0], ld.pos[1], ld.pos[2]);
        leaf.rotation.set(ld.rot[0], ld.rot[1], ld.rot[2]);
        leaf.scale.setScalar(ld.scale);
        plantGroup.add(leaf);
        leafMeshes.push(leaf);
      });

      // --- WATERING DISPENSER NOZZLE (SMART IRRIGATION HEAD) ---
      const nozzleGroup = new THREE.Group();
      nozzleGroup.position.set(0, 3.4, 0);
      scene.add(nozzleGroup);

      const nozzleRingGeo = new THREE.TorusGeometry(0.45, 0.025, 16, 32);
      const nozzleRingMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        metalness: 0.8,
        roughness: 0.2,
      });
      const nozzleRing = new THREE.Mesh(nozzleRingGeo, nozzleRingMat);
      nozzleRing.rotation.x = Math.PI / 2;
      nozzleGroup.add(nozzleRing);

      // --- DYNAMIC WATER DROPLETS PARTICLE SYSTEM ---
      const DROP_COUNT = 140;
      const dropPositions = new Float32Array(DROP_COUNT * 3);
      const dropVelocities = new Float32Array(DROP_COUNT);
      const dropResetYs = new Float32Array(DROP_COUNT);

      for (let i = 0; i < DROP_COUNT; i++) {
        // Random distribution in nozzle radius
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.42;
        dropPositions[i * 3] = Math.cos(angle) * radius;
        dropPositions[i * 3 + 1] = 2.0 + Math.random() * 1.4; // Y between 2.0 and 3.4
        dropPositions[i * 3 + 2] = Math.sin(angle) * radius;

        dropVelocities[i] = 0.045 + Math.random() * 0.04;
        dropResetYs[i] = 3.35 + Math.random() * 0.2;
      }

      const dropGeo = new THREE.BufferGeometry();
      dropGeo.setAttribute('position', new THREE.BufferAttribute(dropPositions, 3));

      // Droplet canvas texture for soft round particles
      const makeDropTexture = () => {
        const c = document.createElement('canvas');
        c.width = 32;
        c.height = 32;
        const ctx = c.getContext('2d');
        if (ctx) {
          const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
          grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
          grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.9)');
          grad.addColorStop(0.8, 'rgba(14, 165, 233, 0.3)');
          grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 32, 32);
        }
        return new THREE.CanvasTexture(c);
      };

      const dropMat = new THREE.PointsMaterial({
        size: 0.11,
        map: makeDropTexture(),
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const waterParticles = new THREE.Points(dropGeo, dropMat);
      scene.add(waterParticles);

      // --- SPLASH RINGS (ON SOIL IMPACT) ---
      const splashGroup = new THREE.Group();
      splashGroup.position.set(0, 0.85, 0);
      scene.add(splashGroup);

      const splashRings: { mesh: THREE.Mesh; scale: number; speed: number }[] = [];
      const splashRingGeo = new THREE.RingGeometry(0.04, 0.07, 24);
      const splashRingMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });

      for (let i = 0; i < 6; i++) {
        const sm = new THREE.Mesh(splashRingGeo, splashRingMat.clone());
        sm.rotation.x = -Math.PI / 2;
        sm.position.set((Math.random() - 0.5) * 0.5, 0.005 * i, (Math.random() - 0.5) * 0.5);
        splashGroup.add(sm);
        splashRings.push({ mesh: sm, scale: Math.random(), speed: 0.02 + Math.random() * 0.02 });
      }

      // --- SENSOR NODES (STAGE 2) ---
      const sensorGroup = new THREE.Group();
      sensorGroup.visible = false;
      scene.add(sensorGroup);

      const sensorGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const sensorMat = new THREE.MeshStandardMaterial({
        color: 0xd8efd8,
        emissive: 0x8eb69b,
        emissiveIntensity: 0.9,
      });

      const sensorPositions = [
        { pos: [0.85, 1.85, 0.35], label: 'DHT22 Temp/RH' },
        { pos: [-0.75, 1.4, 0.25], label: 'ESP32-CAM AI' },
        { pos: [0.55, 0.85, -0.35], label: 'Capacitive Soil' },
      ];

      sensorPositions.forEach((sp) => {
        const sMesh = new THREE.Mesh(sensorGeo, sensorMat);
        sMesh.position.set(sp.pos[0], sp.pos[1], sp.pos[2]);
        sensorGroup.add(sMesh);

        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(sp.pos[0], sp.pos[1], sp.pos[2]),
          new THREE.Vector3(0, sp.pos[1], 0),
        ]);
        const lineMat = new THREE.LineBasicMaterial({
          color: 0x8eb69b,
          transparent: true,
          opacity: 0.45,
        });
        const line = new THREE.Line(lineGeo, lineMat);
        sensorGroup.add(line);
      });

      // --- AI SCANNING BEAM (STAGE 3) ---
      const scanRingGeo = new THREE.TorusGeometry(0.95, 0.022, 16, 64);
      const scanRingMat = new THREE.MeshBasicMaterial({
        color: 0x4ade80,
        transparent: true,
        opacity: 0.85,
      });
      const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
      scanRing.rotation.x = Math.PI / 2;
      scanRing.position.y = 1.0;
      scanRing.visible = false;
      scene.add(scanRing);

      // --- ANIMATION LOOP ---
      const clock = new THREE.Clock();

      const animate = () => {
        reqId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // 1. Gentle natural rotation & floating of plant
        plantGroup.rotation.y = Math.sin(elapsedTime * 0.35) * 0.2;
        plantGroup.position.y = Math.sin(elapsedTime * 1.1) * 0.02;

        // 2. Water Droplets Animation
        const positions = dropGeo.attributes.position.array as Float32Array;
        const watering = wateringRef.current;

        waterParticles.visible = watering;
        splashGroup.visible = watering;
        nozzleRingMat.emissiveIntensity = watering ? 0.8 + Math.sin(elapsedTime * 5) * 0.3 : 0.1;

        if (watering) {
          for (let i = 0; i < DROP_COUNT; i++) {
            positions[i * 3 + 1] -= dropVelocities[i]; // move down
            // If droplet reaches soil level (around y=0.85)
            if (positions[i * 3 + 1] <= 0.85) {
              positions[i * 3 + 1] = dropResetYs[i];
              // reset with slight random spread
              const angle = Math.random() * Math.PI * 2;
              const radius = Math.random() * 0.4;
              positions[i * 3] = Math.cos(angle) * radius;
              positions[i * 3 + 2] = Math.sin(angle) * radius;
            }
          }
          dropGeo.attributes.position.needsUpdate = true;

          // Animate splash rings on soil surface
          splashRings.forEach((sr) => {
            sr.scale += sr.speed;
            if (sr.scale > 1.8) {
              sr.scale = 0.2;
              sr.mesh.position.x = (Math.random() - 0.5) * 0.6;
              sr.mesh.position.z = (Math.random() - 0.5) * 0.6;
            }
            sr.mesh.scale.set(sr.scale, sr.scale, 1);
            const mat = sr.mesh.material as THREE.MeshBasicMaterial;
            mat.opacity = Math.max(0, 0.7 - sr.scale * 0.35);
          });

          // Dynamic leaf bouncing under water drops (spring effect)
          leafMeshes.forEach((leaf, idx) => {
            const bounce = Math.sin(elapsedTime * 9 + idx * 1.5) * 0.025;
            leaf.position.y = leavesData[idx].pos[1] + bounce;
          });

          // Soil color darkens to wet soil
          (soil.material as THREE.MeshStandardMaterial).color.lerp(wetSoilColor, 0.04);
        } else {
          // Slowly dry up if not watering
          (soil.material as THREE.MeshStandardMaterial).color.lerp(drySoilColor, 0.02);
        }

        // 3. Stage 2 & 3 Elements
        if (scanRing.visible) {
          scanRing.position.y = 1.0 + Math.sin(elapsedTime * 2.8) * 0.75;
          scanRing.rotation.z = elapsedTime * 1.6;
        }

        sensorGroup.position.y = Math.cos(elapsedTime * 1.4) * 0.035;

        // Render scene
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      animate();
      setHasWebGL(true);
    } catch {
      setHasWebGL(false);
    }

    // Storyline progression across stages
    const t1 = setTimeout(() => {
      setStage(2);
      // Reveal sensor telemetry nodes
      if (scene) {
        scene.traverse((child) => {
          if (child.name === 'sensorGroup' || (child as any).isGroup) {
            child.visible = true;
          }
        });
      }
    }, 2400);

    const t2 = setTimeout(() => {
      setStage(3);
    }, 4800);

    const t3 = setTimeout(() => {
      setStage(4);
    }, 7200);

    const t4 = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(onComplete, 800);
    }, 9200);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / (container.clientHeight || 1);
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // --- CLEANUP & MEMORY DISPOSAL ---
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      if (reqId !== null) cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);

      if (scene) {
        scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Line || obj instanceof THREE.Points) {
            obj.geometry?.dispose();
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else if (obj.material) {
              obj.material.dispose();
            }
          }
        });
      }

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [onComplete]);

  const stageTitles: Record<number, string> = {
    1: 'TAHAP 1 · BIOLOGICAL MONITORING & DETEKSI TANAH',
    2: 'TAHAP 2 · SMART IRRIGATION · PENYIRAMAN DINAMIS',
    3: 'TAHAP 3 · DUAL-AI VISION & MICROCLIMATE VALIDATION',
    4: 'TAHAP 4 · SISTEM GREN-VIS READY & OPTIMAL',
  };

  const stageSubtitles: Record<number, string> = {
    1: 'Sensor kapasitif mendeteksi kadar air tanah dan mikroklimat daun.',
    2: 'Sistem menyalurkan tetesan air presisi membasahi zona perakaran.',
    3: 'Model AI (Akurasi 95.41%) memverifikasi risiko patogen & pemulihan daun.',
    4: 'Inisialisasi selesai. Mengalihkan ke Dashboard Kontrol Robotik.',
  };

  return (
    <div
      className={`fixed inset-0 bg-[#051F20] text-white flex flex-col items-center justify-between z-40 transition-opacity duration-700 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* 2D Fallback Visual if WebGL context is not available */}
      {!hasWebGL && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex flex-col items-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-[#163832] to-[#235347] flex items-center justify-center shadow-2xl border border-[#8EB69B]/30 animate-pulse">
              <span className="text-[72px] text-[#8EB69B]">🌱</span>
            </div>
            <div className="mt-6 flex gap-3 items-center">
              <span className="w-3 h-3 rounded-full bg-[#8EB69B] animate-ping" />
              <span className="text-[12px] font-mono tracking-widest text-[#8EB69B]">
                {stageTitles[stage]}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="relative z-10 w-full p-6 sm:p-8 flex justify-between items-center max-w-7xl">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center bg-gradient-to-br from-[#4ade80] to-[#22543d] text-[#051F20] w-[40px] h-[40px] rounded-xl font-black text-[22px] shadow-lg ring-2 ring-[#4ade80]/30">
            G
          </span>
          <div>
            <div className="flex items-center gap-2">
              <b className="text-[18px] tracking-[0.16em] text-white block font-black">GREN-VIS</b>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#22543d] text-[#4ade80] border border-[#4ade80]/30 font-mono">
                FLORA 2.0
              </span>
            </div>
            <small className="text-[#8EB69B] text-[10px] tracking-wider uppercase font-semibold">
              SMK Negeri 1 Jakarta · Precision Agro-Robotics
            </small>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Interactive Watering Toggle Button */}
          <button
            onClick={() => setIsWatering((prev) => !prev)}
            className={`px-4 py-2 rounded-xl text-[12px] font-bold tracking-wider transition-all cursor-pointer flex items-center gap-2 border shadow-lg ${
              isWatering
                ? 'bg-[#0284c7]/30 border-[#38bdf8] text-[#38bdf8] shadow-[#0284c7]/20 ring-2 ring-[#38bdf8]/30 animate-pulse'
                : 'bg-[#163832]/80 border-[#24554a] text-[#8EB69B] hover:text-white'
            }`}
            title="Klik untuk menyalakan/mematikan animasi penyiraman"
          >
            <span>💧</span>
            <span>{isWatering ? 'Sedang Menyiram (ON)' : 'Siram Tanaman (OFF)'}</span>
          </button>

          {/* Skip Button */}
          <button
            onClick={onSkip}
            className="border border-[#163832] bg-[#0B2B26]/80 hover:bg-[#163832] text-[#D8EFD8] px-4 py-2 rounded-xl text-[12px] font-bold tracking-wider transition-all cursor-pointer shadow-sm"
          >
            Masuk Dashboard →
          </button>
        </div>
      </header>

      {/* Floating Realtime Telemetry Pill */}
      <div className="relative z-10 flex gap-3 px-4 py-2 rounded-2xl bg-[#051F20]/90 backdrop-blur-md border border-[#163832] text-[11px] font-mono shadow-xl">
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-ping" />
          <span className="text-gray-300">Kelembapan Tanah:</span>
          <b className="text-[#38bdf8] text-[13px]">{soilMoisture}%</b>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-2 py-1 border-l border-[#163832]">
          <span className="text-gray-300">Status Pompa:</span>
          <b className={isWatering ? 'text-[#4ade80]' : 'text-gray-400'}>
            {isWatering ? 'ACTIVE (PUMP 12V)' : 'STANDBY'}
          </b>
        </div>
        <div className="hidden md:flex items-center gap-2 px-2 py-1 border-l border-[#163832]">
          <span className="text-gray-300">AI Risk Level:</span>
          <b className="text-[#4ade80]">LOW RISK (95.41%)</b>
        </div>
      </div>

      {/* Bottom Story & Progression Bar */}
      <footer className="relative z-10 w-full p-6 sm:p-8 max-w-3xl flex flex-col items-center text-center">
        <div className="bg-[#051F20]/90 backdrop-blur-md border border-[#163832] p-5 sm:p-6 rounded-2xl w-full shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono tracking-[0.2em] text-[#4ade80] font-extrabold uppercase">
              {stageTitles[stage]}
            </span>
            <span className="text-[10px] font-mono text-[#8EB69B]">
              Step {stage}/4
            </span>
          </div>

          <h2 className="text-[18px] sm:text-[21px] font-extrabold text-white m-0 tracking-tight leading-snug">
            {stageSubtitles[stage]}
          </h2>

          {/* Stepper indicators */}
          <div className="grid grid-cols-4 gap-2.5 mt-5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  stage >= s
                    ? 'bg-gradient-to-r from-[#4ade80] via-[#38bdf8] to-[#D8EFD8]'
                    : 'bg-[#163832]'
                }`}
              />
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
