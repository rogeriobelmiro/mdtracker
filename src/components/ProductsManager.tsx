import React, { useState } from 'react';
import { Product, Company } from '../types';
import { Plus, Edit3, Trash2, Box, RefreshCw, X, Package } from 'lucide-react';

interface ProductsManagerProps {
  products: Product[];
  currentCompany: Company;
  onCreateProduct: (data: Partial<Product>) => Promise<void>;
  onUpdateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: string) => Promise<void>;
}

export const ProductsManager: React.FC<ProductsManagerProps> = ({
  products,
  currentCompany,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    type: 'produto',
    price: 0,
    recurrenceDays: null
  });

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({ name: '', type: 'produto', price: 0, recurrenceDays: null });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      await onUpdateProduct(editingProduct.id, { ...formData, companyId: currentCompany.id });
    } else {
      await onCreateProduct({ ...formData, companyId: currentCompany.id });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-lg border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Produtos e Serviços
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie seu catálogo para associar vendas aos leads e calcular o LTV.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded transition flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Item
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-600 uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Nome</th>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium">Preço</th>
                <th className="px-6 py-4 font-medium">Recorrência</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <Box className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-700">Nenhum produto cadastrado</p>
                    <p className="text-xs mt-1">Crie seu primeiro produto para começar a vender.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        product.type === 'servico' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {product.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      {product.recurrenceDays ? (
                        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit">
                          <RefreshCw className="w-3 h-3" /> {product.recurrenceDays} dias
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Única</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Excluir este item? Isso não apagará as vendas já associadas aos leads, mas ele não poderá mais ser vendido.')) {
                              onDeleteProduct(product.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-600" />
                {editingProduct ? 'Editar Item' : 'Novo Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nome *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Tipo *</label>
                  <select
                    required
                    value={formData.type || 'produto'}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'produto' | 'servico' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
                  >
                    <option value="produto">Produto</option>
                    <option value="servico">Serviço</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Preço (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Recorrência (Dias)</label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ex: 30 para mensal. Deixe vazio para única."
                  value={formData.recurrenceDays || ''}
                  onChange={(e) => setFormData({ ...formData, recurrenceDays: e.target.value ? parseInt(e.target.value) : null })}
                  className="w-full bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-blue-600"
                />
                <p className="text-[10px] text-slate-500 mt-1">Se preenchido, o CRM alertará para re-ofertar após esse prazo.</p>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded transition"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Criar Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
