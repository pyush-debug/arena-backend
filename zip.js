const fs = require('fs');
const path = require('path');
const { ZipArchive } = require('archiver');

const output = fs.createWriteStream(path.join(__dirname, 'arena_backend_magic_v6.zip'));
const archive = new ZipArchive({ zlib: { level: 9 } });

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

archive.glob('**/*', {
  cwd: __dirname,
  dot: true,
  ignore: ['node_modules/**', '.git/**', '*.zip', 'test_extract/**', 'test_extract_v5/**', 'zip.js', '.env', '.env.*']
});

archive.finalize();
