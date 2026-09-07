const fs = require('fs');
const file = 'src/components/LeadCRM.tsx';
let content = fs.readFileSync(file, 'utf8');

const renderLeadCardFunction = `
  const renderLeadCard = (lead: Lead) => (
    <div key={lead.id} className="bg-white border border-slate-200 p-4 rounded-lg shadow-xs hover:border-blue-300 transition space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold border border-blue-100 shrink-0">
            {lead.name ? lead.name.charAt(0).toUpperCase() : 'L'}
          </div>
          <div className="min-w-0">
            <h4 className="text-slate-900 font-bold truncate" title={lead.name || 'Lead Visitante'}>{lead.name || 'Lead Visitante'}</h4>
            <div className="text-[10px] text-slate-500 font-mono truncate">{lead.phone || 'S/ telefone'}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {lead.phone && (
            <a href={\`https://wa.me/\${lead.phone.replace(/\\D/g, '')}\`} target="_blank" rel="noreferrer" className="text-green-600 hover:bg-green-50 p-1 rounded transition" title="WhatsApp">
              <MessageSquare className="w-3.5 h-3.5" />
            </a>
          )}
          <button onClick={() => handleOpenLeadDetails(lead)} className="text-slate-400 hover:text-blue-600 hover:bg-slate-50 p-1 rounded transition" title="Detalhes">
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px]">
        <span className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold border border-slate-200 truncate max-w-[100px]" title={lead.utmSource || lead.source}>
          {lead.utmSource || lead.source || 'Direto'}
        </span>
        {lead.utmCampaign && (
          <span className="text-slate-500 font-mono truncate max-w-[120px]" title={lead.utmCampaign}>
            📢 {lead.utmCampaign}
          </span>
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
        <select
          value={lead.stage}
          onChange={(e) => handleStageChange(lead.id, e.target.value as FunnelStage)}
          className={\`text-[10px] font-bold px-2 py-0.5 rounded border focus:outline-none cursor-pointer \${getStageBadgeClass(lead.stage)}\`}
        >
          <option value="Novo Lead">Novo Lead</option>
          <option value="Contatado">Contatado</option>
          <option value="Em Negociação">Em Negociação</option>
          <option value="Convertido">Convertido</option>
          <option value="Perdido">Perdido</option>
        </select>
        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(lead.updatedAt).split(' ')[0]}
        </span>
      </div>
    </div>
  );
`;

const tableBlockStart = `      {/* Main Leads Table */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">`;

const renderBlockReplacement = `      {/* Main Leads Views */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">`;

// We inject the function just before handleExportCsv
content = content.replace('  const handleExportCsv = () => {', renderLeadCardFunction + '\n  const handleExportCsv = () => {');

// Replace the start of the table view
content = content.replace(tableBlockStart, renderBlockReplacement);

// We need to find the end of the table view block and append the new views
const tableBlockEndMatch = `            </tbody>
          </table>
        </div>
      </div>`;

const newViewsStr = `            </tbody>
          </table>
        </div>
      </div>
      )}

      {viewMode === 'card' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLeads.map(lead => renderLeadCard(lead))}
        </div>
      )}

      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4 items-start h-[calc(100vh-220px)] min-h-[500px]">
          {['Novo Lead', 'Contatado', 'Em Negociação', 'Convertido', 'Perdido'].map(stage => {
            const stageLeads = filteredLeads.filter(l => l.stage === stage);
            return (
              <div key={stage} className="flex-shrink-0 w-80 bg-slate-50/50 rounded-lg flex flex-col h-full border border-slate-200">
                <div className="p-3 border-b border-slate-200 bg-white rounded-t-lg shadow-sm">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm">{stage}</h3>
                    <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{stageLeads.length}</span>
                  </div>
                </div>
                <div className="p-3 overflow-y-auto flex-1 space-y-3">
                  {stageLeads.map(lead => renderLeadCard(lead))}
                  {stageLeads.length === 0 && (
                    <div className="text-center text-xs text-slate-400 py-6 italic border-2 border-dashed border-slate-200 rounded-lg">
                      Nenhum lead nesta etapa.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}`;

content = content.replace(tableBlockEndMatch, newViewsStr);

fs.writeFileSync(file, content);
