// ========== PONTO DE ENTRADA PRINCIPAL ==========

import { switchTab, showStatus } from './utils/helpers.js';
import { loadExcel, updateRealTimePrices, updateFixedIncome, currentData } from './data/dataLoader.js';
import { filterCurrentAssets, filterAllAssets } from './ui/tables.js';
import { proventosManager, initProventos } from './controllers/proventosController.js';
import { rendaFixaManager, initRendaFixa } from './controllers/rendaFixaController.js';
import { filterRendaFixa } from './ui/rendaFixa.js';
import { initTransacoesController } from './controllers/transacoesController.js';
import { initDataSync, isUsingApi, getTransacoes } from './utils/dataSync.js';

// Expõe funções necessárias globalmente para onclick
window.switchTab = switchTab;
window.showStatus = showStatus;
window.loadExcel = loadExcel;
window.updateRealTimePrices = updateRealTimePrices;
window.filterCurrentAssets = filterCurrentAssets;
window.filterAllAssets = filterAllAssets;
window.proventosManager = proventosManager;
window.rendaFixaManager = rendaFixaManager;
window.filterRendaFixa = filterRendaFixa;
window.initProventos = initProventos;
window.initRendaFixa = initRendaFixa;
window.isUsingApi = isUsingApi;

// Inicialização
window.addEventListener('load', async ()=>{
  // Inicializa sincronização de dados
  const apiDisponivel = await initDataSync();

  if (apiDisponivel) {
    console.log('✅ API conectada - Dados serão salvos no SQLite');
  } else {
    console.log('⚠️ API não disponível - Dados serão salvos no LocalStorage');
  }

  const fixedIncomeInput = document.getElementById('fixedIncomeInput');

  // Atualiza quando o valor do caixa é alterado
  if (fixedIncomeInput) {
    fixedIncomeInput.addEventListener('input',()=>{
      if(currentData){
        updateFixedIncome();
      }
    });
  }

  // SEMPRE carrega do banco (fonte única de verdade)
  console.log('🚀 Iniciando sistema...');

  const { loadFromDatabase } = await import('./data/dataLoader.js');
  await loadFromDatabase();

  // Inicializa proventos
  initProventos();

  // Inicializa renda fixa
  initRendaFixa();

  // Inicializa controller de transações
  initTransacoesController();
});
