'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/useAuth';
import BazarSchematicMap from './BazarSchematicMap';
import { QRCodeSVG } from 'qrcode.react';
import {
  useBazarTema,
  useBazarStream,
  iconoEventoBazar,
  textoEventoBazar,
  type BazarEventoBus,
} from '@/lib/bazarTema';

interface Producto {
  id: number;
  nombre_negocio: string;
  slug: string;
  descripcion: string;
  categoria: string;
  logo_path?: string | null;
  whatsapp?: string;
  instagram?: string;
  puesto_id?: number | null;
  edicion_id?: number | null;
  ubicacion?: string | null;
  nombre_completo?: string | null;
  dueno?: string | null;
  views: number;
  score: number;
  user_vote: number | null;
  verificado: boolean;
  featured: boolean;
  created_at?: string | null;
}

const CATEGORIAS = [
  { id: 'todas', label: 'Todos', icon: '🛍️' },
  { id: 'comida', label: 'Comida', icon: '🍕' },
  { id: 'productos', label: 'Productos', icon: '📦' },
  { id: 'accesorios', label: 'Accesorios', icon: '💍' },
  { id: 'servicios', label: 'Servicios', icon: '🛠️' },
  { id: 'asesorias', label: 'Asesorías', icon: '🎓' },
  { id: 'tecnologia', label: 'Tech', icon: '💻' },
  { id: 'arte', label: 'Arte/Diseño', icon: '🎨' },
];

const estadoReservaColor = (estado: string) => {
  switch (estado) {
    case 'Aprobada': return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/40';
    case 'Rechazada': return 'bg-red-500/15 text-red-500 border-red-500/40';
    default: return 'bg-amber-500/15 text-amber-500 border-amber-500/40';
  }
};

const esNegocioNuevo = (createdAt?: string | null) => {
  if (!createdAt) return false;
  const t = new Date(createdAt.replace(' ', 'T')).getTime();
  if (Number.isNaN(t)) return false;
  return Date.now() - t < 24 * 3600 * 1000;
};

const BazarGrid = ({ onViewReservations }: { onViewReservations?: () => void }) => {
  const { token: contextToken } = useAuth();

  const tema = useBazarTema();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cesaunison.fondothoth.com/api';

  const [productos, setProductos] = useState<Producto[]>([]);
  const [mapLocations, setMapLocations] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [catalogoPuestos, setCatalogoPuestos] = useState<any[]>([]);
  const [selectedPuesto, setSelectedPuesto] = useState<number | null>(null);
  const [selectedSpotDetails, setSelectedSpotDetails] = useState<{ puesto: any; business: any | null } | null>(null);
  const [ediciones, setEdiciones] = useState<any[]>([]);
  const [activeEdicionId, setActiveEdicionId] = useState<number | null>(null);
  const [confirmation, setConfirmation] = useState<any>(null);

  // Tiempo real: toasts, puestos recién ocupados y estado del stream
  const [toasts, setToasts] = useState<{ id: number; icono: string; texto: string; tono: 'info' | 'exito' | 'alerta' }[]>([]);
  const [recientes, setRecientes] = useState<number[]>([]);

  // Mi Negocio (logo, catálogo de productos)
  const [misReservas, setMisReservas] = useState<any[]>([]);
  const [subiendoLogo, setSubiendoLogo] = useState(false);
  const [catalogoPuesto, setCatalogoPuesto] = useState<any[]>([]);
  const [agregandoProducto, setAgregandoProducto] = useState(false);
  const [nuevoProducto, setNuevoProducto] = useState({ nombre: '', precio: '', descripcion: '' });

  // Leer el token de localStorage como fuente de verdad para evitar el
  // problema de hidratación donde el estado React llega tarde
  const getToken = () => {
    if (contextToken) return contextToken;
    if (typeof window !== 'undefined') return localStorage.getItem('cesa_token');
    return null;
  };

  // --------------------------------------------------------------------------
  // Toasts (reemplazan a los alerts bloqueantes)
  // --------------------------------------------------------------------------
  const toast = (texto: string, icono = '✨', tono: 'info' | 'exito' | 'alerta' = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((ts) => [...ts.slice(-3), { id, icono, texto, tono }]);
    setTimeout(() => setToasts((ts) => ts.filter((t) => t.id !== id)), 5200);
  };

  // --------------------------------------------------------------------------
  // Carga de datos
  // --------------------------------------------------------------------------
  const fetchEdiciones = async () => {
    try {
      const res = await fetch(`${API_URL}/bazar.php?action=listar_ediciones`);
      const data = await res.json();
      if (data.success) {
        setEdiciones(data.data);
        const active = data.data.find((e: any) => e.activo === 1);
        if (active && !activeEdicionId) {
          setActiveEdicionId(active.id);
        }
      }
    } catch (e) { console.error('Error loading editions', e); }
  };

  const fetchProductos = async () => {
    try {
      const edParam = activeEdicionId ? `&edicion_id=${activeEdicionId}` : '';
      const res = await fetch(`${API_URL}/bazar.php?action=listar&categoria=${activeCat}${edParam}`);
      const data = await res.json();
      if (data.success) setProductos(data.data || []);
    } catch (e) { console.error('Error fetching bazar products', e); }
    finally { setCargandoInicial(false); }
  };

  const handleVote = async (id: number, valor: number) => {
    const token = getToken();
    if (!token) { toast('Inicia sesión para votar el karma', '🔐', 'alerta'); return; }
    try {
      const res = await fetch(`${API_URL}/bazar.php?action=votar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'votar', id, valor })
      });
      const data = await res.json();
      if (data.success) fetchProductos();
      else toast(data.error || 'No se pudo registrar el voto', '⚠️', 'alerta');
    } catch (e) { console.error('Error voting', e); }
  };

  const fetchMapLocations = async () => {
    try {
      const edParam = activeEdicionId ? `&edicion_id=${activeEdicionId}` : '';
      const res = await fetch(`${API_URL}/bazar.php?action=listar_ubicaciones${edParam}`);
      const data = await res.json();
      if (data.success) setMapLocations(data.data || []);
    } catch (e) { console.error('Error fetching map locations', e); }
  };

  const fetchCatalogoPuestos = async () => {
    try {
      const res = await fetch(`${API_URL}/bazar.php?action=catalogo_puestos`);
      const data = await res.json();
      if (data.success) setCatalogoPuestos(data.data || []);
    } catch (e) { console.error('Error fetching catalogue of spots', e); }
  };

  const fetchMisReservas = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/bazar.php?action=mis_reservas`);
      const data = await res.json();
      if (data.success) setMisReservas(data.data || []);
    } catch (e) { console.error('Error fetching mis reservas', e); }
  };

  useEffect(() => {
    fetchProductos();
    fetchMapLocations();
    fetchCatalogoPuestos();
    fetchEdiciones();
    // re-montaje al cambiar categoría / edición
  }, [activeCat, activeEdicionId]);

  useEffect(() => {
    fetchMisReservas();
  }, [contextToken]);

  // --------------------------------------------------------------------------
  // Refresco con anti-tormenta: agrupa ráfagas de eventos SSE en 1.2 s
  // --------------------------------------------------------------------------
  const fetchRef = useRef(() => {});
  fetchRef.current = () => { fetchProductos(); fetchMapLocations(); fetchCatalogoPuestos(); };

  const colaRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const agendaRefresco = useCallback(() => {
    if (colaRef.current) return;
    colaRef.current = setTimeout(() => { colaRef.current = null; fetchRef.current(); }, 1200);
  }, []);

  // --------------------------------------------------------------------------
  // STREAM EN TIEMPO REAL (SSE + fallback polling)
  // --------------------------------------------------------------------------
  const negocioActivo = misReservas.find(
    (r) => Number(r.active) === 1 && Number(r.edicion_id) === Number(activeEdicionId)
  );

  const marcarReciente = (pid: number) => {
    setRecientes((r) => (r.includes(pid) ? r : [...r, pid]));
    setTimeout(() => setRecientes((r) => r.filter((x) => x !== pid)), 60000);
  };

  const handleEventoStream = (ev: BazarEventoBus) => {
    if (ev.tipo === 'poll') { agendaRefresco(); return; }
    agendaRefresco();
    const texto = textoEventoBazar(ev);
    if (texto) toast(texto, iconoEventoBazar(ev.tipo));
    const pid = Number(ev.payload?.puesto_id);
    if (ev.tipo === 'reserva_creada' && pid > 0) marcarReciente(pid);
    if (ev.tipo === 'edicion_creada' || ev.tipo === 'edicion_archivada') fetchEdiciones();
    if (['reserva_aprobada', 'reserva_rechazada'].includes(ev.tipo)) {
      if (negocioActivo && Number(ev.payload?.id) === Number(negocioActivo.id)) {
        toast(ev.tipo === 'reserva_aprobada' ? '¡Tu negocio fue aprobado! Ya aparece en el Bazar 🎉' : 'Tu reserva fue rechazada. Revisa tu Perfil.', ev.tipo === 'reserva_aprobada' ? '🎉' : '🚫', ev.tipo === 'reserva_aprobada' ? 'exito' : 'alerta');
        fetchMisReservas();
        fetchProductos();
      }
    }
    if (ev.tipo === 'producto_agregado' && Number(ev.payload?.emprendimiento_id) === Number(selectedSpotDetails?.business?.id)) {
      fetchCatalogoPuestoDetalle(Number(ev.payload.emprendimiento_id));
    }
  };

  const estadoStream = useBazarStream(API_URL, handleEventoStream);

  // --------------------------------------------------------------------------
  // Vistas (analytics) — se registran una vez por sesión por negocio
  // --------------------------------------------------------------------------
  const vistasRef = useRef<Set<number>>(new Set());

  const fetchCatalogoPuestoDetalle = async (emprendimientoId: number) => {
    if (!emprendimientoId) return;
    try {
      const res = await fetch(`${API_URL}/bazar.php?action=productos&emprendimiento_id=${emprendimientoId}`);
      const data = await res.json();
      setCatalogoPuesto(data.data || []);
    } catch { setCatalogoPuesto([]); }
  };

  useEffect(() => {
    const biz = selectedSpotDetails?.business;
    if (biz?.id) {
      fetchCatalogoPuestoDetalle(Number(biz.id));
      if (!vistasRef.current.has(Number(biz.id))) {
        vistasRef.current.add(Number(biz.id));
        const token = getToken();
        if (token) {
          fetch(`${API_URL}/bazar.php?action=registrar_vista`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: Number(biz.id) })
          }).catch(() => { /* analytics best-effort */ });
        }
      }
    }
    // re-render al abrir otro puesto
  }, [selectedSpotDetails?.business?.id]);

  // --------------------------------------------------------------------------
  // Selección de puesto / registro
  // --------------------------------------------------------------------------
  const handleSelectSpot = (puesto: any, business: any | null) => {
    setSelectedPuesto(puesto.id);
    setSelectedSpotDetails({ puesto, business });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const token = getToken();
    if (!token) {
      toast('Inicia sesión con tu cuenta institucional para apartar puesto', '🔐', 'alerta');
      setLoading(false);
      window.location.href = '/login';
      return;
    }

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    if (selectedPuesto) (payload as any).puesto_id = selectedPuesto;

    if (!payload.puesto_id) {
      toast('Selecciona un puesto de la Calle de la Cultura antes de registrar', '📍', 'alerta');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/bazar.php?action=registrar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'registrar', ...payload })
      });

      const data = await res.json();
      if (data.success) {
        setConfirmation(data.reservation || { folio: data.id, estado: 'Pendiente' });
        setShowForm(false);
        setSelectedPuesto(null);
        setSelectedSpotDetails(null);
        fetchProductos();
        fetchMapLocations();
        fetchCatalogoPuestos();
        fetchMisReservas();
        toast('¡Reserva apartada! Llega el folio por correo 📬', '✉️', 'exito');
      } else {
        if (data.reservation) {
          setConfirmation(data.reservation);
          setShowForm(false);
          toast(data.error || 'Ya tienes una reserva activa', 'ℹ️');
        } else {
          toast(data.error || 'Error al registrar negocio', '⚠️', 'alerta');
        }
      }
    } catch (e) { console.error('Error registering', e); toast('Error de conexión al registrar', '📡', 'alerta'); }
    finally { setLoading(false); }
  };

  // --------------------------------------------------------------------------
  // Logo del negocio
  // --------------------------------------------------------------------------
  const handleSubirLogo = async (negocioId: number, file: File) => {
    const token = getToken();
    if (!token) { toast('Inicia sesión para actualizar tu logo', '🔐', 'alerta'); return; }
    setSubiendoLogo(true);
    try {
      const fd = new FormData();
      fd.append('action', 'subir_logo');
      fd.append('id', String(negocioId));
      fd.append('logo', file);
      const res = await fetch(`${API_URL}/bazar.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        toast(data.message || '¡Logo actualizado! Se verá en tu puesto', '🖼️', 'exito');
        fetchMisReservas();
        agendaRefresco();
      } else {
        toast(data.error || 'No se pudo actualizar el logo', '⚠️', 'alerta');
      }
    } catch (e) { console.error('Error subiendo logo', e); toast('Error de conexión al subir logo', '📡', 'alerta'); }
    finally { setSubiendoLogo(false); }
  };

  // --------------------------------------------------------------------------
  // Catálogo de productos del puesto (agregar), si el emprendedor es dueño
  // --------------------------------------------------------------------------
  const agregarProductoPuesto = async (emprendimientoId: number) => {
    const token = getToken();
    if (!token) { toast('Inicia sesión para publicar productos', '🔐', 'alerta'); return; }
    if (!nuevoProducto.nombre.trim()) { toast('Escribe el nombre del producto', '🛒', 'alerta'); return; }
    setAgregandoProducto(true);
    try {
      const fd = new FormData();
      fd.append('action', 'agregar_producto');
      fd.append('emprendimiento_id', String(emprendimientoId));
      fd.append('nombre', nuevoProducto.nombre.trim());
      fd.append('precio', nuevoProducto.precio || '0');
      fd.append('descripcion', nuevoProducto.descripcion.trim());
      const res = await fetch(`${API_URL}/bazar.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      const data = await res.json();
      if (data.success) {
        toast('Producto publicado en el marketplace 🛒', '🛒', 'exito');
        setNuevoProducto({ nombre: '', precio: '', descripcion: '' });
        fetchCatalogoPuestoDetalle(emprendimientoId);
      } else {
        toast(data.error || 'No se pudo publicar el producto', '⚠️', 'alerta');
      }
    } catch (e) { console.error('Error agregando producto', e); toast('Error de conexión', '📡', 'alerta'); }
    finally { setAgregandoProducto(false); }
  };

  const activeEdicionNombre = ediciones.find(e => e.id === activeEdicionId)?.nombre || 'Edición Actual';
  const esDueñoDelPuesto = !!(selectedSpotDetails?.business && negocioActivo && Number(selectedSpotDetails.business.id) === Number(negocioActivo.id));

  return (
    <div
      className="max-w-6xl mx-auto px-4 pb-24 space-y-12 animate-in fade-in duration-500 transition-colors duration-700"
      style={tema.vars}
      data-tema={tema.paleta.id}
      data-modo={tema.modo}
    >
      {/* ========== TOASTS EN TIEMPO REAL ========== */}
      <div className="fixed bottom-6 right-6 z-[110] flex flex-col gap-2 w-[min(92vw,340px)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="bazar-toast flex items-start gap-3 rounded-2xl p-4 shadow-2xl border backdrop-blur-xl"
            style={{
              background: 'var(--b-card, rgba(11,17,32,0.88))',
              borderColor: 'var(--b-border, rgba(255,255,255,0.1))',
              color: 'var(--b-text, #f1f5f9)',
            }}
          >
            <span className="text-xl leading-none mt-0.5">{t.icono}</span>
            <p className="text-[11px] leading-relaxed font-semibold">{t.texto}</p>
          </div>
        ))}
      </div>

      {/* ========== MODAL DE CONFIRMACIÓN ========== */}
      {confirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div
            className="w-full max-w-md rounded-3xl border p-8 text-center shadow-2xl"
            style={{ background: 'var(--b-card)', borderColor: 'rgba(16,185,129,0.3)', color: 'var(--b-text)' }}
          >
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-xl font-black uppercase">Reserva apartada</h3>
            <p className="mt-2 text-sm" style={{ color: 'var(--b-muted)' }}>Tu solicitud está pendiente de revisión.</p>
            <p className="mt-4 text-lg font-mono font-black text-emerald-400">{confirmation.folio}</p>
            {confirmation.verify_url && <div className="my-5 flex justify-center rounded-2xl bg-white p-4"><QRCodeSVG value={confirmation.verify_url} size={150} /></div>}
            <p className="text-[10px]" style={{ color: 'var(--b-faint)' }}>{confirmation.email_sent ? 'Enviamos el ticket a tu correo institucional.' : 'El ticket quedó guardado en tu Perfil.'}</p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => { setConfirmation(null); onViewReservations?.(); }} className="flex-1 rounded-xl bg-[var(--b-accent)] px-4 py-3 text-[10px] font-black uppercase text-white hover:opacity-90 transition-all">Ver mi reserva</button>
              <button onClick={() => setConfirmation(null)} className="rounded-xl border border-[var(--b-border)] px-4 py-3 text-[10px] font-black uppercase hover:opacity-80" style={{ color: 'var(--b-muted)' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== TÍTULO CON TEMA + ESTADO EN VIVO ========== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[var(--b-border)] pb-6">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter" style={{ color: 'var(--b-text)' }}>Bazar Emprendedor</h2>
          <p className="text-[10px] uppercase font-black tracking-widest mt-1" style={{ color: 'var(--b-accent)' }}>
            {tema.paleta.emoji} {tema.paleta.nombre} • Visualización Radial: Calle de la Cultura • {activeEdicionNombre}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Indicador de streaming */}
          <span
            className="flex items-center gap-1.5 text-[9px] uppercase font-black px-3 py-1.5 rounded-xl tracking-widest border"
            style={{
              borderColor: estadoStream === 'vivo' ? 'rgba(34,197,94,0.4)' : 'var(--b-accent-border)',
              color: estadoStream === 'vivo' ? '#22c55e' : 'var(--b-accent)',
              background: estadoStream === 'vivo' ? 'rgba(34,197,94,0.08)' : 'var(--b-accent-soft)',
            }}
            title={estadoStream === 'vivo' ? 'Streaming en vivo conectado' : 'Modo de respaldo: sincronización cada 30 s'}
          >
            <span className={`w-2 h-2 rounded-full ${estadoStream === 'vivo' ? 'bg-emerald-500 bazar-live-dot' : 'bg-amber-500'}`}></span>
            {estadoStream === 'vivo' ? 'EN VIVO' : estadoStream === 'polling' ? 'SINCRONIZANDO' : 'CONECTANDO'}
          </span>

          {/* Toggle de modo día/noche */}
          <div className="flex items-center rounded-xl border border-[var(--b-border)] overflow-hidden" style={{ background: 'var(--b-card2)' }}>
            <button
              onClick={() => tema.setModo('dia')}
              className={`px-2.5 py-1.5 text-xs transition-all ${tema.modo === 'dia' ? 'bg-[var(--b-accent-soft)] opacity-100' : 'opacity-40 hover:opacity-70'}`}
              title="Modo día (tema claro diurno)"
            >☀️</button>
            <button
              onClick={() => tema.setModo('noche')}
              className={`px-2.5 py-1.5 text-xs transition-all ${tema.modo === 'noche' ? 'bg-[var(--b-accent-soft)] opacity-100' : 'opacity-40 hover:opacity-70'}`}
              title="Modo noche"
            >🌙</button>
            <button
              onClick={() => tema.setModo('auto')}
              className={`px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all ${tema.autoModo ? 'bg-[var(--b-accent-soft)] opacity-100' : 'opacity-40 hover:opacity-70'}`}
              title="Automático por hora"
            >Auto</button>
          </div>
        </div>

        {/* Floating selected spot details panel */}
        {selectedSpotDetails && (
          <span className="text-[9px] uppercase font-black px-3 py-1.5 rounded-xl tracking-widest border animate-pulse" style={{ background: 'var(--b-accent-soft)', color: 'var(--b-accent)', borderColor: 'var(--b-accent-border)' }}>
            Viendo Puesto #{selectedSpotDetails.puesto.id}
          </span>
        )}
      </div>

      {/* ========== MI NEGOCIO (si ya tiene reserva activa) ========== */}
      {negocioActivo && !showForm && (
        <div
          className="rounded-3xl border p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4"
          style={{ background: 'var(--b-card)', borderColor: 'var(--b-border)' }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center text-xl shrink-0"
              style={{ background: 'var(--b-accent-soft)', border: '1px solid var(--b-accent-border)' }}
            >
              {negocioActivo.logo_path ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={`/${String(negocioActivo.logo_path).replace(/^\//, '')}`} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <span>🏪</span>
              )}
            </div>
            <div>
              <p className="text-[9px] uppercase font-black tracking-widest" style={{ color: 'var(--b-faint)' }}>Tu reserva activa</p>
              <h4 className="text-lg font-black uppercase tracking-tight" style={{ color: 'var(--b-text)' }}>{negocioActivo.nombre_negocio}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${estadoReservaColor(negocioActivo.estado)}`}>
                  {negocioActivo.estado}
                </span>
                <span className="text-[9px] font-mono" style={{ color: 'var(--b-muted)' }}>{negocioActivo.folio}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {negocioActivo.estado === 'Pendiente' && negocioActivo.id && (
              <label
                className={`rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest border cursor-pointer transition-all ${subiendoLogo ? 'opacity-50' : 'hover:opacity-80'}`}
                style={{ borderColor: 'var(--b-accent-border)', color: 'var(--b-accent)', background: 'var(--b-accent-soft)' }}
              >
                {subiendoLogo ? '⏳ Subiendo…' : negocioActivo.logo_path ? '🖼️ Cambiar logo' : '🖼️ Sube el logo de tu negocio'}
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleSubirLogo(Number(negocioActivo.id), f);
                    e.target.value = '';
                  }}
                />
              </label>
            )}
            <a
              href={`${API_URL}/bazar.php?action=descargar_ticket&id=${negocioActivo.id}`}
              className="rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest border hover:opacity-80 transition-all"
              style={{ borderColor: 'var(--b-border)', color: 'var(--b-muted)' }}
            >
              🎟️ Ver ticket QR
            </a>
          </div>
        </div>
      )}

      {/* ========== MAPA ESQUEMÁTICO ========== */}
      <div className="space-y-6">
        <BazarSchematicMap
          locations={mapLocations}
          puestos={catalogoPuestos}
          selectedPuestoId={selectedPuesto}
          onSelectSpot={handleSelectSpot}
          recientes={recientes}
        />

        {/* Selected Spot Details Container */}
        {selectedSpotDetails ? (
          <div
            className="p-6 md:p-8 rounded-[32px] animate-in fade-in slide-in-from-bottom-3 duration-300 shadow-2xl relative"
            style={{ background: 'var(--b-card)', border: '1px solid var(--b-accent-border)' }}
          >
            <button
              onClick={() => {
                setSelectedSpotDetails(null);
                setSelectedPuesto(null);
              }}
              className="absolute top-6 right-6 transition-colors w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-xs"
              style={{ color: 'var(--b-muted)' }}
            >
              ✕
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <span className="text-[8px] uppercase font-black px-3 py-1.5 rounded-lg tracking-widest border" style={{ background: 'var(--b-accent-soft)', color: 'var(--b-accent)', borderColor: 'var(--b-accent-border)' }}>
                  {selectedSpotDetails.puesto.zona ? selectedSpotDetails.puesto.zona.toUpperCase() : 'BUHO'} • PUESTO #{selectedSpotDetails.puesto.id}
                </span>
                <h4 className="text-2xl font-black uppercase tracking-tight" style={{ color: 'var(--b-text)' }}>
                  {selectedSpotDetails.business ? selectedSpotDetails.business.nombre_negocio : 'Puesto Disponible'}
                </h4>
                <p className="text-xs leading-relaxed max-w-2xl" style={{ color: 'var(--b-muted)' }}>
                  {selectedSpotDetails.business
                    ? selectedSpotDetails.business.descripcion
                    : 'Este espacio de la Calle de la Cultura está listo para tu emprendimiento. Haz clic en Reservar para ocuparlo en esta edición del bazar.'}
                </p>
                {selectedSpotDetails.business && (
                  <div className="space-y-3 pt-2">
                    <p className="text-[9px] uppercase font-black tracking-widest flex items-center gap-2" style={{ color: 'var(--b-accent)' }}>
                      <i className="fas fa-user"></i> Emprendedor: {selectedSpotDetails.business.dueno || 'Emprendedor CESA'} • Categoría: {selectedSpotDetails.business.categoria}
                    </p>

                    {/* ==== Catálogo Marketplace real del puesto ==== */}
                    <div className="mt-4 p-4 rounded-2xl space-y-3 border" style={{ background: 'var(--b-card2)', borderColor: 'var(--b-border)' }}>
                      <h5 className="text-xs font-black uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--b-text)' }}>
                        <span>🛒 Catálogo Marketplace del Puesto</span>
                        {catalogoPuesto.length > 0 && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'var(--b-accent-soft)', color: 'var(--b-accent)' }}>
                            {catalogoPuesto.length} {catalogoPuesto.length === 1 ? 'producto' : 'productos'}
                          </span>
                        )}
                      </h5>

                      {catalogoPuesto.length === 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-xl border" style={{ background: 'var(--b-card)', borderColor: 'var(--b-border)' }}>
                            <p className="font-bold" style={{ color: 'var(--b-text)' }}>Reserva tu producto en línea</p>
                            <p className="text-[10px]" style={{ color: 'var(--b-muted)' }}>Contacta vía WhatsApp para entrega en el estand de la Calle de la Cultura.</p>
                          </div>
                        </div>
                      )}

                      {catalogoPuesto.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {catalogoPuesto.map((pr: any) => (
                            <div key={pr.id} className="rounded-xl p-3 border flex flex-col gap-1" style={{ background: 'var(--b-card)', borderColor: 'var(--b-border)' }}>
                              <div className="w-14 h-14 rounded-xl overflow-hidden mb-1 bg-black/10 flex items-center justify-center">
                                {pr.imagen_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={String(pr.imagen_url).startsWith('http') ? pr.imagen_url : `/${String(pr.imagen_url).replace(/^\//, '')}`} alt={pr.nombre} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xl">🛍️</span>
                                )}
                              </div>
                              <p className="text-[11px] font-black leading-tight" style={{ color: 'var(--b-text)' }}>{pr.nombre}</p>
                              {Number(pr.precio) > 0 && (
                                <p className="text-[11px] font-black" style={{ color: 'var(--b-accent)' }}>${Number(pr.precio).toLocaleString('es-MX')} MXN</p>
                              )}
                              {pr.descripcion && <p className="text-[9px] line-clamp-2" style={{ color: 'var(--b-muted)' }}>{pr.descripcion}</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Formulario de alta de producto (solo dueño) */}
                      {esDueñoDelPuesto && (
                        <div className="pt-3 border-t border-[var(--b-border)] space-y-2">
                          <p className="text-[9px] uppercase font-black tracking-widest" style={{ color: 'var(--b-accent)' }}>➕ Es tu negocio: agrega un producto</p>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <input
                              value={nuevoProducto.nombre}
                              onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                              placeholder="Nombre del producto"
                              className="col-span-2 rounded-xl px-3 py-2.5 text-xs outline-none bg-[var(--b-input-bg)] border border-[var(--b-input-border)] focus:border-[var(--b-accent-border)]"
                              style={{ color: 'var(--b-text)' }}
                            />
                            <input
                              value={nuevoProducto.precio}
                              onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value.replace(/[^0-9.]/g, '') })}
                              placeholder="Precio (opcional)"
                              inputMode="decimal"
                              className="rounded-xl px-3 py-2.5 text-xs outline-none bg-[var(--b-input-bg)] border border-[var(--b-input-border)] focus:border-[var(--b-accent-border)]"
                              style={{ color: 'var(--b-text)' }}
                            />
                            <button
                              onClick={() => agregarProductoPuesto(Number(selectedSpotDetails.business.id))}
                              disabled={agregandoProducto}
                              className="rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-white transition-all disabled:opacity-50"
                              style={{ background: 'var(--b-accent)' }}
                            >
                              {agregandoProducto ? '⏳…' : 'Publicar'}
                            </button>
                          </div>
                          <input
                            value={nuevoProducto.descripcion}
                            onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
                            placeholder="Descripción breve (opcional)"
                            className="w-full rounded-xl px-3 py-2.5 text-xs outline-none bg-[var(--b-input-bg)] border border-[var(--b-input-border)] focus:border-[var(--b-accent-border)]"
                            style={{ color: 'var(--b-text)' }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="shrink-0 w-full md:w-auto">
                {selectedSpotDetails.business ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={`https://wa.me/${selectedSpotDetails.business.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#1ebd59] text-white px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/10"
                    >
                      <i className="fab fa-whatsapp text-sm"></i> Contactar WhatsApp
                    </a>
                    {selectedSpotDetails.business.instagram && (
                      <a
                        href={`https://instagram.com/${selectedSpotDetails.business.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 text-white px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10"
                      >
                        <i className="fab fa-instagram text-sm"></i> Instagram
                      </a>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!getToken()) {
                        toast('Inicia sesión para apartar un puesto del Bazar', '🔐', 'alerta');
                        return;
                      }
                      if (negocioActivo) {
                        toast('Ya tienes una reserva activa en esta edición', 'ℹ️');
                        return;
                      }
                      setShowForm(true);
                      setSelectedPuesto(selectedSpotDetails.puesto.id);
                      setTimeout(() => {
                        const formElement = document.getElementById('bazar-form-registro');
                        if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
                      }, 200);
                    }}
                    className="w-full md:w-auto px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-white"
                    style={{ background: 'var(--b-accent)' }}
                  >
                    Reservar Puesto 🚀
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-[10px] uppercase font-black tracking-widest italic" style={{ color: 'var(--b-faint)' }}>
            Selecciona cualquier punto del plano para ver la disponibilidad y reservar en línea
          </p>
        )}
      </div>

      {/* ========== BARRA DE CATEGORÍAS ========== */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar flex-1 w-full">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCat(cat.id)}
              className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-all shrink-0 border-2 font-black text-[10px] uppercase tracking-widest ${activeCat === cat.id ? '' : 'hover:opacity-80'}`}
              style={activeCat === cat.id
                ? { borderColor: 'var(--b-accent)', background: 'var(--b-accent-soft)', color: 'var(--b-text)' }
                : { borderColor: 'var(--b-border)', color: 'var(--b-muted)' }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            if (!getToken()) {
              toast('Inicia sesión con tu cuenta institucional', '🔐', 'alerta');
              return;
            }
            if (negocioActivo) {
              toast('Ya tienes un negocio en esta edición. Ahora sube tu logo y productos arriba.', '✨');
              return;
            }
            setShowForm(!showForm);
          }}
          className="w-full md:w-auto px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all text-white text-center"
          style={{ background: 'var(--b-accent)' }}
        >
          {showForm ? '✕ Cerrar Formulario' : '＋ Publicar Mi Negocio'}
        </button>
      </div>

      {/* ========== FORMULARIO DE REGISTRO ========== */}
      {showForm && (
        <form id="bazar-form-registro" onSubmit={handleRegister} className="p-6 md:p-10 rounded-[40px] animate-in slide-in-from-top-10 duration-500 space-y-8 border" style={{ background: 'var(--b-card)', borderColor: 'var(--b-border)', color: 'var(--b-text)' }}>
          <h4 className="text-2xl font-black uppercase tracking-tighter">Registrar Emprendimiento ({activeEdicionNombre})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <input name="nombre_negocio" required placeholder="Nombre de tu negocio" className="bg-[var(--b-input-bg)] border border-[var(--b-input-border)] rounded-2xl px-5 py-4 text-sm outline-none focus:border-[var(--b-accent-border)]" style={{ color: 'var(--b-text)' }} />
            <input name="whatsapp" required placeholder="WhatsApp (Ej: 6621234567)" className="bg-[var(--b-input-bg)] border border-[var(--b-input-border)] rounded-2xl px-5 py-4 text-sm outline-none focus:border-[var(--b-accent-border)]" style={{ color: 'var(--b-text)' }} />
            <select name="categoria" className="bg-[var(--b-input-bg)] border border-[var(--b-input-border)] rounded-2xl px-5 py-4 text-sm outline-none" style={{ color: 'var(--b-text)' }}>
              {CATEGORIAS.filter(c => c.id !== 'todas').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <textarea name="descripcion" required placeholder="Describe lo que vendes u ofreces..." className="md:col-span-3 bg-[var(--b-input-bg)] border border-[var(--b-input-border)] rounded-2xl px-5 py-4 text-sm outline-none h-32 resize-none focus:border-[var(--b-accent-border)]" style={{ color: 'var(--b-text)' }} />

            <div className="md:col-span-3 space-y-4">
              <div className="p-4 rounded-2xl flex items-center justify-between" style={{ background: 'var(--b-accent-soft)', border: '1px solid var(--b-accent-border)' }}>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest block" style={{ color: 'var(--b-accent)' }}>Puesto Seleccionado en la Calle de la Cultura</span>
                  <p className="font-black text-sm mt-0.5" style={{ color: 'var(--b-text)' }}>
                    {selectedPuesto ? `Puesto #${selectedPuesto} — Calle de la Cultura` : '⚠️ Ningún puesto seleccionado (Elige uno de la lista a continuación)'}
                  </p>
                </div>
                {selectedPuesto && (
                  <span className="bg-emerald-500 text-white font-black text-[9px] px-3 py-1.5 rounded-xl uppercase tracking-widest">
                    ✓ Puesto Apartado
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-10 gap-2 max-h-48 overflow-y-auto pr-2 border border-[var(--b-border)] p-4 rounded-2xl bg-[var(--b-card2)]">
                {(catalogoPuestos.length > 0 ? catalogoPuestos : Array.from({ length: 30 }, (_, i) => ({ id: i + 1, zona: 'Central' }))).map((p) => {
                  const isOccupied = mapLocations.some(loc => Number(loc.puesto_id) === Number(p.id));
                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOccupied && setSelectedPuesto(p.id)}
                      className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${selectedPuesto === p.id ? 'shadow-lg scale-105' : isOccupied ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-100'}`}
                      style={
                        selectedPuesto === p.id
                          ? { background: 'var(--b-accent)', borderColor: '#fff', color: '#fff' }
                          : isOccupied
                            ? { background: 'var(--b-card2)', borderColor: 'var(--b-border)', color: 'var(--b-faint)' }
                            : { background: 'var(--b-input-bg)', borderColor: 'var(--b-input-border)', color: 'var(--b-muted)' }
                      }
                    >
                      <span className="text-[10px] font-black">#{p.id}</span>
                    </div>
                  );
                })}
              </div>
              <input type="hidden" name="puesto_id" value={selectedPuesto || ''} />
            </div>

            <input name="instagram" placeholder="Usuario de Instagram (Opcional, Ej: cesa_unison)" className="md:col-span-3 bg-[var(--b-input-bg)] border border-[var(--b-input-border)] rounded-2xl px-5 py-4 text-sm outline-none focus:border-[var(--b-accent-border)]" style={{ color: 'var(--b-text)' }} />
            <input name="ubicacion" placeholder="Referencia física adicional (Ej: Frente a Rectoría)" className="md:col-span-3 bg-[var(--b-input-bg)] border border-[var(--b-input-border)] rounded-2xl px-5 py-4 text-sm outline-none" style={{ color: 'var(--b-text)' }} />
          </div>
          <button type="submit" disabled={loading} className="w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-white transition-all disabled:opacity-60" style={{ background: 'var(--b-accent)' }}>
            {loading ? 'Registrando...' : 'Registrar Negocio 🚀'}
          </button>
        </form>
      )}

      {/* ========== GRID DE PARTICIPANTES ========== */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tight" style={{ color: 'var(--b-text)' }}>Directorio de Emprendedores</h3>
          <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: 'var(--b-muted)' }}>Catálogo de participantes validados para esta edición</p>
        </div>

        {cargandoInicial ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-[32px] border border-[var(--b-border)] p-8 space-y-4" style={{ background: 'var(--b-card)' }}>
                <div className="bazar-sk h-5 w-2/3 mx-4 text-slate-400" style={{ color: 'var(--b-muted)' }}></div>
                <div className="bazar-sk h-3 w-1/2 text-slate-400" style={{ color: 'var(--b-muted)' }}></div>
                <div className="bazar-sk h-16 w-full text-slate-400" style={{ color: 'var(--b-muted)' }}></div>
                <div className="bazar-sk h-8 w-28 text-slate-400" style={{ color: 'var(--b-muted)' }}></div>
              </div>
            ))}
          </div>
        ) : productos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productos.map((prod) => (
              <div
                key={prod.id}
                className="rounded-[32px] border p-8 flex flex-col group transition-all relative"
                style={{ background: 'var(--b-card)', borderColor: 'var(--b-border)' }}
              >
                {/* Karma Widget */}
                <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 p-2 rounded-2xl border border-[var(--b-border)] shadow-2xl z-10" style={{ background: 'var(--b-card2)' }}>
                  <button
                    onClick={() => handleVote(prod.id, 1)}
                    className="p-2 rounded-lg transition-all"
                    style={prod.user_vote === 1 ? { color: 'var(--b-accent)', background: 'var(--b-accent-soft)' } : { color: 'var(--b-faint)' }}
                  >
                    <i className="fas fa-arrow-up text-xs"></i>
                  </button>
                  <span className={`text-[10px] font-black ${prod.score > 0 ? 'text-emerald-400' : prod.score < 0 ? 'text-red-400' : ''}`} style={prod.score === 0 ? { color: 'var(--b-faint)' } : {}}>
                    {prod.score || 0}
                  </span>
                  <button
                    onClick={() => handleVote(prod.id, -1)}
                    className="p-2 rounded-lg transition-all"
                    style={prod.user_vote === -1 ? { color: 'var(--b-accent)', background: 'var(--b-accent-soft)' } : { color: 'var(--b-faint)' }}
                  >
                    <i className="fas fa-arrow-down text-xs"></i>
                  </button>
                </div>

                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-black text-lg uppercase tracking-tight truncate pr-4" style={{ color: 'var(--b-text)' }}>{prod.nombre_negocio}</h4>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {prod.verificado && <span className="text-[7px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider border" style={{ background: 'var(--b-accent-soft)', color: 'var(--b-accent)', borderColor: 'var(--b-accent-border)' }}>Verificado</span>}
                    {esNegocioNuevo(prod.created_at) && <span className="text-[7px] bg-red-500/15 text-red-500 border border-red-500/40 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider animate-pulse">NUEVO</span>}
                  </div>
                </div>
                <p className="text-[9px] uppercase font-black tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--b-muted)' }}>
                  <i className="fas fa-tag"></i> {prod.categoria} • <i className="fas fa-map-marker-alt"></i> Puesto #{prod.puesto_id} {prod.ubicacion ? `(${prod.ubicacion})` : ''}
                </p>
                <p className="text-xs leading-relaxed mb-6 flex-1 line-clamp-3" style={{ color: 'var(--b-muted)' }}>{prod.descripcion}</p>
                <div className="pt-4 border-t border-[var(--b-border)] flex justify-between items-center">
                  <div className="text-[8px] uppercase font-black truncate pr-2" style={{ color: 'var(--b-faint)' }}>Por: {prod.nombre_completo || prod.dueno || 'Emprendedor CESA'}</div>
                  <a href={`https://wa.me/${prod.whatsapp}`} className="text-[9px] font-black uppercase tracking-widest px-5 py-2 rounded-xl transition-all" style={{ background: 'var(--b-text)', color: 'var(--b-card)' }}>Contactar</a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-[var(--b-border)] rounded-3xl p-12 text-center text-xs font-medium" style={{ background: 'var(--b-card)', color: 'var(--b-muted)' }}>
            No hay emprendimientos registrados o verificados en esta edición aún. ¡Sé el primero, {tema.paleta.emoji}!
          </div>
        )}
      </div>

      {/* ========== ARCHIVO DE EDICIONES ========== */}
      <div className="pt-12 border-t border-[var(--b-border)] space-y-6">
        <div>
          <h4 className="text-xl font-black uppercase tracking-tighter" style={{ color: 'var(--b-text)' }}>Archivo del Bazar CESA</h4>
          <p className="text-[9px] uppercase font-black tracking-widest mt-1" style={{ color: 'var(--b-muted)' }}>Explora las ediciones y participantes históricos</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {ediciones.map((ed) => {
            const isActive = activeEdicionId === ed.id;
            return (
              <div
                key={ed.id}
                onClick={() => {
                  setActiveEdicionId(ed.id);
                  setSelectedSpotDetails(null);
                  setSelectedPuesto(null);
                }}
                className="p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between"
                style={isActive
                  ? { background: 'var(--b-accent-soft)', borderColor: 'var(--b-accent)', color: 'var(--b-text)' }
                  : { background: 'var(--b-card)', borderColor: 'var(--b-border)', color: 'var(--b-muted)' }}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-black text-xs uppercase tracking-wider">{ed.nombre}</h5>
                    {ed.activo === 1 && (
                      <span className="text-[6px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                        Activa
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] uppercase tracking-wider mt-1 font-semibold" style={{ color: 'var(--b-faint)' }}>
                    Inicio: {new Date(ed.fecha_inicio).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                <div className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                  <span>Ver participantes</span>
                  <i className="fas fa-arrow-right" style={{ color: 'var(--b-accent)' }}></i>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default BazarGrid;
