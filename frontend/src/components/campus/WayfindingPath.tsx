'use client';

import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  Building,
  getNearestWaypoint,
  findWaypointPath,
} from '@/lib/campusData';

interface WayfindingPathProps {
  origin: Building;
  destination: Building;
}

/**
 * WayfindingPath — Componente que renderiza una ruta peatonal
 * entre dos edificios usando waypoints del campus.
 * Dibuja una línea punteada/glowing animada sobre el suelo del mapa 3D.
 */
export default function WayfindingPath({ origin, destination }: WayfindingPathProps) {
  // Referencia para animación de pulso
  const glowRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);

  // Calcular la ruta usando waypoints
  const pathPoints = useMemo(() => {
    const ox = origin.position[0];
    const oz = origin.position[2];
    const dx = destination.position[0];
    const dz = destination.position[2];

    // Encontrar waypoints más cercanos al origen y destino
    const startNode = getNearestWaypoint(ox, oz);
    const endNode = getNearestWaypoint(dx, dz);

    // Obtener ruta BFS entre nodos
    const waypointPath = findWaypointPath(startNode.id, endNode.id);

    // Construir array de puntos 3D completo:
    // Inicio (edificio origen) → waypoints → Final (edificio destino)
    const points: [number, number][] = [
      [ox, oz],
      ...waypointPath,
      [dx, dz],
    ];

    return points;
  }, [origin, destination]);

  // Generar segmentos de la línea punteada
  const segments = useMemo(() => {
    const segs: { start: [number, number]; end: [number, number]; index: number }[] = [];
    for (let i = 0; i < pathPoints.length - 1; i++) {
      const a = pathPoints[i];
      const b = pathPoints[i + 1];
      const dx = b[0] - a[0];
      const dz = b[1] - a[1];
      const len = Math.sqrt(dx * dx + dz * dz);
      const dotSpacing = 0.8; // espacio entre puntos
      const dotCount = Math.max(1, Math.floor(len / dotSpacing));

      for (let d = 0; d <= dotCount; d++) {
        const t = d / Math.max(dotCount, 1);
        const px = a[0] + dx * t;
        const pz = a[1] + dz * t;
        const nx = a[0] + dx * Math.min(t + 0.4 / len, 1);
        const nz = a[1] + dz * Math.min(t + 0.4 / len, 1);
        segs.push({ start: [px, pz], end: [nx, nz], index: i * dotCount + d });
      }
    }
    return segs;
  }, [pathPoints]);

  // Animación de brillo pulsante
  useFrame((_, delta) => {
    timeRef.current += delta;
    const pulse = Math.sin(timeRef.current * 3) * 0.5 + 0.5; // 0 a 1
    glowRef.current.forEach((mesh, i) => {
      if (!mesh) return;
      const material = mesh.material as THREE.MeshStandardMaterial;
      // Efecto de onda viajera (desplazada por índice)
      const wave = Math.sin(timeRef.current * 3 - i * 0.3) * 0.5 + 0.5;
      material.emissiveIntensity = 0.4 + wave * 1.2;
      material.opacity = 0.5 + wave * 0.5;
    });
  });

  if (pathPoints.length < 2) return null;

  return (
    <group>
      {/* Línea base de ruta (semi-transparente, más ancha) */}
      {pathPoints.length >= 2 && pathPoints.map((pt, i) => {
        if (i >= pathPoints.length - 1) return null;
        const a = pt;
        const b = pathPoints[i + 1];
        const dx = b[0] - a[0];
        const dz = b[1] - a[1];
        const len = Math.sqrt(dx * dx + dz * dz);
        if (len < 0.01) return null;
        const midX = (a[0] + b[0]) / 2;
        const midZ = (a[1] + b[1]) / 2;
        const angle = Math.atan2(dx, dz);
        return (
          <mesh
            key={`base-seg-${i}`}
            position={[midX, 0.06, midZ]}
            rotation={[0, -angle, 0]}
          >
            <planeGeometry args={[0.4, len]} />
            <meshStandardMaterial
              color="#00d4ff"
              emissive="#00d4ff"
              emissiveIntensity={0.3}
              transparent
              opacity={0.25}
              depthWrite={false}
            />
          </mesh>
        );
      })}

      {/* Puntos pulsantes de la ruta */}
      {segments.map((seg, i) => {
        const px = seg.start[0];
        const pz = seg.start[1];
        // Saltar algunos puntos para efecto punteado
        if (i % 2 !== 0) return null;
        return (
          <mesh
            key={`dot-${i}`}
            position={[px, 0.1, pz]}
            rotation={[-Math.PI / 2, 0, 0]}
            ref={(el) => {
              if (el) glowRef.current[i] = el;
            }}
          >
            <circleGeometry args={[0.18, 12]} />
            <meshStandardMaterial
              color="#00d4ff"
              emissive="#00d4ff"
              emissiveIntensity={1.0}
              transparent
              opacity={0.85}
              depthWrite={false}
            />
          </mesh>
        );
      })}

      {/* Marcador de origen — círculo verde */}
      <group position={[origin.position[0], 0, origin.position[2]]}>
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.4, 0.6, 24]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={1.5}
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.35, 24]} />
          <meshStandardMaterial
            color="#22c55e"
            emissive="#22c55e"
            emissiveIntensity={0.8}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Marcador de destino — círculo dorado pulsante */}
      <group position={[destination.position[0], 0, destination.position[2]]}>
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.7, 24]} />
          <meshStandardMaterial
            color="#d4a343"
            emissive="#d4a343"
            emissiveIntensity={2.0}
            transparent
            opacity={0.9}
            depthWrite={false}
          />
        </mesh>
        {/* Estrella de destino */}
        <mesh position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.4, 5]} />
          <meshStandardMaterial
            color="#d4a343"
            emissive="#d4a343"
            emissiveIntensity={1.5}
            transparent
            opacity={0.6}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Halo de luz ambiental en origen y destino */}
      <pointLight
        position={[origin.position[0], 1, origin.position[2]]}
        intensity={0.8}
        color="#22c55e"
        distance={4}
      />
      <pointLight
        position={[destination.position[0], 1, destination.position[2]]}
        intensity={1.0}
        color="#d4a343"
        distance={5}
      />
    </group>
  );
}
