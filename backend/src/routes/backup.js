// ========== ROTAS: BACKUP/RESTORE ==========

import express from 'express';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { sequelize } from '../config/database.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Criar backup do banco de dados
router.post('/create', async (req, res) => {
  try {
    const dbPath = sequelize.options.storage;
    const backupDir = join(dirname(dbPath), '../backups');

    // Cria pasta de backups se não existir
    if (!existsSync(backupDir)) {
      mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(backupDir, `backup_${timestamp}.db`);

    // Copia o arquivo do banco
    copyFileSync(dbPath, backupPath);

    res.json({
      message: 'Backup criado com sucesso',
      backupPath: backupPath,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Download do banco de dados atual
router.get('/download', async (req, res) => {
  try {
    const dbPath = sequelize.options.storage;

    if (!existsSync(dbPath)) {
      return res.status(404).json({ error: 'Banco de dados não encontrado' });
    }

    const filename = `investimentos_${new Date().toISOString().split('T')[0]}.db`;

    res.download(dbPath, filename, (err) => {
      if (err) {
        res.status(500).json({ error: 'Erro ao fazer download do banco de dados' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
