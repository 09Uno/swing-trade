// ========== SINCRONIZAÇÃO DE DADOS - API + LOCALSTORAGE ==========

import { transactionsApi, proventosApi, rendaFixaApi, checkApiConnection } from '../api/apiClient.js';

const STORAGE_KEYS = {
  transactions: 'swing_trade_transactions',
  proventos: 'swing_trade_proventos',
  rendaFixa: 'swing_trade_renda_fixa'
};

let useApi = false;

// Verifica se API está disponível
export async function initDataSync() {
  useApi = await checkApiConnection();
  return useApi;
}

// ========== TRANSAÇÕES ==========

export async function salvarTransacao(transacao) {
  console.log('💾 Salvando transação:', transacao);
  console.log('🔌 Usando API?', useApi);

  try {
    if (useApi) {
      // Salva na API
      console.log('📡 Salvando via API...');
      return await transactionsApi.create(transacao);
    } else {
      // Salva no LocalStorage
      console.log('💿 Salvando no LocalStorage...');
      const transactions = getTransacoesLocal();
      transacao.id = Date.now();
      transactions.push(transacao);
      localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
      console.log('✅ Salvo! Total de transações:', transactions.length);
      return transacao;
    }
  } catch (error) {
    console.error('❌ Erro ao salvar transação:', error);
    // Fallback para LocalStorage se API falhar
    console.log('⚠️ Usando fallback LocalStorage');
    const transactions = getTransacoesLocal();
    transacao.id = Date.now();
    transactions.push(transacao);
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
    console.log('✅ Salvo em fallback! Total:', transactions.length);
    return transacao;
  }
}

export async function getTransacoes() {
  console.log('📖 Carregando transações...');
  console.log('🔌 Usando API?', useApi);

  try {
    if (useApi) {
      console.log('📡 Carregando da API...');
      return await transactionsApi.getAll();
    } else {
      console.log('💿 Carregando do LocalStorage...');
      const trans = getTransacoesLocal();
      console.log('✅ Carregadas:', trans.length, 'transações');
      return trans;
    }
  } catch (error) {
    console.error('❌ Erro ao carregar transações:', error);
    console.log('⚠️ Usando fallback LocalStorage');
    return getTransacoesLocal();
  }
}

export async function importarTransacoes(transactions) {
  try {
    if (useApi) {
      await transactionsApi.import(transactions);
    } else {
      localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
    }
  } catch (error) {
    console.error('Erro ao importar transações:', error);
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
  }
}

export async function excluirTransacao(id) {
  console.log('🗑️ Excluindo transação ID:', id);

  try {
    if (useApi) {
      console.log('📡 Excluindo via API...');
      return await transactionsApi.delete(id);
    } else {
      console.log('💿 Excluindo do LocalStorage...');
      const transactions = getTransacoesLocal();
      const filtered = transactions.filter(t => t.id !== id);
      localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(filtered));
      console.log('✅ Excluída! Total restante:', filtered.length);
      return { success: true };
    }
  } catch (error) {
    console.error('❌ Erro ao excluir transação:', error);
    // Fallback LocalStorage
    const transactions = getTransacoesLocal();
    const filtered = transactions.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(filtered));
    return { success: true };
  }
}

export async function atualizarTransacao(id, dados) {
  console.log('✏️ Atualizando transação ID:', id);

  try {
    if (useApi) {
      console.log('📡 Atualizando via API...');
      return await transactionsApi.update(id, dados);
    } else {
      console.log('💿 Atualizando no LocalStorage...');
      const transactions = getTransacoesLocal();
      const index = transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        transactions[index] = { ...transactions[index], ...dados };
        localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
        console.log('✅ Atualizada!');
        return transactions[index];
      }
      throw new Error('Transação não encontrada');
    }
  } catch (error) {
    console.error('❌ Erro ao atualizar transação:', error);
    throw error;
  }
}

function getTransacoesLocal() {
  const stored = localStorage.getItem(STORAGE_KEYS.transactions);
  return stored ? JSON.parse(stored) : [];
}

// ========== PROVENTOS ==========

export async function salvarProvento(provento) {
  try {
    if (useApi) {
      return await proventosApi.create(provento);
    } else {
      const proventos = getProventosLocal();
      provento.id = Date.now();
      proventos.push(provento);
      localStorage.setItem(STORAGE_KEYS.proventos, JSON.stringify(proventos));
      return provento;
    }
  } catch (error) {
    console.error('Erro ao salvar provento:', error);
    const proventos = getProventosLocal();
    provento.id = Date.now();
    proventos.push(provento);
    localStorage.setItem(STORAGE_KEYS.proventos, JSON.stringify(proventos));
    return provento;
  }
}

export async function getProventos() {
  try {
    if (useApi) {
      return await proventosApi.getAll();
    } else {
      return getProventosLocal();
    }
  } catch (error) {
    console.error('Erro ao carregar proventos:', error);
    return getProventosLocal();
  }
}

function getProventosLocal() {
  const stored = localStorage.getItem(STORAGE_KEYS.proventos);
  return stored ? JSON.parse(stored) : [];
}

// ========== RENDA FIXA ==========

export async function salvarRendaFixa(investimento) {
  try {
    if (useApi) {
      return await rendaFixaApi.create(investimento);
    } else {
      const investimentos = getRendaFixaLocal();
      investimento.id = Date.now();
      investimentos.push(investimento);
      localStorage.setItem(STORAGE_KEYS.rendaFixa, JSON.stringify(investimentos));
      return investimento;
    }
  } catch (error) {
    console.error('Erro ao salvar renda fixa:', error);
    const investimentos = getRendaFixaLocal();
    investimento.id = Date.now();
    investimentos.push(investimento);
    localStorage.setItem(STORAGE_KEYS.rendaFixa, JSON.stringify(investimentos));
    return investimento;
  }
}

export async function getRendaFixa() {
  try {
    if (useApi) {
      return await rendaFixaApi.getAll();
    } else {
      return getRendaFixaLocal();
    }
  } catch (error) {
    console.error('Erro ao carregar renda fixa:', error);
    return getRendaFixaLocal();
  }
}

function getRendaFixaLocal() {
  const stored = localStorage.getItem(STORAGE_KEYS.rendaFixa);
  return stored ? JSON.parse(stored) : [];
}

// ========== UTILITÁRIOS ==========

export function isUsingApi() {
  return useApi;
}

export async function carregarTodosDados() {
  const [transactions, proventos, rendaFixa] = await Promise.all([
    getTransacoes(),
    getProventos(),
    getRendaFixa()
  ]);

  return {
    transactions,
    proventos,
    rendaFixa
  };
}
