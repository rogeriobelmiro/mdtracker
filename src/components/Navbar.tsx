import React from 'react';
import { 
  BarChart3, Link as LinkIcon, Users, Zap, Plus, Radio, MessageSquare, 
  Building2, UserCheck, LogOut, ShieldCheck, UserPlus
} from 'lucide-react';
import { User, Company } from '../types';

interface NavbarProps {
  activeTab: 'dashboard' | 'links' | 'leads' | 'events' | 'broadcast' | 'chat' | 'users' | 'company';
  setActiveTab: (tab: 'dashboard' | 'links' | 'leads' | 'events' | 'broadcast' | 'chat' | 'users' | 'company') => void;
  onOpenCreateModal: () => void;
  currentUser: User;
  currentCompany: Company;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenCreateModal,
  currentUser,
  currentCompany,
  onLogout
}) => {
  const getRoleBadge = () => {
    switch (currentUser.role) {
      case 'admin':
        return <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-200">👑 Admin</span>;
      case 'manager':
        return <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-blue-200">💼 Gerente</span>;
      case 'attendant':
        return <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-200">🎧 Atendente</span>;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Company Switcher & User Profile Bar */}
        <div className="flex items-center justify-between border-b border-slate-100 py-1.5 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Empresa Ativa:</span>
            <span className="bg-slate-900 text-white text-[11px] font-bold px-2.5 py-0.5 rounded flex items-center gap-1.5 shadow-2xs">
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              {currentCompany.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-800">{currentUser.name}</span>
              {getRoleBadge()}
            </div>
            <button
              onClick={onLogout}
              className="text-slate-500 hover:text-red-600 text-[11px] font-bold flex items-center gap-1 px-2 py-0.5 rounded hover:bg-red-50 transition"
              title="Trocar de Empresa ou Sair"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair / Trocar
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            {currentCompany.logoUrl ? (
              <img src={currentCompany.logoUrl} alt="Logo" className="h-8 w-8 object-contain rounded bg-slate-100" />
            ) : (
              <div className="w-8 h-8 bg-blue-600 rounded-sm flex items-center justify-center text-white font-bold shadow-xs">
                <span className="font-bold text-lg">{currentCompany.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-slate-900 tracking-tight">MDTracker</span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-blue-200">
                  Multiempresa
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Role Based) */}
          <nav className="hidden md:flex items-center space-x-1">
            
            {/* Dashboard allowed for admin & manager */}
            {currentUser.role !== 'attendant' && (
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Visão Geral
              </button>
            )}

            {/* Links allowed for admin & manager */}
            {currentUser.role !== 'attendant' && (
              <button
                onClick={() => setActiveTab('links')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'links'
                    ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                Gerador de Links
              </button>
            )}

            {/* Leads allowed for ALL */}
            <button
              onClick={() => setActiveTab('leads')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'leads'
                  ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Gestão de Leads
            </button>

            {/* Chat WhatsApp allowed for ALL */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                activeTab === 'chat'
                  ? 'bg-emerald-50 text-emerald-700 font-bold border-l-4 border-emerald-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              Chat WhatsApp
            </button>

            {/* Disparos allowed for admin & manager */}
            {currentUser.role !== 'attendant' && (
              <button
                onClick={() => setActiveTab('broadcast')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'broadcast'
                    ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                Disparos
              </button>
            )}

            {/* Integrations allowed for admin & manager */}
            {currentUser.role !== 'attendant' && (
              <button
                onClick={() => setActiveTab('events')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'events'
                    ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                Integrações
              </button>
            )}

            {/* Equipe / Usuários (Cadastro de Usuários pelo Adm) */}
            {currentUser.role === 'admin' && (
              <>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    activeTab === 'users'
                      ? 'bg-purple-50 text-purple-700 font-bold border-l-4 border-purple-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-purple-600" />
                  Usuários
                </button>
                <button
                  onClick={() => setActiveTab('company')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                    activeTab === 'company'
                      ? 'bg-orange-50 text-orange-700 font-bold border-l-4 border-orange-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-orange-600" />
                  Minha Empresa
                </button>
              </>
            )}

          </nav>

          {/* Quick Action Button */}
          <div className="flex items-center space-x-3">
            {currentUser.role !== 'attendant' && (
              <button
                onClick={onOpenCreateModal}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-1.5 rounded-md transition flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+ Novo Link</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-between border-t border-slate-200 py-2 overflow-x-auto gap-2">
          {currentUser.role !== 'attendant' && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${
                activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600' : 'text-slate-600'
              }`}
            >
              Visão Geral
            </button>
          )}

          <button
            onClick={() => setActiveTab('leads')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${
              activeTab === 'leads' ? 'bg-blue-50 text-blue-700 font-bold border-l-2 border-blue-600' : 'text-slate-600'
            }`}
          >
            Leads
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${
              activeTab === 'chat' ? 'bg-emerald-50 text-emerald-700 font-bold border-l-2 border-emerald-600' : 'text-slate-600'
            }`}
          >
            Chat
          </button>

          {currentUser.role === 'admin' && (
            <>
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${
                  activeTab === 'users' ? 'bg-purple-50 text-purple-700 font-bold border-l-2 border-purple-600' : 'text-slate-600'
                }`}
              >
                Usuários
              </button>
              <button
                onClick={() => setActiveTab('company')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium whitespace-nowrap ${
                  activeTab === 'company' ? 'bg-orange-50 text-orange-700 font-bold border-l-2 border-orange-600' : 'text-slate-600'
                }`}
              >
                Empresa
              </button>
            </>
          )}
        </div>

      </div>
    </header>
  );
};
