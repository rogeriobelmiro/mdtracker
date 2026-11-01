import React, { useState, useEffect } from 'react';
import { 
  Users, 
  GraduationCap, 
  Sparkles, 
  HelpCircle, 
  Copy, 
  Check, 
  QrCode, 
  MessageCircle, 
  Share2, 
  ExternalLink, 
  Building2, 
  CreditCard, 
  ShieldCheck, 
  RefreshCw, 
  Search, 
  Filter, 
  Phone, 
  Calendar, 
  ArrowUpRight, 
  Play, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download, 
  AlertCircle, 
  Send, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Wrench, 
  Bug, 
  DollarSign, 
  Award,
  Layers,
  ChevronRight,
  TrendingUp,
  X
} from 'lucide-react';
import { User, Company, Affiliate, ProductRelease, SupportTicket, TrainingVideo } from '../types';
import { 
  fetchAffiliatePortalData, 
  updateAffiliatePixKey, 
  fetchProductReleases, 
  fetchSupportTickets, 
  createSupportTicket 
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';

interface AffiliatePortalProps {
  currentUser: User;
  currentCompany: Company;
  initialTab?: 'clients' | 'trainings' | 'news' | 'support';
  onNavigateToTab?: (tab: string) => void;
}

const DEFAULT_TRAINING_VIDEOS: TrainingVideo[] = [
  {
    id: 'vid-001',
    title: 'Pitch Comercial de 15 Minutos para Fechar com Empresas e Clínicas',
    module: 'Módulo 1: Apresentação & Vendas',
    duration: '14:20 min',
    description: 'Aprenda a demonstrar o TrackerMD ao vivo para donos de negócios e clínicas, destacando a prevenção de bloqueios e a clareza de saber qual anúncio gerou a venda no WhatsApp.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    tags: ['Vendas', 'Demonstração', 'Scripts'],
    isCompleted: true,
    downloadUrl: '#'
  },
  {
    id: 'vid-002',
    title: 'Quebra de Objeções: "Já tenho WhatsApp Business Comum"',
    module: 'Módulo 1: Apresentação & Vendas',
    duration: '11:45 min',
    description: 'Como explicar a diferença entre o aplicativo gratuito e uma plataforma profissional com multiatendimento, CAPI Meta Ads e isolamento de equipe.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    tags: ['Objeções', 'Abordagem Comercial'],
    isCompleted: false,
    downloadUrl: '#'
  },
  {
    id: 'vid-003',
    title: 'Configuração do Meta Ads CAPI Passo a Passo',
    module: 'Módulo 2: Configuração Técnica & Meta CAPI',
    duration: '22:10 min',
    description: 'Passo a passo prático para gerar o Token de Acesso permanente no Gerenciador de Negócios da Meta, configurar o Pixel e validar os disparos de Lead e Purchase.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    tags: ['Meta CAPI', 'Pixel', 'Técnico'],
    isCompleted: false,
    downloadUrl: '#'
  },
  {
    id: 'vid-004',
    title: 'Conexão das Instâncias de WhatsApp via QR Code & Estabilidade',
    module: 'Módulo 2: Configuração Técnica & Meta CAPI',
    duration: '16:05 min',
    description: 'Como parear a instância do cliente sem oscilações, melhores práticas de aquecimento de chip e como recuperar instâncias desconectadas.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    tags: ['WhatsApp', 'QR Code', 'Instâncias'],
    isCompleted: false,
    downloadUrl: '#'
  },
  {
    id: 'vid-005',
    title: 'Roteiro de Treinamento VIP de 2 Horas com a Equipe do Cliente (Taxa R$ 997)',
    module: 'Módulo 3: Implantação & Sucesso do Cliente',
    duration: '28:40 min',
    description: 'Metodologia completa para você conduzir a aula ao vivo com os atendentes e gerentes da empresa cliente, garantindo engajamento e fidelidade mensal.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    tags: ['Implantação', 'Onboarding VIP', 'Treinamento'],
    isCompleted: false,
    downloadUrl: '#'
  },
  {
    id: 'vid-006',
    title: 'Gestão Financeira, Comissões Mensais (20%) e Repasse PIX',
    module: 'Módulo 4: Gestão do Representante & Escala',
    duration: '12:30 min',
    description: 'Como funciona a divisão das mensalidades recorrentes na Hotmart, prazos de liquidação e recebimento automático das suas comissões via PIX.',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ',
    tags: ['Comissões', 'PIX', 'Financeiro'],
    isCompleted: false,
    downloadUrl: '#'
  }
];

export const AffiliatePortal: React.FC<AffiliatePortalProps> = ({
  currentUser,
  currentCompany,
  initialTab = 'clients',
  onNavigateToTab
}) => {
  const { alert, confirm, success } = useDialog();
  const [activeTab, setActiveTab] = useState<'clients' | 'trainings' | 'news' | 'support'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Affiliate & Clients Data State
  const [loading, setLoading] = useState(true);
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [allAffiliates, setAllAffiliates] = useState<Affiliate[]>([]);
  const [selectedAffiliateId, setSelectedAffiliateId] = useState<string>('');
  const [referralLink, setReferralLink] = useState('');
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    trialCompanies: 0,
    totalEstimatedMonthly: 0,
    totalEstimatedSetup: 0
  });
  const [companies, setCompanies] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'trial' | 'expired'>('all');

  // Copy Link State
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // PIX Modal State
  const [showPixModal, setShowPixModal] = useState(false);
  const [editPixType, setEditPixType] = useState('cpf');
  const [editPixKey, setEditPixKey] = useState('');
  const [savingPix, setSavingPix] = useState(false);

  // Training Videos State
  const [videos, setVideos] = useState<TrainingVideo[]>(DEFAULT_TRAINING_VIDEOS);
  const [activeVideo, setActiveVideo] = useState<TrainingVideo>(DEFAULT_TRAINING_VIDEOS[0]);

  // Product Releases State
  const [releases, setReleases] = useState<ProductRelease[]>([]);
  const [loadingReleases, setLoadingReleases] = useState(false);
  const [releaseFilter, setReleaseFilter] = useState<'all' | 'released' | 'in_progress' | 'planned'>('all');

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketType, setTicketType] = useState<'support' | 'suggestion' | 'bug' | 'commercial'>('support');
  const [ticketPriority, setTicketPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Expanded FAQ State
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Load Portal Data
  const loadPortalData = async (targetAffId?: string) => {
    setLoading(true);
    try {
      const data = await fetchAffiliatePortalData(currentUser.email, targetAffId || selectedAffiliateId);
      if (data.affiliate) {
        setAffiliate(data.affiliate);
        setReferralLink(data.referralLink || `https://trackermd.mudadigital.com.br/?ref=${data.affiliate.referralCode}`);
        setEditPixType(data.affiliate.pixKeyType || 'cpf');
        setEditPixKey(data.affiliate.pixKey || '');
      }
      if (data.allAffiliates) {
        setAllAffiliates(data.allAffiliates);
      }
      if (data.stats) {
        setStats(data.stats);
      }
      if (Array.isArray(data.companies)) {
        setCompanies(data.companies);
      }
    } catch (err: any) {
      console.warn('Erro ao carregar dados do portal do afiliado:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load Releases
  const loadReleasesData = async () => {
    setLoadingReleases(true);
    try {
      const data = await fetchProductReleases();
      setReleases(data);
    } catch (err: any) {
      console.warn('Erro ao carregar novidades:', err.message);
    } finally {
      setLoadingReleases(false);
    }
  };

  // Load Tickets
  const loadTicketsData = async () => {
    setLoadingTickets(true);
    try {
      const data = await fetchSupportTickets(currentUser.email, affiliate?.id);
      setTickets(data);
    } catch (err: any) {
      console.warn('Erro ao carregar chamados:', err.message);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadPortalData();
    loadReleasesData();
    loadTicketsData();
  }, []);

  const handleCopyLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `Olá! Conheça a TrackerMD, a plataforma oficial para rastrear vendas e conversões no WhatsApp e enviar dados direto para o Meta Ads CAPI:\n\n${referralLink}\n\nFaça seu teste gratuito agora mesmo!`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleSavePix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliate?.id || !editPixKey.trim()) {
      await alert('Por favor, informe sua chave PIX para repasse.');
      return;
    }

    setSavingPix(true);
    try {
      await updateAffiliatePixKey(affiliate.id, editPixType, editPixKey.trim());
      await success('Chave PIX atualizada com sucesso!');
      setShowPixModal(false);
      loadPortalData(affiliate.id);
    } catch (err: any) {
      await alert(err.message || 'Erro ao salvar chave PIX');
    } finally {
      setSavingPix(false);
    }
  };

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) {
      await alert('Por favor, preencha o assunto e a mensagem do chamado.');
      return;
    }

    setSubmittingTicket(true);
    try {
      await createSupportTicket({
        affiliateId: affiliate?.id,
        authorName: affiliate?.name || currentUser.name,
        authorEmail: currentUser.email,
        authorPhone: affiliate?.phone || '',
        type: ticketType,
        priority: ticketPriority,
        subject: ticketSubject.trim(),
        message: ticketMessage.trim()
      });
      await success('Chamado enviado com sucesso! Nossa equipe técnica já foi notificada.');
      setTicketSubject('');
      setTicketMessage('');
      loadTicketsData();
    } catch (err: any) {
      await alert(err.message || 'Erro ao registrar chamado');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleDirectWhatsAppSupport = () => {
    const typeLabel = 
      ticketType === 'bug' ? 'Relato de Correção / Bug' :
      ticketType === 'suggestion' ? 'Sugestão de Nova Função' :
      ticketType === 'commercial' ? 'Dúvida Comercial / Comissões' : 'Suporte Técnico';

    const text = encodeURIComponent(
      `Olá Rogério! Sou o representante ${affiliate?.name || currentUser.name} (${affiliate?.city || ''}/${affiliate?.state || ''}) no TrackerMD.\n\n*Tipo:* ${typeLabel}\n*Prioridade:* ${ticketPriority.toUpperCase()}\n*Assunto:* ${ticketSubject || 'Suporte Técnico'}\n\n${ticketMessage || 'Gostaria de tirar uma dúvida sobre a ferramenta.'}`
    );
    window.open(`https://wa.me/5565981150758?text=${text}`, '_blank');
  };

  // Filtered Companies
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.responsibleName && c.responsibleName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.cnpj && c.cnpj.includes(searchTerm));

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? c.subscriptionStatus === 'active' :
      statusFilter === 'trial' ? c.subscriptionStatus === 'trial' :
      c.subscriptionStatus !== 'active' && c.subscriptionStatus !== 'trial';

    return matchesSearch && matchesStatus;
  });

  // Filtered Releases
  const filteredReleases = releases.filter(r => {
    if (releaseFilter === 'all') return true;
    return r.status === releaseFilter;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================= */}
      {/* HEADER: PORTAL DO AFILIADO & REPRESENTANTE */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white relative shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Representante Credenciado Ativo</span>
              </span>
              {affiliate?.city && affiliate?.state && (
                <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                  📍 {affiliate.city} - {affiliate.state}
                </span>
              )}
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-bold">
                Cod: {affiliate?.referralCode || 'rep'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Olá, {affiliate?.name || currentUser.name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Bem-vindo ao seu painel oficial de representante TrackerMD. Acompanhe seus clientes vinculados, suas comissões mensais recorrentes (20%), capacitação técnica em vídeo e novidades da ferramenta.
            </p>
          </div>

          {/* Quick Referral Box */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shrink-0 max-w-md w-full space-y-3 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5" /> Seu Link Oficial de Indicação
              </span>
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="text-[10px] text-slate-300 hover:text-white flex items-center gap-1 font-semibold"
                title="Exibir QR Code para clientes"
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-400" />
                QR Code
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 transition shadow-sm"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="flex-1 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-emerald-500/30 transition"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Divulgar no WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPixModal(true)}
                className="py-2 px-3 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1 border border-slate-600/50 transition"
                title="Configurar chave PIX de recebimento"
              >
                <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                <span>Chave PIX</span>
              </button>
            </div>
          </div>

        </div>

        {/* Super Admin Switcher for Testing (only visible for rogerio@mudadigital.com.br) */}
        {allAffiliates.length > 0 && currentUser.email === 'rogerio@mudadigital.com.br' && (
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-amber-400 font-bold flex items-center gap-1.5">
              👑 Modo Super-Admin: Alternar Visualização de Representante
            </span>
            <div className="flex items-center gap-2">
              <select
                value={selectedAffiliateId || affiliate?.id || ''}
                onChange={(e) => {
                  setSelectedAffiliateId(e.target.value);
                  loadPortalData(e.target.value);
                }}
                className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none"
              >
                {allAffiliates.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.city}/{a.state}) - {a.referralCode}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================= */}
      {/* 4 MENU TABS */}
      {/* ========================================================= */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2 sm:gap-4 overflow-x-auto pb-px">
        
        <button
          onClick={() => setActiveTab('clients')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'clients'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Meus Clientes Vinculados</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-mono">
            {stats.totalCompanies}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('trainings')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'trainings'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Vídeos de Treinamento</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 font-bold uppercase">
            Aulas VIP
          </span>
        </button>

        <button
          onClick={() => setActiveTab('news')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'news'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Novidades & Lançamentos</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold uppercase">
            Roadmap
          </span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 whitespace-nowrap transition ${
            activeTab === 'support'
              ? 'border-amber-600 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Suporte, Sugestões & Dicas</span>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-bold uppercase">
            24h
          </span>
        </button>

      </div>

      {/* ========================================================= */}
      {/* TAB 1: MEUS CLIENTES VINCULADOS */}
      {/* ========================================================= */}
      {activeTab === 'clients' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Total de Clientes Indicados</span>
                <Building2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {stats.totalCompanies} <span className="text-xs font-normal text-slate-400">empresas</span>
              </div>
              <p className="text-[11px] text-slate-500">Cadastradas com seu link de indicação</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Em Teste Gratuito (Trial)</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {stats.trialCompanies} <span className="text-xs font-normal text-slate-400">testando</span>
              </div>
              <p className="text-[11px] text-slate-500">Oportunidade para oferecer implantação</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-semibold">
                <span>Assinaturas Ativas</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {stats.activeCompanies} <span className="text-xs font-normal text-slate-400">pagantes</span>
              </div>
              <p className="text-[11px] text-slate-500">Gerando comissão recorrente mensal</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-900 border border-emerald-800/60 p-5 rounded-2xl shadow-sm space-y-2 text-white">
              <div className="flex items-center justify-between text-emerald-300 text-xs font-bold">
                <span>Comissão Mensal Recorrente</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-300">
                {formatCurrency(stats.totalEstimatedMonthly)}
                <span className="text-xs font-normal text-slate-300">/mês</span>
              </div>
              <p className="text-[11px] text-emerald-400/80">
                20% sobre as mensalidades dos clientes ativos
              </p>
            </div>

          </div>

          {/* Table Header & Search Filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Lista de Clientes Associados
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Todas as empresas vinculadas ao seu código de indicação ({affiliate?.referralCode})
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar empresa, responsável..."
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
                  />
                </div>

                {/* Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none font-semibold"
                >
                  <option value="all">Todos os Status</option>
                  <option value="active">Assinaturas Ativas</option>
                  <option value="trial">Em Período de Testes</option>
                  <option value="expired">Pendentes / Expiradas</option>
                </select>
              </div>
            </div>

            {/* Clients Table */}
            {filteredCompanies.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Nenhum cliente encontrado com os filtros atuais
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Compartilhe seu link de afiliado oficial para cadastrar empresas em sua cidade e começar a receber comissões recorrentes.
                </p>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar Link de Indicação</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <th className="pb-3 px-2">Empresa</th>
                      <th className="pb-3 px-2">Contato / Responsável</th>
                      <th className="pb-3 px-2">Data Cadastro</th>
                      <th className="pb-3 px-2">Plano Escolhido</th>
                      <th className="pb-3 px-2">Status Assinatura</th>
                      <th className="pb-3 px-2">Treinamento VIP</th>
                      <th className="pb-3 px-2 text-right">Comissão Mensal</th>
                      <th className="pb-3 px-2 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                    {filteredCompanies.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                        
                        <td className="py-3 px-2">
                          <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                          {c.cnpj && (
                            <div className="text-[10px] text-slate-400 font-mono">{c.cnpj}</div>
                          )}
                        </td>

                        <td className="py-3 px-2">
                          <div>{c.responsibleName}</div>
                          {c.phone && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{c.phone}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-2 text-slate-500 text-[11px]">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-BR') : '-'}
                        </td>

                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px]">
                            {c.plan}
                          </span>
                        </td>

                        <td className="py-3 px-2">
                          {c.subscriptionStatus === 'active' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              Ativa
                            </span>
                          ) : c.subscriptionStatus === 'trial' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-bold">
                              <Clock className="w-3 h-3" />
                              Em Teste (1d)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 text-[10px] font-bold">
                              <AlertCircle className="w-3 h-3" />
                              Expirada / Pendente
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-2">
                          {c.trainingCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <GraduationCap className="w-3.5 h-3.5" />
                              <span>Concluído (+R$498)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Pendente</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-2 text-right font-black text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(c.estimatedMonthlyCommission)}/mês
                        </td>

                        <td className="py-3 px-2 text-center">
                          {c.phone ? (
                            <a
                              href={`https://wa.me/${c.phone.replace(/\D/g, '')}?text=${encodeURIComponent(
                                `Olá ${c.responsibleName}! Sou o representante TrackerMD (${affiliate?.name || ''}). Como estão os testes e a configuração do seu WhatsApp na plataforma?`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition shadow-sm"
                              title="Chamar no WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                              <span>WhatsApp</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400">-</span>
                          )}
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: VÍDEOS DE TREINAMENTO DA FERRAMENTA */}
      {/* ========================================================= */}
      {activeTab === 'trainings' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Video Player & Overview (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl aspect-video relative flex items-center justify-center text-white">
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                      {activeVideo.module}
                    </span>
                    <h3 className="text-lg font-black text-white max-w-lg mx-auto">
                      {activeVideo.title}
                    </h3>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-semibold">
                    ⏱️ Duração: {activeVideo.duration}
                  </span>
                </div>
              </div>

              {/* Active Video Details */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                    {activeVideo.module}
                  </span>
                  <div className="flex items-center gap-2">
                    {activeVideo.tags.map((t, ti) => (
                      <span key={ti} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-semibold">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {activeVideo.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeVideo.description}
                </p>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Material complementar disponível para download.
                  </span>
                  <a
                    href="https://wa.me/5565981150758?text=Olá Rogério! Estou assistindo ao módulo de treinamento e gostaria de tirar dúvidas."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Dúvidas sobre esta aula? Falar com Rogério</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Modules & Playlist (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    Trilhas de Capacitação Oficial
                  </h4>
                  <span className="text-xs font-bold text-slate-500">
                    {videos.length} aulas
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {videos.map((vid, idx) => {
                    const isSelected = vid.id === activeVideo.id;
                    return (
                      <div
                        key={vid.id}
                        onClick={() => setActiveVideo(vid)}
                        className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                          isSelected
                            ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-sm'
                            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block truncate">
                            Aula {idx + 1} • {vid.duration}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2">
                            {vid.title}
                          </h5>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Downloadable Materials Box */}
              <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-800/60 rounded-3xl p-6 text-white space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">Kit Oficial de Apoio em PDF</h4>
                    <p className="text-[11px] text-slate-300">Apresentações e scripts para download</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="font-semibold text-slate-200">📊 Slides Comerciais TrackerMD (PDF)</span>
                    <button 
                      onClick={() => alert('Download do material oficial liberado no seu treinamento online!')}
                      className="text-indigo-400 hover:text-white p-1"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="font-semibold text-slate-200">📝 Script de Abordagem e Fechamento</span>
                    <button 
                      onClick={() => alert('Download do material oficial liberado no seu treinamento online!')}
                      className="text-indigo-400 hover:text-white p-1"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="font-semibold text-slate-200">🛠️ Checklist de Implantação e CAPI Meta</span>
                    <button 
                      onClick={() => alert('Download do material oficial liberado no seu treinamento online!')}
                      className="text-indigo-400 hover:text-white p-1"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: NOVIDADES & LANÇAMENTOS (Alimentado pelo Super-Admin) */}
      {/* ========================================================= */}
      {activeTab === 'news' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Header Info Box */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/50 rounded-3xl p-6 sm:p-8 text-white relative shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-2 max-w-xl">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                Roadmap & Changelog Oficial
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Novidades & Futuros Lançamentos da Ferramenta
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Fique por dentro de todas as novas ferramentas, melhorias de inteligência artificial e atualizações de CAPI. Essas novidades ajudam você a demonstrar valor constante aos seus clientes.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <button
                type="button"
                onClick={loadReleasesData}
                disabled={loadingReleases}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingReleases ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </button>
              {currentUser.email === 'rogerio@mudadigital.com.br' && onNavigateToTab && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab('saas_admin')}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm text-white"
                >
                  <span>Gerenciar no Painel Super Admin</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setReleaseFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  releaseFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Todas as Novidades
              </button>
              <button
                onClick={() => setReleaseFilter('released')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  releaseFilter === 'released'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>🚀 Lançadas Recentemente</span>
              </button>
              <button
                onClick={() => setReleaseFilter('in_progress')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  releaseFilter === 'in_progress'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>⚡ Em Desenvolvimento</span>
              </button>
              <button
                onClick={() => setReleaseFilter('planned')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  releaseFilter === 'planned'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>💡 Planejadas / Em Breve</span>
              </button>
            </div>
          </div>

          {/* Releases List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReleases.map(rel => {
              const statusBadge = 
                rel.status === 'released' ? { text: 'Disponível Agora', bg: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400' } :
                rel.status === 'in_progress' ? { text: 'Em Desenvolvimento Ativo', bg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400' } :
                { text: 'Planejado no Roadmap', bg: 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400' };

              return (
                <div
                  key={rel.id}
                  className={`bg-white dark:bg-slate-900 border rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between transition ${
                    rel.highlight
                      ? 'border-blue-400 dark:border-blue-500/50 ring-2 ring-blue-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {rel.version && (
                          <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono font-bold text-xs">
                            {rel.version}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-[10px]">
                          {rel.category}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge.bg}`}>
                        {statusBadge.text}
                      </span>
                    </div>

                    <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                      {rel.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {rel.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{rel.releaseDate || 'Previsão 2026/2027'}</span>
                    </span>
                    {rel.highlight && (
                      <span className="text-amber-500 font-bold text-[11px] flex items-center gap-1">
                        ⭐ Destaque
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SUPORTE TÉCNICO, SUGESTÕES & DICAS */}
      {/* ========================================================= */}
      {activeTab === 'support' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left: Support Form (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-500" />
                    Abrir Chamado / Enviar Sugestão ou Correção
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Preencha os dados abaixo. Sua mensagem será enviada diretamente à coordenação técnica do TrackerMD.
                  </p>
                </div>

                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Tipo de Solicitação *
                      </label>
                      <select
                        value={ticketType}
                        onChange={(e) => setTicketType(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none font-semibold"
                      >
                        <option value="support">🛠️ Suporte Técnico (Dificuldade/Dúvida)</option>
                        <option value="suggestion">💡 Sugestão de Melhoria / Nova Função</option>
                        <option value="bug">🐛 Relato de Correção / Possível Bug</option>
                        <option value="commercial">💼 Dúvida Comercial / Comissões</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Prioridade *
                      </label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value as any)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none font-semibold"
                      >
                        <option value="low">🟢 Baixa (Dúvida comum)</option>
                        <option value="medium">🟡 Média (Normal)</option>
                        <option value="high">🟠 Alta (Importante para o cliente)</option>
                        <option value="urgent">🔴 Urgente (Cliente em demonstração/fechamento)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Assunto da Solicitação *
                    </label>
                    <input
                      type="text"
                      required
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="Ex: Dúvida na validação do CAPI da Meta para o cliente X"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mensagem / Detalhes *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Descreva com o máximo de detalhes o que aconteceu, link do cliente, ou a sugestão que gostaria de ver na ferramenta..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submittingTicket}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>{submittingTicket ? 'Enviando Chamado...' : 'Registrar Chamado no Sistema'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDirectWhatsAppSupport}
                      className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chamar Coordenador no WhatsApp</span>
                    </button>
                  </div>

                </form>
              </div>

              {/* Ticket History */}
              {tickets.length > 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                    Meus Chamados & Sugestões Recentes
                  </h4>

                  <div className="space-y-3">
                    {tickets.map(t => (
                      <div key={t.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-white">{t.subject}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            t.status === 'resolved' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' :
                            t.status === 'in_progress' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' :
                            'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}>
                            {t.status === 'resolved' ? 'Resolvido' : t.status === 'in_progress' ? 'Em Análise' : 'Aberto'}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300">{t.message}</p>
                        {t.adminResponse && (
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-200 text-xs">
                            <strong>Resposta da Coordenação:</strong> {t.adminResponse}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-400">
                          {t.createdAt ? new Date(t.createdAt).toLocaleString('pt-BR') : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right: Expert Tips & Coordinator Guidance (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                    💡
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      Dicas Práticas do Coordenador Rogério
                    </h4>
                    <p className="text-[11px] text-slate-500">Estratégias de vendas e suporte para representantes</p>
                  </div>
                </div>

                <div className="space-y-3">
                  
                  {/* Dica 1 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(expandedFaq === 0 ? null : 0)}
                      className="w-full p-3.5 text-left font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <span>1. Como fechar com clientes no primeiro contato?</span>
                      {expandedFaq === 0 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {expandedFaq === 0 && (
                      <div className="p-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        Não tente vender "software". Venda clareza de dinheiro: pergunte quanto ele investe por mês em tráfego e se ele sabe exatamente qual criativo gerou as vendas no WhatsApp. Demonstre o painel em 5 minutos pelo celular.
                      </div>
                    )}
                  </div>

                  {/* Dica 2 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(expandedFaq === 1 ? null : 1)}
                      className="w-full p-3.5 text-left font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <span>2. Como vender a Implantação e Treinamento (R$ 997)?</span>
                      {expandedFaq === 1 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {expandedFaq === 1 && (
                      <div className="p-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        A taxa de setup inclui a configuração do CAPI, DNS e uma sessão ao vivo de 2h com os atendentes dele. Você ganha 50% (R$ 498,50) à vista, e a empresa se sente segura porque não precisará configurar nada sozinha.
                      </div>
                    )}
                  </div>

                  {/* Dica 3 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(expandedFaq === 2 ? null : 2)}
                      className="w-full p-3.5 text-left font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <span>3. O que fazer se o QR Code desconectar?</span>
                      {expandedFaq === 2 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {expandedFaq === 2 && (
                      <div className="p-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        Oriente o cliente a sempre usar o mesmo aparelho conectado a uma rede Wi-Fi estável, e a nunca abrir mais de 4 instâncias no mesmo celular. Em caso de queda, um novo QR Code é gerado em 3 segundos no painel.
                      </div>
                    )}
                  </div>

                  {/* Dica 4 */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setExpandedFaq(expandedFaq === 3 ? null : 3)}
                      className="w-full p-3.5 text-left font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      <span>4. Como escalar para 50 empresas em sua cidade?</span>
                      {expandedFaq === 3 ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {expandedFaq === 3 && (
                      <div className="p-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                        Faça parcerias com agências de tráfego pago locais e gestores de tráfego. Eles precisam do CAPI para otimizar os anúncios dos clientes deles, e você entrega a solução pronta, dividindo a comissão ou gerando valor mútuo.
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Direct Support Card */}
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-3xl p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                      Canal Direto de Atendimento VIP
                    </h4>
                    <p className="text-xs font-black text-slate-900 dark:text-white">
                      Rogério Belmiro - Coordenador Nacional
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Para suporte urgente durante negociações ou homologações com clientes corporativos, fale diretamente com o coordenador.
                </p>

                <a
                  href="https://wa.me/5565981150758?text=Olá Rogério! Sou representante TrackerMD e preciso de suporte prioritário para um cliente."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chamar no WhatsApp (55 65 9811-50758)</span>
                </a>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: QR CODE DO LINK DE INDICAÇÃO */}
      {/* ========================================================= */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                Seu QR Code Oficial
              </h4>
              <p className="text-xs text-slate-500">
                Mostre este código para donos de empresas escanearem direto pelo celular durante reuniões presenciais.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-slate-200 shadow-inner flex items-center justify-center mx-auto w-56 h-56">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(referralLink)}`}
                alt="QR Code de Indicação"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="text-[11px] font-mono text-slate-500 truncate bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
              {referralLink}
            </div>

            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              {copiedLink ? 'Link Copiado!' : 'Copiar Link'}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CONFIGURAR CHAVE PIX */}
      {/* ========================================================= */}
      {showPixModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowPixModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  Dados Financeiros para Repasse PIX
                </h4>
                <p className="text-xs text-slate-500">
                  Informe sua chave PIX para repasse de comissões mensais
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePix} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tipo de Chave PIX *
                </label>
                <select
                  value={editPixType}
                  onChange={(e) => setEditPixType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none font-semibold"
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone / Celular</option>
                  <option value="random">Chave Aleatória (EVP)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chave PIX *
                </label>
                <input
                  type="text"
                  required
                  value={editPixKey}
                  onChange={(e) => setEditPixKey(e.target.value)}
                  placeholder="Informe a chave PIX exata"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed">
                As comissões são liquidadas e transferidas para esta chave PIX de acordo com as aprovações de pagamento dos planos na Hotmart.
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPixModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingPix}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition"
                >
                  {savingPix ? 'Salvando...' : 'Salvar Chave PIX'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
