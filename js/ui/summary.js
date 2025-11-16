// ========== RENDERIZAÇÃO DE RESUMO E GRÁFICOS ==========

import { formatCurrency, formatPercent } from '../utils/formatters.js';

let categoryChart = null;

export function renderSummary(s){
  const c=document.getElementById('summaryCards');
  const clsProfit=s.profit>=0?'positive':'negative';

  const lucroAberto = s.current - s.invested;
  const lucroTotal = s.realizedProfit + lucroAberto;
  const clsLucroTotal = lucroTotal >= 0 ? 'positive' : 'negative';

  const resultadoTrades = s.tradeStats.lucroTotal + s.tradeStats.perdaTotal;
  const clsTrade = resultadoTrades >= 0 ? 'positive' : 'negative';

  // Obtém total de proventos
  const totalProventos = window.proventosManager ? window.proventosManager.getTotalProventos() : 0;

  // Obtém total de renda fixa
  const totalRendaFixa = s.totalRendaFixa || (window.rendaFixaManager ? window.rendaFixaManager.getValorTotal() : 0);

  c.innerHTML=`
  <div class="card neutral">
    <h3 style="font-size:0.75rem;">💰 Patrimônio Total</h3>
    <div class="value">${formatCurrency(s.totalValue)}</div>
  </div>
  <div class="card neutral">
    <h3 style="font-size:0.75rem;">📥 Total Investido</h3>
    <div class="value">${formatCurrency(s.invested)}</div>
  </div>
  <div class="card ${clsProfit}">
    <h3 style="font-size:0.75rem;">📊 Resultado Total</h3>
    <div class="value">${formatCurrency(s.profit)}</div>
    <div style="font-size:.85em;margin-top:5px;">${formatPercent(s.profitPercent)}</div>
  </div>
  <div class="card ${clsLucroTotal}">
    <h3 style="font-size:0.75rem;">🎯 Lucro Total</h3>
    <div class="value">${formatCurrency(lucroTotal)}</div>
  </div>
  <div class="card positive">
    <h3 style="font-size:0.75rem;">💸 Lucro Realizado</h3>
    <div class="value">${formatCurrency(s.realizedProfit)}</div>
  </div>
  <div class="card">
    <h3 style="font-size:0.75rem;">📈 Lucro em Aberto</h3>
    <div class="value ${lucroAberto>=0?'profit':'loss'}">${formatCurrency(lucroAberto)}</div>
  </div>
  <div class="card ${clsTrade}">
    <h3 style="font-size:0.75rem;">💹 Resultado em Trades</h3>
    <div class="value">${formatCurrency(resultadoTrades)}</div>
    <div style="font-size:.85em;margin-top:5px;">${s.tradeStats.ganhos}✅ / ${s.tradeStats.perdas}❌</div>
  </div>
  ${totalProventos > 0 ? `
  <div class="card positive">
    <h3 style="font-size:0.75rem;">💵 Proventos Recebidos</h3>
    <div class="value">${formatCurrency(totalProventos)}</div>
    <div style="font-size:.85em;margin-top:5px;">${window.proventosManager.getProventos().length} pagamentos</div>
  </div>
  ` : ''}
  ${totalRendaFixa > 0 ? `
  <div class="card positive">
    <h3 style="font-size:0.75rem;">🏦 Renda Fixa</h3>
    <div class="value">${formatCurrency(totalRendaFixa)}</div>
    <div style="font-size:.85em;margin-top:5px;">${window.rendaFixaManager.getInvestimentos().length} investimentos</div>
  </div>
  ` : ''}
  `;
}

export function renderChart(a,s){
  console.log('[DEBUG] renderChart iniciado');

  if(typeof Chart === 'undefined'){
    console.error('Chart.js não está carregado!');
    return;
  }

  const container=document.getElementById('categoryChartContainer');
  const canvas=document.getElementById('categoryChart');

  console.log('[DEBUG] container:', container);
  console.log('[DEBUG] canvas:', canvas);

  if(!canvas){
    console.error('Canvas categoryChart não encontrado');
    return;
  }

  const cat={};
  
  // Adiciona categorias das transações
  a.forEach(v=>{cat[v.category]=(cat[v.category]||0)+v.currentValue;});

  // Adiciona Renda Fixa como categoria separada se houver
  const totalRendaFixa = s.totalRendaFixa || 0;
  if (totalRendaFixa > 0) {
    cat['Renda Fixa'] = (cat['Renda Fixa'] || 0) + totalRendaFixa;
  }

  // Adiciona Proventos como categoria separada se houver
  const totalProventos = s.totalProventos || 0;
  if (totalProventos > 0) {
    cat['Proventos'] = (cat['Proventos'] || 0) + totalProventos;
  }

  console.log('[DEBUG] Categorias:', cat);

  if(Object.keys(cat).length===0){
    console.warn('[DEBUG] Nenhuma categoria encontrada!');
    container.style.display='none';
    return;
  }

  const labels=Object.keys(cat);
  const data=Object.values(cat);
  const colors=['#2ecc71','#e74c3c','#3498db','#f1c40f','#9b59b6','#1abc9c','#e67e22','#95a5a6'];

  console.log('[DEBUG] Criando gráfico com labels:', labels, 'data:', data);

  if(categoryChart)categoryChart.destroy();

  const ctx=canvas.getContext('2d');

  try{
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
      maintainAspectRatio:true,
      plugins:{
        legend:{position:'bottom',labels:{color:'#e6edf3',padding:15}},
        tooltip:{
          callbacks:{
            label:function(context){
              const total=data.reduce((a,b)=>a+b,0);
              const percent=((context.parsed/total)*100).toFixed(2);
              return ` ${context.label}: ${formatCurrency(context.parsed)} (${percent}%)`;
            }
          }
        }
      }
    }
  });

    console.log('[DEBUG] Gráfico criado com sucesso!');
    container.style.display='block';

  }catch(error){
    console.error('[DEBUG] Erro ao criar gráfico:', error);
  }

  // Renderiza resumo por categoria
  renderCategorySummary(a, s);
}

export function renderCategorySummary(assets, summary){
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

  // Renderiza gráficos adicionais
  if(summary){
    renderAdditionalCharts(summary);
  }
}

let profitChart = null;
let patrimonioChart = null;

export function renderAdditionalCharts(summary){
  // Gráfico de Lucro Realizado vs Aberto
  const profitContainer=document.getElementById('profitChartContainer');
  const profitCanvas=document.getElementById('profitChart');

  if(profitCanvas){
    const lucroRealizado=summary.realizedProfit;
    const lucroAberto=summary.current-summary.invested;

    if(profitChart)profitChart.destroy();

    const ctx=profitCanvas.getContext('2d');
    profitChart=new Chart(ctx,{
      type:'bar',
      data:{
        labels:['Lucro Realizado','Lucro em Aberto'],
        datasets:[{
          label:'Valor (R$)',
          data:[lucroRealizado,lucroAberto],
          backgroundColor:[
            lucroRealizado>=0?'#2ecc71':'#e74c3c',
            lucroAberto>=0?'#3498db':'#e67e22'
          ],
          borderColor:'#161b22',
          borderWidth:2
        }]
      },
      options:{
        responsive:true,
        maintainAspectRatio:true,
        plugins:{
          legend:{display:false},
          tooltip:{
            callbacks:{
              label:function(context){
                return formatCurrency(context.parsed.y);
              }
            }
          }
        },
        scales:{
          y:{
            ticks:{color:'#e6edf3',callback:function(value){return formatCurrency(value);}},
            grid:{color:'#30363d'}
          },
          x:{
            ticks:{color:'#e6edf3'},
            grid:{color:'#30363d'}
          }
        }
      }
    });
    profitContainer.style.display='block';
  }

  // Gráfico de Composição do Patrimônio
  const patrimonioContainer=document.getElementById('patrimonioChartContainer');
  const patrimonioCanvas=document.getElementById('patrimonioChart');

  if(patrimonioCanvas){
    const valorAtivos=summary.current;
    const caixa=summary.cash;

    if(patrimonioChart)patrimonioChart.destroy();

    const ctx=patrimonioCanvas.getContext('2d');
    patrimonioChart=new Chart(ctx,{
      type:'doughnut',
      data:{
        labels:['Ativos em Carteira','Caixa / Renda Fixa'],
        datasets:[{
          data:[valorAtivos,caixa],
          backgroundColor:['#3498db','#2ecc71'],
          borderColor:'#161b22',
          borderWidth:2
        }]
      },
      options:{
        responsive:true,
        maintainAspectRatio:true,
        plugins:{
          legend:{position:'bottom',labels:{color:'#e6edf3',padding:15}},
          tooltip:{
            callbacks:{
              label:function(context){
                const total=valorAtivos+caixa;
                const percent=total>0?((context.parsed/total)*100).toFixed(2):0;
                return ` ${context.label}: ${formatCurrency(context.parsed)} (${percent}%)`;
              }
            }
          }
        }
      }
    });
    patrimonioContainer.style.display='block';
  }
}
