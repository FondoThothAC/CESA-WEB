'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/useAuth';
import AdminInvitations from './AdminInvitations';
import VotingConfig from './organisms/VotingConfig';
import AdminIAConfigTab from './organisms/AdminIAConfigTab';
import AdminSocialTab from './organisms/AdminSocialTab';
import AdminRagKnowledgeTab from './organisms/AdminRagKnowledgeTab';
import AdminSentimentDashboardTab from './organisms/AdminSentimentDashboardTab';
import AdminBazarDashboardTab from './organisms/AdminBazarDashboardTab';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'kpis' | 'bazar_ads' | 'moderacion' | 'directorio' | 'ia_config' | 'social' | 'invitaciones' | 'acceso' | 'modo_dios' | 'vacantes' | 'padron' | 'votaciones' | 'auditoria' | 'rag_knowledge' | 'sentimiento'>('kpis');
  const [stats, setStats] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);
  const [accessLoading, setAccessLoading] = useState(false);
  const [accessResult, setAccessResult] = useState<any>(null);
  const [pendingBazar, setPendingBazar] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [directory, setDirectory] = useState<any[]>([]);
  const [pendingVacancies, setPendingVacancies] = useState<any[]>([]);
  const [iaConfigs, setIaConfigs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Perfil Holístico
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const { token, user } = useAuth();
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

  // Estados del Panel Social
  const [socialConfig, setSocialConfig] = useState<any>(null);
  const [socialLoading, setSocialLoading] = useState(true);
  const [igFormData, setIgFormData] = useState({
    client_id: '',
    client_secret: '',
    page_id: '',
    instagram_business_id: ''
  });
  const [waFormData, setWaFormData] = useState({
    phone_number_id: '',
    waba_id: '',
    access_token: '',
    verify_token: ''
  });
  const [testPublishing, setTestPublishing] = useState(false);
  const [testPostData, setTestPostData] = useState({
    image_url: '',
    caption: ''
  });

  // Estados del Modo Dios (Publicidad)
  const [adConfig, setAdConfig] = useState({
    activo: false,
    publisher_id: '',
    banner_slot_id: '',
    interstitial_slot_id: '',
    frecuencia_diaria: 2
  });
  const [adLoading, setAdLoading] = useState(false);

  // Estados de Asignación Granular de Permisos (para software@fondothoth.com)
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [permFormData, setPermFormData] = useState({
    rol: '',
    publicar_anuncios: false,
    bazar_y_reservaciones: false,
    bolsa_trabajo: false,
    roles_social: false,
    ver_denuncias: false,
    rol_comunicacion: false,
    consejo_elecciones: false,
    permiso_ia: false,
    permiso_wifi: false
  });
  
  // Subida de Padrón CSV
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadingPadron, setUploadingPadron] = useState(false);

  // Estados de Auditoría
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [chatTotal, setChatTotal] = useState(0);
  const [chatPage, setChatPage] = useState(0);
  const [chatSearch, setChatSearch] = useState('');
  const [chatStartDate, setChatStartDate] = useState('');
  const [chatEndDate, setChatEndDate] = useState('');

  const [mensajesHistory, setMensajesHistory] = useState<any[]>([]);
  const [mensajesTotal, setMensajesTotal] = useState(0);
  const [mensajesPage, setMensajesPage] = useState(0);
  const [mensajesSearch, setMensajesSearch] = useState('');
  const [mensajesStartDate, setMensajesStartDate] = useState('');
  const [mensajesEndDate, setMensajesEndDate] = useState('');

  const [auditLoading, setAuditLoading] = useState(false);
  const chatLimit = 10;
  const mensajesLimit = 10;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('tab') === 'social') {
        setActiveTab('social');
      }
      if (params.get('connected') === 'true') {
        alert('¡Instagram conectado con éxito!');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (params.get('error')) {
        alert('Error al conectar Instagram: ' + params.get('error'));
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      if (activeTab === 'kpis') {
         fetchStats();
         fetchHealth();
      } else if (activeTab === 'moderacion') {
         fetchModerationData();
      } else if (activeTab === 'directorio') {
         fetchDirectory();
      } else if (activeTab === 'vacantes') {
         fetchVacancies();
      } else if (activeTab === 'ia_config') {
         fetchIaConfig();
      } else if (activeTab === 'social') {
         fetchSocialConfig();
      } else if (activeTab === 'modo_dios') {
         fetchAdConfig();
      } else if (activeTab === 'auditoria') {
         fetchChatHistory();
         fetchMensajesHistory();
      }
    }
  }, [token, activeTab, searchQuery, chatPage, mensajesPage]);

  const fetchAdConfig = async () => {
    setAdLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/publicidad.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAdConfig({
          activo: data.data.activo == 1,
          publisher_id: data.data.publisher_id || '',
          banner_slot_id: data.data.banner_slot_id || '',
          interstitial_slot_id: data.data.interstitial_slot_id || '',
          frecuencia_diaria: parseInt(data.data.frecuencia_diaria) || 2
        });
      }
    } catch (e) {
      console.error("Error al obtener publicidad_config", e);
    } finally {
      setAdLoading(false);
    }
  };

  const handleSaveAdConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/publicidad.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adConfig)
      });
      const data = await res.json();
      if (data.success) {
        alert("Configuración de publicidad guardada con éxito.");
        fetchAdConfig();
      } else {
        alert(data.error || "Error al guardar la configuración de publicidad.");
      }
    } catch (e) {
      alert("Error de conexión con el backend.");
    } finally {
      setAdLoading(false);
    }
  };

  const fetchSocialConfig = async () => {
    setSocialLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/social/config`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setSocialConfig(data);
        if (data.instagram) {
          setIgFormData({
            client_id: data.instagram.client_id || '',
            client_secret: '',
            page_id: data.instagram.page_id || '',
            instagram_business_id: data.instagram.instagram_business_id || ''
          });
        }
        if (data.whatsapp) {
          setWaFormData({
            phone_number_id: data.whatsapp.phone_number_id || '',
            waba_id: data.whatsapp.waba_id || '',
            access_token: '',
            verify_token: data.whatsapp.verify_token || ''
          });
        }
      }
    } catch (e) {
      console.error('Error fetching social config', e);
    } finally {
      setSocialLoading(false);
    }
  };

  const handleSaveSocial = async (platform: 'instagram' | 'whatsapp', data: any) => {
    try {
      const res = await fetch(`${API_URL}/api/social/config`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ platform, ...data })
      });
      const resData = await res.json();
      if (resData.success) {
        alert('Configuración guardada correctamente.');
        fetchSocialConfig();
      } else {
        alert('Error al guardar la configuración.');
      }
    } catch (err) {
      alert('Error de conexión.');
    }
  };

  const handleTestPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPostData.image_url) return alert('Por favor ingresa la URL de la imagen.');
    setTestPublishing(true);
    try {
      const res = await fetch(`${API_URL}/api/social/instagram/post`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testPostData)
      });
      const data = await res.json();
      if (data.success) {
        alert('¡Publicación exitosa en Instagram! ID: ' + data.media_id);
        setTestPostData({ image_url: '', caption: '' });
      } else {
        alert('Error al publicar: ' + data.error);
      }
    } catch (err) {
      alert('Error de conexión con la API social.');
    } finally {
      setTestPublishing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/stats.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setStats(data.analytics);
    } catch (e) { console.error("Error stats", e); }
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/health.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setHealth(data);
    } catch (e) { console.error("Error health", e); }
  };

  const fetchChatHistory = async () => {
    setAuditLoading(true);
    try {
      const offset = chatPage * chatLimit;
      const params = new URLSearchParams({
        limit: chatLimit.toString(),
        offset: offset.toString(),
        search: chatSearch,
        start_date: chatStartDate,
        end_date: chatEndDate
      });
      const res = await fetch(`${API_URL}/api/admin/chat-history.php?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setChatHistory(data.data || []);
        setChatTotal(data.totalCount || 0);
      }
    } catch (e) {
      console.error("Error fetching chat history", e);
    } finally {
      setAuditLoading(false);
    }
  };

  const fetchMensajesHistory = async () => {
    setAuditLoading(true);
    try {
      const offset = mensajesPage * mensajesLimit;
      const params = new URLSearchParams({
        limit: mensajesLimit.toString(),
        offset: offset.toString(),
        search: mensajesSearch,
        start_date: mensajesStartDate,
        end_date: mensajesEndDate
      });
      const res = await fetch(`${API_URL}/api/admin/mensajes-history.php?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMensajesHistory(data.data || []);
        setMensajesTotal(data.totalCount || 0);
      }
    } catch (e) {
      console.error("Error fetching messages history", e);
    } finally {
      setAuditLoading(false);
    }
  };

  const exportChatCSV = () => {
    const params = new URLSearchParams({
      limit: '5000',
      offset: '0',
      search: chatSearch,
      start_date: chatStartDate,
      end_date: chatEndDate
    });
    fetch(`${API_URL}/api/admin/chat-history.php?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          const headers = ['ID', 'Fecha', 'Usuario ID', 'Nombre Usuario', 'Mensaje', 'Respuesta', 'Proveedor', 'Latencia (ms)', 'Accion Detectada', 'IP', 'Dispositivo', 'Ciudad', 'Pais'];
          const rows = data.data.map((r: any) => [
            r.id,
            r.created_at,
            r.usuario_id || 'Anon',
            r.usuario_nombre || 'Anon',
            `"${(r.mensaje || '').replace(/"/g, '""')}"`,
            `"${(r.respuesta || '').replace(/"/g, '""')}"`,
            r.provider,
            r.latency_ms,
            r.accion_detectada,
            r.ip_address,
            `"${(r.user_agent || '').replace(/"/g, '""')}"`,
            r.geoloc_city || '',
            r.geoloc_country || ''
          ]);
          
          const csvContent = "\uFEFF" + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `auditoria_chatbot_${new Date().toISOString().slice(0,10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
  };

  const exportDirectorioCSV = () => {
    if (!directory || directory.length === 0) {
      alert("No hay usuarios para exportar");
      return;
    }
    const headers = ['ID', 'Expediente', 'Nombre', 'Email', 'Rol', 'Carrera', 'Semestre', 'Turno'];
    const rows = directory.map((u: any) => [
      u.id,
      u.expediente || '',
      `"${(u.nombre_completo || '').replace(/"/g, '""')}"`,
      u.email || '',
      u.rol || '',
      u.carrera || '',
      u.semestre || '',
      u.turno || ''
    ]);
    const csvContent = "\uFEFF" + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `directorio_usuarios_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportMensajesCSV = () => {
    const params = new URLSearchParams({
      limit: '5000',
      offset: '0',
      search: mensajesSearch,
      start_date: mensajesStartDate,
      end_date: mensajesEndDate
    });
    fetch(`${API_URL}/api/admin/mensajes-history.php?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          const headers = ['ID', 'Fecha', 'Emisor ID', 'Nombre Emisor', 'Receptor ID', 'Nombre Receptor', 'Contenido', 'Leido', 'IP', 'Dispositivo', 'Ciudad', 'Pais'];
          const rows = data.data.map((r: any) => [
            r.id,
            r.created_at,
            r.emisor_id,
            r.emisor_nombre || '',
            r.receptor_id,
            r.receptor_nombre || '',
            `"${(r.contenido || '').replace(/"/g, '""')}"`,
            r.leido == 1 ? 'Si' : 'No',
            r.ip_address,
            `"${(r.user_agent || '').replace(/"/g, '""')}"`,
            r.geoloc_city || '',
            r.geoloc_country || ''
          ]);
          
          const csvContent = "\uFEFF" + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `auditoria_mensajes_${new Date().toISOString().slice(0,10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      });
  };

  const exportTelemetriaCSV = () => {
    setAuditLoading(true);
    fetch(`${API_URL}/api/admin/telemetria.php`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.success && data.data) {
          const headers = [
            'Tipo Examen',
            'Intento ID',
            'Usuario ID',
            'Nombre Completo',
            'Email',
            'Expediente_Matricula',
            'Carrera',
            'Examen_Skill',
            'Fecha Inicio',
            'Fecha Fin',
            'Puntaje',
            'Estado',
            'Direccion IP',
            'Dispositivo_User_Agent'
          ];
          const rows = data.data.map((r: any) => [
            `"${(r.tipo_examen || '').replace(/"/g, '""')}"`,
            r.intento_id,
            r.usuario_id,
            `"${(r.nombre_completo || '').replace(/"/g, '""')}"`,
            `"${(r.email || '').replace(/"/g, '""')}"`,
            `"${(r.matricula || '').replace(/"/g, '""')}"`,
            `"${(r.carrera || '').replace(/"/g, '""')}"`,
            `"${(r.examen_nombre || '').replace(/"/g, '""')}"`,
            r.fecha_inicio || '',
            r.fecha_fin || '',
            r.puntaje !== null ? r.puntaje : '',
            `"${(r.estado || '').replace(/"/g, '""')}"`,
            `"${(r.ip_address || '').replace(/"/g, '""')}"`,
            `"${(r.user_agent || '').replace(/"/g, '""')}"`
          ]);
          
          const csvContent = "\uFEFF" + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `telemetria_examenes_${new Date().toISOString().slice(0,10)}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          alert(data.error || "No se pudieron obtener los datos de telemetría.");
        }
      })
      .catch(e => {
        console.error("Error exporting telemetry", e);
        alert("Error de red al exportar telemetría.");
      })
      .finally(() => {
        setAuditLoading(false);
      });
  };

  const fetchModerationData = async () => {
     try {
        const resB = await fetch(`${API_URL}/api/admin/bazar.php?action=listar`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataB = await resB.json();
        if (dataB.success) setPendingBazar(dataB.data);

        const resR = await fetch(`${API_URL}/api/reportes.php?action=moderacion`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        const dataR = await resR.json();
        if (dataR.success) setReports(dataR.data.filter((r: any) => r.estado === 'nuevo' || r.estado === 'asignado'));
     } catch (e) { console.error("Error moderation fetch", e); }
  };

  const handleTogglePermission = async (userObj: any, permKey: string, currentValue: boolean) => {
    const permissionsKeys = [
      'publicar_anuncios',
      'bazar_y_reservaciones',
      'bolsa_trabajo',
      'roles_social',
      'ver_denuncias',
      'rol_comunicacion',
      'consejo_elecciones',
      'permiso_ia',
      'permiso_wifi'
    ];
    
    const extra: any = {};
    permissionsKeys.forEach(k => {
      let val = userObj[k];
      if (k === permKey) {
        val = currentValue ? '0' : '1';
      } else {
        val = val == 1 ? '1' : '0';
      }
      extra[k] = val;
    });

    setDirectory(prev => prev.map(u => {
      if (u.id === userObj.id) {
        return { ...u, [permKey]: currentValue ? 0 : 1 };
      }
      return u;
    }));

    await handleModeration('user', userObj.id, 'update_permissions', extra);
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    setDirectory(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, rol: newRole };
      }
      return u;
    }));

    await handleModeration('user', userId, 'update_role', { rol: newRole });
  };

  const fetchDirectory = async () => {
     try {
        const res = await fetch(`${API_URL}/api/admin/usuarios.php?q=${searchQuery}`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setDirectory(data.data);
     } catch (e) {}
  };

  const fetchVacancies = async () => {
     try {
        const res = await fetch(`${API_URL}/api/admin/empleos.php?action=listar`, {
           headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setPendingVacancies(data.data.filter((v: any) => !v.verificada));
     } catch (e) {}
  };

  const fetchProfile = async (id: number) => {
    setSelectedProfileId(id);
    setProfileLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/perfil_holistico.php?id=${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setProfileData(data.perfil);
      else { alert('Error al cargar perfil'); setSelectedProfileId(null); }
    } catch(e) {
      alert('Error de red al cargar perfil');
      setSelectedProfileId(null);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUploadPadron = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) return alert("Selecciona un archivo CSV.");
    setUploadingPadron(true);
    const formData = new FormData();
    formData.append('action', 'upload_padron');
    formData.append('csv_file', csvFile);

    try {
      const res = await fetch(`${API_URL}/api/admin/usuarios.php`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setCsvFile(null);
      } else {
        alert(data.error);
      }
    } catch(e) {
      alert("Error al subir el CSV");
    } finally {
      setUploadingPadron(false);
    }
  };

  const fetchIaConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/config.php`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setIaConfigs(data.data);
    } catch (e) {}
  };

  const handleAccessValidation = async (qrData: string) => {
    setAccessLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/acceso.php`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ qr_data: qrData })
      });
      const data = await res.json();
      setAccessResult(data);
    } catch (e) {
      alert("Error de conexión con el validador");
    } finally {
      setAccessLoading(false);
    }
  };

  const handleModeration = async (type: 'bazar' | 'reporte' | 'vacante' | 'user', id: number, action: string, extra = {}) => {
     const formData = new FormData();
     formData.append('id', id.toString());
     formData.append('action', action);
     Object.entries(extra).forEach(([k, v]) => formData.append(k, v as string));

     const endpoint = (type === 'user') ? '/api/admin/usuarios.php' : '/api/admin/moderacion.php';

     try {
        const res = await fetch(`${API_URL}${endpoint}`, {
           method: 'POST',
           headers: { 'Authorization': `Bearer ${token}` },
           body: formData
        });
        const data = await res.json();
        if (data.success) {
           if (type === 'bazar' || type === 'reporte') fetchModerationData();
           if (type === 'vacante') fetchVacancies();
           if (type === 'user') fetchDirectory();
        }
     } catch (e) { alert("Error al procesar"); }
  };

  const saveIaConfig = async (config: any) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/config.php`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      const data = await res.json();
      if (data.success) {
        alert("IA Configurada correctamente");
        fetchIaConfig();
      }
    } catch (e) { alert("Error al guardar IA Config"); }
  };

  const handleSavePermissions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    // 1. Actualizar Rol
    await handleModeration('user', selectedUser.id, 'update_role', { rol: permFormData.rol });
    
    // 2. Actualizar Permisos Granulares (si aplica)
    if (permFormData.rol === 'admin' || permFormData.rol === 'mesa_directiva') {
      await handleModeration('user', selectedUser.id, 'update_permissions', {
        publicar_anuncios: permFormData.publicar_anuncios ? '1' : '0',
        bazar_y_reservaciones: permFormData.bazar_y_reservaciones ? '1' : '0',
        bolsa_trabajo: permFormData.bolsa_trabajo ? '1' : '0',
        roles_social: permFormData.roles_social ? '1' : '0',
        ver_denuncias: permFormData.ver_denuncias ? '1' : '0',
        rol_comunicacion: permFormData.rol_comunicacion ? '1' : '0',
        consejo_elecciones: permFormData.consejo_elecciones ? '1' : '0',
        permiso_ia: permFormData.permiso_ia ? '1' : '0',
        permiso_wifi: permFormData.permiso_wifi ? '1' : '0'
      });
    }
    
    alert('Rol y Permisos actualizados correctamente.');
    setIsPermModalOpen(false);
    fetchDirectory();
  };

  if (!stats) return <div className="text-center py-20 text-white/20 uppercase tracking-widest font-black">Sincronizando Gobernanza...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 pb-24 space-y-8 animate-in fade-in duration-700">
      
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-6">
         {[
            { id: 'kpis', label: 'Analytics', color: 'bg-indigo-600' },
            { id: 'bazar_ads', label: '🏪 Bazar & Anuncios', color: 'bg-amber-600' },
            { id: 'moderacion', label: `Moderación (${reports.length + pendingBazar.length})`, color: 'bg-red-600' },
            { id: 'vacantes', label: `Bolsa (${pendingVacancies.length})`, color: 'bg-green-600' },
            { id: 'directorio', label: 'Usuarios', color: 'bg-slate-700' },
            { id: 'ia_config', label: 'Agente BOB', color: 'bg-emerald-600' },
            { id: 'rag_knowledge', label: '📚 Conocimiento RAG (.md)', color: 'bg-emerald-600' },
            { id: 'social', label: 'Ecosistema Social', color: 'bg-pink-600' },
            { id: 'votaciones', label: 'Elecciones', color: 'bg-indigo-600' },
            { id: 'invitaciones', label: 'Onboarding (CSV)', color: 'bg-indigo-600 border border-indigo-500' },
            { id: 'padron', label: 'Padrón Electoral', color: 'bg-teal-600' },
            { id: 'acceso', label: 'Control de Acceso (QR)', color: 'bg-emerald-600' },
            ...(user?.email === 'software@fondothoth.com' || user?.rol === 'admin' || user?.rol === 'mesa_directiva' || user?.ver_denuncias == 1 || user?.permiso_ia ? [
              { id: 'sentimiento', label: '🧠 Sentimiento Estudiantil', color: 'bg-purple-600' },
              { id: 'auditoria', label: '🔒 Auditoría & Chat Logs', color: 'bg-yellow-600' }
            ] : [])
         ].map((t) => (
            <button 
               key={t.id}
               onClick={() => setActiveTab(t.id as any)}
               className={`text-[9px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl transition-all ${activeTab === t.id ? `${t.color} text-white shadow-lg` : 'bg-slate-900/50 text-slate-500 hover:bg-slate-800'}`}
            >
               {t.label}
            </button>
         ))}
         {user?.email === 'software@fondothoth.com' && (
            <button 
               onClick={() => setActiveTab('modo_dios')}
               className={`text-[9px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl transition-all ${activeTab === 'modo_dios' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-slate-900/50 text-amber-500 border border-amber-500/30 hover:bg-slate-800'}`}
            >
               ⚡ MODO DIOS (Ads)
            </button>
         )}
      </div>

      {activeTab === 'kpis' && (
         <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {health && Object.entries(health.services).map(([name, data]: [string, any]) => (
               <div key={name} className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl flex items-center justify-between shadow-xl">
                  <div>
                     <p className="text-[9px] uppercase text-slate-500 font-black tracking-widest">{name}</p>
                     <p className={`text-xs font-black ${data.status === 'online' ? 'text-green-500' : 'text-red-500'}`}>
                        {data.status === 'online' ? '● ONLINE' : '○ OFFLINE'}
                     </p>
                  </div>
                  {data.latency && <span className="text-[9px] text-slate-600 font-mono italic">{data.latency}ms</span>}
               </div>
               ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 bg-slate-900/40 p-10 rounded-[2.5rem] border border-indigo-500/10 backdrop-blur-3xl shadow-2xl">
                  <h3 className="text-white font-black uppercase text-[10px] tracking-widest mb-8 opacity-40">Mood Institucional (IA)</h3>
                  <div className="flex flex-col md:flex-row items-center gap-12">
                     <div className="relative w-44 h-44 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90">
                           <circle cx="88" cy="88" r="80" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="14" />
                           <circle 
                              cx="88" cy="88" r="80" fill="none" 
                              stroke="url(#gradMood)" strokeWidth="14" 
                              strokeDasharray="502" strokeDashoffset={502 - (502 * stats.sentiment.mood_score) / 100}
                              strokeLinecap="round"
                              className="transition-all duration-1000"
                           />
                           <defs>
                              <linearGradient id="gradMood" x1="0%" y1="0%" x2="100%" y2="0%">
                                 <stop offset="0%" stopColor="#4f46e5" />
                                 <stop offset="100%" stopColor="#818cf8" />
                               </linearGradient>
                           </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-5xl font-black text-white">{stats.sentiment.mood_score}%</span>
                           <span className="text-[9px] uppercase text-indigo-400 font-black tracking-widest mt-1">Status: Óptimo</span>
                        </div>
                     </div>
                     <div className="flex-1 w-full space-y-6">
                        {[{ label: 'Aceptación Estudiantil', val: stats.sentiment.positivo, color: 'bg-indigo-500' },
                          { label: 'Indiferencia/Neutral', val: stats.sentiment.neutro, color: 'bg-slate-600' },
                          { label: 'Conflictos Pendientes', val: stats.sentiment.negativo, color: 'bg-red-500' }
                        ].map((item) => (
                           <div key={item.label} className="space-y-2">
                              <div className="flex justify-between text-[8px] uppercase font-black text-slate-500 tracking-widest">
                                 <span>{item.label}</span>
                                 <span className="text-white">{item.val} casos</span>
                              </div>
                              <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                 <div className={`${item.color} h-full transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.5)]`} style={{ width: `${(item.val / 10) * 100}%` }}></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
               
               <div className="bg-red-600/5 p-10 rounded-[2.5rem] border border-red-500/20 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center text-3xl mb-6 animate-pulse">📢</div>
                  <h4 className="text-white font-black text-4xl mb-1">{stats.sentiment.urgentes_detectados}</h4>
                  <p className="text-red-400 text-[10px] uppercase font-black tracking-widest mb-8">Crisis en Resolución</p>
                  <button onClick={() => setActiveTab('moderacion')} className="w-full bg-red-600 hover:bg-white hover:text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Atender Incidentes</button>
               </div>
            </div>
         </>
      )}

      {activeTab === 'moderacion' && (
         <div className="space-y-12 animate-in slide-in-from-right-10 duration-500">
            <div className="space-y-6">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Buzón de Incidencias Institucionales</h3>
               <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-950 border-b border-white/5">
                           <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black">Tipo / Folio</th>
                           <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black">Asunto / Contenido / IA</th>
                           <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black">Comité Asignado</th>
                           <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black text-right">Acción</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {reports.map((rep) => (
                           <tr key={rep.id} className="hover:bg-white/[0.02]">
                              <td className="px-8 py-6">
                                 <span className="text-white font-black text-xs block">#{rep.id} {rep.tipo}</span>
                                 <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                    rep.prioridad === 'urgente' || rep.prioridad === 'critica' ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-800 text-slate-400'
                                 }`}>{rep.prioridad}</span>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="text-white text-xs font-bold mb-1 flex items-center gap-2">
                                   {rep.asunto}
                                   {rep.requiere_atencion_humana === 1 && (
                                     <span className="bg-red-600/25 border border-red-500 text-red-500 text-[8px] font-black px-2 py-0.5 rounded-full animate-bounce">
                                       ⚠️ REQUIERE REVISIÓN HUMANA
                                     </span>
                                   )}
                                 </p>
                                 <p className="text-slate-400 text-[10px] max-w-md line-clamp-2">{rep.descripcion}</p>
                                 {rep.analisis_ia && (
                                   <div className="mt-2 text-[9px] text-slate-300 bg-indigo-950/20 border border-indigo-900/30 px-3 py-1.5 rounded-xl max-w-md">
                                     <span className="font-black text-indigo-400 uppercase tracking-widest text-[7px] block mb-0.5">Análisis IA de Delegación:</span>
                                     {rep.analisis_ia}
                                   </div>
                                 )}
                              </td>
                              <td className="px-8 py-6">
                                 <span className="bg-slate-950 text-slate-400 border border-white/5 text-[9px] font-black uppercase px-3 py-1.5 rounded-xl block w-max">
                                    🏛️ {rep.coordinacion_asignada || 'sin asignar'}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <button onClick={() => {
                                    const res = prompt("Respuesta para el reporte:");
                                    if(res) handleModeration('reporte', rep.id, 'resolver_reporte', { respuesta: res, estado: 'resuelto' });
                                 }} className="bg-white text-black px-6 py-2 rounded-xl text-[9px] font-black uppercase">Atender</button>
                              </td>
                           </tr>
                        ))}
                        {reports.length === 0 && (
                           <tr><td colSpan={4} className="px-8 py-10 text-center text-white/20 text-[9px] uppercase font-black tracking-widest">No hay reportes nuevos</td></tr>
                        )}
                      </tbody>
                  </table>
               </div>
            </div>

            <div className="space-y-6">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Bazar Emprendedor (Pendientes / Karma)</h3>
               <div className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-950 border-b border-white/5">
                           <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black">Negocio / Emprendedor</th>
                           <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black">Karma / Reputación</th>
                           <th className="px-8 py-6 text-[9px] uppercase text-slate-500 font-black text-right">Acción</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {pendingBazar.map((prod) => (
                           <tr key={prod.id} className="hover:bg-white/[0.02]">
                              <td className="px-8 py-6">
                                 <span className="text-white font-black text-xs block">{prod.nombre_negocio}</span>
                                 <span className="text-slate-500 text-[8px] font-black uppercase tracking-widest italic">Por: {prod.emprendedor}</span>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                     <div className="text-center">
                                         <p className="text-[10px] font-black text-indigo-400">{prod.karma_score || 0}</p>
                                         <p className="text-[7px] uppercase font-black text-slate-600 tracking-widest">Karma</p>
                                     </div>
                                     <div className="w-px h-6 bg-white/5"></div>
                                     <div className="text-center">
                                         <p className={`text-[10px] font-black ${prod.reputation_score >= 70 ? 'text-green-500' : 'text-amber-500'}`}>{prod.reputation_score || '--'}%</p>
                                         <p className="text-[7px] uppercase font-black text-slate-600 tracking-widest">IA Repo</p>
                                     </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex gap-2 justify-end">
                                     {!prod.verificado ? (
                                         <button 
                                            onClick={() => handleModeration('bazar', prod.id, 'verificar_negocio')}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase"
                                         >
                                            Verificar
                                         </button>
                                      ) : (
                                         <span className="text-emerald-500 text-[8px] font-black uppercase border border-emerald-500/20 px-3 py-1 rounded-lg">Live</span>
                                      ) }
                                      <button 
                                         onClick={() => handleModeration('bazar', prod.id, 'rechazar_negocio')}
                                         className="bg-red-600/10 text-red-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase border border-red-500/20"
                                      >
                                         Ocultar
                                      </button>
                                   </div>
                              </td>
                           </tr>
                        ))}
                        {pendingBazar.length === 0 && (
                           <tr><td colSpan={3} className="px-8 py-10 text-center text-white/20 text-[9px] uppercase font-black tracking-widest">No hay negocios pendientes de revisión</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>
       )}

      {activeTab === 'ia_config' && (
        <AdminIAConfigTab />
      )}

      {activeTab === 'directorio' && (
         <div className="space-y-8 animate-in slide-in-from-right-10 duration-500 w-full overflow-x-auto">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
               <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Directorio & Gobernanza</h3>
                  <p className="text-xs text-indigo-400 font-bold uppercase tracking-wide mt-1">Matriz de Permisos Administrativos</p>
               </div>
               <div className="flex gap-4 w-full md:w-auto">
                  <button onClick={exportDirectorioCSV} className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-white font-bold text-xs shadow-lg shadow-indigo-500/20 whitespace-nowrap">
                    📥 Exportar CSV
                  </button>
                  <input 
                     type="text" 
                     placeholder="Buscar alumno o correo..."
                     className="bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 text-sm text-white focus:border-indigo-500 outline-none w-full md:w-full transition-all"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>

            {/* Indicador de deslizamiento horizontal para celular */}
            <div className="md:hidden text-center text-[10px] font-black uppercase tracking-widest text-indigo-400/80 animate-pulse py-3 px-4 bg-indigo-950/20 border border-indigo-900/30 rounded-2xl">
               ← Desliza horizontalmente para ver todos los permisos →
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] overflow-x-auto shadow-2xl">
               <table className="w-full text-left min-w-[1200px]">
                  <thead>
                     <tr className="bg-slate-950 border-b border-white/5 text-[9px] uppercase text-slate-500 font-black">
                        <th className="px-6 py-6">Usuario / Sociedad</th>
                        <th className="px-4 py-6">Rol Base</th>
                        <th className="px-4 py-6 text-center">IA (BOB)</th>
                        <th className="px-4 py-6 text-center">Votaciones</th>
                        <th className="px-4 py-6 text-center">WiFi (IPs)</th>
                        <th className="px-4 py-6 text-center">Noticias</th>
                        <th className="px-4 py-6 text-center">Bazar</th>
                        <th className="px-4 py-6 text-center">Bolsa</th>
                        <th className="px-4 py-6 text-center">Denuncias</th>
                        <th className="px-4 py-6 text-center">Social</th>
                        <th className="px-6 py-6 text-right">Acciones</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {directory.map((u) => {
                        const isMaster = u.email === 'software@fondothoth.com';
                        const isEditingDisabled = user?.email !== 'software@fondothoth.com' || isMaster;
                        
                        return (
                           <tr key={u.id} className={`hover:bg-white/[0.01] transition-all ${u.activo == 0 ? 'opacity-30' : ''}`}>
                              <td className="px-6 py-4">
                                 <span className="text-white font-black text-xs block">{u.nombre_completo}</span>
                                 <span className="text-slate-400 text-[9px] font-mono block">{u.email}</span>
                                 <span className="text-indigo-400 text-[8px] font-black uppercase tracking-tighter block mt-0.5">{u.carrera || 'Estudiante General'}</span>
                              </td>
                              <td className="px-4 py-4">
                                 <select
                                    value={u.rol}
                                    disabled={isEditingDisabled}
                                    onChange={(e) => handleChangeRole(u.id, e.target.value)}
                                    className="bg-black/40 border border-white/5 rounded-xl px-2.5 py-2 text-[10px] font-black uppercase tracking-wider text-white focus:border-indigo-500 outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                                 >
                                    <option value="estudiante">Estudiante</option>
                                    <option value="empresa">Empresa</option>
                                    <option value="sociedad">Sociedad</option>
                                    <option value="mesa_directiva">Mesa Directiva</option>
                                    <option value="admin">Administrador</option>
                                 </select>
                              </td>
                              
                              {/* IA Toggle */}
                              <td className="px-4 py-4 text-center">
                                 <input
                                    type="checkbox"
                                    checked={u.permiso_ia == 1}
                                    disabled={isEditingDisabled}
                                    onChange={() => handleTogglePermission(u, 'permiso_ia', u.permiso_ia == 1)}
                                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-600 accent-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                 />
                              </td>
                              
                              {/* Votaciones Toggle */}
                              <td className="px-4 py-4 text-center">
                                 <input
                                    type="checkbox"
                                    checked={u.consejo_elecciones == 1}
                                    disabled={isEditingDisabled}
                                    onChange={() => handleTogglePermission(u, 'consejo_elecciones', u.consejo_elecciones == 1)}
                                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-600 accent-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                 />
                              </td>
                              
                              {/* WiFi Toggle */}
                              <td className="px-4 py-4 text-center">
                                 <input
                                    type="checkbox"
                                    checked={u.permiso_wifi == 1}
                                    disabled={isEditingDisabled}
                                    onChange={() => handleTogglePermission(u, 'permiso_wifi', u.permiso_wifi == 1)}
                                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-600 accent-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                 />
                              </td>
                              
                              {/* Noticias Toggle */}
                              <td className="px-4 py-4 text-center">
                                 <input
                                    type="checkbox"
                                    checked={u.rol_comunicacion == 1}
                                    disabled={isEditingDisabled}
                                    onChange={() => {
                                       handleTogglePermission(u, 'rol_comunicacion', u.rol_comunicacion == 1);
                                    }}
                                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-600 accent-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                 />
                              </td>
                              
                              {/* Bazar Toggle */}
                              <td className="px-4 py-4 text-center">
                                 <input
                                    type="checkbox"
                                    checked={u.bazar_y_reservaciones == 1}
                                    disabled={isEditingDisabled}
                                    onChange={() => handleTogglePermission(u, 'bazar_y_reservaciones', u.bazar_y_reservaciones == 1)}
                                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-600 accent-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                 />
                              </td>
                              
                              {/* Bolsa Toggle */}
                              <td className="px-4 py-4 text-center">
                                 <input
                                    type="checkbox"
                                    checked={u.bolsa_trabajo == 1}
                                    disabled={isEditingDisabled}
                                    onChange={() => handleTogglePermission(u, 'bolsa_trabajo', u.bolsa_trabajo == 1)}
                                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-600 accent-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                 />
                              </td>
                              
                              {/* Denuncias Toggle */}
                              <td className="px-4 py-4 text-center">
                                 <input
                                    type="checkbox"
                                    checked={u.ver_denuncias == 1}
                                    disabled={isEditingDisabled}
                                    onChange={() => handleTogglePermission(u, 'ver_denuncias', u.ver_denuncias == 1)}
                                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-600 accent-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                 />
                              </td>
                              
                              {/* Social Toggle */}
                              <td className="px-4 py-4 text-center">
                                 <input
                                    type="checkbox"
                                    checked={u.roles_social == 1}
                                    disabled={isEditingDisabled}
                                    onChange={() => handleTogglePermission(u, 'roles_social', u.roles_social == 1)}
                                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-600 accent-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                 />
                              </td>
                              
                              <td className="px-6 py-4 text-right">
                                 <div className="flex gap-2 justify-end items-center">
                                    <button 
                                       onClick={() => fetchProfile(u.id)} 
                                       className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                                    >
                                       👁️ Ver
                                    </button>
                                    
                                    {!isMaster && (
                                      <button 
                                         onClick={() => handleModeration('user', u.id, 'toggle_active', { active: u.activo == 1 ? 0 : 1 })} 
                                         className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                            u.activo == 1 
                                              ? 'bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white' 
                                              : 'bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white'
                                         }`}
                                         disabled={user?.email !== 'software@fondothoth.com'}
                                      >
                                         {u.activo == 1 ? 'BAN' : 'ACT'}
                                      </button>
                                    )}
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </div>
         </div>
      )}

      {activeTab === 'invitaciones' && (
        <AdminInvitations />
      )}

      {activeTab === 'acceso' && (
        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
           <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Validador de Identidad Digital</h3>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-white/10 space-y-8">
                 <div className="space-y-2">
                    <h4 className="text-white font-bold text-lg">Escanear o Ingresar Código</h4>
                    <p className="text-slate-500 text-xs">Pega el código QR dinámico o usa la cámara (vía PWA en móvil) para validar al alumno.</p>
                 </div>
                 
                 <div className="space-y-4">
                    <textarea 
                       placeholder="Ingresa los datos del QR aquí..."
                       className="w-full bg-black/50 border border-white/10 rounded-2xl p-6 text-xs text-white h-40 focus:border-emerald-500 outline-none font-mono"
                       onBlur={(e) => e.target.value && handleAccessValidation(e.target.value)}
                    ></textarea>
                    <button 
                       disabled={accessLoading}
                       className="w-full bg-emerald-600 hover:bg-white hover:text-black text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                       {accessLoading ? 'Sincronizando con CESA...' : 'Validar Identidad Manualmente'}
                    </button>
                 </div>
              </div>

              {accessResult && (
                 <div className={`p-10 rounded-[2.5rem] border animate-in zoom-in duration-300 ${accessResult.success ? 'bg-emerald-500/10 border-emerald-500' : 'bg-red-500/10 border-red-500'}`}>
                    {accessResult.success ? (
                       <div className="space-y-8 text-center">
                          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl mx-auto shadow-xl shadow-emerald-500/20">
                             <i className="fas fa-check"></i>
                          </div>
                          <div>
                             <h4 className="text-2xl font-black text-white uppercase tracking-tighter">{accessResult.student.nombre_completo}</h4>
                             <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mt-2">{accessResult.student.carrera} • Acceso Válido</p>
                          </div>
                          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
                             <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">Estado: Activo institucionalmente</p>
                          </div>
                       </div>
                    ) : (
                       <div className="space-y-8 text-center">
                          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white text-3xl mx-auto shadow-xl shadow-red-600/20">
                             <i className="fas fa-times"></i>
                          </div>
                          <h4 className="text-xl font-black text-white uppercase tracking-tighter">Acceso Denegado</h4>
                          <p className="text-red-400 text-xs">{accessResult.error}</p>
                       </div>
                    )}
                 </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'social' && (
        <AdminSocialTab />
      )}

      {activeTab === 'rag_knowledge' && (
        <AdminRagKnowledgeTab />
      )}

      {activeTab === 'votaciones' && (
        <VotingConfig />
      )}

      {activeTab === 'bazar_ads' && (
        <AdminBazarDashboardTab />
      )}

      {activeTab === 'modo_dios' && user?.email === 'software@fondothoth.com' && (
        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
              ⚡ Modo Dios: Configuración de Publicidad
            </h3>
            <span className="bg-amber-500/20 border border-amber-500 text-amber-500 text-[10px] font-black px-3 py-1.5 rounded-xl">
              GOD MODE ACTIVE
            </span>
          </div>

          {adLoading ? (
            <div className="text-center py-20 text-white/20 uppercase tracking-widest font-black">
              Sincronizando Publicidad...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Formulario de Configuración de Anuncios */}
              <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-amber-500/10 space-y-6">
                <form onSubmit={handleSaveAdConfig} className="space-y-6">
                  {/* Switch Activo */}
                  <div className="flex justify-between items-center bg-black/30 p-5 rounded-2xl border border-white/5">
                    <div>
                      <p className="text-xs font-black text-white uppercase">Estado de Publicidad</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">Activar o desactivar anuncios en la plataforma</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAdConfig({ ...adConfig, activo: !adConfig.activo })}
                      className={`w-14 h-8 rounded-full transition-all duration-300 relative ${adConfig.activo ? 'bg-amber-500' : 'bg-slate-800'}`}
                    >
                      <span className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all duration-300 ${adConfig.activo ? 'right-1' : 'left-1'}`}></span>
                    </button>
                  </div>

                  {/* Publisher ID */}
                  <div>
                    <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Google AdMob / AdSense Publisher ID</label>
                    <input
                      type="text"
                      value={adConfig.publisher_id}
                      onChange={(e) => setAdConfig({ ...adConfig, publisher_id: e.target.value })}
                      placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none font-mono"
                    />
                  </div>

                  {/* Banner Slot ID */}
                  <div>
                    <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Banner Ad Unit / Slot ID (Bazar)</label>
                    <input
                      type="text"
                      value={adConfig.banner_slot_id}
                      onChange={(e) => setAdConfig({ ...adConfig, banner_slot_id: e.target.value })}
                      placeholder="9876543210"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none font-mono"
                    />
                  </div>

                  {/* Interstitial Slot ID */}
                  <div>
                    <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Interstitial Ad Unit / Slot ID (Pantalla Completa)</label>
                    <input
                      type="text"
                      value={adConfig.interstitial_slot_id}
                      onChange={(e) => setAdConfig({ ...adConfig, interstitial_slot_id: e.target.value })}
                      placeholder="1234567890"
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none font-mono"
                    />
                  </div>

                  {/* Frecuencia Diaria */}
                  <div>
                    <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-2">Frecuencia Máxima de Pantalla Completa (Veces al día)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={adConfig.frecuencia_diaria}
                      onChange={(e) => setAdConfig({ ...adConfig, frecuencia_diaria: parseInt(e.target.value) || 2 })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-amber-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/10"
                  >
                    Guardar Cambios de Publicidad
                  </button>
                </form>
              </div>

              {/* Guía informativa de integración */}
              <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-white/10 space-y-6 flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-white font-bold text-base uppercase">Guía de Publicidad y AdMob</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Esta configuración expone los parámetros de publicidad mediante la base de datos de forma dinámica.
                  </p>
                  <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
                    <li>Los banners se renderizan al fondo del Bazar con el slot especificado.</li>
                    <li>Los anuncios de pantalla completa (Interstitial) se activarán en el simulador de examen cada 10 preguntas.</li>
                    <li>La frecuencia diaria se calcula por sesión local de usuario mediante LocalStorage para evitar saturación de la experiencia estudiantil.</li>
                  </ul>
                </div>
                <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl">
                  <p className="text-[10px] uppercase font-black text-amber-500 tracking-widest mb-1">Nota del Sistema</p>
                  <p className="text-[10px] text-slate-500">Solo cuentas con privilegios de escritura en esta configuración al estar logueado como software@fondothoth.com.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal de Permisos y Rol */}
      {isPermModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-10 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in-95 duration-300 text-white">
             <div className="flex justify-between items-start">
               <div>
                 <h4 className="text-white font-black text-lg uppercase tracking-tight">{selectedUser.nombre_completo}</h4>
                 <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{selectedUser.email}</p>
               </div>
               <button 
                 onClick={() => setIsPermModalOpen(false)}
                 className="text-slate-400 hover:text-white text-[9px] font-black uppercase tracking-widest border border-white/10 rounded-xl px-3 py-1.5 bg-white/5"
               >
                 Cerrar
               </button>
             </div>
             
             <form onSubmit={handleSavePermissions} className="space-y-6">
                <div>
                  <label className="text-[8px] uppercase font-black text-slate-400 tracking-widest block mb-2">Rol Base</label>
                  <select 
                    value={permFormData.rol}
                    onChange={(e) => setPermFormData({...permFormData, rol: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="estudiante">Estudiante</option>
                    <option value="empresa">Empresa</option>
                    <option value="sociedad">Sociedad</option>
                    <option value="mesa_directiva">Mesa Directiva</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                
                {(permFormData.rol === 'admin' || permFormData.rol === 'mesa_directiva') && (
                  <div className="space-y-3 border-t border-white/5 pt-4">
                     <p className="text-[8px] uppercase font-black text-indigo-400 tracking-widest mb-2">Permisos Granulares</p>
                     
                     {[
                       { key: 'publicar_anuncios', label: 'Publicar Anuncios (Ads)' },
                       { key: 'bazar_y_reservaciones', label: 'Bazar y Reservaciones' },
                       { key: 'bolsa_trabajo', label: 'Bolsa de Trabajo' },
                       { key: 'roles_social', label: 'Ecosistema Social' },
                       { key: 'ver_denuncias', label: 'Ver e Investigar Denuncias' },
                       { key: 'rol_comunicacion', label: 'Comunicación y Noticias' },
                       { key: 'consejo_elecciones', label: 'Auditoría y Configuración de Elecciones' },
                       { key: 'permiso_ia', label: 'Permisos de Asistente de IA (BOB)' },
                       { key: 'permiso_wifi', label: 'Configuración de IPs WiFi' },
                       { key: 'tutorias_asesorias', label: 'Tutorías y Asuntos Estudiantiles' },
                       { key: 'evaluaciones_psicometricas', label: 'Evaluaciones Psicométricas' },
                       { key: 'skills_cursos', label: 'Gestión de Cursos y Skills' }
                     ].map((item) => (
                       <label key={item.key} className="flex items-center justify-between p-3 bg-black/20 border border-white/5 rounded-xl cursor-pointer hover:border-white/10 transition-all select-none">
                         <span className="text-[9px] text-slate-300 font-bold uppercase tracking-wider">{item.label}</span>
                         <input 
                           type="checkbox"
                           checked={(permFormData as any)[item.key]}
                           onChange={(e) => setPermFormData({
                             ...permFormData,
                             [item.key]: e.target.checked
                           })}
                           className="w-4 h-4 accent-indigo-500 rounded border-white/10 bg-black/40"
                         />
                       </label>
                     ))}
                  </div>
                )}
                
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                >
                  Guardar Cambios
                </button>
             </form>
           </div>
        </div>
      )}

      {/* Modal del Perfil Holístico */}
      {selectedProfileId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-10 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl animate-in zoom-in-95 duration-300 text-white">
             {profileLoading ? (
                <div className="text-center py-10 font-black tracking-widest uppercase text-slate-500">Cargando Perfil...</div>
             ) : profileData ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-start border-b border-white/10 pb-4">
                    <div>
                      <h4 className="text-white font-black text-xl uppercase tracking-tight">{profileData.nombre_completo}</h4>
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{profileData.matricula || 'Sin Expediente'} • {profileData.rol}</p>
                    </div>
                    <button onClick={() => setSelectedProfileId(null)} className="text-slate-400 hover:text-white text-[9px] font-black uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">Cerrar</button>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                     <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-2xl font-black text-indigo-400">{profileData.estadisticas_sociales?.reportes_creados || 0}</p>
                        <p className="text-[8px] uppercase tracking-widest text-slate-500 font-black mt-1">Reportes</p>
                     </div>
                     <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-2xl font-black text-pink-400">{profileData.estadisticas_sociales?.publicaciones_muro || 0}</p>
                        <p className="text-[8px] uppercase tracking-widest text-slate-500 font-black mt-1">Posts (Muro)</p>
                     </div>
                     <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-center">
                        <p className="text-2xl font-black text-emerald-400">{profileData.certificados?.length || 0}</p>
                        <p className="text-[8px] uppercase tracking-widest text-slate-500 font-black mt-1">Certificados</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <h5 className="text-[10px] uppercase font-black text-indigo-400 tracking-widest">Exámenes y Certificaciones</h5>
                     {profileData.evaluaciones?.length > 0 ? (
                       <div className="space-y-2">
                          {profileData.evaluaciones.map((e: any) => (
                            <div key={e.id} className="bg-black/40 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                               <div>
                                  <p className="text-[10px] font-black uppercase text-white">{e.habilidad_nombre}</p>
                                  <p className="text-[8px] text-slate-500">{new Date(e.tiempo_inicio).toLocaleDateString()}</p>
                               </div>
                               <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${e.estado === 'completada' && e.porcentaje >= 70 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                 {e.porcentaje}% - {e.estado}
                               </span>
                            </div>
                          ))}
                       </div>
                     ) : <p className="text-xs text-slate-500 italic">No hay historial de exámenes.</p>}
                  </div>

                  <div className="space-y-4">
                     <h5 className="text-[10px] uppercase font-black text-pink-400 tracking-widest">Historial de Interacción con IA (BOB)</h5>
                     {profileData.historial_ia?.length > 0 ? (
                       <div className="space-y-2">
                          {profileData.historial_ia.map((chat: any, i: number) => (
                            <div key={i} className="bg-black/40 p-3 rounded-xl border border-white/5">
                               <p className="text-[10px] font-bold text-white mb-1"><span className="text-indigo-400">Usuario:</span> {chat.mensaje}</p>
                               <p className="text-[9px] text-slate-400"><span className="text-emerald-400">BOB:</span> {chat.respuesta.substring(0, 100)}...</p>
                            </div>
                          ))}
                       </div>
                     ) : <p className="text-xs text-slate-500 italic">No ha interactuado con la IA.</p>}
                  </div>

                </div>
              ) : null}
          </div>
        </div>
      )}

      {activeTab === 'padron' && (
        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
           <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Padrón Electoral Activo</h3>
           <div className="bg-slate-900/60 p-10 rounded-[2.5rem] border border-teal-500/20 shadow-2xl space-y-6">
              <div className="space-y-2">
                 <h4 className="text-white font-bold text-lg">Actualizar Padrón (Semestral)</h4>
                 <p className="text-slate-500 text-xs">Carga un archivo CSV con las columnas: <b>Expediente, Carrera, Semestre</b>. Esto limpiará el padrón anterior y cargará los alumnos válidos para el Sistema de Votación.</p>
              </div>
              
              <form onSubmit={handleUploadPadron} className="space-y-6 bg-black/30 p-6 rounded-2xl border border-white/5">
                 <input 
                    type="file" 
                    accept=".csv"
                    onChange={(e) => setCsvFile(e.target.files ? e.target.files[0] : null)}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-black file:bg-teal-600 file:text-white hover:file:bg-teal-500"
                 />
                 <button 
                    type="submit" 
                    disabled={uploadingPadron || !csvFile}
                    className="bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    {uploadingPadron ? 'Procesando Padron...' : 'Subir e Indexar CSV'}
                 </button>
              </form>

              <div className="bg-teal-500/10 p-5 rounded-2xl border border-teal-500/20">
                 <p className="text-[10px] uppercase font-black text-teal-400 tracking-widest mb-2">Importancia de Seguridad</p>
                  <p className="text-[10px] text-slate-400">El Sistema de Votaciones usa esta tabla para validar que el alumno sea regular y pertenezca a la carrera objetivo, bloqueando el acceso a ex-alumnos u otros departamentos.</p>
              </div>
           </div>
        </div>
      )}
      {activeTab === 'sentimiento' && (
        <AdminSentimentDashboardTab />
      )}
      {activeTab === 'auditoria' && (
        <>
          {user?.email === 'software@fondothoth.com' || ['admin','mesa_directiva'].includes(user?.rol ?? '') ? (
            <div className="space-y-8 animate-in slide-in-from-right-10 duration-500 text-white w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">📊 Auditoría de Seguridad e IA</h3>
                  <p className="text-xs text-indigo-400 font-bold uppercase tracking-wide mt-1">Supervisión e historial de interacciones en tiempo real</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={exportTelemetriaCSV}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
                  >
                    📥 Exportar Telemetría / Exámenes
                  </button>
                  {auditLoading && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 animate-pulse bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                      Sincronizando logs...
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Panel Chatbot Historial */}
                <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-black text-lg uppercase tracking-wider flex items-center gap-2">
                        🤖 Chatbot Historial (BOB)
                      </h4>
                      <button 
                        onClick={exportChatCSV}
                        className="bg-amber-500 hover:bg-white text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/15"
                      >
                        Exportar CSV
                      </button>
                    </div>

                    {/* Filtros */}
                    <div className="bg-black/30 p-4 rounded-2xl border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-1">Buscar</label>
                        <input 
                          type="text" 
                          placeholder="Mensaje, IP, Usuario..."
                          value={chatSearch}
                          onChange={(e) => setChatSearch(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-1">Inicio</label>
                        <input 
                          type="date" 
                          value={chatStartDate}
                          onChange={(e) => setChatStartDate(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-1">Fin</label>
                        <input 
                          type="date" 
                          value={chatEndDate}
                          onChange={(e) => setChatEndDate(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => { setChatPage(0); fetchChatHistory(); }}
                      className="w-full bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      Buscar / Filtrar Chatbot
                    </button>

                    {/* Tabla */}
                    <div className="overflow-x-auto border border-white/5 rounded-2xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black/45 border-b border-white/5 text-[8px] uppercase text-slate-500 font-black">
                            <th className="p-3">Fecha</th>
                            <th className="p-3">Usuario</th>
                            <th className="p-3">Mensaje / Respuesta</th>
                            <th className="p-3">Proveedor / Lat</th>
                            <th className="p-3">Origen</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-[10px]">
                          {chatHistory.map((h) => (
                            <tr key={h.id} className="hover:bg-white/[0.01]">
                              <td className="p-3 whitespace-nowrap text-slate-400">
                                {new Date(h.created_at).toLocaleDateString()}
                                <span className="block text-[8px] text-slate-500 mt-0.5">{new Date(h.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </td>
                              <td className="p-3">
                                <span className="font-bold text-white block">{h.usuario_nombre || 'Invitado/Anon'}</span>
                                <span className="text-slate-500 text-[8px] block font-mono">{h.usuario_email || 'Anon'}</span>
                              </td>
                              <td className="p-3 max-w-[200px]">
                                <p className="text-slate-200 line-clamp-2"><span className="text-indigo-400 font-bold">U:</span> {h.mensaje}</p>
                                <p className="text-slate-400 line-clamp-2 mt-1"><span className="text-emerald-400 font-bold">B:</span> {h.respuesta}</p>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className="bg-indigo-950/40 border border-indigo-900/40 text-indigo-400 font-bold uppercase text-[7px] px-1.5 py-0.5 rounded-md block w-max">{h.provider}</span>
                                <span className="text-slate-500 text-[8px] block mt-1 font-mono">{h.latency_ms}ms</span>
                              </td>
                              <td className="p-3 whitespace-nowrap text-slate-400 text-[9px]">
                                <span className="font-mono block">{h.ip_address}</span>
                                <span className="text-indigo-300 block text-[8px] mt-0.5">{h.geoloc_city || 'Desconocido'}, {h.geoloc_country || ''}</span>
                              </td>
                            </tr>
                          ))}
                          {chatHistory.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-500 uppercase tracking-widest font-black text-[9px]">No hay logs de chatbot.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Paginación */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-4 text-[9px] uppercase font-black tracking-widest text-slate-500">
                    <button 
                      disabled={chatPage === 0 || auditLoading}
                      onClick={() => setChatPage(chatPage - 1)}
                      className="hover:text-white disabled:opacity-30 transition-all"
                    >
                      ← Anterior
                    </button>
                    <span>Página {chatPage + 1} de {Math.max(1, Math.ceil(chatTotal / chatLimit))}</span>
                    <button 
                      disabled={(chatPage + 1) * chatLimit >= chatTotal || auditLoading}
                      onClick={() => setChatPage(chatPage + 1)}
                      className="hover:text-white disabled:opacity-30 transition-all"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>

                {/* Panel Mensajes Privados */}
                <div className="bg-slate-900/60 p-8 rounded-[2.5rem] border border-white/10 space-y-6 shadow-2xl flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="text-white font-black text-lg uppercase tracking-wider flex items-center gap-2">
                        📨 Mensajería Privada
                      </h4>
                      <button 
                        onClick={exportMensajesCSV}
                        className="bg-amber-500 hover:bg-white text-black px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/15"
                      >
                        Exportar CSV
                      </button>
                    </div>

                    {/* Filtros */}
                    <div className="bg-black/30 p-4 rounded-2xl border border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-1">Buscar</label>
                        <input 
                          type="text" 
                          placeholder="Mensaje, IP, Usuario..."
                          value={mensajesSearch}
                          onChange={(e) => setMensajesSearch(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-1">Inicio</label>
                        <input 
                          type="date" 
                          value={mensajesStartDate}
                          onChange={(e) => setMensajesStartDate(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[8px] uppercase font-black text-slate-500 tracking-widest block mb-1">Fin</label>
                        <input 
                          type="date" 
                          value={mensajesEndDate}
                          onChange={(e) => setMensajesEndDate(e.target.value)}
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={() => { setMensajesPage(0); fetchMensajesHistory(); }}
                      className="w-full bg-slate-800 hover:bg-slate-700 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                      Buscar / Filtrar Mensajes
                    </button>

                    {/* Tabla */}
                    <div className="overflow-x-auto border border-white/5 rounded-2xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-black/45 border-b border-white/5 text-[8px] uppercase text-slate-500 font-black">
                            <th className="p-3">Fecha</th>
                            <th className="p-3">Emisor → Receptor</th>
                            <th className="p-3">Contenido</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3">Origen</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-[10px]">
                          {mensajesHistory.map((m) => (
                            <tr key={m.id} className="hover:bg-white/[0.01]">
                              <td className="p-3 whitespace-nowrap text-slate-400">
                                {new Date(m.created_at).toLocaleDateString()}
                                <span className="block text-[8px] text-slate-500 mt-0.5">{new Date(m.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </td>
                              <td className="p-3">
                                <span className="font-bold text-white block">De: {m.emisor_nombre}</span>
                                <span className="text-slate-400 block mt-0.5">A: {m.receptor_nombre}</span>
                              </td>
                              <td className="p-3 max-w-[200px]">
                                <p className="text-slate-300 line-clamp-3">{m.contenido}</p>
                              </td>
                              <td className="p-3 whitespace-nowrap">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${m.leido == 1 ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                                  {m.leido == 1 ? 'Leído' : 'Pendiente'}
                                </span>
                              </td>
                              <td className="p-3 whitespace-nowrap text-slate-400 text-[9px]">
                                <span className="font-mono block">{m.ip_address || '127.0.0.1'}</span>
                                <span className="text-indigo-300 block text-[8px] mt-0.5">{m.geoloc_city || 'Desconocido'}, {m.geoloc_country || ''}</span>
                              </td>
                            </tr>
                          ))}
                          {mensajesHistory.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-8 text-center text-slate-500 uppercase tracking-widest font-black text-[9px]">No hay mensajes privados.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Paginación */}
                  <div className="flex justify-between items-center border-t border-white/5 pt-4 mt-4 text-[9px] uppercase font-black tracking-widest text-slate-500">
                    <button 
                      disabled={mensajesPage === 0 || auditLoading}
                      onClick={() => setMensajesPage(mensajesPage - 1)}
                      className="hover:text-white disabled:opacity-30 transition-all"
                    >
                      ← Anterior
                    </button>
                    <span>Página {mensajesPage + 1} de {Math.max(1, Math.ceil(mensajesTotal / mensajesLimit))}</span>
                    <button 
                      disabled={(mensajesPage + 1) * mensajesLimit >= mensajesTotal || auditLoading}
                      onClick={() => setMensajesPage(mensajesPage + 1)}
                      className="hover:text-white disabled:opacity-30 transition-all"
                    >
                      Siguiente →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
              <p className="text-sm text-slate-400">Acceso denegado. Se requiere rol de admin o Mesa Directiva.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
