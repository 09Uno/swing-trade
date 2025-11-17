// ========== MODEL: PROVENTOS ==========

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Provento = sequelize.define('Provento', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ativo: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Código do ativo (ex: PETR4, BBDC4)'
  },
  tipo: {
    type: DataTypes.ENUM('Dividendo', 'JCP', 'Rendimento', 'Restituição de Capital'),
    allowNull: false,
    comment: 'Tipo de provento'
  },
  valorUnitario: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Valor por ação/cota'
  },
  quantidade: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Quantidade de ativos que geraram o provento'
  },
  total: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Valor total recebido (valorUnitario * quantidade)'
  },
  dataCom: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Data COM (formato DD/MM/YYYY)'
  },
  dataPagamento: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Data de pagamento (formato DD/MM/YYYY)'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações adicionais'
  }
}, {
  tableName: 'proventos',
  indexes: [
    { fields: ['ativo'] },
    { fields: ['tipo'] },
    { fields: ['dataPagamento'] }
  ]
});

export default Provento;
