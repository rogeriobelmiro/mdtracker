import React, { useState } from 'react';
import { CampaignLink } from '../types';
import { Plus, Copy, ExternalLink, QrCode, Trash2, Edit3, Smartphone, Check, Sparkles, Filter, Globe, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface LinkManagerProps {
  links: CampaignLink[];
  onCreateLink: (data: Partial<CampaignLink>) => Promise<void>;
  onUpdateLink: (id: string, data: Partial<CampaignLink>) => Promise<void>;
  onDeleteLink: (id: string) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

export const LinkManager: React.FC<LinkManagerProps> = ({
  links,
  onCreateLink,
  onUpdateLink,
  onDeleteLink,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [editingLink, setEditingLink] = useState<CampaignLink | null>(null);
  const [qrModalLink, setQrModalLink] = useState<CampaignLink | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState<Partial<CampaignLink>>({
    title: '',
    phone: '5511999999999',
    message: 'Olá! Vi o anúncio no {utm_source} ({utm_campaign}) e quero saber mais.',
    slug: '',
    utmSource: 'meta_ads',
    utmMedium: 'cpc',
    utmCampaign: 'campanha_agosto',
    utmContent: '',
    utmTerm: '',
    captureLeadForm: false,
    metaPixelId: '',
    googleAdsConversionId: '',
    googleAdsLabel: '',
    webhookUrl: ''
  });

  const handleOpenCreate = () => {
    setEditingLink(null);
    setFormData({
      title: '',
      phone: '5511999999999',
      message: 'Olá! Vi o anúncio no {utm_source} ({utm_campaign}) e quero saber mais.',
      slug: `wa-${Math.random().toString(36).substring(2, 8)}`,
      utmSource: 'meta_ads',
      utmMedium: 'cpc',
      utmCampaign: 'campanha_whatsapp',
      utmContent: '',
      utmTerm: '',
      captureLeadForm: false,
      metaPixelId: '',
      googleAdsConversionId: '',
      googleAdsLabel: '',
      webhookUrl: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (link: CampaignLink) => {
    setEditingLink(link);
    setFormData(link);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLink) {
      await onUpdateLink(editingLink.id, formData);
    } else {
      await onCreateLink(formData);
    }
    setIsModalOpen(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFullRedirectUrl = (slug: string, source?: string, campaign?: string) => {
    const origin = window.location.origin;
    let url = `${origin}/r/${slug}`;
    const params = new URLSearchParams();
    if (source) params.append('utm_source', source);
    if (campaign) params.append('utm_campaign', campaign);
    const paramStr = params.toString();
    return paramStr ? `${url}?${paramStr}` : url;
  };

  const filteredLinks = links.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.utmSource.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.utmCampaign.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Header & Link Builder Banner */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Gerador de Links WhatsApp e Parâmetros UTM
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Crie links de redirecionamento otimizados para WhatsApp com parâmetros UTM para Meta Ads, Google Search e TikTok.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Buscar por nome, slug, UTM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-blue-600"
            />

            <button
              onClick={handleOpenCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded transition flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              + Novo Link
            </button>
          </div>
        </div>
      </div>

      {/* Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLinks.map((link) => {
          const fullUrl = getFullRedirectUrl(link.slug, link.utmSource, link.utmCampaign);
          return (
            <div
              key={link.id}
              className="bg-white border border-slate-200 hover:border-slate-300 p-5 rounded-lg space-y-4 shadow-xs relative transition group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">{link.title}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-mono">
                      WhatsApp: {link.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(link)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition"
                    title="Editar Link"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteLink(link.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition"
                    title="Excluir Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* UTM Tags */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-200">
                  utm_source: {link.utmSource}
                </span>
                <span className="bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-200">
                  utm_campaign: {link.utmCampaign}
                </span>
                {link.utmContent && (
                  <span className="bg-slate-100 text-slate-700 font-mono px-2 py-0.5 rounded border border-slate-200">
                    utm_content: {link.utmContent}
                  </span>
                )}
              </div>

              {/* Message Preview */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Mensagem Padrão:</span>
                <p className="italic text-slate-600">"{link.message}"</p>
              </div>

              {/* URL Display and Quick Copy */}
              <div className="flex items-center justify-between bg-blue-50 p-3 rounded border border-blue-100">
                <span className="text-xs font-mono text-blue-800 truncate max-w-[340px] sm:max-w-[420px]">
                  {fullUrl}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => copyToClipboard(fullUrl, link.id)}
                    className="text-blue-700 font-bold text-xs hover:underline flex items-center gap-1"
                    title="Copiar Link"
                  >
                    {copiedId === link.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-[11px] text-green-600">COPIADO</span>
                      </>
                    ) : (
                      <span>COPIAR LINK</span>
                    )}
                  </button>

                  <a
                    href={fullUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-blue-700 hover:text-blue-900 rounded"
                    title="Testar Link"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => setQrModalLink(link)}
                    className="p-1 text-blue-700 hover:text-blue-900 rounded"
                    title="Gerar QR Code"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Counters */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4 font-medium">
                  <span>Cliques: <strong className="text-slate-900 font-mono">{link.clicksCount}</strong></span>
                  <span>Leads: <strong className="text-blue-600 font-mono">{link.leadsCount}</strong></span>
                  <span>Conversões: <strong className="text-green-600 font-mono">{link.conversionsCount}</strong></span>
                </div>
                <span className="text-[10px] text-slate-400">
                  {link.captureLeadForm ? 'Pré-formulário Ativo' : 'Redirecionamento Direto'}
                </span>
              </div>

            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT LINK MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-lg p-6 shadow-xl space-y-5 relative my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingLink ? 'Editar Link de Campanha' : 'Criar Novo Link de Campanha'}
                </h2>
                <p className="text-xs text-slate-500">Informe o número do WhatsApp de destino, mensagem personalizada e tags UTM.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Campaign Title & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nome da Campanha / Anúncio *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Meta Ads - Black Friday Stories"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Número do WhatsApp (DDD + Número) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 5511999999999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Slug Customizado */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Identificador Único (Slug) *</label>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-500">
                  <span className="text-slate-400 select-none">{window.location.origin}/r/</span>
                  <input
                    type="text"
                    required
                    placeholder="black_friday_24"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="bg-transparent text-blue-700 font-mono font-bold focus:outline-none w-full"
                  />
                </div>
              </div>

              {/* Message Template */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mensagem Inicial do WhatsApp</label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Olá! Vi a oferta no {utm_source} ({utm_campaign}) e quero tirar dúvidas."
                  className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 Variáveis dinâmicas: <code className="text-blue-600 font-mono">{'{utm_source}'}</code>, <code className="text-blue-600 font-mono">{'{utm_campaign}'}</code>
                </p>
              </div>

              {/* UTM Parameters Grid */}
              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Parâmetros de Rastreamento UTM</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Origem (utm_source)</label>
                    <input
                      type="text"
                      placeholder="meta_ads_br"
                      value={formData.utmSource}
                      onChange={(e) => setFormData({ ...formData, utmSource: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Mídia (utm_medium)</label>
                    <input
                      type="text"
                      placeholder="cpc, stories, feed"
                      value={formData.utmMedium}
                      onChange={(e) => setFormData({ ...formData, utmMedium: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-600 mb-1">Campanha (utm_campaign)</label>
                    <input
                      type="text"
                      placeholder="black_friday_24"
                      value={formData.utmCampaign}
                      onChange={(e) => setFormData({ ...formData, utmCampaign: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:border-blue-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      🎨 Anúncio Específico / Criativo (utm_content)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: video_depoimento_01 ou carrossel_oferta"
                      value={formData.utmContent}
                      onChange={(e) => setFormData({ ...formData, utmContent: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:border-blue-600"
                    />
                    <span className="text-[10px] text-slate-400">Nome do anúncio/criativo que o usuário clica</span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      🎯 Conjunto / Grupo de Anúncios (utm_term)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: lookalike_1pct ou interesses_marketing"
                      value={formData.utmTerm}
                      onChange={(e) => setFormData({ ...formData, utmTerm: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 font-mono focus:border-blue-600"
                    />
                    <span className="text-[10px] text-slate-400">Público-alvo / Grupo de Anúncios (AdSet)</span>
                  </div>
                </div>
              </div>

              {/* Modo de Captura e Redirecionamento (Popup vs Rastreamento Direto) */}
              <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3">
                <div>
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                    Modo de Experiência e Rastreamento do Link
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Escolha se deseja rastrear o lead silenciosamente ou solicitar preenchimento de nome e telefone.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Direct Tracking (No Popup) */}
                  <label
                    onClick={() => setFormData({ ...formData, captureLeadForm: false })}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition flex flex-col justify-between space-y-2 ${
                      !formData.captureLeadForm
                        ? 'bg-emerald-50/60 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        🚀 Rastreamento Direto (Sem Popup)
                      </span>
                      <input
                        type="radio"
                        name="captureMode"
                        checked={!formData.captureLeadForm}
                        onChange={() => setFormData({ ...formData, captureLeadForm: false })}
                        className="w-4 h-4 accent-emerald-600 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Redireciona direto para o WhatsApp. Rastreia UTMs, cidade/estado, dispositivo e dispara o Pixel/CAPI automaticamente <strong>sem nenhuma interrupção ou formulário</strong>.
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded self-start">
                      ⚡ Maior Taxa de Conversão
                    </span>
                  </label>

                  {/* Option 2: Pre-Form Popup */}
                  <label
                    onClick={() => setFormData({ ...formData, captureLeadForm: true })}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition flex flex-col justify-between space-y-2 ${
                      formData.captureLeadForm
                        ? 'bg-blue-50/60 border-blue-500 ring-1 ring-blue-500'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        📝 Com Popup de Captura (Nome + Zap)
                      </span>
                      <input
                        type="radio"
                        name="captureMode"
                        checked={formData.captureLeadForm}
                        onChange={() => setFormData({ ...formData, captureLeadForm: true })}
                        className="w-4 h-4 accent-blue-600 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Exibe um popup amigável solicitando Nome e WhatsApp do visitante antes de redirecioná-lo para a conversa.
                    </p>
                    <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded self-start">
                      🎯 Leads Qualificados
                    </span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2 rounded transition shadow-xs"
                >
                  {editingLink ? 'Salvar Alterações' : 'Criar Link'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* QR CODE MODAL */}
      {qrModalLink && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-lg p-6 shadow-xl text-center space-y-4">
            <h3 className="font-bold text-slate-900 text-base">QR Code da Campanha</h3>
            <p className="text-xs text-slate-500">{qrModalLink.title}</p>

            <div className="bg-white p-4 rounded border border-slate-200 inline-block mx-auto shadow-xs">
              <QRCodeSVG
                value={getFullRedirectUrl(qrModalLink.slug, qrModalLink.utmSource, qrModalLink.utmCampaign)}
                size={200}
                level="H"
              />
            </div>

            <p className="text-[11px] text-blue-800 font-mono bg-blue-50 p-2 rounded border border-blue-100 truncate">
              {getFullRedirectUrl(qrModalLink.slug, qrModalLink.utmSource, qrModalLink.utmCampaign)}
            </p>

            <button
              onClick={() => setQrModalLink(null)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2 rounded text-xs transition border border-slate-200"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
