import React, { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  CheckCircle2, 
  Star, 
  BarChart3, 
  Users, 
  X, 
  RefreshCw, 
  MessageSquare,
  Sparkles,
  ArrowRight,
  Sliders,
  HelpCircle,
  TrendingUp,
  Download,
  Printer,
  FileSpreadsheet,
  Phone,
  Mail,
  User,
  Award,
  ThumbsUp,
  ThumbsDown,
  Meh,
  PieChart as PieChartIcon,
  Layers,
  MessageCircle,
  GripVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Cell, 
  PieChart, 
  Pie, 
  Legend 
} from 'recharts';
import { Company, Survey, SurveyQuestion, SurveyOption, SurveyResponse } from '../types';
import { 
  fetchSurveys, 
  createSurvey, 
  updateSurvey, 
  deleteSurvey, 
  fetchSurveyResponses 
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';

interface SurveysManagerProps {
  currentCompany: Company;
  onSelectSurveyForLandingPage?: (survey: Survey) => void;
}

export const SurveysManager: React.FC<SurveysManagerProps> = ({ currentCompany, onSelectSurveyForLandingPage }) => {
  const { alert, confirm } = useDialog();

  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Editor Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Partial<Survey> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedQuestionIndex, setDraggedQuestionIndex] = useState<number | null>(null);

  // Responses / Report Modal State
  const [isResponsesOpen, setIsResponsesOpen] = useState(false);
  const [selectedSurveyForResponses, setSelectedSurveyForResponses] = useState<Survey | null>(null);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [activeReportTab, setActiveReportTab] = useState<'analytics' | 'individual'>('analytics');
  const [responseSearchQuery, setResponseSearchQuery] = useState('');
  const [chartTypeMap, setChartTypeMap] = useState<Record<string, 'bar' | 'pie'>>({});

  // Load Surveys
  const loadSurveys = async () => {
    try {
      setLoading(true);
      const data = await fetchSurveys(currentCompany.id);
      setSurveys(data);
    } catch (err: any) {
      console.error('Erro ao carregar pesquisas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSurveys();
  }, [currentCompany.id]);

  // Copy link
  const handleCopyLink = async (slug: string, id: string) => {
    const url = `${window.location.origin}/pesquisa/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      prompt('Copie o link da pesquisa:', url);
    }
  };

  // Open Create Blank
  const handleCreateBlank = () => {
    const newSurvey: Partial<Survey> = {
      companyId: currentCompany.id,
      title: 'Nova Pesquisa de Qualificação',
      slug: `pesquisa-${Date.now().toString().slice(-4)}`,
      description: 'Responda a estas breves perguntas para avaliarmos seu momento e necessidades.',
      status: 'published',
      theme: {
        primaryColor: '#7c3aed',
        backgroundColor: 'white',
        fontFamily: 'Inter',
        buttonStyle: 'rounded-xl'
      },
      questions: [
        {
          id: 'q1',
          title: 'Qual é o seu objetivo principal no momento?',
          type: 'single_choice',
          required: true,
          options: [
            { id: 'opt1', label: 'Aumentar minhas vendas no WhatsApp' },
            { id: 'opt2', label: 'Organizar a equipe comercial' },
            { id: 'opt3', label: 'Rastrear anúncios e ROI' }
          ]
        },
        {
          id: 'q2',
          title: 'Em uma escala de 0 a 10, quão urgente é resolver este desafio?',
          type: 'nps',
          required: true,
          minScale: 0,
          maxScale: 10
        },
        {
          id: 'q3',
          title: 'Seus dados de contato para envio do resultado:',
          type: 'contact_info',
          required: true
        }
      ],
      thankYou: {
        title: '🎉 Respostas Recebidas com Sucesso!',
        subtitle: 'Agradecemos muito pelo seu feedback. Nossa equipe entrará em contato em breve.',
        whatsappGroupUrl: 'https://chat.whatsapp.com/demo-mdtracker',
        ctaButtonText: 'Entrar no Grupo VIP do WhatsApp'
      }
    };
    setEditingSurvey(newSurvey);
    setIsEditorOpen(true);
  };

  // Open Edit
  const handleEdit = (survey: Survey) => {
    setEditingSurvey(JSON.parse(JSON.stringify(survey)));
    setIsEditorOpen(true);
  };

  // Save Survey
  const handleSaveSurvey = async () => {
    if (!editingSurvey || !editingSurvey.title) {
      await alert('Por favor, informe ao menos o título da pesquisa.');
      return;
    }

    try {
      setIsSaving(true);
      if (editingSurvey.id) {
        const updated = await updateSurvey(editingSurvey.id, editingSurvey);
        setSurveys(prev => prev.map(s => s.id === updated.id ? updated : s));
      } else {
        const created = await createSurvey(editingSurvey);
        setSurveys(prev => [created, ...prev]);
      }
      setIsEditorOpen(false);
      setEditingSurvey(null);
      await alert('Pesquisa salva com sucesso! O link público já está disponível.');
    } catch (err: any) {
      await alert('Erro ao salvar pesquisa: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Survey
  const handleDelete = async (survey: Survey) => {
    const ok = await confirm(`Deseja realmente excluir a pesquisa "${survey.title}"? Todas as respostas associadas serão apagadas.`);
    if (!ok) return;

    try {
      await deleteSurvey(survey.id);
      setSurveys(prev => prev.filter(s => s.id !== survey.id));
      await alert('Pesquisa excluída com sucesso.');
    } catch (err: any) {
      await alert('Erro ao excluir pesquisa: ' + err.message);
    }
  };

  // Open Responses & Analytics Report
  const handleViewResponses = async (survey: Survey) => {
    setSelectedSurveyForResponses(survey);
    setIsResponsesOpen(true);
    setActiveReportTab('analytics');
    setResponseSearchQuery('');
    try {
      setLoadingResponses(true);
      const data = await fetchSurveyResponses(survey.id);
      setResponses(data);
    } catch (err: any) {
      console.error('Erro ao buscar respostas:', err);
    } finally {
      setLoadingResponses(false);
    }
  };

  // Export CSV / Excel with UTF-8 BOM
  const handleExportCSV = () => {
    if (!selectedSurveyForResponses || responses.length === 0) {
      alert('Não há respostas para exportar.');
      return;
    }

    const headers = [
      'ID Resposta',
      'Data e Hora',
      'Nome do Lead',
      'WhatsApp',
      'E-mail',
      'Score NPS',
      ...(selectedSurveyForResponses.questions || []).map(q => `"${q.title.replace(/"/g, '""')}"`)
    ];

    const rows = responses.map(r => {
      const qAnswers = (selectedSurveyForResponses.questions || []).map(q => {
        const val = r.answers?.[q.id] ?? r.answers?.[q.title] ?? '';
        let formatted = '';
        if (typeof val === 'object' && val !== null) {
          if (val.name || val.phone || val.email) {
            formatted = `${val.name || ''} ${val.phone ? ' - ' + val.phone : ''} ${val.email ? ' (' + val.email + ')' : ''}`;
          } else {
            formatted = JSON.stringify(val);
          }
        } else {
          formatted = String(val);
        }
        return `"${formatted.replace(/"/g, '""')}"`;
      });

      return [
        `"${r.id}"`,
        `"${new Date(r.createdAt).toLocaleString('pt-BR')}"`,
        `"${(r.leadName || '').replace(/"/g, '""')}"`,
        `"${(r.leadPhone || '').replace(/"/g, '""')}"`,
        `"${(r.leadEmail || '').replace(/"/g, '""')}"`,
        r.npsScore !== undefined ? r.npsScore : '',
        ...qAnswers
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_pesquisa_${selectedSurveyForResponses.slug}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print Report
  const handlePrintReport = () => {
    window.print();
  };

  // Question helpers
  const handleAddQuestion = (type: SurveyQuestion['type']) => {
    if (!editingSurvey) return;
    const newQ: SurveyQuestion = {
      id: `q_${Date.now()}`,
      title: type === 'nps' ? 'Em uma escala de 0 a 10, qual a probabilidade de você nos indicar?' : 'Nova Pergunta',
      type,
      required: true,
      ...(type === 'single_choice' || type === 'multiple_choice' ? {
        options: [
          { id: `opt_${Date.now()}_1`, label: 'Opção 1' },
          { id: `opt_${Date.now()}_2`, label: 'Opção 2' }
        ]
      } : {}),
      ...(type === 'nps' ? { minScale: 0, maxScale: 10 } : {}),
      ...(type === 'rating_stars' ? { minScale: 1, maxScale: 5 } : {})
    };

    setEditingSurvey({
      ...editingSurvey,
      questions: [...(editingSurvey.questions || []), newQ]
    });
  };

  const handleRemoveQuestion = (qId: string) => {
    if (!editingSurvey) return;
    setEditingSurvey({
      ...editingSurvey,
      questions: (editingSurvey.questions || []).filter(q => q.id !== qId)
    });
  };

  const handleUpdateQuestion = (qId: string, patch: Partial<SurveyQuestion>) => {
    if (!editingSurvey) return;
    setEditingSurvey({
      ...editingSurvey,
      questions: (editingSurvey.questions || []).map(q => q.id === qId ? { ...q, ...patch } : q)
    });
  };

  const handleAddOption = (qId: string) => {
    if (!editingSurvey) return;
    setEditingSurvey({
      ...editingSurvey,
      questions: (editingSurvey.questions || []).map(q => {
        if (q.id !== qId) return q;
        const opts = q.options || [];
        return {
          ...q,
          options: [...opts, { id: `opt_${Date.now()}`, label: `Nova Opção ${opts.length + 1}` }]
        };
      })
    });
  };

  const handleRemoveOption = (qId: string, optId: string) => {
    if (!editingSurvey) return;
    setEditingSurvey({
      ...editingSurvey,
      questions: (editingSurvey.questions || []).map(q => {
        if (q.id !== qId) return q;
        return {
          ...q,
          options: (q.options || []).filter(o => o.id !== optId)
        };
      })
    });
  };

  // Reorder Questions: Move Up / Down
  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (!editingSurvey || !editingSurvey.questions) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= editingSurvey.questions.length) return;

    const newQuestions = [...editingSurvey.questions];
    const [moved] = newQuestions.splice(index, 1);
    newQuestions.splice(newIndex, 0, moved);

    setEditingSurvey({
      ...editingSurvey,
      questions: newQuestions
    });
  };

  // Drag and Drop Questions
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedQuestionIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedQuestionIndex === null || draggedQuestionIndex === targetIndex) {
      setDraggedQuestionIndex(null);
      return;
    }
    if (!editingSurvey || !editingSurvey.questions) return;

    const newQuestions = [...editingSurvey.questions];
    const [moved] = newQuestions.splice(draggedQuestionIndex, 1);
    newQuestions.splice(targetIndex, 0, moved);

    setEditingSurvey({
      ...editingSurvey,
      questions: newQuestions
    });
    setDraggedQuestionIndex(null);
  };

  // Reorder Options within Question
  const handleMoveOption = (qId: string, optIndex: number, direction: 'up' | 'down') => {
    if (!editingSurvey || !editingSurvey.questions) return;
    const targetQ = editingSurvey.questions.find(q => q.id === qId);
    if (!targetQ || !targetQ.options) return;

    const newIndex = direction === 'up' ? optIndex - 1 : optIndex + 1;
    if (newIndex < 0 || newIndex >= targetQ.options.length) return;

    const newOpts = [...targetQ.options];
    const [moved] = newOpts.splice(optIndex, 1);
    newOpts.splice(newIndex, 0, moved);

    handleUpdateQuestion(qId, { options: newOpts });
  };

  // Filtered surveys
  const filteredSurveys = surveys.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalResponses = surveys.reduce((acc, s) => acc + (s.responsesCount || 0), 0);
  const avgNpsTotal = surveys.length > 0 
    ? (surveys.reduce((acc, s) => acc + (s.averageNps || 0), 0) / surveys.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-purple-200 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Pesquisas, NPS & Qualificação de Leads</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Pesquisas & Formulários Interativos
            </h1>
            <p className="text-purple-100 text-sm max-w-2xl leading-relaxed">
              Crie formulários inteligentes e pesquisas de NPS para qualificar clientes potenciais, coletar feedbacks e conectar diretamente às suas páginas de obrigado.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCreateBlank}
              className="bg-white text-purple-700 hover:bg-purple-50 font-bold px-5 py-3 rounded-2xl transition text-sm flex items-center gap-2 shadow-lg shadow-black/15"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Nova Pesquisa</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-xs text-purple-200 font-medium">Pesquisas Ativas</div>
            <div className="text-2xl font-black text-white mt-1">{surveys.length}</div>
            <div className="text-[11px] text-purple-200 mt-0.5">Disponíveis publicamente</div>
          </div>
          <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-xs text-purple-200 font-medium">Respostas Coletadas</div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{totalResponses}</div>
            <div className="text-[11px] text-purple-200 mt-0.5">Leads qualificados</div>
          </div>
          <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-xs text-purple-200 font-medium">Média NPS / Avaliação</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{avgNpsTotal}</div>
            <div className="text-[11px] text-purple-200 mt-0.5">Escala de 0 a 10</div>
          </div>
          <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-xs text-purple-200 font-medium">Integração CRM</div>
            <div className="text-2xl font-black text-white mt-1">100%</div>
            <div className="text-[11px] text-purple-200 mt-0.5">Criação automática de leads</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar pesquisa por título..."
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={loadSurveys}
          className="text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition text-sm flex items-center gap-1.5"
          title="Recarregar pesquisas"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Atualizar</span>
        </button>
      </div>

      {/* Surveys List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-600" />
          <span>Carregando pesquisas...</span>
        </div>
      ) : filteredSurveys.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Nenhuma pesquisa encontrada</h3>
          <p className="text-slate-500 text-sm mb-6">
            Crie sua primeira pesquisa para qualificar leads que acessam suas landing pages ou campanhas de tráfego.
          </p>
          <button
            onClick={handleCreateBlank}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2.5 rounded-xl transition text-sm inline-flex items-center gap-2 shadow-md shadow-purple-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeira Pesquisa</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSurveys.map(s => {
            const publicUrl = `${window.location.origin}/pesquisa/${s.slug}`;
            return (
              <div 
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        s.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {s.status === 'published' ? 'Publicada' : 'Rascunho'}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {(s.questions || []).length} perguntas
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>NPS {s.averageNps || '0.0'}</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-purple-600 transition line-clamp-1">
                      {s.title}
                    </h3>
                    {s.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {s.description}
                      </p>
                    )}
                  </div>

                  {/* Public Link Box */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs font-mono text-slate-600 truncate">
                      /pesquisa/{s.slug}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopyLink(s.slug, s.id)}
                        className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-slate-800 transition"
                        title="Copiar Link"
                      >
                        {copiedId === s.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={`/pesquisa/${s.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-purple-600 transition"
                        title="Abrir no Navegador"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleViewResponses(s)}
                    className="text-xs font-bold text-purple-700 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 border border-purple-200/80 shadow-xs"
                    title="Ver Relatório de Resultados e Gráficos"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
                    <span>{s.responsesCount || 0} Respostas • Ver Relatório & Gráficos</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(s)}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Editar Pesquisa"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(s)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SURVEY EDITOR MODAL */}
      {isEditorOpen && editingSurvey && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    {editingSurvey.id ? 'Editar Pesquisa' : 'Nova Pesquisa de Qualificação'}
                  </h2>
                  <p className="text-xs text-slate-500">Configure as perguntas, pontuação NPS e tela de obrigado.</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditorOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* General Info */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Informações Principais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Título da Pesquisa *</label>
                    <input
                      type="text"
                      value={editingSurvey.title || ''}
                      onChange={e => setEditingSurvey({ ...editingSurvey, title: e.target.value })}
                      placeholder="Ex: Diagnóstico de Maturidade Comercial"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Slug (URL amigável) *</label>
                    <div className="flex items-center">
                      <span className="text-xs text-slate-400 px-3 py-2 bg-slate-200/60 border border-r-0 border-slate-300 rounded-l-xl">/pesquisa/</span>
                      <input
                        type="text"
                        value={editingSurvey.slug || ''}
                        onChange={e => setEditingSurvey({ ...editingSurvey, slug: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-') })}
                        placeholder="qualificacao-comercial"
                        className="w-full px-3 py-2 border border-slate-300 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Descrição / Instruções</label>
                  <input
                    type="text"
                    value={editingSurvey.description || ''}
                    onChange={e => setEditingSurvey({ ...editingSurvey, description: e.target.value })}
                    placeholder="Instruções breves sobre o objetivo da pesquisa..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Questions Builder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Perguntas da Pesquisa</h3>
                    <p className="text-xs text-slate-500">Adicione perguntas objetivas, NPS ou captura de dados de contato.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('single_choice')}
                      className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Escolha Única
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('multiple_choice')}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Múltipla Escolha
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('nps')}
                      className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Escala NPS (0-10)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddQuestion('contact_info')}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Contato (Lead)
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {(editingSurvey.questions || []).map((q, idx) => (
                    <div 
                      key={q.id} 
                      draggable
                      onDragStart={e => handleDragStart(e, idx)}
                      onDragOver={e => handleDragOver(e, idx)}
                      onDrop={e => handleDrop(e, idx)}
                      className={`p-4 bg-white rounded-2xl border transition-all duration-200 shadow-xs space-y-3 ${
                        draggedQuestionIndex === idx 
                          ? 'border-purple-500 ring-2 ring-purple-300 bg-purple-50/40 opacity-70' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          {/* Drag Handle */}
                          <div 
                            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-purple-600 p-0.5 rounded transition"
                            title="Clique e arraste para reordenar"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-200/60">
                            {q.type === 'single_choice' && 'Escolha Única'}
                            {q.type === 'multiple_choice' && 'Múltipla Escolha'}
                            {q.type === 'nps' && 'Escala NPS 0 a 10'}
                            {q.type === 'rating_stars' && 'Classificação 1 a 5 Estrelas'}
                            {q.type === 'text' && 'Texto Livre'}
                            {q.type === 'contact_info' && 'Captura de Dados de Contato'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Reorder Buttons (Up / Down) */}
                          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveQuestion(idx, 'up')}
                              className="p-1 text-slate-500 hover:text-purple-700 hover:bg-white rounded transition disabled:opacity-25 disabled:cursor-not-allowed"
                              title="Mover pergunta para cima"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === (editingSurvey.questions?.length || 1) - 1}
                              onClick={() => handleMoveQuestion(idx, 'down')}
                              className="p-1 text-slate-500 hover:text-purple-700 hover:bg-white rounded transition disabled:opacity-25 disabled:cursor-not-allowed"
                              title="Mover pergunta para baixo"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={e => handleUpdateQuestion(q.id, { required: e.target.checked })}
                              className="rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>Obrigatória</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Remover Pergunta"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={q.title}
                          onChange={e => handleUpdateQuestion(q.id, { title: e.target.value })}
                          placeholder="Texto da pergunta..."
                          className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {/* Options Builder for Single/Multiple Choice */}
                      {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                        <div className="pl-6 space-y-2 border-l-2 border-slate-200">
                          <div className="text-xs font-bold text-slate-500">Opções de Resposta:</div>
                          {(q.options || []).map((opt, oIdx) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 w-4">{oIdx + 1}.</span>
                              <input
                                type="text"
                                value={opt.label}
                                onChange={e => {
                                  const newOpts = [...(q.options || [])];
                                  newOpts[oIdx] = { ...opt, label: e.target.value };
                                  handleUpdateQuestion(q.id, { options: newOpts });
                                }}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-purple-400"
                              />

                              {/* Option Move Up / Down */}
                              <div className="flex items-center bg-slate-100 rounded-md p-0.5 border border-slate-200 shrink-0">
                                <button
                                  type="button"
                                  disabled={oIdx === 0}
                                  onClick={() => handleMoveOption(q.id, oIdx, 'up')}
                                  className="p-1 text-slate-500 hover:text-purple-700 hover:bg-white rounded transition disabled:opacity-25"
                                  title="Mover opção para cima"
                                >
                                  <ChevronUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  disabled={oIdx === (q.options?.length || 1) - 1}
                                  onClick={() => handleMoveOption(q.id, oIdx, 'down')}
                                  className="p-1 text-slate-500 hover:text-purple-700 hover:bg-white rounded transition disabled:opacity-25"
                                  title="Mover opção para baixo"
                                >
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveOption(q.id, opt.id)}
                                className="text-slate-400 hover:text-red-500 p-1"
                                title="Remover Opção"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => handleAddOption(q.id)}
                            className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 mt-1"
                          >
                            <Plus className="w-3 h-3" /> Adicionar Opção
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Thank You Customization */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Tela de Obrigado Pós-Pesquisa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Título de Sucesso</label>
                    <input
                      type="text"
                      value={editingSurvey.thankYou?.title || ''}
                      onChange={e => setEditingSurvey({
                        ...editingSurvey,
                        thankYou: { ...editingSurvey.thankYou, title: e.target.value }
                      })}
                      placeholder="🎉 Respostas Recebidas com Sucesso!"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Link do Grupo de WhatsApp VIP</label>
                    <input
                      type="url"
                      value={editingSurvey.thankYou?.whatsappGroupUrl || ''}
                      onChange={e => setEditingSurvey({
                        ...editingSurvey,
                        thankYou: { ...editingSurvey.thankYou, whatsappGroupUrl: e.target.value }
                      })}
                      placeholder="https://chat.whatsapp.com/..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Mensagem de Agradecimento</label>
                  <input
                    type="text"
                    value={editingSurvey.thankYou?.subtitle || ''}
                    onChange={e => setEditingSurvey({
                      ...editingSurvey,
                      thankYou: { ...editingSurvey.thankYou, subtitle: e.target.value }
                    })}
                    placeholder="Nossa equipe analisará suas respostas e enviará o feedback."
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm"
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-200 flex items-center justify-between bg-slate-50/50 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold text-sm hover:bg-slate-100 transition"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveSurvey}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Salvar Pesquisa</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FULL EXECUTIVE REPORT & ANALYTICS MODAL WITH CHARTS      */}
      {/* ========================================================= */}
      {isResponsesOpen && selectedSurveyForResponses && (() => {
        const CHART_COLORS = ['#7c3aed', '#2563eb', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1', '#14b8a6', '#f97316', '#84cc16'];

        // Executive Summary Metrics
        const total = responses.length;
        let promoters = 0;
        let passives = 0;
        let detractors = 0;
        let npsScoreSum = 0;
        let npsCount = 0;
        let leadsWithContact = 0;

        responses.forEach(r => {
          if (r.leadPhone || r.leadEmail || (r.leadName && r.leadName !== 'Lead Anônimo')) {
            leadsWithContact++;
          }

          let score = r.npsScore;
          if (score === undefined || score === null) {
            const npsQ = (selectedSurveyForResponses.questions || []).find(q => q.type === 'nps' || q.type === 'rating_stars');
            if (npsQ && r.answers?.[npsQ.id] !== undefined) {
              const val = Number(r.answers[npsQ.id]);
              if (!isNaN(val)) score = val;
            }
          }

          if (score !== undefined && score !== null && !isNaN(Number(score))) {
            const num = Number(score);
            npsCount++;
            npsScoreSum += num;
            if (num >= 9) promoters++;
            else if (num >= 7) passives++;
            else detractors++;
          }
        });

        const avgNps = npsCount > 0 ? (npsScoreSum / npsCount).toFixed(1) : (selectedSurveyForResponses.averageNps || '0.0');
        const pctPromoters = npsCount > 0 ? Math.round((promoters / npsCount) * 100) : 0;
        const pctPassives = npsCount > 0 ? Math.round((passives / npsCount) * 100) : 0;
        const pctDetractors = npsCount > 0 ? Math.round((detractors / npsCount) * 100) : 0;
        const npsIndex = pctPromoters - pctDetractors;

        let npsZone = 'Zona de Aperfeiçoamento';
        let npsZoneColor = 'text-amber-700 bg-amber-50 border-amber-200';
        if (npsIndex >= 75) {
          npsZone = 'Zona de Excelência ⭐';
          npsZoneColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
        } else if (npsIndex >= 50) {
          npsZone = 'Zona de Qualidade 🚀';
          npsZoneColor = 'text-blue-700 bg-blue-50 border-blue-200';
        } else if (npsIndex >= 0) {
          npsZone = 'Zona de Aperfeiçoamento 📈';
          npsZoneColor = 'text-amber-700 bg-amber-50 border-amber-200';
        } else {
          npsZone = 'Zona Crítica ⚠️';
          npsZoneColor = 'text-red-700 bg-red-50 border-red-200';
        }

        // Filter individual responses
        const filteredResponses = responses.filter(r => {
          if (!responseSearchQuery.trim()) return true;
          const q = responseSearchQuery.toLowerCase();
          return (
            (r.leadName || '').toLowerCase().includes(q) ||
            (r.leadPhone || '').includes(q) ||
            (r.leadEmail || '').toLowerCase().includes(q) ||
            Object.values(r.answers || {}).some(val => 
              String(typeof val === 'object' ? JSON.stringify(val) : val).toLowerCase().includes(q)
            )
          );
        });

        return (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
              
              {/* Modal Top Header */}
              <div className="p-5 md:p-6 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tight">
                        Relatório Executivo & Gráficos
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                        {selectedSurveyForResponses.status === 'published' ? 'Publicada' : 'Rascunho'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <strong className="text-slate-800">{selectedSurveyForResponses.title}</strong> • /pesquisa/{selectedSurveyForResponses.slug}
                    </p>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={handleExportCSV}
                    disabled={responses.length === 0}
                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition shadow-2xs disabled:opacity-50"
                    title="Exportar planilha CSV compatível com Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span className="hidden sm:inline">Exportar CSV</span>
                  </button>

                  <button
                    onClick={handlePrintReport}
                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition shadow-2xs"
                    title="Imprimir ou Salvar Relatório em PDF"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span className="hidden sm:inline">Imprimir / PDF</span>
                  </button>

                  <button
                    onClick={() => handleViewResponses(selectedSurveyForResponses)}
                    disabled={loadingResponses}
                    className="p-2 hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-600 transition"
                    title="Atualizar dados"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingResponses ? 'animate-spin text-purple-600' : ''}`} />
                  </button>

                  <button
                    onClick={() => setIsResponsesOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
                    title="Fechar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="px-6 pt-3 pb-2 border-b border-slate-200 bg-white flex items-center gap-2 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveReportTab('analytics')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeReportTab === 'analytics'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Relatório & Gráficos de Todas as Perguntas</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    activeReportTab === 'analytics' ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {(selectedSurveyForResponses.questions || []).length} perguntas
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveReportTab('individual')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                    activeReportTab === 'individual'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Respostas Individuais dos Leads</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    activeReportTab === 'individual' ? 'bg-purple-700 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {responses.length}
                  </span>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 md:p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
                {loadingResponses ? (
                  <div className="py-20 text-center text-slate-400">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-purple-600" />
                    <span className="font-semibold text-sm">Carregando métricas e dados analíticos...</span>
                  </div>
                ) : responses.length === 0 ? (
                  <div className="py-16 text-center max-w-md mx-auto">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <ClipboardList className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">
                      Nenhuma resposta registrada ainda
                    </h3>
                    <p className="text-xs text-slate-500 mb-6">
                      Compartilhe o link público da pesquisa ou responda uma simulação para gerar os gráficos e relatórios estatísticos.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <a
                        href={`/pesquisa/${selectedSurveyForResponses.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Pesquisa para Responder</span>
                      </a>
                      <button
                        onClick={() => handleCopyLink(selectedSurveyForResponses.slug, selectedSurveyForResponses.id)}
                        className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Link</span>
                      </button>
                    </div>
                  </div>
                ) : activeReportTab === 'analytics' ? (
                  <div className="space-y-6">
                    {/* Executive KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Card 1: Total Respostas */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
                          <span>Total Respostas</span>
                          <Users className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                          {total}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>100% integradas no CRM</span>
                        </div>
                      </div>

                      {/* Card 2: Net Promoter Score */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
                          <span>Score NPS</span>
                          <Award className="w-4 h-4 text-amber-500" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-baseline gap-1.5">
                          <span>{npsIndex >= 0 ? `+${npsIndex}` : npsIndex}</span>
                          <span className="text-xs text-slate-400 font-normal">pts</span>
                        </div>
                        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block border ${npsZoneColor}`}>
                          {npsZone}
                        </div>
                      </div>

                      {/* Card 3: Média de Avaliação */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
                          <span>Média Avaliação</span>
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight flex items-baseline gap-1">
                          <span>{avgNps}</span>
                          <span className="text-xs text-slate-400 font-normal">/ 10</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {promoters} promotores • {detractors} detratores
                        </div>
                      </div>

                      {/* Card 4: Leads com Contato */}
                      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold uppercase tracking-wider">
                          <span>Contatos Identificados</span>
                          <MessageCircle className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                          {leadsWithContact}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {total > 0 ? `${Math.round((leadsWithContact / total) * 100)}% com WhatsApp/Email` : '0%'}
                        </div>
                      </div>
                    </div>

                    {/* Section Title */}
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                          <Layers className="w-4 h-4 text-purple-600" />
                          <span>Resultados Detalhados Pergunta a Pergunta</span>
                        </h3>
                        <p className="text-xs text-slate-500">
                          Gráficos comparativos, frequências de resposta e análise estatística completa.
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                        Total de {(selectedSurveyForResponses.questions || []).length} perguntas
                      </span>
                    </div>

                    {/* Questions Loop with Visual Charts */}
                    <div className="space-y-6">
                      {(selectedSurveyForResponses.questions || []).map((q, qIdx) => {
                        // Extract answers for this question
                        const qAnswers = responses.map(r => {
                          const val = r.answers?.[q.id] ?? r.answers?.[q.title];
                          return {
                            val,
                            leadName: r.leadName || 'Lead Anônimo',
                            leadPhone: r.leadPhone,
                            leadEmail: r.leadEmail,
                            createdAt: r.createdAt
                          };
                        }).filter(item => item.val !== undefined && item.val !== null && item.val !== '');

                        const answeredCount = qAnswers.length;
                        const answerRate = total > 0 ? Math.round((answeredCount / total) * 100) : 0;
                        const currentChartType = chartTypeMap[q.id] || 'bar';

                        return (
                          <div 
                            key={q.id || qIdx}
                            className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 md:p-6 space-y-4 hover:border-purple-300 transition"
                          >
                            {/* Question Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
                                    Pergunta #{qIdx + 1}
                                  </span>
                                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                                    {q.type === 'single_choice' ? 'Escolha Única' :
                                     q.type === 'multiple_choice' ? 'Múltipla Escolha' :
                                     q.type === 'nps' ? 'NPS (Escala 0-10)' :
                                     q.type === 'rating_stars' ? 'Avaliação por Estrelas' :
                                     q.type === 'contact_info' ? 'Dados de Contato' : 'Texto Aberto'}
                                  </span>
                                </div>
                                <h4 className="text-base font-bold text-slate-900 leading-snug">
                                  {q.title}
                                </h4>
                                {q.description && (
                                  <p className="text-xs text-slate-500">{q.description}</p>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                                  <div className="bg-slate-100 p-0.5 rounded-lg flex items-center gap-0.5 border border-slate-200">
                                    <button
                                      type="button"
                                      onClick={() => setChartTypeMap(prev => ({ ...prev, [q.id]: 'bar' }))}
                                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                                        currentChartType === 'bar' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                                      }`}
                                      title="Gráfico de Barras"
                                    >
                                      <BarChart3 className="w-3 h-3" />
                                      <span>Barras</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setChartTypeMap(prev => ({ ...prev, [q.id]: 'pie' }))}
                                      className={`px-2 py-1 rounded-md text-[11px] font-bold transition flex items-center gap-1 ${
                                        currentChartType === 'pie' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                                      }`}
                                      title="Gráfico de Pizza"
                                    >
                                      <PieChartIcon className="w-3 h-3" />
                                      <span>Pizza</span>
                                    </button>
                                  </div>
                                )}

                                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                                  {answeredCount} respostas ({answerRate}%)
                                </span>
                              </div>
                            </div>

                            {/* Question Body: CHOICE QUESTIONS (Bar / Pie Chart) */}
                            {(q.type === 'single_choice' || q.type === 'multiple_choice') && (() => {
                              const counts: Record<string, number> = {};
                              (q.options || []).forEach(opt => {
                                counts[opt.label] = 0;
                              });

                              qAnswers.forEach(ans => {
                                const items = Array.isArray(ans.val) ? ans.val : [ans.val];
                                items.forEach(it => {
                                  const str = String(it).trim();
                                  const matched = (q.options || []).find(o => 
                                    o.label.trim().toLowerCase() === str.toLowerCase() || o.id === str
                                  );
                                  const label = matched ? matched.label : str;
                                  counts[label] = (counts[label] || 0) + 1;
                                });
                              });

                              const chartData = Object.entries(counts).map(([name, count]) => {
                                const pct = answeredCount > 0 ? Number(((count / answeredCount) * 100).toFixed(1)) : 0;
                                return {
                                  name,
                                  shortName: name.length > 25 ? name.slice(0, 25) + '...' : name,
                                  count,
                                  percentage: pct
                                };
                              });

                              if (answeredCount === 0) {
                                return (
                                  <div className="py-6 text-center text-xs text-slate-400">
                                    Nenhuma resposta registrada para esta pergunta.
                                  </div>
                                );
                              }

                              return (
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                  {/* Left: Interactive Chart */}
                                  <div className="lg:col-span-7 h-56 w-full">
                                    {currentChartType === 'pie' ? (
                                      <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                          <Pie
                                            data={chartData}
                                            dataKey="count"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={75}
                                            innerRadius={35}
                                            paddingAngle={3}
                                          >
                                            {chartData.map((_, index) => (
                                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                          </Pie>
                                          <Tooltip
                                            formatter={(value: any, name: any, entry: any) => [
                                              `${value} votos (${entry.payload.percentage}%)`,
                                              name
                                            ]}
                                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                          />
                                        </PieChart>
                                      </ResponsiveContainer>
                                    ) : (
                                      <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                          <XAxis 
                                            dataKey="shortName" 
                                            stroke="#64748b" 
                                            fontSize={10} 
                                            tickLine={false} 
                                            angle={-15}
                                            textAnchor="end"
                                          />
                                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                                          <Tooltip
                                            formatter={(value: any, _name: any, entry: any) => [
                                              `${value} votos (${entry.payload.percentage}%)`,
                                              'Votos'
                                            ]}
                                            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                          />
                                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                            {chartData.map((_, index) => (
                                              <Cell key={`bar-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                            ))}
                                          </Bar>
                                        </BarChart>
                                      </ResponsiveContainer>
                                    )}
                                  </div>

                                  {/* Right: Distribution List with Progress Meters */}
                                  <div className="lg:col-span-5 space-y-2.5">
                                    {chartData.map((item, idx) => {
                                      const barColor = CHART_COLORS[idx % CHART_COLORS.length];
                                      return (
                                        <div key={item.name} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                                          <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-800 line-clamp-1" title={item.name}>
                                              {item.name}
                                            </span>
                                            <span className="font-extrabold text-slate-900 shrink-0 ml-2">
                                              {item.count} <span className="text-[10px] text-slate-500 font-normal">({item.percentage}%)</span>
                                            </span>
                                          </div>
                                          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
                                            <div 
                                              className="h-full rounded-full transition-all duration-500"
                                              style={{ width: `${Math.max(item.percentage, item.count > 0 ? 4 : 0)}%`, backgroundColor: barColor }}
                                            />
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Question Body: NPS (0 to 10) */}
                            {q.type === 'nps' && (() => {
                              const scoreMap = Array.from({ length: 11 }, (_, i) => ({
                                score: String(i),
                                count: 0,
                                percentage: 0
                              }));

                              let pCount = 0;
                              let nCount = 0;
                              let dCount = 0;
                              let sum = 0;
                              let validCount = 0;

                              qAnswers.forEach(ans => {
                                const num = Number(ans.val);
                                if (!isNaN(num) && num >= 0 && num <= 10) {
                                  scoreMap[num].count++;
                                  sum += num;
                                  validCount++;
                                  if (num >= 9) pCount++;
                                  else if (num >= 7) nCount++;
                                  else dCount++;
                                }
                              });

                              scoreMap.forEach(item => {
                                item.percentage = validCount > 0 ? Math.round((item.count / validCount) * 100) : 0;
                              });

                              const avg = validCount > 0 ? (sum / validCount).toFixed(1) : '0.0';
                              const pctP = validCount > 0 ? Math.round((pCount / validCount) * 100) : 0;
                              const pctN = validCount > 0 ? Math.round((nCount / validCount) * 100) : 0;
                              const pctD = validCount > 0 ? Math.round((dCount / validCount) * 100) : 0;
                              const npsScore = pctP - pctD;

                              return (
                                <div className="space-y-4">
                                  {/* 3 Classification Cards */}
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                      <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                                        <span className="flex items-center gap-1">
                                          <ThumbsUp className="w-3.5 h-3.5" />
                                          Promotores (9-10)
                                        </span>
                                        <span className="text-sm font-black">{pCount}</span>
                                      </div>
                                      <div className="text-[11px] text-emerald-600 mt-1 font-semibold">{pctP}% do total</div>
                                    </div>

                                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                      <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                                        <span className="flex items-center gap-1">
                                          <Meh className="w-3.5 h-3.5" />
                                          Neutros (7-8)
                                        </span>
                                        <span className="text-sm font-black">{nCount}</span>
                                      </div>
                                      <div className="text-[11px] text-amber-600 mt-1 font-semibold">{pctN}% do total</div>
                                    </div>

                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                                      <div className="flex items-center justify-between text-xs font-bold text-red-800">
                                        <span className="flex items-center gap-1">
                                          <ThumbsDown className="w-3.5 h-3.5" />
                                          Detratores (0-6)
                                        </span>
                                        <span className="text-sm font-black">{dCount}</span>
                                      </div>
                                      <div className="text-[11px] text-red-600 mt-1 font-semibold">{pctD}% do total</div>
                                    </div>
                                  </div>

                                  {/* Distribution Chart 0 to 10 */}
                                  <div className="h-44 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                      <BarChart data={scoreMap} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                        <XAxis dataKey="score" stroke="#64748b" fontSize={11} tickLine={false} />
                                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                                        <Tooltip
                                          formatter={(value: any, _name: any, entry: any) => [
                                            `${value} votos (${entry.payload.percentage}%)`,
                                            `Nota ${entry.payload.score}`
                                          ]}
                                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', fontSize: '11px' }}
                                        />
                                        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                          {scoreMap.map(entry => {
                                            const s = Number(entry.score);
                                            const color = s >= 9 ? '#10b981' : s >= 7 ? '#f59e0b' : '#ef4444';
                                            return <Cell key={`nps-${s}`} fill={color} />;
                                          })}
                                        </Bar>
                                      </BarChart>
                                    </ResponsiveContainer>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Question Body: RATING STARS (1 to 5) */}
                            {q.type === 'rating_stars' && (() => {
                              const starMap = [1, 2, 3, 4, 5].map(s => ({
                                stars: `${s} ★`,
                                starNum: s,
                                count: 0,
                                percentage: 0
                              }));

                              let starSum = 0;
                              let validStars = 0;

                              qAnswers.forEach(ans => {
                                const num = Number(ans.val);
                                if (!isNaN(num) && num >= 1 && num <= 5) {
                                  starMap[num - 1].count++;
                                  starSum += num;
                                  validStars++;
                                }
                              });

                              starMap.forEach(item => {
                                item.percentage = validStars > 0 ? Math.round((item.count / validStars) * 100) : 0;
                              });

                              const avgStars = validStars > 0 ? (starSum / validStars).toFixed(1) : '0.0';

                              return (
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                                  <div className="md:col-span-4 p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-center space-y-1">
                                    <div className="text-3xl sm:text-4xl font-black text-amber-500">
                                      {avgStars}
                                    </div>
                                    <div className="flex items-center justify-center gap-1 text-amber-400">
                                      {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} className="w-4 h-4 fill-amber-400" />
                                      ))}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium pt-1">
                                      Média baseada em {validStars} avaliações
                                    </div>
                                  </div>

                                  <div className="md:col-span-8 space-y-2">
                                    {[...starMap].reverse().map(item => (
                                      <div key={item.stars} className="flex items-center gap-3 text-xs">
                                        <span className="w-10 font-bold text-slate-700 shrink-0">{item.stars}</span>
                                        <div className="flex-1 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                                          <div
                                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                            style={{ width: `${item.percentage}%` }}
                                          />
                                        </div>
                                        <span className="w-14 text-right text-slate-600 font-mono text-[11px] shrink-0">
                                          {item.count} ({item.percentage}%)
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Question Body: TEXT COMMENTS */}
                            {q.type === 'text' && (
                              <div className="space-y-3">
                                {qAnswers.length === 0 ? (
                                  <div className="py-4 text-center text-xs text-slate-400">
                                    Nenhum comentário por escrito recebido ainda.
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                                    {qAnswers.map((item, idx) => (
                                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                                        <p className="text-xs text-slate-800 italic leading-relaxed">
                                          "{String(item.val)}"
                                        </p>
                                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-200/60">
                                          <span className="font-semibold text-slate-600">{item.leadName}</span>
                                          <span>{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Question Body: CONTACT INFO */}
                            {q.type === 'contact_info' && (
                              <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                  <thead>
                                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                                      <th className="py-2 px-3">Nome do Lead</th>
                                      <th className="py-2 px-3">WhatsApp</th>
                                      <th className="py-2 px-3">E-mail</th>
                                      <th className="py-2 px-3">Data</th>
                                      <th className="py-2 px-3 text-right">Ação</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {qAnswers.map((ans, idx) => {
                                      const cleanPhone = (ans.leadPhone || '').replace(/\D/g, '');
                                      return (
                                        <tr key={idx} className="hover:bg-slate-50 transition">
                                          <td className="py-2.5 px-3 font-bold text-slate-900">{ans.leadName}</td>
                                          <td className="py-2.5 px-3 font-mono text-emerald-700 font-semibold">{ans.leadPhone || '—'}</td>
                                          <td className="py-2.5 px-3 text-slate-500">{ans.leadEmail || '—'}</td>
                                          <td className="py-2.5 px-3 text-slate-400 text-[11px]">{new Date(ans.createdAt).toLocaleDateString('pt-BR')}</td>
                                          <td className="py-2.5 px-3 text-right">
                                            {cleanPhone && (
                                              <a
                                                href={`https://wa.me/55${cleanPhone}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition"
                                                title="Iniciar conversa no WhatsApp"
                                              >
                                                <MessageCircle className="w-3 h-3" />
                                                <span>WhatsApp</span>
                                              </a>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* TAB 2: INDIVIDUAL RESPONSES VIEW */
                  <div className="space-y-4">
                    {/* Search and Filters */}
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                        <input
                          type="text"
                          value={responseSearchQuery}
                          onChange={e => setResponseSearchQuery(e.target.value)}
                          placeholder="Filtrar por nome, telefone, e-mail ou respostas..."
                          className="w-full pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <span className="text-xs text-slate-500 font-semibold shrink-0">
                        Exibindo {filteredResponses.length} de {responses.length} respostas
                      </span>
                    </div>

                    {filteredResponses.length === 0 ? (
                      <div className="py-12 text-center text-slate-400 text-xs">
                        Nenhuma resposta encontrada para o termo pesquisado.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredResponses.map((r, i) => {
                          const cleanPhone = (r.leadPhone || '').replace(/\D/g, '');
                          return (
                            <div key={r.id || i} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-slate-900 text-sm">
                                    {r.leadName || 'Lead Anônimo'}
                                  </span>
                                  {r.leadPhone && (
                                    <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                                      {r.leadPhone}
                                    </span>
                                  )}
                                  {r.leadEmail && (
                                    <span className="text-xs text-slate-500">
                                      • {r.leadEmail}
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  {r.npsScore !== undefined && (
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                                      NPS: {r.npsScore}/10
                                    </span>
                                  )}
                                  {cleanPhone && (
                                    <a
                                      href={`https://wa.me/55${cleanPhone}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-2xs"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      <span>Conversar</span>
                                    </a>
                                  )}
                                </div>
                              </div>

                              {/* Formatted answers per question */}
                              <div className="space-y-2 text-xs">
                                {(selectedSurveyForResponses.questions || []).map((q, qIndex) => {
                                  const val = r.answers?.[q.id] ?? r.answers?.[q.title];
                                  if (val === undefined || val === null || val === '') return null;

                                  let formatted = '';
                                  if (typeof val === 'object') {
                                    if (val.name || val.phone || val.email) {
                                      formatted = `${val.name || ''} ${val.phone ? '• ' + val.phone : ''} ${val.email ? '• ' + val.email : ''}`;
                                    } else {
                                      formatted = JSON.stringify(val);
                                    }
                                  } else if (Array.isArray(val)) {
                                    formatted = val.join(', ');
                                  } else {
                                    formatted = String(val);
                                  }

                                  return (
                                    <div key={q.id || qIndex} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                                      <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                                        {q.title}
                                      </div>
                                      <div className="text-slate-900 font-semibold text-xs">
                                        {formatted}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="text-[11px] text-slate-400 pt-1 flex items-center justify-between">
                                <span>ID: <code className="font-mono text-[10px]">{r.id}</code></span>
                                <span>Respondido em: {new Date(r.createdAt).toLocaleString('pt-BR')}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 border-t border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-b-3xl">
                <span className="text-xs text-slate-500">
                  Relatório gerado em tempo real pelo MDTracker Growth Suite
                </span>
                <button
                  onClick={() => setIsResponsesOpen(false)}
                  className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Fechar Relatório
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};
