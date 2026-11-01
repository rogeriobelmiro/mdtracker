import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Flame, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Search, 
  RefreshCw, 
  ExternalLink, 
  Copy, 
  Check, 
  CreditCard, 
  Users, 
  Lock, 
  Sparkles, 
  Save, 
  Sliders, 
  PlusCircle, 
  Calendar,
  Layers,
  ArrowUpRight,
  Share2,
  DollarSign,
  Percent,
  MapPin,
  GraduationCap,
  Wrench,
  Edit3,
  Trash2,
  Plus,
  Phone,
  Mail,
  Eye,
  X,
  HelpCircle,
  Tag,
  ChevronRight,
  Award
} from 'lucide-react';
import { Company, User, HotmartConfig, HotmartEvent, HotmartPlanOption, SetupTrainingConfig, Affiliate } from '../types';
import { 
  fetchAdminCompanies, 
  updateCompanySubscription, 
  fetchHotmartSettings, 
  updateHotmartSettings, 
  fetchHotmartEvents,
  fetchAffiliates,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
  updateCompanyAffiliate
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';
import { BrazilAffiliatesMap } from './BrazilAffiliatesMap';

interface SuperAdminHotmartManagerProps {
  currentUser: User;
}

const DEFAULT_PLANS: HotmartPlanOption[] = [
  {
    id: 'starter',
    name: 'Plano Starter / Essencial',
    price: 197,
    period: 'mensal',
    checkoutUrl: '',
    description: 'Ideal para profissionais e negócios locais iniciando no rastreamento profissional.',
    features: [
      'Até 3 Usuários Colaboradores',
      '1 Conexão WhatsApp Web / Evolution',
      '5.000 Disparos de Mensagens / Mês',
      'Rastreamento UTM & CAPI Meta Ads',
      'Relatórios Básicos & CRM de Leads'
    ],
    highlight: false,
    active: true
  },
  {
    id: 'pro',
    name: 'Plano Pro / Crescimento',
    price: 397,
    period: 'mensal',
    checkoutUrl: '',
    description: 'Aceleração completa com automações ilimitadas e funil visual 360° interativo.',
    features: [
      'Até 10 Usuários Colaboradores',
      '3 Conexões de WhatsApp Simultâneas',
      '25.000 Disparos de Mensagens / Mês',
      'Funil Visual 360° com Métricas ao Vivo',
      'Automações & Workflows Ilimitados',
      'Suporte Prioritário Via WhatsApp'
    ],
    highlight: true,
    active: true
  },
  {
    id: 'enterprise',
    name: 'Plano Enterprise / Escala VIP',
    price: 697,
    period: 'mensal',
    checkoutUrl: '',
    description: 'Máxima potência, multi-instância e disparos em massa para grandes operações.',
    features: [
      'Usuários Colaboradores Ilimitados',
      'Múltiplas Conexões WhatsApp / Instâncias',
      'Disparos em Massa & E-mails Ilimitados',
      'Disparo via SMS Gateway Habilitado',
      'Meta Ads CAPI Dedicado em Alta Frequência',
      'Gerente de Sucesso & Onboarding VIP'
    ],
    highlight: false,
    active: true
  }
];

const DEFAULT_SETUP_TRAINING: SetupTrainingConfig = {
  enabled: true,
  title: 'Taxa de Implantação, Configuração Técnica e Treinamento VIP',
  price: 997,
  description: 'Serviço completo de ativação onde configuramos toda a estrutura técnica de DNS, domínios, Meta CAPI e realizamos treinamento ao vivo com a equipe.',
  checkoutUrl: '',
  features: [
    'Configuração de DNS, domínios e apontamentos SSL',
    'Validação técnica e ativação do Meta CAPI (API de Conversões)',
    'Conexão e configuração das instâncias do WhatsApp',
    'Treinamento prático ao vivo (Meet / Zoom) de 2h com a equipe',
    'Acompanhamento assistido nas primeiras campanhas e suporte prioritário'
  ]
};

const BRAZIL_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' }
];

const DEFAULT_AFFILIATE_FORM = {
  name: '',
  email: '',
  phone: '',
  document: '',
  state: 'SP',
  city: '',
  cep: '',
  address: '',
  neighborhood: '',
  complement: '',
  trainingStatus: 'pending' as 'pending' | 'scheduled' | 'completed',
  commissionMonthly: 20,
  commissionSetup: 50,
  pixKeyType: 'cpf' as 'cpf' | 'cnpj' | 'email' | 'phone' | 'random',
  pixKey: '',
  referralCode: '',
  status: 'active' as 'active' | 'inactive',
  notes: ''
};

export const SuperAdminHotmartManager: React.FC<SuperAdminHotmartManagerProps> = ({ currentUser }) => {
  const { alert, confirm, success } = useDialog();
  const isSuperAdmin = currentUser?.email?.toLowerCase().trim() === 'rogerio@mudadigital.com.br';

  const [activeSubTab, setActiveSubTab] = useState<'companies' | 'hotmart_config' | 'affiliates' | 'events_log'>('companies');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Hotmart Config State
  const [hotmartConfig, setHotmartConfig] = useState<HotmartConfig>({
    hottok: '',
    checkoutUrl: '',
    productId: '',
    trialDays: 1,
    webhookUrl: '',
    plans: DEFAULT_PLANS,
    setupTraining: DEFAULT_SETUP_TRAINING
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [newTrainingFeature, setNewTrainingFeature] = useState('');

  // Affiliates State
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loadingAffiliates, setLoadingAffiliates] = useState(false);
  const [affiliateSearch, setAffiliateSearch] = useState('');
  const [affiliateStateFilter, setAffiliateStateFilter] = useState('ALL');
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState(false);
  const [affiliatesViewMode, setAffiliatesViewMode] = useState<'table' | 'map'>('table');
  const [editingAffiliateId, setEditingAffiliateId] = useState<string | null>(null);
  const [affiliateFormData, setAffiliateFormData] = useState(DEFAULT_AFFILIATE_FORM);
  const [savingAffiliate, setSavingAffiliate] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [copiedRefLink, setCopiedRefLink] = useState<string | null>(null);
  const [copiedPixKey, setCopiedPixKey] = useState<string | null>(null);

  // Modal to view companies of an affiliate
  const [selectedAffiliateForCompanies, setSelectedAffiliateForCompanies] = useState<Affiliate | null>(null);

  // Modal to assign affiliate to a company
  const [assigningCompany, setAssigningCompany] = useState<Company | null>(null);
  const [selectedAffiliateIdForAssignment, setSelectedAffiliateIdForAssignment] = useState<string>('');

  // Events Log State
  const [events, setEvents] = useState<HotmartEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Preview Pricing Modal
  const [showPricingPreview, setShowPricingPreview] = useState(false);

  // Load Companies
  const loadCompaniesData = async () => {
    if (!isSuperAdmin) return;
    setLoading(true);
    try {
      const data = await fetchAdminCompanies(currentUser.email);
      setCompanies(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load Hotmart Config
  const loadHotmartConfig = async () => {
    if (!isSuperAdmin) return;
    try {
      const config = await fetchHotmartSettings(currentUser.email);
      setHotmartConfig({
        ...config,
        plans: Array.isArray(config.plans) && config.plans.length > 0 ? config.plans : DEFAULT_PLANS,
        setupTraining: config.setupTraining || DEFAULT_SETUP_TRAINING
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Load Affiliates
  const loadAffiliatesData = async () => {
    if (!isSuperAdmin) return;
    setLoadingAffiliates(true);
    try {
      const data = await fetchAffiliates(currentUser.email);
      setAffiliates(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingAffiliates(false);
    }
  };

  // Load Events
  const loadEventsData = async () => {
    if (!isSuperAdmin) return;
    setLoadingEvents(true);
    try {
      const logs = await fetchHotmartEvents(currentUser.email);
      setEvents(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadCompaniesData();
      loadHotmartConfig();
      loadAffiliatesData();
      if (activeSubTab === 'events_log') {
        loadEventsData();
      }
    }
  }, [isSuperAdmin, activeSubTab]);

  // Handle Save Hotmart Settings
  const handleSaveHotmartSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      await updateHotmartSettings(currentUser.email, hotmartConfig);
      await success('Configurações da Hotmart, Planos e Treinamento salvas com sucesso!');
    } catch (err: any) {
      await alert(err.message || 'Erro ao salvar configurações da Hotmart');
    } finally {
      setSavingConfig(false);
    }
  };

  // Handle Update Plan Field
  const handlePlanChange = (index: number, field: keyof HotmartPlanOption, value: any) => {
    const updatedPlans = [...(hotmartConfig.plans || DEFAULT_PLANS)];
    if (updatedPlans[index]) {
      updatedPlans[index] = {
        ...updatedPlans[index],
        [field]: value
      };
      setHotmartConfig({
        ...hotmartConfig,
        plans: updatedPlans
      });
    }
  };

  // Handle Setup Training Field
  const handleSetupTrainingChange = (field: keyof SetupTrainingConfig, value: any) => {
    const currentSetup = hotmartConfig.setupTraining || DEFAULT_SETUP_TRAINING;
    setHotmartConfig({
      ...hotmartConfig,
      setupTraining: {
        ...currentSetup,
        [field]: value
      }
    });
  };

  const handleAddTrainingFeature = () => {
    if (!newTrainingFeature.trim()) return;
    const currentSetup = hotmartConfig.setupTraining || DEFAULT_SETUP_TRAINING;
    const currentFeatures = currentSetup.features || [];
    setHotmartConfig({
      ...hotmartConfig,
      setupTraining: {
        ...currentSetup,
        features: [...currentFeatures, newTrainingFeature.trim()]
      }
    });
    setNewTrainingFeature('');
  };

  const handleRemoveTrainingFeature = (idx: number) => {
    const currentSetup = hotmartConfig.setupTraining || DEFAULT_SETUP_TRAINING;
    const currentFeatures = currentSetup.features || [];
    setHotmartConfig({
      ...hotmartConfig,
      setupTraining: {
        ...currentSetup,
        features: currentFeatures.filter((_, i) => i !== idx)
      }
    });
  };

  // Handle Subscription Actions
  const handleActivateSubscription = async (company: Company) => {
    const ok = await confirm(
      `Deseja ativar manualmente a assinatura da empresa "${company.name}"? Ela terá status Ativo sem depender da Hotmart.`
    );
    if (!ok) return;

    try {
      await updateCompanySubscription(company.id, currentUser.email, {
        subscriptionStatus: 'active',
        subscriptionPlan: 'mensal_manual'
      });
      await success(`Assinatura da empresa "${company.name}" ativada com sucesso!`);
      await loadCompaniesData();
    } catch (err: any) {
      await alert(err.message || 'Erro ao ativar assinatura');
    }
  };

  const handleCancelSubscription = async (company: Company) => {
    const ok = await confirm(
      `Deseja expirar/cancelar a assinatura da empresa "${company.name}"? Ela perderá o acesso aos recursos pagos.`
    );
    if (!ok) return;

    try {
      await updateCompanySubscription(company.id, currentUser.email, {
        subscriptionStatus: 'expired'
      });
      await success(`Assinatura da empresa "${company.name}" expirada.`);
      await loadCompaniesData();
    } catch (err: any) {
      await alert(err.message || 'Erro ao expirar assinatura');
    }
  };

  const handleExtendTrial = async (company: Company, days: number = 7) => {
    try {
      await updateCompanySubscription(company.id, currentUser.email, {
        subscriptionStatus: 'trial',
        trialDaysToAdd: days
      });
      await success(`+${days} dias de teste adicionados para "${company.name}"!`);
      await loadCompaniesData();
    } catch (err: any) {
      await alert(err.message || 'Erro ao estender teste');
    }
  };

  // Affiliates Actions
  const handleOpenNewAffiliateModal = () => {
    setEditingAffiliateId(null);
    setAffiliateFormData(DEFAULT_AFFILIATE_FORM);
    setIsAffiliateModalOpen(true);
  };

  const handleOpenEditAffiliateModal = (aff: Affiliate) => {
    setEditingAffiliateId(aff.id);
    setAffiliateFormData({
      name: aff.name,
      email: aff.email,
      phone: aff.phone,
      document: aff.document,
      state: aff.state || 'SP',
      city: aff.city || '',
      cep: aff.cep || '',
      address: aff.address || '',
      neighborhood: aff.neighborhood || '',
      complement: aff.complement || '',
      trainingStatus: (aff.trainingStatus || 'pending') as 'pending' | 'scheduled' | 'completed',
      commissionMonthly: aff.commissionMonthly !== undefined ? aff.commissionMonthly : 20,
      commissionSetup: aff.commissionSetup !== undefined ? aff.commissionSetup : 50,
      pixKeyType: aff.pixKeyType || 'cpf',
      pixKey: aff.pixKey || '',
      referralCode: aff.referralCode || '',
      status: aff.status || 'active',
      notes: aff.notes || ''
    });
    setIsAffiliateModalOpen(true);
  };

  const handleCepLookup = async (cepInput: string) => {
    const clean = cepInput.replace(/\D/g, '');
    if (clean.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAffiliateFormData(prev => ({
            ...prev,
            cep: clean,
            address: data.logradouro || prev.address,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf ? data.uf.toUpperCase() : prev.state
          }));
        }
      } catch (err) {
        console.error('Erro na consulta do CEP', err);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSaveAffiliateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliateFormData.name.trim()) {
      await alert('Por favor, informe o nome do afiliado.');
      return;
    }
    if (!affiliateFormData.pixKey.trim()) {
      await alert('Por favor, informe a Chave PIX para repasse.');
      return;
    }

    setSavingAffiliate(true);
    try {
      if (editingAffiliateId) {
        await updateAffiliate(currentUser.email, editingAffiliateId, affiliateFormData);
        await success('Afiliado atualizado com sucesso!');
      } else {
        await createAffiliate(currentUser.email, affiliateFormData);
        await success('Novo afiliado cadastrado com sucesso!');
      }
      setIsAffiliateModalOpen(false);
      setEditingAffiliateId(null);
      await loadAffiliatesData();
    } catch (err: any) {
      await alert(err.message || 'Erro ao salvar dados do afiliado');
    } finally {
      setSavingAffiliate(false);
    }
  };

  const handleDeleteAffiliateAction = async (aff: Affiliate) => {
    const ok = await confirm(`Tem certeza que deseja excluir o afiliado "${aff.name}"?`);
    if (!ok) return;

    try {
      await deleteAffiliate(currentUser.email, aff.id);
      await success('Afiliado excluído.');
      await loadAffiliatesData();
    } catch (err: any) {
      await alert(err.message || 'Erro ao excluir afiliado');
    }
  };

  const handleToggleAffiliateStatusAction = async (aff: Affiliate) => {
    const newStatus = aff.status === 'active' ? 'inactive' : 'active';
    try {
      await updateAffiliate(currentUser.email, aff.id, { status: newStatus });
      await success(`Status do afiliado alterado para ${newStatus === 'active' ? 'Ativo' : 'Inativo'}.`);
      await loadAffiliatesData();
    } catch (err: any) {
      await alert(err.message || 'Erro ao alterar status');
    }
  };

  const handleCopyReferralLink = (referralCode: string) => {
    const baseUrl = 'https://trackermd.mudadigital.com.br';
    const link = `${baseUrl}/?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedRefLink(referralCode);
    setTimeout(() => setCopiedRefLink(null), 3000);
  };

  const handleCopyPix = (pixKey: string, id: string) => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPixKey(id);
    setTimeout(() => setCopiedPixKey(null), 3000);
  };

  const copyWebhookUrl = () => {
    const url = hotmartConfig.webhookUrl || `${window.location.origin}/api/webhooks/hotmart`;
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 3000);
  };

  // Assign affiliate to company
  const handleOpenAssignModal = (comp: Company) => {
    setAssigningCompany(comp);
    setSelectedAffiliateIdForAssignment(comp.affiliateId || '');
  };

  const handleConfirmAssignAffiliate = async () => {
    if (!assigningCompany) return;
    try {
      await updateCompanyAffiliate(
        currentUser.email,
        assigningCompany.id,
        selectedAffiliateIdForAssignment || null
      );
      await success(`Afiliado da empresa "${assigningCompany.name}" atualizado com sucesso!`);
      setAssigningCompany(null);
      await loadCompaniesData();
      await loadAffiliatesData();
    } catch (err: any) {
      await alert(err.message || 'Erro ao vincular afiliado');
    }
  };

  // Filtered Companies
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.responsibleName && c.responsibleName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.cnpj && c.cnpj.includes(searchTerm)) ||
      (c.hotmartBuyerEmail && c.hotmartBuyerEmail.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return c.subscriptionStatus === 'active';
    if (filterStatus === 'trial') return (c.subscriptionStatus === 'trial' || !c.subscriptionStatus) && !(c as any).isTrialExpired;
    if (filterStatus === 'expired') return c.subscriptionStatus === 'expired' || (c as any).isTrialExpired;
    return true;
  });

  // Filtered Affiliates
  const filteredAffiliates = affiliates.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
      a.phone.includes(affiliateSearch) ||
      a.city.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
      a.pixKey.toLowerCase().includes(affiliateSearch.toLowerCase()) ||
      a.referralCode.toLowerCase().includes(affiliateSearch.toLowerCase());

    if (!matchesSearch) return false;
    if (affiliateStateFilter !== 'ALL' && a.state !== affiliateStateFilter) return false;
    return true;
  });

  // Metrics
  const totalCompanies = companies.length;
  const activeSubs = companies.filter(c => c.subscriptionStatus === 'active').length;
  const trialSubs = companies.filter(c => (c.subscriptionStatus === 'trial' || !c.subscriptionStatus) && !(c as any).isTrialExpired).length;
  const expiredSubs = companies.filter(c => c.subscriptionStatus === 'expired' || (c as any).isTrialExpired).length;

  const totalAffiliates = affiliates.length;
  const activeAffiliates = affiliates.filter(a => a.status === 'active').length;
  const totalReferredCompanies = affiliates.reduce((acc, a) => acc + (a.totalCompanies || 0), 0);
  const totalEstimatedMonthlyRepasse = affiliates.reduce((acc, a) => acc + (a.estimatedMonthlyEarnings || 0), 0);
  const totalEstimatedSetupRepasse = affiliates.reduce((acc, a) => acc + (a.estimatedSetupEarnings || 0), 0);

  if (!isSuperAdmin) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-red-200 p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2">Acesso Restrito</h2>
          <p className="text-sm text-slate-600 mb-6">
            Esta área de Administração Global, Hotmart e Afiliados é exclusiva para o Super Administrador da plataforma (<strong>rogerio@mudadigital.com.br</strong>).
          </p>
          <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-xl border border-slate-200">
            Usuário atual conectado: <span className="font-semibold text-slate-700">{currentUser.email}</span>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-indigo-600/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Painel Super Admin • rogerio@mudadigital.com.br</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Gestão de Planos, Hotmart & Afiliados Brasil</span>
              <Flame className="w-7 h-7 text-amber-400" />
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Configure a tabela de preços dos 3 planos, valor de instalação e treinamento VIP, gerencie representantes comerciais em todo o Brasil e controle comissões de repasse via PIX.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={() => setShowPricingPreview(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition shadow-sm"
              title="Visualizar como o cliente vê os planos"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Tabela de Preços</span>
            </button>
            <button
              onClick={() => { loadCompaniesData(); loadHotmartConfig(); loadAffiliatesData(); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition shadow-sm"
              title="Atualizar Dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading || loadingAffiliates ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-8 border-t border-slate-800/80 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('companies')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shrink-0 ${
              activeSubTab === 'companies'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Empresas & Assinaturas ({totalCompanies})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('hotmart_config')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shrink-0 ${
              activeSubTab === 'hotmart_config'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Tabela de Preços & Integração Hotmart</span>
          </button>

          <button
            onClick={() => setActiveSubTab('affiliates')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shrink-0 ${
              activeSubTab === 'affiliates'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Afiliados & Representantes Brasil ({totalAffiliates})</span>
            <span className="px-1.5 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 rounded-full font-bold">Novo</span>
          </button>

          <button
            onClick={() => setActiveSubTab('events_log')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shrink-0 ${
              activeSubTab === 'events_log'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Auditoria de Webhooks Hotmart</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: COMPANIES & SUBSCRIPTIONS */}
      {/* ========================================================= */}
      {activeSubTab === 'companies' && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total de Empresas</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalCompanies}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Assinaturas Ativas</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeSubs}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Em Teste Grátis (1d)</p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">{trialSubs}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">Testes Expirados</p>
                <h3 className="text-2xl font-black text-rose-600 mt-1">{expiredSubs}</h3>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <XCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, responsável, CNPJ ou e-mail..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Apenas Ativas</option>
                <option value="trial">Em Período de Teste</option>
                <option value="expired">Expiradas / Canceladas</option>
              </select>
            </div>
          </div>

          {/* Companies Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-3.5 px-5">Empresa</th>
                    <th className="py-3.5 px-4">Responsável & Contato</th>
                    <th className="py-3.5 px-4">Status da Assinatura</th>
                    <th className="py-3.5 px-4">Afiliado / Representante</th>
                    <th className="py-3.5 px-4">Usuários & Leads</th>
                    <th className="py-3.5 px-4">Assinante Hotmart</th>
                    <th className="py-3.5 px-5 text-right">Ações Rápidas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCompanies.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Nenhuma empresa encontrada com os filtros atuais.
                      </td>
                    </tr>
                  ) : (
                    filteredCompanies.map((c) => {
                      const isActive = c.subscriptionStatus === 'active';
                      const isExpired = c.subscriptionStatus === 'expired' || (c as any).isTrialExpired;
                      const isTrial = !isActive && !isExpired;

                      const trialEnd = c.trialEndsAt ? new Date(c.trialEndsAt).getTime() : 0;
                      const remainingHours = Math.max(0, Math.round((trialEnd - Date.now()) / (1000 * 60 * 60)));

                      const linkedAffiliate = affiliates.find(a => a.id === c.affiliateId || (a.referralCode && a.referralCode.toLowerCase() === c.affiliateCode?.toLowerCase()));

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-black flex items-center justify-center text-sm shrink-0">
                                {c.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <span>{c.name}</span>
                                  {c.plan && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono uppercase font-bold">
                                      {c.plan}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  CNPJ: {c.cnpj || 'Não informado'} • Desde {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="text-slate-800 font-semibold">{c.responsibleName || 'Não especificado'}</div>
                            <div className="text-slate-500 text-[11px]">{c.phone || '-'}</div>
                          </td>

                          <td className="py-4 px-4">
                            {isActive ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Assinatura Ativa</span>
                              </div>
                            ) : isTrial ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Teste ({remainingHours}h restantes)</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                <span>Teste Expirado</span>
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            {linkedAffiliate ? (
                              <div className="flex items-center gap-1.5">
                                <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center gap-1">
                                  <Users className="w-3 h-3 text-indigo-500" />
                                  <span>{linkedAffiliate.name}</span>
                                  <span className="text-[10px] text-indigo-400 font-mono">({linkedAffiliate.state})</span>
                                </span>
                                <button
                                  onClick={() => handleOpenAssignModal(c)}
                                  className="text-slate-400 hover:text-blue-600 p-1"
                                  title="Alterar Afiliado"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenAssignModal(c)}
                                className="text-xs text-slate-400 hover:text-blue-600 flex items-center gap-1 italic transition"
                                title="Vincular a um Afiliado"
                              >
                                <span>Direto (Sem Afiliado)</span>
                                <Plus className="w-3 h-3" />
                              </button>
                            )}
                          </td>

                          <td className="py-4 px-4 text-slate-700">
                            <span className="font-bold text-slate-900">{(c as any).userCount || 1}</span> usuários • <span className="font-bold text-blue-600">{(c as any).leadCount || 0}</span> leads
                          </td>

                          <td className="py-4 px-4 text-[11px]">
                            {c.hotmartBuyerEmail ? (
                              <div>
                                <span className="font-semibold text-slate-800 block">{c.hotmartBuyerEmail}</span>
                                <span className="text-slate-400 font-mono text-[10px]">{c.hotmartTransactionId || 'Assinatura'}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Sem compra vinculada</span>
                            )}
                          </td>

                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {!isActive && (
                                <button
                                  onClick={() => handleActivateSubscription(c)}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
                                  title="Ativar Assinatura Manualmente"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Ativar</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleExtendTrial(c, 7)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center gap-1"
                                title="Adicionar +7 dias de teste"
                              >
                                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                                <span>+7 Dias</span>
                              </button>

                              {isActive && (
                                <button
                                  onClick={() => handleCancelSubscription(c)}
                                  className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-600 text-xs font-semibold transition"
                                  title="Expirar / Cancelar"
                                >
                                  Expirar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: HOTMART CONFIGURATION & PRICING PLANS */}
      {/* ========================================================= */}
      {activeSubTab === 'hotmart_config' && (
        <div className="max-w-5xl space-y-8">
          
          <form onSubmit={handleSaveHotmartSettings} className="space-y-8">
            
            {/* 1. General Hotmart Settings */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-amber-500" />
                    <span>Configuração Global do Webhook Hotmart</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Configure o Webhook da Hotmart para liberar automaticamente as assinaturas das empresas após a confirmação do pagamento.
                  </p>
                </div>
              </div>

              {/* Webhook URL Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  URL do Webhook do TrackerMD (Copie e cole na Hotmart)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={hotmartConfig.webhookUrl || `https://trackermd.mudadigital.com.br/api/webhooks/hotmart`}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 font-mono text-xs sm:text-sm text-slate-800 select-all"
                  />
                  <button
                    type="button"
                    onClick={copyWebhookUrl}
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition shadow-sm"
                  >
                    {copiedWebhook ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedWebhook ? 'Copiado!' : 'Copiar URL'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Na Hotmart, acesse: <strong>Ferramentas &gt; Webhook (API e Notificações) &gt; Cadastrar Webhook</strong> e selecione os eventos de <em>Compra Aprovada</em>, <em>Assinatura Cancelada</em> e <em>Troca de Plano</em>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Token Hottok de Verificação (Hotmart) *
                  </label>
                  <input
                    type="text"
                    value={hotmartConfig.hottok || ''}
                    onChange={(e) => setHotmartConfig({ ...hotmartConfig, hottok: e.target.value })}
                    placeholder="Ex: 8a97b4c6-e123-4567-89ab-cdef01234567"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Encontrado na aba de autenticação do Webhook na Hotmart para validar cada disparo com segurança.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Dias de Teste Padrão no Cadastro (Trial) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={hotmartConfig.trialDays || 1}
                    onChange={(e) => setHotmartConfig({ ...hotmartConfig, trialDays: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tempo gratuito liberado para novas empresas antes de exigir a assinatura (Padrão: 1 dia).
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Link de Checkout Hotmart Padrão / Fallback *
                  </label>
                  <input
                    type="url"
                    value={hotmartConfig.checkoutUrl || ''}
                    onChange={(e) => setHotmartConfig({ ...hotmartConfig, checkoutUrl: e.target.value })}
                    placeholder="https://pay.hotmart.com/SEU_CODIGO_DE_PRODUTO?off=xyz"
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Link de contingência caso o usuário não selecione um plano específico na tabela.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. TABELA DE PREÇOS PARA CONFIGURAÇÃO DAS 3 OPÇÕES */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-blue-600" />
                    <span>Tabela de Preço dos 3 Planos (Configuração Hotmart)</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Configure os 3 planos mensais com nome, valor (R$), link de checkout da Hotmart e resumo de recursos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPricingPreview(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition self-start sm:self-auto"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Pré-visualizar Modal</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {(hotmartConfig.plans || DEFAULT_PLANS).map((plan, index) => {
                  const badgeColor = index === 1 ? 'border-amber-400 bg-amber-50/30' : index === 2 ? 'border-purple-300 bg-purple-50/20' : 'border-blue-200 bg-blue-50/20';

                  return (
                    <div 
                      key={plan.id || index}
                      className={`rounded-2xl border-2 p-5 space-y-4 relative ${badgeColor}`}
                    >
                      {/* Plan Header */}
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
                          Opção {index + 1} • {plan.id.toUpperCase()}
                        </span>
                        
                        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={plan.active !== false}
                            onChange={(e) => handlePlanChange(index, 'active', e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span>Ativo</span>
                        </label>
                      </div>

                      {/* Highlight Tag */}
                      <label className="flex items-center gap-2 text-xs font-bold text-amber-700 cursor-pointer bg-amber-100/60 p-2 rounded-xl border border-amber-200">
                        <input
                          type="checkbox"
                          checked={!!plan.highlight}
                          onChange={(e) => handlePlanChange(index, 'highlight', e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span>Destacar como "Mais Popular ⭐"</span>
                      </label>

                      {/* Nome do Plano */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Nome do Plano *
                        </label>
                        <input
                          type="text"
                          value={plan.name}
                          onChange={(e) => handlePlanChange(index, 'name', e.target.value)}
                          placeholder="Ex: Plano Starter / Essencial"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      {/* Preço Mensal */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Valor Mensal (R$) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            value={plan.price}
                            onChange={(e) => handlePlanChange(index, 'price', Number(e.target.value))}
                            placeholder="197.00"
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                            required
                          />
                        </div>
                      </div>

                      {/* Link Hotmart */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Link de Checkout Hotmart *
                        </label>
                        <input
                          type="url"
                          value={plan.checkoutUrl || ''}
                          onChange={(e) => handlePlanChange(index, 'checkoutUrl', e.target.value)}
                          placeholder="https://pay.hotmart.com/PRODUTO_XXX"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Descrição Curta */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                          Descrição / Recursos
                        </label>
                        <textarea
                          rows={2}
                          value={plan.description || ''}
                          onChange={(e) => handlePlanChange(index, 'description', e.target.value)}
                          placeholder="Resumo dos benefícios principais..."
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. ÁREA PARA DESCREVER VALOR DA INSTALAÇÃO, CONFIGURAÇÃO E TREINAMENTO */}
            <div className="bg-gradient-to-br from-indigo-900/10 via-purple-900/5 to-white rounded-3xl border-2 border-indigo-200/80 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-100 pb-5">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-2">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Serviço de Ativação Profissional</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-indigo-600" />
                    <span>Taxa de Instalação, Configuração Técnica & Treinamento VIP</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    Descreva o escopo e o valor do treinamento da equipe e setup técnico (DNS, Meta CAPI, WhatsApp).
                  </p>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-indigo-900 cursor-pointer bg-white px-3 py-2 rounded-xl border border-indigo-200 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={hotmartConfig.setupTraining?.enabled !== false}
                    onChange={(e) => handleSetupTrainingChange('enabled', e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Habilitar Taxa de Instalação & Treinamento</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Título do Serviço de Instalação e Treinamento *
                    </label>
                    <input
                      type="text"
                      value={hotmartConfig.setupTraining?.title || ''}
                      onChange={(e) => handleSetupTrainingChange('title', e.target.value)}
                      placeholder="Ex: Implantação Completa, Configuração Técnica e Treinamento VIP da Equipe"
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Descrição Detalhada do que Está Incluso no Treinamento e Configuração *
                    </label>
                    <textarea
                      rows={3}
                      value={hotmartConfig.setupTraining?.description || ''}
                      onChange={(e) => handleSetupTrainingChange('description', e.target.value)}
                      placeholder="Descreva todo o processo de ativação, reuniões ao vivo no Meet/Zoom, suporte prioritário nos primeiros 30 dias..."
                      className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 bg-white/80 p-5 rounded-2xl border border-indigo-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Valor do Serviço (R$) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400">R$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={hotmartConfig.setupTraining?.price || 997}
                        onChange={(e) => handleSetupTrainingChange('price', Number(e.target.value))}
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-black text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                      Link de Checkout Hotmart (Taxa)
                    </label>
                    <input
                      type="url"
                      value={hotmartConfig.setupTraining?.checkoutUrl || ''}
                      onChange={(e) => handleSetupTrainingChange('checkoutUrl', e.target.value)}
                      placeholder="https://pay.hotmart.com/TAXA_SETUP"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Opcional se cobrado via PIX ou faturado direto.</p>
                  </div>
                </div>
              </div>

              {/* Training Features List */}
              <div className="pt-4 border-t border-indigo-100/80 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Itens Inclusos no Pacote de Treinamento e Instalação
                </label>
                <div className="flex flex-wrap gap-2">
                  {(hotmartConfig.setupTraining?.features || DEFAULT_SETUP_TRAINING.features || []).map((feat, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs font-semibold text-slate-700 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTrainingFeature(idx)}
                        className="text-slate-400 hover:text-rose-500 ml-1"
                        title="Remover item"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 max-w-lg mt-2">
                  <input
                    type="text"
                    value={newTrainingFeature}
                    onChange={(e) => setNewTrainingFeature(e.target.value)}
                    placeholder="Adicionar novo item incluso (ex: Gravação do treinamento disponibilizada)..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTrainingFeature();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTrainingFeature}
                    className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shrink-0"
                  >
                    + Adicionar
                  </button>
                </div>
              </div>
            </div>

            {/* Save Button Bar */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={savingConfig}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{savingConfig ? 'Salvando Configurações...' : 'Salvar Todas as Configurações Hotmart & Planos'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: AFILIADOS & REPRESENTANTES EM TODO O BRASIL */}
      {/* ========================================================= */}
      {activeSubTab === 'affiliates' && (
        <div className="space-y-6">
          
          {/* Top KPI Cards for Affiliates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Afiliados / Reps</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalAffiliates}</h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Afiliados Ativos</p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">{activeAffiliates}</h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Empresas Indicadas</p>
                <h3 className="text-2xl font-black text-blue-600 mt-1">{totalReferredCompanies}</h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Repasse Mensal Recorrente</p>
                <h3 className="text-lg font-black text-purple-700 mt-1">{formatCurrency(totalEstimatedMonthlyRepasse)}</h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Percent className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Repasse Treinamentos</p>
                <h3 className="text-lg font-black text-amber-700 mt-1">{formatCurrency(totalEstimatedSetupRepasse)}</h3>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search, Filter & View Switcher */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={affiliateSearch}
                  onChange={(e) => setAffiliateSearch(e.target.value)}
                  placeholder="Buscar por nome, cidade, UF, código ou chave PIX..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={affiliateStateFilter}
                onChange={(e) => setAffiliateStateFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ALL">Todos os Estados (Brasil)</option>
                {BRAZIL_STATES.map(s => (
                  <option key={s.uf} value={s.uf}>{s.uf} - {s.name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAffiliatesViewMode('table')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    affiliatesViewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Tabela / Lista
                </button>
                <button
                  type="button"
                  onClick={() => setAffiliatesViewMode('map')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                    affiliatesViewMode === 'map' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Mapa do Brasil</span>
                </button>
              </div>

              <button
                onClick={handleOpenNewAffiliateModal}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-sm transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Novo Afiliado / Representante</span>
              </button>
            </div>
          </div>

          {/* Conditional View: Map or Table */}
          {affiliatesViewMode === 'map' ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-2 sm:p-4">
              <BrazilAffiliatesMap 
                affiliates={affiliates} 
                theme="light" 
                title="Distribuição Geográfica dos Afiliados & Representantes"
                subtitle="Clique em qualquer estado ou cidade no mapa para visualizar os representantes alocados e acionar diretamente pelo WhatsApp."
              />
            </div>
          ) : (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-3.5 px-5">Representante / Região</th>
                    <th className="py-3.5 px-4">Contatos</th>
                    <th className="py-3.5 px-4">Chave PIX (Repasse)</th>
                    <th className="py-3.5 px-4">% Comissões (Mensal / Treinamento)</th>
                    <th className="py-3.5 px-4">Link Exclusivo de Afiliado</th>
                    <th className="py-3.5 px-4">Empresas & Repasse Estimado</th>
                    <th className="py-3.5 px-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAffiliates.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Nenhum afiliado ou representante encontrado. Clique em "+ Novo Afiliado" para cadastrar o primeiro!
                      </td>
                    </tr>
                  ) : (
                    filteredAffiliates.map((aff) => {
                      const isActive = aff.status === 'active';
                      const isCopied = copiedRefLink === aff.referralCode;
                      const isPixCopied = copiedPixKey === aff.id;

                      return (
                        <tr key={aff.id} className="hover:bg-slate-50/80 transition">
                          
                          {/* Nome e UF */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-black flex items-center justify-center text-sm shrink-0">
                                {aff.state || 'BR'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                                  <span>{aff.name}</span>
                                  {!isActive && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 font-bold">
                                      Pausado
                                    </span>
                                  )}
                                  {aff.trainingStatus === 'completed' ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 border border-emerald-200">
                                      <GraduationCap className="w-3 h-3 text-emerald-600" />
                                      Treinado / Habilitado
                                    </span>
                                  ) : aff.trainingStatus === 'scheduled' ? (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center gap-1 border border-blue-200">
                                      <GraduationCap className="w-3 h-3 text-blue-600" />
                                      Treinamento Agendado
                                    </span>
                                  ) : (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center gap-1 border border-amber-200">
                                      <GraduationCap className="w-3 h-3 text-amber-600" />
                                      Treinamento Pendente
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span className="font-semibold text-slate-700">{aff.city ? `${aff.city} - ${aff.state}` : `${aff.state} (Brasil)`}</span>
                                  {aff.address && <span>• {aff.address}{aff.neighborhood ? `, ${aff.neighborhood}` : ''}</span>}
                                  {aff.cep && <span>• CEP: {aff.cep}</span>}
                                  {aff.document && <span>• Doc: {aff.document}</span>}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contato */}
                          <td className="py-4 px-4 text-xs">
                            <div className="space-y-1">
                              {aff.phone && (
                                <a
                                  href={`https://wa.me/55${aff.phone.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{aff.phone}</span>
                                </a>
                              )}
                              {aff.email && (
                                <div className="text-slate-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{aff.email}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Chave PIX */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {aff.pixKeyType?.toUpperCase() || 'PIX'}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyPix(aff.pixKey, aff.id)}
                                  className="text-xs font-mono font-bold text-slate-800 hover:text-blue-600 flex items-center gap-1"
                                  title="Clique para copiar a chave PIX"
                                >
                                  <span>{aff.pixKey}</span>
                                  {isPixCopied ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </button>
                              </div>
                              {isPixCopied && (
                                <span className="text-[10px] text-emerald-600 font-bold block">PIX copiado!</span>
                              )}
                            </div>
                          </td>

                          {/* Comissões */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <span className="text-blue-600 font-black">{aff.commissionMonthly || 0}%</span>
                                <span className="text-slate-500 font-normal">Mensalidade Recorrente</span>
                              </div>
                              <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <span className="text-purple-600 font-black">{aff.commissionSetup || 0}%</span>
                                <span className="text-slate-500 font-normal">Instalação & Treinamento</span>
                              </div>
                            </div>
                          </td>

                          {/* Link de Afiliado */}
                          <td className="py-4 px-4">
                            <div className="space-y-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopyReferralLink(aff.referralCode)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-2xs ${
                                  isCopied 
                                    ? 'bg-emerald-600 text-white' 
                                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                                }`}
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{isCopied ? 'Link Copiado!' : 'Copiar Link de Indicação'}</span>
                              </button>
                              <div className="text-[11px] font-mono text-slate-400 truncate max-w-[200px]" title={`?ref=${aff.referralCode}`}>
                                ?ref={aff.referralCode}
                              </div>
                            </div>
                          </td>

                          {/* Empresas Vinculadas & Repasse */}
                          <td className="py-4 px-4">
                            <button
                              type="button"
                              onClick={() => setSelectedAffiliateForCompanies(aff)}
                              className="text-left group"
                            >
                              <div className="font-bold text-slate-900 group-hover:text-blue-600 flex items-center gap-1">
                                <span>{aff.totalCompanies || 0} empresa(s)</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition" />
                              </div>
                              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                                Est. Repasse: {formatCurrency((aff.estimatedMonthlyEarnings || 0) + (aff.estimatedSetupEarnings || 0))}
                              </div>
                            </button>
                          </td>

                          {/* Ações */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditAffiliateModal(aff)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                                title="Editar Afiliado"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleToggleAffiliateStatusAction(aff)}
                                className={`px-2 py-1 rounded-lg text-xs font-semibold transition ${
                                  isActive ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                }`}
                                title={isActive ? 'Pausar Afiliado' : 'Reativar Afiliado'}
                              >
                                {isActive ? 'Pausar' : 'Ativar'}
                              </button>

                              <button
                                onClick={() => handleDeleteAffiliateAction(aff)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-rose-600 transition"
                                title="Excluir Afiliado"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    )}

      {/* ========================================================= */}
      {/* TAB 4: WEBHOOK AUDIT LOGS */}
      {/* ========================================================= */}
      {activeSubTab === 'events_log' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900">Histórico de Disparos Webhook Hotmart</h3>
              <p className="text-xs text-slate-500">Últimos eventos recebidos diretamente da Hotmart para ativação e cancelamento de assinaturas.</p>
            </div>
            <button
              onClick={loadEventsData}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingEvents ? 'animate-spin' : ''}`} />
              <span>Atualizar Logs</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    <th className="py-3 px-4">Data / Hora</th>
                    <th className="py-3 px-4">Evento</th>
                    <th className="py-3 px-4">Comprador (E-mail)</th>
                    <th className="py-3 px-4">Transação</th>
                    <th className="py-3 px-4">Empresa Vinculada</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {events.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Nenhum evento registrado da Hotmart até o momento.
                      </td>
                    </tr>
                  ) : (
                    events.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 text-slate-600 font-mono">
                          {new Date(ev.createdAt).toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-blue-700 px-2 py-0.5 rounded bg-blue-50">
                            {ev.eventType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {ev.buyerEmail || '-'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                          {ev.transactionId || '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          {ev.companyId || <span className="text-amber-600 italic">Não associada</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ev.status === 'processed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {ev.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CRIAR / EDITAR AFILIADO */}
      {/* ========================================================= */}
      {isAffiliateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span>{editingAffiliateId ? 'Editar Afiliado / Representante' : 'Novo Afiliado / Representante'}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cadastre o parceiro comercial, percentuais de comissão e dados do PIX para repasse.
                </p>
              </div>

              <button
                onClick={() => setIsAffiliateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAffiliateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nome Completo */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nome Completo do Afiliado / Empresa Parceira *
                  </label>
                  <input
                    type="text"
                    value={affiliateFormData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      // Auto-suggest referral code if empty
                      if (!editingAffiliateId && (!affiliateFormData.referralCode || affiliateFormData.referralCode.includes('-'))) {
                        const clean = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
                        setAffiliateFormData({
                          ...affiliateFormData,
                          name,
                          referralCode: `${clean}-${affiliateFormData.state.toLowerCase()}`
                        });
                      } else {
                        setAffiliateFormData({ ...affiliateFormData, name });
                      }
                    }}
                    placeholder="Ex: Carlos Eduardo Silva"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* Documento (CPF / CNPJ) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    CPF ou CNPJ
                  </label>
                  <input
                    type="text"
                    value={affiliateFormData.document}
                    onChange={(e) => setAffiliateFormData({ ...affiliateFormData, document: e.target.value })}
                    placeholder="000.000.000-00 ou CNPJ"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* WhatsApp / Telefone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="text"
                    value={affiliateFormData.phone}
                    onChange={(e) => setAffiliateFormData({ ...affiliateFormData, phone: e.target.value })}
                    placeholder="Ex: 5565981150758"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* E-mail */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    E-mail do Afiliado *
                  </label>
                  <input
                    type="email"
                    value={affiliateFormData.email}
                    onChange={(e) => setAffiliateFormData({ ...affiliateFormData, email: e.target.value })}
                    placeholder="afiliado@exemplo.com.br"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* Estado (UF) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Estado (UF) *
                  </label>
                  <select
                    value={affiliateFormData.state}
                    onChange={(e) => {
                      const state = e.target.value;
                      if (!editingAffiliateId) {
                        const clean = affiliateFormData.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
                        setAffiliateFormData({
                          ...affiliateFormData,
                          state,
                          referralCode: clean ? `${clean}-${state.toLowerCase()}` : affiliateFormData.referralCode
                        });
                      } else {
                        setAffiliateFormData({ ...affiliateFormData, state });
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {BRAZIL_STATES.map(s => (
                      <option key={s.uf} value={s.uf}>{s.uf} - {s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Cidade */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={affiliateFormData.city}
                    onChange={(e) => setAffiliateFormData({ ...affiliateFormData, city: e.target.value })}
                    placeholder="Ex: Cuiabá, São Paulo, Curitiba"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* CEP com Busca Automática ViaCEP */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center justify-between">
                    <span>CEP</span>
                    {loadingCep && <span className="text-[10px] text-blue-600 font-normal animate-pulse">Buscando CEP...</span>}
                  </label>
                  <input
                    type="text"
                    value={affiliateFormData.cep || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAffiliateFormData({ ...affiliateFormData, cep: val });
                      if (val.replace(/\D/g, '').length === 8) {
                        handleCepLookup(val);
                      }
                    }}
                    onBlur={() => {
                      if (affiliateFormData.cep) handleCepLookup(affiliateFormData.cep);
                    }}
                    placeholder="00000-000"
                    maxLength={9}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Endereço / Logradouro */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Endereço Completo (Rua / Av., Número)
                  </label>
                  <input
                    type="text"
                    value={affiliateFormData.address || ''}
                    onChange={(e) => setAffiliateFormData({ ...affiliateFormData, address: e.target.value })}
                    placeholder="Ex: Av. Historiador Rubens de Mendonça, 1500"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Bairro e Complemento */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={affiliateFormData.neighborhood || ''}
                    onChange={(e) => setAffiliateFormData({ ...affiliateFormData, neighborhood: e.target.value })}
                    placeholder="Ex: Bosque da Saúde"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={affiliateFormData.complement || ''}
                    onChange={(e) => setAffiliateFormData({ ...affiliateFormData, complement: e.target.value })}
                    placeholder="Ex: Sala 402, Bloco B"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Status de Treinamento / Capacitação VIP */}
                <div className="sm:col-span-2 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200/60 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <label className="block text-xs font-bold text-slate-800 uppercase">
                      Status de Treinamento & Capacitação Técnica Oficial
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-600 mb-2.5">
                    Representantes capacitados recebem certificação para implantar e ensinar as empresas locais a operarem o TrackerMD.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAffiliateFormData({ ...affiliateFormData, trainingStatus: 'pending' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        affiliateFormData.trainingStatus === 'pending'
                          ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>⏳ Pendente</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAffiliateFormData({ ...affiliateFormData, trainingStatus: 'scheduled' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        affiliateFormData.trainingStatus === 'scheduled'
                          ? 'bg-blue-100 border-blue-300 text-blue-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>🗓️ Agendado</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAffiliateFormData({ ...affiliateFormData, trainingStatus: 'completed' })}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                        affiliateFormData.trainingStatus === 'completed'
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>✅ Concluído / Habilitado</span>
                    </button>
                  </div>
                </div>

                {/* Código de Indicação (Slug) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Código Único do Link de Afiliado *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">?ref=</span>
                    <input
                      type="text"
                      value={affiliateFormData.referralCode}
                      onChange={(e) => setAffiliateFormData({ ...affiliateFormData, referralCode: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '') })}
                      placeholder="carlos-mt"
                      className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                {/* Comissões Box */}
                <div className="sm:col-span-2 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">
                      % Comissão Mensalidade Recorrente *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={affiliateFormData.commissionMonthly}
                        onChange={(e) => setAffiliateFormData({ ...affiliateFormData, commissionMonthly: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-xl text-sm font-black text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400">%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Repasse mensal sobre as faturas pagas das empresas indicadas.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-indigo-900 uppercase mb-1">
                      % Comissão Treinamento & Instalação *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={affiliateFormData.commissionSetup}
                        onChange={(e) => setAffiliateFormData({ ...affiliateFormData, commissionSetup: Number(e.target.value) })}
                        className="w-full px-4 py-2 bg-white border border-indigo-200 rounded-xl text-sm font-black text-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-400">%</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">Repasse único na adesão sobre a taxa de treinamento/setup.</p>
                  </div>
                </div>

                {/* Dados do PIX */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Tipo de Chave PIX *
                  </label>
                  <select
                    value={affiliateFormData.pixKeyType}
                    onChange={(e) => setAffiliateFormData({ ...affiliateFormData, pixKeyType: e.target.value as any })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="cpf">CPF</option>
                    <option value="cnpj">CNPJ</option>
                    <option value="email">E-mail</option>
                    <option value="phone">Celular</option>
                    <option value="random">Chave Aleatória (EVP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Chave PIX de Repasse *
                  </label>
                  <input
                    type="text"
                    value={affiliateFormData.pixKey}
                    onChange={(e) => setAffiliateFormData({ ...affiliateFormData, pixKey: e.target.value.trim() })}
                    placeholder="Chave PIX do representante"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                {/* Status */}
                <div className="sm:col-span-2 flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={affiliateFormData.status === 'active'}
                      onChange={() => setAffiliateFormData({ ...affiliateFormData, status: 'active' })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Afiliado Ativo (Liberado para receber novas indicações)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      checked={affiliateFormData.status === 'inactive'}
                      onChange={() => setAffiliateFormData({ ...affiliateFormData, status: 'inactive' })}
                      className="text-rose-600 focus:ring-rose-500"
                    />
                    <span>Pausado / Inativo</span>
                  </label>
                </div>

                {/* Observações */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Observações Internas (Região, Contrato, etc.)
                  </label>
                  <textarea
                    rows={2}
                    value={affiliateFormData.notes}
                    onChange={(e) => setAffiliateFormData({ ...affiliateFormData, notes: e.target.value })}
                    placeholder="Anotações para a gestão da MudaDigital..."
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAffiliateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingAffiliate}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition disabled:opacity-50"
                >
                  {savingAffiliate ? 'Salvando...' : (editingAffiliateId ? 'Atualizar Afiliado' : 'Salvar e Gerar Link')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: VER EMPRESAS DO AFILIADO */}
      {/* ========================================================= */}
      {selectedAffiliateForCompanies && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>Empresas Vinculadas a {selectedAffiliateForCompanies.name}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lista de empresas cadastradas através do código <strong>?ref={selectedAffiliateForCompanies.referralCode}</strong>
                </p>
              </div>

              <button
                onClick={() => setSelectedAffiliateForCompanies(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            {companies.filter(c => c.affiliateId === selectedAffiliateForCompanies.id || (selectedAffiliateForCompanies.referralCode && c.affiliateCode?.toLowerCase() === selectedAffiliateForCompanies.referralCode.toLowerCase())).length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Nenhuma empresa vinculada a este representante ainda.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {companies
                  .filter(c => c.affiliateId === selectedAffiliateForCompanies.id || (selectedAffiliateForCompanies.referralCode && c.affiliateCode?.toLowerCase() === selectedAffiliateForCompanies.referralCode.toLowerCase()))
                  .map((comp) => {
                    const isActive = comp.subscriptionStatus === 'active';
                    return (
                      <div key={comp.id} className="py-3 flex items-center justify-between gap-4">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{comp.name}</div>
                          <div className="text-[11px] text-slate-500">
                            Cadastrada em {new Date(comp.createdAt).toLocaleDateString('pt-BR')} • {comp.responsibleName || 'Responsável não informado'}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isActive ? 'Assinatura Ativa' : 'Em Teste / Expirada'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedAffiliateForCompanies(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ATRIBUIR AFILIADO A UMA EMPRESA */}
      {/* ========================================================= */}
      {assigningCompany && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Vincular Afiliado / Representante</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Empresa: <strong>{assigningCompany.name}</strong>
                </p>
              </div>

              <button
                onClick={() => setAssigningCompany(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Selecione o Representante Comercial Responsável
              </label>

              <select
                value={selectedAffiliateIdForAssignment}
                onChange={(e) => setSelectedAffiliateIdForAssignment(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Sem Afiliado (Indicação Direta da Plataforma)</option>
                {affiliates.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.state} - {a.city || 'Brasil'}) • ref={a.referralCode}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Ao vincular, esta empresa passará a contar nos cálculos de repasse de comissão do representante.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setAssigningCompany(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmAssignAffiliate}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm"
              >
                Salvar Vínculo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PRICING PREVIEW FOR CLIENTS */}
      {/* ========================================================= */}
      {showPricingPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-10 space-y-8 my-8 text-white relative shadow-2xl">
            
            <button
              onClick={() => setShowPricingPreview(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Planos Oficiais TrackerMD
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Escolha o Plano Ideal para a Sua Operação
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Potencialize seus resultados com rastreamento avançado, CAPI Meta Ads prioritário e automações.
              </p>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(hotmartConfig.plans || DEFAULT_PLANS).map((p, i) => (
                <div 
                  key={p.id || i}
                  className={`rounded-2xl p-6 flex flex-col justify-between relative transition border ${
                    p.highlight 
                      ? 'bg-gradient-to-b from-blue-900/40 to-slate-900 border-blue-500 shadow-xl shadow-blue-500/10 ring-2 ring-blue-500/20' 
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-blue-600 text-white font-black text-[10px] uppercase tracking-wider shadow-md">
                      Mais Escolhido ⭐
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-black text-white">{p.name}</h4>
                      <p className="text-xs text-slate-400 mt-1">{p.description}</p>
                    </div>

                    <div className="border-t border-slate-800 pt-3">
                      <div className="text-xs text-slate-400">A partir de</div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-3xl font-black text-white">
                          R$ {p.price}
                        </span>
                        <span className="text-xs text-slate-400 font-semibold">/mês</span>
                      </div>
                    </div>

                    <ul className="space-y-2 pt-2 text-xs text-slate-300">
                      {(p.features || []).map((feat, fi) => (
                        <li key={fi} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-800/80">
                    <a
                      href={p.checkoutUrl || hotmartConfig.checkoutUrl || 'https://pay.hotmart.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md ${
                        p.highlight
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-white'
                      }`}
                    >
                      <span>Assinar na Hotmart</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Setup & Training Banner */}
            {hotmartConfig.setupTraining?.enabled !== false && (
              <div className="bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border border-indigo-800/60 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Onboarding VIP Assistido</span>
                  </div>
                  <h4 className="text-lg font-black text-white">
                    {hotmartConfig.setupTraining?.title || DEFAULT_SETUP_TRAINING.title}
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {hotmartConfig.setupTraining?.description || DEFAULT_SETUP_TRAINING.description}
                  </p>
                </div>

                <div className="text-center md:text-right shrink-0 space-y-2">
                  <div className="text-xs text-slate-400 font-semibold">Taxa Única de Ativação</div>
                  <div className="text-2xl font-black text-indigo-300">
                    {formatCurrency(hotmartConfig.setupTraining?.price || 997)}
                  </div>
                  {hotmartConfig.setupTraining?.checkoutUrl && (
                    <a
                      href={hotmartConfig.setupTraining.checkoutUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                    >
                      <span>Contratar Treinamento</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
