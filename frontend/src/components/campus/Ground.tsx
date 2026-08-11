'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  campusLandmarks,
  campusTrees,
  campusParking,
  Parking,
} from '@/lib/campusData';

/**
 * TreeModel — Árbol 3D simplificado (2 conos + tronco).
 */
function TreeModel({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1.2, 6]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.8, 1.8, 6]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <coneGeometry args={[0.5, 1.2, 6]} />
        <meshStandardMaterial color="#388E3C" roughness={0.8} />
      </mesh>
    </group>
  );
}

/**
 * LandmarkMarker — Marca de estadio/plaza/gimnasio en el suelo.
 */
function LandmarkMarker({ position, type, size }: { name: string; position: [number, number, number]; type: string; size: number }) {
  const color = type === 'stadium' ? '#8B4513' : type === 'plaza' ? '#D2B48C' : '#4A4A4A';
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[size, 24]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {type === 'stadium' && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[size - 0.5, size, 24]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>
      )}
    </group>
  );
}

/**
 * ParkingLot — Estacionamiento simplificado (solo plano + unas líneas).
 */
function ParkingLot({ parking }: { parking: Parking }) {
  return (
    <group position={[parking.position[0], 0, parking.position[2]]}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[parking.size[0], parking.size[1]]} />
        <meshStandardMaterial color="#6B6B6B" roughness={0.95} />
      </mesh>
    </group>
  );
}

/**
 * Ground — Suelo del campus con textura del mapa, estacionamientos,
 * landmarks y árboles. Optimizado para rendimiento.
 */
export default function Ground() {
  const mapTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/campus-map.jpg');
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  return (
    <group>
      {/* Suelo base verde oscuro */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[120, 80]} />
        <meshStandardMaterial color="#1b3d17" roughness={0.9} />
      </mesh>

      {/* Textura del mapa del campus (90×55 unidades) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[90, 55]} />
        <meshStandardMaterial
          map={mapTexture}
          transparent={false}
          roughness={0.6}
        />
      </mesh>

      {/* Estacionamientos */}
      {campusParking.map((parking, i) => (
        <ParkingLot key={`park-${i}`} parking={parking} />
      ))}

      {/* Landmarks */}
      {campusLandmarks.map((landmark, i) => (
        <LandmarkMarker key={`lm-${i}`} {...landmark} />
      ))}

      {/* Árboles */}
      {campusTrees.map((tree, i) => (
        <TreeModel key={`tree-${i}`} position={tree.position} scale={tree.scale} />
      ))}
    </group>
  );
}
