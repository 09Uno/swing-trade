// ========== CLASSE PRINCIPAL DE ANÁLISE ==========

export class PortfolioAnalyzer{
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
      // Se já for um Date object, retorna direto
      if(dateStr instanceof Date) return dateStr;
      
      // Se for string, converte
      if(typeof dateStr === 'string') {
        const parts=dateStr.split('/');
        if(parts.length===3){
          // DD/MM/YYYY -> YYYY-MM-DD
          return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
        return new Date(dateStr);
      }
      
      // Fallback: tenta criar Date do valor
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
          transactions:[],
          totalBoughtPrice:0,
          totalSoldPrice:0,
          totalBought:0,
          totalSold:0
        });
      }

      const asset=this.assets.get(sym);

      if(['BUY','C','COMPRA'].includes(type)){
        // COMPRA - ADICIONA LOTE
        const precoLiquido=p+custoUnitario;
        asset.lotes.push({q:q,p:precoLiquido,dataCompra:t.date,precoOriginal:p,custoUnitario:custoUnitario});
        asset.quantity+=q;
        asset.totalQuantityBought+=q;
        asset.totalCustos+=totalCustos;
        asset.totalBoughtPrice+=(q*p+totalCustos);
        asset.totalBought+=q;
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
        if(q<0.000001) return;

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
        asset.totalSoldPrice+=(q*p-totalCustos);
        asset.totalSold+=q;
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
        id: t.id, // ID da transação original
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

  getSummary(prices,fixed,proventosManager=null){
    const a=this.getAssetData(prices);
    let inv=0,cur=0,real=0;

    // Calcula investimento ATUAL (só lotes em aberto)
    this.assets.forEach(v=>{
      v.lotes.forEach(l=>inv+=(l.q*l.p));
      real+=v.profitRealized;
    });

    // Valor ATUAL da carteira
    a.forEach(v=>cur+=v.currentValue);

    // Total de proventos
    const totalProventos = proventosManager ? proventosManager.getTotalProventos() : 0;

    // Total de Renda Fixa (valor atual)
    const rendaFixaManager = window.rendaFixaManager || null;
    const totalRendaFixa = rendaFixaManager ? rendaFixaManager.getValorTotal() : 0;

    // Patrimônio Total = Valor Atual dos Ativos + Caixa + Proventos + Renda Fixa
    const total=cur+fixed+totalProventos+totalRendaFixa;

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
      totalProventos:totalProventos,
      totalRendaFixa:totalRendaFixa,
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
