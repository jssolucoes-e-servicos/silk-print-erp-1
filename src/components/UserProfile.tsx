/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User as UserIcon, Mail, Building, FileText, MapPin, Save, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types.js';

interface UserProfileProps {
  user: UserType | null;
  onProfileUpdate: (updatedUser: UserType) => void;
}

export default function UserProfile({ user, onProfileUpdate }: UserProfileProps) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [cnpj, setCnpj] = useState(user?.cnpj || '');
  const [address, setAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': 'token-admin' // default simulation token
        },
        body: JSON.stringify({ name, email, companyName, cnpj, address }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(true);
        onProfileUpdate(data.user);
      } else {
        setError(data.error || 'Erro ao salvar alterações.');
      }
    } catch (err) {
      setError('Erro ao salvar no servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4" id="user-profile-panel">
      {/* Page header inside panel */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white tracking-tight">Configurações da Conta</h1>
        <p className="text-xs text-white/40 mt-1 font-medium">Gerencie suas credenciais de segurança e dados corporativos da gráfica.</p>
      </div>

      <div className="bg-[#111113] rounded-xl border border-white/5 overflow-hidden shadow-sm">
        {/* Profile Card Header banner */}
        <div className="bg-white/5 border-b border-white/5 px-8 py-10 flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative group">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full object-cover border-4 border-[#111113] ring-2 ring-indigo-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#111113] text-indigo-400 flex items-center justify-center font-bold text-3xl border-4 border-[#111113] ring-2 ring-indigo-500/50">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="text-center md:text-left flex-1">
            <h3 className="text-lg font-bold text-white leading-tight">{name || 'Usuário PrintFlow'}</h3>
            <p className="text-xs text-indigo-400 font-semibold mt-1 tracking-wider uppercase">{user?.role || 'Gerente de Produção'}</p>
            <p className="text-xs text-white/40 mt-1 font-medium">Membro desde {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : '2023'}</p>
          </div>
          <div className="flex items-center space-x-2 bg-white/5 text-white/70 px-3 py-1.5 rounded-lg text-xs font-semibold border border-white/5">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Nível Administrador</span>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6" id="profile-edit-form">
          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center space-x-3 text-emerald-400 text-xs font-semibold">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Suas alterações foram gravadas com sucesso no arquivo local db.json!</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center space-x-3 text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Secção Dados Pessoais */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider pb-1 border-b border-white/5">Dados do Operador</h4>
              
              <div>
                <label className="block text-xs font-bold text-white/60 tracking-wide uppercase">Nome Completo</label>
                <div className="mt-1.5 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-4.5 w-4.5 text-white/40" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-xs text-white border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 tracking-wide uppercase">Endereço de E-mail</label>
                <div className="mt-1.5 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-white/40" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-xs text-white border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Secção Dados Corporativos */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider pb-1 border-b border-white/5">Dados da Empresa / Gráfica</h4>

              <div>
                <label className="block text-xs font-bold text-white/60 tracking-wide uppercase">Razão Social / Nome Fantasia</label>
                <div className="mt-1.5 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4.5 w-4.5 text-white/40" />
                  </div>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-xs text-white border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/60 tracking-wide uppercase">CNPJ Corporativo</label>
                <div className="mt-1.5 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-4.5 w-4.5 text-white/40" />
                  </div>
                  <input
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-xs text-white border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/60 tracking-wide uppercase">Endereço Comercial Sede</label>
            <div className="mt-1.5 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-4.5 w-4.5 text-white/40" />
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 text-xs text-white border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                placeholder="Av. Paulista, 1000, São Paulo, SP"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-white/5 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center space-x-2 px-5 py-2.5 border border-transparent rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
