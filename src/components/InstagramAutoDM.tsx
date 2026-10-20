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
  Info,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Smartphone,
  X
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
  simulateInstagramComment,
  fetchInstagramSettings,
  updateInstagramSettings,
  testInstagramToken
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';

interface InstagramAutoDMProps {
  currentCompany: Company | null;
  currentUser: User | null;
  onNavigateToTab?: (tab: string) => void;
  onFilterLeadsByRule?: (ruleOrQuery: string) => void;
}

export const InstagramAutoDM: React.FC<InstagramAutoDMProps> = ({
  currentCompany,
  currentUser,
  onNavigateToTab,
  onFilterLeadsByRule
}) => {
  const { alert, confirm } = useDialog();
  const companyId = currentCompany?.id || 'comp-alfa';

  const [activeTab, setActiveTab] = useState<'rules' | 'simulator' | 'logs' | 'webhook_setup'>('rules');
  const [automations, setAutomations] = useState<InstagramCommentAutomation[]>([]);
  const [logs, setLogs] = useState<InstagramCommentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');

  // Navigation & Logs Filter state
  const [logFilterRuleId, setLogFilterRuleId] = useState<string>('all');
  const [logFilterType, setLogFilterType] = useState<'all' | 'comments' | 'dms' | 'leads'>('all');
  const [logSearchQuery, setLogSearchQuery] = useState<string>('');

  const handleNavigateToComments = (ruleId?: string) => {
    setLogFilterRuleId(ruleId || 'all');
    setLogFilterType('comments');
    setActiveTab('logs');
  };

  const handleNavigateToDms = (ruleId?: string) => {
    setLogFilterRuleId(ruleId || 'all');
    setLogFilterType('dms');
    setActiveTab('logs');
  };

  const handleNavigateToLeadsCrm = (ruleOrQuery?: string) => {
    if (onFilterLeadsByRule) {
      onFilterLeadsByRule(ruleOrQuery || 'Instagram');
    } else if (onNavigateToTab) {
      onNavigateToTab('leads');
    }
  };

  const handleClearLogFilters = () => {
    setLogFilterRuleId('all');
    setLogFilterType('all');
    setLogSearchQuery('');
  };

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

  // Follow-Gate Form State
  const [formFollowGateEnabled, setFormFollowGateEnabled] = useState(false);
  const [formAskFollowMessage, setFormAskFollowMessage] = useState(
    'Olá {{username}}! 🎁 Para eu te liberar esse material exclusivo, você já segue o nosso perfil? Responda aqui com "SIM" ou "NÃO" 👇'
  );
  const [formNotFollowingMessage, setFormNotFollowingMessage] = useState(
    'Poxa, esse conteúdo é exclusivo para quem faz parte da nossa comunidade! ✨ Siga nosso perfil e depois me responda "SEGUI" aqui que te envio na hora!'
  );
  const [formVerifyFailMessage, setFormVerifyFailMessage] = useState(
    'Ops! O sistema Meta ainda não identificou o seu follow no perfil. Clica lá em "Seguir" e depois me manda "SEGUI" de novo! 😉'
  );
  const [formConfirmFollowMessage, setFormConfirmFollowMessage] = useState(
    'Oba, confirmado! Muito obrigado por nos seguir! 🎉 Aqui está o seu acesso exclusivo:'
  );
  const [formStrictMetaCheck, setFormStrictMetaCheck] = useState(true);

  // Related Post Cross-Promotion Form State
  const [formRelatedPostEnabled, setFormRelatedPostEnabled] = useState(false);
  const [formRelatedPostMessage, setFormRelatedPostMessage] = useState(
    'Já que você se interessou por esse tema, você vai adorar essa outra publicação complementar que postamos no feed:'
  );
  const [formRelatedPostUrl, setFormRelatedPostUrl] = useState('');
  const [formRelatedPostTitle, setFormRelatedPostTitle] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Simulator State
  const [simSelectedRuleId, setSimSelectedRuleId] = useState<string>('auto');
  const [simUsername, setSimUsername] = useState('@mariana.silva');
  const [simComment, setSimComment] = useState('Eu quero muito o ebook!');
  const [simPostTitle, setSimPostTitle] = useState('Post: Como dobrar vendas no WhatsApp');
  const [simIsFollower, setSimIsFollower] = useState(false);
  const [simFollowReplyInput, setSimFollowReplyInput] = useState('');
  const [simRunning, setSimRunning] = useState(false);
  const [simResult, setSimResult] = useState<InstagramSimulateResult | null>(null);
  const [simHistory, setSimHistory] = useState<Array<{
    sender: 'bot' | 'user';
    text: string;
    ctaButton?: { text: string; url: string };
    relatedPost?: { message: string; postUrl: string; postTitle?: string };
    auditStatus?: 'passed' | 'failed';
    timestamp: string;
  }>>([]);
  const [copiedToken, setCopiedToken] = useState(false);

  // Meta / Instagram Graph API Settings State
  const [metaAccessToken, setMetaAccessToken] = useState('');
  const [metaInstagramAccountId, setMetaInstagramAccountId] = useState('');
  const [metaPageId, setMetaPageId] = useState('');
  const [metaVerifyToken, setMetaVerifyToken] = useState('mdtracker_instagram_token');
  const [metaAutoReplyReal, setMetaAutoReplyReal] = useState(false);
  const [metaConnectedAccount, setMetaConnectedAccount] = useState('');
  const [metaStatus, setMetaStatus] = useState<'connected' | 'disconnected'>('disconnected');
  const [savingMetaSettings, setSavingMetaSettings] = useState(false);
  const [testingToken, setTestingToken] = useState(false);
  const [tokenTestFeedback, setTokenTestFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [autos, logsData, settingsData] = await Promise.all([
        fetchInstagramAutomations(companyId),
        fetchInstagramCommentLogs(companyId),
        fetchInstagramSettings(companyId).catch(() => ({} as any))
      ]);
      setAutomations(autos);
      setLogs(logsData);
      if (autos.length > 0) {
        const firstActive = autos.find(a => a.status === 'active') || autos[0];
        if (firstActive.keywords && firstActive.keywords.length > 0) {
          setSimComment(prev => (!prev || prev === 'Eu quero muito o ebook!' ? firstActive.keywords[0] : prev));
        }
      }
      if (settingsData) {
        setMetaAccessToken(settingsData.accessToken || '');
        setMetaInstagramAccountId(settingsData.instagramAccountId || '');
        setMetaPageId(settingsData.pageId || '');
        setMetaVerifyToken(settingsData.verifyToken || 'mdtracker_instagram_token');
        setMetaAutoReplyReal(settingsData.autoReplyReal || false);
        setMetaConnectedAccount(settingsData.connectedAccountName || '');
        setMetaStatus(settingsData.status === 'connected' ? 'connected' : (settingsData.accessToken ? 'connected' : 'disconnected'));
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados do Instagram:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  // Dynamic stats calculation (always in sync with real execution logs & rule.stats)
  const getRuleStats = (rule: InstagramCommentAutomation) => {
    const ruleLogs = logs.filter(l => 
      l.ruleId === rule.id || 
      (l.ruleName && l.ruleName.trim().toLowerCase() === rule.name.trim().toLowerCase())
    );
    const commentsCount = ruleLogs.length;
    const dmsCount = ruleLogs.filter(l => l.status === 'delivered').length;
    const leadsCount = ruleLogs.filter(l => Boolean(l.leadId)).length;

    return {
      commentsProcessed: Math.max(rule.stats?.commentsProcessed || 0, commentsCount),
      dmsSent: ruleLogs.length > 0 ? dmsCount : (rule.stats?.dmsSent || 0),
      leadsCaptured: Math.max(rule.stats?.leadsCaptured || 0, leadsCount)
    };
  };

  // Overall Stats
  const totalComments = automations.reduce((acc, a) => acc + getRuleStats(a).commentsProcessed, 0);
  const totalDms = automations.reduce((acc, a) => acc + getRuleStats(a).dmsSent, 0);
  const totalLeads = automations.reduce((acc, a) => acc + getRuleStats(a).leadsCaptured, 0);
  const activeCount = automations.filter(a => a.status === 'active').length;

  // Filtered Automations
  const filteredAutomations = automations.filter(a => {
    const matchesQuery = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  // Filtered Logs for Tab 3
  const selectedLogRule = automations.find(a => a.id === logFilterRuleId);
  const filteredLogs = logs.filter(log => {
    // 1. Rule filter
    if (logFilterRuleId !== 'all') {
      const matchId = log.ruleId === logFilterRuleId;
      const matchName = selectedLogRule && log.ruleName && log.ruleName.trim().toLowerCase() === selectedLogRule.name.trim().toLowerCase();
      if (!matchId && !matchName) return false;
    }

    // 2. Type filter
    if (logFilterType === 'dms') {
      if (log.status !== 'delivered' && !log.dmSentText) return false;
    } else if (logFilterType === 'leads') {
      if (!log.leadId) return false;
    }

    // 3. Search query
    if (logSearchQuery.trim()) {
      const q = logSearchQuery.toLowerCase();
      const matchesUser = (log.instagramUsername || '').toLowerCase().includes(q);
      const matchesComment = (log.commentText || '').toLowerCase().includes(q);
      const matchesRule = (log.ruleName || '').toLowerCase().includes(q);
      const matchesReply = (log.publicReplyGiven || '').toLowerCase().includes(q);
      const matchesDm = (log.dmSentText || '').toLowerCase().includes(q);
      if (!matchesUser && !matchesComment && !matchesRule && !matchesReply && !matchesDm) return false;
    }

    return true;
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
    setFormDirectMessage('Olá {{username}}! 🎉 Conforme você pediu no nosso post, aqui está o seu acesso exclusivo. Clique no link abaixo para acessar agora:');
    setFormCtaText('Acessar Conteúdo Grátis 🔗');
    setFormCtaUrl('https://mdtracker.app/r/oferta-vip');
    setFormCreateLead(true);

    // Follow-Gate defaults
    setFormFollowGateEnabled(true);
    setFormAskFollowMessage('Olá {{username}}! 🎁 Para eu te liberar esse material exclusivo, você já segue o nosso perfil? Responda aqui com "SIM" ou "NÃO" 👇');
    setFormNotFollowingMessage('Poxa, esse conteúdo é exclusivo para quem faz parte da nossa comunidade! ✨ Siga nosso perfil e depois me responda "SEGUI" aqui que te envio na hora!');
    setFormVerifyFailMessage('Ops! O sistema Meta ainda não identificou o seu follow no perfil. Clica lá em "Seguir" e depois me manda "SEGUI" de novo! 😉');
    setFormConfirmFollowMessage('Oba, confirmado! Muito obrigado por nos seguir! 🎉 Aqui está o seu acesso exclusivo:');
    setFormStrictMetaCheck(true);

    // Related Post defaults
    setFormRelatedPostEnabled(false);
    setFormRelatedPostMessage('Já que você se interessou por esse tema, você vai adorar essa outra publicação complementar que postamos no feed:');
    setFormRelatedPostUrl('');
    setFormRelatedPostTitle('');

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

    // Follow-Gate
    setFormFollowGateEnabled(Boolean(rule.followGateEnabled));
    setFormAskFollowMessage(rule.followGateConfig?.askFollowMessage || 'Olá {{username}}! 🎁 Para eu te liberar esse material exclusivo, você já segue o nosso perfil? Responda aqui com "SIM" ou "NÃO" 👇');
    setFormNotFollowingMessage(rule.followGateConfig?.notFollowingMessage || 'Poxa, esse conteúdo é exclusivo para quem faz parte da nossa comunidade! ✨ Siga nosso perfil e depois me responda "SEGUI" aqui que te envio na hora!');
    setFormVerifyFailMessage(rule.followGateConfig?.verifyFailMessage || 'Ops! O sistema Meta ainda não identificou o seu follow no perfil. Clica lá em "Seguir" e depois me manda "SEGUI" de novo! 😉');
    setFormConfirmFollowMessage(rule.followGateConfig?.confirmFollowMessage || 'Oba, confirmado! Muito obrigado por nos seguir! 🎉 Aqui está o seu acesso exclusivo:');
    setFormStrictMetaCheck(rule.followGateConfig?.strictMetaCheck !== false);

    // Related Post
    setFormRelatedPostEnabled(Boolean(rule.relatedPostPromotion?.enabled));
    setFormRelatedPostMessage(rule.relatedPostPromotion?.message || 'Já que você se interessou por esse tema, você vai adorar essa outra publicação complementar que postamos no feed:');
    setFormRelatedPostUrl(rule.relatedPostPromotion?.postUrl || '');
    setFormRelatedPostTitle(rule.relatedPostPromotion?.postTitle || '');

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
        createLeadInCrm: formCreateLead,
        followGateEnabled: formFollowGateEnabled,
        followGateConfig: formFollowGateEnabled ? {
          askFollowMessage: formAskFollowMessage.trim(),
          notFollowingMessage: formNotFollowingMessage.trim(),
          verifyFailMessage: formVerifyFailMessage.trim(),
          confirmFollowMessage: formConfirmFollowMessage.trim(),
          strictMetaCheck: formStrictMetaCheck
        } : undefined,
        relatedPostPromotion: formRelatedPostEnabled ? {
          enabled: true,
          message: formRelatedPostMessage.trim(),
          postUrl: formRelatedPostUrl.trim(),
          postTitle: formRelatedPostTitle.trim()
        } : { enabled: false, message: '', postUrl: '' }
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

  // Run Simulator (Multi-Stage ManyChat Flow)
  const handleRunSimulator = async (followReplyText?: string, forceFollowStatus?: boolean) => {
    if (!simComment.trim()) {
      alert('Digite um comentário para simular.', 'warning');
      return;
    }

    setSimRunning(true);
    try {
      const activeFollowStatus = forceFollowStatus !== undefined ? forceFollowStatus : simIsFollower;
      if (forceFollowStatus !== undefined) {
        setSimIsFollower(forceFollowStatus);
      }

      const res = await simulateInstagramComment({
        companyId,
        ruleId: simSelectedRuleId !== 'auto' ? simSelectedRuleId : undefined,
        instagramUsername: simUsername,
        commentText: simComment,
        postTitle: simPostTitle,
        isFollowerSimulated: activeFollowStatus,
        simulatedFollowReply: followReplyText || ''
      });

      setSimResult(res);

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (!followReplyText) {
        // Primeira rodada: comentário no post disparado
        setSimHistory([
          {
            sender: 'bot',
            text: res.dmSentText || '',
            ctaButton: res.ctaButton,
            relatedPost: res.relatedPostSent,
            timestamp: nowTime
          }
        ]);
      } else {
        // Continuação da conversa no Direct
        setSimHistory(prev => [
          ...prev,
          {
            sender: 'user',
            text: followReplyText,
            timestamp: nowTime
          },
          {
            sender: 'bot',
            text: res.dmSentText || '',
            ctaButton: res.ctaButton,
            relatedPost: res.relatedPostSent,
            auditStatus: res.followGateStage === 'verify_failed' ? 'failed' : res.followGateStage === 'verified_unlocked' ? 'passed' : undefined,
            timestamp: nowTime
          }
        ]);
      }

      // Reload logs and automations in background
      fetchInstagramCommentLogs(companyId).then(setLogs);
      fetchInstagramAutomations(companyId).then(setAutomations);
    } catch (err: any) {
      alert(err.message || 'Erro na simulação', 'error');
    } finally {
      setSimRunning(false);
      setSimFollowReplyInput('');
    }
  };

  const handleResetSimulator = () => {
    setSimResult(null);
    setSimHistory([]);
    setSimFollowReplyInput('');
  };

  const handleCopyWebhookUrl = () => {
    const url = `${window.location.origin}/api/webhooks/instagram`;
    navigator.clipboard.writeText(url);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  };

  const handleSaveMetaSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingMetaSettings(true);
    setTokenTestFeedback(null);
    try {
      await updateInstagramSettings(companyId, {
        accessToken: metaAccessToken.trim(),
        instagramAccountId: metaInstagramAccountId.trim(),
        pageId: metaPageId.trim(),
        verifyToken: metaVerifyToken.trim() || 'mdtracker_instagram_token',
        autoReplyReal: metaAutoReplyReal,
        connectedAccountName: metaConnectedAccount,
        status: metaStatus
      });
      alert('Configurações e Token do Instagram salvos com sucesso!', 'success');
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar credenciais da Meta', 'error');
    } finally {
      setSavingMetaSettings(false);
    }
  };

  const handleTestMetaToken = async () => {
    if (!metaAccessToken.trim()) {
      alert('Insira o Token de Acesso da Meta antes de testar.', 'warning');
      return;
    }

    setTestingToken(true);
    setTokenTestFeedback(null);
    try {
      const result = await testInstagramToken(metaAccessToken.trim(), metaInstagramAccountId.trim() || undefined);
      const accName = result.accountName || 'Conta Comercial Validada';
      setMetaConnectedAccount(accName);

      const newPageId = result.pageId || metaPageId;
      const newInstaId = result.instagramAccountId || metaInstagramAccountId;
      if (result.pageId) setMetaPageId(result.pageId);
      if (result.instagramAccountId) setMetaInstagramAccountId(result.instagramAccountId);

      setMetaStatus('connected');
      const scopesText = result.scopes && result.scopes.length > 0 ? ` (Permissões: ${result.scopes.join(', ')})` : '';
      setTokenTestFeedback({
        success: true,
        message: `Token validado com sucesso! Conectado a: ${accName}${scopesText}`
      });
      await updateInstagramSettings(companyId, {
        accessToken: metaAccessToken.trim(),
        instagramAccountId: newInstaId.trim(),
        pageId: newPageId.trim(),
        verifyToken: metaVerifyToken.trim(),
        autoReplyReal: metaAutoReplyReal,
        connectedAccountName: accName,
        status: 'connected'
      });
    } catch (err: any) {
      setMetaStatus('disconnected');
      setTokenTestFeedback({
        success: false,
        message: err.message || 'Token inválido ou sem permissões da Meta.'
      });
    } finally {
      setTestingToken(false);
    }
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

        {/* 4 KPI METRICS BAR WITH INTERACTIVE LINKS */}
        <div className="mt-6 pt-5 border-t border-purple-800/60 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          <button
            type="button"
            onClick={() => { setActiveTab('rules'); setStatusFilter('active'); }}
            className="bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 hover:border-pink-500/50 rounded-xl p-3 flex items-center gap-3 transition-all cursor-pointer text-left group"
            title="Clique para filtrar apenas regras ativas"
          >
            <div className="w-9 h-9 rounded-lg bg-pink-500/20 text-pink-400 group-hover:scale-105 transition flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-purple-300 uppercase font-bold tracking-wider">Regras Ativas</p>
              <p className="text-lg font-black text-white">{activeCount} <span className="text-xs font-normal text-purple-300">/ {automations.length}</span></p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleNavigateToComments()}
            className="bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 hover:border-amber-500/50 rounded-xl p-3 flex items-center gap-3 transition-all cursor-pointer text-left group"
            title="Clique para ver os comentários no Histórico de Execuções"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 group-hover:scale-105 transition flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] text-purple-300 group-hover:text-amber-300 uppercase font-bold tracking-wider">
                <span>Comentários</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition" />
              </div>
              <p className="text-lg font-black text-white">{totalComments}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleNavigateToDms()}
            className="bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 hover:border-emerald-500/50 rounded-xl p-3 flex items-center gap-3 transition-all cursor-pointer text-left group"
            title="Clique para ver as DMs enviadas no Histórico de Execuções"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-105 transition flex items-center justify-center shrink-0">
              <Send className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] text-purple-300 group-hover:text-emerald-300 uppercase font-bold tracking-wider">
                <span>DMs Enviadas</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition" />
              </div>
              <p className="text-lg font-black text-white">{totalDms}</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleNavigateToLeadsCrm('Instagram')}
            className="bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/50 hover:border-blue-500/50 rounded-xl p-3 flex items-center gap-3 transition-all cursor-pointer text-left group"
            title="Clique para abrir e filtrar os Leads gerados no CRM"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-105 transition flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[10px] text-purple-300 group-hover:text-blue-300 uppercase font-bold tracking-wider">
                <span>Leads no CRM</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100 transition" />
              </div>
              <p className="text-lg font-black text-white">{totalLeads}</p>
            </div>
          </button>

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
          {logFilterRuleId !== 'all' && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Filtro de regra ativo"></span>
          )}
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

                      {rule.followGateEnabled ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-600" /> Portão de Seguidor (Exige Follow)
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                          <Unlock className="w-3 h-3 text-slate-500" /> Aberto p/ Não Seguidores
                        </span>
                      )}

                      {rule.relatedPostPromotion?.enabled && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3 text-cyan-600" /> Post Relacionado
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

                {/* Stats Bar with Interactive Redirect Links */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  {/* Comentários */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateToComments(rule.id);
                    }}
                    title={`Ver comentários processados desta automação (${rule.name})`}
                    className="group bg-slate-50 hover:bg-purple-50/90 p-2 rounded-xl border border-slate-200 hover:border-purple-300 transition-all text-center flex flex-col items-center justify-center cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 group-hover:text-purple-700 font-bold mb-0.5">
                      <MessageSquare className="w-3 h-3 text-slate-400 group-hover:text-purple-600 transition" />
                      <span>Comentários</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-purple-600 transition" />
                    </div>
                    <span className="text-sm font-black text-slate-900 group-hover:text-purple-900">
                      {getRuleStats(rule).commentsProcessed}
                    </span>
                    <span className="text-[9px] text-purple-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver logs ↗
                    </span>
                  </button>

                  {/* DMs Entregues */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateToDms(rule.id);
                    }}
                    title={`Ver DMs entregues desta automação (${rule.name})`}
                    className="group bg-slate-50 hover:bg-purple-50/90 p-2 rounded-xl border border-slate-200 hover:border-purple-300 transition-all text-center flex flex-col items-center justify-center cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 group-hover:text-purple-700 font-bold mb-0.5">
                      <Send className="w-3 h-3 text-purple-400 group-hover:text-purple-600 transition" />
                      <span>DMs Entregues</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-purple-600 transition" />
                    </div>
                    <span className="text-sm font-black text-purple-700 group-hover:text-purple-900">
                      {getRuleStats(rule).dmsSent}
                    </span>
                    <span className="text-[9px] text-purple-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver DMs ↗
                    </span>
                  </button>

                  {/* Leads CRM */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigateToLeadsCrm(rule.name);
                    }}
                    title={`Abrir e filtrar os Leads desta automação no CRM (${rule.name})`}
                    className="group bg-slate-50 hover:bg-emerald-50/90 p-2 rounded-xl border border-slate-200 hover:border-emerald-300 transition-all text-center flex flex-col items-center justify-center cursor-pointer shadow-2xs hover:shadow-xs"
                  >
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 group-hover:text-emerald-700 font-bold mb-0.5">
                      <Users className="w-3 h-3 text-emerald-500 group-hover:text-emerald-600 transition" />
                      <span>Leads CRM</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-emerald-600 transition" />
                    </div>
                    <span className="text-sm font-black text-emerald-700 group-hover:text-emerald-900">
                      {getRuleStats(rule).leadsCaptured}
                    </span>
                    <span className="text-[9px] text-emerald-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Abrir CRM ↗
                    </span>
                  </button>
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
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Fluxo Interativo Multi-Turno</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simule o comentário no feed, a pergunta do Portão de Seguidor (Follow-Gate), a checagem real na Meta Graph API e a entrega do CTA + Post Relacionado.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {simHistory.length > 0 && (
                  <button
                    onClick={handleResetSimulator}
                    className="border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-2.5 rounded-xl transition flex items-center gap-1.5"
                    title="Reiniciar Simulação"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reiniciar</span>
                  </button>
                )}

                <button
                  onClick={() => handleRunSimulator()}
                  disabled={simRunning}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {simRunning ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processando no ManyChat...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{simHistory.length > 0 ? 'Disparar Novo Comentário' : 'Disparar Simulação ManyChat'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
              
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Regra de Automação a Testar:
                </label>
                <select
                  value={simSelectedRuleId}
                  onChange={e => {
                    const rId = e.target.value;
                    setSimSelectedRuleId(rId);
                    if (rId !== 'auto') {
                      const sel = automations.find(a => a.id === rId);
                      if (sel?.keywords && sel.keywords.length > 0) {
                        setSimComment(sel.keywords[0]);
                      }
                    }
                  }}
                  className="w-full border border-slate-200 rounded-lg p-2 bg-slate-50 font-medium focus:outline-none focus:border-purple-500"
                >
                  <option value="auto">✨ Auto-Detectar por Palavra-Chave</option>
                  {automations.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} {a.followGateEnabled ? '🛡️ (Follow-Gate)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Usuário do Seguidor (@username):
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

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                  <span>Seguidor Ativo no Perfil?</span>
                  <span className={simIsFollower ? 'text-emerald-700 font-extrabold text-[10px]' : 'text-amber-700 font-extrabold text-[10px]'}>
                    {simIsFollower ? '✓ Segue' : '✗ Não Segue'}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setSimIsFollower(!simIsFollower)}
                  className={`w-full border rounded-lg p-2 font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    simIsFollower
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                  }`}
                  title="Alterne para testar se a checagem da Meta bloqueia quem finge que segue ou libera quem realmente segue"
                >
                  {simIsFollower ? (
                    <>
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Simular: Já Segue</span>
                    </>
                  ) : (
                    <>
                      <UserX className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Simular: Não Segue</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Quick Keyword Pill Prompts */}
            <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
              <span className="text-[11px] text-slate-500 font-semibold">Testar rapidamente (gatilhos cadastrados):</span>
              {(() => {
                const activeKeywords: string[] = Array.from(new Set(
                  automations.filter(a => a.status === 'active').flatMap(a => a.keywords || [])
                ));
                const listToDisplay = activeKeywords.length > 0 ? activeKeywords : ['power up', 'powerup', 'produtos', 'serviços'];
                return listToDisplay.slice(0, 8).map((kw, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setSimComment(kw);
                      // Auto-select rule if keyword matches
                      const matchingRule = automations.find(a => (a.keywords || []).some(k => k.toLowerCase() === kw.toLowerCase()));
                      if (matchingRule) setSimSelectedRuleId(matchingRule.id);
                    }}
                    className="text-[11px] bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold px-2.5 py-1 rounded-lg border border-purple-200 transition flex items-center gap-1 shadow-2xs hover:scale-105"
                  >
                    <span>⚡</span>
                    <span>"{kw}"</span>
                  </button>
                ));
              })()}
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
                {simRunning ? (
                  <div className="ml-6 pl-3 border-l-2 border-purple-400 space-y-1 animate-pulse">
                    <div className="bg-purple-50/60 border border-purple-200 p-2.5 rounded-xl flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-purple-700 font-bold">Publicando resposta pública automática no post...</span>
                    </div>
                  </div>
                ) : simResult?.matched ? (
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
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-white flex flex-col min-h-[540px]">
              
              {/* Direct Header */}
              <div className="bg-slate-950/90 border-b border-slate-800 p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 p-0.5">
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs text-white">
                      MD
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      mdtracker_oficial
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    </h4>
                    <p className="text-[10px] text-slate-400">Instagram Direct • Online</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {simResult?.followGateTriggered ? (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Follow-Gate
                    </span>
                  ) : (
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded-full font-bold">
                      Auto-DM Direct
                    </span>
                  )}
                </div>
              </div>

              {/* Direct Messages Body */}
              <div className="p-4 flex-1 space-y-3.5 overflow-y-auto bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col justify-end">
                
                <div className="text-center my-1">
                  <span className="text-[10px] text-slate-500 font-mono">Hoje às {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

                {/* Direct Messages Stream */}
                {simRunning ? (
                  <div className="py-14 flex flex-col items-center justify-center space-y-3">
                    <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs font-bold text-purple-300 animate-pulse">Entregando mensagem privada no Direct... 🚀</span>
                  </div>
                ) : simHistory.length > 0 ? (
                  <div className="space-y-3">
                    {simHistory.map((item, idx) => (
                      <div key={idx} className="space-y-2 animate-in fade-in duration-300">
                        
                        {/* Audit status pill if applicable */}
                        {item.auditStatus === 'failed' && (
                          <div className="flex justify-center my-1">
                            <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                              <UserX className="w-3.5 h-3.5 text-red-400" />
                              <span>Meta Graph API: is_user_follow_business = false (Follow Não Confirmado)</span>
                            </span>
                          </div>
                        )}

                        {item.auditStatus === 'passed' && (
                          <div className="flex justify-center my-1">
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shadow-sm">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Meta Graph API: is_user_follow_business = true (Seguidor Verificado com Sucesso!)</span>
                            </span>
                          </div>
                        )}

                        {/* User Message Bubble */}
                        {item.sender === 'user' ? (
                          <div className="flex justify-end">
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-2xl rounded-br-xs text-xs font-semibold shadow-md max-w-[80%]">
                              {item.text}
                            </div>
                          </div>
                        ) : (
                          /* Bot Message Bubble */
                          <div className="space-y-2 max-w-[88%]">
                            <div className="bg-slate-800 text-slate-100 p-3.5 rounded-2xl rounded-bl-xs text-xs leading-relaxed border border-slate-700/80 shadow-md whitespace-pre-line">
                              {item.text}
                            </div>

                            {/* CTA Link Button Card */}
                            {item.ctaButton && (
                              <a
                                href={item.ctaButton.url}
                                target="_blank"
                                rel="noreferrer"
                                className="block bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-center font-extrabold text-xs py-2.5 px-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 border border-purple-400/30"
                              >
                                <span>{item.ctaButton.text}</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Related Post Recommendation Card */}
                            {item.relatedPost && (
                              <div className="bg-gradient-to-br from-slate-800/90 to-purple-950/70 border border-purple-400/30 p-3 rounded-xl space-y-2 text-xs shadow-md">
                                <div className="flex items-center gap-1.5 text-pink-300 font-extrabold text-[11px]">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                                  <span>Publicação Relacionada Recomendada</span>
                                </div>
                                <p className="text-slate-200 text-[11px] leading-relaxed">
                                  {item.relatedPost.message}
                                </p>
                                <a
                                  href={item.relatedPost.postUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-white/10 hover:bg-white/15 border border-white/20 p-2.5 rounded-lg flex items-center justify-between text-white font-medium transition"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <Instagram className="w-4 h-4 text-pink-400 shrink-0" />
                                    <span className="text-[11px] font-bold truncate">
                                      {item.relatedPost.postTitle || 'Ver publicação complementar no Instagram'}
                                    </span>
                                  </div>
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                                </a>
                              </div>
                            )}

                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                ) : simResult && !simResult.matched ? (
                  <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-4 text-amber-200 text-xs space-y-2.5 animate-in fade-in">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Nenhum Direct disparado</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      O comentário <strong>"{simComment}"</strong> não ativou nenhuma regra porque não continha as palavras-chave cadastradas (ex: <em>"quero"</em>, <em>"cupom"</em>, <em>"ebook"</em>).
                    </p>
                    <div className="pt-1 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => { setSimComment('Eu quero o ebook'); }}
                        className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/40 px-2.5 py-1 rounded-lg text-[10px] font-bold transition"
                      >
                        Testar com "Eu quero o ebook"
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    <p>Clique em <strong>"Disparar Simulação ManyChat"</strong> para iniciar o teste.</p>
                  </div>
                )}

              </div>

              {/* DIRECT INTERACTIVE ACTION BAR (ManyChat Quick Reply Simulator) */}
              {simResult?.followGateTriggered && simResult.followGateStage === 'ask_follow' && (
                <div className="bg-slate-950/95 border-t border-slate-800 p-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Escolha como o seguidor responde no Direct:
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRunSimulator('NÃO', false)}
                      disabled={simRunning}
                      className="bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 p-2.5 rounded-xl text-left transition text-[11px] font-bold"
                    >
                      <span className="block text-red-400 text-[9px] font-extrabold uppercase tracking-wide">Cenário 1</span>
                      ❌ Responder "NÃO"
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRunSimulator('SIM, já sigo', false)}
                      disabled={simRunning}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 p-2.5 rounded-xl text-left transition text-[11px] font-bold"
                    >
                      <span className="block text-amber-400 text-[9px] font-extrabold uppercase tracking-wide">Cenário 2 (Auditoria Meta)</span>
                      ⚠️ Responder "SIM" (Sem Seguir)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRunSimulator('SIM, já sigo', true)}
                      disabled={simRunning}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 p-2.5 rounded-xl text-left transition text-[11px] font-bold"
                    >
                      <span className="block text-emerald-400 text-[9px] font-extrabold uppercase tracking-wide">Cenário 3 (Desbloqueio)</span>
                      ✨ Seguir Perfil + Responder "SIM"
                    </button>
                  </div>
                </div>
              )}

              {simResult?.followGateTriggered && simResult.followGateStage === 'not_following' && (
                <div className="bg-slate-950/95 border-t border-slate-800 p-3 space-y-2">
                  <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                    <span>O seguidor disse que NÃO segue. O que ele faz agora?</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRunSimulator('SEGUI', false)}
                      disabled={simRunning}
                      className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 p-2.5 rounded-xl text-left transition text-[11px] font-bold"
                    >
                      <span className="block text-amber-400 text-[9px] uppercase tracking-wide font-extrabold">Tentativa sem seguir</span>
                      Responder "SEGUI" (Mas ainda não seguiu)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRunSimulator('SEGUI', true)}
                      disabled={simRunning}
                      className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 p-2.5 rounded-xl text-left transition text-[11px] font-bold"
                    >
                      <span className="block text-emerald-400 text-[9px] uppercase tracking-wide font-extrabold">Ação confirmada</span>
                      ✨ Clicar em Seguir @mudadigital + "SEGUI"
                    </button>
                  </div>
                </div>
              )}

              {simResult?.followGateTriggered && simResult.followGateStage === 'verify_failed' && (
                <div className="bg-slate-950/95 border-t border-slate-800 p-3 space-y-2">
                  <div className="text-[11px] font-bold text-red-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    <span>A auditoria Meta Graph API barrou porque o perfil NÃO segue a conta!</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRunSimulator('SEGUI', true)}
                    disabled={simRunning}
                    className="w-full bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-200 border border-emerald-500/40 p-2.5 rounded-xl text-center transition text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>Seguir o perfil de verdade e responder "SEGUI" (Desbloquear!)</span>
                  </button>
                </div>
              )}

              {/* Direct Bottom Status for CRM Lead */}
              {simResult?.lead && (
                <div className="p-3 bg-emerald-950/50 border-t border-emerald-900/40 flex items-center justify-between text-xs text-emerald-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Lead Gerado no CRM: {simResult.lead.name} {simResult.followGateTriggered && '(+15 pts Follow-Gate)'}
                  </span>
                  {onNavigateToTab && (
                    <button
                      onClick={() => onNavigateToTab('leads')}
                      className="text-[11px] underline font-bold hover:text-emerald-200"
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="font-extrabold text-slate-900 text-sm">Histórico de Respostas e DMs Disparadas</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Comentários processados, DMs entregues e leads enviados ao CRM pelo motor ManyChat.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {(logFilterRuleId !== 'all' || logFilterType !== 'all' || logSearchQuery.trim() !== '') && (
                <button
                  onClick={handleClearLogFilters}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  <X className="w-3.5 h-3.5" /> Limpar Filtros
                </button>
              )}
              <button
                onClick={loadData}
                className="text-xs text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center gap-1 font-bold px-3 py-1.5 rounded-lg transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Atualizar
              </button>
            </div>
          </div>

          {/* Active Filter Notification Banner */}
          {(logFilterRuleId !== 'all' || logFilterType !== 'all') && (
            <div className="bg-purple-50/70 border border-purple-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-purple-600" /> Filtro Ativo:
                </span>
                {logFilterRuleId !== 'all' && (
                  <span className="bg-white border border-purple-300 text-purple-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    Regra: {selectedLogRule?.name || logFilterRuleId}
                    <button 
                      onClick={() => setLogFilterRuleId('all')} 
                      className="hover:text-red-600 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {logFilterType !== 'all' && (
                  <span className="bg-white border border-purple-300 text-purple-800 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    Tipo: {logFilterType === 'dms' ? 'DMs Entregues' : logFilterType === 'comments' ? 'Comentários' : 'Leads CRM'}
                    <button 
                      onClick={() => setLogFilterType('all')} 
                      className="hover:text-red-600 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
              <button
                onClick={handleClearLogFilters}
                className="text-purple-700 hover:text-purple-900 font-bold text-[11px] underline"
              >
                Ver todos os registros ({logs.length})
              </button>
            </div>
          )}

          {/* Controls: Search & Sub-filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={logSearchQuery}
                onChange={e => setLogSearchQuery(e.target.value)}
                placeholder="Buscar por @usuário, comentário ou DM..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {/* Rule selector dropdown */}
              <select
                value={logFilterRuleId}
                onChange={e => setLogFilterRuleId(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white font-medium focus:outline-none cursor-pointer max-w-[200px] truncate"
              >
                <option value="all">Todas as Regras ({logs.length})</option>
                {automations.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>

              {/* Type Filter Buttons */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0 text-[11px]">
                <button
                  onClick={() => setLogFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition ${
                    logFilterType === 'all'
                      ? 'bg-white text-purple-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setLogFilterType('comments')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                    logFilterType === 'comments'
                      ? 'bg-white text-purple-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3 h-3 text-amber-500" /> Comentários
                </button>
                <button
                  onClick={() => setLogFilterType('dms')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                    logFilterType === 'dms'
                      ? 'bg-white text-purple-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Send className="w-3 h-3 text-purple-500" /> DMs
                </button>
                <button
                  onClick={() => setLogFilterType('leads')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 ${
                    logFilterType === 'leads'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3 h-3 text-emerald-500" /> Leads CRM
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-100 rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-slate-600 font-bold">
                  <th className="p-3">Data / Hora</th>
                  <th className="p-3">Seguidor</th>
                  <th className="p-3">Regra Disparada</th>
                  <th className="p-3">Comentário Feito</th>
                  <th className="p-3">Resposta & DM Enviada</th>
                  <th className="p-3 text-center">Ações / CRM</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </td>
                    <td className="p-3 font-mono font-bold text-purple-700 whitespace-nowrap">
                      <span className="bg-purple-50 text-purple-700 border border-purple-200/60 px-2 py-0.5 rounded-md">
                        {log.instagramUsername}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-slate-800">
                      <button
                        onClick={() => setLogFilterRuleId(log.ruleId || 'all')}
                        className="hover:text-purple-600 text-left transition font-semibold"
                        title="Filtrar por esta regra"
                      >
                        {log.ruleName}
                      </button>
                    </td>
                    <td className="p-3 text-slate-700 font-medium max-w-xs">
                      <span className="italic bg-slate-50 px-2 py-1 rounded border border-slate-200/60 block">
                        "{log.commentText}"
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 text-[11px] max-w-md">
                      {log.publicReplyGiven && (
                        <div className="mb-1 flex items-start gap-1">
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded shrink-0">Pública</span>
                          <span className="truncate" title={log.publicReplyGiven}>{log.publicReplyGiven}</span>
                        </div>
                      )}
                      {log.dmSentText && (
                        <div className="flex items-start gap-1 text-slate-700">
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded shrink-0">Direct</span>
                          <span className="truncate" title={log.dmSentText}>{log.dmSentText}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleNavigateToLeadsCrm(log.instagramUsername)}
                        title={`Abrir ${log.instagramUsername} no CRM`}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1 rounded-lg font-bold text-[11px] inline-flex items-center gap-1 transition shadow-2xs hover:shadow-xs"
                      >
                        <Users className="w-3 h-3 text-emerald-600" />
                        <span>Ver no CRM</span>
                        <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                      </button>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {log.status === 'failed' ? (
                        <div className="space-y-0.5">
                          <span 
                            title={log.errorMessage || 'Falha de entrega na Meta Graph API'}
                            className="bg-red-50 text-red-700 border border-red-200 font-extrabold text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 cursor-help shadow-2xs"
                          >
                            <AlertCircle className="w-3 h-3 text-red-600" /> Falhou na Meta
                          </span>
                          {log.errorMessage && (
                            <p className="text-[10px] text-red-600 max-w-[200px] truncate" title={log.errorMessage}>
                              {log.errorMessage}
                            </p>
                          )}
                        </div>
                      ) : log.status === 'ignored_keyword' ? (
                        <span className="bg-slate-100 text-slate-600 border border-slate-200 font-bold text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          Ignorado
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-extrabold text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Entregue
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center space-y-2">
                      <p className="text-slate-500 font-medium">Nenhum histórico encontrado para os filtros atuais.</p>
                      <button
                        onClick={handleClearLogFilters}
                        className="text-xs text-purple-600 font-bold hover:underline"
                      >
                        Limpar filtros para ver todos os registros
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: META / INSTAGRAM GRAPH API WEBHOOK & TOKEN SETUP */}
      {activeTab === 'webhook_setup' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6 max-w-4xl">
          
          {/* Header & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-600" />
                <span>Configuração de Conexão com o Instagram Oficial (Meta Graph API)</span>
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Configure aqui o Token de Acesso da Meta para responder seguidores reais no feed e enviar Directs diretamente pela sua conta oficial.
              </p>
            </div>

            <div>
              {metaStatus === 'connected' ? (
                <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Conectado: {metaConnectedAccount || 'Conta Ativa'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                  <span>Token Não Conectado</span>
                </div>
              )}
            </div>
          </div>

          {/* Form: Meta Credentials */}
          <form onSubmit={handleSaveMetaSettings} className="space-y-5 text-xs">
            
            <div className="bg-purple-50/60 border border-purple-200/80 rounded-2xl p-5 space-y-4">
              <span className="font-extrabold text-purple-950 block text-xs flex items-center gap-1.5">
                <Instagram className="w-4 h-4 text-purple-600" />
                Credenciais e Token da Meta (Instagram for Business)
              </span>

              {/* Access Token */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Token de Acesso da Meta (Page Access Token) *</label>
                  <a 
                    href="https://developers.facebook.com/tools/explorer/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[11px] text-purple-600 hover:text-purple-800 font-bold flex items-center gap-1"
                  >
                    Abrir Graph API Explorer <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={metaAccessToken}
                  onChange={e => setMetaAccessToken(e.target.value)}
                  placeholder="EAAG... Cole aqui o seu Token de Acesso permanente ou de longa duração gerado na Meta"
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-mono text-xs text-slate-800 focus:outline-none focus:border-purple-600 shadow-2xs"
                />
                <p className="text-[10px] text-slate-500">
                  Necessário possuir as permissões: <code className="bg-slate-200 px-1 py-0.5 rounded text-purple-900 font-bold">instagram_manage_comments</code> e <code className="bg-slate-200 px-1 py-0.5 rounded text-purple-900 font-bold">instagram_manage_messages</code>.
                </p>

                {/* Warning & Instructions Box */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-amber-900 font-bold">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Atenção: Não use o Token do Pixel / Gerenciador de Eventos (CAPI)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed pl-6">
                    O token gerado no <em>Gerenciador de Eventos</em> serve apenas para rastrear anúncios e tem permissão exclusiva <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-bold">read_ads_dataset_quality</code>. 
                    Ele <strong>não consegue enviar Directs</strong>. Para automações no Instagram, gere o Token no <strong>Meta for Developers &gt; Graph API Explorer</strong> vinculado à Página com as permissões <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-bold">instagram_manage_messages</code> e <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-bold">instagram_manage_comments</code>.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-blue-900 font-bold">
                    <Smartphone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>Configuração Obrigatória no Aplicativo do Celular (Instagram)</span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed pl-6">
                    No seu celular, abra o perfil do Instagram comercial &gt; Menu <strong>☰</strong> &gt; <strong>Configurações e privacidade</strong> &gt; <strong>Mensagens e respostas a stories</strong> &gt; <strong>Controles de mensagens</strong> &gt; Ative a chave <strong>"Permitir acesso às mensagens"</strong>. Sem isso, o Instagram rejeita a entrega de mensagens automatizadas no celular.
                  </p>
                </div>
              </div>

              {/* Two Column IDs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">ID da Conta Comercial do Instagram (Opcional):</label>
                  <input
                    type="text"
                    value={metaInstagramAccountId}
                    onChange={e => setMetaInstagramAccountId(e.target.value)}
                    placeholder="Ex: 17841400000000000"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                  <p className="text-[10px] text-slate-400">ID retornado em /me/accounts ou configurações do Instagram.</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">ID da Página do Facebook Vinculada (Opcional):</label>
                  <input
                    type="text"
                    value={metaPageId}
                    onChange={e => setMetaPageId(e.target.value)}
                    placeholder="Ex: 104928472938472"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 font-mono text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                  />
                  <p className="text-[10px] text-slate-400">ID da página que gerencia o direct comercial.</p>
                </div>
              </div>

              {/* Auto Reply Real Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer bg-white/80 p-3 rounded-xl border border-purple-100">
                  <input
                    type="checkbox"
                    checked={metaAutoReplyReal}
                    onChange={e => setMetaAutoReplyReal(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">Ativar Disparo Real no Instagram</span>
                    <span className="text-[11px] text-slate-500">
                      Quando marcado, novos comentários recebidos via webhook enviarão likes, comentários públicos e directs reais aos seguidores.
                    </span>
                  </div>
                </label>
              </div>

              {/* Action Buttons & Feedback */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestMetaToken}
                  disabled={testingToken || !metaAccessToken.trim()}
                  className="bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300 font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
                >
                  {testingToken ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-purple-700 border-t-transparent rounded-full animate-spin"></div>
                      <span>Validando na Meta...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-purple-700" />
                      <span>Testar Validade do Token</span>
                    </>
                  )}
                </button>

                <button
                  type="submit"
                  disabled={savingMetaSettings}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {savingMetaSettings ? 'Salvando...' : 'Salvar Configurações da Meta'}
                </button>
              </div>

              {/* Test Token Feedback Message */}
              {tokenTestFeedback && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                  tokenTestFeedback.success 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {tokenTestFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <p className="font-medium leading-relaxed">{tokenTestFeedback.message}</p>
                </div>
              )}

            </div>

            {/* Webhook Endpoint Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <span className="font-extrabold text-slate-900 block text-xs">
                Endpoint de Webhook Oficial (Cole no painel do Meta for Developers)
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
                    type="button"
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
                  value={metaVerifyToken}
                  onChange={e => setMetaVerifyToken(e.target.value)}
                  placeholder="mdtracker_instagram_token"
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 font-mono text-xs text-slate-700 font-bold max-w-sm"
                />
              </div>
            </div>

            {/* Step 2: Events Checklist */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
              <span className="font-extrabold text-slate-900 block text-xs">
                Campos Obrigatórios a Marcar no Webhook do Instagram na Meta:
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

          </form>

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
              <div className="space-y-2.5 bg-purple-50/50 p-3.5 rounded-xl border border-purple-100">
                <div className="grid grid-cols-2 gap-3">
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
                    <label className="font-bold text-slate-700 block text-[11px]">Link de Destino (URL) *</label>
                    <input
                      type="url"
                      value={formCtaUrl}
                      onChange={e => setFormCtaUrl(e.target.value)}
                      placeholder="https://mudadigital.com.br"
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-purple-500 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-start gap-2 text-[10px] text-amber-800">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Regra Oficial do Instagram/Meta:</strong> Em respostas a comentários, a Meta proíbe botões de template na primeira DM. <strong>O link acima será incluído diretamente no corpo da mensagem</strong>, garantindo que o Instagram transforme-o em um link azul clicável com preview interativo no celular do seguidor.
                  </p>
                </div>
              </div>

              {/* Follow-Gate (Portão de Seguidor) */}
              <div className="space-y-3 bg-amber-50/40 p-4 rounded-xl border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 block text-xs">Portão de Seguidor (Follow-Gate)</span>
                      <p className="text-[10px] text-slate-500">Exigir que o usuário siga o perfil para liberar o material/link.</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFollowGateEnabled}
                      onChange={e => setFormFollowGateEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                  </label>
                </div>

                {formFollowGateEnabled && (
                  <div className="space-y-3 pt-2 border-t border-amber-200/60 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block text-[11px]">
                        1. Mensagem inicial perguntando se segue o perfil:
                      </label>
                      <textarea
                        rows={2}
                        value={formAskFollowMessage}
                        onChange={e => setFormAskFollowMessage(e.target.value)}
                        placeholder="Olá {{username}}! Para eu te liberar o acesso, você já segue nosso perfil? Responda com SIM ou NÃO 👇"
                        className="w-full bg-white border border-amber-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-[11px]">
                          2. Se responder "NÃO" (Pedir para seguir):
                        </label>
                        <textarea
                          rows={2}
                          value={formNotFollowingMessage}
                          onChange={e => setFormNotFollowingMessage(e.target.value)}
                          placeholder="Poxa, esse conteúdo é exclusivo para quem segue nossa página..."
                          className="w-full bg-white border border-amber-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-[11px]">
                          3. Se disse "SIM" mas NÃO segue (Auditoria Meta):
                        </label>
                        <textarea
                          rows={2}
                          value={formVerifyFailMessage}
                          onChange={e => setFormVerifyFailMessage(e.target.value)}
                          placeholder="Ops! A Meta ainda não identificou o seu follow. Clica lá em Seguir..."
                          className="w-full bg-white border border-amber-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block text-[11px]">
                        4. Confirmação de Seguidor (Enviada antes da DM e do Link):
                      </label>
                      <input
                        type="text"
                        value={formConfirmFollowMessage}
                        onChange={e => setFormConfirmFollowMessage(e.target.value)}
                        placeholder="Oba, confirmado! Muito obrigado por nos seguir! 🎉 Aqui está o seu acesso:"
                        className="w-full bg-white border border-amber-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1 text-[11px] text-amber-900 font-medium">
                      <input
                        type="checkbox"
                        id="strictMetaCheck"
                        checked={formStrictMetaCheck}
                        onChange={e => setFormStrictMetaCheck(e.target.checked)}
                        className="w-3.5 h-3.5 accent-amber-600 rounded"
                      />
                      <label htmlFor="strictMetaCheck" className="cursor-pointer">
                        Auditoria rigorosa via Meta Graph API (<code>is_user_follow_business</code>)
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Related Post Promotion (Cross-Promotion) */}
              <div className="space-y-3 bg-cyan-50/40 p-4 rounded-xl border border-cyan-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 block text-xs">Recomendar Post Relacionado (Cross-Promotion)</span>
                      <p className="text-[10px] text-slate-500">Após a entrega do CTA, envia uma recomendação de outro Reels ou Post do Feed.</p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formRelatedPostEnabled}
                      onChange={e => setFormRelatedPostEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
                  </label>
                </div>

                {formRelatedPostEnabled && (
                  <div className="space-y-3 pt-2 border-t border-cyan-200/60 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-[11px]">URL da Publicação / Reels no Instagram *</label>
                        <input
                          type="url"
                          value={formRelatedPostUrl}
                          onChange={e => setFormRelatedPostUrl(e.target.value)}
                          placeholder="https://www.instagram.com/reel/C8xyz123456/"
                          className="w-full bg-white border border-cyan-200 rounded-lg p-2 text-xs font-mono focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-slate-700 block text-[11px]">Título ou Tema do Post</label>
                        <input
                          type="text"
                          value={formRelatedPostTitle}
                          onChange={e => setFormRelatedPostTitle(e.target.value)}
                          placeholder="Ex: 🔥 5 Automações que Triplicam o Faturamento"
                          className="w-full bg-white border border-cyan-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 block text-[11px]">Mensagem de Recomendação Complementar:</label>
                      <textarea
                        rows={2}
                        value={formRelatedPostMessage}
                        onChange={e => setFormRelatedPostMessage(e.target.value)}
                        placeholder="Já que você se interessou por esse tema, você vai adorar essa outra publicação complementar que postamos no feed:"
                        className="w-full bg-white border border-cyan-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Create Lead Switch */}
              <div className="flex items-center justify-between bg-emerald-50/60 border border-emerald-200 p-3 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block text-xs">Salvar seguidor como Lead no CRM</span>
                  <p className="text-[10px] text-slate-500">Cria o contato com origem 'Instagram Feed' e pontuação no Lead Scoring (+15 pts bônus se for seguidor verificado).</p>
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
