import React, { useState, useEffect } from 'react';
import Hero from './components/Hero';
import SocietyCard from './components/SocietyCard';
import BoardMembers from './components/BoardMembers';
import Coordinaciones from './components/Coordinaciones';
import MuroThread from './components/MuroThread';
import BazarMap from './components/BazarMap';
import AcademicProfile from './components/AcademicProfile';
import InstallPrompt from './components/InstallPrompt';
import directorioData from './data/directorio.json';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('directorio');
  const [societies, setSocieties] = useState([]);
  const [filteredSocieties, setFilteredSocieties] = useState([]);
  const [muroPosts, setMuroPosts] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [loading, setLoading] = useState(false);

  // Persistence: Check if user is logged in (simulated for demo, but calls /api/perfil.php)
  useEffect(() => {
    fetch('/api/perfil.php')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProfileData(data.data);
        }
      })
      .catch(err => console.error("Not logged in or error:", err));
  }, []);

  useEffect(() => {
    const validData = directorioData.filter(item => item.Carrera && item.Carrera.trim() !== "");
    setSocieties(validData);
    setFilteredSocieties(validData);
  }, []);

  useEffect(() => {
    const results = societies.filter(s => 
      s.Carrera.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.Siglas && s.Siglas.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredSocieties(results);
  }, [searchTerm, societies]);

  // Fetch Muro Posts
  useEffect(() => {
    if (activeTab === 'muro') {
      setLoading(true);
      fetch('/api/muro.php?coordinacion=todos')
        .then(res => res.json())
        .then(data => {
          if (data.success) setMuroPosts(data.posts);
          setLoading(false);
        });
    }
  }, [activeTab]);

  const handleAddComment = async (postId, content, parentId = null) => {
    const formData = new FormData();
    formData.append('post_id', postId);
    formData.append('comentario', content);
    if (parentId) formData.append('parent_id', parentId);

    try {
      const res = await fetch('/api/muro.php?action=comentar', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
         // Re-fetch posts to show new comment (simplified)
         const refresh = await fetch('/api/muro.php?coordinacion=todos');
         const newData = await refresh.json();
         setMuroPosts(newData.posts);
      }
    } catch (err) { console.error("Error commenting", err); }
  };

  return (
    <div className="app-wrapper min-h-screen bg-[#0a0a0f] text-white">
      {/* Navigation Layer */}
      <nav className="glass sticky top-6 mx-auto w-[calc(100%-2rem)] max-w-6xl z-[1000] px-8 py-4 flex justify-between items-center transition-all duration-500">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setActiveTab('directorio')}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">🎓</div>
          <div className="font-black text-xl tracking-tighter">
            CESA<span className="text-indigo-500">UNISON</span>
          </div>
        </div>
        
        <div className="hidden md:flex gap-8 text-[10px] uppercase font-black tracking-widest text-white/40">
          {['Directorio', 'Muro', 'Bazar', 'Perfil'].map((tab) => (
            <span 
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`cursor-pointer hover:text-white transition-colors relative py-2 ${activeTab === tab.toLowerCase() ? 'text-white' : ''}`}
            >
              {tab}
              {activeTab === tab.toLowerCase() && (
                <span className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500 rounded-full animate-widthGrow"></span>
              )}
            </span>
          ))}
        </div>

        <button className="bg-white text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-indigo-500/10">
          {profileData ? profileData.nombre_completo.split(' ')[0] : 'Ingresar'}
        </button>
      </nav>

      {/* Main Content Area */}
      <div className="content-container py-12">
        {activeTab === 'directorio' && (
          <div className="animate-fadeIn">
            <Hero />
            <BoardMembers />
            <Coordinaciones />
            
            <main className="container" id="directorio" style={{ paddingBottom: '8rem' }}>
              <div className="text-center mb-16">
                <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter">Directorio de <span className="gradient-text">Sociedades</span></h2>
                <p className="text-sm text-white/40 font-bold uppercase tracking-widest italic">Vinculación Estudiantil 2026-2028</p>
              </div>

              <div className="glass p-6 mb-12 flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1 relative w-full">
                  <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-white/20"></i>
                  <input 
                    type="text" 
                    placeholder="Filtrar por carrera (ej: Derecho, Sistemas)..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="directory-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSocieties.map((society, index) => (
                  <SocietyCard key={index} society={society} />
                ))}
              </div>
            </main>
          </div>
        )}

        {activeTab === 'muro' && (
          <div className="container max-w-4xl mx-auto px-4 py-12 animate-fadeIn">
             <div className="text-center mb-12">
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Muro <span className="text-indigo-500">Social</span></h2>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.3em]">Hilos de Discusión • Comunidad UNISON</p>
             </div>
             {loading ? (
                <div className="p-20 text-center text-white/10 italic">Cargando hilos...</div>
             ) : (
                muroPosts.map(post => (
                  <MuroThread key={post.id} post={post} onAddComment={handleAddComment} />
                ))
             )}
          </div>
        )}

        {activeTab === 'bazar' && (
          <div className="container mx-auto px-4 py-12 animate-fadeIn">
             <div className="text-center mb-12">
                <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Bazar <span className="text-indigo-500">Emprendedor</span></h2>
                <p className="text-[10px] text-white/40 uppercase font-black tracking-[0.3em]">Mapa Interactivo de Negocios Estudiantiles</p>
             </div>
             <BazarMap />
          </div>
        )}

        {activeTab === 'perfil' && (
          <div className="container mx-auto px-4 py-12 max-w-6xl">
             {profileData ? (
                <AcademicProfile profile={profileData} />
             ) : (
                <div className="glass-panel p-20 text-center">
                   <div className="text-4xl mb-4">🔐</div>
                   <h3 className="text-xl font-bold mb-2">Acceso Restringido</h3>
                   <p className="text-white/40 text-sm max-w-xs mx-auto mb-8">Debes iniciar sesión con tu cuenta institucional para ver tu progreso académico.</p>
                   <button className="bg-indigo-600 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs">Simular Login</button>
                </div>
             )}
          </div>
        )}
      </div>

      {/* Floating Chatbot */}
      <div className="fixed bottom-8 right-8 z-[2000]">
         <button 
           onClick={() => setShowChatbot(!showChatbot)}
           className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-2xl shadow-indigo-500/40 flex items-center justify-center group overflow-hidden"
         >
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
            <i className={`fas ${showChatbot ? 'fa-times' : 'fa-comment-alt'} text-xl transition-all duration-300`}></i>
         </button>

         {showChatbot && (
           <div className={`
             fixed sm:absolute bottom-24 right-0 sm:right-0 w-full sm:w-96 
             h-[calc(100vh-140px)] sm:h-[500px] glass-panel p-0 flex flex-col 
             animate-slideUp shadow-2xl border-white/10
           `}>
              <div className="p-4 bg-white/5 border-b border-white/5 flex items-center gap-3">
                 <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-xs">🤖</div>
                 <div>
                    <h4 className="text-xs font-bold">Asistente CESA</h4>
                    <span className="text-[9px] text-green-500 font-bold uppercase tracking-widest">En línea</span>
                 </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto space-y-4 text-xs">
                 <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none max-w-[80%] border border-white/5">
                    ¡Hola! Soy tu asistente IA del CESA. Puedo ayudarte con dudas sobre becas, trámites de la UNISON o navegar por el muro. ¿En qué te ayudo hoy?
                 </div>
                 <div className="bg-indigo-600 p-4 rounded-2xl rounded-tr-none max-w-[80%] ml-auto shadow-lg shadow-indigo-500/20">
                    ¿Cómo calculo mi semestre real?
                 </div>
                 <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none max-w-[80%] border border-white/5">
                    De acuerdo al SDD v3.5, sumamos tus créditos aprobados y los dividimos entre 45 (promedio por semestre). ¡Vete a tu pestaña de Perfil para ver tu cálculo exacto!
                 </div>
              </div>
              <div className="p-4 bg-black/20 border-t border-white/5 flex gap-2">
                 <input 
                   type="text" 
                   placeholder="Escribe un mensaje..."
                   className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-indigo-500 transition-all"
                 />
                 <button className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transition-all hover:bg-white hover:text-black">
                    <i className="fas fa-paper-plane"></i>
                  </button>
              </div>
           </div>
         )}
      </div>

      <footer className="border-t border-white/5 py-12 bg-black/40 text-center">
        <div className="container">
          <div className="font-black text-2xl tracking-tighter mb-8">
            CESA<span className="text-indigo-500">UNISON</span>
          </div>
          <div className="flex justify-center gap-12 mb-8 text-[10px] uppercase font-bold tracking-[0.2em] text-white/30">
             <a href="#" className="hover:text-indigo-400">Privacidad</a>
             <a href="#" className="hover:text-indigo-400">Reglamento</a>
             <a href="#" className="hover:text-indigo-400">Directorio</a>
          </div>
          <p className="text-[10px] text-white/10 font-bold uppercase tracking-widest">
            © 2026 Consejo Estudiantil de Sociedades de Alumnos - UNISON
          </p>
        </div>
      </footer>

      {/* PWA & Notifications Dialog */}
      <InstallPrompt />
    </div>
  );
};

export default App;
