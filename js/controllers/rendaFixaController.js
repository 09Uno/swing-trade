// ========== RENDA FIXA CONTROLLER ==========

import { showStatus } from '../utils/helpers.js';
import { RendaFixaManager } from '../models/RendaFixaManager.js';
import { renderRendaFixa } from '../ui/rendaFixa.js';
import { salvarRendaFixa as salvarRendaFixaAPI, atualizarRendaFixa, excluirRendaFixa as excluirRendaFixaAPI } from '../utils/dataSync.js';

// Inicializa o manager globalmente
export const rendaFixaManager = new RendaFixaManager();

// Expõe globalmente
window.rendaFixaManager = rendaFixaManager;

let editingId = null;

export function initRendaFixa() {
  console.log('[RENDA FIXA INIT] Iniciando...');
  
  const rendaFixaBody = document.getElementById('rendaFixaBody');
  console.log('[RENDA FIXA INIT] rendaFixaBody existe?', !!rendaFixaBody);
  
  if (!rendaFixaBody) return;

  const investimentos = rendaFixaManager.getInvestimentos();
  console.log('[RENDA FIXA INIT] Encontrados', investimentos.length, 'investimentos');
  
  // Sempre renderiza, mesmo que vazio
  renderRendaFixa(investimentos, rendaFixaManager);

  // Configura eventos dos filtros
  const tipoFilter = document.getElementById('filterRendaFixaTipo');
  const statusFilter = document.getElementById('filterRendaFixaStatus');

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

export async function salvarRendaFixa(event) {
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
    dados.indexador = 'PREFIXADO';
  }

  try {
    if (editingId) {
      // Atualiza na API/Banco
      await atualizarRendaFixa(editingId, dados);
      // Atualiza manager local
      rendaFixaManager.editarInvestimento(editingId, dados);
      showStatus('Investimento atualizado com sucesso!', 'success');
    } else {
      // Salva na API/Banco
      await salvarRendaFixaAPI(dados);
      // Atualiza manager local
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

export async function excluirRendaFixa(id) {
  const confirmed = await window.customConfirm({
    title: '🗑️ Excluir Investimento',
    message: 'Deseja excluir este investimento? Esta ação não pode ser desfeita.',
    type: 'danger',
    confirmText: 'Excluir',
    cancelText: 'Cancelar'
  });

  if (!confirmed) {
    return;
  }

  try {
    // Exclui da API/Banco
    await excluirRendaFixaAPI(id);
    // Exclui do manager local
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

  // Atualiza liquidez
  atualizarLiquidezRendaFixa();
}

// Controla a exibição do campo de vencimento baseado na liquidez
export function atualizarLiquidezRendaFixa() {
  const liquidez = document.getElementById('rendaFixaLiquidez').value;
  const divDataVencimento = document.getElementById('divDataVencimento');
  const inputVencimento = document.getElementById('rendaFixaDataVenc');

  if (divDataVencimento && inputVencimento) {
    if (liquidez === 'Diária') {
      // Esconde o campo de vencimento se for liquidez diária
      divDataVencimento.style.display = 'none';
      inputVencimento.value = ''; // Limpa o valor
      inputVencimento.removeAttribute('required');
    } else {
      // Mostra o campo de vencimento se for outro tipo de liquidez
      divDataVencimento.style.display = 'block';
    }
  }
}

// Preview em tempo real
export function atualizarPreviewRendaFixa() {
  const tipo = document.getElementById('rendaFixaTipo').value;
  const valor = Number(document.getElementById('rendaFixaValor').value);
  const taxa = Number(document.getElementById('rendaFixaTaxa').value);
  const dataInicio = document.getElementById('rendaFixaDataInicio').value;
  const dataVenc = document.getElementById('rendaFixaDataVenc').value;

  const preview = document.getElementById('rendaFixaPreview');
  const previewContent = document.getElementById('rendaFixaPreviewContent');

  // Só mostra preview se tiver os dados mínimos
  if (!tipo || !valor || !taxa || !dataInicio) {
    preview.style.display = 'none';
    return;
  }

  // Cria objeto temporário para calcular
  const tempInv = {
    tipo,
    valorInicial: valor,
    taxa,
    dataInicio,
    dataVencimento: dataVenc || null,
    indexador: tipo.includes('CDB') || tipo.includes('LCI') || tipo.includes('LCA') ? 'CDI' :
               tipo.includes('Selic') ? 'SELIC' :
               tipo.includes('IPCA') ? 'IPCA' : null
  };

  // Calcula
  const calc = rendaFixaManager.calcularInvestimento(tempInv);
  const rentabilidade = calc.valorInicial > 0 ? ((calc.rendimentoLiquido / calc.valorInicial) * 100) : 0;

  // Formata e exibe
  previewContent.innerHTML = `
    <div style="text-align:center;">
      <div style="color:#8b949e;font-size:11px;">Dias Corridos</div>
      <div style="color:#e6edf3;font-weight:600;">${calc.diasCorridos}</div>
    </div>
    <div style="text-align:center;">
      <div style="color:#8b949e;font-size:11px;">Rendimento Bruto</div>
      <div style="color:#2ecc71;font-weight:600;">R$ ${calc.rendimentoBruto.toFixed(2)}</div>
    </div>
    <div style="text-align:center;">
      <div style="color:#8b949e;font-size:11px;">Rendimento Líquido</div>
      <div style="color:#58a6ff;font-weight:600;">R$ ${calc.rendimentoLiquido.toFixed(2)}</div>
    </div>
    <div style="text-align:center;">
      <div style="color:#8b949e;font-size:11px;">Valor Atual</div>
      <div style="color:#e6edf3;font-weight:600;font-size:15px;">R$ ${calc.totalLiquido.toFixed(2)}</div>
    </div>
    <div style="text-align:center;">
      <div style="color:#8b949e;font-size:11px;">Rentabilidade</div>
      <div style="color:${rentabilidade >= 0 ? '#2ecc71' : '#da3633'};font-weight:600;">${rentabilidade.toFixed(2)}%</div>
    </div>
  `;

  preview.style.display = 'block';
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
window.atualizarLiquidezRendaFixa = atualizarLiquidezRendaFixa;
window.atualizarPreviewRendaFixa = atualizarPreviewRendaFixa;
window.updateRendaFixaFields = updateRendaFixaFields;
window.filterRendaFixa = () => {
  const investimentos = rendaFixaManager.getInvestimentos();
  renderRendaFixa(investimentos, rendaFixaManager);
};
window.limparFiltrosRendaFixa = () => {
  const tipoFilter = document.getElementById('filterRendaFixaTipo');
  const statusFilter = document.getElementById('filterRendaFixaStatus');
  if (tipoFilter) tipoFilter.value = '';
  if (statusFilter) statusFilter.value = 'ativos';
  filterRendaFixa();
};
