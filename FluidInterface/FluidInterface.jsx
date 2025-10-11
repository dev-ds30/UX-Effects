import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';

export default function OrganicUX() {
  const mountRef = useRef(null);
  const [activePanel, setActivePanel] = useState('home');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const sceneRef = useRef(null);
  const particlesRef = useRef(null);
  const waveRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8e4dd);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // Create organic flowing wave
    const waveGeometry = new THREE.PlaneGeometry(8, 8, 50, 50);
    const positions = waveGeometry.attributes.position;
    const originalPositions = positions.array.slice();
    
    const waveMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      metalness: 0.2,
      roughness: 0.4,
      side: THREE.DoubleSide,
      wireframe: false,
    });
    
    const wave = new THREE.Mesh(waveGeometry, waveMaterial);
    scene.add(wave);
    waveRef.current = { mesh: wave, geometry: waveGeometry, originalPositions };

    // Create particle system
    const particleCount = 1000;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 10;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 10;
      
      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.02,
        y: (Math.random() - 0.5) * 0.02,
        z: (Math.random() - 0.5) * 0.02,
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x1a1a1a,
      size: 0.05,
      transparent: true,
      opacity: 0.6,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    particlesRef.current = { mesh: particles, velocities: particleVelocities };

    // Create flowing ribbon
    const ribbonCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-3, -2, 0),
      new THREE.Vector3(-1, 0, 1),
      new THREE.Vector3(1, 1, 0),
      new THREE.Vector3(3, -1, -1),
    ]);

    const ribbonGeometry = new THREE.TubeGeometry(ribbonCurve, 64, 0.3, 8, false);
    const ribbonMaterial = new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      metalness: 0.7,
      roughness: 0.2,
    });
    const ribbon = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    scene.add(ribbon);

    let time = 0;
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      time += 0.01;

      // Animate wave
      if (waveRef.current) {
        const positions = waveRef.current.geometry.attributes.position;
        const original = waveRef.current.originalPositions;
        
        for (let i = 0; i < positions.count; i++) {
          const x = original[i * 3];
          const y = original[i * 3 + 1];
          
          const waveX = Math.sin(x * 0.5 + time) * 0.3;
          const waveY = Math.cos(y * 0.5 + time * 1.2) * 0.3;
          const waveZ = Math.sin((x + y) * 0.3 + time * 0.8) * 0.5;
          
          positions.array[i * 3 + 2] = waveZ + waveX + waveY;
        }
        
        positions.needsUpdate = true;
        waveRef.current.mesh.rotation.x = Math.sin(time * 0.3) * 0.1;
        waveRef.current.mesh.rotation.y = time * 0.1;
      }

      // Animate particles
      if (particlesRef.current) {
        const positions = particlesRef.current.mesh.geometry.attributes.position;
        const velocities = particlesRef.current.velocities;

        for (let i = 0; i < positions.count; i++) {
          positions.array[i * 3] += velocities[i].x;
          positions.array[i * 3 + 1] += velocities[i].y;
          positions.array[i * 3 + 2] += velocities[i].z;

          // Boundary check
          if (Math.abs(positions.array[i * 3]) > 5) velocities[i].x *= -1;
          if (Math.abs(positions.array[i * 3 + 1]) > 5) velocities[i].y *= -1;
          if (Math.abs(positions.array[i * 3 + 2]) > 5) velocities[i].z *= -1;
        }

        positions.needsUpdate = true;
        particlesRef.current.mesh.rotation.y += 0.001;
      }

      // Animate ribbon
      ribbon.rotation.y = time * 0.2;
      ribbon.rotation.z = Math.sin(time * 0.5) * 0.2;

      // Mouse interaction
      camera.position.x = mousePos.x * 0.5;
      camera.position.y = -mousePos.y * 0.5;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mousePos]);

  const handleMouseMove = (e) => {
    const rect = mountRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setMousePos({ x, y });
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-neutral-200 to-neutral-300 overflow-hidden">
      <div
        ref={mountRef}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
      />
      
      <div className="absolute top-8 left-8 space-y-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
          <h1 className="text-xl font-light tracking-wide text-neutral-800">FLUID INTERFACE</h1>
        </div>
      </div>

      <div className="absolute bottom-8 left-8 space-y-3">
        {['home', 'explore', 'settings'].map((panel) => (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            className={`block w-48 px-6 py-3 rounded-full transition-all duration-300 ${
              activePanel === panel
                ? 'bg-neutral-900 text-white shadow-xl'
                : 'bg-white/60 backdrop-blur-sm text-neutral-700 hover:bg-white/80'
            }`}
          >
            <span className="font-light tracking-wide uppercase text-sm">
              {panel}
            </span>
          </button>
        ))}
      </div>

      <div className="absolute top-8 right-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg max-w-xs">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-light text-neutral-600">FLOW STATE</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500">PARTICLES</span>
              <span className="text-neutral-800 font-medium">1000</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500">MODE</span>
              <span className="text-neutral-800 font-medium">{activePanel.toUpperCase()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-neutral-500">DYNAMICS</span>
              <span className="text-neutral-800 font-medium">ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 right-8 text-xs text-neutral-500 font-light">
        ORGANIC 3D EXPERIENCE
      </div>
    </div>
  );
}
