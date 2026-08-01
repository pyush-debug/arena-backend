import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class StaffService {
  constructor(private dataSource: DataSource) {}

  async getAllStaff(branchCode: string, session: string) {
    // Assuming franchise_id or branch_code filtering is required. Let's use franchise_id = 1 for now if not passed, or fetch dynamically based on branchCode.
    // To match PHP logic: $fid = $_SESSION['franchise_id'] ?? 1;
    // We will assume branchCode represents franchise_id in this context.
    const sql = `SELECT * FROM staff WHERE franchise_id = ? ORDER BY id DESC`;
    return this.dataSource.query(sql, [branchCode]);
  }

  async addStaff(branchCode: string, data: any, photoName: string) {
    const isTeacher = data.is_teacher ? 1 : 0;
    const sql = `
      INSERT INTO staff (
        franchise_id, emp_id, dob, name, father_name, husband_name, gender, join_date, 
        qualification, teaching_subjects, role, address, phone, secondary_mobile, email, 
        experience, salary, pan_number, pf_number, status, photo, is_teacher, 
        bank_name, bank_branch, account_number, ifsc_code, account_type, aadhar_number, last_school, comments
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      branchCode, data.emp_id, data.dob, data.name, data.father_name, data.husband_name, data.gender, data.join_date,
      data.qualification, data.teaching_subjects, data.designation, data.address, data.primary_mobile, data.secondary_mobile, data.email,
      data.experience, data.salary, data.pan_number, data.pf_number, data.status, photoName, isTeacher,
      data.bank_name, data.bank_branch, data.account_number, data.ifsc_code, data.account_type, data.aadhar_number, data.last_school, data.comments
    ];
    await this.dataSource.query(sql, params);
    return { success: true, message: 'Staff Member added successfully!' };
  }

  async updateStaff(branchCode: string, id: number, data: any) {
    const isTeacher = data.is_teacher ? 1 : 0;
    const sql = `
      UPDATE staff SET 
        emp_id=?, dob=?, name=?, father_name=?, husband_name=?, gender=?, join_date=?, 
        qualification=?, teaching_subjects=?, role=?, address=?, phone=?, secondary_mobile=?, email=?, 
        experience=?, salary=?, pan_number=?, pf_number=?, status=?, is_teacher=?, 
        bank_name=?, bank_branch=?, account_number=?, ifsc_code=?, account_type=?, aadhar_number=?, last_school=?, comments=?
      WHERE id=? AND franchise_id=?
    `;
    const params = [
      data.emp_id, data.dob, data.name, data.father_name, data.husband_name, data.gender, data.join_date,
      data.qualification, data.teaching_subjects, data.designation, data.address, data.primary_mobile, data.secondary_mobile, data.email,
      data.experience, data.salary, data.pan_number, data.pf_number, data.status, isTeacher,
      data.bank_name, data.bank_branch, data.account_number, data.ifsc_code, data.account_type, data.aadhar_number, data.last_school, data.comments,
      id, branchCode
    ];
    await this.dataSource.query(sql, params);
    return { success: true, message: 'Staff Member updated successfully!' };
  }

  async deleteStaff(branchCode: string, id: number) {
    const sql = `DELETE FROM staff WHERE id=? AND franchise_id=?`;
    await this.dataSource.query(sql, [id, branchCode]);
    return { success: true, message: 'Staff member removed successfully!' };
  }

  async generateLogin(branchCode: string, id: number) {
    const getStaffSql = `SELECT name FROM staff WHERE id=? AND franchise_id=?`;
    const staffRows = await this.dataSource.query(getStaffSql, [id, branchCode]);
    if (staffRows.length > 0) {
      const staff = staffRows[0];
      const baseName = staff.name.split(' ')[0].replace(/[^a-zA-Z]/g, '').toLowerCase();
      const newUser = baseName + id;
      const newPass = Math.floor(100000 + Math.random() * 900000).toString();
      
      const updateSql = `UPDATE staff SET username=?, password=? WHERE id=?`;
      await this.dataSource.query(updateSql, [newUser, newPass, id]);
      return { success: true, message: `Login credentials generated for ${staff.name}!`, username: newUser, password: newPass };
    }
    throw new HttpException('Staff not found', HttpStatus.NOT_FOUND);
  }

  async getAttendance(branchCode: string, date: string) {
    // This query mirrors the PHP staff_attendance logic
    const sql = `
      SELECT s.id, s.name, s.role, s.photo,
             COALESCE(sa.status, 'Present') as status,
             sa.in_time, sa.out_time, sa.remarks 
      FROM staff s
      LEFT JOIN staff_attendance sa ON s.id = sa.staff_id AND sa.attendance_date = ?
      WHERE s.franchise_id = ? AND s.status = 'Active'
      ORDER BY s.name ASC
    `;
    return this.dataSource.query(sql, [date, branchCode]);
  }

  async markAttendance(branchCode: string, date: string, attendanceData: any[]) {
    // attendanceData is an array of { staff_id, status, in_time, out_time, remarks }
    for (const record of attendanceData) {
      const checkSql = `SELECT id FROM staff_attendance WHERE staff_id=? AND attendance_date=?`;
      const exists = await this.dataSource.query(checkSql, [record.staff_id, date]);
      
      if (exists.length > 0) {
        const updateSql = `UPDATE staff_attendance SET status=?, in_time=?, out_time=?, remarks=? WHERE id=?`;
        await this.dataSource.query(updateSql, [record.status, record.in_time || null, record.out_time || null, record.remarks || '', exists[0].id]);
      } else {
        const insertSql = `INSERT INTO staff_attendance (franchise_id, staff_id, attendance_date, status, in_time, out_time, remarks) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        await this.dataSource.query(insertSql, [branchCode, record.staff_id, date, record.status, record.in_time || null, record.out_time || null, record.remarks || '']);
      }
    }
    return { success: true, message: 'Attendance marked successfully' };
  }

  async getAttendanceReport(branchCode: string, month: string, year: string) {
    // Basic implementation of staff_attendance_report logic
    const sql = `
      SELECT s.id, s.name, s.role, s.photo,
             COUNT(CASE WHEN sa.status='Present' THEN 1 END) as present_count,
             COUNT(CASE WHEN sa.status='Absent' THEN 1 END) as absent_count,
             COUNT(CASE WHEN sa.status='Half Day' THEN 1 END) as half_day_count,
             COUNT(CASE WHEN sa.status='Leave' THEN 1 END) as leave_count
      FROM staff s
      LEFT JOIN staff_attendance sa ON s.id = sa.staff_id AND MONTH(sa.attendance_date) = ? AND YEAR(sa.attendance_date) = ?
      WHERE s.franchise_id = ? AND s.status = 'Active'
      GROUP BY s.id, s.name, s.role, s.photo
      ORDER BY s.name ASC
    `;
    return this.dataSource.query(sql, [month, year, branchCode]);
  }

  async generateSalary(branchCode: string, data: any) {
    // Auto-create & Update Salary table matches PHP
    const tableSql = `
      CREATE TABLE IF NOT EXISTS staff_salary (
        id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        franchise_id int(11) NOT NULL DEFAULT 1,
        staff_id int(11) NOT NULL,
        salary_month varchar(20) NOT NULL,
        month_days int(2) DEFAULT 30,
        basic_pay decimal(10,2) DEFAULT 0.00,
        allowances decimal(10,2) DEFAULT 0.00,
        leave_days decimal(5,1) DEFAULT 0,
        half_days decimal(5,1) DEFAULT 0,
        late_days decimal(5,1) DEFAULT 0,
        leave_deduction decimal(10,2) DEFAULT 0.00,
        late_deduction decimal(10,2) DEFAULT 0.00,
        deductions decimal(10,2) DEFAULT 0.00,
        net_salary decimal(10,2) DEFAULT 0.00,
        payment_date date NOT NULL,
        payment_mode varchar(50) DEFAULT 'Bank Transfer',
        remarks text,
        created_at timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await this.dataSource.query(tableSql);

    const insertSql = `
      INSERT INTO staff_salary (
        franchise_id, staff_id, salary_month, month_days, basic_pay, allowances, 
        leave_days, half_days, late_days, leave_deduction, late_deduction, 
        deductions, net_salary, payment_date, payment_mode, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      branchCode, data.staff_id, data.salary_month, data.month_days, data.basic_pay, data.allowances,
      data.leave_days, data.half_days, data.late_days, data.leave_deduction, data.late_deduction,
      data.deductions, data.net_salary, data.payment_date, data.payment_mode, data.remarks
    ];
    await this.dataSource.query(insertSql, params);
    return { success: true, message: 'Salary Generated Successfully!' };
  }

  async getSalaryHistory(branchCode: string, staffId?: number) {
    let sql = `
      SELECT ss.*, s.name, s.emp_id, s.role 
      FROM staff_salary ss
      JOIN staff s ON ss.staff_id = s.id
      WHERE ss.franchise_id = ?
    `;
    const params: any[] = [branchCode];
    if (staffId) {
      sql += ` AND ss.staff_id = ?`;
      params.push(staffId);
    }
    sql += ` ORDER BY ss.id DESC`;
    return this.dataSource.query(sql, params);
  }
}
