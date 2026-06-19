require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'pratama',
    password: process.env.MYSQL_PASSWORD || 'password123',
    database: process.env.MYSQL_DATABASE || 'bmkg_maritim',
  });

  const password = await bcrypt.hash('admin123', 12);

  await connection.execute(
    `INSERT INTO users (id, username, password, role, nama, is_active)
     VALUES (UUID(), 'admin', ?, 'super_admin', 'Administrator', true)
     ON DUPLICATE KEY UPDATE username = username`,
    [password]
  );

  console.log('✅ Admin user created: username=admin, password=admin123');
  await connection.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
