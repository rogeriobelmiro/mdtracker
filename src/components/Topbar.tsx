import React from 'react';
import { 
  Menu, 
  BarChart3, 
  Link as LinkIcon, 
  Users, 
  Zap, 
  Radio, 
  MessageSquare, 
  Building2, 
  UserPlus, 
  ShoppingCart, 
  Sliders, 
  Sparkles,
  Calendar,
  Plus,
  Bot,
  GitBranch,
  Layout,
  Send,
  PhoneCall,
  Target,
  Instagram,
  Headphones,
  ShieldCheck,
  BrainCircuit,
  Clock,
  Flame,
  CreditCard,
  X,
  Check,
  ArrowUpRight,
  GraduationCap,
  Activity,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { User, Company, HotmartPlanOption, SetupTrainingConfig } from '../types';
import { NavTabId } from './Sidebar';
import { fetchSubscriptionCheckoutUrl, fetchSubscriptionCheckoutData } from '../services/api';

interface TopbarProps {
  activeTab: NavTabId;
  currentUser: User;
  currentCompany: Company;
  startDate?: string;
  setStartDate?: (date: string) => void;
  endDate?: string;
  setEndDate?: (date: string) => void;
  onOpenCreateModal: () => void;
  onToggleMobileMenu: () => void;
  onOpenActivityLogs?: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebarCollapse?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  currentUser,
  currentCompany,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onOpenCreateModal,
  onToggleMobileMenu,
  onOpenActivityLogs,
  isSidebarCollapsed,
  onToggleSidebarCollapse
}) => {
  // Page titles and breadcrumb metadata
  const getTabMeta = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          section: 'Visão Geral',
          title: 'Métricas & Desempenho',
          icon: BarChart3
        };
      case 'links':
        return {
          section: 'Atração & Marketing',
          title: 'Gerador de Links de Rastreio',
          icon: LinkIcon
        };
      case 'landing_pages':
        return {
          section: 'Atração & Marketing',
          title: 'Criador de Landing Pages (RD Style)',
          icon: Layout
        };
      case 'popups':
        return {
          section: 'Atração & Marketing',
          title: 'Pop-ups & Captura Inteligente',
          icon: Sliders
        };
      case 'workflows':
        return {
          section: 'Atração & Marketing',
          title: 'Automações & Workflows de Nutrição',
          icon: GitBranch
        };
      case 'ai':
        return {
          section: 'Atração & Marketing',
          title: 'Assistente IA Copywriter',
          icon: Sparkles
        };
      case 'leads':
        return {
          section: 'Vendas & Atendimento',
          title: 'Gestão de Leads & CRM',
          icon: Users
        };
      case 'smart_lists':
        return {
          section: 'Vendas & Atendimento',
          title: 'Listas Inteligentes & Lead Scoring com IA',
          icon: Target
        };
      case 'virtual_phone':
        return {
          section: 'Vendas & Atendimento',
          title: 'Telefone Virtual, Discador WebRTC & Gravação VoIP',
          icon: PhoneCall
        };
      case 'chatbot':
        return {
          section: 'Vendas & Atendimento',
          title: 'Chatbot com IA (WhatsApp & Direct)',
          icon: Bot
        };
      case 'instagram_auto_dm':
        return {
          section: 'Vendas & Atendimento',
          title: 'Auto-DM Instagram & Resposta de Comentários (Estilo ManyChat)',
          icon: Instagram
        };
      case 'chat':
        return {
          section: 'Vendas & Atendimento',
          title: 'Chat WhatsApp & Copiloto IA',
          icon: MessageSquare
        };
      case 'broadcast':
        return {
          section: 'Atração & Vendas',
          title: 'Campanhas & Lançamentos (E-mail, WhatsApp & SMS)',
          icon: Send
        };
      case 'products':
        return {
          section: 'Configurações & Gestão',
          title: 'Produtos & Catálogo de Vendas',
          icon: ShoppingCart
        };
      case 'events':
        return {
          section: 'Configurações & Gestão',
          title: 'Integrações & CAPI',
          icon: Zap
        };
      case 'teams':
        return {
          section: 'Vendas & Atendimento',
          title: 'Equipes & Filas de Vendas (Multi-Atendimento)',
          icon: Headphones
        };
      case 'supervisor_monitor':
        return {
          section: 'Vendas & Atendimento',
          title: 'Torre de Supervisão & Monitoramento ao Vivo',
          icon: ShieldCheck
        };
      case 'ai_agents':
        return {
          section: 'Vendas & Atendimento',
          title: 'Criador de Agentes de IA Autônomos (Orientados a Objetivos)',
          icon: BrainCircuit
        };
      case 'users':
        return {
          section: 'Configurações & Gestão',
          title: 'Equipe & Permissões',
          icon: UserPlus
        };
      case 'company':
        return {
          section: 'Configurações & Gestão',
          title: 'Minha Empresa & Perfil',
          icon: Building2
        };
      case 'saas_admin':
        return {
          section: 'Super Admin',
          title: 'Hotmart & Assinaturas SaaS',
          icon: Flame
        };
      case 'saas_goals':
        return {
          section: 'Super Admin',
          title: 'Metas & Premiações dos Afiliados',
          icon: Target
        };
      default:
        return {
          section: 'Visão Geral',
          title: 'MD Tracker',
          icon: BarChart3
        };
    }
  };

  const meta = getTabMeta();
  const Icon = meta.icon;

  // Subscription calculation
  const isOwnerMaster = currentCompany.id === 'comp-1786498560971' || currentUser?.email?.toLowerCase().trim() === 'rogerio@mudadigital.com.br';
  const subStatus = currentCompany.subscriptionStatus || 'trial';
  const isActiveSub = subStatus === 'active' || isOwnerMaster;

  const now = Date.now();
  const trialEnd = currentCompany.trialEndsAt 
    ? new Date(currentCompany.trialEndsAt).getTime() 
    : (new Date(currentCompany.createdAt).getTime() + 24 * 60 * 60 * 1000);
  const isTrialExpired = !isActiveSub && now > trialEnd;
  const remainingHours = Math.max(0, Math.round((trialEnd - now) / (1000 * 60 * 60)));

  const [isPricingModalOpen, setIsPricingModalOpen] = React.useState(false);
  const [checkoutData, setCheckoutData] = React.useState<{
    checkoutUrl: string;
    plans?: HotmartPlanOption[];
    setupTraining?: SetupTrainingConfig;
  } | null>(null);

  const handleGoToCheckout = async () => {
    try {
      const data = await fetchSubscriptionCheckoutData();
      setCheckoutData(data);
      setIsPricingModalOpen(true);
    } catch {
      window.open('https://pay.hotmart.com', '_blank');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-10 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
      
      {/* Left: Mobile Menu Toggle & Desktop Sidebar Toggle & Page Title / Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {onToggleSidebarCollapse && (
          <button
            type="button"
            onClick={onToggleSidebarCollapse}
            className="hidden md:flex p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition items-center justify-center shrink-0"
            title={isSidebarCollapsed ? "Expandir menu lateral (Ctrl+B)" : "Recolher menu lateral (Ctrl+B)"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 text-blue-600" />
            ) : (
              <PanelLeftClose className="w-5 h-5" />
            )}
          </button>
        )}

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="hidden sm:flex w-9 h-9 rounded-lg bg-blue-50 text-blue-600 items-center justify-center shrink-0 border border-blue-100/80">
            <Icon className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <span>{meta.section}</span>
              <span>/</span>
              <span className="text-slate-600 font-semibold truncate">{meta.title}</span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-tight truncate">
              {meta.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Right: Date Filter, Company Badge, and Quick Action */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Date Filter (Desktop & Tablet) */}
        {(setStartDate && setEndDate) && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-2xs">
            <div className="flex items-center gap-1 mr-1 border-r border-slate-200 pr-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
              <button 
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0];
                  setStartDate(today); setEndDate(today);
                }}
                className="text-[11px] text-slate-600 hover:text-blue-600 font-medium px-1.5 py-0.5 rounded hover:bg-slate-200 transition"
              >
                Hoje
              </button>
              <button 
                onClick={() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  const dateStr = yesterday.toISOString().split('T')[0];
                  setStartDate(dateStr); setEndDate(dateStr);
                }}
                className="text-[11px] text-slate-600 hover:text-blue-600 font-medium px-1.5 py-0.5 rounded hover:bg-slate-200 transition"
              >
                Ontem
              </button>
              <button 
                onClick={() => {
                  const today = new Date();
                  const last7 = new Date(today);
                  last7.setDate(last7.getDate() - 7);
                  setStartDate(last7.toISOString().split('T')[0]);
                  setEndDate(today.toISOString().split('T')[0]);
                }}
                className="text-[11px] text-slate-600 hover:text-blue-600 font-medium px-1.5 py-0.5 rounded hover:bg-slate-200 transition"
              >
                7D
              </button>
            </div>
            <input 
              type="date" 
              value={startDate || ''}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-[11px] text-slate-700 font-medium outline-none cursor-pointer"
              title="Data Inicial"
            />
            <span className="text-slate-400 text-[10px]">até</span>
            <input 
              type="date" 
              value={endDate || ''}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-[11px] text-slate-700 font-medium outline-none cursor-pointer"
              title="Data Final"
            />
            {(startDate || endDate) && (
              <button 
                onClick={() => { setStartDate(''); setEndDate(''); }}
                className="text-[11px] text-red-500 hover:text-red-700 font-bold ml-1 px-1"
                title="Limpar Filtro"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Subscription Status & Checkout Button */}
        {!isActiveSub && (
          <div className="flex items-center gap-2">
            {!isTrialExpired ? (
              <>
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-xs font-bold text-amber-800 shadow-2xs">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Teste: {remainingHours}h restantes</span>
                </div>
                <button
                  onClick={handleGoToCheckout}
                  className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-sm transform hover:scale-105 active:scale-95"
                  title="Fazer Assinatura Mensal na Hotmart"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-200" />
                  <span>Fazer Assinatura ⚡</span>
                </button>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 shadow-2xs animate-pulse">
                  <span>🚨 Teste de 1 dia expirado</span>
                </div>
                <button
                  onClick={handleGoToCheckout}
                  className="bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-black px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-md animate-pulse hover:animate-none transform hover:scale-105 active:scale-95"
                  title="Ativar Assinatura na Hotmart"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Assinar Agora para Liberar ⚡</span>
                </button>
              </>
            )}
          </div>
        )}

        {isActiveSub && (
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Assinatura Ativa</span>
          </div>
        )}

        {/* Activity Logs Button */}
        {onOpenActivityLogs && (
          <button
            type="button"
            onClick={onOpenActivityLogs}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition"
            title="Ver logs de atividades e auditoria da empresa"
          >
            <Activity className="w-3.5 h-3.5 text-blue-600" />
            <span className="hidden md:inline">Logs</span>
          </button>
        )}

        {/* Company Badge */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700">
          <Building2 className="w-3.5 h-3.5 text-blue-600" />
          <span className="truncate max-w-[130px]">{currentCompany.name}</span>
        </div>

        {/* Topbar Quick Action: Novo Link */}
        {currentUser.role !== 'attendant' && (
          <button
            onClick={onOpenCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Novo Link</span>
          </button>
        )}
      </div>

      {/* Pricing Plans & Hotmart Modal */}
      {isPricingModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-10 space-y-8 my-8 text-white relative shadow-2xl">
            
            <button
              onClick={() => setIsPricingModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Planos Oficiais Hotmart
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Escolha o Plano Ideal para a Sua Empresa
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Libere acesso imediato e continue crescendo com automações, CRM de leads e rastreamento CAPI.
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(checkoutData?.plans || [
                {
                  id: 'starter',
                  name: 'Plano Starter',
                  price: 197,
                  description: 'Ideal para profissionais e negócios locais.',
                  checkoutUrl: checkoutData?.checkoutUrl || 'https://pay.hotmart.com',
                  features: ['Até 3 Usuários', '1 Conexão WhatsApp', '5.000 Disparos/mês', 'Rastreamento CAPI Meta']
                },
                {
                  id: 'pro',
                  name: 'Plano Pro',
                  price: 397,
                  highlight: true,
                  description: 'Aceleração completa com funil 360° e automações.',
                  checkoutUrl: checkoutData?.checkoutUrl || 'https://pay.hotmart.com',
                  features: ['Até 10 Usuários', '3 Conexões WhatsApp', '25.000 Disparos/mês', 'Funil Visual 360°', 'Suporte Prioritário']
                },
                {
                  id: 'enterprise',
                  name: 'Plano Enterprise',
                  price: 697,
                  description: 'Potência máxima para grandes operações.',
                  checkoutUrl: checkoutData?.checkoutUrl || 'https://pay.hotmart.com',
                  features: ['Usuários Ilimitados', 'WhatsApp Multi-instância', 'Disparos Ilimitados', 'Gerente de Conta VIP']
                }
              ]).map((p: any, i: number) => (
                <div 
                  key={p.id || i}
                  className={`rounded-2xl p-6 flex flex-col justify-between relative transition border ${
                    p.highlight 
                      ? 'bg-gradient-to-b from-blue-900/40 to-slate-900 border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20' 
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider shadow-md">
                      Mais Escolhido ⭐
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-black text-white">{p.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{p.description}</p>
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
                    <a
                      href={p.checkoutUrl || checkoutData?.checkoutUrl || 'https://pay.hotmart.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md ${
                        p.highlight
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      <span>Assinar na Hotmart</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Setup & Training Banner */}
            {checkoutData?.setupTraining?.enabled !== false && (
              <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border border-indigo-800/60 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Onboarding VIP & Setup Assistido</span>
                  </div>
                  <h4 className="text-lg font-black text-white">
                    {checkoutData?.setupTraining?.title || 'Taxa de Implantação, Configuração Técnica & Treinamento VIP'}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {checkoutData?.setupTraining?.description || 'Configuração técnica completa de DNS, Meta CAPI, instâncias do WhatsApp e 2h de treinamento ao vivo via Zoom com nossa equipe especializada.'}
                  </p>
                </div>

                <div className="text-center md:text-right shrink-0 space-y-2">
                  <div className="text-xs text-slate-400 font-semibold">Taxa Única de Ativação</div>
                  <div className="text-2xl font-black text-indigo-300">
                    R$ {checkoutData?.setupTraining?.price || 997}
                  </div>
                  {checkoutData?.setupTraining?.checkoutUrl && (
                    <a
                      href={checkoutData.setupTraining.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                    >
                      <span>Contratar Treinamento</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </header>
  );
};
