import mysql from 'mysql2/promise';

const sql = `
CREATE TABLE IF NOT EXISTS whatsapp_integrations (
  id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  userId int NOT NULL,
  phoneNumber varchar(20) NOT NULL,
  waId varchar(64) NOT NULL UNIQUE,
  accessToken text NOT NULL,
  refreshToken text,
  businessAccountId varchar(64),
  status enum('pending', 'active', 'disconnected') NOT NULL DEFAULT 'pending',
  qrCode text,
  sessionId varchar(64) UNIQUE,
  expiresAt timestamp,
  createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

async function migrate() {
  try {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    console.log('Connected to database');
    
    const result = await connection.execute(sql);
    console.log('Migration executed successfully');
    
    // Verify table exists
    const [tables] = await connection.execute('SHOW TABLES LIKE "whatsapp_integrations"');
    console.log('Table exists:', tables.length > 0);
    
    await connection.end();
  } catch (error) {
    console.error('Migration error:', error.message);
    process.exit(1);
  }
}

migrate();
