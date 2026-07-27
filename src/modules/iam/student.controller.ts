import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  Param,
  Body,
  UseGuards,
  UnauthorizedException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { DataSource } from 'typeorm';

// Configure Cloudinary for permanent image hosting
cloudinary.config({
  cloud_name: 'n9b214gb',
  api_key: '793197693191996',
  api_secret: 'PLuH16oCO6TAtNpuNbLVrHtwOIk',
});

@Controller({ path: 'student', version: '1' })
@UseGuards(JwtAuthGuard)
export class StudentController {
  constructor(private readonly dataSource: DataSource) {}

  /** Returns the base URL for serving uploaded assets (photos, QR images etc.) */
  private getUploadsBaseUrl(): string {
    return process.env.UPLOADS_BASE_URL || 'https://ictcomputereducation.com/uploads';
  }

  /** Returns a proper photo URL for a student photo filename */
  private getPhotoUrl(rawPhoto: string, studentName: string): string {
    if (!rawPhoto || rawPhoto === 'null' || rawPhoto === '') {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(studentName)}&background=8b5cf6&color=fff&size=256&bold=true`;
    }
    if (rawPhoto.startsWith('http')) return rawPhoto;
    return `${this.getUploadsBaseUrl()}/${rawPhoto}`;
  }

  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    const accountType = req.user.type;

    if (accountType !== 'student') {
      throw new UnauthorizedException('Only students can access this portal');
    }

    // 1. Fetch student profile
    const rows = await this.dataSource.query(
      'SELECT s.*, c.course_name, f.branch_type, f.branch_code FROM students s LEFT JOIN courses c ON s.course_id = c.id LEFT JOIN franchises f ON s.franchise_id = f.id WHERE s.id = ? LIMIT 1',
      [userId],
    );
    const student = rows[0];
    if (!student) throw new UnauthorizedException('Student record not found');

    const fid = student.franchise_id || 1;
    const branchType = student.branch_type || 'Computer Center';
    const isSchool = branchType.toLowerCase().trim() === 'school';

    // 2. Photo URL
    const studentName = student.name || 'Student';
    const photoRaw = student.photo || student.student_dp || '';
    const photoUrl = this.getPhotoUrl(photoRaw, studentName);

    // 3. Gamification data
    let isGamified = false;
    try {
      const masterCheck = await this.dataSource.query(
        "SELECT status, is_premium FROM app_settings WHERE setting_key='xp_coupons'",
      );
      if (masterCheck.length > 0 && masterCheck[0].status == 1) {
        if (masterCheck[0].is_premium == 0 || fid == 1) {
          isGamified = true;
        } else {
          const addonCheck = await this.dataSource.query(
            'SELECT addon_xp_coupons FROM franchises WHERE id=?',
            [fid],
          );
          if (addonCheck.length > 0 && addonCheck[0].addon_xp_coupons == 1) {
            isGamified = true;
          }
        }
      }
    } catch (e) {
      /* table may not exist */
    }

    let xpData: any = {
      current_xp: 0,
      job_xp: 0,
      current_level: 1,
      current_streak: 0,
      last_login_date: null,
      last_task_date: null,
      spin_date: null,
    };
    if (isGamified) {
      try {
        const xpRows = await this.dataSource.query(
          'SELECT * FROM student_gamification WHERE student_id = ?',
          [userId],
        );
        if (xpRows.length > 0) {
          xpData = xpRows[0];
        } else {
          await this.dataSource.query(
            'INSERT INTO student_gamification (student_id, last_login_date, job_xp, current_xp) VALUES (?, CURDATE(), 0, 0)',
            [userId],
          );
        }
      } catch (e) {
        /* table may not exist */
      }
    }

    const xp = xpData.current_xp || 0;
    const sps = xpData.job_xp || 0;
    const level = xpData.current_level || 1;
    const streak = xpData.current_streak || 0;
    const nextLevelXp = level * 500;
    const progressPercent =
      nextLevelXp > 0 ? Math.min((xp / nextLevelXp) * 100, 100) : 0;

    // Rank calculation
    let skillRank = 'Rookie',
      rankColor = '#94a3b8';
    if (sps >= 100) {
      skillRank = 'Bronze';
      rankColor = '#b45309';
    }
    if (sps >= 500) {
      skillRank = 'Silver';
      rankColor = '#94a3b8';
    }
    if (sps >= 1500) {
      skillRank = 'Gold';
      rankColor = '#eab308';
    }
    if (sps >= 3000) {
      skillRank = 'Platinum';
      rankColor = '#3b82f6';
    }
    if (sps >= 5000) {
      skillRank = 'Diamond';
      rankColor = '#8b5cf6';
    }

    // 4. Notices
    let latestNotice: any = null;
    try {
      const noticeRows = await this.dataSource.query(
        "SELECT * FROM notices WHERE franchise_id=? AND audience IN ('All', 'Students') ORDER BY id DESC LIMIT 1",
        [fid],
      );
      if (noticeRows.length > 0) latestNotice = noticeRows[0];
    } catch (e) {}

    // 5. Notifications (fee alerts etc)
    let notifications: any[] = [];
    try {
      const notifRows = await this.dataSource.query(
        'SELECT * FROM student_notifications WHERE student_id=? AND is_read=0 ORDER BY id DESC LIMIT 5',
        [userId],
      );
      notifications = notifRows;
    } catch (e) {}

    // 6. Library books
    let libraryBooks: any[] = [];
    try {
      const libRows = await this.dataSource.query(
        "SELECT l.issue_date, l.expected_return_date, l.status, b.book_name FROM library_issues l JOIN books b ON l.book_id = b.id WHERE l.student_id = ? AND l.status IN ('Issued', 'Late') ORDER BY l.expected_return_date ASC",
        [userId],
      );
      libraryBooks = libRows;
    } catch (e) {}

    // 7. Job stats (for non-school)
    let jobCount = 0,
      netHired = 0,
      pendingInvites = 0,
      totalInvites = 0;
    if (!isSchool) {
      try {
        const jc = await this.dataSource.query(
          'SELECT COUNT(*) as total FROM jobs',
        );
        jobCount = jc[0]?.total || 0;
        const hc = await this.dataSource.query(
          "SELECT COUNT(*) as total FROM job_applications WHERE LOWER(status)='accepted'",
        );
        netHired = hc[0]?.total || 0;
        const ic = await this.dataSource.query(
          'SELECT status FROM job_invites WHERE student_id=?',
          [userId],
        );
        totalInvites = ic.length;
        pendingInvites = ic.filter(
          (r: any) => r.status?.toLowerCase() === 'invited',
        ).length;
      } catch (e) {}
    }

    // 8. Active students count
    let netStudents = 0;
    try {
      const sc = await this.dataSource.query(
        "SELECT COUNT(id) as total FROM students WHERE status='Active'",
      );
      netStudents = sc[0]?.total || 0;
    } catch (e) {}

    // 9. Nemesis
    let nemesisText = 'Scanning for rivals...';
    let nemesisId = 0;
    if (isGamified) {
      try {
        const nq = await this.dataSource.query(
          "SELECT s.id, s.name, IFNULL(g.job_xp, 0) as job_xp FROM student_gamification g JOIN students s ON g.student_id = s.id WHERE g.job_xp > ? AND s.id != ? AND s.status='Active' ORDER BY g.job_xp ASC LIMIT 1",
          [sps, userId],
        );
        if (nq.length > 0) {
          const diff = nq[0].job_xp - sps;
          nemesisText = `Target: ${nq[0].name} is ${diff} SPS ahead.`;
          nemesisId = nq[0].id;
        } else {
          nemesisText = 'You are the Apex Predator. Defend Rank #1!';
        }
      } catch (e) {}
    }

    // 10. Daily missions status
    const todayDate = new Date().toISOString().split('T')[0];
    const taskDoneToday = xpData.last_task_date === todayDate;
    const spinDoneToday = xpData.spin_date === todayDate;

    let opId =
      student.enrollment_no || student.roll_no || student.id?.toString();
    if (student.branch_code) opId = student.branch_code + '/' + opId;

    return {
      success: true,
      data: {
        profile: {
          id: student.id,
          name: studentName,
          course: student.course_name || 'General Course',
          enrollment_no:
            student.enrollment_no || student.roll_no || student.id?.toString(),
          operative_id: opId,
          photo: photoUrl,
          batch_time: student.batch_time || '',
          branch_type: branchType,
        },
        is_school: isSchool,
        is_gamified: isGamified,
        gamification: {
          xp,
          sps,
          level,
          streak,
          next_level_xp: nextLevelXp,
          progress_percent: progressPercent,
          rank: skillRank,
          rank_color: rankColor,
          task_done_today: taskDoneToday,
          spin_done_today: spinDoneToday,
        },
        nemesis: { text: nemesisText, id: nemesisId },
        notice: latestNotice
          ? { title: latestNotice.title, message: latestNotice.message }
          : null,
        notifications: notifications.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.message,
        })),
        notification_count: notifications.length,
        library_books: libraryBooks.map((b: any) => ({
          book_name: b.book_name,
          issue_date: b.issue_date,
          return_date: b.expected_return_date,
          is_late: new Date() > new Date(b.expected_return_date),
          status: b.status,
        })),
        jobs: {
          count: Number(jobCount),
          hired: Number(netHired),
          pending_invites: Number(pendingInvites),
          total_invites: Number(totalInvites),
        },
        stats: { active_students: Number(netStudents) },
      },
    };
  }

  @Get('notifications')
  async getNotifications(@Req() req: any) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    if (req.user.type !== 'student')
      throw new UnauthorizedException('Students only');

    let notifications: any[] = [];
    try {
      notifications = await this.dataSource.query(
        'SELECT * FROM student_notifications WHERE student_id=? ORDER BY id DESC LIMIT 20',
        [userId],
      );
    } catch (e) {}

    return { success: true, data: notifications };
  }

  @Get('talent-feed')
  async getTalentFeed(@Req() req: any) {
    if (req.user.type !== 'student')
      throw new UnauthorizedException('Students only');

    let students: any[] = [];
    try {
      students = await this.dataSource.query(
        `SELECT s.id, s.name, s.photo, s.student_dp, c.course_name, s.batch_time,
         IFNULL(g.job_xp, 0) as sps, IFNULL(g.current_level, 1) as level
         FROM students s
         LEFT JOIN courses c ON s.course_id = c.id
         LEFT JOIN student_gamification g ON g.student_id = s.id
         WHERE s.status = 'Active' AND s.id != ?
         ORDER BY g.job_xp DESC LIMIT 30`,
        [req.user.userId || req.user.sub || req.user.id],
      );
    } catch (e) {}

    return {
      success: true,
      data: students.map((s: any) => {
        const photoRaw = s.photo || s.student_dp || '';
        const photo = this.getPhotoUrl(photoRaw, s.name);
        return {
          id: s.id,
          name: s.name,
          photo,
          course: s.course_name || 'Student',
          batch_time: s.batch_time || '',
          sps: s.sps,
          level: s.level,
        };
      }),
    };
  }

  @Get('chat/messages')
  async getChatMessages(@Req() req: any) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    if (req.user.type !== 'student')
      throw new UnauthorizedException('Students only');

    const roomId = req.query.room_id || 'batch_global';
    let messages: any[] = [];
    try {
      // Ensure table exists
      await this.dataSource.query(`CREATE TABLE IF NOT EXISTS chat_messages (
        id int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
        franchise_id int(11) NOT NULL DEFAULT 1,
        room_id varchar(100) NOT NULL,
        sender_id int(11) NOT NULL,
        message text NOT NULL,
        file_url varchar(255) DEFAULT '',
        created_at timestamp DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

      messages = await this.dataSource.query(
        `SELECT m.*, s.name as sender_name FROM chat_messages m 
         LEFT JOIN students s ON m.sender_id = s.id 
         WHERE m.room_id = ? ORDER BY m.created_at DESC LIMIT 50`,
        [roomId],
      );
      // Mark is_me
      messages = messages.map((m: any) => ({
        ...m,
        is_me: m.sender_id === userId,
      }));
    } catch (e) {}

    return { success: true, data: messages };
  }

  @Post('chat/send')
  async sendChatMessage(@Req() req: any) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    if (req.user.type !== 'student')
      throw new UnauthorizedException('Students only');

    const { room_id, message } = req.body;
    if (!message || !message.trim())
      throw new UnauthorizedException('Message is required');

    try {
      // Get franchise_id
      const student = await this.dataSource.query(
        'SELECT franchise_id FROM students WHERE id = ?',
        [userId],
      );
      const fid = student[0]?.franchise_id || 1;

      await this.dataSource.query(
        'INSERT INTO chat_messages (franchise_id, room_id, sender_id, message) VALUES (?, ?, ?, ?)',
        [fid, room_id || 'batch_global', userId, message.trim()],
      );
    } catch (error) {
      return {
        success: false,
        message: 'Database error',
        error: error.message,
      };
    }
  }

  @Get('talent-feed/jobs')
  @UseGuards(JwtAuthGuard)
  async getTalentFeedJobs(@Req() req: any) {
    const studentId = req.user.sub;
    try {
      // Create tables on the fly if they don't exist (just like the PHP code did)
      await this.dataSource
        .query(
          `
        CREATE TABLE IF NOT EXISTS jobs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          employer_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          req_sps INT DEFAULT 50,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
        )
        .catch(() => {});

      await this.dataSource
        .query(
          `
        CREATE TABLE IF NOT EXISTS employers (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_name VARCHAR(255) NOT NULL,
          contact_phone VARCHAR(50)
        )
      `,
        )
        .catch(() => {});

      await this.dataSource
        .query(
          `
        CREATE TABLE IF NOT EXISTS job_applications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          job_id INT NOT NULL,
          student_id INT NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
        )
        .catch(() => {});

      await this.dataSource
        .query(
          `
        CREATE TABLE IF NOT EXISTS job_invites (
          id INT AUTO_INCREMENT PRIMARY KEY,
          job_id INT,
          employer_id INT NOT NULL,
          student_id INT NOT NULL,
          status VARCHAR(50) DEFAULT 'invited',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
        )
        .catch(() => {});

      const jobsQuery = `
        SELECT j.*, e.company_name, e.contact_phone, 
               (SELECT COUNT(*) FROM job_applications WHERE job_id=j.id AND status='accepted') as hired_count,
               (SELECT COUNT(*) FROM job_applications WHERE job_id=j.id AND student_id=?) as has_applied
        FROM jobs j 
        JOIN employers e ON j.employer_id = e.id 
        ORDER BY j.created_at DESC LIMIT 50
      `;
      const rawJobs = await this.dataSource.query(jobsQuery, [studentId]);

      const jobs = rawJobs.map((j) => ({
        ...j,
        hired_count: Number(j.hired_count || 0),
        has_applied: Number(j.has_applied || 0),
      }));

      const invitesQuery = `
        SELECT i.id as invite_id, e.company_name 
        FROM job_invites i 
        JOIN employers e ON i.employer_id = e.id 
        WHERE i.student_id=? AND i.status='invited'
      `;
      const pending_invites = await this.dataSource.query(invitesQuery, [
        studentId,
      ]);

      const spsRes = await this.dataSource.query(
        `SELECT job_xp FROM student_gamification WHERE student_id=?`,
        [studentId],
      );
      const my_sps = spsRes.length > 0 ? Number(spsRes[0].job_xp) : 0;

      return {
        success: true,
        data: {
          jobs,
          pending_invites,
          my_sps,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Could not fetch jobs',
        error: error.message,
      };
    }
  }

  @Post('talent-feed/jobs/apply')
  @UseGuards(JwtAuthGuard)
  async applyForJob(@Req() req: any, @Body() body: { job_id: number }) {
    const studentId = req.user.sub;
    try {
      const { job_id } = body;
      const jobRes = await this.dataSource.query(
        `SELECT req_sps FROM jobs WHERE id=?`,
        [job_id],
      );
      if (jobRes.length === 0)
        return { success: false, message: 'Job not found' };

      const reqSps = jobRes[0].req_sps || 0;

      const spsRes = await this.dataSource.query(
        `SELECT job_xp FROM student_gamification WHERE student_id=?`,
        [studentId],
      );
      const mySps = spsRes.length > 0 ? spsRes[0].job_xp : 0;

      if (mySps < reqSps) {
        return {
          success: false,
          message: `SKILL LEVEL TOO LOW! You need at least ${reqSps} SPS.`,
        };
      }

      const check = await this.dataSource.query(
        `SELECT id FROM job_applications WHERE job_id=? AND student_id=?`,
        [job_id, studentId],
      );
      if (check.length > 0) {
        return {
          success: false,
          message: 'You are already active on this mission.',
        };
      }

      await this.dataSource.query(
        `INSERT INTO job_applications (job_id, student_id, status) VALUES (?, ?, 'pending')`,
        [job_id, studentId],
      );
      return {
        success: true,
        message: 'Profile Transmitted! Employer is reviewing your skills.',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Application failed',
        error: error.message,
      };
    }
  }

  // --------------------------------------------------------------------------
  // Gamification: Typing Arena
  // --------------------------------------------------------------------------
  @Post('gamification/typing-submit')
  @UseGuards(JwtAuthGuard)
  async submitTypingScore(
    @Req() req: any,
    @Body() body: { wpm: number; accuracy: number },
  ) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      const { wpm, accuracy } = body;

      // Calculate XP/SPS reward
      // Example: 1 WPM = 1 SPS, if accuracy > 90%
      if (accuracy < 90) {
        return {
          success: false,
          message: 'Accuracy must be at least 90% to earn SPS!',
        };
      }

      const spsEarned = Math.floor(wpm);

      const check = await this.dataSource.query(
        'SELECT id FROM student_gamification WHERE student_id = ? LIMIT 1',
        [studentId],
      );

      if (check.length > 0) {
        await this.dataSource.query(
          'UPDATE student_gamification SET current_xp = current_xp + ?, job_xp = job_xp + ? WHERE student_id = ?',
          [spsEarned, spsEarned, studentId],
        );
      } else {
        await this.dataSource.query(
          'INSERT INTO student_gamification (student_id, current_xp, job_xp) VALUES (?, ?, ?)',
          [studentId, spsEarned, spsEarned],
        );
      }

      return {
        success: true,
        message: `Awesome! You earned ${spsEarned} SPS & XP!`,
        earned: spsEarned,
      };
    } catch (e) {
      throw new InternalServerErrorException('Could not submit typing score');
    }
  }

  // --------------------------------------------------------------------------
  // Gamification: Spin Wheel
  // --------------------------------------------------------------------------
  @Get('gamification/spin-status')
  @UseGuards(JwtAuthGuard)
  async getSpinStatus(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      const today = new Date().toISOString().split('T')[0];
      const result = await this.dataSource.query(
        'SELECT spin_date, current_xp FROM student_gamification WHERE student_id = ? LIMIT 1',
        [studentId],
      );
      const data = result[0] || {};
      const alreadySpun = data.spin_date === today;
      return {
        success: true,
        data: { alreadySpun, current_xp: data.current_xp || 0 },
      };
    } catch (e) {
      throw new InternalServerErrorException('Could not fetch spin status');
    }
  }

  @Post('gamification/spin-reward')
  @UseGuards(JwtAuthGuard)
  async claimSpinReward(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      const today = new Date().toISOString().split('T')[0];

      const check = await this.dataSource.query(
        'SELECT spin_date FROM student_gamification WHERE student_id = ? LIMIT 1',
        [studentId],
      );
      if (check[0] && check[0].spin_date === today) {
        throw new ForbiddenException('Already spun today! Come back tomorrow.');
      }

      const rewards = [
        { val: 10, text: '+10 SPS' },
        { val: 20, text: '+20 SPS' },
        { val: 5, text: '+5 SPS' },
        { val: 50, text: 'JACKPOT! +50 SPS' },
        { val: 0, text: 'Better Luck Next Time' },
      ];
      const won = rewards[Math.floor(Math.random() * rewards.length)];

      if (check[0]) {
        if (won.val > 0) {
          await this.dataSource.query(
            'UPDATE student_gamification SET current_xp = current_xp + ?, job_xp = job_xp + ?, spin_date = ? WHERE student_id = ?',
            [won.val, won.val, today, studentId],
          );
        } else {
          await this.dataSource.query(
            'UPDATE student_gamification SET spin_date = ? WHERE student_id = ?',
            [today, studentId],
          );
        }
      } else {
        await this.dataSource.query(
          'INSERT INTO student_gamification (student_id, current_xp, job_xp, spin_date) VALUES (?, ?, ?, ?)',
          [studentId, won.val, won.val, today],
        );
      }

      return { success: true, data: { reward: won.text, points: won.val } };
    } catch (e) {
      if (e instanceof ForbiddenException) throw e;
      throw new InternalServerErrorException('Could not process spin reward');
    }
  }

  @Get('gamification/leaderboard')
  @UseGuards(JwtAuthGuard)
  async getLeaderboard(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      const studentRes = await this.dataSource.query(
        `SELECT batch_time FROM students WHERE id=?`,
        [studentId],
      );
      const myBatch = studentRes[0]?.batch_time || '';

      const globalQuery = `
        SELECT s.id, s.name, s.photo, s.student_dp, c.course_name, s.batch_time,
               IFNULL(g.job_xp, 0) as sps, IFNULL(g.current_level, 1) as level
        FROM students s
        LEFT JOIN courses c ON s.course_id = c.id
        LEFT JOIN student_gamification g ON g.student_id = s.id
        WHERE s.status = 'Active'
        ORDER BY g.job_xp DESC LIMIT 100
      `;
      const globalLeaderboard = await this.dataSource.query(globalQuery);

      let batchLeaderboard = [];
      if (myBatch) {
        const batchQuery = `
          SELECT s.id, s.name, s.photo, s.student_dp, c.course_name, s.batch_time,
                 IFNULL(g.job_xp, 0) as sps, IFNULL(g.current_level, 1) as level
          FROM students s
          LEFT JOIN courses c ON s.course_id = c.id
          LEFT JOIN student_gamification g ON g.student_id = s.id
          WHERE s.status = 'Active' AND s.batch_time = ?
          ORDER BY g.job_xp DESC LIMIT 50
        `;
        batchLeaderboard = await this.dataSource.query(batchQuery, [myBatch]);
      }

      const myGlobalRank =
        globalLeaderboard.findIndex((s: any) => s.id === studentId) + 1;
      const myBatchRank =
        batchLeaderboard.findIndex((s: any) => s.id === studentId) + 1;

      return {
        success: true,
        data: {
          global: globalLeaderboard,
          batch: batchLeaderboard,
          my_stats: {
            global_rank: myGlobalRank > 0 ? myGlobalRank : '100+',
            batch_rank: myBatchRank > 0 ? myBatchRank : '50+',
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Could not fetch leaderboard',
        error: error.message,
      };
    }
  }

  @Get('profile')
  async getProfile(@Req() req: any) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    if (req.user.type !== 'student')
      throw new UnauthorizedException('Students only');

    const rows = await this.dataSource.query(
      `SELECT s.*, c.course_name, f.branch_code, f.branch_name, f.branch_type 
       FROM students s 
       LEFT JOIN courses c ON s.course_id = c.id 
       LEFT JOIN franchises f ON s.franchise_id = f.id 
       WHERE s.id = ? LIMIT 1`,
      [userId],
    );

    if (rows.length === 0) throw new UnauthorizedException('Student not found');
    const s = rows[0];

    // Compute operative ID (same logic as PHP)
    let opId = s.enrollment_no || s.roll_no || s.id.toString();
    if (s.branch_code) opId = s.branch_code + '/' + opId;

    const photoRaw = s.photo || s.student_dp || '';
    const photoUrl = this.getPhotoUrl(photoRaw, s.name);

    return {
      success: true,
      data: {
        ...s,
        id: s.id,
        name: s.name,
        email: s.email,
        mobile: s.phone || s.student_phone || 'N/A',
        bio: s.bio || '',
        github_link: s.github_link || '',
        linkedin_link: s.linkedin_link || '',
        portfolio_link: s.portfolio_link || '',
        operative_id: opId,
        course: s.course_name || 'N/A',
        branch_name: s.branch_name || 'N/A',
        branch_code: s.branch_code || 'N/A',
        branch_type: s.branch_type || 'N/A',
        batch_time: s.batch_time || 'N/A',
        joined_date: s.join_date || s.date_of_admission,
        photoUrl: photoUrl,
      },
    };
  }

  @Get('notices')
  async getNotices(@Req() req: any) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    if (req.user.type !== 'student')
      throw new UnauthorizedException('Students only');

    const student = await this.dataSource.query(
      'SELECT franchise_id FROM students WHERE id = ?',
      [userId],
    );
    const fid = student[0]?.franchise_id || 1;

    const notices = await this.dataSource.query(
      `SELECT * FROM notices WHERE franchise_id = ? AND audience IN ('All', 'Students') ORDER BY id DESC`,
      [fid],
    );

    return {
      success: true,
      data: notices,
    };
  }

  @Get('attendance')
  async getAttendance(@Req() req: any) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    if (req.user.type !== 'student')
      throw new UnauthorizedException('Students only');

    const attQuery = await this.dataSource.query(
      `SELECT COUNT(*) as total_days, SUM(CASE WHEN status='Present' THEN 1 ELSE 0 END) as present_days 
       FROM attendance WHERE student_id=?`,
      [userId],
    );

    const history = await this.dataSource.query(
      `SELECT * FROM attendance WHERE student_id=? ORDER BY attendance_date DESC LIMIT 7`,
      [userId],
    );

    const total = parseInt(attQuery[0]?.total_days || '0');
    const present = parseInt(attQuery[0]?.present_days || '0');
    const percent = total > 0 ? Math.round((present / total) * 100) : 0;

    return {
      success: true,
      data: {
        total,
        present,
        percent,
        history,
      },
    };
  }

  @Get('fees')
  async getFees(@Req() req: any) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    if (req.user.type !== 'student')
      throw new UnauthorizedException('Students only');

    const feeDataQuery = await this.dataSource.query(
      `SELECT 
          c.fees as total_course_fee, 
          s.last_due_amount,
          s.discount_amount,
          (SELECT SUM(amount) FROM fee_payments WHERE student_id = s.id) as paid_amount
       FROM students s 
       LEFT JOIN courses c ON s.course_id = c.id 
       WHERE s.id=?`,
      [userId],
    );

    const history = await this.dataSource.query(
      `SELECT * FROM fee_payments WHERE student_id=? ORDER BY id DESC`,
      [userId],
    );

    const course_fee = parseFloat(feeDataQuery[0]?.total_course_fee || '0');
    const custom_fee = parseFloat(feeDataQuery[0]?.last_due_amount || '0');
    const totalFee = custom_fee > 0 ? custom_fee : course_fee;

    const paid = parseFloat(feeDataQuery[0]?.paid_amount || '0');
    const disc = parseFloat(feeDataQuery[0]?.discount_amount || '0');
    const due = totalFee - paid - disc;

    const branchQuery = await this.dataSource.query(
      `SELECT s.franchise_id, f.branch_name, f.phone 
       FROM students s 
       JOIN franchises f ON s.franchise_id = f.id 
       WHERE s.id=?`,
      [userId],
    );

    const bInfo = branchQuery[0] || {};
    let upi_id: string | null = null;
    let upi_name: string | null = null;
    let qr_image: string | null = null;

    if (bInfo.franchise_id == 1) {
      const masterPay = await this.dataSource.query(
        `SELECT upi_id, upi_name, qr_image FROM master_payment_info WHERE id=1`,
      );
      if (masterPay && masterPay.length > 0) {
        upi_id = masterPay[0].upi_id;
        upi_name = masterPay[0].upi_name;
        qr_image = masterPay[0].qr_image;
      }
    } else {
      const branchPay = await this.dataSource.query(
        `SELECT upi_id, upi_name, qr_image FROM branch_settings WHERE franchise_id=?`,
        [bInfo.franchise_id],
      );
      if (branchPay && branchPay.length > 0) {
        upi_id = branchPay[0].upi_id;
        upi_name = branchPay[0].upi_name;
        qr_image = branchPay[0].qr_image;
      }
    }

    if (qr_image) {
      qr_image = qr_image.startsWith('http')
        ? qr_image
        : `${this.getUploadsBaseUrl()}/${qr_image}`;
    }

    if (!upi_id) upi_id = `${bInfo.phone || 'admin'}@upi`;
    if (!upi_name) upi_name = bInfo.branch_name || 'Admin';
    if (!qr_image) {
      qr_image = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=2&data=upi://pay?pa=${upi_id}&pn=${encodeURIComponent(upi_name || 'Admin')}&cu=INR`;
    }

    let feeRequests = [];
    try {
      feeRequests = await this.dataSource.query(
        `SELECT * FROM fee_requests WHERE student_id=? ORDER BY id DESC`,
        [userId],
      );
    } catch (e) {
      // Table might not exist yet
    }

    const formattedRequests = feeRequests.map((r: any) => ({
      ...r,
      amount: parseFloat(r.amount || '0'),
    }));

    const formattedHistory = history.map((h: any) => ({
      id: h.id,
      amount: parseFloat(h.amount || '0'),
      transaction_id: h.receipt_no || 'Offline/Cash',
      status: 'Approved',
      request_date: h.payment_date || h.created_at,
      screenshot: '',
    }));

    const combinedRequests = [...formattedRequests, ...formattedHistory].sort(
      (a, b) => new Date(b.request_date).getTime() - new Date(a.request_date).getTime()
    );

    return {
      success: true,
      data: {
        total_fee: totalFee,
        paid: paid,
        discount: disc,
        due: due > 0 ? due : 0,
        history,
        requests: feeRequests,
        branch_name: bInfo.branch_name,
        upi_id,
        upi_name,
        qr_image,
      },
    };
  }

  @Post('fees/pay')
  async submitFeePayment(@Req() req: any, @Body() body: any) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    if (req.user.type !== 'student')
      throw new UnauthorizedException('Students only');

    const { amount, txn_id, base64_screenshot } = body;
    if (!amount || !txn_id || !base64_screenshot) {
      return {
        success: false,
        message: 'Amount, Transaction ID, and Screenshot are required',
      };
    }

    try {
      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS fee_requests (
          id INT AUTO_INCREMENT PRIMARY KEY,
          franchise_id INT DEFAULT 1,
          student_id INT NOT NULL,
          amount DECIMAL(10,2) NOT NULL,
          payment_mode VARCHAR(50) DEFAULT 'Online/UPI',
          transaction_id VARCHAR(100) NOT NULL,
          screenshot VARCHAR(255) DEFAULT '',
          request_date DATE NOT NULL,
          status VARCHAR(20) DEFAULT 'Pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const fs = require('fs');
      const path = require('path');
      let filename = '';
      if (base64_screenshot) {
        try {
          const result = await cloudinary.uploader.upload(base64_screenshot, {
            folder: 'arena_os_fee_receipts',
          });
          filename = result.secure_url;
        } catch (err) {
          console.error('Cloudinary upload error:', err);
          return {
            success: false,
            message: 'Invalid screenshot format or upload failed',
          };
        }
      } else {
        return { success: false, message: 'No screenshot provided' };
      }

      const sQuery = await this.dataSource.query(
        `SELECT franchise_id FROM students WHERE id=?`,
        [userId],
      );
      const franchiseId = sQuery[0]?.franchise_id || 1;

      await this.dataSource.query(
        `INSERT INTO fee_requests (student_id, franchise_id, amount, transaction_id, screenshot, request_date) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, franchiseId, amount, txn_id, filename, new Date()],
      );

      return {
        success: true,
        message:
          'Payment receipt submitted successfully! Admin will verify soon.',
      };
    } catch (e) {
      console.error(e);
      return { success: false, message: 'Failed to submit payment receipt' };
    }
  }

  @Post('profile/update')
  async updateProfile(@Req() req: any) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    if (req.user.type !== 'student')
      throw new UnauthorizedException('Students only');

    const { bio, github_link, linkedin_link, portfolio_link, base64_photo } =
      req.body;
    const updates: string[] = [];
    const params: any[] = [];

    if (bio !== undefined) {
      updates.push('bio=?');
      params.push(bio);
    }
    if (github_link !== undefined) {
      updates.push('github_link=?');
      params.push(github_link);
    }
    if (linkedin_link !== undefined) {
      updates.push('linkedin_link=?');
      params.push(linkedin_link);
    }
    if (portfolio_link !== undefined) {
      updates.push('portfolio_link=?');
      params.push(portfolio_link);
    }

    if (base64_photo) {
      try {
        const result = await cloudinary.uploader.upload(base64_photo, {
          folder: 'arena_os_profiles',
        });

        updates.push('student_dp=?');
        params.push(result.secure_url);
      } catch (e) {
        console.error('Error saving dp to Cloudinary:', e);
      }
    }

    if (updates.length > 0) {
      params.push(userId);
      await this.dataSource.query(
        `UPDATE students SET ${updates.join(', ')} WHERE id=?`,
        params,
      );
    }

    return { success: true, message: 'Profile updated successfully' };
  }

  // --------------------------------------------------------------------------
  // Gamification: XP Store
  // --------------------------------------------------------------------------
  @Get('gamification/xp-store-status')
  @UseGuards(JwtAuthGuard)
  async getXpStoreStatus(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      // Get current XP
      const xpCheck = await this.dataSource.query(
        'SELECT current_xp FROM student_gamification WHERE student_id = ? LIMIT 1',
        [studentId],
      );
      const currentXp = xpCheck.length > 0 ? xpCheck[0].current_xp : 0;

      // The Rs 600 Master Lock (Max 6 coupons of 100 Rs per year — original PHP logic)
      const year = new Date().getFullYear();
      const discCheck = await this.dataSource.query(
        "SELECT COUNT(*) as total FROM student_purchases WHERE student_id = ? AND item_name = 'Rs 100 Fee Discount' AND YEAR(purchase_date) = ?",
        [studentId, year],
      );
      const discountBought = discCheck[0].total || 0;
      const discountsLeft = Math.max(0, 6 - discountBought);

      return {
        success: true,
        current_xp: currentXp,
        discounts_left: discountsLeft,
      };
    } catch (e) {
      throw new InternalServerErrorException('Error fetching XP Store status');
    }
  }

  @Post('gamification/xp-store-buy')
  @UseGuards(JwtAuthGuard)
  async buyXpStoreItem(
    @Req() req: any,
    @Body() body: { item_name: string; cost: number },
  ) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      const { item_name, cost } = body;

      // Get current XP
      const xpCheck = await this.dataSource.query(
        'SELECT current_xp FROM student_gamification WHERE student_id = ? LIMIT 1',
        [studentId],
      );
      const currentXp = xpCheck.length > 0 ? xpCheck[0].current_xp : 0;

      if (currentXp < cost) {
        return {
          success: false,
          message:
            'Not Enough XP! You need to grind more in the Arena to buy this.',
        };
      }

      if (item_name === 'Rs 100 Fee Discount') {
        const year = new Date().getFullYear();
        const discCheck = await this.dataSource.query(
          "SELECT COUNT(*) as total FROM student_purchases WHERE student_id = ? AND item_name = 'Rs 100 Fee Discount' AND YEAR(purchase_date) = ?",
          [studentId, year],
        );
        const discountBought = discCheck[0].total || 0;
        const discountsLeft = 6 - discountBought;

        if (discountsLeft <= 0) {
          return {
            success: false,
            message:
              'Limit Reached 🔒 You have already claimed the maximum fee discount of Rs 600 this year.',
          };
        }

        // 1. Deduct XP
        await this.dataSource.query(
          'UPDATE student_gamification SET current_xp = current_xp - ? WHERE student_id = ?',
          [cost, studentId],
        );

        // 2. Generate Unique Coupon Code
        const rand = Math.floor(1000 + Math.random() * 9000);
        const hash = Math.random().toString(36).substring(2, 6).toUpperCase();
        const coupon_code = `ICT-${rand}-${hash}`;

        // 3. Save to Rewards
        await this.dataSource.query(
          "INSERT INTO student_rewards (student_id, reward_name, coupon_code, discount_amount, status) VALUES (?, ?, ?, 100, 'Active')",
          [studentId, item_name, coupon_code],
        );

        // 4. Log Purchase
        await this.dataSource.query(
          'INSERT INTO student_purchases (student_id, item_name, xp_cost) VALUES (?, ?, ?)',
          [studentId, item_name, cost],
        );

        return {
          success: true,
          message: 'Loot Unlocked! 🎉',
          coupon_code: coupon_code,
        };
      } else {
        // Normal Virtual Items
        await this.dataSource.query(
          'UPDATE student_gamification SET current_xp = current_xp - ? WHERE student_id = ?',
          [cost, studentId],
        );
        await this.dataSource.query(
          'INSERT INTO student_purchases (student_id, item_name, xp_cost) VALUES (?, ?, ?)',
          [studentId, item_name, cost],
        );
        return {
          success: true,
          message: `Item Purchased! 🎁 You have successfully unlocked: ${item_name}`,
        };
      }
    } catch (e) {
      throw new InternalServerErrorException('Error processing purchase');
    }
  }

  // --------------------------------------------------------------------------
  // Gamification: Battle Royale
  // --------------------------------------------------------------------------
  @Get('gamification/battles')
  @UseGuards(JwtAuthGuard)
  async getActiveBattles(@Req() req: any) {
    // Return a dummy list of battles for the UI
    return {
      success: true,
      battles: [
        {
          id: 1,
          title: 'Weekly UI Clone Challenge',
          type: 'Flutter / UI',
          participants: 124,
          max_participants: 200,
          entry_fee: 50,
          prize_pool: 5000,
          status: 'Registering',
          starts_in: '2 hours',
          color: '#3B82F6',
        },
        {
          id: 2,
          title: 'Algorithms Deathmatch',
          type: 'Data Structures',
          participants: 45,
          max_participants: 100,
          entry_fee: 100,
          prize_pool: 10000,
          status: 'Live',
          starts_in: 'Ongoing',
          color: '#EC4899',
        },
        {
          id: 3,
          title: 'Speed Typing Showdown',
          type: 'Keyboard Ninja',
          participants: 300,
          max_participants: 500,
          entry_fee: 10,
          prize_pool: 3000,
          status: 'Registering',
          starts_in: '1 day',
          color: '#10B981',
        },
      ],
    };
  }

  // ==========================================================================
  // PHASE 1: CORE ACADEMICS & IDENTITY
  // ==========================================================================

  @Get('academics/timetable')
  @UseGuards(JwtAuthGuard)
  async getTimetable(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      const studentRes = await this.dataSource.query(
        `SELECT course_id, franchise_id FROM students WHERE id=?`,
        [studentId],
      );
      if (!studentRes.length)
        return { success: false, message: 'Student not found' };
      const { course_id, franchise_id } = studentRes[0];

      const timetable = await this.dataSource.query(
        `SELECT id, subject_name as subject, batch_time, day_of_week as days, time_slot FROM time_table WHERE course_id=? AND franchise_id=? ORDER BY id DESC`,
        [course_id, franchise_id],
      );

      return { success: true, data: timetable };
    } catch (error) {
      return {
        success: false,
        message: 'Could not fetch timetable',
        error: error.message,
      };
    }
  }

  @Get('academics/syllabus')
  @UseGuards(JwtAuthGuard)
  async getSyllabus(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      const studentRes = await this.dataSource.query(
        `SELECT s.course_id, s.franchise_id, c.course_name FROM students s LEFT JOIN courses c ON s.course_id = c.id WHERE s.id=?`,
        [studentId],
      );
      if (!studentRes.length)
        return { success: false, message: 'Student not found' };
      const { course_id, franchise_id, course_name } = studentRes[0];

      // Auto-create table logic not needed in TS if migration handles it, but let's query safely
      let syllabus = [];
      try {
        syllabus = await this.dataSource.query(
          `SELECT id, title, file_name, upload_date FROM syllabus WHERE course_id=? AND franchise_id=? ORDER BY id DESC`,
          [course_id, franchise_id],
        );
      } catch (e) {
        // Table might not exist, ignore
      }

      return { success: true, course_name, data: syllabus };
    } catch (error) {
      return {
        success: false,
        message: 'Could not fetch syllabus',
        error: error.message,
      };
    }
  }

  @Get('academics/datesheet')
  @UseGuards(JwtAuthGuard)
  async getDateSheet(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      const studentRes = await this.dataSource.query(
        `SELECT franchise_id FROM students WHERE id=?`,
        [studentId],
      );
      if (!studentRes.length)
        return { success: false, message: 'Student not found' };
      const franchise_id = studentRes[0].franchise_id;

      // Check which table exists (matching PHP logic)
      let tableName = '';
      for (const tbl of [
        'date_sheets',
        'date_sheet_uploads',
        'exam_date_sheets',
      ]) {
        const chk = await this.dataSource.query(`SHOW TABLES LIKE '${tbl}'`);
        if (chk.length > 0) {
          tableName = tbl;
          break;
        }
      }

      if (!tableName) return { success: true, data: [] }; // No table yet

      // Safe query
      let datesheets = [];
      try {
        const hasFranchise = await this.dataSource.query(
          `SHOW COLUMNS FROM \`${tableName}\` LIKE 'franchise_id'`,
        );
        if (hasFranchise.length > 0) {
          datesheets = await this.dataSource.query(
            `SELECT * FROM \`${tableName}\` WHERE franchise_id=? OR franchise_id=1 ORDER BY id DESC`,
            [franchise_id],
          );
        } else {
          datesheets = await this.dataSource.query(
            `SELECT * FROM \`${tableName}\` ORDER BY id DESC`,
          );
        }
      } catch (e) {
        // ignore
      }

      // Map to consistent format
      const mapped = datesheets.map((d: any) => ({
        id: d.id,
        title: d.exam_name || d.title || d.sheet_name || 'Upcoming Exam',
        file_name: d.file_name || d.file_path || d.pdf_file || d.file || '',
        date: d.created_at || d.upload_date || d.date || '',
      }));

      return { success: true, data: mapped };
    } catch (error) {
      return {
        success: false,
        message: 'Could not fetch datesheets',
        error: error.message,
      };
    }
  }

  @Get('academics/holidays')
  @UseGuards(JwtAuthGuard)
  async getHolidays(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      const studentRes = await this.dataSource.query(
        `SELECT franchise_id FROM students WHERE id=?`,
        [studentId],
      );
      if (!studentRes.length)
        return { success: false, message: 'Student not found' };
      const franchise_id = studentRes[0].franchise_id || 1;

      let holidays = [];
      try {
        holidays = await this.dataSource.query(
          `SELECT id, title, start_date, end_date FROM holidays WHERE franchise_id=? ORDER BY start_date ASC`,
          [franchise_id],
        );
      } catch (e) {
        // Table might not exist
      }

      return { success: true, data: holidays };
    } catch (error) {
      return {
        success: false,
        message: 'Could not fetch holidays',
        error: error.message,
      };
    }
  }

  @Get('identity/id-card')
  @UseGuards(JwtAuthGuard)
  async getIdCard(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      const query = `
        SELECT s.*, c.course_name, f.branch_name as franchise_name, f.branch_code as fr_code, bs.invoice_prefix 
        FROM students s 
        LEFT JOIN courses c ON s.course_id = c.id 
        LEFT JOIN franchises f ON s.franchise_id = f.id 
        LEFT JOIN branch_settings bs ON f.id = bs.franchise_id
        WHERE s.id=?
      `;
      const res = await this.dataSource.query(query, [studentId]);
      if (!res.length) return { success: false, message: 'Student not found' };
      const student = res[0];

      const inst_name =
        student.franchise_name ||
        student.name ||
        student.branch_name ||
        'ICT COMPUTER EDUCATION';
      const inst_addr =
        student.address ||
        student.branch_address ||
        student.location ||
        'Main Campus, India';
      const inst_phone =
        student.phone ||
        student.branch_phone ||
        student.contact ||
        'Support Team';

      const photo_url =
        student.photo && student.photo !== 'null' ? student.photo : '';

      const roll_prefix = student.invoice_prefix
        ? student.invoice_prefix.replace(/-$/, '')
        : student.fr_code || 'ICT';
      const display_id =
        student.roll_no ||
        student.admission_no ||
        roll_prefix + '-' + student.id.toString().padStart(4, '0');

      return {
        success: true,
        data: {
          inst_name,
          inst_addr,
          inst_phone,
          student_name: student.name,
          course_name: student.course_name || 'Not Assigned',
          photo: photo_url,
          roll_no: display_id,
          dob: student.dob,
          blood_group: student.blood_group,
          phone: student.phone,
          valid_till: '2026-12-31', // Usually calculated or static for now
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Could not fetch ID card details',
        error: error.message,
      };
    }
  }

  // ==========================================================================
  // PHASE 2: ASSESSMENTS & CAREER
  // ==========================================================================

  @Get('academics/results')
  @UseGuards(JwtAuthGuard)
  async getResults(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      const allResults: any[] = [];
      // Attempt to fetch from new table
      try {
        const qNew = await this.dataSource.query(
          `
          SELECT er.id, er.total_marks, er.obtained_marks, er.status, er.document_file, e.exam_name, e.exam_type, e.offline_paper 
          FROM exam_results er 
          JOIN exams e ON er.exam_id = e.id 
          WHERE er.student_id = ? ORDER BY er.id DESC
        `,
          [studentId],
        );
        allResults.push(...qNew);
      } catch (e) {}

      // Attempt to fetch from old table
      try {
        const qOld = await this.dataSource.query(
          `
          SELECT m.id, m.total_marks, m.obtained_marks, '' as status, '' as document_file, e.exam_name, 'Online' as exam_type, '' as offline_paper 
          FROM marks m 
          JOIN exams e ON m.exam_id = e.id 
          WHERE m.student_id = ? ORDER BY m.id DESC
        `,
          [studentId],
        );
        allResults.push(...qOld);
      } catch (e) {}

      return { success: true, data: allResults };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch results',
        error: error.message,
      };
    }
  }

  @Get('academics/library')
  @UseGuards(JwtAuthGuard)
  async getLibrary(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      const studentRes = await this.dataSource.query(
        `SELECT course_id FROM students WHERE id=?`,
        [studentId],
      );
      if (!studentRes.length)
        return { success: false, message: 'Student not found' };
      const course_id = studentRes[0].course_id;

      let materials = [];
      try {
        materials = await this.dataSource.query(
          `SELECT * FROM study_materials WHERE course_id=? ORDER BY id DESC`,
          [course_id],
        );
      } catch (e) {}

      return { success: true, data: materials };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch library materials',
        error: error.message,
      };
    }
  }

  @Get('academics/active-exams')
  @UseGuards(JwtAuthGuard)
  async getActiveExams(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      const studentRes = await this.dataSource.query(
        `SELECT franchise_id FROM students WHERE id=?`,
        [studentId],
      );
      if (!studentRes.length)
        return { success: false, message: 'Student not found' };
      const franchise_id = studentRes[0].franchise_id;

      let exams = [];
      try {
        exams = await this.dataSource.query(
          `SELECT * FROM exams WHERE franchise_id=? AND status='Active' ORDER BY id DESC`,
          [franchise_id],
        );
      } catch (e) {}

      return { success: true, data: exams };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch active exams',
        error: error.message,
      };
    }
  }

  @Get('academics/quiz')
  @UseGuards(JwtAuthGuard)
  async getQuiz(@Req() req: any) {
    try {
      let questions = [];
      try {
        questions = await this.dataSource.query(
          `SELECT * FROM daily_quiz_questions ORDER BY RAND() LIMIT 20`,
        );
      } catch (e) {}

      return { success: true, data: questions };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch quiz questions',
        error: error.message,
      };
    }
  }

  @Get('academics/jobs')
  @UseGuards(JwtAuthGuard)
  async getJobs(@Req() req: any) {
    try {
      let jobs = [];
      try {
        jobs = await this.dataSource.query(`
          SELECT j.*, e.company_name 
          FROM jobs j 
          LEFT JOIN employers e ON j.employer_id = e.id 
          ORDER BY j.id DESC LIMIT 50
        `);
      } catch (e) {}

      return { success: true, data: jobs };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch jobs',
        error: error.message,
      };
    }
  }

  @Get('identity/resume')
  @UseGuards(JwtAuthGuard)
  async getResume(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      const studentRes = await this.dataSource.query(
        `
        SELECT s.*, c.course_name 
        FROM students s 
        LEFT JOIN courses c ON s.course_id = c.id 
        WHERE s.id=?
      `,
        [studentId],
      );

      if (!studentRes.length)
        return { success: false, message: 'Student not found' };
      const student = studentRes[0];

      let gamification = {
        current_level: 1,
        current_xp: 0,
        job_xp: 0,
        best_wpm: 0,
      };
      try {
        const gRes = await this.dataSource.query(
          `SELECT * FROM student_gamification WHERE student_id=?`,
          [studentId],
        );
        if (gRes.length) gamification = gRes[0];
      } catch (e) {}

      return {
        success: true,
        data: {
          student,
          gamification,
          bio: student.bio || 'Highly motivated and dedicated student...',
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch resume',
        error: error.message,
      };
    }
  }

  // ==========================================================================
  // PHASE 3: GAMIFICATION & UTILITIES
  // ==========================================================================

  @Get('gamification/trophies')
  @UseGuards(JwtAuthGuard)
  async getTrophies(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      let gamification = {
        current_level: 1,
        current_xp: 0,
        job_xp: 0,
        current_streak: 0,
      };
      try {
        const gRes = await this.dataSource.query(
          `SELECT * FROM student_gamification WHERE student_id=?`,
          [studentId],
        );
        if (gRes.length) gamification = gRes[0];
      } catch (e) {}

      let quizCount = 0;
      try {
        const qRes = await this.dataSource.query(
          `SELECT COUNT(id) as total_won FROM xp_activity_log WHERE student_id=? AND activity_name='Daily Brain Quiz' AND xp_earned > 0`,
          [studentId],
        );
        if (qRes.length) quizCount = qRes[0].total_won || 0;
      } catch (e) {}

      let hasPurchase = false;
      try {
        const pRes = await this.dataSource.query(
          `SELECT id FROM student_purchases WHERE student_id=? LIMIT 1`,
          [studentId],
        );
        if (pRes.length) hasPurchase = true;
      } catch (e) {}

      let hasJob = false;
      try {
        const jRes = await this.dataSource.query(
          `SELECT id FROM job_applications WHERE student_id=? AND LOWER(status)='accepted' LIMIT 1`,
          [studentId],
        );
        if (jRes.length) hasJob = true;
      } catch (e) {}

      const badges = [
        {
          name: 'Rookie Starter',
          desc: 'Join the Shadow Arena.',
          icon: 'military_tech',
          color: '0xFF10B981',
          unlocked: true,
        },
        {
          name: 'Quiz Whiz',
          desc: 'Win the Daily Quiz 30 Times.',
          icon: 'psychology',
          color: '0xFFBB86FC',
          unlocked: quizCount >= 30,
        },
        {
          name: 'First Blood',
          desc: 'Purchase your first Market Drop.',
          icon: 'shopping_cart',
          color: '0xFFEF4444',
          unlocked: hasPurchase,
        },
        {
          name: 'Firestarter',
          desc: 'Maintain a 30-Day Login Streak.',
          icon: 'local_fire_department',
          color: '0xFFF59E0B',
          unlocked: gamification.current_streak >= 30,
        },
        {
          name: 'Level 10 Boss',
          desc: 'Reach Level 10 in Gamification.',
          icon: 'stars',
          color: '0xFF3B82F6',
          unlocked: gamification.current_level >= 10,
        },
        {
          name: 'Hired Professional',
          desc: 'Get Hired for a Job.',
          icon: 'work',
          color: '0xFFEC4899',
          unlocked: hasJob,
        },
      ];

      return { success: true, data: { gamification, badges } };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch trophies',
        error: error.message,
      };
    }
  }

  @Get('gamification/timeline')
  @UseGuards(JwtAuthGuard)
  async getTimeline(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      let logs = [];
      try {
        logs = await this.dataSource.query(
          `SELECT * FROM xp_activity_log WHERE student_id=? ORDER BY id DESC LIMIT 50`,
          [studentId],
        );
      } catch (e) {}
      return { success: true, data: logs };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch timeline',
        error: error.message,
      };
    }
  }

  @Get('utilities/helpdesk')
  @UseGuards(JwtAuthGuard)
  async getHelpdeskTickets(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      let tickets = [];
      try {
        tickets = await this.dataSource.query(
          `SELECT * FROM student_queries WHERE student_id=? ORDER BY id DESC`,
          [studentId],
        );
      } catch (e) {}
      return { success: true, data: tickets };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch tickets',
        error: error.message,
      };
    }
  }

  @Post('utilities/helpdesk')
  @UseGuards(JwtAuthGuard)
  async submitHelpdeskTicket(@Req() req: any, @Body() body: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    const { subject, message } = body;
    if (!subject || !message)
      return { success: false, message: 'Subject and message are required' };

    try {
      let franchise_id = 1;
      try {
        const sRes = await this.dataSource.query(
          `SELECT franchise_id FROM students WHERE id=?`,
          [studentId],
        );
        if (sRes.length) franchise_id = sRes[0].franchise_id || 1;
      } catch (e) {}

      try {
        await this.dataSource.query(
          `INSERT INTO student_queries (franchise_id, student_id, subject, message, status) VALUES (?, ?, ?, ?, 'Pending')`,
          [franchise_id, studentId, subject, message],
        );
      } catch (e) {
        return {
          success: false,
          message: 'Error inserting ticket',
          error: e.message,
        };
      }
      return { success: true, message: 'Ticket submitted successfully' };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to submit ticket',
        error: error.message,
      };
    }
  }

  @Get('utilities/track-bus')
  @UseGuards(JwtAuthGuard)
  async getBusTracking(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      let busData = null;
      try {
        const qRes = await this.dataSource.query(
          `
          SELECT st.pickup_point, b.id as bus_id, b.bus_number, b.driver_name, b.driver_phone 
          FROM student_transport st 
          JOIN transport_routes r ON st.route_id = r.id 
          JOIN transport_buses b ON r.bus_id = b.id 
          WHERE st.student_id=?
        `,
          [studentId],
        );
        if (qRes.length) busData = qRes[0];
      } catch (e) {}

      if (!busData)
        return { success: false, message: 'No bus assigned to your account.' };

      return { success: true, data: busData };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch bus details',
        error: error.message,
      };
    }
  }

  @Get('utilities/referral')
  @UseGuards(JwtAuthGuard)
  async getReferral(@Req() req: any) {
    const studentId = req.user.sub || req.user.userId || req.user.id;
    try {
      let studentData = {
        name: 'Operative',
        custom_domain: '',
        subdomain: '',
        branch_name: '',
      };
      try {
        const sRes = await this.dataSource.query(
          `
          SELECT s.name, f.branch_name, f.subdomain, f.custom_domain 
          FROM students s 
          LEFT JOIN franchises f ON s.franchise_id = f.id 
          WHERE s.id=?
        `,
          [studentId],
        );
        if (sRes.length) studentData = sRes[0];
      } catch (e) {}

      let domain = 'ictcomputereducation.com';
      if (studentData.custom_domain) {
        domain = studentData.custom_domain;
      } else if (studentData.subdomain) {
        domain = studentData.subdomain + '.ictcomputereducation.com';
      }

      const referralLink = `https://${domain}/online_admission.php?ref=${studentId}`;

      return {
        success: true,
        data: {
          referral_link: referralLink,
          branch_name: studentData.branch_name || 'ICT Computer Education',
          student_name: studentData.name,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch referral details',
        error: error.message,
      };
    }
  }
}
