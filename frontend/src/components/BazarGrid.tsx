'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import dynamic from 'next/dynamic';

// Dynamic import for Leaflet (Next.js SSR support)
const MapWithNoSSR = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

import 'leaflet/dist/leaflet.css';
import BazarSchematicMap from './BazarSchematicMap';

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
  ubicacion_lat?: string | null;
  ubicacion_lng?: string | null;
  ubicacion?: string | null;
  nombre_completo: string;
  views: number;
  score: number;
  user_vote: number | null;
  verificado: boolean;
  featured: boolean;
}

const CATEGORIAS = [
  { id: 'todas', label: 'Todos', icon: '🛍️' },
  { id: 'comida', label: 'Comida', icon: '🍕' },
  { id: 'productos', label: 'Productos', icon: '📦' },
  { id: 'servicios', label: 'Servicios', icon: '🛠️' },
  { id: 'asesorias', label: 'Asesorías', icon: '🎓' },
  { id: 'tecnologia', label: 'Tech', icon: '💻' },
  { id: 'arte', label: 'Arte/Diseño', icon: '🎨' },
];

const BazarGrid = () => {
  const { user, token } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [mapLocations, setMapLocations] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [catalogoPuestos, setCatalogoPuestos] = useState<any[]>([]);
  const [selectedPuesto, setSelectedPuesto] = useState<number | null>(null);
  const [selectedSpotDetails, setSelectedSpotDetails] = useState<{ puesto: any; business: any | null } | null>(null);
  const [ediciones, setEdiciones] = useState<any[]>([]);
  const [activeEdicionId, setActiveEdicionId] = useState<number | null>(null);
  const mapRef = React.useRef<any>(null);
  const [goldMarker, setGoldMarker] = useState<any>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cesaunison.fondothoth.com/api';

  useEffect(() => {
    // Inicializar Leaflet solo en el cliente para evitar errores de SSR
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      setGoldMarker(new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }));
    });
  }, []);

  useEffect(() => {
    fetchProductos();
    fetchMapLocations();
    fetchCatalogoPuestos();
    fetchEdiciones();
  }, [activeCat, activeEdicionId]);

  // Fix para el error de mapa gris en SPA
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 800);
    }
  }, [mapLocations]);

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
    } catch (e) { console.error("Error loading editions", e); }
  };

  const fetchProductos = async () => {
    try {
      const edParam = activeEdicionId ? `&edicion_id=${activeEdicionId}` : '';
      const res = await fetch(`${API_URL}/bazar.php?action=listar&categoria=${activeCat}${edParam}`);
      const data = await res.json();
      if (data.success) setProductos(data.data);
    } catch (e) { console.error("Error fetching bazar products", e); }
  };

  const handleVote = async (id: number, valor: number) => {
    try {
      const res = await fetch(`${API_URL}/bazar.php`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: 'votar', id, valor })
      });
      const data = await res.json();
      if (data.success) fetchProductos();
    } catch (e) { console.error("Error voting", e); }
  };

  const fetchMapLocations = async () => {
    try {
      const edParam = activeEdicionId ? `?edicion_id=${activeEdicionId}` : '';
      const res = await fetch(`${API_URL}/bazar.php?action=listar_ubicaciones${edParam}`);
      const data = await res.json();
      if (data.success) setMapLocations(data.data);
    } catch (e) { console.error("Error fetching map locations", e); }
  };

  const fetchCatalogoPuestos = async () => {
    try {
      const res = await fetch(`${API_URL}/bazar.php?action=catalogo_puestos`);
      const data = await res.json();
      if (data.success) setCatalogoPuestos(data.data);
    } catch (e) { console.error("Error fetching catalogue of spots", e); }
  };

  const handleSelectSpot = (puesto: any, business: any | null) => {
    setSelectedPuesto(puesto.id);
    setSelectedSpotDetails({ puesto, business });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    
    try {
      const res = await fetch(`${API_URL}/bazar.php?action=registrar`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setSelectedPuesto(null);
        setSelectedSpotDetails(null);
        fetchProductos();
        fetchMapLocations();
      } else {
        alert(data.error || 'Error al registrar negocio');
      }
    } catch (e) { console.error("Error registering", e); } 
    finally { setLoading(false); }
  };

  const activeEdicionNombre = ediciones.find(e => e.id === activeEdicionId)?.nombre || 'Edición Actual';

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 space-y-12 animate-in fade-in duration-500">
      
      {/* Title Header with Active Edition Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Bazar Emprendedor</h2>
          <p className="text-[10px] uppercase font-black tracking-widest text-[#C5A059] mt-1">
            Visualización Radial: Calle de la Cultura • {activeEdicionNombre}
          </p>
        </div>
        
        {/* Floating selected spot details panel */}
        {selectedSpotDetails && (
          <span className="text-[9px] uppercase font-black px-3 py-1.5 rounded-xl tracking-widest bg-[#C5A059]/10 text-[#C5A059] border border-[#C5A059]/20 animate-pulse">
            Viendo Puesto #{selectedSpotDetails.puesto.id}
          </span>
        )}
      </div>

      {/* Interactive Map Layer: CESA Schematic Layout (Buhomap) */}
      <div className="space-y-6">
        <BazarSchematicMap 
          locations={mapLocations}
          puestos={catalogoPuestos}
          selectedPuestoId={selectedPuesto}
          onSelectSpot={handleSelectSpot}
        />
        
        {/* Selected Spot Details Container */}
        {selectedSpotDetails ? (
          <div className="bg-slate-900 border border-indigo-500/20 p-6 md:p-8 rounded-[32px] animate-in fade-in slide-in-from-bottom-3 duration-300 shadow-2xl relative">
            <button 
              onClick={() => {
                setSelectedSpotDetails(null);
                setSelectedPuesto(null);
              }}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-xs"
            >
              ✕
            </button>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2">
                <span className="text-[8px] uppercase font-black px-3 py-1.5 rounded-lg tracking-widest bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {selectedSpotDetails.puesto.zona ? selectedSpotDetails.puesto.zona.toUpperCase() : 'BUHO'} • PUESTO #{selectedSpotDetails.puesto.id}
                </span>
                <h4 className="text-2xl font-black text-white uppercase tracking-tight">
                  {selectedSpotDetails.business ? selectedSpotDetails.business.nombre_negocio : 'Puesto Disponible'}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                  {selectedSpotDetails.business 
                    ? selectedSpotDetails.business.descripcion 
                    : 'Este espacio de la Calle de la Cultura está listo para tu emprendimiento. Haz clic en Reservar para ocuparlo en esta edición del bazar.'}
                </p>
                {selectedSpotDetails.business && (
                  <p className="text-[9px] uppercase font-black tracking-widest text-[#C5A059] flex items-center gap-2">
                    <i className="fas fa-user"></i> Coordinador/Dueño: {selectedSpotDetails.business.dueno}
                  </p>
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
                      <i className="fab fa-whatsapp text-sm"></i> WhatsApp
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
                      if (!token) {
                        alert('Por favor inicia sesión para apartar un puesto en el bazar.');
                        return;
                      }
                      setShowForm(true);
                      setSelectedPuesto(selectedSpotDetails.puesto.id);
                      setTimeout(() => {
                        const formElement = document.querySelector('form');
                        if (formElement) formElement.scrollIntoView({ behavior: 'smooth' });
                      }, 200);
                    }}
                    className="w-full md:w-auto bg-indigo-600 hover:bg-white hover:text-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20"
                  >
                    Reservar Puesto 🚀
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-[10px] uppercase font-black tracking-widest text-white/20 italic">
            Selecciona cualquier punto del plano para ver la disponibilidad y reservar en línea
          </p>
        )}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
         <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar flex-1 w-full">
            {CATEGORIAS.map((cat) => (
               <button
                  key={cat.id}
                  onClick={() => setActiveCat(cat.id)}
                  className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 transition-all shrink-0 border-2 font-black text-[10px] uppercase tracking-widest ${
                  activeCat === cat.id ? 'border-indigo-500 bg-indigo-500/10 text-white' : 'border-white/5 text-slate-500 hover:text-white'
                  }`}
               >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
               </button>
            ))}
         </div>
         <button 
            onClick={() => {
              if (!token && !showForm) {
                alert('Debes iniciar sesión para publicar tu negocio.');
                return;
              }
              setShowForm(!showForm);
            }}
            className="w-full md:w-auto bg-indigo-600 hover:bg-white hover:text-black px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 text-center"
         >
            {showForm ? '✕ Cerrar Formulario' : '＋ Publicar Mi Negocio'}
         </button>
      </div>

      {showForm && (
        <form onSubmit={handleRegister} className="bg-slate-900 border border-white/10 p-10 rounded-[40px] animate-in slide-in-from-top-10 duration-500 space-y-8">
           <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Registrar Emprendimiento ({activeEdicionNombre})</h4>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <input name="nombre_negocio" required placeholder="Nombre de tu negocio" className="bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm outline-none focus:border-indigo-500" />
              <input name="whatsapp" required placeholder="WhatsApp (Ej: 6621234567)" className="bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm outline-none focus:border-indigo-500" />
              <select name="categoria" className="bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm outline-none">
                 {CATEGORIAS.filter(c => c.id !== 'todas').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <textarea name="descripcion" required placeholder="Describe lo que vendes u ofreces..." className="md:col-span-3 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm outline-none h-32 resize-none focus:border-indigo-500" />
              
              <div className="md:col-span-3 space-y-4">
                 <label className="text-[10px] uppercase font-black text-indigo-400 tracking-widest">Puesto Seleccionado en la Calle de la Cultura</label>
                 <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 max-h-48 overflow-y-auto pr-2 border border-white/5 p-4 rounded-2xl bg-black/10">
                    {catalogoPuestos.map((p) => {
                       const isOccupied = mapLocations.some(loc => Number(loc.puesto_id) === Number(p.id));
                       return (
                          <div 
                             key={p.id}
                             onClick={() => !isOccupied && setSelectedPuesto(p.id)}
                             className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                                selectedPuesto === p.id ? 'bg-indigo-600 border-white text-white' : 
                                (isOccupied ? 'opacity-30 bg-slate-800 border-white/5 cursor-not-allowed' : 'bg-black/20 border-white/10 text-white/40 hover:border-indigo-500')
                             }`}
                          >
                             <span className="text-[10px] font-black">{p.zona ? p.zona[0].toUpperCase() : 'P'}{p.id}</span>
                          </div>
                       );
                    })}
                 </div>
                 <input type="hidden" name="puesto_id" value={selectedPuesto || ''} />
              </div>

              <input name="instagram" placeholder="Usuario de Instagram (Opcional, Ej: cesa_unison)" className="md:col-span-3 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm outline-none focus:border-indigo-500" />
              <input name="ubicacion" placeholder="Referencia física adicional (Ej: Frente a Rectoría)" className="md:col-span-3 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-sm outline-none" />
           </div>
           <button type="submit" disabled={loading} className="w-full bg-indigo-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white hover:text-black transition-all">
             {loading ? 'Registrando...' : 'Registrar Negocio 🚀'}
           </button>
        </form>
      )}

      {/* Grid List of Participantes */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Directorio de Emprendedores</h3>
          <p className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Catálogo de participantes validados para esta edición</p>
        </div>

        {productos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productos.map((prod) => (
              <div key={prod.id} className="bg-slate-900/40 rounded-[32px] border border-white/5 p-8 flex flex-col group hover:border-indigo-500/50 transition-all relative">
                 
                 {/* Karma Widget */}
                 <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 bg-slate-950 p-2 rounded-2xl border border-white/5 shadow-2xl z-10">
                    <button 
                      onClick={() => handleVote(prod.id, 1)}
                      className={`p-2 rounded-lg transition-all ${prod.user_vote === 1 ? 'text-indigo-500 bg-indigo-500/10' : 'text-slate-600 hover:text-white'}`}
                    >
                      <i className="fas fa-arrow-up text-xs"></i>
                    </button>
                    <span className={`text-[10px] font-black ${prod.score > 0 ? 'text-indigo-400' : (prod.score < 0 ? 'text-red-400' : 'text-slate-600')}`}>
                      {prod.score || 0}
                    </span>
                    <button 
                      onClick={() => handleVote(prod.id, -1)}
                      className={`p-2 rounded-lg transition-all ${prod.user_vote === -1 ? 'text-indigo-500 bg-indigo-500/10' : 'text-slate-600 hover:text-white'}`}
                    >
                      <i className="fas fa-arrow-down text-xs"></i>
                    </button>
                 </div>

                 <div className="flex justify-between items-start mb-4">
                    <h4 className="text-white font-black text-lg uppercase tracking-tight truncate pr-4">{prod.nombre_negocio}</h4>
                    {prod.verificado && <span className="text-[7px] bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">Verificado</span>}
                 </div>
                 <p className="text-white/40 text-[9px] uppercase font-black tracking-widest mb-4 flex items-center gap-2">
                    <i className="fas fa-tag"></i> {prod.categoria} • <i className="fas fa-map-marker-alt"></i> Puesto #{prod.puesto_id} {prod.ubicacion ? `(${prod.ubicacion})` : ''}
                 </p>
                 <p className="text-white/70 text-xs leading-relaxed mb-6 flex-1 line-clamp-3">{prod.descripcion}</p>
                 <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <div className="text-[8px] uppercase font-black text-white/20">Por: {prod.nombre_completo}</div>
                    <a href={`https://wa.me/${prod.whatsapp}`} className="bg-white text-black px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Contactar</a>
                 </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-12 text-center text-slate-500 text-xs font-medium">
             No hay emprendimientos registrados o verificados en esta edición aún.
          </div>
        )}
      </div>

      {/* ARCHIVO DE EDICIONES ANTERIORES */}
      <div className="pt-12 border-t border-white/5 space-y-6">
        <div>
          <h4 className="text-xl font-black text-white uppercase tracking-tighter">Archivo del Bazar CESA</h4>
          <p className="text-[9px] uppercase font-black tracking-widest text-slate-500 mt-1">Explora las ediciones y participantes históricos</p>
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
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isActive 
                    ? 'bg-indigo-500/10 border-indigo-500 text-white shadow-lg shadow-indigo-500/5' 
                    : 'bg-slate-900/30 border-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-black text-xs uppercase tracking-wider">{ed.nombre}</h5>
                    {ed.activo === 1 && (
                      <span className="text-[6px] bg-green-500/15 border border-green-500/30 text-green-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">
                        Activa
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-500 mt-1 font-semibold">
                    Inicio: {new Date(ed.fecha_inicio).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                
                <div className="mt-8 flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                  <span>Ver participantes</span>
                  <i className="fas fa-arrow-right text-indigo-400"></i>
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
