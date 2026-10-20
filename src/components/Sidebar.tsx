import React from 'react';
import { 
  BarChart3, 
  Link as LinkIcon, 
  Users, 
  Zap, 
  Plus, 
  Radio, 
  MessageSquare, 
  Building2, 
  LogOut, 
  UserPlus, 
  ShoppingCart, 
  Sliders, 
  Sparkles,
  X,
  ChevronRight,
  ShieldCheck,
  Bot,
  GitBranch,
  Layout,
  Send,
  PhoneCall,
  Target,
  Instagram
} from 'lucide-react';
import { User, Company } from '../types';

export type NavTabId = 'dashboard' | 'links' | 'landing_pages' | 'popups' | 'workflows' | 'ai' | 'leads' | 'smart_lists' | 'virtual_phone' | 'chatbot' | 'instagram_auto_dm' | 'chat' | 'broadcast' | 'products' | 'events' | 'users' | 'company';

interface SidebarProps {
  activeTab: NavTabId;
  setActiveTab: (tab: NavTabId) => void;
  onOpenCreateModal: () => void;
  currentUser: User;
  currentCompany: Company;
  onLogout: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface NavItem {
  id: NavTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: {
    text: string;
    variant: 'blue' | 'emerald' | 'amber' | 'purple';
  };
  allowedRoles?: Array<'admin' | 'manager' | 'attendant'>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  currentUser,
  currentCompany,
  onLogout,
  isMobileOpen,
  setIsMobileOpen
}) => {
  // Categorized navigation groups
  const navGroups: NavGroup[] = [
    {
      title: 'Visão Geral',
      items: [
        {
          id: 'dashboard',
          label: 'Visão Geral',
          icon: BarChart3,
          allowedRoles: ['admin', 'manager']
        }
      ]
    },
    {
      title: 'Atração & Marketing',
      items: [
        {
          id: 'links',
          label: 'Gerador de Links',
          icon: LinkIcon,
          allowedRoles: ['admin', 'manager']
        },
        {
          id: 'landing_pages',
          label: 'Landing Pages',
          icon: Layout,
          badge: { text: 'RD Style', variant: 'blue' },
          allowedRoles: ['admin', 'manager']
        },
        {
          id: 'popups',
          label: 'Pop-ups & Captura',
          icon: Sliders,
          badge: { text: 'Novo', variant: 'blue' },
          allowedRoles: ['admin', 'manager']
        },
        {
          id: 'workflows',
          label: 'Automações (Workflows)',
          icon: GitBranch,
          badge: { text: 'RD Style', variant: 'purple' },
          allowedRoles: ['admin', 'manager']
        },
        {
          id: 'ai',
          label: 'Assistente IA',
          icon: Sparkles,
          badge: { text: 'IA', variant: 'amber' },
          allowedRoles: ['admin', 'manager']
        }
      ]
    },
    {
      title: 'Vendas & Atendimento',
      items: [
        {
          id: 'leads',
          label: 'Gestão de Leads',
          icon: Users,
          allowedRoles: ['admin', 'manager', 'attendant']
        },
        {
          id: 'smart_lists',
          label: 'Listas & Lead Scoring',
          icon: Target,
          badge: { text: 'IA Scoring', variant: 'purple' },
          allowedRoles: ['admin', 'manager', 'attendant']
        },
        {
          id: 'virtual_phone',
          label: 'Telefone Virtual & VoIP',
          icon: PhoneCall,
          badge: { text: 'WebRTC', variant: 'emerald' },
          allowedRoles: ['admin', 'manager', 'attendant']
        },
        {
          id: 'chatbot',
          label: 'Chatbot com IA',
          icon: Bot,
          badge: { text: 'WhatsApp & Direct', variant: 'purple' },
          allowedRoles: ['admin', 'manager']
        },
        {
          id: 'instagram_auto_dm',
          label: 'Auto-DM Instagram',
          icon: Instagram,
          badge: { text: 'ManyChat', variant: 'purple' },
          allowedRoles: ['admin', 'manager']
        },
        {
          id: 'chat',
          label: 'Chat ao Vivo',
          icon: MessageSquare,
          badge: { text: 'Online', variant: 'emerald' },
          allowedRoles: ['admin', 'manager', 'attendant']
        },
        {
          id: 'broadcast',
          label: 'Campanhas & Lançamentos',
          icon: Send,
          badge: { text: 'E-mail, Whats & SMS', variant: 'purple' },
          allowedRoles: ['admin', 'manager']
        }
      ]
    },
    {
      title: 'Configurações & Gestão',
      items: [
        {
          id: 'products',
          label: 'Produtos & Catálogo',
          icon: ShoppingCart,
          allowedRoles: ['admin']
        },
        {
          id: 'events',
          label: 'Integrações & CAPI',
          icon: Zap,
          allowedRoles: ['admin', 'manager']
        },
        {
          id: 'users',
          label: 'Usuários & Permissões',
          icon: UserPlus,
          allowedRoles: ['admin']
        },
        {
          id: 'company',
          label: 'Minha Empresa',
          icon: Building2,
          allowedRoles: ['admin']
        }
      ]
    }
  ];

  const handleSelectTab = (tabId: NavTabId) => {
    setActiveTab(tabId);
    if (isMobileOpen) {
      setIsMobileOpen(false);
    }
  };

  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'admin':
        return <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-500/30">👑 Admin</span>;
      case 'manager':
        return <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-500/30">💼 Gerente</span>;
      case 'attendant':
        return <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">🎧 Atendente</span>;
    }
  };

  const getBadgeStyle = (variant: 'blue' | 'emerald' | 'amber' | 'purple') => {
    switch (variant) {
      case 'emerald':
        return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'amber':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      case 'purple':
        return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      case 'blue':
      default:
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      
      {/* 1. Header: Logo & Company Switcher */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div 
            onClick={() => handleSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            {currentCompany.logoUrl ? (
              <img 
                src={currentCompany.logoUrl} 
                alt="Logo" 
                className="h-8 w-8 object-contain rounded-lg bg-white p-0.5 shadow-sm" 
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <span>{currentCompany.name.charAt(0).toUpperCase()}</span>
              </div>
            )}
            <div className="flex flex-col leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-white tracking-tight">MDTracker</span>
                <span className="bg-blue-500/20 text-blue-400 text-[9px] font-bold px-1.5 py-0.2 rounded border border-blue-500/30">
                  PRO
                </span>
              </div>
              <span className="text-[10px] text-slate-400">Growth & Marketing CRM</span>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Company Pill Card */}
        <div className="mt-3.5 bg-slate-800/60 border border-slate-700/60 rounded-lg p-2 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="truncate">
              <p className="text-[11px] font-bold text-white truncate">{currentCompany.name}</p>
              <p className="text-[9px] text-slate-400">Ambiente Multi-tenant</p>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-2" title="Conectado"></span>
        </div>

        {/* Quick Action: Novo Link Button */}
        {currentUser.role !== 'attendant' && (
          <button
            onClick={() => {
              onOpenCreateModal();
              if (isMobileOpen) setIsMobileOpen(false);
            }}
            className="mt-3 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-2 shadow-sm shadow-blue-600/30 hover:shadow-md transition-all group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span>Novo Link de Rastreio</span>
          </button>
        )}
      </div>

      {/* 2. Scrollable Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
        {navGroups.map((group, groupIndex) => {
          // Filter items based on user role
          const visibleItems = group.items.filter(
            item => !item.allowedRoles || item.allowedRoles.includes(currentUser.role)
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={groupIndex} className="space-y-1">
              {/* Category Header */}
              <div className="px-3 pb-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase flex items-center justify-between">
                <span>{group.title}</span>
              </div>

              {/* Items */}
              <div className="space-y-0.5">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/25'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <Icon 
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive 
                              ? 'text-white' 
                              : 'text-slate-400 group-hover:text-blue-400'
                          }`} 
                        />
                        <span className="line-clamp-2 leading-snug text-left break-words">{item.label}</span>
                      </div>

                      {/* Optional Badge or Arrow */}
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        {item.badge && (
                          <span 
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap ${
                              isActive 
                                ? 'bg-white/20 text-white' 
                                : getBadgeStyle(item.badge.variant)
                            }`}
                          >
                            {item.badge.text}
                          </span>
                        )}
                        {isActive && !item.badge && (
                          <ChevronRight className="w-3.5 h-3.5 text-white/70 shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. User Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/90">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2.5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-600 border border-slate-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <div className="mt-0.5">{getRoleBadge()}</div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
              title="Sair da Conta ou Trocar de Empresa"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Isolamento CAPI
            </span>
            <button 
              onClick={onLogout}
              className="hover:text-slate-200 transition underline underline-offset-2"
            >
              Trocar Empresa
            </button>
          </div>
        </div>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 z-20 border-r border-slate-800 shadow-xl">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar (Drawer Overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Slide-out Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full h-full z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
