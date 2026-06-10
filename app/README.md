# Quinta São Luís — Plataforma de Gestão de Eventos

Aplicação web completa: site público (montra + reservas) e área de administração
restrita, com backend, base de dados e API próprios. Pronta a fazer upload para
uma plataforma de hospedagem gratuita.

---

## O que está incluído

```
app/
├── backend/            Servidor Node.js (API + serve o site)
│   ├── server.js       Rotas da API e serviço dos ficheiros do site
│   ├── db.js           Base de dados (ficheiro JSON, sem instalação extra)
│   ├── package.json
│   └── public/         (gerado) o site compilado vai para aqui
├── frontend/           Site em React (Vite)
│   ├── src/            Código do site e da administração
│   └── package.json
├── render.yaml         Configuração de deploy automático (Render)
├── build.sh           Script para compilar tudo de uma vez
└── README.md          Este ficheiro
```

## Credenciais de acesso à administração

- **E-mail:** `admin@quintasaoluis.ao`
- **Palavra-passe:** `saoluis`

(Mude-as depois — ver secção "Produção".)

---

## A. Testar no seu computador (opcional)

Precisa de ter o Node.js 18 ou superior instalado.

```bash
# dentro da pasta app/
./build.sh
cd backend
npm start
```

Abra **http://localhost:3000** no navegador. O site e a administração estão
ambos nesse endereço.

---

## B. Pôr online grátis no Render (recomendado para testes)

O Render corre a aplicação inteira (site + API) num único serviço gratuito.

### Passo 1 — Pôr o código no GitHub
1. Crie uma conta em https://github.com (grátis).
2. Crie um repositório novo, por exemplo `quinta-sao-luis`.
3. Envie o conteúdo da pasta `app/` para esse repositório.
   (Pode arrastar os ficheiros na página do GitHub, em "Add file" → "Upload files".)

### Passo 2 — Criar o serviço no Render
1. Crie uma conta em https://render.com (grátis) e ligue-a ao GitHub.
2. Clique em **New** → **Blueprint**.
3. Escolha o repositório `quinta-sao-luis`. O Render lê o ficheiro `render.yaml`
   e configura tudo sozinho.
4. Clique em **Apply**. A primeira compilação demora alguns minutos.
5. No fim, o Render dá-lhe um endereço como
   `https://quinta-sao-luis.onrender.com` — é o seu site, acessível de
   qualquer parte do mundo.

### Em alternativa, sem `render.yaml` (configuração manual)
Se preferir, em **New → Web Service** defina (atenção: os comandos começam com `app/`
porque os ficheiros estão dentro da pasta `app/` no repositório):
- **Build Command:**
  ```
  cd app/frontend && npm install && npm run build && cd ../.. && rm -rf app/backend/public && cp -r app/frontend/dist app/backend/public && cd app/backend && npm install
  ```
- **Start Command:** `cd app/backend && npm start`
- **Environment:** acrescente uma variável `JWT_SECRET` com um valor à sua escolha.

---

## Notas importantes sobre o plano gratuito

- **O serviço "adormece" após ~15 minutos sem visitas.** O primeiro acesso
  seguinte demora cerca de 30–50 segundos a acordar. É normal no plano gratuito.
- **Os dados são temporários.** Reservas, fotos e textos novos voltam aos
  valores iniciais sempre que o serviço reinicia. Isto é adequado para
  **demonstração e testes**, que é o objetivo desta fase.

---

## C. Upload de fotos (Cloudinary) — para carregar ficheiros na galeria, banner e logótipo

O site permite adicionar fotos de duas maneiras:
1. **Por link (URL):** cola o endereço de uma imagem que já esteja na internet. Funciona sempre, sem configuração.
2. **Por ficheiro (carregar do computador/telemóvel):** precisa de uma conta gratuita no Cloudinary. Configura-se uma só vez.

> **Porquê o Cloudinary?** No plano gratuito do Render, os ficheiros guardados no servidor desaparecem quando o serviço reinicia. O Cloudinary guarda as fotos em segurança e o nosso site fica apenas com o endereço de cada foto — assim as imagens nunca se perdem.

### Passo a passo (uma única vez, ~5 minutos)

1. Crie uma conta gratuita em **https://cloudinary.com** (botão *Sign up*).
2. No painel inicial (*Dashboard*), anote o **Cloud name** — uma palavra curta, por exemplo `dxy12abcd`.
3. Crie uma chave de upload aberta (*unsigned upload preset*):
   - Vá a **Settings** (roda dentada) → separador **Upload**.
   - Desça até **Upload presets** → **Add upload preset**.
   - Em **Signing Mode**, escolha **Unsigned**.
   - Anote o **nome do preset** que aparece e clique em **Save**.
4. No **Render**, abra o seu serviço e em **Environment** acrescente duas variáveis:
   - `CLOUDINARY_CLOUD_NAME` → o seu Cloud name (passo 2)
   - `CLOUDINARY_UPLOAD_PRESET` → o nome do preset (passo 3)
5. Guarde. O Render reinicia sozinho e os botões **"Carregar ficheiro"** na administração ficam ativos.

Enquanto não configurar, pode adicionar fotos por **URL** — todo o resto funciona normalmente.

---

## D. Passar para produção (quando quiser usar a sério)

Para que os dados fiquem guardados de forma permanente e o site não adormeça:

1. **Base de dados real:** substituir o ficheiro JSON por PostgreSQL.
   O `db.js` está organizado numa única camada de acesso, por isso a troca
   é localizada. O Render oferece PostgreSQL gerido.
2. **Plano pago do Render** (ou disco persistente) para o site não adormecer
   e os dados não se perderem.
3. **Mudar as credenciais e o `JWT_SECRET`.** Defina o `JWT_SECRET` como
   variável de ambiente e crie uma palavra-passe forte para o administrador.
4. **Pagamentos online** (Multicaixa Express / cartão) e **partilha automática
   nas redes sociais** — ver o documento "Plano Técnico de Produção".

---

## Como funciona (resumo técnico)

- O **backend** (Express) expõe uma API em `/api/...` e serve o site compilado.
- O **frontend** (React) consome essa API. Como ambos vivem no mesmo servidor,
  não há problemas de CORS nem configuração de endereços.
- A **base de dados** é um ficheiro `quinta-data.json` criado automaticamente na
  primeira execução, já com dados de exemplo.
- A **administração** é protegida por autenticação com token (JWT). Sem sessão
  válida, as rotas de gestão devolvem erro 401.
