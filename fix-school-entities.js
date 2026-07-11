const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'plugins', 'school-erp', 'src', 'entities');
const files = fs.readdirSync(dir);

for (const file of files) {
  if (file.endsWith('.ts')) {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    content = content.replace(/@Entity\('([^']+)'\)/g, (match, p1) => {
      if (!p1.startsWith('school_')) {
        return `@Entity('school_${p1}')`;
      }
      return match;
    });
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
