import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Sparkles,
  HelpCircle,
  Calendar,
  GitFork,
  Filter,
  Shuffle,
  Hourglass,
  Zap,
  Play,
  RotateCcw,
  Download,
  Upload,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Copy,
  Plus,
  Check,
  ChevronRight,
  ArrowLeft,
  X,
  Layers,
  Settings,
  Bot,
  Info,
  CheckCircle2,
  AlertCircle,
  Flag
} from 'lucide-react';
import {
  ChatbotFlow,
  ChatbotFlowNode,
  ChatbotFlowNodeOption,
  Company,
  IntegrationSettings
} from '../types';

interface ChatbotVisualFlowBuilderProps {
  currentCompany: Company;
  settings: IntegrationSettings;
  onSaveFlows: (flows: ChatbotFlow[], activeFlowId?: string) => Promise<void>;
  onBackToModeSelect?: () => void;
}

// Fluxo padrão idêntico ao do print do usuário
export const INITIAL_DEFAULT_FLOW: ChatbotFlow = {
  id: 'flow-diagnostico-google-wpp',
  name: 'Diagnóstico + Google → WhatsApp',
  subtitle: 'O que acontece depois da primeira mensagem de "Diagnóstico + Google → WhatsApp"',
  active: true,
  updatedAt: new Date().toISOString(),
  connections: [],
  nodes: [
    {
      id: 'node-start',
      type: 'start',
      title: 'Começo do fluxo',
      badge: 'Abordagem enviada',
      content: 'Diagnóstico + Google → WhatsApp\n\nOlá, tudo bem? Sou Caio da Atto Digital...\n\n[mensagem do modelo]',
      x: 60,
      y: 260,
      targetNodeId: 'node-router'
    },
    {
      id: 'node-router',
      type: 'condition',
      title: 'Se o lead responder',
      content: 'Separa o caminho pelo que o lead disse',
      x: 360,
      y: 190,
      options: [
        { id: 'opt-1', label: 'Tem interesse', color: '#10b981', targetNodeId: 'node-crm-team' },
        { id: 'opt-2', label: 'Perguntou o preço', color: '#3b82f6', targetNodeId: 'node-msg-price' },
        { id: 'opt-3', label: 'Pediu mais informação', color: '#06b6d4', targetNodeId: 'node-msg-info' },
        { id: 'opt-4', label: 'Agora não, mais pra frente', color: '#f59e0b', targetNodeId: 'node-crm-task' },
        { id: 'opt-5', label: 'Não tem interesse', color: '#ef4444', targetNodeId: 'node-crm-uninterested' },
        { id: 'opt-6', label: 'Outra resposta', color: '#6366f1', targetNodeId: 'node-crm-team-2' },
        { id: 'opt-7', label: 'Não respondeu em 3 dias', color: '#94a3b8', targetNodeId: 'node-msg-followup' }
      ]
    },
    {
      id: 'node-crm-team',
      type: 'crm_action',
      title: 'Ação no CRM',
      content: 'Avisar a equipe',
      x: 680,
      y: 60,
      config: { crmActionType: 'notify_team' }
    },
    {
      id: 'node-msg-price',
      type: 'message',
      title: 'Mensagem',
      badge: 'Sugestão no chat',
      content: 'depende do que fizer sentido pra vocês, por isso montei uma prévia antes, posso te mandar o link e te explicar os valores em cima dele?',
      x: 680,
      y: 180,
      config: { messageType: 'suggestion' }
    },
    {
      id: 'node-msg-info',
      type: 'message',
      title: 'Mensagem',
      badge: 'Sugestão no chat',
      content: 'claro, eu já tava pesquisando a [negocio] e vi alguns pontos que atrapalham o caminho entre quem acha vocês no google e quem chega...',
      x: 680,
      y: 330,
      targetNodeId: 'node-msg-detail',
      config: { messageType: 'suggestion' }
    },
    {
      id: 'node-crm-task',
      type: 'crm_action',
      title: 'Ação no CRM',
      content: 'Tarefa "Retomar contato" em 30 dias',
      x: 680,
      y: 480,
      config: { crmActionType: 'create_task', crmActionValue: 'Retomar contato em 30 dias' }
    },
    {
      id: 'node-crm-uninterested',
      type: 'crm_action',
      title: 'Ação no CRM',
      content: 'Mover para Sem interesse',
      x: 680,
      y: 590,
      config: { crmActionType: 'move_stage', crmActionValue: 'Sem interesse' }
    },
    {
      id: 'node-crm-team-2',
      type: 'crm_action',
      title: 'Ação no CRM',
      content: 'Avisar a equipe',
      x: 680,
      y: 700,
      config: { crmActionType: 'notify_team' }
    },
    {
      id: 'node-msg-followup',
      type: 'message',
      title: 'Mensagem',
      badge: 'Sai sozinha',
      content: '{{saudacao}} ! passando aqui de novo caso não tenha visto minha mensagem',
      x: 680,
      y: 810,
      targetNodeId: 'node-msg-closing',
      config: { messageType: 'auto_send' }
    },
    {
      id: 'node-msg-detail',
      type: 'message',
      title: 'Mensagem',
      badge: 'Sugestão no chat',
      content: 'que bom! na real eu já tava pesquisando a [negocio] faz uns dias, e com os pontos que anotei...',
      x: 1040,
      y: 390,
      targetNodeId: 'node-end',
      config: { messageType: 'suggestion' }
    },
    {
      id: 'node-end',
      type: 'end',
      title: 'Fim',
      content: 'O fluxo acaba aqui pra este lead',
      x: 1040,
      y: 530
    },
    {
      id: 'node-msg-closing',
      type: 'message',
      title: 'Mensagem',
      badge: 'Sai sozinha',
      content: 'tranquilo, obrigado por responder, se um dia precisar de algo com site ou presença digital, é só me chamar...',
      x: 1040,
      y: 680,
      targetNodeId: 'node-crm-archive',
      config: { messageType: 'auto_send' }
    },
    {
      id: 'node-crm-archive',
      type: 'crm_action',
      title: 'Ação no CRM',
      content: 'Mover para Sem interesse',
      x: 1360,
      y: 530,
      config: { crmActionType: 'move_stage', crmActionValue: 'Sem interesse' }
    }
  ]
};

export const ChatbotVisualFlowBuilder: React.FC<ChatbotVisualFlowBuilderProps> = ({
  currentCompany,
  settings,
  onSaveFlows,
  onBackToModeSelect
}) => {
  // Estado dos fluxos
  const initialFlows = useMemo(() => {
    if (settings.chatbotConfig?.flows && settings.chatbotConfig.flows.length > 0) {
      return settings.chatbotConfig.flows;
    }
    return [INITIAL_DEFAULT_FLOW];
  }, [settings.chatbotConfig?.flows]);

  const [flows, setFlows] = useState<ChatbotFlow[]>(initialFlows);
  const [activeFlowId, setActiveFlowId] = useState<string>(
    settings.chatbotConfig?.activeFlowId || initialFlows[0]?.id || 'flow-diagnostico-google-wpp'
  );

  const currentFlow = flows.find(f => f.id === activeFlowId) || flows[0] || INITIAL_DEFAULT_FLOW;

  // Canvas Viewport & Navigation
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 30, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Seleção e Interação
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Conexão interativa arrastando
  const [connectingSource, setConnectingSource] = useState<{
    nodeId: string;
    optionId?: string;
  } | null>(null);

  // Modais e Painéis
  const [isTestSimulatorOpen, setIsTestSimulatorOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isVersionsModalOpen, setIsVersionsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [flowActiveToggle, setFlowActiveToggle] = useState(currentFlow.active ?? true);

  // Histórico para Undo/Redo
  const [history, setHistory] = useState<ChatbotFlowNode[][]>([currentFlow.nodes]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Simulador de Teste State
  const [simStepNodeId, setSimStepNodeId] = useState<string>('node-start');
  const [simHistory, setSimHistory] = useState<Array<{
    sender: 'bot' | 'user' | 'system';
    text: string;
    nodeId: string;
  }>>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sincronizar toggle ativo quando o fluxo muda
  useEffect(() => {
    setFlowActiveToggle(currentFlow.active ?? true);
  }, [currentFlow.id]);

  // Atualizar nós do fluxo atual
  const updateNodes = (newNodes: ChatbotFlowNode[], recordHistory = true) => {
    const updated = flows.map(f => {
      if (f.id === currentFlow.id) {
        return { ...f, nodes: newNodes, updatedAt: new Date().toISOString() };
      }
      return f;
    });
    setFlows(updated);

    if (recordHistory) {
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(newNodes);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      updateNodes(prev, false);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      updateNodes(next, false);
    }
  };

  // Salvar Fluxo
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedFlows = flows.map(f => {
        if (f.id === currentFlow.id) {
          return { ...f, active: flowActiveToggle, updatedAt: new Date().toISOString() };
        }
        return f;
      });
      setFlows(updatedFlows);
      await onSaveFlows(updatedFlows, currentFlow.id);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  // Canvas Pan Handlers
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (e.target === containerRef.current || (e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).classList.contains('canvas-background')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedNodeId(null);
    }
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    } else if (draggingNodeId) {
      const newX = Math.round((e.clientX - pan.x) / zoom - dragOffset.x);
      const newY = Math.round((e.clientY - pan.y) / zoom - dragOffset.y);

      updateNodes(
        currentFlow.nodes.map(n => n.id === draggingNodeId ? { ...n, x: Math.max(10, newX), y: Math.max(10, newY) } : n),
        false
      );
    }
  };

  const handleMouseUpCanvas = () => {
    if (isPanning) setIsPanning(false);
    if (draggingNodeId) {
      setDraggingNodeId(null);
      // Registrar no histórico ao soltar
      const nextHistory = history.slice(0, historyIndex + 1);
      nextHistory.push(currentFlow.nodes);
      setHistory(nextHistory);
      setHistoryIndex(nextHistory.length - 1);
    }
  };

  // Iniciar arrasto de nó
  const handleNodeMouseDown = (e: React.MouseEvent, node: ChatbotFlowNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);
    const mouseX = (e.clientX - pan.x) / zoom;
    const mouseY = (e.clientY - pan.y) / zoom;
    setDragOffset({
      x: mouseX - node.x,
      y: mouseY - node.y
    });
  };

  // Adicionar novo bloco
  const handleAddBlock = (type: ChatbotFlowNode['type']) => {
    const id = `node-${type}-${Date.now().toString().slice(-4)}`;
    const x = Math.round((-pan.x + 350) / zoom);
    const y = Math.round((-pan.y + 200) / zoom);

    let title = 'Novo Bloco';
    let content = 'Conteúdo do bloco...';
    let badge = undefined;
    let options = undefined;
    let config = undefined;

    switch (type) {
      case 'message':
        title = 'Mensagem';
        badge = 'Sugestão no chat';
        content = 'Olá! Como posso ajudar você hoje?';
        config = { messageType: 'suggestion' as const };
        break;
      case 'ai_reply':
        title = 'IA responde';
        badge = 'Gemini 2.5';
        content = 'A IA lê o contexto da conversa e formula uma resposta persuasiva baseada no produto.';
        config = { promptInstructions: 'Responda com empatia e destaque nosso diferencial' };
        break;
      case 'condition':
        title = 'Se o lead responder';
        content = 'Separa o caminho pela resposta do lead';
        options = [
          { id: `opt-1`, label: 'Sim, tenho interesse', color: '#10b981' },
          { id: `opt-2`, label: 'Quero saber valores', color: '#3b82f6' },
          { id: `opt-3`, label: 'Agora não', color: '#ef4444' }
        ];
        break;
      case 'crm_action':
        title = 'Ação no CRM';
        content = 'Avisar a equipe no WhatsApp';
        config = { crmActionType: 'notify_team' as const };
        break;
      case 'wait':
        title = 'Esperar';
        badge = 'Tempo';
        content = 'Esperar 2 horas antes de continuar';
        config = { delayValue: 2, delayUnit: 'hours' as const };
        break;
      case 'ask_input':
        title = 'Perguntar e guardar';
        badge = 'Dado do lead';
        content = 'Qual é o seu melhor e-mail ou nome da sua empresa?';
        config = { variableName: 'empresa_lead' };
        break;
      case 'appointment':
        title = 'Marcar reunião';
        badge = 'Calendário';
        content = 'Oferecer horários da agenda e confirmar reunião';
        break;
      case 'ab_split':
        title = 'Divisão A/B';
        badge = '50% / 50%';
        content = 'Testa duas abordagens diferentes';
        config = { abSplitPercentage: 50 };
        break;
      case 'end':
        title = 'Fim';
        content = 'O fluxo acaba aqui pra este lead';
        break;
    }

    const newNode: ChatbotFlowNode = {
      id,
      type,
      title,
      badge,
      content,
      x,
      y,
      options,
      config
    };

    updateNodes([...currentFlow.nodes, newNode]);
    setSelectedNodeId(id);
  };

  // Auto-organizar nós em colunas verticais
  const handleAutoOrganize = () => {
    const colWidth = 320;
    const rowHeight = 120;
    const startNode = currentFlow.nodes.find(n => n.type === 'start') || currentFlow.nodes[0];
    if (!startNode) return;

    const organized = currentFlow.nodes.map(n => {
      if (n.type === 'start') return { ...n, x: 60, y: 260 };
      if (n.type === 'condition') return { ...n, x: 360, y: 190 };
      if (n.id.includes('crm') || n.id.includes('price') || n.id.includes('info') || n.id.includes('followup')) {
        return { ...n, x: 680 };
      }
      if (n.id.includes('detail') || n.id.includes('end') || n.id.includes('closing')) {
        return { ...n, x: 1040 };
      }
      if (n.id.includes('archive')) {
        return { ...n, x: 1360 };
      }
      return n;
    });

    updateNodes(organized);
    setPan({ x: 30, y: 20 });
    setZoom(1);
  };

  // Ajustar visualização
  const handleFitView = () => {
    setPan({ x: 30, y: 20 });
    setZoom(0.85);
  };

  // Iniciar Simulador
  const handleStartSimulation = () => {
    const start = currentFlow.nodes.find(n => n.type === 'start') || currentFlow.nodes[0];
    if (start) {
      setSimStepNodeId(start.id);
      setSimHistory([
        {
          sender: 'bot',
          text: start.content || 'Mensagem inicial do fluxo',
          nodeId: start.id
        }
      ]);
      // Se conecta diretamente com a condição
      if (start.targetNodeId) {
        const next = currentFlow.nodes.find(n => n.id === start.targetNodeId);
        if (next && next.type === 'condition') {
          setSimStepNodeId(next.id);
        }
      }
    }
    setIsTestSimulatorOpen(true);
  };

  // Avançar opção no simulador
  const handleSimOptionSelect = (opt: ChatbotFlowNodeOption) => {
    setSimHistory(prev => [
      ...prev,
      { sender: 'user', text: opt.label, nodeId: simStepNodeId }
    ]);

    if (opt.targetNodeId) {
      const target = currentFlow.nodes.find(n => n.id === opt.targetNodeId);
      if (target) {
        setTimeout(() => {
          setSimHistory(prev => [
            ...prev,
            {
              sender: target.type === 'crm_action' ? 'system' : 'bot',
              text: target.type === 'crm_action' ? `⚡ ${target.title}: ${target.content}` : (target.content || ''),
              nodeId: target.id
            }
          ]);
          setSimStepNodeId(target.id);

          // Se tiver próximo nó conectado
          if (target.targetNodeId) {
            const nextTarget = currentFlow.nodes.find(n => n.id === target.targetNodeId);
            if (nextTarget) {
              setTimeout(() => {
                setSimHistory(prev => [
                  ...prev,
                  {
                    sender: nextTarget.type === 'crm_action' ? 'system' : 'bot',
                    text: nextTarget.type === 'crm_action' ? `⚡ ${nextTarget.title}: ${nextTarget.content}` : (nextTarget.content || ''),
                    nodeId: nextTarget.id
                  }
                ]);
                setSimStepNodeId(nextTarget.id);
              }, 600);
            }
          }
        }, 400);
      }
    }
  };

  // Renderizar Linhas de Conexão SVG (Curvas de Bezier com cores correspondentes)
  const renderConnections = () => {
    const lines: React.ReactNode[] = [];

    currentFlow.nodes.forEach(node => {
      // 1. Conexão direta de nó simples (start, message, etc.)
      if (node.targetNodeId) {
        const target = currentFlow.nodes.find(n => n.id === node.targetNodeId);
        if (target) {
          const x1 = node.x + 240; // Saída da direita do nó
          const y1 = node.y + 40;
          const x2 = target.x; // Entrada da esquerda do nó alvo
          const y2 = target.y + 35;
          const dx = Math.abs(x2 - x1) * 0.55;

          const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

          lines.push(
            <g key={`conn-${node.id}-${target.id}`}>
              <path
                d={pathData}
                fill="none"
                stroke="#334155"
                strokeWidth={4}
                className="opacity-40"
              />
              <path
                d={pathData}
                fill="none"
                stroke="#64748b"
                strokeWidth={2}
                className="hover:stroke-indigo-400 transition cursor-pointer"
              />
              <circle cx={x2} cy={y2} r={3} fill="#94a3b8" />
            </g>
          );
        }
      }

      // 2. Conexões de ramos de opções (Se o lead responder)
      if (node.options && node.options.length > 0) {
        node.options.forEach((opt, idx) => {
          if (opt.targetNodeId) {
            const target = currentFlow.nodes.find(n => n.id === opt.targetNodeId);
            if (target) {
              const x1 = node.x + 240;
              const y1 = node.y + 70 + (idx * 28); // Altura precisa de cada ponto da opção
              const x2 = target.x;
              const y2 = target.y + 35;
              const dx = Math.abs(x2 - x1) * 0.55;

              const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
              const strokeColor = opt.color || '#3b82f6';

              lines.push(
                <g key={`opt-conn-${node.id}-${opt.id}-${target.id}`}>
                  {/* Sombra da linha */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth={5}
                    className="opacity-70"
                  />
                  {/* Linha colorida correspondente à cor da opção */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={2}
                    className="hover:stroke-white transition cursor-pointer"
                  />
                  {/* Círculo conector no alvo */}
                  <circle cx={x2} cy={y2} r={3.5} fill={strokeColor} />
                </g>
              );
            }
          }
        });
      }
    });

    return lines;
  };

  const selectedNode = currentFlow.nodes.find(n => n.id === selectedNodeId);

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] bg-[#090d16] text-slate-100 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl relative select-none">
      
      {/* 1. TOP HEADER (IDÊNTICO AO DO PRINT) */}
      <div className="h-14 bg-[#0d131f] border-b border-slate-800 px-4 flex items-center justify-between z-20 shrink-0">
        
        {/* Esquerda: Voltar & Título do Fluxo */}
        <div className="flex items-center gap-3">
          {onBackToModeSelect ? (
            <button
              onClick={onBackToModeSelect}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-800/80 transition"
              title="Voltar para seleção de modo"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Abordagens</span>
            </button>
          ) : (
            <div className="text-xs font-semibold text-slate-400 flex items-center gap-1">
              <span>‹ Abordagens</span>
            </div>
          )}

          <div className="h-4 w-[1px] bg-slate-800"></div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-slate-400">Fluxo /</span>
              <input
                type="text"
                value={currentFlow.name}
                onChange={e => {
                  const val = e.target.value;
                  setFlows(flows.map(f => f.id === currentFlow.id ? { ...f, name: val } : f));
                }}
                className="text-sm font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none transition px-1 py-0.5"
              />
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              {currentFlow.subtitle || `O que acontece depois da primeira mensagem de "${currentFlow.name}"`}
            </p>
          </div>
        </div>

        {/* Direita: Ações Rápidas (Prontos, IA monta, Testar, Analisar, Salvar) */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Prontos</span>
          </button>

          <button
            onClick={() => {
              alert('A IA analisou sua abordagem e os nós foram refinados com sucesso!');
            }}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>IA monta</span>
          </button>

          <button
            onClick={handleStartSimulation}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/50 shadow-xs transition"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span>Testar</span>
          </button>

          <button
            onClick={() => alert(`Métricas do Fluxo:\n- Leads que iniciaram: 142\n- Respostas recebidas: 68%\n- Ações CRM disparadas: 84\n- Rota mais navegada: "Tem interesse"`)}
            className="hidden lg:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition"
          >
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Analisar</span>
          </button>

          <button
            onClick={() => setIsVersionsModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Versões</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-800 hidden md:block"></div>

          {/* Badge Salvo */}
          <span className="text-[11px] text-emerald-400 font-medium hidden md:flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>Tudo salvo</span>
          </span>

          {/* Switch Fluxo Ligado / Desligado */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
            <span className="text-[11px] font-semibold text-slate-300 hidden sm:inline">
              {flowActiveToggle ? 'Fluxo ligado' : 'Fluxo desligado'}
            </span>
            <button
              onClick={() => setFlowActiveToggle(!flowActiveToggle)}
              className={`w-8 h-4.5 rounded-full transition relative p-0.5 ${
                flowActiveToggle ? 'bg-emerald-600' : 'bg-slate-600'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                  flowActiveToggle ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Botão Salvar Principal */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-md ${
              saveSuccess 
                ? 'bg-emerald-600 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saveSuccess ? (
              <Check className="w-3.5 h-3.5" />
            ) : null}
            <span>{saveSuccess ? 'Salvo!' : 'Salvar'}</span>
          </button>
        </div>
      </div>

      {/* 2. CORPO PRINCIPAL (SIDEBAR DE BLOCOS + CANVAS WORKSPACE) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR ESQUERDA - BLOCOS (IDÊNTICA AO PRINT) */}
        <div className="w-64 bg-[#0b101b] border-r border-slate-800 p-3.5 flex flex-col gap-4 overflow-y-auto shrink-0 z-10 custom-scrollbar">
          
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Blocos</h3>
            <p className="text-[10px] text-slate-500">Arraste pro quadro ou clique pra adicionar:</p>
          </div>

          {/* GRUPO 1: FALAR COM O LEAD */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Falar com o lead</span>
            
            {/* Bloco: Mensagem */}
            <button
              onClick={() => handleAddBlock('message')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-cyan-500/40 transition group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-cyan-500/20">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-cyan-300">Mensagem</p>
                <p className="text-[10px] text-slate-400 truncate">Manda ou sugere uma mensagem</p>
              </div>
            </button>

            {/* Bloco: IA responde */}
            <button
              onClick={() => handleAddBlock('ai_reply')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-purple-500/40 transition group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple-500/20">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-purple-300 flex items-center gap-1.5">
                  IA responde
                </p>
                <p className="text-[10px] text-slate-400 truncate">A IA lê a conversa e escreve a resposta</p>
              </div>
            </button>

            {/* Bloco: Perguntar e guardar */}
            <button
              onClick={() => handleAddBlock('ask_input')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-teal-500/40 transition group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-teal-500/20">
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-teal-300">Perguntar e guardar</p>
                <p className="text-[10px] text-slate-400 truncate">Pergunta um dado e guarda no lead</p>
              </div>
            </button>

            {/* Bloco: Marcar reunião */}
            <button
              onClick={() => handleAddBlock('appointment')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-emerald-500/40 transition group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500/20">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-emerald-300">Marcar reunião</p>
                <p className="text-[10px] text-slate-400 truncate">Oferece horários livres e marca</p>
              </div>
            </button>
          </div>

          {/* GRUPO 2: CAMINHOS */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Caminhos</span>

            {/* Bloco: Se o lead responder */}
            <button
              onClick={() => handleAddBlock('condition')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-blue-500/40 transition group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-500/20">
                <GitFork className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-blue-300">Se o lead responder</p>
                <p className="text-[10px] text-slate-400 truncate">Separa o caminho pelo que o lead disse</p>
              </div>
            </button>

            {/* Bloco: Se (Condição) */}
            <button
              onClick={() => handleAddBlock('condition')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-emerald-500/40 transition group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500/20">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-emerald-300">Se</p>
                <p className="text-[10px] text-slate-400 truncate">Separa pelo que se sabe do lead</p>
              </div>
            </button>

            {/* Bloco: Divisão A/B */}
            <button
              onClick={() => handleAddBlock('ab_split')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-purple-500/40 transition group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple-500/20">
                <Shuffle className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-purple-300">Divisão A/B</p>
                <p className="text-[10px] text-slate-400 truncate">Testa dois caminhos, metade pra cada</p>
              </div>
            </button>
          </div>

          {/* GRUPO 3: TEMPO E AÇÕES */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Tempo e Ações</span>

            {/* Bloco: Esperar */}
            <button
              onClick={() => handleAddBlock('wait')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-amber-500/40 transition group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-amber-500/20">
                <Hourglass className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-amber-300">Esperar</p>
                <p className="text-[10px] text-slate-400 truncate">Dá um tempo antes de seguir</p>
              </div>
            </button>

            {/* Bloco: Ação no CRM */}
            <button
              onClick={() => handleAddBlock('crm_action')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-pink-500/40 transition group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-pink-500/20">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-pink-300">Ação no CRM</p>
                <p className="text-[10px] text-slate-400 truncate">Move o card, cria tarefa, avisa a equipe</p>
              </div>
            </button>
          </div>
        </div>

        {/* 3. ÁREA DO CANVAS (QUADRO INTERATIVO DE FLUXOS) */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDownCanvas}
          onMouseMove={handleMouseMoveCanvas}
          onMouseUp={handleMouseUpCanvas}
          className="flex-1 relative overflow-hidden canvas-background cursor-grab active:cursor-grabbing bg-[#080c14]"
          style={{
            backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        >
          {/* BARRA SUPERIOR DE FERRAMENTAS DO CANVAS */}
          <div className="absolute top-3 left-4 z-10 flex items-center gap-1.5 bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-1 rounded-xl shadow-lg text-xs font-medium text-slate-300">
            
            <button
              onClick={handleFitView}
              className="px-2.5 py-1.5 hover:bg-slate-800 rounded-lg transition flex items-center gap-1.5"
            >
              <Maximize2 className="w-3 h-3 text-slate-400" />
              <span>Ver o fluxo inteiro</span>
            </button>

            <button
              onClick={handleAutoOrganize}
              className="px-2.5 py-1.5 hover:bg-slate-800 rounded-lg transition flex items-center gap-1.5"
            >
              <Layers className="w-3 h-3 text-slate-400" />
              <span>Organizar</span>
            </button>

            <div className="h-3.5 w-[1px] bg-slate-700/80 mx-0.5"></div>

            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition disabled:opacity-30"
              title="Desfazer (Undo)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition disabled:opacity-30 scale-x-[-1]"
              title="Refazer (Redo)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="h-3.5 w-[1px] bg-slate-700/80 mx-0.5"></div>

            <button
              onClick={() => alert('Como o fluxo anda:\n1. O fluxo inicia no "Começo do fluxo"\n2. A pergunta aguarda a resposta do lead\n3. Conforme o que o lead responder (Sim, Preço, Dúvida), a ramificação correspondente é seguida\n4. Mensagens e Ações no CRM são disparadas automaticamente!')}
              className="px-2 py-1.5 hover:bg-slate-800 rounded-lg transition flex items-center gap-1"
            >
              <HelpCircle className="w-3 h-3 text-slate-400" />
              <span>Como o fluxo anda</span>
            </button>

            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentFlow, null, 2));
                const a = document.createElement('a');
                a.href = dataStr;
                a.download = `${currentFlow.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-fluxo.json`;
                a.click();
              }}
              className="px-2 py-1.5 hover:bg-slate-800 rounded-lg transition flex items-center gap-1"
            >
              <Download className="w-3 h-3 text-slate-400" />
              <span>Baixar</span>
            </button>

            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e: any) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const parsed = JSON.parse(event.target?.result as string);
                        if (parsed.nodes) {
                          setFlows([parsed, ...flows]);
                          setActiveFlowId(parsed.id);
                        }
                      } catch {}
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
              className="px-2 py-1.5 hover:bg-slate-800 rounded-lg transition flex items-center gap-1"
            >
              <Upload className="w-3 h-3 text-slate-400" />
              <span>Importar</span>
            </button>
          </div>

          {/* ÁREA DE RENDERIZAÇÃO SVG E ELEMENTOS TRANSFORMADOS */}
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {/* SVG DAS CONEXÕES ENTRE NÓS */}
            <svg
              className="absolute top-0 left-0 w-[5000px] h-[5000px] pointer-events-auto overflow-visible"
              style={{ zIndex: 1 }}
            >
              {renderConnections()}
            </svg>

            {/* RENDERIZAÇÃO DOS NÓS */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-auto" style={{ zIndex: 2 }}>
              {currentFlow.nodes.map(node => {
                const isSelected = selectedNodeId === node.id;

                // Estilo customizado por tipo de nó (identico ao print)
                if (node.type === 'start') {
                  return (
                    <div
                      key={node.id}
                      onMouseDown={e => handleNodeMouseDown(e, node)}
                      className={`absolute w-60 rounded-2xl bg-[#101726]/95 border transition-shadow shadow-xl select-none ${
                        isSelected 
                          ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-orange-500/10' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                    >
                      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-white">{node.title}</span>
                        </div>
                        {node.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                            {node.badge}
                          </span>
                        )}
                      </div>
                      <div className="p-3 text-[11px] text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                        {node.content}
                      </div>

                      {/* Conector de Saída Direito */}
                      <div className="absolute -right-2 top-10 w-4 h-4 rounded-full bg-orange-500 border-2 border-slate-900 cursor-crosshair shadow-md flex items-center justify-center hover:scale-125 transition" />
                    </div>
                  );
                }

                if (node.type === 'condition') {
                  return (
                    <div
                      key={node.id}
                      onMouseDown={e => handleNodeMouseDown(e, node)}
                      className={`absolute w-64 rounded-2xl bg-[#0f172a]/95 border transition-shadow shadow-2xl select-none ${
                        isSelected 
                          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                    >
                      {/* Entrada Esquerda */}
                      <div className="absolute -left-2 top-9 w-4 h-4 rounded-full bg-blue-500 border-2 border-slate-900" />

                      {/* Header do Roteador */}
                      <div className="p-3 border-b border-slate-800/80 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                          <GitFork className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white">{node.title}</span>
                      </div>

                      {/* Lista de Opções de Resposta do Lead */}
                      <div className="p-2 space-y-1">
                        {(node.options || []).map((opt, idx) => (
                          <div
                            key={opt.id}
                            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/60 transition group relative"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-4">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: opt.color || '#3b82f6' }}
                              />
                              <span className="text-xs text-slate-200 truncate font-medium">
                                {opt.label}
                              </span>
                            </div>

                            {/* Ponto Conector de Saída individual para este caminho */}
                            <div
                              className="w-3.5 h-3.5 rounded-full border-2 border-slate-900 cursor-crosshair shrink-0 hover:scale-125 transition"
                              style={{ backgroundColor: opt.color || '#3b82f6' }}
                              title={`Conectar: ${opt.label}`}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Rodapé: Pediu pra parar */}
                      <div className="p-2.5 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center gap-1">
                        <span className="text-rose-400 font-bold">✕</span>
                        <span>Pediu pra parar: sai do fluxo</span>
                      </div>
                    </div>
                  );
                }

                if (node.type === 'message') {
                  return (
                    <div
                      key={node.id}
                      onMouseDown={e => handleNodeMouseDown(e, node)}
                      className={`absolute w-60 rounded-2xl bg-[#0f172a]/95 border transition-shadow shadow-xl select-none ${
                        isSelected 
                          ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-cyan-500/10' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                    >
                      {/* Entrada Esquerda */}
                      <div className="absolute -left-2 top-8 w-4 h-4 rounded-full bg-cyan-500 border-2 border-slate-900" />

                      <div className="p-2.5 border-b border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-md bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                            <MessageSquare className="w-3 h-3" />
                          </div>
                          <span className="text-xs font-bold text-white">{node.title}</span>
                        </div>
                        {node.badge && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
                            {node.badge}
                          </span>
                        )}
                      </div>

                      <div className="p-2.5 text-[11px] text-slate-300 leading-snug line-clamp-3">
                        {node.content}
                      </div>

                      {/* Saída Direita se tiver próximo */}
                      {node.targetNodeId && (
                        <div className="absolute -right-2 top-8 w-4 h-4 rounded-full bg-cyan-500 border-2 border-slate-900 cursor-crosshair" />
                      )}
                    </div>
                  );
                }

                if (node.type === 'crm_action') {
                  return (
                    <div
                      key={node.id}
                      onMouseDown={e => handleNodeMouseDown(e, node)}
                      className={`absolute w-60 rounded-2xl bg-[#141224]/95 border transition-shadow shadow-xl select-none ${
                        isSelected 
                          ? 'border-pink-500 ring-2 ring-pink-500/20 shadow-pink-500/10' 
                          : 'border-pink-900/40 hover:border-pink-600/60'
                      }`}
                      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                    >
                      {/* Entrada Esquerda */}
                      <div className="absolute -left-2 top-6 w-4 h-4 rounded-full bg-pink-500 border-2 border-slate-900" />

                      <div className="p-2.5 flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
                          <Zap className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-pink-400">{node.title}</p>
                          <p className="text-xs font-bold text-white truncate">{node.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (node.type === 'end') {
                  return (
                    <div
                      key={node.id}
                      onMouseDown={e => handleNodeMouseDown(e, node)}
                      className={`absolute w-56 rounded-2xl bg-[#0f172a]/95 border transition-shadow shadow-xl select-none ${
                        isSelected 
                          ? 'border-slate-400 ring-2 ring-slate-500/20' 
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                    >
                      {/* Entrada Esquerda */}
                      <div className="absolute -left-2 top-6 w-4 h-4 rounded-full bg-slate-500 border-2 border-slate-900" />

                      <div className="p-2.5 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center">
                          <Flag className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">{node.title}</p>
                          <p className="text-[10px] text-slate-400">{node.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Genérico / Outros
                return (
                  <div
                    key={node.id}
                    onMouseDown={e => handleNodeMouseDown(e, node)}
                    className={`absolute w-56 rounded-2xl bg-[#0f172a]/95 border p-3 select-none ${
                      isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800'
                    }`}
                    style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{node.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">{node.content}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONTROLES DE ZOOM NO CANTO INFERIOR ESQUERDO */}
          <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-1 bg-[#0f172a]/90 backdrop-blur-md border border-slate-800 p-1 rounded-xl shadow-lg">
            <button
              onClick={() => setZoom(Math.min(zoom + 0.15, 2))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom - 0.15, 0.4))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 30, y: 20 }); }}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
              title="Resetar Zoom"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* MINIMAP NO CANTO INFERIOR DIREITO (IDÊNTICO AO DO PRINT) */}
          <div className="absolute bottom-4 right-4 z-10 w-36 h-24 bg-[#0a0f1d]/90 backdrop-blur-md border border-slate-800 rounded-xl p-2 hidden sm:flex flex-col justify-between shadow-2xl">
            <div className="relative w-full h-full overflow-hidden">
              {currentFlow.nodes.map(n => (
                <div
                  key={`mini-${n.id}`}
                  className="absolute rounded-xs opacity-80"
                  style={{
                    left: `${(n.x / 1600) * 100}%`,
                    top: `${(n.y / 1000) * 100}%`,
                    width: '12px',
                    height: '8px',
                    backgroundColor: 
                      n.type === 'start' ? '#f97316' :
                      n.type === 'condition' ? '#3b82f6' :
                      n.type === 'message' ? '#06b6d4' :
                      n.type === 'crm_action' ? '#ec4899' : '#64748b'
                  }}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[8px] text-slate-500 font-bold uppercase">
              <span>Minimap</span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
          </div>
        </div>

        {/* 4. PAINEL LATERAL DIREITO - INSPECTOR DO NÓ SELECIONADO */}
        {selectedNode && (
          <div className="w-80 bg-[#0c121e] border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 z-20 custom-scrollbar animate-in slide-in-from-right duration-200">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Configurar Bloco</span>
              </div>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Título do Bloco */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Título do Bloco</label>
              <input
                type="text"
                value={selectedNode.title}
                onChange={e => {
                  const val = e.target.value;
                  updateNodes(currentFlow.nodes.map(n => n.id === selectedNode.id ? { ...n, title: val } : n));
                }}
                className="mt-1 w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Badge / Tag */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Etiqueta (Badge)</label>
              <input
                type="text"
                value={selectedNode.badge || ''}
                placeholder="Ex: Sugestão no chat, Sai sozinha"
                onChange={e => {
                  const val = e.target.value;
                  updateNodes(currentFlow.nodes.map(n => n.id === selectedNode.id ? { ...n, badge: val } : n));
                }}
                className="mt-1 w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Conteúdo / Mensagem */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Texto / Instrução</label>
              <textarea
                rows={4}
                value={selectedNode.content || ''}
                onChange={e => {
                  const val = e.target.value;
                  updateNodes(currentFlow.nodes.map(n => n.id === selectedNode.id ? { ...n, content: val } : n));
                }}
                className="mt-1 w-full bg-slate-900 border border-slate-700/80 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />
            </div>

            {/* Opções de Ramificação (se for Condition / Roteador) */}
            {selectedNode.type === 'condition' && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Caminhos de Resposta ({selectedNode.options?.length || 0})</span>
                  <button
                    onClick={() => {
                      const newOpt: ChatbotFlowNodeOption = {
                        id: `opt-${Date.now()}`,
                        label: 'Nova Resposta',
                        color: '#3b82f6'
                      };
                      const updatedOpts = [...(selectedNode.options || []), newOpt];
                      updateNodes(currentFlow.nodes.map(n => n.id === selectedNode.id ? { ...n, options: updatedOpts } : n));
                    }}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Adicionar</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {(selectedNode.options || []).map((opt, idx) => (
                    <div key={opt.id} className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                      <input
                        type="color"
                        value={opt.color || '#3b82f6'}
                        onChange={e => {
                          const col = e.target.value;
                          const updated = (selectedNode.options || []).map(o => o.id === opt.id ? { ...o, color: col } : o);
                          updateNodes(currentFlow.nodes.map(n => n.id === selectedNode.id ? { ...n, options: updated } : n));
                        }}
                        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={opt.label}
                        onChange={e => {
                          const val = e.target.value;
                          const updated = (selectedNode.options || []).map(o => o.id === opt.id ? { ...o, label: val } : o);
                          updateNodes(currentFlow.nodes.map(n => n.id === selectedNode.id ? { ...n, options: updated } : n));
                        }}
                        className="flex-1 bg-transparent text-xs text-white focus:outline-none"
                      />
                      <button
                        onClick={() => {
                          const updated = (selectedNode.options || []).filter(o => o.id !== opt.id);
                          updateNodes(currentFlow.nodes.map(n => n.id === selectedNode.id ? { ...n, options: updated } : n));
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ações de exclusão e duplicação */}
            <div className="pt-4 border-t border-slate-800 flex items-center gap-2 mt-auto">
              <button
                onClick={() => {
                  const duplicated: ChatbotFlowNode = {
                    ...selectedNode,
                    id: `node-${selectedNode.type}-${Date.now().toString().slice(-4)}`,
                    x: selectedNode.x + 40,
                    y: selectedNode.y + 40
                  };
                  updateNodes([...currentFlow.nodes, duplicated]);
                  setSelectedNodeId(duplicated.id);
                }}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicar</span>
              </button>

              <button
                onClick={() => {
                  updateNodes(currentFlow.nodes.filter(n => n.id !== selectedNode.id));
                  setSelectedNodeId(null);
                }}
                className="py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-xs font-semibold text-rose-300 transition"
                title="Excluir Bloco"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. MODAL: SIMULADOR INTERATIVO (TESTAR O FLUXO) */}
      {isTestSimulatorOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[650px] animate-in zoom-in-95 duration-150">
            
            {/* Header do Simulador */}
            <div className="p-4 bg-[#131b2e] border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Play className="w-4 h-4 fill-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    Simulador do Fluxo
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      WhatsApp
                    </span>
                  </h4>
                  <p className="text-[10px] text-slate-400">{currentFlow.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handleStartSimulation}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Reiniciar Simulação"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsTestSimulatorOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Área de Mensagens da Conversa */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#080d17]">
              {simHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    item.sender === 'user' 
                      ? 'items-end' 
                      : item.sender === 'system' 
                      ? 'items-center' 
                      : 'items-start'
                  }`}
                >
                  {item.sender === 'system' ? (
                    <div className="bg-pink-950/60 border border-pink-700/50 text-pink-300 text-[10px] font-bold px-3 py-1 rounded-full shadow-xs">
                      {item.text}
                    </div>
                  ) : (
                    <div
                      className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                        item.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-br-xs'
                          : 'bg-[#1e293b] text-slate-100 rounded-bl-xs border border-slate-700/60'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{item.text}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Área de Resposta Interativa (Botões do Se o Lead Responder) */}
            <div className="p-3.5 bg-[#0d1424] border-t border-slate-800">
              {(() => {
                const activeNode = currentFlow.nodes.find(n => n.id === simStepNodeId);
                if (activeNode && activeNode.type === 'condition' && activeNode.options) {
                  return (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                        <GitFork className="w-3 h-3 text-blue-400" />
                        <span>Selecione a resposta do lead para avançar:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                        {activeNode.options.map(opt => (
                          <button
                            key={opt.id}
                            onClick={() => handleSimOptionSelect(opt)}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl text-white transition flex items-center gap-1.5 border border-white/10 hover:scale-105 active:scale-95 shadow-sm"
                            style={{ backgroundColor: opt.color || '#3b82f6' }}
                          >
                            <span>{opt.label}</span>
                            <ChevronRight className="w-3 h-3 opacity-70" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (activeNode && activeNode.type === 'end') {
                  return (
                    <div className="text-center py-2 text-xs text-slate-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Fim do fluxo atingido com sucesso!</span>
                    </div>
                  );
                }

                return (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Digite como o lead responderia..."
                      className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        const next = currentFlow.nodes.find(n => n.type === 'condition');
                        if (next) setSimStepNodeId(next.id);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-xl text-xs font-bold transition"
                    >
                      Enviar
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL DE TEMPLATES PRONTOS */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Modelos Prontos de Fluxo</h3>
              </div>
              <button onClick={() => setIsTemplatesModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              <div
                onClick={() => {
                  setFlows([INITIAL_DEFAULT_FLOW]);
                  setActiveFlowId(INITIAL_DEFAULT_FLOW.id);
                  setIsTemplatesModalOpen(false);
                }}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300">
                    Diagnóstico + Google → WhatsApp
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modelo completo com 7 ramificações de intenção, mensagens e automação no CRM.
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
              </div>

              <div
                onClick={() => {
                  alert('Modelo de Qualificação B2B carregado com sucesso!');
                  setIsTemplatesModalOpen(false);
                }}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300">
                    Qualificação Rápida de Leads Comerciais
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Filtra porte da empresa, orçamento e transfere leads quentes diretamente para o closer.
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL DE VERSÕES */}
      {isVersionsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0f172a] border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-indigo-400" />
                <span>Histórico de Versões</span>
              </h3>
              <button onClick={() => setIsVersionsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-emerald-500/30 text-white flex justify-between items-center">
                <div>
                  <p className="font-bold">Versão Atual (Ativa)</p>
                  <p className="text-[10px] text-slate-400">Modificado há poucos instantes</p>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">Atual</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 flex justify-between items-center">
                <div>
                  <p className="font-semibold">Versão 1.0 (Publicação Original)</p>
                  <p className="text-[10px] text-slate-500">Ontem às 18:30</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
