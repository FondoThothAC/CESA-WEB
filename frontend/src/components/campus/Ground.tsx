'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import {
  campusLandmarks,
  campusTrees,
  campusParking,
  Parking,
  Tree,
} from '@/lib/campusData';

// Streets as polylines (real diagonal paths from the actual map image)
const STREET_SEGMENTS: {
  name: string;
  color: string;
  lanes: number;
  points: [number, number][];
}[] = [
  {
    name: 'Blvd. Navarrete',
    color: '#555',
    lanes: 4,
    points: [
      [-45, 30],
      [-30, 30],
      [-10, 30],
      [10, 30],
      [30, 30],
      [45, 30],
    ],
  },
  {
    name: 'Blvd. Luis Encinas',
    color: '#555',
    lanes: 4,
    points: [
      [-45, 10],
      [-30, 10],
      [-10, 10],
      [10, 10],
      [30, 10],
      [45, 10],
    ],
  },
  {
    name: 'Av. Luis Donaldo Colosio',
    color: '#444',
    lanes: 6,
    points: [
      [-45, -10],
      [-30, -10],
      [-10, -10],
      [10, -10],
      [30, -10],
      [45, -10],
    ],
  },
  {
    name: 'Calle de la Reforma',
    color: '#555',
    lanes: 3,
    points: [
      [0.74, 30],
      [0.74, 20],
      [0.74, 10],
      [0.74, 0],
      [0.74, -10],
      [0.74, -15],
    ],
  },
  {
    name: 'Calle Francisco Q. Salazar',
    color: '#555',
    lanes: 3,
    points: [
      [-44.6, 30],
      [-44.6, 20],
      [-44.6, 0],
      [-44.6, -15],
    ],
  },
  {
    name: 'Calle Rosales',
    color: '#555',
    lanes: 3,
    points: [
      [45.2, 30],
      [45.2, 20],
      [45.2, 0],
      [45.2, -15],
    ],
  },
];

// Crosswalks at key intersections
const CROSSWALKS = [
  { position: [0.74, 0, 10] as [number, number, number], rotation: 0, size: [5, 1.2] as [number, number] },
  { position: [0.74, 0, -10] as [number, number, number], rotation: 0, size: [5, 1.2] as [number, number] },
  { position: [0.74, 0, 30] as [number, number, number], rotation: 0, size: [5, 1.2] as [number, number] },
  { position: [45.2, 0, 10] as [number, number, number], rotation: 0, size: [5, 1.2] as [number, number] },
  { position: [-44.6, 0, 10] as [number, number, number], rotation: 0, size: [5, 1.2] as [number, number] },
  { position: [-44.6, 0, -10] as [number, number, number], rotation: 0, size: [5, 1.2] as [number, number] },
];

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
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
          <ringGeometry args={[size - 0.5, size, 32]} />
          <meshStandardMaterial color="#A0522D" />
        </mesh>
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

function Crosswalk({ position, rotation, size }: { position: [number, number, number]; rotation?: number; size: [number, number] }) {
  return (
    <group position={position} rotation={[0, rotation || 0, 0]}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (-size[0] / 2) + (i * size[0] / 5) + size[0] / 10,
            0.025,
            0,
          ]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[size[0] / 7, size[1]]} />
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

/**
 * Renders a street as a series of polyline segments with lane markings.
 */
function StreetPolyline({ segment }: { segment: typeof STREET_SEGMENTS[number] }) {
  const laneWidth = 1.2;
  const totalWidth = segment.lanes * laneWidth;

  return (
    <group>
      {segment.points.map((pt, i) => {
        if (i >= segment.points.length - 1) return null;
        const a = segment.points[i];
        const b = segment.points[i + 1];
        const dx = b[0] - a[0];
        const dz = b[1] - a[1];
        const len = Math.sqrt(dx * dx + dz * dz);
        const midX = (a[0] + b[0]) / 2;
        const midZ = (a[1] + b[1]) / 2;
        const angle = Math.atan2(dx, dz);

        return (
          <group key={`seg-${segment.name}-${i}`}>
            {/* Asphalt surface */}
            <mesh
              rotation={[-Math.PI / 2, 0, 0]}
              position={[midX, 0.01, midZ]}
              receiveShadow
            >
              <planeGeometry args={[totalWidth, len]} />
              <meshStandardMaterial color={segment.color} roughness={0.7} />
              {/* Rotate to align with direction */}
            </mesh>
            <group position={[midX, 0, midZ]} rotation={[0, -angle, 0]}>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
                <planeGeometry args={[totalWidth, len]} />
                <meshStandardMaterial color={segment.color} roughness={0.7} />
              </mesh>

              {/* Center dashed line */}
              {Array.from({ length: Math.floor(len / 2) }).map((_, d) => (
                <mesh
                  key={`center-${d}`}
                  rotation={[-Math.PI / 2, 0, 0]}
                  position={[0, 0.014, -len / 2 + d * 2 + 1]}
                >
                  <planeGeometry args={[0.1, 1.2]} />
                  <meshStandardMaterial color="#FFFFFF" />
                </mesh>
              ))}

              {/* Yellow edge lines */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-totalWidth / 2 + 0.15, 0.015, 0]}>
                <planeGeometry args={[0.08, len]} />
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.2} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[totalWidth / 2 - 0.15, 0.015, 0]}>
                <planeGeometry args={[0.08, len]} />
                <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.2} />
              </mesh>

              {/* Sidewalks */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-totalWidth / 2 - 0.5, 0.02, 0]}>
                <planeGeometry args={[1.0, len]} />
                <meshStandardMaterial color="#C0C0C0" roughness={0.9} />
              </mesh>
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[totalWidth / 2 + 0.5, 0.02, 0]}>
                <planeGeometry args={[1.0, len]} />
                <meshStandardMaterial color="#C0C0C0" roughness={0.9} />
              </mesh>
            </group>
          </group>
        );
      })}
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
      {/* Ground base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[90, 55]} />
        <meshStandardMaterial color="#1b3d17" roughness={0.9} />
      </mesh>

      {/* Campus map texture overlay */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]} receiveShadow>
        <planeGeometry args={[90, 55]} />
        <meshStandardMaterial
          map={mapTexture}
          transparent={false}
          roughness={0.6}
        />
      </mesh>

      {/* Streets as polylines */}
      {STREET_SEGMENTS.map((seg, i) => (
        <StreetPolyline key={`street-${i}`} segment={seg} />
      ))}

      {/* Crosswalks */}
      {CROSSWALKS.map((cw, i) => (
        <Crosswalk key={`cw-${i}`} {...cw} />
      ))}

      {/* Parking lots */}
      {campusParking.map((parking, i) => (
        <ParkingLot key={`park-${i}`} parking={parking} />
      ))}

      {/* Landmarks */}
      {campusLandmarks.map((landmark, i) => (
        <LandmarkMarker key={`lm-${i}`} {...landmark} />
      ))}

      {/* Trees */}
      {campusTrees.map((tree, i) => (
        <TreeModel key={`tree-${i}`} position={tree.position} scale={tree.scale} />
      ))}

      {/* Street lamps along streets */}
      {STREET_SEGMENTS.flatMap((seg, i) => {
        const lampPositions: [number, number, number][] = [];
        const laneWidth = 1.2;
        const totalWidth = seg.lanes * laneWidth;
        for (let j = 0; j < seg.points.length - 1; j++) {
          const a = seg.points[j];
          const b = seg.points[j + 1];
          const mx = (a[0] + b[0]) / 2;
          const mz = (a[1] + b[1]) / 2;
          const dx = b[0] - a[0];
          const dz = b[1] - a[1];
          const angle = Math.atan2(dx, dz);
          const perpX = Math.cos(angle + Math.PI / 2);
          const perpZ = Math.sin(angle + Math.PI / 2);
          const offset = totalWidth / 2 + 1.3;
          lampPositions.push(
            [mx + perpX * offset, 0, mz + perpZ * offset],
            [mx - perpX * offset, 0, mz - perpZ * offset],
          );
        }
        return lampPositions.map((pos, j) => (
          <StreetLamp key={`lamp-${i}-${j}`} position={pos} />
        ));
      })}

      {/* Green perimeter border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]} receiveShadow>
        <ringGeometry args={[42, 44, 64]} />
        <meshStandardMaterial color="#1a3d15" roughness={0.9} />
      </mesh>

      {/* Grass patches */}
      {[
        [-40, -20], [-40, -10], [-40, 0], [-40, 10], [-40, 20],
        [40, -20], [40, -10], [40, 0], [40, 10], [40, 20],
        [-30, -24], [-20, -24], [-10, -24], [0, -24], [10, -24], [20, -24], [30, -24],
        [-30, 24], [-20, 24], [-10, 24], [0, 24], [10, 24], [20, 24], [30, 24],
      ].map(([x, z], i) => (
        <mesh key={`grass-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, -0.04, z]} receiveShadow>
          <circleGeometry args={[2, 16]} />
          <meshStandardMaterial color="#1B5E20" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}
