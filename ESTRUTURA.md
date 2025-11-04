# Estrutura do Projeto - Swing Trade Portfolio

## 📁 Organização de Arquivos

```
swing-trade/
├── index.html              # Página principal HTML
├── styles.css              # Estilos CSS
├── carteira-export.xlsx    # Planilha de dados (Excel)
├── app.js                  # ⚠️ ARQUIVO ANTIGO - Manter como backup
└── js/                     # 📂 Código JavaScript modularizado
    ├── main.js             # 🚀 Ponto de entrada principal
    ├── models/             # 📊 Modelos de dados
    │   └── PortfolioAnalyzer.js  # Classe principal de análise FIFO
    ├── utils/              # 🛠️ Utilitários
    │   ├── formatters.js   # Formatação (moeda, qtd, %)
    │   └── helpers.js      # Funções auxiliares (status, tabs, parsing)
    ├── ui/                 # 🎨 Interface do usuário
    │   ├── summary.js      # Cards de resumo e gráfico de pizza
    │   ├── tables.js       # Tabelas de ativos (atuais e todos)
    │   └── other.js        # Trades, histórico e exportação
    └── data/               # 💾 Carregamento e processamento
        └── dataLoader.js   # Leitura de Excel e atualização de preços
```

## 🔧 Arquivos Principais

### `js/main.js`
- **Função**: Ponto de entrada da aplicação
- **Responsabilidades**:
  - Inicialização ao carregar a página
  - Auto-load da planilha
  - Exposição de funções globais para onclick

### `js/models/PortfolioAnalyzer.js`
- **Função**: Lógica de negócio principal
- **Responsabilidades**:
  - Processamento FIFO (First In First Out)
  - Cálculo de lucros realizados e em aberto
  - Gestão de lotes de ativos
  - Geração de trades e histórico

### `js/utils/formatters.js`
- **Função**: Formatação de valores
- **Exports**:
  - `formatCurrency()` - Formato BRL (R$)
  - `formatQty()` - Quantidade com decimais
  - `formatPercent()` - Percentual com sinal

### `js/utils/helpers.js`
- **Função**: Funções auxiliares gerais
- **Exports**:
  - `showStatus()` - Mensagens de status
  - `switchTab()` - Navegação entre abas
  - `getFixedIncome()` - Leitura do caixa
  - `parsePrice()` - Conversão de preços

### `js/ui/summary.js`
- **Função**: Renderização do resumo
- **Exports**:
  - `renderSummary()` - Cards de métricas principais
  - `renderChart()` - Gráfico de pizza por categoria
  - `renderCategorySummary()` - Tabela resumo por categoria

### `js/ui/tables.js`
- **Função**: Tabelas de ativos
- **Exports**:
  - `renderTable()` - Tabela de ativos atuais (em carteira)
  - `renderAllAssets()` - Tabela de todos os ativos (incluindo vendidos)
  - `filterCurrentAssets()` - Filtro para ativos atuais
  - `filterAllAssets()` - Filtro para todos os ativos
  - `renderDetails()` - Detalhes expandidos por ativo

### `js/ui/other.js`
- **Função**: Trades, histórico e exportação
- **Exports**:
  - `renderTrades()` - Tabela de trades realizados
  - `renderHistorico()` - Histórico completo de transações
  - `filterTrades()` - Filtro de trades por ativo
  - `exportReport()` - Exportar JSON
  - `exportExcel()` - Exportar XLSX

### `js/data/dataLoader.js`
- **Função**: Carregamento e processamento de dados
- **Exports**:
  - `loadExcel()` - Carregar planilha Excel
  - `processData()` - Processar transações
  - `updatePrice()` - Atualizar preço de ativo
  - `updateRealTimePrices()` - Buscar cotações via API Brapi
  - `currentData` - Dados atuais (global)

## 🔄 Fluxo de Dados

1. **Inicialização** (`main.js`)
   - Página carrega → `window.addEventListener('load')`
   - Auto-executa `loadExcel()`

2. **Carregamento** (`dataLoader.js`)
   - Lê `carteira-export.xlsx`
   - Converte para JSON
   - Chama `processData()`

3. **Processamento** (`dataLoader.js` + `PortfolioAnalyzer.js`)
   - Cria instância do `PortfolioAnalyzer`
   - Processa FIFO automático
   - Calcula métricas

4. **Renderização** (`ui/*.js`)
   - `renderSummary()` - Cards no topo
   - `renderChart()` - Gráfico de pizza
   - `renderTable()` - Tabela de ativos atuais
   - `renderAllAssets()` - Tabela de todos os ativos
   - `renderDetails()` - Detalhes expandidos
   - `renderTrades()` - Trades realizados
   - `renderHistorico()` - Histórico completo

## 🎯 Vantagens da Modularização

✅ **Manutenibilidade**: Código organizado por responsabilidade
✅ **Reusabilidade**: Funções podem ser importadas onde necessário
✅ **Testabilidade**: Módulos podem ser testados isoladamente
✅ **Performance**: Imports dinâmicos quando necessário
✅ **Legibilidade**: Cada arquivo tem propósito claro

## 🚀 Como Usar

1. **Abrir** `index.html` no navegador
2. **Auto-load**: Planilha carrega automaticamente
3. **Navegar**: Use as abas para ver diferentes visões
4. **Filtrar**: Use os filtros em cada aba
5. **Exportar**: Botões para JSON ou XLSX

## 📝 Observações Importantes

- ⚠️ **app.js original**: Mantido como backup, NÃO é mais usado
- 🔒 **Módulos ES6**: Requer servidor web (não funciona com file://)
- 🌐 **CORS**: Se testar localmente, use um servidor (ex: `python -m http.server`)
- 🔑 **API Brapi**: Chave hardcoded no código (`p5cuWQgjyHT1m4BEFespL4`)

## 🐛 Debugging

Para debugar, abra o DevTools (F12) e:
- **Console**: Ver logs e erros
- **Network**: Ver requisições (Excel, API)
- **Sources**: Adicionar breakpoints nos módulos
