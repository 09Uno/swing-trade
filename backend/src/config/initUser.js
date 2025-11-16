// ========== INICIALIZAR USUÁRIO ADMINISTRADOR ==========
// Cria automaticamente o usuário admin se não existir

import User from '../models/User.js';

export async function initAdminUser() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    // Verifica se já existe
    const existingUser = await User.findOne({ where: { username: adminUsername } });
    
    if (!existingUser) {
      await User.create({
        username: adminUsername,
        password: adminPassword
      });
      console.log(`✅ Usuário administrador criado: ${adminUsername}`);
    } else {
      console.log(`✓ Usuário administrador já existe: ${adminUsername}`);
    }
  } catch (error) {
    console.error('❌ Erro ao inicializar usuário administrador:', error);
  }
}
