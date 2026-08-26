import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Search, Phone, MapPin, Tag, CheckCheck, Bot, Sparkles, 
  Paperclip, UserCheck, Zap, Clock, ShieldCheck, MoreVertical, RefreshCw, ExternalLink, ArrowLeft, Filter,
  Smile, X, Image as ImageIcon, Video, File as FileIcon
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { Lead, ChatMessage, FunnelStage, CampaignLink } from '../types';

interface WhatsAppChatInboxProps {
  leads: Lead[];
  links: CampaignLink[];
  onUpdateLeadStage: (leadId: string, newStage: FunnelStage) => void;
  initialSelectedLeadId?: string | null;
}

export const WhatsAppChatInbox: React.FC<WhatsAppChatInboxProps> = ({ 
  leads, 
  links, 
  onUpdateLeadStage,
  initialSelectedLeadId
}) => {
  // Selected Lead for active conversation
  const [selectedLeadId, setSelectedLeadId] = useState<string>(initialSelectedLeadId || leads[0]?.id || '');
  
  useEffect(() => {
    if (initialSelectedLeadId) {
      setSelectedLeadId(initialSelectedLeadId);
    }
  }, [initialSelectedLeadId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStage, setFilterStage] = useState<string>('Todos');

  // Input message state
  const [messageInput, setMessageInput] = useState('');
  
  // Emojis e Anexos
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<{file: File, base64: string, previewUrl: string, type: string} | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mensagens carregadas do banco de dados
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});

  const selectedLead = leads.find(l => l.id === selectedLeadId) || leads[0];

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

  const generateAiSuggestion = () => {
    if (!selectedLead) return;
    const suggestions = [
      `Olá ${selectedLead.name}! Vi que você chegou pela nossa campanha no ${selectedLead.utmSource || 'Meta Ads'}. Posso te mandar o link exclusivo agora?`,
      `Oi ${selectedLead.name}! Qualquer dúvida que tiver em ${selectedLead.location?.city || 'sua cidade'}, estou à disposição por aqui. Quer agendar uma demonstração?`,
      `Olá! Tenho uma condição especial de fechamento para hoje. Conseguimos dar continuidade no seu pedido?`
    ];
    const picked = suggestions[Math.floor(Math.random() * suggestions.length)];
    setMessageInput(picked);
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

    return matchesSearch && matchesStage;
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
              Conexão com API / Evolution / WhatsApp Web ativa. Gerencie conversas e feche vendas diretamente nesta tela.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Sessão Conectada
          </span>
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

              {/* Stage Quick Switcher */}
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
            <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <span className="text-[10px] font-bold text-slate-400 uppercase shrink-0">Respostas Rápidas:</span>
              <button
                type="button"
                onClick={() => handleSendQuickReply('Olá! Segue o link com o desconto exclusivo: ')}
                className="bg-white hover:bg-slate-200 border border-slate-200 rounded px-2.5 py-1 text-slate-700 font-medium whitespace-nowrap transition"
              >
                🔗 Link de Desconto
              </button>
              <button
                type="button"
                onClick={() => handleSendQuickReply('Podemos agendar uma breve conversa por chamada telefônica ou vídeo hoje?')}
                className="bg-white hover:bg-slate-200 border border-slate-200 rounded px-2.5 py-1 text-slate-700 font-medium whitespace-nowrap transition"
              >
                📅 Agendar Reunião
              </button>
              <button
                type="button"
                onClick={() => generateAiSuggestion()}
                className="bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold border border-purple-200 rounded px-2.5 py-1 flex items-center gap-1 whitespace-nowrap transition"
              >
                <Sparkles className="w-3 h-3 text-purple-600" />
                Sugestão IA
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

    </div>
  );
};
