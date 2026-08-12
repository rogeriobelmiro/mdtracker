import React, { useState } from 'react';
import { 
  Send, Radio, Users, CheckCircle2, Clock, Play, Pause, RefreshCw, Download, 
  ExternalLink, Plus, Filter, Sparkles, MessageSquare, Settings, AlertCircle, Trash2, Check, Copy
} from 'lucide-react';
import { Lead, CampaignLink, BroadcastCampaign, FunnelStage } from '../types';

interface BroadcastCampaignsProps {
  leads: Lead[];
  links: CampaignLink[];
}

export const BroadcastCampaigns: React.FC<BroadcastCampaignsProps> = ({ leads, links }) => {
  // Mock stored broadcast campaigns
  const [campaigns, setCampaigns] = useState<BroadcastCampaign[]>([
    {
      id: 'bc-1',
      name: 'Disparo Black Friday - Reengajamento',
      targetStage: 'Em Negociação',
      targetSource: 'meta_ads',
      messageTemplate: 'Olá {nome}, tudo bem? Notamos que você se interessou pelo nosso atendimento em {cidade}. Temos um cupom exclusivo para hoje!',
      status: 'concluido',
      totalLeads: 18,
      sentCount: 18,
      deliveredCount: 17,
      clickedCount: 9,
      provider: 'simulado_web',
      delaySeconds: 5,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      id: 'bc-2',
      name: 'Lembrete de Proposta - Leads Novos',
      targetStage: 'Novo Lead',
      targetSource: 'Todas',
      messageTemplate: 'Olá {nome}! Vi que você solicitou informações pelo site. Gostaria de tirar alguma dúvida agora pelo WhatsApp?',
      status: 'concluido',
      totalLeads: 24,
      sentCount: 24,
      deliveredCount: 24,
      clickedCount: 14,
      provider: 'simulado_web',
      delaySeconds: 8,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ]);

  // Modal / Form state for new broadcast
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [campaignName, setCampaignName] = useState('');
  const [selectedStage, setSelectedStage] = useState<string>('Todos');
  const [selectedSource, setSelectedSource] = useState<string>('Todas');
  const [messageTemplate, setMessageTemplate] = useState('Olá {nome}! Tudo bem? Gostaria de apresentar uma oportunidade especial para você hoje.');
  const [selectedLinkId, setSelectedLinkId] = useState<string>('');
  const [delaySeconds, setDelaySeconds] = useState<number>(5);
  const [provider, setProvider] = useState<'simulado_web' | 'evolution_api' | 'z_api' | 'webhook'>('simulado_web');
  
  // API credentials if provider is active
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Active Execution State
  const [activeCampaign, setActiveCampaign] = useState<BroadcastCampaign | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [executionLogs, setExecutionLogs] = useState<Array<{ leadName: string; phone: string; time: string; status: 'enviado' | 'erro' }>>([]);
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);

  // Filter matching leads based on selection
  const matchingLeads = leads.filter(l => {
    const hasPhone = Boolean(l.phone && l.phone.trim().length >= 8);
    if (!hasPhone) return false;
    const stageMatch = selectedStage === 'Todos' || l.stage === selectedStage;
    const sourceMatch = selectedSource === 'Todas' || l.utmSource === selectedSource || l.source === selectedSource;
    return stageMatch && sourceMatch;
  });

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim()) return;

    const newCampaign: BroadcastCampaign = {
      id: 'bc-' + Date.now(),
      name: campaignName,
      targetStage: selectedStage as any,
      targetSource: selectedSource,
      messageTemplate,
      trackingLinkId: selectedLinkId || undefined,
      status: 'rascunho',
      totalLeads: matchingLeads.length,
      sentCount: 0,
      deliveredCount: 0,
      clickedCount: 0,
      provider,
      delaySeconds,
      createdAt: new Date().toISOString()
    };

    setCampaigns([newCampaign, ...campaigns]);
    setIsModalOpen(false);
    
    // Auto launch execution view
    startCampaignExecution(newCampaign);
  };

  const startCampaignExecution = (camp: BroadcastCampaign) => {
    setActiveCampaign(camp);
    setIsExecuting(true);
    setCurrentLeadIndex(0);
    setExecutionLogs([]);
  };

  // Simulates sending 1 message per delaySeconds
  React.useEffect(() => {
    let timer: any;
    if (isExecuting && activeCampaign && matchingLeads.length > 0) {
      if (currentLeadIndex < matchingLeads.length) {
        timer = setTimeout(() => {
          const currentLead = matchingLeads[currentLeadIndex];
          const newLog = {
            leadName: currentLead.name || 'Lead',
            phone: currentLead.phone || '',
            time: new Date().toLocaleTimeString('pt-BR'),
            status: 'enviado' as const
          };

          setExecutionLogs(prev => [newLog, ...prev]);
          
          // Update campaign counts
          setCampaigns(prev => prev.map(c => {
            if (c.id === activeCampaign.id) {
              const updatedSent = c.sentCount + 1;
              const isFinished = updatedSent >= matchingLeads.length;
              return {
                ...c,
                sentCount: updatedSent,
                deliveredCount: updatedSent,
                status: isFinished ? 'concluido' : 'em_andamento'
              };
            }
            return c;
          }));

          setCurrentLeadIndex(prev => prev + 1);
        }, delaySeconds * 1000);
      } else {
        setIsExecuting(false);
      }
    }
    return () => clearTimeout(timer);
  }, [isExecuting, currentLeadIndex, activeCampaign, matchingLeads, delaySeconds]);

  const insertVariable = (variable: string) => {
    setMessageTemplate(prev => prev + ' ' + variable);
  };

  const formatMessageForLead = (template: string, lead: Lead) => {
    let msg = template
      .replace(/\{nome\}/g, lead.name || 'Cliente')
      .replace(/\{cidade\}/g, lead.location?.city || 'sua cidade')
      .replace(/\{etapa\}/g, lead.stage)
      .replace(/\{fonte\}/g, lead.utmSource || lead.source);

    if (selectedLinkId) {
      const selectedLink = links.find(l => l.id === selectedLinkId);
      if (selectedLink) {
        msg += `\n\nAcesse: ${window.location.origin}/r/${selectedLink.slug}?utm_source=broadcast_${activeCampaign?.id || 'massa'}`;
      }
    }
    return msg;
  };

  const exportCSV = () => {
    const headers = 'Nome,Telefone,Cidade,Estado,Etapa,Origem,MensagemPersonalizada\n';
    const rows = matchingLeads.map(l => {
      const formattedMsg = formatMessageForLead(messageTemplate, l).replace(/"/g, '""');
      return `"${l.name}","${l.phone}","${l.location?.city}","${l.location?.state}","${l.stage}","${l.utmSource}","${formattedMsg}"`;
    }).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `base_disparo_whatsapp_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate totals
  const totalDisparados = campaigns.reduce((acc, c) => acc + c.sentCount, 0);
  const totalConcluidos = campaigns.filter(c => c.status === 'concluido').length;

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600 animate-pulse" />
            Disparo de WhatsApp para Base de Contatos
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Crie campanhas de transmissão, mensagens em massa personalizadas e automações para seus leads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold px-3.5 py-2 rounded transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-blue-600" />
            Exportar CSV
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded transition flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            Nova Campanha de Disparo
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Total de Disparos</span>
          <span className="text-2xl font-extrabold text-slate-900">{totalDisparados}</span>
          <p className="text-[11px] text-slate-400 mt-1">Mensagens enviadas com sucesso</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Base Disponível</span>
          <span className="text-2xl font-extrabold text-blue-600">{leads.filter(l => Boolean(l.phone)).length}</span>
          <p className="text-[11px] text-slate-400 mt-1">Leads cadastrados com WhatsApp</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Campanhas Concluídas</span>
          <span className="text-2xl font-extrabold text-green-600">{totalConcluidos}</span>
          <p className="text-[11px] text-slate-400 mt-1">Lotes finalizados sem bloqueio</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-lg shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Taxa Média de Cliques</span>
          <span className="text-2xl font-extrabold text-purple-600">48.5%</span>
          <p className="text-[11px] text-slate-400 mt-1">Engajamento de links rastreados</p>
        </div>
      </div>

      {/* Active Running Campaign Monitor (If executing or recently active) */}
      {activeCampaign && (
        <div className="bg-slate-900 text-white p-6 rounded-lg border border-slate-800 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <h3 className="font-bold text-sm text-white">Execução em Tempo Real: {activeCampaign.name}</h3>
                <p className="text-xs text-slate-400">
                  Intervalo configurado: {delaySeconds}s entre envios para prevenção anti-spam.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsExecuting(!isExecuting)}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 ${
                  isExecuting ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isExecuting ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                {isExecuting ? 'Pausar Disparos' : 'Continuar Disparos'}
              </button>
              <button
                onClick={() => setActiveCampaign(null)}
                className="px-3 py-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Ocultar
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1 font-semibold">
              <span>Progresso dos Envios: {currentLeadIndex} de {matchingLeads.length} leads</span>
              <span>{matchingLeads.length > 0 ? Math.round((currentLeadIndex / matchingLeads.length) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${matchingLeads.length > 0 ? (currentLeadIndex / matchingLeads.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Logs */}
          <div className="bg-slate-950 p-4 rounded border border-slate-800 space-y-2 max-h-48 overflow-y-auto font-mono text-xs">
            <span className="text-[10px] text-slate-500 font-bold uppercase block mb-2">Log de Disparo ao Vivo:</span>
            {executionLogs.length > 0 ? (
              executionLogs.map((log, idx) => (
                <div key={idx} className="flex items-center justify-between text-slate-300 border-b border-slate-900 pb-1">
                  <span className="text-emerald-400 font-bold">✓ {log.leadName} ({log.phone})</span>
                  <span className="text-slate-500">{log.time} - Enviado com sucesso</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 italic">Aguardando início dos disparos...</p>
            )}
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Histórico de Campanhas de Transmissão</h3>
            <p className="text-xs text-slate-500">Histórico de lotes enviados para a base de contatos.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Nome da Campanha</th>
                <th className="py-3 px-3">Público Alvo</th>
                <th className="py-3 px-3 text-center">Leads Alvo</th>
                <th className="py-3 px-3 text-center">Enviados</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {campaigns.map((camp) => (
                <tr key={camp.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3 font-bold text-slate-900">
                    {camp.name}
                    <span className="block text-[10px] font-normal text-slate-400 font-mono mt-0.5">
                      Criado em: {new Date(camp.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px] border border-slate-200">
                      Etapa: {camp.targetStage}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-slate-800 font-mono">{camp.totalLeads}</td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600 font-mono">{camp.sentCount}</td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      camp.status === 'concluido' ? 'bg-green-100 text-green-700 border border-green-200' :
                      camp.status === 'em_andamento' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                      'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {camp.status === 'concluido' ? 'Concluído' : camp.status === 'em_andamento' ? 'Em Execução' : 'Rascunho'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => startCampaignExecution(camp)}
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        Disparar Lote
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja apagar esta campanha do histórico?')) {
                            setCampaigns(prev => prev.filter(c => c.id !== camp.id));
                            if (activeCampaign?.id === camp.id) {
                              setIsExecuting(false);
                              setActiveCampaign(null);
                            }
                          }
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Apagar do histórico"
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

      {/* Manual Direct WhatsApp Web One-Click Queue */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Fila de Disparo Individual de 1 Clique via WhatsApp Web
            </h3>
            <p className="text-xs text-slate-500">
              Dispare mensagens diretamente para o aplicativo do WhatsApp Web sem risco de bloqueio de API.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto">
          {matchingLeads.slice(0, 10).map((lead, idx) => {
            const formattedMsg = encodeURIComponent(formatMessageForLead(messageTemplate, lead));
            const cleanPhone = lead.phone?.replace(/\D/g, '') || '';
            const waUrl = `https://wa.me/55${cleanPhone}?text=${formattedMsg}`;

            return (
              <div key={lead.id} className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">{lead.name}</span>
                  <span className="text-[11px] text-slate-500 font-mono">{lead.phone} • {lead.location?.city}</span>
                </div>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded transition flex items-center gap-1 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar
                </a>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: Create New Broadcast Campaign */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-lg p-6 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Configurar Nova Transmissão de WhatsApp</h2>
                <p className="text-xs text-slate-500">Filtre o público alvo, customize o texto e programe o envio em massa.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4">
              
              {/* Campaign Name */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nome da Transmissão *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Oferta Exclusiva Leads de Março"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              {/* Segmentation Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded border border-slate-200">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Filtrar por Etapa do Funil</label>
                  <select
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Todos">Todas as Etapas</option>
                    <option value="Novo Lead">Novo Lead</option>
                    <option value="Contatado">Contatado</option>
                    <option value="Em Negociação">Em Negociação</option>
                    <option value="Convertido">Convertido</option>
                    <option value="Perdido">Perdido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Filtrar por Origem (UTM Source)</label>
                  <select
                    value={selectedSource}
                    onChange={(e) => setSelectedSource(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Todas">Todas as Origens</option>
                    <option value="meta_ads">Meta Ads</option>
                    <option value="google_ads">Google Ads</option>
                    <option value="instagram">Instagram</option>
                    <option value="whatsapp">WhatsApp Direto</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex items-center justify-between text-xs pt-1 border-t border-slate-200/80">
                  <span className="text-slate-600">Leads encontrados no segmento:</span>
                  <span className="font-bold text-blue-700 font-mono bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                    {matchingLeads.length} contatos com WhatsApp
                  </span>
                </div>
              </div>

              {/* Message Template Editor */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-700">Modelo da Mensagem *</label>
                  <div className="flex gap-1.5 text-[11px]">
                    <button type="button" onClick={() => insertVariable('{nome}')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-mono">
                      + {'{nome}'}
                    </button>
                    <button type="button" onClick={() => insertVariable('{cidade}')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded border border-slate-200 font-mono">
                      + {'{cidade}'}
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  required
                  value={messageTemplate}
                  onChange={(e) => setMessageTemplate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              {/* Link Attachment */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Anexar Link de Rastreamento UTM (Opcional)</label>
                <select
                  value={selectedLinkId}
                  onChange={(e) => setSelectedLinkId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                >
                  <option value="">Nenhum link anexado</option>
                  {links.map(l => (
                    <option key={l.id} value={l.id}>{l.title} ({l.slug})</option>
                  ))}
                </select>
              </div>

              {/* Delay & Anti-spam Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/50 border border-amber-200 p-4 rounded">
                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">Atraso entre Envios (Anti-Spam)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="2"
                      max="60"
                      value={delaySeconds}
                      onChange={(e) => setDelaySeconds(Number(e.target.value))}
                      className="w-20 bg-white border border-amber-300 rounded p-1.5 text-xs text-slate-800 font-bold text-center"
                    />
                    <span className="text-xs text-amber-800">segundos</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 mb-1">Método de Disparo</label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as any)}
                    className="w-full bg-white border border-amber-300 rounded p-1.5 text-xs text-slate-800"
                  >
                    <option value="simulado_web">Fila Automática Interativa (Web)</option>
                    <option value="evolution_api">Evolution API / Z-API</option>
                    <option value="webhook">Disparo via Webhook Outgoing</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded transition shadow-xs"
                >
                  Iniciar Transmissão
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
