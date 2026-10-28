import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Play,
  Plus,
  Send,
  BarChart2,
  Clock,
  Settings,
  Users,
  FolderPlus,
  Bell,
  Coffee,
  Check,
  Trash2,
  Sparkles,
  Terminal
} from 'lucide-react';
import { AIAgent, AIAgentExecutionLog, AIAgentRoom, Company, Lead } from '../types';

interface HabblaudOfficeViewProps {
  agents: AIAgent[];
  logs: AIAgentExecutionLog[];
  currentCompany: Company;
  leads: Lead[];
  selectedAgentId: string | null;
  onSelectAgent: (agentId: string) => void;
  onOpenMagicCreator: () => void;
  onOpenAgentConfig: (agentId: string) => void;
  onUpdateAgent?: (agent: AIAgent) => Promise<void>;
  onQuickExecuteAgent: (agentId: string, promptText: string, leadId?: string) => Promise<void>;
  isExecuting?: boolean;
  onSelectLogCard?: (log: AIAgentExecutionLog) => void;
}

type IdleZone = 'desk' | 'copa' | 'lounge' | 'recepcao' | 'banheiros';

interface AgentLivePresence {
  agentId: string;
  state: 'working' | 'idle' | 'needs_attention';
  zone: IdleZone;
  activityLabel: string;
  idleMinutes: number;
}

interface LiveStreamLine {
  id: string;
  time: string;
  agentId: string;
  agentName: string;
  skinIndex: number;
  roomSlug: string;
  icon: 'tool' | 'thinking' | 'writing' | 'done' | 'alert';
  text: string;
}

const PIXEL_SKINS = [
  { hair: '#4a2c11', skin: '#f5cba7', shirt: '#6c5ce7', pants: '#2d3436' },
  { hair: '#1e272e', skin: '#d35400', shirt: '#00b894', pants: '#2d3436' },
  { hair: '#fdcb6e', skin: '#ffeaa7', shirt: '#e17055', pants: '#0984e3' },
  { hair: '#b71540', skin: '#f8c291', shirt: '#0984e3', pants: '#2f3640' },
  { hair: '#2f3640', skin: '#f5cba7', shirt: '#e84393', pants: '#192a56' },
  { hair: '#d63031', skin: '#fad390', shirt: '#fdcb6e', pants: '#2d3436' },
  { hair: '#006266', skin: '#f5cba7', shirt: '#a29bfe', pants: '#2d3436' },
  { hair: '#574b90', skin: '#f8a5c2', shirt: '#3dc1d3', pants: '#303952' }
];

const ROOM_COLOR_STYLES: Record<AIAgentRoom['color'], { borderTop: string; pillBorder: string; dot: string; label: string }> = {
  sky: { borderTop: 'border-t-4 border-t-sky-500', pillBorder: 'border-t-2 border-t-sky-400', dot: 'bg-sky-400', label: 'Azul' },
  rose: { borderTop: 'border-t-4 border-t-rose-500', pillBorder: 'border-t-2 border-t-rose-500', dot: 'bg-rose-400', label: 'Coral / Rosa' },
  emerald: { borderTop: 'border-t-4 border-t-emerald-500', pillBorder: 'border-t-2 border-t-emerald-400', dot: 'bg-emerald-400', label: 'Verde' },
  amber: { borderTop: 'border-t-4 border-t-amber-500', pillBorder: 'border-t-2 border-t-amber-400', dot: 'bg-amber-400', label: 'Âmbar' },
  purple: { borderTop: 'border-t-4 border-t-purple-500', pillBorder: 'border-t-2 border-t-purple-400', dot: 'bg-purple-400', label: 'Roxo' },
  cyan: { borderTop: 'border-t-4 border-t-cyan-500', pillBorder: 'border-t-2 border-t-cyan-400', dot: 'bg-cyan-400', label: 'Ciano' }
};

const IDLE_ACTIVITIES: Record<IdleZone, string[]> = {
  copa: ['☕ Tomando café', '🥐 Lanchando na copa', '🍿 Comendo pipoca', '🧃 Pegando suco'],
  lounge: ['🏓 Jogando ping-pong', '⚽ Vendo futebol na TV', '💤 Descansando no sofá', '🎮 Relaxando no lounge'],
  recepcao: ['👋 Na recepção', '💧 No bebedouro', '📱 Checando mensagens'],
  banheiros: ['🚰 Lavando as mãos', '🚽 No banheiro'],
  desk: ['💻 No posto de trabalho', '👀 Aguardando tarefa']
};

const ZONE_LABELS: Record<IdleZone, string> = {
  desk: 'Na Sala',
  copa: 'Na Copa',
  lounge: 'No Lounge',
  recepcao: 'Na Recepção',
  banheiros: 'No Banheiro'
};

// Bonequinho Pixel Art 16x16 com suporte a mão levantada ("precisam de você") e animação
const PixelAvatar: React.FC<{
  skinIndex: number;
  size?: number;
  isWorking?: boolean;
  needsAttention?: boolean;
  bubbleText?: string;
  nameTag?: string;
  statusColor?: 'emerald' | 'amber' | 'slate';
  onClick?: (e: React.MouseEvent) => void;
}> = ({
  skinIndex,
  size = 34,
  isWorking = false,
  needsAttention = false,
  bubbleText,
  nameTag,
  statusColor = 'emerald',
  onClick
}) => {
  const palette = PIXEL_SKINS[skinIndex % PIXEL_SKINS.length];
  return (
    <div
      onClick={onClick}
      className="relative inline-flex flex-col items-center justify-center select-none group cursor-pointer"
    >
      {/* Balão de atividade / fala em cima do personagem */}
      {bubbleText && (
        <div
          className={`absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[9px] font-bold whitespace-nowrap shadow-lg z-30 border ${
            needsAttention
              ? 'bg-amber-400 text-slate-950 border-amber-200 animate-bounce'
              : isWorking
              ? 'bg-slate-900 text-emerald-300 border-emerald-400/60 animate-bounce'
              : 'bg-slate-900/90 text-slate-200 border-slate-600'
          }`}
        >
          {bubbleText}
        </div>
      )}

      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 16 16"
          width={size}
          height={size}
          style={{ imageRendering: 'pixelated' }}
          className={isWorking ? 'animate-bounce' : 'transition-transform group-hover:scale-110'}
        >
          {/* Sombra no chão */}
          <rect x="3" y="14" width="10" height="2" fill="rgba(0,0,0,0.35)" />
          {/* Cabelo Topo */}
          <rect x="4" y="1" width="8" height="3" fill={palette.hair} />
          <rect x="3" y="2" width="10" height="2" fill={palette.hair} />
          {/* Rosto */}
          <rect x="4" y="4" width="8" height="5" fill={palette.skin} />
          {/* Olhos */}
          <rect x="5" y="5" width="2" height="2" fill="#111827" />
          <rect x="9" y="5" width="2" height="2" fill="#111827" />
          <rect x="5" y="5" width="1" height="1" fill="#ffffff" />
          <rect x="9" y="5" width="1" height="1" fill="#ffffff" />
          {/* Sorriso */}
          <rect x="7" y="7" width="2" height="1" fill="#e17055" />
          {/* Camisa / Tronco */}
          <rect x="3" y="9" width="10" height="4" fill={palette.shirt} />
          {/* Braços (se needsAttention, levanta a mão direita!) */}
          <rect x="2" y="9" width="2" height="3" fill={palette.skin} />
          {needsAttention ? (
            <rect x="12" y="5" width="2" height="5" fill={palette.skin} />
          ) : (
            <rect x="12" y="9" width="2" height="3" fill={palette.skin} />
          )}
          {/* Calça / Pernas */}
          <rect x="4" y="13" width="3" height="2" fill={palette.pants} />
          <rect x="9" y="13" width="3" height="2" fill={palette.pants} />
        </svg>

        {needsAttention && (
          <span className="absolute -top-2 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] flex items-center justify-center animate-ping">
            ✋
          </span>
        )}
      </div>

      {/* Tag com o Nome do Profissional */}
      {nameTag && (
        <div className="mt-0.5 bg-[#161b24]/95 border border-slate-600 px-2 py-0.2 rounded-full flex items-center gap-1 shadow-md z-20">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              statusColor === 'emerald'
                ? 'bg-emerald-400'
                : statusColor === 'amber'
                ? 'bg-amber-400 animate-ping'
                : 'bg-slate-400'
            }`}
          />
          <span className="text-[9px] font-bold text-white whitespace-nowrap">{nameTag}</span>
        </div>
      )}
    </div>
  );
};

// Árvore Pixel Art para o gramado externo
const PixelTree: React.FC<{ x: number; y: number; variant?: 'pine' | 'round' }> = ({ x, y, variant = 'round' }) => (
  <div
    className="absolute pointer-events-none select-none"
    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
  >
    {variant === 'pine' ? (
      <svg width="36" height="44" viewBox="0 0 18 22" style={{ imageRendering: 'pixelated' }}>
        <ellipse cx="9" cy="20" rx="6" ry="2" fill="rgba(0,0,0,0.28)" />
        <rect x="7" y="16" width="4" height="4" fill="#6d4c41" />
        <polygon points="9,1 2,10 16,10" fill="#2e7d32" />
        <polygon points="9,5 1,14 17,14" fill="#388e3c" />
        <polygon points="9,9 2,17 16,17" fill="#43a047" />
        <rect x="6" y="4" width="2" height="2" fill="#66bb6a" />
      </svg>
    ) : (
      <svg width="40" height="44" viewBox="0 0 20 22" style={{ imageRendering: 'pixelated' }}>
        <ellipse cx="10" cy="20" rx="7" ry="2" fill="rgba(0,0,0,0.28)" />
        <rect x="8" y="14" width="4" height="6" fill="#5d4037" />
        <rect x="4" y="4" width="12" height="10" rx="2" fill="#2e7d32" />
        <rect x="3" y="6" width="14" height="7" fill="#388e3c" />
        <rect x="6" y="3" width="8" height="3" fill="#4caf50" />
        <rect x="6" y="5" width="3" height="2" fill="#81c784" />
      </svg>
    )}
  </div>
);

export const HabblaudOfficeView: React.FC<HabblaudOfficeViewProps> = ({
  agents,
  logs,
  currentCompany,
  leads,
  selectedAgentId,
  onSelectAgent,
  onOpenMagicCreator,
  onOpenAgentConfig,
  onUpdateAgent,
  onQuickExecuteAgent,
  isExecuting = false,
  onSelectLogCard
}) => {
  const storageRoomsKey = `mdtracker_office_rooms_${currentCompany.id}`;

  const getDefaultRoomsForCompany = (compId: string): AIAgentRoom[] => [
    {
      id: `room-sdr-${compId.slice(-6)}`,
      companyId: compId,
      name: 'Squad SDR & Triagem',
      slug: 'squad-sdr-qualificacao',
      color: 'sky',
      description: 'Sala de recepção e qualificação de leads',
      createdAt: new Date().toISOString()
    },
    {
      id: `room-closer-${compId.slice(-6)}`,
      companyId: compId,
      name: 'Squad Closer & Fechamento',
      slug: 'squad-closer-vendas',
      color: 'rose',
      description: 'Sala de negociação, contorno de objeções e checkout',
      createdAt: new Date().toISOString()
    }
  ];

  // Salas de trabalho customizáveis (permite criar salas e juntar vários agentes na mesma sala)
  const [rooms, setRooms] = useState<AIAgentRoom[]>(() => {
    try {
      const saved = localStorage.getItem(storageRoomsKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return getDefaultRoomsForCompany(currentCompany.id);
  });

  // Vínculo Agente -> Sala (persistido no localStorage e sincronizado com roomId do agente)
  const storageAssignKey = `mdtracker_office_assignments_${currentCompany.id}`;
  const [agentRoomMap, setAgentRoomMap] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(storageAssignKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Ao alternar empresa, sincronizar salas e vínculos exclusivos daquela empresa
  useEffect(() => {
    try {
      const savedRooms = localStorage.getItem(`mdtracker_office_rooms_${currentCompany.id}`);
      if (savedRooms) {
        const parsed = JSON.parse(savedRooms);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRooms(parsed);
        } else {
          setRooms(getDefaultRoomsForCompany(currentCompany.id));
        }
      } else {
        setRooms(getDefaultRoomsForCompany(currentCompany.id));
      }

      const savedAssign = localStorage.getItem(`mdtracker_office_assignments_${currentCompany.id}`);
      if (savedAssign) {
        setAgentRoomMap(JSON.parse(savedAssign));
      } else {
        setAgentRoomMap({});
      }
    } catch {}
    setPresenceMap({});
  }, [currentCompany.id]);

  // Garantir que todo agente tenha uma sala atribuída (e se criar agentes novos sem sala, cria uma sala para ele ou aloca)
  useEffect(() => {
    if (agents.length === 0) return;
    let updatedRooms = [...rooms];
    let updatedMap = { ...agentRoomMap };
    let roomsChanged = false;
    let mapChanged = false;

    agents.forEach((ag, index) => {
      if (ag.roomId && updatedRooms.some(r => r.id === ag.roomId)) {
        if (updatedMap[ag.id] !== ag.roomId) {
          updatedMap[ag.id] = ag.roomId;
          mapChanged = true;
        }
        return;
      }

      if (updatedMap[ag.id] && updatedRooms.some(r => r.id === updatedMap[ag.id])) {
        return;
      }

      // Primeiros 2 agentes vão para as 2 salas iniciais; 3º agente em diante ganha uma Sala Nova automática!
      if (index === 0 && updatedRooms[0]) {
        updatedMap[ag.id] = updatedRooms[0].id;
        mapChanged = true;
      } else if (index === 1 && updatedRooms[1]) {
        updatedMap[ag.id] = updatedRooms[1].id;
        mapChanged = true;
      } else {
        const shortName = ag.name.split('—')[0].trim();
        const newRoomId = `room-auto-${ag.id}`;
        const existingAuto = updatedRooms.find(r => r.id === newRoomId);
        if (!existingAuto) {
          const colors: AIAgentRoom['color'][] = ['emerald', 'amber', 'purple', 'cyan', 'sky', 'rose'];
          const newRoom: AIAgentRoom = {
            id: newRoomId,
            companyId: currentCompany.id,
            name: `Sala ${shortName}`,
            slug: `sala-${shortName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            color: colors[updatedRooms.length % colors.length],
            description: ag.roleTitle,
            createdAt: new Date().toISOString()
          };
          updatedRooms.push(newRoom);
          roomsChanged = true;
        }
        updatedMap[ag.id] = newRoomId;
        mapChanged = true;
      }
    });

    if (roomsChanged) {
      setRooms(updatedRooms);
      try { localStorage.setItem(storageRoomsKey, JSON.stringify(updatedRooms)); } catch {}
    }
    if (mapChanged) {
      setAgentRoomMap(updatedMap);
      try { localStorage.setItem(storageAssignKey, JSON.stringify(updatedMap)); } catch {}
    }
  }, [agents]);

  const saveRoomsAndAssignments = (nextRooms: AIAgentRoom[], nextMap: Record<string, string>) => {
    setRooms(nextRooms);
    setAgentRoomMap(nextMap);
    try {
      localStorage.setItem(storageRoomsKey, JSON.stringify(nextRooms));
      localStorage.setItem(storageAssignKey, JSON.stringify(nextMap));
    } catch {}
  };

  // Presença e movimentação dos personagens pelo escritório (Banheiro, Recepção, Copa, Lounge ou Mesa na Sala)
  const [presenceMap, setPresenceMap] = useState<Record<string, AgentLivePresence>>({});
  const [roamingEnabled, setRoamingEnabled] = useState<boolean>(true);

  // Inicializar e atualizar movimentação autônoma dos personagens ociosos
  useEffect(() => {
    setPresenceMap((prev) => {
      const next: Record<string, AgentLivePresence> = { ...prev };
      const idleZones: IdleZone[] = ['copa', 'lounge', 'recepcao', 'banheiros', 'desk'];

      agents.forEach((ag, i) => {
        const lastLog = logs.find(l => l.agentId === ag.id);
        const needsHuman = lastLog?.status === 'handed_over' && !lastLog?.taskCompleted;

        if (!next[ag.id]) {
          // Distribuir inicialmente: 1 trabalhando na mesa e outros passeando se ociosos
          const initialZone: IdleZone = needsHuman
            ? 'desk'
            : i === 0
            ? 'desk'
            : idleZones[i % idleZones.length];
          const actList = IDLE_ACTIVITIES[initialZone];
          next[ag.id] = {
            agentId: ag.id,
            state: needsHuman ? 'needs_attention' : i === 0 ? 'working' : 'idle',
            zone: initialZone,
            activityLabel: needsHuman
              ? '✋ Precisa de você!'
              : i === 0
              ? '🔍 search_products: catálogo'
              : actList[0],
            idleMinutes: (i + 1) * 2
          };
        }
      });
      return next;
    });
  }, [agents, logs]);

  // Ciclo vivo: a cada 5.5 segundos, agentes ociosos podem caminhar entre Recepção, Copa, Banheiro, Lounge ou voltar à Sala para trabalhar
  useEffect(() => {
    if (!roamingEnabled || agents.length === 0) return;

    const timer = setInterval(() => {
      setPresenceMap((prev) => {
        const next = { ...prev };
        const targetAgent = agents[Math.floor(Math.random() * agents.length)];
        if (!targetAgent) return prev;

        const current = next[targetAgent.id];
        const lastLog = logs.find(l => l.agentId === targetAgent.id);
        if (lastLog?.status === 'handed_over' && !lastLog?.taskCompleted) {
          next[targetAgent.id] = {
            agentId: targetAgent.id,
            state: 'needs_attention',
            zone: 'desk',
            activityLabel: '✋ Precisa de você!',
            idleMinutes: 0
          };
          return next;
        }

        // Sorteia se o agente vai trabalhar na mesa dele ou passear pelas áreas de convivência (Copa, Lounge, Recepção, Banheiros)
        const roll = Math.random();
        if (roll < 0.38) {
          const workActions = [
            '💭 Pensando...',
            '🛠️ get_lead_profile: lendo CRM',
            '🔍 search_products: catálogo',
            '💬 Escrevendo a resposta...',
            '⚡ update_lead_stage: CRM'
          ];
          next[targetAgent.id] = {
            agentId: targetAgent.id,
            state: 'working',
            zone: 'desk',
            activityLabel: workActions[Math.floor(Math.random() * workActions.length)],
            idleMinutes: 0
          };
        } else {
          const socialZones: IdleZone[] = ['copa', 'lounge', 'recepcao', 'banheiros', 'desk'];
          const chosenZone = socialZones[Math.floor(Math.random() * socialZones.length)];
          const acts = IDLE_ACTIVITIES[chosenZone];
          next[targetAgent.id] = {
            agentId: targetAgent.id,
            state: 'idle',
            zone: chosenZone,
            activityLabel: acts[Math.floor(Math.random() * acts.length)],
            idleMinutes: (current?.idleMinutes || 1) + 1
          };
        }

        return next;
      });
    }, 5500);

    return () => clearInterval(timer);
  }, [agents, logs, roamingEnabled]);

  // Chamar todos os profissionais imediatamente de volta para suas salas de trabalho
  const handleCallAllToDesks = () => {
    const next: Record<string, AgentLivePresence> = {};
    agents.forEach((ag) => {
      next[ag.id] = {
        agentId: ag.id,
        state: 'working',
        zone: 'desk',
        activityLabel: '💻 Ativo na estação',
        idleMinutes: 0
      };
    });
    setPresenceMap(next);
  };

  // Liberar todos os agentes ociosos para passear na Copa, Lounge, Recepção e Banheiro
  const handleSendIdleToSocialAreas = () => {
    const socialZones: IdleZone[] = ['copa', 'lounge', 'recepcao', 'banheiros'];
    const next: Record<string, AgentLivePresence> = {};
    agents.forEach((ag, idx) => {
      const z = socialZones[idx % socialZones.length];
      const acts = IDLE_ACTIVITIES[z];
      next[ag.id] = {
        agentId: ag.id,
        state: 'idle',
        zone: z,
        activityLabel: acts[idx % acts.length],
        idleMinutes: 3
      };
    });
    setPresenceMap(next);
  };

  // Estados de interface (Busca, Zoom, Console, Modais de Sala e Terminal)
  const [searchQuery, setSearchQuery] = useState('');
  const [zoom, setZoom] = useState<number>(0.95);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [filterConsoleAgentId, setFilterConsoleAgentId] = useState<string>('ALL');

  // Modal de Criar / Gerenciar Salas para juntar profissionais
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomColor, setNewRoomColor] = useState<AIAgentRoom['color']>('emerald');
  const [newRoomSelectedAgents, setNewRoomSelectedAgents] = useState<string[]>([]);

  // Modal de Estatísticas / Meu Dia (igual barra direita do Habblaud)
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Modal de Terminal Direto / Dar Tarefa ao Agente
  const [quickTaskAgent, setQuickTaskAgent] = useState<AIAgent | null>(null);
  const [quickTaskMessage, setQuickTaskMessage] = useState('');
  const [quickTaskLeadId, setQuickTaskLeadId] = useState('');

  // Criar Nova Sala e juntar os profissionais escolhidos nela
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    const slug = newRoomName
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-');

    const createdRoom: AIAgentRoom = {
      id: `room-${Date.now()}`,
      companyId: currentCompany.id,
      name: newRoomName.trim(),
      slug: slug || `sala-${rooms.length + 1}`,
      color: newRoomColor,
      createdAt: new Date().toISOString()
    };

    const nextRooms = [...rooms, createdRoom];
    const nextMap = { ...agentRoomMap };
    newRoomSelectedAgents.forEach((agId) => {
      nextMap[agId] = createdRoom.id;
    });

    saveRoomsAndAssignments(nextRooms, nextMap);
    setNewRoomName('');
    setNewRoomSelectedAgents([]);
  };

  const handleAssignAgentToRoom = (agentId: string, targetRoomId: string) => {
    const nextMap = { ...agentRoomMap, [agentId]: targetRoomId };
    saveRoomsAndAssignments(rooms, nextMap);
    const found = agents.find(a => a.id === agentId);
    const targetRoom = rooms.find(r => r.id === targetRoomId);
    if (found && onUpdateAgent) {
      onUpdateAgent({ ...found, roomId: targetRoomId, roomName: targetRoom?.name }).catch(() => null);
    }
  };

  const handleDeleteRoom = (roomId: string) => {
    if (rooms.length <= 1) return;
    const remaining = rooms.filter(r => r.id !== roomId);
    const fallbackRoomId = remaining[0].id;
    const nextMap = { ...agentRoomMap };
    Object.keys(nextMap).forEach((agId) => {
      if (nextMap[agId] === roomId) nextMap[agId] = fallbackRoomId;
    });
    saveRoomsAndAssignments(remaining, nextMap);
  };

  // Filtrar salas e agentes na sidebar "Escritório"
  const filteredRoomsWithAgents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rooms
      .map((room) => {
        const roomAgents = agents.filter(a => (agentRoomMap[a.id] || rooms[0]?.id) === room.id);
        const matchesRoom =
          !q ||
          room.name.toLowerCase().includes(q) ||
          room.slug.toLowerCase().includes(q);
        const matchingAgents = q
          ? roomAgents.filter(
              a =>
                a.name.toLowerCase().includes(q) ||
                a.roleTitle.toLowerCase().includes(q) ||
                a.goal.toLowerCase().includes(q)
            )
          : roomAgents;

        return {
          room,
          agents: matchesRoom ? roomAgents : matchingAgents,
          visible: !q || matchesRoom || matchingAgents.length > 0
        };
      })
      .filter(item => item.visible);
  }, [rooms, agents, agentRoomMap, searchQuery]);

  // Agentes atualmente posicionados em cada área social quando estão ociosos
  const getAgentsInSocialZone = (zone: IdleZone) => {
    return agents
      .map((agent, skinIndex) => ({
        agent,
        skinIndex,
        presence: presenceMap[agent.id]
      }))
      .filter(item => item.presence && item.presence.state === 'idle' && item.presence.zone === zone);
  };

  // Linhas do Console Inferior "Atividade"
  const streamLines = useMemo<LiveStreamLine[]>(() => {
    const lines: LiveStreamLine[] = [];
    const targetLogs = filterConsoleAgentId === 'ALL'
      ? logs
      : logs.filter(l => l.agentId === filterConsoleAgentId);

    targetLogs.slice(0, 12).forEach((log) => {
      const agentIdx = Math.max(0, agents.findIndex(a => a.id === log.agentId));
      const baseDate = new Date(log.createdAt);
      const assignedRoomId = agentRoomMap[log.agentId];
      const assignedRoom = rooms.find(r => r.id === assignedRoomId);
      const roomSlug = assignedRoom?.slug || `sala-${(log.agentName || 'agente').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 14)}`;

      (log.steps || []).forEach((st, i) => {
        const stepTime = new Date(baseDate.getTime() - (log.steps.length - i) * 3000);
        const timeStr = stepTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        lines.push({
          id: `${log.id}-st-${i}`,
          time: timeStr,
          agentId: log.agentId,
          agentName: log.agentName.split('—')[0].trim(),
          skinIndex: agentIdx,
          roomSlug,
          icon: st.type === 'data_lookup' || st.type === 'action_executed' ? 'tool' : 'thinking',
          text: st.toolId ? `${st.toolId}: ${st.title}` : st.title
        });
      });

      const writeTime = new Date(baseDate.getTime() - 1000).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      lines.push({
        id: `${log.id}-write`,
        time: writeTime,
        agentId: log.agentId,
        agentName: log.agentName.split('—')[0].trim(),
        skinIndex: agentIdx,
        roomSlug,
        icon: 'writing',
        text: `Escrevendo a resposta para ${log.leadName || 'Lead'}`
      });

      const doneTime = baseDate.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      const durSec = log.durationMs ? `${(log.durationMs / 1000).toFixed(0)}s` : '2s';
      lines.push({
        id: `${log.id}-done`,
        time: doneTime,
        agentId: log.agentId,
        agentName: log.agentName.split('—')[0].trim(),
        skinIndex: agentIdx,
        roomSlug,
        icon: log.status === 'handed_over' ? 'alert' : 'done',
        text: log.status === 'handed_over'
          ? `✋ Precisa de você: Transferido p/ humano (${log.leadName})`
          : `Concluiu em ${durSec} • ${log.taskTitle || 'Objetivo executado'}`
      });
    });

    return lines.slice(0, 18);
  }, [logs, agents, rooms, agentRoomMap, filterConsoleAgentId]);

  // Contadores do Topo estilo Habblaud
  const presenceValues = Object.values(presenceMap) as AgentLivePresence[];
  const workingCount =
    presenceValues.filter(p => p.state === 'working').length + (isExecuting ? 1 : 0);
  const needYouCount =
    presenceValues.filter(p => p.state === 'needs_attention').length ||
    logs.filter(l => l.boardColumn === 'handed_over' && !l.taskCompleted).length;
  const subagentsCount = agents.reduce((acc, a) => acc + (a.enabledTools?.length || 0), 0);

  // Dividir as Salas de Trabalho em Pares (Coluna Superior / Coluna Inferior) ao longo do corredor!
  // Assim, toda sala adicional expande o prédio automaticamente!
  const roomColumns = useMemo(() => {
    const cols: Array<{ topRoom?: AIAgentRoom; bottomRoom?: AIAgentRoom }> = [];
    for (let i = 0; i < rooms.length; i += 2) {
      cols.push({
        topRoom: rooms[i],
        bottomRoom: rooms[i + 1]
      });
    }
    if (cols.length === 0) {
      cols.push({});
    }
    return cols;
  }, [rooms]);

  // Enviar tarefa rápida a um agente: ele volta imediatamente da Copa/Lounge/Banheiro para a mesa dele!
  const handleDispatchQuickTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTaskAgent || !quickTaskMessage.trim()) return;
    const targetId = quickTaskAgent.id;
    const msg = quickTaskMessage.trim();
    const ld = quickTaskLeadId || undefined;
    setQuickTaskAgent(null);
    setQuickTaskMessage('');

    // Força o personagem a ir para a mesa na sala dele trabalhando
    setPresenceMap(prev => ({
      ...prev,
      [targetId]: {
        agentId: targetId,
        state: 'working',
        zone: 'desk',
        activityLabel: '🛠️ Analisando objetivo & CRM...',
        idleMinutes: 0
      }
    }));

    await onQuickExecuteAgent(targetId, msg, ld);
  };

  // Renderizador de uma Sala de Trabalho de Agentes (suporta 1 ou múltiplos profissionais juntos na mesma sala!)
  const renderAgentWorkRoom = (room: AIAgentRoom, position: 'top' | 'bottom') => {
    const roomAgents = agents
      .map((agent, globalIndex) => ({ agent, globalIndex }))
      .filter(item => (agentRoomMap[item.agent.id] || rooms[0]?.id) === room.id);

    const colorStyle = ROOM_COLOR_STYLES[room.color || 'sky'] || ROOM_COLOR_STYLES.sky;
    const hasSelectedAgent = roomAgents.some(a => a.agent.id === selectedAgentId);

    // Filtra os agentes desta sala que estão atualmente na própria mesa ('desk')
    const agentsAtDesk = roomAgents.filter(({ agent }) => {
      const pres = presenceMap[agent.id];
      return !pres || pres.zone === 'desk' || pres.state === 'working' || pres.state === 'needs_attention';
    });

    return (
      <div
        key={room.id}
        onClick={() => {
          if (roomAgents[0]) onSelectAgent(roomAgents[0].agent.id);
        }}
        className={`w-64 h-44 bg-[#d8dee9] border-4 relative p-2.5 flex flex-col justify-between cursor-pointer transition ${
          hasSelectedAgent ? 'border-amber-400' : 'border-[#4c566a]'
        }`}
      >
        {/* Porta conectando ao corredor central */}
        {position === 'top' ? (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-[#d8dee9]" />
        ) : (
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-[#d8dee9]" />
        )}

        {/* Placa Flutuante da Sala (com a cor e contador de profissionais na sala) */}
        <div
          className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-[#161b24] ${colorStyle.pillBorder} border border-slate-700 px-2.5 py-0.5 rounded text-[10px] font-bold text-white shadow-lg flex items-center gap-1.5 whitespace-nowrap z-20`}
        >
          <span>{room.slug}</span>
          <span className={`w-2 h-2 rounded-full ${colorStyle.dot}`} />
          <span className="text-slate-300">{roomAgents.length}</span>
        </div>

        {/* Topo da Sala: Estante, Quadro da Sala e Decoração */}
        <div className="flex items-start justify-between mt-1">
          <div className="w-9 h-6 bg-[#a1887f] border-2 border-[#5d4037] flex items-center justify-center text-[10px]">
            📚
          </div>
          <div className="px-2 h-5 bg-white border-2 border-slate-400 text-[8px] text-slate-700 font-bold flex items-center justify-center truncate max-w-[125px]">
            {room.name.toUpperCase()}
          </div>
          <span className="text-xs">🪴</span>
        </div>

        {/* Tapete Roxo com Estações de Trabalho para os Profissionais da Sala */}
        <div className="bg-[#5e4b8b] border-2 border-[#3b2e5a] rounded p-2 flex items-center justify-around relative my-auto min-h-[78px]">
          {roomAgents.length === 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowRoomModal(true);
              }}
              className="text-[9px] text-indigo-200 hover:text-white font-bold border border-dashed border-indigo-300/50 rounded px-2 py-1 cursor-pointer"
            >
              + Alocar Agentes nesta Sala
            </button>
          ) : (
            roomAgents.map(({ agent, globalIndex }) => {
              const pres = presenceMap[agent.id];
              const isAtDesk =
                !pres || pres.zone === 'desk' || pres.state === 'working' || pres.state === 'needs_attention';
              const shortName = agent.name.split('—')[0].trim();

              return (
                <div key={agent.id} className="flex flex-col items-center relative">
                  {/* Mesa com Monitores Duplos */}
                  <div className="w-16 h-6 bg-[#bcaaa4] border-2 border-[#6d4c41] rounded-xs flex items-center justify-around px-1">
                    <span
                      className={`w-4 h-3 border border-slate-700 block ${
                        isAtDesk && pres?.state === 'working' ? 'bg-emerald-300 animate-pulse' : 'bg-sky-300'
                      }`}
                    />
                    <span
                      className={`w-4 h-3 border border-slate-700 block ${
                        isAtDesk && pres?.state === 'working' ? 'bg-emerald-300 animate-pulse' : 'bg-sky-300'
                      }`}
                    />
                  </div>

                  {/* Se o personagem estiver na mesa, mostra ele sentado trabalhando; se saiu p/ Copa/Lounge/Banheiro, mostra a cadeira vazia e onde ele está! */}
                  {isAtDesk ? (
                    <div className="-mt-1.5 z-10">
                      <PixelAvatar
                        skinIndex={globalIndex}
                        size={30}
                        isWorking={pres?.state === 'working'}
                        needsAttention={pres?.state === 'needs_attention'}
                        bubbleText={pres?.state === 'working' || pres?.state === 'needs_attention' ? pres.activityLabel : undefined}
                        nameTag={shortName}
                        statusColor={
                          pres?.state === 'needs_attention'
                            ? 'amber'
                            : pres?.state === 'working'
                            ? 'emerald'
                            : 'slate'
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectAgent(agent.id);
                          setQuickTaskAgent(agent);
                        }}
                      />
                    </div>
                  ) : (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setQuickTaskAgent(agent);
                      }}
                      className="flex flex-col items-center mt-1 opacity-75 hover:opacity-100"
                      title={`${shortName} está ${ZONE_LABELS[pres.zone]} (${pres.activityLabel})`}
                    >
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-700 border border-slate-900" />
                      <span className="mt-1 text-[8px] text-amber-200 bg-slate-900/90 px-1.5 py-0.2 rounded border border-slate-700 whitespace-nowrap">
                        {shortName}: {ZONE_LABELS[pres.zone]}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé da Sala */}
        <div className="flex items-center justify-between text-[9px] text-slate-600 font-bold">
          <span>👥 {roomAgents.length} prof.</span>
          <span>{agentsAtDesk.length} na bancada</span>
        </div>
      </div>
    );
  };

  const trees = [
    { x: 4, y: 12, v: 'pine' as const },
    { x: 10, y: 28, v: 'round' as const },
    { x: 6, y: 52, v: 'round' as const },
    { x: 12, y: 70, v: 'pine' as const },
    { x: 92, y: 14, v: 'pine' as const },
    { x: 95, y: 36, v: 'round' as const },
    { x: 91, y: 60, v: 'pine' as const },
    { x: 96, y: 75, v: 'round' as const }
  ];

  const totalBuildingRooms = 4 + rooms.length; // Recepção + Copa + Banheiros + Lounge + Salas criadas

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-[#141820] text-slate-100 select-none flex flex-col h-[780px] relative font-mono">
      {/* ==================================================================== */}
      {/* TOP BAR COM O NOME DA EMPRESA LOGADA + CONTADORES + AÇÕES HABBLAUD   */}
      {/* ==================================================================== */}
      <div className="h-14 bg-[#181c24] border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between gap-3 shrink-0 z-30">
        {/* Esquerda: Nome da Empresa Logada + Conectado + Contadores */}
        <div className="flex items-center gap-3 overflow-x-auto">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-lg shrink-0">
              🏢
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base tracking-wide text-amber-300 drop-shadow truncate max-w-[200px]">
                  {currentCompany.name}
                </span>
                <span className="text-[10px] text-slate-500">v1.0.3</span>
              </div>
              <div className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/40 px-1.5 py-0.2 rounded text-[9px] text-emerald-400 font-bold w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Conectado
              </div>
            </div>
          </div>

          {/* Box de Contadores igual ao Habblaud */}
          <div className="flex items-center gap-3.5 bg-[#1f2430] border border-slate-700/80 rounded-xl px-3.5 py-1.5 text-xs shrink-0">
            <div className="leading-tight cursor-pointer" onClick={() => setShowRoomModal(true)} title="Clique para gerenciar salas">
              <span className="font-black text-white text-sm block">{totalBuildingRooms}</span>
              <span className="text-[10px] text-slate-400">salas</span>
            </div>
            <div className="leading-tight">
              <span className="font-black text-white text-sm block">{agents.length}</span>
              <span className="text-[10px] text-slate-400">agentes</span>
            </div>
            <div className="leading-tight">
              <span className="font-black text-emerald-400 text-sm block">{workingCount}</span>
              <span className="text-[10px] text-slate-400">trabalhando</span>
            </div>
            <div className="leading-tight">
              <span className="font-black text-purple-400 text-sm block">{subagentsCount}</span>
              <span className="text-[10px] text-slate-400">subagentes</span>
            </div>
            <div className="leading-tight">
              <span className={`font-black text-sm block ${needYouCount > 0 ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`}>
                {needYouCount}
              </span>
              <span className="text-[10px] text-slate-400">precisam de você</span>
            </div>
          </div>
        </div>

        {/* Direita: Conta + Controle de Rotina Social + Salas + Zoom */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          {/* Card Conta da Empresa com barra 5h e Semana (detalhe Habblaud.com) */}
          <div className="flex items-center gap-2.5 bg-[#1f2430] border border-slate-700/80 rounded-xl px-3 py-1">
            <div className="w-7 h-7 rounded-lg bg-orange-500 text-slate-950 font-black text-sm flex items-center justify-center">
              {currentCompany.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-[9px] leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white truncate max-w-[110px]">{currentCompany.name}</span>
                <span className="text-amber-400">⏱️ ativo</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-slate-400">5h</span>
                <div className="w-12 h-1.5 bg-slate-800 rounded overflow-hidden">
                  <div className="w-1/4 bg-sky-400 h-full" />
                </div>
                <span className="text-slate-400">Semana</span>
                <div className="w-12 h-1.5 bg-slate-800 rounded overflow-hidden">
                  <div className="w-1/3 bg-emerald-400 h-full" />
                </div>
                <span className="text-slate-300 font-bold">13%</span>
              </div>
            </div>
          </div>

          {/* Controles de Movimentação dos Personagens (Chamar p/ Mesa vs Passear Ociosos) */}
          <div className="flex items-center gap-1 bg-[#1f2430] border border-slate-700/80 rounded-xl p-1">
            <button
              type="button"
              onClick={handleCallAllToDesks}
              className="px-2 py-1 rounded-lg hover:bg-slate-700 text-[10px] font-bold text-emerald-300 flex items-center gap-1 cursor-pointer"
              title="Chamar todos os agentes para trabalhar em suas salas"
            >
              <Bell className="w-3 h-3" />
              Nas Salas
            </button>
            <button
              type="button"
              onClick={handleSendIdleToSocialAreas}
              className="px-2 py-1 rounded-lg hover:bg-slate-700 text-[10px] font-bold text-amber-300 flex items-center gap-1 cursor-pointer"
              title="Permitir que agentes ociosos caminhem para Copa, Lounge, Recepção e Banheiro"
            >
              <Coffee className="w-3 h-3" />
              Pausa / Passear
            </button>
          </div>

          {/* Controles de Zoom + Ícones Habblaud */}
          <div className="flex items-center gap-1 bg-[#1f2430] border border-slate-700/80 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setZoom(0.95)}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
              title="Centralizar Mapa"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.65, +(z - 0.1).toFixed(2)))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(1.3, +(z + 0.1).toFixed(2)))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 cursor-pointer"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowStatsModal(true)}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-indigo-300 cursor-pointer"
              title="Estatísticas & Meu Dia (Habblaud Stats)"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Botão Criar / Juntar em Salas */}
          <button
            type="button"
            onClick={() => setShowRoomModal(true)}
            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            + Sala / Equipe
          </button>

          {/* Botão Novo Agente */}
          <button
            type="button"
            onClick={onOpenMagicCreator}
            className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Agente
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CORPO PRINCIPAL: SIDEBAR "ESCRITÓRIO" + MAPA PIXEL ART EXPANSÍVEL    */}
      {/* ==================================================================== */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* SIDEBAR ESQUERDA: "Escritório" agrupado por SALAS (com os profissionais juntos dentro de cada sala!) */}
        <div className="w-64 sm:w-76 bg-[#161922]/95 border-r border-slate-800 p-3 flex flex-col gap-3 z-20 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-slate-200 tracking-wide">Escritório</h2>
            <button
              type="button"
              onClick={() => setShowRoomModal(true)}
              className="text-[10px] font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              + Criar Sala / Juntar
            </button>
          </div>

          {/* Busca igual ao Habblaud */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar agente, sala ou conta"
              className="w-full bg-[#1e222d] border border-slate-700/80 rounded-lg pl-8 pr-6 py-1.5 text-[11px] text-slate-200 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 border border-slate-700 px-1 rounded">
              /
            </span>
          </div>

          {/* Lista de Salas e Profissionais dentro de cada Sala */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {filteredRoomsWithAgents.map(({ room, agents: roomAgents }) => {
              const colorStyle = ROOM_COLOR_STYLES[room.color || 'sky'] || ROOM_COLOR_STYLES.sky;

              return (
                <div
                  key={room.id}
                  className={`bg-[#1e2330] rounded-xl p-3 border border-slate-700/80 space-y-2.5 ${colorStyle.borderTop}`}
                >
                  {/* Cabeçalho da Sala */}
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="text-[11px] font-bold text-white truncate">{room.slug}</span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-slate-700 text-slate-200 rounded font-bold">
                          {roomAgents.length}
                        </span>
                      </div>
                      <span className="w-4 h-4 rounded bg-orange-500 text-slate-950 font-black text-[10px] flex items-center justify-center shrink-0">
                        {currentCompany.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">
                      ~/{currentCompany.name.replace(/\s+/g, '')}/{room.name}
                    </p>
                  </div>

                  {/* Profissionais agrupados dentro desta Sala */}
                  {roomAgents.length === 0 ? (
                    <div className="text-[10px] text-slate-500 py-2 text-center border border-dashed border-slate-700 rounded-lg">
                      Sala vazia •{' '}
                      <button
                        type="button"
                        onClick={() => setShowRoomModal(true)}
                        className="text-amber-400 underline cursor-pointer"
                      >
                        Juntar profissional
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 divide-y divide-slate-800/80">
                      {roomAgents.map((agent) => {
                        const globalIdx = Math.max(0, agents.findIndex(a => a.id === agent.id));
                        const pres = presenceMap[agent.id];
                        const lastLog = logs.find(l => l.agentId === agent.id);
                        const shortName = agent.name.split('—')[0].trim();

                        return (
                          <div
                            key={agent.id}
                            onClick={() => onSelectAgent(agent.id)}
                            className="pt-2 first:pt-0 space-y-1.5 cursor-pointer group"
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="w-9 h-9 rounded-lg bg-[#141820] border border-slate-700 flex items-center justify-center shrink-0">
                                <PixelAvatar
                                  skinIndex={globalIdx}
                                  size={28}
                                  isWorking={pres?.state === 'working'}
                                  needsAttention={pres?.state === 'needs_attention'}
                                />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1 min-w-0">
                                    <span className="text-xs font-bold text-white group-hover:text-amber-300 truncate">
                                      {shortName}
                                    </span>
                                    <span className="w-3.5 h-3.5 rounded bg-orange-500/90 text-slate-950 font-black text-[9px] flex items-center justify-center shrink-0">
                                      A
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-slate-400 shrink-0">
                                    {pres?.state === 'working'
                                      ? 'trabalhando'
                                      : `ocioso ${pres?.idleMinutes || 2}m (${ZONE_LABELS[pres?.zone || 'desk']})`}
                                  </span>
                                </div>

                                <p className="text-[10px] text-slate-300 truncate mt-0.5">
                                  {lastLog?.taskTitle || agent.goal}
                                </p>

                                {/* Linha de status */}
                                <div className="mt-1">
                                  {pres?.state === 'working' ? (
                                    <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1 animate-pulse">
                                      {pres.activityLabel}
                                    </span>
                                  ) : pres?.state === 'needs_attention' ? (
                                    <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1 animate-pulse">
                                      ✋ Precisa de você no atendimento!
                                    </span>
                                  ) : (
                                    <div className="flex items-center justify-between text-[10px]">
                                      <span className="text-emerald-400 font-bold">
                                        ✅ Concluiu em {lastLog?.durationMs ? `${(lastLog.durationMs / 1000).toFixed(0)}s` : '1min 20s'}
                                      </span>
                                      <span className="text-slate-400 text-[9px]">{pres?.activityLabel}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Ações rápidas do Agente (Dar Tarefa, Mudar de Sala, Regras) */}
                            <div className="flex items-center gap-1 pt-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQuickTaskAgent(agent);
                                }}
                                className="flex-1 py-1 px-2 rounded bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer"
                              >
                                <Terminal className="w-2.5 h-2.5" />
                                Dar Tarefa
                              </button>
                              <select
                                value={room.id}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => handleAssignAgentToRoom(agent.id, e.target.value)}
                                title="Mover profissional para outra sala"
                                className="bg-slate-800 text-slate-300 border border-slate-700 rounded py-1 px-1.5 text-[9px] font-bold max-w-[88px] truncate cursor-pointer"
                              >
                                {rooms.map(r => (
                                  <option key={r.id} value={r.id}>📍 {r.name}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenAgentConfig(agent.id);
                                }}
                                className="py-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[9px] font-bold cursor-pointer"
                              >
                                Regras
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ================================================================== */}
        {/* MAPA CENTRAL 2D PIXEL ART DO ESCRITÓRIO (COM SALAS DINÂMICAS!)     */}
        {/* ================================================================== */}
        <div
          className="flex-1 relative overflow-auto flex items-center justify-start xl:justify-center"
          style={{
            backgroundColor: '#5c8a47',
            backgroundImage: `
              radial-gradient(#4e783b 15%, transparent 16%),
              radial-gradient(#699b52 15%, transparent 16%)
            `,
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        >
          {trees.map((t, i) => (
            <PixelTree key={i} x={t.x} y={t.y} variant={t.v} />
          ))}

          {/* Container com Zoom do Prédio + Calçada + Rua */}
          <div
            className="relative transition-transform duration-200 flex flex-col items-center py-8 px-10"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            {/* PLANTA DO ESCRITÓRIO QUE CRESCE AUTOMATICAMENTE CONFORME NOVAS SALAS SÃO CRIADAS */}
            <div className="bg-[#4a5568] p-2.5 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.65)] border-4 border-[#2d3748] relative">
              {/* LINHA SUPERIOR DO PRÉDIO: RECEPÇÃO + COPA + SALAS DE TRABALHO ÍMPARES */}
              <div className="flex items-center gap-2">
                {/* SALA FIXA 1: RECEPÇÃO (COM O NOME DA EMPRESA LOGADA NO QUADRO!) */}
                <div className="w-60 h-44 bg-[#d8dee9] border-4 border-[#4c566a] relative p-2 flex flex-col justify-between shrink-0">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1e2430] border border-slate-600 px-3 py-0.5 rounded-full text-[10px] font-bold text-slate-200 shadow">
                    Recepção
                  </div>

                  {/* Letreiro da Empresa Logada na parede da Recepção */}
                  <div className="mx-auto bg-[#1e293b] border-2 border-amber-400/80 px-2.5 py-0.5 rounded text-[9px] font-black text-amber-300 tracking-wider uppercase truncate max-w-[200px] shadow">
                    ✨ {currentCompany.name}
                  </div>

                  {/* Tapete e Balcão da Recepção */}
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-10 bg-[#5e4b8b] border-2 border-[#3b2e5a] rounded-xs flex items-center justify-around px-1">
                      <span className="text-[10px] text-amber-300">★</span>
                      <span className="text-[10px] text-amber-300">★</span>
                    </div>
                    <div className="w-20 h-8 bg-[#e5e9f0] border-2 border-[#8892b0] rounded-xs flex items-center justify-center text-[9px] font-bold text-slate-700 shadow-inner">
                      🖥️ Balcão
                    </div>
                  </div>

                  {/* Personagens Ociosos passeando na Recepção! */}
                  <div className="flex items-center justify-between min-h-[42px]">
                    <span className="text-base">🪴</span>
                    <div className="flex items-center gap-2">
                      {getAgentsInSocialZone('recepcao').map(({ agent, skinIndex, presence }) => (
                        <PixelAvatar
                          key={agent.id}
                          skinIndex={skinIndex}
                          size={28}
                          bubbleText={presence.activityLabel}
                          nameTag={agent.name.split('—')[0].trim()}
                          statusColor="slate"
                          onClick={() => setQuickTaskAgent(agent)}
                        />
                      ))}
                    </div>
                    <div className="w-16 h-8 bg-[#5e4b8b] border-2 border-[#3b2e5a] rounded-xs p-1 flex items-center justify-center">
                      <div className="w-12 h-4 bg-[#8d6e63] border border-[#4e342e]" />
                    </div>
                  </div>

                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-[#d8dee9]" />
                </div>

                {/* SALA FIXA 2: COPA / CAFÉ (COM PERSONAGENS OCIOSOS TOMANDO CAFÉ / PIPOCA!) */}
                <div className="w-60 h-44 bg-[#eceff4] border-4 border-[#4c566a] relative p-2 flex flex-col justify-between shrink-0">
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1e2430] border border-slate-600 px-3 py-0.5 rounded-full text-[10px] font-bold text-slate-200 shadow">
                    Copa
                  </div>

                  <div className="w-full h-7 bg-[#bcaaa4] border-2 border-[#6d4c41] rounded-xs flex items-center justify-between px-2 text-xs mt-1">
                    <span>☕</span>
                    <span>🚰</span>
                    <span>🍿</span>
                    <span>🧊</span>
                  </div>

                  {/* Mesa da Copa + Personagens Ociosos na Copa */}
                  <div className="mx-auto my-auto bg-[#5e4b8b] p-1.5 rounded border border-[#3b2e5a] relative flex items-center gap-2">
                    <div>
                      <div className="flex justify-around mb-0.5">
                        <span className="w-3 h-1.5 bg-amber-400 border border-amber-700 block" />
                        <span className="w-3 h-1.5 bg-amber-400 border border-amber-700 block" />
                        <span className="w-3 h-1.5 bg-amber-400 border border-amber-700 block" />
                      </div>
                      <div className="w-24 h-6 bg-[#f5f5f5] border-2 border-slate-400 flex items-center justify-around text-[10px]">
                        <span>☕</span>
                        <span>🥐</span>
                      </div>
                      <div className="flex justify-around mt-0.5">
                        <span className="w-3 h-1.5 bg-amber-400 border border-amber-700 block" />
                        <span className="w-3 h-1.5 bg-amber-400 border border-amber-700 block" />
                        <span className="w-3 h-1.5 bg-amber-400 border border-amber-700 block" />
                      </div>
                    </div>

                    {/* Personagens Ociosos na Copa */}
                    {getAgentsInSocialZone('copa').map(({ agent, skinIndex, presence }) => (
                      <PixelAvatar
                        key={agent.id}
                        skinIndex={skinIndex}
                        size={28}
                        bubbleText={presence.activityLabel}
                        nameTag={agent.name.split('—')[0].trim()}
                        statusColor="slate"
                        onClick={() => setQuickTaskAgent(agent)}
                      />
                    ))}
                  </div>

                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-[#eceff4]" />
                </div>

                {/* SALAS DE TRABALHO SUPERIORES (CADA COLUNA DE SALA ADICIONAL APARECE AQUI!) */}
                {roomColumns.map((col, idx) =>
                  col.topRoom ? (
                    <div key={col.topRoom.id} className="shrink-0">
                      {renderAgentWorkRoom(col.topRoom, 'top')}
                    </div>
                  ) : (
                    <div key={`empty-top-${idx}`} className="w-64 h-44 shrink-0" />
                  )
                )}
              </div>

              {/* CORREDOR CENTRAL COM PASSADEIRAS ROXAS QUE ACOMPANHAM TODAS AS SALAS */}
              <div className="h-14 bg-[#cfd8dc] my-1.5 border-y-2 border-[#90a4ae] flex items-center justify-around px-6 relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-10 bg-[#8d6e63] border-r-2 border-[#4e342e]" />
                {Array.from({ length: 2 + roomColumns.length }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-40 h-5 bg-[#5e4b8b] border-2 border-amber-400/80 flex items-center justify-around px-3 shadow-inner"
                  >
                    <span className="text-[9px] text-amber-300">★</span>
                    <span className="text-[9px] text-amber-300">★</span>
                    <span className="text-[9px] text-amber-300">★</span>
                  </div>
                ))}
              </div>

              {/* LINHA INFERIOR DO PRÉDIO: BANHEIROS + LOUNGE + SALAS DE TRABALHO PARES */}
              <div className="flex items-center gap-2">
                {/* SALA FIXA 3: BANHEIROS (COM PERSONAGENS OCIOSOS NO BANHEIRO!) */}
                <div
                  className="w-60 h-44 bg-[#e3f2fd] border-4 border-[#4c566a] relative p-2 flex flex-col justify-between shrink-0"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #bbdefb 1px, transparent 1px), linear-gradient(to bottom, #bbdefb 1px, transparent 1px)',
                    backgroundSize: '12px 12px'
                  }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-[#e3f2fd]" />
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1e2430] border border-slate-600 px-3 py-0.5 rounded-full text-[10px] font-bold text-slate-200 shadow">
                    Banheiros
                  </div>

                  <div className="flex justify-end gap-1 mt-3">
                    <div className="w-9 h-11 bg-white border-2 border-slate-400 flex items-center justify-center text-xs">🚽</div>
                    <div className="w-9 h-11 bg-white border-2 border-slate-400 flex items-center justify-center text-xs">🚽</div>
                    <div className="w-9 h-11 bg-white border-2 border-slate-400 flex items-center justify-center text-xs">🚽</div>
                  </div>

                  {/* Personagens Ociosos que foram ao Banheiro */}
                  <div className="flex items-end justify-between min-h-[42px]">
                    <div className="w-14 h-5 bg-[#8d6e63] border-2 border-[#4e342e] rounded-xs" />
                    <div className="flex items-center gap-2">
                      {getAgentsInSocialZone('banheiros').map(({ agent, skinIndex, presence }) => (
                        <PixelAvatar
                          key={agent.id}
                          skinIndex={skinIndex}
                          size={28}
                          bubbleText={presence.activityLabel}
                          nameTag={agent.name.split('—')[0].trim()}
                          statusColor="slate"
                          onClick={() => setQuickTaskAgent(agent)}
                        />
                      ))}
                    </div>
                    <span className="text-base">🪴</span>
                  </div>
                </div>

                {/* SALA FIXA 4: LOUNGE (COM TV, PING-PONG E PERSONAGENS OCIOSOS JOGANDO / DESCANSANDO!) */}
                <div className="w-60 h-44 bg-[#d7ccc8] border-4 border-[#4c566a] relative p-2.5 flex flex-col justify-between shrink-0">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-10 h-2 bg-[#d7ccc8]" />
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#1e2430] border border-slate-600 px-3 py-0.5 rounded-full text-[10px] font-bold text-slate-200 shadow">
                    Lounge
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="w-14 h-6 bg-slate-900 border-2 border-slate-600 text-[8px] text-emerald-400 flex items-center justify-center font-bold">
                      TV ⚽🎮
                    </div>
                    <span className="text-sm">👻</span>
                    <div className="w-10 h-6 bg-[#8d6e63] border-2 border-[#4e342e] flex items-center justify-center text-xs">
                      📚
                    </div>
                  </div>

                  {/* Sofá + Ping-Pong + Personagens Ociosos no Lounge */}
                  <div className="flex items-center justify-between gap-2 my-auto">
                    <div className="w-20 h-14 bg-[#5e4b8b] border-2 border-[#3b2e5a] rounded p-1 flex items-center justify-center">
                      <div className="w-14 h-6 bg-[#3949ab] border border-[#1a237e] rounded-xs" />
                    </div>

                    {/* Personagens Ociosos no Lounge */}
                    <div className="flex items-center gap-1.5 z-10">
                      {getAgentsInSocialZone('lounge').map(({ agent, skinIndex, presence }) => (
                        <PixelAvatar
                          key={agent.id}
                          skinIndex={skinIndex}
                          size={28}
                          bubbleText={presence.activityLabel}
                          nameTag={agent.name.split('—')[0].trim()}
                          statusColor="slate"
                          onClick={() => setQuickTaskAgent(agent)}
                        />
                      ))}
                    </div>

                    {/* Mesa de Ping-Pong Azul */}
                    <div className="w-12 h-16 bg-[#1e88e5] border-2 border-white rounded-xs flex flex-col items-center justify-center relative shadow">
                      <div className="w-full h-0.5 bg-white" />
                      <div className="w-0.5 h-full bg-white/60 absolute" />
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-orange-500 border border-orange-800 block" />
                    <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-800 block" />
                    <span className="w-3 h-3 rounded-full bg-amber-400 border border-amber-700 block" />
                  </div>
                </div>

                {/* SALAS DE TRABALHO INFERIORES + BOTÃO DE ADICIONAR NOVA SALA DIRETO NA PLANTA */}
                {roomColumns.map((col, idx) =>
                  col.bottomRoom ? (
                    <div key={col.bottomRoom.id} className="shrink-0">
                      {renderAgentWorkRoom(col.bottomRoom, 'bottom')}
                    </div>
                  ) : (
                    <div
                      key={`add-room-slot-${idx}`}
                      onClick={() => setShowRoomModal(true)}
                      className="w-64 h-44 bg-[#2d3748]/60 hover:bg-[#2d3748] border-4 border-dashed border-slate-400/60 rounded flex flex-col items-center justify-center gap-2 cursor-pointer transition shrink-0 text-slate-200 p-4 text-center"
                    >
                      <FolderPlus className="w-7 h-7 text-amber-400" />
                      <span className="text-xs font-black text-white">+ Construir Nova Sala</span>
                      <span className="text-[10px] text-slate-300">
                        Crie uma sala para juntar profissionais ou separar equipes
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* CALÇADA E RUA ASFALTADA COM CARRINHO AMARELO */}
            <div className="w-full min-w-[820px] mt-4">
              <div className="h-4 bg-[#b0bec5] border-t-2 border-b-2 border-[#78909c] flex items-center justify-around">
                <span className="w-2 h-3 bg-slate-700 rounded-t" />
                <span className="w-2 h-3 bg-slate-700 rounded-t" />
                <span className="w-2 h-3 bg-slate-700 rounded-t" />
                <span className="w-2 h-3 bg-slate-700 rounded-t" />
              </div>
              <div className="h-14 bg-[#37474f] relative flex items-center overflow-hidden border-b-4 border-[#90a4ae]">
                <div className="w-full border-t-2 border-dashed border-slate-300/80" />
                <div className="absolute left-32 top-2 flex items-center gap-1">
                  <svg width="38" height="20" viewBox="0 0 19 10" style={{ imageRendering: 'pixelated' }}>
                    <rect x="4" y="1" width="10" height="4" fill="#fbc02d" />
                    <rect x="6" y="2" width="3" height="2" fill="#81d4fa" />
                    <rect x="10" y="2" width="3" height="2" fill="#81d4fa" />
                    <rect x="1" y="4" width="17" height="4" fill="#fdd835" />
                    <rect x="3" y="7" width="3" height="3" fill="#212121" />
                    <rect x="13" y="7" width="3" height="3" fill="#212121" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================================ */}
          {/* CONSOLE FLUTUANTE INFERIOR "ATIVIDADE"                           */}
          {/* ================================================================ */}
          <div className="absolute bottom-3 left-4 z-30 w-[440px] sm:w-[560px] max-w-[92%] bg-[#161922]/95 border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
            <div
              onClick={() => setIsConsoleOpen(!isConsoleOpen)}
              className="px-3.5 py-2 bg-[#1d222e] border-b border-slate-800 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">Atividade</span>
                <select
                  value={filterConsoleAgentId}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setFilterConsoleAgentId(e.target.value)}
                  className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-2 py-0.5 text-[10px] font-bold"
                >
                  <option value="ALL">filtrado: todos</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>
                      filtrado: {a.name.split('—')[0].trim()}
                    </option>
                  ))}
                </select>
              </div>
              <button type="button" className="text-slate-400 hover:text-white">
                {isConsoleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>

            {isConsoleOpen && (
              <div className="p-2.5 max-h-44 overflow-y-auto space-y-1.5 text-[11px]">
                {streamLines.map((line) => (
                  <div
                    key={line.id}
                    onClick={() => {
                      const parentLog = logs.find(l => line.id.startsWith(l.id));
                      if (parentLog && onSelectLogCard) onSelectLogCard(parentLog);
                    }}
                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-800/80 transition cursor-pointer"
                  >
                    <span className="text-slate-500 text-[10px] shrink-0">{line.time}</span>
                    <PixelAvatar skinIndex={line.skinIndex} size={16} />
                    <span className="font-bold text-slate-200 shrink-0">{line.agentName}</span>
                    <span className="w-3.5 h-3.5 rounded bg-orange-500 text-slate-950 font-black text-[9px] flex items-center justify-center shrink-0">
                      A
                    </span>
                    <span className="text-slate-500 truncate max-w-[110px] shrink-0">{line.roomSlug}</span>

                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {line.icon === 'tool' && <span className="shrink-0">🛠️</span>}
                      {line.icon === 'thinking' && <span className="shrink-0">💭</span>}
                      {line.icon === 'writing' && <span className="shrink-0">💬</span>}
                      {line.icon === 'done' && <span className="shrink-0">✅</span>}
                      {line.icon === 'alert' && <span className="shrink-0">✋</span>}
                      <span
                        className={`truncate ${
                          line.icon === 'done'
                            ? 'text-emerald-400 font-semibold'
                            : line.icon === 'alert'
                            ? 'text-amber-300 font-semibold'
                            : 'text-slate-300'
                        }`}
                      >
                        {line.text}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: CRIAR SALAS & JUNTAR PROFISSIONAIS NA MESMA SALA              */}
      {/* ==================================================================== */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-[#1b202c] border border-slate-700 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Salas do Escritório & Equipes ({currentCompany.name})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Crie salas novas no mapa 2D e junte quantos profissionais (agentes) quiser na mesma sala.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRoomModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Formulário: Criar Nova Sala */}
            <form onSubmit={handleCreateRoom} className="bg-[#131720] p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                + Construir Nova Sala no Prédio
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nome da Nova Sala / Squad:
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="Ex: Sala Financeiro & Cobrança, Squad Lançamento..."
                    className="w-full bg-[#1b202c] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Cor da Placa:
                  </label>
                  <select
                    value={newRoomColor}
                    onChange={(e) => setNewRoomColor(e.target.value as AIAgentRoom['color'])}
                    className="w-full bg-[#1b202c] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    {Object.entries(ROOM_COLOR_STYLES).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Selecione quais profissionais vão trabalhar juntos nesta sala:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {agents.map((ag, idx) => {
                    const checked = newRoomSelectedAgents.includes(ag.id);
                    return (
                      <label
                        key={ag.id}
                        className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition ${
                          checked
                            ? 'bg-indigo-600/25 border-indigo-400 text-white'
                            : 'bg-[#1b202c] border-slate-800 text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {
                            setNewRoomSelectedAgents(prev =>
                              prev.includes(ag.id) ? prev.filter(x => x !== ag.id) : [...prev, ag.id]
                            );
                          }}
                        />
                        <PixelAvatar skinIndex={idx} size={22} />
                        <span className="font-bold truncate">{ag.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar Sala ao Mapa
                </button>
              </div>
            </form>

            {/* Lista de Salas Existentes e Alocação de Profissionais */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Salas Atuais no Prédio ({rooms.length}) — Mova ou Junte os Profissionais:
              </h4>
              {rooms.map((rm) => {
                const rmAgents = agents.filter(a => (agentRoomMap[a.id] || rooms[0]?.id) === rm.id);
                return (
                  <div
                    key={rm.id}
                    className="p-3.5 rounded-xl bg-[#131720] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${ROOM_COLOR_STYLES[rm.color]?.dot || 'bg-sky-400'}`} />
                        <span className="text-xs font-black text-white">{rm.name}</span>
                        <code className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          {rm.slug}
                        </code>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Profissionais juntos nesta sala:{' '}
                        {rmAgents.length > 0
                          ? rmAgents.map(a => a.name.split('—')[0].trim()).join(', ')
                          : 'Nenhum profissional alocado'}
                      </p>
                    </div>

                    {rooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(rm.id)}
                        className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 text-xs flex items-center gap-1 cursor-pointer shrink-0"
                        title="Remover sala"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remover Sala
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: ESTATÍSTICAS & MEU DIA (DETALHE DO HABBLAUD.COM)              */}
      {/* ==================================================================== */}
      {showStatsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-[#1b202c] border border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-black">Estatísticas & Replay do Dia — {currentCompany.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStatsModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-[#131720] p-3 rounded-xl border border-slate-800">
                <span className="text-xl font-black text-emerald-400">{logs.length}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Sessões Concluídas</p>
              </div>
              <div className="bg-[#131720] p-3 rounded-xl border border-slate-800">
                <span className="text-xl font-black text-sky-400">1.2s</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Tempo Médio IA</p>
              </div>
              <div className="bg-[#131720] p-3 rounded-xl border border-slate-800">
                <span className="text-xl font-black text-purple-400">{subagentsCount}</span>
                <p className="text-[10px] text-slate-400 mt-0.5">Tools Habilitadas</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300">Onde estão os profissionais agora:</h4>
              {agents.map((ag, idx) => {
                const pres = presenceMap[ag.id];
                const rm = rooms.find(r => r.id === agentRoomMap[ag.id]);
                return (
                  <div key={ag.id} className="flex items-center justify-between bg-[#131720] p-2.5 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <PixelAvatar skinIndex={idx} size={22} />
                      <div>
                        <span className="font-bold text-white block">{ag.name}</span>
                        <span className="text-[10px] text-slate-400">Sala vinculada: {rm?.name || 'Geral'}</span>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-slate-800 text-amber-300 text-[10px] font-bold">
                      {ZONE_LABELS[pres?.zone || 'desk']} • {pres?.activityLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* MODAL: TERMINAL DIRETO / ENVIAR TAREFA AO AGENTE                     */}
      {/* ==================================================================== */}
      {quickTaskAgent && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
          <div className="bg-[#1b202c] border border-slate-700 rounded-2xl max-w-lg w-full p-5 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PixelAvatar skinIndex={Math.max(0, agents.findIndex(a => a.id === quickTaskAgent.id))} size={36} isWorking />
                <div>
                  <h3 className="text-sm font-black text-white">
                    Terminal Direto — {quickTaskAgent.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Se o agente estiver na Copa, Lounge ou Banheiro, ele voltará para a sala dele na hora!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickTaskAgent(null)}
                className="text-slate-400 hover:text-white text-sm font-bold px-2 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatchQuickTask} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Lead do CRM (Opcional):
                </label>
                <select
                  value={quickTaskLeadId}
                  onChange={(e) => setQuickTaskLeadId(e.target.value)}
                  className="w-full bg-[#131720] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="">👤 Visitante / Simulação Rápida</option>
                  {leads.slice(0, 25).map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.stage})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mensagem do Cliente ou Instrução para o Agente:
                </label>
                <textarea
                  rows={3}
                  value={quickTaskMessage}
                  onChange={(e) => setQuickTaskMessage(e.target.value)}
                  placeholder="Ex: Olá! Quero saber os preços dos planos e como faço para fechar hoje no PIX..."
                  className="w-full bg-[#131720] border border-slate-700 rounded-xl p-3 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickTaskMessage('Olá! Quais são os produtos e valores disponíveis no catálogo?')}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  🔍 Consultar preços
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTaskMessage('Quero fechar o Plano Pro agora no PIX! Manda o link.')}
                  className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-lg cursor-pointer"
                >
                  ⚡ Fechar venda + Mover CRM
                </button>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setQuickTaskAgent(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Executar no Escritório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
