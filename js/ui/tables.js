// ========== RENDERIZAÇÃO DE TABELAS E FILTROS ==========

import { formatCurrency, formatQty, formatPercent } from '../utils/formatters.js';
import { createPaginator } from '../utils/pagination.js';

export let currentAssetsGlobal = [];
export let allAssetsGlobal = [];

let paginatorAtivos = null;
let paginatorTodos = null;

// ========== ATIVOS ATUAIS ==========

export function renderTable(a){
  currentAssetsGlobal=a;

  // Popula checkboxes de categorias
  const categories=new Set();
  a.forEach(x=>categories.add(x.category));

  const container=document.getElementById('filterCategoryAtivosContainer');
  container.innerHTML=Array.from(categories).sort().map(cat=>
    `<label><input type="checkbox" class="filter-cat-ativos" value="${cat}" checked onchange="filterCurrentAssets()"> ${cat}</label>`
  ).join('');

  // Aplica filtros atuais
  filterCurrentAssets();
}

export function filterCurrentAssets(){
  // Pega categorias selecionadas
  const selectedCategories=Array.from(document.querySelectorAll('.filter-cat-ativos:checked')).map(cb=>cb.value);
  const filterSym=document.getElementById('filterSymbolAtivos').value.toLowerCase().trim();

  const filtered=currentAssetsGlobal.filter(x=>{
    const matchCat=selectedCategories.length===0||selectedCategories.includes(x.category);
    const matchSym=!filterSym||x.symbol.toLowerCase().includes(filterSym);
    return matchCat&&matchSym;
  });

  // Calcula totais
  let totals={
    qtdAtual:0,
    qtdComprada:0,
    qtdVendida:0,
    custoTotal:0,
    valorAtual:0,
    lucroRealizado:0,
    lucroAberto:0,
    lucroTotal:0
  };

  filtered.forEach(x=>{
    totals.qtdAtual+=x.quantity;
    totals.qtdComprada+=x.totalQuantityBought;
    totals.qtdVendida+=x.totalQuantitySold;
    totals.custoTotal+=x.invested;
    totals.valorAtual+=x.currentValue;
    totals.lucroRealizado+=x.profitRealized;
    totals.lucroAberto+=x.profitUnreal;
    totals.lucroTotal+=(x.profitRealized+x.profitUnreal);
  });

  const rentabilidadeTotal=totals.custoTotal>0?(totals.lucroTotal/totals.custoTotal)*100:0;
  const pcTotal=totals.lucroTotal>=0?'profit':'loss';
  const pcAberto=totals.lucroAberto>=0?'profit':'loss';

  // Inicializa paginação se necessário
  if(!paginatorAtivos){
    paginatorAtivos=createPaginator('paginationAtivos',[10,25,50]);
    paginatorAtivos.setRenderCallback(renderAssetsTable);
  }

  // Se tiver mais de 10 itens, usa paginação
  if(filtered.length>10){
    paginatorAtivos.setItems(filtered).render();
  }else{
    renderAssetsTable(filtered);
    document.getElementById('paginationAtivos').innerHTML='';
  }
}

function renderAssetsTable(items){
  // Recalcula totais apenas dos itens filtrados (não da página)
  const allFiltered=currentAssetsGlobal.filter(x=>{
    const selectedCategories=Array.from(document.querySelectorAll('.filter-cat-ativos:checked')).map(cb=>cb.value);
    const filterSym=document.getElementById('filterSymbolAtivos').value.toLowerCase().trim();
    const matchCat=selectedCategories.length===0||selectedCategories.includes(x.category);
    const matchSym=!filterSym||x.symbol.toLowerCase().includes(filterSym);
    return matchCat&&matchSym;
  });

  let totals={
    qtdAtual:0,
    qtdComprada:0,
    qtdVendida:0,
    custoTotal:0,
    valorAtual:0,
    lucroRealizado:0,
    lucroAberto:0,
    lucroTotal:0
  };

  allFiltered.forEach(x=>{
    totals.qtdAtual+=x.quantity;
    totals.qtdComprada+=x.totalQuantityBought;
    totals.qtdVendida+=x.totalQuantitySold;
    totals.custoTotal+=x.invested;
    totals.valorAtual+=x.currentValue;
    totals.lucroRealizado+=x.profitRealized;
    totals.lucroAberto+=x.profitUnreal;
    totals.lucroTotal+=(x.profitRealized+x.profitUnreal);
  });

  const rentabilidadeTotal=totals.custoTotal>0?(totals.lucroTotal/totals.custoTotal)*100:0;
  const pcTotal=totals.lucroTotal>=0?'profit':'loss';
  const pcAberto=totals.lucroAberto>=0?'profit':'loss';

  const tb=document.getElementById('assetsBody');
  tb.innerHTML=items.map(x=>{
    const pcAberto=x.profitUnreal>=0?'profit':'loss';
    const lucroTotal=x.profitRealized+x.profitUnreal;
    const pcTotal=lucroTotal>=0?'profit':'loss';
    return `<tr>
      <td><strong>${x.symbol}</strong></td>
      <td>${x.category}</td>
      <td class="num-col">${formatQty(x.quantity)}</td>
      <td class="num-col">${formatQty(x.totalQuantityBought)}</td>
      <td class="num-col">${formatQty(x.totalQuantitySold)}</td>
      <td class="num-col">${formatCurrency(x.avgPrice)}</td>
      <td>
        <input type="number" class="price-input" step="0.01" value="${Number(x.currentPrice).toFixed(2)}"
          onchange="updatePrice('${x.symbol}',this.value)"
          onkeypress="if(event.key==='Enter') { this.blur(); updatePrice('${x.symbol}',this.value); }"
          title="Digite o novo preço e pressione Enter ou clique fora para salvar">
      </td>
      <td class="num-col">${formatCurrency(x.invested)}</td>
      <td class="num-col">${formatCurrency(x.currentValue)}</td>
      <td class="num-col profit">${formatCurrency(x.profitRealized)}</td>
      <td class="num-col ${pcAberto}">${formatCurrency(x.profitUnreal)}</td>
      <td class="num-col ${pcTotal}">${formatCurrency(lucroTotal)}</td>
      <td class="num-col ${pcAberto}">${formatPercent(x.profitPercent)}</td>
    </tr>`;
  }).join('')+`<tr style="font-weight:bold;background-color:#1c2128;border-top:2px solid #30363d;">
    <td colspan="2"><strong>TOTAL (Filtrados)</strong></td>
    <td class="num-col">${formatQty(totals.qtdAtual)}</td>
    <td class="num-col">${formatQty(totals.qtdComprada)}</td>
    <td class="num-col">${formatQty(totals.qtdVendida)}</td>
    <td class="num-col">-</td>
    <td class="num-col">-</td>
    <td class="num-col">${formatCurrency(totals.custoTotal)}</td>
    <td class="num-col">${formatCurrency(totals.valorAtual)}</td>
    <td class="num-col profit">${formatCurrency(totals.lucroRealizado)}</td>
    <td class="num-col ${pcAberto}">${formatCurrency(totals.lucroAberto)}</td>
    <td class="num-col ${pcTotal}">${formatCurrency(totals.lucroTotal)}</td>
    <td class="num-col ${pcTotal}">${formatPercent(rentabilidadeTotal)}</td>
  </tr>`;

  document.getElementById('assetsBody').parentElement.style.display='block';
}

// ========== TODOS OS ATIVOS ==========

export function renderAllAssets(allAssets){
  allAssetsGlobal=allAssets;

  // Popula checkboxes de categorias
  const categories=new Set();
  allAssets.forEach(x=>categories.add(x.category));

  const container=document.getElementById('filterCategoryContainer');
  container.innerHTML=Array.from(categories).sort().map(cat=>
    `<label><input type="checkbox" class="filter-cat-todos" value="${cat}" checked onchange="filterAllAssets()"> ${cat}</label>`
  ).join('');

  // Aplica filtros atuais
  filterAllAssets();
}

export function filterAllAssets(){
  // Pega categorias selecionadas
  const selectedCategories=Array.from(document.querySelectorAll('.filter-cat-todos:checked')).map(cb=>cb.value);
  const filterSym=document.getElementById('filterSymbol').value.toLowerCase().trim();

  const filtered=allAssetsGlobal.filter(x=>{
    const matchCat=selectedCategories.length===0||selectedCategories.includes(x.category);
    const matchSym=!filterSym||x.symbol.toLowerCase().includes(filterSym);
    return matchCat&&matchSym;
  });

  // Calcula totais
  let totals={
    qtdAtual:0,
    qtdComprada:0,
    qtdVendida:0,
    totalInvestido:0,
    totalRecuperado:0,
    lucroRealizado:0,
    lucroAberto:0,
    valorAtual:0,
    lucroTotal:0
  };

  filtered.forEach(x=>{
    totals.qtdAtual+=x.quantity;
    totals.qtdComprada+=x.totalQuantityBought;
    totals.qtdVendida+=x.totalQuantitySold;
    totals.totalInvestido+=x.totalInvestido;
    totals.totalRecuperado+=x.totalRecuperado;
    totals.lucroRealizado+=x.profitRealized;
    totals.lucroAberto+=x.profitUnreal;
    totals.valorAtual+=x.currentValue;
    totals.lucroTotal+=x.lucroTotal;
  });

  // Inicializa paginação se necessário
  if(!paginatorTodos){
    paginatorTodos=createPaginator('paginationTodos',[10,25,50,100]);
    paginatorTodos.setRenderCallback(items=>renderAllAssetsTableContent(items,totals,pcTotal,pcAberto,rentabilidadeTotal));
  }

  const rentabilidadeTotal=totals.totalInvestido>0?(totals.lucroTotal/totals.totalInvestido)*100:0;
  const pcTotal=totals.lucroTotal>=0?'profit':'loss';
  const pcAberto=totals.lucroAberto>=0?'profit':'loss';

  // Se tiver mais de 10 itens, usa paginação
  if(filtered.length>10){
    paginatorTodos.setRenderCallback(items=>renderAllAssetsTableContent(items,totals,pcTotal,pcAberto,rentabilidadeTotal));
    paginatorTodos.setItems(filtered).render();
  }else{
    renderAllAssetsTableContent(filtered,totals,pcTotal,pcAberto,rentabilidadeTotal);
    document.getElementById('paginationTodos').innerHTML='';
  }
}

function renderAllAssetsTableContent(items,totals,pcTotal,pcAberto,rentabilidadeTotal){
  const tb=document.getElementById('allAssetsBody');
  tb.innerHTML=items.map(x=>{
    const pcTotal=x.lucroTotal>=0?'profit':'loss';
    const pcAberto=x.profitUnreal>=0?'profit':'loss';
    return `<tr>
      <td><strong>${x.symbol}</strong></td>
      <td>${x.category}</td>
      <td class="num-col">${formatQty(x.quantity)}</td>
      <td class="num-col">${formatQty(x.totalQuantityBought)}</td>
      <td class="num-col">${formatQty(x.totalQuantitySold)}</td>
      <td class="num-col">${formatCurrency(x.precoMedioCompra)}</td>
      <td class="num-col">${x.totalQuantitySold>0?formatCurrency(x.precoMedioVenda):'-'}</td>
      <td class="num-col">${formatCurrency(x.totalInvestido)}</td>
      <td class="num-col">${formatCurrency(x.totalRecuperado)}</td>
      <td class="num-col profit">${formatCurrency(x.profitRealized)}</td>
      <td class="num-col ${pcAberto}">${formatCurrency(x.profitUnreal)}</td>
      <td class="num-col">${formatCurrency(x.currentValue)}</td>
      <td class="num-col ${pcTotal}">${formatCurrency(x.lucroTotal)}</td>
      <td class="num-col ${pcTotal}">${formatPercent(x.rentabilidadeTotal)}</td>
    </tr>`;
  }).join('')+`<tr style="font-weight:bold;background-color:#1c2128;border-top:2px solid #30363d;">
    <td colspan="2"><strong>TOTAL</strong></td>
    <td class="num-col">${formatQty(totals.qtdAtual)}</td>
    <td class="num-col">${formatQty(totals.qtdComprada)}</td>
    <td class="num-col">${formatQty(totals.qtdVendida)}</td>
    <td class="num-col">-</td>
    <td class="num-col">-</td>
    <td class="num-col">${formatCurrency(totals.totalInvestido)}</td>
    <td class="num-col">${formatCurrency(totals.totalRecuperado)}</td>
    <td class="num-col profit">${formatCurrency(totals.lucroRealizado)}</td>
    <td class="num-col ${pcAberto}">${formatCurrency(totals.lucroAberto)}</td>
    <td class="num-col">${formatCurrency(totals.valorAtual)}</td>
    <td class="num-col ${pcTotal}">${formatCurrency(totals.lucroTotal)}</td>
    <td class="num-col ${pcTotal}">${formatPercent(rentabilidadeTotal)}</td>
  </tr>`;

  document.getElementById('allAssetsBody').parentElement.style.display='block';
}

// ========== FUNÇÕES DE LIMPAR FILTROS ==========

export function clearFiltersAtivos(){
  document.querySelectorAll('.filter-cat-ativos').forEach(cb=>cb.checked=true);
  document.getElementById('filterSymbolAtivos').value='';
  filterCurrentAssets();
}

export function clearFiltersTodos(){
  document.querySelectorAll('.filter-cat-todos').forEach(cb=>cb.checked=true);
  document.getElementById('filterSymbol').value='';
  filterAllAssets();
}

// Expõe funções globalmente
window.clearFiltersAtivos=clearFiltersAtivos;
window.clearFiltersTodos=clearFiltersTodos;

// ========== DETALHES ==========

export function renderDetails(a){
  const d=document.getElementById('assetDetails');
  d.innerHTML=a.map(v=>{
    const pc=v.profitUnreal>=0?'profit':'loss';
    const lucroPorcentualRealizado=v.totalQuantitySold>0.000001?(v.profitRealized/(v.totalQuantitySold*v.avgPrice))*100:0;

    return `
    <div class="asset-details ${pc==='loss'?'loss':''}">
      <h3>${v.symbol} (${v.category})</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="label">📊 Qtd Atual em Carteira</div>
          <div class="value">${formatQty(v.quantity)}</div>
        </div>
        <div class="detail-item">
          <div class="label">📦 Qtd Total Comprada</div>
          <div class="value">${formatQty(v.totalQuantityBought)}</div>
        </div>
        <div class="detail-item">
          <div class="label">💰 Qtd Total Vendida</div>
          <div class="value">${formatQty(v.totalQuantitySold)}</div>
        </div>
        <div class="detail-item">
          <div class="label">📈 Preço Médio de Compra</div>
          <div class="value">${formatCurrency(v.avgPrice)}</div>
        </div>
        <div class="detail-item">
          <div class="label">💸 Preço Médio Ponderado</div>
          <div class="value">${formatCurrency(v.precoDiluido)}</div>
        </div>
        <div class="detail-item">
          <div class="label">🔔 Preço Atual de Mercado</div>
          <div class="value">${formatCurrency(v.currentPrice)}</div>
        </div>
        <div class="detail-item">
          <div class="label">🛒 Custo Total da Posição ATUAL</div>
          <div class="value">${formatCurrency(v.invested)}</div>
        </div>
        <div class="detail-item">
          <div class="label">💳 Custos Pagos (taxas/corretagem)</div>
          <div class="value">${formatCurrency(v.totalCustos)}</div>
        </div>
        <div class="detail-item neutral">
          <div class="label">💵 Valor Atual de Mercado (Qtd Atual × Preço Atual)</div>
          <div class="value">${formatCurrency(v.currentValue)}</div>
        </div>
        <div class="detail-item profit">
          <div class="label">✅ Lucro Realizado (Trades Fechados)</div>
          <div class="value">${formatCurrency(v.profitRealized)}</div>
          <div style="font-size:.8em;margin-top:5px;color:#2ecc71;">${v.totalQuantitySold>0.000001?formatPercent(lucroPorcentualRealizado):'-'}</div>
        </div>
        <div class="detail-item ${pc}">
          <div class="label">📈 Lucro em Aberto (Posição Atual)</div>
          <div class="value">${formatCurrency(v.profitUnreal)}</div>
          <div style="font-size:.8em;margin-top:5px;">${formatPercent(v.profitPercent)}</div>
        </div>
        <div class="detail-item ${pc}">
          <div class="label">🎯 Rentabilidade Total (Realizado + Aberto)</div>
          <div class="value">${formatCurrency(v.profitRealized+v.profitUnreal)}</div>
          <div style="font-size:.8em;margin-top:5px;">${v.invested>0?formatPercent(((v.profitRealized+v.profitUnreal)/v.invested)*100):'-'}</div>
        </div>
      </div>

      <div class="trades-section">
        <h4>📋 Transações deste Ativo (${v.transactions.length} operações)</h4>
        ${v.transactions.map((tx,i)=>{
          const totalTx=tx.tipo==='C'?(tx.qtd*tx.preco+tx.custos):(tx.qtd*tx.preco-tx.custos);
          return `
            <div class="trade-item ${tx.tipo==='C'?'':'profit-trade'}">
              <strong>${tx.data}</strong> |
              ${tx.tipo==='C'?'🟢 COMPRA':'🔴 VENDA'} ${formatQty(tx.qtd)} und @ ${formatCurrency(tx.preco)}
              <div style="margin-top:5px;font-size:.9em;">
                Total: ${formatCurrency(totalTx)}${tx.custos>0?' (custos: '+formatCurrency(tx.custos)+')':''}
                | Carteira: ${formatQty(tx.qtdCarteira)} und
                ${tx.tipo==='V'?` | <span class="profit">Lucro acum: ${formatCurrency(tx.lucroRealizado)}</span>`:''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>`;
  }).join('');

  document.getElementById('detailsSection').style.display='block';
}
