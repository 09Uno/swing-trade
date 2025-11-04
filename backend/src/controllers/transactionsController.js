// ========== CONTROLLER: TRANSAÇÕES ==========

import { Transaction } from '../models/index.js';
import { Op } from 'sequelize';

// Listar todas as transações
export const getAllTransactions = async (req, res) => {
  try {
    const { ativo, tipo, categoria, dataInicio, dataFim } = req.query;

    const where = {};

    if (ativo) where.ativo = ativo;
    if (tipo) where.tipo = tipo;
    if (categoria) where.categoria = categoria;

    const transactions = await Transaction.findAll({
      where,
      order: [['data', 'ASC'], ['id', 'ASC']]
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Buscar transação por ID
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Criar nova transação
export const createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Atualizar transação
export const updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    await transaction.update(req.body);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Deletar transação
export const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByPk(req.params.id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transação não encontrada' });
    }

    await transaction.destroy();
    res.json({ message: 'Transação deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Importar múltiplas transações (bulk)
export const importTransactions = async (req, res) => {
  try {
    const { transactions } = req.body;

    if (!Array.isArray(transactions)) {
      return res.status(400).json({ error: 'Formato inválido. Esperado array de transações.' });
    }

    const created = await Transaction.bulkCreate(transactions, {
      validate: true,
      returning: true
    });

    res.status(201).json({
      message: `${created.length} transações importadas com sucesso`,
      transactions: created
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Deletar todas as transações (reset)
export const deleteAllTransactions = async (req, res) => {
  try {
    const count = await Transaction.destroy({ where: {} });
    res.json({ message: `${count} transações deletadas` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
