// ========== SCRIPT PARA CRIAR USUÁRIO ADMINISTRADOR ==========
// Execute: node criar-usuario.js

import { sequelize } from './src/config/database.js';
import User from './src/models/User.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function criarUsuario() {
  try {
    console.log('\n🔐 CRIAR USUÁRIO ADMINISTRADOR\n');

    // Conecta ao banco
    await sequelize.authenticate();
    await sequelize.sync();

    // Pergunta dados do usuário
    const username = await question('Digite o nome de usuário: ');
    const password = await question('Digite a senha (mínimo 6 caracteres): ');

    if (!username || username.length < 3) {
      console.error('❌ Username deve ter no mínimo 3 caracteres');
      process.exit(1);
    }

    if (!password || password.length < 6) {
      console.error('❌ Senha deve ter no mínimo 6 caracteres');
      process.exit(1);
    }

    // Verifica se já existe
    const existente = await User.findOne({ where: { username } });
    if (existente) {
      console.error('❌ Este usuário já existe!');
      process.exit(1);
    }

    // Cria usuário
    const user = await User.create({ username, password });

    console.log('\n✅ Usuário criado com sucesso!');
    console.log(`📝 Username: ${user.username}`);
    console.log(`🆔 ID: ${user.id}`);
    console.log(`📅 Criado em: ${user.createdAt}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    process.exit(1);
  }
}

criarUsuario();
