'use client';

import React, { useState, useRef, useMemo } from 'react';
import { Html } from '@react-three/drei';
import { Building, getFloorColor, BuildingShape } from '@/lib/campusData';
import * as THREE from 'three';

interface Building3DProps {
  building: Building;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (building: Building) => void;
}

function WindowRow({ width, height, floorY, floorHeight }: { width: number; height: number; floorY: number; floorHeight: number }) {
  const count = Math.max(2, Math.floor(width / 1.4));
  const spacing = width / (count + 1);
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          position={[-width / 2 + spacing * (i + 1), floorY, height / 2 + 0.02]}
        >
          <planeGeometry args={[0.7, 0.9]} />
          <meshStandardMaterial
            color="#87CEEB"
            emissive="#4FC3F7"
            emissiveIntensity={0.15}
            transparent
            opacity={0.75}
            roughness={0.1}
            metalness={0.3}
          />
        </mesh>
      ))}
    </>
  );
}

function LShapeBuilding({ building, totalHeight, floorHeight, baseColor }: {
  building: Building;
  totalHeight: number;
  floorHeight: number;
  baseColor: string;
}) {
  const w = building.size[0];
  const d = building.size[1];
  const mainW = w * 0.65;
  const mainD = d;
  const wingW = w * 0.35;
  const wingD = d * 0.5;
  const darkerColor = new THREE.Color(baseColor).multiplyScalar(0.7).getHexString();

  return (
    <group>
      <mesh position={[-w / 2 + mainW / 2, totalHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[mainW, totalHeight, mainD]} />
        <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.2} transparent opacity={0.85} />
      </mesh>
      <mesh position={[w / 2 - wingW / 2, totalHeight * 0.4, d / 2 - wingD / 2]} castShadow receiveShadow>
        <boxGeometry args={[wingW, totalHeight * 0.8, wingD]} />
        <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.2} transparent opacity={0.85} />
      </mesh>
      {Array.from({ length: building.floors }).map((_, i) => (
        <mesh key={`sep-${i}`} position={[0, i * floorHeight, 0]} receiveShadow>
          <boxGeometry args={[w + 0.06, 0.06, d + 0.06]} />
          <meshStandardMaterial color={`#${darkerColor}`} />
        </mesh>
      ))}
      {building.floors >= 2 && (
        <BuildingStairs building={building} totalHeight={totalHeight} floorHeight={floorHeight} />
      )}
    </group>
  );
}

function UShapeBuilding({ building, totalHeight, floorHeight, baseColor }: {
  building: Building;
  totalHeight: number;
  floorHeight: number;
  baseColor: string;
}) {
  const w = building.size[0];
  const d = building.size[1];
  const armW = w * 0.25;
  const armD = d * 0.6;
  const mainD = d - armD;
  const darkerColor = new THREE.Color(baseColor).multiplyScalar(0.7).getHexString();

  return (
    <group>
      <mesh position={[0, totalHeight / 2, -d / 2 + mainD / 2]} castShadow receiveShadow>
        <boxGeometry args={[w, totalHeight, mainD]} />
        <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.2} transparent opacity={0.85} />
      </mesh>
      <mesh position={[-w / 2 + armW / 2, totalHeight / 2, d / 2 - armD / 2]} castShadow receiveShadow>
        <boxGeometry args={[armW, totalHeight, armD]} />
        <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.2} transparent opacity={0.85} />
      </mesh>
      <mesh position={[w / 2 - armW / 2, totalHeight / 2, d / 2 - armD / 2]} castShadow receiveShadow>
        <boxGeometry args={[armW, totalHeight, armD]} />
        <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.2} transparent opacity={0.85} />
      </mesh>
      {Array.from({ length: building.floors }).map((_, i) => (
        <mesh key={`sep-${i}`} position={[0, i * floorHeight, 0]} receiveShadow>
          <boxGeometry args={[w + 0.06, 0.06, d + 0.06]} />
          <meshStandardMaterial color={`#${darkerColor}`} />
        </mesh>
      ))}
      {building.floors >= 2 && (
        <BuildingStairs building={building} totalHeight={totalHeight} floorHeight={floorHeight} />
      )}
    </group>
  );
}

function TShapeBuilding({ building, totalHeight, floorHeight, baseColor }: {
  building: Building;
  totalHeight: number;
  floorHeight: number;
  baseColor: string;
}) {
  const w = building.size[0];
  const d = building.size[1];
  const crossW = w * 0.8;
  const crossD = d * 0.3;
  const stemW = w * 0.4;
  const stemD = d * 0.7;
  const darkerColor = new THREE.Color(baseColor).multiplyScalar(0.7).getHexString();

  return (
    <group>
      <mesh position={[0, totalHeight / 2, -d / 2 + crossD / 2]} castShadow receiveShadow>
        <boxGeometry args={[crossW, totalHeight, crossD]} />
        <meshStandardMaterial color={baseColor} roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[0, totalHeight / 2, d / 2 - stemD / 2]} castShadow receiveShadow>
        <boxGeometry args={[stemW, totalHeight, stemD]} />
        <meshStandardMaterial color={baseColor} roughness={0.5} metalness={0.15} />
      </mesh>
      {Array.from({ length: building.floors }).map((_, i) => (
        <mesh key={`sep-${i}`} position={[0, i * floorHeight, 0]} receiveShadow>
          <boxGeometry args={[w + 0.06, 0.06, d + 0.06]} />
          <meshStandardMaterial color={`#${darkerColor}`} />
        </mesh>
      ))}
      {building.floors >= 2 && (
        <BuildingStairs building={building} totalHeight={totalHeight} floorHeight={floorHeight} />
      )}
    </group>
  );
}

function ComplexShapeBuilding({ building, totalHeight, floorHeight, baseColor }: {
  building: Building;
  totalHeight: number;
  floorHeight: number;
  baseColor: string;
}) {
  const w = building.size[0];
  const d = building.size[1];
  const darkerColor = new THREE.Color(baseColor).multiplyScalar(0.7).getHexString();

  return (
    <group>
      <mesh position={[0, totalHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.6, totalHeight, d * 0.7]} />
        <meshStandardMaterial color={baseColor} roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[w * 0.15, totalHeight * 0.35, d * 0.2]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.5, totalHeight * 0.7, d * 0.4]} />
        <meshStandardMaterial color={baseColor} roughness={0.5} metalness={0.15} />
      </mesh>
      <mesh position={[-w * 0.2, totalHeight * 0.25, -d * 0.15]} castShadow receiveShadow>
        <boxGeometry args={[w * 0.3, totalHeight * 0.5, d * 0.3]} />
        <meshStandardMaterial color={baseColor} roughness={0.5} metalness={0.15} />
      </mesh>
      {Array.from({ length: building.floors }).map((_, i) => (
        <mesh key={`sep-${i}`} position={[0, i * floorHeight, 0]} receiveShadow>
          <boxGeometry args={[w + 0.06, 0.06, d + 0.06]} />
          <meshStandardMaterial color={`#${darkerColor}`} />
        </mesh>
      ))}
      {building.floors >= 2 && (
        <BuildingStairs building={building} totalHeight={totalHeight} floorHeight={floorHeight} />
      )}
    </group>
  );
}

function RectBuilding({ building, totalHeight, floorHeight, baseColor }: {
  building: Building;
  totalHeight: number;
  floorHeight: number;
  baseColor: string;
}) {
  const darkerColor = new THREE.Color(baseColor).multiplyScalar(0.7).getHexString();
  return (
    <group>
      <mesh position={[0, totalHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[building.size[0], totalHeight, building.size[1]]} />
        <meshStandardMaterial color={baseColor} roughness={0.3} metalness={0.2} transparent opacity={0.85} />
      </mesh>
      {Array.from({ length: building.floors }).map((_, i) => (
        <mesh key={`sep-${i}`} position={[0, i * floorHeight, 0]} receiveShadow>
          <boxGeometry args={[building.size[0] + 0.06, 0.06, building.size[1] + 0.06]} />
          <meshStandardMaterial color={`#${darkerColor}`} />
        </mesh>
      ))}
      {building.floors >= 2 && (
        <BuildingStairs building={building} totalHeight={totalHeight} floorHeight={floorHeight} />
      )}
    </group>
  );
}

function BuildingStairs({ building, totalHeight, floorHeight }: {
  building: Building;
  totalHeight: number;
  floorHeight: number;
}) {
  const stairWidth = 1.2;
  const stairX = -building.size[0] / 2 - 0.3;
  return (
    <group position={[stairX, 0, -building.size[1] / 2 + stairWidth / 2 + 0.5]}>
      {Array.from({ length: building.floors }).map((_, i) => (
        <mesh key={`step-${i}`} position={[0, i * floorHeight + 0.2, 0]} castShadow>
          <boxGeometry args={[0.6, 0.3, stairWidth]} />
          <meshStandardMaterial color="#888" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

function BuildingRoof({ building, totalHeight }: { building: Building; totalHeight: number }) {
  return (
    <mesh position={[0, totalHeight + 0.05, 0]} castShadow>
      <boxGeometry args={[building.size[0] + 0.2, 0.1, building.size[1] + 0.2]} />
      <meshStandardMaterial color="#666" roughness={0.8} />
    </mesh>
  );
}

export default function Building3D({ building, isSelected, isHighlighted, onClick }: Building3DProps) {
  const [hovered, setHovered] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const floorHeight = 1.6;
  const totalHeight = building.floors * floorHeight;
  const baseColor = building.color || getFloorColor(building.floors);

  const glowColor = useMemo(() => {
    return new THREE.Color(baseColor).multiplyScalar(1.3);
  }, [baseColor]);

  const handleClick = (e: any) => {
    e.stopPropagation();
    onClick(building);
  };

  const renderShape = () => {
    const props = { building, totalHeight, floorHeight, baseColor };
    switch (building.shape) {
      case 'L': return <LShapeBuilding {...props} />;
      case 'U': return <UShapeBuilding {...props} />;
      case 'T': return <TShapeBuilding {...props} />;
      case 'complex': return <ComplexShapeBuilding {...props} />;
      default: return <RectBuilding {...props} />;
    }
  };

  return (
    <group
      ref={groupRef}
      position={[building.position[0], 0, building.position[2]]}
      rotation={[0, building.rotation || 0, 0]}
      onClick={handleClick}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
    >
      {renderShape()}

      <BuildingRoof building={building} totalHeight={totalHeight} />

      {building.floors >= 2 && (
        <>
          {Array.from({ length: building.floors }).map((_, fi) => (
            <WindowRow
              key={`front-${fi}`}
              width={building.size[0] * 0.8}
              height={building.size[1]}
              floorY={fi * floorHeight + floorHeight * 0.6}
              floorHeight={floorHeight}
            />
          ))}
        </>
      )}

      {(hovered || isSelected || isHighlighted) && (
        <group position={[0, totalHeight + 1.2, 0]}>
          <Html center distanceFactor={25} style={{ pointerEvents: 'none' }}>
            <div
              className="px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap shadow-2xl border"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(212,163,67,0.95), rgba(212,163,67,0.8))'
                  : 'rgba(13,30,61,0.95)',
                color: isSelected ? '#091324' : '#f6f2eb',
                borderColor: isSelected ? 'rgba(212,163,67,0.5)' : 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 800 }}>{building.id}</div>
              <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {building.name}
              </div>
            </div>
          </Html>
        </group>
      )}

      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[
            Math.max(building.size[0], building.size[1]) * 0.6,
            Math.max(building.size[0], building.size[1]) * 0.65,
            32
          ]} />
          <meshStandardMaterial
            color="#d4a343"
            emissive="#d4a343"
            emissiveIntensity={0.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </group>
  );
}
