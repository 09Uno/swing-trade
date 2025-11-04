// ========== RENDA FIXA UI ==========

import { formatCurrency, formatPercent } from '../utils/formatters.js';
import { createPaginator } from '../utils/pagination.js';

let paginatorRendaFixa = null;

export function renderRendaFixa(investimentos, manager) {
  try {
    const filtered = applyRendaFixaFilters(investimentos, manager);
    renderRendaFixaSummary(filtered, manager);
    renderRendaFixaCharts(filtered, manager);

    // Paginação para a tabela
    if (!paginatorRendaFixa) {
      paginatorRendaFixa = createPaginator('paginationRendaFixa', [10, 25, 50, 100]);
      paginatorRendaFixa.setRenderCallback(renderRendaFixaTable);
    }

    if (filtered.length > 10) {
      paginatorRendaFixa.setItems(filtered).render();
    } else {
      renderRendaFixaTable(filtered);
      const paginationContainer = document.getElementById('paginationRendaFixa');
      if (paginationContainer) paginationContainer.innerHTML = '';
    }
  } catch (error) {
    console.error('Erro ao renderizar renda fixa:', error);
  }
}

function applyRendaFixaFilters(investimentos, manager) {
  const tipoFilter = document.getElementById('filterTipoRendaFixa');
  const statusFilter = document.getElementById('filterStatusRendaFixa');

  if (!tipoFilter || !statusFilter) return investimentos;

  const tipo = tipoFilter.value;
  const status = statusFilter.value;

  return investimentos.filter(inv => {
    const matchTipo = tipo === '' || inv.tipo === tipo;
    const matchStatus = status === '' ||
      (status === 'ativo' && inv.ativo) ||
      (status === 'resgatado' && !inv.ativo);

    return matchTipo && matchStatus;
  });
}

function renderRendaFixaSummary(investimentos, manager) {
  const container = document.getElementById('rendaFixaSummaryCards');
  if (!container) return;

  const stats = manager.getEstatisticas();

  let totalInvestido = 0;
  let totalAtual = 0;
  let totalRendimento = 0;

  investimentos.forEach(inv => {
    const calc = manager.calcularInvestimento(inv);
    totalInvestido += calc.valorInicial;
    totalAtual += calc.totalLiquido;
    totalRendimento += calc.rendimentoLiquido;
  });

  const rentabilidadeMedia = totalInvestido > 0 ? (totalRendimento / totalInvestido) * 100 : 0;

  container.innerHTML = `
    <div class="stat-card">
      <div class="stat-label">💰 Total Investido</div>
      <div class="stat-value">${formatCurrency(totalInvestido)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">📈 Valor Atual</div>
      <div class="stat-value profit">${formatCurrency(totalAtual)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">💵 Rendimento Total</div>
      <div class="stat-value ${totalRendimento >= 0 ? 'profit' : 'loss'}">${formatCurrency(totalRendimento)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">📊 Rentabilidade Média</div>
      <div class="stat-value ${rentabilidadeMedia >= 0 ? 'profit' : 'loss'}">${formatPercent(rentabilidadeMedia)}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">🏦 Investimentos Ativos</div>
      <div class="stat-value">${stats.totalAtivos}</div>
    </div>
  `;
}

function renderRendaFixaCharts(investimentos, manager) {
  renderComposicaoChart(investimentos, manager);
  renderProjecaoChart(investimentos, manager);
}

function renderComposicaoChart(investimentos, manager) {
  const canvas = document.getElementById('rendaFixaComposicaoChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Destroi chart anterior se existir
  if (window.rendaFixaComposicaoChartInstance) {
    window.rendaFixaComposicaoChartInstance.destroy();
  }

  // Agrupa por tipo
  const byTipo = {};
  investimentos.forEach(inv => {
    if (inv.ativo) {
      const calc = manager.calcularInvestimento(inv);
      if (!byTipo[inv.tipo]) byTipo[inv.tipo] = 0;
      byTipo[inv.tipo] += calc.totalLiquido;
    }
  });

  const labels = Object.keys(byTipo);
  const data = Object.values(byTipo);

  if (labels.length === 0) {
    canvas.style.display = 'none';
    return;
  }

  canvas.style.display = 'block';

  const colors = [
    '#2ecc71', '#3498db', '#9b59b6', '#e74c3c',
    '#f39c12', '#1abc9c', '#34495e', '#e67e22'
  ];

  window.rendaFixaComposicaoChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#0d1117',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#c9d1d9', font: { size: 12 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = formatCurrency(context.parsed);
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percent = ((context.parsed / total) * 100).toFixed(2);
              return `${label}: ${value} (${percent}%)`;
            }
          }
        }
      }
    }
  });
}

function renderProjecaoChart(investimentos, manager) {
  const canvas = document.getElementById('rendaFixaProjecaoChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Destroi chart anterior se existir
  if (window.rendaFixaProjecaoChartInstance) {
    window.rendaFixaProjecaoChartInstance.destroy();
  }

  const ativos = investimentos.filter(inv => inv.ativo);
  if (ativos.length === 0) {
    canvas.style.display = 'none';
    return;
  }

  canvas.style.display = 'block';

  // Projeção para os próximos 12 meses
  const meses = [];
  const valores = [];

  for (let i = 0; i <= 12; i++) {
    const mes = new Date();
    mes.setMonth(mes.getMonth() + i);
    meses.push(mes.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }));

    let totalMes = 0;
    ativos.forEach(inv => {
      const projecao = manager.projetarRendimento(inv, i * 30);
      totalMes += projecao.totalLiquido;
    });
    valores.push(totalMes);
  }

  window.rendaFixaProjecaoChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: meses,
      datasets: [{
        label: 'Projeção de Valor',
        data: valores,
        borderColor: '#2ecc71',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: { color: '#c9d1d9', font: { size: 12 } }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Valor: ' + formatCurrency(context.parsed.y);
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          ticks: { color: '#8b949e' },
          grid: { color: '#21262d' }
        },
        x: {
          ticks: { color: '#8b949e' },
          grid: { color: '#21262d' }
        }
      }
    }
  });
}

function renderRendaFixaTable(items) {
  const tbody = document.getElementById('rendaFixaBody');
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#8b949e;">Nenhum investimento encontrado</td></tr>';
    return;
  }

  // Precisa do manager para calcular
  const manager = window.rendaFixaManager;
  if (!manager) return;

  tbody.innerHTML = items.map(inv => {
    const calc = manager.calcularInvestimento(inv);
    const rentabilidade = calc.valorInicial > 0 ? (calc.rendimentoLiquido / calc.valorInicial) * 100 : 0;
    const statusClass = inv.ativo ? 'badge-ativo' : 'badge-resgatado';
    const statusText = inv.ativo ? 'Ativo' : 'Resgatado';

    return `<tr>
      <td><strong>${inv.nome || inv.tipo}</strong></td>
      <td><span class="badge ${statusClass}">${statusText}</span></td>
      <td>${inv.tipo}</td>
      <td class="num-col">${formatCurrency(calc.valorInicial)}</td>
      <td class="num-col">${inv.taxa}% ${inv.indexador ? `do ${inv.indexador}` : ''}</td>
      <td>${inv.dataInicio}</td>
      <td class="num-col">${calc.diasCorridos} dias</td>
      <td class="num-col profit">${formatCurrency(calc.rendimentoLiquido)}</td>
      <td class="num-col profit">${formatCurrency(calc.totalLiquido)}</td>
      <td class="num-col ${rentabilidade >= 0 ? 'profit' : 'loss'}">${formatPercent(rentabilidade)}</td>
      <td>
        <button class="btn-icon" onclick="editarRendaFixa(${inv.id})" title="Editar">✏️</button>
        ${inv.ativo ?
          `<button class="btn-icon" onclick="resgatarRendaFixa(${inv.id})" title="Resgatar">💰</button>` :
          `<button class="btn-icon" onclick="excluirRendaFixa(${inv.id})" title="Excluir">🗑️</button>`
        }
      </td>
    </tr>`;
  }).join('');
}

export function filterRendaFixa() {
  const manager = window.rendaFixaManager;
  if (!manager) return;

  const investimentos = manager.getInvestimentos();
  renderRendaFixa(investimentos, manager);
}
