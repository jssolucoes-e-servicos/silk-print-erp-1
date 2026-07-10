/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar.js';
import Header from './components/Header.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import RecoverPassword from './components/RecoverPassword.js';
import UserProfile from './components/UserProfile.js';
import ClientCRUD from './components/ClientCRUD.js';
import ProductionDashboard from './components/ProductionDashboard.js';
import QuotationCRUD from './components/QuotationCRUD.js';
import StockCRUD from './components/StockCRUD.js';
import BillingCRUD from './components/BillingCRUD.js';
import KanbanBoard from './components/KanbanBoard.js';
import ServiceOrders from './components/ServiceOrders.js';
import OrderDetails from './components/OrderDetails.js';
import CanvaIntegration from './components/CanvaIntegration.js';
import MainDashboard from './components/MainDashboard.js';
import OrderTrackingKanban from './components/OrderTrackingKanban.js';

type TabType = 
  | 'dashboard-geral'
  | 'production-dashboard' 
  | 'order-tracking'
  | 'clients' 
  | 'stock' 
  | 'quotations' 
  | 'billing' 
  | 'kanban' 
  | 'service-orders' 
  | 'order-details' 
  | 'canva-integration' 
  | 'profile';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [authScreen, setAuthScreen] = useState<'login' | 'register' | 'recover'>('login');
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard-geral');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check active user session on startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error('Session verify failed', err);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setCurrentTab('dashboard-geral');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setAuthScreen('login');
  };

  const handleSelectOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    setCurrentTab('order-details');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100">
        <div className="w-12 h-12 rounded-full border-4 border-t-teal-500 border-slate-700 animate-spin" />
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-6 animate-pulse">Iniciando PrintFlow ERP Industrial...</p>
      </div>
    );
  }

  // Auth screens rendering
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        {authScreen === 'login' && (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
            goToRegister={() => setAuthScreen('register')} 
            goToRecover={() => setAuthScreen('recover')} 
          />
        )}
        {authScreen === 'register' && (
          <Register 
            onRegisterSuccess={handleLoginSuccess} 
            goToLogin={() => setAuthScreen('login')} 
          />
        )}
        {authScreen === 'recover' && (
          <RecoverPassword 
            goToLogin={() => setAuthScreen('login')} 
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0a0a0b] overflow-hidden text-[#e2e2e4]" id="printflow-main-app-container">
      {/* Sidebar Navigation */}
      <Sidebar 
        currentTab={currentTab} 
        user={user}
        onLogout={handleLogout}
        onSelectTab={(tab) => {
          setCurrentTab(tab as TabType);
          if (tab !== 'order-details') {
            setSelectedOrderId(null);
          }
        }} 
      />

      {/* Main Content Workspace Wrapper */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header bar with user profile dropdown */}
        <Header 
          currentTab={currentTab}
          user={user} 
          onLogout={handleLogout} 
          onGoToProfile={() => setCurrentTab('profile')} 
        />

        {/* Dynamic Tab Switcher */}
        <main className="flex-1 overflow-hidden bg-[#0a0a0b] relative">
          {currentTab === 'dashboard-geral' && <MainDashboard />}
          {currentTab === 'production-dashboard' && <ProductionDashboard />}
          {currentTab === 'order-tracking' && (
            <OrderTrackingKanban onSelectOrder={handleSelectOrder} />
          )}
          {currentTab === 'clients' && <ClientCRUD />}
          {currentTab === 'stock' && <StockCRUD />}
          {currentTab === 'quotations' && <QuotationCRUD />}
          {currentTab === 'billing' && <BillingCRUD />}
          {currentTab === 'kanban' && <KanbanBoard />}
          {currentTab === 'service-orders' && (
            <ServiceOrders onSelectOrder={handleSelectOrder} />
          )}
          {currentTab === 'order-details' && selectedOrderId && (
            <OrderDetails 
              orderId={selectedOrderId} 
              onBack={() => {
                setCurrentTab('order-tracking');
                setSelectedOrderId(null);
              }} 
            />
          )}
          {currentTab === 'canva-integration' && <CanvaIntegration />}
          {currentTab === 'profile' && (
            <UserProfile 
              user={user} 
              onProfileUpdate={(updated) => setUser(updated)} 
            />
          )}
        </main>
      </div>
    </div>
  );
}
