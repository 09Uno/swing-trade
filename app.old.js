let currentData=null, categoryChart=null, allTrades=[], allAssetsGlobal=[], currentAssetsGlobal=[];

function showStatus(msg,type='info'){
  const s=document.getElementById('statusMessage');
  s.textContent=msg;
  s.className='status-message '+type;
  s.style.display='block';
  if(type!=='error')setTimeout(()=>s.style.display='none',4000);
}

function formatCurrency(v){
  const num=Number(v);
  return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2,maximumFractionDigits:2}).format(num);
}

function formatQty(v){
  const num=Number(v);
  return num.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:8});
}

function formatPercent(v){
  const num=Number(v);
  const s=num>=0?'+':'';
  return s+num.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
}

function switchTab(tabName){
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
}

// ========== CLASSE PRINCIPAL DE ANÁLISE ==========
class PortfolioAnalyzer{
  constructor(trans){
    this.trans=trans;
    this.assets=new Map();
    this.cash=0;
    this.history=[];
    this.trades=[];
    this.processFIFO();
  }

  processFIFO(){
    // Função para converter data brasileira DD/MM/YYYY
    const parseDate=(dateStr)=>{
      const parts=dateStr.split('/');
      if(parts.length===3){
        // DD/MM/YYYY -> YYYY-MM-DD
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
      return new Date(dateStr);
    };

    // Ordena por data (CRESCENTE - mais antiga primeiro)
    this.trans.sort((a,b)=>parseDate(a.date)-parseDate(b.date));

    this.trans.forEach((t,idx)=>{
      const sym=t.asset;
      if(!sym)return;

      const type=t.type.toUpperCase();
      const q=Number(t.quantity);
      const p=Number(t.price);
      const cat=t.category||'Outros';
      
      // Calcula custos como FLOAT
      const totalCustos=Number(t.corretagem||0)+Number(t.taxas||0)+Number(t.impostos||0)+Number(t.irrf||0);
      const custoUnitario=q>0.000001?totalCustos/q:0;
      
      // Inicializa ativo se não existe
      if(!this.assets.has(sym)){
        this.assets.set(sym,{
          symbol:sym,
          category:cat,
          lotes:[],
          quantity:0,
          totalQuantityBought:0,
          totalQuantitySold:0,
          profitRealized:0,
          totalCustos:0,
          transactions:[]
        });
      }
      
      const asset=this.assets.get(sym);
      
      if(['BUY','C','COMPRA'].includes(type)){
        // COMPRA - ADICIONA LOTE
        const precoLiquido=p+custoUnitario;
        asset.lotes.push({q:q,p:precoLiquido,dataCompra:t.date,precoOriginal:p,custoUnitario:custoUnitario});
        asset.quantity+=q;
        // totalCost não é mais usado - apenas os lotes em aberto são contados
        asset.totalQuantityBought+=q;
        asset.totalCustos+=totalCustos;
        this.cash-=(q*p+totalCustos);
        
        asset.transactions.push({
          idx:idx+1,
          data:t.date,
          tipo:'C',
          qtd:q,
          preco:p,
          custos:totalCustos,
          custoUnitario:custoUnitario,
          precoLiquido:precoLiquido,
          total:(q*p+totalCustos),
          qtdCarteira:asset.quantity,
          lucroRealizado:asset.profitRealized,
          caixa:this.cash
        });
        
      }else if(['SELL','V','VENDA'].includes(type)){
        // VENDA - FIFO - REMOVE LOTES DO MAIS ANTIGO
        if(q<0.000001) return; // Ignora vendas com quantidade zero

        let remaining=q;
        let profit=0;
        let vendas=[];

        // Remove lotes do mais antigo (FIFO)
        while(remaining>0.000001&&asset.lotes.length>0){
          const lote=asset.lotes[0];
          const used=Math.min(remaining,lote.q);
          const lucroUnitario=p-lote.p;
          const lucroTotal=lucroUnitario*used;

          vendas.push({
            qtd:used,
            precoCompra:lote.p,
            precoVenda:p,
            lucroUnitario:lucroUnitario,
            lucroTotal:lucroTotal,
            dataCompra:lote.dataCompra
          });

          profit+=lucroTotal;
          asset.quantity-=used;
          remaining-=used;

          // Atualiza quantidade do lote ou remove se zerou
          asset.lotes[0].q-=used;
          if(asset.lotes[0].q<=0.000001){
            asset.lotes.shift();
          }
        }
        
        asset.totalQuantitySold+=q;
        asset.profitRealized+=profit;
        this.cash+=(q*p-totalCustos);
        
        asset.transactions.push({
          idx:idx+1,
          data:t.date,
          tipo:'V',
          qtd:q,
          preco:p,
          custos:totalCustos,
          custoUnitario:custoUnitario,
          precoLiquido:(p-custoUnitario),
          total:(q*p-totalCustos),
          qtdCarteira:asset.quantity,
          lucroRealizado:asset.profitRealized,
          caixa:this.cash
        });
        
        // Registra cada trade realizado
        vendas.forEach(v=>{
          this.trades.push({
            ativo:sym,
            categoria:cat,
            qtd:v.qtd,
            precoCompra:v.precoCompra,
            precoVenda:v.precoVenda,
            lucroUnitario:v.lucroUnitario,
            lucroTotal:v.lucroTotal,
            dataCompra:v.dataCompra,
            dataVenda:t.date,
            custos:(totalCustos*(v.qtd/q))
          });
        });
      }
      
      // Histórico geral
      this.history.push({
        idx:idx+1,
        data:t.date,
        ativo:sym,
        tipo:type,
        qtd:q,
        preco:p,
        custos:totalCustos,
        custoUnitario:custoUnitario,
        categoria:cat,
        qtdCarteira:asset.quantity,
        lucroRealizado:asset.profitRealized,
        caixa:this.cash
      });
    });
  }

getAssetData(prices){
  const arr=[];
  this.assets.forEach(a=>{
    // Calcula quantidade e custo APENAS dos lotes em aberto
    let qtdAtual = 0;
    let custoAtual = 0;

    a.lotes.forEach(l => {
      qtdAtual += l.q;
      custoAtual += (l.q * l.p);
    });

    if(qtdAtual > 0.000001){
      const cp = Number(prices.get(a.symbol)||0);
      const valorAtual = qtdAtual * cp;
      const lucroAberto = valorAtual - custoAtual;
      const rentabilidade = custoAtual > 0 ? (lucroAberto / custoAtual) * 100 : 0;
      const precoMedio = qtdAtual > 0 ? (custoAtual / qtdAtual) : 0;

      arr.push({
        ...a,
        quantity: qtdAtual,
        currentPrice: cp,
        currentValue: valorAtual,
        invested: custoAtual,
        profitUnreal: lucroAberto,
        profitPercent: rentabilidade,
        precoDiluido: precoMedio,
        avgPrice: precoMedio
      });
    }
  });
  return arr.sort((a,b)=>b.currentValue-a.currentValue);
}

getAllAssetsData(prices){
  const arr=[];
  this.assets.forEach(a=>{
    // Calcula quantidade e custo dos lotes em aberto
    let qtdAtual = 0;
    let custoAtual = 0;

    a.lotes.forEach(l => {
      qtdAtual += l.q;
      custoAtual += (l.q * l.p);
    });

    // Para todos os ativos (mesmo os totalmente vendidos)
    const cp = Number(prices.get(a.symbol)||0);
    const valorAtual = qtdAtual * cp;
    const lucroAberto = valorAtual - custoAtual;
    const lucroTotal = a.profitRealized + lucroAberto;

    const precoMedioCompra = a.totalBought > 0 ? (a.totalBoughtPrice / a.totalBought) : 0;
    const precoMedioVenda = a.totalSold > 0 ? (a.totalSoldPrice / a.totalSold) : 0;

    const rentabilidadeTotal = a.totalBoughtPrice > 0 ? (lucroTotal / a.totalBoughtPrice) * 100 : 0;

    arr.push({
      ...a,
      quantity: qtdAtual,
      currentPrice: cp,
      currentValue: valorAtual,
      invested: custoAtual,
      profitUnreal: lucroAberto,
      lucroTotal: lucroTotal,
      rentabilidadeTotal: rentabilidadeTotal,
      precoMedioCompra: precoMedioCompra,
      precoMedioVenda: precoMedioVenda,
      totalInvestido: a.totalBoughtPrice,
      totalRecuperado: a.totalSoldPrice
    });
  });
  return arr.sort((a,b)=>(b.lucroTotal)-(a.lucroTotal));
}

  getSummary(prices,fixed){
    const a=this.getAssetData(prices);
    let inv=0,cur=0,real=0;
    
    // Calcula investimento ATUAL (só lotes em aberto)
    this.assets.forEach(v=>{
      v.lotes.forEach(l=>inv+=(l.q*l.p));
      real+=v.profitRealized;
    });
    
    // Valor ATUAL da carteira
    a.forEach(v=>cur+=v.currentValue);

    // Patrimônio Total = Valor Atual dos Ativos + Caixa (informado manualmente)
    const total=cur+fixed;

    // Resultado Total = Patrimônio Total - Total Investido + Lucro Realizado
    const profit=total-inv+real;
    const perc=inv>0?(profit/inv)*100:0;
    
    // Calcula estatísticas dos trades
    let tradesLucro=0,tradesPrejuizo=0,tradesQtd=0,tradesGanho=0,tradesPerdas=0;
    this.trades.forEach(t=>{
      tradesQtd++;
      if(t.lucroTotal>=0){
        tradesLucro++;
        tradesGanho+=t.lucroTotal;
      }else{
        tradesPrejuizo++;
        tradesPerdas+=t.lucroTotal;
      }
    });
    
    return{
      invested:inv,
      current:cur,
      profit:profit,
      profitPercent:perc,
      realizedProfit:real,
      cash:fixed,
      fixedIncome:fixed,
      totalValue:total,
      assets:a,
      history:this.history,
      trades:this.trades,
      tradeStats:{
        total:tradesQtd,
        ganhos:tradesLucro,
        perdas:tradesPrejuizo,
        lucroTotal:tradesGanho,
        perdaTotal:tradesPerdas
      }
    };
  }
}

// ========== RENDERIZAÇÃO ==========
function getFixedIncome(){
  return Number(document.getElementById('fixedIncomeInput').value)||0;
}

function renderSummary(s){
  const c=document.getElementById('summaryCards');
  const clsProfit=s.profit>=0?'positive':'negative';

  const lucroAberto = s.current - s.invested;
  const lucroTotal = s.realizedProfit + lucroAberto;
  const clsLucroTotal = lucroTotal >= 0 ? 'positive' : 'negative';

  const resultadoTrades = s.tradeStats.lucroTotal + s.tradeStats.perdaTotal;
  const clsTrade = resultadoTrades >= 0 ? 'positive' : 'negative';

  c.innerHTML=`
  <div class="card neutral">
    <h3>💰 Patrimônio Total</h3>
    <div class="value">${formatCurrency(s.totalValue)}</div>
  </div>
  <div class="card neutral">
    <h3>📥 Total Investido</h3>
    <div class="value">${formatCurrency(s.invested)}</div>
  </div>
  <div class="card ${clsProfit}">
    <h3>📊 Resultado Total</h3>
    <div class="value">${formatCurrency(s.profit)}</div>
    <div style="font-size:.85em;margin-top:5px;">${formatPercent(s.profitPercent)}</div>
  </div>
  <div class="card ${clsLucroTotal}">
    <h3>🎯 Lucro Total</h3>
    <div class="value">${formatCurrency(lucroTotal)}</div>
  </div>
  <div class="card positive">
    <h3>💸 Lucro Realizado</h3>
    <div class="value">${formatCurrency(s.realizedProfit)}</div>
  </div>
  <div class="card">
    <h3>📈 Lucro em Aberto</h3>
    <div class="value ${lucroAberto>=0?'profit':'loss'}">${formatCurrency(lucroAberto)}</div>
  </div>
  <div class="card neutral">
    <h3>💵 Caixa / Renda Fixa</h3>
    <div class="value">${formatCurrency(s.cash)}</div>
  </div>
  <div class="card ${clsTrade}">
    <h3>💹 Resultado em Trades</h3>
    <div class="value">${formatCurrency(resultadoTrades)}</div>
    <div style="font-size:.85em;margin-top:5px;">${s.tradeStats.ganhos}✅ / ${s.tradeStats.perdas}❌</div>
  </div>
  `;
}

function renderTable(a){
  currentAssetsGlobal=a;

  // Popula o select de categorias
  const categories=new Set();
  a.forEach(x=>categories.add(x.category));

  const filterCategory=document.getElementById('filterCategoryAtivos');
  const currentCategoryValue=filterCategory.value;
  filterCategory.innerHTML='<option value="">Todas</option>'+
    Array.from(categories).sort().map(cat=>`<option value="${cat}">${cat}</option>`).join('');
  filterCategory.value=currentCategoryValue;

  // Aplica filtros atuais
  filterCurrentAssets();
}

function filterCurrentAssets(){
  const filterCat=document.getElementById('filterCategoryAtivos').value.toLowerCase();
  const filterSym=document.getElementById('filterSymbolAtivos').value.toLowerCase().trim();

  const filtered=currentAssetsGlobal.filter(x=>{
    const matchCat=!filterCat||x.category.toLowerCase()===filterCat;
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
    lucroAberto:0
  };

  filtered.forEach(x=>{
    totals.qtdAtual+=x.quantity;
    totals.qtdComprada+=x.totalQuantityBought;
    totals.qtdVendida+=x.totalQuantitySold;
    totals.custoTotal+=x.invested;
    totals.valorAtual+=x.currentValue;
    totals.lucroRealizado+=x.profitRealized;
    totals.lucroAberto+=x.profitUnreal;
  });

  const rentabilidadeTotal=totals.custoTotal>0?(totals.lucroAberto/totals.custoTotal)*100:0;
  const pcTotal=totals.lucroAberto>=0?'profit':'loss';

  const tb=document.getElementById('assetsBody');
  tb.innerHTML=filtered.map(x=>{
    const pc=x.profitUnreal>=0?'profit':'loss';
    return `<tr>
      <td><strong>${x.symbol}</strong></td>
      <td>${x.category}</td>
      <td class="num-col">${formatQty(x.quantity)}</td>
      <td class="num-col">${formatQty(x.totalQuantityBought)}</td>
      <td class="num-col">${formatQty(x.totalQuantitySold)}</td>
      <td class="num-col">${formatCurrency(x.avgPrice)}</td>
      <td>
        <input type="number" class="price-input" step="0.01" value="${Number(x.currentPrice).toFixed(2)}"
          onchange="updatePrice('${x.symbol}',this.value)">
      </td>
      <td class="num-col">${formatCurrency(x.invested)}</td>
      <td class="num-col">${formatCurrency(x.currentValue)}</td>
      <td class="num-col profit">${formatCurrency(x.profitRealized)}</td>
      <td class="num-col ${pc}">${formatCurrency(x.profitUnreal)}</td>
      <td class="num-col ${pc}">${formatPercent(x.profitPercent)}</td>
    </tr>`;
  }).join('')+`<tr style="font-weight:bold;background-color:#1c2128;border-top:2px solid #30363d;">
    <td colspan="2"><strong>TOTAL</strong></td>
    <td class="num-col">${formatQty(totals.qtdAtual)}</td>
    <td class="num-col">${formatQty(totals.qtdComprada)}</td>
    <td class="num-col">${formatQty(totals.qtdVendida)}</td>
    <td class="num-col">-</td>
    <td class="num-col">-</td>
    <td class="num-col">${formatCurrency(totals.custoTotal)}</td>
    <td class="num-col">${formatCurrency(totals.valorAtual)}</td>
    <td class="num-col profit">${formatCurrency(totals.lucroRealizado)}</td>
    <td class="num-col ${pcTotal}">${formatCurrency(totals.lucroAberto)}</td>
    <td class="num-col ${pcTotal}">${formatPercent(rentabilidadeTotal)}</td>
  </tr>`;

  document.getElementById('assetsBody').parentElement.style.display='block';
}

function renderDetails(a){
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

function renderAllAssets(allAssets){
  allAssetsGlobal=allAssets;

  // Popula o select de categorias
  const categories=new Set();
  allAssets.forEach(x=>categories.add(x.category));

  const filterCategory=document.getElementById('filterCategory');
  const currentCategoryValue=filterCategory.value;
  filterCategory.innerHTML='<option value="">Todas</option>'+
    Array.from(categories).sort().map(cat=>`<option value="${cat}">${cat}</option>`).join('');
  filterCategory.value=currentCategoryValue;

  // Aplica filtros atuais
  filterAllAssets();
}

function filterAllAssets(){
  const filterCat=document.getElementById('filterCategory').value.toLowerCase();
  const filterSym=document.getElementById('filterSymbol').value.toLowerCase().trim();

  const filtered=allAssetsGlobal.filter(x=>{
    const matchCat=!filterCat||x.category.toLowerCase()===filterCat;
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

  const rentabilidadeTotal=totals.totalInvestido>0?(totals.lucroTotal/totals.totalInvestido)*100:0;
  const pcTotal=totals.lucroTotal>=0?'profit':'loss';
  const pcAberto=totals.lucroAberto>=0?'profit':'loss';

  const tb=document.getElementById('allAssetsBody');
  tb.innerHTML=filtered.map(x=>{
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

function renderChart(a,s){
  const container=document.getElementById('categoryChartContainer');
  const canvas=document.getElementById('categoryChart');

  if(!canvas){
    console.error('Canvas categoryChart não encontrado');
    return;
  }

  const cat={};
  a.forEach(v=>{cat[v.category]=(cat[v.category]||0)+v.currentValue;});

  if(Object.keys(cat).length===0){
    container.style.display='none';
    return;
  }

  const labels=Object.keys(cat);
  const data=Object.values(cat);
  const colors=['#2ecc71','#e74c3c','#3498db','#f1c40f','#9b59b6','#1abc9c','#e67e22','#95a5a6'];

  if(categoryChart)categoryChart.destroy();

  const ctx=canvas.getContext('2d');
  categoryChart=new Chart(ctx,{
    type:'doughnut',
    data:{
      labels,
      datasets:[{
        data,
        backgroundColor:colors.slice(0,labels.length),
        borderColor:'#161b22',
        borderWidth:2
      }]
    },
    options:{
      responsive:true,
      plugins:{
        legend:{position:'bottom',labels:{color:'#e6edf3',padding:15}}
      }
    }
  });
  container.style.display='block';

  // Renderiza resumo por categoria
  renderCategorySummary(a);
}

function renderCategorySummary(assets){
  const summaryContainer=document.getElementById('categorySummaryContainer');
  const tbody=document.getElementById('categorySummaryBody');

  if(assets.length===0){
    summaryContainer.style.display='none';
    return;
  }

  // Agrupa por categoria
  const categories={};
  assets.forEach(a=>{
    if(!categories[a.category]){
      categories[a.category]={
        count:0,
        invested:0,
        current:0,
        realizedProfit:0,
        unrealizedProfit:0
      };
    }
    categories[a.category].count++;
    categories[a.category].invested+=a.invested;
    categories[a.category].current+=a.currentValue;
    categories[a.category].realizedProfit+=a.profitRealized;
    categories[a.category].unrealizedProfit+=a.profitUnreal;
  });

  // Gera linhas da tabela
  const rows=Object.entries(categories).map(([cat,data])=>{
    const totalProfit=data.realizedProfit+data.unrealizedProfit;
    const rentabilidade=data.invested>0?(totalProfit/data.invested)*100:0;
    const pcTotal=totalProfit>=0?'profit':'loss';
    const pcAberto=data.unrealizedProfit>=0?'profit':'loss';

    return `<tr>
      <td><strong>${cat}</strong></td>
      <td class="num-col">${data.count}</td>
      <td class="num-col">${formatCurrency(data.invested)}</td>
      <td class="num-col">${formatCurrency(data.current)}</td>
      <td class="num-col profit">${formatCurrency(data.realizedProfit)}</td>
      <td class="num-col ${pcAberto}">${formatCurrency(data.unrealizedProfit)}</td>
      <td class="num-col ${pcTotal}">${formatCurrency(totalProfit)}</td>
      <td class="num-col ${pcTotal}">${formatPercent(rentabilidade)}</td>
    </tr>`;
  }).join('');

  // Calcula totais
  const totals={
    count:assets.length,
    invested:0,
    current:0,
    realizedProfit:0,
    unrealizedProfit:0
  };

  Object.values(categories).forEach(cat=>{
    totals.invested+=cat.invested;
    totals.current+=cat.current;
    totals.realizedProfit+=cat.realizedProfit;
    totals.unrealizedProfit+=cat.unrealizedProfit;
  });

  const totalProfit=totals.realizedProfit+totals.unrealizedProfit;
  const totalRent=totals.invested>0?(totalProfit/totals.invested)*100:0;
  const pcTotal=totalProfit>=0?'profit':'loss';
  const pcAberto=totals.unrealizedProfit>=0?'profit':'loss';

  tbody.innerHTML=rows+`<tr style="font-weight:bold;background-color:#1c2128;border-top:2px solid #30363d;">
    <td><strong>TOTAL</strong></td>
    <td class="num-col">${totals.count}</td>
    <td class="num-col">${formatCurrency(totals.invested)}</td>
    <td class="num-col">${formatCurrency(totals.current)}</td>
    <td class="num-col profit">${formatCurrency(totals.realizedProfit)}</td>
    <td class="num-col ${pcAberto}">${formatCurrency(totals.unrealizedProfit)}</td>
    <td class="num-col ${pcTotal}">${formatCurrency(totalProfit)}</td>
    <td class="num-col ${pcTotal}">${formatPercent(totalRent)}</td>
  </tr>`;

  summaryContainer.style.display='block';
}

function renderTrades(trades){
  const filtered=trades.filter(t=>
    document.getElementById('filterAsset').value===''||
    t.ativo.toUpperCase().includes(document.getElementById('filterAsset').value.toUpperCase())
  );
  
  const container=document.getElementById('tradesContainer');
  
  if(filtered.length===0){
    container.innerHTML='<p style="text-align:center;color:#8b949e;">Nenhum trade encontrado</p>';
    return;
  }
  
  // Agrupa por ativo
  const byAsset={};
  filtered.forEach(t=>{
    if(!byAsset[t.ativo])byAsset[t.ativo]=[];
    byAsset[t.ativo].push(t);
  });
  
  container.innerHTML=Object.entries(byAsset).map(([asset,trades])=>{
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
      
      <div class="trades-section">
        ${trades.map(t=>{
          const diasDecorridos=Math.floor((new Date(t.dataVenda)-new Date(t.dataCompra))/(1000*60*60*24));
          return `
            <div class="trade-item ${t.lucroTotal>=0?'profit-trade':'loss-trade'}">
              <div>
                <strong>Compra:</strong> ${formatQty(t.qtd)} und @ ${formatCurrency(t.precoCompra)}
                em ${t.dataCompra}
              </div>
              <div style="margin:5px 0;">
                <strong>Venda:</strong> ${formatQty(t.qtd)} und @ ${formatCurrency(t.precoVenda)}
                em ${t.dataVenda} (${diasDecorridos} dias)
              </div>
              <div style="margin-top:8px;padding-top:8px;border-top:1px solid #30363d;">
                <span>Lucro/Qtd: <strong class="${t.lucroUnitario>=0?'profit':'loss'}">${formatCurrency(t.lucroUnitario)}</strong></span>
                <span style="margin-left:15px;">Total: <strong class="${t.lucroTotal>=0?'profit':'loss'}">${formatCurrency(t.lucroTotal)}</strong></span>
                <span style="margin-left:15px;">Custos: ${formatCurrency(t.custos)}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>`;
  }).join('');
  
  allTrades=filtered;
}

function filterTrades(){
  if(currentData)renderTrades(currentData.analyzer.trades);
}

function renderHistorico(h){
  const body=document.getElementById('transactionsBody');
  body.innerHTML=h.map(x=>{
    const totalTx=x.tipo==='C'?(x.qtd*x.preco+x.custos):(x.qtd*x.preco-x.custos);
    return `<tr>
      <td>${x.idx}</td>
      <td>${x.data}</td>
      <td><strong>${x.ativo}</strong></td>
      <td>${x.tipo}</td>
      <td class="num-col">${formatQty(x.qtd)}</td>
      <td class="num-col">${formatCurrency(x.preco)}</td>
      <td class="num-col">${formatCurrency(x.custos)}</td>
      <td class="num-col">${formatCurrency(totalTx)}</td>
      <td>${x.categoria}</td>
      <td class="num-col">${formatQty(x.qtdCarteira)}</td>
      <td class="num-col profit">${formatCurrency(x.lucroRealizado)}</td>
      <td class="num-col">${formatCurrency(x.caixa)}</td>
    </tr>`;
  }).join('');
}

// ========== CARREGAMENTO E PROCESSAMENTO ==========
async function loadExcel(){
  try{
    showStatus('Carregando planilha...','info');
    const r=await fetch('carteira-export.xlsx');
    if(!r.ok)throw new Error('Arquivo carteira-export.xlsx não encontrado.');
    const ab=await r.arrayBuffer();
    const wb=XLSX.read(ab,{type:'array'});
    const sheet=wb.Sheets[wb.SheetNames[0]];
    const json=XLSX.utils.sheet_to_json(sheet);
    processData(json);
  }catch(e){showStatus('❌ '+e.message,'error');}
}

function parsePrice(val){
  if(typeof val==='string'){
    return Number(val.replace('R$','').replace('.','').replace(',','.').trim());
  }
  return Number(val);
}

function processData(json){
  const t=[];
  json.forEach(r=>{
    const asset=r["Código Ativo"]||r["Ativo"]||r["Symbol"];
    if(!asset)return;

    const dataOp=r["Data operação"]||r["Data"]||r["date"];
    const operacao=r["Operação C/V"]||r["Tipo"]||r["Type"]||'';
    const operacaoNorm=operacao.toString().trim().toUpperCase();

    if(!dataOp||(!operacaoNorm.includes('C')&&!operacaoNorm.includes('V')))return;

    const qtd=parsePrice(r["Quantidade"]||r["Qtd"]||0);
    if(qtd<0.000001)return; // Ignora quantidade zero

    t.push({
      date:dataOp,
      category:r["Categoria"]||'Outros',
      asset:asset.toString().trim(),
      type:operacaoNorm.includes('C')?'C':'V',
      quantity:qtd,
      price:parsePrice(r["Preço unitário"]||r["Preço"]||r["Price"]||0),
      corretagem:parsePrice(r["Corretagem"]||r["Brokerage"]||0),
      taxas:parsePrice(r["Taxas"]||r["Fees"]||0),
      impostos:parsePrice(r["Impostos"]||r["Taxes"]||0),
      irrf:parsePrice(r["IRRF"]||r["Withholding"]||0)
    });
  });
  
  if(t.length===0){
    showStatus('❌ Nenhuma transação válida encontrada na planilha','error');
    return;
  }
  
  const analyzer=new PortfolioAnalyzer(t);
  const prices=new Map();

  // Usa o último preço de cada ativo como preço atual (PREÇO DE MERCADO, não o líquido)
  analyzer.assets.forEach(v=>{
    let lastPrice=0;
    // Pega o preço original da última transação (não o preço líquido com custos)
    if(v.transactions.length>0){
      lastPrice=v.transactions[v.transactions.length-1].preco;
    }
    prices.set(v.symbol,lastPrice||0);
  });
  
  const fixed=getFixedIncome();
  const s=analyzer.getSummary(prices,fixed);
  
  currentData={analyzer,prices,summary:s};
  
  renderSummary(s);
  renderTable(s.assets);
  renderDetails(s.assets);
  renderChart(s.assets,s);
  renderHistorico(s.history);
  renderTrades(s.trades);

  // Renderiza todos os ativos (incluindo totalmente vendidos)
  const allAssets=analyzer.getAllAssetsData(prices);
  renderAllAssets(allAssets);

  document.getElementById('tabs').style.display='flex';
  document.getElementById('exportBtn').disabled=false;
  document.getElementById('exportExcelBtn').disabled=false;
  document.getElementById('updatePricesBtn').disabled=false;

  showStatus(`✅ Processadas ${t.length} transações com sucesso!`,'success');
}

function updatePrice(sym,val){
  if(!currentData)return;

  currentData.prices.set(sym,Number(val)||0);
  const fixed=getFixedIncome();
  const s=currentData.analyzer.getSummary(currentData.prices,fixed);

  currentData.summary=s;
  renderSummary(s);
  renderTable(s.assets);
  renderDetails(s.assets);
  renderChart(s.assets,s);

  // Atualiza também a aba de todos os ativos
  const allAssets=currentData.analyzer.getAllAssetsData(currentData.prices);
  renderAllAssets(allAssets);
}

// ========== ATUALIZAÇÃO DE PREÇOS EM TEMPO REAL ==========
async function updateRealTimePrices(){
  if(!currentData){
    showStatus('Carregue a carteira primeiro','error');
    return;
  }

  showStatus('🔄 Buscando cotações...','info');
  const btn=document.getElementById('updatePricesBtn');
  btn.disabled=true;

  const symbols=[];
  currentData.analyzer.assets.forEach(a=>{
    if(a.lotes.length>0){
      symbols.push(a.symbol);
    }
  });

  if(symbols.length===0){
    showStatus('Nenhum ativo para atualizar','info');
    btn.disabled=false;
    return;
  }

  // Chave API Brapi (plano gratuito: 15k req/mês, 1 ativo por vez)
  const apiKey='p5cuWQgjyHT1m4BEFespL4';

  let successCount=0;
  let errorCount=0;

  try{
    // Plano gratuito permite apenas 1 ativo por requisição
    for(const symbol of symbols){
      try{
        const url=`https://brapi.dev/api/quote/${symbol}?token=${apiKey}`;
        const response=await fetch(url);

        if(response.status===401){
          showStatus('❌ Chave API inválida!','error');
          btn.disabled=false;
          return;
        }

        const data=await response.json();

        if(data.results&&Array.isArray(data.results)&&data.results[0]){
          const stock=data.results[0];
          if(stock.regularMarketPrice&&stock.regularMarketPrice>0){
            currentData.prices.set(symbol,stock.regularMarketPrice);
            successCount++;
            console.log(`✓ ${symbol}: R$ ${stock.regularMarketPrice.toFixed(2)}`);
          }else{
            errorCount++;
            console.log(`✗ ${symbol}: Preço não disponível`);
          }
        }else{
          errorCount++;
          console.log(`✗ ${symbol}: Não encontrado na B3`);
        }

      }catch(e){
        console.error(`✗ ${symbol}:`,e.message);
        errorCount++;
      }

      // Delay de 200ms entre requests (plano gratuito)
      await new Promise(resolve=>setTimeout(resolve,200));
    }

    // Atualiza visualização
    const fixed=getFixedIncome();
    const s=currentData.analyzer.getSummary(currentData.prices,fixed);
    currentData.summary=s;

    renderSummary(s);
    renderTable(s.assets);
    renderDetails(s.assets);
    renderChart(s.assets,s);

    // Atualiza também a aba de todos os ativos
    const allAssets=currentData.analyzer.getAllAssetsData(currentData.prices);
    renderAllAssets(allAssets);

    if(successCount>0){
      showStatus(`✅ ${successCount} cotações atualizadas${errorCount>0?` (${errorCount} não encontradas)`:''}!`,'success');
    }else{
      showStatus('❌ Não foi possível atualizar. Edite os preços manualmente na tabela.','error');
    }

  }catch(e){
    showStatus('❌ Erro: '+e.message,'error');
  }finally{
    btn.disabled=false;
  }
}

// ========== EXPORTAÇÃO ==========
function exportReport(){
  if(!currentData){
    showStatus('Nada para exportar','error');
    return;
  }
  
  const s=currentData.summary;
  const exportData={
    dataExportacao:new Date().toLocaleString('pt-BR'),
    resumo:{
      patrimonioTotal:s.totalValue,
      totalInvestido:s.invested,
      resultadoTotal:s.profit,
      rentabilidade:s.profitPercent,
      lucroRealizado:s.realizedProfit,
      lucroEmAberto:s.profit-s.realizedProfit,
      caixaOperacional:s.cash,
      rendaFixa:s.fixedIncome
    },
    estatisticasTrades:{
      totalTrades:s.tradeStats.total,
      tradesComLucro:s.tradeStats.ganhos,
      tradesComPrejuizo:s.tradeStats.perdas,
      lucroTotalTrades:s.tradeStats.lucroTotal,
      perdaTotalTrades:s.tradeStats.perdaTotal
    },
    ativos:s.assets.map(a=>({
      ativo:a.symbol,
      categoria:a.category,
      quantidadeAtual:a.quantity,
      quantidadeComprada:a.totalQuantityBought,
      quantidadeVendida:a.totalQuantitySold,
      precoMedio:a.avgPrice,
      precoDiluido:a.precoDiluido,
      precoAtual:a.currentPrice,
      custoTotal:a.totalCost,
      valorAtual:a.currentValue,
      lucroRealizado:a.profitRealized,
      lucroEmAberto:a.profitUnreal,
      rentabilidade:a.profitPercent,
      custosTotais:a.totalCustos
    })),
    tradesRealizados:s.trades.map(t=>({
      ativo:t.ativo,
      categoria:t.categoria,
      quantidade:t.qtd,
      precoCompra:t.precoCompra,
      precoVenda:t.precoVenda,
      lucroUnitario:t.lucroUnitario,
      lucroTotal:t.lucroTotal,
      dataCompra:t.dataCompra,
      dataVenda:t.dataVenda,
      custos:t.custos,
      diasDecorridos:Math.floor((new Date(t.dataVenda)-new Date(t.dataCompra))/(1000*60*60*24))
    })),
    historico:s.history.map(h=>{
      const totalTx=h.tipo==='C'?(h.qtd*h.preco+h.custos):(h.qtd*h.preco-h.custos);
      return{
        numero:h.idx,
        data:h.data,
        ativo:h.ativo,
        tipo:h.tipo,
        quantidade:h.qtd,
        precoUnitario:h.preco,
        custos:h.custos,
        totalTransacao:totalTx,
        categoria:h.categoria,
        quantidadeEmCarteira:h.qtdCarteira,
        lucroRealizadoAcumulado:h.lucroRealizado,
        caixaAcumulada:h.caixa
      };
    })
  };
  
  const blob=new Blob([JSON.stringify(exportData,null,2)],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download=`relatorio-investimentos-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  showStatus('✅ Relatório JSON exportado','success');
}

function exportExcel(){
  if(!currentData){
    showStatus('Nada para exportar','error');
    return;
  }
  
  const s=currentData.summary;
  const wb=XLSX.utils.book_new();
  
  // Aba 1: Resumo
  const resumoData=[
    ['RESUMO DA CARTEIRA'],
    ['Data de Exportação',new Date().toLocaleString('pt-BR')],
    [],
    ['Patrimônio Total',s.totalValue],
    ['Total Investido',s.invested],
    ['Resultado Total',s.profit],
    ['Rentabilidade %',s.profitPercent],
    ['Lucro Realizado',s.realizedProfit],
    ['Lucro em Aberto',s.profit-s.realizedProfit],
    ['Caixa Operacional',s.cash],
    ['Renda Fixa',s.fixedIncome],
    [],
    ['ESTATÍSTICAS DE TRADES'],
    ['Total de Trades',s.tradeStats.total],
    ['Trades com Lucro',s.tradeStats.ganhos],
    ['Trades com Prejuízo',s.tradeStats.perdas],
    ['Lucro Total em Trades',s.tradeStats.lucroTotal],
    ['Perda Total em Trades',s.tradeStats.perdaTotal]
  ];
  const wsResumo=XLSX.utils.aoa_to_sheet(resumoData);
  XLSX.utils.book_append_sheet(wb,wsResumo,'Resumo');
  
  // Aba 2: Ativos Atuais
  const ativosData=[
    ['Ativo','Categoria','Qtd Atual','Qtd Comprada','Qtd Vendida','Preço Médio','Preço Atual','Custo Total','Valor Atual','Lucro Realizado','Lucro em Aberto','Rentabilidade %','Custos Pagos']
  ];
  s.assets.forEach(a=>{
    ativosData.push([
      a.symbol,
      a.category,
      a.quantity,
      a.totalQuantityBought,
      a.totalQuantitySold,
      a.avgPrice,
      a.currentPrice,
      a.totalCost,
      a.currentValue,
      a.profitRealized,
      a.profitUnreal,
      a.profitPercent,
      a.totalCustos
    ]);
  });
  const wsAtivos=XLSX.utils.aoa_to_sheet(ativosData);
  XLSX.utils.book_append_sheet(wb,wsAtivos,'Ativos');
  
  // Aba 3: Trades Realizados
  const tradesData=[
    ['Ativo','Categoria','Quantidade','Preço Compra','Preço Venda','Lucro/Qtd','Lucro Total','Data Compra','Data Venda','Dias','Custos']
  ];
  s.trades.forEach(t=>{
    const dias=Math.floor((new Date(t.dataVenda)-new Date(t.dataCompra))/(1000*60*60*24));
    tradesData.push([
      t.ativo,
      t.categoria,
      t.qtd,
      t.precoCompra,
      t.precoVenda,
      t.lucroUnitario,
      t.lucroTotal,
      t.dataCompra,
      t.dataVenda,
      dias,
      t.custos
    ]);
  });
  const wsTrades=XLSX.utils.aoa_to_sheet(tradesData);
  XLSX.utils.book_append_sheet(wb,wsTrades,'Trades');
  
  // Aba 4: Histórico Completo
  const historicData=[
    ['#','Data','Ativo','Tipo','Quantidade','Preço Unitário','Custos','Total Transação','Categoria','Qtd em Carteira','Lucro Acumulado','Caixa Acumulada']
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
  
  // Salva arquivo
  XLSX.writeFile(wb,`relatorio-investimentos-${new Date().toISOString().split('T')[0]}.xlsx`);
  showStatus('✅ Relatório XLSX exportado','success');
}

// ========== INICIALIZAÇÃO ==========
window.addEventListener('load',()=>{
  document.getElementById('fixedIncomeInput').addEventListener('change',()=>{
    if(currentData){
      updatePrice('DUMMY',0);
    }
  });

  // Auto-load da planilha ao abrir o sistema
  loadExcel();
});
