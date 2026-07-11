import { Repository, ObjectLiteral, FindOptionsWhere } from 'typeorm';

/**
 * Abstract Base Repository enforcing tenant isolation.
 * Every feature repository must extend this to guarantee that
 * franchise_id is automatically appended to queries.
 */
export abstract class BaseRepository<
  T extends ObjectLiteral,
> extends Repository<T> {
  /**
   * Safely finds records scoped to a specific tenant.
   */
  async findByFranchise(franchiseId: number, options?: any): Promise<T[]> {
    const where = {
      franchise_id: franchiseId,
      ...options?.where,
    } as FindOptionsWhere<T>;
    return this.find({ ...options, where });
  }

  /**
   * Safely finds a single record scoped to a specific tenant.
   */
  async findOneByFranchise(
    franchiseId: number,
    options?: any,
  ): Promise<T | null> {
    const where = {
      franchise_id: franchiseId,
      ...options?.where,
    } as FindOptionsWhere<T>;
    return this.findOne({ ...options, where });
  }

  /**
   * Soft deletes a record, respecting tenant boundaries.
   */
  async softDeleteByFranchise(franchiseId: number, id: any): Promise<void> {
    await this.update(
      { id, franchise_id: franchiseId } as any,
      { deleted_at: new Date() } as any,
    );
  }
}
