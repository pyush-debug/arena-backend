const mysql = require('mysql2/promise');

async function main() {
  const connection = await mysql.createConnection({
    host: 'sg2plzcpnl509240.prod.sin2.secureserver.net',
    user: 'admin2',
    password: '%JC9A4o3QvbgjXS%',
    database: 'ict_db'
  });
  
  try {
      const [columns] = await connection.execute('SHOW COLUMNS FROM courses');
      console.log('Columns in courses table:');
      columns.forEach(c => console.log(c.Field, c.Type));
      
      const [rows] = await connection.execute('SELECT * FROM courses LIMIT 2');
      console.log('\nSample courses:');
      console.log(rows);
  } catch(e) {
      console.log('courses error', e.message);
  }
  
  await connection.end();
}

main().catch(console.error);
