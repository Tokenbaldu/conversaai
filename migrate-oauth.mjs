import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  let connection;
  try {
    // Parse DATABASE_URL to extract connection details
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL environment variable not set');
    }

    // Parse: mysql://user:password@host:port/database?ssl=...
    const urlMatch = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
    if (!urlMatch) {
      throw new Error('Invalid DATABASE_URL format');
    }

    const [, user, password, host, port, database] = urlMatch;

    console.log(`📝 Connecting to ${host}:${port}/${database}...`);

    // Create connection with SSL
    connection = await mysql.createConnection({
      host,
      port: parseInt(port, 10),
      user,
      password,
      database,
      ssl: {},
    });

    console.log('✅ Connected to database');

    // Read SQL file
    const sqlFile = path.join(__dirname, 'drizzle', 'create_oauth_table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      console.log(`\n📝 Executing: ${statement.substring(0, 80)}...`);
      await connection.execute(statement);
      console.log('✅ Success');
    }

    console.log('\n🎉 Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
