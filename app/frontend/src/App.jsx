import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Menu, X, MapPin, Phone, Mail, Calendar, Users, Check, Clock,
  Trash2, Edit3, Plus, Image as ImageIcon, LayoutDashboard, LogOut,
  Lock, Instagram, Facebook, Music2, Camera, Trees, Waves, Home,
  Flame, Tractor, Sparkles, ChevronRight, ChevronLeft, Settings, Eye,
  DollarSign, AlertCircle, Globe, MessageCircle, Upload, CreditCard, Images,
} from "lucide-react";
import { api, guardarToken, obterToken, limparToken, fmtKz, uploadCloudinary } from "./api.js";
import { textos } from "./i18n.js";

const ICONS = { sparkles: Sparkles, flame: Flame, home: Home, trees: Trees, music: Music2, camera: Camera, users: Users, waves: Waves, tractor: Tractor };
const UNIDADES = [
  { icone: "home", pt: ["Residência (3 quartos)", "Apetrechada, dormitório para famílias."], en: ["Residence (3 rooms)", "Fully equipped, sleeps families."] },
  { icone: "home", pt: ["3 Cabanas com suíte", "Acomodação privada e confortável."], en: ["3 Cabins with suite", "Private, comfortable accommodation."] },
  { icone: "users", pt: ["Sala de convívio", "Espaço amplo para grupos."], en: ["Lounge", "Large space for groups."] },
  { icone: "flame", pt: ["Cozinha equipada", "Espaçosa e totalmente equipada."], en: ["Equipped kitchen", "Spacious and fully equipped."] },
  { icone: "music", pt: ["Bar e pista de dança", "Equipamento de som e iluminação."], en: ["Bar and dance floor", "Sound and lighting equipment."] },
  { icone: "waves", pt: ["Piscina pública", "Piscina grande para os visitantes."], en: ["Public pool", "Large pool for visitors."] },
  { icone: "waves", pt: ["Cascata artificial", "Cenário natural marcante."], en: ["Waterfall", "Striking natural setting."] },
  { icone: "tractor", pt: ["Criação de animais", "Pequeno corte e gado bovino."], en: ["Animal farming", "Small livestock and cattle."] },
];

export default function App() {
  const [vista, setVista] = useState("site");
  const [lang, setLang] = useState("pt");
  const haSessao = !!obterToken();
  return vista === "admin"
    ? <Admin voltarAoSite={() => setVista("site")} sessaoInicial={haSessao} />
    : <Site irParaAdmin={() => setVista("admin")} lang={lang} setLang={setLang} />;
}

/* ============================ SITE PÚBLICO ============================ */
function Site({ irParaAdmin, lang, setLang }) {
  const [conteudo, setConteudo] = useState(null);
  const [servicos, setServicos] = useState([]);
  const [galeria, setGaleria] = useState([]);
  const [banner, setBanner] = useState([]);
  const [ocupadas, setOcupadas] = useState([]);
  const [menuAberto, setMenuAberto] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const t = textos[lang];

  useEffect(() => {
    Promise.all([api.conteudo(), api.servicos(), api.galeria(), api.banner(), api.disponibilidade()])
      .then(([c, s, g, b, d]) => { setConteudo(c); setServicos(s); setGaleria(g); setBanner(b); setOcupadas(d); })
      .catch((e) => setErro(e.message))
      .finally(() => setCarregando(false));
  }, []);

  const navItems = [["sobre", t.nav.sobre], ["unidades", t.nav.unidades], ["servicos", t.nav.servicos], ["galeria", t.nav.galeria], ["reservar", t.nav.reservar], ["contacto", t.nav.contacto]];
  const ir = (id) => { setMenuAberto(false); document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); };

  if (carregando) return <Centro><div className="spin" /></Centro>;
  if (erro) return <Centro><div className="sans" style={{ textAlign: "center", color: "var(--terra)" }}><AlertCircle /><p>{erro}</p></div></Centro>;

  const tituloLang = lang === "en" ? (conteudo.heroTitulo_en || conteudo.heroTitulo) : conteudo.heroTitulo;
  const subLang = lang === "en" ? (conteudo.heroSub_en || conteudo.heroSub) : conteudo.heroSub;
  const sobreLang = lang === "en" ? (conteudo.sobreTexto_en || conteudo.sobreTexto) : conteudo.sobreTexto;

  return (
    <>
      <header style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--leaf-deep)", color: "var(--cream)" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "12px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {conteudo.logoUrl ? <img src={conteudo.logoUrl} alt="logo" style={{ height: 38, width: "auto", borderRadius: 4 }} /> : <Trees size={26} color="var(--terra-soft)" />}
            <span style={{ fontSize: 22, letterSpacing: 1 }}>São Luís</span>
          </div>
          <nav className="sans navDesk" style={{ gap: 22, fontSize: 14, alignItems: "center" }}>
            {navItems.map(([id, txt]) => <a key={id} onClick={() => ir(id)} style={{ cursor: "pointer", opacity: 0.9 }}>{txt}</a>)}
            <SeletorIdioma lang={lang} setLang={setLang} />
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="navMobileTools">
            <SeletorIdioma lang={lang} setLang={setLang} />
            <button onClick={() => setMenuAberto((v) => !v)} style={{ background: "none", border: "none", color: "var(--cream)" }}>{menuAberto ? <X /> : <Menu />}</button>
          </div>
        </div>
        {menuAberto && (
          <div className="sans" style={{ background: "var(--leaf)", padding: "8px 22px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
            {navItems.map(([id, txt]) => <a key={id} onClick={() => ir(id)} style={{ cursor: "pointer", padding: "8px 0", borderBottom: "1px solid rgba(239,231,211,.15)" }}>{txt}</a>)}
          </div>
        )}
        <style>{`@media(min-width:880px){.navDesk{display:flex!important;}.navMobileTools{display:none!important;}}.navDesk{display:none;}`}</style>
      </header>

      <BannerCarrossel banner={banner} t={t} titulo={tituloLang} sub={subLang} ir={ir} />

      <Section id="sobre" eyebrow={t.sobre.eyebrow} titulo={t.sobre.titulo}>
        <div className="grid2sobre" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 30, alignItems: "center" }}>
          <p style={{ fontSize: 18, lineHeight: 1.7 }}>{sobreLang}</p>
          <div style={{ borderRadius: 4, overflow: "hidden" }}><img src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=900&q=80" alt="" style={{ width: "100%", display: "block" }} /></div>
        </div>
        <p className="sans" style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 8, color: "var(--water)" }}><Sparkles size={16} /> {t.sobre.energia}</p>
        <style>{`@media(min-width:760px){.grid2sobre{grid-template-columns:1.1fr 1fr!important;}}`}</style>
      </Section>

      <Section id="unidades" eyebrow={t.unidades.eyebrow} titulo={t.unidades.titulo} dark>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))" }}>
          {UNIDADES.map((u, i) => { const I = ICONS[u.icone] || Home; const [nome, desc] = u[lang]; return (
            <div key={i} className="lift" style={{ background: "var(--leaf)", padding: 22, borderRadius: 4, border: "1px solid rgba(239,231,211,.12)" }}>
              <I size={26} color="var(--terra-soft)" /><h3 style={{ margin: "12px 0 6px", color: "var(--cream)", fontSize: 18 }}>{nome}</h3>
              <p className="sans" style={{ fontSize: 13, color: "var(--cream)", opacity: 0.75, margin: 0 }}>{desc}</p>
            </div>); })}
        </div>
      </Section>

      <Section id="servicos" eyebrow={t.servicos.eyebrow} titulo={t.servicos.titulo}>
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
          {servicos.map((s) => { const I = ICONS[s.icone] || Sparkles; const desc = lang === "en" ? (s.descricao_en || s.descricao) : s.descricao; return (
            <div key={s.id} className="lift" style={{ background: "#fff", borderRadius: 4, padding: 24, border: "1px solid var(--cream-deep)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}><I size={26} color="var(--terra)" /><span className="sans" style={{ fontSize: 12, color: "var(--water)", fontWeight: 700 }}>{t.servicos.desde}</span></div>
              <h3 style={{ margin: "14px 0 6px", fontSize: 20 }}>{s.nome}</h3>
              <p className="sans" style={{ fontSize: 14, lineHeight: 1.5, color: "#555", minHeight: 60 }}>{desc}</p>
              <div style={{ fontSize: 22, color: "var(--terra)", fontWeight: 700 }}>{fmtKz(s.preco_base)}</div>
            </div>); })}
        </div>
        <p className="sans" style={{ marginTop: 20, fontStyle: "italic", color: "#666" }}>{t.servicos.extra}</p>
      </Section>

      <Section id="galeria" eyebrow={t.galeria.eyebrow} titulo={t.galeria.titulo} dark>
        <GaleriaFiltravel galeria={galeria} t={t} aoAbrir={setLightbox} />
      </Section>

      <Section id="reservar" eyebrow={t.reservar.eyebrow} titulo={t.reservar.titulo}>
        <div className="grid2reservar" style={{ display: "grid", gridTemplateColumns: "1fr", gap: 30, alignItems: "start" }}>
          <FormReserva servicos={servicos} ocupadas={ocupadas} t={t} aoReservar={() => api.disponibilidade().then(setOcupadas)} />
          <div>
            <Calendario ocupadas={ocupadas} t={t} />
            <Pagamentos conteudo={conteudo} t={t} />
          </div>
        </div>
        <style>{`@media(min-width:900px){.grid2reservar{grid-template-columns:1.3fr 1fr!important;}}`}</style>
      </Section>

      <Section id="mapa" eyebrow={t.mapa.eyebrow} titulo={t.mapa.titulo}>
        <Mapa conteudo={conteudo} t={t} />
      </Section>

      <Rodape conteudo={conteudo} t={t} irParaAdmin={irParaAdmin} />
      <BotaoWhatsApp conteudo={conteudo} t={t} />

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ maxWidth: 900 }}><img src={lightbox.url} alt={lightbox.titulo} style={{ width: "100%", borderRadius: 4 }} /><p style={{ color: "#fff", textAlign: "center", marginTop: 10 }}>{lightbox.titulo}</p></div>
        </div>
      )}
    </>
  );
}

function SeletorIdioma({ lang, setLang }) {
  return (
    <button onClick={() => setLang(lang === "pt" ? "en" : "pt")} className="sans"
      style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(239,231,211,.12)", border: "1px solid rgba(239,231,211,.25)", color: "var(--cream)", padding: "5px 10px", borderRadius: 20, fontSize: 13 }}>
      <Globe size={14} /> {lang === "pt" ? "PT" : "EN"}
    </button>
  );
}

function BannerCarrossel({ banner, t, titulo, sub, ir }) {
  const [idx, setIdx] = useState(0);
  const slides = banner.length ? banner : [{ url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&q=80", legenda: "" }];
  useEffect(() => {
    if (slides.length <= 1) return;
    const tm = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5000);
    return () => clearInterval(tm);
  }, [slides.length]);
  const irPara = (n) => setIdx((n + slides.length) % slides.length);
  return (
    <section style={{ position: "relative", minHeight: 580, display: "flex", alignItems: "center", overflow: "hidden" }}>
      {slides.map((s, i) => (
        <img key={i} src={s.url} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: i === idx ? 1 : 0, transition: "opacity 1.2s ease" }} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(110deg, rgba(28,33,25,.92) 28%, rgba(28,33,25,.4) 100%)" }} />
      <div className="fadeUp" key={idx} style={{ position: "relative", maxWidth: 1180, margin: "0 auto", padding: "70px 22px", color: "var(--cream)", width: "100%" }}>
        <p className="sans" style={{ letterSpacing: 3, color: "var(--terra-soft)", fontSize: 13, textTransform: "uppercase", marginBottom: 14 }}>{t.hero.localizacao}</p>
        <h1 style={{ fontSize: "clamp(40px,7vw,76px)", lineHeight: 1.02, margin: 0, maxWidth: 760 }}>{titulo}</h1>
        <p style={{ fontSize: 19, maxWidth: 560, marginTop: 20, opacity: 0.95 }}>{slides[idx]?.legenda || sub}</p>
        <div style={{ display: "flex", gap: 14, marginTop: 30, flexWrap: "wrap" }}>
          <Btn onClick={() => ir("reservar")}>{t.hero.reservar} <ChevronRight size={16} /></Btn>
          <Btn ghost onClick={() => ir("galeria")}>{t.hero.galeria}</Btn>
        </div>
        <div style={{ display: "flex", gap: 30, marginTop: 44, flexWrap: "wrap" }} className="sans">
          {[["20 ha", t.stats.terreno], ["3000", t.stats.mangueiras], ["2 lagos", t.stats.lagos]].map(([n, l]) => (
            <div key={n}><div style={{ fontSize: 30, fontFamily: "Georgia,serif" }}>{n}</div><div style={{ fontSize: 12, opacity: 0.8, letterSpacing: 1 }}>{l}</div></div>
          ))}
        </div>
      </div>
      {slides.length > 1 && (
        <>
          <button onClick={() => irPara(idx - 1)} aria-label="anterior" style={setaBanner("left")}><ChevronLeft /></button>
          <button onClick={() => irPara(idx + 1)} aria-label="seguinte" style={setaBanner("right")}><ChevronRight /></button>
          <div style={{ position: "absolute", bottom: 22, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 8 }}>
            {slides.map((_, i) => <button key={i} onClick={() => irPara(i)} aria-label={"slide " + (i + 1)} style={{ width: i === idx ? 26 : 10, height: 10, borderRadius: 20, border: "none", background: i === idx ? "var(--terra)" : "rgba(239,231,211,.5)", transition: "all .3s", cursor: "pointer" }} />)}
          </div>
        </>
      )}
    </section>
  );
}
const setaBanner = (lado) => ({ position: "absolute", [lado]: 14, top: "50%", transform: "translateY(-50%)", background: "rgba(28,33,25,.4)", border: "1px solid rgba(239,231,211,.3)", color: "var(--cream)", borderRadius: "50%", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 });

function GaleriaFiltravel({ galeria, t, aoAbrir }) {
  const eventos = ["Todos", ...Array.from(new Set(galeria.map((g) => g.evento || "Geral")))];
  const [filtro, setFiltro] = useState("Todos");
  const filtrada = filtro === "Todos" ? galeria : galeria.filter((g) => (g.evento || "Geral") === filtro);
  return (
    <>
      <div className="sans" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
        {eventos.map((e) => (
          <button key={e} onClick={() => setFiltro(e)} style={{ padding: "6px 14px", borderRadius: 20, border: "1px solid rgba(239,231,211,.3)", background: filtro === e ? "var(--terra)" : "transparent", color: "var(--cream)", fontSize: 13 }}>{e === "Todos" ? t.galeria.todos : e}</button>
        ))}
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}>
        {filtrada.map((g) => (
          <button key={g.id} onClick={() => aoAbrir(g)} className="lift" style={{ border: "none", padding: 0, borderRadius: 4, overflow: "hidden", position: "relative", aspectRatio: "4/3" }}>
            <img src={g.url} alt={g.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <span className="sans" style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "20px 12px 8px", color: "#fff", fontSize: 13, textAlign: "left", background: "linear-gradient(transparent, rgba(0,0,0,.7))" }}>{g.titulo}</span>
          </button>
        ))}
      </div>
    </>
  );
}

function Calendario({ ocupadas, t }) {
  const hoje = new Date();
  const [mes, setMes] = useState(hoje.getMonth());
  const [ano, setAno] = useState(hoje.getFullYear());
  const mapaEstado = {}; ocupadas.forEach((o) => (mapaEstado[o.data] = o.estado));
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const celulas = [];
  for (let i = 0; i < primeiroDia; i++) celulas.push(null);
  for (let d = 1; d <= diasNoMes; d++) celulas.push(d);
  const navMes = (delta) => { let m = mes + delta, a = ano; if (m < 0) { m = 11; a--; } if (m > 11) { m = 0; a++; } setMes(m); setAno(a); };
  const cor = (estado) => estado === "Confirmada" ? "var(--terra)" : estado === "Pendente" ? "var(--terra-soft)" : "transparent";
  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: 20, border: "1px solid var(--cream-deep)", marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <b className="sans" style={{ fontSize: 15 }}>{t.cal.titulo}</b>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }} className="sans">
          <button onClick={() => navMes(-1)} style={navCal}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: 13, minWidth: 110, textAlign: "center" }}>{t.cal.meses[mes]} {ano}</span>
          <button onClick={() => navMes(1)} style={navCal}><ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="sans" style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, fontSize: 12 }}>
        {t.cal.dias.map((d, i) => <div key={i} style={{ textAlign: "center", color: "#999", fontWeight: 700, padding: "4px 0" }}>{d}</div>)}
        {celulas.map((d, i) => {
          if (!d) return <div key={i} />;
          const dataStr = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const estado = mapaEstado[dataStr];
          return <div key={i} style={{ textAlign: "center", padding: "7px 0", borderRadius: 6, background: cor(estado), color: estado ? "#fff" : "#333", fontWeight: estado ? 700 : 400 }}>{d}</div>;
        })}
      </div>
      <div className="sans" style={{ display: "flex", gap: 14, marginTop: 12, fontSize: 12, color: "#666" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><i style={{ width: 12, height: 12, borderRadius: 3, background: "var(--terra)", display: "inline-block" }} /> {t.cal.confirmada}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><i style={{ width: 12, height: 12, borderRadius: 3, background: "var(--terra-soft)", display: "inline-block" }} /> {t.cal.pendente}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><i style={{ width: 12, height: 12, borderRadius: 3, border: "1px solid #ccc", display: "inline-block" }} /> {t.cal.livre}</span>
      </div>
    </div>
  );
}
const navCal = { background: "var(--cream)", border: "none", borderRadius: 6, padding: 5, display: "flex", cursor: "pointer" };

function Pagamentos({ conteudo, t }) {
  const linhas = [
    [CreditCard, t.pag.express, conteudo.pagExpress],
    [DollarSign, t.pag.rupe, conteudo.pagRupe],
    [Calendar, t.pag.atm, conteudo.pagIban + (conteudo.pagBanco ? " · " + conteudo.pagBanco : "")],
  ];
  return (
    <div style={{ background: "#fff", borderRadius: 8, padding: 20, border: "1px solid var(--cream-deep)" }}>
      <b className="sans" style={{ fontSize: 15, display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><CreditCard size={17} color="var(--terra)" /> {t.pag.titulo}</b>
      {linhas.map(([I, titulo, valor], i) => (
        <div key={i} className="sans" style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: i < 2 ? "1px solid var(--cream-deep)" : "none" }}>
          <I size={18} color="var(--water)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div><div style={{ fontSize: 14, fontWeight: 600 }}>{titulo}</div><div style={{ fontSize: 13, color: "#666" }}>{valor}</div></div>
        </div>
      ))}
      <p className="sans" style={{ fontSize: 12.5, color: "#777", marginTop: 12, marginBottom: 0, lineHeight: 1.5 }}>{conteudo.pagInstrucoes}</p>
    </div>
  );
}

function Mapa({ conteudo, t }) {
  const lat = conteudo.mapaLat || "-8.9988";
  const lng = conteudo.mapaLng || "13.3470";
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${Number(lng) - 0.02}%2C${Number(lat) - 0.02}%2C${Number(lng) + 0.02}%2C${Number(lat) + 0.02}&layer=mapnik&marker=${lat}%2C${lng}`;
  const gmaps = `https://www.google.com/maps?q=${lat},${lng}`;
  return (
    <div>
      <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid var(--cream-deep)", height: 380 }}>
        <iframe title="mapa" src={src} style={{ width: "100%", height: "100%", border: 0 }} loading="lazy" />
      </div>
      <div className="sans" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, flexWrap: "wrap", gap: 10 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8, color: "#555" }}><MapPin size={16} color="var(--terra)" /> {conteudo.localizacao}</span>
        <a href={gmaps} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--water)", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>{t.mapa.abrir} <ChevronRight size={15} /></a>
      </div>
    </div>
  );
}

function BotaoWhatsApp({ conteudo, t }) {
  const num = (conteudo.whatsapp || "").replace(/\D/g, "");
  if (!num) return null;
  const msg = encodeURIComponent("Olá! Tenho interesse em reservar a Quinta São Luís.");
  return (
    <a href={`https://wa.me/${num}?text=${msg}`} target="_blank" rel="noreferrer" title={t.wpp}
      style={{ position: "fixed", bottom: 22, right: 22, zIndex: 90, background: "#25D366", color: "#fff", width: 58, height: 58, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(0,0,0,.25)", textDecoration: "none" }}>
      <MessageCircle size={28} fill="#fff" />
    </a>
  );
}

function FormReserva({ servicos, ocupadas, t, aoReservar }) {
  const [f, setF] = useState({ cliente_nome: "", cliente_contacto: "", cliente_email: "", servico_id: servicos[0]?.id || "", data_evento: "", num_convidados: "", mensagem: "", metodo_pagamento: "Multicaixa Express" });
  const [estado, setEstado] = useState({ tipo: "", msg: "" });
  const [enviando, setEnviando] = useState(false);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const servicoSel = servicos.find((s) => String(s.id) === String(f.servico_id));
  const total = servicoSel?.preco_base || 0;
  const datasOcupadas = ocupadas.map((o) => o.data);
  const dataOcupada = f.data_evento && datasOcupadas.includes(f.data_evento);

  const submeter = async () => {
    if (!f.cliente_nome || !f.data_evento || !f.cliente_contacto) { setEstado({ tipo: "erro", msg: t.form.erroCampos }); return; }
    if (dataOcupada) { setEstado({ tipo: "erro", msg: t.form.erroOcupada }); return; }
    setEnviando(true); setEstado({ tipo: "", msg: "" });
    try {
      await api.criarReserva({ ...f, servico_id: f.servico_id || null, num_convidados: Number(f.num_convidados) || 0 });
      setEstado({ tipo: "ok", msg: t.form.sucesso });
      setF({ cliente_nome: "", cliente_contacto: "", cliente_email: "", servico_id: servicos[0]?.id || "", data_evento: "", num_convidados: "", mensagem: "", metodo_pagamento: "Multicaixa Express" });
      aoReservar && aoReservar();
    } catch (e) { setEstado({ tipo: "erro", msg: e.message }); }
    finally { setEnviando(false); }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 6, padding: 28, border: "1px solid var(--cream-deep)" }}>
      {estado.msg && (
        <div className="sans" style={{ background: estado.tipo === "ok" ? "var(--water)" : "var(--terra)", color: "#fff", padding: "12px 16px", borderRadius: 4, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
          {estado.tipo === "ok" ? <Check size={18} /> : <AlertCircle size={18} />} {estado.msg}
        </div>
      )}
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
        <Campo label={t.form.nome} full><input value={f.cliente_nome} onChange={set("cliente_nome")} style={inp} /></Campo>
        <Campo label={t.form.contacto}><input value={f.cliente_contacto} onChange={set("cliente_contacto")} placeholder="9XX XXX XXX" style={inp} /></Campo>
        <Campo label={`${t.form.email} (${t.form.emailOpc})`}><input value={f.cliente_email} onChange={set("cliente_email")} style={inp} /></Campo>
        <Campo label={t.form.tipo}><select value={f.servico_id} onChange={set("servico_id")} style={inp}>{servicos.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}</select></Campo>
        <Campo label={t.form.data}><input type="date" value={f.data_evento} onChange={set("data_evento")} style={{ ...inp, borderColor: dataOcupada ? "var(--terra)" : "var(--cream-deep)" }} />{dataOcupada && <span className="sans" style={{ fontSize: 12, color: "var(--terra)" }}>{t.form.ocupada}</span>}</Campo>
        <Campo label={t.form.convidados}><input type="number" value={f.num_convidados} onChange={set("num_convidados")} style={inp} /></Campo>
        <Campo label={t.form.metodo}><select value={f.metodo_pagamento} onChange={set("metodo_pagamento")} style={inp}><option>Multicaixa Express</option><option>RUPE</option><option>Referência ATM / Transferência</option></select></Campo>
        <Campo label={t.form.mensagem} full><textarea value={f.mensagem} onChange={set("mensagem")} rows={2} style={{ ...inp, resize: "vertical" }} /></Campo>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, flexWrap: "wrap", gap: 12 }}>
        <div className="sans"><span style={{ fontSize: 13, color: "#777" }}>{t.form.valorBase}</span><div style={{ fontSize: 24, color: "var(--terra)", fontWeight: 700 }}>{fmtKz(total)}</div></div>
        <Btn onClick={submeter} disabled={enviando}>{enviando ? t.form.enviando : t.form.enviar}</Btn>
      </div>
    </div>
  );
}

function Rodape({ conteudo, t, irParaAdmin }) {
  return (
    <footer id="contacto" style={{ background: "var(--leaf-deep)", color: "var(--cream)", padding: "60px 22px 30px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gap: 30, gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {conteudo.logoUrl && <img src={conteudo.logoUrl} alt="logo" style={{ height: 50, width: "auto", alignSelf: "flex-start", borderRadius: 4 }} />}
          <h3 style={{ fontSize: 24, margin: "0 0 6px" }}>{conteudo.facebook || "Quinta São Luís"}</h3>
          <p className="sans" style={{ opacity: 0.8, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{t.footer.tagline}</p>
        </div>
        <div className="sans" style={{ fontSize: 14, lineHeight: 2 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><MapPin size={16} color="var(--terra-soft)" />{conteudo.localizacao}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Phone size={16} color="var(--terra-soft)" />{conteudo.telefone}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}><Mail size={16} color="var(--terra-soft)" />{conteudo.email}</div>
        </div>
        <div className="sans">
          <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 10 }}>{t.footer.siga}</p>
          <div style={{ display: "flex", gap: 14 }}><Instagram /><Facebook /><MessageCircle /></div>
          <p style={{ fontSize: 13, opacity: 0.7, marginTop: 10 }}>{conteudo.instagram} · {conteudo.facebook}</p>
        </div>
      </div>
      <div style={{ maxWidth: 1180, margin: "40px auto 0", paddingTop: 18, borderTop: "1px solid rgba(239,231,211,.15)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }} className="sans">
        <span style={{ fontSize: 12, opacity: 0.6 }}>© 2026 Quinta São Luís.</span>
        <button onClick={irParaAdmin} style={{ background: "none", border: "1px solid var(--terra-soft)", color: "var(--terra-soft)", padding: "8px 16px", borderRadius: 4, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}><Lock size={14} /> {t.footer.admin}</button>
      </div>
    </footer>
  );
}

/* ============================ ADMINISTRAÇÃO ========================== */
function Admin({ voltarAoSite, sessaoInicial }) {
  const [autenticado, setAutenticado] = useState(sessaoInicial);
  if (!autenticado) return <Login aoEntrar={() => setAutenticado(true)} voltar={voltarAoSite} />;
  return <Painel voltarAoSite={voltarAoSite} aoSair={() => { limparToken(); setAutenticado(false); }} />;
}

function Login({ aoEntrar, voltar }) {
  const [email, setEmail] = useState("admin@quintasaoluis.ao");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [a, setA] = useState(false);
  const entrar = async () => {
    setA(true); setErro("");
    try { const r = await api.login(email, senha); guardarToken(r.token); aoEntrar(); }
    catch (e) { setErro(e.message); } finally { setA(false); }
  };
  return (
    <Centro fundo="var(--leaf-deep)">
      <div style={{ background: "#fff", borderRadius: 8, padding: 36, width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}><Lock color="var(--terra)" /><h2 style={{ margin: 0 }}>Administração</h2></div>
        <p className="sans" style={{ fontSize: 13, color: "#777", marginTop: 0 }}>Quinta São Luís — gestão do sistema</p>
        <Campo label="E-mail" full><input value={email} onChange={(e) => setEmail(e.target.value)} style={inp} /></Campo>
        <div style={{ height: 12 }} />
        <Campo label="Palavra-passe" full><input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} onKeyDown={(e) => e.key === "Enter" && entrar()} style={inp} /></Campo>
        {erro && <p className="sans" style={{ color: "var(--terra)", fontSize: 13 }}>{erro}</p>}
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <Btn onClick={entrar} disabled={a}>{a ? "A entrar..." : "Entrar"}</Btn>
          <button onClick={voltar} className="sans" style={{ background: "none", border: "none", color: "var(--water)", fontSize: 13 }}>← Voltar ao site</button>
        </div>
        <p className="sans" style={{ fontSize: 11, color: "#aaa", marginTop: 18, textAlign: "center" }}>Demo: admin@quintasaoluis.ao / saoluis</p>
      </div>
    </Centro>
  );
}

function Painel({ voltarAoSite, aoSair }) {
  const [aba, setAba] = useState("dashboard");
  const abas = [["dashboard", "Painel", LayoutDashboard], ["reservas", "Reservas", Calendar], ["servicos", "Serviços", DollarSign], ["galeria", "Galeria", ImageIcon], ["banner", "Banner", Images], ["conteudo", "Conteúdo & Logo", Edit3], ["pagamentos", "Pagamentos", CreditCard]];
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F6F2E8" }}>
      <aside style={{ width: 232, background: "var(--leaf-deep)", color: "var(--cream)", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px 18px" }}><Settings color="var(--terra-soft)" size={20} /><b style={{ fontSize: 16 }}>Gestão</b></div>
        {abas.map(([id, txt, I]) => (
          <button key={id} onClick={() => setAba(id)} className="sans" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 6, border: "none", background: aba === id ? "var(--terra)" : "transparent", color: "var(--cream)", textAlign: "left", fontSize: 14 }}><I size={17} /> {txt}</button>
        ))}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
          <button onClick={voltarAoSite} className="sans" style={navBtn}><Eye size={16} /> Ver site</button>
          <button onClick={aoSair} className="sans" style={{ ...navBtn, color: "var(--terra-soft)" }}><LogOut size={16} /> Sair</button>
        </div>
      </aside>
      <main style={{ flex: 1, padding: "28px 30px", overflowX: "hidden" }}>
        {aba === "dashboard" && <Dashboard />}
        {aba === "reservas" && <AdminReservas />}
        {aba === "servicos" && <AdminServicos />}
        {aba === "galeria" && <AdminGaleria />}
        {aba === "banner" && <AdminBanner />}
        {aba === "conteudo" && <AdminConteudo />}
        {aba === "pagamentos" && <AdminPagamentos />}
      </main>
    </div>
  );
}

function useCarregar(fn, deps = []) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const recarregar = useCallback(() => { fn().then(setDados).catch((e) => setErro(e.message)); }, deps);
  useEffect(() => { recarregar(); }, [recarregar]);
  return [dados, recarregar, erro];
}

function UploadImagem({ aoConcluir, label = "Carregar imagem" }) {
  const [cfg, setCfg] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const ref = useRef();
  useEffect(() => { api.configUpload().then(setCfg).catch(() => setCfg({})); }, []);
  const escolher = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setCarregando(true); setErro("");
    try { const url = await uploadCloudinary(file, cfg.cloudName, cfg.uploadPreset); aoConcluir(url); }
    catch (err) { setErro(err.message); }
    finally { setCarregando(false); if (ref.current) ref.current.value = ""; }
  };
  const configurado = cfg && cfg.cloudName && cfg.uploadPreset;
  return (
    <div>
      <input ref={ref} type="file" accept="image/*" onChange={escolher} style={{ display: "none" }} />
      <button onClick={() => ref.current?.click()} disabled={!configurado || carregando} className="sans"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 6, border: "1px dashed var(--water)", background: "rgba(74,124,126,.08)", color: "var(--water)", fontSize: 13, opacity: configurado ? 1 : 0.5 }}>
        <Upload size={15} /> {carregando ? "A carregar..." : label}
      </button>
      {!configurado && <p className="sans" style={{ fontSize: 11, color: "#999", margin: "6px 0 0" }}>Upload por ficheiro requer configurar o Cloudinary (ver README). Pode usar URL.</p>}
      {erro && <p className="sans" style={{ fontSize: 12, color: "var(--terra)", margin: "6px 0 0" }}>{erro}</p>}
    </div>
  );
}

function Dashboard() {
  const [est] = useCarregar(api.estatisticas);
  const [reservas] = useCarregar(api.reservasAdmin);
  if (!est || !reservas) return <div className="spin" />;
  const cards = [["Reservas totais", est.total, Calendar, "var(--leaf)"], ["Confirmadas", est.confirmadas, Check, "var(--water)"], ["Receita recebida", fmtKz(est.receita), DollarSign, "var(--terra)"], ["Previsto", fmtKz(est.previsto), Clock, "#7a6a52"]];
  return (
    <div className="fadeUp">
      <H titulo="Painel geral" sub="Visão rápida da operação da quinta" />
      <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", marginBottom: 28 }}>
        {cards.map(([txt, v, I, col]) => (
          <div key={txt} style={{ background: "#fff", borderRadius: 8, padding: 20, borderLeft: `4px solid ${col}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span className="sans" style={{ fontSize: 13, color: "#888" }}>{txt}</span><I size={18} color={col} /></div>
            <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8 }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 8, padding: 22 }}>
        <h3 style={{ marginTop: 0 }}>Próximas reservas</h3>
        {reservas.slice(0, 5).map((r) => (
          <div key={r.id} className="sans" style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--cream-deep)", fontSize: 14 }}>
            <span><b>{r.cliente_nome}</b> · {r.servico_nome}</span><span style={{ color: "#777" }}>{r.data_evento} · <Estado e={r.estado} /></span>
          </div>
        ))}
        {reservas.length === 0 && <p className="sans" style={{ color: "#999" }}>Ainda não há reservas.</p>}
      </div>
    </div>
  );
}

function AdminReservas() {
  const [reservas, recarregar] = useCarregar(api.reservasAdmin);
  if (!reservas) return <div className="spin" />;
  const confirmar = async (id) => { await api.mudarEstado(id, "Confirmada"); recarregar(); };
  const pagarMetade = async (r) => { await api.pagar(r.id, Math.round(r.valor_total / 2)); recarregar(); };
  const apagar = async (id) => { await api.apagarReserva(id); recarregar(); };
  return (
    <div className="fadeUp">
      <H titulo="Reservas" sub="Gerir pedidos, pagamentos e estados" />
      <div style={{ background: "#fff", borderRadius: 8, overflow: "auto" }}>
        <table className="sans" style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 820 }}>
          <thead><tr style={{ background: "var(--leaf)", color: "var(--cream)", textAlign: "left" }}>{["Cliente", "Evento", "Data", "Conv.", "Pagamento", "Pago / Total", "Estado", "Ações"].map((h) => <th key={h} style={{ padding: "12px 14px" }}>{h}</th>)}</tr></thead>
          <tbody>
            {reservas.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--cream-deep)" }}>
                <td style={td}><b>{r.cliente_nome}</b><div style={{ color: "#999", fontSize: 12 }}>{r.cliente_contacto}</div></td>
                <td style={td}>{r.servico_nome}</td><td style={td}>{r.data_evento}</td><td style={td}>{r.num_convidados}</td>
                <td style={td}>{r.metodo_pagamento || "—"}</td>
                <td style={td}>{fmtKz(r.valor_pago)}<div style={{ color: "#999", fontSize: 12 }}>de {fmtKz(r.valor_total)}</div></td>
                <td style={td}><Estado e={r.estado} /></td>
                <td style={td}><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {r.estado !== "Confirmada" && <MiniBtn onClick={() => confirmar(r.id)} cor="var(--water)">Confirmar</MiniBtn>}
                  {r.valor_pago < r.valor_total && <MiniBtn onClick={() => pagarMetade(r)} cor="var(--terra)">+50% pago</MiniBtn>}
                  <MiniBtn onClick={() => apagar(r.id)} cor="#a33"><Trash2 size={13} /></MiniBtn>
                </div></td>
              </tr>
            ))}
            {reservas.length === 0 && <tr><td style={td} colSpan={8}>Sem reservas.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminServicos() {
  const [servicos, recarregar] = useCarregar(api.servicosAdmin);
  const [rascunhos, setRascunhos] = useState({});
  useEffect(() => { if (servicos) { const r = {}; servicos.forEach((s) => (r[s.id] = { ...s })); setRascunhos(r); } }, [servicos]);
  if (!servicos) return <div className="spin" />;
  const editarLocal = (id, campo, val) => setRascunhos((p) => ({ ...p, [id]: { ...p[id], [campo]: val } }));
  const guardar = async (id) => { await api.editarServico(id, rascunhos[id]); recarregar(); };
  const apagar = async (id) => { await api.apagarServico(id); recarregar(); };
  const add = async () => { await api.criarServico({ nome: "Novo serviço", descricao: "Descrição...", descricao_en: "Description...", icone: "sparkles", preco_base: 0 }); recarregar(); };
  return (
    <div className="fadeUp">
      <H titulo="Serviços e preços" sub="As alterações refletem-se no site após guardar" acao={<Btn onClick={add}><Plus size={16} /> Adicionar serviço</Btn>} />
      <div style={{ display: "grid", gap: 14 }}>
        {servicos.map((s) => { const r = rascunhos[s.id] || s; return (
          <div key={s.id} style={{ background: "#fff", borderRadius: 8, padding: 18, display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr auto" }}>
            <Campo label="Nome"><input value={r.nome || ""} onChange={(e) => editarLocal(s.id, "nome", e.target.value)} style={inp} /></Campo>
            <Campo label="Preço base (Kz)"><input type="number" value={r.preco_base || 0} onChange={(e) => editarLocal(s.id, "preco_base", Number(e.target.value))} style={inp} /></Campo>
            <Campo label="Ícone"><select value={r.icone || "sparkles"} onChange={(e) => editarLocal(s.id, "icone", e.target.value)} style={inp}>{Object.keys(ICONS).map((k) => <option key={k}>{k}</option>)}</select></Campo>
            <Campo label="Descrição (PT)" full><input value={r.descricao || ""} onChange={(e) => editarLocal(s.id, "descricao", e.target.value)} style={inp} /></Campo>
            <Campo label="Descrição (EN)" full><input value={r.descricao_en || ""} onChange={(e) => editarLocal(s.id, "descricao_en", e.target.value)} style={inp} /></Campo>
            <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <MiniBtn onClick={() => guardar(s.id)} cor="var(--water)"><Check size={14} /> Guardar</MiniBtn>
              <button onClick={() => apagar(s.id)} style={{ background: "#fbe9e9", border: "none", borderRadius: 6, padding: "6px 12px", color: "#a33" }}><Trash2 size={16} /></button>
            </div>
          </div>); })}
      </div>
    </div>
  );
}

function AdminGaleria() {
  const [galeria, recarregar] = useCarregar(api.galeria);
  const [url, setUrl] = useState(""); const [titulo, setTitulo] = useState(""); const [evento, setEvento] = useState("Geral");
  if (!galeria) return <div className="spin" />;
  const add = async (urlFinal) => { const u = urlFinal || url; if (!u) return; await api.adicionarFoto({ titulo: titulo || "Sem título", url: u, evento: evento || "Geral", publicar_redes: 1 }); setUrl(""); setTitulo(""); recarregar(); };
  const apagar = async (id) => { await api.apagarFoto(id); recarregar(); };
  return (
    <div className="fadeUp">
      <H titulo="Galeria de memórias" sub="Carregue fotos por ficheiro ou URL — organize por evento" />
      <div style={{ background: "#fff", borderRadius: 8, padding: 18, marginBottom: 20 }}>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "2fr 1fr 1fr", alignItems: "flex-end" }}>
          <Campo label="URL da imagem (ou use o botão de carregar)"><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." style={inp} /></Campo>
          <Campo label="Título"><input value={titulo} onChange={(e) => setTitulo(e.target.value)} style={inp} /></Campo>
          <Campo label="Evento / categoria"><input value={evento} onChange={(e) => setEvento(e.target.value)} placeholder="Ex.: Casamentos" style={inp} /></Campo>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
          <UploadImagem label="Carregar ficheiro" aoConcluir={(u) => add(u)} />
          <Btn onClick={() => add()}><Plus size={16} /> Adicionar por URL</Btn>
        </div>
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))" }}>
        {galeria.map((g) => (
          <div key={g.id} style={{ background: "#fff", borderRadius: 8, overflow: "hidden" }}>
            <img src={g.url} alt={g.titulo} style={{ width: "100%", height: 130, objectFit: "cover" }} />
            <div className="sans" style={{ padding: "8px 10px", fontSize: 13 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.titulo}</span>
                <button onClick={() => apagar(g.id)} style={{ background: "none", border: "none", color: "#a33" }}><Trash2 size={15} /></button>
              </div>
              <span style={{ fontSize: 11, color: "var(--water)", background: "rgba(74,124,126,.1)", padding: "2px 8px", borderRadius: 10, display: "inline-block", marginTop: 4 }}>{g.evento || "Geral"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminBanner() {
  const [banner, recarregar] = useCarregar(api.banner);
  const [url, setUrl] = useState(""); const [legenda, setLegenda] = useState("");
  if (!banner) return <div className="spin" />;
  const add = async (urlFinal) => { const u = urlFinal || url; if (!u) return; await api.adicionarBanner({ url: u, legenda, ordem: banner.length + 1 }); setUrl(""); setLegenda(""); recarregar(); };
  const apagar = async (id) => { await api.apagarBanner(id); recarregar(); };
  return (
    <div className="fadeUp">
      <H titulo="Banner principal" sub="Imagens que passam no topo do site. A primeira aparece primeiro." />
      <div style={{ background: "#fff", borderRadius: 8, padding: 18, marginBottom: 20 }}>
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "2fr 2fr", alignItems: "flex-end" }}>
          <Campo label="URL da imagem (ou carregue um ficheiro)"><input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." style={inp} /></Campo>
          <Campo label="Legenda (opcional)"><input value={legenda} onChange={(e) => setLegenda(e.target.value)} style={inp} /></Campo>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
          <UploadImagem label="Carregar ficheiro" aoConcluir={(u) => add(u)} />
          <Btn onClick={() => add()}><Plus size={16} /> Adicionar por URL</Btn>
        </div>
      </div>
      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))" }}>
        {banner.map((b, i) => (
          <div key={b.id} style={{ background: "#fff", borderRadius: 8, overflow: "hidden", position: "relative" }}>
            <img src={b.url} alt={b.legenda} style={{ width: "100%", height: 150, objectFit: "cover" }} />
            <span className="sans" style={{ position: "absolute", top: 8, left: 8, background: "var(--terra)", color: "#fff", fontSize: 11, padding: "2px 8px", borderRadius: 10 }}>#{i + 1}</span>
            <div className="sans" style={{ padding: "8px 10px", fontSize: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.legenda || "(sem legenda)"}</span>
              <button onClick={() => apagar(b.id)} style={{ background: "none", border: "none", color: "#a33" }}><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminConteudo() {
  const [conteudo, recarregar] = useCarregar(api.conteudo);
  const [r, setR] = useState(null);
  const [guardado, setGuardado] = useState(false);
  useEffect(() => { if (conteudo) setR({ ...conteudo }); }, [conteudo]);
  if (!r) return <div className="spin" />;
  const set = (k) => (e) => setR((p) => ({ ...p, [k]: e.target.value }));
  const guardar = async () => { await api.guardarConteudo(r); setGuardado(true); setTimeout(() => setGuardado(false), 3000); recarregar(); };
  const grupos = [
    ["Logótipo", [["logoUrl", "URL do logótipo", "logo"]]],
    ["Português", [["heroTitulo", "Título principal", "input"], ["heroSub", "Subtítulo do hero", "textarea"], ["sobreTexto", "Texto 'A Quinta'", "textarea"]]],
    ["English", [["heroTitulo_en", "Main title (EN)", "input"], ["heroSub_en", "Hero subtitle (EN)", "textarea"], ["sobreTexto_en", "'The Farm' text (EN)", "textarea"]]],
    ["Contactos e redes", [["localizacao", "Localização", "input"], ["telefone", "Telefone", "input"], ["email", "E-mail", "input"], ["whatsapp", "WhatsApp (só números, ex.: 244923000000)", "input"], ["instagram", "Instagram", "input"], ["facebook", "Facebook", "input"]]],
    ["Mapa (coordenadas)", [["mapaLat", "Latitude", "input"], ["mapaLng", "Longitude", "input"]]],
  ];
  return (
    <div className="fadeUp">
      <H titulo="Conteúdo & Logótipo" sub="Textos PT/EN, logótipo, contactos e mapa" acao={<Btn onClick={guardar}><Check size={16} /> Guardar alterações</Btn>} />
      {guardado && <div className="sans" style={{ background: "var(--water)", color: "#fff", padding: "10px 16px", borderRadius: 6, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}><Check size={16} /> Guardado. As alterações já estão visíveis no site.</div>}
      <div style={{ display: "grid", gap: 18, maxWidth: 760 }}>
        {grupos.map(([titulo, campos]) => (
          <div key={titulo} style={{ background: "#fff", borderRadius: 8, padding: 22 }}>
            <h3 style={{ marginTop: 0, fontSize: 16, color: "var(--terra)" }}>{titulo}</h3>
            <div style={{ display: "grid", gap: 14 }}>
              {campos.map(([k, label, tipo]) => (
                <Campo key={k} label={label} full>
                  {tipo === "textarea" ? <textarea value={r[k] || ""} onChange={set(k)} rows={3} style={{ ...inp, resize: "vertical" }} />
                    : tipo === "logo" ? (
                      <div>
                        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                          {r.logoUrl ? <img src={r.logoUrl} alt="logo" style={{ height: 44, borderRadius: 4, border: "1px solid var(--cream-deep)" }} /> : <span className="sans" style={{ fontSize: 13, color: "#999" }}>Sem logótipo (usa o ícone padrão)</span>}
                          <UploadImagem label="Carregar logótipo" aoConcluir={(u) => setR((p) => ({ ...p, logoUrl: u }))} />
                        </div>
                        <input value={r[k] || ""} onChange={set(k)} placeholder="ou cole o URL do logótipo" style={inp} />
                      </div>
                    ) : <input value={r[k] || ""} onChange={set(k)} style={inp} />}
                </Campo>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminPagamentos() {
  const [conteudo, recarregar] = useCarregar(api.conteudo);
  const [r, setR] = useState(null);
  const [guardado, setGuardado] = useState(false);
  useEffect(() => { if (conteudo) setR({ ...conteudo }); }, [conteudo]);
  if (!r) return <div className="spin" />;
  const set = (k) => (e) => setR((p) => ({ ...p, [k]: e.target.value }));
  const guardar = async () => { await api.guardarConteudo(r); setGuardado(true); setTimeout(() => setGuardado(false), 3000); recarregar(); };
  const campos = [["pagExpress", "Número Multicaixa Express", "input"], ["pagRupe", "Informação RUPE", "input"], ["pagIban", "IBAN para transferência", "input"], ["pagBanco", "Banco", "input"], ["pagInstrucoes", "Instruções mostradas ao cliente", "textarea"]];
  return (
    <div className="fadeUp">
      <H titulo="Formas de pagamento" sub="Express, RUPE e transferência — mostrados na página de reserva" acao={<Btn onClick={guardar}><Check size={16} /> Guardar</Btn>} />
      {guardado && <div className="sans" style={{ background: "var(--water)", color: "#fff", padding: "10px 16px", borderRadius: 6, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}><Check size={16} /> Guardado.</div>}
      <div style={{ background: "#fff", borderRadius: 8, padding: 24, maxWidth: 680, display: "grid", gap: 14 }}>
        {campos.map(([k, label, tipo]) => (
          <Campo key={k} label={label} full>
            {tipo === "textarea" ? <textarea value={r[k] || ""} onChange={set(k)} rows={3} style={{ ...inp, resize: "vertical" }} /> : <input value={r[k] || ""} onChange={set(k)} style={inp} />}
          </Campo>
        ))}
        <div style={{ background: "rgba(184,98,58,.08)", border: "1px solid var(--terra-soft)", borderRadius: 6, padding: "12px 14px" }}>
          <p className="sans" style={{ fontSize: 13, color: "#7a4a30", margin: 0, lineHeight: 1.5 }}>
            <b>Nota:</b> a confirmação de pagamentos é manual por agora. O cliente vê estas informações e a equipa confirma cada pagamento na aba Reservas. O pagamento automático (Express/RUPE) exige contrato com a EMIS ou agregador autorizado.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ============================ AUXILIARES ============================= */
const inp = { width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid var(--cream-deep)", fontSize: 14, background: "#FCFAF4", outline: "none" };
const td = { padding: "12px 14px", verticalAlign: "top" };
const navBtn = { display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 6, border: "1px solid rgba(239,231,211,.2)", background: "transparent", color: "var(--cream)", fontSize: 13 };

function Centro({ children, fundo }) { return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: fundo || "var(--cream)", padding: 20 }}>{children}</div>; }
function Section({ id, eyebrow, titulo, children, dark }) {
  return (
    <section id={id} style={{ background: dark ? "var(--leaf)" : "transparent", color: dark ? "var(--cream)" : "var(--ink)", padding: "70px 22px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <p className="sans" style={{ letterSpacing: 3, fontSize: 12, textTransform: "uppercase", color: "var(--terra)", margin: 0 }}>{eyebrow}</p>
        <h2 style={{ fontSize: "clamp(28px,4.5vw,44px)", margin: "8px 0 30px", maxWidth: 700 }}>{titulo}</h2>
        {children}
      </div>
    </section>
  );
}
function H({ titulo, sub, acao }) { return <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22, flexWrap: "wrap", gap: 12 }}><div><h1 style={{ margin: 0, fontSize: 28 }}>{titulo}</h1><p className="sans" style={{ margin: "4px 0 0", color: "#888", fontSize: 14 }}>{sub}</p></div>{acao}</div>; }
function Btn({ children, onClick, ghost, disabled }) { return <button onClick={onClick} disabled={disabled} className="sans" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "12px 22px", borderRadius: 6, fontSize: 15, fontWeight: 600, border: ghost ? "1.5px solid var(--cream)" : "none", background: ghost ? "transparent" : "var(--terra)", color: "var(--cream)", opacity: disabled ? 0.6 : 1 }}>{children}</button>; }
function MiniBtn({ children, onClick, cor }) { return <button onClick={onClick} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 5, border: "none", background: cor, color: "#fff", fontSize: 12 }}>{children}</button>; }
function Campo({ label, children, full }) { return <label className="sans" style={{ display: "block", gridColumn: full ? "1 / -1" : "auto" }}><span style={{ display: "block", fontSize: 12, color: "#888", marginBottom: 5, fontWeight: 600 }}>{label}</span>{children}</label>; }
function Estado({ e }) { const map = { Confirmada: "var(--water)", Pendente: "var(--terra)", Cancelada: "#999" }; return <span style={{ background: map[e] || "#999", color: "#fff", padding: "3px 9px", borderRadius: 20, fontSize: 12 }}>{e}</span>; }
