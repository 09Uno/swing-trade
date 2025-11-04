// ========== MODEL: CONFIGURAÇÕES ==========

import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Config = sequelize.define('Config', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  chave: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'Nome da configuração (ex: taxaCDI, taxaSelic, taxaIPCA)'
  },
  valor: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Valor da configuração (armazenado como string)'
  },
  tipo: {
    type: DataTypes.ENUM('number', 'string', 'boolean', 'json'),
    defaultValue: 'string',
    comment: 'Tipo do valor armazenado'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição da configuração'
  }
}, {
  tableName: 'config',
  indexes: [
    { fields: ['chave'], unique: true }
  ]
});

export default Config;
