import { Controller } from '@nestjs/common';
import { BaseController } from '../../../src/core/sdk/base/base.controller';
import { ExampleService } from './example.service';

@Controller()
export class ExampleController extends BaseController<any> {
  constructor(private readonly exampleService: ExampleService) {
    super(exampleService); // Automatically inherits Pagination, CRUD, Export
  }
}
