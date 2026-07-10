/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Filter, X, Save, 
  User, Mail, Phone, MapPin, FileText, CheckCircle, Clock, AlertTriangle 
} from 'lucide-react';
import { Client, ClientStatus } from '../types.js';

export default function ClientCRUD() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    cnpj: '',
    balance: '0',
    status: 'ativo' as ClientStatus
  });

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      companyName: '',
      email: '',
      phone: '',
      address: '',
      cnpj: '',
      balance: '0',
      status: 'ativo'
    });
    setShowFormModal(true);
  };

  const handleOpenEditModal = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingClient(client);
    setFormData({
      name: client.name,
      companyName: client.companyName,
      email: client.email,
      phone: client.phone,
      address: client.address,
      cnpj: client.cnpj,
      balance: String(client.balance),
      status: client.status
    });
    setShowFormModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let url = '/api/clients';
      let method = 'POST';
      
      if (editingClient) {
        url = `/api/clients/${editingClient.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          balance: Number(formData.balance)
        })
      });

      if (res.ok) {
        setShowFormModal(false);
        fetchClients();
        setSelectedClient(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja remover este cliente permanentemente?')) {
      try {
        const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
        if (res.ok) {
          fetchClients();
          setSelectedClient(null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Filter clients
  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.companyName.toLowerCase().includes(search.toLowerCase()) ||
                          c.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = statusFilter === 'todos' || c.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: ClientStatus) => {
    switch (status) {
      case 'ativo':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Ativo</span>
          </span>
        );
      case 'debito':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Em Débito</span>
          </span>
        );
      case 'inativo':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            <Clock className="w-3.5 h-3.5" />
            <span>Inativo</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden" id="clients-management-layout">
      {/* Main List Section */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-white tracking-tight leading-none">Clientes Cadastrados</h1>
            <p className="text-xs text-white/40 mt-1.5 font-medium">Cadastre, edite e monitore os saldos e limites de crédito dos clientes.</p>
          </div>
          <button
            onClick={handleOpenAddModal}
            id="btn-add-client"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-[#111113] p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-white/40" />
            <input
              type="text"
              placeholder="Pesquisar por nome, empresa ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 hover:bg-white/10 focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-white/30"
            />
          </div>

          <div className="flex items-center space-x-2.5 w-full md:w-auto">
            <Filter className="w-4.5 h-4.5 text-white/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            >
              <option value="todos" className="bg-[#111113] text-white">Todos os Status</option>
              <option value="ativo" className="bg-[#111113] text-white">Ativos</option>
              <option value="debito" className="bg-[#111113] text-white">Em Débito</option>
              <option value="inativo" className="bg-[#111113] text-white">Inativos</option>
            </select>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-[#111113] rounded-xl border border-white/5 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse" id="clients-table">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Empresa / CNPJ</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Pedidos</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Última Compra</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Saldo Líquido</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.map((client) => (
                <tr
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`hover:bg-white/5 cursor-pointer transition-colors ${
                    selectedClient?.id === client.id ? 'bg-indigo-500/10' : ''
                  }`}
                >
                  <td className="px-6 py-4.5">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-white/10 text-white flex items-center justify-center font-bold text-sm">
                        {client.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white leading-tight">{client.name}</p>
                        <p className="text-[10px] text-white/40 mt-1 font-medium">{client.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <p className="text-xs font-semibold text-white/70">{client.companyName}</p>
                    <p className="text-[10px] text-white/40 mt-1 font-mono">{client.cnpj || 'Não Informado'}</p>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="text-xs font-semibold text-white/70">{client.totalOrders}</span>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="text-xs font-medium text-white/55">{client.lastOrder}</span>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className={`text-xs font-bold ${client.balance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      R$ {client.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    {getStatusBadge(client.status)}
                  </td>
                  <td className="px-6 py-4.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={(e) => handleOpenEditModal(client, e)}
                        className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(client.id, e)}
                        className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/30 text-xs font-medium">
                    Nenhum cliente encontrado com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Side Drawer */}
      {selectedClient && (
        <div className="w-96 bg-[#111113] border-l border-white/5 flex flex-col h-full shadow-2xl" id="client-details-drawer">
          <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Histórico do Cliente</span>
            <button
              onClick={() => setSelectedClient(null)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar">
            {/* Quick overview */}
            <div className="flex flex-col items-center text-center pb-4 border-b border-white/5">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-black text-2xl mb-3.5 shadow-inner">
                {selectedClient.name.charAt(0)}
              </div>
              <h3 className="text-sm font-semibold text-white leading-tight">{selectedClient.name}</h3>
              <p className="text-xs text-white/40 mt-1">{selectedClient.companyName}</p>
            </div>

            {/* Profile Info Fields */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5 text-xs">
                <Mail className="w-4 h-4 text-white/40" />
                <span className="text-white/75 font-medium truncate">{selectedClient.email}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-xs">
                <Phone className="w-4 h-4 text-white/40" />
                <span className="text-white/75 font-semibold">{selectedClient.phone}</span>
              </div>
              {selectedClient.address && (
                <div className="flex items-start space-x-2.5 text-xs">
                  <MapPin className="w-4 h-4 text-white/40 mt-0.5" />
                  <span className="text-white/60 leading-relaxed font-medium">{selectedClient.address}</span>
                </div>
              )}
            </div>

            {/* Timeline logs */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white/80 tracking-wide uppercase border-b border-white/5 pb-1.5">Registro de Atividades</h4>
              <div className="relative pl-4 border-l border-white/5 space-y-4.5 py-1">
                {selectedClient.activityHistory?.map((log, idx) => (
                  <div key={idx} className="relative">
                    <span className="absolute -left-6 top-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-[#111113]" />
                    <p className="text-xs text-white/75 font-medium leading-relaxed">{log}</p>
                  </div>
                ))}
                {(!selectedClient.activityHistory || selectedClient.activityHistory.length === 0) && (
                  <p className="text-[11px] text-white/30 italic">Sem eventos de auditoria.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CRUD Add/Edit Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4" id="client-form-modal">
          <div className="bg-[#111113] rounded-xl border border-white/5 w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                {editingClient ? 'Editar Cadastro' : 'Novo Cliente'}
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Nome do Cliente</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium"
                    placeholder="Ex: Carlos Albuquerque"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Razão Social / Fantasia</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium"
                    placeholder="Ex: Gráfica Premium Ltda"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">E-mail Comercial</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium"
                    placeholder="carlos@empresa.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Telefone / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium"
                    placeholder="+55 11 98888-8888"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">CNPJ</label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Status da Conta</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ClientStatus })}
                    className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium"
                  >
                    <option value="ativo" className="bg-[#111113] text-white">Ativo</option>
                    <option value="debito" className="bg-[#111113] text-white">Em Débito</option>
                    <option value="inativo" className="bg-[#111113] text-white">Inativo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Endereço Comercial Completo</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium"
                  placeholder="Rua, Número, Cidade, Estado"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-white/50 tracking-wide uppercase">Saldo Inicial Líquido (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 font-medium"
                  placeholder="0.00"
                />
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
                  Confirmar Cadastro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
