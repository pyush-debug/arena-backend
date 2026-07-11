import { Controller, Get, Param, Req, UseGuards, HttpException, HttpStatus, Query } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('v1/dynamic')
@UseGuards(JwtAuthGuard)
export class DynamicController {
  constructor(private readonly dataSource: DataSource) {}

  @Get(':table')
  async getTableData(
    @Param('table') table: string,
    @Req() req: Request,
    @Query('limit') limit: number = 50
  ) {
    // Validate table name to prevent SQL injection
    if (!/^[a-zA-Z0-9_]+$/.test(table)) {
      throw new HttpException('Invalid table name', HttpStatus.BAD_REQUEST);
    }

    const user = req.user as any;
    const franchiseId = user.franchise_id;
    const role = user.type; // 'admin' or 'user'

    try {
      // Check if table exists
      const tableCheck = await this.dataSource.query(`SHOW TABLES LIKE ?`, [table]);
      if (tableCheck.length === 0) {
        return { success: true, data: [] }; // Return empty if table doesn't exist yet
      }

      // Check if table has franchise_id column
      const columns = await this.dataSource.query(`SHOW COLUMNS FROM ??`, [table]);
      const hasFranchise = columns.some((c: any) => c.Field === 'franchise_id');

      let query = `SELECT * FROM ??`;
      const params: any[] = [table];

      // If user is not super admin and table supports franchise filtering, apply filter
      if (role !== 'admin' && hasFranchise) {
        query += ` WHERE franchise_id = ?`;
        params.push(franchiseId);
      } else if (role !== 'admin' && !hasFranchise) {
        // If table doesn't have franchise_id, it might be a global table. 
        // For safety, limit global table access if needed, but for now we'll allow it.
      }

      query += ` LIMIT ?`;
      params.push(Number(limit));

      const rows = await this.dataSource.query(query, params);
      return { success: true, data: rows };
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
