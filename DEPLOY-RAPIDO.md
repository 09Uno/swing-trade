# 🚀 Deploy Rápido - Swing Trade Manager

## Opção 1: GitHub Pages (Mais Simples - Sem Backend)

### Vantagens:
- 100% grátis
- Simples e rápido
- Usa apenas localStorage (dados no navegador)

### Passos:

1. **Faça push para o GitHub:**
```bash
git add .
git commit -m "Deploy inicial"
git push origin main
```

2. **Ative GitHub Pages:**
   - Vá em: Settings > Pages
   - Source: Deploy from a branch
   - Branch: main > / (root)
   - Save

3. **Acesse em:** `https://09uno.github.io/swing-trade/`

### ⚠️ Limitações:
- Dados salvos apenas no navegador (localStorage)
- Precisa fazer backup manual (exportar JSON)

---

## Opção 2: Vercel (Recomendado - Com Backend)

### Vantagens:
- Backend SQLite funcional
- Deploy automático
- SSL grátis
- Melhor performance

### Passos:

1. **Acesse:** https://vercel.com
2. **Import Project** > Selecione o repositório GitHub
3. **Deploy!**

4. **Acesse em:** `https://swing-trade.vercel.app`

---

## 📱 Acesso Mobile

Após o deploy, você pode:

1. **Adicionar à tela inicial** (PWA-like):
   - Chrome: Menu > Adicionar à tela inicial
   - Safari: Compartilhar > Adicionar à Tela de Início

2. **Sincronizar dados entre dispositivos:**
   - Exportar JSON em um dispositivo
   - Importar JSON no outro

---

## 💾 Backup e Segurança

### Backup Automático:
```javascript
// Execute no console do navegador para baixar backup
localStorage.getItem('transactions'); // Ver transações
localStorage.getItem('savedPrices'); // Ver preços salvos
```

### Backup Manual:
- Botão "📤 Exportar JSON" - Salvar arquivo
- Botão "💾 Backup BD" - Baixar banco SQLite (se backend disponível)

---

## 🔧 Configuração Recomendada

1. **Para uso pessoal:** GitHub Pages
2. **Para múltiplos usuários:** Vercel + Backend
3. **Para dados sensíveis:** Host próprio com autenticação

---

## 📞 Problemas Comuns

### "Dados não aparecem após reload"
- Certifique-se de que o localStorage não está bloqueado
- Faça backup via "Exportar JSON"

### "API de preços não funciona"
- Verifique conexão com internet
- APIs externas podem ter rate limits

### "Backend não conecta"
- No GitHub Pages, backend não funciona (use localStorage)
- Na Vercel, backend SQLite funciona automaticamente

---

**🎉 Pronto! Agora você pode acessar seus investimentos de qualquer lugar!**
