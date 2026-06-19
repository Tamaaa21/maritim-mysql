require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function test() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'bmkg_maritim',
  });

  const [result] = await connection.execute(
    "INSERT INTO login_logs (id, user_id, username, ip_address, user_agent) VALUES (UUID(), ?, ?, ?, ?)",
    ['752d034d-d80a-48ea-bd78-9568b68b7f72', 'test', '127.0.0.1', 'test']
  );
  console.log('Result:', result);
  await connection.end();
}
test().catch(console.error);
