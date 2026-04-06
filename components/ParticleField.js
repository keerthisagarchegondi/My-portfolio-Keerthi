/**
 * ParticleField.js — Light-mode 3D ambient visualization
 * Soft pastel floating data-node network.
 */
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const COUNT = 80;
const CUT   = 4.5;

function Network() {
  const ref = useRef();

  const pts = useMemo(() => {
    const arr = [];
    for (let i = 0; i < COUNT; i++)
      arr.push(new THREE.Vector3(
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 22,
        (Math.random() - 0.5) * 22,
      ));
    return arr;
  }, []);

  const nodePos = useMemo(() => {
    const a = new Float32Array(pts.length * 3);
    pts.forEach((p, i) => { a[i*3]=p.x; a[i*3+1]=p.y; a[i*3+2]=p.z; });
    return a;
  }, [pts]);

  const linePos = useMemo(() => {
    const v = [];
    for (let i = 0; i < pts.length; i++)
      for (let j = i+1; j < pts.length; j++)
        if (pts[i].distanceTo(pts[j]) < CUT) {
          v.push(pts[i].x, pts[i].y, pts[i].z);
          v.push(pts[j].x, pts[j].y, pts[j].z);
        }
    return new Float32Array(v);
  }, [pts]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime;
    ref.current.rotation.y = t * 0.03;
    ref.current.rotation.x = Math.sin(t * 0.02) * 0.08;
  });

  return (
    <group ref={ref}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePos, 3]} />
        </bufferGeometry>
        <pointsMaterial color="#a5b4fc" size={0.12} transparent opacity={0.6} sizeAttenuation depthWrite={false} />
      </points>
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePos, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color="#c7d2fe" transparent opacity={0.12} />
      </lineSegments>
    </group>
  );
}

export default function ParticleField() {
  return (
    <Canvas
      camera={{ position: [0, 0, 18], fov: 50 }}
      style={{ position: 'absolute', inset: 0 }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      aria-hidden="true"
    >
      <Network />
    </Canvas>
  );
}
