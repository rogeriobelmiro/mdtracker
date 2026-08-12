export type FunnelStage = 'Novo Lead' | 'Contatado' | 'Em Negociação' | 'Convertido' | 'Perdido';

export type UserRole = 'admin' | 'manager' | 'attendant';

export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  plan: 'starter' | 'pro' | 'enterprise';
  active: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  avatarUrl?: string;
  active: boolean;
  createdAt: string;
}

export interface CustomTag {
  key: string;
  value: string;
}

export interface CampaignLink {
  id: string;
  companyId?: string;
  title: string;
  phone: string;
  message: string;
  slug: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string;
  utmTerm?: string;
  customTags?: Record<string, string>;
  captureLeadForm: boolean;
  metaPixelId?: string;
  googleAdsConversionId?: string;
  googleAdsLabel?: string;
  webhookUrl?: string;
  clicksCount: number;
  leadsCount: number;
  conversionsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeadLocation {
  city: string;
  state: string;
  country: string;
  ip: string;
}

export interface ConversionEventLog {
  id: string;
  type: 'meta_pixel' | 'meta_capi' | 'google_ads' | 'webhook';
  eventName: string;
  status: 'sucesso' | 'simulado' | 'falha';
  timestamp: string;
  details: string;
}

export interface Lead {
  id: string;
  companyId?: string;
  name: string;
  phone?: string;
  email?: string;
  location: LeadLocation;
  source: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent?: string;
  utmTerm?: string;
  linkId: string;
  linkTitle: string;
  stage: FunnelStage;
  value?: number;
  device: string;
  browser: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  conversionEvents: ConversionEventLog[];
}

export interface WebhookLog {
  id: string;
  companyId?: string;
  url: string;
  event: string;
  status: number;
  payload: Record<string, any>;
  timestamp: string;
  leadName?: string;
}

export interface StageEventConfig {
  stage: FunnelStage;
  metaEvent: string;
  googleLabel: string;
  enabled: boolean;
}

export interface AutoStageKeywordRule {
  stage: FunnelStage;
  keywords: string[];
  enabled: boolean;
}

export interface IntegrationSettings {
  companyId?: string;
  globalMetaPixelId: string;
  globalMetaToken: string;
  globalGoogleAdsId: string;
  globalGoogleAdsLabel: string;
  globalWebhookUrl: string;
  autoFireMetaOnLead: boolean;
  autoFireMetaOnConversion: boolean;
  autoFireGoogleOnConversion: boolean;
  autoFireWebhookOnLead: boolean;
  autoFireWebhookOnStageChange: boolean;
  stageEventMappings?: Record<FunnelStage, StageEventConfig>;
  autoStageKeywords?: AutoStageKeywordRule[];
}

export interface BroadcastCampaign {
  id: string;
  companyId?: string;
  name: string;
  targetStage: FunnelStage | 'Todos';
  targetSource: string | 'Todas';
  messageTemplate: string;
  trackingLinkId?: string;
  status: 'rascunho' | 'em_andamento' | 'concluido' | 'agendado';
  totalLeads: number;
  sentCount: number;
  deliveredCount: number;
  clickedCount: number;
  provider: 'simulado_web' | 'evolution_api' | 'z_api' | 'webhook';
  delaySeconds: number;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  leadId: string;
  sender: 'lead' | 'attendant' | 'system' | 'bot';
  text: string;
  timestamp: string;
  status: 'enviado' | 'entregue' | 'lido' | 'erro';
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'document';
}

export interface StatsSummary {
  totalClicks: number;
  totalLeads: number;
  totalConversions: number;
  totalRevenue: number;
  conversionRate: number;
  topCampaign: string;
  topSource: string;
}
