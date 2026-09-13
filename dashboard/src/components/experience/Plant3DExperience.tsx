import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface Plant3DExperienceProps {
  onComplete: () => void;
  onSkip: () => void;
}

export const Plant3DExperience: React.FC<Plant3DExperienceProps> = ({ onComplete, onSkip }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

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
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        throw new Error('WebGL not supported in current environment');
      }

      // --- THREE.JS SCENE SETUP ---
      scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x051f20, 0.08);

      camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / (container.clientHeight || 1),
        0.1,
        100
      );
      camera.position.set(0, 2.2, 5.5);
      camera.lookAt(0, 1.2, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      container.appendChild(renderer.domElement);

      // --- LIGHTING ---
      const ambientLight = new THREE.AmbientLight(0xd8efd8, 0.8);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0x8eb69b, 2.2);
      dirLight.position.set(5, 8, 4);
      scene.add(dirLight);

      const pointLight = new THREE.PointLight(0x94d46e, 1.5, 10);
      pointLight.position.set(0, 2, 2);
      scene.add(pointLight);

      // --- PLANT GROUP ---
      const plantGroup = new THREE.Group();
      scene.add(plantGroup);

      // Pot / Base
      const potGeo = new THREE.CylinderGeometry(0.7, 0.5, 0.8, 24);
      const potMat = new THREE.MeshStandardMaterial({
        color: 0x163832,
        roughness: 0.6,
        metalness: 0.2,
      });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.y = 0.4;
      plantGroup.add(pot);

      // Soil
      const soilGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.05, 24);
      const soilMat = new THREE.MeshStandardMaterial({ color: 0x0b2b26, roughness: 0.9 });
      const soil = new THREE.Mesh(soilGeo, soilMat);
      soil.position.y = 0.8;
      plantGroup.add(soil);

      // Stem
      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.8, 0),
        new THREE.Vector3(0.08, 1.3, 0.05),
        new THREE.Vector3(-0.05, 1.8, -0.04),
        new THREE.Vector3(0, 2.3, 0),
      ]);
      const stemGeo = new THREE.TubeGeometry(stemCurve, 20, 0.045, 12, false);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x235347, roughness: 0.4 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      plantGroup.add(stem);

      // Leaves
      const leafGeo = new THREE.SphereGeometry(0.35, 16, 12);
      leafGeo.scale(1, 0.2, 2);

      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x8eb69b,
        roughness: 0.3,
        metalness: 0.1,
      });

      const leavesData = [
        { pos: [0.22, 1.2, 0.1], rot: [0.4, 0.5, -0.5], scale: 0.9 },
        { pos: [-0.2, 1.5, -0.1], rot: [-0.3, -0.6, 0.6], scale: 1.1 },
        { pos: [0.18, 1.8, -0.15], rot: [-0.4, 0.8, -0.4], scale: 1.2 },
        { pos: [-0.15, 2.0, 0.15], rot: [0.3, -0.7, 0.5], scale: 1.0 },
        { pos: [0.02, 2.3, 0], rot: [0.1, 0.1, 0], scale: 0.8 },
      ];

      leavesData.forEach((ld) => {
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.position.set(ld.pos[0], ld.pos[1], ld.pos[2]);
        leaf.rotation.set(ld.rot[0], ld.rot[1], ld.rot[2]);
        leaf.scale.setScalar(ld.scale);
        plantGroup.add(leaf);
      });

      // --- SENSOR NODES (STAGE 2) ---
      const sensorGroup = new THREE.Group();
      sensorGroup.visible = false;
      scene.add(sensorGroup);

      const sensorGeo = new THREE.SphereGeometry(0.09, 16, 16);
      const sensorMat = new THREE.MeshStandardMaterial({
        color: 0xd8efd8,
        emissive: 0x8eb69b,
        emissiveIntensity: 0.8,
      });

      const sensorPositions = [
        { pos: [0.9, 1.9, 0.4] },
        { pos: [-0.8, 1.4, 0.3] },
        { pos: [0.6, 0.8, -0.4] },
      ];

      sensorPositions.forEach((sp) => {
        const sMesh = new THREE.Mesh(sensorGeo, sensorMat);
        sMesh.position.set(sp.pos[0], sp.pos[1], sp.pos[2]);
        sensorGroup.add(sMesh);

        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(sp.pos[0], sp.pos[1], sp.pos[2]),
          new THREE.Vector3(0, sp.pos[1], 0),
        ]);
        const lineMat = new THREE.LineBasicMaterial({ color: 0x8eb69b, transparent: true, opacity: 0.4 });
        const line = new THREE.Line(lineGeo, lineMat);
        sensorGroup.add(line);
      });

      // --- AI SCANNING RING (STAGE 3) ---
      const scanRingGeo = new THREE.TorusGeometry(0.9, 0.02, 16, 64);
      const scanRingMat = new THREE.MeshBasicMaterial({
        color: 0x94d46e,
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

        plantGroup.rotation.y = Math.sin(elapsedTime * 0.4) * 0.25;
        plantGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.03;

        if (scanRing.visible) {
          scanRing.position.y = 1.0 + Math.sin(elapsedTime * 3.0) * 0.7;
          scanRing.rotation.z = elapsedTime * 1.5;
        }

        sensorGroup.position.y = Math.cos(elapsedTime * 1.5) * 0.04;

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      animate();

      setHasWebGL(true);
    } catch {
      setHasWebGL(false);
    }

    // Stage progression timer (runs regardless of WebGL for smooth storytelling)
    const t1 = setTimeout(() => setStage(2), 2000);
    const t2 = setTimeout(() => setStage(3), 4200);
    const t3 = setTimeout(() => setStage(4), 6500);
    const t4 = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(onComplete, 800);
    }, 8200);

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
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
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

  const stageTitles = {
    1: 'STAGE 1 · BIOLOGICAL FOUNDATION',
    2: 'STAGE 2 · IOT SENSOR NETWORK',
    3: 'STAGE 3 · AI VISION & ON-DEVICE ML',
    4: 'STAGE 4 · FLORA SYSTEM ONLINE',
  };

  const stageSubtitles = {
    1: 'Observation begins at the leaf and soil level.',
    2: 'Real-time telemetry streams from microclimate sensors.',
    3: 'Neural network scans visual indications and disease risk.',
    4: 'Decision intelligence activated. Launching dashboard.',
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
              <span className="text-[72px] text-[#8EB69B]">🌿</span>
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
      <header className="relative z-10 w-full p-8 flex justify-between items-center max-w-7xl">
        <div className="flex items-center gap-3">
          <span className="grid place-items-center bg-[#8EB69B] text-[#051F20] w-[36px] h-[36px] rounded-xl font-black text-[20px] shadow-sm">
            F
          </span>
          <div>
            <b className="text-[17px] tracking-[0.14em] text-white block font-black">FLORA</b>
            <small className="text-[#8EB69B] text-[10px] tracking-wider uppercase font-semibold">
              From Plant to Intelligence
            </small>
          </div>
        </div>

        <button
          onClick={onSkip}
          className="border border-[#163832] bg-[#0B2B26]/80 hover:bg-[#163832] text-[#D8EFD8] px-4 py-2 rounded-xl text-[12px] font-bold tracking-wider transition-all cursor-pointer shadow-sm"
        >
          Skip Intro →
        </button>
      </header>

      {/* Bottom Story & Progression Bar */}
      <footer className="relative z-10 w-full p-8 max-w-3xl flex flex-col items-center text-center">
        <div className="bg-[#051F20]/85 backdrop-blur-md border border-[#163832] p-5 rounded-2xl w-full shadow-2xl">
          <span className="text-[10px] font-mono tracking-[0.2em] text-[#8EB69B] font-extrabold uppercase block mb-1">
            {stageTitles[stage]}
          </span>
          <h2 className="text-[20px] font-extrabold text-white m-0 tracking-tight leading-snug">
            {stageSubtitles[stage]}
          </h2>

          {/* Stepper indicators */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  stage >= s ? 'bg-gradient-to-r from-[#8EB69B] to-[#D8EFD8]' : 'bg-[#163832]'
                }`}
              />
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
