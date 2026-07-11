const http = require('http');

const testEndpoint = (path, name) => {
  return new Promise((resolve) => {
    const start = Date.now();
    http.get(`http://localhost:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          name,
          status: res.statusCode,
          time: Date.now() - start,
          data: data.substring(0, 100)
        });
      });
    }).on('error', (err) => {
      resolve({ name, status: 'ERROR', error: err.message });
    });
  });
};

async function runAll() {
  console.log('Running API Verification...');
  const results = [];
  results.push(await testEndpoint('/api-json', 'Swagger Document'));
  results.push(await testEndpoint('/health', 'Health Check'));
  results.push(await testEndpoint('/auth/login', 'Auth Test'));
  results.push(await testEndpoint('/institute/placements', 'Institute Placements Test'));
  results.push(await testEndpoint('/resort/invoices', 'Resort Invoices Test'));
  
  console.log(JSON.stringify(results, null, 2));
}

runAll();
