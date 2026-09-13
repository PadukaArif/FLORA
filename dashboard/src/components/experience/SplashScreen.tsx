import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface SplashScreenProps {
  onBootComplete: () => void;
  onSkip: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onBootComplete }) => {
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [isZoomedIn, setIsZoomedIn] = useState<boolean>(false);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isWatering, setIsWatering] = useState<boolean>(false);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const contentParallaxRef = useRef<HTMLDivElement | null>(null);
  const bgParallaxRef = useRef<HTMLDivElement | null>(null);
  const isWateringRef = useRef<boolean>(false);

  useEffect(() => {
    isWateringRef.current = isWatering;
  }, [isWatering]);

  // Phase 1: Solid cover prevents dashboard leak, circle expands smoothly
  useEffect(() => {
    const revealTimer = setTimeout(() => {
      setIsRevealed(true);
    }, 120);

    const zoomTimer = setTimeout(() => {
      setIsZoomedIn(true);
    }, 450);

    return () => {
      clearTimeout(revealTimer);
      clearTimeout(zoomTimer);
    };
  }, []);

  // Phase 2: Three.js Scene (Plant + High-hovering Watering Can + Spinning Diamond & Spike)
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let reqId: number | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;

    const mainGroup = new THREE.Group();
    const plantGroup = new THREE.Group();
    const waterPotGroup = new THREE.Group();
    const waterParticlesGroup = new THREE.Group();

    // Mouse parallax tracking variables (±1% subtle smooth interpolation)
    const targetParallax = { x: 0, y: 0 };
    const curParallax = { x: 0, y: 0 };

    // Manual drag-rotation physics state
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let targetRotY = 0;
    let targetRotX = 0;
    let curRotY = 0;
    let curRotX = 0;
    let velY = 0;
    let velX = 0;

    try {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(
        34,
        container.clientWidth / (container.clientHeight || 1),
        0.1,
        50
      );
      camera.position.set(0, 1.42, 5.2);
      camera.lookAt(0, 1.15, 0);

      // 100% transparent canvas, zero box border
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.18;
      container.appendChild(renderer.domElement);

      // Studio Lighting
      const ambientLight = new THREE.AmbientLight(0xfffaed, 1.15);
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xfff6dd, 1.95);
      sunLight.position.set(4, 7, 4);
      scene.add(sunLight);

      const rimLight = new THREE.DirectionalLight(0x9db312, 1.25);
      rimLight.position.set(-4, 3, -2);
      scene.add(rimLight);

      // Add main group
      scene.add(mainGroup);
      mainGroup.position.set(0, -0.06, 0);
      mainGroup.add(plantGroup);
      mainGroup.add(waterPotGroup);
      mainGroup.add(waterParticlesGroup);

      // ==========================================
      // REALISTIC 3D FLOOR CONTACT SHADOW DISC
      // (Unclipped inside camera frustum, fully grounded)
      // ==========================================
      const shadowCanvas = document.createElement('canvas');
      shadowCanvas.width = 256;
      shadowCanvas.height = 256;
      const sCtx = shadowCanvas.getContext('2d');
      if (sCtx) {
        const grad = sCtx.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, 'rgba(20, 32, 5, 0.58)');
        grad.addColorStop(0.35, 'rgba(24, 38, 6, 0.32)');
        grad.addColorStop(0.68, 'rgba(30, 48, 8, 0.08)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        sCtx.fillStyle = grad;
        sCtx.fillRect(0, 0, 256, 256);
      }
      const shadowTex = new THREE.CanvasTexture(shadowCanvas);
      const shadowGeo = new THREE.PlaneGeometry(2.5, 2.5);
      const shadowMat = new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      });
      const floorShadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      floorShadowMesh.rotation.x = -Math.PI / 2;
      floorShadowMesh.position.set(0, 0.01, 0);
      plantGroup.add(floorShadowMesh);

      // ==========================================
      // 1. PLANT MODEL (Ceramic Pot, Soil, Stem, Lush Leaves)
      // ==========================================
      // Ceramic Pot
      const potGeo = new THREE.CylinderGeometry(0.65, 0.46, 0.76, 32);
      const potMat = new THREE.MeshStandardMaterial({
        color: 0xf6f8f5,
        roughness: 0.22,
        metalness: 0.06,
      });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.y = 0.38;
      plantGroup.add(pot);

      // Pot Rim (Olive green accent ring)
      const rimGeo = new THREE.TorusGeometry(0.65, 0.03, 16, 32);
      const rimMat = new THREE.MeshStandardMaterial({
        color: 0x597c00,
        roughness: 0.3,
        metalness: 0.25,
      });
      const rim = new THREE.Mesh(rimGeo, rimMat);
      rim.rotation.x = Math.PI / 2;
      rim.position.y = 0.76;
      plantGroup.add(rim);

      // Soil Disk
      const soilGeo = new THREE.CylinderGeometry(0.62, 0.62, 0.06, 32);
      const soilMat = new THREE.MeshStandardMaterial({
        color: 0x2e2318,
        roughness: 0.92,
      });
      const soil = new THREE.Mesh(soilGeo, soilMat);
      soil.position.y = 0.74;
      plantGroup.add(soil);

      // Organic Stem
      const stemCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0.74, 0),
        new THREE.Vector3(0.04, 1.12, 0.02),
        new THREE.Vector3(-0.03, 1.5, -0.02),
        new THREE.Vector3(0.02, 1.82, 0.01),
        new THREE.Vector3(0, 2.05, 0),
      ]);
      const stemGeo = new THREE.TubeGeometry(stemCurve, 24, 0.034, 12, false);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x597c00, roughness: 0.45 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      plantGroup.add(stem);

      // Lush Leaves
      const leafGeo = new THREE.SphereGeometry(0.34, 20, 16);
      leafGeo.scale(1.0, 0.15, 1.82);

      const leafMat = new THREE.MeshStandardMaterial({
        color: 0x9db312,
        roughness: 0.24,
        metalness: 0.12,
      });

      const leavesData = [
        { pos: [0.21, 1.12, 0.11], rot: [0.36, 0.5, -0.5], scale: 0.92 },
        { pos: [-0.19, 1.34, -0.08], rot: [-0.3, -0.6, 0.58], scale: 1.05 },
        { pos: [0.18, 1.6, -0.13], rot: [-0.34, 0.8, -0.4], scale: 1.1 },
        { pos: [-0.15, 1.82, 0.14], rot: [0.32, -0.7, 0.45], scale: 1.0 },
        { pos: [0.09, 1.98, 0.04], rot: [0.16, 0.26, -0.2], scale: 0.85 },
        { pos: [-0.02, 2.12, -0.02], rot: [-0.1, 0.08, 0.1], scale: 0.7 },
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

      // =========================================================================
      // 2. 3D WATERING CAN (JARAK LEGA DARI DAUN, TIDAK KENAI DAUN)
      // =========================================================================
      // Idle position: Melayang di atas tanaman dengan jarak lega (tidak menyentuh daun)
      waterPotGroup.position.set(0.58, 2.52, 0.2);

      const waterPotMat = new THREE.MeshStandardMaterial({
        color: 0x597c00,
        roughness: 0.32,
        metalness: 0.28,
      });

      // Can body
      const potBodyGeo = new THREE.CylinderGeometry(0.22, 0.17, 0.33, 20);
      const potBody = new THREE.Mesh(potBodyGeo, waterPotMat);
      waterPotGroup.add(potBody);

      // Can handle
      const handleGeo = new THREE.TorusGeometry(0.17, 0.02, 12, 24, Math.PI);
      const handle = new THREE.Mesh(handleGeo, waterPotMat);
      handle.rotation.z = -Math.PI / 2;
      handle.position.set(0.2, 0.08, 0);
      waterPotGroup.add(handle);

      // Can spout (panjang dan berjarak dari daun)
      const spoutGeo = new THREE.CylinderGeometry(0.028, 0.055, 0.34, 16);
      const spout = new THREE.Mesh(spoutGeo, waterPotMat);
      spout.rotation.z = Math.PI / 2.8;
      spout.position.set(-0.23, 0.11, 0);
      waterPotGroup.add(spout);

      // Rose sprinkler head (aksen emas)
      const roseGeo = new THREE.CylinderGeometry(0.075, 0.038, 0.055, 16);
      const roseMat = new THREE.MeshStandardMaterial({
        color: 0x9db312,
        roughness: 0.2,
        metalness: 0.55,
      });
      const rose = new THREE.Mesh(roseGeo, roseMat);
      rose.rotation.z = Math.PI / 2.8;
      rose.position.set(-0.36, 0.18, 0);
      waterPotGroup.add(rose);

      // ==========================================
      // 5. WATER DROPLETS PARTICLE SYSTEM
      // ==========================================
      const DROP_COUNT = 75;
      const dropPositions = new Float32Array(DROP_COUNT * 3);
      const dropVelocities = new Float32Array(DROP_COUNT);

      for (let i = 0; i < DROP_COUNT; i++) {
        dropPositions[i * 3] = (Math.random() - 0.5) * 0.14;
        dropPositions[i * 3 + 1] = 2.45 + Math.random() * 0.15;
        dropPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.14;
        dropVelocities[i] = 0.05 + Math.random() * 0.025;
      }

      const dropGeo = new THREE.BufferGeometry();
      dropGeo.setAttribute('position', new THREE.BufferAttribute(dropPositions, 3));

      const dropMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.075,
        transparent: true,
        opacity: 0.88,
      });

      const waterParticles = new THREE.Points(dropGeo, dropMat);
      waterParticles.visible = false;
      waterParticlesGroup.add(waterParticles);

      // ==========================================
      // 6. MOUSE PARALLAX & DRAG HANDLERS
      // ==========================================
      const handleWindowPointerMove = (e: PointerEvent) => {
        // Normalized screen mouse coordinates (-1 to 1)
        const normX = (e.clientX / window.innerWidth - 0.5) * 2;
        const normY = (e.clientY / window.innerHeight - 0.5) * 2;

        // ±1% subtle 3D parallax tracking target
        targetParallax.x = normX * 1;
        targetParallax.y = normY * 1;

        // Interactive Three.js drag rotation
        if (isDragging) {
          const deltaX = e.clientX - prevMouse.x;
          const deltaY = e.clientY - prevMouse.y;
          velY = deltaX * 0.007;
          velX = deltaY * 0.004;
          targetRotY += velY;
          targetRotX += velX;
          targetRotX = Math.max(-0.25, Math.min(0.3, targetRotX));
          prevMouse = { x: e.clientX, y: e.clientY };
        }
      };

      const handlePointerDown = (e: PointerEvent) => {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
        velY = 0;
        velX = 0;
      };

      const handlePointerUp = () => {
        isDragging = false;
      };

      const domElement = renderer.domElement;
      domElement.style.touchAction = 'none';
      domElement.style.cursor = 'grab';
      domElement.addEventListener('pointerdown', handlePointerDown);
      window.addEventListener('pointermove', handleWindowPointerMove);
      window.addEventListener('pointerup', handlePointerUp);

      // ==========================================
      // 7. ANIMATION LOOP
      // ==========================================
      const clock = new THREE.Clock();
      let potTilt = 0;
      let potTargetX = 0.58;
      let potTargetY = 2.52;

      const animate = () => {
        reqId = requestAnimationFrame(animate);
        const elapsed = clock.getElapsedTime();
        const watering = isWateringRef.current;

        // 3D Smooth Mouse Parallax (Interpolasi lerp 1% sangat halus)
        curParallax.x += (targetParallax.x - curParallax.x) * 0.05;
        curParallax.y += (targetParallax.y - curParallax.y) * 0.05;

        if (contentParallaxRef.current) {
          contentParallaxRef.current.style.transform = `translate3d(${curParallax.x}%, ${
            curParallax.y
          }%, 0) rotateX(${-curParallax.y * 0.25}deg) rotateY(${curParallax.x * 0.25}deg)`;
        }
        if (bgParallaxRef.current) {
          bgParallaxRef.current.style.transform = `translate3d(${curParallax.x * 0.5}%, ${
            curParallax.y * 0.5
          }%, 0)`;
        }

        // Rotation physics damping
        if (!isDragging) {
          velY *= 0.92;
          velX *= 0.92;
          targetRotY += velY;
          targetRotX += velX;
        }

        curRotY += (targetRotY - curRotY) * 0.1;
        curRotX += (targetRotX - curRotX) * 0.1;

        // Grounded idle rotation
        plantGroup.rotation.y = curRotY + Math.sin(elapsed * 0.45) * 0.07;
        plantGroup.rotation.x = curRotX;
        plantGroup.position.y = Math.sin(elapsed * 0.8) * 0.008;

        // Leaf swaying & reaction to water
        leafMeshes.forEach((l, i) => {
          const sway = Math.sin(elapsed * 1.5 + i) * 0.0016;
          const waterBounce = watering ? Math.sin(elapsed * 12 + i) * 0.0025 : 0;
          l.rotation.z += sway + waterBounce;
        });

        // 3D Watering Can: Berjarak lega di atas daun
        const targetTilt = watering ? -0.48 : 0;
        potTargetX = watering ? 0.35 : 0.58;
        potTargetY = watering ? 2.42 : 2.52;
        potTilt += (targetTilt - potTilt) * 0.12;
        waterPotGroup.rotation.z = potTilt;
        waterPotGroup.position.x += (potTargetX - waterPotGroup.position.x) * 0.1;
        waterPotGroup.position.y += (potTargetY - waterPotGroup.position.y) * 0.1;

        // Water droplets stream down into plant
        if (watering) {
          waterParticles.visible = true;
          const posAttr = dropGeo.attributes.position as THREE.BufferAttribute;
          const posArr = posAttr.array as Float32Array;

          for (let i = 0; i < DROP_COUNT; i++) {
            posArr[i * 3 + 1] -= dropVelocities[i];

            // Reset when hitting soil
            if (posArr[i * 3 + 1] < 0.76) {
              posArr[i * 3] = (Math.random() - 0.5) * 0.14;
              posArr[i * 3 + 1] = 2.45 + Math.random() * 0.15;
              posArr[i * 3 + 2] = (Math.random() - 0.5) * 0.14;
            }
          }
          posAttr.needsUpdate = true;
        } else {
          waterParticles.visible = false;
        }

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      animate();

      const handleResize = () => {
        if (!container || !renderer || !camera) return;
        camera.aspect = container.clientWidth / (container.clientHeight || 1);
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        if (reqId) cancelAnimationFrame(reqId);
        window.removeEventListener('resize', handleResize);
        domElement.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('pointermove', handleWindowPointerMove);
        window.removeEventListener('pointerup', handlePointerUp);

        if (scene) {
          scene.traverse((obj) => {
            if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
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
    } catch {
      // noop
    }
  }, []);

  const handleWaterToggle = () => {
    setIsWatering((prev) => !prev);
  };

  // Outro Sequence: Circular contraction (revealing the dashboard behind it), then delete forever
  const handleEnterDashboard = () => {
    setIsExiting(true);
    setTimeout(() => {
      onBootComplete();
    }, 1400);
  };

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto transition-colors duration-300 ${
        isExiting ? 'bg-transparent' : 'bg-[#1E2805]'
      }`}
    >
      {/* 
        1. SOLID COVER + CIRCLE REVEAL & OUTRO + 5% PARALLAX
        - Outer container has solid bg-[#1E2805] so dashboard NEVER leaks on first load!
        - When isExiting = true, outer becomes transparent so circle cleanly reveals dashboard.
        - Whole layout fits 100% viewport height without needing 50% zoom!
      */}
      <div
        className="w-full h-full bg-[#EFEFEE] relative flex flex-col justify-between p-3 sm:p-5 md:p-6 lg:p-8 overflow-hidden"
        style={{
          clipPath: isExiting
            ? 'circle(0% at 50% 50%)'
            : isRevealed
            ? 'circle(160% at 50% 50%)'
            : 'circle(0% at 50% 50%)',
          transform: isExiting
            ? 'scale(0.96)'
            : isZoomedIn
            ? 'scale(1)'
            : 'scale(1.8)',
          transition: isExiting
            ? 'clip-path 1.4s cubic-bezier(0.65, 0, 0.35, 1), transform 1.4s cubic-bezier(0.65, 0, 0.35, 1)'
            : 'clip-path 2.4s cubic-bezier(0.22, 1, 0.36, 1), transform 2.0s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* ========================================================================= */}
        {/* DEKORASI LATAR BELAKANG: POLIGON DASAR KECIL & CERAH (HIJAU, LIME, GRADASI) */}
        {/* ========================================================================= */}
        {/* SVG Gradient Definitions untuk Poligon Cerah */}
        <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
          <defs>
            <linearGradient id="polyGradLimeGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BEF264" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="polyGradBrightLime" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A3E635" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#65A30D" stopOpacity="0.45" />
            </linearGradient>
            <linearGradient id="polyGradEmeraldLime" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#A3E635" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="polyGradMintLime" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#84CC16" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient id="polyGradSpringGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#86EFAC" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#16A34A" stopOpacity="0.45" />
            </linearGradient>
          </defs>
        </svg>

        <div ref={bgParallaxRef} className="absolute inset-0 pointer-events-none transition-transform duration-75">
          {/* Zona 1: Top-Left (Hexagon Lime + Segitiga Mungil + Diamond) */}
          <div className="absolute top-6 left-12 w-16 h-16 animate-organic-1" style={{ filter: 'blur(6px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" fill="url(#polyGradLimeGreen)" />
            </svg>
          </div>
          <div className="absolute top-24 left-6 w-10 h-10 animate-organic-2" style={{ filter: 'blur(4px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,5 95,95 5,95" fill="url(#polyGradBrightLime)" />
            </svg>
          </div>
          <div className="absolute top-14 left-44 w-7 h-7 animate-organic-3" style={{ filter: 'blur(3px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,0 100,50 50,100 0,50" fill="url(#polyGradEmeraldLime)" />
            </svg>
          </div>

          {/* Zona 2: Top-Center (Diamond & Hexagon Kecil Di Atas) */}
          <div className="absolute top-12 left-[42%] w-10 h-10 animate-organic-3" style={{ filter: 'blur(5px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,0 100,50 50,100 0,50" fill="url(#polyGradMintLime)" />
            </svg>
          </div>
          <div className="absolute top-20 left-[53%] w-8 h-8 animate-organic-1" style={{ filter: 'blur(3px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" fill="url(#polyGradSpringGreen)" />
            </svg>
          </div>

          {/* Zona 3: Top-Right (Pentagon Lime Cerah + Segitiga + Diamond) */}
          <div className="absolute top-4 right-14 w-16 h-16 animate-organic-2" style={{ filter: 'blur(6px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,0 98,35 79,95 21,95 2,35" fill="url(#polyGradLimeGreen)" />
            </svg>
          </div>
          <div className="absolute top-24 right-8 w-10 h-10 animate-organic-1" style={{ filter: 'blur(4px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,5 95,95 5,95" fill="url(#polyGradBrightLime)" />
            </svg>
          </div>
          <div className="absolute top-16 right-36 w-7 h-7 animate-organic-3" style={{ filter: 'blur(3px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,0 100,50 50,100 0,50" fill="url(#polyGradEmeraldLime)" />
            </svg>
          </div>

          {/* Zona 4: Mid-Left (Diamond Lime Sedang + Segitiga Terbalik) */}
          <div className="absolute top-[46%] -left-2 w-14 h-14 animate-organic-2" style={{ filter: 'blur(5px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,0 100,50 50,100 0,50" fill="url(#polyGradBrightLime)" />
            </svg>
          </div>
          <div className="absolute top-[56%] left-14 w-9 h-9 animate-organic-3" style={{ filter: 'blur(4px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="5,5 95,5 50,95" fill="url(#polyGradMintLime)" />
            </svg>
          </div>

          {/* Zona 5: Mid-Right (Octagon Sedang + Hexagon + Diamond di Samping Kanan) */}
          <div className="absolute top-[45%] -right-2 w-16 h-16 animate-organic-1" style={{ filter: 'blur(6px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="30,0 70,0 100,30 100,70 70,100 30,100 0,70 0,30" fill="url(#polyGradEmeraldLime)" />
            </svg>
          </div>
          <div className="absolute top-[38%] right-20 w-10 h-10 animate-organic-2" style={{ filter: 'blur(4px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25" fill="url(#polyGradLimeGreen)" />
            </svg>
          </div>
          <div className="absolute top-[60%] right-14 w-8 h-8 animate-organic-3" style={{ filter: 'blur(3px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,0 100,50 50,100 0,50" fill="url(#polyGradBrightLime)" />
            </svg>
          </div>

          {/* Zona 6: Bottom-Left (Segitiga Lime-Mint + Pentagon Kecil) */}
          <div className="absolute bottom-16 left-8 w-14 h-14 animate-organic-1" style={{ filter: 'blur(5px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,5 95,95 5,95" fill="url(#polyGradMintLime)" />
            </svg>
          </div>
          <div className="absolute bottom-28 left-20 w-10 h-10 animate-organic-2" style={{ filter: 'blur(4px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,0 98,35 79,95 21,95 2,35" fill="url(#polyGradSpringGreen)" />
            </svg>
          </div>

          {/* Zona 7: Bottom-Right (Pentagon Sedang + Diamond) */}
          <div className="absolute bottom-14 right-12 w-14 h-14 animate-organic-2" style={{ filter: 'blur(5px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,0 98,35 79,95 21,95 2,35" fill="url(#polyGradLimeGreen)" />
            </svg>
          </div>
          <div className="absolute bottom-24 right-28 w-9 h-9 animate-organic-3" style={{ filter: 'blur(3px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,0 100,50 50,100 0,50" fill="url(#polyGradBrightLime)" />
            </svg>
          </div>

          {/* Zona 8: Flanking Accents (Aksen Mungil Dekat Area Tengah Bawah) */}
          <div className="absolute bottom-12 left-[36%] w-6 h-6 animate-organic-1" style={{ filter: 'blur(3px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,0 100,50 50,100 0,50" fill="url(#polyGradEmeraldLime)" />
            </svg>
          </div>
          <div className="absolute bottom-12 right-[36%] w-6 h-6 animate-organic-2" style={{ filter: 'blur(3px)' }}>
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <polygon points="50,5 95,95 5,95" fill="url(#polyGradMintLime)" />
            </svg>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* WRAPPER KONTEN UTAMA DENGAN INTERPOLASI 3D MOUSE PARALLAX 5%               */}
        {/* ========================================================================= */}
        <div
          ref={contentParallaxRef}
          className="relative z-20 w-full h-full flex flex-col justify-between transition-transform duration-75 ease-out"
        >
          {/* ========================================================================= */}
          {/* HEADER BAR: SEMUA ELEMEN BERDEKATAN DENGAN BENTUK WAJIK (SESUAI SCREENSHOT) */}
          {/* ========================================================================= */}
          <header className="w-full flex items-center justify-center pt-1 sm:pt-2">
            <div className="inline-flex items-center gap-3 sm:gap-6 md:gap-8 text-[11px] sm:text-xs font-jakarta-bold tracking-widest select-none">
              <span className="animate-text-flora-color">BOTANICAL</span>
              <span className="animate-text-flora-color">INTELLIGENCE</span>

              {/* 3 BENTUK WAJIK WAJIB (MENGAMBANG 3% KE ATAS LOOP SELAMANYA) */}
              <div className="flex items-center gap-2 sm:gap-3 px-1 sm:px-2">
                <span className="animate-float-3p-1 text-[#597C00] inline-block" title="Botanical Star">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
                  </svg>
                </span>
                <span className="animate-float-3p-2 text-[#9DB312] inline-block" title="Botanical Star">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
                  </svg>
                </span>
                <span className="animate-float-3p-3 text-[#597C00] inline-block" title="Botanical Star">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
                  </svg>
                </span>
              </div>

              <span className="animate-text-flora-color">AI-VISION</span>
              <span className="animate-text-flora-color">PRECISION</span>
            </div>
          </header>

          {/* ========================================================================= */}
          {/* MAIN CONTENT ROW (ZOOM-TO-FIT: RESPONSIF DI 100% ZOOM TANPA SCROLL)       */}
          {/* ========================================================================= */}
          <main className="w-full max-w-6xl mx-auto flex-1 min-h-0 flex flex-col lg:flex-row items-center justify-between gap-4 sm:gap-6 my-auto py-1">
            {/* SISI KIRI: ETHEREAL TYPOGRAPHY (W DIBERI JARAK DENGAN ELCOME, TANPA SHADOW DI BAWAH) */}
            <div className="flex-1 pr-0 lg:pr-6 z-20 w-full flex flex-col justify-center">
              <div className="relative inline-block">
                <div className="flex items-baseline leading-none">
                  {/* 
                    HURUF PERTAMA 'W' MARCKSCRIPT:
                    - Memiliki jarak lega dengan 'ELCOME' (mr-3 sm:mr-4 lg:mr-5)
                    - Gradasi otomatis 3 palet hijau Antigravity via flora-gradient-text
                  */}
                  <span className="font-marck-script text-6xl sm:text-7xl md:text-8xl lg:text-[105px] xl:text-[120px] leading-none inline-block mr-3 sm:mr-4 lg:-mr-2 translate-y-1 sm:translate-y-2 select-none relative z-10 flora-gradient-text">
                    W
                  </span>

                  {/* Huruf berikutnya 'ELCOME' dalam Plus Jakarta Sans Bold */}
                  <span className="font-jakarta-bold text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tight select-none inline-block flora-gradient-text relative z-0">
                    ELCOME
                  </span>
                </div>

                {/* Sub-Title Ethereal 'FLORA SYSTEM' (SHADOW DI BAWAH SUDAH DIHILANGKAN TOTAL) */}
                <div className="font-jakarta-bold text-base sm:text-lg md:text-xl lg:text-2xl tracking-tight uppercase select-none mt-1 pl-1 animate-text-flora-color">
                  FLORA SYSTEM
                </div>
              </div>
            </div>

            {/* SISI KANAN: 3D PLANT (UNCLIPPED FLOOR SHADOW + DIAMOND ROTATING + SPIKE ROTATING) */}
            <div className="flex-1 flex items-center justify-center lg:justify-end z-20 relative w-full">
              <div className="relative w-[270px] h-[290px] sm:w-[320px] sm:h-[340px] md:w-[370px] md:h-[390px] lg:w-[420px] lg:h-[440px] max-h-[48vh] flex items-center justify-center overflow-visible">
                {/* Three.js Canvas Container */}
                <div
                  ref={canvasContainerRef}
                  className="w-full h-full cursor-grab active:cursor-grabbing outline-none block relative z-10"
                  title="Klik dan geser untuk memutar 3D tanaman"
                />

                {/* TOMBOL SIRAM DI SEBELAH ATAS TANAMAN */}
                <div className="absolute top-2 right-2 z-30">
                  <button
                    onClick={handleWaterToggle}
                    className={`glass-btn-shine px-3 py-1 rounded-xl text-xs font-jakarta-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                      isWatering
                        ? 'bg-[#38bdf8]/30 border-[#0284c7] text-[#0369a1] ring-2 ring-[#38bdf8]/40 animate-pulse'
                        : 'bg-white/80 border-white/90 text-[#597C00] hover:bg-white'
                    }`}
                    title="Klik untuk menyiram tanaman dengan pot 3D berjarak di atas daun"
                  >
                   
                    <span>{isWatering ? 'Menyiram...' : 'Siram'}</span>
                  </button>
                </div>
              </div>
            </div>
          </main>

          {/* ========================================================================= */}
          {/* FOOTER GRID SESUAI SCREENSHOT ETHEREAL DESIGN (SMKN 1 DI TENGAH ATAS TOMBOL) */}
          {/* ========================================================================= */}
          <footer className="w-full flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 pt-1">
            {/* Lower Left: 3 Kolom Mini (Animasi Warna Otomatis) */}
            <div className="flex items-center gap-4 sm:gap-6 text-[10px] sm:text-[11px] font-jakarta-bold tracking-wider">
              <div className="leading-snug animate-text-flora-color-delayed">
                <div>SENSORS</div>
                <div className="text-[#597C00]">+ TELEMETRY</div>
              </div>
              <div className="leading-snug animate-text-flora-color-delayed">
                <div>VISION</div>
                <div className="text-[#597C00]">+ AI-INFER</div>
              </div>
              <div className="leading-snug animate-text-flora-color-delayed">
                <div>ROBOTIC</div>
                <div className="text-[#597C00]">+ ACTUATOR</div>
              </div>
            </div>

            {/* Middle Area: Dikosongkan agar tombol 'Masuk Dashboard' + SMKN 1 Jakarta bersih di tengah */}
            <div className="hidden md:block flex-1" />

            {/* Lower Right: Ikon Bintang Botani 4-Point + Paragraf Deskripsi (Animasi Warna) */}
            <div className="flex items-start gap-2.5 max-w-xs text-left">
              <span className="text-[#597C00] mt-0.5 shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0 C12 7 17 12 24 12 C17 12 12 17 12 24 C12 17 7 12 0 12 C7 12 12 7 12 0 Z" />
                  <circle cx="12" cy="12" r="2.5" fill="#EFEFEE" />
                </svg>
              </span>
              <p className="text-[9px] sm:text-[10px] font-montserrat-regular leading-relaxed select-none animate-text-flora-color-delayed">
                Autonomous botanical observation ecosystem powered by dual-core computer vision, real-time microclimate sensory telemetry, and micro-precision watering actuation.
              </p>
            </div>
          </footer>
        </div>

        {/* ========================================================================= */}
        {/* SMKN 1 JAKARTA (HANYA SATU) TEPAT DI ATAS TOMBOL 'MASUK DASHBOARD'       */}
        {/* ========================================================================= */}
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-auto">
          {/* HANYA SATU TULISAN SMKN 1 JAKARTA TEPAT DI ATAS TOMBOL DENGAN ANIMASI WARNA */}
          <div className="text-[10px] sm:text-[11px] font-jakarta-bold tracking-[0.25em] animate-text-flora-color uppercase select-none mb-1.5 text-center">
            SMKN 1 JAKARTA
          </div>
          <button
            onClick={handleEnterDashboard}
            className="glass-btn-shine px-5 py-2 rounded-full text-xs font-montserrat-regular font-medium tracking-wider text-[#597C00] cursor-pointer shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            Masuk Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
