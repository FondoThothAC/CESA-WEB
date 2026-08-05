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
}

const FLOOR_COLORS: Record<number, string> = {
  1: '#facc15', // 1 Nivel - Amarillo oficial
  2: '#2563eb', // 2 Niveles - Azul oficial
  3: '#dc2626', // 3 Niveles - Rojo oficial
  5: '#f97316', // 5 Niveles - Naranja oficial (Rectoría / Edificio 2A)
};

export function getFloorColor(floors: number): string {
  return FLOOR_COLORS[floors] || '#3b82f6';
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

// Grid mapping: columns 1-6 → X: -28 to 28, rows A-D → Z: -20 to 18
// Each grid cell ~10 units wide/tall
const G = {
  col: { 1: -28, 2: -18, 3: -8, 4: 2, 5: 12, 6: 22 },
  row: { A: -20, B: -10, C: 0, D: 10 },
};

export const buildings: Building[] = [
  // ═══════════════════════════════════════════
  // SECCIÓN 1 - NOROESTE
  // ═══════════════════════════════════════════
  {
    id: '1-A',
    section: 1, letter: 'A',
    name: 'Museo y Biblioteca',
    floors: 3,
    position: [G.col[1] + 3, 0, G.row['A'] + 3],
    size: [8, 6],
    shape: 'rect',
    departments: ['Museo Universitario', 'Biblioteca'],
    rooms: [],
    street: 'Blvd. Navarrete',
    landmark: 'Esquina noroeste',
  },

  // ═══════════════════════════════════════════
  // SECCIÓN 2 - NORTE-CENTRO
  // ═══════════════════════════════════════════
  {
    id: '2-A',
    section: 2, letter: 'A',
    name: 'Edificio Principal - Rectoría',
    floors: 5,
    position: [G.col[2] + 2, 0, G.row['A'] + 4],
    size: [10, 7],
    shape: 'U',
    departments: ['Rectoría', 'Administración Central', 'Recursos Humanos'],
    rooms: [],
    street: 'Blvd. Navarrete',
    landmark: 'Edificio más alto del campus',
    color: '#ea580c',
  },

  // ═══════════════════════════════════════════
  // CAMPO EXPERIMENTAL DE AGRICULTURA Y GANADERÍA (DAG)
  // ═══════════════════════════════════════════
  {
    id: '1A/01',
    section: 10, letter: 'DAG-1A',
    name: 'DAG - Oficinas Administrativas',
    floors: 1,
    position: [-38, 0, -32],
    size: [6, 4],
    shape: 'rect',
    departments: ['Campo Experimental DAG', 'Administración DAG'],
    rooms: [],
    street: 'Carretera a Bahía de Kino',
    landmark: 'Campo Experimental de Agricultura y Ganadería',
  },
  {
    id: '1B',
    section: 10, letter: 'DAG-1B',
    name: 'DAG - Biblioteca y Aulas',
    floors: 1,
    position: [-30, 0, -32],
    size: [5, 4],
    shape: 'rect',
    departments: ['Biblioteca DAG', 'Aulas Agricultura'],
    rooms: [],
    street: 'Carretera a Bahía de Kino',
    landmark: 'Campo Experimental DAG',
  },
  {
    id: '1H/06',
    section: 10, letter: 'DAG-1H',
    name: 'DAG - Lab. Entomología y Fitopatología',
    floors: 1,
    position: [-42, 0, -26],
    size: [6, 5],
    shape: 'L',
    departments: ['Laboratorio de Entomología', 'Nutrición Vegetal y Suelos'],
    rooms: [],
    street: 'Circuito Interior DAG',
    landmark: 'Laboratorios Agronomía',
  },
  {
    id: '1I/06',
    section: 10, letter: 'DAG-1I',
    name: 'DAG - Lab. Topografía y Semillas',
    floors: 1,
    position: [-42, 0, -20],
    size: [6, 5],
    shape: 'L',
    departments: ['Laboratorio de Topografía', 'Fisiología Vegetal'],
    rooms: [],
    street: 'Circuito Interior DAG',
    landmark: 'Laboratorios Agronomía',
  },
  {
    id: '2A/01',
    section: 10, letter: 'DAG-2A',
    name: 'DAG - Oficinas de Campo y Usos Múltiples',
    floors: 1,
    position: [-35, 0, -42],
    size: [7, 5],
    shape: 'T',
    departments: ['Salón de Usos Múltiples DAG', 'Cubículos de Campo'],
    rooms: [],
    street: 'Zona Norte DAG',
    landmark: 'Apiario / Zona de Campo',
  },
  {
    id: '3-A',
    section: 3, letter: 'A',
    name: 'Letras y Lingüística',
    floors: 2,
    position: [G.col[3] - 2, 0, G.row['A'] + 4],
    size: [7, 5],
    shape: 'L',
    departments: ['Letras', 'Lingüística', 'Humanidades'],
    rooms: [],
    street: 'Blvd. Navarrete',
  },
  {
    id: '3-B',
    section: 3, letter: 'B',
    name: 'Ciencias Sociales y Derecho',
    floors: 3,
    position: [G.col[3] - 2, 0, G.row['B'] + 4],
    size: [8, 6],
    shape: 'complex',
    departments: ['Ciencias Sociales', 'Derecho', 'Sociología'],
    rooms: [],
    street: 'Calle de la Reforma',
  },
  {
    id: '3-C',
    section: 3, letter: 'C',
    name: 'Aulas y Laboratorios Generales',
    floors: 2,
    position: [G.col[3] - 2, 0, G.row['C'] + 4],
    size: [7, 5],
    shape: 'rect',
    departments: ['Aulas Generales', 'Laboratorios Básicos'],
    rooms: [],
  },
  {
    id: '3-D',
    section: 3, letter: 'D',
    name: 'Biblioteca Central y Auditorio',
    floors: 3,
    position: [G.col[3] - 2, 0, G.row['D'] + 2],
    size: [9, 6],
    shape: 'T',
    departments: ['Biblioteca Central', 'Auditorio Principal', 'Centro de Cómputo'],
    rooms: [],
    street: 'Calle de la Reforma',
  },
  {
    id: '3-E',
    section: 3, letter: 'E',
    name: 'Centro de las Artes',
    floors: 2,
    position: [G.col[3] + 6, 0, G.row['D'] + 2],
    size: [6, 5],
    shape: 'L',
    departments: ['Bellas Artes', 'Música', 'Diseño Gráfico'],
    rooms: [],
  },
  {
    id: '3-G',
    section: 3, letter: 'G',
    name: 'Ciencias de la Computación',
    floors: 3,
    position: [G.col[4] - 3, 0, G.row['B'] + 3],
    size: [7, 5],
    shape: 'rect',
    departments: ['Ciencias de la Computación', 'Ing. en Computación'],
    rooms: [],
    street: 'Blvd. Luis Encinas',
  },
  {
    id: '3-H',
    section: 3, letter: 'H',
    name: 'Arquitectura y Música',
    floors: 2,
    position: [G.col[4] - 3, 0, G.row['A'] + 4],
    size: [6, 4],
    shape: 'rect',
    departments: ['Arquitectura', 'Diseño Gráfico', 'Música'],
    rooms: [],
  },
  {
    id: '3-I',
    section: 3, letter: 'I',
    name: 'Geología y Física',
    floors: 2,
    position: [G.col[4] - 3, 0, G.row['C'] + 3],
    size: [6, 4],
    shape: 'L',
    departments: ['Geología', 'Física', 'Laboratorios'],
    rooms: [],
  },
  {
    id: '3-K',
    section: 3, letter: 'K',
    name: 'Ing. Civil y Laboratorios',
    floors: 3,
    position: [G.col[3] + 6, 0, G.row['B'] + 2],
    size: [7, 6],
    shape: 'complex',
    departments: ['Ing. Civil', 'Lab. Máquinas', 'Lab. Maquinados'],
    rooms: [],
  },
  {
    id: '3-L',
    section: 3, letter: 'L',
    name: 'Dirección de Infraestructura',
    floors: 2,
    position: [G.col[3] + 6, 0, G.row['A'] + 4],
    size: [5, 4],
    shape: 'rect',
    departments: ['Infraestructura', 'Adquisiciones'],
    rooms: [],
  },
  {
    id: '3-N',
    section: 3, letter: 'N',
    name: 'Comedor Universitario',
    floors: 1,
    position: [G.col[4] - 3, 0, G.row['D'] + 3],
    size: [10, 5],
    shape: 'rect',
    departments: ['Comedor', 'Servicios Generales'],
    rooms: [],
    street: 'Av. Luis Donaldo Colosio',
  },

  // ═══════════════════════════════════════════
  // SECCIÓN 5 - ESTE-CENTRO (Ingenierías)
  // ═══════════════════════════════════════════
  {
    id: '5-A',
    section: 5, letter: 'A',
    name: 'Ing. Química y Metalurgia',
    floors: 3,
    position: [G.col[5] + 2, 0, G.row['A'] + 4],
    size: [8, 6],
    shape: 'complex',
    departments: ['Ing. Química', 'Ing. Metalurgia', 'Ciencias Químico Biológicas'],
    rooms: [],
    street: 'Blvd. Luis Encinas',
  },
  {
    id: '5-B',
    section: 5, letter: 'B',
    name: 'Auditorio Rivera Zamudio',
    floors: 3,
    position: [G.col[5] + 2, 0, G.row['B'] + 3],
    size: [7, 5],
    shape: 'rect',
    departments: ['Auditorio Rivera Zamudio', 'Ing. Químico Metalurgia'],
    rooms: [],
  },
  {
    id: '5-D',
    section: 5, letter: 'D',
    name: 'Ingeniería Industrial',
    floors: 3,
    position: [G.col[5] + 2, 0, G.row['C'] + 2],
    size: [8, 6],
    shape: 'L',
    departments: ['Ing. Industrial', 'Programas Divisionales'],
    rooms: [],
  },
  {
    id: '5-E',
    section: 5, letter: 'E',
    name: 'División de Ingenierías',
    floors: 3,
    position: [G.col[5] + 2, 0, G.row['D'] + 2],
    size: [9, 6],
    shape: 'U',
    departments: ['Ing. Civil y Minas', 'Inc. Industrial', 'Aulas y Laboratorios'],
    rooms: [],
    street: 'Calle de la Reforma',
  },
  {
    id: '5-F',
    section: 5, letter: 'F',
    name: 'Ing. Industrial y Químico Biológicas',
    floors: 2,
    position: [G.col[6] - 2, 0, G.row['B'] + 3],
    size: [7, 5],
    shape: 'rect',
    departments: ['Ing. Industrial', 'Ciencias Químico Biológicas'],
    rooms: [],
  },
  {
    id: '5-G',
    section: 5, letter: 'G',
    name: 'Ing. Civil y Mecatrónica',
    floors: 3,
    position: [G.col[6] - 2, 0, G.row['C'] + 2],
    size: [8, 6],
    shape: 'complex',
    departments: ['Ing. Civil', 'Mecatrónica', 'Laboratorios'],
    rooms: [],
  },

  // ═══════════════════════════════════════════
  // SECCIÓN 7 - OESTE (Salud y Granja)
  // ═══════════════════════════════════════════
  {
    id: '7-A',
    section: 7, letter: 'A',
    name: 'Granja Universitaria',
    floors: 1,
    position: [G.col[1] + 3, 0, G.row['B'] + 3],
    size: [12, 8],
    shape: 'complex',
    departments: ['Granja Universitario Alberto Córdova Herrera'],
    rooms: [],
    street: 'Calle Francisco Q. Salazar',
    landmark: 'Área verde grande',
  },
  {
    id: '7-C',
    section: 7, letter: 'C',
    name: 'Facultad de Medicina',
    floors: 3,
    position: [G.col[2] + 2, 0, G.row['C'] + 3],
    size: [8, 6],
    shape: 'U',
    departments: ['Medicina', 'Laboratorios Clínicos', 'Auditorio'],
    rooms: [],
  },
  {
    id: '7-D',
    section: 7, letter: 'D',
    name: 'DICTUS y Laboratorios',
    floors: 2,
    position: [G.col[2] + 2, 0, G.row['B'] + 2],
    size: [6, 5],
    shape: 'rect',
    departments: ['DICTUS', 'Laboratorios de Investigación'],
    rooms: [],
  },
  {
    id: '7-H',
    section: 7, letter: 'H',
    name: 'Enfermería y Nutrición',
    floors: 2,
    position: [G.col[1] + 3, 0, G.row['C'] + 3],
    size: [6, 5],
    shape: 'L',
    departments: ['Enfermería', 'Nutrición'],
    rooms: [],
  },
  {
    id: '7-K',
    section: 7, letter: 'K',
    name: 'Facultad de Odontología',
    floors: 3,
    position: [G.col[2] + 2, 0, G.row['D'] + 2],
    size: [6, 5],
    shape: 'rect',
    departments: ['Odontología', 'Clínica Dental'],
    rooms: [],
    street: 'Av. Luis Donaldo Colosio',
  },

  // ═══════════════════════════════════════════
  // SECCIÓN 9 - ESTE (Ciencias Sociales)
  // ═══════════════════════════════════════════
  {
    id: '9-C',
    section: 9, letter: 'C',
    name: 'Ciencias de la Comunicación',
    floors: 2,
    position: [G.col[6] - 2, 0, G.row['A'] + 4],
    size: [6, 5],
    shape: 'L',
    departments: ['Ciencias de la Comunicación', 'Periodismo'],
    rooms: [],
    street: 'Calle Rosales',
  },
  {
    id: '9-F',
    section: 9, letter: 'F',
    name: 'Sociología y Administración Pública',
    floors: 2,
    position: [G.col[6] - 2, 0, G.row['D'] + 3],
    size: [6, 5],
    shape: 'rect',
    departments: ['Sociología', 'Administración Pública'],
    rooms: [],
  },
  {
    id: '9-I',
    section: 9, letter: 'I',
    name: 'Ciencias Económicas',
    floors: 3,
    position: [G.col[6] + 5, 0, G.row['B'] + 2],
    size: [7, 5],
    shape: 'complex',
    departments: ['Ciencias Económicas', 'Contabilidad', 'Economía'],
    rooms: [],
  },

  // ═══════════════════════════════════════════
  // SECCIÓN 10 - CENTRO-ESTE
  // ═══════════════════════════════════════════
  {
    id: '10-A',
    section: 10, letter: 'A',
    name: 'Enfermería y Trabajo Social',
    floors: 2,
    position: [G.col[4] + 2, 0, G.row['A'] + 3],
    size: [7, 5],
    shape: 'rect',
    departments: ['Enfermería', 'Trabajo Social', 'Administración'],
    rooms: [],
  },
  {
    id: '10-C',
    section: 10, letter: 'C',
    name: 'Facultad de Derecho',
    floors: 3,
    position: [G.col[6] + 5, 0, G.row['C'] + 2],
    size: [8, 6],
    shape: 'L',
    departments: ['Derecho', 'Aulas y Laboratorios'],
    rooms: [],
  },

  // ═══════════════════════════════════════════
  // SECCIÓN 11 - SUR-ESTE
  // ═══════════════════════════════════════════
  {
    id: '11-A',
    section: 11, letter: 'A',
    name: 'Vicerrectoría General',
    floors: 2,
    position: [G.col[6] + 5, 0, G.row['D'] + 2],
    size: [7, 5],
    shape: 'rect',
    departments: ['Vicerrectoría General', 'Seguridad Universitaria'],
    rooms: [],
    street: 'Av. Luis Donaldo Colosio',
  },

  // ═══════════════════════════════════════════
  // SECCIÓN 12 - SUR-CENTRO
  // ═══════════════════════════════════════════
  {
    id: '12-A',
    section: 12, letter: 'A',
    name: 'Ing. Civil - Jefatura',
    floors: 3,
    position: [G.col[5] + 2, 0, G.row['D'] + 3],
    size: [7, 5],
    shape: 'rect',
    departments: ['Ing. Civil', 'Jefatura', 'Aulas'],
    rooms: [],
    street: 'Av. Luis Donaldo Colosio',
  },
  {
    id: '12-F',
    section: 12, letter: 'F',
    name: 'Biblioteca Central e Informática',
    floors: 3,
    position: [G.col[4] + 2, 0, G.row['D'] + 3],
    size: [8, 6],
    shape: 'U',
    departments: ['Biblioteca Central', 'Laboratorio Central de Informática'],
    rooms: [],
    street: 'Av. Luis Donaldo Colosio',
    landmark: 'Cerca del estadio',
  },

  // ═══════════════════════════════════════════
  // SECCIÓN 13 - CENTRO
  // ═══════════════════════════════════════════
  {
    id: '13-A',
    section: 13, letter: 'A',
    name: 'Lenguas Extranjeras',
    floors: 2,
    position: [G.col[4] + 2, 0, G.row['C'] + 2],
    size: [6, 5],
    shape: 'rect',
    departments: ['Lenguas Extranjeras', 'CYVALE'],
    rooms: [],
  },
];

buildings.forEach((b) => {
  if (b.rooms.length === 0) {
    b.rooms = generateRooms(b);
  }
});

export const campusStreets = [
  { name: 'Blvd. Navarrete', orientation: 'horizontal' as const, z: G.row['A'] - 3, x: 0, width: 60, color: '#444' },
  { name: 'Calle de la Reforma', orientation: 'vertical' as const, x: G.col[4] - 1, z: 0, width: 45, color: '#555' },
  { name: 'Blvd. Luis Encinas', orientation: 'horizontal' as const, z: G.row['B'] - 2, x: 10, width: 40, color: '#555' },
  { name: 'Av. Luis Donaldo Colosio', orientation: 'horizontal' as const, z: G.row['D'] + 7, x: 0, width: 60, color: '#444' },
  { name: 'Calle Francisco Q. Salazar', orientation: 'vertical' as const, x: G.col[1] - 4, z: 0, width: 45, color: '#555' },
  { name: 'Calle Rosales', orientation: 'vertical' as const, x: G.col[6] + 9, z: 0, width: 45, color: '#555' },
];

export const campusLandmarks = [
  { name: 'Estadio Hodggers de Béisbol', position: [G.col[1] + 3, 0, G.row['C'] + 2] as [number, number, number], type: 'stadium' as const, size: 4 },
  { name: 'Estadio Miguel Castro Servín', position: [G.col[4] - 2, 0, G.row['D'] + 5] as [number, number, number], type: 'stadium' as const, size: 5 },
  { name: 'Plaza del Estudiante', position: [G.col[3] + 2, 0, G.row['B'] + 1] as [number, number, number], type: 'plaza' as const, size: 3 },
  { name: 'Hábitat Universitario', position: [G.col[6] + 8, 0, G.row['A'] + 2] as [number, number, number], type: 'housing' as const, size: 4 },
  { name: 'Gimnasio Universitario', position: [G.col[1] + 3, 0, G.row['A'] + 4] as [number, number, number], type: 'gym' as const, size: 3 },
  { name: 'Unidad Deportiva', position: [G.col[1] + 3, 0, G.row['D'] + 3] as [number, number, number], type: 'sports' as const, size: 4 },
];

export const campusParking: Parking[] = [
  { position: [G.col[3] - 8, 0, G.row['A'] + 2], size: [8, 5], type: 'surface', spots: 32, name: 'EM-101' },
  { position: [G.col[3] - 8, 0, G.row['B'] + 2], size: [10, 6], type: 'surface', spots: 50, name: 'EM-102' },
  { position: [G.col[3] - 8, 0, G.row['C'] + 2], size: [9, 5], type: 'surface', spots: 40, name: 'EM-103' },
  { position: [G.col[1] - 2, 0, G.row['B'] + 6], size: [5, 4], type: 'surface', spots: 18, name: 'EM-104' },
  { position: [G.col[6] + 4, 0, G.row['B'] + 6], size: [6, 4], type: 'surface', spots: 22, name: 'EM-105' },
  { position: [G.col[6] + 4, 0, G.row['A'] + 2], size: [4, 4], type: 'surface', spots: 14, name: 'EM-106' },
  { position: [G.col[5] - 4, 0, G.row['D'] + 1], size: [5, 4], type: 'multilevel', floors: 3, spots: 45, name: 'EM-Multinivel' },
  { position: [G.col[6] - 5, 0, G.row['D'] - 1], size: [5, 5], type: 'surface', spots: 20, name: 'EM-107' },
];

export interface Crosswalk {
  position: [number, number, number];
  size: [number, number];
  rotation?: number;
}

export const campusCrosswalks: Crosswalk[] = [
  { position: [G.col[3] - 8, 0.03, G.row['B'] + 2], size: [5, 0.8] },
  { position: [G.col[4] - 1, 0.03, G.row['A'] + 1], size: [4, 0.8], rotation: Math.PI / 2 },
  { position: [G.col[4] - 1, 0.03, G.row['B'] + 1], size: [4, 0.8], rotation: Math.PI / 2 },
  { position: [G.col[4] - 1, 0.03, G.row['D'] + 5], size: [4, 0.8], rotation: Math.PI / 2 },
  { position: [G.col[1] - 4, 0.03, G.row['D'] + 1], size: [4, 0.8], rotation: Math.PI / 2 },
];

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

export const campusTrees: Tree[] = [
  { position: [G.col[2] + 8, 0, G.row['A'] + 2], scale: 0.8 },
  { position: [G.col[2] - 3, 0, G.row['A'] + 7], scale: 0.6 },
  { position: [G.col[3] + 10, 0, G.row['B'] - 1], scale: 0.7 },
  { position: [G.col[3] - 5, 0, G.row['C'] - 1], scale: 0.9 },
  { position: [G.col[4] + 8, 0, G.row['A'] + 6], scale: 0.5 },
  { position: [G.col[5] - 3, 0, G.row['C'] - 2], scale: 0.7 },
  { position: [G.col[5] + 8, 0, G.row['D'] + 5], scale: 0.6 },
  { position: [G.col[6] - 5, 0, G.row['A'] + 6], scale: 0.8 },
  { position: [G.col[6] + 3, 0, G.row['D'] + 5], scale: 0.7 },
  { position: [G.col[1] - 2, 0, G.row['B'] + 6], scale: 0.6 },
  { position: [G.col[1] + 8, 0, G.row['D'] + 5], scale: 0.5 },
  { position: [G.col[3] + 2, 0, G.row['C'] - 3], scale: 0.7 },
  { position: [G.col[4] - 5, 0, G.row['C'] + 5], scale: 0.6 },
  { position: [G.col[2] + 5, 0, G.row['D'] - 2], scale: 0.8 },
  { position: [G.col[6] + 6, 0, G.row['B'] + 5], scale: 0.7 },
];

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
      if (r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q) || r.department.toLowerCase().includes(q)) {
        results.push({ building: b, room: r });
      }
    });
  });
  return results;
}

export function getDirections(from: string | null, to: Building): string[] {
  const fromBuilding = from ? buildings.find((b) => b.id === from) : null;
  const steps: string[] = [];
  if (fromBuilding) {
    const dx = to.position[0] - fromBuilding.position[0];
    const dz = to.position[2] - fromBuilding.position[2];
    if (Math.abs(dx) > Math.abs(dz)) {
      steps.push(dx > 0 ? 'Camina hacia el este por las calles internas' : 'Camina hacia el oeste por las calles internas');
    } else {
      steps.push(dz > 0 ? 'Camina hacia el sur' : 'Camina hacia el norte');
    }
  } else {
    steps.push('Ubícuate en el campus (Unidad Regional Centro)');
  }
  if (to.street) {
    steps.push(`Busca en ${to.street}`);
  }
  if (to.landmark) {
    steps.push(`Cerca de: ${to.landmark}`);
  }
  steps.push(`Edificio ${to.id}: ${to.name}`);
  if (to.floors > 1) {
    steps.push(`Tiene ${to.floors} pisos. Selecciona el piso deseado para ver salones.`);
  }
  steps.push(`Salón destino identificado. ¡Buena suerte!`);
  return steps;
}
