import { Controller } from '@nestjs/common';
import { BaseController } from '../../../../../src/core/sdk/base/base.controller';
import { LibraryService } from './library.service';
import { BookEntity } from '../../entities/book.entity';

@Controller('campus/library')
export class LibraryController extends BaseController<BookEntity> {
  constructor(private readonly libraryService: LibraryService) {
    super(libraryService);
  }
}
