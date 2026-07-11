const fs = require('fs');
const path = require('path');

const controllers = [
  {
    file: 'plugins/school-erp/src/modules/examinations/marks.controller.ts',
    service: 'MarksService',
    entity: 'MarkEntity',
    dto: 'CreateMarkDto',
    dtoFile: 'create-mark.dto',
    className: 'MarksController',
    tags: 'School Examinations'
  },
  {
    file: 'plugins/school-erp/src/modules/finance/finance.controller.ts',
    service: 'FinanceService',
    entity: 'FeePaymentEntity',
    dto: 'CreateFeePaymentDto',
    dtoFile: 'create-fee-payment.dto',
    className: 'FinanceController',
    tags: 'School Finance'
  },
  {
    file: 'plugins/school-erp/src/modules/campus/library.controller.ts',
    service: 'LibraryService',
    entity: 'BookEntity',
    dto: 'CreateBookDto',
    dtoFile: 'create-book.dto',
    className: 'LibraryController',
    tags: 'School Campus'
  },
  {
    file: 'plugins/school-erp/src/modules/communication/communication.controller.ts',
    service: 'CommunicationService',
    entity: 'NoticeEntity',
    dto: 'CreateNoticeDto',
    dtoFile: 'create-notice.dto',
    className: 'CommunicationController',
    tags: 'School Communication'
  }
];

for (const ctrl of controllers) {
  const filePath = path.join(__dirname, ctrl.file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace imports
  content = content.replace("import { Controller } from '@nestjs/common';", `import { Controller, UseGuards, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../../src/modules/iam/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../../../src/common/guards/roles.guard';
import { Roles } from '../../../../../src/common/decorators/roles.decorator';
import { CurrentTenant } from '../../../../../src/modules/saas/tenant/tenant.context';
import type { TenantData } from '../../../../../src/modules/saas/tenant/tenant.context';
import { ${ctrl.dto} } from './dto/${ctrl.dtoFile}';`);

  // Replace class decorator
  content = content.replace(/@Controller\((.*?)\)/, `@ApiTags('${ctrl.tags}')\n@ApiBearerAuth()\n@Controller($1)\n@UseGuards(JwtAuthGuard, RolesGuard)\n@Roles('Super Admin', 'School Admin')`);
  
  // Replace class body to add create and update
  content = content.replace(/}\s*$/, `
  @ApiOperation({ summary: 'Create ${ctrl.entity.replace('Entity', '')}' })
  @Post()
  async create(@CurrentTenant() tenant: TenantData, @Body() dto: ${ctrl.dto}) {
    return super.create(tenant, dto);
  }

  @ApiOperation({ summary: 'Update ${ctrl.entity.replace('Entity', '')}' })
  @Put(':id')
  async update(@CurrentTenant() tenant: TenantData, @Param('id') id: number, @Body() dto: ${ctrl.dto}) {
    return super.update(tenant, id, dto);
  }
}
`);
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${ctrl.file}`);
}
