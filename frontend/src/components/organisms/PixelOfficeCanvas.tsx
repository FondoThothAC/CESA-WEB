'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AgentSprite {
  id: number;
  name: string;
  encargado: string;
  eje: string;
  color: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  deskX: number;
  deskY: number;
  statusText: string;
  bubbleTimer: number;
  state: 'idle' | 'walking' | 'working' | 'meeting';
}

interface PixelOfficeCanvasProps {
  agentsList?: any[];
  onSelectAgent?: (agent: any) => void;
  onTriggerMeeting?: () => void;
}

export default function PixelOfficeCanvas({ agentsList = [], onSelectAgent, onTriggerMeeting }: PixelOfficeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<AgentSprite | null>(null);
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [meetingStep, setMeetingStep] = useState<string>('');

  // Configuración de avatares predeterminados en el mapa 2D
  const defaultSprites: AgentSprite[] = [
    { id: 1, name: 'Bob Prime', encargado: 'Mesa Directiva', eje: 'Coordinación Swarm', color: '#6366f1', x: 450, y: 150, targetX: 450, targetY: 150, deskX: 450, deskY: 150, statusText: 'Coordinando Swarm...', bubbleTimer: 0, state: 'idle' },
    { id: 2, name: 'Atlas', encargado: 'Arturo', eje: 'Emprendimiento & Bazar', color: '#f59e0b', x: 180, y: 220, targetX: 180, targetY: 220, deskX: 180, deskY: 220, statusText: 'Revisando Bazar...', bubbleTimer: 0, state: 'idle' },
    { id: 3, name: 'Aria', encargado: 'Ángela', eje: 'Comunicaciones & Canva', color: '#ec4899', x: 300, y: 220, targetX: 300, targetY: 220, deskX: 300, deskY: 220, statusText: 'Renderizando Canva...', bubbleTimer: 0, state: 'idle' },
    { id: 4, name: 'Orión', encargado: 'Oscar', eje: 'Deportes', color: '#10b981', x: 600, y: 220, targetX: 600, targetY: 220, deskX: 600, deskY: 220, statusText: 'Ligas activas', bubbleTimer: 0, state: 'idle' },
    { id: 5, name: 'Minerva', encargado: 'Mariana', eje: 'Académico', color: '#8b5cf6', x: 720, y: 220, targetX: 720, targetY: 220, deskX: 720, deskY: 220, statusText: 'EXANI Tutorías', bubbleTimer: 0, state: 'idle' },
    { id: 6, name: 'Aurora', encargado: 'Alexandra', eje: 'Bienestar', color: '#14b8a6', x: 180, y: 380, targetX: 180, targetY: 380, deskX: 180, deskY: 380, statusText: 'Atención Estudiantil', bubbleTimer: 0, state: 'idle' },
    { id: 7, name: 'Lyra', encargado: 'Bárbara', eje: 'Cultura & Gaceta', color: '#f43f5e', x: 300, y: 380, targetX: 300, targetY: 380, deskX: 300, deskY: 380, statusText: 'Edición Gaceta #4', bubbleTimer: 0, state: 'idle' },
    { id: 8, name: 'Cleo', encargado: 'Christian', eje: 'Finanzas & Tesorería', color: '#eab308', x: 600, y: 380, targetX: 600, targetY: 380, deskX: 600, deskY: 380, statusText: 'Auditoría OK', bubbleTimer: 0, state: 'idle' },
    { id: 9, name: 'Nova', encargado: 'Luisa', eje: 'Relaciones Externas', color: '#06b6d4', x: 720, y: 380, targetX: 720, targetY: 380, deskX: 720, deskY: 380, statusText: 'Convenios 15% OFF', bubbleTimer: 0, state: 'idle' }
  ];

  const spritesRef = useRef<AgentSprite[]>(defaultSprites);

  // Sincronizar lista si viene desde backend
  useEffect(() => {
    if (agentsList && agentsList.length > 0) {
      const merged = agentsList.map((a, idx) => {
        const existing = defaultSprites[idx] || {
          x: 200 + (idx % 4) * 120,
          y: 200 + Math.floor(idx / 4) * 140,
          deskX: 200 + (idx % 4) * 120,
          deskY: 200 + Math.floor(idx / 4) * 140
        };
        return {
          id: a.id,
          name: a.nombre_agente || `Agente ${a.id}`,
          encargado: a.encargado_nombre || 'Mesa Directiva',
          eje: a.eje_trabajo || 'General',
          color: a.color_hex || existing.color || '#3b82f6',
          x: existing.x,
          y: existing.y,
          targetX: existing.targetX || existing.x,
          targetY: existing.targetY || existing.y,
          deskX: existing.deskX,
          deskY: existing.deskY,
          statusText: `${a.eje_trabajo || 'Activo'}`,
          bubbleTimer: 0,
          state: 'idle' as const
        };
      });
      spritesRef.current = merged;
    }
  }, [agentsList]);

  // Motor principal del Canvas 2D
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      // 1. Limpiar Fondo estilo Pixel Art Oscuro
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. DIBUJAR PISO & CUADRÍCULA DE OFICINA
      ctx.fillStyle = '#111827';
      ctx.fillRect(40, 40, canvas.width - 80, canvas.height - 80);

      // Baldosas pixeladas
      ctx.strokeStyle = 'rgba(255,255,255,0.03)';
      ctx.lineWidth = 1;
      for (let x = 40; x < canvas.width - 40; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 40);
        ctx.lineTo(x, canvas.height - 40);
        ctx.stroke();
      }
      for (let y = 40; y < canvas.height - 40; y += 40) {
        ctx.beginPath();
        ctx.moveTo(40, y);
        ctx.lineTo(canvas.width - 40, y);
        ctx.stroke();
      }

      // 3. DIBUJAR MESA DE JUNTAS CENTRAL ("Mesa de Expertos")
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(380, 270, 140, 90, 16);
      ctx.fill();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('MESA DE EXPERTOS', 450, 312);
      ctx.fillText('(Junta Semanal)', 450, 324);

      // 4. DIBUJAR ESCRITORIOS INDIVIDUALES
      spritesRef.current.forEach((sp) => {
        // Escritorio
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.roundRect(sp.deskX - 30, sp.deskY - 20, 60, 40, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Laptop en escritorio
        ctx.fillStyle = sp.color;
        ctx.fillRect(sp.deskX - 10, sp.deskY - 10, 20, 12);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sp.deskX - 8, sp.deskY - 8, 16, 8);

        // Nombre en escritorio
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(sp.name, sp.deskX, sp.deskY + 30);
      });

      // 5. ACTUALIZAR POSICIÓN Y DIBUJAR AVATARES AGENTES
      spritesRef.current.forEach((sp) => {
        // Movimiento suave hacia target
        const dx = sp.targetX - sp.x;
        const dy = sp.targetY - sp.y;
        if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
          sp.x += dx * 0.05;
          sp.y += dy * 0.05;
          sp.state = 'walking';
        } else {
          sp.x = sp.targetX;
          sp.y = sp.targetY;
          sp.state = 'idle';
        }

        // Sombra avatar
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(sp.x, sp.y + 12, 12, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cuerpo Avatar Pixel
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ojos / Cara Pixel
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sp.x - 5, sp.y - 4, 3, 3);
        ctx.fillRect(sp.x + 2, sp.y - 4, 3, 3);
        ctx.fillStyle = '#000000';
        ctx.fillRect(sp.x - 4, sp.y - 3, 2, 2);
        ctx.fillRect(sp.x + 3, sp.y - 3, 2, 2);

        // Indicador de Estado Activo
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(sp.x + 10, sp.y - 10, 4, 0, Math.PI * 2);
        ctx.fill();

        // BOCADILLO DE DIÁLOGO / TEXTO DE ESTADO
        if (sp.statusText) {
          ctx.font = 'bold 9px sans-serif';
          const textWidth = ctx.measureText(sp.statusText).width;
          const bgW = textWidth + 14;

          // Fondo bocadillo
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.beginPath();
          ctx.roundRect(sp.x - bgW / 2, sp.y - 38, bgW, 18, 6);
          ctx.fill();
          ctx.strokeStyle = sp.color;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Texto
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.fillText(sp.statusText, sp.x, sp.y - 25);
        }
      });

      animId = requestAnimationFrame(render);
    };

    render();

    // Movimiento aleatorio periódico para simular vida en la oficina
    const interval = setInterval(() => {
      if (!isMeetingActive) {
        spritesRef.current.forEach((sp) => {
          if (Math.random() > 0.6) {
            // Caminar hacia la mesa central o su escritorio
            const goToDesk = Math.random() > 0.5;
            sp.targetX = goToDesk ? sp.deskX : 380 + Math.random() * 140;
            sp.targetY = goToDesk ? sp.deskY : 270 + Math.random() * 90;
          }
        });
      }
    }, 4000);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(interval);
    };
  }, [isMeetingActive]);

  // Iniciar Simulación de Reunión de Mesa de Expertos (Martes y Jueves)
  const handleStartMeeting = () => {
    setIsMeetingActive(true);
    setMeetingStep('Iniciando Mesa de Expertos...');

    // Mover todos los agentes alrededor de la mesa central
    const meetingPositions = [
      { x: 450, y: 240 }, // Bob (Norte)
      { x: 350, y: 280 }, // Atlas (Oeste 1)
      { x: 350, y: 330 }, // Aria (Oeste 2)
      { x: 410, y: 380 }, // Orión (Sur 1)
      { x: 490, y: 380 }, // Minerva (Sur 2)
      { x: 550, y: 330 }, // Aurora (Este 2)
      { x: 550, y: 280 }, // Lyra (Este 1)
      { x: 410, y: 240 }, // Cleo (Norte-Oeste)
      { x: 490, y: 240 }  // Nova (Norte-Este)
    ];

    spritesRef.current.forEach((sp, idx) => {
      const pos = meetingPositions[idx] || { x: 450, y: 310 };
      sp.targetX = pos.x;
      sp.targetY = pos.y;
      sp.statusText = 'En Junta';
    });

    const dialogueSequence = [
      { agent: 'Bob Prime', text: '¡Comenzamos la Mesa de Expertos CESA!' },
      { agent: 'Atlas', text: 'Arturo reporta 18 espacios en Bazar.' },
      { agent: 'Aria', text: 'Ángela tiene el borrador en Canva listo.' },
      { agent: 'Orión', text: 'Torneo de Fútbol: 12 equipos.' },
      { agent: 'Cleo', text: 'Presupuesto auditado sin sobrecosto.' },
      { agent: 'Minerva', text: '45 tutorías EXANI registradas.' },
      { agent: 'Nova', text: 'Convenio 15% de descuento activo.' },
      { agent: 'Bob Prime', text: 'Generando minuta y notificando por Telegram...' }
    ];

    dialogueSequence.forEach((step, index) => {
      setTimeout(() => {
        setMeetingStep(`[${step.agent}]: ${step.text}`);
        const sp = spritesRef.current.find((s) => s.name === step.agent);
        if (sp) {
          sp.statusText = step.text;
        }
      }, (index + 1) * 2000);
    });

    // Concluir reunión y regresar a escritorios
    setTimeout(() => {
      spritesRef.current.forEach((sp) => {
        sp.targetX = sp.deskX;
        sp.targetY = sp.deskY;
        sp.statusText = 'En escritorio';
      });
      setIsMeetingActive(false);
      setMeetingStep('Reunión finalizada. Minuta enviada por Telegram (CCO Admin).');
      if (onTriggerMeeting) onTriggerMeeting();
    }, (dialogueSequence.length + 1) * 2000);
  };

  // Manejar clic en el canvas para seleccionar agente
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const clicked = spritesRef.current.find((sp) => {
      const dist = Math.hypot(sp.x - clickX, sp.y - clickY);
      return dist <= 20;
    });

    if (clicked) {
      setSelectedAgent(clicked);
      if (onSelectAgent) onSelectAgent(clicked);
    }
  };

  return (
    <div className="space-y-4">
      {/* BARRA SUPERIOR DE ACCIONES PIXEL OFFICE */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-[#111625] p-4 rounded-2xl border border-white/10 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
          <div>
            <h4 className="text-xs font-black uppercase text-white tracking-wider">ZeroClaw Pixel HQ (2D Engine)</h4>
            <p className="text-[10px] text-slate-400">9 Sub-Agentes en línea • CESA UNISON Swarm</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleStartMeeting}
            disabled={isMeetingActive}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 ${
              isMeetingActive
                ? 'bg-amber-600 text-white animate-pulse'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            <span>💬</span> {isMeetingActive ? 'Mesa de Expertos en Curso...' : 'Simular Junta de Agentes (Martes/Jueves)'}
          </button>
        </div>
      </div>

      {/* DETALLE DE PASO DE REUNIÓN SI ESTÁ ACTIVA */}
      {meetingStep && (
        <div className="bg-indigo-950/40 border border-indigo-500/30 p-3 rounded-xl text-xs text-indigo-300 font-mono flex items-center gap-3 animate-in fade-in duration-300">
          <span>🧠</span>
          <span className="flex-1 font-bold">{meetingStep}</span>
        </div>
      )}

      {/* LIENZO 2D INTERACTIVO */}
      <div className="relative w-full overflow-hidden rounded-3xl border-2 border-slate-800 bg-[#090d16] shadow-2xl">
        <canvas
          ref={canvasRef}
          width={900}
          height={500}
          onClick={handleCanvasClick}
          className="w-full h-auto cursor-pointer block"
        />

        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[9px] text-slate-400 font-mono pointer-events-none">
          💡 Haz clic en cualquier agente para ver su encargado y tareas
        </div>
      </div>

      {/* MODAL DETALLE DE AGENTE SELECCIONADO */}
      {selectedAgent && (
        <div className="bg-[#111625] border border-blue-500/30 p-5 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: selectedAgent.color }}>
                {selectedAgent.name[0]}
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase">{selectedAgent.name}</h4>
                <p className="text-[10px] text-slate-400">Encargado Humano: <strong className="text-blue-400">{selectedAgent.encargado}</strong></p>
              </div>
            </div>
            <button onClick={() => setSelectedAgent(null)} className="text-slate-400 hover:text-white text-xs">✕</button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-black/30 p-3 rounded-xl">
              <span className="text-[9px] text-slate-500 uppercase font-black">Eje de Trabajo</span>
              <p className="text-white font-bold mt-0.5">{selectedAgent.eje}</p>
            </div>
            <div className="bg-black/30 p-3 rounded-xl">
              <span className="text-[9px] text-slate-500 uppercase font-black">Estado Actual</span>
              <p className="text-emerald-400 font-bold mt-0.5">● {selectedAgent.statusText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
