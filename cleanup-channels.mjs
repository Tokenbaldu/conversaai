import mysql from 'mysql2/promise';

async function cleanupDuplicateChannels() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'conversaai',
  });

  try {
    // Delete all channels to start fresh
    await connection.execute('DELETE FROM channels');
    console.log('✓ Todos os canais foram removidos do banco de dados');
    
    // Verify
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM channels');
    console.log(`✓ Canais restantes no banco: ${rows[0].count}`);
  } catch (error) {
    console.error('Erro ao limpar canais:', error);
  } finally {
    await connection.end();
  }
}

cleanupDuplicateChannels();
