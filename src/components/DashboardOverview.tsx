import React, { useState } from 'react';
import { StatsSummary, CampaignLink, Lead } from '../types';
import { MousePointerClick, Users, CheckCircle2, DollarSign, TrendingUp, Filter, MapPin, Award } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

interface DashboardOverviewProps {
  stats: StatsSummary;
  links: CampaignLink[];
  leads: Lead[];
  onNavigateToLinks: () => void;
  onNavigateToLeads: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  stats,
  links,
  leads,
  onNavigateToLinks,
  onNavigateToLeads,
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');

  // Filtered leads based on campaign selector
  const filteredLeads = selectedCampaign === 'all'
    ? leads
    : leads.filter(l => l.utmCampaign === selectedCampaign);

  // Funnel data aggregation
  const funnelStages = [
    { stage: 'Novo Lead', count: filteredLeads.filter(l => l.stage === 'Novo Lead').length, color: '#3b82f6' },
    { stage: 'Contatado', count: filteredLeads.filter(l => l.stage === 'Contatado').length, color: '#eab308' },
    { stage: 'Em Negociação', count: filteredLeads.filter(l => l.stage === 'Em Negociação').length, color: '#a855f7' },
    { stage: 'Convertido', count: filteredLeads.filter(l => l.stage === 'Convertido').length, color: '#10b981' },
    { stage: 'Perdido', count: filteredLeads.filter(l => l.stage === 'Perdido').length, color: '#ef4444' },
  ];

  // Campaign breakdown calculation
  const campaignStats = links.map(link => {
    const linkLeads = leads.filter(l => l.linkId === link.id || l.utmCampaign === link.utmCampaign);
    const totalLeadsCount = linkLeads.length;
    const conversions = linkLeads.filter(l => l.stage === 'Convertido').length;
    const revenue = linkLeads.filter(l => l.stage === 'Convertido').reduce((acc, l) => acc + (l.value || 0), 0);
    const convRate = link.clicksCount > 0 ? ((conversions / link.clicksCount) * 100).toFixed(1) : '0.0';

    return {
      id: link.id,
      title: link.title,
      utmSource: link.utmSource,
      utmCampaign: link.utmCampaign,
      slug: link.slug,
      clicks: link.clicksCount,
      leads: totalLeadsCount,
      conversions,
      convRate: Number(convRate),
      revenue,
    };
  });

  // Source chart data
  const sourceAggregation: Record<string, { leads: number; conversions: number }> = {};
  leads.forEach(l => {
    const src = l.utmSource || 'direto';
    if (!sourceAggregation[src]) {
      sourceAggregation[src] = { leads: 0, conversions: 0 };
    }
    sourceAggregation[src].leads += 1;
    if (l.stage === 'Convertido') {
      sourceAggregation[src].conversions += 1;
    }
  });

  const sourceChartData = Object.entries(sourceAggregation).map(([source, data]) => ({
    name: source,
    Leads: data.leads,
    Conversões: data.conversions
  }));

  // Location breakdown
  const cityMap: Record<string, number> = {};
  leads.forEach(l => {
    const loc = l.location?.city ? `${l.location.city}, ${l.location.state || 'BR'}` : 'Desconhecido';
    cityMap[loc] = (cityMap[loc] || 0) + 1;
  });

  const topCities = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Top Creative Ads breakdown
  const creativeMap: Record<string, { leads: number; conversions: number; revenue: number }> = {};
  leads.forEach(l => {
    const adName = l.utmContent || 'anuncio_padrao';
    if (!creativeMap[adName]) {
      creativeMap[adName] = { leads: 0, conversions: 0, revenue: 0 };
    }
    creativeMap[adName].leads += 1;
    if (l.stage === 'Convertido') {
      creativeMap[adName].conversions += 1;
      creativeMap[adName].revenue += (l.value || 0);
    }
  });

  const topCreatives = Object.entries(creativeMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.leads - a.leads);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Visão Geral de Campanhas
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas em tempo real de campanhas do WhatsApp, atribuição de UTM e desempenho de conversão.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200 text-xs text-slate-700">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-500 font-medium">Campanha:</span>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas as Campanhas</option>
              {links.map(l => (
                <option key={l.id} value={l.utmCampaign}>
                  {l.title} ({l.utmCampaign})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Clicks */}
        <div className="bg-white border border-slate-200 p-5 rounded-lg relative overflow-hidden group hover:border-slate-300 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total de Cliques no Link</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded">
              <MousePointerClick className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{stats.totalClicks}</span>
            <span className="text-xs text-slate-500 ml-2">cliques</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Visitas de redirecionamento geradas</p>
        </div>

        {/* Card 2: Total Leads */}
        <div className="bg-white border border-slate-200 p-5 rounded-lg relative overflow-hidden group hover:border-slate-300 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leads Capturados</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{stats.totalLeads}</span>
            <span className="text-xs font-semibold text-blue-600">
              {stats.totalClicks > 0 ? `${((stats.totalLeads / stats.totalClicks) * 100).toFixed(1)}% captura` : '0%'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Iniciaram conversa ou preencheram dados</p>
        </div>

        {/* Card 3: Conversions */}
        <div className="bg-white border border-slate-200 p-5 rounded-lg relative overflow-hidden group hover:border-slate-300 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conversões / Vendas</span>
            <div className="p-2 bg-green-50 text-green-600 rounded">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{stats.totalConversions}</span>
            <span className="text-xs font-semibold text-green-600">{stats.conversionRate}% taxa</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Leads na etapa 'Convertido'</p>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-white border border-slate-200 p-5 rounded-lg relative overflow-hidden group hover:border-slate-300 transition shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Faturamento Gerado</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-blue-600 tracking-tight">{formatCurrency(stats.totalRevenue)}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">Atribuído às campanhas de WhatsApp</p>
        </div>

      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Chart 1: Funnel Stages Distribution */}
        <div className="bg-white border border-slate-200 p-6 rounded-lg lg:col-span-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-tight">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                Funil de Leads em Tempo Real
              </h3>
              <button 
                onClick={onNavigateToLeads}
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                Ver Funil →
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Distribuição dos leads nas etapas da jornada de compra.
            </p>

            <div className="space-y-3">
              {funnelStages.map((item) => {
                const percentage = filteredLeads.length > 0 ? ((item.count / filteredLeads.length) * 100).toFixed(0) : 0;
                return (
                  <div key={item.stage} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 font-medium">{item.stage}</span>
                      <span className="text-slate-500 font-mono">{item.count} leads ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded overflow-hidden">
                      <div
                        className="h-full rounded transition-all duration-500 bg-blue-600"
                        style={{ width: `${percentage}%`, backgroundColor: item.stage === 'Convertido' ? '#10b981' : '#2563eb' }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total de Leads no Funil: <strong className="text-slate-900">{filteredLeads.length}</strong></span>
            <span>Taxa Global de Conv.: <strong className="text-green-600">{stats.conversionRate}%</strong></span>
          </div>
        </div>

        {/* Chart 2: Leads & Conversions by UTM Source */}
        <div className="bg-white border border-slate-200 p-6 rounded-lg lg:col-span-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 uppercase tracking-tight">
                <BarChart3Icon className="w-4 h-4 text-blue-600" />
                Desempenho por Origem (UTM Source)
              </h3>
              <p className="text-xs text-slate-500">
                Comparativo entre total de leads capturados e conversões efetivadas.
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#0f172a', fontSize: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="Leads" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Conversões" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Campaign Details Table & Location Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Table: Detailed Campaign Breakdown */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 lg:col-span-8 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-sm text-slate-700 uppercase">Relatório Detalhado por Campanha</h2>
              <p className="text-xs text-slate-500">Atribuição de cliques, leads, conversões e receita por link criado.</p>
            </div>
            <button
              onClick={onNavigateToLinks}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Gerenciar Links →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Nome da Campanha</th>
                  <th className="py-3 px-2">UTM Source / Campaign</th>
                  <th className="py-3 px-2 text-center">Cliques</th>
                  <th className="py-3 px-2 text-center">Leads</th>
                  <th className="py-3 px-2 text-center">Vendas</th>
                  <th className="py-3 px-2 text-center">Conv %</th>
                  <th className="py-3 px-3 text-right">Faturamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {campaignStats.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition border-b border-slate-100">
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      <div>{item.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">/r/{item.slug}</div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium">
                        {item.utmSource}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{item.utmCampaign}</div>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-slate-600">{item.clicks}</td>
                    <td className="py-3 px-2 text-center font-mono text-blue-600 font-semibold">{item.leads}</td>
                    <td className="py-3 px-2 text-center font-mono text-green-600 font-semibold">{item.conversions}</td>
                    <td className="py-3 px-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.convRate >= 15 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.convRate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-600">
                      {formatCurrency(item.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Location & Creative Ads Side Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Top Creative Ads Breakdown */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                Anúncios / Criativos de Maior Impacto
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Quais anúncios (imagens/vídeos) chamaram a atenção dos leads e trouxeram mais contatos.
            </p>

            <div className="space-y-2">
              {topCreatives.map((item, idx) => (
                <div key={item.name} className="bg-purple-50/60 p-2.5 rounded border border-purple-100 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-purple-950 font-mono truncate">{item.name}</p>
                      <p className="text-[10px] text-purple-800">
                        {item.conversions} vendas ({formatCurrency(item.revenue)})
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-extrabold text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                      {item.leads} leads
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location Breakdown */}
          <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Origem Geográfica
              </h2>
            </div>

            <div className="space-y-2.5">
              {topCities.map(([city, count], idx) => {
                const pct = leads.length > 0 ? Math.round((count / leads.length) * 100) : 0;
                return (
                  <div key={city} className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{city}</p>
                        <p className="text-[10px] text-slate-400">{count} leads</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Callout Dark Alert Card */}
          <div className="bg-slate-900 rounded-lg p-5 text-white shadow-md">
            <h2 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Alerta de Campanha Ativa</h2>
            <p className="text-xs leading-relaxed text-slate-300">
              A campanha 'Black Friday' atingiu a meta de conversão. Latência da Meta API: 45ms.
            </p>
            <div className="mt-4 flex items-center justify-between">
              <button onClick={onNavigateToLinks} className="text-xs text-blue-400 font-bold hover:underline">
                Ver Relatório Completo
              </button>
              <div className="w-5 h-5 border-2 border-slate-700 rounded-full border-t-blue-500 animate-spin"></div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

function BarChart3Icon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 20V10M12 20V4M6 20v-6"/>
    </svg>
  );
}
