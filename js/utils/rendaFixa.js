// ========== CÁLCULOS DE RENDA FIXA ==========

// Taxas de referência (podem ser atualizadas)
export const TAXAS_REFERENCIA = {
  cdi: 11.65, // CDI anual %
  selic: 11.75, // Selic anual %
  ipca: 4.62 // IPCA anual %
};

/**
 * Calcula rendimento de CDB/LCI/LCA
 * @param {number} valorInicial - Valor investido
 * @param {number} taxaCDI - Percentual do CDI (ex: 110 para 110% do CDI)
 * @param {number} diasCorridos - Dias desde o investimento
 * @param {number} cdiAtual - Taxa CDI anual atual (padrão: TAXAS_REFERENCIA.cdi)
 * @returns {object} { rendimentoBruto, ir, iof, rendimentoLiquido, totalLiquido }
 */
export function calcularCDB(valorInicial, taxaCDI, diasCorridos, cdiAtual = TAXAS_REFERENCIA.cdi) {
  // Taxa efetiva = CDI × (taxa contratada / 100)
  const taxaEfetiva = (cdiAtual / 100) * (taxaCDI / 100);

  // Rendimento bruto = valor × ((1 + taxa)^(dias/252) - 1)
  const diasUteis = 252; // dias úteis no ano
  const rendimentoBruto = valorInicial * (Math.pow(1 + taxaEfetiva, diasCorridos / diasUteis) - 1);

  // Calcula IR (regressivo)
  const ir = calcularIR(rendimentoBruto, diasCorridos);

  // Calcula IOF (primeiros 30 dias)
  const iof = calcularIOF(rendimentoBruto, diasCorridos);

  // Rendimento líquido
  const rendimentoLiquido = rendimentoBruto - ir - iof;
  const totalLiquido = valorInicial + rendimentoLiquido;

  return {
    rendimentoBruto,
    ir,
    iof,
    rendimentoLiquido,
    totalLiquido,
    rentabilidade: (rendimentoLiquido / valorInicial) * 100,
    taxaEfetivaAA: taxaEfetiva * 100
  };
}

/**
 * Calcula rendimento de Tesouro Direto
 * @param {string} tipo - 'Selic', 'IPCA+', 'Prefixado'
 * @param {number} valorInicial - Valor investido
 * @param {number} taxa - Taxa do título (para IPCA+ e Prefixado)
 * @param {number} diasCorridos - Dias desde o investimento
 * @param {object} indices - { selic, ipca } taxas de referência
 * @returns {object} Rendimentos
 */
export function calcularTesouroDireto(tipo, valorInicial, taxa, diasCorridos, indices = {}) {
  const selic = indices.selic || TAXAS_REFERENCIA.selic;
  const ipca = indices.ipca || TAXAS_REFERENCIA.ipca;

  let rendimentoBruto = 0;

  switch (tipo) {
    case 'Selic':
      // Tesouro Selic rende a própria Selic
      rendimentoBruto = valorInicial * (Math.pow(1 + selic / 100, diasCorridos / 252) - 1);
      break;

    case 'IPCA+':
      // IPCA+ = inflação + taxa fixa
      const taxaTotal = ipca + taxa;
      rendimentoBruto = valorInicial * (Math.pow(1 + taxaTotal / 100, diasCorridos / 252) - 1);
      break;

    case 'Prefixado':
      // Taxa fixa definida no momento da compra
      rendimentoBruto = valorInicial * (Math.pow(1 + taxa / 100, diasCorridos / 252) - 1);
      break;

    default:
      throw new Error('Tipo de Tesouro inválido');
  }

  // IR sobre Tesouro Direto
  const ir = calcularIR(rendimentoBruto, diasCorridos);

  // Tesouro não tem IOF se mantido por mais de 30 dias
  const iof = diasCorridos < 30 ? calcularIOF(rendimentoBruto, diasCorridos) : 0;

  const rendimentoLiquido = rendimentoBruto - ir - iof;
  const totalLiquido = valorInicial + rendimentoLiquido;

  return {
    tipo,
    rendimentoBruto,
    ir,
    iof,
    rendimentoLiquido,
    totalLiquido,
    rentabilidade: (rendimentoLiquido / valorInicial) * 100
  };
}

/**
 * Calcula IR sobre rendimentos (tabela regressiva)
 * @param {number} rendimento - Valor do rendimento
 * @param {number} dias - Dias de aplicação
 * @returns {number} Valor do IR
 */
export function calcularIR(rendimento, dias) {
  let aliquota;

  if (dias <= 180) {
    aliquota = 0.225; // 22,5%
  } else if (dias <= 360) {
    aliquota = 0.20; // 20%
  } else if (dias <= 720) {
    aliquota = 0.175; // 17,5%
  } else {
    aliquota = 0.15; // 15%
  }

  return rendimento * aliquota;
}

/**
 * Calcula IOF (primeiros 30 dias - tabela regressiva)
 * @param {number} rendimento - Valor do rendimento
 * @param {number} dias - Dias de aplicação
 * @returns {number} Valor do IOF
 */
export function calcularIOF(rendimento, dias) {
  if (dias >= 30) return 0;

  // Tabela regressiva do IOF (de 96% no 1º dia até 0% no 30º dia)
  const aliquotaIOF = [
    96, 93, 90, 86, 83, 80, 76, 73, 70, 66, // dias 1-10
    63, 60, 56, 53, 50, 46, 43, 40, 36, 33, // dias 11-20
    30, 26, 23, 20, 16, 13, 10, 6, 3, 0     // dias 21-30
  ];

  const aliquota = aliquotaIOF[Math.min(dias, 29)] / 100;
  return rendimento * aliquota;
}

/**
 * Calcula valor futuro de um investimento
 * @param {number} valorInicial - Valor investido
 * @param {number} taxaAnual - Taxa anual em %
 * @param {number} meses - Meses de aplicação
 * @returns {object} Projeção futura
 */
export function calcularValorFuturo(valorInicial, taxaAnual, meses) {
  const dias = meses * 21; // ~21 dias úteis por mês
  const taxaMensal = Math.pow(1 + taxaAnual / 100, 1 / 12) - 1;

  const valorFuturo = valorInicial * Math.pow(1 + taxaMensal, meses);
  const rendimento = valorFuturo - valorInicial;

  // Estima IR (assume 6 meses como média)
  const irEstimado = calcularIR(rendimento, dias);
  const liquido = valorInicial + rendimento - irEstimado;

  return {
    valorInicial,
    valorFuturo,
    rendimentoBruto: rendimento,
    irEstimado,
    valorLiquido: liquido,
    rentabilidade: (rendimento / valorInicial) * 100,
    meses
  };
}

/**
 * Calcula rentabilidade até o vencimento
 * @param {number} valorInicial - Valor investido
 * @param {number} taxaAnual - Taxa anual em %
 * @param {Date} dataInicio - Data do investimento
 * @param {Date} dataVencimento - Data de vencimento
 * @returns {object} Cálculo até vencimento
 */
export function calcularAteVencimento(valorInicial, taxaAnual, dataInicio, dataVencimento) {
  const diffTime = Math.abs(dataVencimento - dataInicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.round(diffDays / 30);

  return calcularValorFuturo(valorInicial, taxaAnual, diffMonths);
}

/**
 * Compara diferentes investimentos
 * @param {Array} investimentos - Array de { nome, valor, taxa, dias }
 * @returns {Array} Ranking ordenado por rentabilidade
 */
export function compararInvestimentos(investimentos) {
  const resultados = investimentos.map(inv => {
    const calculo = calcularCDB(inv.valor, inv.taxa, inv.dias);
    return {
      ...inv,
      ...calculo,
      ranking: 0
    };
  });

  // Ordena por rentabilidade líquida
  resultados.sort((a, b) => b.rendimentoLiquido - a.rendimentoLiquido);

  // Adiciona ranking
  resultados.forEach((r, i) => r.ranking = i + 1);

  return resultados;
}

/**
 * Calcula dias corridos desde data de início
 * @param {string|Date} dataInicio - Data do investimento
 * @returns {number} Dias corridos
 */
export function calcularDiasCorridos(dataInicio) {
  const inicio = typeof dataInicio === 'string' ? new Date(dataInicio) : dataInicio;
  const hoje = new Date();
  const diffTime = Math.abs(hoje - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Formata taxa para exibição
 * @param {number} taxa - Taxa em decimal
 * @returns {string} Taxa formatada
 */
export function formatarTaxa(taxa) {
  return `${taxa.toFixed(2)}%`;
}

/**
 * Calcula equivalência de taxas
 * @param {number} taxaAnual - Taxa anual
 * @returns {object} { mensal, diaria }
 */
export function equivalenciaTaxas(taxaAnual) {
  const taxaMensal = (Math.pow(1 + taxaAnual / 100, 1 / 12) - 1) * 100;
  const taxaDiaria = (Math.pow(1 + taxaAnual / 100, 1 / 252) - 1) * 100;

  return {
    anual: taxaAnual,
    mensal: taxaMensal,
    diaria: taxaDiaria
  };
}

// Expõe funções globalmente
if (typeof window !== 'undefined') {
  window.rendaFixaUtils = {
    calcularCDB,
    calcularTesouroDireto,
    calcularIR,
    calcularIOF,
    calcularValorFuturo,
    calcularAteVencimento,
    compararInvestimentos,
    calcularDiasCorridos,
    TAXAS_REFERENCIA
  };
}
