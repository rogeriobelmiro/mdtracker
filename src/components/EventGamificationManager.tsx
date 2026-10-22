import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Play, 
  Users, 
  QrCode, 
  ExternalLink, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  Gift, 
  BarChart3, 
  MessageSquare, 
  Layers, 
  Settings2, 
  Download, 
  RefreshCw, 
  Copy, 
  Check, 
  Flame, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  ChevronRight, 
  ChevronUp, 
  ChevronDown, 
  X, 
  Monitor, 
  Smartphone, 
  Radio, 
  Award, 
  Share2, 
  ThumbsUp, 
  FileSpreadsheet, 
  Search,
  Dice5,
  Volume2,
  VolumeX,
  Maximize2
} from 'lucide-react';
import { 
  Company, 
  GamificationEvent, 
  GamificationActivity, 
  GamificationActivityType, 
  GamificationParticipant, 
  GamificationResponse 
} from '../types';
import { 
  fetchGamificationEvents, 
  fetchGamificationEventDetails, 
  createGamificationEvent, 
  updateGamificationEvent, 
  deleteGamificationEvent, 
  addGamificationActivity, 
  updateGamificationActivity, 
  deleteGamificationActivity, 
  setActiveGamificationActivity, 
  triggerLuckyDraw, 
  resetGamificationResponses, 
  exportGamificationLeadsToCRM 
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';

interface EventGamificationManagerProps {
  currentCompany: Company;
}

export const EventGamificationManager: React.FC<EventGamificationManagerProps> = ({ currentCompany }) => {
  const { alert, confirm } = useDialog();

  const [events, setEvents] = useState<GamificationEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Partial<GamificationEvent> | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<'settings' | 'activities' | 'leads'>('activities');
  const [isSaving, setIsSaving] = useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [expandedActivityId, setExpandedActivityId] = useState<string | null>(null);

  // Presenter Remote Modal State
  const [isRemoteOpen, setIsRemoteOpen] = useState(false);
  const [remoteEvent, setRemoteEvent] = useState<(GamificationEvent & { activities: GamificationActivity[]; participants: GamificationParticipant[]; responses: GamificationResponse[] }) | null>(null);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [spinningWinner, setSpinningWinner] = useState<GamificationParticipant | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Load Events
  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await fetchGamificationEvents(currentCompany.id);
      setEvents(data);
    } catch (err: any) {
      console.error('Erro ao carregar eventos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [currentCompany.id]);

  // Open Editor
  const handleOpenNewEvent = () => {
    const defaultSlug = 'evento-' + Math.floor(1000 + Math.random() * 9000);
    const defaultPin = Math.floor(1000 + Math.random() * 9000).toString();
    setEditingEvent({
      companyId: currentCompany.id,
      title: 'Minha Palestra Interativa & Gamificação',
      slug: defaultSlug,
      pinCode: defaultPin,
      description: 'Participe ao vivo pelo celular, vote nas enquetes e concorra a prêmios!',
      status: 'live',
      requirePhone: true,
      requireEmail: false,
      requireCompany: false,
      theme: {
        primaryColor: '#8b5cf6',
        backgroundColor: '#1e1b4b',
        accentColor: '#06b6d4',
        fontFamily: 'Inter'
      },
      settings: {
        allowAnonymous: false,
        showLiveCount: true,
        enableSounds: true
      },
      activities: [
        {
          id: 'act-' + Date.now() + '-1',
          eventId: '',
          type: 'word_cloud',
          title: 'Em 1 palavra, qual é o maior desafio do seu time hoje?',
          subtitle: 'Envie suas palavras pelo celular e veja a nuvem se formar no telão!',
          orderIndex: 0,
          status: 'active'
        },
        {
          id: 'act-' + Date.now() + '-2',
          eventId: '',
          type: 'multiple_choice',
          title: 'Qual canal de aquisição gera o maior retorno no seu negócio?',
          subtitle: 'Selecione a opção no seu celular',
          orderIndex: 1,
          status: 'pending',
          options: [
            { id: 'opt1', text: 'WhatsApp Direto', color: '#10b981' },
            { id: 'opt2', text: 'Tráfego Pago (Meta / Google)', color: '#3b82f6' },
            { id: 'opt3', text: 'Indicação de Clientes', color: '#f59e0b' },
            { id: 'opt4', text: 'Outbound / Prospecção Ativa', color: '#8b5cf6' }
          ]
        },
        {
          id: 'act-' + Date.now() + '-3',
          eventId: '',
          type: 'quiz',
          title: 'Quantos minutos um lead pode esperar antes de que a chance de fechar caia 80%?',
          subtitle: 'Responda rápido para acumular mais pontos no ranking!',
          orderIndex: 2,
          status: 'pending',
          timeLimitSeconds: 20,
          points: 150,
          correctOptionId: 'qopt1',
          options: [
            { id: 'qopt1', text: 'Até 5 minutos (Correta)', isCorrect: true, color: '#10b981' },
            { id: 'qopt2', text: 'Até 30 minutos', isCorrect: false, color: '#ef4444' },
            { id: 'qopt3', text: 'Até 2 horas', isCorrect: false, color: '#f59e0b' },
            { id: 'qopt4', text: 'Até 24 horas', isCorrect: false, color: '#6366f1' }
          ]
        },
        {
          id: 'act-' + Date.now() + '-4',
          eventId: '',
          type: 'lucky_draw',
          title: 'Sorteio de Encerramento: Mentoria Individual com Especialista',
          subtitle: 'Todos os participantes cadastrados estão concorrendo automaticamente!',
          orderIndex: 3,
          status: 'pending'
        },
        {
          id: 'act-' + Date.now() + '-5',
          eventId: '',
          type: 'ranking',
          title: 'Pódio & Placar Final dos Líderes 🏆',
          subtitle: 'Confira os participantes com maior pontuação no quiz do evento',
          orderIndex: 4,
          status: 'pending'
        }
      ]
    });
    setActiveEditorTab('activities');
    setIsEditorOpen(true);
  };

  const handleEditEvent = async (event: GamificationEvent) => {
    try {
      const details = await fetchGamificationEventDetails(event.id);
      setEditingEvent(details);
      setActiveEditorTab('activities');
      setIsEditorOpen(true);
    } catch (err: any) {
      await alert('Erro ao carregar detalhes do evento: ' + err.message);
    }
  };

  // Save Event
  const handleSaveEvent = async () => {
    if (!editingEvent || !editingEvent.title?.trim()) {
      await alert('Por favor, informe o título do evento.');
      return;
    }

    try {
      setIsSaving(true);
      if (editingEvent.id) {
        await updateGamificationEvent(editingEvent.id, editingEvent);
      } else {
        await createGamificationEvent(editingEvent);
      }
      setIsEditorOpen(false);
      await loadEvents();
      await alert('Evento salvo com sucesso!');
    } catch (err: any) {
      await alert('Erro ao salvar evento: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (id: string, title: string) => {
    const ok = await confirm(`Tem certeza que deseja excluir o evento "${title}"? Todas as dinâmicas e participações serão removidas.`);
    if (!ok) return;

    try {
      await deleteGamificationEvent(id);
      await loadEvents();
    } catch (err: any) {
      await alert('Erro ao excluir evento: ' + err.message);
    }
  };

  // Open Remote Control
  const handleOpenRemote = async (eventId: string) => {
    try {
      setRemoteLoading(true);
      setIsRemoteOpen(true);
      const details = await fetchGamificationEventDetails(eventId);
      setRemoteEvent(details);
    } catch (err: any) {
      await alert('Erro ao abrir controle remoto: ' + err.message);
      setIsRemoteOpen(false);
    } finally {
      setRemoteLoading(false);
    }
  };

  // Switch Active Activity from Remote or Editor
  const handleSwitchActivity = async (eventId: string, activityId: string | null) => {
    try {
      await setActiveGamificationActivity(eventId, activityId);
      if (remoteEvent && remoteEvent.id === eventId) {
        const updated = await fetchGamificationEventDetails(eventId);
        setRemoteEvent(updated);
      }
      if (editingEvent && editingEvent.id === eventId) {
        setEditingEvent({ ...editingEvent, currentActivityId: activityId || undefined });
      }
      await loadEvents();
    } catch (err: any) {
      await alert('Erro ao mudar dinâmica ativa: ' + err.message);
    }
  };

  // Trigger Lucky Draw
  const handleLuckyDraw = async (eventId: string) => {
    try {
      setIsSpinning(true);
      setSpinningWinner(null);
      const res = await triggerLuckyDraw(eventId);
      setTimeout(() => {
        setSpinningWinner(res.winner);
        setIsSpinning(false);
      }, 2500);
    } catch (err: any) {
      setIsSpinning(false);
      await alert('Erro ao sortear: ' + err.message);
    }
  };

  // Export Leads to CRM
  const handleExportLeads = async (eventId: string) => {
    try {
      const res = await exportGamificationLeadsToCRM(eventId);
      await alert(`🎉 ${res.importedCount} leads foram importados com sucesso para a base de Leads e CRM do MDTracker!`);
    } catch (err: any) {
      await alert('Erro ao exportar leads: ' + err.message);
    }
  };

  // Copy PIN or URL
  const handleCopyLink = async (url: string, pin: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedPin(pin);
      setTimeout(() => setCopiedPin(null), 2500);
    } catch {}
  };

  // Add Activity helper
  const handleAddActivity = (type: GamificationActivityType) => {
    if (!editingEvent) return;
    const order = (editingEvent.activities?.length || 0);
    const newId = 'act-' + Date.now();

    let newAct: GamificationActivity = {
      id: newId,
      eventId: editingEvent.id || '',
      type,
      title: 'Nova Dinâmica',
      orderIndex: order,
      status: 'pending'
    };

    switch (type) {
      case 'word_cloud':
        newAct.title = 'Em 1 palavra, o que você espera levar deste evento?';
        newAct.subtitle = 'Envie até 3 palavras pelo seu celular';
        break;
      case 'multiple_choice':
        newAct.title = 'Qual das opções melhor descreve sua principal meta este ano?';
        newAct.subtitle = 'Vote em tempo real pelo celular';
        newAct.options = [
          { id: 'opt1', text: 'Aumentar faturamento em 50%+', color: '#10b981' },
          { id: 'opt2', text: 'Reduzir custo por lead (CPL)', color: '#3b82f6' },
          { id: 'opt3', text: 'Automatizar atendimento no WhatsApp', color: '#f59e0b' },
          { id: 'opt4', text: 'Contratar e estruturar time comercial', color: '#8b5cf6' }
        ];
        break;
      case 'quiz':
        newAct.title = 'Pergunta de Alta Conversão: Qual o melhor momento para enviar o follow-up?';
        newAct.subtitle = 'Responda rápido para ganhar mais pontos no placar!';
        newAct.timeLimitSeconds = 20;
        newAct.points = 100;
        newAct.correctOptionId = 'q1';
        newAct.options = [
          { id: 'q1', text: 'Em até 10 minutos após o interesse (Correta)', isCorrect: true, color: '#10b981' },
          { id: 'q2', text: 'No dia seguinte', isCorrect: false, color: '#ef4444' },
          { id: 'q3', text: 'Após 3 dias', isCorrect: false, color: '#f59e0b' },
          { id: 'q4', text: 'Somente se o cliente mandar mensagem', isCorrect: false, color: '#6366f1' }
        ];
        break;
      case 'qa':
        newAct.title = 'Mural de Perguntas: Deixe sua dúvida para o Palestrante';
        newAct.subtitle = 'As dúvidas mais votadas pela plateia serão respondidas no telão!';
        break;
      case 'lucky_draw':
        newAct.title = 'Sorteio Oficial da Palestra: Mentoria Exclusiva';
        newAct.subtitle = 'Todos os participantes com celular conectado estão concorrendo!';
        break;
      case 'true_false':
        newAct.title = 'Verdadeiro ou Falso: Leads atendidos em menos de 5 minutos convertem 21x mais.';
        newAct.subtitle = 'Selecione sua resposta no celular';
        newAct.correctOptionId = 'tf1';
        newAct.options = [
          { id: 'tf1', text: 'Verdadeiro (Comprovado por pesquisa da Harvard)', isCorrect: true, color: '#10b981' },
          { id: 'tf2', text: 'Falso', isCorrect: false, color: '#ef4444' }
        ];
        break;
      case 'ranking':
        newAct.title = 'Placar Geral dos Líderes & Pódio 🏆';
        newAct.subtitle = 'Conheça os participantes com maior pontuação nas dinâmicas';
        break;
      default:
        break;
    }

    const updated = [...(editingEvent.activities || []), newAct];
    setEditingEvent({ ...editingEvent, activities: updated });
    setIsAddActivityModalOpen(false);
    setExpandedActivityId(newId);
  };

  const filteredEvents = useMemo(() => {
    return events.filter(e => 
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.pinCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [events, searchQuery]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Hero Header */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-purple-800/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/30 mb-4 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Eventos Ao Vivo & Gamificação com Telão</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2">
              Engaje a Plateia, Projete no Telão & Capture Leads no Celular
            </h1>
            <p className="text-sm sm:text-base text-purple-200/80 leading-relaxed font-normal">
              Crie dinâmicas interativas ao vivo (Nuvem de Palavras, Quizzes, Votações e Sorteios) com sincronização em tempo real. Os participantes entram pelo QR Code ou PIN e seus dados são salvos no cache para participarem de todas as rodadas sem redigitação.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={handleOpenNewEvent}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-600 hover:from-purple-400 hover:to-indigo-400 text-white font-bold px-6 py-3.5 rounded-2xl shadow-xl shadow-purple-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Criar Novo Evento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, slug ou PIN..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-hidden transition"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{events.length} {events.length === 1 ? 'evento cadastrado' : 'eventos cadastrados'}</span>
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">Carregando eventos interativos...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">Nenhum evento encontrado</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Crie sua primeira sessão interativa para palestras, workshops e eventos com apresentação no telão e votação pelo celular.
          </p>
          <button
            onClick={handleOpenNewEvent}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs inline-flex items-center gap-2 shadow-md shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Meu Primeiro Evento</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map(event => {
            const publicUrl = `${window.location.origin}/evento/${event.slug}`;
            const telaoUrl = `${window.location.origin}/telao/${event.slug}`;
            const activeActivity = event.activities?.find(a => a.id === event.currentActivityId) || event.activities?.[0];

            return (
              <div 
                key={event.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-200/40 p-6 flex flex-col justify-between hover:border-purple-300 hover:shadow-xl transition group relative overflow-hidden"
              >
                <div>
                  {/* Top Bar: Badges & Status */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                        <Radio className="w-3.5 h-3.5 text-purple-600 animate-pulse" />
                        <span>PIN: {event.pinCode}</span>
                      </span>
                      <span className="text-xs font-medium text-slate-400">
                        /evento/{event.slug}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {event.status === 'live' ? '🟢 Ao Vivo' : event.status === 'draft' ? '🟡 Rascunho' : '⚪ Encerrado'}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-purple-600 transition mb-1.5">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                      {event.description}
                    </p>
                  )}

                  {/* Metrics & Current Dynamic */}
                  <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-5 text-center">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Participantes</span>
                      <span className="text-base sm:text-lg font-black text-slate-900">{event.participantsCount || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Dinâmicas</span>
                      <span className="text-base sm:text-lg font-black text-purple-600">{event.activities?.length || 0}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Ativa no Telão</span>
                      <span className="text-xs font-bold text-emerald-600 truncate block mt-1">
                        {activeActivity ? (
                          activeActivity.type === 'word_cloud' ? '☁️ Nuvem' :
                          activeActivity.type === 'quiz' ? '⏱️ Quiz' :
                          activeActivity.type === 'multiple_choice' ? '📊 Enquete' :
                          activeActivity.type === 'lucky_draw' ? '🎰 Sorteio' :
                          activeActivity.type === 'qa' ? '💬 Q&A' :
                          activeActivity.type === 'ranking' ? '🏆 Pódio' : '⚡ Ativa'
                        ) : 'Nenhuma'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-2">
                    <a
                      href={telaoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="bg-purple-900 hover:bg-purple-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-purple-900/20 transition"
                    >
                      <Monitor className="w-3.5 h-3.5 text-purple-300" />
                      <span>Abrir Telão 🖥️</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleOpenRemote(event.id)}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Controle Ao Vivo 📱</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyLink(publicUrl, event.pinCode)}
                        className="text-slate-600 hover:text-purple-600 flex items-center gap-1 font-semibold p-1 hover:bg-slate-100 rounded-lg transition"
                        title="Copiar Link dos Participantes"
                      >
                        {copiedPin === event.pinCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPin === event.pinCode ? 'Copiado!' : 'Copiar Link Celular'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExportLeads(event.id)}
                        className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold p-1 hover:bg-emerald-50 rounded-lg transition"
                        title="Exportar Leads para o CRM"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Exportar Leads</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditEvent(event)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                        title="Editar Evento"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(event.id, event.title)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir Evento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* EVENT EDITOR MODAL                                        */}
      {/* ========================================================= */}
      {isEditorOpen && editingEvent && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-scale-in">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingEvent.id ? 'Editar Evento Interativo' : 'Criar Novo Evento com Telão & Gamificação'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure as dinâmicas, regras de captura de leads e identidade visual</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveEvent}
                  disabled={isSaving}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-purple-500/20 disabled:opacity-50 transition"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  <span>Salvar Evento</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-6 border-b border-slate-200 flex items-center gap-6 text-xs font-semibold bg-white shrink-0">
              <button
                type="button"
                onClick={() => setActiveEditorTab('activities')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition ${
                  activeEditorTab === 'activities'
                    ? 'border-purple-600 text-purple-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Dinâmicas da Apresentação ({editingEvent.activities?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveEditorTab('settings')}
                className={`py-3.5 border-b-2 flex items-center gap-2 transition ${
                  activeEditorTab === 'settings'
                    ? 'border-purple-600 text-purple-600 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Settings2 className="w-4 h-4" />
                <span>Configurações & Captura de Leads</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* TAB 1: ACTIVITIES BUILDER */}
              {activeEditorTab === 'activities' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Roteiro de Dinâmicas do Telão</h4>
                      <p className="text-xs text-slate-500">Adicione as atividades na ordem em que serão apresentadas durante a palestra</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddActivityModalOpen(true)}
                      className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Adicionar Dinâmica</span>
                    </button>
                  </div>

                  {/* List of Activities */}
                  <div className="space-y-3">
                    {(editingEvent.activities || []).map((activity, idx) => {
                      const isExpanded = expandedActivityId === activity.id;
                      const isActiveOnStage = editingEvent.currentActivityId === activity.id;

                      const typeIcons: Record<string, any> = {
                        word_cloud: { icon: '☁️', label: 'Nuvem de Palavras', bg: 'bg-indigo-50 text-indigo-700' },
                        multiple_choice: { icon: '📊', label: 'Múltipla Escolha', bg: 'bg-blue-50 text-blue-700' },
                        quiz: { icon: '⏱️', label: 'Quiz Competitivo', bg: 'bg-amber-50 text-amber-700' },
                        qa: { icon: '💬', label: 'Pergunte ao Palestrante', bg: 'bg-emerald-50 text-emerald-700' },
                        lucky_draw: { icon: '🎰', label: 'Sorteio de Participantes', bg: 'bg-rose-50 text-rose-700' },
                        true_false: { icon: '⚖️', label: 'Verdadeiro ou Falso', bg: 'bg-cyan-50 text-cyan-700' },
                        ranking: { icon: '🏆', label: 'Pódio dos Líderes', bg: 'bg-purple-50 text-purple-700' }
                      };
                      const typeInfo = typeIcons[activity.type] || { icon: '⚡', label: 'Dinâmica', bg: 'bg-slate-50 text-slate-700' };

                      return (
                        <div 
                          key={activity.id}
                          className={`rounded-2xl border transition overflow-hidden bg-white ${
                            isActiveOnStage ? 'border-2 border-purple-500 shadow-md' : 'border-slate-200'
                          }`}
                        >
                          <div className="p-4 flex items-center justify-between gap-3 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-lg bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="text-xl">{typeInfo.icon}</span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${typeInfo.bg}`}>
                                    {typeInfo.label}
                                  </span>
                                  {isActiveOnStage && (
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                      🟢 Ativa no Telão
                                    </span>
                                  )}
                                </div>
                                <h5 className="font-bold text-xs sm:text-sm text-slate-900 mt-0.5">{activity.title}</h5>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Set Active Button */}
                              <button
                                type="button"
                                onClick={() => handleSwitchActivity(editingEvent.id || '', activity.id)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                  isActiveOnStage 
                                    ? 'bg-purple-600 text-white shadow-xs' 
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                {isActiveOnStage ? 'No Telão' : 'Projetar'}
                              </button>

                              <button
                                type="button"
                                onClick={() => setExpandedActivityId(isExpanded ? null : activity.id)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingEvent.activities || []).filter(a => a.id !== activity.id);
                                  setEditingEvent({ ...editingEvent, activities: updated });
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Expanded Activity Editor */}
                          {isExpanded && (
                            <div className="p-4 border-t border-slate-100 space-y-3 bg-white text-xs">
                              <div>
                                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                  Pergunta / Título no Telão *
                                </label>
                                <input
                                  type="text"
                                  value={activity.title}
                                  onChange={e => {
                                    const updated = (editingEvent.activities || []).map(a => 
                                      a.id === activity.id ? { ...a, title: e.target.value } : a
                                    );
                                    setEditingEvent({ ...editingEvent, activities: updated });
                                  }}
                                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                                />
                              </div>

                              <div>
                                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                                  Subtítulo / Instrução para o Celular
                                </label>
                                <input
                                  type="text"
                                  value={activity.subtitle || ''}
                                  onChange={e => {
                                    const updated = (editingEvent.activities || []).map(a => 
                                      a.id === activity.id ? { ...a, subtitle: e.target.value } : a
                                    );
                                    setEditingEvent({ ...editingEvent, activities: updated });
                                  }}
                                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                                />
                              </div>

                              {/* Quiz Options and Timer */}
                              {(activity.type === 'quiz' || activity.type === 'multiple_choice' || activity.type === 'true_false') && (
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-slate-700 uppercase tracking-wider">
                                      Opções de Resposta
                                    </span>
                                    {activity.type === 'quiz' && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] text-slate-500">Tempo limite:</span>
                                        <select
                                          value={activity.timeLimitSeconds || 20}
                                          onChange={e => {
                                            const updated = (editingEvent.activities || []).map(a => 
                                              a.id === activity.id ? { ...a, timeLimitSeconds: Number(e.target.value) } : a
                                            );
                                            setEditingEvent({ ...editingEvent, activities: updated });
                                          }}
                                          className="px-2 py-1 border border-slate-300 rounded-lg text-xs"
                                        >
                                          <option value={15}>15 segundos</option>
                                          <option value={20}>20 segundos</option>
                                          <option value={30}>30 segundos</option>
                                          <option value={45}>45 segundos</option>
                                          <option value={60}>60 segundos</option>
                                        </select>
                                      </div>
                                    )}
                                  </div>

                                  {(activity.options || []).map((opt, oIdx) => (
                                    <div key={opt.id} className="flex items-center gap-2">
                                      {activity.type === 'quiz' && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = (editingEvent.activities || []).map(a => {
                                              if (a.id !== activity.id) return a;
                                              const opts = (a.options || []).map(o => ({ ...o, isCorrect: o.id === opt.id }));
                                              return { ...a, options: opts, correctOptionId: opt.id };
                                            });
                                            setEditingEvent({ ...editingEvent, activities: updated });
                                          }}
                                          className={`p-1.5 rounded-lg text-xs font-bold transition ${
                                            opt.isCorrect 
                                              ? 'bg-emerald-600 text-white' 
                                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                          }`}
                                          title="Marcar como Resposta Correta"
                                        >
                                          <Check className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                      <input
                                        type="text"
                                        value={opt.text}
                                        onChange={e => {
                                          const updated = (editingEvent.activities || []).map(a => {
                                            if (a.id !== activity.id) return a;
                                            const opts = (a.options || []).map((o, idx2) => 
                                              idx2 === oIdx ? { ...o, text: e.target.value } : o
                                            );
                                            return { ...a, options: opts };
                                          });
                                          setEditingEvent({ ...editingEvent, activities: updated });
                                        }}
                                        className="flex-1 px-3 py-1.5 border border-slate-300 rounded-xl text-xs"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: SETTINGS & LEAD CAPTURE */}
              {activeEditorTab === 'settings' && (
                <div className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        Título do Evento / Palestra *
                      </label>
                      <input
                        type="text"
                        value={editingEvent.title}
                        onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })}
                        placeholder="Ex: Imersão Growth 2026"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                        PIN de Acesso Rápido *
                      </label>
                      <input
                        type="text"
                        value={editingEvent.pinCode}
                        onChange={e => setEditingEvent({ ...editingEvent, pinCode: e.target.value.toUpperCase() })}
                        placeholder="Ex: 8821 ou GROWTH"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl uppercase font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Slug da URL Pública
                    </label>
                    <div className="flex items-center">
                      <span className="px-3.5 py-2.5 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-slate-500 font-mono">
                        {window.location.origin}/evento/
                      </span>
                      <input
                        type="text"
                        value={editingEvent.slug}
                        onChange={e => setEditingEvent({ ...editingEvent, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-r-xl font-mono"
                      />
                    </div>
                  </div>

                  {/* Lead Capture Rules */}
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-3">
                    <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                      <Smartphone className="w-4 h-4 text-purple-600" />
                      <span>Regras de Cadastro do Participante (Cache & Lead Capture)</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed text-xs">
                      O ouvinte preenche estes dados apenas na primeira dinâmica. O sistema salva automaticamente no <code className="bg-purple-100 text-purple-800 px-1 rounded">localStorage</code> do navegador dele, reconhecendo-o nas rodadas seguintes sem nenhuma digitação.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <label className="flex items-center gap-2 p-3 rounded-xl bg-white border border-purple-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingEvent.requirePhone}
                          onChange={e => setEditingEvent({ ...editingEvent, requirePhone: e.target.checked })}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="font-semibold text-slate-800">Exigir WhatsApp *</span>
                      </label>

                      <label className="flex items-center gap-2 p-3 rounded-xl bg-white border border-purple-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingEvent.requireEmail}
                          onChange={e => setEditingEvent({ ...editingEvent, requireEmail: e.target.checked })}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="font-semibold text-slate-800">Exigir E-mail</span>
                      </label>

                      <label className="flex items-center gap-2 p-3 rounded-xl bg-white border border-purple-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editingEvent.requireCompany}
                          onChange={e => setEditingEvent({ ...editingEvent, requireCompany: e.target.checked })}
                          className="w-4 h-4 text-purple-600 rounded"
                        />
                        <span className="font-semibold text-slate-800">Exigir Empresa / Cargo</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Link do Material / Slides para Entrega aos Participantes (Opcional)
                    </label>
                    <input
                      type="url"
                      value={editingEvent.leadMagnetUrl || ''}
                      onChange={e => setEditingEvent({ ...editingEvent, leadMagnetUrl: e.target.value })}
                      placeholder="https://suaempresa.com.br/slides-palestra.pdf"
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl"
                    />
                  </div>

                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD ACTIVITY MODAL (9 Gamification Options)               */}
      {/* ========================================================= */}
      {isAddActivityModalOpen && (
        <div className="fixed inset-0 z-70 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Adicionar Dinâmica Interativa</h3>
                  <p className="text-xs text-slate-500">Escolha o formato da interação para projetar no telão</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddActivityModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              {[
                { type: 'word_cloud' as const, icon: '☁️', title: 'Nuvem de Palavras', desc: 'As palavras mais digitadas crescem dinamicamente no telão' },
                { type: 'multiple_choice' as const, icon: '📊', title: 'Múltipla Escolha / Enquete', desc: 'Gráficos de barras em porcentagem subindo em tempo real' },
                { type: 'quiz' as const, icon: '⏱️', title: 'Quiz Competitivo', desc: 'Perguntas com contagem regressiva, pontos por velocidade e ranking' },
                { type: 'lucky_draw' as const, icon: '🎰', title: 'Sorteio de Participantes', desc: 'Roleta animada com o nome de todos os presentes na palestra' },
                { type: 'qa' as const, icon: '💬', title: 'Pergunte ao Instrutor (Q&A)', desc: 'Mural de dúvidas com upvotes da plateia para as mais votadas' },
                { type: 'true_false' as const, icon: '⚖️', title: 'Verdadeiro ou Falso', desc: 'Batalha rápida de 2 botões com percentual de acerto instantâneo' },
                { type: 'ranking' as const, icon: '🏆', title: 'Placar Geral & Pódio', desc: 'Revelação dos vencedores do evento com animação comemorativa' }
              ].map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleAddActivity(item.type)}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 transition text-left flex items-start gap-3 group"
                >
                  <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-purple-600 transition">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PRESENTER REMOTE CONTROL MODAL (Ao Vivo)                  */}
      {/* ========================================================= */}
      {isRemoteOpen && remoteEvent && (
        <div className="fixed inset-0 z-70 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
          <div className="bg-slate-900 text-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-purple-800/80 animate-scale-in space-y-6">
            
            {/* Remote Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
                  <Smartphone className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Controle do Apresentador</span>
                  <h3 className="text-base font-bold text-white">{remoteEvent.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setIsRemoteOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stage Status Card */}
            <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Dinâmica Ativa no Telão:</span>
                <span className="text-sm font-bold text-cyan-300">
                  {remoteEvent.activities?.find(a => a.id === remoteEvent.currentActivityId)?.title || 'Nenhuma selecionada'}
                </span>
              </div>
              <a
                href={`${window.location.origin}/telao/${remoteEvent.slug}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-xs"
              >
                <span>Ver Telão</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Quick Switch Activities List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Mudar Dinâmica no Telão (Atualiza Celulares na Hora):
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(remoteEvent.activities || []).map((activity, idx) => {
                  const isActive = remoteEvent.currentActivityId === activity.id;
                  return (
                    <button
                      key={activity.id}
                      type="button"
                      onClick={() => handleSwitchActivity(remoteEvent.id, activity.id)}
                      className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition ${
                        isActive 
                          ? 'bg-purple-600/30 border-purple-500 text-white font-bold' 
                          : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="text-xs font-mono opacity-60">#{idx + 1}</span>
                        <span className="text-xs truncate">{activity.title}</span>
                      </div>
                      {isActive && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Ao Vivo
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage Quick Triggers */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleLuckyDraw(remoteEvent.id)}
                disabled={isSpinning}
                className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
              >
                <Dice5 className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'Sorteando...' : 'Sortear Ganhador 🎰'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportLeads(remoteEvent.id)}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Exportar Leads ({remoteEvent.participants?.length || 0})</span>
              </button>
            </div>

            {/* Lucky Draw Winner Announcement */}
            {spinningWinner && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-400/40 text-center animate-scale-in">
                <span className="text-2xl mb-1 block">🎉</span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">Ganhador do Sorteio:</span>
                <h4 className="text-lg font-black text-white">{spinningWinner.name}</h4>
                {spinningWinner.phone && (
                  <p className="text-xs text-slate-300 font-mono mt-0.5">WhatsApp: {spinningWinner.phone}</p>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
