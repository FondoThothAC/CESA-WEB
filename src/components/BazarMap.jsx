import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

/**
 * BazarMap v2.0 - CESA Glass Identity
 * Mapa interactivo con geocodificación en tiempo real y estética industrial.
 */

// Fix de iconos para ambiente React/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Icono personalizado Premium CESA (Dorado/Indigo)
const goldMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const BazarMap = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

  // Centro: Rectoría UNISON Hermosillo
  const center = [29.0825, -110.9620]; 

  useEffect(() => {
    fetch('/api/bazar.php?action=listar_ubicaciones')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setLocations(data.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error al cargar coordenadas del Bazar:", err);
        setLoading(false);
      });
  }, []);

  // Fix para el error de mapa gris en SPAs (Resize Observer)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [loading]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[500px] bg-slate-900/50 rounded-[40px] border border-white/5 animate-pulse">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Localizando Emprendedores...</p>
    </div>
  );

  return (
    <div className="relative group">
      {/* Marco Decorativo Glass */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-amber-500 rounded-[42px] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
      
      <div className="relative bg-slate-950 border border-white/10 rounded-[40px] overflow-hidden shadow-2xl" style={{ height: '550px' }}>
        <MapContainer 
          center={center} 
          zoom={16} 
          scrollWheelZoom={false} 
          whenCreated={(mapInstance) => { mapRef.current = mapInstance }}
          className="h-full w-full"
          style={{ background: '#0f172a' }}
        >
          {/* Estilo de Mapa Oscuro (CartoDB Dark Matter) */}
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {locations.map(loc => (
            <Marker 
              key={loc.id} 
              position={[parseFloat(loc.ubicacion_lat), parseFloat(loc.ubicacion_lng)]}
              icon={goldMarker}
            >
              <Popup>
                <div className="min-w-[180px] p-1 font-sans">
                  <h4 className="text-sm font-black text-slate-900 mb-1 leading-tight">{loc.nombre_negocio}</h4>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-indigo-600 mb-2">{loc.categoria}</p>
                  <p className="text-[10px] text-slate-500 mb-3 block border-l-2 border-slate-200 pl-2">
                    {loc.ubicacion || 'Sin ubicación específica'}
                  </p>
                  <a 
                    href={`/bazar/${loc.slug}`}
                    className="block text-center bg-slate-900 text-white text-[9px] font-black uppercase py-2 rounded-lg hover:bg-indigo-600 transition-colors"
                  >
                    Visitar Perfil
                  </a>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Overlay informativo */}
        <div className="absolute top-6 left-6 z-[1000] pointer-events-none">
            <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-xl">
                <h3 className="text-white font-black text-xs uppercase tracking-widest mb-1">Mapa de <span className="text-amber-500">Talento</span></h3>
                <p className="text-slate-400 text-[9px] font-bold uppercase">{locations.length} Emprendimientos registrados</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BazarMap;
