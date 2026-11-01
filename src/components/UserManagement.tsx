import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Shield, UserCheck, Key, Mail, Lock, CheckCircle2, 
  XCircle, Trash2, Edit3, Building2, ShieldAlert, Sparkles, AlertCircle,
  Phone, Radio, Globe, Home, RefreshCw, Zap, Check, ArrowUpRight,
  Headphones, ShieldCheck, ArrowRight, MessageCircle, X
} from 'lucide-react';
import { User, UserRole, Company, HotmartPlanOption } from '../types';
import { fetchSubscriptionCheckoutData } from '../services/api';

interface UserManagementProps {
  currentCompany: Company;
  currentUser: User;
  users: User[];
  onAddUser: (newUser: Omit<User, 'id' | 'createdAt'>) => Promise<void> | void;
  onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void> | void;
  onDeleteUser: (userId: string) => Promise<void> | void;
}

const DEFAULT_FORM_DATA = {
  name: '',
  email: '',
  password: '',
  role: 'attendant' as UserRole,
  phone: '',
  extension: '',
  isExternal: false
};

const PLAN_LIMITS: Record<string, number> = {
  starter: 2,
  pro: 5,
  enterprise: 10
};

const DEFAULT_UPGRADE_PLANS = [
  {
    id: 'starter',
    name: 'Plano Starter / Essencial',
    price: 197,
    maxUsers: 2,
    description: 'Ideal para profissionais e negócios locais iniciando no rastreamento profissional.',
    features: [
      'Até 2 Usuários Colaboradores',
      '1 Conexão WhatsApp Web / Evolution',
      '5.000 Disparos de Mensagens / Mês',
      'Rastreamento UTM & CAPI Meta Ads',
      'Relatórios Básicos & CRM de Leads'
    ]
  },
  {
    id: 'pro',
    name: 'Plano Pro / Crescimento',
    price: 397,
    maxUsers: 5,
    highlight: true,
    description: 'Aceleração completa com funil 360°, automações e capacidade expandida.',
    features: [
      'Até 5 Usuários Colaboradores',
      '3 Conexões de WhatsApp Simultâneas',
      '25.000 Disparos de Mensagens / Mês',
      'Funil Visual 360° com Métricas ao Vivo',
      'Automações & Workflows Ilimitados',
      'Suporte Prioritário Via WhatsApp'
    ]
  },
  {
    id: 'enterprise',
    name: 'Plano Enterprise / Escala VIP',
    price: 697,
    maxUsers: 10,
    description: 'Máxima potência, multi-instância e disparos em massa para grandes operações.',
    features: [
      'Até 10 Usuários Colaboradores',
      'Múltiplas Conexões WhatsApp / Instâncias',
      'Disparos em Massa & E-mails Ilimitados',
      'Disparo via SMS Gateway Habilitado',
      'Meta Ads CAPI Dedicado em Alta Frequência',
      'Gerente de Sucesso & Onboarding VIP'
    ]
  }
];

export const UserManagement: React.FC<UserManagementProps> = ({
  currentCompany,
  currentUser,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const [formError, setFormError] = useState('');

  // Modais de Limite de Plano
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCommercialModalOpen, setIsCommercialModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>(null);

  useEffect(() => {
    fetchSubscriptionCheckoutData()
      .then(data => setCheckoutData(data))
      .catch(() => {});
  }, []);

  // Filter users belonging to current company
  const companyUsers = users.filter(u => u.companyId === currentCompany.id);

  // Regras de Capacidade por Plano: Starter (2) | Pro (5) | Enterprise (10)
  const currentPlanKey = (currentCompany.plan || 'starter').toLowerCase();
  const maxAllowedUsers = PLAN_LIMITS[currentPlanKey] ?? 2;
  const currentUsersCount = companyUsers.length;
  const isLimitReached = currentUsersCount >= maxAllowedUsers;
  const isEnterprise = currentPlanKey === 'enterprise';
  const usagePercent = Math.min(100, Math.round((currentUsersCount / maxAllowedUsers) * 100));

  const handleOpenAddUser = () => {
    if (isLimitReached) {
      if (isEnterprise) {
        setIsCommercialModalOpen(true);
      } else {
        setIsUpgradeModalOpen(true);
      }
      return;
    }
    setEditingUserId(null);
    setFormData(DEFAULT_FORM_DATA);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const name = (formData.name || '').trim();
    const email = (formData.email || '').trim();
    const phone = (formData.phone || '').trim();
    const extension = (formData.extension || '').trim();

    if (!name || !email) {
      setFormError('Por favor, preencha o nome e o e-mail.');
      return;
    }

    // Interceptar limite se for um novo usuário
    if (!editingUserId && isLimitReached) {
      if (isEnterprise) {
        setIsCommercialModalOpen(true);
      } else {
        setIsUpgradeModalOpen(true);
      }
      return;
    }

    // Check if email already exists in company
    const exists = companyUsers.some(
      u => (u.email || '').toLowerCase() === email.toLowerCase() && u.id !== editingUserId
    );
    if (exists) {
      setFormError('Este e-mail já está cadastrado nesta empresa.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingUserId) {
        const updates: Partial<User> = {
          name,
          email,
          role: formData.role,
          phone: phone || undefined,
          extension: extension || undefined,
          isExternal: !!formData.isExternal
        };
        if (formData.password) {
          updates.password = formData.password;
        }
        await onUpdateUser(editingUserId, updates);
      } else {
        await onAddUser({
          companyId: currentCompany.id,
          name,
          email,
          password: formData.password || '123',
          role: formData.role,
          phone: phone || undefined,
          extension: extension || undefined,
          isExternal: !!formData.isExternal,
          active: true
        });
      }

      setFormData(DEFAULT_FORM_DATA);
      setEditingUserId(null);
      setIsModalOpen(false);
    } catch (err: any) {
      if (err?.code === 'COMMERCIAL_UPGRADE_REQUIRED' || (err?.message && err.message.toLowerCase().includes('comercial'))) {
        setIsCommercialModalOpen(true);
      } else if (err?.code === 'PLAN_LIMIT_REACHED' || (err?.message && err.message.toLowerCase().includes('upgrade de plano'))) {
        setIsUpgradeModalOpen(true);
      }
      setFormError(err.message || 'Erro ao processar cadastro do colaborador.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: User) => {
    setEditingUserId(user.id);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'attendant',
      phone: user.phone || '',
      extension: user.extension || '',
      isExternal: user.isExternal || false
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const closeAndResetModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setFormData(DEFAULT_FORM_DATA);
    setFormError('');
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            👑 Administrador
          </span>
        );
      case 'manager':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            💼 Gerente de Vendas
          </span>
        );
      case 'attendant':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            🎧 Atendente / Comercial
          </span>
        );
    }
  };

  const getRolePermissionsDescription = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Acesso total: Gestão de Usuários, Links, CRM, Disparos, Configurações de API e Relatórios.';
      case 'manager':
        return 'Acesso intermediário: Links de Campanha, CRM Leads, Disparos em Massa e Chat WhatsApp.';
      case 'attendant':
        return 'Acesso focado: Atendimento no Chat WhatsApp e alteração de etapas do funil de leads.';
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {currentCompany.name}
            </span>
            <span className="text-xs text-slate-400">• CNPJ: {currentCompany.cnpj || '12.345.678/0001-90'}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Gestão de Usuários & Equipe Colaboradora
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre os membros da sua equipe e defina o nível de permissão individual (Categorias de Acesso).
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={handleOpenAddUser}
            className={`font-bold px-4 py-2.5 rounded-lg text-xs transition shadow-xs flex items-center gap-2 shrink-0 cursor-pointer ${
              isLimitReached
                ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-400/30'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isLimitReached ? (
              isEnterprise ? (
                <>
                  <Headphones className="w-4 h-4 text-emerald-200" />
                  <span>Limite Atingido (10/10) • Falar c/ Comercial</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-200 fill-amber-200" />
                  <span>Limite Atingido ({currentUsersCount}/{maxAllowedUsers}) • Upgrade</span>
                </>
              )
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Novo Usuário Colaborador</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Plan Capacity & Limits Info Banner */}
      <div className={`rounded-xl p-4 border transition ${
        isLimitReached 
          ? 'bg-amber-50 border-amber-200' 
          : 'bg-white border-slate-200 shadow-2xs'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              isLimitReached ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-600'
            }`}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Capacidade do Plano {currentPlanKey.toUpperCase()}:
                </span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  isLimitReached 
                    ? 'bg-amber-200 text-amber-900 border border-amber-300 font-mono' 
                    : 'bg-slate-100 text-slate-700 font-mono'
                }`}>
                  {currentUsersCount} de {maxAllowedUsers} {maxAllowedUsers === 1 ? 'pessoa' : 'pessoas'} ({usagePercent}%)
                </span>
                {isLimitReached && (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" /> Limite Atingido
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                {currentPlanKey === 'starter' && 'No Plano Starter é permitido cadastrar até 2 pessoas. Para cadastrar mais colaboradores, migre para o Plano Pro (5 pessoas) ou Enterprise (10 pessoas).'}
                {currentPlanKey === 'pro' && 'No Plano Pro é permitido cadastrar até 5 pessoas. Para cadastrar mais colaboradores, migre para o Plano Enterprise (10 pessoas).'}
                {currentPlanKey === 'enterprise' && 'No Plano Enterprise é permitido cadastrar até 10 pessoas. Acima de 10 pessoas, a expansão deve ser tratada diretamente com o comercial.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {isEnterprise ? (
              <button
                type="button"
                onClick={() => setIsCommercialModalOpen(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                <span>Tratar com Comercial</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(true)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  isLimitReached
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Fazer Upgrade de Plano</span>
              </button>
            )}
          </div>
        </div>

        {/* Mini Progress Bar */}
        <div className="w-full bg-slate-200/80 rounded-full h-1.5 mt-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              usagePercent >= 100 
                ? 'bg-amber-500' 
                : usagePercent >= 80 
                  ? 'bg-blue-500' 
                  : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, usagePercent)}%` }}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: UPGRADE DE PLANO (LIMITE DE USUÁRIOS ATINGIDO)     */}
      {/* ========================================================= */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-white relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">

            {/* Modal Header (Fixed) */}
            <div className="p-5 sm:px-8 sm:py-6 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900/95 backdrop-blur-sm z-10">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-1">
                  <Zap className="w-3.5 h-3.5 fill-amber-400" />
                  Upgrade de Plano Necessário
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Limite de Usuários do Seu Plano Atingido
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  {currentPlanKey === 'starter'
                    ? 'No Plano Starter é permitido cadastrar até 2 pessoas. Faça upgrade para o Plano Pro (até 5 pessoas) ou Enterprise (até 10 pessoas) para continuar expandindo sua equipe.'
                    : 'No Plano Pro é permitido cadastrar até 5 pessoas. Faça upgrade para o Plano Enterprise (até 10 pessoas) para continuar expandindo sua equipe.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition shrink-0 ml-4 cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable with custom-scrollbar) */}
            <div className="p-5 sm:p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6">
              
              {/* Alert Box */}
              <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="text-xs text-slate-300">
                  <span className="font-bold text-white block text-sm">
                    Sua empresa atingiu {currentUsersCount} de {maxAllowedUsers} usuários contratados no Plano {currentPlanKey.toUpperCase()}.
                  </span>
                  Para cadastrar novos colaboradores com logins e acessos individuais, escolha um dos planos com maior capacidade abaixo:
                </div>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(checkoutData?.plans || DEFAULT_UPGRADE_PLANS).map((p: any, i: number) => {
                  const isCurrent = (p.id || '').toLowerCase() === currentPlanKey;
                  const isRecommended = (currentPlanKey === 'starter' && p.id === 'pro') || (currentPlanKey === 'pro' && p.id === 'enterprise');
                  const checkoutHref = p.checkoutUrl || checkoutData?.checkoutUrl || 'https://pay.hotmart.com';

                  return (
                    <div
                      key={p.id || i}
                      className={`rounded-2xl p-6 flex flex-col justify-between relative transition border ${
                        isCurrent
                          ? 'bg-slate-900/60 border-slate-700 opacity-80'
                          : isRecommended
                            ? 'bg-gradient-to-b from-blue-900/40 to-slate-900 border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20'
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isCurrent ? (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-slate-700 text-slate-200 font-bold text-[10px] uppercase tracking-wider shadow-md">
                          Seu Plano Atual ({currentUsersCount}/{p.id === 'starter' ? 2 : p.id === 'pro' ? 5 : 10})
                        </div>
                      ) : isRecommended ? (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider shadow-md">
                          Recomendado para Upgrade ⭐
                        </div>
                      ) : null}

                      <div className="space-y-4">
                        <div>
                          <h4 className="text-lg font-black text-white">{p.name}</h4>
                          <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                        </div>

                        {/* Capacity Highlight Badge */}
                        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-2.5 text-center">
                          <span className="text-xs text-slate-400 block font-medium">Capacidade de Equipe</span>
                          <span className="text-sm font-black text-white flex items-center justify-center gap-1.5 mt-0.5">
                            <Users className="w-4 h-4 text-blue-400" />
                            {p.id === 'starter' && 'Até 2 Pessoas'}
                            {p.id === 'pro' && 'Até 5 Pessoas'}
                            {p.id === 'enterprise' && 'Até 10 Pessoas'}
                          </span>
                        </div>

                        <div className="border-t border-slate-800 pt-3">
                          <div className="text-xs text-slate-400">Mensalidade</div>
                          <div className="flex items-baseline gap-1 mt-0.5">
                            <span className="text-3xl font-black text-white">
                              R$ {p.price}
                            </span>
                            <span className="text-xs text-slate-400 font-semibold">/mês</span>
                          </div>
                        </div>

                        <ul className="space-y-2 pt-2 text-xs text-slate-300">
                          {(p.features || []).map((feat: string, fi: number) => (
                            <li key={fi} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="pt-6 mt-6 border-t border-slate-800/80">
                        {isCurrent ? (
                          <div className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-center bg-slate-800 text-slate-400 cursor-not-allowed">
                            Plano Já Ativo (Limite Atingido)
                          </div>
                        ) : (
                          <a
                            href={checkoutHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md cursor-pointer ${
                              isRecommended
                                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                : 'bg-slate-800 hover:bg-slate-700 text-white'
                            }`}
                          >
                            <span>Fazer Upgrade na Hotmart</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Modal Footer (Fixed) */}
            <div className="p-4 sm:px-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-slate-950/90">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Liberação imediata dos novos acessos após confirmação pela Hotmart.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsUpgradeModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: LIMITE ENTERPRISE (+ DE 10 PESSOAS -> COMERCIAL)  */}
      {/* ========================================================= */}
      {isCommercialModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden text-white relative shadow-2xl animate-in fade-in zoom-in-95 duration-150">

            {/* Modal Header (Fixed) */}
            <div className="p-5 sm:px-8 sm:py-6 border-b border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-900/95 backdrop-blur-sm z-10">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                  Operações Corporativas em Alta Escala
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Limite Máximo do Plano Enterprise Atingido
                </h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Para cadastrar acima de 10 pessoas, as condições devem ser tratadas diretamente com o setor comercial.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCommercialModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 transition shrink-0 ml-4 cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable with custom-scrollbar) */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 custom-scrollbar space-y-6">

              {/* Informative Visual Card */}
              <div className="bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-900 border border-emerald-800/60 rounded-2xl p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
                  <Headphones className="w-8 h-8" />
                </div>
                
                <div className="space-y-2 max-w-lg mx-auto">
                  <h3 className="text-lg font-black text-white">
                    Sua empresa atingiu o limite de 10 usuários colaboradores
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    No <strong>Plano Enterprise</strong> padrão da plataforma, é permitido cadastrar <strong>até 10 pessoas</strong>.
                    Para incluir mais de 10 colaboradores em sua equipe, as condições e pacotes corporativos personalizados devem ser <strong>tratados diretamente com nosso time comercial</strong>.
                  </p>
                </div>

                <div className="pt-2">
                  <a
                    href={`https://wa.me/5565981150758?text=${encodeURIComponent(
                      `Olá! Atingimos o limite de 10 pessoas no Plano Enterprise da empresa "${currentCompany.name}" (CNPJ: ${currentCompany.cnpj || 'Não informado'}) no TrackerMD e gostaríamos de expandir os acessos com o time comercial.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-900/30 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Falar com o Comercial no WhatsApp</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Enterprise Features List */}
              <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vantagens do Pacote Corporativo Sob Medida:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Usuários adicionais sob demanda</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Múltiplas instâncias simultâneas de WhatsApp</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Gerente de contas e onboarding dedicado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Condições contratuais personalizadas</span>
                  </div>
                </div>
              </div>

              {/* Direct Contacts Info */}
              <div className="border-t border-slate-800 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
                <div>
                  WhatsApp Comercial: <strong className="text-white">(65) 98115-0758</strong>
                </div>
                <div>
                  E-mail: <strong className="text-white">comercial@mudadigital.com.br</strong>
                </div>
              </div>

            </div>

            {/* Modal Footer (Fixed) */}
            <div className="p-4 sm:px-8 border-t border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-950/90">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Atendimento comercial especializado de Segunda a Sexta, das 08h às 18h.</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCommercialModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white border border-purple-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
              👑 Categoria: Administrador
            </span>
            <span className="text-xs font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
              {companyUsers.filter(u => u.role === 'admin').length} membros
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Pode cadastrar novos usuários, alterar planos, configurar chaves de API e gerenciar todas as telas.
          </p>
        </div>

        <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
              💼 Categoria: Gerente
            </span>
            <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {companyUsers.filter(u => u.role === 'manager').length} membros
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Acesso para criar links de campanha, disparos em massa, métricas e supervisão de equipe.
          </p>
        </div>

        <div className="bg-white border border-emerald-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
              🎧 Categoria: Atendente
            </span>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              {companyUsers.filter(u => u.role === 'attendant').length} membros
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Acesso focado na rotina comercial de atendimento ao cliente via Chat e CRM de Leads.
          </p>
        </div>

      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Colaboradores Cadastrados na {currentCompany.name} ({companyUsers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Usuário / Nome</th>
                <th className="py-3 px-4">E-mail de Acesso</th>
                <th className="py-3 px-4">Telefone / Ramal</th>
                <th className="py-3 px-4">Categoria / Modelo</th>
                <th className="py-3 px-4">Permissões Principais</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {companyUsers.map(user => {
                const isSelf = user.id === currentUser.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* User Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div>{user.name} {isSelf && <span className="text-blue-600 text-[10px] font-bold ml-1">(Você)</span>}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">ID: {user.id}</div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {user.email}
                    </td>

                    {/* Phone & Extension */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        {user.phone ? (
                          <span className="font-mono text-slate-800 text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {user.phone}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Sem fone direto</span>
                        )}
                        {user.extension && (
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold w-fit flex items-center gap-1">
                            <Radio className="w-2.5 h-2.5 text-blue-600" />
                            Ramal {user.extension}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Role & Model Badge */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        {getRoleBadge(user.role)}
                        <div>
                          {user.isExternal ? (
                            <span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Globe className="w-2.5 h-2.5 text-amber-600" />
                              Externo (Home Office)
                            </span>
                          ) : (
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <Home className="w-2.5 h-2.5 text-slate-500" />
                              Interno (Escritório)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Permissions Tooltip */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs">
                      {getRolePermissionsDescription(user.role)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {user.active ? (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          Ativo
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-600" />
                          Inativo
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {currentUser.role === 'admin' && !isSelf ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onUpdateUser(user.id, { active: !user.active })}
                            className="text-xs text-slate-600 hover:text-slate-900 underline font-medium"
                          >
                            {user.active ? 'Desativar' : 'Ativar'}
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded"
                            title="Editar Usuário"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          {isSelf ? 'Sua Conta' : 'Somente Leitura'}
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {editingUserId ? <Edit3 className="w-5 h-5 text-blue-600" /> : <UserPlus className="w-5 h-5 text-blue-600" />}
                {editingUserId ? 'Editar Colaborador' : 'Cadastrar Colaborador na Empresa'}
              </h2>
              <button
                onClick={closeAndResetModal}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria Oliveira"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  E-mail do Colaborador
                </label>
                <input
                  type="email"
                  required
                  placeholder="maria@empresa.com.br"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {editingUserId ? 'Nova Senha (opcional)' : 'Senha Inicial'}
                </label>
                <input
                  type="password"
                  placeholder={editingUserId ? "Deixe em branco para manter a atual" : "Defina uma senha (Padrão: 123)"}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-600" />
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 5511999998888"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
                    <Radio className="w-3 h-3 text-blue-600" />
                    Ramal VoIP
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 101, 204"
                    value={formData.extension}
                    onChange={(e) => setFormData({ ...formData, extension: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isExternal}
                    onChange={(e) => setFormData({ ...formData, isExternal: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-amber-600" />
                      Colaborador Externo (Home Office / Remoto)
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      Marque se o atendente opera fora do escritório (receberá chamadas via web/celular).
                    </span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Categoria de Acesso / Nível de Permissão
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="attendant">🎧 Atendente / Comercial (Acesso ao Chat e CRM)</option>
                  <option value="manager">💼 Gerente de Vendas (Links, CRM, Disparos e Relatórios)</option>
                  <option value="admin">👑 Administrador (Acesso Total + Gestão de Usuários)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {getRolePermissionsDescription(formData.role)}
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeAndResetModal}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    editingUserId ? 'Salvar Alterações' : 'Confirmar Cadastro'
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
