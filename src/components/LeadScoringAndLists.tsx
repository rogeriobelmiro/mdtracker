import React, { useState, useEffect, useMemo } from 'react';
import { 
  Target, Flame, Award, Users, Filter, Plus, Edit3, Trash2, 
  Send, Sparkles, RefreshCw, CheckCircle2, AlertCircle, TrendingUp, 
  ChevronRight, Phone, MessageSquare, ArrowUpRight, ShieldCheck, 
  Sliders, Star, Zap, Info, ExternalLink, X
} from 'lucide-react';
import { 
  Lead, SmartList, SmartListCondition, LeadScoringConfig, 
  QualificationLevel, FitGrade, Company, User as UserType, FunnelStage 
} from '../types';
import { 
  fetchSmartLists, createSmartList, updateSmartList, deleteSmartList, 
  fetchLeadScoringConfig, updateLeadScoringConfig, recalculateAllScores, 
  analyzeLeadScoreAI 
} from '../services/api';

interface LeadScoringAndListsProps {
  leads: Lead[];
  currentCompany: Company | null;
  currentUser: UserType | null;
  onInitiateCall: (lead: { id: string; name: string; phone: string }) => void;
  onOpenWhatsApp?: (leadId: string) => void;
  onNavigateToTab?: (tab: string) => void;
  onRefreshLeads?: () => Promise<void>;
}

export const LeadScoringAndLists: React.FC<LeadScoringAndListsProps> = ({
  leads,
  currentCompany,
  currentUser,
  onInitiateCall,
  onOpenWhatsApp,
  onNavigateToTab,
  onRefreshLeads
}) => {
  const [activeTab, setActiveTab] = useState<'smart_lists' | 'scoring_rules' | 'leads_ranking'>('smart_lists');
  const [smartLists, setSmartLists] = useState<SmartList[]>([]);
  const [scoringConfig, setScoringConfig] = useState<LeadScoringConfig>({
    mqlThreshold: 40,
    sqlThreshold: 70,
    pointsPerAction: {
      popupConversion: 15,
      landingPageConversion: 20,
      emailOpen: 10,
      smsClick: 15,
      chatbotInteraction: 25,
      callAnswered: 30,
      productPurchase: 50,
      inactivityDecay: -15
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalcSuccess, setRecalcSuccess] = useState(false);
  const [searchLeadQuery, setSearchLeadQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  // Modal List State
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [listName, setListName] = useState('');
  const [listDescription, setListDescription] = useState('');
  const [listColor, setListColor] = useState('#2563eb');
  const [listMatchType, setListMatchType] = useState<'all' | 'any'>('all');
  const [listConditions, setListConditions] = useState<SmartListCondition[]>([
    { field: 'score', operator: 'greater_than', value: 40 }
  ]);
  const [isSavingList, setIsSavingList] = useState(false);

  // Selected List Filter View
  const [selectedListToView, setSelectedListToView] = useState<SmartList | null>(null);

  // AI Analysis Modal State
  const [aiLeadAnalysis, setAiLeadAnalysis] = useState<{
    leadName: string;
    score: number;
    qualificationLevel: string;
    fitGrade: string;
    explanation: string;
    breakdown: Array<{ reason: string; points: number }>;
  } | null>(null);
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const companyId = currentCompany?.id || 'comp-alfa';
      const [listsData, configData] = await Promise.all([
        fetchSmartLists(companyId),
        fetchLeadScoringConfig(companyId)
      ]);
      setSmartLists(listsData);
      if (configData) setScoringConfig(configData);
    } catch (err) {
      console.error('Erro ao carregar listas e scoring:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentCompany?.id]);

  // Recalculate All
  const handleRecalculateAll = async () => {
    setIsRecalculating(true);
    setRecalcSuccess(false);
    try {
      const companyId = currentCompany?.id || 'comp-alfa';
      await recalculateAllScores(companyId);
      if (onRefreshLeads) await onRefreshLeads();
      setRecalcSuccess(true);
      setTimeout(() => setRecalcSuccess(false), 4000);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao recalcular scores');
    } finally {
      setIsRecalculating(false);
    }
  };

  // Save Scoring Config
  const handleSaveScoringConfig = async () => {
    try {
      const companyId = currentCompany?.id || 'comp-alfa';
      await updateLeadScoringConfig(companyId, scoringConfig);
      alert('Regras de Lead Scoring salvas com sucesso!');
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar regras de scoring');
    }
  };

  // Helper to filter leads according to a list's conditions
  const filterLeadsByConditions = (leadsList: Lead[], conditions: SmartListCondition[], matchType: 'all' | 'any') => {
    if (!conditions || conditions.length === 0) return leadsList;
    const isAnd = matchType === 'all';

    return leadsList.filter(lead => {
      const results = conditions.map(cond => {
        const field = cond.field;
        const op = cond.operator;
        const val = cond.value;

        switch (field) {
          case 'score': {
            const leadScore = lead.score !== undefined ? lead.score : 20;
            if (op === 'greater_than') return leadScore >= Number(val);
            if (op === 'less_than') return leadScore <= Number(val);
            return leadScore === Number(val);
          }
          case 'qualificationLevel': {
            return String(lead.qualificationLevel || 'Lead').toLowerCase() === String(val).toLowerCase();
          }
          case 'stage': {
            return String(lead.stage || '').toLowerCase() === String(val).toLowerCase();
          }
          case 'utmSource': {
            const src = (lead.utmSource || lead.source || '').toLowerCase();
            return src.includes(String(val).toLowerCase());
          }
          case 'hasPhone': {
            const phone = String(lead.phone || '').replace(/\D/g, '');
            return val ? phone.length >= 8 : phone.length < 8;
          }
          case 'hasEmail': {
            const email = String(lead.email || '');
            return val ? email.includes('@') : !email.includes('@');
          }
          case 'minLtv': {
            const ltv = Number(lead.value || 0);
            return ltv >= Number(val);
          }
          default:
            return true;
        }
      });

      return isAnd ? results.every(Boolean) : results.some(Boolean);
    });
  };

  // Open Modal Create/Edit List
  const handleOpenListModal = (list?: SmartList) => {
    if (list) {
      setEditingListId(list.id);
      setListName(list.name);
      setListDescription(list.description || '');
      setListColor(list.color || '#2563eb');
      setListMatchType(list.matchType || 'all');
      setListConditions(list.conditions && list.conditions.length > 0 ? list.conditions : [{ field: 'score', operator: 'greater_than', value: 40 }]);
    } else {
      setEditingListId(null);
      setListName('');
      setListDescription('');
      setListColor('#2563eb');
      setListMatchType('all');
      setListConditions([{ field: 'score', operator: 'greater_than', value: 40 }]);
    }
    setIsListModalOpen(true);
  };

  // Save Smart List
  const handleSaveList = async () => {
    if (!listName.trim()) {
      alert('Informe um nome para a lista.');
      return;
    }

    setIsSavingList(true);
    try {
      const companyId = currentCompany?.id || 'comp-alfa';
      if (editingListId) {
        const updated = await updateSmartList(editingListId, {
          name: listName,
          description: listDescription,
          color: listColor,
          matchType: listMatchType,
          conditions: listConditions
        });
        setSmartLists(prev => prev.map(l => l.id === editingListId ? updated : l));
      } else {
        const created = await createSmartList({
          companyId,
          name: listName,
          description: listDescription,
          color: listColor,
          matchType: listMatchType,
          conditions: listConditions
        });
        setSmartLists(prev => [created, ...prev]);
      }
      setIsListModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar lista');
    } finally {
      setIsSavingList(false);
    }
  };

  // Delete Smart List
  const handleDeleteList = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta lista de segmentação?')) return;
    try {
      await deleteSmartList(id);
      setSmartLists(prev => prev.filter(l => l.id !== id));
      if (selectedListToView?.id === id) setSelectedListToView(null);
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir lista');
    }
  };

  // Add / Remove Condition Rows
  const handleAddCondition = () => {
    setListConditions(prev => [...prev, { field: 'score', operator: 'greater_than', value: 50 }]);
  };

  const handleRemoveCondition = (index: number) => {
    setListConditions(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateCondition = (index: number, patch: Partial<SmartListCondition>) => {
    setListConditions(prev => prev.map((c, i) => i === index ? { ...c, ...patch } : c));
  };

  // Live count preview in modal
  const livePreviewCount = useMemo(() => {
    return filterLeadsByConditions(leads, listConditions, listMatchType).length;
  }, [leads, listConditions, listMatchType]);

  // AI Scoring Analysis for a single lead
  const handleAnalyzeLeadAI = async (lead: Lead) => {
    setIsAnalyzingAI(true);
    try {
      const companyId = currentCompany?.id || 'comp-alfa';
      const res = await analyzeLeadScoreAI(lead.id, companyId);
      setAiLeadAnalysis({
        leadName: lead.name,
        score: res.score,
        qualificationLevel: res.qualificationLevel,
        fitGrade: res.fitGrade,
        explanation: res.explanation,
        breakdown: res.breakdown || []
      });
      if (onRefreshLeads) await onRefreshLeads();
    } catch (err: any) {
      alert(err.message || 'Erro ao analisar lead com IA');
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  // KPIs
  const totalLeadsCount = leads.length;
  const mqlCount = leads.filter(l => (l.qualificationLevel === 'MQL') || ((l.score || 0) >= 40 && (l.score || 0) < 70)).length;
  const sqlCount = leads.filter(l => (l.qualificationLevel === 'SQL') || ((l.score || 0) >= 70)).length;
  const avgScore = totalLeadsCount > 0 
    ? Math.round(leads.reduce((acc, l) => acc + (l.score !== undefined ? l.score : 20), 0) / totalLeadsCount) 
    : 0;

  // Sorted & Filtered Leads for Ranking
  const rankedLeads = useMemo(() => {
    let result = [...leads];

    if (selectedListToView) {
      result = filterLeadsByConditions(result, selectedListToView.conditions, selectedListToView.matchType);
    }

    if (searchLeadQuery) {
      const q = searchLeadQuery.toLowerCase();
      result = result.filter(l => 
        (l.name || '').toLowerCase().includes(q) ||
        (l.phone || '').includes(q) ||
        (l.email || '').toLowerCase().includes(q)
      );
    }

    if (levelFilter !== 'all') {
      result = result.filter(l => (l.qualificationLevel || 'Lead') === levelFilter);
    }

    // Sort descending by score
    return result.sort((a, b) => (b.score || 20) - (a.score || 20));
  }, [leads, selectedListToView, searchLeadQuery, levelFilter]);

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-purple-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-400/30 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Inteligência de Vendas estilo RD Station Marketing & CRM
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Listas Inteligentes & Lead Scoring com IA
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Descubra os leads mais quentes da sua base, separe automaticamente em <strong>MQL</strong> e <strong>SQL</strong> e crie listas dinâmicas para disparar campanhas de alta conversão.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={() => handleOpenListModal()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nova Lista Inteligente
            </button>

            <button
              onClick={handleRecalculateAll}
              disabled={isRecalculating}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-3 rounded-2xl font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin text-purple-400' : ''}`} />
              {isRecalculating ? 'Recalculando...' : 'Recalcular Scores'}
            </button>
          </div>
        </div>

        {recalcSuccess && (
          <div className="mt-4 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs px-3.5 py-2 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Todos os leads foram recalculados com sucesso e atualizados com inteligência comercial!</span>
          </div>
        )}
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total de Leads</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{totalLeadsCount}</p>
          <p className="text-[11px] text-slate-500 mt-1">Base sincronizada com CRM</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">MQLs (Qualificados)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Star className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-2">{mqlCount}</p>
          <p className="text-[11px] text-purple-600/80 dark:text-purple-400/80 mt-1 font-semibold">
            Score entre {scoringConfig.mqlThreshold} e {scoringConfig.sqlThreshold - 1} pontos
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">SQLs (Prontos p/ Venda)</span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-current" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-2">{sqlCount}</p>
          <p className="text-[11px] text-red-600/80 dark:text-red-400/80 mt-1 font-semibold">
            Score ≥ {scoringConfig.sqlThreshold} (Prioridade Máxima)
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Score Médio da Base</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{avgScore} / 100</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            Nível geral de engajamento comercial
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('smart_lists')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'smart_lists'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Filter className="w-4 h-4" />
          Listas Inteligentes de Segmentação ({smartLists.length})
        </button>

        <button
          onClick={() => setActiveTab('leads_ranking')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'leads_ranking'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Flame className="w-4 h-4" />
          Ranking de Leads por Score ({leads.length})
        </button>

        <button
          onClick={() => setActiveTab('scoring_rules')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'scoring_rules'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Regras de Pontuação (Lead Scoring)
        </button>
      </div>

      {/* TAB 1: LISTAS INTELIGENTES */}
      {activeTab === 'smart_lists' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {smartLists.map(list => {
              const liveCount = filterLeadsByConditions(leads, list.conditions, list.matchType).length;
              const isSelected = selectedListToView?.id === list.id;

              return (
                <div
                  key={list.id}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm hover:shadow-md transition space-y-4 flex flex-col justify-between ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div 
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm" 
                          style={{ backgroundColor: list.color || '#2563eb' }} 
                        />
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                          {list.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenListModal(list)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Editar lista"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteList(list.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                          title="Excluir lista"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[36px]">
                      {list.description || 'Segmentação dinâmica baseada em regras comportamentais.'}
                    </p>

                    {/* Filter Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {list.conditions.map((cond, idx) => (
                        <span 
                          key={idx}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"
                        >
                          {cond.field} {cond.operator} {String(cond.value)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Alcance Atual</span>
                      <span className="text-base font-black text-slate-900 dark:text-white font-mono">
                        {liveCount} {liveCount === 1 ? 'lead' : 'leads'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedListToView(isSelected ? null : list);
                          setActiveTab('leads_ranking');
                        }}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1"
                      >
                        Ver Leads
                      </button>

                      {onNavigateToTab && (
                        <button
                          onClick={() => onNavigateToTab('broadcast')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1"
                          title="Criar disparo para esta lista"
                        >
                          <Send className="w-3 h-3" />
                          Disparar
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: RANKING GERAL DE LEADS */}
      {activeTab === 'leads_ranking' && (
        <div className="space-y-4">
          
          {/* Active Filter Banner if list is selected */}
          {selectedListToView && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedListToView.color || '#2563eb' }} />
                <span className="text-xs font-bold text-blue-900">
                  Filtrando pela lista: <strong>{selectedListToView.name}</strong> ({rankedLeads.length} leads)
                </span>
              </div>
              <button
                onClick={() => setSelectedListToView(null)}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Limpar filtro da lista ✕
              </button>
            </div>
          )}

          {/* Search & Level Filters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="w-full sm:w-80">
              <input
                type="text"
                placeholder="Buscar lead por nome, telefone ou e-mail..."
                value={searchLeadQuery}
                onChange={(e) => setSearchLeadQuery(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-semibold">Qualificação:</span>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-semibold px-3 py-2 focus:outline-none"
              >
                <option value="all">Todas as Qualificações</option>
                <option value="SQL">🔥 SQL (Sales Qualified)</option>
                <option value="MQL">⭐ MQL (Marketing Qualified)</option>
                <option value="Lead">🌱 Lead em Nutrição</option>
              </select>
            </div>
          </div>

          {/* Ranked Leads Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-4">Lead</th>
                    <th className="py-3 px-4">Score & Nível</th>
                    <th className="py-3 px-4">Perfil Fit</th>
                    <th className="py-3 px-4">Etapa CRM</th>
                    <th className="py-3 px-4">Origem UTM</th>
                    <th className="py-3 px-4">LTV / Compras</th>
                    <th className="py-3 px-4 text-right">Ações Comerciais</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rankedLeads.map((lead, idx) => {
                    const score = lead.score !== undefined ? lead.score : 20;
                    const qualLevel = lead.qualificationLevel || (score >= 70 ? 'SQL' : score >= 40 ? 'MQL' : 'Lead');
                    const fit = lead.fitGrade || 'B';

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-mono text-slate-400 font-bold w-4">#{idx + 1}</span>
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                              {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white truncate max-w-[160px]">{lead.name}</p>
                              <p className="text-[10px] text-slate-500 font-mono">{lead.phone || lead.email || 'Sem contato'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                                qualLevel === 'SQL' 
                                  ? 'bg-red-50 text-red-700 border border-red-200' 
                                  : qualLevel === 'MQL' 
                                  ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {qualLevel === 'SQL' && '🔥 '}
                                {qualLevel === 'MQL' && '⭐ '}
                                {qualLevel} ({score})
                              </span>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${qualLevel === 'SQL' ? 'bg-red-500' : qualLevel === 'MQL' ? 'bg-purple-500' : 'bg-slate-400'}`}
                                style={{ width: `${score}%` }} 
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center border ${
                            fit === 'A' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            fit === 'B' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {fit}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {lead.stage}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-[11px] text-slate-600 dark:text-slate-300 font-mono truncate max-w-[120px] block" title={lead.utmSource || lead.source}>
                            {lead.utmSource || lead.source || 'Direto'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 dark:text-slate-200 font-mono">
                            R$ {(lead.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleAnalyzeLeadAI(lead)}
                              className="p-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition"
                              title="Diagnóstico IA do Score"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>

                            {lead.phone && (
                              <button
                                onClick={() => onInitiateCall({ id: lead.id, name: lead.name, phone: lead.phone || '' })}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                                title="Ligar para Lead (VoIP)"
                              >
                                <Phone className="w-3.5 h-3.5 fill-current" />
                              </button>
                            )}

                            {lead.phone && onOpenWhatsApp && (
                              <button
                                onClick={() => onOpenWhatsApp(lead.id)}
                                className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition"
                                title="Conversar no WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REGRAS DE LEAD SCORING */}
      {activeTab === 'scoring_rules' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm max-w-3xl space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Pesos & Regras de Pontuação (Lead Scoring)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Defina os pontos somados ou deduzidos para cada ação comportamental do lead no seu funil de vendas.
            </p>
          </div>

          {/* Thresholds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                ⭐ Limiar para MQL (Pontos Mínimos)
              </label>
              <input
                type="number"
                value={scoringConfig.mqlThreshold}
                onChange={(e) => setScoringConfig({ ...scoringConfig, mqlThreshold: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Geralmente entre 35 e 50 pontos.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                🔥 Limiar para SQL (Pronto para Fechar)
              </label>
              <input
                type="number"
                value={scoringConfig.sqlThreshold}
                onChange={(e) => setScoringConfig({ ...scoringConfig, sqlThreshold: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Geralmente entre 65 e 80 pontos.</span>
            </div>
          </div>

          {/* Points Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Pontuação por Atividade Realizada
            </h4>

            {[
              { key: 'landingPageConversion', label: 'Conversão em Landing Page Oficial', desc: 'Preencheu formulário em /p/:slug' },
              { key: 'popupConversion', label: 'Conversão via Pop-up Inteligente', desc: 'Capturado por intenção de saída ou scroll' },
              { key: 'chatbotInteraction', label: 'Conversa Ativa com Chatbot IA', desc: 'Tirou dúvidas pelo WhatsApp ou Direct' },
              { key: 'callAnswered', label: 'Ligação Telefônica VoIP Atendida', desc: 'Atendeu chamada comercial do atendente' },
              { key: 'emailOpen', label: 'Abertura de E-mail Marketing', desc: 'Abriu campanha de e-mail disparada' },
              { key: 'smsClick', label: 'Clique em Link de SMS', desc: 'Acessou link curto de disparo de SMS' },
              { key: 'productPurchase', label: 'Compra de Produto / Conversão', desc: 'Comprou qualquer item do catálogo' },
              { key: 'inactivityDecay', label: 'Decaimento por Inatividade (+30 dias)', desc: 'Penalidade de perda de interesse' }
            ].map(item => (
              <div 
                key={item.key}
                className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700"
              >
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{item.label}</p>
                  <p className="text-[10px] text-slate-500">{item.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 w-24">
                  <input
                    type="number"
                    value={(scoringConfig.pointsPerAction as any)[item.key]}
                    onChange={(e) => setScoringConfig({
                      ...scoringConfig,
                      pointsPerAction: {
                        ...scoringConfig.pointsPerAction,
                        [item.key]: Number(e.target.value)
                      }
                    })}
                    className="w-full text-xs font-bold text-right p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:outline-none"
                  />
                  <span className="text-[10px] font-bold text-slate-400">pts</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={handleSaveScoringConfig}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition"
            >
              Salvar Regras de Scoring
            </button>
            <button
              onClick={handleRecalculateAll}
              disabled={isRecalculating}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRecalculating ? 'animate-spin' : ''}`} />
              Aplicar e Recalcular Base Agora
            </button>
          </div>
        </div>
      )}

      {/* MODAL: NOVA / EDITAR LISTA INTELIGENTE */}
      {isListModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {editingListId ? 'Editar Lista Inteligente' : 'Criar Nova Lista Inteligente'}
              </h3>
              <button onClick={() => setIsListModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Nome da Lista *
                </label>
                <input
                  type="text"
                  placeholder="Ex: 🔥 Leads Quentes do Meta Ads (SQL)"
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Descrição / Objetivo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Leads prontos para abordagem comercial com WhatsApp ativo."
                  value={listDescription}
                  onChange={(e) => setListDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              {/* Color & Match Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Cor da Tag
                  </label>
                  <div className="flex items-center gap-2">
                    {['#ef4444', '#f59e0b', '#10b981', '#2563eb', '#8b5cf6', '#ec4899'].map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setListColor(c)}
                        className={`w-6 h-6 rounded-full transition ${listColor === c ? 'ring-2 ring-offset-2 ring-slate-900 scale-110' : ''}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Correspondência
                  </label>
                  <select
                    value={listMatchType}
                    onChange={(e) => setListMatchType(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold focus:outline-none"
                  >
                    <option value="all">Todas as condições (E / AND)</option>
                    <option value="any">Qualquer condição (OU / OR)</option>
                  </select>
                </div>
              </div>

              {/* Conditions Builder */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Critérios de Filtro ({listConditions.length})
                  </label>
                  <button
                    type="button"
                    onClick={handleAddCondition}
                    className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Critério
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {listConditions.map((cond, idx) => (
                    <div 
                      key={idx}
                      className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-2"
                    >
                      <select
                        value={cond.field}
                        onChange={(e) => handleUpdateCondition(idx, { field: e.target.value as any })}
                        className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none flex-1"
                      >
                        <option value="score">Pontuação Score</option>
                        <option value="qualificationLevel">Nível (SQL / MQL / Lead)</option>
                        <option value="stage">Etapa do Funil CRM</option>
                        <option value="utmSource">Origem UTM (Tráfego)</option>
                        <option value="hasPhone">Possui Telefone Válido</option>
                        <option value="hasEmail">Possui E-mail Comercial</option>
                        <option value="minLtv">LTV Mínimo (Compras R$)</option>
                      </select>

                      <select
                        value={cond.operator}
                        onChange={(e) => handleUpdateCondition(idx, { operator: e.target.value as any })}
                        className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold focus:outline-none w-28"
                      >
                        <option value="greater_than">Maior ou =</option>
                        <option value="less_than">Menor ou =</option>
                        <option value="equals">Igual a</option>
                        <option value="contains">Contém texto</option>
                        <option value="is_true">É verdadeiro</option>
                      </select>

                      <input
                        type="text"
                        value={String(cond.value)}
                        onChange={(e) => handleUpdateCondition(idx, { value: e.target.value })}
                        placeholder="Valor..."
                        className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-24 font-mono focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-2xl p-3 flex items-center justify-between text-xs">
                <span className="text-blue-900 dark:text-blue-200 font-semibold">
                  Previsão de Leads Atingidos:
                </span>
                <span className="font-mono font-bold text-blue-700 dark:text-blue-300 text-sm">
                  {livePreviewCount} {livePreviewCount === 1 ? 'lead elegível' : 'leads elegíveis'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsListModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveList}
                disabled={isSavingList}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md disabled:opacity-50"
              >
                {isSavingList ? 'Salvando...' : 'Salvar Lista Inteligente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DIAGNÓSTICO IA DE LEAD SCORING */}
      {aiLeadAnalysis && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Diagnóstico IA de Lead Scoring (Gemini 2.5 Flash)
                </h3>
              </div>
              <button onClick={() => setAiLeadAnalysis(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{aiLeadAnalysis.leadName}</h4>
                  <span className="text-xs text-purple-700 font-semibold">
                    Classificação: {aiLeadAnalysis.qualificationLevel} • Fit Perfil: {aiLeadAnalysis.fitGrade}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-purple-700 font-mono">
                    {aiLeadAnalysis.score} pts
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  {aiLeadAnalysis.explanation}
                </p>
              </div>

              {aiLeadAnalysis.breakdown && aiLeadAnalysis.breakdown.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                    Composição da Pontuação
                  </h5>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {aiLeadAnalysis.breakdown.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800">
                        <span className="text-slate-700 dark:text-slate-300">{item.reason}</span>
                        <span className={`font-mono font-bold ${item.points >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {item.points >= 0 ? `+${item.points}` : item.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setAiLeadAnalysis(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
