import React, { useState } from 'react';
import { 
  Users, UserPlus, Shield, UserCheck, Key, Mail, Lock, CheckCircle2, 
  XCircle, Trash2, Edit3, Building2, ShieldAlert, Sparkles, AlertCircle
} from 'lucide-react';
import { User, UserRole, Company } from '../types';

interface UserManagementProps {
  currentCompany: Company;
  currentUser: User;
  users: User[];
  onAddUser: (newUser: Omit<User, 'id' | 'createdAt'>) => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({
  currentCompany,
  currentUser,
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'attendant' as UserRole
  });
  const [formError, setFormError] = useState('');

  // Filter users belonging to current company
  const companyUsers = users.filter(u => u.companyId === currentCompany.id);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Por favor, preencha o nome e o e-mail.');
      return;
    }

    // Check if email already exists in company
    const exists = users.some(u => u.email.toLowerCase() === formData.email.trim().toLowerCase());
    if (exists) {
      setFormError('Este e-mail já está cadastrado no sistema.');
      return;
    }

    onAddUser({
      companyId: currentCompany.id,
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password || '123',
      role: formData.role,
      active: true
    });

    setFormData({ name: '', email: '', password: '', role: 'attendant' });
    setIsModalOpen(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            👑 Administrador
          </span>
        );
      case 'manager':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            💼 Gerente de Vendas
          </span>
        );
      case 'attendant':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 w-fit">
            🎧 Atendente / Comercial
          </span>
        );
    }
  };

  const getRolePermissionsDescription = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'Acesso total: Gestão de Usuários, Links, CRM, Disparos, Configurações de API e Relatórios.';
      case 'manager':
        return 'Acesso intermediário: Links de Campanha, CRM Leads, Disparos em Massa e Chat WhatsApp.';
      case 'attendant':
        return 'Acesso focado: Atendimento no Chat WhatsApp e alteração de etapas do funil de leads.';
    }
  };

  return (
    <div className="space-y-6 text-slate-800">
      
      {/* Top Banner Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-800 font-bold text-[11px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              {currentCompany.name}
            </span>
            <span className="text-xs text-slate-400">• CNPJ: {currentCompany.cnpj || '12.345.678/0001-90'}</span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Gestão de Usuários & Equipe Colaboradora
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cadastre os membros da sua equipe e defina o nível de permissão individual (Categorias de Acesso).
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-lg text-xs transition shadow-xs flex items-center gap-2 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            Novo Usuário Colaborador
          </button>
        )}
      </div>

      {/* Access Categories Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="bg-white border border-purple-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-purple-900 flex items-center gap-1.5">
              👑 Categoria: Administrador
            </span>
            <span className="text-xs font-mono font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
              {companyUsers.filter(u => u.role === 'admin').length} membros
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Pode cadastrar novos usuários, alterar planos, configurar chaves de API e gerenciar todas as telas.
          </p>
        </div>

        <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
              💼 Categoria: Gerente
            </span>
            <span className="text-xs font-mono font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {companyUsers.filter(u => u.role === 'manager').length} membros
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Acesso para criar links de campanha, disparos em massa, métricas e supervisão de equipe.
          </p>
        </div>

        <div className="bg-white border border-emerald-200 rounded-lg p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-xs text-emerald-900 flex items-center gap-1.5">
              🎧 Categoria: Atendente
            </span>
            <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              {companyUsers.filter(u => u.role === 'attendant').length} membros
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Acesso focado na rotina comercial de atendimento ao cliente via Chat e CRM de Leads.
          </p>
        </div>

      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Colaboradores Cadastrados na {currentCompany.name} ({companyUsers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Usuário / Nome</th>
                <th className="py-3 px-4">E-mail de Acesso</th>
                <th className="py-3 px-4">Categoria de Acesso</th>
                <th className="py-3 px-4">Permissões Principais</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {companyUsers.map(user => {
                const isSelf = user.id === currentUser.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition">
                    
                    {/* User Name */}
                    <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div>{user.name} {isSelf && <span className="text-blue-600 text-[10px] font-bold ml-1">(Você)</span>}</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">ID: {user.id}</div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 font-mono text-slate-700">
                      {user.email}
                    </td>

                    {/* Role Badge */}
                    <td className="py-3.5 px-4">
                      {getRoleBadge(user.role)}
                    </td>

                    {/* Permissions Tooltip */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-xs">
                      {getRolePermissionsDescription(user.role)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {user.active ? (
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                          Ativo
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-600" />
                          Inativo
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {currentUser.role === 'admin' && !isSelf ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onUpdateUser(user.id, { active: !user.active })}
                            className="text-xs text-slate-600 hover:text-slate-900 underline font-medium"
                          >
                            {user.active ? 'Desativar' : 'Ativar'}
                          </button>
                          <button
                            onClick={() => onDeleteUser(user.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic">
                          {isSelf ? 'Sua Conta' : 'Somente Leitura'}
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-slate-200 shadow-2xl relative space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Cadastrar Colaborador na Empresa
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Maria Oliveira"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  E-mail do Colaborador
                </label>
                <input
                  type="email"
                  required
                  placeholder="maria@empresa.com.br"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Senha Inicial
                </label>
                <input
                  type="password"
                  placeholder="Defina uma senha (Padrão: 123)"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Categoria de Acesso / Nível de Permissão
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
                >
                  <option value="attendant">🎧 Atendente / Comercial (Acesso ao Chat e CRM)</option>
                  <option value="manager">💼 Gerente de Vendas (Links, CRM, Disparos e Relatórios)</option>
                  <option value="admin">👑 Administrador (Acesso Total + Gestão de Usuários)</option>
                </select>
                <p className="text-[11px] text-slate-500 mt-1">
                  {getRolePermissionsDescription(formData.role)}
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition shadow-xs"
                >
                  Confirmar Cadastro
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
