import { CampaignLink, Lead, WebhookLog, IntegrationSettings, StatsSummary, FunnelStage, Company, User, SmartPopup, AIGenerateRequest, AIGeneratedContent, MarketingWorkflow, WorkflowExecutionLog, LandingPage, BroadcastCampaign, BroadcastChannel, BroadcastRecipient, LeadCall, VirtualPhoneSettings, SmartList, LeadScoringConfig, InstagramCommentAutomation, InstagramCommentLog, InstagramSimulateResult, Team, TeamMember, SupervisorMonitorStats, Survey, SurveyResponse, CustomDomain, GamificationEvent, GamificationActivity, GamificationParticipant, GamificationResponse, AIAgent, AIAgentExecutionLog } from '../types';

export async function fetchCompanies(): Promise<Company[]> {
  const res = await fetch('/api/companies');
  if (!res.ok) return [];
  return res.json();
}

export async function createCompany(data: Partial<Company>): Promise<Company> {
  const res = await fetch('/api/companies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro desconhecido');
  }
  return res.json();
}

export async function updateCompany(id: string, data: Partial<Company>): Promise<Company> {
  const res = await fetch(`/api/companies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro desconhecido');
  }
  return res.json();
}

export async function fetchUsers(companyId?: string): Promise<User[]> {
  const url = companyId ? `/api/users?companyId=${encodeURIComponent(companyId)}` : '/api/users';
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export async function createUser(data: Partial<User>): Promise<User> {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro desconhecido');
  }
  return res.json();
}

export async function loginUser(email: string, password: string): Promise<{ user: User, company: Company }> {
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao realizar login');
  }
  return res.json();
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro desconhecido');
  }
  return res.json();
}

export async function deleteUser(id: string): Promise<void> {
  await fetch(`/api/users/${id}`, { method: 'DELETE' });
}



export async function fetchStats(): Promise<StatsSummary> {
  const res = await fetch('/api/stats');
  return res.json();
}

export async function fetchLinks(startDate?: string, endDate?: string, companyId?: string): Promise<CampaignLink[]> {
  const queryParams = new URLSearchParams();
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (companyId) queryParams.append('companyId', companyId);

  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  const res = await fetch(`/api/links${queryString}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createLink(data: Partial<CampaignLink>): Promise<CampaignLink> {
  const res = await fetch('/api/links', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateLink(id: string, data: Partial<CampaignLink>): Promise<CampaignLink> {
  const res = await fetch(`/api/links/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteLink(id: string): Promise<void> {
  await fetch(`/api/links/${id}`, { method: 'DELETE' });
}

export async function fetchLeads(companyId?: string): Promise<Lead[]> {
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/leads${query}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createLead(data: Partial<Lead>): Promise<Lead> {
  const res = await fetch('/api/leads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
  const res = await fetch(`/api/leads/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteLead(id: string): Promise<void> {
  await fetch(`/api/leads/${id}`, { method: 'DELETE' });
}

export async function deleteLeadsBatch(ids: string[]): Promise<void> {
  await fetch('/api/leads/batch-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });
}

export async function fetchProducts(companyId?: string): Promise<any[]> {
  const query = companyId ? `?companyId=${companyId}` : '';
  const res = await fetch(`/api/products${query}`);
  if (!res.ok) {
    console.error('Failed to fetch products', await res.text());
    return [];
  }
  return res.json();
}

export async function createProduct(data: any): Promise<any> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro desconhecido');
  }
  return res.json();
}

export async function updateProduct(id: string, data: any): Promise<any> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro desconhecido');
  }
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  await fetch(`/api/products/${id}`, { method: 'DELETE' });
}

export async function fetchLeadPurchases(companyId?: string): Promise<any[]> {
  const query = companyId ? `?companyId=${companyId}` : '';
  const res = await fetch(`/api/lead-purchases${query}`);
  if (!res.ok) {
    console.error('Failed to fetch lead purchases', await res.text());
    return [];
  }
  return res.json();
}

export async function createLeadPurchase(data: any): Promise<any> {
  const res = await fetch('/api/lead-purchases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteLeadPurchase(id: string): Promise<void> {
  await fetch(`/api/lead-purchases/${id}`, { method: 'DELETE' });
}

export async function fetchSettings(companyId?: string): Promise<IntegrationSettings> {
  const query = companyId ? `?companyId=${companyId}` : '';
  const res = await fetch(`/api/settings${query}`);
  return res.json();
}

export async function updateSettings(data: Partial<IntegrationSettings>): Promise<IntegrationSettings> {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchWebhookLogs(companyId?: string): Promise<WebhookLog[]> {
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/webhooks/logs${query}`);
  if (!res.ok) return [];
  return res.json();
}

export async function testWebhook(url: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch('/api/webhooks/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  return res.json();
}

// Smart Popups & Capture Forms API
export async function fetchPopups(companyId?: string): Promise<SmartPopup[]> {
  const query = companyId ? `?companyId=${companyId}` : '';
  const res = await fetch(`/api/popups${query}`);
  if (!res.ok) {
    console.error('Failed to fetch popups', await res.text());
    return [];
  }
  return res.json();
}

export async function createPopup(data: Partial<SmartPopup>): Promise<SmartPopup> {
  const res = await fetch('/api/popups', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao criar pop-up');
  }
  return res.json();
}

export async function updatePopup(id: string, data: Partial<SmartPopup>): Promise<SmartPopup> {
  const res = await fetch(`/api/popups/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao atualizar pop-up');
  }
  return res.json();
}

export async function deletePopup(id: string): Promise<void> {
  const res = await fetch(`/api/popups/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    throw new Error('Erro ao excluir pop-up');
  }
}

export async function submitPopupLead(id: string, payload: any): Promise<any> {
  const res = await fetch(`/api/popups/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

// AI Copywriter & Marketing Assistant API
export async function generateAICopy(req: AIGenerateRequest): Promise<AIGeneratedContent> {
  const res = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro na geração de copy com IA');
  }
  return res.json();
}

// Chatbot com IA API (WhatsApp & Direct)
export async function toggleLeadBotStatus(leadId: string, botActive: boolean): Promise<{ success: boolean; leadId: string; botActive: boolean }> {
  const res = await fetch(`/api/leads/${leadId}/bot-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ botActive })
  });
  if (!res.ok) throw new Error('Erro ao alterar status do bot para o lead');
  return res.json();
}

export async function simulateChatbot(payload: { companyId?: string; message: string; configOverride?: any; lead?: any }): Promise<{ reply: string; isHandover: boolean; botName: string; timestamp: string }> {
  const res = await fetch('/api/chatbot/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro na simulação do chatbot');
  }
  return res.json();
}

export async function suggestReplyWithAI(payload: { companyId?: string; phone?: string; leadId?: string }): Promise<{ suggestion: string }> {
  const res = await fetch('/api/chatbot/suggest-reply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao gerar sugestão de resposta');
  }
  return res.json();
}

export async function sendDirectMessage(payload: { companyId?: string; leadName?: string; message: string; directChannel?: string }): Promise<{ reply: string; botName: string; isHandover: boolean; channel: string; timestamp: string }> {
  const res = await fetch('/api/direct/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao processar mensagem Direct');
  }
  return res.json();
}

// Marketing Automation & Workflows API (RD Station style)
export async function fetchWorkflows(companyId?: string): Promise<MarketingWorkflow[]> {
  const url = companyId ? `/api/workflows?companyId=${encodeURIComponent(companyId)}` : '/api/workflows';
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export async function createWorkflow(workflow: Partial<MarketingWorkflow>): Promise<MarketingWorkflow> {
  const res = await fetch('/api/workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao criar fluxo de automação');
  }
  return res.json();
}

export async function updateWorkflow(id: string, workflow: Partial<MarketingWorkflow>): Promise<MarketingWorkflow> {
  const res = await fetch(`/api/workflows/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao atualizar fluxo de automação');
  }
  return res.json();
}

export async function deleteWorkflow(id: string): Promise<void> {
  const res = await fetch(`/api/workflows/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir fluxo');
}

export async function toggleWorkflow(id: string, active: boolean): Promise<MarketingWorkflow> {
  const res = await fetch(`/api/workflows/${id}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ active })
  });
  if (!res.ok) throw new Error('Erro ao alterar status do fluxo');
  return res.json();
}

export async function testRunWorkflow(id: string, payload?: { leadId?: string; companyId?: string }): Promise<any> {
  const res = await fetch(`/api/workflows/${id}/test-run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao testar fluxo');
  }
  return res.json();
}

export async function fetchWorkflowLogs(companyId?: string): Promise<WorkflowExecutionLog[]> {
  const url = companyId ? `/api/workflows/logs?companyId=${encodeURIComponent(companyId)}` : '/api/workflows/logs';
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

// ==========================================
// Landing Pages API (RD Station Style)
// ==========================================

export async function fetchLandingPages(companyId?: string): Promise<LandingPage[]> {
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/landing-pages${query}`);
  if (!res.ok) {
    console.error('Falha ao buscar landing pages', await res.text());
    return [];
  }
  return res.json();
}

export async function fetchLandingPageById(id: string): Promise<LandingPage> {
  const res = await fetch(`/api/landing-pages/${id}`);
  if (!res.ok) throw new Error('Landing page não encontrada');
  return res.json();
}

export async function createLandingPage(page: Partial<LandingPage>): Promise<LandingPage> {
  const res = await fetch('/api/landing-pages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao criar Landing Page');
  }
  return res.json();
}

export async function updateLandingPage(id: string, page: Partial<LandingPage>): Promise<LandingPage> {
  const res = await fetch(`/api/landing-pages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(page)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao atualizar Landing Page');
  }
  return res.json();
}

export async function deleteLandingPage(id: string): Promise<void> {
  const res = await fetch(`/api/landing-pages/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir Landing Page');
}

export async function toggleLandingPage(id: string, status: 'published' | 'draft'): Promise<LandingPage> {
  const res = await fetch(`/api/landing-pages/${id}/toggle`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Erro ao alterar status da Landing Page');
  return res.json();
}

export async function generateLandingPageAI(payload: {
  prompt?: string;
  niche?: string;
  productName?: string;
  targetAudience?: string;
  tone?: string;
  companyId?: string;
}): Promise<any> {
  const res = await fetch('/api/landing-pages/generate-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao gerar conteúdo com IA');
  }
  return res.json();
}

export async function submitLandingPageLead(slug: string, payload: any): Promise<any> {
  const res = await fetch(`/api/landing-pages/${slug}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao submeter formulário');
  }
  return res.json();
}

// ==========================================
// Multi-Channel Broadcast API (Email, SMS & WhatsApp)
// ==========================================

export async function fetchBroadcastCampaigns(companyId?: string, channel?: string): Promise<BroadcastCampaign[]> {
  const params = new URLSearchParams();
  if (companyId) params.append('companyId', companyId);
  if (channel && channel !== 'all') params.append('channel', channel);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`/api/broadcast-campaigns${query}`);
  if (!res.ok) {
    console.error('Falha ao buscar campanhas de broadcast', await res.text());
    return [];
  }
  return res.json();
}

export async function createBroadcastCampaign(data: Partial<BroadcastCampaign>): Promise<BroadcastCampaign> {
  const res = await fetch('/api/broadcast-campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao criar campanha');
  }
  return res.json();
}

export async function updateBroadcastCampaign(id: string, data: Partial<BroadcastCampaign>): Promise<BroadcastCampaign> {
  const res = await fetch(`/api/broadcast-campaigns/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao atualizar campanha');
  }
  return res.json();
}

export async function deleteBroadcastCampaign(id: string): Promise<void> {
  const res = await fetch(`/api/broadcast-campaigns/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir campanha');
}

export async function sendTestBroadcast(id: string, payload: { targetEmail?: string; targetPhone?: string; channel: string }): Promise<any> {
  const res = await fetch(`/api/broadcast-campaigns/${id}/send-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao enviar teste');
  }
  return res.json();
}

export async function launchBroadcastCampaign(id: string): Promise<any> {
  const res = await fetch(`/api/broadcast-campaigns/${id}/launch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao disparar campanha');
  }
  return res.json();
}

export async function generateBroadcastAI(payload: {
  channel: 'email' | 'sms' | 'whatsapp' | 'multichannel';
  goal?: string;
  productName?: string;
  tone?: string;
  companyId?: string;
}): Promise<any> {
  const res = await fetch('/api/broadcast-campaigns/generate-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao gerar copy com IA');
  }
  return res.json();
}

export async function fetchBroadcastRecipients(campaignId: string): Promise<{ recipients: BroadcastRecipient[]; stats: any }> {
  const res = await fetch(`/api/broadcast-campaigns/${campaignId}/recipients`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao buscar destinatários');
  }
  return res.json();
}

export async function simulateRecipientActivity(campaignId: string, payload: { leadId: string; action: 'open' | 'click' }): Promise<any> {
  const res = await fetch(`/api/broadcast-campaigns/${campaignId}/simulate-activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao simular atividade');
  }
  return res.json();
}

// ==============================================================================
// PASSO 4: API METHODS - TELEFONIA VIRTUAL & DISCADOR WEBRTC
// ==============================================================================

export async function fetchLeadCalls(companyId?: string, leadId?: string): Promise<LeadCall[]> {
  const params = new URLSearchParams();
  if (companyId) params.append('companyId', companyId);
  if (leadId) params.append('leadId', leadId);
  const res = await fetch(`/api/lead-calls?${params.toString()}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createLeadCall(callData: Partial<LeadCall> & { updateLeadStage?: FunnelStage }): Promise<LeadCall> {
  const res = await fetch('/api/lead-calls', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(callData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao registrar chamada');
  }
  return res.json();
}

export async function deleteLeadCall(id: string): Promise<void> {
  const res = await fetch(`/api/lead-calls/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir histórico de chamada');
}

export async function transcribeLeadCallAI(callId: string, payload?: { notes?: string; duration?: number; leadName?: string }): Promise<{
  summary: string;
  sentiment: 'positivo' | 'neutro' | 'negativo';
  detectedObjections: string[];
  nextSteps: string;
}> {
  const res = await fetch(`/api/lead-calls/${callId}/transcribe-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {})
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao transcrever chamada com IA');
  }
  return res.json();
}

export async function fetchVirtualPhoneSettings(companyId?: string): Promise<VirtualPhoneSettings> {
  const params = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/virtual-phone/settings${params}`);
  if (!res.ok) {
    return {
      provider: 'webrtc_native',
      callerIdNumber: '(11) 4003-8920',
      callerIdName: 'Atendimento Comercial VIP',
      recordCalls: true,
      autoTranscribeAI: true,
      agentExtension: '104'
    };
  }
  return res.json();
}

export async function updateVirtualPhoneSettings(companyId: string, settings: Partial<VirtualPhoneSettings>): Promise<VirtualPhoneSettings> {
  const res = await fetch('/api/virtual-phone/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyId, settings })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao salvar configurações do telefone virtual');
  }
  return res.json();
}

// ==============================================================================
// PASSO 5: API METHODS - LISTAS INTELIGENTES & LEAD SCORING COM IA
// ==============================================================================

export async function fetchSmartLists(companyId?: string): Promise<SmartList[]> {
  const params = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/smart-lists${params}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createSmartList(listData: Partial<SmartList>): Promise<SmartList> {
  const res = await fetch('/api/smart-lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao criar lista inteligente');
  }
  return res.json();
}

export async function updateSmartList(id: string, listData: Partial<SmartList>): Promise<SmartList> {
  const res = await fetch(`/api/smart-lists/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(listData)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao atualizar lista inteligente');
  }
  return res.json();
}

export async function deleteSmartList(id: string): Promise<void> {
  const res = await fetch(`/api/smart-lists/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir lista');
}

export async function fetchLeadScoringConfig(companyId?: string): Promise<LeadScoringConfig> {
  const params = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/lead-scoring/config${params}`);
  if (!res.ok) {
    return {
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
  }
  return res.json();
}

export async function updateLeadScoringConfig(companyId: string, config: Partial<LeadScoringConfig>): Promise<LeadScoringConfig> {
  const res = await fetch('/api/lead-scoring/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyId, config })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao salvar regras de lead scoring');
  }
  return res.json();
}

export async function recalculateAllScores(companyId: string): Promise<{ updatedCount: number; leads: Lead[] }> {
  const res = await fetch('/api/lead-scoring/recalculate-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao recalcular scores');
  }
  return res.json();
}

export async function analyzeLeadScoreAI(leadId: string, companyId?: string): Promise<{
  score: number;
  qualificationLevel: 'Lead' | 'MQL' | 'SQL';
  fitGrade: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  breakdown: Array<{ reason: string; points: number }>;
}> {
  const res = await fetch(`/api/lead-scoring/analyze-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId, companyId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao analisar score com IA');
  }
  return res.json();
}

// ==============================================================================
// INSTAGRAM AUTO-DM & COMMENT GROWTH TOOL (MANYCHAT STYLE)
// ==============================================================================

export async function fetchInstagramAutomations(companyId?: string): Promise<InstagramCommentAutomation[]> {
  const params = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/instagram/automations${params}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createInstagramAutomation(data: Partial<InstagramCommentAutomation>): Promise<InstagramCommentAutomation> {
  const res = await fetch('/api/instagram/automations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao criar automação de comentários');
  }
  return res.json();
}

export async function updateInstagramAutomation(id: string, data: Partial<InstagramCommentAutomation>): Promise<InstagramCommentAutomation> {
  const res = await fetch(`/api/instagram/automations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao atualizar automação de comentários');
  }
  return res.json();
}

export async function deleteInstagramAutomation(id: string): Promise<void> {
  const res = await fetch(`/api/instagram/automations/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir automação de comentários');
}

export async function fetchInstagramCommentLogs(companyId?: string): Promise<InstagramCommentLog[]> {
  const params = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/instagram/automations/logs${params}`);
  if (!res.ok) return [];
  return res.json();
}

export async function simulateInstagramComment(payload: {
  companyId: string;
  ruleId?: string;
  instagramUsername: string;
  commentText: string;
  postTitle?: string;
  isFollowerSimulated?: boolean;
  simulatedFollowReply?: string;
}): Promise<InstagramSimulateResult> {
  const res = await fetch('/api/instagram/automations/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao simular comentário no Instagram');
  }
  return res.json();
}

export async function fetchInstagramSettings(companyId?: string): Promise<{
  accessToken?: string;
  instagramAccountId?: string;
  pageId?: string;
  verifyToken?: string;
  autoReplyReal?: boolean;
  connectedAccountName?: string;
  status?: string;
}> {
  const params = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/instagram/settings${params}`);
  if (!res.ok) return {};
  return res.json();
}

export async function updateInstagramSettings(companyId: string, settings: any): Promise<any> {
  const res = await fetch('/api/instagram/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyId, settings })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao salvar configurações do Instagram');
  }
  return res.json();
}

export async function testInstagramToken(
  accessToken: string,
  instagramAccountId?: string
): Promise<{
  success: boolean;
  accountName?: string;
  id?: string;
  pageId?: string;
  instagramAccountId?: string;
  scopes?: string[];
  isCapiToken?: boolean;
  message?: string;
}> {
  const res = await fetch('/api/instagram/test-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accessToken, instagramAccountId })
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Falha ao validar token da Meta');
  }
  return data;
}

// ==============================================================================
// PASSO 6: MULTI-ATENDIMENTO, EQUIPES E MONITORAMENTO DE SUPERVISÃO
// ==============================================================================

export async function fetchTeams(companyId: string): Promise<Team[]> {
  const res = await fetch(`/api/teams?companyId=${encodeURIComponent(companyId)}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createTeam(data: Partial<Team>): Promise<Team> {
  const res = await fetch('/api/teams', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao criar equipe');
  }
  return res.json();
}

export async function updateTeam(id: string, data: Partial<Team>): Promise<Team> {
  const res = await fetch(`/api/teams/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao atualizar equipe');
  }
  return res.json();
}

export async function deleteTeam(id: string): Promise<void> {
  const res = await fetch(`/api/teams/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao excluir equipe');
  }
}

export async function fetchTeamMembers(companyId: string, teamId?: string): Promise<TeamMember[]> {
  const url = teamId
    ? `/api/team-members?companyId=${encodeURIComponent(companyId)}&teamId=${encodeURIComponent(teamId)}`
    : `/api/team-members?companyId=${encodeURIComponent(companyId)}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
}

export async function createTeamMember(data: Partial<TeamMember>): Promise<TeamMember> {
  const res = await fetch('/api/team-members', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao adicionar membro à equipe');
  }
  return res.json();
}

export async function updateTeamMember(id: string, data: Partial<TeamMember>): Promise<TeamMember> {
  const res = await fetch(`/api/team-members/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao atualizar membro da equipe');
  }
  return res.json();
}

export async function deleteTeamMember(id: string): Promise<void> {
  const res = await fetch(`/api/team-members/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao remover membro da equipe');
  }
}

export async function reassignLead(leadId: string, assignedUserId?: string, assignedTeamId?: string): Promise<Lead> {
  const res = await fetch(`/api/leads/${leadId}/reassign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignedUserId, assignedTeamId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao reatribuir lead');
  }
  return res.json();
}

export async function fetchSupervisorStats(companyId: string): Promise<SupervisorMonitorStats> {
  const res = await fetch(`/api/supervisor/live-monitor?companyId=${encodeURIComponent(companyId)}`);
  if (!res.ok) {
    return {
      totalAgents: 0,
      onlineAgents: 0,
      inCallAgents: 0,
      busyAgents: 0,
      offlineAgents: 0,
      activeChatsCount: 0,
      todayCallsCount: 0,
      averageCallDuration: 0,
      positiveSentimentRate: 0
    };
  }
  return res.json();
}

export async function fetchNextAttendant(companyId: string, teamId?: string): Promise<{ nextUser: User | null; team: Team | null; memberCount: number }> {
  const url = teamId
    ? `/api/teams-next-attendant?companyId=${encodeURIComponent(companyId)}&teamId=${encodeURIComponent(teamId)}`
    : `/api/teams-next-attendant?companyId=${encodeURIComponent(companyId)}`;
  const res = await fetch(url);
  if (!res.ok) return { nextUser: null, team: null, memberCount: 0 };
  return res.json();
}

export async function autoAssignLead(leadId: string, companyId: string, teamId?: string): Promise<{ success: boolean; lead: Lead; assignedUser: { id: string; name: string }; team: { id: string; name: string } }> {
  const res = await fetch(`/api/leads/${leadId}/auto-assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyId, teamId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao direcionar lead automaticamente');
  }
  return res.json();
}

// ==========================================
// Surveys & Qualificação API
// ==========================================

export async function fetchSurveys(companyId?: string): Promise<Survey[]> {
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/surveys${query}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchSurveyById(id: string): Promise<Survey> {
  const res = await fetch(`/api/surveys/${id}`);
  if (!res.ok) throw new Error('Pesquisa não encontrada');
  return res.json();
}

export async function createSurvey(data: Partial<Survey>): Promise<Survey> {
  const res = await fetch('/api/surveys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao criar pesquisa');
  }
  return res.json();
}

export async function updateSurvey(id: string, data: Partial<Survey>): Promise<Survey> {
  const res = await fetch(`/api/surveys/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao atualizar pesquisa');
  }
  return res.json();
}

export async function deleteSurvey(id: string): Promise<void> {
  const res = await fetch(`/api/surveys/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir pesquisa');
}

export async function fetchSurveyResponses(surveyId: string): Promise<SurveyResponse[]> {
  const res = await fetch(`/api/surveys/${surveyId}/responses`);
  if (!res.ok) return [];
  return res.json();
}

// ==========================================
// Custom Domains & DNS API
// ==========================================

export async function fetchCustomDomains(companyId?: string): Promise<CustomDomain[]> {
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/domains${query}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createCustomDomain(data: Partial<CustomDomain>): Promise<CustomDomain> {
  const res = await fetch('/api/domains', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao registrar domínio');
  }
  return res.json();
}

export async function verifyCustomDomain(id: string, simulate?: boolean): Promise<{ success: boolean; verified: boolean; domain: CustomDomain; message: string }> {
  const url = simulate ? `/api/domains/${id}/verify?simulate=true` : `/api/domains/${id}/verify`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Falha ao verificar DNS');
  }
  return res.json();
}

export async function deleteCustomDomain(id: string): Promise<void> {
  const res = await fetch(`/api/domains/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir domínio');
}

// ==========================================
// Event Gamification & Live Presentation API
// ==========================================

export async function fetchGamificationEvents(companyId?: string): Promise<GamificationEvent[]> {
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/gamification-events${query}`);
  if (!res.ok) return [];
  return res.json();
}

export async function fetchGamificationEventDetails(id: string): Promise<GamificationEvent & { activities: GamificationActivity[]; participants: GamificationParticipant[]; responses: GamificationResponse[] }> {
  const res = await fetch(`/api/gamification-events/${id}/details`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao carregar detalhes do evento');
  }
  return res.json();
}

export async function createGamificationEvent(data: Partial<GamificationEvent>): Promise<GamificationEvent> {
  const res = await fetch('/api/gamification-events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao criar evento');
  }
  return res.json();
}

export async function updateGamificationEvent(id: string, data: Partial<GamificationEvent>): Promise<GamificationEvent> {
  const res = await fetch(`/api/gamification-events/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao atualizar evento');
  }
  return res.json();
}

export async function deleteGamificationEvent(id: string): Promise<void> {
  const res = await fetch(`/api/gamification-events/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir evento');
}

export async function addGamificationActivity(eventId: string, data: Partial<GamificationActivity>): Promise<GamificationActivity> {
  const res = await fetch(`/api/gamification-events/${eventId}/activities`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao adicionar dinâmica');
  }
  return res.json();
}

export async function updateGamificationActivity(eventId: string, activityId: string, data: Partial<GamificationActivity>): Promise<GamificationActivity> {
  const res = await fetch(`/api/gamification-events/${eventId}/activities/${activityId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao atualizar dinâmica');
  }
  return res.json();
}

export async function deleteGamificationActivity(eventId: string, activityId: string): Promise<void> {
  const res = await fetch(`/api/gamification-events/${eventId}/activities/${activityId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir dinâmica');
}

export async function setActiveGamificationActivity(eventId: string, activityId: string | null): Promise<any> {
  const res = await fetch(`/api/gamification-events/${eventId}/set-active-activity`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ activityId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao alterar dinâmica ativa');
  }
  return res.json();
}

export async function triggerLuckyDraw(eventId: string): Promise<{ winner: GamificationParticipant }> {
  const res = await fetch(`/api/gamification-events/${eventId}/lucky-draw`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao realizar sorteio');
  }
  return res.json();
}

export async function resetGamificationResponses(eventId: string): Promise<any> {
  const res = await fetch(`/api/gamification-events/${eventId}/reset-responses`, { method: 'POST' });
  if (!res.ok) throw new Error('Erro ao resetar respostas');
  return res.json();
}

export async function exportGamificationLeadsToCRM(eventId: string): Promise<{ importedCount: number; message: string }> {
  const res = await fetch(`/api/gamification-events/${eventId}/export-leads-to-crm`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao exportar leads para o CRM');
  }
  return res.json();
}

// ==========================================
// Autonomous AI Agents Creator & Runner API
// ==========================================

export async function fetchAIAgents(companyId?: string): Promise<AIAgent[]> {
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/ai-agents${query}`);
  if (!res.ok) return [];
  return res.json();
}

export async function createAIAgent(data: Partial<AIAgent>): Promise<AIAgent> {
  const res = await fetch('/api/ai-agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao criar agente de IA');
  }
  return res.json();
}

export async function updateAIAgent(id: string, data: Partial<AIAgent>): Promise<AIAgent> {
  const res = await fetch(`/api/ai-agents/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao atualizar agente de IA');
  }
  return res.json();
}

export async function deleteAIAgent(id: string, companyId?: string): Promise<void> {
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/ai-agents/${id}${query}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Erro ao excluir agente de IA');
}

export async function generateAIAgentBlueprint(description: string, companyId?: string, companyName?: string): Promise<Partial<AIAgent>> {
  const res = await fetch('/api/ai-agents/generate-blueprint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, companyId, companyName })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao gerar agente a partir da descrição');
  }
  return res.json();
}

export async function executeAIAgentTurn(
  agentId: string,
  payload: {
    companyId?: string;
    leadId?: string;
    userMessage: string;
    triggerType?: string;
    conversationHistory?: Array<{ role: 'user' | 'agent'; text: string }>;
    applyRealActions?: boolean;
  }
): Promise<{
  executionLog: AIAgentExecutionLog;
  updatedLead?: Lead | null;
}> {
  const res = await fetch(`/api/ai-agents/${agentId}/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao executar agente de IA');
  }
  return res.json();
}

export async function fetchAIAgentLogs(companyId?: string, agentId?: string): Promise<AIAgentExecutionLog[]> {
  const params = new URLSearchParams();
  if (companyId) params.append('companyId', companyId);
  if (agentId) params.append('agentId', agentId);
  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await fetch(`/api/ai-agents/logs${query}`);
  if (!res.ok) return [];
  return res.json();
}

export async function updateAIAgentLog(logId: string, data: Partial<AIAgentExecutionLog>, companyId?: string): Promise<AIAgentExecutionLog> {
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : '';
  const res = await fetch(`/api/ai-agents/logs/${logId}${query}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, companyId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Erro ao atualizar atividade do agente');
  }
  return res.json();
}

export async function testSmtpEmail(data: {
  companyId?: string;
  targetEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFromName?: string;
  smtpFromEmail?: string;
  smtpSecure?: boolean;
}): Promise<{ success: boolean; messageId?: string; message?: string; error?: string }> {
  const res = await fetch('/api/settings/test-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}


