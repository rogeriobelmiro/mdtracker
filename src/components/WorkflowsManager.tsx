import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Edit3, 
  Clock, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Users, 
  Zap, 
  Copy, 
  Sparkles, 
  Tag, 
  Sliders, 
  RotateCcw, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  ShieldAlert,
  Send,
  HelpCircle,
  X
} from 'lucide-react';
import { 
  MarketingWorkflow, 
  WorkflowStep, 
  WorkflowTriggerType, 
  WorkflowActionType, 
  WorkflowExecutionLog, 
  FunnelStage, 
  FUNNEL_STAGES,
  Lead, 
  Company 
} from '../types';
import { 
  fetchWorkflows, 
  createWorkflow, 
  updateWorkflow, 
  deleteWorkflow, 
  toggleWorkflow, 
  testRunWorkflow, 
  fetchWorkflowLogs 
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';

interface WorkflowsManagerProps {
  currentCompany: Company;
  leads: Lead[];
  onNavigateToTab?: (tab: 'dashboard' | 'links' | 'leads' | 'events' | 'broadcast' | 'chat' | 'users' | 'company' | 'products' | 'popups' | 'ai' | 'chatbot' | 'workflows') => void;
}

export const WorkflowsManager: React.FC<WorkflowsManagerProps> = ({
  currentCompany,
  leads,
  onNavigateToTab
}) => {
  const { alert, confirm } = useDialog();
  const [workflows, setWorkflows] = useState<MarketingWorkflow[]>([]);
  const [logs, setLogs] = useState<WorkflowExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'workflows' | 'templates' | 'logs'>('workflows');

  // Modal Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Partial<MarketingWorkflow> | null>(null);
  const [saving, setSaving] = useState(false);

  // Test Run Simulation Modal
  const [testModalWorkflow, setTestModalWorkflow] = useState<MarketingWorkflow | null>(null);
  const [testSelectedLeadId, setTestSelectedLeadId] = useState<string>('');
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [wfs, lgs] = await Promise.all([
        fetchWorkflows(currentCompany.id),
        fetchWorkflowLogs(currentCompany.id)
      ]);
      setWorkflows(wfs);
      setLogs(lgs);
    } catch (err: any) {
      console.error('Erro ao carregar dados de automação:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentCompany.id]);

  // General Metrics
  const activeCount = workflows.filter(w => w.active).length;
  const totalEnrolled = workflows.reduce((acc, w) => acc + (w.enrolledCount || 0), 0);
  const totalExecuted = workflows.reduce((acc, w) => acc + (w.executedCount || 0), 0);
  const totalConversions = workflows.reduce((acc, w) => acc + (w.conversionsCount || 0), 0);

  // Ready-to-use Templates
  const workflowTemplates = [
    {
      title: '🚀 Boas-Vindas & Nutrição Imediata',
      subtitle: 'Ideal para novos leads vindos de anúncios ou pop-ups.',
      triggerType: 'lead_created' as WorkflowTriggerType,
      triggerConfig: {},
      steps: [
        {
          id: 'step-1',
          type: 'send_whatsapp' as WorkflowActionType,
          title: 'Enviar WhatsApp de Boas-Vindas',
          messageTemplate: 'Olá, {nome}! Seja muito bem-vindo(a) à {empresa}! Recebemos seu interesse e preparamos um conteúdo especial para você: {link_checkout}. Ficou com alguma dúvida inicial?'
        },
        {
          id: 'step-2',
          type: 'wait_delay' as WorkflowActionType,
          title: 'Aguardar 2 Horas',
          delayMinutes: 120
        },
        {
          id: 'step-3',
          type: 'send_email' as WorkflowActionType,
          title: 'Enviar E-mail com Conteúdo Exclusivo',
          emailSubject: 'Seu guia exclusivo da {empresa}',
          emailBody: 'Olá {nome}, preparamos esse guia especial para acelerar seus resultados. Conte com nosso time comercial!'
        },
        {
          id: 'step-4',
          type: 'change_stage' as WorkflowActionType,
          title: 'Mover Lead para "Contatado"',
          targetStage: 'Contatado' as FunnelStage
        }
      ]
    },
    {
      title: '🛒 Recuperação de Proposta / Negociação Aberta',
      subtitle: 'Resgata leads em negociação oferecendo condição especial.',
      triggerType: 'stage_changed' as WorkflowTriggerType,
      triggerConfig: { stage: 'Em Negociação' as FunnelStage },
      steps: [
        {
          id: 'step-1',
          type: 'wait_delay' as WorkflowActionType,
          title: 'Aguardar 4 Horas',
          delayMinutes: 240
        },
        {
          id: 'step-2',
          type: 'send_whatsapp' as WorkflowActionType,
          title: 'Disparar Oferta Especial com Desconto no WhatsApp',
          messageTemplate: 'Oi, {nome}! Notei que você estava analisando nossa proposta. Consegui liberar uma condição especial exclusiva válida para hoje: 10% de desconto ou bônus premium! Vamos garantir sua vaga agora?'
        },
        {
          id: 'step-3',
          type: 'notify_user' as WorkflowActionType,
          title: 'Notificar Equipe de Vendas',
          notifyMessage: 'Lead {nome} ({telefone}) recebeu proposta de fechamento automático.'
        }
      ]
    },
    {
      title: '⭐ Onboarding & Pós-Venda VIP (Lead Convertido)',
      subtitle: 'Nutrição pós-compra, entrega de links e coleta de nota NPS.',
      triggerType: 'stage_changed' as WorkflowTriggerType,
      triggerConfig: { stage: 'Convertido' as FunnelStage },
      steps: [
        {
          id: 'step-1',
          type: 'send_whatsapp' as WorkflowActionType,
          title: 'Enviar Agradecimento & Acesso VIP no WhatsApp',
          messageTemplate: 'Parabéns pela decisão, {nome}! 🎉 Seu acesso aos nossos serviços da {empresa} foi liberado com sucesso. Qualquer suporte que precisar, nossa equipe está 100% à sua disposição por aqui!'
        },
        {
          id: 'step-2',
          type: 'add_tag' as WorkflowActionType,
          title: 'Adicionar Tag "cliente_vip"',
          tag: 'cliente_vip'
        },
        {
          id: 'step-3',
          type: 'wait_delay' as WorkflowActionType,
          title: 'Aguardar 24 Horas',
          delayMinutes: 1440
        },
        {
          id: 'step-4',
          type: 'send_whatsapp' as WorkflowActionType,
          title: 'Solicitar Avaliação e Feedback',
          messageTemplate: 'Olá {nome}! Passando para saber como foi sua primeira impressão com a {empresa}. De 0 a 10, que nota você daria para o nosso atendimento?'
        }
      ]
    },
    {
      title: '🔄 Reativação de Contatos Perdidos',
      subtitle: 'Reengaja oportunidades arquivadas após 7 dias de inatividade.',
      triggerType: 'stage_changed' as WorkflowTriggerType,
      triggerConfig: { stage: 'Perdido' as FunnelStage },
      steps: [
        {
          id: 'step-1',
          type: 'wait_delay' as WorkflowActionType,
          title: 'Aguardar 7 Dias',
          delayMinutes: 10080
        },
        {
          id: 'step-2',
          type: 'send_whatsapp' as WorkflowActionType,
          title: 'Mensagem Amigável de Reativação',
          messageTemplate: 'Olá {nome}! Tudo bem? Sei que no momento anterior não foi a hora ideal para avançarmos. Lançamos uma novidade na {empresa} que pode ser exatamente o que você precisava. Posso te apresentar rapidamente?'
        }
      ]
    }
  ];

  const handleToggleActive = async (wf: MarketingWorkflow) => {
    try {
      const updated = await toggleWorkflow(wf.id, !wf.active);
      setWorkflows(prev => prev.map(w => w.id === wf.id ? updated : w));
    } catch (err: any) {
      alert(err.message || 'Erro ao alterar status do fluxo', 'error');
    }
  };

  const handleDelete = async (wf: MarketingWorkflow) => {
    const ok = await confirm({
      title: 'Excluir Fluxo de Automação',
      message: `Tem certeza que deseja excluir o fluxo "${wf.name}"? Esta ação não pode ser desfeita.`
    });
    if (!ok) return;

    try {
      await deleteWorkflow(wf.id);
      setWorkflows(prev => prev.map(w => w).filter(w => w.id !== wf.id));
      alert('Fluxo excluído com sucesso!', 'success');
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir fluxo', 'error');
    }
  };

  const handleOpenCreateNew = () => {
    setEditingWorkflow({
      companyId: currentCompany.id,
      name: 'Novo Fluxo de Nutrição',
      description: 'Envio automático de mensagens e ações para conversão de leads.',
      active: true,
      triggerType: 'lead_created',
      triggerConfig: {},
      steps: [
        {
          id: `step-${Date.now()}-1`,
          type: 'send_whatsapp',
          title: 'Mensagem de WhatsApp',
          messageTemplate: 'Olá, {nome}! Recebemos seu interesse na {empresa}. Como podemos te ajudar hoje?'
        }
      ],
      enrolledCount: 0,
      executedCount: 0,
      conversionsCount: 0
    });
    setIsEditorOpen(true);
  };

  const handleApplyTemplate = (tmpl: any) => {
    setEditingWorkflow({
      companyId: currentCompany.id,
      name: tmpl.title.replace(/^[^\s]+\s/, ''),
      description: tmpl.subtitle,
      active: true,
      triggerType: tmpl.triggerType,
      triggerConfig: tmpl.triggerConfig,
      steps: JSON.parse(JSON.stringify(tmpl.steps)),
      enrolledCount: 0,
      executedCount: 0,
      conversionsCount: 0
    });
    setIsEditorOpen(true);
  };

  const handleSaveWorkflow = async () => {
    if (!editingWorkflow?.name?.trim()) {
      alert('Informe o nome do fluxo.', 'warning');
      return;
    }

    if (!editingWorkflow.steps || editingWorkflow.steps.length === 0) {
      alert('Adicione pelo menos uma ação ao fluxo.', 'warning');
      return;
    }

    setSaving(true);
    try {
      if (editingWorkflow.id) {
        const updated = await updateWorkflow(editingWorkflow.id, editingWorkflow);
        setWorkflows(prev => prev.map(w => w.id === updated.id ? updated : w));
        alert('Fluxo atualizado com sucesso!', 'success');
      } else {
        const created = await createWorkflow(editingWorkflow);
        setWorkflows(prev => [created, ...prev]);
        alert('Fluxo criado com sucesso!', 'success');
      }
      setIsEditorOpen(false);
      setEditingWorkflow(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar fluxo', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddStepToEditing = (type: WorkflowActionType) => {
    if (!editingWorkflow) return;
    const newId = `step-${Date.now()}`;
    let newStep: WorkflowStep = {
      id: newId,
      type,
      title: 'Novo Passo'
    };

    switch (type) {
      case 'wait_delay':
        newStep.title = 'Aguardar Intervalo';
        newStep.delayMinutes = 60;
        break;
      case 'send_whatsapp':
        newStep.title = 'Enviar WhatsApp';
        newStep.messageTemplate = 'Olá {nome}, tudo bem? Passando para te atualizar sobre nossa novidade!';
        break;
      case 'send_email':
        newStep.title = 'Enviar E-mail';
        newStep.emailSubject = 'Novidade para você da {empresa}';
        newStep.emailBody = 'Olá {nome}, aqui está o link com os detalhes do seu interesse...';
        break;
      case 'change_stage':
        newStep.title = 'Mover Estágio no CRM';
        newStep.targetStage = 'Contatado';
        break;
      case 'add_tag':
        newStep.title = 'Adicionar Tag';
        newStep.tag = 'interessado';
        break;
      case 'notify_user':
        newStep.title = 'Notificar Equipe';
        newStep.notifyMessage = 'Lead {nome} avançou no fluxo de nutrição.';
        break;
    }

    setEditingWorkflow({
      ...editingWorkflow,
      steps: [...(editingWorkflow.steps || []), newStep]
    });
  };

  const handleUpdateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    if (!editingWorkflow || !editingWorkflow.steps) return;
    setEditingWorkflow({
      ...editingWorkflow,
      steps: editingWorkflow.steps.map(s => s.id === stepId ? { ...s, ...updates } : s)
    });
  };

  const handleRemoveStep = (stepId: string) => {
    if (!editingWorkflow || !editingWorkflow.steps) return;
    setEditingWorkflow({
      ...editingWorkflow,
      steps: editingWorkflow.steps.filter(s => s.id !== stepId)
    });
  };

  const handleMoveStep = (index: number, direction: 'up' | 'down') => {
    if (!editingWorkflow || !editingWorkflow.steps) return;
    const steps = [...editingWorkflow.steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;
    const temp = steps[index];
    steps[index] = steps[targetIndex];
    steps[targetIndex] = temp;
    setEditingWorkflow({ ...editingWorkflow, steps });
  };

  const handleRunSimulation = async () => {
    if (!testModalWorkflow) return;
    setTestRunning(true);
    setTestResult(null);

    try {
      const res = await testRunWorkflow(testModalWorkflow.id, {
        leadId: testSelectedLeadId || undefined,
        companyId: currentCompany.id
      });
      setTestResult(res);
      // Reload logs
      const updatedLogs = await fetchWorkflowLogs(currentCompany.id);
      setLogs(updatedLogs);
    } catch (err: any) {
      alert(err.message || 'Erro ao simular fluxo', 'error');
    } finally {
      setTestRunning(false);
    }
  };

  const getTriggerLabel = (type: WorkflowTriggerType, config?: any) => {
    switch (type) {
      case 'lead_created':
        return 'Novo Lead Cadastrado';
      case 'stage_changed':
        return `Lead mudou para estágio "${config?.stage || 'Qualquer'}"`;
      case 'product_purchased':
        return 'Compra de Produto Concluída';
      case 'popup_submitted':
        return 'Lead capturado em Pop-up';
      case 'tag_added':
        return `Tag "${config?.tag || ''}" adicionada`;
      default:
        return type;
    }
  };

  const getActionBadge = (type: WorkflowActionType) => {
    switch (type) {
      case 'send_whatsapp':
        return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200"><MessageSquare className="w-3 h-3 text-emerald-600" /> WhatsApp</span>;
      case 'wait_delay':
        return <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-200"><Clock className="w-3 h-3 text-amber-600" /> Espera</span>;
      case 'send_email':
        return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-200"><Mail className="w-3 h-3 text-blue-600" /> E-mail</span>;
      case 'change_stage':
        return <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded border border-purple-200"><Sliders className="w-3 h-3 text-purple-600" /> Mudar Estágio</span>;
      case 'add_tag':
        return <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded border border-indigo-200"><Tag className="w-3 h-3 text-indigo-600" /> Tag</span>;
      case 'notify_user':
        return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-200"><Zap className="w-3 h-3 text-slate-600" /> Notificação</span>;
      default:
        return <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded">{type}</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <GitBranch className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                Automações & Workflows de Nutrição
                <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  Estilo RD Station
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Crie réguas de relacionamento e fluxos de automação automáticos para nutrir e converter leads. Dispare sequências no <strong>WhatsApp</strong>, envie e-mails, aplique tags e avance contatos no funil de vendas sem trabalho manual.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView('templates')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-white/15"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Templates Prontos</span>
            </button>

            <button
              onClick={handleOpenCreateNew}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Fluxo</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <p className="text-[11px] text-slate-400">Fluxos Ativos</p>
            <p className="text-xl font-black text-white mt-0.5 flex items-center gap-2">
              <span>{activeCount}</span>
              <span className="text-[10px] font-normal text-slate-400">de {workflows.length}</span>
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <p className="text-[11px] text-slate-400">Leads em Nutrição</p>
            <p className="text-xl font-black text-emerald-400 mt-0.5">
              {totalEnrolled.toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <p className="text-[11px] text-slate-400">Ações Disparadas</p>
            <p className="text-xl font-black text-blue-400 mt-0.5">
              {totalExecuted.toLocaleString()}
            </p>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
            <p className="text-[11px] text-slate-400">Conversões Geradas</p>
            <p className="text-xl font-black text-indigo-400 mt-0.5">
              {totalConversions.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* 2. View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveView('workflows')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeView === 'workflows'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Meus Fluxos ({workflows.length})</span>
        </button>

        <button
          onClick={() => setActiveView('templates')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeView === 'templates'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Biblioteca de Templates (4)</span>
        </button>

        <button
          onClick={() => setActiveView('logs')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeView === 'logs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Histórico de Execuções ({logs.length})</span>
        </button>
      </div>

      {/* 3. Main Views */}
      {activeView === 'workflows' && (
        <div className="space-y-4">
          {workflows.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
                <GitBranch className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">Nenhum fluxo de automação criado</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Crie sequências automáticas de WhatsApp e e-mails para nutrir seus leads ou escolha um template pronto do RD Station.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setActiveView('templates')}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition"
                >
                  Ver Templates Prontos
                </button>
                <button
                  onClick={handleOpenCreateNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs"
                >
                  + Criar Primeiro Fluxo
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {workflows.map(wf => (
                <div 
                  key={wf.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                    wf.active ? 'border-slate-200 hover:border-blue-400' : 'border-slate-200/60 opacity-80 bg-slate-50/40'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    
                    {/* Left: Info & Trigger */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-2 h-2 rounded-full ${wf.active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        <h4 className="font-bold text-sm text-slate-900 truncate">{wf.name}</h4>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          {wf.steps?.length || 0} passos
                        </span>
                      </div>
                      {wf.description && (
                        <p className="text-xs text-slate-500 line-clamp-1">{wf.description}</p>
                      )}
                      
                      {/* Trigger Badge */}
                      <div className="flex items-center gap-2 pt-1 text-[11px]">
                        <span className="text-slate-400 font-semibold">Gatilho:</span>
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-[10px] border border-blue-200">
                          <Zap className="w-3 h-3 text-blue-600" />
                          {getTriggerLabel(wf.triggerType, wf.triggerConfig)}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Sequence Preview */}
                    <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 max-w-md overflow-x-auto">
                      {(wf.steps || []).map((step, idx) => (
                        <React.Fragment key={step.id}>
                          {idx > 0 && <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />}
                          <div className="shrink-0" title={step.title}>
                            {getActionBadge(step.type)}
                          </div>
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Right: Metrics & Actions */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      <div className="flex items-center gap-4 text-center text-xs">
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold">Inscritos</p>
                          <p className="font-bold text-slate-800">{wf.enrolledCount || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold">Executados</p>
                          <p className="font-bold text-blue-600">{wf.executedCount || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 font-semibold">Conversões</p>
                          <p className="font-bold text-emerald-600">{wf.conversionsCount || 0}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
                        {/* Toggle Active Button */}
                        <button
                          onClick={() => handleToggleActive(wf)}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition flex items-center gap-1 ${
                            wf.active 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={wf.active ? 'Pausar Automação' : 'Ativar Automação'}
                        >
                          {wf.active ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>

                        {/* Test Run Button */}
                        <button
                          onClick={() => {
                            setTestModalWorkflow(wf);
                            setTestResult(null);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                          title="Simular e Testar Fluxo"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => {
                            setEditingWorkflow(JSON.parse(JSON.stringify(wf)));
                            setIsEditorOpen(true);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
                          title="Editar Fluxo"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(wf)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                          title="Excluir Fluxo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Template Library View */}
      {activeView === 'templates' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-900">Biblioteca de Automações Pré-Configuradas</p>
              <p className="text-[11px] text-blue-700 mt-0.5">
                Modelos inspirados no RD Station prontos para você clonar, customizar os textos e colocar para rodar em 1 minuto.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workflowTemplates.map((tmpl, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-500 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{tmpl.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{tmpl.subtitle}</p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sequência de Passos:</p>
                    <div className="space-y-1">
                      {tmpl.steps.map((step, sIdx) => (
                        <div key={sIdx} className="flex items-center gap-2 text-[11px] text-slate-700">
                          <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 font-bold text-[9px] flex items-center justify-center shrink-0">
                            {sIdx + 1}
                          </span>
                          <span className="truncate">{step.title}</span>
                          <div className="ml-auto">{getActionBadge(step.type)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => handleApplyTemplate(tmpl)}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Usar Este Template</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Execution Logs View */}
      {activeView === 'logs' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Histórico de Disparos em Tempo Real</h3>
              <p className="text-xs text-slate-500 mt-0.5">Últimas ações disparadas automaticamente pelos fluxos de automação.</p>
            </div>
            <button
              onClick={loadAllData}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Atualizar
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhuma ação executada recentemente. Teste um fluxo para ver o histórico aqui!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Data/Hora</th>
                    <th className="py-2.5 px-4">Fluxo</th>
                    <th className="py-2.5 px-4">Lead</th>
                    <th className="py-2.5 px-4">Ação</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map(lg => (
                    <tr key={lg.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-4 whitespace-nowrap text-[11px] text-slate-500">
                        {new Date(lg.executedAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                        {lg.workflowName}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800">{lg.leadName || 'Lead'}</span>
                        {lg.leadPhone && <span className="block text-[10px] text-slate-400">{lg.leadPhone}</span>}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        {getActionBadge(lg.actionType)}
                      </td>
                      <td className="py-2.5 px-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          lg.status === 'success' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : lg.status === 'scheduled'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                          {lg.status === 'success' ? 'Disparado' : lg.status === 'scheduled' ? 'Agendado' : 'Falha'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate text-[11px]" title={lg.detail}>
                        {lg.detail}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. Modal Editor of Workflow (Timeline & Step Builder) */}
      {isEditorOpen && editingWorkflow && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">
                    {editingWorkflow.id ? 'Editar Fluxo de Automação' : 'Criar Novo Fluxo de Automação'}
                  </h3>
                  <p className="text-[10px] text-slate-400">Configure o gatilho inicial e a sequência de ações</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Scrollable */}
            <div className="p-5 overflow-y-auto space-y-6 flex-1">
              
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome da Automação *
                  </label>
                  <input
                    type="text"
                    value={editingWorkflow.name || ''}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, name: e.target.value })}
                    placeholder="Ex: Boas-Vindas para Novos Leads"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Descrição Curta
                  </label>
                  <input
                    type="text"
                    value={editingWorkflow.description || ''}
                    onChange={(e) => setEditingWorkflow({ ...editingWorkflow, description: e.target.value })}
                    placeholder="Ex: Envia apresentação e aguarda resposta"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Step 1: Gatilho de Entrada (Trigger) */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-blue-900">Gatilho de Entrada (Quando iniciar o fluxo?)</h4>
                    <p className="text-[10px] text-blue-700">Selecione o evento que colocará o lead dentro desta automação.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingWorkflow({ ...editingWorkflow, triggerType: 'lead_created', triggerConfig: {} })}
                    className={`p-3 rounded-lg border text-left transition ${
                      editingWorkflow.triggerType === 'lead_created'
                        ? 'bg-white border-blue-600 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      Novo Lead Cadastrado
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Dispara assim que o contato entra via link ou pop-up.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingWorkflow({ 
                      ...editingWorkflow, 
                      triggerType: 'stage_changed', 
                      triggerConfig: { stage: 'Em Negociação' } 
                    })}
                    className={`p-3 rounded-lg border text-left transition ${
                      editingWorkflow.triggerType === 'stage_changed'
                        ? 'bg-white border-blue-600 shadow-xs'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-purple-600" />
                      Mudança de Estágio no Funil
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Dispara quando o lead avança para uma etapa específica.</p>
                  </button>
                </div>

                {editingWorkflow.triggerType === 'stage_changed' && (
                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-blue-950 mb-1">
                      Qual estágio deve acionar esta automação?
                    </label>
                    <select
                      value={editingWorkflow.triggerConfig?.stage || 'Em Negociação'}
                      onChange={(e) => setEditingWorkflow({
                        ...editingWorkflow,
                        triggerConfig: { ...editingWorkflow.triggerConfig, stage: e.target.value as FunnelStage }
                      })}
                      className="bg-white border border-blue-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-bold outline-none"
                    >
                      {FUNNEL_STAGES.map(stg => (
                        <option key={stg} value={stg}>{stg}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Step 2: Linha do Tempo de Passos / Steps */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Linha do Tempo de Ações</h4>
                      <p className="text-[10px] text-slate-500">As ações serão executadas nesta sequência exata.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Adicionar Ação:</span>
                    <button
                      type="button"
                      onClick={() => handleAddStepToEditing('send_whatsapp')}
                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1"
                    >
                      + WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddStepToEditing('wait_delay')}
                      className="bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1"
                    >
                      + Espera
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddStepToEditing('send_email')}
                      className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1"
                    >
                      + E-mail
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddStepToEditing('change_stage')}
                      className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 px-2 py-1 rounded text-[10px] font-bold transition flex items-center gap-1"
                    >
                      + Estágio
                    </button>
                  </div>
                </div>

                {/* Vertical Timeline Steps */}
                <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 before:z-0">
                  {(editingWorkflow.steps || []).map((step, idx) => (
                    <div key={step.id} className="relative z-10 flex items-start gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
                      
                      {/* Step Number Circle */}
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {idx + 1}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 space-y-3 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getActionBadge(step.type)}
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => handleUpdateStep(step.id, { title: e.target.value })}
                              className="text-xs font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none px-1"
                            />
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveStep(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Mover para cima"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveStep(idx, 'down')}
                              disabled={idx === (editingWorkflow.steps?.length || 0) - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                              title="Mover para baixo"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveStep(step.id)}
                              className="p-1 text-slate-400 hover:text-red-600 transition"
                              title="Excluir este passo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Action Specific Fields */}
                        {step.type === 'send_whatsapp' && (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] font-bold text-slate-500">Mensagem do WhatsApp (Tags disponíveis: &#123;nome&#125;, &#123;empresa&#125;, &#123;link_checkout&#125;):</span>
                            </div>
                            <textarea
                              rows={3}
                              value={step.messageTemplate || ''}
                              onChange={(e) => handleUpdateStep(step.id, { messageTemplate: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-mono outline-none focus:border-blue-500"
                              placeholder="Digite a mensagem que o lead receberá..."
                            />
                          </div>
                        )}

                        {step.type === 'wait_delay' && (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-700">Tempo de Espera:</span>
                              <input
                                type="number"
                                min={1}
                                value={step.delayMinutes || 60}
                                onChange={(e) => handleUpdateStep(step.id, { delayMinutes: Number(e.target.value) })}
                                className="w-20 bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs text-slate-800 font-bold outline-none"
                              />
                              <span className="text-xs text-slate-500">minutos</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              (Ex: 120 min = 2h | 1440 min = 24h | 10080 min = 7 dias)
                            </span>
                          </div>
                        )}

                        {step.type === 'send_email' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={step.emailSubject || ''}
                              onChange={(e) => handleUpdateStep(step.id, { emailSubject: e.target.value })}
                              placeholder="Assunto do e-mail..."
                              className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none"
                            />
                            <textarea
                              rows={2}
                              value={step.emailBody || ''}
                              onChange={(e) => handleUpdateStep(step.id, { emailBody: e.target.value })}
                              placeholder="Corpo do e-mail..."
                              className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none"
                            />
                          </div>
                        )}

                        {step.type === 'change_stage' && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">Novo Estágio:</span>
                            <select
                              value={step.targetStage || 'Contatado'}
                              onChange={(e) => handleUpdateStep(step.id, { targetStage: e.target.value as FunnelStage })}
                              className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-bold text-slate-800 outline-none"
                            >
                              {FUNNEL_STAGES.map(stg => (
                                <option key={stg} value={stg}>{stg}</option>
                              ))}
                            </select>
                          </div>
                        )}

                        {step.type === 'add_tag' && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700">Nome da Tag:</span>
                            <input
                              type="text"
                              value={step.tag || ''}
                              onChange={(e) => handleUpdateStep(step.id, { tag: e.target.value })}
                              placeholder="Ex: cliente_vip, interessado"
                              className="bg-slate-50 border border-slate-200 rounded px-3 py-1 text-xs text-slate-800 font-bold outline-none"
                            />
                          </div>
                        )}

                      </div>

                    </div>
                  ))}
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-4 py-2"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleSaveWorkflow}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
              >
                {saving ? 'Salvando...' : 'Salvar Fluxo de Automação'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. Test Run Simulator Modal */}
      {testModalWorkflow && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm">Simulador de Execução do Fluxo</h3>
              </div>
              <button onClick={() => setTestModalWorkflow(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-800">Fluxo: {testModalWorkflow.name}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Esta simulação valida se todos os nós de ação estão formatando textos, contatos e gatilhos corretamente.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Selecione um Lead para Teste:
                </label>
                <select
                  value={testSelectedLeadId}
                  onChange={(e) => setTestSelectedLeadId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 outline-none"
                >
                  <option value="">Lead Simulado de Teste (Padrão)</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.name} - {l.phone || 'Sem tel'} ({l.stage})
                    </option>
                  ))}
                </select>
              </div>

              {testResult && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 max-h-56 overflow-y-auto">
                  <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Simulação concluída com sucesso!
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {testResult.stepsExecuted?.map((s: any, idx: number) => (
                      <div key={idx} className="text-[11px] bg-white border border-slate-200 p-2 rounded-lg space-y-0.5">
                        <div className="flex items-center justify-between font-bold text-slate-800">
                          <span>Passo {idx + 1}: {s.title}</span>
                          <span className="text-[9px] text-slate-400">{s.timestamp}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 font-mono">{s.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
              <button
                type="button"
                onClick={() => setTestModalWorkflow(null)}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
              >
                Fechar
              </button>

              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={testRunning}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{testRunning ? 'Executando...' : 'Disparar Teste'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
