const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../database/migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

let schema = {};

for (const file of files) {
  const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
  const createTableRegex = /CREATE TABLE `?([a-zA-Z0-9_]+)`?\s*\(([\s\S]*?)\)(?:\s*ENGINE.*)?;/g;
  
  let match;
  while ((match = createTableRegex.exec(content)) !== null) {
    const tableName = match[1];
    const columnsStr = match[2];
    const columns = [];
    
    const lines = columnsStr.split('\n');
    for (let line of lines) {
      line = line.trim();
      if (!line || line.startsWith('--') || line.startsWith('PRIMARY KEY') || line.startsWith('FOREIGN KEY') || line.startsWith('CONSTRAINT') || line.startsWith('INDEX') || line.startsWith('UNIQUE')) {
        continue;
      }
      
      const colMatch = line.match(/^`?([a-zA-Z0-9_]+)`?\s+([a-zA-Z0-9_]+)(\([^)]+\))?/);
      if (colMatch) {
        columns.push({
          name: colMatch[1],
          type: colMatch[2].toLowerCase(),
        });
      }
    }
    schema[tableName] = columns;
  }
}

fs.writeFileSync(path.join(__dirname, 'parsed-schema.json'), JSON.stringify(schema, null, 2));
console.log('Parsed schema successfully!');
