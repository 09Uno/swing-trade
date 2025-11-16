// ========== RENDERIZAÇÃO DE PROVENTOS ==========

import { formatCurrency, formatQty, formatPercent } from '../utils/formatters.js';
import { createPaginator } from '../utils/pagination.js';

let paginatorProventos = null;
let proventosChartInstance = null;

export function renderProventos(proventos, proventosManager) {
  console.log('[PROVENTOS] renderProventos chamado com', proventos.length, 'itens');
  
  // Aplica filtros
  const filtered = applyProventosFilters(proventos);
  console.log('[PROVENTOS] Após filtros:', filtered.length, 'itens');

  try {
    // Renderiza summary cards
    renderProventosSummary(proventosManager);

    // Renderiza gráfico
    renderProventosChart(proventos, proventosManager);
  } catch (error) {
    console.error('Erro ao renderizar proventos:', error);
  }

  // Inicializa paginação
  if (!paginatorProventos) {
    paginatorProventos = createPaginator('paginationProventos', [10, 25, 50, 100]);
    paginatorProventos.setRenderCallback(renderProventosTable);
  }

  // Se tiver mais de 10 itens, usa paginação
  if (filtered.length > 10) {
    console.log('[PROVENTOS] Usando paginação');
    paginatorProventos.setItems(filtered).render();
  } else {
    console.log('[PROVENTOS] Renderizando tabela direto com', filtered.length, 'itens');
    renderProventosTable(filtered);
    document.getElementById('paginationProventos').innerHTML = '';
  }
}

function applyProventosFilters(proventos) {
  const filterAtivoEl = document.getElementById('filterProventoAtivo');
  const filterTipoEl = document.getElementById('filterProventoTipo');
  const filterInicioEl = document.getElementById('filterProventoInicio');
  const filterFimEl = document.getElementById('filterProventoFim');

  if (!filterAtivoEl || !filterTipoEl || !filterInicioEl || !filterFimEl) {
    return proventos; // Retorna todos se elementos não existem
  }

  const filterAtivo = filterAtivoEl.value.toUpperCase().trim();
  const filterTipo = filterTipoEl.value;
  const filterInicio = filterInicioEl.value;
  const filterFim = filterFimEl.value;

  return proventos.filter(p => {
    const matchAtivo = !filterAtivo || p.ativo.includes(filterAtivo);
    const matchTipo = !filterTipo || p.tipo === filterTipo;

    let matchPeriodo = true;
    if (filterInicio || filterFim) {
      const dataPgto = new Date(p.dataPagamento);
      if (filterInicio) {
        matchPeriodo = matchPeriodo && dataPgto >= new Date(filterInicio);
      }
      if (filterFim) {
        matchPeriodo = matchPeriodo && dataPgto <= new Date(filterFim);
      }
    }

    return matchAtivo && matchTipo && matchPeriodo;
  });
}

function renderProventosTable(items) {
  const tbody = document.getElementById('proventosBody');
  console.log('[PROVENTOS TABLE] Renderizando tabela com', items.length, 'itens. tbody existe?', !!tbody);

  if (!tbody) {
    console.error('[PROVENTOS TABLE] Element proventosBody não encontrado!');
    return;
  }

  if (items.length === 0) {
    console.log('[PROVENTOS TABLE] Nenhum item, mostrando mensagem vazia');
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="empty-state">
          <div class="empty-state-icon">📊</div>
          <div class="empty-state-text">Nenhum provento cadastrado</div>
          <div class="empty-state-hint">Comece adicionando seu primeiro provento</div>
          <button onclick="abrirModalProvento()" class="btn btn-primary" style="margin-top:20px;">➕ Adicionar Primeiro Provento</button>
        </td>
      </tr>
    `;
    return;
  }

  console.log('[PROVENTOS TABLE] Renderizando', items.length, 'itens');
  tbody.innerHTML = items.map(p => {
    const badgeClass = p.tipo === 'Dividendo' ? 'badge-dividendo' : p.tipo === 'JCP' ? 'badge-jcp' : 'badge-rendimento';
    const dataCom = formatarData(p.dataCom);
    const dataPgto = formatarData(p.dataPagamento);

    return `
      <tr>
        <td>${dataPgto}</td>
        <td>${dataCom}</td>
        <td><strong>${p.ativo}</strong></td>
        <td><span class="badge ${badgeClass}">${p.tipo}</span></td>
        <td class="num-col">${formatCurrency(p.valorUnitario)}</td>
        <td class="num-col">${formatQty(p.quantidade)}</td>
        <td class="num-col profit"><strong>${formatCurrency(p.total)}</strong></td>
        <td>
          <button onclick="editarProventoModal(${p.id})" class="btn-icon" title="Editar">✏️</button>
          <button onclick="excluirProventoConfirm(${p.id})" class="btn-icon" title="Excluir">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

function renderProventosSummary(proventosManager) {
  const stats = proventosManager.getEstatisticas();
  const container = document.getElementById('proventosSummaryCards');

  container.innerHTML = `
    <div class="card positive">
      <h3>💰 Total Proventos</h3>
      <div class="value">${formatCurrency(stats.total)}</div>
      <div style="font-size:.85em;margin-top:5px;color:#8b949e;">${stats.quantidade} lançamentos</div>
    </div>
    <div class="card positive">
      <h3>📊 Dividendos</h3>
      <div class="value">${formatCurrency(stats.dividendos)}</div>
      <div style="font-size:.85em;margin-top:5px;color:#8b949e;">${formatPercent((stats.dividendos / stats.total) * 100)}</div>
    </div>
    <div class="card positive">
      <h3>💼 JCP</h3>
      <div class="value">${formatCurrency(stats.jcp)}</div>
      <div style="font-size:.85em;margin-top:5px;color:#8b949e;">${formatPercent((stats.jcp / stats.total) * 100)}</div>
    </div>
    <div class="card positive">
      <h3>🏦 Rendimentos</h3>
      <div class="value">${formatCurrency(stats.rendimentos)}</div>
      <div style="font-size:.85em;margin-top:5px;color:#8b949e;">${formatPercent((stats.rendimentos / stats.total) * 100)}</div>
    </div>
    ${stats.ranking.length > 0 ? `
    <div class="card neutral">
      <h3>🏆 Maior Pagador</h3>
      <div class="value" style="font-size:1.2em;">${stats.ranking[0].ativo}</div>
      <div style="font-size:.85em;margin-top:5px;color:#8b949e;">${formatCurrency(stats.ranking[0].total)}</div>
    </div>
    ` : ''}
  `;
}

function renderProventosChart(proventos, proventosManager) {
  const canvas = document.getElementById('proventosChart');
  const container = document.getElementById('proventosChartContainer');

  if (!canvas || proventos.length === 0) {
    container.style.display = 'none';
    return;
  }

  // Agrupa por mês
  const porMes = {};
  proventos.forEach(p => {
    const data = new Date(p.dataPagamento);
    const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

    if (!porMes[mesAno]) {
      porMes[mesAno] = { total: 0, dividendos: 0, jcp: 0, rendimentos: 0 };
    }

    porMes[mesAno].total += p.total;
    if (p.tipo === 'Dividendo') porMes[mesAno].dividendos += p.total;
    else if (p.tipo === 'JCP') porMes[mesAno].jcp += p.total;
    else porMes[mesAno].rendimentos += p.total;
  });

  // Ordena por data
  const meses = Object.keys(porMes).sort();
  const labels = meses.map(m => {
    const [ano, mes] = m.split('-');
    return `${mes}/${ano}`;
  });

  const dataDividendos = meses.map(m => porMes[m].dividendos);
  const dataJCP = meses.map(m => porMes[m].jcp);
  const dataRendimentos = meses.map(m => porMes[m].rendimentos);

  // Destrói gráfico anterior
  if (proventosChartInstance) {
    proventosChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  proventosChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Dividendos',
          data: dataDividendos,
          backgroundColor: '#2ecc71',
          borderColor: '#27ae60',
          borderWidth: 1
        },
        {
          label: 'JCP',
          data: dataJCP,
          backgroundColor: '#3498db',
          borderColor: '#2980b9',
          borderWidth: 1
        },
        {
          label: 'Rendimentos',
          data: dataRendimentos,
          backgroundColor: '#f1c40f',
          borderColor: '#f39c12',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#e6edf3' } },
        tooltip: {
          callbacks: {
            label: function (context) {
              return ` ${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        x: { stacked: true, ticks: { color: '#e6edf3' }, grid: { color: '#30363d' } },
        y: {
          stacked: true,
          ticks: {
            color: '#e6edf3',
            callback: function (value) {
              return formatCurrency(value);
            }
          },
          grid: { color: '#30363d' }
        }
      }
    }
  });

  container.style.display = 'block';
}

function formatarData(dataStr) {
  if (!dataStr) return '-';
  try {
    const date = new Date(dataStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
  } catch (e) {
    return dataStr;
  }
}

// Expõe funções globalmente
window.filterProventos = function () {
  if (window.proventosManager) {
    const proventos = window.proventosManager.getProventos();
    renderProventos(proventos, window.proventosManager);
  }
};

window.limparFiltrosProventos = function () {
  document.getElementById('filterProventoAtivo').value = '';
  document.getElementById('filterProventoTipo').value = '';
  document.getElementById('filterProventoInicio').value = '';
  document.getElementById('filterProventoFim').value = '';
  window.filterProventos();
};
