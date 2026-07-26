const mysql = require('mysql2/promise');

async function seed() {
  const connection = await mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: 'root',
    database: 'arena_os_v2'
  });

  console.log('Connected to DB');

  await connection.query(`
    CREATE TABLE IF NOT EXISTS system_widgets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      module_id VARCHAR(50) NOT NULL,
      title VARCHAR(100) NOT NULL,
      type VARCHAR(50) NOT NULL,
      allowed_roles VARCHAR(255) DEFAULT '*',
      api_endpoint VARCHAR(255),
      sort_order INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  
  await connection.query('TRUNCATE TABLE system_widgets');

  const widgets = [
    // School Widgets
    { module_id: 'school', title: 'Total Students', type: 'kpi_grid', api_endpoint: '/api/widgets/school/students' },
    { module_id: 'school', title: 'Active Staff', type: 'kpi_grid', api_endpoint: '/api/widgets/school/staff' },
    { module_id: 'school', title: 'Pending Inquiries', type: 'kpi_grid', api_endpoint: '/api/widgets/school/inquiries' },
    { module_id: 'school', title: 'Today Collection', type: 'kpi_grid', api_endpoint: '/api/widgets/school/collection' },
    
    // Institute Widgets
    { module_id: 'institute', title: 'Active Batches', type: 'kpi_grid', api_endpoint: '/api/widgets/institute/batches' },
    { module_id: 'institute', title: 'Enrolled Students', type: 'kpi_grid', api_endpoint: '/api/widgets/institute/students' },
    { module_id: 'institute', title: 'Course Enquiries', type: 'kpi_grid', api_endpoint: '/api/widgets/institute/enquiries' },
    { module_id: 'institute', title: 'Certificates Issued', type: 'kpi_grid', api_endpoint: '/api/widgets/institute/certificates' },

    // Resort Widgets
    { module_id: 'resort', title: 'Available Rooms', type: 'kpi_grid', api_endpoint: '/api/widgets/resort/rooms' },
    { module_id: 'resort', title: 'Current Guests', type: 'kpi_grid', api_endpoint: '/api/widgets/resort/guests' },
    { module_id: 'resort', title: 'Pending Bookings', type: 'kpi_grid', api_endpoint: '/api/widgets/resort/bookings' },
    { module_id: 'resort', title: 'Housekeeping Tasks', type: 'kpi_grid', api_endpoint: '/api/widgets/resort/housekeeping' },
  ];

  for (const [i, w] of widgets.entries()) {
    await connection.query(
      'INSERT INTO system_widgets (module_id, title, type, allowed_roles, api_endpoint, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [w.module_id, w.title, w.type, '*', w.api_endpoint, i]
    );
  }

  console.log('Seeded system_widgets');
  await connection.end();
}

seed().catch(console.error);
