/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Check, X, FileText, Calendar, DollarSign, 
  Trash2, Search, Filter, AlertCircle, ShoppingCart 
} from 'lucide-react';
import { Quotation, QuotationStatus, QuoteItem } from '../types.js';

export default function QuotationCRUD() {
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);

  // Modal State for New Quotation
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    serviceType: 'Impressão Digital',
    expiryDate: '',
    items: [] as QuoteItem[],
  });
  const [newItem, setNewItem] = useState({ description: '', details: '', quantity: 1, unitPrice: 0 });

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotations');
      if (res.ok) {
        const data = await res.json();
        setQuotes(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleSelectQuote = (quote: Quotation) => {
    setSelectedQuote(quote);
  };

  const handleUpdateStatus = async (id: string, newStatus: QuotationStatus) => {
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedQuote(updated);
        fetchQuotes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Excluir este orçamento permanentemente?')) {
      try {
        const res = await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setSelectedQuote(null);
          fetchQuotes();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleAddItemToForm = () => {
    if (!newItem.description) return;
    setFormData({
      ...formData,
      items: [...formData.items, { ...newItem }]
    });
    setNewItem({ description: '', details: '', quantity: 1, unitPrice: 0 });
  };

  const handleRemoveItemFromForm = (idx: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== idx)
    });
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    const totalValue = formData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    
    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          totalValue,
          status: 'PENDENTE'
        })
      });

      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          clientName: '',
          clientEmail: '',
          serviceType: 'Impressão Digital',
          expiryDate: '',
          items: [],
        });
        fetchQuotes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.clientName.toLowerCase().includes(search.toLowerCase()) || 
                          q.serviceType.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'todos' || q.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate status counts
  const pendingCount = quotes.filter(q => q.status === 'PENDENTE').length;
  const approvedCount = quotes.filter(q => q.status === 'APROVADO').length;
  const rejectedCount = quotes.filter(q => q.status === 'REJEITADO').length;

  const getStatusStyle = (status: QuotationStatus) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'APROVADO':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'REJEITADO':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
      default:
        return 'bg-white/5 text-white/50 border border-white/5';
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden" id="quotation-management-layout">
      {/* Main List Column */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-6">
        
        {/* Header and Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight leading-none">Gestão de Orçamentos</h1>
            <p className="text-xs text-white/40 mt-1.5 font-medium">Controle orçamentos emitidos, aprove propostas e dispare ordens de produção.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            id="btn-add-quote"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Orçamento</span>
          </button>
        </div>

        {/* Counter cards matching screenshot */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-amber-500/10 p-4 rounded-xl border border-amber-500/20 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Pendentes</span>
              <span className="text-2xl font-bold text-white mt-1 block">{pendingCount}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Aprovados</span>
              <span className="text-2xl font-bold text-white mt-1 block">{approvedCount}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Check className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Expirados / Rejeitados</span>
              <span className="text-2xl font-bold text-white mt-1 block">{rejectedCount}</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
              <X className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="bg-[#111113] p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/40" />
            <input
              type="text"
              placeholder="Pesquisar por cliente, serviço..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 hover:bg-white/10 focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-white/30"
            />
          </div>

          <div className="flex items-center space-x-2.5 w-full md:w-auto">
            <Filter className="w-4.5 h-4.5 text-white/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            >
              <option value="todos" className="bg-[#111113] text-white">Todos os Orçamentos</option>
              <option value="PENDENTE" className="bg-[#111113] text-white">Pendentes</option>
              <option value="APROVADO" className="bg-[#111113] text-white">Aprovados</option>
              <option value="REJEITADO" className="bg-[#111113] text-white">Rejeitados</option>
            </select>
          </div>
        </div>

        {/* Table list */}
        <div className="bg-[#111113] rounded-xl border border-white/5 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse" id="quotes-table">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Tipo Serviço</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Validade</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Valor Proposta</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredQuotes.map((q) => (
                <tr
                  key={q.id}
                  onClick={() => handleSelectQuote(q)}
                  className={`hover:bg-white/5 cursor-pointer transition-colors ${
                    selectedQuote?.id === q.id ? 'bg-indigo-500/10' : ''
                  }`}
                >
                  <td className="px-6 py-4.5">
                    <span className="text-xs font-bold text-white">{q.id}</span>
                  </td>
                  <td className="px-6 py-4.5">
                    <div>
                      <p className="text-xs font-semibold text-white leading-tight">{q.clientName}</p>
                      <p className="text-[10px] text-white/40 mt-1 font-medium">{q.clientEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="text-xs font-semibold text-white/70">{q.serviceType}</span>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="text-xs font-medium text-white/60">{q.expiryDate}</span>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="text-xs font-bold text-white">
                      R$ {q.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(q.status)}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleDelete(q.id, e)}
                      className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>      {/* Details Side Drawer with Live Approval Actions */}
      {selectedQuote && (
        <div className="w-104 bg-[#111113] border-l border-white/5 flex flex-col h-full shadow-2xl animate-fade-in" id="quote-details-drawer">
          <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider block">Pré-visualização</span>
              <span className="text-sm font-bold text-white mt-1 block">{selectedQuote.id}</span>
            </div>
            <button
              onClick={() => setSelectedQuote(null)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
            {/* Business info header */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2.5">
              <div className="flex justify-between font-semibold">
                <span className="text-white/40">Cliente:</span>
                <span className="text-white font-bold">{selectedQuote.clientName}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-white/40">Serviço:</span>
                <span className="text-white/80">{selectedQuote.serviceType}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-white/40">Validade:</span>
                <span className="text-white/60">{selectedQuote.expiryDate}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-white/5 pt-2.5 text-sm">
                <span className="text-white">Total Proposta:</span>
                <span className="text-indigo-400">R$ {selectedQuote.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* List of items */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider pb-1 border-b border-white/5">Insumos & Componentes</h4>
              <div className="space-y-2.5">
                {selectedQuote.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-lg flex justify-between items-start">
                    <div className="space-y-1 pr-4 max-w-[200px]">
                      <p className="font-bold text-white leading-tight">{item.description}</p>
                      <p className="text-[10px] text-white/40 leading-normal">{item.details}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-white/70">Qtd: {item.quantity}</p>
                      <p className="font-bold text-white mt-1">R$ {item.unitPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live workflow actions */}
            {selectedQuote.status === 'PENDENTE' ? (
              <div className="pt-4 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => handleUpdateStatus(selectedQuote.id, 'REJEITADO')}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 py-3 px-4 border border-rose-500/20 rounded-lg text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Rejeitar Proposta</span>
                </button>
                <button
                  onClick={() => handleUpdateStatus(selectedQuote.id, 'APROVADO')}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Aprovar & Iniciar OS</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-white/5">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center font-medium text-white/50 leading-relaxed">
                  Este orçamento foi marcado como <strong className="text-white">{selectedQuote.status}</strong>. 
                  {selectedQuote.status === 'APROVADO' && (
                    <span className="block mt-1 text-[11px] text-indigo-400 font-bold">A ordem de serviço correspondente e fatura provisória foram inicializadas no sistema!</span>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Add Quotation Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" id="add-quote-modal">
          <div className="bg-[#111113] rounded-xl border border-white/5 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Novo Orçamento Comercial</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Nome do Cliente</label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium text-white"
                    placeholder="Ex: Ana Fonseca"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">E-mail de Envio</label>
                  <input
                    type="email"
                    required
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium text-white"
                    placeholder="ana@lisboaeventos.pt"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Área do Serviço</label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium text-white"
                  >
                    <option value="Impressão Digital" className="bg-[#111113] text-white">Impressão Digital</option>
                    <option value="Impressão Offset" className="bg-[#111113] text-white">Impressão Offset</option>
                    <option value="Lona / Grandes Formatos" className="bg-[#111113] text-white">Lona / Grandes Formatos</option>
                    <option value="Corte de Vinil" className="bg-[#111113] text-white">Corte de Vinil</option>
                    <option value="Acabamento e Encadernação" className="bg-[#111113] text-white">Acabamento e Encadernação</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Prazo / Validade da Proposta</label>
                  <input
                    type="text"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium text-white"
                    placeholder="Ex: 24 Out 2026"
                  />
                </div>
              </div>

              {/* Form item fields creators */}
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">Adicionar Itens / Linhas de Proposta</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40">Descrição</label>
                    <input
                      type="text"
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      placeholder="Ex: Brochuras A4 - 1000 un"
                      className="mt-1 block w-full px-2.5 py-1.5 text-xs border border-white/5 rounded-lg bg-white/5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40">Detalhes Técnicos</label>
                    <input
                      type="text"
                      value={newItem.details}
                      onChange={(e) => setNewItem({ ...newItem, details: e.target.value })}
                      placeholder="Ex: Papel Couché 150g - 4x4 cores"
                      className="mt-1 block w-full px-2.5 py-1.5 text-xs border border-white/5 rounded-lg bg-white/5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-white/40">Quantidade</label>
                    <input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                      className="mt-1 block w-full px-2.5 py-1.5 text-xs border border-white/5 rounded-lg bg-white/5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-white/40">Preço Unitário (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newItem.unitPrice}
                      onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                      className="mt-1 block w-full px-2.5 py-1.5 text-xs border border-white/5 rounded-lg bg-white/5 text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddItemToForm}
                  className="w-full inline-flex items-center justify-center space-x-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg uppercase tracking-wider"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Inserir Item na Proposta</span>
                </button>
              </div>

              {/* Items in proposal preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider pb-1 border-b border-white/5">Itens Carregados</h4>
                {formData.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-white/5 border border-white/5 rounded-lg">
                    <div>
                      <p className="font-bold text-white text-xs">{item.description}</p>
                      <p className="text-[10px] text-white/40">{item.details}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-xs">
                        <span className="text-white/50">Qtd: {item.quantity}</span>
                        <strong className="block text-white">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItemFromForm(idx)}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {formData.items.length === 0 && (
                  <p className="text-[11px] text-white/30 italic text-center py-4">Nenhum item adicionado ainda.</p>
                )}
              </div>

              {/* Action buttons */}
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
                  disabled={formData.items.length === 0}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  Gravar & Emitir Proposta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
