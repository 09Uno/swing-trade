// COPIE E COLE ESTE CÓDIGO NO CONSOLE DO NAVEGADOR (F12) para adicionar dados de teste

// Adicionar provento de teste
const proventoTeste = {
  id: Date.now(),
  ativo: 'PETR4',
  tipo: 'Dividendo',
  valorUnitario: 0.85,
  quantidade: 100,
  total: 85.00,
  dataCom: '2024-11-01',
  dataPagamento: '2024-11-15',
  createdAt: new Date().toISOString()
};

// Salvar no localStorage
let proventos = JSON.parse(localStorage.getItem('swing_trade_proventos')) || [];
proventos.push(proventoTeste);
localStorage.setItem('swing_trade_proventos', JSON.stringify(proventos));

console.log('✅ Provento de teste adicionado!', proventoTeste);
console.log('Agora clique na aba Proventos para ver');

// Adicionar renda fixa de teste
const rendaFixaTeste = {
  id: Date.now() + 1,
  nome: 'CDB Banco Inter 110% CDI',
  tipo: 'CDB',
  valorInicial: 10000,
  taxa: 110,
  dataInicio: '2024-09-01',
  dataVencimento: '2024-12-01',
  liquidez: 'Vencimento',
  instituicao: 'Banco Inter',
  observacoes: 'Investimento teste',
  ativo: true,
  createdAt: new Date().toISOString()
};

// Salvar no localStorage
let rendaFixa = JSON.parse(localStorage.getItem('swing_trade_renda_fixa')) || {};
if (!rendaFixa.investimentos) {
  rendaFixa = { investimentos: [], taxasReferencia: {} };
}
rendaFixa.investimentos.push(rendaFixaTeste);
localStorage.setItem('swing_trade_renda_fixa', JSON.stringify(rendaFixa));

console.log('✅ Renda Fixa de teste adicionada!', rendaFixaTeste);
console.log('Agora clique na aba Renda Fixa para ver');
