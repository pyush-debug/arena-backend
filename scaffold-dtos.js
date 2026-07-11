const fs = require('fs');
const path = require('path');

const entitiesDir = path.join(__dirname, 'plugins', 'school-erp', 'src', 'entities');
const modulesDir = path.join(__dirname, 'plugins', 'school-erp', 'src', 'modules');

const moduleMap = {
  'subject.entity.ts': 'academics',
  'class.entity.ts': 'academics',
  'section.entity.ts': 'academics',
  'timetable.entity.ts': 'academics',
  'homework.entity.ts': 'academics',
  
  'parent.entity.ts': 'students',
  'teacher.entity.ts': 'students',
  'attendance.entity.ts': 'students',
  'admission.entity.ts': 'students',
  
  'mark.entity.ts': 'examinations',
  'report-card.entity.ts': 'examinations',
  
  'fee-payment.entity.ts': 'finance',
  
  'visitor.entity.ts': 'campus',
  'book.entity.ts': 'campus',
  
  'notice.entity.ts': 'communication',
  'notification.entity.ts': 'communication'
};

function generateDtoContent(className, props) {
    let imports = ["import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';", "import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';"];
    
    let dtoName = `Create${className.replace('Entity', '')}Dto`;
    let body = `export class ${dtoName} {\n`;
    
    for (const p of props) {
        let isOpt = p.name.includes('?');
        let name = p.name.replace('?', '');
        let type = p.type;
        
        let tsType = 'string';
        let valDec = '@IsString()';
        
        if (type.includes('number')) { tsType = 'number'; valDec = '@IsNumber()'; }
        else if (type.includes('boolean')) { tsType = 'boolean'; valDec = '@IsBoolean()'; }
        else if (type.includes('Date')) { tsType = 'Date'; valDec = '@IsDateString()'; }
        
        let apiDec = isOpt ? `@ApiPropertyOptional()` : `@ApiProperty()`;
        let reqDec = isOpt ? `@IsOptional()` : `@IsNotEmpty()`;
        
        body += `  ${apiDec}\n  ${valDec}\n  ${reqDec}\n  ${name}${isOpt ? '?' : ''}: ${tsType};\n\n`;
    }
    
    body += `}\n`;
    return imports.join('\n') + '\n\n' + body;
}

const files = fs.readdirSync(entitiesDir);

for (const file of files) {
    if (!moduleMap[file]) continue;
    
    const mod = moduleMap[file];
    const filePath = path.join(entitiesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    const classNameMatch = content.match(/export class (\w+) extends/);
    if (!classNameMatch) continue;
    const className = classNameMatch[1];
    
    const props = [];
    const lines = content.split('\n');
    for (let i=0; i<lines.length; i++) {
        if (lines[i].includes('@Column')) {
            let nextLine = lines[i+1].trim();
            if (nextLine && !nextLine.startsWith('@')) {
                const parts = nextLine.split(':');
                if (parts.length >= 2) {
                    const isNullable = lines[i].includes('nullable: true');
                    const name = parts[0].trim().replace('?', '') + (isNullable ? '?' : '');
                    let type = parts[1].split(';')[0].trim();
                    props.push({ name, type });
                }
            }
        }
    }
    
    const dtoContent = generateDtoContent(className, props);
    const baseName = file.replace('.entity.ts', '');
    const dtoDir = path.join(modulesDir, mod, 'dto');
    if (!fs.existsSync(dtoDir)) fs.mkdirSync(dtoDir, { recursive: true });
    
    fs.writeFileSync(path.join(dtoDir, `create-${baseName}.dto.ts`), dtoContent);
    console.log(`Generated DTO for ${className} in ${mod}`);
}
