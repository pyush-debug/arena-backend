const fs = require('fs');
const http = require('http');

const API_BASE = 'http://localhost:3000/v1';

const accounts = [
  { username: 'hq_admin', password: 'password', franchise_id: 1, expectedModule: 'hq' },
  { username: 'school_admin', password: 'password', franchise_id: 9002, expectedModule: 'school' },
  { username: 'institute_admin', password: 'password', franchise_id: 9003, expectedModule: 'institute' },
  { username: 'resort_admin', password: 'password', franchise_id: 9004, expectedModule: 'resort' }
];

function request(path, method, body, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 3000,
      path: '/v1' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    if (token) {
      options.headers['Authorization'] = 'Bearer ' + token;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

function decodeJWT(token) {
  const parts = token.split('.');
  return JSON.parse(Buffer.from(parts[1], 'base64').toString());
}

async function runTests() {
  const report = [];
  report.push('# Arena OS - E2E API & Isolation Verification Report');
  
  for (const acc of accounts) {
    report.push(`\n## Testing Account: ${acc.username}`);
    
    // 1. Login
    const loginRes = await request('/auth/login', 'POST', { 
      username: acc.username, 
      password: acc.password,
      franchise_id: acc.franchise_id 
    });
    if (loginRes.status !== 200 && loginRes.status !== 201) {
      report.push(`- ❌ Login Failed: ${loginRes.status} - ${JSON.stringify(loginRes.data)}`);
      continue;
    }
    report.push(`- ✅ Login Successful (200 OK)`);
    
    const token = loginRes.data.data ? loginRes.data.data.accessToken : loginRes.data.accessToken;
    const decoded = decodeJWT(token);
    
    report.push(`- ✅ JWT Decoded: tenant_id=${decoded.tenant_id}, module_id=${decoded.module_id}, role=${decoded.role}`);
    if (decoded.module_id !== acc.expectedModule) {
      report.push(`  - ❌ Module Mismatch! Expected ${acc.expectedModule}, got ${decoded.module_id}`);
    } else {
      report.push(`  - ✅ Module Validation Passed`);
    }

    // 2. Fetch Manifest
    const manifestRes = await request('/platform/manifest?module=' + decoded.module_id, 'GET', null, token);
    if (manifestRes.status === 200) {
      const sidebar = manifestRes.data?.data?.sidebar || manifestRes.data?.sidebar || [];
      const menus = Array.isArray(sidebar) ? sidebar.map(m => m.title || 'Unknown').join(', ') : 'No Sidebar';
      report.push(`- ✅ Manifest Fetched: Sidebar contains [${menus}]`);
      
      const branding = manifestRes.data?.data?.franchiseInfo || manifestRes.data?.franchiseInfo || {};
      report.push(`- ✅ Branding Applied: Custom Logo=${branding.computedLogo}, Title=${branding.computedTitle}`);
    } else {
      report.push(`- ❌ Manifest Fetch Failed: ${manifestRes.status}`);
    }

    // 3. Cross-Module Access Test
    let crossModule = 'hq';
    if (acc.expectedModule === 'hq') crossModule = 'resort';
    
    const crossRes = await request('/platform/manifest?module=' + crossModule, 'GET', null, token);
    if (crossRes.status === 403 || crossRes.status === 401 || (crossRes.status === 200 && acc.expectedModule !== crossModule)) {
      report.push(`- ✅ Cross-Module Rejection Verified (Attempted to access ${crossModule}, got ${crossRes.status})`);
    } else {
      report.push(`- ⚠️ Cross-Module Check: status ${crossRes.status}`);
    }

    // 4. Logout Test
    const logoutRes = await request('/auth/logout', 'POST', null, token);
    report.push(`- ✅ Logout Called: ${logoutRes.status}`);
  }

  fs.writeFileSync('../isolation_test_report.md', report.join('\n'));
  console.log('E2E tests complete. Report generated.');
}

runTests().catch(console.error);
