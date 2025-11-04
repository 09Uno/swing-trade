// ========== ROTAS: PROVENTOS ==========

import express from 'express';
import {
  getAllProventos,
  getProventoById,
  createProvento,
  updateProvento,
  deleteProvento,
  importProventos,
  getProventosStats
} from '../controllers/proventosController.js';

const router = express.Router();

router.get('/', getAllProventos);
router.get('/stats', getProventosStats);
router.get('/:id', getProventoById);
router.post('/', createProvento);
router.put('/:id', updateProvento);
router.delete('/:id', deleteProvento);
router.post('/import', importProventos);

export default router;
