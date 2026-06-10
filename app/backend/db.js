// db.js — Armazenamento em JSON (sem dependências nativas; corre em qualquer Node 18+)
import bcrypt from "bcryptjs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || __dirname;
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const FILE = join(DATA_DIR, "quinta-data.json");

let dados = {
  utilizadores: [], servicos: [], reservas: [], pagamentos: [],
  galeria: [], banner: [], conteudo: {}, _seq: {},
};

function carregar() {
  try { if (fs.existsSync(FILE)) dados = JSON.parse(fs.readFileSync(FILE, "utf8")); }
  catch (e) { console.error("Aviso: não foi possível ler os dados.", e.message); }
}
function gravar() { fs.writeFileSync(FILE, JSON.stringify(dados, null, 2)); }
function proximoId(t) { dados._seq[t] = (dados._seq[t] || 0) + 1; return dados._seq[t]; }
const agora = () => new Date().toISOString().slice(0, 19).replace("T", " ");

carregar();

// Garantir arrays novos em bases de dados antigas
dados.banner = dados.banner || [];
dados.galeria = dados.galeria || [];

let mudou = false;

if (dados.utilizadores.length === 0) {
  dados.utilizadores.push({ id: proximoId("utilizadores"), nome: "Administrador", email: "admin@quintasaoluis.ao", senha_hash: bcrypt.hashSync("saoluis", 10), papel: "admin", criado_em: agora() });
  mudou = true;
}

if (dados.servicos.length === 0) {
  [
    ["Casamentos", "Cerimónia e copo-de-água à beira-lago, com a ponte de madeira como cenário.", "Weddings: ceremony and reception by the lake, with the wooden bridge as backdrop.", "sparkles", 1200000, 1],
    ["Festas de Aniversário", "Espaço completo com bar, pista de dança e piscina pública.", "Birthday parties: full space with bar, dance floor and public pool.", "flame", 450000, 2],
    ["Comemorações Privadas", "Sala de convívio e cozinha equipada para grupos familiares.", "Private celebrations: lounge and equipped kitchen for family groups.", "home", 380000, 3],
    ["Retiros", "Dormida na residência e cabanas, contacto com o campo e os animais.", "Retreats: stay in the residence and cabins, contact with nature and animals.", "trees", 600000, 4],
    ["Eventos Musicais", "Palco natural, energia da rede com gerador de reserva.", "Music events: natural stage, grid power with backup generator.", "music", 800000, 5],
    ["Gravação de Clips e Vídeos", "Cenários: cascata artificial, 3000 mangueiras, lagos e ponte.", "Video and clip shooting: waterfall, 3000 mango trees, lakes and bridge.", "camera", 350000, 6],
    ["Conferências", "Sala de convívio adaptável para reuniões e formações.", "Conferences: adaptable lounge for meetings and training.", "users", 500000, 7],
  ].forEach(([nome, descricao, descricao_en, icone, preco_base, ordem]) =>
    dados.servicos.push({ id: proximoId("servicos"), nome, descricao, descricao_en, icone, preco_base, ativo: 1, ordem }));
  mudou = true;
}

if (dados.galeria.length === 0) {
  [
    ["Pôr-do-sol sobre o lago", "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=80", "Paisagem", 1],
    ["Mangueiras ao amanhecer", "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80", "Paisagem", 2],
    ["Casamento à beira-água", "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80", "Casamentos", 3],
    ["Noite na pista de dança", "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&q=80", "Festas", 4],
    ["Piscina ao sol", "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80", "Espaços", 5],
    ["Caminho entre as árvores", "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80", "Paisagem", 6],
  ].forEach(([titulo, url, evento, ordem]) =>
    dados.galeria.push({ id: proximoId("galeria"), titulo, url, evento, publicar_redes: 1, ordem, criado_em: agora() }));
  mudou = true;
}

if (dados.banner.length === 0) {
  [
    ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80", "O campo a um passo da cidade", 1],
    ["https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=1600&q=80", "Dois lagos e uma ponte de madeira", 2],
    ["https://images.unsplash.com/photo-1505765050516-f72dcac9c60e?w=1600&q=80", "20 hectares de natureza", 3],
    ["https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=80", "O cenário do seu evento", 4],
  ].forEach(([url, legenda, ordem]) =>
    dados.banner.push({ id: proximoId("banner"), url, legenda, ordem }));
  mudou = true;
}

if (dados.reservas.length === 0) {
  [
    ["Maria Quissanga", "923 000 111", "maria@email.ao", "Casamentos", "2026-07-18", 180, 1200000, 600000, "Confirmada"],
    ["Eventos Zango Lda.", "924 555 222", "geral@zango.ao", "Eventos Musicais", "2026-06-28", 400, 800000, 0, "Pendente"],
    ["Família Domingos", "912 777 333", "domingos@email.ao", "Retiros", "2026-08-02", 25, 600000, 600000, "Confirmada"],
  ].forEach(([cliente_nome, cliente_contacto, cliente_email, servico_nome, data_evento, num_convidados, valor_total, valor_pago, estado]) =>
    dados.reservas.push({ id: proximoId("reservas"), cliente_nome, cliente_contacto, cliente_email, servico_id: null, servico_nome, data_evento, num_convidados, valor_total, valor_pago, estado, metodo_pagamento: "", referencia_pagamento: "", mensagem: "", criado_em: agora() }));
  mudou = true;
}

const conteudoInicial = {
  // PT
  heroTitulo: "Quinta São Luís",
  heroSub: "O campo a um passo da cidade. 20 hectares, 3000 mangueiras e dois lagos para o seu evento inesquecível.",
  sobreTexto: "Situada estrategicamente na zona do canal de irrigação de Kikuxi, lado do Zango 3, em Luanda, a Quinta São Luís oferece momentos genuínos de interação com o campo sem se afastar da cidade. São 20 hectares com cerca de 3000 mangueiras, dois lagos artificiais cruzados por uma ponte de madeira, e infraestrutura completa para acolher o seu evento.",
  // EN
  heroTitulo_en: "São Luís Farm",
  heroSub_en: "The countryside a step away from the city. 20 hectares, 3000 mango trees and two lakes for your unforgettable event.",
  sobreTexto_en: "Strategically located by the Kikuxi irrigation canal, Zango 3 side, in Luanda, São Luís Farm offers genuine moments of contact with nature without leaving the city. 20 hectares with about 3000 mango trees, two artificial lakes crossed by a wooden bridge, and complete infrastructure to host your event.",
  // comuns
  localizacao: "Canal de irrigação de Kikuxi, Zango 3 — Luanda, Angola",
  telefone: "+244 923 000 000",
  email: "reservas@quintasaoluis.ao",
  instagram: "@quintasaoluis",
  facebook: "Quinta São Luís",
  whatsapp: "244923000000",
  logoUrl: "",
  // coordenadas do mapa (Kikuxi / Zango 3, Luanda)
  mapaLat: "-8.9988",
  mapaLng: "13.3470",
  // pagamentos
  pagIban: "AO06 0000 0000 0000 0000 0000 0",
  pagBanco: "Banco (a definir)",
  pagExpress: "900 000 000",
  pagRupe: "Referência RUPE gerada por evento",
  pagInstrucoes: "Após a reserva, contactamos com a referência de pagamento. Aceita-se Multicaixa Express, RUPE e pagamento por referência em ATM.",
};
for (const [k, v] of Object.entries(conteudoInicial)) {
  if (!(k in dados.conteudo)) { dados.conteudo[k] = v; mudou = true; }
}

if (mudou) gravar();

const ordenar = (arr, ...campos) => [...arr].sort((a, b) => {
  for (const c of campos) { if ((a[c] ?? 0) < (b[c] ?? 0)) return -1; if ((a[c] ?? 0) > (b[c] ?? 0)) return 1; } return 0;
});

export default {
  gravar,
  acharUtilizador: (email) => dados.utilizadores.find((u) => u.email === email),
  // servicos
  servicosAtivos: () => ordenar(dados.servicos.filter((s) => s.ativo), "ordem", "id"),
  todosServicos: () => ordenar(dados.servicos, "ordem", "id"),
  acharServico: (id) => dados.servicos.find((s) => s.id === Number(id)),
  criarServico: (s) => { const n = { id: proximoId("servicos"), nome: s.nome || "Novo serviço", descricao: s.descricao || "", descricao_en: s.descricao_en || "", icone: s.icone || "sparkles", preco_base: Number(s.preco_base) || 0, ativo: 1, ordem: Number(s.ordem) || 99 }; dados.servicos.push(n); gravar(); return n; },
  atualizarServico: (id, s) => { const o = dados.servicos.find((x) => x.id === Number(id)); if (!o) return false; Object.assign(o, { nome: s.nome, descricao: s.descricao, descricao_en: s.descricao_en, icone: s.icone, preco_base: Number(s.preco_base) || 0, ativo: s.ativo ? 1 : 0 }); gravar(); return true; },
  apagarServico: (id) => { dados.servicos = dados.servicos.filter((s) => s.id !== Number(id)); gravar(); },
  // galeria
  galeria: () => ordenar(dados.galeria, "ordem", "id"),
  criarFoto: (g) => { const n = { id: proximoId("galeria"), titulo: g.titulo || "Sem título", url: g.url, evento: g.evento || "Geral", publicar_redes: g.publicar_redes ? 1 : 0, ordem: Number(g.ordem) || 99, criado_em: agora() }; dados.galeria.push(n); gravar(); return n; },
  apagarFoto: (id) => { dados.galeria = dados.galeria.filter((g) => g.id !== Number(id)); gravar(); },
  // banner
  banner: () => ordenar(dados.banner, "ordem", "id"),
  criarBanner: (b) => { const n = { id: proximoId("banner"), url: b.url, legenda: b.legenda || "", ordem: Number(b.ordem) || 99 }; dados.banner.push(n); gravar(); return n; },
  apagarBanner: (id) => { dados.banner = dados.banner.filter((b) => b.id !== Number(id)); gravar(); },
  // reservas
  reservas: () => ordenar(dados.reservas, "data_evento"),
  acharReserva: (id) => dados.reservas.find((r) => r.id === Number(id)),
  datasOcupadas: () => dados.reservas.filter((r) => ["Confirmada", "Pendente"].includes(r.estado)).map((r) => ({ data: r.data_evento, estado: r.estado })),
  criarReserva: (r) => { const n = { id: proximoId("reservas"), cliente_nome: r.cliente_nome, cliente_contacto: r.cliente_contacto || "", cliente_email: r.cliente_email || "", servico_id: r.servico_id || null, servico_nome: r.servico_nome || "", data_evento: r.data_evento, num_convidados: Number(r.num_convidados) || 0, valor_total: Number(r.valor_total) || 0, valor_pago: 0, estado: "Pendente", metodo_pagamento: r.metodo_pagamento || "", referencia_pagamento: "", mensagem: r.mensagem || "", criado_em: agora() }; dados.reservas.push(n); gravar(); return n; },
  atualizarReserva: (id, campos) => { const r = dados.reservas.find((x) => x.id === Number(id)); if (!r) return false; Object.assign(r, campos); gravar(); return true; },
  apagarReserva: (id) => { dados.reservas = dados.reservas.filter((r) => r.id !== Number(id)); gravar(); },
  registarPagamento: (reserva_id, valor, metodo) => { dados.pagamentos.push({ id: proximoId("pagamentos"), reserva_id: Number(reserva_id), valor, metodo: metodo || "manual", estado: "Pago", data: agora() }); gravar(); },
  // conteudo
  conteudo: () => ({ ...dados.conteudo }),
  atualizarConteudo: (obj) => { for (const [k, v] of Object.entries(obj)) dados.conteudo[k] = String(v); gravar(); },
};
