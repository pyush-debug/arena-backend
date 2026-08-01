import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class LibraryService {
  constructor(private dataSource: DataSource) {}

  async getActiveIssues(branchCode: string, session: string) {
    // Mimics the PHP library_dashboard.php query
    // SELECT l.id as issue_id, l.book_id, l.student_id, l.issue_date, l.expected_return_date, l.status, 
    // s.name as student_name, s.roll_no,
    // b.book_name 
    // FROM library_issues l 
    // LEFT JOIN students s ON l.student_id = s.id 
    // LEFT JOIN books b ON l.book_id = b.id 
    // WHERE l.branch_code = '$branch_code' AND l.status IN ('Issued', 'Late')
    // ORDER BY l.expected_return_date ASC
    const sql = `
      SELECT l.id as issue_id, l.book_id, l.student_id, l.issue_date, l.expected_return_date, l.status, 
             s.name as student_name, s.roll_no,
             b.book_name 
      FROM library_issues l 
      LEFT JOIN students s ON l.student_id = s.id 
      LEFT JOIN books b ON l.book_id = b.id 
      WHERE l.branch_code = ? AND l.status IN ('Issued', 'Late')
      ORDER BY l.expected_return_date ASC
    `;
    
    const issues = await this.dataSource.query(sql, [branchCode]);
    
    // Add is_late logic just like PHP
    const today = new Date().toISOString().split('T')[0];
    
    return issues.map((issue: any) => ({
      ...issue,
      is_late: (issue.expected_return_date && issue.expected_return_date < today)
    }));
  }

  async getInventory(branchCode: string) {
    const sql = `
      SELECT * FROM books 
      WHERE branch_code = ? 
      ORDER BY id DESC
    `;
    return this.dataSource.query(sql, [branchCode]);
  }
}
