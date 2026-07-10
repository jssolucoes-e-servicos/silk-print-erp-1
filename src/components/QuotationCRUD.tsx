/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, Check, X, FileText, Calendar, DollarSign, 
  Trash2, Search, Filter, AlertCircle, ShoppingCart,
  User, Phone, MapPin, Truck, Share2, Send, Printer, 
  Clock, ArrowRight, ChevronRight, CheckSquare, Sparkles, RefreshCw, Info, Copy
} from 'lucide-react';
import { Quotation, QuotationStatus, QuoteItem, Client } from '../types.js';

export default function QuotationCRUD() {
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [selectedQuote, setSelectedQuote] = useState<Quotation | null>(null);

  // Modals controllers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastCreatedQuote, setLastCreatedQuote] = useState<Quotation | null>(null);
  
  // Conversion state
  const [approvingQuoteId, setApprovingQuoteId] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Pix');
  const [showPixPaymentFeedback, setShowPixPaymentFeedback] = useState(false);

  // New Quotation Form Wizard Steps
  const [formStep, setFormStep] = useState(1); // 1: Cliente, 2: Itens, 3: Logística e Prazo, 4: Resumo

  // Step 1: Client Search & Basic Fields
  const [searchClientQuery, setSearchClientQuery] = useState('');
  const [matchingClients, setMatchingClients] = useState<Client[]>([]);
  const [showMultiSelectModal, setShowMultiSelectModal] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState<{ type: 'success' | 'warning' | 'info' | null, message: string }>({ type: null, message: '' });

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientDocument, setClientDocument] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [showMoreFields, setShowMoreFields] = useState(false);

  // Step 2: Items
  const [serviceType, setServiceType] = useState('Impressão Digital');
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemFinishes, setNewItemFinishes] = useState('');
  const [newItemDetails, setNewItemDetails] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemPrice, setNewItemPrice] = useState(0);

  // New products/finishes dynamic states
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedPrintColor, setSelectedPrintColor] = useState('');
  const [selectedSize, setSelectedSize] = useState<any | null>(null);
  const [selectedFinishes, setSelectedFinishes] = useState<any[]>([]);

  // Step 3: Logistics & Production Deadline
  const [deliveryType, setDeliveryType] = useState<'retirada' | 'entrega'>('retirada');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isSimulatingFrete, setIsSimulatingFrete] = useState(false);

  const [productionDays, setProductionDays] = useState(5);
  const [urgencyLevel, setUrgencyLevel] = useState<'normal' | 'urgente' | 'super_urgente' | 'personalizado'>('normal');
  const [urgencyFee, setUrgencyFee] = useState(0);

  const fetchQuotes = async () => {
    try {
      const res = await fetch('/api/quotations');
      if (res.ok) {
        const data = await res.json();
        setQuotes(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

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

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQuotes();
    fetchClients();
    fetchProducts();
  }, []);

  // Compute business days date helper
  const getDeliveryDate = (days: number) => {
    const date = new Date();
    let addedDays = 0;
    while (addedDays < days) {
      date.setDate(date.getDate() + 1);
      const dayOfWeek = date.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // skip Sat & Sun
        addedDays++;
      }
    }
    return date;
  };

  // Pre-configured options for live finishes dropdown
  const finishPresets = [
    'Verniz de Proteção Fosco',
    'Verniz Localizado U.V.',
    'Laminação BOPP Brilho',
    'Laminação BOPP Fosca',
    'Corte e Vinco Personalizado',
    'Borda Arredondada (4 Cantos)',
    'Ilhós de Latão Aplicado',
    'Sem Acabamento Adicional'
  ];

  // CEP shipping rate simulator
  const handleSimulateFrete = () => {
    if (!deliveryAddress.trim()) return;
    setIsSimulatingFrete(true);
    setTimeout(() => {
      // Simulate shipping fee
      const randomFee = Math.floor(Math.random() * 21) + 15; // R$ 15 to R$ 35
      setDeliveryFee(randomFee);
      setIsSimulatingFrete(false);
    }, 1000);
  };

  // Client Search logic
  const handleSearchClient = () => {
    if (!searchClientQuery.trim()) return;

    const query = searchClientQuery.trim().toLowerCase();
    const queryDigits = query.replace(/\D/g, '');

    const found = clients.filter(c => {
      const matchName = c.name.toLowerCase().includes(query);
      const matchPhone = c.phone.replace(/\D/g, '').includes(queryDigits) && queryDigits.length > 0;
      const matchCnpj = c.cnpj.replace(/\D/g, '').includes(queryDigits) && queryDigits.length > 0;
      const matchCompany = c.companyName.toLowerCase().includes(query);
      return matchName || matchPhone || matchCnpj || matchCompany;
    });

    if (found.length === 1) {
      const selected = found[0];
      setClientName(selected.name);
      setClientPhone(selected.phone);
      setClientDocument(selected.cnpj || '');
      setClientEmail(selected.email || '');
      setClientCompany(selected.companyName || '');
      setDeliveryAddress(selected.address || '');
      
      setSearchFeedback({
        type: 'success',
        message: `Cliente encontrado: ${selected.name} (${selected.phone})`
      });
      // Stagger slide transition
      setTimeout(() => {
        setFormStep(2);
        setSearchFeedback({ type: null, message: '' });
      }, 1000);
    } else if (found.length > 1) {
      setMatchingClients(found);
      setShowMultiSelectModal(true);
      setSearchFeedback({
        type: 'info',
        message: `${found.length} correspondências encontradas. Selecione na lista.`
      });
    } else {
      setSearchFeedback({
        type: 'warning',
        message: 'Nenhum cliente cadastrado correspondente. Preencha os campos abaixo para seguir.'
      });
    }
  };

  const selectClientFromMatches = (selected: Client) => {
    setClientName(selected.name);
    setClientPhone(selected.phone);
    setClientDocument(selected.cnpj || '');
    setClientEmail(selected.email || '');
    setClientCompany(selected.companyName || '');
    setDeliveryAddress(selected.address || '');
    
    setShowMultiSelectModal(false);
    setSearchFeedback({
      type: 'success',
      message: `Cliente selecionado: ${selected.name}`
    });
    setTimeout(() => {
      setFormStep(2);
      setSearchFeedback({ type: null, message: '' });
    }, 800);
  };

  const [productSearch, setProductSearch] = useState('');

  // Check if a finish conflicts with currently selected finishes
  const isFinishDisabled = (finish: any) => {
    if (!selectedProduct) return false;
    return selectedFinishes.some(selected => {
      const hasConflict1 = selected.conflictsWith?.includes(finish.name);
      const hasConflict2 = finish.conflictsWith?.includes(selected.name);
      return hasConflict1 || hasConflict2;
    });
  };

  // Dynamic pricing and details calculation
  useEffect(() => {
    if (selectedProduct) {
      const finishesPrice = selectedFinishes.reduce((sum, f) => sum + f.price, 0);
      const sizeAdjustment = selectedSize ? selectedSize.priceAdjustment : 0;
      
      let printColorAdjustment = 0;
      if (selectedPrintColor === '4x4' || selectedPrintColor === '4x1') {
        printColorAdjustment = 10;
      } else if (selectedPrintColor === '1x1' || selectedPrintColor === '4x0') {
        printColorAdjustment = 5;
      }
      
      const computedUnitPrice = selectedProduct.basePrice + sizeAdjustment + finishesPrice + printColorAdjustment;
      setNewItemPrice(computedUnitPrice);
      setNewItemDesc(selectedProduct.name);
      
      const parts = [];
      if (selectedSize) parts.push(`Tam: ${selectedSize.name}`);
      if (selectedPrintColor) parts.push(`Cores: ${selectedPrintColor}`);
      if (selectedFinishes.length > 0) {
        parts.push(`Acab: ${selectedFinishes.map(f => f.name).join(', ')}`);
      } else {
        parts.push(`Acab: Padrão`);
      }
      setNewItemDetails(parts.join(' | '));
    }
  }, [selectedProduct, selectedSize, selectedFinishes, selectedPrintColor]);

  // Add Item to Quotation
  const handleAddItemToForm = () => {
    if (!newItemDesc.trim()) return;
    
    const finishesStr = selectedFinishes.length > 0 
      ? selectedFinishes.map(f => f.name).join(', ') 
      : (newItemFinishes || 'Nenhum');

    const item: QuoteItem = {
      description: newItemDesc,
      details: newItemDetails || 'Nenhum detalhe adicional',
      quantity: newItemQty,
      unitPrice: newItemPrice,
      finishes: finishesStr
    };
    
    // Calculate item production days
    const itemDays = (selectedProduct ? selectedProduct.baseProductionDays : 5) + 
      selectedFinishes.reduce((sum, f) => sum + f.additionalDays, 0);
    
    // Update overall quotation production days to the maximum of added items
    setProductionDays(prev => Math.max(prev, itemDays));
    
    setItems([...items, item]);
    
    // Clear inputs and selection states
    setNewItemDesc('');
    setNewItemFinishes('');
    setNewItemDetails('');
    setNewItemQty(1);
    setNewItemPrice(0);
    setSelectedProduct(null);
    setProductSearch('');
    setSelectedPrintColor('');
    setSelectedSize(null);
    setSelectedFinishes([]);
  };

  // Remove item
  const handleRemoveItemFromForm = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // Total Quotation Calculation
  const getItemsSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const getQuoteTotal = () => {
    return getItemsSubtotal() + Number(deliveryFee || 0) + Number(urgencyFee || 0);
  };

  // Set standard urgency presets
  useEffect(() => {
    if (urgencyLevel === 'normal') {
      setUrgencyFee(0);
      setProductionDays(5);
    } else if (urgencyLevel === 'urgente') {
      setUrgencyFee(50);
      setProductionDays(3);
    } else if (urgencyLevel === 'super_urgente') {
      setUrgencyFee(100);
      setProductionDays(1);
    }
  }, [urgencyLevel]);

  const adjustProductionDays = (val: number) => {
    setProductionDays(prev => {
      const nextVal = Math.max(1, prev + val);
      setUrgencyLevel('personalizado');
      return nextVal;
    });
  };

  // Create Quote Action
  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const totalValue = getQuoteTotal();
    const deliveryDateObj = getDeliveryDate(productionDays);
    const expiryStr = deliveryDateObj.toLocaleDateString('pt-BR');

    const quotationData = {
      clientName,
      clientEmail: clientEmail || "contato@cliente.com.br",
      serviceType,
      expiryDate: expiryStr,
      totalValue,
      status: 'PENDENTE' as QuotationStatus,
      items,
      clientPhone,
      clientDocument,
      deliveryType,
      deliveryAddress,
      deliveryFee,
      urgencyLevel,
      urgencyFee,
      productionDays
    };

    try {
      const res = await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotationData)
      });

      if (res.ok) {
        const created = await res.json();
        setLastCreatedQuote(created);
        setShowAddModal(false);
        setShowSuccessModal(true);
        fetchQuotes();
        
        // Reset state
        resetCreationState();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resetCreationState = () => {
    setFormStep(1);
    setSearchClientQuery('');
    setMatchingClients([]);
    setSearchFeedback({ type: null, message: '' });
    setClientName('');
    setClientPhone('');
    setClientDocument('');
    setClientEmail('');
    setClientCompany('');
    setShowMoreFields(false);
    setServiceType('Impressão Digital');
    setItems([]);
    setNewItemDesc('');
    setNewItemFinishes('');
    setNewItemDetails('');
    setNewItemQty(1);
    setNewItemPrice(0);
    setDeliveryType('retirada');
    setDeliveryAddress('');
    setDeliveryFee(0);
    setProductionDays(5);
    setUrgencyLevel('normal');
    setUrgencyFee(0);
  };

  // Approve Quotation (Convert to Order) with Payment Method
  const handleApproveQuotation = async () => {
    if (!approvingQuoteId) return;
    try {
      const res = await fetch(`/api/quotations/${approvingQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'APROVADO',
          paymentMethod: selectedPaymentMethod 
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedQuote(updated);
        fetchQuotes();
        setShowPaymentModal(false);
        setApprovingQuoteId(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectQuotation = async (id: string) => {
    if (!window.confirm('Deseja realmente reprovar este orçamento?')) return;
    try {
      const res = await fetch(`/api/quotations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJEITADO' })
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedQuote(updated);
        fetchQuotes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Excluir este orçamento permanentemente?')) {
      try {
        const res = await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setSelectedQuote(null);
          fetchQuotes();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Generate WhatsApp Message
  const getWhatsAppMessageText = (quote: Quotation) => {
    const itemsList = quote.items.map((item, idx) => {
      const itemVal = item.quantity * item.unitPrice;
      return `${idx + 1}. *${item.description}* \n   • Detalhes: ${item.details}\n   • Acabamento: ${item.finishes || 'Padrão'}\n   • Qtd: ${item.quantity} un | Preço: R$ ${itemVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
    }).join('\n\n');

    const deliveryStr = quote.deliveryType === 'entrega'
      ? `🚚 *Entrega:* ${quote.deliveryAddress || 'Não especificado'}\n   Taxa de entrega: R$ ${(quote.deliveryFee || 0).toLocaleString('pt-BR')}`
      : `🏪 *Retirada:* Retirada física direta no balcão da gráfica (Sem Taxas)`;

    const deadlineStr = `📅 *Prazo Operacional:* ${quote.productionDays || 5} dias úteis (Estimado para: ${quote.expiryDate})`;

    const message = 
      `Olá *${quote.clientName}*! Tudo bem?\n\n` +
      `Conforme solicitado, segue o seu *Orçamento de Produção Gráfica*:\n\n` +
      `🏷️ *Código da Proposta:* ${quote.id}\n` +
      `⚙️ *Linha de Produção:* ${quote.serviceType}\n\n` +
      `📦 *Itens do Orçamento:*\n${itemsList}\n\n` +
      `${deliveryStr}\n` +
      `${deadlineStr}\n` +
      `⏱️ *Validade Comercial:* 15 dias corridos\n\n` +
      `💵 *VALOR TOTAL:* *R$ ${quote.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}*\n\n` +
      `Deseja aprovar este pedido para iniciarmos a preparação dos arquivos e setup de impressão?\n` +
      `Qualquer dúvida, estamos à inteira disposição!`;

    return message;
  };

  const getWhatsAppURL = (quote: Quotation) => {
    const text = encodeURIComponent(getWhatsAppMessageText(quote));
    const phoneNum = quote.clientPhone ? quote.clientPhone.replace(/\D/g, '') : '';
    return `https://api.whatsapp.com/send?phone=${phoneNum ? `55${phoneNum}` : ''}&text=${text}`;
  };

  // Standard Print To PDF local engine
  const handlePrintQuote = (quote: Quotation) => {
    const printableArea = document.getElementById(`print-template-${quote.id}`);
    if (!printableArea) {
      alert("Erro ao localizar área de impressão.");
      return;
    }
    window.print();
  };

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.clientName.toLowerCase().includes(search.toLowerCase()) || 
                          q.serviceType.toLowerCase().includes(search.toLowerCase()) ||
                          (q.id && q.id.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = statusFilter === 'todos' || q.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusStyle = (status: QuotationStatus) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'APROVADO':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'REJEITADO':
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden" id="quotation-management-layout">
      {/* Hide printable elements on screen and show on print */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-wrapper, #print-wrapper * {
            visibility: visible;
          }
          #print-wrapper {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          /* Hide standard elements from print layout */
          header, sidebar, nav, button, input, select {
            display: none !important;
          }
        }
      `}} />

      {/* Main List Column */}
      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar space-y-6">
        
        {/* Header and Add Button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight leading-none flex items-center gap-2">
              <FileText className="text-indigo-500 w-5 h-5" />
              <span>Orçamentos de Vendas</span>
            </h1>
            <p className="text-xs text-white/40 mt-1.5 font-medium">
              Gere propostas comerciais modernas com controle de prazo de produção, acabamentos gráficos e logística integrada.
            </p>
          </div>
          <button
            onClick={() => {
              resetCreationState();
              setShowAddModal(true);
            }}
            id="btn-add-quote"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Emitir Orçamento</span>
          </button>
        </div>

        {/* Counter cards matching screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-amber-500/5 p-4.5 rounded-xl border border-amber-500/10 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Pendentes de Retorno</span>
              <span className="text-2xl font-black text-white mt-1 block">{quotes.filter(q => q.status === 'PENDENTE').length}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-emerald-500/5 p-4.5 rounded-xl border border-emerald-500/10 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Aprovados (Em Produção)</span>
              <span className="text-2xl font-black text-white mt-1 block">{quotes.filter(q => q.status === 'APROVADO').length}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Check className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-rose-500/5 p-4.5 rounded-xl border border-rose-500/10 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Rejeitados / Expirados</span>
              <span className="text-2xl font-black text-white mt-1 block">{quotes.filter(q => q.status === 'REJEITADO').length}</span>
            </div>
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400">
              <X className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filters bar */}
        <div className="bg-[#111113] p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Pesquisar por cliente, serviço ou código do orçamento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 hover:bg-white/10 focus:bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-white/30"
            />
          </div>

          <div className="flex items-center space-x-2.5 w-full md:w-auto">
            <Filter className="w-4 h-4 text-white/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-white/5 rounded-lg text-xs font-medium text-white bg-white/5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer"
            >
              <option value="todos" className="bg-[#111113] text-white">Todos os Status</option>
              <option value="PENDENTE" className="bg-[#111113] text-white">Pendentes</option>
              <option value="APROVADO" className="bg-[#111113] text-white">Aprovados</option>
              <option value="REJEITADO" className="bg-[#111113] text-white">Rejeitados</option>
            </select>
          </div>
        </div>

        {/* Table list */}
        <div className="bg-[#111113] rounded-xl border border-white/5 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse" id="quotes-table">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Código</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Contato / Fone</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Serviço Principal</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Prazo Est.</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Valor Proposta</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3.5 text-[10px] font-bold text-white/40 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredQuotes.map((q) => (
                <tr
                  key={q.id}
                  onClick={() => setSelectedQuote(q)}
                  className={`hover:bg-white/5 cursor-pointer transition-colors ${
                    selectedQuote?.id === q.id ? 'bg-indigo-500/10' : ''
                  }`}
                >
                  <td className="px-6 py-4.5">
                    <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">{q.id}</span>
                  </td>
                  <td className="px-6 py-4.5">
                    <div>
                      <p className="text-xs font-semibold text-white leading-tight">{q.clientName}</p>
                      {q.clientDocument && <p className="text-[9px] text-white/30 font-mono mt-0.5">{q.clientDocument}</p>}
                    </div>
                  </td>
                  <td className="px-6 py-4.5 text-xs text-white/60">
                    <div>
                      <p className="font-medium">{q.clientPhone || 'Sem telefone'}</p>
                      <p className="text-[10px] text-white/30 font-mono mt-0.5">{q.clientEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="text-xs font-semibold text-white/70">{q.serviceType}</span>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="text-xs font-medium text-white/60">{q.expiryDate}</span>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="text-xs font-black text-indigo-300">
                      R$ {q.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${getStatusStyle(q.status)}`}>
                      {q.status}
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleDelete(q.id, e)}
                      className="p-1.5 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredQuotes.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-xs text-white/30 italic">
                    Nenhum orçamento cadastrado ou correspondente aos filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Side Drawer */}
      {selectedQuote && (
        <div className="w-112 bg-[#111113] border-l border-white/5 flex flex-col h-full shadow-2xl animate-fade-in" id="quote-details-drawer">
          <div className="p-6 border-b border-white/5 bg-white/5 flex justify-between items-center">
            <div>
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider block">Orçamento Comercial</span>
              <span className="text-sm font-black text-indigo-400 mt-1 block">{selectedQuote.id}</span>
            </div>
            <button
              onClick={() => setSelectedQuote(null)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar text-xs">
            
            {/* Quick action buttons for selected item */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePrintQuote(selectedQuote)}
                className="inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-white/60" />
                <span>Imprimir PDF</span>
              </button>
              <a
                href={getWhatsAppURL(selectedQuote)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors text-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enviar Whats</span>
              </a>
            </div>

            {/* Client details info header */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3">
              <div className="border-b border-white/5 pb-2">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Ficha do Cliente</span>
              </div>
              <div className="grid grid-cols-2 gap-3 font-semibold">
                <div>
                  <span className="text-white/40 block text-[9px] uppercase">Nome</span>
                  <span className="text-white text-xs">{selectedQuote.clientName}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase">Telefone</span>
                  <span className="text-white text-xs font-mono">{selectedQuote.clientPhone || 'Não Informado'}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase">Documento</span>
                  <span className="text-white text-xs font-mono">{selectedQuote.clientDocument || 'Isento'}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase">E-mail</span>
                  <span className="text-white/80 text-xs truncate block">{selectedQuote.clientEmail}</span>
                </div>
              </div>
            </div>

            {/* Logistics & deadline */}
            <div className="p-4 bg-[#141416] border border-white/5 rounded-xl space-y-3">
              <div className="border-b border-white/5 pb-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Logística e Prazos</span>
              </div>
              <div className="grid grid-cols-2 gap-3 font-semibold">
                <div>
                  <span className="text-white/40 block text-[9px] uppercase">Expedição</span>
                  <span className="text-white text-xs capitalize flex items-center gap-1">
                    {selectedQuote.deliveryType === 'entrega' ? <Truck className="w-3.5 h-3.5 text-indigo-400" /> : <MapPin className="w-3.5 h-3.5 text-amber-400" />}
                    <span>{selectedQuote.deliveryType || 'Retirada'}</span>
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block text-[9px] uppercase">Prazo de Produção</span>
                  <span className="text-white text-xs">{selectedQuote.productionDays || 5} dias úteis</span>
                </div>
                <div className="col-span-2">
                  <span className="text-white/40 block text-[9px] uppercase">Endereço de Entrega</span>
                  <span className="text-white/70 text-xs">{selectedQuote.deliveryAddress || 'Retirada em loja'}</span>
                </div>
              </div>
            </div>

            {/* List of items */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-wider pb-1 border-b border-white/5">Produtos & Acabamentos</h4>
              <div className="space-y-2.5">
                {selectedQuote.items.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-lg flex justify-between items-start">
                    <div className="space-y-1 pr-4 max-w-[240px]">
                      <p className="font-bold text-white leading-tight">{item.description}</p>
                      <p className="text-[10px] text-white/40 leading-normal">{item.details}</p>
                      {item.finishes && (
                        <p className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-sm inline-block font-bold">
                          Acabamento: {item.finishes}
                        </p>
                      )}
                    </div>
                    <div className="text-right whitespace-nowrap">
                      <p className="font-semibold text-white/50 text-[10px]">Qtd: {item.quantity}</p>
                      <p className="font-bold text-white mt-1">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial breakdown */}
            <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2 font-semibold">
              <div className="flex justify-between">
                <span className="text-white/40">Subtotal de Itens:</span>
                <span className="text-white">R$ {selectedQuote.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Taxa de Entrega:</span>
                <span className="text-white">R$ {(selectedQuote.deliveryFee || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Taxa de Urgência:</span>
                <span className="text-white">R$ {(selectedQuote.urgencyFee || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between font-bold border-t border-white/5 pt-2.5 text-sm">
                <span className="text-white">Total Geral:</span>
                <span className="text-indigo-400">R$ {selectedQuote.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Live workflow actions */}
            {selectedQuote.status === 'PENDENTE' ? (
              <div className="pt-4 border-t border-white/5 flex gap-3">
                <button
                  onClick={() => handleRejectQuotation(selectedQuote.id)}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 py-3 px-4 border border-rose-500/20 rounded-lg text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Rejeitar</span>
                </button>
                <button
                  onClick={() => {
                    setApprovingQuoteId(selectedQuote.id);
                    setSelectedPaymentMethod('Pix');
                    setShowPixPaymentFeedback(false);
                    setShowPaymentModal(true);
                  }}
                  className="flex-1 inline-flex items-center justify-center space-x-1.5 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Aprovar Pedido</span>
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-white/5">
                <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-center font-medium text-white/50 leading-relaxed">
                  Este orçamento foi marcado como <strong className="text-white">{selectedQuote.status}</strong>. 
                  {selectedQuote.status === 'APROVADO' && (
                    <span className="block mt-1 text-[11px] text-indigo-400 font-bold">A ordem de serviço e a fatura foram inicializadas na esteira de produção ativa!</span>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* STEP-BY-STEP ADD QUOTATION WIZARD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4" id="add-quote-modal">
          <div className="bg-[#111113] rounded-2xl border border-white/5 w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Novo Orçamento de Produção</h3>
                <p className="text-[10px] text-white/40 mt-1 font-semibold">Preencha o formulário interativo passo a passo.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Stepper Progress Indicator */}
            <div className="bg-white/[0.02] border-b border-white/5 px-6 py-3 flex items-center justify-between text-xs font-bold">
              <div className="flex items-center space-x-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${formStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40'}`}>1</span>
                <span className={formStep === 1 ? 'text-white' : 'text-white/40'}>Cliente</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20" />
              <div className="flex items-center space-x-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${formStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40'}`}>2</span>
                <span className={formStep === 2 ? 'text-white' : 'text-white/40'}>Serviços & Acabamentos</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20" />
              <div className="flex items-center space-x-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${formStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40'}`}>3</span>
                <span className={formStep === 3 ? 'text-white' : 'text-white/40'}>Logística & Prazo</span>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20" />
              <div className="flex items-center space-x-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${formStep >= 4 ? 'bg-indigo-600 text-white' : 'bg-white/10 text-white/40'}`}>4</span>
                <span className={formStep === 4 ? 'text-white' : 'text-white/40'}>Faturamento</span>
              </div>
            </div>

            {/* Form Wizard Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">

              {/* STEP 1: CLIENT IDENTIFICATION */}
              {formStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                    <label className="block text-[11px] font-bold text-indigo-400 tracking-wide uppercase">Busca rápida de Cliente Cadastrado</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/40" />
                        <input
                          type="text"
                          placeholder="Digite telefone, documento (CNPJ/CPF) ou nome para buscar..."
                          value={searchClientQuery}
                          onChange={(e) => setSearchClientQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/5 rounded-lg text-xs font-semibold text-white focus:bg-[#111113] focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleSearchClient}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-colors"
                      >
                        Pesquisar
                      </button>
                    </div>

                    {searchFeedback.message && (
                      <div className={`p-2.5 rounded-lg text-[11px] font-semibold flex items-center space-x-2 border ${
                        searchFeedback.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                        searchFeedback.type === 'warning' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        <Info className="w-3.5 h-3.5" />
                        <span>{searchFeedback.message}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-white/5 pt-4 space-y-3">
                    <h4 className="text-xs font-bold text-white/60 uppercase">Dados Básicos do Lead / Cliente</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase">Nome do Cliente *</label>
                        <input
                          type="text"
                          required
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          placeholder="Ex: Pedro Henrique"
                          className="mt-1 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase">Telefone de Contato (WhatsApp) *</label>
                        <input
                          type="text"
                          required
                          value={clientPhone}
                          onChange={(e) => setClientPhone(e.target.value)}
                          placeholder="Ex: (11) 98765-4321"
                          className="mt-1 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-white/50 uppercase">CPF ou CNPJ (Não obrigatório)</label>
                        <input
                          type="text"
                          value={clientDocument}
                          onChange={(e) => setClientDocument(e.target.value)}
                          placeholder="Ex: 12.345.678/0001-90"
                          className="mt-1 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => setShowMoreFields(!showMoreFields)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
                        >
                          {showMoreFields ? 'Ocultar campos adicionais' : 'Inserir Email / Razão Social'}
                        </button>
                      </div>
                    </div>

                    {showMoreFields && (
                      <div className="grid grid-cols-2 gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-lg animate-fade-in">
                        <div>
                          <label className="block text-[10px] font-bold text-white/50 uppercase">E-mail</label>
                          <input
                            type="email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            placeholder="pedro@empresa.com"
                            className="mt-1 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-[#111113] text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-white/50 uppercase">Razão Social / Nome da Empresa</label>
                          <input
                            type="text"
                            value={clientCompany}
                            onChange={(e) => setClientCompany(e.target.value)}
                            placeholder="Pedro Artes ME"
                            className="mt-1 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-[#111113] text-white focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2: SERVICES & FINISHES */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-white/50 uppercase">Área Operacional principal</label>
                      <select
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value)}
                        className="mt-1.5 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer"
                      >
                        <option value="Impressão Digital" className="bg-[#111113] text-white">Impressão Digital</option>
                        <option value="Impressão Offset" className="bg-[#111113] text-white">Impressão Offset</option>
                        <option value="Grandes Formatos / Lonas" className="bg-[#111113] text-white">Grandes Formatos / Lonas</option>
                        <option value="Corte Laser / Comunicação Visual" className="bg-[#111113] text-white">Corte Laser / Comunicação Visual</option>
                        <option value="Acabamentos Gráficos Especiais" className="bg-[#111113] text-white">Acabamentos Gráficos Especiais</option>
                      </select>
                    </div>
                  </div>

                  {/* Dynamic Product Search & Config Panel */}
                  <div className="p-4.5 bg-white/5 border border-white/5 rounded-xl space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">Adicionar Item / Produto com Acabamentos</h4>
                      {selectedProduct && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(null);
                            setProductSearch('');
                            setSelectedPrintColor('');
                            setSelectedSize(null);
                            setSelectedFinishes([]);
                            setNewItemDesc('');
                            setNewItemPrice(0);
                            setNewItemDetails('');
                          }}
                          className="text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center space-x-1 uppercase cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Remover Seleção</span>
                        </button>
                      )}
                    </div>

                    {!selectedProduct ? (
                      /* Product Search / Manual Mode Selection */
                      <div className="space-y-3">
                        <div className="relative">
                          <label className="block text-[10px] font-bold text-white/40 uppercase mb-1">Pesquisar Produto/Serviço no Catálogo *</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              placeholder="Digite o nome do produto cadastrado (ex: Cartão de Visita, Folder...)"
                              className="w-full px-3 py-2 pl-9 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                            />
                            <Search className="w-4 h-4 text-white/30 absolute left-3 top-2.5" />
                          </div>
                          
                          {/* Search dropdown results */}
                          {productSearch.trim().length > 0 && (
                            <div className="absolute z-10 w-full mt-1 bg-[#141416] border border-white/10 rounded-lg shadow-xl max-h-52 overflow-y-auto custom-scrollbar divide-y divide-white/5">
                              {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).map(p => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedProduct(p);
                                    setProductSearch('');
                                    setSelectedPrintColor(p.printColors?.[0] || '4x0');
                                    setSelectedSize(p.sizes?.[0] || null);
                                    setSelectedFinishes([]);
                                  }}
                                  className="w-full text-left px-3.5 py-2.5 hover:bg-white/5 transition-colors flex justify-between items-center group"
                                >
                                  <div>
                                    <span className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors block">{p.name}</span>
                                    <span className="text-[9px] text-white/40 font-semibold block uppercase mt-0.5">{p.category} | Tempo Base: {p.baseProductionDays} dias</span>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-xs font-mono font-bold text-emerald-400">R$ {p.basePrice.toFixed(2)}</span>
                                  </div>
                                </button>
                              ))}
                              {products.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                                <div className="px-3.5 py-3 text-xs text-white/40 italic">
                                  Nenhum produto cadastrado encontrado com "{productSearch}".
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Fallback to Manual Pre-fill */}
                        <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-white/40 font-bold uppercase">Ou preencher item manualmente:</span>
                            {productSearch.trim().length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setNewItemDesc(productSearch);
                                  setNewItemPrice(10);
                                  setNewItemDetails('Papel Couché 300g, corte reto');
                                  setProductSearch('');
                                }}
                                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                              >
                                Usar "{productSearch}" como descrição manual
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-white/40">Título do Produto/Serviço *</label>
                              <input
                                type="text"
                                value={newItemDesc}
                                onChange={(e) => setNewItemDesc(e.target.value)}
                                placeholder="Ex: Cartão de Visita Couché 300g"
                                className="mt-1 block w-full px-2.5 py-1.5 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-white/40">Acabamentos Gráficos / Finishes</label>
                              <input
                                type="text"
                                value={newItemFinishes}
                                onChange={(e) => setNewItemFinishes(e.target.value)}
                                placeholder="Ex: Laminação Fosca, Verniz Local"
                                className="mt-1 block w-full px-2.5 py-1.5 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-white/40">Observações Técnicas / Papel / Cores</label>
                              <input
                                type="text"
                                value={newItemDetails}
                                onChange={(e) => setNewItemDetails(e.target.value)}
                                placeholder="Ex: Papel Couché 300g, 4x4 cores, corte reto"
                                className="mt-1 block w-full px-2.5 py-1.5 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-white/40">Preço Unitário (R$)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={newItemPrice}
                                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                                className="mt-1 block w-full px-2.5 py-1.5 text-xs border border-white/5 rounded-lg bg-white/5 text-white focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Active Product Configuration Wizard */
                      <div className="space-y-4 animate-fade-in text-xs text-white">
                        {/* Selected Product info card */}
                        <div className="flex justify-between items-center bg-indigo-600/10 border border-indigo-500/20 p-3 rounded-lg">
                          <div>
                            <span className="text-[10px] text-indigo-400 font-extrabold uppercase tracking-wider block">Produto Selecionado</span>
                            <span className="text-sm font-black text-white">{selectedProduct.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-white/40 font-bold block">PREÇO BASE</span>
                            <span className="text-sm font-mono font-black text-emerald-400">R$ {selectedProduct.basePrice.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Print colors select */}
                        {selectedProduct.printColors && selectedProduct.printColors.length > 0 && (
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-white/40 uppercase">Tipo de Impressão (Cores) *</label>
                            <div className="flex flex-wrap gap-2">
                              {selectedProduct.printColors.map((color: string) => {
                                let desc = '';
                                if (color === '1x0') desc = 'Frente 1 cor';
                                else if (color === '1x1') desc = 'Frente/Verso 1 cor';
                                else if (color === '4x0') desc = 'Frente Colorida';
                                else if (color === '4x1') desc = 'Frente Colorida, Verso Preto';
                                else if (color === '4x4') desc = 'Frente/Verso Colorido';

                                return (
                                  <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedPrintColor(color)}
                                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all uppercase flex flex-col items-center justify-center min-w-[70px] cursor-pointer ${
                                      selectedPrintColor === color
                                        ? 'border-indigo-500 bg-indigo-500/10 text-white'
                                        : 'border-white/5 bg-white/[0.02] text-white/50 hover:bg-white/5'
                                    }`}
                                  >
                                    <span>{color}</span>
                                    {desc && <span className="text-[8px] opacity-60 font-medium normal-case mt-0.5">{desc}</span>}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Sizes list selection */}
                        {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-white/40 uppercase">Tamanho do Material *</label>
                            <div className="flex flex-wrap gap-2">
                              {selectedProduct.sizes.map((size: any) => (
                                <button
                                  key={size.name}
                                  type="button"
                                  onClick={() => setSelectedSize(size)}
                                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all flex flex-col items-start cursor-pointer ${
                                    selectedSize?.name === size.name
                                      ? 'border-indigo-500 bg-indigo-500/10 text-white'
                                      : 'border-white/5 bg-white/[0.02] text-white/50 hover:bg-white/5'
                                  }`}
                                >
                                  <span>{size.name}</span>
                                  <span className="text-[8px] opacity-70 font-mono mt-0.5">
                                    {size.priceAdjustment > 0 ? `+ R$ ${size.priceAdjustment.toFixed(2)}` : size.priceAdjustment < 0 ? `- R$ ${Math.abs(size.priceAdjustment).toFixed(2)}` : 'Sem custo adicional'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Finishes checklist */}
                        {selectedProduct.finishes && selectedProduct.finishes.length > 0 && (
                          <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-white/40 uppercase">Acabamentos Adicionais</label>
                            <div className="grid grid-cols-2 gap-2">
                              {selectedProduct.finishes.map((finish: any) => {
                                const isSelected = selectedFinishes.some(f => f.name === finish.name);
                                const disabled = !isSelected && isFinishDisabled(finish);

                                return (
                                  <button
                                    key={finish.name}
                                    type="button"
                                    disabled={disabled}
                                    onClick={() => {
                                      if (isSelected) {
                                        setSelectedFinishes(selectedFinishes.filter(f => f.name !== finish.name));
                                      } else {
                                        setSelectedFinishes([...selectedFinishes, finish]);
                                      }
                                    }}
                                    className={`p-2.5 rounded-lg border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                                      isSelected
                                        ? 'border-emerald-500 bg-emerald-500/5 text-white'
                                        : disabled
                                        ? 'border-white/5 bg-white/[0.01] text-white/20 cursor-not-allowed opacity-40'
                                        : 'border-white/5 bg-white/[0.02] text-white/60 hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="flex justify-between items-start w-full">
                                      <span className="font-bold text-xs">{finish.name}</span>
                                      {isSelected && <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded font-extrabold uppercase">Ativo</span>}
                                      {disabled && <span className="text-[8px] bg-white/5 text-white/40 px-1 py-0.2 rounded font-semibold uppercase">Bloqueado</span>}
                                    </div>
                                    <div className="flex justify-between items-center w-full mt-2 text-[9px] font-medium opacity-80">
                                      <span>
                                        {finish.price > 0 ? `+ R$ ${finish.price.toFixed(2)}` : 'Incluso'}
                                      </span>
                                      {finish.additionalDays > 0 && (
                                        <span className="text-amber-400 font-semibold font-mono">
                                          +{finish.additionalDays}d produção
                                        </span>
                                      )}
                                    </div>
                                    {finish.conflictsWith && finish.conflictsWith.length > 0 && (
                                      <div className="text-[8px] opacity-40 mt-1 italic text-left leading-tight">
                                        Incompatível com: {finish.conflictsWith.join(', ')}
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Interactive live metrics preview */}
                        <div className="p-3 bg-[#111113] border border-white/5 rounded-lg space-y-2">
                          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block">Demonstrativo de Cálculo de Orçamento</span>
                          
                          <div className="grid grid-cols-2 gap-4 divide-x divide-white/5">
                            <div className="space-y-1">
                              <span className="text-[9px] text-white/40 font-semibold block">PRAZO ESTIMADO DE PRODUÇÃO</span>
                              <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold">
                                <Clock className="w-3.5 h-3.5" />
                                <span>
                                  {selectedProduct.baseProductionDays + selectedFinishes.reduce((sum, f) => sum + f.additionalDays, 0)} Dias Úteis
                                </span>
                              </div>
                              <span className="text-[8px] text-white/30 font-medium block">
                                (Base: {selectedProduct.baseProductionDays}d + Acabamentos: {selectedFinishes.reduce((sum, f) => sum + f.additionalDays, 0)}d)
                              </span>
                            </div>

                            <div className="pl-4 space-y-1">
                              <span className="text-[9px] text-white/40 font-semibold block">PREÇO UNITÁRIO FINAL</span>
                              <span className="text-sm font-mono font-black text-emerald-400 block">
                                R$ {newItemPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                              <span className="text-[8px] text-white/30 font-medium block leading-tight">
                                Base: R$ {selectedProduct.basePrice.toFixed(2)} 
                                {selectedSize ? ` | Tam: +R$ ${selectedSize.priceAdjustment.toFixed(2)}` : ''}
                                {selectedFinishes.length > 0 ? ` | Acab: +R$ ${selectedFinishes.reduce((sum, f) => sum + f.price, 0).toFixed(2)}` : ''}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Quantity input and details preview */}
                        <div className="grid grid-cols-3 gap-3 items-end">
                          <div className="col-span-2">
                            <span className="block text-[10px] font-bold text-white/40 uppercase mb-1">Especificações do Item Gerado</span>
                            <div className="p-2 bg-white/[0.01] border border-white/5 text-[10px] text-indigo-300 font-bold rounded-lg truncate">
                              {newItemDetails || 'Selecione as opções acima...'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-white/40 uppercase">Quantidade</label>
                            <input
                              type="number"
                              min="1"
                              value={newItemQty}
                              onChange={(e) => setNewItemQty(Number(e.target.value))}
                              className="mt-1 block w-full px-2.5 py-1.5 text-xs border border-white/5 rounded-lg bg-white/5 text-white font-mono focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Item Button */}
                    <div className="pt-2 border-t border-white/5 flex justify-end">
                      <button
                        type="button"
                        disabled={!newItemDesc.trim()}
                        onClick={handleAddItemToForm}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Inserir no Orçamento</span>
                      </button>
                    </div>
                  </div>

                  {/* List of items added */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white/40 uppercase tracking-wider pb-1 border-b border-white/5">Lista de Itens da Proposta</h4>
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-white/5 border border-white/5 rounded-lg">
                        <div>
                          <p className="font-bold text-white text-xs">{item.description}</p>
                          <p className="text-[10px] text-white/40 mt-0.5">{item.details}</p>
                          {item.finishes && (
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 rounded mt-1.5 inline-block font-semibold">
                              Acabamento: {item.finishes}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right text-xs whitespace-nowrap">
                            <span className="text-white/40 font-semibold block">Qtd: {item.quantity} un x R$ {item.unitPrice.toFixed(2)}</span>
                            <strong className="block text-indigo-300 mt-0.5">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItemFromForm(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1 rounded-md hover:bg-white/5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {items.length === 0 && (
                      <p className="text-xs text-white/30 italic text-center py-6 border border-dashed border-white/5 rounded-lg">
                        Nenhum item inserido. Utilize o painel acima para adicionar serviços.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 3: LOGISTICS & PRODUCTION TIMING */}
              {formStep === 3 && (
                <div className="space-y-5">
                  {/* Logistics Type */}
                  <div className="p-4.5 bg-white/5 border border-white/5 rounded-xl space-y-4">
                    <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">Forma de Entrega / Logística</h4>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`p-4 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                        deliveryType === 'retirada' ? 'border-amber-500 bg-amber-500/5' : 'border-white/5 bg-white/[0.02]'
                      }`}>
                        <input
                          type="radio"
                          name="deliveryType"
                          checked={deliveryType === 'retirada'}
                          onChange={() => {
                            setDeliveryType('retirada');
                            setDeliveryFee(0);
                            setDeliveryAddress('');
                          }}
                          className="sr-only"
                        />
                        <MapPin className="w-5 h-5 text-amber-400" />
                        <div>
                          <span className="text-xs font-bold text-white block">Retirada Física Balcão</span>
                          <span className="text-[10px] text-white/40 font-semibold block mt-0.5">Sem custos de logística (R$ 0,00)</span>
                        </div>
                      </label>

                      <label className={`p-4 rounded-xl border flex items-center space-x-3 cursor-pointer transition-all ${
                        deliveryType === 'entrega' ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02]'
                      }`}>
                        <input
                          type="radio"
                          name="deliveryType"
                          checked={deliveryType === 'entrega'}
                          onChange={() => setDeliveryType('entrega')}
                          className="sr-only"
                        />
                        <Truck className="w-5 h-5 text-indigo-400" />
                        <div>
                          <span className="text-xs font-bold text-white block">Entrega / Motoboy / Correios</span>
                          <span className="text-[10px] text-white/40 font-semibold block mt-0.5">Calcula taxa adicional de despacho</span>
                        </div>
                      </label>
                    </div>

                    {deliveryType === 'entrega' && (
                      <div className="space-y-3 p-3 bg-white/[0.01] border border-white/5 rounded-lg animate-fade-in">
                        <div>
                          <label className="block text-[10px] font-bold text-white/40">Endereço de Entrega Completo *</label>
                          <input
                            type="text"
                            required
                            value={deliveryAddress}
                            onChange={(e) => setDeliveryAddress(e.target.value)}
                            placeholder="Rua, Número, Bairro, Cidade - CEP"
                            className="mt-1 block w-full px-3 py-2 text-xs border border-white/5 rounded-lg bg-[#111113] text-white focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 items-end">
                          <div>
                            <label className="block text-[10px] font-bold text-white/40">Taxa de Entrega (R$)</label>
                            <input
                              type="number"
                              value={deliveryFee}
                              onChange={(e) => setDeliveryFee(Number(e.target.value))}
                              className="mt-1 block w-full px-3 py-1.5 text-xs border border-white/5 rounded-lg bg-[#111113] text-white focus:outline-none"
                            />
                          </div>
                          <div>
                            <button
                              type="button"
                              onClick={handleSimulateFrete}
                              className="w-full inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-xs font-bold uppercase text-white tracking-wider"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingFrete ? 'animate-spin' : ''}`} />
                              <span>{isSimulatingFrete ? 'Simulando...' : 'Calcular Taxa Base'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timing & Urgency Days */}
                  <div className="p-4.5 bg-[#141416] border border-white/5 rounded-xl space-y-4">
                    <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider">Prazo Operacional & Taxa de Urgência</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <label className={`p-3 rounded-lg border text-center cursor-pointer ${urgencyLevel === 'normal' ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                        <input type="radio" checked={urgencyLevel === 'normal'} onChange={() => setUrgencyLevel('normal')} className="sr-only" />
                        <span className="text-[10px] font-bold block text-white">NORMAL</span>
                        <span className="text-xs font-bold block mt-1 text-white">5 Dias Úteis</span>
                        <span className="text-[9px] text-white/40 block mt-0.5">Sem taxa adicional</span>
                      </label>

                      <label className={`p-3 rounded-lg border text-center cursor-pointer ${urgencyLevel === 'urgente' ? 'border-amber-500 bg-amber-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                        <input type="radio" checked={urgencyLevel === 'urgente'} onChange={() => setUrgencyLevel('urgente')} className="sr-only" />
                        <span className="text-[10px] font-bold block text-amber-400">URGENTE</span>
                        <span className="text-xs font-bold block mt-1 text-white">3 Dias Úteis</span>
                        <span className="text-[9px] text-amber-400/80 block mt-0.5">+ R$ 50,00</span>
                      </label>

                      <label className={`p-3 rounded-lg border text-center cursor-pointer ${urgencyLevel === 'super_urgente' ? 'border-rose-500 bg-rose-500/5' : 'border-white/5 bg-white/[0.02]'}`}>
                        <input type="radio" checked={urgencyLevel === 'super_urgente'} onChange={() => setUrgencyLevel('super_urgente')} className="sr-only" />
                        <span className="text-[10px] font-bold block text-rose-400">SUPER EXPRESS</span>
                        <span className="text-xs font-bold block mt-1 text-white">1 Dia Útil</span>
                        <span className="text-[9px] text-rose-400/80 block mt-0.5">+ R$ 100,00</span>
                      </label>

                      <div className="p-3 rounded-lg border border-dashed border-white/5 bg-white/[0.01] text-center flex flex-col justify-center">
                        <span className="text-[9px] font-bold block text-white/40">PERSONALIZADO</span>
                        <div className="flex items-center justify-center space-x-2 mt-1.5">
                          <button type="button" onClick={() => adjustProductionDays(-1)} className="w-5 h-5 bg-white/5 hover:bg-white/10 rounded font-bold text-xs">-</button>
                          <span className="text-xs font-bold font-mono text-indigo-400">{productionDays} dias</span>
                          <button type="button" onClick={() => adjustProductionDays(1)} className="w-5 h-5 bg-white/5 hover:bg-white/10 rounded font-bold text-xs">+</button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-[10px] font-bold text-white/40 uppercase">Taxa de Urgência Manual (R$)</label>
                        <input
                          type="number"
                          value={urgencyFee}
                          onChange={(e) => {
                            setUrgencyFee(Number(e.target.value));
                            setUrgencyLevel('personalizado');
                          }}
                          className="mt-1 block w-full px-3 py-1.5 text-xs border border-white/5 rounded-lg bg-[#111113] text-white focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col justify-end">
                        <span className="text-[10px] text-white/40 block">Estimativa de Entrega na Fábrica:</span>
                        <span className="text-xs font-black text-emerald-400 mt-1 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{getDeliveryDate(productionDays).toLocaleDateString('pt-BR')} ({productionDays} dias úteis)</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: FINAL CONSOLIDATED SUMMARY */}
              {formStep === 4 && (
                <div className="space-y-4">
                  <div className="bg-[#141416] p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-extrabold text-indigo-400 uppercase tracking-wider border-b border-white/5 pb-2">Proposta de Faturamento do Orçamento</h4>
                    
                    {/* Header info */}
                    <div className="grid grid-cols-2 gap-4 text-xs font-medium border-b border-white/5 pb-4">
                      <div className="space-y-1">
                        <span className="text-white/40 block text-[9px] uppercase">Cliente de Destino</span>
                        <span className="text-white font-bold text-sm block">{clientName}</span>
                        {clientPhone && <span className="text-white/50 block font-mono">F: {clientPhone}</span>}
                        {clientEmail && <span className="text-white/50 block font-mono">E: {clientEmail}</span>}
                      </div>
                      <div className="space-y-1 text-right">
                        <span className="text-white/40 block text-[9px] uppercase">Linha e Logística</span>
                        <span className="text-white font-semibold block">{serviceType}</span>
                        <span className="text-white/60 block capitalize">Despacho: {deliveryType}</span>
                        <span className="text-emerald-400 font-bold block mt-1">Prazo: {productionDays} dias úteis</span>
                      </div>
                    </div>

                    {/* Table summary of items */}
                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                      <span className="text-white/40 block text-[9px] uppercase">Relação de Itens Emitidos</span>
                      {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 text-[11px]">
                          <div>
                            <span className="text-white font-bold">{item.description}</span>
                            {item.finishes && <span className="text-white/40 font-semibold block text-[10px]">Acabamento: {item.finishes}</span>}
                          </div>
                          <span className="text-white/80 font-mono font-semibold">{item.quantity} un x R$ {item.unitPrice.toFixed(2)} = R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR')}</span>
                        </div>
                      ))}
                    </div>

                    {/* Financial Receipt style box */}
                    <div className="p-4 bg-[#1a1a1c] border border-white/5 rounded-xl space-y-2.5 text-xs">
                      <div className="flex justify-between font-semibold text-white/50">
                        <span>Subtotal de Serviços:</span>
                        <span className="text-white">R$ {getItemsSubtotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-white/50">
                        <span>Taxa Logística ({deliveryType === 'entrega' ? 'Entrega' : 'Retirada'}):</span>
                        <span className="text-white">R$ {Number(deliveryFee).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-white/50">
                        <span>Taxa de Urgência Operacional ({urgencyLevel}):</span>
                        <span className="text-white">R$ {Number(urgencyFee).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="border-t border-white/5 pt-3.5 flex justify-between items-center font-black text-sm">
                        <span className="text-white uppercase tracking-wider text-xs">VALOR TOTAL CONSOLIDADO:</span>
                        <span className="text-xl text-indigo-400 font-mono">R$ {getQuoteTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4.5 bg-white/5 border-t border-white/5 flex justify-between items-center">
              <div>
                {formStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setFormStep(prev => prev - 1)}
                    className="px-4 py-2 border border-white/5 hover:bg-white/5 text-white rounded-lg text-xs font-bold uppercase transition-colors"
                  >
                    Voltar
                  </button>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-white/5 hover:bg-white/5 text-white/60 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>

                {formStep < 4 ? (
                  <button
                    type="button"
                    disabled={formStep === 1 && (!clientName || !clientPhone)}
                    onClick={() => {
                      if (formStep === 2 && items.length === 0) {
                        alert("Por favor, adicione pelo menos um serviço ou item para prosseguir.");
                        return;
                      }
                      setFormStep(prev => prev + 1);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all disabled:opacity-50"
                  >
                    Avançar
                  </button>
                ) : (
                  <button
                    onClick={handleCreateQuotation}
                    disabled={items.length === 0}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center space-x-1"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>Gravar & Emitir Proposta</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MULTIPLE MATCHING CLIENTS SELECTION MODAL */}
      {showMultiSelectModal && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#111113] border border-white/5 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-white/5 flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Multiplos Clientes Encontrados</h3>
              <button 
                onClick={() => setShowMultiSelectModal(false)}
                className="text-white/40 hover:text-white text-xs font-semibold"
              >
                Cancelar [x]
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
              <p className="text-xs text-white/50">Foram encontrados mais de um cliente correspondente à sua pesquisa. Escolha abaixo:</p>
              <div className="space-y-2.5">
                {matchingClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectClientFromMatches(c)}
                    className="w-full text-left p-3.5 bg-white/[0.02] border border-white/5 hover:border-indigo-500 rounded-xl hover:bg-indigo-500/5 transition-all flex justify-between items-center group cursor-pointer"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">{c.name}</h4>
                      <p className="text-[10px] text-white/40 font-mono mt-1">Documento: {c.cnpj || 'Isento'} | Fone: {c.phone}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-indigo-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL WITH SHARE OPTIONS & IN-PAGE PRINT ENGINE */}
      {showSuccessModal && lastCreatedQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-fade-in" id="success-share-modal">
          <div className="bg-[#111113] rounded-2xl border border-white/5 w-full max-w-xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-6 py-4.5 bg-white/5 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Sparkles className="w-5 h-5 animate-bounce" />
                <h3 className="text-sm font-black uppercase tracking-wider">Orçamento Emitido com Sucesso!</h3>
              </div>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setLastCreatedQuote(null);
                }}
                className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body with preview sheet */}
            <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 max-h-[70vh]">
              
              <div className="text-center space-y-1.5">
                <span className="text-2xl font-black text-white">{lastCreatedQuote.id}</span>
                <p className="text-xs text-white/40">Gravado no banco corporativo de propostas em estado *PENDENTE*</p>
              </div>

              {/* Share actions */}
              <div className="bg-white/[0.02] border border-white/5 p-4 rounded-xl space-y-4">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest block">Disparar & Enviar Orçamento</span>
                
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handlePrintQuote(lastCreatedQuote)}
                    className="flex items-center justify-center space-x-2 p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Imprimir PDF</span>
                  </button>
                  
                  <a
                    href={getWhatsAppURL(lastCreatedQuote)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center space-x-2 p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors text-center cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar WhatsApp</span>
                  </a>
                </div>
              </div>

              {/* On-screen Print Design Sheet (Beautiful layout that window.print() will target) */}
              <div className="border border-white/10 rounded-xl bg-white p-8 text-black shadow-lg space-y-6" id="print-wrapper">
                <div className="flex justify-between items-start border-b-2 border-black pb-4">
                  <div>
                    <h2 className="text-xl font-black tracking-tight uppercase">PROPOSTA COMERCIAL</h2>
                    <p className="text-xs font-semibold text-black/60 mt-1">ESTAÇÃO GRÁFICA & PROJETOS INDUSTRIAIS</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold">ORÇAMENTO Nº: <span className="text-indigo-600">{lastCreatedQuote.id}</span></p>
                    <p className="mt-1 font-semibold text-black/60">Data de Emissão: {new Date().toLocaleDateString('pt-BR')}</p>
                    <p className="font-semibold text-black/60">Validade Proposta: 15 dias corridos</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 text-xs border-b border-black/10 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-black/40 uppercase block">DADOS DO CLIENTE</span>
                    <p className="font-black text-sm">{lastCreatedQuote.clientName}</p>
                    {lastCreatedQuote.clientPhone && <p className="font-semibold text-black/70 font-mono">Telefone: {lastCreatedQuote.clientPhone}</p>}
                    {lastCreatedQuote.clientEmail && <p className="font-semibold text-black/70">E-mail: {lastCreatedQuote.clientEmail}</p>}
                    {lastCreatedQuote.clientDocument && <p className="font-semibold text-black/70 font-mono">Doc: {lastCreatedQuote.clientDocument}</p>}
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] font-bold text-black/40 uppercase block">LOGÍSTICA E PRAZOS</span>
                    <p className="font-bold">Expedição: <span className="capitalize">{lastCreatedQuote.deliveryType === 'retirada' ? 'Retirada em Loja' : 'Entrega / Correios'}</span></p>
                    {lastCreatedQuote.deliveryType === 'entrega' && <p className="font-semibold text-black/70">Endereço: {lastCreatedQuote.deliveryAddress}</p>}
                    <p className="font-black text-emerald-600 mt-1">Prazo de Produção: {lastCreatedQuote.productionDays || 5} dias úteis</p>
                    <p className="text-[10px] text-black/50 font-semibold">Estimativa Máxima de Entrega: {lastCreatedQuote.expiryDate}</p>
                  </div>
                </div>

                {/* Items grid */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-black/40 uppercase block">ESPECIFICAÇÕES DOS SERVIÇOS</span>
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-black/5 border-b border-black">
                        <th className="p-2 font-bold uppercase text-[9px]">Item</th>
                        <th className="p-2 font-bold uppercase text-[9px]">Descrição / Especificações Técnicas</th>
                        <th className="p-2 font-bold uppercase text-[9px]">Acabamentos</th>
                        <th className="p-2 font-bold uppercase text-[9px] text-center">Qtd</th>
                        <th className="p-2 font-bold uppercase text-[9px] text-right">Unitário</th>
                        <th className="p-2 font-bold uppercase text-[9px] text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10">
                      {lastCreatedQuote.items.map((item, index) => (
                        <tr key={index}>
                          <td className="p-2.5 font-bold font-mono">{index + 1}</td>
                          <td className="p-2.5">
                            <p className="font-bold">{item.description}</p>
                            <p className="text-[10px] text-black/60 leading-tight mt-0.5">{item.details}</p>
                          </td>
                          <td className="p-2.5 font-semibold text-indigo-700">{item.finishes || 'Nenhum'}</td>
                          <td className="p-2.5 font-bold text-center font-mono">{item.quantity}</td>
                          <td className="p-2.5 font-mono text-right">R$ {item.unitPrice.toFixed(2)}</td>
                          <td className="p-2.5 font-mono font-bold text-right">R$ {(item.quantity * item.unitPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Breakdown and signs */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-black/10">
                  <div className="text-[10px] text-black/60 font-semibold leading-relaxed space-y-1">
                    <p className="font-bold text-black uppercase">Termos e Condições:</p>
                    <p>• Prazo de produção começa a contar após aprovação de arquivos e confirmação de pagamento.</p>
                    <p>• Arquivos enviados pelo cliente são de inteira responsabilidade técnica do mesmo.</p>
                  </div>
                  <div className="bg-black/5 p-4 rounded-lg text-xs font-semibold space-y-2 text-right">
                    <div className="flex justify-between text-black/60">
                      <span>Subtotal Itens:</span>
                      <span className="font-mono">R$ {lastCreatedQuote.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {lastCreatedQuote.deliveryFee > 0 && (
                      <div className="flex justify-between text-black/60">
                        <span>Taxa Logística ({lastCreatedQuote.deliveryType}):</span>
                        <span className="font-mono">R$ {lastCreatedQuote.deliveryFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    {lastCreatedQuote.urgencyFee > 0 && (
                      <div className="flex justify-between text-black/60">
                        <span>Taxa Adicional Urgência:</span>
                        <span className="font-mono">R$ {lastCreatedQuote.urgencyFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="border-t border-black/20 pt-2 flex justify-between items-center text-sm font-black text-black">
                      <span className="uppercase text-[10px] tracking-wider">VALOR TOTAL:</span>
                      <span className="text-lg font-mono">R$ {lastCreatedQuote.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-8 text-center text-[10px] text-black/40 font-semibold border-t border-black/5">
                  Estação Gráfica e Projetos S/A - Soluções de Impressão e Design Corporativo
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setLastCreatedQuote(null);
                }}
                className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Fechar Painel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CONVERT TO ORDER: PAYMENT METHOD SELECTOR MODAL */}
      {showPaymentModal && approvingQuoteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-fade-in" id="payment-selection-modal">
          <div className="bg-[#111113] rounded-2xl border border-white/5 w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="px-5 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Aprovação do Orçamento</h3>
                <p className="text-[10px] text-white/40 font-semibold">Transformar em Pedido / Ordem de Produção Ativa</p>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setApprovingQuoteId(null);
                }}
                className="p-1 rounded text-white/40 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              <div className="p-3.5 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
                <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Total Comercial à Cobrar:</span>
                <span className="text-2xl font-black text-white mt-1 block font-mono">
                  R$ {quotes.find(q => q.id === approvingQuoteId)?.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Payment Select Option */}
              <div className="space-y-3">
                <label className="block text-[10px] font-bold text-white/50 uppercase tracking-wider">Forma de Pagamento Informada *</label>
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => {
                    setSelectedPaymentMethod(e.target.value);
                    if (e.target.value === 'Pix') setShowPixPaymentFeedback(false);
                  }}
                  className="w-full bg-[#111113] border border-white/5 text-xs text-white p-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold cursor-pointer"
                >
                  <option value="Pix">Pix / Transferência Instantânea</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Cartão de Débito">Cartão de Débito</option>
                  <option value="Boleto Bancário">Boleto Bancário</option>
                  <option value="Dinheiro">Dinheiro (Espécie)</option>
                </select>
              </div>

              {/* Interactive Pix QR and key if Pix is selected */}
              {selectedPaymentMethod === 'Pix' && (
                <div className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-3 text-center animate-fade-in">
                  <div className="w-32 h-32 bg-white p-2 rounded-lg mx-auto flex items-center justify-center">
                    {/* Simulated elegant QR code visual */}
                    <div className="w-full h-full bg-slate-900 rounded flex flex-col items-center justify-center p-1">
                      <div className="grid grid-cols-4 gap-1 w-full h-full opacity-90">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div key={i} className={`rounded-xs ${i % 3 === 0 || i % 5 === 0 ? 'bg-white' : 'bg-transparent'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-white/50">Chave Pix Gráfica (CNPJ):</p>
                    <div className="flex items-center justify-center space-x-1 bg-[#111113] p-1.5 rounded border border-white/5 max-w-[240px] mx-auto font-mono text-[10px] text-white/80 font-semibold">
                      <span>44.234.908/0001-44</span>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText('44.234.908/0001-44');
                          setShowPixPaymentFeedback(true);
                        }}
                        className="p-1 rounded text-indigo-400 hover:text-white hover:bg-indigo-500/10 cursor-pointer"
                        title="Copiar chave"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                    {showPixPaymentFeedback && <p className="text-[9px] text-emerald-400 font-bold animate-fade-in">Chave Pix copiada para área de transferência!</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-white/5 border-t border-white/5 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => {
                  setShowPaymentModal(false);
                  setApprovingQuoteId(null);
                }}
                className="px-4 py-2 border border-white/5 hover:bg-white/5 text-white/60 rounded-lg text-xs font-semibold"
              >
                Voltar
              </button>
              <button
                onClick={handleApproveQuotation}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold uppercase tracking-wide transition-all shadow-md cursor-pointer flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Confirmar Fechamento</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
