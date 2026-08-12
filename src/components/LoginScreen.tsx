import React, { useState, useEffect } from 'react';
import { 
  Building2, Lock, Mail, ShieldCheck, RefreshCw, KeyRound, CheckCircle2, UserCheck, Sparkles, AlertCircle, Eye, EyeOff
} from 'lucide-react';
import { User, Company } from '../types';

interface LoginScreenProps {
  companies: Company[];
  users: User[];
  onLoginSuccess: (user: User, company: Company) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  companies,
  users,
  onLoginSuccess
}) => {
  const [email, setEmail] = useState('admin@alfa.com');
  const [password, setPassword] = useState('123');
  const [selectedCompanyId, setSelectedCompanyId] = useState('comp-alfa');
  const [showPassword, setShowPassword] = useState(false);

  // Captcha Math Challenge State
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaError, setCaptchaError] = useState(false);
  const [authError, setAuthError] = useState('');

  // Generate new math captcha
  const generateCaptcha = () => {
    const n1 = Math.floor(Math.random() * 12) + 1; // 1 to 12
    const n2 = Math.floor(Math.random() * 12) + 1; // 1 to 12
    setNum1(n1);
    setNum2(n2);
    setCaptchaInput('');
    setCaptchaError(false);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setCaptchaError(false);

    // 1. Validate Math Captcha
    const expectedSum = num1 + num2;
    if (parseInt(captchaInput.trim(), 10) !== expectedSum) {
      setCaptchaError(true);
      generateCaptcha();
      return;
    }

    // 2. Find User by Email & Company
    const foundUser = users.find(u => 
      u.email.toLowerCase() === email.trim().toLowerCase() && 
      u.companyId === selectedCompanyId &&
      u.active
    );

    if (!foundUser) {
      setAuthError('Usuário ou senha incorretos para a empresa selecionada.');
      generateCaptcha();
      return;
    }

    const foundCompany = companies.find(c => c.id === foundUser.companyId);

    if (!foundCompany || !foundCompany.active) {
      setAuthError('Empresa inativa ou não encontrada. Entre em contato com o suporte.');
      generateCaptcha();
      return;
    }

    // Login successful
    onLoginSuccess(foundUser, foundCompany);
  };

  // Quick preset click helper
  const handleQuickPreset = (presetEmail: string, companyId: string) => {
    setEmail(presetEmail);
    setPassword('123');
    setSelectedCompanyId(companyId);
    setAuthError('');
    setCaptchaError(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* Subtle Background Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-800 z-10">
        
        {/* LEFT COLUMN: Branding & Company Info (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950 text-white p-8 flex flex-col justify-between relative">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/30">
                W
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight leading-tight">MDTracker</h1>
                <p className="text-[11px] text-blue-300 font-medium">Plataforma Multiempresa</p>
              </div>
            </div>

            <div className="space-y-6">
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
          </div>

          {/* Preset Quick Selectors */}
          <div className="mt-8 pt-6 border-t border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Credenciais de Teste Rápido (Demonstração):
            </span>
            <div className="space-y-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickPreset('admin@alfa.com', 'comp-alfa')}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition ${
                  email === 'admin@alfa.com' ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/50' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>👑 Admin Alfa (Empresa Alfa)</span>
                <span className="text-[10px] font-mono text-slate-400">admin@alfa.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('atendente@alfa.com', 'comp-alfa')}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition ${
                  email === 'atendente@alfa.com' ? 'bg-emerald-600/30 text-emerald-300 font-bold border border-emerald-500/50' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>🎧 Atendente Alfa (Empresa Alfa)</span>
                <span className="text-[10px] font-mono text-slate-400">atendente@alfa.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPreset('admin@beta.com', 'comp-beta')}
                className={`w-full text-left px-2.5 py-1.5 rounded flex items-center justify-between transition ${
                  email === 'admin@beta.com' ? 'bg-purple-600/30 text-purple-300 font-bold border border-purple-500/50' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <span>🏢 Admin TechSolutions Beta</span>
                <span className="text-[10px] font-mono text-slate-400">admin@beta.com</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Login Form & Captcha (7 cols) */}
        <div className="md:col-span-7 p-8 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Acessar Sistema</h2>
              <p className="text-xs text-slate-500 mt-1">
                Selecione a empresa e informe suas credenciais de usuário.
              </p>
            </div>

            {authError && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              {/* Select Company */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  Empresa / Organização
                </label>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.cnpj ? `(${c.cnpj})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  E-mail de Acesso
                </label>
                <input
                  type="email"
                  required
                  placeholder="seu.email@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none pr-10"
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

              {/* CAPTCHA DE SOMA MATEMÁTICA */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Desafio de Segurança (Captcha de Soma)
                  </label>
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                    title="Gerar novo cálculo"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Trocar
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-900 text-white font-mono font-bold text-base px-4 py-2 rounded-lg tracking-widest shadow-inner border border-slate-700 select-none">
                    {num1} + {num2} = ?
                  </div>
                  <input
                    type="number"
                    required
                    placeholder="Resultado"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    className={`flex-1 bg-white border rounded-lg px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-none ${
                      captchaError ? 'border-red-500 bg-red-50' : 'border-slate-300 focus:border-blue-600'
                    }`}
                  />
                </div>

                {captchaError && (
                  <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3" />
                    Resultado do cálculo incorreto! Tente novamente.
                  </p>
                )}
                <p className="text-[10px] text-slate-400">
                  Some os dois números acima e digite o valor exato no campo para liberar seu acesso.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg text-xs transition shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 mt-2"
              >
                <KeyRound className="w-4 h-4" />
                Entrar na Empresa
              </button>

            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
