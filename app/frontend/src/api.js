// api.js — comunicação com o backend
const TOKEN_KEY = "qsl_token";
export const guardarToken = (t) => sessionStorage.setItem(TOKEN_KEY, t);
export const obterToken = () => sessionStorage.getItem(TOKEN_KEY);
export const limparToken = () => sessionStorage.removeItem(TOKEN_KEY);

async function pedido(method, path, body, autenticado) {
  const headers = { "Content-Type": "application/json" };
  if (autenticado) { const t = obterToken(); if (t) headers.Authorization = "Bearer " + t; }
  const resp = await fetch("/api" + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  let dados = null; try { dados = await resp.json(); } catch {}
  if (!resp.ok) { const e = new Error((dados && dados.erro) || "Ocorreu um erro. Tente novamente."); e.status = resp.status; throw e; }
  return dados;
}

export const api = {
  login: (email, senha) => pedido("POST", "/login", { email, senha }),
  conteudo: () => pedido("GET", "/conteudo"),
  servicos: () => pedido("GET", "/servicos"),
  galeria: () => pedido("GET", "/galeria"),
  banner: () => pedido("GET", "/banner"),
  disponibilidade: () => pedido("GET", "/disponibilidade"),
  configUpload: () => pedido("GET", "/config-upload"),
  criarReserva: (r) => pedido("POST", "/reservas", r),
  // admin
  estatisticas: () => pedido("GET", "/admin/estatisticas", null, true),
  reservasAdmin: () => pedido("GET", "/admin/reservas", null, true),
  mudarEstado: (id, estado) => pedido("PATCH", `/admin/reservas/${id}`, { estado }, true),
  guardarReferencia: (id, referencia_pagamento) => pedido("PATCH", `/admin/reservas/${id}`, { referencia_pagamento }, true),
  pagar: (id, valor) => pedido("POST", `/admin/reservas/${id}/pagamento`, { valor }, true),
  apagarReserva: (id) => pedido("DELETE", `/admin/reservas/${id}`, null, true),
  servicosAdmin: () => pedido("GET", "/admin/servicos", null, true),
  criarServico: (s) => pedido("POST", "/admin/servicos", s, true),
  editarServico: (id, s) => pedido("PUT", `/admin/servicos/${id}`, s, true),
  apagarServico: (id) => pedido("DELETE", `/admin/servicos/${id}`, null, true),
  adicionarFoto: (g) => pedido("POST", "/admin/galeria", g, true),
  apagarFoto: (id) => pedido("DELETE", `/admin/galeria/${id}`, null, true),
  adicionarBanner: (b) => pedido("POST", "/admin/banner", b, true),
  apagarBanner: (id) => pedido("DELETE", `/admin/banner/${id}`, null, true),
  guardarConteudo: (obj) => pedido("PUT", "/admin/conteudo", obj, true),
};

export const fmtKz = (n) => new Intl.NumberFormat("pt-AO").format(Math.round(n || 0)) + " Kz";

// Upload direto para o Cloudinary (unsigned). Devolve o URL seguro da imagem.
export async function uploadCloudinary(file, cloudName, uploadPreset) {
  if (!cloudName || !uploadPreset) throw new Error("Cloudinary não está configurado. Veja as instruções no README.");
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", uploadPreset);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: fd });
  const d = await r.json();
  if (!r.ok || !d.secure_url) throw new Error(d.error?.message || "Falha no upload da imagem.");
  return d.secure_url;
}
