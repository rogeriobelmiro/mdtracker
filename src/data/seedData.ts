import { Company, User, CampaignLink, Lead, WebhookLog, IntegrationSettings } from '../types';

export const initialCompanies: Company[] = [
  {
    id: 'comp-alfa',
    name: 'Empresa Alfa Marketing',
    cnpj: '12.345.678/0001-90',
    plan: 'pro',
    active: true,
    createdAt: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'comp-beta',
    name: 'TechSolutions Beta Consultoria',
    cnpj: '98.765.432/0001-10',
    plan: 'enterprise',
    active: true,
    createdAt: '2026-03-20T00:00:00.000Z'
  }
];

export const initialUsers: User[] = [
  // Empresa Alfa Users
  {
    id: 'usr-1',
    companyId: 'comp-alfa',
    name: 'Ana Cláudia (Administrador)',
    email: 'admin@alfa.com',
    password: '123',
    role: 'admin',
    active: true,
    createdAt: '2026-01-15T10:00:00.000Z'
  },
  {
    id: 'usr-2',
    companyId: 'comp-alfa',
    name: 'Rodrigo Gerente (Gerente de Vendas)',
    email: 'gerente@alfa.com',
    password: '123',
    role: 'manager',
    active: true,
    createdAt: '2026-02-01T10:00:00.000Z'
  },
  {
    id: 'usr-3',
    companyId: 'comp-alfa',
    name: 'Lucas Atendente (Atendimento Comercial)',
    email: 'atendente@alfa.com',
    password: '123',
    role: 'attendant',
    active: true,
    createdAt: '2026-02-10T10:00:00.000Z'
  },

  // Empresa Beta Users
  {
    id: 'usr-4',
    companyId: 'comp-beta',
    name: 'Juliana Torres (Admin Beta)',
    email: 'admin@beta.com',
    password: '123',
    role: 'admin',
    active: true,
    createdAt: '2026-03-20T10:00:00.000Z'
  },
  {
    id: 'usr-5',
    companyId: 'comp-beta',
    name: 'Marcos Vendedor (Atendente Beta)',
    email: 'atendente@beta.com',
    password: '123',
    role: 'attendant',
    active: true,
    createdAt: '2026-04-05T10:00:00.000Z'
  }
];

export const initialSettings: IntegrationSettings = {
  companyId: 'comp-alfa',
  globalMetaPixelId: '1234567890987654',
  globalMetaToken: 'EAAG1234567890abcdef...',
  globalGoogleAdsId: 'AW-987654321',
  globalGoogleAdsLabel: 'ABc123xYz987',
  globalWebhookUrl: 'https://webhook.site/demo-rastreamento-whatsapp',
  autoFireMetaOnLead: true,
  autoFireMetaOnConversion: true,
  autoFireGoogleOnConversion: true,
  autoFireWebhookOnLead: true,
  autoFireWebhookOnStageChange: true,
  stageEventMappings: {
    'Novo Lead': {
      stage: 'Novo Lead',
      metaEvent: 'Lead',
      googleLabel: 'lead_conversion',
      enabled: true
    },
    'Contatado': {
      stage: 'Contatado',
      metaEvent: 'Contact',
      googleLabel: 'contact_conversion',
      enabled: true
    },
    'Em Negociação': {
      stage: 'Em Negociação',
      metaEvent: 'InitiateCheckout',
      googleLabel: 'checkout_conversion',
      enabled: true
    },
    'Convertido': {
      stage: 'Convertido',
      metaEvent: 'Purchase',
      googleLabel: 'purchase_conversion',
      enabled: true
    },
    'Perdido': {
      stage: 'Perdido',
      metaEvent: 'LeadLost',
      googleLabel: 'loss_conversion',
      enabled: false
    }
  },
  autoStageKeywords: [
    {
      stage: 'Contatado',
      keywords: ['oi', 'olá', 'boa tarde', 'bom dia', 'atendimento', 'dúvida'],
      enabled: true
    },
    {
      stage: 'Em Negociação',
      keywords: ['preço', 'valor', 'orçamento', 'proposta', 'reunião', 'agendar', 'desconto', 'quanto custa'],
      enabled: true
    },
    {
      stage: 'Convertido',
      keywords: ['pix', 'comprar', 'pagar', 'comprovante', 'fechado', 'paguei', 'transferência', 'cartão'],
      enabled: true
    },
    {
      stage: 'Perdido',
      keywords: ['não quero', 'cancelar', 'muito caro', 'sem interesse', 'desistir', 'não tenho interesse'],
      enabled: true
    }
  ]
};

export const initialLinks: CampaignLink[] = [
  // Alfa Links
  {
    id: 'link-1',
    companyId: 'comp-alfa',
    title: 'Campanha Meta Ads - Oferta VIP Black Friday',
    phone: '5511987654321',
    message: 'Olá! Vi a oferta no Instagram ({utm_campaign}) e quero garantir meu desconto VIP.',
    slug: 'vip-blackfriday',
    utmSource: 'meta_ads',
    utmMedium: 'cpc',
    utmCampaign: 'black_friday_2026',
    utmContent: 'carrossel_v2',
    utmTerm: 'desconto_exclusivo',
    captureLeadForm: true,
    clicksCount: 142,
    leadsCount: 89,
    conversionsCount: 28,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-10T11:00:00.000Z',
  },
  {
    id: 'link-2',
    companyId: 'comp-alfa',
    title: 'Google Ads - Pesquisa Fundo de Funil',
    phone: '5511987654321',
    message: 'Olá, encontrei seu site no Google! Gostaria de um orçamento personalizado para a minha empresa.',
    slug: 'orcamento-google',
    utmSource: 'google_ads',
    utmMedium: 'search',
    utmCampaign: 'fundo_funil_servicos',
    utmContent: 'anuncio_texto_01',
    utmTerm: 'sistema_rastreamento_whatsapp',
    captureLeadForm: false,
    clicksCount: 98,
    leadsCount: 61,
    conversionsCount: 19,
    createdAt: '2026-08-03T14:30:00.000Z',
    updatedAt: '2026-08-10T09:15:00.000Z',
  },

  // Beta Links
  {
    id: 'link-beta-1',
    companyId: 'comp-beta',
    title: 'TechSolutions - Consultoria de Software Enterprise',
    phone: '5521998877665',
    message: 'Olá TechSolutions! Quero agendar uma demonstração de software.',
    slug: 'consultoria-beta',
    utmSource: 'linkedin',
    utmMedium: 'cpc',
    utmCampaign: 'b2b_enterprise_2026',
    utmContent: 'video_cases',
    utmTerm: 'gestao_empresarial',
    captureLeadForm: true,
    clicksCount: 52,
    leadsCount: 18,
    conversionsCount: 5,
    createdAt: '2026-08-02T09:00:00.000Z',
    updatedAt: '2026-08-10T08:00:00.000Z',
  },
  {
    id: 'link-3',
    companyId: 'comp-alfa',
    title: 'Instagram Bio - Tráfego Orgânico',
    phone: '5511987654321',
    message: 'Olá! Cheguei pelo link da Bio do Instagram e quero tirar dúvidas sobre os planos.',
    slug: 'bio-instagram',
    utmSource: 'instagram',
    utmMedium: 'organico_bio',
    utmCampaign: 'geral_instabio',
    utmContent: 'linkinbio',
    captureLeadForm: false,
    clicksCount: 215,
    leadsCount: 112,
    conversionsCount: 14,
    createdAt: '2026-07-20T08:00:00.000Z',
    updatedAt: '2026-08-09T18:20:00.000Z',
  },
  {
    id: 'link-4',
    companyId: 'comp-alfa',
    title: 'Disparo WhatsApp - Reativação de Base',
    phone: '5511987654321',
    message: 'Oi! Recebi a mensagem de reativação da lista VIP e quero saber mais das novidades!',
    slug: 'reativacao-vip',
    utmSource: 'whatsapp',
    utmMedium: 'direct_msg',
    utmCampaign: 'reativacao_agosto_2026',
    utmContent: 'cupom_20off',
    captureLeadForm: false,
    clicksCount: 76,
    leadsCount: 54,
    conversionsCount: 22,
    createdAt: '2026-08-05T11:00:00.000Z',
    updatedAt: '2026-08-10T10:45:00.000Z',
  }
];

export const initialLeads: Lead[] = [
  {
    id: 'lead-101',
    companyId: 'comp-alfa',
    name: 'Carlos Eduardo Silva',
    phone: '5511991234567',
    email: 'carlos.silva@empresa.com.br',
    location: {
      city: 'São Paulo',
      state: 'SP',
      country: 'Brasil',
      ip: '177.138.45.12'
    },
    source: 'Meta Ads',
    utmSource: 'meta_ads',
    utmMedium: 'cpc',
    utmCampaign: 'black_friday_2026',
    utmContent: 'carrossel_v2',
    utmTerm: 'desconto_exclusivo',
    linkId: 'link-1',
    linkTitle: 'Campanha Meta Ads - Oferta VIP Black Friday',
    stage: 'Convertido',
    value: 1490.00,
    device: 'Mobile (iPhone 14 Pro)',
    browser: 'Safari 17.4',
    createdAt: '2026-08-10T09:12:00.000Z',
    updatedAt: '2026-08-10T11:20:00.000Z',
    notes: 'Cliente comprou o plano anual. Solicitou nota fiscal emitida no CNPJ.',
    conversionEvents: [
      {
        id: 'evt-1',
        type: 'meta_pixel',
        eventName: 'Lead',
        status: 'sucesso',
        timestamp: '2026-08-10T09:12:05.000Z',
        details: 'Pixel Meta disparado com sucesso no clique do link'
      },
      {
        id: 'evt-2',
        type: 'meta_capi',
        eventName: 'Purchase',
        status: 'sucesso',
        timestamp: '2026-08-10T11:20:00.000Z',
        details: 'Conversão de R$ 1.490,00 enviada via Conversion API'
      },
      {
        id: 'evt-3',
        type: 'webhook',
        eventName: 'lead_converted',
        status: 'sucesso',
        timestamp: '2026-08-10T11:20:01.000Z',
        details: 'Webhook enviado para CRM externo (HTTP 200 OK)'
      }
    ]
  },
  {
    id: 'lead-102',
    name: 'Mariana Fontes',
    phone: '5521988776655',
    email: 'mariana.fontes@gmail.com',
    location: {
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil',
      ip: '201.86.112.90'
    },
    source: 'Google Ads',
    utmSource: 'google_ads',
    utmMedium: 'search',
    utmCampaign: 'fundo_funil_servicos',
    utmContent: 'anuncio_texto_01',
    utmTerm: 'sistema_rastreamento_whatsapp',
    linkId: 'link-2',
    linkTitle: 'Google Ads - Pesquisa Fundo de Funil',
    stage: 'Em Negociação',
    value: 890.00,
    device: 'Desktop (Windows 11)',
    browser: 'Chrome 127',
    createdAt: '2026-08-10T08:45:00.000Z',
    updatedAt: '2026-08-10T10:30:00.000Z',
    notes: 'Apresentação enviada por WhatsApp. Aguardando aprovação da diretoria.',
    conversionEvents: [
      {
        id: 'evt-4',
        type: 'google_ads',
        eventName: 'Conversion_Lead',
        status: 'sucesso',
        timestamp: '2026-08-10T08:45:02.000Z',
        details: 'Google Ads conversion label AW-987654321 disparado'
      }
    ]
  },
  {
    id: 'lead-103',
    name: 'Rodrigo Alcantara',
    phone: '5531976543210',
    email: 'rodrigo.mkt@agenciaprime.com',
    location: {
      city: 'Belo Horizonte',
      state: 'MG',
      country: 'Brasil',
      ip: '189.23.14.77'
    },
    source: 'Instagram',
    utmSource: 'instagram',
    utmMedium: 'organico_bio',
    utmCampaign: 'geral_instabio',
    utmContent: 'linkinbio',
    linkId: 'link-3',
    linkTitle: 'Instagram Bio - Tráfego Orgânico',
    stage: 'Contatado',
    value: 490.00,
    device: 'Mobile (Samsung Galaxy S24)',
    browser: 'Chrome Mobile',
    createdAt: '2026-08-10T07:10:00.000Z',
    updatedAt: '2026-08-10T08:00:00.000Z',
    notes: 'Agência com 15 contas de clientes querendo testar o sistema.',
    conversionEvents: [
      {
        id: 'evt-5',
        type: 'webhook',
        eventName: 'lead_created',
        status: 'sucesso',
        timestamp: '2026-08-10T07:10:01.000Z',
        details: 'Webhook de novo lead disparado'
      }
    ]
  },
  {
    id: 'lead-104',
    name: 'Patricia Lima',
    phone: '5541998811223',
    email: 'patricia@consultoria.com.br',
    location: {
      city: 'Curitiba',
      state: 'PR',
      country: 'Brasil',
      ip: '177.92.203.11'
    },
    source: 'Meta Ads',
    utmSource: 'meta_ads',
    utmMedium: 'cpc',
    utmCampaign: 'black_friday_2026',
    utmContent: 'carrossel_v2',
    utmTerm: 'desconto_exclusivo',
    linkId: 'link-1',
    linkTitle: 'Campanha Meta Ads - Oferta VIP Black Friday',
    stage: 'Novo Lead',
    value: 0,
    device: 'Mobile (iPhone 13)',
    browser: 'Instagram In-App Browser',
    createdAt: '2026-08-10T10:05:00.000Z',
    updatedAt: '2026-08-10T10:05:00.000Z',
    notes: 'Clicou no link e preencheu nome no formulário de captura.',
    conversionEvents: [
      {
        id: 'evt-6',
        type: 'meta_pixel',
        eventName: 'Lead',
        status: 'sucesso',
        timestamp: '2026-08-10T10:05:01.000Z',
        details: 'Meta Pixel Lead disparado'
      }
    ]
  },
  {
    id: 'lead-105',
    name: 'Gabriel Portugal Costa',
    phone: '351912345678',
    email: 'gabriel.costa@tech.pt',
    location: {
      city: 'Lisboa',
      state: 'Lisboa',
      country: 'Portugal',
      ip: '193.136.2.100'
    },
    source: 'WhatsApp',
    utmSource: 'whatsapp',
    utmMedium: 'direct_msg',
    utmCampaign: 'reativacao_agosto_2026',
    utmContent: 'cupom_20off',
    linkId: 'link-4',
    linkTitle: 'Disparo WhatsApp - Reativação de Base',
    stage: 'Convertido',
    value: 2190.00,
    device: 'Desktop (Macintosh)',
    browser: 'Safari 17.5',
    createdAt: '2026-08-09T16:20:00.000Z',
    updatedAt: '2026-08-10T09:00:00.000Z',
    notes: 'Cliente internacional comprou licença corporativa via Cartão de Crédito.',
    conversionEvents: [
      {
        id: 'evt-7',
        type: 'meta_capi',
        eventName: 'Purchase',
        status: 'sucesso',
        timestamp: '2026-08-10T09:00:01.000Z',
        details: 'Purchase CAPI event sent successfully'
      }
    ]
  },
  {
    id: 'lead-106',
    companyId: 'comp-alfa',
    name: 'Juliana Mendes',
    phone: '5581987112233',
    email: 'juliana.mendes@loja.com.br',
    location: {
      city: 'Recife',
      state: 'PE',
      country: 'Brasil',
      ip: '179.108.64.12'
    },
    source: 'Google Ads',
    utmSource: 'google_ads',
    utmMedium: 'search',
    utmCampaign: 'fundo_funil_servicos',
    linkId: 'link-2',
    linkTitle: 'Google Ads - Pesquisa Fundo de Funil',
    stage: 'Perdido',
    value: 0,
    device: 'Mobile (Android)',
    browser: 'Chrome Mobile',
    createdAt: '2026-08-08T12:00:00.000Z',
    updatedAt: '2026-08-09T15:00:00.000Z',
    notes: 'Procurava um software grátis e sem suporte.',
    conversionEvents: []
  },

  // Beta Leads
  {
    id: 'lead-beta-201',
    companyId: 'comp-beta',
    name: 'Roberto Vianna (TechSolutions Beta Client)',
    phone: '5521998877665',
    email: 'roberto@multinacional.com',
    location: {
      city: 'Rio de Janeiro',
      state: 'RJ',
      country: 'Brasil',
      ip: '200.150.10.5'
    },
    source: 'LinkedIn',
    utmSource: 'linkedin',
    utmMedium: 'cpc',
    utmCampaign: 'b2b_enterprise_2026',
    utmContent: 'video_cases',
    utmTerm: 'gestao_empresarial',
    linkId: 'link-beta-1',
    linkTitle: 'TechSolutions - Consultoria de Software Enterprise',
    stage: 'Em Negociação',
    value: 12500.00,
    device: 'Desktop (Windows 11)',
    browser: 'Edge 125',
    createdAt: '2026-08-10T09:00:00.000Z',
    updatedAt: '2026-08-10T10:00:00.000Z',
    notes: 'Reunião de escopo marcada para quinta-feira com CTO.',
    conversionEvents: []
  }
];

export const initialWebhookLogs: WebhookLog[] = [
  {
    id: 'log-1',
    url: 'https://webhook.site/demo-rastreamento-whatsapp',
    event: 'lead_created',
    status: 200,
    payload: {
      event: 'lead_created',
      lead: {
        id: 'lead-104',
        name: 'Patricia Lima',
        source: 'meta_ads',
        campaign: 'black_friday_2026'
      }
    },
    timestamp: '2026-08-10T10:05:01.000Z',
    leadName: 'Patricia Lima'
  },
  {
    id: 'log-2',
    url: 'https://webhook.site/demo-rastreamento-whatsapp',
    event: 'lead_stage_updated',
    status: 200,
    payload: {
      event: 'lead_stage_updated',
      lead_id: 'lead-101',
      old_stage: 'Em Negociação',
      new_stage: 'Convertido',
      value: 1490.00
    },
    timestamp: '2026-08-10T11:20:01.000Z',
    leadName: 'Carlos Eduardo Silva'
  }
];
