import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../../src/core/sdk/base/base.service';
import { NoticeEntity } from '../../entities/notice.entity';

@Injectable()
export class CommunicationService extends BaseService<NoticeEntity> {
  constructor(
    @InjectRepository(NoticeEntity)
    repository: Repository<NoticeEntity>,
    eventEmitter: EventEmitter2,
  ) {
    super(repository, eventEmitter, 'SchoolERP.Communication');
  }

  // Event Hook to push to BullMQ Notification Engine
  async afterCreate(franchiseId: number, notice: NoticeEntity): Promise<void> {
    this.eventEmitter.emit('notification.dispatch', {
      franchiseId,
      payload: notice,
      channels: ['push', 'sms', 'email'],
    });
  }
}
