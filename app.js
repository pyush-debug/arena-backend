const fs = require('fs');
const http = require('http');

process.on('uncaughtException', (err) => {
    fs.writeFileSync('passenger_error.log', err.toString() + '\\n' + err.stack);
});

try {
    const version = process.version;
    fs.writeFileSync('passenger_debug.log', 'Node version: ' + version + '\\n');
    
    // Try to load the main app
    require('./dist/main.js');
} catch (err) {
    fs.writeFileSync('passenger_error.log', err.toString() + '\\n' + err.stack);
    
    // Fallback server so it doesn't just crash
    const server = http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('App crashed. Error: ' + err.toString() + '\\n' + err.stack);
    });
    server.listen(process.env.PORT || 3000);
}
