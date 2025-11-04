# 🚀 Como Usar o Backend SQLite

Guia rápido para começar a usar o backend com banco de dados portátil.

## 📦 Instalação Rápida

### 1. Instalar Node.js

Se ainda não tem o Node.js instalado:
- Baixe em: https://nodejs.org/
- Instale a versão LTS (recomendada)
- Verifique a instalação: `node --version`

### 2. Instalar Dependências

Abra o terminal na pasta do projeto e execute:

```bash
cd backend
npm install
```

Isso instalará:
- Express (servidor web)
- Sequelize (ORM)
- SQLite3 (banco de dados)
- Outras dependências

### 3. Iniciar o Backend

```bash
npm start
```

Você verá:
```
✅ Conectado ao SQLite
✅ Tabelas sincronizadas
🚀 Servidor rodando em http://localhost:3000
📁 Banco de dados: ./database/investimentos.db
```

## 🎯 Usando o Sistema

### Opção 1: Com Backend (Recomendado)

1. **Inicie o backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Abra o frontend:**
   - Abra `index.html` no navegador
   - Ou use Live Server do VS Code

3. **O sistema detecta automaticamente:**
   - ✅ Verá "API conectada" no console
   - Todos os dados salvos no SQLite
   - Dados persistem entre sessões

### Opção 2: Sem Backend (Modo Offline)

1. **Apenas abra o frontend:**
   - Abra `index.html` no navegador

2. **Sistema funciona normalmente:**
   - ⚠️ Verá "API não disponível, usando LocalStorage"
   - Dados salvos no navegador
   - Funciona offline

## 💾 Backup e Movimentação

### Fazer Backup

**Opção 1: Copiar arquivo manualmente**
```bash
# O banco está aqui:
backend/database/investimentos.db

# Copie para backup:
cp backend/database/investimentos.db meu_backup_$(date +%Y%m%d).db
```

**Opção 2: Usar a API**
- Abra: http://localhost:3000/api/backup/download
- Salva automaticamente o arquivo .db

### Restaurar Backup

1. Pare o servidor (Ctrl+C)
2. Substitua o arquivo:
   ```bash
   cp meu_backup.db backend/database/investimentos.db
   ```
3. Reinicie o servidor:
   ```bash
   npm start
   ```

### Mover para Outro Computador

**Opção 1: Mover tudo**
```bash
# Copie a pasta inteira
cp -r backend/ /destino/

# No outro computador:
cd backend
npm install
npm start
```

**Opção 2: Só o banco de dados**
```bash
# Copie apenas o arquivo .db
cp backend/database/investimentos.db /destino/

# No outro computador:
# 1. Crie a estrutura do backend
# 2. Instale dependências
npm install
# 3. Coloque o arquivo .db em backend/database/
# 4. Inicie
npm start
```

## 🔧 Comandos Úteis

### Desenvolvimento

```bash
# Modo desenvolvimento (auto-reload)
npm run dev

# Ver logs detalhados
NODE_ENV=development npm start
```

### Manutenção

```bash
# Ver status da API
curl http://localhost:3000/api/health

# Criar backup via API
curl -X POST http://localhost:3000/api/backup/create

# Ver todas as transações
curl http://localhost:3000/api/transactions

# Ver resumo
curl http://localhost:3000/api/summary
```

## 📊 Onde Estão os Dados?

```
backend/
├── database/
│   └── investimentos.db      ← SEU BANCO DE DADOS (arquivo único)
└── backups/
    └── backup_*.db           ← BACKUPS AUTOMÁTICOS
```

**Importante:**
- Todo seu histórico está em `investimentos.db`
- É um arquivo de ~100KB a 5MB (dependendo dos dados)
- Pode ser aberto com DB Browser for SQLite
- Faça backup regularmente!

## 🐛 Problemas Comuns

### "Porta 3000 já está em uso"

Mude a porta no arquivo `.env`:
```env
PORT=3001
```

### "Cannot find module"

Instale as dependências:
```bash
cd backend
npm install
```

### Frontend não conecta na API

1. Verifique se o backend está rodando
2. Verifique a URL no console do navegador
3. Certifique-se que está usando `http://127.0.0.1:5500` no frontend

### "Database is locked"

O banco está sendo acessado por outro processo:
1. Feche todas as instâncias do servidor
2. Feche o DB Browser (se estiver aberto)
3. Reinicie o servidor

## 📱 Próximos Passos

Agora que o backend está funcionando:

1. ✅ Importe sua planilha Excel
2. ✅ Os dados são salvos automaticamente no SQLite
3. ✅ Faça backup do arquivo `.db` regularmente
4. ✅ Copie o `.db` para usar em outro computador

## 🎓 Para Desenvolvedores

### Estrutura da API

Veja documentação completa em: `backend/README.md`

### Testar endpoints

```bash
# Criar transação
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "data": "15/01/2024",
    "ativo": "PETR4",
    "tipo": "C",
    "qtd": 100,
    "preco": 38.50,
    "custos": 10,
    "categoria": "Ações"
  }'

# Listar todas
curl http://localhost:3000/api/transactions

# Filtrar por ativo
curl http://localhost:3000/api/transactions?ativo=PETR4
```

### Explorar o banco

```bash
# Instalar DB Browser for SQLite
# Ou usar CLI:
sqlite3 backend/database/investimentos.db

# Ver tabelas
.tables

# Ver dados
SELECT * FROM transactions LIMIT 10;
```

## 💡 Dicas

1. **Backup automático:** Configure um script para fazer backup diário
2. **Git:** Adicione `*.db` ao `.gitignore` (já está configurado)
3. **Nuvem:** Sincronize a pasta `backups/` com Dropbox/Google Drive
4. **Migração:** Se crescer muito, migre para PostgreSQL (Sequelize facilita)

## 📞 Precisa de Ajuda?

- 📖 Leia o README: `backend/README.md`
- 🔍 Veja os logs do servidor
- 🌐 Teste os endpoints: http://localhost:3000/api/health
