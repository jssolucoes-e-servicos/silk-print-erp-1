/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bell, Search, Mail, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { User as UserType } from '../types.js';

interface HeaderProps {
  currentTab: string;
  user: UserType | null;
  onLogout?: () => void;
  onGoToProfile?: () => void;
}

export default function Header({ currentTab, user, onLogout, onGoToProfile }: HeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Translate tab ID to page heading
  const getPageTitle = () => {
    switch (currentTab) {
      case 'production-dashboard': return 'Painel de Produção';
      case 'service-orders': return 'Ordens de Serviço';
      case 'kanban': return 'Fluxo de Produção (Kanban)';
      case 'clients': return 'Gestão de Clientes';
      case 'quotations': return 'Gestão de Orçamentos';
      case 'stock': return 'Controle de Estoque';
      case 'billing': return 'Gestão de Faturamento & Caixa';
      case 'templates': return 'Modelos de Impressão';
      case 'canva-editor': return 'Estúdio de Arte (Canva)';
      case 'profile': return 'Configurações do Perfil';
      case 'order-details': return 'Acompanhamento Técnico da OS';
      default: return 'Visão Geral';
    }
  };

  // Poll for background events (mock emails or payments) to showcase real full-stack feedback
  const fetchLogs = async () => {
    try {
      const emailRes = await fetch('/api/logs/emails');
      const emailLogs = await emailRes.json();
      
      const payRes = await fetch('/api/logs/payments');
      const payLogs = await payRes.json();

      const combined: any[] = [];
      
      emailLogs.slice(0, 4).forEach((mail: any) => {
        combined.push({
          id: mail.id,
          type: 'email',
          title: 'E-mail de Recuperação Enviado',
          body: `Enviado para ${mail.to}`,
          time: new Date(mail.sentAt).toLocaleTimeString('pt-BR'),
          icon: Mail,
          color: 'text-indigo-500'
        });
      });

      payLogs.slice(0, 4).forEach((pay: any) => {
        combined.push({
          id: pay.id,
          type: 'payment',
          title: 'Pagamento Confirmado',
          body: `R$ ${pay.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} - ${pay.clientName}`,
          time: new Date(pay.timestamp).toLocaleTimeString('pt-BR'),
          icon: CheckCircle,
          color: 'text-emerald-500'
        });
      });

      // Default helper notifications if logs are empty
      if (combined.length === 0) {
        combined.push({
          id: 'def-1',
          type: 'system',
          title: 'Sistema Conectado',
          body: 'Base de dados local persistente (db.json) carregada com sucesso.',
          time: 'Agora',
          icon: Shield,
          color: 'text-teal-500'
        });
        combined.push({
          id: 'def-2',
          type: 'alert',
          title: 'Alerta de Estoque Baixo',
          body: '3 insumos estão abaixo do limite mínimo recomendado.',
          time: '1h atrás',
          icon: AlertTriangle,
          color: 'text-amber-500'
        });
      }

      setNotifications(combined);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#0a0a0b]/80 backdrop-blur border-b border-white/5 flex items-center justify-between px-8 relative" id="app-header">
      {/* Title / Context */}
      <div>
        <h2 className="text-lg font-semibold text-white tracking-tight leading-none" id="header-page-title">{getPageTitle()}</h2>
        <p className="text-[11px] text-white/40 mt-1.5 font-medium">PrintFlow ERP / {user?.companyName || 'Minha Gráfica'}</p>
      </div>

      {/* Right Tools Area */}
      <div className="flex items-center space-x-6">
        {/* Search Input Layout */}
        <div className="relative w-72 max-w-xs hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-3.5 w-3.5 text-white/30" />
          </span>
          <input
            type="text"
            placeholder="Pesquisar ordens, clientes..."
            className="w-full pl-9 pr-4 py-2 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 hover:bg-white/10 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-white/30"
          />
        </div>

        {/* Dynamic Activity/Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5 relative transition-colors focus:outline-none"
            id="notifications-bell-btn"
          >
            <Bell className="w-4.5 h-4.5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full ring-2 ring-[#0a0a0b] animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#111113] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden" id="notifications-panel">
              <div className="px-4 py-3 bg-[#111113] border-b border-white/5 flex justify-between items-center">
                <span className="text-xs font-semibold text-white">Notificações e Logs</span>
                <span className="text-[10px] bg-white/10 text-white/70 font-semibold px-2 py-0.5 rounded-full">
                  {notifications.length} ativas
                </span>
              </div>
              
              <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                {notifications.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="p-3.5 hover:bg-white/[0.02] transition-colors flex items-start space-x-3">
                      <div className="p-1.5 rounded-lg bg-white/5 mt-0.5">
                        <Icon className={`w-4.5 h-4.5 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white">{item.title}</p>
                        <p className="text-[11px] text-white/50 mt-0.5 leading-normal">{item.body}</p>
                        <span className="text-[9px] text-white/30 mt-1 block font-medium">{item.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 py-2 border-t border-white/5 bg-[#111113] text-center">
                <button 
                  onClick={() => {
                    fetchLogs();
                    setShowNotifications(false);
                  }}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                >
                  Atualizar Logs
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Identity pill */}
        {user && (
          <div className="flex items-center space-x-3 pl-4 border-l border-white/5">
            <div className="text-right">
              <p className="text-xs font-semibold text-white leading-none">{user.name}</p>
              <p className="text-[10px] text-white/40 mt-1 font-medium truncate max-w-[140px]" title={user.email}>{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
