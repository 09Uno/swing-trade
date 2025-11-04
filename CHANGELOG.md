# 📝 Changelog - Sistema de Análise de Investimentos

## 🗄️ Versão 5.0 - Backend com SQLite (Janeiro 2025)

### 🚀 Nova Funcionalidade: Backend API + Banco de Dados Portátil

**O que foi implementado:**
- ✅ Backend completo com Node.js + Express
- ✅ Banco de dados SQLite em arquivo único e portátil
- ✅ ORM Sequelize para abstração do banco
- ✅ API RESTful completa com CRUD para todas entidades
- ✅ Sistema de backup/restore integrado
- ✅ Download do arquivo .db via API
- ✅ Frontend com suporte híbrido (API + LocalStorage)
- ✅ Detecção automática de disponibilidade da API
- ✅ CORS configurado para funcionar com frontend separado

**Estrutura do Backend:**
```
backend/
├── src/
│   ├── config/database.js       # SQLite config
│   ├── models/                  # Transaction, Provento, RendaFixa, Config
│   ├── controllers/             # Lógica de negócio
│   └── routes/                  # Endpoints REST
├── database/investimentos.db    # Banco portátil
├── server.js
└── package.json
```

**API Endpoints:**
- `GET/POST/PUT/DELETE /api/transactions` - Transações
- `GET/POST/PUT/DELETE /api/proventos` - Proventos
- `GET/POST/PUT/DELETE /api/renda-fixa` - Renda Fixa
- `GET /api/summary` - Resumo completo
- `POST /api/backup/create` - Criar backup
- `GET /api/backup/download` - Download do .db

**Vantagens do SQLite:**
- 📁 Arquivo único - todo banco em um arquivo `.db`
- 🚀 Zero configuração - não precisa instalar servidor de BD
- 💾 Portátil - copie e cole entre computadores
- 🔒 ACID compliant - transações seguras
- 🪶 Leve - ideal para uso pessoal/local

**Como usar:**
```bash
cd backend
npm install
npm start
```

**Movimentação de dados:**
- Copie `backend/database/investimentos.db` para backup
- Cole em outro computador e está pronto
- Use API `/api/backup/download` para baixar

**Frontend híbrido:**
- API disponível → Usa backend para persistência
- API indisponível → Usa LocalStorage (modo offline)
- Detecção automática e transparente

**Arquivos novos:**
- `backend/` - Pasta completa do backend
- `js/api/apiClient.js` - Cliente HTTP para API
- `backend/README.md` - Documentação completa

---

## 🏦 Versão 4.0 - Sistema de Renda Fixa (Janeiro 2025)

### 💵 Nova Funcionalidade: Sistema Completo de Renda Fixa

**O que foi implementado:**
- ✅ Cadastro de investimentos em Renda Fixa
- ✅ Suporte para CDB, LCI, LCA e Tesouro Direto (Selic, IPCA+, Prefixado)
- ✅ Cálculos automáticos de IR e IOF
- ✅ Isenção automática para LCI/LCA
- ✅ Interface completa com modal de cadastro/edição
- ✅ Filtros por tipo e status (ativo/resgatado)
- ✅ Tabela com paginação automática
- ✅ Cards de resumo e estatísticas
- ✅ Gráfico de composição por tipo
- ✅ Gráfico de projeção para 12 meses
- ✅ Funcionalidade de resgate com cálculo final
- ✅ Configuração de taxas (CDI, Selic, IPCA)
- ✅ Exportação completa (Excel + JSON)
- ✅ Persistência automática (LocalStorage)

**Arquivos novos:**
- `js/utils/rendaFixa.js` - Engine de cálculos financeiros
- `js/models/RendaFixaManager.js` - Gerenciador de investimentos
- `js/ui/rendaFixa.js` - Renderização da interface
- `js/controllers/rendaFixaController.js` - Controle de modais e ações

**Tipos de investimento suportados:**
- CDB (% do CDI)
- LCI/LCA (% do CDI, isento de IR)
- Tesouro Selic (% da Selic)
- Tesouro IPCA+ (% a.a. + IPCA)
- Tesouro Prefixado (% a.a.)

**Cálculos implementados:**
- IR regressivo (22.5% → 20% → 17.5% → 15%)
- IOF regressivo (primeiros 30 dias)
- Rendimento bruto e líquido
- Projeção de rendimentos futuros
- Rentabilidade percentual

**Integrado em:**
- ✅ Export Excel (nova aba "Renda Fixa")
- ✅ Export JSON (campo rendaFixa)
- ✅ Sistema de tabs principal
- ✅ Inicialização automática

---

## 🎉 Versão 3.0 - Sistema de Proventos (Janeiro 2025)

### 💰 Nova Funcionalidade: Sistema Completo de Proventos

**O que foi implementado:**
- ✅ Cadastro manual de proventos (Dividendos, JCP, Rendimentos)
- ✅ Interface completa com modal de cadastro/edição
- ✅ Filtros avançados (ativo, tipo, período)
- ✅ Tabela com paginação automática
- ✅ Cards de resumo e estatísticas
- ✅ Gráfico temporal de evolução
- ✅ Importação via Excel
- ✅ Exportação completa (Excel + JSON)
- ✅ Persistência automática (LocalStorage)
- ✅ **Integrado ao cálculo de Lucro Total**
- ✅ Card de proventos no resumo principal

**Arquivos novos:**
- `js/models/ProventosManager.js`
- `js/ui/proventos.js`
- `js/controllers/proventosController.js`
- `ATUALIZACAO_V3.md` (documentação completa)

**Ver documentação completa:** [ATUALIZACAO_V3.md](ATUALIZACAO_V3.md)

---

## ✅ Versão 2.0 - Melhorias Implementadas (Janeiro 2025)

### 🔧 Correções

1. **Gráficos do Resumo**
   - ✅ Corrigido problema dos gráficos não sendo exibidos
   - ✅ Gráficos agora são renderizados corretamente na aba Resumo

2. **Atualização do Caixa**
   - ✅ Campo de caixa/renda fixa agora atualiza os valores em tempo real
   - ✅ Todos os gráficos e totais são recalculados ao alterar o valor

3. **Lucro Total em Ativos Atuais**
   - ✅ Adicionada coluna "Lucro Total" na página de Ativos Atuais
   - ✅ Mostra a soma de Lucro Realizado + Lucro Aberto

### 🎨 Melhorias de Layout

1. **Design Geral**
   - Melhor espaçamento entre elementos
   - Background nos controles e filtros
   - Efeitos hover melhorados
   - Focus states nos inputs
   - Tipografia mais legível

2. **Filtros**
   - Novo design com background e padding
   - Checkboxes com estilo moderno
   - Melhor organização visual

### 🚀 Novas Funcionalidades

#### 1. **Filtro Multi-Seleção de Categorias**
- Agora você pode selecionar múltiplas categorias simultaneamente
- Substituído dropdown por checkboxes
- Disponível nas abas:
  - ✅ Ativos Atuais
  - ✅ Todos os Ativos

**Como usar:**
- Marque/desmarque as categorias desejadas
- Os filtros são aplicados automaticamente
- Use o botão "Limpar Filtros" para selecionar todas

#### 2. **Informações Detalhadas na Página de Trades**
- Design completamente renovado
- Informações mais claras e organizadas:
  - Número do trade (#1, #2, etc.)
  - Duração do trade em dias
  - Total de compra e venda
  - Rentabilidade percentual
  - Destaque para lucro total
  - Informações de custos

**Novos campos:**
- Data de compra → Data de venda (com duração)
- Totais calculados automaticamente
- Percentual de lucro/prejuízo

#### 3. **Paginação Completa**
- Sistema de paginação profissional
- Implementado nas seguintes abas:
  - ✅ Ativos Atuais (ativa com mais de 10 itens)
  - ✅ Todos os Ativos (ativa com mais de 10 itens)
  - ✅ Histórico Completo (ativa com mais de 25 itens)

**Recursos da paginação:**
- Navegação por páginas (Anterior/Próximo)
- Seleção rápida de página
- Escolha de itens por página (10, 25, 50, 100, 200)
- Contador de itens exibidos
- Totais sempre calculados sobre todos os itens filtrados

---

## 🔜 Próximas Funcionalidades (Roadmap)

### 🗄️ 1. Sistema de Banco de Dados
**Objetivo:** Tornar o sistema persistente e escalável

**Tecnologias sugeridas:**
- **Backend:** Node.js + Express
- **Banco de Dados:** PostgreSQL ou MongoDB
- **API:** RESTful API

**Funcionalidades:**
- Salvar transações no banco
- Importar/Exportar dados
- Backup automático
- Multi-usuário (futuramente)

**Estrutura sugerida:**
```
/backend
  /src
    /routes      # Rotas da API
    /controllers # Lógica de negócio
    /models      # Modelos do banco
    /services    # Serviços auxiliares
  server.js      # Servidor Express
  package.json
```

**Endpoints da API:**
- `GET /api/transactions` - Listar transações
- `POST /api/transactions` - Criar transação
- `PUT /api/transactions/:id` - Atualizar transação
- `DELETE /api/transactions/:id` - Deletar transação
- `GET /api/summary` - Obter resumo
- `POST /api/import/xlsx` - Importar planilha

---

### 💰 2. Sistema de Proventos
**Objetivo:** Registrar e acompanhar dividendos, JCP, etc.

**Funcionalidades:**
- Cadastro manual de proventos
- Tipos: Dividendos, JCP, Rendimentos
- Histórico de proventos por ativo
- Total de proventos recebidos
- Yield (dividendo/preço)
- Inclusão no cálculo de lucro total

**Nova aba no sistema:**
- 📊 Proventos
  - Listagem por ativo
  - Filtros por período
  - Gráfico de proventos ao longo do tempo
  - Total recebido por categoria

**Estrutura de dados:**
```javascript
{
  id: 1,
  ativo: "BBDC4",
  tipo: "Dividendo", // ou "JCP", "Rendimento"
  valor: 0.25,
  dataCom: "15/01/2024",
  dataPagamento: "30/01/2024",
  quantidade: 100,
  total: 25.00
}
```

---

### 🏦 3. Renda Fixa (CDB, Tesouro, CDI)
**Objetivo:** Ampliar para outros tipos de investimento

**Tipos a suportar:**
- CDB
- Tesouro Direto (Selic, IPCA+, Prefixado)
- LCI/LCA
- Debêntures
- Fundos de Renda Fixa

**Funcionalidades:**
- Cadastro de ativos de renda fixa
- Cálculo de rentabilidade considerando:
  - Taxa CDI
  - Indexadores (IPCA, Selic)
  - Vencimento
  - Liquidez
- Comparação com outros ativos
- Projeção de rendimento futuro

**Nova categoria:**
- Adicionar categoria "Renda Fixa" nos filtros
- Campos específicos:
  - Taxa (% do CDI ou taxa fixa)
  - Indexador
  - Data de vencimento
  - Liquidez (diária, no vencimento)

---

## 📋 Implementação Sugerida - Ordem de Prioridade

### Fase 1: Sistema de Proventos (mais simples)
1. Criar estrutura de dados para proventos
2. Adicionar formulário de cadastro
3. Criar tabela de visualização
4. Integrar ao cálculo de lucro total
5. Adicionar ao export Excel/JSON

### Fase 2: Renda Fixa (média complexidade)
1. Estender modelo de dados para suportar renda fixa
2. Criar campos específicos no formulário
3. Implementar cálculos de rentabilidade
4. Adicionar aos gráficos e resumos

### Fase 3: Banco de Dados (mais complexo)
1. Configurar backend Node.js + Express
2. Definir schema do banco
3. Criar API RESTful
4. Migrar frontend para usar API
5. Implementar autenticação (opcional)
6. Deploy em servidor

---

## 🛠️ Como Começar

### Para Proventos:
1. Criar arquivo `js/models/Dividendos.js`
2. Adicionar no HTML modal/formulário de cadastro
3. Criar tabela de visualização
4. Integrar aos cálculos existentes

### Para Banco de Dados:
1. Instalar Node.js
2. Inicializar projeto: `npm init -y`
3. Instalar dependências:
   ```bash
   npm install express pg sequelize cors dotenv
   ```
4. Criar estrutura de pastas
5. Configurar banco PostgreSQL
6. Criar modelos e migrations
7. Implementar rotas da API

---

## 📞 Suporte

Para dúvidas ou sugestões sobre as novas funcionalidades, consulte a documentação ou abra uma issue no repositório do projeto.

---

**Versão:** 2.0
**Data:** 2025-01-11
**Status:** ✅ Melhorias implementadas | 🔜 Próximas funcionalidades planejadas
