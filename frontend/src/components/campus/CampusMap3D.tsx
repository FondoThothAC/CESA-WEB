'use client';

import React, { useState, useCallback, Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import Building3D from './Building3D';
import Ground from './Ground';
import WayfindingPath from './WayfindingPath';
import { buildings, Building } from '@/lib/campusData';
import * as THREE from 'three';

interface CampusMap3DProps {
  selectedBuilding: Building | null;
  highlightedBuilding: Building | null;
  onBuildingClick: (building: Building) => void;
  // Wayfinding: origen y destino para mostrar la ruta
  wayfindingOrigin: Building | null;
  wayfindingDestination: Building | null;
}

/**
 * CameraController — Anima la cámara suavemente hacia el edificio seleccionado.
 */
function CameraController({ selectedBuilding }: { selectedBuilding: Building | null }) {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 35, 40));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    if (selectedBuilding) {
      const bp = selectedBuilding.position;
      const bh = selectedBuilding.floors * 1.5;
      targetPos.current.set(bp[0] + 5, bh + 10, bp[2] + 12);
      targetLookAt.current.set(bp[0], bh / 2, bp[2]);
    } else {
      targetPos.current.set(0, 35, 40);
      targetLookAt.current.set(0, 0, 0);
    }
    camera.position.lerp(targetPos.current, 0.04);
    const currentLookAt = new THREE.Vector3();
    camera.getWorldDirection(currentLookAt);
    camera.lookAt(
      THREE.MathUtils.lerp(camera.position.x + currentLookAt.x * 10, targetLookAt.current.x, 0.04),
      THREE.MathUtils.lerp(camera.position.y + currentLookAt.y * 10, targetLookAt.current.y, 0.04),
      THREE.MathUtils.lerp(camera.position.z + currentLookAt.z * 10, targetLookAt.current.z, 0.04),
    );
  });

  return null;
}

/**
 * CampusScene — Escena 3D principal con edificios, suelo, iluminación y wayfinding.
 */
function CampusScene({
  selectedBuilding,
  highlightedBuilding,
  onBuildingClick,
  wayfindingOrigin,
  wayfindingDestination,
}: CampusMap3DProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 35, 40]} fov={45} />
      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        maxPolarAngle={Math.PI / 2.1}
        minDistance={8}
        maxDistance={100}
        target={[0, 0, 0]}
        enableDamping
        dampingFactor={0.05}
      />
      <CameraController selectedBuilding={selectedBuilding} />

      {/* Fondo del cielo nocturno universitario */}
      <color attach="background" args={['#1a2744']} />
      <fog attach="fog" args={['#1a2744', 60, 120]} />

      {/* Estrellas de fondo */}
      <Stars radius={80} depth={40} count={800} factor={3} saturation={0.2} fade />

      {/* Iluminación principal */}
      <ambientLight intensity={0.4} color="#b0c4de" />
      <directionalLight
        position={[25, 35, 15]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={150}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        color="#fff5e6"
      />
      <directionalLight position={[-15, 25, -10]} intensity={0.4} color="#e6f0ff" />
      <pointLight position={[0, 20, 0]} intensity={0.3} color="#ffffff" />
      <hemisphereLight args={['#87CEEB', '#2d5a27', 0.3]} />

      {/* Suelo con calles, estacionamientos, árboles y landmarks */}
      <Ground />

      {/* Ruta de wayfinding — aparece cuando hay origen y destino */}
      {wayfindingOrigin && wayfindingDestination && (
        <WayfindingPath
          origin={wayfindingOrigin}
          destination={wayfindingDestination}
        />
      )}

      {/* Edificios del campus */}
      {buildings.map((building) => (
        <Building3D
          key={building.id}
          building={building}
          isSelected={selectedBuilding?.id === building.id}
          isHighlighted={
            highlightedBuilding?.id === building.id ||
            wayfindingOrigin?.id === building.id ||
            wayfindingDestination?.id === building.id
          }
          onClick={onBuildingClick}
        />
      ))}
    </>
  );
}

/**
 * CampusMap3D — Componente principal del mapa 3D interactivo del campus UNISON.
 */
export default function CampusMap3D({
  selectedBuilding,
  highlightedBuilding,
  onBuildingClick,
  wayfindingOrigin,
  wayfindingDestination,
}: CampusMap3DProps) {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <CampusScene
            selectedBuilding={selectedBuilding}
            highlightedBuilding={highlightedBuilding}
            onBuildingClick={onBuildingClick}
            wayfindingOrigin={wayfindingOrigin}
            wayfindingDestination={wayfindingDestination}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
