import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Flame, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  CreditCard, 
  Users, 
  Lock, 
  Sparkles, 
  Save, 
  Sliders, 
  PlusCircle, 
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Company, User, HotmartConfig, HotmartEvent } from '../types';
import { 
  fetchAdminCompanies, 
  updateCompanySubscription, 
  fetchHotmartSettings, 
  updateHotmartSettings, 
  fetchHotmartEvents 
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';

interface SuperAdminHotmartManagerProps {
  currentUser: User;
}

export const SuperAdminHotmartManager: React.FC<SuperAdminHotmartManagerProps> = ({ currentUser }) => {
  const { alert, confirm, success } = useDialog();
  const isSuperAdmin = currentUser?.email?.toLowerCase().trim() === 'rogerio@mudadigital.com.br';

  const [activeSubTab, setActiveSubTab] = useState<'companies' | 'hotmart_config' | 'events_log'>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Hotmart Config State
  const [hotmartConfig, setHotmartConfig] = useState<HotmartConfig>({
    hottok: '',
    checkoutUrl: '',
    productId: '',
    trialDays: 1,
    webhookUrl: ''
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  // Events Log State
  const [events, setEvents] = useState<HotmartEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Load Companies
  const loadCompaniesData = async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const data = await fetchAdminCompanies(currentUser.email);
      setCompanies(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load Hotmart Config
  const loadHotmartConfig = async () => {
    if (!isSuperAdmin) return;
    try {
      const config = await fetchHotmartSettings(currentUser.email);
      setHotmartConfig(config);
    } catch (err) {
      console.error(err);
    }
  };

  // Load Events
  const loadEventsData = async () => {
    if (!isSuperAdmin) return;
    setLoadingEvents(true);
    try {
      const logs = await fetchHotmartEvents(currentUser.email);
      setEvents(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadCompaniesData();
      loadHotmartConfig();
      if (activeSubTab === 'events_log') {
        loadEventsData();
      }
    }
  }, [isSuperAdmin, activeSubTab]);

  // Handle Save Hotmart Settings
  const handleSaveHotmartSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await updateHotmartSettings(currentUser.email, hotmartConfig);
      await success('Configurações da Hotmart salvas com sucesso!');
    } catch (err: any) {
      await alert(err.message || 'Erro ao salvar configurações da Hotmart');
    } finally {
      setSavingConfig(false);
    }
  };

  // Handle Subscription Actions
  const handleActivateSubscription = async (company: Company) => {
    const ok = await confirm(
      `Deseja ativar manualmente a assinatura da empresa "${company.name}"? Ela terá status Ativo sem depender da Hotmart.`
    );
    if (!ok) return;

    try {
      await updateCompanySubscription(company.id, currentUser.email, {
        subscriptionStatus: 'active',
        subscriptionPlan: 'mensal_manual'
      });
      await success(`Assinatura da empresa "${company.name}" ativada com sucesso!`);
      loadCompaniesData();
    } catch (err: any) {
      await alert(err.message || 'Erro ao ativar assinatura');
    }
  };

  const handleExtendTrial = async (company: Company, days: number) => {
    const ok = await confirm(
      `Deseja adicionar mais ${days} dias de teste gratuito para a empresa "${company.name}"?`
    );
    if (!ok) return;

    try {
      await updateCompanySubscription(company.id, currentUser.email, {
        trialDaysToAdd: days
      });
      await success(`Adicionados +${days} dias de teste para "${company.name}"!`);
      loadCompaniesData();
    } catch (err: any) {
      await alert(err.message || 'Erro ao prorrogar teste');
    }
  };

  const handleCancelSubscription = async (company: Company) => {
    const ok = await confirm(
      `Tem certeza que deseja cancelar/expirar a assinatura da empresa "${company.name}"?`
    );
    if (!ok) return;

    try {
      await updateCompanySubscription(company.id, currentUser.email, {
        subscriptionStatus: 'expired'
      });
      await success(`Assinatura de "${company.name}" definida como expirada.`);
      loadCompaniesData();
    } catch (err: any) {
      await alert(err.message || 'Erro ao expirar assinatura');
    }
  };

  // Copy Webhook URL
  const copyWebhookUrl = () => {
    const url = hotmartConfig.webhookUrl || `${window.location.origin}/api/webhooks/hotmart`;
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  // Filtered companies
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.cnpj && c.cnpj.includes(searchTerm)) ||
      (c.responsibleName && c.responsibleName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.hotmartBuyerEmail && c.hotmartBuyerEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return c.subscriptionStatus === 'active';
    if (filterStatus === 'trial') return c.subscriptionStatus === 'trial' && !(c as any).isTrialExpired;
    if (filterStatus === 'expired') return c.subscriptionStatus === 'expired' || (c as any).isTrialExpired;
    return true;
  });

  // KPI Calculations
  const totalCompanies = companies.length;
  const activeSubs = companies.filter(c => c.subscriptionStatus === 'active').length;
  const trialSubs = companies.filter(c => c.subscriptionStatus === 'trial' && !(c as any).isTrialExpired).length;
  const expiredSubs = companies.filter(c => c.subscriptionStatus === 'expired' || (c as any).isTrialExpired).length;

  if (!isSuperAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-red-200 p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Acesso Restrito</h2>
          <p className="text-sm text-slate-600 mb-6">
            Esta área de Administração Global e Integração Hotmart é exclusiva para o Super Administrador da plataforma (<strong>rogerio@mudadigital.com.br</strong>).
          </p>
          <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200">
            Usuário atual conectado: <span className="font-semibold text-slate-700">{currentUser.email}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-indigo-600/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Painel Super Admin • rogerio@mudadigital.com.br</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Gestão de Empresas & Hotmart SaaS</span>
              <Flame className="w-7 h-7 text-amber-400" />
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Monitore todas as empresas cadastradas no sistema, status de período de teste (1 dia), assinaturas mensais ativas na Hotmart e webhooks de pagamento.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => { loadCompaniesData(); loadHotmartConfig(); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition shadow-sm"
              title="Atualizar Dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 border-t border-slate-800/80 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('companies')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeSubTab === 'companies'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Empresas & Assinaturas ({totalCompanies})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('hotmart_config')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeSubTab === 'hotmart_config'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Configurações Hotmart</span>
          </button>

          <button
            onClick={() => setActiveSubTab('events_log')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeSubTab === 'events_log'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Auditoria de Webhooks Hotmart</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: COMPANIES & SUBSCRIPTIONS */}
      {/* ========================================================= */}
      {activeSubTab === 'companies' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Empresas</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCompanies}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Assinaturas Ativas</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeSubs}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Em Período de Teste</p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">{trialSubs}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Testes Expirados</p>
                <h3 className="text-2xl font-black text-rose-600 mt-1">{expiredSubs}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nome, CNPJ ou e-mail..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'active', label: 'Ativas' },
                { id: 'trial', label: 'Em Teste (1 dia)' },
                { id: 'expired', label: 'Expiradas' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterStatus(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    filterStatus === f.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Companies Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-4 px-5">Empresa</th>
                    <th className="py-4 px-4">Responsável / Contato</th>
                    <th className="py-4 px-4">Status da Assinatura</th>
                    <th className="py-4 px-4">Uso (Usuários/Leads)</th>
                    <th className="py-4 px-4">Hotmart Ref</th>
                    <th className="py-4 px-5 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Nenhuma empresa encontrada para os filtros selecionados.
                      </td>
                    </tr>
                  ) : (
                    filteredCompanies.map((c) => {
                      const isExpired = c.subscriptionStatus === 'expired' || (c as any).isTrialExpired;
                      const isTrial = c.subscriptionStatus === 'trial' && !isExpired;
                      const isActive = c.subscriptionStatus === 'active';
                      const remainingHours = (c as any).trialRemainingHours || 0;

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-100/70 text-blue-700 font-bold flex items-center justify-center shrink-0 shadow-xs">
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                                  <span>{c.name}</span>
                                  {c.id === 'comp-1786498560971' && (
                                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                                      Proprietária Master
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  CNPJ: {c.cnpj || 'Não informado'} • Desde {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="text-slate-800 font-semibold">{c.responsibleName || 'Não especificado'}</div>
                            <div className="text-slate-500 text-[11px]">{c.phone || '-'}</div>
                          </td>

                          <td className="py-4 px-4">
                            {isActive ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Assinatura Ativa (Mensal)</span>
                              </div>
                            ) : isTrial ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Teste Grátis (Restam {remainingHours}h)</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Teste Expirado / Inativo</span>
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4 text-slate-700">
                            <span className="font-bold text-slate-900">{(c as any).userCount || 1}</span> usuários • <span className="font-bold text-blue-600">{(c as any).leadCount || 0}</span> leads
                          </td>

                          <td className="py-4 px-4 text-[11px]">
                            {c.hotmartBuyerEmail ? (
                              <div>
                                <span className="font-semibold text-slate-800 block">{c.hotmartBuyerEmail}</span>
                                <span className="text-slate-400 font-mono text-[10px]">{c.hotmartTransactionId || 'Assinatura'}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Sem compra vinculada</span>
                            )}
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isActive && (
                                <button
                                  onClick={() => handleActivateSubscription(c)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
                                  title="Ativar Assinatura Manualmente"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Ativar</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleExtendTrial(c, 7)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1"
                                title="Adicionar +7 dias de teste"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                                <span>+7 Dias</span>
                              </button>

                              {isActive && (
                                <button
                                  onClick={() => handleCancelSubscription(c)}
                                  className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition"
                                  title="Expirar / Cancelar"
                                >
                                  Expirar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: HOTMART CONFIGURATION */}
      {/* ========================================================= */}
      {activeSubTab === 'hotmart_config' && (
        <div className="max-w-4xl space-y-8">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-amber-500" />
                  <span>Configuração da Integração Hotmart</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Configure o Webhook da Hotmart para liberar automaticamente as assinaturas mensais das empresas após a aprovação do pagamento.
                </p>
              </div>
            </div>

            {/* Webhook URL Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                URL do Webhook do MDTracker (Copie e cole na Hotmart)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={hotmartConfig.webhookUrl || `${window.location.origin}/api/webhooks/hotmart`}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 font-mono text-xs sm:text-sm text-slate-800 select-all"
                />
                <button
                  type="button"
                  onClick={copyWebhookUrl}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition shadow-sm"
                >
                  {copiedWebhook ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedWebhook ? 'Copiado!' : 'Copiar URL'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Na Hotmart, acesse: <strong>Ferramentas &gt; Webhook (API e Notificações) &gt; Cadastrar Webhook</strong> e selecione os eventos de <em>Compra Aprovada</em>, <em>Assinatura Cancelada</em> e <em>Troca de Plano</em>.
              </p>
            </div>

            <form onSubmit={handleSaveHotmartSettings} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Token Hottok de Verificação (Hotmart) *
                  </label>
                  <input
                    type="text"
                    value={hotmartConfig.hottok || ''}
                    onChange={(e) => setHotmartConfig({ ...hotmartConfig, hottok: e.target.value })}
                    placeholder="Ex: 8a97b4c6-e123-4567-89ab-cdef01234567"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Encontrado na aba de configuração do Webhook na Hotmart para autenticar cada disparo.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dias de Teste Padrão no Cadastro (Trial) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={hotmartConfig.trialDays || 1}
                    onChange={(e) => setHotmartConfig({ ...hotmartConfig, trialDays: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tempo gratuito liberado para novas empresas antes de exigir a assinatura (Padrão: 1 dia).
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Link de Checkout do Produto / Plano Mensal Hotmart *
                  </label>
                  <input
                    type="url"
                    value={hotmartConfig.checkoutUrl || ''}
                    onChange={(e) => setHotmartConfig({ ...hotmartConfig, checkoutUrl: e.target.value })}
                    placeholder="https://pay.hotmart.com/SEU_CODIGO_DE_PRODUTO?off=xyz"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    required
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Este link será aberto quando o usuário clicar no botão <strong>"Fazer Assinatura"</strong> no cabeçalho do sistema após o período de 1 dia de testes.
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={savingConfig}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingConfig ? 'Salvando...' : 'Salvar Configurações Hotmart'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: WEBHOOK AUDIT LOGS */}
      {/* ========================================================= */}
      {activeSubTab === 'events_log' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Histórico de Disparos Webhook Hotmart</h3>
              <p className="text-xs text-slate-500">Últimos eventos recebidos diretamente da Hotmart para ativação e cancelamento de assinaturas.</p>
            </div>
            <button
              onClick={loadEventsData}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingEvents ? 'animate-spin' : ''}`} />
              <span>Atualizar Logs</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Evento</th>
                    <th className="py-3 px-4">Comprador (E-mail)</th>
                    <th className="py-3 px-4">Transação</th>
                    <th className="py-3 px-4">Empresa Vinculada</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Nenhum evento registrado da Hotmart até o momento.
                      </td>
                    </tr>
                  ) : (
                    events.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {new Date(ev.createdAt).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50">
                            {ev.eventType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {ev.buyerEmail || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {ev.transactionId || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {ev.companyId || <span className="text-amber-600 italic">Não associada</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ev.status === 'processed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {ev.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
