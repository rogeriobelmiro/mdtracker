import React, { useState, useEffect } from 'react';
import { 
  Instagram, 
  Sparkles, 
  MessageSquare, 
  Send, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sliders, 
  ExternalLink, 
  Plus, 
  Trash2, 
  Edit3, 
  RotateCcw,
  Heart,
  Share2,
  Bookmark,
  ChevronRight,
  TrendingUp,
  Users,
  ShieldCheck,
  Check,
  Filter,
  Search,
  Eye,
  Play,
  ArrowRight,
  Copy,
  Info
} from 'lucide-react';
import { 
  InstagramCommentAutomation, 
  InstagramCommentLog, 
  InstagramSimulateResult, 
  Company, 
  User 
} from '../types';
import { 
  fetchInstagramAutomations, 
  createInstagramAutomation, 
  updateInstagramAutomation, 
  deleteInstagramAutomation, 
  fetchInstagramCommentLogs, 
  simulateInstagramComment 
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';

interface InstagramAutoDMProps {
  currentCompany: Company | null;
  currentUser: User | null;
  onNavigateToTab?: (tab: string) => void;
}

export const InstagramAutoDM: React.FC<InstagramAutoDMProps> = ({
  currentCompany,
  currentUser,
  onNavigateToTab
}) => {
  const { alert, confirm } = useDialog();
  const companyId = currentCompany?.id || 'comp-alfa';

  const [activeTab, setActiveTab] = useState<'rules' | 'simulator' | 'logs' | 'webhook_setup'>('rules');
  const [automations, setAutomations] = useState<InstagramCommentAutomation[]>([]);
  const [logs, setLogs] = useState<InstagramCommentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  // Modal State for Rule Creation/Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<InstagramCommentAutomation | null>(null);
  const [formName, setFormName] = useState('');
  const [formPostType, setFormPostType] = useState<'any_post' | 'specific_post'>('any_post');
  const [formPostUrl, setFormPostUrl] = useState('');
  const [formTriggerType, setFormTriggerType] = useState<'keywords' | 'all_comments'>('keywords');
  const [formKeywords, setFormKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [formExcludedKeywords, setFormExcludedKeywords] = useState<string[]>([]);
  const [excludedInput, setExcludedInput] = useState('');
  const [formAutoLike, setFormAutoLike] = useState(true);
  const [formPublicReplies, setFormPublicReplies] = useState<string[]>([
    'Acabei de te enviar no Direct! Dá uma olhada lá 🚀',
    'Prontinho! Link enviado na sua caixa de mensagens ✨',
    'Confira seu Direct! Mandei o acesso com todos os detalhes 🎁'
  ]);
  const [publicReplyInput, setPublicReplyInput] = useState('');
  const [formDirectMessage, setFormDirectMessage] = useState('');
  const [formCtaText, setFormCtaText] = useState('');
  const [formCtaUrl, setFormCtaUrl] = useState('');
  const [formCreateLead, setFormCreateLead] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Simulator State
  const [simSelectedRuleId, setSimSelectedRuleId] = useState<string>('auto');
  const [simUsername, setSimUsername] = useState('@mariana.silva');
  const [simComment, setSimComment] = useState('Eu quero muito o ebook!');
  const [simPostTitle, setSimPostTitle] = useState('Post: Como dobrar vendas no WhatsApp');
  const [simRunning, setSimRunning] = useState(false);
  const [simResult, setSimResult] = useState<InstagramSimulateResult | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [autos, logsData] = await Promise.all([
        fetchInstagramAutomations(companyId),
        fetchInstagramCommentLogs(companyId)
      ]);
      setAutomations(autos);
      setLogs(logsData);
    } catch (err: any) {
      console.error('Erro ao carregar dados do Instagram:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  // Overall Stats
  const totalComments = automations.reduce((acc, a) => acc + (a.stats?.commentsProcessed || 0), 0);
  const totalDms = automations.reduce((acc, a) => acc + (a.stats?.dmsSent || 0), 0);
  const totalLeads = automations.reduce((acc, a) => acc + (a.stats?.leadsCaptured || 0), 0);
  const activeCount = automations.filter(a => a.status === 'active').length;

  // Filtered Automations
  const filteredAutomations = automations.filter(a => {
    const matchesQuery = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  // Modal Handlers
  const handleOpenCreateModal = () => {
    setEditingRule(null);
    setFormName('');
    setFormPostType('any_post');
    setFormPostUrl('');
    setFormTriggerType('keywords');
    setFormKeywords(['quero', 'eu quero', 'ebook', 'link']);
    setFormExcludedKeywords([]);
    setFormAutoLike(true);
    setFormPublicReplies([
      'Acabei de te enviar no Direct! Dá uma olhada lá 🚀',
      'Prontinho! Link enviado na sua caixa de mensagens ✨',
      'Confira seu Direct! Mandei o acesso com todos os detalhes 🎁'
    ]);
    setFormDirectMessage('Olá {{username}}! 🎉 Conforme você pediu no nosso post, aqui está o seu acesso exclusivo. Clique no botão abaixo para acessar agora:');
    setFormCtaText('Acessar Conteúdo Grátis 🔗');
    setFormCtaUrl('https://mdtracker.app/r/oferta-vip');
    setFormCreateLead(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (rule: InstagramCommentAutomation) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormPostType(rule.postType);
    setFormPostUrl(rule.postUrl || '');
    setFormTriggerType(rule.triggerType);
    setFormKeywords(rule.keywords || []);
    setFormExcludedKeywords(rule.excludedKeywords || []);
    setFormAutoLike(rule.autoLikeComment);
    setFormPublicReplies(rule.publicReplies && rule.publicReplies.length > 0 ? rule.publicReplies : ['Enviado no direct! 🚀']);
    setFormDirectMessage(rule.directMessage);
    setFormCtaText(rule.ctaButton?.text || '');
    setFormCtaUrl(rule.ctaButton?.url || '');
    setFormCreateLead(rule.createLeadInCrm);
    setIsModalOpen(true);
  };

  const handleAddKeyword = () => {
    const kw = keywordInput.trim().toLowerCase();
    if (!kw) return;
    if (!formKeywords.includes(kw)) {
      setFormKeywords([...formKeywords, kw]);
    }
    setKeywordInput('');
  };

  const handleRemoveKeyword = (kw: string) => {
    setFormKeywords(formKeywords.filter(k => k !== kw));
  };

  const handleAddExcluded = () => {
    const kw = excludedInput.trim().toLowerCase();
    if (!kw) return;
    if (!formExcludedKeywords.includes(kw)) {
      setFormExcludedKeywords([...formExcludedKeywords, kw]);
    }
    setExcludedInput('');
  };

  const handleRemoveExcluded = (kw: string) => {
    setFormExcludedKeywords(formExcludedKeywords.filter(k => k !== kw));
  };

  const handleAddPublicReply = () => {
    const reply = publicReplyInput.trim();
    if (!reply) return;
    setFormPublicReplies([...formPublicReplies, reply]);
    setPublicReplyInput('');
  };

  const handleRemovePublicReply = (index: number) => {
    if (formPublicReplies.length <= 1) {
      alert('É necessário ter ao menos 1 variação de resposta pública.', 'warning');
      return;
    }
    setFormPublicReplies(formPublicReplies.filter((_, idx) => idx !== index));
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDirectMessage.trim()) {
      alert('Nome da automação e Mensagem no Direct são obrigatórios.', 'warning');
      return;
    }

    if (formTriggerType === 'keywords' && formKeywords.length === 0) {
      alert('Adicione ao menos uma palavra-chave para o gatilho.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Partial<InstagramCommentAutomation> = {
        companyId,
        name: formName.trim(),
        postType: formPostType,
        postUrl: formPostType === 'specific_post' ? formPostUrl.trim() : undefined,
        triggerType: formTriggerType,
        keywords: formKeywords,
        excludedKeywords: formExcludedKeywords,
        autoLikeComment: formAutoLike,
        publicReplies: formPublicReplies,
        directMessage: formDirectMessage.trim(),
        ctaButton: formCtaText.trim() ? {
          text: formCtaText.trim(),
          url: formCtaUrl.trim() || 'https://mdtracker.app'
        } : undefined,
        createLeadInCrm: formCreateLead
      };

      if (editingRule) {
        await updateInstagramAutomation(editingRule.id, payload);
      } else {
        await createInstagramAutomation(payload);
      }

      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar automação', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (rule: InstagramCommentAutomation) => {
    const newStatus = rule.status === 'active' ? 'paused' : 'active';
    try {
      await updateInstagramAutomation(rule.id, { status: newStatus });
      setAutomations(prev => prev.map(a => a.id === rule.id ? { ...a, status: newStatus } : a));
    } catch (err: any) {
      alert('Erro ao alterar status da regra', 'error');
    }
  };

  const handleDeleteRule = async (rule: InstagramCommentAutomation) => {
    const confirmed = await confirm(`Tem certeza que deseja excluir a automação "${rule.name}"?`);
    if (!confirmed) return;
    try {
      await deleteInstagramAutomation(rule.id);
      setAutomations(prev => prev.filter(a => a.id !== rule.id));
    } catch (err: any) {
      alert('Erro ao excluir automação', 'error');
    }
  };

  // Run Simulator
  const handleRunSimulator = async () => {
    if (!simComment.trim()) {
      alert('Digite um comentário para simular.', 'warning');
      return;
    }

    setSimRunning(true);
    try {
      const res = await simulateInstagramComment({
        companyId,
        ruleId: simSelectedRuleId !== 'auto' ? simSelectedRuleId : undefined,
        instagramUsername: simUsername,
        commentText: simComment,
        postTitle: simPostTitle
      });

      setSimResult(res);
      // Reload logs in background
      fetchInstagramCommentLogs(companyId).then(setLogs);
    } catch (err: any) {
      alert(err.message || 'Erro na simulação', 'error');
    } finally {
      setSimRunning(false);
    }
  };

  const handleCopyWebhookUrl = () => {
    const url = `${window.location.origin}/api/webhooks/instagram`;
    navigator.clipboard.writeText(url);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-800">
      
      {/* 1. HERO HEADER (ManyChat Style) */}
      <div className="bg-gradient-to-r from-purple-900 via-pink-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-purple-800/60 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
          <Instagram className="w-64 h-64 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white shadow-md">
                <Instagram className="w-5 h-5" />
              </span>
              <span className="bg-gradient-to-r from-amber-400 to-pink-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                Instagram Growth Tool (Estilo ManyChat)
              </span>
              <span className="bg-purple-500/20 text-purple-200 border border-purple-400/30 text-[10px] font-bold px-2 py-0.5 rounded-md">
                Feed & Reels Auto-DM
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white">
              Resposta Automática de Comentários no Instagram Direct
            </h1>

            <p className="text-xs text-purple-200/90 max-w-3xl leading-relaxed">
              Dispare mensagens automáticas no <strong>Direct do seguidor</strong> assim que ele comentar palavras-chave como 
              <span className="text-amber-300 font-bold"> "QUERO"</span>, <span className="text-amber-300 font-bold">"PREÇO"</span> ou <span className="text-amber-300 font-bold">"LINK"</span> nas suas publicações ou Reels. 
              Inclui <strong>curtida automática</strong>, <strong>respostas públicas rotativas</strong> (anti-spam) e <strong>criação imediata do Lead no CRM</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('simulator')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 border border-white/15 shadow-sm active:scale-95"
            >
              <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>Simulador ManyChat</span>
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-pink-500/25 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nova Automação</span>
            </button>
          </div>
        </div>

        {/* 4 KPI METRICS BAR */}
        <div className="mt-6 pt-5 border-t border-purple-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">Regras Ativas</p>
              <p className="text-lg font-black text-white">{activeCount} <span className="text-xs font-normal text-purple-300">/ {automations.length}</span></p>
            </div>
          </div>

          <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">Comentários</p>
              <p className="text-lg font-black text-white">{totalComments}</p>
            </div>
          </div>

          <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Send className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">DMs Enviadas</p>
              <p className="text-lg font-black text-white">{totalDms}</p>
            </div>
          </div>

          <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">Leads no CRM</p>
              <p className="text-lg font-black text-white">{totalLeads}</p>
            </div>
          </div>

        </div>
      </div>

      {/* 2. NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'rules'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Regras de Automação ({automations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'simulator'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-amber-500 fill-current" />
          <span>🧪 Simulador Interativo ManyChat</span>
          <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">Live Test</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Histórico de Execuções ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('webhook_setup')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'webhook_setup'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>🔌 Conexão Meta Webhook</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB 1: RULES LIST */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome da campanha ou palavra-chave..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-white font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Todas as Regras</option>
                <option value="active">Somente Ativas</option>
                <option value="paused">Somente Pausadas</option>
              </select>
            </div>
          </div>

          {/* Automations Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAutomations.map(rule => (
              <div 
                key={rule.id}
                className={`bg-white border rounded-2xl p-5 space-y-4 transition hover:shadow-md ${
                  rule.status === 'active' 
                    ? 'border-purple-200 hover:border-purple-300' 
                    : 'border-slate-200 opacity-75'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        rule.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {rule.status === 'active' ? '● Ativa' : '○ Pausada'}
                      </span>

                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                        {rule.postType === 'any_post' ? 'Qualquer Post ou Reels' : 'Publicação Específica'}
                      </span>

                      {rule.autoLikeComment && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 border border-pink-200 flex items-center gap-1">
                          <Heart className="w-3 h-3 fill-current text-pink-500" /> Like Automático
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-slate-900 text-base">
                      {rule.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleToggleStatus(rule)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition ${
                        rule.status === 'active'
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {rule.status === 'active' ? 'Pausar' : 'Ativar'}
                    </button>

                    <button
                      onClick={() => {
                        setSimSelectedRuleId(rule.id);
                        if (rule.keywords.length > 0) setSimComment(rule.keywords[0].toUpperCase());
                        setActiveTab('simulator');
                      }}
                      className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg transition"
                      title="Testar no Simulador"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>

                    <button
                      onClick={() => handleOpenEditModal(rule)}
                      className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg transition"
                      title="Editar Regra"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleDeleteRule(rule)}
                      className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-lg transition"
                      title="Excluir Regra"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Keywords Trigger Box */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Palavras-Chave Gatilho:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {rule.triggerType === 'all_comments' ? (
                      <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                        Qualquer comentário
                      </span>
                    ) : (
                      rule.keywords.map((kw, i) => (
                        <span key={i} className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-900 border border-purple-200 text-[11px] font-bold px-2 py-0.5 rounded-md font-mono">
                          "{kw}"
                        </span>
                      ))
                    )}
                  </div>
                </div>

                {/* Direct Message & Public Reply Preview */}
                <div className="space-y-2 text-xs">
                  <div className="bg-gradient-to-r from-purple-50/70 to-indigo-50/70 border border-purple-100 p-3 rounded-xl space-y-1.5">
                    <span className="text-[10px] font-bold text-purple-700 flex items-center gap-1 uppercase tracking-wider">
                      <Send className="w-3 h-3" /> Mensagem Privada no Direct:
                    </span>
                    <p className="text-slate-800 text-[11px] font-medium leading-relaxed italic bg-white/80 p-2 rounded-lg border border-purple-100">
                      "{rule.directMessage}"
                    </p>
                    {rule.ctaButton && (
                      <div className="pt-1 flex items-center gap-2">
                        <span className="bg-purple-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-md shadow-2xs">
                          {rule.ctaButton.text}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                          {rule.ctaButton.url}
                        </span>
                      </div>
                    )}
                  </div>

                  {rule.publicReplies && rule.publicReplies.length > 0 && (
                    <div className="text-[11px] text-slate-600 px-1 flex items-center justify-between">
                      <span className="text-slate-500">
                        🔄 <strong>{rule.publicReplies.length}</strong> variações de resposta pública rotativa
                      </span>
                      {rule.createLeadInCrm && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Salva Lead no CRM
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Stats Bar */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">Comentários</span>
                    <span className="text-slate-900 font-bold">{rule.stats?.commentsProcessed || 0}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">DMs Entregues</span>
                    <span className="text-purple-700 font-bold">{rule.stats?.dmsSent || 0}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 font-bold block">Leads CRM</span>
                    <span className="text-emerald-700 font-bold">{rule.stats?.leadsCaptured || 0}</span>
                  </div>
                </div>

              </div>
            ))}

            {filteredAutomations.length === 0 && (
              <div className="col-span-full bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center space-y-3">
                <Instagram className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-700 text-sm">Nenhuma automação de comentário encontrada</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Crie sua primeira regra para responder automaticamente qualquer pessoa que comentar no seu Instagram.
                </p>
                <button
                  onClick={handleOpenCreateModal}
                  className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Criar Primeira Automação
                </button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 2: INTERACTIVE LIVE SIMULATOR (MANYCHAT TESTER) */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          
          {/* Simulator Control Box */}
          <div className="bg-white border border-purple-200 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <span>🧪 Simulador em Tempo Real (ManyChat Experience)</span>
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Mockup Interativo</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simule o comentário de um seguidor no feed e veja exatamente o like automático, a resposta pública no post e o direct entregue.
                </p>
              </div>

              <button
                onClick={handleRunSimulator}
                disabled={simRunning}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {simRunning ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Executando Simulação...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Disparar Simulação ManyChat</span>
                  </>
                )}
              </button>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Regra de Automação a Testar:
                </label>
                <select
                  value={simSelectedRuleId}
                  onChange={e => setSimSelectedRuleId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-medium focus:outline-none focus:border-purple-500"
                >
                  <option value="auto">✨ Auto-Detectar por Palavra-Chave</option>
                  {automations.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.status})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Usuário do Seguidor no Instagram (@username):
                </label>
                <input
                  type="text"
                  value={simUsername}
                  onChange={e => setSimUsername(e.target.value)}
                  placeholder="@nome_usuario"
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-mono font-medium focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Comentário Feito no Post:
                </label>
                <input
                  type="text"
                  value={simComment}
                  onChange={e => setSimComment(e.target.value)}
                  placeholder="Ex: Eu quero o cupom!"
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-medium focus:outline-none focus:border-purple-500"
                />
              </div>

            </div>

            {/* Quick Keyword Pill Prompts */}
            <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
              <span className="text-[11px] text-slate-500 font-semibold">Testar rapidamente:</span>
              {['Eu quero o ebook', 'CUPOM', 'Quanto custa?', 'Manda o link por favor', 'Quero atendimento humano'].map((kw, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSimComment(kw)}
                  className="text-[11px] bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-800 px-2 py-0.5 rounded-md border border-slate-200 transition"
                >
                  "{kw}"
                </button>
              ))}
            </div>

          </div>

          {/* SIMULATOR VISUAL PREVIEW: DUAL SCREEN MOCKUP */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            
            {/* SCREEN 1: INSTAGRAM POST & PUBLIC COMMENTS MOCKUP */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-lg">
              
              {/* Instagram Post Header */}
              <div className="bg-slate-50 border-b border-slate-100 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-purple-700 text-xs">
                      MD
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">mdtracker_oficial</h4>
                    <p className="text-[10px] text-slate-400">São Paulo, Brasil</p>
                  </div>
                </div>

                <div className="text-slate-400 text-sm font-bold">•••</div>
              </div>

              {/* Instagram Mock Post Media */}
              <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 p-8 text-center text-white relative flex flex-col items-center justify-center min-h-[220px]">
                <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 shadow-md border border-white/20">
                  <Sparkles className="w-7 h-7 text-amber-300" />
                </div>
                <h3 className="font-black text-lg text-white max-w-xs leading-snug">
                  Comente <span className="text-amber-300 underline decoration-pink-500">QUERO</span> para receber o acesso exclusivo no seu Direct!
                </h3>
                <p className="text-xs text-purple-200 mt-2">Automação 100% instantânea via IA</p>
              </div>

              {/* Instagram Post Action Icons */}
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-slate-700">
                  <Heart className={`w-5 h-5 cursor-pointer ${simResult?.autoLiked ? 'text-red-500 fill-current' : 'text-slate-700'}`} />
                  <MessageSquare className="w-5 h-5 cursor-pointer text-slate-700" />
                  <Share2 className="w-5 h-5 cursor-pointer text-slate-700" />
                </div>
                <Bookmark className="w-5 h-5 cursor-pointer text-slate-700" />
              </div>

              {/* Comments Section */}
              <div className="p-4 space-y-3.5 bg-slate-50/50 min-h-[240px]">
                
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Comentários na Publicação
                </span>

                {/* Comment by follower */}
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900">{simUsername}</span>
                      <span className="text-[10px] text-slate-400 font-mono">agora</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Heart className={`w-3.5 h-3.5 ${simResult?.autoLiked ? 'text-red-500 fill-current' : 'text-slate-300'}`} />
                      {simResult?.autoLiked && (
                        <span className="text-[9px] font-bold text-red-500">Curtido</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 font-medium">
                    {simComment}
                  </p>
                </div>

                {/* Public Reply by Business Account */}
                {simResult?.matched ? (
                  <div className="ml-6 pl-3 border-l-2 border-purple-500 space-y-1 animate-in fade-in duration-300">
                    <div className="bg-purple-50/80 border border-purple-200 p-2.5 rounded-xl space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-purple-950">mdtracker_oficial</span>
                        <span className="bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded">Resposta Pública</span>
                      </div>
                      <p className="text-xs text-purple-900 font-medium">
                        {simResult.publicReplyGiven}
                      </p>
                    </div>
                  </div>
                ) : simResult && !simResult.matched ? (
                  <div className="ml-6 pl-3 border-l-2 border-amber-400">
                    <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      ⚠️ Nenhuma palavra-chave correspondeu. Nenhum direct ou resposta pública disparada.
                    </p>
                  </div>
                ) : null}

              </div>

            </div>

            {/* SCREEN 2: INSTAGRAM DIRECT (DM INBOX) MOCKUP */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-white flex flex-col min-h-[500px]">
              
              {/* Direct Header */}
              <div className="bg-slate-950/80 border-b border-slate-800 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs text-white">
                      MD
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1">
                      mdtracker_oficial
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </h4>
                    <p className="text-[10px] text-slate-400">Instagram Direct • Online</p>
                  </div>
                </div>

                <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded-full font-bold">
                  Auto-DM ManyChat
                </span>
              </div>

              {/* Direct Messages Body */}
              <div className="p-4 flex-1 space-y-4 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col justify-end">
                
                <div className="text-center my-2">
                  <span className="text-[10px] text-slate-500 font-mono">Hoje às {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Direct Message Received */}
                {simResult?.matched ? (
                  <div className="space-y-2 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3.5 rounded-2xl rounded-bl-xs text-xs leading-relaxed shadow-md">
                      {simResult.dmSentText}
                    </div>

                    {/* CTA Button */}
                    {simResult.ctaButton && (
                      <a
                        href={simResult.ctaButton.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-center font-bold text-xs py-2.5 px-3 rounded-xl transition shadow-sm"
                      >
                        {simResult.ctaButton.text}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    <p>Clique em <strong>"Disparar Simulação ManyChat"</strong> para visualizar a mensagem entregue no Direct do seguidor.</p>
                  </div>
                )}

              </div>

              {/* Direct Bottom Status */}
              {simResult?.lead && (
                <div className="p-3 bg-emerald-950/40 border-t border-emerald-900/40 flex items-center justify-between text-xs text-emerald-400">
                  <span className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Lead Gerado no CRM: {simResult.lead.name}
                  </span>
                  {onNavigateToTab && (
                    <button
                      onClick={() => onNavigateToTab('leads')}
                      className="text-[11px] underline font-bold hover:text-emerald-300"
                    >
                      Ver no CRM →
                    </button>
                  )}
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* TAB 3: EXECUTION LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs space-y-4 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Histórico de Respostas e DMs Disparadas</h3>
              <p className="text-xs text-slate-500">Últimos comentários processados pelo motor de resposta automática.</p>
            </div>

            <button
              onClick={loadData}
              className="text-xs text-slate-600 hover:text-purple-600 flex items-center gap-1 font-bold p-1 rounded hover:bg-slate-50"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Atualizar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-600 font-bold">
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Seguidor</th>
                  <th className="p-3">Regra Disparada</th>
                  <th className="p-3">Comentário Feito</th>
                  <th className="p-3">Resposta Pública</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono text-[11px] text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </td>
                    <td className="p-3 font-mono font-bold text-purple-700">
                      {log.instagramUsername}
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      {log.ruleName}
                    </td>
                    <td className="p-3 text-slate-700 font-medium">
                      "{log.commentText}"
                    </td>
                    <td className="p-3 text-slate-600 text-[11px] max-w-xs truncate" title={log.publicReplyGiven}>
                      {log.publicReplyGiven}
                    </td>
                    <td className="p-3">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                        Entregue
                      </span>
                    </td>
                  </tr>
                ))}

                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      Nenhum histórico registrado ainda. Execute uma simulação ou aguarde novos comentários no Instagram.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: META / INSTAGRAM GRAPH API WEBHOOK SETUP */}
      {activeTab === 'webhook_setup' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 max-w-4xl">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-600" />
              <span>Instruções de Conexão com o Instagram Graph API (Meta Developers)</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Para receber os comentários em tempo real da sua conta comercial do Instagram, configure o Webhook oficial da Meta apontando para a sua instância do MDTracker.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            
            {/* Step 1: URL & Token */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="font-extrabold text-slate-900 block text-xs">
                1. Endpoint de Webhook da Meta
              </span>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-600 block">URL de Retorno de Chamada (Callback URL):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/api/webhooks/instagram`}
                    className="flex-1 bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-purple-700 font-bold"
                  />
                  <button
                    onClick={handleCopyWebhookUrl}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-2 rounded-lg transition flex items-center gap-1"
                  >
                    {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedToken ? 'Copiado!' : 'Copiar URL'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-[11px] font-bold text-slate-600 block">Token de Verificação (Verify Token):</label>
                <input
                  type="text"
                  readOnly
                  value="mdtracker_instagram_token"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-700 font-bold max-w-sm"
                />
              </div>
            </div>

            {/* Step 2: Events Checklist */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <span className="font-extrabold text-slate-900 block text-xs">
                2. Campos de Inscrição Obrigatórios no Painel da Meta:
              </span>
              <ul className="space-y-1.5 text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>comments</strong> (Notificação imediata de novos comentários em posts e Reels)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>messages</strong> (Permissão de envio e leitura no Instagram Direct)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>messaging_postbacks</strong> (Interações com botões de CTA no direct)</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* 4. MODAL: CREATE / EDIT AUTOMATION RULE */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                  <Instagram className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    {editingRule ? 'Editar Automação de Comentários' : 'Nova Automação de Comentários (Estilo ManyChat)'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Configure o gatilho, as respostas públicas rotativas e o Direct automático.</p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveRule} className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1 text-xs">
              
              {/* Campaign Name */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Nome da Automação *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Ex: Post E-book Tráfego Pago - Palavra 'EBOOK'"
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              {/* Post Target Selector */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Em quais publicações essa regra atua?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormPostType('any_post')}
                    className={`p-3 rounded-xl border text-left transition ${
                      formPostType === 'any_post'
                        ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-extrabold">Qualquer Publicação ou Reels</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Ativa em todos os posts atuais e futuros da conta.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormPostType('specific_post')}
                    className={`p-3 rounded-xl border text-left transition ${
                      formPostType === 'specific_post'
                        ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-xs font-extrabold">Publicação Específica</div>
                    <p className="text-[10px] text-slate-500 mt-0.5">Ativa apenas no post ou Reels com URL informada.</p>
                  </button>
                </div>

                {formPostType === 'specific_post' && (
                  <input
                    type="url"
                    value={formPostUrl}
                    onChange={e => setFormPostUrl(e.target.value)}
                    placeholder="https://www.instagram.com/p/exemplo-post-id/"
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-purple-500 text-xs font-mono"
                  />
                )}
              </div>

              {/* Trigger Keywords */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">Palavras-Chave Gatilho *</label>
                  <button
                    type="button"
                    onClick={() => setFormTriggerType(formTriggerType === 'keywords' ? 'all_comments' : 'keywords')}
                    className="text-[11px] text-purple-600 font-bold hover:underline"
                  >
                    {formTriggerType === 'keywords' ? 'Disparar em Qualquer Comentário' : 'Usar Palavras-Chave Específicas'}
                  </button>
                </div>

                {formTriggerType === 'keywords' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={keywordInput}
                        onChange={e => setKeywordInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddKeyword(); } }}
                        placeholder="Digite a palavra (ex: quero, preco, link) e clique em Adicionar"
                        className="flex-1 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-purple-500 text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddKeyword}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-lg transition"
                      >
                        + Adicionar
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-slate-50 rounded-lg border border-slate-200">
                      {formKeywords.map((kw, i) => (
                        <span key={i} className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 font-mono">
                          {kw}
                          <button type="button" onClick={() => handleRemoveKeyword(kw)} className="text-purple-600 hover:text-purple-900">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Auto Like Switch */}
              <div className="flex items-center justify-between bg-pink-50/60 border border-pink-200 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-pink-500 fill-current" />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Curtir comentário automaticamente</span>
                    <p className="text-[10px] text-slate-500">Dá um like automático no comentário do seguidor (aumenta o engajamento).</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formAutoLike}
                  onChange={e => setFormAutoLike(e.target.checked)}
                  className="w-4 h-4 accent-pink-600 rounded cursor-pointer"
                />
              </div>

              {/* Public Comment Replies (Rotating anti-spam) */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">
                  Respostas Públicas no Post (Variações Rotativas Anti-Spam) *
                </label>
                <p className="text-[10px] text-slate-500">
                  O Instagram bloqueia perfis que respondem sempre o mesmo texto. O MDTracker sorteia uma resposta diferente a cada comentário:
                </p>

                <div className="space-y-1.5">
                  {formPublicReplies.map((reply, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">#{idx + 1}</span>
                      <span className="flex-1 text-slate-800">{reply}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePublicReply(idx)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        title="Remover variação"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={publicReplyInput}
                      onChange={e => setPublicReplyInput(e.target.value)}
                      placeholder="Nova variação (ex: Te mandei o acesso no Direct! 🚀)"
                      className="flex-1 border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-purple-500 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddPublicReply}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-lg transition"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>
              </div>

              {/* Direct Message (DM) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block">Mensagem Privada no Direct *</label>
                  <span className="text-[10px] text-purple-700 font-bold">Variável: <code>{'{{username}}'}</code></span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={formDirectMessage}
                  onChange={e => setFormDirectMessage(e.target.value)}
                  placeholder="Olá {{username}}! Conforme você pediu, aqui está o seu acesso..."
                  className="w-full border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              {/* CTA Button */}
              <div className="grid grid-cols-2 gap-3 bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">Texto do Botão de Ação (CTA)</label>
                  <input
                    type="text"
                    value={formCtaText}
                    onChange={e => setFormCtaText(e.target.value)}
                    placeholder="Ex: Baixar E-book Grátis 📥"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-purple-500 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block text-[11px]">Link de Destino</label>
                  <input
                    type="url"
                    value={formCtaUrl}
                    onChange={e => setFormCtaUrl(e.target.value)}
                    placeholder="https://mdtracker.app/r/ebook-gratis"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-purple-500 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Create Lead Switch */}
              <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-200 p-3 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Salvar seguidor como Lead no CRM</span>
                  <p className="text-[10px] text-slate-500">Cria o contato com origem 'Instagram Feed' e pontuação no Lead Scoring.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formCreateLead}
                  onChange={e => setFormCreateLead(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-extrabold shadow-md transition disabled:opacity-50"
                >
                  {submitting ? 'Salvando...' : editingRule ? 'Atualizar Automação' : 'Criar Automação'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
