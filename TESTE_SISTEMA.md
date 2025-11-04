# 🧪 Guia de Teste do Sistema

## ✅ Como Testar se Está Funcionando

### 1. Abrir o Sistema

```bash
# No terminal, dentro da pasta do projeto:
python -m http.server 8000

# Ou use Live Server do VS Code
```

Acesse: `http://localhost:8000`

### 2. Verificar Carregamento

**O que deve aparecer:**
- ✅ Mensagem "Carregando planilha..."
- ✅ Se houver `carteira-export.xlsx`, mostra "✅ Processadas X transações"
- ✅ Se não houver, mostra erro "Arquivo não encontrado" (normal)
- ✅ Abas aparecem: Resumo, Ativos Atuais, Todos os Ativos, Trades, **Proventos**, Histórico

### 3. Testar Sistema de Proventos

#### Adicionar Provento Manualmente

1. Clique na aba **"💰 Proventos"**
2. Clique em **"➕ Adicionar Provento"**
3. Preencha:
   - Ativo: `PETR4`
   - Tipo: `Dividendo`
   - Valor Unitário: `1.42`
   - Quantidade: `100`
   - Data COM: (qualquer data)
   - Data Pagamento: (qualquer data)
4. Clique em **"Salvar"**

**Resultado esperado:**
- ✅ Modal fecha
- ✅ Aparece mensagem "✅ Provento adicionado com sucesso!"
- ✅ Tabela mostra o provento
- ✅ Cards de resumo atualizam
- ✅ Gráfico aparece (se tiver dados)

#### Testar Filtros

1. Na aba Proventos, digite no campo "Ativo": `PETR`
2. Resultado: Mostra apenas proventos de PETR*

3. Selecione "Tipo": `Dividendo`
4. Resultado: Mostra apenas dividendos

5. Clique em **"Limpar Filtros"**
6. Resultado: Mostra todos novamente

#### Testar Edição

1. Clique no ícone ✏️ ao lado de um provento
2. Altere algum valor
3. Clique em "Salvar"
4. Resultado: Provento atualizado

#### Testar Exclusão

1. Clique no ícone 🗑️ ao lado de um provento
2. Confirme a exclusão
3. Resultado: Provento removido

### 4. Verificar Integração no Resumo

1. Vá na aba **"📊 Resumo"**
2. Se tiver proventos cadastrados, deve aparecer um card:

```
┌─────────────────────────┐
│ 💰 Proventos Recebidos │
│ R$ XXX,XX              │
└─────────────────────────┘
```

3. O card **"📊 Resultado Total"** deve incluir os proventos no cálculo

### 5. Testar Exports

#### Export Excel

1. Clique em **"📥 Exportar XLSX"**
2. Abre um arquivo Excel
3. Deve ter as abas:
   - Resumo
   - Ativos
   - Trades
   - **Proventos** (NOVA!)
   - Histórico

#### Export JSON

1. Clique em **"📤 Exportar Relatório JSON"**
2. Abre um arquivo JSON
3. Deve ter o campo `proventos: [...]`

### 6. Testar Persistência

1. Adicione alguns proventos
2. **Feche o navegador**
3. Abra novamente
4. Vá na aba Proventos
5. Resultado: Proventos ainda estão lá! (LocalStorage funcionando)

---

## 🐛 Problemas Comuns

### Erro: "loadExcel is not defined"

**Solução:**
- Certifique-se de que está usando um servidor (não abrindo o HTML direto)
- O erro foi corrigido nos arquivos. Dê refresh (Ctrl+F5)

### Gráficos não aparecem

**Solução:**
- Adicione pelo menos 2 proventos em meses diferentes
- O gráfico só aparece com dados suficientes

### Modal não abre

**Solução:**
- Verifique se não há erros no console (F12)
- O erro foi corrigido, dê refresh

### Proventos não salvam

**Solução:**
- LocalStorage pode estar bloqueado
- Tente em modo anônimo
- Verifique permissões do navegador

---

## ✅ Checklist de Funcionalidades

### Sistema Base
- [ ] Sistema carrega sem erros
- [ ] Abas aparecem corretamente
- [ ] Filtros funcionam

### Proventos
- [ ] Aba Proventos existe
- [ ] Modal abre e fecha
- [ ] Adicionar provento funciona
- [ ] Editar provento funciona
- [ ] Excluir provento funciona
- [ ] Filtros funcionam
- [ ] Paginação funciona (>10 itens)
- [ ] Cards de resumo mostram valores corretos
- [ ] Gráfico aparece (com dados suficientes)

### Integração
- [ ] Card de proventos aparece no Resumo
- [ ] Lucro Total inclui proventos
- [ ] Export Excel tem aba Proventos
- [ ] Export JSON inclui proventos

### Persistência
- [ ] Dados salvos ao adicionar
- [ ] Dados preservados ao recarregar página
- [ ] Limpar navegador apaga dados

---

## 📊 Dados de Teste

Para testar rapidamente, use estes dados:

### Provento 1
```
Ativo: PETR4
Tipo: Dividendo
Valor Unit.: 1.42
Quantidade: 100
Data COM: 2024-01-15
Data Pgto: 2024-01-30
Total: R$ 142,00
```

### Provento 2
```
Ativo: VALE3
Tipo: JCP
Valor Unit.: 2.15
Quantidade: 50
Data COM: 2024-02-10
Data Pgto: 2024-02-25
Total: R$ 107,50
```

### Provento 3
```
Ativo: ITUB4
Tipo: Dividendo
Valor Unit.: 0.85
Quantidade: 200
Data COM: 2024-03-05
Data Pgto: 2024-03-20
Total: R$ 170,00
```

**Total esperado:** R$ 419,50

---

## 🎯 Teste Completo

Execute este teste passo a passo:

1. ✅ Abra o sistema
2. ✅ Vá em Proventos
3. ✅ Adicione os 3 proventos acima
4. ✅ Verifique card de Total: deve mostrar R$ 419,50
5. ✅ Teste filtro por ativo: `PETR4`
6. ✅ Teste filtro por tipo: `Dividendo`
7. ✅ Limpe filtros
8. ✅ Edite um provento (altere valor)
9. ✅ Verifique que total atualizou
10. ✅ Vá em Resumo
11. ✅ Verifique card "Proventos Recebidos"
12. ✅ Exporte Excel
13. ✅ Verifique aba Proventos no Excel
14. ✅ Feche navegador
15. ✅ Abra novamente
16. ✅ Verifique que dados persistiram

---

## 🚀 Próximos Testes (Quando Implementado)

### Renda Fixa
- [ ] Adicionar CDB
- [ ] Calcular rendimento
- [ ] Ver projeção futura

### Backend (Futuro)
- [ ] Salvar no servidor
- [ ] Sincronizar dados

---

**Se todos os testes passarem, o sistema está 100% funcional! 🎉**
