import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Phone, PhoneCall, MessageSquare, Play, Pause, Sparkles, 
  Search, Filter, ArrowRightLeft, UserCheck, Shield, CheckCircle2, 
  AlertCircle, Clock, Volume2, Globe, Building2, Headphones, 
  BarChart3, RefreshCw, Eye, ArrowUpRight, ChevronRight, X
} from 'lucide-react';
import { 
  Team, TeamMember, TeamMemberStatus, Lead, LeadCall, 
  CampaignLink, User as UserType, Company, SupervisorMonitorStats, FunnelStage 
} from '../types';
import { 
  fetchTeams, fetchTeamMembers, fetchSupervisorStats, 
  fetchLeadCalls, reassignLead 
} from '../services/api';

interface SupervisorLiveMonitorProps {
  currentCompany: Company;
  currentUser: UserType;
  leads: Lead[];
  links: CampaignLink[];
  users: UserType[];
  onOpenWhatsApp?: (leadId: string) => void;
  onInitiateCall?: (target: { id: string; name: string; phone: string }) => void;
}

export const SupervisorLiveMonitor: React.FC<SupervisorLiveMonitorProps> = ({
  currentCompany,
  currentUser,
  leads,
  links,
  users,
  onOpenWhatsApp,
  onInitiateCall
}) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [calls, setCalls] = useState<LeadCall[]>([]);
  const [stats, setStats] = useState<SupervisorMonitorStats>({
    totalAgents: 0,
    onlineAgents: 0,
    inCallAgents: 0,
    busyAgents: 0,
    offlineAgents: 0,
    activeChatsCount: 0,
    todayCallsCount: 0,
    averageCallDuration: 0,
    positiveSentimentRate: 0
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterTeamId, setFilterTeamId] = useState<string>('all');
  const [filterUserId, setFilterUserId] = useState<string>('all');
  const [filterCampaignId, setFilterCampaignId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'agents' | 'conversations' | 'calls'>('agents');

  // Strictly isolate users for current company only (Multi-tenant)
  const companyUsers = useMemo(() => {
    return users.filter(u => u.companyId === currentCompany?.id);
  }, [users, currentCompany?.id]);

  // Reassignment Modal State
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [leadToReassign, setLeadToReassign] = useState<Lead | null>(null);
  const [selectedNewUserId, setSelectedNewUserId] = useState('');
  const [selectedNewTeamId, setSelectedNewTeamId] = useState('');
  const [isReassigning, setIsReassigning] = useState(false);

  // Audio Player State for Call Recordings
  const [playingCallId, setPlayingCallId] = useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const companyId = currentCompany?.id || 'comp-alfa';
      const [teamsData, membersData, statsData, callsData] = await Promise.all([
        fetchTeams(companyId),
        fetchTeamMembers(companyId),
        fetchSupervisorStats(companyId),
        fetchLeadCalls(companyId)
      ]);
      setTeams(teamsData);
      setMembers(membersData);
      setStats(statsData);
      setCalls(callsData);
    } catch (err: any) {
      console.error('Erro ao carregar monitoramento de supervisão:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 20000); // Live poll every 20s
    return () => clearInterval(interval);
  }, [currentCompany?.id]);

  // Audio Playback
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
      audioRef.current = audio;
      audio.play();
      setPlayingCallId(call.id);
      audio.onended = () => setPlayingCallId(null);
    }
  };

  // Reassignment Handler
  const handleOpenReassign = (lead: Lead) => {
    setLeadToReassign(lead);
    setSelectedNewUserId(lead.assignedUserId || '');
    setSelectedNewTeamId(lead.assignedTeamId || '');
    setReassignModalOpen(true);
  };

  const handleConfirmReassign = async () => {
    if (!leadToReassign) return;
    setIsReassigning(true);
    try {
      await reassignLead(leadToReassign.id, selectedNewUserId || undefined, selectedNewTeamId || undefined);
      setReassignModalOpen(false);
      setLeadToReassign(null);
      await loadData();
    } catch (err: any) {
      alert('Erro ao reatribuir lead: ' + err.message);
    } finally {
      setIsReassigning(false);
    }
  };

  // Filtered Leads (Live Conversations Monitor)
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      if (filterTeamId !== 'all' && lead.assignedTeamId !== filterTeamId) return false;
      if (filterUserId !== 'all' && lead.assignedUserId !== filterUserId) return false;
      if (filterCampaignId !== 'all' && lead.linkId !== filterCampaignId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = lead.name.toLowerCase().includes(q);
        const matchesPhone = (lead.phone || '').includes(q);
        const matchesCampaign = (lead.utmCampaign || lead.linkTitle || '').toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesCampaign) return false;
      }
      return true;
    });
  }, [leads, filterTeamId, filterUserId, filterCampaignId, searchQuery]);

  // Filtered Calls
  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      if (filterTeamId !== 'all' && call.teamId !== filterTeamId) return false;
      if (filterUserId !== 'all' && call.userId !== filterUserId) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = call.leadName.toLowerCase().includes(q);
        const matchesAgent = call.userName.toLowerCase().includes(q);
        if (!matchesName && !matchesAgent) return false;
      }
      return true;
    });
  }, [calls, filterTeamId, filterUserId, searchQuery]);

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-purple-100 text-purple-800 font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Painel de Supervisão 360°
            </span>
            <span className="text-xs text-slate-400">• Monitoramento em Tempo Real</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-600" />
            Torre de Controle & Supervisão de Atendimento
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Acompanhe atendentes internos e externos em tempo real, audite conversas do WhatsApp,
            escute gravações de chamadas e realize transbordo de leads entre equipes com 1 clique.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3.5 py-2 rounded-xl transition text-xs flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Agora
          </button>
        </div>
      </div>

      {/* Real-time KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Online</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.onlineAgents}</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Disponíveis p/ atender</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Em Chamada</span>
            <PhoneCall className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">{stats.inCallAgents}</div>
          <p className="text-[11px] text-blue-600 font-medium mt-1">Ligação ativa no VoIP</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Ocupados / Pausa</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.busyAgents + stats.offlineAgents}</div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Em atendimento ou pausa</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Equipe</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.totalAgents || members.length}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Colaboradores ativos</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Ligações do Dia</span>
            <Headphones className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{calls.length}</div>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Méd: {Math.round(stats.averageCallDuration / 60)}m por chamada</p>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Sentimento IA</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.positiveSentimentRate}%</div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Feedback positivo</p>
        </div>

      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('agents')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'agents'
              ? 'border-b-2 border-purple-600 text-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Radar de Atendentes ao Vivo ({members.length})
        </button>

        <button
          onClick={() => setActiveTab('conversations')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'conversations'
              ? 'border-b-2 border-purple-600 text-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Monitor de Conversas WhatsApp ({filteredLeads.length})
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`pb-3 transition flex items-center gap-2 ${
            activeTab === 'calls'
              ? 'border-b-2 border-purple-600 text-purple-700'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          Auditoria de Áudios & Ligações ({filteredCalls.length})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5" />
            Filtros:
          </div>

          <select
            value={filterTeamId}
            onChange={e => setFilterTeamId(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium"
          >
            <option value="all">Todas as Equipes / Filas</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <select
            value={filterUserId}
            onChange={e => setFilterUserId(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium"
          >
            <option value="all">Todos os Atendentes</option>
            {companyUsers.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          <select
            value={filterCampaignId}
            onChange={e => setFilterCampaignId(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 font-medium"
          >
            <option value="all">Todas as Campanhas de Anúncio</option>
            {links.map(l => (
              <option key={l.id} value={l.id}>{l.title}</option>
            ))}
          </select>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar lead, vendedor ou campanha..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* TAB 1: RADAR DE ATENDENTES */}
      {activeTab === 'agents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => {
            const userObj = companyUsers.find(u => u.id === member.userId);
            const teamObj = teams.find(t => t.id === member.teamId);
            const memberCalls = calls.filter(c => c.userId === member.userId);
            const assignedLeadsCount = leads.filter(l => l.assignedUserId === member.userId).length;

            return (
              <div
                key={member.id}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-slate-300 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-sm">
                        {userObj?.name ? userObj.name.substring(0, 2).toUpperCase() : 'CO'}
                      </div>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        member.status === 'online' ? 'bg-emerald-500' :
                        member.status === 'in_call' ? 'bg-blue-500' :
                        member.status === 'busy' ? 'bg-amber-500' : 'bg-slate-400'
                      }`} />
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{userObj?.name || member.userName}</h3>
                      <p className="text-[11px] text-slate-400">{userObj?.email || member.userEmail}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    member.isExternal ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {member.isExternal ? '🌐 Externo' : '🏢 Interno'}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-lg p-2.5 text-xs space-y-1.5 border border-slate-100">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1">
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: teamObj?.color || '#3B82F6' }} 
                      />
                      Equipe:
                    </span>
                    <span className="font-semibold text-slate-900">{teamObj?.name || 'Vendas Ativas'}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Ramal / Whats:</span>
                    <span className="font-mono font-medium text-slate-800">
                      Ramal {member.extension || '101'} {member.phoneNumber && `• ${member.phoneNumber}`}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span>Carga Atual:</span>
                    <span className="font-semibold text-slate-900">
                      {assignedLeadsCount} / {member.maxConcurrentLeads} leads
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    {memberCalls.length} ligações registradas
                  </span>

                  <button
                    onClick={() => {
                      setFilterUserId(member.userId);
                      setActiveTab('conversations');
                    }}
                    className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1 text-[11px]"
                  >
                    Ver Conversas
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: MONITOR DE CONVERSAS WHATSAPP */}
      {activeTab === 'conversations' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Lead / Contato</th>
                  <th className="py-3 px-3">Campanha de Origem</th>
                  <th className="py-3 px-3">Equipe / Fila</th>
                  <th className="py-3 px-3">Vendedor Responsável</th>
                  <th className="py-3 px-3">Etapa no Funil</th>
                  <th className="py-3 px-3 text-right">Ações de Supervisão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map(lead => {
                  const assignedUser = companyUsers.find(u => u.id === lead.assignedUserId);
                  const assignedTeam = teams.find(t => t.id === lead.assignedTeamId);

                  return (
                    <tr key={lead.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{lead.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{lead.phone || 'Sem telefone'}</div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800">{lead.linkTitle || lead.utmCampaign || 'Geral'}</span>
                        <div className="text-[10px] text-slate-400 font-mono">UTM: {lead.utmSource || 'meta_ads'}</div>
                      </td>

                      <td className="py-3 px-3">
                        {assignedTeam ? (
                          <span 
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold text-[11px]"
                            style={{ 
                              backgroundColor: `${assignedTeam.color}15`,
                              color: assignedTeam.color,
                              border: `1px solid ${assignedTeam.color}40`
                            }}
                          >
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: assignedTeam.color }} />
                            {assignedTeam.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Não atribuída</span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {assignedUser ? (
                          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-blue-500" />
                            {assignedUser.name}
                          </div>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Aguardando Distribuição
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px]">
                          {lead.stage}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onOpenWhatsApp && (
                            <button
                              onClick={() => onOpenWhatsApp(lead.id)}
                              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold px-2.5 py-1 rounded-lg transition text-[11px] flex items-center gap-1"
                              title="Abrir histórico da conversa"
                            >
                              <MessageSquare className="w-3 h-3" />
                              Ver Chat
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenReassign(lead)}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold px-2.5 py-1 rounded-lg transition text-[11px] flex items-center gap-1"
                            title="Transferir lead para outro vendedor ou equipe"
                          >
                            <ArrowRightLeft className="w-3 h-3" />
                            Transferir
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Nenhum atendimento encontrado com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDITORIA DE LIGAÇÕES & ÁUDIOS COM IA */}
      {activeTab === 'calls' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Lead / Contato</th>
                  <th className="py-3 px-3">Vendedor & Ramal</th>
                  <th className="py-3 px-3">Duração</th>
                  <th className="py-3 px-3">Desfecho Comercial</th>
                  <th className="py-3 px-3">Sentimento IA</th>
                  <th className="py-3 px-3 text-right">Gravação de Áudio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCalls.map(call => {
                  const isPlaying = playingCallId === call.id;

                  return (
                    <tr key={call.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{call.leadName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{call.leadPhone}</div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">{call.userName}</div>
                        <div className="text-[11px] text-slate-400 font-mono">DID: {call.callerId || '(11) 4003-8920'}</div>
                      </td>

                      <td className="py-3 px-3 font-mono text-slate-600">
                        {Math.floor(call.durationSeconds / 60)}m {call.durationSeconds % 60}s
                      </td>

                      <td className="py-3 px-3">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium text-[11px]">
                          {call.outcome}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          call.sentiment === 'positivo' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          call.sentiment === 'negativo' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          <Sparkles className="w-2.5 h-2.5" />
                          {call.sentiment ? call.sentiment.toUpperCase() : 'NEUTRO'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        {call.recordingUrl ? (
                          <button
                            onClick={() => handleTogglePlay(call)}
                            className={`px-3 py-1.5 rounded-xl font-semibold transition text-xs inline-flex items-center gap-1.5 shadow-xs ${
                              isPlaying
                                ? 'bg-purple-600 text-white animate-pulse'
                                : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                            }`}
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            {isPlaying ? 'Pausar Áudio' : 'Escutar Chamada'}
                          </button>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Sem gravação</span>
                        )}
                      </td>
                    </tr>
                  );
                })}

                {filteredCalls.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      Nenhuma chamada telefônica registrada com os filtros selecionados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: TRANSBORDO / REATRIBUIÇÃO DE LEAD */}
      {reassignModalOpen && leadToReassign && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ArrowRightLeft className="w-5 h-5 text-purple-600" />
                  Transbordo / Transferência de Lead
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Transferindo: <strong>{leadToReassign.name}</strong> ({leadToReassign.phone || 'Sem telefone'})
                </p>
              </div>
              <button onClick={() => setReassignModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Equipe / Fila de Destino</label>
                <select
                  value={selectedNewTeamId}
                  onChange={e => setSelectedNewTeamId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="">Nenhuma / Deixar Avulso</option>
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Vendedor / Colaborador de Destino</label>
                <select
                  value={selectedNewUserId}
                  onChange={e => setSelectedNewUserId(e.target.value)}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                >
                  <option value="">Roleta Automática da Equipe</option>
                  {companyUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email}) - {u.role === 'admin' ? '👑 Admin' : u.role === 'manager' ? '💼 Gerente' : '🎧 Atendente'}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Selecione um vendedor específico ou deixe em branco para a roleta distribuir.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReassignModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isReassigning}
                  onClick={handleConfirmReassign}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition text-xs shadow-xs disabled:opacity-50"
                >
                  {isReassigning ? 'Transferindo...' : 'Confirmar Transferência'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
