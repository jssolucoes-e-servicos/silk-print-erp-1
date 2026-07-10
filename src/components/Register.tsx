/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Mail, Building, FileSpreadsheet, MapPin, ArrowLeft, UserPlus, AlertCircle } from 'lucide-react';
import { User as UserType } from '../types.js';

interface RegisterProps {
  onRegisterSuccess: (user: UserType, token: string) => void;
  goToLogin: () => void;
}

export default function Register({ onRegisterSuccess, goToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, companyName, cnpj, address }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onRegisterSuccess(data.user, data.token);
      } else {
        setError(data.error || 'Erro ao registrar conta.');
      }
    } catch (err) {
      setError('Erro ao comunicar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col justify-center py-10 sm:px-6 lg:px-8" id="register-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/20">
            PF
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-white">
          Criar Conta no PrintFlow
        </h2>
        <p className="mt-2 text-center text-xs text-white/40">
          Configure sua gráfica digital ou offset com o sistema ERP completo
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#111113] py-8 px-4 shadow-xl rounded-xl sm:px-10 border border-white/5">
          
          <form className="space-y-4" onSubmit={handleSubmit} id="register-form">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-lg flex items-center space-x-2 text-rose-400 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="reg-name" className="block text-xs font-bold text-white/60 tracking-wide uppercase">
                Seu Nome Completo
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4.5 w-4.5 text-white/40" />
                </div>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-xs text-white border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-white/30 font-medium"
                  placeholder="Ex: João da Silva"
                />
              </div>
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-xs font-bold text-white/60 tracking-wide uppercase">
                Endereço de E-mail
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-white/40" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-xs text-white border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-white/30 font-medium"
                  placeholder="joao@suagrafica.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="reg-company" className="block text-xs font-bold text-white/60 tracking-wide uppercase">
                  Nome da Gráfica
                </label>
                <div className="mt-1.5 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-4.5 w-4.5 text-white/40" />
                  </div>
                  <input
                    id="reg-company"
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-xs text-white border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-white/30 font-medium"
                    placeholder="Arte Digital S/A"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="reg-cnpj" className="block text-xs font-bold text-white/60 tracking-wide uppercase">
                  CNPJ
                </label>
                <div className="mt-1.5 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileSpreadsheet className="h-4.5 w-4.5 text-white/40" />
                  </div>
                  <input
                    id="reg-cnpj"
                    type="text"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-xs text-white border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-white/30 font-medium"
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="reg-address" className="block text-xs font-bold text-white/60 tracking-wide uppercase">
                Endereço Comercial
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4.5 w-4.5 text-white/40" />
                </div>
                <input
                  id="reg-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-xs text-white border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-white/30 font-medium"
                  placeholder="Rua, Número, Bairro, Cidade - Estado"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-xs font-bold tracking-wider uppercase text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Cadastrando...' : (
                  <span className="flex items-center justify-center space-x-2">
                    <UserPlus className="w-4.5 h-4.5" />
                    <span>Concluir Cadastro</span>
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-5 text-center">
            <button
              onClick={goToLogin}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para o Login</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
