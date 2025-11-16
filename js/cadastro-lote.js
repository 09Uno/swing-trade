// ========== CADASTRO EM LOTE ==========

let contadorLinhasLote = 0;

// Abre modal
window.abrirModalCadastroLote = function() {
  const modal = document.getElementById('modalCadastroLote');
  modal.style.display = 'block';

  // Limpa e adiciona 5 linhas iniciais
  const tbody = document.getElementById('tabelaCadastroLote');
  tbody.innerHTML = '';
  contadorLinhasLote = 0;

  for (let i = 0; i < 5; i++) {
    adicionarLinhaLote();
  }
};

// Fecha modal
window.fecharModalCadastroLote = function() {
  document.getElementById('modalCadastroLote').style.display = 'none';
};

// Adiciona nova linha na tabela
window.adicionarLinhaLote = function() {
  const tbody = document.getElementById('tabelaCadastroLote');
  const id = contadorLinhasLote++;

  const tr = document.createElement('tr');
  tr.id = `linha-lote-${id}`;
  tr.style.background = '#161b22';

  tr.innerHTML = `
    <td style="padding:8px;border:1px solid #30363d;">
      <input type="date" id="lote-data-${id}"
        style="width:100%;background:#0d1117;color:#fff;border:1px solid #30363d;border-radius:4px;padding:6px;">
    </td>
    <td style="padding:8px;border:1px solid #30363d;">
      <input type="text" id="lote-ativo-${id}" placeholder="PETR4"
        style="width:100%;background:#0d1117;color:#fff;border:1px solid #30363d;border-radius:4px;padding:6px;text-transform:uppercase;">
    </td>
    <td style="padding:8px;border:1px solid #30363d;">
      <select id="lote-tipo-${id}"
        style="width:100%;background:#0d1117;color:#fff;border:1px solid #30363d;border-radius:4px;padding:6px;">
        <option value="">-</option>
        <option value="C">Compra</option>
        <option value="V">Venda</option>
      </select>
    </td>
    <td style="padding:8px;border:1px solid #30363d;">
      <input type="number" id="lote-qtd-${id}" step="0.01" placeholder="100"
        style="width:100%;background:#0d1117;color:#fff;border:1px solid #30363d;border-radius:4px;padding:6px;">
    </td>
    <td style="padding:8px;border:1px solid #30363d;">
      <input type="number" id="lote-preco-${id}" step="0.01" placeholder="38.50"
        style="width:100%;background:#0d1117;color:#fff;border:1px solid #30363d;border-radius:4px;padding:6px;">
    </td>
    <td style="padding:8px;border:1px solid #30363d;">
      <input type="number" id="lote-custos-${id}" step="0.01" placeholder="0" value="0"
        style="width:100%;background:#0d1117;color:#fff;border:1px solid #30363d;border-radius:4px;padding:6px;">
    </td>
    <td style="padding:8px;border:1px solid #30363d;">
      <select id="lote-categoria-${id}"
        style="width:100%;background:#0d1117;color:#fff;border:1px solid #30363d;border-radius:4px;padding:6px;">
        <option value="">-</option>
        <option value="Ações">Ações</option>
        <option value="FIIs">FIIs</option>
        <option value="ETFs">ETFs</option>
        <option value="BDRs">BDRs</option>
        <option value="Stocks">Stocks</option>
        <option value="REITs">REITs</option>
        <option value="Cripto">Cripto</option>
        <option value="Outros">Outros</option>
      </select>
    </td>
    <td style="padding:8px;border:1px solid #30363d;text-align:center;">
      <button onclick="removerLinhaLote(${id})"
        style="background:transparent;border:none;color:#da3633;cursor:pointer;font-size:1.2em;"
        title="Remover linha">🗑️</button>
    </td>
  `;

  tbody.appendChild(tr);
};

// Remove linha
window.removerLinhaLote = function(id) {
  const linha = document.getElementById(`linha-lote-${id}`);
  if (linha) {
    linha.remove();
  }
};

// Limpa tabela
window.limparTabelaLote = async function() {
  const confirmed = await window.customConfirm({
    title: '🗑️ Limpar Tabela',
    message: 'Deseja limpar todas as linhas?',
    type: 'warning',
    confirmText: 'Limpar',
    cancelText: 'Cancelar'
  });

  if (confirmed) {
    const tbody = document.getElementById('tabelaCadastroLote');
    tbody.innerHTML = '';
    contadorLinhasLote = 0;

    // Adiciona 5 linhas vazias
    for (let i = 0; i < 5; i++) {
      adicionarLinhaLote();
    }
  }
};

// Salva todas as transações
window.salvarTransacoesLote = async function() {
  const transacoes = [];

  // Coleta dados de todas as linhas
  for (let i = 0; i < contadorLinhasLote; i++) {
    const data = document.getElementById(`lote-data-${i}`)?.value;
    const ativo = document.getElementById(`lote-ativo-${i}`)?.value?.toUpperCase();
    const tipo = document.getElementById(`lote-tipo-${i}`)?.value;
    const quantidade = document.getElementById(`lote-qtd-${i}`)?.value;
    const preco = document.getElementById(`lote-preco-${i}`)?.value;
    const custos = document.getElementById(`lote-custos-${i}`)?.value || 0;
    const categoria = document.getElementById(`lote-categoria-${i}`)?.value || 'Outros';

    // Valida se linha está preenchida
    if (data && ativo && tipo && quantidade && preco) {
      transacoes.push({
        data,
        ativo,
        tipo,
        quantidade: parseFloat(quantidade),
        preco: parseFloat(preco),
        custos: parseFloat(custos),
        categoria
      });
    }
  }

  if (transacoes.length === 0) {
    window.showStatus('⚠️ Nenhuma transação válida para salvar', 'error');
    return;
  }

  const confirmed = await window.customConfirm({
    title: '💾 Salvar Transações',
    message: `Deseja salvar ${transacoes.length} transação(ões)?`,
    type: 'info',
    confirmText: 'Salvar',
    cancelText: 'Cancelar'
  });

  if (!confirmed) {
    return;
  }

  try {
    window.showStatus(`Salvando ${transacoes.length} transações...`, 'info');

    // Importa a função de sincronização
    const { salvarTransacao } = await import('./utils/dataSync.js');

    // Converte o formato da data
    const transacoesFormatadas = transacoes.map(t => {
      // Converte data de YYYY-MM-DD para DD/MM/YYYY
      const [ano, mes, dia] = t.data.split('-');
      return {
        data: `${dia}/${mes}/${ano}`,
        ativo: t.ativo,
        tipo: t.tipo,
        qtd: t.quantidade,
        preco: t.preco,
        custos: t.custos,
        categoria: t.categoria,
        observacoes: ''
      };
    });

    // Salva cada transação
    for (const trans of transacoesFormatadas) {
      await salvarTransacao(trans);
    }

    window.showStatus(`✅ ${transacoes.length} transações salvas com sucesso!`, 'success');

    // Recarrega dados
    const { loadFromDatabase } = await import('./data/dataLoader.js');
    await loadFromDatabase();

    // Fecha modal
    fecharModalCadastroLote();

  } catch (error) {
    console.error('Erro ao salvar transações em lote:', error);
    window.showStatus('❌ Erro ao salvar transações: ' + error.message, 'error');
  }
};

// Fechar modal ao clicar fora
window.addEventListener('click', function(event) {
  const modal = document.getElementById('modalCadastroLote');
  if (event.target === modal) {
    fecharModalCadastroLote();
  }
});
