// ========== GERENCIADOR DE PROVENTOS ==========

export class ProventosManager {
  constructor() {
    this.proventos = [];
    this.loadFromLocalStorage();
  }

  adicionarProvento(provento) {
    const novo = {
      id: Date.now(),
      ativo: provento.ativo.toUpperCase().trim(),
      tipo: provento.tipo, // "Dividendo", "JCP", "Rendimento"
      valorUnitario: Number(provento.valorUnitario),
      quantidade: Number(provento.quantidade),
      dataCom: provento.dataCom,
      dataPagamento: provento.dataPagamento,
      total: Number(provento.valorUnitario) * Number(provento.quantidade),
      createdAt: new Date().toISOString()
    };

    this.proventos.push(novo);
    this.saveToLocalStorage();
    return novo;
  }

  editarProvento(id, dados) {
    const index = this.proventos.findIndex(p => p.id === id);
    if (index === -1) return null;

    this.proventos[index] = {
      ...this.proventos[index],
      ativo: dados.ativo.toUpperCase().trim(),
      tipo: dados.tipo,
      valorUnitario: Number(dados.valorUnitario),
      quantidade: Number(dados.quantidade),
      dataCom: dados.dataCom,
      dataPagamento: dados.dataPagamento,
      total: Number(dados.valorUnitario) * Number(dados.quantidade),
      updatedAt: new Date().toISOString()
    };

    this.saveToLocalStorage();
    return this.proventos[index];
  }

  excluirProvento(id) {
    const index = this.proventos.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.proventos.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  getProventos() {
    return [...this.proventos].sort((a, b) =>
      new Date(b.dataPagamento) - new Date(a.dataPagamento)
    );
  }

  getProventosPorAtivo(ativo) {
    return this.proventos
      .filter(p => p.ativo === ativo.toUpperCase())
      .sort((a, b) => new Date(b.dataPagamento) - new Date(a.dataPagamento));
  }

  getProventosPorPeriodo(dataInicio, dataFim) {
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);

    return this.proventos.filter(p => {
      const data = new Date(p.dataPagamento);
      return data >= inicio && data <= fim;
    });
  }

  getProventosPorTipo(tipo) {
    return this.proventos.filter(p => p.tipo === tipo);
  }

  getTotalProventos() {
    return this.proventos.reduce((sum, p) => sum + p.total, 0);
  }

  getTotalPorTipo(tipo) {
    return this.proventos
      .filter(p => p.tipo === tipo)
      .reduce((sum, p) => sum + p.total, 0);
  }

  getTotalPorAtivo(ativo) {
    return this.proventos
      .filter(p => p.ativo === ativo.toUpperCase())
      .reduce((sum, p) => sum + p.total, 0);
  }

  getTotalPorCategoria(categoria, assets) {
    // Pega todos os ativos da categoria
    const ativosCategoria = assets
      .filter(a => a.category === categoria)
      .map(a => a.symbol.toUpperCase());

    return this.proventos
      .filter(p => ativosCategoria.includes(p.ativo))
      .reduce((sum, p) => sum + p.total, 0);
  }

  getEstatisticas() {
    const total = this.getTotalProventos();
    const dividendos = this.getTotalPorTipo('Dividendo');
    const jcp = this.getTotalPorTipo('JCP');
    const rendimentos = this.getTotalPorTipo('Rendimento');

    // Agrupa por ativo
    const porAtivo = {};
    this.proventos.forEach(p => {
      if (!porAtivo[p.ativo]) {
        porAtivo[p.ativo] = { total: 0, quantidade: 0 };
      }
      porAtivo[p.ativo].total += p.total;
      porAtivo[p.ativo].quantidade++;
    });

    // Ranking de ativos que mais pagam
    const ranking = Object.entries(porAtivo)
      .map(([ativo, dados]) => ({ ativo, ...dados }))
      .sort((a, b) => b.total - a.total);

    return {
      total,
      dividendos,
      jcp,
      rendimentos,
      quantidade: this.proventos.length,
      ranking
    };
  }

  // Importa proventos de array (útil para importação de Excel)
  importarProventos(proventosArray) {
    let importados = 0;
    let erros = 0;

    proventosArray.forEach(p => {
      try {
        // Valida dados mínimos
        if (!p.ativo || !p.tipo || !p.valorUnitario || !p.quantidade || !p.dataPagamento) {
          erros++;
          return;
        }

        this.adicionarProvento({
          ativo: p.ativo,
          tipo: p.tipo,
          valorUnitario: p.valorUnitario,
          quantidade: p.quantidade,
          dataCom: p.dataCom || p.dataPagamento,
          dataPagamento: p.dataPagamento
        });

        importados++;
      } catch (e) {
        console.error('Erro ao importar provento:', e);
        erros++;
      }
    });

    return { importados, erros };
  }

  // LocalStorage
  saveToLocalStorage() {
    try {
      localStorage.setItem('swing_trade_proventos', JSON.stringify(this.proventos));
    } catch (e) {
      console.error('Erro ao salvar proventos:', e);
    }
  }

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('swing_trade_proventos');
      if (data) {
        this.proventos = JSON.parse(data);
      }
    } catch (e) {
      console.error('Erro ao carregar proventos:', e);
      this.proventos = [];
    }
  }

  // Limpa todos os dados
  limparTodos() {
    this.proventos = [];
    this.saveToLocalStorage();
  }

  // Export para JSON
  exportarJSON() {
    return JSON.stringify(this.proventos, null, 2);
  }

  // Import de JSON
  importarJSON(jsonString) {
    try {
      const dados = JSON.parse(jsonString);
      if (!Array.isArray(dados)) {
        throw new Error('JSON inválido');
      }

      this.proventos = dados;
      this.saveToLocalStorage();
      return true;
    } catch (e) {
      console.error('Erro ao importar JSON:', e);
      return false;
    }
  }
}
