import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class StudentService {
  constructor(private dataSource: DataSource) {}

  // Creates missing columns like in view_students.php
  async autoCreateMissingColumns() {
    try {
      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS branch_dropdowns (
          id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
          franchise_id int(11) NOT NULL DEFAULT '1',
          dropdown_type varchar(50) NOT NULL,
          dropdown_value varchar(150) NOT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      const checkCols = ['sr_no', 'pen_no', 'unique_id', 'enrollment_type', 'student_role', 'aadhar_number', 'house', 'stream', 'fee_category', 'mother_name', 'email', 'student_email', 'status', 'student_type', 'height', 'weight', 'family_id', 'sssm_id', 'apaar_id', 'student_phone', 'address', 'state', 'district', 'pin_code', 'nationality', 'residence_period', 'father_name', 'local_guardian', 'guardian_address', 'phone', 'guardian_relation', 'father_occupation', 'religion', 'caste_name', 'withdrawal_file_no', 'scholar_reg_no', 'last_school', 'bank_acc_holder', 'bank_name', 'bank_acc_no', 'bank_ifsc', 'security_amount', 'transport_route', 'last_due_amount', 'other_info'];
      
      for (const col of checkCols) {
        try {
          await this.dataSource.query(`ALTER TABLE students ADD COLUMN \`${col}\` VARCHAR(255) DEFAULT NULL`);
        } catch (e) {
          // Column probably exists, ignore
        }
      }
    } catch (e) {
      console.log('Error auto-creating columns for students:', e);
    }
  }

  async getAllStudents(branchCode: string, search: string = '', session: string = '') {
    await this.autoCreateMissingColumns();
    // Assuming branchCode matches franchise_id (or similar logic mapping)
    // Here we just fetch students mapping the original PHP query
    let sql = `
      SELECT s.*, c.course_name, f.branch_name 
      FROM students s 
      LEFT JOIN courses c ON s.course_id = c.id 
      LEFT JOIN franchises f ON s.franchise_id = f.id 
      WHERE s.franchise_id = ?
    `;
    const params: any[] = [branchCode];

    if (session) {
      sql += ` AND s.session = ?`;
      params.push(session);
    }

    if (search) {
      sql += ` AND (s.name LIKE ? OR s.enrollment_no LIKE ? OR s.student_phone LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ` ORDER BY s.id DESC`;

    return this.dataSource.query(sql, params);
  }

  async addStudent(branchCode: string, studentData: any) {
    await this.autoCreateMissingColumns();
    // Extracting fields from studentData
    const fields = Object.keys(studentData);
    const values = Object.values(studentData);
    
    // Add franchise_id
    fields.push('franchise_id');
    values.push(branchCode);

    const placeholders = values.map(() => '?').join(', ');
    const sql = `INSERT INTO students (${fields.join(', ')}) VALUES (${placeholders})`;

    return this.dataSource.query(sql, values);
  }

  async deleteStudent(branchCode: string, studentId: number) {
    return this.dataSource.query(
      `DELETE FROM students WHERE id = ? AND franchise_id = ?`,
      [studentId, branchCode]
    );
  }

  async manageDropdowns(branchCode: string, type: string, value: string, action: 'add' | 'delete') {
    if (action === 'add') {
      const existing = await this.dataSource.query(
        `SELECT id FROM branch_dropdowns WHERE franchise_id=? AND dropdown_type=? AND dropdown_value=?`,
        [branchCode, type, value]
      );
      if (existing.length === 0) {
        await this.dataSource.query(
          `INSERT INTO branch_dropdowns (franchise_id, dropdown_type, dropdown_value) VALUES (?, ?, ?)`,
          [branchCode, type, value]
        );
      }
    } else {
      await this.dataSource.query(
        `DELETE FROM branch_dropdowns WHERE franchise_id=? AND dropdown_type=? AND dropdown_value=?`,
        [branchCode, type, value]
      );
    }
    return { success: true };
  }

  async getDropdowns(branchCode: string, type: string) {
    return this.dataSource.query(
      `SELECT dropdown_value FROM branch_dropdowns WHERE franchise_id=? AND dropdown_type=?`,
      [branchCode, type]
    );
  }
}
