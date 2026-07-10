/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Check, Clock, AlertTriangle, Search, Filter, 
  CreditCard, ShieldCheck, Play, ArrowRight, BookOpen, Sparkles, X
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types.js';

export default function BillingCRUD() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  
  // Payment Simulation Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Pix');
  const [cardHolder, setCardHolder] = useState('Alex Santos');
  const [cardNumber, setCardNumber] = useState('4007 0000 1234 5678');
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any | null>(null);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/invoices');
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setLoadingPayment(true);
    setPaymentSuccess(null);

    try {
      const res = await fetch('/api/payment/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          paymentMethod,
          creditCardNumber: cardNumber,
          billingName: cardHolder
        })
      });

      if (res.ok) {
        const data = await res.json();
        setPaymentSuccess(data.transaction);
        fetchInvoices();
        // Clear selected invoice from sidebar or update it
        const updatedInvoice = { ...selectedInvoice, status: 'PAGO' as InvoiceStatus, paymentMethod };
        setSelectedInvoice(updatedInvoice);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPayment(false);
    }
  };

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.clientName.toLowerCase().includes(search.toLowerCase()) || 
                          inv.id.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'todos' || inv.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculations
  const totalPaid = invoices.filter(i => i.status === 'PAGO').reduce((sum, i) => sum + i.amount, 0);
  const totalDue = invoices.filter(i => i.status === 'VENCIDO').reduce((sum, i) => sum + i.amount, 0);
  const totalDraft = invoices.filter(i => i.status === 'RASCUNHO').reduce((sum, i) => sum + i.amount, 0);

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'PAGO':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Check className="w-3 h-3" />
            <span>Pago</span>
          </span>
        );
      case 'VENCIDO':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
            <AlertTriangle className="w-3 h-3" />
            <span>Vencido</span>
          </span>
        );
      case 'RASCUNHO':
        return (
          <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/50 border border-white/5">
            <Clock className="w-3 h-3" />
            <span>Rascunho</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden" id="billing-caixa-layout">
      {/* Left List Block */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-8">
        
        {/* Top Header */}
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight leading-none">Controle Financeiro & Caixa</h1>
          <p className="text-xs text-white/40 mt-1.5 font-medium">Controle o fluxo de recebimentos, faturas vencidas e faturamentos pendentes.</p>
        </div>

        {/* Financial KPI Cards matching screenshot */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-rose-500/10 p-5 rounded-xl border border-rose-500/20 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Total em Dívida (Atraso)</span>
              <span className="text-2xl font-bold text-white mt-1.5 block">R$ {totalDue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5.5 h-5.5" />
            </div>
          </div>

          <div className="bg-emerald-500/10 p-5 rounded-xl border border-emerald-500/20 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Pago este Mês</span>
              <span className="text-2xl font-bold text-white mt-1.5 block">R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-5.5 h-5.5" />
            </div>
          </div>

          <div className="bg-[#111113] p-5 rounded-xl border border-white/5 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Faturamento Provisório</span>
              <span className="text-2xl font-bold text-white mt-1.5 block">R$ {totalDraft.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/5 text-white/50 flex items-center justify-center">
              <Clock className="w-5.5 h-5.5" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Faturas/Invoices Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#111113] rounded-xl border border-white/5 overflow-hidden shadow-sm">
              {/* Table search & filter headers */}
              <div className="p-4 bg-white/5 border-b border-white/5 flex flex-col sm:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/40" />
                  <input
                    type="text"
                    placeholder="Pesquisar por fatura ou cliente..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 focus:bg-white/5 hover:bg-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                </div>

                <div className="flex items-center space-x-2.5">
                  <Filter className="w-4.5 h-4.5 text-white/40" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  >
                    <option value="todos" className="bg-[#111113] text-white">Todos os Faturamentos</option>
                    <option value="PAGO" className="bg-[#111113] text-white">Pago</option>
                    <option value="VENCIDO" className="bg-[#111113] text-white">Vencido</option>
                    <option value="RASCUNHO" className="bg-[#111113] text-white">Rascunho</option>
                  </select>
                </div>
              </div>

              {/* Table rendering */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" id="invoices-table">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5">
                      <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Fatura ID</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Cliente</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Emissão</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Vencimento</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Valor total</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Meio de Pgto</th>
                      <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredInvoices.map((inv) => (
                      <tr 
                        key={inv.id} 
                        onClick={() => setSelectedInvoice(inv)}
                        className={`hover:bg-white/5 cursor-pointer transition-colors ${
                          selectedInvoice?.id === inv.id ? 'bg-indigo-500/10' : ''
                        }`}
                      >
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-white">{inv.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-white leading-none">{inv.clientName}</p>
                          <p className="text-[10px] text-white/40 mt-1 font-medium">{inv.clientEmail}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium text-white/60">{inv.issueDate}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-white/60">{inv.dueDate}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-white">
                            R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-semibold text-white/60">{inv.paymentMethod}</span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(inv.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Simulated Monthly Cash Flow Bar Chart */}
          <div className="space-y-6 flex flex-col">
            <div className="bg-[#111113] rounded-xl border border-white/5 p-5 shadow-sm flex flex-col">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Fluxo de Caixa Mensal</h3>
              
              {/* Column bar drawing in CSS */}
              <div className="h-44 flex items-end justify-between px-2 pt-6">
                {[
                  { month: 'Mai', incoming: 45, color: 'bg-indigo-500/25', activeColor: 'bg-indigo-500' },
                  { month: 'Jun', incoming: 60, color: 'bg-indigo-500/25', activeColor: 'bg-indigo-500' },
                  { month: 'Jul', incoming: 78, color: 'bg-indigo-500/35', activeColor: 'bg-indigo-500' },
                  { month: 'Ago', incoming: 52, color: 'bg-indigo-500/25', activeColor: 'bg-indigo-500' },
                  { month: 'Set', incoming: 92, color: 'bg-indigo-500/45', activeColor: 'bg-indigo-500' },
                  { month: 'Out', incoming: 110, color: 'bg-indigo-600 hover:bg-indigo-500', activeColor: 'bg-indigo-600' }
                ].map((col, i) => (
                  <div key={i} className="flex flex-col items-center group cursor-pointer relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-6 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                      R$ {col.incoming}.000
                    </div>
                    <div className="w-6 bg-white/5 rounded-t-sm h-36 flex items-end">
                      <div className={`w-full rounded-t-sm ${col.color} transition-all duration-300`} style={{ height: `${col.incoming}%` }} />
                    </div>
                    <span className="text-[10px] text-white/40 font-bold mt-2">{col.month}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/40 font-medium text-center mt-3 border-t border-white/5 pt-3">
                Receita Faturada em Outubro: <strong className="text-indigo-400">R$ 110.430,20</strong> (Recorde Anual)
              </p>
            </div>

            {/* Next Due Dates / Próximos Vencimentos */}
            <div className="bg-[#111113] rounded-xl border border-white/5 p-5 shadow-sm flex-1">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Próximos Vencimentos</h3>
              <div className="space-y-3">
                {[
                  { name: 'Moda Lisboa Eventos', date: 'Em 2 dias', amount: 890.20, status: 'crítico' },
                  { name: 'Eco Print Studio', date: 'Em 5 dias', amount: 12600.00, status: 'aviso' },
                  { name: 'Gráfica Digital Ltda.', date: 'Em 12 dias', amount: 2450.00, status: 'estável' }
                ].map((due, i) => (
                  <div key={i} className="p-3 border border-white/5 rounded-xl flex justify-between items-center hover:border-white/10 transition-colors">
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{due.name}</p>
                      <p className="text-[10px] text-white/40 mt-1 font-semibold">Prazo: {due.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-white">R$ {due.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        due.status === 'crítico' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        Aguardando
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Details Side Drawer with Credit Card Payment Simulator */}
      {selectedInvoice && (
        <div className="w-104 bg-[#111113] border-l border-white/5 flex flex-col h-full shadow-2xl" id="invoice-details-drawer">
          <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider block">Ficha de Faturamento</span>
              <span className="text-sm font-bold text-white mt-1 block">{selectedInvoice.id}</span>
            </div>
            <button
              onClick={() => setSelectedInvoice(null)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
            {/* Quick summary card */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2.5">
              <div className="flex justify-between font-semibold">
                <span className="text-white/40">Cliente Faturado:</span>
                <span className="text-white font-bold">{selectedInvoice.clientName}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-white/40">Emissão:</span>
                <span className="text-white/60">{selectedInvoice.issueDate}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-white/40">Vencimento:</span>
                <span className="text-white/60">{selectedInvoice.dueDate}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-white/5 pt-2.5 text-sm">
                <span className="text-white">Total Fatura:</span>
                <span className="text-indigo-400">R$ {selectedInvoice.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Credit Card Payment Simulator */}
            {selectedInvoice.status !== 'PAGO' ? (
              <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-4">
                <div className="flex items-center space-x-2 text-white">
                  <CreditCard className="w-4.5 h-4.5 text-indigo-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">Gateway de Pagamento Integrado</h4>
                </div>
                
                {paymentSuccess ? (
                  <div className="space-y-3.5 text-center py-2">
                    <div className="mx-auto flex items-center justify-center h-9 w-9 rounded-full bg-emerald-500/20 text-emerald-400">
                      <ShieldCheck className="h-5.5 w-5.5" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-white">Transação Aprovada!</p>
                      <p className="text-[10px] text-white/40 font-semibold font-mono uppercase tracking-tight">{paymentSuccess.transactionId}</p>
                    </div>
                    <p className="text-[10px] text-white/40 leading-normal">
                      Saldo do cliente atualizado e Ordem de Serviço autorizada para expedição!
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSimulatePayment} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-white/40">Meio de Pagamento</label>
                      <select 
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mt-1 block w-full px-2.5 py-1.5 text-xs border border-white/5 rounded-lg bg-[#111113] text-white focus:ring-1 focus:ring-indigo-500/50"
                      >
                        <option value="Pix" className="bg-[#111113] text-white">Pix Instantâneo</option>
                        <option value="Cartão de Crédito" className="bg-[#111113] text-white">Cartão de Crédito</option>
                        <option value="Boleto Bancário" className="bg-[#111113] text-white">Boleto Bancário</option>
                        <option value="Faturamento Interno" className="bg-[#111113] text-white">Faturamento Interno</option>
                      </select>
                    </div>

                    {paymentMethod === 'Cartão de Crédito' && (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40">Titular do Cartão</label>
                          <input 
                            type="text" 
                            required
                            value={cardHolder} 
                            onChange={(e) => setCardHolder(e.target.value)}
                            className="mt-1 block w-full px-2.5 py-1.5 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/40">Número do Cartão (Simulado)</label>
                          <input 
                            type="text" 
                            required
                            value={cardNumber} 
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="mt-1 block w-full px-2.5 py-1.5 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-mono"
                          />
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={loadingPayment}
                      className="w-full inline-flex items-center justify-center space-x-1.5 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Play className="w-4 h-4" />
                      <span>{loadingPayment ? 'Processando transação...' : `Liquidar R$ ${selectedInvoice.amount.toLocaleString('pt-BR')}`}</span>
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center font-medium text-white/60 leading-relaxed">
                Esta fatura foi quitada com sucesso via <strong>{selectedInvoice.paymentMethod}</strong>. 
                <span className="block mt-1 text-[11px] text-indigo-400 font-bold">O crédito correspondente foi provisionado na conta corrente do cliente!</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
