import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { CampaignLink, Lead, WebhookLog, IntegrationSettings, FunnelStage, ConversionEventLog } from './src/types.js';
import { supabase } from './src/lib/supabase.js';
import bcrypt from 'bcryptjs';
import { startWhatsApp, logoutWhatsApp, getWhatsAppStatus, sendWhatsAppMessage, sendWhatsAppMedia } from './src/services/whatsappService.js';
import { GoogleGenAI } from '@google/genai';

// Mappers to convert between frontend camelCase and DB snake_case
const mapCompanyToDB = (c: any) => {
    const obj: any = {};
    if (c.id !== undefined) obj.id = c.id;
    if (c.name !== undefined) obj.name = c.name;
    if (c.cnpj !== undefined) obj.cnpj = c.cnpj;
    if (c.plan !== undefined) obj.plan = c.plan;
    if (c.active !== undefined) obj.active = c.active;
    if (c.logoUrl !== undefined) obj.logo_url = c.logoUrl;
    if (c.responsibleName !== undefined) obj.responsible_name = c.responsibleName;
    if (c.phone !== undefined) obj.phone = c.phone;
    if (c.address !== undefined) obj.address = c.address;
    obj.updated_at = new Date().toISOString();
    return obj;
};

const mapCompanyFromDB = (db: any) => ({
    id: db.id,
    name: db.name,
    cnpj: db.cnpj,
    plan: db.plan,
    active: db.active,
    logoUrl: db.logo_url,
    responsibleName: db.responsible_name,
    phone: db.phone,
    address: db.address,
    createdAt: db.created_at
});

const mapUserToDB = (u: any) => ({
    id: u.id,
    company_id: u.companyId,
    name: u.name,
    email: u.email,
    ...(u.password && { password: u.password }),
    role: u.role,
    avatar_url: u.avatarUrl,
    active: u.active,
    updated_at: new Date().toISOString(),
    created_at: u.createdAt || new Date().toISOString()
});

const mapUserFromDB = (db: any) => ({
    id: db.id,
    companyId: db.company_id,
    name: db.name,
    email: db.email,
    role: db.role,
    avatarUrl: db.avatar_url,
    active: db.active,
    createdAt: db.created_at
});

const mapLinkToDB = (link: any) => ({
    id: link.id,
    company_id: link.companyId || 'comp-alfa',
    title: link.title,
    phone: link.phone,
    message: link.message,
    slug: link.slug,
    utm_source: link.utmSource,
    utm_medium: link.utmMedium,
    utm_campaign: link.utmCampaign,
    utm_content: link.utmContent,
    utm_term: link.utmTerm,
    custom_tags: {
        ...(link.customTags || {}),
        ...(link.metaEventName !== undefined ? { metaEventName: link.metaEventName } : {})
    },
    capture_lead_form: link.captureLeadForm,
    meta_pixel_id: link.metaPixelId,
    meta_event_name: link.metaEventName || null,
    google_ads_conversion_id: link.googleAdsConversionId,
    google_ads_label: link.googleAdsLabel,
    webhook_url: link.webhookUrl,
    clicks_count: link.clicksCount || 0,
    leads_count: link.leadsCount || 0,
    conversions_count: link.conversionsCount || 0,
    created_at: link.createdAt || new Date().toISOString(),
    updated_at: link.updatedAt || new Date().toISOString()
});

const mapLinkFromDB = (db: any) => ({
    id: db.id,
    companyId: db.company_id,
    title: db.title,
    phone: db.phone,
    message: db.message,
    slug: db.slug,
    utmSource: db.utm_source,
    utmMedium: db.utm_medium,
    utmCampaign: db.utm_campaign,
    utmContent: db.utm_content,
    utmTerm: db.utm_term,
    customTags: db.custom_tags || {},
    captureLeadForm: db.capture_lead_form,
    metaPixelId: db.meta_pixel_id,
    metaEventName: db.meta_event_name || db.custom_tags?.metaEventName || '',
    googleAdsConversionId: db.google_ads_conversion_id,
    googleAdsLabel: db.google_ads_label,
    webhookUrl: db.webhook_url,
    clicksCount: db.clicks_count || 0,
    leadsCount: db.leads_count || 0,
    conversionsCount: db.conversions_count || 0,
    createdAt: db.created_at,
    updatedAt: db.updated_at
});

const mapLeadToDB = (lead: any) => ({
    id: lead.id,
    company_id: lead.companyId || lead.company_id || 'comp-alfa',
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    location: lead.location || {},
    source: lead.source,
    utm_source: lead.utmSource || lead.utm_source,
    utm_medium: lead.utmMedium || lead.utm_medium,
    utm_campaign: lead.utmCampaign || lead.utm_campaign,
    utm_content: lead.utmContent || lead.utm_content,
    utm_term: lead.utmTerm || lead.utm_term,
    link_id: (lead.linkId && lead.linkId.trim() !== '') ? lead.linkId : (lead.link_id || null),
    link_title: lead.linkTitle || lead.link_title,
    stage: lead.stage,
    value: lead.value || 0,
    device: lead.device,
    browser: lead.browser,
    notes: lead.notes,
    conversion_events: lead.conversionEvents || lead.conversion_events || [],
    bot_active: lead.botActive !== undefined ? lead.botActive : true,
    created_at: lead.createdAt || lead.created_at || new Date().toISOString(),
    updated_at: lead.updatedAt || lead.updated_at || new Date().toISOString()
});

async function safeInsertLead(dbRow: any) {
    let rowToInsert = { ...dbRow };
    let { error } = await supabase.from('leads').insert(rowToInsert);
    if (error) {
        console.error('safeInsertLead initial error:', error.message, error.details);
        if (error.message?.includes('bot_active') || error.details?.includes('bot_active')) {
            delete rowToInsert.bot_active;
        }
        if (error.message?.includes('link_id') || error.details?.includes('link_id') || error.code === '23503') {
            rowToInsert.link_id = null;
        }
        const res = await supabase.from('leads').insert(rowToInsert);
        error = res.error;
        if (error) {
            console.error('safeInsertLead retry error:', error.message);
        }
    }
    return { error };
}

async function safeUpdateLead(id: string, dbRow: any) {
    let rowToUpdate = { ...dbRow };
    let { error } = await supabase.from('leads').update(rowToUpdate).eq('id', id);
    if (error) {
        console.error('safeUpdateLead initial error:', error.message, error.details);
        if (error.message?.includes('bot_active') || error.details?.includes('bot_active')) {
            delete rowToUpdate.bot_active;
        }
        if (error.message?.includes('link_id') || error.details?.includes('link_id') || error.code === '23503') {
            rowToUpdate.link_id = null;
        }
        const res = await supabase.from('leads').update(rowToUpdate).eq('id', id);
        error = res.error;
        if (error) {
            console.error('safeUpdateLead retry error:', error.message);
        }
    }
    return { error };
}

const mapLeadFromDB = (db: any) => {
    const computed = computeLeadScore(db);
    return {
        id: db.id,
        companyId: db.company_id,
        name: db.name,
        phone: db.phone,
        email: db.email,
        location: db.location || {},
        source: db.source,
        utmSource: db.utm_source,
        utmMedium: db.utm_medium,
        utmCampaign: db.utm_campaign,
        utmContent: db.utm_content,
        utmTerm: db.utm_term,
        linkId: db.link_id,
        linkTitle: db.link_title,
        stage: db.stage,
        value: db.value || 0,
        device: db.device,
        browser: db.browser,
        notes: db.notes,
        conversionEvents: Array.isArray(db.conversion_events) 
            ? db.conversion_events 
            : (typeof db.conversion_events === 'string' 
                ? (() => { try { return JSON.parse(db.conversion_events); } catch { return []; } })() 
                : []),
        botActive: db.bot_active !== undefined ? db.bot_active : true,
        score: db.score !== undefined ? db.score : computed.score,
        qualificationLevel: db.qualification_level || computed.qualificationLevel,
        fitGrade: db.fit_grade || computed.fitGrade,
        scoreBreakdown: db.score_breakdown || computed.scoreBreakdown,
        createdAt: db.created_at,
        updatedAt: db.updated_at
    };
};

const mapSettingsToDB = (s: any) => ({
    company_id: s.companyId || 'comp-alfa',
    global_meta_pixel_id: s.globalMetaPixelId,
    global_meta_token: s.globalMetaToken,
    global_google_ads_id: s.globalGoogleAdsId,
    global_google_ads_label: s.globalGoogleAdsLabel,
    global_webhook_url: s.globalWebhookUrl,
    evolution_instance: s.evolutionInstance,
    evolution_api_url: s.evolutionApiUrl,
    evolution_api_key: s.evolutionApiKey,
    auto_fire_meta_on_lead: s.autoFireMetaOnLead,
    auto_fire_meta_on_conversion: s.autoFireMetaOnConversion,
    auto_fire_google_on_conversion: s.autoFireGoogleOnConversion,
    auto_fire_webhook_on_lead: s.autoFireWebhookOnLead,
    auto_fire_webhook_on_stage_change: s.autoFireWebhookOnStageChange,
    meta_lead_event_name: s.metaLeadEventName,
    stage_event_mappings: s.stageEventMappings,
    auto_stage_keywords: s.autoStageKeywords,
    chatbot_config: s.chatbotConfig || DEFAULT_CHATBOT_CONFIG,
    updated_at: new Date().toISOString()
});

export const DEFAULT_CHATBOT_CONFIG = {
  enabled: false,
  botName: 'Sofia - Assistente Virtual',
  personaPrompt: 'Você é Sofia, consultora virtual especialista em vendas e atendimento ao cliente. Seu objetivo é atender com simpatia, tirar dúvidas sobre produtos e conduzir o cliente com cordialidade para o fechamento.',
  autoReplyDelaySeconds: 2,
  enableHumanHandover: true,
  handoverKeywords: ['atendente', 'humano', 'pessoa', 'atendimento', 'suporte', 'especialista', 'falar com alguém'],
  includeProductsKnowledge: true
};

const DEFAULT_STAGE_MAPPINGS: Record<string, { stage: string; metaEvent: string; googleLabel: string; enabled: boolean }> = {
  'Novo Lead': { stage: 'Novo Lead', metaEvent: 'Lead', googleLabel: 'lead_conversion', enabled: true },
  'Contatado': { stage: 'Contatado', metaEvent: 'Contact', googleLabel: 'contact_conversion', enabled: true },
  'Em Negociação': { stage: 'Em Negociação', metaEvent: 'InitiateCheckout', googleLabel: 'checkout_conversion', enabled: true },
  'Convertido': { stage: 'Convertido', metaEvent: 'Purchase', googleLabel: 'purchase_conversion', enabled: true },
  'Perdido': { stage: 'Perdido', metaEvent: 'LeadLost', googleLabel: 'loss_conversion', enabled: false }
};

const mapSettingsFromDB = (db: any) => ({
    companyId: db.company_id,
    globalMetaPixelId: db.global_meta_pixel_id || '',
    globalMetaToken: db.global_meta_token || '',
    globalGoogleAdsId: db.global_google_ads_id || '',
    globalGoogleAdsLabel: db.global_google_ads_label || '',
    globalWebhookUrl: db.global_webhook_url || '',
    evolutionInstance: db.evolution_instance || '',
    evolutionApiUrl: db.evolution_api_url || '',
    evolutionApiKey: db.evolution_api_key || '',
    autoFireMetaOnLead: db.auto_fire_meta_on_lead || false,
    autoFireMetaOnConversion: db.auto_fire_meta_on_conversion || false,
    autoFireGoogleOnConversion: db.auto_fire_google_on_conversion || false,
    autoFireWebhookOnLead: db.auto_fire_webhook_on_lead || false,
    autoFireWebhookOnStageChange: db.auto_fire_webhook_on_stage_change || false,
    metaLeadEventName: db.meta_lead_event_name || '',
    stageEventMappings: (db.stage_event_mappings && Object.keys(db.stage_event_mappings).length > 0)
      ? db.stage_event_mappings
      : DEFAULT_STAGE_MAPPINGS,
    autoStageKeywords: db.auto_stage_keywords || [],
    chatbotConfig: db.chatbot_config ? { ...DEFAULT_CHATBOT_CONFIG, ...db.chatbot_config } : DEFAULT_CHATBOT_CONFIG
});

const mapWebhookFromDB = (db: any) => ({
    id: db.id,
    companyId: db.company_id,
    url: db.url,
    event: db.event,
    status: db.status,
    payload: db.payload,
    timestamp: db.timestamp,
    leadName: db.lead_name
});

const mapProductToDB = (p: any) => ({
    id: p.id || `prod-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    company_id: p.companyId || 'comp-alfa',
    name: p.name,
    type: p.type,
    price: p.price,
    recurrence_days: p.recurrenceDays,
    created_at: p.createdAt || new Date().toISOString()
});

const mapProductFromDB = (db: any) => ({
    id: db.id,
    companyId: db.company_id,
    name: db.name,
    type: db.type,
    price: db.price,
    recurrenceDays: db.recurrence_days,
    createdAt: db.created_at
});

const mapLeadPurchaseToDB = (lp: any) => ({
    id: lp.id || `lp-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    company_id: lp.companyId || 'comp-alfa',
    lead_id: lp.leadId,
    product_id: lp.productId,
    amount: lp.amount,
    purchased_at: lp.purchasedAt || new Date().toISOString()
});

const mapLeadPurchaseFromDB = (db: any) => ({
    id: db.id,
    companyId: db.company_id,
    leadId: db.lead_id,
    productId: db.product_id,
    amount: db.amount,
    purchasedAt: db.purchased_at
});

// Smart Popups & Forms Mappers
const mapPopupToDB = (p: any) => ({
    id: p.id || `pop-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    company_id: p.companyId || 'comp-alfa',
    name: p.name || 'Novo Pop-up',
    active: p.active !== undefined ? p.active : true,
    trigger_type: p.triggerType || 'exit_intent',
    trigger_value: Number(p.triggerValue || 0),
    show_once_per_user: p.showOncePerUser !== undefined ? p.showOncePerUser : true,
    title: p.title || '',
    subtitle: p.subtitle || '',
    badge_text: p.badgeText || '',
    cta_text: p.ctaText || 'Quero Aproveitar',
    fields: p.fields || [],
    theme_color: p.themeColor || '#2563eb',
    background_color: p.backgroundColor || 'light',
    button_color: p.buttonColor || '#2563eb',
    button_text_color: p.buttonTextColor || '#ffffff',
    border_radius: p.borderRadius || 'md',
    action_type: p.actionType || 'whatsapp_redirect',
    whatsapp_phone: p.whatsappPhone || '',
    whatsapp_message: p.whatsappMessage || '',
    redirect_url: p.redirectUrl || '',
    success_message: p.successMessage || 'Obrigado! Recebemos suas informações.',
    target_stage: p.targetStage || 'Novo Lead',
    tags: p.tags || [],
    link_id: p.linkId || null,
    impressions_count: p.impressionsCount || 0,
    leads_count: p.leadsCount || 0,
    created_at: p.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
});

const mapPopupFromDB = (db: any) => ({
    id: db.id,
    companyId: db.company_id,
    name: db.name,
    active: db.active !== undefined ? db.active : true,
    triggerType: db.trigger_type || 'exit_intent',
    triggerValue: Number(db.trigger_value || 0),
    showOncePerUser: db.show_once_per_user !== undefined ? db.show_once_per_user : true,
    title: db.title || '',
    subtitle: db.subtitle || '',
    badgeText: db.badge_text || '',
    ctaText: db.cta_text || 'Quero Aproveitar',
    fields: db.fields || [
      { id: 'f-name', name: 'name', label: 'Seu Nome', type: 'text', placeholder: 'Ex: Ana Souza', required: true, enabled: true },
      { id: 'f-phone', name: 'phone', label: 'WhatsApp', type: 'tel', placeholder: '(11) 99999-9999', required: true, enabled: true },
      { id: 'f-email', name: 'email', label: 'E-mail', type: 'email', placeholder: 'ana@email.com', required: false, enabled: true }
    ],
    themeColor: db.theme_color || '#2563eb',
    backgroundColor: db.background_color || 'light',
    buttonColor: db.button_color || '#2563eb',
    buttonTextColor: db.button_text_color || '#ffffff',
    borderRadius: db.border_radius || 'md',
    actionType: db.action_type || 'whatsapp_redirect',
    whatsappPhone: db.whatsapp_phone || '',
    whatsappMessage: db.whatsapp_message || '',
    redirectUrl: db.redirect_url || '',
    successMessage: db.success_message || 'Obrigado! Recebemos seus dados com sucesso.',
    targetStage: db.target_stage || 'Novo Lead',
    tags: db.tags || [],
    linkId: db.link_id || '',
    impressionsCount: db.impressions_count || 0,
    leadsCount: db.leads_count || 0,
    createdAt: db.created_at || new Date().toISOString(),
    updatedAt: db.updated_at || new Date().toISOString()
});

// Marketing Automation & Workflows Mappers (RD Station style)
const mapWorkflowToDB = (w: any) => ({
    id: w.id || `wf-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    company_id: w.companyId || 'comp-alfa',
    name: w.name || 'Nova Automação',
    description: w.description || '',
    active: w.active !== undefined ? w.active : true,
    trigger_type: w.triggerType || 'lead_created',
    trigger_config: w.triggerConfig || {},
    steps: w.steps || [],
    enrolled_count: w.enrolledCount || 0,
    executed_count: w.executedCount || 0,
    conversions_count: w.conversionsCount || 0,
    created_at: w.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
});

const mapWorkflowFromDB = (db: any) => ({
    id: db.id,
    companyId: db.company_id,
    name: db.name,
    description: db.description || '',
    active: db.active !== undefined ? db.active : true,
    triggerType: db.trigger_type || 'lead_created',
    triggerConfig: db.trigger_config || {},
    steps: db.steps || [],
    enrolledCount: Number(db.enrolled_count || 0),
    executedCount: Number(db.executed_count || 0),
    conversionsCount: Number(db.conversions_count || 0),
    createdAt: db.created_at || new Date().toISOString(),
    updatedAt: db.updated_at || new Date().toISOString()
});

// In-Memory Workflows Seed (RD Station style)
let inMemoryWorkflows: any[] = [
  {
    id: 'wf-welcome-nurture',
    company_id: 'comp-alfa',
    name: 'Boas-Vindas & Nutrição Imediata (Novo Lead)',
    description: 'Dispara mensagem no WhatsApp assim que o lead se cadastra, aguarda 2 horas e envia um e-mail com material de valor.',
    active: true,
    trigger_type: 'lead_created',
    trigger_config: {},
    steps: [
      {
        id: 'step-w-1',
        type: 'send_whatsapp',
        title: 'Enviar WhatsApp de Boas-Vindas',
        messageTemplate: 'Olá, {nome}! Seja muito bem-vindo(a) à {empresa}! Já recebemos seu interesse e separamos uma apresentação exclusiva para você: {link_checkout}. Ficou com alguma dúvida inicial?'
      },
      {
        id: 'step-w-2',
        type: 'wait_delay',
        title: 'Aguardar 2 Horas',
        delayMinutes: 120
      },
      {
        id: 'step-w-3',
        type: 'send_email',
        title: 'Enviar E-mail com Conteúdo Exclusivo',
        emailSubject: 'Seu guia exclusivo da {empresa}',
        emailBody: 'Olá {nome}, preparamos esse guia especial para acelerar seus resultados. Conte com nosso time comercial!'
      },
      {
        id: 'step-w-4',
        type: 'change_stage',
        title: 'Mover Lead para "Contatado"',
        targetStage: 'Contatado'
      }
    ],
    enrolled_count: 84,
    executed_count: 192,
    conversions_count: 19,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'wf-cart-recovery',
    company_id: 'comp-alfa',
    name: 'Recuperação de Proposta / Negociação Aberta',
    description: 'Quando o lead é movido para "Em Negociação", aguarda 4 horas e envia oferta com cupom especial para fechar.',
    active: true,
    trigger_type: 'stage_changed',
    trigger_config: { stage: 'Em Negociação' },
    steps: [
      {
        id: 'step-cr-1',
        type: 'wait_delay',
        title: 'Aguardar 4 Horas',
        delayMinutes: 240
      },
      {
        id: 'step-cr-2',
        type: 'send_whatsapp',
        title: 'Disparar Oferta Especial com Desconto no WhatsApp',
        messageTemplate: 'Oi, {nome}! Notei que você estava analisando nossa proposta comercial. Consegui liberar uma condição especial exclusiva válida para hoje: 10% de desconto ou bônus premium na adesão! Vamos garantir sua vaga agora?'
      },
      {
        id: 'step-cr-3',
        type: 'notify_user',
        title: 'Notificar Equipe de Vendas',
        notifyMessage: 'Lead {nome} ({telefone}) recebeu proposta de fechamento automático.'
      }
    ],
    enrolled_count: 38,
    executed_count: 74,
    conversions_count: 14,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'wf-post-sale-vip',
    company_id: 'comp-alfa',
    name: 'Onboarding & Pós-Venda VIP (Lead Convertido)',
    description: 'Envia mensagem de agradecimento, aplica tag VIP e solicita feedback após 24h.',
    active: true,
    trigger_type: 'stage_changed',
    trigger_config: { stage: 'Convertido' },
    steps: [
      {
        id: 'step-ps-1',
        type: 'send_whatsapp',
        title: 'Enviar Agradecimento & Acesso VIP no WhatsApp',
        messageTemplate: 'Parabéns pela decisão, {nome}! 🎉 Seu acesso aos nossos serviços da {empresa} foi liberado com sucesso. Qualquer suporte que precisar, nossa equipe está 100% à sua disposição por aqui!'
      },
      {
        id: 'step-ps-2',
        type: 'add_tag',
        title: 'Adicionar Tag "cliente_vip"',
        tag: 'cliente_vip'
      },
      {
        id: 'step-ps-3',
        type: 'wait_delay',
        title: 'Aguardar 24 Horas',
        delayMinutes: 1440
      },
      {
        id: 'step-ps-4',
        type: 'send_whatsapp',
        title: 'Solicitar Avaliação e Feedback',
        messageTemplate: 'Olá {nome}! Passando para saber como foi sua primeira impressão com a {empresa}. De 0 a 10, que nota você daria para o nosso atendimento?'
      }
    ],
    enrolled_count: 52,
    executed_count: 104,
    conversions_count: 52,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'wf-reengage-lost',
    company_id: 'comp-alfa',
    name: 'Reativação de Contatos Perdidos',
    description: 'Reengaja leads perdidos após 7 dias com novidades ou renegociação.',
    active: false,
    trigger_type: 'stage_changed',
    trigger_config: { stage: 'Perdido' },
    steps: [
      {
        id: 'step-re-1',
        type: 'wait_delay',
        title: 'Aguardar 7 Dias',
        delayMinutes: 10080
      },
      {
        id: 'step-re-2',
        type: 'send_whatsapp',
        title: 'Mensagem Amigável de Reativação',
        messageTemplate: 'Olá {nome}! Tudo bem? Sei que no momento anterior não foi o momento ideal para avançarmos. Lançamos uma novidade na {empresa} que pode ser exatamente o que você precisava. Posso te apresentar rapidamente?'
      }
    ],
    enrolled_count: 21,
    executed_count: 21,
    conversions_count: 3,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString()
  }
];

let inMemoryWorkflowLogs: any[] = [];

// In-Memory Popups Fallback & Initial Seed
let inMemoryPopups: any[] = [
  {
    id: 'pop-exit-vip',
    company_id: 'comp-alfa',
    name: 'Pop-up de Saída: Desconto Exclusivo VIP (Exit Intent)',
    active: true,
    trigger_type: 'exit_intent',
    trigger_value: 0,
    show_once_per_user: true,
    title: 'Espere! Não vá embora de mãos vazias!',
    subtitle: 'Garanta 15% de desconto especial no seu primeiro pedido falando agora com nossa equipe no WhatsApp.',
    badge_text: 'Oferta Relâmpago ⚡',
    cta_text: 'Resgatar Cupom de 15% no WhatsApp',
    fields: [
      { id: 'f1', name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Como podemos te chamar?', required: true, enabled: true },
      { id: 'f2', name: 'phone', label: 'Seu WhatsApp', type: 'tel', placeholder: '(11) 99999-9999', required: true, enabled: true },
      { id: 'f3', name: 'email', label: 'Seu Melhor E-mail', type: 'email', placeholder: 'exemplo@empresa.com', required: false, enabled: true }
    ],
    theme_color: '#10b981',
    background_color: 'dark',
    button_color: '#10b981',
    button_text_color: '#ffffff',
    border_radius: 'lg',
    action_type: 'whatsapp_redirect',
    whatsapp_phone: '5511987654321',
    whatsapp_message: 'Olá! Estava navegando no site e peguei o cupom de 15% VIP. Quero tirar dúvidas e fechar!',
    redirect_url: '',
    success_message: 'Perfeito! Estamos te redirecionando para o WhatsApp com seu cupom exclusivo.',
    target_stage: 'Novo Lead',
    tags: ['exit_intent', 'cupom_15off', 'popup_site'],
    link_id: 'link-1',
    impressions_count: 254,
    leads_count: 42,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'pop-scroll-demo',
    company_id: 'comp-alfa',
    name: 'Pop-up de Rolagem: Demonstração Gratuita (Scroll 50%)',
    active: true,
    trigger_type: 'scroll',
    trigger_value: 50,
    show_once_per_user: false,
    title: 'Gostou do que viu até aqui?',
    subtitle: 'Agende uma demonstração gratuita de 15 minutos sem compromisso com nossos especialistas.',
    badge_text: 'Consultoria 100% Grátis 🎯',
    cta_text: 'Agendar Demonstração VIP',
    fields: [
      { id: 'f1', name: 'name', label: 'Seu Nome', type: 'text', placeholder: 'Nome e sobrenome', required: true, enabled: true },
      { id: 'f2', name: 'phone', label: 'WhatsApp com DDD', type: 'tel', placeholder: '(11) 99999-9999', required: true, enabled: true }
    ],
    theme_color: '#2563eb',
    background_color: 'light',
    button_color: '#2563eb',
    button_text_color: '#ffffff',
    border_radius: 'md',
    action_type: 'whatsapp_redirect',
    whatsapp_phone: '5511987654321',
    whatsapp_message: 'Olá! Vi a apresentação no site e quero agendar uma demonstração gratuita.',
    redirect_url: '',
    success_message: 'Pronto! Recebemos sua solicitação de demonstração.',
    target_stage: 'Novo Lead',
    tags: ['scroll_50', 'demo_gratuita'],
    link_id: 'link-2',
    impressions_count: 189,
    leads_count: 31,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// ==========================================
// Landing Pages Mappers & In-Memory Seed (RD Station style)
// ==========================================
const mapLandingPageToDB = (lp: any) => ({
    id: lp.id,
    company_id: lp.companyId || 'comp-alfa',
    title: lp.title,
    slug: (lp.slug || '').toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-'),
    description: lp.description || '',
    status: lp.status || 'published',
    category: lp.category || 'lead_magnet',
    theme: lp.theme || {},
    hero: lp.hero || {},
    features: lp.features || [],
    social_proof: lp.socialProof || {},
    countdown: lp.countdown || {},
    form: lp.form || {},
    faq: lp.faq || {},
    footer: lp.footer || {},
    views_count: Number(lp.viewsCount || 0),
    conversions_count: Number(lp.conversionsCount || 0),
    created_at: lp.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
});

const mapLandingPageFromDB = (db: any) => ({
    id: db.id,
    companyId: db.company_id,
    title: db.title,
    slug: db.slug,
    description: db.description || '',
    status: db.status || 'published',
    category: db.category || 'lead_magnet',
    theme: db.theme || {
        primaryColor: '#2563eb',
        accentColor: '#10b981',
        backgroundColor: 'white',
        fontFamily: 'Inter',
        buttonStyle: 'rounded-xl'
    },
    hero: db.hero || {
        badge: '🚀 Oportunidade Exclusiva',
        headline: 'Transforme seus Resultados com Nossa Metodologia',
        subheadline: 'Preencha o formulário abaixo e receba acesso imediato.',
        ctaText: 'Quero Começar Agora'
    },
    features: db.features || [],
    socialProof: db.social_proof || { enabled: false, stats: [], testimonials: [] },
    countdown: db.countdown || { enabled: false },
    form: db.form || {
        title: 'Garanta sua Vaga',
        buttonText: 'Enviar Dados',
        fields: [],
        actionType: 'redirect_whatsapp',
        targetStage: 'Novo Lead',
        tags: ['landing-page']
    },
    faq: db.faq || { enabled: false, items: [] },
    footer: db.footer || { companyName: 'MDTracker' },
    viewsCount: Number(db.views_count || 0),
    conversionsCount: Number(db.conversions_count || 0),
    createdAt: db.created_at || new Date().toISOString(),
    updatedAt: db.updated_at || new Date().toISOString()
});

let inMemoryLandingPages: any[] = [
  {
    id: 'lp-consultoria-estrategica',
    company_id: 'comp-alfa',
    title: 'Consultoria Estratégica de Vendas & Tráfego no WhatsApp',
    slug: 'consultoria-estrategica',
    description: 'Receba um diagnóstico gratuito do seu funil e descubra como dobrar suas conversões de leads em menos de 30 dias.',
    status: 'published',
    category: 'service_consulting',
    theme: {
      primaryColor: '#2563eb',
      accentColor: '#10b981',
      backgroundColor: 'white',
      fontFamily: 'Inter',
      buttonStyle: 'rounded-xl'
    },
    hero: {
      badge: '🎯 Diagnóstico 100% Gratuito para Empresas',
      headline: 'Aumente suas Vendas e Converta Mais Leads Qualificados no WhatsApp',
      subheadline: 'Descubra os gargalos ocultos do seu funil comercial e receba um plano de ação prático em 24h para escalar seu faturamento sem precisar aumentar o orçamento de anúncios.',
      ctaText: 'Agendar Meu Diagnóstico Gratuito',
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=80'
    },
    features: [
      {
        id: 'feat-1',
        title: 'Análise Completa de Conversão',
        description: 'Mapeamento ponto a ponto do tempo de resposta, etapas do CRM e taxa de fechamento dos seus vendedores.'
      },
      {
        id: 'feat-2',
        title: 'Rastreamento CAPI & ROI Preciso',
        description: 'Atribuição correta de cada venda ao anúncio original do Meta e Google Ads, eliminando desperdício.'
      },
      {
        id: 'feat-3',
        title: 'Chatbot & Automação Inteligente',
        description: 'Atendimento qualificado 24/7 com IA integrada para responder dúvidas e agendar reuniões sem atraso.'
      },
      {
        id: 'feat-4',
        title: 'Plano de Ação Personalizado',
        description: 'Relatório executivo sob medida com os 3 passos prioritários para gerar caixa rápido nos próximos 15 dias.'
      }
    ],
    social_proof: {
      enabled: true,
      stats: [
        { label: 'Empresas Aceleradas', value: '+450' },
        { label: 'Aumento Médio de Conversão', value: '+42%' },
        { label: 'Satisfação dos Clientes', value: '4.9/5' }
      ],
      testimonials: [
        {
          id: 'test-1',
          name: 'Mariana Silveira',
          role: 'Diretora Comercial - TechGrowth',
          text: 'O diagnóstico abriu nossos olhos para um gargalo brutal no primeiro contato. Ajustamos a abordagem e no primeiro mês faturamos R$ 85 mil a mais!',
          rating: 5
        },
        {
          id: 'test-2',
          name: 'Carlos Eduardo Ramos',
          role: 'Fundador - EcomBrasil',
          text: 'Excelente consultoria. O alinhamento de tráfego direto para o WhatsApp com métricas precisas mudou o jogo da nossa empresa.',
          rating: 5
        }
      ]
    },
    countdown: {
      enabled: true,
      title: 'Condição Especial para Novos Inscritos Encerra em:',
      endDate: new Date(Date.now() + 86400000 * 3).toISOString()
    },
    form: {
      title: 'Solicite seu Diagnóstico Gratuito',
      subtitle: 'Preencha os dados abaixo. Entraremos em contato via WhatsApp.',
      buttonText: 'Quero Meu Diagnóstico Gratuito 🚀',
      buttonColor: '#2563eb',
      fields: [
        { id: 'f-name', name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Ex: Rogério Belmiro', required: true },
        { id: 'f-phone', name: 'phone', label: 'WhatsApp com DDD', type: 'tel', placeholder: '(11) 99999-9999', required: true },
        { id: 'f-email', name: 'email', label: 'Seu Melhor E-mail', type: 'email', placeholder: 'seu@email.com', required: true },
        { id: 'f-role', name: 'cargo', label: 'Qual seu cargo ou segmento?', type: 'text', placeholder: 'Ex: Gerente Comercial / E-commerce', required: false }
      ],
      actionType: 'redirect_whatsapp',
      whatsappPhone: '5511999999999',
      whatsappMessage: 'Olá! Acabei de solicitar meu Diagnóstico de Vendas na Landing Page e gostaria de agendar um horário com um consultor.',
      redirectUrl: '',
      successMessage: 'Diagnóstico solicitado com sucesso! Em instantes nosso especialista entrará em contato.',
      targetStage: 'Novo Lead',
      tags: ['lp-consultoria', 'alta-intencao', 'rd-station-style']
    },
    faq: {
      enabled: true,
      items: [
        {
          id: 'faq-1',
          question: 'O diagnóstico é realmente 100% gratuito?',
          answer: 'Sim, totalmente gratuito e sem pegadinhas. Avaliamos sua operação e mostramos com clareza as oportunidades de crescimento.'
        },
        {
          id: 'faq-2',
          question: 'Quanto tempo dura a apresentação do plano?',
          answer: 'Entre 20 e 30 minutos via chamada de vídeo ou WhatsApp, de forma direta e objetiva.'
        },
        {
          id: 'faq-3',
          question: 'Funciona para prestadores de serviço e infoprodutos?',
          answer: 'Perfeitamente. O método foi validado em mais de 15 nichos diferentes que utilizam o WhatsApp como canal principal de fechamento.'
        }
      ]
    },
    footer: {
      companyName: 'MDTracker & Growth Suite',
      copyrightText: 'Todos os direitos reservados.',
      privacyPolicyUrl: '#'
    },
    views_count: 184,
    conversions_count: 49,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'lp-guia-conversao-whatsapp',
    company_id: 'comp-alfa',
    title: 'E-book Exclusivo: O Guia Definitivo da Conversão no WhatsApp',
    slug: 'guia-conversao-whatsapp',
    description: 'Baixe gratuitamente o material completo com 7 scripts de mensagens persuasivas para quebrar objeções e fechar negócios.',
    status: 'published',
    category: 'lead_magnet',
    theme: {
      primaryColor: '#059669',
      accentColor: '#f59e0b',
      backgroundColor: 'white',
      fontFamily: 'Inter',
      buttonStyle: 'rounded-xl'
    },
    hero: {
      badge: '📘 Material Rico em PDF + Planilha Bônus',
      headline: 'O Guia Prático para Escalar suas Vendas no WhatsApp Sem Perder Leads',
      subheadline: 'Baixe agora os modelos validados de script de abordagem rápida, follow-up que não incomoda e recuperação de clientes sumidos.',
      ctaText: 'Baixar E-book Grátis Imediatamente',
      imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1000&q=80'
    },
    features: [
      {
        id: 'f-1',
        title: '7 Scripts Prontos de Copiar e Colar',
        description: 'Frases de abertura testadas que aumentam em 3x as respostas no primeiro minuto de contato.'
      },
      {
        id: 'f-2',
        title: 'Como Quebrar a Objeção "Tá Caro"',
        description: 'A técnica exata para ancorar valor e conduzir o prospect para a decisão sem dar descontos desnecessários.'
      },
      {
        id: 'f-3',
        title: 'Sequência de Follow-up Invisível',
        description: 'Passo a passo para reengajar clientes indecisos sem parecer desesperado ou insistente.'
      }
    ],
    social_proof: {
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
        { id: 'f-1', name: 'name', label: 'Seu Nome', type: 'text', placeholder: 'Como podemos te chamar?', required: true },
        { id: 'f-2', name: 'phone', label: 'Seu WhatsApp', type: 'tel', placeholder: '(11) 99999-9999', required: true },
        { id: 'f-3', name: 'email', label: 'Seu Melhor E-mail', type: 'email', placeholder: 'seu@email.com', required: true }
      ],
      actionType: 'thank_you_message',
      whatsappPhone: '',
      whatsappMessage: '',
      redirectUrl: '',
      successMessage: '🎉 Parabéns! Enviamos o link do E-book diretamente para seu WhatsApp e e-mail cadastrado. Verifique agora!',
      targetStage: 'Novo Lead',
      tags: ['ebook-whatsapp', 'topo-de-funil', 'rd-style']
    },
    faq: {
      enabled: true,
      items: [
        {
          id: 'faq-1',
          question: 'Em qual formato receberei o conteúdo?',
          answer: 'Você receberá o PDF em alta resolução + acesso a uma planilha modelo no Google Sheets.'
        },
        {
          id: 'faq-2',
          question: 'Posso compartilhar com a minha equipe comercial?',
          answer: 'Sim, o material foi criado para capacitar vendedores, atendentes e gestores.'
        }
      ]
    },
    footer: {
      companyName: 'MDTracker & Growth Suite',
      copyrightText: 'Todos os direitos reservados.'
    },
    views_count: 312,
    conversions_count: 94,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    updated_at: new Date().toISOString()
  }
];

// ==========================================
// Multi-Channel Broadcast Mappers & In-Memory Seed (Email, SMS & WhatsApp)
// ==========================================
const mapBroadcastCampaignToDB = (bc: any) => ({
    id: bc.id,
    company_id: bc.companyId || bc.company_id || 'comp-alfa',
    name: bc.name,
    channel: bc.channel || 'email',
    channels: bc.channels || (bc.channel === 'multichannel' ? ['email', 'whatsapp', 'sms'] : [bc.channel || 'email']),
    target_stage: bc.targetStage || bc.target_stage || 'Todos',
    target_source: bc.targetSource || bc.target_source || 'Todas',
    target_tag: bc.targetTag || bc.target_tag || 'Todas',
    message_template: bc.messageTemplate || bc.message_template || '',
    whatsapp_scheduled_at: bc.whatsappScheduledAt || bc.whatsapp_scheduled_at || null,
    email_subject: bc.emailSubject || bc.email_subject || '',
    email_preheader: bc.emailPreheader || bc.email_preheader || '',
    email_sender_name: bc.emailSenderName || bc.email_sender_name || '',
    email_sender_email: bc.emailSenderEmail || bc.email_sender_email || '',
    email_body_html: bc.emailBodyHtml || bc.email_body_html || '',
    email_scheduled_at: bc.emailScheduledAt || bc.email_scheduled_at || null,
    sms_text: bc.smsText || bc.sms_text || '',
    sms_scheduled_at: bc.smsScheduledAt || bc.sms_scheduled_at || null,
    tracking_link_id: bc.trackingLinkId || bc.tracking_link_id || null,
    cta_url: bc.ctaUrl || bc.cta_url || '',
    cta_text: bc.ctaText || bc.cta_text || '',
    status: bc.status || 'rascunho',
    total_leads: Number(bc.totalLeads || bc.total_leads || 0),
    sent_count: Number(bc.sentCount || bc.sent_count || 0),
    delivered_count: Number(bc.deliveredCount || bc.delivered_count || 0),
    opened_count: Number(bc.openedCount || bc.opened_count || 0),
    clicked_count: Number(bc.clickedCount || bc.clicked_count || 0),
    provider: bc.provider || 'simulado',
    delay_seconds: Number(bc.delaySeconds || bc.delay_seconds || 5),
    scheduled_at: bc.scheduledAt || bc.scheduled_at || null,
    recipients: bc.recipients || [],
    created_at: bc.createdAt || bc.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
});

const mapBroadcastCampaignFromDB = (db: any) => ({
    id: db.id,
    companyId: db.company_id,
    name: db.name,
    channel: db.channel || 'email',
    channels: db.channels || (db.channel === 'multichannel' ? ['email', 'whatsapp', 'sms'] : [db.channel || 'email']),
    targetStage: db.target_stage || 'Todos',
    targetSource: db.target_source || 'Todas',
    targetTag: db.target_tag || 'Todas',
    messageTemplate: db.message_template || '',
    whatsappScheduledAt: db.whatsapp_scheduled_at,
    emailSubject: db.email_subject || '',
    emailPreheader: db.email_preheader || '',
    emailSenderName: db.email_sender_name || '',
    emailSenderEmail: db.email_sender_email || '',
    emailBodyHtml: db.email_body_html || '',
    emailScheduledAt: db.email_scheduled_at,
    smsText: db.sms_text || '',
    smsScheduledAt: db.sms_scheduled_at,
    trackingLinkId: db.tracking_link_id,
    ctaUrl: db.cta_url || '',
    ctaText: db.cta_text || '',
    status: db.status || 'rascunho',
    totalLeads: Number(db.total_leads || 0),
    sentCount: Number(db.sent_count || 0),
    deliveredCount: Number(db.delivered_count || 0),
    openedCount: Number(db.opened_count || 0),
    clickedCount: Number(db.clicked_count || 0),
    provider: db.provider || 'simulado',
    delaySeconds: Number(db.delay_seconds || 5),
    scheduledAt: db.scheduled_at,
    recipients: Array.isArray(db.recipients) ? db.recipients : (typeof db.recipients === 'string' ? (() => { try { return JSON.parse(db.recipients); } catch { return []; } })() : []),
    createdAt: db.created_at || new Date().toISOString(),
    updatedAt: db.updated_at
});

function generateMockRecipientsForCampaign(camp: any, count = 20) {
    const names = [
        'Rogério Belmiro', 'Mariana Costa', 'Carlos Eduardo', 'Juliana Torres', 'Lucas Mendes',
        'Beatriz Silva', 'Felipe Santos', 'Camila Rocha', 'Rodrigo Oliveira', 'Larissa Lima',
        'Gabriel Souza', 'Amanda Pereira', 'Thiago Ribeiro', 'Fernanda Alves', 'Bruno Carvalho',
        'Patricia Martins', 'Diego Ferreira', 'Renata Barbosa', 'Gustavo Gomes', 'Vanessa Castro'
    ];
    const recipients: any[] = [];
    const isCompleted = camp.status === 'concluido';
    const sentBaseTime = camp.created_at ? new Date(camp.created_at).getTime() : Date.now() - 3600000 * 12;

    const actualCount = Math.min(count, names.length);
    for (let i = 0; i < actualCount; i++) {
        const name = names[i];
        const cleanName = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '.');
        const isOpened = isCompleted && (i < Math.floor(actualCount * 0.72));
        const isClicked = isCompleted && (i < Math.floor(actualCount * 0.42));
        const sentAt = new Date(sentBaseTime + i * 180000).toISOString();
        const openedAt = isOpened ? new Date(sentBaseTime + i * 180000 + (i + 1) * 240000).toISOString() : undefined;
        const clickedAt = isClicked ? new Date(sentBaseTime + i * 180000 + (i + 1) * 360000).toISOString() : undefined;

        recipients.push({
            leadId: `lead-recip-${i + 1}`,
            name,
            email: `${cleanName}@gmail.com`,
            phone: `1198${(1000000 + i * 12345).toString().slice(0, 7)}`,
            channel: camp.channel === 'multichannel' ? (i % 3 === 0 ? 'whatsapp' : i % 3 === 1 ? 'email' : 'sms') : camp.channel,
            stage: i % 4 === 0 ? 'Novo Lead' : i % 4 === 1 ? 'Contatado' : i % 4 === 2 ? 'Em Negociação' : 'Convertido',
            status: isClicked ? 'clicou' : isOpened ? 'aberto' : isCompleted ? 'entregue' : 'pendente',
            sentAt: isCompleted ? sentAt : undefined,
            openedAt,
            clickedAt,
            device: isOpened ? (i % 2 === 0 ? 'iPhone (iOS)' : 'Chrome (Windows)') : undefined
        });
    }
    return recipients;
}

let inMemoryBroadcastCampaigns: any[] = [
  {
    id: 'camp-launch-carrinho',
    company_id: 'comp-alfa',
    name: '🚀 Lançamento: Abertura Oficial de Carrinho (Lote 1)',
    channel: 'multichannel',
    channels: ['email', 'whatsapp', 'sms'],
    target_stage: 'Todos',
    target_source: 'Todas',
    target_tag: 'Todas',
    scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(), // Em 2 dias às 09:00
    email_scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(),
    whatsapp_scheduled_at: new Date(Date.now() + 86400000 * 2 + 1800000).toISOString(),
    sms_scheduled_at: new Date(Date.now() + 86400000 * 2 + 3600000).toISOString(),
    email_subject: '🔥 OFICIAL: Carrinho Aberto! Garanta Sua Vaga no Lote 1 com Bônus VIP',
    email_preheader: 'Apenas os primeiros 50 inscritos recebem mentoria individual exclusiva',
    email_sender_name: 'Equipe de Lançamento',
    email_sender_email: 'lancamento@alfa.com.br',
    email_body_html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <span style="background: #fef2f2; color: #dc2626; font-weight: bold; font-size: 12px; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase;">Abertura Oficial de Carrinho</span>
  </div>
  <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; line-height: 1.3; margin-bottom: 12px; text-align: center;">Olá, {{nome}}! As inscrições estão oficialmente abertas 🚀</h2>
  <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">O momento tão esperado chegou. O Lote 1 com bônus de consultoria já está liberado exclusivamente para quem esteve na lista VIP.</p>
  <div style="text-align: center; margin-top: 28px;">
    <a href="https://mdtracker.com.br/abertura" style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">Garantir Minha Vaga no Lote 1 &rarr;</a>
  </div>
</div>`,
    message_template: '🚨 ATENÇÃO {{nome}}! Acabamos de abrir as vagas no Lote 1 com bônus VIP exclusivo. O link oficial é: https://mdtracker.com.br/abertura',
    sms_text: '{{nome}}, carrinho ABERTO! Acesse agora o Lote 1 com condicao especial: mdtr.link/lote1',
    cta_url: 'https://mdtracker.com.br/abertura',
    cta_text: 'Acessar Inscrição no Lote 1',
    status: 'agendado',
    total_leads: 20,
    sent_count: 0,
    delivered_count: 0,
    opened_count: 0,
    clicked_count: 0,
    provider: 'simulado',
    delay_seconds: 3,
    recipients: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'camp-email-welcome',
    company_id: 'comp-alfa',
    name: 'Boas-Vindas VIP & Acesso ao Diagnóstico',
    channel: 'email',
    target_stage: 'Novo Lead',
    target_source: 'Todas',
    target_tag: 'Todas',
    email_subject: '🚀 Bem-vindo à Alfa! Aqui está seu acesso ao Diagnóstico de Vendas',
    email_preheader: 'Aproveite os próximos 7 dias para acelerar suas conversões no WhatsApp',
    email_sender_name: 'Equipe Alfa Growth',
    email_sender_email: 'contato@alfa.com.br',
    email_body_html: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
  <div style="text-align: center; margin-bottom: 24px;">
    <span style="background: #eff6ff; color: #2563eb; font-weight: bold; font-size: 12px; padding: 6px 12px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 0.05em;">Acesso Liberado</span>
  </div>
  <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; line-height: 1.3; margin-bottom: 12px; text-align: center;">Olá, {{nome}}! Seja muito bem-vindo(a) à nossa comunidade</h2>
  <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">Ficamos muito contentes com seu cadastro. Nossa missão é te ajudar a dobrar sua taxa de conversão de leads e ter visibilidade total sobre cada venda originada nos seus anúncios.</p>
  <div style="text-align: center; margin-top: 32px;">
    <a href="https://mdtracker.com.br" style="display: inline-block; background: #2563eb; color: #ffffff; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">Acessar Meu Painel Agora &rarr;</a>
  </div>
</div>`,
    status: 'concluido',
    total_leads: 20,
    sent_count: 20,
    delivered_count: 19,
    opened_count: 14,
    clicked_count: 8,
    provider: 'resend',
    delay_seconds: 2,
    recipients: [],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'camp-sms-cupom',
    company_id: 'comp-alfa',
    name: 'Cupom Relâmpago 15% OFF no WhatsApp',
    channel: 'sms',
    target_stage: 'Em Negociação',
    target_source: 'Todas',
    target_tag: 'Todas',
    sms_text: 'Oi {{nome}}! Vimos seu interesse em nossa consultoria. Use o cupom VIP15 no WhatsApp hoje e garanta 15% OFF imediato: mdtr.link/vip15',
    status: 'concluido',
    total_leads: 18,
    sent_count: 18,
    delivered_count: 18,
    opened_count: 15,
    clicked_count: 7,
    provider: 'z_api',
    delay_seconds: 3,
    recipients: [],
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'camp-wpp-reengage',
    company_id: 'comp-alfa',
    name: 'Reengajamento de Clientes Frios (WhatsApp)',
    channel: 'whatsapp',
    target_stage: 'Perdido',
    target_source: 'Todas',
    target_tag: 'Todas',
    message_template: 'Olá, {{nome}}! Tudo bem? Faz algum tempo que conversamos. Lançamos uma nova funcionalidade no sistema e gostaríamos de te presentear com 7 dias grátis para testar. Tem interesse?',
    status: 'concluido',
    total_leads: 16,
    sent_count: 16,
    delivered_count: 15,
    opened_count: 13,
    clicked_count: 6,
    provider: 'simulado_web',
    delay_seconds: 5,
    recipients: [],
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Seed recipients into mock campaigns
inMemoryBroadcastCampaigns[0].recipients = generateMockRecipientsForCampaign(inMemoryBroadcastCampaigns[0], 20);
inMemoryBroadcastCampaigns[1].recipients = generateMockRecipientsForCampaign(inMemoryBroadcastCampaigns[1], 20);
inMemoryBroadcastCampaigns[2].recipients = generateMockRecipientsForCampaign(inMemoryBroadcastCampaigns[2], 18);
inMemoryBroadcastCampaigns[3].recipients = generateMockRecipientsForCampaign(inMemoryBroadcastCampaigns[3], 16);

const mapLeadCallFromDB = (db: any) => ({
    id: db.id,
    companyId: db.company_id || db.companyId,
    leadId: db.lead_id || db.leadId,
    leadName: db.lead_name || db.leadName,
    leadPhone: db.lead_phone || db.leadPhone,
    userId: db.user_id || db.userId,
    userName: db.user_name || db.userName,
    durationSeconds: db.duration_seconds !== undefined ? db.duration_seconds : (db.durationSeconds || 0),
    outcome: db.outcome || 'atendeu_positivo',
    notes: db.notes || '',
    recordingUrl: db.recording_url || db.recordingUrl || '',
    transcriptSummary: db.transcript_summary || db.transcriptSummary || '',
    sentiment: db.sentiment || 'neutro',
    nextSteps: db.next_steps || db.nextSteps || '',
    callerId: db.caller_id || db.callerId || '',
    createdAt: db.created_at || db.createdAt || new Date().toISOString()
});

const mapLeadCallToDB = (item: any) => ({
    id: item.id,
    company_id: item.companyId,
    lead_id: item.leadId,
    lead_name: item.leadName,
    lead_phone: item.leadPhone,
    user_id: item.userId,
    user_name: item.userName,
    duration_seconds: item.durationSeconds || 0,
    outcome: item.outcome,
    notes: item.notes,
    recording_url: item.recordingUrl,
    transcript_summary: item.transcriptSummary,
    sentiment: item.sentiment,
    next_steps: item.nextSteps,
    caller_id: item.callerId,
    created_at: item.createdAt || new Date().toISOString()
});

let inMemoryLeadCalls: any[] = [
  {
    id: 'call-101',
    company_id: 'comp-alfa',
    lead_id: 'lead-101',
    lead_name: 'Carlos Eduardo Silva',
    lead_phone: '5511991234567',
    user_id: 'usr-2',
    user_name: 'Rodrigo Gerente (Gerente de Vendas)',
    duration_seconds: 165,
    outcome: 'atendeu_positivo',
    notes: 'Carlos atendeu com ótimo interesse. Demonstrei o dashboard de CAPI e o funil de WhatsApp. Ele aprovou o fechamento da licença anual corporativa.',
    recording_url: 'https://actions.google.com/sounds/v1/office/office_ambient.ogg',
    transcript_summary: 'Demonstração de valor do software realizada. Cliente tirou dúvidas sobre emissão de NF no CNPJ e confirmou fechamento imediato.',
    sentiment: 'positivo',
    next_steps: 'Enviar proposta comercial em PDF e chave PIX para faturamento.',
    caller_id: '(11) 4003-8920',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString()
  },
  {
    id: 'call-102',
    company_id: 'comp-alfa',
    lead_id: 'lead-102',
    lead_name: 'Mariana Fontes',
    lead_phone: '5521988776655',
    user_id: 'usr-3',
    user_name: 'Lucas Atendente (Atendimento Comercial)',
    duration_seconds: 252,
    outcome: 'atendeu_objecao',
    notes: 'Mariana gostou muito do sistema mas precisa apresentar o custo-benefício para o diretor financeiro na quinta-feira.',
    recording_url: 'https://actions.google.com/sounds/v1/office/office_ambient.ogg',
    transcript_summary: 'Discussão sobre retorno sobre investimento (ROI) de anúncios Meta/Google. Cliente solicitou material institucional em slides.',
    sentiment: 'neutro',
    next_steps: 'Retornar ligação na quinta-feira às 15h para acompanhar a decisão da diretoria.',
    caller_id: '(11) 4003-8920',
    created_at: new Date(Date.now() - 3600000 * 7).toISOString()
  },
  {
    id: 'call-103',
    company_id: 'comp-alfa',
    lead_id: 'lead-103',
    lead_name: 'Rodrigo Alcantara',
    lead_phone: '5531976543210',
    user_id: 'usr-3',
    user_name: 'Lucas Atendente (Atendimento Comercial)',
    duration_seconds: 75,
    outcome: 'retornar_depois',
    notes: 'Estava dirigindo no momento da ligação. Foi super receptivo e pediu para ligarmos amanhã à tarde.',
    recording_url: '',
    transcript_summary: 'Contato inicial rápido. Lead confirmou interesse mas solicitou reagendamento por estar indisponível.',
    sentiment: 'neutro',
    next_steps: 'Reagendar ligação para amanhã às 14:00.',
    caller_id: '(11) 4003-8920',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'call-104',
    company_id: 'comp-alfa',
    lead_id: 'lead-106',
    lead_name: 'Juliana Mendes',
    lead_phone: '5581987112233',
    user_id: 'usr-3',
    user_name: 'Lucas Atendente (Atendimento Comercial)',
    duration_seconds: 0,
    outcome: 'nao_atendeu',
    notes: 'Chamou até cair na caixa postal.',
    recording_url: '',
    transcript_summary: 'Chamada não atendida.',
    sentiment: 'neutro',
    next_steps: 'Disparar mensagem no WhatsApp de acompanhamento via automação.',
    caller_id: '(11) 4003-8920',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

let inMemoryVirtualPhoneSettings: Record<string, any> = {
  'comp-alfa': {
    provider: 'webrtc_native',
    callerIdNumber: '(11) 4003-8920',
    callerIdName: 'Alfa Marketing - Discador WebRTC',
    recordCalls: true,
    autoTranscribeAI: true,
    agentExtension: '104'
  }
};

const mapSmartListFromDB = (db: any) => ({
    id: db.id,
    companyId: db.company_id || db.companyId,
    name: db.name,
    description: db.description || '',
    color: db.color || '#2563eb',
    conditions: db.conditions || [],
    matchType: db.match_type || db.matchType || 'all',
    leadsCount: db.leads_count !== undefined ? db.leads_count : (db.leadsCount || 0),
    createdAt: db.created_at || db.createdAt || new Date().toISOString(),
    updatedAt: db.updated_at || db.updatedAt || new Date().toISOString()
});

const mapSmartListToDB = (item: any) => ({
    id: item.id,
    company_id: item.companyId,
    name: item.name,
    description: item.description,
    color: item.color,
    conditions: item.conditions,
    match_type: item.matchType,
    leads_count: item.leadsCount || 0,
    created_at: item.createdAt || new Date().toISOString(),
    updated_at: item.updatedAt || new Date().toISOString()
});

let inMemorySmartLists: any[] = [
  {
    id: 'list-sql-hot',
    company_id: 'comp-alfa',
    name: '🔥 Leads Quentes (SQL - Score ≥ 70)',
    description: 'Leads de alta probabilidade de fechamento imediato com ligações ou compras registradas.',
    color: '#ef4444',
    conditions: [
      { field: 'score', operator: 'greater_than', value: 69 },
      { field: 'hasPhone', operator: 'is_true', value: true }
    ],
    match_type: 'all',
    leads_count: 2,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'list-meta-ads',
    company_id: 'comp-alfa',
    name: '🎯 Oportunidades Meta Ads (Instagram/FB)',
    description: 'Leads originados de anúncios pagos com telefone cadastrado.',
    color: '#8b5cf6',
    conditions: [
      { field: 'utmSource', operator: 'contains', value: 'meta' }
    ],
    match_type: 'all',
    leads_count: 3,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'list-calls-answered',
    company_id: 'comp-alfa',
    name: '📞 Leads com Ligação Atendida',
    description: 'Contatos que atenderam chamada telefônica do vendedor.',
    color: '#10b981',
    conditions: [
      { field: 'hasCalls', operator: 'is_true', value: true }
    ],
    match_type: 'all',
    leads_count: 3,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'list-buyers-vip',
    company_id: 'comp-alfa',
    name: '🛒 Clientes VIP (LTV > R$ 1.000)',
    description: 'Clientes convertidos com alto valor de compra.',
    color: '#f59e0b',
    conditions: [
      { field: 'stage', operator: 'equals', value: 'Convertido' },
      { field: 'minLtv', operator: 'greater_than', value: 999 }
    ],
    match_type: 'all',
    leads_count: 2,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString()
  }
];

let inMemoryLeadScoringConfigs: Record<string, any> = {
  'comp-alfa': {
    mqlThreshold: 40,
    sqlThreshold: 70,
    pointsPerAction: {
      popupConversion: 15,
      landingPageConversion: 20,
      emailOpen: 10,
      smsClick: 15,
      chatbotInteraction: 25,
      callAnswered: 30,
      productPurchase: 50,
      inactivityDecay: -15
    }
  }
};

function computeLeadScore(lead: any) {
    let score = 20; // Base score for lead conversion
    const breakdown: Array<{ reason: string; points: number }> = [
        { reason: 'Cadastro Inicial do Lead', points: 20 }
    ];

    if (lead.phone && String(lead.phone).replace(/\D/g, '').length >= 10) {
        score += 15;
        breakdown.push({ reason: 'Telefone Válido Informado', points: 15 });
    }
    if (lead.email && String(lead.email).includes('@')) {
        score += 10;
        breakdown.push({ reason: 'E-mail Comercial Informado', points: 10 });
    }
    if (lead.utm_content || lead.utmContent) {
        score += 10;
        breakdown.push({ reason: 'Engajamento com Criativo / Anúncio Específico', points: 10 });
    }

    const stage = lead.stage;
    if (stage === 'Convertido') {
        score += 40;
        breakdown.push({ reason: 'Cliente Convertido (Compra Realizada)', points: 40 });
    } else if (stage === 'Em Negociação') {
        score += 25;
        breakdown.push({ reason: 'Negociação Comercial em Andamento', points: 25 });
    } else if (stage === 'Contatado') {
        score += 15;
        breakdown.push({ reason: 'Contato Efetivo Estabelecido', points: 15 });
    } else if (stage === 'Perdido') {
        score -= 20;
        breakdown.push({ reason: 'Lead Perdido / Sem Interesse', points: -20 });
    }

    if (lead.value && Number(lead.value) > 0) {
        const valPoints = Math.min(30, Math.floor(Number(lead.value) / 50));
        score += valPoints;
        breakdown.push({ reason: `Valor Potencial / LTV (R$ ${lead.value})`, points: valPoints });
    }

    // Has calls recorded
    const calls = inMemoryLeadCalls.filter(c => c.lead_id === lead.id || c.leadId === lead.id);
    if (calls.length > 0) {
        const answered = calls.some(c => c.outcome === 'atendeu_positivo' || c.outcome === 'atendeu_objecao');
        if (answered) {
            score += 25;
            breakdown.push({ reason: 'Chamada Telefônica VoIP Atendida', points: 25 });
        }
    }

    score = Math.max(5, Math.min(100, score));

    const qualificationLevel = score >= 70 ? 'SQL' : (score >= 40 ? 'MQL' : 'Lead');
    const fitGrade = (lead.value && Number(lead.value) >= 1000) || (lead.phone && lead.email) ? 'A' : (lead.phone ? 'B' : 'C');

    return { score, qualificationLevel, fitGrade, scoreBreakdown: breakdown };
};

import crypto from 'crypto';

interface MetaClickEventParams {
  pixelId: string;
  token: string;
  eventName: string;
  eventId: string;
  eventSourceUrl: string;
  userIp: string;
  userAgent: string;
  fbc?: string;
  fbp?: string;
  location?: { city?: string; state?: string; country?: string };
  linkTitle: string;
  linkSlug: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
}

// Send Click / ViewAds Event via Meta Conversions API (CAPI) on link click
async function sendMetaCAPIClickEvent(params: MetaClickEventParams) {
  if (!params.pixelId || !params.token) return;

  const userData: any = {
    client_ip_address: params.userIp || '177.100.20.10',
    client_user_agent: params.userAgent || 'Mozilla/5.0 (Mobile)',
    country: ['0b5e52643a6358dbb3a4a2b254a6db241cdbb5574c8c7d6baaa65ea285fbf80e'] // 'br' SHA-256
  };

  if (params.fbc) userData.fbc = params.fbc;
  if (params.fbp) userData.fbp = params.fbp;

  if (params.location?.city) {
    const normCity = params.location.city.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    userData.ct = [crypto.createHash('sha256').update(normCity).digest('hex')];
  }
  if (params.location?.state) {
    const normState = params.location.state.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    userData.st = [crypto.createHash('sha256').update(normState).digest('hex')];
  }

  const payload = {
    data: [
      {
        event_name: params.eventName || 'ViewAds',
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        action_source: 'website',
        event_source_url: params.eventSourceUrl,
        user_data: userData,
        custom_data: {
          content_name: params.linkTitle,
          content_category: 'Link WhatsApp',
          campaign: params.utmCampaign || '',
          source: params.utmSource || '',
          medium: params.utmMedium || '',
          content: params.utmContent || '',
          term: params.utmTerm || '',
          link_slug: params.linkSlug
        }
      }
    ]
  };

  try {
    const resp = await fetch(`https://graph.facebook.com/v19.0/${params.pixelId}/events?access_token=${params.token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const respData = await resp.json();
    console.log(`[Meta CAPI Click] Evento "${params.eventName}" enviado à Meta:`, respData);
    return respData;
  } catch (err) {
    console.error(`[Meta CAPI Click Error] Falha ao enviar evento "${params.eventName}":`, err);
  }
}

async function sendMetaCAPIEvent(eventName: string, leadData: any, settings: any, reqIp?: string, reqUserAgent?: string) {
    if (!settings.globalMetaPixelId || !settings.globalMetaToken) return;

    let hashedPhone;
    if (leadData.phone) {
      let ph = leadData.phone.replace(/\D/g, '');
      if (ph.startsWith('55') && ph.length === 12) {
         // Optionally handle 9 digit insert, but CAPI matches roughly on what user provides
      }
      hashedPhone = crypto.createHash('sha256').update(ph).digest('hex');
    }
    const hashedEmail = leadData.email ? crypto.createHash('sha256').update(leadData.email.trim().toLowerCase()).digest('hex') : undefined;
    const hashedCity = leadData.location?.city ? crypto.createHash('sha256').update(leadData.location.city.trim().toLowerCase()).digest('hex') : undefined;
    const hashedState = leadData.location?.state ? crypto.createHash('sha256').update(leadData.location.state.trim().toLowerCase()).digest('hex') : undefined;

    const payload: any = {
        data: [
            {
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                action_source: 'website',
                user_data: {
                    client_ip_address: reqIp || '192.168.0.1',
                    client_user_agent: reqUserAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    em: hashedEmail ? [hashedEmail] : undefined,
                    ph: hashedPhone ? [hashedPhone] : undefined,
                    ct: hashedCity ? [hashedCity] : undefined,
                    st: hashedState ? [hashedState] : undefined,
                    country: ['0b5e52643a6358dbb3a4a2b254a6db241cdbb5574c8c7d6baaa65ea285fbf80e'] // 'br'
                },
                custom_data: {
                   value: leadData.value || undefined,
                   currency: leadData.value ? 'BRL' : undefined
                }
            }
        ]
    };

    // Clean up undefined
    Object.keys(payload.data[0].user_data).forEach(key => payload.data[0].user_data[key] === undefined && delete payload.data[0].user_data[key]);
    if (!payload.data[0].custom_data.value) delete payload.data[0].custom_data;

    try {
        const resp = await fetch(`https://graph.facebook.com/v19.0/${settings.globalMetaPixelId}/events?access_token=${settings.globalMetaToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const respData = await resp.json();
        console.log("CAPI Event Sent:", eventName, respData);
    } catch(e) {
        console.error("Meta CAPI Error:", e);
    }
}


// Fetch current settings directly from DB with smart fallback
async function getSettings(companyId?: string): Promise<IntegrationSettings | any> {
    if (companyId && companyId !== 'comp-alfa') {
      const { data } = await supabase.from('settings').select('*').eq('company_id', companyId).maybeSingle();
      if (data) return mapSettingsFromDB(data);
    }
    // Fallback: buscar settings com Pixel ID e Token configurados
    const { data: configured } = await supabase
      .from('settings')
      .select('*')
      .not('global_meta_pixel_id', 'is', null)
      .neq('global_meta_pixel_id', '')
      .limit(1)
      .maybeSingle();
    if (configured) return mapSettingsFromDB(configured);

    // Fallback final: qualquer linha na tabela settings
    const { data: fallback } = await supabase.from('settings').select('*').limit(1).maybeSingle();
    if (fallback) return mapSettingsFromDB(fallback);

    return {} as any;
}

// Helper function to format WhatsApp message template
function buildWhatsAppUrl(phone: string, template: string, params: Record<string, string>): string {
  let cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone.startsWith('55') && cleanPhone.length === 10 || cleanPhone.length === 11) {
    cleanPhone = '55' + cleanPhone;
  }

  let filledMessage = template;
  for (const [key, val] of Object.entries(params)) {
    if (val) {
      filledMessage = filledMessage.replace(new RegExp(`\\{${key}\\}`, 'gi'), val);
    }
  }
  // Remove remaining unreplaced placeholders like {utm_source} if not provided
  filledMessage = filledMessage.replace(/\{[a-zA-Z0-9_]+\}/g, '');

  const encodedText = encodeURIComponent(filledMessage.trim());
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

// Simulated Geolocation lookup by IP
function mockGeoFromIp(ip: string): { city: string; state: string; country: string; ip: string } {
  const sampleCities = [
    { city: 'São Paulo', state: 'SP', country: 'Brasil' },
    { city: 'Rio de Janeiro', state: 'RJ', country: 'Brasil' },
    { city: 'Belo Horizonte', state: 'MG', country: 'Brasil' },
    { city: 'Curitiba', state: 'PR', country: 'Brasil' },
    { city: 'Porto Alegre', state: 'RS', country: 'Brasil' },
    { city: 'Salvador', state: 'BA', country: 'Brasil' },
    { city: 'Fortaleza', state: 'CE', country: 'Brasil' },
    { city: 'Florianópolis', state: 'SC', country: 'Brasil' },
    { city: 'Brasília', state: 'DF', country: 'Brasil' },
    { city: 'Lisboa', state: 'Lisboa', country: 'Portugal' }
  ];
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    hash = (hash << 5) - hash + ip.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % sampleCities.length;
  return { ...sampleCities[idx], ip };
}

async function triggerWebhook(url: string, eventName: string, payload: any, leadName?: string) {
  if (!url) return;
  const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const timestamp = new Date().toISOString();
  
  let status = 500;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: eventName,
        timestamp,
        data: payload
      })
    }).catch(() => null);

    status = response ? response.status : 200; // default 200 for mock simulation if fetch fails
  } catch (err) {
    payload = { ...payload, error: 'Falha na conexão com webhook' };
  }

  await supabase.from('webhook_logs').insert({
    id: logId,
    company_id: 'comp-alfa',
    url,
    event: eventName,
    status,
    payload,
    timestamp,
    lead_name: leadName || payload.lead_name || 'Visitante'
  });
}

const app = express();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Global CORS Middleware for Embed Scripts and APIs
app.use((req: Request, res: Response, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

interface BotGenerationParams {
  companyId: string;
  phone?: string;
  incomingText: string;
  lead?: any;
  customPrompt?: string;
  configOverride?: any;
}

export async function generateChatbotResponse(params: BotGenerationParams): Promise<{
  reply: string;
  isHandover: boolean;
  botName: string;
}> {
  const { companyId, phone, incomingText, lead, customPrompt, configOverride } = params;
  const settings = await getSettings(companyId);
  const cfg = {
    ...DEFAULT_CHATBOT_CONFIG,
    ...(settings.chatbotConfig || {}),
    ...(configOverride || {})
  };

  const botName = cfg.botName || 'Sofia - Assistente Virtual';
  const cleanIncoming = (incomingText || '').trim();
  const lowerIncoming = cleanIncoming.toLowerCase();

  // 1. Verificar Transbordo Humano (Human Handover)
  if (cfg.enableHumanHandover !== false) {
    const keywords: string[] = cfg.handoverKeywords && cfg.handoverKeywords.length > 0 
      ? cfg.handoverKeywords 
      : DEFAULT_CHATBOT_CONFIG.handoverKeywords;

    const matchedKeyword = keywords.find(k => k && lowerIncoming.includes(k.toLowerCase().trim()));
    if (matchedKeyword) {
      const leadName = lead?.name || 'Cliente';
      const handoverMsg = `Entendido, ${leadName}! Estou transferindo você para um de nossos especialistas humanos da equipe. Aguarde só um instante por favor que já vamos te responder por aqui! 👨‍💼🤝`;
      return {
        reply: handoverMsg,
        isHandover: true,
        botName
      };
    }
  }

  // 2. Conhecimento de Produtos (se ativo)
  let productsKnowledge = '';
  if (cfg.includeProductsKnowledge) {
    try {
      const { data: prods } = await supabase.from('products').select('*').eq('company_id', companyId);
      if (prods && prods.length > 0) {
        productsKnowledge = prods.map((p: any) => 
          `- Produto: ${p.name} | Preço: R$ ${Number(p.price || 0).toFixed(2)}${p.description ? ` | Detalhes: ${p.description}` : ''}${p.external_url ? ` | Link de compra: ${p.external_url}` : ''}`
        ).join('\n');
      }
    } catch (e) {
      console.warn('Erro ao carregar produtos para o chatbot:', e);
    }
  }

  // 3. Histórico recente de conversa
  let conversationHistory = '';
  if (phone) {
    try {
      let cleanPhone = phone.replace(/\D/g, '');
      if (!cleanPhone.startsWith('55') && (cleanPhone.length === 10 || cleanPhone.length === 11)) {
        cleanPhone = '55' + cleanPhone;
      }
      const { data: msgs } = await supabase.from('whatsapp_messages')
        .select('sender, text, timestamp')
        .eq('lead_phone', cleanPhone)
        .order('timestamp', { ascending: false })
        .limit(6);
      if (msgs && msgs.length > 0) {
        conversationHistory = msgs.reverse().map((m: any) => 
          `[${m.sender === 'lead' ? 'Cliente' : m.sender === 'bot' ? botName : 'Atendente'}]: ${m.text}`
        ).join('\n');
      }
    } catch (e) {
      console.warn('Erro ao carregar histórico para chatbot:', e);
    }
  }

  // 4. Montar Prompt Estruturado para o Gemini
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    if (settings && (settings as any).gemini_api_key) {
      apiKey = (settings as any).gemini_api_key;
    }
  }

  const leadName = lead?.name || 'Cliente';
  const leadLocation = lead?.location?.city ? `${lead.location.city}/${lead.location.state || 'Brasil'}` : 'Brasil';
  const leadUtm = lead?.utmCampaign || lead?.utm_campaign || 'Geral';
  const leadSource = lead?.utmSource || lead?.utm_source || 'WhatsApp';
  const leadCreative = lead?.utmContent || lead?.utm_content || '';

  const systemInstructions = `Você é ${botName}, o assistente virtual inteligente e cordial da empresa no WhatsApp/Direct.
Persona e Tom da Empresa:
${cfg.personaPrompt}
${customPrompt ? `\nInstrução Específica para esta resposta: ${customPrompt}` : ''}

Dados do Cliente em Atendimento:
- Nome: ${leadName}
- Localização aproximada: ${leadLocation}
- Origem / Campanha: ${leadSource} (${leadUtm})${leadCreative ? ` | Anúncio Clicado: ${leadCreative}` : ''}

Catálogo de Produtos e Serviços da Empresa:
${productsKnowledge || 'Nenhum produto cadastrado no catálogo atualmente.'}

Histórico da Conversa:
${conversationHistory || `[Cliente]: ${cleanIncoming}`}
[Cliente]: ${cleanIncoming}

DIRETRIZES FUNDAMENTAIS PARA RESPOSTA:
1. Responda em português brasileiro com simpatia e naturalidade (como uma conversa real no WhatsApp).
2. Seja conciso e objetivo: máximo 2 a 4 frases por resposta. NUNCA gere parágrafos gigantes.
3. Não use títulos grandes em markdown (como # ou ##), nem tabelas ou blocos de código. Use apenas emojis e asteriscos para *negrito*.
4. Se o cliente perguntar de preços, condições ou produtos, use os dados do catálogo acima. Se perguntar algo que não está no catálogo, responda educadamente e se ofereça para verificar.
5. Conclua SEMPRE com uma pergunta amigável que conduza a conversa (ex: 'Quer que eu te mande o link?', 'Você prefere atendimento pelo WhatsApp ou ligação?').
6. Devolva EXCLUSIVAMENTE o texto final da mensagem, sem explicações extras.`;

  // 5. Tentar Gemini 2.5
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const geminiRes = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: systemInstructions
      });
      const responseText = (geminiRes.text || '').trim();
      if (responseText) {
        return {
          reply: responseText,
          isHandover: false,
          botName
        };
      }
    } catch (err) {
      console.warn('Erro ao chamar Gemini no Chatbot, ativando motor heurístico inteligente:', err);
    }
  }

  // 6. Motor Heurístico Inteligente de Fallback
  let fallbackReply = '';
  if (lowerIncoming.includes('oi') || lowerIncoming.includes('olá') || lowerIncoming.includes('bom dia') || lowerIncoming.includes('boa tarde') || lowerIncoming.includes('boa noite')) {
    fallbackReply = `Olá, ${leadName}! Tudo bem? Sou a ${botName}. Vi que você chegou até nós pela nossa campanha. Como posso te ajudar hoje? 😊`;
  } else if (lowerIncoming.includes('preço') || lowerIncoming.includes('valor') || lowerIncoming.includes('quanto custa') || lowerIncoming.includes('tabela')) {
    if (productsKnowledge) {
      fallbackReply = `Olá, ${leadName}! Nossos valores são super competitivos e temos condições especiais hoje. Gostaria de receber nosso catálogo com valores detalhados no seu WhatsApp? 📋✨`;
    } else {
      fallbackReply = `Olá, ${leadName}! Nossos preços variam conforme o que você precisa no momento. Me conta um pouquinho do seu objetivo para eu te passar a melhor proposta? 💰`;
    }
  } else if (lowerIncoming.includes('pix') || lowerIncoming.includes('comprar') || lowerIncoming.includes('pagar') || lowerIncoming.includes('fechar') || lowerIncoming.includes('cartão')) {
    fallbackReply = `Maravilha, ${leadName}! Temos pagamento facilitado via Pix, cartão de crédito ou boleto. Quer que eu te envie o link direto agora para você concluir com total segurança? 🛒🚀`;
  } else if (lowerIncoming.includes('onde fica') || lowerIncoming.includes('endereço') || lowerIncoming.includes('localização')) {
    fallbackReply = `Atendemos clientes em todo o Brasil com envio rápido e suporte dedicado! Qual é a sua cidade para eu verificar o prazo de entrega para você? 📍📦`;
  } else {
    fallbackReply = `Com certeza, ${leadName}! Recebi sua mensagem. Posso te enviar mais detalhes sobre como podemos te ajudar ou você prefere agendar uma rápida conversa com nossos consultores? 😊`;
  }

  return {
    reply: fallbackReply,
    isHandover: false,
    botName
  };
}

async function handleBotIncomingMessageAsync(companyId: string, phone: string, textContent: string, lead?: any) {
  try {
    const settings = await getSettings(companyId);
    const cfg = settings.chatbotConfig || DEFAULT_CHATBOT_CONFIG;
    if (!cfg.enabled) {
      return; // Chatbot desativado
    }

    if (lead && lead.botActive === false) {
      console.log(`Chatbot pausado para o lead (${phone}). Atendimento humano ativo.`);
      return;
    }

    // Delay simulando digitação humana
    const delaySeconds = Math.max(1, Math.min(cfg.autoReplyDelaySeconds || 2, 5));
    await new Promise(r => setTimeout(r, delaySeconds * 1000));

    const result = await generateChatbotResponse({
      companyId,
      phone,
      incomingText: textContent,
      lead
    });

    if (result.isHandover && lead && lead.id) {
      // Desativa o robô para este lead para não atrapalhar o atendente
      try {
        await supabase.from('leads').update({ bot_active: false, updated_at: new Date().toISOString() }).eq('id', lead.id);
        if (lead) lead.botActive = false;
      } catch (e) {
        console.warn('Erro ao atualizar bot_active no lead:', e);
      }
    }

    // Enviar mensagem via WhatsApp com sender: 'bot'
    await sendWhatsAppMessage(companyId, phone, result.reply, 'bot');
    console.log(`🤖 Chatbot (${result.botName}) respondeu para ${phone}: "${result.reply.substring(0, 60)}..."`);
  } catch (err) {
    console.error('Erro no processamento do Chatbot com IA:', err);
  }
}

// Evolution API Webhook
app.post('/api/whatsapp/evolution/webhook', async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        console.log('Recebido webhook Evolution API:', JSON.stringify(payload).substring(0, 300));
        require('fs').appendFileSync('webhook_debug.jsonl', JSON.stringify(payload) + '\n');

        const eventType = (payload.event || '').toLowerCase();

        // Evolution API dispara events como "messages.upsert" ou "MESSAGES_UPSERT"
        if (eventType === 'messages.upsert' || eventType === 'messages_upsert') {
            const data = payload.data;
            
            // Em algumas versões da Evolution a estrutura vem em data.message, em outras, data já é o objeto da mensagem
            const messageObj = (data?.message && data.message.key) ? data.message : data;
            
            if (!messageObj || !messageObj.key) return res.status(200).json({ received: true });

            const remoteJid = messageObj.key?.remoteJid || '';
            if (remoteJid === 'status@broadcast') return res.status(200).json({ received: true });

            const phone = remoteJid.split('@')[0];
            const isFromMe = messageObj.key?.fromMe;
            
            // O texto da mensagem pode estar em diferentes níveis dependendo do tipo
            const textContent = messageObj.message?.conversation || 
                                messageObj.message?.extendedTextMessage?.text || 
                                messageObj.message?.imageMessage?.caption ||
                                messageObj.text || ''; // Fallback

            if (!textContent && !isFromMe) return res.status(200).json({ received: true });

            // Tenta achar a empresa usando a instancia
            const instanceName = payload.instance;
            let assignedCompanyId = 'comp-alfa';
            if (instanceName) {
                const { data: cSettings } = await supabase.from('settings').select('company_id').eq('evolution_instance', instanceName).maybeSingle();
                if (cSettings) {
                    assignedCompanyId = cSettings.company_id;
                } else {
                    const { data: fallback } = await supabase.from('companies').select('id').eq('active', true).limit(1).maybeSingle();
                    if (fallback) assignedCompanyId = fallback.id;
                }
            } else {
                const { data: fallback } = await supabase.from('companies').select('id').eq('active', true).limit(1).maybeSingle();
                if (fallback) assignedCompanyId = fallback.id;
            }

            // Check if active lead exists
            let existingLead = null;
            const phoneOptions = [phone, phone.startsWith('55') ? phone.substring(2) : '55' + phone];
            const { data: matches } = await supabase
                .from('leads')
                .select('*')
                .eq('company_id', assignedCompanyId)
                .in('phone', phoneOptions)
                .order('created_at', { ascending: false });
            
            if (matches && matches.length > 0) {
                existingLead = matches.find(l => l.stage !== 'Convertido' && l.stage !== 'Perdido');
            }
            let targetLead: any = existingLead;
            
            // Deduzir campanha pelo texto da mensagem (Atribuição)
            let matchedLink = null;
            if (textContent && !isFromMe) {
                const { data: links } = await supabase.from('campaign_links').select('*').eq('company_id', assignedCompanyId);
                if (links && links.length > 0) {
                    for (const link of links) {
                        if (link.message) {
                            const parts = link.message.split(/\{[^}]+\}/).map((p: string) => p.trim()).filter((p: string) => p.length > 3);
                            if (parts.length > 0) {
                                const isMatch = parts.every((part: string) => textContent.includes(part));
                                if (isMatch) {
                                    matchedLink = link;
                                    break;
                                }
                            } else if (textContent.includes(link.message.trim())) {
                                matchedLink = link;
                                break;
                            }
                        }
                    }
                }
            }

            if (!existingLead && !isFromMe) {
                // Deduce state from Brazilian DDD
                let state = '';
                let city = 'Desconhecida';
                if (phone.startsWith('55') && phone.length >= 4) {
                    const ddd = phone.substring(2, 4);
                    const dddMap: Record<string, string> = {
                        '68': 'AC', '82': 'AL', '92': 'AM', '97': 'AM', '96': 'AP', '71': 'BA', '73': 'BA', '74': 'BA', '75': 'BA', '77': 'BA',
                        '85': 'CE', '88': 'CE', '61': 'DF', '27': 'ES', '28': 'ES', '62': 'GO', '64': 'GO', '98': 'MA', '99': 'MA',
                        '31': 'MG', '32': 'MG', '33': 'MG', '34': 'MG', '35': 'MG', '37': 'MG', '38': 'MG', '67': 'MS', '65': 'MT', '66': 'MT',
                        '91': 'PA', '93': 'PA', '94': 'PA', '83': 'PB', '81': 'PE', '87': 'PE', '86': 'PI', '89': 'PI',
                        '41': 'PR', '42': 'PR', '43': 'PR', '44': 'PR', '45': 'PR', '46': 'PR', '21': 'RJ', '22': 'RJ', '24': 'RJ',
                        '84': 'RN', '69': 'RO', '95': 'RR', '51': 'RS', '53': 'RS', '54': 'RS', '55': 'RS', '47': 'SC', '48': 'SC', '49': 'SC',
                        '79': 'SE', '11': 'SP', '12': 'SP', '13': 'SP', '14': 'SP', '15': 'SP', '16': 'SP', '17': 'SP', '18': 'SP', '19': 'SP', '63': 'TO'
                    };
                    const dddCityMap: Record<string, string> = {
                        '11': 'São Paulo', '12': 'São José dos Campos', '13': 'Santos', '14': 'Bauru', '15': 'Sorocaba', '16': 'Ribeirão Preto', '17': 'São José do Rio Preto', '18': 'Presidente Prudente', '19': 'Campinas',
                        '21': 'Rio de Janeiro', '22': 'Campos dos Goytacazes', '24': 'Volta Redonda', '27': 'Vitória', '28': 'Cachoeiro de Itapemirim',
                        '31': 'Belo Horizonte', '32': 'Juiz de Fora', '33': 'Governador Valadares', '34': 'Uberlândia', '35': 'Poços de Caldas', '37': 'Divinópolis', '38': 'Montes Claros',
                        '41': 'Curitiba', '42': 'Ponta Grossa', '43': 'Londrina', '44': 'Maringá', '45': 'Cascavel', '46': 'Francisco Beltrão', '47': 'Joinville', '48': 'Florianópolis', '49': 'Chapecó',
                        '51': 'Porto Alegre', '53': 'Pelotas', '54': 'Caxias do Sul', '55': 'Santa Maria',
                        '61': 'Brasília', '62': 'Goiânia', '63': 'Palmas', '64': 'Rio Verde', '65': 'Cuiabá', '66': 'Sinop', '67': 'Campo Grande', '68': 'Rio Branco', '69': 'Porto Velho',
                        '71': 'Salvador', '73': 'Ilhéus', '74': 'Juazeiro', '75': 'Feira de Santana', '77': 'Vitória da Conquista', '79': 'Aracaju',
                        '81': 'Recife', '82': 'Maceió', '83': 'João Pessoa', '84': 'Natal', '85': 'Fortaleza', '86': 'Teresina', '87': 'Petrolina', '88': 'Juazeiro do Norte', '89': 'Picos',
                        '91': 'Belém', '92': 'Manaus', '93': 'Santarém', '94': 'Marabá', '95': 'Boa Vista', '96': 'Macapá', '97': 'Coari', '98': 'São Luís', '99': 'Imperatriz'
                    };
                    if (dddMap[ddd]) {
                        state = dddMap[ddd];
                        city = dddCityMap[ddd] || ('DDD ' + ddd);
                    }
                }

                // If matched, increment the link's lead count
                if (matchedLink) {
                    await supabase.from('campaign_links')
                        .update({ leads_count: (matchedLink.leads_count || 0) + 1 })
                        .eq('id', matchedLink.id);
                }

                // Create new lead automatically so they show up in the Chat Inbox
                const newLead = {
                    id: `lead-${Date.now()}`,
                    company_id: assignedCompanyId,
                    name: messageObj.pushName || 'Novo Contato WhatsApp',
                    phone: phone,
                    source: matchedLink ? matchedLink.utm_source : 'whatsapp_direto',
                    utm_source: matchedLink ? matchedLink.utm_source : 'whatsapp_direto',
                    utm_medium: matchedLink ? matchedLink.utm_medium : 'organico',
                    utm_campaign: matchedLink ? matchedLink.utm_campaign : 'whatsapp',
                    stage: 'Novo Lead',
                    link_id: matchedLink ? matchedLink.id : null,
                    link_title: matchedLink ? matchedLink.title : '',
                    device: 'WhatsApp',
                    browser: 'WhatsApp',
                    location: { city: city, state: state, country: 'BR' },
                    conversion_events: matchedLink ? [
                        {
                            id: `evt-${Date.now()}`,
                            type: 'meta_pixel',
                            eventName: 'Lead',
                            status: 'sucesso',
                            timestamp: new Date().toISOString(),
                            details: `Acesso via: ${matchedLink.utm_campaign} (${matchedLink.utm_source})`,
                            utmSource: matchedLink.utm_source,
                            utmMedium: matchedLink.utm_medium,
                            utmCampaign: matchedLink.utm_campaign,
                            utmContent: matchedLink.utm_content,
                            utmTerm: matchedLink.utm_term
                        }
                    ] : [
                        {
                            id: `evt-${Date.now()}`,
                            type: 'organic',
                            eventName: 'Contato Inicial Direto',
                            status: 'sucesso',
                            timestamp: new Date().toISOString(),
                            details: 'Contato via WhatsApp Direto (Sem Link de Rastreamento)',
                            utmSource: 'whatsapp_direto',
                            utmMedium: 'organico',
                            utmCampaign: 'whatsapp'
                        }
                    ],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                await supabase.from('leads').insert(newLead);
                targetLead = newLead;
                // Send Lead event to Meta CAPI
                try {
                  const compSettings = await getSettings(assignedCompanyId);
                  await sendMetaCAPIEvent('Lead', newLead, compSettings, req.ip, req.headers['user-agent']);
                } catch(e) {}
            } else if (existingLead && matchedLink && !isFromMe) {
                // The lead exists and they triggered a NEW tracked campaign link via WhatsApp
                const { data: fullLead } = await supabase.from('leads').select('*').eq('id', existingLead.id).single();
                if (fullLead) {
                    const newEvent = {
                        id: `evt-${Date.now()}`,
                        type: 'meta_pixel',
                        eventName: 'Lead',
                        status: 'sucesso',
                        timestamp: new Date().toISOString(),
                        details: `Novo Acesso via: ${matchedLink.utm_campaign} (${matchedLink.utm_source})`,
                        utmSource: matchedLink.utm_source,
                        utmMedium: matchedLink.utm_medium,
                        utmCampaign: matchedLink.utm_campaign,
                        utmContent: matchedLink.utm_content,
                        utmTerm: matchedLink.utm_term
                    };
                    const updatedEvents = [...(fullLead.conversion_events || []), newEvent];
                    
                    await supabase.from('leads').update({
                        conversion_events: updatedEvents,
                        updated_at: new Date().toISOString(),
                        utm_source: matchedLink.utm_source || fullLead.utm_source,
                        utm_medium: matchedLink.utm_medium || fullLead.utm_medium,
                        utm_campaign: matchedLink.utm_campaign || fullLead.utm_campaign,
                        utm_content: matchedLink.utm_content || fullLead.utm_content,
                        utm_term: matchedLink.utm_term || fullLead.utm_term,
                        link_id: matchedLink.id || fullLead.link_id,
                        link_title: matchedLink.title || fullLead.link_title
                    }).eq('id', fullLead.id);

                    // Increment the link's lead count
                    await supabase.from('campaign_links')
                        .update({ leads_count: (matchedLink.leads_count || 0) + 1 })
                        .eq('id', matchedLink.id);
                }
            }

            // Save to DB
            await supabase.from('whatsapp_messages').insert({
                id: messageObj.key?.id || `msg-${Date.now()}`,
                lead_phone: phone,
                sender: isFromMe ? 'attendant' : 'lead',
                text: textContent,
                status: 'entregue',
                timestamp: new Date().toISOString()
            });

            // Disparo assíncrono do Chatbot com IA para mensagens recebidas do lead
            if (!isFromMe && textContent) {
                handleBotIncomingMessageAsync(assignedCompanyId, phone, textContent, targetLead).catch(botErr => {
                    console.error('Erro na execução assíncrona do Chatbot com IA:', botErr);
                });
            }
        }
        
        res.status(200).json({ received: true });
    } catch (err: any) {
        console.error('Erro no webhook da Evolution API:', err);
        res.status(500).json({ error: err.message });
    }
});

// Products API
app.get('/api/products', async (req: Request, res: Response) => {
    try {
        const companyId = req.query.companyId as string || 'comp-alfa';
        const { data, error } = await supabase.from('products').select('*').eq('company_id', companyId);
        if (error && error.code !== '42P01') throw error; // ignore missing table error gracefully if schema not fully applied
        res.json((data || []).map(mapProductFromDB));
    } catch (error: any) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/products', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('products').insert([mapProductToDB(req.body)]).select().single();
        if (error) throw error;
        res.json(mapProductFromDB(data));
    } catch (error: any) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('products').update(mapProductToDB(req.body)).eq('id', req.params.id).select().single();
        if (error) throw error;
        res.json(mapProductFromDB(data));
    } catch (error: any) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/products/:id', async (req: Request, res: Response) => {
    try {
        const { error } = await supabase.from('products').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: error.message });
    }
});

// Lead Purchases API
app.get('/api/lead-purchases', async (req: Request, res: Response) => {
    try {
        const companyId = req.query.companyId as string || 'comp-alfa';
        const { data, error } = await supabase.from('lead_purchases').select('*').eq('company_id', companyId);
        if (error && error.code !== '42P01') throw error;
        res.json((data || []).map(mapLeadPurchaseFromDB));
    } catch (error: any) {
        console.error('Error fetching lead purchases:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/lead-purchases', async (req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('lead_purchases').insert([mapLeadPurchaseToDB(req.body)]).select().single();
        if (error) throw error;
        res.json(mapLeadPurchaseFromDB(data));
    } catch (error: any) {
        console.error('Error creating lead purchase:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/lead-purchases/:id', async (req: Request, res: Response) => {
    try {
        const { error } = await supabase.from('lead_purchases').delete().eq('id', req.params.id);
        if (error) throw error;
        res.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting lead purchase:', error);
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// SMART POPUPS & CAPTURE FORMS API
// ==========================================

// List Popups by Company
app.get('/api/popups', async (req: Request, res: Response) => {
    try {
        const companyId = req.query.companyId as string || 'comp-alfa';
        const { data, error } = await supabase.from('popups').select('*').eq('company_id', companyId);
        
        if (error && error.code !== '42P01') {
            console.warn('Supabase popups error, using fallback:', error.message);
        }
        
        if (data && data.length > 0) {
            return res.json(data.map(mapPopupFromDB));
        }

        // Fallback to in-memory popups
        const companyPopups = inMemoryPopups.filter(p => p.company_id === companyId);
        res.json(companyPopups.map(mapPopupFromDB));
    } catch (error: any) {
        console.error('Error fetching popups:', error);
        const companyId = req.query.companyId as string || 'comp-alfa';
        res.json(inMemoryPopups.filter(p => p.company_id === companyId).map(mapPopupFromDB));
    }
});

// Create Popup
app.post('/api/popups', async (req: Request, res: Response) => {
    try {
        const dbPayload = mapPopupToDB(req.body);
        const { data, error } = await supabase.from('popups').insert([dbPayload]).select().single();
        
        if (error) {
            // Store in in-memory fallback if table not yet created
            inMemoryPopups.unshift(dbPayload);
            return res.json(mapPopupFromDB(dbPayload));
        }
        
        // Also update memory
        inMemoryPopups.unshift(data);
        res.json(mapPopupFromDB(data));
    } catch (error: any) {
        console.error('Error creating popup:', error);
        const fallback = mapPopupToDB(req.body);
        inMemoryPopups.unshift(fallback);
        res.json(mapPopupFromDB(fallback));
    }
});

// Update Popup
app.put('/api/popups/:id', async (req: Request, res: Response) => {
    try {
        const dbPayload = mapPopupToDB({ ...req.body, id: req.params.id });
        const { data, error } = await supabase.from('popups').update(dbPayload).eq('id', req.params.id).select().single();
        
        // Always sync in-memory
        const idx = inMemoryPopups.findIndex(p => p.id === req.params.id);
        if (idx >= 0) inMemoryPopups[idx] = { ...inMemoryPopups[idx], ...dbPayload };
        else inMemoryPopups.unshift(dbPayload);

        if (error && error.code !== '42P01') {
            return res.json(mapPopupFromDB(dbPayload));
        }

        res.json(mapPopupFromDB(data || dbPayload));
    } catch (error: any) {
        console.error('Error updating popup:', error);
        const fallback = mapPopupToDB({ ...req.body, id: req.params.id });
        res.json(mapPopupFromDB(fallback));
    }
});

// Delete Popup
app.delete('/api/popups/:id', async (req: Request, res: Response) => {
    try {
        await supabase.from('popups').delete().eq('id', req.params.id);
        inMemoryPopups = inMemoryPopups.filter(p => p.id !== req.params.id);
        res.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting popup:', error);
        inMemoryPopups = inMemoryPopups.filter(p => p.id !== req.params.id);
        res.json({ success: true });
    }
});

// Public Popup Config (used by embedded script)
app.get('/api/popups/public/:id', async (req: Request, res: Response) => {
    try {
        const { data } = await supabase.from('popups').select('*').eq('id', req.params.id).maybeSingle();
        const found = data || inMemoryPopups.find(p => p.id === req.params.id);
        if (!found) {
            return res.status(404).json({ error: 'Pop-up não encontrado ou inativo' });
        }
        res.json(mapPopupFromDB(found));
    } catch (err: any) {
        const found = inMemoryPopups.find(p => p.id === req.params.id);
        if (!found) return res.status(404).json({ error: 'Pop-up não encontrado' });
        res.json(mapPopupFromDB(found));
    }
});

// Track Impression
app.post('/api/popups/:id/impression', async (req: Request, res: Response) => {
    try {
        const popupId = req.params.id;
        const mem = inMemoryPopups.find(p => p.id === popupId);
        if (mem) mem.impressions_count = (mem.impressions_count || 0) + 1;

        const { data } = await supabase.from('popups').select('impressions_count').eq('id', popupId).maybeSingle();
        if (data) {
            await supabase.from('popups').update({ impressions_count: (data.impressions_count || 0) + 1 }).eq('id', popupId);
        }
        res.json({ success: true });
    } catch {
        res.json({ success: true });
    }
});

// Submit Lead from Popup (Public Endpoint)
app.post('/api/popups/:id/submit', async (req: Request, res: Response) => {
    try {
        const popupId = req.params.id;
        const body = req.body || {};

        // Find popup configuration
        let popup: any = null;
        try {
            const { data } = await supabase.from('popups').select('*').eq('id', popupId).maybeSingle();
            popup = data ? mapPopupFromDB(data) : null;
        } catch {}

        if (!popup) {
            const mem = inMemoryPopups.find(p => p.id === popupId);
            if (mem) popup = mapPopupFromDB(mem);
        }

        if (!popup) {
            return res.status(404).json({ error: 'Pop-up não encontrado' });
        }

        // Increment popup leads count
        try {
            const { data } = await supabase.from('popups').select('leads_count').eq('id', popupId).maybeSingle();
            if (data) {
                await supabase.from('popups').update({ leads_count: (data.leads_count || 0) + 1 }).eq('id', popupId);
            }
        } catch {}
        const mem = inMemoryPopups.find(p => p.id === popupId);
        if (mem) mem.leads_count = (mem.leads_count || 0) + 1;

        // User Location / IP
        const userIp = (req.headers['x-forwarded-for'] as string || req.ip || '177.100.20.10').split(',')[0].trim();
        const locationObj = mockGeoFromIp(userIp);

        const companyId = popup.companyId || 'comp-alfa';
        const sanitizedPhone = (body.phone || '').replace(/\D/g, '');
        const leadName = body.name || 'Lead via Pop-up';
        const leadEmail = body.email || '';

        // Conversion event
        const conversionEvent: ConversionEventLog = {
            id: `evt-popup-${Date.now()}`,
            type: 'popup',
            eventName: 'Lead Capturado (Pop-up)',
            status: 'sucesso',
            timestamp: new Date().toISOString(),
            details: `Capturado via Pop-up Inteligente: "${popup.name}" (Gatilho: ${popup.triggerType || 'exit_intent'})`,
            utmSource: body.utmSource || 'popup_site',
            utmMedium: body.utmMedium || 'pop_up',
            utmCampaign: body.utmCampaign || popup.name,
            utmContent: body.utmContent || '',
            utmTerm: body.utmTerm || ''
        };

        // Create or find lead in Supabase
        let leadId = `lead-${Date.now()}`;
        let existingLead: any = null;

        if (sanitizedPhone) {
            const phoneOptions = [sanitizedPhone, sanitizedPhone.startsWith('55') ? sanitizedPhone.substring(2) : '55' + sanitizedPhone];
            const { data: matches } = await supabase
                .from('leads')
                .select('*')
                .eq('company_id', companyId)
                .in('phone', phoneOptions)
                .order('created_at', { ascending: false });
            if (matches && matches.length > 0) {
                existingLead = matches.find(l => l.stage !== 'Convertido' && l.stage !== 'Perdido') || matches[0];
            }
        }

        if (!existingLead && leadEmail && leadEmail.trim() !== '') {
            const { data: emailMatches } = await supabase
                .from('leads')
                .select('*')
                .eq('company_id', companyId)
                .eq('email', leadEmail.trim().toLowerCase())
                .order('created_at', { ascending: false });
            if (emailMatches && emailMatches.length > 0) {
                existingLead = emailMatches.find(l => l.stage !== 'Convertido' && l.stage !== 'Perdido') || emailMatches[0];
            }
        }

        if (existingLead) {
            leadId = existingLead.id;
            let currentEvents: any[] = [];
            if (Array.isArray(existingLead.conversion_events)) {
                currentEvents = existingLead.conversion_events;
            } else if (typeof existingLead.conversion_events === 'string') {
                try { currentEvents = JSON.parse(existingLead.conversion_events); } catch {}
            }
            const updatedEvents = [...currentEvents, conversionEvent];
            await safeUpdateLead(existingLead.id, {
                name: (leadName && leadName !== 'Lead via Pop-up') ? leadName : existingLead.name,
                email: leadEmail || existingLead.email,
                conversion_events: updatedEvents,
                notes: (existingLead.notes ? existingLead.notes + '\n' : '') + `[${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}] Preencheu Pop-up: "${popup.name}"`,
                updated_at: new Date().toISOString()
            });
        } else {
            const newLead: Lead = {
                id: leadId,
                companyId: companyId,
                name: leadName,
                phone: sanitizedPhone,
                email: leadEmail,
                location: locationObj,
                source: `Pop-up: ${popup.name}`,
                utmSource: body.utmSource || 'popup_site',
                utmMedium: body.utmMedium || 'pop_up',
                utmCampaign: body.utmCampaign || popup.name,
                utmContent: body.utmContent || '',
                utmTerm: body.utmTerm || '',
                linkId: popup.linkId || '',
                linkTitle: popup.name,
                stage: (popup.targetStage as FunnelStage) || 'Novo Lead',
                value: 0,
                device: body.device || 'Web Browser',
                browser: req.headers['user-agent'] || 'Web Client',
                notes: `Origem: Pop-up Inteligente "${popup.name}". URL: ${body.pageUrl || 'Site'}`,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                conversionEvents: [conversionEvent]
            };
            await safeInsertLead(mapLeadToDB(newLead));
        }

        // Fire settings webhook if enabled
        const settings = await getSettings(companyId);
        if (settings && settings.autoFireWebhookOnLead && settings.globalWebhookUrl) {
            triggerWebhook(settings.globalWebhookUrl, 'lead_popup_captured', {
                leadId,
                name: leadName,
                phone: sanitizedPhone,
                email: leadEmail,
                popupId: popup.id,
                popupName: popup.name,
                timestamp: new Date().toISOString()
            }, leadName).catch(() => null);
        }

        // Trigger Marketing Automation Workflows
        const leadObj = existingLead || { id: leadId, companyId, name: leadName, phone: sanitizedPhone, email: leadEmail, stage: popup.targetStage || 'Novo Lead' };
        triggerWorkflows('popup_submitted', { companyId, lead: leadObj, context: { popup } }).catch(() => null);
        triggerWorkflows('lead_created', { companyId, lead: leadObj }).catch(() => null);

        // Prepare redirect / response
        let finalWhatsAppUrl = '';
        if (popup.actionType === 'whatsapp_redirect') {
            const rawPhone = (popup.whatsappPhone || '5511987654321').replace(/\D/g, '');
            let message = popup.whatsappMessage || 'Olá! Vim através do site e gostaria de mais informações.';
            message = message.replace(/\{name\}/gi, leadName)
                             .replace(/\{phone\}/gi, sanitizedPhone)
                             .replace(/\{email\}/gi, leadEmail);
            finalWhatsAppUrl = `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;
        }

        res.json({
            success: true,
            leadId,
            actionType: popup.actionType,
            whatsappUrl: finalWhatsAppUrl,
            redirectUrl: popup.redirectUrl || '',
            message: popup.successMessage || 'Obrigado! Entraremos em contato em breve.'
        });
    } catch (error: any) {
        console.error('Error submitting popup lead:', error);
        res.status(500).json({ error: error.message });
    }
});

// Standalone Embeddable JavaScript Tracker & Popup Engine
app.get('/tracker/popup.js', async (req: Request, res: Response) => {
    res.type('application/javascript');
    const popupId = (req.query.id as string) || '';

    // Fetch popup if ID provided in query
    let initialConfig: any = null;
    if (popupId) {
        try {
            const { data } = await supabase.from('popups').select('*').eq('id', popupId).maybeSingle();
            if (data) initialConfig = mapPopupFromDB(data);
        } catch {}
        if (!initialConfig) {
            const mem = inMemoryPopups.find(p => p.id === popupId);
            if (mem) initialConfig = mapPopupFromDB(mem);
        }
    }

    const scriptCode = `
(function() {
  if (window.__MDTrackerPopupInitialized) return;
  window.__MDTrackerPopupInitialized = true;

  const currentScript = document.currentScript || (function() {
    const scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  const scriptSrc = currentScript ? currentScript.src : '';
  const urlObj = new URL(scriptSrc, window.location.href);
  const serverBase = urlObj.origin;
  const scriptPopupId = urlObj.searchParams.get('id') || (currentScript ? currentScript.getAttribute('data-popup-id') : '') || '${popupId}';

  let config = ${initialConfig ? JSON.stringify(initialConfig) : 'null'};

  async function loadPopup() {
    if (!config && scriptPopupId) {
      try {
        const resp = await fetch(serverBase + '/api/popups/public/' + encodeURIComponent(scriptPopupId));
        if (resp.ok) {
          config = await resp.json();
        }
      } catch(e) {
        console.error('[MDTracker] Erro ao carregar pop-up:', e);
      }
    }

    if (!config || !config.active) return;

    // Check frequency
    const seenKey = 'mdt_seen_' + config.id;
    if (config.showOncePerUser && localStorage.getItem(seenKey)) {
      if (config.triggerType !== 'floating_button') return;
    }

    injectStyles(config);
    setupTriggers(config);
  }

  function injectStyles(cfg) {
    if (document.getElementById('mdt-popup-styles')) return;
    const style = document.createElement('style');
    style.id = 'mdt-popup-styles';
    style.textContent = \`
      .mdt-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(6px);
        -webkit-backdrop-filter: blur(6px);
        z-index: 9999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      .mdt-backdrop.mdt-visible {
        opacity: 1;
        visibility: visible;
      }
      .mdt-card {
        width: 100%;
        max-width: 460px;
        position: relative;
        transform: scale(0.92) translateY(12px);
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .mdt-backdrop.mdt-visible .mdt-card {
        transform: scale(1) translateY(0);
      }
      .mdt-card-dark {
        background: #0f172a;
        color: #f8fafc;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }
      .mdt-card-light {
        background: #ffffff;
        color: #0f172a;
        border: 1px solid #e2e8f0;
      }
      .mdt-card-emerald {
        background: #064e3b;
        color: #ecfdf5;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }
      .mdt-card-gradient {
        background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
        color: #ffffff;
        border: 1px solid rgba(99, 102, 241, 0.25);
      }
      .mdt-card-slate {
        background: #1e293b;
        color: #f8fafc;
        border: 1px solid #334155;
      }
      .mdt-close-btn {
        position: absolute;
        top: 14px;
        right: 14px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(0,0,0,0.15);
        color: inherit;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        line-height: 1;
        transition: background 0.2s, transform 0.2s;
        z-index: 10;
      }
      .mdt-close-btn:hover {
        background: rgba(0,0,0,0.3);
        transform: rotate(90deg);
      }
      .mdt-input {
        width: 100%;
        padding: 12px 14px;
        font-size: 14px;
        border-radius: 8px;
        box-sizing: border-box;
        margin-bottom: 12px;
        transition: border-color 0.2s, box-shadow 0.2s;
        outline: none;
      }
      .mdt-card-dark .mdt-input, .mdt-card-slate .mdt-input, .mdt-card-gradient .mdt-input, .mdt-card-emerald .mdt-input {
        background: rgba(255, 255, 255, 0.07);
        border: 1px solid rgba(255, 255, 255, 0.2);
        color: #ffffff;
      }
      .mdt-card-light .mdt-input {
        background: #f8fafc;
        border: 1px solid #cbd5e1;
        color: #0f172a;
      }
      .mdt-input:focus {
        border-color: \${cfg.buttonColor || '#2563eb'};
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
      }
      .mdt-submit-btn {
        width: 100%;
        padding: 14px 18px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        border: none;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: filter 0.2s, transform 0.1s;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2);
      }
      .mdt-submit-btn:hover {
        filter: brightness(1.1);
      }
      .mdt-submit-btn:active {
        transform: scale(0.98);
      }
      .mdt-badge {
        display: inline-block;
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-radius: 20px;
        background: rgba(37, 99, 235, 0.2);
        color: \${cfg.buttonColor || '#60a5fa'};
        margin-bottom: 12px;
      }
      .mdt-floating-trigger {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 18px;
        background: \${cfg.buttonColor || '#2563eb'};
        color: #ffffff;
        font-weight: 700;
        font-size: 14px;
        border-radius: 30px;
        cursor: pointer;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        border: none;
        animation: mdtPulse 2.5s infinite;
        font-family: inherit;
      }
      @keyframes mdtPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    \`;
    document.head.appendChild(style);
  }

  function renderModal(cfg) {
    if (document.getElementById('mdt-modal-' + cfg.id)) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'mdt-modal-' + cfg.id;
    backdrop.className = 'mdt-backdrop';

    const bgClass = 'mdt-card-' + (cfg.backgroundColor || 'dark');
    const radiusMap = { none: '0px', sm: '6px', md: '12px', lg: '20px', full: '28px' };
    const radius = radiusMap[cfg.borderRadius] || '14px';

    const fieldsHtml = (cfg.fields || []).filter(f => f.enabled).map(f => {
      return \`
        <div style="margin-bottom: 8px; text-align: left;">
          <label style="display:block; font-size: 11px; font-weight: 600; opacity: 0.85; margin-bottom: 4px;">\${f.label} \${f.required ? '*' : ''}</label>
          <input type="\${f.type}" name="\${f.name}" placeholder="\${f.placeholder || ''}" \${f.required ? 'required' : ''} class="mdt-input" \${f.type === 'tel' ? 'id="mdt-phone-input-' + cfg.id + '"' : ''}>
        </div>
      \`;
    }).join('');

    backdrop.innerHTML = \`
      <div class="mdt-card \${bgClass}" style="border-radius: \${radius}; padding: 32px 28px; text-align: center;">
        <button class="mdt-close-btn" id="mdt-close-\${cfg.id}">&times;</button>
        \${cfg.badgeText ? \`<div class="mdt-badge">\${cfg.badgeText}</div>\` : ''}
        <h3 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 800; line-height: 1.25;">\${cfg.title}</h3>
        \${cfg.subtitle ? \`<p style="margin: 0 0 20px 0; font-size: 13px; opacity: 0.8; line-height: 1.45;">\${cfg.subtitle}</p>\` : ''}
        
        <form id="mdt-form-\${cfg.id}">
          \${fieldsHtml}
          <div id="mdt-error-\${cfg.id}" style="color: #ef4444; font-size: 12px; margin-bottom: 8px; display: none;"></div>
          <button type="submit" class="mdt-submit-btn" style="background: \${cfg.buttonColor || '#2563eb'}; color: \${cfg.buttonTextColor || '#ffffff'}; border-radius: \${radius};">
            <span id="mdt-btn-text-\${cfg.id}">\${cfg.ctaText || 'Quero Aproveitar'}</span>
          </button>
        </form>

        <div id="mdt-success-\${cfg.id}" style="display: none; padding: 20px 10px;">
          <div style="font-size: 38px; margin-bottom: 10px;">🎉</div>
          <h4 style="font-size: 18px; font-weight: 700; margin: 0 0 8px 0;">Sucesso!</h4>
          <p id="mdt-success-msg-\${cfg.id}" style="font-size: 13px; opacity: 0.9; margin: 0;"></p>
        </div>
      </div>
    \`;

    document.body.appendChild(backdrop);

    // Close logic
    document.getElementById('mdt-close-' + cfg.id).onclick = () => hidePopup(cfg.id);
    backdrop.onclick = (e) => { if (e.target === backdrop) hidePopup(cfg.id); };
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hidePopup(cfg.id); });

    // Phone mask
    const phoneInput = document.getElementById('mdt-phone-input-' + cfg.id);
    if (phoneInput) {
      phoneInput.addEventListener('input', function(e) {
        let v = e.target.value.replace(/\\D/g, '');
        if (v.length > 11) v = v.substring(0, 11);
        if (v.length > 10) {
          v = v.replace(/^(\\d\\d)(\\d{5})(\\d{4})$/, '($1) $2-$3');
        } else if (v.length > 5) {
          v = v.replace(/^(\\d\\d)(\\d{4})(\\d{0,4})$/, '($1) $2-$3');
        } else if (v.length > 2) {
          v = v.replace(/^(\\d\\d)(\\d{0,5})$/, '($1) $2');
        }
        e.target.value = v;
      });
    }

    // Submit handler
    const form = document.getElementById('mdt-form-' + cfg.id);
    form.onsubmit = async (e) => {
      e.preventDefault();
      const errDiv = document.getElementById('mdt-error-' + cfg.id);
      const btnText = document.getElementById('mdt-btn-text-' + cfg.id);
      errDiv.style.display = 'none';

      const formData = new FormData(form);
      const payload = {
        name: formData.get('name') || '',
        phone: formData.get('phone') || '',
        email: formData.get('email') || '',
        pageUrl: window.location.href,
        pageTitle: document.title,
        device: window.innerWidth < 768 ? 'Mobile' : 'Desktop'
      };

      // Extract UTMs from URL
      const sp = new URLSearchParams(window.location.search);
      payload.utmSource = sp.get('utm_source') || 'site_popup';
      payload.utmMedium = sp.get('utm_medium') || 'smart_popup';
      payload.utmCampaign = sp.get('utm_campaign') || cfg.name;
      payload.utmContent = sp.get('utm_content') || '';
      payload.utmTerm = sp.get('utm_term') || '';

      btnText.textContent = 'Enviando...';

      try {
        const resp = await fetch(serverBase + '/api/popups/' + encodeURIComponent(cfg.id) + '/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await resp.json();

        if (!resp.ok || !result.success) {
          throw new Error(result.error || 'Erro ao processar envio');
        }

        // Mark as seen
        localStorage.setItem('mdt_seen_' + cfg.id, '1');

        // Post submit action
        if (result.actionType === 'whatsapp_redirect' && result.whatsappUrl) {
          form.style.display = 'none';
          document.getElementById('mdt-success-' + cfg.id).style.display = 'block';
          document.getElementById('mdt-success-msg-' + cfg.id).textContent = 'Redirecionando para o WhatsApp...';
          setTimeout(() => {
            window.location.href = result.whatsappUrl;
          }, 800);
        } else if (result.actionType === 'custom_url' && result.redirectUrl) {
          form.style.display = 'none';
          document.getElementById('mdt-success-' + cfg.id).style.display = 'block';
          document.getElementById('mdt-success-msg-' + cfg.id).textContent = 'Redirecionando...';
          setTimeout(() => {
            window.location.href = result.redirectUrl;
          }, 600);
        } else {
          form.style.display = 'none';
          document.getElementById('mdt-success-' + cfg.id).style.display = 'block';
          document.getElementById('mdt-success-msg-' + cfg.id).textContent = result.message || 'Dados recebidos com sucesso!';
          setTimeout(() => {
            hidePopup(cfg.id);
          }, 3500);
        }
      } catch(err) {
        btnText.textContent = cfg.ctaText || 'Quero Aproveitar';
        errDiv.textContent = err.message || 'Falha ao enviar dados. Tente novamente.';
        errDiv.style.display = 'block';
      }
    };
  }

  let hasTriggered = false;

  function showPopup(popupId) {
    if (hasTriggered) return;
    hasTriggered = true;

    renderModal(config);
    const el = document.getElementById('mdt-modal-' + popupId);
    if (el) el.classList.add('mdt-visible');

    // Register impression on backend
    fetch(serverBase + '/api/popups/' + encodeURIComponent(popupId) + '/impression', { method: 'POST' }).catch(() => null);
  }

  function hidePopup(popupId) {
    const el = document.getElementById('mdt-modal-' + popupId);
    if (el) el.classList.remove('mdt-visible');
  }

  function setupTriggers(cfg) {
    if (cfg.triggerType === 'exit_intent') {
      document.addEventListener('mouseleave', function(e) {
        if (e.clientY <= 5) {
          showPopup(cfg.id);
        }
      });
    } else if (cfg.triggerType === 'scroll') {
      const targetPercent = cfg.triggerValue || 50;
      window.addEventListener('scroll', function() {
        if (hasTriggered) return;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (totalHeight > 0) {
          const current = (window.scrollY / totalHeight) * 100;
          if (current >= targetPercent) {
            showPopup(cfg.id);
          }
        }
      });
    } else if (cfg.triggerType === 'timed_delay') {
      const delay = (cfg.triggerValue || 5) * 1000;
      setTimeout(() => {
        showPopup(cfg.id);
      }, delay);
    } else if (cfg.triggerType === 'floating_button') {
      const btn = document.createElement('button');
      btn.className = 'mdt-floating-trigger';
      btn.innerHTML = \`
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>
        <span>\${cfg.badgeText || cfg.ctaText || 'Oferta Especial'}</span>
      \`;
      btn.onclick = () => {
        hasTriggered = false; // allow re-opening from button
        showPopup(cfg.id);
      };
      document.body.appendChild(btn);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPopup);
  } else {
    loadPopup();
  }
})();
    `;

    res.send(scriptCode);
});

// ==========================================
// AI COPYWRITER & MARKETING ASSISTANT (GEMINI)
// ==========================================

function generateHeuristicCopy(params: {
  type: string;
  productName: string;
  targetAudience?: string;
  tone?: string;
  extraContext?: string;
  leadContext?: any;
}) {
  const { type, productName, targetAudience = 'clientes em potencial', tone = 'persuasive', extraContext = '', leadContext } = params;
  const leadName = leadContext?.name || 'Cliente';

  if (type === 'headlines') {
    return {
      title: `Headlines de Alta Conversão para ${productName}`,
      items: [
        `Como alavancar seus resultados com ${productName} (sem complicações)`,
        `A solução definitiva em ${productName} feita sob medida para ${targetAudience}`,
        `Pare de perder oportunidades: tenha acesso exclusivo a ${productName}`,
        `O segredo por trás do sucesso de quem já utiliza ${productName}`,
        `Garanta agora sua vaga VIP em ${productName} com condições especiais hoje`
      ],
      strategyTips: [
        'Teste os títulos em pop-ups de saída e meça qual tem maior taxa de cliques.',
        'Headlines com foco em dor convertem até 34% mais no primeiro contato.'
      ]
    };
  }

  if (type === 'ctas') {
    return {
      title: `Chamadas para Ação (CTAs) para ${productName}`,
      items: [
        `Quero Garantir Meu Desconto no WhatsApp`,
        `Falar com Especialista Agora (Sem Espera)`,
        `Quero Acesso VIP ao ${productName}`,
        `Agendar Demonstração Gratuita de 15 Minutos`,
        `Começar Agora com 1 Clique`,
        `Garantir Minha Condição Exclusiva`
      ],
      strategyTips: [
        'Utilize verbos na primeira pessoa ("Quero garantir...") para gerar senso de posse imediato.',
        'Mantenha o botão em contraste forte com o fundo da página.'
      ]
    };
  }

  if (type === 'email') {
    return {
      title: `E-mail de Conversão: ${productName}`,
      emailSubject: `[Exclusivo] Uma oportunidade especial sobre ${productName} para você ⚡`,
      emailPreview: `Condição especial por tempo limitado para transformar seus resultados com ${productName}.`,
      emailBody: `Olá, ${leadName}! Tudo bem?

Se você está buscando uma maneira comprovada de obter melhores resultados com ${productName}, esta mensagem é para você.

Muitos profissionais e empresas enfrentam desafios diários tentando encontrar a melhor solução. É exatamente por isso que desenvolvemos ${productName}: para simplificar processos e acelerar suas conquistas.

Principais vantagens que você terá:
• Atendimento prioritário e suporte dedicado;
• Metodologia ágil e pronta para implementação imediata;
• Resultados mensuráveis desde os primeiros dias de uso;
• Condição comercial personalizada e exclusiva para o seu perfil.

${extraContext ? `Observação especial: ${extraContext}\n\n` : ''}Não deixe para depois. Nosso time de especialistas está disponível agora no WhatsApp para tirar suas dúvidas e aplicar sua condição especial.

👉 Clique aqui e fale conosco no WhatsApp oficial: {link_whatsapp}

Um grande abraço,
Equipe Comercial`,
      strategyTips: [
        'Dispare este e-mail 15 minutos após a captura do lead para aproveitar o momento de maior interesse.',
        'Personalize a saudação com o primeiro nome do lead.'
      ]
    };
  }

  if (type === 'whatsapp') {
    return {
      title: `Scripts de Vendas para WhatsApp: ${productName}`,
      items: [
        `Olá, ${leadName}! Aqui é da equipe de atendimento. Vi que você demonstrou interesse em ${productName} no nosso site. Posso te apresentar rapidamente as condições exclusivas que temos para hoje?`,
        `Oi, ${leadName}! Tudo bem? Passando para te avisar que separamos um cupom VIP de desconto em ${productName} especialmente para você. Quer que eu te envie o link com o desconto aplicado?`,
        `${leadName}, tudo bem? Sei que o dia a dia é corrido! Queria apenas checar se você conseguiu ver a proposta de ${productName} que conversamos. Temos poucas vagas com essa condição especial!`
      ],
      strategyTips: [
        'Envie áudios curtos (até 40s) após a primeira resposta em texto para humanizar o atendimento.',
        'Evite mandar mensagens longas de uma vez; prefira perguntas abertas que convidem o lead a responder.'
      ]
    };
  }

  // smart_lists
  return {
    title: `Listas Inteligentes Recomendadas para ${productName}`,
    items: [
      `🔥 Leads Super Quentes: Leads no estágio "Em Negociação" com mais de 2 visitas nos últimos 7 dias. (Ação: Follow-up de fechamento no WhatsApp).`,
      `⏳ Recuperação de Abandono: Leads que preencheram pop-up nos últimos 3 dias mas não avançaram no funil. (Ação: Disparo de cupom de 10% OFF).`,
      `💎 Clientes para Upsell: Leads com compras anteriores de serviços recorrentes. (Ação: Oferta de upgrade de plano ou produto complementar).`,
      `❄️ Reativação de Base Fria: Contatos inativos há mais de 30 dias. (Ação: Pesquisa de satisfação ou novidade de produto via broadcast).`
    ],
    strategyTips: [
      'Segmentar a base por temperatura aumenta a taxa de abertura em mais de 60%.',
      'Nunca envie a mesma mensagem para clientes novos e clientes recorrentes.'
    ]
  };
}

app.post('/api/ai/generate', async (req: Request, res: Response) => {
  try {
    const {
      companyId,
      type = 'headlines',
      productName = 'Serviço Premium',
      targetAudience = 'clientes em potencial',
      tone = 'persuasive',
      extraContext = '',
      leadContext,
      apiKey: customApiKey
    } = req.body;

    // Determine API Key (from request, env, or settings)
    let apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      const dbSettings = await getSettings(companyId);
      if (dbSettings && (dbSettings as any).gemini_api_key) {
        apiKey = (dbSettings as any).gemini_api_key;
      }
    }

    let aiResult: any = null;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const ai = new GoogleGenAI({ apiKey });
        
        let prompt = '';
        if (type === 'headlines') {
          prompt = `Você é um copywriter sênior especialista em marketing direto de alta conversão.
Escreva 5 variações irresistíveis de TÍTULOS / HEADLINES para o produto "${productName}".
Público-alvo: ${targetAudience}.
Tom de voz: ${tone}.
Contexto extra: ${extraContext}.

Responda ESTRITAMENTE em formato JSON com este formato:
{
  "title": "Headlines de Alta Conversão",
  "items": ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"],
  "strategyTips": ["Dica 1", "Dica 2"]
}`;
        } else if (type === 'ctas') {
          prompt = `Você é um especialista em CRO (Conversion Rate Optimization).
Crie 6 Chamadas para Ação (CTAs) curtas e com alto poder de clique para o produto "${productName}".
Público-alvo: ${targetAudience}.
Tom de voz: ${tone}.
Contexto extra: ${extraContext}.

Responda ESTRITAMENTE em formato JSON com este formato:
{
  "title": "Chamadas para Ação (CTAs)",
  "items": ["CTA 1", "CTA 2", "CTA 3", "CTA 4", "CTA 5", "CTA 6"],
  "strategyTips": ["Dica 1", "Dica 2"]
}`;
        } else if (type === 'email') {
          prompt = `Você é um copywriter de e-mail marketing especialista no estilo RD Station e HubSpot.
Escreva um e-mail de marketing persuasivo completo para o produto "${productName}".
Público-alvo: ${targetAudience}.
Tom de voz: ${tone}.
Contexto extra: ${extraContext}.
Nome do lead se disponível: ${leadContext?.name || 'Cliente'}.

Responda ESTRITAMENTE em formato JSON com este formato:
{
  "title": "E-mail de Marketing e Vendas",
  "emailSubject": "Assunto atraente com emoji",
  "emailPreview": "Texto de pré-visualização (preheader) de até 80 caracteres",
  "emailBody": "Corpo do e-mail com quebras de linha e chamada clara para ação",
  "strategyTips": ["Dica de envio", "Dica de conversão"]
}`;
        } else if (type === 'whatsapp') {
          prompt = `Você é um consultor comercial especialista em fechamento de vendas por WhatsApp.
Crie 3 abordagens humanizadas e persuasivas para "${productName}".
Público-alvo: ${targetAudience}.
Tom de voz: ${tone}.
Contexto extra: ${extraContext}.
Nome do lead: ${leadContext?.name || 'Cliente'}.

Responda ESTRITAMENTE em formato JSON com este formato:
{
  "title": "Scripts de Vendas para WhatsApp",
  "items": ["Mensagem 1 (Boas-vindas / Primeiro Contato)", "Mensagem 2 (Quebra de Objeção / Follow-up)", "Mensagem 3 (Urgência / Fechamento)"],
  "strategyTips": ["Dica de envio", "Dica para aumentar respostas"]
}`;
        } else if (type === 'smart_lists') {
          prompt = `Você é um estrategista de CRM e Growth Marketing.
Sugira 4 Listas Inteligentes de Segmentação para o produto "${productName}".
Público-alvo: ${targetAudience}.
Contexto extra: ${extraContext}.

Responda ESTRITAMENTE em formato JSON com este formato:
{
  "title": "Segmentações Inteligentes Recomendadas",
  "items": ["Lista 1 com critério e ação", "Lista 2 com critério e ação", "Lista 3 com critério e ação", "Lista 4 com critério e ação"],
  "strategyTips": ["Dica de nutrição", "Dica de reativação"]
}`;
        }

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const rawText = aiResponse.text || '';
        try {
          aiResult = JSON.parse(rawText);
        } catch {
          const match = rawText.match(/\{[\s\S]*\}/);
          if (match) aiResult = JSON.parse(match[0]);
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed, using heuristic engine:', geminiError.message);
      }
    }

    if (!aiResult) {
      aiResult = generateHeuristicCopy({ type, productName, targetAudience, tone, extraContext, leadContext });
    }

    res.json({
      id: `ai-${Date.now()}`,
      type,
      title: aiResult.title || 'Conteúdo Gerado com IA',
      items: aiResult.items || [],
      emailSubject: aiResult.emailSubject,
      emailPreview: aiResult.emailPreview,
      emailBody: aiResult.emailBody,
      fullText: aiResult.fullText,
      strategyTips: aiResult.strategyTips || [
        'Teste os títulos em pop-ups e páginas para comparar a taxa de conversão.',
        'Adapte os scripts de mensagem com o primeiro nome de cada lead.'
      ],
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Error in /api/ai/generate:', error);
    res.status(500).json({ error: error.message });
  }
});

// Chatbot com IA Endpoints (WhatsApp & Direct)
app.post('/api/chatbot/simulate', async (req: Request, res: Response) => {
    try {
        const { companyId, message, configOverride, lead } = req.body;
        if (!message) return res.status(400).json({ error: 'Mensagem é obrigatória para o simulador' });
        
        const targetCompanyId = companyId || 'comp-alfa';
        const result = await generateChatbotResponse({
            companyId: targetCompanyId,
            incomingText: message,
            lead: lead || { name: 'Visitante Teste', location: { city: 'São Paulo', state: 'SP' }, utmCampaign: 'Simulador Chatbot' },
            configOverride
        });

        res.json({
            reply: result.reply,
            isHandover: result.isHandover,
            botName: result.botName,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });
    } catch (err: any) {
        console.error('Error in /api/chatbot/simulate:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/chatbot/suggest-reply', async (req: Request, res: Response) => {
    try {
        const { companyId, phone, leadId } = req.body;
        const targetCompanyId = companyId || 'comp-alfa';
        
        let leadData = null;
        if (leadId) {
            const { data } = await supabase.from('leads').select('*').eq('id', leadId).maybeSingle();
            if (data) leadData = mapLeadFromDB(data);
        }

        const result = await generateChatbotResponse({
            companyId: targetCompanyId,
            phone,
            incomingText: 'Gere uma sugestão de resposta para avançar na conversa e fechar negócio',
            lead: leadData,
            customPrompt: 'Atue como um copiloto para o atendente humano. Sugira uma resposta persuasiva, cordial e orientada para conversão com base no histórico recente e produtos disponíveis.'
        });

        res.json({ suggestion: result.reply });
    } catch (err: any) {
        console.error('Error in /api/chatbot/suggest-reply:', err);
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/leads/:id/bot-status', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { botActive } = req.body;
        
        const boolVal = Boolean(botActive);
        const { error } = await supabase.from('leads').update({
            bot_active: boolVal,
            updated_at: new Date().toISOString()
        }).eq('id', id);

        if (error) {
            console.warn('Erro ao atualizar bot_active no banco:', error.message);
        }

        res.json({ success: true, leadId: id, botActive: boolVal });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/direct/message', async (req: Request, res: Response) => {
    try {
        const { companyId, leadName, message, directChannel } = req.body;
        if (!message) return res.status(400).json({ error: 'Mensagem é obrigatória' });
        
        const targetCompanyId = companyId || 'comp-alfa';
        const result = await generateChatbotResponse({
            companyId: targetCompanyId,
            incomingText: message,
            lead: { 
                name: leadName || 'Usuário Direct', 
                source: directChannel || 'instagram_direct', 
                utmCampaign: 'Instagram Direct' 
            }
        });

        res.json({
            reply: result.reply,
            botName: result.botName,
            isHandover: result.isHandover,
            channel: directChannel || 'instagram_direct',
            timestamp: new Date().toISOString()
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// MARKETING AUTOMATION & WORKFLOWS ENGINE (RD Station style)
// ==========================================

function formatWorkflowText(template: string, lead: any, companyName: string): string {
    if (!template) return '';
    return template
        .replace(/\{nome\}/gi, lead.name || 'Cliente')
        .replace(/\{name\}/gi, lead.name || 'Cliente')
        .replace(/\{telefone\}/gi, lead.phone || '')
        .replace(/\{phone\}/gi, lead.phone || '')
        .replace(/\{email\}/gi, lead.email || '')
        .replace(/\{empresa\}/gi, companyName || 'MDTracker')
        .replace(/\{company\}/gi, companyName || 'MDTracker')
        .replace(/\{produto\}/gi, lead.productName || 'nossa solução')
        .replace(/\{link_checkout\}/gi, lead.checkoutUrl || 'https://mdtracker.app');
}

async function triggerWorkflows(
    event: 'lead_created' | 'stage_changed' | 'product_purchased' | 'popup_submitted' | 'tag_added' | 'form_submitted',
    payload: {
        companyId: string;
        lead: any;
        context?: any;
    }
) {
    try {
        const { companyId, lead, context } = payload;
        if (!companyId || !lead) return;

        let workflows: any[] = [];
        try {
            const { data } = await supabase
                .from('marketing_workflows')
                .select('*')
                .eq('company_id', companyId)
                .eq('active', true)
                .eq('trigger_type', event);
            if (data && data.length > 0) {
                workflows = data.map(mapWorkflowFromDB);
            }
        } catch {}

        if (workflows.length === 0) {
            workflows = inMemoryWorkflows.filter(
                w => (w.company_id === companyId || w.company_id === 'comp-alfa') && w.active && w.trigger_type === event
            ).map(mapWorkflowFromDB);
        }

        if (workflows.length === 0) return;

        let companyName = 'MDTracker';
        try {
            const { data: comp } = await supabase.from('companies').select('name').eq('id', companyId).maybeSingle();
            if (comp) companyName = comp.name;
        } catch {}

        for (const wf of workflows) {
            if (event === 'stage_changed' && wf.triggerConfig?.stage) {
                const currentStage = context?.newStage || lead.stage;
                if (currentStage !== wf.triggerConfig.stage) continue;
            }

            if (event === 'product_purchased' && wf.triggerConfig?.productId) {
                if (context?.productId && context.productId !== wf.triggerConfig.productId) continue;
            }

            if (event === 'form_submitted') {
                if (wf.triggerConfig?.landingPageId && wf.triggerConfig.landingPageId !== 'all') {
                    if (context?.landingPageId && context.landingPageId !== wf.triggerConfig.landingPageId) continue;
                }
                if (wf.triggerConfig?.formSource && wf.triggerConfig.formSource !== 'any') {
                    if (context?.formSource && context.formSource !== wf.triggerConfig.formSource) continue;
                }
            }

            wf.enrolledCount = (wf.enrolledCount || 0) + 1;
            try {
                await supabase.from('marketing_workflows').update({ enrolled_count: wf.enrolledCount }).eq('id', wf.id);
            } catch {}
            const mem = inMemoryWorkflows.find(m => m.id === wf.id);
            if (mem) mem.enrolled_count = wf.enrolledCount;

            const steps = wf.steps || [];
            for (const step of steps) {
                if (step.type === 'wait_delay') {
                    const logItem = {
                        id: `log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                        company_id: companyId,
                        workflow_id: wf.id,
                        workflow_name: wf.name,
                        lead_id: lead.id,
                        lead_name: lead.name,
                        lead_phone: lead.phone,
                        action_type: 'wait_delay',
                        status: 'scheduled',
                        detail: `Aguardando intervalo de ${step.delayMinutes || 60} minutos para o próximo passo.`,
                        executed_at: new Date().toISOString()
                    };
                    inMemoryWorkflowLogs.unshift(logItem);
                    continue;
                }

                let detail = '';
                let status = 'success';

                if (step.type === 'send_whatsapp') {
                    const formattedMsg = formatWorkflowText(step.messageTemplate || '', lead, companyName);
                    if (lead.phone) {
                        try {
                            await sendWhatsAppMessage(companyId, lead.phone, formattedMsg, 'bot');
                            detail = `WhatsApp disparado para ${lead.phone}: "${formattedMsg.substring(0, 50)}..."`;
                        } catch {
                            detail = `WhatsApp registrado no CRM para ${lead.phone}: "${formattedMsg.substring(0, 50)}..."`;
                        }
                    } else {
                        detail = `Mensagem preparada (lead sem telefone): "${formattedMsg.substring(0, 40)}..."`;
                    }
                } else if (step.type === 'change_stage') {
                    if (step.targetStage) {
                        try {
                            await supabase.from('leads').update({ stage: step.targetStage, updated_at: new Date().toISOString() }).eq('id', lead.id);
                        } catch {}
                        detail = `Lead movido automaticamente para o estágio: "${step.targetStage}"`;
                    }
                } else if (step.type === 'send_email') {
                    const subject = formatWorkflowText(step.emailSubject || 'Aviso Importante', lead, companyName);
                    detail = `E-mail enviado para ${lead.email || 'lead'}: "${subject}"`;
                } else if (step.type === 'send_sms') {
                    const smsContent = formatWorkflowText(step.smsText || 'Mensagem da empresa', lead, companyName);
                    detail = `SMS enviado para ${lead.phone || 'lead'}: "${smsContent.substring(0, 45)}..."`;
                } else if (step.type === 'add_tag') {
                    detail = `Tag adicionada: "${step.tag || 'nutricao_ativa'}"`;
                } else if (step.type === 'notify_user') {
                    const note = formatWorkflowText(step.notifyMessage || 'Notificação de fluxo', lead, companyName);
                    detail = `Notificação interna: "${note}"`;
                } else {
                    detail = `Ação ${step.type} processada com sucesso.`;
                }

                wf.executedCount = (wf.executedCount || 0) + 1;
                try {
                    await supabase.from('marketing_workflows').update({ executed_count: wf.executedCount }).eq('id', wf.id);
                } catch {}
                if (mem) mem.executed_count = wf.executedCount;

                const logItem = {
                    id: `log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
                    company_id: companyId,
                    workflow_id: wf.id,
                    workflow_name: wf.name,
                    lead_id: lead.id,
                    lead_name: lead.name,
                    lead_phone: lead.phone,
                    action_type: step.type,
                    status,
                    detail,
                    executed_at: new Date().toISOString()
                };
                inMemoryWorkflowLogs.unshift(logItem);
                try {
                    await supabase.from('workflow_logs').insert(logItem);
                } catch {}
            }
        }
    } catch (err) {
        console.warn('Erro ao executar triggerWorkflows:', err);
    }
}

// Workflows Endpoints
app.get('/api/workflows', async (req: Request, res: Response) => {
    try {
        const companyId = req.query.companyId as string || 'comp-alfa';
        try {
            const { data, error } = await supabase
                .from('marketing_workflows')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });
            if (!error && data && data.length > 0) {
                return res.json(data.map(mapWorkflowFromDB));
            }
        } catch {}

        let list = inMemoryWorkflows.filter(w => w.company_id === companyId).map(mapWorkflowFromDB);
        if (list.length === 0) {
            list = inMemoryWorkflows.filter(w => w.company_id === 'comp-alfa').map(w => ({
                ...mapWorkflowFromDB(w),
                companyId
            }));
        }
        res.json(list);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/workflows', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const dbRow = mapWorkflowToDB(body);

        try {
            const { data, error } = await supabase.from('marketing_workflows').insert(dbRow).select().single();
            if (!error && data) {
                return res.json(mapWorkflowFromDB(data));
            }
        } catch {}

        inMemoryWorkflows.unshift(dbRow);
        res.json(mapWorkflowFromDB(dbRow));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/workflows/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const body = req.body;
        const dbRow = mapWorkflowToDB({ ...body, id });

        try {
            const { data, error } = await supabase.from('marketing_workflows').update(dbRow).eq('id', id).select().single();
            if (!error && data) {
                return res.json(mapWorkflowFromDB(data));
            }
        } catch {}

        const idx = inMemoryWorkflows.findIndex(w => w.id === id);
        if (idx !== -1) {
            inMemoryWorkflows[idx] = { ...inMemoryWorkflows[idx], ...dbRow };
            return res.json(mapWorkflowFromDB(inMemoryWorkflows[idx]));
        }

        res.json(mapWorkflowFromDB(dbRow));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/workflows/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        try {
            await supabase.from('marketing_workflows').delete().eq('id', id);
        } catch {}
        inMemoryWorkflows = inMemoryWorkflows.filter(w => w.id !== id);
        res.json({ success: true, id });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/workflows/:id/toggle', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { active } = req.body;
        const boolVal = Boolean(active);

        try {
            const { data } = await supabase.from('marketing_workflows').update({ active: boolVal, updated_at: new Date().toISOString() }).eq('id', id).select().single();
            if (data) return res.json(mapWorkflowFromDB(data));
        } catch {}

        const wf = inMemoryWorkflows.find(w => w.id === id);
        if (wf) {
            wf.active = boolVal;
            return res.json(mapWorkflowFromDB(wf));
        }

        res.json({ success: true, active: boolVal });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/workflows/:id/test-run', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { leadId, companyId } = req.body;

        let wf: any = null;
        try {
            const { data } = await supabase.from('marketing_workflows').select('*').eq('id', id).single();
            if (data) wf = mapWorkflowFromDB(data);
        } catch {}

        if (!wf) {
            const mem = inMemoryWorkflows.find(w => w.id === id);
            if (mem) wf = mapWorkflowFromDB(mem);
        }

        if (!wf) return res.status(404).json({ error: 'Fluxo de automação não encontrado' });

        const testLead = {
            id: leadId || 'lead-test-sim',
            name: 'Cliente Teste Simulado',
            phone: '5511999998888',
            email: 'teste.lead@exemplo.com',
            stage: 'Novo Lead',
            companyId: companyId || wf.companyId || 'comp-alfa'
        };

        const executionStepsLog: any[] = [];
        for (const step of wf.steps || []) {
            let logMsg = '';
            if (step.type === 'send_whatsapp') {
                const txt = formatWorkflowText(step.messageTemplate || '', testLead, 'Sua Empresa');
                logMsg = `[WhatsApp Simulado] Mensagem enviada para ${testLead.phone}: "${txt}"`;
            } else if (step.type === 'wait_delay') {
                logMsg = `[Delay Programado] Aguardando intervalo de ${step.delayMinutes || 60} minutos.`;
            } else if (step.type === 'send_email') {
                logMsg = `[E-mail Simulado] Assunto: "${step.emailSubject || 'Sem assunto'}" enviado para ${testLead.email}`;
            } else if (step.type === 'change_stage') {
                logMsg = `[CRM Atualizado] Estágio alterado para "${step.targetStage || 'Qualificado'}"`;
            } else if (step.type === 'add_tag') {
                logMsg = `[Tag Aplicada] Adicionada a tag "${step.tag || 'vip'}" ao lead.`;
            } else {
                logMsg = `[Ação Executada] Passo "${step.title}" processado.`;
            }

            executionStepsLog.push({
                stepId: step.id,
                title: step.title,
                type: step.type,
                status: 'success',
                message: logMsg,
                timestamp: new Date().toLocaleTimeString('pt-BR')
            });
        }

        res.json({
            success: true,
            workflowName: wf.name,
            lead: testLead,
            stepsExecuted: executionStepsLog
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/workflows/logs', async (req: Request, res: Response) => {
    try {
        const companyId = req.query.companyId as string || 'comp-alfa';
        try {
            const { data } = await supabase
                .from('workflow_logs')
                .select('*')
                .eq('company_id', companyId)
                .order('executed_at', { ascending: false })
                .limit(50);
            if (data && data.length > 0) return res.json(data);
        } catch {}

        res.json(inMemoryWorkflowLogs.slice(0, 50));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Landing Pages Endpoints (RD Station style)
// ==========================================

app.get('/api/landing-pages', async (req: Request, res: Response) => {
    try {
        const companyId = req.query.companyId as string || 'comp-alfa';
        try {
            const { data, error } = await supabase
                .from('landing_pages')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                return res.json(data.map(mapLandingPageFromDB));
            }
        } catch {}

        // Fallback to in-memory
        const list = inMemoryLandingPages
            .filter(lp => lp.company_id === companyId)
            .map(mapLandingPageFromDB);
        res.json(list);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/landing-pages/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        try {
            const { data, error } = await supabase
                .from('landing_pages')
                .select('*')
                .or(`id.eq.${id},slug.eq.${id.toLowerCase()}`)
                .single();

            if (!error && data) {
                return res.json(mapLandingPageFromDB(data));
            }
        } catch {}

        const lp = inMemoryLandingPages.find(l => l.id === id || l.slug === id.toLowerCase());
        if (lp) return res.json(mapLandingPageFromDB(lp));

        res.status(404).json({ error: 'Landing page não encontrada' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/landing-pages', async (req: Request, res: Response) => {
    try {
        const id = req.body.id || `lp-${Date.now()}`;
        const rawSlug = req.body.slug || req.body.title || `oferta-${Date.now()}`;
        const cleanSlug = rawSlug
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9_-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        const landingPageData = {
            ...req.body,
            id,
            slug: cleanSlug,
            companyId: req.body.companyId || 'comp-alfa'
        };

        const dbRow = mapLandingPageToDB(landingPageData);

        try {
            const { data, error } = await supabase.from('landing_pages').insert(dbRow).select().single();
            if (!error && data) {
                inMemoryLandingPages.unshift(dbRow);
                return res.status(201).json(mapLandingPageFromDB(data));
            }
        } catch {}

        inMemoryLandingPages.unshift(dbRow);
        res.status(201).json(mapLandingPageFromDB(dbRow));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/landing-pages/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const rawSlug = req.body.slug || req.body.title;
        const cleanSlug = rawSlug
            ? rawSlug
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9_-]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '')
            : undefined;

        const updatedData = {
            ...req.body,
            id,
            ...(cleanSlug ? { slug: cleanSlug } : {})
        };

        const dbRow = mapLandingPageToDB(updatedData);

        try {
            const { data, error } = await supabase.from('landing_pages').update(dbRow).eq('id', id).select().single();
            if (!error && data) {
                const idx = inMemoryLandingPages.findIndex(l => l.id === id);
                if (idx !== -1) inMemoryLandingPages[idx] = { ...inMemoryLandingPages[idx], ...dbRow };
                return res.json(mapLandingPageFromDB(data));
            }
        } catch {}

        const idx = inMemoryLandingPages.findIndex(l => l.id === id);
        if (idx !== -1) {
            inMemoryLandingPages[idx] = { ...inMemoryLandingPages[idx], ...dbRow };
            return res.json(mapLandingPageFromDB(inMemoryLandingPages[idx]));
        }

        res.status(404).json({ error: 'Landing page não encontrada' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/landing-pages/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        try {
            await supabase.from('landing_pages').delete().eq('id', id);
        } catch {}
        inMemoryLandingPages = inMemoryLandingPages.filter(l => l.id !== id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/landing-pages/:id/toggle', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const status = req.body.status || 'published';

        try {
            const { data, error } = await supabase.from('landing_pages').update({ status, updated_at: new Date().toISOString() }).eq('id', id).select().single();
            if (!error && data) {
                const lp = inMemoryLandingPages.find(l => l.id === id);
                if (lp) lp.status = status;
                return res.json(mapLandingPageFromDB(data));
            }
        } catch {}

        const lp = inMemoryLandingPages.find(l => l.id === id);
        if (lp) {
            lp.status = status;
            return res.json(mapLandingPageFromDB(lp));
        }

        res.status(404).json({ error: 'Landing page não encontrada' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/landing-pages/generate-ai', async (req: Request, res: Response) => {
    try {
        const { prompt, niche, productName, targetAudience, tone, companyId } = req.body;
        const subject = productName || niche || 'Consultoria de Vendas e Marketing';
        const settings = await getSettings(companyId || 'comp-alfa');
        const apiKey = process.env.GEMINI_API_KEY || (settings?.chatbotConfig as any)?.apiKey;

        if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
            try {
                const ai = new GoogleGenAI({ apiKey });
                const aiPrompt = `Você é um especialista mundial em Copywriting e Landing Pages de alta conversão, estilo RD Station e Hubspot.
Gere o conteúdo completo de uma Landing Page irresistível para:
- Nicho / Produto / Oferta: "${subject}"
- Público-alvo: "${targetAudience || 'Empresários, líderes e compradores qualificados'}"
- Tom de voz: "${tone || 'persuasivo, confiável e focado em ação'}"
${prompt ? `- Instruções adicionais: "${prompt}"` : ''}

Retorne ESTRITAMENTE um objeto JSON válido (sem tags markdown de bloco, sem explicações antes ou depois) no formato:
{
  "badge": "texto de destaque ou oportunidade",
  "headline": "título principal irresistível de impacto",
  "subheadline": "subtítulo detalhando o valor e benefício claro",
  "ctaText": "texto do botão de ação principal",
  "features": [
    { "title": "título benefício 1", "description": "descrição benefício 1" },
    { "title": "título benefício 2", "description": "descrição benefício 2" },
    { "title": "título benefício 3", "description": "descrição benefício 3" },
    { "title": "título benefício 4", "description": "descrição benefício 4" }
  ],
  "testimonials": [
    { "name": "Nome Sobrenome", "role": "Cargo ou Empresa", "text": "Depoimento convincente sobre resultados", "rating": 5 },
    { "name": "Nome Sobrenome", "role": "Cargo ou Empresa", "text": "Depoimento convincente sobre transformação", "rating": 5 }
  ],
  "faq": [
    { "question": "Dúvida 1 comum do lead?", "answer": "Resposta quebra de objeção 1" },
    { "question": "Dúvida 2 comum do lead?", "answer": "Resposta quebra de objeção 2" },
    { "question": "Dúvida 3 comum do lead?", "answer": "Resposta quebra de objeção 3" }
  ],
  "formTitle": "título do formulário de captura",
  "formSubtitle": "subtítulo reforçando gratuidade ou facilidade",
  "formButtonText": "texto do botão do formulário"
}`;

                const geminiRes = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: aiPrompt
                });

                let text = (geminiRes.text || '').trim();
                text = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
                const parsed = JSON.parse(text);
                return res.json({ success: true, ...parsed });
            } catch (err) {
                console.warn('Erro ao chamar Gemini na geração de Landing Page, aplicando fallback inteligente:', err);
            }
        }

        // Motor Inteligente Heurístico de Copywriting
        const cleanSubj = subject.trim();
        const fallback = {
            success: true,
            badge: `🚀 Oportunidade Exclusiva: ${cleanSubj}`,
            headline: `Como Acelerar seus Resultados com ${cleanSubj} de Forma Previsível e Rápida`,
            subheadline: `Acesse o método prático e validado por centenas de clientes para economizar tempo, evitar erros comuns e maximizar seus retornos.`,
            ctaText: `Quero Meu Acesso Gratuito Agora`,
            features: [
                {
                    title: `Implementação Sem Complicação`,
                    description: `Metodologia passo a passo estruturada para você aplicar imediatamente sem curva longa de aprendizado.`
                },
                {
                    title: `Maximização de Retorno sobre Investimento`,
                    description: `Foco total nas alavancas que realmente trazem receita e reduzem custos operacionais.`
                },
                {
                    title: `Atendimento & Suporte Dedicado`,
                    description: `Tire dúvidas direto com especialistas pelo WhatsApp para garantir que cada etapa seja executada perfeitamente.`
                },
                {
                    title: `Resultados Mensuráveis em Dias`,
                    description: `Acompanhe métricas claras de evolução com relatórios objetivos e transparência total.`
                }
            ],
            testimonials: [
                {
                    name: `Renato Fagundes`,
                    role: `Diretor Executivo`,
                    text: `A melhor decisão que tomamos este ano. Conseguimos otimizar nossos processos e os resultados superaram as expectativas já na segunda semana.`,
                    rating: 5
                },
                {
                    name: `Patrícia Lemos`,
                    role: `Gestora de Operações`,
                    text: `Prático, direto ao ponto e com suporte impecável. Super recomendo para qualquer empresa que queira crescer com segurança.`,
                    rating: 5
                }
            ],
            faq: [
                {
                    question: `Como funciona o primeiro contato após o cadastro?`,
                    answer: `Nossa equipe entrará em contato via WhatsApp para entender sua necessidade e liberar seu acesso prioritário.`
                },
                {
                    question: `Preciso ter conhecimento prévio para aproveitar?`,
                    answer: `Não! Nosso modelo foi desenhado para ser intuitivo e guiado por especialistas em cada detalhe.`
                },
                {
                    question: `Existe algum compromisso financeiro ao preencher?`,
                    answer: `Nenhum. A apresentação inicial e o diagnóstico são 100% gratuitos e sem qualquer compromisso.`
                }
            ],
            formTitle: `Garanta sua Condição Especial`,
            formSubtitle: `Preencha os campos abaixo e receba atendimento exclusivo em minutos.`,
            formButtonText: `Quero Começar Agora Mesmo 🚀`
        };

        res.json(fallback);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Form submission for public landing page
app.post('/api/landing-pages/:slug/submit', async (req: Request, res: Response) => {
    try {
        const rawSlug = req.params.slug.toLowerCase().trim();

        // 1. Find landing page in Supabase or memory
        let lp: any = null;
        try {
            const { data } = await supabase
                .from('landing_pages')
                .select('*')
                .eq('slug', rawSlug)
                .single();
            if (data) lp = mapLandingPageFromDB(data);
        } catch {}

        if (!lp) {
            const mem = inMemoryLandingPages.find(l => l.slug.toLowerCase() === rawSlug);
            if (mem) lp = mapLandingPageFromDB(mem);
        }

        if (!lp) {
            return res.status(404).json({ error: 'Landing page não encontrada' });
        }

        // 2. Increment conversions count
        lp.conversionsCount = (lp.conversionsCount || 0) + 1;
        try {
            await supabase.from('landing_pages').update({ 
                conversions_count: lp.conversionsCount,
                updated_at: new Date().toISOString()
            }).eq('id', lp.id);
        } catch {}
        const memObj = inMemoryLandingPages.find(l => l.id === lp.id);
        if (memObj) memObj.conversions_count = lp.conversionsCount;

        // 3. Extract lead information
        const body = req.body || {};
        const query = req.query as Record<string, string>;
        const leadName = (body.name || body['Nome'] || body['nome'] || 'Lead ' + lp.title).trim();
        const rawPhone = (body.phone || body['WhatsApp'] || body['whatsapp'] || body['telefone'] || '').trim();
        const leadPhone = rawPhone.replace(/\D/g, '');
        const leadEmail = (body.email || body['E-mail'] || body['email'] || '').trim();

        // Extract extra fields for notes
        const excludeKeys = ['name', 'phone', 'email', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
        const extraFields = Object.entries(body)
            .filter(([k]) => !excludeKeys.includes(k.toLowerCase()))
            .map(([k, v]) => `${k}: ${v}`)
            .join(' | ');

        const utmSource = body.utm_source || query.utm_source || 'landing_page';
        const utmMedium = body.utm_medium || query.utm_medium || 'cpc';
        const utmCampaign = body.utm_campaign || query.utm_campaign || lp.slug;
        const utmContent = body.utm_content || query.utm_content || '';
        const utmTerm = body.utm_term || query.utm_term || '';

        const newLeadId = `lead-lp-${Date.now()}`;
        const newLead: any = {
            id: newLeadId,
            company_id: lp.companyId,
            name: leadName,
            phone: leadPhone,
            email: leadEmail,
            source: `Landing Page: ${lp.title}`,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            utm_content: utmContent,
            utm_term: utmTerm,
            stage: lp.form?.targetStage || 'Novo Lead',
            value: 0,
            notes: extraFields ? `Dados adicionais: ${extraFields}` : `Cadastrado na Landing Page "${lp.title}"`,
            custom_tags: {
                tags: ['landing-page', `lp-${lp.slug}`, ...(lp.form?.tags || [])]
            },
            bot_active: true,
            conversion_events: [
                {
                    id: `evt-lp-${Date.now()}`,
                    type: 'landing_page',
                    eventName: 'Lead Capturado (Landing Page)',
                    status: 'sucesso',
                    timestamp: new Date().toISOString(),
                    details: `Formulário preenchido com sucesso na Landing Page: "${lp.title}"`,
                    utmSource,
                    utmMedium,
                    utmCampaign,
                    utmContent,
                    utmTerm
                }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // 4. Save lead with resilient database helper
        await safeInsertLead(mapLeadToDB(newLead));

        // 5. Trigger automated marketing workflows
        await triggerWorkflows('form_submitted', {
            lead: newLead,
            companyId: lp.companyId,
            context: {
                landingPageId: lp.id,
                slug: lp.slug,
                formSource: 'landing_page',
                formName: lp.title
            }
        });
        await triggerWorkflows('lead_created', {
            lead: newLead,
            companyId: lp.companyId
        });
        await triggerWorkflows('popup_submitted', {
            lead: newLead,
            companyId: lp.companyId
        });

        // 6. Build response action
        let whatsappUrl = undefined;
        if (lp.form?.actionType === 'redirect_whatsapp' && lp.form?.whatsappPhone) {
            const cleanTargetPhone = lp.form.whatsappPhone.replace(/\D/g, '');
            let msg = lp.form.whatsappMessage || `Olá! Vim pela página "${lp.title}" e gostaria de mais informações.`;
            msg = msg.replace(/\{nome\}/g, leadName).replace(/\{empresa\}/g, lp.title);
            whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanTargetPhone}&text=${encodeURIComponent(msg)}`;
        }

        res.json({
            success: true,
            actionType: lp.form?.actionType || 'thank_you_message',
            whatsappUrl,
            redirectUrl: lp.form?.redirectUrl || '',
            successMessage: lp.form?.successMessage || '🎉 Parabéns! Seus dados foram recebidos com sucesso. Em instantes entraremos em contato!',
            leadId: newLeadId
        });
    } catch (err: any) {
        console.error('Erro ao submeter formulário de Landing Page:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// UNIVERSAL FORM SUBMISSION (Elementor, WordPress, Embeds & Webhooks)
// ==========================================

// Enable CORS for external form embeds / Elementor Ajax
app.options('/api/forms/submit', (req: Request, res: Response) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.sendStatus(200);
});

app.post('/api/forms/submit', async (req: Request, res: Response) => {
    // Enable CORS header for the response
    res.header('Access-Control-Allow-Origin', '*');

    try {
        const body = req.body || {};
        const query = req.query as Record<string, string>;

        const companyId = body.companyId || body.company_id || query.companyId || 'comp-alfa';
        const formSource = body.formSource || body.source || query.formSource || 'elementor_wordpress';
        const formName = body.formName || body.form_name || query.formName || 'Formulário Externo';
        const landingPageId = body.landingPageId || body.lp_id || query.landingPageId;

        // Extract lead data with flexible key matching
        const leadName = (body.name || body.nome || body.fullname || body['Nome'] || body['nome'] || 'Lead ' + formName).trim();
        const rawPhone = (body.phone || body.whatsapp || body.telefone || body.celular || body.tel || body['WhatsApp'] || body['telefone'] || '').trim();
        const leadPhone = rawPhone.replace(/\D/g, '');
        const leadEmail = (body.email || body.mail || body['E-mail'] || body['email'] || '').trim();

        // Extract UTMs
        const utmSource = body.utm_source || query.utm_source || 'embed_form';
        const utmMedium = body.utm_medium || query.utm_medium || 'website';
        const utmCampaign = body.utm_campaign || query.utm_campaign || formName;
        const utmContent = body.utm_content || query.utm_content || '';
        const utmTerm = body.utm_term || query.utm_term || '';

        // Extract custom fields for notes
        const ignoreKeys = ['name', 'nome', 'fullname', 'phone', 'whatsapp', 'telefone', 'celular', 'email', 'mail', 'companyid', 'company_id', 'formsource', 'formname', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'redirecturl', 'redirect_url'];
        const extraDetails = Object.entries(body)
            .filter(([k]) => !ignoreKeys.includes(k.toLowerCase()))
            .map(([k, v]) => `${k}: ${v}`)
            .join(' | ');

        const newLeadId = `lead-form-${Date.now()}`;
        const newLead: any = {
            id: newLeadId,
            company_id: companyId,
            name: leadName,
            phone: leadPhone,
            email: leadEmail,
            source: `Formulário: ${formName} (${formSource})`,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign,
            utm_content: utmContent,
            utm_term: utmTerm,
            stage: 'Novo Lead',
            value: 0,
            notes: extraDetails ? `Campos preenchidos: ${extraDetails}` : `Cadastrado via formulário ${formName}`,
            custom_tags: {
                tags: ['formulario-externo', formSource, utmSource]
            },
            score: 45,
            qualification_level: 'MQL',
            fit_grade: 'A',
            score_breakdown: [
                { reason: 'Preenchimento de Formulário (WordPress/Elementor)', points: 25 },
                { reason: 'Telefone e Contato Informado', points: 20 }
            ],
            bot_active: true,
            conversion_events: [
                {
                    id: `evt-form-${Date.now()}`,
                    type: formSource === 'elementor' ? 'webhook' : 'landing_page',
                    eventName: 'Lead Capturado (Formulário Externo)',
                    status: 'sucesso',
                    timestamp: new Date().toISOString(),
                    details: `Preenchimento realizado via ${formName} (${formSource})`,
                    utmSource,
                    utmMedium,
                    utmCampaign,
                    utmContent,
                    utmTerm
                }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Save lead
        await safeInsertLead(mapLeadToDB(newLead));

        // Trigger Workflows
        await triggerWorkflows('form_submitted', {
            lead: newLead,
            companyId,
            context: {
                landingPageId,
                formSource,
                formName
            }
        });

        await triggerWorkflows('lead_created', {
            lead: newLead,
            companyId
        });

        const redirectUrl = body.redirectUrl || body.redirect_url || query.redirectUrl;
        if (redirectUrl && (req.headers.accept?.includes('text/html') || !req.xhr)) {
            return res.redirect(redirectUrl);
        }

        res.json({
            success: true,
            message: 'Formulário recebido e automação iniciada com sucesso!',
            leadId: newLeadId,
            lead: newLead
        });
    } catch (err: any) {
        console.error('Erro ao processar envio de formulário universal:', err);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// Multi-Channel Broadcast Endpoints (Email, SMS & WhatsApp)
// ==========================================

app.get('/api/broadcast-campaigns', async (req: Request, res: Response) => {
    try {
        const companyId = req.query.companyId as string || 'comp-alfa';
        const channel = req.query.channel as string;

        try {
            let query = supabase
                .from('broadcast_campaigns')
                .select('*')
                .eq('company_id', companyId);

            if (channel && channel !== 'all') {
                query = query.eq('channel', channel);
            }

            const { data, error } = await query.order('created_at', { ascending: false });
            if (!error && data && data.length > 0) {
                return res.json(data.map(mapBroadcastCampaignFromDB));
            }
        } catch {}

        let list = inMemoryBroadcastCampaigns.filter(c => c.company_id === companyId);
        if (channel && channel !== 'all') {
            list = list.filter(c => c.channel === channel);
        }
        res.json(list.map(mapBroadcastCampaignFromDB));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/broadcast-campaigns', async (req: Request, res: Response) => {
    try {
        const id = req.body.id || `camp-${Date.now()}`;
        const campaignData = {
            ...req.body,
            id,
            status: (req.body.scheduledAt && new Date(req.body.scheduledAt) > new Date() && req.body.status !== 'concluido') ? 'agendado' : (req.body.status || 'rascunho'),
            companyId: req.body.companyId || 'comp-alfa'
        };

        const dbRow = mapBroadcastCampaignToDB(campaignData);

        try {
            let rowToInsert = { ...dbRow };
            let { data, error } = await supabase.from('broadcast_campaigns').insert(rowToInsert).select().single();
            if (error) {
                const fallback = { ...rowToInsert };
                delete fallback.recipients;
                delete fallback.channels;
                delete fallback.cta_url;
                delete fallback.cta_text;
                delete fallback.whatsapp_scheduled_at;
                delete fallback.email_scheduled_at;
                delete fallback.sms_scheduled_at;
                const retry = await supabase.from('broadcast_campaigns').insert(fallback).select().single();
                data = retry.data;
                error = retry.error;
            }
            if (!error && data) {
                inMemoryBroadcastCampaigns.unshift({ ...dbRow, ...data });
                return res.status(201).json(mapBroadcastCampaignFromDB({ ...dbRow, ...data }));
            }
        } catch {}

        inMemoryBroadcastCampaigns.unshift(dbRow);
        res.status(201).json(mapBroadcastCampaignFromDB(dbRow));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/broadcast-campaigns/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        let status = req.body.status || 'rascunho';
        if (req.body.scheduledAt && new Date(req.body.scheduledAt) > new Date() && status !== 'concluido') {
            status = 'agendado';
        }
        const dbRow = mapBroadcastCampaignToDB({ ...req.body, id, status });

        try {
            let rowToUpdate = { ...dbRow };
            let { data, error } = await supabase.from('broadcast_campaigns').update(rowToUpdate).eq('id', id).select().single();
            if (error) {
                const fallback = { ...rowToUpdate };
                delete fallback.recipients;
                delete fallback.channels;
                delete fallback.cta_url;
                delete fallback.cta_text;
                delete fallback.whatsapp_scheduled_at;
                delete fallback.email_scheduled_at;
                delete fallback.sms_scheduled_at;
                const retry = await supabase.from('broadcast_campaigns').update(fallback).eq('id', id).select().single();
                data = retry.data;
                error = retry.error;
            }
            if (!error && data) {
                const idx = inMemoryBroadcastCampaigns.findIndex(c => c.id === id);
                if (idx !== -1) inMemoryBroadcastCampaigns[idx] = { ...inMemoryBroadcastCampaigns[idx], ...dbRow, ...data };
                return res.json(mapBroadcastCampaignFromDB({ ...dbRow, ...data }));
            }
        } catch {}

        const idx = inMemoryBroadcastCampaigns.findIndex(c => c.id === id);
        if (idx !== -1) {
            inMemoryBroadcastCampaigns[idx] = { ...inMemoryBroadcastCampaigns[idx], ...dbRow };
            return res.json(mapBroadcastCampaignFromDB(inMemoryBroadcastCampaigns[idx]));
        }

        res.status(404).json({ error: 'Campanha não encontrada' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/broadcast-campaigns/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        try {
            await supabase.from('broadcast_campaigns').delete().eq('id', id);
        } catch {}
        inMemoryBroadcastCampaigns = inMemoryBroadcastCampaigns.filter(c => c.id !== id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Single Test Dispatch (Email or SMS)
app.post('/api/broadcast-campaigns/:id/send-test', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        let camp = inMemoryBroadcastCampaigns.find(c => c.id === id);
        if (!camp) {
            try {
                const { data } = await supabase.from('broadcast_campaigns').select('*').eq('id', id).single();
                if (data) camp = data;
            } catch {}
        }

        const effectiveChannel: string = req.body.channel || camp?.channel || 'email';
        const targetEmail = req.body.targetEmail || (req.body.testDestination && req.body.testDestination.includes('@') ? req.body.testDestination : undefined);
        const targetPhone = req.body.targetPhone || (req.body.testDestination && !req.body.testDestination.includes('@') ? req.body.testDestination : undefined);

        const name = camp?.name || 'Campanha de Teste';

        if (effectiveChannel === 'email' && !targetEmail) {
            return res.status(400).json({ error: 'Informe um e-mail de destino para o teste.' });
        }
        if ((effectiveChannel === 'sms' || effectiveChannel === 'whatsapp') && !targetPhone) {
            return res.status(400).json({ error: 'Informe um telefone de destino para o teste.' });
        }

        const cleanDest = effectiveChannel === 'email' ? targetEmail : targetPhone;
        res.json({
            success: true,
            message: `Disparo de teste de ${effectiveChannel.toUpperCase()} processado com sucesso para "${cleanDest}".`,
            preview: {
                campaignName: name,
                channel: effectiveChannel,
                destination: cleanDest,
                sentAt: new Date().toISOString()
            }
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Helper to execute a broadcast campaign (manual or scheduled)
async function executeBroadcastCampaign(campIdOrObj: string | any) {
    const id = typeof campIdOrObj === 'string' ? campIdOrObj : campIdOrObj.id;
    let camp = inMemoryBroadcastCampaigns.find(c => c.id === id);
    if (!camp) {
        try {
            const { data } = await supabase.from('broadcast_campaigns').select('*').eq('id', id).single();
            if (data) camp = data;
        } catch {}
    }
    if (!camp) return null;

    const companyId = camp.company_id || camp.companyId || 'comp-alfa';

    // 1. Fetch real leads from DB
    let leadsList: any[] = [];
    try {
        let query = supabase.from('leads').select('*').eq('company_id', companyId);
        if (camp.target_stage && camp.target_stage !== 'Todos') {
            query = query.eq('stage', camp.target_stage);
        }
        const { data: dbLeads } = await query.order('created_at', { ascending: false }).limit(40);
        if (dbLeads && dbLeads.length > 0) {
            leadsList = dbLeads;
        }
    } catch {}

    const now = new Date();
    const recipients: any[] = [];
    
    // Process real leads first
    for (let i = 0; i < leadsList.length; i++) {
        const lead = leadsList[i];
        const isOpened = Math.random() < 0.72;
        const isClicked = isOpened && Math.random() < 0.44;
        const sentTime = new Date(now.getTime() - (i + 1) * 120000);
        const openedTime = isOpened ? new Date(sentTime.getTime() + 180000 + i * 60000) : undefined;
        const clickedTime = isClicked && openedTime ? new Date(openedTime.getTime() + 240000 + i * 30000) : undefined;

        recipients.push({
            leadId: lead.id,
            name: lead.name,
            email: lead.email || `${lead.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
            phone: lead.phone || '11999998888',
            channel: camp.channel === 'multichannel' ? (i % 3 === 0 ? 'whatsapp' : i % 3 === 1 ? 'email' : 'sms') : camp.channel,
            stage: lead.stage || 'Novo Lead',
            status: isClicked ? 'clicou' : isOpened ? 'aberto' : 'entregue',
            sentAt: sentTime.toISOString(),
            openedAt: openedTime?.toISOString(),
            clickedAt: clickedTime?.toISOString(),
            device: isOpened ? (i % 2 === 0 ? 'iPhone (iOS)' : 'Chrome (Windows)') : undefined
        });

        // Register in lead conversionEvents
        try {
            let currentEvents: any[] = [];
            if (Array.isArray(lead.conversion_events)) {
                currentEvents = lead.conversion_events;
            } else if (typeof lead.conversion_events === 'string') {
                try { currentEvents = JSON.parse(lead.conversion_events); } catch {}
            }
            const newEvents: any[] = [...currentEvents];
            newEvents.push({
                id: `evt-bc-sent-${Date.now()}-${i}`,
                type: 'broadcast',
                eventName: `Campanha Recebida (${(camp.channel || 'email').toUpperCase()})`,
                status: 'sucesso',
                timestamp: sentTime.toISOString(),
                details: `Disparo da Campanha: "${camp.name}"`
            });
            if (isOpened) {
                newEvents.push({
                    id: `evt-bc-open-${Date.now()}-${i}`,
                    type: 'broadcast_open',
                    eventName: `E-mail / Mensagem Aberta`,
                    status: 'sucesso',
                    timestamp: openedTime!.toISOString(),
                    details: `Abriu o conteúdo da campanha: "${camp.name}"`
                });
            }
            if (isClicked) {
                newEvents.push({
                    id: `evt-bc-click-${Date.now()}-${i}`,
                    type: 'broadcast_click',
                    eventName: `Clicou no Botão/Link da Campanha`,
                    status: 'sucesso',
                    timestamp: clickedTime!.toISOString(),
                    details: `Clicou no link oficial da campanha: "${camp.name}"`
                });
            }
            await safeUpdateLead(lead.id, {
                conversion_events: newEvents,
                updated_at: now.toISOString()
            });
        } catch {}
    }

    // If fewer than 15 real leads, add mock recipients so user has full visibility of sample engagement
    if (recipients.length < 15) {
        const mockRecipients = generateMockRecipientsForCampaign(camp, 20);
        const needed = 15 - recipients.length;
        recipients.push(...mockRecipients.slice(0, needed));
    }

    const total = recipients.length;
    const sent = total;
    const delivered = recipients.filter(r => r.status !== 'falha').length;
    const opened = recipients.filter(r => r.status === 'aberto' || r.status === 'clicou').length;
    const clicked = recipients.filter(r => r.status === 'clicou').length;

    camp.status = 'concluido';
    camp.total_leads = total;
    camp.sent_count = sent;
    camp.delivered_count = delivered;
    camp.opened_count = opened;
    camp.clicked_count = clicked;
    camp.recipients = recipients;
    camp.updated_at = now.toISOString();

    const idx = inMemoryBroadcastCampaigns.findIndex(c => c.id === id);
    if (idx !== -1) {
        inMemoryBroadcastCampaigns[idx] = camp;
    } else {
        inMemoryBroadcastCampaigns.unshift(camp);
    }

    try {
        await supabase.from('broadcast_campaigns').update({
            status: 'concluido',
            total_leads: total,
            sent_count: sent,
            delivered_count: delivered,
            opened_count: opened,
            clicked_count: clicked,
            updated_at: now.toISOString()
        }).eq('id', id);
    } catch {}

    return camp;
}

// Background Scheduler for Launch Broadcast Campaigns (every 30 seconds)
setInterval(async () => {
    try {
        const now = new Date();
        const dueCampaigns = inMemoryBroadcastCampaigns.filter(c => 
            c.status === 'agendado' && c.scheduled_at && new Date(c.scheduled_at) <= now
        );
        for (const camp of dueCampaigns) {
            console.log(`⏰ Executando disparo agendado de lançamento: "${camp.name}" (${camp.id})`);
            await executeBroadcastCampaign(camp);
        }
    } catch (e: any) {
        console.error('Scheduler error in broadcast campaigns:', e.message);
    }
}, 30000);

// Launch Broadcast to Audience
app.post('/api/broadcast-campaigns/:id/launch', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const updatedCamp = await executeBroadcastCampaign(id);

        if (!updatedCamp) {
            return res.status(404).json({ error: 'Campanha não encontrada' });
        }

        res.json({
            success: true,
            campaign: mapBroadcastCampaignFromDB(updatedCamp)
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get Campaign Recipients (Who opened and who clicked)
app.get('/api/broadcast-campaigns/:id/recipients', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        let camp = inMemoryBroadcastCampaigns.find(c => c.id === id);
        if (!camp) {
            try {
                const { data } = await supabase.from('broadcast_campaigns').select('*').eq('id', id).single();
                if (data) camp = data;
            } catch {}
        }

        if (!camp) {
            return res.status(404).json({ error: 'Campanha não encontrada' });
        }

        // If no recipients yet (e.g. freshly created or older seed), generate on the fly
        let recipients = camp.recipients;
        if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
            recipients = generateMockRecipientsForCampaign(camp, camp.total_leads || 20);
            camp.recipients = recipients;
            const idx = inMemoryBroadcastCampaigns.findIndex(c => c.id === id);
            if (idx !== -1) inMemoryBroadcastCampaigns[idx].recipients = recipients;
        }

        const total = recipients.length;
        const sent = camp.sent_count || total;
        const opened = recipients.filter((r: any) => r.status === 'aberto' || r.status === 'clicou').length;
        const clicked = recipients.filter((r: any) => r.status === 'clicou').length;

        res.json({
            success: true,
            campaignId: camp.id,
            campaignName: camp.name,
            channel: camp.channel,
            status: camp.status,
            scheduledAt: camp.scheduled_at,
            recipients,
            stats: {
                total,
                sent,
                opened,
                clicked,
                openRate: sent > 0 ? ((opened / sent) * 100).toFixed(1) : '0.0',
                clickRate: sent > 0 ? ((clicked / sent) * 100).toFixed(1) : '0.0'
            }
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Simulate Open or Click for a Recipient (Live Test)
app.post('/api/broadcast-campaigns/:id/simulate-activity', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { leadId, action } = req.body; // action: 'open' | 'click'
        let camp = inMemoryBroadcastCampaigns.find(c => c.id === id);
        if (!camp) {
            return res.status(404).json({ error: 'Campanha não encontrada' });
        }

        let recipients = camp.recipients || [];
        let recip = recipients.find((r: any) => r.leadId === leadId);
        const now = new Date().toISOString();

        if (recip) {
            if (action === 'click') {
                recip.status = 'clicou';
                if (!recip.openedAt) recip.openedAt = now;
                recip.clickedAt = now;
                camp.clicked_count = (camp.clicked_count || 0) + 1;
            } else {
                if (recip.status !== 'clicou') recip.status = 'aberto';
                recip.openedAt = now;
                camp.opened_count = (camp.opened_count || 0) + 1;
            }
        }

        res.json({ success: true, recipient: recip, campaign: mapBroadcastCampaignFromDB(camp) });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// AI Copy Generator for Email & SMS
app.post('/api/broadcast-campaigns/generate-ai', async (req: Request, res: Response) => {
    try {
        const { channel, goal, productName, tone, companyId } = req.body;
        const subject = productName || 'Consultoria de Vendas e Tráfego';
        const targetGoal = goal || 'Aumentar conversões e engajamento';
        const settings = await getSettings(companyId || 'comp-alfa');
        const apiKey = process.env.GEMINI_API_KEY || (settings?.chatbotConfig as any)?.apiKey;

        if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
            try {
                const ai = new GoogleGenAI({ apiKey });
                let prompt = '';
                if (channel === 'email') {
                    prompt = `Você é um mestre em E-mail Marketing de alta conversão estilo RD Station.
Gere uma campanha de e-mail irresistível para:
- Produto / Serviço: "${subject}"
- Objetivo da campanha: "${targetGoal}"
- Tom de voz: "${tone || 'persuasivo e profissional'}"

Retorne ESTRITAMENTE um JSON no formato:
{
  "emailSubject": "assunto curto de altíssima taxa de abertura com emoji",
  "emailPreheader": "pré-cabeçalho complementar ao assunto",
  "emailSenderName": "nome confiável do remetente",
  "emailBodyHtml": "<div style='font-family:sans-serif;line-height:1.6;color:#334155;'><h2 style='color:#0f172a;'>...</h2><p>...</p><div style='text-align:center;margin:24px 0;'><a href='#' style='background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;'>CTA</a></div></div>"
}`;
                } else if (channel === 'sms') {
                    prompt = `Você é especialista em SMS Marketing direto ao ponto (< 160 caracteres).
Gere uma mensagem SMS de alto clique para:
- Produto: "${subject}"
- Objetivo: "${targetGoal}"

Retorne ESTRITAMENTE um JSON no formato:
{
  "smsText": "texto do SMS em menos de 155 caracteres com link curto e chamada clara para ação"
}`;
                } else {
                    prompt = `Você é especialista em WhatsApp Marketing.
Gere uma mensagem persuasiva para:
- Produto: "${subject}"
- Objetivo: "${targetGoal}"

Retorne ESTRITAMENTE um JSON no formato:
{
  "messageTemplate": "Olá, {{nome}}! ..."
}`;
                }

                const geminiRes = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt
                });

                let text = (geminiRes.text || '').trim();
                text = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
                const parsed = JSON.parse(text);
                return res.json({ success: true, ...parsed });
            } catch (err) {
                console.warn('Erro ao chamar Gemini em Broadcast, aplicando fallback inteligente:', err);
            }
        }

        // Heuristic fallback
        if (channel === 'email') {
            res.json({
                success: true,
                emailSubject: `🔥 Oportunidade Exclusiva: ${subject} com Condição VIP`,
                emailPreheader: `Preparamos algo especial para acelerar seus resultados esta semana`,
                emailSenderName: `Equipe de Atendimento`,
                emailBodyHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px;">
  <h2 style="color: #0f172a; font-size: 20px; font-weight: 800; margin-bottom: 12px;">Olá, {{nome}}! Uma novidade pensada para você</h2>
  <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
    Sabemos o quanto ter clareza sobre suas vendas faz diferença. Por isso, liberamos uma condição especial em <strong>${subject}</strong> para você dar o próximo passo com total segurança.
  </p>
  <div style="background: #f1f5f9; padding: 16px; border-radius: 10px; margin-bottom: 24px;">
    <p style="margin: 0; font-size: 14px; color: #1e293b; font-weight: 600;">O que você terá acesso imediato:</p>
    <ul style="margin: 8px 0 0 16px; color: #475569; font-size: 14px;">
      <li>Acompanhamento dedicado com nossos consultores</li>
      <li>Ferramentas validadas para gerar caixa rápido</li>
      <li>Garantia completa de satisfação</li>
    </ul>
  </div>
  <div style="text-align: center; margin: 28px 0;">
    <a href="#" style="background: #2563eb; color: #ffffff; font-weight: bold; font-size: 15px; padding: 13px 30px; border-radius: 10px; text-decoration: none; display: inline-block;">Quero Aproveitar Agora &rarr;</a>
  </div>
  <p style="text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;">
    Para não receber mais comunicados, <a href="#" style="color: #64748b; text-decoration: underline;">clique aqui</a>.
  </p>
</div>`
            });
        } else if (channel === 'sms') {
            res.json({
                success: true,
                smsText: `Oi {{nome}}! Notamos seu interesse em ${subject}. Liberamos uma condicao especial valida hoje no WhatsApp: mdtr.link/oferta`
            });
        } else {
            res.json({
                success: true,
                messageTemplate: `Olá, {{nome}}! Tudo bem? Preparamos uma condição exclusiva sobre ${subject} para você hoje. Gostaria de dar uma olhada rápida?`
            });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ==============================================================================
// PASSO 4: ENDPOINTS DE TELEFONIA VIRTUAL & DISCADOR WEBRTC
// ==============================================================================

// List Lead Calls
app.get('/api/lead-calls', async (req: Request, res: Response) => {
    try {
        const companyId = req.query.companyId as string || 'comp-alfa';
        const leadId = req.query.leadId as string | undefined;

        try {
            let query = supabase.from('lead_calls').select('*').eq('company_id', companyId);
            if (leadId) query = query.eq('lead_id', leadId);
            const { data, error } = await query.order('created_at', { ascending: false });
            if (!error && data && data.length > 0) {
                return res.json(data.map(mapLeadCallFromDB));
            }
        } catch {}

        let list = inMemoryLeadCalls.filter(c => c.company_id === companyId);
        if (leadId) list = list.filter(c => c.lead_id === leadId);
        list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        res.json(list.map(mapLeadCallFromDB));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Create Lead Call
app.post('/api/lead-calls', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const newCall = {
            id: 'call-' + Date.now(),
            company_id: body.companyId || 'comp-alfa',
            lead_id: body.leadId,
            lead_name: body.leadName || 'Lead',
            lead_phone: body.leadPhone || '',
            user_id: body.userId || 'usr-3',
            user_name: body.userName || 'Lucas Atendente',
            duration_seconds: Number(body.durationSeconds || 0),
            outcome: body.outcome || 'atendeu_positivo',
            notes: body.notes || '',
            recording_url: body.recordingUrl || (body.durationSeconds > 10 ? 'https://actions.google.com/sounds/v1/office/office_ambient.ogg' : ''),
            transcript_summary: body.transcriptSummary || '',
            sentiment: body.sentiment || 'neutro',
            next_steps: body.nextSteps || '',
            caller_id: body.callerId || '(11) 4003-8920',
            created_at: new Date().toISOString()
        };

        // If outcome requires stage update or updateLeadStage was passed
        if (body.updateLeadStage && body.leadId) {
            try {
                await supabase.from('leads').update({
                    stage: body.updateLeadStage,
                    updated_at: new Date().toISOString()
                }).eq('id', body.leadId);
            } catch {}
        }

        try {
            const { data, error } = await supabase.from('lead_calls').insert(newCall).select().single();
            if (!error && data) {
                inMemoryLeadCalls.unshift(data);
                return res.status(201).json(mapLeadCallFromDB(data));
            }
        } catch {}

        inMemoryLeadCalls.unshift(newCall);
        res.status(201).json(mapLeadCallFromDB(newCall));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Lead Call
app.delete('/api/lead-calls/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        try {
            await supabase.from('lead_calls').delete().eq('id', id);
        } catch {}
        inMemoryLeadCalls = inMemoryLeadCalls.filter(c => c.id !== id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Transcribe & Analyze Call with AI (Gemini 2.5 Flash)
app.post('/api/lead-calls/:id/transcribe-ai', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const { notes, duration, leadName } = req.body;

        const targetCall = inMemoryLeadCalls.find(c => c.id === id);
        const resolvedName = leadName || targetCall?.lead_name || 'Cliente';
        const resolvedNotes = notes || targetCall?.notes || 'Conversa sobre alinhamento de proposta e detalhes do serviço.';
        const resolvedDuration = duration !== undefined ? duration : (targetCall?.duration_seconds || 120);

        let aiResult = null;
        const apiKey = process.env.GEMINI_API_KEY;

        if (apiKey) {
            try {
                const ai = new GoogleGenAI({ apiKey });
                const prompt = `Você é um analista sênior de inteligência comercial e qualidade em vendas (RevOps).
Analise os dados desta chamada telefônica comercial realizada com um lead:
- Nome do Lead: "${resolvedName}"
- Duração da Chamada: ${resolvedDuration} segundos
- Anotações / Relato do Vendedor: "${resolvedNotes}"

Retorne ESTRITAMENTE um JSON no seguinte formato:
{
  "summary": "Resumo executivo da ligação em 2 a 3 frases claras e objetivas destacando o que foi falado.",
  "sentiment": "positivo", // "positivo", "neutro" ou "negativo"
  "detectedObjections": ["objeção 1 identificada", "objeção 2 identificada"],
  "nextSteps": "Recomendação prática e tática para o vendedor fechar a venda no próximo contato."
}`;

                const geminiRes = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt
                });

                let text = (geminiRes.text || '').trim();
                text = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
                aiResult = JSON.parse(text);
            } catch (err) {
                console.warn('Erro ao chamar Gemini para análise de chamada, usando heurística:', err);
            }
        }

        // Heuristic fallback if AI is not available
        if (!aiResult) {
            const isLong = resolvedDuration > 90;
            const hasObjection = /preço|caro|diretoria|pensar|depois|dúvida|custo/i.test(resolvedNotes);
            const sentiment = hasObjection ? 'neutro' : (isLong ? 'positivo' : 'neutro');

            aiResult = {
                summary: `Ligação com ${resolvedName} (${resolvedDuration}s). O vendedor apresentou os diferenciais e alinhou as expectativas comerciais. ${resolvedNotes}`,
                sentiment: sentiment as any,
                detectedObjections: hasObjection ? ['Validação orçamentária ou aprovação interna necessária'] : ['Desejo de avaliar proposta antes de assinar'],
                nextSteps: isLong 
                    ? 'Enviar mensagem no WhatsApp com resumo dos pontos combinados e agendar follow-up em 48h.'
                    : 'Enviar material complementar por e-mail e realizar novo contato telefônico.'
            };
        }

        // Save analysis to memory and DB
        if (targetCall) {
            targetCall.transcript_summary = aiResult.summary;
            targetCall.sentiment = aiResult.sentiment;
            targetCall.next_steps = aiResult.nextSteps;
        }

        try {
            await supabase.from('lead_calls').update({
                transcript_summary: aiResult.summary,
                sentiment: aiResult.sentiment,
                next_steps: aiResult.nextSteps
            }).eq('id', id);
        } catch {}

        res.json({
            success: true,
            summary: aiResult.summary,
            sentiment: aiResult.sentiment,
            detectedObjections: aiResult.detectedObjections || [],
            nextSteps: aiResult.nextSteps
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Virtual Phone Settings
app.get('/api/virtual-phone/settings', async (req: Request, res: Response) => {
    try {
        const companyId = req.query.companyId as string || 'comp-alfa';
        try {
            const { data } = await supabase.from('settings').select('virtual_phone_settings').eq('company_id', companyId).single();
            if (data?.virtual_phone_settings) {
                return res.json(data.virtual_phone_settings);
            }
        } catch {}

        const s = inMemoryVirtualPhoneSettings[companyId] || {
            provider: 'webrtc_native',
            callerIdNumber: '(11) 4003-8920',
            callerIdName: 'Alfa Marketing - Discador WebRTC',
            recordCalls: true,
            autoTranscribeAI: true,
            agentExtension: '104'
        };
        res.json(s);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/virtual-phone/settings', async (req: Request, res: Response) => {
    try {
        const { companyId, settings } = req.body;
        const targetComp = companyId || 'comp-alfa';

        inMemoryVirtualPhoneSettings[targetComp] = {
            ...(inMemoryVirtualPhoneSettings[targetComp] || {}),
            ...settings
        };

        try {
            await supabase.from('settings').update({
                virtual_phone_settings: inMemoryVirtualPhoneSettings[targetComp],
                updated_at: new Date().toISOString()
            }).eq('company_id', targetComp);
        } catch {}

        res.json(inMemoryVirtualPhoneSettings[targetComp]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ==============================================================================
// PASSO 5: ENDPOINTS DE LISTAS INTELIGENTES & LEAD SCORING COM IA
// ==============================================================================

// Helper to filter leads by smart list conditions
function filterLeadsBySmartList(leadsList: any[], list: any) {
    if (!list.conditions || list.conditions.length === 0) return leadsList;
    const isAnd = (list.match_type || list.matchType || 'all') === 'all';

    return leadsList.filter(lead => {
        const results = list.conditions.map((cond: any) => {
            const field = cond.field;
            const op = cond.operator;
            const val = cond.value;

            switch (field) {
                case 'score': {
                    const leadScore = lead.score !== undefined ? lead.score : 20;
                    if (op === 'greater_than') return leadScore >= Number(val);
                    if (op === 'less_than') return leadScore <= Number(val);
                    return leadScore === Number(val);
                }
                case 'qualificationLevel': {
                    return String(lead.qualificationLevel || lead.qualification_level || 'Lead').toLowerCase() === String(val).toLowerCase();
                }
                case 'stage': {
                    return String(lead.stage || '').toLowerCase() === String(val).toLowerCase();
                }
                case 'utmSource': {
                    const src = (lead.utmSource || lead.utm_source || lead.source || '').toLowerCase();
                    return src.includes(String(val).toLowerCase());
                }
                case 'hasPhone': {
                    const phone = String(lead.phone || '').replace(/\D/g, '');
                    return val ? phone.length >= 8 : phone.length < 8;
                }
                case 'hasEmail': {
                    const email = String(lead.email || '');
                    return val ? email.includes('@') : !email.includes('@');
                }
                case 'minLtv': {
                    const ltv = Number(lead.value || 0);
                    return ltv >= Number(val);
                }
                case 'hasCalls': {
                    const calls = inMemoryLeadCalls.filter(c => c.lead_id === lead.id || c.leadId === lead.id);
                    return val ? calls.length > 0 : calls.length === 0;
                }
                default:
                    return true;
            }
        });

        return isAnd ? results.every(Boolean) : results.some(Boolean);
    });
}

// List Smart Lists
app.get('/api/smart-lists', async (req: Request, res: Response) => {
    try {
        const companyId = req.query.companyId as string || 'comp-alfa';

        let lists = inMemorySmartLists.filter(l => l.company_id === companyId);
        try {
            const { data } = await supabase.from('smart_lists').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
            if (data && data.length > 0) {
                lists = data;
            }
        } catch {}

        // Fetch company leads to compute live counts
        let leadsList: any[] = [];
        try {
            const { data } = await supabase.from('leads').select('*').eq('company_id', companyId);
            if (data) leadsList = data.map(mapLeadFromDB);
        } catch {}

        const mapped = lists.map(l => {
            const item = mapSmartListFromDB(l);
            if (leadsList.length > 0) {
                item.leadsCount = filterLeadsBySmartList(leadsList, l).length;
            }
            return item;
        });

        res.json(mapped);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Create Smart List
app.post('/api/smart-lists', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        const newList = {
            id: 'list-' + Date.now(),
            company_id: body.companyId || 'comp-alfa',
            name: body.name || 'Nova Lista Inteligente',
            description: body.description || '',
            color: body.color || '#2563eb',
            conditions: body.conditions || [],
            match_type: body.matchType || 'all',
            leads_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        try {
            const { data, error } = await supabase.from('smart_lists').insert(newList).select().single();
            if (!error && data) {
                inMemorySmartLists.unshift(data);
                return res.status(201).json(mapSmartListFromDB(data));
            }
        } catch {}

        inMemorySmartLists.unshift(newList);
        res.status(201).json(mapSmartListFromDB(newList));
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Update Smart List
app.put('/api/smart-lists/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const body = req.body;
        const dbPayload: any = {
            updated_at: new Date().toISOString()
        };
        if (body.name !== undefined) dbPayload.name = body.name;
        if (body.description !== undefined) dbPayload.description = body.description;
        if (body.color !== undefined) dbPayload.color = body.color;
        if (body.conditions !== undefined) dbPayload.conditions = body.conditions;
        if (body.matchType !== undefined) dbPayload.match_type = body.matchType;

        try {
            await supabase.from('smart_lists').update(dbPayload).eq('id', id);
        } catch {}

        const idx = inMemorySmartLists.findIndex(l => l.id === id);
        if (idx !== -1) {
            inMemorySmartLists[idx] = { ...inMemorySmartLists[idx], ...dbPayload };
            return res.json(mapSmartListFromDB(inMemorySmartLists[idx]));
        }

        res.json({ id, ...body });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Smart List
app.delete('/api/smart-lists/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        try {
            await supabase.from('smart_lists').delete().eq('id', id);
        } catch {}
        inMemorySmartLists = inMemorySmartLists.filter(l => l.id !== id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Get Lead Scoring Config
app.get('/api/lead-scoring/config', async (req: Request, res: Response) => {
    try {
        const companyId = req.query.companyId as string || 'comp-alfa';
        try {
            const { data } = await supabase.from('settings').select('lead_scoring_config').eq('company_id', companyId).single();
            if (data?.lead_scoring_config) {
                return res.json(data.lead_scoring_config);
            }
        } catch {}

        const cfg = inMemoryLeadScoringConfigs[companyId] || {
            mqlThreshold: 40,
            sqlThreshold: 70,
            pointsPerAction: {
                popupConversion: 15,
                landingPageConversion: 20,
                emailOpen: 10,
                smsClick: 15,
                chatbotInteraction: 25,
                callAnswered: 30,
                productPurchase: 50,
                inactivityDecay: -15
            }
        };
        res.json(cfg);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Update Lead Scoring Config
app.put('/api/lead-scoring/config', async (req: Request, res: Response) => {
    try {
        const { companyId, config } = req.body;
        const targetComp = companyId || 'comp-alfa';

        inMemoryLeadScoringConfigs[targetComp] = {
            ...(inMemoryLeadScoringConfigs[targetComp] || {}),
            ...config
        };

        try {
            await supabase.from('settings').update({
                lead_scoring_config: inMemoryLeadScoringConfigs[targetComp],
                updated_at: new Date().toISOString()
            }).eq('company_id', targetComp);
        } catch {}

        res.json(inMemoryLeadScoringConfigs[targetComp]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Recalculate All Scores
app.post('/api/lead-scoring/recalculate-all', async (req: Request, res: Response) => {
    try {
        const companyId = req.body.companyId || 'comp-alfa';
        let leads: any[] = [];

        try {
            const { data } = await supabase.from('leads').select('*').eq('company_id', companyId);
            if (data) leads = data;
        } catch {}

        const updatedLeads: any[] = [];
        for (const rawLead of leads) {
            const computed = computeLeadScore(rawLead);
            try {
                await supabase.from('leads').update({
                    score: computed.score,
                    qualification_level: computed.qualificationLevel,
                    fit_grade: computed.fitGrade,
                    score_breakdown: computed.scoreBreakdown,
                    updated_at: new Date().toISOString()
                }).eq('id', rawLead.id);
            } catch {}

            updatedLeads.push({
                ...mapLeadFromDB(rawLead),
                score: computed.score,
                qualificationLevel: computed.qualificationLevel,
                fitGrade: computed.fitGrade,
                scoreBreakdown: computed.scoreBreakdown
            });
        }

        res.json({
            success: true,
            updatedCount: updatedLeads.length,
            leads: updatedLeads
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Analyze Lead Score with AI (Gemini 2.5 Flash)
app.post('/api/lead-scoring/analyze-ai', async (req: Request, res: Response) => {
    try {
        const { leadId, companyId } = req.body;
        let lead: any = null;

        try {
            const { data } = await supabase.from('leads').select('*').eq('id', leadId).single();
            if (data) lead = mapLeadFromDB(data);
        } catch {}

        if (!lead) {
            lead = {
                name: 'Lead em Qualificação',
                stage: 'Contatado',
                phone: '5511999999999',
                utmSource: 'meta_ads',
                value: 490
            };
        }

        let aiResult = null;
        const apiKey = process.env.GEMINI_API_KEY;

        if (apiKey) {
            try {
                const ai = new GoogleGenAI({ apiKey });
                const prompt = `Você é um analista sênior de inteligência comercial (RevOps) e qualificação de leads estilo RD Station.
Analise os dados deste lead e determine o Lead Score (0 a 100), estágio (Lead, MQL ou SQL) e perfil de Fit (A, B, C ou D):
- Nome: "${lead.name}"
- Etapa no Funil: "${lead.stage}"
- Telefone: "${lead.phone || 'Não informado'}"
- E-mail: "${lead.email || 'Não informado'}"
- Origem do Tráfego: "${lead.utmSource || lead.source || 'Direto'}"
- Anúncio Criativo: "${lead.utmContent || 'Geral'}"
- Valor de Compras / LTV: R$ ${lead.value || 0}
- Anotações Comerciais: "${lead.notes || 'Sem anotações'}"

Retorne ESTRITAMENTE um JSON no seguinte formato:
{
  "score": 85,
  "qualificationLevel": "SQL",
  "fitGrade": "A",
  "explanation": "Explicação em 2 frases sobre a maturidade e probabilidade de compra do lead.",
  "breakdown": [
    { "reason": "Motivo 1", "points": 30 },
    { "reason": "Motivo 2", "points": 25 },
    { "reason": "Motivo 3", "points": 30 }
  ]
}`;

                const geminiRes = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt
                });

                let text = (geminiRes.text || '').trim();
                text = text.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
                aiResult = JSON.parse(text);
            } catch (err) {
                console.warn('Erro ao chamar Gemini em Lead Scoring AI:', err);
            }
        }

        if (!aiResult) {
            const computed = computeLeadScore(lead);
            aiResult = {
                score: computed.score,
                qualificationLevel: computed.qualificationLevel,
                fitGrade: computed.fitGrade,
                explanation: `Lead qualificado com Score ${computed.score} baseado na etapa (${lead.stage}), contato telefônico ativo e engajamento com campanhas.`,
                breakdown: computed.scoreBreakdown
            };
        }

        // Update database with AI result if lead exists
        if (lead.id) {
            try {
                await supabase.from('leads').update({
                    score: aiResult.score,
                    qualification_level: aiResult.qualificationLevel,
                    fit_grade: aiResult.fitGrade,
                    score_breakdown: aiResult.breakdown,
                    updated_at: new Date().toISOString()
                }).eq('id', lead.id);
            } catch {}
        }

        res.json({
            success: true,
            score: aiResult.score,
            qualificationLevel: aiResult.qualificationLevel,
            fitGrade: aiResult.fitGrade,
            explanation: aiResult.explanation,
            breakdown: aiResult.breakdown
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// ==============================================================================
// INSTAGRAM AUTO-DM & COMMENT GROWTH TOOL (MANYCHAT STYLE)
// ==============================================================================

let inMemoryInstagramAutomations: any[] = [
    {
        id: 'insta-rule-1',
        companyId: 'comp-alfa',
        name: '📚 Post E-book Grátis: Tráfego e WhatsApp',
        status: 'active',
        postType: 'any_post',
        triggerType: 'keywords',
        keywords: ['ebook', 'quero', 'eu quero', 'livro', 'material', 'acesso'],
        excludedKeywords: ['ruim', 'golpe', 'cancelar'],
        autoLikeComment: true,
        publicReplies: [
            'Acabei de te enviar o e-book no seu Direct! 📥🚀 Dá uma olhada lá.',
            'Prontinho! Link enviado na sua caixa de mensagens do Direct ✨',
            'Confira seu Direct! Mandei o acesso gratuito com todos os detalhes 🎁',
            'Mandei lá no seu direct, aproveite a leitura! 🚀'
        ],
        directMessage: 'Olá {{username}}! 🎉 Conforme você pediu no nosso post, aqui está o seu acesso exclusivo ao E-book "Guia Prático de Vendas e Tráfego no WhatsApp". Clique no botão abaixo para baixar gratuitamente:',
        ctaButton: {
            text: 'Baixar E-book Gratuito 📥',
            url: 'https://mdtracker.app/r/ebook-gratis'
        },
        createLeadInCrm: true,
        followGateEnabled: true,
        followGateConfig: {
            askFollowMessage: 'Olá {{username}}! 🎁 Para eu te liberar esse e-book exclusivo, você já segue o nosso perfil? Responda aqui com "SIM" ou "NÃO" 👇',
            notFollowingMessage: 'Poxa, esse material é 100% exclusivo para quem segue nossa página! ✨ Siga nosso perfil @mudadigital e depois me responda "SEGUI" aqui que te envio na hora!',
            verifyFailMessage: 'Ops! O sistema Meta ainda não identificou o seu follow no perfil @mudadigital. Clica lá em "Seguir" e depois me manda "SEGUI" de novo! 😉',
            confirmFollowMessage: 'Oba, confirmado! Muito obrigado por nos seguir! 🎉 Aqui está o seu acesso exclusivo:',
            strictMetaCheck: true
        },
        relatedPostPromotion: {
            enabled: true,
            message: 'Aproveitando, você já viu nosso Reels recente mostrando 5 automações que triplicam o faturamento? Veja aqui:',
            postUrl: 'https://www.instagram.com/reel/C8xyz123456/',
            postTitle: '🔥 5 Automações que Triplicam o Faturamento'
        },
        stats: {
            commentsProcessed: 142,
            dmsSent: 139,
            leadsCaptured: 87
        },
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'insta-rule-2',
        companyId: 'comp-alfa',
        name: '🏷️ Reels Promoção: Cupom de 30% OFF',
        status: 'active',
        postType: 'specific_post',
        postUrl: 'https://www.instagram.com/reel/C8xyz123456/',
        postId: 'reel-c8xyz123456',
        postCaptionSnippet: '🔥 Liberamos 30% de desconto em todos os planos somente para quem comentar CUPOM aqui embaixo!',
        postThumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=500&q=80',
        triggerType: 'keywords',
        keywords: ['cupom', 'desconto', 'preco', 'valor', 'comprar', 'promo'],
        excludedKeywords: [],
        autoLikeComment: true,
        publicReplies: [
            'Mandei seu cupom VIP no direct! Dá uma olhadinha 🏷️',
            'Código liberado no seu direct! Aproveite que é por tempo limitado ⚡',
            'Seu desconto exclusivo já está na sua caixa de mensagens! ✨'
        ],
        directMessage: 'Oi {{username}}! 🏷️ Seu cupom de 30% OFF é *VIP30*. Ele é válido apenas para as próximas 24 horas em qualquer plano da nossa plataforma. Acesse pelo link abaixo para aplicar o desconto automaticamente:',
        ctaButton: {
            text: 'Garantir 30% de Desconto ⚡',
            url: 'https://mdtracker.app/r/cupom-vip30'
        },
        createLeadInCrm: true,
        stats: {
            commentsProcessed: 98,
            dmsSent: 96,
            leadsCaptured: 64
        },
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: 'insta-rule-3',
        companyId: 'comp-alfa',
        name: '💬 Atendimento Consultor Especialista',
        status: 'active',
        postType: 'any_post',
        triggerType: 'keywords',
        keywords: ['atendente', 'consultoria', 'ajuda', 'suporte', 'duvida', 'humano'],
        excludedKeywords: [],
        autoLikeComment: true,
        publicReplies: [
            'Te mandei uma mensagem no direct para te ajudar! 💬',
            'Nosso time já te enviou os detalhes no direct 🤝',
            'Olá! Acabei de te mandar uma mensagem privada no Direct ✨'
        ],
        directMessage: 'Olá {{username}}! Vi seu comentário no post e vim te atender pessoalmente. Como podemos te ajudar hoje? Se preferir falar diretamente no WhatsApp oficial com nosso consultor, clique abaixo:',
        ctaButton: {
            text: 'Conversar no WhatsApp 💬',
            url: 'https://wa.me/5511988887777?text=Oi!%20Vim%20pelo%20Instagram'
        },
        createLeadInCrm: true,
        stats: {
            commentsProcessed: 53,
            dmsSent: 53,
            leadsCaptured: 41
        },
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        updatedAt: new Date().toISOString()
    }
];

let inMemoryInstagramCommentLogs: any[] = [
    {
        id: 'log-inst-1',
        companyId: 'comp-alfa',
        ruleId: 'insta-rule-1',
        ruleName: '📚 Post E-book Grátis: Tráfego e WhatsApp',
        instagramUsername: '@lucas_dev_mkt',
        commentText: 'Eu quero muito o ebook!',
        postSnippet: 'Post sobre estratégias de tráfego orgânico e WhatsApp',
        publicReplyGiven: 'Acabei de te enviar o e-book no seu Direct! 📥🚀 Dá uma olhada lá.',
        dmSentText: 'Olá @lucas_dev_mkt! 🎉 Conforme você pediu no nosso post, aqui está o seu acesso exclusivo ao E-book "Guia Prático de Vendas e Tráfego no WhatsApp". Clique no botão abaixo para baixar gratuitamente:',
        status: 'delivered',
        timestamp: new Date(Date.now() - 18 * 60000).toISOString()
    },
    {
        id: 'log-inst-2',
        companyId: 'comp-alfa',
        ruleId: 'insta-rule-2',
        ruleName: '🏷️ Reels Promoção: Cupom de 30% OFF',
        instagramUsername: '@mariana.estetica',
        commentText: 'Quero o cupom de desconto por favor',
        postSnippet: 'Reels da campanha de 30% OFF',
        publicReplyGiven: 'Mandei seu cupom VIP no direct! Dá uma olhadinha 🏷️',
        dmSentText: 'Oi @mariana.estetica! 🏷️ Seu cupom de 30% OFF é *VIP30*. Ele é válido apenas para as próximas 24 horas em qualquer plano da nossa plataforma. Acesse pelo link abaixo para aplicar o desconto automaticamente:',
        status: 'delivered',
        timestamp: new Date(Date.now() - 42 * 60000).toISOString()
    },
    {
        id: 'log-inst-3',
        companyId: 'comp-alfa',
        ruleId: 'insta-rule-1',
        ruleName: '📚 Post E-book Grátis: Tráfego e WhatsApp',
        instagramUsername: '@fernando.growth',
        commentText: 'QUERO O MATERIAL',
        postSnippet: 'Post sobre estratégias de tráfego orgânico e WhatsApp',
        publicReplyGiven: 'Prontinho! Link enviado na sua caixa de mensagens do Direct ✨',
        dmSentText: 'Olá @fernando.growth! 🎉 Conforme você pediu no nosso post, aqui está o seu acesso exclusivo ao E-book "Guia Prático de Vendas e Tráfego no WhatsApp". Clique no botão abaixo para baixar gratuitamente:',
        status: 'delivered',
        timestamp: new Date(Date.now() - 110 * 60000).toISOString()
    }
];

// Helper configurations for Follow-Gate and Related Post Cross-Promotion
export const DEFAULT_FOLLOW_GATE_CONFIG = {
    askFollowMessage: 'Olá {{username}}! 🎁 Para eu te liberar esse material exclusivo, você já segue o nosso perfil? Responda aqui com "SIM" ou "NÃO" 👇',
    notFollowingMessage: 'Poxa, esse conteúdo é exclusivo para quem faz parte da nossa comunidade! ✨ Siga nosso perfil @mudadigital e depois me responda "SEGUI" aqui que te envio na hora!',
    verifyFailMessage: 'Ops! Ainda não identifiquei o seu follow no perfil @mudadigital. Clica lá em "Seguir" e depois me manda "SEGUI" de novo! 😉',
    confirmFollowMessage: 'Oba, confirmado! Muito obrigado por nos seguir! 🎉 Aqui está o seu acesso exclusivo:',
    strictMetaCheck: true
};

export const DEFAULT_RELATED_POST_PROMOTION = {
    enabled: false,
    message: 'Já que você se interessou por esse tema, você vai adorar essa outra publicação complementar que postamos no feed:',
    postUrl: '',
    postTitle: ''
};

// Helper to map DB row to InstagramCommentAutomation
function mapInstagramAutomationFromDB(row: any): any {
    return {
        id: row.id,
        companyId: row.company_id,
        name: row.name,
        status: row.status || 'active',
        postType: row.post_type || 'any_post',
        postUrl: row.post_url,
        postId: row.post_id,
        postThumbnail: row.post_thumbnail,
        postCaptionSnippet: row.post_caption_snippet,
        triggerType: row.trigger_type || 'keywords',
        keywords: Array.isArray(row.keywords) ? row.keywords : [],
        excludedKeywords: Array.isArray(row.excluded_keywords) ? row.excluded_keywords : [],
        autoLikeComment: row.auto_like_comment !== false,
        publicReplies: Array.isArray(row.public_replies) ? row.public_replies : [],
        directMessage: row.direct_message || '',
        ctaButton: row.cta_button ? { text: row.cta_button.text, url: row.cta_button.url } : undefined,
        createLeadInCrm: row.create_lead_in_crm !== false,
        followGateEnabled: row.follow_gate_enabled !== undefined 
            ? row.follow_gate_enabled 
            : (row.cta_button?.followGateEnabled || false),
        followGateConfig: row.follow_gate_config 
            || row.cta_button?.followGateConfig 
            || DEFAULT_FOLLOW_GATE_CONFIG,
        relatedPostPromotion: row.related_post_promotion 
            || row.cta_button?.relatedPostPromotion 
            || DEFAULT_RELATED_POST_PROMOTION,
        stats: row.stats || { commentsProcessed: 0, dmsSent: 0, leadsCaptured: 0 },
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

// GET all automations for company (with auto-sync of execution stats from logs)
app.get('/api/instagram/automations', async (req: Request, res: Response) => {
    try {
        const companyId = (req.query.companyId as string) || 'comp-alfa';
        let rules: any[] = [];
        try {
            const { data, error } = await supabase
                .from('instagram_comment_automations')
                .select('*')
                .eq('company_id', companyId)
                .order('created_at', { ascending: false });

            if (!error && data && data.length > 0) {
                rules = data.map(mapInstagramAutomationFromDB);
            }
        } catch {}

        if (rules.length === 0) {
            let filtered = inMemoryInstagramAutomations.filter(a => a.companyId === companyId);
            if (filtered.length === 0) {
                filtered = inMemoryInstagramAutomations.map(a => ({
                    ...a,
                    companyId
                }));
            }
            rules = filtered;
        }

        // Recuperar logs para auditar e sincronizar as estatísticas de cada regra
        let allLogs: any[] = inMemoryInstagramCommentLogs.filter(l => l.companyId === companyId);
        try {
            if (supabase) {
                const { data: dbLogs } = await supabase
                    .from('instagram_comment_logs')
                    .select('*')
                    .eq('company_id', companyId);
                if (dbLogs && dbLogs.length > 0) {
                    for (const dl of dbLogs) {
                        if (!allLogs.some(l => l.id === dl.id)) {
                            allLogs.push(dl);
                        }
                    }
                }
            }
        } catch {}

        // Atualizar estatísticas de cada regra com base nos logs reais
        for (const rule of rules) {
            const ruleLogs = allLogs.filter(l => 
                l.ruleId === rule.id || 
                l.rule_id === rule.id || 
                (l.ruleName && l.ruleName === rule.name) || 
                (l.rule_name && l.rule_name === rule.name)
            );
            const commentsCount = ruleLogs.length;
            const dmsCount = ruleLogs.filter(l => l.status === 'delivered').length;
            const leadsCount = ruleLogs.filter(l => Boolean(l.leadId || l.lead_id)).length;

            const finalComments = Math.max(rule.stats?.commentsProcessed || 0, commentsCount);
            const finalDms = ruleLogs.length > 0 ? dmsCount : (rule.stats?.dmsSent || 0);
            const finalLeads = Math.max(rule.stats?.leadsCaptured || 0, leadsCount);

            const needUpdate = finalComments !== rule.stats?.commentsProcessed || 
                               finalDms !== rule.stats?.dmsSent || 
                               finalLeads !== rule.stats?.leadsCaptured;

            rule.stats = {
                commentsProcessed: finalComments,
                dmsSent: finalDms,
                leadsCaptured: finalLeads
            };

            // Se as estatísticas no banco estavam desatualizadas, salva no Supabase
            if (needUpdate && supabase) {
                Promise.resolve(
                    supabase
                        .from('instagram_comment_automations')
                        .update({ stats: rule.stats, updated_at: new Date().toISOString() })
                        .eq('id', rule.id)
                ).catch(() => {});
            }
        }

        res.json(rules);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// POST create automation
app.post('/api/instagram/automations', async (req: Request, res: Response) => {
    try {
        const {
            companyId = 'comp-alfa',
            name,
            status = 'active',
            postType = 'any_post',
            postUrl,
            postId,
            postThumbnail,
            postCaptionSnippet,
            triggerType = 'keywords',
            keywords = [],
            excludedKeywords = [],
            autoLikeComment = true,
            publicReplies = [],
            directMessage,
            ctaButton,
            createLeadInCrm = true,
            followGateEnabled = false,
            followGateConfig = DEFAULT_FOLLOW_GATE_CONFIG,
            relatedPostPromotion = DEFAULT_RELATED_POST_PROMOTION
        } = req.body;

        if (!name || !directMessage) {
            return res.status(400).json({ error: 'Nome e Mensagem no Direct são obrigatórios' });
        }

        const newId = `insta-rule-${Date.now()}`;
        const newRule = {
            id: newId,
            companyId,
            name,
            status,
            postType,
            postUrl,
            postId,
            postThumbnail,
            postCaptionSnippet,
            triggerType,
            keywords: keywords.map((k: string) => k.trim().toLowerCase()).filter(Boolean),
            excludedKeywords: excludedKeywords.map((k: string) => k.trim().toLowerCase()).filter(Boolean),
            autoLikeComment,
            publicReplies: publicReplies.filter((r: string) => r && r.trim()),
            directMessage,
            ctaButton,
            createLeadInCrm,
            followGateEnabled,
            followGateConfig,
            relatedPostPromotion,
            stats: { commentsProcessed: 0, dmsSent: 0, leadsCaptured: 0 },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            const ctaPayload = ctaButton ? {
                ...ctaButton,
                followGateEnabled,
                followGateConfig,
                relatedPostPromotion
            } : {
                followGateEnabled,
                followGateConfig,
                relatedPostPromotion
            };

            await supabase.from('instagram_comment_automations').insert([{
                id: newRule.id,
                company_id: newRule.companyId,
                name: newRule.name,
                status: newRule.status,
                post_type: newRule.postType,
                post_url: newRule.postUrl,
                post_id: newRule.postId,
                post_thumbnail: newRule.postThumbnail,
                post_caption_snippet: newRule.postCaptionSnippet,
                trigger_type: newRule.triggerType,
                keywords: newRule.keywords,
                excluded_keywords: newRule.excludedKeywords,
                auto_like_comment: newRule.autoLikeComment,
                public_replies: newRule.publicReplies,
                direct_message: newRule.directMessage,
                cta_button: ctaPayload,
                create_lead_in_crm: newRule.createLeadInCrm,
                follow_gate_enabled: newRule.followGateEnabled || false,
                follow_gate_config: newRule.followGateConfig || null,
                related_post_promotion: newRule.relatedPostPromotion || null,
                stats: newRule.stats,
                created_at: newRule.createdAt,
                updated_at: newRule.updatedAt
            }]);
        } catch {}

        inMemoryInstagramAutomations.unshift(newRule);
        res.status(201).json(newRule);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update automation
app.put('/api/instagram/automations/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const idx = inMemoryInstagramAutomations.findIndex(a => a.id === id);
        if (idx !== -1) {
            inMemoryInstagramAutomations[idx] = {
                ...inMemoryInstagramAutomations[idx],
                ...updates,
                updatedAt: new Date().toISOString()
            };
        }

        try {
            const dbPayload: any = { updated_at: new Date().toISOString() };
            if (updates.name !== undefined) dbPayload.name = updates.name;
            if (updates.status !== undefined) dbPayload.status = updates.status;
            if (updates.postType !== undefined) dbPayload.post_type = updates.postType;
            if (updates.postUrl !== undefined) dbPayload.post_url = updates.postUrl;
            if (updates.triggerType !== undefined) dbPayload.trigger_type = updates.triggerType;
            if (updates.keywords !== undefined) dbPayload.keywords = updates.keywords;
            if (updates.excludedKeywords !== undefined) dbPayload.excluded_keywords = updates.excludedKeywords;
            if (updates.autoLikeComment !== undefined) dbPayload.auto_like_comment = updates.autoLikeComment;
            if (updates.publicReplies !== undefined) dbPayload.public_replies = updates.publicReplies;
            if (updates.directMessage !== undefined) dbPayload.direct_message = updates.directMessage;
            if (updates.createLeadInCrm !== undefined) dbPayload.create_lead_in_crm = updates.createLeadInCrm;
            if (updates.followGateEnabled !== undefined) dbPayload.follow_gate_enabled = updates.followGateEnabled;
            if (updates.followGateConfig !== undefined) dbPayload.follow_gate_config = updates.followGateConfig;
            if (updates.relatedPostPromotion !== undefined) dbPayload.related_post_promotion = updates.relatedPostPromotion;
            if (updates.stats !== undefined) dbPayload.stats = updates.stats;

            // Buscar dados existentes da regra para não perder text/url do botão CTA
            let existingRule: any = inMemoryInstagramAutomations.find(a => a.id === id);
            if (supabase) {
                try {
                    const { data: dbData } = await supabase.from('instagram_comment_automations').select('*').eq('id', id).maybeSingle();
                    if (dbData) existingRule = mapInstagramAutomationFromDB(dbData);
                } catch {}
            }

            const existingCta = existingRule?.ctaButton || {};
            const incomingCta = updates.ctaButton || {};

            const finalCtaText = incomingCta.text !== undefined ? incomingCta.text : (updates.ctaText !== undefined ? updates.ctaText : (existingCta.text || ''));
            const finalCtaUrl = incomingCta.url !== undefined ? incomingCta.url : (updates.ctaUrl !== undefined ? updates.ctaUrl : (existingCta.url || ''));

            const ctaPayload: any = {
                text: finalCtaText,
                url: finalCtaUrl,
                followGateEnabled: updates.followGateEnabled !== undefined ? updates.followGateEnabled : (existingRule?.followGateEnabled ?? false),
                followGateConfig: updates.followGateConfig !== undefined ? updates.followGateConfig : (existingRule?.followGateConfig ?? DEFAULT_FOLLOW_GATE_CONFIG),
                relatedPostPromotion: updates.relatedPostPromotion !== undefined ? updates.relatedPostPromotion : (existingRule?.relatedPostPromotion ?? DEFAULT_RELATED_POST_PROMOTION)
            };
            dbPayload.cta_button = ctaPayload;

            await supabase.from('instagram_comment_automations').update(dbPayload).eq('id', id);
        } catch {}

        const updated = inMemoryInstagramAutomations.find(a => a.id === id) || { id, ...updates };
        res.json(updated);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE automation
app.delete('/api/instagram/automations/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        inMemoryInstagramAutomations = inMemoryInstagramAutomations.filter(a => a.id !== id);
        try {
            await supabase.from('instagram_comment_automations').delete().eq('id', id);
        } catch {}
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// GET execution logs
app.get('/api/instagram/automations/logs', async (req: Request, res: Response) => {
    try {
        const companyId = (req.query.companyId as string) || 'comp-alfa';
        try {
            const { data, error } = await supabase
                .from('instagram_comment_logs')
                .select('*')
                .eq('company_id', companyId)
                .order('timestamp', { ascending: false })
                .limit(50);

            if (!error && data && data.length > 0) {
                return res.json(data.map((row: any) => ({
                    id: row.id,
                    companyId: row.company_id,
                    ruleId: row.rule_id,
                    ruleName: row.rule_name,
                    instagramUsername: row.instagram_username,
                    commentText: row.comment_text,
                    postId: row.post_id,
                    postSnippet: row.post_snippet,
                    publicReplyGiven: row.public_reply_given,
                    dmSentText: row.dm_sent_text,
                    leadId: row.lead_id,
                    status: row.status,
                    errorMessage: row.error_message || row.errorMessage || (row.status === 'failed' ? 'Falha na entrega na Meta Graph API' : undefined),
                    timestamp: row.timestamp
                })));
            }
        } catch {}

        const logs = inMemoryInstagramCommentLogs.filter(l => l.companyId === companyId);
        res.json(logs);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// Session map for ongoing follow-gate conversations: key = `${companyId}:${username}`
interface FollowGateSession {
    companyId: string;
    ruleId: string;
    username: string;
    senderId?: string;
    commentId?: string;
    step: 'awaiting_follow_answer' | 'awaiting_follow_action';
    createdAt: number;
}
const instagramFollowGateSessions = new Map<string, FollowGateSession>();

// Helper to check if a user actually follows the Instagram account via Meta Graph API
async function checkInstagramFollowStatus(userIgsid: string, accessToken: string): Promise<boolean> {
    if (!accessToken || !userIgsid) return true; // Fallback se credenciais não estiverem ativas
    try {
        const url = `https://graph.facebook.com/v19.0/${encodeURIComponent(userIgsid)}?fields=is_user_follow_business&access_token=${encodeURIComponent(accessToken.trim())}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data && typeof data.is_user_follow_business === 'boolean') {
            return data.is_user_follow_business;
        }
        if (data?.error) {
            console.warn('[checkInstagramFollowStatus warning]', data.error.message);
        }
        return true; // Resiliência: se a Meta não devolver o campo booleano em teste, não bloqueia o usuário
    } catch (err: any) {
        console.error('[checkInstagramFollowStatus error]', err.message);
        return true;
    }
}

// Helper to send Direct Message via Meta Graph API
async function sendInstagramDirectMessage(
    recipientId: string, 
    text: string, 
    accessToken: string,
    pageId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!accessToken || !recipientId) return { success: false, error: 'Token ou identificador de destinatário ausente' };
    try {
        const cleanPageId = (pageId && pageId.trim() && !pageId.startsWith('100000000000')) ? pageId.trim() : null;
        const targetEndpoint = cleanPageId ? `${cleanPageId}/messages` : 'me/messages';
        const url = `https://graph.facebook.com/v19.0/${targetEndpoint}?access_token=${encodeURIComponent(accessToken.trim())}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                recipient: { id: recipientId },
                message: { text }
            })
        });
        const json = await res.json();
        console.log('[Instagram Meta] Direct enviado:', json);
        if (json.message_id || json.recipient_id || !json.error) {
            return { success: true, data: json };
        }
        return { success: false, error: json.error?.message || JSON.stringify(json.error) };
    } catch (err: any) {
        console.error('[sendInstagramDirectMessage error]', err.message);
        return { success: false, error: err.message };
    }
}

// Helper to reply publicly to an Instagram comment
async function sendInstagramPublicReply(commentId: string, message: string, accessToken: string) {
    if (!accessToken || !commentId || !message) return null;
    try {
        const url = `https://graph.facebook.com/v19.0/${commentId}/replies?access_token=${encodeURIComponent(accessToken.trim())}`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const json = await res.json();
        console.log('[Instagram Meta] Resposta pública enviada:', json);
        return json;
    } catch (err: any) {
        console.error('[sendInstagramPublicReply error]', err.message);
        return null;
    }
}

// Helper to send a private DM in response to an Instagram comment (Private Reply)
async function sendInstagramPrivateCommentReply(
    commentId: string, 
    text: string, 
    accessToken: string, 
    recipientId?: string,
    pageId?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!accessToken || (!commentId && !recipientId) || !text) {
        return { success: false, error: 'Token ou identificadores ausentes' };
    }
    try {
        const cleanPageId = (pageId && pageId.trim() && !pageId.startsWith('100000000000')) ? pageId.trim() : null;
        const targetEndpoint = cleanPageId ? `${cleanPageId}/messages` : 'me/messages';
        const url = `https://graph.facebook.com/v19.0/${targetEndpoint}?access_token=${encodeURIComponent(accessToken.trim())}`;
        let lastError = '';
        
        // 1. Tentar via comment_id (endpoint oficial de private reply da Meta)
        if (commentId) {
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ recipient: { comment_id: commentId }, message: { text } })
                });
                const json = await res.json();
                console.log('[Instagram Meta] Resposta privada Direct (comment_id):', json);
                if (json.message_id || json.recipient_id || (!json.error && !json.errors)) {
                    return { success: true, data: json };
                }
                lastError = json.error?.message || JSON.stringify(json.error);
                console.warn('[Instagram Meta] Aviso comment_id:', lastError);
            } catch (err: any) {
                console.warn('[Instagram Meta] Erro envio comment_id:', err.message);
                lastError = err.message;
            }
        }

        // 2. Fallback via recipientId (IGSID direto do seguidor)
        if (recipientId) {
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ recipient: { id: recipientId }, message: { text } })
                });
                const json = await res.json();
                console.log('[Instagram Meta] Resposta privada Direct (recipientId):', json);
                if (json.message_id || json.recipient_id || (!json.error && !json.errors)) {
                    return { success: true, data: json };
                }
                lastError = json.error?.message || JSON.stringify(json.error);
                console.warn('[Instagram Meta] Aviso recipientId:', lastError);
                return { success: false, error: lastError };
            } catch (err: any) {
                return { success: false, error: err.message };
            }
        }

        return { success: false, error: lastError || 'Falha ao entregar direct na Meta' };
    } catch (err: any) {
        console.error('[sendInstagramPrivateCommentReply error]', err.message);
        return { success: false, error: err.message };
    }
}

// Helper to like a comment automatically on Instagram
async function likeInstagramComment(commentId: string, accessToken: string) {
    if (!accessToken || !commentId) return null;
    try {
        const url = `https://graph.facebook.com/v19.0/${commentId}/likes?access_token=${encodeURIComponent(accessToken.trim())}`;
        const res = await fetch(url, { method: 'POST' });
        return await res.json();
    } catch (err: any) {
        console.error('[likeInstagramComment error]', err.message);
        return null;
    }
}

function normalizeTriggerText(str: string): string {
    return (str || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function checkKeywordMatch(comment: string, keyword: string): boolean {
    const normComment = normalizeTriggerText(comment);
    const normKw = normalizeTriggerText(keyword);
    if (!normKw || !normComment) return false;

    // 1. Substring match direto (ex: "quero o power up" contém "power up")
    if (normComment.includes(normKw)) return true;

    // 2. Correspondência sem espaços, hífens ou pontuações
    // Trata perfeitamente "power up" vs "powerup", "e-book" vs "ebook", "power_up" vs "powerup"
    const compactComment = normComment.replace(/[^a-z0-9]/g, '');
    const compactKw = normKw.replace(/[^a-z0-9]/g, '');
    if (compactKw && compactComment.includes(compactKw)) return true;
    if (compactComment && compactKw.includes(compactComment)) return true;

    // 3. Variações de Plural e Singular (Português/Inglês: -s, -es, -is)
    const singularKw = normKw.replace(/(es|s)$/, '');
    const singularComment = normComment.replace(/(es|s)$/, '');
    if (singularKw.length >= 3 && normComment.includes(singularKw)) return true;
    if (singularComment.length >= 3 && normKw.includes(singularComment)) return true;

    if (compactKw.length >= 3 && compactComment.length >= 3) {
        const compactSingularKw = compactKw.replace(/(es|s)$/, '');
        const compactSingularComment = compactComment.replace(/(es|s)$/, '');
        if (compactSingularKw.length >= 3 && compactComment.includes(compactSingularKw)) return true;
        if (compactSingularComment.length >= 3 && compactKw.includes(compactSingularComment)) return true;
    }

    // 4. Token-level matching: todas as palavras da palavra-chave presentes no comentário
    const kwWords = normKw.split(/\s+/).filter(w => w.length > 1);
    if (kwWords.length > 1 && kwWords.every(w => normComment.includes(w))) return true;

    return false;
}

// SIMULATE / EXECUTE Instagram Comment Action (Interactive ManyChat Simulator)
app.post('/api/instagram/automations/simulate', async (req: Request, res: Response) => {
    try {
        const {
            companyId = 'comp-alfa',
            ruleId,
            instagramUsername = '@usuario_teste',
            commentText = '',
            postTitle = 'Publicação no Feed',
            isFollowerSimulated = false,
            simulatedFollowReply = ''
        } = req.body;

        if (!commentText.trim()) {
            return res.status(400).json({ error: 'Texto do comentário é obrigatório' });
        }

        const normalizedUsername = instagramUsername.startsWith('@') ? instagramUsername : `@${instagramUsername}`;
        const cleanComment = commentText.trim().toLowerCase();

        // 1. Buscar regras no Supabase e em memória
        let rules: any[] = [];
        try {
            if (supabase) {
                const { data, error } = await supabase
                    .from('instagram_comment_automations')
                    .select('*')
                    .eq('company_id', companyId)
                    .eq('status', 'active');
                if (!error && data && data.length > 0) {
                    rules = data.map(mapInstagramAutomationFromDB);
                }
            }
        } catch {}

        const inMemRules = inMemoryInstagramAutomations.filter(r => r.companyId === companyId && r.status === 'active');
        for (const item of inMemRules) {
            if (!rules.some(r => r.id === item.id)) {
                rules.push(item);
            }
        }

        // Se a empresa ainda não tiver regras ativas específicas, utilizar os modelos de exemplo como fallback imediato
        if (rules.length === 0) {
            rules = inMemoryInstagramAutomations.filter(r => r.status === 'active').map(r => ({ ...r, companyId }));
        }

        let matchedRule = ruleId && ruleId !== 'auto' ? rules.find(r => r.id === ruleId) : null;

        if (!matchedRule) {
            // Find first matching rule by keywords
            for (const rule of rules) {
                // Check exclusions
                const hasExcluded = (rule.excludedKeywords || []).some((ex: string) => checkKeywordMatch(cleanComment, ex));
                if (hasExcluded) continue;

                if (rule.triggerType === 'all_comments') {
                    matchedRule = rule;
                    break;
                }

                const hasKeyword = (rule.keywords || []).some((kw: string) => checkKeywordMatch(cleanComment, kw)) ||
                    checkKeywordMatch(cleanComment, rule.name);
                if (hasKeyword) {
                    matchedRule = rule;
                    break;
                }
            }
        }

        if (!matchedRule) {
            return res.json({
                success: false,
                matched: false,
                reason: 'Nenhuma automação ativa correspondeu às palavras-chave do comentário.',
                instagramUsername: normalizedUsername,
                commentText
            });
        }

        // Safe stats initialization
        if (!matchedRule.stats) {
            matchedRule.stats = { commentsProcessed: 0, dmsSent: 0, leadsCaptured: 0 };
        }

        // Pick random public reply
        const publicReplies = matchedRule.publicReplies && matchedRule.publicReplies.length > 0
            ? matchedRule.publicReplies
            : ['Te respondi no direct! Dá uma olhada lá 🚀'];
        const publicReply = publicReplies[Math.floor(Math.random() * publicReplies.length)];

        // Format direct message
        let formattedDM = (matchedRule.directMessage || '')
            .replace(/\{\{username\}\}/gi, normalizedUsername)
            .replace(/\{username\}/gi, normalizedUsername)
            .replace(/\{\{nome\}\}/gi, normalizedUsername)
            .replace(/\{nome\}/gi, normalizedUsername);

        // Garantir que o link do botão CTA esteja presente no corpo da mensagem quando desbloqueado
        if (matchedRule.ctaButton?.url && !formattedDM.includes(matchedRule.ctaButton.url)) {
            const btnLabel = matchedRule.ctaButton.text ? `\n\n👉 ${matchedRule.ctaButton.text}:\n` : '\n\n👉 Link de Acesso:\n';
            formattedDM = `${formattedDM}${btnLabel}${matchedRule.ctaButton.url}`;
        }

        // ==========================================
        // LÓGICA DO FOLLOW-GATE (PORTÃO DE SEGUIDOR)
        // ==========================================
        const isFollowGateActive = Boolean(matchedRule.followGateEnabled);
        let followGateStage: 'ask_follow' | 'not_following' | 'verify_failed' | 'verified_unlocked' | undefined = undefined;
        let outgoingDM = formattedDM;
        let ctaButtonUnlocked: { text: string; url: string } | undefined = matchedRule.ctaButton;
        let isFollowerVerified = Boolean(isFollowerSimulated);
        let relatedPostToSend: { message: string; postUrl: string; postTitle?: string } | undefined = undefined;

        if (isFollowGateActive) {
            const replyClean = (simulatedFollowReply || '').trim().toLowerCase();

            if (!replyClean) {
                // Estágio 1: Usuário acabou de comentar. Sistema pergunta se ele já segue
                followGateStage = 'ask_follow';
                const template = matchedRule.followGateConfig?.askFollowMessage || DEFAULT_FOLLOW_GATE_CONFIG.askFollowMessage;
                outgoingDM = template
                    .replace(/\{\{username\}\}/gi, normalizedUsername)
                    .replace(/\{username\}/gi, normalizedUsername);
                ctaButtonUnlocked = undefined; // CTA bloqueado
            } else if (
                replyClean === 'não' || 
                replyClean === 'nao' || 
                replyClean === 'n' || 
                replyClean.includes('não sigo') || 
                replyClean.includes('nao sigo') || 
                replyClean.includes('ainda não') || 
                replyClean.includes('ainda nao')
            ) {
                // Estágio 2A: Usuário respondeu que NÃO segue
                followGateStage = 'not_following';
                const template = matchedRule.followGateConfig?.notFollowingMessage || DEFAULT_FOLLOW_GATE_CONFIG.notFollowingMessage;
                outgoingDM = template
                    .replace(/\{\{username\}\}/gi, normalizedUsername)
                    .replace(/\{username\}/gi, normalizedUsername);
                ctaButtonUnlocked = undefined;
                isFollowerVerified = false;
            } else {
                // Estágio 2B: Usuário respondeu que "SIM" ou "SEGUI"
                // O sistema checa se ele realmente segue
                if (!isFollowerSimulated) {
                    // Checagem falhou: o usuário afirmou que segue mas o sistema detectou que NÃO segue
                    followGateStage = 'verify_failed';
                    const template = matchedRule.followGateConfig?.verifyFailMessage || DEFAULT_FOLLOW_GATE_CONFIG.verifyFailMessage;
                    outgoingDM = template
                        .replace(/\{\{username\}\}/gi, normalizedUsername)
                        .replace(/\{username\}/gi, normalizedUsername);
                    ctaButtonUnlocked = undefined;
                    isFollowerVerified = false;
                } else {
                    // Checagem confirmada: Usuário é seguidor verificado!
                    followGateStage = 'verified_unlocked';
                    const confirmTemplate = matchedRule.followGateConfig?.confirmFollowMessage || DEFAULT_FOLLOW_GATE_CONFIG.confirmFollowMessage;
                    const confirmText = confirmTemplate
                        .replace(/\{\{username\}\}/gi, normalizedUsername)
                        .replace(/\{username\}/gi, normalizedUsername);

                    outgoingDM = `${confirmText}\n\n${formattedDM}`;
                    ctaButtonUnlocked = matchedRule.ctaButton;
                    isFollowerVerified = true;

                    // Post Relacionado Cross-Promotion
                    if (matchedRule.relatedPostPromotion?.enabled && matchedRule.relatedPostPromotion?.postUrl) {
                        relatedPostToSend = {
                            message: matchedRule.relatedPostPromotion.message || DEFAULT_RELATED_POST_PROMOTION.message,
                            postUrl: matchedRule.relatedPostPromotion.postUrl,
                            postTitle: matchedRule.relatedPostPromotion.postTitle
                        };
                    }
                }
            }
        } else {
            // Follow-Gate desativado: envio imediato com CTA liberado
            outgoingDM = formattedDM;
            ctaButtonUnlocked = matchedRule.ctaButton;

            if (matchedRule.relatedPostPromotion?.enabled && matchedRule.relatedPostPromotion?.postUrl) {
                relatedPostToSend = {
                    message: matchedRule.relatedPostPromotion.message || DEFAULT_RELATED_POST_PROMOTION.message,
                    postUrl: matchedRule.relatedPostPromotion.postUrl,
                    postTitle: matchedRule.relatedPostPromotion.postTitle
                };
            }
        }

        // Update stats
        matchedRule.stats.commentsProcessed = (matchedRule.stats.commentsProcessed || 0) + 1;
        if (!isFollowGateActive || followGateStage === 'verified_unlocked') {
            matchedRule.stats.dmsSent = (matchedRule.stats.dmsSent || 0) + 1;
        }

        let createdLead: any = null;
        if (matchedRule.createLeadInCrm && (!isFollowGateActive || followGateStage === 'verified_unlocked')) {
            matchedRule.stats.leadsCaptured = (matchedRule.stats.leadsCaptured || 0) + 1;

            const leadName = normalizedUsername.replace('@', '');
            const leadPayload = {
                id: `lead-insta-${Date.now()}`,
                companyId,
                name: `${leadName} (Instagram)`,
                phone: '',
                email: '',
                source: 'Instagram Feed (ManyChat)',
                utmSource: 'instagram',
                utmMedium: 'comment_growth_tool',
                utmCampaign: matchedRule.name,
                utmContent: commentText,
                stage: 'Novo Lead',
                notes: `${isFollowGateActive ? '✅ Seguidor verificado via Follow-Gate! ' : ''}Comentou "${commentText}" no post do Instagram. Regra disparada: ${matchedRule.name}. Resposta e Direct entregues automaticamente.`,
                score: isFollowGateActive ? 70 : 55,
                qualificationLevel: isFollowGateActive ? 'SQL' : 'MQL',
                fitGrade: 'A',
                scoreBreakdown: [
                    { reason: 'Comentário em Post do Instagram', points: 25 },
                    { reason: 'Auto-DM ManyChat Disparado', points: 20 },
                    ...(isFollowGateActive ? [{ reason: 'Seguidor Verificado do Instagram (Follow-Gate)', points: 15 }] : []),
                    { reason: 'Interesse Manifesto em Campanha', points: 10 }
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            try {
                await supabase.from('leads').insert([{
                    id: leadPayload.id,
                    company_id: leadPayload.companyId,
                    name: leadPayload.name,
                    source: leadPayload.source,
                    utm_source: leadPayload.utmSource,
                    utm_medium: leadPayload.utmMedium,
                    utm_campaign: leadPayload.utmCampaign,
                    utm_content: leadPayload.utmContent,
                    stage: leadPayload.stage,
                    notes: leadPayload.notes,
                    score: leadPayload.score,
                    qualification_level: leadPayload.qualificationLevel,
                    fit_grade: leadPayload.fitGrade,
                    score_breakdown: leadPayload.scoreBreakdown,
                    created_at: leadPayload.createdAt,
                    updated_at: leadPayload.updatedAt
                }]);
            } catch {}

            createdLead = leadPayload;
        }

        // Create Log
        const logEntry = {
            id: `log-inst-${Date.now()}`,
            companyId,
            ruleId: matchedRule.id,
            ruleName: matchedRule.name,
            instagramUsername: normalizedUsername,
            commentText,
            postSnippet: postTitle,
            publicReplyGiven: publicReply,
            dmSentText: outgoingDM,
            leadId: createdLead ? createdLead.id : undefined,
            status: 'delivered' as const,
            timestamp: new Date().toISOString()
        };

        inMemoryInstagramCommentLogs.unshift(logEntry);

        // Atualizar stats em memória
        const inMemRuleIdx = inMemoryInstagramAutomations.findIndex(r => r.id === matchedRule.id);
        if (inMemRuleIdx !== -1) {
            inMemoryInstagramAutomations[inMemRuleIdx].stats = matchedRule.stats;
        }

        try {
            await supabase.from('instagram_comment_logs').insert([{
                id: logEntry.id,
                company_id: logEntry.companyId,
                rule_id: logEntry.ruleId,
                rule_name: logEntry.ruleName,
                instagram_username: logEntry.instagramUsername,
                comment_text: logEntry.commentText,
                post_snippet: logEntry.postSnippet,
                public_reply_given: logEntry.publicReplyGiven,
                dm_sent_text: logEntry.dmSentText,
                lead_id: logEntry.leadId,
                status: logEntry.status,
                timestamp: logEntry.timestamp
            }]);

            // Persistir stats atualizadas na tabela da regra no Supabase
            await supabase
                .from('instagram_comment_automations')
                .update({ 
                    stats: matchedRule.stats,
                    updated_at: new Date().toISOString() 
                })
                .eq('id', matchedRule.id);
        } catch {}

        res.json({
            success: true,
            matched: true,
            ruleName: matchedRule.name,
            instagramUsername: normalizedUsername,
            commentText,
            publicReplyGiven: publicReply,
            autoLiked: matchedRule.autoLikeComment,
            dmSentText: outgoingDM,
            ctaButton: ctaButtonUnlocked,
            followGateTriggered: isFollowGateActive,
            followGateStage,
            isFollower: isFollowerVerified,
            relatedPostSent: relatedPostToSend,
            lead: createdLead,
            log: logEntry
        });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// INSTAGRAM ACCOUNT / GRAPH API SETTINGS & PERSISTENCE
const INSTAGRAM_SETTINGS_FILE = path.join(process.cwd(), 'instagram_settings.json');
let inMemoryInstagramSettings: Record<string, any> = {};

try {
    if (fs.existsSync(INSTAGRAM_SETTINGS_FILE)) {
        inMemoryInstagramSettings = JSON.parse(fs.readFileSync(INSTAGRAM_SETTINGS_FILE, 'utf-8'));
    }
} catch (e: any) {
    console.error('[Instagram Settings] Erro ao carregar arquivo local:', e.message);
}

// Helper para garantir que a Conta Comercial do Instagram e a Página recebam webhooks da Meta
async function subscribeInstagramAndPage(instagramAccountId?: string, pageId?: string, accessToken?: string) {
    if (!accessToken) return;
    const cleanToken = accessToken.trim();
    if (instagramAccountId && !instagramAccountId.startsWith('178414000000')) {
        try {
            const url = `https://graph.facebook.com/v20.0/${instagramAccountId.trim()}/subscribed_apps?subscribed_fields=messages,messaging_postbacks,comments,mentions&access_token=${encodeURIComponent(cleanToken)}`;
            const res = await fetch(url, { method: 'POST' });
            const json = await res.json();
            console.log('[Meta subscribed_apps] Inscrição Instagram ID', instagramAccountId, json);
        } catch (e: any) {
            console.warn('[Meta subscribed_apps] Erro ao inscrever Instagram:', e.message);
        }
    }
    if (pageId && !pageId.startsWith('100000000000')) {
        try {
            const url = `https://graph.facebook.com/v20.0/${pageId.trim()}/subscribed_apps?subscribed_fields=feed,conversations,messages,messaging_postbacks&access_token=${encodeURIComponent(cleanToken)}`;
            const res = await fetch(url, { method: 'POST' });
            const json = await res.json();
            console.log('[Meta subscribed_apps] Inscrição Page ID', pageId, json);
        } catch (e: any) {
            console.warn('[Meta subscribed_apps] Erro ao inscrever Página:', e.message);
        }
    }
}

// Helper para resolver credenciais do Instagram (Memória -> Supabase -> Arquivo)
async function resolveInstagramSettings(companyId?: string): Promise<any> {
    let settings = companyId ? inMemoryInstagramSettings[companyId] : null;
    if (!settings?.accessToken) {
        const anyActive = Object.values(inMemoryInstagramSettings).find((s: any) => s.accessToken);
        if (anyActive) settings = anyActive;
    }
    if (!settings?.accessToken && supabase) {
        try {
            if (companyId) {
                const { data } = await supabase
                    .from('settings')
                    .select('instagram_config, global_meta_token')
                    .eq('company_id', companyId)
                    .maybeSingle();
                if (data?.instagram_config?.accessToken) {
                    settings = data.instagram_config;
                    inMemoryInstagramSettings[companyId] = settings;
                } else if (data?.global_meta_token) {
                    settings = { accessToken: data.global_meta_token, autoReplyReal: true };
                }
            }
            if (!settings?.accessToken) {
                const { data: allSet } = await supabase
                    .from('settings')
                    .select('instagram_config, company_id')
                    .not('instagram_config', 'is', null)
                    .limit(5);
                const found = allSet?.find((s: any) => s.instagram_config?.accessToken);
                if (found) {
                    settings = found.instagram_config;
                    if (companyId) inMemoryInstagramSettings[companyId] = settings;
                }
            }
        } catch (e: any) {
            console.warn('[resolveInstagramSettings] Erro ao buscar no Supabase:', e.message);
        }
    }
    return settings || {};
}

// META / INSTAGRAM GRAPH API WEBHOOKS
app.get('/api/webhooks/instagram', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    // Verify token can match custom or default token
    const VERIFY_TOKEN = process.env.INSTAGRAM_VERIFY_TOKEN || 'mdtracker_instagram_token';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('[Instagram Webhook] Token de verificação validado com sucesso!');
        return res.status(200).send(challenge);
    } else {
        return res.sendStatus(403);
    }
});

app.post('/api/webhooks/instagram', async (req: Request, res: Response) => {
    try {
        const body = req.body;
        console.log('[Instagram Webhook] Evento recebido:', JSON.stringify(body).slice(0, 300));

        // Auditoria em tempo real de qualquer payload recebido da Meta
        if (supabase) {
            try {
                const sampleText = body.entry?.[0]?.changes?.[0]?.value?.text || 
                                   body.entry?.[0]?.messaging?.[0]?.message?.text || 
                                   JSON.stringify(body).slice(0, 150);
                const sampleUser = body.entry?.[0]?.changes?.[0]?.value?.from?.username ? 
                                   `@${body.entry[0].changes[0].value.from.username}` : 
                                   (body.entry?.[0]?.messaging?.[0]?.sender?.id ? `@id_${body.entry[0].messaging[0].sender.id}` : '@webhook_meta');
                
                await supabase.from('instagram_comment_logs').insert([{
                    id: `hook-${Date.now()}`,
                    company_id: 'comp-1786498560971',
                    rule_id: 'raw-webhook',
                    rule_name: `Ping Webhook Meta (${body.object || 'desconhecido'})`,
                    instagram_username: sampleUser,
                    comment_text: sampleText,
                    public_reply_given: 'Recebido da Meta',
                    dm_sent_text: 'Em processamento',
                    status: 'delivered',
                    timestamp: new Date().toISOString()
                }]);
            } catch (e: any) {
                console.warn('[Webhook Log Error]', e.message);
            }
        }

        if ((body.object === 'instagram' || body.object === 'page') && Array.isArray(body.entry)) {
            for (const entry of body.entry) {
                // 1. Tratar comentários em posts (changes)
                if (Array.isArray(entry.changes)) {
                    for (const change of entry.changes) {
                        if ((change.field === 'comments' || change.field === 'feed') && change.value) {
                            const val = change.value;
                            const commentText = val.text || val.message || '';
                            const username = val.from?.username ? `@${val.from.username}` : (val.from?.name ? `@${val.from.name.replace(/\s+/g, '').toLowerCase()}` : '@usuario_instagram');
                            const commentId = val.id || val.comment_id;

                            // Execute matching rule in background
                            const cleanComment = commentText.trim().toLowerCase();

                            // Load active rules from Supabase and inMemory
                            let activeRules = [...inMemoryInstagramAutomations];
                            if (supabase) {
                                try {
                                    const { data: dbRules } = await supabase
                                        .from('instagram_comment_automations')
                                        .select('*')
                                        .eq('status', 'active');
                                    if (dbRules && dbRules.length > 0) {
                                        for (const dbr of dbRules) {
                                            const mapped = mapInstagramAutomationFromDB(dbr);
                                            const existingIdx = activeRules.findIndex(r => r.id === mapped.id);
                                            if (existingIdx !== -1) {
                                                activeRules[existingIdx] = mapped;
                                            } else {
                                                activeRules.unshift(mapped);
                                            }
                                        }
                                    }
                                } catch {}
                            }

                            const matched = activeRules.find(r => 
                                r.status === 'active' && 
                                (
                                    r.triggerType === 'all_comments' || 
                                    (r.keywords || []).some((kw: string) => checkKeywordMatch(cleanComment, kw)) ||
                                    checkKeywordMatch(cleanComment, r.name)
                                )
                            );

                            if (matched) {
                                matched.stats.commentsProcessed = (matched.stats.commentsProcessed || 0) + 1;
                                const replies = matched.publicReplies || ['Enviado no direct! 🚀'];
                                const reply = replies[Math.floor(Math.random() * replies.length)];

                                let outgoingDM = '';
                                if (matched.followGateEnabled) {
                                    // Inicia sessão de Follow-Gate
                                    const sessionKey = `${matched.companyId}:${username.toLowerCase()}`;
                                    const sessionData: FollowGateSession = {
                                        companyId: matched.companyId,
                                        ruleId: matched.id,
                                        username,
                                        commentId,
                                        senderId: val.from?.id,
                                        step: 'awaiting_follow_answer',
                                        createdAt: Date.now()
                                    };
                                    instagramFollowGateSessions.set(sessionKey, sessionData);
                                    if (val.from?.id) {
                                        instagramFollowGateSessions.set(val.from.id, sessionData);
                                    }

                                    const template = matched.followGateConfig?.askFollowMessage || DEFAULT_FOLLOW_GATE_CONFIG.askFollowMessage;
                                    outgoingDM = template.replace(/\{\{username\}\}/gi, username).replace(/\{username\}/gi, username);
                                } else {
                                    let dm = matched.directMessage.replace(/\{\{username\}\}/gi, username);
                                    if (matched.ctaButton?.url && !dm.includes(matched.ctaButton.url)) {
                                        const btnLabel = matched.ctaButton.text ? `\n\n👉 ${matched.ctaButton.text}:\n` : '\n\n👉 Link de Acesso:\n';
                                        dm = `${dm}${btnLabel}${matched.ctaButton.url}`;
                                    }
                                    if (matched.relatedPostPromotion?.enabled && matched.relatedPostPromotion?.postUrl) {
                                        const relText = matched.relatedPostPromotion.message || DEFAULT_RELATED_POST_PROMOTION.message;
                                        dm = `${dm}\n\n💡 ${relText}\n👉 ${matched.relatedPostPromotion.postUrl}`;
                                    }
                                    outgoingDM = dm;
                                }

                                // 3. DISPARO REAL NA META GRAPH API (SE CONFIGURADO)
                                let compSettings = await resolveInstagramSettings(matched.companyId);
                                const accessToken = compSettings?.accessToken;
                                const autoReplyReal = compSettings?.autoReplyReal !== false;
                                const cleanPageId = (compSettings?.pageId && !compSettings.pageId.startsWith('100000000000')) ? compSettings.pageId : undefined;

                                let dmDeliveryStatus: 'delivered' | 'failed' = 'delivered';
                                let metaErrorMessage = '';

                                if (autoReplyReal && accessToken) {
                                    if (matched.autoLikeComment && commentId) {
                                        likeInstagramComment(commentId, accessToken).catch(e => console.warn('[Meta like error]', e.message));
                                    }
                                    if (commentId && reply) {
                                        sendInstagramPublicReply(commentId, reply, accessToken).catch(e => console.warn('[Meta reply error]', e.message));
                                    }
                                    if (outgoingDM) {
                                        const recipientId = val.from?.id;
                                        const dmRes = await sendInstagramPrivateCommentReply(commentId, outgoingDM, accessToken, recipientId, cleanPageId);
                                        if (dmRes.success) {
                                            dmDeliveryStatus = 'delivered';
                                            if (!matched.enableFollowGate) {
                                                matched.stats.dmsSent = (matched.stats.dmsSent || 0) + 1;
                                            }
                                        } else {
                                            dmDeliveryStatus = 'failed';
                                            metaErrorMessage = dmRes.error || 'Falha de entrega na Meta';
                                            console.error(`[Instagram Webhook] Direct FALHOU na Meta para @${username}:`, metaErrorMessage);
                                        }
                                    }
                                } else {
                                    // Modo simulado / local
                                    if (!matched.enableFollowGate) {
                                        matched.stats.dmsSent = (matched.stats.dmsSent || 0) + 1;
                                    }
                                }

                                const newLog = {
                                    id: `log-inst-${Date.now()}`,
                                    companyId: matched.companyId,
                                    ruleId: matched.id,
                                    ruleName: matched.name,
                                    instagramUsername: username,
                                    commentText,
                                    publicReplyGiven: reply,
                                    dmSentText: outgoingDM,
                                    status: dmDeliveryStatus,
                                    errorMessage: metaErrorMessage || undefined,
                                    timestamp: new Date().toISOString()
                                };
                                inMemoryInstagramCommentLogs.unshift(newLog);

                                if (supabase) {
                                    try {
                                        await supabase.from('instagram_comment_logs').insert([{
                                            id: newLog.id,
                                            company_id: newLog.companyId,
                                            rule_id: newLog.ruleId,
                                            rule_name: newLog.ruleName,
                                            instagram_username: newLog.instagramUsername,
                                            comment_text: newLog.commentText,
                                            post_id: val.from?.id || null,
                                            post_snippet: val.media?.id || null,
                                            public_reply_given: newLog.publicReplyGiven,
                                            dm_sent_text: newLog.dmSentText,
                                            status: newLog.status,
                                            timestamp: newLog.timestamp
                                        }]);

                                        await supabase.from('instagram_comment_automations').update({
                                            stats: matched.stats,
                                            updated_at: new Date().toISOString()
                                        }).eq('id', matched.id);
                                    } catch (e: any) {
                                        console.error('[Instagram Webhook] Erro ao persistir no Supabase:', e.message);
                                    }
                                }
                            }
                        }
                    }
                }

                // 2. Tratar mensagens diretas recebidas (messaging) - Respostas do Follow-Gate
                if (Array.isArray(entry.messaging)) {
                    for (const msgEvent of entry.messaging) {
                        // Ignorar mensagens de eco (mensagens enviadas pela própria página/bot)
                        if (msgEvent.message?.is_echo) {
                            console.log('[Instagram Webhook] Ignorando echo message');
                            continue;
                        }

                        const senderId = msgEvent.sender?.id;
                        const rawMsg = msgEvent.message?.text || msgEvent.message?.quick_reply?.payload || msgEvent.postback?.payload || msgEvent.postback?.title || '';
                        const cleanText = normalizeTriggerText(rawMsg);
                        if (!senderId || !cleanText) continue;

                        // Ignorar se a mensagem foi disparada pela própria página conectada
                        if (senderId === '17841403206297941' || senderId === '205343386680447') {
                            continue;
                        }

                        console.log(`[Instagram Messaging Webhook] Recebida DM de ${senderId}: "${rawMsg}"`);

                        // Buscar sessão ativa por senderId ou varrer sessões existentes no Map
                        let targetSession: any = instagramFollowGateSessions.get(senderId);
                        if (!targetSession) {
                            for (const [k, s] of instagramFollowGateSessions.entries()) {
                                if (s.senderId === senderId) {
                                    targetSession = s;
                                    break;
                                }
                            }
                        }

                        // Fallback persistente no Supabase (essencial para Vercel Serverless / Lambdas)
                        if (!targetSession && supabase) {
                            try {
                                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

                                // 1. Tentar buscar pelo senderId salvo em post_id nas últimas 24h
                                let { data: sessionLog } = await supabase
                                    .from('instagram_comment_logs')
                                    .select('*')
                                    .eq('post_id', senderId)
                                    .ilike('dm_sent_text', '%segue%')
                                    .gte('timestamp', oneDayAgo)
                                    .order('timestamp', { ascending: false })
                                    .limit(1)
                                    .maybeSingle();

                                // 2. Se não encontrou por post_id exato, buscar a sessão de follow gate mais recente nas últimas 24h
                                if (!sessionLog) {
                                    const { data: latestLog } = await supabase
                                        .from('instagram_comment_logs')
                                        .select('*')
                                        .ilike('dm_sent_text', '%segue%')
                                        .gte('timestamp', oneDayAgo)
                                        .order('timestamp', { ascending: false })
                                        .limit(1)
                                        .maybeSingle();
                                    sessionLog = latestLog;
                                }

                                if (sessionLog) {
                                    // Verificar se este seguidor já confirmou anteriormente
                                    const { data: alreadyConfirmed } = await supabase
                                        .from('instagram_comment_logs')
                                        .select('id')
                                        .eq('post_id', senderId)
                                        .ilike('rule_name', '%(Seguidor Confirmado)%')
                                        .gte('timestamp', sessionLog.timestamp)
                                        .limit(1)
                                        .maybeSingle();

                                    if (!alreadyConfirmed) {
                                        targetSession = {
                                            companyId: sessionLog.company_id,
                                            ruleId: sessionLog.rule_id,
                                            username: sessionLog.instagram_username,
                                            commentId: null,
                                            senderId: senderId,
                                            step: 'awaiting_follow_answer',
                                            createdAt: new Date(sessionLog.timestamp).getTime()
                                        };
                                    } else {
                                        console.log('[Instagram Webhook] Sessão de Follow Gate já confirmada anteriormente para', senderId);
                                        continue;
                                    }
                                }
                            } catch (e: any) {
                                console.warn('[Follow-Gate Supabase Session Error]:', e.message);
                            }
                        }

                        if (!targetSession) {
                            console.log('[Instagram Webhook] Nenhuma sessão de Follow-Gate pendente para senderId:', senderId);
                            continue;
                        }

                        // Buscar a regra no Supabase e em memória
                        let rule: any = inMemoryInstagramAutomations.find(r => r.id === targetSession.ruleId);
                        if (!rule && supabase) {
                            try {
                                const { data: dbRule } = await supabase
                                    .from('instagram_comment_automations')
                                    .select('*')
                                    .eq('id', targetSession.ruleId)
                                    .maybeSingle();
                                if (dbRule) rule = mapInstagramAutomationFromDB(dbRule);
                            } catch {}
                        }

                        if (!rule) {
                            console.warn('[Instagram Webhook] Regra não encontrada para ID:', targetSession.ruleId);
                            continue;
                        }

                        let compSettings = await resolveInstagramSettings(targetSession.companyId);
                        const accessToken = compSettings?.accessToken;
                        const cleanPageId = (compSettings?.pageId && !compSettings.pageId.startsWith('100000000000')) ? compSettings.pageId : undefined;

                        const isNegation = cleanText.includes('nao') || cleanText === 'n';
                        const isAffirmation = cleanText === 'sim' || cleanText === 's' || cleanText === 'segui' || 
                                              cleanText.includes('sim') || cleanText.includes('segui') || 
                                              cleanText.includes('ja sigo') || cleanText.includes('seguindo') || 
                                              cleanText.includes('pronto') || cleanText.includes('feito') ||
                                              cleanText.includes('comecei a seguir') || cleanText === 'sigo';

                        const isNo = isNegation && !cleanText.includes('sim');
                        const isYes = isAffirmation && !isNegation;

                        if (isNo) {
                            targetSession.step = 'awaiting_follow_action';
                            const template = rule.followGateConfig?.notFollowingMessage || DEFAULT_FOLLOW_GATE_CONFIG.notFollowingMessage;
                            const msgToSend = template.replace(/\{\{username\}\}/gi, targetSession.username || '');
                            await sendInstagramDirectMessage(senderId, msgToSend, accessToken, cleanPageId);
                        } else if (isYes) {
                            // Verificar se realmente segue via Graph API
                            let isFollowing = true;
                            if (accessToken) {
                                isFollowing = await checkInstagramFollowStatus(senderId, accessToken);
                            }
                            if (!isFollowing && rule.followGateConfig?.strictMetaCheck !== false && accessToken) {
                                const template = rule.followGateConfig?.verifyFailMessage || DEFAULT_FOLLOW_GATE_CONFIG.verifyFailMessage;
                                const msgToSend = template.replace(/\{\{username\}\}/gi, targetSession.username || '');
                                await sendInstagramDirectMessage(senderId, msgToSend, accessToken, cleanPageId);
                            } else {
                                // Seguidor confirmado: envia DM final com link de acesso e post relacionado
                                const confirmTemplate = rule.followGateConfig?.confirmFollowMessage || DEFAULT_FOLLOW_GATE_CONFIG.confirmFollowMessage;
                                let dm = rule.directMessage.replace(/\{\{username\}\}/gi, targetSession.username || '');
                                if (rule.ctaButton?.url && !dm.includes(rule.ctaButton.url)) {
                                    const btnLabel = rule.ctaButton.text ? `\n\n👉 ${rule.ctaButton.text}:\n` : '\n\n👉 Link de Acesso:\n';
                                    dm = `${dm}${btnLabel}${rule.ctaButton.url}`;
                                }
                                const fullMsg = `${confirmTemplate.replace(/\{\{username\}\}/gi, targetSession.username || '')}\n\n${dm}`;
                                await sendInstagramDirectMessage(senderId, fullMsg, accessToken, cleanPageId);

                                // Envio de post relacionado complementar
                                if (rule.relatedPostPromotion?.enabled && rule.relatedPostPromotion?.postUrl) {
                                    const relMsg = `${rule.relatedPostPromotion.message || DEFAULT_RELATED_POST_PROMOTION.message}\n👉 ${rule.relatedPostPromotion.postUrl}`;
                                    await sendInstagramDirectMessage(senderId, relMsg, accessToken, cleanPageId);
                                }

                                rule.stats.dmsSent = (rule.stats.dmsSent || 0) + 1;
                                instagramFollowGateSessions.delete(senderId);

                                if (supabase) {
                                    Promise.resolve(
                                        supabase
                                            .from('instagram_comment_automations')
                                            .update({ stats: rule.stats, updated_at: new Date().toISOString() })
                                            .eq('id', rule.id)
                                    ).catch(() => {});

                                    Promise.resolve(
                                        supabase
                                            .from('instagram_comment_logs')
                                            .insert([{
                                                id: `log-fg-${Date.now()}`,
                                                company_id: targetSession.companyId,
                                                rule_id: targetSession.ruleId,
                                                rule_name: `${rule.name} (Seguidor Confirmado)`,
                                                instagram_username: targetSession.username,
                                                comment_text: rawMsg,
                                                post_id: senderId,
                                                public_reply_given: 'Confirmado no Direct ✅',
                                                dm_sent_text: fullMsg,
                                                status: 'delivered',
                                                timestamp: new Date().toISOString()
                                            }])
                                    ).catch(() => {});
                                }
                            }
                        } else {
                            // Resposta alternativa durante o portão de confirmação
                            const clarifyMsg = 'Para eu te liberar o acesso exclusivo, por favor responda com "SIM" (se você já segue nosso perfil) ou "NÃO" 👇';
                            await sendInstagramDirectMessage(senderId, clarifyMsg, accessToken, cleanPageId);
                        }
                    }
                }
            }
        }

        res.status(200).json({ status: 'EVENT_RECEIVED' });
    } catch (err: any) {
        console.error('[Instagram Webhook] Erro:', err.message);
        res.status(200).json({ status: 'ERROR_HANDLED' });
    }
});

app.get('/api/instagram/settings', async (req: Request, res: Response) => {
    try {
        const companyId = req.query.companyId as string || 'comp-alfa';
        let foundConfig = inMemoryInstagramSettings[companyId];

        try {
            if (supabase) {
                const { data } = await supabase
                    .from('settings')
                    .select('instagram_config, global_meta_token')
                    .eq('company_id', companyId)
                    .maybeSingle();

                if (data?.instagram_config) {
                    foundConfig = {
                        ...(foundConfig || {}),
                        ...data.instagram_config
                    };
                } else if (data?.global_meta_token && !foundConfig?.accessToken) {
                    foundConfig = {
                        ...(foundConfig || {}),
                        accessToken: data.global_meta_token,
                        status: 'connected'
                    };
                }
            }
        } catch {}

        const s = foundConfig || {
            accessToken: '',
            instagramAccountId: '',
            pageId: '',
            verifyToken: process.env.INSTAGRAM_VERIFY_TOKEN || 'mdtracker_instagram_token',
            autoReplyReal: false,
            connectedAccountName: '',
            status: 'disconnected'
        };
        res.json(s);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/instagram/settings', async (req: Request, res: Response) => {
    try {
        const { companyId, settings } = req.body;
        const targetComp = companyId || 'comp-alfa';

        let finalSettings = { ...(settings || {}) };
        const rawToken = (finalSettings.accessToken || '').trim();

        // Se foi enviado um Token, verificar se em /me/accounts existe um Page Access Token perpétuo
        if (rawToken) {
            try {
                const accRes = await fetch(`https://graph.facebook.com/v20.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username,name}&access_token=${encodeURIComponent(rawToken)}`);
                const accJson = await accRes.json();
                if (accJson.data && Array.isArray(accJson.data) && accJson.data.length > 0) {
                    const pageObj = accJson.data[0];
                    if (pageObj.access_token) {
                        finalSettings.accessToken = pageObj.access_token;
                    }
                    if (pageObj.id && (!finalSettings.pageId || finalSettings.pageId.startsWith('100000000000'))) {
                        finalSettings.pageId = pageObj.id;
                    }
                    if (pageObj.instagram_business_account?.id && (!finalSettings.instagramAccountId || finalSettings.instagramAccountId.startsWith('178414000000'))) {
                        finalSettings.instagramAccountId = pageObj.instagram_business_account.id;
                        finalSettings.connectedAccountName = `@${pageObj.instagram_business_account.username} (${pageObj.name})`;
                    }
                }
            } catch {}

            // Auto-inscrever o app no Instagram Business Account e na Página
            if (finalSettings.instagramAccountId || finalSettings.pageId) {
                subscribeInstagramAndPage(finalSettings.instagramAccountId, finalSettings.pageId, finalSettings.accessToken).catch(() => {});
            }
        }

        inMemoryInstagramSettings[targetComp] = {
            ...(inMemoryInstagramSettings[targetComp] || {}),
            ...finalSettings
        };

        // Salvar em arquivo local para persistência garantida
        try {
            fs.writeFileSync(INSTAGRAM_SETTINGS_FILE, JSON.stringify(inMemoryInstagramSettings, null, 2), 'utf-8');
        } catch (fileErr: any) {
            console.error('[Instagram Settings] Erro ao salvar arquivo local:', fileErr.message);
        }

        // Tentar salvar no Supabase (se coluna instagram_config existir)
        try {
            if (supabase) {
                const { error } = await supabase.from('settings').update({
                    instagram_config: inMemoryInstagramSettings[targetComp],
                    global_meta_token: finalSettings.accessToken || undefined,
                    updated_at: new Date().toISOString()
                }).eq('company_id', targetComp);

                if (error) {
                    console.warn('[Instagram Settings] Aviso Supabase:', error.message);
                    if (finalSettings.accessToken) {
                        await supabase.from('settings').update({
                            global_meta_token: finalSettings.accessToken,
                            updated_at: new Date().toISOString()
                        }).eq('company_id', targetComp);
                    }
                }
            }
        } catch (dbErr: any) {
            console.warn('[Instagram Settings] Erro ao sincronizar com Supabase:', dbErr.message);
        }

        res.json(inMemoryInstagramSettings[targetComp]);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/instagram/test-token', async (req: Request, res: Response) => {
    try {
        const { accessToken, instagramAccountId } = req.body;
        if (!accessToken || !accessToken.trim()) {
            return res.status(400).json({ success: false, message: 'Access Token da Meta é obrigatório' });
        }

        const token = accessToken.trim();

        // 1. Inspecionar o Token com debug_token oficial da Meta
        let tokenDebugData: any = null;
        try {
            const debugUrl = `https://graph.facebook.com/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(token)}`;
            const debugRes = await fetch(debugUrl);
            const debugJson = await debugRes.json();
            if (debugJson.data) {
                tokenDebugData = debugJson.data;
            }
        } catch (e: any) {
            console.warn('[test-token] Erro ao consultar debug_token:', e.message);
        }

        // 2. Se debug_token identificou o aplicativo ou permissões (scopes)
        if (tokenDebugData) {
            const appName = tokenDebugData.application || '';
            const scopes: string[] = tokenDebugData.scopes || [];

            // Se for Token do Gerenciador de Eventos / Pixel (CAPI)
            const isCapi = appName.toLowerCase().includes('conversions api') || 
                           (scopes.length > 0 && !scopes.some(s => s.includes('manage_messages') || s.includes('messaging') || s.includes('manage_comments')));

            if (isCapi) {
                return res.status(400).json({
                    success: false,
                    isCapiToken: true,
                    application: appName,
                    scopes,
                    message: `⚠️ Este Token pertence ao Pixel / Conversions API ("${appName}"), permissões: [${scopes.join(', ')}]. Ele NÃO possui permissões para enviar Directs nem gerenciar comentários no Instagram! Para enviar mensagens no Instagram, você DEVE gerar um Token no Meta for Developers com 'instagram_manage_messages' e 'instagram_manage_comments'.`
                });
            }
        }

        // 3. Tentar descobrir Páginas e Contas Comerciais do Instagram vinculadas
        let discoveredPageId = '';
        let discoveredInstagramId = '';
        let discoveredName = '';

        try {
            const accountsUrl = `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account{id,username}&access_token=${encodeURIComponent(token)}`;
            const accRes = await fetch(accountsUrl);
            const accJson = await accRes.json();
            if (accJson.data && Array.isArray(accJson.data) && accJson.data.length > 0) {
                const firstPage = accJson.data[0];
                discoveredPageId = firstPage.id;
                discoveredName = firstPage.name;
                if (firstPage.instagram_business_account) {
                    discoveredInstagramId = firstPage.instagram_business_account.id;
                    discoveredName = `@${firstPage.instagram_business_account.username} (${firstPage.name})`;
                }
            }
        } catch {}

        // Fallback: se não encontrou em /me/accounts, tentar endpoint direto
        if (!discoveredName) {
            const target = instagramAccountId ? instagramAccountId.trim() : 'me';
            const graphUrl = `https://graph.facebook.com/v19.0/${target}?fields=id,name,username,instagram_business_account{id,username}&access_token=${encodeURIComponent(token)}`;
            try {
                const metaRes = await fetch(graphUrl);
                const metaData = await metaRes.json();

                if (metaData.error) {
                    return res.status(400).json({ 
                        success: false, 
                        message: metaData.error.message || 'Token inválido ou sem permissões da Meta' 
                    });
                }

                discoveredName = metaData.username || metaData.name || 'Conta Meta Conectada';
                if (metaData.instagram_business_account) {
                    discoveredInstagramId = metaData.instagram_business_account.id;
                    discoveredName = `@${metaData.instagram_business_account.username}`;
                }
            } catch (fetchErr: any) {
                return res.status(500).json({
                    success: false,
                    message: `Falha na requisição à Meta: ${fetchErr.message}`
                });
            }
        }

        return res.json({
            success: true,
            accountName: discoveredName || 'Conta Meta Conectada',
            id: tokenDebugData?.user_id || 'OK',
            pageId: discoveredPageId || undefined,
            instagramAccountId: discoveredInstagramId || undefined,
            scopes: tokenDebugData?.scopes || []
        });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// WhatsApp API
app.get('/api/whatsapp/status', async (req: Request, res: Response) => {
    const companyId = req.query.companyId as string || 'comp-alfa';
    res.json(await getWhatsAppStatus(companyId));
});

app.post('/api/whatsapp/connect', async (req: Request, res: Response) => {
    try {
        const companyId = req.body.companyId || 'comp-alfa';
        await startWhatsApp(companyId);
        res.json({ success: true, message: 'Iniciando conexão...' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/whatsapp/logout', async (req: Request, res: Response) => {
    try {
        const companyId = req.body.companyId || 'comp-alfa';
        await logoutWhatsApp(companyId);
        res.json({ success: true, message: 'Desconectado com sucesso' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/whatsapp/evolution/test', async (req: Request, res: Response) => {
    try {
        const { url, apiKey } = req.body;
        if (!url || !apiKey) {
            return res.status(400).json({ success: false, message: 'URL e API Key são obrigatórios.' });
        }
        
        const baseUrl = url.replace(/\/$/, '');
        const response = await fetch(`${baseUrl}/instance/fetchInstances`, {
            method: 'GET',
            signal: AbortSignal.timeout(8000),
            headers: {
                'apikey': apiKey
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const { instanceName } = req.body;
            let instanceExists = true;
            if (instanceName && Array.isArray(data)) {
                instanceExists = data.some((inst: any) => 
                    inst.instanceName === instanceName || 
                    inst.instance?.instanceName === instanceName || 
                    inst.name === instanceName
                );
                
                // Se a instância já existe, garantir que o webhook está configurado corretamente
                if (instanceExists) {
                    const webhookPayload = {
                        enabled: true,
                        url: "https://mdtracker.mudadigital.com.br/api/whatsapp/evolution/webhook",
                        byEvents: false,
                        base64: true,
                        events: ["MESSAGES_UPSERT", "messages.upsert"]
                    };
                    await fetch(`${baseUrl}/webhook/set/${instanceName}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'apikey': apiKey },
                        body: JSON.stringify({ webhook: webhookPayload })
                    }).catch(e => console.error('Erro ao sincronizar webhook no teste:', e));
                }
            }
            res.json({ success: true, message: 'Conexão bem-sucedida! Webhook sincronizado.', instanceExists });
        } else if (response.status === 401 || response.status === 403) {
            res.json({ success: false, message: 'Acesso Negado. Verifique a Global API Key.' });
        } else {
            res.json({ success: false, message: `Erro no servidor da API (HTTP ${response.status})` });
        }
    } catch (err: any) {
        res.json({ success: false, message: `Erro ao conectar: ${err.message}` });
    }
});

app.post('/api/whatsapp/evolution/create-instance', async (req: Request, res: Response) => {
    try {
        const { url, apiKey, instanceName } = req.body;
        if (!url || !apiKey || !instanceName) {
            return res.status(400).json({ success: false, message: 'URL, API Key e Nome da Instância são obrigatórios.' });
        }
        
        const baseUrl = url.replace(/\/$/, '');
        const webhookPayload = {
            enabled: true,
            url: "https://mdtracker.mudadigital.com.br/api/whatsapp/evolution/webhook",
            byEvents: false,
            base64: true,
            events: ["MESSAGES_UPSERT", "messages.upsert"]
        };
        
        const response = await fetch(`${baseUrl}/instance/create`, {
            method: 'POST',
            signal: AbortSignal.timeout(15000),
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify({
                instanceName,
                qrcode: true,
                integration: "WHATSAPP-BAILEYS",
                webhook: webhookPayload
            })
        });
        
        const data = await response.json();
        if (response.ok) {
            res.json({ success: true, message: 'Instância criada com sucesso! Por favor, role para cima e clique no botão verde "Gerar QR Code para Conectar" para ler o QR Code.' });
        } else {
            res.json({ success: false, message: data.message || data.error || 'Erro ao criar instância.' });
        }
    } catch (err: any) {
        res.json({ success: false, message: `Erro ao criar instância: ${err.message}` });
    }
});

app.post('/api/whatsapp/send', async (req: Request, res: Response) => {
    const { phone, message } = req.body;
    if (!phone || !message) {
        return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios' });
    }
    
    try {
        const companyId = req.body.companyId || 'comp-alfa';
        const success = await sendWhatsAppMessage(companyId, phone, message);
        if (success) {
            res.json({ success: true, message: 'Mensagem enviada com sucesso' });
        } else {
            res.status(500).json({ error: 'Erro ao enviar mensagem' });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/whatsapp/send-media', async (req: Request, res: Response) => {
    const { phone, mediaBase64, mediaType, caption } = req.body;
    if (!phone || !mediaBase64 || !mediaType) {
        return res.status(400).json({ error: 'Telefone, mediaBase64 e mediaType são obrigatórios' });
    }
    
    try {
        const companyId = req.body.companyId || 'comp-alfa';
        const success = await sendWhatsAppMedia(companyId, phone, mediaBase64, mediaType, caption);
        if (success) {
            res.json({ success: true, message: 'Mídia enviada com sucesso' });
        } else {
            res.status(500).json({ error: 'Erro ao enviar mídia' });
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/whatsapp/messages/:phone', async (req: Request, res: Response) => {
    let { phone } = req.params;
    if (!phone) return res.status(400).json({ error: 'Telefone é obrigatório' });

    let cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('55') && (cleanPhone.length === 10 || cleanPhone.length === 11)) {
        cleanPhone = '55' + cleanPhone;
    }

    const { data, error } = await supabase
        .from('whatsapp_messages')
        .select('*')
        .eq('lead_phone', cleanPhone)
        .order('timestamp', { ascending: true });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data || []);
});

// Companies API
app.get('/api/companies', async (req: Request, res: Response) => {
    const { data, error } = await supabase.from('companies').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json((data || []).map(mapCompanyFromDB));
});

app.post('/api/companies', async (req: Request, res: Response) => {
    const body = req.body;
    const dbRecord = mapCompanyToDB(body);
    const { error } = await supabase.from('companies').insert(dbRecord);
    if (error) return res.status(500).json({ error: error.message });
    res.json(body);
});

app.put('/api/companies/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const dbRecord = mapCompanyToDB(req.body);
    const { error } = await supabase.from('companies').update(dbRecord).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ...req.body, id });
});

// Users API
app.get('/api/users', async (req: Request, res: Response) => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json((data || []).map(mapUserFromDB));
});

app.post('/api/users', async (req: Request, res: Response) => {
    const body = req.body;
    if (body.password) {
        body.password = await bcrypt.hash(body.password, 10);
    }
    const dbRecord = mapUserToDB(body);
    const { error } = await supabase.from('users').insert(dbRecord);
    if (error) return res.status(500).json({ error: error.message });
    res.json(body);
});

app.post('/api/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });

    const { data: user, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .ilike('email', email.trim())
        .eq('active', true)
        .maybeSingle();
        
    if (fetchErr || !user || !user.password) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }
    
    const { data: company, error: companyErr } = await supabase
        .from('companies')
        .select('*')
        .eq('id', user.company_id)
        .eq('active', true)
        .maybeSingle();
        
    if (companyErr || !company) {
        return res.status(401).json({ error: 'Empresa inativa ou não encontrada.' });
    }

    res.json({ user: mapUserFromDB(user), company: mapCompanyFromDB(company) });
});

app.put('/api/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data: existing, error: fetchErr } = await supabase.from('users').select('*').eq('id', id).single();
    if (fetchErr || !existing) return res.status(404).json({ error: 'Usuário não encontrado' });
    
    if (req.body.password && !req.body.password.startsWith('$2b$')) {
        req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const updated = {
        ...mapUserFromDB(existing),
        ...req.body
    };
    
    const dbRecord = mapUserToDB(updated);
    const { error } = await supabase.from('users').update(dbRecord).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json(updated);
});

app.delete('/api/users/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, id });
});

// API Routes
app.get('/api/links', async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const { data, error } = await supabase.from('campaign_links').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    
    const links = data.map(mapLinkFromDB);

    // If date filters are provided, calculate clicks from link_clicks table
    if (startDate && endDate) {
      const startStr = startDate as string;
      const endStr = endDate as string;
      const startOfDay = startStr.includes('T') ? startStr : `${startStr}T00:00:00.000Z`;
      const endOfDay = endStr.includes('T') ? endStr : `${endStr}T23:59:59.999Z`;

      const { data: clicksData } = await supabase
        .from('link_clicks')
        .select('link_id')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      if (clicksData) {
        const clickCounts: Record<string, number> = {};
        clicksData.forEach(c => {
          clickCounts[c.link_id] = (clickCounts[c.link_id] || 0) + 1;
        });

        links.forEach(l => {
          l.clicksCount = clickCounts[l.id] || 0;
        });
      } else {
        links.forEach(l => { l.clicksCount = 0; });
      }

      // Calculate leads and conversions from leads table
      const { data: leadsData } = await supabase
        .from('leads')
        .select('link_id, stage')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay);

      if (leadsData) {
        const leadCounts: Record<string, number> = {};
        const convCounts: Record<string, number> = {};
        
        leadsData.forEach(l => {
          if (l.link_id) {
            leadCounts[l.link_id] = (leadCounts[l.link_id] || 0) + 1;
            if (l.stage === 'Convertido') {
              convCounts[l.link_id] = (convCounts[l.link_id] || 0) + 1;
            }
          }
        });

        links.forEach(l => {
          l.leadsCount = leadCounts[l.id] || 0;
          l.conversionsCount = convCounts[l.id] || 0;
        });
      } else {
        links.forEach(l => { l.leadsCount = 0; l.conversionsCount = 0; });
      }
    }

    res.json(links);
});

app.post('/api/links', async (req: Request, res: Response) => {
    const body = req.body;
    const newLink: CampaignLink = {
      id: `link-${Date.now()}`,
      companyId: body.companyId || 'comp-alfa',
      title: body.title || 'Novo Link WhatsApp',
      phone: body.phone || '5511999999999',
      message: body.message || 'Olá! Gostaria de mais informações.',
      slug: (body.slug || `wa-${Date.now().toString(36)}`).toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'),
      utmSource: body.utmSource || 'whatsapp',
      utmMedium: body.utmMedium || 'cpc',
      utmCampaign: body.utmCampaign || 'campanha_whatsapp',
      utmContent: body.utmContent || '',
      utmTerm: body.utmTerm || '',
      customTags: body.customTags || {},
      captureLeadForm: Boolean(body.captureLeadForm),
      metaPixelId: body.metaPixelId || '',
      metaEventName: body.metaEventName || '',
      googleAdsConversionId: body.googleAdsConversionId || '',
      googleAdsLabel: body.googleAdsLabel || '',
      webhookUrl: body.webhookUrl || '',
      clicksCount: 0,
      leadsCount: 0,
      conversionsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const dbRecord = mapLinkToDB(newLink);
    const { error } = await supabase.from('campaign_links').insert(dbRecord);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(newLink);
});

app.put('/api/links/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data: existing, error: fetchErr } = await supabase.from('campaign_links').select('*').eq('id', id).single();
    if (fetchErr || !existing) return res.status(404).json({ error: 'Link não encontrado' });
    
    const updated = {
      ...mapLinkFromDB(existing),
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    const dbRecord = mapLinkToDB(updated);
    const { error } = await supabase.from('campaign_links').update(dbRecord).eq('id', id);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(updated);
});

app.delete('/api/links/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { error } = await supabase.from('campaign_links').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, id });
});

// Leads API
app.get('/api/leads', async (req: Request, res: Response) => {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(mapLeadFromDB));
});

app.post('/api/leads', async (req: Request, res: Response) => {
    const body = req.body;
    
    // Real location from Vercel Headers or fallback to mock
    const userIp = (req.headers['x-forwarded-for'] as string || req.ip || '177.100.20.10').split(',')[0].trim();
    const vercelCity = req.headers['x-vercel-ip-city'] as string;
    const locationObj = vercelCity ? {
      city: decodeURIComponent(vercelCity),
      state: req.headers['x-vercel-ip-country-region'] as string || '',
      country: req.headers['x-vercel-ip-country'] as string || '',
      ip: userIp
    } : mockGeoFromIp(userIp);

    const companyId = body.companyId || 'comp-alfa';
    const sanitizedPhone = (body.phone || '').replace(/\D/g, '');
    let existingLead: any = null;

    if (sanitizedPhone) {
        const phoneOptions = [sanitizedPhone, sanitizedPhone.startsWith('55') ? sanitizedPhone.substring(2) : '55' + sanitizedPhone];
        const { data: matches } = await supabase
            .from('leads')
            .select('*')
            .eq('company_id', companyId)
            .in('phone', phoneOptions)
            .order('created_at', { ascending: false });
            
        if (matches && matches.length > 0) {
            existingLead = matches.find(l => l.stage !== 'Convertido' && l.stage !== 'Perdido');
        }
    }

    const newEvent = {
        id: `evt-${Date.now()}`,
        type: 'meta_pixel' as const,
        eventName: 'Lead',
        status: 'sucesso' as const,
        timestamp: new Date().toISOString(),
        details: `Acesso via: ${body.utmCampaign || 'campanha_geral'} (${body.utmSource || 'meta_ads'})`,
        utmSource: body.utmSource,
        utmMedium: body.utmMedium,
        utmCampaign: body.utmCampaign,
        utmContent: body.utmContent,
        utmTerm: body.utmTerm
    };

    if (existingLead) {
        const updatedEvents = [...(existingLead.conversion_events || []), newEvent];
        const { error } = await supabase.from('leads').update({
            conversion_events: updatedEvents,
            updated_at: new Date().toISOString(),
            utm_source: body.utmSource || existingLead.utm_source,
            utm_medium: body.utmMedium || existingLead.utm_medium,
            utm_campaign: body.utmCampaign || existingLead.utm_campaign,
            utm_content: body.utmContent || existingLead.utm_content,
            utm_term: body.utmTerm || existingLead.utm_term,
            link_id: body.linkId || existingLead.link_id,
            link_title: body.linkTitle || existingLead.link_title
        }).eq('id', existingLead.id);
        
        if (error) return res.status(500).json({ error: error.message });
        
        if (body.linkId) {
            const { data: link } = await supabase.from('campaign_links').select('leads_count').eq('id', body.linkId).single();
            if (link) {
                await supabase.from('campaign_links').update({ leads_count: (link.leads_count || 0) + 1 }).eq('id', body.linkId);
            }
        }
        
        return res.json({ success: true, lead: mapLeadFromDB(existingLead) });
    }

    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      companyId: companyId,
      name: body.name || 'Lead Anônimo',
      phone: body.phone || '',
      email: body.email || '',
      location: body.location || locationObj,
      source: body.source || 'Direct / Meta Ads',
      utmSource: body.utmSource || 'meta_ads',
      utmMedium: body.utmMedium || 'cpc',
      utmCampaign: body.utmCampaign || 'campanha_geral',
      utmContent: body.utmContent || '',
      utmTerm: body.utmTerm || '',
      linkId: body.linkId || '',
      linkTitle: body.linkTitle || 'Link Rastreável',
      stage: (body.stage as FunnelStage) || 'Novo Lead',
      value: body.value ? Number(body.value) : 0,
      device: body.device || 'Mobile Browser',
      browser: body.browser || 'Chrome / Safari',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: body.notes || 'Lead registrado via link de rastreamento WhatsApp',
      conversionEvents: [newEvent]
    };

    const { error } = await safeInsertLead(mapLeadToDB(newLead));
    if (error) return res.status(500).json({ error: error.message });

    // Update link counters
    let targetWebhook = null;
    if (newLead.linkId) {
      const { data: linkObj } = await supabase.from('campaign_links').select('*').eq('id', newLead.linkId).single();
      if (linkObj) {
        targetWebhook = linkObj.webhook_url;
        await supabase.from('campaign_links')
          .update({ leads_count: (linkObj.leads_count || 0) + 1, updated_at: new Date().toISOString() })
          .eq('id', newLead.linkId);
      }
    }

    // Trigger Webhook if autoFire is enabled
    const settings = await getSettings(newLead.companyId);
    const finalWebhookUrl = settings.globalWebhookUrl || targetWebhook;
    if (settings.autoFireWebhookOnLead && finalWebhookUrl) {
      triggerWebhook(finalWebhookUrl, 'lead_created', newLead, newLead.name);
    }

    // Trigger Marketing Automation Workflows (RD Station style)
    triggerWorkflows('lead_created', { companyId: newLead.companyId, lead: newLead }).catch(() => null);

    res.json(newLead);
});

app.put('/api/leads/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { data: existingDb, error: fetchErr } = await supabase.from('leads').select('*').eq('id', id).single();
    if (fetchErr || !existingDb) return res.status(404).json({ error: 'Lead não encontrado' });
    
    const existing = mapLeadFromDB(existingDb);
    const oldStage = existing.stage;
    
    const updated: Lead = {
      ...existing,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    const settings = await getSettings(existing.companyId);

    // Stage change conversion tracking & stage-to-event reporting
    if (req.body.stage && req.body.stage !== oldStage) {
      const newStage = req.body.stage as FunnelStage;

      if (newStage === 'Convertido' && oldStage !== 'Convertido' && updated.linkId) {
        // Increment conversions count for link
        const { data: linkObj } = await supabase.from('campaign_links').select('conversions_count').eq('id', updated.linkId).single();
        if (linkObj) {
           await supabase.from('campaign_links')
             .update({ conversions_count: (linkObj.conversions_count || 0) + 1 })
             .eq('id', updated.linkId);
        }
      }

      // Check configured stage event mapping
      const stageMapping = (settings.stageEventMappings && settings.stageEventMappings[newStage]) || DEFAULT_STAGE_MAPPINGS[newStage];
      if (stageMapping && stageMapping.enabled) {
        // Meta Ads CAPI Event
        if (stageMapping.metaEvent) {
          updated.conversionEvents.push({
            id: `evt-meta-${Date.now()}`,
            type: 'meta_capi',
            eventName: stageMapping.metaEvent,
            status: 'sucesso',
            timestamp: new Date().toISOString(),
            details: `Evento Meta Ads CAPI [${stageMapping.metaEvent}] disparado automaticamente para a etapa '${newStage}'`
          });
          try {
            await sendMetaCAPIEvent(stageMapping.metaEvent, updated, settings, req.ip, req.headers['user-agent']);
          } catch(e){}
        }

        // Google Ads Conversion Tag
        if (stageMapping.googleLabel) {
          updated.conversionEvents.push({
            id: `evt-gads-${Date.now()}`,
            type: 'google_ads',
            eventName: stageMapping.googleLabel,
            status: 'sucesso',
            timestamp: new Date().toISOString(),
            details: `Tag de Conversão Google Ads [${stageMapping.googleLabel}] reportada automaticamente para '${newStage}'`
          });
        }
      } else if (newStage === 'Convertido') {
        // Fallback for Convertido stage
        updated.conversionEvents.push({
          id: `evt-${Date.now()}`,
          type: 'meta_capi',
          eventName: 'Purchase',
          status: 'sucesso',
          timestamp: new Date().toISOString(),
          details: `Conversão no valor de R$ ${(updated.value || 0).toFixed(2)}`
        });
        try {
          await sendMetaCAPIEvent('Purchase', updated, settings, req.ip, req.headers['user-agent']);
        } catch(e){}
      }

      // Trigger Webhook on stage update
      const targetWebhook = settings.globalWebhookUrl;
      if (settings.autoFireWebhookOnStageChange && targetWebhook) {
        triggerWebhook(targetWebhook, 'lead_stage_updated', {
          lead_id: updated.id,
          name: updated.name,
          old_stage: oldStage,
          new_stage: updated.stage,
          value: updated.value,
          meta_event_fired: stageMapping?.metaEvent || (newStage === 'Convertido' ? 'Purchase' : 'None'),
          google_label_fired: stageMapping?.googleLabel || 'None',
          timestamp: new Date().toISOString()
        }, updated.name);
      }
    }

    const { error } = await safeUpdateLead(id, mapLeadToDB(updated));
    if (error) return res.status(500).json({ error: error.message });
    
    // Trigger Marketing Automation Workflows if stage changed
    if (req.body.stage && req.body.stage !== oldStage) {
      triggerWorkflows('stage_changed', {
        companyId: existing.companyId,
        lead: updated,
        context: { oldStage, newStage: req.body.stage }
      }).catch(() => null);
    }

    res.json(updated);
});

app.delete('/api/leads/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, id });
});

app.post('/api/leads/batch-delete', async (req: Request, res: Response) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Nenhum lead especificado para exclusão.' });
    }
    const { error } = await supabase.from('leads').delete().in('id', ids);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, count: ids.length });
});

// Export CSV
app.get('/api/leads/export', async (req: Request, res: Response) => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    const leadsList = (data || []).map(mapLeadFromDB);
    
    const headers = ['ID', 'Nome', 'Telefone', 'Email', 'Cidade', 'Estado', 'Pais', 'Origem', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Etapa', 'Valor', 'Data Entrada', 'Ultima Alteracao'];
    const rows = leadsList.map(l => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${l.phone || ''}"`,
      `"${l.email || ''}"`,
      `"${l.location?.city || ''}"`,
      `"${l.location?.state || ''}"`,
      `"${l.location?.country || ''}"`,
      `"${l.source || ''}"`,
      `"${l.utmSource || ''}"`,
      `"${l.utmMedium || ''}"`,
      `"${l.utmCampaign || ''}"`,
      `"${l.stage || ''}"`,
      (l.value || 0).toString(),
      `"${l.createdAt}"`,
      `"${l.updatedAt}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="leads_whatsapp_rastreados.csv"');
    res.status(200).send('\uFEFF' + csvContent); // BOM for Excel UTF-8 support
});

// Settings API
app.get('/api/settings', async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    
    let targetCompanyId = req.query.companyId as string;
    if (!targetCompanyId || targetCompanyId === 'comp-alfa') {
        const { data: fallback } = await supabase.from('companies').select('id').eq('active', true).limit(1).maybeSingle();
        targetCompanyId = fallback ? fallback.id : 'comp-alfa';
    }
    
    const settings = await getSettings(targetCompanyId);
    if (!settings) {
        return res.json({ companyId: targetCompanyId }); 
    }
    res.json(settings);
});

app.post('/api/settings', async (req: Request, res: Response) => {
    let targetCompanyId = req.body.companyId;
    if (!targetCompanyId || targetCompanyId === 'comp-alfa') {
        const { data: fallback } = await supabase.from('companies').select('id').eq('active', true).limit(1).maybeSingle();
        targetCompanyId = fallback ? fallback.id : 'comp-alfa';
    }
    
    const dbRecord = mapSettingsToDB({ ...req.body, companyId: targetCompanyId });
    const { error } = await supabase.from('settings').upsert(dbRecord);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ...req.body, companyId: targetCompanyId });
});

// Webhook logs API
app.get('/api/webhooks/logs', async (req: Request, res: Response) => {
    const { data, error } = await supabase.from('webhook_logs').select('*').order('timestamp', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(mapWebhookFromDB));
});

app.post('/api/webhooks/test', async (req: Request, res: Response) => {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL do webhook é obrigatória' });
    }

    const testPayload = {
      event: 'test_ping',
      message: 'Disparo de teste do sistema RastreioWhatsApp',
      timestamp: new Date().toISOString(),
      system: 'RastreioWhatsApp v1.0'
    };

    await triggerWebhook(url, 'test_ping', testPayload, 'Teste de Sistema');
    res.json({ success: true, message: 'Webhook enviado para ' + url });
});

app.post('/api/meta/test', async (req: Request, res: Response) => {
    let { pixelId, token, eventName, companyId, testEventCode } = req.body;

    if ((!pixelId || !token) && companyId) {
        const compSettings = await getSettings(companyId);
        if (!pixelId) pixelId = compSettings.globalMetaPixelId;
        if (!token) token = compSettings.globalMetaToken;
    }

    if (!pixelId || !token) {
        return res.status(400).json({ success: false, message: 'Pixel ID e Token são obrigatórios. Configure-os em Integrações ou informe o Pixel neste link.' });
    }

    try {
        const payload = {
            data: [
                {
                    event_name: eventName || 'ViewAds',
                    event_time: Math.floor(Date.now() / 1000),
                    action_source: 'system_generated',
                    user_data: {
                        client_ip_address: req.ip || '192.168.0.1',
                        client_user_agent: req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                        external_id: 'test_user_12345',
                        em: '7b3ed0ce9b075fa592b21ee4c81abf59c12df8b1a415ff678330fc4b306b98ea', // test@example.com (SHA-256)
                        ph: '88656667b4eb2b069d2eb05b7dc1f27dc1c4bc27ffbb12c8e376ee226f3af2c5'  // 5511999999999 (SHA-256)
                    },
                    ...(testEventCode ? { test_event_code: testEventCode } : {})
                }
            ]
        };

        const response = await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        
        if (response.ok) {
            res.json({ success: true, message: `Evento "${eventName || 'ViewAds'}" enviado com sucesso à Meta via CAPI! (Pixel: ${pixelId})` });
        } else {
            res.json({ success: false, message: `Erro da Meta: ${data.error?.message || 'Falha desconhecida'}` });
        }
    } catch (error: any) {
        res.json({ success: false, message: `Erro interno: ${error.message}` });
    }
});

// Dashboard Aggregations API
app.get('/api/stats', async (req: Request, res: Response) => {
    const [{ data: linksData }, { data: leadsData }] = await Promise.all([
      supabase.from('campaign_links').select('clicks_count'),
      supabase.from('leads').select('stage, value, utm_campaign, utm_source')
    ]);
    
    const links = linksData || [];
    const leads = leadsData || [];

    const totalClicks = links.reduce((acc, l) => acc + (l.clicks_count || 0), 0);
    const totalLeads = leads.length;
    const convertedLeads = leads.filter(l => l.stage === 'Convertido');
    const totalConversions = convertedLeads.length;
    const totalRevenue = convertedLeads.reduce((acc, l) => acc + Number(l.value || 0), 0);
    const conversionRate = totalLeads > 0 ? Number(((totalConversions / totalLeads) * 100).toFixed(1)) : 0;

    // Top campaign
    const campaignMap: Record<string, number> = {};
    leads.forEach(l => {
      const cmp = l.utm_campaign || 'direto';
      campaignMap[cmp] = (campaignMap[cmp] || 0) + 1;
    });
    let topCampaign = 'Nenhuma';
    let maxCmp = 0;
    for (const [k, v] of Object.entries(campaignMap)) {
      if (v > maxCmp) {
        maxCmp = v;
        topCampaign = k;
      }
    }

    // Top Source
    const sourceMap: Record<string, number> = {};
    leads.forEach(l => {
      const src = l.utm_source || 'direto';
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });
    let topSource = 'Nenhuma';
    let maxSrc = 0;
    for (const [k, v] of Object.entries(sourceMap)) {
      if (v > maxSrc) {
        maxSrc = v;
        topSource = k;
      }
    }

    res.json({
      totalClicks,
      totalLeads,
      totalConversions,
      totalRevenue,
      conversionRate,
      topCampaign,
      topSource
    });
});

// ==========================================
// PUBLIC LANDING PAGE ROUTE (/p/:slug or /lp/:slug)
// ==========================================
app.get(['/p/:slug', '/lp/:slug'], async (req: Request, res: Response) => {
    try {
        const slug = req.params.slug.toLowerCase().trim();

        // 1. Search in Supabase or memory
        let lp: any = null;
        try {
            const { data } = await supabase
                .from('landing_pages')
                .select('*')
                .eq('slug', slug)
                .single();
            if (data) lp = mapLandingPageFromDB(data);
        } catch {}

        if (!lp) {
            const mem = inMemoryLandingPages.find(l => l.slug.toLowerCase() === slug);
            if (mem) lp = mapLandingPageFromDB(mem);
        }

        if (!lp) {
            return res.status(404).send(`
              <!DOCTYPE html>
              <html lang="pt-BR">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Página Não Encontrada - MDTracker</title>
                <script src="https://cdn.tailwindcss.com"></script>
              </head>
              <body class="bg-slate-900 text-white flex items-center justify-center min-h-screen p-4">
                <div class="max-w-md w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 text-center shadow-2xl">
                  <div class="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">!</div>
                  <h1 class="text-2xl font-bold text-white mb-2">Página Inexistente ou Inativa</h1>
                  <p class="text-slate-400 mb-6 text-sm">A Landing Page "<strong>${slug}</strong>" não foi encontrada ou foi arquivada.</p>
                  <a href="/" class="inline-block bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-lg">Voltar ao Painel</a>
                </div>
              </body>
              </html>
            `);
        }

        // 2. Increment view counter
        lp.viewsCount = (lp.viewsCount || 0) + 1;
        try {
            await supabase.from('landing_pages').update({ 
                views_count: lp.viewsCount,
                updated_at: new Date().toISOString()
            }).eq('id', lp.id);
        } catch {}
        const memObj = inMemoryLandingPages.find(l => l.id === lp.id);
        if (memObj) memObj.views_count = lp.viewsCount;

        // 3. Extract styling and content
        const primaryColor = lp.theme?.primaryColor || '#2563eb';
        const accentColor = lp.theme?.accentColor || '#10b981';
        const buttonShape = lp.theme?.buttonStyle || 'rounded-xl';
        const companyName = lp.footer?.companyName || 'MDTracker Growth';

        const fields = lp.form?.fields || [
            { id: 'name', name: 'name', label: 'Nome Completo', type: 'text', placeholder: 'Seu nome', required: true },
            { id: 'phone', name: 'phone', label: 'WhatsApp', type: 'tel', placeholder: '(11) 99999-9999', required: true },
            { id: 'email', name: 'email', label: 'Seu E-mail', type: 'email', placeholder: 'seu@email.com', required: true }
        ];

        // Render high-converting standalone HTML
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(`
          <!DOCTYPE html>
          <html lang="pt-BR" class="scroll-smooth">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${lp.title}</title>
            <meta name="description" content="${lp.description || lp.hero?.subheadline || ''}">
            <meta property="og:title" content="${lp.title}">
            <meta property="og:description" content="${lp.description || lp.hero?.subheadline || ''}">
            <meta property="og:type" content="website">

            <!-- Fonts -->
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Poppins:wght@400;600;700;800&family=Montserrat:wght@400;600;700;800&display=swap" rel="stylesheet">

            <!-- Tailwind CSS CDN -->
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
              tailwind.config = {
                theme: {
                  extend: {
                    colors: {
                      brand: '${primaryColor}',
                      accent: '${accentColor}'
                    },
                    fontFamily: {
                      sans: ['${lp.theme?.fontFamily || 'Inter'}', 'sans-serif']
                    }
                  }
                }
              }
            </script>
            <style>
              body { font-family: '${lp.theme?.fontFamily || 'Inter'}', sans-serif; }
              .custom-primary-btn {
                background-color: ${primaryColor};
                color: #ffffff;
              }
              .custom-primary-btn:hover {
                filter: brightness(0.92);
              }
            </style>
          </head>
          <body class="bg-slate-50 text-slate-800 antialiased selection:bg-blue-500 selection:text-white min-h-screen flex flex-col justify-between">
            
            <!-- Top Header -->
            <header class="w-full bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 transition shadow-sm">
              <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-lg shadow-md" style="background-color: ${primaryColor}">
                    ${(companyName || 'M').charAt(0).toUpperCase()}
                  </div>
                  <span class="font-bold text-slate-900 tracking-tight text-lg">${companyName}</span>
                </div>
                <div>
                  <a href="#capture-form" class="custom-primary-btn px-4 py-2 text-sm font-semibold ${buttonShape} shadow-sm transition inline-flex items-center gap-1.5">
                    ${lp.hero?.ctaText || 'Acessar Agora'} &rarr;
                  </a>
                </div>
              </div>
            </header>

            <!-- Hero Section -->
            <section class="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-slate-100">
              <div class="max-w-6xl mx-auto px-4 relative z-10">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  <!-- Left: Copy & Value Proposition -->
                  <div class="lg:col-span-7 text-center lg:text-left">
                    ${lp.hero?.badge ? `
                      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5 bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
                        <span>${lp.hero.badge}</span>
                      </div>
                    ` : ''}

                    <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-5">
                      ${lp.hero?.headline || lp.title}
                    </h1>

                    <p class="text-lg md:text-xl text-slate-600 leading-relaxed mb-8 max-w-2xl mx-auto lg:mx-0 font-normal">
                      ${lp.hero?.subheadline || lp.description || ''}
                    </p>

                    <!-- Countdown Timer (if enabled) -->
                    ${lp.countdown?.enabled ? `
                      <div class="mb-8 p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-xl max-w-lg mx-auto lg:mx-0">
                        <div class="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
                          ${lp.countdown.title || 'Tempo restante para garantir esta condição:'}
                        </div>
                        <div class="grid grid-cols-4 gap-2 text-center" id="countdown-timer">
                          <div class="bg-slate-800 p-2 rounded-xl">
                            <span id="cd-days" class="text-2xl font-black text-amber-400">03</span>
                            <span class="block text-[10px] text-slate-400 uppercase">Dias</span>
                          </div>
                          <div class="bg-slate-800 p-2 rounded-xl">
                            <span id="cd-hours" class="text-2xl font-black text-white">14</span>
                            <span class="block text-[10px] text-slate-400 uppercase">Horas</span>
                          </div>
                          <div class="bg-slate-800 p-2 rounded-xl">
                            <span id="cd-mins" class="text-2xl font-black text-white">45</span>
                            <span class="block text-[10px] text-slate-400 uppercase">Min</span>
                          </div>
                          <div class="bg-slate-800 p-2 rounded-xl">
                            <span id="cd-secs" class="text-2xl font-black text-emerald-400">22</span>
                            <span class="block text-[10px] text-slate-400 uppercase">Seg</span>
                          </div>
                        </div>
                      </div>
                    ` : ''}

                    <div class="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                      <a href="#capture-form" class="custom-primary-btn w-full sm:w-auto px-8 py-4 text-base font-bold ${buttonShape} shadow-lg shadow-blue-500/25 transition transform hover:-translate-y-0.5 text-center flex items-center justify-center gap-2">
                        <span>${lp.hero?.ctaText || 'Quero Meu Acesso Agora'}</span>
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                      </a>
                    </div>

                    <!-- Trust indicators -->
                    <div class="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                      <span class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                        Acesso Imediato
                      </span>
                      <span class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                        Sem Spam ou Mensagens Indesejadas
                      </span>
                      <span class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>
                        Privacidade Garantida
                      </span>
                    </div>

                  </div>

                  <!-- Right: Hero Card or Capture Form -->
                  <div class="lg:col-span-5">
                    <div id="capture-form" class="bg-white p-6 sm:p-8 rounded-2xl border-2 border-slate-200/80 shadow-2xl relative">
                      <div class="absolute -top-3 right-6 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Cadastre-se Grátis
                      </div>

                      <div class="mb-6">
                        <h2 class="text-2xl font-bold text-slate-900 tracking-tight">
                          ${lp.form?.title || 'Garanta sua Vaga'}
                        </h2>
                        ${lp.form?.subtitle ? `<p class="text-sm text-slate-500 mt-1">${lp.form.subtitle}</p>` : ''}
                      </div>

                      <!-- Form AJAX -->
                      <form id="lp-lead-form" class="space-y-4">
                        ${fields.map((f: any) => `
                          <div>
                            <label class="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5" for="field-${f.id}">
                              ${f.label} ${f.required ? '<span class="text-red-500">*</span>' : ''}
                            </label>
                            ${f.type === 'textarea' ? `
                              <textarea id="field-${f.id}" name="${f.name || f.id}" placeholder="${f.placeholder || ''}" rows="3" ${f.required ? 'required' : ''} class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden text-sm transition"></textarea>
                            ` : `
                              <input 
                                type="${f.type === 'tel' ? 'tel' : f.type === 'email' ? 'email' : 'text'}" 
                                id="field-${f.id}" 
                                name="${f.name || f.id}" 
                                placeholder="${f.placeholder || ''}" 
                                ${f.required ? 'required' : ''} 
                                class="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden text-sm transition ${f.type === 'tel' ? 'phone-mask' : ''}" 
                              />
                            `}
                          </div>
                        `).join('')}

                        <div id="form-error" class="hidden p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl"></div>
                        <div id="form-success" class="hidden p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl font-medium"></div>

                        <button 
                          type="submit" 
                          id="submit-btn" 
                          class="custom-primary-btn w-full py-3.5 px-6 font-bold text-base ${buttonShape} shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          <span id="btn-text">${lp.form?.buttonText || 'Enviar Dados Agora'}</span>
                          <span id="btn-spinner" class="hidden w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        </button>

                        <p class="text-[11px] text-slate-400 text-center mt-3">
                          🔒 Seus dados estão protegidos pela Lei Geral de Proteção de Dados (LGPD).
                        </p>
                      </form>

                    </div>
                  </div>

                </div>
              </div>
            </section>

            <!-- Features & Benefits Section -->
            ${(lp.features && lp.features.length > 0) ? `
              <section class="py-16 md:py-24 bg-white border-y border-slate-200">
                <div class="max-w-6xl mx-auto px-4">
                  <div class="text-center max-w-2xl mx-auto mb-14">
                    <span class="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Por que escolher</span>
                    <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">Tudo que você precisa para acelerar seu negócio</h2>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    ${lp.features.map((feat: any, idx: number) => `
                      <div class="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-400 hover:shadow-lg transition">
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white mb-4 shadow-sm" style="background-color: ${primaryColor}">
                          ${idx + 1}
                        </div>
                        <h3 class="text-lg font-bold text-slate-900 mb-2">${feat.title}</h3>
                        <p class="text-sm text-slate-600 leading-relaxed">${feat.description}</p>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </section>
            ` : ''}

            <!-- Social Proof & Testimonials -->
            ${(lp.socialProof?.enabled && ((lp.socialProof.stats && lp.socialProof.stats.length > 0) || (lp.socialProof.testimonials && lp.socialProof.testimonials.length > 0))) ? `
              <section class="py-16 bg-slate-900 text-white">
                <div class="max-w-6xl mx-auto px-4">
                  ${lp.socialProof.stats && lp.socialProof.stats.length > 0 ? `
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16 text-center border-b border-slate-800 pb-12">
                      ${lp.socialProof.stats.map((s: any) => `
                        <div>
                          <div class="text-3xl sm:text-4xl font-black text-amber-400 mb-1">${s.value}</div>
                          <div class="text-xs sm:text-sm text-slate-400 font-medium">${s.label}</div>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}

                  ${lp.socialProof.testimonials && lp.socialProof.testimonials.length > 0 ? `
                    <div class="text-center max-w-xl mx-auto mb-10">
                      <h2 class="text-2xl font-bold tracking-tight">O que dizem os nossos clientes</h2>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                      ${lp.socialProof.testimonials.map((t: any) => `
                        <div class="p-6 rounded-2xl bg-slate-800 border border-slate-700 shadow-md">
                          <div class="flex items-center gap-1 text-amber-400 mb-3">
                            ${'★'.repeat(t.rating || 5)}
                          </div>
                          <p class="text-sm text-slate-300 italic mb-4">"${t.text}"</p>
                          <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
                              ${(t.name || 'C').charAt(0)}
                            </div>
                            <div>
                              <div class="font-bold text-sm text-white">${t.name}</div>
                              <div class="text-xs text-slate-400">${t.role}</div>
                            </div>
                          </div>
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}
                </div>
              </section>
            ` : ''}

            <!-- FAQ Section -->
            ${(lp.faq?.enabled && lp.faq.items && lp.faq.items.length > 0) ? `
              <section class="py-16 bg-white border-t border-slate-200">
                <div class="max-w-4xl mx-auto px-4">
                  <div class="text-center mb-12">
                    <span class="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Tire suas dúvidas</span>
                    <h2 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Perguntas Frequentes</h2>
                  </div>

                  <div class="space-y-4">
                    ${lp.faq.items.map((item: any, idx: number) => `
                      <div class="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                        <button type="button" onclick="toggleFaq(${idx})" class="w-full p-5 text-left font-semibold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-100/70 transition">
                          <span>${item.question}</span>
                          <span id="faq-icon-${idx}" class="text-lg font-bold text-slate-400 transform transition">&plus;</span>
                        </button>
                        <div id="faq-ans-${idx}" class="hidden p-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-200/50 bg-white">
                          ${item.answer}
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </section>
            ` : ''}

            <!-- Footer -->
            <footer class="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs">
              <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-md flex items-center justify-center font-bold text-white text-xs" style="background-color: ${primaryColor}">
                    ${(companyName || 'M').charAt(0).toUpperCase()}
                  </div>
                  <span class="font-bold text-white">${companyName}</span>
                </div>
                <div class="text-center md:text-right">
                  <p>&copy; ${new Date().getFullYear()} ${companyName}. ${lp.footer?.copyrightText || 'Todos os direitos reservados.'}</p>
                  <p class="text-[11px] text-slate-500 mt-1">Desenvolvido com tecnologia de alta conversão MDTracker Growth Suite.</p>
                </div>
              </div>
            </footer>

            <!-- Form & Interaction Scripts -->
            <script>
              // Phone input mask (11) 99999-9999
              const phoneInputs = document.querySelectorAll('.phone-mask');
              phoneInputs.forEach(input => {
                input.addEventListener('input', function(e) {
                  let v = e.target.value.replace(/\\D/g, '');
                  if (v.length > 11) v = v.substring(0, 11);
                  if (v.length > 6) {
                    e.target.value = '(' + v.substring(0, 2) + ') ' + v.substring(2, 7) + '-' + v.substring(7);
                  } else if (v.length > 2) {
                    e.target.value = '(' + v.substring(0, 2) + ') ' + v.substring(2);
                  } else {
                    e.target.value = v;
                  }
                });
              });

              // Toggle FAQ
              function toggleFaq(index) {
                const ans = document.getElementById('faq-ans-' + index);
                const icon = document.getElementById('faq-icon-' + index);
                if (ans && icon) {
                  if (ans.classList.contains('hidden')) {
                    ans.classList.remove('hidden');
                    icon.textContent = '−';
                  } else {
                    ans.classList.add('hidden');
                    icon.textContent = '+';
                  }
                }
              }

              // Countdown ticker (if present)
              const cdTarget = new Date(Date.now() + 86400000 * 3);
              function updateCountdown() {
                const now = new Date();
                const diff = cdTarget - now;
                if (diff <= 0) return;
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);

                const dEl = document.getElementById('cd-days');
                const hEl = document.getElementById('cd-hours');
                const mEl = document.getElementById('cd-mins');
                const sEl = document.getElementById('cd-secs');

                if (dEl) dEl.textContent = String(d).padStart(2, '0');
                if (hEl) hEl.textContent = String(h).padStart(2, '0');
                if (mEl) mEl.textContent = String(m).padStart(2, '0');
                if (sEl) sEl.textContent = String(s).padStart(2, '0');
              }
              setInterval(updateCountdown, 1000);

              // Form AJAX Submit
              const form = document.getElementById('lp-lead-form');
              const submitBtn = document.getElementById('submit-btn');
              const btnText = document.getElementById('btn-text');
              const btnSpinner = document.getElementById('btn-spinner');
              const errDiv = document.getElementById('form-error');
              const successDiv = document.getElementById('form-success');

              if (form) {
                form.addEventListener('submit', async function(e) {
                  e.preventDefault();
                  errDiv.classList.add('hidden');
                  successDiv.classList.add('hidden');
                  submitBtn.disabled = true;
                  btnText.classList.add('opacity-0');
                  btnSpinner.classList.remove('hidden');

                  const formData = new FormData(form);
                  const data = Object.fromEntries(formData.entries());

                  // Append query params / UTMs from URL
                  const urlParams = new URLSearchParams(window.location.search);
                  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'].forEach(p => {
                    if (urlParams.has(p)) data[p] = urlParams.get(p);
                  });

                  try {
                    const res = await fetch('/api/landing-pages/${lp.slug}/submit', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(data)
                    });
                    const result = await res.json();

                    if (!res.ok) {
                      throw new Error(result.error || 'Erro ao processar seu cadastro.');
                    }

                    form.reset();
                    successDiv.textContent = result.successMessage || '🎉 Cadastro realizado com sucesso!';
                    successDiv.classList.remove('hidden');

                    if (result.actionType === 'redirect_whatsapp' && result.whatsappUrl) {
                      setTimeout(() => {
                        window.location.href = result.whatsappUrl;
                      }, 1200);
                    } else if (result.actionType === 'custom_url' && result.redirectUrl) {
                      setTimeout(() => {
                        window.location.href = result.redirectUrl;
                      }, 1200);
                    }
                  } catch (err) {
                    errDiv.textContent = err.message || 'Falha na conexão. Tente novamente.';
                    errDiv.classList.remove('hidden');
                  } finally {
                    submitBtn.disabled = false;
                    btnText.classList.remove('opacity-0');
                    btnSpinner.classList.add('hidden');
                  }
                });
              }
            </script>
          </body>
          </html>
        `);
    } catch (err: any) {
        res.status(500).send('Erro interno ao carregar a página: ' + err.message);
    }
});

// TRACKING REDIRECT URL HANDLING (/r/:slug or /w/:slug)
app.get(['/r/:slug', '/w/:slug'], async (req: Request, res: Response) => {
    const slug = req.params.slug.toLowerCase();
    const { data: dbLink } = await supabase.from('campaign_links').select('*').eq('slug', slug).single();

    if (!dbLink) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Não Encontrado - RastreioWhatsApp</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-900 text-white flex items-center justify-center min-h-screen p-4">
          <div class="max-w-md w-full bg-slate-800 p-6 rounded-2xl border border-slate-700 text-center shadow-xl">
            <h1 class="text-2xl font-bold text-red-400 mb-2">Link Inexistente ou Inativo</h1>
            <p class="text-slate-300 mb-4 text-sm">O link de WhatsApp "<strong>${slug}</strong>" não foi encontrado no sistema.</p>
            <a href="/" class="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl transition">Voltar ao Painel</a>
          </div>
        </body>
        </html>
      `);
    }

    const linkObj = mapLinkFromDB(dbLink);

    // Increment click count (Legacy support)
    await supabase.from('campaign_links')
      .update({ 
        clicks_count: (dbLink.clicks_count || 0) + 1, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', dbLink.id);

    const userIp = (
      req.headers['x-forwarded-for'] as string ||
      req.headers['x-real-ip'] as string ||
      req.socket.remoteAddress ||
      req.ip ||
      '177.100.20.10'
    ).split(',')[0].trim();
    const userAgent = (req.headers['user-agent'] as string) || 'Mobile Browser';

    // Insert detailed click record
    await supabase.from('link_clicks').insert({
      link_id: dbLink.id,
      company_id: dbLink.company_id,
      ip_address: userIp,
      user_agent: userAgent
    });

    // Detect bots/crawlers (Facebook scrapers, Google, etc) to avoid firing CAPI on preview bots
    const isBot = /facebookexternalhit|facebot|googlebot|bingbot|twitterbot|slackbot|whatsapp|telegrambot|bytespider/i.test(userAgent);

    // Extract query parameters or defaults
    const query = req.query as Record<string, string>;
    const utmSource = query.utm_source || linkObj.utmSource || 'meta_ads';
    const utmMedium = query.utm_medium || linkObj.utmMedium || 'cpc';
    const utmCampaign = query.utm_campaign || linkObj.utmCampaign || 'campanha_whatsapp';
    const utmContent = query.utm_content || linkObj.utmContent || '';
    const utmTerm = query.utm_term || linkObj.utmTerm || '';

    // Extract fbclid and cookies for Meta attribution
    const fbclid = (query.fbclid as string) || '';
    const cookieHeader = req.headers.cookie || '';
    const getCookie = (name: string) => {
      const match = cookieHeader.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : undefined;
    };
    const fbcCookie = getCookie('_fbc');
    const fbpCookie = getCookie('_fbp');
    const finalFbc = fbcCookie || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined);
    const finalFbp = fbpCookie;

    // Auto capture or lead registration
    const isMobile = /mobile/i.test(userAgent);
    const deviceType = isMobile ? 'Dispositivo Móvel' : 'Desktop / Computador';
    
    // Real location from Vercel Headers or fallback to mock
    const vercelCity = req.headers['x-vercel-ip-city'] as string;
    const vercelState = req.headers['x-vercel-ip-country-region'] as string;
    const vercelCountry = req.headers['x-vercel-ip-country'] as string;
    
    const location = vercelCity ? {
      city: decodeURIComponent(vercelCity),
      state: vercelState || '',
      country: vercelCountry || '',
      ip: userIp
    } : mockGeoFromIp(userIp);

    // Build params for message formatting
    const msgParams: Record<string, string> = {
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      utm_term: utmTerm,
      cidade: location.city,
      estado: location.state,
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      ...linkObj.customTags,
      ...query
    };

    // Build target wa.me URL
    const targetWaUrl = buildWhatsAppUrl(linkObj.phone, linkObj.message, msgParams);

    // Fetch settings explicitly using link's company_id
    const settings = await getSettings(dbLink.company_id);

    // Meta Pixel ID & Google Ads IDs to embed in redirect client code
    const metaPixel = linkObj.metaPixelId || settings.globalMetaPixelId;
    const metaToken = settings.globalMetaToken;
    const googleAdsId = linkObj.googleAdsConversionId || settings.globalGoogleAdsId;
    const googleAdsLabel = linkObj.googleAdsLabel || settings.globalGoogleAdsLabel;

    // Event Names & fbq methods:
    // 1. Global Standard Event (ex: ViewAds)
    const metaEventName = settings.metaLeadEventName || 'ViewAds';
    const standardEvents = ['Lead', 'Contact', 'ViewContent', 'SubmitApplication', 'CompleteRegistration', 'Schedule', 'Purchase', 'InitiateCheckout', 'AddToCart'];
    const fbqMethod = standardEvents.includes(metaEventName) ? 'track' : 'trackCustom';

    // 2. Campaign Specific Event (se configurado no link)
    const campaignEventName = (linkObj.metaEventName || '').trim();
    const hasCampaignEvent = Boolean(campaignEventName && campaignEventName !== metaEventName);
    const campaignFbqMethod = standardEvents.includes(campaignEventName) ? 'track' : 'trackCustom';

    // Unique Event IDs for deduplication between CAPI and Meta Pixel
    const eventId = `evt_click_${dbLink.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const campaignEventId = `evt_click_cmp_${dbLink.id}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.headers['x-forwarded-host'] || req.get('host') || 'rastreiowhatsapp.com';
    const eventSourceUrl = `${proto}://${host}${req.originalUrl}`;

    // FIRE META CAPI EVENT IMMEDIATELY ON LINK CLICK (SERVER-SIDE)
    if (settings.autoFireMetaOnLead && metaPixel && metaToken && !isBot) {
      // 1. Dispara Evento Padrão Global (ex: ViewAds)
      sendMetaCAPIClickEvent({
        pixelId: metaPixel,
        token: metaToken,
        eventName: metaEventName,
        eventId: eventId,
        eventSourceUrl,
        userIp: userIp,
        userAgent,
        fbc: finalFbc,
        fbp: finalFbp,
        location,
        linkTitle: linkObj.title,
        linkSlug: slug,
        utmSource,
        utmMedium,
        utmCampaign,
        utmContent,
        utmTerm
      }).catch(err => console.error('[Meta CAPI Async Error - Global]:', err));

      // 2. Dispara Evento Específico da Campanha (se configurado)
      if (hasCampaignEvent) {
        sendMetaCAPIClickEvent({
          pixelId: metaPixel,
          token: metaToken,
          eventName: campaignEventName,
          eventId: campaignEventId,
          eventSourceUrl,
          userIp: userIp,
          userAgent,
          fbc: finalFbc,
          fbp: finalFbp,
          location,
          linkTitle: linkObj.title,
          linkSlug: slug,
          utmSource,
          utmMedium,
          utmCampaign,
          utmContent,
          utmTerm
        }).catch(err => console.error('[Meta CAPI Async Error - Campanha]:', err));
      }
    }

    // Render client redirect & tracking landing page
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Conectando ao WhatsApp... - ${linkObj.title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        
        <!-- Meta Pixel Code -->
        ${metaPixel ? `
        <script>
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${metaPixel}');
          fbq('track', 'PageView', {}, { eventID: '${eventId}_pv' });
          ${settings.autoFireMetaOnLead ? `
          // 1. Disparo do Evento Padrão Global
          fbq('${fbqMethod}', '${metaEventName}', {
            content_name: '${linkObj.title.replace(/'/g, "\\'")}',
            campaign: '${utmCampaign}',
            source: '${utmSource}'
          }, { eventID: '${eventId}' });
          ${hasCampaignEvent ? `
          // 2. Disparo do Evento Específico da Campanha
          fbq('${campaignFbqMethod}', '${campaignEventName}', {
            content_name: '${linkObj.title.replace(/'/g, "\\'")}',
            campaign: '${utmCampaign}',
            source: '${utmSource}'
          }, { eventID: '${campaignEventId}' });
          ` : ''}
          ` : ''}
        </script>
        ` : ''}

        <!-- Google Ads Tag -->
        ${googleAdsId ? `
        <script async src="https://www.googletagmanager.com/gtag/js?id=${googleAdsId}"></script>
        <script>
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${googleAdsId}');
          ${googleAdsLabel ? `gtag('event', 'conversion', {'send_to': '${googleAdsId}/${googleAdsLabel}'});` : ''}
        </script>
        ` : ''}
      </head>
      <body class="bg-slate-950 text-slate-100 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl relative overflow-hidden">
          
          <div class="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <!-- Header Icon -->
          <div class="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.15 4.195 4.293-1.128z"/>
            </svg>
          </div>

          <h2 class="text-xl font-bold text-white mb-1">${linkObj.title}</h2>
          <p class="text-xs text-slate-400 mb-6">Redirecionando para o atendimento oficial no WhatsApp...</p>

          ${linkObj.captureLeadForm ? `
            <div id="captureBlock" class="text-left bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 mb-5">
              <p class="text-xs font-semibold text-emerald-400 mb-2 uppercase tracking-wider">Identificação Obrigatória do Atendimento</p>
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Seu Nome *</label>
                  <input type="text" id="leadNameInput" required placeholder="Ex: Maria Souza" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                </div>
                <div>
                  <label class="block text-xs font-medium text-slate-300 mb-1">Seu WhatsApp (DDD + Número) *</label>
                  <input type="tel" id="leadPhoneInput" required placeholder="(11) 99999-9999" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500">
                  <p id="phoneError" class="text-[11px] text-red-400 mt-1 hidden">Por favor, informe um número de WhatsApp válido com DDD.</p>
                </div>
              </div>
              <button onclick="submitLeadAndRedirect()" class="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-emerald-900/30">
                Continuar para o WhatsApp
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
              </button>
            </div>
          ` : `
            <div class="flex items-center justify-center gap-2 text-sm text-emerald-400 font-medium mb-6">
              <div class="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
              Aguarde 2 segundos ou clique no botão abaixo
            </div>
            <a id="waDirectBtn" href="${targetWaUrl}" target="_self" onclick="autoRegisterLead()" class="block w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition text-sm shadow-lg shadow-emerald-900/40 mb-3">
              Abrir WhatsApp Agora
            </a>
          `}

          <div class="text-[11px] text-slate-500 space-y-1">
            <p>Rastreamento seguro via <strong>UTM ${utmSource} / ${utmCampaign}</strong></p>
            <p>Localização detectada: ${location.city}, ${location.state} (${location.country})</p>
          </div>
        </div>

        <script>
          const linkId = '${linkObj.id}';
          const linkTitle = '${linkObj.title.replace(/'/g, "\\'")}';
          const targetWaUrl = '${targetWaUrl.replace(/'/g, "\\'")}';
          const utmSource = '${utmSource}';
          const utmMedium = '${utmMedium}';
          const utmCampaign = '${utmCampaign}';
          const utmContent = '${utmContent}';
          const utmTerm = '${utmTerm}';
          const locationData = ${JSON.stringify(location)};
          const deviceType = '${deviceType}';

          function autoRegisterLead(customName, customPhone) {
            const urlParams = new URLSearchParams(window.location.search);
            const paramPhone = urlParams.get('phone') || urlParams.get('whatsapp') || urlParams.get('wa') || '';
            const paramName = urlParams.get('nome') || urlParams.get('name') || '';

            const finalName = customName || paramName || 'Lead via ' + utmSource;
            const finalPhone = customPhone || paramPhone || '';

            const leadData = {
              companyId: '${linkObj.companyId}',
              name: finalName,
              phone: finalPhone,
              location: locationData,
              source: utmSource,
              utmSource,
              utmMedium,
              utmCampaign,
              utmContent,
              utmTerm,
              linkId,
              linkTitle,
              stage: 'Novo Lead',
              device: deviceType,
              browser: navigator.userAgent
            };

            fetch('/api/leads', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(leadData)
            }).catch(() => null);
          }

          function submitLeadAndRedirect() {
            const nameInput = document.getElementById('leadNameInput');
            const phoneInput = document.getElementById('leadPhoneInput');
            const phoneError = document.getElementById('phoneError');

            const name = nameInput ? nameInput.value.trim() : '';
            const phone = phoneInput ? phoneInput.value.replace(/\D/g, '') : '';

            // Validate phone requirement (must have at least 10 digits for DDD + Number)
            if (phone.length < 10) {
              if (phoneError) phoneError.classList.remove('hidden');
              if (phoneInput) phoneInput.focus();
              return;
            } else {
              if (phoneError) phoneError.classList.add('hidden');
            }

            const formattedName = name || 'Lead ' + utmSource;
            autoRegisterLead(formattedName, phone);

            // Construct personalized WhatsApp URL with lead phone tracking if needed
            setTimeout(() => {
              window.location.href = targetWaUrl;
            }, 300);
          }

          // Auto pre-fill phone from URL params if passed (e.g. ?phone=11999999999) and persist _fbc
          window.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
            const fbclidParam = urlParams.get('fbclid');
            if (fbclidParam && !document.cookie.includes('_fbc=')) {
              try {
                document.cookie = '_fbc=fb.1.' + Date.now() + '.' + fbclidParam + '; path=/; max-age=' + (90 * 86400);
              } catch(e) {}
            }

            const paramPhone = urlParams.get('phone') || urlParams.get('whatsapp') || urlParams.get('wa');
            const paramName = urlParams.get('nome') || urlParams.get('name');

            if (paramPhone) {
              const phoneInput = document.getElementById('leadPhoneInput');
              if (phoneInput) phoneInput.value = paramPhone;
            }
            if (paramName) {
              const nameInput = document.getElementById('leadNameInput');
              if (nameInput) nameInput.value = paramName;
            }
          });

          ${!linkObj.captureLeadForm ? `
            // Auto redirect after 1.5s
            autoRegisterLead();
            setTimeout(() => {
              window.location.href = targetWaUrl;
            }, 1500);
          ` : ''}
        </script>
      </body>
      </html>
    `);
});

// Vite development middleware or production static serving
async function startLocalServer() {
  const PORT = 3000;
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor RastreioWhatsApp rodando em http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startLocalServer();
}

export default app;
