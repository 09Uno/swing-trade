# 📊 Sistema de Análise de Investimentos - Swing Trade

Sistema completo para análise de investimentos utilizando metodologia FIFO (First In, First Out) com histórico detalhado de transações e métricas avançadas.

## 🚀 Versão 2.0 - Novas Funcionalidades!

### ✨ O que há de novo

- ✅ **Filtros Multi-Seleção**: Selecione múltiplas categorias simultaneamente
- ✅ **Paginação Profissional**: Navegue facilmente por grandes volumes de dados
- ✅ **Página de Trades Melhorada**: Informações detalhadas com duração, rentabilidade e totais
- ✅ **Lucro Total**: Nova coluna em Ativos Atuais mostrando lucro realizado + aberto
- ✅ **Layout Modernizado**: Design mais limpo e organizado
- ✅ **Correções**: Gráficos funcionando e caixa atualizando em tempo real

---

## 📋 Funcionalidades Principais

### 📈 Análise de Ativos
- **FIFO (First In, First Out)**: Cálculo preciso de lucros usando lotes
- **Ativos Atuais**: Visão completa da carteira em aberto
- **Todos os Ativos**: Histórico completo incluindo ativos vendidos
- **Preços em Tempo Real**: Atualização automática via API da B3

### 💹 Trades Realizados
- Listagem detalhada de todos os trades fechados
- Cálculo de lucro/prejuízo por trade
- Duração de cada operação em dias
- Rentabilidade percentual
- Estatísticas de performance

### 📊 Resumo e Gráficos
- Composição da carteira por categoria
- Lucro realizado vs em aberto
- Patrimônio total (ativos + caixa)
- Resumo por categoria
- Gráficos interativos (Chart.js)

### 🔍 Histórico Completo
- Todas as transações em ordem cronológica
- Evolução do lucro realizado
- Controle de caixa acumulado
- Quantidade em carteira por transação

### 🎯 Filtros Avançados
- **Multi-Seleção de Categorias**: Marque quantas categorias quiser
- **Busca por Ativo**: Filtro rápido por código do ativo
- **Período**: Filtros por data (em desenvolvimento)

### 📄 Exportação
- **Excel (XLSX)**: Todas as abas em um único arquivo
- **JSON**: Dados completos para integração
- Relatórios personalizáveis

---

## 🛠️ Como Usar

### 1. Preparar Planilha

Crie um arquivo `carteira-export.xlsx` na raiz do projeto com as seguintes colunas:

| Coluna | Descrição | Exemplo |
|--------|-----------|---------|
| Data operação | Data da transação | 15/01/2024 |
| Código Ativo | Ticker do ativo | PETR4 |
| Operação C/V | C para compra, V para venda | C |
| Quantidade | Quantidade negociada | 100 |
| Preço unitário | Preço por unidade | 35.50 |
| Categoria | Tipo do ativo | Ações |
| Corretagem | Taxa de corretagem | 5.00 |
| Taxas | Outras taxas | 0.50 |
| Impostos | Impostos | 0.00 |
| IRRF | IR retido na fonte | 0.00 |

**Categorias sugeridas:**
- Ações
- FIIs (Fundos Imobiliários)
- Stocks (Ações internacionais)
- ETFs
- BDRs
- Criptomoedas

### 2. Abrir o Sistema

```bash
# Método 1: Servidor local simples
python -m http.server 8000

# Método 2: Live Server (VSCode)
# Clique com botão direito em index.html > Open with Live Server

# Método 3: Navegador direto
# Abra index.html no navegador (pode ter restrições CORS)
```

Acesse: `http://localhost:8000`

### 3. Carregar Dados

O sistema carrega automaticamente o arquivo `carteira-export.xlsx`.

### 4. Atualizar Preços (Opcional)

Clique em **"🔄 Atualizar Preços"** para buscar cotações atuais da B3.

**Nota**: A API gratuita tem limite de requisições. Use com moderação.

### 5. Informar Caixa/Renda Fixa

Digite o valor disponível em caixa ou renda fixa no campo **"🏦 Caixa Renda Fixa"**.

---

## 📱 Navegação

### Abas Disponíveis

#### 📊 Resumo
- Cards com métricas principais
- Gráfico de composição da carteira
- Resumo por categoria
- Gráficos de lucro e patrimônio

#### 📈 Ativos Atuais
- Tabela com ativos em aberto
- Edição manual de preços
- **Coluna Lucro Total** (Realizado + Aberto)
- Filtros por categoria e ativo
- Paginação (ativa com mais de 10 itens)

#### 📋 Todos os Ativos
- Histórico completo de todos os ativos
- Inclui ativos já vendidos
- Preço médio de compra e venda
- Rentabilidade total
- Paginação (ativa com mais de 10 itens)

#### 💹 Trades Realizados
- **NOVO**: Design completamente reformulado
- Informações detalhadas:
  - Número do trade (#1, #2, ...)
  - Período (data compra → venda)
  - Duração em dias
  - Quantidade e preços
  - Totais de compra e venda
  - Lucro unitário e total
  - Rentabilidade %
- Estatísticas por ativo
- Filtro por ativo

#### 🔍 Histórico Completo
- Todas as transações em ordem cronológica
- Evolução do lucro e caixa
- Paginação (ativa com mais de 25 itens)

---

## 🎨 Novos Recursos Detalhados

### Filtros Multi-Seleção

**Como usar:**
1. Vá para "Ativos Atuais" ou "Todos os Ativos"
2. Na seção de filtros, veja as categorias como checkboxes
3. Marque/desmarque as categorias desejadas
4. Os filtros são aplicados automaticamente
5. Use "Limpar Filtros" para selecionar todas

**Benefícios:**
- Compare múltiplas categorias ao mesmo tempo
- Análise mais flexível
- Totais calculados automaticamente

### Paginação

**Recursos:**
- Escolha quantos itens exibir (10, 25, 50, 100, 200)
- Navegação por páginas
- Seleção rápida de página
- Contador de itens
- **Totais sempre calculados sobre TODOS os itens filtrados** (não só da página atual)

**Configurações padrão:**
- Ativos Atuais: 10, 25, 50 itens/página
- Todos os Ativos: 10, 25, 50, 100 itens/página
- Histórico: 25, 50, 100, 200 itens/página

### Trades Melhorados

**Informações exibidas:**

```
#1 | 15/01/2024 → 20/02/2024 (36 dias)

Quantidade: 100 unidades
Preço Compra: R$ 35,50 (Total: R$ 3.550,00)
Preço Venda: R$ 38,20 (Total: R$ 3.820,00)
Lucro Unitário: R$ 2,70 (7,61%)
━━━━━━━━━━━━━━━━━━━━━━━━
Lucro Total: R$ 270,00
Custos: R$ 10,50
```

---

## 📊 Exemplos de Análise

### Descobrir Melhores Ativos
1. Vá em "Todos os Ativos"
2. Ordene por "Rentabilidade Total"
3. Identifique os ativos mais lucrativos

### Analisar Performance por Categoria
1. Vá em "Resumo"
2. Veja a tabela "Resumo por Categoria"
3. Compare rentabilidade entre Ações, FIIs, etc.

### Verificar Trades de um Ativo Específico
1. Vá em "Trades Realizados"
2. Digite o código do ativo no filtro
3. Veja todos os trades daquele ativo

---

## 🔧 Configurações

### Alterar API Key (Cotações)

Edite em `js/data/dataLoader.js`:

```javascript
const apiKey = 'SUA_CHAVE_AQUI'; // Linha 134
```

Obtenha uma chave grátis em: [brapi.dev](https://brapi.dev)

### Modificar Categorias Padrão

As categorias são extraídas automaticamente da planilha. Basta adicionar novas categorias na coluna "Categoria".

---

## 📦 Tecnologias Utilizadas

- **HTML5/CSS3**: Interface responsiva
- **JavaScript ES6+**: Lógica modular
- **Chart.js**: Gráficos interativos
- **SheetJS (XLSX)**: Import/Export Excel
- **BRAPI**: API de cotações B3

---

## 🚀 Próximas Funcionalidades

Consulte [CHANGELOG.md](CHANGELOG.md) e [IMPLEMENTACAO_PROXIMAS_FEATURES.md](IMPLEMENTACAO_PROXIMAS_FEATURES.md) para:

- 💰 **Sistema de Proventos** (dividendos, JCP)
- 🏦 **Renda Fixa** (CDB, Tesouro, CDI)
- 🗄️ **Backend + Banco de Dados** (PostgreSQL/MongoDB)
- 🔐 **Multi-usuário** (autenticação)
- 📊 **Mais Gráficos** (evolução temporal, comparativos)

---

## 🐛 Problemas Conhecidos

- [ ] API de cotações pode falhar (limite de requests)
- [ ] Planilha deve estar na raiz do projeto
- [ ] CORS pode bloquear em alguns navegadores (use servidor local)

---

## 📄 Licença

Este projeto é de código aberto. Sinta-se livre para usar, modificar e distribuir.

---

## 👨‍💻 Contribuindo

Quer adicionar novas funcionalidades? Veja os guias em:
- [IMPLEMENTACAO_PROXIMAS_FEATURES.md](IMPLEMENTACAO_PROXIMAS_FEATURES.md)

---

## 📞 Suporte

Para dúvidas ou sugestões:
1. Consulte a documentação
2. Veja os arquivos de implementação
3. Abra uma issue no repositório

---

**Versão:** 2.0
**Última atualização:** Janeiro 2025
**Status:** ✅ Funcional e em desenvolvimento ativo
