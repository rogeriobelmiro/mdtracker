import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar, NavTabId } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { DashboardOverview } from './components/DashboardOverview';
import { LinkManager } from './components/LinkManager';
import { LeadCRM } from './components/LeadCRM';
import { IntegrationsAndEvents } from './components/IntegrationsAndEvents';
import { BroadcastCampaigns } from './components/BroadcastCampaigns';
import { WhatsAppChatInbox } from './components/WhatsAppChatInbox';
import { UserManagement } from './components/UserManagement';
import { CompanyProfile } from './components/CompanyProfile';
import { LoginScreen } from './components/LoginScreen';
import { ProductsManager } from './components/ProductsManager';
import { SmartPopupsManager } from './components/SmartPopupsManager';
import { AICopywriterManager } from './components/AICopywriterManager';
import { ChatbotManager } from './components/ChatbotManager';
import { WorkflowsManager } from './components/WorkflowsManager';
import { LandingPagesManager } from './components/LandingPagesManager';
import { VirtualDialer } from './components/VirtualDialer';
import { VirtualPhoneManager } from './components/VirtualPhoneManager';
import { LeadScoringAndLists } from './components/LeadScoringAndLists';
import { InstagramAutoDM } from './components/InstagramAutoDM';
import { TeamsManager } from './components/TeamsManager';
import { SupervisorLiveMonitor } from './components/SupervisorLiveMonitor';
import { SurveysManager } from './components/SurveysManager';
import { CustomDomainsManager } from './components/CustomDomainsManager';
import { EventGamificationManager } from './components/EventGamificationManager';
import { AIAgentsManager } from './components/AIAgentsManager';
import { FunnelCanvasBuilder } from './components/FunnelCanvasBuilder';
import { SuperAdminHotmartManager } from './components/SuperAdminHotmartManager';
import { PublicSalesWebsite } from './components/PublicSalesWebsite';
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
  createLead,
  updateLead,
  deleteLead,
  deleteLeadsBatch,
  fetchSettings,
  updateSettings,
  fetchWebhookLogs,
  testWebhook,
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchLeadPurchases,
  createLeadPurchase,
  deleteLeadPurchase,
  fetchPopups,
  createPopup,
  updatePopup,
  deletePopup,
} from './services/api';
import { CampaignLink, Lead, IntegrationSettings, StatsSummary, WebhookLog, User, Company, Product, LeadPurchase, SmartPopup } from './types';
import { useDialog } from './contexts/DialogContext';

export default function App() {
  const { alert, confirm } = useDialog();
  const [activeTab, setActiveTab] = useState<NavTabId>('dashboard');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [chatSelectedLeadId, setChatSelectedLeadId] = useState<string | null>(null);
  const [activeCallTarget, setActiveCallTarget] = useState<{ leadId: string; leadName: string; leadPhone: string } | null>(null);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [leadSearchQuery, setLeadSearchQuery] = useState<string>('');
  const [leadLinkIdFilter, setLeadLinkIdFilter] = useState<string | null>(null);

  // Multi-tenant & User Management States
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  // Logged-in Session State (Persisted in localStorage)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('mdtracker_user');
      if (!saved) return null;
      const parsed: User = JSON.parse(saved);
      if (parsed.companyId === 'comp-1786498560971' && !parsed.email?.toLowerCase().includes('@mudadigital.')) {
        localStorage.removeItem('mdtracker_user');
        localStorage.removeItem('mdtracker_company');
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  });
  const [currentCompany, setCurrentCompany] = useState<Company | null>(() => {
    try {
      const savedUserStr = localStorage.getItem('mdtracker_user');
      const savedCompStr = localStorage.getItem('mdtracker_company');
      if (!savedUserStr || !savedCompStr) return null;
      const parsedUser: User = JSON.parse(savedUserStr);
      const parsedComp: Company = JSON.parse(savedCompStr);
      if (parsedComp.id === 'comp-1786498560971' && !parsedUser.email?.toLowerCase().includes('@mudadigital.')) {
        localStorage.removeItem('mdtracker_user');
        localStorage.removeItem('mdtracker_company');
        return null;
      }
      return parsedComp;
    } catch {
      return null;
    }
  });

  // Application Data States
  const [links, setLinks] = useState<CampaignLink[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [authView, setAuthView] = useState<'site' | 'login'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const path = window.location.pathname || '';
      const search = window.location.search || '';
      if (hash === '#login' || path === '/login' || search.includes('login=true')) {
        return 'login';
      }
    }
    return 'site';
  });
  const [leadPurchases, setLeadPurchases] = useState<LeadPurchase[]>([]);
  const [popups, setPopups] = useState<SmartPopup[]>([]);
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

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Refs for state values to prevent stale closures in setInterval
  const stateRef = React.useRef({ startDate, endDate, currentCompany, currentUser });
  useEffect(() => {
    stateRef.current = { startDate, endDate, currentCompany, currentUser };
  }, [startDate, endDate, currentCompany, currentUser]);

  // Load Initial Application State
  const loadData = async (overrideCompanyId?: string, overrideStart?: string, overrideEnd?: string) => {
    try {
      const activeCompanyId = overrideCompanyId || stateRef.current.currentCompany?.id;
      if (!activeCompanyId) {
        setLoading(false);
        return;
      }
      const start = overrideStart !== undefined ? overrideStart : stateRef.current.startDate;
      const end = overrideEnd !== undefined ? overrideEnd : stateRef.current.endDate;

      const [linksRes, leadsRes, settingsRes, logsRes, companiesRes, usersRes, productsRes, purchasesRes, popupsRes] = await Promise.all([
        fetchLinks(start, end, activeCompanyId),
        fetchLeads(activeCompanyId),
        fetchSettings(activeCompanyId),
        fetchWebhookLogs(activeCompanyId),
        fetchCompanies(),
        fetchUsers(activeCompanyId),
        fetchProducts(activeCompanyId),
        fetchLeadPurchases(activeCompanyId),
        fetchPopups(activeCompanyId)
      ]);

      setLinks(linksRes);
      setLeads(leadsRes);
      setSettings(settingsRes);
      setWebhookLogs(logsRes);
      setProducts(productsRes || []);
      setLeadPurchases(purchasesRes || []);
      setPopups(popupsRes || []);
      
      if (companiesRes && companiesRes.length > 0) {
        setCompanies(companiesRes);
        if (stateRef.current.currentCompany && !overrideCompanyId) {
          const updatedComp = companiesRes.find(c => c.id === stateRef.current.currentCompany?.id);
          if (updatedComp) {
            setCurrentCompany(updatedComp);
            try { localStorage.setItem('mdtracker_company', JSON.stringify(updatedComp)); } catch {}
          }
        }
      }
      if (usersRes && usersRes.length > 0) {
        setUsers(usersRes);
        if (stateRef.current.currentUser && !overrideCompanyId) {
          const updatedUsr = usersRes.find(
            u => u.id === stateRef.current.currentUser?.id ||
                 u.email?.toLowerCase() === stateRef.current.currentUser?.email?.toLowerCase()
          );
          if (updatedUsr) {
            setCurrentUser(updatedUsr);
            try { localStorage.setItem('mdtracker_user', JSON.stringify(updatedUsr)); } catch {}
            if (updatedUsr.companyId && updatedUsr.companyId !== stateRef.current.currentCompany?.id && companiesRes) {
              const matchedComp = companiesRes.find(c => c.id === updatedUsr.companyId);
              if (matchedComp) {
                setCurrentCompany(matchedComp);
                try { localStorage.setItem('mdtracker_company', JSON.stringify(matchedComp)); } catch {}
              }
            }
          }
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
    const interval = setInterval(() => {
      loadData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter isolated data for the active company
  const companyLinks = useMemo(() => {
    if (!currentCompany) return [];
    return links.filter(l => l.companyId === currentCompany.id);
  }, [links, currentCompany]);

  const companyLeads = useMemo(() => {
    if (!currentCompany) return [];
    let filtered = leads.filter(l => {
      if (l.companyId) return l.companyId === currentCompany.id;
      
      const link = links.find(lnk => lnk.id === l.linkId);
      if (link && link.companyId) return link.companyId === currentCompany.id;
      
      return false;
    });

    if (startDate && endDate) {
      filtered = filtered.filter(l => {
        const d = l.createdAt.split('T')[0];
        return d >= startDate && d <= endDate;
      });
    }
    return filtered;
  }, [leads, currentCompany, links, startDate, endDate]);

  const companyWebhookLogs = useMemo(() => {
    if (!currentCompany) return [];
    return webhookLogs.filter(w => w.companyId === currentCompany.id);
  }, [webhookLogs, currentCompany]);

  const companyPopups = useMemo(() => {
    if (!currentCompany) return [];
    return popups.filter(p => p.companyId === currentCompany.id);
  }, [popups, currentCompany]);

  const companyUsers = useMemo(() => {
    if (!currentCompany) return [];
    return users.filter(u => u.companyId === currentCompany.id);
  }, [users, currentCompany]);

  // Dynamically calculate isolated stats per company
  const companyStats: StatsSummary = useMemo(() => {
    const totalClicks = companyLinks.reduce((acc, l) => acc + (l.clicksCount || 0), 0);
    const totalLeads = companyLeads.length;
    const conversions = companyLeads.filter(l => l.stage === 'Convertido');
    const totalConversions = conversions.length;
    
    // Revenue is now the sum of lead purchases
    const totalRevenue = leadPurchases.reduce((acc, p) => acc + (p.amount || 0), 0);
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
    // Clear any previous company's data immediately to prevent cross-company bleed
    setLinks([]);
    setLeads([]);
    setProducts([]);
    setLeadPurchases([]);
    setPopups([]);
    setWebhookLogs([]);
    setSettings({
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

    setCurrentUser(user);
    setCurrentCompany(company);
    stateRef.current = { ...stateRef.current, currentCompany: company, currentUser: user };
    try {
      localStorage.setItem('mdtracker_user', JSON.stringify(user));
      localStorage.setItem('mdtracker_company', JSON.stringify(company));
    } catch {}
    
    // Fetch data specifically for this company right after login
    loadData(company.id);

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
    setLinks([]);
    setLeads([]);
    setProducts([]);
    setLeadPurchases([]);
    setPopups([]);
    setWebhookLogs([]);
    stateRef.current = { ...stateRef.current, currentCompany: null, currentUser: null };
    try {
      localStorage.removeItem('mdtracker_user');
      localStorage.removeItem('mdtracker_company');
    } catch {}
  };

  // User Management Handlers (Admin)
  const handleAddUser = async (newUser: Omit<User, 'id' | 'createdAt'>) => {
    try {
      await createUser({ ...newUser, id: `usr-${Date.now()}` });
      await loadData();
    } catch (err) {
      await alert(err instanceof Error ? err.message : 'Erro ao criar usuário');
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      await updateUser(userId, updates);
      await loadData();
    } catch (err) {
      await alert(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (await confirm('Tem certeza que deseja remover este colaborador?')) {
      try {
        await deleteUser(userId);
        await loadData();
      } catch (err) {
        await alert(err instanceof Error ? err.message : 'Erro ao deletar usuário');
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
    if (await confirm('Tem certeza que deseja excluir este link de rastreamento?')) {
      await deleteLink(id);
      await loadData();
    }
  };

  const handleCreateLead = async (data: Partial<Lead>): Promise<Lead> => {
    const payload = currentCompany ? { ...data, companyId: currentCompany.id } : data;
    const newLead = await createLead(payload);
    await loadData();
    return newLead;
  };

  const handleUpdateLead = async (id: string, data: Partial<Lead>) => {
    await updateLead(id, data);
    await loadData();
  };

  const handleDeleteLead = async (id: string) => {
    if (await confirm('Tem certeza que deseja remover este lead do histórico?')) {
      await deleteLead(id);
      await loadData();
    }
  };

  const handleDeleteLeadsBatch = async (ids: string[]) => {
    if (await confirm(`Tem certeza que deseja remover ${ids.length} leads selecionados do histórico?`)) {
      await deleteLeadsBatch(ids);
      await loadData();
    }
  };

  const handleUpdateSettings = async (data: Partial<IntegrationSettings>) => {
    const payload = currentCompany ? { ...data, companyId: currentCompany.id } : data;
    await updateSettings(payload);
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

  const handleCreateProduct = async (data: Partial<Product>) => {
    try {
      await createProduct(data);
      await loadData();
    } catch (err: any) {
      await alert('Erro ao criar produto: ' + err.message);
    }
  };

  const handleUpdateProduct = async (id: string, data: Partial<Product>) => {
    await updateProduct(id, data);
    await loadData();
  };

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
    await loadData();
  };

  const handleCreateLeadPurchase = async (data: Partial<LeadPurchase>) => {
    await createLeadPurchase(data);
    await loadData();
  };

  const handleCreatePopup = async (data: Partial<SmartPopup>) => {
    try {
      await createPopup(data);
      await loadData();
    } catch (err: any) {
      await alert('Erro ao criar pop-up: ' + err.message);
    }
  };

  const handleUpdatePopup = async (id: string, data: Partial<SmartPopup>) => {
    try {
      await updatePopup(id, data);
      await loadData();
    } catch (err: any) {
      await alert('Erro ao atualizar pop-up: ' + err.message);
    }
  };

  const handleDeletePopup = async (id: string) => {
    try {
      await deletePopup(id);
      await loadData();
    } catch (err: any) {
      await alert('Erro ao excluir pop-up: ' + err.message);
    }
  };

  // Render Public Sales Website or Login Screen if not authenticated
  if (!currentUser || !currentCompany) {
    if (authView === 'login') {
      return (
        <LoginScreen
          companies={companies}
          users={users}
          onLoginSuccess={handleLoginSuccess}
          onBackToSite={() => setAuthView('site')}
        />
      );
    }
    return (
      <PublicSalesWebsite
        onOpenLogin={() => setAuthView('login')}
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
    <div className="flex h-screen bg-[#F1F5F9] text-slate-800 font-sans overflow-hidden selection:bg-blue-600 selection:text-white">
      
      {/* Modern Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => {
          setActiveTab('links');
          setIsCreateModalOpen(true);
        }}
        currentUser={currentUser}
        currentCompany={currentCompany}
        onLogout={handleLogout}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area: Topbar + Scrollable Viewport + Footer */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Topbar */}
        <Topbar
          activeTab={activeTab}
          currentUser={currentUser}
          currentCompany={currentCompany}
          startDate={startDate}
          setStartDate={(v) => { setStartDate(v); loadData(undefined, v, endDate); }}
          endDate={endDate}
          setEndDate={(v) => { setEndDate(v); loadData(undefined, startDate, v); }}
          onOpenCreateModal={() => {
            setActiveTab('links');
            setIsCreateModalOpen(true);
          }}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Scrollable Viewport */}
        <main className={`flex-1 ${activeTab === 'chatbot' || activeTab === 'visual_funnels' ? 'overflow-hidden p-0' : 'overflow-y-auto px-4 sm:px-6 lg:px-8 py-6'}`}>
          <div className={activeTab === 'chatbot' || activeTab === 'visual_funnels' ? 'w-full h-full' : 'max-w-7xl mx-auto w-full'}>
            {activeTab === 'dashboard' && currentUser.role !== 'attendant' && (
              <DashboardOverview
                stats={companyStats}
                links={companyLinks}
                leads={companyLeads}
                onNavigateToLinks={(linkId) => {
                  if (linkId) {
                    setEditingLinkId(linkId);
                  }
                  setActiveTab('links');
                }}
                onNavigateToLeads={() => setActiveTab('leads')}
              />
            )}

            {activeTab === 'visual_funnels' && currentUser.role !== 'attendant' && (
              <FunnelCanvasBuilder
                currentCompany={currentCompany}
                leads={companyLeads}
                onNavigateToTab={(tab) => setActiveTab(tab as NavTabId)}
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
                currentCompany={currentCompany}
                editingLinkId={editingLinkId}
                onClearEditingLinkId={() => setEditingLinkId(null)}
                startDate={startDate}
                endDate={endDate}
                setStartDate={setStartDate}
                setEndDate={(v) => { setEndDate(v); loadData(undefined, startDate, v); }}
                onFilterLeadsByLink={(linkId) => {
                  setLeadLinkIdFilter(linkId);
                  setActiveTab('leads');
                }}
              />
            )}

            {activeTab === 'leads' && (
              <LeadCRM
                leads={companyLeads}
                products={products}
                leadPurchases={leadPurchases}
                onCreatePurchase={handleCreateLeadPurchase}
                onUpdateLead={handleUpdateLead}
                onDeleteLead={handleDeleteLead}
                onDeleteLeadsBatch={handleDeleteLeadsBatch}
                searchQuery={leadSearchQuery}
                setSearchQuery={setLeadSearchQuery}
                linkIdFilter={leadLinkIdFilter}
                setLinkIdFilter={setLeadLinkIdFilter}
                links={companyLinks}
                onOpenWhatsApp={(leadId) => {
                  setChatSelectedLeadId(leadId);
                  setActiveTab('chat');
                }}
                onInitiateCall={(lead) => {
                  setActiveCallTarget({
                    leadId: lead.id,
                    leadName: lead.name,
                    leadPhone: lead.phone || ''
                  });
                }}
              />
            )}

            {activeTab === 'smart_lists' && (
              <LeadScoringAndLists
                leads={companyLeads}
                currentCompany={currentCompany}
                currentUser={currentUser}
                onInitiateCall={(target) => {
                  setActiveCallTarget({
                    leadId: target.id,
                    leadName: target.name,
                    leadPhone: target.phone
                  });
                }}
                onOpenWhatsApp={(leadId) => {
                  setChatSelectedLeadId(leadId);
                  setActiveTab('chat');
                }}
                onNavigateToTab={(tab) => setActiveTab(tab as any)}
                onRefreshLeads={loadData}
              />
            )}

            {activeTab === 'virtual_phone' && (
              <VirtualPhoneManager
                leads={companyLeads}
                currentCompany={currentCompany}
                currentUser={currentUser}
                onInitiateCall={(target) => {
                  setActiveCallTarget({
                    leadId: target.id,
                    leadName: target.name,
                    leadPhone: target.phone
                  });
                }}
                onOpenWhatsApp={(leadId) => {
                  setChatSelectedLeadId(leadId);
                  setActiveTab('chat');
                }}
                onNavigateToTab={(tab) => setActiveTab(tab as any)}
              />
            )}

            {activeTab === 'teams' && (
              currentUser.role !== 'attendant' ? (
                <TeamsManager
                  currentCompany={currentCompany}
                  currentUser={currentUser}
                  users={companyUsers}
                  onNavigateToTab={(tab) => setActiveTab(tab as any)}
                />
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-lg mx-auto mt-12 shadow-xs">
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                    🔒
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Acesso Restrito à Gestão de Equipes</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Seu perfil é de Atendente. Somente Administradores e Gerentes podem configurar as filas e equipes de vendas.
                  </p>
                </div>
              )
            )}

            {activeTab === 'supervisor_monitor' && (
              currentUser.role !== 'attendant' ? (
                <SupervisorLiveMonitor
                  currentCompany={currentCompany}
                  currentUser={currentUser}
                  leads={companyLeads}
                  links={companyLinks}
                  users={companyUsers}
                  onOpenWhatsApp={(leadId) => {
                    setChatSelectedLeadId(leadId);
                    setActiveTab('chat');
                  }}
                  onInitiateCall={(target) => {
                    setActiveCallTarget({
                      leadId: target.id,
                      leadName: target.name,
                      leadPhone: target.phone
                    });
                  }}
                />
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-lg mx-auto mt-12 shadow-xs">
                  <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                    🔒
                  </div>
                  <h3 className="text-base font-bold text-slate-800">Acesso Restrito à Torre de Supervisão</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    A Torre de Supervisão ao vivo é reservada para Gerentes e Supervisores da equipe comercial.
                  </p>
                </div>
              )
            )}

            {activeTab === 'events' && currentUser.role !== 'attendant' && (
              <IntegrationsAndEvents
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
                webhookLogs={companyWebhookLogs}
                onTestWebhook={handleTestWebhook}
                currentCompany={currentCompany}
              />
            )}

            {activeTab === 'broadcast' && currentUser.role !== 'attendant' && (
              <BroadcastCampaigns
                leads={companyLeads}
                links={companyLinks}
                currentCompany={currentCompany}
                products={products}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'landing_pages' && currentUser.role !== 'attendant' && (
              <LandingPagesManager
                currentCompany={currentCompany}
                products={products}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'surveys' && currentUser.role !== 'attendant' && (
              <SurveysManager
                currentCompany={currentCompany}
              />
            )}

            {activeTab === 'custom_domains' && currentUser.role !== 'attendant' && (
              <CustomDomainsManager
                currentCompany={currentCompany}
              />
            )}

            {activeTab === 'event_gamification' && currentUser.role !== 'attendant' && (
              <EventGamificationManager
                currentCompany={currentCompany}
              />
            )}

            {activeTab === 'popups' && currentUser.role !== 'attendant' && (
              <SmartPopupsManager
                popups={companyPopups}
                currentCompany={currentCompany}
                leads={companyLeads}
                onNavigateToTab={(tab) => setActiveTab(tab)}
                onFilterLeadsByPopup={(popupName) => {
                  setLeadSearchQuery(popupName);
                  setActiveTab('leads');
                }}
                onCreatePopup={handleCreatePopup}
                onUpdatePopup={handleUpdatePopup}
                onDeletePopup={handleDeletePopup}
              />
            )}

            {activeTab === 'workflows' && currentUser.role !== 'attendant' && (
              <WorkflowsManager
                currentCompany={currentCompany}
                leads={companyLeads}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'ai_agents' && currentUser.role !== 'attendant' && (
              <AIAgentsManager
                currentCompany={currentCompany}
                leads={companyLeads}
                products={products}
                links={companyLinks}
                onUpdateLead={handleUpdateLead}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'chatbot' && currentUser.role !== 'attendant' && (
              <ChatbotManager
                settings={settings}
                products={products}
                currentCompany={currentCompany}
                leads={companyLeads}
                onUpdateLead={handleUpdateLead}
                onCreateLead={handleCreateLead}
                onUpdateSettings={handleUpdateSettings}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'instagram_auto_dm' && currentUser.role !== 'attendant' && (
              <InstagramAutoDM
                currentCompany={currentCompany}
                currentUser={currentUser}
                onNavigateToTab={(tab) => setActiveTab(tab as any)}
                onFilterLeadsByRule={(ruleOrQuery) => {
                  setLeadSearchQuery(ruleOrQuery);
                  setActiveTab('leads');
                }}
              />
            )}

            {activeTab === 'chat' && (
              <WhatsAppChatInbox
                leads={companyLeads}
                links={companyLinks}
                currentUser={currentUser}
                currentCompany={currentCompany}
                users={companyUsers}
                initialSelectedLeadId={chatSelectedLeadId}
                onUpdateLeadStage={(leadId, newStage) => {
                  handleUpdateLead(leadId, { stage: newStage });
                }}
                onUpdateLead={handleUpdateLead}
                onRefreshLeads={loadData}
              />
            )}

            {activeTab === 'users' && currentUser.role === 'admin' && (
              <UserManagement
                currentCompany={currentCompany}
                currentUser={currentUser}
                users={companyUsers}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
              />
            )}

            {activeTab === 'products' && currentUser.role === 'admin' && (
              <ProductsManager
                products={products}
                currentCompany={currentCompany}
                onCreateProduct={handleCreateProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === 'ai' && currentUser.role !== 'attendant' && (
              <AICopywriterManager
                products={products}
                currentCompany={currentCompany}
                onNavigateToTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'company' && currentUser.role === 'admin' && (
              <CompanyProfile
                currentCompany={currentCompany}
                onUpdateCompany={handleUpdateCompany}
              />
            )}

            {activeTab === 'saas_admin' && (
              <SuperAdminHotmartManager
                currentUser={currentUser}
              />
            )}
          </div>
        </main>

        {/* Slim Footer */}
        <footer className="bg-white border-t border-slate-200 text-xs text-slate-500 py-3 shrink-0 text-center">
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

      {/* Global WebRTC Softphone & Virtual Dialer */}
      <VirtualDialer
        leads={companyLeads}
        currentCompany={currentCompany}
        currentUser={currentUser}
        activeCallTarget={activeCallTarget}
        onClearCallTarget={() => setActiveCallTarget(null)}
        onCallCreated={(_newCall) => {
          // Sync any state
        }}
        onLeadStageUpdated={(leadId, newStage) => {
          handleUpdateLead(leadId, { stage: newStage });
        }}
      />

    </div>
  );
}
