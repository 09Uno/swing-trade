// ========== RENDA FIXA CONTROLLER ==========

import { showStatus } from '../utils/helpers.js';
import { RendaFixaManager } from '../models/RendaFixaManager.js';
import { renderRendaFixa } from '../ui/rendaFixa.js';

// Inicializa o manager globalmente
export const rendaFixaManager = new RendaFixaManager();

// Expõe globalmente
window.rendaFixaManager = rendaFixaManager;

let editingId = null;

export function initRendaFixa() {
  const rendaFixaBody = document.getElementById('rendaFixaBody');
  if (!rendaFixaBody) return;

  const investimentos = rendaFixaManager.getInvestimentos();
  if (investimentos.length > 0) {
    renderRendaFixa(investimentos, rendaFixaManager);
  } else {
    // Mostra mensagem inicial
    rendaFixaBody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:#8b949e;">Nenhum investimento cadastrado. Clique em "➕ Adicionar Investimento" para começar.</td></tr>';
  }

  // Configura eventos dos filtros
  const tipoFilter = document.getElementById('filterTipoRendaFixa');
  const statusFilter = document.getElementById('filterStatusRendaFixa');

  if (tipoFilter) {
    tipoFilter.addEventListener('change', () => {
      const investimentos = rendaFixaManager.getInvestimentos();
      renderRendaFixa(investimentos, rendaFixaManager);
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener('change', () => {
      const investimentos = rendaFixaManager.getInvestimentos();
      renderRendaFixa(investimentos, rendaFixaManager);
    });
  }
}

export function abrirModalRendaFixa() {
  editingId = null;
  const modal = document.getElementById('modalRendaFixa');
  if (!modal) return;

  // Limpa o formulário
  document.getElementById('formRendaFixa').reset();
  document.getElementById('modalRendaFixaTitulo').textContent = 'Adicionar Investimento';

  // Atualiza campos dinâmicos
  atualizarCamposRendaFixa();

  modal.style.display = 'block';
}

export function fecharModalRendaFixa() {
  const modal = document.getElementById('modalRendaFixa');
  if (modal) modal.style.display = 'none';
  editingId = null;
}

export function editarRendaFixa(id) {
  editingId = id;
  const investimento = rendaFixaManager.getInvestimentos().find(i => i.id === id);
  if (!investimento) return;

  const modal = document.getElementById('modalRendaFixa');
  if (!modal) return;

  // Preenche o formulário
  document.getElementById('rendaFixaNome').value = investimento.nome || '';
  document.getElementById('rendaFixaTipo').value = investimento.tipo;
  document.getElementById('rendaFixaValor').value = investimento.valorInicial;
  document.getElementById('rendaFixaTaxa').value = investimento.taxa;
  document.getElementById('rendaFixaDataInicio').value = investimento.dataInicio;
  document.getElementById('rendaFixaDataVenc').value = investimento.dataVencimento || '';
  document.getElementById('rendaFixaLiquidez').value = investimento.liquidez || 'Diária';
  document.getElementById('rendaFixaInstituicao').value = investimento.instituicao || '';
  document.getElementById('rendaFixaObs').value = investimento.observacoes || '';

  document.getElementById('modalRendaFixaTitulo').textContent = 'Editar Investimento';

  // Atualiza campos dinâmicos
  atualizarCamposRendaFixa();

  modal.style.display = 'block';
}

export function salvarRendaFixa(event) {
  if (event) event.preventDefault();

  const form = document.getElementById('formRendaFixa');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const dados = {
    nome: document.getElementById('rendaFixaNome').value.trim(),
    tipo: document.getElementById('rendaFixaTipo').value,
    valorInicial: Number(document.getElementById('rendaFixaValor').value),
    taxa: Number(document.getElementById('rendaFixaTaxa').value),
    dataInicio: document.getElementById('rendaFixaDataInicio').value,
    dataVencimento: document.getElementById('rendaFixaDataVenc').value || null,
    liquidez: document.getElementById('rendaFixaLiquidez').value,
    instituicao: document.getElementById('rendaFixaInstituicao').value.trim(),
    observacoes: document.getElementById('rendaFixaObs').value.trim()
  };

  // Define indexador baseado no tipo
  if (dados.tipo === 'CDB' || dados.tipo === 'LCI' || dados.tipo === 'LCA') {
    dados.indexador = 'CDI';
  } else if (dados.tipo === 'Tesouro Selic') {
    dados.indexador = 'SELIC';
  } else if (dados.tipo === 'Tesouro IPCA+') {
    dados.indexador = 'IPCA';
  } else if (dados.tipo === 'Tesouro Prefixado') {
    dados.indexador = null;
  }

  try {
    if (editingId) {
      rendaFixaManager.editarInvestimento(editingId, dados);
      showStatus('Investimento atualizado com sucesso!', 'success');
    } else {
      rendaFixaManager.adicionarInvestimento(dados);
      showStatus('Investimento adicionado com sucesso!', 'success');
    }

    fecharModalRendaFixa();

    // Atualiza a tabela
    const investimentos = rendaFixaManager.getInvestimentos();
    renderRendaFixa(investimentos, rendaFixaManager);

  } catch (error) {
    showStatus('Erro ao salvar investimento: ' + error.message, 'error');
  }
}

export function resgatarRendaFixa(id) {
  if (!confirm('Deseja resgatar este investimento? O rendimento líquido atual será calculado.')) {
    return;
  }

  try {
    const dataResgate = new Date().toISOString().split('T')[0];
    rendaFixaManager.resgatarInvestimento(id, dataResgate);

    showStatus('Investimento resgatado com sucesso!', 'success');

    // Atualiza a tabela
    const investimentos = rendaFixaManager.getInvestimentos();
    renderRendaFixa(investimentos, rendaFixaManager);

  } catch (error) {
    showStatus('Erro ao resgatar investimento: ' + error.message, 'error');
  }
}

export function excluirRendaFixa(id) {
  if (!confirm('Deseja excluir este investimento? Esta ação não pode ser desfeita.')) {
    return;
  }

  try {
    rendaFixaManager.excluirInvestimento(id);
    showStatus('Investimento excluído com sucesso!', 'success');

    // Atualiza a tabela
    const investimentos = rendaFixaManager.getInvestimentos();
    renderRendaFixa(investimentos, rendaFixaManager);

  } catch (error) {
    showStatus('Erro ao excluir investimento: ' + error.message, 'error');
  }
}

export function abrirModalTaxas() {
  const modal = document.getElementById('modalTaxas');
  if (!modal) return;

  // Carrega taxas atuais
  const taxas = rendaFixaManager.getTaxas();
  document.getElementById('taxaCDI').value = taxas.cdi;
  document.getElementById('taxaSelic').value = taxas.selic;
  document.getElementById('taxaIPCA').value = taxas.ipca;

  modal.style.display = 'block';
}

export function fecharModalTaxas() {
  const modal = document.getElementById('modalTaxas');
  if (modal) modal.style.display = 'none';
}

export function salvarTaxas(event) {
  if (event) event.preventDefault();

  const form = document.getElementById('formTaxas');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const taxas = {
    cdi: Number(document.getElementById('taxaCDI').value),
    selic: Number(document.getElementById('taxaSelic').value),
    ipca: Number(document.getElementById('taxaIPCA').value)
  };

  try {
    rendaFixaManager.atualizarTaxas(taxas);
    showStatus('Taxas atualizadas com sucesso!', 'success');

    fecharModalTaxas();

    // Atualiza a tabela (recalcula tudo)
    const investimentos = rendaFixaManager.getInvestimentos();
    renderRendaFixa(investimentos, rendaFixaManager);

  } catch (error) {
    showStatus('Erro ao atualizar taxas: ' + error.message, 'error');
  }
}

// Atualiza campos do formulário baseado no tipo selecionado
export function atualizarCamposRendaFixa() {
  const tipo = document.getElementById('rendaFixaTipo').value;
  const taxaLabel = document.getElementById('rendaFixaTaxaLabel');
  const taxaHelp = document.getElementById('rendaFixaTaxaHelp');

  if (!taxaLabel) return;

  // Ajusta label da taxa baseado no tipo
  if (tipo === 'CDB' || tipo === 'LCI' || tipo === 'LCA') {
    taxaLabel.textContent = 'Taxa (% do CDI) *';
    if (taxaHelp) {
      taxaHelp.textContent = `Para ${tipo}: informe % do CDI (ex: 110 para 110% do CDI)`;
    }
  } else if (tipo === 'Tesouro Selic') {
    taxaLabel.textContent = 'Taxa (% da Selic) *';
    if (taxaHelp) {
      taxaHelp.textContent = 'Informe % da Selic (ex: 100 para 100% da Selic)';
    }
  } else if (tipo === 'Tesouro IPCA+') {
    taxaLabel.textContent = 'Taxa (% a.a. + IPCA) *';
    if (taxaHelp) {
      taxaHelp.textContent = 'Informe a taxa fixa (ex: 6.5 para IPCA + 6,5% a.a.)';
    }
  } else if (tipo === 'Tesouro Prefixado') {
    taxaLabel.textContent = 'Taxa (% a.a.) *';
    if (taxaHelp) {
      taxaHelp.textContent = 'Informe a taxa prefixada (ex: 12 para 12% a.a.)';
    }
  }
}

// Alias para manter compatibilidade
export function updateRendaFixaFields() {
  atualizarCamposRendaFixa();
}

// Expõe funções globalmente
window.abrirModalRendaFixa = abrirModalRendaFixa;
window.fecharModalRendaFixa = fecharModalRendaFixa;
window.editarRendaFixa = editarRendaFixa;
window.salvarRendaFixa = salvarRendaFixa;
window.resgatarRendaFixa = resgatarRendaFixa;
window.excluirRendaFixa = excluirRendaFixa;
window.abrirModalTaxas = abrirModalTaxas;
window.fecharModalTaxas = fecharModalTaxas;
window.salvarTaxas = salvarTaxas;
window.atualizarCamposRendaFixa = atualizarCamposRendaFixa;
window.updateRendaFixaFields = updateRendaFixaFields;
