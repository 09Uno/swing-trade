// ========== CONTROLLER: PROVENTOS ==========

import { Provento } from '../models/index.js';

// Listar todos os proventos
export const getAllProventos = async (req, res) => {
  try {
    const { ativo, tipo } = req.query;

    const where = {};
    if (ativo) where.ativo = ativo;
    if (tipo) where.tipo = tipo;

    const proventos = await Provento.findAll({
      where,
      order: [['dataPagamento', 'DESC'], ['id', 'DESC']]
    });

    res.json(proventos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar provento por ID
export const getProventoById = async (req, res) => {
  try {
    const provento = await Provento.findByPk(req.params.id);

    if (!provento) {
      return res.status(404).json({ error: 'Provento não encontrado' });
    }

    res.json(provento);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Criar novo provento
export const createProvento = async (req, res) => {
  try {
    const provento = await Provento.create(req.body);
    res.status(201).json(provento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Atualizar provento
export const updateProvento = async (req, res) => {
  try {
    const provento = await Provento.findByPk(req.params.id);

    if (!provento) {
      return res.status(404).json({ error: 'Provento não encontrado' });
    }

    await provento.update(req.body);
    res.json(provento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Deletar provento
export const deleteProvento = async (req, res) => {
  try {
    const provento = await Provento.findByPk(req.params.id);

    if (!provento) {
      return res.status(404).json({ error: 'Provento não encontrado' });
    }

    await provento.destroy();
    res.json({ message: 'Provento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Importar múltiplos proventos (bulk)
export const importProventos = async (req, res) => {
  try {
    const { proventos } = req.body;

    if (!Array.isArray(proventos)) {
      return res.status(400).json({ error: 'Formato inválido. Esperado array de proventos.' });
    }

    const created = await Provento.bulkCreate(proventos, {
      validate: true,
      returning: true
    });

    res.status(201).json({
      message: `${created.length} proventos importados com sucesso`,
      proventos: created
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Estatísticas de proventos
export const getProventosStats = async (req, res) => {
  try {
    const { ativo } = req.query;

    const where = ativo ? { ativo } : {};

    const proventos = await Provento.findAll({ where });

    const stats = {
      total: proventos.reduce((sum, p) => sum + p.total, 0),
      quantidade: proventos.length,
      porTipo: {},
      porAtivo: {}
    };

    proventos.forEach(p => {
      // Por tipo
      if (!stats.porTipo[p.tipo]) {
        stats.porTipo[p.tipo] = { quantidade: 0, total: 0 };
      }
      stats.porTipo[p.tipo].quantidade++;
      stats.porTipo[p.tipo].total += p.total;

      // Por ativo
      if (!stats.porAtivo[p.ativo]) {
        stats.porAtivo[p.ativo] = { quantidade: 0, total: 0 };
      }
      stats.porAtivo[p.ativo].quantidade++;
      stats.porAtivo[p.ativo].total += p.total;
    });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
