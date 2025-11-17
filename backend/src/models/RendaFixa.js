// ========== MODEL: RENDA FIXA ==========

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const RendaFixa = sequelize.define('RendaFixa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nome/identificação do investimento'
  },
  tipo: {
    type: DataTypes.ENUM('CDB', 'LCI', 'LCA', 'Tesouro Selic', 'Tesouro IPCA+', 'Tesouro Prefixado'),
    allowNull: false,
    comment: 'Tipo de investimento'
  },
  valorInicial: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Valor investido inicialmente'
  },
  taxa: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Taxa de retorno (% do CDI, Selic, ou % a.a.)'
  },
  indexador: {
    type: DataTypes.ENUM('CDI', 'SELIC', 'IPCA', 'PREFIXADO'),
    allowNull: true,
    comment: 'Indexador do investimento'
  },
  dataInicio: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Data de início (formato YYYY-MM-DD)'
  },
  dataVencimento: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Data de vencimento (formato YYYY-MM-DD)'
  },
  dataResgate: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Data de resgate antecipado (formato YYYY-MM-DD)'
  },
  liquidez: {
    type: DataTypes.ENUM('diaria', 'vencimento'),
    defaultValue: 'diaria',
    comment: 'Tipo de liquidez'
  },
  instituicao: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Nome da instituição financeira'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Se o investimento está ativo ou foi resgatado'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações adicionais'
  }
}, {
  tableName: 'renda_fixa',
  indexes: [
    { fields: ['tipo'] },
    { fields: ['ativo'] },
    { fields: ['dataInicio'] }
  ]
});

export default RendaFixa;
