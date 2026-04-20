'use client';

import React, { useState, useEffect } from 'react';

interface Producto {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  categoria: string;
  imagen_url?: string | null;
  whatsapp_contacto?: string;
  vendedor: string;
}

const CATEGORIAS = [
  { id: 'todas', label: 'Todos', icon: '🛍️' },
  { id: 'comida', label: 'Comida', icon: '🍕' },
  { id: 'servicios', label: 'Servicios', icon: '🛠️' },
  { id: 'tecnologia', label: 'Tech', icon: '💻' },
  { id: 'manualidades', label: 'Artesanía', icon: '🎨' },
  { id: 'ropa', label: 'Moda', icon: '👕' },
];

const BazarGrid = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [activeCat, setActiveCat] = useState('todas');
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [newTitle, setNewTitle] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCat, setNewCat] = useState('comida');

  useEffect(() => {
    fetchProductos();
  }, [activeCat]);

  const fetchProductos = async () => {
    try {
      const res = await fetch(`http://localhost:8000/bazar.php?categoria=${activeCat}`);
      const data = await res.json();
      if (data.success) setProductos(data.productos);
    } catch (e) {
      console.error("Error bazar", e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24">
      {/* Category Bar */}
      <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide no-scrollbar justify-center">
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`glass px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shrink-0 ${
              activeCat === cat.id ? 'border-[var(--primary)] text-white bg-white/10' : 'text-white/40 hover:text-white'
            }`}
          >
            <span>{cat.icon}</span>
            <span className="text-sm font-bold">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center mb-10 mt-4">
        <h3 className="text-xl font-black text-white uppercase tracking-widest">
            {CATEGORIAS.find(c => c.id === activeCat)?.label} <span className="text-[var(--primary)]">Estudiantil</span>
        </h3>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-xs flex items-center gap-2"
        >
          {showForm ? '✕ Cancelar' : '＋ Publicar Negocio'}
        </button>
      </div>

      {showForm && (
        <div className="glass p-8 mb-12 border-[var(--primary)] animate-in zoom-in-95 duration-300">
           <h4 className="font-bold text-white mb-6 uppercase tracking-tighter">Nuevo Emprendimiento</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input 
                type="text" 
                placeholder="Nombre del Producto/Servicio" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--primary)] outline-none"
              />
              <input 
                type="number" 
                placeholder="Precio ($ MXN)" 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[var(--primary)] outline-none"
              />
              <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/50 focus:border-[var(--primary)] outline-none">
                {CATEGORIAS.filter(c => c.id !== 'todas').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
           </div>
           <button className="btn-primary mt-6 px-10">Publicar Venta</button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {productos.map((prod) => (
          <div key={prod.id} className="glass group hover:scale-[1.03] transition-all duration-300 flex flex-col overflow-hidden border-white/5 hover:border-[var(--primary)] shadow-xl">
            <div className="h-48 bg-white/5 relative flex items-center justify-center text-4xl grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
              {CATEGORIAS.find(c => c.id === prod.categoria)?.icon || '📦'}
              {prod.imagen_url && (
                 <img src={`http://localhost:8000/${prod.imagen_url}`} className="absolute inset-0 w-full h-full object-cover" alt={prod.titulo} />
              )}
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-bold text-lg leading-tight uppercase tracking-tighter">{prod.titulo}</h4>
                <div className="text-[var(--accent)] font-black text-lg">${prod.precio}</div>
              </div>
              
              <p className="text-[var(--text-muted)] text-xs mb-4 flex-1 line-clamp-3">
                {prod.descripcion}
              </p>
              
              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase tracking-widest text-white/30 font-black">Emprendedor(a)</span>
                  <span className="text-white text-[10px] font-bold">{prod.vendedor}</span>
                </div>
                {prod.whatsapp_contacto && (
                  <a 
                    href={`https://wa.me/52${prod.whatsapp_contacto}`} 
                    target="_blank"
                    className="bg-green-500/10 hover:bg-green-500/20 text-green-400 text-[10px] font-black px-3 py-1.5 rounded-lg border border-green-500/20 transition-all uppercase tracking-tighter"
                  >
                    Contactar
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BazarGrid;
