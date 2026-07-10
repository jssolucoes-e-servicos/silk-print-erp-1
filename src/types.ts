/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  cnpj?: string;
  companyName?: string;
  address?: string;
  createdAt: string;
}

export type ClientStatus = 'ativo' | 'inativo' | 'debito';

export interface Client {
  id: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  address: string;
  cnpj: string;
  totalOrders: number;
  lastOrder: string;
  balance: number;
  status: ClientStatus;
  activityHistory?: string[];
}

export type StockCategory = 'Papel' | 'Tintas' | 'Acabamentos';
export type StockStatus = 'CRÍTICO' | 'AVISO' | 'ESTÁVEL';

export interface StockItem {
  id: string;
  name: string;
  category: StockCategory;
  quantity: number;
  unit: string;
  minQuantity: number;
  status: StockStatus;
  cost: number;
}

export type QuotationStatus = 'PENDENTE' | 'APROVADO' | 'REJEITADO';

export interface QuoteItem {
  description: string;
  details: string;
  quantity: number;
  unitPrice: number;
}

export interface Quotation {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceType: string;
  expiryDate: string;
  totalValue: number;
  status: QuotationStatus;
  items: QuoteItem[];
}

export type InvoiceStatus = 'PAGO' | 'VENCIDO' | 'RASCUNHO';

export interface Invoice {
  id: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
  paymentMethod: string;
}

export type OSStatus = 'aguardando' | 'producao' | 'acabamento' | 'pronto' | 'entregue' | 'cancelado';
export type OSPaymentStatus = 'pago' | 'pendente';

export type TaskColumn = 'backlog' | 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description?: string;
  column: TaskColumn;
  priority: 'baixa' | 'media' | 'alta';
  assignedTo?: string;
  dueDate?: string;
  createdAt: string;
}

export interface OSFile {
  name: string;
  type: string;
  url: string;
}

export interface ServiceOrder {
  id: string;
  clientName: string;
  cnpj: string;
  productName: string;
  quantity: string;
  deliveryDate: string;
  price: number;
  statusOS: OSStatus;
  paymentStatus: OSPaymentStatus;
  notes?: string;
  files?: OSFile[];
}

export interface CanvasElement {
  id: string;
  type: 'text' | 'rect' | 'circle' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  align?: 'left' | 'center' | 'right';
  src?: string;
}

export interface CanvasArt {
  id: string;
  title: string;
  elements: CanvasElement[];
  thumbnail?: string;
  createdAt: string;
  userId: string;
}

export interface AppState {
  clients: Client[];
  stock: StockItem[];
  quotations: Quotation[];
  invoices: Invoice[];
  orders: ServiceOrder[];
  canvasArts: CanvasArt[];
}
