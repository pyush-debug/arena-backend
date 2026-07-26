import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../src/core/sdk/base/base.service';
import { TenantBaseRepository } from '../../../src/core/sdk/base/base.repository';

@Injectable()
export class ExampleService extends BaseService<any> {
  constructor(
    repository: TenantBaseRepository<any>,
    eventEmitter: EventEmitter2,
  ) {
    super(repository, eventEmitter, 'ExamplePlugin');
  }

  // Override Lifecycle Hooks easily
  async beforeCreate(franchiseId: number, data: any): Promise<void> {
    // Custom logic executed before the record is saved
  }
}
