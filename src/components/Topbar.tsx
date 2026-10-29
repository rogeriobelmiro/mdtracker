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
  CreditCard
} from 'lucide-react';
import { User, Company } from '../types';
import { NavTabId } from './Sidebar';
import { fetchSubscriptionCheckoutUrl } from '../services/api';

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
  onToggleMobileMenu
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

  const handleGoToCheckout = async () => {
    try {
      const url = await fetchSubscriptionCheckoutUrl();
      window.open(url, '_blank');
    } catch {
      window.open('https://pay.hotmart.com', '_blank');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-10 px-4 sm:px-6 py-3 flex items-center justify-between shadow-2xs">
      
      {/* Left: Mobile Menu Toggle & Page Title / Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

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

    </header>
  );
};
