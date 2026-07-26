import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../../src/core/sdk/base/base.controller';
import { CommunicationService } from './communication.service';
import { NoticeEntity } from '../../entities/notice.entity';

@Controller('communication')
export class CommunicationController extends BaseController<NoticeEntity> {
  constructor(private readonly communicationService: CommunicationService) {
    super(communicationService);
  }
}
