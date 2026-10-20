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
  Minimize2,
  Trash2,
  Copy,
  Plus,
  Check,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  X,
  Layers,
  Settings,
  Bot,
  Info,
  CheckCircle2,
  AlertCircle,
  Flag,
  Clock,
  ExternalLink,
  Link2,
  Flame,
  MousePointer
} from 'lucide-react';
import {
  ChatbotFlow,
  ChatbotFlowNode,
  ChatbotFlowNodeOption,
  Company,
  IntegrationSettings,
  FlowTriggerType
} from '../types';

interface ChatbotVisualFlowBuilderProps {
  currentCompany: Company;
  settings: IntegrationSettings;
  onSaveFlows: (flows: ChatbotFlow[], activeFlowId?: string) => Promise<void>;
  onBackToModeSelect?: () => void;
}

// 1. Fluxo padrão 1: Idêntico ao print do usuário
export const DEFAULT_FLOW_DIAGNOSTICO: ChatbotFlow = {
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
      content: 'Diagnóstico + Google → WhatsApp\n\nOlá, tudo bem? Sou Rogério da Muda Digital...\n\n[mensagem do modelo]',
      x: 60,
      y: 260,
      targetNodeId: 'node-router',
      config: {
        triggerConfig: {
          type: 'proactive_time',
          delayAmount: 2,
          delayUnit: 'days',
          proactiveCondition: 'after_last_message'
        }
      }
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
      config: {
        messageType: 'suggestion',
        linkUrl: 'https://mudadigital.com.br/planos',
        linkText: 'Conhecer Planos e Valores 🔗'
      }
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
      config: {
        messageType: 'suggestion',
        linkUrl: 'https://mudadigital.com.br/diagnostico',
        linkText: 'Ver Diagnóstico Completo 🚀'
      }
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

// 2. Fluxo padrão 2: Follow-up Proativo 2 Dias Depois
export const DEFAULT_FLOW_FOLLOWUP: ChatbotFlow = {
  id: 'flow-followup-2-dias',
  name: 'Follow-up Proativo (2 Dias Depois)',
  subtitle: 'Chama o lead sozinho 2 dias após primeiro contato para saber se já decidiu',
  active: false,
  updatedAt: new Date().toISOString(),
  connections: [],
  nodes: [
    {
      id: 'node-start',
      type: 'start',
      title: 'Começo do fluxo',
      badge: 'Proativo 2 Dias',
      content: 'Chamar sozinho o lead 2 dias após a proposta:\n\n"Olá {{nome}}! Tudo bem por aí? Passando para saber se você conseguiu avaliar a proposta que te mandei..."',
      x: 60,
      y: 200,
      targetNodeId: 'node-decision',
      config: {
        triggerConfig: {
          type: 'proactive_time',
          delayAmount: 2,
          delayUnit: 'days',
          proactiveCondition: 'after_last_message'
        }
      }
    },
    {
      id: 'node-decision',
      type: 'condition',
      title: 'Se o lead responder',
      content: 'Classifica o retorno do follow-up',
      x: 400,
      y: 160,
      options: [
        { id: 'f-opt-1', label: 'Já decidi, vamos fechar!', color: '#10b981', targetNodeId: 'node-f-crm-won' },
        { id: 'f-opt-2', label: 'Tenho algumas dúvidas ainda', color: '#3b82f6', targetNodeId: 'node-f-msg-support' },
        { id: 'f-opt-3', label: 'Não vou fechar agora', color: '#ef4444', targetNodeId: 'node-f-crm-lost' }
      ]
    },
    {
      id: 'node-f-crm-won',
      type: 'crm_action',
      title: 'Ação no CRM',
      content: 'Mover para Proposta Aceita / Fechamento',
      x: 740,
      y: 60,
      config: { crmActionType: 'move_stage', crmActionValue: 'Fechamento' }
    },
    {
      id: 'node-f-msg-support',
      type: 'message',
      title: 'Mensagem',
      badge: 'Sugestão no chat',
      content: 'Perfeito! Qual é o principal ponto que você gostaria de esclarecer? Se preferir podemos agendar 5 minutinhos de ligação.',
      x: 740,
      y: 200,
      config: {
        linkUrl: 'https://mudadigital.com.br/duvidas',
        linkText: 'Ver FAQ de Dúvidas Frequentes ❓'
      }
    },
    {
      id: 'node-f-crm-lost',
      type: 'crm_action',
      title: 'Ação no CRM',
      content: 'Mover para Sem interesse (Follow em 60d)',
      x: 740,
      y: 350,
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
  // Lista de Fluxos
  const initialFlows = useMemo(() => {
    if (settings.chatbotConfig?.flows && settings.chatbotConfig.flows.length > 0) {
      return settings.chatbotConfig.flows;
    }
    return [DEFAULT_FLOW_DIAGNOSTICO, DEFAULT_FLOW_FOLLOWUP];
  }, [settings.chatbotConfig?.flows]);

  const [flows, setFlows] = useState<ChatbotFlow[]>(initialFlows);
  const [activeFlowId, setActiveFlowId] = useState<string>(
    settings.chatbotConfig?.activeFlowId || initialFlows[0]?.id || DEFAULT_FLOW_DIAGNOSTICO.id
  );

  const currentFlow = flows.find(f => f.id === activeFlowId) || flows[0] || DEFAULT_FLOW_DIAGNOSTICO;

  // Viewport & Pan / Zoom (Suporta zoom de 0.15 até 3.0 e pan infinito)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 30, y: 20 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Seleção e Interação com Nós
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  // Modais
  const [isTestSimulatorOpen, setIsTestSimulatorOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isFlowSelectorOpen, setIsFlowSelectorOpen] = useState(false);
  const [isNewFlowModalOpen, setIsNewFlowModalOpen] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [newFlowTemplate, setNewFlowTemplate] = useState<'diagnostico' | 'followup' | 'blank'>('diagnostico');

  // Status
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [flowActiveToggle, setFlowActiveToggle] = useState(currentFlow.active ?? true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Histórico para Undo/Redo
  const [history, setHistory] = useState<ChatbotFlowNode[][]>([currentFlow.nodes]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Simulador de Teste
  const [simStepNodeId, setSimStepNodeId] = useState<string>('node-start');
  const [simHistory, setSimHistory] = useState<Array<{
    sender: 'bot' | 'user' | 'system';
    text: string;
    linkUrl?: string;
    linkText?: string;
    nodeId: string;
  }>>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFlowActiveToggle(currentFlow.active ?? true);
  }, [currentFlow.id]);

  // Atualizar nós
  const updateNodes = (newNodes: ChatbotFlowNode[], recordHistory = true) => {
    setFlows(prev => prev.map(f => {
      if (f.id === currentFlow.id) {
        return { ...f, nodes: newNodes, updatedAt: new Date().toISOString() };
      }
      return f;
    }));

    if (recordHistory) {
      setHistory(prevHist => {
        const nextHistory = prevHist.slice(0, historyIndex + 1);
        nextHistory.push(newNodes);
        return nextHistory;
      });
      setHistoryIndex(prev => prev + 1);
    }
  };

  const pushHistory = (newNodes: ChatbotFlowNode[]) => {
    setHistory(prevHist => {
      const nextHistory = prevHist.slice(0, historyIndex + 1);
      nextHistory.push(newNodes);
      return nextHistory;
    });
    setHistoryIndex(prev => prev + 1);
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

  // Criar Novo Fluxo
  const handleCreateNewFlow = () => {
    const name = newFlowName.trim() || `Novo Fluxo ${flows.length + 1}`;
    let nodes: ChatbotFlowNode[] = [];

    if (newFlowTemplate === 'diagnostico') {
      nodes = JSON.parse(JSON.stringify(DEFAULT_FLOW_DIAGNOSTICO.nodes));
    } else if (newFlowTemplate === 'followup') {
      nodes = JSON.parse(JSON.stringify(DEFAULT_FLOW_FOLLOWUP.nodes));
    } else {
      nodes = [
        {
          id: 'node-start',
          type: 'start',
          title: 'Começo do fluxo',
          badge: 'Início',
          content: 'Olá! Sou seu assistente virtual. Como posso te ajudar?',
          x: 80,
          y: 200,
          config: {
            triggerConfig: {
              type: 'instant_reply',
              delayAmount: 3,
              delayUnit: 'seconds'
            }
          }
        }
      ];
    }

    const newFlow: ChatbotFlow = {
      id: `flow-${Date.now()}`,
      name,
      subtitle: `Fluxo criado em ${new Date().toLocaleDateString('pt-BR')}`,
      active: true,
      updatedAt: new Date().toISOString(),
      connections: [],
      nodes
    };

    const nextFlows = [newFlow, ...flows];
    setFlows(nextFlows);
    setActiveFlowId(newFlow.id);
    setIsNewFlowModalOpen(false);
    setNewFlowName('');
    setPan({ x: 40, y: 30 });
    setZoom(1);
  };

  // Duplicar Fluxo
  const handleDuplicateFlow = (flowToDup: ChatbotFlow) => {
    const duplicated: ChatbotFlow = {
      ...JSON.parse(JSON.stringify(flowToDup)),
      id: `flow-${Date.now()}`,
      name: `${flowToDup.name} (Cópia)`,
      updatedAt: new Date().toISOString()
    };
    setFlows([duplicated, ...flows]);
    setActiveFlowId(duplicated.id);
  };

  // Excluir Fluxo
  const handleDeleteFlow = (flowId: string) => {
    if (flows.length <= 1) {
      alert('Você precisa manter pelo menos 1 fluxo ativo.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir este fluxo?')) {
      const remaining = flows.filter(f => f.id !== flowId);
      setFlows(remaining);
      setActiveFlowId(remaining[0].id);
    }
  };

  // Canvas Pan Handlers - Permite arrastar todo o fluxo livremente
  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Apenas botão esquerdo

    // Se clicar em botões, inputs, controles de zoom ou na barra de ferramentas, não inicia pan do canvas
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select') ||
      target.closest('a') ||
      target.closest('.no-pan')
    ) {
      return;
    }

    setIsPanning(true);
    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startPanX = pan.x;
    const startPanY = pan.y;

    const onWindowPanMove = (moveEv: MouseEvent) => {
      const dx = moveEv.clientX - startClientX;
      const dy = moveEv.clientY - startClientY;
      setPan({
        x: Math.round(startPanX + dx),
        y: Math.round(startPanY + dy)
      });
    };

    const onWindowPanUp = () => {
      window.removeEventListener('mousemove', onWindowPanMove);
      window.removeEventListener('mouseup', onWindowPanUp);
      setIsPanning(false);
    };

    window.addEventListener('mousemove', onWindowPanMove);
    window.addEventListener('mouseup', onWindowPanUp);
  };

  // Suporte a Wheel (Scroll para pan ou Ctrl+Scroll para zoom)
  const handleWheelCanvas = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.15), 3.0);
      setZoom(newZoom);
    } else {
      // Pan com scroll
      setPan(prev => ({
        x: prev.x - e.deltaX * 0.8,
        y: prev.y - e.deltaY * 0.8
      }));
    }
  };

  // -------------------------------------------------------------
  // UX SOLICITADA:
  // "quando clicar e segurar um bloco é para arrastar e ao soltar o botao do mouse, solta o bloco e quando clicar 2 vezes, abre as propriedades"
  // -------------------------------------------------------------
  const handleNodeMouseDown = (e: React.MouseEvent, node: ChatbotFlowNode) => {
    if (e.button !== 0) return; // Apenas botão esquerdo
    e.stopPropagation();

    setSelectedNodeId(node.id);

    const startClientX = e.clientX;
    const startClientY = e.clientY;
    const startNodeX = node.x;
    const startNodeY = node.y;
    let moved = false;
    let finalNodes = currentFlow.nodes;

    // Window listeners garantem que ao mover rápido ou soltar fora, o nó nunca fica grudado
    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = (moveEvent.clientX - startClientX) / zoom;
      const dy = (moveEvent.clientY - startClientY) / zoom;

      if (!moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
        moved = true;
        setDraggingNodeId(node.id);
      }

      if (moved) {
        finalNodes = currentFlow.nodes.map(n =>
          n.id === node.id
            ? { ...n, x: Math.round(startNodeX + dx), y: Math.round(startNodeY + dy) }
            : n
        );
        updateNodes(finalNodes, false);
      }
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setDraggingNodeId(null);

      if (moved) {
        pushHistory(finalNodes);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  // DUPLO CLIQUE ABRE O PAINEL DE PROPRIEDADES
  const handleNodeDoubleClick = (e: React.MouseEvent, node: ChatbotFlowNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setIsInspectorOpen(true);
  };

  // Adicionar novo bloco
  const handleAddBlock = (type: ChatbotFlowNode['type']) => {
    const id = `node-${type}-${Date.now().toString().slice(-4)}`;
    const x = Math.round((-pan.x + 380) / zoom);
    const y = Math.round((-pan.y + 220) / zoom);

    let title = 'Novo Bloco';
    let content = 'Conteúdo do bloco...';
    let badge = undefined;
    let options = undefined;
    let config = undefined;

    switch (type) {
      case 'message':
        title = 'Mensagem';
        badge = 'Sugestão no chat';
        content = 'Olá! Segue o link com todas as informações completas:';
        config = {
          messageType: 'suggestion' as const,
          linkUrl: 'https://mudadigital.com.br',
          linkText: 'Acessar Link Externo 🔗'
        };
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
    setIsInspectorOpen(true);
  };

  // Auto-organizar nós
  const handleAutoOrganize = () => {
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

  const handleFitView = () => {
    setPan({ x: 20, y: 20 });
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

      if (start.targetNodeId) {
        const next = currentFlow.nodes.find(n => n.id === start.targetNodeId);
        if (next && next.type === 'condition') {
          setSimStepNodeId(next.id);
        }
      }
    }
    setIsTestSimulatorOpen(true);
  };

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
              linkUrl: target.config?.linkUrl,
              linkText: target.config?.linkText,
              nodeId: target.id
            }
          ]);
          setSimStepNodeId(target.id);

          if (target.targetNodeId) {
            const nextTarget = currentFlow.nodes.find(n => n.id === target.targetNodeId);
            if (nextTarget) {
              setTimeout(() => {
                setSimHistory(prev => [
                  ...prev,
                  {
                    sender: nextTarget.type === 'crm_action' ? 'system' : 'bot',
                    text: nextTarget.type === 'crm_action' ? `⚡ ${nextTarget.title}: ${nextTarget.content}` : (nextTarget.content || ''),
                    linkUrl: nextTarget.config?.linkUrl,
                    linkText: nextTarget.config?.linkText,
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

  // Conexões SVG
  const renderConnections = () => {
    const lines: React.ReactNode[] = [];

    currentFlow.nodes.forEach(node => {
      if (node.targetNodeId) {
        const target = currentFlow.nodes.find(n => n.id === node.targetNodeId);
        if (target) {
          const x1 = node.x + 240;
          const y1 = node.y + 40;
          const x2 = target.x;
          const y2 = target.y + 35;
          const dx = Math.abs(x2 - x1) * 0.55;
          const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

          lines.push(
            <g key={`conn-${node.id}-${target.id}`}>
              <path d={pathData} fill="none" stroke="#334155" strokeWidth={4} className="opacity-40" />
              <path d={pathData} fill="none" stroke="#64748b" strokeWidth={2} />
              <circle cx={x2} cy={y2} r={3} fill="#94a3b8" />
            </g>
          );
        }
      }

      if (node.options && node.options.length > 0) {
        node.options.forEach((opt, idx) => {
          if (opt.targetNodeId) {
            const target = currentFlow.nodes.find(n => n.id === opt.targetNodeId);
            if (target) {
              const x1 = node.x + 240;
              const y1 = node.y + 70 + (idx * 28);
              const x2 = target.x;
              const y2 = target.y + 35;
              const dx = Math.abs(x2 - x1) * 0.55;
              const pathData = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
              const strokeColor = opt.color || '#3b82f6';

              lines.push(
                <g key={`opt-conn-${node.id}-${opt.id}-${target.id}`}>
                  <path d={pathData} fill="none" stroke="#0f172a" strokeWidth={5} className="opacity-70" />
                  <path d={pathData} fill="none" stroke={strokeColor} strokeWidth={2} />
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
    <div className={`w-full h-full flex flex-col bg-[#070b12] text-slate-100 overflow-hidden select-none relative ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      
      {/* 1. HEADER SUPERIOR COM SELETOR DE MÚLTIPLOS FLUXOS */}
      <div className="h-14 bg-[#0d131f] border-b border-slate-800 px-4 flex items-center justify-between z-20 shrink-0">
        
        {/* Esquerda: Seletor de Fluxos & Título */}
        <div className="flex items-center gap-3">
          {onBackToModeSelect && (
            <button
              onClick={onBackToModeSelect}
              className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition"
              title="Voltar"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Abordagens</span>
            </button>
          )}

          <div className="h-4 w-[1px] bg-slate-800"></div>

          {/* DROPDOWN DE MÚLTIPLOS FLUXOS */}
          <div className="relative">
            <button
              onClick={() => setIsFlowSelectorOpen(!isFlowSelectorOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-bold text-white transition"
            >
              <span className="text-slate-400 font-normal">Fluxo /</span>
              <span className="truncate max-w-[200px] sm:max-w-[260px]">{currentFlow.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {/* Menu Dropdown de Fluxos */}
            {isFlowSelectorOpen && (
              <div className="absolute left-0 top-full mt-1.5 w-80 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Meus Fluxos ({flows.length})</span>
                  <button
                    onClick={() => {
                      setIsFlowSelectorOpen(false);
                      setIsNewFlowModalOpen(true);
                    }}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Novo Fluxo</span>
                  </button>
                </div>

                <div className="space-y-1 mt-1 max-h-64 overflow-y-auto">
                  {flows.map(f => (
                    <div
                      key={f.id}
                      onClick={() => {
                        setActiveFlowId(f.id);
                        setIsFlowSelectorOpen(false);
                        setHistory([f.nodes]);
                        setHistoryIndex(0);
                      }}
                      className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition ${
                        f.id === currentFlow.id
                          ? 'bg-indigo-600/20 border border-indigo-500/40 text-white'
                          : 'hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold truncate">{f.name}</p>
                        <p className="text-[10px] text-slate-400">{f.nodes?.length || 0} blocos</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {f.active ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Fluxo Ativo" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-slate-600" title="Fluxo Pausado" />
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDuplicateFlow(f); }}
                          className="p-1 hover:text-white text-slate-500"
                          title="Duplicar"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                        {flows.length > 1 && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteFlow(f.id); }}
                            className="p-1 hover:text-rose-400 text-slate-500"
                            title="Excluir"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Direita: Ações Rápidas */}
        <div className="flex items-center gap-2">
          
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Prontos</span>
          </button>

          <button
            onClick={handleStartSimulation}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-600/50 shadow-xs transition"
          >
            <Play className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span>Testar</span>
          </button>

          {/* Toggle Ativo */}
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

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title={isFullscreen ? 'Sair da tela cheia' : 'Expandir tela cheia'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. ÁREA DE TRABALHO (SIDEBAR DE BLOCOS + CANVAS INFINITO) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR ESQUERDA - BLOCOS */}
        <div className="w-64 bg-[#0b101b] border-r border-slate-800 p-3.5 flex flex-col gap-4 overflow-y-auto shrink-0 z-10 custom-scrollbar">
          
          <div>
            <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400">Blocos</h3>
            <p className="text-[10px] text-slate-500">Clique para adicionar no quadro:</p>
          </div>

          {/* GRUPO 1: FALAR COM O LEAD */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-1">Falar com o lead</span>
            
            <button
              onClick={() => handleAddBlock('message')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-cyan-500/40 transition group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-cyan-500/20">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-cyan-300">Mensagem</p>
                <p className="text-[10px] text-slate-400 truncate">Manda mensagem ou links externos</p>
              </div>
            </button>

            <button
              onClick={() => handleAddBlock('ai_reply')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-purple-500/40 transition group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-purple-500/20">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-purple-300">IA responde</p>
                <p className="text-[10px] text-slate-400 truncate">A IA lê a conversa e escreve a resposta</p>
              </div>
            </button>

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

            <button
              onClick={() => handleAddBlock('condition')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-emerald-500/40 transition group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500/20">
                <Filter className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-emerald-300">Se (Condição)</p>
                <p className="text-[10px] text-slate-400 truncate">Separa pelo que se sabe do lead</p>
              </div>
            </button>

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

            <button
              onClick={() => handleAddBlock('crm_action')}
              className="w-full text-left p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-pink-500/40 transition group flex items-start gap-2.5"
            >
              <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-pink-500/20">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white group-hover:text-pink-300">Ação no CRM</p>
                <p className="text-[10px] text-slate-400 truncate">Move o card, cria tarefa, notifica</p>
              </div>
            </button>
          </div>

          <div className="mt-auto p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[10px] text-slate-400 space-y-1">
            <p className="font-bold text-slate-300 flex items-center gap-1">
              <MousePointer className="w-3 h-3 text-indigo-400" />
              <span>Dica de Uso:</span>
            </p>
            <p>• <strong>Clique e segure</strong> para arrastar.</p>
            <p>• <strong>Solte o mouse</strong> para soltar o bloco.</p>
            <p>• <strong>Clique 2x</strong> para abrir as propriedades.</p>
          </div>
        </div>

        {/* 3. CANVAS WORKSPACE (ARRASTE INFINITO & ZOOM DE 0.15 A 3.0) */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDownCanvas}
          onWheel={handleWheelCanvas}
          className={`flex-1 relative overflow-hidden canvas-background ${isPanning ? 'cursor-grabbing' : 'cursor-grab'} bg-[#080c14] select-none`}
          style={{
            backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        >
          {/* BARRA SUPERIOR DE FERRAMENTAS DO CANVAS */}
          <div 
            onMouseDown={e => e.stopPropagation()}
            className="no-pan absolute top-3 left-4 z-10 flex items-center gap-1.5 bg-[#0f172a]/95 backdrop-blur-md border border-slate-800 p-1 rounded-xl shadow-lg text-xs font-medium text-slate-300"
          >
            
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
              title="Desfazer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 hover:bg-slate-800 rounded-lg transition disabled:opacity-30 scale-x-[-1]"
              title="Refazer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <div className="h-3.5 w-[1px] bg-slate-700/80 mx-0.5"></div>

            <button
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentFlow, null, 2));
                const a = document.createElement('a');
                a.href = dataStr;
                a.download = `${currentFlow.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`;
                a.click();
              }}
              className="px-2 py-1.5 hover:bg-slate-800 rounded-lg transition flex items-center gap-1"
            >
              <Download className="w-3 h-3 text-slate-400" />
              <span>Baixar</span>
            </button>
          </div>

          {/* ÁREA TRANSFORMADA DO CANVAS (ZOOM & PAN) */}
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {/* SVG DAS CONEXÕES */}
            <svg
              className="absolute top-0 left-0 w-[8000px] h-[8000px] pointer-events-none overflow-visible"
              style={{ zIndex: 1 }}
            >
              {renderConnections()}
            </svg>

            {/* RENDERIZAÇÃO DOS NÓS */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
              {currentFlow.nodes.map(node => {
                const isSelected = selectedNodeId === node.id;
                const isDragging = draggingNodeId === node.id;

                // NÓ: COMEÇO DO FLUXO (COM SUPORTE A GATILHO PROATIVO POR TEMPO)
                if (node.type === 'start') {
                  const trigger = node.config?.triggerConfig;
                  const isProactive = trigger?.type === 'proactive_time';
                  const triggerBadge = isProactive 
                    ? `⏰ Chama sozinho em ${trigger?.delayAmount || 2} ${trigger?.delayUnit === 'hours' ? 'horas' : 'dias'}`
                    : '⚡ Resposta Imediata';

                  return (
                    <div
                      key={node.id}
                      onMouseDown={e => handleNodeMouseDown(e, node)}
                      onDoubleClick={e => handleNodeDoubleClick(e, node)}
                      className={`absolute w-64 rounded-2xl bg-[#101726]/95 border transition-shadow shadow-xl cursor-grab active:cursor-grabbing select-none pointer-events-auto ${
                        isSelected 
                          ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-orange-500/10' 
                          : 'border-slate-800 hover:border-slate-700'
                      } ${isDragging ? 'opacity-80 scale-102 z-30' : ''}`}
                      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                    >
                      <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-white">{node.title}</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30">
                          {node.badge || 'Início'}
                        </span>
                      </div>

                      {/* BADGE VISUAL DE TEMPO DE INÍCIO / PROATIVO */}
                      <div className="px-3 pt-2">
                        <div className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1.5 ${
                          isProactive 
                            ? 'bg-amber-950/40 text-amber-300 border-amber-600/40' 
                            : 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40'
                        }`}>
                          <Clock className="w-3 h-3 shrink-0" />
                          <span className="truncate">{triggerBadge}</span>
                        </div>
                      </div>

                      <div className="p-3 text-[11px] text-slate-300 leading-relaxed font-normal whitespace-pre-wrap">
                        {node.content}
                      </div>

                      {/* Conector Saída */}
                      <div className="absolute -right-2 top-10 w-4 h-4 rounded-full bg-orange-500 border-2 border-slate-900 cursor-crosshair shadow-md" />
                    </div>
                  );
                }

                // NÓ: SE O LEAD RESPONDER (CONDIÇÃO / ROTEADOR)
                if (node.type === 'condition') {
                  return (
                    <div
                      key={node.id}
                      onMouseDown={e => handleNodeMouseDown(e, node)}
                      onDoubleClick={e => handleNodeDoubleClick(e, node)}
                      className={`absolute w-64 rounded-2xl bg-[#0f172a]/95 border transition-shadow shadow-2xl cursor-grab active:cursor-grabbing select-none pointer-events-auto ${
                        isSelected 
                          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/10' 
                          : 'border-slate-800 hover:border-slate-700'
                      } ${isDragging ? 'opacity-80 scale-102 z-30' : ''}`}
                      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                    >
                      <div className="absolute -left-2 top-9 w-4 h-4 rounded-full bg-blue-500 border-2 border-slate-900" />

                      <div className="p-3 border-b border-slate-800/80 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                          <GitFork className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-white">{node.title}</span>
                      </div>

                      <div className="p-2 space-y-1">
                        {(node.options || []).map((opt) => (
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

                            <div
                              className="w-3.5 h-3.5 rounded-full border-2 border-slate-900 cursor-crosshair shrink-0 hover:scale-125 transition"
                              style={{ backgroundColor: opt.color || '#3b82f6' }}
                              title={`Conectar: ${opt.label}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="p-2.5 border-t border-slate-800/60 text-[10px] text-slate-500 flex items-center gap-1">
                        <span className="text-rose-400 font-bold">✕</span>
                        <span>Pediu pra parar: sai do fluxo</span>
                      </div>
                    </div>
                  );
                }

                // NÓ: MENSAGEM (COM SUPORTE A LINKS / CONTEÚDO EXTERNO)
                if (node.type === 'message') {
                  return (
                    <div
                      key={node.id}
                      onMouseDown={e => handleNodeMouseDown(e, node)}
                      onDoubleClick={e => handleNodeDoubleClick(e, node)}
                      className={`absolute w-60 rounded-2xl bg-[#0f172a]/95 border transition-shadow shadow-xl cursor-grab active:cursor-grabbing select-none pointer-events-auto ${
                        isSelected 
                          ? 'border-cyan-500 ring-2 ring-cyan-500/20 shadow-cyan-500/10' 
                          : 'border-slate-800 hover:border-slate-700'
                      } ${isDragging ? 'opacity-80 scale-102 z-30' : ''}`}
                      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                    >
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

                      {/* EXIBIÇÃO DE LINK DE CONTEÚDO EXTERNO NO CARD */}
                      {node.config?.linkUrl && (
                        <div className="px-2.5 pb-2.5">
                          <a
                            href={node.config.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-700/40 px-2 py-1 rounded-lg transition truncate"
                          >
                            <ExternalLink className="w-3 h-3 shrink-0" />
                            <span className="truncate">{node.config.linkText || 'Acessar Link Externo 🔗'}</span>
                          </a>
                        </div>
                      )}

                      {node.targetNodeId && (
                        <div className="absolute -right-2 top-8 w-4 h-4 rounded-full bg-cyan-500 border-2 border-slate-900 cursor-crosshair" />
                      )}
                    </div>
                  );
                }

                // NÓ: AÇÃO NO CRM
                if (node.type === 'crm_action') {
                  return (
                    <div
                      key={node.id}
                      onMouseDown={e => handleNodeMouseDown(e, node)}
                      onDoubleClick={e => handleNodeDoubleClick(e, node)}
                      className={`absolute w-60 rounded-2xl bg-[#141224]/95 border transition-shadow shadow-xl cursor-grab active:cursor-grabbing select-none pointer-events-auto ${
                        isSelected 
                          ? 'border-pink-500 ring-2 ring-pink-500/20 shadow-pink-500/10' 
                          : 'border-pink-900/40 hover:border-pink-600/60'
                      } ${isDragging ? 'opacity-80 scale-102 z-30' : ''}`}
                      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                    >
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

                // NÓ: FIM
                if (node.type === 'end') {
                  return (
                    <div
                      key={node.id}
                      onMouseDown={e => handleNodeMouseDown(e, node)}
                      onDoubleClick={e => handleNodeDoubleClick(e, node)}
                      className={`absolute w-56 rounded-2xl bg-[#0f172a]/95 border transition-shadow shadow-xl cursor-grab active:cursor-grabbing select-none pointer-events-auto ${
                        isSelected ? 'border-slate-400 ring-2 ring-slate-500/20' : 'border-slate-800'
                      } ${isDragging ? 'opacity-80 scale-102 z-30' : ''}`}
                      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                    >
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

                return (
                  <div
                    key={node.id}
                    onMouseDown={e => handleNodeMouseDown(e, node)}
                    onDoubleClick={e => handleNodeDoubleClick(e, node)}
                    className={`absolute w-56 rounded-2xl bg-[#0f172a]/95 border p-3 cursor-grab select-none pointer-events-auto ${
                      isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-800'
                    }`}
                    style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
                  >
                    <span className="text-xs font-bold text-white">{node.title}</span>
                    <p className="text-[11px] text-slate-300 mt-1">{node.content}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CONTROLES DE ZOOM NO CANTO INFERIOR ESQUERDO (AMPLIADO DE 15% A 300%) */}
          <div 
            onMouseDown={e => e.stopPropagation()}
            className="no-pan absolute bottom-4 left-4 z-10 flex flex-col gap-1 bg-[#0f172a]/95 backdrop-blur-md border border-slate-800 p-1 rounded-xl shadow-lg"
          >
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.15, 3.0))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
              title="Aumentar Zoom (Máx 300%)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            
            {/* Porcentagem Atual de Zoom */}
            <div className="text-[9px] font-bold text-center text-slate-400 py-0.5 select-none">
              {Math.round(zoom * 100)}%
            </div>

            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.15, 0.15))}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
              title="Diminuir Zoom (Mín 15%)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 30, y: 20 }); }}
              className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition"
              title="Resetar Zoom (100%)"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* MINIMAP NO CANTO INFERIOR DIREITO */}
          <div 
            onMouseDown={e => e.stopPropagation()}
            className="no-pan absolute bottom-4 right-4 z-10 w-36 h-24 bg-[#0a0f1d]/90 backdrop-blur-md border border-slate-800 rounded-xl p-2 hidden sm:flex flex-col justify-between shadow-2xl"
          >
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

        {/* 4. PAINEL INSPETOR (ABRE AO CLICAR 2X NO BLOCO) */}
        {isInspectorOpen && selectedNode && (
          <div className="w-80 bg-[#0c121e] border-l border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto shrink-0 z-20 custom-scrollbar animate-in slide-in-from-right duration-200 shadow-2xl">
            
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Propriedades do Bloco</span>
              </div>
              <button
                onClick={() => setIsInspectorOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CONFIGURAÇÃO ESPECIAL PARA NÓ 'START' (GATILHO / TEMPO / PROATIVO) */}
            {selectedNode.type === 'start' && (
              <div className="space-y-3 p-3 rounded-2xl bg-slate-900 border border-orange-500/30">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold text-white">Gatilho de Início do Fluxo</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Quando este fluxo deve iniciar?</label>
                  <select
                    value={selectedNode.config?.triggerConfig?.type || 'instant_reply'}
                    onChange={e => {
                      const type = e.target.value as FlowTriggerType;
                      updateNodes(currentFlow.nodes.map(n => n.id === selectedNode.id ? {
                        ...n,
                        config: {
                          ...n.config,
                          triggerConfig: {
                            ...(n.config?.triggerConfig || {}),
                            type
                          }
                        }
                      } : n));
                    }}
                    className="mt-1 w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="instant_reply">⚡ Imediato: Responde assim que o lead chamar</option>
                    <option value="proactive_time">⏰ Proativo: O bot chama sozinho após X tempo</option>
                    <option value="keyword_match">🏷️ Palavra-chave: Dispara com termos específicos</option>
                  </select>
                </div>

                {/* Se for Proativo por Tempo (ex: 2 dias depois) */}
                {selectedNode.config?.triggerConfig?.type === 'proactive_time' && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <label className="text-[10px] font-bold text-amber-300 uppercase">Tempo de Espera para Chamar Sozinho:</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={selectedNode.config?.triggerConfig?.delayAmount || 2}
                        onChange={e => {
                          const val = Number(e.target.value);
                          updateNodes(currentFlow.nodes.map(n => n.id === selectedNode.id ? {
                            ...n,
                            config: {
                              ...n.config,
                              triggerConfig: {
                                ...(n.config?.triggerConfig || { type: 'proactive_time' }),
                                delayAmount: val
                              }
                            }
                          } : n));
                        }}
                        className="w-20 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                      />
                      <select
                        value={selectedNode.config?.triggerConfig?.delayUnit || 'days'}
                        onChange={e => {
                          const unit = e.target.value as any;
                          updateNodes(currentFlow.nodes.map(n => n.id === selectedNode.id ? {
                            ...n,
                            config: {
                              ...n.config,
                              triggerConfig: {
                                ...(n.config?.triggerConfig || { type: 'proactive_time' }),
                                delayUnit: unit
                              }
                            }
                          } : n));
                        }}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white"
                      >
                        <option value="minutes">Minutos</option>
                        <option value="hours">Horas</option>
                        <option value="days">Dias</option>
                      </select>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                      Exemplo: 2 dias depois de enviar proposta ou após a última mensagem sem resposta.
                    </p>
                  </div>
                )}
              </div>
            )}

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

            {/* Conteúdo / Mensagem */}
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Texto da Mensagem</label>
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

            {/* CONFIGURAÇÃO DE LINKS EXTERNOS (SOLICITADO PELO USUÁRIO) */}
            {(selectedNode.type === 'message' || selectedNode.type === 'start') && (
              <div className="space-y-2 p-3 rounded-2xl bg-cyan-950/20 border border-cyan-800/40">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                  <Link2 className="w-3.5 h-3.5" />
                  <span>Link de Conteúdo Externo</span>
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase">URL do Link</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com.br/artigo"
                    value={selectedNode.config?.linkUrl || ''}
                    onChange={e => {
                      const val = e.target.value;
                      updateNodes(currentFlow.nodes.map(n => n.id === selectedNode.id ? {
                        ...n,
                        config: { ...n.config, linkUrl: val }
                      } : n));
                    }}
                    className="mt-1 w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Texto do Botão / Link</label>
                  <input
                    type="text"
                    placeholder="Ex: Acessar Material Exclusivo 🔗"
                    value={selectedNode.config?.linkText || ''}
                    onChange={e => {
                      const val = e.target.value;
                      updateNodes(currentFlow.nodes.map(n => n.id === selectedNode.id ? {
                        ...n,
                        config: { ...n.config, linkText: val }
                      } : n));
                    }}
                    className="mt-1 w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {selectedNode.config?.linkUrl && (
                  <div className="pt-1">
                    <a
                      href={selectedNode.config.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Testar link no navegador</span>
                    </a>
                  </div>
                )}
              </div>
            )}

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
                  {(selectedNode.options || []).map((opt) => (
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
                  setIsInspectorOpen(false);
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

      {/* 5. MODAL: SIMULADOR INTERATIVO */}
      {isTestSimulatorOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[650px] animate-in zoom-in-95 duration-150">
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
                      {item.linkUrl && (
                        <div className="mt-2.5 pt-2 border-t border-slate-700/60">
                          <a
                            href={item.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 rounded-xl transition shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>{item.linkText || 'Acessar Conteúdo Externo 🔗'}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

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

      {/* 6. MODAL: CRIAR NOVO FLUXO */}
      {isNewFlowModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">Criar Novo Fluxo</h3>
              </div>
              <button onClick={() => setIsNewFlowModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Nome do Fluxo</label>
              <input
                type="text"
                placeholder="Ex: Recuperação de Carrinho 2 Dias, Proposta..."
                value={newFlowName}
                onChange={e => setNewFlowName(e.target.value)}
                className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Modelo Inicial</label>
              <div className="grid grid-cols-1 gap-2 mt-1.5">
                <div
                  onClick={() => setNewFlowTemplate('diagnostico')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    newFlowTemplate === 'diagnostico' 
                      ? 'bg-indigo-950/40 border-indigo-500 text-white' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">Diagnóstico + Roteador de Intenções (Print)</p>
                  <p className="text-[10px] text-slate-400">7 ramificações automáticas de interesse e ações no CRM.</p>
                </div>

                <div
                  onClick={() => setNewFlowTemplate('followup')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    newFlowTemplate === 'followup' 
                      ? 'bg-indigo-950/40 border-indigo-500 text-white' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">Follow-up Proativo (2 Dias Depois)</p>
                  <p className="text-[10px] text-slate-400">Chama o lead sozinho 2 dias depois para verificar decisão.</p>
                </div>

                <div
                  onClick={() => setNewFlowTemplate('blank')}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    newFlowTemplate === 'blank' 
                      ? 'bg-indigo-950/40 border-indigo-500 text-white' 
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">Em Branco</p>
                  <p className="text-[10px] text-slate-400">Inicia apenas com o bloco inicial para montar do zero.</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsNewFlowModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateNewFlow}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-600/30"
              >
                Criar Fluxo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL DE TEMPLATES PRONTOS */}
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
                  setFlows([DEFAULT_FLOW_DIAGNOSTICO, ...flows.filter(f => f.id !== DEFAULT_FLOW_DIAGNOSTICO.id)]);
                  setActiveFlowId(DEFAULT_FLOW_DIAGNOSTICO.id);
                  setIsTemplatesModalOpen(false);
                }}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300">
                    Diagnóstico + Google → WhatsApp (Print)
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modelo completo com 7 ramificações de intenção, mensagens e automação no CRM.
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
              </div>

              <div
                onClick={() => {
                  setFlows([DEFAULT_FLOW_FOLLOWUP, ...flows.filter(f => f.id !== DEFAULT_FLOW_FOLLOWUP.id)]);
                  setActiveFlowId(DEFAULT_FLOW_FOLLOWUP.id);
                  setIsTemplatesModalOpen(false);
                }}
                className="p-3.5 rounded-2xl bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-indigo-300">
                    Follow-up Proativo 2 Dias Depois
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    O bot chama sozinho o cliente 2 dias após a proposta para saber se decidiu.
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
