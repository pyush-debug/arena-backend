import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class StudentService {
  constructor(private readonly dataSource: DataSource) {}

  async getDashboard(studentId: number, franchiseId: number) {
    try {
      // Fetch core student data ensuring franchise mix doesn't happen
      const studentQuery = `
        SELECT id, name, enrollment_no, course, profile_photo 
        FROM students 
        WHERE id = ? AND franchise_id = ?
      `;
      const students = await this.dataSource.query(studentQuery, [
        studentId,
        franchiseId,
      ]);

      if (students.length === 0) {
        throw new HttpException(
          'Student not found or branch mismatch',
          HttpStatus.NOT_FOUND,
        );
      }

      const student = students[0];

      // Fetch Attendance KPI (safe fallback to empty array if table doesn't exist)
      let total_present = 0;
      try {
        const attQuery = `SELECT COUNT(*) as total_present FROM attendance WHERE student_id = ? AND franchise_id = ? AND status = 'Present'`;
        const attRes = await this.dataSource.query(attQuery, [
          studentId,
          franchiseId,
        ]);
        total_present = attRes[0]?.total_present || 0;
      } catch (e) {}

      // Fetch Fee Due KPI
      let total_due = 0;
      try {
        const feeQuery = `SELECT IFNULL(SUM(due_amount), 0) as total_due FROM fee_payments WHERE student_id = ? AND franchise_id = ? AND payment_status != 'Paid'`;
        const feeRes = await this.dataSource.query(feeQuery, [
          studentId,
          franchiseId,
        ]);
        total_due = feeRes[0]?.total_due || 0;
      } catch (e) {}

      // Active Exams
      let activeExams = [];
      try {
        const examQuery = `SELECT id, exam_name, exam_date, duration FROM exams WHERE franchise_id = ? AND status = 'Active' ORDER BY exam_date ASC LIMIT 5`;
        activeExams = await this.dataSource.query(examQuery, [franchiseId]);
      } catch (e) {}

      // Notices
      let notices = [];
      try {
        const noticeQuery = `SELECT id, title, date, priority FROM notices WHERE franchise_id = ? AND target_audience IN ('All', 'Students') ORDER BY date DESC LIMIT 5`;
        notices = await this.dataSource.query(noticeQuery, [franchiseId]);
      } catch (e) {}

      return {
        profile: student,
        kpis: [
          { title: 'Attendance', value: total_present, icon: 'how_to_reg' },
          { title: 'Fee Dues', value: `₹${total_due}`, icon: 'payments' },
          { title: 'Active Exams', value: activeExams.length, icon: 'quiz' },
        ],
        activeExams,
        notices,
      };
    } catch (e: any) {
      throw new HttpException(e.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAttendance(studentId: number, franchiseId: number) {
    try {
      const query = `SELECT date, status, remarks FROM attendance WHERE student_id = ? AND franchise_id = ? ORDER BY date DESC LIMIT 30`;
      return await this.dataSource.query(query, [studentId, franchiseId]);
    } catch (e: any) {
      // Return empty if table doesn't exist to prevent crash
      return [];
    }
  }

  async getFees(studentId: number, franchiseId: number) {
    try {
      const query = `SELECT id, amount, due_amount, payment_date, payment_status, receipt_no FROM fee_payments WHERE student_id = ? AND franchise_id = ? ORDER BY created_at DESC`;
      return await this.dataSource.query(query, [studentId, franchiseId]);
    } catch (e: any) {
      return [];
    }
  }
}
