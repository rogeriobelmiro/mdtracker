import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Lock, 
  Mail, 
  ShieldCheck, 
  RefreshCw, 
  KeyRound, 
  CheckCircle2, 
  UserCheck, 
  Sparkles, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  UserPlus,
  Users,
  MapPin,
  GraduationCap,
  Copy,
  Check,
  MessageCircle,
  Phone,
  ArrowRight
} from 'lucide-react';
import { User, Company, Affiliate } from '../types';
import { createCompany, createUser, loginUser, registerPublicAffiliate } from '../services/api';

interface LoginScreenProps {
  companies: Company[];
  users: User[];
  initialMode?: 'login' | 'register_company' | 'register_affiliate';
  onLoginSuccess: (user: User, company: Company) => void;
  onBackToSite?: () => void;
}

const BRAZIL_STATES = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' }
];

export const LoginScreen: React.FC<LoginScreenProps> = ({
  companies,
  users,
  initialMode = 'login',
  onLoginSuccess,
  onBackToSite
}) => {
  const safeInitialMode = (initialMode === 'register_company' || initialMode === 'register_affiliate') ? initialMode : 'login';
  const [screenMode, setScreenMode] = useState<'login' | 'register_company' | 'register_affiliate'>(safeInitialMode);

  useEffect(() => {
    const valid = (initialMode === 'register_company' || initialMode === 'register_affiliate') ? initialMode : 'login';
    setScreenMode(valid);
  }, [initialMode]);
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Company State
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regCompanyCnpj, setRegCompanyCnpj] = useState('');
  const [regUserName, setRegUserName] = useState('');
  const [regUserEmail, setRegUserEmail] = useState('');
  const [regUserPassword, setRegUserPassword] = useState('');

  // Register Affiliate State (Com Endereço & Treinamento)
  const [affName, setAffName] = useState('');
  const [affEmail, setAffEmail] = useState('');
  const [affPhone, setAffPhone] = useState('');
  const [affDocument, setAffDocument] = useState('');
  const [affCep, setAffCep] = useState('');
  const [affAddress, setAffAddress] = useState('');
  const [affNeighborhood, setAffNeighborhood] = useState('');
  const [affComplement, setAffComplement] = useState('');
  const [affCity, setAffCity] = useState('');
  const [affState, setAffState] = useState('SP');
  const [affPixKeyType, setAffPixKeyType] = useState<'cpf' | 'cnpj' | 'email' | 'phone' | 'random'>('cpf');
  const [affPixKey, setAffPixKey] = useState('');
  const [loadingCep, setLoadingCep] = useState(false);

  // Success State for Affiliate Registration
  const [affiliateSuccess, setAffiliateSuccess] = useState<{
    affiliate: Affiliate;
    referralLink: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Captcha Math Challenge State
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [authError, setAuthError] = useState('');

  // Generate new math captcha
  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 12) + 1;
    const n2 = Math.floor(Math.random() * 12) + 1;
    setNum1(n1);
    setNum2(n2);
    setCaptchaInput('');
    setCaptchaError(false);
  };

  const switchMode = (mode: 'login' | 'register_company' | 'register_affiliate') => {
    setScreenMode(mode);
    setAuthError('');
    setAffiliateSuccess(null);
    generateCaptcha();
  };

  useEffect(() => {
    generateCaptcha();
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref') || params.get('affiliate') || params.get('rep');
      if (ref) {
        localStorage.setItem('trackermd_ref', ref.trim().toLowerCase());
      }
      if (params.get('cadastro') === 'afiliado' || params.get('tipo') === 'afiliado') {
        setScreenMode('register_affiliate');
      }
    } catch {}
  }, []);

  // Search CEP automatically via ViaCEP
  const handleCepLookup = async (cepValue: string) => {
    const cleanCep = cepValue.replace(/\D/g, '');
    setAffCep(cepValue);
    if (cleanCep.length === 8) {
      setLoadingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          if (data.logradouro) setAffAddress(data.logradouro);
          if (data.bairro) setAffNeighborhood(data.bairro);
          if (data.localidade) setAffCity(data.localidade);
          if (data.uf) setAffState(data.uf);
        }
      } catch (err) {
        console.warn('Erro ao consultar CEP:', err);
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setCaptchaError(false);

    // Validate Math Captcha
    const expectedSum = num1 + num2;
    if (parseInt(captchaInput.trim(), 10) !== expectedSum) {
      setCaptchaError(true);
      generateCaptcha();
      return;
    }

    setIsSubmitting(true);
    try {
      const { user, company } = await loginUser(email, password);
      onLoginSuccess(user, company);
    } catch (err: any) {
      setAuthError(err.message || 'Usuário ou senha incorretos.');
      generateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setCaptchaError(false);

    // Validate Math Captcha
    const expectedSum = num1 + num2;
    if (parseInt(captchaInput.trim(), 10) !== expectedSum) {
      setCaptchaError(true);
      setAuthError('Desafio de segurança incorreto. Digite o resultado correto da soma.');
      generateCaptcha();
      return;
    }

    setIsSubmitting(true);

    try {
      const companyId = `comp-${Date.now()}`;
      const refCode = localStorage.getItem('trackermd_ref') || undefined;
      const newCompany = await createCompany({
        id: companyId,
        name: regCompanyName,
        cnpj: regCompanyCnpj,
        phone: regUserEmail,
        email: regUserEmail,
        plan: 'starter',
        active: true,
        affiliateCode: refCode
      });

      const userId = `usr-${Date.now()}`;
      const newUser = await createUser({
        id: userId,
        companyId: companyId,
        name: regUserName,
        email: regUserEmail,
        password: regUserPassword,
        role: 'admin',
        active: true
      });

      onLoginSuccess(newUser, newCompany);
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Erro ao realizar cadastro');
      generateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterAffiliateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setCaptchaError(false);

    if (!affName.trim() || !affEmail.trim() || !affPhone.trim()) {
      setAuthError('Por favor, preencha seu nome completo, e-mail e telefone/WhatsApp.');
      return;
    }

    // Validate Math Captcha
    const expectedSum = num1 + num2;
    if (parseInt(captchaInput.trim(), 10) !== expectedSum) {
      setCaptchaError(true);
      setAuthError('Desafio de segurança incorreto. Digite o resultado correto da soma.');
      generateCaptcha();
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerPublicAffiliate({
        name: affName.trim(),
        email: affEmail.trim(),
        phone: affPhone.trim(),
        document: affDocument.trim(),
        cep: affCep.trim(),
        address: affAddress.trim(),
        neighborhood: affNeighborhood.trim(),
        complement: affComplement.trim(),
        city: affCity.trim(),
        state: affState.toUpperCase().trim(),
        pixKeyType: affPixKeyType || 'cpf',
        pixKey: affPixKey.trim() || '',
        notes: 'Cadastro com endereço completo para capacitação e treinamento oficial de representantes.'
      });

      setAffiliateSuccess({
        affiliate: res.affiliate,
        referralLink: res.referralLink
      });
    } catch (err: any) {
      setAuthError(err.message || 'Erro ao realizar cadastro de afiliado');
      generateCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (affiliateSuccess?.referralLink) {
      navigator.clipboard.writeText(affiliateSuccess.referralLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-800 z-10 my-6">
        
        {/* LEFT COLUMN: Branding & Info (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white p-8 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/30">
                W
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-tight">TrackerMD</h1>
                <p className="text-[11px] text-blue-300 font-medium">Plataforma de Trackeamento no WhatsApp</p>
              </div>
            </div>

            {screenMode === 'register_affiliate' ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
                    <GraduationCap className="w-4 h-4" />
                    <span>Programa Oficial de Representantes</span>
                  </div>
                  <h2 className="text-xl font-black mb-2 text-white">Capacitação & Link de Afiliado</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Torne-se um representante habilitado TrackerMD em sua cidade. Cadastre seu endereço para receber seu link oficial e suporte para treinar e implantar o sistema nas empresas locais.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                    <GraduationCap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Treinamento Especializado:</strong>
                      Aprenda a configurar Meta CAPI, conectar WhatsApp e treinar atendentes.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                    <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Link Imediato:</strong>
                      Seu link com código de rastreamento é gerado na hora.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-xs text-slate-300 bg-slate-800/40 p-3 rounded-xl border border-slate-700/50">
                    <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white block">Ganhos Duplos via PIX:</strong>
                      20% recorrente mensal + 50% sobre o treinamento de ativação.
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div>
                  <h2 className="text-xl font-bold mb-2 text-white">Ambiente Seguro Multiempresa</h2>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Isolamento total de dados entre organizações. Cada empresa possui seu próprio funil, equipe e chave de rastreamento.
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Proteção por Captcha Matemático para Prevenção de Bots</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-300">
                    <UserCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>Níveis de Acesso: Administrador, Gerente e Atendente</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-300">
                    <Building2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>Troca rápida de organização com credenciais autorizadas</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400">
            TrackerMD © {new Date().getFullYear()} • MudaDigital Tecnologia
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Form (7 cols) */}
        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center bg-white max-h-[90vh] overflow-y-auto">
          <div className="max-w-md mx-auto w-full">
            
            {/* Header Switcher Buttons */}
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {screenMode === 'login' && 'Acessar Sistema'}
                  {screenMode === 'register_company' && 'Cadastrar Empresa'}
                  {screenMode === 'register_affiliate' && 'Cadastro de Afiliado & Representante'}
                </h2>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {onBackToSite && (
                    <button
                      type="button"
                      onClick={onBackToSite}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 transition py-1 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                      ← Site
                    </button>
                  )}
                  {screenMode !== 'login' && (
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg transition"
                    >
                      Entrar
                    </button>
                  )}
                </div>
              </div>

              {/* Navigation Switch Tabs */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    screenMode === 'login' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register_company')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    screenMode === 'register_company' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Nova Empresa (1d)
                </button>
                <button
                  type="button"
                  onClick={() => switchMode('register_affiliate')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                    screenMode === 'register_affiliate' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Seja Afiliado</span>
                </button>
              </div>

              <p className="text-xs text-slate-500">
                {screenMode === 'login' && 'Informe suas credenciais para entrar no painel da empresa.'}
                {screenMode === 'register_company' && 'Cadastre sua empresa e libere 1 dia grátis de acesso imediato.'}
                {screenMode === 'register_affiliate' && 'Cadastre-se com seu endereço para receber o link de comissão e treinamento oficial.'}
              </p>
            </div>

            {authError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* VIEW 1: LOGIN FORM */}
            {/* ========================================================= */}
            {screenMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                    E-mail de Acesso
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seu.email@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-600" />
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Math Captcha Challenge */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Desafio de Segurança (Soma)
                    </span>
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Trocar
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-white font-mono font-black text-sm px-3 py-1.5 rounded-lg select-none tracking-wider">
                      {num1} + {num2} = ?
                    </div>
                    <input
                      type="number"
                      required
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="Resultado"
                      className={`flex-1 bg-white border rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${
                        captchaError ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-4 h-4" />
                  {isSubmitting ? 'Verificando...' : 'Entrar na Empresa'}
                </button>
              </form>
            )}

            {/* ========================================================= */}
            {/* VIEW 2: REGISTER COMPANY FORM */}
            {/* ========================================================= */}
            {screenMode === 'register_company' && (
              <form onSubmit={handleRegisterCompanySubmit} className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-blue-600" /> Dados da Empresa
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Nome da Empresa *</label>
                    <input
                      type="text"
                      required
                      value={regCompanyName}
                      onChange={(e) => setRegCompanyName(e.target.value)}
                      placeholder="Ex: Minha Empresa Digital"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">CNPJ (Opcional)</label>
                    <input
                      type="text"
                      value={regCompanyCnpj}
                      onChange={(e) => setRegCompanyCnpj(e.target.value)}
                      placeholder="00.000.000/0001-00"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3">
                  <h3 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-emerald-600" /> Administrador da Conta
                  </h3>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Seu Nome *</label>
                    <input
                      type="text"
                      required
                      value={regUserName}
                      onChange={(e) => setRegUserName(e.target.value)}
                      placeholder="Ex: Carlos Eduardo"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">E-mail Profissional *</label>
                    <input
                      type="email"
                      required
                      value={regUserEmail}
                      onChange={(e) => setRegUserEmail(e.target.value)}
                      placeholder="carlos@empresa.com"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Senha *</label>
                    <input
                      type="password"
                      required
                      value={regUserPassword}
                      onChange={(e) => setRegUserPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Math Captcha Challenge */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Desafio de Segurança (Captcha de Soma)
                    </span>
                    <button
                      type="button"
                      onClick={generateCaptcha}
                      className="text-[10px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Trocar
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900 text-white font-mono font-black text-sm px-3 py-1.5 rounded-lg select-none tracking-wider">
                      {num1} + {num2} = ?
                    </div>
                    <input
                      type="number"
                      required
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      placeholder="Resultado"
                      className={`flex-1 bg-white border rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${
                        captchaError ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:border-blue-500'
                      }`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  {isSubmitting ? 'Criando Conta...' : 'Finalizar Cadastro da Empresa'}
                </button>
              </form>
            )}

            {/* ========================================================= */}
            {/* VIEW 3: REGISTER AFFILIATE & REPRESENTATIVE */}
            {/* ========================================================= */}
            {screenMode === 'register_affiliate' && (
              <div>
                {affiliateSuccess ? (
                  <div className="space-y-5 text-center animate-in zoom-in-95 duration-200">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-slate-900">
                        🎉 Parabéns, {affiliateSuccess.affiliate.name}!
                      </h3>
                      <p className="text-xs text-slate-600">
                        Seu cadastro de Afiliado e Representante Oficial foi realizado com sucesso!
                      </p>
                    </div>

                    {/* Generated Referral Link Box */}
                    <div className="bg-slate-50 border-2 border-emerald-300 rounded-2xl p-4 text-left space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                        🔗 Seu Link Oficial de Indicação:
                      </span>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={affiliateSuccess.referralLink}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 font-bold select-all"
                        />
                        <button
                          type="button"
                          onClick={handleCopyLink}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-1 shadow-sm"
                        >
                          {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Todas as empresas que se cadastrarem por este link ficam vinculadas a você para repasse de comissões mensais.
                      </p>
                    </div>

                    {/* Next Step: Training */}
                    <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-left space-y-2">
                      <div className="flex items-center gap-2 text-indigo-900 font-black text-xs uppercase">
                        <GraduationCap className="w-4 h-4 text-indigo-600" />
                        <span>Próximo Passo: Agendamento do Treinamento VIP</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Nossa equipe de coordenação entrará em contato pelo seu WhatsApp cadastrado ({affiliateSuccess.affiliate.phone}) para agendar sua sessão de capacitação online.
                      </p>
                      <a
                        href={`https://wa.me/5565981150758?text=${encodeURIComponent(
                          `Olá! Acabei de me cadastrar como afiliado/representante no TrackerMD (${affiliateSuccess.affiliate.name} - ${affiliateSuccess.affiliate.city}/${affiliateSuccess.affiliate.state}) e gostaria de agendar meu treinamento oficial!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Falar com Coordenador no WhatsApp Agora</span>
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => { setScreenMode('login'); setAffiliateSuccess(null); }}
                      className="text-xs font-bold text-blue-600 hover:underline pt-2 block mx-auto"
                    >
                      Ir para a Tela de Login
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterAffiliateSubmit} className="space-y-4">
                    
                    {/* Dados Básicos */}
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-indigo-600" /> Dados Pessoais / Profissionais
                      </h3>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Nome Completo *</label>
                        <input
                          type="text"
                          required
                          value={affName}
                          onChange={(e) => setAffName(e.target.value)}
                          placeholder="Ex: Rogério Belmiro"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none font-semibold"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">WhatsApp / Celular *</label>
                          <input
                            type="text"
                            required
                            value={affPhone}
                            onChange={(e) => setAffPhone(e.target.value)}
                            placeholder="5565981150758"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">CPF ou CNPJ</label>
                          <input
                            type="text"
                            value={affDocument}
                            onChange={(e) => setAffDocument(e.target.value)}
                            placeholder="000.000.000-00"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">E-mail Principal *</label>
                        <input
                          type="email"
                          required
                          value={affEmail}
                          onChange={(e) => setAffEmail(e.target.value)}
                          placeholder="seu.email@exemplo.com.br"
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Endereço Completo do Representante */}
                    <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-indigo-600" /> Endereço de Atuação
                        </h3>
                        {loadingCep && <span className="text-[10px] text-indigo-600 font-bold animate-pulse">Buscando CEP...</span>}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">CEP</label>
                          <input
                            type="text"
                            value={affCep}
                            onChange={(e) => handleCepLookup(e.target.value)}
                            placeholder="00000-000"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none font-mono"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">Logradouro / Rua e Nº</label>
                          <input
                            type="text"
                            value={affAddress}
                            onChange={(e) => setAffAddress(e.target.value)}
                            placeholder="Av. Principal, 1000"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Bairro</label>
                          <input
                            type="text"
                            value={affNeighborhood}
                            onChange={(e) => setAffNeighborhood(e.target.value)}
                            placeholder="Centro"
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Cidade *</label>
                          <input
                            type="text"
                            required
                            value={affCity}
                            onChange={(e) => setAffCity(e.target.value)}
                            placeholder="Cuiabá, SP..."
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Estado (UF) *</label>
                          <select
                            value={affState}
                            onChange={(e) => setAffState(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none font-semibold"
                          >
                            {BRAZIL_STATES.map(s => (
                              <option key={s.uf} value={s.uf}>{s.uf} - {s.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Chave PIX cadastrada dentro do sistema */}
                    <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/60 flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                          Chave PIX para Recebimento de Comissões
                        </h4>
                        <p className="text-[11px] text-emerald-800 leading-relaxed">
                          Por segurança, a sua chave PIX de repasse das comissões mensais (20%) e de treinamento (50%) será configurada diretamente dentro do seu painel interno do sistema após o primeiro acesso.
                        </p>
                      </div>
                    </div>

                    {/* Math Captcha Challenge */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Desafio de Segurança (Captcha de Soma)
                        </span>
                        <button
                          type="button"
                          onClick={generateCaptcha}
                          className="text-[10px] text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-bold"
                        >
                          <RefreshCw className="w-3 h-3" />
                          Trocar
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-900 text-white font-mono font-black text-sm px-3 py-1.5 rounded-lg select-none tracking-wider">
                          {num1} + {num2} = ?
                        </div>
                        <input
                          type="number"
                          required
                          value={captchaInput}
                          onChange={(e) => setCaptchaInput(e.target.value)}
                          placeholder="Resultado"
                          className={`flex-1 bg-white border rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none ${
                            captchaError ? 'border-red-500 ring-2 ring-red-200' : 'border-slate-300 focus:border-emerald-500'
                          }`}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-black py-3.5 px-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                      <GraduationCap className="w-4 h-4" />
                      {isSubmitting ? 'Gerando Link & Cadastrando...' : 'Concluir Cadastro & Liberar Link Oficial 🚀'}
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
