import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MessageSquare, Send, Search, Phone, MapPin, Tag, CheckCheck, Bot, Sparkles, 
  Paperclip, UserCheck, Zap, Clock, ShieldCheck, MoreVertical, RefreshCw, ExternalLink, ArrowLeft, Filter,
  Smile, X, Image as ImageIcon, Video, File as FileIcon, Settings, Trash2, Plus, AlertTriangle,
  Headphones, Users, ArrowRightLeft, Radio, CheckCircle2
} from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';
import { useDialog } from '../contexts/DialogContext';
import { Lead, ChatMessage, FunnelStage, CampaignLink, User as UserType, Company, Team, TeamMember } from '../types';
import { 
  toggleLeadBotStatus, suggestReplyWithAI, simulateChatbot,
  fetchTeams, fetchTeamMembers, fetchNextAttendant, autoAssignLead, reassignLead
} from '../services/api';

interface WhatsAppChatInboxProps {
  leads: Lead[];
  links: CampaignLink[];
  onUpdateLeadStage: (leadId: string, newStage: FunnelStage) => void;
  initialSelectedLeadId?: string | null;
  currentUser?: UserType | null;
  currentCompany?: Company | null;
  users?: UserType[];
  onUpdateLead?: (leadId: string, updates: Partial<Lead>) => void;
  onRefreshLeads?: () => void;
}

export const WhatsAppChatInbox: React.FC<WhatsAppChatInboxProps> = ({ 
  leads, 
  links, 
  onUpdateLeadStage,
  initialSelectedLeadId,
  currentUser,
  currentCompany,
  users = [],
  onUpdateLead,
  onRefreshLeads
}) => {
  const { alert } = useDialog();
  // Selected Lead for active conversation
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialSelectedLeadId || leads[0]?.id || '');
  
  useEffect(() => {
    if (initialSelectedLeadId) {
      setSelectedLeadId(initialSelectedLeadId);
    }
  }, [initialSelectedLeadId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<string>('Todos');
  const [leadFilterMode, setLeadFilterMode] = useState<'all' | 'my' | 'unassigned'>(
    currentUser?.role === 'attendant' ? 'my' : 'all'
  );

  // Equipes, Radar de Fila e Próximo Atendente
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedQueueTeamId, setSelectedQueueTeamId] = useState<string>('');
  const [nextAttendantData, setNextAttendantData] = useState<{
    nextUser: UserType | null;
    team: Team | null;
    memberCount: number;
  } | null>(null);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);

  // Modal de Transferência de Lead
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetUserId, setTransferTargetUserId] = useState('');
  const [transferTargetTeamId, setTransferTargetTeamId] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Input message state
  const [messageInput, setMessageInput] = useState('');
  
  // Emojis e Anexos
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<{file: File, base64: string, previewUrl: string, type: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});

  // Chatbot IA Controls & Simulator State
  const [localBotActiveMap, setLocalBotActiveMap] = useState<Record<string, boolean>>({});
  const [aiSuggestLoading, setAiSuggestLoading] = useState(false);
  const [isSimulatorModalOpen, setIsSimulatorModalOpen] = useState(false);
  const [simulatorMessages, setSimulatorMessages] = useState<{ sender: 'user' | 'bot' | 'system'; text: string; timestamp: string; isHandover?: boolean }[]>([
    {
      sender: 'bot',
      text: 'Olá! Sou a Sofia, assistente virtual inteligente da empresa. Como posso te ajudar hoje?',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [simulatorInput, setSimulatorInput] = useState('');
  const [simulatorLoading, setSimulatorLoading] = useState(false);

  // Respostas Rápidas Customizáveis
  const [quickReplies, setQuickReplies] = useState<{id: string, title: string, text: string}[]>(() => {
    try {
      const saved = localStorage.getItem('mdtracker_quick_replies');
      if (saved) return JSON.parse(saved);
    } catch (e) { console.error(e); }
    return [
      { id: 'qr-1', title: '🔗 Link de Desconto', text: 'Olá! Segue o link com o desconto exclusivo: ' },
      { id: 'qr-2', title: '📅 Agendar Reunião', text: 'Podemos agendar uma breve conversa por chamada telefônica ou vídeo hoje?' }
    ];
  });
  const [isQuickRepliesModalOpen, setIsQuickRepliesModalOpen] = useState(false);
  const [newQrTitle, setNewQrTitle] = useState('');
  const [newQrText, setNewQrText] = useState('');

  useEffect(() => {
    localStorage.setItem('mdtracker_quick_replies', JSON.stringify(quickReplies));
  }, [quickReplies]);

  const handleAddQuickReply = () => {
    if (!newQrTitle.trim() || !newQrText.trim()) return;
    setQuickReplies([...quickReplies, { id: 'qr-' + Date.now(), title: newQrTitle, text: newQrText }]);
    setNewQrTitle('');
    setNewQrText('');
  };

  const handleDeleteQuickReply = (id: string) => {
    setQuickReplies(quickReplies.filter(qr => qr.id !== id));
  };

  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

  const loadTeams = async () => {
    if (!currentCompany?.id) return;
    try {
      const data = await fetchTeams(currentCompany.id);
      setTeams(data.filter(t => t.active));
    } catch (e) {
      console.error('Erro ao carregar equipes:', e);
    }
  };

  const loadQueueRadar = async () => {
    if (!currentCompany?.id) return;
    try {
      setIsLoadingQueue(true);
      const res = await fetchNextAttendant(currentCompany.id, selectedQueueTeamId || undefined);
      setNextAttendantData(res);
    } catch (e) {
      console.error('Erro ao buscar próximo atendente:', e);
    } finally {
      setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, [currentCompany?.id]);

  useEffect(() => {
    loadQueueRadar();
    const interval = setInterval(loadQueueRadar, 8000);
    return () => clearInterval(interval);
  }, [currentCompany?.id, selectedQueueTeamId]);

  const handleAutoAssignLead = async (leadId: string) => {
    if (!currentCompany?.id || !leadId) return;
    try {
      setIsAutoAssigning(true);
      const res = await autoAssignLead(leadId, currentCompany.id, selectedQueueTeamId || undefined);
      if (res && res.success) {
        if (onUpdateLead) {
          onUpdateLead(leadId, {
            assignedUserId: res.assignedUser.id,
            assignedUserName: res.assignedUser.name,
            assignedTeamId: res.team.id,
            assignedTeamName: res.team.name
          });
        }
        if (onRefreshLeads) onRefreshLeads();
        loadQueueRadar();
        alert(`Lead direcionado com sucesso para ${res.assignedUser.name} (${res.team.name}) via regra do sistema!`);
      }
    } catch (err: any) {
      alert(`Não foi possível direcionar o lead automaticamente: ${err.message}`);
    } finally {
      setIsAutoAssigning(false);
    }
  };

  const handleClaimLead = async (leadId: string) => {
    if (!currentUser || !leadId) return;
    try {
      const userTeam = teams.find(t => t.id === selectedQueueTeamId) || teams[0];
      await reassignLead(leadId, currentUser.id, userTeam?.id);
      if (onUpdateLead) {
        onUpdateLead(leadId, {
          assignedUserId: currentUser.id,
          assignedUserName: currentUser.name,
          assignedTeamId: userTeam?.id,
          assignedTeamName: userTeam?.name
        });
      }
      if (onRefreshLeads) onRefreshLeads();
      loadQueueRadar();
      alert(`Você assumiu o atendimento deste lead com sucesso!`);
    } catch (err: any) {
      alert(`Erro ao assumir lead: ${err.message}`);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!selectedLead) return;
    if (!transferTargetUserId && !transferTargetTeamId) {
      alert('Selecione um usuário ou uma equipe para transferir.');
      return;
    }
    try {
      setIsTransferring(true);
      const targetUser = users.find(u => u.id === transferTargetUserId);
      const targetTeam = teams.find(t => t.id === transferTargetTeamId);

      await reassignLead(
        selectedLead.id,
        transferTargetUserId || undefined,
        transferTargetTeamId || undefined
      );

      if (onUpdateLead) {
        onUpdateLead(selectedLead.id, {
          assignedUserId: targetUser?.id,
          assignedUserName: targetUser?.name,
          assignedTeamId: targetTeam?.id,
          assignedTeamName: targetTeam?.name
        });
      }
      if (onRefreshLeads) onRefreshLeads();
      loadQueueRadar();
      setIsTransferModalOpen(false);
      alert(`Lead transferido com sucesso para ${targetUser ? targetUser.name : targetTeam?.name}!`);
    } catch (err: any) {
      alert(`Erro ao transferir lead: ${err.message}`);
    } finally {
      setIsTransferring(false);
    }
  };

  const unassignedLeads = useMemo(() => {
    return leads.filter(l => !l.assignedUserId && l.stage !== 'Convertido' && l.stage !== 'Perdido');
  }, [leads]);

  const myLeads = useMemo(() => {
    if (!currentUser) return [];
    return leads.filter(l => l.assignedUserId === currentUser.id);
  }, [leads, currentUser]);

  // Função para buscar mensagens reais do servidor
  const fetchMessages = async () => {
    if (!selectedLead || !selectedLead.phone) return;
    try {
      const res = await fetch(`/api/whatsapp/messages/${selectedLead.phone}`);
      if (res.ok) {
        const data = await res.json();
        const formattedMessages: ChatMessage[] = data.map((d: any) => {
           const date = new Date(d.timestamp);
           const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
           return {
             id: d.id,
             leadId: selectedLead.id,
             sender: d.sender,
             text: d.text,
             timestamp: timeStr,
             status: d.status
           };
        });
        
        // Sempre garantimos uma mensagem inicial do sistema para contexto
        const systemMsg: ChatMessage = {
          id: 'msg-init-' + selectedLead.id,
          leadId: selectedLead.id,
          sender: 'system',
          text: `Início do atendimento via WhatsApp para ${selectedLead.name || 'Cliente'}. Origem: ${selectedLead.utmSource || 'Direto'}`,
          timestamp: '08:00',
          status: 'lido'
        };

        setMessages(prev => ({
          ...prev,
          [selectedLead.id]: [systemMsg, ...formattedMessages]
        }));
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Polling a cada 3s
    return () => clearInterval(interval);
  }, [selectedLead]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 16 * 1024 * 1024) {
      alert('O arquivo é muito grande. O limite máximo recomendado é de 16MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    let type = 'document';
    if (file.type.startsWith('image/')) type = 'image';
    else if (file.type.startsWith('video/')) type = 'video';
    else if (file.type.startsWith('audio/')) type = 'audio';

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      // Extract just the base64 string without data type prefix for Evolution
      const base64Data = base64.split(',')[1] || base64;
      setAttachment({ file, base64: base64Data, previewUrl, type });
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // reset
  };

  const onEmojiClick = (emojiData: any) => {
    setMessageInput(prev => prev + emojiData.emoji);
  };

  const currentMessages = messages[selectedLeadId] || [];

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!messageInput.trim() && !attachment) || !selectedLeadId || !selectedLead?.phone) return;

    const textToSend = messageInput.trim();
    const currentAttachment = attachment;
    
    setMessageInput('');
    setAttachment(null);
    setShowEmojiPicker(false);

    // Atualização Otimista na UI
    const newMessage: ChatMessage = {
      id: 'msg-' + Date.now(),
      leadId: selectedLeadId,
      sender: 'attendant',
      text: textToSend + (currentAttachment ? (textToSend ? `\n\n[Mídia: ${currentAttachment.file.name}]` : `[Mídia: ${currentAttachment.file.name}]`) : ''),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      status: 'entregue'
    };

    setMessages(prev => ({
      ...prev,
      [selectedLeadId]: [...(prev[selectedLeadId] || []), newMessage]
    }));

    try {
      if (currentAttachment) {
        // Envia mídia
        await fetch('/api/whatsapp/send-media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            companyId: selectedLead.companyId || 'comp-alfa', 
            phone: selectedLead.phone, 
            mediaBase64: currentAttachment.base64,
            mediaType: currentAttachment.type,
            caption: textToSend
          })
        });
      } else {
        // Envia texto
        await fetch('/api/whatsapp/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId: selectedLead.companyId || 'comp-alfa', phone: selectedLead.phone, message: textToSend })
        });
      }
      fetchMessages();
      checkKeywordStageAutomation(textToSend);
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
    }
  };

  const checkKeywordStageAutomation = (text: string) => {
    if (!selectedLead) return;
    const lower = text.toLowerCase();

    if (lower.includes('pix') || lower.includes('comprar') || lower.includes('pagar') || lower.includes('fechado') || lower.includes('comprovante')) {
      if (selectedLead.stage !== 'Convertido') {
        onUpdateLeadStage(selectedLead.id, 'Convertido');
      }
    } else if (lower.includes('preço') || lower.includes('valor') || lower.includes('orçamento') || lower.includes('proposta') || lower.includes('desconto')) {
      if (selectedLead.stage !== 'Em Negociação' && selectedLead.stage !== 'Convertido') {
        onUpdateLeadStage(selectedLead.id, 'Em Negociação');
      }
    } else if (lower.includes('não quero') || lower.includes('cancelar') || lower.includes('muito caro') || lower.includes('sem interesse')) {
      if (selectedLead.stage !== 'Perdido') {
        onUpdateLeadStage(selectedLead.id, 'Perdido');
      }
    } else if (lower.includes('oi') || lower.includes('olá') || lower.includes('boa tarde') || lower.includes('bom dia')) {
      if (selectedLead.stage === 'Novo Lead') {
        onUpdateLeadStage(selectedLead.id, 'Contatado');
      }
    }
  };

  const handleSendQuickReply = (text: string) => {
    setMessageInput(text);
  };

  const isSelectedLeadBotActive = selectedLead 
    ? (localBotActiveMap[selectedLead.id] !== undefined 
        ? localBotActiveMap[selectedLead.id] 
        : (selectedLead.botActive !== false))
    : true;

  const handleToggleBotStatus = async () => {
    if (!selectedLead) return;
    const nextStatus = !isSelectedLeadBotActive;
    setLocalBotActiveMap(prev => ({ ...prev, [selectedLead.id]: nextStatus }));
    try {
      await toggleLeadBotStatus(selectedLead.id, nextStatus);
    } catch (err: any) {
      console.error('Erro ao atualizar status do bot:', err);
    }
  };

  const generateAiSuggestion = async () => {
    if (!selectedLead) return;
    setAiSuggestLoading(true);
    try {
      const res = await suggestReplyWithAI({
        companyId: selectedLead.companyId || 'comp-alfa',
        phone: selectedLead.phone,
        leadId: selectedLead.id
      });
      if (res && res.suggestion) {
        setMessageInput(res.suggestion);
      }
    } catch (err) {
      console.warn('Erro ao chamar IA, usando fallback inteligente:', err);
      const suggestions = [
        `Olá ${selectedLead.name}! Vi que você chegou pela nossa campanha no ${selectedLead.utmSource || 'WhatsApp'}. Como posso te ajudar hoje?`,
        `Oi ${selectedLead.name}! Qualquer dúvida que tiver em ${selectedLead.location?.city || 'sua região'}, temos condições especiais hoje. Gostaria de dar uma olhada?`,
        `Olá! Tenho uma condição exclusiva para fechamento hoje. Quer que eu te envie o link direto com desconto especial?`
      ];
      setMessageInput(suggestions[Math.floor(Math.random() * suggestions.length)]);
    } finally {
      setAiSuggestLoading(false);
    }
  };

  const handleSendSimulatorMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!simulatorInput.trim() || simulatorLoading) return;

    const userText = simulatorInput.trim();
    setSimulatorInput('');
    const timeNow = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setSimulatorMessages(prev => [...prev, {
      sender: 'user',
      text: userText,
      timestamp: timeNow
    }]);

    setSimulatorLoading(true);
    try {
      const res = await simulateChatbot({
        companyId: selectedLead?.companyId || 'comp-alfa',
        message: userText,
        lead: selectedLead || { name: 'Cliente Teste', location: { city: 'São Paulo', state: 'SP' }, utmCampaign: 'Teste Simulador' }
      });

      setSimulatorMessages(prev => [...prev, {
        sender: 'bot',
        text: res.reply,
        timestamp: res.timestamp || timeNow,
        isHandover: res.isHandover
      }]);
    } catch (err: any) {
      setSimulatorMessages(prev => [...prev, {
        sender: 'system',
        text: 'Erro ao conectar ao motor do Chatbot com IA: ' + err.message,
        timestamp: timeNow
      }]);
    } finally {
      setSimulatorLoading(false);
    }
  };

  // Filtered leads list
  const filteredLeads = leads.filter(lead => {
    const safeName = lead.name || '';
    const safePhone = lead.phone || '';
    const safeUtm = lead.utmSource || '';

    const matchesSearch = 
      safeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      safePhone.includes(searchQuery) ||
      safeUtm.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStage = filterStage === 'Todos' || lead.stage === filterStage;
    
    let matchesFilterMode = true;
    if (leadFilterMode === 'my') {
      matchesFilterMode = Boolean(currentUser && lead.assignedUserId === currentUser.id);
    } else if (leadFilterMode === 'unassigned') {
      matchesFilterMode = !lead.assignedUserId;
    }

    return matchesSearch && matchesStage && matchesFilterMode;
  });

  return (
    <div className="space-y-4 text-slate-800">
      
      {/* Top Banner Status */}
      <div className="bg-slate-900 text-white p-4 rounded-lg border border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              Central de Atendimento WhatsApp (Chat em Tempo Real)
            </h2>
            <p className="text-xs text-slate-400">
              Conexão com API / Evolution / WhatsApp Web ativa. Gerencie conversas, feche vendas e controle o Chatbot com IA.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsSimulatorModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-500 text-[11px] font-bold px-3 py-1 rounded flex items-center gap-1.5 shadow-xs transition"
            title="Abrir Simulador Interativo do Chatbot com IA"
          >
            <Bot className="w-3.5 h-3.5" />
            Simulador Chatbot IA
          </button>

          <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sessão Conectada
          </span>
        </div>
      </div>

      {/* Radar de Atendimento & Fila da Equipe */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-3.5 sm:p-4 rounded-xl border border-indigo-900/60 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Left: Queue / Team selection & Status */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Radar de Fila & Equipes
                </span>
                
                {/* Team Selector Dropdown */}
                <select
                  value={selectedQueueTeamId}
                  onChange={(e) => setSelectedQueueTeamId(e.target.value)}
                  className="bg-slate-800/90 text-white border border-indigo-500/40 rounded px-2 py-0.5 text-xs font-semibold focus:outline-none focus:border-indigo-400"
                >
                  <option value="">🎯 Todas as Equipes de Vendas</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.distribution_strategy === 'workload' ? 'Menor Carga' : t.distribution_strategy === 'random' ? 'Aleatório' : 'Roleta'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 mt-1 text-xs text-slate-300 flex-wrap">
                <span className="text-[11px]">Estratégia:</span>
                <span className="bg-indigo-900/80 text-indigo-200 border border-indigo-700/50 px-2 py-0.5 rounded text-[10px] font-bold">
                  {nextAttendantData?.team?.distribution_strategy === 'workload'
                    ? '⚖️ Menor Carga de Trabalho'
                    : nextAttendantData?.team?.distribution_strategy === 'random'
                    ? '🎲 Distribuição Aleatória'
                    : '🔄 Roleta Circular (Round-Robin)'}
                </span>
                <span className="text-slate-400 text-[11px]">•</span>
                <span className="text-slate-300 text-[11px]">
                  <strong>{nextAttendantData?.memberCount || users.length}</strong> atendentes ativos
                </span>
              </div>
            </div>
          </div>

          {/* Center: Next Attendant in Line Card */}
          <div className="bg-slate-800/80 border border-indigo-500/30 rounded-xl px-4 py-2 flex items-center gap-3 shadow-inner">
            <div className="text-right">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                🎯 Próximo a Atender:
              </span>
              <span className="text-xs sm:text-sm font-bold text-white block truncate max-w-[170px]">
                {nextAttendantData?.nextUser?.name || 'Aguardando Atendente'}
              </span>
            </div>

            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs flex items-center justify-center border-2 border-indigo-400 shadow-xs">
                {nextAttendantData?.nextUser?.name ? nextAttendantData.nextUser.name.charAt(0).toUpperCase() : '?'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" title="Online e Pronto" />
            </div>

            <div className="text-left text-[11px] leading-tight">
              <span className="inline-flex items-center gap-1 text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/50 px-1.5 py-0.5 rounded text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Disponível na Fila
              </span>
              <div className="text-slate-400 text-[10px] mt-0.5 font-mono">
                Ramal: <strong className="text-slate-200">{nextAttendantData?.nextUser?.extension || '101'}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={loadQueueRadar}
              disabled={isLoadingQueue}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition ml-1"
              title="Atualizar Fila"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingQueue ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>

          {/* Right: Unassigned Queue Action Button */}
          <div className="flex items-center gap-2">
            {unassignedLeads.length > 0 ? (
              <button
                type="button"
                onClick={() => handleAutoAssignLead(unassignedLeads[0].id)}
                disabled={isAutoAssigning}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition transform active:scale-95 disabled:opacity-50"
                title="Distribuir o próximo lead da fila para o atendente configurado"
              >
                <Zap className="w-4 h-4 fill-slate-950 animate-bounce" />
                <div className="text-left leading-none">
                  <div className="text-[11px] font-black uppercase">Distribuir Fila ({unassignedLeads.length})</div>
                  <div className="text-[9px] font-medium text-slate-900/80">Direcionar para {nextAttendantData?.nextUser?.name?.split(' ')[0] || 'Próximo'}</div>
                </div>
              </button>
            ) : (
              <div className="bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 px-3.5 py-2 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-[11px]">Todos os leads atendidos!</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Main Chat Layout Container */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
        {/* LEFT SIDEBAR: Conversations List (4 cols) */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-slate-200 space-y-2 bg-white">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar conversa, nome ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              <button
                type="button"
                onClick={() => setLeadFilterMode('all')}
                className={`px-2 py-0.5 rounded font-bold whitespace-nowrap transition border ${
                  leadFilterMode === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Todos ({leads.length})
              </button>

              {currentUser && (
                <button
                  type="button"
                  onClick={() => setLeadFilterMode('my')}
                  className={`px-2 py-0.5 rounded font-bold whitespace-nowrap transition border ${
                    leadFilterMode === 'my'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  👤 Meus Leads ({myLeads.length})
                </button>
              )}

              <button
                type="button"
                onClick={() => setLeadFilterMode('unassigned')}
                className={`px-2 py-0.5 rounded font-bold whitespace-nowrap transition border flex items-center gap-1 ${
                  leadFilterMode === 'unassigned'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                    : unassignedLeads.length > 0
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 font-extrabold'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                Aguardando ({unassignedLeads.length})
              </button>

              {['Todos', 'Novo Lead', 'Em Negociação', 'Convertido'].map(stg => (
                <button
                  key={stg}
                  onClick={() => setFilterStage(stg)}
                  className={`px-2 py-0.5 rounded font-medium whitespace-nowrap transition ${
                    filterStage === stg ? 'bg-slate-900 text-white font-bold' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {stg}
                </button>
              ))}
            </div>
          </div>

          {/* Leads Conversations List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[500px]">
            {filteredLeads.length > 0 ? (
              filteredLeads.map(lead => {
                const leadMsgs = messages[lead.id];
                const lastMsg = leadMsgs && leadMsgs.length > 0 ? leadMsgs[leadMsgs.length - 1] : null;
                const isSelected = lead.id === selectedLeadId;

                return (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className={`p-3 cursor-pointer transition flex items-start gap-3 ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-100/80'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="font-bold text-xs text-slate-900 truncate">{lead.name || 'Visitante'}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {lastMsg ? lastMsg.timestamp : 'Hoje'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 truncate mb-1">
                        {lastMsg ? lastMsg.text : `Origem: ${lead.utmSource || 'Direto'}`}
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          lead.stage === 'Novo Lead' ? 'bg-blue-100 text-blue-700' :
                          lead.stage === 'Em Negociação' ? 'bg-purple-100 text-purple-700' :
                          lead.stage === 'Convertido' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {lead.stage}
                        </span>
                        {lead.assignedUserId ? (
                          <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded text-[9px] font-semibold border border-indigo-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            👤 {lead.assignedUserName || 'Atendente'}
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[9px] font-extrabold border border-amber-300 flex items-center gap-1 animate-pulse">
                            <Zap className="w-2.5 h-2.5 fill-amber-600 text-amber-600" />
                            Aguardando Atendente
                          </span>
                        )}
                        {lead.assignedTeamName && (
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-semibold border border-slate-200">
                            🏷️ {lead.assignedTeamName}
                          </span>
                        )}
                        {lead.utmContent && (
                          <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded text-[9px] font-bold border border-purple-200" title="Anúncio Criativo">
                            🎨 {lead.utmContent}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 font-mono">
                          {lead.location?.city ? `${lead.location.city}/${lead.location.state}` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 p-4 text-center italic">Nenhum lead encontrado com estes filtros.</p>
            )}
          </div>

        </div>

        {/* RIGHT MAIN WINDOW: Active WhatsApp Conversation (8 cols) */}
        {selectedLead ? (
          <div className="md:col-span-8 flex flex-col bg-slate-50/30">
            
            {/* Chat Top Bar */}
            <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {selectedLead.name ? selectedLead.name.charAt(0).toUpperCase() : 'L'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-slate-900 truncate">{selectedLead.name}</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Online no WhatsApp
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                    <span>{selectedLead.phone || 'Sem telefone'}</span>
                    <span>•</span>
                    <span className="text-blue-600 font-semibold">{selectedLead.location?.city}, {selectedLead.location?.state}</span>
                  </p>
                </div>
              </div>

              {/* Stage Quick Switcher & Bot Controls */}
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Etapa do Funil:</span>
                  <select
                    value={selectedLead.stage}
                    onChange={(e) => onUpdateLeadStage(selectedLead.id, e.target.value as FunnelStage)}
                    className="bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded px-2 py-1 text-xs font-bold text-slate-800 focus:outline-none"
                  >
                    <option value="Novo Lead">Novo Lead</option>
                    <option value="Contatado">Contatado</option>
                    <option value="Em Negociação">Em Negociação</option>
                    <option value="Convertido">Convertido</option>
                    <option value="Perdido">Perdido</option>
                  </select>
                </div>

                {/* Bot Status & Handover Toggle */}
                <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
                  {isSelectedLeadBotActive ? (
                    <div className="flex items-center gap-1.5">
                      <span className="hidden xl:inline-flex bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-1 rounded items-center gap-1">
                        <Bot className="w-3 h-3 text-indigo-600 animate-pulse" />
                        Chatbot IA Ativo
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleBotStatus}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2 py-1 rounded transition flex items-center gap-1 shadow-2xs"
                        title="Pausar o Chatbot IA para você assumir o atendimento deste cliente"
                      >
                        <UserCheck className="w-3 h-3 text-amber-700" />
                        <span>Pausar IA</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="hidden xl:inline-flex bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-1 rounded items-center gap-1">
                        <UserCheck className="w-3 h-3 text-amber-600" />
                        Humano
                      </span>
                      <button
                        type="button"
                        onClick={handleToggleBotStatus}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold px-2 py-1 rounded transition flex items-center gap-1 shadow-2xs"
                        title="Reativar o Chatbot IA para responder automaticamente este lead"
                      >
                        <Bot className="w-3 h-3 text-indigo-600" />
                        <span>Reativar IA</span>
                      </button>
                    </div>
                  )}
                </div>

                <a
                  href={`https://wa.me/55${selectedLead.phone?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                  title="Abrir no App Nativo do WhatsApp"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quem está atendendo o Lead / Alerta de Lead sem Atendente */}
            {selectedLead.assignedUserId ? (
              <div className="bg-indigo-50/90 border-b border-indigo-100 px-4 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-slate-600">Atendimento ativo com:</span>
                  <span className="font-bold text-indigo-950 flex items-center gap-1 bg-white px-2.5 py-0.5 rounded border border-indigo-200 shadow-2xs">
                    👤 {selectedLead.assignedUserName || 'Atendente Responsável'}
                  </span>
                  {selectedLead.assignedTeamName && (
                    <span className="text-slate-500 text-[11px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      🏷️ Equipe: <strong className="text-slate-700">{selectedLead.assignedTeamName}</strong>
                    </span>
                  )}
                  {selectedLead.assignedAt && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      Atribuído às {new Date(selectedLead.assignedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTransferTargetUserId(selectedLead.assignedUserId || '');
                    setTransferTargetTeamId(selectedLead.assignedTeamId || '');
                    setIsTransferModalOpen(true);
                  }}
                  className="bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-300 font-bold px-3 py-1 rounded-lg text-[11px] flex items-center gap-1.5 transition shadow-2xs shrink-0 self-start sm:self-auto"
                  title="Transferir este lead para outro atendente ou equipe da empresa"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Transferir Lead</span>
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 px-4 py-2.5 border-b border-amber-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 fill-slate-950 text-amber-200 shrink-0" />
                  <div>
                    <span className="text-xs font-black uppercase tracking-wide">
                      Lead Sem Atendente Atribuído!
                    </span>
                    <p className="text-[11px] text-slate-950/80 leading-tight">
                      Próximo da fila para atendimento: <strong>{nextAttendantData?.nextUser?.name || 'Aguardando Atendente'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAutoAssignLead(selectedLead.id)}
                    disabled={isAutoAssigning}
                    className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition active:scale-95 disabled:opacity-50"
                    title="Direcionar automaticamente conforme a estratégia da equipe"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>{isAutoAssigning ? 'Direcionando...' : '⚡ Direcionar Automaticamente (Roleta)'}</span>
                  </button>

                  {currentUser && (
                    <button
                      type="button"
                      onClick={() => handleClaimLead(selectedLead.id)}
                      className="bg-white hover:bg-slate-50 text-slate-950 font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition active:scale-95 border border-amber-300"
                      title="Assumir o atendimento deste lead agora"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-indigo-700" />
                      <span>🙋 Atender Agora</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Full Ad Attribution Hierarchy Sub-bar */}
            <div className="bg-purple-50/80 px-4 py-2 border-b border-purple-200 text-[11px] text-slate-700 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3.5 flex-wrap">
                <span className="flex items-center gap-1 font-bold text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                  🎨 Anúncio: <strong>{selectedLead.utmContent || 'Padrão / Geral'}</strong>
                </span>
                <span className="flex items-center gap-1 text-slate-700">
                  🎯 Conjunto: <strong className="text-slate-900">{selectedLead.utmTerm || 'Amplo'}</strong>
                </span>
                <span className="flex items-center gap-1 text-slate-700">
                  📢 Campanha: <strong className="text-slate-900">{selectedLead.utmCampaign || 'Orgânico'}</strong>
                </span>
                <span className="flex items-center gap-1 text-slate-700">
                  🌐 Origem: <strong className="text-blue-700">{selectedLead.utmSource || 'Direto'}</strong>
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[10px]">Lead ID: {selectedLead.id}</span>
            </div>

            {/* Messages Thread Display */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[340px] max-h-[380px] bg-[#efeae2]/20">
              {currentMessages.map(msg => {
                if (msg.sender === 'system') {
                  return (
                    <div key={msg.id} className="text-center my-2">
                      <span className="bg-slate-200/90 text-slate-600 text-[10px] font-semibold px-3 py-1 rounded-full shadow-2xs">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isAttendant = msg.sender === 'attendant';
                const isBot = msg.sender === 'bot';

                if (isBot) {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[80%] sm:max-w-[70%] p-3 rounded-lg text-xs shadow-2xs bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-br-none border border-indigo-500/40">
                        <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-indigo-500/30 text-[10px]">
                          <span className="flex items-center gap-1 font-bold text-indigo-300">
                            <Bot className="w-3.5 h-3.5 text-indigo-400" />
                            Chatbot com IA
                          </span>
                          <span className="bg-indigo-500/30 text-indigo-300 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                            Automático
                          </span>
                        </div>
                        <p className="whitespace-pre-line leading-relaxed text-indigo-50">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-indigo-300">
                          <span>{msg.timestamp}</span>
                          <CheckCheck className="w-3 h-3 text-indigo-300" />
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAttendant ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] sm:max-w-[70%] p-3 rounded-lg text-xs shadow-2xs ${
                      isAttendant 
                        ? 'bg-emerald-700 text-white rounded-br-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}>
                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                      
                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                        isAttendant ? 'text-emerald-200' : 'text-slate-400'
                      }`}>
                        <span>{msg.timestamp}</span>
                        {isAttendant && (
                          <CheckCheck className="w-3 h-3 text-emerald-200" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Response Shortcuts */}
            <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px] custom-scrollbar">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Respostas Rápidas:</span>
              {quickReplies.map(qr => (
                <button
                  key={qr.id}
                  type="button"
                  onClick={() => handleSendQuickReply(qr.text)}
                  className="bg-white hover:bg-slate-200 border border-slate-200 rounded px-2.5 py-1 text-slate-700 font-medium whitespace-nowrap transition"
                >
                  {qr.title}
                </button>
              ))}
              <button
                type="button"
                disabled={aiSuggestLoading}
                onClick={generateAiSuggestion}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 rounded px-2.5 py-1 flex items-center gap-1 whitespace-nowrap transition disabled:opacity-50"
                title="Gerar sugestão inteligente com IA copiloto baseada no histórico e produtos"
              >
                {aiSuggestLoading ? (
                  <RefreshCw className="w-3 h-3 text-indigo-600 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                )}
                {aiSuggestLoading ? 'Gerando com IA...' : 'Sugerir com IA'}
              </button>
              <button
                type="button"
                onClick={() => setIsQuickRepliesModalOpen(true)}
                className="text-slate-400 hover:text-slate-600 transition p-1"
                title="Gerenciar Respostas Rápidas"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>

            {/* Message Send Form Bar */}
            <div className="relative">
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-50">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}
              
              {attachment && (
                <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded bg-slate-200 flex items-center justify-center overflow-hidden shrink-0 border border-slate-300">
                    {attachment.type === 'image' ? (
                      <img src={attachment.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : attachment.type === 'video' ? (
                      <Video className="w-6 h-6 text-slate-500" />
                    ) : (
                      <FileIcon className="w-6 h-6 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-700 truncate">{attachment.file.name}</p>
                    <p className="text-[10px] text-slate-500">{(attachment.file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setAttachment(null)}
                    className="p-1.5 hover:bg-slate-200 rounded text-slate-500 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition shrink-0"
                >
                  <Smile className="w-5 h-5" />
                </button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition shrink-0"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                <input
                  type="text"
                  placeholder={attachment ? "Adicione uma legenda..." : "Digite sua mensagem para o cliente no WhatsApp..."}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-emerald-600"
                />
                
                <button
                  type="submit"
                  disabled={!messageInput.trim() && !attachment}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold p-2.5 rounded-lg transition shadow-xs flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center p-8 text-slate-400">
            Selecione uma conversa ao lado para visualizar a troca de mensagens.
          </div>
        )}

      </div>

      {/* MODAL: Gerenciar Respostas Rápidas */}
      {isQuickRepliesModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-lg rounded-lg shadow-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-slate-900">Respostas Rápidas</h2>
              <button onClick={() => setIsQuickRepliesModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
              {quickReplies.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Nenhuma resposta rápida cadastrada.</p>
              ) : (
                <div className="space-y-2">
                  {quickReplies.map(qr => (
                    <div key={qr.id} className="p-3 bg-slate-50 border border-slate-200 rounded flex justify-between items-start gap-3">
                      <div>
                        <p className="font-bold text-sm text-slate-800">{qr.title}</p>
                        <p className="text-xs text-slate-600 mt-1">{qr.text}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteQuickReply(qr.id)}
                        className="text-slate-400 hover:text-red-500 transition p-1 shrink-0"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase">Adicionar Nova</h3>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  placeholder="Título (ex: 🔗 Link de Desconto)"
                  value={newQrTitle}
                  onChange={e => setNewQrTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-emerald-500 bg-white"
                />
                <textarea
                  placeholder="Mensagem completa..."
                  value={newQrText}
                  onChange={e => setNewQrText(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:border-emerald-500 bg-white resize-none h-20"
                />
                <button
                  onClick={handleAddQuickReply}
                  disabled={!newQrTitle.trim() || !newQrText.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Resposta
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Simulador Interativo do Chatbot com IA */}
      {isSimulatorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col h-[620px]">
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-600/50 border border-indigo-400 flex items-center justify-center text-white">
                  <Bot className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-2">
                    Simulador do Chatbot IA
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Modo Teste ao Vivo
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Teste perguntas, dúvidas sobre produtos e gatilhos de transbordo humano em tempo real.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsSimulatorModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Test Prompt Chips */}
            <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Testes Rápidos:</span>
              {[
                'Oi, como funciona?',
                'Quais produtos vocês têm e os preços?',
                'Como faço para comprar via Pix?',
                'Quero falar com um atendente humano'
              ].map(testText => (
                <button
                  key={testText}
                  type="button"
                  onClick={() => setSimulatorInput(testText)}
                  className="bg-white hover:bg-slate-200 border border-slate-200 text-slate-700 font-medium px-2 py-0.5 rounded whitespace-nowrap transition"
                >
                  {testText}
                </button>
              ))}
            </div>

            {/* Simulator Chat Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#efeae2]/30">
              {simulatorMessages.map((msg, idx) => {
                if (msg.sender === 'system') {
                  return (
                    <div key={idx} className="text-center my-1.5">
                      <span className="bg-red-100 text-red-700 text-[10px] font-semibold px-3 py-1 rounded-full border border-red-200">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isUser = msg.sender === 'user';

                return (
                  <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-lg text-xs shadow-2xs ${
                      isUser
                        ? 'bg-emerald-700 text-white rounded-br-none'
                        : 'bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-bl-none border border-indigo-500/40'
                    }`}>
                      {!isUser && (
                        <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-indigo-500/30 text-[10px]">
                          <span className="flex items-center gap-1 font-bold text-indigo-300">
                            <Bot className="w-3.5 h-3.5 text-indigo-400" />
                            Sofia (Chatbot IA)
                          </span>
                          {msg.isHandover && (
                            <span className="bg-amber-500/30 text-amber-300 px-1.5 py-0.2 rounded text-[9px] font-bold border border-amber-400/40 flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" />
                              Transbordo Humano
                            </span>
                          )}
                        </div>
                      )}

                      <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>

                      <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] ${
                        isUser ? 'text-emerald-200' : 'text-indigo-300'
                      }`}>
                        <span>{msg.timestamp}</span>
                        {isUser && <CheckCheck className="w-3 h-3 text-emerald-200" />}
                      </div>
                    </div>
                  </div>
                );
              })}

              {simulatorLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 text-white p-3 rounded-lg text-xs shadow-2xs rounded-bl-none flex items-center gap-2 border border-indigo-500/30">
                    <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span className="text-slate-300 font-medium">Sofia está digitando...</span>
                    <span className="flex gap-1 ml-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendSimulatorMessage} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                placeholder="Digite uma mensagem como se fosse o cliente..."
                value={simulatorInput}
                onChange={e => setSimulatorInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-indigo-600"
              />
              <button
                type="submit"
                disabled={!simulatorInput.trim() || simulatorLoading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5 shadow-xs shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Transferência de Lead */}
      {isTransferModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <ArrowRightLeft className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Transferir Atendimento de Lead</h3>
                  <p className="text-[11px] text-slate-400">Cliente: {selectedLead.name} ({selectedLead.phone})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Atendente Atual:
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    {selectedLead.assignedUserName ? `👤 ${selectedLead.assignedUserName}` : '⚠️ Nenhum atendente atribuído'}
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    {selectedLead.assignedTeamName ? `🏷️ ${selectedLead.assignedTeamName}` : ''}
                  </span>
                </div>
              </div>

              {/* Equipe de Destino */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  1. Selecione a Equipe de Destino:
                </label>
                <select
                  value={transferTargetTeamId}
                  onChange={(e) => setTransferTargetTeamId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Manter equipe atual / Nenhuma</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.type === 'inbound_sales' ? 'Vendas Receptivo' : t.type === 'outbound_sales' ? 'Vendas Ativo' : 'Suporte'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Colaborador de Destino (Multi-tenant isolado para currentCompany) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  2. Selecione o Novo Atendente Responsável:
                </label>
                <select
                  value={transferTargetUserId}
                  onChange={(e) => setTransferTargetUserId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Selecione um colaborador da empresa...</option>
                  {users
                    .filter(u => u.active !== false)
                    .map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role === 'admin' ? 'Administrador' : u.role === 'supervisor' ? 'Supervisor' : 'Vendedor/Atendente'}) {u.extension ? `• Ramal ${u.extension}` : ''}
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">
                  Apenas colaboradores cadastrados nesta empresa ({currentCompany?.name}) são exibidos.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTransfer}
                  disabled={isTransferring || (!transferTargetUserId && !transferTargetTeamId)}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition shadow-xs flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>{isTransferring ? 'Transferindo...' : 'Confirmar Transferência'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
