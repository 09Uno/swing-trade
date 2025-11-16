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
  
  // Recarrega dados quando muda de aba
  console.log('[SWITCH TAB] Mudando para aba:', tabName);
  if (tabName === 'proventos' && window.initProventos) {
    console.log('[SWITCH TAB] Chamando initProventos');
    window.initProventos();
  }
  if (tabName === 'rendafixa' && window.initRendaFixa) {
    console.log('[SWITCH TAB] Chamando initRendaFixa');
    window.initRendaFixa();
  }
}

// ========== CONFIRM CUSTOMIZADO ==========
export function customConfirm(options) {
  return new Promise((resolve) => {
    const overlay = document.getElementById('confirmOverlay');
    const icon = document.getElementById('confirmIcon');
    const title = document.getElementById('confirmTitle');
    const message = document.getElementById('confirmMessage');
    const btnOk = document.getElementById('confirmOk');
    const btnCancel = document.getElementById('confirmCancel');

    // Configura o modal
    title.textContent = options.title || 'Confirmar ação';
    message.textContent = options.message || 'Tem certeza?';
    
    // Define ícone e estilo
    icon.className = 'confirm-icon';
    btnOk.className = 'confirm-btn confirm-btn-confirm';
    
    if (options.type === 'danger') {
      icon.textContent = '🗑️';
      icon.classList.add('danger');
    } else if (options.type === 'warning') {
      icon.textContent = '⚠️';
      icon.classList.add('warning');
    } else {
      icon.textContent = 'ℹ️';
      icon.classList.add('info');
      btnOk.classList.add('primary');
    }

    // Textos dos botões
    btnOk.textContent = options.confirmText || 'Confirmar';
    btnCancel.textContent = options.cancelText || 'Cancelar';

    // Mostra o modal
    overlay.classList.add('active');

    // Event listeners
    const handleConfirm = () => {
      overlay.classList.remove('active');
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      overlay.classList.remove('active');
      cleanup();
      resolve(false);
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleCancel();
      }
    };

    const cleanup = () => {
      btnOk.removeEventListener('click', handleConfirm);
      btnCancel.removeEventListener('click', handleCancel);
      overlay.removeEventListener('click', handleOverlayClick);
      document.removeEventListener('keydown', handleEscape);
    };

    const handleOverlayClick = (e) => {
      if (e.target === overlay) {
        handleCancel();
      }
    };

    btnOk.addEventListener('click', handleConfirm);
    btnCancel.addEventListener('click', handleCancel);
    overlay.addEventListener('click', handleOverlayClick);
    document.addEventListener('keydown', handleEscape);

    // Foca no botão de cancelar por segurança
    btnCancel.focus();
  });
}

// Expõe globalmente
window.customConfirm = customConfirm;

export function getFixedIncome(){
  const input = document.getElementById('fixedIncomeInput');
  return input ? Number(input.value) || 0 : 0;
}

export function parsePrice(val){
  if(typeof val==='string'){
    return Number(val.replace('R$','').replace('.','').replace(',','.').trim());
  }
  return Number(val);
}

