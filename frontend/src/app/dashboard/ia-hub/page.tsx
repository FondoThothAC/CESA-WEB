"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Tipos de datos del Hub IA ────────────────────────────────────────────────

interface IaHubStats {
  total_sesiones: number;
  sesiones_telegram: number;
  sesiones_web: number;
  aprobaciones_pendientes: number;
  aprobaciones_aprobadas: number;
  aprobaciones_rechazadas: number;
  canva_conectado: boolean;
  instagram_conectado: boolean;
  facebook_conectado: boolean;
}

interface IaSesion {
  id: number;
  session_id: string;
  canal: string;
  rol: string;
  mensaje: string;
  herramientas_usadas: string | null;
  imagen_url: string | null;
  creado_en: string;
}

interface Aprobacion {
  id: number;
  agent_id: number;
  tipo: string;
  titulo: string;
  contenido_preview: string;
  media_url: string | null;
  estado: string;
  feedback_humano: string | null;
  created_at: string;
}

interface Integracion {
  plataforma: string;
  conectado: boolean;
  cuenta: string | null;
  expires_at: string | null;
  accion_url: string | null;
}

// ─── Colores y etiquetas por canal / estado ───────────────────────────────────

const canalColor: Record<string, string> = {
  telegram: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  web: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  api: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
};

const estadoColor: Record<string, string> = {
  pendiente: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  aprobado: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
  rechazado: "bg-red-500/20 text-red-300 border border-red-500/30",
};

const plataformaIcono: Record<string, string> = {
  canva: "🎨",
  instagram: "📸",
  facebook: "📘",
  gmail: "📧",
  x_twitter: "🐦",
};

// ─── Utilidad: llamada al API con JWT del localStorage ───────────────────────

async function apiFetch(path: string, options?: RequestInit) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("cesa_token") || "" : "";
  const base = process.env.NEXT_PUBLIC_API_URL || "/api";
  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

// ─── Componente principal del Hub IA ─────────────────────────────────────────

export default function IaHubPage() {
  const [tab, setTab] = useState<"stats" | "historial" | "aprobaciones" | "integraciones">("stats");
  const [stats, setStats] = useState<IaHubStats | null>(null);
  const [historial, setHistorial] = useState<IaSesion[]>([]);
  const [aprobaciones, setAprobaciones] = useState<Aprobacion[]>([]);
  const [integraciones, setIntegraciones] = useState<Integracion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [paginaHistorial, setPaginaHistorial] = useState(1);
  const [filtroCanal, setFiltroCanal] = useState("");
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const [feedbackRechazar, setFeedbackRechazar] = useState<Record<number, string>>({});

  // Cargar estadísticas del Hub IA
  const cargarStats = useCallback(async () => {
    try {
      const res = await apiFetch("/admin/ia/stats");
      setStats(res.data || res);
    } catch (e) {
      console.error("Error cargando stats IA:", e);
    }
  }, []);

  // Cargar historial de chats paginado
  const cargarHistorial = useCallback(async () => {
    setCargando(true);
    try {
      const params = new URLSearchParams({
        page: String(paginaHistorial),
        limit: "25",
        ...(filtroCanal ? { canal: filtroCanal } : {}),
      });
      const res = await apiFetch(`/admin/ia/historial?${params}`);
      const data = res.data || res;
      setHistorial(data.data || data);
      setTotalPaginas(data.pagination?.pages || 1);
    } catch (e) {
      console.error("Error cargando historial IA:", e);
    } finally {
      setCargando(false);
    }
  }, [paginaHistorial, filtroCanal]);

  // Cargar cola de aprobaciones
  const cargarAprobaciones = useCallback(async () => {
    setCargando(true);
    try {
      const res = await apiFetch(`/admin/ia/aprobaciones?estado=${filtroEstado}`);
      setAprobaciones(res.data || res);
    } catch (e) {
      console.error("Error cargando aprobaciones:", e);
    } finally {
      setCargando(false);
    }
  }, [filtroEstado]);

  // Cargar estado de integraciones
  const cargarIntegraciones = useCallback(async () => {
    try {
      const res = await apiFetch("/admin/ia/integraciones");
      setIntegraciones(res.data || res);
    } catch (e) {
      console.error("Error cargando integraciones:", e);
    }
  }, []);

  // Aprobar una aprobación pendiente
  const aprobarDiseno = async (id: number) => {
    try {
      const res = await apiFetch(`/admin/ia/aprobaciones/${id}/aprobar`, { method: "PATCH" });
      const publicado = res.data?.publicado_en || [];
      alert(
        publicado.length > 0
          ? `✅ Aprobado y publicado en: ${publicado.join(", ")}`
          : "✅ Aprobación registrada. (Sin redes sociales conectadas para publicación automática.)"
      );
      cargarAprobaciones();
      cargarStats();
    } catch (e) {
      alert("❌ Error al aprobar el diseño.");
    }
  };

  // Rechazar una aprobación con feedback
  const rechazarDiseno = async (id: number) => {
    const feedback = feedbackRechazar[id] || "";
    try {
      await apiFetch(`/admin/ia/aprobaciones/${id}/rechazar`, {
        method: "PATCH",
        body: JSON.stringify({ feedback }),
      });
      alert("✅ Rechazado con feedback enviado al agente.");
      cargarAprobaciones();
      cargarStats();
    } catch (e) {
      alert("❌ Error al rechazar.");
    }
  };

  // Efectos de carga al cambiar de tab
  useEffect(() => {
    cargarStats();
  }, [cargarStats]);

  useEffect(() => {
    if (tab === "historial") cargarHistorial();
    if (tab === "aprobaciones") cargarAprobaciones();
    if (tab === "integraciones") cargarIntegraciones();
  }, [tab, cargarHistorial, cargarAprobaciones, cargarIntegraciones]);

  useEffect(() => {
    if (tab === "historial") cargarHistorial();
  }, [paginaHistorial, filtroCanal, cargarHistorial, tab]);

  useEffect(() => {
    if (tab === "aprobaciones") cargarAprobaciones();
  }, [filtroEstado, cargarAprobaciones, tab]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#080c14] text-white p-6">
      {/* Encabezado */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🤖</span>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-sky-400 bg-clip-text text-transparent">
            Hub de Inteligencia Artificial
          </h1>
        </div>
        <p className="text-slate-400 text-sm">
          Panel de control del Swarm de Agentes — Historial, Aprobaciones y Estado de Integraciones
        </p>
      </div>

      {/* Tabs de navegación */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[
          { key: "stats", label: "📊 Estadísticas" },
          { key: "historial", label: "💬 Historial de Chats" },
          { key: "aprobaciones", label: "✅ Aprobaciones" },
          { key: "integraciones", label: "🔌 Integraciones" },
        ].map(({ key, label }) => (
          <button
            key={key}
            id={`tab-ia-${key}`}
            onClick={() => setTab(key as typeof tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              tab === key
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                : "bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 hover:text-white"
            }`}
          >
            {label}
            {key === "aprobaciones" && stats && stats.aprobaciones_pendientes > 0 && (
              <span className="ml-2 bg-amber-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                {stats.aprobaciones_pendientes}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── TAB: ESTADÍSTICAS ─────────────────────────────────────────────────── */}
      {tab === "stats" && (
        <div>
          {stats ? (
            <>
              {/* Tarjetas de métricas principales */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                <MetricCard icon="💬" label="Total Conversaciones" value={stats.total_sesiones} color="violet" />
                <MetricCard icon="✈️" label="Vía Telegram" value={stats.sesiones_telegram} color="sky" />
                <MetricCard icon="🌐" label="Vía Web" value={stats.sesiones_web} color="indigo" />
                <MetricCard icon="⏳" label="Pendientes Aprobar" value={stats.aprobaciones_pendientes} color="amber" />
                <MetricCard icon="✅" label="Diseños Aprobados" value={stats.aprobaciones_aprobadas} color="emerald" />
                <MetricCard icon="❌" label="Diseños Rechazados" value={stats.aprobaciones_rechazadas} color="red" />
              </div>

              {/* Estado de integraciones resumido */}
              <div className="bg-slate-900/60 rounded-xl border border-slate-700/50 p-5">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">Estado de Integraciones</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <IntBadge icon="🎨" name="Canva" ok={stats.canva_conectado} />
                  <IntBadge icon="📸" name="Instagram" ok={stats.instagram_conectado} />
                  <IntBadge icon="📘" name="Facebook" ok={stats.facebook_conectado} />
                  <IntBadge icon="📧" name="Gmail" ok={true} />
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-slate-500">
              <span className="animate-spin text-2xl mr-3">⟳</span> Cargando estadísticas...
            </div>
          )}
        </div>
      )}

      {/* ── TAB: HISTORIAL DE CHATS ───────────────────────────────────────────── */}
      {tab === "historial" && (
        <div>
          {/* Filtros */}
          <div className="flex gap-3 mb-4">
            <select
              id="filtro-canal-historial"
              value={filtroCanal}
              onChange={(e) => { setFiltroCanal(e.target.value); setPaginaHistorial(1); }}
              className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
            >
              <option value="">Todos los canales</option>
              <option value="telegram">Telegram</option>
              <option value="web">Web</option>
              <option value="api">API</option>
            </select>
          </div>

          {cargando ? (
            <div className="flex items-center justify-center h-40 text-slate-500">
              <span className="animate-spin text-2xl mr-3">⟳</span> Cargando historial...
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {historial.length === 0 ? (
                  <div className="text-center text-slate-500 py-12">Sin registros en este canal.</div>
                ) : (
                  historial.map((s) => (
                    <div
                      key={s.id}
                      className={`bg-slate-900/50 border rounded-lg p-3 flex gap-3 items-start transition-colors ${
                        s.rol === "user"
                          ? "border-slate-700/40"
                          : "border-violet-800/30 bg-violet-950/20"
                      }`}
                    >
                      <span className="text-lg mt-0.5">{s.rol === "user" ? "👤" : "🤖"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${canalColor[s.canal] || "bg-slate-700 text-slate-300"}`}>
                            {s.canal}
                          </span>
                          {s.herramientas_usadas && (
                            <span className="text-xs bg-emerald-500/15 text-emerald-300 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                              🔧 {s.herramientas_usadas}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 ml-auto">{s.creado_en}</span>
                        </div>
                        <p className="text-sm text-slate-300 break-words line-clamp-3">{s.mensaje}</p>
                        {s.imagen_url && (
                          <a
                            href={s.imagen_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-sky-400 hover:text-sky-300 mt-1 inline-block"
                          >
                            🖼️ Ver imagen generada
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Paginación */}
              <div className="flex items-center justify-between mt-6">
                <button
                  id="btn-historial-anterior"
                  disabled={paginaHistorial <= 1}
                  onClick={() => setPaginaHistorial((p) => p - 1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm disabled:opacity-40 transition-colors"
                >
                  ← Anterior
                </button>
                <span className="text-slate-400 text-sm">
                  Página {paginaHistorial} de {totalPaginas}
                </span>
                <button
                  id="btn-historial-siguiente"
                  disabled={paginaHistorial >= totalPaginas}
                  onClick={() => setPaginaHistorial((p) => p + 1)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm disabled:opacity-40 transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── TAB: APROBACIONES ────────────────────────────────────────────────── */}
      {tab === "aprobaciones" && (
        <div>
          {/* Filtro de estado */}
          <div className="flex gap-2 mb-4">
            {["pendiente", "aprobado", "rechazado"].map((e) => (
              <button
                key={e}
                id={`btn-estado-${e}`}
                onClick={() => setFiltroEstado(e)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filtroEstado === e
                    ? estadoColor[e]
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                }`}
              >
                {e.charAt(0).toUpperCase() + e.slice(1)}
              </button>
            ))}
          </div>

          {cargando ? (
            <div className="flex items-center justify-center h-40 text-slate-500">
              <span className="animate-spin text-2xl mr-3">⟳</span> Cargando aprobaciones...
            </div>
          ) : aprobaciones.length === 0 ? (
            <div className="text-center text-slate-500 py-16">
              <span className="text-4xl block mb-3">🎉</span>
              No hay elementos con estado "{filtroEstado}".
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {aprobaciones.map((ap) => (
                <div
                  key={ap.id}
                  className="bg-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/60 transition-colors"
                >
                  {/* Vista previa de imagen/diseño */}
                  {ap.media_url && (
                    <div className="relative h-40 bg-slate-800 overflow-hidden">
                      <img
                        src={ap.media_url}
                        alt={ap.titulo}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <a
                        href={ap.media_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity text-white text-sm font-medium"
                      >
                        🔗 Ver en Canva
                      </a>
                    </div>
                  )}

                  <div className="p-4">
                    {/* Encabezado de la tarjeta */}
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                        #{ap.id} · {ap.tipo}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ml-auto ${estadoColor[ap.estado] || ""}`}>
                        {ap.estado}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-white mb-1 line-clamp-2">{ap.titulo}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 mb-3">{ap.contenido_preview}</p>
                    <p className="text-xs text-slate-600 mb-3">{ap.created_at}</p>

                    {/* Acciones (solo si está pendiente) */}
                    {ap.estado === "pendiente" && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <button
                            id={`btn-aprobar-${ap.id}`}
                            onClick={() => aprobarDiseno(ap.id)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium py-2 rounded-lg transition-colors"
                          >
                            ✅ Aprobar y Publicar
                          </button>
                          <button
                            id={`btn-rechazar-${ap.id}`}
                            onClick={() => rechazarDiseno(ap.id)}
                            className="flex-1 bg-red-600/80 hover:bg-red-600 text-white text-xs font-medium py-2 rounded-lg transition-colors"
                          >
                            ❌ Rechazar
                          </button>
                        </div>
                        <input
                          id={`feedback-${ap.id}`}
                          type="text"
                          placeholder="Feedback para el agente (opcional)..."
                          value={feedbackRechazar[ap.id] || ""}
                          onChange={(e) =>
                            setFeedbackRechazar((prev) => ({ ...prev, [ap.id]: e.target.value }))
                          }
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg text-xs px-3 py-1.5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: INTEGRACIONES ───────────────────────────────────────────────── */}
      {tab === "integraciones" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integraciones.length === 0 ? (
            <div className="col-span-3 text-center text-slate-500 py-16">
              <span className="animate-spin text-2xl block mb-3">⟳</span>
              Cargando estado de integraciones...
            </div>
          ) : (
            integraciones.map((int) => (
              <div
                key={int.plataforma}
                className={`bg-slate-900/60 border rounded-xl p-5 transition-colors ${
                  int.conectado
                    ? "border-emerald-500/30 bg-emerald-950/10"
                    : "border-slate-700/50 hover:border-slate-600/50"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{plataformaIcono[int.plataforma] || "🔌"}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-white capitalize">{int.plataforma}</h3>
                    {int.cuenta && (
                      <p className="text-xs text-slate-400">{int.cuenta}</p>
                    )}
                  </div>
                  <span
                    className={`ml-auto text-xs px-2 py-1 rounded-full font-medium ${
                      int.conectado
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {int.conectado ? "✅ Conectado" : "⚫ Sin conectar"}
                  </span>
                </div>

                {int.expires_at && (
                  <p className="text-xs text-slate-500 mb-3">
                    🕐 Expira: {int.expires_at}
                  </p>
                )}

                {!int.conectado && int.accion_url && (
                  <a
                    id={`btn-conectar-${int.plataforma}`}
                    href={int.accion_url}
                    className="block w-full text-center bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium py-2 rounded-lg transition-colors mt-2"
                  >
                    🔗 Conectar {int.plataforma.charAt(0).toUpperCase() + int.plataforma.slice(1)}
                  </a>
                )}

                {int.plataforma === "canva" && int.conectado && (
                  <a
                    href="https://www.canva.com/brand/kAHSLziFgxY"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium py-2 rounded-lg transition-colors mt-2"
                  >
                    🎨 Ver Brand Kit CESA
                  </a>
                )}
              </div>
            ))
          )}

          {/* Instrucción para Meta Business */}
          <div className="col-span-full bg-slate-900/40 border border-slate-700/30 rounded-xl p-5">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">
              📋 Para conectar Instagram y Facebook
            </h4>
            <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
              <li>Crea o accede a tu App en <a href="https://developers.facebook.com" target="_blank" className="text-sky-400 hover:underline">developers.facebook.com</a></li>
              <li>Activa los permisos: <code className="bg-slate-800 px-1 rounded">instagram_content_publish</code>, <code className="bg-slate-800 px-1 rounded">pages_manage_posts</code></li>
              <li>Configura <code className="bg-slate-800 px-1 rounded">FACEBOOK_APP_ID</code> y <code className="bg-slate-800 px-1 rounded">FACEBOOK_APP_SECRET</code> en el VPS</li>
              <li>Haz clic en "Conectar Instagram" arriba para autorizar</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────

function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: string;
  label: string;
  value: number;
  color: "violet" | "sky" | "indigo" | "amber" | "emerald" | "red";
}) {
  const colorMap = {
    violet: "from-violet-500/20 to-violet-600/10 border-violet-500/20 text-violet-400",
    sky: "from-sky-500/20 to-sky-600/10 border-sky-500/20 text-sky-400",
    indigo: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/20 text-indigo-400",
    amber: "from-amber-500/20 to-amber-600/10 border-amber-500/20 text-amber-400",
    emerald: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 text-emerald-400",
    red: "from-red-500/20 to-red-600/10 border-red-500/20 text-red-400",
  };
  return (
    <div
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-xl p-4 flex flex-col gap-1`}
    >
      <span className="text-2xl">{icon}</span>
      <span className={`text-2xl font-bold ${colorMap[color].split(" ").pop()}`}>{value.toLocaleString()}</span>
      <span className="text-xs text-slate-400">{label}</span>
    </div>
  );
}

function IntBadge({ icon, name, ok }: { icon: string; name: string; ok: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 p-2.5 rounded-lg border ${
        ok ? "border-emerald-500/30 bg-emerald-950/20" : "border-slate-700/50 bg-slate-800/30"
      }`}
    >
      <span>{icon}</span>
      <span className="text-xs text-slate-300">{name}</span>
      <span className="ml-auto text-xs">{ok ? "✅" : "⚫"}</span>
    </div>
  );
}
