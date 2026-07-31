const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'sg2plzcpnl509240.prod.sin2.secureserver.net',
    user: 'admin2',
    password: '%JC9A4o3QvbgjXS%',
    database: 'ict_db'
  });
  const [rows] = await connection.execute('SHOW TABLES LIKE "%course%"');
  console.log('Tables:', rows);
  
  try {
      const [courses] = await connection.execute('SELECT * FROM courses');
      console.log('Courses count:', courses.length);
  } catch(e) {
      console.log('courses error', e.message);
  }
  
  await connection.end();
}

main().catch(console.error);
