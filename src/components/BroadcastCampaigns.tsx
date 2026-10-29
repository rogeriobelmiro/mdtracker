import React, { useState, useEffect, useMemo } from 'react';
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Radio, 
  Users, 
  CheckCircle2, 
  Clock, 
  Play, 
  Pause, 
  RefreshCw, 
  Plus, 
  Filter, 
  Sparkles, 
  Settings, 
  AlertCircle, 
  Trash2, 
  Check, 
  Copy, 
  Search, 
  ChevronRight, 
  Smartphone, 
  Monitor, 
  ArrowRight, 
  TrendingUp, 
  Eye, 
  ExternalLink, 
  FileText, 
  X,
  Zap,
  ShieldCheck,
  Share2,
  Calendar,
  CalendarDays,
  MousePointerClick,
  Flame
} from 'lucide-react';
import { 
  Lead, 
  Company, 
  CampaignLink, 
  BroadcastCampaign, 
  BroadcastChannel, 
  BroadcastRecipient,
  FunnelStage, 
  FUNNEL_STAGES,
  Product 
} from '../types';
import { 
  fetchBroadcastCampaigns, 
  createBroadcastCampaign, 
  updateBroadcastCampaign, 
  deleteBroadcastCampaign, 
  sendTestBroadcast, 
  launchBroadcastCampaign, 
  generateBroadcastAI,
  fetchBroadcastRecipients,
  simulateRecipientActivity
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';
import { NavTabId } from './Sidebar';

interface BroadcastCampaignsProps {
  leads: Lead[];
  links: CampaignLink[];
  currentCompany?: Company;
  products?: Product[];
  onNavigateToTab?: (tab: NavTabId) => void;
}

// 4 Pre-built Email Templates (RD Station style)
const EMAIL_TEMPLATES = [
  {
    id: 'tpl-welcome',
    name: 'Boas-Vindas & Apresentação VIP',
    category: 'Nutrição / Boas-Vindas',
    subject: '🚀 Bem-vindo(a)! Preparamos algo especial para você',
    preheader: 'Acesse agora seu benefício exclusivo de primeiro contato',
    bodyHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <span style="background: #eff6ff; color: #2563eb; font-weight: bold; font-size: 12px; padding: 6px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">Boas-Vindas</span>
  </div>
  <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; line-height: 1.3; margin-bottom: 12px; text-align: center;">Olá, {{nome}}! É um prazer ter você aqui 👋</h2>
  <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Ficamos muito contentes com o seu interesse em nossa solução. Sabemos que a agilidade e a qualidade no atendimento fazem toda a diferença para o crescimento da sua empresa.</p>
  <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
    <p style="margin: 0; color: #1e293b; font-size: 14px; font-weight: 600;">O que você terá acesso imediato:</p>
    <ul style="margin: 8px 0 0 16px; padding: 0; color: #475569; font-size: 14px;">
      <li>Atendimento consultivo e suporte prioritário</li>
      <li>Condições especiais de início rápido</li>
      <li>Acesso a materiais e estratégias exclusivas</li>
    </ul>
  </div>
  <div style="text-align: center; margin-top: 32px;">
    <a href="https://mdtracker.com.br" style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">Falar com um Especialista Agora &rarr;</a>
  </div>
  <p style="text-align: center; font-size: 11px; color: #94a3b8; margin-top: 36px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
    {{empresa}} • Caso não queira receber mais e-mails, <a href="#" style="color: #64748b; text-decoration: underline;">descadastre-se aqui</a>.
  </p>
</div>`
  },
  {
    id: 'tpl-promo',
    name: 'Promoção Relâmpago com Cupom',
    category: 'Vendas & Urgência',
    subject: '⚡ Cupom VIP Liberado: 15% OFF válido apenas hoje',
    preheader: 'Não perca esta oportunidade de acelerar seus resultados com desconto',
    bodyHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <span style="background: #fef3c7; color: #b45309; font-weight: bold; font-size: 12px; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase;">Oferta por Tempo Limitado</span>
  </div>
  <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; text-align: center; margin-bottom: 12px;">Uma condição única para você fechar negócio hoje, {{nome}}!</h2>
  <p style="color: #475569; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 24px;">
    Liberamos um cupom especial de 15% de desconto para novos clientes. Essa condição é válida exclusivamente até às 23h59 de hoje.
  </p>
  <div style="background: #f8fafc; border: 2px dashed #cbd5e1; padding: 20px; text-align: center; border-radius: 12px; margin-bottom: 24px;">
    <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 600;">Seu Cupom de Desconto:</span>
    <div style="font-size: 24px; font-weight: 900; color: #059669; letter-spacing: 0.1em; margin-top: 6px;">VIP15OFF</div>
  </div>
  <div style="text-align: center;">
    <a href="https://mdtracker.com.br" style="display: inline-block; background: #059669; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(5,150,105,0.25);">Resgatar Meu Desconto Imediato &rarr;</a>
  </div>
</div>`
  },
  {
    id: 'tpl-reactivate',
    name: 'Reativação de Contatos Frios',
    category: 'Reengajamento',
    subject: 'Podemos retomar nossa conversa, {{nome}}?',
    preheader: 'Temos novidades importantes sobre o projeto que conversamos',
    bodyHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;">
  <p style="color: #1e293b; font-size: 15px; line-height: 1.6;">Olá, <strong>{{nome}}</strong>!</p>
  <p style="color: #475569; font-size: 15px; line-height: 1.6;">Faz algum tempo desde que nos falamos pela primeira vez. Lançamos melhorias significativas em nossa operação que tornaram a implementação muito mais rápida e acessível.</p>
  <p style="color: #475569; font-size: 15px; line-height: 1.6;">Se você ainda tem como objetivo acelerar suas vendas este mês, adoraria agendar um rápido alinhamento de 15 minutos para te apresentar as novidades.</p>
  <div style="margin: 28px 0; text-align: center;">
    <a href="https://mdtracker.com.br" style="background: #2563eb; color: #ffffff; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none; display: inline-block;">Conversar com o Especialista &rarr;</a>
  </div>
  <p style="color: #64748b; font-size: 13px;">Um abraço,<br/><strong>Equipe {{empresa}}</strong></p>
</div>`
  }
];

// 4 Pre-built SMS Templates
const SMS_TEMPLATES = [
  {
    id: 'sms-cupom',
    name: 'Cupom Relâmpago (15% OFF)',
    text: 'Oi {{nome}}! Use o cupom VIP15 no WhatsApp hoje e garanta 15% OFF imediato na sua consultoria: mdtr.link/vip15'
  },
  {
    id: 'sms-lembrete',
    name: 'Lembrete de Consulta / Agendamento',
    text: 'Ola {{nome}}! Lembrando do seu agendamento hoje as 15h com a {{empresa}}. Confirme sua presenca respondendo SIM: mdtr.link/agenda'
  },
  {
    id: 'sms-reativacao',
    name: 'Reengajamento Urgente',
    text: '{{nome}}, temos uma novidade especial para seu negócio esta semana. Fale conosco no WhatsApp com condicao de lote 1: mdtr.link/conversa'
  },
  {
    id: 'sms-aviso',
    name: 'Aviso de Material Liberado',
    text: 'Ola {{nome}}! Seu material exclusivo ja esta pronto para download no WhatsApp. Acesse agora: mdtr.link/material'
  }
];

export const BroadcastCampaigns: React.FC<BroadcastCampaignsProps> = ({
  leads,
  links,
  currentCompany,
  products = [],
  onNavigateToTab
}) => {
  const { alert, confirm } = useDialog();

  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChannelTab, setActiveChannelTab] = useState<'all' | 'email' | 'sms' | 'whatsapp' | 'multichannel'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal State for Create / Edit Campaign
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);

  // Form Fields
  const [channel, setChannel] = useState<BroadcastChannel>('email');
  const [selectedChannels, setSelectedChannels] = useState<BroadcastChannel[]>(['email', 'whatsapp', 'sms']);
  const [campaignName, setCampaignName] = useState('');
  const [targetStage, setTargetStage] = useState<string>('Todos');
  const [targetSource, setTargetSource] = useState<string>('Todas');
  const [targetTag, setTargetTag] = useState<string>('Todas');

  // Scheduling State (Data e Hora do Disparo de Lançamentos)
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('09:00');

  // Call to Action (Link & Botão para Rastreamento de Cliques)
  const [ctaUrl, setCtaUrl] = useState<string>('');
  const [ctaText, setCtaText] = useState<string>('Garantir Minha Vaga');
  
  // Email fields
  const [emailSubject, setEmailSubject] = useState('');
  const [emailPreheader, setEmailPreheader] = useState('');
  const [emailSenderName, setEmailSenderName] = useState(currentCompany?.name || 'Equipe de Vendas');
  const [emailSenderEmail, setEmailSenderEmail] = useState('contato@empresa.com.br');
  const [emailBodyHtml, setEmailBodyHtml] = useState(EMAIL_TEMPLATES[0].bodyHtml);
  
  // SMS fields
  const [smsText, setSmsText] = useState(SMS_TEMPLATES[0].text);
  
  // WhatsApp fields
  const [messageTemplate, setMessageTemplate] = useState('Olá {{nome}}! Tudo bem? Gostaria de te apresentar uma novidade exclusiva da nossa equipe hoje.');
  const [delaySeconds, setDelaySeconds] = useState<number>(5);
  const [provider, setProvider] = useState<string>('simulado');

  // Preview Mode in Modal
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [multichannelPreviewTab, setMultichannelPreviewTab] = useState<'email' | 'whatsapp' | 'sms'>('email');

  // Recipients Engagement Modal (Quem Abriu & Clicou)
  const [selectedCampaignForRecipients, setSelectedCampaignForRecipients] = useState<BroadcastCampaign | null>(null);
  const [campaignRecipients, setCampaignRecipients] = useState<BroadcastRecipient[]>([]);
  const [isLoadingRecipients, setIsLoadingRecipients] = useState<boolean>(false);
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'opened' | 'clicked' | 'unopened'>('all');
  const [recipientSearch, setRecipientSearch] = useState<string>('');

  // Test Dispatch State
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testTargetEmail, setTestTargetEmail] = useState('');
  const [testTargetPhone, setTestTargetPhone] = useState('');
  const [isSendingTest, setIsSendingTest] = useState(false);

  // AI Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiGoal, setAiGoal] = useState('');
  const [aiSelectedProductId, setAiSelectedProductId] = useState('');
  const [aiCustomNiche, setAiCustomNiche] = useState('');
  const [aiTone, setAiTone] = useState<'persuasivo' | 'profissional' | 'urgente' | 'amigavel'>('persuasivo');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const companyId = currentCompany?.id || 'comp-alfa';

  // Load campaigns from backend
  const loadCampaigns = async () => {
    setIsLoading(true);
    try {
      const data = await fetchBroadcastCampaigns(companyId);
      setCampaigns(data);
    } catch (err) {
      console.error('Erro ao buscar campanhas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [companyId]);

  // Aggregate KPIs
  const kpis = useMemo(() => {
    const total = campaigns.length;
    const emailCamps = campaigns.filter(c => c.channel === 'email');
    const smsCamps = campaigns.filter(c => c.channel === 'sms');
    const wppCamps = campaigns.filter(c => c.channel === 'whatsapp');

    const totalEmailsSent = emailCamps.reduce((acc, c) => acc + (c.sentCount || 0), 0);
    const totalEmailsOpened = emailCamps.reduce((acc, c) => acc + (c.openedCount || 0), 0);
    const emailOpenRate = totalEmailsSent > 0 ? (totalEmailsOpened / totalEmailsSent) * 100 : 0;

    const totalSmsSent = smsCamps.reduce((acc, c) => acc + (c.sentCount || 0), 0);
    const totalSmsDelivered = smsCamps.reduce((acc, c) => acc + (c.deliveredCount || 0), 0);
    const smsDeliveryRate = totalSmsSent > 0 ? (totalSmsDelivered / totalSmsSent) * 100 : 0;

    const totalWppSent = wppCamps.reduce((acc, c) => acc + (c.sentCount || 0), 0);

    return {
      total,
      totalEmailsSent,
      emailOpenRate,
      totalSmsSent,
      smsDeliveryRate,
      totalWppSent
    };
  }, [campaigns]);

  // Filtered campaigns
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const matchesChannel = activeChannelTab === 'all' || c.channel === activeChannelTab;
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.emailSubject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.smsText || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesChannel && matchesStatus && matchesSearch;
    });
  }, [campaigns, activeChannelTab, statusFilter, searchQuery]);

  // Eligible Leads for current filters
  const eligibleLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesStage = targetStage === 'Todos' || l.stage === targetStage;
      const matchesSource = targetSource === 'Todas' || (l.utmSource || l.source) === targetSource;
      
      let hasChannelData = true;
      if (channel === 'email') {
        hasChannelData = !!(l.email && l.email.includes('@'));
      } else if (channel === 'sms' || channel === 'whatsapp') {
        hasChannelData = !!(l.phone && l.phone.replace(/\D/g, '').length >= 10);
      } else if (channel === 'multichannel') {
        hasChannelData = !!((l.email && l.email.includes('@')) || (l.phone && l.phone.replace(/\D/g, '').length >= 10));
      }

      return matchesStage && matchesSource && hasChannelData;
    });
  }, [leads, targetStage, targetSource, channel]);

  // Unique sources for filter
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    leads.forEach(l => {
      if (l.utmSource) set.add(l.utmSource);
      else if (l.source) set.add(l.source);
    });
    return Array.from(set);
  }, [leads]);

  // Open New Campaign Modal
  const handleOpenCreateModal = (prefChannel?: BroadcastChannel) => {
    setEditingCampaignId(null);
    const chosenChannel = prefChannel || 'email';
    setChannel(chosenChannel);
    setSelectedChannels(['email', 'whatsapp', 'sms']);
    setMultichannelPreviewTab('email');
    setCampaignName(
      chosenChannel === 'multichannel' 
        ? `Lançamento Multicanal - ${new Date().toLocaleDateString('pt-BR')}`
        : `Nova Campanha de ${chosenChannel === 'sms' ? 'SMS' : chosenChannel === 'whatsapp' ? 'WhatsApp' : 'E-mail'} - ${new Date().toLocaleDateString('pt-BR')}`
    );
    setTargetStage('Todos');
    setTargetSource('Todas');
    setTargetTag('Todas');

    // Scheduling Defaults
    setIsScheduled(false);
    const tomorrow = new Date(Date.now() + 86400000);
    setScheduledDate(tomorrow.toISOString().split('T')[0]);
    setScheduledTime('09:00');

    // CTA Link Tracking Defaults
    setCtaUrl('https://mdtracker.com.br');
    setCtaText('Garantir Minha Vaga com Bônus');

    // Defaults for email
    setEmailSubject('🚀 Oportunidade Exclusiva: Condição Especial Liberada');
    setEmailPreheader('Veja como otimizar seus resultados hoje');
    setEmailSenderName(currentCompany?.name || 'Equipe de Vendas');
    setEmailSenderEmail('contato@empresa.com.br');
    setEmailBodyHtml(EMAIL_TEMPLATES[0].bodyHtml);

    // Defaults for SMS
    setSmsText(SMS_TEMPLATES[0].text);

    // Defaults for WhatsApp
    setMessageTemplate('Olá {{nome}}! Tudo bem? Passando para te apresentar uma novidade exclusiva da {{empresa}}.');
    setDelaySeconds(5);
    setProvider(chosenChannel === 'sms' ? 'z_api' : chosenChannel === 'whatsapp' ? 'simulado_web' : 'resend');

    setIsModalOpen(true);
  };

  // Open Edit Campaign Modal
  const handleOpenEditModal = (camp: BroadcastCampaign) => {
    setEditingCampaignId(camp.id);
    setChannel(camp.channel);
    setSelectedChannels(camp.channels || ['email', 'whatsapp', 'sms']);
    setMultichannelPreviewTab('email');
    setCampaignName(camp.name);
    setTargetStage(camp.targetStage);
    setTargetSource(camp.targetSource);
    setTargetTag(camp.targetTag || 'Todas');

    // Scheduling
    setIsScheduled(!!camp.scheduledAt);
    if (camp.scheduledAt) {
      setScheduledDate(camp.scheduledAt.split('T')[0]);
      setScheduledTime(camp.scheduledAt.includes('T') ? camp.scheduledAt.split('T')[1].substring(0, 5) : '09:00');
    } else {
      const tomorrow = new Date(Date.now() + 86400000);
      setScheduledDate(tomorrow.toISOString().split('T')[0]);
      setScheduledTime('09:00');
    }

    // CTA
    setCtaUrl(camp.ctaUrl || '');
    setCtaText(camp.ctaText || 'Garantir Minha Vaga');

    setEmailSubject(camp.emailSubject || '');
    setEmailPreheader(camp.emailPreheader || '');
    setEmailSenderName(camp.emailSenderName || currentCompany?.name || 'Equipe');
    setEmailSenderEmail(camp.emailSenderEmail || 'contato@empresa.com.br');
    setEmailBodyHtml(camp.emailBodyHtml || EMAIL_TEMPLATES[0].bodyHtml);
    setSmsText(camp.smsText || '');
    setMessageTemplate(camp.messageTemplate || '');
    setDelaySeconds(camp.delaySeconds || 5);
    setProvider(camp.provider || 'simulado');
    setIsModalOpen(true);
  };

  // Save Campaign
  const handleSaveCampaign = async (statusOverride?: 'rascunho' | 'concluido' | 'agendado') => {
    if (!campaignName.trim()) {
      await alert('Por favor, informe o nome da campanha.');
      return;
    }

    let effectiveScheduledAt: string | null = null;
    let finalStatus: 'rascunho' | 'concluido' | 'agendado' = statusOverride || 'rascunho';

    if (isScheduled && scheduledDate) {
      effectiveScheduledAt = new Date(`${scheduledDate}T${scheduledTime || '09:00'}:00`).toISOString();
      if (finalStatus !== 'concluido' && new Date(effectiveScheduledAt) > new Date()) {
        finalStatus = 'agendado';
      }
    }

    const payload: Partial<BroadcastCampaign> = {
      name: campaignName,
      channel,
      channels: channel === 'multichannel' ? selectedChannels : [channel],
      targetStage: targetStage as any,
      targetSource,
      targetTag,
      status: finalStatus,
      totalLeads: eligibleLeads.length,
      provider,
      delaySeconds,
      companyId,
      scheduledAt: effectiveScheduledAt || undefined,
      ctaUrl,
      ctaText,
      emailSubject,
      emailPreheader,
      emailSenderName,
      emailSenderEmail,
      emailBodyHtml,
      smsText,
      messageTemplate
    };

    try {
      if (editingCampaignId) {
        const updated = await updateBroadcastCampaign(editingCampaignId, payload);
        setCampaigns(prev => prev.map(c => c.id === editingCampaignId ? updated : c));
        await alert(`Campanha "${updated.name}" atualizada com sucesso!`);
      } else {
        const created = await createBroadcastCampaign(payload);
        setCampaigns(prev => [created, ...prev]);
        await alert(
          finalStatus === 'agendado'
            ? `⏰ Campanha "${created.name}" agendada com sucesso para ${new Date(effectiveScheduledAt!).toLocaleDateString('pt-BR')} às ${new Date(effectiveScheduledAt!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}!`
            : `Campanha "${created.name}" criada com sucesso!`
        );
      }
      setIsModalOpen(false);
    } catch (err: any) {
      await alert(err.message || 'Erro ao salvar campanha');
    }
  };

  // Open Recipients Engagement Modal (Quem Abriu e Clicou)
  const handleOpenRecipientsModal = async (camp: BroadcastCampaign) => {
    setSelectedCampaignForRecipients(camp);
    setIsLoadingRecipients(true);
    setRecipientFilter('all');
    setRecipientSearch('');
    try {
      const data = await fetchBroadcastRecipients(camp.id);
      setCampaignRecipients(data.recipients || []);
    } catch (err: any) {
      setCampaignRecipients(camp.recipients || []);
    } finally {
      setIsLoadingRecipients(false);
    }
  };

  // Simulate activity on recipient (real-time test)
  const handleSimulateRecipientActivity = async (leadId: string, action: 'open' | 'click') => {
    if (!selectedCampaignForRecipients) return;
    try {
      const res = await simulateRecipientActivity(selectedCampaignForRecipients.id, { leadId, action });
      if (res.success && res.recipient) {
        setCampaignRecipients(prev => prev.map(r => r.leadId === leadId ? res.recipient : r));
        if (res.campaign) {
          setCampaigns(prev => prev.map(c => c.id === selectedCampaignForRecipients.id ? res.campaign : c));
          setSelectedCampaignForRecipients(res.campaign);
        }
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  // Launch Campaign Immediately
  const handleLaunchCampaign = async (camp: BroadcastCampaign) => {
    const confirmed = await confirm(`Deseja disparar a campanha "${camp.name}" (${camp.channel.toUpperCase()}) para ${camp.totalLeads || eligibleLeads.length} contatos qualificados agora?`);
    if (!confirmed) return;

    try {
      const res = await launchBroadcastCampaign(camp.id);
      if (res.success && res.campaign) {
        setCampaigns(prev => prev.map(c => c.id === camp.id ? res.campaign : c));
        await alert(`🚀 Campanha disparada com sucesso para ${res.campaign.sentCount} contatos! As métricas foram atualizadas.`);
      }
    } catch (err: any) {
      await alert(err.message || 'Erro ao disparar campanha');
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (camp: BroadcastCampaign) => {
    const confirmed = await confirm(`Excluir a campanha "${camp.name}"?`);
    if (!confirmed) return;

    try {
      await deleteBroadcastCampaign(camp.id);
      setCampaigns(prev => prev.filter(c => c.id !== camp.id));
    } catch (err: any) {
      await alert(err.message || 'Erro ao excluir campanha');
    }
  };

  // Send Single Test
  const handleSendTest = async () => {
    if (channel === 'email' && !testTargetEmail) {
      await alert('Por favor, informe o e-mail de destino para o teste.');
      return;
    }
    if ((channel === 'sms' || channel === 'whatsapp') && !testTargetPhone) {
      await alert('Por favor, informe o telefone de destino para o teste.');
      return;
    }

    setIsSendingTest(true);
    try {
      const campId = editingCampaignId || 'temp-test';
      const res = await sendTestBroadcast(campId, {
        channel,
        targetEmail: testTargetEmail,
        targetPhone: testTargetPhone
      });
      await alert(`✅ ${res.message || 'Disparo de teste realizado com sucesso!'}`);
      setTestModalOpen(false);
      await loadCampaigns();
    } catch (err: any) {
      await alert(err.message || 'Erro ao enviar disparo de teste');
    } finally {
      setIsSendingTest(false);
    }
  };

  // AI Copy Generation
  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const selectedProd = products.find(p => p.id === aiSelectedProductId);
      const res = await generateBroadcastAI({
        channel,
        goal: aiGoal,
        productName: selectedProd?.name || aiCustomNiche,
        tone: aiTone,
        companyId
      });

      if (res.success) {
        if (channel === 'email') {
          if (res.emailSubject) setEmailSubject(res.emailSubject);
          if (res.emailPreheader) setEmailPreheader(res.emailPreheader);
          if (res.emailSenderName) setEmailSenderName(res.emailSenderName);
          if (res.emailBodyHtml) setEmailBodyHtml(res.emailBodyHtml);
        } else if (channel === 'sms') {
          if (res.smsText) setSmsText(res.smsText);
        } else {
          if (res.messageTemplate) setMessageTemplate(res.messageTemplate);
        }

        setAiModalOpen(false);
        await alert('✨ Conteúdo gerado com IA e aplicado ao editor com sucesso!');
      }
    } catch (err: any) {
      await alert(err.message || 'Erro ao gerar conteúdo com IA');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Variable inserter helper
  const insertVariable = (variable: string) => {
    const activeCh = channel === 'multichannel' ? multichannelPreviewTab : channel;
    if (activeCh === 'email') {
      setEmailBodyHtml(prev => prev + variable);
    } else if (activeCh === 'sms') {
      setSmsText(prev => prev + variable);
    } else {
      setMessageTemplate(prev => prev + variable);
    }
  };

  // Character counter for SMS
  const smsCharCount = smsText.length;
  const smsSegments = Math.ceil(smsCharCount / 160) || 1;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md text-blue-300 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Automação Multicanal Estilo RD Station</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              E-mail Marketing, SMS & Disparos em Massa
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Crie campanhas segmentadas por canal, use modelos de alta conversão gerados por IA e acompanhe taxas de entrega, abertura e cliques em tempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleOpenCreateModal('multichannel')}
              className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-extrabold px-4 py-2.5 rounded-xl transition text-sm flex items-center gap-2 shadow-lg shadow-rose-600/30 border border-white/20"
            >
              <Flame className="w-4 h-4 text-amber-200" />
              <span>Novo Lançamento Multicanal</span>
            </button>
            <button
              onClick={() => handleOpenCreateModal('email')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl transition text-sm flex items-center gap-2 shadow-lg shadow-blue-600/30"
            >
              <Mail className="w-4 h-4" />
              <span>Novo E-mail</span>
            </button>
            <button
              onClick={() => handleOpenCreateModal('whatsapp')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl transition text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30"
            >
              <Radio className="w-4 h-4" />
              <span>Disparo WhatsApp</span>
            </button>
            <button
              onClick={() => handleOpenCreateModal('sms')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl transition text-sm flex items-center gap-2 shadow-lg shadow-purple-600/30"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Novo SMS</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-800/60 p-4 rounded-2xl backdrop-blur-sm border border-slate-700/60">
            <div className="text-xs text-slate-400 font-medium">Campanhas Criadas</div>
            <div className="text-2xl font-black text-white mt-1">{kpis.total}</div>
            <div className="text-[11px] text-blue-400 mt-0.5">E-mail, Whats & SMS ativos</div>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-2xl backdrop-blur-sm border border-slate-700/60">
            <div className="text-xs text-slate-400 font-medium">E-mails Disparados</div>
            <div className="text-2xl font-black text-blue-400 mt-1">{kpis.totalEmailsSent.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">Taxa de Abertura: {kpis.emailOpenRate.toFixed(1)}%</div>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-2xl backdrop-blur-sm border border-slate-700/60">
            <div className="text-xs text-slate-400 font-medium">Disparos WhatsApp</div>
            <div className="text-2xl font-black text-emerald-400 mt-1">{kpis.totalWppSent.toLocaleString()}</div>
            <div className="text-[11px] text-emerald-300 mt-0.5">Sincronizado p/ Lançamento</div>
          </div>
          <div className="bg-slate-800/60 p-4 rounded-2xl backdrop-blur-sm border border-slate-700/60">
            <div className="text-xs text-slate-400 font-medium">SMS Entregues</div>
            <div className="text-2xl font-black text-purple-400 mt-1">{kpis.totalSmsSent.toLocaleString()}</div>
            <div className="text-[11px] text-purple-300 mt-0.5">Taxa de Entrega: {kpis.smsDeliveryRate.toFixed(1)}%</div>
          </div>
        </div>
      </div>

      {/* Navigation Channel Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todas as Campanhas', icon: Send, count: campaigns.length },
            { id: 'multichannel', label: 'Lançamentos Multicanal', icon: Flame, count: campaigns.filter(c => c.channel === 'multichannel').length },
            { id: 'email', label: 'E-mail Marketing', icon: Mail, count: campaigns.filter(c => c.channel === 'email').length },
            { id: 'whatsapp', label: 'WhatsApp Broadcast', icon: Radio, count: campaigns.filter(c => c.channel === 'whatsapp').length },
            { id: 'sms', label: 'SMS Marketing', icon: MessageSquare, count: campaigns.filter(c => c.channel === 'sms').length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeChannelTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveChannelTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome ou assunto..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium"
          >
            <option value="all">Status: Todos</option>
            <option value="concluido">Concluídas</option>
            <option value="em_andamento">Em Andamento</option>
            <option value="rascunho">Rascunhos</option>
          </select>
        </div>
      </div>

      {/* Campaign Cards List */}
      {isLoading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
          <p className="text-sm">Carregando campanhas...</p>
        </div>
      ) : filteredCampaigns.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhuma campanha encontrada</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
            Crie sua primeira campanha de e-mail ou SMS para engajar sua base de leads com inteligência e escala.
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => handleOpenCreateModal('email')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              Criar Campanha de E-mail
            </button>
            <button
              onClick={() => handleOpenCreateModal('sms')}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
            >
              Criar Disparo de SMS
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map(camp => {
            const isMultichannel = camp.channel === 'multichannel';
            const isEmail = camp.channel === 'email';
            const isSms = camp.channel === 'sms';
            const isWpp = camp.channel === 'whatsapp';

            const openRate = (camp.sentCount || 0) > 0 ? (((camp.openedCount || 0) / (camp.sentCount || 1)) * 100).toFixed(1) : '0.0';
            const clickRate = (camp.sentCount || 0) > 0 ? (((camp.clickedCount || 0) / (camp.sentCount || 1)) * 100).toFixed(1) : '0.0';

            return (
              <div
                key={camp.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition flex flex-col justify-between overflow-hidden"
              >
                {/* Top Card Info */}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${
                      isMultichannel ? 'bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 text-rose-700 border border-rose-300' :
                      isEmail ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      isSms ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                      'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isMultichannel && <Flame className="w-3.5 h-3.5 text-rose-500" />}
                      {isEmail && <Mail className="w-3 h-3" />}
                      {isSms && <MessageSquare className="w-3 h-3" />}
                      {isWpp && <Radio className="w-3 h-3" />}
                      <span>{isMultichannel ? 'LANÇAMENTO MULTICANAL' : camp.channel.toUpperCase()}</span>
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      camp.status === 'concluido' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      camp.status === 'agendado' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                      camp.status === 'em_andamento' ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {camp.status === 'concluido' ? '✓ Concluída' : camp.status === 'agendado' ? '⏰ Programada' : camp.status === 'em_andamento' ? 'Disparando' : 'Rascunho'}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 line-clamp-1 mb-1.5" title={camp.name}>
                    {camp.name}
                  </h3>

                  {/* Scheduled Date/Time Badge for Launches */}
                  {camp.scheduledAt && (
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 bg-amber-50/90 px-3 py-1.5 rounded-xl border border-amber-200/90 mb-3">
                      <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">
                        Disparo: <strong>{new Date(camp.scheduledAt).toLocaleDateString('pt-BR')} às {new Date(camp.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</strong>
                      </span>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {isMultichannel ? `Campanha sincronizada (E-mail: "${camp.emailSubject || 'Sem assunto'}" + Whats + SMS)` :
                     isEmail ? (camp.emailSubject || 'Sem assunto definido') :
                     isSms ? (camp.smsText || 'Sem mensagem definida') :
                     (camp.messageTemplate || 'Sem mensagem')}
                  </p>

                  {/* Target Audience Pill */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      Alvo: <strong>{camp.targetStage}</strong> ({camp.totalLeads || 0} contatos)
                    </span>
                  </div>

                  {/* Engagement Metrics */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Enviados</div>
                      <div className="text-sm font-bold text-slate-800">{camp.sentCount || 0}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">{isEmail || isMultichannel ? 'Abertura' : 'Entregues'}</div>
                      <div className="text-sm font-bold text-blue-600">{isEmail || isMultichannel ? `${openRate}%` : (camp.deliveredCount || 0)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-medium">Cliques no Link</div>
                      <div className="text-sm font-bold text-emerald-600">{camp.clickedCount || 0} ({clickRate}%)</div>
                    </div>
                  </div>

                  {/* Button: Relatório de Quem Abriu e Clicou */}
                  <button
                    onClick={() => handleOpenRecipientsModal(camp)}
                    className="w-full mt-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-between border border-blue-200/80 shadow-2xs group"
                  >
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                      <span>Ver Quem Abriu & Clicou</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {camp.openedCount || 0} abriram • {camp.clickedCount || 0} cliques
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-500" />
                    </div>
                  </button>
                </div>

                {/* Card Actions */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditingCampaignId(camp.id);
                        setChannel(camp.channel);
                        setTestModalOpen(true);
                      }}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600 bg-white hover:bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 transition"
                      title="Enviar disparo de teste"
                    >
                      Testar
                    </button>
                    {(camp.status !== 'concluido' || (camp.sentCount || 0) === 0) && (
                      <button
                        onClick={() => handleLaunchCampaign(camp)}
                        className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-xs"
                      >
                        <Play className="w-3 h-3" />
                        <span>Disparar</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(camp)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition"
                      title="Editar"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCampaign(camp)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* CAMPAIGN BUILDER & EDITOR MODAL                          */}
      {/* ========================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col justify-between overflow-hidden animate-fade-in">
          
          {/* Top Bar */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{editingCampaignId ? 'Editar Campanha' : 'Nova Campanha Multicanal'}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400">
                    {channel.toUpperCase()}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Defina o canal, a audiência segmentada e visualize em tempo real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setAiModalOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gerar Copy com IA</span>
              </button>

              <button
                onClick={() => setTestModalOpen(true)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-700"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Teste</span>
              </button>

              <button
                onClick={() => handleSaveCampaign('rascunho')}
                className="bg-slate-700 hover:bg-slate-600 text-white font-semibold text-xs px-4 py-2 rounded-xl transition"
              >
                Salvar Rascunho
              </button>

              <button
                onClick={() => handleSaveCampaign('concluido')}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-blue-600/30"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Salvar & Disparar</span>
              </button>
            </div>
          </div>

          {/* Modal Body: Left Settings + Right Live Preview */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT COLUMN: Configuration (480px) */}
            <div className="w-full lg:w-[500px] bg-white border-r border-slate-200 p-6 overflow-y-auto space-y-5 text-sm shrink-0">
              
              {/* Step 1: Channel Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  1. Canal de Disparo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setChannel('multichannel');
                      setSelectedChannels(['email', 'whatsapp', 'sms']);
                      setMultichannelPreviewTab('email');
                    }}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      channel === 'multichannel'
                        ? 'border-rose-500 bg-rose-50/70 text-rose-700 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Flame className="w-5 h-5 text-rose-500" />
                    <span className="text-xs">Multicanal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('email')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      channel === 'email'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-xs">E-mail</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('whatsapp')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      channel === 'whatsapp'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <Radio className="w-5 h-5" />
                    <span className="text-xs">WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setChannel('sms')}
                    className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                      channel === 'sms'
                        ? 'border-purple-600 bg-purple-50/50 text-purple-700 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-xs">SMS</span>
                  </button>
                </div>

                {channel === 'multichannel' && (
                  <div className="mt-2.5 p-3 bg-rose-50/60 rounded-xl border border-rose-200 flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-800">Canais integrados neste lançamento:</span>
                    <div className="flex items-center gap-3 text-xs">
                      <label className="inline-flex items-center gap-1 text-slate-700 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={selectedChannels.includes('email')}
                          onChange={e => {
                            if (e.target.checked) setSelectedChannels(prev => [...prev, 'email']);
                            else setSelectedChannels(prev => prev.filter(c => c !== 'email'));
                          }}
                          className="rounded text-blue-600"
                        />
                        <span>E-mail</span>
                      </label>
                      <label className="inline-flex items-center gap-1 text-slate-700 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={selectedChannels.includes('whatsapp')}
                          onChange={e => {
                            if (e.target.checked) setSelectedChannels(prev => [...prev, 'whatsapp']);
                            else setSelectedChannels(prev => prev.filter(c => c !== 'whatsapp'));
                          }}
                          className="rounded text-emerald-600"
                        />
                        <span>WhatsApp</span>
                      </label>
                      <label className="inline-flex items-center gap-1 text-slate-700 cursor-pointer font-medium">
                        <input
                          type="checkbox"
                          checked={selectedChannels.includes('sms')}
                          onChange={e => {
                            if (e.target.checked) setSelectedChannels(prev => [...prev, 'sms']);
                            else setSelectedChannels(prev => prev.filter(c => c !== 'sms'));
                          }}
                          className="rounded text-purple-600"
                        />
                        <span>SMS</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Campaign Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  2. Nome da Campanha
                </label>
                <input
                  type="text"
                  value={campaignName}
                  onChange={e => setCampaignName(e.target.value)}
                  placeholder="Ex: Lançamento Abertura de Carrinho - Turma 04"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Step 3: Scheduling Date & Time (Data e Hora de Disparo de Lançamentos) */}
              <div className="p-4 bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-orange-500/10 rounded-2xl border border-amber-300/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                      3. Agendamento de Disparo (Lançamentos)
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={e => setIsScheduled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {isScheduled ? (
                  <div className="space-y-3 pt-1">
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Defina a <strong>data e horário exato</strong> para que os e-mails, WhatsApp e SMS sejam disparados automaticamente na sincronização do lançamento.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Data do Disparo
                        </label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={e => setScheduledDate(e.target.value)}
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-xl text-xs bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Hora do Disparo
                        </label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={e => setScheduledTime(e.target.value)}
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-xl text-xs bg-white font-medium"
                        />
                      </div>
                    </div>
                    {scheduledDate && (
                      <div className="text-[11px] font-bold text-amber-800 bg-amber-100/70 p-2.5 rounded-xl flex items-center gap-2 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>
                          Disparo programado para: <strong>{new Date(`${scheduledDate}T${scheduledTime || '09:00'}:00`).toLocaleDateString('pt-BR')} às {scheduledTime || '09:00'}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Disparo imediato ao clicar em "Salvar & Disparar". Ative acima para definir a data e hora do lançamento.
                  </p>
                )}
              </div>

              {/* Step 4: CTA Link & Button (Rastreamento de Cliques) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    4. Link & Botão de Oferta (Rastreamento de Cliques)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Link de Destino / Checkout
                    </label>
                    <input
                      type="url"
                      value={ctaUrl}
                      onChange={e => setCtaUrl(e.target.value)}
                      placeholder="https://seusite.com.br/checkout"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Texto do Botão / Chamada
                    </label>
                    <input
                      type="text"
                      value={ctaText}
                      onChange={e => setCtaText(e.target.value)}
                      placeholder="Ex: Garantir Minha Vaga"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-blue-700"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  🔗 Cada lead receberá links rastreados individualmente para identificar quem clicou no e-mail, Whats ou SMS.
                </p>
              </div>

              {/* Step 5: Audience Segmentation */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    5. Segmentação da Base
                  </span>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                    {eligibleLeads.length} leads qualificados
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Estágio no Funil CRM
                    </label>
                    <select
                      value={targetStage}
                      onChange={e => setTargetStage(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value="Todos">Todos os Estágios</option>
                      {FUNNEL_STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Origem / Campanha UTM
                    </label>
                    <select
                      value={targetSource}
                      onChange={e => setTargetSource(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value="Todas">Todas as Origens</option>
                      {availableSources.map(src => (
                        <option key={src} value={src}>{src}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  {channel === 'email' ? 'Apenas contatos com e-mail válido serão incluídos.' :
                   channel === 'multichannel' ? 'Contatos com e-mail ou telefone/WhatsApp com DDD serão qualificados.' :
                   'Apenas contatos com telefone/WhatsApp válido com DDD serão incluídos.'}
                </p>
              </div>

              {/* Step 6: Content Form Fields */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    6. Conteúdo da Mensagem
                  </span>

                  {/* Insert Variable Helper */}
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400">Variáveis:</span>
                    {['{{nome}}', '{{empresa}}', '{{telefone}}'].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => insertVariable(v)}
                        className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sub-tabs for Multichannel copy editor */}
                {channel === 'multichannel' && (
                  <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 mb-2">
                    <button
                      type="button"
                      onClick={() => setMultichannelPreviewTab('email')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        multichannelPreviewTab === 'email' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>E-mail do Lançamento</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMultichannelPreviewTab('whatsapp')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        multichannelPreviewTab === 'whatsapp' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMultichannelPreviewTab('sms')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        multichannelPreviewTab === 'sms' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>SMS</span>
                    </button>
                  </div>
                )}

                {/* E-MAIL FIELDS */}
                {(channel === 'email' || (channel === 'multichannel' && multichannelPreviewTab === 'email')) && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Assunto do E-mail</label>
                        <span className="text-[10px] text-slate-400">{emailSubject.length} chars (ideal: 30-50)</span>
                      </div>
                      <input
                        type="text"
                        value={emailSubject}
                        onChange={e => setEmailSubject(e.target.value)}
                        placeholder="Ex: 🔥 Última chance: Sua condição especial encerra hoje"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Pré-cabeçalho (Preheader)</label>
                      <input
                        type="text"
                        value={emailPreheader}
                        onChange={e => setEmailPreheader(e.target.value)}
                        placeholder="Ex: Resumo visual exibido antes de abrir o e-mail..."
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Nome do Remetente</label>
                        <input
                          type="text"
                          value={emailSenderName}
                          onChange={e => setEmailSenderName(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail de Envio</label>
                        <input
                          type="email"
                          value={emailSenderEmail}
                          onChange={e => setEmailSenderEmail(e.target.value)}
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    {/* Ready Template Chooser */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Carregar Modelo Pronto</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {EMAIL_TEMPLATES.map(tpl => (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => {
                              setEmailSubject(tpl.subject);
                              setEmailPreheader(tpl.preheader);
                              setEmailBodyHtml(tpl.bodyHtml);
                            }}
                            className="p-2 border border-slate-200 hover:border-blue-500 rounded-lg text-left text-[11px] bg-slate-50 transition"
                          >
                            <div className="font-bold text-slate-800 truncate">{tpl.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">{tpl.category}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Corpo do E-mail (HTML / Rich Text)</label>
                      <textarea
                        value={emailBodyHtml}
                        onChange={e => setEmailBodyHtml(e.target.value)}
                        rows={8}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>
                )}

                {/* SMS FIELDS */}
                {(channel === 'sms' || (channel === 'multichannel' && multichannelPreviewTab === 'sms')) && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">Texto do SMS</label>
                        <span className={`text-[11px] font-bold ${smsCharCount > 160 ? 'text-amber-600' : 'text-slate-500'}`}>
                          {smsCharCount}/160 caracteres ({smsSegments} SMS)
                        </span>
                      </div>
                      <textarea
                        value={smsText}
                        onChange={e => setSmsText(e.target.value)}
                        rows={4}
                        placeholder="Digite o texto do SMS..."
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs leading-relaxed"
                      />
                    </div>

                    {/* Quick SMS templates */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Modelos Rápidos de SMS</label>
                      <div className="grid grid-cols-2 gap-1.5">
                        {SMS_TEMPLATES.map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSmsText(t.text)}
                            className="p-2 border border-slate-200 hover:border-purple-500 rounded-lg text-left text-[11px] bg-slate-50"
                          >
                            <div className="font-bold text-slate-800">{t.name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{t.text}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* WHATSAPP FIELDS */}
                {(channel === 'whatsapp' || (channel === 'multichannel' && multichannelPreviewTab === 'whatsapp')) && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mensagem do WhatsApp</label>
                      <textarea
                        value={messageTemplate}
                        onChange={e => setMessageTemplate(e.target.value)}
                        rows={4}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Intervalo entre Disparos (Segurança Anti-Bloqueio)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="3"
                          max="30"
                          value={delaySeconds}
                          onChange={e => setDelaySeconds(Number(e.target.value))}
                          className="w-full"
                        />
                        <span className="font-bold text-xs text-slate-700 shrink-0">{delaySeconds}s</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* RIGHT COLUMN: Live Interactive Preview */}
            <div className="flex-1 bg-slate-950 p-6 md:p-10 flex flex-col items-center justify-center overflow-hidden">
              
              {/* Preview channel selector for Multichannel */}
              {channel === 'multichannel' && (
                <div className="mb-4 bg-slate-900 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-2">Prévia:</span>
                  <button
                    onClick={() => setMultichannelPreviewTab('email')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      multichannelPreviewTab === 'email' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>E-mail</span>
                  </button>
                  <button
                    onClick={() => setMultichannelPreviewTab('whatsapp')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      multichannelPreviewTab === 'whatsapp' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setMultichannelPreviewTab('sms')}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 ${
                      multichannelPreviewTab === 'sms' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>SMS</span>
                  </button>
                </div>
              )}

              {/* Device Toggle for Email */}
              {(channel === 'email' || (channel === 'multichannel' && multichannelPreviewTab === 'email')) && (
                <div className="mb-4 bg-slate-800 p-1 rounded-xl flex items-center border border-slate-700">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Visualização Desktop</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Visualização Mobile</span>
                  </button>
                </div>
              )}

              {/* LIVE PREVIEW CONTAINER */}
              {(channel === 'email' || (channel === 'multichannel' && multichannelPreviewTab === 'email')) ? (
                <div
                  className={`bg-white transition-all duration-300 overflow-y-auto shadow-2xl relative rounded-2xl border border-slate-700 ${
                    previewDevice === 'mobile' ? 'w-[375px] h-[600px]' : 'w-full max-w-2xl h-[600px]'
                  }`}
                >
                  {/* Email Client Header Bar */}
                  <div className="p-4 bg-slate-100 border-b border-slate-200 text-xs text-slate-700">
                    <div className="font-bold text-slate-900 text-sm mb-1">{emailSubject || 'Sem assunto'}</div>
                    <div className="text-[11px] text-slate-500 mb-0.5">
                      De: <strong>{emailSenderName}</strong> &lt;{emailSenderEmail}&gt;
                    </div>
                    {emailPreheader && (
                      <div className="text-[11px] text-slate-400 italic">
                        Pré-visualização: {emailPreheader}
                      </div>
                    )}
                  </div>

                  {/* Rendered HTML */}
                  <div
                    className="p-6 overflow-y-auto"
                    dangerouslySetInnerHTML={{
                      __html: emailBodyHtml
                        .replace(/\{\{nome\}\}/g, 'Rodrigo')
                        .replace(/\{\{empresa\}\}/g, currentCompany?.name || 'MDTracker')
                    }}
                  />
                </div>
              ) : (channel === 'sms' || (channel === 'multichannel' && multichannelPreviewTab === 'sms')) ? (
                <div className="w-[320px] h-[580px] bg-slate-900 rounded-[44px] border-[10px] border-slate-800 p-4 shadow-2xl flex flex-col justify-between relative">
                  {/* Smartphone Notch */}
                  <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto mb-4"></div>

                  <div className="flex-1 flex flex-col justify-end pb-4 space-y-3">
                    <div className="text-center text-[10px] text-slate-500 uppercase font-semibold">
                      Mensagem de Texto (SMS)
                    </div>

                    {/* SMS Message Bubble */}
                    <div className="bg-purple-600 text-white p-3.5 rounded-2xl rounded-br-xs text-xs shadow-md leading-relaxed">
                      {smsText
                        .replace(/\{\{nome\}\}/g, 'Rodrigo')
                        .replace(/\{\{empresa\}\}/g, currentCompany?.name || 'MDTracker')}
                    </div>

                    <div className="text-[9px] text-slate-500 text-right pr-2">
                      Entregue • Agora
                    </div>
                  </div>

                  <div className="h-10 bg-slate-800 rounded-xl flex items-center px-3 text-slate-400 text-xs">
                    iMessage / SMS...
                  </div>
                </div>
              ) : (
                <div className="w-[340px] h-[600px] bg-slate-900 rounded-[44px] border-[10px] border-slate-800 p-4 shadow-2xl flex flex-col justify-between">
                  <div className="w-24 h-4 bg-slate-800 rounded-b-xl mx-auto mb-4"></div>
                  
                  <div className="flex-1 flex flex-col justify-end pb-4 space-y-2">
                    <div className="bg-emerald-600 text-white p-3.5 rounded-2xl rounded-br-xs text-xs shadow-md leading-relaxed">
                      {messageTemplate
                        .replace(/\{\{nome\}\}/g, 'Rodrigo')
                        .replace(/\{\{empresa\}\}/g, currentCompany?.name || 'MDTracker')}
                    </div>
                    <div className="text-[9px] text-slate-400 text-right pr-2">✓✓ Entregue</div>
                  </div>

                  <div className="h-10 bg-slate-800 rounded-xl flex items-center px-3 text-slate-400 text-xs">
                    Mensagem WhatsApp...
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TEST DISPATCH MODAL                                       */}
      {/* ========================================================= */}
      {testModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Disparo de Teste Individual</h3>
              </div>
              <button onClick={() => setTestModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Valide o layout, a formatação das variáveis e os links antes de disparar para a base completa de leads.
            </p>

            {channel === 'email' ? (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">Seu E-mail de Teste</label>
                <input
                  type="email"
                  value={testTargetEmail}
                  onChange={e => setTestTargetEmail(e.target.value)}
                  placeholder="seu@email.com.br"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">Seu Telefone / WhatsApp com DDD</label>
                <input
                  type="tel"
                  value={testTargetPhone}
                  onChange={e => setTestTargetPhone(e.target.value)}
                  placeholder="(11) 99999-8888"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setTestModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {isSendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Disparar Teste</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* GEMINI AI COPYWRITER MODAL                                */}
      {/* ========================================================= */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Gerar Copy com IA ({channel.toUpperCase()})</h3>
                  <p className="text-[11px] text-slate-500">Copywriting de alta conversão para o seu público</p>
                </div>
              </div>
              <button onClick={() => setAiModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {products.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Produto do Catálogo (Opcional)</label>
                  <select
                    value={aiSelectedProductId}
                    onChange={e => {
                      setAiSelectedProductId(e.target.value);
                      const p = products.find(prod => prod.id === e.target.value);
                      if (p) setAiCustomNiche(p.name);
                    }}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="">-- Selecione ou digite abaixo --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (R$ {p.price.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Produto ou Nicho *</label>
                <input
                  type="text"
                  value={aiCustomNiche}
                  onChange={e => setAiCustomNiche(e.target.value)}
                  placeholder="Ex: Consultoria de Vendas B2B / Curso de Marketing"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Objetivo da Campanha</label>
                <input
                  type="text"
                  value={aiGoal}
                  onChange={e => setAiGoal(e.target.value)}
                  placeholder="Ex: Reengajar contatos inativos / Oferta com cupom de desconto"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tom de Voz</label>
                <select
                  value={aiTone}
                  onChange={e => setAiTone(e.target.value as any)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="persuasivo">Persuasivo & Focado em Fechamento</option>
                  <option value="profissional">Profissional & Corporativo</option>
                  <option value="urgente">Urgente & Escasso (Oferta Relâmpago)</option>
                  <option value="amigavel">Amigável & Conector</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gerando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gerar Conteúdo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RECIPIENTS ENGAGEMENT MODAL (QUEM ABRIU E CLICOU)         */}
      {/* ========================================================= */}
      {selectedCampaignForRecipients && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-white">
                      Relatório de Engajamento: Quem Abriu e Clicou
                    </h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 uppercase">
                      {selectedCampaignForRecipients.channel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Campanha: <strong className="text-slate-200">{selectedCampaignForRecipients.name}</strong> • Alvo: {selectedCampaignForRecipients.targetStage}
                    {selectedCampaignForRecipients.scheduledAt && (
                      <span className="ml-2 text-amber-300">
                        • Disparo Programado: {new Date(selectedCampaignForRecipients.scheduledAt).toLocaleDateString('pt-BR')} às {new Date(selectedCampaignForRecipients.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCampaignForRecipients(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal KPI Highlights */}
            {(() => {
              const totalRecipients = campaignRecipients.length;
              const openedCount = campaignRecipients.filter(r => r.status === 'aberto' || r.status === 'clicou' || !!r.openedAt).length;
              const clickedCount = campaignRecipients.filter(r => r.status === 'clicou' || !!r.clickedAt).length;
              const openRate = totalRecipients > 0 ? ((openedCount / totalRecipients) * 100).toFixed(1) : '0.0';
              const clickRate = totalRecipients > 0 ? ((clickedCount / totalRecipients) * 100).toFixed(1) : '0.0';

              return (
                <div className="p-4 md:px-6 bg-slate-50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="text-[11px] font-medium text-slate-500">Total de Contatos</div>
                    <div className="text-xl font-black text-slate-900 mt-0.5">{totalRecipients}</div>
                    <div className="text-[10px] text-slate-400">Leads no disparo</div>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="text-[11px] font-medium text-blue-600 flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Abriram a Mensagem</span>
                    </div>
                    <div className="text-xl font-black text-blue-600 mt-0.5">{openedCount}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">{openRate}% taxa de abertura</div>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <MousePointerClick className="w-3.5 h-3.5" />
                      <span>Clicaram no Link / Botão</span>
                    </div>
                    <div className="text-xl font-black text-emerald-600 mt-0.5">{clickedCount}</div>
                    <div className="text-[10px] text-emerald-700 font-semibold">{clickRate}% taxa de cliques</div>
                  </div>
                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                    <div className="text-[11px] font-medium text-slate-500">CTA Rastreado</div>
                    <div className="text-xs font-bold text-slate-800 mt-1 truncate" title={selectedCampaignForRecipients.ctaUrl || 'mdtr.link/oferta'}>
                      {selectedCampaignForRecipients.ctaText || 'Garantir Minha Vaga'}
                    </div>
                    <div className="text-[10px] text-blue-600 truncate">{selectedCampaignForRecipients.ctaUrl || 'mdtr.link/oferta'}</div>
                  </div>
                </div>
              );
            })()}

            {/* Filter Tabs & Search Bar */}
            <div className="px-6 py-3 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              {(() => {
                const total = campaignRecipients.length;
                const opened = campaignRecipients.filter(r => r.status === 'aberto' || r.status === 'clicou' || !!r.openedAt).length;
                const clicked = campaignRecipients.filter(r => r.status === 'clicou' || !!r.clickedAt).length;
                const unopened = total - opened;

                return (
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      onClick={() => setRecipientFilter('all')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                        recipientFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <span>Todos</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-700 text-white">{total}</span>
                    </button>
                    <button
                      onClick={() => setRecipientFilter('opened')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                        recipientFilter === 'opened' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Abriram</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500 text-white">{opened}</span>
                    </button>
                    <button
                      onClick={() => setRecipientFilter('clicked')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                        recipientFilter === 'clicked' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      <MousePointerClick className="w-3.5 h-3.5" />
                      <span>Clicaram no Link</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">{clicked}</span>
                    </button>
                    <button
                      onClick={() => setRecipientFilter('unopened')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                        recipientFilter === 'unopened' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      <span>Não Abriram</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white">{unopened}</span>
                    </button>
                  </div>
                );
              })()}

              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={recipientSearch}
                  onChange={e => setRecipientSearch(e.target.value)}
                  placeholder="Buscar lead por nome ou email..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Test Activity Simulation Banner */}
            <div className="px-6 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between gap-3 text-xs text-blue-900 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Validação em Tempo Real:</strong> Você pode simular a abertura ou o clique em qualquer contato abaixo para ver o CRM e as métricas atualizarem instantaneamente.
                </span>
              </div>
            </div>

            {/* Recipients Table / List */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {isLoadingRecipients ? (
                <div className="p-12 text-center text-slate-500">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-sm">Carregando contatos e histórico de cliques...</p>
                </div>
              ) : (() => {
                const filtered = campaignRecipients.filter(rec => {
                  const isOpened = rec.status === 'aberto' || rec.status === 'clicou' || !!rec.openedAt;
                  const isClicked = rec.status === 'clicou' || !!rec.clickedAt;

                  if (recipientFilter === 'opened' && !isOpened) return false;
                  if (recipientFilter === 'clicked' && !isClicked) return false;
                  if (recipientFilter === 'unopened' && isOpened) return false;

                  if (recipientSearch.trim()) {
                    const q = recipientSearch.toLowerCase();
                    const matchesName = rec.name.toLowerCase().includes(q);
                    const matchesEmail = (rec.email || '').toLowerCase().includes(q);
                    const matchesPhone = (rec.phone || '').toLowerCase().includes(q);
                    return matchesName || matchesEmail || matchesPhone;
                  }

                  return true;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Users className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p className="text-sm font-semibold text-slate-700">Nenhum contato encontrado com este filtro</p>
                      <p className="text-xs text-slate-400 mt-1">Tente ajustar a busca ou a aba de filtro acima.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filtered.map(rec => {
                      const hasOpened = rec.status === 'aberto' || rec.status === 'clicou' || !!rec.openedAt;
                      const hasClicked = rec.status === 'clicou' || !!rec.clickedAt;

                      return (
                        <div
                          key={rec.leadId}
                          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          {/* Lead Profile Info */}
                          <div className="flex items-center gap-3 min-w-[240px]">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                              {rec.name ? rec.name.charAt(0).toUpperCase() : 'L'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900 truncate">
                                  {rec.name}
                                </h4>
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                                  {rec.stage || 'Lead'}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 truncate mt-0.5 flex items-center gap-2">
                                <span>{rec.email || 'Sem e-mail'}</span>
                                {rec.phone && <span>• {rec.phone}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Channel Badge */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1.5 ${
                              rec.channel === 'whatsapp' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              rec.channel === 'sms' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                              'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}>
                              {rec.channel === 'whatsapp' && <Radio className="w-3 h-3" />}
                              {rec.channel === 'sms' && <MessageSquare className="w-3 h-3" />}
                              {rec.channel === 'email' && <Mail className="w-3 h-3" />}
                              <span>{rec.channel.toUpperCase()}</span>
                            </span>
                          </div>

                          {/* Engagement Status & Timestamps */}
                          <div className="grid grid-cols-2 gap-4 text-xs shrink-0 md:min-w-[320px]">
                            {/* Opened Status */}
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-semibold text-slate-500">Abertura:</span>
                                {hasOpened ? (
                                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded flex items-center gap-1">
                                    <Eye className="w-2.5 h-2.5" />
                                    <span>Abriu</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold text-slate-400">Não abriu</span>
                                )}
                              </div>
                              <div className="text-[11px] font-medium text-slate-800">
                                {rec.openedAt ? (
                                  <div className="flex items-center gap-1">
                                    {rec.device === 'mobile' ? <Smartphone className="w-3 h-3 text-slate-400" /> : <Monitor className="w-3 h-3 text-slate-400" />}
                                    <span>{new Date(rec.openedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">Pendente</span>
                                )}
                              </div>
                            </div>

                            {/* Clicked Status */}
                            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-semibold text-slate-500">Clique no Link:</span>
                                {hasClicked ? (
                                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded flex items-center gap-1">
                                    <MousePointerClick className="w-2.5 h-2.5" />
                                    <span>Clicou</span>
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-semibold text-slate-400">Sem clique</span>
                                )}
                              </div>
                              <div className="text-[11px] font-medium text-slate-800">
                                {rec.clickedAt ? (
                                  <div className="text-emerald-700 font-bold truncate">
                                    {new Date(rec.clickedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">Não clicou</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1.5 shrink-0 justify-end">
                            {/* Simulation buttons */}
                            {!hasOpened && (
                              <button
                                onClick={() => handleSimulateRecipientActivity(rec.leadId, 'open')}
                                className="text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 transition"
                                title="Simular que este contato abriu o e-mail/mensagem"
                              >
                                + Abertura
                              </button>
                            )}
                            {!hasClicked && (
                              <button
                                onClick={() => handleSimulateRecipientActivity(rec.leadId, 'click')}
                                className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg border border-emerald-200 transition"
                                title="Simular que este contato clicou no botão/link"
                              >
                                + Clique
                              </button>
                            )}

                            {rec.phone && (
                              <a
                                href={`https://wa.me/55${rec.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${rec.name}! Vi que você demonstrou interesse no nosso lançamento recente.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition border border-emerald-200"
                                title="Conversar no WhatsApp"
                              >
                                <Radio className="w-4 h-4" />
                              </a>
                            )}

                            {onNavigateToTab && (
                              <button
                                onClick={() => {
                                  setSelectedCampaignForRecipients(null);
                                  onNavigateToTab('crm');
                                }}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition border border-slate-200"
                                title="Abrir Histórico do Lead no CRM"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500">
                Os dados de abertura e cliques são salvos automaticamente no histórico individual de cada lead no CRM.
              </div>
              <button
                onClick={() => setSelectedCampaignForRecipients(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
              >
                Fechar Relatório
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
