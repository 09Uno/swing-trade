// ========== TRADES E HISTÓRICO ==========

import { formatCurrency, formatQty, formatPercent } from '../utils/formatters.js';
import { createPaginator } from '../utils/pagination.js';

let paginatorHistorico = null;
let paginatorTrades = null;
let allTrades = [];

// Função auxiliar para calcular dias entre datas
function calcularDias(dataInicio, dataFim){
  try{
    const parseDate=(dateStr)=>{
      const parts=dateStr.split('/');
      if(parts.length===3){
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
      return new Date(dateStr);
    };
    const d1=parseDate(dataInicio);
    const d2=parseDate(dataFim);
    const diff=Math.abs(d2-d1);
    return Math.floor(diff/(1000*60*60*24));
  }catch(e){
    return 0;
  }
}

export function renderTrades(trades){
  allTrades = trades;

  const filtered=trades.filter(t=>
    document.getElementById('filterAsset').value===''||
    t.ativo.toUpperCase().includes(document.getElementById('filterAsset').value.toUpperCase())
  );

  const container=document.getElementById('tradesContainer');

  if(filtered.length===0){
    container.innerHTML='<p style="text-align:center;color:#8b949e;">Nenhum trade encontrado</p>';
    document.getElementById('paginationTrades').innerHTML='';
    return;
  }

  // Agrupa por ativo
  const byAsset={};
  filtered.forEach(t=>{
    if(!byAsset[t.ativo])byAsset[t.ativo]=[];
    byAsset[t.ativo].push(t);
  });

  const tradesGrouped = Object.entries(byAsset);

  // Inicializa paginação se necessário
  if(!paginatorTrades){
    paginatorTrades=createPaginator('paginationTrades',[5,10,20,50]);
    paginatorTrades.setRenderCallback(renderTradesPage);
  }

  // Se tiver mais de 5 grupos, usa paginação
  if(tradesGrouped.length > 5){
    paginatorTrades.setItems(tradesGrouped).render();
  } else {
    renderTradesPage(tradesGrouped);
    document.getElementById('paginationTrades').innerHTML='';
  }
}

function renderTradesPage(items){
  const container=document.getElementById('tradesContainer');

  container.innerHTML=items.map(([asset,trades])=>{
    const totalProfit=trades.reduce((s,t)=>s+t.lucroTotal,0);
    const profitTrades=trades.filter(t=>t.lucroTotal>=0).length;
    const lossTrades=trades.filter(t=>t.lucroTotal<0).length;
    const categoria=trades[0].categoria;

    return `
    <div class="asset-details ${totalProfit<0?'loss':''}">
      <h3>${asset} (${categoria})</h3>
      <div class="stats-row">
        <div class="stat-box">
          <div class="stat-label">Total de Trades</div>
          <div class="stat-value">${trades.length}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">✅ Com Lucro</div>
          <div class="stat-value" style="color:#2ecc71;">${profitTrades}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">❌ Com Prejuízo</div>
          <div class="stat-value" style="color:#e74c3c;">${lossTrades}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">💰 Resultado Total</div>
          <div class="stat-value ${totalProfit>=0?'profit':'loss'}">${formatCurrency(totalProfit)}</div>
        </div>
      </div>

      <div class="trades-list">
        ${trades.map((t,idx)=>{
          const pc=t.lucroTotal>=0?'profit':'loss';
          const rentabilidade=t.precoCompra>0?((t.precoVenda-t.precoCompra)/t.precoCompra)*100:0;
          const totalCompra=t.qtd*t.precoCompra;
          const totalVenda=t.qtd*t.precoVenda;
          const duracaoDias=calcularDias(t.dataCompra,t.dataVenda);

          return `
            <div class="trade-detail ${pc}">
              <div class="trade-header">
                <span class="trade-number">#${idx+1}</span>
                <span class="trade-dates"><strong>${t.dataCompra}</strong> → <strong>${t.dataVenda}</strong>
                ${duracaoDias>0?`<span class="trade-duration">(${duracaoDias} dias)</span>`:''}</span>
              </div>
              <div class="trade-info">
                <div class="trade-row">
                  <span>Quantidade:</span> <strong>${formatQty(t.qtd)} unidades</strong>
                </div>
                <div class="trade-row">
                  <span>Preço Compra:</span> <strong>${formatCurrency(t.precoCompra)}</strong>
                  <span class="trade-total">(Total: ${formatCurrency(totalCompra)})</span>
                </div>
                <div class="trade-row">
                  <span>Preço Venda:</span> <strong>${formatCurrency(t.precoVenda)}</strong>
                  <span class="trade-total">(Total: ${formatCurrency(totalVenda)})</span>
                </div>
                <div class="trade-row">
                  <span>Lucro Unitário:</span> <strong class="${pc}">${formatCurrency(t.lucroUnitario)}</strong>
                  <span class="trade-percent">(${formatPercent(rentabilidade)})</span>
                </div>
                <div class="trade-row highlight">
                  <span>Lucro Total:</span> <strong class="${pc}">${formatCurrency(t.lucroTotal)}</strong>
                </div>
                ${t.custos>0?`<div class="trade-row"><span>Custos:</span> <strong>${formatCurrency(t.custos)}</strong></div>`:''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

// Guarda histórico original para filtros
let historicoOriginal = [];

export function renderHistorico(h){
  // Guarda histórico original
  historicoOriginal = [...h];

  // Ordena do mais recente para o mais antigo
  const historico = [...h].reverse();

  // Inicializa paginação se necessário
  if(!paginatorHistorico){
    paginatorHistorico=createPaginator('paginationHistorico',[25,50,100,200]);
    paginatorHistorico.setRenderCallback(renderHistoricoTable);
  }

  // Se tiver mais de 25 itens, usa paginação
  if(historico.length>25){
    paginatorHistorico.setItems(historico).render();
  }else{
    renderHistoricoTable(historico);
    document.getElementById('paginationHistorico').innerHTML='';
  }

  document.getElementById('transactionsTable').style.display='table';
}

function renderHistoricoTable(items){
  const tb=document.getElementById('transactionsBody');
  
  if (items.length === 0) {
    tb.innerHTML = `
      <tr>
        <td colspan="13" class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <div class="empty-state-text">Nenhuma transação encontrada</div>
          <div class="empty-state-hint">Tente ajustar os filtros de busca</div>
        </td>
      </tr>
    `;
    return;
  }

  tb.innerHTML=items.map(x=>{
    const totalTx=x.tipo==='C'?(x.qtd*x.preco+x.custos):(x.qtd*x.preco-x.custos);
    return `<tr>
      <td>${x.idx}</td>
      <td>${x.data}</td>
      <td><strong>${x.ativo}</strong></td>
      <td><span class="badge ${x.tipo==='C'?'buy':'sell'}">${x.tipo==='C'?'COMPRA':'VENDA'}</span></td>
      <td class="num-col">${formatQty(x.qtd)}</td>
      <td class="num-col">${formatCurrency(x.preco)}</td>
      <td class="num-col">${formatCurrency(x.custos)}</td>
      <td class="num-col">${formatCurrency(totalTx)}</td>
      <td>${x.categoria}</td>
      <td class="num-col">${formatQty(x.qtdCarteira)}</td>
      <td class="num-col profit">${formatCurrency(x.lucroRealizado)}</td>
      <td class="num-col">${formatCurrency(x.caixa)}</td>
      <td>
        <button class="btn-icon" onclick="editarTransacao(${x.id})" title="Editar">✏️</button>
        <button class="btn-icon" onclick="excluirTransacao(${x.id})" title="Excluir">🗑️</button>
      </td>
    </tr>`;
  }).join('');
}

// Função de filtro do histórico
export function filterHistorico() {
  const searchText = document.getElementById('searchHistorico')?.value.toUpperCase() || '';
  const filterTipo = document.getElementById('filterHistoricoTipo')?.value || '';
  const filterCategoria = document.getElementById('filterHistoricoCategoria')?.value || '';

  // Ordena do mais recente para o mais antigo
  let filtered = [...historicoOriginal].reverse();

  // Aplica filtros
  if (searchText) {
    filtered = filtered.filter(x => 
      x.ativo.toUpperCase().includes(searchText) ||
      (x.tipo === 'C' ? 'COMPRA' : 'VENDA').includes(searchText) ||
      x.categoria.toUpperCase().includes(searchText)
    );
  }

  if (filterTipo) {
    filtered = filtered.filter(x => x.tipo === filterTipo);
  }

  if (filterCategoria) {
    filtered = filtered.filter(x => x.categoria === filterCategoria);
  }

  // Renderiza resultado filtrado
  if (filtered.length > 25) {
    if (!paginatorHistorico) {
      paginatorHistorico = createPaginator('paginationHistorico', [25, 50, 100, 200]);
      paginatorHistorico.setRenderCallback(renderHistoricoTable);
    }
    paginatorHistorico.setItems(filtered).render();
  } else {
    renderHistoricoTable(filtered);
    document.getElementById('paginationHistorico').innerHTML = '';
  }
}

// Expõe globalmente
window.filterHistorico = filterHistorico;

export function filterTrades(){
  if(allTrades.length > 0) {
    renderTrades(allTrades);
  } else {
    // Importa currentData do módulo principal
    import('../data/dataLoader.js').then(module => {
      if(module.currentData && module.currentData.summary){
        renderTrades(module.currentData.summary.trades);
      }
    });
  }
}

// Export/Download functions
export function exportReport(){
  if(!window.currentData)return;

  const proventos = window.proventosManager ? window.proventosManager.getProventos() : [];
  const rendaFixa = window.rendaFixaManager ? window.rendaFixaManager.getInvestimentos() : [];

  const data={
    timestamp:new Date().toISOString(),
    summary:window.currentData.summary,
    prices:Array.from(window.currentData.prices.entries()),
    proventos:proventos,
    rendaFixa:rendaFixa
  };

  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download=`relatorio-investimentos-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportExcel(){
  if(!window.currentData)return;

  const s=window.currentData.summary;
  const wb=XLSX.utils.book_new();

  // Aba 1: Resumo
  const summaryData=[
    ['Métrica','Valor'],
    ['Patrimônio Total',s.totalValue],
    ['Total Investido',s.invested],
    ['Valor Atual',s.current],
    ['Resultado Total',s.profit],
    ['Rentabilidade (%)',s.profitPercent],
    ['Lucro Realizado',s.realizedProfit],
    ['Caixa',s.cash]
  ];
  const wsSummary=XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb,wsSummary,'Resumo');

  // Aba 2: Ativos
  const assetsData=[
    ['Ativo','Categoria','Qtd','Preço Médio','Preço Atual','Custo','Valor Atual','Lucro Realizado','Lucro Aberto','Rentabilidade (%)']
  ];
  s.assets.forEach(a=>{
    assetsData.push([
      a.symbol,
      a.category,
      a.quantity,
      a.avgPrice,
      a.currentPrice,
      a.invested,
      a.currentValue,
      a.profitRealized,
      a.profitUnreal,
      a.profitPercent
    ]);
  });
  const wsAssets=XLSX.utils.aoa_to_sheet(assetsData);
  XLSX.utils.book_append_sheet(wb,wsAssets,'Ativos');

  // Aba 3: Trades
  const tradesData=[
    ['Ativo','Categoria','Data Compra','Data Venda','Qtd','Preço Compra','Preço Venda','Lucro Unit.','Lucro Total','Custos']
  ];
  s.trades.forEach(t=>{
    tradesData.push([
      t.ativo,
      t.categoria,
      t.dataCompra,
      t.dataVenda,
      t.qtd,
      t.precoCompra,
      t.precoVenda,
      t.lucroUnitario,
      t.lucroTotal,
      t.custos
    ]);
  });
  const wsTrades=XLSX.utils.aoa_to_sheet(tradesData);
  XLSX.utils.book_append_sheet(wb,wsTrades,'Trades');

  // Aba 4: Proventos
  if(window.proventosManager){
    const proventos=window.proventosManager.getProventos();
    const proventosData=[
      ['Data Pagamento','Data COM','Ativo','Tipo','Valor Unitário','Quantidade','Total']
    ];
    proventos.forEach(p=>{
      proventosData.push([
        p.dataPagamento,
        p.dataCom,
        p.ativo,
        p.tipo,
        p.valorUnitario,
        p.quantidade,
        p.total
      ]);
    });
    const wsProventos=XLSX.utils.aoa_to_sheet(proventosData);
    XLSX.utils.book_append_sheet(wb,wsProventos,'Proventos');
  }

  // Aba 5: Renda Fixa
  if(window.rendaFixaManager){
    const investimentos=window.rendaFixaManager.getInvestimentos();
    const rendaFixaData=[
      ['Nome','Status','Tipo','Valor Inicial','Taxa','Data Início','Data Vencimento','Dias Corridos','Rendimento Líquido','Valor Atual','Rentabilidade (%)','Instituição']
    ];
    investimentos.forEach(inv=>{
      const calc=window.rendaFixaManager.calcularInvestimento(inv);
      const rentabilidade=calc.valorInicial>0?((calc.rendimentoLiquido/calc.valorInicial)*100):0;
      rendaFixaData.push([
        inv.nome||inv.tipo,
        inv.ativo?'Ativo':'Resgatado',
        inv.tipo,
        calc.valorInicial,
        inv.taxa,
        inv.dataInicio,
        inv.dataVencimento||'',
        calc.diasCorridos,
        calc.rendimentoLiquido,
        calc.totalLiquido,
        rentabilidade,
        inv.instituicao||''
      ]);
    });
    const wsRendaFixa=XLSX.utils.aoa_to_sheet(rendaFixaData);
    XLSX.utils.book_append_sheet(wb,wsRendaFixa,'Renda Fixa');
  }

  // Aba 6: Histórico
  const historicData=[
    ['#','Data','Ativo','Tipo','Quantidade','Preço Unit.','Custos','Total Transação','Categoria','Qtd em Carteira','Lucro Acumulado','Caixa Acumulada']
  ];
  s.history.forEach(h=>{
    const totalTx=h.tipo==='C'?(h.qtd*h.preco+h.custos):(h.qtd*h.preco-h.custos);
    historicData.push([
      h.idx,
      h.data,
      h.ativo,
      h.tipo,
      h.qtd,
      h.preco,
      h.custos,
      totalTx,
      h.categoria,
      h.qtdCarteira,
      h.lucroRealizado,
      h.caixa
    ]);
  });
  const wsHistoric=XLSX.utils.aoa_to_sheet(historicData);
  XLSX.utils.book_append_sheet(wb,wsHistoric,'Histórico');

  XLSX.writeFile(wb,`relatorio-investimentos-${new Date().toISOString().split('T')[0]}.xlsx`);
}

// Expõe funções globalmente
window.exportReport = exportReport;
window.exportExcel = exportExcel;
