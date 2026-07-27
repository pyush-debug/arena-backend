import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  HttpException,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('dynamic')
@UseGuards(JwtAuthGuard)
export class DynamicController {
  constructor(private readonly dataSource: DataSource) {}

  @Get(':table')
  async getTableData(
    @Param('table') table: string,
    @Req() req: Request,
    @Query('limit') limit: number = 50,
  ) {
    if (!/^[a-zA-Z0-9_]+$/.test(table))
      throw new HttpException('Invalid table name', HttpStatus.BAD_REQUEST);

    const user = req.user as any;
    const franchiseId = user.franchiseId;
    const role = user.role?.toLowerCase() || user.type;

    try {
      const tableCheck = await this.dataSource.query(`SHOW TABLES LIKE ?`, [
        table,
      ]);
      if (tableCheck.length === 0) return { success: true, data: [] };

      // MySQL safe identifier quoting
      const quotedTable = `\`${table}\``;
      const columns = await this.dataSource.query(
        `SHOW COLUMNS FROM ${quotedTable}`,
      );
      const hasFranchise = columns.some((c: any) => c.Field === 'franchise_id');

      let query = `SELECT * FROM ${quotedTable}`;
      const params: any[] = [];

      if (franchiseId !== 1 && hasFranchise) {
        query += ` WHERE franchise_id = ?`;
        params.push(franchiseId);
      }

      query += ` LIMIT ?`;
      params.push(Number(limit));

      const rows = await this.dataSource.query(query, params);
      return { success: true, data: rows };
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':table')
  async createRecord(
    @Param('table') table: string,
    @Req() req: Request,
    @Body() body: any,
  ) {
    if (!/^[a-zA-Z0-9_]+$/.test(table))
      throw new HttpException('Invalid table name', HttpStatus.BAD_REQUEST);

    const user = req.user as any;
    const franchiseId = user.franchiseId;
    const role = user.role?.toLowerCase() || user.type;

    try {
      const tableCheck = await this.dataSource.query(`SHOW TABLES LIKE ?`, [
        table,
      ]);
      if (tableCheck.length === 0)
        throw new HttpException('Table does not exist', HttpStatus.BAD_REQUEST);

      const quotedTable = `\`${table}\``;
      const columns = await this.dataSource.query(
        `SHOW COLUMNS FROM ${quotedTable}`,
      );
      const hasFranchise = columns.some((c: any) => c.Field === 'franchise_id');

      const insertData = { ...body };

      // Auto-inject franchise_id if it exists and user is not super admin providing it explicitly
      if (hasFranchise && franchiseId !== 1) {
        insertData.franchise_id = franchiseId;
      } else if (
        hasFranchise &&
        franchiseId === 1 &&
        !insertData.franchise_id
      ) {
        insertData.franchise_id = franchiseId; // Fallback to their session franchise
      }

      // Filter out invalid columns
      const validColumns = columns.map((c: any) => c.Field);
      const finalData: Record<string, any> = {};
      for (const [key, value] of Object.entries(insertData)) {
        if (validColumns.includes(key)) {
          finalData[key] = value;
        }
      }

      if (Object.keys(finalData).length === 0) {
        throw new HttpException(
          'No valid data provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      const keys = Object.keys(finalData)
        .map((k) => `\`${k}\``)
        .join(', ');
      const placeholders = Object.keys(finalData)
        .map(() => '?')
        .join(', ');
      const values = Object.values(finalData);

      const query = `INSERT INTO ${quotedTable} (${keys}) VALUES (${placeholders})`;
      const result = await this.dataSource.query(query, values);

      return {
        success: true,
        message: 'Record created successfully',
        insertId: result.insertId,
      };
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
