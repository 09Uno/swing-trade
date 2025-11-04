// ========== FORMATAÇÃO ==========

export function formatCurrency(v){
  const num=Number(v);
  return new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL',minimumFractionDigits:2,maximumFractionDigits:2}).format(num);
}

export function formatQty(v){
  const num=Number(v);
  return num.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:8});
}

export function formatPercent(v){
  const num=Number(v);
  const s=num>=0?'+':'';
  return s+num.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'%';
}
