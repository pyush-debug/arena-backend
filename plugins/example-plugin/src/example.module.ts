import { Module } from '@nestjs/common';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';
// Example Plugin Module. This will be dynamically mounted by PluginLoader.
@Module({
  controllers: [ExampleController],
  providers: [ExampleService],
})
export class ExampleModule {}
