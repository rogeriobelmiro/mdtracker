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
  X,
  Globe,
  Code,
  Check,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { 
  MarketingWorkflow, 
  WorkflowStep, 
  WorkflowTriggerType, 
  WorkflowActionType, 
  WorkflowExecutionLog, 
  ScheduledWorkflowAction,
  FunnelStage, 
  FUNNEL_STAGES,
  Lead, 
  Company,
  LandingPage
} from '../types';
import { 
  fetchWorkflows, 
  createWorkflow, 
  updateWorkflow, 
  deleteWorkflow, 
  toggleWorkflow, 
  testRunWorkflow, 
  fetchWorkflowLogs,
  fetchLandingPages,
  sendTestPhaseEmail,
  fetchWorkflowQueue,
  processWorkflowQueue,
  cancelScheduledWorkflowAction
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
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'workflows' | 'templates' | 'logs' | 'queue'>('workflows');
  const [queueActions, setQueueActions] = useState<ScheduledWorkflowAction[]>([]);
  const [processingQueue, setProcessingQueue] = useState(false);

  // Modal Editor state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<Partial<MarketingWorkflow> | null>(null);
  const [saving, setSaving] = useState(false);

  // Embed & Webhooks Guide Modal
  const [isEmbedModalOpen, setIsEmbedModalOpen] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [selectedLpForEmbed, setSelectedLpForEmbed] = useState<string>('');

  // Test Run Simulation Modal
  const [testModalWorkflow, setTestModalWorkflow] = useState<MarketingWorkflow | null>(null);
  const [testSelectedLeadId, setTestSelectedLeadId] = useState<string>('');
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Per-step Email Test State
  const [testEmailInputs, setTestEmailInputs] = useState<Record<string, string>>({});
  const [testEmailLoading, setTestEmailLoading] = useState<Record<string, boolean>>({});
  const [testEmailFeedback, setTestEmailFeedback] = useState<Record<string, { success: boolean; message: string }>>({});

  const handleCopyText = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [wfs, lgs, lps, qActions] = await Promise.all([
        fetchWorkflows(currentCompany.id),
        fetchWorkflowLogs(currentCompany.id),
        fetchLandingPages(currentCompany.id),
        fetchWorkflowQueue(currentCompany.id)
      ]);
      setWorkflows(wfs);
      setLogs(lgs);
      setLandingPages(lps || []);
      setQueueActions(qActions || []);
      if (lps && lps.length > 0 && !selectedLpForEmbed) {
        setSelectedLpForEmbed(lps[0].slug);
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados de automação:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessQueue = async () => {
    try {
      setProcessingQueue(true);
      await processWorkflowQueue();
      await loadAllData();
      alert('Fila de disparos processada com sucesso!', 'success');
    } catch (err: any) {
      alert(err.message || 'Erro ao processar fila', 'error');
    } finally {
      setProcessingQueue(false);
    }
  };

  const handleCancelQueueItem = async (id: string) => {
    if (await confirm('Deseja cancelar o disparo desta ação agendada?')) {
      try {
        await cancelScheduledWorkflowAction(id);
        setQueueActions(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      } catch (err: any) {
        alert(err.message || 'Erro ao cancelar ação', 'error');
      }
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
      title: '📋 Nutrição de Leads de Formulário (Landing Page & Elementor)',
      subtitle: 'Dispara imediatamente quando o visitante preenche formulários na landing page ou no site externo.',
      triggerType: 'form_submitted' as WorkflowTriggerType,
      triggerConfig: { formSource: 'any' },
      steps: [
        {
          id: 'step-1',
          type: 'send_whatsapp' as WorkflowActionType,
          title: 'WhatsApp Imediato: Confirmação & Conteúdo Prometido',
          messageTemplate: 'Olá, {nome}! Tudo bem? Acabamos de receber sua mensagem em nosso formulário da {empresa}. Conforme prometido, aqui está o seu material: {link_checkout} 🚀 Ficou com alguma dúvida inicial?'
        },
        {
          id: 'step-2',
          type: 'add_tag' as WorkflowActionType,
          title: 'Adicionar Tag "lead_formulario"',
          tag: 'lead_formulario'
        },
        {
          id: 'step-3',
          type: 'wait_delay' as WorkflowActionType,
          title: 'Aguardar 1 Hora',
          delayMinutes: 60
        },
        {
          id: 'step-4',
          type: 'send_email' as WorkflowActionType,
          title: 'E-mail com Detalhes da Apresentação',
          emailSubject: 'Seu material exclusivo chegou!',
          emailBody: 'Olá {nome}, confirmamos o recebimento dos seus dados. Nosso consultor entrará em contato para tirar quaisquer dúvidas e apresentar a melhor solução.'
        },
        {
          id: 'step-5',
          type: 'notify_user' as WorkflowActionType,
          title: 'Notificar Equipe de SDR / Vendas',
          notifyMessage: 'Novo lead quente de formulário: {nome} ({telefone}) cadastrado via formulário!'
        }
      ]
    },
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
    },
    {
      title: '🎯 Sequência de Aquecimento para Webinário / Live (Com Prazo)',
      subtitle: 'Distribui automaticamente as mensagens até a data do evento, adaptando o tempo para inscrições de última hora.',
      triggerType: 'form_submitted' as WorkflowTriggerType,
      triggerConfig: { formSource: 'any' },
      hasEventDeadline: true,
      eventDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      timeDistributionMode: 'proportional',
      minStepIntervalMinutes: 30,
      steps: [
        {
          id: 'step-1',
          type: 'send_whatsapp' as WorkflowActionType,
          title: 'WhatsApp Imediato: Inscrição Confirmada',
          messageTemplate: 'Parabéns, {nome}! Sua vaga para o nosso webinário exclusivo está garantida. Salve na sua agenda: teremos conteúdos práticos imperdíveis!'
        },
        {
          id: 'step-2',
          type: 'wait_delay' as WorkflowActionType,
          title: 'Aguardar 24 Horas',
          delayMinutes: 1440
        },
        {
          id: 'step-3',
          type: 'send_email' as WorkflowActionType,
          title: 'E-mail 1: Material de Aquecimento Exclusivo',
          emailSubject: '[Webinário] Seu material preparatório chegou!',
          emailBody: 'Olá {nome}, preparamos um resumo estratégico para você aproveitar ao máximo nosso encontro ao vivo.'
        },
        {
          id: 'step-4',
          type: 'wait_delay' as WorkflowActionType,
          title: 'Aguardar 24 Horas',
          delayMinutes: 1440
        },
        {
          id: 'step-5',
          type: 'send_email' as WorkflowActionType,
          title: 'E-mail 2: Estudo de Caso Prático',
          emailSubject: 'Veja este resultado real antes da nossa aula',
          emailBody: 'Olá {nome}, descubra como estruturar seu processo comercial para multiplicar conversões.'
        },
        {
          id: 'step-6',
          type: 'wait_delay' as WorkflowActionType,
          title: 'Aguardar 12 Horas',
          delayMinutes: 720
        },
        {
          id: 'step-7',
          type: 'send_whatsapp' as WorkflowActionType,
          title: 'WhatsApp Final: Link da Sala ao Vivo',
          messageTemplate: 'Olá, {nome}! O webinário está prestes a começar. Acesse agora a sala exclusiva: {link_checkout}'
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
      hasEventDeadline: false,
      eventDate: undefined,
      timeDistributionMode: 'proportional',
      minStepIntervalMinutes: 30,
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
      hasEventDeadline: tmpl.hasEventDeadline || false,
      eventDate: tmpl.eventDate,
      timeDistributionMode: tmpl.timeDistributionMode || 'proportional',
      minStepIntervalMinutes: tmpl.minStepIntervalMinutes || 30,
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

  const handleSendStepEmailTest = async (step: WorkflowStep) => {
    const target = (testEmailInputs[step.id] || '').trim();
    if (!target || !target.includes('@')) {
      setTestEmailFeedback(prev => ({
        ...prev,
        [step.id]: { success: false, message: 'Por favor, digite um e-mail válido para disparar o teste desta fase.' }
      }));
      return;
    }
    setTestEmailLoading(prev => ({ ...prev, [step.id]: true }));
    setTestEmailFeedback(prev => ({ ...prev, [step.id]: { success: true, message: 'Disparando e-mail de teste...' } }));
    try {
      const res = await sendTestPhaseEmail({
        companyId: currentCompany.id,
        targetEmail: target,
        subject: step.emailSubject || 'Aviso Importante',
        body: step.emailBody || 'Olá {nome}, preparamos esse conteúdo exclusivo para você.',
        phaseName: step.title || 'Fase de E-mail Marketing'
      });
      if (res.success) {
        setTestEmailFeedback(prev => ({
          ...prev,
          [step.id]: { success: true, message: `✅ E-mail enviado com sucesso para ${target}!` }
        }));
      } else {
        setTestEmailFeedback(prev => ({
          ...prev,
          [step.id]: { success: false, message: `❌ ${res.error || 'Falha ao enviar e-mail.'}` }
        }));
      }
    } catch (err: any) {
      setTestEmailFeedback(prev => ({
        ...prev,
        [step.id]: { success: false, message: `❌ Erro de conexão: ${err.message}` }
      }));
    } finally {
      setTestEmailLoading(prev => ({ ...prev, [step.id]: false }));
    }
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
      case 'form_submitted': {
        const source = config?.formSource || 'any';
        if (source === 'landing_page') {
          const lp = landingPages.find(p => p.id === config?.landingPageId);
          return `Formulário enviado: LP "${lp?.title || config?.landingPageId || 'Específica'}"`;
        }
        if (source === 'elementor_wordpress') {
          return 'Formulário Externo (Elementor / WordPress)';
        }
        return 'Envio de Formulário (Qualquer Origem)';
      }
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
              onClick={() => setIsEmbedModalOpen(true)}
              className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-emerald-500/30"
              title="Obter código de integração para Elementor, WordPress e formulários HTML"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Conectar Elementor / Embed</span>
            </button>

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
          <span>Biblioteca de Templates (6)</span>
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

        <button
          onClick={() => setActiveView('queue')}
          className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
            activeView === 'queue'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>Fila Agendada 24h</span>
          {queueActions.filter(a => a.status === 'pending').length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeView === 'queue' ? 'bg-white text-indigo-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
              {queueActions.filter(a => a.status === 'pending').length}
            </span>
          )}
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
                      
                      {/* Trigger & Deadline Badges */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                        <span className="text-slate-400 font-semibold">Gatilho:</span>
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold text-[10px] border border-blue-200">
                          <Zap className="w-3 h-3 text-blue-600" />
                          {getTriggerLabel(wf.triggerType, wf.triggerConfig)}
                        </span>
                        {wf.hasEventDeadline && wf.eventDate && (
                          <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md font-bold text-[10px] border border-indigo-200" title="Automação com prazo de evento">
                            <Calendar className="w-3 h-3 text-indigo-600" />
                            Prazo: {new Date(wf.eventDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
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

      {/* 4. Scheduled Queue View (Cron 24h) */}
      {activeView === 'queue' && (
        <div className="space-y-4">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-indigo-900/40">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    Fila de Disparos em Segundo Plano (Cron 24h Ativo)
                  </h3>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold px-2 py-0.5 rounded-full">
                    Auto-Check a cada 30s
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl">
                  O servidor na nuvem monitora esta fila continuamente, mesmo que seu navegador esteja fechado. Ações de fluxos de eventos/webinários são distribuídas proporcionalmente até a data limite.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleProcessQueue}
                  disabled={processingQueue}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                  title="Força a verificação imediata de ações agendadas"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${processingQueue ? 'animate-spin' : ''}`} />
                  <span>{processingQueue ? 'Processando...' : 'Processar Fila Agora'}</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-indigo-900/50">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Aguardando Horário</p>
                <p className="text-lg font-black text-amber-400">
                  {queueActions.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Disparados com Sucesso</p>
                <p className="text-lg font-black text-emerald-400">
                  {queueActions.filter(a => a.status === 'executed').length}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Cancelados / Pulados</p>
                <p className="text-lg font-black text-slate-400">
                  {queueActions.filter(a => a.status === 'cancelled').length}
                </p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Total na Fila</p>
                <p className="text-lg font-black text-white">
                  {queueActions.length}
                </p>
              </div>
            </div>
          </div>

          {/* Queue Items Table */}
          {queueActions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
                <Clock className="w-6 h-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold text-slate-900">Nenhum disparo agendado no momento</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Quando leads entrarem em fluxos com tempos de espera ou prazos de webinário, os próximos envios de e-mail e WhatsApp aparecerão aqui.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px]">
                    <th className="py-3 px-4">Lead / Contato</th>
                    <th className="py-3 px-4">Fluxo de Automação</th>
                    <th className="py-3 px-4">Ação Programada</th>
                    <th className="py-3 px-4">Horário do Disparo</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queueActions.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.leadName || 'Lead Sem Nome'}</div>
                        <div className="text-[11px] text-slate-500">
                          {item.leadEmail || item.leadPhone || item.leadId}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {item.workflowName || item.workflowId}
                      </td>
                      <td className="py-3 px-4">
                        {getActionBadge(item.actionType as any)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          {new Date(item.scheduledFor).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {item.status === 'pending' ? (
                            new Date(item.scheduledFor) <= new Date() 
                              ? 'Pronto para disparo imediato' 
                              : `Disparo em ~${Math.max(1, Math.round((new Date(item.scheduledFor).getTime() - Date.now()) / 60000))} min`
                          ) : item.executedAt ? (
                            `Executado em ${new Date(item.executedAt).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'executed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {item.status === 'executed' ? 'Disparado' : item.status === 'pending' ? 'Aguardando Horário' : 'Cancelado'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleCancelQueueItem(item.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg transition"
                            title="Cancelar disparo agendado"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. Modal Editor of Workflow (Timeline & Step Builder) */}
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditingWorkflow({ 
                      ...editingWorkflow, 
                      triggerType: 'form_submitted', 
                      triggerConfig: { formSource: 'any' } 
                    })}
                    className={`p-3 rounded-lg border text-left transition ${
                      editingWorkflow.triggerType === 'form_submitted'
                        ? 'bg-white border-blue-600 shadow-xs ring-1 ring-blue-600/30'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      Envio de Formulário
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Landing Pages internas, Elementor ou WordPress.</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingWorkflow({ ...editingWorkflow, triggerType: 'lead_created', triggerConfig: {} })}
                    className={`p-3 rounded-lg border text-left transition ${
                      editingWorkflow.triggerType === 'lead_created'
                        ? 'bg-white border-blue-600 shadow-xs ring-1 ring-blue-600/30'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      Novo Lead Cadastrado
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Dispara assim que o contato entra via link ou CRM.</p>
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
                        ? 'bg-white border-blue-600 shadow-xs ring-1 ring-blue-600/30'
                        : 'bg-white/60 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-purple-600" />
                      Mudança de Estágio
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Dispara quando o lead avança no funil de vendas.</p>
                  </button>
                </div>

                {editingWorkflow.triggerType === 'form_submitted' && (
                  <div className="pt-2 bg-white/80 p-3 rounded-xl border border-blue-200 space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-blue-950 mb-1.5">
                        Qual origem de formulário deve acionar este fluxo?
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingWorkflow({
                            ...editingWorkflow,
                            triggerConfig: { ...editingWorkflow.triggerConfig, formSource: 'any', landingPageId: undefined }
                          })}
                          className={`p-2 rounded-lg text-left border text-xs font-medium transition ${
                            (!editingWorkflow.triggerConfig?.formSource || editingWorkflow.triggerConfig?.formSource === 'any')
                              ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                          }`}
                        >
                          🌐 Qualquer Formulário
                          <span className="block text-[10px] text-slate-500 font-normal">Interno ou externo</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingWorkflow({
                            ...editingWorkflow,
                            triggerConfig: { 
                              ...editingWorkflow.triggerConfig, 
                              formSource: 'landing_page', 
                              landingPageId: editingWorkflow.triggerConfig?.landingPageId || landingPages[0]?.id || '' 
                            }
                          })}
                          className={`p-2 rounded-lg text-left border text-xs font-medium transition ${
                            editingWorkflow.triggerConfig?.formSource === 'landing_page'
                              ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                          }`}
                        >
                          📄 Landing Page Interna
                          <span className="block text-[10px] text-slate-500 font-normal">Criada no TrackerMD</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingWorkflow({
                            ...editingWorkflow,
                            triggerConfig: { ...editingWorkflow.triggerConfig, formSource: 'elementor_wordpress', landingPageId: undefined }
                          })}
                          className={`p-2 rounded-lg text-left border text-xs font-medium transition ${
                            editingWorkflow.triggerConfig?.formSource === 'elementor_wordpress'
                              ? 'bg-blue-50 border-blue-600 text-blue-900 font-bold'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white'
                          }`}
                        >
                          🔌 Elementor / WordPress
                          <span className="block text-[10px] text-slate-500 font-normal">Webhook ou Embed HTML</span>
                        </button>
                      </div>
                    </div>

                    {editingWorkflow.triggerConfig?.formSource === 'landing_page' && (
                      <div className="pt-1">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Selecione a Landing Page do Sistema:
                        </label>
                        {landingPages.length > 0 ? (
                          <select
                            value={editingWorkflow.triggerConfig?.landingPageId || ''}
                            onChange={(e) => setEditingWorkflow({
                              ...editingWorkflow,
                              triggerConfig: { ...editingWorkflow.triggerConfig, landingPageId: e.target.value }
                            })}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-500"
                          >
                            <option value="">Todas as Landing Pages Internas</option>
                            {landingPages.map(lp => (
                              <option key={lp.id} value={lp.id}>
                                {lp.title} (/lp/{lp.slug})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                            ⚠️ Nenhuma landing page cadastrada nesta empresa ainda. Crie uma na aba <strong>Landing Pages</strong> ou use "Qualquer Formulário".
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-blue-100 gap-2 text-[11px]">
                      <span className="text-slate-600">
                        Quer capturar leads do seu site <strong>WordPress, Elementor ou Webflow</strong>?
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEmbedModalOpen(true)}
                        className="text-blue-700 hover:text-blue-900 font-bold underline flex items-center gap-1 shrink-0"
                      >
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        Ver Código Embed & Webhook Elementor
                      </button>
                    </div>
                  </div>
                )}

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

              {/* Prazo Limite do Evento / Webinário (Opcional) */}
              <div className="bg-gradient-to-r from-indigo-50/70 via-purple-50/50 to-blue-50/70 border border-indigo-200/80 rounded-2xl p-4.5 space-y-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                        Prazo Limite do Evento / Webinário
                        <span className="text-[10px] font-semibold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                          Distribuição Inteligente 24h
                        </span>
                      </h4>
                      <p className="text-[11px] text-indigo-800/80">
                        Se sua automação leva até um evento (ex: live, webinário ou lançamento), ative para comprimir e distribuir automaticamente as mensagens para leads de última hora.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={!!editingWorkflow.hasEventDeadline}
                      onChange={(e) => setEditingWorkflow({
                        ...editingWorkflow,
                        hasEventDeadline: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {editingWorkflow.hasEventDeadline && (
                  <div className="pt-3 border-t border-indigo-100 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                        Data e Hora do Evento *
                      </label>
                      <input
                        type="datetime-local"
                        value={editingWorkflow.eventDate ? (() => {
                          try {
                            const d = new Date(editingWorkflow.eventDate);
                            const pad = (n: number) => String(n).padStart(2, '0');
                            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                          } catch { return ''; }
                        })() : ''}
                        onChange={(e) => setEditingWorkflow({
                          ...editingWorkflow,
                          eventDate: e.target.value ? new Date(e.target.value).toISOString() : undefined
                        })}
                        className="w-full bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold outline-none focus:border-indigo-500 shadow-xs"
                      />
                      <span className="text-[10px] text-indigo-600 mt-1 block">
                        Nenhum e-mail ou WhatsApp será enviado após este horário.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                        Estratégia de Distribuição
                      </label>
                      <select
                        value={editingWorkflow.timeDistributionMode || 'proportional'}
                        onChange={(e) => setEditingWorkflow({
                          ...editingWorkflow,
                          timeDistributionMode: e.target.value as any
                        })}
                        className="w-full bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold outline-none focus:border-indigo-500 shadow-xs"
                      >
                        <option value="proportional">Proporcional (Comprimir todos no tempo restante)</option>
                        <option value="compact">Acelerada (Fila com intervalo mínimo)</option>
                        <option value="fixed">Original Fixo (Pular passos após o evento)</option>
                      </select>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Como lidar com inscrições feitas perto da hora do evento.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-indigo-950 mb-1">
                        Intervalo Mínimo (Minutos)
                      </label>
                      <input
                        type="number"
                        min={5}
                        max={1440}
                        value={editingWorkflow.minStepIntervalMinutes ?? 30}
                        onChange={(e) => setEditingWorkflow({
                          ...editingWorkflow,
                          minStepIntervalMinutes: Number(e.target.value) || 30
                        })}
                        className="w-full bg-white border border-indigo-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-bold outline-none focus:border-indigo-500 shadow-xs"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Tempo mínimo entre 2 mensagens para não virar spam.
                      </span>
                    </div>
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
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-bold text-slate-500">Assunto do E-mail desta Fase:</span>
                                <div className="flex items-center gap-1 text-[9px] text-slate-400">
                                  <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{'{nome}'}</span>
                                  <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{'{empresa}'}</span>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={step.emailSubject || ''}
                                onChange={(e) => handleUpdateStep(step.id, { emailSubject: e.target.value })}
                                placeholder="Assunto do e-mail..."
                                className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                              />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-500 block mb-1">Mensagem / Corpo do E-mail:</span>
                              <textarea
                                rows={3}
                                value={step.emailBody || ''}
                                onChange={(e) => handleUpdateStep(step.id, { emailBody: e.target.value })}
                                placeholder="Corpo do e-mail..."
                                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white font-sans"
                              />
                            </div>

                            {/* Direct Test Bar for This Email Step / Phase */}
                            <div className="pt-2 border-t border-blue-200/50 bg-blue-50/60 p-2.5 rounded-lg space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                                  Testar Disparo Desta Fase ({step.title || 'Passo de E-mail'})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="email"
                                  placeholder="Digite seu e-mail para receber este teste..."
                                  value={testEmailInputs[step.id] || ''}
                                  onChange={(e) => setTestEmailInputs(prev => ({ ...prev, [step.id]: e.target.value }))}
                                  className="flex-1 bg-white border border-blue-200 rounded px-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSendStepEmailTest(step)}
                                  disabled={testEmailLoading[step.id]}
                                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-3 py-1 rounded text-xs transition flex items-center gap-1.5 shrink-0 shadow-2xs"
                                >
                                  {testEmailLoading[step.id] ? (
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <Send className="w-3 h-3" />
                                  )}
                                  <span>Testar Fase</span>
                                </button>
                              </div>
                              {testEmailFeedback[step.id] && (
                                <div className={`text-[11px] p-1.5 rounded font-medium ${
                                  testEmailFeedback[step.id].success 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                  {testEmailFeedback[step.id].message}
                                </div>
                              )}
                            </div>
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

      {/* 6. Embed & Webhooks Guide Modal (Elementor, WordPress, HTML) */}
      {isEmbedModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Globe className="w-5 h-5 text-emerald-400" />
                </span>
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    Integração de Formulários: Elementor, WordPress & Webhooks
                  </h3>
                  <p className="text-xs text-slate-300">
                    Capture leads de qualquer site ou página e dispare fluxos de nutrição instantaneamente.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsEmbedModalOpen(false)} 
                className="text-slate-400 hover:text-white transition p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">

              {/* Card 1: Elementor Pro Webhook */}
              <div className="border border-emerald-200 bg-emerald-50/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white uppercase tracking-wider">
                      Recomendado
                    </span>
                    <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                      1. Elementor Pro (Via Webhook Nativo)
                    </h4>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-medium">Sem plugins extras necessários</span>
                </div>

                <p className="text-xs text-slate-600">
                  Envie os dados de qualquer formulário feito no <strong>Elementor</strong> diretamente para o TrackerMD. Ao enviar, o lead é cadastrado no CRM e o fluxo de nutrição é acionado.
                </p>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700">
                    URL do Webhook (Cole no Elementor):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/api/forms/submit?companyId=${currentCompany.id}&formSource=elementor`}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-xs font-mono text-emerald-900 select-all"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopyText(
                        `${window.location.origin}/api/forms/submit?companyId=${currentCompany.id}&formSource=elementor`,
                        'elementor_webhook'
                      )}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shrink-0 transition"
                    >
                      {copiedSection === 'elementor_webhook' ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar URL</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-white/80 border border-emerald-200/80 rounded-lg p-3 space-y-1.5 text-[11px] text-slate-600">
                  <p className="font-bold text-slate-800">Passo a passo no Elementor:</p>
                  <ol className="list-decimal list-inside space-y-1 pl-1">
                    <li>Selecione o widget de <strong>Formulário</strong> na sua página do Elementor.</li>
                    <li>No menu esquerdo, abra a aba <strong>Actions After Submit (Ações após o envio)</strong>.</li>
                    <li>Clique no botão <strong>+</strong> e selecione a opção <strong>Webhook</strong>.</li>
                    <li>Uma nova aba <strong>Webhook</strong> aparecerá abaixo. Cole a URL acima no campo <strong>Webhook URL</strong>.</li>
                    <li>Nos campos do form (Aba Conteúdo), utilize nos IDs dos campos: <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-mono">nome</code>, <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-mono">whatsapp</code> e <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700 font-mono">email</code>.</li>
                    <li>Clique em <strong>Atualizar</strong> ou <strong>Publicar</strong>. Pronto!</li>
                  </ol>
                </div>
              </div>

              {/* Card 2: HTML Form Embed (WordPress / Gutenberg / Custom HTML) */}
              <div className="border border-blue-200 bg-blue-50/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-blue-950 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-blue-600" />
                    2. Código HTML Embed (WordPress, Gutenberg, Webflow, Divi)
                  </h4>
                  <span className="text-[11px] text-blue-700 font-medium">Bloco "HTML Personalizado"</span>
                </div>

                <p className="text-xs text-slate-600">
                  Copie e cole este bloco de formulário pronto em qualquer página externa. Ele já inclui campos formatados de Nome, WhatsApp e E-mail, além de proteção CORS.
                </p>

                <div className="relative">
                  <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-lg text-[10.5px] font-mono overflow-x-auto max-h-48">
{`<form action="${window.location.origin}/api/forms/submit" method="POST" style="max-width:440px;margin:0 auto;padding:20px;border-radius:12px;background:#fff;border:1px solid #e2e8f0;font-family:sans-serif;">
  <input type="hidden" name="companyId" value="${currentCompany.id}">
  <input type="hidden" name="formSource" value="wordpress_embed">
  <!-- Opcional: url de redirecionamento apos envio -->
  <!-- <input type="hidden" name="redirectUrl" value="${window.location.origin}/obrigado"> -->

  <div style="margin-bottom:12px;">
    <label style="display:block;font-size:12px;font-weight:bold;margin-bottom:4px;color:#334155;">Nome Completo</label>
    <input type="text" name="nome" required placeholder="Seu nome" style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;box-sizing:border-box;">
  </div>

  <div style="margin-bottom:12px;">
    <label style="display:block;font-size:12px;font-weight:bold;margin-bottom:4px;color:#334155;">WhatsApp / Telefone</label>
    <input type="tel" name="whatsapp" required placeholder="(11) 99999-9999" style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;box-sizing:border-box;">
  </div>

  <div style="margin-bottom:16px;">
    <label style="display:block;font-size:12px;font-weight:bold;margin-bottom:4px;color:#334155;">E-mail</label>
    <input type="email" name="email" required placeholder="seu@email.com" style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;box-sizing:border-box;">
  </div>

  <button type="submit" style="width:100%;background:#2563eb;color:#ffffff;font-weight:bold;padding:12px;border:none;border-radius:8px;font-size:14px;cursor:pointer;">
    Enviar Informações
  </button>
</form>`}
                  </pre>

                  <button
                    type="button"
                    onClick={() => handleCopyText(
`<form action="${window.location.origin}/api/forms/submit" method="POST" style="max-width:440px;margin:0 auto;padding:20px;border-radius:12px;background:#fff;border:1px solid #e2e8f0;font-family:sans-serif;">
  <input type="hidden" name="companyId" value="${currentCompany.id}">
  <input type="hidden" name="formSource" value="wordpress_embed">

  <div style="margin-bottom:12px;">
    <label style="display:block;font-size:12px;font-weight:bold;margin-bottom:4px;color:#334155;">Nome Completo</label>
    <input type="text" name="nome" required placeholder="Seu nome" style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;box-sizing:border-box;">
  </div>

  <div style="margin-bottom:12px;">
    <label style="display:block;font-size:12px;font-weight:bold;margin-bottom:4px;color:#334155;">WhatsApp / Telefone</label>
    <input type="tel" name="whatsapp" required placeholder="(11) 99999-9999" style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;box-sizing:border-box;">
  </div>

  <div style="margin-bottom:16px;">
    <label style="display:block;font-size:12px;font-weight:bold;margin-bottom:4px;color:#334155;">E-mail</label>
    <input type="email" name="email" required placeholder="seu@email.com" style="width:100%;padding:10px 12px;border:1px solid #cbd5e1;border-radius:8px;font-size:13px;box-sizing:border-box;">
  </div>

  <button type="submit" style="width:100%;background:#2563eb;color:#ffffff;font-weight:bold;padding:12px;border:none;border-radius:8px;font-size:14px;cursor:pointer;">
    Enviar Informações
  </button>
</form>`,
                      'html_embed'
                    )}
                    className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 text-white font-semibold text-[11px] px-2.5 py-1.5 rounded-md flex items-center gap-1 transition"
                  >
                    {copiedSection === 'html_embed' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Código HTML</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Card 3: Iframe de Landing Page Interna */}
              <div className="border border-purple-200 bg-purple-50/30 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-purple-950 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-purple-600" />
                    3. Iframe de Landing Page Criada no TrackerMD
                  </h4>
                  <span className="text-[11px] text-purple-700 font-medium">Embed completo</span>
                </div>

                <p className="text-xs text-slate-600">
                  Deseja exibir a Landing Page inteira do sistema dentro de uma página do seu WordPress ou portal? Use a tag iframe abaixo:
                </p>

                {landingPages.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-slate-700 shrink-0">
                        Escolha a Landing Page:
                      </label>
                      <select
                        value={selectedLpForEmbed || landingPages[0]?.slug}
                        onChange={(e) => setSelectedLpForEmbed(e.target.value)}
                        className="bg-white border border-purple-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-semibold outline-none"
                      >
                        {landingPages.map(lp => (
                          <option key={lp.id} value={lp.slug}>
                            {lp.title} ({lp.slug})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`<iframe src="${window.location.origin}/lp/${selectedLpForEmbed || landingPages[0]?.slug}" width="100%" height="800" style="border:none;border-radius:12px;width:100%;min-height:800px;" title="Landing Page"></iframe>`}
                        className="w-full bg-white border border-purple-300 rounded-lg px-3 py-2 text-xs font-mono text-purple-900 select-all"
                      />
                      <button
                        type="button"
                        onClick={() => handleCopyText(
                          `<iframe src="${window.location.origin}/lp/${selectedLpForEmbed || landingPages[0]?.slug}" width="100%" height="800" style="border:none;border-radius:12px;width:100%;min-height:800px;" title="Landing Page"></iframe>`,
                          'iframe_embed'
                        )}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 shrink-0 transition"
                      >
                        {copiedSection === 'iframe_embed' ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar Iframe</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                    Nenhuma landing page criada ainda no TrackerMD. Você pode criar uma na aba <strong>Landing Pages</strong>.
                  </p>
                )}
              </div>

              {/* Card 4: AJAX Fetch / Programadores */}
              <div className="border border-slate-200 bg-slate-50/70 rounded-xl p-4 space-y-2">
                <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  4. Envio via JavaScript / AJAX (CORS Habilitado)
                </h4>
                <p className="text-[11px] text-slate-600">
                  O endpoint aceita requisições JSON de qualquer domínio originário com suporte nativo a CORS:
                </p>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[10.5px] font-mono overflow-x-auto">
{`await fetch('${window.location.origin}/api/forms/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    companyId: '${currentCompany.id}',
    name: 'Nome do Cliente',
    phone: '11999998888',
    email: 'cliente@gmail.com',
    formSource: 'elementor_ou_site'
  })
});`}
                </pre>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
              <span className="text-[11px] text-slate-500">
                Os leads cadastrados aparecem automaticamente na aba <strong>Leads</strong> e iniciam os fluxos correspondentes.
              </span>
              <button
                type="button"
                onClick={() => setIsEmbedModalOpen(false)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Concluir
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
