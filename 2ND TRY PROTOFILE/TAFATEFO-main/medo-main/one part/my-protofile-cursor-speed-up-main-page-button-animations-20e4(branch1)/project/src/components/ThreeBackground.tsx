import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeBackground: React.FC = () => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const scene = new THREE.Scene();
		scene.fog = new THREE.Fog(new THREE.Color(0x0b1220), 12, 42);

		const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 200);
		camera.position.set(0, 2.2, 9);

		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(container.clientWidth, container.clientHeight);
		renderer.setClearColor(0x000000, 0); // transparent
		container.appendChild(renderer.domElement);

		// Neon gradient grid (curved lines)
		const gridGroup = new THREE.Group();
		scene.add(gridGroup);

		const gridMaterial = new THREE.LineBasicMaterial({
			color: 0x00ffa6,
			transparent: true,
			opacity: 0.55,
		});
		const gridMaterial2 = new THREE.LineBasicMaterial({ color: 0x4ea3ff, transparent: true, opacity: 0.4 });

		const createCurve = (z: number, colorAlt = false) => {
			const points: THREE.Vector3[] = [];
			for (let x = -20; x <= 20; x += 0.5) {
				const y = Math.sin(x * 0.22 + z * 0.3) * 0.6 + Math.cos(x * 0.08 + z) * 0.15;
				points.push(new THREE.Vector3(x * 0.22, y, z));
			}
			const geo = new THREE.BufferGeometry().setFromPoints(points);
			const line = new THREE.Line(geo, colorAlt ? gridMaterial2 : gridMaterial);
			gridGroup.add(line);
			return line;
		};

		for (let i = 0; i < 40; i++) {
			createCurve(-i * 0.6, i % 2 === 0);
		}

		// Starfield / particles (base)
		const particlesGeo = new THREE.BufferGeometry();
		const particleCount = 1200;
		const positions = new Float32Array(particleCount * 3);
		const colors = new Float32Array(particleCount * 3);
		for (let i = 0; i < particleCount; i++) {
			positions[i * 3 + 0] = (Math.random() - 0.5) * 30;
			positions[i * 3 + 1] = Math.random() * 10 - 4;
			positions[i * 3 + 2] = -Math.random() * 40;
			const c = new THREE.Color().setHSL(THREE.MathUtils.randFloat(0.45, 0.72), 0.8, THREE.MathUtils.randFloat(0.45, 0.7));
			colors[i * 3 + 0] = c.r;
			colors[i * 3 + 1] = c.g;
			colors[i * 3 + 2] = c.b;
		}
		particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
		particlesGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
		const particlesMat = new THREE.PointsMaterial({ size: 0.06, vertexColors: true, transparent: true, opacity: 0.85 });
		const particles = new THREE.Points(particlesGeo, particlesMat);
		scene.add(particles);

		// Secondary pulsing stars
		const pulseStarsGeo = new THREE.BufferGeometry();
		const pulseCount = 180;
		const pulsePos = new Float32Array(pulseCount * 3);
		for (let i = 0; i < pulseCount; i++) {
			pulsePos[i * 3 + 0] = (Math.random() - 0.5) * 26;
			pulsePos[i * 3 + 1] = Math.random() * 9 - 3;
			pulsePos[i * 3 + 2] = -Math.random() * 35;
		}
		pulseStarsGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
		const pulseStarsMat = new THREE.PointsMaterial({ size: 0.14, color: 0xffffff, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
		const pulseStars = new THREE.Points(pulseStarsGeo, pulseStarsMat);
		scene.add(pulseStars);

		// Neon foggy glow plane beneath
		const planeGeo = new THREE.PlaneGeometry(60, 60, 1, 1);
		const planeMat = new THREE.MeshBasicMaterial({ color: 0x0b1220, transparent: true, opacity: 0.25 });
		const plane = new THREE.Mesh(planeGeo, planeMat);
		plane.rotation.x = -Math.PI / 2;
		plane.position.y = -2.2;
		scene.add(plane);

		// ---- Solar System ----
		// Hide the grid in favour of planets
		gridGroup.visible = false;

		// Center for planet orbits (lowered to give more space above)
		const center = new THREE.Vector3(0, -0.4, -9);

		// Scene lighting (no sun): hemisphere + rim light for pseudo drop-shadows
		const hemiLight = new THREE.HemisphereLight(0x224466, 0x050810, 0.75);
		const rimLight = new THREE.DirectionalLight(0x66aaff, 0.7);
		rimLight.position.set(-6, 4, -4);
		scene.add(hemiLight, rimLight);

		// Glow texture for halos and effects
		const glowTex = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABAQMAAAAl21bKAAAABlBMVEUAAAD///+l2Z/dAAAAAXRSTlMAQObYZgAAAA1JREFUCNdjYAAAAAIAAeIhvDMAAAAASUVORK5CYII=');

		// Nebula glow sprites (background)
		const nebulaColors = [0x3cf5ff, 0xff5fda, 0x9bffb0];
		const nebulaSprites: THREE.Sprite[] = [];
		for (let i = 0; i < 3; i++) {
			const mat = new THREE.SpriteMaterial({ map: glowTex, color: nebulaColors[i], transparent: true, opacity: 0.18, depthWrite: false, blending: THREE.AdditiveBlending });
			const s = new THREE.Sprite(mat);
			s.scale.set(18 + i * 6, 12 + i * 5, 1);
			s.position.set((i - 1) * 6, -0.5 + i * 0.6, -14 - i * 4);
			scene.add(s);
			nebulaSprites.push(s);
		}

		// Planets configuration (7 planets)
		const planetConfigs = [
			{ name: 'Mercury', radius: 0.18, distance: 2.0, color: 0x9e8e7e, emissive: 0x332a22, eInt: 0.22, orbit: 0.022, rot: 0.01 },
			{ name: 'Venus', radius: 0.28, distance: 2.8, color: 0xd4b27a, emissive: 0x2a1e12, eInt: 0.24, orbit: 0.018, rot: 0.008 },
			{ name: 'Earth', radius: 0.3, distance: 3.6, color: 0x3aa7ff, emissive: 0x0a1a2a, eInt: 0.26, orbit: 0.016, rot: 0.02 },
			{ name: 'Mars', radius: 0.24, distance: 4.3, color: 0xdf6b4a, emissive: 0x2a0e08, eInt: 0.24, orbit: 0.013, rot: 0.018 },
			{ name: 'Jupiter', radius: 0.7, distance: 5.4, color: 0xd9b38c, emissive: 0x2a1c12, eInt: 0.22, orbit: 0.009, rot: 0.03 },
			{ name: 'Saturn', radius: 0.6, distance: 6.6, color: 0xc8b48a, emissive: 0x231a10, eInt: 0.22, orbit: 0.007, rot: 0.028, ring: { inner: 0.8, outer: 1.3, tilt: 0.35 } },
			{ name: 'Uranus', radius: 0.5, distance: 7.8, color: 0x8fd8ff, emissive: 0x0a1a22, eInt: 0.24, orbit: 0.006, rot: 0.024 }
		] as const;

		const pivots: THREE.Group[] = [];
		const planetMeshes: THREE.Mesh[] = [];
		const ringMeshes: THREE.Mesh[] = [];
		const orbitLines: THREE.Line[] = [];
		planetConfigs.forEach((cfg, idx) => {
			const pivot = new THREE.Group();
			pivot.position.copy(center);
			scene.add(pivot);
			const mat = new THREE.MeshStandardMaterial({ color: cfg.color, emissive: cfg.emissive, emissiveIntensity: cfg.eInt, roughness: 0.8, metalness: 0.1 });
			const mesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.radius, 48, 48), mat);
			mesh.position.set(cfg.distance, 0, 0);
			pivot.add(mesh);
			pivots.push(pivot);
			planetMeshes.push(mesh);
			// Small halo per planet (stronger)
			const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending, depthWrite: false }));
			halo.scale.set(cfg.radius * 7.5, cfg.radius * 7.5, 1);
			halo.position.set(cfg.distance, 0, 0);
			pivot.add(halo);
			// Rings for Saturn
			// @ts-ignore
			if ((cfg as any).ring) {
				// @ts-ignore
				const r = (cfg as any).ring;
				const ring = new THREE.Mesh(
					new THREE.RingGeometry(r.inner, r.outer, 96),
					new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })
				);
				ring.position.set(cfg.distance, 0, 0);
				ring.rotation.x = Math.PI / 2 - r.tilt;
				ring.rotation.y = r.tilt * 0.6;
				pivot.add(ring);
				ringMeshes.push(ring);
			}
			// Orbit path (neon)
			const orbitPts: THREE.Vector3[] = [];
			for (let a = 0; a <= Math.PI * 2 + 0.0001; a += Math.PI / 64) {
				orbitPts.push(new THREE.Vector3(Math.cos(a) * cfg.distance, 0, Math.sin(a) * cfg.distance));
			}
			const orbitGeo = new THREE.BufferGeometry().setFromPoints(orbitPts);
			const orbitMat = new THREE.LineBasicMaterial({ color: idx % 2 === 0 ? 0x00ffa6 : 0x4ea3ff, transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending });
			const orbitLine = new THREE.Line(orbitGeo, orbitMat);
			orbitLine.position.copy(center);
			scene.add(orbitLine);
			orbitLines.push(orbitLine);
		});

		// Comets
		type Comet = { sprite: THREE.Sprite; velocity: THREE.Vector3; life: number; maxLife: number };
		const comets: Comet[] = [];
		let lastCometSpawn = performance.now();
		const spawnComet = () => {
			const mat = new THREE.SpriteMaterial({ map: glowTex, color: 0xffffff, transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending });
			const s = new THREE.Sprite(mat);
			s.scale.set(1.6, 0.5, 1);
			const side = Math.random() < 0.5 ? -1 : 1;
			s.position.set(-12 * side, Math.random() * 6 - 1, -12);
			scene.add(s);
			const vel = new THREE.Vector3(0.12 * side, -(0.02 + Math.random() * 0.04), 0.02 + Math.random() * 0.04);
			comets.push({ sprite: s, velocity: vel, life: 0, maxLife: 2800 + Math.random() * 2200 });
		};

		// Animation
		let t = 0;
		const animate = () => {
			t += 0.01;
			// Star drift
			const pPos = particles.geometry.attributes.position.array as Float32Array;
			for (let i = 0; i < particleCount; i++) {
				pPos[i * 3 + 2] += 0.06 + Math.random() * 0.02;
				if (pPos[i * 3 + 2] > 2) pPos[i * 3 + 2] = -40;
			}
			particles.geometry.attributes.position.needsUpdate = true;
			// Pulsing stars
			(pulseStars.material as THREE.PointsMaterial).size = 0.12 + Math.sin(t * 1.8) * 0.06;
			(pulseStars.material as THREE.PointsMaterial).opacity = 0.5 + Math.sin(t * 2.2) * 0.25;

			// Orbits and rotations
			for (let i = 0; i < planetConfigs.length; i++) {
				pivots[i].rotation.y += (planetConfigs as any)[i].orbit;
				planetMeshes[i].rotation.y += (planetConfigs as any)[i].rot;
			}
			ringMeshes.forEach((rm) => (rm.rotation.z += 0.0008));
			// Orbit lines shimmer
			orbitLines.forEach((ol, i) => {
				const m = ol.material as THREE.LineBasicMaterial;
				m.opacity = 0.25 + 0.15 * (0.5 + 0.5 * Math.sin(t * 1.2 + i));
			});
			// Nebula slow drift
			nebulaSprites.forEach((s, i) => {
				s.material.opacity = 0.14 + 0.08 * (0.5 + 0.5 * Math.sin(t * 0.6 + i));
				s.position.x += Math.sin(t * 0.1 + i) * 0.002;
				s.position.y += Math.cos(t * 0.08 + i) * 0.002;
			});

			// Comet spawning and update
			const now = performance.now();
			if (now - lastCometSpawn > 3500 + Math.random() * 2500 && comets.length < 3) {
				spawnComet();
				lastCometSpawn = now;
			}
			for (let i = comets.length - 1; i >= 0; i--) {
				const c = comets[i];
				c.life += 16;
				c.sprite.position.add(c.velocity);
				const lifeRatio = Math.min(1, c.life / c.maxLife);
				(c.sprite.material as THREE.SpriteMaterial).opacity = 0.0 + (lifeRatio < 0.2 ? lifeRatio * 3 : (1 - lifeRatio)) * 0.8;
				c.sprite.scale.set(1.6 + lifeRatio * 2.2, 0.5 + lifeRatio * 0.6, 1);
				if (c.life >= c.maxLife || c.sprite.position.z > 2 || Math.abs(c.sprite.position.x) > 14) {
					scene.remove(c.sprite);
					comets.splice(i, 1);
				}
			}

			renderer.render(scene, camera);
			rafRef.current = requestAnimationFrame(animate);
		};
		animate();

		const onResize = () => {
			camera.aspect = container.clientWidth / container.clientHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(container.clientWidth, container.clientHeight);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		};
		window.addEventListener('resize', onResize);

		return () => {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			window.removeEventListener('resize', onResize);
			renderer.dispose();
			container.removeChild(renderer.domElement);
		};
	}, []);

	return (
		<div ref={containerRef} className="absolute inset-0 pointer-events-none" />
	);
};

export default ThreeBackground;