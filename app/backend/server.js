// server.js — API + serviço do frontend num só processo
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";
import db from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "quinta-sao-luis-segredo-trocar-em-producao";

// Configuração do Cloudinary (upload de imagens). Definir nas variáveis de ambiente do Render.
const CLOUDINARY = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "",
};

app.use(cors());
app.use(express.json({ limit: "2mb" }));

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ erro: "Não autenticado." });
  try { req.utilizador = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ erro: "Sessão inválida ou expirada." }); }
}

app.post("/api/login", (req, res) => {
  const { email, senha } = req.body || {};
  const u = db.acharUtilizador((email || "").trim().toLowerCase());
  if (!u || !bcrypt.compareSync(senha || "", u.senha_hash)) return res.status(401).json({ erro: "Credenciais inválidas." });
  const token = jwt.sign({ id: u.id, nome: u.nome, papel: u.papel }, JWT_SECRET, { expiresIn: "12h" });
  res.json({ token, utilizador: { nome: u.nome, papel: u.papel } });
});

// ===== PÚBLICAS =====
app.get("/api/conteudo", (_req, res) => res.json(db.conteudo()));
app.get("/api/servicos", (_req, res) => res.json(db.servicosAtivos()));
app.get("/api/galeria", (_req, res) => res.json(db.galeria()));
app.get("/api/banner", (_req, res) => res.json(db.banner()));
app.get("/api/disponibilidade", (_req, res) => res.json(db.datasOcupadas()));
// Configuração pública do Cloudinary (só nome e preset, não são segredos)
app.get("/api/config-upload", (_req, res) => res.json(CLOUDINARY));

app.post("/api/reservas", (req, res) => {
  const b = req.body || {};
  if (!b.cliente_nome || !b.data_evento) return res.status(400).json({ erro: "Nome e data são obrigatórios." });
  let valor_total = Number(b.valor_total) || 0;
  let servico_nome = b.servico_nome || "";
  if (b.servico_id) { const s = db.acharServico(b.servico_id); if (s) { servico_nome = s.nome; if (!valor_total) valor_total = s.preco_base; } }
  const nova = db.criarReserva({ ...b, servico_nome, valor_total });
  res.status(201).json({ id: nova.id, ok: true });
});

// ===== ADMIN =====
app.get("/api/admin/reservas", auth, (_req, res) => res.json(db.reservas()));
app.patch("/api/admin/reservas/:id", auth, (req, res) => {
  const campos = {};
  if (req.body.estado !== undefined) campos.estado = req.body.estado;
  if (req.body.referencia_pagamento !== undefined) campos.referencia_pagamento = req.body.referencia_pagamento;
  const ok = db.atualizarReserva(req.params.id, campos);
  if (!ok) return res.status(404).json({ erro: "Reserva não encontrada." });
  res.json({ ok: true });
});
app.post("/api/admin/reservas/:id/pagamento", auth, (req, res) => {
  const r = db.acharReserva(req.params.id);
  if (!r) return res.status(404).json({ erro: "Reserva não encontrada." });
  const valor = Number(req.body.valor) || 0;
  const novoPago = Math.min(r.valor_total, (r.valor_pago || 0) + valor);
  db.atualizarReserva(r.id, { valor_pago: novoPago });
  db.registarPagamento(r.id, valor, req.body.metodo);
  res.json({ ok: true, valor_pago: novoPago });
});
app.delete("/api/admin/reservas/:id", auth, (req, res) => { db.apagarReserva(req.params.id); res.json({ ok: true }); });

app.get("/api/admin/servicos", auth, (_req, res) => res.json(db.todosServicos()));
app.post("/api/admin/servicos", auth, (req, res) => res.status(201).json(db.criarServico(req.body || {})));
app.put("/api/admin/servicos/:id", auth, (req, res) => { const ok = db.atualizarServico(req.params.id, req.body || {}); if (!ok) return res.status(404).json({ erro: "Serviço não encontrado." }); res.json({ ok: true }); });
app.delete("/api/admin/servicos/:id", auth, (req, res) => { db.apagarServico(req.params.id); res.json({ ok: true }); });

app.post("/api/admin/galeria", auth, (req, res) => { if (!req.body || !req.body.url) return res.status(400).json({ erro: "URL obrigatória." }); res.status(201).json(db.criarFoto(req.body)); });
app.delete("/api/admin/galeria/:id", auth, (req, res) => { db.apagarFoto(req.params.id); res.json({ ok: true }); });

app.post("/api/admin/banner", auth, (req, res) => { if (!req.body || !req.body.url) return res.status(400).json({ erro: "URL obrigatória." }); res.status(201).json(db.criarBanner(req.body)); });
app.delete("/api/admin/banner/:id", auth, (req, res) => { db.apagarBanner(req.params.id); res.json({ ok: true }); });

app.put("/api/admin/conteudo", auth, (req, res) => { db.atualizarConteudo(req.body || {}); res.json({ ok: true }); });

app.get("/api/admin/estatisticas", auth, (_req, res) => {
  const reservas = db.reservas();
  const receita = reservas.reduce((a, r) => a + (r.valor_pago || 0), 0);
  const previsto = reservas.reduce((a, r) => a + (r.valor_total || 0), 0);
  const confirmadas = reservas.filter((r) => r.estado === "Confirmada").length;
  res.json({ total: reservas.length, confirmadas, receita, previsto });
});

const distPath = join(__dirname, "public");
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(join(distPath, "index.html")));
}

app.listen(PORT, () => console.log(`Quinta São Luís a correr na porta ${PORT}`));
