export type FunnelStage = 'Novo Lead' | 'Contatado' | 'Em Negociação' | 'Convertido' | 'Perdido';

export const FUNNEL_STAGES: FunnelStage[] = ['Novo Lead', 'Contatado', 'Em Negociação', 'Convertido', 'Perdido'];

export type UserRole = 'admin' | 'manager' | 'attendant';
export type TeamMemberStatus = 'online' | 'busy' | 'in_call' | 'break' | 'offline';


export interface Company {
  id: string;
  name: string;
  cnpj?: string;
  plan: 'starter' | 'pro' | 'enterprise';
  active: boolean;
  logoUrl?: string;
  responsibleName?: string;
  phone?: string;
  address?: string;
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
  phone?: string;
  extension?: string;
  isExternal?: boolean;
  status?: TeamMemberStatus;
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
  metaEventName?: string;
  googleAdsConversionId?: string;
  googleAdsLabel?: string;
  webhookUrl?: string;
  clicksCount: number;
  leadsCount: number;
  conversionsCount: number;
  assignedTeamId?: string;
  phoneNumbers?: string[];
  rotationMode?: 'single' | 'round_robin' | 'team_rotation';
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
  type: 'meta_pixel' | 'meta_capi' | 'google_ads' | 'webhook' | 'organic' | 'landing_page' | 'popup' | 'popup_capture' | 'lead_cadastrado' | 'chatbot_flow';
  eventName: string;
  status: 'sucesso' | 'simulado' | 'falha';
  timestamp: string;
  details: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
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
  botActive?: boolean;
  score?: number;
  qualificationLevel?: 'Lead' | 'MQL' | 'SQL';
  fitGrade?: 'A' | 'B' | 'C' | 'D';
  scoreBreakdown?: Array<{ reason: string; points: number }>;
  assignedUserId?: string;
  assignedUserName?: string;
  assignedTeamId?: string;
  assignedTeamName?: string;
  assignedAt?: string;
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

export interface Product {
  id: string;
  companyId: string;
  name: string;
  type: 'produto' | 'servico';
  price: number;
  recurrenceDays: number | null; // null if one-time
  createdAt: string;
}

export interface LeadPurchase {
  id: string;
  companyId: string;
  leadId: string;
  productId: string;
  amount: number; // Value paid
  purchasedAt: string;
}

export interface IntegrationSettings {
  companyId?: string;
  globalMetaPixelId: string;
  globalMetaToken: string;
  globalGoogleAdsId: string;
  globalGoogleAdsLabel: string;
  globalWebhookUrl: string;
  evolutionInstance?: string;
  evolutionApiUrl?: string;
  evolutionApiKey?: string;
  autoFireMetaOnLead: boolean;
  autoFireMetaOnConversion: boolean;
  autoFireGoogleOnConversion: boolean;
  autoFireWebhookOnLead: boolean;
  autoFireWebhookOnStageChange: boolean;
  metaLeadEventName?: string;
  stageEventMappings?: Record<FunnelStage, StageEventConfig>;
  autoStageKeywords?: AutoStageKeywordRule[];
  chatbotConfig?: ChatbotConfig;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpFromName?: string;
  smtpFromEmail?: string;
  smtpSecure?: boolean;
}

export type ChatbotMode = 'prompt' | 'visual_flow';

export interface ChatbotFlowNodeOption {
  id: string;
  label: string;
  color?: string; // green, blue, cyan, orange, red, purple, gray
  targetNodeId?: string;
  targetNodeIds?: string[];
}

export type FlowTriggerType = 'instant_reply' | 'proactive_time' | 'keyword_match';
export type FlowProactiveTimingMode = 'immediate' | 'delay';

export interface FlowTriggerConfig {
  type: FlowTriggerType;
  previousProjectId?: string; // ID do projeto anterior de origem (ex: Venda de Produto)
  previousProjectName?: string; // Nome do projeto anterior
  previousFlowId?: string; // ID do fluxo anterior
  previousFlowName?: string; // Nome do fluxo anterior
  timingMode?: FlowProactiveTimingMode; // 'immediate' (logo após finalizar o outro) ou 'delay' (após X tempo)
  delayAmount?: number;
  delayUnit?: 'seconds' | 'minutes' | 'hours' | 'days';
  proactiveCondition?: 'after_lead_created' | 'after_last_message' | 'after_previous_flow' | 'after_previous_project' | 'on_stage_change';
  keywords?: string[];
  targetStage?: string;
}

export interface ChatbotFlowNodeConfig {
  crmActionType?: 'notify_team' | 'move_stage' | 'create_task' | 'add_tag';
  crmActionValue?: string;
  delayValue?: number;
  delayUnit?: 'seconds' | 'minutes' | 'hours' | 'days';
  messageType?: 'suggestion' | 'auto_send';
  variableName?: string;
  abSplitPercentage?: number;
  promptInstructions?: string;
  linkUrl?: string;
  linkText?: string;
  triggerConfig?: FlowTriggerConfig;
}

export interface ChatbotFlowNode {
  id: string;
  type: 'start' | 'message' | 'condition' | 'crm_action' | 'wait' | 'ai_reply' | 'ask_input' | 'appointment' | 'ab_split' | 'end';
  title: string;
  badge?: string;
  content?: string;
  x: number;
  y: number;
  options?: ChatbotFlowNodeOption[];
  targetNodeId?: string;
  targetNodeIds?: string[];
  config?: ChatbotFlowNodeConfig;
}

export interface ChatbotFlowConnection {
  id: string;
  sourceNodeId: string;
  sourceOptionId?: string;
  targetNodeId: string;
  color?: string;
}

export interface ChatbotProject {
  id: string;
  name: string;
  description?: string;
  color?: 'blue' | 'emerald' | 'purple' | 'amber' | 'rose' | 'cyan';
  active: boolean;
  flows: ChatbotFlow[];
  createdAt: string;
  updatedAt?: string;
}

export interface ChatbotFlow {
  id: string;
  projectId?: string;
  name: string;
  subtitle?: string;
  active: boolean;
  nodes: ChatbotFlowNode[];
  connections: ChatbotFlowConnection[];
  updatedAt?: string;
}

export interface ChatbotConfig {
  mode?: ChatbotMode;
  enabled: boolean;
  botName: string;
  personaPrompt: string;
  autoReplyDelaySeconds: number;
  enableHumanHandover: boolean;
  handoverKeywords: string[];
  includeProductsKnowledge: boolean;
  directEnabled?: boolean;
  directWelcomeMessage?: string;
  flows?: ChatbotFlow[];
  projects?: ChatbotProject[];
  activeProjectId?: string;
  activeFlowId?: string;
}

export type BroadcastChannel = 'email' | 'sms' | 'whatsapp' | 'multichannel';

export interface BroadcastRecipient {
  leadId: string;
  name: string;
  email?: string;
  phone?: string;
  channel: BroadcastChannel;
  stage?: string;
  status: 'pendente' | 'enviado' | 'entregue' | 'aberto' | 'clicou' | 'falha';
  sentAt?: string;
  openedAt?: string;
  clickedAt?: string;
  device?: string;
}

export interface BroadcastCampaign {
  id: string;
  companyId?: string;
  name: string;
  channel: BroadcastChannel;
  channels?: BroadcastChannel[];
  targetStage: FunnelStage | 'Todos';
  targetSource: string | 'Todas';
  targetTag?: string | 'Todas';
  // WhatsApp specific
  messageTemplate?: string;
  whatsappScheduledAt?: string;
  // E-mail specific
  emailSubject?: string;
  emailPreheader?: string;
  emailSenderName?: string;
  emailSenderEmail?: string;
  emailBodyHtml?: string;
  emailScheduledAt?: string;
  // SMS specific
  smsText?: string;
  smsScheduledAt?: string;
  trackingLinkId?: string;
  ctaUrl?: string;
  ctaText?: string;
  status: 'rascunho' | 'em_andamento' | 'concluido' | 'agendado';
  totalLeads: number;
  sentCount: number;
  deliveredCount: number;
  openedCount?: number;
  clickedCount: number;
  provider: string; // 'resend' | 'sendgrid' | 'z_api' | 'twilio' | 'simulado_web' | 'evolution_api'
  delaySeconds: number;
  scheduledAt?: string;
  recipients?: BroadcastRecipient[];
  createdAt: string;
  updatedAt?: string;
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

export type PopupTriggerType = 'exit_intent' | 'scroll' | 'timed_delay' | 'floating_button';
export type PopupActionType = 'whatsapp_redirect' | 'thank_you_message' | 'custom_url';

export interface PopupFieldConfig {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'tel' | 'email';
  placeholder: string;
  required: boolean;
  enabled: boolean;
}

export interface SmartPopup {
  id: string;
  companyId: string;
  name: string;
  active: boolean;
  triggerType: PopupTriggerType;
  triggerValue: number; // e.g. 50 (%) or 5 (seconds)
  showOncePerUser: boolean;
  title: string;
  subtitle: string;
  badgeText?: string;
  ctaText: string;
  fields: PopupFieldConfig[];
  themeColor: string;
  backgroundColor: 'light' | 'dark' | 'emerald' | 'gradient' | 'slate';
  buttonColor: string;
  buttonTextColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  actionType: PopupActionType;
  whatsappPhone?: string;
  whatsappMessage?: string;
  redirectUrl?: string;
  successMessage?: string;
  targetStage: FunnelStage;
  tags?: string[];
  linkId?: string;
  impressionsCount: number;
  leadsCount: number;
  createdAt: string;
  updatedAt: string;
  // Disparos e Automação de Marketing
  workflowId?: string;
  autoTriggerWhatsApp?: boolean;
  whatsappTemplate?: string;
  autoTriggerEmail?: boolean;
  emailSubject?: string;
  emailBody?: string;
}

export type AICopyType = 'headlines' | 'ctas' | 'email' | 'whatsapp' | 'smart_lists';
export type AICopyTone = 'persuasive' | 'professional' | 'urgent' | 'friendly' | 'bold';

export interface AIGenerateRequest {
  companyId?: string;
  type: AICopyType;
  productName: string;
  targetAudience?: string;
  tone?: AICopyTone;
  extraContext?: string;
  leadContext?: {
    name?: string;
    stage?: string;
    phone?: string;
    value?: number;
  };
  apiKey?: string;
}

export interface AIGeneratedContent {
  id: string;
  type: AICopyType;
  title: string;
  items?: string[];
  emailSubject?: string;
  emailPreview?: string;
  emailBody?: string;
  fullText?: string;
  strategyTips?: string[];
  createdAt: string;
}

// Marketing Automation & Workflows (RD Station style)
export type WorkflowTriggerType = 
  | 'lead_created' 
  | 'stage_changed' 
  | 'product_purchased' 
  | 'popup_submitted' 
  | 'tag_added'
  | 'form_submitted';

export type WorkflowActionType = 
  | 'wait_delay' 
  | 'send_whatsapp' 
  | 'send_email' 
  | 'send_sms'
  | 'change_stage' 
  | 'add_tag' 
  | 'notify_user' 
  | 'webhook';

export interface WorkflowStep {
  id: string;
  type: WorkflowActionType;
  title: string;
  delayMinutes?: number; // Para wait_delay (ex: 5 min, 120 min = 2h, 1440 min = 1 dia)
  messageTemplate?: string; // Para send_whatsapp
  emailSubject?: string; // Para send_email
  emailBody?: string;
  smsText?: string; // Para send_sms
  targetStage?: FunnelStage; // Para change_stage
  tag?: string; // Para add_tag
  notifyMessage?: string; // Para notify_user
  webhookUrl?: string; // Para webhook
}

export interface MarketingWorkflow {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  active: boolean;
  triggerType: WorkflowTriggerType;
  triggerConfig?: {
    stage?: FunnelStage;
    productId?: string;
    popupId?: string;
    tag?: string;
    landingPageId?: string;
    formSource?: 'any' | 'landing_page' | 'embed_external' | 'elementor_wordpress';
  };
  steps: WorkflowStep[];
  enrolledCount: number;
  executedCount: number;
  conversionsCount: number;
  hasEventDeadline?: boolean;
  eventDate?: string;
  timeDistributionMode?: 'proportional' | 'compact' | 'fixed';
  minStepIntervalMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledWorkflowAction {
  id: string;
  companyId: string;
  workflowId: string;
  workflowName?: string;
  leadId: string;
  leadName?: string;
  leadEmail?: string;
  leadPhone?: string;
  stepId: string;
  stepIndex: number;
  actionType: WorkflowActionType;
  scheduledFor: string;
  status: 'pending' | 'executed' | 'cancelled' | 'expired';
  payload: any;
  createdAt: string;
  executedAt?: string;
  errorMessage?: string;
}

export interface WorkflowExecutionLog {
  id: string;
  workflowId: string;
  workflowName: string;
  leadId: string;
  leadName: string;
  leadPhone?: string;
  actionType: WorkflowActionType;
  status: 'success' | 'failed' | 'scheduled';
  detail: string;
  executedAt: string;
}

// Landing Pages (RD Station style)
export type LandingPageCategory = 'lead_magnet' | 'product_launch' | 'service_consulting' | 'event_webinar';
export type LandingPageStatus = 'published' | 'draft' | 'archived';
export type LandingPageActionType = 'redirect_whatsapp' | 'custom_url' | 'thank_you_message' | 'thank_you_page';

export type ThankYouActionType = 'whatsapp_group' | 'download_pdf' | 'survey' | 'custom_url';

export interface ThankYouActionButton {
  id: string;
  type: ThankYouActionType;
  title: string;
  description?: string;
  url: string;
  buttonText: string;
  icon?: 'whatsapp' | 'download' | 'survey' | 'external';
  color?: string;
  badge?: string;
  surveyId?: string; // Links directly to a MDTracker internal survey
}

export interface LandingPageThankYouPage {
  enabled: boolean;
  title: string;
  subtitle: string;
  badge?: string;
  showCheckmark: boolean;
  messageCardTitle?: string;
  messageCardText?: string;
  videoUrl?: string;
  buttons: ThankYouActionButton[];
}

export interface LandingPageFormField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'select' | 'textarea';
  placeholder: string;
  required: boolean;
  options?: string[];
}

export interface LandingPageFeature {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

export interface LandingPageTestimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  avatarUrl?: string;
  rating: number;
}

export interface LandingPageFAQItem {
  id: string;
  question: string;
  answer: string;
}

export type LandingPageFontFamily = 
  | 'Inter' 
  | 'Poppins' 
  | 'Montserrat' 
  | 'Roboto' 
  | 'Playfair Display' 
  | 'Plus Jakarta Sans' 
  | 'Outfit' 
  | 'Space Grotesk';

export interface LandingPageTheme {
  primaryColor: string;
  accentColor: string;
  backgroundColor: 'white' | 'slate' | 'dark' | 'gradient';
  fontFamily: LandingPageFontFamily;
  titleSize?: 'normal' | 'large' | 'huge';
  buttonStyle: 'rounded-xl' | 'rounded-full' | 'rounded-md' | 'square';
}

export interface LandingPageHero {
  enabled?: boolean;
  badge?: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  imageUrl?: string;
  videoUrl?: string;
  mediaType?: 'image' | 'video' | 'form' | 'none';
  layout?: 'split_form' | 'centered' | 'split_media';
  formPosition?: 'right' | 'left';
  navbarEnabled?: boolean;
  navbarCtaText?: string;
  trustBadges?: string[];
  formBadge?: string;
}

export type LandingPageBlockType = 
  | 'hero' 
  | 'header_form'
  | 'video' 
  | 'image' 
  | 'text' 
  | 'features' 
  | 'socialProof' 
  | 'pricing' 
  | 'faq' 
  | 'countdown' 
  | 'cta_banner';

export interface LandingPagePricingPlan {
  id: string;
  name: string;
  price: string;
  period?: string;
  description?: string;
  features: string[];
  highlighted?: boolean;
  buttonText: string;
  buttonUrl?: string;
  badge?: string;
}

export interface LandingPageCustomBlock {
  id: string;
  type: LandingPageBlockType;
  title?: string;
  subtitle?: string;
  enabled: boolean;
  backgroundColor?: 'white' | 'slate' | 'dark' | 'primary';
  
  // Header with Form block (Power UP style)
  headerNavbarEnabled?: boolean;
  headerLogoText?: string;
  headerNavCtaText?: string;
  headerBadge?: string;
  headerHeadline?: string;
  headerSubheadline?: string;
  headerPrimaryCtaText?: string;
  headerPrimaryCtaUrl?: string;
  headerTrustBadges?: string[];
  formCardBadge?: string;
  formCardTitle?: string;
  formCardSubtitle?: string;
  formCardButtonText?: string;
  formPosition?: 'right' | 'left' | 'bottom';
  formLgpdNotice?: string;

  // Video block
  videoUrl?: string;
  videoCaption?: string;
  videoAspectRatio?: '16/9' | '4/3' | '1/1';

  // Image block
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  imageWidth?: 'contained' | 'full' | 'small' | 'medium';
  imageAlignment?: 'center' | 'left' | 'right';

  // Text / Storytelling block
  textContent?: string;
  textAlignment?: 'left' | 'center' | 'right';

  // Features block
  features?: LandingPageFeature[];

  // Social Proof block
  testimonials?: LandingPageTestimonial[];
  stats?: Array<{ label: string; value: string }>;

  // Pricing block
  pricingPlans?: LandingPagePricingPlan[];

  // FAQ block
  faqItems?: LandingPageFAQItem[];

  // Countdown block
  countdownEndDate?: string;
  countdownTitle?: string;
  countdownRedirectOnExpire?: boolean;
  countdownRedirectType?: 'page' | 'custom_url';
  countdownRedirectPageSlug?: string;
  countdownRedirectUrl?: string;
  countdownExpiredMessage?: string;

  // CTA Banner block
  ctaHeadline?: string;
  ctaSubheadline?: string;
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  ctaBadge?: string;
}

export interface LandingPageForm {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonColor?: string;
  fields: LandingPageFormField[];
  actionType: LandingPageActionType;
  whatsappPhone?: string;
  whatsappMessage?: string;
  redirectUrl?: string;
  successMessage?: string;
  targetStage: FunnelStage;
  tags: string[];
  linkId?: string;
  // Automação & Workflows de Nutrição
  workflowId?: string; // Workflow de nutrição associado
  additionalWorkflowIds?: string[];
  autoTriggerWhatsApp?: boolean; // Disparo automático de WhatsApp
  whatsappTemplate?: string; // Template da mensagem de WhatsApp
  autoTriggerEmail?: boolean; // Disparo automático de E-mail
  emailSubject?: string; // Assunto do e-mail
  emailBody?: string; // Corpo do e-mail
}

export interface LandingPageSocialProof {
  enabled: boolean;
  stats?: Array<{ label: string; value: string }>;
  testimonials?: LandingPageTestimonial[];
}

export interface LandingPageCountdown {
  enabled: boolean;
  title?: string;
  endDate?: string;
  redirectOnExpire?: boolean;
  redirectType?: 'page' | 'custom_url';
  redirectPageSlug?: string;
  redirectUrl?: string;
  expiredMessage?: string;
  serverRedirect?: boolean;
}

export interface LandingPageFAQ {
  enabled: boolean;
  items?: LandingPageFAQItem[];
}

export interface LandingPageFooter {
  companyName?: string;
  copyrightText?: string;
  privacyPolicyUrl?: string;
  termsUrl?: string;
}

export interface LandingPage {
  id: string;
  companyId: string;
  title: string;
  slug: string;
  description: string;
  status: LandingPageStatus;
  category: LandingPageCategory;
  theme: LandingPageTheme;
  hero: LandingPageHero;
  features: LandingPageFeature[];
  socialProof: LandingPageSocialProof;
  countdown: LandingPageCountdown;
  form: LandingPageForm;
  faq: LandingPageFAQ;
  footer: LandingPageFooter;
  thankYouPage?: LandingPageThankYouPage;
  customDomain?: string;
  blocks?: LandingPageCustomBlock[];
  viewsCount: number;
  conversionsCount: number;
  createdAt: string;
  updatedAt: string;
}

// ==============================================================================
// PASSO 4: TELEFONIA VIRTUAL & DISCADOR WEBRTC (VoIP no CRM)
// ==============================================================================

export type CallOutcome = 
  | 'atendeu_positivo' 
  | 'atendeu_objecao' 
  | 'retornar_depois' 
  | 'nao_atendeu' 
  | 'ocupado' 
  | 'caixa_postal' 
  | 'invalido';

export interface LeadCall {
  id: string;
  companyId: string;
  leadId: string;
  leadName: string;
  leadPhone: string;
  userId?: string;
  userName: string;
  durationSeconds: number;
  outcome: CallOutcome;
  notes?: string;
  recordingUrl?: string;
  transcriptSummary?: string;
  sentiment?: 'positivo' | 'neutro' | 'negativo';
  nextSteps?: string;
  callerId?: string;
  teamId?: string;
  teamName?: string;
  createdAt: string;
}

export interface VirtualPhoneSettings {
  provider: 'webrtc_native' | 'twilio' | 'zenvia' | 'totalvoice';
  callerIdNumber: string;
  callerIdName: string;
  recordCalls: boolean;
  autoTranscribeAI: boolean;
  agentExtension: string;
}

// ==============================================================================
// PASSO 5: LISTAS INTELIGENTES & LEAD SCORING COM IA (ESTILO RD STATION)
// ==============================================================================

export type QualificationLevel = 'Lead' | 'MQL' | 'SQL';
export type FitGrade = 'A' | 'B' | 'C' | 'D';

export interface SmartListCondition {
  field: 'score' | 'qualificationLevel' | 'stage' | 'utmSource' | 'hasPhone' | 'hasEmail' | 'minLtv' | 'hasCalls';
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'is_true';
  value: string | number | boolean;
}

export interface SmartList {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  color?: string;
  conditions: SmartListCondition[];
  matchType: 'all' | 'any'; // AND vs OR
  leadsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeadScoringConfig {
  mqlThreshold: number; // default 40
  sqlThreshold: number; // default 70
  pointsPerAction: {
    popupConversion: number; // 15
    landingPageConversion: number; // 20
    emailOpen: number; // 10
    smsClick: number; // 15
    chatbotInteraction: number; // 25
    callAnswered: number; // 30
    productPurchase: number; // 50
    inactivityDecay: number; // -15
  };
}

// ==============================================================================
// INSTAGRAM AUTO-DM & COMMENT GROWTH TOOL (MANYCHAT STYLE)
// ==============================================================================

export interface InstagramCommentAutomation {
  id: string;
  companyId: string;
  name: string;
  status: 'active' | 'paused';
  postType: 'any_post' | 'specific_post';
  postUrl?: string;
  postId?: string;
  postThumbnail?: string;
  postCaptionSnippet?: string;
  triggerType: 'keywords' | 'all_comments';
  keywords: string[];
  excludedKeywords?: string[];
  autoLikeComment: boolean;
  publicReplies: string[];
  directMessage: string;
  ctaButton?: {
    text: string;
    url: string;
  };
  createLeadInCrm: boolean;
  followGateEnabled?: boolean;
  followGateConfig?: {
    askFollowMessage: string;
    notFollowingMessage: string;
    verifyFailMessage?: string;
    confirmFollowMessage: string;
    strictMetaCheck?: boolean;
  };
  relatedPostPromotion?: {
    enabled: boolean;
    message: string;
    postUrl: string;
    postTitle?: string;
  };
  stats: {
    commentsProcessed: number;
    dmsSent: number;
    leadsCaptured: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InstagramCommentLog {
  id: string;
  companyId: string;
  ruleId: string;
  ruleName: string;
  instagramUsername: string;
  commentText: string;
  postId?: string;
  postSnippet?: string;
  publicReplyGiven: string;
  dmSentText: string;
  leadId?: string;
  status: 'delivered' | 'failed' | 'ignored_keyword';
  errorMessage?: string;
  timestamp: string;
}

export interface InstagramSimulateResult {
  success: boolean;
  matched: boolean;
  reason?: string;
  ruleName?: string;
  instagramUsername: string;
  commentText: string;
  publicReplyGiven?: string;
  autoLiked?: boolean;
  dmSentText?: string;
  ctaButton?: { text: string; url: string };
  followGateTriggered?: boolean;
  followGateStage?: 'ask_follow' | 'not_following' | 'verify_failed' | 'verified_unlocked';
  isFollower?: boolean;
  relatedPostSent?: {
    message: string;
    postUrl: string;
    postTitle?: string;
  };
  lead?: Partial<Lead>;
  log?: InstagramCommentLog;
}

// ==============================================================================
// PASSO 6: MULTI-ATENDIMENTO, EQUIPES E MONITORAMENTO DE SUPERVISÃO
// ==============================================================================

export type TeamType = 'active_sales' | 'inbound_sales' | 'recovery' | 'support' | 'custom';
export type DistributionStrategy = 'round_robin' | 'workload' | 'manual';

export interface Team {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  type: TeamType;
  color: string;
  distributionStrategy: DistributionStrategy;
  active: boolean;
  memberCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  companyId: string;
  userName?: string;
  userEmail?: string;
  role: 'leader' | 'member';
  isExternal: boolean; // Colaborador interno ou externo (remoto/home office)
  phoneNumber?: string; // WhatsApp ou telefone direto
  extension?: string; // Ramal virtual do WebRTC/VoIP
  status: TeamMemberStatus;
  maxConcurrentLeads: number;
  active: boolean;
  createdAt: string;
}

export interface SupervisorMonitorStats {
  totalAgents: number;
  onlineAgents: number;
  inCallAgents: number;
  busyAgents: number;
  offlineAgents: number;
  activeChatsCount: number;
  todayCallsCount: number;
  averageCallDuration: number;
  positiveSentimentRate: number;
}

// ==============================================================================
// PASSO 7: SISTEMA DE PESQUISAS, QUALIFICAÇÃO & NPS (Surveys)
// ==============================================================================

export type SurveyQuestionType = 'single_choice' | 'multiple_choice' | 'text' | 'rating_stars' | 'nps' | 'contact_info';

export interface SurveyOption {
  id: string;
  label: string;
}

export interface SurveyQuestion {
  id: string;
  title: string;
  description?: string;
  type: SurveyQuestionType;
  required: boolean;
  options?: SurveyOption[];
  minScale?: number;
  maxScale?: number;
}

export interface SurveyTheme {
  primaryColor: string;
  backgroundColor: 'white' | 'slate' | 'dark' | 'gradient';
  fontFamily: string;
  buttonStyle: 'rounded-xl' | 'rounded-full' | 'rounded-md';
}

export interface SurveyThankYou {
  title: string;
  subtitle: string;
  whatsappGroupUrl?: string;
  redirectUrl?: string;
  ctaButtonText?: string;
}

export interface Survey {
  id: string;
  companyId: string;
  title: string;
  slug: string;
  description?: string;
  status: 'published' | 'draft' | 'archived';
  theme: SurveyTheme;
  questions: SurveyQuestion[];
  thankYou: SurveyThankYou;
  responsesCount?: number;
  averageNps?: number;
  workflowId?: string;
  autoTriggerWhatsApp?: boolean;
  whatsappTemplate?: string;
  autoTriggerEmail?: boolean;
  emailSubject?: string;
  emailBody?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  companyId: string;
  leadId?: string;
  leadName?: string;
  leadPhone?: string;
  leadEmail?: string;
  answers: Record<string, any>; // questionId -> answer value
  npsScore?: number;
  createdAt: string;
}

// ==============================================================================
// PASSO 8: CONFIGURAÇÃO DE DOMÍNIOS PRÓPRIOS & DNS (Custom Domains)
// ==============================================================================

export type CustomDomainType = 'landing_pages' | 'tracking_links' | 'all';
export type CustomDomainStatus = 'active' | 'pending_verification' | 'dns_propagating' | 'error';

export interface DnsRecord {
  type: 'CNAME' | 'A' | 'TXT';
  name: string;
  expectedValue: string;
  currentValue?: string;
  verified: boolean;
}

export interface CustomDomain {
  id: string;
  companyId: string;
  domain: string; // ex: lp.suaempresa.com.br
  type: CustomDomainType;
  status: CustomDomainStatus;
  sslActive: boolean;
  dnsRecords: DnsRecord[];
  verifiedAt?: string;
  defaultLandingPageId?: string;
  createdAt: string;
  updatedAt: string;
}

// ==============================================================================
// PASSO 9: GAMIFICAÇÃO, EVENTOS AO VIVO & CAPTURA DE LEADS (Live Stage & Mobile)
// ==============================================================================

export type GamificationActivityType = 
  | 'word_cloud'       // Nuvem de palavras
  | 'multiple_choice'  // Múltipla escolha / Enquete
  | 'quiz'             // Quiz competitivo com pontuação e timer
  | 'qa'               // Pergunte ao instrutor / Mural com upvotes
  | 'lucky_draw'       // Sorteio de participantes / Roleta
  | 'true_false'       // Verdadeiro ou Falso
  | 'open_text'        // Texto aberto / Ideias
  | 'ranking';         // Placar geral / Leaderboard

export interface GamificationActivityOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  color?: string;
}

export interface GamificationActivity {
  id: string;
  eventId: string;
  type: GamificationActivityType;
  title: string;
  subtitle?: string;
  options?: GamificationActivityOption[];
  correctOptionId?: string;
  timeLimitSeconds?: number;
  points?: number;
  orderIndex: number;
  status: 'pending' | 'active' | 'revealed' | 'closed';
  metadata?: Record<string, any>;
  responsesCount?: number;
  createdAt?: string;
}

export interface GamificationParticipant {
  id: string;
  eventId: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  role?: string;
  avatar?: string;
  score: number;
  isWinner?: boolean;
  deviceToken?: string;
  createdAt?: string;
  lastActiveAt?: string;
}

export interface GamificationResponse {
  id: string;
  activityId: string;
  participantId: string;
  participantName?: string;
  participantAvatar?: string;
  responseData: any; // { text: string } ou { selectedOptionId: string, isCorrect: boolean, timeMs: number }
  upvotes?: number;
  createdAt: string;
}

export interface GamificationEventTheme {
  primaryColor: string;
  backgroundColor: string;
  accentColor: string;
  fontFamily?: string;
}

export interface GamificationEvent {
  id: string;
  companyId: string;
  title: string;
  slug: string;
  pinCode: string;
  description?: string;
  theme: GamificationEventTheme;
  status: 'draft' | 'live' | 'finished';
  currentActivityId?: string;
  requirePhone: boolean;
  requireEmail: boolean;
  requireCompany: boolean;
  requireRole?: boolean;
  leadMagnetUrl?: string;
  settings?: {
    allowAnonymous?: boolean;
    showLiveCount?: boolean;
    enableSounds?: boolean;
  };
  activities?: GamificationActivity[];
  participants?: GamificationParticipant[];
  participantsCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ==============================================================================
// PASSO 10: CRIADOR DE AGENTES DE IA AUTÔNOMOS (Goal-Driven AI Agents)
// ==============================================================================

export type AIAgentAutonomyMode = 'autonomous' | 'copilot';

export type AIAgentTriggerType =
  | 'whatsapp_message'
  | 'instagram_dm'
  | 'lead_created'
  | 'stage_changed'
  | 'inactivity_followup'
  | 'manual_invocation';

export type AIAgentToolId =
  // Ferramentas de Busca de Informações (Leitura de Contexto)
  | 'get_lead_profile'
  | 'search_products'
  | 'get_lead_purchases'
  | 'get_chat_history'
  | 'get_campaign_links'
  | 'get_survey_responses'
  // Ferramentas de Ação no Sistema (Execução)
  | 'update_lead_stage'
  | 'add_lead_note'
  | 'update_lead_score'
  | 'send_tracking_link'
  | 'assign_to_human'
  | 'schedule_followup';

export interface AIAgentReasoningStep {
  id: string;
  type: 'perception' | 'data_lookup' | 'reasoning' | 'rule_check' | 'action_executed';
  title: string;
  detail: string;
  toolId?: AIAgentToolId;
  toolInput?: Record<string, any>;
  toolOutput?: any;
  timestamp: string;
}

export type AIAgentActivityColumn =
  | 'analyzing'      // Recebido / Analisando Contexto
  | 'qualifying'     // Em Atendimento / Qualificando (IA)
  | 'scheduled'      // Follow-up / Tarefa Agendada
  | 'goal_achieved'  // Objetivo Concluído pela IA
  | 'handed_over';   // Escalonado p/ Humano (Transbordo)

export type AIAgentActivityCategory =
  | 'qualification'
  | 'closing'
  | 'followup'
  | 'support_triage'
  | 'crm_update'
  | 'human_handover';

export interface AIAgentExecutionLog {
  id: string;
  agentId: string;
  agentName: string;
  agentAvatar?: string;
  companyId: string;
  leadId?: string;
  leadName?: string;
  leadPhone?: string;
  leadStage?: FunnelStage;
  leadScore?: number;
  channel?: 'whatsapp' | 'instagram' | 'webchat' | 'crm_trigger';
  trigger: string;
  userMessage?: string;
  agentReply: string;
  steps: AIAgentReasoningStep[];
  actionsTaken: string[];
  status: 'completed' | 'handed_over' | 'blocked_by_rule';
  // Campos da Central de Atividades (Formato Hablla)
  boardColumn?: AIAgentActivityColumn;
  activityCategory?: AIAgentActivityCategory;
  taskTitle?: string;
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string;
  taskCompleted?: boolean;
  durationMs?: number;
  tags?: string[];
  createdAt: string;
}

export interface AIAgentRoom {
  id: string;
  companyId: string;
  name: string;
  slug: string;
  color: 'sky' | 'rose' | 'emerald' | 'amber' | 'purple' | 'cyan';
  description?: string;
  createdAt: string;
}

export interface AIAgent {
  id: string;
  companyId: string;
  roomId?: string;
  roomName?: string;
  name: string;
  roleTitle: string;
  avatar: string;
  descriptionPrompt: string; // Descrição livre usada para criar/definir o agente
  goal: string;              // Objetivo principal que o agente persegue
  personaAndContext: string; // Como ele interpreta o contexto e se comunica
  rules: string[];           // Regras estritas e limites (Guardrails)
  autonomyMode: AIAgentAutonomyMode;
  triggers: AIAgentTriggerType[];
  enabledTools: AIAgentToolId[];
  active: boolean;
  executionsCount: number;
  goalsAchievedCount: number;
  createdAt: string;
  updatedAt: string;
}


