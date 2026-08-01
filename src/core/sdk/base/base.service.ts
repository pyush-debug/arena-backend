import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { BaseException } from './base.response';

export interface BaseServiceHooks<T> {
  beforeCreate?(franchiseId: number, data: Partial<T>): Promise<void>;
  afterCreate?(franchiseId: number, entity: T): Promise<void>;
  beforeUpdate?(
    franchiseId: number,
    id: number,
    data: Partial<T>,
  ): Promise<void>;
  afterUpdate?(franchiseId: number, entity: T): Promise<void>;
  beforeDelete?(franchiseId: number, id: number): Promise<void>;
  afterDelete?(franchiseId: number, id: number): Promise<void>;
}

@Injectable()
export abstract class BaseService<T extends TenantBaseEntity> {
  constructor(
    protected readonly repository: Repository<T>,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly moduleName: string,
  ) {}

  getRepository(): Repository<T> {
    return this.repository;
  }

  async findAll(franchiseId: number, page: number = 1, limit: number = 10, session?: string) {
    const where: any = { franchise_id: franchiseId };
    
    if (session) {
      const metadata = this.repository.metadata;
      const hasSession = metadata.columns.some(c => c.databaseName === 'session' || c.propertyName === 'session');
      const hasSessionId = metadata.columns.some(c => c.databaseName === 'session_id' || c.propertyName === 'session_id' || c.propertyName === 'sessionId');
      const hasAcademicYear = metadata.columns.some(c => c.databaseName === 'academic_year' || c.propertyName === 'academic_year' || c.propertyName === 'academicYear');

      if (hasSession) where['session'] = session;
      else if (hasSessionId) where['sessionId'] = session;
      else if (hasAcademicYear) where['academicYear'] = session;
    }

    const [data, total] = await this.repository.findAndCount({
      where: where as import('typeorm').FindOptionsWhere<T>,
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, meta: { total, page, limit } };
  }

  async findOne(franchiseId: number, id: number): Promise<T> {
    const record = await this.repository.findOne({
      where: {
        id,
        franchise_id: franchiseId,
      } as import('typeorm').FindOptionsWhere<T>,
    });
    if (!record)
      throw new BaseException(
        `Record not found or access denied for franchise ${franchiseId}`,
        404,
      );
    return record;
  }

  async create(franchiseId: number, dto: Partial<T>): Promise<T> {
    const entity = this.repository.create(
      dto as import('typeorm').DeepPartial<T>,
    );
    entity.franchise_id = franchiseId;

    this.eventEmitter.emit(
      `${this.repository.metadata.tableName}.created`,
      entity,
    );

    return await this.repository.save(entity);
  }

  async update(franchiseId: number, id: number, dto: Partial<T>): Promise<T> {
    const entity = await this.findOne(franchiseId, id);
    const updated = this.repository.merge(
      entity,
      dto as import('typeorm').DeepPartial<T>,
    );

    if ((this as any).afterUpdate)
      await (this as any).afterUpdate(franchiseId, updated);
    this.eventEmitter.emit(`${this.moduleName.toLowerCase()}.updated`, {
      franchiseId,
      record: updated,
    });

    return await this.repository.save(updated);
  }

  async remove(franchiseId: number, id: number): Promise<void> {
    if ((this as any).beforeDelete)
      await (this as any).beforeDelete(franchiseId, id);

    await this.repository.softDelete({
      id,
      franchise_id: franchiseId,
    } as import('typeorm').FindOptionsWhere<T>);

    if ((this as any).afterDelete)
      await (this as any).afterDelete(franchiseId, id);
    this.eventEmitter.emit(`${this.moduleName.toLowerCase()}.deleted`, {
      franchiseId,
      id,
    });
  }
}
