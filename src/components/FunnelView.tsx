import React from 'react';
import { Lead } from '../types';

interface FunnelViewProps {
  leads: Lead[];
}

export function FunnelView({ leads }: FunnelViewProps) {
  const stages = [
    { id: 'Novo Lead', label: 'Novos Leads', color: 'bg-blue-500' },
    { id: 'Em Atendimento', label: 'Em Atendimento', color: 'bg-yellow-500' },
    { id: 'Qualificado', label: 'Qualificados', color: 'bg-purple-500' },
    { id: 'Em Negociação', label: 'Em Negociação', color: 'bg-orange-500' },
    { id: 'Convertido', label: 'Convertidos', color: 'bg-emerald-500' }
  ];

  const total = leads.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-bold text-slate-800 mb-6 text-center">Métricas do Funil de Vendas</h3>
      
      <div className="flex flex-col items-center max-w-3xl mx-auto space-y-2">
        {stages.map((stage, index) => {
          // Count leads in this specific stage OR ANY STAGE further down the funnel.
          // In a cumulative funnel, "Em Atendimento" includes everything that passed through it.
          // But usually a standard CRM funnel is strict: how many made it to this stage OR further?
          const stageIndex = stages.findIndex(s => s.id === stage.id);
          const validStages = stages.slice(stageIndex).map(s => s.id);
          
          const count = leads.filter(l => validStages.includes(l.stage)).length;
          const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
          
          // Width decreases as we go down
          const width = 100 - (index * 15);

          return (
            <div key={stage.id} className="w-full flex items-center group relative">
              <div className="w-32 text-right pr-4 text-sm font-medium text-slate-600 shrink-0">
                {stage.label}
              </div>
              
              <div className="flex-1 flex justify-center">
                <div 
                  className={`h-16 ${stage.color} relative flex items-center justify-center text-white font-bold transition-all duration-300 shadow-inner rounded`}
                  style={{ 
                    width: `${width}%`,
                    clipPath: 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)'
                  }}
                >
                  <span className="z-10 text-lg drop-shadow-md">{count}</span>
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>

              <div className="w-32 pl-4 text-left text-sm font-bold text-slate-400 shrink-0">
                {percentage}% <span className="text-[10px] font-normal text-slate-400">conversão</span>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 border border-slate-100 p-4 rounded text-center">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Total Entradas</p>
          <p className="text-2xl font-black text-blue-600">{total}</p>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-4 rounded text-center">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Conversão Final</p>
          <p className="text-2xl font-black text-emerald-600">
            {total > 0 ? Math.round((leads.filter(l => l.stage === 'Convertido').length / total) * 100) : 0}%
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-4 rounded text-center">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Perdidos</p>
          <p className="text-2xl font-black text-red-500">
            {leads.filter(l => l.stage === 'Perdido').length}
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-100 p-4 rounded text-center">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Receita Gerada</p>
          <p className="text-2xl font-black text-slate-800">
            R$ {leads.filter(l => l.stage === 'Convertido').reduce((acc, l) => acc + (l.value || 0), 0).toFixed(2).replace('.', ',')}
          </p>
        </div>
      </div>
    </div>
  );
}
