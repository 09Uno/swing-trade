// ========== CONTROLADOR DE PROVENTOS ==========

import { ProventosManager } from '../models/ProventosManager.js';
import { renderProventos } from '../ui/proventos.js';
import { formatCurrency } from '../utils/formatters.js';
import { showStatus } from '../utils/helpers.js';
import { salvarProvento as salvarProventoAPI, atualizarProvento, excluirProvento as excluirProventoAPI } from '../utils/dataSync.js';

// Inicializa manager
export const proventosManager = new ProventosManager();

// Expõe globalmente
window.proventosManager = proventosManager;

// ========== MODAL ==========

export function abrirModalProvento(id = null) {
  const modal = document.getElementById('modalProvento');
  const titulo = document.getElementById('modalProventoTitulo');
  const form = document.getElementById('formProvento');

  // Limpa form
  form.reset();
  document.getElementById('proventoId').value = '';

  if (id) {
    // Modo edição
    const provento = proventosManager.proventos.find(p => p.id === id);
    if (!provento) return;

    titulo.textContent = 'Editar Provento';
    document.getElementById('proventoId').value = provento.id;
    document.getElementById('proventoAtivo').value = provento.ativo;
    document.getElementById('proventoTipo').value = provento.tipo;
    document.getElementById('proventoValor').value = provento.valorUnitario;
    document.getElementById('proventoQtd').value = provento.quantidade;
    document.getElementById('proventoDataCom').value = provento.dataCom;
    document.getElementById('proventoDataPgto').value = provento.dataPagamento;

    atualizarTotalModal();
  } else {
    // Modo criação
    titulo.textContent = 'Adicionar Provento';

    // Preenche data de hoje por padrão
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('proventoDataPgto').value = hoje;
    document.getElementById('proventoDataCom').value = hoje;
  }

  modal.style.display = 'block';

  // Fecha ao clicar fora
  modal.onclick = function (event) {
    if (event.target === modal) {
      fecharModalProvento();
    }
  };
}

export function fecharModalProvento() {
  document.getElementById('modalProvento').style.display = 'none';
}

export async function salvarProvento(event) {
  event.preventDefault();

  const id = document.getElementById('proventoId').value;
  const dados = {
    ativo: document.getElementById('proventoAtivo').value,
    tipo: document.getElementById('proventoTipo').value,
    valorUnitario: document.getElementById('proventoValor').value,
    quantidade: document.getElementById('proventoQtd').value,
    dataCom: document.getElementById('proventoDataCom').value,
    dataPagamento: document.getElementById('proventoDataPgto').value
  };

  try {
    if (id) {
      // Edita na API/Banco
      await atualizarProvento(parseInt(id), dados);
      // Atualiza manager local
      proventosManager.editarProvento(parseInt(id), dados);
      showStatus('✅ Provento atualizado com sucesso!', 'success');
    } else {
      // Cria na API/Banco
      await salvarProventoAPI(dados);
      // Atualiza manager local
      proventosManager.adicionarProvento(dados);
      showStatus('✅ Provento adicionado com sucesso!', 'success');
    }

    fecharModalProvento();
    atualizarListaProventos();

  } catch (error) {
    showStatus('❌ Erro ao salvar provento: ' + error.message, 'error');
  }
}

export function editarProventoModal(id) {
  abrirModalProvento(id);
}

export async function excluirProventoConfirm(id) {
  const provento = proventosManager.proventos.find(p => p.id === id);
  if (!provento) return;

  const confirmed = await window.customConfirm({
    title: '🗑️ Excluir Provento',
    message: `Deseja realmente excluir este provento?\n\nAtivo: ${provento.ativo}\nTipo: ${provento.tipo}\nTotal: ${formatCurrency(provento.total)}\nData: ${new Date(provento.dataPagamento).toLocaleDateString('pt-BR')}`,
    type: 'danger',
    confirmText: 'Excluir',
    cancelText: 'Cancelar'
  });

  if (confirmed) {
    try {
      // Exclui da API/Banco
      await excluirProventoAPI(id);
      // Exclui do manager local
      proventosManager.excluirProvento(id);
      showStatus('✅ Provento excluído com sucesso!', 'success');
      atualizarListaProventos();
    } catch (error) {
      showStatus('❌ Erro ao excluir provento: ' + error.message, 'error');
    }
  }
}

// ========== IMPORTAÇÃO ==========

export function importarProventosExcel() {
  const input = document.getElementById('proventosFileInput');

  input.onchange = async function (e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
      showStatus('📥 Importando proventos...', 'info');

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(worksheet);

      // Mapeia colunas
      const proventosArray = json.map(row => ({
        ativo: row['Ativo'] || row['Código'] || row['Symbol'],
        tipo: row['Tipo'] || 'Dividendo',
        valorUnitario: parseFloat(row['Valor'] || row['Valor Unitário'] || 0),
        quantidade: parseFloat(row['Quantidade'] || row['Qtd'] || 0),
        dataCom: row['Data COM'] || row['DataCOM'] || row['Data'],
        dataPagamento: row['Data Pagamento'] || row['DataPagamento'] || row['Data']
      }));

      const resultado = proventosManager.importarProventos(proventosArray);

      showStatus(
        `✅ Importação concluída! ${resultado.importados} proventos adicionados.` +
        (resultado.erros > 0 ? ` ${resultado.erros} erros.` : ''),
        resultado.erros > 0 ? 'info' : 'success'
      );

      atualizarListaProventos();

    } catch (error) {
      showStatus('❌ Erro ao importar: ' + error.message, 'error');
    }

    // Limpa input
    input.value = '';
  };

  input.click();
}

// ========== HELPERS ==========

function atualizarListaProventos() {
  const proventos = proventosManager.getProventos();
  renderProventos(proventos, proventosManager);

  // Atualiza resumo principal se tiver dados carregados
  if (window.currentData) {
    import('../data/dataLoader.js').then(module => {
      if (module.currentData) {
        const fixedInput = document.getElementById('fixedIncomeInput');
        const fixed = fixedInput ? fixedInput.value || 0 : 0;
        
        const summary = module.currentData.analyzer.getSummary(
          module.currentData.prices,
          Number(fixed),
          proventosManager
        );

        import('../ui/summary.js').then(summaryModule => {
          summaryModule.renderSummary(summary);
        });
      }
    });
  }
}

function atualizarTotalModal() {
  const valor = parseFloat(document.getElementById('proventoValor').value) || 0;
  const qtd = parseFloat(document.getElementById('proventoQtd').value) || 0;
  const total = valor * qtd;

  document.getElementById('proventoTotal').innerHTML = `
    <div style="color:#8b949e;font-size:12px;margin-bottom:5px;">Total a Receber</div>
    <div style="color:#2ecc71;font-size:20px;font-weight:600;">${formatCurrency(total)}</div>
  `;
}

// Alias para compatibilidade
export function calcularTotalProvento() {
  atualizarTotalModal();
}

// Event listeners para atualizar total no modal
window.addEventListener('load', () => {
  const valorInput = document.getElementById('proventoValor');
  const qtdInput = document.getElementById('proventoQtd');

  if (valorInput) {
    valorInput.addEventListener('input', atualizarTotalModal);
  }

  if (qtdInput) {
    qtdInput.addEventListener('input', atualizarTotalModal);
  }
});

// Expõe funções globalmente
window.abrirModalProvento = abrirModalProvento;
window.fecharModalProvento = fecharModalProvento;
window.salvarProvento = salvarProvento;
window.editarProventoModal = editarProventoModal;
window.excluirProventoConfirm = excluirProventoConfirm;
window.importarProventosExcel = importarProventosExcel;
window.calcularTotalProvento = calcularTotalProvento;
window.filterProventos = () => {
  const proventos = proventosManager.getProventos();
  renderProventos(proventos, proventosManager);
};
window.limparFiltrosProventos = () => {
  const filterAtivoEl = document.getElementById('filterProventoAtivo');
  const filterTipoEl = document.getElementById('filterProventoTipo');
  const filterInicioEl = document.getElementById('filterProventoInicio');
  const filterFimEl = document.getElementById('filterProventoFim');
  
  if (filterAtivoEl) filterAtivoEl.value = '';
  if (filterTipoEl) filterTipoEl.value = '';
  if (filterInicioEl) filterInicioEl.value = '';
  if (filterFimEl) filterFimEl.value = '';
  
  filterProventos();
};

// Inicializa lista ao carregar dados
export function initProventos() {
  // Verifica se a aba de proventos existe antes de renderizar
  const proventosBody = document.getElementById('proventosBody');
  if (!proventosBody) return;

  const proventos = proventosManager.getProventos();
  // Sempre renderiza, mesmo que vazio
  renderProventos(proventos, proventosManager);
}
