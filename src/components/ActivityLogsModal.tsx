import React, { useState, useEffect } from 'react';
import { 
  X, 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Link2, 
  MessageSquare, 
  Sliders, 
  Bot, 
  Share2, 
  KeyRound,
  FileText,
  Calendar
} from 'lucide-react';
import { SystemActivityLog, User as UserType } from '../types';
import { fetchActivityLogs } from '../services/api';

interface ActivityLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName?: string;
  currentUser?: UserType | null;
}

export const ActivityLogsModal: React.FC<ActivityLogsModalProps> = ({
  isOpen,
  onClose,
  companyId,
  companyName,
  currentUser
}) => {
  const [logs, setLogs] = useState<SystemActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [authorFilter, setAuthorFilter] = useState<'all' | 'affiliate_only' | 'client_only'>('all');

  const loadLogs = async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const data = await fetchActivityLogs(companyId, currentUser?.email);
      setLogs(data);
    } catch (err) {
      console.error('Erro ao buscar logs de auditoria:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && companyId) {
      loadLogs();
    }
  }, [isOpen, companyId]);

  if (!isOpen) return null;

  const filteredLogs = logs.filter(log => {
    // Author filter
    if (authorFilter === 'affiliate_only' && !log.isAffiliateSupport) return false;
    if (authorFilter === 'client_only' && log.isAffiliateSupport) return false;

    // Category filter
    if (categoryFilter !== 'all' && log.category !== categoryFilter) return false;

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = log.title?.toLowerCase().includes(q);
      const matchDetails = log.details?.toLowerCase().includes(q);
      const matchUser = log.userName?.toLowerCase().includes(q) || log.userEmail?.toLowerCase().includes(q);
      const matchAffiliate = log.affiliateName?.toLowerCase().includes(q);
      return matchTitle || matchDetails || matchUser || matchAffiliate;
    }

    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'support_access':
        return <KeyRound className="w-4 h-4 text-amber-600" />;
      case 'meta_capi':
        return <Share2 className="w-4 h-4 text-blue-600" />;
      case 'whatsapp':
        return <MessageSquare className="w-4 h-4 text-emerald-600" />;
      case 'link':
        return <Link2 className="w-4 h-4 text-indigo-600" />;
      case 'chatbot':
        return <Bot className="w-4 h-4 text-purple-600" />;
      case 'settings':
        return <Sliders className="w-4 h-4 text-slate-600" />;
      default:
        return <Activity className="w-4 h-4 text-blue-600" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'support_access':
        return 'Suporte Assistido';
      case 'meta_capi':
        return 'Meta Ads & CAPI';
      case 'whatsapp':
        return 'WhatsApp';
      case 'link':
        return 'Links & Rastreio';
      case 'chatbot':
        return 'Chatbot & IA';
      case 'settings':
        return 'Configurações';
      case 'lead':
        return 'Leads & CRM';
      default:
        return 'Geral';
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg">Log de Atividades & Auditoria</h3>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-400/30">
                  {logs.length} registros
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Histórico de ações no ambiente {companyName ? `da empresa "${companyName}"` : 'selecionado'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* SECURITY & TRANSPARENCY NOTICE */}
        <div className="bg-amber-50/80 border-b border-amber-200/70 px-5 py-2.5 flex items-center justify-between gap-3 text-xs text-amber-900 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Transparência Total:</strong> Todas as ações realizadas por representantes em modo de <em>Gestão Assistida</em> ou pela própria empresa são registradas com data, hora e autor.
            </span>
          </div>
          <button
            onClick={loadLogs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-950 bg-amber-200/50 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>

        {/* CONTROLS / FILTERS BAR */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por ação, título, representante ou detalhe..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Todas as Categorias</option>
              <option value="support_access">🛡️ Suporte Assistido</option>
              <option value="meta_capi">⚡ Meta CAPI</option>
              <option value="whatsapp">💬 WhatsApp</option>
              <option value="link">🔗 Links</option>
              <option value="lead">👥 Leads</option>
              <option value="chatbot">🤖 Chatbot</option>
              <option value="settings">⚙️ Configurações</option>
            </select>

            {/* Author filter */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 text-xs font-medium">
              <button
                onClick={() => setAuthorFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition ${authorFilter === 'all' ? 'bg-slate-900 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Todos
              </button>
              <button
                onClick={() => setAuthorFilter('affiliate_only')}
                className={`px-2.5 py-1 rounded-lg transition ${authorFilter === 'affiliate_only' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Representante
              </button>
              <button
                onClick={() => setAuthorFilter('client_only')}
                className={`px-2.5 py-1 rounded-lg transition ${authorFilter === 'client_only' ? 'bg-blue-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Cliente
              </button>
            </div>
          </div>
        </div>

        {/* LOGS TIMELINE LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading && logs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
              <p className="text-xs font-medium">Carregando histórico de auditoria...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
              <Activity className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">Nenhum registro encontrado</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Nenhuma atividade atende aos filtros selecionados. As atividades são gravadas automaticamente conforme a empresa ou o representante utiliza o sistema.
              </p>
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSupport = Boolean(log.isAffiliateSupport);
              return (
                <div
                  key={log.id}
                  className={`p-4 rounded-xl border transition hover:shadow-xs flex flex-col sm:flex-row items-start justify-between gap-3 ${
                    isSupport 
                      ? 'bg-amber-50/40 border-amber-200/70 hover:border-amber-300' 
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Category Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isSupport ? 'bg-amber-100 border border-amber-200' : 'bg-slate-100 border border-slate-200'
                    }`}>
                      {getCategoryIcon(log.category)}
                    </div>

                    {/* Content */}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {log.title}
                        </span>

                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {getCategoryLabel(log.category)}
                        </span>

                        {isSupport ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            <span>Suporte Assistido ({log.affiliateName || log.userName})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                            <User className="w-3 h-3 text-slate-500" />
                            <span>{log.userName} ({log.userRole || 'admin'})</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed break-words">
                        {log.details}
                      </p>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-1.5 text-[11px] font-mono bg-slate-100/70 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200/60 inline-block max-w-full truncate">
                          {JSON.stringify(log.metadata)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timestamp & IP */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto text-[11px] text-slate-400 shrink-0 gap-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="flex items-center gap-1 font-medium text-slate-500">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDate(log.createdAt)}
                    </span>
                    {log.ipAddress && (
                      <span className="text-[10px] text-slate-400">
                        IP: {log.ipAddress}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            Exibindo <strong>{filteredLogs.length}</strong> de <strong>{logs.length}</strong> atividades
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
