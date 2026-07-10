/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Eye, Trash2, Calendar, 
  DollarSign, Clock, Settings, ShieldAlert, Sparkles, CheckSquare, X 
} from 'lucide-react';
import { ServiceOrder, OSStatus, OSPaymentStatus } from '../types.js';

interface ServiceOrdersProps {
  onSelectOrder: (orderId: string) => void;
}

export default function ServiceOrders({ onSelectOrder }: ServiceOrdersProps) {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [paymentFilter, setPaymentFilter] = useState<string>('todos');

  // Modal State for New OS
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    cnpj: '',
    productName: '',
    quantity: '',
    deliveryDate: '',
    price: '',
    statusOS: 'aguardando' as OSStatus,
    paymentStatus: 'pendente' as OSPaymentStatus,
    notes: '',
  });

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateOS = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price)
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          clientName: '',
          cnpj: '',
          productName: '',
          quantity: '',
          deliveryDate: '',
          price: '',
          statusOS: 'aguardando',
          paymentStatus: 'pendente',
          notes: '',
        });
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Excluir Ordem de Serviço permanentemente?')) {
      try {
        const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchOrders();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.clientName.toLowerCase().includes(search.toLowerCase()) || 
                          o.productName.toLowerCase().includes(search.toLowerCase()) ||
                          o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || o.statusOS === statusFilter;
    const matchesPayment = paymentFilter === 'todos' || o.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Calculate top mini stats boxes
  const awaitingCount = orders.filter(o => o.statusOS === 'aguardando').length;
  const inProductionCount = orders.filter(o => o.statusOS === 'producao').length;
  const totalBillingMonth = orders.reduce((sum, o) => sum + o.price, 0);

  const getStatusBadge = (status: OSStatus) => {
    switch (status) {
      case 'aguardando':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">Aprovado</span>;
      case 'producao':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20 animate-pulse">Em Produção</span>;
      case 'acabamento':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Acabamento</span>;
      case 'pronto':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Pronto</span>;
      case 'entregue':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-white/50 border border-white/5">Entregue</span>;
      case 'cancelado':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">Cancelado</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar" id="service-orders-panel">
      
      {/* Header and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight leading-none">Gestão de Ordens de Serviço (OS)</h1>
          <p className="text-xs text-white/40 mt-1.5 font-medium">Controle fichas técnicas de produção, acompanhe prazos de entrega e expedição industrial.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          id="btn-add-os"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Ordem de Serviço</span>
        </button>
      </div>

      {/* Top micro stats boxes matching wireframe */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#111113] p-4.5 rounded-xl border border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Aguardando Ação</span>
            <span className="text-2xl font-bold text-white mt-1 block">{awaitingCount} OS</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111113] p-4.5 rounded-xl border border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Em Produção</span>
            <span className="text-2xl font-bold text-white mt-1 block">{inProductionCount} OS</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Settings className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
        </div>

        <div className="bg-[#111113] p-4.5 rounded-xl border border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Faturamento Estimado</span>
            <span className="text-2xl font-bold text-white mt-1 block">R$ {totalBillingMonth.toLocaleString('pt-BR')}</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#111113] p-4.5 rounded-xl border border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Metas Diárias</span>
            <span className="text-2xl font-bold text-white mt-1 block">100%</span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters block */}
      <div className="bg-[#111113] p-4.5 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/40" />
          <input
            type="text"
            placeholder="Pesquisar por ID, cliente ou insumo de trabalho..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 hover:bg-white/10 focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-white/30"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4.5 h-4.5 text-white/40" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
          >
            <option value="todos" className="bg-[#111113] text-white">Todos os Status</option>
            <option value="aguardando" className="bg-[#111113] text-white">Aguardando / Rascunho</option>
            <option value="producao" className="bg-[#111113] text-white">Em Produção</option>
            <option value="acabamento" className="bg-[#111113] text-white">Acabamento</option>
            <option value="pronto" className="bg-[#111113] text-white">Pronto para Entrega</option>
            <option value="entregue" className="bg-[#111113] text-white">Entregue</option>
            <option value="cancelado" className="bg-[#111113] text-white">Cancelado</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-3 py-2 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
          >
            <option value="todos" className="bg-[#111113] text-white">Todos os Pagamentos</option>
            <option value="pago" className="bg-[#111113] text-white">Pago</option>
            <option value="pendente" className="bg-[#111113] text-white">Pendente</option>
          </select>
        </div>
      </div>

      {/* Main OS Table */}
      <div className="bg-[#111113] rounded-xl border border-white/5 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse" id="orders-table">
          <thead>
            <tr className="bg-white/5 border-b border-white/5">
              <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Código OS</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Cliente / Solicitante</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Trabalho / Insumo</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Quantidade</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Prazo Expedição</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Preço Faturado</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Status OS</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Pagamento</th>
              <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredOrders.map((o) => (
              <tr 
                key={o.id} 
                onClick={() => onSelectOrder(o.id)}
                className="hover:bg-white/5 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-white">{o.id}</span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-xs font-bold text-white leading-none">{o.clientName}</p>
                    <p className="text-[9px] text-white/40 mt-1 font-mono font-semibold">{o.cnpj}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-white/80">{o.productName}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-semibold text-white/70">{o.quantity}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-medium text-white/60">{o.deliveryDate}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-white">R$ {o.price.toLocaleString('pt-BR')}</span>
                </td>
                <td className="px-6 py-4">
                  {getStatusBadge(o.statusOS)}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-[10px] font-bold uppercase ${o.paymentStatus === 'pago' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {o.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onSelectOrder(o.id)}
                      className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                      title="Ver Detalhes (Workflow)"
                    >
                      <Eye className="w-4.5 h-4.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(o.id, e)}
                      className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                      title="Excluir OS"
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

      {/* Add OS Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" id="add-os-modal">
          <div className="bg-[#111113] rounded-xl border border-white/5 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Nova Ordem de Serviço</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateOS} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Cliente / Solicitante</label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    placeholder="Ex: Agência Creative Minds"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">CPF / CNPJ</label>
                  <input
                    type="text"
                    required
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                    placeholder="12.345.678/0001-90"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Nome do Produto</label>
                  <input
                    type="text"
                    required
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-[#111113]"
                    placeholder="Ex: Flyers Couché 150g"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Quantidade</label>
                  <input
                    type="text"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-[#111113]"
                    placeholder="Ex: 5.000 unidades"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Preço Faturado (R$)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-[#111113]"
                    placeholder="1450"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Prazo de Entrega</label>
                  <input
                    type="text"
                    required
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-[#111113]"
                    placeholder="Ex: 24/10/2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Status OS</label>
                  <select
                    value={formData.statusOS}
                    onChange={(e) => setFormData({ ...formData, statusOS: e.target.value as OSStatus })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  >
                    <option value="aguardando" className="bg-[#111113] text-white">Aguardando / Rascunho</option>
                    <option value="producao" className="bg-[#111113] text-white">Em Produção</option>
                    <option value="acabamento" className="bg-[#111113] text-white">Acabamento</option>
                    <option value="pronto" className="bg-[#111113] text-white">Pronto para Entrega</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Status Pagamento</label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value as OSPaymentStatus })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  >
                    <option value="pendente" className="bg-[#111113] text-white">Pendente</option>
                    <option value="pago" className="bg-[#111113] text-white">Pago</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Observações / Instruções de Acabamento</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 resize-none font-medium"
                  placeholder="Instruções para corte, vinco, laminação..."
                />
              </div>

              <div className="pt-4 border-t border-white/5 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-white/5 rounded-lg text-xs font-semibold text-white/50 bg-white/5 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all"
                >
                  Gravar & Abrir Ordem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
