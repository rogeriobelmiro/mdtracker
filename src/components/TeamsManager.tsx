import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Phone, Shield, UserCheck, Plus, Trash2, Edit3, 
  Settings, CheckCircle2, AlertCircle, RefreshCw, Radio, Layers, 
  Sparkles, ArrowRight, PhoneCall, Headphones, Globe, Building2,
  Sliders, UserX, ShieldAlert, BarChart3, HelpCircle, User
} from 'lucide-react';
import { Team, TeamMember, TeamType, DistributionStrategy, TeamMemberStatus, User as UserType, Company } from '../types';
import { 
  fetchTeams, createTeam, updateTeam, deleteTeam, 
  fetchTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember 
} from '../services/api';

interface TeamsManagerProps {
  currentCompany: Company;
  currentUser: UserType;
  users: UserType[];
  onNavigateToTab?: (tab: string) => void;
}

export const TeamsManager: React.FC<TeamsManagerProps> = ({
  currentCompany,
  currentUser,
  users,
  onNavigateToTab
}) => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Strictly isolate users for current company only (Multi-tenant)
  const companyUsers = React.useMemo(() => {
    return users.filter(u => u.companyId === currentCompany.id);
  }, [users, currentCompany.id]);

  // Team Modal State
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    type: 'active_sales' as TeamType,
    color: '#3B82F6',
    distributionStrategy: 'round_robin' as DistributionStrategy,
    active: true
  });

  // Member Modal State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [memberForm, setMemberForm] = useState({
    userId: '',
    role: 'member' as 'leader' | 'member',
    isExternal: false,
    phoneNumber: '',
    extension: '',
    status: 'online' as TeamMemberStatus,
    maxConcurrentLeads: 15,
    active: true
  });

  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const companyId = currentCompany?.id || 'comp-alfa';
      const [teamsData, membersData] = await Promise.all([
        fetchTeams(companyId),
        fetchTeamMembers(companyId)
      ]);
      setTeams(teamsData);
      setMembers(membersData);
      if (teamsData.length > 0 && !selectedTeamId) {
        setSelectedTeamId(teamsData[0].id);
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados de equipes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCompany?.id]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Team CRUD
  const handleOpenTeamModal = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setTeamForm({
        name: team.name,
        description: team.description || '',
        type: team.type,
        color: team.color,
        distributionStrategy: team.distributionStrategy,
        active: team.active
      });
    } else {
      setEditingTeam(null);
      setTeamForm({
        name: '',
        description: '',
        type: 'active_sales',
        color: '#3B82F6',
        distributionStrategy: 'round_robin',
        active: true
      });
    }
    setIsTeamModalOpen(true);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamForm.name.trim()) return;

    try {
      const companyId = currentCompany?.id || 'comp-alfa';
      if (editingTeam) {
        const updated = await updateTeam(editingTeam.id, teamForm);
        setTeams(prev => prev.map(t => t.id === editingTeam.id ? updated : t));
        showFeedback('Equipe atualizada com sucesso!');
      } else {
        const created = await createTeam({
          companyId,
          ...teamForm
        });
        setTeams(prev => [...prev, created]);
        setSelectedTeamId(created.id);
        showFeedback('Nova equipe criada com sucesso!');
      }
      setIsTeamModalOpen(false);
    } catch (err: any) {
      showFeedback(err.message || 'Erro ao salvar equipe', 'error');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Deseja realmente excluir esta equipe? Os colaboradores serão desvinculados.')) return;
    try {
      await deleteTeam(teamId);
      setTeams(prev => prev.filter(t => t.id !== teamId));
      setMembers(prev => prev.filter(m => m.teamId !== teamId));
      if (selectedTeamId === teamId) {
        setSelectedTeamId(teams.find(t => t.id !== teamId)?.id || null);
      }
      showFeedback('Equipe excluída com sucesso.');
    } catch (err: any) {
      showFeedback(err.message || 'Erro ao excluir equipe', 'error');
    }
  };

  // Member CRUD
  const handleOpenMemberModal = (member?: TeamMember) => {
    if (member) {
      setEditingMember(member);
      setMemberForm({
        userId: member.userId,
        role: member.role,
        isExternal: member.isExternal,
        phoneNumber: member.phoneNumber || '',
        extension: member.extension || '',
        status: member.status,
        maxConcurrentLeads: member.maxConcurrentLeads,
        active: member.active
      });
    } else {
      setEditingMember(null);
      // Pick first user from THIS company not already in this team
      const availableUser = companyUsers.find(u => !members.some(m => m.teamId === selectedTeamId && m.userId === u.id));
      const defaultUser = availableUser || companyUsers[0];
      setMemberForm({
        userId: defaultUser?.id || '',
        role: 'member',
        isExternal: defaultUser?.isExternal || false,
        phoneNumber: defaultUser?.phone || '',
        extension: defaultUser?.extension || '10' + (members.length + 1),
        status: 'online',
        maxConcurrentLeads: 15,
        active: true
      });
    }
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId || !memberForm.userId) return;

    try {
      const companyId = currentCompany?.id || 'comp-alfa';
      const targetUser = companyUsers.find(u => u.id === memberForm.userId);

      if (editingMember) {
        const updated = await updateTeamMember(editingMember.id, memberForm);
        setMembers(prev => prev.map(m => m.id === editingMember.id ? updated : m));
        showFeedback('Colaborador atualizado com sucesso!');
      } else {
        const created = await createTeamMember({
          companyId,
          teamId: selectedTeamId,
          userName: targetUser?.name || 'Colaborador',
          userEmail: targetUser?.email || '',
          ...memberForm
        });
        setMembers(prev => [...prev, created]);
        showFeedback('Colaborador adicionado à equipe com sucesso!');
      }
      setIsMemberModalOpen(false);
    } catch (err: any) {
      showFeedback(err.message || 'Erro ao salvar colaborador', 'error');
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm('Deseja desvincular este colaborador da equipe?')) return;
    try {
      await deleteTeamMember(memberId);
      setMembers(prev => prev.filter(m => m.id !== memberId));
      showFeedback('Colaborador desvinculado com sucesso.');
    } catch (err: any) {
      showFeedback(err.message || 'Erro ao remover colaborador', 'error');
    }
  };

  const selectedTeam = teams.find(t => t.id === selectedTeamId) || teams[0];
  const selectedTeamMembers = members.filter(m => m.teamId === selectedTeam?.id);

  const getTypeBadge = (type: TeamType) => {
    switch (type) {
      case 'active_sales':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">🎯 Vendas Ativas (Outbound)</span>;
      case 'inbound_sales':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">📥 Vendas Receptivas (Inbound)</span>;
      case 'recovery':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">⚡ Recuperação de Vendas</span>;
      case 'support':
        return <span className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">🎧 Suporte & Pós-Venda</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 border border-slate-200 text-xs px-2.5 py-0.5 rounded-full font-semibold">🏢 Setor Especial</span>;
    }
  };

  const getStatusBadge = (status: TeamMemberStatus) => {
    switch (status) {
      case 'online':
        return <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>Disponível</span>;
      case 'in_call':
        return <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Em Ligação</span>;
      case 'busy':
        return <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200"><span className="w-2 h-2 rounded-full bg-amber-500"></span>Ocupado</span>;
      case 'break':
        return <span className="flex items-center gap-1.5 text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200"><span className="w-2 h-2 rounded-full bg-orange-400"></span>Em Pausa</span>;
      case 'offline':
        return <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200"><span className="w-2 h-2 rounded-full bg-slate-400"></span>Offline</span>;
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {currentCompany.name}
            </span>
            <span className="text-xs text-slate-400">• Multi-Atendimento & Filas</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Equipes, Filas & Colaboradores de Vendas
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Crie setores especializados (Vendas Ativas, Receptivas, Recuperação de Vendas e Suporte).
            Associe colaboradores internos ou externos (home office) com ramal VoIP e telefone WhatsApp individual.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateToTab && (
            <button
              onClick={() => onNavigateToTab('supervisor_monitor')}
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold px-4 py-2.5 rounded-xl transition text-sm flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              Torre de Supervisão
            </button>
          )}

          {currentUser.role === 'admin' && (
            <button
              onClick={() => handleOpenTeamModal()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Nova Equipe
            </button>
          )}
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          feedbackMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
          {feedbackMsg.text}
        </div>
      )}

      {/* Main Layout: Left Column Teams List, Right Column Members */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Teams List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-500" />
                Equipes Cadastradas ({teams.length})
              </h2>
              <button onClick={loadData} className="text-slate-400 hover:text-slate-600 p-1">
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2">
              {teams.map(team => {
                const teamMemberCount = members.filter(m => m.teamId === team.id && m.active).length;
                const isSelected = selectedTeam?.id === team.id;

                return (
                  <div
                    key={team.id}
                    onClick={() => setSelectedTeamId(team.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-50/50 border-blue-400 shadow-xs ring-1 ring-blue-300'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                          style={{ backgroundColor: team.color || '#3B82F6' }}
                        />
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 leading-snug">{team.name}</h3>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{team.description || 'Sem descrição'}</p>
                        </div>
                      </div>

                      {currentUser.role === 'admin' && (
                        <div className="flex items-center gap-1 opacity-80 hover:opacity-100">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleOpenTeamModal(team); }}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                            title="Editar equipe"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteTeam(team.id); }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                            title="Excluir equipe"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        {teamMemberCount} {teamMemberCount === 1 ? 'colaborador' : 'colaboradores'}
                      </span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
                        {team.distributionStrategy === 'round_robin' ? '🔄 Roleta Justa' : team.distributionStrategy === 'workload' ? '⚖️ Menor Carga' : '✍️ Manual'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {teams.length === 0 && !loading && (
                <div className="text-center py-8 text-slate-400">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Nenhuma equipe cadastrada ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Selected Team Details & Members (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          {selectedTeam ? (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
              
              {/* Team Info Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: selectedTeam.color || '#3B82F6' }}
                  >
                    <Headphones className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900">{selectedTeam.name}</h2>
                      {getTypeBadge(selectedTeam.type)}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedTeam.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenMemberModal()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3.5 py-2 rounded-xl transition text-xs flex items-center gap-1.5 shadow-xs"
                  >
                    <UserPlus className="w-4 h-4" />
                    Adicionar Colaborador
                  </button>
                </div>
              </div>

              {/* Strategy & Rules Box */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">Regra de Distribuição de Leads:</span>
                  <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-medium text-slate-700">
                    {selectedTeam.distributionStrategy === 'round_robin' && '🔄 Roleta Automática (Round-Robin entre atendentes disponíveis)'}
                    {selectedTeam.distributionStrategy === 'workload' && '⚖️ Equilíbrio por Carga (Envia para quem tem menos leads abertos)'}
                    {selectedTeam.distributionStrategy === 'manual' && '✍️ Atribuição Manual pelo Supervisor'}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <span>Associação a campanhas ativas no Gerador de Links</span>
                </div>
              </div>

              {/* Members Table */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center justify-between">
                  <span>Membros & Atendentes da Fila ({selectedTeamMembers.length})</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    {selectedTeamMembers.filter(m => m.isExternal).length} Externos (Remoto) • {selectedTeamMembers.filter(m => !m.isExternal).length} Internos
                  </span>
                </h3>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200">
                        <th className="py-3 px-4">Colaborador / Vendedor</th>
                        <th className="py-3 px-3">Modalidade</th>
                        <th className="py-3 px-3">Ramal / Telefone</th>
                        <th className="py-3 px-3">Status Ao Vivo</th>
                        <th className="py-3 px-3">Capacidade</th>
                        <th className="py-3 px-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTeamMembers.map(member => {
                        const userObj = companyUsers.find(u => u.id === member.userId);

                        return (
                          <tr key={member.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 shrink-0 text-xs">
                                  {userObj?.name ? userObj.name.substring(0, 2).toUpperCase() : 'CO'}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                    {userObj?.name || member.userName}
                                    {member.role === 'leader' && (
                                      <span className="bg-purple-100 text-purple-700 font-bold text-[10px] px-1.5 py-0.2 rounded border border-purple-200">
                                        Líder
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-slate-400">{userObj?.email || member.userEmail}</div>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              {member.isExternal ? (
                                <span className="bg-orange-50 text-orange-700 border border-orange-200 font-medium px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-[11px]">
                                  <Globe className="w-3 h-3 text-orange-500" />
                                  Externo (Home Office)
                                </span>
                              ) : (
                                <span className="bg-slate-100 text-slate-700 border border-slate-200 font-medium px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-[11px]">
                                  <Building2 className="w-3 h-3 text-slate-500" />
                                  Interno (Escritório)
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                              <div className="flex flex-col gap-0.5">
                                <span className="flex items-center gap-1">
                                  <PhoneCall className="w-3 h-3 text-blue-500" />
                                  Ramal: <strong>{member.extension || '101'}</strong>
                                </span>
                                {member.phoneNumber && (
                                  <span className="text-[10px] text-slate-400">
                                    Whats: {member.phoneNumber}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-3">
                              {getStatusBadge(member.status)}
                            </td>

                            <td className="py-3 px-3 text-slate-600">
                              <span className="font-semibold text-slate-900">{member.maxConcurrentLeads}</span> leads max
                            </td>

                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenMemberModal(member)}
                                  className="p-1 text-slate-400 hover:text-blue-600 rounded transition"
                                  title="Editar membro"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMember(member.id)}
                                  className="p-1 text-slate-400 hover:text-red-600 rounded transition"
                                  title="Remover da equipe"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}

                      {selectedTeamMembers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400">
                            <UserX className="w-7 h-7 mx-auto mb-2 opacity-40" />
                            <p className="text-xs">Nenhum colaborador adicionado nesta equipe ainda.</p>
                            <button
                              onClick={() => handleOpenMemberModal()}
                              className="mt-2 text-xs text-blue-600 hover:underline font-semibold"
                            >
                              + Adicionar o primeiro colaborador
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 shadow-xs">
              <Layers className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold text-slate-600">Selecione uma equipe ao lado para gerenciar</p>
              <p className="text-xs text-slate-400 mt-1">Ou crie uma nova equipe para associar às suas campanhas de tráfego.</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL: CRIAR / EDITAR EQUIPE */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {editingTeam ? 'Editar Equipe' : 'Criar Nova Equipe de Vendas'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Configure o nome, cor de identificação e regras de distribuição de leads para esta equipe.
            </p>

            <form onSubmit={handleSaveTeam} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nome da Equipe *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Vendas Ativas (Outbound)"
                  value={teamForm.name}
                  onChange={e => setTeamForm({ ...teamForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo / Especialidade *</label>
                <select
                  value={teamForm.type}
                  onChange={e => setTeamForm({ ...teamForm, type: e.target.value as TeamType })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="active_sales">🎯 Vendas Ativas (Outbound / Prospecção)</option>
                  <option value="inbound_sales">📥 Vendas Receptivas (Inbound / WhatsApp)</option>
                  <option value="recovery">⚡ Recuperação de Vendas (Carrinho / Boletos)</option>
                  <option value="support">🎧 Suporte & Pós-Venda</option>
                  <option value="custom">🏢 Equipe Personalizada</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Responsável por ligar para leads novos nos primeiros 5 minutos..."
                  value={teamForm.description}
                  onChange={e => setTeamForm({ ...teamForm, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Cor da Equipe</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={teamForm.color}
                      onChange={e => setTeamForm({ ...teamForm, color: e.target.value })}
                      className="w-10 h-10 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                    />
                    <span className="font-mono text-xs text-slate-600">{teamForm.color}</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Distribuição de Leads</label>
                  <select
                    value={teamForm.distributionStrategy}
                    onChange={e => setTeamForm({ ...teamForm, distributionStrategy: e.target.value as DistributionStrategy })}
                    className="w-full border border-slate-300 rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="round_robin">🔄 Roleta (Round-Robin)</option>
                    <option value="workload">⚖️ Menor Carga Ativa</option>
                    <option value="manual">✍️ Manual (Supervisor)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsTeamModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-xs shadow-xs"
                >
                  Salvar Equipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR / EDITAR MEMBRO DA EQUIPE */}
      {isMemberModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              {editingMember ? 'Editar Colaborador na Equipe' : 'Adicionar Colaborador à Equipe'}
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Defina se o colaborador atua interna ou externamente, seu ramal e limites de atendimento.
            </p>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Colaborador / Usuário *</label>
                {companyUsers.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                    <p className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      Nenhum colaborador encontrado nesta empresa.
                    </p>
                    <p className="mt-1 text-slate-600">
                      Cadastre os usuários da <strong>{currentCompany.name}</strong> no menu <em>Usuários & Permissões</em> para poder alocá-los nas equipes.
                    </p>
                  </div>
                ) : (
                  <select
                    disabled={!!editingMember}
                    value={memberForm.userId}
                    onChange={e => {
                      const selectedUid = e.target.value;
                      const u = companyUsers.find(usr => usr.id === selectedUid);
                      setMemberForm({
                        ...memberForm,
                        userId: selectedUid,
                        phoneNumber: u?.phone || memberForm.phoneNumber,
                        extension: u?.extension || memberForm.extension,
                        isExternal: u?.isExternal !== undefined ? u.isExternal : memberForm.isExternal
                      });
                    }}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100"
                  >
                    {companyUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email}) - {u.role === 'admin' ? '👑 Admin' : u.role === 'manager' ? '💼 Gerente' : '🎧 Atendente'}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Função na Equipe</label>
                  <select
                    value={memberForm.role}
                    onChange={e => setMemberForm({ ...memberForm, role: e.target.value as 'leader' | 'member' })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="member">Membro / Vendedor</option>
                    <option value="leader">Líder / Coordenador</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Modalidade de Trabalho</label>
                  <select
                    value={memberForm.isExternal ? 'true' : 'false'}
                    onChange={e => setMemberForm({ ...memberForm, isExternal: e.target.value === 'true' })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="false">🏢 Interno (No Escritório)</option>
                    <option value="true">🌐 Externo (Remoto / Home Office)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ramal VoIP / Discador</label>
                  <input
                    type="text"
                    placeholder="Ex: 101"
                    value={memberForm.extension}
                    onChange={e => setMemberForm({ ...memberForm, extension: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Telefone WhatsApp Direto</label>
                  <input
                    type="tel"
                    placeholder="Ex: 5511999998888"
                    value={memberForm.phoneNumber}
                    onChange={e => setMemberForm({ ...memberForm, phoneNumber: e.target.value })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Inicial</label>
                  <select
                    value={memberForm.status}
                    onChange={e => setMemberForm({ ...memberForm, status: e.target.value as TeamMemberStatus })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="online">🟢 Disponível (Online)</option>
                    <option value="in_call">🔵 Em Ligação</option>
                    <option value="busy">🟡 Ocupado</option>
                    <option value="break">🟠 Em Pausa</option>
                    <option value="offline">⚪ Offline</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Leads Simultâneos</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={memberForm.maxConcurrentLeads}
                    onChange={e => setMemberForm({ ...memberForm, maxConcurrentLeads: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsMemberModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition text-xs shadow-xs"
                >
                  Salvar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
