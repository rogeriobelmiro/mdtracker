import React, { useState } from 'react';
import { Lead, FunnelStage } from '../types';
import { Search, Filter, Download, MessageSquare, MapPin, Calendar, Clock, DollarSign, Edit3, Trash2, CheckCircle, AlertCircle, ExternalLink, Activity, List, LayoutGrid, Columns } from 'lucide-react';

interface LeadCRMProps {
  leads: Lead[];
  onUpdateLead: (id: string, data: Partial<Lead>) => Promise<void>;
  onDeleteLead: (id: string) => Promise<void>;
}

export const LeadCRM: React.FC<LeadCRMProps> = ({ leads, onUpdateLead, onDeleteLead }) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'card' | 'kanban'>('table');

  // Lead modal edit state
  const [editValue, setEditValue] = useState<number>(0);
  const [editNotes, setEditNotes] = useState<string>('');

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

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      (lead.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.location?.city || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.utmCampaign || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.utmContent || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.utmTerm || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.phone || '').includes(searchQuery);

    const matchesStage = stageFilter === 'all' || lead.stage === stageFilter;
    const matchesSource = sourceFilter === 'all' || lead.utmSource === sourceFilter;

    return matchesSearch && matchesStage && matchesSource;
  });

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
    setEditValue(lead.value || 0);
    setEditNotes(lead.notes || '');
  };

  const handleSaveLeadDetails = async () => {
    if (!selectedLead) return;
    await onUpdateLead(selectedLead.id, {
      value: editValue,
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
            <a href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-green-600 hover:bg-green-50 p-1 rounded transition" title="WhatsApp">
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
          )}
          <button onClick={() => handleOpenLeadDetails(lead)} className="text-slate-400 hover:text-blue-600 hover:bg-slate-50 p-1 rounded transition" title="Detalhes">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px]">
        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold border border-slate-200 truncate max-w-[100px]" title={lead.utmSource || lead.source}>
          {lead.utmSource || lead.source || 'Direto'}
        </span>
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
        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(lead.updatedAt).split(' ')[0]}
        </span>
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
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, cidade, telefone, UTM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded pl-9 pr-3.5 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
          />
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

      {/* Main Leads Views */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Nome do Lead</th>
                <th className="py-3.5 px-3">Localização (Geo)</th>
                <th className="py-3.5 px-3">Origem & UTMs</th>
                <th className="py-3.5 px-3">Etapa do Funil</th>
                <th className="py-3.5 px-3">Data de Criação</th>
                <th className="py-3.5 px-3">Última Atualização</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50 transition border-b border-slate-100">
                  
                  {/* Name */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-100">
                        {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
                      </div>
                      <div>
                        <div className="text-slate-900 font-bold">{lead.name || 'Lead Visitante'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{lead.phone || 'Telefone indisponível'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{lead.location?.city || 'Brasil'}, {lead.location?.state || 'SP'}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">IP: {lead.location?.ip || '---'}</div>
                  </td>

                  {/* Source & Ad Attribution */}
                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                        {lead.utmSource || lead.source}
                      </span>
                      {lead.utmContent && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200 flex items-center gap-1" title="Anúncio / Criativo">
                          🎨 {lead.utmContent}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono mt-1 space-y-0.5">
                      <div className="truncate max-w-[170px]">📢 {lead.utmCampaign || 'campanha_geral'}</div>
                      {lead.utmTerm && <div className="truncate max-w-[170px] text-slate-400">🎯 {lead.utmTerm}</div>}
                    </div>
                  </td>

                  {/* Stage */}
                  <td className="py-3.5 px-3">
                    <select
                      value={lead.stage}
                      onChange={(e) => handleStageChange(lead.id, e.target.value as FunnelStage)}
                      className={`text-xs font-bold px-2.5 py-1 rounded border focus:outline-none cursor-pointer ${getStageBadgeClass(lead.stage)}`}
                    >
                      <option value="Novo Lead">Novo Lead</option>
                      <option value="Contatado">Contatado</option>
                      <option value="Em Negociação">Em Negociação</option>
                      <option value="Convertido">Convertido</option>
                      <option value="Perdido">Perdido</option>
                    </select>
                  </td>

                  {/* Created Date */}
                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(lead.createdAt)}
                    </div>
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
                      
                      {/* WhatsApp Button */}
                      {lead.phone && (
                        <a
                          href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded transition border border-green-200"
                          title="Abrir no WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </a>
                      )}

                      {/* Details Button */}
                      <button
                        onClick={() => handleOpenLeadDetails(lead)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition text-xs font-semibold px-2 flex items-center gap-1 border border-slate-200"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        Detalhes
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteLead(lead.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {viewMode === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLeads.map(lead => renderLeadCard(lead))}
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start h-[calc(100vh-220px)] min-h-[500px]">
          {['Novo Lead', 'Contatado', 'Em Negociação', 'Convertido', 'Perdido'].map(stage => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage);
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

      {/* LEAD DETAILS & EVENTS MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-xl rounded-lg p-6 shadow-xl space-y-5 relative my-8 text-slate-800">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
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
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Valor da Negociação / Venda (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editValue}
                  onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-blue-700 font-mono font-bold focus:outline-none focus:bg-white focus:border-blue-600"
                />
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

            {/* Conversion Events History */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-blue-600" />
                Histórico de Eventos de Conversão (Pixels / CAPI)
              </span>

              <div className="space-y-2 max-h-36 overflow-y-auto">
                {selectedLead.conversionEvents && selectedLead.conversionEvents.length > 0 ? (
                  selectedLead.conversionEvents.map((evt) => (
                    <div key={evt.id} className="bg-slate-50 p-2.5 rounded border border-slate-200 text-[11px] flex items-center justify-between">
                      <div>
                        <span className="font-bold text-green-700 uppercase">{evt.type}</span> - <span className="text-slate-900 font-semibold">{evt.eventName}</span>
                        <p className="text-slate-500 text-[10px]">{evt.details}</p>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px]">{formatDate(evt.timestamp)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded border border-slate-200">
                    Nenhum evento de conversão disparado ainda.
                  </p>
                )}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={async () => {
                  await handleStageChange(selectedLead.id, 'Convertido');
                  await onUpdateLead(selectedLead.id, { value: editValue || 500 });
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
