import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, 
  Plus, 
  Search, 
  Eye, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  Sliders, 
  FileText, 
  Smartphone, 
  Monitor, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  HelpCircle, 
  Star, 
  ChevronRight, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  X, 
  RefreshCw, 
  Palette, 
  Settings2, 
  MessageSquare,
  Globe,
  Share2,
  Download,
  AlertCircle
} from 'lucide-react';
import { 
  LandingPage, 
  LandingPageCategory, 
  LandingPageStatus, 
  LandingPageFormField, 
  LandingPageFeature, 
  LandingPageTestimonial, 
  LandingPageFAQItem, 
  Company, 
  Product, 
  FunnelStage,
  FUNNEL_STAGES 
} from '../types';
import { 
  fetchLandingPages, 
  createLandingPage, 
  updateLandingPage, 
  deleteLandingPage, 
  toggleLandingPage, 
  generateLandingPageAI,
  submitLandingPageLead
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';
import { NavTabId } from './Sidebar';

interface LandingPagesManagerProps {
  currentCompany: Company;
  products?: Product[];
  onNavigateToTab?: (tab: NavTabId) => void;
}

// 4 Pre-built High-Converting Templates (RD Station Style)
const TEMPLATES: Array<{
  id: string;
  name: string;
  category: LandingPageCategory;
  categoryLabel: string;
  badge: string;
  description: string;
  previewHeroTitle: string;
  pageData: Partial<LandingPage>;
}> = [
  {
    id: 'tpl-consultoria',
    name: 'Agendamento de Consultoria / Vendas B2B',
    category: 'service_consulting',
    categoryLabel: 'Consultoria & Serviços',
    badge: 'Mais Convertido',
    description: 'Ideal para empresas de serviços, consultorias e vendas consultivas com foco em qualificar leads e agendar diagnósticos no WhatsApp.',
    previewHeroTitle: 'Diagnóstico Comercial de Alta Performance',
    pageData: {
      title: 'Consultoria Estratégica & Diagnóstico Gratuito',
      slug: 'diagnostico-comercial-gratuito',
      description: 'Descubra os gargalos do seu processo de vendas e receba um plano de ação prático em 24h.',
      category: 'service_consulting',
      status: 'published',
      theme: {
        primaryColor: '#2563eb',
        accentColor: '#10b981',
        backgroundColor: 'white',
        fontFamily: 'Inter',
        buttonStyle: 'rounded-xl'
      },
      hero: {
        badge: '🎯 Diagnóstico 100% Gratuito para Empresas',
        headline: 'Descubra Como Aumentar Suas Vendas no WhatsApp em Até 42% Sem Gastar Mais em Tráfego',
        subheadline: 'Receba uma análise detalhada do tempo de resposta, qualificação e scripts da sua equipe comercial com um especialista dedicado.',
        ctaText: 'Solicitar Meu Diagnóstico Gratuito',
        imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80'
      },
      features: [
        { id: 'f1', title: 'Mapeamento de Gargalos', description: 'Identifique em qual etapa seus leads estão esfriando ou desistindo do fechamento.' },
        { id: 'f2', title: 'Atribuição Precisa de Campanhas', description: 'Entenda exatamente qual anúncio do Meta e Google traz o melhor retorno financeiro.' },
        { id: 'f3', title: 'Scripts de Alta Conversão', description: 'Modelos validados de abordagem rápida que aceleram a decisão de compra.' },
        { id: 'f4', title: 'Plano de Ação em 24h', description: 'Relatório executivo com os 3 passos prioritários para gerar caixa imediato.' }
      ],
      socialProof: {
        enabled: true,
        stats: [
          { label: 'Empresas Aceleradas', value: '+450' },
          { label: 'Aumento Médio de Conversão', value: '+42%' },
          { label: 'Nota Média de Satisfação', value: '4.9/5' }
        ],
        testimonials: [
          { id: 't1', name: 'Mariana Silveira', role: 'Diretora Comercial - TechGrowth', text: 'O diagnóstico nos fez ajustar a abordagem inicial. Em 30 dias nossas vendas cresceram expressivamente!', rating: 5 },
          { id: 't2', name: 'Carlos Eduardo Ramos', role: 'Fundador - EcomBrasil', text: 'O atendimento consultivo e a visão de tráfego direto com CRM no WhatsApp mudaram nossa empresa.', rating: 5 }
        ]
      },
      countdown: {
        enabled: true,
        title: 'Vagas com condição especial encerram em:',
        endDate: new Date(Date.now() + 86400000 * 3).toISOString()
      },
      form: {
        title: 'Solicite seu Diagnóstico Gratuito',
        subtitle: 'Preencha abaixo. Nosso especialista entrará em contato via WhatsApp.',
        buttonText: 'Quero Meu Diagnóstico Gratuito 🚀',
        buttonColor: '#2563eb',
        fields: [
          { id: 'f-name', name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Seu nome ou da empresa', required: true },
          { id: 'f-phone', name: 'phone', label: 'WhatsApp com DDD', type: 'tel', placeholder: '(11) 99999-9999', required: true },
          { id: 'f-email', name: 'email', label: 'Seu Melhor E-mail', type: 'email', placeholder: 'seu@email.com', required: true },
          { id: 'f-role', name: 'cargo', label: 'Qual seu cargo ou segmento?', type: 'text', placeholder: 'Ex: Gerente Comercial / E-commerce', required: false }
        ],
        actionType: 'redirect_whatsapp',
        whatsappPhone: '5511999999999',
        whatsappMessage: 'Olá! Acabei de solicitar meu Diagnóstico de Vendas na Landing Page e gostaria de falar com um consultor.',
        targetStage: 'Novo Lead',
        tags: ['lp-consultoria', 'alta-intencao', 'rd-station']
      },
      faq: {
        enabled: true,
        items: [
          { id: 'faq-1', question: 'O diagnóstico é realmente gratuito?', answer: 'Sim, 100% gratuito e sem compromisso. Mostramos onde sua operação pode faturar mais.' },
          { id: 'faq-2', question: 'Quanto tempo dura a apresentação?', answer: 'Cerca de 25 minutos em uma reunião rápida e objetiva no Google Meet ou WhatsApp.' },
          { id: 'faq-3', question: 'Funciona para qualquer segmento?', answer: 'Sim, especialmente para empresas B2B, prestadores de serviço e e-commerces com atendimento ativo.' }
        ]
      },
      footer: {
        companyName: 'MDTracker Growth Suite',
        copyrightText: 'Todos os direitos reservados.'
      }
    }
  },
  {
    id: 'tpl-ebook',
    name: 'Captura de E-book & Material Rico (Lead Magnet)',
    category: 'lead_magnet',
    categoryLabel: 'Isca Digital / Topo de Funil',
    badge: 'Geração de Leads em Massa',
    description: 'Projetada para captação rápida de contatos com alta taxa de conversão oferecendo um guia, checklist, planilha ou PDF gratuito.',
    previewHeroTitle: 'O Guia Definitivo de Vendas no WhatsApp',
    pageData: {
      title: 'E-book Exclusivo: O Guia Definitivo do Tráfego para WhatsApp',
      slug: 'guia-definitivo-vendas-whatsapp',
      description: 'Aprenda os 7 scripts de mensagens mais persuasivos para fechar negócios e atrair clientes todos os dias.',
      category: 'lead_magnet',
      status: 'published',
      theme: {
        primaryColor: '#059669',
        accentColor: '#f59e0b',
        backgroundColor: 'white',
        fontFamily: 'Inter',
        buttonStyle: 'rounded-xl'
      },
      hero: {
        badge: '📘 Material Rico em PDF + Planilha Bônus',
        headline: 'O Guia Prático para Escalar Suas Vendas no WhatsApp Sem Desperdiçar Leads',
        subheadline: 'Baixe agora os modelos testados de mensagens de abertura rápida, follow-up sem insistência e recuperação de contatos desinteressados.',
        ctaText: 'Baixar Material Gratuito Imediatamente',
        imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1000&q=80'
      },
      features: [
        { id: 'f1', title: '7 Scripts Validados', description: 'Frases de abertura testadas que aumentam em 3x a resposta imediata do cliente.' },
        { id: 'f2', title: 'Como Quebrar a Objeção "Tá Caro"', description: 'Técnica simples para ancorar valor e conduzir o prospect para o fechamento.' },
        { id: 'f3', title: 'Sequência de Follow-up Invisível', description: 'Passo a passo para reengajar clientes indecisos sem parecer desesperado.' }
      ],
      socialProof: {
        enabled: true,
        stats: [
          { label: 'Downloads Realizados', value: '+3.200' },
          { label: 'Avaliação dos Leitores', value: '5.0 ⭐' }
        ]
      },
      countdown: {
        enabled: false
      },
      form: {
        title: 'Onde devemos enviar o seu E-book?',
        subtitle: 'Download imediato e 100% gratuito.',
        buttonText: 'Quero Baixar Meu E-book Grátis 📥',
        buttonColor: '#059669',
        fields: [
          { id: 'f1', name: 'name', label: 'Seu Nome', type: 'text', placeholder: 'Como podemos te chamar?', required: true },
          { id: 'f2', name: 'phone', label: 'Seu WhatsApp', type: 'tel', placeholder: '(11) 99999-9999', required: true },
          { id: 'f3', name: 'email', label: 'Seu Melhor E-mail', type: 'email', placeholder: 'seu@email.com', required: true }
        ],
        actionType: 'thank_you_message',
        successMessage: '🎉 Parabéns! Enviamos o link do E-book diretamente para seu WhatsApp e e-mail cadastrado. Verifique agora!',
        targetStage: 'Novo Lead',
        tags: ['ebook-whatsapp', 'topo-de-funil', 'rd-style']
      },
      faq: {
        enabled: true,
        items: [
          { id: 'f-1', question: 'Em qual formato receberei o conteúdo?', answer: 'Você receberá o arquivo em PDF de alta qualidade + link da planilha modelo.' },
          { id: 'f-2', question: 'Posso compartilhar com meus vendedores?', answer: 'Com certeza! O material foi feito para capacitar sua equipe.' }
        ]
      },
      footer: {
        companyName: 'MDTracker Growth Suite',
        copyrightText: 'Todos os direitos reservados.'
      }
    }
  },
  {
    id: 'tpl-lancamento',
    name: 'Lançamento de Produto com Escassez & Desconto',
    category: 'product_launch',
    categoryLabel: 'Lançamento & Oferta',
    badge: 'Urgência Máxima',
    description: 'Perfeito para lançamentos de produtos físicos, cursos ou novas funcionalidades com contador regressivo ativo e CTA de alta pressão.',
    previewHeroTitle: 'Condição Especial de Lançamento VIP',
    pageData: {
      title: 'Lançamento Exclusivo: Oferta Antecipada de Lote 1',
      slug: 'oferta-especial-lancamento',
      description: 'Garanta sua condição especial de lote antecipado antes que o cronômetro chegue ao fim.',
      category: 'product_launch',
      status: 'published',
      theme: {
        primaryColor: '#7c3aed',
        accentColor: '#f59e0b',
        backgroundColor: 'white',
        fontFamily: 'Poppins',
        buttonStyle: 'rounded-xl'
      },
      hero: {
        badge: '⚡ Lote Antecipado com 30% OFF',
        headline: 'O Momento de Transformar seus Resultados Chegou com Condições Imperdíveis',
        subheadline: 'Garanta seu acesso antecipado antes da virada de lote e tenha direito a todos os bônus e suporte prioritário no WhatsApp.',
        ctaText: 'Garantir Desconto de Lançamento',
        imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80'
      },
      features: [
        { id: 'f1', title: 'Economia Garantida de 30%', description: 'Valor exclusivo válido apenas para os primeiros cadastrados desta página.' },
        { id: 'f2', title: 'Kit de Bônus Premium', description: 'Acesso imediato a templates, planilhas e grupo VIP de networking.' },
        { id: 'f3', title: 'Garantia Incondicional de 7 Dias', description: 'Se não ficar satisfeito com os resultados, devolvemos 100% do seu dinheiro.' }
      ],
      socialProof: {
        enabled: true,
        stats: [
          { label: 'Vagas Restantes', value: '14 Vagas' },
          { label: 'Taxa de Aprovação', value: '99.2%' }
        ]
      },
      countdown: {
        enabled: true,
        title: 'As condições de Lote Antecipado encerram em:',
        endDate: new Date(Date.now() + 86400000 * 2).toISOString()
      },
      form: {
        title: 'Reserve Seu Acesso com Desconto',
        subtitle: 'Preencha seus dados para travar o valor do lote 1.',
        buttonText: 'Garantir Vaga com 30% OFF ⚡',
        buttonColor: '#7c3aed',
        fields: [
          { id: 'f1', name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Seu nome completo', required: true },
          { id: 'f2', name: 'phone', label: 'WhatsApp', type: 'tel', placeholder: '(11) 99999-9999', required: true },
          { id: 'f3', name: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com', required: true }
        ],
        actionType: 'redirect_whatsapp',
        whatsappPhone: '5511999999999',
        whatsappMessage: 'Olá! Vim pela página de lançamento e quero travar meu cupom de 30% de desconto do lote 1.',
        targetStage: 'Em Negociação',
        tags: ['lancamento-lote1', 'oferta-vip', 'rd-style']
      },
      faq: {
        enabled: true,
        items: [
          { id: 'f1', question: 'Quando receberei o acesso?', answer: 'Imediatamente após a confirmação da inscrição pelo WhatsApp.' },
          { id: 'f2', question: 'Quais são as formas de pagamento?', answer: 'Pix com liberação instantânea ou cartão de crédito em até 12x.' }
        ]
      },
      footer: {
        companyName: 'MDTracker Growth Suite',
        copyrightText: 'Todos os direitos reservados.'
      }
    }
  },
  {
    id: 'tpl-evento',
    name: 'Inscrição para Webinar / Evento Online',
    category: 'event_webinar',
    categoryLabel: 'Eventos & Aulas',
    badge: 'Evento Ao Vivo',
    description: 'Estrutura pensada para webinars, workshops ao vivo ou masterclasses com contagem regressiva e lembrete automático no WhatsApp.',
    previewHeroTitle: 'Imersão de Vendas e Conversão Online',
    pageData: {
      title: 'Workshop Online: Como Dobrar sua Taxa de Fechamento',
      slug: 'workshop-vendas-online',
      description: 'Participe do workshop 100% online e gratuito e veja na prática as técnicas mais modernas de fechamento.',
      category: 'event_webinar',
      status: 'published',
      theme: {
        primaryColor: '#ea580c',
        accentColor: '#10b981',
        backgroundColor: 'white',
        fontFamily: 'Montserrat',
        buttonStyle: 'rounded-xl'
      },
      hero: {
        badge: '🔴 Transmissão Ao Vivo & 100% Gratuita',
        headline: 'Workshop Prático: As Estratégias Secretas dos Maiores Vendedores do Brasil',
        subheadline: 'Descubra como estruturar seu processo comercial, abordar leads qualificados e fechar contratos de alto valor sem depender da sorte.',
        ctaText: 'Garantir Meu Ingresso Gratuito',
        imageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1000&q=80'
      },
      features: [
        { id: 'f1', title: 'Aulas 100% Práticas', description: 'Sem enrolação teórica: mostramos tela a tela o que funciona no mercado atual.' },
        { id: 'f2', title: 'Sessão de Perguntas e Respostas', description: 'Tire suas dúvidas diretamente ao vivo com nossos mentores.' },
        { id: 'f3', title: 'Certificado de Participação', description: 'Comprove seu aperfeiçoamento profissional com certificado digital incluso.' }
      ],
      socialProof: {
        enabled: true,
        stats: [
          { label: 'Inscritos Confirmados', value: '+1.800' },
          { label: 'Nota das Edições Anteriores', value: '4.95 ⭐' }
        ]
      },
      countdown: {
        enabled: true,
        title: 'O workshop ao vivo começa em:',
        endDate: new Date(Date.now() + 86400000 * 4).toISOString()
      },
      form: {
        title: 'Inscreva-se Gratuitamente',
        subtitle: 'Enviaremos o link exclusivo da sala no seu WhatsApp.',
        buttonText: 'Confirmar Minha Vaga Grátis 🎟️',
        buttonColor: '#ea580c',
        fields: [
          { id: 'f1', name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Seu nome completo', required: true },
          { id: 'f2', name: 'phone', label: 'WhatsApp para Lembrete', type: 'tel', placeholder: '(11) 99999-9999', required: true },
          { id: 'f3', name: 'email', label: 'E-mail', type: 'email', placeholder: 'seu@email.com', required: true }
        ],
        actionType: 'thank_you_message',
        successMessage: '🎉 Vaga confirmada com sucesso! Enviamos as instruções para o seu WhatsApp.',
        targetStage: 'Novo Lead',
        tags: ['webinar-vendas', 'evento-online', 'rd-station']
      },
      faq: {
        enabled: true,
        items: [
          { id: 'f1', question: 'O evento terá gravação?', answer: 'Apenas os inscritos que participarem ao vivo terão acesso ao replay durante 48h.' },
          { id: 'f2', question: 'Onde será a transmissão?', answer: 'Pelo YouTube em link privado enviado no grupo VIP de WhatsApp.' }
        ]
      },
      footer: {
        companyName: 'MDTracker Growth Suite',
        copyrightText: 'Todos os direitos reservados.'
      }
    }
  }
];

export const LandingPagesManager: React.FC<LandingPagesManagerProps> = ({
  currentCompany,
  products = [],
  onNavigateToTab
}) => {
  const { alert, confirm } = useDialog();

  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'templates'>('list');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Editor Modal State
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [activeEditorTab, setActiveEditorTab] = useState<'general' | 'hero' | 'form' | 'features' | 'social' | 'scarcity' | 'theme'>('general');

  // Preview Interactive Form State
  const [previewFormValues, setPreviewFormValues] = useState<Record<string, string>>({});
  const [previewSubmitStatus, setPreviewSubmitStatus] = useState<string | null>(null);

  // AI Copywriter Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiNiche, setAiNiche] = useState('');
  const [aiSelectedProductId, setAiSelectedProductId] = useState('');
  const [aiAudience, setAiAudience] = useState('');
  const [aiTone, setAiTone] = useState<'persuasivo' | 'profissional' | 'urgente' | 'amigavel'>('persuasivo');
  const [aiCustomPrompt, setAiCustomPrompt] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Load landing pages
  const loadPages = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLandingPages(currentCompany.id);
      setLandingPages(data);
    } catch (err) {
      console.error('Erro ao carregar landing pages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, [currentCompany.id]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const total = landingPages.length;
    const views = landingPages.reduce((acc, lp) => acc + (lp.viewsCount || 0), 0);
    const conversions = landingPages.reduce((acc, lp) => acc + (lp.conversionsCount || 0), 0);
    const conversionRate = views > 0 ? (conversions / views) * 100 : 0;
    const published = landingPages.filter(lp => lp.status === 'published').length;

    return { total, views, conversions, conversionRate, published };
  }, [landingPages]);

  // Filtered List
  const filteredPages = useMemo(() => {
    return landingPages.filter(lp => {
      const matchesCategory = filterCategory === 'all' || lp.category === filterCategory;
      const matchesSearch = 
        lp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lp.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lp.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [landingPages, filterCategory, searchQuery]);

  // Toggle status (published vs draft)
  const handleToggleStatus = async (lp: LandingPage) => {
    const newStatus: LandingPageStatus = lp.status === 'published' ? 'draft' : 'published';
    try {
      const updated = await toggleLandingPage(lp.id, newStatus);
      setLandingPages(prev => prev.map(p => p.id === lp.id ? updated : p));
    } catch (err: any) {
      await alert(err.message || 'Erro ao alterar status');
    }
  };

  // Copy Public Link
  const handleCopyLink = async (slug: string) => {
    const url = `${window.location.origin}/p/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2500);
    } catch {
      await alert(`Link da página: ${url}`);
    }
  };

  // Delete page
  const handleDeletePage = async (lp: LandingPage) => {
    const confirmed = await confirm(`Tem certeza que deseja excluir a Landing Page "${lp.title}"? Todos os acessos a /p/${lp.slug} serão desativados.`);
    if (!confirmed) return;

    try {
      await deleteLandingPage(lp.id);
      setLandingPages(prev => prev.filter(p => p.id !== lp.id));
    } catch (err: any) {
      await alert(err.message || 'Erro ao excluir página');
    }
  };

  // Duplicate page
  const handleDuplicatePage = async (lp: LandingPage) => {
    const newSlug = `${lp.slug}-copia-${Math.floor(Math.random() * 1000)}`;
    const duplicate: Partial<LandingPage> = {
      ...lp,
      id: `lp-${Date.now()}`,
      title: `${lp.title} (Cópia)`,
      slug: newSlug,
      viewsCount: 0,
      conversionsCount: 0,
      status: 'draft'
    };

    try {
      const created = await createLandingPage(duplicate);
      setLandingPages(prev => [created, ...prev]);
      await alert(`Página duplicada com sucesso! URL criada: /p/${newSlug}`);
    } catch (err: any) {
      await alert(err.message || 'Erro ao duplicar página');
    }
  };

  // Create Blank Page
  const handleCreateBlank = () => {
    const newId = `lp-${Date.now()}`;
    const newPage: LandingPage = {
      id: newId,
      companyId: currentCompany.id,
      title: 'Minha Nova Landing Page',
      slug: `oferta-${Math.floor(Math.random() * 10000)}`,
      description: 'Cadastre-se para garantir condições exclusivas.',
      status: 'published',
      category: 'lead_magnet',
      theme: {
        primaryColor: '#2563eb',
        accentColor: '#10b981',
        backgroundColor: 'white',
        fontFamily: 'Inter',
        buttonStyle: 'rounded-xl'
      },
      hero: {
        badge: '🚀 Novidade Exclusiva',
        headline: 'Transforme Seus Resultados Com Nossa Solução Completa',
        subheadline: 'Preencha os campos abaixo e receba atendimento personalizado imediato no seu WhatsApp.',
        ctaText: 'Quero Meu Acesso Agora',
        imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80'
      },
      features: [
        { id: 'f1', title: 'Atendimento Rápido 24/7', description: 'Sem filas de espera, resposta direta com nossa equipe.' },
        { id: 'f2', title: 'Metodologia Validada', description: 'Centenas de clientes já comprovaram a eficiência do processo.' },
        { id: 'f3', title: 'Suporte Consultivo', description: 'Especialistas disponíveis para esclarecer qualquer dúvida.' }
      ],
      socialProof: {
        enabled: true,
        stats: [
          { label: 'Clientes Atendidos', value: '+1.000' },
          { label: 'Satisfação', value: '4.9 ⭐' }
        ],
        testimonials: [
          { id: 't1', name: 'Juliana Costa', role: 'Gerente Comercial', text: 'Adorei a agilidade e a clareza das informações!', rating: 5 }
        ]
      },
      countdown: {
        enabled: false
      },
      form: {
        title: 'Garanta sua Vaga Agora',
        subtitle: 'Leva menos de 1 minuto para preencher.',
        buttonText: 'Quero Garantir Minha Vaga 🚀',
        buttonColor: '#2563eb',
        fields: [
          { id: 'f-name', name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Seu nome completo', required: true },
          { id: 'f-phone', name: 'phone', label: 'WhatsApp com DDD', type: 'tel', placeholder: '(11) 99999-9999', required: true },
          { id: 'f-email', name: 'email', label: 'Seu E-mail', type: 'email', placeholder: 'seu@email.com', required: true }
        ],
        actionType: 'redirect_whatsapp',
        whatsappPhone: '5511999999999',
        whatsappMessage: 'Olá! Vim pela Landing Page e quero mais informações.',
        targetStage: 'Novo Lead',
        tags: ['landing-page', 'rd-style']
      },
      faq: {
        enabled: true,
        items: [
          { id: 'faq-1', question: 'Como recebo o contato?', answer: 'Nossa equipe entrará em contato diretamente pelo WhatsApp informado.' }
        ]
      },
      footer: {
        companyName: currentCompany.name,
        copyrightText: 'Todos os direitos reservados.'
      },
      viewsCount: 0,
      conversionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEditingPage(newPage);
    setActiveEditorTab('general');
  };

  // Use Template
  const handleUseTemplate = (tpl: typeof TEMPLATES[0]) => {
    const newId = `lp-${Date.now()}`;
    const newSlug = `${tpl.pageData.slug || 'oferta'}-${Math.floor(Math.random() * 1000)}`;

    const newPage: LandingPage = {
      ...(tpl.pageData as LandingPage),
      id: newId,
      companyId: currentCompany.id,
      slug: newSlug,
      viewsCount: 0,
      conversionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setEditingPage(newPage);
    setActiveSubTab('list');
    setActiveEditorTab('general');
  };

  // Save Page Changes
  const handleSavePage = async () => {
    if (!editingPage) return;
    if (!editingPage.title.trim()) {
      await alert('Por favor, informe o título da página.');
      return;
    }
    if (!editingPage.slug.trim()) {
      await alert('Por favor, informe a URL (slug) da página.');
      return;
    }

    setIsSaving(true);
    try {
      const exists = landingPages.some(p => p.id === editingPage.id);
      let saved: LandingPage;
      if (exists) {
        saved = await updateLandingPage(editingPage.id, editingPage);
        setLandingPages(prev => prev.map(p => p.id === saved.id ? saved : p));
      } else {
        saved = await createLandingPage(editingPage);
        setLandingPages(prev => [saved, ...prev]);
      }
      setEditingPage(saved);
      await alert(`Landing Page "${saved.title}" salva com sucesso! URL pública: /p/${saved.slug}`);
    } catch (err: any) {
      await alert(err.message || 'Erro ao salvar Landing Page');
    } finally {
      setIsSaving(false);
    }
  };

  // Run AI Copy Generator
  const handleGenerateAI = async () => {
    const selectedProd = products.find(p => p.id === aiSelectedProductId);
    const subject = selectedProd?.name || aiNiche;
    if (!subject.trim()) {
      await alert('Por favor, digite o nicho/produto ou selecione um item do catálogo.');
      return;
    }

    setIsGeneratingAI(true);
    try {
      const result = await generateLandingPageAI({
        productName: selectedProd?.name,
        niche: aiNiche,
        targetAudience: aiAudience,
        tone: aiTone,
        prompt: aiCustomPrompt,
        companyId: currentCompany.id
      });

      if (editingPage && result.success) {
        setEditingPage(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            hero: {
              ...prev.hero,
              badge: result.badge || prev.hero.badge,
              headline: result.headline || prev.hero.headline,
              subheadline: result.subheadline || prev.hero.subheadline,
              ctaText: result.ctaText || prev.hero.ctaText
            },
            features: result.features && result.features.length > 0 
              ? result.features.map((f: any, idx: number) => ({ id: `feat-${Date.now()}-${idx}`, title: f.title, description: f.description }))
              : prev.features,
            socialProof: {
              ...prev.socialProof,
              testimonials: result.testimonials && result.testimonials.length > 0
                ? result.testimonials.map((t: any, idx: number) => ({ id: `test-${Date.now()}-${idx}`, name: t.name, role: t.role, text: t.text, rating: t.rating || 5 }))
                : prev.socialProof.testimonials
            },
            faq: {
              ...prev.faq,
              items: result.faq && result.faq.length > 0
                ? result.faq.map((q: any, idx: number) => ({ id: `faq-${Date.now()}-${idx}`, question: q.question, answer: q.answer }))
                : prev.faq.items
            },
            form: {
              ...prev.form,
              title: result.formTitle || prev.form.title,
              subtitle: result.formSubtitle || prev.form.subtitle,
              buttonText: result.formButtonText || prev.form.buttonText
            }
          };
        });

        setAiModalOpen(false);
        await alert('✨ Conteúdo gerado com IA e aplicado com sucesso à Landing Page!');
      }
    } catch (err: any) {
      await alert(err.message || 'Erro ao gerar conteúdo com IA');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Test form submission right inside the Live Preview
  const handleTestPreviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    setPreviewSubmitStatus('Enviando lead de teste...');
    try {
      const res = await submitLandingPageLead(editingPage.slug, {
        name: previewFormValues['name'] || 'Lead Teste Preview',
        phone: previewFormValues['phone'] || '11999998888',
        email: previewFormValues['email'] || 'teste@leadpreview.com',
        utm_source: 'live_preview',
        utm_campaign: editingPage.slug
      });
      setPreviewSubmitStatus(`✅ Sucesso! Lead criado no CRM. Ação: ${res.actionType}`);
      setTimeout(() => setPreviewSubmitStatus(null), 4000);
    } catch (err: any) {
      setPreviewSubmitStatus(`❌ Erro: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & KPI Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/15 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Estilo RD Station & Hubspot</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Criador de Landing Pages de Alta Conversão
            </h1>
            <p className="text-blue-100 text-sm max-w-2xl leading-relaxed">
              Crie páginas de captura profissionais em minutos, otimizadas para mobile e integradas diretamente ao seu CRM, WhatsApp e automações de nutrição.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveSubTab('templates')}
              className="bg-white/15 hover:bg-white/25 text-white font-semibold px-4 py-2.5 rounded-xl transition text-sm flex items-center gap-2 backdrop-blur-md border border-white/20"
            >
              <Layout className="w-4 h-4" />
              <span>Modelos Prontos</span>
            </button>
            <button
              onClick={handleCreateBlank}
              className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-5 py-2.5 rounded-xl transition text-sm flex items-center gap-2 shadow-lg shadow-black/15"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Landing Page</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15">
          <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-xs text-blue-200 font-medium">Landing Pages Criadas</div>
            <div className="text-2xl font-black text-white mt-1">{metrics.total}</div>
            <div className="text-[11px] text-blue-200 mt-0.5">{metrics.published} publicadas</div>
          </div>
          <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-xs text-blue-200 font-medium">Visualizações Totais</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{metrics.views.toLocaleString()}</div>
            <div className="text-[11px] text-blue-200 mt-0.5">Tráfego direto & anúncios</div>
          </div>
          <div 
            onClick={() => onNavigateToTab?.('leads')}
            className={`p-3.5 rounded-2xl backdrop-blur-sm border transition ${
              onNavigateToTab ? 'bg-white/10 hover:bg-white/20 border-white/20 cursor-pointer group' : 'bg-white/10 border-white/10'
            }`}
            title="Clique para abrir a Gestão de Leads"
          >
            <div className="flex items-center justify-between">
              <div className="text-xs text-blue-200 font-medium">Leads Capturados</div>
              {onNavigateToTab && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded flex items-center gap-0.5 group-hover:bg-emerald-500/30">
                  Ver no CRM <ArrowRight className="w-2.5 h-2.5" />
                </span>
              )}
            </div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{metrics.conversions.toLocaleString()}</div>
            <div className="text-[11px] text-blue-200 mt-0.5">Entraram no CRM & fluxos</div>
          </div>
          <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-sm border border-white/10">
            <div className="text-xs text-blue-200 font-medium">Taxa Média de Conversão</div>
            <div className="text-2xl font-black text-white mt-1">{metrics.conversionRate.toFixed(1)}%</div>
            <div className="text-[11px] text-blue-200 mt-0.5">Benchmark de mercado: 15%</div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('list')}
            className={`px-4 py-2 font-semibold text-sm rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'list'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Minhas Landing Pages</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${activeSubTab === 'list' ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {landingPages.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('templates')}
            className={`px-4 py-2 font-semibold text-sm rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'templates'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Modelos Prontos</span>
            <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
              4 Modelos
            </span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MY LANDING PAGES */}
      {activeSubTab === 'list' && (
        <div className="space-y-4">
          
          {/* Filters & Search */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por título ou slug..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Filtrar:</span>
              {[
                { id: 'all', label: 'Todas' },
                { id: 'lead_magnet', label: 'E-books / Iscas' },
                { id: 'service_consulting', label: 'Consultorias' },
                { id: 'product_launch', label: 'Lançamentos' },
                { id: 'event_webinar', label: 'Webinars' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFilterCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    filterCategory === cat.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-sm">Carregando landing pages...</p>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layout className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">Nenhuma Landing Page encontrada</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                Você ainda não possui páginas criadas nesta categoria ou com este filtro de busca.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveSubTab('templates')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition"
                >
                  Explorar Modelos Prontos
                </button>
                <button
                  onClick={handleCreateBlank}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl text-sm transition"
                >
                  Criar em Branco
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPages.map(lp => {
                const convRate = (lp.viewsCount || 0) > 0 ? (((lp.conversionsCount || 0) / (lp.viewsCount || 1)) * 100).toFixed(1) : '0.0';
                const isPublished = lp.status === 'published';

                return (
                  <div
                    key={lp.id}
                    className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-lg transition flex flex-col justify-between overflow-hidden"
                  >
                    {/* Card Top */}
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          isPublished ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {isPublished ? '● Publicada' : '○ Rascunho'}
                        </span>
                        
                        <span className="text-[11px] text-slate-400 font-mono">
                          /p/{lp.slug}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 line-clamp-1 mb-1.5" title={lp.title}>
                        {lp.title}
                      </h3>
                      
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                        {lp.hero?.subheadline || lp.description || 'Sem descrição cadastrada.'}
                      </p>

                      {/* Mini Metrics Bar */}
                      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Views</div>
                          <div className="text-sm font-bold text-slate-800">{lp.viewsCount || 0}</div>
                        </div>
                        <div 
                          onClick={() => onNavigateToTab?.('leads')}
                          className={`rounded-lg p-0.5 transition ${onNavigateToTab ? 'cursor-pointer hover:bg-emerald-50 hover:ring-1 hover:ring-emerald-300' : ''}`}
                          title={onNavigateToTab ? 'Clique para abrir os leads capturados no CRM' : undefined}
                        >
                          <div className="text-[10px] text-slate-400 font-medium flex items-center justify-center gap-0.5">
                            Leads <Users className="w-2.5 h-2.5 text-emerald-500" />
                          </div>
                          <div className="text-sm font-bold text-emerald-600">{lp.conversionsCount || 0}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-medium">Conversão</div>
                          <div className="text-sm font-bold text-blue-600">{convRate}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <a
                          href={`/p/${lp.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition"
                          title="Abrir página pública"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleCopyLink(lp.slug)}
                          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-lg transition"
                          title="Copiar link"
                        >
                          {copiedSlug === lp.slug ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(lp)}
                          className={`text-xs px-2 py-1 rounded-md font-semibold transition ${
                            isPublished ? 'text-amber-700 hover:bg-amber-100' : 'text-emerald-700 hover:bg-emerald-100'
                          }`}
                          title="Alternar publicação"
                        >
                          {isPublished ? 'Pausar' : 'Ativar'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {onNavigateToTab && (
                          <button
                            onClick={() => onNavigateToTab('leads')}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs px-2.5 py-1.5 rounded-lg transition flex items-center gap-1"
                            title="Ver leads no CRM"
                          >
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Leads</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingPage(lp);
                            setActiveEditorTab('general');
                          }}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          onClick={() => handleDeletePage(lp)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition"
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

        </div>
      )}

      {/* VIEW 2: READY-MADE TEMPLATES */}
      {activeSubTab === 'templates' && (
        <div className="space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold text-slate-900">Biblioteca de Modelos de Landing Pages</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Escolha um modelo validado, personalize os textos e publique em menos de 2 minutos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEMPLATES.map(tpl => (
              <div
                key={tpl.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition flex flex-col justify-between"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {tpl.categoryLabel}
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {tpl.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {tpl.name}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-6">
                    {tpl.description}
                  </p>

                  {/* Mockup Preview Card */}
                  <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-inner border border-slate-800">
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800 text-xs text-slate-400 font-mono">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                      <span className="ml-2">/p/{tpl.pageData.slug}</span>
                    </div>
                    <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">
                      {tpl.pageData.hero?.badge || 'Destaque'}
                    </div>
                    <div className="text-sm font-bold text-white line-clamp-2 mb-2">
                      {tpl.pageData.hero?.headline}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                      <span>✓ Formulário com WhatsApp</span>
                      <span>✓ Mobile Responsivo</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    Inclui FAQ, prova social e contador regressivo
                  </div>
                  <button
                    onClick={() => handleUseTemplate(tpl)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-600/20"
                  >
                    <span>Usar este Modelo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FULL VISUAL BUILDER / EDITOR MODAL                        */}
      {/* ========================================================= */}
      {editingPage && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col justify-between overflow-hidden animate-fade-in">
          
          {/* Top Bar */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setEditingPage(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="Fechar e voltar"
              >
                <X className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    {editingPage.title || 'Landing Page Sem Título'}
                  </h2>
                  <span className="text-xs text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded-md">
                    /p/{editingPage.slug}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Modo de Edição Visual em Tempo Real
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Device Preview Toggle */}
              <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
              </div>

              {/* Generate AI button */}
              <button
                onClick={() => setAiModalOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gerar com IA</span>
              </button>

              {/* External Preview Link */}
              <a
                href={`/p/${editingPage.slug}`}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir Página</span>
              </a>

              {/* Save Button */}
              <button
                onClick={handleSavePage}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-blue-600/30 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Salvar Página</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor Body: Left Tabs Settings + Right Live Device */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT COLUMN: Settings Tabs (Width 440px / Responsive) */}
            <div className="w-full lg:w-[480px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
              
              {/* Settings Tab Selector */}
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-1 overflow-x-auto">
                {[
                  { id: 'general', label: 'Geral & SEO' },
                  { id: 'hero', label: 'Hero / Título' },
                  { id: 'form', label: 'Formulário' },
                  { id: 'features', label: 'Benefícios' },
                  { id: 'social', label: 'Prova Social' },
                  { id: 'scarcity', label: 'FAQ & Timer' },
                  { id: 'theme', label: 'Tema / Cores' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveEditorTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      activeEditorTab === tab.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-200/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content Fields */}
              <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
                
                {/* 1. GERAL & SEO */}
                {activeEditorTab === 'general' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Título Interno da Página
                      </label>
                      <input
                        type="text"
                        value={editingPage.title}
                        onChange={e => setEditingPage({ ...editingPage, title: e.target.value })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Slug / URL Pública
                      </label>
                      <div className="flex items-center">
                        <span className="bg-slate-100 px-3 py-2 border border-r-0 border-slate-300 rounded-l-xl text-slate-500 text-xs font-mono">
                          /p/
                        </span>
                        <input
                          type="text"
                          value={editingPage.slug}
                          onChange={e => {
                            const clean = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
                            setEditingPage({ ...editingPage, slug: clean });
                          }}
                          className="w-full px-3.5 py-2 border border-slate-300 rounded-r-xl font-mono text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Exemplo: consultoria-gratuita, guia-conversao-2026</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Categoria da Oferta
                      </label>
                      <select
                        value={editingPage.category}
                        onChange={e => setEditingPage({ ...editingPage, category: e.target.value as any })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="lead_magnet">Isca Digital / E-book (Topo de Funil)</option>
                        <option value="service_consulting">Consultoria & Diagnóstico B2B</option>
                        <option value="product_launch">Lançamento de Produto com Oferta</option>
                        <option value="event_webinar">Inscrição para Webinar ou Evento</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Status de Publicação
                      </label>
                      <select
                        value={editingPage.status}
                        onChange={e => setEditingPage({ ...editingPage, status: e.target.value as any })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="published">Publicada (Acessível ao público)</option>
                        <option value="draft">Rascunho (Apenas preview)</option>
                        <option value="archived">Arquivada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Descrição SEO (Meta Description)
                      </label>
                      <textarea
                        value={editingPage.description}
                        onChange={e => setEditingPage({ ...editingPage, description: e.target.value })}
                        rows={3}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                        placeholder="Breve resumo da página para o Google e compartilhamento no WhatsApp..."
                      />
                    </div>
                  </div>
                )}

                {/* 2. HERO / TÍTULO */}
                {activeEditorTab === 'hero' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Badge de Destaque
                      </label>
                      <input
                        type="text"
                        value={editingPage.hero?.badge || ''}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          hero: { ...editingPage.hero, badge: e.target.value }
                        })}
                        placeholder="Ex: 🚀 Oferta por Tempo Limitado"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Título Principal (Headline de Impacto)
                      </label>
                      <textarea
                        value={editingPage.hero?.headline || ''}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          hero: { ...editingPage.hero, headline: e.target.value }
                        })}
                        rows={3}
                        placeholder="A frase que captura imediatamente a atenção do lead..."
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Subtítulo Explicativo
                      </label>
                      <textarea
                        value={editingPage.hero?.subheadline || ''}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          hero: { ...editingPage.hero, subheadline: e.target.value }
                        })}
                        rows={3}
                        placeholder="Explique o benefício de forma clara e objetiva..."
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Texto do Botão CTA Principal
                      </label>
                      <input
                        type="text"
                        value={editingPage.hero?.ctaText || ''}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          hero: { ...editingPage.hero, ctaText: e.target.value }
                        })}
                        placeholder="Ex: Quero Meu Diagnóstico Gratuito"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        URL da Imagem de Destaque
                      </label>
                      <input
                        type="text"
                        value={editingPage.hero?.imageUrl || ''}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          hero: { ...editingPage.hero, imageUrl: e.target.value }
                        })}
                        placeholder="https://exemplo.com/imagem.jpg"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* 3. FORMULÁRIO */}
                {activeEditorTab === 'form' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Título do Formulário
                      </label>
                      <input
                        type="text"
                        value={editingPage.form?.title || ''}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          form: { ...editingPage.form, title: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Subtítulo do Formulário
                      </label>
                      <input
                        type="text"
                        value={editingPage.form?.subtitle || ''}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          form: { ...editingPage.form, subtitle: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Texto do Botão de Envio
                      </label>
                      <input
                        type="text"
                        value={editingPage.form?.buttonText || ''}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          form: { ...editingPage.form, buttonText: e.target.value }
                        })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Ação Após Envio do Formulário
                      </label>
                      <select
                        value={editingPage.form?.actionType || 'redirect_whatsapp'}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          form: { ...editingPage.form, actionType: e.target.value as any }
                        })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white mb-3"
                      >
                        <option value="redirect_whatsapp">Abrir WhatsApp com Mensagem Predefinida</option>
                        <option value="thank_you_message">Exibir Mensagem de Sucesso na Tela</option>
                        <option value="custom_url">Redirecionar para URL Externa / Checkout</option>
                      </select>

                      {editingPage.form?.actionType === 'redirect_whatsapp' && (
                        <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Número do WhatsApp de Atendimento (com DDI e DDD)
                            </label>
                            <input
                              type="text"
                              value={editingPage.form?.whatsappPhone || ''}
                              onChange={e => setEditingPage({
                                ...editingPage,
                                form: { ...editingPage.form, whatsappPhone: e.target.value }
                              })}
                              placeholder="Ex: 5511999998888"
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                              Mensagem Predefinida do Lead
                            </label>
                            <textarea
                              value={editingPage.form?.whatsappMessage || ''}
                              onChange={e => setEditingPage({
                                ...editingPage,
                                form: { ...editingPage.form, whatsappMessage: e.target.value }
                              })}
                              rows={2}
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Variáveis disponíveis: {'{nome}'}, {'{empresa}'}</p>
                          </div>
                        </div>
                      )}

                      {editingPage.form?.actionType === 'custom_url' && (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            URL de Redirecionamento
                          </label>
                          <input
                            type="text"
                            value={editingPage.form?.redirectUrl || ''}
                            onChange={e => setEditingPage({
                              ...editingPage,
                              form: { ...editingPage.form, redirectUrl: e.target.value }
                            })}
                            placeholder="https://meusite.com/obrigado"
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                          />
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Estágio do Lead no CRM
                      </label>
                      <select
                        value={editingPage.form?.targetStage || 'Novo Lead'}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          form: { ...editingPage.form, targetStage: e.target.value as FunnelStage }
                        })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                      >
                        {FUNNEL_STAGES.map(stage => (
                          <option key={stage} value={stage}>{stage}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* 4. BENEFÍCIOS */}
                {activeEditorTab === 'features' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Lista de Benefícios ({editingPage.features?.length || 0})
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const newFeatures = [...(editingPage.features || [])];
                          newFeatures.push({
                            id: `feat-${Date.now()}`,
                            title: 'Novo Benefício Exclusivo',
                            description: 'Descreva em poucas linhas o ganho real para o cliente.'
                          });
                          setEditingPage({ ...editingPage, features: newFeatures });
                        }}
                        className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar</span>
                      </button>
                    </div>

                    {(editingPage.features || []).map((feat, idx) => (
                      <div key={feat.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 relative space-y-2">
                        <button
                          type="button"
                          onClick={() => {
                            const newFeatures = editingPage.features.filter((_, i) => i !== idx);
                            setEditingPage({ ...editingPage, features: newFeatures });
                          }}
                          className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                        <div className="text-xs font-bold text-slate-500">Item #{idx + 1}</div>
                        <input
                          type="text"
                          value={feat.title}
                          onChange={e => {
                            const updated = [...editingPage.features];
                            updated[idx].title = e.target.value;
                            setEditingPage({ ...editingPage, features: updated });
                          }}
                          placeholder="Título do Benefício"
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                        />
                        <textarea
                          value={feat.description}
                          onChange={e => {
                            const updated = [...editingPage.features];
                            updated[idx].description = e.target.value;
                            setEditingPage({ ...editingPage, features: updated });
                          }}
                          rows={2}
                          placeholder="Descrição detalhada..."
                          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 5. PROVA SOCIAL */}
                {activeEditorTab === 'social' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                      <div>
                        <div className="font-semibold text-slate-800">Ativar Seção de Prova Social</div>
                        <div className="text-xs text-slate-500">Exibir métricas e depoimentos de clientes</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingPage.socialProof?.enabled || false}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          socialProof: { ...editingPage.socialProof, enabled: e.target.checked }
                        })}
                        className="w-5 h-5 text-blue-600 rounded"
                      />
                    </div>

                    {editingPage.socialProof?.enabled && (
                      <div className="space-y-4">
                        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Depoimentos de Clientes
                        </div>
                        {(editingPage.socialProof.testimonials || []).map((t, idx) => (
                          <div key={t.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                            <input
                              type="text"
                              value={t.name}
                              onChange={e => {
                                const list = [...(editingPage.socialProof.testimonials || [])];
                                list[idx].name = e.target.value;
                                setEditingPage({
                                  ...editingPage,
                                  socialProof: { ...editingPage.socialProof, testimonials: list }
                                });
                              }}
                              placeholder="Nome do cliente"
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                            />
                            <input
                              type="text"
                              value={t.role}
                              onChange={e => {
                                const list = [...(editingPage.socialProof.testimonials || [])];
                                list[idx].role = e.target.value;
                                setEditingPage({
                                  ...editingPage,
                                  socialProof: { ...editingPage.socialProof, testimonials: list }
                                });
                              }}
                              placeholder="Cargo ou empresa"
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                            />
                            <textarea
                              value={t.text}
                              onChange={e => {
                                const list = [...(editingPage.socialProof.testimonials || [])];
                                list[idx].text = e.target.value;
                                setEditingPage({
                                  ...editingPage,
                                  socialProof: { ...editingPage.socialProof, testimonials: list }
                                });
                              }}
                              rows={2}
                              placeholder="Depoimento..."
                              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 6. FAQ & ESCASSEZ */}
                {activeEditorTab === 'scarcity' && (
                  <div className="space-y-5">
                    {/* Countdown Timer */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800">Contador Regressivo (Timer)</div>
                          <div className="text-xs text-slate-500">Cria urgência de vagas ou lote</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={editingPage.countdown?.enabled || false}
                          onChange={e => setEditingPage({
                            ...editingPage,
                            countdown: { ...editingPage.countdown, enabled: e.target.checked }
                          })}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </div>

                      {editingPage.countdown?.enabled && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">
                            Título da Escassez
                          </label>
                          <input
                            type="text"
                            value={editingPage.countdown.title || ''}
                            onChange={e => setEditingPage({
                              ...editingPage,
                              countdown: { ...editingPage.countdown, title: e.target.value }
                            })}
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      )}
                    </div>

                    {/* FAQ */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-800">Perguntas Frequentes (FAQ)</div>
                          <div className="text-xs text-slate-500">Quebre as objeções dos visitantes</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const list = [...(editingPage.faq?.items || [])];
                            list.push({
                              id: `faq-${Date.now()}`,
                              question: 'Nova pergunta comum?',
                              answer: 'Resposta clara e objetiva para tranquilizar o lead.'
                            });
                            setEditingPage({
                              ...editingPage,
                              faq: { enabled: true, items: list }
                            });
                          }}
                          className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar</span>
                        </button>
                      </div>

                      {(editingPage.faq?.items || []).map((faq, idx) => (
                        <div key={faq.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => {
                              const list = editingPage.faq.items?.filter((_, i) => i !== idx);
                              setEditingPage({
                                ...editingPage,
                                faq: { ...editingPage.faq, items: list }
                              });
                            }}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={e => {
                              const list = [...(editingPage.faq.items || [])];
                              list[idx].question = e.target.value;
                              setEditingPage({
                                ...editingPage,
                                faq: { ...editingPage.faq, items: list }
                              });
                            }}
                            placeholder="Pergunta..."
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold"
                          />
                          <textarea
                            value={faq.answer}
                            onChange={e => {
                              const list = [...(editingPage.faq.items || [])];
                              list[idx].answer = e.target.value;
                              setEditingPage({
                                ...editingPage,
                                faq: { ...editingPage.faq, items: list }
                              });
                            }}
                            rows={2}
                            placeholder="Resposta..."
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. TEMA & CORES */}
                {activeEditorTab === 'theme' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Cor Primária (Botões e Destaques)
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={editingPage.theme?.primaryColor || '#2563eb'}
                          onChange={e => setEditingPage({
                            ...editingPage,
                            theme: { ...editingPage.theme, primaryColor: e.target.value }
                          })}
                          className="w-10 h-10 rounded-lg cursor-pointer border border-slate-300"
                        />
                        <div className="flex items-center gap-2">
                          {[
                            { color: '#2563eb', label: 'Azul Real' },
                            { color: '#059669', label: 'Esmeralda' },
                            { color: '#7c3aed', label: 'Roxo Tech' },
                            { color: '#ea580c', label: 'Laranja' }
                          ].map(c => (
                            <button
                              key={c.color}
                              type="button"
                              onClick={() => setEditingPage({
                                ...editingPage,
                                theme: { ...editingPage.theme, primaryColor: c.color }
                              })}
                              className="w-7 h-7 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: c.color }}
                              title={c.label}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Família da Fonte
                      </label>
                      <select
                        value={editingPage.theme?.fontFamily || 'Inter'}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          theme: { ...editingPage.theme, fontFamily: e.target.value as any }
                        })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="Inter">Inter (Moderna & Clean)</option>
                        <option value="Poppins">Poppins (Geométrica & Amigável)</option>
                        <option value="Montserrat">Montserrat (Marcante & Elegante)</option>
                        <option value="Roboto">Roboto (Clássica & Confiável)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Estilo dos Botões
                      </label>
                      <select
                        value={editingPage.theme?.buttonStyle || 'rounded-xl'}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          theme: { ...editingPage.theme, buttonStyle: e.target.value as any }
                        })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white"
                      >
                        <option value="rounded-xl">Arredondamento Moderno (12px)</option>
                        <option value="rounded-full">Estilo Pílula (Totalmente Redondo)</option>
                        <option value="rounded-md">Suave (6px)</option>
                        <option value="square">Quadrado / Reto</option>
                      </select>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* RIGHT COLUMN: Live Interactive Device Preview */}
            <div className="flex-1 bg-slate-950 p-4 md:p-8 flex items-center justify-center overflow-hidden">
              <div
                className={`bg-white transition-all duration-300 overflow-y-auto shadow-2xl relative ${
                  previewDevice === 'mobile'
                    ? 'w-[375px] h-[680px] rounded-[44px] border-[12px] border-slate-800 ring-1 ring-slate-700'
                    : 'w-full h-full rounded-2xl border border-slate-800'
                }`}
                style={{ fontFamily: editingPage.theme?.fontFamily || 'Inter' }}
              >
                {/* Mobile Camera Notch */}
                {previewDevice === 'mobile' && (
                  <div className="sticky top-0 w-full h-6 bg-slate-800 flex items-center justify-center z-50">
                    <div className="w-20 h-4 bg-slate-900 rounded-b-xl"></div>
                  </div>
                )}

                {/* Simulated Top Nav */}
                <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-7 h-7 rounded-lg text-white font-bold flex items-center justify-center text-xs shadow-xs"
                      style={{ backgroundColor: editingPage.theme?.primaryColor || '#2563eb' }}
                    >
                      {(currentCompany.name || 'M').charAt(0)}
                    </div>
                    <span className="font-bold text-slate-900 text-sm">{currentCompany.name}</span>
                  </div>
                  <span 
                    className="text-xs font-bold text-white px-3 py-1.5 rounded-lg shadow-xs"
                    style={{ backgroundColor: editingPage.theme?.primaryColor || '#2563eb' }}
                  >
                    {editingPage.hero?.ctaText || 'Acessar'}
                  </span>
                </div>

                {/* Hero Section */}
                <div className="p-6 md:p-10 bg-gradient-to-b from-white via-slate-50 to-slate-100">
                  {editingPage.hero?.badge && (
                    <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-semibold mb-4">
                      {editingPage.hero.badge}
                    </div>
                  )}

                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-3">
                    {editingPage.hero?.headline || editingPage.title}
                  </h1>

                  <p className="text-sm md:text-base text-slate-600 mb-6 leading-relaxed">
                    {editingPage.hero?.subheadline || editingPage.description}
                  </p>

                  {/* Countdown Timer Preview */}
                  {editingPage.countdown?.enabled && (
                    <div className="p-3 bg-slate-900 text-white rounded-xl mb-6 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold mb-2">
                        {editingPage.countdown.title || 'Oferta encerra em:'}
                      </div>
                      <div className="grid grid-cols-4 gap-1 text-center font-bold">
                        <div className="bg-slate-800 p-1 rounded text-amber-400 text-sm">03d</div>
                        <div className="bg-slate-800 p-1 rounded text-white text-sm">12h</div>
                        <div className="bg-slate-800 p-1 rounded text-white text-sm">45m</div>
                        <div className="bg-slate-800 p-1 rounded text-emerald-400 text-sm">19s</div>
                      </div>
                    </div>
                  )}

                  {/* Simulated Capture Form */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md">
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      {editingPage.form?.title || 'Garanta sua Vaga'}
                    </h3>
                    {editingPage.form?.subtitle && (
                      <p className="text-xs text-slate-500 mb-4">{editingPage.form.subtitle}</p>
                    )}

                    <form onSubmit={handleTestPreviewSubmit} className="space-y-3">
                      {(editingPage.form?.fields || []).map(f => (
                        <div key={f.id}>
                          <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                            {f.label} {f.required && <span className="text-red-500">*</span>}
                          </label>
                          <input
                            type={f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : 'text'}
                            value={previewFormValues[f.name || f.id] || ''}
                            onChange={e => setPreviewFormValues({ ...previewFormValues, [f.name || f.id]: e.target.value })}
                            placeholder={f.placeholder}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                          />
                        </div>
                      ))}

                      {previewSubmitStatus && (
                        <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs rounded-lg font-medium">
                          {previewSubmitStatus}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 font-bold text-xs text-white rounded-xl shadow-md transition"
                        style={{ backgroundColor: editingPage.theme?.primaryColor || '#2563eb' }}
                      >
                        {editingPage.form?.buttonText || 'Enviar Dados Agora'}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Features Section */}
                {(editingPage.features && editingPage.features.length > 0) && (
                  <div className="p-6 md:p-8 bg-white border-t border-slate-200">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-4">
                      Por que nos escolher
                    </div>
                    <div className="space-y-3">
                      {editingPage.features.map((feat, idx) => (
                        <div key={feat.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="font-bold text-xs text-slate-900 mb-0.5">{feat.title}</div>
                          <div className="text-[11px] text-slate-600">{feat.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* FAQ Section */}
                {(editingPage.faq?.enabled && editingPage.faq.items && editingPage.faq.items.length > 0) && (
                  <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-200">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                      Perguntas Frequentes
                    </div>
                    <div className="space-y-2">
                      {editingPage.faq.items.map((faq, idx) => (
                        <div key={faq.id || idx} className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                          <div className="font-bold text-slate-900 mb-1">{faq.question}</div>
                          <div className="text-slate-600 text-[11px]">{faq.answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Footer Preview */}
                <div className="p-6 bg-slate-900 text-slate-400 text-center text-[10px]">
                  &copy; {new Date().getFullYear()} {currentCompany.name}. Todos os direitos reservados.
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* GEMINI AI COPYWRITER MODAL                                */}
      {/* ========================================================= */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Gerar Copy da Landing Page com IA</h3>
                  <p className="text-xs text-slate-500">Crie headline, benefícios, depoimentos e FAQ em segundos</p>
                </div>
              </div>
              <button
                onClick={() => setAiModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Product selector if available */}
              {products.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Selecionar Produto do Catálogo (Opcional)
                  </label>
                  <select
                    value={aiSelectedProductId}
                    onChange={e => {
                      setAiSelectedProductId(e.target.value);
                      const prod = products.find(p => p.id === e.target.value);
                      if (prod) setAiNiche(prod.name);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                  >
                    <option value="">-- Digitar livremente abaixo --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (R$ {p.price.toFixed(2)})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Nicho ou Nome do Produto / Serviço *
                </label>
                <input
                  type="text"
                  value={aiNiche}
                  onChange={e => setAiNiche(e.target.value)}
                  placeholder="Ex: Consultoria Financeira para PMEs / Curso de Inglês para Negócios"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Público-Alvo
                </label>
                <input
                  type="text"
                  value={aiAudience}
                  onChange={e => setAiAudience(e.target.value)}
                  placeholder="Ex: Empresários que querem faturar mais / Profissionais liberais"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Tom de Voz
                </label>
                <select
                  value={aiTone}
                  onChange={e => setAiTone(e.target.value as any)}
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                >
                  <option value="persuasivo">Persuasivo & Focado em Ação (Alta Conversão)</option>
                  <option value="profissional">Profissional & Corporativo (B2B)</option>
                  <option value="urgente">Urgente & Escasso (Lançamentos e Promoções)</option>
                  <option value="amigavel">Amigável & Conector (Relacionamento)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Instruções Adicionais (Opcional)
                </label>
                <textarea
                  value={aiCustomPrompt}
                  onChange={e => setAiCustomPrompt(e.target.value)}
                  rows={2}
                  placeholder="Ex: Focar no medo de perder dinheiro com tráfego sem fechar vendas..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold px-5 py-2 rounded-xl text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gerando Copy com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gerar Conteúdo Completo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
