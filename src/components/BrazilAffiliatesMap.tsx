import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  MessageCircle, 
  Search, 
  CheckCircle, 
  ExternalLink, 
  Phone, 
  Sparkles, 
  Users, 
  Building2, 
  Filter, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export interface AffiliateLocationItem {
  id: string;
  name: string;
  city: string;
  state: string;
  phone: string;
  referralCode?: string;
}

interface BrazilAffiliatesMapProps {
  affiliates?: AffiliateLocationItem[];
  theme?: 'dark' | 'light';
  title?: string;
  subtitle?: string;
  onRegisterAffiliate?: () => void;
}

// Approximate coordinate projection on 0-100% canvas for Brazil's 27 Federative Units
const STATE_COORDINATES: Record<string, { x: number; y: number; name: string; region: string }> = {
  // Norte
  AC: { x: 12, y: 50, name: 'Acre', region: 'Norte' },
  AM: { x: 26, y: 32, name: 'Amazonas', region: 'Norte' },
  RR: { x: 33, y: 15, name: 'Roraima', region: 'Norte' },
  AP: { x: 57, y: 19, name: 'Amapá', region: 'Norte' },
  PA: { x: 50, y: 33, name: 'Pará', region: 'Norte' },
  RO: { x: 28, y: 53, name: 'Rondônia', region: 'Norte' },
  TO: { x: 59, y: 44, name: 'Tocantins', region: 'Norte' },

  // Nordeste
  MA: { x: 67, y: 31, name: 'Maranhão', region: 'Nordeste' },
  PI: { x: 73, y: 37, name: 'Piauí', region: 'Nordeste' },
  CE: { x: 83, y: 28, name: 'Ceará', region: 'Nordeste' },
  RN: { x: 91, y: 30, name: 'Rio Grande do Norte', region: 'Nordeste' },
  PB: { x: 91, y: 36, name: 'Paraíba', region: 'Nordeste' },
  PE: { x: 88, y: 41, name: 'Pernambuco', region: 'Nordeste' },
  AL: { x: 90, y: 45, name: 'Alagoas', region: 'Nordeste' },
  SE: { x: 87, y: 49, name: 'Sergipe', region: 'Nordeste' },
  BA: { x: 77, y: 52, name: 'Bahia', region: 'Nordeste' },

  // Centro-Oeste
  MT: { x: 42, y: 56, name: 'Mato Grosso', region: 'Centro-Oeste' },
  DF: { x: 63, y: 58, name: 'Distrito Federal', region: 'Centro-Oeste' },
  GO: { x: 57, y: 62, name: 'Goiás', region: 'Centro-Oeste' },
  MS: { x: 46, y: 71, name: 'Mato Grosso do Sul', region: 'Centro-Oeste' },

  // Sudeste
  MG: { x: 71, y: 66, name: 'Minas Gerais', region: 'Sudeste' },
  ES: { x: 83, y: 68, name: 'Espírito Santo', region: 'Sudeste' },
  RJ: { x: 77, y: 76, name: 'Rio de Janeiro', region: 'Sudeste' },
  SP: { x: 64, y: 76, name: 'São Paulo', region: 'Sudeste' },

  // Sul
  PR: { x: 56, y: 83, name: 'Paraná', region: 'Sul' },
  SC: { x: 60, y: 89, name: 'Santa Catarina', region: 'Sul' },
  RS: { x: 52, y: 94, name: 'Rio Grande do Sul', region: 'Sul' }
};

export const BrazilAffiliatesMap: React.FC<BrazilAffiliatesMapProps> = ({
  affiliates: propAffiliates,
  theme = 'dark',
  title = 'Encontre um Afiliado ou Representante Oficial em Todo o Brasil',
  subtitle = 'Nossa rede de especialistas e representantes regionais está pronta para atender sua empresa localmente e auxiliar no setup e treinamento.',
  onRegisterAffiliate
}) => {
  const [affiliates, setAffiliates] = useState<AffiliateLocationItem[]>([]);
  const [selectedState, setSelectedState] = useState<string>('MT');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedAffiliate, setSelectedAffiliate] = useState<AffiliateLocationItem | null>(null);

  useEffect(() => {
    if (propAffiliates && propAffiliates.length > 0) {
      setAffiliates(propAffiliates);
      const mtAff = propAffiliates.find(a => a.state === 'MT') || propAffiliates[0];
      if (mtAff) {
        setSelectedAffiliate(mtAff);
        setSelectedState(mtAff.state);
      }
    } else {
      fetch('/api/public/affiliates')
        .then(res => res.json())
        .then((data: AffiliateLocationItem[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setAffiliates(data);
            const mtAff = data.find(a => a.state === 'MT') || data[0];
            if (mtAff) {
              setSelectedAffiliate(mtAff);
              setSelectedState(mtAff.state);
            }
          }
        })
        .catch(() => {});
    }
  }, [propAffiliates]);

  // Group affiliates by State
  const affiliatesByState = affiliates.reduce((acc, aff) => {
    const uf = (aff.state || 'BR').toUpperCase().trim();
    if (!acc[uf]) acc[uf] = [];
    acc[uf].push(aff);
    return acc;
  }, {} as Record<string, AffiliateLocationItem[]>);

  // States with at least 1 affiliate
  const activeStates = Object.keys(affiliatesByState);

  // Filter affiliates for the list view
  const filteredAffiliates = affiliates.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.state.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (selectedRegion !== 'all') {
      const stateInfo = STATE_COORDINATES[a.state.toUpperCase()];
      if (stateInfo && stateInfo.region !== selectedRegion) return false;
    }

    return true;
  });

  const stateAffiliates = affiliatesByState[selectedState.toUpperCase()] || [];

  const handleSelectState = (uf: string) => {
    setSelectedState(uf);
    const list = affiliatesByState[uf] || [];
    if (list.length > 0) {
      setSelectedAffiliate(list[0]);
    } else {
      setSelectedAffiliate(null);
    }
  };

  const handleOpenWhatsApp = (aff: AffiliateLocationItem) => {
    const rawPhone = aff.phone.replace(/\D/g, '');
    const cleanPhone = rawPhone.startsWith('55') ? rawPhone : `55${rawPhone}`;
    const text = encodeURIComponent(
      `Olá ${aff.name}! Encontrei seu contato no mapa de representantes oficiais do TrackerMD em ${aff.city || aff.state}. Gostaria de conhecer mais sobre a plataforma e o treinamento!`
    );
    const url = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(url, '_blank');
  };

  const isDark = theme === 'dark';

  return (
    <section className={`py-12 px-4 sm:px-6 lg:px-8 relative rounded-3xl overflow-hidden font-sans ${
      isDark 
        ? 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 border border-slate-800' 
        : 'bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900 border border-slate-200'
    }`}>
      
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Presença Nacional • Atendimento Local</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            {title}
          </h2>

          <p className={`text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {subtitle}
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          {/* Region Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {[
              { id: 'all', label: 'Todo o Brasil' },
              { id: 'Centro-Oeste', label: 'Centro-Oeste' },
              { id: 'Sudeste', label: 'Sudeste' },
              { id: 'Sul', label: 'Sul' },
              { id: 'Nordeste', label: 'Nordeste' },
              { id: 'Norte', label: 'Norte' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => setSelectedRegion(r.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  selectedRegion === r.id
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isDark 
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* City / Name Search */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cidade, estado ou afiliado..."
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 border ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-slate-200 placeholder-slate-500' 
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>
        </div>

        {/* Map Layout: Left Side Interactive Visual Map, Right Side Active Affiliates Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: MAP OF BRAZIL VISUAL CANVAS (7 cols) */}
          <div className={`lg:col-span-7 rounded-3xl p-6 sm:p-8 border relative overflow-hidden flex flex-col items-center justify-center min-h-[480px] sm:min-h-[560px] ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            
            <div className="w-full flex items-center justify-between text-xs mb-4">
              <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Clique em um Estado ou Ponto no Mapa</span>
              </span>

              <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                {affiliates.length} representante(s) ativos
              </span>
            </div>

            {/* Visual Canvas Box */}
            <div className="relative w-full max-w-[500px] aspect-[1/1.05] select-none my-auto">
              
              {/* Brazil Silhouette Background (SVG Outline) */}
              <svg 
                viewBox="0 0 500 520" 
                className={`w-full h-full drop-shadow-md transition ${isDark ? 'text-slate-800/80' : 'text-slate-200'}`}
                fill="currentColor"
              >
                {/* Simplified contour of Brazil */}
                <path d="M 120 180 Q 200 80, 310 90 Q 360 120, 420 140 Q 480 180, 470 240 Q 420 280, 440 330 Q 420 380, 390 410 Q 340 450, 300 480 Q 270 510, 260 480 Q 250 430, 230 400 Q 180 340, 150 280 Q 80 260, 60 230 Z" opacity="0.4" />
                <path d="M 130 190 C 180 110, 280 80, 340 100 C 400 120, 460 150, 455 210 C 450 250, 420 290, 425 330 C 430 360, 395 400, 370 420 C 330 450, 290 485, 275 480 C 260 440, 235 410, 220 380 C 170 330, 140 280, 120 250 Z" opacity="0.2" />
              </svg>

              {/* State & City Coordinate Pins */}
              {Object.entries(STATE_COORDINATES).map(([uf, coord]) => {
                const repList = affiliatesByState[uf] || [];
                const hasRep = repList.length > 0;
                const isSelected = selectedState.toUpperCase() === uf;

                return (
                  <div
                    key={uf}
                    onClick={() => handleSelectState(uf)}
                    style={{ left: `${coord.x}%`, top: `${coord.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                  >
                    {/* Pulsing Radar Effect for States with Representatives */}
                    {hasRep && (
                      <span className="absolute -inset-2 rounded-full bg-emerald-500/30 animate-ping pointer-events-none" />
                    )}

                    {/* Pin Circle */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[11px] transition-all transform duration-150 shadow-md ${
                      isSelected
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30 scale-125 z-30'
                        : hasRep
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:scale-115 hover:ring-2 hover:ring-emerald-400'
                          : isDark
                            ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                            : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}>
                      {uf}
                    </div>

                    {/* Tooltip on hover */}
                    <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-lg z-40 ${
                      hasRep ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-200'
                    }`}>
                      <div>{coord.name} ({uf})</div>
                      {hasRep ? (
                        <div className="text-[9px] text-emerald-200">
                          {repList.length} representante(s) • WhatsApp disponível
                        </div>
                      ) : (
                        <div className="text-[9px] text-slate-400">Atendimento central</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick State Pills */}
            <div className="w-full pt-4 mt-2 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 shrink-0 mr-1">
                Estados Ativos:
              </span>
              {activeStates.map(uf => (
                <button
                  key={uf}
                  onClick={() => handleSelectState(uf)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-xs transition shrink-0 ${
                    selectedState === uf
                      ? 'bg-emerald-600 text-white'
                      : isDark
                        ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {uf} ({affiliatesByState[uf]?.length})
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: REPRESENTATIVES DETAILS & WHATSAPP DIRECT ACTION (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Selected State Header Card */}
            <div className={`p-6 rounded-3xl border shadow-sm space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="flex items-center justify-between border-b border-slate-800/40 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-black text-sm">
                    {selectedState}
                  </div>
                  <div>
                    <h3 className="font-black text-base">
                      {STATE_COORDINATES[selectedState]?.name || selectedState}
                    </h3>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Região {STATE_COORDINATES[selectedState]?.region || 'Brasil'}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {stateAffiliates.length} Especialista(s)
                </span>
              </div>

              {/* State Affiliates List */}
              {stateAffiliates.length === 0 ? (
                <div className="py-8 text-center space-y-3">
                  <Users className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Ainda não temos um representante exclusivo alocado no estado de {STATE_COORDINATES[selectedState]?.name}.
                  </p>
                  <a
                    href="https://wa.me/5565981150758?text=Ol%C3%A1!%20Gostaria%20de%20atendimento%20central%20para%20minha%20empresa%20no%20TrackerMD."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Falar com Atendimento Nacional</span>
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {stateAffiliates.map((aff) => {
                    const isCurrent = selectedAffiliate?.id === aff.id;

                    return (
                      <div
                        key={aff.id}
                        onClick={() => setSelectedAffiliate(aff)}
                        className={`p-5 rounded-2xl border transition cursor-pointer relative ${
                          isCurrent
                            ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/80 shadow-lg shadow-emerald-500/10'
                            : isDark
                              ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-sm text-white">
                                {aff.name}
                              </h4>
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            </div>

                            <div className="flex items-center gap-2 mt-1 text-xs text-emerald-400 font-semibold">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{aff.city ? `${aff.city} - ${aff.state}` : `${aff.state} (Brasil)`}</span>
                            </div>
                          </div>

                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                            Oficial
                          </span>
                        </div>

                        <p className={`text-xs mt-3 leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                          Especialista em implantação da plataforma TrackerMD, integração Meta Ads CAPI e treinamento de equipes comerciais.
                        </p>

                        {/* WhatsApp Direct Action Button */}
                        <div className="pt-4 mt-3 border-t border-slate-800/80">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenWhatsApp(aff);
                            }}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition transform active:scale-98"
                          >
                            <MessageCircle className="w-4 h-4 text-emerald-100" />
                            <span>Chamar no WhatsApp Direto 💬</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* General National Help Box */}
            <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 flex-wrap ${
              isDark ? 'bg-slate-900/60 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
            }`}>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Quer se tornar um afiliado ou representante oficial na sua cidade? Ganhe 20% recorrente + 50% de comissão no setup.</span>
              </div>
              <div className="flex items-center gap-2">
                {onRegisterAffiliate ? (
                  <button
                    type="button"
                    onClick={onRegisterAffiliate}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shrink-0 flex items-center gap-1.5 transition shadow-sm"
                  >
                    <span>Cadastrar como Representante</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <a
                    href="https://wa.me/5565981150758?text=Ol%C3%A1!%20Quero%20me%20cadastrar%20como%20afiliado%20ou%20representante%20do%20TrackerMD."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:underline font-bold shrink-0 flex items-center gap-1"
                  >
                    <span>Quero ser Parceiro</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

