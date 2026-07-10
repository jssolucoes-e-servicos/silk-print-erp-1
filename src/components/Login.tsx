/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';
import { User as UserType } from '../types.js';

interface LoginProps {
  onLoginSuccess: (user: UserType, token: string) => void;
  goToRegister: () => void;
  goToRecover: () => void;
}

export default function Login({ onLoginSuccess, goToRegister, goToRecover }: LoginProps) {
  const [email, setEmail] = useState('jackson144@gmail.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onLoginSuccess(data.user, data.token);
      } else {
        setError(data.error || 'Credenciais inválidas. Tente novamente.');
      }
    } catch (err) {
      setError('Erro ao comunicar com o servidor de autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col justify-center py-12 sm:px-6 lg:px-8" id="login-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/20">
            PF
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-white font-sans">
          Entrar no PrintFlow ERP
        </h2>
        <p className="mt-2 text-center text-xs text-white/40">
          Gerenciamento industrial de orçamentos, faturamento e produção gráfica
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#111113] py-8 px-4 shadow-xl rounded-xl sm:px-10 border border-white/5">
          
          <form className="space-y-6" onSubmit={handleSubmit} id="login-form">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-lg flex items-center space-x-2 text-rose-400 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-bold text-white/60 tracking-wide uppercase">
                Endereço de E-mail
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4.5 w-4.5 text-white/40" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-xs text-white border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-white/30 font-medium"
                  placeholder="exemplo@grafica.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-bold text-white/60 tracking-wide uppercase">
                  Senha de Acesso
                </label>
                <div className="text-xs">
                  <button
                    type="button"
                    onClick={goToRecover}
                    className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
              </div>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4.5 w-4.5 text-white/40" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 text-xs text-white border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-white/30 font-medium"
                  placeholder="******"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-xs font-bold tracking-wider uppercase text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Entrando...' : (
                  <span className="flex items-center justify-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>Acessar o Painel</span>
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-[#111113] text-white/40 font-medium">Novo na plataforma?</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={goToRegister}
                className="w-full flex justify-center py-2.5 px-4 border border-white/5 rounded-lg text-xs font-bold text-white/80 bg-white/5 hover:bg-white/10 transition-colors focus:outline-none cursor-pointer"
              >
                Criar uma Conta Gratuita
              </button>
            </div>
          </div>

          {/* Quick Login Assist Hint */}
          <div className="mt-6 bg-white/5 rounded-lg p-3 border border-white/5 text-[11px] text-white/40 flex items-start space-x-2.5">
            <Sparkles className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Dica de Acesso Rápido</p>
              <p className="mt-0.5 leading-normal text-white/40">
                Clique em <strong>Acessar o Painel</strong> para entrar instantaneamente com o e-mail cadastrado (<strong>jackson144@gmail.com</strong>). O banco de dados é persistente no servidor.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
