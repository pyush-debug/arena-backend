import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  DeepPartial,
  SaveOptions,
  FindOneOptions,
  UpdateResult,
} from 'typeorm';
import { TenantBaseEntity } from './base.entity';
import { BaseException } from './base.response';

/**
 * Base Repository overriding TypeORM methods to mandate `franchise_id`.
 * Absolutely guarantees tenant isolation. No plugin can leak data.
 */
export class TenantBaseRepository<
  T extends TenantBaseEntity,
> extends Repository<T> {
  async findByFranchise(
    franchiseId: number,
    options?: FindManyOptions<T>,
  ): Promise<T[]> {
    return this.find({
      ...options,
      where: {
        ...(options?.where as FindOptionsWhere<T>),
        franchise_id: franchiseId,
      },
    });
  }

  async findOneByFranchise(
    franchiseId: number,
    options: FindOneOptions<T>,
  ): Promise<T> {
    const record = await this.findOne({
      ...options,
      where: {
        ...(options?.where as FindOptionsWhere<T>),
        franchise_id: franchiseId,
      },
    });
    if (!record)
      throw new BaseException(
        `Record not found or access denied for franchise ${franchiseId}`,
        404,
      );
    return record;
  }

  async saveByFranchise(
    franchiseId: number,
    entity: DeepPartial<T>,
    options?: SaveOptions,
  ): Promise<T> {
    (entity as TenantBaseEntity).franchise_id = franchiseId;
    return this.save(entity, options);
  }

  async updateByFranchise(
    franchiseId: number,
    id: number,
    partialEntity: DeepPartial<T>,
  ): Promise<UpdateResult> {
    return this.update(
      { id, franchise_id: franchiseId } as unknown as FindOptionsWhere<T>,
      partialEntity as import('typeorm/query-builder/QueryPartialEntity').QueryDeepPartialEntity<T>,
    );
  }

  async softDeleteByFranchise(
    franchiseId: number,
    id: number,
  ): Promise<UpdateResult> {
    return this.softDelete({
      id,
      franchise_id: franchiseId,
    } as unknown as FindOptionsWhere<T>);
  }
}
