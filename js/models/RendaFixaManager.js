// ========== GERENCIADOR DE RENDA FIXA ==========

import {
  calcularCDB,
  calcularTesouroDireto,
  calcularDiasCorridos,
  TAXAS_REFERENCIA
} from '../utils/rendaFixa.js';

export class RendaFixaManager {
  constructor() {
    this.investimentos = [];
    this.taxasReferencia = { ...TAXAS_REFERENCIA };
    this.loadFromLocalStorage();
  }

  /**
   * Adiciona novo investimento de renda fixa
   * @param {object} dados - Dados do investimento
   */
  adicionarInvestimento(dados) {
    const novo = {
      id: Date.now(),
      nome: dados.nome || `${dados.tipo} - ${new Date().toLocaleDateString()}`,
      tipo: dados.tipo, // 'CDB', 'LCI', 'LCA', 'Tesouro Selic', 'Tesouro IPCA+', 'Tesouro Prefixado'
      valorInicial: Number(dados.valorInicial),
      taxa: Number(dados.taxa), // Para CDB: % do CDI; Para Tesouro: taxa fixa
      dataInicio: dados.dataInicio,
      dataVencimento: dados.dataVencimento || null,
      liquidez: dados.liquidez || 'Vencimento', // 'Diária', 'Vencimento'
      instituicao: dados.instituicao || '',
      observacoes: dados.observacoes || '',
      ativo: true, // Se ainda está aplicado
      dataResgate: null,
      createdAt: new Date().toISOString()
    };

    this.investimentos.push(novo);
    this.saveToLocalStorage();
    return novo;
  }

  /**
   * Edita investimento existente
   */
  editarInvestimento(id, dados) {
    const index = this.investimentos.findIndex(i => i.id === id);
    if (index === -1) return null;

    this.investimentos[index] = {
      ...this.investimentos[index],
      nome: dados.nome,
      tipo: dados.tipo,
      valorInicial: Number(dados.valorInicial),
      taxa: Number(dados.taxa),
      dataInicio: dados.dataInicio,
      dataVencimento: dados.dataVencimento,
      liquidez: dados.liquidez,
      instituicao: dados.instituicao,
      observacoes: dados.observacoes,
      updatedAt: new Date().toISOString()
    };

    this.saveToLocalStorage();
    return this.investimentos[index];
  }

  /**
   * Registra resgate de investimento
   */
  registrarResgate(id, dataResgate, valorResgatado = null) {
    const inv = this.investimentos.find(i => i.id === id);
    if (!inv) return null;

    inv.ativo = false;
    inv.dataResgate = dataResgate;
    if (valorResgatado) {
      inv.valorResgatado = Number(valorResgatado);
    }

    this.saveToLocalStorage();
    return inv;
  }

  /**
   * Exclui investimento
   */
  excluirInvestimento(id) {
    const index = this.investimentos.findIndex(i => i.id === id);
    if (index === -1) return false;

    this.investimentos.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  /**
   * Calcula valores atualizados de um investimento
   */
  calcularInvestimento(investimento) {
    const diasCorridos = investimento.ativo
      ? calcularDiasCorridos(investimento.dataInicio)
      : calcularDiasCorridos(investimento.dataInicio, new Date(investimento.dataResgate));

    let resultado;

    if (investimento.tipo === 'CDB' || investimento.tipo === 'LCI' || investimento.tipo === 'LCA') {
      resultado = calcularCDB(
        investimento.valorInicial,
        investimento.taxa,
        diasCorridos,
        this.taxasReferencia.cdi
      );

      // LCI e LCA são isentos de IR
      if (investimento.tipo === 'LCI' || investimento.tipo === 'LCA') {
        resultado.ir = 0;
        resultado.rendimentoLiquido = resultado.rendimentoBruto - resultado.iof;
        resultado.totalLiquido = investimento.valorInicial + resultado.rendimentoLiquido;
      }

    } else if (investimento.tipo.startsWith('Tesouro')) {
      const tipoTesouro = investimento.tipo.replace('Tesouro ', '');
      resultado = calcularTesouroDireto(
        tipoTesouro,
        investimento.valorInicial,
        investimento.taxa,
        diasCorridos,
        this.taxasReferencia
      );
    } else {
      // Tipo genérico
      resultado = calcularCDB(investimento.valorInicial, investimento.taxa, diasCorridos);
    }

    return {
      ...investimento,
      diasCorridos,
      ...resultado
    };
  }

  /**
   * Retorna todos os investimentos com valores calculados
   */
  getInvestimentos() {
    return this.getInvestimentosAtualizados();
  }

  /**
   * Retorna todos os investimentos com valores calculados
   */
  getInvestimentosAtualizados() {
    return this.investimentos.map(inv => this.calcularInvestimento(inv));
  }

  /**
   * Retorna apenas investimentos ativos
   */
  getInvestimentosAtivos() {
    return this.investimentos
      .filter(inv => inv.ativo)
      .map(inv => this.calcularInvestimento(inv));
  }

  /**
   * Retorna investimentos resgatados
   */
  getInvestimentosResgatados() {
    return this.investimentos
      .filter(inv => !inv.ativo)
      .map(inv => this.calcularInvestimento(inv));
  }

  /**
   * Total investido (apenas ativos)
   */
  getTotalInvestido() {
    return this.investimentos
      .filter(inv => inv.ativo)
      .reduce((sum, inv) => sum + inv.valorInicial, 0);
  }

  /**
   * Valor total atual (capital + rendimentos)
   */
  getValorTotal() {
    const ativos = this.getInvestimentosAtivos();
    return ativos.reduce((sum, inv) => sum + inv.totalLiquido, 0);
  }

  /**
   * Rendimento total acumulado
   */
  getRendimentoTotal() {
    const ativos = this.getInvestimentosAtivos();
    return ativos.reduce((sum, inv) => sum + inv.rendimentoLiquido, 0);
  }

  /**
   * Rentabilidade média ponderada
   */
  getRentabilidadeMedia() {
    const totalInvestido = this.getTotalInvestido();
    if (totalInvestido === 0) return 0;

    const totalRendimento = this.getRendimentoTotal();
    return (totalRendimento / totalInvestido) * 100;
  }

  /**
   * Estatísticas gerais
   */
  getEstatisticas() {
    const ativos = this.getInvestimentosAtivos();
    const resgatados = this.getInvestimentosResgatados();

    const porTipo = {};
    ativos.forEach(inv => {
      if (!porTipo[inv.tipo]) {
        porTipo[inv.tipo] = {
          quantidade: 0,
          valorInvestido: 0,
          valorAtual: 0,
          rendimento: 0
        };
      }
      porTipo[inv.tipo].quantidade++;
      porTipo[inv.tipo].valorInvestido += inv.valorInicial;
      porTipo[inv.tipo].valorAtual += inv.totalLiquido;
      porTipo[inv.tipo].rendimento += inv.rendimentoLiquido;
    });

    return {
      totalAtivos: ativos.length,
      totalResgatados: resgatados.length,
      valorInvestido: this.getTotalInvestido(),
      valorAtual: this.getValorTotal(),
      rendimentoTotal: this.getRendimentoTotal(),
      rentabilidadeMedia: this.getRentabilidadeMedia(),
      porTipo,
      melhorRentabilidade: ativos.length > 0
        ? ativos.sort((a, b) => b.rentabilidade - a.rentabilidade)[0]
        : null
    };
  }

  /**
   * Atualiza taxas de referência (CDI, Selic, IPCA)
   */
  atualizarTaxasReferencia(taxas) {
    this.taxasReferencia = {
      ...this.taxasReferencia,
      ...taxas
    };
    this.saveToLocalStorage();
  }

  /**
   * Projeção futura
   */
  projetarFuturo(meses = 12) {
    const ativos = this.getInvestimentosAtivos();
    const projecoes = ativos.map(inv => {
      const diasFuturos = inv.diasCorridos + (meses * 21);
      const resultado = this.calcularInvestimento({
        ...inv,
        // Simula dias futuros
      });

      // Recalcula com dias futuros
      let projecao;
      if (inv.tipo === 'CDB' || inv.tipo === 'LCI' || inv.tipo === 'LCA') {
        projecao = calcularCDB(inv.valorInicial, inv.taxa, diasFuturos);
      } else {
        const tipo = inv.tipo.replace('Tesouro ', '');
        projecao = calcularTesouroDireto(tipo, inv.valorInicial, inv.taxa, diasFuturos);
      }

      return {
        nome: inv.nome,
        tipo: inv.tipo,
        valorInicial: inv.valorInicial,
        valorAtual: inv.totalLiquido,
        valorFuturo: projecao.totalLiquido,
        rendimentoFuturo: projecao.rendimentoLiquido,
        meses
      };
    });

    const totalFuturo = projecoes.reduce((sum, p) => sum + p.valorFuturo, 0);
    const rendimentoFuturo = projecoes.reduce((sum, p) => sum + p.rendimentoFuturo, 0);

    return {
      projecoes,
      totalFuturo,
      rendimentoFuturo,
      meses
    };
  }

  /**
   * Projeta rendimento de um investimento para um número de dias no futuro
   */
  projetarRendimento(investimento, diasFuturos = 0) {
    // Calcula dias já corridos
    const diasCorridos = investimento.ativo
      ? calcularDiasCorridos(investimento.dataInicio)
      : calcularDiasCorridos(investimento.dataInicio, new Date(investimento.dataResgate));

    const diasTotais = diasCorridos + diasFuturos;

    let projecao;
    if (investimento.tipo === 'CDB' || investimento.tipo === 'LCI' || investimento.tipo === 'LCA') {
      projecao = calcularCDB(investimento.valorInicial, investimento.taxa, diasTotais);
    } else {
      const tipo = investimento.tipo.replace('Tesouro ', '');
      projecao = calcularTesouroDireto(tipo, investimento.valorInicial, investimento.taxa, diasTotais);
    }

    return projecao;
  }

  // LocalStorage
  saveToLocalStorage() {
    try {
      const data = {
        investimentos: this.investimentos,
        taxasReferencia: this.taxasReferencia
      };
      localStorage.setItem('swing_trade_renda_fixa', JSON.stringify(data));
    } catch (e) {
      console.error('Erro ao salvar renda fixa:', e);
    }
  }

  loadFromLocalStorage() {
    try {
      const data = localStorage.getItem('swing_trade_renda_fixa');
      if (data) {
        const parsed = JSON.parse(data);
        this.investimentos = parsed.investimentos || [];
        this.taxasReferencia = parsed.taxasReferencia || { ...TAXAS_REFERENCIA };
      }
    } catch (e) {
      console.error('Erro ao carregar renda fixa:', e);
      this.investimentos = [];
    }
  }

  limparTodos() {
    this.investimentos = [];
    this.saveToLocalStorage();
  }

  exportarJSON() {
    return JSON.stringify({
      investimentos: this.investimentos,
      taxasReferencia: this.taxasReferencia
    }, null, 2);
  }

  importarJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      this.investimentos = data.investimentos || [];
      this.taxasReferencia = data.taxasReferencia || { ...TAXAS_REFERENCIA };
      this.saveToLocalStorage();
      return true;
    } catch (e) {
      console.error('Erro ao importar JSON:', e);
      return false;
    }
  }
}
