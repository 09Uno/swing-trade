// ========== SCRIPT PARA ATUALIZAR URL DO BACKEND ==========
// Execute: node update-api-url.js https://sua-url.onrender.com

const fs = require('fs');
const path = require('path');

const newBackendURL = process.argv[2];

if (!newBackendURL) {
  console.error('❌ Erro: Você precisa fornecer a URL do backend!');
  console.log('\nUso: node update-api-url.js https://sua-url.onrender.com');
  process.exit(1);
}

if (!newBackendURL.startsWith('http://') && !newBackendURL.startsWith('https://')) {
  console.error('❌ Erro: URL deve começar com http:// ou https://');
  process.exit(1);
}

const apiURL = newBackendURL.endsWith('/api') ? newBackendURL : `${newBackendURL}/api`;

console.log(`\n🔄 Atualizando URL do backend para: ${apiURL}\n`);

// Arquivos a atualizar
const files = [
  { 
    path: 'login.html',
    search: /const API_URL = ['"].*['"]/,
    replace: `const API_URL = '${apiURL}'`
  },
  { 
    path: 'index.html',
    search: /const API_URL = ['"].*['"]/,
    replace: `const API_URL = '${apiURL}'`
  },
  { 
    path: 'js/api/apiClient.js',
    search: /const API_BASE_URL = ['"].*['"]/,
    replace: `const API_BASE_URL = '${apiURL}'`
  }
];

let updated = 0;
let errors = 0;

files.forEach(file => {
  try {
    const filePath = path.join(__dirname, file.path);
    
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Arquivo não encontrado: ${file.path}`);
      return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    
    content = content.replace(file.search, file.replace);
    
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${file.path} atualizado`);
      updated++;
    } else {
      console.log(`ℹ️  ${file.path} não precisou de atualização`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${file.path}:`, error.message);
    errors++;
  }
});

console.log(`\n📊 Resultado:`);
console.log(`   ✅ ${updated} arquivo(s) atualizado(s)`);
console.log(`   ❌ ${errors} erro(s)`);

if (updated > 0) {
  console.log(`\n🎉 Pronto! Agora faça o commit e push:`);
  console.log(`   git add .`);
  console.log(`   git commit -m "Atualizar URL do backend para produção"`);
  console.log(`   git push origin main`);
}

console.log('');
