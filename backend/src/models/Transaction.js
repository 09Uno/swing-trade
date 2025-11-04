// ========== MODEL: TRANSAÇÕES ==========

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  data: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Data da transação (formato DD/MM/YYYY)'
  },
  ativo: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Código do ativo (ex: PETR4, BBDC4)'
  },
  tipo: {
    type: DataTypes.ENUM('C', 'V'),
    allowNull: false,
    comment: 'C = Compra, V = Venda'
  },
  qtd: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Quantidade de ativos'
  },
  preco: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Preço unitário'
  },
  custos: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
    comment: 'Custos da transação (corretagem, taxas)'
  },
  categoria: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Categoria do ativo (Ações, FIIs, ETFs, etc)'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações adicionais'
  }
}, {
  tableName: 'transactions',
  indexes: [
    { fields: ['ativo'] },
    { fields: ['data'] },
    { fields: ['tipo'] },
    { fields: ['categoria'] }
  ]
});

export default Transaction;
