import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getAnalyticsData(franchiseId: number, isSuperAdmin: boolean, session?: string) {
    const fClause = isSuperAdmin ? '1=1' : `franchise_id='${franchiseId}'`;
    const fClauseAlias = isSuperAdmin ? '1=1' : `s.franchise_id='${franchiseId}'`;
    
    // Session Filtering Logic
    let sessionClause = '';
    let dateClause = '';
    if (session) {
      sessionClause =  ` AND session='${session}'`;
      const parts = session.split('-');
      if (parts.length === 2) {
        const startYear = parts[0];
        const endYear = parts[1].length === 2 ? '20' + parts[1] : parts[1];
        dateClause = ` AND payment_date >= '${startYear}-04-01' AND payment_date <= '${endYear}-03-31'`;
      }
    }
    
    // Total Active Students
    const stdRes = await this.dataSource.query(`SELECT COUNT(id) as total FROM students WHERE status='Active' AND ${fClause}`);
    const totalStudents = stdRes[0]?.total || 0;

    // Monthly Revenue
    const currMonth = new Date().getMonth() + 1;
    const currYear = new Date().getFullYear();
    const revRes = await this.dataSource.query(`SELECT SUM(amount) as total FROM fee_payments WHERE MONTH(payment_date)='${currMonth}' AND YEAR(payment_date)='${currYear}' AND ${fClause}`);
    const monthlyRevenue = revRes[0]?.total || 0;

    // Total Discounts
    let totalDiscount = 0;
    try {
      const discRes = await this.dataSource.query(`SELECT SUM(discount_amount) as total FROM student_rewards WHERE status='Used' AND ${fClause}`);
      totalDiscount = discRes[0]?.total || 0;
    } catch(e) {}

    // Revenue Chart (Last 6 Months)
    const revLabels: string[] = [];
    const revData: number[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        const monthName = d.toLocaleString('default', { month: 'short' }) + ' ' + y;
        revLabels.push(monthName);
        
        const qChart = await this.dataSource.query(`SELECT SUM(amount) as total FROM fee_payments WHERE MONTH(payment_date)='${m}' AND YEAR(payment_date)='${y}' AND ${fClause}`);
        revData.push(Number(qChart[0]?.total || 0));
    }

    // Attendance Chart (Last 7 Days)
    const attLabels: string[] = [];
    const attData: number[] = [];
    for(let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        const dayName = d.toLocaleString('default', { weekday: 'short' });
        attLabels.push(dayName);

        try {
          const qChart = await this.dataSource.query(`SELECT COUNT(a.id) as total FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.attendance_date='${dayStr}' AND a.status='Present' AND ${fClauseAlias}`);
          attData.push(Number(qChart[0]?.total || 0));
        } catch(e) { attData.push(0); }
    }

    return {
      totalStudents,
      monthlyRevenue,
      totalDiscount,
      revenueChart: { labels: revLabels, data: revData },
      attendanceChart: { labels: attLabels, data: attData }
    };
  }

  async getOverviewData(franchiseId: number, isSuperAdmin: boolean, session?: string) {
    const fClause = isSuperAdmin ? '1=1' : `franchise_id='${franchiseId}'`;
    const fClauseAlias = isSuperAdmin ? '1=1' : `s.franchise_id='${franchiseId}'`;
    const today = new Date().toISOString().split('T')[0];

    // Session Filtering Logic
    let sessionClause = '';
    let dateClause = '';
    if (session) {
      sessionClause = ` AND session='${session}'`;
      const parts = session.split('-');
      if (parts.length === 2) {
        const startYear = parts[0];
        const endYear = parts[1].length === 2 ? '20' + parts[1] : parts[1];
        dateClause = ` AND payment_date >= '${startYear}-04-01' AND payment_date <= '${endYear}-03-31'`;
      }
    }
    
    // Total Students
    const stdRes = await this.dataSource.query(`SELECT COUNT(*) as total FROM students WHERE status='Active' AND ${fClause}${sessionClause}`);
    const totalStudents = stdRes[0]?.total || 0;

    // Total Staff
    const staffRes = await this.dataSource.query(`SELECT COUNT(*) as total FROM staff WHERE ${fClause}`);
    const totalStaff = staffRes[0]?.total || 0;

    // Present Today
    const attRes = await this.dataSource.query(`SELECT COUNT(a.id) as total FROM attendance a JOIN students s ON a.student_id = s.id WHERE a.attendance_date='${today}' AND a.status='Present' AND ${fClauseAlias}${sessionClause}`);
    const presentToday = attRes[0]?.total || 0;

    // Active Courses
    const courseCountRes = await this.dataSource.query(`SELECT COUNT(*) as total FROM courses`);
    const totalCourses = courseCountRes[0]?.total || 0;

    // Total Notices
    const noticesCountRes = await this.dataSource.query(`SELECT COUNT(*) as total FROM notices`);
    const totalNotices = noticesCountRes[0]?.total || 0;

    // Revenue
    const feeRes = await this.dataSource.query(`SELECT SUM(amount) as total FROM fee_payments WHERE ${fClause}${dateClause}`);
    const totalRevenue = feeRes[0]?.total || 0;

    // Expenses
    let totalExpenses = 0;
    try {
      const expRes = await this.dataSource.query(`SELECT SUM(amount) as total FROM expenses WHERE ${fClause}${dateClause.replace(/payment_date/g, 'expense_date')}`);
      totalExpenses = expRes[0]?.total || 0;
    } catch(e) {} // table might not exist in some setups

    // Today Fees
    const todayFeeRes = await this.dataSource.query(`SELECT SUM(amount) as total FROM fee_payments WHERE payment_date='${today}' AND ${fClause}${dateClause}`);
    const todayFees = todayFeeRes[0]?.total || 0;

    // Revenue Chart (Monthly)
    const revData = Array(12).fill(0);
    const revQ = await this.dataSource.query(`SELECT MONTH(payment_date) as m, SUM(amount) as total FROM fee_payments WHERE ${fClause}${dateClause} GROUP BY MONTH(payment_date)`);
    revQ.forEach(r => { if(r.m >= 1 && r.m <= 12) revData[r.m - 1] = Number(r.total); });

    // Course Distribution Chart
    const courseLabels: string[] = [];
    const courseData: number[] = [];
    const crsQ = await this.dataSource.query(`SELECT c.course_name, COUNT(s.id) as total FROM courses c LEFT JOIN students s ON c.id = s.course_id WHERE s.status='Active' AND ${fClauseAlias}${sessionClause} GROUP BY c.id`);
    crsQ.forEach((r: any) => {
      courseLabels.push(r.course_name);
      courseData.push(Number(r.total));
    });

    // Notices (News)
    let news: any[] = [];
    try {
      news = await this.dataSource.query(`SELECT * FROM notices WHERE ${isSuperAdmin ? '1=1' : `(${fClause} OR (franchise_id=1 AND is_global=1))`} ORDER BY notice_date DESC, id DESC LIMIT 10`);
    } catch(e) {}

    // Notifications logic
    let notifCount = 0;
    
    let pendingAdmCount = 0;
    try {
      const admQ = await this.dataSource.query(`SELECT COUNT(id) as c FROM students WHERE status='Pending' AND ${fClause}`);
      pendingAdmCount = Number(admQ[0]?.c || 0);
      notifCount += pendingAdmCount;
    } catch(e){}

    let pendingEnqCount = 0;
    try {
      const enqQ = await this.dataSource.query(`SELECT COUNT(id) as c FROM enquiries WHERE status='Pending' AND ${fClause}`);
      pendingEnqCount = Number(enqQ[0]?.c || 0);
      notifCount += pendingEnqCount;
    } catch(e){}
    
    let pendingQueriesCount = 0;
    try {
      const queryQ = await this.dataSource.query(`SELECT COUNT(id) as c FROM student_queries WHERE status='Pending' AND ${fClause}`);
      pendingQueriesCount = Number(queryQ[0]?.c || 0);
      notifCount += pendingQueriesCount;
    } catch(e){}

    let pendingFeesCount = 0;
    try {
      const feeQ = await this.dataSource.query(`SELECT COUNT(id) as c FROM fee_requests WHERE status='Pending' AND ${fClause}`);
      pendingFeesCount = Number(feeQ[0]?.c || 0);
      notifCount += pendingFeesCount;
    } catch(e){}

    let pendingSubCount = 0;
    let pendingWaCount = 0;
    let pendingDemoCount = 0;
    if(isSuperAdmin) {
      try {
        const subQ = await this.dataSource.query(`SELECT COUNT(id) as c FROM franchise_payments WHERE status='Pending'`);
        pendingSubCount = Number(subQ[0]?.c || 0);
        notifCount += pendingSubCount;
      } catch(e){}
      try {
        const waQ = await this.dataSource.query(`SELECT COUNT(id) as c FROM wa_recharge_requests WHERE status='Pending'`);
        pendingWaCount = Number(waQ[0]?.c || 0);
        notifCount += pendingWaCount;
      } catch(e){}
      try {
        const demoQ = await this.dataSource.query(`SELECT COUNT(id) as c FROM erp_demo_requests WHERE status='Pending'`);
        const franEnq = await this.dataSource.query(`SELECT COUNT(id) as c FROM franchise_enquiries WHERE status='Pending'`);
        pendingDemoCount = Number(demoQ[0]?.c || 0) + Number(franEnq[0]?.c || 0);
        notifCount += pendingDemoCount;
      } catch(e){}
    }

    // Recent Onboardings
    let onboardings: any[] = [];
    try {
      onboardings = await this.dataSource.query(`SELECT s.name, c.course_name FROM students s LEFT JOIN courses c ON s.course_id = c.id WHERE ${fClauseAlias} ORDER BY s.id DESC LIMIT 5`);
    } catch(e) {}

    // Latest Transactions
    let transactions: any[] = [];
    try {
      transactions = await this.dataSource.query(`SELECT f.amount, s.name, f.payment_date as fee_date FROM fee_payments f JOIN students s ON f.student_id = s.id WHERE ${fClauseAlias} ORDER BY f.id DESC LIMIT 5`);
    } catch(e) {}

    // AI Risk Engine (Basic implementation, ideally needs complex JOIN for att % and dues)
    let riskEngine: any[] = [];
    try {
      // Just returning recent active students for now as placeholder for Risk Engine, 
      // actual calculation requires iterating over attendance and fees per student
      riskEngine = await this.dataSource.query(`SELECT s.id, s.name, s.phone, c.course_name, c.fees as total_fee FROM students s LEFT JOIN courses c ON s.course_id = c.id WHERE s.status='Active' AND ${fClauseAlias} LIMIT 5`);
    } catch(e) {}

    return {
      kpi: {
        totalStudents: Number(totalStudents),
        totalStaff: Number(totalStaff),
        presentToday: Number(presentToday),
        totalRevenue: Number(totalRevenue),
        totalExpenses: Number(totalExpenses),
        todayFees: Number(todayFees),
        totalCourses: Number(totalCourses),
        totalNotices: Number(totalNotices),
      },
      charts: {
        revenue: { data: revData },
        courses: { labels: courseLabels, data: courseData },
      },
      news,
      onboardings,
      transactions,
      riskEngine,
      support: {
        phone: '918433010182',
        name: 'Technical Assistance & Queries',
        timing: '11:00 AM - 6:00 PM (Mon-Fri)'
      },
      notifications: {
        total: notifCount,
        pendingAdmissions: pendingAdmCount,
        pendingEnquiries: pendingEnqCount,
        pendingQueries: pendingQueriesCount,
        pendingFees: pendingFeesCount,
        pendingSubscriptions: pendingSubCount,
        pendingWhatsapp: pendingWaCount,
        pendingDemo: pendingDemoCount,
      }
    };
  }
}
