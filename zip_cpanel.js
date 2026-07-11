const fs = require('fs');
const path = require('path');
const { ZipArchive } = require('archiver');

const output = fs.createWriteStream(path.join(__dirname, 'cpanel_api_deployment.zip'));
const archive = new ZipArchive({ zlib: { level: 9 } });

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Add files and folders for cPanel deployment
archive.directory('dist/', 'dist');
archive.directory('node_modules/', 'node_modules');
archive.file('app.js', { name: 'app.js' });
archive.file('package.json', { name: 'package.json' });
archive.file('.env', { name: '.env' });

archive.finalize();
