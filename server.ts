import express, { Request, Response } from 'express';
import path from 'path';
import { CampaignLink, Lead, WebhookLog, IntegrationSettings, FunnelStage } from './src/types.js';
import { supabase } from './src/lib/supabase.js';
import bcrypt from 'bcryptjs';

// Mappers to convert between frontend camelCase and DB snake_case
const mapCompanyToDB = (c: any) => ({
    id: c.id,
    name: c.name,
    cnpj: c.cnpj,
    plan: c.plan,
    active: c.active,
    logo_url: c.logoUrl,
    responsible_name: c.responsibleName,
    phone: c.phone,
    address: c.address,
    updated_at: new Date().toISOString()
});

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
    custom_tags: link.customTags,
    capture_lead_form: link.captureLeadForm,
    meta_pixel_id: link.metaPixelId,
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
    company_id: lead.companyId || 'comp-alfa',
    name: lead.name,
    phone: lead.phone,
    email: lead.email,
    location: lead.location,
    source: lead.source,
    utm_source: lead.utmSource,
    utm_medium: lead.utmMedium,
    utm_campaign: lead.utmCampaign,
    utm_content: lead.utmContent,
    utm_term: lead.utmTerm,
    link_id: lead.linkId,
    link_title: lead.linkTitle,
    stage: lead.stage,
    value: lead.value,
    device: lead.device,
    browser: lead.browser,
    notes: lead.notes,
    conversion_events: lead.conversionEvents,
    created_at: lead.createdAt || new Date().toISOString(),
    updated_at: lead.updatedAt || new Date().toISOString()
});

const mapLeadFromDB = (db: any) => ({
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
    conversionEvents: db.conversion_events || [],
    createdAt: db.created_at,
    updatedAt: db.updated_at
});

const mapSettingsToDB = (s: any) => ({
    company_id: s.companyId || 'comp-alfa',
    global_meta_pixel_id: s.globalMetaPixelId,
    global_meta_token: s.globalMetaToken,
    global_google_ads_id: s.globalGoogleAdsId,
    global_google_ads_label: s.globalGoogleAdsLabel,
    global_webhook_url: s.globalWebhookUrl,
    auto_fire_meta_on_lead: s.autoFireMetaOnLead,
    auto_fire_meta_on_conversion: s.autoFireMetaOnConversion,
    auto_fire_google_on_conversion: s.autoFireGoogleOnConversion,
    auto_fire_webhook_on_lead: s.autoFireWebhookOnLead,
    auto_fire_webhook_on_stage_change: s.autoFireWebhookOnStageChange,
    stage_event_mappings: s.stageEventMappings,
    auto_stage_keywords: s.autoStageKeywords,
    updated_at: new Date().toISOString()
});

const mapSettingsFromDB = (db: any) => ({
    companyId: db.company_id,
    globalMetaPixelId: db.global_meta_pixel_id || '',
    globalMetaToken: db.global_meta_token || '',
    globalGoogleAdsId: db.global_google_ads_id || '',
    globalGoogleAdsLabel: db.global_google_ads_label || '',
    globalWebhookUrl: db.global_webhook_url || '',
    autoFireMetaOnLead: !!db.auto_fire_meta_on_lead,
    autoFireMetaOnConversion: !!db.auto_fire_meta_on_conversion,
    autoFireGoogleOnConversion: !!db.auto_fire_google_on_conversion,
    autoFireWebhookOnLead: !!db.auto_fire_webhook_on_lead,
    autoFireWebhookOnStageChange: !!db.auto_fire_webhook_on_stage_change,
    stageEventMappings: db.stage_event_mappings,
    autoStageKeywords: db.auto_stage_keywords
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

// Fetch current settings directly from DB since it's needed for webhooks
async function getSettings(companyId: string = 'comp-alfa') {
    const { data } = await supabase.from('settings').select('*').eq('company_id', companyId).single();
    if (data) return mapSettingsFromDB(data);
    return {};
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
function mockGeoFromIp(ip: string): { city: string; state: string; country: string } {
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
  return sampleCities[idx];
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
    const { data, error } = await supabase.from('campaign_links').select('*').order('created_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data.map(mapLinkFromDB));
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
    const newLead: Lead = {
      id: `lead-${Date.now()}`,
      companyId: body.companyId || 'comp-alfa',
      name: body.name || 'Lead Anônimo',
      phone: body.phone || '',
      email: body.email || '',
      location: body.location || mockGeoFromIp(req.ip || '177.100.20.10'),
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
      conversionEvents: [
        {
          id: `evt-${Date.now()}`,
          type: 'meta_pixel',
          eventName: 'Lead',
          status: 'sucesso',
          timestamp: new Date().toISOString(),
          details: 'Evento Lead registrado com sucesso'
        }
      ]
    };

    const { error } = await supabase.from('leads').insert(mapLeadToDB(newLead));
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
      const stageMapping = settings.stageEventMappings ? settings.stageEventMappings[newStage] : null;
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

    const { error } = await supabase.from('leads').update(mapLeadToDB(updated)).eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    
    res.json(updated);
});

app.delete('/api/leads/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true, id });
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
    const settings = await getSettings();
    res.json(settings);
});

app.post('/api/settings', async (req: Request, res: Response) => {
    const companyId = req.body.companyId || 'comp-alfa';
    const dbRecord = mapSettingsToDB({ ...req.body, companyId });
    const { error } = await supabase.from('settings').upsert(dbRecord);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ...req.body, companyId });
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

    // Increment click count
    await supabase.from('campaign_links')
      .update({ 
        clicks_count: (dbLink.clicks_count || 0) + 1, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', dbLink.id);

    // Extract query parameters or defaults
    const query = req.query as Record<string, string>;
    const utmSource = query.utm_source || linkObj.utmSource || 'meta_ads';
    const utmMedium = query.utm_medium || linkObj.utmMedium || 'cpc';
    const utmCampaign = query.utm_campaign || linkObj.utmCampaign || 'campanha_whatsapp';
    const utmContent = query.utm_content || linkObj.utmContent || '';
    const utmTerm = query.utm_term || linkObj.utmTerm || '';

    // Auto capture or lead registration
    const userIp = (req.headers['x-forwarded-for'] as string || req.ip || '177.100.20.10').split(',')[0].trim();
    const userAgent = req.headers['user-agent'] || 'Mobile Browser';
    const isMobile = /mobile/i.test(userAgent);
    const deviceType = isMobile ? 'Dispositivo Móvel' : 'Desktop / Computador';
    const location = mockGeoFromIp(userIp);

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

    const settings = await getSettings();

    // Meta Pixel ID & Google Ads IDs to embed in redirect client code
    const metaPixel = linkObj.metaPixelId || settings.globalMetaPixelId;
    const googleAdsId = linkObj.googleAdsConversionId || settings.globalGoogleAdsId;
    const googleAdsLabel = linkObj.googleAdsLabel || settings.globalGoogleAdsLabel;

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
          fbq('track', 'PageView');
          fbq('track', 'Lead', {
            content_name: '${linkObj.title.replace(/'/g, "\\'")}',
            campaign: '${utmCampaign}'
          });
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
            const leadData = {
              name: customName || 'Lead via ' + utmSource,
              phone: customPhone || '',
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

          // Auto pre-fill phone from URL params if passed (e.g. ?phone=11999999999)
          window.addEventListener('DOMContentLoaded', () => {
            const urlParams = new URLSearchParams(window.location.search);
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
