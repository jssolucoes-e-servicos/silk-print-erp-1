/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Palette, ExternalLink, Sparkles, RefreshCw, CheckCircle2, 
  Link2, Image, FileText, ArrowRight, Layers, Settings, CloudLightning,
  AlertCircle, Download, FileUp, PlusCircle
} from 'lucide-react';

interface CanvaDesign {
  id: string;
  title: string;
  thumbnail: string;
  updatedAt: string;
  type: string;
  dimensions: string;
}

export default function CanvaIntegration() {
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [designs, setDesigns] = useState<CanvaDesign[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  
  // Design Button / Creator modal simulation
  const [showCreator, setShowCreator] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('flyer');
  const [creatingFromCanva, setCreatingFromCanva] = useState(false);
  const [newDesignName, setNewDesignName] = useState('Novo Flyer de Promoção');

  // Load imported designs
  useEffect(() => {
    if (isConnected) {
      loadCanvaDesigns();
    }
  }, [isConnected]);

  const loadCanvaDesigns = () => {
    setLoadingDesigns(true);
    setTimeout(() => {
      setDesigns([
        { 
          id: "canva-des-001", 
          title: "Flyer Verão Tropical - Arte Oficial", 
          thumbnail: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80", 
          updatedAt: "Hoje às 14:32", 
          type: "Flyer (SRA3)", 
          dimensions: "297 x 420 mm" 
        },
        { 
          id: "canva-des-002", 
          title: "Folder Corporativo Tech Solutions", 
          thumbnail: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80", 
          updatedAt: "Ontem às 18:15", 
          type: "Folder Dobrável", 
          dimensions: "A4 Tripartido" 
        },
        { 
          id: "canva-des-003", 
          title: "Cartão de Visita Premium SoftTouch", 
          thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&q=80", 
          updatedAt: "05 Jul 2026", 
          type: "Cartão de Visita", 
          dimensions: "90 x 50 mm" 
        }
      ]);
      setLoadingDesigns(false);
    }, 800);
  };

  const handleConnect = () => {
    setConnecting(true);
    // Simulate OAuth pop-up workflow
    setTimeout(() => {
      setIsConnected(true);
      setConnecting(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    setDesigns([]);
  };

  const handleCreateDesign = (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingFromCanva(true);
    
    setTimeout(() => {
      const newDesign: CanvaDesign = {
        id: "canva-des-" + Date.now(),
        title: newDesignName,
        thumbnail: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400&q=80",
        updatedAt: "Agora mesmo",
        type: selectedDocType === 'flyer' ? 'Flyer SRA3' : selectedDocType === 'business_card' ? 'Cartão de Visita' : 'Banner Lona',
        dimensions: selectedDocType === 'flyer' ? '297 x 420 mm' : selectedDocType === 'business_card' ? '90 x 50 mm' : '1000 x 2000 mm'
      };
      
      setDesigns(prev => [newDesign, ...prev]);
      setCreatingFromCanva(false);
      setShowCreator(false);
      setNewDesignName('Novo Design Canva');
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-[calc(100vh-4rem)] custom-scrollbar" id="canva-integration-hub">
      {/* Title & Badge */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center space-x-2.5">
            <span className="p-1 bg-indigo-500/10 rounded-md text-indigo-400">
              <Palette className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none">Canva Connect API Hub</h1>
          </div>
          <p className="text-xs text-white/40 mt-1.5 font-medium">
            Integração oficial através da API de Conexão do Canva. Sincronize artes criadas por seus clientes e importe PDF/X industriais diretamente para produção.
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
            isConnected 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'} animate-pulse`} />
            <span>{isConnected ? 'API Conectada' : 'Aguardando Credenciais'}</span>
          </span>
        </div>
      </div>

      {!isConnected ? (
        /* Unconnected State - OAuth onboarding */
        <div className="max-w-xl mx-auto py-12 text-center" id="canva-unconnected">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center mx-auto mb-6 text-indigo-400 shadow-xl">
            <CloudLightning className="w-8 h-8" />
          </div>
          <h2 className="text-lg font-bold text-white">Configurar Integração Canva API</h2>
          <p className="text-xs text-white/50 mt-2 leading-relaxed">
            Permita que seus clientes projetem no Canva e exportem as artes de alta resolução (PDF de Impressão com sangrias) diretamente para o fluxo de trabalho do PrintFlow ERP.
          </p>

          <div className="bg-[#111113] border border-white/5 rounded-xl p-5 mt-8 text-left space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Como funciona o Canva Connect:</h3>
            <div className="space-y-2.5 text-[11px] text-white/50">
              <p className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span><strong>OAuth 2.0 Seguro</strong>: Autentique sua gráfica digital no Canva Developer Hub de forma simples.</span>
              </p>
              <p className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span><strong>Canva Button SDK</strong>: Um botão em seu portal ou ordem de serviço que abre o editor do Canva em uma modal flutuante.</span>
              </p>
              <p className="flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <span><strong>Geração Automática de PDF/X-4</strong>: Renderize sangrias e marcas de corte diretamente para a fila de impressão da sua gráfica.</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleConnect}
            disabled={connecting}
            className="mt-8 inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer disabled:opacity-50"
            id="connect-canva-btn"
          >
            {connecting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Conectando com o Canva...</span>
              </>
            ) : (
              <>
                <Palette className="w-4 h-4" />
                <span>Conectar Conta de Desenvolvedor Canva</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Connected State */
        <div className="space-y-8" id="canva-connected-dashboard">
          {/* Quick Actions Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#111113] border border-white/5 p-5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-white/40 uppercase block">Canva Button SDK</span>
                <h3 className="text-sm font-semibold text-white mt-1">Iniciar Novo Design Assistido</h3>
                <p className="text-[11px] text-white/40 mt-1.5 leading-normal">
                  Simule a abertura do widget do Canva para criar um folheto, lona ou cartão diretamente associado ao PrintFlow.
                </p>
              </div>
              <button
                onClick={() => setShowCreator(true)}
                className="mt-5 w-full flex justify-center items-center space-x-2 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all cursor-pointer"
                id="launch-canva-editor-btn"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Criar via Canva SDK Button</span>
              </button>
            </div>

            <div className="bg-[#111113] border border-white/5 p-5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-white/40 uppercase block">Canva Asset API</span>
                <h3 className="text-sm font-semibold text-white mt-1">Importação e Sincronização</h3>
                <p className="text-[11px] text-white/40 mt-1.5 leading-normal">
                  Monitore e sincronize arquivos modificados em tempo real na nuvem do Canva para atualizar a ordem de serviço.
                </p>
              </div>
              <button
                onClick={loadCanvaDesigns}
                disabled={loadingDesigns}
                className="mt-5 w-full flex justify-center items-center space-x-2 py-2 px-4 border border-white/5 hover:border-white/10 hover:bg-white/5 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all cursor-pointer"
                id="sync-canva-designs-btn"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingDesigns ? 'animate-spin' : ''}`} />
                <span>Sincronizar Artefatos ({designs.length})</span>
              </button>
            </div>

            <div className="bg-[#111113] border border-white/5 p-5 rounded-xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-white/40 uppercase block">Status de Integração</span>
                <h3 className="text-sm font-semibold text-white mt-1">Autenticação de API Ativa</h3>
                <p className="text-[11px] text-white/40 mt-1.5 leading-normal">
                  Chave do App: <code className="text-indigo-400 font-mono text-[10px]">canva_client_prod_99ab...</code><br />
                  Escopos: <code className="text-white/50 text-[10px]">design:read, design:write, asset:upload</code>
                </p>
              </div>
              <button
                onClick={handleDisconnect}
                className="mt-5 w-full flex justify-center items-center space-x-1.5 py-2 px-4 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg text-xs font-bold uppercase tracking-wide transition-all cursor-pointer"
                id="disconnect-canva-btn"
              >
                <span>Desconectar API Canva</span>
              </button>
            </div>
          </div>

          {/* Design List / Assets imported section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Artefatos Importados do Canva</h2>
                <p className="text-[10px] text-white/40 font-medium">Estes arquivos estão prontos para fechamento de arquivo e envio às impressoras offset ou digitais.</p>
              </div>
            </div>

            {loadingDesigns ? (
              <div className="bg-[#111113] border border-white/5 rounded-xl p-16 text-center">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-3" />
                <p className="text-xs text-white/40 font-bold">Consultando API de Designs Canva...</p>
              </div>
            ) : designs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="canva-designs-grid">
                {designs.map((design) => (
                  <div key={design.id} className="bg-[#111113] border border-white/5 rounded-xl overflow-hidden shadow-lg hover:border-white/10 transition-all flex flex-col">
                    {/* Thumbnail */}
                    <div className="h-44 bg-slate-900 relative group overflow-hidden">
                      <img 
                        src={design.thumbnail} 
                        alt={design.title} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-3">
                        <button 
                          onClick={() => alert(`Acessando editor de arte Canva ID ${design.id}...`)}
                          className="p-2 bg-indigo-600 rounded-lg text-white hover:bg-indigo-500 transition-colors cursor-pointer" 
                          title="Abrir no Canva"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => alert(`Iniciando download do PDF de Impressão de alta resolução da arte: ${design.title}`)}
                          className="p-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer" 
                          title="Baixar PDF de Impressão"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">{design.type}</span>
                          <span className="text-[10px] text-white/30 font-semibold">{design.dimensions}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1.5 leading-snug line-clamp-1">{design.title}</h4>
                        <span className="text-[10px] text-white/40 block mt-1">ID: <code className="font-mono text-indigo-300/60">{design.id}</code></span>
                      </div>

                      <div className="border-t border-white/5 pt-3 flex justify-between items-center">
                        <span className="text-[10px] text-white/40">Sincronizado: <strong>{design.updatedAt}</strong></span>
                        <button
                          onClick={() => alert(`Artigo de Design #${design.id} anexado ao fluxo da Ordem de Serviço!`)}
                          className="flex items-center space-x-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Vincular à OS</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-[#111113] border border-white/5 rounded-xl p-16 text-center">
                <Palette className="w-8 h-8 text-white/20 mx-auto mb-3" />
                <p className="text-xs text-white/40 font-bold">Nenhum design importado ainda.</p>
                <p className="text-[10px] text-white/30 mt-1 max-w-xs mx-auto">Clique no botão Canva SDK acima para iniciar a criação do seu primeiro folheto integrado.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Canva SDK Launcher Modal Mock */}
      {showCreator && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in" id="canva-sdk-modal">
          <div className="bg-[#111113] border border-white/5 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Palette className="w-4.5 h-4.5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Canva Button SDK - Widget Integrado</h3>
              </div>
              <button 
                onClick={() => setShowCreator(false)}
                className="text-white/40 hover:text-white transition-colors text-xs font-semibold"
              >
                Fechar [x]
              </button>
            </div>

            <form onSubmit={handleCreateDesign} className="p-6 space-y-5">
              <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-xl flex items-start space-x-3 text-xs leading-normal text-indigo-300">
                <Sparkles className="w-5 h-5 flex-shrink-0" />
                <div>
                  <p className="font-bold">Portal Integrado para Clientes</p>
                  <p className="mt-0.5 text-[11px] text-white/60">Este widget simula a experiência Canva Connect API onde o usuário cria ou escolhe uma arte e ela retorna PDF/X finalizado diretamente para seu ERP.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wide mb-1.5">Nome do Arquivo / Design</label>
                  <input 
                    type="text" 
                    required
                    value={newDesignName}
                    onChange={(e) => setNewDesignName(e.target.value)}
                    className="block w-full px-3 py-2 text-xs text-white border border-white/5 rounded-lg bg-white/5 hover:bg-white/10 focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-white/30"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wide mb-1.5">Dimensão e Modelo Gráfico</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDocType('flyer')}
                      className={`p-3.5 border rounded-xl text-center flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition-all ${
                        selectedDocType === 'flyer' 
                          ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                          : 'border-white/5 bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                      <span className="text-[10px] font-bold">Flyer SRA3</span>
                      <span className="text-[8px] text-white/40 block">297x420mm</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedDocType('business_card')}
                      className={`p-3.5 border rounded-xl text-center flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition-all ${
                        selectedDocType === 'business_card' 
                          ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                          : 'border-white/5 bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                      <span className="text-[10px] font-bold">C. de Visita</span>
                      <span className="text-[8px] text-white/40 block">90x50mm</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedDocType('banner')}
                      className={`p-3.5 border rounded-xl text-center flex flex-col items-center justify-center space-y-1.5 cursor-pointer transition-all ${
                        selectedDocType === 'banner' 
                          ? 'border-indigo-500 bg-indigo-500/10 text-white' 
                          : 'border-white/5 bg-white/5 text-white/50 hover:bg-white/10'
                      }`}
                    >
                      <Image className="w-4 h-4" />
                      <span className="text-[10px] font-bold">Banner Lona</span>
                      <span className="text-[8px] text-white/40 block">1000x2000mm</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCreator(false)}
                  className="px-4 py-2 border border-white/5 hover:bg-white/5 text-white rounded-lg text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingFromCanva}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {creatingFromCanva ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Conectando Canva...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Simular Retorno Canva API</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
