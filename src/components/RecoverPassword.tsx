/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';

interface RecoverPasswordProps {
  goToLogin: () => void;
}

export default function RecoverPassword({ goToLogin }: RecoverPasswordProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/recover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Erro ao processar solicitação.');
      }
    } catch (err) {
      setError('Erro ao comunicar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col justify-center py-12 sm:px-6 lg:px-8" id="recover-screen">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-indigo-500/20">
            PF
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-black tracking-tight text-white">
          Recuperar sua Senha
        </h2>
        <p className="mt-2 text-center text-xs text-white/40">
          Enviaremos instruções de recuperação de segurança para sua conta
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#111113] py-8 px-4 shadow-xl rounded-xl sm:px-10 border border-white/5">
          
          {success ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white">E-mail Enviado!</h3>
                <p className="text-xs text-white/40 leading-relaxed">
                  Enviamos as instruções para <strong className="text-white">{email}</strong>. 
                </p>
                <div className="bg-white/5 border border-white/5 rounded-lg p-3 text-[11px] text-white/40 text-left mt-4 leading-normal">
                  <span className="font-bold text-white block mb-1">💡 Simulação Integrada Ativa</span>
                  Como você está no ambiente de desenvolvimento integrado do PrintFlow, um e-mail virtual foi disparado. Você poderá visualizar o link de redefinição no painel de <strong>Notificações e Logs (Sino)</strong> no cabeçalho do sistema assim que acessar o painel de controle!
                </div>
              </div>
              <div className="pt-2">
                <button
                  onClick={goToLogin}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
                >
                  Voltar para o Login
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit} id="recover-form">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-lg flex items-center space-x-2 text-rose-400 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label htmlFor="recover-email" className="block text-xs font-bold text-white/60 tracking-wide uppercase">
                  Endereço de E-mail
                </label>
                <div className="mt-1.5 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4.5 w-4.5 text-white/40" />
                  </div>
                  <input
                    id="recover-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-xs text-white border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-white/30 font-medium"
                    placeholder="jackson144@gmail.com"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-xs font-bold tracking-wider uppercase text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md cursor-pointer"
                >
                  {loading ? 'Enviando...' : (
                    <span className="flex items-center justify-center space-x-2">
                      <Send className="w-4 h-4" />
                      <span>Solicitar Link Único</span>
                    </span>
                  )}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={goToLogin}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar para o Login</span>
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
