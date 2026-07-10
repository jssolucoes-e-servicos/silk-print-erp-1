/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, FileText, CheckCircle, Clock, Trash2, Upload, 
  MapPin, ShieldCheck, Play, Plus, BookOpen, User, DollarSign, CloudLightning
} from 'lucide-react';
import { ServiceOrder, OSFile, OSStatus } from '../types.js';

interface OrderDetailsProps {
  orderId: string;
  onBack: () => void;
}

export default function OrderDetails({ orderId, onBack }: OrderDetailsProps) {
  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [internalNote, setInternalNote] = useState('');
  
  // Drag and drop upload state
  const [dragActive, setDragActive] = useState(false);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data: ServiceOrder[] = await res.json();
        const found = data.find(o => o.id === orderId);
        if (found) {
          setOrder(found);
          setInternalNote(found.notes || '');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const handleSaveNotes = async () => {
    if (!order) return;
    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: internalNote })
      });
      if (res.ok) {
        alert('Instruções e anotações técnicas salvas com sucesso!');
        fetchOrderDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Upload file simulation
  const handleUploadFileSimulation = async (fileName: string) => {
    if (!order) return;
    const newFile: OSFile = {
      name: fileName,
      type: fileName.split('.').pop()?.toUpperCase() || 'PDF',
      url: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19'
    };
    const updatedFiles = [...(order.files || []), newFile];

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: updatedFiles })
      });
      if (res.ok) {
        fetchOrderDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleUploadFileSimulation(file.name);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadFileSimulation(e.target.files[0].name);
    }
  };

  const handleDeleteFile = async (idx: number) => {
    if (!order) return;
    const updatedFiles = (order.files || []).filter((_, i) => i !== idx);

    try {
      const res = await fetch(`/api/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: updatedFiles })
      });
      if (res.ok) {
        fetchOrderDetails();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs font-semibold text-white/40">Buscando andamento técnico da ordem...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center text-xs font-bold text-rose-400">Ordem de Serviço não encontrada.</div>;
  }

  // Calculate timeline step activation
  const getTimelineSteps = (status: OSStatus) => {
    const sequence: OSStatus[] = ['aguardando', 'producao', 'acabamento', 'pronto', 'entregue'];
    const idx = sequence.indexOf(status);
    return [
      { key: 'aguardando', title: 'Entrada / Setup', active: idx >= 0 },
      { key: 'pré-press', title: 'Pré-Impressão', active: idx >= 0 }, // Combined helper
      { key: 'producao', title: 'Impressão Off/Dig', active: idx >= 1 },
      { key: 'acabamento', title: 'Acabamento & Vinco', active: idx >= 2 },
      { key: 'expedição', title: 'Expedição / Entrega', active: idx >= 3 }
    ];
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar" id="order-details-panel">
      {/* Back button link */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-white/40 hover:text-white transition-colors"
          id="btn-back-to-orders"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
          <span>Voltar para as Ordens</span>
        </button>
        <div className="flex items-center space-x-2 bg-white/5 text-white/60 px-3 py-1.5 rounded-lg text-[10px] font-bold">
          <CloudLightning className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Integração de Produção Ativa</span>
        </div>
      </div>

      {/* Production Timeline Block */}
      <div className="bg-[#111113] rounded-xl border border-white/5 p-6 shadow-sm">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-6">Workflow de Produção Industrial</h3>
        <div className="relative flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
          
          {/* Horizontal progress bar behind timeline nodes */}
          <div className="absolute left-8 right-8 top-5 h-1 bg-white/5 hidden md:block z-0" />
          
          {getTimelineSteps(order.statusOS).map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center z-10 relative">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-inner transition-all ${
                step.active 
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20' 
                  : 'bg-white/5 text-white/30 border border-white/5'
              }`}>
                {idx + 1}
              </div>
              <p className={`text-xs font-bold mt-3 ${step.active ? 'text-white' : 'text-white/40'}`}>{step.title}</p>
              <p className="text-[9px] text-white/40 mt-1 font-semibold">{step.active ? 'Concluído' : 'Pendente'}</p>
            </div>
          ))}

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left main info columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Work Items Table */}
          <div className="bg-[#111113] rounded-xl border border-white/5 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Especificação do Trabalho</h3>
              <span className="text-xs font-bold text-white/40">ID: {order.id}</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="px-6 py-3 text-[10px] font-bold text-white/40 uppercase">Descrição do Insumo</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-white/40 uppercase">Quantidade</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-white/40 uppercase">Preço Faturado</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5 text-xs">
                  <td className="px-6 py-4.5">
                    <p className="font-bold text-white">{order.productName}</p>
                    <p className="text-[10px] text-white/40 mt-1">Corte reto, refile, conferência de pantone de capa.</p>
                  </td>
                  <td className="px-6 py-4.5 font-bold text-white/70">{order.quantity}</td>
                  <td className="px-6 py-4.5 font-bold text-indigo-400">R$ {order.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Drag & Drop File Upload simulation section */}
          <div className="bg-[#111113] rounded-xl border border-white/5 p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Arquivos de Impressão (Fichas / Vetores)</h3>
            
            {/* Draggable Upload Zone */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-500/10' 
                  : 'border-white/5 bg-white/5 hover:bg-white/10'
              }`}
            >
              <Upload className="w-8 h-8 text-white/40 mb-3" />
              <p className="text-xs font-bold text-white">Arraste a arte aqui para carregar</p>
              <p className="text-[10px] text-white/40 mt-1">Ou clique para procurar em seu dispositivo local</p>
              
              <label className="mt-4 px-3.5 py-2 bg-white/5 border border-white/5 rounded-lg text-xs font-bold text-white cursor-pointer shadow-xs hover:bg-white/10">
                Selecionar Arquivo
                <input 
                  type="file" 
                  className="hidden" 
                  onChange={handleFileInput}
                />
              </label>
            </div>

            {/* List of files matching wireframe */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Arquivos Carregados</h4>
              {order.files && order.files.map((file, idx) => (
                <div key={idx} className="p-3 bg-white/5 border border-white/5 rounded-lg flex justify-between items-center hover:border-white/10 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white/5 text-white/50 rounded flex items-center justify-center font-black text-xs font-mono">
                      {file.type}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{file.name}</p>
                      <span className="text-[9px] text-white/40 mt-1 font-semibold">Tamanho: 14.5 MB</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a 
                      href={file.url || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-bold uppercase transition-colors"
                    >
                      Download
                    </a>
                    <button 
                      onClick={() => handleDeleteFile(idx)}
                      className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {(!order.files || order.files.length === 0) && (
                <p className="text-[11px] text-white/30 italic text-center py-4">Nenhum vetor anexado a esta OS.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right side drawers */}
        <div className="space-y-8 flex flex-col">
          
          {/* Client summary Card */}
          <div className="bg-[#111113] rounded-xl border border-white/5 p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <User className="w-5 h-5 text-indigo-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Cliente Solicitante</h4>
            </div>
            <div className="space-y-3 text-xs font-medium">
              <div>
                <span className="text-white/40">Nome:</span>
                <p className="text-white font-bold mt-0.5">{order.clientName}</p>
              </div>
              <div>
                <span className="text-white/40">CNPJ Faturamento:</span>
                <p className="text-white/60 font-mono mt-0.5">{order.cnpj}</p>
              </div>
            </div>
          </div>

          {/* Financial summary card */}
          <div className="bg-[#111113] rounded-xl border border-white/5 p-5 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <DollarSign className="w-5 h-5 text-indigo-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Informações Financeiras</h4>
            </div>
            <div className="space-y-3 text-xs font-medium">
              <div className="flex justify-between">
                <span className="text-white/40">Valor Faturado:</span>
                <strong className="text-white">R$ {order.price.toLocaleString('pt-BR')}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Situação:</span>
                <strong className={order.paymentStatus === 'pago' ? 'text-emerald-400' : 'text-amber-400'}>
                  {order.paymentStatus === 'pago' ? 'Líquido / Pago' : 'Pendente de Faturamento'}
                </strong>
              </div>
            </div>
          </div>

          {/* Technical production notes */}
          <div className="bg-[#111113] rounded-xl border border-white/5 p-5 shadow-sm space-y-4 flex-1 flex flex-col">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Instruções de Acabamento</h4>
            </div>
            <textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              rows={6}
              className="w-full flex-1 p-3 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 focus:bg-[#111113] resize-none"
              placeholder="Digite observações de pré-impressão, mídias de laminação, facas de corte..."
            />
            <button
              onClick={handleSaveNotes}
              className="w-full inline-flex items-center justify-center py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider"
            >
              Gravar Instruções
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
