const mysql=require('mysql2/promise');
mysql.createConnection({host:'127.0.0.1',user:'root',password:'root',database:'arena_os_v2'})
  .then(c => c.query('SELECT username, franchise_id FROM users WHERE username="resort_admin"'))
  .then(r => { console.log(r[0]); process.exit(0); });
