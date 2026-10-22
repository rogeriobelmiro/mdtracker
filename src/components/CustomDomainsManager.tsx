import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  ShieldCheck, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  Check, 
  Copy, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  HelpCircle, 
  Sparkles,
  Server,
  Layers,
  ArrowRight,
  X,
  Lock
} from 'lucide-react';
import { Company, CustomDomain, DnsRecord } from '../types';
import { 
  fetchCustomDomains, 
  createCustomDomain, 
  verifyCustomDomain, 
  deleteCustomDomain 
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';

interface CustomDomainsManagerProps {
  currentCompany: Company;
}

export const CustomDomainsManager: React.FC<CustomDomainsManagerProps> = ({ currentCompany }) => {
  const { alert, confirm } = useDialog();

  const [domains, setDomains] = useState<CustomDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // New domain modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDomainInput, setNewDomainInput] = useState('');
  const [newDomainType, setNewDomainType] = useState<CustomDomain['type']>('landing_pages');
  const [isSaving, setIsSaving] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const loadDomains = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomDomains(currentCompany.id);
      setDomains(data);
    } catch (err: any) {
      console.error('Erro ao buscar domínios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, [currentCompany.id]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (e) {
      prompt('Copie o valor:', text);
    }
  };

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newDomainInput.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!clean || !clean.includes('.')) {
      await alert('Por favor, informe um domínio válido. Exemplo: lp.suaempresa.com.br');
      return;
    }

    try {
      setIsSaving(true);
      const created = await createCustomDomain({
        companyId: currentCompany.id,
        domain: clean,
        type: newDomainType
      });
      setDomains(prev => [created, ...prev]);
      setIsModalOpen(false);
      setNewDomainInput('');
      await alert(`Domínio "${clean}" cadastrado! Configure o apontamento CNAME na sua zona de DNS para ativar.`);
    } catch (err: any) {
      await alert('Erro ao adicionar domínio: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async (dom: CustomDomain, simulate = false) => {
    try {
      setVerifyingId(dom.id);
      const res = await verifyCustomDomain(dom.id, simulate);
      setDomains(prev => prev.map(d => d.id === dom.id ? res.domain : d));
      if (res.verified) {
        await alert(res.message || '✅ Domínio verificado com sucesso e SSL ativo!');
      } else {
        await alert(res.message || '⏳ Apontamento DNS ainda não detectado. A propagação do DNS pode levar até 24h.');
      }
    } catch (err: any) {
      await alert('Erro ao verificar domínio: ' + err.message);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDelete = async (dom: CustomDomain) => {
    const ok = await confirm(`Deseja remover o domínio "${dom.domain}"? Suas landing pages deixarão de responder por esta URL.`);
    if (!ok) return;

    try {
      await deleteCustomDomain(dom.id);
      setDomains(prev => prev.filter(d => d.id !== dom.id));
      await alert('Domínio removido com sucesso.');
    } catch (err: any) {
      await alert('Erro ao excluir domínio: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-blue-200 border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Domínio Próprio & Certificado SSL Gratuito</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Configuração de Domínio & DNS
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
              Use sua própria marca em todas as Landing Pages e links de rastreio (ex: <code className="bg-black/30 px-2 py-0.5 rounded text-amber-300">lp.suaempresa.com.br</code>). Aumente a autoridade, confiança e taxa de cliques dos seus anúncios.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-5 py-3 rounded-2xl transition text-sm flex items-center gap-2 shadow-lg shadow-black/15"
            >
              <Plus className="w-4 h-4" />
              <span>Adicionar Domínio</span>
            </button>
          </div>
        </div>
      </div>

      {/* DNS Instructions Guide */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Como configurar seu DNS (Passo a Passo)</h2>
            <p className="text-sm text-slate-600 leading-relaxed mt-0.5">
              Acesse o painel onde você registrou seu domínio (ex: Registro.br, Cloudflare, GoDaddy, Hostinger) e crie um registro CNAME conforme a tabela abaixo:
            </p>
          </div>
        </div>

        {/* DNS Records Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-extrabold tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tipo</th>
                <th className="py-3 px-4">Nome / Host / Subdomínio</th>
                <th className="py-3 px-4">Destino / Valor / Apontamento</th>
                <th className="py-3 px-4">TTL</th>
                <th className="py-3 px-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm font-medium text-slate-700">
              <tr className="hover:bg-slate-50/50">
                <td className="py-3.5 px-4 font-bold text-blue-600">CNAME</td>
                <td className="py-3.5 px-4 font-mono text-slate-900 font-bold">
                  lp <span className="text-slate-400 font-normal">(ou links, oferta, promo)</span>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-900 font-bold flex items-center gap-2">
                  <span>cname.vercel-dns.com</span>
                  <button 
                    onClick={() => handleCopy('cname.vercel-dns.com')}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500"
                    title="Copiar Valor"
                  >
                    {copiedText === 'cname.vercel-dns.com' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </td>
                <td className="py-3.5 px-4 text-slate-500">Automático ou 3600</td>
                <td className="py-3.5 px-4 text-right">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Recomendado
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Hints */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <strong className="block text-slate-900 font-bold mb-1">Registro.br</strong>
            Em "Configurar Endereçamento", clique em "+ Record", escolha <strong>CNAME</strong>, no nome coloque <code className="text-blue-600">lp</code> e no destino <code className="text-blue-600">cname.vercel-dns.com</code>.
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <strong className="block text-slate-900 font-bold mb-1">Cloudflare</strong>
            Adicione registro <strong>CNAME</strong> com nome <code className="text-blue-600">lp</code>, destino <code className="text-blue-600">cname.vercel-dns.com</code> e defina o Proxy como <em>Apenas DNS (Cinza)</em>.
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <strong className="block text-slate-900 font-bold mb-1">Hostinger / GoDaddy</strong>
            No Editor de Zona DNS, crie CNAME apontando para <code className="text-blue-600">cname.vercel-dns.com</code> com TTL padrão.
          </div>
        </div>
      </div>

      {/* Domains List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Seus Domínios Configurados</span>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              {domains.length}
            </span>
          </h2>

          <button
            onClick={loadDomains}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar Status</span>
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
            <span>Carregando domínios...</span>
          </div>
        ) : domains.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Globe className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Nenhum domínio próprio cadastrado</h3>
            <p className="text-xs text-slate-500 mb-4">
              Adicione um subdomínio para personalizar os links das suas Landing Pages.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl text-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Meu Primeiro Domínio</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {domains.map(dom => {
              const isActive = dom.status === 'active';
              return (
                <div 
                  key={dom.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs transition space-y-4 ${
                    isActive ? 'border-emerald-200 shadow-emerald-500/5' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-slate-900">
                          {dom.domain}
                        </span>
                        {dom.sslActive && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Lock className="w-3 h-3" /> SSL Ativo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="capitalize">{dom.type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Cadastrado em {new Date(dom.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isActive 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isActive ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Ativo</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          <span>Pendente DNS</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* DNS Record Status */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs font-mono space-y-1">
                    <div className="text-[11px] font-sans font-bold text-slate-400 uppercase">Apontamento Configurado:</div>
                    <div className="text-slate-800 flex items-center justify-between">
                      <span>CNAME &rarr; cname.vercel-dns.com</span>
                      <span className={isActive ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                        {isActive ? '✓ Validado' : '⏳ Aguardando'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerify(dom, false)}
                        disabled={verifyingId === dom.id}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${verifyingId === dom.id ? 'animate-spin' : ''}`} />
                        <span>Verificar DNS</span>
                      </button>

                      {/* Quick simulation helper for user testing */}
                      {!isActive && (
                        <button
                          onClick={() => handleVerify(dom, true)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[11px] font-semibold transition"
                          title="Simula verificação instantânea para testes"
                        >
                          Simular Ativação
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <a
                        href={`https://${dom.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Abrir no Navegador"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(dom)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir Domínio"
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
      </div>

      {/* ADD DOMAIN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Adicionar Domínio Próprio</h3>
                  <p className="text-xs text-slate-500">Configure um subdomínio para suas páginas.</p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDomain} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Seu Domínio ou Subdomínio *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: lp.suaempresa.com.br"
                  value={newDomainInput}
                  onChange={e => setNewDomainInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Recomendamos criar um subdomínio como <code className="text-blue-600 font-bold">lp</code> ou <code className="text-blue-600 font-bold">links</code>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Finalidade do Domínio
                </label>
                <select
                  value={newDomainType}
                  onChange={e => setNewDomainType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="landing_pages">Landing Pages & Páginas de Captura</option>
                  <option value="tracking_links">Links de Rastreio do WhatsApp</option>
                  <option value="all">Todas as Funcionalidades (Híbrido)</option>
                </select>
              </div>

              <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-100 text-xs text-blue-900 space-y-1">
                <strong>Próximo Passo:</strong>
                <p>Após salvar, você deverá apontar o CNAME <code className="font-bold text-blue-700">cname.vercel-dns.com</code> na sua zona DNS.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold text-xs hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Salvar Domínio</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
