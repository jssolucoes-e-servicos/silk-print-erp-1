/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Kanban, 
  Users, 
  FileText, 
  Package, 
  DollarSign, 
  Printer, 
  Palette, 
  User, 
  LogOut,
  Sliders
} from 'lucide-react';
import { User as UserType } from '../types.js';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  user: UserType | null;
  onLogout: () => void;
}

export default function Sidebar({ currentTab, onSelectTab, user, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard-geral', label: 'Dashboard Geral', icon: LayoutDashboard },
    { id: 'production-dashboard', label: 'Painel de Produção', icon: Printer },
    { id: 'order-tracking', label: 'Acompanhamento de Pedidos', icon: Kanban },
    { id: 'service-orders', label: 'Ordens de Serviço', icon: Briefcase },
    { id: 'kanban', label: 'Quadro de Tarefas (Kanban)', icon: Sliders },
    { id: 'clients', label: 'Gestão de Clientes', icon: Users },
    { id: 'quotations', label: 'Orçamentos', icon: FileText },
    { id: 'stock', label: 'Controle de Estoque', icon: Package },
    { id: 'billing', label: 'Faturamento & Caixa', icon: DollarSign },
    { id: 'canva-integration', label: 'Canva Connect API', icon: Palette },
  ];

  return (
    <aside className="w-64 bg-[#111113] text-[#e2e2e4] flex flex-col h-screen border-r border-white/5 shadow-2xl" id="app-sidebar">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5 flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base tracking-wider shadow-lg shadow-indigo-500/20">
          PF
        </div>
        <div>
          <h1 className="text-base font-semibold text-white tracking-tight leading-none">PrintFlow</h1>
          <span className="text-[10px] text-white/30 font-bold tracking-widest uppercase">ERP Industrial</span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-3 mb-2">Menu Principal</div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-all duration-150 ${
                isActive 
                  ? 'bg-white/5 text-white font-semibold border border-white/5' 
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Area Footer */}
      {user && (
        <div className="p-4 border-t border-white/5 bg-[#111113] flex flex-col space-y-3">
          <div className="flex items-center space-x-3 p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <button 
              onClick={() => onSelectTab('profile')}
              className="relative group focus:outline-none"
              title="Meu Perfil"
              id="sidebar-profile-btn"
            >
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full object-cover border border-white/10 group-hover:border-indigo-500 transition-colors"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </button>
            <div className="flex-1 min-w-0" onClick={() => onSelectTab('profile')}>
              <p className="text-xs font-medium text-white truncate cursor-pointer hover:text-indigo-400 transition-colors">{user.name}</p>
              <p className="text-[10px] text-white/40 font-medium truncate uppercase tracking-wider">{user.role}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center px-1">
            <button
              onClick={() => onSelectTab('profile')}
              id="sidebar-settings-btn"
              className="flex items-center space-x-1.5 text-xs text-white/40 hover:text-white transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configurações</span>
            </button>
            
            <button
              onClick={onLogout}
              id="sidebar-logout-btn"
              className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-2 py-1 rounded transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
