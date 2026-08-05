'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  campusStreets,
  campusLandmarks,
  campusTrees,
  campusParking,
  campusCrosswalks,
  Parking,
  Tree,
} from '@/lib/campusData';
import type { Crosswalk as CrosswalkType } from '@/lib/campusData';

function TreeModel({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1.2, 6]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.8, 1.8, 8]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.8} />
      </mesh>
      <mesh position={[0, 2.2, 0]} castShadow>
        <coneGeometry args={[0.5, 1.2, 8]} />
        <meshStandardMaterial color="#388E3C" roughness={0.8} />
      </mesh>
    </group>
  );
}

function LandmarkMarker({ name, position, type, size }: { name: string; position: [number, number, number]; type: string; size: number }) {
  const color = type === 'stadium' ? '#8B4513' : type === 'plaza' ? '#D2B48C' : type === 'housing' ? '#696969' : type === 'gym' ? '#4A4A4A' : '#708090';
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
        <circleGeometry args={[size, 32]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      {type === 'stadium' && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
            <ringGeometry args={[size - 0.5, size, 32]} />
            <meshStandardMaterial color="#A0522D" />
          </mesh>
        </>
      )}
    </group>
  );
}

function ParkingLot({ parking }: { parking: Parking }) {
  const height = parking.type === 'multilevel' ? (parking.floors || 2) * 1.5 : 0.05;
  const isMultilevel = parking.type === 'multilevel';

  return (
    <group position={[parking.position[0], 0, parking.position[2]]}>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[parking.size[0], parking.size[1]]} />
        <meshStandardMaterial color="#6B6B6B" roughness={0.95} />
      </mesh>

      {Array.from({ length: Math.floor(parking.size[0] / 1.5) }).map((_, i) =>
        Array.from({ length: Math.floor(parking.size[1] / 2.5) }).map((_, j) => (
          <mesh
            key={`line-${i}-${j}`}
            position={[
              -parking.size[0] / 2 + 1 + i * 1.5,
              0.04,
              -parking.size[1] / 2 + 1 + j * 2.5,
            ]}
            rotation={[-Math.PI / 2, 0, 0]}
          >
            <planeGeometry args={[0.08, 1.2]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.2} />
          </mesh>
        ))
      )}

      {isMultilevel && (
        <>
          {Array.from({ length: parking.floors || 2 }).map((_, i) => (
            <mesh
              key={`level-${i}`}
              position={[0, i * 1.5 + 0.75, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[parking.size[0], 1.5, parking.size[1]]} />
              <meshStandardMaterial color="#7C7C7C" roughness={0.8} />
            </mesh>
          ))}
          <mesh position={[0, height + 0.1, parking.size[1] / 2 + 0.2]} rotation={[-Math.PI / 6, 0, 0]}>
            <planeGeometry args={[parking.size[0], 0.8]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </>
      )}

      {parking.name && (
        <mesh position={[0, isMultilevel ? height + 1 : 0.5, parking.size[1] / 2 + 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5, 0.5]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
        </mesh>
      )}

      <mesh position={[parking.size[0] / 2, isMultilevel ? height / 2 + 0.5 : 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.05, parking.size[1]]} />
        <meshStandardMaterial color="#FFFFFF" />
      </mesh>
    </group>
  );
}

function Crosswalk({ crosswalk }: { crosswalk: CrosswalkType }) {
  return (
    <group position={[crosswalk.position[0], 0, crosswalk.position[2]]} rotation={[0, crosswalk.rotation || 0, 0]}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (-crosswalk.size[0] / 2) + (i * crosswalk.size[0] / 5) + crosswalk.size[0] / 10,
            0.025,
            0,
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[crosswalk.size[0] / 7, crosswalk.size[1]]} />
          <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function StreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
        <meshStandardMaterial color="#333" metalness={0.8} />
      </mesh>
      <mesh position={[0, 3.05, 0]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.4]} />
        <meshStandardMaterial color="#222" metalness={0.8} />
      </mesh>
      <pointLight position={[0, 3.05, 0]} intensity={0.3} color="#FFEB99" distance={4} />
    </group>
  );
}

export default function Ground() {
  const mapTexture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/campus-map.jpg');
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 1);
    return tex;
  }, []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[82, 49.2]} />
        <meshStandardMaterial color="#1b3d17" roughness={0.9} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[80, 48]} />
        <meshStandardMaterial
          map={mapTexture}
          transparent={false}
          roughness={0.6}
        />
      </mesh>

      {campusStreets.map((street, i) => (
        <group key={`street-${i}`}>
          {street.orientation === 'horizontal' ? (
            <group>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[street.x, 0.01, street.z]} receiveShadow>
                <planeGeometry args={[street.width, 2.4]} />
                <meshStandardMaterial color={street.color} roughness={0.7} />
              </mesh>

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[street.x, 0.015, street.z - 1.1]} receiveShadow>
                <planeGeometry args={[street.width, 0.08]} />
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[street.x, 0.015, street.z + 1.1]} receiveShadow>
                <planeGeometry args={[street.width, 0.08]} />
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
              </mesh>

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[street.x, 0.014, street.z]} receiveShadow>
                <planeGeometry args={[street.width, 0.12]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[street.x, 0.012, street.z - 0.5]}>
                <planeGeometry args={[street.width, 0.06]} />
                <meshStandardMaterial color="#888" />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[street.x, 0.012, street.z + 0.5]}>
                <planeGeometry args={[street.width, 0.06]} />
                <meshStandardMaterial color="#888" />
              </mesh>

              <mesh position={[street.x - street.width / 2 + 0.5, 0.03, street.z - 1.3]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1, 0.4]} />
                <meshStandardMaterial color="#C0C0C0" roughness={0.9} />
              </mesh>
              <mesh position={[street.x - street.width / 2 + 0.5, 0.03, street.z + 1.3]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1, 0.4]} />
                <meshStandardMaterial color="#C0C0C0" roughness={0.9} />
              </mesh>
              <mesh position={[street.x + street.width / 2 - 0.5, 0.03, street.z - 1.3]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1, 0.4]} />
                <meshStandardMaterial color="#C0C0C0" roughness={0.9} />
              </mesh>
              <mesh position={[street.x + street.width / 2 - 0.5, 0.03, street.z + 1.3]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[1, 0.4]} />
                <meshStandardMaterial color="#C0C0C0" roughness={0.9} />
              </mesh>
            </group>
          ) : (
            <group>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[street.x, 0.01, street.z]} receiveShadow>
                <planeGeometry args={[2.4, street.width]} />
                <meshStandardMaterial color={street.color} roughness={0.7} />
              </mesh>

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[street.x - 1.1, 0.015, street.z]} receiveShadow>
                <planeGeometry args={[0.08, street.width]} />
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[street.x + 1.1, 0.015, street.z]} receiveShadow>
                <planeGeometry args={[0.08, street.width]} />
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
              </mesh>

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[street.x, 0.014, street.z]} receiveShadow>
                <planeGeometry args={[0.12, street.width]} />
                <meshStandardMaterial color="#FFFFFF" />
              </mesh>

              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[street.x - 0.5, 0.012, street.z]}>
                <planeGeometry args={[0.06, street.width]} />
                <meshStandardMaterial color="#888" />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[street.x + 0.5, 0.012, street.z]}>
                <planeGeometry args={[0.06, street.width]} />
                <meshStandardMaterial color="#888" />
              </mesh>

              <mesh position={[street.x - 1.3, 0.03, street.z - street.width / 2 + 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.4, 1]} />
                <meshStandardMaterial color="#C0C0C0" roughness={0.9} />
              </mesh>
              <mesh position={[street.x + 1.3, 0.03, street.z - street.width / 2 + 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.4, 1]} />
                <meshStandardMaterial color="#C0C0C0" roughness={0.9} />
              </mesh>
              <mesh position={[street.x - 1.3, 0.03, street.z + street.width / 2 - 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.4, 1]} />
                <meshStandardMaterial color="#C0C0C0" roughness={0.9} />
              </mesh>
              <mesh position={[street.x + 1.3, 0.03, street.z + street.width / 2 - 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.4, 1]} />
                <meshStandardMaterial color="#C0C0C0" roughness={0.9} />
              </mesh>
            </group>
          )}
        </group>
      ))}

      {campusCrosswalks.map((crosswalk, i) => (
        <Crosswalk key={`cw-${i}`} crosswalk={crosswalk} />
      ))}

      {campusParking.map((parking, i) => (
        <ParkingLot key={`park-${i}`} parking={parking} />
      ))}

      {campusLandmarks.map((landmark, i) => (
        <LandmarkMarker key={`lm-${i}`} {...landmark} />
      ))}

      {campusTrees.map((tree, i) => (
        <TreeModel key={`tree-${i}`} position={tree.position} scale={tree.scale} />
      ))}

      {campusStreets.flatMap((street, i) => {
        if (street.orientation === 'horizontal') {
          return [
            [street.x - street.width / 2 + 2, 0, street.z - 1.3],
            [street.x + street.width / 2 - 2, 0, street.z - 1.3],
            [street.x - street.width / 2 + 2, 0, street.z + 1.3],
            [street.x + street.width / 2 - 2, 0, street.z + 1.3],
          ].map((pos, j) => <StreetLamp key={`lamp-h-${i}-${j}`} position={pos as [number, number, number]} />);
        } else {
          return [
            [street.x - 1.3, 0, street.z - street.width / 2 + 2],
            [street.x + 1.3, 0, street.z - street.width / 2 + 2],
            [street.x - 1.3, 0, street.z + street.width / 2 - 2],
            [street.x + 1.3, 0, street.z + street.width / 2 - 2],
          ].map((pos, j) => <StreetLamp key={`lamp-v-${i}-${j}`} position={pos as [number, number, number]} />);
        }
      })}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <ringGeometry args={[38, 40, 64]} />
        <meshStandardMaterial color="#1a3d15" roughness={0.9} />
      </mesh>

      {[
        [-35, -20], [-35, -10], [-35, 0], [-35, 10],
        [35, -20], [35, -10], [35, 0], [35, 10],
        [-25, -22], [-15, -22], [-5, -22], [5, -22], [15, -22], [25, -22],
        [-25, 22], [-15, 22], [-5, 22], [5, 22], [15, 22], [25, 22],
      ].map(([x, z], i) => (
        <mesh key={`grass-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.04, z]} receiveShadow>
          <circleGeometry args={[2, 16]} />
          <meshStandardMaterial color="#1B5E20" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}