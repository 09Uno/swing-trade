// ========== CARREGAMENTO E PROCESSAMENTO DE DADOS ==========

import { PortfolioAnalyzer } from '../models/PortfolioAnalyzer.js';
import { showStatus, getFixedIncome, parsePrice } from '../utils/helpers.js';
import { renderSummary, renderChart } from '../ui/summary.js';
import { renderTable, renderAllAssets, renderDetails, filterCurrentAssets, filterAllAssets } from '../ui/tables.js';
import { renderTrades, renderHistorico, filterTrades, exportReport, exportExcel } from '../ui/other.js';

export let currentData = null;
export let allTrades = [];

// ========== FUNÇÕES DE PERSISTÊNCIA DE PREÇOS ==========

// Mapeia símbolos de criptomoedas para IDs do CoinGecko
function getCryptoId(symbol) {
  const cryptoMap = {
    'BTC': 'bitcoin',
    'BITCOIN': 'bitcoin',
    'ETH': 'ethereum',
    'ETHEREUM': 'ethereum',
    'BNB': 'binancecoin',
    'SOL': 'solana',
    'SOLANA': 'solana',
    'ADA': 'cardano',
    'CARDANO': 'cardano',
    'XRP': 'ripple',
    'RIPPLE': 'ripple',
    'DOT': 'polkadot',
    'POLKADOT': 'polkadot',
    'DOGE': 'dogecoin',
    'DOGECOIN': 'dogecoin',
    'MATIC': 'matic-network',
    'POLYGON': 'matic-network',
    'LTC': 'litecoin',
    'LITECOIN': 'litecoin',
    'LINK': 'chainlink',
    'CHAINLINK': 'chainlink',
    'UNI': 'uniswap',
    'UNISWAP': 'uniswap',
    'AVAX': 'avalanche-2',
    'AVALANCHE': 'avalanche-2',
    'ATOM': 'cosmos',
    'COSMOS': 'cosmos',
    'FTM': 'fantom',
    'FANTOM': 'fantom',
    'ALGO': 'algorand',
    'ALGORAND': 'algorand',
    'NEAR': 'near',
    'APT': 'aptos',
    'APTOS': 'aptos',
    'OP': 'optimism',
    'OPTIMISM': 'optimism',
    'ARB': 'arbitrum',
    'ARBITRUM': 'arbitrum',
    'USDT': 'tether',
    'USDC': 'usd-coin',
    'DAI': 'dai',
    'BUSD': 'binance-usd'
  };
  
  return cryptoMap[symbol.toUpperCase()] || null;
}

// Carrega preços salvos do localStorage
function loadSavedPrices() {
  try {
    const saved = localStorage.getItem('savedPrices');
    if (!saved) {
      console.log('💾 Nenhum preço salvo encontrado');
      return {};
    }
    const prices = JSON.parse(saved);
    console.log('💾 Preços salvos carregados:', prices);
    return prices;
  } catch (error) {
    console.error('❌ Erro ao carregar preços salvos:', error);
    return {};
  }
}

// Salva preço no localStorage
function savePriceToStorage(symbol, price) {
  try {
    const savedPrices = JSON.parse(localStorage.getItem('savedPrices') || '{}');
    savedPrices[symbol] = {
      price: Number(price),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('savedPrices', JSON.stringify(savedPrices));
    console.log(`💾 Preço salvo: ${symbol} = R$ ${price}`);
  } catch (error) {
    console.error('Erro ao salvar preço:', error);
  }
}

// Carrega dados do banco (fonte única de verdade)
export async function loadFromDatabase(){
  const { getTransacoes } = await import('../utils/dataSync.js');

  try {
    console.log('📂 Carregando dados do banco...');
    const transacoes = await getTransacoes();

    if (transacoes && transacoes.length > 0) {
      console.log('✅ Carregadas', transacoes.length, 'transações do banco');
      processDataFromDatabase(transacoes);
      return true;
    } else {
      console.log('ℹ️ Nenhuma transação no banco ainda');
      showStatus('Nenhum dado encontrado. Importe uma planilha ou adicione transações manualmente.', 'info');
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar do banco:', error);
    showStatus('Erro ao carregar dados: ' + error.message, 'error');
    return false;
  }
}

// Importa Excel e SALVA NO BANCO
export async function loadExcel(){
  const fileInput = document.getElementById('excelFile');

  // Se não tem arquivo selecionado, tenta carregar do banco
  if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
    console.log('📊 Nenhum arquivo selecionado, carregando do banco...');
    return await loadFromDatabase();
  }

  try {
    const { importarTransacoes } = await import('../utils/dataSync.js');

    showStatus('Importando planilha...','info');

    const file = fileInput.files[0];
    const ab = await file.arrayBuffer();
    const wb = XLSX.read(ab, {type: 'array'});
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    console.log('📄 Lidas', json.length, 'linhas do Excel');

    // Converte para formato do banco
    const transacoes = convertExcelToDatabase(json);

    if (transacoes.length === 0) {
      showStatus('❌ Nenhuma transação válida encontrada na planilha', 'error');
      return;
    }

    console.log('💾 Salvando', transacoes.length, 'transações no banco...');

    // SALVA TUDO NO BANCO
    await importarTransacoes(transacoes);

    showStatus(`✅ ${transacoes.length} transações importadas com sucesso!`, 'success');

    // Recarrega do banco
    await loadFromDatabase();

  } catch(e) {
    showStatus('❌ '+e.message,'error');
    console.error('Erro ao importar:', e);
  }
}

// Converte Excel para formato do banco
function convertExcelToDatabase(json) {
  const transacoes = [];

  json.forEach(r => {
    const asset = r["Código Ativo"] || r["Ativo"] || r["Symbol"];
    if (!asset) return;

    const dataOp = r["Data operação"] || r["Data"] || r["date"];
    const operacao = r["Operação C/V"] || r["Tipo"] || r["Type"] || '';
    const operacaoNorm = operacao.toString().trim().toUpperCase();

    if (!dataOp || (!operacaoNorm.includes('C') && !operacaoNorm.includes('V'))) return;

    const qtd = parsePrice(r["Quantidade"] || r["Qtd"] || 0);
    if (qtd < 0.000001) return;

    const corretagem = parsePrice(r["Corretagem"] || r["Brokerage"] || 0);
    const taxas = parsePrice(r["Taxas"] || r["Fees"] || 0);
    const impostos = parsePrice(r["Impostos"] || r["Taxes"] || 0);
    const irrf = parsePrice(r["IRRF"] || r["Withholding"] || 0);

    const custos = corretagem + taxas + impostos + irrf;

    transacoes.push({
      data: dataOp,
      ativo: asset.toString().trim(),
      tipo: operacaoNorm.includes('C') ? 'C' : 'V',
      qtd: qtd,
      preco: parsePrice(r["Preço unitário"] || r["Preço"] || r["Price"] || 0),
      custos: custos,
      categoria: r["Categoria"] || 'Outros',
      observacoes: ''
    });
  });

  return transacoes;
}

export function processData(json){
  const t=[];
  json.forEach(r=>{
    const asset=r["Código Ativo"]||r["Ativo"]||r["Symbol"];
    if(!asset)return;

    const dataOp=r["Data operação"]||r["Data"]||r["date"];
    const operacao=r["Operação C/V"]||r["Tipo"]||r["Type"]||'';
    const operacaoNorm=operacao.toString().trim().toUpperCase();

    if(!dataOp||(!operacaoNorm.includes('C')&&!operacaoNorm.includes('V')))return;

    const qtd=parsePrice(r["Quantidade"]||r["Qtd"]||0);
    if(qtd<0.000001)return;

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
  
  // Carrega preços salvos
  const savedPrices = loadSavedPrices();

  analyzer.assets.forEach(v=>{
    let lastPrice=0;
    
    // Verifica se existe preço salvo para este ativo
    if (savedPrices[v.symbol]) {
      lastPrice = savedPrices[v.symbol].price;
      console.log(`📌 Usando preço salvo para ${v.symbol}: ${lastPrice}`);
    } else if(v.transactions.length>0){
      lastPrice=v.transactions[v.transactions.length-1].preco;
    }
    
    prices.set(v.symbol,lastPrice||0);
  });

  const fixed=getFixedIncome();
  const proventosManager = window.proventosManager || null;
  const s=analyzer.getSummary(prices,fixed,proventosManager);

  currentData={analyzer,prices,summary:s};
  window.currentData=currentData; // Expõe globalmente

  renderSummary(s);
  renderTable(s.assets);
  renderDetails(s.assets);
  renderChart(s.assets,s);
  renderHistorico(s.history);
  renderTrades(s.trades);

  const allAssets=analyzer.getAllAssetsData(prices);
  renderAllAssets(allAssets);

  document.getElementById('tabs').style.display='flex';
  document.getElementById('exportBtn').disabled=false;
  document.getElementById('exportExcelBtn').disabled=false;
  document.getElementById('updatePricesBtn').disabled=false;

  showStatus(`✅ Processadas ${t.length} transações com sucesso!`,'success');
}

// Processa dados que vieram do banco/LocalStorage
export function processDataFromDatabase(transactions){
  console.log('🔄 Convertendo transações do banco para formato do sistema...');

  const t = transactions.map(trans => {
    // Converte do formato banco {data, ativo, tipo, qtd, preco, custos, categoria}
    // Para formato sistema {date, category, asset, type, quantity, price, corretagem, taxas, impostos, irrf}

    return {
      id: trans.id, // IMPORTANTE: Mantém o ID
      date: trans.data,
      category: trans.categoria || 'Outros',
      asset: trans.ativo,
      type: trans.tipo, // Já é 'C' ou 'V'
      quantity: trans.qtd,
      price: trans.preco,
      corretagem: trans.custos || 0,
      taxas: 0,
      impostos: 0,
      irrf: 0
    };
  });

  console.log('✅ Transações convertidas:', t.length);

  // Guarda as transações originais
  if (!window.currentData) {
    window.currentData = {};
  }
  window.currentData.transactions = transactions;

  // Processa normalmente
  const analyzer = new PortfolioAnalyzer(t);
  const prices = new Map();
  
  // Carrega preços salvos
  const savedPrices = loadSavedPrices();

  analyzer.assets.forEach(v => {
    let lastPrice = 0;
    
    // Verifica se existe preço salvo para este ativo
    if (savedPrices[v.symbol]) {
      lastPrice = savedPrices[v.symbol].price;
      console.log(`📌 Usando preço salvo para ${v.symbol}: ${lastPrice}`);
    } else if (v.transactions.length > 0) {
      lastPrice = v.transactions[v.transactions.length - 1].preco;
    }
    
    prices.set(v.symbol, lastPrice || 0);
  });

  const fixed = getFixedIncome();
  const proventosManager = window.proventosManager || null;
  const s = analyzer.getSummary(prices, fixed, proventosManager);

  currentData = { analyzer, prices, summary: s, transactions };
  window.currentData = currentData;

  renderSummary(s);
  renderTable(s.assets);
  renderDetails(s.assets);
  renderChart(s.assets, s);
  renderHistorico(s.history);
  renderTrades(s.trades);

  const allAssets = analyzer.getAllAssetsData(prices);
  renderAllAssets(allAssets);

  document.getElementById('tabs').style.display = 'flex';
  document.getElementById('exportBtn').disabled = false;
  document.getElementById('exportExcelBtn').disabled = false;
  document.getElementById('updatePricesBtn').disabled = false;

  showStatus(`✅ Processadas ${t.length} transações com sucesso!`, 'success');
}

export function updatePrice(sym,val){
  if(!currentData)return;

  const newPrice = Number(val) || 0;
  console.log(`🔄 Atualizando preço de ${sym}: ${val} -> ${newPrice}`);
  
  currentData.prices.set(sym, newPrice);
  
  // Salva o preço no localStorage
  savePriceToStorage(sym, newPrice);
  
  const fixed=getFixedIncome();
  const proventosManager = window.proventosManager || null;
  const s=currentData.analyzer.getSummary(currentData.prices,fixed,proventosManager);

  currentData.summary=s;
  renderSummary(s);
  renderTable(s.assets);
  renderDetails(s.assets);
  renderChart(s.assets,s);

  const allAssets=currentData.analyzer.getAllAssetsData(currentData.prices);
  renderAllAssets(allAssets);
  
  showStatus(`💰 Preço de ${sym} atualizado para R$ ${Number(val).toFixed(2)}`, 'success');
}

export function updateFixedIncome(){
  if(!currentData)return;

  const fixed=getFixedIncome();
  const proventosManager = window.proventosManager || null;
  const s=currentData.analyzer.getSummary(currentData.prices,fixed,proventosManager);

  currentData.summary=s;
  renderSummary(s);
  renderTable(s.assets);
  renderDetails(s.assets);
  renderChart(s.assets,s);

  const allAssets=currentData.analyzer.getAllAssetsData(currentData.prices);
  renderAllAssets(allAssets);
}

export async function updateRealTimePrices(){
  if(!currentData){
    showStatus('Carregue a carteira primeiro','error');
    return;
  }

  showStatus('🔄 Buscando cotações...','info');
  const btn=document.getElementById('updatePricesBtn');
  btn.disabled=true;

  const symbols=[];
  const cryptoSymbols = [];
  
  currentData.analyzer.assets.forEach(a=>{
    if(a.lotes.length>0){
      // Separa criptomoedas dos outros ativos
      if(a.category === 'Cripto' || a.category === 'Criptomoedas'){
        cryptoSymbols.push({symbol: a.symbol, category: a.category});
      } else {
        symbols.push(a.symbol);
      }
    }
  });

  if(symbols.length === 0 && cryptoSymbols.length === 0){
    showStatus('Nenhum ativo para atualizar','info');
    btn.disabled=false;
    return;
  }

  const apiKey='p5cuWQgjyHT1m4BEFespL4';
  let successCount=0;
  let errorCount=0;

  try{
    // Atualiza ativos tradicionais (B3)
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
            const newPrice = stock.regularMarketPrice;
            currentData.prices.set(symbol, newPrice);
            
            // SALVA o preço no localStorage
            savePriceToStorage(symbol, newPrice);
            
            successCount++;
            console.log(`✓ ${symbol}: R$ ${newPrice.toFixed(2)} (salvo)`);
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

      await new Promise(resolve=>setTimeout(resolve,200));
    }

    // Atualiza criptomoedas (CoinGecko)
    for(const crypto of cryptoSymbols){
      try{
        const cryptoId = getCryptoId(crypto.symbol);
        if(!cryptoId){
          console.log(`✗ ${crypto.symbol}: Criptomoeda não mapeada`);
          errorCount++;
          continue;
        }

        // API CoinGecko (gratuita, sem API key necessária)
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${cryptoId}&vs_currencies=brl`;
        const response = await fetch(url);
        
        if(!response.ok){
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        
        if(data[cryptoId] && data[cryptoId].brl){
          const newPrice = data[cryptoId].brl;
          currentData.prices.set(crypto.symbol, newPrice);
          
          // SALVA o preço no localStorage
          savePriceToStorage(crypto.symbol, newPrice);
          
          successCount++;
          console.log(`✓ ${crypto.symbol}: R$ ${newPrice.toFixed(2)} (salvo)`);
        }else{
          errorCount++;
          console.log(`✗ ${crypto.symbol}: Preço não disponível`);
        }

      }catch(e){
        console.error(`✗ ${crypto.symbol}:`, e.message);
        errorCount++;
      }

      await new Promise(resolve=>setTimeout(resolve,500)); // CoinGecko tem rate limit menor
    }

    const fixed=getFixedIncome();
    const proventosManager = window.proventosManager || null;
    const s=currentData.analyzer.getSummary(currentData.prices,fixed,proventosManager);
    currentData.summary=s;

    renderSummary(s);
    renderTable(s.assets);
    renderDetails(s.assets);
    renderChart(s.assets,s);

    const allAssets=currentData.analyzer.getAllAssetsData(currentData.prices);
    renderAllAssets(allAssets);

    const totalAtivos = symbols.length + cryptoSymbols.length;
    if(successCount>0){
      const msg = `✅ ${successCount}/${totalAtivos} cotações atualizadas${errorCount>0?` (${errorCount} falhas)`:''}!`;
      showStatus(msg,'success');
    }else{
      showStatus('❌ Não foi possível atualizar. Edite os preços manualmente na tabela.','error');
    }

  }catch(e){
    showStatus('❌ Erro: '+e.message,'error');
  }finally{
    btn.disabled=false;
  }
}

// Expõe funções e dados globalmente
window.updatePrice = updatePrice;
window.updateFixedIncome = updateFixedIncome;
window.filterCurrentAssets = filterCurrentAssets;
window.filterAllAssets = filterAllAssets;
window.filterTrades = filterTrades;
window.exportReport = exportReport;
window.exportExcel = exportExcel;
