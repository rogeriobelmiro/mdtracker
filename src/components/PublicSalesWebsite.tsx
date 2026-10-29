import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Flame, 
  ShieldCheck, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  CreditCard, 
  Users, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  BarChart3, 
  Layers, 
  PhoneCall, 
  Send, 
  MessageSquare, 
  Sliders, 
  CheckCircle2, 
  Star,
  Play,
  TrendingUp,
  HelpCircle,
  X
} from 'lucide-react';
import { Company, User } from '../types';
import { createCompany, createUser, fetchSubscriptionCheckoutUrl } from '../services/api';
import { useDialog } from '../contexts/DialogContext';

interface PublicSalesWebsiteProps {
  onOpenLogin: () => void;
  onLoginSuccess: (user: User, company: Company) => void;
}

export const PublicSalesWebsite: React.FC<PublicSalesWebsiteProps> = ({
  onOpenLogin,
  onLoginSuccess
}) => {
  const { alert, success } = useDialog();

  // Modal de Teste de 1 Dia Grátis
  const [isTrialModalOpen, setIsTrialModalOpen] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [isSubmittingTrial, setIsSubmittingTrial] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('https://pay.hotmart.com');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Load Hotmart Checkout URL
  useEffect(() => {
    fetchSubscriptionCheckoutUrl().then(url => {
      if (url) setCheckoutUrl(url);
    });
  }, []);

  // Handle Trial Registration (1 Day Free Test)
  const handleRegisterTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regCompanyName || !regPassword) {
      await alert('Por favor, preencha todos os campos para liberar seu teste gratuito de 1 dia.');
      return;
    }

    setIsSubmittingTrial(true);
    try {
      // 1. Create company with 1 day trial
      const trialEndsAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const newComp = await createCompany({
        name: regCompanyName,
        phone: regPhone,
        plan: 'starter',
        active: true,
        subscriptionStatus: 'trial',
        trialEndsAt: trialEndsAt
      });

      // 2. Create admin user for this company
      const newUser = await createUser({
        name: regName,
        email: regEmail.toLowerCase().trim(),
        password: regPassword,
        role: 'admin',
        companyId: newComp.id,
        active: true
      });

      await success(`🎉 Bem-vindo ao MDTracker! Seu período de 1 dia de testes já está liberado.`);
      setIsTrialModalOpen(false);
      onLoginSuccess(newUser, newComp);
    } catch (err: any) {
      console.error(err);
      await alert(err.message || 'Erro ao criar seu teste gratuito. Tente novamente.');
    } finally {
      setIsSubmittingTrial(false);
    }
  };

  const handleOpenCheckout = () => {
    window.open(checkoutUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* Glow Ambient Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-[120px] pointer-events-none" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-emerald-600/10 blur-[140px] pointer-events-none" />

      {/* ========================================================= */}
      {/* TOPBAR / NAVBAR */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-3 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">MDTracker</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  360° SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Rastreamento CAPI & Funil Visual</p>
            </div>
          </a>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a href="#recursos" className="hover:text-white transition">Recursos</a>
            <a href="#funil-360" className="hover:text-white transition flex items-center gap-1.5">
              <span>Funil Visual</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-slate-950">NOVO</span>
            </a>
            <a href="#comparativo" className="hover:text-white transition">Comparativo</a>
            <a href="#planos" className="hover:text-white transition">Planos & Assinaturas</a>
            <a href="#depoimentos" className="hover:text-white transition">Clientes</a>
            <a href="#faq" className="hover:text-white transition">Dúvidas</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenLogin}
              className="text-xs font-bold text-slate-300 hover:text-white px-3 py-2 rounded-xl hover:bg-slate-900 transition flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Entrar na Conta</span>
            </button>

            <button
              onClick={() => setIsTrialModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Testar 1 Dia Grátis</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================= */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 relative text-center">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider shadow-sm animate-pulse">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>LANÇAMENTO OFICIAL: VERSÃO 360° POWER UP COM FUNIL VISUAL</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-[1.15] max-w-4xl mx-auto">
            Pare de Queimar Dinheiro em Anúncios Cegos. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">
              Domine do Primeiro Clique até a Venda no WhatsApp.
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-sm sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
            A única plataforma tudo-em-um que substitui <strong>RD Station, Manychat e Timtim</strong>. Combine <strong>Rastreamento CAPI de Alta Precisão</strong> (Meta + Google), <strong>Funil Visual 360° interativo</strong> e <strong>Automações Omnicanal com redistribuição inteligente para eventos</strong> em uma só tela.
          </p>

          {/* CTAs */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => setIsTrialModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm sm:text-base shadow-2xl shadow-blue-600/40 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5 text-amber-300" />
              <span>Começar Teste de 1 Dia Grátis</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleOpenCheckout}
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-sm sm:text-base transition flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Fazer Assinatura Mensal (Hotmart)</span>
            </button>
          </div>

          {/* Trust Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Sem Cartão de Crédito no Teste</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>CAPI Servidor Blindado Anti-iOS 14</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Instalação em Menos de 5 Minutos</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE FUNNEL VISUAL SHOWCASE MOCKUP */}
        {/* ========================================================= */}
        <div className="max-w-6xl mx-auto mt-14 sm:mt-20 rounded-3xl border border-slate-800 bg-slate-900/80 p-2 sm:p-4 shadow-2xl shadow-blue-950/50 backdrop-blur-xl relative" id="funil-360">
          <div className="rounded-2xl border border-slate-800/80 bg-[#070A11] p-4 sm:p-6 overflow-hidden">
            
            {/* Mockup Header Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-slate-400 hidden sm:inline">MDTracker Funil Visual 360° • Power UP Live</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold text-[11px] border border-blue-500/30">
                  Fluxo Ativo • Meta Ads ➔ WhatsApp
                </span>
              </div>
            </div>

            {/* Mockup Funnel Flow Diagram */}
            <div className="py-8 grid grid-cols-1 sm:grid-cols-4 gap-4 text-left relative">
              {/* Step 1: Ads */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative group hover:border-blue-500 transition">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <h4 className="font-bold text-sm text-white">Anúncio Meta / Google</h4>
                <p className="text-[11px] text-slate-400">Captura de UTMs, IP, User-Agent e FBP/FBC na origem.</p>
                <div className="pt-2 text-xs font-mono text-emerald-400 font-bold">12.450 Cliques</div>
              </div>

              {/* Step 2: Landing Page / Popup */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative group hover:border-indigo-500 transition">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h4 className="font-bold text-sm text-white">Página / Pop-up Seguro</h4>
                <p className="text-[11px] text-slate-400">Identificação obrigatória com nome e WhatsApp.</p>
                <div className="pt-2 text-xs font-mono text-emerald-400 font-bold">3.820 Leads (30.6%)</div>
              </div>

              {/* Step 3: WhatsApp CAPI */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative group hover:border-emerald-500 transition">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <h4 className="font-bold text-sm text-white">WhatsApp & CAPI Servidor</h4>
                <p className="text-[11px] text-slate-400">Disparo automático de conversão para o Meta Pixel.</p>
                <div className="pt-2 text-xs font-mono text-emerald-400 font-bold">100% Atribuído</div>
              </div>

              {/* Step 4: CRM & Automação */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative group hover:border-purple-500 transition">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                  04
                </div>
                <h4 className="font-bold text-sm text-white">Venda Fechada & CRM</h4>
                <p className="text-[11px] text-slate-400">Régua temporal para webinários e discador VoIP.</p>
                <div className="pt-2 text-xs font-mono text-emerald-400 font-bold">R$ 84.600 Vendas</div>
              </div>
            </div>

            {/* Bottom Metrics Bar */}
            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Total de Leads</span>
                <p className="text-xl font-black text-white mt-0.5">3.820</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Investimento</span>
                <p className="text-xl font-black text-blue-400 mt-0.5">R$ 6.200,00</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Custo Médio / Lead</span>
                <p className="text-xl font-black text-emerald-400 mt-0.5">R$ 1,62</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Receita Gerada</span>
                <p className="text-xl font-black text-emerald-400 mt-0.5">R$ 84.600,00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* THE FRAGMENTATION PROBLEM SECTION */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-800 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-red-400 bg-red-500/10 px-3.5 py-1.5 rounded-full border border-red-500/20">
              O Fim do Dinheiro Queimado
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Você Está Pagando a "Taxa da Fragmentação"?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Manter ferramentas isoladas custa uma fortuna todo mês e cria gargalos onde você perde leads sem nem saber por quê.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* The Old Way */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-red-500/30 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg text-red-400 flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span>O Modo Antigo (Desconectado)</span>
                </h3>
                <span className="text-xs font-bold text-red-400 font-mono">~R$ 1.300/mês</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><strong>RD Station:</strong> R$ 450/mês (cobra mais a cada novo contato cadastrado).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><strong>Manychat:</strong> $65 USD (~R$ 360/mês), sem atribuição de anúncios.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><strong>Timtim / Redirecionador:</strong> R$ 197/mês, apenas redireciona sem CRM.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><strong>Ferramentas de Funil / Popups:</strong> R$ 150/mês adicionais.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span><strong>Resultado:</strong> Dados que não batem, atrasos em webinários e perda de dados com o iOS 14.5.</span>
                </li>
              </ul>
            </div>

            {/* The MDTracker Way */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-indigo-950 border-2 border-blue-500/80 shadow-2xl space-y-5 relative">
              <span className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black rounded-full uppercase tracking-wider shadow">
                SOLUÇÃO 100% INTEGRADA
              </span>
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Com o MDTracker 360°</span>
                </h3>
                <span className="text-xs font-bold text-emerald-400 font-mono">A partir de R$ 147/mês</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-200">
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Tudo Unificado:</strong> CAPI Meta & Google, WhatsApp, Funil 360°, E-mail e CRM.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Sem Trava por Contatos:</strong> Escalone sua lista sem ter surpresas na fatura.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Redistribuição para Webinários:</strong> Nutrição automática mesmo para cadastros de última hora.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span><strong>Economia Real:</strong> Economize mais de R$ 1.000 todo mês em softwares.</span>
                </li>
              </ul>
              <button
                onClick={() => setIsTrialModalOpen(true)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-md"
              >
                Testar 1 Dia Grátis Agora
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* COMPLETE FEATURES GRID */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6" id="recursos">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/20">
              Ecossistema Completo
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Tudo o que sua Operação Precisa para Vender Mais
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Construído de ponta a ponta para gestores de tráfego, agências, infoprodutores e times comerciais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feat 1: CAPI */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition group space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Rastreamento CAPI Cirúrgico</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Blindagem contra as perdas do iOS 14.5. Envie eventos do primeiro clique, do formulário e da compra diretamente para a API de Conversões do Meta e Google Ads.
              </p>
            </div>

            {/* Feat 2: Funnel 360 */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition group space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Funil Visual 360° (Power UP)</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Desenhe seu funil em um canvas visual em tempo real. Veja a taxa de conversão entre cada etapa, custo por lead (CPL) e faturamento gerado em cada anúncio.
              </p>
            </div>

            {/* Feat 3: Automation Webinar */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition group space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Redistribuição para Webinários</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Configure a data do seu evento. Se o lead entrar faltando 5 dias ou 20 minutos, o MDTracker redistribui as mensagens no tempo restante para ninguém ficar de fora.
              </p>
            </div>

            {/* Feat 4: Secure Popup */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition group space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Pop-ups com Selos Oficiais</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Captura obrigatória de Nome e WhatsApp com selos de segurança e conformidade LGPD antes de abrir o chat, gerando leads qualificados no seu CRM.
              </p>
            </div>

            {/* Feat 5: Cloud Cron Engine */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition group space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Motor Autônomo 24/7 (Cron)</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Seus disparos de e-mail e mensagens de WhatsApp rodam em segundo plano nos servidores de nuvem, sem exigir computador ou abas abertas.
              </p>
            </div>

            {/* Feat 6: Virtual Phone */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 transition group space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">Discador VoIP & Call Center</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Ligue para seus leads com 1 clique direto pelo navegador, grave ligações e distribua atendimentos em fila round-robin entre seus vendedores.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* COMPARISON TABLE: MDTracker vs Competitors */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-900/50 border-t border-slate-800 px-4 sm:px-6" id="comparativo">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
              Lado a Lado
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Por que o MDTracker Vence RD Station, Manychat e Timtim?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Veja por que os maiores players de tráfego direto e lançamentos abandonaram ferramentas caras para migrar para o MDTracker 360°.
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[760px] text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400">
                    <th className="p-5 w-2/5">Recursos & Funcionalidades</th>
                    <th className="p-5 w-1/4 bg-blue-600/20 text-blue-300 border-x-2 border-blue-500 text-center relative">
                      <span className="inline-block bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full mb-1">
                        RECOMENDADO
                      </span>
                      <div className="font-black text-sm text-white">MDTracker 360°</div>
                    </th>
                    <th className="p-5 text-center text-slate-400">RD Station</th>
                    <th className="p-5 text-center text-slate-400">Manychat</th>
                    <th className="p-5 text-center text-slate-400">Timtim</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {[
                    {
                      feat: 'Rastreamento CAPI no WhatsApp & Checkout (Meta + Google)',
                      md: '✅ Nativo com atribuição de primeiro e último clique',
                      rd: '❌ Apenas formulário de site (Cego no WhatsApp)',
                      mc: '❌ Sem atribuição de campanha ou anúncio',
                      tt: '⚠️ CAPI simplificada, sem CRM nem automação',
                      highlight: true
                    },
                    {
                      feat: 'Funil Visual 360° Interativo (Estilo Power UP)',
                      md: '✅ Canvas drag-and-drop com métricas ao vivo',
                      rd: '❌ Apenas funil estático em barras',
                      mc: '❌ Fluxo de mensagens isolado do tráfego',
                      tt: '❌ Não possui funil visual',
                      highlight: true
                    },
                    {
                      feat: 'Sequência com Prazo Limite (Eventos/Webinários)',
                      md: '✅ Redistribuição automática no tempo restante',
                      rd: '❌ Disparo por dias fixos (perde inscrições tardias)',
                      mc: '❌ Travado na janela de 24h sem cálculo temporal',
                      tt: '❌ Não tem disparador nem régua de follow-up',
                      highlight: true
                    },
                    {
                      feat: 'Pop-up Inteligente com Selos de Redirecionamento Seguro',
                      md: '✅ Captura Nome + WhatsApp com selos oficiais e UTM',
                      rd: '❌ Popups tradicionais de newsletter',
                      mc: '❌ Não possui',
                      tt: '⚠️ Formulário básico sem selos de garantia',
                      highlight: false
                    },
                    {
                      feat: 'Motor Autônomo em Background (Cron no Servidor)',
                      md: '✅ Dispara na hora exata sem tela aberta',
                      rd: '⚠️ Apenas para e-mail (WhatsApp exige add-ons caros)',
                      mc: '⚠️ Depende da janela do Meta e custos extras',
                      tt: '❌ Não possui motor de envio',
                      highlight: false
                    },
                    {
                      feat: 'Call Center & Discador Virtual VoIP Integrado',
                      md: '✅ Discador Web com gravação e round-robin',
                      rd: '❌ Requer contratar Zenvia/Meetime à parte',
                      mc: '❌ Não possui',
                      tt: '❌ Não possui',
                      highlight: false
                    },
                    {
                      feat: 'Modelo de Cobrança & Limite de Contatos',
                      md: '🟢 Acesso Unificado Ilimitado (Sem taxas abusivas)',
                      rd: '🔴 R$ 450 a R$ 1.500/mês (aumenta por contato)',
                      mc: '🔴 Cobrado em Dólar ($$$) conforme a base sobe',
                      tt: '🔴 Cobrado por plano ou volume de cliques',
                      highlight: true
                    }
                  ].map((row, idx) => (
                    <tr key={idx} className={row.highlight ? 'bg-blue-950/20' : 'hover:bg-slate-800/40'}>
                      <td className="p-4 sm:p-5 font-bold text-slate-200">
                        {row.feat}
                      </td>
                      <td className="p-4 sm:p-5 bg-blue-600/10 border-x-2 border-blue-500 font-bold text-blue-200 text-center">
                        {row.md}
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-400">
                        {row.rd}
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-400">
                        {row.mc}
                      </td>
                      <td className="p-4 sm:p-5 text-center text-slate-400">
                        {row.tt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* PRICING & SUBSCRIPTION PLANS SECTION */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6" id="planos">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/20">
              Assinaturas Oficiais
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Escolha o Plano Ideal para seu Negócio
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Assine com garantia incondicional de 7 dias via Hotmart ou teste grátis por 1 dia sem cartão.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Plan 1: Starter */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold text-xl text-white">Starter Tracker</h3>
                <p className="text-xs text-slate-400">Para quem quer parar de queimar dinheiro em anúncios e rastrear CAPI com precisão.</p>
                <div className="pt-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">R$ 147</span>
                  <span className="text-xs text-slate-400">/mês</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Rastreamento CAPI Meta & Google Ads</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Pop-ups de Redirecionamento Seguro</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Gestão de Links com UTMs</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> CRM de Vendas Integrado</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Suporte via WhatsApp</li>
                </ul>
              </div>
              <div className="space-y-2 pt-4">
                <button
                  onClick={handleOpenCheckout}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition"
                >
                  Assinar na Hotmart ⚡
                </button>
                <button
                  onClick={() => setIsTrialModalOpen(true)}
                  className="w-full text-center text-xs text-slate-400 hover:text-white transition py-1 block"
                >
                  Ou Testar 1 Dia Grátis →
                </button>
              </div>
            </div>

            {/* Plan 2: Pro Growth (Featured) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-blue-950 via-slate-900 to-indigo-950 border-2 border-blue-500 shadow-2xl flex flex-col justify-between space-y-6 relative scale-105">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black rounded-full uppercase tracking-wider shadow-lg">
                MAIS ESCOLHIDO (COMPLETO)
              </span>
              <div className="space-y-4 pt-2">
                <h3 className="font-black text-2xl text-white">Pro Growth 360°</h3>
                <p className="text-xs text-blue-200">A máquina completa de funil visual, automações temporais e discador VoIP.</p>
                <div className="pt-2">
                  <span className="text-4xl sm:text-5xl font-black text-white">R$ 297</span>
                  <span className="text-xs text-slate-400">/mês</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-200 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> <strong>Tudo do Starter +</strong></li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> <strong>Funil Visual 360° Estilo Power UP</strong></li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> <strong>Redistribuição para Webinários & Eventos</strong></li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Motor Background Cron 24/7 sem navegador</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Discador Virtual VoIP & Call Center</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Pesquisas & Quiz Interativo</li>
                </ul>
              </div>
              <div className="space-y-2 pt-4">
                <button
                  onClick={handleOpenCheckout}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-0.5"
                >
                  Garantir Plano Pro na Hotmart ⚡
                </button>
                <button
                  onClick={() => setIsTrialModalOpen(true)}
                  className="w-full text-center text-xs text-blue-300 hover:text-white font-semibold transition py-1 block"
                >
                  Liberar 1 Dia de Teste Gratuito →
                </button>
              </div>
            </div>

            {/* Plan 3: Agency */}
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-bold text-xl text-white">Agency & Scale</h3>
                <p className="text-xs text-slate-400">Para agências, co-produções e empresas com múltiplos times comerciais.</p>
                <div className="pt-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">R$ 597</span>
                  <span className="text-xs text-slate-400">/mês</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> <strong>Tudo do Pro Growth +</strong></li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Multi-Empresas e Sub-contas</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Atendentes e Filas Ilimitadas</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Domínios Personalizados Ilimitados</li>
                  <li className="flex items-center gap-2"><span className="text-emerald-400 font-bold">✓</span> Onboarding VIP com Especialista</li>
                </ul>
              </div>
              <div className="space-y-2 pt-4">
                <button
                  onClick={handleOpenCheckout}
                  className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition"
                >
                  Contratar Agency na Hotmart ⚡
                </button>
                <button
                  onClick={() => setIsTrialModalOpen(true)}
                  className="w-full text-center text-xs text-slate-400 hover:text-white transition py-1 block"
                >
                  Ou Testar 1 Dia Grátis →
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* TESTIMONIALS */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-900/40 border-t border-slate-800 px-4 sm:px-6" id="depoimentos">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3.5 py-1.5 rounded-full border border-amber-500/20">
              Casos Reais
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              O que Quem Usa o MDTracker Está Dizendo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "Antes a gente usava Timtim pro WhatsApp, Manychat pro Insta e RD pros e-mails. Era uma loucura e os dados nunca batiam. O CAPI do MDTracker reduziu nosso CPA pela metade no primeiro mês!"
              </p>
              <div>
                <strong className="block text-sm text-white">Rodrigo Vasconcelos</strong>
                <span className="text-xs text-slate-400">Head de Tráfego • Agência Escala Digital</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "O recurso de redistribuição para webinário salvou meu último lançamento. Quem entrava 1 hora antes perdia toda a nutrição nas outras ferramentas. No MDTracker a sala lotou!"
              </p>
              <div>
                <strong className="block text-sm text-white">Camila Fernandes</strong>
                <span className="text-xs text-slate-400">Infoprodutora & Especialista em Lançamentos</span>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "O Funil Visual estilo Power UP deu uma clareza absurda para a diretoria. Ver os blocos com faturamento e taxa de conversão em tempo real transformou nossa operação."
              </p>
              <div>
                <strong className="block text-sm text-white">Lucas Brandão</strong>
                <span className="text-xs text-slate-400">Diretor Comercial • Grupo OmniVendas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FAQ SECTION */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6" id="faq">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/20">
              Tire suas Dúvidas
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Perguntas Frequentes
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'Como funciona o teste de 1 dia grátis?',
                a: 'Você se cadastra em menos de 1 minuto sem precisar informar cartão de crédito. Durante 24 horas, você tem acesso total para testar o sistema, criar seu funil e configurar links. Depois de 1 dia, você pode fazer a assinatura mensal com 1 clique no cabeçalho.'
              },
              {
                q: 'Como a assinatura na Hotmart é ativada?',
                a: 'Após assinar seu plano na Hotmart, nosso Webhook recebe a confirmação em segundos e ativa automaticamente o status da sua empresa, liberando acesso ilimitado sem travas.'
              },
              {
                q: 'O MDTracker substitui mesmo o RD Station, Manychat e Timtim?',
                a: 'Sim! Ele reúne o que há de melhor em cada um: o redirecionamento com selos e CAPI (substitui o Timtim), o fluxo de e-mail e CRM (substitui o RD Station) e a automação de WhatsApp com prazos fixos (substitui o Manychat), além de adicionar o Funil Visual 360° e o Discador VoIP.'
              },
              {
                q: 'Existe fidelidade ou multa de cancelamento?',
                a: 'Nenhuma. Você pode cancelar a qualquer momento diretamente no seu painel da Hotmart sem multas ou pegadinhas.'
              },
              {
                q: 'E se eu não gostar?',
                a: 'Oferecemos garantia incondicional de 7 dias pela Hotmart. Se você achar que a ferramenta não atendeu sua expectativa, basta solicitar o reembolso que 100% do seu dinheiro é devolvido.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-800 rounded-2xl bg-slate-900/60 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-slate-100 flex items-center justify-between gap-4 hover:bg-slate-800/40 transition"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FINAL CTA BANNER */}
      {/* ========================================================= */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-t border-slate-800 px-4 sm:px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-white/10 text-xs font-black uppercase tracking-wider text-white border border-white/20">
            COMECE EM MENOS DE 2 MINUTOS
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white">
            Pronto para Multiplicar o ROI dos seus Anúncios?
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-2xl mx-auto">
            Junte-se a centenas de empresas que trocaram o caos das ferramentas fragmentadas pela clareza do MDTracker 360°.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setIsTrialModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-blue-900 font-black text-sm sm:text-base shadow-2xl hover:bg-slate-100 transition transform hover:-translate-y-0.5"
            >
              Começar Teste de 1 Dia Grátis 🚀
            </button>
            <button
              onClick={handleOpenCheckout}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-950/80 hover:bg-slate-950 border border-white/20 text-white font-bold text-sm sm:text-base transition"
            >
              Fazer Assinatura Mensal (Hotmart)
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}
      <footer className="py-12 bg-slate-950 border-t border-slate-900 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
              W
            </div>
            <div>
              <strong className="text-white block font-bold">MDTracker 360° SaaS</strong>
              <span>© {new Date().getFullYear()} Todos os direitos reservados.</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={onOpenLogin} className="hover:text-white transition">
              Acessar Plataforma (Login)
            </button>
            <button onClick={() => setIsTrialModalOpen(true)} className="hover:text-white transition">
              Criar Teste Gratuito
            </button>
            <a href="#planos" className="hover:text-white transition">
              Planos Hotmart
            </a>
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* MODAL: CADASTRO 1 DIA DE TESTES GRÁTIS */}
      {/* ========================================================= */}
      {isTrialModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-100">
            
            <button
              onClick={() => setIsTrialModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6 space-y-2">
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-wider border border-blue-500/20">
                1 DIA DE TESTES 100% GRÁTIS
              </span>
              <h3 className="text-2xl font-black text-white">Criar Minha Conta no MDTracker</h3>
              <p className="text-xs text-slate-400">
                Preencha os dados abaixo. Você terá acesso imediato sem precisar de cartão de crédito.
              </p>
            </div>

            <form onSubmit={handleRegisterTrial} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Rogério Belmiro"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Nome da sua Empresa / Agência *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Muda Digital Marketing"
                  value={regCompanyName}
                  onChange={(e) => setRegCompanyName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    WhatsApp com DDD *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Seu Melhor E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Crie sua Senha de Acesso *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingTrial}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-blue-500/25 transition disabled:opacity-50"
                >
                  {isSubmittingTrial ? 'Liberando Acesso...' : 'Criar Conta & Entrar no Sistema 🚀'}
                </button>
              </div>

              <p className="text-center text-[11px] text-slate-500 pt-2">
                Ao continuar, você concorda em iniciar seu período de teste de 1 dia sem cobrança.
              </p>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
