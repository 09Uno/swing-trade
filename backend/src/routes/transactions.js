// ========== ROTAS: TRANSAÇÕES ==========

import express from 'express';
import {
  getAllTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  importTransactions,
  deleteAllTransactions
} from '../controllers/transactionsController.js';

const router = express.Router();

router.get('/', getAllTransactions);
router.get('/:id', getTransactionById);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);
router.post('/import', importTransactions);
router.delete('/bulk/all', deleteAllTransactions);

export default router;
