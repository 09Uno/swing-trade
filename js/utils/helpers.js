// ========== FUNÇÕES AUXILIARES ==========

export function showStatus(msg,type='info'){
  const s=document.getElementById('statusMessage');
  s.textContent=msg;
  s.className='status-message '+type;
  s.style.display='block';
  if(type!=='error')setTimeout(()=>s.style.display='none',4000);
}

export function switchTab(tabName){
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  document.querySelector(`[onclick="switchTab('${tabName}')"]`)?.classList.add('active');
}

export function getFixedIncome(){
  return Number(document.getElementById('fixedIncomeInput').value)||0;
}

export function parsePrice(val){
  if(typeof val==='string'){
    return Number(val.replace('R$','').replace('.','').replace(',','.').trim());
  }
  return Number(val);
}
