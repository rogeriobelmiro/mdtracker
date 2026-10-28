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
  AlertCircle,
  ClipboardList,
  ShieldCheck,
  FileDown,
  Video,
  Image as ImageIcon,
  Type as TypeIcon,
  CreditCard,
  ArrowUp,
  ArrowDown,
  Layers,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Flame,
  LayoutTemplate
} from 'lucide-react';
import { 
  LandingPage, 
  LandingPageCategory, 
  LandingPageStatus, 
  LandingPageFormField, 
  LandingPageFeature, 
  LandingPageTestimonial, 
  LandingPageFAQItem, 
  LandingPageCustomBlock,
  LandingPageBlockType,
  LandingPagePricingPlan,
  LandingPageFontFamily,
  Company, 
  Product, 
  FunnelStage,
  FUNNEL_STAGES,
  ThankYouActionType,
  ThankYouActionButton,
  LandingPageThankYouPage,
  Survey,
  MarketingWorkflow
} from '../types';

// Curated High-Converting Stock Images for Non-Technical Users with Search Tags
export interface PresetStockImage {
  title: string;
  url: string;
  category: string;
  tags: string[];
}

const PRESET_STOCK_IMAGES: PresetStockImage[] = [
  // Tecnologia & Software
  {
    title: 'Equipe Tech, Programação & Startup',
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    category: 'Tecnologia',
    tags: ['tecnologia', 'tech', 'startup', 'programador', 'software', 'equipe', 'desenvolvimento', 'computador']
  },
  {
    title: 'Dashboard de Analytics, Dados & Métricas',
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    category: 'Tecnologia',
    tags: ['dashboard', 'analytics', 'dados', 'métricas', 'gráficos', 'tecnologia', 'software', 'telas']
  },
  {
    title: 'Inteligência Artificial, Automação & Futuro',
    url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
    category: 'Tecnologia',
    tags: ['inteligência artificial', 'ia', 'ai', 'robô', 'inovação', 'automação', 'tecnologia', 'futuro']
  },
  {
    title: 'Aplicativo Mobile & Smartphone Moderno',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=80',
    category: 'Tecnologia',
    tags: ['mobile', 'celular', 'smartphone', 'aplicativo', 'app', 'notificações', 'whatsapp', 'tela']
  },

  // Negócios & Consultoria
  {
    title: 'Reunião de Diretoria & Consultoria Estratégica',
    url: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80',
    category: 'Negócios',
    tags: ['reunião', 'consultoria', 'negócios', 'estratégia', 'diretoria', 'empresas', 'executivos']
  },
  {
    title: 'Apresentação em Escritório Corporativo',
    url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    category: 'Negócios',
    tags: ['apresentação', 'palestra', 'reunião', 'escritório', 'equipe', 'pitch', 'treinamento', 'negócios']
  },
  {
    title: 'Aperto de Mãos & Fechamento de Contrato',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=1200&q=80',
    category: 'Negócios',
    tags: ['contrato', 'acordo', 'parceria', 'fechamento', 'aperto de mãos', 'negócios', 'vendas']
  },
  {
    title: 'Planejamento Estratégico & Conversa de Negócios',
    url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80',
    category: 'Negócios',
    tags: ['planejamento', 'estratégia', 'conversa', 'sócios', 'networking', 'gestão', 'negócios']
  },

  // Vendas & Comercial
  {
    title: 'Atendimento Comercial & Sucesso do Cliente',
    url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=1200&q=80',
    category: 'Vendas',
    tags: ['vendas', 'comercial', 'atendimento', 'cliente', 'suporte', 'sorriso', 'vendedora']
  },
  {
    title: 'Inside Sales & Negociação por Voz / Call',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=1200&q=80',
    category: 'Vendas',
    tags: ['call', 'inside sales', 'vendas', 'headset', 'atendimento', 'negociação', 'prospecção']
  },
  {
    title: 'Gráficos de Crescimento & Escala Financeira',
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    category: 'Vendas',
    tags: ['crescimento', 'escala', 'faturamento', 'vendas', 'gráfico', 'lucro', 'resultados']
  },
  {
    title: 'Equipe Celebrando Meta Batida',
    url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    category: 'Vendas',
    tags: ['meta', 'sucesso', 'comemoração', 'vitória', 'equipe', 'resultado', 'vendas', 'motivação']
  },

  // Eventos & Workshop
  {
    title: 'Workshop Presencial com Grande Plateia',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    category: 'Eventos',
    tags: ['workshop', 'evento', 'palestra', 'auditório', 'plateia', 'público', 'conferência', 'imersão']
  },
  {
    title: 'Palestrante no Palco com Microfone',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80',
    category: 'Eventos',
    tags: ['palestrante', 'palco', 'microfone', 'evento', 'seminário', 'liderança', 'apresentador']
  },
  {
    title: 'Treinamento Corporativo & Sala de Imersão',
    url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
    category: 'Eventos',
    tags: ['treinamento', 'aula', 'imersão', 'curso', 'mentor', 'mentoria', 'educação', 'estudos']
  },
  {
    title: 'Estúdio de Gravação & Transmissão Ao Vivo (Live)',
    url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    category: 'Eventos',
    tags: ['live', 'transmissão', 'webinar', 'estúdio', 'gravação', 'câmera', 'podcast', 'youtube']
  },

  // Escritório & Coworking
  {
    title: 'Escritório Moderno & Arquitetura Corporativa',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    category: 'Escritório',
    tags: ['escritório', 'moderno', 'arquitetura', 'espaço', 'corporativo', 'empresa', 'sala', 'design']
  },
  {
    title: 'Mesa de Trabalho Minimalista com Laptop',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    category: 'Escritório',
    tags: ['mesa', 'computador', 'laptop', 'foco', 'produtividade', 'café', 'trabalho', 'home office']
  },
  {
    title: 'Coworking Dinâmico & Ambiente Colaborativo',
    url: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=1200&q=80',
    category: 'Escritório',
    tags: ['coworking', 'ambiente', 'colaboração', 'pessoas', 'trabalho', 'escritório', 'integração']
  },
  {
    title: 'Prédio Empresarial de Grande Porte',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    category: 'Escritório',
    tags: ['prédio', 'empresa', 'fachada', 'arranha-céu', 'corporativo', 'sede', 'autoridade']
  },

  // E-commerce & Logística
  {
    title: 'Caixas de Entrega & Envio Rápido',
    url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1200&q=80',
    category: 'E-commerce',
    tags: ['e-commerce', 'entrega', 'pacote', 'logística', 'frete', 'caixa', 'envio', 'compras']
  },
  {
    title: 'Compras Online & Pagamento Seguro no Celular',
    url: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=1200&q=80',
    category: 'E-commerce',
    tags: ['compras', 'pagamento', 'cartão', 'celular', 'loja', 'e-commerce', 'checkout', 'online']
  },
  {
    title: 'Galpão Logístico & Centro de Distribuição',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    category: 'E-commerce',
    tags: ['galpão', 'estoque', 'logística', 'armazém', 'distribuição', 'caixas', 'escala']
  },

  // Saúde & Bem-estar
  {
    title: 'Clínica Médica & Consultório Moderno',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80',
    category: 'Saúde',
    tags: ['saúde', 'médico', 'médica', 'clínica', 'consultório', 'medicina', 'hospital', 'doutor']
  },
  {
    title: 'Atendimento Médico Humanizado & Cuidado',
    url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80',
    category: 'Saúde',
    tags: ['cuidado', 'saúde', 'atendimento', 'paciente', 'médico', 'confiança', 'bem-estar']
  },
  {
    title: 'Treinamento Físico, Academia & Performance',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80',
    category: 'Saúde',
    tags: ['academia', 'fitness', 'treino', 'exercício', 'saúde', 'performance', 'energia']
  },

  // Black Friday & Promoções
  {
    title: 'Black Friday: Sacolas de Compras & Descontos',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
    category: 'Promoções',
    tags: ['black friday', 'promoção', 'desconto', 'oferta', 'compras', 'sacola', 'liquidação', 'vendas']
  },
  {
    title: 'Caixa de Presente & Oferta Especial Limitada',
    url: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&w=1200&q=80',
    category: 'Promoções',
    tags: ['presente', 'oferta especial', 'desconto', 'black friday', 'promoção', 'bônus', 'oportunidade']
  },
  {
    title: 'Foguete em Lançamento & Escala Acelerada',
    url: 'https://images.unsplash.com/photo-1517976487502-5f6902f1af95?auto=format&fit=crop&w=1200&q=80',
    category: 'Promoções',
    tags: ['foguete', 'lançamento', 'escala', 'crescimento', 'oportunidade', 'futuro', 'alta conversão']
  }
];

const FONT_OPTIONS: Array<{ id: LandingPageFontFamily; name: string; preview: string; description: string }> = [
  { id: 'Inter', name: 'Inter', preview: 'A experiência de conversão moderna', description: 'Clean, neutra e amplamente usada em produtos digitais e SaaS' },
  { id: 'Poppins', name: 'Poppins', preview: 'Geométrica e marcante para vendas', description: 'Arredondada, moderna e com excelente apelo comercial' },
  { id: 'Montserrat', name: 'Montserrat', preview: 'Elegância e presença corporativa', description: 'Alta legibilidade, visual executivo e contemporâneo' },
  { id: 'Roboto', name: 'Roboto', preview: 'Clássica, equilibrada e direta', description: 'Padrão global do ecossistema Google, rápida e confiável' },
  { id: 'Playfair Display', name: 'Playfair Display', preview: 'Sofisticação, luxo e autoridade', description: 'Estilo editorial com serifas, perfeita para consultoria de alto ticket e estética premium' },
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', preview: 'Design SaaS e inovação digital', description: 'Tipografia geométrica moderna criada para interfaces de alta conversão' },
  { id: 'Outfit', name: 'Outfit', preview: 'Minimalista, moderna e arrojada', description: 'Visual vanguardista e contemporâneo' },
  { id: 'Space Grotesk', name: 'Space Grotesk', preview: 'Tecnologia, IA e vanguarda', description: 'Personalidade marcante para tecnologia, inteligência artificial e inovação' },
];

const TITLE_SIZES: Array<{ id: 'normal' | 'large' | 'huge'; label: string; desc: string }> = [
  { id: 'normal', label: 'Equilibrado (Normal)', desc: 'Headlines padrão e harmoniosas (36px a 48px)' },
  { id: 'large', label: 'Impacto Comercial (Grande)', desc: 'Títulos mais destacados para atrair a atenção imediatamente (48px a 60px)' },
  { id: 'huge', label: 'Impacto Máximo (Enorme)', desc: 'Headlines gigantes para ofertas agressivas (60px a 72px)' },
];

const normalizeEmbedUrl = (rawUrl?: string) => {
  if (!rawUrl) return '';
  const url = rawUrl.trim();
  if (url.includes('youtube.com/watch?v=')) {
    const id = url.split('watch?v=')[1]?.split('&')[0];
    return `https://www.youtube.com/embed/${id}?rel=0`;
  }
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${id}?rel=0`;
  }
  if (url.includes('vimeo.com/')) {
    const id = url.split('vimeo.com/')[1]?.split('?')[0];
    return `https://player.vimeo.com/video/${id}`;
  }
  return url;
};

import { 
  fetchLandingPages, 
  createLandingPage, 
  updateLandingPage, 
  deleteLandingPage, 
  toggleLandingPage, 
  generateLandingPageAI,
  submitLandingPageLead,
  fetchSurveys,
  fetchWorkflows
} from '../services/api';
import { useDialog } from '../contexts/DialogContext';
import { NavTabId } from './Sidebar';
import { SurveysManager } from './SurveysManager';
import { CustomDomainsManager } from './CustomDomainsManager';

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
    id: 'tpl-powerup',
    name: 'Power UP - Acelerador de Resultados (Alta Conversão)',
    category: 'lead_magnet',
    categoryLabel: 'Isca Digital & Vendas',
    badge: 'Referência ⭐',
    description: 'Cabeçalho integrado com marca e CTA + Hero Split com Headline, badges de confiança e formulário lateral flutuante com badge de gratuidade e LGPD.',
    previewHeroTitle: 'Como Acelerar seus Resultados com Power UP',
    pageData: {
      title: 'Power UP - Acelerador de Resultados de Alta Performance',
      slug: 'power-up-acelerador',
      description: 'Como Acelerar seus Resultados com Power UP de Forma Previsível e Rápida.',
      category: 'lead_magnet',
      status: 'published',
      theme: {
        primaryColor: '#059669',
        accentColor: '#10b981',
        backgroundColor: 'white',
        fontFamily: 'Inter',
        buttonStyle: 'rounded-xl'
      },
      hero: {
        badge: '🚀 OPORTUNIDADE EXCLUSIVA: POWER UP',
        headline: 'Como Acelerar seus Resultados com Power UP de Forma Previsível e Rápida',
        subheadline: 'Acesse o método prático e validado por centenas de clientes para economizar tempo, evitar erros comuns e maximizar seus retornos.',
        ctaText: 'Quero Meu Acesso Gratuito Agora →',
        imageUrl: ''
      },
      blocks: [
        {
          id: 'blk-header-form-1',
          type: 'header_form',
          title: 'Como Acelerar seus Resultados com Power UP de Forma Previsível e Rápida',
          subtitle: 'Acesse o método prático e validado por centenas de clientes para economizar tempo, evitar erros comuns e maximizar seus retornos.',
          headerNavbarEnabled: true,
          headerLogoText: 'MDTracker Growth Suite',
          headerNavCtaText: 'Quero Meu Acesso Gratuito Agora →',
          headerBadge: '🚀 OPORTUNIDADE EXCLUSIVA: POWER UP',
          headerHeadline: 'Como Acelerar seus Resultados com Power UP de Forma Previsível e Rápida',
          headerSubheadline: 'Acesse o método prático e validado por centenas de clientes para economizar tempo, evitar erros comuns e maximizar seus retornos.',
          headerPrimaryCtaText: 'Quero Meu Acesso Gratuito Agora →',
          headerTrustBadges: ['Acesso Imediato', 'Sem Spam ou Mensagens Indesejadas', 'Privacidade Garantida'],
          formCardBadge: 'CADASTRE-SE GRÁTIS',
          formCardTitle: 'Garanta sua Condição Especial',
          formCardSubtitle: 'Preencha os campos abaixo e receba atendimento exclusivo em minutos.',
          formCardButtonText: 'Quero Começar Agora Mesmo 🚀',
          formPosition: 'right',
          formLgpdNotice: '🔒 Seus dados estão protegidos pela Lei Geral de Proteção de Dados (LGPD).',
          enabled: true,
          backgroundColor: 'white'
        }
      ],
      form: {
        title: 'Garanta sua Condição Especial',
        subtitle: 'Preencha os campos abaixo e receba atendimento exclusivo em minutos.',
        buttonText: 'Quero Começar Agora Mesmo 🚀',
        buttonColor: '#059669',
        fields: [
          { id: 'f-name', name: 'name', label: 'SEU NOME', type: 'text', placeholder: 'Como podemos te chamar?', required: true },
          { id: 'f-phone', name: 'phone', label: 'SEU WHATSAPP', type: 'tel', placeholder: '(11) 99999-9999', required: true },
          { id: 'f-email', name: 'email', label: 'SEU MELHOR E-MAIL', type: 'email', placeholder: 'seu@email.com', required: true }
        ],
        actionType: 'thank_you_page',
        targetStage: 'Novo Lead',
        tags: ['power-up', 'alta-conversao', 'landing-page']
      },
      footer: {
        companyName: 'MDTracker Growth Suite',
        copyrightText: 'Todos os direitos reservados.'
      }
    }
  },
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

const getButtonShapeClass = (shape?: string) => {
  if (shape === 'rounded-full') return 'rounded-full';
  if (shape === 'rounded-md') return 'rounded-md';
  if (shape === 'square') return 'rounded-none';
  return 'rounded-xl';
};

const getQuickDateTime = (type: 'today_midnight' | 'tomorrow_midnight' | 'plus_days', value: number = 0) => {
  const d = new Date();
  if (type === 'today_midnight') {
    d.setHours(23, 59, 0, 0);
  } else if (type === 'tomorrow_midnight') {
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 0, 0);
  } else if (type === 'plus_days') {
    d.setDate(d.getDate() + value);
    d.setHours(23, 59, 0, 0);
  }
  
  const pad = (n: number) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const getTimerRemaining = (endDateStr?: string) => {
  if (!endDateStr) return { days: '03', hours: '14', mins: '45', secs: '22', isExpired: false };
  const target = new Date(endDateStr).getTime();
  const diff = target - Date.now();
  if (isNaN(diff)) return { days: '00', hours: '00', mins: '00', secs: '00', isExpired: false };
  if (diff <= 0) return { days: '00', hours: '00', mins: '00', secs: '00', isExpired: true };
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);
  return {
    days: String(d).padStart(2, '0'),
    hours: String(h).padStart(2, '0'),
    mins: String(m).padStart(2, '0'),
    secs: String(s).padStart(2, '0'),
    isExpired: false
  };
};

export const LandingPagesManager: React.FC<LandingPagesManagerProps> = ({
  currentCompany,
  products = [],
  onNavigateToTab
}) => {
  const { alert, confirm } = useDialog();

  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'templates' | 'surveys' | 'domains'>('list');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Editor Modal State
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile' | 'iframe'>('desktop');
  const [previewPageMode, setPreviewPageMode] = useState<'main' | 'thankyou'>('main');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [previewOpenFaqKey, setPreviewOpenFaqKey] = useState<string | null>(null);
  const [activeEditorTab, setActiveEditorTab] = useState<'blocks' | 'theme' | 'general' | 'hero' | 'form' | 'thankyou' | 'features' | 'social' | 'scarcity'>('blocks');
  const [isAddBlockModalOpen, setIsAddBlockModalOpen] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [activeStockGalleryBlockId, setActiveStockGalleryBlockId] = useState<string | null>(null);
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [imageSearchCategory, setImageSearchCategory] = useState('Todos');
  const [availableSurveys, setAvailableSurveys] = useState<Survey[]>([]);
  const [availableWorkflows, setAvailableWorkflows] = useState<MarketingWorkflow[]>([]);

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

  // 1-second interval ticker for live countdown timers on cards and preview
  const [, setTimerTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerTick(prev => (prev + 1) % 1000000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load landing pages and surveys
  const loadPages = async () => {
    setIsLoading(true);
    try {
      let data = await fetchLandingPages(currentCompany.id);
      
      // Merge with localStorage persistence backup
      try {
        const localSaved: LandingPage[] = JSON.parse(localStorage.getItem('mdtracker_saved_landing_pages') || '[]');
        if (localSaved && localSaved.length > 0) {
          const map = new Map<string, LandingPage>();
          data.forEach(p => map.set(p.id, p));
          localSaved.forEach(p => {
            if (!map.has(p.id)) map.set(p.id, p);
          });
          data = Array.from(map.values());
        }
      } catch(e) {}

      setLandingPages(data);
    } catch (err) {
      console.error('Erro ao carregar landing pages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSurveys = async () => {
    try {
      const data = await fetchSurveys(currentCompany.id);
      setAvailableSurveys(data);
    } catch {}
  };

  const loadWorkflows = async () => {
    try {
      const data = await fetchWorkflows(currentCompany.id);
      setAvailableWorkflows(data);
    } catch {}
  };

  useEffect(() => {
    loadPages();
    loadSurveys();
    loadWorkflows();

    // Check if visitor profile is cached in browser
    try {
      const raw = localStorage.getItem('mdtracker_visitor_profile') || localStorage.getItem('mdtracker_lead_profile');
      if (raw) {
        const p = JSON.parse(raw);
        setPreviewFormValues(prev => ({
          ...prev,
          name: p.name || prev.name || '',
          phone: p.phone || prev.phone || '',
          email: p.email || prev.email || '',
          company: p.company || prev.company || ''
        }));
      }
    } catch(e) {}
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
    setActiveEditorTab('blocks');
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
    setActiveEditorTab('blocks');
  };

  // Block Operations (RD Station modular builder)
  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (!editingPage) return;
    const blocks = [...(editingPage.blocks || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;
    const temp = blocks[index];
    blocks[index] = blocks[targetIndex];
    blocks[targetIndex] = temp;
    setEditingPage({
      ...editingPage,
      blocks
    });
  };

  const removeBlock = (index: number) => {
    if (!editingPage) return;
    const blocks = [...(editingPage.blocks || [])];
    blocks.splice(index, 1);
    setEditingPage({
      ...editingPage,
      blocks
    });
  };

  const toggleBlockEnabled = (index: number) => {
    if (!editingPage) return;
    const blocks = [...(editingPage.blocks || [])];
    blocks[index] = { ...blocks[index], enabled: blocks[index].enabled === false ? true : false };
    setEditingPage({
      ...editingPage,
      blocks
    });
  };

  const initializeDefaultBlocks = () => {
    if (!editingPage) return;
    const defaultBlocks: LandingPageCustomBlock[] = [
      {
        id: `blk-features-${Date.now()}`,
        type: 'features',
        title: 'Tudo que você precisa para acelerar seu negócio',
        subtitle: 'Diferenciais validados para gerar mais resultados',
        enabled: true,
        backgroundColor: 'white',
        features: (editingPage.features && editingPage.features.length > 0) ? editingPage.features : [
          { id: 'f1', title: 'Atendimento Rápido 24/7', description: 'Sem filas de espera, contato direto no WhatsApp com nossa equipe.' },
          { id: 'f2', title: 'Metodologia Validada', description: 'Centenas de clientes já comprovaram a eficiência do processo.' },
          { id: 'f3', title: 'Suporte Consultivo Dedicado', description: 'Especialistas disponíveis para esclarecer dúvidas e personalizar sua solução.' }
        ]
      },
      {
        id: `blk-video-${Date.now() + 1}`,
        type: 'video',
        title: 'Conheça Como Funciona na Prática',
        subtitle: 'Assista a uma demonstração rápida de 2 minutos sobre nossa plataforma',
        enabled: true,
        backgroundColor: 'slate',
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        videoCaption: 'Demonstração em vídeo de alta qualidade'
      },
      {
        id: `blk-image-${Date.now() + 2}`,
        type: 'image',
        title: 'Estrutura Moderna & Alta Conversão',
        subtitle: 'Ambiente planejado para proporcionar a melhor experiência ao cliente',
        imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80',
        imageAlt: 'Equipe em consultoria comercial',
        imageCaption: 'Equipe especializada pronta para atender sua demanda',
        enabled: true,
        backgroundColor: 'white'
      },
      {
        id: `blk-social-${Date.now() + 3}`,
        type: 'socialProof',
        title: 'Resultados Comprovados por Quem Já Usa',
        subtitle: 'Centenas de empresas já aceleraram seus resultados com nossa solução',
        enabled: true,
        backgroundColor: 'dark',
        stats: (editingPage.socialProof?.stats && editingPage.socialProof.stats.length > 0) ? editingPage.socialProof.stats : [
          { label: 'Empresas Atendidas', value: '+450' },
          { label: 'Aumento de Vendas', value: '+42%' },
          { label: 'Nota Média', value: '4.9 ⭐' }
        ],
        testimonials: (editingPage.socialProof?.testimonials && editingPage.socialProof.testimonials.length > 0) ? editingPage.socialProof.testimonials : [
          { id: 't1', name: 'Mariana Silveira', role: 'Diretora Comercial', text: 'Excelente solução! O retorno sobre o investimento foi imediato e o atendimento é impecável.', rating: 5 },
          { id: 't2', name: 'Carlos Eduardo Ramos', role: 'Fundador - EcomBrasil', text: 'O processo direto de tráfego com qualificação no WhatsApp mudou totalmente nosso faturamento.', rating: 5 }
        ]
      },
      {
        id: `blk-pricing-${Date.now() + 4}`,
        type: 'pricing',
        title: 'Planos e Condições Transparentes',
        subtitle: 'Escolha a opção ideal para o momento da sua empresa',
        enabled: true,
        backgroundColor: 'white',
        pricingPlans: [
          {
            id: 'p1',
            name: 'Plano Essencial',
            price: 'R$ 197',
            period: 'mês',
            description: 'Para autônomos e pequenos negócios',
            features: ['Páginas responsivas', 'Formulário integrado', 'Página de obrigado', 'Suporte comercial'],
            highlighted: false,
            buttonText: 'Escolher Essencial',
            buttonUrl: '#preview-capture-form'
          },
          {
            id: 'p2',
            name: 'Plano Pro Acelerador',
            price: 'R$ 497',
            period: 'mês',
            description: 'A opção mais escolhida por empresas em escala',
            features: ['Leads ilimitados', 'Vídeos e imagens sem limites', 'Pesquisas de qualificação completas', 'Domínio próprio ilimitado', 'Suporte prioritário no WhatsApp'],
            highlighted: true,
            badge: 'Mais Recomendado',
            buttonText: 'Garantir Vaga Pro',
            buttonUrl: '#preview-capture-form'
          }
        ]
      },
      {
        id: `blk-faq-${Date.now() + 5}`,
        type: 'faq',
        title: 'Perguntas Frequentes',
        subtitle: 'Respostas para as principais dúvidas sobre o processo',
        enabled: true,
        backgroundColor: 'slate',
        faqItems: (editingPage.faq?.items && editingPage.faq.items.length > 0) ? editingPage.faq.items : [
          { id: 'q1', question: 'Preciso de conhecimento técnico para usar?', answer: 'Não! O construtor é 100% visual. Você inclui blocos, vídeos e imagens clicando na tela.' },
          { id: 'q2', question: 'Posso usar meu próprio domínio?', answer: 'Sim! É possível conectar domínios próprios (como suaempresa.com.br) com certificado SSL automático gratuito.' }
        ]
      },
      {
        id: `blk-cta-${Date.now() + 6}`,
        type: 'cta_banner',
        title: 'Pronto para Transformar seus Resultados Comerciais?',
        subtitle: 'Cadastre-se agora mesmo e receba atendimento exclusivo da nossa equipe.',
        enabled: true,
        backgroundColor: 'primary',
        ctaHeadline: 'Pronto para Transformar seus Resultados Comerciais?',
        ctaSubheadline: 'Cadastre-se agora mesmo e receba atendimento exclusivo da nossa equipe.',
        ctaButtonText: 'Quero Meu Acesso Agora',
        ctaButtonUrl: '#preview-capture-form',
        ctaBadge: 'Vagas Limitadas'
      }
    ];

    setEditingPage({
      ...editingPage,
      blocks: defaultBlocks
    });
  };

  const handleAddBlock = (type: LandingPageBlockType) => {
    if (!editingPage) return;
    const newBlockId = `blk-${type}-${Date.now()}`;
    let newBlock: LandingPageCustomBlock;

    switch (type) {
      case 'header_form':
        newBlock = {
          id: newBlockId,
          type: 'header_form',
          title: 'Como Acelerar seus Resultados com Power UP de Forma Previsível e Rápida',
          subtitle: 'Acesse o método prático e validado por centenas de clientes para economizar tempo, evitar erros comuns e maximizar seus retornos.',
          headerNavbarEnabled: true,
          headerLogoText: currentCompany.name ? `${currentCompany.name} Growth Suite` : 'MDTracker Growth Suite',
          headerNavCtaText: 'Quero Meu Acesso Gratuito Agora →',
          headerBadge: '🚀 OPORTUNIDADE EXCLUSIVA: POWER UP',
          headerHeadline: 'Como Acelerar seus Resultados com Power UP de Forma Previsível e Rápida',
          headerSubheadline: 'Acesse o método prático e validado por centenas de clientes para economizar tempo, evitar erros comuns e maximizar seus retornos.',
          headerPrimaryCtaText: 'Quero Meu Acesso Gratuito Agora →',
          headerTrustBadges: ['Acesso Imediato', 'Sem Spam ou Mensagens Indesejadas', 'Privacidade Garantida'],
          formCardBadge: 'CADASTRE-SE GRÁTIS',
          formCardTitle: 'Garanta sua Condição Especial',
          formCardSubtitle: 'Preencha os campos abaixo e receba atendimento exclusivo em minutos.',
          formCardButtonText: 'Quero Começar Agora Mesmo 🚀',
          formPosition: 'right',
          formLgpdNotice: '🔒 Seus dados estão protegidos pela Lei Geral de Proteção de Dados (LGPD).',
          enabled: true,
          backgroundColor: 'white'
        };
        break;
      case 'video':
        newBlock = {
          id: newBlockId,
          type: 'video',
          title: 'Assista à Apresentação em Vídeo',
          subtitle: 'Veja como nossa tecnologia funciona na prática em apenas 2 minutos',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoCaption: 'Vídeo explicativo oficial em alta qualidade',
          enabled: true,
          backgroundColor: 'slate'
        };
        break;
      case 'image':
        newBlock = {
          id: newBlockId,
          type: 'image',
          title: 'Conheça Nossa Estrutura & Solução',
          subtitle: 'Ambiente planejado para proporcionar resultados consistentes',
          imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80',
          imageAlt: 'Ambiente de trabalho e reunião de consultoria',
          imageCaption: 'Equipe especializada pronta para impulsionar seus resultados',
          enabled: true,
          backgroundColor: 'white'
        };
        break;
      case 'text':
        newBlock = {
          id: newBlockId,
          type: 'text',
          title: 'Nossa Metodologia & Propósito',
          subtitle: 'Como desenvolvemos um processo de alta conversão',
          textContent: 'Ao longo dos últimos anos, desenvolvemos uma metodologia validada por centenas de empresas.\\n\\nNosso compromisso é entregar clareza, transparência e agilidade para que você alcance resultados sólidos sem complicações técnicas.',
          textAlignment: 'left',
          enabled: true,
          backgroundColor: 'white'
        };
        break;
      case 'features':
        newBlock = {
          id: newBlockId,
          type: 'features',
          title: 'Por que Nossa Solução é Diferente',
          subtitle: 'Principais vantagens para acelerar seu negócio',
          features: [
            { id: 'f1', title: 'Velocidade de Carregamento', description: 'Páginas otimizadas para abrir instantaneamente em qualquer dispositivo móvel.' },
            { id: 'f2', title: 'Integração Direta no WhatsApp', description: 'Receba leads qualificados diretamente na mão dos seus atendentes comerciais.' },
            { id: 'f3', title: 'Controle Total Sem Código', description: 'Edite blocos, textos, imagens e vídeos sem depender de programadores.' }
          ],
          enabled: true,
          backgroundColor: 'white'
        };
        break;
      case 'socialProof':
        newBlock = {
          id: newBlockId,
          type: 'socialProof',
          title: 'Resultados Comprovados por Nossos Clientes',
          subtitle: 'Veja o que quem já usa nossa tecnologia tem a dizer',
          stats: [
            { label: 'Leads Gerados', value: '+50.000' },
            { label: 'Taxa de Satisfação', value: '99.4%' },
            { label: 'Empresas Ativas', value: '+450' }
          ],
          testimonials: [
            { id: 't1', name: 'Rodrigo Mendonça', role: 'CEO - Mendonça Consultoria', text: 'A facilidade de criar páginas completas com vídeo e imagens aumentou nossa conversão em mais de 35% no primeiro mês.', rating: 5 },
            { id: 't2', name: 'Juliana Costa', role: 'Diretora de Marketing', text: 'Sensacional! Qualquer pessoa na equipe consegue criar e alterar os blocos em minutos sem suporte de TI.', rating: 5 }
          ],
          enabled: true,
          backgroundColor: 'dark'
        };
        break;
      case 'pricing':
        newBlock = {
          id: newBlockId,
          type: 'pricing',
          title: 'Escolha a Opção Ideal para Você',
          subtitle: 'Condições transparentes sem surpresas ou taxas escondidas',
          pricingPlans: [
            {
              id: 'p1',
              name: 'Plano Básico',
              price: 'R$ 97',
              period: 'mês',
              description: 'Para quem está iniciando sua presença digital',
              features: ['Páginas responsivas', 'Formulário integrado', 'Suporte por e-mail'],
              highlighted: false,
              buttonText: 'Escolher Básico',
              buttonUrl: '#preview-capture-form'
            },
            {
              id: 'p2',
              name: 'Plano Pro Acelerador',
              price: 'R$ 297',
              period: 'mês',
              description: 'Nossa melhor opção com todos os recursos liberados',
              features: ['Leads ilimitados', 'Vídeos e imagens sem limite', 'Páginas de obrigado personalizadas', 'Pesquisas de qualificação', 'Domínio próprio ilimitado'],
              highlighted: true,
              badge: 'Mais Vendido',
              buttonText: 'Quero o Plano Pro',
              buttonUrl: '#preview-capture-form'
            }
          ],
          enabled: true,
          backgroundColor: 'white'
        };
        break;
      case 'faq':
        newBlock = {
          id: newBlockId,
          type: 'faq',
          title: 'Perguntas Frequentes',
          subtitle: 'Tire todas as suas dúvidas antes de dar o próximo passo',
          faqItems: [
            { id: 'q1', question: 'Como funciona o acesso após o cadastro?', answer: 'Você receberá os dados de acesso imediatamente na página de obrigado e uma notificação por WhatsApp.' },
            { id: 'q2', question: 'Posso alterar os vídeos e textos quando quiser?', answer: 'Sim, a qualquer momento pelo editor visual sem necessidade de nenhum código.' }
          ],
          enabled: true,
          backgroundColor: 'slate'
        };
        break;
      case 'countdown':
        newBlock = {
          id: newBlockId,
          type: 'countdown',
          title: 'Condição Especial Encerra Em Breve',
          countdownTitle: 'Garanta sua condição exclusiva antes que o cronômetro zere:',
          enabled: true,
          backgroundColor: 'dark'
        };
        break;
      case 'cta_banner':
        newBlock = {
          id: newBlockId,
          type: 'cta_banner',
          title: 'Pronto para Dar o Próximo Passo?',
          subtitle: 'Cadastre-se agora e receba atendimento exclusivo da nossa equipe.',
          ctaHeadline: 'Pronto para Dar o Próximo Passo?',
          ctaSubheadline: 'Cadastre-se agora e receba atendimento exclusivo da nossa equipe.',
          ctaButtonText: 'Quero Meu Acesso Agora',
          ctaButtonUrl: '#preview-capture-form',
          ctaBadge: 'Vagas Limitadas',
          enabled: true,
          backgroundColor: 'primary'
        };
        break;
      default:
        return;
    }

    const updatedBlocks = [...(editingPage.blocks || []), newBlock];
    setEditingPage({
      ...editingPage,
      blocks: updatedBlocks
    });
    setIsAddBlockModalOpen(false);
    setExpandedBlockId(newBlockId);
  };


  // Save Page Changes
  const handleSavePage = async () => {
    if (!editingPage) return;
    if (!editingPage.title.trim()) {
      alert('Por favor, informe o título da página.');
      return;
    }
    if (!editingPage.slug.trim()) {
      alert('Por favor, informe a URL (slug) da página.');
      return;
    }

    setIsSaving(true);
    try {
      const exists = landingPages.some(p => p.id === editingPage.id);
      let saved: LandingPage;
      if (exists) {
        try {
          saved = await updateLandingPage(editingPage.id, editingPage);
        } catch (updateErr: any) {
          // If update failed (e.g. 404 or backend session reset), fallback to create/upsert
          saved = await createLandingPage(editingPage);
        }
        setLandingPages(prev => prev.map(p => p.id === saved.id ? saved : p));
      } else {
        saved = await createLandingPage(editingPage);
        setLandingPages(prev => [saved, ...prev]);
      }
      setEditingPage(saved);

      // Persist in localStorage backup so user never loses their changes
      try {
        const localSaved: LandingPage[] = JSON.parse(localStorage.getItem('mdtracker_saved_landing_pages') || '[]');
        const updatedLocal = [saved, ...localSaved.filter(p => p.id !== saved.id)];
        localStorage.setItem('mdtracker_saved_landing_pages', JSON.stringify(updatedLocal));
      } catch(e) {}

      alert(`Landing Page "${saved.title}" salva com sucesso!\nURL pública: /p/${saved.slug}`);
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar Landing Page');
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
          <button
            onClick={() => setActiveSubTab('surveys')}
            className={`px-4 py-2 font-semibold text-sm rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'surveys'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Pesquisas & Formulários</span>
            <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">
              NPS
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('domains')}
            className={`px-4 py-2 font-semibold text-sm rounded-xl transition flex items-center gap-2 ${
              activeSubTab === 'domains'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Domínios Próprios & DNS</span>
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

                      {/* Tempo & Redirecionamento Dinâmico */}
                      {(() => {
                        const countdownConfig = lp.countdown?.enabled
                          ? lp.countdown
                          : lp.blocks?.find(b => b.type === 'countdown' && b.enabled !== false)
                            ? {
                                enabled: true,
                                endDate: lp.blocks.find(b => b.type === 'countdown')?.countdownEndDate || lp.countdown?.endDate,
                                redirectOnExpire: lp.blocks.find(b => b.type === 'countdown')?.countdownRedirectOnExpire ?? lp.countdown?.redirectOnExpire,
                                redirectType: lp.blocks.find(b => b.type === 'countdown')?.countdownRedirectType || lp.countdown?.redirectType || 'page',
                                redirectPageSlug: lp.blocks.find(b => b.type === 'countdown')?.countdownRedirectPageSlug || lp.countdown?.redirectPageSlug,
                                redirectUrl: lp.blocks.find(b => b.type === 'countdown')?.countdownRedirectUrl || lp.countdown?.redirectUrl,
                              }
                            : null;

                        const cd = countdownConfig?.enabled ? getTimerRemaining(countdownConfig.endDate) : null;
                        const targetPage = countdownConfig?.redirectType === 'custom_url'
                          ? null
                          : countdownConfig?.redirectPageSlug
                            ? landingPages.find(p => p.slug === countdownConfig.redirectPageSlug)
                            : null;
                        const targetLabel = countdownConfig?.redirectType === 'custom_url'
                          ? countdownConfig.redirectUrl
                          : targetPage ? targetPage.title : (countdownConfig?.redirectPageSlug ? `/p/${countdownConfig.redirectPageSlug}` : null);

                        const formattedEndDate = countdownConfig?.endDate 
                          ? (() => {
                              try {
                                const d = new Date(countdownConfig.endDate);
                                if (isNaN(d.getTime())) return countdownConfig.endDate;
                                return `${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
                              } catch {
                                return countdownConfig.endDate;
                              }
                            })()
                          : null;

                        if (countdownConfig?.enabled && cd) {
                          return (
                            <div 
                              onClick={() => {
                                setEditingPage(lp);
                                setActiveEditorTab('scarcity');
                              }}
                              className={`mt-3 p-2.5 rounded-xl border text-xs flex flex-col gap-2 transition cursor-pointer hover:shadow-xs ${
                                cd.isExpired
                                  ? 'bg-rose-50/80 border-rose-200 text-rose-900 hover:border-rose-300'
                                  : 'bg-amber-50/80 border-amber-200 text-amber-900 hover:border-amber-300'
                              }`}
                              title="Clique para editar o tempo e o redirecionamento"
                            >
                              {/* Tempo Restante / Status */}
                              <div className="flex items-center justify-between gap-1.5">
                                <div className="flex items-center gap-1.5">
                                  <Clock className={`w-3.5 h-3.5 shrink-0 ${cd.isExpired ? 'text-rose-600' : 'text-amber-600 animate-pulse'}`} />
                                  <span className="font-bold text-[11px] uppercase tracking-wider">
                                    {cd.isExpired ? 'Tempo Esgotado' : 'Tempo Restante'}
                                  </span>
                                </div>
                                <div className="font-mono font-black text-xs">
                                  {cd.isExpired ? (
                                    <span className="text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-300 shadow-2xs font-bold text-[11px]">
                                      Expirado ⚠️
                                    </span>
                                  ) : (
                                    <span className="text-slate-900 bg-white px-2 py-0.5 rounded-md border border-amber-300 shadow-2xs font-extrabold text-[11px]">
                                      {cd.days}d {cd.hours}h {cd.mins}m {cd.secs}s
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Data Limite */}
                              {formattedEndDate && (
                                <div className="text-[10px] text-slate-500 flex items-center justify-between px-0.5">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>Término:</span>
                                  </span>
                                  <span className="font-mono font-semibold text-slate-700">{formattedEndDate}</span>
                                </div>
                              )}

                              {/* Redirecionamento Automático */}
                              {countdownConfig.redirectOnExpire !== false && (
                                <div className="pt-1.5 border-t border-slate-200/70 flex items-center justify-between gap-1 text-[11px]">
                                  <span className="text-slate-600 font-medium flex items-center gap-1 shrink-0">
                                    <ArrowRight className="w-3 h-3 text-blue-600 shrink-0" />
                                    <span>Redireciona:</span>
                                  </span>
                                  <span 
                                    className="font-bold text-blue-700 truncate max-w-[160px] bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-right" 
                                    title={targetLabel || 'Sem destino definido'}
                                  >
                                    {targetLabel || <span className="text-slate-400 italic font-normal">Sem destino</span>}
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div 
                            onClick={() => {
                              setEditingPage(lp);
                              setActiveEditorTab('scarcity');
                            }}
                            className="mt-3 p-2 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] text-slate-400 cursor-pointer hover:bg-slate-100/80 transition"
                            title="Clique para ativar o temporizador e redirecionamento"
                          >
                            <span className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 text-slate-300" />
                              <span>Tempo & Redirecionamento:</span>
                            </span>
                            <span className="text-blue-600 font-semibold text-[10px] hover:underline">+ Configurar</span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1">
                        <a
                          href={`/p/${lp.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg transition"
                          title="Abrir página pública principal"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <a
                          href={`/p/${lp.slug}/obrigado`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                          title="Abrir página de obrigado (WhatsApp / PDFs / Pesquisa)"
                        >
                          <Sparkles className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleCopyLink(lp.slug)}
                          className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-white rounded-lg transition"
                          title="Copiar link da página principal"
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

      {/* VIEW 3: SURVEYS & NPS */}
      {activeSubTab === 'surveys' && (
        <SurveysManager currentCompany={currentCompany} />
      )}

      {/* VIEW 4: CUSTOM DOMAINS & DNS */}
      {activeSubTab === 'domains' && (
        <CustomDomainsManager currentCompany={currentCompany} />
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
              {/* Preview Page Switcher (Principal vs Obrigado) */}
              <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  type="button"
                  onClick={() => setPreviewPageMode('main')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    previewPageMode === 'main' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Ver Página de Captura Principal"
                >
                  Principal
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewPageMode('thankyou')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    previewPageMode === 'thankyou' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Ver Página de Obrigado Pós-Conversão"
                >
                  Obrigado 🎉
                </button>
              </div>

              {/* Device Preview Toggle */}
              <div className="hidden sm:flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    previewDevice === 'desktop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Visualização Desktop idêntica à Web"
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    previewDevice === 'mobile' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Visualização Mobile em Smartphone"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Mobile</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('iframe')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    previewDevice === 'iframe' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Visualização Web Real via Iframe (/p/:slug)"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Iframe Web</span>
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
                href={previewPageMode === 'thankyou' ? `/p/${editingPage.slug}/obrigado` : `/p/${editingPage.slug}`}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-3 py-2 rounded-xl transition flex items-center gap-1.5 border border-slate-700"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{previewPageMode === 'thankyou' ? 'Abrir Obrigado' : 'Abrir Página'}</span>
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
                  { id: 'blocks', label: 'Blocos & Seções 🧱' },
                  { id: 'theme', label: 'Tipografia & Cores 🎨' },
                  { id: 'general', label: 'Geral & SEO' },
                  { id: 'hero', label: 'Hero / Título' },
                  { id: 'form', label: 'Formulário' },
                  { id: 'thankyou', label: 'Página de Obrigado 🎉' },
                  { id: 'features', label: 'Benefícios' },
                  { id: 'social', label: 'Prova Social' },
                  { id: 'scarcity', label: 'FAQ & Timer' }
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
                
                {/* 0. BLOCOS & SEÇÕES (RD STATION BUILDER) */}
                {activeEditorTab === 'blocks' && (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                          <span>Estrutura Visual da Página</span>
                          <span className="text-xs font-normal text-slate-500">
                            ({(editingPage.blocks || []).length} blocos)
                          </span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Arraste, adicione vídeos, imagens e reordene as seções da página.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsAddBlockModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar Bloco</span>
                      </button>
                    </div>

                    {(!editingPage.blocks || editingPage.blocks.length === 0) ? (
                      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                          <Layers className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">Nenhum bloco modular configurado</h4>
                          <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                            Inicialize com os blocos recomendados de alta conversão (Vídeo, Fotos, Diferenciais, Preços, Depoimentos e FAQ).
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
                          <button
                            type="button"
                            onClick={initializeDefaultBlocks}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Inserir Blocos Recomendados</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddBlockModalOpen(true)}
                            className="w-full sm:w-auto bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Escolher Bloco</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {editingPage.blocks.map((block, idx) => {
                          const isExpanded = expandedBlockId === block.id;
                          const blockLabels: Record<LandingPageBlockType, { label: string; icon: any; color: string }> = {
                            header_form: { label: 'Cabeçalho com Texto & Formulário', icon: LayoutTemplate, color: 'text-emerald-600 bg-emerald-50' },
                            video: { label: 'Vídeo em Destaque', icon: Video, color: 'text-red-600 bg-red-50' },
                            image: { label: 'Imagem / Banner', icon: ImageIcon, color: 'text-indigo-600 bg-indigo-50' },
                            text: { label: 'Texto Narrativo', icon: TypeIcon, color: 'text-slate-700 bg-slate-100' },
                            features: { label: 'Benefícios & Diferenciais', icon: Layers, color: 'text-blue-600 bg-blue-50' },
                            socialProof: { label: 'Prova Social & Depoimentos', icon: Star, color: 'text-amber-600 bg-amber-50' },
                            pricing: { label: 'Tabela de Preços / Planos', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
                            faq: { label: 'Perguntas Frequentes (FAQ)', icon: HelpCircle, color: 'text-purple-600 bg-purple-50' },
                            countdown: { label: 'Timer de Escassez', icon: Clock, color: 'text-orange-600 bg-orange-50' },
                            cta_banner: { label: 'Banner de Ação (CTA)', icon: Sparkles, color: 'text-cyan-600 bg-cyan-50' },
                            hero: { label: 'Hero / Destaque', icon: Layout, color: 'text-blue-600 bg-blue-50' }
                          };

                          const meta = blockLabels[block.type] || { label: block.type, icon: Layers, color: 'text-slate-600 bg-slate-100' };
                          const IconComp = meta.icon;

                          return (
                            <div 
                              key={block.id || idx}
                              className={`border rounded-2xl transition bg-white shadow-xs ${
                                isExpanded ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              {/* Header Card */}
                              <div className="p-3.5 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  {/* Up / Down Controls */}
                                  <div className="flex flex-col gap-0.5">
                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => moveBlock(idx, 'up')}
                                      className="p-1 rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                                      title="Mover para Cima"
                                    >
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === (editingPage.blocks?.length || 1) - 1}
                                      onClick={() => moveBlock(idx, 'down')}
                                      className="p-1 rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-30 disabled:hover:bg-transparent"
                                      title="Mover para Baixo"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {/* Block Type Badge */}
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                                    <IconComp className="w-4 h-4" />
                                  </div>

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-xs truncate">
                                        {block.title || meta.label}
                                      </span>
                                      <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded font-mono">
                                        #{idx + 1}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-slate-500 block truncate">
                                      {meta.label}
                                    </span>
                                  </div>
                                </div>

                                {/* Right Controls */}
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => toggleBlockEnabled(idx)}
                                    className={`p-1.5 rounded-lg text-xs transition ${
                                      block.enabled !== false 
                                        ? 'text-emerald-600 hover:bg-emerald-50' 
                                        : 'text-slate-400 hover:bg-slate-100'
                                    }`}
                                    title={block.enabled !== false ? 'Bloco Visível' : 'Bloco Oculto'}
                                  >
                                    {block.enabled !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                                    className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                                      isExpanded ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                    title="Editar Bloco"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => removeBlock(idx)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                                    title="Excluir Bloco"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Accordion Detail / Content Editor */}
                              {isExpanded && (
                                <div className="p-4 bg-slate-50/70 border-t border-slate-200/80 rounded-b-2xl space-y-4 text-xs">
                                  {/* Common Block Appearance */}
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                        Cor de Fundo do Bloco
                                      </label>
                                      <select
                                        value={block.backgroundColor || 'white'}
                                        onChange={e => {
                                          const blocks = [...(editingPage.blocks || [])];
                                          blocks[idx] = { ...block, backgroundColor: e.target.value as any };
                                          setEditingPage({ ...editingPage, blocks });
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                      >
                                        <option value="white">⚪ Branco Puro</option>
                                        <option value="slate">🔘 Cinza Suave (Slate)</option>
                                        <option value="dark">🌑 Escuro Elegante (Dark)</option>
                                        <option value="primary">🎨 Cor Primária da Marca</option>
                                      </select>
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                        Status de Exibição
                                      </label>
                                      <select
                                        value={block.enabled !== false ? 'true' : 'false'}
                                        onChange={e => {
                                          const blocks = [...(editingPage.blocks || [])];
                                          blocks[idx] = { ...block, enabled: e.target.value === 'true' };
                                          setEditingPage({ ...editingPage, blocks });
                                        }}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                      >
                                        <option value="true">✅ Exibir no Site</option>
                                        <option value="false">🚫 Ocultar Temporariamente</option>
                                      </select>
                                    </div>
                                  </div>

                                  {/* Common Title & Subtitle */}
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                      Título do Bloco
                                    </label>
                                    <input
                                      type="text"
                                      value={block.title || block.headerHeadline || ''}
                                      onChange={e => {
                                        const val = e.target.value;
                                        const blocks = [...(editingPage.blocks || [])];
                                        blocks[idx] = { 
                                          ...block, 
                                          title: val,
                                          ...(block.type === 'header_form' ? { headerHeadline: val } : {})
                                        };
                                        setEditingPage({ ...editingPage, blocks });
                                      }}
                                      placeholder="Ex: Conheça os diferenciais..."
                                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                      Subtítulo ou Texto de Apoio
                                    </label>
                                    <input
                                      type="text"
                                      value={block.subtitle || block.headerSubheadline || ''}
                                      onChange={e => {
                                        const val = e.target.value;
                                        const blocks = [...(editingPage.blocks || [])];
                                        blocks[idx] = { 
                                          ...block, 
                                          subtitle: val,
                                          ...(block.type === 'header_form' ? { headerSubheadline: val } : {})
                                        };
                                        setEditingPage({ ...editingPage, blocks });
                                      }}
                                      placeholder="Ex: Assista ao vídeo de 2 minutos demonstrativo..."
                                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                    />
                                  </div>

                                  {/* Specific Fields: HEADER_FORM (Split Layout Power UP) */}
                                  {block.type === 'header_form' && (
                                    <div className="space-y-4 pt-2 border-t border-slate-200">
                                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
                                          <LayoutTemplate className="w-4 h-4 text-emerald-600" />
                                          <span>Cabeçalho Dividido (Hero + Formulário Integrado)</span>
                                        </div>
                                        <p className="text-[11px] text-emerald-700">
                                          Este bloco une a proposta de valor e o formulário em tela dividida, exatamente como no layout de alta conversão Power UP.
                                        </p>
                                      </div>

                                      {/* Form Position in Visual Structure */}
                                      <div className="grid grid-cols-2 gap-2">
                                        <div>
                                          <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                            Posição do Formulário
                                          </label>
                                          <select
                                            value={block.formPosition || 'right'}
                                            onChange={e => {
                                              const blocks = [...(editingPage.blocks || [])];
                                              blocks[idx] = { ...block, formPosition: e.target.value as 'right' | 'left' };
                                              setEditingPage({ ...editingPage, blocks });
                                            }}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold"
                                          >
                                            <option value="right">👉 Formulário na Direita</option>
                                            <option value="left">👈 Formulário na Esquerda</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                            Barra Superior de Marca
                                          </label>
                                          <select
                                            value={block.headerNavbarEnabled !== false ? 'true' : 'false'}
                                            onChange={e => {
                                              const blocks = [...(editingPage.blocks || [])];
                                              blocks[idx] = { ...block, headerNavbarEnabled: e.target.value === 'true' };
                                              setEditingPage({ ...editingPage, blocks });
                                            }}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                          >
                                            <option value="true">✅ Exibir Barra de Topo</option>
                                            <option value="false">🚫 Ocultar Barra de Topo</option>
                                          </select>
                                        </div>
                                      </div>

                                      {block.headerNavbarEnabled !== false && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                          <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                              Nome / Marca no Topo
                                            </label>
                                            <input
                                              type="text"
                                              value={block.headerLogoText || ''}
                                              onChange={e => {
                                                const blocks = [...(editingPage.blocks || [])];
                                                blocks[idx] = { ...block, headerLogoText: e.target.value };
                                                setEditingPage({ ...editingPage, blocks });
                                              }}
                                              placeholder="Ex: MDTracker Growth Suite"
                                              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                              Botão CTA da Barra
                                            </label>
                                            <input
                                              type="text"
                                              value={block.headerNavCtaText || ''}
                                              onChange={e => {
                                                const blocks = [...(editingPage.blocks || [])];
                                                blocks[idx] = { ...block, headerNavCtaText: e.target.value };
                                                setEditingPage({ ...editingPage, blocks });
                                              }}
                                              placeholder="Ex: Quero Meu Acesso Gratuito Agora →"
                                              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {/* Hero / Copy fields */}
                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                          Selo de Destaque Superior (Badge)
                                        </label>
                                        <input
                                          type="text"
                                          value={block.headerBadge || ''}
                                          onChange={e => {
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, headerBadge: e.target.value };
                                            setEditingPage({ ...editingPage, blocks });
                                          }}
                                          placeholder="Ex: 🚀 OPORTUNIDADE EXCLUSIVA: POWER UP"
                                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                          Título Principal (Headline)
                                        </label>
                                        <textarea
                                          value={block.headerHeadline || block.title || ''}
                                          onChange={e => {
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, headerHeadline: e.target.value, title: e.target.value };
                                            setEditingPage({ ...editingPage, blocks });
                                          }}
                                          rows={2}
                                          placeholder="Ex: Como Acelerar seus Resultados com Power UP de Forma Previsível e Rápida"
                                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-bold"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                          Subtítulo / Descrição de Apoio
                                        </label>
                                        <textarea
                                          value={block.headerSubheadline || block.subtitle || ''}
                                          onChange={e => {
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, headerSubheadline: e.target.value, subtitle: e.target.value };
                                            setEditingPage({ ...editingPage, blocks });
                                          }}
                                          rows={2}
                                          placeholder="Acesse o método prático e validado por centenas de clientes..."
                                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                          Texto do Botão Principal do Hero
                                        </label>
                                        <input
                                          type="text"
                                          value={block.headerPrimaryCtaText || ''}
                                          onChange={e => {
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, headerPrimaryCtaText: e.target.value };
                                            setEditingPage({ ...editingPage, blocks });
                                          }}
                                          placeholder="Ex: Quero Meu Acesso Gratuito Agora →"
                                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                          Selos de Confiança (um por linha)
                                        </label>
                                        <textarea
                                          value={(block.headerTrustBadges || ['Acesso Imediato', 'Sem Spam ou Mensagens Indesejadas', 'Privacidade Garantida']).join('\n')}
                                          onChange={e => {
                                            const badges = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, headerTrustBadges: badges };
                                            setEditingPage({ ...editingPage, blocks });
                                          }}
                                          rows={3}
                                          placeholder="Acesso Imediato&#10;Sem Spam ou Mensagens Indesejadas&#10;Privacidade Garantida"
                                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-mono"
                                        />
                                      </div>

                                      {/* Form Card Configuration */}
                                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                                        <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                          Configurações do Card de Formulário
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                          <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                              Selo do Card (Badge)
                                            </label>
                                            <input
                                              type="text"
                                              value={block.formCardBadge || ''}
                                              onChange={e => {
                                                const blocks = [...(editingPage.blocks || [])];
                                                blocks[idx] = { ...block, formCardBadge: e.target.value };
                                                setEditingPage({ ...editingPage, blocks });
                                              }}
                                              placeholder="Ex: CADASTRE-SE GRÁTIS"
                                              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                              Botão do Formulário
                                            </label>
                                            <input
                                              type="text"
                                              value={block.formCardButtonText || ''}
                                              onChange={e => {
                                                const blocks = [...(editingPage.blocks || [])];
                                                blocks[idx] = { ...block, formCardButtonText: e.target.value };
                                                setEditingPage({ ...editingPage, blocks });
                                              }}
                                              placeholder="Ex: Quero Começar Agora Mesmo 🚀"
                                              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                            />
                                          </div>
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                            Título do Card de Formulário
                                          </label>
                                          <input
                                            type="text"
                                            value={block.formCardTitle || ''}
                                            onChange={e => {
                                              const blocks = [...(editingPage.blocks || [])];
                                              blocks[idx] = { ...block, formCardTitle: e.target.value };
                                              setEditingPage({ ...editingPage, blocks });
                                            }}
                                            placeholder="Ex: Garanta sua Condição Especial"
                                            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-bold"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                            Subtítulo do Card de Formulário
                                          </label>
                                          <input
                                            type="text"
                                            value={block.formCardSubtitle || ''}
                                            onChange={e => {
                                              const blocks = [...(editingPage.blocks || [])];
                                              blocks[idx] = { ...block, formCardSubtitle: e.target.value };
                                              setEditingPage({ ...editingPage, blocks });
                                            }}
                                            placeholder="Ex: Preencha os campos abaixo e receba atendimento exclusivo em minutos."
                                            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                          />
                                        </div>

                                        <div>
                                          <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                            Aviso de Privacidade / LGPD
                                          </label>
                                          <input
                                            type="text"
                                            value={block.formLgpdNotice || ''}
                                            onChange={e => {
                                              const blocks = [...(editingPage.blocks || [])];
                                              blocks[idx] = { ...block, formLgpdNotice: e.target.value };
                                              setEditingPage({ ...editingPage, blocks });
                                            }}
                                            placeholder="Ex: 🔒 Seus dados estão protegidos pela Lei Geral de Proteção de Dados (LGPD)."
                                            className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Specific Fields: VIDEO */}
                                  {block.type === 'video' && (
                                    <div className="space-y-3 pt-2 border-t border-slate-200">
                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                          Link do Vídeo (YouTube, Vimeo ou MP4)
                                        </label>
                                        <input
                                          type="text"
                                          value={block.videoUrl || ''}
                                          onChange={e => {
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, videoUrl: e.target.value };
                                            setEditingPage({ ...editingPage, blocks });
                                          }}
                                          placeholder="https://www.youtube.com/watch?v=..."
                                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-mono"
                                        />
                                        <p className="text-[11px] text-slate-500 mt-1">
                                          💡 Cole qualquer link do YouTube (inclusive <code>youtu.be</code>) ou Vimeo. Convertemos para player responsivo sem cortes.
                                        </p>
                                      </div>
                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                          Legenda do Vídeo
                                        </label>
                                        <input
                                          type="text"
                                          value={block.videoCaption || ''}
                                          onChange={e => {
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, videoCaption: e.target.value };
                                            setEditingPage({ ...editingPage, blocks });
                                          }}
                                          placeholder="Ex: Vídeo gravado com nossa diretoria comercial"
                                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Specific Fields: IMAGE */}
                                  {block.type === 'image' && (() => {
                                    const isGalleryOpen = activeStockGalleryBlockId === block.id;
                                    
                                    // Categories available
                                    const stockCategories = ['Todos', 'Negócios', 'Tecnologia', 'Vendas', 'Eventos', 'Escritório', 'E-commerce', 'Saúde', 'Promoções'];
                                    
                                    // Filter images based on search query and category
                                    const filteredStockImages = PRESET_STOCK_IMAGES.filter(img => {
                                      const matchCategory = imageSearchCategory === 'Todos' || img.category.toLowerCase() === imageSearchCategory.toLowerCase();
                                      if (!matchCategory) return false;
                                      if (!imageSearchQuery.trim()) return true;
                                      const q = imageSearchQuery.toLowerCase().trim();
                                      return (
                                        img.title.toLowerCase().includes(q) ||
                                        img.category.toLowerCase().includes(q) ||
                                        img.tags.some(t => t.toLowerCase().includes(q))
                                      );
                                    });

                                    return (
                                      <div className="space-y-4 pt-2 border-t border-slate-200">
                                        {/* URL da Imagem com Botão de Pesquisa por Assunto */}
                                        <div>
                                          <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                                              URL da Imagem
                                            </label>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (isGalleryOpen) {
                                                  setActiveStockGalleryBlockId(null);
                                                } else {
                                                  setActiveStockGalleryBlockId(block.id);
                                                }
                                              }}
                                              className={`font-bold text-xs px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-xs border ${
                                                isGalleryOpen
                                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                                              }`}
                                            >
                                              <Search className="w-3.5 h-3.5" />
                                              <span>{isGalleryOpen ? 'Fechar Pesquisa' : 'Pesquisar por Assunto 🔍'}</span>
                                            </button>
                                          </div>
                                          
                                          <div className="relative">
                                            <input
                                              type="text"
                                              value={block.imageUrl || ''}
                                              onChange={e => {
                                                const blocks = [...(editingPage.blocks || [])];
                                                blocks[idx] = { ...block, imageUrl: e.target.value };
                                                setEditingPage({ ...editingPage, blocks });
                                              }}
                                              placeholder="https://images.unsplash.com/... ou cole qualquer link"
                                              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-mono text-slate-800 focus:outline-none focus:border-blue-500"
                                            />
                                          </div>
                                        </div>

                                        {/* Pesquisador de Imagens por Assunto Integrado */}
                                        {isGalleryOpen && (
                                          <div className="bg-slate-50 p-3.5 rounded-2xl border-2 border-blue-200 shadow-sm space-y-3 animate-in fade-in duration-200">
                                            <div className="flex items-center justify-between">
                                              <div className="flex items-center gap-1.5">
                                                <Sparkles className="w-4 h-4 text-amber-500" />
                                                <span className="text-xs font-bold text-slate-900">
                                                  Banco de Fotos em Alta Resolução (Unsplash)
                                                </span>
                                              </div>
                                              <span className="text-[11px] font-semibold text-slate-500">
                                                {filteredStockImages.length} fotos encontradas
                                              </span>
                                            </div>

                                            {/* Campo de Busca por Assunto */}
                                            <div className="relative">
                                              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                              <input
                                                type="text"
                                                value={imageSearchQuery}
                                                onChange={e => setImageSearchQuery(e.target.value)}
                                                placeholder="Digite o assunto (ex: tecnologia, reunião, vendas, evento, saúde, escritório...)"
                                                className="w-full pl-9 pr-8 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                                autoFocus
                                              />
                                              {imageSearchQuery && (
                                                <button
                                                  type="button"
                                                  onClick={() => setImageSearchQuery('')}
                                                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                                                >
                                                  <X className="w-3.5 h-3.5" />
                                                </button>
                                              )}
                                            </div>

                                            {/* Filtro por Categorias / Assuntos Rápidos */}
                                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                                              {stockCategories.map(cat => (
                                                <button
                                                  key={cat}
                                                  type="button"
                                                  onClick={() => setImageSearchCategory(cat)}
                                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition cursor-pointer ${
                                                    imageSearchCategory === cat
                                                      ? 'bg-blue-600 text-white shadow-xs'
                                                      : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                                                  }`}
                                                >
                                                  {cat}
                                                </button>
                                              ))}
                                            </div>

                                            {/* Grade de Fotos */}
                                            {filteredStockImages.length > 0 ? (
                                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
                                                {filteredStockImages.map((img, sIdx) => (
                                                  <button
                                                    key={sIdx}
                                                    type="button"
                                                    onClick={() => {
                                                      const blocks = [...(editingPage.blocks || [])];
                                                      blocks[idx] = { 
                                                        ...block, 
                                                        imageUrl: img.url,
                                                        imageAlt: img.title
                                                      };
                                                      setEditingPage({ ...editingPage, blocks });
                                                      setActiveStockGalleryBlockId(null);
                                                    }}
                                                    className="group text-left border border-slate-200 bg-white rounded-xl overflow-hidden hover:border-blue-500 hover:ring-2 hover:ring-blue-200 transition cursor-pointer shadow-xs"
                                                    title={`Clique para aplicar: ${img.title}`}
                                                  >
                                                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                                                      <img 
                                                        src={img.url} 
                                                        alt={img.title} 
                                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                                                        loading="lazy"
                                                      />
                                                      <span className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                        {img.category}
                                                      </span>
                                                    </div>
                                                    <div className="p-1.5">
                                                      <span className="text-[10px] font-semibold text-slate-700 block truncate group-hover:text-blue-600">
                                                        {img.title}
                                                      </span>
                                                    </div>
                                                  </button>
                                                ))}
                                              </div>
                                            ) : (
                                              <div className="p-4 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                                                <p className="text-xs text-slate-600">
                                                  Nenhuma foto cadastrada para "<span className="font-bold">{imageSearchQuery}</span>".
                                                </p>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const blocks = [...(editingPage.blocks || [])];
                                                    const autoUnsplashUrl = `https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80`;
                                                    blocks[idx] = { 
                                                      ...block, 
                                                      imageUrl: autoUnsplashUrl,
                                                      imageAlt: `Imagem sobre ${imageSearchQuery}`
                                                    };
                                                    setEditingPage({ ...editingPage, blocks });
                                                    setActiveStockGalleryBlockId(null);
                                                  }}
                                                  className="text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                                                >
                                                  <Sparkles className="w-3.5 h-3.5" />
                                                  <span>Aplicar foto de alta qualidade sobre "{imageSearchQuery}"</span>
                                                </button>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {/* OPÇÃO DE LARGURA / TAMANHO DA IMAGEM */}
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                                          <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                                            Largura & Enquadramento da Imagem
                                          </label>
                                          <div className="grid grid-cols-2 gap-2">
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const blocks = [...(editingPage.blocks || [])];
                                                blocks[idx] = { ...block, imageWidth: 'contained' };
                                                setEditingPage({ ...editingPage, blocks });
                                              }}
                                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                                (!block.imageWidth || block.imageWidth === 'contained')
                                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                              }`}
                                            >
                                              <span>🎯 Centralizada (Contida)</span>
                                            </button>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const blocks = [...(editingPage.blocks || [])];
                                                blocks[idx] = { ...block, imageWidth: 'full' };
                                                setEditingPage({ ...editingPage, blocks });
                                              }}
                                              className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                                block.imageWidth === 'full'
                                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                              }`}
                                            >
                                              <span>📐 Estendida (Largura Inteira)</span>
                                            </button>
                                          </div>
                                          <p className="text-[10px] text-slate-500 leading-snug">
                                            {block.imageWidth === 'full'
                                              ? 'A imagem preencherá 100% da largura da tela (formato banner estendido com visual impactante).'
                                              : 'A imagem fica centralizada no meio da tela com bordas arredondadas e sombra elegante.'}
                                          </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                          <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                              Texto Alternativo (Alt)
                                            </label>
                                            <input
                                              type="text"
                                              value={block.imageAlt || ''}
                                              onChange={e => {
                                                const blocks = [...(editingPage.blocks || [])];
                                                blocks[idx] = { ...block, imageAlt: e.target.value };
                                                setEditingPage({ ...editingPage, blocks });
                                              }}
                                              placeholder="Ex: Foto do escritório"
                                              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                              Legenda da Foto
                                            </label>
                                            <input
                                              type="text"
                                              value={block.imageCaption || ''}
                                              onChange={e => {
                                                const blocks = [...(editingPage.blocks || [])];
                                                blocks[idx] = { ...block, imageCaption: e.target.value };
                                                setEditingPage({ ...editingPage, blocks });
                                              }}
                                              placeholder="Ex: Sede em São Paulo"
                                              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* Specific Fields: TEXT */}
                                  {block.type === 'text' && (
                                    <div className="space-y-3 pt-2 border-t border-slate-200">
                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                          Alinhamento do Texto
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                          {(['left', 'center', 'right'] as const).map(align => (
                                            <button
                                              key={align}
                                              type="button"
                                              onClick={() => {
                                                const blocks = [...(editingPage.blocks || [])];
                                                blocks[idx] = { ...block, textAlignment: align };
                                                setEditingPage({ ...editingPage, blocks });
                                              }}
                                              className={`py-1.5 rounded-lg border text-xs font-semibold capitalize ${
                                                (block.textAlignment || 'left') === align
                                                  ? 'bg-blue-600 text-white border-blue-600'
                                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                              }`}
                                            >
                                              {align === 'left' ? 'Esquerda' : align === 'center' ? 'Centro' : 'Direita'}
                                            </button>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                          Conteúdo do Texto (Parágrafos)
                                        </label>
                                        <textarea
                                          value={block.textContent || ''}
                                          onChange={e => {
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, textContent: e.target.value };
                                            setEditingPage({ ...editingPage, blocks });
                                          }}
                                          rows={5}
                                          placeholder="Digite seus parágrafos aqui. Dê duas quebras de linha para separar parágrafos..."
                                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl bg-white text-xs leading-relaxed"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Specific Fields: PRICING */}
                                  {block.type === 'pricing' && (
                                    <div className="space-y-3 pt-2 border-t border-slate-200">
                                      <div className="flex items-center justify-between">
                                        <label className="text-[11px] font-semibold text-slate-700 uppercase">
                                          Planos / Pacotes
                                        </label>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const plans = [...(block.pricingPlans || [])];
                                            plans.push({
                                              id: `plan-${Date.now()}`,
                                              name: `Novo Plano ${plans.length + 1}`,
                                              price: 'R$ 197',
                                              period: 'mês',
                                              features: ['Acesso completo', 'Suporte prioritário'],
                                              buttonText: 'Garantir Vaga',
                                              buttonUrl: '#preview-capture-form'
                                            });
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, pricingPlans: plans };
                                            setEditingPage({ ...editingPage, blocks });
                                          }}
                                          className="text-blue-600 hover:text-blue-700 font-bold text-xs flex items-center gap-1"
                                        >
                                          <Plus className="w-3 h-3" />
                                          <span>Adicionar Plano</span>
                                        </button>
                                      </div>

                                      {(block.pricingPlans || []).map((plan, pIdx) => (
                                        <div key={plan.id || pIdx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                                          <div className="flex items-center justify-between">
                                            <span className="font-bold text-xs text-slate-800">Plano #{pIdx + 1}</span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const plans = [...(block.pricingPlans || [])];
                                                plans.splice(pIdx, 1);
                                                const blocks = [...(editingPage.blocks || [])];
                                                blocks[idx] = { ...block, pricingPlans: plans };
                                                setEditingPage({ ...editingPage, blocks });
                                              }}
                                              className="text-red-500 hover:text-red-700 p-1"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2">
                                            <input
                                              type="text"
                                              value={plan.name}
                                              onChange={e => {
                                                const plans = [...(block.pricingPlans || [])];
                                                plans[pIdx] = { ...plan, name: e.target.value };
                                                const blocks = [...(editingPage.blocks || [])];
                                                blocks[idx] = { ...block, pricingPlans: plans };
                                                setEditingPage({ ...editingPage, blocks });
                                              }}
                                              placeholder="Nome do Plano"
                                              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                            />
                                            <input
                                              type="text"
                                              value={plan.price}
                                              onChange={e => {
                                                const plans = [...(block.pricingPlans || [])];
                                                plans[pIdx] = { ...plan, price: e.target.value };
                                                const blocks = [...(editingPage.blocks || [])];
                                                blocks[idx] = { ...block, pricingPlans: plans };
                                                setEditingPage({ ...editingPage, blocks });
                                              }}
                                              placeholder="Preço (ex: R$ 297)"
                                              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                            />
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <label className="flex items-center gap-1.5 text-[11px] text-slate-700 cursor-pointer">
                                              <input
                                                type="checkbox"
                                                checked={plan.highlighted || false}
                                                onChange={e => {
                                                  const plans = [...(block.pricingPlans || [])];
                                                  plans[pIdx] = { ...plan, highlighted: e.target.checked };
                                                  const blocks = [...(editingPage.blocks || [])];
                                                  blocks[idx] = { ...block, pricingPlans: plans };
                                                  setEditingPage({ ...editingPage, blocks });
                                                }}
                                                className="rounded text-blue-600"
                                              />
                                              <span>Destacar como "Mais Popular ⭐"</span>
                                            </label>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Specific Fields: CTA BANNER */}
                                  {block.type === 'cta_banner' && (
                                    <div className="space-y-3 pt-2 border-t border-slate-200">
                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                          Texto do Botão de Ação
                                        </label>
                                        <input
                                          type="text"
                                          value={block.ctaButtonText || ''}
                                          onChange={e => {
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, ctaButtonText: e.target.value };
                                            setEditingPage({ ...editingPage, blocks });
                                          }}
                                          placeholder="Quero Meu Acesso Agora"
                                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                        />
                                      </div>
                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                          Selo Superior do Banner
                                        </label>
                                        <input
                                          type="text"
                                          value={block.ctaBadge || ''}
                                          onChange={e => {
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, ctaBadge: e.target.value };
                                            setEditingPage({ ...editingPage, blocks });
                                          }}
                                          placeholder="Vagas Limitadas"
                                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Specific Fields: COUNTDOWN TIMER */}
                                  {block.type === 'countdown' && (
                                    <div className="space-y-3 pt-2 border-t border-slate-200">
                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                          Título do Contador de Escassez
                                        </label>
                                        <input
                                          type="text"
                                          value={block.countdownTitle || ''}
                                          onChange={e => {
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, countdownTitle: e.target.value };
                                            setEditingPage({ ...editingPage, blocks });
                                          }}
                                          placeholder="Garanta sua vaga antes que o cronômetro zere:"
                                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-medium"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                          Data e Hora de Encerramento (Prazo Limite)
                                        </label>
                                        <input
                                          type="datetime-local"
                                          value={block.countdownEndDate ? block.countdownEndDate.substring(0, 16) : ''}
                                          onChange={e => {
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, countdownEndDate: e.target.value };
                                            setEditingPage({ ...editingPage, blocks });
                                          }}
                                          className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-mono"
                                        />
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const blocks = [...(editingPage.blocks || [])];
                                              blocks[idx] = { ...block, countdownEndDate: getQuickDateTime('today_midnight') };
                                              setEditingPage({ ...editingPage, blocks });
                                            }}
                                            className="px-2.5 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                                          >
                                            Hoje 23:59
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const blocks = [...(editingPage.blocks || [])];
                                              blocks[idx] = { ...block, countdownEndDate: getQuickDateTime('tomorrow_midnight') };
                                              setEditingPage({ ...editingPage, blocks });
                                            }}
                                            className="px-2.5 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                                          >
                                            Amanhã 23:59
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const blocks = [...(editingPage.blocks || [])];
                                              blocks[idx] = { ...block, countdownEndDate: getQuickDateTime('plus_days', 3) };
                                              setEditingPage({ ...editingPage, blocks });
                                            }}
                                            className="px-2.5 py-1 text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                                          >
                                            +3 Dias
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const blocks = [...(editingPage.blocks || [])];
                                              blocks[idx] = { ...block, countdownEndDate: getQuickDateTime('plus_days', 7) };
                                              setEditingPage({ ...editingPage, blocks });
                                            }}
                                            className="px-2.5 py-1 text-[10px] font-semibold bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition"
                                          >
                                            +7 Dias (Vendas)
                                          </button>
                                        </div>
                                      </div>

                                      {/* Redirection Options */}
                                      <div className="pt-2 border-t border-slate-200/80">
                                        <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer mb-2">
                                          <input
                                            type="checkbox"
                                            checked={block.countdownRedirectOnExpire !== false}
                                            onChange={e => {
                                              const blocks = [...(editingPage.blocks || [])];
                                              blocks[idx] = { ...block, countdownRedirectOnExpire: e.target.checked };
                                              setEditingPage({ ...editingPage, blocks });
                                            }}
                                            className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                          />
                                          <span>Redirecionar automaticamente quando o timer zerar</span>
                                        </label>

                                        {block.countdownRedirectOnExpire !== false && (
                                          <div className="space-y-2.5 pl-6">
                                            <div className="flex items-center gap-4 text-xs">
                                              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                                                <input
                                                  type="radio"
                                                  name={`block_countdown_redir_${block.id}`}
                                                  checked={(block.countdownRedirectType || 'page') === 'page'}
                                                  onChange={() => {
                                                    const blocks = [...(editingPage.blocks || [])];
                                                    blocks[idx] = { ...block, countdownRedirectType: 'page' };
                                                    setEditingPage({ ...editingPage, blocks });
                                                  }}
                                                  className="text-blue-600"
                                                />
                                                <span>🏢 Outra Página do MDTracker</span>
                                              </label>
                                              <label className="flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                                                <input
                                                  type="radio"
                                                  name={`block_countdown_redir_${block.id}`}
                                                  checked={block.countdownRedirectType === 'custom_url'}
                                                  onChange={() => {
                                                    const blocks = [...(editingPage.blocks || [])];
                                                    blocks[idx] = { ...block, countdownRedirectType: 'custom_url' };
                                                    setEditingPage({ ...editingPage, blocks });
                                                  }}
                                                  className="text-blue-600"
                                                />
                                                <span>🌐 Link Externo / Live</span>
                                              </label>
                                            </div>

                                            {(block.countdownRedirectType || 'page') === 'page' ? (
                                              <div>
                                                <select
                                                  value={block.countdownRedirectPageSlug || ''}
                                                  onChange={e => {
                                                    const blocks = [...(editingPage.blocks || [])];
                                                    blocks[idx] = { ...block, countdownRedirectPageSlug: e.target.value };
                                                    setEditingPage({ ...editingPage, blocks });
                                                  }}
                                                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                                >
                                                  <option value="">-- Selecione a próxima página de destino --</option>
                                                  {landingPages.filter(p => p.id !== editingPage.id).map(p => (
                                                    <option key={p.id} value={p.slug}>
                                                      {p.title} (/p/{p.slug})
                                                    </option>
                                                  ))}
                                                </select>
                                              </div>
                                            ) : (
                                              <div>
                                                <input
                                                  type="url"
                                                  value={block.countdownRedirectUrl || ''}
                                                  onChange={e => {
                                                    const blocks = [...(editingPage.blocks || [])];
                                                    blocks[idx] = { ...block, countdownRedirectUrl: e.target.value };
                                                    setEditingPage({ ...editingPage, blocks });
                                                  }}
                                                  placeholder="https://sua-empresa.com.br/checkout ou link do YouTube Live"
                                                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-mono"
                                                />
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Specific Fields: FEATURES / BENEFÍCIOS */}
                                  {block.type === 'features' && (
                                    <div className="space-y-3 pt-2 border-t border-slate-200">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                                            <Layers className="w-3.5 h-3.5 text-blue-600" />
                                            <span>Lista de Benefícios & Diferenciais</span>
                                          </label>
                                          <p className="text-[10px] text-slate-500 mt-0.5">
                                            Adicione e edite os tópicos que destacam o valor da sua oferta.
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const currentFeatures = [...(block.features || editingPage.features || [])];
                                            currentFeatures.push({
                                              id: `feat-${Date.now()}`,
                                              title: 'Novo Benefício Exclusivo',
                                              description: 'Descreva em poucas linhas o ganho real para o seu cliente.'
                                            });
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, features: currentFeatures };
                                            setEditingPage({
                                              ...editingPage,
                                              blocks,
                                              features: currentFeatures
                                            });
                                          }}
                                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                                        >
                                          <Plus className="w-3 h-3" />
                                          <span>Adicionar Benefício</span>
                                        </button>
                                      </div>

                                      <div className="space-y-2.5">
                                        {(block.features || editingPage.features || []).map((feat, fIdx) => (
                                          <div key={feat.id || fIdx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 relative shadow-xs">
                                            <div className="flex items-center justify-between">
                                              <span className="font-bold text-xs text-blue-700">Item #{fIdx + 1}</span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const currentFeatures = [...(block.features || editingPage.features || [])];
                                                  currentFeatures.splice(fIdx, 1);
                                                  const blocks = [...(editingPage.blocks || [])];
                                                  blocks[idx] = { ...block, features: currentFeatures };
                                                  setEditingPage({
                                                    ...editingPage,
                                                    blocks,
                                                    features: currentFeatures
                                                  });
                                                }}
                                                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                                                title="Remover benefício"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                            <div>
                                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Título do Benefício</label>
                                              <input
                                                type="text"
                                                value={feat.title}
                                                onChange={e => {
                                                  const currentFeatures = [...(block.features || editingPage.features || [])];
                                                  currentFeatures[fIdx] = { ...feat, title: e.target.value };
                                                  const blocks = [...(editingPage.blocks || [])];
                                                  blocks[idx] = { ...block, features: currentFeatures };
                                                  setEditingPage({
                                                    ...editingPage,
                                                    blocks,
                                                    features: currentFeatures
                                                  });
                                                }}
                                                placeholder="Ex: Mapeamento de Gargalos"
                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Descrição</label>
                                              <textarea
                                                rows={2}
                                                value={feat.description}
                                                onChange={e => {
                                                  const currentFeatures = [...(block.features || editingPage.features || [])];
                                                  currentFeatures[fIdx] = { ...feat, description: e.target.value };
                                                  const blocks = [...(editingPage.blocks || [])];
                                                  blocks[idx] = { ...block, features: currentFeatures };
                                                  setEditingPage({
                                                    ...editingPage,
                                                    blocks,
                                                    features: currentFeatures
                                                  });
                                                }}
                                                placeholder="Descreva o que o cliente ganha com isso..."
                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 leading-relaxed focus:outline-none focus:border-blue-500"
                                              />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Specific Fields: SOCIAL PROOF / PROVA SOCIAL & DEPOIMENTOS */}
                                  {block.type === 'socialProof' && (
                                    <div className="space-y-4 pt-2 border-t border-slate-200">
                                      {/* 1. Métricas / Estatísticas de Impacto */}
                                      <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 space-y-3">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                              <span>Métricas & Números em Destaque</span>
                                            </label>
                                            <p className="text-[10px] text-amber-700 mt-0.5">
                                              Altere os inscritos confirmados, notas de avaliação ou resultados alcançados.
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const currentStats = [...(block.stats || editingPage.socialProof?.stats || [
                                                { label: 'Inscritos Confirmados', value: '+1.800' },
                                                { label: 'Nota das Edições Anteriores', value: '4.95 ⭐' }
                                              ])];
                                              currentStats.push({ label: 'Nova Métrica', value: '+500' });
                                              const blocks = [...(editingPage.blocks || [])];
                                              blocks[idx] = { ...block, stats: currentStats };
                                              setEditingPage({
                                                ...editingPage,
                                                blocks,
                                                socialProof: { ...editingPage.socialProof, enabled: true, stats: currentStats }
                                              });
                                            }}
                                            className="text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 font-bold text-xs px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                                          >
                                            <Plus className="w-3 h-3" />
                                            <span>Adicionar Número</span>
                                          </button>
                                        </div>

                                        <div className="space-y-2">
                                          {(block.stats || editingPage.socialProof?.stats || [
                                            { label: 'Inscritos Confirmados', value: '+1.800' },
                                            { label: 'Nota das Edições Anteriores', value: '4.95 ⭐' }
                                          ]).map((st, sIdx) => (
                                            <div key={sIdx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-amber-200/80 shadow-xs">
                                              <div className="w-1/3">
                                                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Valor / Número</label>
                                                <input
                                                  type="text"
                                                  value={st.value}
                                                  onChange={e => {
                                                    const stats = [...(block.stats || editingPage.socialProof?.stats || [
                                                      { label: 'Inscritos Confirmados', value: '+1.800' },
                                                      { label: 'Nota das Edições Anteriores', value: '4.95 ⭐' }
                                                    ])];
                                                    stats[sIdx] = { ...st, value: e.target.value };
                                                    const blocks = [...(editingPage.blocks || [])];
                                                    blocks[idx] = { ...block, stats };
                                                    setEditingPage({
                                                      ...editingPage,
                                                      blocks,
                                                      socialProof: { ...editingPage.socialProof, enabled: true, stats }
                                                    });
                                                  }}
                                                  placeholder="+1.800 ou 4.95 ⭐"
                                                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-bold text-amber-600 focus:outline-none focus:border-amber-500"
                                                />
                                              </div>
                                              <div className="flex-1">
                                                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Rótulo / Descrição</label>
                                                <input
                                                  type="text"
                                                  value={st.label}
                                                  onChange={e => {
                                                    const stats = [...(block.stats || editingPage.socialProof?.stats || [
                                                      { label: 'Inscritos Confirmados', value: '+1.800' },
                                                      { label: 'Nota das Edições Anteriores', value: '4.95 ⭐' }
                                                    ])];
                                                    stats[sIdx] = { ...st, label: e.target.value };
                                                    const blocks = [...(editingPage.blocks || [])];
                                                    blocks[idx] = { ...block, stats };
                                                    setEditingPage({
                                                      ...editingPage,
                                                      blocks,
                                                      socialProof: { ...editingPage.socialProof, enabled: true, stats }
                                                    });
                                                  }}
                                                  placeholder="Ex: Inscritos Confirmados"
                                                  className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs text-slate-700 focus:outline-none focus:border-amber-500"
                                                />
                                              </div>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const stats = [...(block.stats || editingPage.socialProof?.stats || [
                                                    { label: 'Inscritos Confirmados', value: '+1.800' },
                                                    { label: 'Nota das Edições Anteriores', value: '4.95 ⭐' }
                                                  ])];
                                                  stats.splice(sIdx, 1);
                                                  const blocks = [...(editingPage.blocks || [])];
                                                  blocks[idx] = { ...block, stats };
                                                  setEditingPage({
                                                    ...editingPage,
                                                    blocks,
                                                    socialProof: { ...editingPage.socialProof, enabled: true, stats }
                                                  });
                                                }}
                                                className="mt-4 text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                                                title="Remover esta métrica"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* 2. Depoimentos dos Clientes */}
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                              <span>Depoimentos dos Clientes</span>
                                            </label>
                                            <p className="text-[10px] text-slate-500 mt-0.5">
                                              Adicione, edite e remova depoimentos reais para gerar alta confiança.
                                            </p>
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const currentTestimonials = [...(block.testimonials || editingPage.socialProof?.testimonials || [
                                                { id: 't1', name: 'Mariana Silveira', role: 'Diretora Comercial', text: 'Excelente solução! O retorno sobre o investimento foi imediato e o atendimento é impecável.', rating: 5 },
                                                { id: 't2', name: 'Carlos Eduardo Ramos', role: 'Fundador - EcomBrasil', text: 'O processo direto de tráfego com qualificação no WhatsApp mudou totalmente nosso faturamento.', rating: 5 }
                                              ])];
                                              currentTestimonials.push({
                                                id: `t-${Date.now()}`,
                                                name: 'Novo Cliente',
                                                role: 'Cargo / Empresa',
                                                text: 'Excelente produto! Superou todas as nossas expectativas e acelerou nossos resultados.',
                                                rating: 5
                                              });
                                              const blocks = [...(editingPage.blocks || [])];
                                              blocks[idx] = { ...block, testimonials: currentTestimonials };
                                              setEditingPage({
                                                ...editingPage,
                                                blocks,
                                                socialProof: { ...editingPage.socialProof, enabled: true, testimonials: currentTestimonials }
                                              });
                                            }}
                                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                                          >
                                            <Plus className="w-3 h-3" />
                                            <span>Adicionar Depoimento</span>
                                          </button>
                                        </div>

                                        <div className="space-y-3">
                                          {(block.testimonials || editingPage.socialProof?.testimonials || [
                                            { id: 't1', name: 'Mariana Silveira', role: 'Diretora Comercial', text: 'Excelente solução! O retorno sobre o investimento foi imediato e o atendimento é impecável.', rating: 5 },
                                            { id: 't2', name: 'Carlos Eduardo Ramos', role: 'Fundador - EcomBrasil', text: 'O processo direto de tráfego com qualificação no WhatsApp mudou totalmente nosso faturamento.', rating: 5 }
                                          ]).map((t, tIdx) => (
                                            <div key={t.id || tIdx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 relative shadow-xs">
                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                  <span className="font-bold text-xs text-slate-800">Depoimento #{tIdx + 1}</span>
                                                  <div className="flex items-center gap-1">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                      <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => {
                                                          const list = [...(block.testimonials || editingPage.socialProof?.testimonials || [
                                                            { id: 't1', name: 'Mariana Silveira', role: 'Diretora Comercial', text: 'Excelente solução! O retorno sobre o investimento foi imediato e o atendimento é impecável.', rating: 5 },
                                                            { id: 't2', name: 'Carlos Eduardo Ramos', role: 'Fundador - EcomBrasil', text: 'O processo direto de tráfego com qualificação no WhatsApp mudou totalmente nosso faturamento.', rating: 5 }
                                                          ])];
                                                          list[tIdx] = { ...t, rating: star };
                                                          const blocks = [...(editingPage.blocks || [])];
                                                          blocks[idx] = { ...block, testimonials: list };
                                                          setEditingPage({
                                                            ...editingPage,
                                                            blocks,
                                                            socialProof: { ...editingPage.socialProof, enabled: true, testimonials: list }
                                                          });
                                                        }}
                                                        className={`text-sm cursor-pointer transition hover:scale-110 ${(t.rating || 5) >= star ? 'text-amber-400' : 'text-slate-300'}`}
                                                      >
                                                        ★
                                                      </button>
                                                    ))}
                                                  </div>
                                                </div>
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    const list = [...(block.testimonials || editingPage.socialProof?.testimonials || [
                                                      { id: 't1', name: 'Mariana Silveira', role: 'Diretora Comercial', text: 'Excelente solução! O retorno sobre o investimento foi imediato e o atendimento é impecável.', rating: 5 },
                                                      { id: 't2', name: 'Carlos Eduardo Ramos', role: 'Fundador - EcomBrasil', text: 'O processo direto de tráfego com qualificação no WhatsApp mudou totalmente nosso faturamento.', rating: 5 }
                                                    ])];
                                                    list.splice(tIdx, 1);
                                                    const blocks = [...(editingPage.blocks || [])];
                                                    blocks[idx] = { ...block, testimonials: list };
                                                    setEditingPage({
                                                      ...editingPage,
                                                      blocks,
                                                      socialProof: { ...editingPage.socialProof, enabled: true, testimonials: list }
                                                    });
                                                  }}
                                                  className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                                                  title="Remover depoimento"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              </div>

                                              <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Nome do Cliente</label>
                                                  <input
                                                    type="text"
                                                    value={t.name}
                                                    onChange={e => {
                                                      const list = [...(block.testimonials || editingPage.socialProof?.testimonials || [
                                                        { id: 't1', name: 'Mariana Silveira', role: 'Diretora Comercial', text: 'Excelente solução! O retorno sobre o investimento foi imediato e o atendimento é impecável.', rating: 5 },
                                                        { id: 't2', name: 'Carlos Eduardo Ramos', role: 'Fundador - EcomBrasil', text: 'O processo direto de tráfego com qualificação no WhatsApp mudou totalmente nosso faturamento.', rating: 5 }
                                                      ])];
                                                      list[tIdx] = { ...t, name: e.target.value };
                                                      const blocks = [...(editingPage.blocks || [])];
                                                      blocks[idx] = { ...block, testimonials: list };
                                                      setEditingPage({
                                                        ...editingPage,
                                                        blocks,
                                                        socialProof: { ...editingPage.socialProof, enabled: true, testimonials: list }
                                                      });
                                                    }}
                                                    placeholder="Ex: Mariana Silveira"
                                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                                                  />
                                                </div>
                                                <div>
                                                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Cargo / Empresa</label>
                                                  <input
                                                    type="text"
                                                    value={t.role}
                                                    onChange={e => {
                                                      const list = [...(block.testimonials || editingPage.socialProof?.testimonials || [
                                                        { id: 't1', name: 'Mariana Silveira', role: 'Diretora Comercial', text: 'Excelente solução! O retorno sobre o investimento foi imediato e o atendimento é impecável.', rating: 5 },
                                                        { id: 't2', name: 'Carlos Eduardo Ramos', role: 'Fundador - EcomBrasil', text: 'O processo direto de tráfego com qualificação no WhatsApp mudou totalmente nosso faturamento.', rating: 5 }
                                                      ])];
                                                      list[tIdx] = { ...t, role: e.target.value };
                                                      const blocks = [...(editingPage.blocks || [])];
                                                      blocks[idx] = { ...block, testimonials: list };
                                                      setEditingPage({
                                                        ...editingPage,
                                                        blocks,
                                                        socialProof: { ...editingPage.socialProof, enabled: true, testimonials: list }
                                                      });
                                                    }}
                                                    placeholder="Ex: Diretora Comercial"
                                                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:border-blue-500"
                                                  />
                                                </div>
                                              </div>

                                              <div>
                                                <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Texto do Depoimento</label>
                                                <textarea
                                                  rows={2}
                                                  value={t.text}
                                                  onChange={e => {
                                                    const list = [...(block.testimonials || editingPage.socialProof?.testimonials || [
                                                      { id: 't1', name: 'Mariana Silveira', role: 'Diretora Comercial', text: 'Excelente solução! O retorno sobre o investimento foi imediato e o atendimento é impecável.', rating: 5 },
                                                      { id: 't2', name: 'Carlos Eduardo Ramos', role: 'Fundador - EcomBrasil', text: 'O processo direto de tráfego com qualificação no WhatsApp mudou totalmente nosso faturamento.', rating: 5 }
                                                    ])];
                                                    list[tIdx] = { ...t, text: e.target.value };
                                                    const blocks = [...(editingPage.blocks || [])];
                                                    blocks[idx] = { ...block, testimonials: list };
                                                    setEditingPage({
                                                      ...editingPage,
                                                      blocks,
                                                      socialProof: { ...editingPage.socialProof, enabled: true, testimonials: list }
                                                    });
                                                  }}
                                                  placeholder="O que o cliente disse sobre a experiência..."
                                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-800 leading-relaxed focus:outline-none focus:border-blue-500"
                                                />
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {/* Specific Fields: FAQ / PERGUNTAS FREQUENTES */}
                                  {block.type === 'faq' && (
                                    <div className="space-y-3 pt-2 border-t border-slate-200">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <label className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                                            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                                            <span>Perguntas & Respostas (FAQ)</span>
                                          </label>
                                          <p className="text-[10px] text-slate-500 mt-0.5">
                                            Responda às principais dúvidas para quebrar objeções.
                                          </p>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const currentFaq = [...(block.faqItems || editingPage.faq?.items || [
                                              { id: 'q1', question: 'Preciso de conhecimento técnico para usar?', answer: 'Não! O construtor é 100% visual.' }
                                            ])];
                                            currentFaq.push({
                                              id: `faq-${Date.now()}`,
                                              question: 'Nova Pergunta Frequente?',
                                              answer: 'Insira aqui a resposta detalhada e objetiva.'
                                            });
                                            const blocks = [...(editingPage.blocks || [])];
                                            blocks[idx] = { ...block, faqItems: currentFaq };
                                            setEditingPage({
                                              ...editingPage,
                                              blocks,
                                              faq: { ...editingPage.faq, enabled: true, items: currentFaq }
                                            });
                                          }}
                                          className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                                        >
                                          <Plus className="w-3 h-3" />
                                          <span>Adicionar Pergunta</span>
                                        </button>
                                      </div>

                                      <div className="space-y-2.5">
                                        {(block.faqItems || editingPage.faq?.items || [
                                          { id: 'q1', question: 'Preciso de conhecimento técnico para usar?', answer: 'Não! O construtor é 100% visual.' }
                                        ]).map((faqItem, qIdx) => (
                                          <div key={faqItem.id || qIdx} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 relative shadow-xs">
                                            <div className="flex items-center justify-between">
                                              <span className="font-bold text-xs text-purple-700">Pergunta #{qIdx + 1}</span>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  const currentFaq = [...(block.faqItems || editingPage.faq?.items || [])];
                                                  currentFaq.splice(qIdx, 1);
                                                  const blocks = [...(editingPage.blocks || [])];
                                                  blocks[idx] = { ...block, faqItems: currentFaq };
                                                  setEditingPage({
                                                    ...editingPage,
                                                    blocks,
                                                    faq: { ...editingPage.faq, enabled: true, items: currentFaq }
                                                  });
                                                }}
                                                className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                                                title="Remover pergunta"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                            <div>
                                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Pergunta</label>
                                              <input
                                                type="text"
                                                value={faqItem.question}
                                                onChange={e => {
                                                  const currentFaq = [...(block.faqItems || editingPage.faq?.items || [])];
                                                  currentFaq[qIdx] = { ...faqItem, question: e.target.value };
                                                  const blocks = [...(editingPage.blocks || [])];
                                                  blocks[idx] = { ...block, faqItems: currentFaq };
                                                  setEditingPage({
                                                    ...editingPage,
                                                    blocks,
                                                    faq: { ...editingPage.faq, enabled: true, items: currentFaq }
                                                  });
                                                }}
                                                placeholder="Ex: Como funciona a garantia?"
                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-500"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Resposta</label>
                                              <textarea
                                                rows={2}
                                                value={faqItem.answer}
                                                onChange={e => {
                                                  const currentFaq = [...(block.faqItems || editingPage.faq?.items || [])];
                                                  currentFaq[qIdx] = { ...faqItem, answer: e.target.value };
                                                  const blocks = [...(editingPage.blocks || [])];
                                                  blocks[idx] = { ...block, faqItems: currentFaq };
                                                  setEditingPage({
                                                    ...editingPage,
                                                    blocks,
                                                    faq: { ...editingPage.faq, enabled: true, items: currentFaq }
                                                  });
                                                }}
                                                placeholder="Digite a resposta explicativa..."
                                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-700 leading-relaxed focus:outline-none focus:border-purple-500"
                                              />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => setIsAddBlockModalOpen(true)}
                          className="w-full py-3 border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl text-blue-600 hover:bg-blue-50/50 transition font-bold text-xs flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Adicionar Outro Bloco à Página</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

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
                        Status de Exibição do Hero Padrão
                      </label>
                      <select
                        value={editingPage.hero?.enabled !== false ? 'true' : 'false'}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          hero: { ...editingPage.hero, enabled: e.target.value === 'true' }
                        })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white text-xs font-semibold"
                      >
                        <option value="true">✅ Exibir Hero Principal no Topo</option>
                        <option value="false">🚫 Ocultar Hero Principal (Usar apenas Blocos Modulares)</option>
                      </select>
                      <p className="text-[11px] text-slate-500 mt-1">
                        💡 Se você adicionar um bloco modular de "Cabeçalho com Formulário (Split)" na aba Blocos, o hero padrão é substituído automaticamente por ele.
                      </p>
                    </div>

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
                        value={editingPage.form?.actionType || 'thank_you_page'}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          form: { ...editingPage.form, actionType: e.target.value as any }
                        })}
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl bg-white mb-3"
                      >
                        <option value="thank_you_page">Redirecionar para Página de Obrigado Integrada (Recomendado)</option>
                        <option value="redirect_whatsapp">Abrir WhatsApp com Mensagem Predefinida</option>
                        <option value="thank_you_message">Exibir Mensagem de Sucesso na Tela</option>
                        <option value="custom_url">Redirecionar para URL Externa / Checkout</option>
                      </select>

                      {editingPage.form?.actionType === 'thank_you_page' && (
                        <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 text-xs text-purple-900 space-y-1.5 mb-3">
                          <div className="font-bold flex items-center gap-1.5 text-purple-700">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            <span>Página de Obrigado Ativada</span>
                          </div>
                          <p>
                            O lead será direcionado para <code className="font-mono bg-purple-100 px-1 py-0.5 rounded text-purple-800 font-bold">/p/{editingPage.slug}/obrigado</code> com botões para entrar em grupos de WhatsApp, baixar PDFs ou responder à pesquisa.
                          </p>
                          <button
                            type="button"
                            onClick={() => setActiveEditorTab('thankyou')}
                            className="mt-1 text-purple-700 hover:text-purple-900 font-extrabold underline text-[11px] block"
                          >
                            Personalizar Botões e Conteúdo da Página de Obrigado &rarr;
                          </button>
                        </div>
                      )}

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

                    {/* Automação & Disparos de Marketing */}
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Disparos & Automação de Marketing
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Configure ações de WhatsApp e E-mail disparadas assim que o lead enviar o formulário
                          </p>
                        </div>
                      </div>

                      {/* 1. Fluxo de Automação / Workflow */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          Fluxo de Nutrição Automático (Workflow RD Style)
                        </label>
                        <select
                          value={editingPage.form?.workflowId || ''}
                          onChange={e => setEditingPage({
                            ...editingPage,
                            form: { ...editingPage.form, workflowId: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-xs font-medium text-slate-800"
                        >
                          <option value="">🚫 Nenhum fluxo de nutrição vinculado</option>
                          {availableWorkflows.map(wf => (
                            <option key={wf.id} value={wf.id}>
                              ⚡ {wf.name} ({wf.steps?.length || 0} passos {wf.active ? '• Ativo' : '• Pausado'})
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-slate-500">
                          O lead entrará automaticamente no fluxo selecionado, recebendo as sequências de e-mails, WhatsApps e mudanças de estágio configuradas.
                        </p>
                      </div>

                      {/* 2. Disparo Imediato de WhatsApp Marketing */}
                      <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-emerald-900">
                            <input
                              type="checkbox"
                              checked={editingPage.form?.autoTriggerWhatsApp || false}
                              onChange={e => setEditingPage({
                                ...editingPage,
                                form: { 
                                  ...editingPage.form, 
                                  autoTriggerWhatsApp: e.target.checked,
                                  whatsappTemplate: editingPage.form?.whatsappTemplate || 'Olá {nome}! Recebemos seu cadastro na página "{empresa}". Em instantes nossa equipe entrará em contato com você!'
                                }
                              })}
                              className="w-4 h-4 text-emerald-600 rounded"
                            />
                            <div className="flex items-center gap-1.5">
                              <MessageSquare className="w-4 h-4 text-emerald-600" />
                              <span>Disparar WhatsApp Marketing Imediato</span>
                            </div>
                          </label>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            editingPage.form?.autoTriggerWhatsApp ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {editingPage.form?.autoTriggerWhatsApp ? 'Ativado' : 'Desativado'}
                          </span>
                        </div>

                        {editingPage.form?.autoTriggerWhatsApp && (
                          <div className="space-y-2 pt-1 border-t border-emerald-200/60">
                            <div className="flex items-center justify-between">
                              <label className="block text-[11px] font-semibold text-emerald-800">
                                Mensagem do WhatsApp (via API do Sistema):
                              </label>
                              <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{'{nome}'}</span>
                                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">{'{empresa}'}</span>
                              </div>
                            </div>
                            <textarea
                              rows={3}
                              value={editingPage.form?.whatsappTemplate || ''}
                              onChange={e => setEditingPage({
                                ...editingPage,
                                form: { ...editingPage.form, whatsappTemplate: e.target.value }
                              })}
                              placeholder="Olá {nome}! Obrigado por seu cadastro na página {empresa}..."
                              className="w-full px-3 py-2 border border-emerald-300 rounded-lg bg-white text-xs text-slate-800 focus:ring-1 focus:ring-emerald-400"
                            />
                            <p className="text-[10px] text-emerald-700">
                              ⚡ Essa mensagem é disparada instantaneamente para o número de WhatsApp preenchido pelo lead.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* 3. Disparo Imediato de E-mail Marketing */}
                      <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-blue-900">
                            <input
                              type="checkbox"
                              checked={editingPage.form?.autoTriggerEmail || false}
                              onChange={e => setEditingPage({
                                ...editingPage,
                                form: { 
                                  ...editingPage.form, 
                                  autoTriggerEmail: e.target.checked,
                                  emailSubject: editingPage.form?.emailSubject || 'Confirmação de Cadastro - {empresa}',
                                  emailBody: editingPage.form?.emailBody || 'Olá {nome},\n\nRecebemos sua solicitação com sucesso na página "{empresa}".\n\nNossa equipe já está preparando seu material/atendimento.\n\nAtenciosamente,\nEquipe {empresa}'
                                }
                              })}
                              className="w-4 h-4 text-blue-600 rounded"
                            />
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <span>Disparar E-mail Marketing Imediato</span>
                            </div>
                          </label>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            editingPage.form?.autoTriggerEmail ? 'bg-blue-200 text-blue-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {editingPage.form?.autoTriggerEmail ? 'Ativado' : 'Desativado'}
                          </span>
                        </div>

                        {editingPage.form?.autoTriggerEmail && (
                          <div className="space-y-2 pt-1 border-t border-blue-200/60">
                            <div>
                              <label className="block text-[11px] font-semibold text-blue-800 mb-1">
                                Assunto do E-mail:
                              </label>
                              <input
                                type="text"
                                value={editingPage.form?.emailSubject || ''}
                                onChange={e => setEditingPage({
                                  ...editingPage,
                                  form: { ...editingPage.form, emailSubject: e.target.value }
                                })}
                                placeholder="Ex: Confirmação de Cadastro - {empresa}"
                                className="w-full px-3 py-1.5 border border-blue-300 rounded-lg bg-white text-xs text-slate-800"
                              />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="block text-[11px] font-semibold text-blue-800">
                                  Conteúdo do E-mail:
                                </label>
                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{'{nome}'}</span>
                                  <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-blue-200">{'{empresa}'}</span>
                                </div>
                              </div>
                              <textarea
                                rows={4}
                                value={editingPage.form?.emailBody || ''}
                                onChange={e => setEditingPage({
                                  ...editingPage,
                                  form: { ...editingPage.form, emailBody: e.target.value }
                                })}
                                placeholder="Olá {nome}, seu cadastro foi confirmado..."
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg bg-white text-xs text-slate-800 focus:ring-1 focus:ring-blue-400 font-sans"
                              />
                            </div>
                            <p className="text-[10px] text-blue-700">
                              ✉️ O e-mail de confirmação ou entrega de material será disparado para o endereço fornecido pelo lead.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* PÁGINA DE OBRIGADO (Pós-Conversão) */}
                {activeEditorTab === 'thankyou' && (
                  <div className="space-y-5">
                    <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200/80 flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">Página de Obrigado Pós-Conversão</span>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-purple-600 text-white px-2 py-0.5 rounded-full">
                            Alta Conversão
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Página exibida aos leads logo após preencherem o formulário. Inclui botões para entrar no grupo VIP do WhatsApp, baixar PDFs ou responder a pesquisas.
                        </p>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={editingPage.thankYouPage?.enabled ?? true}
                          onChange={e => setEditingPage({
                            ...editingPage,
                            thankYouPage: {
                              ...editingPage.thankYouPage,
                              enabled: e.target.checked
                            }
                          })}
                          className="w-4 h-4 rounded text-purple-600"
                        />
                        <span className="text-xs font-bold text-slate-700">Ativa</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Título Principal da Página de Obrigado
                      </label>
                      <input
                        type="text"
                        value={editingPage.thankYouPage?.title || ''}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          thankYouPage: {
                            ...editingPage.thankYouPage,
                            title: e.target.value
                          }
                        })}
                        placeholder="🎉 Falta Apenas Um Último Passo!"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Subtítulo / Instruções para o Lead
                      </label>
                      <textarea
                        rows={2}
                        value={editingPage.thankYouPage?.subtitle || ''}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          thankYouPage: {
                            ...editingPage.thankYouPage,
                            subtitle: e.target.value
                          }
                        })}
                        placeholder="Seus dados foram confirmados. Para não perder os avisos no WhatsApp, escolha as opções abaixo:"
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                        Vídeo de Agradecimento ou Instruções (Opcional - YouTube)
                      </label>
                      <input
                        type="url"
                        value={editingPage.thankYouPage?.videoUrl || ''}
                        onChange={e => setEditingPage({
                          ...editingPage,
                          thankYouPage: {
                            ...editingPage.thankYouPage,
                            videoUrl: e.target.value
                          }
                        })}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-mono"
                      />
                    </div>

                    {/* Action Buttons Section */}
                    <div className="space-y-3 pt-3 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
                            Botões de Ação na Página ({editingPage.thankYouPage?.actionButtons?.length || 0})
                          </label>
                          <span className="text-[11px] text-slate-500">
                            Adicione botões para WhatsApp, PDF para download ou pesquisas
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              const curr = editingPage.thankYouPage?.actionButtons || [];
                              const newBtn: ThankYouActionButton = {
                                id: `btn-wa-${Date.now()}`,
                                type: 'whatsapp_group',
                                title: 'Entrar no Grupo VIP do WhatsApp',
                                description: 'Avisos prioritários e networking sem spam.',
                                buttonText: 'Entrar no Grupo VIP 📱',
                                icon: 'whatsapp',
                                color: '#10b981',
                                url: 'https://chat.whatsapp.com/demo-mdtracker',
                                badge: 'Recomendado'
                              };
                              setEditingPage({
                                ...editingPage,
                                thankYouPage: {
                                  ...editingPage.thankYouPage,
                                  actionButtons: [...curr, newBtn]
                                }
                              });
                            }}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> + Grupo WhatsApp
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const curr = editingPage.thankYouPage?.actionButtons || [];
                              const newBtn: ThankYouActionButton = {
                                id: `btn-pdf-${Date.now()}`,
                                type: 'download_pdf',
                                title: 'Baixar Material Gratuito em PDF',
                                description: 'Download imediato do e-book ou checklist completo.',
                                buttonText: 'Baixar PDF Grátis 📥',
                                icon: 'download',
                                color: '#2563eb',
                                url: 'https://mdtracker.app/materiais/guia-conversao-whatsapp.pdf',
                                badge: 'Download Imediato'
                              };
                              setEditingPage({
                                ...editingPage,
                                thankYouPage: {
                                  ...editingPage.thankYouPage,
                                  actionButtons: [...curr, newBtn]
                                }
                              });
                            }}
                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> + Download PDF
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const curr = editingPage.thankYouPage?.actionButtons || [];
                              const firstSurvey = availableSurveys[0];
                              const newBtn: ThankYouActionButton = {
                                id: `btn-surv-${Date.now()}`,
                                type: 'survey',
                                title: 'Responder Pesquisa Rápida (1 Minuto)',
                                description: 'Personalize seu diagnóstico respondendo 3 perguntas rápidas.',
                                buttonText: 'Responder Pesquisa Agora 📝',
                                icon: 'survey',
                                color: '#7c3aed',
                                url: firstSurvey ? `/pesquisa/${firstSurvey.slug}` : '/pesquisa/qualificacao-comercial',
                                surveyId: firstSurvey?.id || 'survey-qualificacao-comercial',
                                badge: '1 Minuto'
                              };
                              setEditingPage({
                                ...editingPage,
                                thankYouPage: {
                                  ...editingPage.thankYouPage,
                                  actionButtons: [...curr, newBtn]
                                }
                              });
                            }}
                            className="px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> + Pesquisa
                          </button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {(editingPage.thankYouPage?.actionButtons || []).map((btn, bIdx) => (
                          <div key={btn.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                  btn.type === 'whatsapp_group' ? 'bg-emerald-100 text-emerald-800' :
                                  btn.type === 'download_pdf' ? 'bg-blue-100 text-blue-800' :
                                  btn.type === 'survey' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-800'
                                }`}>
                                  {btn.type === 'whatsapp_group' && 'Grupo WhatsApp VIP'}
                                  {btn.type === 'download_pdf' && 'Download de PDF'}
                                  {btn.type === 'survey' && 'Pesquisa & Qualificação'}
                                  {btn.type === 'external_link' && 'Link Externo'}
                                </span>
                                <input
                                  type="text"
                                  value={btn.badge || ''}
                                  onChange={e => {
                                    const arr = [...(editingPage.thankYouPage?.actionButtons || [])];
                                    arr[bIdx] = { ...btn, badge: e.target.value };
                                    setEditingPage({
                                      ...editingPage,
                                      thankYouPage: { ...editingPage.thankYouPage, actionButtons: arr }
                                    });
                                  }}
                                  placeholder="Tag (ex: Recomendado)"
                                  className="text-[10px] px-2 py-0.5 border border-slate-200 rounded bg-white w-28"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const arr = (editingPage.thankYouPage?.actionButtons || []).filter((_, i) => i !== bIdx);
                                  setEditingPage({
                                    ...editingPage,
                                    thankYouPage: { ...editingPage.thankYouPage, actionButtons: arr }
                                  });
                                }}
                                className="text-slate-400 hover:text-red-500 p-1"
                                title="Remover Botão"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Título do Card</label>
                                <input
                                  type="text"
                                  value={btn.title}
                                  onChange={e => {
                                    const arr = [...(editingPage.thankYouPage?.actionButtons || [])];
                                    arr[bIdx] = { ...btn, title: e.target.value };
                                    setEditingPage({
                                      ...editingPage,
                                      thankYouPage: { ...editingPage.thankYouPage, actionButtons: arr }
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Texto do Botão CTA</label>
                                <input
                                  type="text"
                                  value={btn.buttonText || ''}
                                  onChange={e => {
                                    const arr = [...(editingPage.thankYouPage?.actionButtons || [])];
                                    arr[bIdx] = { ...btn, buttonText: e.target.value };
                                    setEditingPage({
                                      ...editingPage,
                                      thankYouPage: { ...editingPage.thankYouPage, actionButtons: arr }
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Descrição Curta</label>
                              <input
                                type="text"
                                value={btn.description || ''}
                                onChange={e => {
                                  const arr = [...(editingPage.thankYouPage?.actionButtons || [])];
                                  arr[bIdx] = { ...btn, description: e.target.value };
                                  setEditingPage({
                                    ...editingPage,
                                    thankYouPage: { ...editingPage.thankYouPage, actionButtons: arr }
                                  });
                                }}
                                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                              />
                            </div>

                            {/* Destination URL or Survey Selector */}
                            {btn.type === 'survey' ? (
                              <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-purple-200">
                                <label className="block text-[11px] font-bold text-purple-700">
                                  Vincular à Pesquisa do MDTracker:
                                </label>
                                <select
                                  value={btn.surveyId || ''}
                                  onChange={e => {
                                    const selectedId = e.target.value;
                                    const surv = availableSurveys.find(s => s.id === selectedId);
                                    const arr = [...(editingPage.thankYouPage?.actionButtons || [])];
                                    arr[bIdx] = { 
                                      ...btn, 
                                      surveyId: selectedId, 
                                      url: surv ? `/pesquisa/${surv.slug}` : `/pesquisa/${selectedId}` 
                                    };
                                    setEditingPage({
                                      ...editingPage,
                                      thankYouPage: { ...editingPage.thankYouPage, actionButtons: arr }
                                    });
                                  }}
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                                >
                                  <option value="">Selecione uma pesquisa existente...</option>
                                  {availableSurveys.map(s => (
                                    <option key={s.id} value={s.id}>
                                      {s.title} (/pesquisa/{s.slug})
                                    </option>
                                  ))}
                                </select>
                                <p className="text-[10px] text-slate-500">
                                  Ou informe a URL direta abaixo caso seja externa:
                                </p>
                                <input
                                  type="text"
                                  value={btn.url}
                                  onChange={e => {
                                    const arr = [...(editingPage.thankYouPage?.actionButtons || [])];
                                    arr[bIdx] = { ...btn, url: e.target.value };
                                    setEditingPage({
                                      ...editingPage,
                                      thankYouPage: { ...editingPage.thankYouPage, actionButtons: arr }
                                    });
                                  }}
                                  placeholder="/pesquisa/..."
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                                />
                              </div>
                            ) : (
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                                  {btn.type === 'whatsapp_group' ? 'Link do Grupo do WhatsApp (https://chat.whatsapp.com/...)' :
                                   btn.type === 'download_pdf' ? 'Link Direto para o PDF (URL completa)' : 'URL de Destino'}
                                </label>
                                <input
                                  type="text"
                                  value={btn.url}
                                  onChange={e => {
                                    const arr = [...(editingPage.thankYouPage?.actionButtons || [])];
                                    arr[bIdx] = { ...btn, url: e.target.value };
                                    setEditingPage({
                                      ...editingPage,
                                      thankYouPage: { ...editingPage.thankYouPage, actionButtons: arr }
                                    });
                                  }}
                                  placeholder="https://..."
                                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. BENEFÍCIOS */}
                {activeEditorTab === 'features' && (() => {
                  const featuresBlock = editingPage.blocks?.find(b => b.type === 'features');
                  const currentFeatures = (editingPage.features && editingPage.features.length > 0)
                    ? editingPage.features
                    : (featuresBlock?.features || [
                        { id: 'f1', title: 'Aulas 100% Práticas', description: 'Sem enrolação teórica: mostramos tela a tela o que funciona no mercado atual.' },
                        { id: 'f2', title: 'Sessão de Perguntas e Respostas', description: 'Tire suas dúvidas diretamente ao vivo com nossos mentores.' },
                        { id: 'f3', title: 'Certificado de Participação', description: 'Comprove seu aperfeiçoamento profissional com certificado digital incluso.' }
                      ]);

                  return (
                    <div className="space-y-4">
                      {/* Sync Banner with Blocks */}
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="text-xs text-blue-900 leading-snug">
                            <span className="font-bold">Sincronizado com Blocos & Seções:</span> Altere aqui ou direto no bloco visual da página.
                          </div>
                        </div>
                        {featuresBlock && (
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedBlockId(featuresBlock.id);
                              setActiveEditorTab('blocks');
                            }}
                            className="text-[11px] font-bold text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition whitespace-nowrap cursor-pointer shrink-0"
                          >
                            Ir ao Bloco ➔
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Lista de Benefícios ({currentFeatures.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newFeatures = [...currentFeatures];
                            newFeatures.push({
                              id: `feat-${Date.now()}`,
                              title: 'Novo Benefício Exclusivo',
                              description: 'Descreva em poucas linhas o ganho real para o cliente.'
                            });
                            const updatedBlocks = (editingPage.blocks || []).map(b =>
                              b.type === 'features' ? { ...b, features: newFeatures } : b
                            );
                            setEditingPage({ ...editingPage, features: newFeatures, blocks: updatedBlocks });
                          }}
                          className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Adicionar Benefício</span>
                        </button>
                      </div>

                      {currentFeatures.map((feat, idx) => (
                        <div key={feat.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 relative space-y-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newFeatures = currentFeatures.filter((_, i) => i !== idx);
                              const updatedBlocks = (editingPage.blocks || []).map(b =>
                                b.type === 'features' ? { ...b, features: newFeatures } : b
                              );
                              setEditingPage({ ...editingPage, features: newFeatures, blocks: updatedBlocks });
                            }}
                            className="absolute top-3 right-3 text-slate-400 hover:text-red-500 cursor-pointer"
                            title="Remover benefício"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="text-xs font-bold text-slate-500">Item #{idx + 1}</div>
                          <input
                            type="text"
                            value={feat.title}
                            onChange={e => {
                              const updated = [...currentFeatures];
                              updated[idx] = { ...feat, title: e.target.value };
                              const updatedBlocks = (editingPage.blocks || []).map(b =>
                                b.type === 'features' ? { ...b, features: updated } : b
                              );
                              setEditingPage({ ...editingPage, features: updated, blocks: updatedBlocks });
                            }}
                            placeholder="Título do Benefício"
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                          />
                          <textarea
                            value={feat.description}
                            onChange={e => {
                              const updated = [...currentFeatures];
                              updated[idx] = { ...feat, description: e.target.value };
                              const updatedBlocks = (editingPage.blocks || []).map(b =>
                                b.type === 'features' ? { ...b, features: updated } : b
                              );
                              setEditingPage({ ...editingPage, features: updated, blocks: updatedBlocks });
                            }}
                            rows={2}
                            placeholder="Descrição detalhada..."
                            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* 5. PROVA SOCIAL */}
                {activeEditorTab === 'social' && (() => {
                  const socialProofBlock = editingPage.blocks?.find(b => b.type === 'socialProof');
                  const currentStats = (editingPage.socialProof?.stats && editingPage.socialProof.stats.length > 0)
                    ? editingPage.socialProof.stats
                    : (socialProofBlock?.stats || [
                        { label: 'Inscritos Confirmados', value: '+1.800' },
                        { label: 'Nota das Edições Anteriores', value: '4.95 ⭐' }
                      ]);

                  const currentTestimonials = (editingPage.socialProof?.testimonials && editingPage.socialProof.testimonials.length > 0)
                    ? editingPage.socialProof.testimonials
                    : (socialProofBlock?.testimonials || [
                        { id: 't1', name: 'Mariana Silveira', role: 'Diretora Comercial', text: 'Excelente solução! O retorno sobre o investimento foi imediato e o atendimento é impecável.', rating: 5 },
                        { id: 't2', name: 'Carlos Eduardo Ramos', role: 'Fundador - EcomBrasil', text: 'O processo direto de tráfego com qualificação no WhatsApp mudou totalmente nosso faturamento.', rating: 5 }
                      ]);

                  const isEnabled = editingPage.socialProof?.enabled !== false;

                  return (
                    <div className="space-y-5">
                      {/* Sync Banner with Blocks */}
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-amber-600 fill-amber-500 shrink-0" />
                          <div className="text-xs text-amber-900 leading-snug">
                            <span className="font-bold">Sincronizado com Blocos & Seções:</span> Você também pode gerenciar e reordenar esta seção na aba <span className="font-bold">Blocos & Seções 🧱</span>.
                          </div>
                        </div>
                        {socialProofBlock && (
                          <button
                            type="button"
                            onClick={() => {
                              setExpandedBlockId(socialProofBlock.id);
                              setActiveEditorTab('blocks');
                            }}
                            className="text-[11px] font-bold text-amber-800 bg-white border border-amber-200 px-2.5 py-1 rounded-lg hover:bg-amber-100 transition whitespace-nowrap cursor-pointer shrink-0"
                          >
                            Ir ao Bloco ➔
                          </button>
                        )}
                      </div>

                      {/* Header Activation Toggle */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                          <div className="font-bold text-slate-800 text-sm">Ativar Seção de Prova Social</div>
                          <div className="text-xs text-slate-500">Exibir métricas e depoimentos de clientes</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={e => {
                            const enabled = e.target.checked;
                            const updatedBlocks = (editingPage.blocks || []).map(b =>
                              b.type === 'socialProof' ? { ...b, enabled } : b
                            );
                            setEditingPage({
                              ...editingPage,
                              socialProof: { ...editingPage.socialProof, enabled, stats: currentStats, testimonials: currentTestimonials },
                              blocks: updatedBlocks
                            });
                          }}
                          className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                        />
                      </div>

                      {isEnabled && (
                        <div className="space-y-5">
                          {/* 1. Métricas & Números em Destaque (Inscritos Confirmados, Nota, etc) */}
                          <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Métricas & Números em Destaque</span>
                                </label>
                                <p className="text-[10px] text-amber-700 mt-0.5">
                                  Altere os inscritos confirmados, notas de edições anteriores ou marcas alcançadas.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newStats = [...currentStats];
                                  newStats.push({ label: 'Nova Métrica', value: '+1.000' });
                                  const updatedBlocks = (editingPage.blocks || []).map(b =>
                                    b.type === 'socialProof' ? { ...b, stats: newStats, enabled: true } : b
                                  );
                                  setEditingPage({
                                    ...editingPage,
                                    socialProof: { ...editingPage.socialProof, enabled: true, stats: newStats, testimonials: currentTestimonials },
                                    blocks: updatedBlocks
                                  });
                                }}
                                className="text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 font-bold text-xs px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Adicionar Número</span>
                              </button>
                            </div>

                            <div className="space-y-2">
                              {currentStats.map((st, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-amber-200 shadow-xs">
                                  <div className="w-1/3">
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Valor / Número</label>
                                    <input
                                      type="text"
                                      value={st.value}
                                      onChange={e => {
                                        const newStats = [...currentStats];
                                        newStats[idx] = { ...st, value: e.target.value };
                                        const updatedBlocks = (editingPage.blocks || []).map(b =>
                                          b.type === 'socialProof' ? { ...b, stats: newStats } : b
                                        );
                                        setEditingPage({
                                          ...editingPage,
                                          socialProof: { ...editingPage.socialProof, stats: newStats },
                                          blocks: updatedBlocks
                                        });
                                      }}
                                      placeholder="+1.800 ou 4.95 ⭐"
                                      className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs font-bold text-amber-600 focus:outline-none focus:border-amber-500"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Rótulo / Descrição</label>
                                    <input
                                      type="text"
                                      value={st.label}
                                      onChange={e => {
                                        const newStats = [...currentStats];
                                        newStats[idx] = { ...st, label: e.target.value };
                                        const updatedBlocks = (editingPage.blocks || []).map(b =>
                                          b.type === 'socialProof' ? { ...b, stats: newStats } : b
                                        );
                                        setEditingPage({
                                          ...editingPage,
                                          socialProof: { ...editingPage.socialProof, stats: newStats },
                                          blocks: updatedBlocks
                                        });
                                      }}
                                      placeholder="Ex: Inscritos Confirmados"
                                      className="w-full px-2 py-1.5 border border-slate-300 rounded-md text-xs text-slate-800 focus:outline-none focus:border-amber-500"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newStats = currentStats.filter((_, i) => i !== idx);
                                      const updatedBlocks = (editingPage.blocks || []).map(b =>
                                        b.type === 'socialProof' ? { ...b, stats: newStats } : b
                                      );
                                      setEditingPage({
                                        ...editingPage,
                                        socialProof: { ...editingPage.socialProof, stats: newStats },
                                        blocks: updatedBlocks
                                      });
                                    }}
                                    className="mt-4 text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                                    title="Remover métrica"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 2. Depoimentos dos Clientes */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                  <span>Depoimentos dos Clientes ({currentTestimonials.length})</span>
                                </label>
                                <p className="text-[10px] text-slate-500 mt-0.5">
                                  Adicione e edite depoimentos com avaliações em estrelas.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newTestimonials = [...currentTestimonials];
                                  newTestimonials.push({
                                    id: `t-${Date.now()}`,
                                    name: 'Novo Cliente',
                                    role: 'Cargo / Empresa',
                                    text: 'Excelente produto! Superou todas as nossas expectativas e acelerou nossos resultados.',
                                    rating: 5
                                  });
                                  const updatedBlocks = (editingPage.blocks || []).map(b =>
                                    b.type === 'socialProof' ? { ...b, testimonials: newTestimonials, enabled: true } : b
                                  );
                                  setEditingPage({
                                    ...editingPage,
                                    socialProof: { ...editingPage.socialProof, enabled: true, stats: currentStats, testimonials: newTestimonials },
                                    blocks: updatedBlocks
                                  });
                                }}
                                className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Adicionar Depoimento</span>
                              </button>
                            </div>

                            <div className="space-y-3">
                              {currentTestimonials.map((t, idx) => (
                                <div key={t.id || idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 relative space-y-2.5 shadow-xs">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-xs text-slate-800">Depoimento #{idx + 1}</span>
                                      <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map(star => (
                                          <button
                                            key={star}
                                            type="button"
                                            onClick={() => {
                                              const list = [...currentTestimonials];
                                              list[idx] = { ...t, rating: star };
                                              const updatedBlocks = (editingPage.blocks || []).map(b =>
                                                b.type === 'socialProof' ? { ...b, testimonials: list } : b
                                              );
                                              setEditingPage({
                                                ...editingPage,
                                                socialProof: { ...editingPage.socialProof, testimonials: list },
                                                blocks: updatedBlocks
                                              });
                                            }}
                                            className={`text-sm cursor-pointer transition hover:scale-110 ${(t.rating || 5) >= star ? 'text-amber-400' : 'text-slate-300'}`}
                                          >
                                            ★
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const list = currentTestimonials.filter((_, i) => i !== idx);
                                        const updatedBlocks = (editingPage.blocks || []).map(b =>
                                          b.type === 'socialProof' ? { ...b, testimonials: list } : b
                                        );
                                        setEditingPage({
                                          ...editingPage,
                                          socialProof: { ...editingPage.socialProof, testimonials: list },
                                          blocks: updatedBlocks
                                        });
                                      }}
                                      className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                                      title="Remover depoimento"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Nome do Cliente</label>
                                      <input
                                        type="text"
                                        value={t.name}
                                        onChange={e => {
                                          const list = [...currentTestimonials];
                                          list[idx] = { ...t, name: e.target.value };
                                          const updatedBlocks = (editingPage.blocks || []).map(b =>
                                            b.type === 'socialProof' ? { ...b, testimonials: list } : b
                                          );
                                          setEditingPage({
                                            ...editingPage,
                                            socialProof: { ...editingPage.socialProof, testimonials: list },
                                            blocks: updatedBlocks
                                          });
                                        }}
                                        placeholder="Nome do cliente"
                                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Cargo / Empresa</label>
                                      <input
                                        type="text"
                                        value={t.role}
                                        onChange={e => {
                                          const list = [...currentTestimonials];
                                          list[idx] = { ...t, role: e.target.value };
                                          const updatedBlocks = (editingPage.blocks || []).map(b =>
                                            b.type === 'socialProof' ? { ...b, testimonials: list } : b
                                          );
                                          setEditingPage({
                                            ...editingPage,
                                            socialProof: { ...editingPage.socialProof, testimonials: list },
                                            blocks: updatedBlocks
                                          });
                                        }}
                                        placeholder="Cargo ou empresa"
                                        className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:border-blue-500"
                                      />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Texto do Depoimento</label>
                                    <textarea
                                      value={t.text}
                                      onChange={e => {
                                        const list = [...currentTestimonials];
                                        list[idx] = { ...t, text: e.target.value };
                                        const updatedBlocks = (editingPage.blocks || []).map(b =>
                                          b.type === 'socialProof' ? { ...b, testimonials: list } : b
                                        );
                                        setEditingPage({
                                          ...editingPage,
                                          socialProof: { ...editingPage.socialProof, testimonials: list },
                                          blocks: updatedBlocks
                                        });
                                      }}
                                      rows={2}
                                      placeholder="Depoimento do cliente..."
                                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs leading-relaxed focus:outline-none focus:border-blue-500"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 6. FAQ & ESCASSEZ */}
                {activeEditorTab === 'scarcity' && (
                  <div className="space-y-5">
                    {/* Countdown Timer */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            <span>Contador Regressivo (Timer Dinâmico)</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Cria urgência real e redireciona automaticamente ao zerar
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={editingPage.countdown?.enabled || false}
                          onChange={e => {
                            const isChecked = e.target.checked;
                            const defaultEnd = isChecked && !editingPage.countdown?.endDate 
                              ? getQuickDateTime('plus_days', 3) 
                              : editingPage.countdown?.endDate;
                            setEditingPage({
                              ...editingPage,
                              countdown: { 
                                ...editingPage.countdown, 
                                enabled: isChecked,
                                title: editingPage.countdown?.title || 'Tempo restante para garantir esta vaga:',
                                endDate: defaultEnd,
                                redirectOnExpire: editingPage.countdown?.redirectOnExpire !== false,
                                redirectType: editingPage.countdown?.redirectType || 'page',
                                serverRedirect: editingPage.countdown?.serverRedirect !== false,
                                expiredMessage: editingPage.countdown?.expiredMessage || '⏰ Tempo esgotado! Redirecionando para a próxima etapa...'
                              }
                            });
                          }}
                          className="w-5 h-5 text-blue-600 rounded cursor-pointer"
                        />
                      </div>

                      {editingPage.countdown?.enabled && (
                        <div className="space-y-4 pt-3 border-t border-slate-200">
                          {/* Title of Urgency */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                              Título da Escassez
                            </label>
                            <input
                              type="text"
                              value={editingPage.countdown.title || ''}
                              onChange={e => setEditingPage({
                                ...editingPage,
                                countdown: { ...editingPage.countdown, title: e.target.value }
                              })}
                              placeholder="Ex: Tempo restante para garantir esta condição:"
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-medium"
                            />
                          </div>

                          {/* Target Date and Time */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                Data e Horário Limite (Expiração)
                              </label>
                              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                Horário Local
                              </span>
                            </div>
                            <input
                              type="datetime-local"
                              value={editingPage.countdown.endDate ? editingPage.countdown.endDate.substring(0, 16) : ''}
                              onChange={e => setEditingPage({
                                ...editingPage,
                                countdown: { ...editingPage.countdown, endDate: e.target.value }
                              })}
                              className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-mono font-bold text-slate-800"
                            />

                            {/* Quick Shortcuts */}
                            <div className="mt-2 flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-medium">Atalhos rápidos:</span>
                              <button
                                type="button"
                                onClick={() => setEditingPage({
                                  ...editingPage,
                                  countdown: { ...editingPage.countdown, endDate: getQuickDateTime('today_midnight') }
                                })}
                                className="text-[11px] px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md font-medium text-slate-700 transition"
                              >
                                Hoje 23:59
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPage({
                                  ...editingPage,
                                  countdown: { ...editingPage.countdown, endDate: getQuickDateTime('tomorrow_midnight') }
                                })}
                                className="text-[11px] px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md font-medium text-slate-700 transition"
                              >
                                Amanhã 23:59
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPage({
                                  ...editingPage,
                                  countdown: { ...editingPage.countdown, endDate: getQuickDateTime('plus_days', 3) }
                                })}
                                className="text-[11px] px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md font-medium text-slate-700 transition"
                              >
                                +3 Dias
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingPage({
                                  ...editingPage,
                                  countdown: { ...editingPage.countdown, endDate: getQuickDateTime('plus_days', 7) }
                                })}
                                className="text-[11px] px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-md font-medium text-slate-700 transition"
                              >
                                +7 Dias (Vendas)
                              </button>
                            </div>
                          </div>

                          {/* Dynamic Redirection Section */}
                          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ExternalLink className="w-4 h-4 text-blue-600" />
                                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                                  Redirecionamento Automático
                                </span>
                              </div>
                              <label className="flex items-center gap-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={editingPage.countdown.redirectOnExpire !== false}
                                  onChange={e => setEditingPage({
                                    ...editingPage,
                                    countdown: { ...editingPage.countdown, redirectOnExpire: e.target.checked }
                                  })}
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                                <span className="text-xs font-semibold text-blue-900">Ativado</span>
                              </label>
                            </div>

                            <p className="text-[11px] text-blue-700 leading-snug">
                              Quando o cronômetro zerar (ou se o visitante entrar após a data), ele é redirecionado instantaneamente para a próxima página do funil.
                            </p>

                            {editingPage.countdown.redirectOnExpire !== false && (
                              <div className="space-y-3 pt-2">
                                {/* Type selector */}
                                <div className="grid grid-cols-2 gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingPage({
                                      ...editingPage,
                                      countdown: { ...editingPage.countdown, redirectType: 'page' }
                                    })}
                                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition ${
                                      (editingPage.countdown.redirectType || 'page') === 'page'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                    }`}
                                  >
                                    🏢 Página do MDTracker
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingPage({
                                      ...editingPage,
                                      countdown: { ...editingPage.countdown, redirectType: 'custom_url' }
                                    })}
                                    className={`py-2 px-3 text-xs font-bold rounded-lg border text-center transition ${
                                      editingPage.countdown.redirectType === 'custom_url'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                    }`}
                                  >
                                    🌐 Link Externo / Live
                                  </button>
                                </div>

                                {/* Destination Selector */}
                                {(editingPage.countdown.redirectType || 'page') === 'page' ? (
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                      Escolha a Próxima Landing Page
                                    </label>
                                    <select
                                      value={editingPage.countdown.redirectPageSlug || ''}
                                      onChange={e => {
                                        const slug = e.target.value;
                                        setEditingPage({
                                          ...editingPage,
                                          countdown: {
                                            ...editingPage.countdown,
                                            redirectPageSlug: slug,
                                            redirectUrl: slug ? `/p/${slug}` : ''
                                          }
                                        });
                                      }}
                                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-medium text-slate-800"
                                    >
                                      <option value="">Selecione uma Landing Page cadastrada...</option>
                                      {landingPages
                                        .filter(p => p.id !== editingPage.id && p.slug !== editingPage.slug)
                                        .map(p => (
                                          <option key={p.id} value={p.slug}>
                                            {p.title} (/p/{p.slug})
                                          </option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                      Ex: Página da Inscrição &rarr; redireciona para a Página da Live &rarr; redireciona para a Página de Vendas &rarr; redireciona para o Próximo Evento.
                                    </p>
                                  </div>
                                ) : (
                                  <div>
                                    <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                      URL Externa de Destino
                                    </label>
                                    <input
                                      type="url"
                                      value={editingPage.countdown.redirectUrl || ''}
                                      onChange={e => setEditingPage({
                                        ...editingPage,
                                        countdown: { ...editingPage.countdown, redirectUrl: e.target.value }
                                      })}
                                      placeholder="https://youtube.com/live/... ou checkout"
                                      className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs font-mono text-slate-800"
                                    />
                                  </div>
                                )}

                                {/* Transition message */}
                                <div>
                                  <label className="block text-[11px] font-semibold text-slate-700 uppercase mb-1">
                                    Mensagem de Redirecionamento
                                  </label>
                                  <input
                                    type="text"
                                    value={editingPage.countdown.expiredMessage || ''}
                                    onChange={e => setEditingPage({
                                      ...editingPage,
                                      countdown: { ...editingPage.countdown, expiredMessage: e.target.value }
                                    })}
                                    placeholder="Ex: ⏰ As inscrições foram encerradas! Redirecionando para a sala da live..."
                                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white text-xs"
                                  />
                                </div>

                                {/* Server 302 Redirect Toggle */}
                                <div className="pt-2 border-t border-blue-200/60">
                                  <label className="flex items-start gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={editingPage.countdown.serverRedirect !== false}
                                      onChange={e => setEditingPage({
                                        ...editingPage,
                                        countdown: { ...editingPage.countdown, serverRedirect: e.target.checked }
                                      })}
                                      className="w-4 h-4 text-blue-600 rounded mt-0.5"
                                    />
                                    <div className="text-[11px] text-slate-700">
                                      <span className="font-bold text-slate-900">Redirecionamento Inteligente no Servidor (302):</span> Quem abrir a página após a data/hora limite é encaminhado direto para a nova página, preservando tags e parâmetros de campanha (UTMs).
                                    </div>
                                  </label>
                                </div>
                              </div>
                            )}
                          </div>
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

                {/* 7. TIPOGRAFIA & CORES (RD STATION STYLE) */}
                {activeEditorTab === 'theme' && (
                  <div className="space-y-6">
                    {/* 1. Google Fonts Selector */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Tipografia & Fonte da Página
                        </label>
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          Google Fonts
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mb-3">
                        Selecione a fonte que melhor transmite a personalidade da sua oferta:
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {FONT_OPTIONS.map(font => {
                          const isSelected = (editingPage.theme?.fontFamily || 'Inter') === font.id;
                          return (
                            <button
                              key={font.id}
                              type="button"
                              onClick={() => setEditingPage({
                                ...editingPage,
                                theme: { ...editingPage.theme, fontFamily: font.id }
                              })}
                              className={`text-left p-3 rounded-2xl border transition relative ${
                                isSelected 
                                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100 shadow-xs' 
                                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="font-bold text-slate-900 text-xs">
                                  {font.name}
                                </span>
                                {isSelected && (
                                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                                    ✓
                                  </span>
                                )}
                              </div>
                              <div 
                                className="text-sm font-semibold text-slate-800 my-1 truncate"
                                style={{ fontFamily: font.id }}
                              >
                                {font.preview}
                              </div>
                              <p className="text-[10px] text-slate-500 leading-tight">
                                {font.description}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 2. Headline / Title Size Selector */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Tamanho dos Títulos Principais
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {TITLE_SIZES.map(ts => {
                          const isSelected = (editingPage.theme?.titleSize || 'normal') === ts.id;
                          return (
                            <button
                              key={ts.id}
                              type="button"
                              onClick={() => setEditingPage({
                                ...editingPage,
                                theme: { ...editingPage.theme, titleSize: ts.id }
                              })}
                              className={`p-2.5 rounded-xl border text-center transition ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100 font-bold text-blue-700'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="text-xs font-bold">{ts.label.split(' ')[0]}</div>
                              <div className="text-[10px] text-slate-400 mt-0.5">{ts.label.split(' ')[1] || ''}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 3. Primary Color & Presets */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Cor Primária (Botões de Ação e Destaques)
                      </label>
                      <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <input
                          type="color"
                          value={editingPage.theme?.primaryColor || '#2563eb'}
                          onChange={e => setEditingPage({
                            ...editingPage,
                            theme: { ...editingPage.theme, primaryColor: e.target.value }
                          })}
                          className="w-10 h-10 rounded-xl cursor-pointer border border-slate-300 shrink-0"
                        />
                        <div className="flex-1">
                          <input
                            type="text"
                            value={editingPage.theme?.primaryColor || '#2563eb'}
                            onChange={e => setEditingPage({
                              ...editingPage,
                              theme: { ...editingPage.theme, primaryColor: e.target.value }
                            })}
                            className="w-28 px-2 py-1 text-xs font-mono font-bold uppercase border border-slate-300 rounded-lg bg-white"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[
                            { color: '#2563eb', label: 'Azul Real' },
                            { color: '#059669', label: 'Esmeralda' },
                            { color: '#7c3aed', label: 'Roxo Tech' },
                            { color: '#ea580c', label: 'Laranja' },
                            { color: '#dc2626', label: 'Vermelho' },
                            { color: '#0f172a', label: 'Dark' }
                          ].map(c => (
                            <button
                              key={c.color}
                              type="button"
                              onClick={() => setEditingPage({
                                ...editingPage,
                                theme: { ...editingPage.theme, primaryColor: c.color }
                              })}
                              className={`w-6 h-6 rounded-full border-2 transition transform hover:scale-110 shadow-xs ${
                                (editingPage.theme?.primaryColor || '#2563eb') === c.color ? 'border-slate-900 ring-2 ring-blue-300' : 'border-white'
                              }`}
                              style={{ backgroundColor: c.color }}
                              title={c.label}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 4. Button Shape */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Estilo e Arredondamento dos Botões
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'rounded-xl', label: 'Moderno (12px)', preview: 'rounded-xl' },
                          { id: 'rounded-full', label: 'Pílula Redonda', preview: 'rounded-full' },
                          { id: 'rounded-md', label: 'Suave (6px)', preview: 'rounded-md' },
                          { id: 'square', label: 'Reto / Quadrado', preview: 'rounded-none' }
                        ].map(shape => {
                          const isSelected = (editingPage.theme?.buttonStyle || 'rounded-xl') === shape.id;
                          return (
                            <button
                              key={shape.id}
                              type="button"
                              onClick={() => setEditingPage({
                                ...editingPage,
                                theme: { ...editingPage.theme, buttonStyle: shape.id as any }
                              })}
                              className={`p-3 rounded-xl border text-center transition ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-100 font-bold text-blue-700'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              <div className="text-xs font-bold mb-1.5">{shape.label}</div>
                              <div 
                                className={`w-full py-1.5 text-white text-[10px] font-bold ${shape.preview}`}
                                style={{ backgroundColor: editingPage.theme?.primaryColor || '#2563eb' }}
                              >
                                Botão Exemplo
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}


              </div>
            </div>

            {/* RIGHT COLUMN: Live Interactive Device Preview */}
            <div className="flex-1 bg-slate-950 p-3 md:p-6 flex items-center justify-center overflow-hidden">
              {(() => {
                const primaryColor = editingPage.theme?.primaryColor || '#2563eb';
                const companyName = editingPage.footer?.companyName || currentCompany.name || 'MDTracker Growth';
                const hasHeaderFormBlock = Boolean(editingPage.blocks && editingPage.blocks.some(b => b.type === 'header_form' && b.enabled !== false));
                const showDefaultHero = (editingPage.hero as any)?.enabled !== false && !hasHeaderFormBlock;
                const buttonShapeClass = getButtonShapeClass(editingPage.theme?.buttonStyle);
                const heroTitleSizeClass = editingPage.theme?.titleSize === 'huge'
                  ? 'text-3xl sm:text-4xl lg:text-5xl'
                  : editingPage.theme?.titleSize === 'normal'
                  ? 'text-xl sm:text-2xl lg:text-3xl'
                  : 'text-2xl sm:text-3xl lg:text-4xl';

                if (previewDevice === 'iframe') {
                  const currentPreviewUrl = previewPageMode === 'thankyou' 
                    ? `/p/${editingPage.slug}/obrigado` 
                    : `/p/${editingPage.slug}`;
                  return (
                    <div className="w-full h-full flex flex-col bg-white rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
                      {/* Browser simulated top header */}
                      <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-300">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                          </div>
                          <span className="font-mono text-[11px] text-slate-400 ml-2 bg-slate-800 px-3 py-1 rounded-md border border-slate-700">
                            {currentPreviewUrl}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-400 hidden sm:inline">
                            Servidor Web Express em Tempo Real
                          </span>
                          <a 
                            href={currentPreviewUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px] font-semibold"
                          >
                            <span>{previewPageMode === 'thankyou' ? 'Abrir Obrigado Externo' : 'Abrir Página Externa'}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <iframe
                        key={editingPage.slug + previewPageMode + (editingPage.updatedAt || '')}
                        src={currentPreviewUrl}
                        className="w-full flex-1 border-0"
                        title="Preview Web Oficial"
                      />
                    </div>
                  );
                }

                // SIMULATED THANK YOU PAGE PREVIEW (Desktop / Mobile)
                if (previewPageMode === 'thankyou') {
                  const ty = editingPage.thankYouPage || {};
                  const tyTitle = ty.title || '🎉 Falta Apenas Um Último Passo!';
                  const tySubtitle = ty.subtitle || 'Seus dados foram confirmados com sucesso. Complete as etapas recomendadas abaixo para garantir seu acesso e materiais:';
                  const actionButtons = (ty.actionButtons && ty.actionButtons.length > 0) ? ty.actionButtons : [
                    {
                      id: 'wa-demo',
                      type: 'whatsapp_group' as const,
                      title: 'Entrar no Grupo VIP do WhatsApp',
                      description: 'Avisos prioritários, materiais complementares e networking sem spam.',
                      buttonText: 'Entrar no Grupo VIP do WhatsApp 📱',
                      icon: 'whatsapp',
                      color: '#10b981',
                      url: ty.whatsappGroupUrl || 'https://chat.whatsapp.com/demo-mdtracker',
                      badge: 'Recomendado'
                    },
                    {
                      id: 'pdf-demo',
                      type: 'download_pdf' as const,
                      title: 'Baixar Material Gratuito em PDF',
                      description: 'Faça o download imediato do seu guia e checklist exclusivo em PDF.',
                      buttonText: 'Baixar PDF Grátis Imediatamente 📥',
                      icon: 'download',
                      color: '#2563eb',
                      url: ty.pdfDownloadUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                      badge: 'Download Imediato'
                    },
                    {
                      id: 'survey-demo',
                      type: 'survey' as const,
                      title: 'Responder Pesquisa Rápida (1 Minuto)',
                      description: 'Personalize seu diagnóstico respondendo 3 perguntas rápidas.',
                      buttonText: 'Responder Pesquisa de Qualificação 📝',
                      icon: 'survey',
                      color: '#7c3aed',
                      url: '/pesquisa/qualificacao-comercial',
                      badge: '1 Minuto'
                    }
                  ];

                  return (
                    <div
                      className={`bg-white transition-all duration-300 overflow-y-auto shadow-2xl relative ${
                        previewDevice === 'mobile'
                          ? 'w-[375px] h-[680px] rounded-[44px] border-[12px] border-slate-800 ring-1 ring-slate-700'
                          : 'w-full h-full rounded-2xl border border-slate-800'
                      }`}
                      style={{ fontFamily: editingPage.theme?.fontFamily || 'Inter' }}
                    >
                      {/* Mobile Notch */}
                      {previewDevice === 'mobile' && (
                        <div className="sticky top-0 w-full h-6 bg-slate-800 flex items-center justify-center z-50">
                          <div className="w-20 h-4 bg-slate-900 rounded-b-xl"></div>
                        </div>
                      )}

                      {/* Desktop Browser Bar */}
                      {previewDevice === 'desktop' && (
                        <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 sticky top-0 z-50">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                            </div>
                            <div className="bg-white border border-slate-200 px-3 py-1 rounded-md text-[11px] text-slate-500 font-mono flex items-center gap-1.5 shadow-xs">
                              <Globe className="w-3 h-3 text-purple-600" />
                              <span>https://mdtracker.app/p/{editingPage.slug}/obrigado</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                              Preview: Página de Obrigado 🎉
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Top Nav Header */}
                      <header className={`px-6 py-4 bg-white/95 border-b border-slate-200 flex items-center justify-between sticky z-40 backdrop-blur-md shadow-xs ${previewDevice === 'desktop' ? 'top-[37px]' : 'top-6'}`}>
                        <div className="flex items-center gap-2.5">
                          <div 
                            className="w-9 h-9 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-md"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {(companyName || 'M').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-slate-900 tracking-tight text-base">{companyName}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Inscrição Confirmada</span>
                        </span>
                      </header>

                      {/* Celebration Hero */}
                      <div className="pt-10 pb-12 px-6 sm:px-10 text-center bg-gradient-to-b from-purple-50/60 via-white to-slate-50 border-b border-slate-100">
                        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border-4 border-emerald-200 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/10">
                          <Check className="w-8 h-8 stroke-[3]" />
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-700 mb-3 shadow-xs">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>{ty.badge || '🎉 Inscrição Confirmada com Sucesso!'}</span>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight mb-3">
                          {tyTitle}
                        </h1>

                        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed mb-6">
                          {tySubtitle}
                        </p>

                        {/* Video if present */}
                        {ty.videoUrl && (
                          <div className="max-w-md mx-auto mb-6 rounded-2xl overflow-hidden shadow-xl aspect-video bg-black">
                            <iframe
                              src={ty.videoUrl}
                              className="w-full h-full border-0"
                              title="Vídeo de Boas-vindas"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        )}

                        {/* Instructions Box if present */}
                        {ty.instructions && (
                          <div className="max-w-xl mx-auto mb-6 p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-left">
                            <div className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-1 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Orientações Importantes</span>
                            </div>
                            <p className="text-xs text-amber-800 whitespace-pre-line leading-relaxed">
                              {ty.instructions}
                            </p>
                          </div>
                        )}

                        {/* Action Cards */}
                        <div className="max-w-xl mx-auto space-y-3.5 text-left mt-6">
                          {actionButtons.map((btn: any, idx: number) => {
                            const btnColor = btn.color || (btn.type === 'whatsapp_group' ? '#10b981' : btn.type === 'download_pdf' ? '#2563eb' : '#7c3aed');
                            return (
                              <div
                                key={btn.id || idx}
                                className="p-4 sm:p-5 rounded-2xl border-2 bg-white transition shadow-sm hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                                style={{ borderColor: `${btnColor}35` }}
                              >
                                <div className="flex items-start gap-3">
                                  <div
                                    className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-sm"
                                    style={{ backgroundColor: btnColor }}
                                  >
                                    {btn.type === 'whatsapp_group' ? <MessageSquare className="w-5 h-5" /> :
                                     btn.type === 'download_pdf' ? <Download className="w-5 h-5" /> :
                                     btn.type === 'survey' ? <ClipboardList className="w-5 h-5" /> :
                                     <ExternalLink className="w-5 h-5" />}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-900 text-xs sm:text-sm">{btn.title}</span>
                                      {btn.badge && (
                                        <span
                                          className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                                          style={{ backgroundColor: `${btnColor}20`, color: btnColor }}
                                        >
                                          {btn.badge}
                                        </span>
                                      )}
                                    </div>
                                    {btn.description && (
                                      <p className="text-xs text-slate-500 mt-0.5 leading-snug">{btn.description}</p>
                                    )}
                                  </div>
                                </div>
                                <a
                                  href={btn.url || '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`w-full sm:w-auto px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:brightness-95 transition flex items-center justify-center gap-1.5 shrink-0 ${buttonShapeClass}`}
                                  style={{ backgroundColor: btnColor }}
                                >
                                  <span>{btn.buttonText || 'Acessar Agora'}</span>
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Footer */}
                      <footer className="bg-slate-900 text-slate-400 py-8 px-6 text-center text-xs">
                        <p>&copy; {new Date().getFullYear()} {companyName}. Todos os direitos reservados.</p>
                        <p className="text-[11px] text-slate-500 mt-1">MDTracker Growth Suite • Página de Obrigado de Alta Conversão</p>
                      </footer>
                    </div>
                  );
                }

                return (
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

                    {/* Browser bar for desktop */}
                    {previewDevice === 'desktop' && (
                      <div className="px-4 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 sticky top-0 z-50">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
                          </div>
                          <div className="bg-white border border-slate-200 px-3 py-1 rounded-md text-[11px] text-slate-500 font-mono flex items-center gap-1.5 shadow-xs">
                            <Globe className="w-3 h-3 text-slate-400" />
                            <span>https://mdtracker.app/p/{editingPage.slug}</span>
                          </div>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium hidden md:block">
                          Preview Desktop Idêntico à Web
                        </div>
                      </div>
                    )}

                    {/* Simulated Top Nav Header & Hero Section */}
                    {showDefaultHero && (
                      <>
                        <header className={`px-6 py-4 bg-white/95 border-b border-slate-200 flex items-center justify-between sticky z-40 backdrop-blur-md shadow-xs ${previewDevice === 'desktop' ? 'top-[37px]' : 'top-6'}`}>
                          <div className="flex items-center gap-2.5">
                            <div 
                              className="w-9 h-9 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-md"
                              style={{ backgroundColor: primaryColor }}
                            >
                              {(companyName || 'M').charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900 tracking-tight text-base">{companyName}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const formEl = document.getElementById('preview-capture-form');
                              formEl?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`text-xs sm:text-sm font-semibold text-white px-4 py-2 transition inline-flex items-center gap-1.5 shadow-xs hover:brightness-95 ${buttonShapeClass}`}
                            style={{ backgroundColor: primaryColor }}
                          >
                            <span>{editingPage.hero?.ctaText || 'Acessar Agora'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </header>

                        {/* Hero Section */}
                        <section className="pt-10 pb-16 md:pt-14 md:pb-20 px-6 sm:px-10 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200/80">
                          <div className={previewDevice === 'desktop' ? 'grid grid-cols-12 gap-8 lg:gap-10 items-start' : 'flex flex-col gap-6'}>
                            
                            {/* Left: Copy & Value Proposition */}
                            <div className={previewDevice === 'desktop' ? 'col-span-7 text-left' : 'w-full text-center'}>
                              {editingPage.hero?.badge && (
                                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
                                  <span>{editingPage.hero.badge}</span>
                                </div>
                              )}

                              <h1 className={`${heroTitleSizeClass} font-black text-slate-900 leading-tight tracking-tight mb-4`}>
                                {editingPage.hero?.headline || editingPage.title}
                              </h1>

                              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6 font-normal">
                                {editingPage.hero?.subheadline || editingPage.description}
                              </p>

                              {/* Countdown Timer Preview */}
                              {editingPage.countdown?.enabled && (() => {
                                const cd = getTimerRemaining(editingPage.countdown?.endDate);
                                const targetPage = (editingPage.countdown?.redirectType || 'page') === 'page' && editingPage.countdown?.redirectPageSlug
                                  ? landingPages.find(p => p.slug === editingPage.countdown?.redirectPageSlug)
                                  : null;
                                const targetLabel = editingPage.countdown?.redirectType === 'custom_url'
                                  ? editingPage.countdown.redirectUrl
                                  : targetPage ? targetPage.title : editingPage.countdown?.redirectPageSlug;

                                return (
                                  <div className={`mb-6 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl max-w-lg ${previewDevice === 'desktop' ? '' : 'mx-auto'}`}>
                                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                      <span>{editingPage.countdown.title || 'Tempo restante para garantir esta condição:'}</span>
                                      {editingPage.countdown.endDate && (
                                        <span className="text-[10px] text-amber-400 font-mono">
                                          {new Date(editingPage.countdown.endDate).toLocaleDateString('pt-BR')} {new Date(editingPage.countdown.endDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 text-center font-bold">
                                      <div className="bg-slate-800/90 border border-slate-700/60 p-2 rounded-xl">
                                        <span className="text-2xl font-black text-amber-400">{cd.days}</span>
                                        <span className="block text-[10px] text-slate-400 uppercase font-normal">Dias</span>
                                      </div>
                                      <div className="bg-slate-800/90 border border-slate-700/60 p-2 rounded-xl">
                                        <span className="text-2xl font-black text-white">{cd.hours}</span>
                                        <span className="block text-[10px] text-slate-400 uppercase font-normal">Horas</span>
                                      </div>
                                      <div className="bg-slate-800/90 border border-slate-700/60 p-2 rounded-xl">
                                        <span className="text-2xl font-black text-white">{cd.mins}</span>
                                        <span className="block text-[10px] text-slate-400 uppercase font-normal">Min</span>
                                      </div>
                                      <div className="bg-slate-800/90 border border-slate-700/60 p-2 rounded-xl">
                                        <span className="text-2xl font-black text-emerald-400">{cd.secs}</span>
                                        <span className="block text-[10px] text-slate-400 uppercase font-normal">Seg</span>
                                      </div>
                                    </div>
                                    {editingPage.countdown.redirectOnExpire !== false && targetLabel && (
                                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                                        <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                                          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                          Ao zerar redireciona para:
                                        </span>
                                        <span className="font-semibold text-slate-200 truncate max-w-[200px]" title={targetLabel}>
                                          {targetLabel}
                                        </span>
                                      </div>
                                    )}
                                    {cd.isExpired && (
                                      <div className="mt-2.5 p-1.5 bg-red-500/20 border border-red-500/40 rounded-lg text-center text-xs text-red-300 font-medium">
                                        ⚠️ Timer expirado! Visitantes serão redirecionados automaticamente.
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}

                              {/* Hero CTA Button */}
                              <div className={`flex flex-col sm:flex-row items-center gap-4 ${previewDevice === 'desktop' ? 'justify-start' : 'justify-center'}`}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const formEl = document.getElementById('preview-capture-form');
                                    formEl?.scrollIntoView({ behavior: 'smooth' });
                                  }}
                                  className={`w-full sm:w-auto px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-blue-500/20 transition transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2 ${buttonShapeClass}`}
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  <span>{editingPage.hero?.ctaText || 'Quero Meu Acesso Agora'}</span>
                                  <ArrowRight className="w-5 h-5" />
                                </button>
                              </div>

                              {/* Trust indicators */}
                              <div className={`mt-6 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-slate-500 ${previewDevice === 'desktop' ? 'justify-start' : 'justify-center'}`}>
                                <span className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                  Acesso Imediato
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                  Sem Spam ou Mensagens Indesejadas
                                </span>
                                <span className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                                  Privacidade Garantida
                                </span>
                              </div>
                            </div>

                            {/* Right: Capture Form Card */}
                            <div className={previewDevice === 'desktop' ? 'col-span-5' : 'w-full'}>
                              <div id="preview-capture-form" className="bg-white p-6 sm:p-7 rounded-2xl border-2 border-slate-200/80 shadow-2xl relative">
                                <div className="absolute -top-3 right-6 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                  Cadastre-se Grátis
                                </div>

                                <div className="mb-5">
                                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                    {editingPage.form?.title || 'Garanta sua Vaga'}
                                  </h2>
                                  {editingPage.form?.subtitle && (
                                    <p className="text-xs sm:text-sm text-slate-500 mt-1">{editingPage.form.subtitle}</p>
                                  )}
                                </div>

                                <form onSubmit={handleTestPreviewSubmit} className="space-y-3.5">
                                  {(editingPage.form?.fields || [
                                    { id: 'name', name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Seu nome', required: true, enabled: true },
                                    { id: 'phone', name: 'phone', label: 'WhatsApp', type: 'tel', placeholder: '(11) 99999-9999', required: true, enabled: true },
                                    { id: 'email', name: 'email', label: 'Seu E-mail', type: 'email', placeholder: 'seu@email.com', required: true, enabled: true }
                                  ]).map(f => (
                                    <div key={f.id}>
                                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                        {f.label} {f.required && <span className="text-red-500">*</span>}
                                      </label>
                                      {f.type === 'textarea' ? (
                                        <textarea
                                          value={previewFormValues[f.name || f.id] || ''}
                                          onChange={e => setPreviewFormValues({ ...previewFormValues, [f.name || f.id]: e.target.value })}
                                          placeholder={f.placeholder}
                                          rows={3}
                                          required={f.required}
                                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden text-xs sm:text-sm transition bg-white"
                                        />
                                      ) : (
                                        <input
                                          type={f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : 'text'}
                                          value={previewFormValues[f.name || f.id] || ''}
                                          onChange={e => setPreviewFormValues({ ...previewFormValues, [f.name || f.id]: e.target.value })}
                                          placeholder={f.placeholder}
                                          required={f.required}
                                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden text-xs sm:text-sm transition bg-white"
                                        />
                                      )}
                                    </div>
                                  ))}

                                  {previewSubmitStatus && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
                                      {previewSubmitStatus}
                                    </div>
                                  )}

                                  <button
                                    type="submit"
                                    className={`w-full py-3.5 px-6 font-bold text-sm sm:text-base text-white shadow-md transition flex items-center justify-center gap-2 hover:brightness-95 ${buttonShapeClass}`}
                                    style={{ backgroundColor: primaryColor }}
                                  >
                                    <span>{editingPage.form?.buttonText || 'Enviar Dados Agora'}</span>
                                  </button>

                                  <p className="text-[11px] text-slate-400 text-center mt-2.5">
                                    🔒 Seus dados estão protegidos pela Lei Geral de Proteção de Dados (LGPD).
                                  </p>
                                </form>
                              </div>
                            </div>

                          </div>
                        </section>
                      </>
                    )}

                    {/* Dynamic Modular Blocks or Legacy Sections Fallback */}
                    {editingPage.blocks && editingPage.blocks.length > 0 ? (
                      editingPage.blocks
                        .filter(b => b.enabled !== false)
                        .map((b, bIdx) => {
                          const bgMap: Record<string, string> = {
                            white: 'bg-white text-slate-800 border-b border-slate-200/80',
                            slate: 'bg-slate-50 text-slate-800 border-b border-slate-200/80',
                            dark: 'bg-slate-900 text-white border-b border-slate-800',
                            primary: 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-b border-blue-700'
                          };
                          const bgClass = bgMap[b.backgroundColor || 'white'] || bgMap.white;

                          if (b.type === 'header_form') {
                            const isLeft = b.formPosition === 'left';
                            const trustBadges = b.headerTrustBadges || ['Acesso Imediato', 'Sem Spam ou Mensagens Indesejadas', 'Privacidade Garantida'];
                            const navEnabled = b.headerNavbarEnabled !== false;
                            const blockLogo = b.headerLogoText || companyName || 'MDTracker Growth Suite';
                            const blockNavCta = b.headerNavCtaText || 'Quero Meu Acesso Gratuito Agora →';
                            const blockBadge = b.headerBadge || '🚀 OPORTUNIDADE EXCLUSIVA: POWER UP';
                            const blockHeadline = b.title || b.headerHeadline || 'Como Acelerar seus Resultados com Power UP de Forma Previsível e Rápida';
                            const blockSubheadline = b.subtitle || b.headerSubheadline || 'Acesse o método prático e validado por centenas de clientes para economizar tempo, evitar erros comuns e maximizar seus retornos.';
                            const blockPrimaryCta = b.headerPrimaryCtaText || 'Quero Meu Acesso Gratuito Agora →';
                            const formBadge = b.formCardBadge || 'CADASTRE-SE GRÁTIS';
                            const formTitle = b.formCardTitle || 'Garanta sua Condição Especial';
                            const formSubtitle = b.formCardSubtitle || 'Preencha os campos abaixo e receba atendimento exclusivo em minutos.';
                            const formBtnText = b.formCardButtonText || 'Quero Começar Agora Mesmo 🚀';
                            const lgpdText = b.formLgpdNotice || '🔒 Seus dados estão protegidos pela Lei Geral de Proteção de Dados (LGPD).';

                            return (
                              <section key={b.id || bIdx} className={`py-8 md:py-16 ${bgClass}`}>
                                {navEnabled && (
                                  <div className="max-w-6xl mx-auto px-6 sm:px-10 mb-8 sm:mb-12 flex items-center justify-between pb-4 border-b border-slate-200/60">
                                    <div className="flex items-center gap-2.5">
                                      <div 
                                        className={`w-9 h-9 ${buttonShapeClass} text-white font-bold flex items-center justify-center text-sm shadow-sm`}
                                        style={{ backgroundColor: primaryColor }}
                                      >
                                        {blockLogo.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="font-extrabold text-slate-900 text-base sm:text-lg tracking-tight">{blockLogo}</span>
                                    </div>
                                    <div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const el = document.getElementById(`preview-block-form-${b.id}`);
                                          el?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className={`inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 ${buttonShapeClass} text-white text-xs sm:text-sm font-bold shadow-md transition transform hover:-translate-y-0.5 hover:opacity-90`}
                                        style={{ backgroundColor: primaryColor }}
                                      >
                                        <span>{blockNavCta}</span>
                                      </button>
                                    </div>
                                  </div>
                                )}

                                <div className="max-w-6xl mx-auto px-6 sm:px-10">
                                  <div className={`grid grid-cols-1 ${previewDevice === 'desktop' ? 'lg:grid-cols-12 gap-8 lg:gap-12' : 'gap-8'} items-center`}>
                                    
                                    {/* Copy Column */}
                                    <div className={`${previewDevice === 'desktop' ? `lg:col-span-7 ${isLeft ? 'lg:order-2' : 'lg:order-1'}` : ''} text-center lg:text-left`}>
                                      {blockBadge && (
                                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-5 bg-blue-50 text-blue-700 border border-blue-200/80 shadow-xs">
                                          <span>{blockBadge}</span>
                                        </div>
                                      )}

                                      <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-5">
                                        {blockHeadline}
                                      </h1>

                                      <p className="text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0">
                                        {blockSubheadline}
                                      </p>

                                      {/* Countdown Timer Preview in header_form (if enabled) */}
                                      {editingPage.countdown?.enabled && (() => {
                                        const cd = getTimerRemaining(editingPage.countdown?.endDate);
                                        const targetPage = (editingPage.countdown?.redirectType || 'page') === 'page' && editingPage.countdown?.redirectPageSlug
                                          ? landingPages.find(p => p.slug === editingPage.countdown?.redirectPageSlug)
                                          : null;
                                        const targetLabel = editingPage.countdown?.redirectType === 'custom_url'
                                          ? editingPage.countdown.redirectUrl
                                          : targetPage ? targetPage.title : editingPage.countdown?.redirectPageSlug;

                                        return (
                                          <div className="mb-8 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl max-w-lg mx-auto lg:mx-0">
                                            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                              <span>{editingPage.countdown.title || 'Tempo restante para esta condição:'}</span>
                                              {editingPage.countdown.endDate && (
                                                <span className="text-[10px] text-amber-400 font-mono">
                                                  {new Date(editingPage.countdown.endDate).toLocaleDateString('pt-BR')} {new Date(editingPage.countdown.endDate).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                              )}
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 text-center font-bold">
                                              <div className="bg-slate-800/90 border border-slate-700/60 p-2 rounded-xl">
                                                <span className="text-2xl font-black text-amber-400">{cd.days}</span>
                                                <span className="block text-[10px] text-slate-400 uppercase font-normal">Dias</span>
                                              </div>
                                              <div className="bg-slate-800/90 border border-slate-700/60 p-2 rounded-xl">
                                                <span className="text-2xl font-black text-white">{cd.hours}</span>
                                                <span className="block text-[10px] text-slate-400 uppercase font-normal">Horas</span>
                                              </div>
                                              <div className="bg-slate-800/90 border border-slate-700/60 p-2 rounded-xl">
                                                <span className="text-2xl font-black text-white">{cd.mins}</span>
                                                <span className="block text-[10px] text-slate-400 uppercase font-normal">Min</span>
                                              </div>
                                              <div className="bg-slate-800/90 border border-slate-700/60 p-2 rounded-xl">
                                                <span className="text-2xl font-black" style={{ color: primaryColor }}>{cd.secs}</span>
                                                <span className="block text-[10px] text-slate-400 uppercase font-normal">Seg</span>
                                              </div>
                                            </div>
                                            {editingPage.countdown.redirectOnExpire !== false && targetLabel && (
                                              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                                                <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                                                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                                  Ao zerar redireciona para:
                                                </span>
                                                <span className="font-semibold text-slate-200 truncate max-w-[200px]" title={targetLabel}>
                                                  {targetLabel}
                                                </span>
                                              </div>
                                            )}
                                            {cd.isExpired && (
                                              <div className="mt-2.5 p-1.5 bg-red-500/20 border border-red-500/40 rounded-lg text-center text-xs text-red-300 font-medium">
                                                ⚠️ Timer expirado! Visitantes serão redirecionados automaticamente.
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })()}

                                      <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-8">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const el = document.getElementById(`preview-block-form-${b.id}`);
                                            el?.scrollIntoView({ behavior: 'smooth' });
                                          }}
                                          className={`w-full sm:w-auto px-7 py-4 ${buttonShapeClass} text-white font-extrabold text-sm sm:text-base shadow-lg transition transform hover:-translate-y-0.5 hover:opacity-90 flex items-center justify-center gap-2`}
                                          style={{ backgroundColor: primaryColor }}
                                        >
                                          <span>{blockPrimaryCta}</span>
                                        </button>
                                      </div>

                                      {/* Trust Badges */}
                                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-600">
                                        {trustBadges.map((badge, bIndex) => (
                                          <span key={bIndex} className="flex items-center gap-1.5 font-medium">
                                            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: primaryColor }} />
                                            <span>{badge}</span>
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Form Card Column */}
                                    <div className={`${previewDevice === 'desktop' ? `lg:col-span-5 ${isLeft ? 'lg:order-1' : 'lg:order-2'}` : 'w-full'}`}>
                                      <div id={`preview-block-form-${b.id}`} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xl relative">
                                        {formBadge && (
                                          <div 
                                            className="absolute -top-3.5 right-6 text-white text-[11px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md"
                                            style={{ backgroundColor: primaryColor }}
                                          >
                                            {formBadge}
                                          </div>
                                        )}

                                        <div className="mb-6">
                                          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                            {formTitle}
                                          </h2>
                                          <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                            {formSubtitle}
                                          </p>
                                        </div>

                                        {/* Autofill recognition simulation */}
                                        {previewFormValues.name && (
                                          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 transition shadow-xs">
                                            <div className="flex items-center gap-2">
                                              <span className="text-base">⚡</span>
                                              <div>
                                                <span className="font-bold">Olá, {previewFormValues.name}!</span>
                                                <p className="text-[11px] text-emerald-600">Seus dados foram preenchidos automaticamente.</p>
                                              </div>
                                            </div>
                                            <button
                                              type="button"
                                              onClick={() => setPreviewFormValues({})}
                                              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline px-2 py-1 rounded-md hover:bg-emerald-100 transition"
                                            >
                                              Limpar
                                            </button>
                                          </div>
                                        )}

                                        <form onSubmit={handleTestPreviewSubmit} className="space-y-4">
                                          {(editingPage.form?.fields || [
                                            { id: 'name', name: 'name', label: 'Seu Nome', type: 'text', placeholder: 'Como podemos te chamar?', required: true, enabled: true },
                                            { id: 'phone', name: 'phone', label: 'Seu WhatsApp', type: 'tel', placeholder: '(11) 99999-9999', required: true, enabled: true },
                                            { id: 'email', name: 'email', label: 'Seu Melhor E-mail', type: 'email', placeholder: 'seu@email.com', required: true, enabled: true }
                                          ]).map(f => (
                                            <div key={f.id}>
                                              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                                {f.label} {f.required && <span className="text-red-500">*</span>}
                                              </label>
                                              <input
                                                type={f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : 'text'}
                                                value={previewFormValues[f.name || f.id] || ''}
                                                onChange={e => setPreviewFormValues({ ...previewFormValues, [f.name || f.id]: e.target.value })}
                                                placeholder={f.placeholder}
                                                required={f.required}
                                                autoComplete={f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : 'name'}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-hidden text-xs sm:text-sm transition bg-slate-50/50 focus:bg-white"
                                              />
                                            </div>
                                          ))}

                                          {previewSubmitStatus && (
                                            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium">
                                              {previewSubmitStatus}
                                            </div>
                                          )}

                                          <button
                                            type="submit"
                                            className={`w-full py-4 px-6 font-black text-sm sm:text-base ${buttonShapeClass} text-white shadow-lg transition transform hover:-translate-y-0.5 hover:opacity-90 flex items-center justify-center gap-2`}
                                            style={{ backgroundColor: primaryColor }}
                                          >
                                            <span>{formBtnText}</span>
                                          </button>

                                          <p className="text-[11px] text-slate-400 text-center mt-3 leading-relaxed">
                                            {lgpdText}
                                          </p>
                                        </form>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </section>
                            );
                          }

                          if (b.type === 'video') {
                            const embedUrl = normalizeEmbedUrl(b.videoUrl || '');
                            return (
                              <section key={b.id || bIdx} className={`py-12 md:py-16 px-6 sm:px-10 ${bgClass}`}>
                                <div className="max-w-3xl mx-auto text-center">
                                  {b.title && <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-2">{b.title}</h2>}
                                  {b.subtitle && <p className="text-xs sm:text-sm opacity-80 mb-6 max-w-xl mx-auto">{b.subtitle}</p>}
                                  {embedUrl ? (
                                    <div className="rounded-2xl overflow-hidden shadow-2xl border border-black/10 bg-black aspect-video max-w-2xl mx-auto">
                                      <iframe
                                        className="w-full h-full"
                                        src={embedUrl}
                                        title={b.title || 'Vídeo'}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                    </div>
                                  ) : (
                                    <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs">
                                      <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                      Insira o link do YouTube ou Vimeo para exibir o player
                                    </div>
                                  )}
                                  {b.videoCaption && <p className="text-xs opacity-75 mt-3 italic">{b.videoCaption}</p>}
                                </div>
                              </section>
                            );
                          }

                          if (b.type === 'image') {
                            const isFullWidth = b.imageWidth === 'full';
                            return (
                              <section key={b.id || bIdx} className={`${isFullWidth ? 'py-8 md:py-12 px-0' : 'py-12 md:py-16 px-6 sm:px-10'} ${bgClass}`}>
                                <div className={isFullWidth ? 'w-full text-center' : 'max-w-4xl mx-auto text-center'}>
                                  {(b.title || b.subtitle) && (
                                    <div className="max-w-4xl mx-auto px-6 mb-6">
                                      {b.title && <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-2">{b.title}</h2>}
                                      {b.subtitle && <p className="text-xs sm:text-sm opacity-80 max-w-xl mx-auto">{b.subtitle}</p>}
                                    </div>
                                  )}
                                  {b.imageUrl ? (
                                    isFullWidth ? (
                                      <div className="w-full overflow-hidden shadow-md">
                                        <img
                                          src={b.imageUrl}
                                          alt={b.imageAlt || b.title || 'Imagem'}
                                          className="w-full max-h-[560px] object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="inline-block rounded-2xl overflow-hidden shadow-xl border border-black/10 max-w-full">
                                        <img
                                          src={b.imageUrl}
                                          alt={b.imageAlt || b.title || 'Imagem'}
                                          className="max-h-[440px] w-auto max-w-full object-cover rounded-2xl mx-auto"
                                        />
                                      </div>
                                    )
                                  ) : (
                                    <div className="rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs mx-6">
                                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                      Insira a URL da imagem ou pesquise uma foto por assunto no banco de imagens
                                    </div>
                                  )}
                                  {b.imageCaption && (
                                    <p className="text-xs opacity-75 mt-3 max-w-xl mx-auto px-6 italic">
                                      {b.imageCaption}
                                    </p>
                                  )}
                                </div>
                              </section>
                            );
                          }

                          if (b.type === 'text') {
                            const alignClass = b.textAlignment === 'center' ? 'text-center' : b.textAlignment === 'right' ? 'text-right' : 'text-left';
                            return (
                              <section key={b.id || bIdx} className={`py-12 md:py-16 px-6 sm:px-10 ${bgClass}`}>
                                <div className={`max-w-3xl mx-auto ${alignClass}`}>
                                  {b.title && <h2 className="text-xl sm:text-2xl md:text-3xl font-black mb-2">{b.title}</h2>}
                                  {b.subtitle && <p className="text-xs sm:text-sm font-semibold text-blue-600 mb-4">{b.subtitle}</p>}
                                  <div className="opacity-90 leading-relaxed space-y-3 text-xs sm:text-sm whitespace-pre-line">
                                    {b.textContent || 'Texto narrativo de alta conversão. Apresente sua história e diferenciais com clareza.'}
                                  </div>
                                </div>
                              </section>
                            );
                          }

                          if (b.type === 'features') {
                            const feats = b.features || editingPage.features || [];
                            return (
                              <section key={b.id || bIdx} className={`py-12 md:py-16 px-6 sm:px-10 ${bgClass}`}>
                                <div className="max-w-5xl mx-auto">
                                  <div className="text-center max-w-xl mx-auto mb-8">
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                      Diferenciais
                                    </span>
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mt-2.5">
                                      {b.title || 'Tudo que você precisa para acelerar seu negócio'}
                                    </h2>
                                    {b.subtitle && <p className="text-xs sm:text-sm opacity-80 mt-1">{b.subtitle}</p>}
                                  </div>
                                  <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                                    {feats.map((feat, fIdx) => (
                                      <div key={feat.id || fIdx} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm flex-1 min-w-[240px] p-5 rounded-2xl bg-white/95 border border-slate-200/80 shadow-xs hover:border-blue-400 hover:shadow-md transition text-slate-800 flex flex-col justify-between">
                                        <div>
                                          <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white mb-3 shadow-xs text-sm"
                                            style={{ backgroundColor: primaryColor }}
                                          >
                                            {fIdx + 1}
                                          </div>
                                          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">{feat.title}</h3>
                                          <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </section>
                            );
                          }

                          if (b.type === 'socialProof') {
                            const testimonials = b.testimonials || editingPage.socialProof?.testimonials || [];
                            const stats = b.stats || editingPage.socialProof?.stats || [];
                            return (
                              <section key={b.id || bIdx} className={`py-12 md:py-16 px-6 sm:px-10 ${bgClass}`}>
                                <div className="max-w-5xl mx-auto">
                                  {stats.length > 0 && (
                                    <div className={`flex flex-wrap justify-center items-center gap-6 sm:gap-10 mb-10 text-center border-b ${b.backgroundColor === 'dark' ? 'border-slate-800' : 'border-slate-200'} pb-8`}>
                                      {stats.map((s, sIdx) => (
                                        <div key={sIdx} className="min-w-[100px]">
                                          <div className="text-2xl sm:text-3xl font-black text-amber-400 mb-0.5">{s.value}</div>
                                          <div className="text-xs opacity-80 font-medium">{s.label}</div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  <div className="text-center max-w-xl mx-auto mb-8">
                                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{b.title || 'O que dizem os nossos clientes'}</h2>
                                    {b.subtitle && <p className="text-xs opacity-80 mt-1">{b.subtitle}</p>}
                                  </div>
                                  <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                                    {testimonials.map((t, tIdx) => (
                                      <div key={t.id || tIdx} className={`w-full sm:w-[calc(50%-12px)] max-w-md p-5 rounded-2xl border shadow-xs ${b.backgroundColor === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'} flex flex-col justify-between`}>
                                        <div>
                                          <div className="flex items-center gap-1 text-amber-400 mb-2 text-xs">
                                            {'★'.repeat(t.rating || 5)}
                                          </div>
                                          <p className="text-xs italic mb-3 opacity-90">"{t.text}"</p>
                                        </div>
                                        <div className="flex items-center gap-2.5">
                                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-xs">
                                            {(t.name || 'C').charAt(0)}
                                          </div>
                                          <div>
                                            <div className="font-bold text-xs">{t.name}</div>
                                            <div className="text-[10px] opacity-70">{t.role}</div>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </section>
                            );
                          }

                          if (b.type === 'pricing') {
                            const plans = b.pricingPlans || [];
                            return (
                              <section key={b.id || bIdx} className={`py-12 md:py-16 px-6 sm:px-10 ${bgClass}`}>
                                <div className="max-w-5xl mx-auto">
                                  <div className="text-center max-w-xl mx-auto mb-10">
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                      Planos & Condições
                                    </span>
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mt-2.5">
                                      {b.title || 'Escolha o Plano Ideal'}
                                    </h2>
                                    <p className="text-xs sm:text-sm opacity-80 mt-1">{b.subtitle || 'Transparência total e sem taxas escondidas'}</p>
                                  </div>
                                  <div className="flex flex-wrap justify-center gap-6 items-stretch max-w-4xl mx-auto">
                                    {plans.map((plan, pIdx) => (
                                      <div
                                        key={plan.id || pIdx}
                                        className={`w-full sm:w-[320px] max-w-sm p-6 rounded-2xl border flex flex-col justify-between transition text-slate-800 ${
                                          plan.highlighted
                                            ? 'border-2 border-blue-600 shadow-xl relative bg-white sm:-translate-y-2'
                                            : 'border-slate-200 bg-white shadow-xs'
                                        }`}
                                      >
                                        <div>
                                          {plan.highlighted && (
                                            <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-xs">
                                              {plan.badge || 'Mais Vendido'}
                                            </span>
                                          )}
                                          <h3 className="font-bold text-base text-slate-900 mb-1">{plan.name}</h3>
                                          {plan.description && <p className="text-xs text-slate-500 mb-3">{plan.description}</p>}
                                          <div className="my-3">
                                            <span className="text-2xl sm:text-3xl font-black text-slate-900">{plan.price}</span>
                                            {plan.period && <span className="text-xs text-slate-500 ml-1">/{plan.period}</span>}
                                          </div>
                                          <ul className="space-y-2 text-xs text-slate-600 my-5">
                                            {(plan.features || []).map((feat, fIdx) => (
                                              <li key={fIdx} className="flex items-center gap-2">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                                <span>{feat}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const formEl = document.getElementById('preview-capture-form');
                                            formEl?.scrollIntoView({ behavior: 'smooth' });
                                          }}
                                          className={`w-full py-2.5 px-4 text-center font-bold text-xs transition block ${buttonShapeClass} ${
                                            plan.highlighted
                                              ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-md'
                                              : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                                          }`}
                                        >
                                          {plan.buttonText || 'Garantir Vaga'}
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </section>
                            );
                          }

                          if (b.type === 'faq') {
                            const faqItems = b.faqItems || editingPage.faq?.items || [];
                            return (
                              <section key={b.id || bIdx} className={`py-12 md:py-16 px-6 sm:px-10 ${bgClass}`}>
                                <div className="max-w-3xl mx-auto">
                                  <div className="text-center mb-8">
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                      Tire suas dúvidas
                                    </span>
                                    <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight mt-2.5">
                                      {b.title || 'Perguntas Frequentes'}
                                    </h2>
                                    {b.subtitle && <p className="text-xs sm:text-sm opacity-80 mt-1">{b.subtitle}</p>}
                                  </div>
                                  <div className="space-y-3">
                                    {faqItems.map((item, fIdx) => {
                                      const itemKey = `${b.id || bIdx}-${fIdx}`;
                                      const isOpen = previewOpenFaqKey === itemKey;
                                      return (
                                        <div key={item.id || fIdx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 text-slate-800">
                                          <button
                                            type="button"
                                            onClick={() => setPreviewOpenFaqKey(isOpen ? null : itemKey)}
                                            className="w-full p-4 text-left font-semibold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-100/70 transition"
                                          >
                                            <span className="text-xs sm:text-sm">{item.question}</span>
                                            <span className="text-base font-bold text-slate-400">{isOpen ? '−' : '+'}</span>
                                          </button>
                                          {isOpen && (
                                            <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-200/50 bg-white">
                                              {item.answer}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </section>
                            );
                          }

                          if (b.type === 'countdown') {
                            const cd = getTimerRemaining(b.countdownEndDate || editingPage.countdown?.endDate);
                            const targetPage = (b.countdownRedirectType || 'page') === 'page' && b.countdownRedirectPageSlug
                              ? landingPages.find(p => p.slug === b.countdownRedirectPageSlug)
                              : null;
                            const targetLabel = b.countdownRedirectType === 'custom_url'
                              ? b.countdownRedirectUrl
                              : targetPage ? targetPage.title : b.countdownRedirectPageSlug;

                            return (
                              <section key={b.id || bIdx} className="py-10 bg-slate-900 text-white text-center border-b border-slate-800 px-6">
                                <div className="max-w-lg mx-auto">
                                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                                    <span>{b.countdownTitle || b.title || 'Tempo restante para garantir esta condição:'}</span>
                                    {(b.countdownEndDate || editingPage.countdown?.endDate) && (
                                      <span className="text-[10px] text-amber-400 font-mono">
                                        {new Date(b.countdownEndDate || editingPage.countdown?.endDate!).toLocaleDateString('pt-BR')} {new Date(b.countdownEndDate || editingPage.countdown?.endDate!).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    )}
                                  </div>
                                  <div className="grid grid-cols-4 gap-2 text-center font-bold">
                                    <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                                      <span className="text-xl sm:text-2xl font-black text-amber-400">{cd.days}</span>
                                      <span className="block text-[10px] text-slate-400 uppercase font-normal">Dias</span>
                                    </div>
                                    <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                                      <span className="text-xl sm:text-2xl font-black text-white">{cd.hours}</span>
                                      <span className="block text-[10px] text-slate-400 uppercase font-normal">Horas</span>
                                    </div>
                                    <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                                      <span className="text-xl sm:text-2xl font-black text-white">{cd.mins}</span>
                                      <span className="block text-[10px] text-slate-400 uppercase font-normal">Min</span>
                                    </div>
                                    <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
                                      <span className="text-xl sm:text-2xl font-black text-emerald-400">{cd.secs}</span>
                                      <span className="block text-[10px] text-slate-400 uppercase font-normal">Seg</span>
                                    </div>
                                  </div>
                                  {(b.countdownRedirectOnExpire || editingPage.countdown?.redirectOnExpire) && targetLabel && (
                                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                                      <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                        Ao zerar redireciona para:
                                      </span>
                                      <span className="font-semibold text-slate-200 truncate max-w-[200px]" title={targetLabel}>
                                        {targetLabel}
                                      </span>
                                    </div>
                                  )}
                                  {cd.isExpired && (
                                    <div className="mt-2.5 p-1.5 bg-red-500/20 border border-red-500/40 rounded-lg text-center text-xs text-red-300 font-medium">
                                      ⚠️ Timer expirado! Visitantes serão redirecionados automaticamente.
                                    </div>
                                  )}
                                </div>
                              </section>
                            );
                          }

                          if (b.type === 'cta_banner') {
                            return (
                              <section key={b.id || bIdx} className="py-12 md:py-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white text-center px-6">
                                <div className="max-w-3xl mx-auto">
                                  {b.ctaBadge && (
                                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider rounded-full mb-3">
                                      {b.ctaBadge}
                                    </span>
                                  )}
                                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3">
                                    {b.ctaHeadline || b.title || 'Pronto para Transformar seus Resultados?'}
                                  </h2>
                                  <p className="text-xs sm:text-base text-blue-100 max-w-xl mx-auto mb-6">
                                    {b.ctaSubheadline || b.subtitle || 'Dê o próximo passo hoje mesmo e garanta sua vaga.'}
                                  </p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const formEl = document.getElementById('preview-capture-form');
                                      formEl?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className={`inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 font-extrabold text-xs sm:text-sm ${buttonShapeClass} shadow-xl hover:bg-slate-50 transition transform hover:-translate-y-0.5`}
                                  >
                                    <span>{b.ctaButtonText || 'Quero Garantir Minha Vaga Agora'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                  </button>
                                </div>
                              </section>
                            );
                          }

                          return null;
                        })
                    ) : (
                      <>
                        {/* Features & Benefits Section Fallback */}
                        {editingPage.features && editingPage.features.length > 0 && (
                          <section className="py-12 md:py-16 px-6 sm:px-10 bg-white border-b border-slate-200">
                            <div className="text-center max-w-2xl mx-auto mb-10">
                              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                Por que escolher
                              </span>
                              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
                                Tudo que você precisa para acelerar seu negócio
                              </h2>
                            </div>

                            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                              {editingPage.features.map((feat, idx) => (
                                <div key={feat.id || idx} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] max-w-sm flex-1 min-w-[240px] p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition flex flex-col justify-between">
                                  <div 
                                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center font-bold text-white mb-4 shadow-sm text-sm sm:text-base"
                                    style={{ backgroundColor: primaryColor }}
                                  >
                                    {idx + 1}
                                  </div>
                                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">{feat.title}</h3>
                                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{feat.description}</p>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}

                        {/* Social Proof & Testimonials Section Fallback */}
                        {editingPage.socialProof?.enabled && ((editingPage.socialProof.stats && editingPage.socialProof.stats.length > 0) || (editingPage.socialProof.testimonials && editingPage.socialProof.testimonials.length > 0)) && (
                          <section className="py-12 md:py-16 px-6 sm:px-10 bg-slate-900 text-white">
                            {editingPage.socialProof.stats && editingPage.socialProof.stats.length > 0 && (
                              <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-12 mb-12 text-center border-b border-slate-800 pb-10">
                                {editingPage.socialProof.stats.map((s, idx) => (
                                  <div key={idx} className="min-w-[120px]">
                                    <div className="text-3xl sm:text-4xl font-black text-amber-400 mb-1">{s.value}</div>
                                    <div className="text-xs sm:text-sm text-slate-400 font-medium">{s.label}</div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {editingPage.socialProof.testimonials && editingPage.socialProof.testimonials.length > 0 && (
                              <>
                                <div className="text-center max-w-xl mx-auto mb-8">
                                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight">O que dizem os nossos clientes</h2>
                                </div>
                                <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
                                  {editingPage.socialProof.testimonials.map((t, idx) => (
                                    <div key={t.id || idx} className="w-full sm:w-[calc(50%-12px)] max-w-md p-6 rounded-2xl bg-slate-800 border border-slate-700 shadow-md flex flex-col justify-between">
                                      <div className="flex items-center gap-1 text-amber-400 mb-3 text-sm">
                                        {'★'.repeat(t.rating || 5)}
                                      </div>
                                      <p className="text-xs sm:text-sm text-slate-300 italic mb-4">"{t.text}"</p>
                                      <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs sm:text-sm shadow-sm">
                                          {(t.name || 'C').charAt(0)}
                                        </div>
                                        <div>
                                          <div className="font-bold text-xs sm:text-sm text-white">{t.name}</div>
                                          <div className="text-[11px] text-slate-400">{t.role}</div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </section>
                        )}

                        {/* FAQ Section Fallback */}
                        {editingPage.faq?.enabled && editingPage.faq.items && editingPage.faq.items.length > 0 && (
                          <section className="py-12 md:py-16 px-6 sm:px-10 bg-white border-t border-slate-200">
                            <div className="max-w-4xl mx-auto">
                              <div className="text-center mb-10">
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                  Tire suas dúvidas
                                </span>
                                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
                                  Perguntas Frequentes
                                </h2>
                              </div>

                              <div className="space-y-3">
                                {editingPage.faq.items.map((item, idx) => {
                                  const isOpen = openFaqIndex === idx;
                                  return (
                                    <div key={item.id || idx} className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                                      <button 
                                        type="button" 
                                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                                        className="w-full p-4 sm:p-5 text-left font-semibold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-100/70 transition"
                                      >
                                        <span className="text-xs sm:text-sm">{item.question}</span>
                                        <span className="text-base sm:text-lg font-bold text-slate-400">
                                          {isOpen ? '−' : '+'}
                                        </span>
                                      </button>
                                      {isOpen && (
                                        <div className="p-4 sm:p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/50 bg-white">
                                          {item.answer}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </section>
                        )}
                      </>
                    )}

                    {/* Footer Preview */}
                    <footer className="bg-slate-900 text-slate-400 py-10 px-6 sm:px-10 border-t border-slate-800 text-xs">
                      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs shadow-md"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {(companyName || 'M').charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-white text-sm">{companyName}</span>
                        </div>
                        <div className="text-center md:text-right">
                          <p>&copy; {new Date().getFullYear()} {companyName}. {editingPage.footer?.copyrightText || 'Todos os direitos reservados.'}</p>
                          <p className="text-[11px] text-slate-500 mt-1">Desenvolvido com tecnologia de alta conversão MDTracker Growth Suite.</p>
                        </div>
                      </div>
                    </footer>

                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* ADD BLOCK SELECTION MODAL                                 */}
      {/* ========================================================= */}
      {isAddBlockModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Adicionar Novo Bloco de Conteúdo</h3>
                  <p className="text-xs text-slate-500">Escolha o formato visual para enriquecer sua landing page sem precisar de código</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddBlockModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  type: 'header_form' as const,
                  icon: LayoutTemplate,
                  color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                  title: 'Cabeçalho & Formulário (Split)',
                  tag: 'Alta Conversão ⭐',
                  description: 'Layout Power UP com proposta de valor, selos de confiança e formulário flutuante integrado.'
                },
                {
                  type: 'video' as const,
                  icon: Video,
                  color: 'text-rose-600 bg-rose-50 border-rose-200',
                  title: 'Vídeo em Destaque',
                  tag: 'Engajamento',
                  description: 'Incorpore vídeo do YouTube ou Vimeo em player responsivo de alta retenção.'
                },
                {
                  type: 'image' as const,
                  icon: ImageIcon,
                  color: 'text-blue-600 bg-blue-50 border-blue-200',
                  title: 'Imagem ou Banner',
                  tag: 'Visual',
                  description: 'Foto em alta resolução com galeria integrada do Unsplash ou URL personalizada.'
                },
                {
                  type: 'text' as const,
                  icon: TypeIcon,
                  color: 'text-purple-600 bg-purple-50 border-purple-200',
                  title: 'Texto & Storytelling',
                  tag: 'Copywriting',
                  description: 'Apresente sua história, explicação detalhada e proposta de valor com formatação.'
                },
                {
                  type: 'features' as const,
                  icon: CheckCircle2,
                  color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
                  title: 'Grade de Benefícios',
                  tag: 'Diferenciais',
                  description: 'Destaque as principais vantagens e diferenciais em cards numerados modernos.'
                },
                {
                  type: 'socialProof' as const,
                  icon: Star,
                  color: 'text-amber-600 bg-amber-50 border-amber-200',
                  title: 'Prova Social & Avaliações',
                  tag: 'Autoridade',
                  description: 'Estatísticas de impacto e depoimentos de clientes reais com 5 estrelas.'
                },
                {
                  type: 'pricing' as const,
                  icon: CreditCard,
                  color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
                  title: 'Tabela de Preços & Planos',
                  tag: 'Conversão Direta',
                  description: 'Comparativo de planos com destaque para a opção mais vendida e checklist.'
                },
                {
                  type: 'faq' as const,
                  icon: HelpCircle,
                  color: 'text-sky-600 bg-sky-50 border-sky-200',
                  title: 'Perguntas Frequentes (FAQ)',
                  tag: 'Quebra de Objeções',
                  description: 'Acordeão interativo para responder as dúvidas mais comuns dos seus clientes.'
                },
                {
                  type: 'countdown' as const,
                  icon: Clock,
                  color: 'text-orange-600 bg-orange-50 border-orange-200',
                  title: 'Timer de Escassez',
                  tag: 'Urgência',
                  description: 'Contador regressivo visual de dias, horas, minutos e segundos para acelerar decisões.'
                },
                {
                  type: 'cta_banner' as const,
                  icon: Flame,
                  color: 'text-red-600 bg-red-50 border-red-200',
                  title: 'Banner de Fechamento (CTA)',
                  tag: 'Ação Imediata',
                  description: 'Chamada chamativa com fundo gradiente e botão direto para o formulário.'
                }
              ].map(item => {
                const ItemIcon = item.icon;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => handleAddBlock(item.type)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-blue-500 hover:shadow-lg transition text-left flex flex-col justify-between group bg-white hover:bg-slate-50/50"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${item.color}`}>
                          <ItemIcon className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          {item.tag}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
                      <span>Adicionar à página</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition" />
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAddBlockModalOpen(false)}
                className="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold transition"
              >
                Fechar
              </button>
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
