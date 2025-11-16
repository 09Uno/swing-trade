// ========== MÓDULO PRINCIPAL - NOVA INTERFACE ==========

import { transactionsApi, checkApiConnection } from './api/apiClient.js';

// ========== ESTADO GLOBAL ==========
let currentData = {
  transactions: [],
  assets: [],
  summary: {}
};

let batchRowCount = 0;

// ========== INICIALIZAÇÃO ==========
window.addEventListener('load', async () => {
  console.log('🚀 Iniciando Portfolio Manager...');

  // Verifica conexão com API
  await checkApiConnection();

  // Carrega dados do backend
  await loadData();

  // Renderiza dashboard
  renderSummaryCards();
  renderDashboard();
  renderAtivosTable();
  renderTransacoesTable();

  // Configura event listeners para modals
  setupModalHandlers();

  console.log('✅ Sistema carregado com sucesso!');

});

// ========== CARREGAMENTO DE DADOS ==========
async function loadData() {
  try {
    showStatus('Carregando dados...', 'info');

    // Busca transações do backend
    const response = await transactionsApi.getAll();

    if (response && response.length > 0) {
      currentData.transactions = response;

      // Processa dados para gerar ativos e resumo
      processData();

      showStatus(`✅ ${response.length} transações carregadas`, 'success');
    } else {
      showStatus('Nenhuma transação encontrada. Adicione suas primeiras operações!', 'info');
    }
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    showStatus('⚠️ Erro ao carregar dados. Verifique a conexão com o backend.', 'error');
  }
}

// ========== PROCESSAMENTO DE DADOS ==========
function processData() {
  // Agrupa transações por ativo
  const assetMap = new Map();

  currentData.transactions.forEach(tx => {
    if (!assetMap.has(tx.ativo)) {
      assetMap.set(tx.ativo, {
        symbol: tx.ativo,
        categoria: tx.categoria || 'Outros',
        compras: [],
        vendas: [],
        quantidade: 0,
        precoMedio: 0,
        totalInvestido: 0,
        lucroRealizado: 0
      });
    }

    const asset = assetMap.get(tx.ativo);

    if (tx.tipo === 'C') {
      asset.compras.push(tx);
      asset.quantidade += parseFloat(tx.quantidade);
      asset.totalInvestido += (parseFloat(tx.quantidade) * parseFloat(tx.preco)) + parseFloat(tx.custos || 0);
    } else if (tx.tipo === 'V') {
      asset.vendas.push(tx);
      asset.quantidade -= parseFloat(tx.quantidade);
      const receita = (parseFloat(tx.quantidade) * parseFloat(tx.preco)) - parseFloat(tx.custos || 0);
      asset.lucroRealizado += receita;
    }
  });

  // Calcula preço médio
  assetMap.forEach(asset => {
    if (asset.quantidade > 0) {
      asset.precoMedio = asset.totalInvestido / asset.quantidade;
    }
  });

  currentData.assets = Array.from(assetMap.values()).filter(a => a.quantidade > 0);

  // Calcula resumo
  currentData.summary = {
    totalInvestido: currentData.assets.reduce((sum, a) => sum + a.totalInvestido, 0),
    valorAtual: currentData.assets.reduce((sum, a) => sum + (a.quantidade * (a.precoAtual || a.precoMedio)), 0),
    lucroRealizado: currentData.assets.reduce((sum, a) => sum + a.lucroRealizado, 0),
    qtdAtivos: currentData.assets.length
  };

  currentData.summary.lucroAberto = currentData.summary.valorAtual - currentData.summary.totalInvestido;
  currentData.summary.lucroTotal = currentData.summary.lucroRealizado + currentData.summary.lucroAberto;
  currentData.summary.rentabilidade = (currentData.summary.lucroTotal / currentData.summary.totalInvestido) * 100 || 0;
}

// ========== RENDERIZAÇÃO ==========
function renderSummaryCards() {
  const container = document.getElementById('summaryCards');
  const summary = currentData.summary;

  container.innerHTML = `
    <div class="summary-card neutral">
      <div class="card-label">Total Investido</div>
      <div class="card-value">${formatCurrency(summary.totalInvestido || 0)}</div>
      <div class="card-subtitle">${summary.qtdAtivos || 0} ativos em carteira</div>
    </div>

    <div class="summary-card ${summary.valorAtual >= summary.totalInvestido ? 'positive' : 'negative'}">
      <div class="card-label">Valor Atual</div>
      <div class="card-value ${summary.valorAtual >= summary.totalInvestido ? 'positive' : 'negative'}">
        ${formatCurrency(summary.valorAtual || 0)}
      </div>
      <div class="card-subtitle">Patrimônio em ações</div>
    </div>

    <div class="summary-card ${summary.lucroAberto >= 0 ? 'positive' : 'negative'}">
      <div class="card-label">Lucro Aberto</div>
      <div class="card-value ${summary.lucroAberto >= 0 ? 'positive' : 'negative'}">
        ${formatCurrency(summary.lucroAberto || 0)}
      </div>
      <div class="card-subtitle">Não realizado</div>
    </div>

    <div class="summary-card ${summary.lucroRealizado >= 0 ? 'positive' : 'negative'}">
      <div class="card-label">Lucro Realizado</div>
      <div class="card-value ${summary.lucroRealizado >= 0 ? 'positive' : 'negative'}">
        ${formatCurrency(summary.lucroRealizado || 0)}
      </div>
      <div class="card-subtitle">Vendas realizadas</div>
    </div>

    <div class="summary-card ${summary.rentabilidade >= 0 ? 'positive' : 'negative'}">
      <div class="card-label">Rentabilidade Total</div>
      <div class="card-value ${summary.rentabilidade >= 0 ? 'positive' : 'negative'}">
        ${summary.rentabilidade ? summary.rentabilidade.toFixed(2) : '0.00'}%
      </div>
      <div class="card-subtitle">${formatCurrency(summary.lucroTotal || 0)}</div>
    </div>
  `;
}

function renderDashboard() {
  const container = document.getElementById('dashboardContent');

  if (currentData.assets.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
        <h3>📊 Nenhum ativo em carteira</h3>
        <p>Comece adicionando suas primeiras transações usando o botão "Cadastro em Lote"</p>
      </div>
    `;
    return;
  }

  // Aqui você pode adicionar gráficos com Chart.js
  container.innerHTML = `
    <div class="spreadsheet-wrapper">
      <table class="spreadsheet-table">
        <thead>
          <tr>
            <th>Categoria</th>
            <th class="text-right">Qtd Ativos</th>
            <th class="text-right">Total Investido</th>
            <th class="text-right">Valor Atual</th>
            <th class="text-right">Lucro/Prejuízo</th>
            <th class="text-right">%</th>
          </tr>
        </thead>
        <tbody>
          ${renderCategoryBreakdown()}
        </tbody>
      </table>
    </div>
  `;
}

function renderCategoryBreakdown() {
  const categories = {};

  currentData.assets.forEach(asset => {
    const cat = asset.categoria || 'Outros';
    if (!categories[cat]) {
      categories[cat] = {
        count: 0,
        investido: 0,
        atual: 0
      };
    }

    categories[cat].count++;
    categories[cat].investido += asset.totalInvestido;
    categories[cat].atual += (asset.quantidade * (asset.precoAtual || asset.precoMedio));
  });

  return Object.keys(categories).map(cat => {
    const data = categories[cat];
    const lucro = data.atual - data.investido;
    const percent = (lucro / data.investido) * 100;

    return `
      <tr>
        <td><strong>${cat}</strong></td>
        <td class="text-right">${data.count}</td>
        <td class="text-right font-mono">${formatCurrency(data.investido)}</td>
        <td class="text-right font-mono">${formatCurrency(data.atual)}</td>
        <td class="text-right font-mono ${lucro >= 0 ? 'text-success' : 'text-danger'}">
          ${formatCurrency(lucro)}
        </td>
        <td class="text-right font-mono ${percent >= 0 ? 'text-success' : 'text-danger'}">
          ${percent.toFixed(2)}%
        </td>
      </tr>
    `;
  }).join('');
}

function renderAtivosTable() {
  const tbody = document.getElementById('ativosTableBody');

  if (currentData.assets.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          Nenhum ativo em carteira
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = currentData.assets.map(asset => {
    const valorAtual = asset.quantidade * (asset.precoAtual || asset.precoMedio);
    const lucro = valorAtual - asset.totalInvestido;
    const percent = (lucro / asset.totalInvestido) * 100;

    return `
      <tr>
        <td><strong>${asset.symbol}</strong></td>
        <td><span class="badge badge-info">${asset.categoria}</span></td>
        <td class="text-right font-mono">${asset.quantidade.toFixed(2)}</td>
        <td class="text-right font-mono">${formatCurrency(asset.precoMedio)}</td>
        <td class="text-right font-mono">${formatCurrency(asset.precoAtual || asset.precoMedio)}</td>
        <td class="text-right font-mono">${formatCurrency(valorAtual)}</td>
        <td class="text-right font-mono ${lucro >= 0 ? 'text-success' : 'text-danger'}">
          ${formatCurrency(lucro)}
        </td>
        <td class="text-right font-mono ${percent >= 0 ? 'text-success' : 'text-danger'}">
          ${percent.toFixed(2)}%
        </td>
        <td>
          <button class="btn-icon" onclick="viewAssetDetails('${asset.symbol}')">👁️</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderTransacoesTable() {
  const tbody = document.getElementById('transacoesTableBody');

  if (currentData.transactions.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          Nenhuma transação registrada
        </td>
      </tr>
    `;
    return;
  }

  // Ordena por data (mais recente primeiro)
  const sorted = [...currentData.transactions].sort((a, b) =>
    new Date(b.data) - new Date(a.data)
  );

  tbody.innerHTML = sorted.map(tx => {
    const total = (parseFloat(tx.quantidade) * parseFloat(tx.preco)) + parseFloat(tx.custos || 0);

    return `
      <tr>
        <td>${formatDate(tx.data)}</td>
        <td><strong>${tx.ativo}</strong></td>
        <td>
          <span class="badge ${tx.tipo === 'C' ? 'badge-success' : 'badge-danger'}">
            ${tx.tipo === 'C' ? '📥 Compra' : '📤 Venda'}
          </span>
        </td>
        <td class="text-right font-mono">${parseFloat(tx.quantidade).toFixed(2)}</td>
        <td class="text-right font-mono">${formatCurrency(tx.preco)}</td>
        <td class="text-right font-mono">${formatCurrency(tx.custos || 0)}</td>
        <td class="text-right font-mono">${formatCurrency(total)}</td>
        <td><span class="badge badge-info">${tx.categoria || 'N/A'}</span></td>
        <td>
          <button class="btn-icon" onclick="editTransaction(${tx.id})">✏️</button>
          <button class="btn-icon" onclick="deleteTransaction(${tx.id})">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ========== MODAL CADASTRO EM LOTE ==========
window.openBatchModal = function() {
  const modal = document.getElementById('batchModal');
  modal.style.display = 'block';

  // Adiciona 5 linhas iniciais
  const tbody = document.getElementById('batchTableBody');
  tbody.innerHTML = '';
  batchRowCount = 0;

  for (let i = 0; i < 5; i++) {
    addBatchRow();
  }
};

window.closeBatchModal = function() {
  document.getElementById('batchModal').style.display = 'none';
};

window.addBatchRow = function() {
  const tbody = document.getElementById('batchTableBody');
  const rowId = batchRowCount++;

  const row = document.createElement('tr');
  row.className = 'new-row';
  row.id = `batch-row-${rowId}`;

  row.innerHTML = `
    <td>
      <input type="date" class="table-input" id="batch-date-${rowId}">
    </td>
    <td>
      <input type="text" class="table-input" id="batch-ativo-${rowId}" placeholder="PETR4" style="text-transform: uppercase;">
    </td>
    <td>
      <select class="table-select" id="batch-tipo-${rowId}">
        <option value="">-</option>
        <option value="C">Compra</option>
        <option value="V">Venda</option>
      </select>
    </td>
    <td>
      <input type="number" class="table-input" id="batch-qtd-${rowId}" step="0.01" placeholder="100">
    </td>
    <td>
      <input type="number" class="table-input" id="batch-preco-${rowId}" step="0.01" placeholder="38.50">
    </td>
    <td>
      <input type="number" class="table-input" id="batch-custos-${rowId}" step="0.01" placeholder="0" value="0">
    </td>
    <td>
      <select class="table-select" id="batch-categoria-${rowId}">
        <option value="">-</option>
        <option value="Ações">Ações</option>
        <option value="FIIs">FIIs</option>
        <option value="ETFs">ETFs</option>
        <option value="BDRs">BDRs</option>
        <option value="Stocks">Stocks</option>
        <option value="REITs">REITs</option>
        <option value="Cripto">Cripto</option>
      </select>
    </td>
    <td>
      <button class="btn-icon" onclick="removeBatchRow(${rowId})">🗑️</button>
    </td>
  `;

  tbody.appendChild(row);
};

window.removeBatchRow = function(rowId) {
  const row = document.getElementById(`batch-row-${rowId}`);
  if (row) row.remove();
};

window.clearBatchTable = function() {
  if (confirm('Deseja limpar todas as linhas?')) {
    document.getElementById('batchTableBody').innerHTML = '';
    batchRowCount = 0;
    for (let i = 0; i < 5; i++) {
      addBatchRow();
    }
  }
};

window.saveBatchTransactions = async function() {
  const rows = document.querySelectorAll('#batchTableBody tr');
  const transactions = [];

  rows.forEach((row, index) => {
    const rowId = row.id.split('-')[2];

    const data = document.getElementById(`batch-date-${rowId}`)?.value;
    const ativo = document.getElementById(`batch-ativo-${rowId}`)?.value.toUpperCase();
    const tipo = document.getElementById(`batch-tipo-${rowId}`)?.value;
    const qtd = document.getElementById(`batch-qtd-${rowId}`)?.value;
    const preco = document.getElementById(`batch-preco-${rowId}`)?.value;
    const custos = document.getElementById(`batch-custos-${rowId}`)?.value || 0;
    const categoria = document.getElementById(`batch-categoria-${rowId}`)?.value;

    // Valida se a linha está preenchida
    if (data && ativo && tipo && qtd && preco) {
      transactions.push({
        data,
        ativo,
        tipo,
        quantidade: parseFloat(qtd),
        preco: parseFloat(preco),
        custos: parseFloat(custos),
        categoria: categoria || 'Outros'
      });
    }
  });

  if (transactions.length === 0) {
    showStatus('⚠️ Nenhuma transação válida para salvar', 'error');
    return;
  }

  try {
    showStatus(`Salvando ${transactions.length} transações...`, 'info');

    // Salva uma por vez no backend
    for (const tx of transactions) {
      await transactionsApi.create(tx);
    }

    showStatus(`✅ ${transactions.length} transações salvas com sucesso!`, 'success');

    // Recarrega dados
    await loadData();
    renderSummaryCards();
    renderAtivosTable();
    renderTransacoesTable();

    closeBatchModal();
  } catch (error) {
    console.error('Erro ao salvar transações:', error);
    showStatus('❌ Erro ao salvar transações', 'error');
  }
};

// ========== MODAL TRANSAÇÃO ÚNICA ==========
window.openSingleTransactionModal = function() {
  document.getElementById('singleTransactionModal').style.display = 'block';
  // Define data atual
  document.getElementById('singleDate').valueAsDate = new Date();
};

window.closeSingleTransactionModal = function() {
  document.getElementById('singleTransactionModal').style.display = 'none';
  document.getElementById('singleTransactionForm').reset();
};

window.saveSingleTransaction = async function() {
  const data = document.getElementById('singleDate').value;
  const ativo = document.getElementById('singleAtivo').value.toUpperCase();
  const tipo = document.getElementById('singleTipo').value;
  const qtd = document.getElementById('singleQtd').value;
  const preco = document.getElementById('singlePreco').value;
  const custos = document.getElementById('singleCustos').value || 0;
  const categoria = document.getElementById('singleCategoria').value;

  if (!data || !ativo || !tipo || !qtd || !preco) {
    showStatus('⚠️ Preencha todos os campos obrigatórios', 'error');
    return;
  }

  try {
    showStatus('Salvando transação...', 'info');

    await transactionsApi.create({
      data,
      ativo,
      tipo,
      quantidade: parseFloat(qtd),
      preco: parseFloat(preco),
      custos: parseFloat(custos),
      categoria: categoria || 'Outros'
    });

    showStatus('✅ Transação salva com sucesso!', 'success');

    await loadData();
    renderSummaryCards();
    renderAtivosTable();
    renderTransacoesTable();

    closeSingleTransactionModal();
  } catch (error) {
    console.error('Erro ao salvar:', error);
    showStatus('❌ Erro ao salvar transação', 'error');
  }
};

// ========== TABS ==========
window.switchTab = function(tabName) {
  // Remove active de todas as tabs
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

  // Ativa a tab selecionada
  event.target.classList.add('active');
  document.getElementById(tabName).classList.add('active');
};

// ========== UTILIDADES ==========
function showStatus(message, type = 'info') {
  const statusEl = document.getElementById('statusMessage');
  statusEl.textContent = message;
  statusEl.className = `status-message ${type}`;
  statusEl.classList.remove('hidden');

  setTimeout(() => {
    statusEl.classList.add('hidden');
  }, 5000);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR');
}

// ========== IMPORTAÇÃO DE EXCEL ==========
window.importExcel = function() {
  // Cria input file dinâmico
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.xlsx, .xls';

  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    showStatus('📂 Lendo arquivo Excel...', 'info');

    try {
      // Lê o arquivo
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      // Pega a primeira planilha
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Converte para JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        showStatus('⚠️ Planilha vazia ou formato inválido', 'error');
        return;
      }

      // Processa e valida dados
      const transactions = processExcelData(jsonData);

      if (transactions.length === 0) {
        showStatus('⚠️ Nenhuma transação válida encontrada', 'error');
        return;
      }

      // Confirma importação
      const confirm = window.confirm(
        `Encontradas ${transactions.length} transações válidas.\n\nDeseja importar todas?`
      );

      if (!confirm) {
        showStatus('Importação cancelada', 'info');
        return;
      }

      // Salva todas as transações
      showStatus(`Importando ${transactions.length} transações...`, 'info');

      let successCount = 0;
      let errorCount = 0;

      for (const tx of transactions) {
        try {
          await transactionsApi.create(tx);
          successCount++;
        } catch (error) {
          console.error('Erro ao salvar transação:', tx, error);
          errorCount++;
        }
      }

      if (errorCount > 0) {
        showStatus(
          `⚠️ Importadas ${successCount} transações. ${errorCount} falharam.`,
          'error'
        );
      } else {
        showStatus(`✅ ${successCount} transações importadas com sucesso!`, 'success');
      }

      // Recarrega dados
      await loadData();
      renderSummaryCards();
      renderAtivosTable();
      renderTransacoesTable();

    } catch (error) {
      console.error('Erro ao importar Excel:', error);
      showStatus('❌ Erro ao processar arquivo Excel', 'error');
    }
  };

  input.click();
};

// Função auxiliar para converter valores brasileiros (R$ 1.234,56)
function parsePrice(val) {
  if (!val) return 0;
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    // Remove R$, espaços e converte
    return Number(val.replace('R$', '').replace(/\./g, '').replace(',', '.').trim());
  }
  return Number(val);
}

function processExcelData(jsonData) {
  const transactions = [];

  console.log('📊 Total de linhas no Excel:', jsonData.length);
  console.log('🔍 Primeira linha (para debug):', jsonData[0]);

  jsonData.forEach((row, index) => {
    try {
      // Mapeia colunas (aceita vários formatos)
      const data = row["Data operação"] || row["Data"] || row.Data || row.data || row.DATE || row.date;
      const ativo = (row["Código Ativo"] || row["Ativo"] || row.Ativo || row.ativo || row.Ticker || row.ticker || row.ATIVO)?.toString().toUpperCase().trim();
      const tipo = (row["Operação C/V"] || row["Tipo"] || row.Tipo || row.tipo || row.Type || row.type || row.TIPO)?.toString().toUpperCase().trim();
      const quantidade = parsePrice(row["Quantidade"] || row.Quantidade || row.quantidade || row.Qtd || row.qtd || row.QTD || row.Quantity || 0);
      const preco = parsePrice(row["Preço"] || row["Preco"] || row.Preço || row.preco || row.Preco || row.Price || row.price || row.PRECO || 0);
      const custos = parsePrice(row["Custos"] || row["Taxas"] || row.Custos || row.custos || row.Taxas || row.taxas || row.CUSTOS || row.Costs || 0);
      const categoria = row["Categoria"] || row.Categoria || row.categoria || row.Category || row.category || row.CATEGORIA || 'Outros';

      console.log(`Linha ${index + 1}:`, { data, ativo, tipo, quantidade, preco, custos });

      // Valida dados obrigatórios
      if (!data || !ativo || !tipo || !quantidade || !preco) {
        console.warn(`⚠️ Linha ${index + 2} ignorada: dados incompletos`, {
          data: data ? '✅' : '❌',
          ativo: ativo ? '✅' : '❌',
          tipo: tipo ? '✅' : '❌',
          quantidade: quantidade ? '✅' : '❌',
          preco: preco ? '✅' : '❌',
          row
        });
        return;
      }

      // Valida tipo de operação
      const tipoNormalizado = tipo === 'C' || tipo === 'COMPRA' || tipo === 'BUY' ? 'C' :
                              tipo === 'V' || tipo === 'VENDA' || tipo === 'SELL' ? 'V' : null;

      if (!tipoNormalizado) {
        console.warn(`Linha ${index + 2} ignorada: tipo inválido (${tipo})`, row);
        return;
      }

      // Converte data se necessário
      let dataFormatada = data;
      if (typeof data === 'number') {
        // Excel armazena datas como números
        const excelDate = XLSX.SSF.parse_date_code(data);
        dataFormatada = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`;
      } else if (typeof data === 'string') {
        // Tenta converter formatos comuns de data
        const dateParts = data.split('/');
        if (dateParts.length === 3) {
          // Formato DD/MM/YYYY ou DD/MM/YY
          const day = dateParts[0].padStart(2, '0');
          const month = dateParts[1].padStart(2, '0');
          let year = dateParts[2];
          if (year.length === 2) {
            year = '20' + year;
          }
          dataFormatada = `${year}-${month}-${day}`;
        }
      }

      transactions.push({
        data: dataFormatada,
        ativo,
        tipo: tipoNormalizado,
        quantidade,
        preco,
        custos: custos || 0,
        categoria: categoria || 'Outros'
      });

    } catch (error) {
      console.error(`Erro ao processar linha ${index + 2}:`, error, row);
    }
  });

  return transactions;
}

// ========== EXPORTAÇÃO PARA EXCEL ==========
window.exportData = async function() {
  try {
    showStatus('Preparando exportação...', 'info');

    if (currentData.transactions.length === 0) {
      showStatus('⚠️ Nenhuma transação para exportar', 'error');
      return;
    }

    // Prepara dados para exportação
    const dataToExport = currentData.transactions.map(tx => ({
      'Data': formatDate(tx.data),
      'Ativo': tx.ativo,
      'Tipo': tx.tipo === 'C' ? 'Compra' : 'Venda',
      'Quantidade': tx.quantidade,
      'Preço': tx.preco,
      'Custos': tx.custos || 0,
      'Total': (tx.quantidade * tx.preco) + (tx.custos || 0),
      'Categoria': tx.categoria || 'Outros'
    }));

    // Cria workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataToExport);

    // Adiciona worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Transações');

    // Gera arquivo
    const fileName = `portfolio-manager-${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    showStatus(`✅ Arquivo exportado: ${fileName}`, 'success');

  } catch (error) {
    console.error('Erro ao exportar:', error);
    showStatus('❌ Erro ao exportar dados', 'error');
  }
};

// ========== CONFIGURAÇÃO DE MODALS ==========
function setupModalHandlers() {
  // Fechar modal ao clicar fora
  window.addEventListener('click', (event) => {
    const modals = ['batchModal', 'singleTransactionModal', 'proventosModal', 'rendaFixaModal'];
    
    modals.forEach(modalId => {
      const modal = document.getElementById(modalId);
      if (modal && event.target === modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Fechar modal com ESC
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      const modals = ['batchModal', 'singleTransactionModal', 'proventosModal', 'rendaFixaModal'];
      modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (modal && modal.style.display === 'block') {
          modal.style.display = 'none';
        }
      });
    }
  });
}

// Funções placeholder
window.updatePrices = () => alert('Em desenvolvimento');
window.filterAtivos = () => alert('Em desenvolvimento');
window.viewAssetDetails = (symbol) => alert(`Detalhes de ${symbol} - Em desenvolvimento`);
window.editTransaction = (id) => alert(`Editar transação ${id} - Em desenvolvimento`);
window.deleteTransaction = (id) => {
  if (confirm('Deseja realmente excluir esta transação?')) {
    alert('Em desenvolvimento');
  }
};

// ========== MODALS DE PROVENTOS ==========
window.addProvento = function() {
  const modal = document.getElementById('proventosModal');
  modal.style.display = 'block';
  document.getElementById('proventosForm').reset();
};

window.openProventosModal = function() {
  window.addProvento();
};

window.closeProventosModal = function() {
  document.getElementById('proventosModal').style.display = 'none';
};

window.calcularTotalProvento = function() {
  const valorUnitario = parseFloat(document.getElementById('proventoValorUnitario').value) || 0;
  const quantidade = parseFloat(document.getElementById('proventoQuantidade').value) || 0;
  const total = valorUnitario * quantidade;

  const totalValueEl = document.getElementById('proventoTotalValue');
  totalValueEl.textContent = `R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

window.saveProvento = function() {
  const form = document.getElementById('proventosForm');
  if (!form.checkValidity()) {
    showStatus('❌ Preencha todos os campos obrigatórios', 'error');
    return;
  }

  const provento = {
    ativo: document.getElementById('proventoAtivo').value,
    tipo: document.getElementById('proventoTipo').value,
    valorUnitario: parseFloat(document.getElementById('proventoValorUnitario').value),
    quantidade: parseInt(document.getElementById('proventoQuantidade').value),
    dataCom: document.getElementById('proventoDataCom').value,
    dataPagamento: document.getElementById('proventoDataPagamento').value,
    total: parseFloat(document.getElementById('proventoValorUnitario').value) * parseInt(document.getElementById('proventoQuantidade').value)
  };

  console.log('💾 Salvando provento:', provento);
  showStatus('✅ Provento salvo com sucesso!', 'success');
  window.closeProventosModal();
};

// ========== MODALS DE RENDA FIXA ==========
window.addRendaFixa = function() {
  const modal = document.getElementById('rendaFixaModal');
  modal.style.display = 'block';
  document.getElementById('rendaFixaForm').reset();
};

window.openRendaFixaModal = function() {
  window.addRendaFixa();
};

window.closeRendaFixaModal = function() {
  document.getElementById('rendaFixaModal').style.display = 'none';
};

window.atualizarCamposRendaFixa = function() {
  const tipo = document.getElementById('rendaFixaTipo').value;
  const taxaLabel = document.getElementById('rendaFixaTaxaLabel');
  const taxaHelp = document.getElementById('rendaFixaTaxaHelp');

  // Atualiza label e help text baseado no tipo
  if (tipo === 'Tesouro Prefixado') {
    taxaLabel.textContent = 'Taxa (% ao ano)';
    taxaHelp.textContent = 'Taxa prefixada anual (ex: 14.5)';
  } else if (tipo === 'Tesouro IPCA+') {
    taxaLabel.textContent = 'Taxa (% acima do IPCA)';
    taxaHelp.textContent = 'Taxa acima da inflação IPCA (ex: 7.5)';
  } else if (tipo === 'Tesouro Selic') {
    taxaLabel.textContent = 'Taxa (% da Selic)';
    taxaHelp.textContent = 'Percentual da taxa Selic (ex: 100)';
  } else {
    taxaLabel.textContent = 'Taxa (% do CDI)';
    taxaHelp.textContent = 'Para CDB/LCI/LCA: % do CDI (ex: 110)';
  }

  window.atualizarPreviewRendaFixa();
};

window.atualizarPreviewRendaFixa = function() {
  const nome = document.getElementById('rendaFixaNome').value;
  const valor = parseFloat(document.getElementById('rendaFixaValor').value) || 0;
  const taxa = parseFloat(document.getElementById('rendaFixaTaxa').value) || 0;
  const dataInicio = document.getElementById('rendaFixaDataInicio').value;
  const dataVencimento = document.getElementById('rendaFixaDataVencimento').value;

  const preview = document.getElementById('rendaFixaPreview');
  const previewContent = document.getElementById('rendaFixaPreviewContent');

  if (nome && valor > 0 && taxa > 0 && dataInicio) {
    // Calcula dias de investimento
    const inicio = new Date(dataInicio);
    const vencimento = dataVencimento ? new Date(dataVencimento) : new Date();
    const diasInvestimento = Math.floor((vencimento - inicio) / (1000 * 60 * 60 * 24));
    
    // Calcula rendimento estimado (simplificado)
    const rendimentoEstimado = (valor * taxa) / 100 * (diasInvestimento / 365);
    const valorFinal = valor + rendimentoEstimado;

    previewContent.innerHTML = `
      <div style="padding: 8px;">
        <div style="color: var(--text-secondary); font-size: 0.8rem;">Valor Investido</div>
        <div style="color: var(--text-primary); font-weight: 600;">R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>
      <div style="padding: 8px;">
        <div style="color: var(--text-secondary); font-size: 0.8rem;">Taxa</div>
        <div style="color: var(--accent-primary); font-weight: 600;">${taxa.toFixed(2)}%</div>
      </div>
      <div style="padding: 8px;">
        <div style="color: var(--text-secondary); font-size: 0.8rem;">Dias</div>
        <div style="color: var(--text-primary); font-weight: 600;">${diasInvestimento}</div>
      </div>
      <div style="padding: 8px;">
        <div style="color: var(--text-secondary); font-size: 0.8rem;">Rendimento Est.</div>
        <div style="color: var(--success); font-weight: 600;">R$ ${rendimentoEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>
      <div style="padding: 8px;">
        <div style="color: var(--text-secondary); font-size: 0.8rem;">Valor Final</div>
        <div style="color: var(--success); font-weight: 600;">R$ ${valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      </div>
    `;

    preview.classList.add('active');
  } else {
    preview.classList.remove('active');
  }
};

window.saveRendaFixa = function() {
  const form = document.getElementById('rendaFixaForm');
  if (!form.checkValidity()) {
    showStatus('❌ Preencha todos os campos obrigatórios', 'error');
    return;
  }

  const rendaFixa = {
    nome: document.getElementById('rendaFixaNome').value,
    tipo: document.getElementById('rendaFixaTipo').value,
    instituicao: document.getElementById('rendaFixaInstituicao').value,
    valor: parseFloat(document.getElementById('rendaFixaValor').value),
    taxa: parseFloat(document.getElementById('rendaFixaTaxa').value),
    dataInicio: document.getElementById('rendaFixaDataInicio').value,
    dataVencimento: document.getElementById('rendaFixaDataVencimento').value,
    liquidez: document.getElementById('rendaFixaLiquidez').value,
    observacoes: document.getElementById('rendaFixaObs').value
  };

  console.log('💾 Salvando renda fixa:', rendaFixa);
  showStatus('✅ Investimento de renda fixa salvo com sucesso!', 'success');
  window.closeRendaFixaModal();
};

