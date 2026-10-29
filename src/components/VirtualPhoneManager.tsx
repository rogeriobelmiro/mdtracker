import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Phone, PhoneCall, PhoneForwarded, Mic, Volume2, Play, Pause, 
  RotateCcw, Sparkles, Filter, Search, Download, Trash2, Calendar, 
  Clock, User, CheckCircle2, AlertCircle, TrendingUp, Settings, 
  ArrowUpRight, MessageSquare, ShieldCheck, ChevronRight, BarChart3,
  Layers, RefreshCw
} from 'lucide-react';
import { Lead, LeadCall, CallOutcome, FunnelStage, Company, User as UserType, VirtualPhoneSettings } from '../types';
import { 
  fetchLeadCalls, deleteLeadCall, transcribeLeadCallAI, 
  fetchVirtualPhoneSettings, updateVirtualPhoneSettings 
} from '../services/api';

interface VirtualPhoneManagerProps {
  leads: Lead[];
  currentCompany: Company | null;
  currentUser: UserType | null;
  onInitiateCall: (lead: { id: string; name: string; phone: string }) => void;
  onOpenWhatsApp?: (leadId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const VirtualPhoneManager: React.FC<VirtualPhoneManagerProps> = ({
  leads,
  currentCompany,
  currentUser,
  onInitiateCall,
  onOpenWhatsApp,
  onNavigateToTab
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'leads_call' | 'analytics' | 'settings'>('history');
  const [calls, setCalls] = useState<LeadCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  
  // Audio Player State
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // AI Transcribe Loading States
  const [transcribingCallIds, setTranscribingCallIds] = useState<Record<string, boolean>>({});

  // Virtual Phone Settings State
  const [settings, setSettings] = useState<VirtualPhoneSettings>({
    provider: 'webrtc_native',
    callerIdNumber: '(11) 4003-8920',
    callerIdName: 'Alfa Marketing - Discador WebRTC',
    recordCalls: true,
    autoTranscribeAI: true,
    agentExtension: '104'
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Load Calls & Settings
  const loadData = async () => {
    setIsLoading(true);
    try {
      const companyId = currentCompany?.id || 'comp-alfa';
      const [callsData, settingsData] = await Promise.all([
        fetchLeadCalls(companyId),
        fetchVirtualPhoneSettings(companyId)
      ]);
      setCalls(callsData);
      if (settingsData) setSettings(settingsData);
    } catch (err) {
      console.error('Erro ao carregar dados de telefonia:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCompany?.id]);

  // Audio Playback Handling
  const handleTogglePlay = (call: LeadCall) => {
    if (!call.recordingUrl) return;

    if (playingCallId === call.id) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
          setPlayingCallId(null);
        }
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(call.recordingUrl);
      audio.playbackRate = playbackSpeed;
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingCallId(null);
        setPlaybackProgress(0);
      };

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setPlaybackProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.play().catch(() => {});
      setPlayingCallId(call.id);
    }
  };

  const handleChangeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  // AI Transcribe & Insights
  const handleTranscribeAI = async (call: LeadCall) => {
    setTranscribingCallIds(prev => ({ ...prev, [call.id]: true }));
    try {
      const res = await transcribeLeadCallAI(call.id, {
        notes: call.notes,
        duration: call.durationSeconds,
        leadName: call.leadName
      });

      setCalls(prev => prev.map(c => {
        if (c.id === call.id) {
          return {
            ...c,
            transcriptSummary: res.summary,
            sentiment: res.sentiment,
            nextSteps: res.nextSteps
          };
        }
        return c;
      }));
    } catch (err: any) {
      alert(err.message || 'Erro ao gerar análise com IA');
    } finally {
      setTranscribingCallIds(prev => ({ ...prev, [call.id]: false }));
    }
  };

  // Delete Call Record
  const handleDeleteCall = async (id: string) => {
    if (!confirm('Deseja realmente excluir este histórico de ligação?')) return;
    try {
      await deleteLeadCall(id);
      setCalls(prev => prev.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir chamada');
    }
  };

  // Save Settings
  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsSuccess(false);
    try {
      const companyId = currentCompany?.id || 'comp-alfa';
      await updateVirtualPhoneSettings(companyId, settings);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Format Helpers
  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s.toString().padStart(2, '0')}s`;
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(d);
    } catch {
      return iso;
    }
  };

  const getOutcomeBadge = (outcome: CallOutcome) => {
    switch (outcome) {
      case 'atendeu_positivo':
        return { label: 'Atendeu - Reunião Agendada', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'atendeu_objecao':
        return { label: 'Atendeu - Em Negociação', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'retornar_depois':
        return { label: 'Pediu para Retornar', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'nao_atendeu':
        return { label: 'Não Atendeu / Chamou', bg: 'bg-orange-50 text-orange-700 border-orange-200' };
      case 'ocupado':
        return { label: 'Ocupado', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'caixa_postal':
        return { label: 'Caixa Postal', bg: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
      case 'invalido':
        return { label: 'Número Inválido', bg: 'bg-red-50 text-red-700 border-red-200' };
      default:
        return { label: outcome, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  // Filtered Calls
  const filteredCalls = useMemo(() => {
    return calls.filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        (c.leadName || '').toLowerCase().includes(q) ||
        (c.leadPhone || '').includes(q) ||
        (c.userName || '').toLowerCase().includes(q) ||
        (c.notes || '').toLowerCase().includes(q);
      
      const matchesOutcome = outcomeFilter === 'all' || c.outcome === outcomeFilter;
      return matchesSearch && matchesOutcome;
    });
  }, [calls, searchQuery, outcomeFilter]);

  // KPIs
  const totalCallsCount = calls.length;
  const totalDurationSeconds = calls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
  const answeredCallsCount = calls.filter(c => c.outcome === 'atendeu_positivo' || c.outcome === 'atendeu_objecao' || c.outcome === 'retornar_depois').length;
  const effectiveContactRate = totalCallsCount > 0 ? Math.round((answeredCallsCount / totalCallsCount) * 100) : 0;
  const positiveDealsCount = calls.filter(c => c.outcome === 'atendeu_positivo').length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Telefone Virtual & Softphone WebRTC Ativo
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Central de Telefonia Comercial (VoIP)
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Ligue para seus leads com 1 clique direto pelo navegador, grave cada ligação, registre anotações no CRM e analise transcrições com inteligência artificial.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-2.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {settings.agentExtension || '104'}
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Ramal Ativo</p>
                <p className="text-xs font-bold text-white">{currentUser?.name || 'Lucas Atendente'}</p>
              </div>
            </div>

            <button
              onClick={() => {
                if (leads.length > 0) {
                  onInitiateCall({ id: leads[0].id, name: leads[0].name, phone: leads[0].phone || '' });
                }
              }}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <PhoneCall className="w-4 h-4 fill-current" />
              Abrir Discador
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Ligações</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totalCallsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Disparadas pelo CRM</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tempo Total Falado</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatSeconds(totalDurationSeconds)}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Média de {totalCallsCount > 0 ? formatSeconds(Math.round(totalDurationSeconds / totalCallsCount)) : '0s'} por chamada
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Taxa de Contato Efetivo</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{effectiveContactRate}%</p>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 mt-1 font-semibold">
            {answeredCallsCount} de {totalCallsCount} ligações atendidas
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reuniões / Positivos</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{positiveDealsCount}</p>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-1 font-semibold">
            Leads qualificados para fechamento
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Phone className="w-4 h-4" />
          Histórico de Ligações ({calls.length})
        </button>

        <button
          onClick={() => setActiveTab('leads_call')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'leads_call'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <PhoneForwarded className="w-4 h-4" />
          Fila de Ligações / Leads do CRM ({leads.filter(l => l.phone).length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Métricas & Relatórios
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          Configurações VoIP & BINA
        </button>
      </div>

      {/* TAB 1: HISTÓRICO DE LIGAÇÕES */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por lead, telefone ou anotações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Desfecho:</span>
              </div>
              <select
                value={outcomeFilter}
                onChange={(e) => setOutcomeFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold px-3 py-2 focus:outline-none"
              >
                <option value="all">Todos os Desfechos</option>
                <option value="atendeu_positivo">Atendeu - Positivo / Reunião</option>
                <option value="atendeu_objecao">Atendeu - Negociação</option>
                <option value="retornar_depois">Pediu para Retornar</option>
                <option value="nao_atendeu">Não Atendeu / Chamou</option>
                <option value="ocupado">Ocupado</option>
                <option value="caixa_postal">Caixa Postal</option>
              </select>

              <button
                onClick={loadData}
                className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Recarregar histórico"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calls List */}
          {isLoading ? (
            <div className="py-16 text-center text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm">Carregando histórico de ligações...</p>
            </div>
          ) : filteredCalls.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
              <Phone className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Nenhuma chamada encontrada</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Use o botão &quot;Ligar&quot; nos cards do CRM para realizar sua primeira chamada VoIP com gravação automática.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCalls.map(call => {
                const badge = getOutcomeBadge(call.outcome);
                const isPlaying = playingCallId === call.id;
                const isTranscribing = !!transcribingCallIds[call.id];

                return (
                  <div 
                    key={call.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition space-y-4"
                  >
                    {/* Call Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200 dark:border-slate-700">
                          {call.leadName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{call.leadName}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.bg}`}>
                              {badge.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                            <span className="font-mono">{call.leadPhone}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {formatSeconds(call.durationSeconds)}
                            </span>
                            <span>•</span>
                            <span>{formatDate(call.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          onClick={() => onInitiateCall({ id: call.leadId, name: call.leadName, phone: call.leadPhone })}
                          className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                          title="Ligar novamente"
                        >
                          <Phone className="w-3.5 h-3.5 fill-current" />
                          <span>Ligar</span>
                        </button>

                        {onOpenWhatsApp && (
                          <button
                            onClick={() => onOpenWhatsApp(call.leadId)}
                            className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 p-1.5 rounded-xl text-xs transition"
                            title="Conversar no WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteCall(call.id)}
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-xl transition"
                          title="Excluir histórico"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Vendedor & Notes */}
                    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          Registrado por: <strong className="text-slate-700 dark:text-slate-300">{call.userName}</strong>
                        </span>
                        {call.callerId && (
                          <span className="text-[10px] text-slate-400">BINA: {call.callerId}</span>
                        )}
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 italic">
                        &quot;{call.notes || 'Sem anotações detalhadas.'}&quot;
                      </p>
                    </div>

                    {/* Audio Player & Recording Bar */}
                    {call.recordingUrl ? (
                      <div className="bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleTogglePlay(call)}
                            className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md transition"
                            title={isPlaying ? 'Pausar áudio' : 'Ouvir gravação'}
                          >
                            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                          </button>

                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>Gravação da Ligação</span>
                              {isPlaying && (
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                              )}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              Duração gravada: {formatSeconds(call.durationSeconds)}
                            </p>
                          </div>
                        </div>

                        {/* Progress Bar & Speed */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                            {[1, 1.25, 1.5].map(spd => (
                              <button
                                key={spd}
                                onClick={() => handleChangeSpeed(spd)}
                                className={`px-2 py-0.5 rounded transition ${playbackSpeed === spd ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}
                              >
                                {spd}x
                              </button>
                            ))}
                          </div>

                          <a
                            href={call.recordingUrl}
                            download={`gravacao-${call.leadName}.ogg`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-500 hover:text-blue-600 p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition"
                            title="Baixar áudio"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        Gravação indisponível para esta chamada (duração inferior a 10s ou sem áudio conectado).
                      </p>
                    )}

                    {/* AI Transcribe & Insights Box */}
                    {call.transcriptSummary ? (
                      <div className="bg-gradient-to-r from-purple-50/80 to-indigo-50/80 dark:from-purple-950/30 dark:to-indigo-950/30 border border-purple-200 dark:border-purple-900/50 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <h5 className="text-xs font-extrabold text-purple-950 dark:text-purple-200 uppercase tracking-wider">
                              Análise & Transcrição por IA (Gemini 2.5 Flash)
                            </h5>
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            call.sentiment === 'positivo' ? 'bg-emerald-100 text-emerald-800' :
                            call.sentiment === 'negativo' ? 'bg-red-100 text-red-800' :
                            'bg-slate-200 text-slate-800'
                          }`}>
                            Sentimento: {call.sentiment || 'Neutro'}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                            {call.transcriptSummary}
                          </p>
                        </div>

                        {call.nextSteps && (
                          <div className="bg-white/80 dark:bg-slate-900/60 border border-purple-200 dark:border-purple-800/50 rounded-xl p-2.5 flex items-start gap-2">
                            <span className="text-xs font-bold text-purple-700 shrink-0">🎯 Próxima Ação:</span>
                            <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{call.nextSteps}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleTranscribeAI(call)}
                          disabled={isTranscribing}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          {isTranscribing ? 'Analisando ligação com IA...' : 'Gerar Transcrição & Insights com IA'}
                        </button>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: FILA DE LIGAÇÕES / LEADS DO CRM */}
      {activeTab === 'leads_call' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Leads Prontos para Ligação Telefônica
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Lista dos contatos cadastrados no seu CRM com telefone preenchido. Clique no botão verde para ligar imediatamente pelo ramal WebRTC.
            </p>

            <div className="mt-6 space-y-2.5">
              {leads.filter(l => l.phone).map(lead => (
                <div
                  key={lead.id}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                      {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{lead.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          {lead.stage}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{lead.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onInitiateCall({ id: lead.id, name: lead.name, phone: lead.phone || '' })}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95"
                    >
                      <PhoneCall className="w-3.5 h-3.5 fill-current" />
                      Ligar Agora (Click-to-Call)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ANALYTICS & MÉTRICAS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Outcome Distribution */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                Distribuição por Desfecho da Ligação
              </h3>

              <div className="space-y-3">
                {[
                  { outcome: 'atendeu_positivo', label: 'Reunião Agendada / Positivo', color: 'bg-emerald-500' },
                  { outcome: 'atendeu_objecao', label: 'Em Negociação / Dúvidas', color: 'bg-purple-500' },
                  { outcome: 'retornar_depois', label: 'Pediu para Retornar', color: 'bg-amber-500' },
                  { outcome: 'nao_atendeu', label: 'Não Atendeu / Chamou até cair', color: 'bg-orange-500' },
                  { outcome: 'caixa_postal', label: 'Caixa Postal / Ocupado', color: 'bg-slate-400' }
                ].map(item => {
                  const count = calls.filter(c => c.outcome === item.outcome).length;
                  const pct = totalCallsCount > 0 ? Math.round((count / totalCallsCount) * 100) : 0;

                  return (
                    <div key={item.outcome} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                        <span className="text-slate-500 font-mono">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-500`} 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Productivity by Agent */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                Produtividade por Vendedor / Ramal
              </h3>

              <div className="space-y-3">
                {['Rodrigo Gerente (Gerente de Vendas)', 'Lucas Atendente (Atendimento Comercial)'].map((agentName, idx) => {
                  const agentCalls = calls.filter(c => c.userName === agentName);
                  const agentSecs = agentCalls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);

                  return (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
                          {agentName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{agentName}</p>
                          <p className="text-[10px] text-slate-500">{agentCalls.length} chamadas realizadas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {formatSeconds(agentSecs)}
                        </p>
                        <p className="text-[9px] text-slate-400 uppercase">Tempo Falado</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 4: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm max-w-2xl space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Configurações de Telefonia & Provedor VoIP
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Configure o número de saída (Caller ID), gravação e credenciais de provedor VoIP integrado.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                Motor VoIP / Provedor
              </label>
              <select
                value={settings.provider}
                onChange={(e) => setSettings({ ...settings, provider: e.target.value as any })}
                className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none"
              >
                <option value="webrtc_native">WebRTC TrackerMD Nativo (Navegador com Gravação)</option>
                <option value="twilio">Twilio Voice (SIP / WebRTC Trunking)</option>
                <option value="zenvia">Zenvia Voice API</option>
                <option value="totalvoice">TotalVoice / Z-API Voice</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Número de Saída (BINA / Caller ID)
                </label>
                <input
                  type="text"
                  value={settings.callerIdNumber}
                  onChange={(e) => setSettings({ ...settings, callerIdNumber: e.target.value })}
                  placeholder="(11) 4003-8920"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Identificação do Atendente (Ramal)
                </label>
                <input
                  type="text"
                  value={settings.agentExtension}
                  onChange={(e) => setSettings({ ...settings, agentExtension: e.target.value })}
                  placeholder="104"
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.recordCalls}
                  onChange={(e) => setSettings({ ...settings, recordCalls: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Gravação Automática de Ligações</span>
                  <span className="text-[11px] text-slate-500">Gera arquivo de áudio e player embutido no histórico do lead.</span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoTranscribeAI}
                  onChange={(e) => setSettings({ ...settings, autoTranscribeAI: e.target.checked })}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Transcrição & Insights Automáticos com IA</span>
                  <span className="text-[11px] text-slate-500">Resume a chamada e detecta objeções usando Gemini 2.5 Flash.</span>
                </div>
              </label>
            </div>

            {/* Save Button */}
            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={handleSaveSettings}
                disabled={isSavingSettings}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                {isSavingSettings ? 'Salvando...' : 'Salvar Configurações VoIP'}
              </button>

              {settingsSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4" /> Configurações salvas com sucesso!
                </span>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
