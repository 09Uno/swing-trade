// ========== SCRIPT PARA LISTAR USUÁRIOS ==========
// Execute: node listar-usuarios.js

import { sequelize } from './src/config/database.js';
import User from './src/models/User.js';

async function listarUsuarios() {
  try {
    console.log('\n👥 USUÁRIOS CADASTRADOS\n');

    // Conecta ao banco
    await sequelize.authenticate();
    await sequelize.sync();

    // Busca todos os usuários
    const users = await User.findAll({
      attributes: ['id', 'username', 'createdAt', 'updatedAt']
    });

    if (users.length === 0) {
      console.log('⚠️  Nenhum usuário cadastrado.');
      console.log('\nPara criar um usuário, execute:');
      console.log('node criar-usuario.js\n');
    } else {
      console.log(`Total: ${users.length} usuário(s)\n`);
      users.forEach((user, index) => {
        console.log(`${index + 1}. Username: ${user.username}`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Criado em: ${user.createdAt}`);
        console.log('');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    process.exit(1);
  }
}

listarUsuarios();
