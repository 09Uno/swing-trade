# 📥 Guia de Importação de Excel

## Como importar suas transações via Excel

### 1. Prepare seu arquivo Excel

Seu arquivo deve ter as seguintes colunas (o sistema aceita variações de nomes):

| Coluna | Obrigatório | Formatos aceitos | Exemplo |
|--------|-------------|------------------|---------|
| **Data** | ✅ Sim | Data, DATE, date | 01/01/2024 ou 2024-01-01 |
| **Ativo** | ✅ Sim | Ativo, ativo, Ticker, ATIVO | PETR4 |
| **Tipo** | ✅ Sim | Tipo, tipo, Type, TIPO | C, V, Compra, Venda, BUY, SELL |
| **Quantidade** | ✅ Sim | Quantidade, Qtd, qtd, Quantity | 100 |
| **Preço** | ✅ Sim | Preço, preco, Price, PRECO | 38.50 |
| **Custos** | ❌ Não | Custos, custos, Taxas, Costs | 10.00 |
| **Categoria** | ❌ Não | Categoria, categoria, Category | Ações, FIIs, ETFs |

### 2. Formato de exemplo

```
Data        | Ativo  | Tipo   | Quantidade | Preço  | Custos | Categoria
01/01/2024  | PETR4  | C      | 100        | 38.50  | 10.00  | Ações
15/01/2024  | VALE3  | Compra | 50         | 65.20  | 8.50   | Ações
20/02/2024  | PETR4  | V      | 50         | 40.20  | 9.00   | Ações
```

### 3. Tipos de operação aceitos

**Compra:**
- `C`
- `COMPRA`
- `BUY`

**Venda:**
- `V`
- `VENDA`
- `SELL`

### 4. Formato de datas aceitos

- `DD/MM/YYYY` → 01/01/2024
- `DD/MM/YY` → 01/01/24
- `YYYY-MM-DD` → 2024-01-01
- Datas do Excel (número serial)

### 5. Categorias disponíveis

- Ações
- FIIs (Fundos Imobiliários)
- ETFs
- BDRs
- Stocks (Ações Internacionais)
- REITs
- Cripto (Criptomoedas)
- Outros (padrão se não especificado)

## 🚀 Como usar

1. **Abra o Portfolio Manager** no navegador
2. **Clique em "📥 Importar Excel"** na barra de ferramentas
3. **Selecione seu arquivo** (.xlsx ou .xls)
4. **Confirme a importação** - o sistema mostrará quantas transações foram encontradas
5. **Pronto!** As transações serão salvas automaticamente

## ✅ Validações automáticas

O sistema valida automaticamente:
- ✅ Campos obrigatórios preenchidos
- ✅ Tipo de operação válido (C ou V)
- ✅ Valores numéricos corretos
- ✅ Formato de data válido
- ⚠️ Linhas com erro são **ignoradas** e reportadas no console

## 💡 Dicas

1. **Use o arquivo template** incluído: `template-importacao.csv`
2. **Mantenha os headers** na primeira linha
3. **Não use vírgulas** nos valores numéricos (use ponto: 38.50)
4. **Teste primeiro** com poucas linhas para validar o formato
5. **Verifique o console** (F12) para ver erros detalhados

## 📤 Exportação

Você também pode **exportar** suas transações:
- Clique em "📤 Exportar"
- Um arquivo Excel será baixado com todas as suas transações
- Use este arquivo como backup ou template!

## ❌ Problemas comuns

### "Nenhuma transação válida encontrada"
- ✅ Verifique se os headers estão corretos
- ✅ Certifique-se que há dados abaixo dos headers
- ✅ Veja o console (F12) para detalhes dos erros

### "Linha X ignorada: dados incompletos"
- ✅ Verifique se todos os campos obrigatórios estão preenchidos
- ✅ Confira se não há células vazias

### Datas não importam corretamente
- ✅ Use formato DD/MM/YYYY
- ✅ Ou configure as células como "Data" no Excel

---

**Precisa de ajuda?** Abra o console do navegador (F12) para ver logs detalhados da importação.
