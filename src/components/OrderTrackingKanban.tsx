/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, User, Eye, AlertCircle, CheckCircle2,
  ListTodo, ClipboardList, Clock, RefreshCw, Layers, ArrowRight, DollarSign
} from 'lucide-react';
import { ServiceOrder, OSStatus } from '../types.js';

interface OrderTrackingKanbanProps {
  onSelectOrder: (id: string) => void;
}

export default function OrderTrackingKanban({ onSelectOrder }: OrderTrackingKanbanProps) {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (e) {
      console.error("Error fetching orders for tracking board", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OSStatus) => {
    // Optimistic Update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, statusOS: newStatus } : o));

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statusOS: newStatus })
      });
      if (!res.ok) {
        fetchOrders();
      }
    } catch (err) {
      console.error(err);
      fetchOrders();
    }
  };

  const columns: { id: OSStatus; title: string; color: string; border: string; bg: string; icon: any }[] = [
    { 
      id: 'aguardando', 
      title: 'Aguardando / Rascunho', 
      color: 'text-amber-400', 
      border: 'border-amber-500/10', 
      bg: 'bg-amber-500/5',
      icon: ClipboardList 
    },
    { 
      id: 'producao', 
      title: 'Em Produção', 
      color: 'text-teal-400', 
      border: 'border-teal-500/10', 
      bg: 'bg-teal-500/5',
      icon: Clock 
    },
    { 
      id: 'acabamento', 
      title: 'Acabamento', 
      color: 'text-indigo-400', 
      border: 'border-indigo-500/10', 
      bg: 'bg-indigo-500/5',
      icon: Layers 
    },
    { 
      id: 'pronto', 
      title: 'Pronto p/ Entrega', 
      color: 'text-emerald-400', 
      border: 'border-emerald-500/10', 
      bg: 'bg-emerald-500/5',
      icon: CheckCircle2 
    },
    { 
      id: 'entregue', 
      title: 'Entregue', 
      color: 'text-slate-400', 
      border: 'border-white/5', 
      bg: 'bg-white/[0.02]',
      icon: CheckCircle2 
    }
  ];

  const totalSumByColumn = (status: OSStatus) => {
    return orders
      .filter(o => o.statusOS === status)
      .reduce((sum, o) => sum + o.price, 0);
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar" id="order-tracking-kanban-board">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight leading-none">Acompanhamento Dinâmico de Pedidos</h1>
          <p className="text-xs text-white/40 mt-1.5 font-medium">
            Workflow operacional de ordens de serviço. Visualize o fluxo de produção industrial em colunas de status.
          </p>
        </div>
        
        <button
          onClick={fetchOrders}
          className="self-start md:self-center inline-flex items-center space-x-1.5 px-3 py-1.5 border border-white/5 hover:border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sincronizar Fluxo</span>
        </button>
      </div>

      {/* Grid of Columns */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4" id="tracking-columns-grid">
        {columns.map((col) => {
          const colOrders = orders.filter(o => o.statusOS === col.id);
          const ColIcon = col.icon;

          return (
            <div 
              key={col.id} 
              className={`rounded-xl border p-4 flex flex-col h-[650px] shadow-xs transition-all duration-150 ${col.border} ${col.bg}`}
            >
              {/* Column Title */}
              <div className="flex flex-col mb-4 pb-2.5 border-b border-white/5 space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1.5">
                    <ColIcon className={`w-3.5 h-3.5 ${col.color}`} />
                    <span className="text-[10px] font-black uppercase tracking-wider text-white truncate max-w-[120px]">{col.title}</span>
                  </div>
                  <span className="text-[9px] bg-white/5 text-white/50 font-black px-1.5 py-0.5 rounded-full border border-white/5">
                    {colOrders.length}
                  </span>
                </div>
                {/* Column finance value total */}
                <div className="text-[9px] font-mono text-white/40 font-semibold">
                  R$ {totalSumByColumn(col.id).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              {/* Orders List */}
              <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-1 pb-4">
                {colOrders.map((order) => (
                  <div 
                    key={order.id} 
                    className="bg-[#111113] p-3.5 rounded-xl border border-white/5 shadow-md hover:border-white/15 transition-all group space-y-3"
                    id={`order-card-${order.id}`}
                  >
                    {/* Header: OS Code & View Details */}
                    <div className="flex justify-between items-start">
                      <span className="text-[9px] font-mono font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                        {order.id}
                      </span>
                      
                      <button 
                        onClick={() => onSelectOrder(order.id)}
                        className="p-1 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title="Ver Ficha Técnica"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h4 className="text-xs font-bold text-white leading-snug group-hover:text-indigo-400 transition-colors line-clamp-1">{order.productName}</h4>
                      <p className="text-[9px] text-white/40 mt-1 font-semibold truncate">{order.clientName}</p>
                    </div>

                    {/* Quantity & Value */}
                    <div className="grid grid-cols-2 gap-1.5 text-[9px] bg-white/[0.02] border border-white/5 p-1.5 rounded text-white/50 font-bold">
                      <div>
                        <span className="text-white/30 block text-[7px] uppercase">Qtd</span>
                        <span className="truncate block">{order.quantity}</span>
                      </div>
                      <div>
                        <span className="text-white/30 block text-[7px] uppercase">Faturado</span>
                        <span className="text-indigo-300 block">R$ {order.price.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>

                    {/* Status Changer Dropdown */}
                    <div className="pt-2 border-t border-white/5 space-y-1.5">
                      <label className="block text-[7px] font-extrabold text-white/30 uppercase tracking-wider">Mover Status</label>
                      <select 
                        value={order.statusOS}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as OSStatus)}
                        className="w-full bg-[#111113] border border-white/5 text-[9px] text-white/70 p-1 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer"
                      >
                        <option value="aguardando">Aguardando / Setup</option>
                        <option value="producao">Em Produção</option>
                        <option value="acabamento">Acabamento</option>
                        <option value="pronto">Pronto p/ Entrega</option>
                        <option value="entregue">Entregue</option>
                      </select>
                    </div>

                    {/* Footer: User & Date */}
                    <div className="flex justify-between items-center text-[8px] text-white/40 font-medium">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-2.5 h-2.5 text-white/30" />
                        <span>Entrega: {order.deliveryDate}</span>
                      </span>
                    </div>
                  </div>
                ))}

                {colOrders.length === 0 && (
                  <div className="h-44 flex items-center justify-center text-center text-white/20 text-[10px] font-medium italic">
                    Sem ordens nesta etapa.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
