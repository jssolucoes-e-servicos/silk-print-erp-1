/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Filter, X, AlertTriangle, 
  Package, ShoppingCart, RefreshCw, CheckCircle 
} from 'lucide-react';
import { StockItem, StockCategory, StockStatus } from '../types.js';

export default function StockCRUD() {
  const [stock, setStock] = useState<StockItem[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Papel' as StockCategory,
    quantity: '0',
    unit: 'Resmas',
    minQuantity: '10',
    cost: '0'
  });

  const fetchStock = async () => {
    try {
      const res = await fetch('/api/stock');
      if (res.ok) {
        const data = await res.json();
        setStock(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Papel',
      quantity: '0',
      unit: 'Resmas',
      minQuantity: '10',
      cost: '0'
    });
    setShowFormModal(true);
  };

  const handleOpenEditModal = (item: StockItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      minQuantity: String(item.minQuantity),
      cost: String(item.cost)
    });
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let url = '/api/stock';
      let method = 'POST';

      if (editingItem) {
        url = `/api/stock/${editingItem.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: Number(formData.quantity),
          minQuantity: Number(formData.minQuantity),
          cost: Number(formData.cost)
        })
      });

      if (res.ok) {
        setShowFormModal(false);
        fetchStock();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Excluir este insumo de estoque permanentemente?')) {
      try {
        const res = await fetch(`/api/stock/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchStock();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filter items
  const filteredStock = stock.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'todos' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Calculations
  const criticalItems = stock.filter(item => item.status === 'CRÍTICO');
  const warningItems = stock.filter(item => item.status === 'AVISO');
  
  const totalInStockValue = stock.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
  const totalPaperValue = stock.filter(item => item.category === 'Papel').reduce((sum, item) => sum + (item.quantity * item.cost), 0);
  const totalInkValue = stock.filter(item => item.category === 'Tintas').reduce((sum, item) => sum + (item.quantity * item.cost), 0);
  const totalFinishValue = stock.filter(item => item.category === 'Acabamentos').reduce((sum, item) => sum + (item.quantity * item.cost), 0);

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case 'CRÍTICO':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span>Crítico</span>
          </span>
        );
      case 'AVISO':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3 h-3" />
            <span>Alerta</span>
          </span>
        );
      case 'ESTÁVEL':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3" />
            <span>Estável</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar" id="stock-control-panel">
      
      {/* Header and Add Insumo Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight leading-none">Controle de Estoque</h1>
          <p className="text-xs text-white/40 mt-1.5 font-medium">Monitore insumos críticos, verifique quantidades mínimas de segurança e gerencie custos.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          id="btn-add-stock-item"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Insumo</span>
        </button>
      </div>

      {/* Critical Alerts Banner if any critical items */}
      {criticalItems.length > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/20 p-4.5 rounded-xl flex items-start space-x-3.5" id="stock-critical-alerts-banner">
          <AlertTriangle className="w-5.5 h-5.5 text-rose-400 flex-shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-rose-200">Alertas Críticos de Reposição de Insumos</h4>
            <p className="text-[11px] text-rose-300 mt-1 leading-normal font-medium">
              Os seguintes insumos estão abaixo do limite mínimo de segurança operacional: 
              <strong className="text-rose-100"> {criticalItems.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ')}</strong>. 
              Favor programar novas compras junto aos fornecedores parceiros imediatamente.
            </p>
          </div>
        </div>
      )}

      {/* Category In-stock Value Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-[#111113] p-5 rounded-xl border border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Estoque Papel</span>
            <span className="text-xl font-semibold text-white mt-2 block">R$ {totalPaperValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-white/40 font-medium block mt-1">Bobinas e Resmas SRA3</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
            P
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#111113] p-5 rounded-xl border border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Tintas & Toners</span>
            <span className="text-xl font-semibold text-white mt-2 block">R$ {totalInkValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-white/40 font-medium block mt-1">Litros e Cartuchos XL</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
            T
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#111113] p-5 rounded-xl border border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Acabamentos</span>
            <span className="text-xl font-semibold text-white mt-2 block">R$ {totalFinishValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-white/40 font-medium block mt-1">Verniz, Wire-O, Plásticos</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
            A
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-indigo-600/30 p-5 rounded-xl border border-indigo-500/20 shadow-xs flex items-center justify-between text-white">
          <div>
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider block">Valor Total Invertido</span>
            <span className="text-xl font-semibold text-white mt-2 block">R$ {totalInStockValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            <span className="text-[10px] text-indigo-400 font-semibold block mt-1">Ativo Circulante</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Table Column */}
      <div className="bg-[#111113] rounded-xl border border-white/5 overflow-hidden shadow-sm flex flex-col">
        {/* Filters and search block */}
        <div className="p-4 bg-white/5 border-b border-white/5 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/40" />
            <input
              type="text"
              placeholder="Pesquisar por nome de insumos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 hover:bg-white/10 focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-white/30"
            />
          </div>

          <div className="flex items-center space-x-2.5 w-full md:w-auto">
            <Filter className="w-4.5 h-4.5 text-white/40" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            >
              <option value="todos" className="bg-[#111113] text-white">Todas as Categorias</option>
              <option value="Papel" className="bg-[#111113] text-white">Papel</option>
              <option value="Tintas" className="bg-[#111113] text-white">Tintas & Toners</option>
              <option value="Acabamentos" className="bg-[#111113] text-white">Acabamentos</option>
            </select>
          </div>
        </div>

        {/* Table representation */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="stock-table">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Nome Insumo</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Quantidade</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Mín. Alerta</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Custo Unit.</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Valor total</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Status reposição</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredStock.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-white/50 font-mono">{item.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-white">{item.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-white/70">{item.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-white">{item.quantity} <span className="text-white/40 font-medium text-[10px]">{item.unit}</span></span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-white/50">{item.minQuantity} <span className="text-white/40 font-medium text-[10px]">{item.unit}</span></span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-white/70">R$ {item.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-white">R$ {(item.quantity * item.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={(e) => handleOpenEditModal(item, e)}
                        className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                        title="Editar Insumo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(item.id, e)}
                        className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                        title="Remover Insumo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CRUD Form Modal for Insumo */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" id="stock-form-modal">
          <div className="bg-[#111113] rounded-xl border border-white/5 w-full max-w-md shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {editingItem ? 'Editar Insumo de Estoque' : 'Novo Insumo Operacional'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Nome do Insumo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium"
                  placeholder="Ex: Couché Brilhante 250g A3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as StockCategory })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium"
                  >
                    <option value="Papel" className="bg-[#111113] text-white">Papel</option>
                    <option value="Tintas" className="bg-[#111113] text-white">Tintas & Toners</option>
                    <option value="Acabamentos" className="bg-[#111113] text-white">Acabamentos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Unidade de Medida</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium"
                    placeholder="Ex: Resmas, Litros"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Qtd Atual</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Limite Mín.</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Custo Unit. (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-white/5 rounded-lg text-xs font-semibold text-white/50 bg-white/5 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all"
                >
                  Gravar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
