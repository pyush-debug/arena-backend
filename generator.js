const fs = require('fs');
const path = require('path');

const schema = {
  Institute: {
    module: "plugins/institute-erp/src/institute-erp.module.ts",
    basePath: "plugins/institute-erp/src",
    tenantBasePrefix: "../../../../src/core/sdk/base",
    entities: [
      { name: "InstituteFee", table: "institute_fees", cols: ["semesterId:number", "batchId:number", "amount:number", "description:string"] },
      { name: "InstitutePayment", table: "institute_payments", cols: ["studentId:number", "feeId:number", "amountPaid:number", "status:string"] },
      { name: "InstituteCompany", table: "institute_companies", cols: ["name:string", "hrContact:string", "email:string", "industry:string"] },
      { name: "InstituteDrive", table: "institute_placement_drives", cols: ["companyId:number", "title:string", "driveDate:Date", "minCgpa:number", "maxBacklogs:number", "status:string"] },
      { name: "InstituteSkill", table: "institute_skills", cols: ["studentId:number", "skillName:string", "proficiency:string"] },
      { name: "InstituteDonation", table: "institute_donations", cols: ["alumniId:number", "amount:number", "purpose:string"] },
    ]
  },
  Resort: {
    module: "plugins/resort-erp/src/resort-erp.module.ts",
    basePath: "plugins/resort-erp/src",
    tenantBasePrefix: "../../../../src/core/sdk/base",
    entities: [
      { name: "ResortOtaChannel", table: "resort_ota_channels", cols: ["channelName:string", "apiKey:string", "status:string"] },
      { name: "ResortOtaRoomMapping", table: "resort_ota_room_mappings", cols: ["channelId:number", "internalRoomTypeId:number", "otaRoomCode:string"] },
      { name: "ResortRoomStatusLog", table: "resort_room_status_logs", cols: ["roomId:number", "status:string", "updatedBy:number"] },
      { name: "ResortInvoice", table: "resort_invoices", cols: ["bookingId:number", "guestId:number", "totalAmount:number", "taxAmount:number", "netAmount:number", "status:string"] },
      { name: "ResortInvoiceItem", table: "resort_invoice_items", cols: ["invoiceId:number", "chargeType:string", "amount:number", "taxRate:number", "description:string"] },
      { name: "ResortPayment", table: "resort_payments", cols: ["invoiceId:number", "paymentMethod:string", "amount:number", "transactionId:string", "status:string"] },
      { name: "ResortPricingRule", table: "resort_pricing_rules", cols: ["roomTypeId:number", "ruleType:string", "multiplier:number", "startDate:Date", "endDate:Date", "minOccupancy:number", "isActive:boolean"] },
      { name: "ResortGuestProfileExt", table: "resort_guest_profiles_ext", cols: ["guestId:number", "loyaltyTier:string", "loyaltyPoints:number", "isVip:boolean", "isBlacklisted:boolean", "corporateCompany:string", "preferences:string"] }
    ]
  },
  Hq: {
    module: "src/modules/hq/hq.module.ts",
    basePath: "src/modules/hq",
    tenantBasePrefix: "../../../core/sdk/base",
    entities: [
      { name: "HqTimeline", table: "hq_timeline", isTenant: true, cols: ["eventType:string", "description:string", "franchiseId:number", "pluginId:string", "adminId:number", "metadata:string"] },
      { name: "HqIncident", table: "hq_incidents", isTenant: true, cols: ["title:string", "description:string", "severity:string", "status:string", "rootCause:string", "assignedEngineerId:number", "resolutionTime:Date"] }
    ]
  }
};

const toKebab = (str) => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

for (const [moduleName, config] of Object.entries(schema)) {
  const { basePath, entities, module, tenantBasePrefix } = config;
  
  const entitiesDir = path.join(__dirname, basePath, 'entities');
  const servicesDir = path.join(__dirname, basePath, 'services');
  const controllersDir = path.join(__dirname, basePath, 'controllers');

  fs.mkdirSync(entitiesDir, { recursive: true });
  fs.mkdirSync(servicesDir, { recursive: true });
  fs.mkdirSync(controllersDir, { recursive: true });

  const addedEntities = [];
  const addedControllers = [];
  const addedServices = [];

  for (const ent of entities) {
    const filename = toKebab(ent.name);
    
    // Create Entity
    const entityFile = path.join(entitiesDir, `${filename}.entity.ts`);
    let entityContent = `import { Entity, Column } from 'typeorm';\n`;
    if (ent.isTenant === false) {
      entityContent += `import { BaseEntity } from 'typeorm';\n\n@Entity('${ent.table}')\nexport class ${ent.name}Entity extends BaseEntity {\n  @Column({ primary: true, generated: true }) id: number;\n`;
    } else {
      entityContent += `import { TenantBaseEntity } from '${tenantBasePrefix}/base.entity';\n\n@Entity('${ent.table}')\nexport class ${ent.name}Entity extends TenantBaseEntity {\n`;
    }

    for (const col of ent.cols) {
      const [colName, colType] = col.split(':');
      let typeormType = 'varchar';
      if (colType === 'number') typeormType = 'int';
      if (colType === 'boolean') typeormType = 'boolean';
      if (colType === 'Date') typeormType = 'timestamp';
      
      const dbColName = colName.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      entityContent += `  @Column({ name: '${dbColName}', type: '${typeormType}', nullable: true })\n  ${colName}: ${colType};\n\n`;
    }
    entityContent += `}\n`;
    fs.writeFileSync(entityFile, entityContent);

    // Create Service
    const serviceFile = path.join(servicesDir, `${filename}.service.ts`);
    const serviceContent = `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '${tenantBasePrefix}/base.service';
import { ${ent.name}Entity } from '../entities/${filename}.entity';

@Injectable()
export class ${ent.name}Service extends BaseService<${ent.name}Entity> {
  constructor(
    @InjectRepository(${ent.name}Entity) repository: Repository<${ent.name}Entity>,
    eventEmitter: EventEmitter2
  ) {
    super(repository, eventEmitter, '${moduleName}.${ent.name}');
  }
}
`;
    fs.writeFileSync(serviceFile, serviceContent);

    // Create Controller
    const controllerFile = path.join(controllersDir, `${filename}.controller.ts`);
    const apiRoute = `${moduleName.toLowerCase()}/${filename}s`;
    const controllerContent = `import { Controller } from '@nestjs/common';
import { BaseController } from '${tenantBasePrefix}/base.controller';
import { ${ent.name}Service } from '../services/${filename}.service';
import { ${ent.name}Entity } from '../entities/${filename}.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('${moduleName}')
@Controller('${apiRoute}')
export class ${ent.name}Controller extends BaseController<${ent.name}Entity> {
  constructor(private readonly service: ${ent.name}Service) {
    super(service);
  }
}
`;
    fs.writeFileSync(controllerFile, controllerContent);

    addedEntities.push({ name: `${ent.name}Entity`, path: `./entities/${filename}.entity` });
    addedServices.push({ name: `${ent.name}Service`, path: `./services/${filename}.service` });
    addedControllers.push({ name: `${ent.name}Controller`, path: `./controllers/${filename}.controller` });
  }
  
  // Modify module file
  const moduleFile = path.join(__dirname, module);
  if (fs.existsSync(moduleFile)) {
    let modContent = fs.readFileSync(moduleFile, 'utf8');
    
    const importRegex = /TypeOrmModule\.forFeature\(\[\s*([^\]]*)\s*\]\)/;
    const match = modContent.match(importRegex);
    if (match) {
        let existingEntities = match[1].split(',').map(s => s.trim()).filter(s => s);
        for(let a of addedEntities) {
            if(!existingEntities.includes(a.name)) {
                existingEntities.push(a.name);
                modContent = `import { ${a.name} } from '${a.path}';\n` + modContent;
            }
        }
        modContent = modContent.replace(importRegex, `TypeOrmModule.forFeature([\n      ${existingEntities.join(',\n      ')}\n    ])`);
    }

    const ctlRegex = /controllers:\s*\[([^\]]*)\]/;
    const matchCtl = modContent.match(ctlRegex);
    if (matchCtl) {
        let existing = matchCtl[1].split(',').map(s => s.trim()).filter(s => s);
        for(let a of addedControllers) {
            if(!existing.includes(a.name)) {
                existing.push(a.name);
                modContent = `import { ${a.name} } from '${a.path}';\n` + modContent;
            }
        }
        modContent = modContent.replace(ctlRegex, `controllers: [\n    ${existing.join(',\n    ')}\n  ]`);
    }

    const prvRegex = /providers:\s*\[([^\]]*)\]/;
    const matchPrv = modContent.match(prvRegex);
    if (matchPrv) {
        let existing = matchPrv[1].split(',').map(s => s.trim()).filter(s => s);
        for(let a of addedServices) {
            if(!existing.includes(a.name)) {
                existing.push(a.name);
                modContent = `import { ${a.name} } from '${a.path}';\n` + modContent;
            }
        }
        modContent = modContent.replace(prvRegex, `providers: [\n    ${existing.join(',\n    ')}\n  ]`);
    }

    // Clean up duplicate imports
    const lines = modContent.split('\n');
    const seen = new Set();
    const finalLines = [];
    for(const line of lines) {
      if(line.startsWith('import {')) {
        if(seen.has(line)) continue;
        seen.add(line);
      }
      finalLines.push(line);
    }

    fs.writeFileSync(moduleFile, finalLines.join('\n'));
  }
}

console.log("Phases generated!");
