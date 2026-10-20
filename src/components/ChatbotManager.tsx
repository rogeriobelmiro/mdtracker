import React, { useState, useMemo } from 'react';
import { 
  Bot, 
  Sparkles, 
  MessageSquare, 
  Send, 
  UserCheck, 
  Zap, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sliders, 
  ExternalLink, 
  ShoppingBag, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  RotateCcw,
  Smartphone,
  Instagram,
  Settings,
  GitFork
} from 'lucide-react';
import { IntegrationSettings, ChatbotConfig, Product, Company, ChatbotMode, ChatbotFlow, ChatbotProject, Lead } from '../types';
import { simulateChatbot, sendDirectMessage } from '../services/api';
import { useDialog } from '../contexts/DialogContext';
import { ChatbotVisualFlowBuilder, DEFAULT_FLOW_DIAGNOSTICO, DEFAULT_FLOW_FOLLOWUP, DEFAULT_FLOW_UPSELL_5_DAYS } from './ChatbotVisualFlowBuilder';
import { ChatbotProjectHub } from './ChatbotProjectHub';

interface ChatbotManagerProps {
  settings: IntegrationSettings;
  products: Product[];
  currentCompany: Company;
  leads?: Lead[];
  onUpdateLead?: (id: string, data: Partial<Lead>) => Promise<void>;
  onCreateLead?: (data: Partial<Lead>) => Promise<Lead>;
  onUpdateSettings: (newSettings: IntegrationSettings) => Promise<void>;
  onNavigateToTab?: (tab: 'dashboard' | 'links' | 'leads' | 'events' | 'broadcast' | 'chat' | 'users' | 'company' | 'products' | 'popups' | 'ai') => void;
}

const DEFAULT_CONFIG: ChatbotConfig = {
  enabled: true,
  directEnabled: true,
  botName: 'Sofia - Assistente Virtual',
  personaPrompt: `Você é a Sofia, consultora digital especialista da empresa.
Seu objetivo é atender o cliente de forma empática, prestativa, humanizada e persuasiva.
Responda dúvidas de forma clara e objetiva, tire dúvidas sobre nossos produtos ou serviços e conduza o cliente para fechar negócio.
Use emojis com bom senso para deixar a conversa agradável e dinâmica.
Caso o cliente faça uma pergunta específica ou peça para falar com um humano, transfira educadamente.`,
  autoReplyDelaySeconds: 3,
  enableHumanHandover: true,
  handoverKeywords: ['falar com atendente', 'humano', 'atendente', 'especialista', 'suporte', 'cancelar', 'reclamação', 'ajuda'],
  includeProductsKnowledge: true,
};

export const ChatbotManager: React.FC<ChatbotManagerProps> = ({
  settings,
  products,
  currentCompany,
  leads,
  onUpdateLead,
  onCreateLead,
  onUpdateSettings,
  onNavigateToTab
}) => {
  const { alert } = useDialog();
  const [config, setConfig] = useState<ChatbotConfig>({
    ...DEFAULT_CONFIG,
    ...(settings.chatbotConfig || {})
  });

  const [activeMode, setActiveMode] = useState<ChatbotMode>(
    config.mode || 'prompt'
  );

  // Inicialização de Projetos (retrocompatível com fluxos legados)
  const defaultProjects: ChatbotProject[] = useMemo(() => {
    if (config.projects && config.projects.length > 0) {
      return config.projects;
    }

    const legacySalesFlows: ChatbotFlow[] = config.flows && config.flows.length > 0
      ? config.flows.map(f => ({ ...f, projectId: 'proj-sales' }))
      : [
          { ...DEFAULT_FLOW_DIAGNOSTICO, projectId: 'proj-sales' },
          { ...DEFAULT_FLOW_FOLLOWUP, projectId: 'proj-sales' }
        ];

    const upsellFlows: ChatbotFlow[] = [
      { ...DEFAULT_FLOW_UPSELL_5_DAYS, projectId: 'proj-upsell' }
    ];

    return [
      {
        id: 'proj-sales',
        name: 'Vendas & Atendimento Principal',
        description: 'Captação pelo Google e WhatsApp, qualificação de leads e fechamento comercial',
        color: 'blue',
        active: true,
        flows: legacySalesFlows,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'proj-upsell',
        name: 'Upsell & Pós-Venda',
        description: 'Fluxos proativos iniciados após o fechamento para oferta de produtos complementares',
        color: 'emerald',
        active: true,
        flows: upsellFlows,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }, [config.projects, config.flows]);

  const [projects, setProjects] = useState<ChatbotProject[]>(defaultProjects);
  const [activeProjectId, setActiveProjectId] = useState<string>(
    config.activeProjectId || defaultProjects[0]?.id || 'proj-sales'
  );
  const [editingFlowId, setEditingFlowId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  const handleSaveProjects = async (
    newProjects: ChatbotProject[],
    activeProjId?: string,
    activeFlowId?: string
  ) => {
    setProjects(newProjects);
    const allFlows = newProjects.flatMap(p => p.flows || []);
    const updatedConfig: ChatbotConfig = {
      ...config,
      mode: 'visual_flow',
      projects: newProjects,
      flows: allFlows,
      activeProjectId: activeProjId || activeProjectId,
      activeFlowId: activeFlowId || config.activeFlowId
    };
    setConfig(updatedConfig);
    await onUpdateSettings({
      ...settings,
      chatbotConfig: updatedConfig
    });
  };

  const handleSaveFlowsFromBuilder = async (updatedFlows: ChatbotFlow[], activeFlowId?: string) => {
    const updatedProjects = projects.map(proj => {
      if (proj.id === activeProjectId) {
        return {
          ...proj,
          flows: updatedFlows,
          updatedAt: new Date().toISOString()
        };
      }
      return proj;
    });

    await handleSaveProjects(updatedProjects, activeProjectId, activeFlowId);
  };

  // Simulator state
  const [simChannel, setSimChannel] = useState<'whatsapp' | 'direct'>('whatsapp');
  const [simInput, setSimInput] = useState('');
  const [simLoading, setSimLoading] = useState(false);
  const [simMessages, setSimMessages] = useState<Array<{
    id: string;
    sender: 'user' | 'bot';
    text: string;
    time: string;
    isHandover?: boolean;
    channel: 'whatsapp' | 'direct';
  }>>([
    {
      id: 'welcome-1',
      sender: 'bot',
      text: 'Olá! Sou a Sofia, assistente virtual da ' + currentCompany.name + '. Como posso te ajudar hoje?',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: 'whatsapp'
    }
  ]);

  const personaTemplates = [
    {
      title: '💼 Vendedor & Fechador',
      description: 'Focado em conversão, apresentação de benefícios, objeções e links de compra.',
      prompt: `Você é um consultor comercial de elite da empresa ${currentCompany.name}.
Seu objetivo principal é entender a necessidade do cliente, apresentar o produto/serviço ideal do nosso catálogo e conduzi-lo até o fechamento.
Destaque os benefícios e envie o link de pagamento assim que o cliente demonstrar real interesse.
Seja carismático, persuasivo, seguro e atencioso.`
    },
    {
      title: '🎧 Suporte & Pós-Venda',
      description: 'Focado em tirar dúvidas frequentes, instruções de acesso e esclarecimentos.',
      prompt: `Você é o assistente técnico e de suporte ao cliente da empresa ${currentCompany.name}.
Seu foco é resolver as dúvidas do cliente com paciência, clareza e empatia.
Explique passo a passo como funcionam nossos produtos, formas de entrega e garantia.
Se o problema for complexo ou exigir dados sensíveis, encaminhe para a equipe humana.`
    },
    {
      title: '🎯 SDR Pré-Vendedor',
      description: 'Faz perguntas estratégicas para qualificar o lead antes de passar ao consultor.',
      prompt: `Você é um SDR (Sales Development Representative) da empresa ${currentCompany.name}.
Seu objetivo é qualificar o lead fazendo até 2 ou 3 perguntas estratégicas sobre seu perfil, desafio atual e orçamento.
Assim que o lead estiver qualificado, avise que um dos nossos especialistas seniores entrará em contato para apresentar a proposta ideal.`
    },
    {
      title: '⚡ Rápido e Objetivo',
      description: 'Respostas concisas, diretas e práticas para clientes com pressa.',
      prompt: `Você é um atendente ágil e prestativo da ${currentCompany.name}.
Mantenha suas respostas curtas (máximo 2 a 3 parágrafos curtos), sem rodeios, respondendo exatamente o que o cliente perguntou com clareza e profissionalismo.`
    }
  ];

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      await onUpdateSettings({
        ...settings,
        chatbotConfig: config
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações do chatbot', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddKeyword = () => {
    const kw = newKeyword.trim().toLowerCase();
    if (!kw) return;
    if (config.handoverKeywords.includes(kw)) {
      alert('Esta palavra-chave já está cadastrada.', 'warning');
      return;
    }
    setConfig({
      ...config,
      handoverKeywords: [...config.handoverKeywords, kw]
    });
    setNewKeyword('');
  };

  const handleRemoveKeyword = (kwToRemove: string) => {
    setConfig({
      ...config,
      handoverKeywords: config.handoverKeywords.filter(k => k !== kwToRemove)
    });
  };

  const handleSendSimMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = simInput.trim();
    if (!text || simLoading) return;

    const userMsg = {
      id: `msg-${Date.now()}-u`,
      sender: 'user' as const,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      channel: simChannel
    };

    setSimMessages(prev => [...prev, userMsg]);
    setSimInput('');
    setSimLoading(true);

    try {
      let botReply = '';
      let isHandover = false;

      if (simChannel === 'direct') {
        const res = await sendDirectMessage({
          companyId: currentCompany.id,
          leadName: 'Cliente Instagram Direct',
          message: text,
          directChannel: 'instagram_direct'
        });
        botReply = res.reply;
        isHandover = res.isHandover;
      } else {
        const res = await simulateChatbot({
          companyId: currentCompany.id,
          message: text,
          configOverride: config,
          lead: { name: 'Cliente WhatsApp', source: 'whatsapp_bot' }
        });
        botReply = res.reply;
        isHandover = res.isHandover;
      }

      const botMsg = {
        id: `msg-${Date.now()}-b`,
        sender: 'bot' as const,
        text: botReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isHandover,
        channel: simChannel
      };

      setSimMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setSimMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          sender: 'bot',
          text: '⚠️ Desculpe, tive uma instabilidade temporária. Um atendente humano responderá você em instantes!',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          channel: simChannel
        }
      ]);
    } finally {
      setSimLoading(false);
    }
  };

  // Se estiver no MODO 2: FLUXO VISUAL, renderiza o Hub de Projetos ou o Construtor Visual
  if (activeMode === 'visual_flow') {
    // Se o usuário clicou para editar ou abrir um fluxo específico:
    if (editingFlowId) {
      return (
        <div className="w-full h-full flex flex-col bg-[#070b12] text-slate-100 overflow-hidden">
          <div className="flex-1 w-full min-h-0 relative overflow-hidden">
            <ChatbotVisualFlowBuilder
              currentCompany={currentCompany}
              settings={settings}
              projects={projects}
              activeProjectId={activeProjectId}
              initialFlowId={editingFlowId}
              leads={leads}
              onUpdateLead={onUpdateLead}
              onCreateLead={onCreateLead}
              onSaveFlows={handleSaveFlowsFromBuilder}
              onBackToProjects={() => setEditingFlowId(null)}
              onBackToModeSelect={() => {
                setEditingFlowId(null);
                setActiveMode('prompt');
                setConfig(prev => ({ ...prev, mode: 'prompt' }));
              }}
            />
          </div>
        </div>
      );
    }

    // Caso contrário, mostra a Lista de Fluxos organizada por PROJETOS
    return (
      <ChatbotProjectHub
        currentCompany={currentCompany}
        settings={settings}
        projects={projects}
        onSaveProjects={handleSaveProjects}
        onOpenFlow={(projectId, flowId) => {
          setActiveProjectId(projectId);
          setEditingFlowId(flowId);
        }}
        onBackToPromptMode={() => {
          setActiveMode('prompt');
          setConfig(prev => ({ ...prev, mode: 'prompt' }));
        }}
      />
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-12">
      
      {/* 0. SELETOR DE MODO DO CHATBOT (MODO 1: PROMPTS VS MODO 2: FLUXO VISUAL) */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-2 flex flex-col sm:flex-row items-center gap-2 shadow-xl">
        <button
          onClick={() => {
            setActiveMode('prompt');
            setConfig(prev => ({ ...prev, mode: 'prompt' }));
          }}
          className={`flex-1 w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition ${
            activeMode === 'prompt'
              ? 'bg-gradient-to-r from-indigo-900/90 to-indigo-800/90 text-white shadow-lg border border-indigo-500/40 ring-1 ring-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <div className={`p-2 rounded-xl shrink-0 ${activeMode === 'prompt' ? 'bg-indigo-500 text-white shadow-md' : 'bg-slate-800 text-indigo-400'}`}>
            <Bot className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Configuração 1: Atendente com IA</span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeMode === 'prompt' ? 'bg-indigo-400/20 text-indigo-200 border border-indigo-400/30' : 'bg-slate-800 text-slate-500'}`}>
                Prompts & Personas
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
              Atendimento natural via IA generativa, personas, produtos e transbordo humano
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            setActiveMode('visual_flow');
            setConfig(prev => ({ ...prev, mode: 'visual_flow' }));
          }}
          className={`flex-1 w-full flex items-center justify-start gap-3 px-4 py-3 rounded-xl transition ${
            activeMode === 'visual_flow'
              ? 'bg-gradient-to-r from-blue-950/90 to-cyan-950/90 text-white shadow-lg border border-cyan-500/40 ring-1 ring-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <div className={`p-2 rounded-xl shrink-0 ${activeMode === 'visual_flow' ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-800 text-cyan-400'}`}>
            <GitFork className="w-5 h-5" />
          </div>
          <div className="text-left min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Configuração 2: Construtor de Fluxo Visual</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 animate-pulse">
                Árvore de Decisão
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
              Blocos conectados, ramificações conforme resposta do lead e ações no CRM
            </p>
          </div>
        </button>
      </div>

      {/* 1. Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Bot className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                Chatbot com IA (WhatsApp & Instagram Direct)
                <span className="bg-gradient-to-r from-pink-500 to-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  Gemini 2.5 Flash
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Automatize 100% das primeiras mensagens e dúvidas frequentes recebidas no <strong>WhatsApp</strong> e <strong>Direct do Instagram</strong>. A IA compreende o contexto do lead, consulta seu catálogo de produtos e transfere automaticamente para humanos quando necessário.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToTab && (
              <button
                onClick={() => onNavigateToTab('chat')}
                className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border border-white/15"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Ver Conversas ao Vivo</span>
              </button>
            )}

            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className={`text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 shadow-md ${
                saveSuccess 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Salvando...</span>
                </>
              ) : saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Salvo com Sucesso!</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Salvar Configurações</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Channel Quick Status Bar */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* WhatsApp Status */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">Canal WhatsApp</p>
                <p className="text-[10px] text-slate-400">Evolution API & Webhook</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {/* Instagram Direct Status */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-pink-500/20 to-purple-500/20 text-pink-400 flex items-center justify-center">
                <Instagram className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">Instagram Direct</p>
                <p className="text-[10px] text-slate-400">Meta Graph Webhook</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.directEnabled !== false}
                onChange={(e) => setConfig({ ...config, directEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>

          {/* Products Catalog Synced */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">{products.length} Produtos</p>
                <p className="text-[10px] text-slate-400">Indexados na Memória IA</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Ativo
            </span>
          </div>

          {/* Transbordo Humano */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-white">Transbordo Humano</p>
                <p className="text-[10px] text-slate-400">{config.handoverKeywords.length} palavras-chave</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              {config.enableHumanHandover ? 'Protegido' : 'Off'}
            </span>
          </div>

        </div>
      </div>

      {/* ManyChat Instagram Comment Growth Tool Callout */}
      <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-sm shrink-0">
            <Instagram className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-slate-900">Auto-DM por Comentários no Feed & Reels (Estilo ManyChat)</h4>
              <span className="bg-purple-600 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">Growth Tool</span>
            </div>
            <p className="text-[11px] text-slate-600">
              Responda seguidores que comentam "QUERO", "PREÇO" ou "LINK" nos seus posts e Reels com respostas públicas rotativas e Direct instantâneo.
            </p>
          </div>
        </div>

        {onNavigateToTab && (
          <button
            onClick={() => onNavigateToTab('instagram_auto_dm' as any)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95"
          >
            <span>Configurar Auto-DM Instagram</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. Main Work Area: Left Configs + Right Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Configs & Personas): 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card: Personalidade & Identidade */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-sm text-slate-900">Personalidade & Instruções da IA</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-medium">Motor: Gemini 2.5 Flash</span>
            </div>

            {/* Bot Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nome do Bot / Atendente Virtual
              </label>
              <input
                type="text"
                value={config.botName}
                onChange={(e) => setConfig({ ...config, botName: e.target.value })}
                placeholder="Ex: Sofia - Consultora Digital"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-indigo-500 transition"
              />
              <p className="text-[10px] text-slate-400 mt-1">Este nome será utilizado quando a IA se apresentar aos clientes.</p>
            </div>

            {/* Persona Quick Templates */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Templates de Personalidade Prontos (Clique para aplicar)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {personaTemplates.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setConfig({ ...config, personaPrompt: p.prompt })}
                    className="text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 transition group"
                  >
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 flex items-center justify-between">
                      <span>{p.title}</span>
                      <Zap className="w-3 h-3 text-slate-400 group-hover:text-indigo-500" />
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{p.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Prompt Textarea */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Prompt do Sistema / Instruções Gerais
              </label>
              <textarea
                rows={5}
                value={config.personaPrompt}
                onChange={(e) => setConfig({ ...config, personaPrompt: e.target.value })}
                placeholder="Instruções completas de comportamento da IA..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 outline-none focus:border-indigo-500 transition font-mono leading-relaxed"
              />
            </div>

            {/* Product Catalog Injection */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Conhecimento do Catálogo de Produtos</p>
                    <p className="text-[10px] text-slate-500">Injeta preços e links cadastrados nas respostas</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.includeProductsKnowledge}
                    onChange={(e) => setConfig({ ...config, includeProductsKnowledge: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {config.includeProductsKnowledge && products.length > 0 && (
                <div className="pt-2 border-t border-slate-200/80">
                  <p className="text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
                    {products.length} Produtos disponíveis para a IA:
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {products.map(p => (
                      <span key={p.id} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">
                        {p.name} - R$ {Number(p.price || 0).toFixed(2)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Human-like typing delay */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Simular Digitação Humana no Chat
                </label>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  {config.autoReplyDelaySeconds} segundos
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={8}
                step={1}
                value={config.autoReplyDelaySeconds}
                onChange={(e) => setConfig({ ...config, autoReplyDelaySeconds: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Evita respostas instantâneas não-humanas, mantendo o status "digitando..." ativo no WhatsApp e Direct.
              </p>
            </div>

          </div>

          {/* Card: Transbordo Humano (Human Handover) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900">Transbordo Humano Inteligente</h3>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableHumanHandover}
                  onChange={(e) => setConfig({ ...config, enableHumanHandover: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Quando o lead digita qualquer uma dessas palavras-chave, o bot <strong>pausa o auto-atendimento imediatamente</strong> para aquele contato e avisa a equipe humana no CRM.
            </p>

            {/* Keyword tags */}
            <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              {config.handoverKeywords.map((kw, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 bg-white border border-slate-200 text-slate-700 text-xs px-2.5 py-1 rounded-md shadow-2xs font-medium"
                >
                  <span>{kw}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeyword(kw)}
                    className="text-slate-400 hover:text-red-500 transition ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            {/* Add new keyword */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
                placeholder="Adicionar nova palavra (ex: falar com pessoa, cancelar)..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-indigo-500 transition"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column (Live Interactive Simulator): 5 cols */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          
          <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden flex flex-col h-[650px]">
            
            {/* Simulator Header */}
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">
                  🤖
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
                    <span>{config.botName}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  </p>
                  <p className="text-[10px] text-slate-400">Simulador Interativo em Tempo Real</p>
                </div>
              </div>

              {/* Channel Selector Pill */}
              <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[10px]">
                <button
                  type="button"
                  onClick={() => setSimChannel('whatsapp')}
                  className={`px-2 py-1 rounded font-bold transition flex items-center gap-1 ${
                    simChannel === 'whatsapp'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setSimChannel('direct')}
                  className={`px-2 py-1 rounded font-bold transition flex items-center gap-1 ${
                    simChannel === 'direct'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Instagram className="w-3 h-3" />
                  Direct
                </button>
              </div>
            </div>

            {/* Quick Test Chips */}
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[10px]">
              <span className="text-slate-400 font-bold shrink-0">Testar:</span>
              <button
                type="button"
                onClick={() => { setSimInput('Quais produtos vocês têm disponíveis?'); }}
                className="whitespace-nowrap bg-white border border-slate-200 hover:border-indigo-400 px-2 py-0.5 rounded text-slate-600 font-medium transition"
              >
                📦 Preços & Produtos
              </button>
              <button
                type="button"
                onClick={() => { setSimInput('Gostaria de falar com um atendente humano por favor'); }}
                className="whitespace-nowrap bg-white border border-slate-200 hover:border-amber-400 px-2 py-0.5 rounded text-slate-600 font-medium transition"
              >
                👨‍💼 Transbordo Humano
              </button>
              <button
                type="button"
                onClick={() => { setSimInput('Como funciona o suporte de vocês?'); }}
                className="whitespace-nowrap bg-white border border-slate-200 hover:border-indigo-400 px-2 py-0.5 rounded text-slate-600 font-medium transition"
              >
                ❓ Dúvidas Gerais
              </button>
            </div>

            {/* Simulator Chat Scroll Area */}
            <div className={`flex-1 p-4 overflow-y-auto space-y-3 ${
              simChannel === 'whatsapp' ? 'bg-[#E5DDD5]/30' : 'bg-slate-50'
            }`}>
              {simMessages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-xs ${
                        isUser
                          ? simChannel === 'whatsapp'
                            ? 'bg-[#DCF8C6] text-slate-800 rounded-tr-none'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-tr-none'
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                      }`}
                    >
                      {msg.isHandover && (
                        <div className="mb-1 flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                          <UserCheck className="w-3 h-3 text-amber-600" />
                          <span>TRANSBORDO DETECTADO: Transferindo para humano</span>
                        </div>
                      )}
                      <p className="whitespace-pre-line">{msg.text}</p>
                      <div className="mt-1 flex items-center justify-end gap-1 text-[9px] opacity-60">
                        <span>{msg.time}</span>
                        {isUser && <span>✓✓</span>}
                      </div>
                    </div>
                  </div>
                );
              })}

              {simLoading && (
                <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-2 rounded-2xl max-w-[150px] shadow-xs">
                  <span className="text-[10px] text-slate-500 font-medium">Digitando...</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Simulator Input Footer */}
            <form onSubmit={handleSendSimMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                placeholder={simChannel === 'whatsapp' ? 'Digite uma mensagem do WhatsApp...' : 'Enviar mensagem no Direct...'}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={!simInput.trim() || simLoading}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
            <span>Canal selecionado: <strong>{simChannel === 'whatsapp' ? 'WhatsApp' : 'Instagram Direct'}</strong></span>
            <button
              type="button"
              onClick={() => setSimMessages([
                {
                  id: 'reset-1',
                  sender: 'bot',
                  text: 'Olá! Sou a Sofia, assistente virtual da ' + currentCompany.name + '. Como posso te ajudar hoje?',
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  channel: simChannel
                }
              ])}
              className="text-slate-400 hover:text-slate-700 flex items-center gap-1 transition"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar Conversa
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
