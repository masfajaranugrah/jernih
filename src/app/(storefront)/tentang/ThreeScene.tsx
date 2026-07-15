"use client";

import { useEffect, useRef } from "react";

export default function ThreeScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const init = async () => {
      const THREE = await import("three");

      const container = containerRef.current;
      if (!container) return;

      const width = container.clientWidth || window.innerWidth * 0.4;
      const height = container.clientHeight || window.innerWidth * 0.4;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      const geometry = new THREE.TorusKnotGeometry(10, 3, 100, 16);
      const material = new THREE.MeshPhongMaterial({
        color: 0x1e3a8a,
        shininess: 100,
        specular: 0x444444,
        transparent: true,
        opacity: 0.8,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const pointLight = new THREE.PointLight(0xffffff, 1);
      pointLight.position.set(25, 25, 25);
      scene.add(pointLight);

      camera.position.z = 35;

      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const handleMouseMove = (event: MouseEvent) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      };

      document.addEventListener("mousemove", handleMouseMove);

      let animationId: number;

      function animate() {
        animationId = requestAnimationFrame(animate);

        targetX = mouseX * 0.5;
        targetY = mouseY * 0.5;

        mesh.rotation.x += 0.005 + (targetY - mesh.rotation.x) * 0.05;
        mesh.rotation.y += 0.005 + (targetX - mesh.rotation.y) * 0.05;

        renderer.render(scene, camera);
      }

      animate();

      const handleResize = () => {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        if (newWidth && newHeight) {
          camera.aspect = newWidth / newHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(newWidth, newHeight);
        }
      };

      window.addEventListener("resize", handleResize);

      cleanup = () => {
        cancelAnimationFrame(animationId);
        document.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
        geometry.dispose();
        material.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      };
    };

    init();

    return () => {
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute right-0 top-1/2 z-5 -translate-y-1/2 opacity-80 max-lg:opacity-40"
      style={{
        width: "40vw",
        height: "40vw",
        maxWidth: "600px",
        maxHeight: "600px",
      }}
    />
  );
}
