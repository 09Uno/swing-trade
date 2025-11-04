// ========== ROTAS: RESUMO/DASHBOARD ==========

import express from 'express';
import { Transaction, Provento, RendaFixa } from '../models/index.js';

const router = express.Router();

// Endpoint para obter todos os dados de uma vez
router.get('/', async (req, res) => {
  try {
    const [transactions, proventos, rendaFixa] = await Promise.all([
      Transaction.findAll({ order: [['data', 'ASC']] }),
      Provento.findAll({ order: [['dataPagamento', 'DESC']] }),
      RendaFixa.findAll({ order: [['dataInicio', 'DESC']] })
    ]);

    const summary = {
      transactions: transactions.length,
      proventos: proventos.length,
      rendaFixa: rendaFixa.length,
      totalProventos: proventos.reduce((sum, p) => sum + p.total, 0),
      totalRendaFixaInvestido: rendaFixa
        .filter(rf => rf.ativo)
        .reduce((sum, rf) => sum + rf.valorInicial, 0)
    };

    res.json({
      summary,
      data: {
        transactions,
        proventos,
        rendaFixa
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
