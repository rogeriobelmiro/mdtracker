import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  GitBranch,
  Plus,
  Play,
  RotateCcw,
  Trash2,
  Edit3,
  Copy,
  Clock,
  MessageSquare,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Users,
  Zap,
  Sparkles,
  Tag,
  Sliders,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Send,
  HelpCircle,
  X,
  Globe,
  Code,
  Check,
  RefreshCw,
  Calendar,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Lock,
  Unlock,
  Move,
  Link2,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Phone,
  Layout,
  MousePointer,
  Share2,
  Folder,
  Bookmark,
  Compass,
  Eye,
  Save,
  CheckCheck
} from 'lucide-react';
import {
  VisualFunnel,
  VisualFunnelNode,
  VisualFunnelEdge,
  FunnelNodeType,
  Company,
  Lead,
  CampaignLink,
  LandingPage,
  MarketingWorkflow,
  SmartPopup
} from '../types';
import {
  fetchVisualFunnels,
  createVisualFunnel,
  updateVisualFunnel,
  deleteVisualFunnel,
  fetchLinks,
  fetchLandingPages,
  fetchWorkflows,
  fetchPopups
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';

interface FunnelCanvasBuilderProps {
  currentCompany: Company;
  leads: Lead[];
  onNavigateToTab?: (tab: string) => void;
}

export const FunnelCanvasBuilder: React.FC<FunnelCanvasBuilderProps> = ({
  currentCompany,
  leads,
  onNavigateToTab
}) => {
  const { alert, confirm } = useDialog();

  // Funnels State
  const [funnels, setFunnels] = useState<VisualFunnel[]>([]);
  const [currentFunnel, setCurrentFunnel] = useState<VisualFunnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'funnels' | 'templates' | 'community'>('funnels');

  // Related Entities in Company for 1-Click Integration
  const [companyLinks, setCompanyLinks] = useState<CampaignLink[]>([]);
  const [companyLps, setCompanyLps] = useState<LandingPage[]>([]);
  const [companyWorkflows, setCompanyWorkflows] = useState<MarketingWorkflow[]>([]);
  const [companyPopups, setCompanyPopups] = useState<SmartPopup[]>([]);

  // Canvas Viewport & Interaction
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [isLocked, setIsLocked] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);

  // Selection & Connecting
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Right Drawer for Node Config
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Left Sidebar Expand/Collapse
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    traffic: true,
    pages: true,
    conversion: true,
    nurture: true
  });

  const canvasRef = useRef<HTMLDivElement>(null);

  // Load all initial funnels and entities
  const loadAll = async () => {
    try {
      setLoading(true);
      const [fList, links, lps, wfs, pops] = await Promise.all([
        fetchVisualFunnels(currentCompany.id),
        fetchLinks(currentCompany.id).catch(() => []),
        fetchLandingPages(currentCompany.id).catch(() => []),
        fetchWorkflows(currentCompany.id).catch(() => []),
        fetchPopups(currentCompany.id).catch(() => [])
      ]);

      setFunnels(fList);
      setCompanyLinks(links || []);
      setCompanyLps(lps || []);
      setCompanyWorkflows(wfs || []);
      setCompanyPopups(pops || []);

      if (fList.length > 0) {
        setCurrentFunnel(fList[0]);
        if (fList[0].viewport) {
          setPan({ x: fList[0].viewport.x || 0, y: fList[0].viewport.y || 0 });
          setZoom(fList[0].viewport.zoom || 1);
        }
      }
    } catch (err: any) {
      console.error('Erro ao carregar funis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [currentCompany.id]);

  // Selected Node Object
  const selectedNode = useMemo(() => {
    if (!currentFunnel || !selectedNodeId) return null;
    return currentFunnel.nodes.find(n => n.id === selectedNodeId) || null;
  }, [currentFunnel, selectedNodeId]);

  // Handle Pan Events on Canvas Background
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'svg') {
      setSelectedNodeId(null);
      setIsDrawerOpen(false);
      if (!isLocked) {
        setIsPanning(true);
        setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const curX = (e.clientX - canvasRect.left - pan.x) / zoom;
      const curY = (e.clientY - canvasRect.top - pan.y) / zoom;
      setMousePos({ x: curX, y: curY });
    }

    if (isPanning && !isLocked) {
      setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
    } else if (draggingNodeId && currentFunnel) {
      const newX = Math.round((e.clientX - (canvasRect?.left || 0) - pan.x) / zoom - dragOffset.x);
      const newY = Math.round((e.clientY - (canvasRect?.top || 0) - pan.y) / zoom - dragOffset.y);

      setCurrentFunnel({
        ...currentFunnel,
        nodes: currentFunnel.nodes.map(n =>
          n.id === draggingNodeId ? { ...n, x: newX, y: newY } : n
        )
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setConnectingSourceId(null);
  };

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: VisualFunnelNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setIsDrawerOpen(true);
    if (isLocked) return;

    setDraggingNodeId(node.id);
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (canvasRect) {
      const mouseCanvasX = (e.clientX - canvasRect.left - pan.x) / zoom;
      const mouseCanvasY = (e.clientY - canvasRect.top - pan.y) / zoom;
      setDragOffset({
        x: mouseCanvasX - node.x,
        y: mouseCanvasY - node.y
      });
    }
  };

  // Connect Two Nodes via Pin
  const handleStartConnecting = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    setConnectingSourceId(nodeId);
  };

  const handleEndConnecting = (e: React.MouseEvent, targetNodeId: string) => {
    e.stopPropagation();
    if (!connectingSourceId || connectingSourceId === targetNodeId || !currentFunnel) {
      setConnectingSourceId(null);
      return;
    }

    // Check if edge already exists
    const exists = currentFunnel.edges.some(
      ed => ed.source === connectingSourceId && ed.target === targetNodeId
    );
    if (!exists) {
      const newEdge: VisualFunnelEdge = {
        id: `edge-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        source: connectingSourceId,
        target: targetNodeId,
        label: 'Avançam'
      };
      setCurrentFunnel({
        ...currentFunnel,
        edges: [...currentFunnel.edges, newEdge]
      });
    }
    setConnectingSourceId(null);
  };

  // Add Component to Canvas
  const handleAddComponent = (type: FunnelNodeType, title: string, subtitle?: string) => {
    if (!currentFunnel) return;
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    const centerX = canvasRect ? (-pan.x + canvasRect.width / 2) / zoom - 100 : 300;
    const centerY = canvasRect ? (-pan.y + canvasRect.height / 2) / zoom - 60 : 250;

    const newNodeId = `node-${Date.now()}`;
    const newNode: VisualFunnelNode = {
      id: newNodeId,
      type,
      title,
      subtitle: subtitle || 'Etapa do Funil',
      x: Math.round(centerX + (Math.random() * 60 - 30)),
      y: Math.round(centerY + (Math.random() * 60 - 30)),
      data: {
        visitors: 0,
        leads: 0,
        conversions: 0,
        conversionRate: 0,
        status: 'active'
      }
    };

    setCurrentFunnel({
      ...currentFunnel,
      nodes: [...currentFunnel.nodes, newNode]
    });
    setSelectedNodeId(newNodeId);
    setIsDrawerOpen(true);
  };

  // Save Funnel to DB
  const handleSave = async (saveAsTemplate = false) => {
    if (!currentFunnel) return;
    try {
      setSaving(true);
      const payload: Partial<VisualFunnel> = {
        ...currentFunnel,
        viewport: { x: pan.x, y: pan.y, zoom },
        isTemplate: saveAsTemplate ? true : currentFunnel.isTemplate,
        updatedAt: new Date().toISOString()
      };

      if (saveAsTemplate) {
        payload.id = `template-${Date.now()}`;
        payload.name = `${currentFunnel.name} (Template)`;
        const created = await createVisualFunnel(payload);
        setFunnels(prev => [created, ...prev]);
        await alert('⭐ Funil salvo como template na sua biblioteca!', 'success');
      } else {
        const updated = await updateVisualFunnel(currentFunnel.id, payload);
        setCurrentFunnel(updated);
        setFunnels(prev => prev.map(f => f.id === updated.id ? updated : f));
        await alert('✅ Fluxo do funil salvo com sucesso!', 'success');
      }
    } catch (err: any) {
      await alert(err.message || 'Erro ao salvar funil', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Create New Empty Funnel
  const handleCreateNewFunnel = async () => {
    const newFunnel: Partial<VisualFunnel> = {
      companyId: currentCompany.id,
      name: 'Novo Funil de Rastreamento',
      description: 'Mapeamento visual da esteira de vendas e conversão.',
      category: 'Geral',
      isTemplate: false,
      nodes: [
        {
          id: 'node-start',
          type: 'traffic_meta',
          title: 'Meta Ads',
          subtitle: 'Anúncios no Instagram/Facebook',
          x: 100,
          y: 200,
          data: { visitors: 0, leads: 0, status: 'active' }
        },
        {
          id: 'node-link',
          type: 'whatsapp_link',
          title: 'Link WhatsApp Rastreado',
          subtitle: 'Com disparo Meta CAPI',
          x: 480,
          y: 200,
          data: { conversions: 0, status: 'active' }
        }
      ],
      edges: [
        { id: 'edge-1', source: 'node-start', target: 'node-link', label: 'Cliques' }
      ],
      viewport: { x: 0, y: 0, zoom: 1 },
      metrics: { investment: 0, totalLeads: 0, cpl: 0, conversionRate: 0 }
    };

    try {
      const created = await createVisualFunnel(newFunnel);
      setFunnels(prev => [created, ...prev]);
      setCurrentFunnel(created);
      setSelectedNodeId(null);
      setPan({ x: 0, y: 0 });
      setZoom(1);
    } catch (err: any) {
      await alert(err.message || 'Erro ao criar funil', 'error');
    }
  };

  // Auto Organize Flow Layout
  const handleAutoOrganize = () => {
    if (!currentFunnel) return;
    const nodes = [...currentFunnel.nodes];
    const columnMap: Record<string, number> = {
      traffic_meta: 0,
      traffic_google: 0,
      traffic_instagram: 0,
      traffic_tiktok: 0,
      traffic_organic: 0,
      traffic_creative: 0,
      landing_page: 1,
      popup: 1,
      whatsapp_link: 2,
      whatsapp_chat: 2,
      checkout: 3,
      conversion_sale: 3,
      automation_sequence: 2,
      crm_stage: 3
    };

    const counts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0 };
    const reorganized = nodes.map(node => {
      const col = columnMap[node.type] ?? 1;
      const row = counts[col] || 0;
      counts[col] = (counts[col] || 0) + 1;
      return {
        ...node,
        x: 80 + col * 380,
        y: 120 + row * 180
      };
    });

    setCurrentFunnel({
      ...currentFunnel,
      nodes: reorganized
    });
  };

  // Pull Real System Metrics into Selected Node
  const handleSyncRealMetrics = (node: VisualFunnelNode) => {
    if (!currentFunnel) return;
    let visitors = node.data.visitors || 0;
    let leadsCount = node.data.leads || 0;
    let conversions = node.data.conversions || 0;

    if (node.data.linkId) {
      const lk = companyLinks.find(l => l.id === node.data.linkId);
      if (lk) {
        visitors = lk.clicksCount || 0;
        leadsCount = leads.filter(ld => ld.linkId === lk.id).length;
        conversions = leadsCount;
      }
    } else if (node.data.landingPageId) {
      const lp = companyLps.find(p => p.id === node.data.landingPageId);
      if (lp) {
        visitors = lp.visitorsCount || 0;
        leadsCount = lp.leadsCount || 0;
        conversions = leadsCount;
      }
    } else if (node.data.workflowId) {
      const wf = companyWorkflows.find(w => w.id === node.data.workflowId);
      if (wf) {
        visitors = wf.enrolledCount || 0;
        conversions = wf.conversionsCount || 0;
        leadsCount = wf.executedCount || 0;
      }
    }

    const rate = visitors > 0 ? Number(((conversions / visitors) * 100).toFixed(1)) : 0;
    const updatedNodes = currentFunnel.nodes.map(n =>
      n.id === node.id
        ? {
            ...n,
            data: {
              ...n.data,
              visitors,
              leads: leadsCount,
              conversions,
              conversionRate: rate
            }
          }
        : n
    );

    setCurrentFunnel({
      ...currentFunnel,
      nodes: updatedNodes
    });
  };

  // Node Color & Icon Resolver
  const getNodeConfig = (type: FunnelNodeType) => {
    switch (type) {
      case 'traffic_meta':
        return {
          icon: <Globe className="w-4 h-4 text-blue-400" />,
          accent: 'border-blue-500/80 bg-blue-950/40 text-blue-300',
          badge: 'Meta Ads',
          badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30'
        };
      case 'traffic_google':
        return {
          icon: <Globe className="w-4 h-4 text-amber-400" />,
          accent: 'border-amber-500/80 bg-amber-950/40 text-amber-300',
          badge: 'Google Ads',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
        };
      case 'traffic_instagram':
        return {
          icon: <Share2 className="w-4 h-4 text-pink-400" />,
          accent: 'border-pink-500/80 bg-pink-950/40 text-pink-300',
          badge: 'Instagram',
          badgeColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30'
        };
      case 'traffic_creative':
        return {
          icon: <Sparkles className="w-4 h-4 text-violet-400" />,
          accent: 'border-violet-500/80 bg-violet-950/40 text-violet-300',
          badge: 'Criativo / Anúncio',
          badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30'
        };
      case 'landing_page':
        return {
          icon: <Layout className="w-4 h-4 text-orange-400" />,
          accent: 'border-orange-500/80 bg-orange-950/40 text-orange-300',
          badge: 'Página / VSL',
          badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30'
        };
      case 'whatsapp_link':
        return {
          icon: <MessageSquare className="w-4 h-4 text-emerald-400" />,
          accent: 'border-emerald-500/80 bg-emerald-950/40 text-emerald-300',
          badge: 'Link WhatsApp CAPI',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
        };
      case 'popup':
        return {
          icon: <Layers className="w-4 h-4 text-purple-400" />,
          accent: 'border-purple-500/80 bg-purple-950/40 text-purple-300',
          badge: 'Pop-up Captura',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
        };
      case 'checkout':
        return {
          icon: <ShoppingCart className="w-4 h-4 text-cyan-400" />,
          accent: 'border-cyan-500/80 bg-cyan-950/40 text-cyan-300',
          badge: 'Checkout / Pagamento',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
        };
      case 'automation_sequence':
        return {
          icon: <Zap className="w-4 h-4 text-indigo-400" />,
          accent: 'border-indigo-500/80 bg-indigo-950/40 text-indigo-300',
          badge: 'Automação & E-mails',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
        };
      case 'conversion_sale':
        return {
          icon: <DollarSign className="w-4 h-4 text-emerald-400" />,
          accent: 'border-emerald-500/90 bg-emerald-950/50 text-emerald-200',
          badge: 'Venda Concluída',
          badgeColor: 'bg-emerald-500/30 text-emerald-300 border-emerald-400/40'
        };
      default:
        return {
          icon: <GitBranch className="w-4 h-4 text-slate-400" />,
          accent: 'border-slate-700 bg-slate-900 text-slate-300',
          badge: 'Etapa',
          badgeColor: 'bg-slate-800 text-slate-300 border-slate-700'
        };
    }
  };

  // Aggregated Bottom Metrics
  const calculatedMetrics = useMemo(() => {
    if (!currentFunnel) return { investment: 0, leads: 0, cpl: 0, sales: 0, revenue: 0 };
    let totalInv = 0;
    let totalLeads = 0;
    let totalSales = 0;
    let totalRev = 0;

    currentFunnel.nodes.forEach(n => {
      totalInv += Number(n.data.investment || 0);
      totalLeads += Number(n.data.leads || 0);
      totalSales += Number(n.data.salesCount || 0);
      totalRev += Number(n.data.revenue || 0);
    });

    const cpl = totalLeads > 0 ? totalInv / totalLeads : 0;
    return {
      investment: totalInv,
      leads: totalLeads,
      cpl,
      sales: totalSales,
      revenue: totalRev
    };
  }, [currentFunnel]);

  return (
    <div className={`flex flex-col bg-[#070A11] text-slate-100 select-none overflow-hidden ${
      fullScreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-80px)] rounded-2xl border border-slate-800/80 shadow-2xl'
    }`}>
      {/* 1. TOP HEADER TOOLBAR */}
      <div className="bg-[#0B0F19] border-b border-slate-800/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        
        {/* Left: Tabs & Funnel Select */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* View Tabs */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('funnels')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'funnels' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Meus Fluxos ({funnels.filter(f => !f.isTemplate).length})</span>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'templates' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Meus Templates</span>
            </button>
            <button
              onClick={() => setActiveTab('community')}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                activeTab === 'community' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
              <span>Comunidade</span>
            </button>
          </div>

          {/* Current Funnel Selector Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500">Funil:</span>
            <select
              value={currentFunnel?.id || ''}
              onChange={(e) => {
                const found = funnels.find(f => f.id === e.target.value);
                if (found) {
                  setCurrentFunnel(found);
                  setSelectedNodeId(null);
                  if (found.viewport) {
                    setPan({ x: found.viewport.x || 0, y: found.viewport.y || 0 });
                    setZoom(found.viewport.zoom || 1);
                  }
                }
              }}
              className="bg-transparent text-white font-bold outline-none cursor-pointer max-w-[200px] truncate"
            >
              {funnels.map(f => (
                <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                  {f.name} {f.isTemplate ? '(Template)' : ''}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCreateNewFunnel}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition"
            title="Criar Novo Funil Vazio"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions (Auto layout, Save, Save as template) */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoOrganize}
            className="bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            title="Organizar nós automaticamente em colunas lineares"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Organizar Fluxo</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving || !currentFunnel}
            className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Salvar como Template</span>
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={saving || !currentFunnel}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Salvando...' : 'Salvar Fluxo'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE (SIDEBAR + CANVAS + DRAWER) */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* LEFT COMPONENT PALETTE */}
        <div className={`bg-[#0B0F19]/95 border-r border-slate-800/80 transition-all duration-300 z-10 flex flex-col shrink-0 ${
          sidebarCollapsed ? 'w-12' : 'w-64'
        }`}>
          <div className="p-3 border-b border-slate-800/80 flex items-center justify-between">
            {!sidebarCollapsed && (
              <span className="text-xs font-black tracking-wider uppercase text-slate-300 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-400" />
                Componentes
              </span>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition ml-auto"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {!sidebarCollapsed ? (
            <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
              
              {/* Category 1: Tráfego & Origem */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Tráfego & Origem</p>
                <button
                  onClick={() => handleAddComponent('traffic_meta', 'Meta Ads', 'Campanha Facebook/Instagram')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-blue-950/50 hover:border-blue-700/60 border border-slate-800 text-left transition group"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 group-hover:text-blue-300">Meta Ads</p>
                    <p className="text-[10px] text-slate-500">Facebook / Instagram Ads</p>
                  </div>
                </button>

                <button
                  onClick={() => handleAddComponent('traffic_creative', 'Criativo / Anúncio', 'Vídeo ou Carrossel')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-violet-950/50 hover:border-violet-700/60 border border-slate-800 text-left transition group"
                >
                  <div className="w-6 h-6 rounded-lg bg-violet-600/20 text-violet-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 group-hover:text-violet-300">Anúncio / Criativo</p>
                    <p className="text-[10px] text-slate-500">Teste A/B de Criativos</p>
                  </div>
                </button>

                <button
                  onClick={() => handleAddComponent('traffic_instagram', 'Instagram Orgânico', 'Bio & Stories')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-pink-950/50 hover:border-pink-700/60 border border-slate-800 text-left transition group"
                >
                  <div className="w-6 h-6 rounded-lg bg-pink-600/20 text-pink-400 flex items-center justify-center font-bold">
                    <Share2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 group-hover:text-pink-300">Instagram</p>
                    <p className="text-[10px] text-slate-500">Link na Bio / Direct</p>
                  </div>
                </button>
              </div>

              {/* Category 2: Páginas & Rastreamento */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Páginas & Rastreamento</p>
                <button
                  onClick={() => handleAddComponent('landing_page', 'Página de Vendas / VSL', 'Landing Page de Alta Conversão')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-orange-950/50 hover:border-orange-700/60 border border-slate-800 text-left transition group"
                >
                  <div className="w-6 h-6 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center font-bold">
                    <Layout className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 group-hover:text-orange-300">Landing Page / VSL</p>
                    <p className="text-[10px] text-slate-500">Captura ou Oferta</p>
                  </div>
                </button>

                <button
                  onClick={() => handleAddComponent('whatsapp_link', 'Link WhatsApp Oficial', 'Disparo Meta CAPI & Rotação')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-emerald-950/50 hover:border-emerald-700/60 border border-slate-800 text-left transition group"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 group-hover:text-emerald-300">Link WhatsApp CAPI</p>
                    <p className="text-[10px] text-slate-500">Redirecionamento Seguro</p>
                  </div>
                </button>

                <button
                  onClick={() => handleAddComponent('popup', 'Pop-up de Captura', 'Formulário Nome & WhatsApp')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-purple-950/50 hover:border-purple-700/60 border border-slate-800 text-left transition group"
                >
                  <div className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 group-hover:text-purple-300">Pop-up Inteligente</p>
                    <p className="text-[10px] text-slate-500">Pré-qualificação do Lead</p>
                  </div>
                </button>
              </div>

              {/* Category 3: Conversão & Checkout */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Conversão & Checkout</p>
                <button
                  onClick={() => handleAddComponent('checkout', 'Checkout Hotmart / Kiwify', 'Página de Pagamento')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-950/50 hover:border-cyan-700/60 border border-slate-800 text-left transition group"
                >
                  <div className="w-6 h-6 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold">
                    <ShoppingCart className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 group-hover:text-cyan-300">Checkout Externo</p>
                    <p className="text-[10px] text-slate-500">Hotmart / Kiwify / Asaas</p>
                  </div>
                </button>

                <button
                  onClick={() => handleAddComponent('conversion_sale', 'Venda Concluída', 'Lead Convertido em Cliente')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-emerald-950/50 hover:border-emerald-700/60 border border-slate-800 text-left transition group"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 group-hover:text-emerald-300">Conversão / Venda</p>
                    <p className="text-[10px] text-slate-500">Fechamento do Funil</p>
                  </div>
                </button>
              </div>

              {/* Category 4: Automação & Nutrição */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Automação & Nutrição</p>
                <button
                  onClick={() => handleAddComponent('automation_sequence', 'Sequência de Nutrição', 'Fluxo E-mails & WhatsApp')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-indigo-950/50 hover:border-indigo-700/60 border border-slate-800 text-left transition group"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 group-hover:text-indigo-300">Fluxo de Automação</p>
                    <p className="text-[10px] text-slate-500">Cron 24h & Webinário</p>
                  </div>
                </button>
              </div>

            </div>
          ) : (
            <div className="p-2 space-y-2 flex flex-col items-center">
              <button
                onClick={() => handleAddComponent('traffic_meta', 'Meta Ads')}
                className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                title="Adicionar Meta Ads"
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAddComponent('landing_page', 'Landing Page')}
                className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center hover:bg-orange-600 hover:text-white transition"
                title="Adicionar Landing Page"
              >
                <Layout className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAddComponent('whatsapp_link', 'Link WhatsApp')}
                className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition"
                title="Adicionar Link WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAddComponent('checkout', 'Checkout')}
                className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center hover:bg-cyan-600 hover:text-white transition"
                title="Adicionar Checkout"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* CENTER INTERACTIVE SVG CANVAS */}
        <div
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="flex-1 h-full bg-[#070A11] relative overflow-hidden cursor-crosshair"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
            backgroundSize: `${24 * zoom}px ${24 * zoom}px`,
            backgroundPosition: `${pan.x}px ${pan.y}px`
          }}
        >
          {/* Zoom & Viewport Floating Controls */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl shadow-lg backdrop-blur-xs">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 0.1, 2.0))}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold text-slate-400 px-1">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.4))}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
            <button
              onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition text-[10px] font-bold"
              title="Resetar Posição"
            >
              Reset
            </button>
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`p-1.5 rounded-lg transition ${
                isLocked ? 'text-amber-400 bg-amber-950/40' : 'text-slate-400 hover:text-white'
              }`}
              title={isLocked ? 'Desbloquear Canvas' : 'Travar Movimentação'}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setFullScreen(!fullScreen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={fullScreen ? 'Sair da Tela Cheia' : 'Modo Tela Cheia'}
            >
              {fullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* SVG LAYER FOR BEZIER CONNECTING EDGES */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#10b981" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
              </linearGradient>

              {/* Marker Arrow Head */}
              <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <polygon points="0 1, 8 4, 0 7" fill="#10b981" />
              </marker>
            </defs>

            {/* Render Existing Edges */}
            {currentFunnel?.edges.map(edge => {
              const srcNode = currentFunnel.nodes.find(n => n.id === edge.source);
              const tgtNode = currentFunnel.nodes.find(n => n.id === edge.target);
              if (!srcNode || !tgtNode) return null;

              // Compute Node Pin Coordinates
              const nodeWidth = 240;
              const nodeHeight = 110;
              const x1 = (srcNode.x + nodeWidth) * zoom + pan.x;
              const y1 = (srcNode.y + nodeHeight / 2) * zoom + pan.y;
              const x2 = tgtNode.x * zoom + pan.x;
              const y2 = (tgtNode.y + nodeHeight / 2) * zoom + pan.y;

              const dx = Math.max(80, Math.abs(x2 - x1) * 0.45);
              const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

              const midX = (x1 + x2) / 2;
              const midY = (y1 + y2) / 2;

              return (
                <g key={edge.id} className="cursor-pointer pointer-events-auto group">
                  {/* Outer glow line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth={4 * zoom}
                    strokeOpacity="0.15"
                  />
                  {/* Main connection curve */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="url(#edgeGradient)"
                    strokeWidth={2.5 * zoom}
                    markerEnd="url(#arrowHead)"
                    strokeDasharray="6 3"
                    className="animate-pulse"
                  />

                  {/* Flowing Animation Particle */}
                  <circle r={3 * zoom} fill="#38bdf8">
                    <animateMotion dur="2.5s" repeatCount="indefinite" path={pathD} />
                  </circle>

                  {/* Edge Label Pill */}
                  {edge.label && (
                    <foreignObject
                      x={midX - 50}
                      y={midY - 14}
                      width={100}
                      height={28}
                      className="pointer-events-auto"
                    >
                      <div className="flex items-center justify-center">
                        <span className="bg-slate-900/90 text-[10px] font-bold text-slate-300 px-2 py-0.5 rounded-full border border-slate-700/80 shadow-xs truncate max-w-full">
                          {edge.label}
                        </span>
                      </div>
                    </foreignObject>
                  )}
                </g>
              );
            })}

            {/* Temporary Dragging Connection */}
            {connectingSourceId && (() => {
              const srcNode = currentFunnel?.nodes.find(n => n.id === connectingSourceId);
              if (!srcNode) return null;
              const nodeWidth = 240;
              const nodeHeight = 110;
              const x1 = (srcNode.x + nodeWidth) * zoom + pan.x;
              const y1 = (srcNode.y + nodeHeight / 2) * zoom + pan.y;
              const x2 = mousePos.x * zoom + pan.x;
              const y2 = mousePos.y * zoom + pan.y;
              const dx = Math.max(50, Math.abs(x2 - x1) * 0.4);
              return (
                <path
                  d={`M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`}
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
              );
            })()}
          </svg>

          {/* NODES DOM CONTAINER */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: '0 0'
            }}
          >
            {currentFunnel?.nodes.map(node => {
              const cfg = getNodeConfig(node.type);
              const isSelected = selectedNodeId === node.id;

              return (
                <div
                  key={node.id}
                  onMouseDown={(e) => handleNodeMouseDown(e, node)}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className={`absolute w-60 rounded-2xl p-3.5 border transition-all cursor-move pointer-events-auto select-none shadow-xl ${
                    isSelected
                      ? 'border-blue-400 ring-2 ring-blue-500/50 bg-[#0F172A] shadow-blue-900/30'
                      : 'border-slate-800/90 hover:border-slate-700 bg-[#0B0F19]/95 hover:shadow-2xl'
                  }`}
                >
                  {/* Left Input Pin (for connecting into this node) */}
                  <div
                    onMouseUp={(e) => handleEndConnecting(e, node.id)}
                    className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-900 border-2 border-emerald-400 hover:bg-emerald-400 hover:scale-125 transition-all flex items-center justify-center cursor-pointer z-30"
                    title="Solte aqui para conectar"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>

                  {/* Right Output Pin (for starting connection) */}
                  <div
                    onMouseDown={(e) => handleStartConnecting(e, node.id)}
                    className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-900 border-2 border-blue-400 hover:bg-blue-400 hover:scale-125 transition-all flex items-center justify-center cursor-crosshair z-30"
                    title="Arraste para conectar a outro nó"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </div>

                  {/* Browser Mockup Header for Landing Pages */}
                  {node.type === 'landing_page' && (
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500/80" />
                        <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                        <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                      </div>
                      <span className="truncate max-w-[120px] font-mono text-[9px] text-slate-500">
                        {node.data.url ? new URL(node.data.url).pathname : '/lp/oferta'}
                      </span>
                    </div>
                  )}

                  {/* Node Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-xl bg-slate-800 border border-slate-700/80 shrink-0">
                        {cfg.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-white truncate max-w-[130px]" title={node.title}>
                          {node.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[130px]">
                          {node.subtitle}
                        </span>
                      </div>
                    </div>

                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${cfg.badgeColor}`}>
                      {cfg.badge}
                    </span>
                  </div>

                  {/* Node Metrics Box */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-2 gap-1.5 text-center text-xs">
                    <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-400 font-semibold uppercase block">
                        {node.type.includes('traffic') ? 'Visitantes' : 'Acessos'}
                      </span>
                      <span className="font-bold text-slate-200 text-xs">
                        {node.data.visitors || 0}
                      </span>
                    </div>

                    <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-[9px] text-slate-400 font-semibold uppercase block">
                        {node.type === 'checkout' ? 'Vendas' : 'Leads'}
                      </span>
                      <span className="font-bold text-emerald-400 text-xs">
                        {node.type === 'checkout' ? (node.data.salesCount || 0) : (node.data.leads || node.data.conversions || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Conversion Pill if applicable */}
                  {node.data.conversionRate !== undefined && (
                    <div className="mt-2 flex items-center justify-between text-[10px] bg-slate-900/60 px-2 py-1 rounded-md border border-slate-800">
                      <span className="text-slate-400 font-medium">Conversão:</span>
                      <span className="font-bold text-blue-400">
                        {node.data.conversionRate}%
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT DRAWER: NODE CONFIGURATION & DIRECT ENTITY BINDING */}
        {isDrawerOpen && selectedNode && (
          <div className="w-80 bg-[#0B0F19] border-l border-slate-800 p-5 overflow-y-auto space-y-5 z-20 shrink-0 text-xs shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-slate-800 text-emerald-400">
                  {getNodeConfig(selectedNode.type).icon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs">Configurar Etapa</h3>
                  <p className="text-[10px] text-slate-400">{selectedNode.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Título do Bloco</label>
                <input
                  type="text"
                  value={selectedNode.title}
                  onChange={(e) => {
                    if (!currentFunnel) return;
                    setCurrentFunnel({
                      ...currentFunnel,
                      nodes: currentFunnel.nodes.map(n =>
                        n.id === selectedNode.id ? { ...n, title: e.target.value } : n
                      )
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">Subtítulo / Descrição</label>
                <input
                  type="text"
                  value={selectedNode.subtitle || ''}
                  onChange={(e) => {
                    if (!currentFunnel) return;
                    setCurrentFunnel({
                      ...currentFunnel,
                      nodes: currentFunnel.nodes.map(n =>
                        n.id === selectedNode.id ? { ...n, subtitle: e.target.value } : n
                      )
                    });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Direct 1-Click System Binding ("Criar tudo por dentro do funil") */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  Vínculo com Sistema
                </span>
                <button
                  onClick={() => handleSyncRealMetrics(selectedNode)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
                  title="Puxar métricas reais do link, página ou automação"
                >
                  <RefreshCw className="w-3 h-3" />
                  Sincronizar
                </button>
              </div>

              {/* Binding for WhatsApp Link */}
              {selectedNode.type === 'whatsapp_link' && (
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Vincular Link de WhatsApp Existente</label>
                  <select
                    value={selectedNode.data.linkId || ''}
                    onChange={(e) => {
                      if (!currentFunnel) return;
                      const lk = companyLinks.find(l => l.id === e.target.value);
                      setCurrentFunnel({
                        ...currentFunnel,
                        nodes: currentFunnel.nodes.map(n =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                data: {
                                  ...n.data,
                                  linkId: e.target.value,
                                  visitors: lk?.clicksCount || n.data.visitors
                                }
                              }
                            : n
                        )
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none"
                  >
                    <option value="">Selecione um link rastreado...</option>
                    {companyLinks.map(lk => (
                      <option key={lk.id} value={lk.id}>
                        {lk.title} ({lk.clicksCount || 0} cliques)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Binding for Landing Page */}
              {selectedNode.type === 'landing_page' && (
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Vincular Landing Page</label>
                  <select
                    value={selectedNode.data.landingPageId || ''}
                    onChange={(e) => {
                      if (!currentFunnel) return;
                      const lp = companyLps.find(p => p.id === e.target.value);
                      setCurrentFunnel({
                        ...currentFunnel,
                        nodes: currentFunnel.nodes.map(n =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                data: {
                                  ...n.data,
                                  landingPageId: e.target.value,
                                  url: lp ? `https://mdtracker.com.br/lp/${lp.slug}` : n.data.url,
                                  visitors: lp?.visitorsCount || n.data.visitors,
                                  leads: lp?.leadsCount || n.data.leads
                                }
                              }
                            : n
                        )
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none"
                  >
                    <option value="">Selecione uma Landing Page...</option>
                    {companyLps.map(lp => (
                      <option key={lp.id} value={lp.id}>
                        {lp.title} (/lp/{lp.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Binding for Automation Workflow */}
              {selectedNode.type === 'automation_sequence' && (
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Vincular Fluxo de Automação</label>
                  <select
                    value={selectedNode.data.workflowId || ''}
                    onChange={(e) => {
                      if (!currentFunnel) return;
                      const wf = companyWorkflows.find(w => w.id === e.target.value);
                      setCurrentFunnel({
                        ...currentFunnel,
                        nodes: currentFunnel.nodes.map(n =>
                          n.id === selectedNode.id
                            ? {
                                ...n,
                                data: {
                                  ...n.data,
                                  workflowId: e.target.value,
                                  leads: wf?.executedCount || n.data.leads
                                }
                              }
                            : n
                        )
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none"
                  >
                    <option value="">Selecione uma automação...</option>
                    {companyWorkflows.map(wf => (
                      <option key={wf.id} value={wf.id}>
                        {wf.name} ({wf.steps?.length || 0} passos)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Metrics Override / Simulator */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Métricas do Bloco</p>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Visitantes</label>
                  <input
                    type="number"
                    value={selectedNode.data.visitors || 0}
                    onChange={(e) => {
                      if (!currentFunnel) return;
                      const val = Number(e.target.value);
                      setCurrentFunnel({
                        ...currentFunnel,
                        nodes: currentFunnel.nodes.map(n =>
                          n.id === selectedNode.id ? { ...n, data: { ...n.data, visitors: val } } : n
                        )
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Leads / Conv.</label>
                  <input
                    type="number"
                    value={selectedNode.data.leads || selectedNode.data.conversions || 0}
                    onChange={(e) => {
                      if (!currentFunnel) return;
                      const val = Number(e.target.value);
                      setCurrentFunnel({
                        ...currentFunnel,
                        nodes: currentFunnel.nodes.map(n =>
                          n.id === selectedNode.id ? { ...n, data: { ...n.data, leads: val, conversions: val } } : n
                        )
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>
              </div>

              {selectedNode.type.includes('traffic') && (
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Investimento em Anúncios (R$)</label>
                  <input
                    type="number"
                    value={selectedNode.data.investment || 0}
                    onChange={(e) => {
                      if (!currentFunnel) return;
                      const val = Number(e.target.value);
                      setCurrentFunnel({
                        ...currentFunnel,
                        nodes: currentFunnel.nodes.map(n =>
                          n.id === selectedNode.id ? { ...n, data: { ...n.data, investment: val } } : n
                        )
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none"
                  />
                </div>
              )}
            </div>

            {/* Actions: Delete Node */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  if (!currentFunnel) return;
                  setCurrentFunnel({
                    ...currentFunnel,
                    nodes: currentFunnel.nodes.filter(n => n.id !== selectedNode.id),
                    edges: currentFunnel.edges.filter(
                      ed => ed.source !== selectedNode.id && ed.target !== selectedNode.id
                    )
                  });
                  setSelectedNodeId(null);
                  setIsDrawerOpen(false);
                }}
                className="text-red-400 hover:text-red-300 font-bold text-xs flex items-center gap-1.5 p-2 rounded-xl hover:bg-red-950/40 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Bloco</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM METRICS BAR (EXACT MATCH TO POWER UP SCREENSHOT) */}
      <div className="bg-[#0B0F19] border-t border-slate-800/90 px-6 py-3 flex items-center justify-between gap-4 shrink-0 z-20">
        <div className="flex items-center gap-8 text-xs">
          
          {/* Total Leads */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total de Leads</p>
              <p className="text-base font-black text-white">{calculatedMetrics.leads}</p>
            </div>
          </div>

          <div className="w-[1px] h-8 bg-slate-800 hidden sm:block" />

          {/* Investment */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Investimento</p>
              <p className="text-base font-black text-emerald-400">
                {calculatedMetrics.investment.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>

          <div className="w-[1px] h-8 bg-slate-800 hidden sm:block" />

          {/* CPL */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Custo Médio / Lead</p>
              <p className="text-base font-black text-slate-200">
                {calculatedMetrics.cpl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>

          {/* Total Revenue if sales exist */}
          {calculatedMetrics.revenue > 0 && (
            <>
              <div className="w-[1px] h-8 bg-slate-800 hidden sm:block" />
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Receita Gerada</p>
                  <p className="text-base font-black text-cyan-400">
                    {calculatedMetrics.revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
            </>
          )}

        </div>

        <div className="flex items-center gap-2">
          <div className="text-[10px] text-slate-500 hidden md:block">
            Mapeador Visual Conectado • MDTracker 360°
          </div>
          <button
            onClick={() => alert('Dica: Você pode arrastar do pino azul à direita de um bloco até o pino verde à esquerda de outro bloco para criar uma linha de conexão.')}
            className="w-8 h-8 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center justify-center shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            title="Ajuda e Atalhos do Funil"
          >
            ?
          </button>
        </div>
      </div>
    </div>
  );
};

