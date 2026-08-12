import React, { useState } from 'react';
import { Company } from '../types';
import { Building2, Save, MapPin, Phone, Building, UserSquare2, Image as ImageIcon } from 'lucide-react';

interface CompanyProfileProps {
  currentCompany: Company;
  onUpdateCompany: (id: string, data: Partial<Company>) => Promise<void>;
}

export function CompanyProfile({ currentCompany, onUpdateCompany }: CompanyProfileProps) {
  const [formData, setFormData] = useState<Partial<Company>>({
    name: currentCompany.name || '',
    cnpj: currentCompany.cnpj || '',
    logoUrl: currentCompany.logoUrl || '',
    responsibleName: currentCompany.responsibleName || '',
    phone: currentCompany.phone || '',
    address: currentCompany.address || '',
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onUpdateCompany(currentCompany.id, formData);
    setSaving(false);
    alert('Dados da empresa atualizados com sucesso!');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Dados da Empresa</h2>
            <p className="text-sm text-slate-500">Gerencie as informações comerciais e logotipo da sua conta.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" /> Nome da Empresa *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                placeholder="Ex: Minha Agência LTDA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-400" /> CPF ou CNPJ
              </label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => setFormData(prev => ({ ...prev, cnpj: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                placeholder="000.000.000-00 ou 00.000.000/0001-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <UserSquare2 className="w-4 h-4 text-slate-400" /> Nome do Responsável
              </label>
              <input
                type="text"
                value={formData.responsibleName}
                onChange={(e) => setFormData(prev => ({ ...prev, responsibleName: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                placeholder="Ex: João da Silva"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" /> Telefone Comercial
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                placeholder="(00) 0000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" /> Endereço Completo
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700"
                placeholder="Rua, Número, Bairro, Cidade - UF"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-slate-400" /> Logotipo da Empresa
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-slate-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-[11px] text-slate-500 mt-1">Selecione uma imagem do seu computador.</p>
              
              {formData.logoUrl && (
                <div className="mt-4 p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col items-center relative group">
                  <span className="text-xs text-slate-500 mb-2 font-medium">Pré-visualização</span>
                  <img src={formData.logoUrl} alt="Logo Preview" className="h-12 object-contain rounded-md" onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Erro+na+Imagem';
                  }} />
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logoUrl: '' }))}
                    className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remover logotipo"
                  >
                    &times;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <Save className="w-4 h-4" />
            )}
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}
