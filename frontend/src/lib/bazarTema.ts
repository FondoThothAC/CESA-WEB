// ==============================================================================
// MOTOR DE TEMAS DEL BAZAR EMPRENDEDOR — CESA UNISON v8.0
// ==============================================================================
// 1. Paleta por calendario: Septiembre Patrio, Octubre Rosa, Halloween,
//    Día de Muertos, Revolución, Navidad, Febrero del Amor y tema
//    institucional CESA el resto del año.
// 2. Modo DÍA (tema claro diurno, legible contra luz del sol) y NOCHE
//    (oscuro elegante). Automático por hora 07:00–18:59 con override manual.
// 3. Override de edición en el panel admin (localStorage bazar_tema_override).
// 4. Bus de eventos en tiempo real (SSE) + mensajes de notificación.
// ==============================================================================

import { useEffect, useMemo, useRef, useState } from 'react';

export type ModoBazar = 'dia' | 'noche';

export interface ColoresBazar {
  // UI
  card: string;
  card2: string;
  border: string;
  text: string;
  muted: string;
  faint: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  accent2: string;
  inputBg: string;
  inputBorder: string;
  canvasOuter: string;
  // Mapa esquemático
  mapCard: string;
  mapSand: string;
  mapCampus: string;
  mapPasillo: string;
  mapRotondaInner: string;
  mapRing: string;
  mapLabelBg: string;
  mapLabelBorder: string;
  mapLabelText: string;
  mapAxis: string;
  legendBg: string;
  legendText: string;
}

export interface PaletaTema {
  id: string;
  nombre: string;
  emoji: string;
  desde: string | null; // 'MM-DD' inclusive, null = tema base del resto del año
  hasta: string | null;
  dia: Partial<ColoresBazar>;
  noche: Partial<ColoresBazar>;
}

// ---------------------------------------------------------------------------
// Bases por modo (tema institucional CESA)
// ---------------------------------------------------------------------------

const BASE_DIA: ColoresBazar = {
  card: 'rgba(255, 255, 255, 0.95)',
  card2: 'rgba(246, 242, 235, 0.92)',
  border: 'rgba(0, 33, 71, 0.12)',
  text: '#002147',
  muted: '#5b6b7d',
  faint: 'rgba(0, 33, 71, 0.40)',
  accent: '#b08845',
  accentSoft: 'rgba(197, 160, 89, 0.14)',
  accentBorder: 'rgba(176, 136, 69, 0.38)',
  accent2: '#002147',
  inputBg: 'rgba(255, 255, 255, 0.75)',
  inputBorder: 'rgba(0, 33, 71, 0.15)',
  canvasOuter: '#efe6d8',
  // Mapa (beige natural bajo el sol real)
  mapCard: '#efe6d8',
  mapSand: '#f4eae1',
  mapCampus: '#c5d3cd',
  mapPasillo: '#e8dcd0',
  mapRotondaInner: '#e28f83',
  mapRing: '#002147',
  mapLabelBg: '#f4eae1',
  mapLabelBorder: 'rgba(146, 64, 14, 0.18)',
  mapLabelText: '#002147',
  mapAxis: 'rgba(0, 33, 71, 0.40)',
  legendBg: 'rgba(255, 255, 255, 0.92)',
  legendText: '#002147',
};

const BASE_NOCHE: ColoresBazar = {
  card: 'rgba(11, 17, 32, 0.88)',
  card2: 'rgba(2, 6, 23, 0.60)',
  border: 'rgba(255, 255, 255, 0.10)',
  text: '#f1f5f9',
  muted: '#94a3b8',
  faint: 'rgba(241, 245, 249, 0.30)',
  accent: '#d4b57a',
  accentSoft: 'rgba(212, 181, 122, 0.12)',
  accentBorder: 'rgba(212, 181, 122, 0.32)',
  accent2: '#818cf8',
  inputBg: 'rgba(0, 0, 0, 0.40)',
  inputBorder: 'rgba(255, 255, 255, 0.08)',
  canvasOuter: '#121720',
  mapCard: '#121720',
  mapSand: '#2b2621',
  mapCampus: '#2e3a48',
  mapPasillo: '#3a3129',
  mapRotondaInner: '#7c2d33',
  mapRing: '#d4b57a',
  mapLabelBg: '#2b2621',
  mapLabelBorder: 'rgba(212, 181, 122, 0.25)',
  mapLabelText: '#f4eae1',
  mapAxis: 'rgba(241, 245, 249, 0.25)',
  legendBg: 'rgba(11, 17, 32, 0.92)',
  legendText: '#e2e8f0',
};

// ---------------------------------------------------------------------------
// Catálogo de temas por fecha (formato MM-DD, inclusivo)
// ---------------------------------------------------------------------------

export const PALETAS: PaletaTema[] = [
  {
    id: 'institucional',
    nombre: 'Institucional CESA',
    emoji: '🦉',
    desde: null,
    hasta: null,
    dia: {},
    noche: {},
  },
  {
    id: 'patrio',
    nombre: 'Septiembre Mesa',
    emoji: '🇲🇽',
    desde: '09-01',
    hasta: '09-17',
    dia: {
      accent: '#006847',
      accentSoft: 'rgba(0, 104, 71, 0.10)',
      accentBorder: 'rgba(0, 104, 71, 0.35)',
      accent2: '#ce1126',
      mapCampus: '#bcd8c2',
      mapRotondaInner: '#ce1126',
      mapRing: '#006847',
    },
    noche: {
      accent: '#3ecf8e',
      accentSoft: 'rgba(62, 207, 142, 0.10)',
      accentBorder: 'rgba(62, 207, 142, 0.30)',
      accent2: '#ef4444',
      mapCampus: '#233c33',
      mapPasillo: '#3a2a1f',
      mapRotondaInner: '#8c1d24',
      mapRing: '#3ecf8e',
    },
  },
  {
    id: 'octubre_rosa',
    nombre: 'Octubre Rosa',
    emoji: '🎀',
    desde: '10-01',
    hasta: '10-15',
    dia: {
      accent: '#d6336c',
      accentSoft: 'rgba(214, 51, 108, 0.10)',
      accentBorder: 'rgba(214, 51, 108, 0.35)',
      accent2: '#002147',
      mapCampus: '#e8c9d2',
      mapRotondaInner: '#d6336c',
      mapRing: '#7d2a48',
    },
    noche: {
      accent: '#f27ba0',
      accentSoft: 'rgba(242, 123, 160, 0.10)',
      accentBorder: 'rgba(242, 123, 160, 0.30)',
      accent2: '#fecdd3',
      mapCampus: '#3a2630',
      mapPasillo: '#3a2f2a',
      mapRotondaInner: '#a23058',
      mapRing: '#f27ba0',
    },
  },
  {
    id: 'halloween',
    nombre: 'Halloween',
    emoji: '🎃',
    desde: '10-16',
    hasta: '10-25',
    dia: {
      accent: '#ea7317',
      accentSoft: 'rgba(234, 115, 23, 0.12)',
      accentBorder: 'rgba(234, 115, 23, 0.38)',
      accent2: '#6d28d9',
      mapCampus: '#e3d8c2',
      mapRotondaInner: '#ea7317',
      mapRing: '#4c1d95',
    },
    noche: {
      accent: '#f97316',
      accentSoft: 'rgba(249, 115, 22, 0.12)',
      accentBorder: 'rgba(249, 115, 22, 0.32)',
      accent2: '#a78bfa',
      mapCard: '#1c1226',
      canvasOuter: '#1c1226',
      mapSand: '#372213',
      mapCampus: '#2b1b38',
      mapPasillo: '#452615',
      mapRotondaInner: '#c2410c',
      mapRing: '#f97316',
      mapLabelBg: '#372213',
      mapLabelText: '#fed7aa',
    },
  },
  {
    id: 'muertos',
    nombre: 'Día de Muertos',
    emoji: '🕯️',
    desde: '10-26',
    hasta: '11-02',
    dia: {
      accent: '#c2410c',
      accentSoft: 'rgba(194, 65, 12, 0.12)',
      accentBorder: 'rgba(194, 65, 12, 0.38)',
      accent2: '#7c3aed',
      mapCampus: '#e6d6bd',
      mapRotondaInner: '#c2410c',
      mapRing: '#4c1d95',
    },
    noche: {
      accent: '#fb923c',
      accentSoft: 'rgba(251, 146, 60, 0.12)',
      accentBorder: 'rgba(251, 146, 60, 0.32)',
      accent2: '#c084fc',
      mapCard: '#191023',
      canvasOuter: '#191023',
      mapSand: '#33210f',
      mapCampus: '#312045',
      mapPasillo: '#4a2408',
      mapRotondaInner: '#ea580c',
      mapRing: '#c084fc',
      mapLabelBg: '#33210f',
      mapLabelText: '#fdba74',
    },
  },
  {
    id: 'revolucion',
    nombre: 'Revolución Mexicana',
    emoji: '🎖️',
    desde: '11-18',
    hasta: '11-21',
    dia: {
      accent: '#006847',
      accentSoft: 'rgba(0, 104, 71, 0.10)',
      accentBorder: 'rgba(0, 104, 71, 0.35)',
      accent2: '#ce1126',
      mapRotondaInner: '#ce1126',
      mapRing: '#006847',
    },
    noche: {
      accent: '#3ecf8e',
      accent2: '#ef4444',
      mapRotondaInner: '#8c1d24',
      mapRing: '#3ecf8e',
    },
  },
  {
    id: 'navidad',
    nombre: 'Navidad CESA',
    emoji: '🎄',
    desde: '12-10',
    hasta: '01-06',
    dia: {
      accent: '#15803d',
      accentSoft: 'rgba(21, 128, 61, 0.10)',
      accentBorder: 'rgba(21, 128, 61, 0.35)',
      accent2: '#dc2626',
      mapCampus: '#c7dccb',
      mapRotondaInner: '#dc2626',
      mapRing: '#166534',
    },
    noche: {
      accent: '#4ade80',
      accentSoft: 'rgba(74, 222, 128, 0.10)',
      accentBorder: 'rgba(74, 222, 128, 0.30)',
      accent2: '#f87171',
      mapSand: '#1f2a22',
      mapCampus: '#1f3729',
      mapPasillo: '#242d2a',
      mapRotondaInner: '#991b1b',
      mapRing: '#4ade80',
      mapLabelBg: '#1f2a22',
      mapLabelText: '#bbf7d0',
    },
  },
  {
    id: 'amor',
    nombre: 'Febrero del Amor',
    emoji: '💗',
    desde: '02-12',
    hasta: '02-16',
    dia: {
      accent: '#e11d48',
      accentSoft: 'rgba(225, 29, 72, 0.10)',
      accentBorder: 'rgba(225, 29, 72, 0.35)',
      accent2: '#002147',
      mapCampus: '#e8cdd5',
      mapRotondaInner: '#e11d48',
      mapRing: '#881337',
    },
    noche: {
      accent: '#fb7185',
      accentSoft: 'rgba(251, 113, 133, 0.10)',
      accentBorder: 'rgba(251, 113, 133, 0.30)',
      accent2: '#fda4af',
      mapCampus: '#3b2530',
      mapRotondaInner: '#be123c',
      mapRing: '#fb7185',
    },
  },
];

// ---------------------------------------------------------------------------
// Resolución de tema activo
// ---------------------------------------------------------------------------

const KEY_OVERRIDE = 'bazar_tema_override';
const KEY_MODO = 'bazar_modo';

export function leerOverrideTema(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(KEY_OVERRIDE) || null;
}

export function guardarOverrideTema(id: string | null): void {
  if (typeof window === 'undefined') return;
  if (id) window.localStorage.setItem(KEY_OVERRIDE, id);
  else window.localStorage.removeItem(KEY_OVERRIDE);
}

export function leerModoGuardado(): ModoBazar | 'auto' {
  if (typeof window === 'undefined') return 'auto';
  const v = window.localStorage.getItem(KEY_MODO);
  return v === 'dia' || v === 'noche' ? v : 'auto';
}

export function guardarModoBazar(m: ModoBazar | 'auto'): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY_MODO, m);
}

/** Modo automático: el Bazar se disfruta a la luz del día. Del atardecer, luces de feria. */
export function modoPorHora(fecha = new Date()): ModoBazar {
  const h = fecha.getHours();
  return h >= 7 && h < 19 ? 'dia' : 'noche';
}

export function paletaEstacional(fecha = new Date()): PaletaTema {
  const override = leerOverrideTema();
  if (override) {
    const manual = PALETAS.find((p) => p.id === override);
    if (manual) return manual;
  }
  const mm = String(fecha.getMonth() + 1).padStart(2, '0');
  const dd = String(fecha.getDate()).padStart(2, '0');
  const clave = `${mm}-${dd}`;

  // Ordena rangos para que rangos largos no tapen específicos
  const candidatos = PALETAS.filter((p) => p.desde && p.hasta);
  for (const p of candidatos) {
    const { desde, hasta } = p;
    if (desde && hasta) {
      if (desde <= hasta) {
        if (clave >= desde && clave <= hasta) return p;
      } else {
        // Rango que cruza el año (ej. Navidad 12-10 → 01-06)
        if (clave >= desde || clave <= hasta) return p;
      }
    }
  }
  return PALETAS[0]; // Institucional
}

export function resolverColores(paleta: PaletaTema, modo: ModoBazar): ColoresBazar {
  const base = modo === 'dia' ? BASE_DIA : BASE_NOCHE;
  return { ...base, ...(modo === 'dia' ? paleta.dia : paleta.noche) };
}

/** Vars CSS listas para aplicar en el wrapper del Bazar */
export function varsCss(colores: ColoresBazar): Record<string, string> {
  return {
    '--b-card': colores.card,
    '--b-card2': colores.card2,
    '--b-border': colores.border,
    '--b-text': colores.text,
    '--b-muted': colores.muted,
    '--b-faint': colores.faint,
    '--b-accent': colores.accent,
    '--b-accent-soft': colores.accentSoft,
    '--b-accent-border': colores.accentBorder,
    '--b-accent2': colores.accent2,
    '--b-input-bg': colores.inputBg,
    '--b-input-border': colores.inputBorder,
    '--b-canvas': colores.canvasOuter,
    '--b-map-card': colores.mapCard,
    '--b-map-sand': colores.mapSand,
    '--b-map-campus': colores.mapCampus,
    '--b-map-pasillo': colores.mapPasillo,
    '--b-map-rotonda': colores.mapRotondaInner,
    '--b-map-ring': colores.mapRing,
    '--b-map-label-bg': colores.mapLabelBg,
    '--b-map-label-border': colores.mapLabelBorder,
    '--b-map-label-text': colores.mapLabelText,
    '--b-map-axis': colores.mapAxis,
    '--b-legend-bg': colores.legendBg,
    '--b-legend-text': colores.legendText,
  };
}

// ---------------------------------------------------------------------------
// Hook principal (solo cliente)
// ---------------------------------------------------------------------------

export interface BazarTemaActivo {
  paleta: PaletaTema;
  colores: ColoresBazar;
  modo: ModoBazar;
  autoModo: boolean;
  vars: Record<string, string>;
  setModo: (m: ModoBazar | 'auto') => void;
  setTema: (id: string | null) => void;
  listaTemas: { id: string; nombre: string; emoji: string }[];
}

export function useBazarTema(): BazarTemaActivo {
  const [modoGuardado, setModoGuardadoState] = useState<ModoBazar | 'auto'>('auto');
  const [override, setOverrideState] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    setModoGuardadoState(leerModoGuardado());
    setOverrideState(leerOverrideTema());
    setListo(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY_OVERRIDE) setOverrideState(leerOverrideTema());
      if (e.key === KEY_MODO) setModoGuardadoState(leerModoGuardado());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const [modoReal, setModoReal] = useState<ModoBazar>('noche');
  useEffect(() => {
    const tick = () => setModoReal(modoGuardado === 'auto' ? modoPorHora() : modoGuardado);
    tick();
    const t = setInterval(tick, 60000);
    return () => clearInterval(t);
  }, [modoGuardado]);

  const paleta = useMemo(() => {
    const manual = listo ? PALETAS.find((p) => p.id === override) : undefined;
    return manual || paletaEstacional();
  }, [override, listo]);
  const colores = useMemo(() => resolverColores(paleta, modoReal), [paleta, modoReal]);
  const vars = useMemo(() => varsCss(colores), [colores]);

  const setModo = (m: ModoBazar | 'auto') => {
    guardarModoBazar(m);
    setModoGuardadoState(m);
  };
  const setTema = (id: string | null) => {
    guardarOverrideTema(id);
    setOverrideState(id);
  };

  return {
    paleta,
    colores,
    modo: modoReal,
    autoModo: modoGuardado === 'auto',
    vars,
    setModo,
    setTema,
    listaTemas: PALETAS.map((p) => ({ id: p.id, nombre: p.nombre, emoji: p.emoji })),
  };
}

// ---------------------------------------------------------------------------
// JSON del bus SSE → texto de notificación
// ---------------------------------------------------------------------------

export interface BazarEventoBus {
  id: number;
  tipo: string;
  payload: Record<string, unknown>;
}

export const iconoEventoBazar = (tipo: string): string => {
  switch (tipo) {
    case 'reserva_creada': return '🏪';
    case 'reserva_aprobada': return '✅';
    case 'reserva_rechazada': return '🚫';
    case 'puesto_asignado': return '📍';
    case 'puesto_liberado': return '🕳️';
    case 'edicion_creada': return '🆕';
    case 'edicion_archivada': return '🗄️';
    case 'voto_registrado': return '⚡';
    case 'producto_agregado': return '🛒';
    case 'logo_actualizado': return '🖼️';
    case 'poll': return ''; // silencioso
    default: return '✨';
  }
};

export const textoEventoBazar = (ev: BazarEventoBus): string | null => {
  const p = ev.payload || {};
  const negocio = (p.sms as string) || (p.nombre_negocio as string) || '';
  switch (ev.tipo) {
    case 'poll': return null;
    case 'voto_registrado': return null; // no notificamos karma individual
    case 'reserva_creada': return negocio || 'Nuevo puesto reservado en la Calle de la Cultura';
    case 'reserva_aprobada': return negocio || 'Un negocio fue validado';
    case 'reserva_rechazada': return 'Una reserva fue rechazada';
    case 'puesto_asignado': return negocio || 'Movieron un puesto';
    case 'puesto_liberado': return `Se liberó el puesto #${p.puesto_id ?? ''}`;
    case 'edicion_creada': return `Nueva edición: ${p.nombre ?? ''}`;
    case 'edicion_archivada': return 'Una edición pasó al archivo histórico';
    case 'producto_agregado': return `${p.nombre ?? 'Un producto'} fue publicado en el marketplace`;
    case 'logo_actualizado': return 'Un puesto actualizó su logo';
    default: return null;
  }
};

/** URL del stream SSE: deriva /api → /api/v1, o toma NEXT_PUBLIC_STREAM_URL */
export function obtenerStreamUrl(apiUrl: string): string {
  const custom = process.env.NEXT_PUBLIC_STREAM_URL;
  if (custom) return custom;
  const raiz = apiUrl.replace(/\/api\/?$/, '');
  return `${raiz}/api/v1/bazar/events/stream`;
}

// ---------------------------------------------------------------------------
// Hook de STREAM EN TIEMPO REAL (SSE + fallback de polling cada 30 s)
// ---------------------------------------------------------------------------

export type EstadoStream = 'conectando' | 'vivo' | 'polling';

/**
 * Se suscribe al bus SSE del Bazar. Si el stream muere o el proxy de nginx
 * bloquea SSE, cae automáticamente a polling silencioso cada 30 s.
 * onEvento se invoca con: { id, tipo, payload } o { id: 0, tipo: 'poll' }.
 */
export function useBazarStream(
  apiUrl: string,
  onEvento: (ev: BazarEventoBus) => void,
  activo = true,
): EstadoStream {
  const [estado, setEstado] = useState<EstadoStream>('conectando');
  const cbRef = useRef(onEvento);
  cbRef.current = onEvento;

  useEffect(() => {
    if (!activo) return;
    let es: EventSource | null = null;
    let poll: ReturnType<typeof setInterval> | null = null;
    let cancelado = false;

    const pararPolling = () => {
      if (poll) { clearInterval(poll); poll = null; }
    };
    const iniciarPolling = () => {
      if (poll || cancelado) return;
      setEstado('polling');
      poll = setInterval(() => cbRef.current({ id: 0, tipo: 'poll', payload: {} }), 30000);
    };

    try {
      es = new EventSource(obtenerStreamUrl(apiUrl));
      es.addEventListener('hello', () => { pararPolling(); setEstado('vivo'); });
      es.addEventListener('bazar', (ev) => {
        try {
          const data = JSON.parse((ev as MessageEvent).data) as BazarEventoBus;
          cbRef.current(data);
        } catch { /* payload corrupto: se descarta */ }
      });
      es.addEventListener('lagged', () => cbRef.current({ id: -1, tipo: 'poll', payload: {} }));
      es.onerror = () => iniciarPolling();
    } catch {
      iniciarPolling();
    }

    return () => {
      cancelado = true;
      pararPolling();
      es?.close();
    };
  }, [apiUrl, activo]);

  return estado;
}
