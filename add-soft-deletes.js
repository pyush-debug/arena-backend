const fs = require('fs');
const path = require('path');

const entitiesDir = path.join(__dirname, 'src', 'modules', 'iam', 'entities');

const files = fs.readdirSync(entitiesDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
    const filePath = path.join(entitiesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Skip if already has DeleteDateColumn
    if (content.includes('DeleteDateColumn')) continue;

    // Add imports
    if (content.includes('import {')) {
        let importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]typeorm['"]/);
        if (importMatch) {
            let imports = importMatch[1].split(',').map(s => s.trim());
            if (!imports.includes('CreateDateColumn')) imports.push('CreateDateColumn');
            if (!imports.includes('UpdateDateColumn')) imports.push('UpdateDateColumn');
            if (!imports.includes('DeleteDateColumn')) imports.push('DeleteDateColumn');
            
            content = content.replace(importMatch[0], `import { ${imports.join(', ')} } from 'typeorm'`);
        }
    }

    // Add columns before last }
    const columns = `
  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deleted_at: Date;
`;
    const lastBraceIndex = content.lastIndexOf('}');
    if (lastBraceIndex !== -1) {
        content = content.substring(0, lastBraceIndex) + columns + content.substring(lastBraceIndex);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
}
