import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../../../../src/core/sdk/base/base.entity';

@Entity('books')
export class BookEntity extends TenantBaseEntity {
  @Column({ name: 'branch_code', type: 'varchar', length: 50 })
  legacyBranchCode: string; // Kept for strict backward compatibility

  @Column({ name: 'book_name', type: 'varchar', length: 255 })
  title: string;

  @Column({ name: 'author', type: 'varchar', length: 255, nullable: true })
  author: string;

  @Column({ name: 'category', type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ name: 'available_qty', type: 'int', default: 0 })
  availableQty: number;
}
