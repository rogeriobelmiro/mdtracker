import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { LinkManager } from './components/LinkManager';
import { LeadCRM } from './components/LeadCRM';
import { IntegrationsAndEvents } from './components/IntegrationsAndEvents';
import { BroadcastCampaigns } from './components/BroadcastCampaigns';
import { WhatsAppChatInbox } from './components/WhatsAppChatInbox';
import { UserManagement } from './components/UserManagement';
import { CompanyProfile } from './components/CompanyProfile';
import { LoginScreen } from './components/LoginScreen';
import {
  fetchCompanies,
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  updateCompany,
  fetchStats,
  fetchLinks,
  createLink,
  updateLink,
  deleteLink,
  fetchLeads,
  updateLead,
  deleteLead,
  fetchSettings,
  updateSettings,
  fetchWebhookLogs,
  testWebhook,
} from './services/api';
import { CampaignLink, Lead, IntegrationSettings, StatsSummary, WebhookLog, User, Company } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'links' | 'leads' | 'events' | 'broadcast' | 'chat' | 'users' | 'company'>('dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Multi-tenant & User Management States
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Logged-in Session State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentCompany, setCurrentCompany] = useState<Company | null>(null);

  // Application Data States
  const [links, setLinks] = useState<CampaignLink[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [settings, setSettings] = useState<IntegrationSettings>({
    globalMetaPixelId: '',
    globalMetaToken: '',
    globalGoogleAdsId: '',
    globalGoogleAdsLabel: '',
    globalWebhookUrl: '',
    autoFireMetaOnLead: true,
    autoFireMetaOnConversion: true,
    autoFireGoogleOnConversion: true,
    autoFireWebhookOnLead: true,
    autoFireWebhookOnStageChange: true,
  });
  const [webhookLogs, setWebhookLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Initial Application State
  const loadData = async () => {
    try {
      const [linksRes, leadsRes, settingsRes, logsRes, companiesRes, usersRes] = await Promise.all([
        fetchLinks(),
        fetchLeads(),
        fetchSettings(),
        fetchWebhookLogs(),
        fetchCompanies(),
        fetchUsers()
      ]);

      setLinks(linksRes);
      setLeads(leadsRes);
      setSettings(settingsRes);
      setWebhookLogs(logsRes);
      
      if (companiesRes && companiesRes.length > 0) {
        setCompanies(companiesRes);
        if (currentCompany) {
          // Atualiza os dados da empresa atual caso tenham mudado (ex: logomarca, cnpj)
          setCurrentCompany(companiesRes.find(c => c.id === currentCompany.id) || currentCompany);
        }
      }
      if (usersRes && usersRes.length > 0) {
        setUsers(usersRes);
        if (currentUser) {
          setCurrentUser(usersRes.find(u => u.id === currentUser.id) || currentUser);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados do sistema:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Refresh stats every 10 seconds for real-time tracking
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter isolated data for the active company
  const companyLinks = useMemo(() => {
    if (!currentCompany) return [];
    return links.filter(l => !l.companyId || l.companyId === currentCompany.id);
  }, [links, currentCompany]);

  const companyLeads = useMemo(() => {
    if (!currentCompany) return [];
    return leads.filter(l => !l.companyId || l.companyId === currentCompany.id);
  }, [leads, currentCompany]);

  const companyWebhookLogs = useMemo(() => {
    if (!currentCompany) return [];
    return webhookLogs.filter(w => !w.companyId || w.companyId === currentCompany.id);
  }, [webhookLogs, currentCompany]);

  // Dynamically calculate isolated stats per company
  const companyStats: StatsSummary = useMemo(() => {
    const totalClicks = companyLinks.reduce((acc, l) => acc + (l.clicksCount || 0), 0);
    const totalLeads = companyLeads.length;
    const conversions = companyLeads.filter(l => l.stage === 'Convertido');
    const totalConversions = conversions.length;
    const totalRevenue = conversions.reduce((acc, l) => acc + (l.value || 0), 0);
    const conversionRate = totalLeads > 0 ? (totalConversions / totalLeads) * 100 : 0;

    // Find top campaign
    const campaignMap: Record<string, number> = {};
    companyLeads.forEach(l => {
      const camp = l.utmCampaign || 'Geral';
      campaignMap[camp] = (campaignMap[camp] || 0) + 1;
    });
    const sortedCamps = Object.entries(campaignMap).sort((a, b) => b[1] - a[1]);
    const topCampaign = sortedCamps.length > 0 ? sortedCamps[0][0] : 'Nenhuma';

    // Find top source
    const sourceMap: Record<string, number> = {};
    companyLeads.forEach(l => {
      const src = l.utmSource || l.source || 'Direto';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });
    const sortedSources = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]);
    const topSource = sortedSources.length > 0 ? sortedSources[0][0] : 'Nenhuma';

    return {
      totalClicks,
      totalLeads,
      totalConversions,
      totalRevenue,
      conversionRate,
      topCampaign,
      topSource
    };
  }, [companyLinks, companyLeads]);

  // Authentication Handlers
  const handleLoginSuccess = (user: User, company: Company) => {
    setCurrentUser(user);
    setCurrentCompany(company);

    // Adjust active tab based on user role
    if (user.role === 'attendant') {
      setActiveTab('chat');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentCompany(null);
  };

  // User Management Handlers (Admin)
  const handleAddUser = async (newUser: Omit<User, 'id' | 'createdAt'>) => {
    try {
      await createUser({ ...newUser, id: `usr-${Date.now()}` });
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao criar usuário');
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await updateUser(userId, updates);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('Tem certeza que deseja remover este colaborador?')) {
      try {
        await deleteUser(userId);
        await loadData();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Erro ao deletar usuário');
      }
    }
  };

  // Data Handlers
  const handleCreateLink = async (data: Partial<CampaignLink>) => {
    if (!currentCompany) return;
    await createLink({
      ...data,
      companyId: currentCompany.id
    });
    await loadData();
  };

  const handleUpdateLink = async (id: string, data: Partial<CampaignLink>) => {
    await updateLink(id, data);
    await loadData();
  };

  const handleDeleteLink = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este link de rastreamento?')) {
      await deleteLink(id);
      await loadData();
    }
  };

  const handleUpdateLead = async (id: string, data: Partial<Lead>) => {
    await updateLead(id, data);
    await loadData();
  };

  const handleDeleteLead = async (id: string) => {
    if (window.confirm('Tem certeza que deseja remover este lead do histórico?')) {
      await deleteLead(id);
      await loadData();
    }
  };

  const handleUpdateSettings = async (data: Partial<IntegrationSettings>) => {
    await updateSettings(data);
    await loadData();
  };

  const handleUpdateCompany = async (id: string, data: Partial<Company>) => {
    await updateCompany(id, data);
    await loadData();
  };

  const handleTestWebhook = async (url: string) => {
    const res = await testWebhook(url);
    await loadData();
    return res;
  };

  // Render Login Screen if not authenticated
  if (!currentUser || !currentCompany) {
    return (
      <LoginScreen
        companies={companies}
        users={users}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F1F5F9] text-slate-800 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-600">Iniciando MDTracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar with Multiempresa Switcher & User Profile */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => {
          setActiveTab('links');
          setIsCreateModalOpen(true);
        }}
        currentUser={currentUser}
        currentCompany={currentCompany}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'dashboard' && currentUser.role !== 'attendant' && (
          <DashboardOverview
            stats={companyStats}
            links={companyLinks}
            leads={companyLeads}
            onNavigateToLinks={() => setActiveTab('links')}
            onNavigateToLeads={() => setActiveTab('leads')}
          />
        )}

        {activeTab === 'links' && currentUser.role !== 'attendant' && (
          <LinkManager
            links={companyLinks}
            onCreateLink={handleCreateLink}
            onUpdateLink={handleUpdateLink}
            onDeleteLink={handleDeleteLink}
            isModalOpen={isCreateModalOpen}
            setIsModalOpen={setIsCreateModalOpen}
          />
        )}

        {activeTab === 'leads' && (
          <LeadCRM
            leads={companyLeads}
            onUpdateLead={handleUpdateLead}
            onDeleteLead={handleDeleteLead}
          />
        )}

        {activeTab === 'events' && currentUser.role !== 'attendant' && (
          <IntegrationsAndEvents
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            webhookLogs={companyWebhookLogs}
            onTestWebhook={handleTestWebhook}
          />
        )}

        {activeTab === 'broadcast' && currentUser.role !== 'attendant' && (
          <BroadcastCampaigns
            leads={companyLeads}
            links={companyLinks}
          />
        )}

        {activeTab === 'chat' && (
          <WhatsAppChatInbox
            leads={companyLeads}
            links={companyLinks}
            onUpdateLeadStage={(leadId, newStage) => {
              handleUpdateLead(leadId, { stage: newStage });
            }}
          />
        )}

        {activeTab === 'users' && currentUser.role === 'admin' && (
          <UserManagement
            currentCompany={currentCompany}
            currentUser={currentUser}
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
          />
        )}

        {activeTab === 'company' && currentUser.role === 'admin' && (
          <CompanyProfile
            currentCompany={currentCompany}
            onUpdateCompany={handleUpdateCompany}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 text-xs text-slate-500 py-4 mt-auto text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            MDTracker &copy; {new Date().getFullYear()} - {currentCompany.name} (CNPJ: {currentCompany.cnpj})
          </p>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Isolamento Multi-tenant Ativo
            </span>
            <span>Atribuição UTM</span>
            <span>Acesso: {currentUser.role.toUpperCase()}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
