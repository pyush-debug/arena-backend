const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const con = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'arena_os_v2'
  });

  const hash = await bcrypt.hash('password', 10);
  
  // 1. Create Franchises for each module
  await con.query(`
    INSERT IGNORE INTO franchises (id, branch_name, plan_type, addon_institute_erp, addon_resort_erp, status)
    VALUES 
      (9002, 'Global School', 'school_erp', 0, 0, 'active'),
      (9003, 'Tech Institute', 'institute', 1, 0, 'active'),
      (9004, 'Ocean Resort', 'resort', 0, 1, 'active')
  `);
  
  // 2. Create HQ Super Admin (in admin table)
  await con.query(`
    INSERT IGNORE INTO admin (id, username, password, role, status)
    VALUES (9001, 'hq_admin', ?, 'super_admin', 'active')
  `, [hash]);

  // 3. Create Users for School
  await con.query(`
    INSERT IGNORE INTO users (id, franchise_id, username, password, role, status)
    VALUES 
      (9010, 9002, 'school_admin', ?, 'admin', 'active'),
      (9011, 9002, 'teacher_1', ?, 'teacher', 'active'),
      (9012, 9002, 'accountant_1', ?, 'accountant', 'active'),
      (9013, 9002, 'student_1', ?, 'student', 'active')
  `, [hash, hash, hash, hash]);

  // 4. Create Users for Institute
  await con.query(`
    INSERT IGNORE INTO users (id, franchise_id, username, password, role, status)
    VALUES 
      (9020, 9003, 'institute_admin', ?, 'admin', 'active'),
      (9021, 9003, 'professor_1', ?, 'teacher', 'active'),
      (9022, 9003, 'student_2', ?, 'student', 'active')
  `, [hash, hash, hash]);

  // 5. Create Users for Resort
  await con.query(`
    INSERT IGNORE INTO users (id, franchise_id, username, password, role, status)
    VALUES 
      (9030, 9004, 'resort_admin', ?, 'admin', 'active'),
      (9031, 9004, 'receptionist_1', ?, 'receptionist', 'active')
  `, [hash, hash]);

  console.log('Seed data inserted successfully.');
  process.exit(0);
}

seed().catch(console.error);
