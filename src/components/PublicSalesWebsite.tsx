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
  X,
  Link as LinkIcon,
  Layout,
  ClipboardList,
  Globe,
  Trophy,
  Target,
  Headphones,
  BrainCircuit,
  Bot,
  Instagram,
  ShoppingCart,
  UserPlus,
  GitBranch
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
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'geral' | 'marketing' | 'vendas' | 'gestao'>('all');

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

      await success(`🎉 Bem-vindo ao TrackerMD! Seu período de 1 dia de testes já está liberado.`);
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
                <span className="text-lg font-black tracking-tight text-white">TrackerMD</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  360° SaaS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Rastreamento CAPI & Funil Visual</p>
            </div>
          </a>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#funil-360" className="hover:text-white transition flex items-center gap-1.5">
              <span>Funil Visual</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-slate-950">NOVO</span>
            </a>
            <a href="#sobre-trackermd" className="hover:text-white transition text-blue-400 font-bold">O que é o TrackerMD</a>
            <a href="#recursos" className="hover:text-white transition">Recursos (24)</a>
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
        {/* REAL FUNNEL VISUAL SHOWCASE (PRINT 2 - POWER UP) */}
        {/* ========================================================= */}
        <div className="max-w-6xl mx-auto mt-14 sm:mt-20 rounded-3xl border border-slate-800 bg-slate-900/90 p-2 sm:p-4 shadow-2xl shadow-blue-950/60 backdrop-blur-xl relative group" id="funil-360">
          <div className="rounded-2xl border border-slate-800/80 bg-[#070A11] overflow-hidden shadow-inner relative">
            
            {/* Window Topbar Frame */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-950/90 border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-slate-400 font-semibold text-[11px] hidden sm:inline">
                  TrackerMD Funil Visual 360° • Power UP Live Canvas
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Interface Real do Sistema</span>
                </span>
              </div>
            </div>

            {/* High-Resolution Live Canvas Image (Print 2) */}
            <div className="relative overflow-hidden cursor-pointer" onClick={() => setIsTrialModalOpen(true)}>
              <img
                src="/funnel-showcase.png"
                alt="TrackerMD Funil Visual 360° Power UP Live Canvas"
                className="w-full h-auto object-cover transform group-hover:scale-[1.01] transition duration-500 rounded-b-xl"
                loading="eager"
              />

              {/* Floating Overlay Pill Buttons */}
              <div className="absolute bottom-4 left-4 right-4 hidden sm:flex items-center justify-between pointer-events-none">
                <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs font-semibold px-3 py-1.5 rounded-xl text-slate-200 shadow-lg flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span>Conexões Curvas com Cálculo de Conversão em Tempo Real</span>
                </div>
                <div className="bg-blue-600/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 pointer-events-auto hover:bg-blue-500 transition">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Testar Esse Funil Grátis por 1 Dia →</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* SECTION: SOBRE O TRACKERMD (trackermd.mudadigital.com.br) */}
      {/* ========================================================= */}
      <section className="py-20 md:py-28 px-4 sm:px-6 relative border-t border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950" id="sobre-trackermd">
        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>O QUE É O TRACKERMD • MÁQUINA DE CONVERSÃO 360°</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              A Única Plataforma Tudo-em-Um que Conecta seus Anúncios, WhatsApp e Vendas
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Descubra por que líderes de tráfego, agências e infoprodutores abandonaram 4 ferramentas fragmentadas para unificar suas operações no <strong>TrackerMD 360°</strong>: rastreamento CAPI cirúrgico, funil visual ao vivo, automações inteligentes e discador comercial.
            </p>
          </div>

          {/* Key Stats Bar (como no site oficial trackermd.mudadigital.com.br) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl">
            <div className="text-center space-y-1 border-r border-slate-800/80 last:border-0">
              <div className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                +2.4M
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300">Leads Rastreados & Atribuídos</div>
              <div className="text-[11px] text-slate-500">Com dados CAPI enriquecidos</div>
            </div>

            <div className="text-center space-y-1 border-r border-slate-800/80 last:border-0">
              <div className="text-2xl sm:text-4xl font-black text-emerald-400">
                +47%
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300">Aumento Médio em Conversão</div>
              <div className="text-[11px] text-slate-500">Blindagem contra iOS 14.5</div>
            </div>

            <div className="text-center space-y-1 border-r border-slate-800/80 last:border-0">
              <div className="text-2xl sm:text-4xl font-black text-amber-400">
                R$ 1.250+
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300">Economia Média Mensal</div>
              <div className="text-[11px] text-slate-500">Sem 4 faturas separadas</div>
            </div>

            <div className="text-center space-y-1">
              <div className="text-2xl sm:text-4xl font-black text-purple-400 flex items-center justify-center gap-1">
                <span>4.9</span>
                <span className="text-amber-400 text-xl sm:text-2xl">★</span>
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-300">Nota de Satisfação</div>
              <div className="text-[11px] text-slate-500">Recomendado por gestores</div>
            </div>
          </div>

          {/* 6 Core Functionalities Grid (from trackermd.mudadigital.com.br) */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-400">FUNCIONALIDADES ESSENCIAIS</span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  Tudo o que sua Operação Precisa para Escalar em Uma Só Tela
                </h3>
              </div>
              <p className="text-xs text-slate-400 max-w-sm">
                Desenvolvido para eliminar gargalos e garantir 100% de precisão de dados entre anúncios e vendas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition duration-300 flex flex-col justify-between group shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-black group-hover:scale-110 transition">
                      <Zap className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                      01 • Rastreamento
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-blue-300 transition">
                    Rastreamento CAPI Cirúrgico no WhatsApp
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Blindagem total contra bloqueadores e iOS 14.5. Envie eventos do primeiro clique, do formulário de entrada e do checkout diretamente para a API de Conversões do Meta e Google Ads com dados enriquecidos (FBP, FBC, IP, User-Agent, Nome e WhatsApp).
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center text-[11px] font-semibold text-blue-400 gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Substitui o Timtim com Menor Custo</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition duration-300 flex flex-col justify-between group shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black group-hover:scale-110 transition">
                      <Layers className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      02 • Canvas Visual
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-indigo-300 transition">
                    Funil Visual 360° Interativo (Estilo Power UP)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Mapeie toda a jornada do seu cliente em um canvas visual em tempo real. Conecte anúncios, páginas de vendas, pop-ups e links de WhatsApp, acompanhando taxas de conversão, CPL e faturamento gerado em cada anúncio.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center text-[11px] font-semibold text-indigo-400 gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Clareza Total de Toda a Operação</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition duration-300 flex flex-col justify-between group shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-black group-hover:scale-110 transition">
                      <Clock className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                      03 • Automação
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
                    Automação com Prazos & Redistribuição
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Ideal para webinários e lançamentos: defina a data limite do evento. Se o lead entrar 5 dias antes ou 20 minutos antes, o sistema recalcula e redistribui as mensagens automaticamente no tempo que resta para que ninguém fique de fora.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center text-[11px] font-semibold text-emerald-400 gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Salas Cheias e Zero Leads Perdidos</span>
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition duration-300 flex flex-col justify-between group shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-black group-hover:scale-110 transition">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                      04 • Conversão
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-amber-300 transition">
                    Pop-up de Redirecionamento Seguro com Selos
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Captura obrigatória de Nome e WhatsApp antes de direcionar o lead para o chat oficial, com selos de segurança, verificação e identificação que qualificam o contato e aumentam em até 3x a taxa de resposta dos atendentes.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center text-[11px] font-semibold text-amber-400 gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Leads Salvos Direto no CRM</span>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-900 transition duration-300 flex flex-col justify-between group shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-black group-hover:scale-110 transition">
                      <Send className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                      05 • Nuvem 24/7
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-purple-300 transition">
                    Motor Autônomo em Segundo Plano (Cron)
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Seus e-mails e mensagens de WhatsApp são disparados pontualmente pela nossa infraestrutura de servidores em nuvem, sem depender de deixar nenhuma aba ou computador ligado. Totalmente independente e resiliente.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center text-[11px] font-semibold text-purple-400 gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Funciona 24 Horas sem Computador Aberto</span>
                </div>
              </div>

              {/* Feature 6 */}
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 hover:bg-slate-900 transition duration-300 flex flex-col justify-between group shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-black group-hover:scale-110 transition">
                      <PhoneCall className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                      06 • Call Center
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-teal-300 transition">
                    Discador Virtual VoIP & Call Center Integrado
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    Ligue para os leads diretamente pelo navegador com 1 clique, grave as chamadas comerciais e distribua novas oportunidades automaticamente em fila round-robin entre seus vendedores com métricas de tempo e ligação.
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center text-[11px] font-semibold text-teal-400 gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Atendimento Ativo de Alta Eficiência</span>
                </div>
              </div>

            </div>
          </div>

          {/* Pillars of Confidence & Direct Action */}
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-500/30 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                GARANTIA INCONDICIONAL DE 7 DIAS
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Pronto para Testar o TrackerMD na Prática?
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Você pode começar hoje mesmo com <strong>1 dia de teste 100% gratuito</strong> ou assinar diretamente pelo Hotmart com cancelamento a qualquer momento.
              </p>
              
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-300 font-medium">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Ativação Imediata</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sem Fidelidade</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Suporte VIP 1 a 1</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={() => setIsTrialModalOpen(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-blue-600/30 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Testar 1 Dia Grátis</span>
              </button>

              <button
                onClick={handleOpenCheckout}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Assinar no Hotmart</span>
              </button>
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

            {/* The TrackerMD Way */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-950/80 via-slate-900 to-indigo-950 border-2 border-blue-500/80 shadow-2xl space-y-5 relative">
              <span className="absolute -top-3.5 right-6 px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-black rounded-full uppercase tracking-wider shadow">
                SOLUÇÃO 100% INTEGRADA
              </span>
              <div className="flex items-center justify-between">
                <h3 className="font-black text-lg text-white flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span>Com o TrackerMD 360°</span>
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
      {/* COMPLETE FEATURES GRID - ALL 24 MENU MODULES */}
      {/* ========================================================= */}
      <section className="py-20 px-4 sm:px-6" id="recursos">
        <div className="max-w-7xl mx-auto space-y-10">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3.5 py-1.5 rounded-full border border-blue-500/20">
              ECOSSISTEMA COMPLETO 360°
            </span>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
              Tudo o que sua Operação Precisa para Vender Mais
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Construído de ponta a ponta para gestores de tráfego, agências, infoprodutores e times comerciais. Conheça cada um dos <strong>24 módulos integrados</strong> do sistema:
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center justify-center gap-2 flex-wrap pb-2">
            {[
              { id: 'all', label: 'Todas as Funcionalidades (24)' },
              { id: 'geral', label: 'Visão Geral & Funil (2)' },
              { id: 'marketing', label: 'Atração & Marketing (8)' },
              { id: 'vendas', label: 'Vendas & Atendimento (10)' },
              { id: 'gestao', label: 'Configurações & Gestão (4)' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[
              // 1. Visão Geral & Funil
              {
                id: 'dashboard',
                category: 'geral',
                title: 'Dashboard de Métricas',
                icon: BarChart3,
                iconColor: 'text-blue-400 bg-blue-500/10',
                badge: 'Métricas Reais',
                badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                description: 'Painel executivo com gráficos em tempo real de visitantes, conversões, ROI, faturamento e custo por lead (CPL).'
              },
              {
                id: 'visual_funnels',
                category: 'geral',
                title: 'Funil Visual 360°',
                icon: GitBranch,
                iconColor: 'text-purple-400 bg-purple-500/10',
                badge: 'Power UP ⚡',
                badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                description: 'Canvas drag-and-drop para desenhar a jornada completa do anúncio até o checkout, com taxas de conversão por etapa ao vivo.'
              },

              // 2. Atração & Marketing
              {
                id: 'links',
                category: 'marketing',
                title: 'Gerador de Links UTM',
                icon: LinkIcon,
                iconColor: 'text-blue-400 bg-blue-500/10',
                badge: 'Rastreio Total',
                badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                description: 'Links inteligentes para WhatsApp com parâmetros UTM automáticos, proteção cloaker anti-bloqueio e rotação de atendentes.'
              },
              {
                id: 'landing_pages',
                category: 'marketing',
                title: 'Landing Pages Integradas',
                icon: Layout,
                iconColor: 'text-indigo-400 bg-indigo-500/10',
                badge: 'RD Style',
                badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                description: 'Crie páginas de captura, vendas e obrigado de alta conversão sem programar, com formulários conectados diretamente ao WhatsApp e CRM.'
              },
              {
                id: 'surveys',
                category: 'marketing',
                title: 'Pesquisas & NPS (Quiz)',
                icon: ClipboardList,
                iconColor: 'text-purple-400 bg-purple-500/10',
                badge: 'Qualificação',
                badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                description: 'Formulários dinâmicos e quizzes para qualificar o perfil do lead e disparar mensagens automáticas com base nas respostas.'
              },
              {
                id: 'custom_domains',
                category: 'marketing',
                title: 'Domínios Próprios & DNS',
                icon: Globe,
                iconColor: 'text-emerald-400 bg-emerald-500/10',
                badge: 'SSL Grátis',
                badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                description: 'Conecte seus próprios domínios e subdomínios com certificado SSL automático para blindar suas páginas e links contra bloqueios.'
              },
              {
                id: 'event_gamification',
                category: 'marketing',
                title: 'Eventos & Gamificação',
                icon: Trophy,
                iconColor: 'text-amber-400 bg-amber-500/10',
                badge: 'Telão 🎮',
                badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                description: 'Gamificação para eventos presenciais ou lançamentos com telão ao vivo, placar de vendas em tempo real e ranking de engajamento.'
              },
              {
                id: 'popups',
                category: 'marketing',
                title: 'Pop-ups com Selos Oficiais',
                icon: Sliders,
                iconColor: 'text-blue-400 bg-blue-500/10',
                badge: 'Redirecionamento Seguro',
                badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                description: 'Pop-ups inteligentes com identificação obrigatória de Nome e WhatsApp, selos de conformidade LGPD e recuperação de saída da página.'
              },
              {
                id: 'workflows',
                category: 'marketing',
                title: 'Automações de Workflows',
                icon: GitBranch,
                iconColor: 'text-purple-400 bg-purple-500/10',
                badge: 'Webinários & Prazos',
                badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                description: 'Régua de mensagens omnicanal com redistribuição inteligente no tempo restante para webinários e eventos, sem deixar ninguém de fora.'
              },
              {
                id: 'ai',
                category: 'marketing',
                title: 'Assistente IA Copywriter',
                icon: Sparkles,
                iconColor: 'text-amber-400 bg-amber-500/10',
                badge: 'IA Integrada',
                badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                description: 'Gere copys persuasivas de alta conversão para anúncios do Meta/Google, roteiros de abordagem no WhatsApp e sequências de e-mail.'
              },

              // 3. Vendas & Atendimento
              {
                id: 'leads',
                category: 'vendas',
                title: 'Gestão de Leads (CRM Kanban)',
                icon: Users,
                iconColor: 'text-blue-400 bg-blue-500/10',
                badge: 'Funil Comercial',
                badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                description: 'Pipeline visual de vendas com histórico completo do lead, dados de UTMs, tags, anotações e movimentação rápida entre estágios de compra.'
              },
              {
                id: 'smart_lists',
                category: 'vendas',
                title: 'Listas & Lead Scoring',
                icon: Target,
                iconColor: 'text-purple-400 bg-purple-500/10',
                badge: 'IA Scoring 🎯',
                badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                description: 'Pontuação preditiva automática por IA para priorizar leads com maior probabilidade de compra imediata para seus vendedores.'
              },
              {
                id: 'virtual_phone',
                category: 'vendas',
                title: 'Telefone Virtual & VoIP',
                icon: PhoneCall,
                iconColor: 'text-emerald-400 bg-emerald-500/10',
                badge: 'WebRTC Direto',
                badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                description: 'Faça e receba ligações comerciais com 1 clique direto pelo navegador, com gravação automática de chamadas e registro no CRM.'
              },
              {
                id: 'teams',
                category: 'vendas',
                title: 'Equipes & Filas de Vendas',
                icon: Headphones,
                iconColor: 'text-blue-400 bg-blue-500/10',
                badge: 'Multi-Atendimento',
                badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                description: 'Distribuição automática e balanceada de novos leads em fila round-robin entre atendentes, corretores e consultores comerciais.'
              },
              {
                id: 'supervisor_monitor',
                category: 'vendas',
                title: 'Torre de Supervisão',
                icon: ShieldCheck,
                iconColor: 'text-indigo-400 bg-indigo-500/10',
                badge: 'Ao Vivo 🔴',
                badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                description: 'Painel em tempo real para gestores monitorarem o status de cada operador (em chamada, disponível, pausa), tempo de resposta e conversões.'
              },
              {
                id: 'ai_agents',
                category: 'vendas',
                title: 'Agentes de IA Autônomos',
                icon: BrainCircuit,
                iconColor: 'text-amber-400 bg-amber-500/10',
                badge: 'Autônomos 🧠',
                badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                description: 'Crie colaboradores virtuais inteligentes capazes de realizar prospecção, qualificar leads e interagir 24 horas por dia com autonomia.'
              },
              {
                id: 'chatbot',
                category: 'vendas',
                title: 'Chatbot com IA',
                icon: Bot,
                iconColor: 'text-purple-400 bg-purple-500/10',
                badge: 'WhatsApp & Direct',
                badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                description: 'Atendimento instantâneo com inteligência artificial para responder dúvidas de produtos, contornar objeções e agendar reuniões.'
              },
              {
                id: 'instagram_auto_dm',
                category: 'vendas',
                title: 'Auto-DM Instagram',
                icon: Instagram,
                iconColor: 'text-rose-400 bg-rose-500/10',
                badge: 'Manychat Style',
                badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                description: 'Dispare mensagens no Direct e links de vendas automaticamente para quem comentar palavras-chave nos seus posts, reels e stories.'
              },
              {
                id: 'chat',
                category: 'vendas',
                title: 'Chat ao Vivo (Inbox)',
                icon: MessageSquare,
                iconColor: 'text-emerald-400 bg-emerald-500/10',
                badge: 'Central Unificada',
                badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                description: 'Central única de atendimento humano no WhatsApp oficial para sua equipe conversar, enviar mídias e registrar vendas sem conflitos.'
              },
              {
                id: 'broadcast',
                category: 'vendas',
                title: 'Campanhas & Lançamentos',
                icon: Send,
                iconColor: 'text-purple-400 bg-purple-500/10',
                badge: 'Broadcast 24/7',
                badgeStyle: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                description: 'Disparos em massa de mensagens e avisos no WhatsApp, E-mail e SMS com motor autônomo cron rodando em nuvem sem travas.'
              },

              // 4. Configurações & Gestão
              {
                id: 'products',
                category: 'gestao',
                title: 'Produtos & Catálogo',
                icon: ShoppingCart,
                iconColor: 'text-blue-400 bg-blue-500/10',
                badge: 'Checkouts',
                badgeStyle: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                description: 'Cadastre produtos, ofertas e links de checkout da Hotmart, Kiwify ou Eduzz para acompanhar ticket médio e atribuição de vendas.'
              },
              {
                id: 'events',
                category: 'gestao',
                title: 'Integrações & CAPI Servidor',
                icon: Zap,
                iconColor: 'text-amber-400 bg-amber-500/10',
                badge: 'Meta & Google',
                badgeStyle: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                description: 'Central de API de Conversões do Meta (CAPI), Google Ads, TikTok Pixel, servidor SMTP próprio e webhooks globais.'
              },
              {
                id: 'users',
                category: 'gestao',
                title: 'Usuários & Permissões',
                icon: UserPlus,
                iconColor: 'text-indigo-400 bg-indigo-500/10',
                badge: 'Controle de Acesso',
                badgeStyle: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
                description: 'Gerencie logins com controle por nível: Administrador, Gerente, Atendente e Operador de Call Center com segurança total.'
              },
              {
                id: 'company',
                category: 'gestao',
                title: 'Minha Empresa (Multi-tenant)',
                icon: Building2,
                iconColor: 'text-emerald-400 bg-emerald-500/10',
                badge: 'Isolamento 100%',
                badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
                description: 'Isolamento rigoroso de dados entre empresas, personalização de marca, logotipo, telefone e endereço comercial da sua organização.'
              }
            ]
              .filter(m => selectedCategory === 'all' || m.category === selectedCategory)
              .map((mod) => {
                const Icon = mod.icon;
                return (
                  <div
                    key={mod.id}
                    className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-900 transition flex flex-col justify-between space-y-4 group shadow-md"
                  >
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold shadow-xs ${mod.iconColor}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${mod.badgeStyle}`}>
                          {mod.badge}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-base font-black text-white group-hover:text-blue-300 transition">
                          {mod.title}
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mt-1.5">
                          {mod.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold capitalize text-slate-400">
                        {mod.category === 'geral' ? 'Visão Geral' : mod.category === 'marketing' ? 'Atração' : mod.category === 'vendas' ? 'Vendas & CRM' : 'Configurações'}
                      </span>
                      <button
                        onClick={() => setIsTrialModalOpen(true)}
                        className="text-blue-400 hover:text-blue-300 font-bold transition flex items-center gap-1"
                      >
                        <span>Testar Módulo</span>
                        <span>→</span>
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Bottom Callout in Features Section */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1">
              <h4 className="font-black text-lg text-white">Todos os 24 Módulos Inclusos na Sua Assinatura</h4>
              <p className="text-xs sm:text-sm text-slate-300">Sem cobrança surpresa por novos módulos ou contatos adicionais na base.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => setIsTrialModalOpen(true)}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition transform hover:scale-105"
              >
                Liberar Teste de 1 Dia Grátis ⚡
              </button>
              <button
                onClick={handleOpenCheckout}
                className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
              >
                Ver Planos
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* COMPARISON TABLE: TrackerMD vs Competitors */}
      {/* ========================================================= */}
      <section className="py-20 bg-slate-900/50 border-t border-slate-800 px-4 sm:px-6" id="comparativo">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1.5 rounded-full border border-emerald-500/20">
              Lado a Lado
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Por que o TrackerMD Vence RD Station, Manychat e Timtim?
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Veja por que os maiores players de tráfego direto e lançamentos abandonaram ferramentas caras para migrar para o TrackerMD 360°.
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
                      <div className="font-black text-sm text-white">TrackerMD 360°</div>
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
              O que Quem Usa o TrackerMD Está Dizendo
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 italic leading-relaxed">
                "Antes a gente usava Timtim pro WhatsApp, Manychat pro Insta e RD pros e-mails. Era uma loucura e os dados nunca batiam. O CAPI do TrackerMD reduziu nosso CPA pela metade no primeiro mês!"
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
                "O recurso de redistribuição para webinário salvou meu último lançamento. Quem entrava 1 hora antes perdia toda a nutrição nas outras ferramentas. No TrackerMD a sala lotou!"
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
                q: 'O TrackerMD substitui mesmo o RD Station, Manychat e Timtim?',
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
            Junte-se a centenas de empresas que trocaram o caos das ferramentas fragmentadas pela clareza do TrackerMD 360°.
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
              <strong className="text-white block font-bold">TrackerMD 360° SaaS</strong>
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
              <h3 className="text-2xl font-black text-white">Criar Minha Conta no TrackerMD</h3>
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

