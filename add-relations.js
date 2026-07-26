const fs = require('fs');
const path = require('path');

const entitiesDir = path.join(__dirname, 'src', 'modules', 'iam', 'entities');

function addRelation(file, relationName, targetEntity, joinColumnName) {
    const filePath = path.join(entitiesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // add imports
    if (content.includes('import {')) {
        let importMatch = content.match(/import\s+{([^}]+)}\s+from\s+['"]typeorm['"]/);
        if (importMatch) {
            let imports = importMatch[1].split(',').map(s => s.trim());
            if (!imports.includes('ManyToOne')) imports.push('ManyToOne');
            if (!imports.includes('JoinColumn')) imports.push('JoinColumn');
            
            content = content.replace(importMatch[0], `import { ${imports.join(', ')} } from 'typeorm'`);
        }
    }

    if (!content.includes(`import { ${targetEntity} }`)) {
        content = `import { ${targetEntity} } from './${targetEntity.toLowerCase()}.entity';\n` + content;
    }

    if (!content.includes(`@ManyToOne(() => ${targetEntity}`)) {
        const relation = `
  @ManyToOne(() => ${targetEntity})
  @JoinColumn({ name: '${joinColumnName}' })
  ${relationName}: ${targetEntity};
`;
        const lastBraceIndex = content.lastIndexOf('}');
        if (lastBraceIndex !== -1) {
            content = content.substring(0, lastBraceIndex) + relation + content.substring(lastBraceIndex);
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Added relation to ${file}`);
}

addRelation('user.entity.ts', 'franchise', 'Franchise', 'franchise_id');
addRelation('session.entity.ts', 'user', 'User', 'user_id');
addRelation('franchise-payment.entity.ts', 'franchise', 'Franchise', 'franchise_id');

