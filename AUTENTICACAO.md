# 🔐 Sistema de Autenticação - Guia de Uso

## O que mudou?

Agora o Swing Trade Manager possui **autenticação OBRIGATÓRIA e EXCLUSIVA**! 

✅ Apenas o administrador (você) pode acessar  
✅ Dados seguros no servidor  
✅ Acesse de qualquer dispositivo  
✅ Registro de novos usuários BLOQUEADO  
✅ Proteção total contra acesso não autorizado  
✅ Usuário criado automaticamente no primeiro start

⚠️ **IMPORTANTE:** Apenas UM usuário. Ninguém pode criar contas pela interface.

---

## 🚀 Configuração inicial

### 1. Configurar usuário no .env

Edite o arquivo `backend/.env` e defina seu usuário e senha:

```env
# Usuário Administrador
ADMIN_USERNAME=seu_usuario
ADMIN_PASSWORD=sua_senha_segura
```

⚠️ **MUDE ESSES VALORES!** Não use os valores padrão em produção.

### 2. Instalar dependências

```bash
cd backend
npm install
```

### 3. Iniciar o servidor

```bash
npm run dev
```

O usuário será criado automaticamente na primeira vez! Você verá:
```
✅ Usuário administrador criado: seu_usuario
```

---

## 🔑 Fazendo login

1. Abra a aplicação no navegador
2. Digite o **usuário** e **senha** configurados no `.env`
3. Clique em **"Entrar"**
4. Você será redirecionado para a aplicação

**Credenciais padrão (MUDE NO .env!):**
- Usuário: `admin`
- Senha: `admin123`

---

## 🔒 Segurança

- ✅ As senhas são **criptografadas** com bcrypt
- ✅ Sistema usa **JWT (JSON Web Tokens)** para autenticação
- ✅ Tokens expiram em **7 dias**
- ✅ Dados armazenados no **SQLite** do servidor
- ✅ **Login obrigatório** - sem exceções
- ✅ **Registro desabilitado** - apenas via script do administrador
- ✅ **Acesso exclusivo** - apenas usuários autorizados

---

## 🚪 Fazendo logout

No canto superior direito da aplicação, clique no botão **"🚪 Sair"**

Isso irá:
- Limpar o token de autenticação
- Redirecionar para a tela de login
- Manter seus dados seguros no servidor

---

## ⚙️ Configuração do Backend

O arquivo `backend/.env` contém as configurações:

```env
PORT=3000
FRONTEND_URL=http://localhost:8080
JWT_SECRET=seu_segredo_muito_secreto_mude_em_producao_12345
NODE_ENV=development

# Credenciais do administrador
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

**⚠️ IMPORTANTE:** 
- Mude o `JWT_SECRET` em produção!
- Mude o `ADMIN_USERNAME` e `ADMIN_PASSWORD`!
- Nunca commite o arquivo `.env` no git!

---

## 🗄️ Banco de Dados

Os dados são armazenados no SQLite em `backend/database/database.sqlite`

Tabela criada automaticamente:
- **users**: Armazena usuários e senhas criptografadas

As outras tabelas (transactions, proventos, renda_fixa) **serão atualizadas** em breve para associar dados aos usuários.

---

## 🔧 Próximos passos

Para sincronização completa entre dispositivos, ainda será necessário:

1. Adicionar `userId` às tabelas existentes
2. Criar endpoints de sincronização (GET/POST para cada tipo de dado)
3. Modificar o frontend para enviar dados ao servidor
4. Implementar sincronização automática

Por enquanto, a autenticação já está funcionando! 🎉

---

## 🆘 Problemas comuns

### "Erro ao autenticar"
- Verifique se o backend está rodando (`npm run dev` na pasta backend)
- Confira se a porta 3000 está disponível

### "Token inválido"
- Seu token expirou (7 dias)
- Faça login novamente

### "Dados não aparecem"
- Os dados ainda estão no localStorage do navegador
- Em breve será implementada a migração para o servidor

---

## 📞 Suporte

Se tiver dúvidas ou problemas, verifique:
- Console do navegador (F12)
- Logs do servidor backend
- Arquivo `.env` está configurado corretamente
