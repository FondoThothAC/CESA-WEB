// ============================================================
// campusData.ts — Datos del Campus Universitario UNISON
// Posiciones re-calibradas según plano oficial LAMINA-HERMOSILLO
// Escala: plano 3D = 90x55 unidades (Norte-Sur × Este-Oeste)
// El campus ocupa ~2.5 km² real → ~90x55 unidades 3D
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
  // Nuevos campos de información del edificio
  phone?: string;
  hours?: string;
  description?: string;
  image?: string;
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

// Nodos de caminos peatonales para wayfinding
// Cada nodo tiene [x, z] y conexiones hacia otros índices de nodo
export interface WaypointNode {
  id: string;
  position: [number, number]; // [x, z] en espacio 3D
  connections: string[];      // IDs de nodos conectados
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
// EDIFICIOS — Posiciones corregidas según plano real UNISON
// Ejes: X = Este(+) / Oeste(-), Z = Sur(+) / Norte(-)
// Centro del campus = [0, 0, 0] ≈ Plaza Central
// Calles reales:
//   Blvd. Navarrete → Z ≈ +22
//   Blvd. Luis Encinas → Z ≈ +8
//   Av. Colosio → Z ≈ -12
//   Calle de la Reforma → X ≈ -2 (sur del campus)
// ============================================================

export const buildings: Building[] = [

  // ═══════════════════════════════════════════════
  // ZONA NORTE (Blvd. Navarrete — Blvd. Luis Encinas)
  // ═══════════════════════════════════════════════

  {
    id: '1-A',
    section: 1,
    letter: 'A',
    name: 'Museo de la Universidad de Sonora',
    floors: 2,
    position: [-18, 0, 18],
    size: [5, 4],
    shape: 'U',
    rotation: 0,
    departments: ['Museo Universitario', 'Difusión Cultural'],
    rooms: [],
    street: 'Blvd. Luis Encinas Johnson',
    landmark: 'Frente al Estadio Hodggers',
    phone: '(662) 259-2100',
    hours: 'Lun–Vie: 9:00–18:00 | Sáb: 10:00–14:00',
    description: 'Espacio cultural y de memoria histórica de la Universidad de Sonora.',
  },
  {
    id: '1-B',
    section: 1,
    letter: 'B',
    name: 'Rectoría',
    floors: 5,
    position: [-5, 0, 16],
    size: [5, 6],
    shape: 'complex',
    departments: ['Rectoría', 'Administración Central', 'Dirección General'],
    rooms: [],
    color: '#fde600',
    street: 'Blvd. Luis Encinas Johnson',
    landmark: 'Edificio principal del campus',
    phone: '(662) 259-2100',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Sede de la Rectoría y administración central de la Universidad de Sonora.',
  },
  {
    id: '7-H',
    section: 7,
    letter: 'H',
    name: 'Enfermería y Nutrición',
    floors: 2,
    position: [-22, 0, 16],
    size: [2, 4],
    shape: 'rect',
    departments: ['Enfermería', 'Nutrición'],
    rooms: [],
    street: 'Blvd. Luis Encinas Johnson',
    phone: '(662) 259-2183',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Departamento de Enfermería y Licenciatura en Nutrición.',
  },
  {
    id: '3-N',
    section: 3,
    letter: 'N',
    name: 'Comedor Universitario',
    floors: 1,
    position: [5, 0, 17],
    size: [6, 3],
    shape: 'rect',
    departments: ['Comedor Universitario'],
    rooms: [],
    street: 'Blvd. Luis Encinas Johnson',
    landmark: 'Centro del campus norte',
    phone: '(662) 259-2100',
    hours: 'Lun–Vie: 7:00–20:00 | Sáb: 8:00–14:00',
    description: 'Servicio de alimentación para la comunidad universitaria.',
  },
  {
    id: '3-H',
    section: 3,
    letter: 'H',
    name: 'Arquitectura y Música',
    floors: 2,
    position: [16, 0, 17],
    size: [4, 3],
    shape: 'rect',
    departments: ['Arquitectura', 'Música'],
    rooms: [],
    street: 'Blvd. Luis Encinas Johnson',
    phone: '(662) 259-2293',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'División de Humanidades y Bellas Artes — Arquitectura y Artes Musicales.',
  },
  {
    id: '3-K',
    section: 3,
    letter: 'K',
    name: 'Talleres de Bellas Artes',
    floors: 1,
    position: [22, 0, 17],
    size: [3, 3],
    shape: 'rect',
    departments: ['Bellas Artes', 'Diseño Gráfico'],
    rooms: [],
    street: 'Blvd. Luis Encinas Johnson',
    phone: '(662) 259-2293',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Talleres prácticos del Departamento de Bellas Artes.',
  },

  // ═══════════════════════════════════════════════
  // ZONA CENTRO — Núcleo histórico del campus
  // ═══════════════════════════════════════════════

  {
    id: '2-A',
    section: 2,
    letter: 'A',
    name: 'Edificio Principal — Rectoría Histórica',
    floors: 5,
    position: [-2, 0, 8],
    size: [5, 7],
    shape: 'complex',
    departments: ['Rectoría', 'Administración Central'],
    rooms: [],
    color: '#fde600',
    street: 'Blvd. Luis Encinas Johnson',
    landmark: 'Edificio icónico del campus, centro histórico',
    phone: '(662) 259-2100',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Edificio principal histórico de 5 pisos, referencia central del campus UNISON.',
  },
  {
    id: '3-B',
    section: 3,
    letter: 'B',
    name: 'Ciencias Sociales y Humanidades',
    floors: 2,
    position: [6, 0, 5],
    size: [3, 6],
    shape: 'rect',
    departments: ['Sociología', 'Ciencias Sociales', 'Humanidades'],
    rooms: [],
    street: 'Blvd. Luis Encinas Johnson',
    phone: '(662) 259-2176',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'División de Ciencias Sociales — Sociología, Historia y disciplinas afines.',
  },
  {
    id: '3-A',
    section: 3,
    letter: 'A',
    name: 'Letras y Lingüística',
    floors: 2,
    position: [11, 0, 5],
    size: [4, 4],
    shape: 'L',
    departments: ['Letras y Lingüística', 'Literatura'],
    rooms: [],
    street: 'Blvd. Luis Encinas Johnson',
    phone: '(662) 259-2277',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Departamento de Letras y Lingüística de la División de Humanidades.',
  },
  {
    id: '3-C',
    section: 3,
    letter: 'C',
    name: 'Aulas Generales y Laboratorios',
    floors: 3,
    position: [-2, 0, 3],
    size: [5, 2],
    shape: 'rect',
    departments: ['Aulas Generales', 'Laboratorios de Idiomas'],
    rooms: [],
    phone: '(662) 259-2100 ext. 5401',
    hours: 'Lun–Vie: 7:00–21:00',
    description: 'Bloque de aulas de uso general con laboratorios de cómputo e idiomas.',
  },
  {
    id: '3-D',
    section: 3,
    letter: 'D',
    name: 'Biblioteca Central — Ernesto Carpizo',
    floors: 3,
    position: [2, 0, 0],
    size: [6, 6],
    shape: 'complex',
    departments: ['Biblioteca Central', 'Hemeroteca', 'Acervo Digital'],
    rooms: [],
    street: 'Campus Central',
    landmark: 'Centro del campus universitario',
    phone: '(662) 259-2112',
    hours: 'Lun–Vie: 7:30–21:00 | Sáb: 8:00–14:00',
    description: 'Principal repositorio bibliográfico de la universidad. Cuenta con más de 200,000 volúmenes físicos y acceso a bases de datos digitales.',
  },
  {
    id: '3-F',
    section: 3,
    letter: 'F',
    name: 'Centro de Cómputo General',
    floors: 1,
    position: [9, 0, 2],
    size: [4, 2],
    shape: 'rect',
    departments: ['Centro de Cómputo', 'Servicios Digitales'],
    rooms: [],
    phone: '(662) 259-2100 ext. 5410',
    hours: 'Lun–Vie: 7:00–21:00',
    description: 'Sala de cómputo general con acceso libre a internet y software especializado.',
  },
  {
    id: '3-E',
    section: 3,
    letter: 'E',
    name: 'Centro de las Artes',
    floors: 2,
    position: [16, 0, 4],
    size: [3, 3],
    shape: 'rect',
    departments: ['Bellas Artes', 'Artes Plásticas', 'Diseño'],
    rooms: [],
    phone: '(662) 259-2293',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Espacio de expresión artística, exposiciones y talleres de artes plásticas.',
  },
  {
    id: '3-G',
    section: 3,
    letter: 'G',
    name: 'Ciencias de la Computación',
    floors: 2,
    position: [-6, 0, 3],
    size: [2, 5],
    shape: 'rect',
    departments: ['Ciencias de la Computación', 'Sistemas de Información'],
    rooms: [],
    phone: '(662) 259-2197',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Departamento de Ciencias de la Computación. Licenciatura en Ciencias de la Computación.',
  },
  {
    id: '3-I',
    section: 3,
    letter: 'I',
    name: 'Física y Matemáticas',
    floors: 3,
    position: [-10, 0, 2],
    size: [3, 3],
    shape: 'rect',
    departments: ['Física', 'Matemáticas'],
    rooms: [],
    phone: '(662) 259-2155',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Departamentos de Física y Matemáticas de la División de Ciencias Exactas y Naturales.',
  },
  {
    id: '13-A',
    section: 13,
    letter: 'A',
    name: 'Lenguas Extranjeras — CUALE',
    floors: 2,
    position: [-10, 0, -3],
    size: [2, 4],
    shape: 'rect',
    departments: ['Centro Universitario de Lenguas Extranjeras'],
    rooms: [],
    street: 'Campus Central',
    phone: '(662) 259-2244',
    hours: 'Lun–Vie: 7:00–21:00',
    description: 'CUALE: Centro de Enseñanza de Lenguas Extranjeras. Cursos de inglés, francés, alemán y otros idiomas.',
  },
  {
    id: '13-B',
    section: 13,
    letter: 'B',
    name: 'Servicios Generales',
    floors: 1,
    position: [10, 0, -2],
    size: [2, 2],
    shape: 'rect',
    departments: ['Servicios Generales', 'Mantenimiento'],
    rooms: [],
    phone: '(662) 259-2100 ext. 5100',
    hours: 'Lun–Vie: 7:00–16:00',
    description: 'Coordinación de Mantenimiento y Servicios Generales del campus.',
  },
  {
    id: '9-I',
    section: 9,
    letter: 'I',
    name: 'Ciencias Económico Administrativas',
    floors: 2,
    position: [16, 0, -1],
    size: [5, 2],
    shape: 'rect',
    departments: ['Contabilidad', 'Administración', 'Economía'],
    rooms: [],
    phone: '(662) 259-2216',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'División de Ciencias Económico Administrativas — Contabilidad, Administración y Economía.',
  },

  // ═══════════════════════════════════════════════
  // ZONA ESTE — Ingenierías
  // ═══════════════════════════════════════════════

  {
    id: '5-A',
    section: 5,
    letter: 'A',
    name: 'Ing. Química y Metalurgia',
    floors: 2,
    position: [28, 0, 8],
    size: [5, 7],
    shape: 'rect',
    departments: ['Ing. Química', 'Ing. en Metalurgia y Ciencias de Materiales'],
    rooms: [],
    street: 'Calle Rosales Norte',
    phone: '(662) 259-2300',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Departamento de Ingeniería Química y Metalurgia — laboratorios especializados.',
  },
  {
    id: '5-B',
    section: 5,
    letter: 'B',
    name: 'Auditorio Rivera Zamudio',
    floors: 5,
    position: [35, 0, 8],
    size: [6, 6],
    shape: 'complex',
    departments: ['Auditorio Rivera Zamudio', 'Oficinas División de Ingenierías'],
    rooms: [],
    color: '#fde600',
    street: 'Calle Rosales Norte',
    landmark: 'Auditorio principal de ingenierías',
    phone: '(662) 259-2300',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Auditorio principal de la División de Ingeniería. Capacidad para 500 personas.',
  },
  {
    id: '5-D',
    section: 5,
    letter: 'D',
    name: 'Ingeniería Industrial',
    floors: 3,
    position: [-2, 0, -5],
    size: [6, 2],
    shape: 'rect',
    departments: ['Ing. Industrial', 'Ing. de Sistemas'],
    rooms: [],
    phone: '(662) 259-2260',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Departamento de Ingeniería Industrial y de Sistemas.',
  },
  {
    id: '5-E',
    section: 5,
    letter: 'E',
    name: 'División de Ingenierías — Aulas',
    floors: 3,
    position: [20, 0, -4],
    size: [3, 2],
    shape: 'rect',
    departments: ['Ing. Civil y Minas', 'Ing. Industrial'],
    rooms: [],
    phone: '(662) 259-2300',
    hours: 'Lun–Vie: 7:00–21:00',
    description: 'Aulas de la División de Ingeniería, uso compartido.',
  },
  {
    id: '5-F',
    section: 5,
    letter: 'F',
    name: 'Ing. Industrial y Ciencias Químico Biológicas',
    floors: 3,
    position: [27, 0, -3],
    size: [4, 2],
    shape: 'rect',
    departments: ['Ing. Industrial', 'Ciencias Químico Biológicas'],
    rooms: [],
    phone: '(662) 259-2300',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Laboratorios y aulas de Ingeniería Industrial y Ciencias Químico Biológicas.',
  },
  {
    id: '5-G',
    section: 5,
    letter: 'G',
    name: 'Ing. Civil y Mecatrónica',
    floors: 3,
    position: [23, 0, -7],
    size: [5, 2],
    shape: 'rect',
    departments: ['Ing. Civil', 'Mecatrónica', 'Electrónica'],
    rooms: [],
    phone: '(662) 259-2265',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Laboratorios de Mecatrónica e Ingeniería Civil.',
  },
  {
    id: '9-C',
    section: 9,
    letter: 'C',
    name: 'Ciencias de la Comunicación',
    floors: 3,
    position: [13, 0, -13],
    size: [3, 2],
    shape: 'rect',
    departments: ['Ciencias de la Comunicación'],
    rooms: [],
    phone: '(662) 259-2229',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Departamento de Ciencias de la Comunicación.',
  },
  {
    id: '9-D',
    section: 9,
    letter: 'D',
    name: 'Ciencias Políticas y Administración Pública',
    floors: 1,
    position: [30, 0, -5],
    size: [3, 3],
    shape: 'rect',
    departments: ['Ciencias Políticas', 'Administración Pública'],
    rooms: [],
    phone: '(662) 259-2221',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Departamento de Ciencias Políticas y Administración Pública.',
  },
  {
    id: '9-E',
    section: 9,
    letter: 'E',
    name: 'Trabajo Social',
    floors: 1,
    position: [30, 0, -14],
    size: [2, 2],
    shape: 'rect',
    departments: ['Trabajo Social'],
    rooms: [],
    phone: '(662) 259-2228',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Departamento de Trabajo Social.',
  },
  {
    id: '9-F',
    section: 9,
    letter: 'F',
    name: 'Sociología',
    floors: 2,
    position: [34, 0, 1],
    size: [3, 2],
    shape: 'rect',
    departments: ['Sociología'],
    rooms: [],
    phone: '(662) 259-2224',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Departamento de Sociología.',
  },
  {
    id: '10-A',
    section: 10,
    letter: 'A',
    name: 'Enfermería y Trabajo Social',
    floors: 2,
    position: [35, 0, -2],
    size: [4, 2],
    shape: 'rect',
    departments: ['Enfermería', 'Trabajo Social'],
    rooms: [],
    phone: '(662) 259-2183',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Departamentos de Enfermería y Trabajo Social.',
  },
  {
    id: '10-B',
    section: 10,
    letter: 'B',
    name: 'Centro de Investigación en Alimentación y Desarrollo',
    floors: 3,
    position: [33, 0, -7],
    size: [3, 4],
    shape: 'rect',
    departments: ['Investigación', 'CIAD'],
    rooms: [],
    phone: '(662) 289-2400',
    hours: 'Lun–Vie: 8:00–18:00',
    description: 'Centro de investigación en alimentación, nutrición y desarrollo.',
  },
  {
    id: '10-C',
    section: 10,
    letter: 'C',
    name: 'Facultad de Derecho',
    floors: 2,
    position: [24, 0, -11],
    size: [5, 2],
    shape: 'rect',
    departments: ['Derecho'],
    rooms: [],
    phone: '(662) 259-2233',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Facultad de Derecho de la Universidad de Sonora.',
  },
  {
    id: '12-A',
    section: 12,
    letter: 'A',
    name: 'Ing. Civil — Jefatura y Laboratorios',
    floors: 3,
    position: [17, 0, -10],
    size: [6, 2],
    shape: 'rect',
    departments: ['Ing. Civil', 'Geotecnia', 'Estructuras'],
    rooms: [],
    phone: '(662) 259-2265',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Jefatura y laboratorios de Ingeniería Civil.',
  },
  {
    id: '12-F',
    section: 12,
    letter: 'F',
    name: 'Biblioteca e Informática Sur',
    floors: 3,
    position: [14, 0, -7],
    size: [4, 2],
    shape: 'rect',
    departments: ['Biblioteca Divisional', 'Laboratorio de Informática'],
    rooms: [],
    phone: '(662) 259-2300 ext. 3100',
    hours: 'Lun–Vie: 7:30–20:00',
    description: 'Biblioteca divisional de Ingenierías y laboratorio de informática.',
  },
  {
    id: '12-G',
    section: 12,
    letter: 'G',
    name: 'Aulas Sur — Ingenierías',
    floors: 1,
    position: [18, 0, -14],
    size: [4, 2],
    shape: 'rect',
    departments: ['Aulas Ingenierías Sur'],
    rooms: [],
    phone: '(662) 259-2300',
    hours: 'Lun–Vie: 7:00–21:00',
    description: 'Bloque de aulas sur de la División de Ingeniería.',
  },

  // ═══════════════════════════════════════════════
  // ZONA OESTE — Ciencias de la Salud
  // ═══════════════════════════════════════════════

  {
    id: '7-A',
    section: 7,
    letter: 'A',
    name: 'Unidad Deportiva y Granja Universitaria',
    floors: 1,
    position: [-25, 0, -8],
    size: [4, 3],
    shape: 'rect',
    departments: ['Granja Universitaria', 'Deportes'],
    rooms: [],
    street: 'Calle Francisco Q. Salazar',
    phone: '(662) 259-2100 ext. 4200',
    hours: 'Lun–Sáb: 6:00–22:00',
    description: 'Granja experimental y unidad deportiva universitaria.',
  },
  {
    id: '7-B',
    section: 7,
    letter: 'B',
    name: 'Farmacia',
    floors: 1,
    position: [-18, 0, -8],
    size: [1, 3],
    shape: 'rect',
    departments: ['Farmacia'],
    rooms: [],
    phone: '(662) 259-2100',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Departamento de Farmacia de la División de Ciencias Biológicas y de la Salud.',
  },
  {
    id: '7-C',
    section: 7,
    letter: 'C',
    name: 'Facultad de Medicina',
    floors: 3,
    position: [-28, 0, -5],
    size: [5, 4],
    shape: 'complex',
    departments: ['Medicina', 'Laboratorios Clínicos', 'Residencias'],
    rooms: [],
    street: 'Calle Francisco Q. Salazar',
    landmark: 'Zona de Salud del campus',
    phone: '(662) 259-2180',
    hours: 'Lun–Vie: 7:00–21:00',
    description: 'Facultad de Medicina con aulas, laboratorios clínicos y área de residencias médicas.',
  },
  {
    id: '7-D',
    section: 7,
    letter: 'D',
    name: 'DICTUS — Deportes y Cultura',
    floors: 3,
    position: [-23, 0, -6],
    size: [4, 2],
    shape: 'rect',
    departments: ['DICTUS', 'Actividades Deportivas', 'Cultura'],
    rooms: [],
    street: 'Calle Francisco Q. Salazar',
    phone: '(662) 259-2194',
    hours: 'Lun–Vie: 8:00–20:00',
    description: 'Dirección de Cultura y Extensión Universitaria — DICTUS.',
  },
  {
    id: '7-K',
    section: 7,
    letter: 'K',
    name: 'Facultad de Odontología',
    floors: 3,
    position: [-19, 0, -5],
    size: [3, 2],
    shape: 'rect',
    departments: ['Odontología', 'Clínica Dental'],
    rooms: [],
    street: 'Campus Salud',
    phone: '(662) 259-2186',
    hours: 'Lun–Vie: 8:00–18:00',
    description: 'Facultad de Odontología con clínica dental abierta a la comunidad.',
  },
  {
    id: '11-A',
    section: 11,
    letter: 'A',
    name: 'Vicerrectoría General',
    floors: 2,
    position: [-13, 0, -12],
    size: [5, 2],
    shape: 'rect',
    departments: ['Vicerrectoría General', 'Seguridad Campus'],
    rooms: [],
    phone: '(662) 259-2101',
    hours: 'Lun–Vie: 8:00–18:00',
    description: 'Oficinas de la Vicerrectoría General y Coordinación de Seguridad del Campus.',
  },
  {
    id: '12-C',
    section: 12,
    letter: 'C',
    name: 'Laboratorios Ciencias de la Salud',
    floors: 1,
    position: [-16, 0, -4],
    size: [2, 2],
    shape: 'rect',
    departments: ['Laboratorios de Salud', 'Biología'],
    rooms: [],
    phone: '(662) 259-2180',
    hours: 'Lun–Vie: 8:00–18:00',
    description: 'Laboratorios especializados de Ciencias de la Salud.',
  },
];

// Autogenerar salones para cada edificio
buildings.forEach((b) => {
  if (b.rooms.length === 0) {
    b.rooms = generateRooms(b);
  }
});

// ============================================================
// CALLES — Polilíneas para renderizado 3D
// ============================================================
export const campusStreets: Street[] = [
  { name: 'Blvd. Navarrete', orientation: 'horizontal', z: 30, width: 60, color: '#555' },
  { name: 'Blvd. Luis Encinas Johnson', orientation: 'horizontal', z: 10, width: 40, color: '#555' },
  { name: 'Av. Luis Donaldo Colosio', orientation: 'horizontal', z: -12, width: 60, color: '#444' },
  { name: 'Calle de la Reforma', orientation: 'vertical', x: 0, width: 45, color: '#555' },
  { name: 'Calle Francisco Q. Salazar', orientation: 'vertical', x: -44, width: 45, color: '#555' },
  { name: 'Calle Rosales', orientation: 'vertical', x: 44, width: 45, color: '#555' },
];

// ============================================================
// ESTACIONAMIENTOS
// ============================================================
export const campusParking: Parking[] = [
  { position: [-20, 0, 13], size: [6, 4], type: 'surface', spots: 20, name: 'EM-101' },
  { position: [-8, 0, 13], size: [7, 4], type: 'surface', spots: 28, name: 'EM-102' },
  { position: [2, 0, 13], size: [5, 3], type: 'surface', spots: 18, name: 'EM-103' },
  { position: [28, 0, 14], size: [5, 4], type: 'surface', spots: 16, name: 'EM-104' },
  { position: [38, 0, -1], size: [5, 5], type: 'surface', spots: 24, name: 'EM-105' },
  { position: [30, 0, -11], size: [4, 4], type: 'surface', spots: 14, name: 'EM-106' },
  { position: [-8, 0, -9], size: [4, 4], type: 'surface', spots: 12, name: 'EM-107' },
  { position: [-33, 0, 5], size: [5, 8], type: 'surface', spots: 32, name: 'EM-108' },
];

// ============================================================
// ÁRBOLES
// ============================================================
export const campusTrees: Tree[] = [
  // Zona norte — jardines
  { position: [-10, 0, 12], scale: 0.9 },
  { position: [-14, 0, 14], scale: 0.7 },
  { position: [-6, 0, 13], scale: 0.8 },
  { position: [0, 0, 14], scale: 0.6 },
  { position: [10, 0, 14], scale: 0.7 },
  { position: [20, 0, 13], scale: 0.8 },
  { position: [25, 0, 14], scale: 0.6 },
  // Centro — plazas
  { position: [-4, 0, 7], scale: 0.7 },
  { position: [4, 0, 7], scale: 0.8 },
  { position: [14, 0, 7], scale: 0.6 },
  { position: [-12, 0, 6], scale: 0.9 },
  // Zona oeste — salud
  { position: [-20, 0, -1], scale: 0.7 },
  { position: [-16, 0, 0], scale: 0.6 },
  { position: [-22, 0, 3], scale: 0.8 },
  // Zona este — ingenierías
  { position: [18, 0, -1], scale: 0.6 },
  { position: [24, 0, 2], scale: 0.7 },
  { position: [32, 0, 4], scale: 0.8 },
  // Bordes perimetrales
  { position: [-35, 0, 15], scale: 1.0 },
  { position: [-35, 0, 5], scale: 0.9 },
  { position: [-35, 0, -5], scale: 1.1 },
  { position: [40, 0, 15], scale: 0.9 },
  { position: [40, 0, 5], scale: 1.0 },
];

// ============================================================
// HITOS / LANDMARKS
// ============================================================
export const campusLandmarks = [
  {
    name: 'Estadio Hodggers',
    position: [-33, 0, 15] as [number, number, number],
    type: 'stadium' as const,
    size: 6,
  },
  {
    name: 'Estadio Castro Servín',
    position: [-5, 0, -16] as [number, number, number],
    type: 'stadium' as const,
    size: 5,
  },
  {
    name: 'Plaza del Estudiante',
    position: [2, 0, 10] as [number, number, number],
    type: 'plaza' as const,
    size: 4,
  },
  {
    name: 'Gimnasio Universitario',
    position: [-30, 0, 20] as [number, number, number],
    type: 'gym' as const,
    size: 4,
  },
];

// ============================================================
// NODOS DE CAMINOS PEATONALES — Para wayfinding visual
// Cada nodo tiene posición [x, z] y conexiones (IDs de nodos vecinos)
// Siguen los pasillos y aceras reales del campus
// ============================================================
export const campusWaypoints: WaypointNode[] = [
  // --- Eje horizontal norte (Blvd. Luis Encinas, Z≈10) ---
  { id: 'N-W1', position: [-30, 10], connections: ['N-W2', 'CW-L'] },
  { id: 'N-W2', position: [-20, 10], connections: ['N-W1', 'N-W3', 'W-N1'] },
  { id: 'N-W3', position: [-10, 10], connections: ['N-W2', 'N-W4', 'C-N1'] },
  { id: 'N-W4', position: [0, 10], connections: ['N-W3', 'N-W5', 'C-N2'] },
  { id: 'N-W5', position: [10, 10], connections: ['N-W4', 'N-W6', 'C-N3'] },
  { id: 'N-W6', position: [20, 10], connections: ['N-W5', 'N-W7', 'E-N1'] },
  { id: 'N-W7', position: [30, 10], connections: ['N-W6', 'N-E1', 'E-N2'] },
  { id: 'N-E1', position: [40, 10], connections: ['N-W7'] },

  // --- Eje horizontal centro (Z≈0) ---
  { id: 'C-W1', position: [-25, 0], connections: ['C-W2', 'W-C1'] },
  { id: 'C-W2', position: [-15, 0], connections: ['C-W1', 'C-W3', 'W-C2'] },
  { id: 'C-W3', position: [-8, 0], connections: ['C-W2', 'C-W4'] },
  { id: 'C-W4', position: [0, 0], connections: ['C-W3', 'C-E1', 'C-N2'] },
  { id: 'C-E1', position: [8, 0], connections: ['C-W4', 'C-E2'] },
  { id: 'C-E2', position: [16, 0], connections: ['C-E1', 'C-E3', 'E-C1'] },
  { id: 'C-E3', position: [24, 0], connections: ['C-E2', 'C-E4'] },
  { id: 'C-E4', position: [32, 0], connections: ['C-E3', 'E-C2'] },

  // --- Eje horizontal sur (Av. Colosio, Z≈-12) ---
  { id: 'S-W1', position: [-20, -12], connections: ['S-W2', 'W-S1'] },
  { id: 'S-W2', position: [-10, -12], connections: ['S-W1', 'S-C'] },
  { id: 'S-C', position: [0, -12], connections: ['S-W2', 'S-E1', 'C-N2'] },
  { id: 'S-E1', position: [12, -12], connections: ['S-C', 'S-E2'] },
  { id: 'S-E2', position: [22, -12], connections: ['S-E1', 'S-E3'] },
  { id: 'S-E3', position: [32, -12], connections: ['S-E2'] },

  // --- Eje vertical oeste (X≈-15) ---
  { id: 'W-N1', position: [-15, 10], connections: ['N-W3', 'W-C1'] },
  { id: 'W-C1', position: [-15, 0], connections: ['W-N1', 'C-W2', 'W-C2', 'W-S1'] },
  { id: 'W-C2', position: [-15, -6], connections: ['W-C1', 'W-S1', 'C-W2'] },
  { id: 'W-S1', position: [-15, -12], connections: ['W-C2', 'S-W1'] },

  // --- Eje vertical central (X≈0) ---
  { id: 'C-N1', position: [0, 10], connections: ['N-W4', 'C-N2'] },
  { id: 'C-N2', position: [0, 0], connections: ['C-N1', 'C-W4', 'C-E1', 'S-C'] },

  // --- Eje vertical este (X≈20) ---
  { id: 'E-N1', position: [20, 10], connections: ['N-W6', 'E-C1'] },
  { id: 'E-N2', position: [30, 10], connections: ['N-W7', 'E-C2'] },
  { id: 'E-C1', position: [20, 0], connections: ['E-N1', 'C-E2', 'E-C2'] },
  { id: 'E-C2', position: [30, 0], connections: ['E-C1', 'C-E4', 'E-N2'] },

  // --- Conexión Estadio lado izquierdo ---
  { id: 'CW-L', position: [-30, 18], connections: ['N-W1'] },
];

// ============================================================
// BÚSQUEDA DE EDIFICIOS
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
// WAYFINDING — Encuentra ruta entre dos puntos usando waypoints
// ============================================================

/**
 * Encuentra el waypoint más cercano a una posición [x, z] dada.
 */
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

/**
 * BFS para encontrar la ruta más corta entre dos nodos de waypoints.
 * Retorna array de posiciones [x, z] que forman el camino.
 */
export function findWaypointPath(
  startId: string,
  endId: string
): [number, number][] {
  const nodeMap = new Map<string, WaypointNode>();
  for (const node of campusWaypoints) {
    nodeMap.set(node.id, node);
  }

  if (!nodeMap.has(startId) || !nodeMap.has(endId)) return [];
  if (startId === endId) {
    const node = nodeMap.get(startId)!;
    return [node.position];
  }

  // BFS
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

/**
 * Genera instrucciones de texto para la ruta entre dos edificios.
 */
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
    steps.push(`📏 Distancia aproximada: ${Math.round(distEstimate * 12)} metros`);
  } else {
    steps.push('📍 Ubícate en el campus central');
  }
  if (to.street) steps.push(`🏠 Busca en ${to.street}`);
  if (to.landmark) steps.push(`🏛️ Referencia: ${to.landmark}`);
  steps.push(`🏢 Edificio ${to.id}: ${to.name}`);
  if (to.floors > 1) steps.push(`🏗️ Tiene ${to.floors} pisos.`);
  if (to.phone) steps.push(`📞 Tel: ${to.phone}`);
  steps.push('✅ ¡Llegaste a tu destino!');
  return steps;
}
