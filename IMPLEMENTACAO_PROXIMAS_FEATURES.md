# 🚀 Guia de Implementação - Próximas Funcionalidades

## 1. Sistema de Proventos

### Passo 1: Criar Modelo de Dados

Criar arquivo `js/models/Proventos.js`:

```javascript
export class ProventosManager {
  constructor() {
    this.proventos = [];
  }

  adicionarProvento(provento) {
    this.proventos.push({
      id: Date.now(),
      ativo: provento.ativo,
      tipo: provento.tipo, // "Dividendo", "JCP", "Rendimento"
      valor: provento.valor,
      dataCom: provento.dataCom,
      dataPagamento: provento.dataPagamento,
      quantidade: provento.quantidade,
      total: provento.valor * provento.quantidade
    });
  }

  getProventosPorAtivo(ativo) {
    return this.proventos.filter(p => p.ativo === ativo);
  }

  getTotalProventos() {
    return this.proventos.reduce((sum, p) => sum + p.total, 0);
  }

  getTotalPorCategoria(categoria, assets) {
    const ativosCategoria = assets
      .filter(a => a.category === categoria)
      .map(a => a.symbol);

    return this.proventos
      .filter(p => ativosCategoria.includes(p.ativo))
      .reduce((sum, p) => sum + p.total, 0);
  }
}
```

### Passo 2: Adicionar no HTML

Adicionar nova aba no `index.html`:

```html
<!-- Nas tabs -->
<button class="tab-btn" onclick="switchTab('proventos')">💰 Proventos</button>

<!-- Nova aba -->
<div id="proventos" class="tab-content">
  <div class="filtro-container">
    <button onclick="abrirModalProvento()">➕ Adicionar Provento</button>
    <label>Período:
      <input type="date" id="proventosDataInicio">
      até
      <input type="date" id="proventosDataFim">
    </label>
    <button onclick="filtrarProventos()">Filtrar</button>
  </div>

  <div class="summary-cards" id="proventosSummary"></div>

  <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Data Pagamento</th>
          <th>Ativo</th>
          <th>Tipo</th>
          <th class="num-col">Valor Unit.</th>
          <th class="num-col">Quantidade</th>
          <th class="num-col">Total</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="proventosBody"></tbody>
    </table>
  </div>
</div>

<!-- Modal para adicionar provento -->
<div id="modalProvento" class="modal" style="display:none;">
  <div class="modal-content">
    <h2>Adicionar Provento</h2>
    <form id="formProvento">
      <label>Ativo: <input type="text" id="proventoAtivo" required></label>
      <label>Tipo:
        <select id="proventoTipo">
          <option value="Dividendo">Dividendo</option>
          <option value="JCP">JCP</option>
          <option value="Rendimento">Rendimento</option>
        </select>
      </label>
      <label>Valor Unitário: <input type="number" step="0.01" id="proventoValor" required></label>
      <label>Quantidade: <input type="number" id="proventoQtd" required></label>
      <label>Data COM: <input type="date" id="proventoDataCom" required></label>
      <label>Data Pagamento: <input type="date" id="proventoDataPgto" required></label>
      <button type="submit">Salvar</button>
      <button type="button" onclick="fecharModalProvento()">Cancelar</button>
    </form>
  </div>
</div>
```

### Passo 3: Criar Renderização

Criar arquivo `js/ui/proventos.js`:

```javascript
import { formatCurrency, formatQty } from '../utils/formatters.js';

export function renderProventos(proventos) {
  const tbody = document.getElementById('proventosBody');

  tbody.innerHTML = proventos.map(p => `
    <tr>
      <td>${p.dataPagamento}</td>
      <td><strong>${p.ativo}</strong></td>
      <td><span class="badge">${p.tipo}</span></td>
      <td class="num-col">${formatCurrency(p.valor)}</td>
      <td class="num-col">${formatQty(p.quantidade)}</td>
      <td class="num-col profit">${formatCurrency(p.total)}</td>
      <td>
        <button onclick="editarProvento(${p.id})">✏️</button>
        <button onclick="excluirProvento(${p.id})">🗑️</button>
      </td>
    </tr>
  `).join('');

  renderProventosSummary(proventos);
}

function renderProventosSummary(proventos) {
  const total = proventos.reduce((sum, p) => sum + p.total, 0);
  const dividendos = proventos.filter(p => p.tipo === 'Dividendo').reduce((sum, p) => sum + p.total, 0);
  const jcp = proventos.filter(p => p.tipo === 'JCP').reduce((sum, p) => sum + p.total, 0);

  document.getElementById('proventosSummary').innerHTML = `
    <div class="card positive">
      <h3>💰 Total Proventos</h3>
      <div class="value">${formatCurrency(total)}</div>
    </div>
    <div class="card positive">
      <h3>📊 Dividendos</h3>
      <div class="value">${formatCurrency(dividendos)}</div>
    </div>
    <div class="card positive">
      <h3>💼 JCP</h3>
      <div class="value">${formatCurrency(jcp)}</div>
    </div>
  `;
}
```

### Passo 4: Integrar ao Lucro Total

Modificar em `PortfolioAnalyzer.js`:

```javascript
getSummary(prices, fixed, proventosManager) {
  // ... código existente ...

  const totalProventos = proventosManager ? proventosManager.getTotalProventos() : 0;

  return {
    // ... campos existentes ...
    totalProventos: totalProventos,
    profit: profit + totalProventos, // Adiciona proventos ao lucro
  };
}
```

---

## 2. Renda Fixa

### Passo 1: Estender Modelo

Modificar `carteira-export.xlsx` para incluir:
- Coluna "Indexador" (CDI, IPCA, Prefixado, Selic)
- Coluna "Taxa" (ex: 110% do CDI, ou 12% a.a.)
- Coluna "Vencimento"
- Coluna "Liquidez" (Diária, No Vencimento)

### Passo 2: Calcular Rentabilidade

Criar `js/utils/rendaFixa.js`:

```javascript
export function calcularRendimentoCDB(valorInicial, taxa, diasCorridos, cdiAtual = 13.65) {
  // Taxa em % do CDI
  const taxaEfetiva = (cdiAtual / 100) * (taxa / 100);
  const diasAno = 252; // dias úteis
  const rendimento = valorInicial * Math.pow(1 + taxaEfetiva, diasCorridos / diasAno) - valorInicial;

  // Descontar IR (regressivo)
  const ir = calcularIR(rendimento, diasCorridos);

  return rendimento - ir;
}

function calcularIR(rendimento, dias) {
  let aliquota;
  if (dias <= 180) aliquota = 0.225;
  else if (dias <= 360) aliquota = 0.20;
  else if (dias <= 720) aliquota = 0.175;
  else aliquota = 0.15;

  return rendimento * aliquota;
}

export function calcularTesouroDireto(tipo, valorInicial, taxa, diasCorridos, inflacao = 5.0) {
  switch(tipo) {
    case 'Selic':
      return calcularRendimentoCDB(valorInicial, 100, diasCorridos, taxa);
    case 'IPCA+':
      // taxa = inflação + taxa fixa
      const taxaTotal = inflacao + taxa;
      return calcularRendimentoCDB(valorInicial, 100, diasCorridos, taxaTotal);
    case 'Prefixado':
      const rendimento = valorInicial * Math.pow(1 + taxa/100, diasCorridos/252) - valorInicial;
      return rendimento - calcularIR(rendimento, diasCorridos);
  }
}
```

---

## 3. Backend + Banco de Dados

### Estrutura de Pastas

```
swing-trade/
├── frontend/          (código atual)
│   ├── index.html
│   ├── styles.css
│   └── js/
└── backend/
    ├── package.json
    ├── .env
    ├── server.js
    └── src/
        ├── config/
        │   └── database.js
        ├── models/
        │   ├── Transaction.js
        │   ├── Asset.js
        │   └── Provento.js
        ├── routes/
        │   ├── transactions.js
        │   ├── assets.js
        │   └── proventos.js
        ├── controllers/
        │   ├── transactionController.js
        │   ├── assetController.js
        │   └── proventoController.js
        └── services/
            └── portfolioService.js
```

### Backend - package.json

```json
{
  "name": "swing-trade-api",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.3",
    "sequelize": "^6.35.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### Backend - server.js

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import transactionRoutes from './src/routes/transactions.js';
import assetRoutes from './src/routes/assets.js';
import proventoRoutes from './src/routes/proventos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/transactions', transactionRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/proventos', proventoRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
```

### Modelo - Transaction

```javascript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Transaction = sequelize.define('Transaction', {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  asset: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('C', 'V'),
    allowNull: false
  },
  quantity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  category: {
    type: DataTypes.STRING
  },
  corretagem: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  taxas: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  }
});

export default Transaction;
```

### Controller

```javascript
import Transaction from '../models/Transaction.js';

export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      order: [['date', 'ASC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.create(req.body);
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    await Transaction.destroy({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

### Integração Frontend

Modificar `js/data/dataLoader.js`:

```javascript
const API_URL = 'http://localhost:3000/api';

export async function loadFromAPI() {
  try {
    const response = await fetch(`${API_URL}/transactions`);
    const transactions = await response.json();
    processData(transactions);
  } catch (error) {
    console.error('Erro ao carregar do servidor:', error);
    // Fallback para planilha local
    loadExcel();
  }
}

export async function saveTransaction(transaction) {
  const response = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction)
  });
  return response.json();
}
```

---

## Configuração do Banco

### PostgreSQL

```sql
CREATE DATABASE swing_trade;

\c swing_trade;

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  asset VARCHAR(20) NOT NULL,
  type CHAR(1) CHECK (type IN ('C', 'V')),
  quantity DECIMAL(10, 2) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  corretagem DECIMAL(10, 2) DEFAULT 0,
  taxas DECIMAL(10, 2) DEFAULT 0,
  impostos DECIMAL(10, 2) DEFAULT 0,
  irrf DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE proventos (
  id SERIAL PRIMARY KEY,
  asset VARCHAR(20) NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  quantidade DECIMAL(10, 2) NOT NULL,
  data_com DATE NOT NULL,
  data_pagamento DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📝 Ordem de Implementação Recomendada

1. ✅ **Proventos** - Mais simples, apenas adiciona funcionalidade
2. ✅ **Renda Fixa** - Complexidade média, estende modelo existente
3. ✅ **Backend + DB** - Mais complexo, mas torna o sistema profissional

Cada funcionalidade pode ser implementada de forma independente!
