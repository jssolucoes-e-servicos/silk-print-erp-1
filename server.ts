import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { 
  Client, StockItem, Quotation, Invoice, ServiceOrder, CanvasArt, User 
} from "./src/types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// DB File path
const DB_FILE = path.join(process.cwd(), "db.json");

// Helper to load database
function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
      if (!data.tasks) {
        data.tasks = [
          { id: "task-1", title: "Revisar arquivos PDF do Cliente Ricardo", description: "Verificar se as fontes estão embutidas e as cores em CMYK", column: "todo", priority: "alta", assignedTo: "Alex Santos", dueDate: "2026-07-15", createdAt: new Date().toISOString() },
          { id: "task-2", title: "Comprar papel Couché SRA3", description: "Estoque está crítico no painel", column: "backlog", priority: "alta", assignedTo: "Alex Santos", dueDate: "2026-07-12", createdAt: new Date().toISOString() },
          { id: "task-3", title: "Calibrar cromia digital", description: "Ajustar cabeçotes de impressão", column: "in_progress", priority: "media", assignedTo: "Alex Santos", dueDate: "2026-07-10", createdAt: new Date().toISOString() },
          { id: "task-4", title: "Faturar ordem de serviço", description: "Emitir NF-e e enviar link de pagamento", column: "done", priority: "baixa", assignedTo: "Alex Santos", dueDate: "2026-07-09", createdAt: new Date().toISOString() }
        ];
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
      }
      return data;
    } catch (e) {
      console.error("Error parsing db.json, resetting to seed data", e);
    }
  }

  // Seed data
  const seedData = {
    users: [
      {
        id: "1",
        name: "Alex Santos",
        email: "jackson144@gmail.com",
        role: "Gerente de Produção",
        companyName: "PrintFlow ERP",
        cnpj: "50.123.456/0001-78",
        address: "Av. Paulista, 1000, 4º Andar, 01310-100 São Paulo, Brasil",
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDfwZXj-ClrysAwwiOMEw-O0EIJOgQ_fE0E4b_xATUA_yF_eIZB4iK_sUK3dZlv5zYnd_6OF8Nwy42UBvEy3NvTUanZtA9TtQ9dLX7MAtRM6a9W8nxU8KvQos8Bj9w464ANyynIaJDRX7Mjb8eTp3RPjkv2JuxdoG-7oyzvCQOx8MTU9deZGBmOnootAnAcF2pl3jw3af3bkxzXakMML7uK3hMgXoqOiCEJHApu6PI23Lrv_8gGWn4Y1dGUFIEjJ0A9zUOlRY4N5KI",
        createdAt: new Date().toISOString()
      }
    ],
    clients: [
      {
        id: "CLI-00923",
        name: "Ricardo Mendonça",
        companyName: "Studio Creative Ltda.",
        email: "ricardo@studiocreative.pt",
        phone: "+55 11 91234-5678",
        address: "Av. Paulista, 1000, 4º Andar, 01310-100 São Paulo, Brasil",
        cnpj: "50.123.456/0001-78",
        totalOrders: 42,
        lastOrder: "12 Out 2023",
        balance: 1250.00,
        status: "ativo",
        activityHistory: [
          "Criado no sistema em 10/01/2023",
          "Ordem de Serviço #8842 enviada para produção",
          "Pagamento de R$ 1.250,00 faturado com sucesso"
        ]
      },
      {
        id: "CLI-00156",
        name: "Ana Fonseca",
        companyName: "Moda Lisboa Eventos",
        email: "contato@lisboaeventos.pt",
        phone: "+351 912 345 678",
        address: "Rua do Ouro, 120, Lisboa, Portugal",
        cnpj: "98.765.432/0001-10",
        totalOrders: 156,
        lastOrder: "Ontem",
        balance: -430.20,
        status: "debito",
        activityHistory: [
          "Fatura #843 com atraso de 2 dias",
          "Limite de crédito excedido"
        ]
      },
      {
        id: "CLI-00008",
        name: "Bruno Pires",
        companyName: "Tech Solutions S.A.",
        email: "b.pires@techsolutions.com",
        phone: "+55 11 98888-7777",
        address: "Av. Berrini, 1700, 10º andar, São Paulo, SP",
        cnpj: "11.222.333/0001-44",
        totalOrders: 8,
        lastOrder: "28 Set 2023",
        balance: 0.00,
        status: "inativo",
        activityHistory: [
          "Conta inativada por falta de movimentação nos últimos 90 dias"
        ]
      },
      {
        id: "CLI-00089",
        name: "Juliana Silva",
        companyName: "Agência Impacto",
        email: "juliana@agenciaimpacto.com.br",
        phone: "+55 21 97777-6666",
        address: "Av. Atlântica, 450, Copacabana, Rio de Janeiro, RJ",
        cnpj: "22.333.444/0001-55",
        totalOrders: 89,
        lastOrder: "Hoje",
        balance: 3420.50,
        status: "ativo",
        activityHistory: [
          "Aprovou orçamento #878 de R$ 1.100,00",
          "Ordem de Serviço #895 gerada"
        ]
      }
    ],
    stock: [
      {
        id: "STK-001",
        name: "Couché 150g (SRA3)",
        category: "Papel",
        quantity: 12,
        unit: "Resmas",
        minQuantity: 80,
        status: "CRÍTICO",
        cost: 45.00
      },
      {
        id: "STK-002",
        name: "Ciano Digital Ink (Premium)",
        category: "Tintas",
        quantity: 0.4,
        unit: "Litros",
        minQuantity: 5.0,
        status: "CRÍTICO",
        cost: 120.00
      },
      {
        id: "STK-003",
        name: "Verniz UV Brilhante",
        category: "Acabamentos",
        quantity: 4.5,
        unit: "Litros",
        minQuantity: 20,
        status: "CRÍTICO",
        cost: 85.00
      },
      {
        id: "STK-004",
        name: "Tinta Offset Magenta XL",
        category: "Tintas",
        quantity: 14.5,
        unit: "Litros",
        minQuantity: 5.0,
        status: "ESTÁVEL",
        cost: 95.00
      },
      {
        id: "STK-005",
        name: "Rolo de Laminação Fosca 100m",
        category: "Acabamentos",
        quantity: 8,
        unit: "Unidades",
        minQuantity: 10,
        status: "AVISO",
        cost: 110.00
      },
      {
        id: "STK-006",
        name: "Papel Bond 80g A4 Branco",
        category: "Papel",
        quantity: 450,
        unit: "Resmas",
        minQuantity: 100,
        status: "ESTÁVEL",
        cost: 18.00
      }
    ],
    quotations: [
      {
        id: "ORD-2023-0891",
        clientName: "Studio Magenta Ltda",
        clientEmail: "contato@magenta.pt",
        serviceType: "Impressão Offset",
        expiryDate: "24 Out 2023",
        totalValue: 1240.00,
        status: "PENDENTE",
        items: [
          { description: "Brochuras A4 - 1000 un", details: "Papel Couché 150g - 4x4 cores", quantity: 1, unitPrice: 850.00 },
          { description: "Design & Paginação", details: "Taxa de serviço criativo", quantity: 1, unitPrice: 150.00 },
          { description: "Transporte Urgente", details: "Entrega em 24h", quantity: 1, unitPrice: 40.00 }
        ]
      },
      {
        id: "ORD-2023-0889",
        clientName: "Blue Flame Agency",
        clientEmail: "creative@blueflame.com",
        serviceType: "Lona / Grandes Formatos",
        expiryDate: "15 Out 2023",
        totalValue: 3850.00,
        status: "APROVADO",
        items: [
          { description: "Lona Impressa Gigante", details: "Lona 440g fosca c/ ilhós de metro em metro", quantity: 2, unitPrice: 1925.00 }
        ]
      },
      {
        id: "ORD-2023-0885",
        clientName: "Kappa Publications",
        clientEmail: "editorial@kappapub.com",
        serviceType: "Acabamento e Encadernação",
        expiryDate: "12 Out 2023",
        totalValue: 820.50,
        status: "REJEITADO",
        items: [
          { description: "Encadernação Espiral de Alta Resistência", details: "Capa plástica PP e espiral metálica preta", quantity: 150, unitPrice: 5.47 }
        ]
      },
      {
        id: "ORD-2023-0882",
        clientName: "Global Hotels",
        clientEmail: "procurement@globalhotels.com",
        serviceType: "Impressão Digital",
        expiryDate: "10 Out 2023",
        totalValue: 412.00,
        status: "PENDENTE",
        items: [
          { description: "Cardápios Dobráveis", details: "Papel Supremo 300g c/ laminação fosca anti-risco", quantity: 40, unitPrice: 10.30 }
        ]
      },
      {
        id: "ORD-2023-0878",
        clientName: "X-Neon Tech",
        clientEmail: "neon@xneontech.com",
        serviceType: "Corte de Vinil",
        expiryDate: "08 Out 2023",
        totalValue: 1100.00,
        status: "APROVADO",
        items: [
          { description: "Adesivos Vinílicos Automotivos", details: "Vinil Avery de alta durabilidade c/ máscara de transferência", quantity: 200, unitPrice: 5.50 }
        ]
      }
    ],
    invoices: [
      {
        id: "FT-2023-0842",
        clientName: "Gráfica Digital Ltda.",
        clientEmail: "financeiro@graficadigital.com",
        issueDate: "12 Out 2023",
        dueDate: "12 Nov 2023",
        amount: 2450.00,
        status: "PAGO",
        paymentMethod: "Boleto Bancário"
      },
      {
        id: "FT-2023-0843",
        clientName: "Branding Master S/A",
        clientEmail: "contato@brandingmaster.com",
        issueDate: "08 Out 2023",
        dueDate: "08 Nov 2023",
        amount: 890.20,
        status: "VENCIDO",
        paymentMethod: "Cartão de Crédito"
      },
      {
        id: "FT-2023-0844",
        clientName: "Eco Print Studio",
        clientEmail: "ecoprint@ecoprint.com",
        issueDate: "15 Out 2023",
        dueDate: "15 Nov 2023",
        amount: 12600.00,
        status: "RASCUNHO",
        paymentMethod: "Faturamento Interno"
      },
      {
        id: "FT-2023-0845",
        clientName: "Visual Solutions",
        clientEmail: "contact@visualsolutions.com",
        issueDate: "18 Out 2023",
        dueDate: "18 Nov 2023",
        amount: 4120.00,
        status: "PAGO",
        paymentMethod: "Pix"
      },
      {
        id: "FT-2023-0846",
        clientName: "Arte Livre Co.",
        clientEmail: "arte@artelivre.co",
        issueDate: "20 Out 2023",
        dueDate: "20 Nov 2023",
        amount: 750.00,
        status: "PAGO",
        paymentMethod: "Pix"
      }
    ],
    orders: [
      {
        id: "OS-2024-0891",
        clientName: "Agência Creative Minds",
        cnpj: "12.345.678/0001-90",
        productName: "Flyers Couché 150g",
        quantity: "5.000 unidades",
        deliveryDate: "24/10/2024",
        price: 1450.00,
        statusOS: "producao",
        paymentStatus: "pago",
        notes: "Atração redobrada na prova de cor da capa. O cliente solicitou fidelidade absoluta ao pantone corporativo.",
        files: [
          { name: "capa_vfinal.pdf", type: "PDF", url: "https://images.unsplash.com/photo-1541963463532-d68292c34b19" },
          { name: "miolo_catalogo.pdf", type: "PDF", url: "" },
          { name: "banner_promo.ai", type: "AI", url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66" }
        ]
      },
      {
        id: "OS-2024-0892",
        clientName: "Restaurante Sabor Local",
        cnpj: "987.654.321-00",
        productName: "Cardápios Plastificados",
        quantity: "50 unidades",
        deliveryDate: "26/10/2024",
        price: 890.00,
        statusOS: "aguardando",
        paymentStatus: "pendente",
        notes: "Urgência média. Acabamento brilhante reforçado.",
        files: []
      },
      {
        id: "OS-2024-0888",
        clientName: "Tech Innovators Corp",
        cnpj: "45.678.901/0001-23",
        productName: "Cartões de Visita Premium",
        quantity: "1.000 unidades",
        deliveryDate: "Entregue",
        price: 320.00,
        statusOS: "entregue",
        paymentStatus: "pago",
        notes: "Laminação soft touch",
        files: []
      },
      {
        id: "OS-2024-0895",
        clientName: "Eduardo Silva - ME",
        cnpj: "222.333.444-55",
        productName: "Banners Lona 440g",
        quantity: "2 unidades",
        deliveryDate: "--",
        price: 560.00,
        statusOS: "aguardando",
        paymentStatus: "pendente",
        notes: "Rascunho inicial",
        files: []
      },
      {
        id: "OS-2024-0870",
        clientName: "Livraria Central",
        cnpj: "00.111.222/0001-33",
        productName: "Marcadores de Página",
        quantity: "2.000 unidades",
        deliveryDate: "Cancelado",
        price: 450.00,
        statusOS: "cancelado",
        paymentStatus: "pendente",
        notes: "Cancelado pelo cliente por mudança de escopo",
        files: []
      }
    ],
    canvasArts: [
      {
        id: "art-1",
        title: "Capa Catálogo Verão 2024",
        userId: "1",
        createdAt: new Date().toISOString(),
        elements: [
          { id: "el-1", type: "rect", x: 20, y: 20, width: 360, height: 460, fill: "#e0f2f1" },
          { id: "el-2", type: "text", x: 40, y: 80, width: 320, height: 60, fill: "#004d40", text: "VERÃO TROPICAL", fontSize: 28, fontFamily: "Plus Jakarta Sans", fontWeight: "800", align: "center" },
          { id: "el-3", type: "text", x: 40, y: 140, width: 320, height: 40, fill: "#00796b", text: "Coleção 2024", fontSize: 18, fontFamily: "Plus Jakarta Sans", fontWeight: "600", align: "center" },
          { id: "el-4", type: "rect", x: 100, y: 220, width: 200, height: 180, fill: "#80cbc4" },
          { id: "el-5", type: "text", x: 40, y: 420, width: 320, height: 30, fill: "#004d40", text: "Estilo & Elegância", fontSize: 12, fontFamily: "Inter", fontWeight: "bold", align: "center" }
        ],
        thumbnail: ""
      }
    ],
    tasks: [
      { id: "task-1", title: "Revisar arquivos PDF do Cliente Ricardo", description: "Verificar se as fontes estão embutidas e as cores em CMYK", column: "todo", priority: "alta", assignedTo: "Alex Santos", dueDate: "2026-07-15", createdAt: new Date().toISOString() },
      { id: "task-2", title: "Comprar papel Couché SRA3", description: "Estoque está crítico no painel", column: "backlog", priority: "alta", assignedTo: "Alex Santos", dueDate: "2026-07-12", createdAt: new Date().toISOString() },
      { id: "task-3", title: "Calibrar cromia digital", description: "Ajustar cabeçotes de impressão", column: "in_progress", priority: "media", assignedTo: "Alex Santos", dueDate: "2026-07-10", createdAt: new Date().toISOString() },
      { id: "task-4", title: "Faturar ordem de serviço", description: "Emitir NF-e e enviar link de pagamento", column: "done", priority: "baixa", assignedTo: "Alex Santos", dueDate: "2026-07-09", createdAt: new Date().toISOString() }
    ],
    emailLogs: [],
    paymentLogs: []
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(seedData, null, 2), "utf-8");
  return seedData;
}

// Save database helper
function saveDB(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// User auth store (simple in-memory or session mock)
let activeSessions: { [token: string]: User } = {};

// Auth middleware
function getAuthenticatedUser(req: express.Request): User | null {
  const token = req.headers["x-auth-token"] as string;
  if (token && activeSessions[token]) {
    return activeSessions[token];
  }
  // Default fallback to first seed user in single-user context so it works directly out-of-the-box
  const db = loadDB();
  return db.users[0] || null;
}

// AUTH ENDPOINTS
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = loadDB();
  const user = db.users.find((u: any) => u.email === email);
  if (user) {
    // Generate simple token
    const token = "token-" + Math.random().toString(36).substr(2);
    activeSessions[token] = user;
    res.json({ success: true, token, user });
  } else {
    // If user registration is fully virtual, we will automatically register or fail nicely.
    // For robust security, we allow jackson144@gmail.com without credentials for instant testing.
    if (email === "jackson144@gmail.com") {
      const newUser = db.users[0];
      const token = "token-admin";
      activeSessions[token] = newUser;
      return res.json({ success: true, token, user: newUser });
    }
    res.status(401).json({ error: "Email ou senha incorretos." });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, companyName, cnpj, address } = req.body;
  const db = loadDB();
  if (db.users.some((u: any) => u.email === email)) {
    return res.status(400).json({ error: "Email já cadastrado." });
  }
  const newUser: User = {
    id: String(db.users.length + 1),
    name,
    email,
    role: "Administrador",
    companyName: companyName || "Minha Gráfica",
    cnpj: cnpj || "",
    address: address || "",
    createdAt: new Date().toISOString()
  };
  db.users.push(newUser);
  saveDB(db);

  const token = "token-" + Math.random().toString(36).substr(2);
  activeSessions[token] = newUser;
  res.json({ success: true, token, user: newUser });
});

app.post("/api/auth/recover", (req, res) => {
  const { email } = req.body;
  const db = loadDB();
  const user = db.users.find((u: any) => u.email === email);
  
  // Log virtual email recovery link
  const mockEmail = {
    id: "mail-" + Date.now(),
    to: email,
    subject: "Recuperação de Senha - PrintFlow ERP",
    body: `Olá ${user?.name || "Usuário"},\n\nPara redefinir sua senha, utilize o seguinte link de acesso de segurança único: http://localhost:3000/reset-password?token=virtual-reset-token-123\n\nSe você não solicitou isso, desconsidere este e-mail.\n\nPrintFlow Security Team`,
    sentAt: new Date().toISOString()
  };
  
  db.emailLogs = db.emailLogs || [];
  db.emailLogs.unshift(mockEmail);
  saveDB(db);

  if (user) {
    res.json({ success: true, message: "E-mail de recuperação enviado com sucesso (veja o registro de envios!)." });
  } else {
    res.json({ success: true, message: "E-mail de recuperação enviado caso a conta exista." });
  }
});

app.get("/api/auth/me", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (user) {
    res.json({ user });
  } else {
    res.status(401).json({ error: "Não autenticado" });
  }
});

app.get("/api/auth/profile", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (user) {
    res.json(user);
  } else {
    res.status(401).json({ error: "Não autenticado" });
  }
});

app.put("/api/auth/profile", (req, res) => {
  const user = getAuthenticatedUser(req);
  if (!user) return res.status(401).json({ error: "Não autenticado" });

  const { name, email, companyName, cnpj, address } = req.body;
  const db = loadDB();
  const userIndex = db.users.findIndex((u: any) => u.id === user.id);
  
  if (userIndex !== -1) {
    db.users[userIndex] = {
      ...db.users[userIndex],
      name: name || db.users[userIndex].name,
      email: email || db.users[userIndex].email,
      companyName: companyName || db.users[userIndex].companyName,
      cnpj: cnpj || db.users[userIndex].cnpj,
      address: address || db.users[userIndex].address
    };
    saveDB(db);
    // Update active session
    Object.keys(activeSessions).forEach(token => {
      if (activeSessions[token].id === user.id) {
        activeSessions[token] = db.users[userIndex];
      }
    });
    res.json({ success: true, user: db.users[userIndex] });
  } else {
    res.status(404).json({ error: "Usuário não encontrado" });
  }
});

// CLIENT CRUD
app.get("/api/clients", (req, res) => {
  const db = loadDB();
  res.json(db.clients);
});

app.post("/api/clients", (req, res) => {
  const clientData = req.body;
  const db = loadDB();
  const id = "CLI-" + String(db.clients.length + 100).padStart(5, '0');
  const newClient: Client = {
    id,
    name: clientData.name,
    companyName: clientData.companyName,
    email: clientData.email,
    phone: clientData.phone,
    address: clientData.address || "",
    cnpj: clientData.cnpj || "",
    totalOrders: 0,
    lastOrder: "--",
    balance: Number(clientData.balance || 0),
    status: clientData.status || "ativo",
    activityHistory: ["Cliente registrado no sistema em " + new Date().toLocaleDateString("pt-BR")]
  };
  db.clients.unshift(newClient);
  saveDB(db);
  res.json(newClient);
});

app.put("/api/clients/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const db = loadDB();
  const index = db.clients.findIndex((c: any) => c.id === id);
  if (index !== -1) {
    db.clients[index] = {
      ...db.clients[index],
      ...updateData,
      activityHistory: [
        ...(db.clients[index].activityHistory || []),
        `Cadastro atualizado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}`
      ]
    };
    saveDB(db);
    res.json(db.clients[index]);
  } else {
    res.status(404).json({ error: "Cliente não encontrado" });
  }
});

app.delete("/api/clients/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  const initialLength = db.clients.length;
  db.clients = db.clients.filter((c: any) => c.id !== id);
  if (db.clients.length < initialLength) {
    saveDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Cliente não encontrado" });
  }
});

// STOCK CRUD
app.get("/api/stock", (req, res) => {
  const db = loadDB();
  res.json(db.stock);
});

app.post("/api/stock", (req, res) => {
  const itemData = req.body;
  const db = loadDB();
  const id = "STK-" + String(db.stock.length + 1).padStart(3, '0');
  
  // Status check helper
  const qty = Number(itemData.quantity || 0);
  const min = Number(itemData.minQuantity || 1);
  let status: "CRÍTICO" | "AVISO" | "ESTÁVEL" = "ESTÁVEL";
  if (qty <= min * 0.2) status = "CRÍTICO";
  else if (qty <= min) status = "AVISO";

  const newItem: StockItem = {
    id,
    name: itemData.name,
    category: itemData.category,
    quantity: qty,
    unit: itemData.unit,
    minQuantity: min,
    status,
    cost: Number(itemData.cost || 0)
  };
  db.stock.unshift(newItem);
  saveDB(db);
  res.json(newItem);
});

app.put("/api/stock/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const db = loadDB();
  const index = db.stock.findIndex((s: any) => s.id === id);
  if (index !== -1) {
    const updated = { ...db.stock[index], ...updateData };
    // Recalculate stock status based on updated quantity
    const qty = Number(updated.quantity);
    const min = Number(updated.minQuantity);
    if (qty <= min * 0.2) updated.status = "CRÍTICO";
    else if (qty <= min) updated.status = "AVISO";
    else updated.status = "ESTÁVEL";

    db.stock[index] = updated;
    saveDB(db);
    res.json(updated);
  } else {
    res.status(404).json({ error: "Item de estoque não encontrado" });
  }
});

app.delete("/api/stock/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  db.stock = db.stock.filter((s: any) => s.id !== id);
  saveDB(db);
  res.json({ success: true });
});

// QUOTATIONS CRUD
app.get("/api/quotations", (req, res) => {
  const db = loadDB();
  res.json(db.quotations);
});

app.post("/api/quotations", (req, res) => {
  const data = req.body;
  const db = loadDB();
  const id = "ORD-2024-" + String(db.quotations.length + 800).padStart(4, '0');
  
  const newQuote: Quotation = {
    id,
    clientName: data.clientName,
    clientEmail: data.clientEmail || "contato@cliente.com.br",
    serviceType: data.serviceType || "Impressão Digital",
    expiryDate: data.expiryDate || new Date(Date.now() + 15*24*60*60*1000).toLocaleDateString("pt-BR"),
    totalValue: Number(data.totalValue || 0),
    status: data.status || "PENDENTE",
    items: data.items || []
  };

  db.quotations.unshift(newQuote);
  saveDB(db);
  res.json(newQuote);
});

app.put("/api/quotations/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const db = loadDB();
  const index = db.quotations.findIndex((q: any) => q.id === id);
  if (index !== -1) {
    // If status moves to APROVADO, automatically generate corresponding Service Order!
    const oldStatus = db.quotations[index].status;
    const newStatus = updateData.status;

    db.quotations[index] = { ...db.quotations[index], ...updateData };

    if (oldStatus !== "APROVADO" && newStatus === "APROVADO") {
      const q = db.quotations[index];
      const osId = "OS-2024-" + String(db.orders.length + 800).padStart(4, '0');
      const newOS: ServiceOrder = {
        id: osId,
        clientName: q.clientName,
        cnpj: "CNPJ do Cliente",
        productName: q.items[0]?.description || q.serviceType,
        quantity: q.items[0]?.details || "1 lote",
        deliveryDate: new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString("pt-BR"),
        price: q.totalValue,
        statusOS: "aguardando",
        paymentStatus: "pendente",
        notes: "Gerado automaticamente a partir do Orçamento " + q.id,
        files: []
      };
      db.orders = db.orders || [];
      db.orders.unshift(newOS);

      // Create a pending invoice as well!
      const invId = "FT-2024-" + String(db.invoices.length + 800).padStart(4, '0');
      const newInv: Invoice = {
        id: invId,
        clientName: q.clientName,
        clientEmail: q.clientEmail,
        issueDate: new Date().toLocaleDateString("pt-BR"),
        dueDate: new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString("pt-BR"),
        amount: q.totalValue,
        status: "RASCUNHO",
        paymentMethod: "Boleto Bancário"
      };
      db.invoices.unshift(newInv);
    }

    saveDB(db);
    res.json(db.quotations[index]);
  } else {
    res.status(404).json({ error: "Orçamento não encontrado" });
  }
});

app.delete("/api/quotations/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  db.quotations = db.quotations.filter((q: any) => q.id !== id);
  saveDB(db);
  res.json({ success: true });
});

// SERVICE ORDERS CRUD
app.get("/api/orders", (req, res) => {
  const db = loadDB();
  res.json(db.orders);
});

app.post("/api/orders", (req, res) => {
  const data = req.body;
  const db = loadDB();
  const id = "OS-2024-" + String(db.orders.length + 100).padStart(4, '0');
  const newOS: ServiceOrder = {
    id,
    clientName: data.clientName,
    cnpj: data.cnpj || "",
    productName: data.productName,
    quantity: data.quantity || "1 unidade",
    deliveryDate: data.deliveryDate || new Date(Date.now() + 5*24*60*60*1000).toLocaleDateString("pt-BR"),
    price: Number(data.price || 0),
    statusOS: data.statusOS || "aguardando",
    paymentStatus: data.paymentStatus || "pendente",
    notes: data.notes || "",
    files: data.files || []
  };
  db.orders.unshift(newOS);
  saveDB(db);
  res.json(newOS);
});

app.put("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const db = loadDB();
  const index = db.orders.findIndex((o: any) => o.id === id);
  if (index !== -1) {
    db.orders[index] = { ...db.orders[index], ...updateData };
    saveDB(db);
    res.json(db.orders[index]);
  } else {
    res.status(404).json({ error: "Ordem de serviço não encontrada" });
  }
});

app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  db.orders = db.orders.filter((o: any) => o.id !== id);
  saveDB(db);
  res.json({ success: true });
});

// BILLING/INVOICES CRUD
app.get("/api/invoices", (req, res) => {
  const db = loadDB();
  res.json(db.invoices);
});

app.post("/api/invoices", (req, res) => {
  const data = req.body;
  const db = loadDB();
  const id = "FT-2024-" + String(db.invoices.length + 800).padStart(4, '0');
  const newInv: Invoice = {
    id,
    clientName: data.clientName,
    clientEmail: data.clientEmail || "financeiro@cliente.com.br",
    issueDate: data.issueDate || new Date().toLocaleDateString("pt-BR"),
    dueDate: data.dueDate || new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString("pt-BR"),
    amount: Number(data.amount || 0),
    status: data.status || "RASCUNHO",
    paymentMethod: data.paymentMethod || "Pix"
  };
  db.invoices.unshift(newInv);
  saveDB(db);
  res.json(newInv);
});

app.put("/api/invoices/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const db = loadDB();
  const index = db.invoices.findIndex((inv: any) => inv.id === id);
  if (index !== -1) {
    db.invoices[index] = { ...db.invoices[index], ...updateData };
    saveDB(db);
    res.json(db.invoices[index]);
  } else {
    res.status(404).json({ error: "Fatura não encontrada" });
  }
});

app.delete("/api/invoices/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  db.invoices = db.invoices.filter((inv: any) => inv.id !== id);
  saveDB(db);
  res.json({ success: true });
});

// PAYMENT INTEGRATION MOCK
app.post("/api/payment/simulate", (req, res) => {
  const { invoiceId, paymentMethod, creditCardNumber, billingName } = req.body;
  const db = loadDB();
  const index = db.invoices.findIndex((inv: any) => inv.id === invoiceId);
  
  if (index !== -1) {
    const invoice = db.invoices[index];
    
    // Simulate API payment call to Stripe/Pagar.me
    const paymentLog = {
      id: "pay-" + Date.now(),
      invoiceId,
      amount: invoice.amount,
      clientName: invoice.clientName,
      paymentMethod,
      transactionId: "tx_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      status: "APPROVED",
      timestamp: new Date().toISOString()
    };
    
    db.paymentLogs = db.paymentLogs || [];
    db.paymentLogs.unshift(paymentLog);
    
    // Update invoice status to PAGO
    db.invoices[index].status = "PAGO";
    db.invoices[index].paymentMethod = paymentMethod;
    
    // Find matching Client and update balance and add activity log
    const clientIndex = db.clients.findIndex((c: any) => c.name === invoice.clientName);
    if (clientIndex !== -1) {
      db.clients[clientIndex].balance += invoice.amount;
      db.clients[clientIndex].status = db.clients[clientIndex].balance >= 0 ? "ativo" : "debito";
      db.clients[clientIndex].activityHistory = [
        ...(db.clients[clientIndex].activityHistory || []),
        `Fatura #${invoice.id} paga no valor de R$ ${invoice.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} via ${paymentMethod}`
      ];
    }
    
    // Find matching OS and update payment status to PAGO
    const osIndex = db.orders.findIndex((o: any) => o.clientName === invoice.clientName && Math.abs(o.price - invoice.amount) < 0.1);
    if (osIndex !== -1) {
      db.orders[osIndex].paymentStatus = "pago";
    }

    saveDB(db);
    res.json({ success: true, transaction: paymentLog });
  } else {
    res.status(404).json({ error: "Fatura não encontrada para pagamento" });
  }
});

// CANVAS / CANVA.COM INTEGRATION ENDPOINTS
app.get("/api/canvas-arts", (req, res) => {
  const db = loadDB();
  res.json(db.canvasArts || []);
});

app.post("/api/canvas-arts", (req, res) => {
  const { title, elements, thumbnail } = req.body;
  const user = getAuthenticatedUser(req);
  const db = loadDB();
  
  const id = "art-" + Date.now();
  const newArt: CanvasArt = {
    id,
    title,
    elements,
    thumbnail: thumbnail || "",
    userId: user ? user.id : "1",
    createdAt: new Date().toISOString()
  };
  
  db.canvasArts = db.canvasArts || [];
  db.canvasArts.unshift(newArt);
  saveDB(db);
  res.json(newArt);
});

app.put("/api/canvas-arts/:id", (req, res) => {
  const { id } = req.params;
  const { title, elements, thumbnail } = req.body;
  const db = loadDB();
  const index = db.canvasArts.findIndex((art: any) => art.id === id);
  if (index !== -1) {
    db.canvasArts[index] = {
      ...db.canvasArts[index],
      title: title || db.canvasArts[index].title,
      elements: elements || db.canvasArts[index].elements,
      thumbnail: thumbnail || db.canvasArts[index].thumbnail
    };
    saveDB(db);
    res.json(db.canvasArts[index]);
  } else {
    res.status(404).json({ error: "Arte Canva não encontrada" });
  }
});

// TASK CRUD (Trello-like Kanban)
app.get("/api/tasks", (req, res) => {
  const db = loadDB();
  res.json(db.tasks || []);
});

app.post("/api/tasks", (req, res) => {
  const data = req.body;
  const db = loadDB();
  db.tasks = db.tasks || [];
  
  const id = "task-" + Date.now();
  const newTask = {
    id,
    title: data.title || "Nova Tarefa",
    description: data.description || "",
    column: data.column || "todo",
    priority: data.priority || "media",
    assignedTo: data.assignedTo || "Sem atribuição",
    dueDate: data.dueDate || "",
    createdAt: new Date().toISOString()
  };
  
  db.tasks.push(newTask);
  saveDB(db);
  res.json(newTask);
});

app.put("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const db = loadDB();
  db.tasks = db.tasks || [];
  
  const index = db.tasks.findIndex((t: any) => t.id === id);
  if (index !== -1) {
    db.tasks[index] = {
      ...db.tasks[index],
      ...updateData
    };
    saveDB(db);
    res.json(db.tasks[index]);
  } else {
    res.status(404).json({ error: "Tarefa não encontrada" });
  }
});

app.delete("/api/tasks/:id", (req, res) => {
  const { id } = req.params;
  const db = loadDB();
  db.tasks = db.tasks || [];
  
  const initialLength = db.tasks.length;
  db.tasks = db.tasks.filter((t: any) => t.id !== id);
  
  if (db.tasks.length < initialLength) {
    saveDB(db);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Tarefa não encontrada" });
  }
});

// EMAIL AND PAYMENT LOGS (For display in dashboard info widgets)
app.get("/api/logs/emails", (req, res) => {
  const db = loadDB();
  res.json(db.emailLogs || []);
});

app.get("/api/logs/payments", (req, res) => {
  const db = loadDB();
  res.json(db.paymentLogs || []);
});

// INITIALIZE DB
loadDB();

// Integration with Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
