# 🚀 Guia de Deploy - Portfolio Manager

Este documento explica como fazer o deploy do seu sistema de investimentos online.

## 📋 Pré-requisitos

- Conta no GitHub (gratuita)
- Conta no Vercel, Railway ou Render (gratuitas)

## 🎯 Opções de Deploy

### Opção 1: Vercel (Recomendado - Mais Fácil)

#### Vantagens:
- ✅ Totalmente gratuito
- ✅ Deploy automático via GitHub
- ✅ SSL/HTTPS grátis
- ✅ Domínio grátis (.vercel.app)

#### Passo a passo:

1. **Criar repositório no GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/swing-trade.git
   git push -u origin main
   ```

2. **Fazer deploy no Vercel**
   - Acesse https://vercel.com
   - Clique em "New Project"
   - Importe seu repositório do GitHub
   - Configure:
     - Framework Preset: Other
     - Root Directory: ./
     - Build Command: `cd backend && npm install`
     - Output Directory: ./
   - Clique em "Deploy"

3. **Configurar variáveis de ambiente (opcional)**
   - No painel do Vercel, vá em Settings > Environment Variables
   - Adicione: `NODE_ENV=production`

4. **Pronto!**
   - Seu sistema estará disponível em: `https://seu-projeto.vercel.app/index-new.html`

---

### Opção 2: Railway (Backend) + Vercel (Frontend)

#### Vantagens:
- ✅ Gratuito (500h/mês)
- ✅ Suporta SQLite persistente
- ✅ Melhor para backends

#### Passo a passo:

1. **Deploy do Backend no Railway**
   - Acesse https://railway.app
   - Crie novo projeto
   - Conecte com GitHub (pasta `backend`)
   - Configure:
     - Start Command: `npm start`
     - Port: 3000
   - Deploy!

2. **Deploy do Frontend no Vercel**
   - Mesmos passos da Opção 1
   - Configure a URL da API no arquivo `js/api/apiClient.js`:
     ```javascript
     const API_URL = 'https://sua-api.railway.app/api';
     ```

---

### Opção 3: Render (Tudo em Um)

#### Vantagens:
- ✅ Gratuito
- ✅ Deploy automático
- ✅ Fácil configuração

#### Passo a passo:

1. **Criar conta no Render**
   - Acesse https://render.com

2. **Criar Web Service**
   - New > Web Service
   - Conecte seu repositório GitHub
   - Configure:
     - Name: portfolio-manager
     - Environment: Node
     - Build Command: `cd backend && npm install`
     - Start Command: `cd backend && npm start`
     - Branch: main

3. **Configurar Static Site (Frontend)**
   - New > Static Site
   - Conecte o mesmo repositório
   - Configure:
     - Build Command: (deixe vazio)
     - Publish Directory: ./

---

## 🔧 Configuração Pós-Deploy

### Atualizar URL da API no Frontend

Edite o arquivo `js/api/apiClient.js`:

```javascript
// Desenvolvimento local
const API_URL = 'http://localhost:3000/api';

// Produção (substitua pela URL do seu deploy)
const API_URL = 'https://seu-backend.vercel.app/api';
```

### Configurar CORS no Backend

Edite `backend/server.js` se necessário:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5500',
    'https://seu-frontend.vercel.app',
    'https://seu-dominio.com'
  ],
  credentials: true
};
```

---

## 📱 Acessar de Qualquer Lugar

Após o deploy, você poderá acessar seu sistema de:
- 💻 **Computador**: qualquer navegador
- 📱 **Celular**: navegador mobile
- 🌐 **Qualquer lugar**: basta ter internet

**URL de acesso:**
`https://seu-projeto.vercel.app/index-new.html`

---

## 🎨 Usar Domínio Próprio (Opcional)

Se você tem um domínio (ex: `investimentos.com.br`):

### No Vercel:
1. Settings > Domains
2. Adicione seu domínio
3. Configure DNS conforme instruções

### Domínio Gratuito:
- Use o domínio `.vercel.app` gratuito
- Ou registre um grátis em: https://www.freenom.com

---

## 🔒 Segurança

### Importante:
- ✅ O Vercel usa HTTPS automaticamente
- ✅ Dados ficam salvos no SQLite (backend)
- ⚠️ Para produção séria, considere PostgreSQL
- ⚠️ Adicione autenticação se for compartilhar

---

## 🆘 Problemas Comuns

### 1. Erro de CORS
**Solução**: Adicione a URL do frontend no `corsOptions` do backend

### 2. API não conecta
**Solução**: Verifique se a URL da API no `apiClient.js` está correta

### 3. Dados não persistem
**Solução**:
- Vercel: Use PostgreSQL ou MongoDB Atlas (grátis)
- Railway: SQLite funciona normalmente

### 4. Build falha
**Solução**:
- Verifique se `package.json` está na pasta `backend`
- Rode `npm install` localmente primeiro

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique logs do deploy no painel da plataforma
2. Teste localmente primeiro com `npm run dev`
3. Confira se todas as variáveis de ambiente estão configuradas

---

## 🎯 Próximos Passos

Após o deploy, você pode:
- [ ] Configurar domínio personalizado
- [ ] Adicionar autenticação (login/senha)
- [ ] Integrar com APIs de cotações em tempo real
- [ ] Criar backup automático dos dados
- [ ] Adicionar notificações push

**Pronto! Seu sistema está online! 🎉**
