/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, FileText, Package, Briefcase, 
  CheckCircle2, AlertTriangle, ArrowUpRight, DollarSign,
  Layers, Clock, RefreshCw, Calendar, ArrowRight
} from 'lucide-react';
import { ServiceOrder, Quotation, StockItem, Task } from '../types.js';

export default function MainDashboard() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [clientsCount, setClientsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch Orders
      const resOrders = await fetch('/api/orders');
      if (resOrders.ok) {
        const data = await resOrders.ok ? await resOrders.json() : [];
        setOrders(data);
      }

      // Fetch Quotations
      const resQuotes = await fetch('/api/quotations');
      if (resQuotes.ok) {
        const data = await resQuotes.json();
        setQuotations(data);
      }

      // Fetch Stock
      const resStock = await fetch('/api/stock');
      if (resStock.ok) {
        const data = await resStock.json();
        setStockItems(data);
      }

      // Fetch Tasks
      const resTasks = await fetch('/api/tasks');
      if (resTasks.ok) {
        const data = await resTasks.json();
        setTasks(data);
      }

      // Fetch Clients count
      const resClients = await fetch('/api/clients');
      if (resClients.ok) {
        const data = await resClients.json();
        setClientsCount(data.length);
      }
    } catch (e) {
      console.error("Failed to load dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Compute metrics
  const activeOrders = orders.filter(o => o.statusOS === 'producao' || o.statusOS === 'acabamento');
  const pendingQuotes = quotations.filter(q => q.status === 'PENDENTE');
  const criticalStock = stockItems.filter(s => s.status === 'CRÍTICO' || s.status === 'AVISO');
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.price, 0);

  // Status counters for SVG graph
  const orderStatusCounts = {
    aguardando: orders.filter(o => o.statusOS === 'aguardando').length,
    producao: orders.filter(o => o.statusOS === 'producao').length,
    acabamento: orders.filter(o => o.statusOS === 'acabamento').length,
    pronto: orders.filter(o => o.statusOS === 'pronto').length,
    entregue: orders.filter(o => o.statusOS === 'entregue').length,
  };

  const statusColors = {
    aguardando: '#f59e0b', // Amber
    producao: '#14b8a6', // Teal
    acabamento: '#6366f1', // Indigo
    pronto: '#10b981', // Emerald
    entregue: '#6b7280', // Slate
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] text-white/40">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-3" />
        <p className="text-xs font-bold uppercase tracking-wider">Carregando painel de controle principal...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar" id="main-dashboard-container">
      {/* Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Painel de Controle Corporativo</h1>
          <p className="text-xs text-white/40 mt-1.5 font-medium">
            Visão geral consolidada do faturamento, controle de estoque crítico, fluxo de ordens e status industrial.
          </p>
        </div>
        <div className="flex items-center space-x-2.5">
          <button 
            onClick={fetchDashboardData}
            className="p-2 border border-white/5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors cursor-pointer"
            title="Atualizar dados"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <span className="text-xs text-white/40 font-mono bg-[#111113] border border-white/5 px-3 py-1.5 rounded-lg font-bold">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* Bento Grid KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-[#111113] p-5.5 rounded-xl border border-white/5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-white/40 uppercase block">Faturamento Geral</span>
              <span className="text-2xl font-black text-white mt-1.5 block">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center text-[10px] text-emerald-400 font-bold space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Valor bruto acumulado de ordens</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#111113] p-5.5 rounded-xl border border-white/5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-white/40 uppercase block">Ordens de Serviço</span>
              <span className="text-2xl font-black text-white mt-1.5 block">{orders.length} OS</span>
            </div>
            <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3.5 border-t border-white/5 flex justify-between text-[10px] font-bold text-white/40">
            <span className="text-indigo-400">{activeOrders.length} ativas em fábrica</span>
            <span>{orders.filter(o => o.statusOS === 'pronto').length} prontas</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#111113] p-5.5 rounded-xl border border-white/5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-white/40 uppercase block">Orçamentos Ativos</span>
              <span className="text-2xl font-black text-white mt-1.5 block">{quotations.length} Propostas</span>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3.5 border-t border-white/5 flex justify-between text-[10px] font-bold text-white/40">
            <span className="text-amber-400">{pendingQuotes.length} pendentes</span>
            <span className="text-emerald-400">{quotations.filter(q => q.status === 'APROVADO').length} aprovados</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#111113] p-5.5 rounded-xl border border-white/5 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-bold text-white/40 uppercase block">Estoque Crítico</span>
              <span className="text-2xl font-black text-white mt-1.5 block">{criticalStock.length} Insumos</span>
            </div>
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3.5 border-t border-white/5 flex items-center text-[10px] font-bold space-x-1 text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Itens abaixo da quantidade mínima</span>
          </div>
        </div>
      </div>

      {/* Main Charts and Status Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Charts: Sales Distribution & Progress */}
        <div className="lg:col-span-2 bg-[#111113] p-6 rounded-xl border border-white/5 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Distribuição de Pedidos por Etapa</h3>
            <p className="text-[10px] text-white/40 mt-1 font-medium">Gráfico analítico do volume de ordens ativas na esteira industrial.</p>
          </div>

          {/* Visual Custom Progress Bars (Bespoke high fidelity chart) */}
          <div className="space-y-4">
            {Object.entries(orderStatusCounts).map(([status, count]) => {
              const total = orders.length || 1;
              const pct = Math.round((count / total) * 100);
              const label = status === 'aguardando' ? 'Entrada / Aguardando' : 
                            status === 'producao' ? 'Em Impressão' :
                            status === 'acabamento' ? 'Acabamento & Vinco' :
                            status === 'pronto' ? 'Pronto p/ Entrega' : 'Entregue';
              const color = statusColors[status as keyof typeof statusColors];

              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-white/70">{label}</span>
                    <span className="text-white/40 font-mono">{count} OS <span className="text-white/20">({pct}%)</span></span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden w-full">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%`, backgroundColor: color }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[11px] font-semibold text-white/40">
            <div className="flex flex-wrap gap-4">
              {Object.entries(statusColors).map(([status, color]) => (
                <span key={status} className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full block" style={{ backgroundColor: color }} />
                  <span className="capitalize">{status}</span>
                </span>
              ))}
            </div>
            <span className="text-indigo-400 flex items-center space-x-1">
              <span>Total: {orders.length}</span>
            </span>
          </div>
        </div>

        {/* Alertas Críticos & Estoque Mínimo */}
        <div className="bg-[#111113] p-6 rounded-xl border border-white/5 flex flex-col justify-between space-y-6">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Avisos do Sistema</h3>
            <p className="text-[10px] text-white/40 mt-1 font-medium font-mono">ESTOQUE & SUPRIMENTOS</p>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-60 custom-scrollbar flex-1">
            {criticalStock.map((item) => (
              <div 
                key={item.id} 
                className={`p-3 rounded-lg border flex justify-between items-center ${
                  item.status === 'CRÍTICO' 
                    ? 'border-rose-500/20 bg-rose-500/5 text-rose-300' 
                    : 'border-amber-500/20 bg-amber-500/5 text-amber-300'
                }`}
              >
                <div className="space-y-1">
                  <p className="text-xs font-extrabold leading-tight">{item.name}</p>
                  <p className="text-[9px] font-mono opacity-60">ID: {item.id} | Cat: {item.category}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black block">{item.quantity} {item.unit}</span>
                  <span className="text-[9px] block font-bold opacity-60">Mín: {item.minQuantity}</span>
                </div>
              </div>
            ))}
            {criticalStock.length === 0 && (
              <div className="p-8 border border-white/5 rounded-lg text-center text-[11px] text-white/30 italic">
                Nenhum insumo de estoque com nível crítico ou em alerta de reabastecimento.
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-4">
            <div className="flex items-center space-x-3 text-xs text-white/50">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                <span>Crítico</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" />
                <span>Alerta</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Tasks & Recent Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Active Trello-Tasks */}
        <div className="bg-[#111113] p-6 rounded-xl border border-white/5 flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tarefas Ativas de Gráfica</h3>
              <p className="text-[10px] text-white/40 mt-1 font-medium">Glance nas tarefas com prioridade alta ou em progresso.</p>
            </div>
            <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
              {tasks.filter(t => t.column !== 'done').length} Pendentes
            </span>
          </div>

          <div className="space-y-3">
            {tasks.filter(t => t.column !== 'done').slice(0, 3).map((task) => (
              <div key={task.id} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-lg flex justify-between items-center hover:border-white/10 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      task.priority === 'alta' ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {task.priority}
                    </span>
                    <span className="text-xs font-bold text-white">{task.title}</span>
                  </div>
                  {task.description && (
                    <p className="text-[10px] text-white/40 line-clamp-1">{task.description}</p>
                  )}
                </div>
                <div className="text-right text-[10px] text-white/40">
                  <span className="block font-bold text-indigo-300">{task.assignedTo}</span>
                  <span className="block mt-0.5">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : ''}</span>
                </div>
              </div>
            ))}
            {tasks.filter(t => t.column !== 'done').length === 0 && (
              <p className="text-xs text-white/30 italic text-center py-6">Nenhuma tarefa operacional pendente no momento.</p>
            )}
          </div>
        </div>

        {/* Latest Active Clients or Quotes */}
        <div className="bg-[#111113] p-6 rounded-xl border border-white/5 flex flex-col justify-between space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Últimos Orçamentos Registrados</h3>
              <p className="text-[10px] text-white/40 mt-1 font-medium">As propostas comerciais de fechamento mais recentes.</p>
            </div>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
              {quotations.length} Totais
            </span>
          </div>

          <div className="space-y-3">
            {quotations.slice(0, 3).map((q) => (
              <div key={q.id} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-white">{q.clientName}</p>
                  <p className="text-[10px] text-white/40 mt-1">{q.serviceType}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black block text-indigo-400">R$ {q.totalValue.toLocaleString('pt-BR')}</span>
                  <span className={`text-[9px] font-black uppercase mt-1 block ${
                    q.status === 'APROVADO' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {q.status}
                  </span>
                </div>
              </div>
            ))}
            {quotations.length === 0 && (
              <p className="text-xs text-white/30 italic text-center py-6">Nenhum orçamento comercial registrado no sistema.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
