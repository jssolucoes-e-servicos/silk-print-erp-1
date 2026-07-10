/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, Pause, RefreshCw, AlertCircle, CheckCircle, 
  Settings, Users, Server, Zap, ChevronRight 
} from 'lucide-react';
import { ServiceOrder } from '../types.js';

export default function ProductionDashboard() {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(false);

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
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const getProgressWidth = (status: string) => {
    switch (status) {
      case 'aguardando': return 'w-1/5';
      case 'producao': return 'w-3/5';
      case 'acabamento': return 'w-4/5';
      case 'pronto': return 'w-full';
      case 'entregue': return 'w-full';
      case 'cancelado': return 'w-0';
      default: return 'w-0';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'aguardando': return 'bg-amber-500';
      case 'producao': return 'bg-teal-500 animate-pulse';
      case 'acabamento': return 'bg-indigo-500';
      case 'pronto': return 'bg-emerald-500';
      case 'entregue': return 'bg-slate-400';
      default: return 'bg-rose-500';
    }
  };

  const getStatusLabelPT = (status: string) => {
    switch (status) {
      case 'aguardando': return 'Aguardando';
      case 'producao': return 'Em Produção';
      case 'acabamento': return 'Acabamento';
      case 'pronto': return 'Pronto p/ Entrega';
      case 'entregue': return 'Entregue';
      default: return 'Cancelado';
    }
  };

  const activeOrders = orders.filter(o => o.statusOS === 'producao' || o.statusOS === 'acabamento');
  const pendingOrders = orders.filter(o => o.statusOS === 'aguardando');
  const doneToday = orders.filter(o => o.statusOS === 'pronto' || o.statusOS === 'entregue');

  // Machines list
  const machines = [
    { name: 'Heidelberg Speedmaster XL 106', type: 'Offset', status: 'Ativa', load: '85%', speed: '15.000 fls/h', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/10' },
    { name: 'Xerox Versant 4100 Press', type: 'Digital', status: 'Setup', load: '40%', speed: '100 ppm', color: 'border-amber-500/20 text-amber-400 bg-amber-500/10' },
    { name: 'Konica Minolta AccurioJet KM-1', type: 'Grandes Formatos', status: 'Parada', load: '0%', speed: '3.000 fls/h', color: 'border-rose-500/20 text-rose-400 bg-rose-500/10' },
    { name: 'Ploter Graphtec FC9000-140', type: 'Corte e Acabamento', status: 'Calibração', load: '15%', speed: '1.485 mm/s', color: 'border-indigo-500/20 text-indigo-400 bg-indigo-500/10' }
  ];

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar" id="production-dashboard-panel">
      {/* Top Banner KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-[#111113] p-6 rounded-xl border border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Ordens em Curso</span>
            <span className="text-3xl font-black text-white mt-2 block">{activeOrders.length}</span>
            <span className="text-[10px] text-teal-400 font-bold mt-1.5 inline-flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Carga Alta</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
            <Server className="w-6 h-6 text-teal-400" />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#111113] p-6 rounded-xl border border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Pendente Aprovação</span>
            <span className="text-3xl font-black text-white mt-2 block">{pendingOrders.length}</span>
            <span className="text-[10px] text-amber-400 font-bold mt-1.5 inline-flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Aguardando Prova</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#111113] p-6 rounded-xl border border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Concluído Hoje</span>
            <span className="text-3xl font-black text-white mt-2 block">{doneToday.length}</span>
            <span className="text-[10px] text-emerald-400 font-bold mt-1.5 inline-flex items-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Metas Diárias Batidas</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#111113] p-6 rounded-xl border border-white/5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Eficiência Média</span>
            <span className="text-3xl font-black text-white mt-2 block">92%</span>
            <span className="text-[10px] text-teal-400 font-bold mt-1.5 inline-flex items-center space-x-1">
              <Settings className="w-3.5 h-3.5" />
              <span>OEE Excelente</span>
            </span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center">
            <Zap className="w-6 h-6 text-teal-400" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fila de Produção Table Grid */}
        <div className="lg:col-span-2 bg-[#111113] rounded-xl border border-white/5 overflow-hidden shadow-sm flex flex-col">
          <div className="px-6 py-4.5 border-b border-white/5 bg-[#111113] flex justify-between items-center">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Fila Ativa de Produção</h3>
              <p className="text-[11px] text-white/40 mt-1">Status e andamento das ordens em execução na fábrica.</p>
            </div>
            <span className="text-[10px] bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold px-2.5 py-1 rounded-full">
              {orders.length} Totais
            </span>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse" id="production-queue-table">
              <thead>
                <tr className="border-b border-white/5 bg-[#111113]">
                  <th className="px-6 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Código OS</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Insumo / Trabalho</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Quantidade</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Prazo Entrega</th>
                  <th className="px-6 py-3 text-[10px] font-semibold text-white/30 uppercase tracking-wider">Andamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-white">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-semibold text-white/90">{order.productName}</p>
                      <p className="text-[10px] text-white/40 mt-0.5">{order.clientName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-white/70">{order.quantity}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-white/50">{order.deliveryDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-36">
                        <div className="flex justify-between items-center mb-1 text-[10px] font-bold">
                          <span className={`text-${getProgressColor(order.statusOS).replace('bg-', '')}`}>
                            {getStatusLabelPT(order.statusOS)}
                          </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                          <div className={`h-full rounded-full ${getProgressColor(order.statusOS)} ${getProgressWidth(order.statusOS)}`} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Machine Status and Capacity Gauge */}
        <div className="space-y-8 flex flex-col">
          {/* Circular Efficiency Capacity Block */}
          <div className="bg-[#111113] rounded-xl border border-white/5 p-6 flex flex-col items-center shadow-sm">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider mb-4 self-start">Utilização de Capacidade</h3>
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Radial circle simulated SVG */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="60" className="stroke-white/5 fill-none" strokeWidth="10" />
                <circle cx="72" cy="72" r="60" className="stroke-indigo-500 fill-none stroke-dasharray-[376] stroke-dashoffset-[83] transition-all duration-1000" strokeWidth="10" strokeLinecap="round" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">78%</span>
                <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider mt-0.5">Ativo</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between w-full text-[11px] font-semibold text-white/50 border-t border-white/5 pt-4">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 block" />
                <span>78% Produção</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/10 block" />
                <span>22% Ocioso</span>
              </span>
            </div>
          </div>

          {/* Machine Grid Status */}
          <div className="bg-[#111113] rounded-xl border border-white/5 p-6 shadow-sm flex-1">
            <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-4">Status do Parque Gráfico</h3>
            <div className="space-y-4">
              {machines.map((machine, idx) => (
                <div key={idx} className="p-3 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold text-white leading-tight">{machine.name}</p>
                      <p className="text-[10px] text-white/40 mt-1 font-semibold">{machine.type}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${machine.color}`}>
                      {machine.status}
                    </span>
                  </div>
                  <div className="mt-3 flex justify-between text-[11px] text-white/50 font-medium">
                    <span>Uso: <strong>{machine.load}</strong></span>
                    <span>Velocidade: <strong>{machine.speed}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
