import { CampaignLink, Lead, WebhookLog, IntegrationSettings, StatsSummary, FunnelStage, Company, User } from '../types';

export async function fetchCompanies(): Promise<Company[]> {
  const res = await fetch('/api/companies');
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

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
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

export async function fetchLinks(): Promise<CampaignLink[]> {
  const res = await fetch('/api/links');
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

export async function fetchLeads(): Promise<Lead[]> {
  const res = await fetch('/api/leads');
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

export async function fetchProducts(companyId?: string): Promise<any[]> {
  const query = companyId ? `?companyId=${companyId}` : '';
  const res = await fetch(`/api/products${query}`);
  return res.json();
}

export async function createProduct(data: any): Promise<any> {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateProduct(id: string, data: any): Promise<any> {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
  await fetch(`/api/products/${id}`, { method: 'DELETE' });
}

export async function fetchLeadPurchases(companyId?: string): Promise<any[]> {
  const query = companyId ? `?companyId=${companyId}` : '';
  const res = await fetch(`/api/lead-purchases${query}`);
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

export async function fetchWebhookLogs(): Promise<WebhookLog[]> {
  const res = await fetch('/api/webhooks/logs');
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
