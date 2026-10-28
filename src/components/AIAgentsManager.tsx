import React, { useState, useEffect, useMemo } from 'react';
import {
  Bot,
  Sparkles,
  BrainCircuit,
  ShieldCheck,
  Play,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  Search,
  Database,
  Zap,
  MessageSquare,
  UserCheck,
  RefreshCw,
  Eye,
  Sliders,
  Target,
  Send,
  History,
  FileText,
  ShoppingBag,
  Link as LinkIcon,
  Users,
  ClipboardList,
  Clock,
  Check,
  Wand2,
  LayoutGrid,
  ListChecks,
  Activity,
  Filter,
  Phone,
  Instagram,
  ArrowUpRight,
  CheckSquare,
  Square,
  AlertCircle,
  X,
  Calendar
} from 'lucide-react';
import {
  AIAgent,
  AIAgentToolId,
  AIAgentTriggerType,
  AIAgentExecutionLog,
  AIAgentActivityColumn,
  Company,
  Lead,
  Product,
  CampaignLink
} from '../types';
import {
  fetchAIAgents,
  createAIAgent,
  updateAIAgent,
  deleteAIAgent,
  generateAIAgentBlueprint,
  executeAIAgentTurn,
  fetchAIAgentLogs,
  updateAIAgentLog
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';
import { HabblaudOfficeView } from './HabblaudOfficeView';

interface AIAgentsManagerProps {
  currentCompany: Company;
  leads: Lead[];
  products: Product[];
  links: CampaignLink[];
  onUpdateLead?: (id: string, data: Partial<Lead>) => Promise<void>;
  onNavigateToTab?: (tab: any) => void;
}

interface ToolMetadata {
  id: AIAgentToolId;
  category: 'read' | 'action';
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
}

const AVAILABLE_TOOLS: ToolMetadata[] = [
  {
    id: 'get_lead_profile',
    category: 'read',
    label: 'Consultar Ficha do Lead (CRM)',
    description: 'Lê nome, estágio atual no funil, origem UTM, notas e pontuação (Lead Score).',
    icon: Users,
    badge: 'Leitura CRM'
  },
  {
    id: 'search_products',
    category: 'read',
    label: 'Consultar Catálogo de Produtos & Preços',
    description: 'Busca produtos, serviços, preços e recorrência cadastrados na empresa.',
    icon: ShoppingBag,
    badge: 'Catálogo'
  },
  {
    id: 'get_lead_purchases',
    category: 'read',
    label: 'Consultar Histórico de Compras (LTV)',
    description: 'Verifica quais produtos o cliente já comprou anteriormente e valores pagos.',
    icon: Database,
    badge: 'Histórico'
  },
  {
    id: 'get_campaign_links',
    category: 'read',
    label: 'Buscar Links Rastreáveis & Ofertas',
    description: 'Localiza links oficiais de campanhas e checkouts para enviar ao lead.',
    icon: LinkIcon,
    badge: 'Links UTM'
  },
  {
    id: 'get_chat_history',
    category: 'read',
    label: 'Ler Histórico de Conversas',
    description: 'Analisa mensagens anteriores trocadas no WhatsApp ou Direct para manter contexto.',
    icon: MessageSquare,
    badge: 'Memória'
  },
  {
    id: 'get_survey_responses',
    category: 'read',
    label: 'Consultar Respostas de Pesquisa / NPS',
    description: 'Lê notas de satisfação e respostas de formulários preenchidos pelo lead.',
    icon: ClipboardList,
    badge: 'Pesquisas'
  },
  {
    id: 'update_lead_stage',
    category: 'action',
    label: 'Mover Estágio do Lead no Funil',
    description: 'Avança ou altera a etapa do lead no CRM (ex: Novo Lead → Em Negociação).',
    icon: Target,
    badge: 'Ação CRM'
  },
  {
    id: 'add_lead_note',
    category: 'action',
    label: 'Registrar Nota / Resumo na Ficha',
    description: 'Salva automaticamente descobertas sobre orçamento, dores e perfil na ficha do lead.',
    icon: FileText,
    badge: 'Ação CRM'
  },
  {
    id: 'update_lead_score',
    category: 'action',
    label: 'Atualizar Lead Score & Qualificação',
    description: 'Aumenta ou reduz a pontuação de temperatura do lead conforme o interesse demonstrado.',
    icon: Zap,
    badge: 'Lead Scoring'
  },
  {
    id: 'send_tracking_link',
    category: 'action',
    label: 'Enviar Link Rastreável / Checkout',
    description: 'Seleciona e envia o link parametrizado ideal na conversa para medir conversão.',
    icon: Send,
    badge: 'Conversão'
  },
  {
    id: 'assign_to_human',
    category: 'action',
    label: 'Transferir para Atendente Humano',
    description: 'Pausa a automação no lead e notifica um vendedor ou suporte humano.',
    icon: UserCheck,
    badge: 'Transbordo'
  },
  {
    id: 'schedule_followup',
    category: 'action',
    label: 'Agendar Follow-up Automático',
    description: 'Programa um lembrete ou retomada de contato caso o lead peça para falar depois.',
    icon: Clock,
    badge: 'Agenda'
  }
];

const AVAILABLE_TRIGGERS: Array<{ id: AIAgentTriggerType; label: string; desc: string }> = [
  { id: 'whatsapp_message', label: 'Mensagem Recebida no WhatsApp', desc: 'Aciona quando o lead envia mensagem no WhatsApp' },
  { id: 'instagram_dm', label: 'Mensagem no Direct (Instagram)', desc: 'Aciona em interações via Direct' },
  { id: 'lead_created', label: 'Novo Lead Capturado', desc: 'Age assim que o lead entra por Link, Pop-up ou LP' },
  { id: 'stage_changed', label: 'Mudança de Estágio no Funil', desc: 'Aciona quando o lead muda de coluna no CRM' },
  { id: 'inactivity_followup', label: 'Inatividade / Sem Resposta', desc: 'Retoma conversa quando o lead fica em silêncio' },
  { id: 'manual_invocation', label: 'Acionamento Manual / Copiloto', desc: 'Chamado sob demanda pelo vendedor no chat' }
];

const HABLLA_COLUMNS: Array<{
  id: AIAgentActivityColumn;
  title: string;
  subtitle: string;
  dotColor: string;
  headerBg: string;
  badgeColor: string;
}> = [
  {
    id: 'analyzing',
    title: 'Recebido & Contexto',
    subtitle: 'IA lendo perfil e origem UTM',
    dotColor: 'bg-blue-500',
    headerBg: 'border-t-4 border-t-blue-500',
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  {
    id: 'qualifying',
    title: 'Em Qualificação / Negociação',
    subtitle: 'Consultando catálogo e sondando',
    dotColor: 'bg-indigo-500',
    headerBg: 'border-t-4 border-t-indigo-500',
    badgeColor: 'bg-indigo-100 text-indigo-800'
  },
  {
    id: 'scheduled',
    title: 'Follow-up Agendado',
    subtitle: 'Retorno programado pela IA',
    dotColor: 'bg-amber-500',
    headerBg: 'border-t-4 border-t-amber-500',
    badgeColor: 'bg-amber-100 text-amber-800'
  },
  {
    id: 'goal_achieved',
    title: 'Objetivo Concluído (IA)',
    subtitle: 'Card movido / Link enviado',
    dotColor: 'bg-emerald-500',
    headerBg: 'border-t-4 border-t-emerald-500',
    badgeColor: 'bg-emerald-100 text-emerald-800'
  },
  {
    id: 'handed_over',
    title: 'Transbordo p/ Humano',
    subtitle: 'Escalonado p/ equipe comercial',
    dotColor: 'bg-rose-500',
    headerBg: 'border-t-4 border-t-rose-500',
    badgeColor: 'bg-rose-100 text-rose-800'
  }
];

const PROMPT_PRESETS = [
  {
    label: '🎯 SDR Qualificador Comercial',
    prompt: 'Quero uma agente chamada Sofia para recepcionar novos leads no WhatsApp, descobrir a necessidade principal e o orçamento disponível, consultar nosso catálogo de produtos para indicar o plano ideal e, quando o lead demonstrar interesse real, mudar o estágio dele no CRM para Em Negociação e adicionar uma nota com o resumo. Nunca inventar preços fora do catálogo e transferir para humano se o cliente pedir.'
  },
  {
    label: '🚀 Closer & Quebra de Objeções',
    prompt: 'Criar um agente especialista em fechamento de vendas que atue nos leads em negociação. Ele deve consultar o histórico do lead e os produtos, responder dúvidas sobre retorno sobre investimento (ROI), enviar o link rastreável de pagamento quando o cliente decidir comprar e atualizar o Lead Score. Regra: nunca oferecer mais de 10% de desconto sem autorização de um gerente.'
  },
  {
    label: '💳 Recuperador de Boleto / Follow-up',
    prompt: 'Preciso de um agente financeiro empático que entre em contato com leads que geraram pedido mas ainda não concluíram o pagamento. Ele deve perguntar se houve alguma dúvida técnica, reenviar o link oficial se necessário ou agendar um follow-up para a data combinada. Jamais usar tom agressivo ou constrangedor.'
  },
  {
    label: '💎 Agente de Pós-Venda & Upsell',
    prompt: 'Criar uma agente de Sucesso do Cliente que consulte o histórico de compras do lead e as respostas de pesquisa NPS. Se o cliente estiver satisfeito, apresentar o próximo plano superior (Upsell) e mover para Em Negociação. Se o cliente relatar problema ou nota baixa, transferir imediatamente para um especialista humano.'
  }
];

const AVATAR_OPTIONS = ['🤖', '🧠', '🎯', '🚀', '⚡', '💎', '🎧', '💳', '👩‍💼', '👨‍💼', '🦉', '✨'];

export const AIAgentsManager: React.FC<AIAgentsManagerProps> = ({
  currentCompany,
  leads,
  onUpdateLead,
  onNavigateToTab
}) => {
  const { alert, confirm } = useDialog();

  const [activeSubTab, setActiveSubTab] = useState<'habblaud' | 'activities' | 'builder' | 'playground'>('habblaud');
  const [activityViewMode, setActivityViewMode] = useState<'kanban' | 'tasks' | 'timeline'>('kanban');

  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [logs, setLogs] = useState<AIAgentExecutionLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Filtros da Central de Atividades (Estilo Hablla)
  const [filterAgentId, setFilterAgentId] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterChannel, setFilterChannel] = useState<string>('ALL');
  const [searchActivityQuery, setSearchActivityQuery] = useState<string>('');
  const [selectedActivityCard, setSelectedActivityCard] = useState<AIAgentExecutionLog | null>(null);

  // Prompt-to-Agent Magic Creator state
  const [magicPrompt, setMagicPrompt] = useState('');
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false);
  const [showMagicModal, setShowMagicModal] = useState(false);

  // Editor state for currently selected agent
  const [draftAgent, setDraftAgent] = useState<AIAgent | null>(null);
  const [newRuleInput, setNewRuleInput] = useState('');

  // Playground / Simulator state
  const [simLeadId, setSimLeadId] = useState<string>('');
  const [simApplyRealActions, setSimApplyRealActions] = useState<boolean>(true);
  const [simInput, setSimInput] = useState<string>('');
  const [isExecutingTurn, setIsExecutingTurn] = useState<boolean>(false);
  const [simConversation, setSimConversation] = useState<Array<{
    id: string;
    role: 'user' | 'agent';
    text: string;
    timestamp: string;
    executionLog?: AIAgentExecutionLog;
  }>>([]);
  const [inspectedLog, setInspectedLog] = useState<AIAgentExecutionLog | null>(null);

  const sanitizeAgent = (raw: any): AIAgent => ({
    id: String(raw?.id || `agent-${Date.now()}`),
    companyId: String(raw?.companyId || currentCompany.id),
    name: String(raw?.name || 'Novo Agente de IA'),
    roleTitle: String(raw?.roleTitle || 'Consultor & Operador de CRM'),
    avatar: String(raw?.avatar || '🤖'),
    descriptionPrompt: String(raw?.descriptionPrompt || ''),
    goal: String(raw?.goal || 'Atender o lead, buscar informações necessárias e avançar no funil.'),
    personaAndContext: String(raw?.personaAndContext || 'Comunicação consultiva, clara e empática.'),
    rules: Array.isArray(raw?.rules)
      ? raw.rules.map((r: any) => (typeof r === 'string' ? r : String(r?.rule || r?.text || JSON.stringify(r))))
      : [],
    autonomyMode: raw?.autonomyMode === 'copilot' ? 'copilot' : 'autonomous',
    triggers: Array.isArray(raw?.triggers) ? raw.triggers.map((t: any) => String(t) as AIAgentTriggerType) : ['whatsapp_message'],
    enabledTools: Array.isArray(raw?.enabledTools) ? raw.enabledTools.map((t: any) => String(t) as AIAgentToolId) : ['get_lead_profile', 'search_products', 'update_lead_stage', 'add_lead_note'],
    active: raw?.active !== false,
    executionsCount: Number(raw?.executionsCount || 0),
    goalsAchievedCount: Number(raw?.goalsAchievedCount || 0),
    createdAt: String(raw?.createdAt || new Date().toISOString()),
    updatedAt: String(raw?.updatedAt || new Date().toISOString())
  });

  const loadAgentsAndLogs = async () => {
    setIsLoading(true);
    try {
      const [fetchedAgents, fetchedLogs] = await Promise.all([
        fetchAIAgents(currentCompany.id),
        fetchAIAgentLogs(currentCompany.id)
      ]);
      // Garantir blindagem multi-tenant também no cliente: apenas registros da empresa logada
      const cleanAgents = (fetchedAgents || [])
        .filter((a: any) => !a.companyId || a.companyId === currentCompany.id)
        .map(sanitizeAgent);
      const cleanLogs = (fetchedLogs || []).filter(
        (l: any) => !l.companyId || l.companyId === currentCompany.id
      );
      setAgents(cleanAgents);
      setLogs(cleanLogs);
      if (cleanAgents.length > 0) {
        setSelectedAgentId(cleanAgents[0].id);
        setDraftAgent(cleanAgents[0]);
      } else {
        setSelectedAgentId(null);
        setDraftAgent(null);
      }
    } catch (err) {
      console.error('Erro ao carregar agentes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Ao trocar de empresa, limpar imediatamente estados da empresa anterior (isolamento total)
    setSelectedAgentId(null);
    setDraftAgent(null);
    setSelectedActivityCard(null);
    setSimConversation([]);
    setInspectedLog(null);
    setSimLeadId('');
    setFilterAgentId('ALL');
    loadAgentsAndLogs();
  }, [currentCompany.id]);

  useEffect(() => {
    const found = agents.find(a => a.id === selectedAgentId);
    if (found) {
      setDraftAgent(sanitizeAgent(found));
    }
  }, [selectedAgentId, agents]);

  // Isolar estritamente os leads apenas da empresa atual
  const companyLeads = useMemo(() => {
    return leads.filter(l => !l.companyId || l.companyId === currentCompany.id);
  }, [leads, currentCompany.id]);

  const selectedSimLead = useMemo(() => {
    return companyLeads.find(l => l.id === simLeadId) || null;
  }, [companyLeads, simLeadId]);

  // Atividades filtradas para a Central de Atividades (Estilo Hablla)
  const filteredActivities = useMemo(() => {
    return logs.filter((item) => {
      if (filterAgentId !== 'ALL' && item.agentId !== filterAgentId) return false;
      if (filterCategory !== 'ALL' && (item.activityCategory || 'qualification') !== filterCategory) return false;
      if (filterChannel !== 'ALL' && (item.channel || 'whatsapp') !== filterChannel) return false;
      if (searchActivityQuery.trim()) {
        const q = searchActivityQuery.toLowerCase();
        const matchLead = (item.leadName || '').toLowerCase().includes(q);
        const matchTask = (item.taskTitle || '').toLowerCase().includes(q);
        const matchMsg = (item.userMessage || '').toLowerCase().includes(q) || (item.agentReply || '').toLowerCase().includes(q);
        const matchAgent = (item.agentName || '').toLowerCase().includes(q);
        if (!matchLead && !matchTask && !matchMsg && !matchAgent) return false;
      }
      return true;
    });
  }, [logs, filterAgentId, filterCategory, filterChannel, searchActivityQuery]);

  // Métricas resumidas do topo da Central de Atividades
  const activityStats = useMemo(() => {
    const total = logs.length;
    const goalAchieved = logs.filter(l => l.boardColumn === 'goal_achieved').length;
    const inProgress = logs.filter(l => l.boardColumn === 'analyzing' || l.boardColumn === 'qualifying').length;
    const scheduled = logs.filter(l => l.boardColumn === 'scheduled').length;
    const handedOver = logs.filter(l => l.boardColumn === 'handed_over' || l.status === 'handed_over').length;
    const totalActions = logs.reduce((acc, l) => acc + (l.actionsTaken?.length || 0), 0);
    return { total, goalAchieved, inProgress, scheduled, handedOver, totalActions };
  }, [logs]);

  // Mover card de coluna ou alternar conclusão na Central de Atividades
  const handleMoveActivityColumn = async (logItem: AIAgentExecutionLog, newCol: AIAgentActivityColumn) => {
    const optimistic: AIAgentExecutionLog = {
      ...logItem,
      boardColumn: newCol,
      taskCompleted: newCol === 'goal_achieved' ? true : logItem.taskCompleted
    };
    setLogs(prev => prev.map(l => l.id === logItem.id ? optimistic : l));
    if (selectedActivityCard?.id === logItem.id) {
      setSelectedActivityCard(optimistic);
    }
    try {
      await updateAIAgentLog(logItem.id, {
        boardColumn: newCol,
        taskCompleted: optimistic.taskCompleted
      }, currentCompany.id);
    } catch {}
  };

  const handleToggleTaskCompleted = async (logItem: AIAgentExecutionLog) => {
    const nextVal = !logItem.taskCompleted;
    const optimistic: AIAgentExecutionLog = {
      ...logItem,
      taskCompleted: nextVal
    };
    setLogs(prev => prev.map(l => l.id === logItem.id ? optimistic : l));
    if (selectedActivityCard?.id === logItem.id) {
      setSelectedActivityCard(optimistic);
    }
    try {
      await updateAIAgentLog(logItem.id, { taskCompleted: nextVal }, currentCompany.id);
    } catch {}
  };

  // Gerar Agente Completo a partir de Texto Livre (Exclusivo da Empresa Atual)
  const handleGenerateFromText = async () => {
    const promptToUse = magicPrompt.trim() || PROMPT_PRESETS[0].prompt;

    setIsGeneratingBlueprint(true);
    try {
      const blueprint = await generateAIAgentBlueprint(promptToUse, currentCompany.id, currentCompany.name);
      const rawCreated = await createAIAgent({
        ...blueprint,
        companyId: currentCompany.id,
        active: true
      });
      const created = sanitizeAgent(rawCreated);
      setAgents(prev => [created, ...prev]);
      setSelectedAgentId(created.id);
      setDraftAgent(created);
      setMagicPrompt('');
      setShowMagicModal(false);
      setActiveSubTab('builder');
      await alert(
        `O agente "${created.name}" foi estruturado exclusivamente para a empresa "${currentCompany.name}" com objetivo, regras e permissões de CRM isoladas.`,
        'Agente de IA Criado com Sucesso! ✨'
      );
    } catch (err: any) {
      await alert(err.message || 'Falha ao gerar agente', 'Erro ao gerar agente');
    } finally {
      setIsGeneratingBlueprint(false);
    }
  };

  // Criar agente em branco / padrão
  const handleCreateBlankAgent = async () => {
    try {
      const created = await createAIAgent({
        companyId: currentCompany.id,
        name: 'Novo Agente Autônomo',
        roleTitle: 'Consultor & Operador de CRM',
        avatar: '🤖',
        descriptionPrompt: 'Atender leads, consultar produtos e qualificar oportunidades no funil.',
        goal: 'Identificar a necessidade do cliente, responder dúvidas consultando o catálogo e avançar leads qualificados para Em Negociação.',
        personaAndContext: 'Comunicação consultiva, clara e empática. Faz perguntas abertas para entender o contexto antes de agir.',
        rules: [
          'Sempre consultar o catálogo antes de informar preços.',
          'Nunca prometer prazos ou descontos fora da política da empresa.',
          'Transferir para um atendente humano se o cliente solicitar.'
        ],
        autonomyMode: 'autonomous',
        triggers: ['whatsapp_message', 'lead_created'],
        enabledTools: ['get_lead_profile', 'search_products', 'update_lead_stage', 'add_lead_note', 'assign_to_human'],
        active: true
      });
      setAgents(prev => [created, ...prev]);
      setSelectedAgentId(created.id);
      setDraftAgent(created);
      setActiveSubTab('builder');
    } catch (err: any) {
      await alert({ title: 'Erro', message: err.message });
    }
  };

  // Salvar alterações do Agente atual
  const handleSaveAgent = async () => {
    if (!draftAgent) return;
    setIsSaving(true);
    try {
      const updated = await updateAIAgent(draftAgent.id, {
        ...draftAgent,
        companyId: currentCompany.id
      });
      setAgents(prev => prev.map(a => a.id === updated.id ? updated : a));
      await alert({
        title: 'Agente Salvo!',
        message: `As configurações, objetivo, regras e permissões de "${updated.name}" foram atualizadas na empresa ${currentCompany.name}.`
      });
    } catch (err: any) {
      await alert({ title: 'Erro ao salvar', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleAgentActive = async (agent: AIAgent) => {
    const updated = await updateAIAgent(agent.id, { ...agent, companyId: currentCompany.id, active: !agent.active });
    setAgents(prev => prev.map(a => a.id === updated.id ? updated : a));
  };

  const handleDeleteAgent = async (agent: AIAgent) => {
    const ok = await confirm({
      title: 'Excluir Agente de IA',
      message: `Tem certeza que deseja excluir o agente "${agent.name}" da empresa "${currentCompany.name}"?`,
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar'
    });
    if (!ok) return;
    await deleteAIAgent(agent.id, currentCompany.id);
    const remaining = agents.filter(a => a.id !== agent.id);
    setAgents(remaining);
    if (selectedAgentId === agent.id) {
      setSelectedAgentId(remaining[0]?.id || null);
    }
  };

  const toggleTool = (toolId: AIAgentToolId) => {
    if (!draftAgent) return;
    const exists = draftAgent.enabledTools.includes(toolId);
    const updatedTools = exists
      ? draftAgent.enabledTools.filter(t => t !== toolId)
      : [...draftAgent.enabledTools, toolId];
    setDraftAgent({ ...draftAgent, enabledTools: updatedTools });
  };

  const toggleTrigger = (triggerId: AIAgentTriggerType) => {
    if (!draftAgent) return;
    const exists = draftAgent.triggers.includes(triggerId);
    const updatedTriggers = exists
      ? draftAgent.triggers.filter(t => t !== triggerId)
      : [...draftAgent.triggers, triggerId];
    setDraftAgent({ ...draftAgent, triggers: updatedTriggers });
  };

  const handleAddRule = () => {
    if (!draftAgent || !newRuleInput.trim()) return;
    setDraftAgent({
      ...draftAgent,
      rules: [...(draftAgent.rules || []), newRuleInput.trim()]
    });
    setNewRuleInput('');
  };

  const handleRemoveRule = (index: number) => {
    if (!draftAgent) return;
    setDraftAgent({
      ...draftAgent,
      rules: draftAgent.rules.filter((_, i) => i !== index)
    });
  };

  // Executar Turno no Simulador / Playground
  const handleRunSimulationMessage = async (customText?: string) => {
    const messageToSend = (customText ?? simInput).trim();
    if (!messageToSend || !draftAgent) return;

    await updateAIAgent(draftAgent.id, draftAgent).catch(() => null);

    const userMsgEntry = {
      id: `msg-user-${Date.now()}`,
      role: 'user' as const,
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    setSimConversation(prev => [...prev, userMsgEntry]);
    if (!customText) setSimInput('');
    setIsExecutingTurn(true);

    try {
      const historyPayload = simConversation.map(m => ({ role: m.role, text: m.text }));
      const result = await executeAIAgentTurn(draftAgent.id, {
        companyId: currentCompany.id,
        leadId: simLeadId || undefined,
        userMessage: messageToSend,
        triggerType: 'whatsapp_message',
        conversationHistory: historyPayload,
        applyRealActions: simApplyRealActions
      });

      const agentMsgEntry = {
        id: `msg-agent-${Date.now()}`,
        role: 'agent' as const,
        text: result.executionLog.agentReply,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        executionLog: result.executionLog
      };

      setSimConversation(prev => [...prev, agentMsgEntry]);
      setInspectedLog(result.executionLog);
      setLogs(prev => [result.executionLog, ...prev]);

      if (result.updatedLead && onUpdateLead && simLeadId) {
        await onUpdateLead(simLeadId, {
          stage: result.updatedLead.stage,
          score: result.updatedLead.score,
          notes: result.updatedLead.notes,
          botActive: result.updatedLead.botActive
        });
      }

      setAgents(prev => prev.map(a => a.id === draftAgent.id ? {
        ...a,
        executionsCount: (a.executionsCount || 0) + 1,
        goalsAchievedCount: (a.goalsAchievedCount || 0) + (result.executionLog.actionsTaken.length > 0 ? 1 : 0)
      } : a));
    } catch (err: any) {
      await alert({ title: 'Erro na execução do Agente', message: err.message });
    } finally {
      setIsExecutingTurn(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Topo: Conceito de Agentes Autônomos Orientados a Objetivos */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-2xl p-6 text-white shadow-xl border border-indigo-800/50 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <BrainCircuit className="w-3.5 h-3.5" />
              Agentes de IA Autônomos & Central de Atividades (Hablla Style)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Central de Agentes de IA & Operação Autônoma
            </h1>
            <p className="text-sm text-indigo-100/90 leading-relaxed">
              Crie seus próprios agentes descrevendo em texto o que cada um deve fazer e acompanhe em tempo real todas as <strong>atividades, qualificações, tarefas agendadas, movimentações no CRM e transbordos</strong> em um painel unificado no estilo Hablla.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setShowMagicModal(true)}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              Criar Agente por Texto
            </button>
            <button
              onClick={() => setActiveSubTab('playground')}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/15 flex items-center gap-2 transition cursor-pointer"
            >
              <Play className="w-4 h-4 text-emerald-400" />
              Simulador Ao Vivo
            </button>
          </div>
        </div>
      </div>

      {/* Navegação Principal de Sub-Abas */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('habblaud')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'habblaud'
                ? 'bg-slate-900 text-amber-300 border border-amber-500/40 shadow-md'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>🏢</span>
            Escritório {currentCompany.name} (2D Ao Vivo)
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
              Online
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('activities')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'activities'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Quadro & Lista de Atividades
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeSubTab === 'activities'
                ? 'bg-white/20 text-white'
                : 'bg-indigo-100 text-indigo-800'
            }`}>
              {logs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('builder')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'builder'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Criador & Regras dos Agentes ({agents.length})
          </button>

          <button
            onClick={() => setActiveSubTab('playground')}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'playground'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Play className="w-4 h-4" />
            Simulador & Raio-X Ao Vivo
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMagicModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Gerar Agente em Texto
          </button>
          <button
            onClick={handleCreateBlankAgent}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Novo Agente
          </button>
        </div>
      </div>

      {/* ========================================================================== */}
      {/* SUB-ABA 0: ESCRITÓRIO VIRTUAL HABBLAUD (2D PIXEL ART IGUAL AO PRINT)       */}
      {/* ========================================================================== */}
      {activeSubTab === 'habblaud' && (
        <HabblaudOfficeView
          agents={agents}
          logs={logs}
          currentCompany={currentCompany}
          leads={companyLeads}
          selectedAgentId={selectedAgentId}
          onSelectAgent={(id) => setSelectedAgentId(id)}
          onOpenMagicCreator={() => setShowMagicModal(true)}
          onOpenAgentConfig={(id) => {
            setSelectedAgentId(id);
            setActiveSubTab('builder');
          }}
          onUpdateAgent={async (updatedAgent) => {
            const saved = await updateAIAgent(updatedAgent.id, {
              ...updatedAgent,
              companyId: currentCompany.id
            });
            setAgents(prev => prev.map(a => a.id === saved.id ? sanitizeAgent(saved) : a));
          }}
          onQuickExecuteAgent={async (agentId, promptText, leadId) => {
            setSelectedAgentId(agentId);
            if (leadId !== undefined) setSimLeadId(leadId);
            const res = await executeAIAgentTurn(agentId, {
              companyId: currentCompany.id,
              leadId: leadId || undefined,
              userMessage: promptText,
              triggerType: 'whatsapp_message',
              applyRealActions: true
            });
            setLogs(prev => [res.executionLog, ...prev]);
            setInspectedLog(res.executionLog);
            if (res.updatedLead && onUpdateLead && leadId) {
              await onUpdateLead(leadId, {
                stage: res.updatedLead.stage,
                score: res.updatedLead.score,
                notes: res.updatedLead.notes,
                botActive: res.updatedLead.botActive
              });
            }
          }}
          isExecuting={isExecutingTurn}
          onSelectLogCard={(log) => setSelectedActivityCard(log)}
        />
      )}

      {/* ========================================================================== */}
      {/* SUB-ABA 1: CENTRAL DE ATIVIDADES DOS AGENTES (FORMATO HABLLA)              */}
      {/* ========================================================================== */}
      {activeSubTab === 'activities' && (
        <div className="space-y-5">
          {/* KPIs Superiores da Operação dos Agentes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Agentes em Operação</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {agents.filter(a => a.active).length} <span className="text-xs font-normal text-slate-400">/ {agents.length}</span>
              </p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">Atendendo 24/7 nos canais</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Qualificando Agora</span>
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-2xl font-black text-indigo-700 mt-1">{activityStats.inProgress}</p>
              <p className="text-[11px] text-slate-500 mt-1">Analisando contexto & catálogo</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Follow-ups Agendados</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-600 mt-1">{activityStats.scheduled}</p>
              <p className="text-[11px] text-slate-500 mt-1">Retornos programados pela IA</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Objetivos Concluídos</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-600 mt-1">{activityStats.goalAchieved}</p>
              <p className="text-[11px] text-slate-500 mt-1">{activityStats.totalActions} ações executadas no CRM</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>Transbordos (Humano)</span>
                <UserCheck className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-black text-rose-600 mt-1">{activityStats.handedOver}</p>
              <p className="text-[11px] text-slate-500 mt-1">Escalonados p/ vendedor</p>
            </div>
          </div>

          {/* Barra de Filtros e Alternador de Visão (Kanban / Lista de Tarefas / Timeline) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Busca por Lead, Tarefa ou Mensagem */}
              <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchActivityQuery}
                  onChange={(e) => setSearchActivityQuery(e.target.value)}
                  placeholder="Buscar lead, atividade ou ação..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-indigo-600 focus:outline-none"
                />
              </div>

              {/* Filtro por Agente */}
              <select
                value={filterAgentId}
                onChange={(e) => setFilterAgentId(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 focus:border-indigo-600 focus:outline-none"
              >
                <option value="ALL">🤖 Todos os Agentes ({agents.length})</option>
                {agents.map(ag => (
                  <option key={ag.id} value={ag.id}>{ag.avatar} {ag.name}</option>
                ))}
              </select>

              {/* Filtro por Tipo de Atividade */}
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 focus:border-indigo-600 focus:outline-none"
              >
                <option value="ALL">⚡ Todas as Atividades</option>
                <option value="qualification">🎯 Qualificação & Sondagem</option>
                <option value="closing">🚀 Fechamento & Checkout</option>
                <option value="followup">⏰ Follow-up Agendado</option>
                <option value="human_handover">🤝 Transbordo p/ Humano</option>
              </select>

              {/* Filtro por Canal */}
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 focus:border-indigo-600 focus:outline-none"
              >
                <option value="ALL">📱 Todos os Canais</option>
                <option value="whatsapp">WhatsApp Oficial</option>
                <option value="instagram">Instagram Direct</option>
              </select>
            </div>

            {/* Seletor de Formato de Visualização (Hablla Views) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setActivityViewMode('kanban')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activityViewMode === 'kanban'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Quadro Kanban
              </button>
              <button
                type="button"
                onClick={() => setActivityViewMode('tasks')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activityViewMode === 'tasks'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListChecks className="w-3.5 h-3.5" />
                Lista de Atividades
              </button>
              <button
                type="button"
                onClick={() => setActivityViewMode('timeline')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  activityViewMode === 'timeline'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Feed Ao Vivo
              </button>
            </div>
          </div>

          {/* MODO 1: QUADRO KANBAN DE ATIVIDADES DOS AGENTES (FORMATO HABLLA) */}
          {activityViewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-start overflow-x-auto pb-2">
              {HABLLA_COLUMNS.map((col) => {
                const colItems = filteredActivities.filter(
                  (item) => (item.boardColumn || 'qualifying') === col.id
                );

                return (
                  <div
                    key={col.id}
                    className={`bg-slate-100/90 rounded-2xl border border-slate-200/90 flex flex-col min-h-[540px] ${col.headerBg}`}
                  >
                    {/* Cabeçalho da Coluna Hablla */}
                    <div className="p-3.5 bg-white rounded-t-xl border-b border-slate-200/80 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${col.dotColor}`} />
                          <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                            {col.title}
                          </h3>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{col.subtitle}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${col.badgeColor}`}>
                        {colItems.length}
                      </span>
                    </div>

                    {/* Lista de Cards da Coluna */}
                    <div className="p-2.5 space-y-2.5 flex-1">
                      {colItems.length === 0 ? (
                        <div className="h-44 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center p-4 text-center text-slate-400 text-xs">
                          Nenhuma atividade nesta etapa
                        </div>
                      ) : (
                        colItems.map((card) => (
                          <div
                            key={card.id}
                            onClick={() => setSelectedActivityCard(card)}
                            className="bg-white rounded-xl border border-slate-200/90 hover:border-indigo-400 p-3.5 shadow-2xs hover:shadow-md transition cursor-pointer space-y-2.5 group"
                          >
                            {/* Linha 1: Canal + Prioridade + Tempo */}
                            <div className="flex items-center justify-between gap-1.5">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                card.channel === 'instagram'
                                  ? 'bg-pink-50 text-pink-700 border border-pink-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {card.channel === 'instagram' ? '📸 Direct' : '💬 WhatsApp'}
                              </span>

                              <div className="flex items-center gap-1">
                                {card.priority === 'high' && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                                    Prioridade Alta
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-400">
                                  {new Date(card.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>

                            {/* Linha 2: Nome do Lead + Estágio + Score */}
                            <div>
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-black text-slate-900 group-hover:text-indigo-600 transition truncate">
                                  {card.leadName || 'Visitante'}
                                </h4>
                                {card.leadScore && (
                                  <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">
                                    {card.leadScore} pts
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                {card.leadPhone && <span>{card.leadPhone}</span>}
                                {card.leadStage && (
                                  <span className="px-1.5 py-0.2 bg-slate-100 rounded text-slate-700 font-semibold">
                                    {card.leadStage}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Linha 3: Título da Atividade / Tarefa do Agente */}
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/70">
                              <div className="flex items-start gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleTaskCompleted(card);
                                  }}
                                  className="mt-0.5 text-indigo-600 shrink-0 cursor-pointer"
                                  title="Marcar atividade como concluída"
                                >
                                  {card.taskCompleted ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </button>
                                <p className={`text-[11px] font-bold leading-snug ${
                                  card.taskCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                                }`}>
                                  {card.taskTitle || 'Atendimento e qualificação contextual'}
                                </p>
                              </div>
                            </div>

                            {/* Linha 4: Resumo da Mensagem e Ações no CRM */}
                            {card.userMessage && (
                              <p className="text-[11px] text-slate-600 line-clamp-2 italic">
                                "{card.userMessage}"
                              </p>
                            )}

                            {/* Pílulas de Ferramentas / Ações Executadas */}
                            {card.actionsTaken && card.actionsTaken.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {card.actionsTaken.slice(0, 2).map((act, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 truncate max-w-full"
                                  >
                                    <Zap className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                    <span className="truncate">{act}</span>
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Rodapé do Card: Agente Responsável + Passos Cognitivos */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-xs shrink-0">
                                  {card.agentAvatar || '🤖'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-700 truncate">
                                  {card.agentName}
                                </span>
                              </div>

                              <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5 shrink-0">
                                {card.steps?.length || 3} passos
                                <ArrowUpRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODO 2: LISTA DE TAREFAS E ATIVIDADES DOS AGENTES (HABLLA TASKS TABLE) */}
          {activityViewMode === 'tasks' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Atividade / Tarefa Gerada pela IA</th>
                      <th className="py-3.5 px-4">Lead / Oportunidade</th>
                      <th className="py-3.5 px-4">Agente Responsável</th>
                      <th className="py-3.5 px-4">Etapa no Quadro</th>
                      <th className="py-3.5 px-4">Ações Executadas no CRM</th>
                      <th className="py-3.5 px-4 text-right">Inspeção</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs">
                    {filteredActivities.map((item) => {
                      const colMeta = HABLLA_COLUMNS.find(c => c.id === (item.boardColumn || 'qualifying')) || HABLLA_COLUMNS[1];
                      return (
                        <tr
                          key={item.id}
                          onClick={() => setSelectedActivityCard(item)}
                          className="hover:bg-indigo-50/40 transition cursor-pointer"
                        >
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleToggleTaskCompleted(item)}
                              className="inline-flex items-center gap-1.5 font-bold cursor-pointer"
                            >
                              {item.taskCompleted ? (
                                <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] flex items-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Concluída
                                </span>
                              ) : (
                                <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5" /> Pendente
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="font-bold text-slate-900">{item.taskTitle || 'Qualificação Contextual'}</p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">"{item.userMessage}"</p>
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{item.leadName || 'Visitante'}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                                {item.leadStage || 'Contatado'}
                              </span>
                              {item.leadScore && (
                                <span className="text-[10px] font-bold text-indigo-600">{item.leadScore} pts</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{item.agentAvatar || '🤖'}</span>
                              <span className="font-semibold text-slate-800">{item.agentName}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={item.boardColumn || 'qualifying'}
                              onChange={(e) => handleMoveActivityColumn(item, e.target.value as AIAgentActivityColumn)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border border-slate-200 ${colMeta.badgeColor}`}
                            >
                              {HABLLA_COLUMNS.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {(item.actionsTaken || []).map((act, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold"
                                >
                                  ⚡ {act}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedActivityCard(item)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs cursor-pointer"
                            >
                              Abrir Raio-X
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODO 3: FEED / TIMELINE AO VIVO PASSO A PASSO */}
          {activityViewMode === 'timeline' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs divide-y divide-slate-200">
              {filteredActivities.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedActivityCard(log)}
                  className="p-5 hover:bg-slate-50/80 transition cursor-pointer space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-lg">
                        {log.agentAvatar || '🤖'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-xs sm:text-sm">{log.agentName}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-bold text-indigo-700">{log.taskTitle}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Lead: <strong>{log.leadName}</strong> ({log.leadStage || 'Em Atendimento'})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.durationMs && (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                          ⚡ {(log.durationMs / 1000).toFixed(1)}s
                        </span>
                      )}
                      <span className="text-xs text-slate-400">
                        {new Date(log.createdAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* Mini Timeline dos Passos Cognitivos do Agente */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                    {(log.steps || []).map((st, idx) => (
                      <div key={st.id || idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-black uppercase text-indigo-600">
                            {idx + 1}. {st.type === 'data_lookup' ? 'Busca Dados' : st.type === 'rule_check' ? 'Regra' : st.type === 'action_executed' ? 'Ação CRM' : 'Contexto'}
                          </span>
                          {st.toolId && (
                            <code className="text-[9px] bg-slate-200/80 px-1.5 py-0.5 rounded text-slate-700">
                              {st.toolId}
                            </code>
                          )}
                        </div>
                        <p className="font-bold text-slate-800 text-[11px]">{st.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{st.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================== */}
      {/* SUB-ABA 2: CONFIGURADOR DE AGENTES, OBJETIVO, REGRAS E FERRAMENTAS         */}
      {/* ========================================================================== */}
      {activeSubTab === 'builder' && (
        <div className="space-y-6">
          {/* Criador Rápido por Texto Livre (Inline Prompt-to-Agent Box) */}
          <div className="bg-white rounded-2xl border border-indigo-200 shadow-sm p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900">
                    Gerador de Agente por Descrição em Texto (Prompt-to-Agent)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Descreva com suas palavras o que o agente deve fazer, quais dados deve consultar e quais limites respeitar:
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMagicPrompt(preset.prompt)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <textarea
                value={magicPrompt}
                onChange={(e) => setMagicPrompt(e.target.value)}
                rows={2}
                placeholder="Ex: Quero um agente que atenda leads de planos de saúde, consulte a tabela de produtos para informar faixas de preço, pergunte quantas vidas são e, se tiver CNPJ, mova para Em Negociação no CRM e avise o time comercial..."
                className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="button"
                disabled={isGeneratingBlueprint}
                onClick={handleGenerateFromText}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 shadow-md cursor-pointer"
              >
                {isGeneratingBlueprint ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Estruturando Agente...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Gerar Agente com IA
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Coluna Esquerda: Lista de Agentes */}
            <div className="lg:col-span-4 space-y-3">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Agentes de IA da Empresa ({agents.length})
                </h3>
              </div>

              {agents.map((agent) => {
                const isSelected = agent.id === selectedAgentId;
                const readToolsCount = (agent.enabledTools || []).filter(id =>
                  AVAILABLE_TOOLS.find(t => t.id === id)?.category === 'read'
                ).length;
                const actionToolsCount = (agent.enabledTools || []).filter(id =>
                  AVAILABLE_TOOLS.find(t => t.id === id)?.category === 'action'
                ).length;

                return (
                  <div
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                          {agent.avatar || '🤖'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{agent.name}</h4>
                          <p className="text-xs text-slate-500">{agent.roleTitle}</p>
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              agent.active
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}>
                              {agent.active ? '● Ativo' : '○ Pausado'}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                              {agent.autonomyMode === 'autonomous' ? '⚡ Autônomo' : '🤝 Copiloto'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleAgentActive(agent);
                        }}
                        title={agent.active ? 'Pausar Agente' : 'Ativar Agente'}
                        className={`w-9 h-5 rounded-full transition relative shrink-0 cursor-pointer ${
                          agent.active ? 'bg-emerald-500' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`block w-3.5 h-3.5 rounded-full bg-white transition transform ${
                            agent.active ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 mt-3 line-clamp-2 bg-white/80 p-2 rounded-xl border border-slate-200/70">
                      <strong>Objetivo:</strong> {agent.goal}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-500">
                      <span>🔍 {readToolsCount} buscas • ⚡ {actionToolsCount} ações</span>
                      <span>🛡️ {(agent.rules || []).length} regras</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coluna Direita: Editor Completo do Agente Selecionado */}
            <div className="lg:col-span-8">
              {draftAgent ? (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-2xl">
                        {draftAgent.avatar}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900">{draftAgent.name}</h3>
                        <p className="text-xs text-slate-500">{draftAgent.roleTitle}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('playground')}
                        className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1.5 border border-indigo-200 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Simular Agente
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteAgent(draftAgent)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-slate-200 cursor-pointer"
                        title="Excluir Agente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={handleSaveAgent}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Salvando...' : 'Salvar Agente'}
                      </button>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nome do Agente
                        </label>
                        <input
                          type="text"
                          value={draftAgent.name}
                          onChange={(e) => setDraftAgent({ ...draftAgent, name: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Papel / Especialidade
                        </label>
                        <input
                          type="text"
                          value={draftAgent.roleTitle}
                          onChange={(e) => setDraftAgent({ ...draftAgent, roleTitle: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Ícone / Avatar do Agente
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {AVATAR_OPTIONS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setDraftAgent({ ...draftAgent, avatar: emoji })}
                              className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition cursor-pointer ${
                                draftAgent.avatar === emoji
                                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs scale-105'
                                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          Modo de Decisão e Autonomia
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setDraftAgent({ ...draftAgent, autonomyMode: 'autonomous' })}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                              draftAgent.autonomyMode === 'autonomous'
                                ? 'bg-indigo-50 border-indigo-500 text-indigo-950'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <div className="text-xs font-bold flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-indigo-600" />
                              100% Autônomo
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Decide e executa ações no CRM sozinho dentro das regras.
                            </p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setDraftAgent({ ...draftAgent, autonomyMode: 'copilot' })}
                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                              draftAgent.autonomyMode === 'copilot'
                                ? 'bg-amber-50 border-amber-500 text-amber-950'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <div className="text-xs font-bold flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-amber-600" />
                              Modo Copiloto
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              Busca dados e sugere a resposta/ação para o atendente.
                            </p>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Bloco 2: Objetivo Principal & Interpretação de Contexto */}
                    <div className="space-y-4 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-black text-indigo-950 uppercase tracking-wider mb-1">
                          <Target className="w-4 h-4 text-indigo-600" />
                          1. Objetivo Principal do Agente (Onde ele deve chegar)
                        </label>
                        <textarea
                          rows={2}
                          value={draftAgent.goal}
                          onChange={(e) => setDraftAgent({ ...draftAgent, goal: e.target.value })}
                          className="w-full rounded-xl border border-indigo-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-black text-indigo-950 uppercase tracking-wider mb-1">
                          <BrainCircuit className="w-4 h-4 text-indigo-600" />
                          2. Como Interpretar o Contexto & Postura (Instruções em Texto)
                        </label>
                        <textarea
                          rows={3}
                          value={draftAgent.personaAndContext}
                          onChange={(e) => setDraftAgent({ ...draftAgent, personaAndContext: e.target.value })}
                          className="w-full rounded-xl border border-indigo-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Bloco 3: Regras e Limites Inegociáveis */}
                    <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/80 space-y-3">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-black text-amber-950 uppercase tracking-wider">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          3. Regras & Limites Inegociáveis (Guardrails)
                        </label>
                      </div>

                      <div className="space-y-2">
                        {(draftAgent.rules || []).map((rule, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 bg-white px-3.5 py-2.5 rounded-xl border border-amber-200 text-xs sm:text-sm text-slate-800 shadow-2xs"
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <span>{rule}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveRule(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newRuleInput}
                          onChange={(e) => setNewRuleInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddRule();
                            }
                          }}
                          placeholder="Adicionar nova regra... Ex: Nunca conceder mais de 10% de desconto sem aprovação humana"
                          className="flex-1 rounded-xl border border-amber-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-amber-600 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleAddRule}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer"
                        >
                          + Adicionar Regra
                        </button>
                      </div>
                    </div>

                    {/* Bloco 4: Ferramentas de Busca de Informações */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wider">
                        <Search className="w-4 h-4 text-blue-600" />
                        4. Informações que o Agente Pode Buscar no Sistema (Leitura)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {AVAILABLE_TOOLS.filter(t => t.category === 'read').map((tool) => {
                          const Icon = tool.icon;
                          const enabled = draftAgent.enabledTools.includes(tool.id);
                          return (
                            <div
                              key={tool.id}
                              onClick={() => toggleTool(tool.id)}
                              className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                                enabled
                                  ? 'bg-blue-50/60 border-blue-500 shadow-2xs'
                                  : 'bg-slate-50/60 border-slate-200 opacity-75 hover:opacity-100'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                enabled ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-slate-900">{tool.label}</span>
                                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                                    enabled ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
                                  }`}>
                                    {enabled && <Check className="w-3 h-3" />}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tool.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bloco 5: Ferramentas de Ação no Sistema */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wider">
                        <Zap className="w-4 h-4 text-emerald-600" />
                        5. Ações que o Agente Pode Executar no Sistema (Escrita / Atuação)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {AVAILABLE_TOOLS.filter(t => t.category === 'action').map((tool) => {
                          const Icon = tool.icon;
                          const enabled = draftAgent.enabledTools.includes(tool.id);
                          return (
                            <div
                              key={tool.id}
                              onClick={() => toggleTool(tool.id)}
                              className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                                enabled
                                  ? 'bg-emerald-50/60 border-emerald-500 shadow-2xs'
                                  : 'bg-slate-50/60 border-slate-200 opacity-75 hover:opacity-100'
                              }`}
                            >
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                enabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                              }`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold text-slate-900">{tool.label}</span>
                                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                                    enabled ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                                  }`}>
                                    {enabled && <Check className="w-3 h-3" />}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{tool.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Bloco 6: Gatilhos de Ativação */}
                    <div className="space-y-3 pt-2 border-t border-slate-200">
                      <label className="block text-xs font-black text-slate-900 uppercase tracking-wider">
                        6. Quando este Agente é Acionado (Eventos & Canais)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {AVAILABLE_TRIGGERS.map((trig) => {
                          const active = draftAgent.triggers.includes(trig.id);
                          return (
                            <button
                              key={trig.id}
                              type="button"
                              onClick={() => toggleTrigger(trig.id)}
                              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                                active
                                  ? 'bg-slate-900 text-white border-slate-900'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold">{trig.label}</span>
                                {active && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                              </div>
                              <p className={`text-[10px] mt-1 ${active ? 'text-slate-300' : 'text-slate-500'}`}>
                                {trig.desc}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================== */}
      {/* SUB-ABA 3: SIMULADOR & RAIO-X DE DECISÃO AO VIVO                           */}
      {/* ========================================================================== */}
      {activeSubTab === 'playground' && draftAgent && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{draftAgent.avatar}</span>
                  <div>
                    <h3 className="text-sm font-black">{draftAgent.name}</h3>
                    <p className="text-[11px] text-slate-300">
                      Objetivo: {draftAgent.goal.slice(0, 85)}{draftAgent.goal.length > 85 ? '...' : ''}
                    </p>
                  </div>
                </div>

                <select
                  value={draftAgent.id}
                  onChange={(e) => setSelectedAgentId(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2 font-semibold"
                >
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.avatar} {a.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Simular Atendimento com Lead do CRM:
                  </label>
                  <select
                    value={simLeadId}
                    onChange={(e) => setSimLeadId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 text-white text-xs rounded-xl px-3 py-2"
                  >
                    <option value="">👤 Lead Visitante (Modo Simulação Livre)</option>
                    {companyLeads.slice(0, 30).map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} — [{l.stage}] ({l.utmSource || l.source || 'Direto'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-xs text-slate-200 bg-slate-800/90 px-3 py-2 rounded-xl border border-slate-700 w-full cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simApplyRealActions}
                      onChange={(e) => setSimApplyRealActions(e.target.checked)}
                      className="rounded text-emerald-500"
                    />
                    <span>Executar ações reais e enviar p/ Central Hablla</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-b border-slate-200">
              <p className="text-[11px] font-bold text-slate-500 mb-2">
                Clique para testar como o Agente busca dados, checa regras e gera um card na Central de Atividades:
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRunSimulationMessage('Olá! Quais são os planos e preços que vocês têm disponíveis hoje?')}
                  className="text-[11px] bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                >
                  🔍 Testar Busca no Catálogo
                </button>
                <button
                  type="button"
                  onClick={() => handleRunSimulationMessage('Gostei bastante! Quero fechar agora no PIX, pode me mandar o link de pagamento?')}
                  className="text-[11px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                >
                  ⚡ Testar Ação: Fechar e Mover no CRM
                </button>
                <button
                  type="button"
                  onClick={() => handleRunSimulationMessage('Só fecho se você me der 50% de desconto agora, metade do preço.')}
                  className="text-[11px] bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-700 border border-slate-200 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                >
                  🛡️ Testar Regra/Limite (50% de Desconto)
                </button>
                <button
                  type="button"
                  onClick={() => handleRunSimulationMessage('Preciso falar com um atendente humano urgente, por favor.')}
                  className="text-[11px] bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer"
                >
                  🤝 Testar Transbordo p/ Humano
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4 min-h-[360px] max-h-[460px] overflow-y-auto bg-slate-100/70">
              {simConversation.length === 0 ? (
                <div className="text-center py-14 space-y-2 text-slate-400">
                  <BrainCircuit className="w-10 h-10 mx-auto text-indigo-400 opacity-75" />
                  <p className="text-sm font-bold text-slate-600">
                    Envie uma mensagem ou escolha um cenário acima
                  </p>
                  <p className="text-xs max-w-md mx-auto">
                    Cada execução aqui alimenta automaticamente a <strong>Central de Atividades (Hablla)</strong> e mostra o Raio-X de raciocínio ao lado.
                  </p>
                </div>
              ) : (
                simConversation.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm whitespace-pre-line shadow-xs ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}
                    >
                      {msg.role === 'agent' && (
                        <div className="flex items-center justify-between gap-3 mb-1 pb-1 border-b border-slate-100">
                          <span className="text-[11px] font-black text-indigo-600">
                            {draftAgent.avatar} {draftAgent.name}
                          </span>
                          {msg.executionLog && (
                            <button
                              type="button"
                              onClick={() => setInspectedLog(msg.executionLog!)}
                              className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                            >
                              Ver raciocínio ({msg.executionLog.steps.length} passos)
                            </button>
                          )}
                        </div>
                      )}
                      {msg.text}
                    </div>

                    {msg.executionLog && msg.executionLog.actionsTaken.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1.5 max-w-[85%]">
                        {msg.executionLog.actionsTaken.map((act, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-bold"
                          >
                            <Zap className="w-3 h-3 text-emerald-600 shrink-0" />
                            {act}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))
              )}

              {isExecutingTurn && (
                <div className="flex items-center gap-2 text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-3.5 py-2.5 rounded-xl w-fit animate-pulse">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>O agente está interpretando o contexto, consultando ferramentas e verificando regras...</span>
                </div>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleRunSimulationMessage();
              }}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                placeholder="Digite como se fosse o cliente conversando com o agente..."
                className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm focus:border-indigo-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isExecutingTurn || !simInput.trim()}
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Enviar
              </button>
            </form>
          </div>

          <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-black">Raio-X de Decisão do Agente</h3>
                  <p className="text-[11px] text-slate-400">
                    Como o agente interpretou o contexto e decidiu agir
                  </p>
                </div>
              </div>
            </div>

            {!inspectedLog ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs">
                  Assim que o agente processar uma mensagem, você verá aqui cada busca no banco de dados, validação de regra e ação disparada no CRM.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {inspectedLog.steps.map((step, index) => (
                  <div
                    key={step.id || index}
                    className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {index + 1}. {step.type}
                      </span>
                      {step.toolId && (
                        <code className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                          tool: {step.toolId}()
                        </code>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-white">{step.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{step.detail}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================== */}
      {/* DRAWER / PAINEL LATERAL DE DETALHES DO CARD (ESTILO HABLLA STUDIO)         */}
      {/* ========================================================================== */}
      {selectedActivityCard && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl border-l border-slate-200 flex flex-col overflow-hidden animate-slide-in-right">
            {/* Topo do Drawer */}
            <div className="p-5 bg-slate-900 text-white flex items-start justify-between gap-4 shrink-0">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-[11px] font-bold">
                    {selectedActivityCard.agentAvatar || '🤖'} {selectedActivityCard.agentName}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(selectedActivityCard.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">
                  {selectedActivityCard.taskTitle || 'Atividade Executada pelo Agente'}
                </h3>
                <p className="text-xs text-slate-300">
                  Lead vinculado: <strong>{selectedActivityCard.leadName}</strong> ({selectedActivityCard.leadPhone || 'Sem telefone'}) • Estágio: <strong>{selectedActivityCard.leadStage || 'Contatado'}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedActivityCard(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Controle Rápido do Card Hablla */}
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Etapa na Central:</span>
                <select
                  value={selectedActivityCard.boardColumn || 'qualifying'}
                  onChange={(e) => handleMoveActivityColumn(selectedActivityCard, e.target.value as AIAgentActivityColumn)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800"
                >
                  {HABLLA_COLUMNS.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleTaskCompleted(selectedActivityCard)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                    selectedActivityCard.taskCompleted
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedActivityCard.taskCompleted ? 'Atividade Concluída' : 'Marcar como Concluída'}
                </button>
                {onNavigateToTab && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedActivityCard(null);
                      onNavigateToTab('chat');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Abrir no Chat ao Vivo
                  </button>
                )}
              </div>
            </div>

            {/* Corpo do Drawer com Conversa + Passos do Agente + Ações no CRM */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {/* Tags da Atividade */}
              {selectedActivityCard.tags && selectedActivityCard.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedActivityCard.tags.map((tg, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200"
                    >
                      #{tg}
                    </span>
                  ))}
                </div>
              )}

              {/* Interação: Mensagem do Cliente & Resposta do Agente */}
              <div className="space-y-3 bg-slate-100 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Interação Registrada no Canal
                </h4>
                {selectedActivityCard.userMessage && (
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      👤 Cliente ({selectedActivityCard.leadName}):
                    </span>
                    {selectedActivityCard.userMessage}
                  </div>
                )}
                <div className="bg-indigo-600 text-white p-3.5 rounded-xl text-xs sm:text-sm whitespace-pre-line shadow-xs">
                  <span className="text-[10px] font-bold text-indigo-200 uppercase block mb-1">
                    {selectedActivityCard.agentAvatar || '🤖'} Resposta Autônoma ({selectedActivityCard.agentName}):
                  </span>
                  {selectedActivityCard.agentReply}
                </div>
              </div>

              {/* Ações Executadas no CRM */}
              {selectedActivityCard.actionsTaken && selectedActivityCard.actionsTaken.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-emerald-600" />
                    Ações Executadas Automaticamente no Sistema
                  </h4>
                  <div className="space-y-1.5">
                    {selectedActivityCard.actionsTaken.map((act, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raio-X Cognitivo Passo a Passo */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <BrainCircuit className="w-4 h-4 text-indigo-600" />
                  Raciocínio Contextual & Ferramentas Consultadas ({selectedActivityCard.steps?.length || 0} etapas)
                </h4>
                <div className="space-y-2.5">
                  {(selectedActivityCard.steps || []).map((step, idx) => (
                    <div
                      key={step.id || idx}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-indigo-600">
                          Passo {idx + 1} • {step.type}
                        </span>
                        {step.toolId && (
                          <code className="text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                            {step.toolId}()
                          </code>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900">{step.title}</p>
                      <p className="text-xs text-slate-600">{step.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Criação Mágica por Texto */}
      {showMagicModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 flex items-center justify-center shadow-md">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-900">
                      Criar Agente de IA Descrevendo em Texto
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                      🏢 {currentCompany.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    O agente gerado pertencerá exclusivamente à sua empresa e só terá acesso aos seus produtos e leads.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowMagicModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Escolha um exemplo ou escreva do seu jeito:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PROMPT_PRESETS.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMagicPrompt(preset.prompt)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 font-semibold border border-slate-200 transition cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={magicPrompt}
              onChange={(e) => setMagicPrompt(e.target.value)}
              rows={5}
              placeholder="Descreva aqui... Exemplo: Quero um agente chamado Lucas que atenda leads da campanha de Imóveis. O objetivo dele é descobrir a faixa de renda e bairro de interesse, consultar os imóveis/produtos cadastrados e mover leads com renda compatível para Em Negociação no CRM. Regra: nunca prometer aprovação de financiamento bancário."
              className="w-full rounded-2xl border border-slate-300 p-4 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowMagicModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isGeneratingBlueprint}
                onClick={handleGenerateFromText}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg cursor-pointer"
              >
                {isGeneratingBlueprint ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Criando Agente...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Criar Agente Agora
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
