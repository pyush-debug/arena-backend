const mysql = require('mysql2/promise');

async function test() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '', // Try empty if root fails
    database: 'arena_os_v2'
  });

  try {
    const [rows] = await connection.execute("SELECT * FROM students WHERE enrollment_no='18619278' OR roll_no='18619278' OR login_id='18619278' OR email='18619278' OR id='18619278'");
    console.log(rows);
  } catch (e) {
    console.error(e);
  }
  await connection.end();
}
test();
