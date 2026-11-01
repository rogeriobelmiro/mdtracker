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
  CheckCheck,
  CheckCircle
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

// ==========================================
// 1. OFFICIAL COMMUNITY TEMPLATES
// ==========================================
export const COMMUNITY_FUNNELS: VisualFunnel[] = [
  {
    id: 'comm-funnel-direct-traffic',
    companyId: 'community',
    name: 'Funil Direto - Tráfego Pago & WhatsApp',
    description: 'Fluxo oficial de atração de anúncios Meta/Instagram para captura de leads, atendimento comercial no WhatsApp e nutrição automática.',
    category: 'Tráfego Pago & WhatsApp',
    isTemplate: true,
    nodes: [
      {
        id: 'node-meta-ads',
        type: 'traffic_meta',
        title: 'Meta Ads',
        subtitle: 'Campanha de Tráfego Direto',
        x: 80,
        y: 120,
        data: {
          visitors: 1240,
          leads: 0,
          investment: 420.00,
          cpl: 3.25,
          status: 'active'
        }
      },
      {
        id: 'node-creative-subflow',
        type: 'traffic_creative',
        title: 'Sub Workflow Criativos',
        subtitle: 'Testes A/B de Vídeos',
        x: 80,
        y: 280,
        data: {
          visitors: 850,
          leads: 0,
          investment: 280.00,
          cpl: 2.90,
          status: 'active'
        }
      },
      {
        id: 'node-instagram-bio',
        type: 'traffic_instagram',
        title: 'Instagram Orgânico',
        subtitle: 'Link da Bio & Stories',
        x: 80,
        y: 440,
        data: {
          visitors: 630,
          leads: 0,
          investment: 0,
          cpl: 0,
          status: 'active'
        }
      },
      {
        id: 'node-landing-page',
        type: 'landing_page',
        title: 'Página de Vendas / Captura',
        subtitle: 'Alta Conversão com VSL',
        x: 480,
        y: 240,
        data: {
          url: 'https://trackermd.mudadigital.com.br/lp/oferta-vip',
          visitors: 2720,
          leads: 680,
          conversionRate: 25.0,
          status: 'active'
        }
      },
      {
        id: 'node-whatsapp-link',
        type: 'whatsapp_link',
        title: 'Link WhatsApp Oficial',
        subtitle: 'Disparo Meta CAPI + Rotação',
        x: 880,
        y: 240,
        data: {
          visitors: 680,
          leads: 410,
          conversions: 410,
          conversionRate: 60.3,
          status: 'active'
        }
      },
      {
        id: 'node-automation-nurture',
        type: 'automation_sequence',
        title: 'Automação & Recuperação',
        subtitle: 'E-mails + WhatsApp 24h',
        x: 880,
        y: 480,
        data: {
          visitors: 680,
          leads: 270,
          conversions: 34,
          status: 'active'
        }
      },
      {
        id: 'node-checkout-hotmart',
        type: 'checkout',
        title: 'Checkout Hotmart / Kiwify',
        subtitle: 'Pagamento Cartão/Pix',
        x: 1240,
        y: 240,
        data: {
          provider: 'Hotmart',
          price: 297.00,
          salesCount: 68,
          revenue: 20196.00,
          conversionRate: 16.6,
          status: 'active'
        }
      }
    ],
    edges: [
      { id: 'edge-1', source: 'node-meta-ads', target: 'node-landing-page', label: '1.240 cliques' },
      { id: 'edge-2', source: 'node-creative-subflow', target: 'node-landing-page', label: '850 cliques' },
      { id: 'edge-3', source: 'node-instagram-bio', target: 'node-landing-page', label: '630 cliques' },
      { id: 'edge-4', source: 'node-landing-page', target: 'node-whatsapp-link', label: '25.0% conversão' },
      { id: 'edge-5', source: 'node-whatsapp-link', target: 'node-checkout-hotmart', label: '60.3% avançam' },
      { id: 'edge-6', source: 'node-landing-page', target: 'node-automation-nurture', label: 'Leads não-convertidos' }
    ],
    viewport: { x: 0, y: 0, zoom: 0.95 },
    metrics: {
      investment: 700.00,
      totalLeads: 680,
      cpl: 1.03,
      conversionRate: 25.0,
      totalSales: 68,
      totalRevenue: 20196.00
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'comm-funnel-perpetual-vsl',
    companyId: 'community',
    name: 'Funil Perpétuo de Infoproduto (VSL + Checkout)',
    description: 'Campanhas de vídeo no Facebook/Instagram jogando direto para página com VSL irresistível, checkout com order bump e recuperação ativa.',
    category: 'Infoprodutos & Perpétuo',
    isTemplate: true,
    nodes: [
      {
        id: 'node-vsl-meta',
        type: 'traffic_meta',
        title: 'Meta Ads Vídeo VSL',
        subtitle: 'Campanha de Conversão',
        x: 80,
        y: 200,
        data: { visitors: 3400, leads: 0, investment: 1200, status: 'active' }
      },
      {
        id: 'node-vsl-lp',
        type: 'landing_page',
        title: 'Página VSL com Pitch',
        subtitle: 'Vídeo de Vendas 22min',
        x: 480,
        y: 200,
        data: { visitors: 3400, leads: 510, conversionRate: 15.0, status: 'active' }
      },
      {
        id: 'node-vsl-chk',
        type: 'checkout',
        title: 'Checkout Kiwify / Hotmart',
        subtitle: 'Oferta Principal R$ 197',
        x: 880,
        y: 200,
        data: { visitors: 510, salesCount: 82, revenue: 16154, conversionRate: 16.1, status: 'active' }
      },
      {
        id: 'node-vsl-recup',
        type: 'automation_sequence',
        title: 'Recuperação WhatsApp Pix',
        subtitle: 'Disparo via CAPI & Carrinho',
        x: 880,
        y: 400,
        data: { visitors: 200, leads: 45, conversions: 19, status: 'active' }
      }
    ],
    edges: [
      { id: 'edge-v1', source: 'node-vsl-meta', target: 'node-vsl-lp', label: '3.400 acessos' },
      { id: 'edge-v2', source: 'node-vsl-lp', target: 'node-vsl-chk', label: '15.0% clicam no botão' },
      { id: 'edge-v3', source: 'node-vsl-chk', target: 'node-vsl-recup', label: 'Carrinho abandonado' }
    ],
    viewport: { x: 0, y: 0, zoom: 0.95 },
    metrics: {
      investment: 1200.00,
      totalLeads: 510,
      cpl: 2.35,
      conversionRate: 15.0,
      totalSales: 82,
      totalRevenue: 16154.00
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Helper to create clean blank funnel
const createBlankFunnel = (companyId: string): VisualFunnel => ({
  id: `funnel-${Date.now()}`,
  companyId,
  name: 'Novo Funil em Branco',
  description: 'Mapeamento visual da esteira de vendas e conversão.',
  category: 'Geral',
  isTemplate: false,
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  metrics: { investment: 0, totalLeads: 0, cpl: 0, conversionRate: 0, totalSales: 0, totalRevenue: 0 },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

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

  // Modals for Community & Templates
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  // Related Entities in Company for 1-Click Integration (strictly filtered for multi-tenant isolation)
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

  const canvasRef = useRef<HTMLDivElement>(null);

  // Load all initial funnels and entities with strict multi-tenant isolation
  const loadAll = async () => {
    try {
      setLoading(true);
      const [fList, rawLinks, rawLps, rawWfs, rawPops] = await Promise.all([
        fetchVisualFunnels(currentCompany.id),
        fetchLinks(undefined, undefined, currentCompany.id).catch(() => []),
        fetchLandingPages(currentCompany.id).catch(() => []),
        fetchWorkflows(currentCompany.id).catch(() => []),
        fetchPopups(currentCompany.id).catch(() => [])
      ]);

      // Strict tenant isolation: strictly filter only records of this company
      const filteredLinks = (rawLinks || []).filter(l => l.companyId === currentCompany.id);
      const filteredLps = (rawLps || []).filter(p => !p.companyId || p.companyId === currentCompany.id);
      const filteredWfs = (rawWfs || []).filter(w => !w.companyId || w.companyId === currentCompany.id);
      const filteredPops = (rawPops || []).filter(p => !p.companyId || p.companyId === currentCompany.id);

      setFunnels(fList || []);
      setCompanyLinks(filteredLinks);
      setCompanyLps(filteredLps);
      setCompanyWorkflows(filteredWfs);
      setCompanyPopups(filteredPops);

      // Requirement: "Sempre quando o cliente abrir o funil visual, mostrar em branco"
      // Start with a clean blank canvas on open
      const blank = createBlankFunnel(currentCompany.id);
      setCurrentFunnel(blank);
      setPan({ x: 0, y: 0 });
      setZoom(1);
      setSelectedNodeId(null);
      setIsDrawerOpen(false);
    } catch (err: any) {
      console.error('Erro ao carregar funis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [currentCompany.id]);

  // Window-level mouseup listener to guarantee node drops even if released outside canvas/over other elements
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsPanning(false);
      setDraggingNodeId(null);
      setConnectingSourceId(null);
    };

    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

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

  // Node Drag & Click Handlers:
  // 1 Click / Hold = Drag / Select
  // 2 Clicks (Double Click) = Open Configuration Drawer
  const handleNodeMouseDown = (e: React.MouseEvent, node: VisualFunnelNode) => {
    if ((e.target as HTMLElement).closest('.node-pin')) return;

    e.stopPropagation();
    setSelectedNodeId(node.id);
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

  const handleNodeDoubleClick = (e: React.MouseEvent, node: VisualFunnelNode) => {
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setIsDrawerOpen(true);
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
        companyId: currentCompany.id,
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
        setFunnels(prev => {
          const exists = prev.some(f => f.id === updated.id);
          return exists ? prev.map(f => f.id === updated.id ? updated : f) : [updated, ...prev];
        });
        await alert('✅ Fluxo do funil salvo com sucesso!', 'success');
      }
    } catch (err: any) {
      await alert(err.message || 'Erro ao salvar funil', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Create New Empty Funnel (Blank)
  const handleCreateNewFunnel = () => {
    const blank = createBlankFunnel(currentCompany.id);
    setCurrentFunnel(blank);
    setSelectedNodeId(null);
    setIsDrawerOpen(false);
    setPan({ x: 0, y: 0 });
    setZoom(1);
  };

  // Load Community Funnel Template into Canvas
  const handleLoadCommunityFunnel = (template: VisualFunnel) => {
    const clonedFunnel: VisualFunnel = {
      ...template,
      id: `funnel-community-${Date.now()}`,
      companyId: currentCompany.id,
      name: `${template.name} (Cópia da Comunidade)`,
      isTemplate: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentFunnel(clonedFunnel);
    if (template.viewport) {
      setPan({ x: template.viewport.x || 0, y: template.viewport.y || 0 });
      setZoom(template.viewport.zoom || 0.95);
    }
    setSelectedNodeId(null);
    setIsCommunityModalOpen(false);
    setActiveTab('funnels');
    alert(`⭐ Fluxo da comunidade "${template.name}" carregado com sucesso no canvas!`, 'success');
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

  // ==========================================
  // REQUIREMENT: PULL AUTOMATICALLY ALL SYSTEM CONFIGURATION
  // ==========================================
  const handleAutoImportSystemConfig = () => {
    if (companyLinks.length === 0 && companyLps.length === 0 && companyWorkflows.length === 0) {
      // If company has no links or landing pages yet, scaffold a starter Meta Ads -> WhatsApp structure
      const starterMetaId = `node-meta-${Date.now()}`;
      const starterWaId = `node-wa-${Date.now() + 1}`;
      const starterNodes: VisualFunnelNode[] = [
        {
          id: starterMetaId,
          type: 'traffic_meta',
          title: 'Meta Ads',
          subtitle: 'Facebook / Instagram Ads',
          x: 80,
          y: 200,
          data: { visitors: 0, leads: 0, conversions: 0, status: 'active', linkId: 'ALL_LINKS' }
        },
        {
          id: starterWaId,
          type: 'whatsapp_link',
          title: 'Link WhatsApp Oficial',
          subtitle: 'Disparo Meta CAPI',
          x: 480,
          y: 200,
          data: { visitors: 0, leads: 0, conversions: 0, status: 'active', linkId: 'ALL_LINKS' }
        }
      ];
      const starterEdges: VisualFunnelEdge[] = [
        { id: `edge-${Date.now()}`, source: starterMetaId, target: starterWaId, label: 'Cliques' }
      ];

      setCurrentFunnel({
        id: `funnel-sys-${Date.now()}`,
        companyId: currentCompany.id,
        name: `Funil Sincronizado - ${currentCompany.name}`,
        description: 'Estrutura base gerada automaticamente para Meta Ads e WhatsApp.',
        category: 'Geral',
        isTemplate: false,
        nodes: starterNodes,
        edges: starterEdges,
        viewport: { x: 0, y: 0, zoom: 1 },
        metrics: { investment: 0, totalLeads: 0, cpl: 0, conversionRate: 0 }
      });
      alert('Nenhum link ou página cadastrada ainda nesta empresa. Montamos uma estrutura base para Meta Ads e WhatsApp pronta para você!', 'info');
      return;
    }

    const newNodes: VisualFunnelNode[] = [];
    const newEdges: VisualFunnelEdge[] = [];

    // Filter company links by source/intent
    const metaLinks = companyLinks.filter(l =>
      l.utmSource?.toLowerCase().includes('meta') ||
      l.utmSource?.toLowerCase().includes('facebook') ||
      l.utmSource?.toLowerCase().includes('face') ||
      l.metaPixelId
    );
    const instaLinks = companyLinks.filter(l =>
      l.utmSource?.toLowerCase().includes('instagram') ||
      l.utmSource?.toLowerCase().includes('insta') ||
      l.utmSource?.toLowerCase().includes('bio')
    );
    const otherLinks = companyLinks.filter(l =>
      !metaLinks.includes(l) && !instaLinks.includes(l)
    );

    let trafficY = 120;

    // 1. Meta Ads Block:
    // If there is any link in the company, attach it to the Meta Ads component as requested!
    const metaLinkToUse = metaLinks[0] || companyLinks[0];
    const metaVisitors = metaLinks.length > 0
      ? metaLinks.reduce((acc, l) => acc + (l.clicksCount || 0), 0)
      : (metaLinkToUse?.clicksCount || 0);
    const metaLeads = metaLinks.length > 0
      ? metaLinks.reduce((acc, l) => acc + (l.leadsCount || 0), 0)
      : (metaLinkToUse?.leadsCount || 0);

    const metaNodeId = `node-meta-${Date.now()}`;
    newNodes.push({
      id: metaNodeId,
      type: 'traffic_meta',
      title: metaLinkToUse?.title || 'Meta Ads',
      subtitle: metaLinkToUse?.utmCampaign ? `Campanha: ${metaLinkToUse.utmCampaign}` : 'Facebook / Instagram Ads',
      x: 80,
      y: trafficY,
      data: {
        linkId: metaLinkToUse ? metaLinkToUse.id : 'ALL_LINKS',
        visitors: metaVisitors,
        leads: metaLeads,
        conversions: metaLeads,
        conversionRate: metaVisitors > 0 ? Number(((metaLeads / metaVisitors) * 100).toFixed(1)) : 0,
        status: 'active'
      }
    });
    trafficY += 160;

    // 2. Instagram Node (if present)
    let instaNodeId: string | null = null;
    if (instaLinks.length > 0 || otherLinks.length > 1) {
      const lk = instaLinks[0] || otherLinks[1];
      instaNodeId = `node-insta-${Date.now() + 1}`;
      newNodes.push({
        id: instaNodeId,
        type: 'traffic_instagram',
        title: lk?.title || 'Instagram Orgânico',
        subtitle: lk?.utmCampaign || 'Link na Bio & Stories',
        x: 80,
        y: trafficY,
        data: {
          linkId: lk?.id,
          visitors: lk?.clicksCount || 0,
          leads: lk?.leadsCount || 0,
          conversions: lk?.conversionsCount || lk?.leadsCount || 0,
          status: 'active'
        }
      });
      trafficY += 160;
    }

    // 3. Creative / Sub Workflow Node (if present)
    let creativeNodeId: string | null = null;
    if (otherLinks.length > 0 && otherLinks[0] !== metaLinkToUse) {
      const lk = otherLinks[0];
      creativeNodeId = `node-creative-${Date.now() + 2}`;
      newNodes.push({
        id: creativeNodeId,
        type: 'traffic_creative',
        title: lk?.title || 'Criativo / Anúncio',
        subtitle: lk?.utmCampaign || 'Testes A/B de Criativos',
        x: 80,
        y: trafficY,
        data: {
          linkId: lk?.id,
          visitors: lk?.clicksCount || 0,
          leads: lk?.leadsCount || 0,
          conversions: lk?.conversionsCount || 0,
          status: 'active'
        }
      });
      trafficY += 160;
    }

    // 4. Landing Pages (Column 1, x: 480)
    let pageY = 160;
    const lpNodeIds: string[] = [];

    if (companyLps.length > 0) {
      companyLps.slice(0, 2).forEach((lp, idx) => {
        const lpId = `node-lp-${Date.now() + 10 + idx}`;
        lpNodeIds.push(lpId);
        const rate = lp.visitorsCount > 0 ? Number(((lp.leadsCount / lp.visitorsCount) * 100).toFixed(1)) : 0;
        newNodes.push({
          id: lpId,
          type: 'landing_page',
          title: lp.title || 'Página de Vendas / Captura',
          subtitle: `/lp/${lp.slug}`,
          x: 480,
          y: pageY,
          data: {
            landingPageId: lp.id,
            url: `https://trackermd.mudadigital.com.br/lp/${lp.slug}`,
            visitors: lp.visitorsCount || 0,
            leads: lp.leadsCount || 0,
            conversions: lp.leadsCount || 0,
            conversionRate: rate,
            status: 'active',
            linkId: 'ALL_LINKS'
          }
        });
        pageY += 180;
      });
    } else {
      const lpId = `node-lp-${Date.now() + 10}`;
      lpNodeIds.push(lpId);
      newNodes.push({
        id: lpId,
        type: 'landing_page',
        title: 'Página de Vendas / Captura',
        subtitle: '/lp/oferta-principal',
        x: 480,
        y: 200,
        data: {
          url: 'https://trackermd.mudadigital.com.br/lp/oferta',
          visitors: metaVisitors,
          leads: metaLeads,
          conversions: metaLeads,
          conversionRate: metaVisitors > 0 ? Number(((metaLeads / metaVisitors) * 100).toFixed(1)) : 0,
          status: 'active',
          linkId: 'ALL_LINKS'
        }
      });
    }

    // Connect Traffic to Primary Landing Page
    const primaryLpId = lpNodeIds[0];
    newEdges.push({
      id: `edge-meta-lp`,
      source: metaNodeId,
      target: primaryLpId,
      label: `${metaVisitors} cliques`
    });
    if (instaNodeId) {
      newEdges.push({
        id: `edge-insta-lp`,
        source: instaNodeId,
        target: primaryLpId,
        label: 'Instagram'
      });
    }
    if (creativeNodeId) {
      newEdges.push({
        id: `edge-creative-lp`,
        source: creativeNodeId,
        target: primaryLpId,
        label: 'Criativos'
      });
    }

    // 5. WhatsApp Link (Column 2, x: 880)
    const waNodeId = `node-wa-${Date.now() + 20}`;
    const totalWaClicks = companyLinks.reduce((acc, l) => acc + (l.clicksCount || 0), 0);
    const totalWaLeads = companyLinks.reduce((acc, l) => acc + (l.leadsCount || 0), 0);
    newNodes.push({
      id: waNodeId,
      type: 'whatsapp_link',
      title: 'Link WhatsApp Oficial',
      subtitle: 'Disparo Meta CAPI + Rotação',
      x: 880,
      y: 180,
      data: {
        linkId: companyLinks[0]?.id || 'ALL_LINKS',
        visitors: totalWaClicks,
        leads: totalWaLeads,
        conversions: totalWaLeads,
        conversionRate: totalWaClicks > 0 ? Number(((totalWaLeads / totalWaClicks) * 100).toFixed(1)) : 0,
        status: 'active'
      }
    });

    newEdges.push({
      id: `edge-lp-wa`,
      source: primaryLpId,
      target: waNodeId,
      label: 'Conversão WhatsApp'
    });

    // 6. Workflow / Automação (if present)
    if (companyWorkflows.length > 0) {
      const wf = companyWorkflows[0];
      const wfNodeId = `node-wf-${Date.now() + 21}`;
      newNodes.push({
        id: wfNodeId,
        type: 'automation_sequence',
        title: wf.name || 'Automação & Recuperação',
        subtitle: `${wf.steps?.length || 0} passos de nutrição`,
        x: 880,
        y: 380,
        data: {
          workflowId: wf.id,
          linkId: 'ALL_LINKS',
          visitors: wf.enrolledCount || 0,
          leads: wf.executedCount || 0,
          conversions: wf.conversionsCount || 0,
          status: 'active'
        }
      });

      newEdges.push({
        id: `edge-lp-wf`,
        source: primaryLpId,
        target: wfNodeId,
        label: 'Recuperação'
      });
    }

    // 7. Checkout / Conversão (Column 3, x: 1240)
    const checkoutNodeId = `node-checkout-${Date.now() + 30}`;
    newNodes.push({
      id: checkoutNodeId,
      type: 'checkout',
      title: 'Checkout Hotmart / Kiwify',
      subtitle: 'Pagamento Cartão / Pix',
      x: 1240,
      y: 180,
      data: {
        linkId: 'ALL_LINKS',
        visitors: totalWaLeads,
        salesCount: Math.round(totalWaLeads * 0.15),
        revenue: Math.round(totalWaLeads * 0.15) * 197,
        conversionRate: 15.0,
        status: 'active'
      }
    });

    newEdges.push({
      id: `edge-wa-chk`,
      source: waNodeId,
      target: checkoutNodeId,
      label: 'Avançam Checkout'
    });

    const generatedFunnel: VisualFunnel = {
      id: `funnel-auto-${Date.now()}`,
      companyId: currentCompany.id,
      name: `Funil Sincronizado - ${currentCompany.name}`,
      description: 'Mapeamento automático integrado com as configurações e links da empresa.',
      category: 'Geral',
      isTemplate: false,
      nodes: newNodes,
      edges: newEdges,
      viewport: { x: 0, y: 0, zoom: 0.95 },
      metrics: {
        investment: 0,
        totalLeads: totalWaLeads,
        cpl: 0,
        conversionRate: 0,
        totalSales: Math.round(totalWaLeads * 0.15),
        totalRevenue: Math.round(totalWaLeads * 0.15) * 197
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setCurrentFunnel(generatedFunnel);
    setSelectedNodeId(null);
    setIsDrawerOpen(false);
    setPan({ x: 0, y: 0 });
    setZoom(0.95);
    alert(`⚡ Configurações do sistema importadas com sucesso! Encontrados: ${companyLinks.length} links, ${companyLps.length} páginas e ${companyWorkflows.length} automações.`, 'success');
  };

  // ==========================================
  // REQUIREMENT: LINK SELECTION HANDLER FOR ANY COMPONENT
  // Supports "ALL_LINKS" (summing all data) or a specific link
  // ==========================================
  const handleLinkSelectionChange = (linkId: string) => {
    if (!currentFunnel || !selectedNode) return;

    let visitors = selectedNode.data.visitors || 0;
    let leadsCount = selectedNode.data.leads || 0;
    let conversions = selectedNode.data.conversions || 0;

    if (linkId === 'ALL_LINKS') {
      visitors = companyLinks.reduce((acc, l) => acc + (l.clicksCount || 0), 0);
      leadsCount = leads.filter(ld => companyLinks.some(cl => cl.id === ld.linkId)).length || companyLinks.reduce((acc, l) => acc + (l.leadsCount || 0), 0);
      conversions = companyLinks.reduce((acc, l) => acc + (l.conversionsCount || 0), 0) || leadsCount;
    } else if (linkId) {
      const lk = companyLinks.find(l => l.id === linkId);
      if (lk) {
        visitors = lk.clicksCount || 0;
        leadsCount = leads.filter(ld => ld.linkId === lk.id).length || lk.leadsCount || 0;
        conversions = lk.conversionsCount || leadsCount;
      }
    }

    const rate = visitors > 0 ? Number(((conversions / visitors) * 100).toFixed(1)) : 0;

    setCurrentFunnel({
      ...currentFunnel,
      nodes: currentFunnel.nodes.map(n =>
        n.id === selectedNode.id
          ? {
            ...n,
            data: {
              ...n.data,
              linkId: linkId || undefined,
              visitors,
              leads: leadsCount,
              conversions,
              conversionRate: rate
            }
          }
          : n
      )
    });
  };

  // Pull Real System Metrics into Selected Node
  const handleSyncRealMetrics = (node: VisualFunnelNode) => {
    if (!currentFunnel) return;
    let visitors = node.data.visitors || 0;
    let leadsCount = node.data.leads || 0;
    let conversions = node.data.conversions || 0;

    if (node.data.linkId === 'ALL_LINKS') {
      visitors = companyLinks.reduce((acc, l) => acc + (l.clicksCount || 0), 0);
      leadsCount = leads.filter(ld => companyLinks.some(cl => cl.id === ld.linkId)).length || companyLinks.reduce((acc, l) => acc + (l.leadsCount || 0), 0);
      conversions = companyLinks.reduce((acc, l) => acc + (l.conversionsCount || 0), 0) || leadsCount;
    } else if (node.data.linkId) {
      const lk = companyLinks.find(l => l.id === node.data.linkId);
      if (lk) {
        visitors = lk.clicksCount || 0;
        leadsCount = leads.filter(ld => ld.linkId === lk.id).length || lk.leadsCount || 0;
        conversions = lk.conversionsCount || leadsCount;
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
    alert('Métricas sincronizadas com sucesso a partir dos dados reais do sistema!', 'success');
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
    <div className={`flex flex-col bg-[#070A11] text-slate-100 select-none overflow-hidden ${fullScreen ? 'fixed inset-0 z-50' : 'h-[calc(100vh-80px)] rounded-2xl border border-slate-800/80 shadow-2xl'
      }`}>
      {/* 1. TOP HEADER TOOLBAR */}
      <div className="bg-[#0B0F19] border-b border-slate-800/90 px-4 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">

        {/* Left: Tabs & Funnel Select */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* View Tabs */}
          <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setActiveTab('funnels');
                setIsCommunityModalOpen(false);
                setIsTemplatesModalOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'funnels' && !isCommunityModalOpen && !isTemplatesModalOpen
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Meus Fluxos ({funnels.filter(f => !f.isTemplate).length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('templates');
                setIsTemplatesModalOpen(true);
                setIsCommunityModalOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'templates' || isTemplatesModalOpen
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
                }`}
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Meus Templates ({funnels.filter(f => f.isTemplate).length})</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('community');
                setIsCommunityModalOpen(true);
                setIsTemplatesModalOpen(false);
              }}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'community' || isCommunityModalOpen
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
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
                const val = e.target.value;
                if (val.startsWith('comm-')) {
                  const foundComm = COMMUNITY_FUNNELS.find(c => c.id === val);
                  if (foundComm) handleLoadCommunityFunnel(foundComm);
                  return;
                }
                const found = funnels.find(f => f.id === val);
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
              {currentFunnel && !funnels.some(f => f.id === currentFunnel.id) && (
                <option value={currentFunnel.id} className="bg-slate-900 text-white">
                  {currentFunnel.name}
                </option>
              )}
              {funnels.length > 0 && (
                <optgroup label="Meus Fluxos Salvos" className="bg-slate-900 text-slate-400 font-bold">
                  {funnels.map(f => (
                    <option key={f.id} value={f.id} className="bg-slate-900 text-white font-normal">
                      {f.name} {f.isTemplate ? '(Template)' : ''}
                    </option>
                  ))}
                </optgroup>
              )}
              <optgroup label="Exemplos da Comunidade" className="bg-slate-900 text-emerald-400 font-bold">
                {COMMUNITY_FUNNELS.map(cf => (
                  <option key={cf.id} value={cf.id} className="bg-slate-900 text-white font-normal">
                    {cf.name} (Comunidade)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          <button
            onClick={handleCreateNewFunnel}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition cursor-pointer"
            title="Criar Novo Funil Vazio (Em Branco)"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* REQUIREMENT: BUTTON TO PULL AUTOMATICALLY ALL SYSTEM CONFIGURATION */}
          <button
            onClick={handleAutoImportSystemConfig}
            className="bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/40 hover:border-blue-400/60 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer group"
            title="Puxar automaticamente toda a configuração que foi feita no sistema (links, landing pages, Meta Ads, WhatsApp, automações)"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-180 transition-transform duration-500" />
            <span>Puxar Configurações do Sistema</span>
          </button>

          <button
            onClick={handleAutoOrganize}
            className="bg-purple-950/40 hover:bg-purple-900/60 text-purple-300 border border-purple-800/60 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Organizar nós automaticamente em colunas lineares"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Organizar Fluxo</span>
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={saving || !currentFunnel}
            className="bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Salvar como Template</span>
          </button>

          <button
            onClick={() => handleSave(false)}
            disabled={saving || !currentFunnel}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
          >
            <Save className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
            <span>{saving ? 'Salvando...' : 'Salvar Fluxo'}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE (SIDEBAR + CANVAS + DRAWER) */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* LEFT COMPONENT PALETTE */}
        <div className={`bg-[#0B0F19]/95 border-r border-slate-800/80 transition-all duration-300 z-10 flex flex-col shrink-0 ${sidebarCollapsed ? 'w-12' : 'w-64'
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
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition ml-auto cursor-pointer"
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
                  onClick={() => handleAddComponent('traffic_meta', 'Meta Ads', 'Facebook / Instagram Ads')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-blue-950/50 hover:border-blue-700/60 border border-slate-800 text-left transition group cursor-pointer"
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
                  onClick={() => handleAddComponent('traffic_creative', 'Anúncio / Criativo', 'Teste A/B de Criativos')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-violet-950/50 hover:border-violet-700/60 border border-slate-800 text-left transition group cursor-pointer"
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
                  onClick={() => handleAddComponent('traffic_instagram', 'Instagram', 'Link na Bio / Direct')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-pink-950/50 hover:border-pink-700/60 border border-slate-800 text-left transition group cursor-pointer"
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
                  onClick={() => handleAddComponent('landing_page', 'Landing Page / VSL', 'Captura ou Oferta')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-orange-950/50 hover:border-orange-700/60 border border-slate-800 text-left transition group cursor-pointer"
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
                  onClick={() => handleAddComponent('whatsapp_link', 'Link WhatsApp CAPI', 'Redirecionamento Seguro')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-emerald-950/50 hover:border-emerald-700/60 border border-slate-800 text-left transition group cursor-pointer"
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
                  onClick={() => handleAddComponent('popup', 'Pop-up Inteligente', 'Pré-qualificação do Lead')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-purple-950/50 hover:border-purple-700/60 border border-slate-800 text-left transition group cursor-pointer"
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
                  onClick={() => handleAddComponent('checkout', 'Checkout Externo', 'Hotmart / Kiwify / Asaas')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-cyan-950/50 hover:border-cyan-700/60 border border-slate-800 text-left transition group cursor-pointer"
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
                  onClick={() => handleAddComponent('conversion_sale', 'Conversão / Venda', 'Fechamento do Funil')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-emerald-950/50 hover:border-emerald-700/60 border border-slate-800 text-left transition group cursor-pointer"
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
                  onClick={() => handleAddComponent('automation_sequence', 'Automações (Workflows)', 'E-mails + WhatsApp 24h')}
                  className="w-full flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 hover:bg-indigo-950/50 hover:border-indigo-700/60 border border-slate-800 text-left transition group cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-200 group-hover:text-indigo-300">Automação / E-mails</p>
                    <p className="text-[10px] text-slate-500">Disparo Mensagens & CRM</p>
                  </div>
                </button>
              </div>

            </div>
          ) : (
            <div className="p-2 space-y-2 flex flex-col items-center">
              <button
                onClick={() => handleAddComponent('traffic_meta', 'Meta Ads')}
                className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition cursor-pointer"
                title="Adicionar Meta Ads"
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAddComponent('landing_page', 'Landing Page')}
                className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-400 flex items-center justify-center hover:bg-orange-600 hover:text-white transition cursor-pointer"
                title="Adicionar Landing Page"
              >
                <Layout className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAddComponent('whatsapp_link', 'Link WhatsApp')}
                className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition cursor-pointer"
                title="Adicionar Link WhatsApp"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleAddComponent('checkout', 'Checkout')}
                className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center hover:bg-cyan-600 hover:text-white transition cursor-pointer"
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
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-bold text-slate-400 px-1">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.4))}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Diminuir Zoom"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-800 mx-0.5" />
            <button
              onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition text-[10px] font-bold cursor-pointer"
              title="Resetar Posição"
            >
              Reset
            </button>
            <button
              onClick={() => setIsLocked(!isLocked)}
              className={`p-1.5 rounded-lg transition cursor-pointer ${isLocked ? 'text-amber-400 bg-amber-950/40' : 'text-slate-400 hover:text-white'
                }`}
              title={isLocked ? 'Desbloquear Canvas' : 'Travar Movimentação'}
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setFullScreen(!fullScreen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
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
                      x={midX - 55}
                      y={midY - 14}
                      width={110}
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

          {/* EMPTY CANVAS WELCOME STATE */}
          {(!currentFunnel || currentFunnel.nodes.length === 0) && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-4">
              <div className="bg-[#0B0F19]/90 border border-slate-800 p-8 rounded-3xl max-w-lg text-center pointer-events-auto backdrop-blur-md shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/20">
                  <GitBranch className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">Funil Visual 360° em Branco</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Seu funil está limpo e pronto. Você pode adicionar componentes manualmente pelo menu à esquerda, carregar o <strong>fluxo oficial da comunidade</strong> ou puxar automaticamente todas as configurações que sua empresa já criou.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleAutoImportSystemConfig}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Puxar Configurações
                  </button>
                  <button
                    onClick={() => setIsCommunityModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 border border-emerald-500/40 transition cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-emerald-400" />
                    Ver Comunidade
                  </button>
                </div>
              </div>
            </div>
          )}

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
                  onDoubleClick={(e) => handleNodeDoubleClick(e, node)}
                  onMouseUp={() => setDraggingNodeId(null)}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  className={`absolute w-60 rounded-2xl p-3.5 border transition-all cursor-move pointer-events-auto select-none shadow-xl ${isSelected
                    ? 'border-blue-400 ring-2 ring-blue-500/50 bg-[#0F172A] shadow-blue-900/30'
                    : 'border-slate-800/90 hover:border-slate-700 bg-[#0B0F19]/95 hover:shadow-2xl'
                    }`}
                  title="Clique para arrastar • 2 cliques para configurar"
                >
                  {/* Left Input Pin (for connecting into this node) */}
                  <div
                    onMouseUp={(e) => handleEndConnecting(e, node.id)}
                    className="node-pin absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-900 border-2 border-emerald-400 hover:bg-emerald-400 hover:scale-125 transition-all flex items-center justify-center cursor-pointer z-30"
                    title="Solte aqui para conectar"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>

                  {/* Right Output Pin (for starting connection) */}
                  <div
                    onMouseDown={(e) => handleStartConnecting(e, node.id)}
                    className="node-pin absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-900 border-2 border-blue-400 hover:bg-blue-400 hover:scale-125 transition-all flex items-center justify-center cursor-crosshair z-30"
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
                        {node.data.url ? new URL(node.data.url).pathname : '/lp/oferta-vip'}
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
                        <h4 className="font-bold text-xs text-white truncate max-w-[120px]" title={node.title}>
                          {node.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 block truncate max-w-[120px]">
                          {node.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNodeId(node.id);
                          setIsDrawerOpen(true);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                        title="Configurar Etapa (ou 2 cliques no bloco)"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${cfg.badgeColor}`}>
                        {cfg.badge}
                      </span>
                    </div>
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
                  <p className="text-[10px] text-slate-400 truncate max-w-[170px]">{selectedNode.title}</p>
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
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

            {/* REQUIREMENT: DIRECT SYSTEM BINDING - IN ALL COMPONENTS, DROPDOWN TO SELECT COMPANY LINKS (OR ALL LINKS) */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5" />
                  Vínculo com Sistema
                </span>
                <button
                  onClick={() => handleSyncRealMetrics(selectedNode)}
                  className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold cursor-pointer"
                  title="Puxar métricas reais do link, página ou automação"
                >
                  <RefreshCw className="w-3 h-3" />
                  Sincronizar
                </button>
              </div>

              {/* Requirement: In ALL components, have dropdown for company links, with "Todos os links" or specific link */}
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">
                  Vincular Link Rastreado da Empresa
                </label>
                <select
                  value={selectedNode.data.linkId || ''}
                  onChange={(e) => handleLinkSelectionChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="">Selecione um link rastreado...</option>
                  <option value="ALL_LINKS">📊 Todos os Links da Empresa (Somar Dados)</option>
                  {companyLinks.map(lk => (
                    <option key={lk.id} value={lk.id}>
                      {lk.title} ({lk.clicksCount || 0} cliques)
                    </option>
                  ))}
                </select>
                {companyLinks.length === 0 && (
                  <p className="text-[10px] text-amber-400/80 mt-1">
                    Nenhum link criado nesta empresa ainda. Crie links no Gerador de Links.
                  </p>
                )}
              </div>

              {/* Specific Entity Binding: Landing Page */}
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
                                url: lp ? `https://trackermd.mudadigital.com.br/lp/${lp.slug}` : n.data.url,
                                visitors: lp?.visitorsCount || n.data.visitors,
                                leads: lp?.leadsCount || n.data.leads
                              }
                            }
                            : n
                        )
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
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

              {/* Specific Entity Binding: WhatsApp Link */}
              {selectedNode.type === 'whatsapp_link' && (
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Número / WhatsApp Configurado</label>
                  <select
                    value={selectedNode.data.linkId || ''}
                    onChange={(e) => handleLinkSelectionChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Selecione um link com WhatsApp...</option>
                    <option value="ALL_LINKS">📊 Todos os Links da Empresa (Somar Dados)</option>
                    {companyLinks.map(lk => (
                      <option key={lk.id} value={lk.id}>
                        {lk.title} {lk.phone ? `(${lk.phone})` : ''} - {lk.clicksCount || 0} cliques
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Specific Entity Binding: Automation Workflow */}
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
                                leads: wf?.executedCount || n.data.leads,
                                conversions: wf?.conversionsCount || n.data.conversions
                              }
                            }
                            : n
                        )
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
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

              {/* Specific Entity Binding: Popup */}
              {selectedNode.type === 'popup' && (
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Vincular Pop-up Inteligente</label>
                  <select
                    value={selectedNode.data.popupId || ''}
                    onChange={(e) => {
                      if (!currentFunnel) return;
                      const pop = companyPopups.find(p => p.id === e.target.value);
                      setCurrentFunnel({
                        ...currentFunnel,
                        nodes: currentFunnel.nodes.map(n =>
                          n.id === selectedNode.id
                            ? {
                              ...n,
                              data: {
                                ...n.data,
                                popupId: e.target.value,
                                visitors: pop?.viewsCount || n.data.visitors,
                                leads: pop?.conversionsCount || n.data.leads
                              }
                            }
                            : n
                        )
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="">Selecione um Pop-up...</option>
                    {companyPopups.map(pop => (
                      <option key={pop.id} value={pop.id}>
                        {pop.name} ({pop.viewsCount || 0} visualizações)
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Specific Entity Binding: Checkout */}
              {selectedNode.type === 'checkout' && (
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Plataforma / Checkout</label>
                  <select
                    value={selectedNode.data.provider || 'Hotmart'}
                    onChange={(e) => {
                      if (!currentFunnel) return;
                      setCurrentFunnel({
                        ...currentFunnel,
                        nodes: currentFunnel.nodes.map(n =>
                          n.id === selectedNode.id ? { ...n, data: { ...n.data, provider: e.target.value } } : n
                        )
                      });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="Hotmart">Hotmart</option>
                    <option value="Kiwify">Kiwify</option>
                    <option value="Eduzz">Eduzz</option>
                    <option value="Monetizze">Monetizze</option>
                    <option value="Asaas">Asaas</option>
                    <option value="Stripe">Stripe</option>
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
                className="text-red-400 hover:text-red-300 font-bold text-xs flex items-center gap-1.5 p-2 rounded-xl hover:bg-red-950/40 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir Bloco</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM METRICS BAR */}
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
            Mapeador Visual Conectado • TrackerMD 360°
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

      {/* ==========================================
          MODAL: COMUNIDADE (COMMUNITY TEMPLATES)
      ========================================== */}
      {isCommunityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    Biblioteca de Funis da Comunidade
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      Exemplos Oficiais
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Modelos comprovados e prontos para carregar direto no seu canvas.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCommunityModalOpen(false);
                  setActiveTab('funnels');
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {COMMUNITY_FUNNELS.map((cf, idx) => (
                <div
                  key={cf.id}
                  className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                >
                  <div className="space-y-2.5 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {cf.category}
                      </span>
                      {idx === 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          ⭐ Exemplo Oficial do Print
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500">
                        {cf.nodes.length} blocos • {cf.edges.length} conexões
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition">
                      {cf.name}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {cf.description}
                    </p>

                    {/* Nodes Pills Preview */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {cf.nodes.map(n => (
                        <span key={n.id} className="text-[9px] bg-slate-800/90 text-slate-300 border border-slate-700/60 px-2 py-0.5 rounded-md">
                          {n.title}
                        </span>
                      ))}
                    </div>

                    {/* Metric preview */}
                    {cf.metrics && (
                      <div className="flex items-center gap-4 pt-2 text-[11px] text-slate-400">
                        <span>Leads: <strong className="text-white">{cf.metrics.totalLeads}</strong></span>
                        <span>Investimento: <strong className="text-emerald-400">R$ {cf.metrics.investment}</strong></span>
                        {cf.metrics.totalSales && (
                          <span>Vendas: <strong className="text-cyan-400">{cf.metrics.totalSales} (R$ {cf.metrics.totalRevenue})</strong></span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => handleLoadCommunityFunnel(cf)}
                      className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Carregar no Canvas</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: MEUS TEMPLATES
      ========================================== */}
      {isTemplatesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600/20 text-amber-400 flex items-center justify-center font-bold">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Meus Templates Salvos</h3>
                  <p className="text-xs text-slate-400">
                    Modelos personalizados salvos pela sua empresa.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsTemplatesModalOpen(false);
                  setActiveTab('funnels');
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {funnels.filter(f => f.isTemplate).length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-3">
                  <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">Nenhum template salvo ainda</p>
                  <p className="text-xs max-w-sm mx-auto">
                    Para salvar um modelo próprio, monte seu funil no canvas e clique no botão <strong>"Salvar como Template"</strong> no topo.
                  </p>
                </div>
              ) : (
                funnels.filter(f => f.isTemplate).map(tpl => (
                  <div
                    key={tpl.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-bold text-white text-xs">{tpl.name}</h4>
                      <p className="text-[10px] text-slate-400">{tpl.nodes.length} blocos • {tpl.edges.length} conexões</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setCurrentFunnel({
                            ...tpl,
                            id: `funnel-${Date.now()}`,
                            isTemplate: false,
                            name: `${tpl.name.replace('(Template)', '')} (Novo)`,
                            updatedAt: new Date().toISOString()
                          });
                          setIsTemplatesModalOpen(false);
                          setActiveTab('funnels');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer"
                      >
                        Carregar
                      </button>
                      <button
                        onClick={async () => {
                          const ok = await confirm('Excluir este template da sua biblioteca?');
                          if (ok) {
                            await deleteVisualFunnel(tpl.id);
                            setFunnels(prev => prev.filter(f => f.id !== tpl.id));
                          }
                        }}
                        className="p-2 text-red-400 hover:bg-red-950/40 rounded-xl cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
