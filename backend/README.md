# 🏦 Backend API - Sistema de Investimentos

Backend RESTful API para o sistema de análise de investimentos usando **Node.js**, **Express** e **SQLite**.

## 📋 Características

- ✅ **Banco de dados portátil** - SQLite em arquivo único
- ✅ **API RESTful completa** - CRUD para todas as entidades
- ✅ **Fácil movimentação** - Copie o arquivo .db e está pronto
- ✅ **Sem dependências externas** - Não precisa instalar MySQL/PostgreSQL
- ✅ **Backup automático** - Sistema de backup/restore integrado
- ✅ **ORM Sequelize** - Abstraçã o do banco de dados
- ✅ **CORS habilitado** - Funciona com frontend separado

## 🚀 Instalação

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp .env.example .env
```

Edite o arquivo `.env` se necessário:

```env
PORT=3000
NODE_ENV=development
DB_PATH=./database/investimentos.db
FRONTEND_URL=http://127.0.0.1:5500
```

### 3. Iniciar o servidor

```bash
npm start
```

Ou em modo de desenvolvimento (com auto-reload):

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do SQLite
│   ├── models/
│   │   ├── Transaction.js       # Model de transações
│   │   ├── Provento.js          # Model de proventos
│   │   ├── RendaFixa.js         # Model de renda fixa
│   │   ├── Config.js            # Model de configurações
│   │   └── index.js             # Export de todos os models
│   ├── controllers/
│   │   ├── transactionsController.js
│   │   ├── proventosController.js
│   │   └── rendaFixaController.js
│   └── routes/
│       ├── transactions.js      # Rotas de transações
│       ├── proventos.js         # Rotas de proventos
│       ├── rendaFixa.js         # Rotas de renda fixa
│       ├── summary.js           # Rota de resumo
│       └── backup.js            # Rotas de backup
├── database/
│   └── investimentos.db         # Banco SQLite (criado automaticamente)
├── backups/                     # Backups do banco
├── server.js                    # Servidor principal
├── package.json
├── .env.example
└── README.md
```

## 🔌 API Endpoints

### Health Check

```
GET /api/health
```

Retorna status da API e caminho do banco de dados.

### Transações

```
GET    /api/transactions           # Listar todas
GET    /api/transactions/:id       # Buscar por ID
POST   /api/transactions           # Criar nova
PUT    /api/transactions/:id       # Atualizar
DELETE /api/transactions/:id       # Deletar
POST   /api/transactions/import    # Importar múltiplas
DELETE /api/transactions/bulk/all  # Deletar todas
```

**Filtros GET:**
- `?ativo=PETR4` - Filtrar por ativo
- `?tipo=C` - Filtrar por tipo (C=Compra, V=Venda)
- `?categoria=Ações` - Filtrar por categoria

**Exemplo POST:**
```json
{
  "data": "15/01/2024",
  "ativo": "PETR4",
  "tipo": "C",
  "qtd": 100,
  "preco": 38.50,
  "custos": 10.00,
  "categoria": "Ações"
}
```

### Proventos

```
GET    /api/proventos              # Listar todos
GET    /api/proventos/stats        # Estatísticas
GET    /api/proventos/:id          # Buscar por ID
POST   /api/proventos              # Criar novo
PUT    /api/proventos/:id          # Atualizar
DELETE /api/proventos/:id          # Deletar
POST   /api/proventos/import       # Importar múltiplos
```

**Exemplo POST:**
```json
{
  "ativo": "PETR4",
  "tipo": "Dividendo",
  "valorUnitario": 0.50,
  "quantidade": 100,
  "total": 50.00,
  "dataCom": "10/01/2024",
  "dataPagamento": "20/01/2024"
}
```

### Renda Fixa

```
GET    /api/renda-fixa             # Listar todos
GET    /api/renda-fixa/taxas       # Obter taxas (CDI, Selic, IPCA)
PUT    /api/renda-fixa/taxas       # Atualizar taxas
GET    /api/renda-fixa/:id         # Buscar por ID
POST   /api/renda-fixa             # Criar novo
PUT    /api/renda-fixa/:id         # Atualizar
PUT    /api/renda-fixa/:id/resgatar # Resgatar investimento
DELETE /api/renda-fixa/:id         # Deletar
POST   /api/renda-fixa/import      # Importar múltiplos
```

**Exemplo POST:**
```json
{
  "nome": "CDB Banco X",
  "tipo": "CDB",
  "valorInicial": 10000,
  "taxa": 110,
  "indexador": "CDI",
  "dataInicio": "2024-01-01",
  "liquidez": "diaria",
  "instituicao": "Banco X"
}
```

### Resumo

```
GET /api/summary                   # Obter todos os dados
```

Retorna transações, proventos e renda fixa de uma vez.

### Backup

```
POST /api/backup/create            # Criar backup do banco
GET  /api/backup/download          # Download do arquivo .db
```

## 💾 Backup e Movimentação

### Backup Manual

O arquivo do banco está em `backend/database/investimentos.db`. Basta copiar esse arquivo para fazer backup:

```bash
# Criar backup manual
cp database/investimentos.db backups/backup_$(date +%Y%m%d).db
```

### Backup via API

```bash
# Criar backup
curl -X POST http://localhost:3000/api/backup/create

# Download do banco
curl -O http://localhost:3000/api/backup/download
```

### Restaurar Backup

Para restaurar um backup, basta substituir o arquivo `database/investimentos.db`:

```bash
# Parar o servidor primeiro
# Depois copiar o backup
cp backups/backup_20240115.db database/investimentos.db
# Reiniciar o servidor
```

### Mover para outro computador

1. Copie a pasta `backend/` inteira
2. Ou copie apenas o arquivo `database/investimentos.db`
3. No novo computador:
   ```bash
   cd backend
   npm install
   npm start
   ```

## 🔧 Scripts NPM

```bash
npm start          # Inicia o servidor
npm run dev        # Modo desenvolvimento (nodemon)
```

## 📊 Banco de Dados SQLite

### Características

- **Arquivo único**: Todo o banco em um arquivo `.db`
- **Portátil**: Copie e cole entre computadores
- **Sem servidor**: Não precisa instalar nada além do Node.js
- **Leve**: Ideal para aplicações locais
- **ACID compliant**: Transações seguras

### Acessar o banco diretamente

Você pode usar ferramentas como **DB Browser for SQLite** ou **sqlite3** CLI:

```bash
# Instalar sqlite3 CLI (se não tiver)
npm install -g sqlite3

# Abrir o banco
sqlite3 database/investimentos.db

# Comandos úteis
.tables                    # Ver todas as tabelas
.schema transactions       # Ver estrutura de uma tabela
SELECT * FROM transactions LIMIT 10;
```

## 🌐 Integração com Frontend

O frontend detecta automaticamente se a API está disponível:

1. **API disponível**: Usa o backend para persistência
2. **API indisponível**: Usa LocalStorage (modo offline)

Para conectar o frontend:

1. Certifique-se que o backend está rodando (`npm start`)
2. Abra o frontend normalmente
3. O sistema detecta automaticamente e usa a API

## 🛡️ Segurança

**⚠️ Importante**: Este backend é para uso **local/pessoal**. Não exponha na internet sem adicionar:

- Autenticação (JWT, sessões)
- Validação de dados
- Rate limiting
- HTTPS
- Firewall

## 📝 Logs

Logs são exibidos no console durante o desenvolvimento. Para produção, considere adicionar:

- Winston ou Pino para logs estruturados
- Arquivos de log rotativos
- Monitoramento de erros

## 🔄 Migrações Futuras

Se precisar migrar para PostgreSQL/MySQL no futuro:

1. O Sequelize já está configurado
2. Basta mudar o dialect em `database.js`
3. Adicionar credenciais do banco
4. Rodar migrations

## 📞 Troubleshooting

### Erro: "EADDRINUSE"

Porta 3000 já está em uso. Altere no `.env`:

```env
PORT=3001
```

### Erro: "Cannot find module"

Instale as dependências:

```bash
npm install
```

### Banco não foi criado

Verifique se a pasta `database/` existe. O servidor cria automaticamente na primeira execução.

### CORS error no frontend

Verifique se `FRONTEND_URL` no `.env` está correto:

```env
FRONTEND_URL=http://127.0.0.1:5500
```

## 📄 Licença

MIT
