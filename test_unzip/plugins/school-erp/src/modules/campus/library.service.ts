import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BaseService } from '../../../../../src/core/sdk/base/base.service';
import { BookEntity } from '../../entities/book.entity';

@Injectable()
export class LibraryService extends BaseService<BookEntity> {
  constructor(
    @InjectRepository(BookEntity)
    repository: Repository<BookEntity>,
    eventEmitter: EventEmitter2,
  ) {
    super(repository, eventEmitter, 'SchoolERP.Library');
  }
}
