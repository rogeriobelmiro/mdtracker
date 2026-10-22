import React, { useState, useMemo } from 'react';
import { Lead, FunnelStage, Product, LeadPurchase, CampaignLink, FUNNEL_STAGES } from '../types';
import { useDialog } from '../contexts/DialogContext';
import { Search, Filter, Download, MessageSquare, MapPin, Calendar, Clock, DollarSign, Edit3, Trash2, CheckCircle, AlertCircle, ExternalLink, Activity, List, LayoutGrid, Columns, RefreshCw, ShoppingCart, TrendingUp, X, Filter as FunnelIcon, Phone, PhoneCall, Target, Flame, User } from 'lucide-react';
import { FunnelView } from './FunnelView';

interface LeadCRMProps {
  leads: Lead[];
  products: Product[];
  leadPurchases: LeadPurchase[];
  links?: CampaignLink[];
  onUpdateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
  onDeleteLeadsBatch?: (ids: string[]) => Promise<void>;
  onOpenWhatsApp?: (leadId: string) => void;
  onInitiateCall?: (lead: Lead) => void;
  onCreatePurchase: (data: Partial<LeadPurchase>) => Promise<void>;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  linkIdFilter?: string | null;
  setLinkIdFilter?: (id: string | null) => void;
}

export const LeadCRM: React.FC<LeadCRMProps> = ({ 
  leads, 
  products, 
  leadPurchases,
  links = [], 
  onUpdateLead, 
  onDeleteLead, 
  onDeleteLeadsBatch,
  onOpenWhatsApp,
  onInitiateCall,
  onCreatePurchase,
  searchQuery = '',
  setSearchQuery,
  linkIdFilter = null,
  setLinkIdFilter
}) => {
  const { success, alert, confirm } = useDialog();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Selection State for Bulk Actions
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Sorting State
  const [sortField, setSortField] = useState<'name' | 'source' | 'stage' | 'score' | 'ltv' | 'updatedAt'>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Use local state if props are not provided
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const currentSearchQuery = setSearchQuery ? searchQuery : localSearchQuery;
  const updateSearchQuery = setSearchQuery || setLocalSearchQuery;

  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'kanban' | 'funnel'>('table');

  // Lead modal edit state
  const [editNotes, setEditNotes] = useState<string>('');

  // Purchase state
  const [newPurchaseProductId, setNewPurchaseProductId] = useState<string>('');

  const leadTimelineEvents = useMemo(() => {
    if (!selectedLead) return [];
    const rawList: any[] = [...(selectedLead.conversionEvents || [])];

    // Normalize events so popup conversions are recognized
    const list = rawList.map(evt => {
      const isEvtPopup = evt.type === 'popup' || 
                         evt.eventName?.toLowerCase().includes('popup') || 
                         evt.eventName?.toLowerCase().includes('pop-up') ||
                         evt.details?.toLowerCase().includes('pop-up') ||
                         evt.details?.toLowerCase().includes('popup');
      if (isEvtPopup) {
        return {
          ...evt,
          type: 'popup',
          eventName: evt.eventName === 'Lead_Popup' ? 'Lead Capturado (Pop-up)' : evt.eventName
        };
      }
      return evt;
    });

    // Always synthesize capture/entry event if missing
    const hasEntry = list.some(e => 
      e.type === 'landing_page' || 
      e.type === 'popup' ||
      e.type === 'popup_capture' ||
      e.type === 'form_submitted' ||
      e.eventName?.toLowerCase().includes('captura') || 
      e.eventName?.toLowerCase().includes('cadastro') ||
      e.eventName?.toLowerCase().includes('lead')
    );

    if (!hasEntry) {
      const isLp = selectedLead.source?.toLowerCase().includes('landing page');
      const isPopup = selectedLead.source?.toLowerCase().includes('pop-up') || selectedLead.source?.toLowerCase().includes('popup');
      list.unshift({
        id: `evt-entry-${selectedLead.id}`,
        type: isPopup ? 'popup' : isLp ? 'landing_page' : 'lead_cadastrado',
        eventName: isPopup ? 'Lead Capturado (Pop-up)' : isLp ? 'Lead Capturado (Landing Page)' : 'Cadastro do Lead no Sistema',
        status: 'sucesso',
        timestamp: selectedLead.createdAt,
        details: selectedLead.notes || `Lead registrado através de: ${selectedLead.source || 'Formulário'}`,
        utmSource: selectedLead.utmSource,
        utmMedium: selectedLead.utmMedium,
        utmCampaign: selectedLead.utmCampaign,
        utmContent: selectedLead.utmContent,
        utmTerm: selectedLead.utmTerm
      });
    }

    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [selectedLead]);
  
  const formatDate = (isoString: string) => {
    if (!isoString) return '-';
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return isoString;
    }
  };

  const getStageBadgeClass = (stage: FunnelStage) => {
    switch (stage) {
      case 'Novo Lead':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Contatado':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Em Negociação':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Convertido':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'Perdido':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Derived states for UI
  const getLeadPurchases = (leadId: string) => leadPurchases.filter(p => p.leadId === leadId);
  const getLeadLtv = (leadId: string) => getLeadPurchases(leadId).reduce((acc, p) => acc + p.amount, 0);

  // Check if lead has pending renewal
  const checkPendingRenewal = (leadId: string) => {
    const purchases = getLeadPurchases(leadId);
    if (!purchases.length) return false;
    
    const now = new Date();
    for (const purchase of purchases) {
      const product = products.find(p => p.id === purchase.productId);
      if (product && product.recurrenceDays) {
        const purchaseDate = new Date(purchase.purchasedAt);
        const diffDays = Math.floor((now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= product.recurrenceDays) {
          return true;
        }
      }
    }
    return false;
  };

  const filteredLeads = leads.filter(lead => {
    const query = currentSearchQuery.toLowerCase();
    const matchesSearch =
      (lead.name || '').toLowerCase().includes(query) ||
      (lead.phone || '').includes(query) ||
      (lead.email || '').toLowerCase().includes(query) ||
      (lead.location?.city || '').toLowerCase().includes(query) ||
      (lead.source || '').toLowerCase().includes(query) ||
      (lead.linkTitle || '').toLowerCase().includes(query) ||
      (lead.notes || '').toLowerCase().includes(query) ||
      (lead.utmCampaign || '').toLowerCase().includes(query) ||
      (lead.utmContent || '').toLowerCase().includes(query) ||
      (lead.utmTerm || '').toLowerCase().includes(query) ||
      (lead.utmSource || '').toLowerCase().includes(query);

    const matchesStage = stageFilter === 'all' || lead.stage === stageFilter;
    const matchesSource = sourceFilter === 'all' || lead.utmSource === sourceFilter || lead.source === sourceFilter;
    const matchesLink = !linkIdFilter || lead.linkId === linkIdFilter;

    return matchesSearch && matchesStage && matchesSource && matchesLink;
  });

  // Sorted Leads based on active sortField and sortDirection
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      switch (sortField) {
        case 'name':
          valA = (a.name || '').toLowerCase();
          valB = (b.name || '').toLowerCase();
          break;
        case 'source':
          valA = ((a.utmSource || a.source || '') + ' ' + (a.utmCampaign || '')).toLowerCase();
          valB = ((b.utmSource || b.source || '') + ' ' + (b.utmCampaign || '')).toLowerCase();
          break;
        case 'stage': {
          const stageOrder = ['Novo Lead', 'Contatado', 'Em Negociação', 'Convertido', 'Perdido'];
          valA = stageOrder.indexOf(a.stage);
          valB = stageOrder.indexOf(b.stage);
          break;
        }
        case 'score':
          valA = a.score || 0;
          valB = b.score || 0;
          break;
        case 'ltv':
          valA = getLeadLtv(a.id);
          valB = getLeadLtv(b.id);
          break;
        case 'updatedAt':
        default:
          valA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          valB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          break;
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredLeads, sortField, sortDirection, leadPurchases]);

  // Bulk Selection Helpers
  const allVisibleSelected = sortedLeads.length > 0 && sortedLeads.every(l => selectedLeadIds.includes(l.id));
  const someVisibleSelected = sortedLeads.some(l => selectedLeadIds.includes(l.id)) && !allVisibleSelected;

  const handleToggleSelectAll = () => {
    if (allVisibleSelected) {
      const visibleIds = new Set(sortedLeads.map(l => l.id));
      setSelectedLeadIds(prev => prev.filter(id => !visibleIds.has(id)));
    } else {
      const visibleIds = sortedLeads.map(l => l.id);
      setSelectedLeadIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleDeleteBatch = async () => {
    if (selectedLeadIds.length === 0) return;
    if (await confirm(`Tem certeza que deseja excluir ${selectedLeadIds.length} leads selecionados do histórico?`)) {
      if (onDeleteLeadsBatch) {
        await onDeleteLeadsBatch(selectedLeadIds);
      } else {
        for (const id of selectedLeadIds) {
          await onDeleteLead(id);
        }
      }
      setSelectedLeadIds([]);
    }
  };

  const handleDeleteSingle = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await onDeleteLead(id);
    setSelectedLeadIds(prev => prev.filter(item => item !== id));
  };

  const handleSort = (field: 'name' | 'source' | 'stage' | 'score' | 'ltv' | 'updatedAt') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection(field === 'score' ? 'desc' : 'asc');
    }
  };

  const renderSortIcon = (field: 'name' | 'source' | 'stage' | 'score' | 'ltv' | 'updatedAt') => {
    if (sortField !== field) {
      return <span className="opacity-20 group-hover:opacity-60 ml-1 text-[11px] font-mono">↕</span>;
    }
    return (
      <span className="text-blue-600 ml-1 font-bold text-[11px]">
        {sortDirection === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  const handleStageChange = async (leadId: string, newStage: FunnelStage) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    await onUpdateLead(leadId, { stage: newStage });
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, stage: newStage });
    }
  };

  const handleOpenLeadDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setEditNotes(lead.notes || '');
  };

  const handleSaveLeadDetails = async () => {
    if (!selectedLead) return;
    await onUpdateLead(selectedLead.id, {
      notes: editNotes,
    });
    setSelectedLead(null);
  };

  const renderLeadCard = (lead: Lead) => (
    <div key={lead.id} className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs hover:border-blue-300 transition space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-100 shrink-0">
            {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
          </div>
          <div className="min-w-0">
            <h4 className="text-slate-900 font-bold truncate" title={lead.name || 'Lead Visitante'}>{lead.name || 'Lead Visitante'}</h4>
            <div className="text-[10px] text-slate-500 font-mono truncate">{lead.phone || 'S/ telefone'}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {lead.phone && (
            <button 
              onClick={() => onOpenWhatsApp ? onOpenWhatsApp(lead.id) : window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank')}
              className="text-green-600 hover:bg-green-50 p-1 rounded transition flex items-center justify-center" 
              title="Abrir no Inbox WhatsApp"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
          {lead.phone && onInitiateCall && (
            <button
              onClick={() => onInitiateCall(lead)}
              className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition flex items-center justify-center"
              title="Ligar para Lead (VoIP WebRTC)"
            >
              <Phone className="w-4 h-4" />
            </button>
          )}
          <button onClick={() => handleOpenLeadDetails(lead)} className="text-slate-400 hover:text-blue-600 hover:bg-slate-50 p-1 rounded transition" title="Detalhes">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={(e) => handleDeleteSingle(lead.id, e)} 
            className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition" 
            title="Excluir Lead"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
        {lead.score !== undefined && (
          <span className={`px-1.5 py-0.5 rounded font-extrabold border flex items-center gap-1 ${
            (lead.score || 0) >= 70
              ? 'bg-purple-50 text-purple-700 border-purple-200'
              : (lead.score || 0) >= 40
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            {(lead.score || 0) >= 70 ? '🔥' : (lead.score || 0) >= 40 ? '⭐' : '⚡'}
            <span>{lead.score || 0} pts</span>
            <span className="opacity-75 font-mono text-[9px]">({lead.qualificationLevel || 'Lead'})</span>
          </span>
        )}
        {lead.source?.toLowerCase().includes('pop-up') || lead.source?.toLowerCase().includes('popup') || lead.utmMedium === 'pop_up' ? (
          <span className="bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold border border-purple-200 truncate max-w-[130px]" title={lead.source || lead.utmSource}>
            🎯 {lead.source || 'Pop-up'}
          </span>
        ) : (
          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold border border-slate-200 truncate max-w-[100px]" title={lead.utmSource || lead.source}>
            {lead.utmSource || lead.source || 'Direto'}
          </span>
        )}
        {lead.utmCampaign && (
          <span className="text-slate-500 font-mono truncate max-w-[120px]" title={lead.utmCampaign}>
            📢 {lead.utmCampaign}
          </span>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <select
          value={lead.stage}
          onChange={(e) => handleStageChange(lead.id, e.target.value as FunnelStage)}
          className={`text-[10px] font-bold px-2 py-0.5 rounded border focus:outline-none cursor-pointer ${getStageBadgeClass(lead.stage)}`}
        >
          <option value="Novo Lead">Novo Lead</option>
          <option value="Contatado">Contatado</option>
          <option value="Em Negociação">Em Negociação</option>
          <option value="Convertido">Convertido</option>
          <option value="Perdido">Perdido</option>
        </select>
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <span className="font-bold text-slate-800 text-sm">
            R$ {getLeadLtv(lead.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-slate-400 text-[10px] flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(lead.createdAt).split(' ')[0]}
          </span>
        </div>
        
        {checkPendingRenewal(lead.id) && (
            <div className="mt-2 text-center bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-1 rounded flex justify-center items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Oferecer Novamente
            </div>
        )}
      </div>
    </div>
  );

  const handleExportCsv = () => {
    window.open('/api/leads/export', '_blank');
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            CRM de Leads e Funil de Atribuição
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe as etapas da jornada de vendas, localização geográfica, atribuição de UTM e eventos da linha do tempo.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-semibold px-4 py-2 rounded transition flex items-center gap-2"
        >
          <Download className="w-4 h-4 text-blue-600" />
          Exportar Relatório CSV
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        
        {/* Search */}
        <div className="relative w-full md:w-80 flex flex-col gap-2">
          {linkIdFilter && (
            <div className="flex items-center gap-1.5 bg-blue-100 text-blue-800 px-2 py-1 rounded text-[10px] font-bold w-max mb-1 border border-blue-200">
              <span className="truncate max-w-[300px]">
                Filtrando por Link: {links.find(l => l.id === linkIdFilter)?.title || 'Link Excluído'}
              </span>
              <button onClick={() => setLinkIdFilter?.(null)} className="hover:text-red-600 transition" title="Remover filtro">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, cidade, telefone, UTM..."
              value={currentSearchQuery}
              onChange={(e) => updateSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
            />
          </div>
        </div>

        {/* Dropdown Filters & View Toggles */}
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 shrink-0">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition ${viewMode === 'table' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="Visão em Tabela"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded transition ${viewMode === 'card' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="Visão em Cards"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded transition ${viewMode === 'kanban' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="Visão Kanban"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('funnel')}
              className={`p-1.5 rounded transition ${viewMode === 'funnel' ? 'bg-white shadow text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
              title="Visão de Funil"
            >
              <FunnelIcon className="w-4 h-4" />
            </button>
          </div>
          
          <div className="w-px h-6 bg-slate-200 hidden sm:block shrink-0"></div>
          
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-500 font-medium">Etapa:</span>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Etapas</option>
              <option value="Novo Lead">Novo Lead</option>
              <option value="Contatado">Contatado</option>
              <option value="Em Negociação">Em Negociação</option>
              <option value="Convertido">Convertido</option>
              <option value="Perdido">Perdido</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200 text-xs text-slate-700">
            <span className="text-slate-500 font-medium">Origem:</span>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Origens</option>
              <option value="meta_ads">Meta Ads</option>
              <option value="google_ads">Google Ads</option>
              <option value="instagram">Instagram</option>
              <option value="whatsapp">WhatsApp Direto</option>
            </select>
          </div>

        </div>

      </div>

      {/* Barra de Ações em Massa (Bulk Selection Bar) */}
      {selectedLeadIds.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50/60 to-blue-50 border border-blue-200 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {selectedLeadIds.length}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {selectedLeadIds.length === 1 ? '1 lead selecionado' : `${selectedLeadIds.length} leads selecionados`}
            </span>
            <span className="text-slate-300 text-xs hidden sm:inline">|</span>
            <button
              type="button"
              onClick={() => setSelectedLeadIds([])}
              className="text-xs text-blue-700 hover:text-blue-900 hover:underline font-medium"
            >
              Desmarcar todos
            </button>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleDeleteBatch}
              className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded-md transition text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Excluir Selecionados ({selectedLeadIds.length})
            </button>
          </div>
        </div>
      )}

      {/* Main Leads Views */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={input => {
                      if (input) input.indeterminate = someVisibleSelected;
                    }}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    title="Selecionar todos os leads visíveis"
                  />
                </th>
                <th 
                  className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition select-none group"
                  onClick={() => handleSort('name')}
                  title="Clique para ordenar por Nome"
                >
                  <div className="flex items-center gap-1 text-slate-700 group-hover:text-blue-600">
                    <span>Nome do Lead</span>
                    {renderSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition select-none group"
                  onClick={() => handleSort('score')}
                  title="Clique para ordenar por Score / Qualificação IA"
                >
                  <div className="flex items-center gap-1 text-slate-700 group-hover:text-blue-600">
                    <span>Score IA</span>
                    {renderSortIcon('score')}
                  </div>
                </th>
                <th 
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition select-none group"
                  onClick={() => handleSort('source')}
                  title="Clique para ordenar por Origem & UTMs"
                >
                  <div className="flex items-center gap-1 text-slate-700 group-hover:text-blue-600">
                    <span>Origem & UTMs</span>
                    {renderSortIcon('source')}
                  </div>
                </th>
                <th 
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition select-none group"
                  onClick={() => handleSort('stage')}
                  title="Clique para ordenar por Etapa do Funil"
                >
                  <div className="flex items-center gap-1 text-slate-700 group-hover:text-blue-600">
                    <span>Etapa do Funil</span>
                    {renderSortIcon('stage')}
                  </div>
                </th>
                <th 
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition select-none group"
                  onClick={() => handleSort('ltv')}
                  title="Clique para ordenar por LTV"
                >
                  <div className="flex items-center gap-1 text-slate-700 group-hover:text-blue-600">
                    <span>LTV</span>
                    {renderSortIcon('ltv')}
                  </div>
                </th>
                <th 
                  className="py-3.5 px-3 cursor-pointer hover:bg-slate-100 transition select-none group"
                  onClick={() => handleSort('updatedAt')}
                  title="Clique para ordenar por Data de Atualização"
                >
                  <div className="flex items-center gap-1 text-slate-700 group-hover:text-blue-600">
                    <span>Última Atualização</span>
                    {renderSortIcon('updatedAt')}
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedLeads.map((lead) => (
                <tr 
                  key={lead.id} 
                  className={`transition border-b border-slate-100 ${
                    selectedLeadIds.includes(lead.id) ? 'bg-blue-50/50 hover:bg-blue-50/80' : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Selection Checkbox */}
                  <td className="py-3.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedLeadIds.includes(lead.id)}
                      onChange={(e) => handleToggleSelectOne(lead.id, e as any)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                      title="Selecionar este lead"
                    />
                  </td>

                  {/* Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-100">
                        {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
                      </div>
                      <div>
                        <div className="text-slate-900 font-bold">{lead.name || 'Lead Visitante'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{lead.phone || 'Telefone indisponível'}</div>
                        {lead.assignedUserName && (
                          <div className="text-[10px] text-blue-600 font-medium flex items-center gap-1 mt-0.5">
                            <User className="w-3 h-3 text-blue-500" />
                            Resp: <strong>{lead.assignedUserName}</strong>
                          </div>
                        )}
                        {lead.assignedTeamName && (
                          <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.5 rounded border border-blue-200 w-fit inline-block mt-0.5">
                            {lead.assignedTeamName}
                          </span>
                        )}
                        {checkPendingRenewal(lead.id) && (
                           <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 w-fit mt-1">
                             <RefreshCw className="w-3 h-3" /> Renovação Pendente
                           </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Score / Qualificação IA */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 shadow-2xs ${
                        (lead.score || 0) >= 70 
                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                          : (lead.score || 0) >= 40 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {(lead.score || 0) >= 70 ? '🔥' : (lead.score || 0) >= 40 ? '⭐' : '⚡'}
                        <span>{lead.score || 0} pts</span>
                        <span className="opacity-75 font-mono text-[9px] uppercase tracking-wider">({lead.qualificationLevel || 'Lead'})</span>
                      </span>
                    </div>
                  </td>

                  {/* Source & Ad Attribution */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {lead.source?.toLowerCase().includes('pop-up') || lead.source?.toLowerCase().includes('popup') || lead.utmMedium === 'pop_up' ? (
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">
                          🎯 {lead.source || 'Pop-up'}
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                          {lead.utmSource || lead.source}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1 space-y-0.5">
                      <div className="truncate max-w-[170px]">📢 {lead.utmCampaign || 'campanha_geral'}</div>
                    </div>
                  </td>

                  {/* Stage */}
                  <td className="py-3.5 px-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${getStageBadgeClass(lead.stage)}`}>
                      {lead.stage}
                    </span>
                  </td>

                  {/* LTV */}
                  <td className="py-3.5 px-3 font-medium text-slate-800">
                    R$ {getLeadLtv(lead.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>

                  {/* Last Updated */}
                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDate(lead.updatedAt)}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {lead.phone && onInitiateCall && (
                        <button
                          onClick={() => onInitiateCall(lead)}
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded transition text-xs font-semibold px-2 flex items-center gap-1 border border-emerald-200"
                          title="Ligar para este lead via VoIP WebRTC"
                        >
                          <Phone className="w-3.5 h-3.5 fill-current" />
                          Ligar
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenLeadDetails(lead)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition text-xs font-semibold px-2 flex items-center gap-1 border border-slate-200"
                        title="Ver detalhes do lead"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Detalhes
                      </button>
                      <button
                        onClick={(e) => handleDeleteSingle(lead.id, e)}
                        className="p-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 rounded transition text-xs border border-slate-200 hover:border-red-200"
                        title="Excluir Lead"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

              {sortedLeads.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Nenhum lead encontrado com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {viewMode === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedLeads.map(lead => renderLeadCard(lead))}
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start h-[calc(100vh-220px)] min-h-[500px]">
          {['Novo Lead', 'Contatado', 'Em Negociação', 'Convertido', 'Perdido'].map(stage => {
            const stageLeads = sortedLeads.filter(l => l.stage === stage);
            return (
              <div key={stage} className="flex-shrink-0 w-80 bg-slate-50/50 rounded-lg flex flex-col h-full border border-slate-200">
                <div className="p-3 border-b border-slate-200 bg-white rounded-t-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">{stage}</h3>
                    <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                  </div>
                </div>
                <div className="p-3 overflow-y-auto flex-1 space-y-3">
                  {stageLeads.map(lead => renderLeadCard(lead))}
                  {stageLeads.length === 0 && (
                    <div className="text-center text-xs text-slate-400 py-6 italic border-2 border-dashed border-slate-200 rounded-lg">
                      Nenhum lead nesta etapa.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {viewMode === 'funnel' && (
        <FunnelView leads={filteredLeads} />
      )}

      {/* LEAD DETAILS & EVENTS MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-lg shadow-xl flex flex-col max-h-full overflow-hidden relative text-slate-800">
            
            <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100 shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Perfil do Lead: {selectedLead.name}
                </h3>
                <p className="text-xs text-slate-500">Atribuição completa de campanha e linha do tempo de conversões.</p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">

            {/* Quick Contact Bar (VoIP & WhatsApp) */}
            {selectedLead.phone && (
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Phone className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-extrabold text-slate-900">Contato Comercial Direto</p>
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded font-mono">VoIP Ativo</span>
                    </div>
                    <p className="text-xs text-slate-600 font-mono font-bold mt-0.5">{selectedLead.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onInitiateCall && (
                    <button
                      onClick={() => onInitiateCall(selectedLead)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95"
                    >
                      <PhoneCall className="w-3.5 h-3.5 fill-current" />
                      Ligar Agora (VoIP)
                    </button>
                  )}
                  {onOpenWhatsApp && (
                    <button
                      onClick={() => onOpenWhatsApp(selectedLead.id)}
                      className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-green-600/20 flex items-center gap-1.5 transition"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      WhatsApp
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Lead Score & Qualificação IA */}
            <div className="bg-gradient-to-r from-purple-50/70 via-indigo-50/50 to-blue-50/70 border border-purple-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      Lead Scoring & Qualificação IA
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">RD Style</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">Maturidade do lead para abordagem comercial</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black border flex items-center gap-1 shadow-2xs ${
                    (selectedLead.score || 0) >= 70
                      ? 'bg-purple-600 text-white border-purple-700'
                      : (selectedLead.score || 0) >= 40
                      ? 'bg-blue-600 text-white border-blue-700'
                      : 'bg-slate-200 text-slate-700 border-slate-300'
                  }`}>
                    {(selectedLead.score || 0) >= 70 ? '🔥' : (selectedLead.score || 0) >= 40 ? '⭐' : '⚡'}
                    <span>{selectedLead.score || 0} pts</span>
                  </span>
                  <span className="text-xs font-bold px-2 py-1 bg-white border border-purple-200 rounded-lg text-purple-900">
                    {selectedLead.qualificationLevel || 'Lead'} (Fit {selectedLead.fitGrade || 'B'})
                  </span>
                </div>
              </div>

              {/* Score Breakdown Pills */}
              {selectedLead.scoreBreakdown && selectedLead.scoreBreakdown.length > 0 && (
                <div className="pt-2 border-t border-purple-100">
                  <span className="text-[10px] font-bold text-slate-500 block mb-1.5">Critérios Pontuados:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedLead.scoreBreakdown.map((item, idx) => (
                      <span key={idx} className="bg-white/90 border border-purple-200 text-slate-700 text-[10px] px-2 py-0.5 rounded-md flex items-center gap-1">
                        <span className="text-emerald-600 font-bold">+{item.points}</span>
                        <span>{item.reason}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* General Lead Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Telefone:</span>
                <span className="text-slate-900 font-mono font-bold">{selectedLead.phone || 'Não informado'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Localização:</span>
                <span className="text-blue-700 font-semibold">{selectedLead.location?.city}, {selectedLead.location?.state}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Data de Criação:</span>
                <span className="text-slate-700 font-mono">{formatDate(selectedLead.createdAt)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Última Atualização:</span>
                <span className="text-slate-700 font-mono">{formatDate(selectedLead.updatedAt)}</span>
              </div>
            </div>

            {/* Detailed Ad & Campaign Hierarchy */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Atribuição de Anúncio e Tráfego Pago</span>
                <span className="bg-purple-100 text-purple-800 text-[10px] px-2 py-0.5 rounded font-bold">Hierarquia de Anúncio</span>
              </span>

              {/* Creative Highlight Banner */}
              <div className="bg-purple-50 border border-purple-200 p-3.5 rounded-lg flex items-start gap-3">
                <div className="w-8 h-8 rounded bg-purple-600 text-white flex items-center justify-center font-bold shrink-0 text-sm">
                  🎨
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-purple-700 uppercase font-bold tracking-wider">Anúncio / Criativo Específico (utm_content)</div>
                  <div className="text-sm font-extrabold text-purple-950 font-mono truncate">
                    {selectedLead.utmContent || 'Anúncio Padrão / Não Especificado'}
                  </div>
                  <p className="text-[11px] text-purple-800 mt-0.5">
                    Este é o anúncio criativo (imagem/vídeo/copy) que o cliente visualizou e clicou.
                  </p>
                </div>
              </div>

              {/* Ad Hierarchy Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">📢 Campanha (utm_campaign)</span>
                  <span className="font-mono text-slate-900 font-bold block truncate">{selectedLead.utmCampaign || 'Geral'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">🎯 Conjunto / AdSet (utm_term)</span>
                  <span className="font-mono text-slate-900 font-bold block truncate">{selectedLead.utmTerm || 'Amplo / Todos'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">🌐 Origem (utm_source)</span>
                  <span className="font-mono text-blue-700 font-bold block truncate">{selectedLead.utmSource || 'Direto'} ({selectedLead.utmMedium || 'cpc'})</span>
                </div>
              </div>
            </div>

            {/* Edit Value and Stage */}
            <div className="grid grid-cols-2 gap-4">
              {/* Compras e LTV */}
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    Compras e LTV (R$ {getLeadLtv(selectedLead.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                  </h4>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
                  {/* Novo Cadastro de Venda */}
                  <div className="flex gap-2">
                    <select
                      value={newPurchaseProductId}
                      onChange={(e) => setNewPurchaseProductId(e.target.value)}
                      className="flex-1 text-xs border border-slate-200 rounded p-1.5 focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Registrar Nova Venda...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} - R$ {p.price}</option>
                      ))}
                    </select>
                    <button
                      onClick={async () => {
                        if (!newPurchaseProductId) return;
                        const p = products.find(prod => prod.id === newPurchaseProductId);
                        if (!p) return;
                        await onCreatePurchase({
                          leadId: selectedLead.id,
                          productId: p.id,
                          amount: p.price
                        });
                        setNewPurchaseProductId('');
                        await success('Venda registrada com sucesso!');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold"
                    >
                      Adicionar
                    </button>
                  </div>
                  
                  {/* Lista de Compras */}
                  {getLeadPurchases(selectedLead.id).length > 0 ? (
                    <div className="space-y-2 mt-3">
                      {getLeadPurchases(selectedLead.id).map(purchase => {
                        const product = products.find(p => p.id === purchase.productId);
                        return (
                          <div key={purchase.id} className="flex justify-between items-center bg-white border border-slate-200 p-2 rounded text-xs">
                            <div>
                              <p className="font-semibold text-slate-800">{product?.name || 'Produto Excluído'}</p>
                              <p className="text-[10px] text-slate-500">{formatDate(purchase.purchasedAt)}</p>
                            </div>
                            <span className="font-semibold text-green-700">R$ {purchase.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 text-center py-2">Nenhuma venda registrada.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Etapa Atual no Funil</label>
                <select
                  value={selectedLead.stage}
                  onChange={(e) => handleStageChange(selectedLead.id, e.target.value as FunnelStage)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:bg-white focus:border-blue-600"
                >
                  <option value="Novo Lead">Novo Lead</option>
                  <option value="Contatado">Contatado</option>
                  <option value="Em Negociação">Em Negociação</option>
                  <option value="Convertido">Convertido</option>
                  <option value="Perdido">Perdido</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Notas da Negociação</label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Ex: Cliente interessado na assinatura anual..."
                className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
              />
            </div>

            {/* Timeline / Conversion & Journey Events History */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  Histórico da Jornada & Eventos ({leadTimelineEvents.length})
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Rastreamento em tempo real
                </span>
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {leadTimelineEvents.length > 0 ? (
                  leadTimelineEvents.map((evt) => (
                    <div key={evt.id} className="bg-slate-50 hover:bg-slate-100/70 p-3 rounded-xl border border-slate-200 text-[11px] flex flex-col gap-1.5 transition">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black uppercase text-[9px] px-2 py-0.5 rounded-full ${
                            evt.type === 'popup' || evt.type === 'popup_capture' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                            evt.type === 'chatbot_flow' ? 'bg-cyan-100 text-cyan-800 border border-cyan-200' :
                            evt.type === 'landing_page' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            evt.type === 'webhook' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                            evt.type === 'meta_capi' || evt.type === 'meta_pixel' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            evt.type === 'google_ads' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            'bg-slate-200 text-slate-800'
                          }`}>
                            {evt.type === 'popup' || evt.type === 'popup_capture' ? 'POP-UP' : evt.type === 'chatbot_flow' ? '🤖 FLUXO CRM' : evt.type?.replace('_', ' ')}
                          </span>
                          <span className="text-slate-900 font-bold">{evt.eventName}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[10px]">{formatDate(evt.timestamp)}</span>
                      </div>
                      
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {evt.details}
                      </p>

                      {(evt.utmSource || evt.utmCampaign || evt.utmContent || evt.utmTerm) && (
                        <div className="flex flex-wrap gap-1 mt-1 pt-1.5 border-t border-slate-200/60">
                          {evt.utmCampaign && <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] font-medium" title="Campanha">Campanha: {evt.utmCampaign}</span>}
                          {evt.utmTerm && <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-100 rounded text-[9px] font-medium" title="Conjunto (Term)">Conjunto: {evt.utmTerm}</span>}
                          {evt.utmContent && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-100 rounded text-[9px] font-medium" title="Anúncio (Content)">Criativo: {evt.utmContent}</span>}
                          {evt.utmSource && <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[9px] font-medium" title="Origem (Source)">Origem: {evt.utmSource}</span>}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                    Nenhum evento registrado ainda.
                  </p>
                )}
              </div>
            </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={async () => {
                  await handleStageChange(selectedLead.id, 'Convertido');
                  setSelectedLead(null);
                }}
                className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-bold px-4 py-2 rounded transition flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" />
                Marcar como Convertido
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveLeadDetails}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded transition shadow-xs"
                >
                  Salvar Detalhes
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
