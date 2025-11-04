// ========== ROTAS: RENDA FIXA ==========

import express from 'express';
import {
  getAllRendaFixa,
  getRendaFixaById,
  createRendaFixa,
  updateRendaFixa,
  resgatarRendaFixa,
  deleteRendaFixa,
  importRendaFixa,
  getTaxas,
  updateTaxas
} from '../controllers/rendaFixaController.js';

const router = express.Router();

router.get('/', getAllRendaFixa);
router.get('/taxas', getTaxas);
router.put('/taxas', updateTaxas);
router.get('/:id', getRendaFixaById);
router.post('/', createRendaFixa);
router.put('/:id', updateRendaFixa);
router.put('/:id/resgatar', resgatarRendaFixa);
router.delete('/:id', deleteRendaFixa);
router.post('/import', importRendaFixa);

export default router;
