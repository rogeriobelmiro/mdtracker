import React, { useState } from 'react';
import { IntegrationSettings, WebhookLog, FunnelStage, StageEventConfig, AutoStageKeywordRule } from '../types';
import { Zap, Send, Code, CheckCircle, AlertCircle, Copy, Check, ShieldCheck, Globe, RefreshCw, Terminal, Sliders, MessageSquare, Plus, Trash2 } from 'lucide-react';

interface IntegrationsAndEventsProps {
  settings: IntegrationSettings;
  onUpdateSettings: (data: Partial<IntegrationSettings>) => Promise<void>;
  webhookLogs: WebhookLog[];
  onTestWebhook: (url: string) => Promise<{ success: boolean; message: string }>;
}

const FUNNEL_STAGES: FunnelStage[] = ['Novo Lead', 'Contatado', 'Em Negociação', 'Convertido', 'Perdido'];

const DEFAULT_MAPPINGS: Record<FunnelStage, StageEventConfig> = {
  'Novo Lead': { stage: 'Novo Lead', metaEvent: 'Lead', googleLabel: 'lead_conversion', enabled: true },
  'Contatado': { stage: 'Contatado', metaEvent: 'Contact', googleLabel: 'contact_conversion', enabled: true },
  'Em Negociação': { stage: 'Em Negociação', metaEvent: 'InitiateCheckout', googleLabel: 'checkout_conversion', enabled: true },
  'Convertido': { stage: 'Convertido', metaEvent: 'Purchase', googleLabel: 'purchase_conversion', enabled: true },
  'Perdido': { stage: 'Perdido', metaEvent: 'LeadLost', googleLabel: 'loss_conversion', enabled: false }
};

const DEFAULT_KEYWORDS: AutoStageKeywordRule[] = [
  { stage: 'Contatado', keywords: ['oi', 'olá', 'boa tarde', 'bom dia', 'atendimento', 'dúvida'], enabled: true },
  { stage: 'Em Negociação', keywords: ['preço', 'valor', 'orçamento', 'proposta', 'reunião', 'agendar', 'desconto'], enabled: true },
  { stage: 'Convertido', keywords: ['pix', 'comprar', 'pagar', 'comprovante', 'fechado', 'paguei', 'cartão'], enabled: true },
  { stage: 'Perdido', keywords: ['não quero', 'cancelar', 'muito caro', 'sem interesse', 'desistir'], enabled: true }
];

export const IntegrationsAndEvents: React.FC<IntegrationsAndEventsProps> = ({
  settings,
  onUpdateSettings,
  webhookLogs,
  onTestWebhook,
}) => {
  const [formData, setFormData] = useState<IntegrationSettings>({
    ...settings,
    stageEventMappings: settings.stageEventMappings || DEFAULT_MAPPINGS,
    autoStageKeywords: settings.autoStageKeywords || DEFAULT_KEYWORDS
  });
  
  const [testUrl, setTestUrl] = useState<string>(settings.globalWebhookUrl || '');
  const [testStatus, setTestStatus] = useState<{ loading: boolean; message?: string; success?: boolean }>({ loading: false });
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newKeywordInputs, setNewKeywordInputs] = useState<Record<string, string>>({});

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Auto-add pending keywords from input fields
    let updatedData = { ...formData };
    const currentRules = updatedData.autoStageKeywords || [...DEFAULT_KEYWORDS];
    let rulesChanged = false;
    let newRules = [...currentRules];
    
    FUNNEL_STAGES.forEach(stage => {
      const pendingKw = (newKeywordInputs[stage] || '').trim().toLowerCase();
      if (pendingKw) {
        rulesChanged = true;
        const existingRuleIdx = newRules.findIndex(r => r.stage === stage);
        if (existingRuleIdx >= 0) {
          const currentKws = newRules[existingRuleIdx].keywords;
          if (!currentKws.includes(pendingKw)) {
            newRules[existingRuleIdx] = {
              ...newRules[existingRuleIdx],
              keywords: [...currentKws, pendingKw]
            };
          }
        } else {
          newRules.push({ stage, keywords: [pendingKw], enabled: true });
        }
      }
    });

    if (rulesChanged) {
      updatedData = { ...updatedData, autoStageKeywords: newRules };
      setFormData(updatedData);
      setNewKeywordInputs({}); // Clear inputs
    }

    await onUpdateSettings(updatedData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleMappingChange = (stage: FunnelStage, field: keyof StageEventConfig, val: any) => {
    setFormData(prev => {
      const currentMappings = prev.stageEventMappings || { ...DEFAULT_MAPPINGS };
      const currentStageMapping = currentMappings[stage] || { stage, metaEvent: 'Lead', googleLabel: 'lead_conversion', enabled: true };
      
      return {
        ...prev,
        stageEventMappings: {
          ...currentMappings,
          [stage]: {
            ...currentStageMapping,
            [field]: val
          }
        }
      };
    });
  };

  const handleAddKeyword = (stage: FunnelStage) => {
    const kwText = (newKeywordInputs[stage] || '').trim().toLowerCase();
    if (!kwText) return;

    setFormData(prev => {
      const rules = prev.autoStageKeywords || [...DEFAULT_KEYWORDS];
      const existingRuleIdx = rules.findIndex(r => r.stage === stage);
      
      let updatedRules = [...rules];
      if (existingRuleIdx >= 0) {
        const currentKws = updatedRules[existingRuleIdx].keywords;
        if (!currentKws.includes(kwText)) {
          updatedRules[existingRuleIdx] = {
            ...updatedRules[existingRuleIdx],
            keywords: [...currentKws, kwText]
          };
        }
      } else {
        updatedRules.push({
          stage,
          keywords: [kwText],
          enabled: true
        });
      }

      return {
        ...prev,
        autoStageKeywords: updatedRules
      };
    });

    setNewKeywordInputs(prev => ({ ...prev, [stage]: '' }));
  };

  const handleRemoveKeyword = (stage: FunnelStage, keywordToRemove: string) => {
    setFormData(prev => {
      const rules = prev.autoStageKeywords || [...DEFAULT_KEYWORDS];
      const updatedRules = rules.map(r => {
        if (r.stage === stage) {
          return {
            ...r,
            keywords: r.keywords.filter(k => k !== keywordToRemove)
          };
        }
        return r;
      });
      return { ...prev, autoStageKeywords: updatedRules };
    });
  };

  const handleToggleKeywordRule = (stage: FunnelStage, enabled: boolean) => {
    setFormData(prev => {
      const rules = prev.autoStageKeywords || [...DEFAULT_KEYWORDS];
      const updatedRules = rules.map(r => r.stage === stage ? { ...r, enabled } : r);
      return { ...prev, autoStageKeywords: updatedRules };
    });
  };

  const handleRunTestWebhook = async () => {
    if (!testUrl) return;
    setTestStatus({ loading: true });
    try {
      const res = await onTestWebhook(testUrl);
      setTestStatus({ loading: false, message: res.message, success: res.success });
    } catch (err) {
      setTestStatus({ loading: false, message: 'Erro ao disparar webhook de teste.', success: false });
    }
  };

  const appOrigin = window.location.origin;

  const trackingSnippetCode = `<!-- Snippet de Rastreamento WhatsApp RastreioWhatsApp -->
<script>
  (function() {
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source') || 'organico';
    const utmCampaign = urlParams.get('utm_campaign') || 'geral';
    
    // Atualiza todos os botões de WhatsApp da página para passarem pelo link rastreável
    document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp.com"]').forEach(btn => {
      const originalHref = btn.getAttribute('href');
      const trackedRedirect = '${appOrigin}/r/bio-instagram?utm_source=' + encodeURIComponent(utmSource) + '&utm_campaign=' + encodeURIComponent(utmCampaign);
      btn.setAttribute('href', trackedRedirect);
    });
  })();
</script>`;

  const copySnippet = () => {
    navigator.clipboard.writeText(trackingSnippetCode);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Integration Settings, Conversion Events & Automation Rules
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Meta CAPI events, Google Ads conversion tags per funnel stage, auto-stage chat rules, and outgoing webhooks.
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-xs font-semibold px-4 py-2 rounded flex items-center gap-2 animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            Configurações salvas com sucesso!
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">

        {/* Global Tokens & Pixel IDs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Meta Ads Credentials */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Meta Ads - Pixel & Conversions API (CAPI)</h3>
                <p className="text-[11px] text-slate-500">Credenciais para envio server-side de eventos do WhatsApp.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Global Meta Pixel ID</label>
                <input
                  type="text"
                  placeholder="Ex: 1234567890987654"
                  value={formData.globalMetaPixelId}
                  onChange={(e) => setFormData({ ...formData, globalMetaPixelId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">CAPI Access Token (Servidor Meta)</label>
                <input
                  type="password"
                  placeholder="EAAG..."
                  value={formData.globalMetaToken}
                  onChange={(e) => setFormData({ ...formData, globalMetaToken: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center justify-between bg-slate-50 p-3 rounded border border-slate-200 text-xs cursor-pointer">
                  <span className="text-slate-700 font-medium">Disparar 'Lead' ao clicar no link WhatsApp</span>
                  <input
                    type="checkbox"
                    checked={formData.autoFireMetaOnLead}
                    onChange={(e) => setFormData({ ...formData, autoFireMetaOnLead: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Card 2: Google Ads Credentials */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-xs">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="w-9 h-9 rounded bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Google Ads - Conversion Tag</h3>
                <p className="text-[11px] text-slate-500">Atribuição para campanhas de Pesquisa, Display e YouTube.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">ID de Conversão Google Ads</label>
                <input
                  type="text"
                  placeholder="Ex: AW-987654321"
                  value={formData.globalGoogleAdsId}
                  onChange={(e) => setFormData({ ...formData, globalGoogleAdsId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Rótulo de Conversão (Global Label)</label>
                <input
                  type="text"
                  placeholder="Ex: ABc123xYz987"
                  value={formData.globalGoogleAdsLabel}
                  onChange={(e) => setFormData({ ...formData, globalGoogleAdsLabel: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center justify-between bg-slate-50 p-3 rounded border border-slate-200 text-xs cursor-pointer">
                  <span className="text-slate-700 font-medium">Ativar Tag de Conversão nas Vendas Concluídas</span>
                  <input
                    type="checkbox"
                    checked={formData.autoFireGoogleOnConversion}
                    onChange={(e) => setFormData({ ...formData, autoFireGoogleOnConversion: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* FEATURE: Stage-to-Event Mapping Table */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Associação de Eventos por Etapa do Funil</h3>
                <p className="text-[11px] text-slate-500">
                  Defina qual evento do Meta Ads CAPI e Tag do Google Ads deve disparar automaticamente quando o lead mudar para cada etapa.
                </p>
              </div>
            </div>

            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2.5 py-1 rounded border border-purple-200 self-start sm:self-auto">
              🎯 Relatório Automático Meta & Google
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Etapa do Funil</th>
                  <th className="py-3 px-3">Evento Meta CAPI</th>
                  <th className="py-3 px-3">Label de Conversão Google Ads</th>
                  <th className="py-3 px-3 text-center">Status / Disparo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {FUNNEL_STAGES.map(stage => {
                  const mapping = (formData.stageEventMappings && formData.stageEventMappings[stage]) || DEFAULT_MAPPINGS[stage];

                  return (
                    <tr key={stage} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        <span className={`inline-block px-2.5 py-1 rounded text-xs ${
                          stage === 'Novo Lead' ? 'bg-blue-100 text-blue-800' :
                          stage === 'Contatado' ? 'bg-amber-100 text-amber-800' :
                          stage === 'Em Negociação' ? 'bg-purple-100 text-purple-800' :
                          stage === 'Convertido' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {stage}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <select
                          value={mapping.metaEvent}
                          onChange={(e) => handleMappingChange(stage, 'metaEvent', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                        >
                          <option value="Lead">Lead (Captura)</option>
                          <option value="Contact">Contact (Contato WhatsApp)</option>
                          <option value="Schedule">Schedule (Agendamento)</option>
                          <option value="SubmitApplication">SubmitApplication (Proposta/Cadastro)</option>
                          <option value="InitiateCheckout">InitiateCheckout (Início Checkout)</option>
                          <option value="Purchase">Purchase (Compra/Venda Fechada)</option>
                          <option value="LeadLost">LeadLost (Perdido/Desistência)</option>
                        </select>
                      </td>

                      <td className="py-3 px-3">
                        <input
                          type="text"
                          value={mapping.googleLabel}
                          onChange={(e) => handleMappingChange(stage, 'googleLabel', e.target.value)}
                          placeholder="Ex: lead_conversion, purchase_label"
                          className="w-full bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600 font-mono"
                        />
                      </td>

                      <td className="py-3 px-3 text-center">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={mapping.enabled}
                            onChange={(e) => handleMappingChange(stage, 'enabled', e.target.checked)}
                            className="w-4 h-4 accent-blue-600 rounded"
                          />
                          <span className={`text-[11px] font-bold ${mapping.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {mapping.enabled ? 'Ativo' : 'Desativado'}
                          </span>
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FEATURE: Chat Keyword Auto-Stage Triggers */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Gatilhos Automáticos de Etapa no Chat (Palavras-Chave)</h3>
                <p className="text-[11px] text-slate-500">
                  Quando o lead ou atendente mencionar palavras-chave na conversa do WhatsApp, a etapa do funil e os eventos correspondentes mudam automaticamente.
                </p>
              </div>
            </div>

            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded border border-emerald-200 self-start sm:self-auto flex items-center gap-1">
              🤖 Automação WhatsApp Ativa
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Contatado', 'Em Negociação', 'Convertido', 'Perdido'].map(stg => {
              const stageName = stg as FunnelStage;
              const rule = (formData.autoStageKeywords || DEFAULT_KEYWORDS).find(r => r.stage === stageName) || {
                stage: stageName,
                keywords: [],
                enabled: true
              };

              return (
                <div key={stageName} className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      Alterar para: <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{stageName}</span>
                    </span>
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px]">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => handleToggleKeywordRule(stageName, e.target.checked)}
                        className="w-3.5 h-3.5 accent-emerald-600 rounded"
                      />
                      <span className="font-semibold text-slate-600">{rule.enabled ? 'Ativo' : 'Pausado'}</span>
                    </label>
                  </div>

                  {/* Keywords Tag Pill Container */}
                  <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 bg-white rounded border border-slate-200">
                    {rule.keywords.length > 0 ? (
                      rule.keywords.map(kw => (
                        <span
                          key={kw}
                          className="bg-slate-100 text-slate-800 text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-300"
                        >
                          {kw}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(stageName, kw)}
                            className="text-slate-400 hover:text-red-600 ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Nenhuma palavra-chave cadastrada</span>
                    )}
                  </div>

                  {/* Add Keyword Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Nova palavra-chave (Ex: pix, comprar)..."
                      value={newKeywordInputs[stageName] || ''}
                      onChange={(e) => setNewKeywordInputs({ ...newKeywordInputs, [stageName]: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddKeyword(stageName);
                        }
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddKeyword(stageName)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 3: Outgoing Webhook Postback */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Outgoing Webhook (Postback CRM Externo)</h3>
                <p className="text-[11px] text-slate-500">Envie eventos em tempo real para N8N, Make, Zapier ou CRM próprio.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">URL Endpoint do Webhook Global</label>
                <input
                  type="text"
                  placeholder="https://sua-empresa.com/api/webhooks/whatsapp"
                  value={formData.globalWebhookUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, globalWebhookUrl: e.target.value });
                    setTestUrl(e.target.value);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-between bg-slate-50 p-3 rounded border border-slate-200 text-xs cursor-pointer">
                  <span className="text-slate-700 font-medium">Notificar criação de novos leads</span>
                  <input
                    type="checkbox"
                    checked={formData.autoFireWebhookOnLead}
                    onChange={(e) => setFormData({ ...formData, autoFireWebhookOnLead: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between bg-slate-50 p-3 rounded border border-slate-200 text-xs cursor-pointer">
                  <span className="text-slate-700 font-medium">Notificar atualizações de etapa no funil</span>
                  <input
                    type="checkbox"
                    checked={formData.autoFireWebhookOnStageChange}
                    onChange={(e) => setFormData({ ...formData, autoFireWebhookOnStageChange: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>
              </div>
            </div>

            {/* Test Runner Box */}
            <div className="bg-slate-50 p-4 rounded border border-slate-200 flex flex-col justify-between space-y-3">
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-1">Testador de Webhook</span>
                <p className="text-[11px] text-slate-500">
                  Dispara um payload JSON para validar se seu endpoint responde com HTTP 200 OK.
                </p>
              </div>

              {testStatus.message && (
                <div className={`p-2 rounded text-xs font-semibold ${
                  testStatus.success ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {testStatus.message}
                </div>
              )}

              <button
                type="button"
                onClick={handleRunTestWebhook}
                disabled={testStatus.loading || !testUrl}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 rounded text-xs transition flex items-center justify-center gap-2 shadow-xs"
              >
                {testStatus.loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Disparar Webhook Teste
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2 rounded transition shadow-xs flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Salvar Todas as Integradores e Eventos
            </button>
          </div>
        </div>

      </form>

      {/* Embedded Script Snippet Generator */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Script de Injeção Automática de UTM para LPs e WordPress</h3>
          </div>
          <button
            onClick={copySnippet}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold px-3 py-1.5 rounded transition flex items-center gap-1.5 border border-slate-200"
          >
            {copiedSnippet ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedSnippet ? 'Copiado!' : 'Copiar Código HTML'}
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Cole este snippet no <code className="text-blue-600 font-mono">&lt;head&gt;</code> do seu site ou Landing Page para capturar parâmetros UTM e anexar aos links de WhatsApp.
        </p>

        <pre className="bg-slate-900 p-4 rounded text-slate-200 font-mono text-[11px] overflow-x-auto border border-slate-800">
          {trackingSnippetCode}
        </pre>
      </div>

      {/* Event Logs Table */}
      <div className="bg-white border border-slate-200 rounded-lg p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-600" />
              Logs de Disparo de Eventos Meta Ads, Google Ads e Webhook
            </h3>
            <p className="text-xs text-slate-500">Registro em tempo real das notificações enviadas para as plataformas de anúncios.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Evento</th>
                <th className="py-3 px-3">Lead Relacionado</th>
                <th className="py-3 px-3">URL / Canal Destino</th>
                <th className="py-3 px-3 text-right">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {webhookLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition font-mono text-[11px] border-b border-slate-100">
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 200 ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                      HTTP {log.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{log.event}</td>
                  <td className="py-3 px-3 text-slate-700">{log.leadName || 'Visitante'}</td>
                  <td className="py-3 px-3 text-slate-500 truncate max-w-xs">{log.url}</td>
                  <td className="py-3 px-3 text-right text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
