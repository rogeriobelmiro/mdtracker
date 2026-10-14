import React, { useState } from 'react';
import { 
  Sparkles, Copy, Check, Send, Mail, MessageSquare, Target, 
  Layers, RefreshCw, Key, ChevronRight, Zap, Info, ArrowUpRight,
  Sliders, ShieldCheck, HeartHandshake, Flame, Briefcase
} from 'lucide-react';
import { AICopyType, AICopyTone, AIGeneratedContent, Product, Company } from '../types';
import { generateAICopy } from '../services/api';
import { useDialog } from '../contexts/DialogContext';

interface AICopywriterManagerProps {
  products: Product[];
  currentCompany: Company;
  onNavigateToTab?: (tab: any) => void;
}

export const AICopywriterManager: React.FC<AICopywriterManagerProps> = ({
  products,
  currentCompany,
  onNavigateToTab
}) => {
  const { alert } = useDialog();

  // Mode Selection
  const [selectedType, setSelectedType] = useState<AICopyType>('headlines');
  const [productName, setProductName] = useState(products.length > 0 ? products[0].name : '');
  const [targetAudience, setTargetAudience] = useState('Empreendedores e tomadores de decisão');
  const [tone, setTone] = useState<AICopyTone>('persuasive');
  const [extraContext, setExtraContext] = useState('');
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('mdt_gemini_key') || '');
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Loading & State
  const [generating, setGenerating] = useState(false);
  const [content, setContent] = useState<AIGeneratedContent | null>(null);
  const [history, setHistory] = useState<AIGeneratedContent[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleGenerate = async () => {
    if (!productName.trim()) {
      await alert('Por favor, informe o nome do produto ou serviço.');
      return;
    }

    setGenerating(true);
    try {
      if (customApiKey) {
        localStorage.setItem('mdt_gemini_key', customApiKey.trim());
      }

      const res = await generateAICopy({
        companyId: currentCompany.id,
        type: selectedType,
        productName: productName.trim(),
        targetAudience: targetAudience.trim(),
        tone,
        extraContext: extraContext.trim(),
        apiKey: customApiKey.trim() || undefined
      });

      setContent(res);
      setHistory(prev => [res, ...prev.slice(0, 9)]);
    } catch (err: any) {
      await alert('Erro ao gerar com IA: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const copyTypes = [
    { id: 'headlines', label: 'Títulos & Headlines', icon: Flame, desc: 'Títulos com gatilhos mentais para pop-ups, anúncios e páginas' },
    { id: 'ctas', label: 'CTAs de Alto Impacto', icon: Target, desc: 'Chamadas para ação que maximizam taxa de clique e conversão' },
    { id: 'email', label: 'E-mail de Conversão', icon: Mail, desc: 'E-mails de nutrição, boas-vindas e reengajamento completos' },
    { id: 'whatsapp', label: 'Scripts para WhatsApp', icon: MessageSquare, desc: 'Abordagens humanizadas para primeiro contato e fechamento' },
    { id: 'smart_lists', label: 'Listas Inteligentes', icon: Layers, desc: 'Estratégia de segmentação para CRM e campanhas' }
  ];

  const toneOptions = [
    { id: 'persuasive', label: 'Persuasivo & Direto', icon: Zap },
    { id: 'professional', label: 'Corporativo & Sério', icon: Briefcase },
    { id: 'urgent', label: 'Urgente & Promocional', icon: Flame },
    { id: 'friendly', label: 'Amigável & Empático', icon: HeartHandshake }
  ];

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-500" />
              Estúdio de IA & Copywriting
            </h1>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Google Gemini
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Crie copys profissionais no nível dos melhores redatores do mercado. Gere títulos magnéticos, 
            e-mails persuasivos, scripts para WhatsApp e segmentações inteligentes para o seu CRM.
          </p>
        </div>

        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-2 rounded-lg transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Key className="w-3.5 h-3.5 text-slate-500" />
          {customApiKey ? 'Chave Gemini Configurada' : 'Configurar Chave Gemini'}
        </button>
      </div>

      {/* API Key Drawer (Optional) */}
      {showKeyInput && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="space-y-1 w-full sm:w-auto">
            <p className="font-bold flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-600" />
              Chave de API do Google Gemini (Opcional)
            </p>
            <p className="text-[11px] text-amber-800">
              O sistema possui um motor inteligente embutido. Se desejar usar sua própria cota gratuita do Google AI Studio, cole sua chave abaixo:
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="password"
              placeholder="Cole sua GEMINI_API_KEY..."
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              className="bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 w-full sm:w-64 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={() => {
                localStorage.setItem('mdt_gemini_key', customApiKey.trim());
                setShowKeyInput(false);
              }}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg transition whitespace-nowrap cursor-pointer"
            >
              Salvar
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Generator Controls (Left) vs Output Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Controls Column (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Format Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. O que você deseja gerar?
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {copyTypes.map(item => {
                const Icon = item.icon;
                const isSelected = selectedType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedType(item.id as AICopyType)}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-start gap-3 cursor-pointer ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs' 
                        : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100/80 hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parameters Form */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Parâmetros da Oferta
            </label>

            {/* Product selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Produto ou Serviço *</label>
                {products.length > 0 && (
                  <span className="text-[10px] text-slate-400">Puxado do seu catálogo</span>
                )}
              </div>
              {products.length > 0 ? (
                <div className="space-y-1.5">
                  <select
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.name}>{p.name} (R$ {Number(p.price).toFixed(2)})</option>
                    ))}
                    <option value="__custom__">+ Digitar outro produto/serviço</option>
                  </select>
                  {productName === '__custom__' && (
                    <input
                      type="text"
                      placeholder="Nome do produto ou serviço..."
                      onChange={(e) => setProductName(e.target.value)}
                      className="w-full bg-white border border-blue-400 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none"
                    />
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Ex: Consultoria de Vendas B2B ou Plano Anual VIP"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              )}
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Público-Alvo</label>
              <input
                type="text"
                placeholder="Ex: Médicos, donos de pequenas empresas, estudantes..."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Tone of Voice */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tom de Voz</label>
              <div className="grid grid-cols-2 gap-1.5">
                {toneOptions.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTone(t.id as AICopyTone)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition cursor-pointer flex items-center gap-1.5 ${
                      tone === t.id
                        ? 'bg-blue-600 text-white font-bold border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Extra context / details */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Gatilhos ou Detalhes Especiais (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Desconto de 15% válido até sexta; bônus de consultoria gratuita; garantia de 30 dias..."
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold py-3 px-4 rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {generating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Gerando com IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Gerar com Google Gemini
                </>
              )}
            </button>

          </div>

        </div>

        {/* Results Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {content ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 animate-in fade-in duration-200">
              
              {/* Output Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg border border-amber-200">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{content.title}</h3>
                    <p className="text-[10px] text-slate-400">
                      Gerado para: <strong>{productName}</strong> • Tom: {tone}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="text-xs text-slate-500 hover:text-blue-600 flex items-center gap-1 font-semibold p-1 rounded hover:bg-slate-50 transition cursor-pointer"
                  title="Gerar novas variações"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
                  Recriar
                </button>
              </div>

              {/* Render: Email format */}
              {content.emailBody && (
                <div className="space-y-4">
                  {/* Email Subject Box */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Assunto do E-mail</span>
                      <button
                        onClick={() => handleCopy(content.emailSubject || '', 'subject')}
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === 'subject' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === 'subject' ? 'Copiado' : 'Copiar'}
                      </button>
                    </div>
                    <p className="text-sm font-bold text-slate-900">{content.emailSubject}</p>
                    {content.emailPreview && (
                      <p className="text-xs text-slate-500 italic pt-1">
                        Preheader: {content.emailPreview}
                      </p>
                    )}
                  </div>

                  {/* Email Body Box */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Corpo do E-mail</span>
                      <button
                        onClick={() => handleCopy(content.emailBody || '', 'body')}
                        className="text-[11px] text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === 'body' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedId === 'body' ? 'Copiado!' : 'Copiar E-mail Completo'}
                      </button>
                    </div>
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                      {content.emailBody}
                    </pre>
                  </div>
                </div>
              )}

              {/* Render: Items list (Headlines, CTAs, WhatsApp, Smart Lists) */}
              {content.items && content.items.length > 0 && (
                <div className="space-y-2.5">
                  {content.items.map((item, index) => {
                    const itemKey = `item-${index}`;
                    return (
                      <div 
                        key={index}
                        className="p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-200 transition flex items-start justify-between gap-3 group"
                      >
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <p className="text-xs text-slate-800 font-medium leading-relaxed">
                            {item}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopy(item, itemKey)}
                          className="text-slate-400 group-hover:text-blue-600 p-1.5 rounded-lg hover:bg-white transition cursor-pointer shrink-0"
                          title="Copiar texto"
                        >
                          {copiedId === itemKey ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Strategy Tips */}
              {content.strategyTips && content.strategyTips.length > 0 && (
                <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200/70 space-y-1.5">
                  <p className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wider">
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    Dicas de Especialista & CRO
                  </p>
                  <ul className="list-disc pl-5 text-xs text-blue-800 space-y-1">
                    {content.strategyTips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          ) : (
            /* Empty State */
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200 shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Seu gerador de copys está pronto</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                Selecione o formato desejado ao lado (títulos, e-mail, WhatsApp ou CTAs), ajuste os parâmetros e clique em <strong>Gerar com Google Gemini</strong>.
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-3 gap-2 mt-8 w-full max-w-md text-left">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-700">Fórmulas AIDA/PAS</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Estrutura comprovada</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-700">Multi-Formato</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">E-mail, Whats, Ads</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-700">1-Clique</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Cópia instantânea</p>
                </div>
              </div>
            </div>
          )}

          {/* History of Recent Generations */}
          {history.length > 1 && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Histórico Desta Sessão</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {history.map((hist, i) => (
                  <button
                    key={hist.id}
                    onClick={() => setContent(hist)}
                    className={`px-3 py-1.5 rounded-lg border text-left whitespace-nowrap transition cursor-pointer ${
                      content?.id === hist.id
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    #{i + 1} {hist.title.substring(0, 24)}...
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
