// ========== TRANSAÇÕES CONTROLLER ==========

import { showStatus } from '../utils/helpers.js';
import { loadFromDatabase } from '../data/dataLoader.js';
import { salvarTransacao as salvarTransacaoSync, excluirTransacao, atualizarTransacao, getTransacoes } from '../utils/dataSync.js';

let editingId = null;

export function abrirModalTransacao() {
  editingId = null;
  const modal = document.getElementById('modalTransacao');
  if (!modal) return;

  // Limpa o formulário
  document.getElementById('formTransacao').reset();
  document.getElementById('modalTransacaoTitulo').textContent = '➕ Nova Transação';

  // Data de hoje como padrão
  const hoje = new Date().toISOString().split('T')[0];
  document.getElementById('transacaoData').value = hoje;

  // Atualiza preview
  atualizarPreviewTransacao();

  modal.style.display = 'block';
}

export function fecharModalTransacao() {
  const modal = document.getElementById('modalTransacao');
  if (modal) modal.style.display = 'none';
  editingId = null;
}

export function atualizarPreviewTransacao() {
  const tipo = document.getElementById('transacaoTipo').value;
  const qtd = Number(document.getElementById('transacaoQtd').value) || 0;
  const preco = Number(document.getElementById('transacaoPreco').value) || 0;
  const custos = Number(document.getElementById('transacaoCustos').value) || 0;

  const preview = document.getElementById('transacaoPreviewContent');
  if (!preview) return;

  if (!tipo || qtd === 0 || preco === 0) {
    preview.innerHTML = 'Preencha os campos para ver o resumo';
    return;
  }

  const subtotal = qtd * preco;
  const total = tipo === 'C' ? subtotal + custos : subtotal - custos;
  const tipoTexto = tipo === 'C' ? 'COMPRA' : 'VENDA';

  preview.innerHTML = `
    <div style="display:grid;gap:5px;">
      <div><strong>${tipoTexto}</strong>: ${qtd.toFixed(2)} x R$ ${preco.toFixed(2)} = R$ ${subtotal.toFixed(2)}</div>
      <div>Custos: R$ ${custos.toFixed(2)}</div>
      <div style="color:#58a6ff;font-weight:bold;">Total: R$ ${total.toFixed(2)}</div>
    </div>
  `;
}

export async function salvarTransacao(event) {
  if (event) event.preventDefault();

  const form = document.getElementById('formTransacao');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  // Converte data de YYYY-MM-DD para DD/MM/YYYY
  const dataISO = document.getElementById('transacaoData').value;
  const [ano, mes, dia] = dataISO.split('-');
  const dataFormatada = `${dia}/${mes}/${ano}`;

  const novaTransacao = {
    data: dataFormatada,
    ativo: document.getElementById('transacaoAtivo').value.trim().toUpperCase(),
    tipo: document.getElementById('transacaoTipo').value,
    qtd: Number(document.getElementById('transacaoQtd').value),
    preco: Number(document.getElementById('transacaoPreco').value),
    custos: Number(document.getElementById('transacaoCustos').value) || 0,
    categoria: document.getElementById('transacaoCategoria').value || '',
    observacoes: document.getElementById('transacaoObs').value.trim()
  };

  try {
    if (editingId) {
      // EDITANDO
      console.log('✏️ Atualizando transação ID:', editingId);
      await atualizarTransacao(editingId, novaTransacao);
      showStatus(`Transação de ${novaTransacao.ativo} atualizada com sucesso!`, 'success');
    } else {
      // CRIANDO NOVA
      console.log('🚀 Criando nova transação...');
      await salvarTransacaoSync(novaTransacao);
      showStatus(`Transação ${novaTransacao.tipo === 'C' ? 'de compra' : 'de venda'} de ${novaTransacao.ativo} adicionada com sucesso!`, 'success');
    }

    // Recarrega TUDO do banco (fonte única de verdade)
    console.log('🔄 Recarregando do banco...');
    await loadFromDatabase();

    fecharModalTransacao();

  } catch (error) {
    console.error('❌ Erro completo:', error);
    showStatus('Erro ao salvar transação: ' + error.message, 'error');
  }
}

export function initTransacoesController() {
  // Adiciona listeners para atualizar preview em tempo real
  const qtdInput = document.getElementById('transacaoQtd');
  const precoInput = document.getElementById('transacaoPreco');
  const custosInput = document.getElementById('transacaoCustos');
  const tipoSelect = document.getElementById('transacaoTipo');

  if (qtdInput) qtdInput.addEventListener('input', atualizarPreviewTransacao);
  if (precoInput) precoInput.addEventListener('input', atualizarPreviewTransacao);
  if (custosInput) custosInput.addEventListener('input', atualizarPreviewTransacao);
  if (tipoSelect) tipoSelect.addEventListener('change', atualizarPreviewTransacao);
}

// Editar transação existente
export async function editarTransacao(id) {
  try {
    const transacoes = await getTransacoes();
    const transacao = transacoes.find(t => t.id === id);

    if (!transacao) {
      showStatus('Transação não encontrada!', 'error');
      return;
    }

    editingId = id;

    // Preenche o modal com os dados
    document.getElementById('modalTransacaoTitulo').textContent = '✏️ Editar Transação';

    // Converte data DD/MM/YYYY para YYYY-MM-DD
    const [dia, mes, ano] = transacao.data.split('/');
    document.getElementById('transacaoData').value = `${ano}-${mes}-${dia}`;

    document.getElementById('transacaoAtivo').value = transacao.ativo;
    document.getElementById('transacaoTipo').value = transacao.tipo;
    document.getElementById('transacaoQtd').value = transacao.qtd;
    document.getElementById('transacaoPreco').value = transacao.preco;
    document.getElementById('transacaoCustos').value = transacao.custos || 0;
    document.getElementById('transacaoCategoria').value = transacao.categoria || '';
    document.getElementById('transacaoObs').value = transacao.observacoes || '';

    atualizarPreviewTransacao();

    document.getElementById('modalTransacao').style.display = 'block';

  } catch (error) {
    console.error('Erro ao editar:', error);
    showStatus('Erro ao carregar transação: ' + error.message, 'error');
  }
}

// Excluir transação
export async function excluirTransacaoUI(id) {
  const confirmed = await window.customConfirm({
    title: '🗑️ Excluir Transação',
    message: 'Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita.',
    type: 'danger',
    confirmText: 'Excluir',
    cancelText: 'Cancelar'
  });

  if (!confirmed) {
    return;
  }

  try {
    console.log('🗑️ Excluindo transação...');

    await excluirTransacao(id);

    showStatus('Transação excluída com sucesso!', 'success');

    // Recarrega do banco
    await loadFromDatabase();

  } catch (error) {
    console.error('Erro ao excluir:', error);
    showStatus('Erro ao excluir transação: ' + error.message, 'error');
  }
}

// Função para fazer backup do banco
export async function fazerBackupBanco() {
  try {
    // Verifica se está usando API
    if (window.isUsingApi && window.isUsingApi()) {
      // Faz download via API
      window.open('http://localhost:3000/api/backup/download', '_blank');
      showStatus('Download do banco de dados iniciado!', 'success');
    } else {
      // Modo localStorage - exporta JSON
      showStatus('Usando LocalStorage. Use "Exportar JSON" para backup.', 'info');
    }
  } catch (error) {
    showStatus('Erro ao fazer backup: ' + error.message, 'error');
  }
}

// Expõe funções globalmente
window.abrirModalTransacao = abrirModalTransacao;
window.fecharModalTransacao = fecharModalTransacao;
window.salvarTransacao = salvarTransacao;
window.editarTransacao = editarTransacao;
window.excluirTransacao = excluirTransacaoUI;
window.atualizarPreviewTransacao = atualizarPreviewTransacao;
window.fazerBackupBanco = fazerBackupBanco;
