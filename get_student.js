const mysql = require('mysql2/promise');
require('dotenv').config();

async function getStudent() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    const [rows] = await connection.execute("SELECT * FROM students WHERE (roll_no != '' OR login_id != '' OR enrollment_no IS NOT NULL) LIMIT 1");
    console.log(rows);
  } catch(e) {
    console.error(e);
  }
  await connection.end();
}
getStudent();
