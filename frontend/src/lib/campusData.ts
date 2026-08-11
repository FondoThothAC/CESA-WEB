// ============================================================
// campusData.ts — Datos del Campus UNISON
// Coordenadas medidas directamente de campus-map.jpg (2054×1310 px)
// Mapeadas al plano 3D de 90×55 unidades centrado en (0,0)
// X: [-45, +45]  Z: [-27.5, +27.5]
// ============================================================

export interface Room {
  code: string;
  floor: number;
  name: string;
  department: string;
}

export type BuildingShape = 'rect' | 'L' | 'U' | 'T' | 'complex';

export interface Building {
  id: string;
  section: number;
  letter: string;
  name: string;
  floors: number;
  position: [number, number, number];
  size: [number, number];
  shape: BuildingShape;
  rotation?: number;
  departments: string[];
  rooms: Room[];
  street?: string;
  landmark?: string;
  color?: string;
  phone?: string;
  hours?: string;
  description?: string;
}

export interface Tree {
  position: [number, number, number];
  scale: number;
}

export interface Parking {
  position: [number, number, number];
  size: [number, number];
  type: 'surface' | 'multilevel';
  floors?: number;
  spots?: number;
  name?: string;
}

export interface Street {
  name: string;
  orientation: 'horizontal' | 'vertical';
  z?: number;
  x?: number;
  width: number;
  color: string;
}

export interface WaypointNode {
  id: string;
  position: [number, number];
  connections: string[];
}

const FLOOR_COLORS: Record<number, string> = {
  1: '#fd811f',
  2: '#2d3690',
  3: '#ed2024',
  5: '#fde600',
};

export function getFloorColor(floors: number): string {
  return FLOOR_COLORS[floors] || '#6b7280';
}

export function generateRooms(building: Building): Room[] {
  const rooms: Room[] = [];
  for (let floor = 1; floor <= building.floors; floor++) {
    const roomsPerFloor = building.floors <= 2 ? 6 : 4;
    for (let r = 1; r <= roomsPerFloor; r++) {
      const roomNum = floor * 100 + r;
      rooms.push({
        code: `${building.section}${building.letter}${roomNum}`,
        floor,
        name: `Salón ${roomNum}`,
        department: building.departments[0] || building.name,
      });
    }
  }
  return rooms;
}

// ============================================================
// EDIFICIOS — Posiciones pixel→3D desde campus-map.jpg
// ============================================================

export const buildings: Building[] = [

  // ═══ ZONA NORESTE — Blvd. Navarrete ═══
  {
    id: '9-N', section: 9, letter: 'N',
    name: 'Aulas Norte',
    floors: 2,
    position: [-18.3, 0, 24.2],
    size: [1.8, 1.7],
    shape: 'rect',
    departments: ['Aulas Generales Norte'],
    rooms: [],
    phone: '(662) 259-2100',
    hours: 'Lun–Vie: 7:00–21:00',
  },
  {
    id: '9-B', section: 9, letter: 'B',
    name: 'Oficinas Administrativas Norte',
    floors: 2,
    position: [-17.0, 0, 24.2],
    size: [1.8, 1.7],
    shape: 'rect',
    departments: ['Administración'],
    rooms: [],
  },
  {
    id: '9-C', section: 9, letter: 'C',
    name: 'Edificio de Aulas 9C',
    floors: 3,
    position: [-16.5, 0, 22.9],
    size: [2.4, 1.3],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '9-D', section: 9, letter: 'D',
    name: 'Edificio 9D',
    floors: 5,
    position: [-17.8, 0, 22.5],
    size: [1.5, 1.3],
    shape: 'rect',
    departments: ['Administración'],
    rooms: [],
    color: '#fde600',
  },
  {
    id: '10-A', section: 10, letter: 'A',
    name: 'Edificio 10A',
    floors: 1,
    position: [-10.6, 0, 22.0],
    size: [2.4, 1.5],
    shape: 'rect',
    departments: ['Oficinas'],
    rooms: [],
  },
  {
    id: '10-K', section: 10, letter: 'K',
    name: 'Edificio 10K',
    floors: 2,
    position: [-8.0, 0, 22.0],
    size: [1.8, 1.5],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '10-B', section: 10, letter: 'B',
    name: 'Edificio 10B',
    floors: 3,
    position: [-9.5, 0, 20.2],
    size: [2.2, 1.5],
    shape: 'rect',
    departments: ['Oficinas y Aulas'],
    rooms: [],
  },
  {
    id: '10-C', section: 10, letter: 'C',
    name: 'Edificio 10C',
    floors: 3,
    position: [-6.9, 0, 18.7],
    size: [2.6, 1.7],
    shape: 'complex',
    departments: ['Laboratorios', 'Investigación'],
    rooms: [],
  },
  {
    id: '10-D', section: 10, letter: 'D',
    name: 'Edificio 10D',
    floors: 2,
    position: [-3.8, 0, 20.4],
    size: [2.4, 1.7],
    shape: 'rect',
    departments: ['Oficinas'],
    rooms: [],
  },

  // ═══ ZONA CENTRO — Av. Sonora / Av. Universidad ═══
  {
    id: '12-D', section: 12, letter: 'D',
    name: 'Biblioteca Central',
    floors: 3,
    position: [-6.7, 0, 14.1],
    size: [2.6, 2.1],
    shape: 'complex',
    departments: ['Biblioteca Central', 'Hemeroteca'],
    rooms: [],
    phone: '(662) 259-2112',
    hours: 'Lun–Vie: 7:30–21:00 | Sáb: 8:00–14:00',
    description: 'Biblioteca Central Universitaria.',
  },
  {
    id: '2-A', section: 2, letter: 'A',
    name: 'Edificio Principal — Rectoría',
    floors: 2,
    position: [-2.1, 0, 13.6],
    size: [2.2, 2.5],
    shape: 'rect',
    departments: ['Rectoría', 'Administración Central'],
    rooms: [],
    phone: '(662) 259-2100',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Edificio principal de Rectoría.',
  },
  {
    id: '12-C', section: 12, letter: 'C',
    name: 'Edificio 12C',
    floors: 2,
    position: [-6.9, 0, 11.8],
    size: [2.0, 1.3],
    shape: 'rect',
    departments: ['Oficinas Administrativas'],
    rooms: [],
  },
  {
    id: '12-B', section: 12, letter: 'B',
    name: 'Edificio 12B',
    floors: 2,
    position: [-6.9, 0, 10.3],
    size: [2.4, 1.3],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '12-A', section: 12, letter: 'A',
    name: 'Ing. Civil — Jefatura',
    floors: 3,
    position: [-4.0, 0, 10.3],
    size: [2.4, 1.5],
    shape: 'rect',
    departments: ['Ing. Civil', 'Jefatura'],
    rooms: [],
    phone: '(662) 259-2265',
  },
  {
    id: '12-E', section: 12, letter: 'E',
    name: 'Edificio 12E',
    floors: 2,
    position: [-9.3, 0, 11.8],
    size: [1.8, 1.5],
    shape: 'rect',
    departments: ['Investigación'],
    rooms: [],
  },
  {
    id: '8-A', section: 8, letter: 'A',
    name: 'Servicios Escolares',
    floors: 1,
    position: [-13.0, 0, 10.7],
    size: [2.0, 1.5],
    shape: 'rect',
    departments: ['Servicios Escolares'],
    rooms: [],
    phone: '(662) 259-2100',
    hours: 'Lun–Vie: 8:00–15:00',
  },
  {
    id: '8-D', section: 8, letter: 'D',
    name: 'Edificio 8D',
    floors: 2,
    position: [-12.6, 0, 12.8],
    size: [2.0, 1.7],
    shape: 'rect',
    departments: ['Oficinas'],
    rooms: [],
  },
  {
    id: '8-C', section: 8, letter: 'C',
    name: 'Edificio 8C',
    floors: 2,
    position: [-14.5, 0, 12.0],
    size: [1.3, 1.9],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '11-A', section: 11, letter: 'A',
    name: 'Seguridad Universitaria',
    floors: 2,
    position: [-2.5, 0, 16.2],
    size: [2.0, 1.0],
    shape: 'rect',
    departments: ['Seguridad Universitaria', 'Vigilancia'],
    rooms: [],
    phone: '(662) 259-2101',
  },
  {
    id: '11-C', section: 11, letter: 'C',
    name: 'Edificio 11C',
    floors: 1,
    position: [4.1, 0, 16.4],
    size: [1.5, 1.3],
    shape: 'rect',
    departments: ['Oficinas'],
    rooms: [],
  },

  // ═══ ZONA NORESTE — Reformas ═══
  {
    id: '9-P', section: 9, letter: 'P',
    name: 'Edificio 9P',
    floors: 2,
    position: [-21.1, 0, 16.6],
    size: [2.2, 1.7],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '9-K', section: 9, letter: 'K',
    name: 'Edificio 9K',
    floors: 2,
    position: [-20.5, 0, 18.7],
    size: [2.4, 1.9],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '9-H', section: 9, letter: 'H',
    name: 'Edificio 9H',
    floors: 2,
    position: [-18.5, 0, 18.3],
    size: [1.8, 1.5],
    shape: 'rect',
    departments: ['Oficinas'],
    rooms: [],
  },
  {
    id: '9-Q1', section: 9, letter: 'Q',
    name: 'Edificio 9Q-1',
    floors: 3,
    position: [-17.4, 0, 16.4],
    size: [2.0, 1.3],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '9-Q2', section: 9, letter: 'Q',
    name: 'Edificio 9Q-2',
    floors: 2,
    position: [-17.8, 0, 14.5],
    size: [2.2, 1.3],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '9-Q3', section: 9, letter: 'Q',
    name: 'Edificio 9Q-3',
    floors: 2,
    position: [-15.2, 0, 15.1],
    size: [2.0, 1.3],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },

  // ═══ ZONA ESTE — Ingenierías y Ciencias ═══
  {
    id: '3-A', section: 3, letter: 'A',
    name: 'Letras y Lingüística',
    floors: 3,
    position: [2.3, 0, 11.1],
    size: [2.2, 1.9],
    shape: 'L',
    departments: ['Letras y Lingüística'],
    rooms: [],
    phone: '(662) 259-2277',
  },
  {
    id: '3-B', section: 3, letter: 'B',
    name: 'Edificio 3B',
    floors: 1,
    position: [6.0, 0, 9.0],
    size: [1.8, 1.7],
    shape: 'rect',
    departments: ['Servicios'],
    rooms: [],
  },
  {
    id: '3-U', section: 3, letter: 'U',
    name: 'Edificio 3U',
    floors: 5,
    position: [7.1, 0, 10.7],
    size: [1.1, 1.3],
    shape: 'rect',
    departments: ['Administración'],
    rooms: [],
    color: '#fde600',
  },
  {
    id: '3-Q', section: 3, letter: 'Q',
    name: 'Edificio 3Q',
    floors: 3,
    position: [3.6, 0, 9.9],
    size: [1.3, 1.0],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '3-R', section: 3, letter: 'R',
    name: 'Edificio 3R',
    floors: 1,
    position: [5.2, 0, 9.9],
    size: [1.1, 1.0],
    shape: 'rect',
    departments: ['Oficinas'],
    rooms: [],
  },
  {
    id: '3-P', section: 3, letter: 'P',
    name: 'Edificio 3P',
    floors: 2,
    position: [3.6, 0, 8.4],
    size: [1.3, 1.0],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '3-C', section: 3, letter: 'C',
    name: 'Aulas Generales 3C',
    floors: 2,
    position: [2.5, 0, 6.9],
    size: [2.0, 1.5],
    shape: 'rect',
    departments: ['Aulas Generales'],
    rooms: [],
  },
  {
    id: '3-F', section: 3, letter: 'F',
    name: 'Edificio 3F',
    floors: 2,
    position: [3.2, 0, 5.2],
    size: [1.8, 1.3],
    shape: 'rect',
    departments: ['Oficinas'],
    rooms: [],
  },
  {
    id: '3-L', section: 3, letter: 'L',
    name: 'Edificio 3L',
    floors: 2,
    position: [3.6, 0, 6.5],
    size: [1.5, 1.0],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '3-M', section: 3, letter: 'M',
    name: 'Edificio 3M',
    floors: 1,
    position: [1.4, 0, 6.5],
    size: [1.5, 1.0],
    shape: 'rect',
    departments: ['Oficinas'],
    rooms: [],
  },
  {
    id: '3-H', section: 3, letter: 'H',
    name: 'Edificio 3H',
    floors: 5,
    position: [5.0, 0, 8.2],
    size: [1.3, 0.8],
    shape: 'rect',
    departments: ['Oficinas'],
    rooms: [],
    color: '#fde600',
  },
  {
    id: '3-O', section: 3, letter: 'O',
    name: 'Edificio 3O',
    floors: 2,
    position: [6.3, 0, 5.7],
    size: [1.5, 1.3],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '3-K2', section: 3, letter: 'K',
    name: 'Edificio 3K-2',
    floors: 1,
    position: [4.1, 0, 4.2],
    size: [1.3, 1.0],
    shape: 'rect',
    departments: ['Laboratorios'],
    rooms: [],
  },
  {
    id: '3-K3', section: 3, letter: 'K',
    name: 'Edificio 3K-3',
    floors: 1,
    position: [5.6, 0, 4.2],
    size: [1.3, 1.0],
    shape: 'rect',
    departments: ['Laboratorios'],
    rooms: [],
  },
  {
    id: '3-K4', section: 3, letter: 'K',
    name: 'Edificio 3K-4',
    floors: 1,
    position: [5.8, 0, 2.9],
    size: [1.8, 1.3],
    shape: 'rect',
    departments: ['Laboratorios'],
    rooms: [],
  },

  // ═══ Ingenierías Bloque 5 ═══
  {
    id: '5-K', section: 5, letter: 'K',
    name: 'Edificio 5K',
    floors: 1,
    position: [-4.0, 0, 8.8],
    size: [1.5, 1.0],
    shape: 'rect',
    departments: ['Ing. Industrial'],
    rooms: [],
  },
  {
    id: '5-M', section: 5, letter: 'M',
    name: 'Edificio 5M',
    floors: 2,
    position: [-2.7, 0, 8.2],
    size: [1.5, 1.0],
    shape: 'rect',
    departments: ['Ingenierías'],
    rooms: [],
  },
  {
    id: '5-B', section: 5, letter: 'B',
    name: 'Ing. Química — Aulas',
    floors: 2,
    position: [-3.8, 0, 5.9],
    size: [2.2, 1.5],
    shape: 'rect',
    departments: ['Ing. Química'],
    rooms: [],
    phone: '(662) 259-2300',
  },
  {
    id: '5-C', section: 5, letter: 'C',
    name: 'Ing. Química y Metalurgia — Taller',
    floors: 5,
    position: [-2.1, 0, 4.2],
    size: [2.0, 1.3],
    shape: 'rect',
    departments: ['Ing. Química', 'Metalurgia'],
    rooms: [],
    color: '#fde600',
  },
  {
    id: '5-D', section: 5, letter: 'D',
    name: 'Ingeniería Industrial',
    floors: 2,
    position: [-3.8, 0, 4.2],
    size: [1.8, 1.3],
    shape: 'rect',
    departments: ['Ing. Industrial'],
    rooms: [],
    phone: '(662) 259-2260',
  },
  {
    id: '5-A1', section: 5, letter: 'A',
    name: 'Ing. Química y Metalurgia',
    floors: 1,
    position: [-0.7, 0, 2.3],
    size: [2.6, 1.5],
    shape: 'rect',
    departments: ['Ing. Química', 'Metalurgia'],
    rooms: [],
  },
  {
    id: '5-A2', section: 5, letter: 'A',
    name: 'Laboratorios Ing. Química',
    floors: 1,
    position: [1.9, 0, 2.3],
    size: [2.4, 1.5],
    shape: 'rect',
    departments: ['Laboratorios Ing. Química'],
    rooms: [],
  },
  {
    id: '5-Q', section: 5, letter: 'Q',
    name: 'Edificio 5Q',
    floors: 2,
    position: [-9.3, 0, 4.0],
    size: [2.0, 1.5],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '5-P', section: 5, letter: 'P',
    name: 'Edificio 5P',
    floors: 2,
    position: [-6.9, 0, 1.5],
    size: [1.8, 1.3],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '5-S', section: 5, letter: 'S',
    name: 'Edificio 5S',
    floors: 2,
    position: [-4.3, 0, 0.6],
    size: [2.2, 1.3],
    shape: 'rect',
    departments: ['Aulas'],
    rooms: [],
  },
  {
    id: '5-T', section: 5, letter: 'T',
    name: 'Edificio 5T',
    floors: 1,
    position: [-2.3, 0, 0.6],
    size: [1.5, 0.8],
    shape: 'rect',
    departments: ['Oficinas'],
    rooms: [],
  },

  // ═══ ZONA Estadio / Centro ═══
  {
    id: '6-F', section: 6, letter: 'F',
    name: 'Edificio 6F',
    floors: 1,
    position: [-12.1, 0, 8.0],
    size: [1.3, 1.5],
    shape: 'rect',
    departments: ['Deportes'],
    rooms: [],
  },
  {
    id: '6-E', section: 6, letter: 'E',
    name: 'Edificio 6E',
    floors: 1,
    position: [-10.6, 0, 7.3],
    size: [1.3, 1.0],
    shape: 'rect',
    departments: ['Servicios'],
    rooms: [],
  },

  // ═══ ZONA OESTE — Ciencias de la Salud ═══
  {
    id: '7-B', section: 7, letter: 'B',
    name: 'Gimnasio Universitario',
    floors: 2,
    position: [-26.6, 0, 20.4],
    size: [3.1, 2.1],
    shape: 'rect',
    departments: ['Cultura Física', 'Deporte'],
    rooms: [],
    phone: '(662) 259-2100',
    hours: 'Lun–Sáb: 6:00–22:00',
  },
  {
    id: '7-M', section: 7, letter: 'M',
    name: 'Gimnasio Universitario Anexo',
    floors: 1,
    position: [-27.9, 0, 19.3],
    size: [2.2, 1.7],
    shape: 'rect',
    departments: ['Deporte'],
    rooms: [],
  },
  {
    id: '7-C', section: 7, letter: 'C',
    name: 'Facultad de Medicina',
    floors: 3,
    position: [-28.1, 0, 3.6],
    size: [2.6, 2.3],
    shape: 'complex',
    departments: ['Medicina', 'Laboratorios Clínicos'],
    rooms: [],
    phone: '(662) 259-2180',
    hours: 'Lun–Vie: 7:00–21:00',
    description: 'Facultad de Medicina con laboratorios clínicos.',
  },
  {
    id: '7-D', section: 7, letter: 'D',
    name: 'DICTUS',
    floors: 3,
    position: [-24.4, 0, 6.1],
    size: [1.8, 1.5],
    shape: 'rect',
    departments: ['DICTUS'],
    rooms: [],
  },
  {
    id: '7-K', section: 7, letter: 'K',
    name: 'Facultad de Odontología',
    floors: 3,
    position: [-23.1, 0, 7.3],
    size: [1.5, 1.3],
    shape: 'rect',
    departments: ['Odontología'],
    rooms: [],
    phone: '(662) 259-2186',
  },
  {
    id: '7-H', section: 7, letter: 'H',
    name: 'Edificio 7H',
    floors: 3,
    position: [-25.9, 0, 5.2],
    size: [1.3, 1.5],
    shape: 'rect',
    departments: ['Ciencias de la Salud'],
    rooms: [],
  },
  {
    id: '7-I', section: 7, letter: 'I',
    name: 'Edificio 7I',
    floors: 1,
    position: [-24.4, 0, 4.4],
    size: [1.3, 1.0],
    shape: 'rect',
    departments: ['Laboratorios'],
    rooms: [],
  },
  {
    id: '7-G', section: 7, letter: 'G',
    name: 'Farmacia',
    floors: 3,
    position: [-29.9, 0, 4.8],
    size: [1.3, 1.3],
    shape: 'rect',
    departments: ['Farmacia'],
    rooms: [],
  },
  {
    id: '7-A', section: 7, letter: 'A',
    name: 'Unidad de Posgrado',
    floors: 1,
    position: [-22.7, 0, 1.9],
    size: [2.2, 1.5],
    shape: 'rect',
    departments: ['Posgrado'],
    rooms: [],
    phone: '(662) 259-2100',
  },

  // ═══ EXTREMOS ═══
  {
    id: '14-A', section: 14, letter: 'A',
    name: 'Promoción Financiera',
    floors: 1,
    position: [6.0, 0, 22.0],
    size: [1.8, 1.5],
    shape: 'rect',
    departments: ['Promoción Financiera'],
    rooms: [],
  },
  {
    id: '1-A', section: 1, letter: 'A',
    name: 'Museo y Biblioteca',
    floors: 1,
    position: [8.2, 0, 14.1],
    size: [1.5, 1.9],
    shape: 'rect',
    departments: ['Museo Universitario', 'Biblioteca'],
    rooms: [],
  },
];

// Generar salones automáticamente
buildings.forEach((b) => {
  if (b.rooms.length === 0) {
    b.rooms = generateRooms(b);
  }
});

// ============================================================
// CALLES — Posiciones calibradas desde el mapa
// ============================================================
export const campusStreets: Street[] = [
  { name: 'Blvd. Navarrete', orientation: 'horizontal', z: 25.6, width: 60, color: '#555' },
  { name: 'Av. Sonora', orientation: 'horizontal', z: 12.2, width: 40, color: '#555' },
  { name: 'Av. Universidad', orientation: 'horizontal', z: 9.0, width: 40, color: '#555' },
  { name: 'Av. Luis Donaldo Colosio', orientation: 'horizontal', z: -0.2, width: 60, color: '#444' },
  { name: 'Calle de la Reforma', orientation: 'vertical', x: -20.7, width: 45, color: '#555' },
  { name: 'Calle Francisco Q. Salazar', orientation: 'vertical', x: -36.9, width: 45, color: '#555' },
  { name: 'Calle Rosales', orientation: 'vertical', x: 7.6, width: 45, color: '#555' },
];

// ============================================================
// ESTACIONAMIENTOS — Posiciones calibradas
// ============================================================
export const campusParking: Parking[] = [
  { position: [-9.5, 0, 24.1], size: [3.5, 1.5], type: 'surface', spots: 20, name: '10-EM101' },
  { position: [-6.0, 0, 22.5], size: [2.6, 1.5], type: 'surface', spots: 16, name: '10-EM102' },
  { position: [-12.4, 0, 18.5], size: [2.4, 2.1], type: 'surface', spots: 18, name: '10-EM103' },
];

// ============================================================
// ÁRBOLES — Reducidos para rendimiento
// ============================================================
export const campusTrees: Tree[] = [
  { position: [-15, 0, 20], scale: 0.7 },
  { position: [-22, 0, 15], scale: 0.8 },
  { position: [-28, 0, 12], scale: 0.9 },
  { position: [-10, 0, 15], scale: 0.6 },
  { position: [0, 0, 12], scale: 0.7 },
  { position: [5, 0, 7], scale: 0.6 },
  { position: [-5, 0, 6], scale: 0.8 },
  { position: [-18, 0, 8], scale: 0.7 },
];

// ============================================================
// HITOS — Calibrados desde el mapa
// ============================================================
export const campusLandmarks = [
  { name: 'Estadio Hodggers', position: [-28.3, 0, 14.5] as [number, number, number], type: 'stadium' as const, size: 5 },
  { name: 'Estadio Castro Servín', position: [-14.3, 0, 5.5] as [number, number, number], type: 'stadium' as const, size: 4 },
  { name: 'Plaza del Estudiante', position: [-3, 0, 10] as [number, number, number], type: 'plaza' as const, size: 2 },
];

// ============================================================
// CAMINOS PEATONALES — Para wayfinding
// ============================================================
export const campusWaypoints: WaypointNode[] = [
  // Eje horizontal norte Z≈18
  { id: 'HN-1', position: [-25, 18], connections: ['HN-2'] },
  { id: 'HN-2', position: [-18, 18], connections: ['HN-1', 'HN-3', 'VC-1'] },
  { id: 'HN-3', position: [-10, 18], connections: ['HN-2', 'HN-4'] },
  { id: 'HN-4', position: [-3, 18], connections: ['HN-3', 'HN-5', 'VC-2'] },
  { id: 'HN-5', position: [5, 18], connections: ['HN-4'] },

  // Eje horizontal centro Z≈12
  { id: 'HC-1', position: [-25, 12], connections: ['HC-2', 'HN-1'] },
  { id: 'HC-2', position: [-18, 12], connections: ['HC-1', 'HC-3', 'VC-1'] },
  { id: 'HC-3', position: [-10, 12], connections: ['HC-2', 'HC-4'] },
  { id: 'HC-4', position: [-3, 12], connections: ['HC-3', 'HC-5', 'VC-2'] },
  { id: 'HC-5', position: [5, 12], connections: ['HC-4', 'HC-6'] },
  { id: 'HC-6', position: [8, 12], connections: ['HC-5'] },

  // Eje horizontal sur Z≈5
  { id: 'HS-1', position: [-28, 5], connections: ['HS-2'] },
  { id: 'HS-2', position: [-20, 5], connections: ['HS-1', 'HS-3', 'VC-1'] },
  { id: 'HS-3', position: [-10, 5], connections: ['HS-2', 'HS-4'] },
  { id: 'HS-4', position: [-3, 5], connections: ['HS-3', 'HS-5', 'VC-2'] },
  { id: 'HS-5', position: [3, 5], connections: ['HS-4', 'HS-6'] },
  { id: 'HS-6', position: [7, 5], connections: ['HS-5'] },

  // Eje vertical izquierdo X≈-20
  { id: 'VC-1', position: [-20, 18], connections: ['HN-2', 'HC-2', 'HS-2'] },

  // Eje vertical central X≈-3
  { id: 'VC-2', position: [-3, 18], connections: ['HN-4', 'HC-4', 'HS-4'] },
];

// ============================================================
// FUNCIONES DE BÚSQUEDA
// ============================================================
export function searchBuildings(query: string): Building[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return buildings.filter(
    (b) =>
      b.name.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.departments.some((d) => d.toLowerCase().includes(q)) ||
      b.rooms.some((r) => r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
  );
}

export function searchRooms(query: string): { building: Building; room: Room }[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  const results: { building: Building; room: Room }[] = [];
  buildings.forEach((b) => {
    b.rooms.forEach((r) => {
      if (
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q)
      ) {
        results.push({ building: b, room: r });
      }
    });
  });
  return results;
}

// ============================================================
// WAYFINDING
// ============================================================
export function getNearestWaypoint(x: number, z: number): WaypointNode {
  let nearest = campusWaypoints[0];
  let minDist = Infinity;
  for (const node of campusWaypoints) {
    const dx = node.position[0] - x;
    const dz = node.position[1] - z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    if (dist < minDist) {
      minDist = dist;
      nearest = node;
    }
  }
  return nearest;
}

export function findWaypointPath(startId: string, endId: string): [number, number][] {
  const nodeMap = new Map<string, WaypointNode>();
  for (const node of campusWaypoints) {
    nodeMap.set(node.id, node);
  }
  if (!nodeMap.has(startId) || !nodeMap.has(endId)) return [];
  if (startId === endId) return [nodeMap.get(startId)!.position];

  const visited = new Set<string>();
  const queue: { id: string; path: string[] }[] = [{ id: startId, path: [startId] }];
  visited.add(startId);

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;
    const node = nodeMap.get(id)!;
    for (const neighborId of node.connections) {
      if (neighborId === endId) {
        const fullPath = [...path, neighborId];
        return fullPath.map((nid) => nodeMap.get(nid)!.position);
      }
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push({ id: neighborId, path: [...path, neighborId] });
      }
    }
  }
  return [];
}

export function getDirections(from: string | null, to: Building): string[] {
  const fromBuilding = from ? buildings.find((b) => b.id === from) : null;
  const steps: string[] = [];
  if (fromBuilding) {
    const dx = to.position[0] - fromBuilding.position[0];
    const dz = to.position[2] - fromBuilding.position[2];
    const distEstimate = Math.sqrt(dx * dx + dz * dz);
    if (Math.abs(dx) > Math.abs(dz)) {
      steps.push(dx > 0 ? '➡️ Camina hacia el este' : '⬅️ Camina hacia el oeste');
    } else {
      steps.push(dz > 0 ? '⬇️ Camina hacia el sur' : '⬆️ Camina hacia el norte');
    }
    steps.push(`📏 Distancia aprox: ${Math.round(distEstimate * 12)} metros`);
  } else {
    steps.push('📍 Ubícate en el campus');
  }
  if (to.street) steps.push(`🏠 Busca en ${to.street}`);
  if (to.landmark) steps.push(`🏛️ Cerca de: ${to.landmark}`);
  steps.push(`🏢 Edificio ${to.id}: ${to.name}`);
  if (to.floors > 1) steps.push(`🏗️ Tiene ${to.floors} pisos`);
  if (to.phone) steps.push(`📞 Tel: ${to.phone}`);
  steps.push('✅ ¡Llegaste!');
  return steps;
}
