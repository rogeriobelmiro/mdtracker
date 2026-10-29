import React, { useState, useMemo, useEffect } from 'react';
import { SmartPopup, PopupTriggerType, PopupActionType, Company, FunnelStage, FUNNEL_STAGES, Lead, MarketingWorkflow } from '../types';
import { 
  Plus, Edit3, Trash2, Copy, Check, Eye, Sparkles, Clock, 
  ArrowDown, LogOut, MessageCircle, X, Search, Sliders, Palette, 
  Settings2, Smartphone, CheckCircle2, AlertCircle, Play, Code,
  Users, ExternalLink, MessageSquare, FileText, Mail, Send, RefreshCw
} from 'lucide-react';
import { useDialog } from '../contexts/DialogContext';
import { submitPopupLead, generateAICopy, fetchWorkflows, sendTestPhaseEmail } from '../services/api';
import { NavTabId } from './Sidebar';

interface SmartPopupsManagerProps {
  popups: SmartPopup[];
  currentCompany: Company;
  leads?: Lead[];
  onNavigateToTab?: (tab: NavTabId) => void;
  onFilterLeadsByPopup?: (popupName: string) => void;
  onCreatePopup: (data: Partial<SmartPopup>) => Promise<void>;
  onUpdatePopup: (id: string, data: Partial<SmartPopup>) => Promise<void>;
  onDeletePopup: (id: string) => Promise<void>;
}

export const SmartPopupsManager: React.FC<SmartPopupsManagerProps> = ({
  popups,
  currentCompany,
  leads = [],
  onNavigateToTab,
  onFilterLeadsByPopup,
  onCreatePopup,
  onUpdatePopup,
  onDeletePopup
}) => {
  const { alert, confirm } = useDialog();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [triggerFilter, setTriggerFilter] = useState<'all' | PopupTriggerType>('all');

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPopup, setEditingPopup] = useState<SmartPopup | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'trigger' | 'fields' | 'appearance' | 'action'>('content');
  const [viewLeadsPopup, setViewLeadsPopup] = useState<SmartPopup | null>(null);

  // Marketing Workflows for Automation Integration
  const [availableWorkflows, setAvailableWorkflows] = useState<MarketingWorkflow[]>([]);

  useEffect(() => {
    if (currentCompany?.id) {
      fetchWorkflows(currentCompany.id)
        .then(setAvailableWorkflows)
        .catch(err => console.warn('Erro ao carregar fluxos de marketing para popups:', err));
    }
  }, [currentCompany?.id]);

  // Embed Snippet Modal
  const [snippetPopup, setSnippetPopup] = useState<SmartPopup | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Live Test Popup in Browser
  const [testingPopup, setTestingPopup] = useState<SmartPopup | null>(null);
  const [testSuccess, setTestSuccess] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  // Email Phase Test State
  const [popupTestEmail, setPopupTestEmail] = useState('');
  const [popupTestEmailLoading, setPopupTestEmailLoading] = useState(false);
  const [popupTestFeedback, setPopupTestFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestPopupEmail = async () => {
    if (!popupTestEmail || !popupTestEmail.includes('@')) {
      setPopupTestFeedback({ success: false, message: 'Digite um e-mail válido para receber o teste.' });
      return;
    }
    setPopupTestEmailLoading(true);
    setPopupTestFeedback({ success: true, message: 'Disparando e-mail de teste...' });
    try {
      const res = await sendTestPhaseEmail({
        companyId: currentCompany.id,
        targetEmail: popupTestEmail.trim(),
        subject: formData.emailSubject || `Confirmação de Contato - ${formData.name || currentCompany.name}`,
        body: formData.emailBody || 'Olá {nome}!\n\nRecebemos suas informações enviadas pelo nosso site e entraremos em contato em breve.\n\nAtenciosamente,\n{empresa}',
        phaseName: `Pop-up: ${formData.name || 'Captura'}`
      });
      if (res.success) {
        setPopupTestFeedback({ success: true, message: `✅ E-mail enviado com sucesso para ${popupTestEmail}!` });
      } else {
        setPopupTestFeedback({ success: false, message: `❌ ${res.error || 'Falha ao enviar e-mail.'}` });
      }
    } catch (err: any) {
      setPopupTestFeedback({ success: false, message: `❌ Erro: ${err.message}` });
    } finally {
      setPopupTestEmailLoading(false);
    }
  };

  // Form State for Create/Edit
  const [formData, setFormData] = useState<Partial<SmartPopup>>({
    name: '',
    active: true,
    triggerType: 'exit_intent',
    triggerValue: 50,
    showOncePerUser: true,
    title: 'Não vá embora antes de ver essa oportunidade!',
    subtitle: 'Cadastre-se agora e receba atendimento prioritário com condições exclusivas no WhatsApp.',
    badgeText: 'Oferta Especial ⚡',
    ctaText: 'Quero Aproveitar Agora',
    fields: [
      { id: 'f-name', name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Como prefere ser chamado?', required: true, enabled: true },
      { id: 'f-phone', name: 'phone', label: 'WhatsApp', type: 'tel', placeholder: '(11) 99999-9999', required: true, enabled: true },
      { id: 'f-email', name: 'email', label: 'E-mail Comercial', type: 'email', placeholder: 'seuemail@empresa.com', required: false, enabled: true }
    ],
    themeColor: '#10b981',
    backgroundColor: 'dark',
    buttonColor: '#10b981',
    buttonTextColor: '#ffffff',
    borderRadius: 'lg',
    actionType: 'whatsapp_redirect',
    whatsappPhone: currentCompany.phone || '5511987654321',
    whatsappMessage: 'Olá! Estava no site e preenchi o pop-up de oportunidade. Quero saber mais detalhes!',
    redirectUrl: '',
    successMessage: 'Perfeito! Seus dados foram salvos com sucesso.',
    targetStage: 'Novo Lead',
    tags: ['popup_captura', 'lead_site'],
    workflowId: '',
    autoTriggerWhatsApp: false,
    whatsappTemplate: 'Olá {nome}! Obrigado por se cadastrar no pop-up do nosso site. Em instantes um especialista falará com você!',
    autoTriggerEmail: false,
    emailSubject: 'Obrigado pelo seu contato - ' + (currentCompany.name || 'TrackerMD'),
    emailBody: 'Olá {nome},\n\nRecebemos seus dados através do formulário de oportunidade em nosso site.\n\nNossa equipe já está analisando suas informações para atendê-lo com prioridade.\n\nAtenciosamente,\n' + (currentCompany.name || 'TrackerMD')
  });

  // Filtered List
  const filteredPopups = useMemo(() => {
    return popups.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTrigger = triggerFilter === 'all' || p.triggerType === triggerFilter;
      return matchSearch && matchTrigger;
    });
  }, [popups, searchTerm, triggerFilter]);

  // Aggregate Metrics
  const stats = useMemo(() => {
    const total = popups.length;
    const activeCount = popups.filter(p => p.active).length;
    const impressions = popups.reduce((acc, p) => acc + (p.impressionsCount || 0), 0);
    const leads = popups.reduce((acc, p) => acc + (p.leadsCount || 0), 0);
    const avgConversion = impressions > 0 ? ((leads / impressions) * 100).toFixed(1) : '0.0';
    return { total, activeCount, impressions, leads, avgConversion };
  }, [popups]);

  // Open Create
  const handleOpenCreate = () => {
    setEditingPopup(null);
    setFormData({
      name: 'Novo Pop-up de Captura',
      active: true,
      triggerType: 'exit_intent',
      triggerValue: 50,
      showOncePerUser: true,
      title: 'Espere! Temos uma proposta especial para você',
      subtitle: 'Deixe seu WhatsApp para falar imediatamente com nosso time e garantir benefícios exclusivos.',
      badgeText: 'Condição Especial 🔥',
      ctaText: 'Falar com Consultor no WhatsApp',
      fields: [
        { id: 'f-name', name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Seu nome', required: true, enabled: true },
        { id: 'f-phone', name: 'phone', label: 'WhatsApp', type: 'tel', placeholder: '(11) 99999-9999', required: true, enabled: true },
        { id: 'f-email', name: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com', required: false, enabled: true }
      ],
      themeColor: '#2563eb',
      backgroundColor: 'dark',
      buttonColor: '#2563eb',
      buttonTextColor: '#ffffff',
      borderRadius: 'lg',
      actionType: 'whatsapp_redirect',
      whatsappPhone: currentCompany.phone || '5511987654321',
      whatsappMessage: 'Olá! Preenchi o formulário no site e gostaria de falar com um consultor.',
      redirectUrl: '',
      successMessage: 'Obrigado! Entraremos em contato em breve.',
      targetStage: 'Novo Lead',
      tags: ['popup_site'],
      workflowId: '',
      autoTriggerWhatsApp: false,
      whatsappTemplate: 'Olá {nome}! Obrigado por se cadastrar no pop-up do nosso site. Em instantes um especialista falará com você!',
      autoTriggerEmail: false,
      emailSubject: 'Obrigado pelo seu contato - ' + (currentCompany.name || 'TrackerMD'),
      emailBody: 'Olá {nome},\n\nRecebemos sua mensagem enviada através do pop-up do nosso site. Estamos prontos para te atender!\n\nAtenciosamente,\n' + (currentCompany.name || 'TrackerMD')
    });
    setActiveTab('content');
    setIsEditorOpen(true);
  };

  // Open Edit
  const handleOpenEdit = (popup: SmartPopup) => {
    setEditingPopup(popup);
    setFormData({
      ...popup,
      workflowId: popup.workflowId || '',
      autoTriggerWhatsApp: popup.autoTriggerWhatsApp || false,
      whatsappTemplate: popup.whatsappTemplate || 'Olá {nome}! Obrigado por se cadastrar no pop-up do nosso site. Em instantes um especialista falará com você!',
      autoTriggerEmail: popup.autoTriggerEmail || false,
      emailSubject: popup.emailSubject || ('Obrigado pelo seu contato - ' + (currentCompany.name || 'TrackerMD')),
      emailBody: popup.emailBody || ('Olá {nome},\n\nRecebemos sua mensagem enviada através do pop-up do nosso site. Estamos prontos para te atender!\n\nAtenciosamente,\n' + (currentCompany.name || 'TrackerMD'))
    });
    setActiveTab('content');
    setIsEditorOpen(true);
  };

  // Submit Save
  const handleSavePopup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPopup) {
        await onUpdatePopup(editingPopup.id, { ...formData, companyId: currentCompany.id });
      } else {
        await onCreatePopup({ ...formData, companyId: currentCompany.id });
      }
      setIsEditorOpen(false);
    } catch (err: any) {
      await alert('Erro ao salvar pop-up: ' + err.message);
    }
  };

  // Toggle Active
  const handleToggleActive = async (popup: SmartPopup) => {
    try {
      await onUpdatePopup(popup.id, { active: !popup.active, companyId: currentCompany.id });
    } catch (err: any) {
      await alert('Erro ao atualizar status: ' + err.message);
    }
  };

  // Delete
  const handleDelete = async (popup: SmartPopup) => {
    if (await confirm(`Deseja realmente excluir o pop-up "${popup.name}"?`)) {
      await onDeletePopup(popup.id);
    }
  };

  // AI Suggestion for Copywriting
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);

  const handleAISuggestCopy = async () => {
    setIsAiSuggesting(true);
    try {
      const prodName = formData.name || currentCompany.name || 'Serviço Exclusivo';
      const headlineRes = await generateAICopy({
        companyId: currentCompany.id,
        type: 'headlines',
        productName: prodName,
        targetAudience: 'Visitantes do site',
        tone: 'urgent',
        extraContext: 'Pop-up de conversão para capturar WhatsApp com oferta imperdível'
      });

      const selectedHeadline = headlineRes.items && headlineRes.items.length > 0
        ? headlineRes.items[Math.floor(Math.random() * headlineRes.items.length)]
        : 'Espere! Não vá embora antes de ver essa oportunidade!';

      const ctaRes = await generateAICopy({
        companyId: currentCompany.id,
        type: 'ctas',
        productName: prodName,
        tone: 'persuasive'
      });

      const selectedCta = ctaRes.items && ctaRes.items.length > 0
        ? ctaRes.items[Math.floor(Math.random() * ctaRes.items.length)]
        : 'Quero Meu Desconto no WhatsApp';

      setFormData(prev => ({
        ...prev,
        badgeText: 'Oferta Especial ⚡',
        title: selectedHeadline,
        subtitle: 'Deixe seu WhatsApp para falar imediatamente com nosso time e garantir benefícios exclusivos.',
        ctaText: selectedCta
      }));
    } catch {
      // Fallback
      setFormData(prev => ({
        ...prev,
        badgeText: 'Exclusivo para Novos Clientes ⚡',
        title: 'Espere! Não vá embora sem seu cupom de 15% OFF!',
        subtitle: 'Receba agora mesmo em seu WhatsApp o código de desconto para o seu primeiro pedido.',
        ctaText: 'Resgatar Meu Desconto VIP'
      }));
    } finally {
      setIsAiSuggesting(false);
    }
  };

  // Copy Snippet
  const getEmbedCode = (popup: SmartPopup) => {
    const origin = (typeof window !== 'undefined' && window.location.origin.includes('localhost'))
      ? 'https://mdtracker.mudadigital.com.br'
      : window.location.origin;
    return `<!-- Início Pop-up Inteligente TrackerMD -->\n<script src="${origin}/tracker/popup.js?id=${popup.id}" async></script>\n<!-- Fim Pop-up Inteligente TrackerMD -->`;
  };

  const handleCopySnippet = (popup: SmartPopup) => {
    const code = getEmbedCode(popup);
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2500);
  };

  // Trigger Description Helper
  const getTriggerLabel = (type: PopupTriggerType, val?: number) => {
    switch (type) {
      case 'exit_intent':
        return { label: 'Intenção de Saída (Exit Intent)', icon: LogOut, color: 'text-amber-600 bg-amber-50 border-amber-200' };
      case 'scroll':
        return { label: `Rolagem (${val || 50}% da página)`, icon: ArrowDown, color: 'text-blue-600 bg-blue-50 border-blue-200' };
      case 'timed_delay':
        return { label: `Tempo (${val || 5} segundos)`, icon: Clock, color: 'text-purple-600 bg-purple-50 border-purple-200' };
      case 'floating_button':
        return { label: 'Botão Flutuante (Canto da tela)', icon: MessageCircle, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    }
  };

  // Helper to get leads for a specific popup
  const getPopupLeads = (popup: SmartPopup) => {
    if (!leads || leads.length === 0) return [];
    const pName = popup.name.toLowerCase().trim();
    return leads.filter(l => {
      const matchSource = l.source?.toLowerCase().includes(pName);
      const matchUtm = l.utmCampaign?.toLowerCase() === pName;
      const matchLinkTitle = l.linkTitle?.toLowerCase() === pName;
      const matchNotes = l.notes?.toLowerCase().includes(pName);
      const matchEvents = l.conversionEvents?.some(e => 
        e.details?.toLowerCase().includes(pName) || 
        e.utmCampaign?.toLowerCase() === pName ||
        e.eventName?.toLowerCase().includes(pName) ||
        (e.type === 'popup' && (e.details?.toLowerCase().includes(pName) || e.utmCampaign?.toLowerCase() === pName))
      );
      return matchSource || matchUtm || matchLinkTitle || matchNotes || matchEvents;
    });
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Banner / Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sliders className="w-6 h-6 text-blue-600" />
              Pop-ups Inteligentes & Formulários de Captura
            </h1>
            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
              Estilo RD Station
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Crie pop-ups com gatilhos de <strong>Intenção de Saída</strong>, <strong>Rolagem</strong> e <strong>Tempo</strong>. 
            Instale com 1 linha de código no WordPress, Elementor ou Shopify e capture leads direto para o CRM e WhatsApp.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Pop-up Inteligente
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pop-ups Criados</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{stats.total}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {stats.activeCount} ativos no momento
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Impressões Totais</p>
          <p className="text-2xl font-black text-slate-800 mt-1">{stats.impressions.toLocaleString('pt-BR')}</p>
          <p className="text-[10px] text-slate-400 mt-1">Exibições para visitantes</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Leads Capturados</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{stats.leads.toLocaleString('pt-BR')}</p>
          <p className="text-[10px] text-slate-400 mt-1">Enviados ao Funil CRM</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Conversão Média</p>
          <p className="text-2xl font-black text-blue-600 mt-1">{stats.avgConversion}%</p>
          <p className="text-[10px] text-slate-400 mt-1">Taxa de preenchimento</p>
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-4 rounded-xl shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-blue-300 text-[11px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            IA Integrada
          </div>
          <p className="text-xs text-blue-100 mt-1 font-medium leading-relaxed">
            Copies com gatilhos mentais geradas pelo Google Gemini
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nome ou título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold whitespace-nowrap">Gatilho:</span>
          {(['all', 'exit_intent', 'scroll', 'timed_delay', 'floating_button'] as const).map(trig => (
            <button
              key={trig}
              onClick={() => setTriggerFilter(trig)}
              className={`px-3 py-1 rounded-md text-[11px] font-medium transition whitespace-nowrap ${
                triggerFilter === trig
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {trig === 'all' && 'Todos'}
              {trig === 'exit_intent' && '🚪 Saída'}
              {trig === 'scroll' && '📜 Rolagem'}
              {trig === 'timed_delay' && '⏱️ Tempo'}
              {trig === 'floating_button' && '🔘 Flutuante'}
            </button>
          ))}
        </div>
      </div>

      {/* Popups Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPopups.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-xl border border-slate-200 text-center">
            <Sliders className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">Nenhum pop-up inteligente encontrado</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Crie seu primeiro pop-up para capturar visitantes que estão prestes a sair do seu site e convertê-los em vendas.
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Criar Primeiro Pop-up
            </button>
          </div>
        ) : (
          filteredPopups.map((popup) => {
            const triggerInfo = getTriggerLabel(popup.triggerType, popup.triggerValue);
            const TriggerIcon = triggerInfo.icon;
            const convRate = popup.impressionsCount > 0 
              ? ((popup.leadsCount / popup.impressionsCount) * 100).toFixed(1)
              : '0.0';

            return (
              <div 
                key={popup.id} 
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${triggerInfo.color}`}>
                        <TriggerIcon className="w-3 h-3" />
                        {triggerInfo.label}
                      </span>
                      {popup.badgeText && (
                        <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                          {popup.badgeText}
                        </span>
                      )}
                    </div>

                    {/* Switch Active */}
                    <button
                      onClick={() => handleToggleActive(popup)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition flex items-center gap-1 cursor-pointer ${
                        popup.active 
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                      }`}
                      title={popup.active ? 'Clique para Pausar' : 'Clique para Ativar'}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${popup.active ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`}></span>
                      {popup.active ? 'Ativo' : 'Pausado'}
                    </button>
                  </div>

                  {/* Title & Preview Text */}
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{popup.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 italic">
                    "{popup.title}"
                  </p>

                  {/* Destination Info */}
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Ação:</span>
                      {popup.actionType === 'whatsapp_redirect' && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          WhatsApp Direto
                        </span>
                      )}
                      {popup.actionType === 'custom_url' && (
                        <span className="text-blue-700 font-bold">URL Externa</span>
                      )}
                      {popup.actionType === 'thank_you_message' && (
                        <span className="text-purple-700 font-bold">Mensagem na Tela</span>
                      )}
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">Estágio CRM:</span>
                      <span className="font-bold text-slate-700">{popup.targetStage}</span>
                    </div>
                    {(popup.workflowId || popup.autoTriggerWhatsApp || popup.autoTriggerEmail) && (
                      <>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1 text-emerald-600 font-semibold" title="Possui automação de WhatsApp, E-mail ou Workflow vinculada">
                          <Sparkles className="w-3 h-3 text-emerald-600" />
                          <span>Automação</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Impressões</p>
                      <p className="text-sm font-black text-slate-800 mt-0.5">{popup.impressionsCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Leads</p>
                      <button
                        type="button"
                        onClick={() => setViewLeadsPopup(popup)}
                        className="text-sm font-black text-emerald-600 mt-0.5 hover:underline flex items-center justify-center gap-1 mx-auto cursor-pointer"
                        title="Ver histórico de leads capturados neste pop-up"
                      >
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{popup.leadsCount || 0}</span>
                      </button>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Conversão</p>
                      <p className="text-sm font-black text-blue-600 mt-0.5">{convRate}%</p>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => {
                        setTestingPopup(popup);
                        setTestSuccess(false);
                      }}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-2.5 py-1.5 rounded-md transition flex items-center gap-1 cursor-pointer"
                      title="Testar como o visitante vê"
                    >
                      <Play className="w-3.5 h-3.5 text-blue-600" />
                      Testar
                    </button>
                    <button
                      onClick={() => setSnippetPopup(popup)}
                      className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold px-2.5 py-1.5 rounded-md transition flex items-center gap-1 cursor-pointer"
                      title="Obter código para colar no site"
                    >
                      <Code className="w-3.5 h-3.5" />
                      Instalar
                    </button>
                    <button
                      onClick={() => setViewLeadsPopup(popup)}
                      className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1.5 rounded-md transition flex items-center gap-1 cursor-pointer"
                      title="Ver histórico de leads capturados neste pop-up"
                    >
                      <Users className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Leads ({popup.leadsCount || 0})</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(popup)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition cursor-pointer"
                      title="Editar Pop-up"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(popup)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                      title="Excluir Pop-up"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL: EDITOR COMPLETO COM PREVIEW AO VIVO LADO A LADO   */}
      {/* ======================================================== */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600" />
                  {editingPopup ? `Editar: ${editingPopup.name}` : 'Criar Novo Pop-up Inteligente'}
                </h2>
                <p className="text-xs text-slate-500">Configure textos, gatilhos de saída, estilo e veja o resultado em tempo real.</p>
              </div>
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body: Left Tabs & Controls, Right Live Preview */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
              
              {/* Left Column (Config Controls): 7 cols */}
              <div className="lg:col-span-7 flex flex-col h-full overflow-hidden">
                
                {/* Tabs Bar */}
                <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-white overflow-x-auto text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('content')}
                    className={`pb-2.5 px-3 font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                      activeTab === 'content'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    1. Textos & Copy
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('trigger')}
                    className={`pb-2.5 px-3 font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                      activeTab === 'trigger'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    2. Gatilhos & Regras
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('fields')}
                    className={`pb-2.5 px-3 font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                      activeTab === 'fields'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    3. Formulário
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('appearance')}
                    className={`pb-2.5 px-3 font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                      activeTab === 'appearance'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    4. Aparência
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('action')}
                    className={`pb-2.5 px-3 font-semibold border-b-2 transition whitespace-nowrap cursor-pointer ${
                      activeTab === 'action'
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    5. Destino & CRM
                  </button>
                </div>

                {/* Form Controls by Tab */}
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                  
                  {/* TAB 1: Content */}
                  {activeTab === 'content' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-slate-700">Nome Interno do Pop-up *</label>
                        <button
                          type="button"
                          disabled={isAiSuggesting}
                          onClick={handleAISuggestCopy}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1.5 transition cursor-pointer border border-indigo-200 disabled:opacity-50"
                        >
                          <Sparkles className={`w-3.5 h-3.5 text-amber-500 ${isAiSuggesting ? 'animate-spin' : ''}`} />
                          {isAiSuggesting ? 'Gerando com IA...' : 'Sugerir com IA (Gemini)'}
                        </button>
                      </div>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Pop-up Saída - Desconto 15% Black Friday"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      />

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Badge Superior (Opcional)</label>
                        <input
                          type="text"
                          value={formData.badgeText || ''}
                          onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                          placeholder="Ex: Oferta Exclusiva ⚡ ou Últimas 3 Vagas"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Título Principal (Headline) *</label>
                        <input
                          type="text"
                          required
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Ex: Espere! Não vá embora antes de ver essa oportunidade!"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Subtítulo / Descrição da Oferta</label>
                        <textarea
                          rows={3}
                          value={formData.subtitle || ''}
                          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                          placeholder="Ex: Deixe seu WhatsApp para receber atendimento prioritário e garantir condições exclusivas agora mesmo."
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Texto do Botão CTA *</label>
                        <input
                          type="text"
                          required
                          value={formData.ctaText}
                          onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                          placeholder="Ex: Quero Meu Desconto no WhatsApp"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Trigger */}
                  {activeTab === 'trigger' && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">Quando esse pop-up deve aparecer?</label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          
                          {/* Exit Intent */}
                          <div 
                            onClick={() => setFormData({ ...formData, triggerType: 'exit_intent' })}
                            className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                              formData.triggerType === 'exit_intent'
                                ? 'border-amber-500 bg-amber-50/50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mb-1">
                              <LogOut className="w-4 h-4" />
                              Intenção de Saída
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Dispara quando o visitante move o mouse em direção à barra de abas ou fechar a página.
                            </p>
                          </div>

                          {/* Scroll */}
                          <div 
                            onClick={() => setFormData({ ...formData, triggerType: 'scroll' })}
                            className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                              formData.triggerType === 'scroll'
                                ? 'border-blue-500 bg-blue-50/50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs mb-1">
                              <ArrowDown className="w-4 h-4" />
                              Rolagem da Página
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Dispara quando o usuário desce até certa porcentagem da página (ex: 50%).
                            </p>
                          </div>

                          {/* Timed Delay */}
                          <div 
                            onClick={() => setFormData({ ...formData, triggerType: 'timed_delay' })}
                            className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                              formData.triggerType === 'timed_delay'
                                ? 'border-purple-500 bg-purple-50/50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 text-purple-700 font-bold text-xs mb-1">
                              <Clock className="w-4 h-4" />
                              Tempo de Permanência
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Dispara após alguns segundos de permanência do visitante no site.
                            </p>
                          </div>

                          {/* Floating Button */}
                          <div 
                            onClick={() => setFormData({ ...formData, triggerType: 'floating_button' })}
                            className={`p-3.5 rounded-xl border-2 transition cursor-pointer ${
                              formData.triggerType === 'floating_button'
                                ? 'border-emerald-500 bg-emerald-50/50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs mb-1">
                              <MessageCircle className="w-4 h-4" />
                              Botão Flutuante
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Exibe um botão flutuante elegante no canto que abre o formulário ao clicar.
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* Trigger Value Slider */}
                      {formData.triggerType === 'scroll' && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-700">Porcentagem de Rolagem</label>
                            <span className="text-xs font-black text-blue-600">{formData.triggerValue || 50}% da página</span>
                          </div>
                          <input
                            type="range"
                            min="10"
                            max="90"
                            step="5"
                            value={formData.triggerValue || 50}
                            onChange={(e) => setFormData({ ...formData, triggerValue: Number(e.target.value) })}
                            className="w-full accent-blue-600"
                          />
                        </div>
                      )}

                      {formData.triggerType === 'timed_delay' && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-bold text-slate-700">Tempo de Espera</label>
                            <span className="text-xs font-black text-purple-600">{formData.triggerValue || 5} segundos</span>
                          </div>
                          <input
                            type="range"
                            min="2"
                            max="30"
                            step="1"
                            value={formData.triggerValue || 5}
                            onChange={(e) => setFormData({ ...formData, triggerValue: Number(e.target.value) })}
                            className="w-full accent-purple-600"
                          />
                        </div>
                      )}

                      {/* Frequency Rule */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.showOncePerUser}
                            onChange={(e) => setFormData({ ...formData, showOncePerUser: e.target.checked })}
                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                          />
                          Exibir apenas 1 vez por visitante (Recomendado)
                        </label>
                        <p className="text-[11px] text-slate-500 mt-1 pl-6">
                          Evita incomodar o visitante caso ele já tenha visto ou fechado o pop-up nesta sessão.
                        </p>
                      </div>

                    </div>
                  )}

                  {/* TAB 3: Fields */}
                  {activeTab === 'fields' && (
                    <div className="space-y-4">
                      <p className="text-xs text-slate-500">
                        Escolha quais informações você deseja coletar do lead:
                      </p>

                      <div className="space-y-3">
                        {(formData.fields || []).map((field, idx) => (
                          <div key={field.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={field.enabled}
                                onChange={(e) => {
                                  const updated = [...(formData.fields || [])];
                                  updated[idx] = { ...field, enabled: e.target.checked };
                                  setFormData({ ...formData, fields: updated });
                                }}
                                className="w-4 h-4 rounded text-blue-600"
                              />
                              <div>
                                <p className="text-xs font-bold text-slate-800">{field.label}</p>
                                <p className="text-[10px] text-slate-400">Tipo: {field.type} • {field.required ? 'Obrigatório' : 'Opcional'}</p>
                              </div>
                            </div>

                            <label className="flex items-center gap-1.5 text-[11px] text-slate-600">
                              <input
                                type="checkbox"
                                checked={field.required}
                                disabled={!field.enabled}
                                onChange={(e) => {
                                  const updated = [...(formData.fields || [])];
                                  updated[idx] = { ...field, required: e.target.checked };
                                  setFormData({ ...formData, fields: updated });
                                }}
                                className="rounded text-blue-600"
                              />
                              Obrigatório
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* TAB 4: Appearance */}
                  {activeTab === 'appearance' && (
                    <div className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">Tema de Fundo</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {[
                            { id: 'dark', label: 'Dark Glass', bg: 'bg-slate-900 text-white' },
                            { id: 'light', label: 'Clean White', bg: 'bg-white text-slate-900 border border-slate-300' },
                            { id: 'emerald', label: 'Emerald Sales', bg: 'bg-emerald-900 text-white' },
                            { id: 'gradient', label: 'Gradient Indigo', bg: 'bg-gradient-to-r from-indigo-900 to-slate-900 text-white' },
                            { id: 'slate', label: 'Slate Pro', bg: 'bg-slate-800 text-white' }
                          ].map(t => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => setFormData({ ...formData, backgroundColor: t.id as any })}
                              className={`p-3 rounded-xl text-center font-bold transition cursor-pointer ${t.bg} ${
                                formData.backgroundColor === t.id ? 'ring-2 ring-blue-500 shadow-md' : 'opacity-80 hover:opacity-100'
                              }`}
                            >
                              {t.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">Cor do Botão de Ação (CTA)</label>
                        <div className="flex items-center gap-2 flex-wrap">
                          {[
                            { color: '#10b981', label: 'Verde WhatsApp' },
                            { color: '#2563eb', label: 'Azul Real' },
                            { color: '#7c3aed', label: 'Roxo Moderno' },
                            { color: '#f59e0b', label: 'Amber Solar' },
                            { color: '#ef4444', label: 'Vermelho Urgência' },
                            { color: '#0f172a', label: 'Preto Black' }
                          ].map(c => (
                            <button
                              key={c.color}
                              type="button"
                              onClick={() => setFormData({ ...formData, buttonColor: c.color })}
                              className={`w-8 h-8 rounded-full border-2 transition cursor-pointer ${
                                formData.buttonColor === c.color ? 'border-slate-900 scale-110 shadow-sm' : 'border-white'
                              }`}
                              style={{ backgroundColor: c.color }}
                              title={c.label}
                            />
                          ))}
                          <input
                            type="color"
                            value={formData.buttonColor || '#2563eb'}
                            onChange={(e) => setFormData({ ...formData, buttonColor: e.target.value })}
                            className="w-8 h-8 rounded-full border border-slate-300 p-0 cursor-pointer"
                            title="Cor personalizada"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">Arredondamento das Bordas</label>
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          {(['none', 'sm', 'md', 'lg'] as const).map(r => (
                            <button
                              key={r}
                              type="button"
                              onClick={() => setFormData({ ...formData, borderRadius: r })}
                              className={`p-2 rounded-lg border text-center font-medium transition cursor-pointer ${
                                formData.borderRadius === r ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold' : 'border-slate-200'
                              }`}
                            >
                              {r === 'none' && 'Retas (0px)'}
                              {r === 'sm' && 'Suave (6px)'}
                              {r === 'md' && 'Médio (12px)'}
                              {r === 'lg' && 'Curvo (20px)'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: Post Submit Action & CRM */}
                  {activeTab === 'action' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Ação Pós-Envio *</label>
                        <select
                          value={formData.actionType}
                          onChange={(e) => setFormData({ ...formData, actionType: e.target.value as PopupActionType })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                        >
                          <option value="whatsapp_redirect">Abrir WhatsApp Comercial com Mensagem Pronta</option>
                          <option value="thank_you_message">Exibir Mensagem de Sucesso na Tela</option>
                          <option value="custom_url">Redirecionar para URL Externa (Ex: Página de Vendas)</option>
                        </select>
                      </div>

                      {formData.actionType === 'whatsapp_redirect' && (
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200 space-y-3">
                          <div>
                            <label className="block text-xs font-bold text-emerald-900 mb-1">WhatsApp Comercial (DDD + Número)</label>
                            <input
                              type="text"
                              value={formData.whatsappPhone || ''}
                              onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                              placeholder="5511999999999"
                              className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-emerald-900 mb-1">Mensagem Inicial no WhatsApp</label>
                            <textarea
                              rows={2}
                              value={formData.whatsappMessage || ''}
                              onChange={(e) => setFormData({ ...formData, whatsappMessage: e.target.value })}
                              placeholder="Olá! Estava no site e preenchi o pop-up com a oferta."
                              className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                            />
                            <p className="text-[10px] text-emerald-700 mt-1">
                              Variáveis dinâmicas suportadas: <code className="font-bold">{'{name}'}</code>, <code className="font-bold">{'{phone}'}</code>
                            </p>
                          </div>
                        </div>
                      )}

                      {formData.actionType === 'custom_url' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">URL de Redirecionamento</label>
                          <input
                            type="url"
                            value={formData.redirectUrl || ''}
                            onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
                            placeholder="https://seusite.com/obrigado ou link de checkout"
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Mensagem de Sucesso</label>
                        <input
                          type="text"
                          value={formData.successMessage || ''}
                          onChange={(e) => setFormData({ ...formData, successMessage: e.target.value })}
                          placeholder="Obrigado! Entraremos em contato em breve."
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-200">
                        <label className="block text-xs font-bold text-slate-700 mb-1">Estágio Inicial no CRM</label>
                        <select
                          value={formData.targetStage}
                          onChange={(e) => setFormData({ ...formData, targetStage: e.target.value as FunnelStage })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          {FUNNEL_STAGES.map(stg => (
                            <option key={stg} value={stg}>{stg}</option>
                          ))}
                        </select>
                      </div>

                      {/* Automação & Disparos de Marketing */}
                      <div className="pt-3 border-t border-slate-200 space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                              Disparos & Automação de Marketing
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              Configure ações de WhatsApp e E-mail disparadas assim que o lead preencher o pop-up
                            </p>
                          </div>
                        </div>

                        {/* 1. Fluxo de Automação / Workflow */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-700">
                            Fluxo de Nutrição Automático (Workflow RD Style)
                          </label>
                          <select
                            value={formData.workflowId || ''}
                            onChange={e => setFormData({ ...formData, workflowId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                          >
                            <option value="">🚫 Nenhum fluxo de nutrição vinculado</option>
                            {availableWorkflows.map(wf => (
                              <option key={wf.id} value={wf.id}>
                                ⚡ {wf.name} ({wf.steps?.length || 0} passos {wf.active ? '• Ativo' : '• Pausado'})
                              </option>
                            ))}
                          </select>
                          <p className="text-[10px] text-slate-500">
                            O lead entrará automaticamente no fluxo selecionado, recebendo as sequências de e-mails, WhatsApps e mudanças de estágio configuradas.
                          </p>
                        </div>

                        {/* 2. Disparo Imediato de WhatsApp Marketing */}
                        <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-emerald-900">
                              <input
                                type="checkbox"
                                checked={formData.autoTriggerWhatsApp || false}
                                onChange={e => setFormData({
                                  ...formData,
                                  autoTriggerWhatsApp: e.target.checked,
                                  whatsappTemplate: formData.whatsappTemplate || 'Olá {nome}! Obrigado por se cadastrar no pop-up do nosso site. Em instantes um especialista falará com você!'
                                })}
                                className="w-4 h-4 text-emerald-600 rounded"
                              />
                              <div className="flex items-center gap-1.5">
                                <MessageSquare className="w-4 h-4 text-emerald-600" />
                                <span>Disparar WhatsApp Marketing Imediato</span>
                              </div>
                            </label>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              formData.autoTriggerWhatsApp ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {formData.autoTriggerWhatsApp ? 'Ativado' : 'Desativado'}
                            </span>
                          </div>

                          {formData.autoTriggerWhatsApp && (
                            <div className="space-y-2 pt-1 border-t border-emerald-200/60">
                              <div className="flex items-center justify-between">
                                <label className="block text-[11px] font-semibold text-emerald-800">
                                  Mensagem do WhatsApp (via API do Sistema):
                                </label>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{'{nome}'}</span>
                                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{'{empresa}'}</span>
                                </div>
                              </div>
                              <textarea
                                rows={3}
                                value={formData.whatsappTemplate || ''}
                                onChange={e => setFormData({ ...formData, whatsappTemplate: e.target.value })}
                                placeholder="Olá {nome}! Obrigado por se cadastrar..."
                                className="w-full px-3 py-2 border border-emerald-300 rounded-lg bg-white text-xs text-slate-800 focus:ring-1 focus:ring-emerald-400"
                              />
                              <p className="text-[10px] text-emerald-700">
                                ⚡ Essa mensagem é disparada instantaneamente para o número de WhatsApp informado no pop-up.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* 3. Disparo Imediato de E-mail Marketing */}
                        <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200/80 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-blue-900">
                              <input
                                type="checkbox"
                                checked={formData.autoTriggerEmail || false}
                                onChange={e => setFormData({
                                  ...formData,
                                  autoTriggerEmail: e.target.checked,
                                  emailSubject: formData.emailSubject || ('Obrigado pelo seu contato - ' + (currentCompany.name || 'TrackerMD')),
                                  emailBody: formData.emailBody || ('Olá {nome},\n\nRecebemos sua mensagem enviada através do pop-up do nosso site. Estamos prontos para te atender!\n\nAtenciosamente,\n' + (currentCompany.name || 'TrackerMD'))
                                })}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <div className="flex items-center gap-1.5">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span>Disparar E-mail Marketing Imediato</span>
                              </div>
                            </label>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              formData.autoTriggerEmail ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {formData.autoTriggerEmail ? 'Ativado' : 'Desativado'}
                            </span>
                          </div>

                          {formData.autoTriggerEmail && (
                            <div className="space-y-2 pt-1 border-t border-blue-200/60">
                              <div>
                                <label className="block text-[11px] font-semibold text-blue-800 mb-1">
                                  Assunto do E-mail:
                                </label>
                                <input
                                  type="text"
                                  value={formData.emailSubject || ''}
                                  onChange={e => setFormData({ ...formData, emailSubject: e.target.value })}
                                  placeholder="Assunto do e-mail..."
                                  className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white text-xs text-slate-800 focus:ring-1 focus:ring-blue-400"
                                />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-[11px] font-semibold text-blue-800">
                                    Corpo do E-mail:
                                  </label>
                                  <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{'{nome}'}</span>
                                    <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{'{empresa}'}</span>
                                  </div>
                                </div>
                                <textarea
                                  rows={4}
                                  value={formData.emailBody || ''}
                                  onChange={e => setFormData({ ...formData, emailBody: e.target.value })}
                                  placeholder="Corpo do e-mail..."
                                  className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white text-xs text-slate-800 font-sans focus:ring-1 focus:ring-blue-400"
                                />
                              </div>
                              <p className="text-[10px] text-blue-700">
                                ✉️ O e-mail é enviado imediatamente se o campo de e-mail estiver habilitado e preenchido no pop-up.
                              </p>

                              {/* Direct Test Bar for This Pop-up Email */}
                              <div className="pt-2 border-t border-blue-200/60 bg-blue-100/60 p-2.5 rounded-lg space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                                    Testar Disparo Deste E-mail (Fase de Pop-up)
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="email"
                                    placeholder="Digite seu e-mail para receber este teste..."
                                    value={popupTestEmail}
                                    onChange={e => setPopupTestEmail(e.target.value)}
                                    className="flex-1 bg-white border border-blue-300 rounded px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleTestPopupEmail}
                                    disabled={popupTestEmailLoading}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-3 py-1 rounded text-xs transition flex items-center gap-1.5 shrink-0 shadow-2xs"
                                  >
                                    {popupTestEmailLoading ? (
                                      <RefreshCw className="w-3 h-3 animate-spin" />
                                    ) : (
                                      <Send className="w-3 h-3" />
                                    )}
                                    <span>Testar Fase</span>
                                  </button>
                                </div>
                                {popupTestFeedback && (
                                  <div className={`text-[11px] p-1.5 rounded font-medium ${
                                    popupTestFeedback.success 
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                      : 'bg-red-100 text-red-800 border border-red-200'
                                  }`}>
                                    {popupTestFeedback.message}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer Save / Cancel */}
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePopup}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    Salvar Pop-up
                  </button>
                </div>

              </div>

              {/* Right Column: Interactive Live Preview (5 cols) */}
              <div className="lg:col-span-5 bg-slate-900/95 p-6 flex flex-col justify-center items-center relative overflow-hidden">
                <div className="absolute top-3 left-4 flex items-center gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  Preview em Tempo Real
                </div>

                {/* Simulated Modal Preview */}
                <div 
                  className={`w-full max-w-sm p-6 text-center shadow-2xl relative transition-all duration-300 border ${
                    formData.backgroundColor === 'dark' ? 'bg-[#0f172a] text-white border-slate-700/80' :
                    formData.backgroundColor === 'emerald' ? 'bg-[#064e3b] text-white border-emerald-700/80' :
                    formData.backgroundColor === 'gradient' ? 'bg-gradient-to-br from-indigo-950 to-slate-900 text-white border-indigo-700/50' :
                    formData.backgroundColor === 'slate' ? 'bg-[#1e293b] text-white border-slate-600' :
                    'bg-white text-slate-900 border-slate-200'
                  }`}
                  style={{
                    borderRadius: formData.borderRadius === 'none' ? '0px' :
                                  formData.borderRadius === 'sm' ? '6px' :
                                  formData.borderRadius === 'md' ? '12px' : '20px'
                  }}
                >
                  {/* Close button mock */}
                  <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/10 flex items-center justify-center text-xs opacity-75">
                    &times;
                  </div>

                  {/* Badge */}
                  {formData.badgeText && (
                    <div 
                      className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2.5"
                      style={{
                        backgroundColor: `${formData.buttonColor}20`,
                        color: formData.buttonColor
                      }}
                    >
                      {formData.badgeText}
                    </div>
                  )}

                  {/* Title */}
                  <h4 className="text-base font-extrabold leading-tight mb-1.5">
                    {formData.title || 'Título do Pop-up'}
                  </h4>

                  {/* Subtitle */}
                  {formData.subtitle && (
                    <p className="text-[11px] opacity-80 leading-relaxed mb-4">
                      {formData.subtitle}
                    </p>
                  )}

                  {/* Inputs */}
                  <div className="space-y-2 mb-3 text-left">
                    {(formData.fields || []).filter(f => f.enabled).map(f => (
                      <div key={f.id}>
                        <label className="block text-[10px] font-semibold opacity-85 mb-0.5">
                          {f.label} {f.required && '*'}
                        </label>
                        <input
                          type={f.type}
                          disabled
                          placeholder={f.placeholder}
                          className={`w-full px-3 py-1.5 text-xs rounded-lg border outline-none ${
                            formData.backgroundColor === 'light'
                              ? 'bg-slate-50 border-slate-300 text-slate-800'
                              : 'bg-white/10 border-white/20 text-white placeholder-slate-400'
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <button
                    type="button"
                    className="w-full py-2.5 px-4 font-bold text-xs rounded-lg transition shadow-md flex items-center justify-center gap-1.5"
                    style={{
                      backgroundColor: formData.buttonColor || '#2563eb',
                      color: formData.buttonTextColor || '#ffffff'
                    }}
                  >
                    {formData.ctaText || 'Quero Aproveitar'}
                  </button>

                  <p className="text-[9px] opacity-50 mt-2">
                    🔒 Seus dados estão protegidos.
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: INSTALAR CÓDIGO DO POP-UP NO SITE (SNIPPET)      */}
      {/* ======================================================== */}
      {snippetPopup && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Instalar Pop-up em Qualquer Site</h3>
              </div>
              <button 
                onClick={() => setSnippetPopup(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Copie o código abaixo e cole no seu site (WordPress, Elementor, Hotmart, Wix, Shopify ou HTML). 
              O script é ultra-leve (menos de 3kb) e detecta automaticamente intenção de saída ou rolagem:
            </p>

            <div className="relative bg-slate-900 rounded-xl p-4 font-mono text-xs text-emerald-400 mb-4 overflow-x-auto border border-slate-800">
              <pre className="whitespace-pre-wrap">{getEmbedCode(snippetPopup)}</pre>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 mb-5 text-xs text-blue-900 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                Onde colar esse código?
              </p>
              <ul className="list-disc pl-5 text-[11px] text-blue-800 space-y-0.5">
                <li><strong>WordPress / Elementor</strong>: Insira via plugin "Insert Headers and Footers" ou no rodapé do tema.</li>
                <li><strong>Landing Pages</strong>: Cole logo antes da tag de fechamento <code className="bg-blue-100 px-1 py-0.5 rounded">&lt;/body&gt;</code>.</li>
                <li>Os leads capturados aparecerão automaticamente no seu CRM e no WhatsApp em tempo real!</li>
              </ul>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setSnippetPopup(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => handleCopySnippet(snippetPopup)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {copiedSnippet ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    Copiado com Sucesso!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar Código do Script
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: TESTADOR AO VIVO (COMO O VISITANTE VÊ NA PRÁTICA) */}
      {/* ======================================================== */}
      {testingPopup && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div 
            className={`w-full max-w-md p-8 text-center shadow-2xl relative border ${
              testingPopup.backgroundColor === 'dark' ? 'bg-[#0f172a] text-white border-slate-700' :
              testingPopup.backgroundColor === 'emerald' ? 'bg-[#064e3b] text-white border-emerald-700' :
              testingPopup.backgroundColor === 'gradient' ? 'bg-gradient-to-br from-indigo-950 to-slate-900 text-white border-indigo-700' :
              testingPopup.backgroundColor === 'slate' ? 'bg-[#1e293b] text-white border-slate-600' :
              'bg-white text-slate-900 border-slate-200'
            }`}
            style={{
              borderRadius: testingPopup.borderRadius === 'none' ? '0px' :
                            testingPopup.borderRadius === 'sm' ? '8px' :
                            testingPopup.borderRadius === 'md' ? '14px' : '24px'
            }}
          >
            <button 
              onClick={() => setTestingPopup(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-black/20 hover:bg-black/40 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!testSuccess ? (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  setTestLoading(true);
                  const fd = new FormData(e.currentTarget);
                  try {
                    await submitPopupLead(testingPopup.id, {
                      name: fd.get('name') || 'Lead Teste',
                      phone: fd.get('phone') || '11999999999',
                      email: fd.get('email') || '',
                      pageUrl: window.location.href,
                      utmSource: 'popup_preview',
                      utmCampaign: testingPopup.name
                    });
                    setTestSuccess(true);
                  } catch (err: any) {
                    await alert('Erro no envio do teste: ' + err.message);
                  } finally {
                    setTestLoading(false);
                  }
                }}
              >
                {testingPopup.badgeText && (
                  <div 
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
                    style={{
                      backgroundColor: `${testingPopup.buttonColor}25`,
                      color: testingPopup.buttonColor
                    }}
                  >
                    {testingPopup.badgeText}
                  </div>
                )}

                <h3 className="text-xl font-black leading-tight mb-2">{testingPopup.title}</h3>
                {testingPopup.subtitle && (
                  <p className="text-xs opacity-85 leading-relaxed mb-6">{testingPopup.subtitle}</p>
                )}

                <div className="space-y-3 mb-5 text-left">
                  {(testingPopup.fields || []).filter(f => f.enabled).map(f => (
                    <div key={f.id}>
                      <label className="block text-[11px] font-semibold opacity-90 mb-1">
                        {f.label} {f.required && '*'}
                      </label>
                      <input
                        type={f.type}
                        name={f.name}
                        required={f.required}
                        placeholder={f.placeholder}
                        className={`w-full px-3.5 py-2.5 text-xs rounded-lg border outline-none ${
                          testingPopup.backgroundColor === 'light'
                            ? 'bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-600'
                            : 'bg-white/10 border-white/20 text-white placeholder-slate-400 focus:border-white'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={testLoading}
                  className="w-full py-3.5 px-4 font-bold text-sm rounded-lg transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: testingPopup.buttonColor || '#2563eb',
                    color: testingPopup.buttonTextColor || '#ffffff'
                  }}
                >
                  {testLoading ? 'Enviando...' : (testingPopup.ctaText || 'Quero Aproveitar')}
                </button>
              </form>
            ) : (
              <div className="py-8 space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl">
                  🎉
                </div>
                <h4 className="text-lg font-black">Lead Registrado no CRM com Sucesso!</h4>
                <p className="text-xs opacity-85 leading-relaxed max-w-xs mx-auto">
                  {testingPopup.successMessage || 'Obrigado! Suas informações foram enviadas para o funil de atendimento.'}
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setTestingPopup(null)}
                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-lg transition cursor-pointer"
                  >
                    Fechar Demonstração
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: HISTÓRICO DE LEADS CAPTURADOS NO POP-UP           */}
      {/* ======================================================== */}
      {viewLeadsPopup && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-scale-in flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Histórico de Leads do Pop-up
                  </h3>
                  <p className="text-xs text-slate-500">
                    {viewLeadsPopup.name} • {viewLeadsPopup.leadsCount || 0} lead(s) registrados
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewLeadsPopup(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {(() => {
                const popLeads = getPopupLeads(viewLeadsPopup);
                if (popLeads.length === 0) {
                  return (
                    <div className="py-10 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
                      <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-700">Nenhum lead encontrado neste filtro</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                        Clique em "Testar" no card para simular uma captura ou verifique no CRM todos os leads cadastrados.
                      </p>
                      {onFilterLeadsByPopup && (
                        <button
                          onClick={() => {
                            const name = viewLeadsPopup.name;
                            setViewLeadsPopup(null);
                            onFilterLeadsByPopup(name);
                          }}
                          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Abrir Aba do CRM</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                }

                return popLeads.map(lead => (
                  <div key={lead.id} className="bg-slate-50 hover:bg-slate-100/70 p-4 rounded-xl border border-slate-200 text-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{lead.name}</span>
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
                          POP-UP
                        </span>
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-100">
                          {lead.stage}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-3">
                        {lead.phone && <span>WhatsApp: <strong className="text-slate-700">{lead.phone}</strong></span>}
                        {lead.email && <span>E-mail: <strong className="text-slate-700">{lead.email}</strong></span>}
                        {lead.createdAt && (
                          <span className="text-slate-400">
                            Capturado em: {new Date(lead.createdAt).toLocaleDateString('pt-BR')} às {new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {onFilterLeadsByPopup && (
                        <button
                          onClick={() => {
                            const name = viewLeadsPopup.name;
                            setViewLeadsPopup(null);
                            onFilterLeadsByPopup(name);
                          }}
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-3 py-1.5 rounded-lg transition text-xs flex items-center gap-1 cursor-pointer shadow-xs"
                          title="Ver detalhes completos e timeline do lead no CRM"
                        >
                          <span>Ver no CRM</span>
                          <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>

            <div className="pt-4 border-t border-slate-200 mt-4 flex items-center justify-between">
              {onFilterLeadsByPopup && (
                <button
                  onClick={() => {
                    const name = viewLeadsPopup.name;
                    setViewLeadsPopup(null);
                    onFilterLeadsByPopup(name);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Filtrar todos no CRM</span>
                </button>
              )}
              <button
                onClick={() => setViewLeadsPopup(null)}
                className="ml-auto bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
