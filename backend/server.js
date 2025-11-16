// ========== SERVIDOR PRINCIPAL ==========

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from './src/config/database.js';
import transactionsRouter from './src/routes/transactions.js';
import proventosRouter from './src/routes/proventos.js';
import rendaFixaRouter from './src/routes/rendaFixa.js';
import summaryRouter from './src/routes/summary.js';
import backupRouter from './src/routes/backup.js';
import authRouter from './src/routes/auth.js';
import { initAdminUser } from './src/config/initUser.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..')));

// Rotas
app.use('/api/auth', authRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/proventos', proventosRouter);
app.use('/api/renda-fixa', rendaFixaRouter);
app.use('/api/summary', summaryRouter);
app.use('/api/backup', backupRouter);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: sequelize.options.storage
  });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// Inicialização do servidor
async function startServer() {
  try {
    // Testa conexão com banco
    await sequelize.authenticate();
    console.log('✅ Conectado ao SQLite');

    // Sincroniza models (cria tabelas se não existirem)
    await sequelize.sync({ alter: true });
    console.log('✅ Tabelas sincronizadas');

    // Inicializa usuário administrador
    await initAdminUser();

    // Inicia servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
      console.log(`📁 Banco de dados: ${sequelize.options.storage}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

startServer();
