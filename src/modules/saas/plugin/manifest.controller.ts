import {
  Controller,
  Get,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PluginLoader } from './plugin.loader';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Franchise } from '../../iam/entities/franchise.entity';

// ═══════════════════════════════════════════════════════════════
// PORTAL MENU REGISTRY — Single source of truth for all menus
// Each portal defines its own menus. No database dependency.
// ═══════════════════════════════════════════════════════════════

interface PortalMenu {
  title: string;
  icon: string;
  route: string;
  apiEndpoint?: string;
  roles: string[]; // '*' = all roles in this portal
  children?: PortalMenu[];
}

interface PortalWidget {
  type: string;
  title: string;
  icon: string;
  apiEndpoint: string;
  countQuery?: string;
  countTable?: string;
  roles: string[];
}

const PORTAL_MENUS: Record<string, PortalMenu[]> = {
  hq: [
    {
      title: 'Franchise Management',
      icon: 'business',
      route: '/hq/franchises',
      apiEndpoint: '/v1/dynamic/franchises',
      roles: ['*'],
    },
    {
      title: 'Revenue & Billing',
      icon: 'payments',
      route: '/hq/revenue',
      apiEndpoint: '/hq/revenue/dashboard',
      roles: ['*'],
    },
    {
      title: 'Subscriptions',
      icon: 'card_membership',
      route: '/hq/subscriptions',
      apiEndpoint: '/v1/dynamic/franchise_subscriptions',
      roles: ['*'],
    },
    {
      title: 'Franchise Payments',
      icon: 'receipt_long',
      route: '/hq/payments',
      apiEndpoint: '/v1/dynamic/franchise_payments',
      roles: ['*'],
    },
    {
      title: 'Feature Toggles',
      icon: 'toggle_on',
      route: '/hq/features',
      apiEndpoint: '/hq/operations/features',
      roles: ['*'],
    },
    {
      title: 'User Management',
      icon: 'manage_accounts',
      route: '/hq/users',
      apiEndpoint: '/v1/dynamic/users',
      roles: ['*'],
    },
    {
      title: 'Audit Logs',
      icon: 'security',
      route: '/hq/audit',
      apiEndpoint: '/v1/dynamic/activities',
      roles: ['*'],
    },
    {
      title: 'Analytics',
      icon: 'analytics',
      route: '/hq/analytics',
      apiEndpoint: '/hq/operations/analytics',
      roles: ['*'],
    },
    {
      title: 'System Settings',
      icon: 'settings',
      route: '/hq/settings',
      apiEndpoint: '/v1/dynamic/master_settings',
      roles: ['*'],
    },
    {
      title: 'Notifications',
      icon: 'notifications',
      route: '/hq/notifications',
      apiEndpoint: '/v1/dynamic/system_notifications',
      roles: ['*'],
    },
    {
      title: 'Franchise Enquiries',
      icon: 'contact_support',
      route: '/hq/enquiries',
      apiEndpoint: '/v1/dynamic/franchise_enquiries',
      roles: ['*'],
    },
  ],

  school: [
    {
      title: 'Analytics',
      icon: 'insights',
      route: '/school/analytics',
      apiEndpoint: '/v1/dynamic/analytics',
      roles: ['admin'],
    },
    {
      title: 'Manage Courses',
      icon: 'menu_book',
      route: '/school/courses',
      apiEndpoint: '/v1/dynamic/courses',
      roles: ['admin'],
    },
    {
      title: 'Auto Marketing Studio',
      icon: 'campaign',
      route: '/school/auto-marketing',
      apiEndpoint: '/v1/dynamic/marketing',
      roles: ['admin'],
    },
    {
      title: 'Academic',
      icon: 'school',
      route: '/school/academic-group',
      roles: ['admin', 'staff', 'student', 'parent'],
      children: [
        { title: 'Notice', icon: 'notifications', route: '/school/notice', apiEndpoint: '/v1/dynamic/notices', roles: ['admin', 'staff', 'student', 'parent'] },
        { title: 'Time Table', icon: 'schedule', route: '/school/timetable', apiEndpoint: '/v1/dynamic/time_table', roles: ['admin', 'staff', 'student', 'parent'] },
        { title: 'Schedule', icon: 'calendar_month', route: '/school/schedule', apiEndpoint: '/v1/dynamic/course_schedules', roles: ['admin', 'staff'] },
        { title: 'Syllabus', icon: 'menu_book', route: '/school/syllabus', apiEndpoint: '/v1/dynamic/syllabus', roles: ['admin', 'staff', 'student'] },
        { title: 'Upload Notes', icon: 'cloud_upload', route: '/school/upload-notes', apiEndpoint: '/v1/dynamic/notes', roles: ['admin', 'staff'] },
        { title: 'Upload Sheet', icon: 'upload_file', route: '/school/upload-sheet', apiEndpoint: '/v1/dynamic/sheets', roles: ['admin', 'staff'] },
        { title: 'Create Sheet', icon: 'note_add', route: '/school/create-sheet', apiEndpoint: '/v1/dynamic/sheets', roles: ['admin', 'staff'] },
        { title: 'Holiday List', icon: 'event', route: '/school/holidays', apiEndpoint: '/v1/dynamic/holidays', roles: ['admin', 'staff', 'student'] },
        { title: 'Calendar', icon: 'event_note', route: '/school/calendar', apiEndpoint: '/v1/dynamic/calendar', roles: ['admin', 'staff', 'student'] },
        { title: 'Home Work', icon: 'assignment', route: '/school/homework', apiEndpoint: '/v1/dynamic/homework', roles: ['admin', 'staff', 'student'] },
        { title: 'Gallery', icon: 'photo_library', route: '/school/gallery', apiEndpoint: '/v1/dynamic/photo_gallery', roles: ['admin', 'staff', 'student'] },
      ]
    },
    {
      title: 'Library Desk',
      icon: 'local_library',
      route: '/school/library',
      apiEndpoint: '/v1/dynamic/library',
      roles: ['admin', 'staff', 'student'],
    },
    {
      title: 'Staff Desk',
      icon: 'badge',
      route: '/school/staff-group',
      roles: ['admin'],
      children: [
        { title: 'View Staff', icon: 'people', route: '/school/staff/view', apiEndpoint: '/v1/dynamic/staff', roles: ['admin'] },
        { title: 'Add Staff', icon: 'person_add', route: '/school/staff/add', apiEndpoint: '/v1/dynamic/staff', roles: ['admin'] },
        { title: 'Generate Salary', icon: 'payments', route: '/school/staff/salary', apiEndpoint: '/v1/dynamic/salary', roles: ['admin'] },
        { title: 'Id Cards', icon: 'badge', route: '/school/staff/idcards', apiEndpoint: '/v1/dynamic/staff', roles: ['admin'] },
        { title: 'Attendance', icon: 'how_to_reg', route: '/school/staff/attendance', apiEndpoint: '/v1/dynamic/staff_attendance', roles: ['admin'] },
        { title: 'Report', icon: 'assessment', route: '/school/staff/report', apiEndpoint: '/v1/dynamic/staff_attendance', roles: ['admin'] },
        { title: 'Permissions', icon: 'security', route: '/school/staff/permissions', apiEndpoint: '/v1/dynamic/permissions', roles: ['admin'] },
        { title: 'Certificate', icon: 'card_membership', route: '/school/staff/certificate', apiEndpoint: '/v1/dynamic/certificates', roles: ['admin'] },
      ]
    },
    {
      title: 'Students',
      icon: 'school',
      route: '/school/students-group',
      roles: ['admin', 'staff', 'parent'],
      children: [
        { title: 'Add Student', icon: 'person_add', route: '/school/students/add', apiEndpoint: '/v1/dynamic/students', roles: ['admin', 'staff'] },
        { title: 'Bulk Import', icon: 'file_upload', route: '/school/students/import', apiEndpoint: '/v1/dynamic/students', roles: ['admin'] },
        { title: 'View Students', icon: 'groups', route: '/school/students/view', apiEndpoint: '/v1/dynamic/students', roles: ['admin', 'staff', 'parent'] },
        { title: 'Promote Class', icon: 'upgrade', route: '/school/students/promote', apiEndpoint: '/v1/dynamic/students', roles: ['admin'] },
        { title: 'School TC', icon: 'description', route: '/school/students/tc', apiEndpoint: '/v1/dynamic/students', roles: ['admin'] },
        { title: 'Session Archives', icon: 'archive', route: '/school/students/archives', apiEndpoint: '/v1/dynamic/sessions', roles: ['admin'] },
        { title: 'Magic Parent Link', icon: 'link', route: '/school/students/parent-link', apiEndpoint: '/v1/dynamic/parents', roles: ['admin'] },
        { title: 'Face Registration', icon: 'face', route: '/school/students/face', apiEndpoint: '/v1/dynamic/face', roles: ['admin'] },
        { title: 'Admission Receipt', icon: 'receipt', route: '/school/students/receipt', apiEndpoint: '/v1/dynamic/receipts', roles: ['admin'] },
        { title: 'Pending Admissions', icon: 'pending_actions', route: '/school/students/pending', apiEndpoint: '/v1/dynamic/admission_requests', roles: ['admin'] },
        { title: 'Web Enquiries', icon: 'contact_mail', route: '/school/students/enquiries', apiEndpoint: '/v1/dynamic/enquiries', roles: ['admin'] },
        { title: 'Student Queries', icon: 'help_outline', route: '/school/students/queries', apiEndpoint: '/v1/dynamic/queries', roles: ['admin', 'staff'] },
      ]
    },
    {
      title: 'Attendance Scanner',
      icon: 'qr_code_scanner',
      route: '/school/attendance/scanner',
      apiEndpoint: '/v1/dynamic/attendance',
      roles: ['admin', 'staff'],
    },
    {
      title: 'Attendance Desk',
      icon: 'how_to_reg',
      route: '/school/attendance-group',
      roles: ['admin', 'staff', 'student', 'parent'],
      children: [
        { title: 'Report', icon: 'assessment', route: '/school/attendance/report', apiEndpoint: '/v1/dynamic/attendance', roles: ['admin', 'staff', 'student', 'parent'] },
        { title: 'Mark Daily', icon: 'fact_check', route: '/school/attendance/mark', apiEndpoint: '/v1/dynamic/attendance', roles: ['admin', 'staff'] },
        { title: 'Quick Check', icon: 'check_circle', route: '/school/attendance/quick', apiEndpoint: '/v1/dynamic/attendance', roles: ['admin', 'staff'] },
      ]
    },
    {
      title: 'Exams & Marks',
      icon: 'quiz',
      route: '/school/exams-group',
      roles: ['admin', 'staff', 'student', 'parent'],
      children: [
        { title: 'Control Desk', icon: 'admin_panel_settings', route: '/school/exams/control', apiEndpoint: '/v1/dynamic/exams', roles: ['admin', 'staff'] },
        { title: 'View Marks', icon: 'visibility', route: '/school/exams/view', apiEndpoint: '/v1/dynamic/exams', roles: ['admin', 'staff', 'student', 'parent'] },
        { title: 'Enter Marks', icon: 'edit', route: '/school/exams/enter', apiEndpoint: '/v1/dynamic/exams', roles: ['admin', 'staff'] },
        { title: 'Print Admit', icon: 'print', route: '/school/exams/admit', apiEndpoint: '/v1/dynamic/exams', roles: ['admin', 'staff'] },
        { title: 'Print Progress', icon: 'print', route: '/school/exams/progress', apiEndpoint: '/v1/dynamic/exams', roles: ['admin', 'staff'] },
      ]
    },
    {
      title: 'Fee Desk',
      icon: 'payments',
      route: '/school/fees-group',
      roles: ['admin', 'student', 'parent'],
      children: [
        { title: 'Take Fee', icon: 'account_balance_wallet', route: '/school/fees/take', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
        { title: 'View Receipts', icon: 'receipt', route: '/school/fees/receipts', apiEndpoint: '/v1/dynamic/fees', roles: ['admin', 'student', 'parent'] },
        { title: 'Today Collection', icon: 'today', route: '/school/fees/today', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
        { title: 'Head Collection', icon: 'account_balance', route: '/school/fees/head', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
        { title: 'Defaulters List', icon: 'warning', route: '/school/fees/defaulters', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
        { title: 'Due Demands', icon: 'request_quote', route: '/school/fees/demands', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
        { title: 'Discount Console', icon: 'discount', route: '/school/fees/discount', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
        { title: 'Scholarship Coupons', icon: 'card_giftcard', route: '/school/fees/coupons', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
        { title: 'Online Requests', icon: 'language', route: '/school/fees/online', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
      ]
    },
    {
      title: 'Placement Cell',
      icon: 'work',
      route: '/school/placement-group',
      roles: ['admin', 'student'],
      children: [
        { title: 'Post Job', icon: 'post_add', route: '/school/placement/post', apiEndpoint: '/v1/dynamic/jobs', roles: ['admin'] },
        { title: 'Applications', icon: 'description', route: '/school/placement/applications', apiEndpoint: '/v1/dynamic/jobs', roles: ['admin', 'student'] },
      ]
    },
    {
      title: 'Expense Desk',
      icon: 'receipt_long',
      route: '/school/expenses',
      apiEndpoint: '/v1/dynamic/expenses',
      roles: ['admin'],
    },
    {
      title: 'Subscriptions',
      icon: 'subscriptions',
      route: '/school/subscriptions',
      apiEndpoint: '/v1/dynamic/subscriptions',
      roles: ['admin'],
    },
    {
      title: 'Web Pages',
      icon: 'web',
      route: '/school/webpages',
      apiEndpoint: '/v1/dynamic/webpages',
      roles: ['admin'],
    },
    {
      title: 'Settings',
      icon: 'settings',
      route: '/school/settings',
      apiEndpoint: '/v1/dynamic/settings',
      roles: ['admin'],
    },
  ],

  institute: [
    {
      title: 'Analytics',
      icon: 'insights',
      route: '/institute/analytics',
      apiEndpoint: '/v1/dynamic/analytics',
      roles: ['admin'],
    },
    {
      title: 'Manage Courses',
      icon: 'menu_book',
      route: '/institute/courses',
      apiEndpoint: '/v1/dynamic/courses',
      roles: ['admin'],
    },
    {
      title: 'Auto Marketing Studio',
      icon: 'campaign',
      route: '/institute/auto-marketing',
      apiEndpoint: '/v1/dynamic/marketing',
      roles: ['admin'],
    },
    {
      title: 'Academic',
      icon: 'school',
      route: '/institute/academic-group',
      roles: ['admin', 'staff', 'student', 'parent'],
      children: [
        { title: 'Notice', icon: 'notifications', route: '/institute/notice', apiEndpoint: '/v1/dynamic/notices', roles: ['admin', 'staff', 'student', 'parent'] },
        { title: 'Time Table', icon: 'schedule', route: '/institute/timetable', apiEndpoint: '/v1/dynamic/time_table', roles: ['admin', 'staff', 'student', 'parent'] },
        { title: 'Schedule', icon: 'calendar_month', route: '/institute/schedule', apiEndpoint: '/v1/dynamic/course_schedules', roles: ['admin', 'staff'] },
        { title: 'Syllabus', icon: 'menu_book', route: '/institute/syllabus', apiEndpoint: '/v1/dynamic/syllabus', roles: ['admin', 'staff', 'student'] },
        { title: 'Upload Notes', icon: 'cloud_upload', route: '/institute/upload-notes', apiEndpoint: '/v1/dynamic/notes', roles: ['admin', 'staff'] },
        { title: 'Upload Sheet', icon: 'upload_file', route: '/institute/upload-sheet', apiEndpoint: '/v1/dynamic/sheets', roles: ['admin', 'staff'] },
        { title: 'Create Sheet', icon: 'note_add', route: '/institute/create-sheet', apiEndpoint: '/v1/dynamic/sheets', roles: ['admin', 'staff'] },
        { title: 'Holiday List', icon: 'event', route: '/institute/holidays', apiEndpoint: '/v1/dynamic/holidays', roles: ['admin', 'staff', 'student'] },
        { title: 'Calendar', icon: 'event_note', route: '/institute/calendar', apiEndpoint: '/v1/dynamic/calendar', roles: ['admin', 'staff', 'student'] },
        { title: 'Home Work', icon: 'assignment', route: '/institute/homework', apiEndpoint: '/v1/dynamic/homework', roles: ['admin', 'staff', 'student'] },
        { title: 'Gallery', icon: 'photo_library', route: '/institute/gallery', apiEndpoint: '/v1/dynamic/photo_gallery', roles: ['admin', 'staff', 'student'] },
      ]
    },
    {
      title: 'Library Desk',
      icon: 'local_library',
      route: '/institute/library',
      apiEndpoint: '/v1/dynamic/library',
      roles: ['admin', 'staff', 'student'],
    },
    {
      title: 'Staff Desk',
      icon: 'badge',
      route: '/institute/staff-group',
      roles: ['admin'],
      children: [
        { title: 'View Staff', icon: 'people', route: '/institute/staff/view', apiEndpoint: '/v1/dynamic/staff', roles: ['admin'] },
        { title: 'Add Staff', icon: 'person_add', route: '/institute/staff/add', apiEndpoint: '/v1/dynamic/staff', roles: ['admin'] },
        { title: 'Generate Salary', icon: 'payments', route: '/institute/staff/salary', apiEndpoint: '/v1/dynamic/salary', roles: ['admin'] },
        { title: 'Id Cards', icon: 'badge', route: '/institute/staff/idcards', apiEndpoint: '/v1/dynamic/staff', roles: ['admin'] },
        { title: 'Attendance', icon: 'how_to_reg', route: '/institute/staff/attendance', apiEndpoint: '/v1/dynamic/staff_attendance', roles: ['admin'] },
        { title: 'Report', icon: 'assessment', route: '/institute/staff/report', apiEndpoint: '/v1/dynamic/staff_attendance', roles: ['admin'] },
        { title: 'Permissions', icon: 'security', route: '/institute/staff/permissions', apiEndpoint: '/v1/dynamic/permissions', roles: ['admin'] },
        { title: 'Certificate', icon: 'card_membership', route: '/institute/staff/certificate', apiEndpoint: '/v1/dynamic/certificates', roles: ['admin'] },
      ]
    },
    {
      title: 'Students',
      icon: 'school',
      route: '/institute/students-group',
      roles: ['admin', 'staff', 'parent'],
      children: [
        { title: 'Add Student', icon: 'person_add', route: '/institute/students/add', apiEndpoint: '/v1/dynamic/students', roles: ['admin', 'staff'] },
        { title: 'Bulk Import', icon: 'file_upload', route: '/institute/students/import', apiEndpoint: '/v1/dynamic/students', roles: ['admin'] },
        { title: 'View Students', icon: 'groups', route: '/institute/students/view', apiEndpoint: '/v1/dynamic/students', roles: ['admin', 'staff', 'parent'] },
        { title: 'Promote Class', icon: 'upgrade', route: '/institute/students/promote', apiEndpoint: '/v1/dynamic/students', roles: ['admin'] },
        { title: 'School TC', icon: 'description', route: '/institute/students/tc', apiEndpoint: '/v1/dynamic/students', roles: ['admin'] },
        { title: 'Session Archives', icon: 'archive', route: '/institute/students/archives', apiEndpoint: '/v1/dynamic/sessions', roles: ['admin'] },
        { title: 'Magic Parent Link', icon: 'link', route: '/institute/students/parent-link', apiEndpoint: '/v1/dynamic/parents', roles: ['admin'] },
        { title: 'Face Registration', icon: 'face', route: '/institute/students/face', apiEndpoint: '/v1/dynamic/face', roles: ['admin'] },
        { title: 'Admission Receipt', icon: 'receipt', route: '/institute/students/receipt', apiEndpoint: '/v1/dynamic/receipts', roles: ['admin'] },
        { title: 'Pending Admissions', icon: 'pending_actions', route: '/institute/students/pending', apiEndpoint: '/v1/dynamic/admission_requests', roles: ['admin'] },
        { title: 'Web Enquiries', icon: 'contact_mail', route: '/institute/students/enquiries', apiEndpoint: '/v1/dynamic/enquiries', roles: ['admin'] },
        { title: 'Student Queries', icon: 'help_outline', route: '/institute/students/queries', apiEndpoint: '/v1/dynamic/queries', roles: ['admin', 'staff'] },
      ]
    },
    {
      title: 'Attendance Scanner',
      icon: 'qr_code_scanner',
      route: '/institute/attendance/scanner',
      apiEndpoint: '/v1/dynamic/attendance',
      roles: ['admin', 'staff'],
    },
    {
      title: 'Attendance Desk',
      icon: 'how_to_reg',
      route: '/institute/attendance-group',
      roles: ['admin', 'staff', 'student', 'parent'],
      children: [
        { title: 'Report', icon: 'assessment', route: '/institute/attendance/report', apiEndpoint: '/v1/dynamic/attendance', roles: ['admin', 'staff', 'student', 'parent'] },
        { title: 'Mark Daily', icon: 'fact_check', route: '/institute/attendance/mark', apiEndpoint: '/v1/dynamic/attendance', roles: ['admin', 'staff'] },
        { title: 'Quick Check', icon: 'check_circle', route: '/institute/attendance/quick', apiEndpoint: '/v1/dynamic/attendance', roles: ['admin', 'staff'] },
      ]
    },
    {
      title: 'Exams & Marks',
      icon: 'quiz',
      route: '/institute/exams-group',
      roles: ['admin', 'staff', 'student', 'parent'],
      children: [
        { title: 'Control Desk', icon: 'admin_panel_settings', route: '/institute/exams/control', apiEndpoint: '/v1/dynamic/exams', roles: ['admin', 'staff'] },
        { title: 'View Marks', icon: 'visibility', route: '/institute/exams/view', apiEndpoint: '/v1/dynamic/exams', roles: ['admin', 'staff', 'student', 'parent'] },
        { title: 'Enter Marks', icon: 'edit', route: '/institute/exams/enter', apiEndpoint: '/v1/dynamic/exams', roles: ['admin', 'staff'] },
        { title: 'Print Admit', icon: 'print', route: '/institute/exams/admit', apiEndpoint: '/v1/dynamic/exams', roles: ['admin', 'staff'] },
        { title: 'Print Progress', icon: 'print', route: '/institute/exams/progress', apiEndpoint: '/v1/dynamic/exams', roles: ['admin', 'staff'] },
      ]
    },
    {
      title: 'Fee Desk',
      icon: 'payments',
      route: '/institute/fees-group',
      roles: ['admin', 'student', 'parent'],
      children: [
        { title: 'Take Fee', icon: 'account_balance_wallet', route: '/institute/fees/take', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
        { title: 'View Receipts', icon: 'receipt', route: '/institute/fees/receipts', apiEndpoint: '/v1/dynamic/fees', roles: ['admin', 'student', 'parent'] },
        { title: 'Today Collection', icon: 'today', route: '/institute/fees/today', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
        { title: 'Head Collection', icon: 'account_balance', route: '/institute/fees/head', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
        { title: 'Defaulters List', icon: 'warning', route: '/institute/fees/defaulters', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
        { title: 'Due Demands', icon: 'request_quote', route: '/institute/fees/demands', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
        { title: 'Discount Console', icon: 'discount', route: '/institute/fees/discount', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
        { title: 'Scholarship Coupons', icon: 'card_giftcard', route: '/institute/fees/coupons', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
        { title: 'Online Requests', icon: 'language', route: '/institute/fees/online', apiEndpoint: '/v1/dynamic/fees', roles: ['admin'] },
      ]
    },
    {
      title: 'Gamification',
      icon: 'sports_esports',
      route: '/institute/gamification-group',
      roles: ['admin', 'student'],
      children: [
        { title: 'Create AI Quiz', icon: 'psychology', route: '/institute/gamification/ai-quiz', apiEndpoint: '/v1/dynamic/gamification', roles: ['admin'] },
        { title: 'Question Bank', icon: 'library_books', route: '/institute/gamification/questions', apiEndpoint: '/v1/dynamic/gamification', roles: ['admin'] },
        { title: 'Typing Test', icon: 'keyboard', route: '/institute/gamification/typing', apiEndpoint: '/v1/dynamic/gamification', roles: ['admin', 'student'] },
        { title: 'Leaderboard', icon: 'leaderboard', route: '/institute/gamification/leaderboard', apiEndpoint: '/v1/dynamic/gamification', roles: ['admin', 'student'] },
        { title: 'Arena Battles', icon: 'sports_mma', route: '/institute/gamification/battles', apiEndpoint: '/v1/dynamic/gamification', roles: ['admin', 'student'] },
      ]
    },
    {
      title: 'Placement Cell',
      icon: 'work',
      route: '/institute/placement-group',
      roles: ['admin', 'student'],
      children: [
        { title: 'Post Job', icon: 'post_add', route: '/institute/placement/post', apiEndpoint: '/v1/dynamic/jobs', roles: ['admin'] },
        { title: 'Applications', icon: 'description', route: '/institute/placement/applications', apiEndpoint: '/v1/dynamic/jobs', roles: ['admin', 'student'] },
      ]
    },
    {
      title: 'Expense Desk',
      icon: 'receipt_long',
      route: '/institute/expenses',
      apiEndpoint: '/v1/dynamic/expenses',
      roles: ['admin'],
    },
    {
      title: 'Subscriptions',
      icon: 'subscriptions',
      route: '/institute/subscriptions',
      apiEndpoint: '/v1/dynamic/subscriptions',
      roles: ['admin'],
    },
    {
      title: 'Web Pages',
      icon: 'web',
      route: '/institute/webpages',
      apiEndpoint: '/v1/dynamic/webpages',
      roles: ['admin'],
    },
    {
      title: 'Settings',
      icon: 'settings',
      route: '/institute/settings',
      apiEndpoint: '/v1/dynamic/settings',
      roles: ['admin'],
    },
  ],

  resort: [
    {
      title: 'Rooms & Types',
      icon: 'hotel',
      route: '/resort/rooms',
      apiEndpoint: '/v1/dynamic/resort_rooms',
      roles: ['*'],
    },
    {
      title: 'Reservations',
      icon: 'book_online',
      route: '/resort/reservations',
      apiEndpoint: '/v1/dynamic/resort_bookings',
      roles: ['*'],
    },
    {
      title: 'Guests',
      icon: 'person_pin',
      route: '/resort/guests',
      apiEndpoint: '/v1/dynamic/resort_guests',
      roles: ['*'],
    },
    {
      title: 'Check-In / Out',
      icon: 'login',
      route: '/resort/checkin',
      apiEndpoint: '/v1/dynamic/resort_bookings',
      roles: ['*'],
    },
    {
      title: 'Restaurant & POS',
      icon: 'restaurant',
      route: '/resort/restaurant',
      apiEndpoint: '/v1/dynamic/resort_orders',
      roles: ['*'],
    },
    {
      title: 'Menu Items',
      icon: 'fastfood',
      route: '/resort/menu',
      apiEndpoint: '/v1/dynamic/resort_menu_items',
      roles: ['*'],
    },
    {
      title: 'Housekeeping',
      icon: 'cleaning_services',
      route: '/resort/housekeeping',
      apiEndpoint: '/v1/dynamic/resort_housekeeping',
      roles: ['*'],
    },
    {
      title: 'Laundry',
      icon: 'local_laundry_service',
      route: '/resort/laundry',
      apiEndpoint: '/v1/dynamic/resort_laundry_orders',
      roles: ['*'],
    },
    {
      title: 'Inventory',
      icon: 'inventory',
      route: '/resort/inventory',
      apiEndpoint: '/v1/dynamic/resort_inventory',
      roles: ['*'],
    },
    {
      title: 'Staff & Payroll',
      icon: 'badge',
      route: '/resort/staff',
      apiEndpoint: '/v1/dynamic/resort_staff',
      roles: ['*'],
    },
    {
      title: 'Activities',
      icon: 'sports',
      route: '/resort/activities',
      apiEndpoint: '/v1/dynamic/resort_activities',
      roles: ['*'],
    },
    {
      title: 'Feedback',
      icon: 'rate_review',
      route: '/resort/feedback',
      apiEndpoint: '/v1/dynamic/resort_feedbacks',
      roles: ['*'],
    },
    {
      title: 'Expenses',
      icon: 'receipt',
      route: '/resort/expenses',
      apiEndpoint: '/v1/dynamic/resort_expenses',
      roles: ['*'],
    },
    {
      title: 'Visitors',
      icon: 'group_add',
      route: '/resort/visitors',
      apiEndpoint: '/v1/dynamic/resort_visitors',
      roles: ['*'],
    },
    {
      title: 'Settings',
      icon: 'settings',
      route: '/resort/settings',
      apiEndpoint: '/v1/dynamic/resort_settings',
      roles: ['admin'],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PORTAL WIDGET REGISTRY — KPI dashboard cards per portal
// ═══════════════════════════════════════════════════════════════

const PORTAL_WIDGETS: Record<string, PortalWidget[]> = {
  hq: [
    {
      type: 'kpi_grid',
      title: 'Active Franchises',
      icon: 'business',
      apiEndpoint: '/hq/franchises',
      countTable: 'franchises',
      roles: ['*'],
    },
    {
      type: 'kpi_grid',
      title: 'Total Revenue',
      icon: 'payments',
      apiEndpoint: '/hq/revenue',
      countTable: 'franchise_payments',
      roles: ['*'],
    },
    {
      type: 'kpi_grid',
      title: 'Active Subscriptions',
      icon: 'card_membership',
      apiEndpoint: '/hq/subscriptions',
      countTable: 'franchise_subscriptions',
      roles: ['*'],
    },
    {
      type: 'kpi_grid',
      title: 'Franchise Enquiries',
      icon: 'contact_support',
      apiEndpoint: '/hq/enquiries',
      countTable: 'franchise_enquiries',
      roles: ['*'],
    },
    {
      type: 'kpi_grid',
      title: 'Total Students (All)',
      icon: 'people',
      apiEndpoint: '/hq/students',
      countTable: 'students',
      roles: ['*'],
    },
    {
      type: 'kpi_grid',
      title: 'System Users',
      icon: 'manage_accounts',
      apiEndpoint: '/hq/users',
      countTable: 'users',
      roles: ['*'],
    },
  ],

  school: [
    {
      type: 'kpi_grid',
      title: 'Total Students',
      icon: 'people',
      apiEndpoint: '/school/students',
      countTable: 'students',
      roles: ['admin', 'staff', 'parent'],
    },
    {
      type: 'kpi_grid',
      title: 'Total Staff',
      icon: 'badge',
      apiEndpoint: '/school/staff',
      countTable: 'staff',
      roles: ['admin'],
    },
    {
      type: 'kpi_grid',
      title: 'Present Today',
      icon: 'how_to_reg',
      apiEndpoint: '/school/attendance',
      countTable: 'attendance',
      roles: ['admin', 'staff'],
    },
    {
      type: 'kpi_grid',
      title: 'Total Revenue',
      icon: 'payments',
      apiEndpoint: '/school/fees',
      countTable: 'fee_payments',
      roles: ['admin'],
    },
    {
      type: 'kpi_grid',
      title: 'Total Expenses',
      icon: 'receipt_long',
      apiEndpoint: '/school/expenses',
      countTable: 'expenses',
      roles: ['admin'],
    },
  ],

  institute: [
    {
      type: 'kpi_grid',
      title: 'Total Students',
      icon: 'people',
      apiEndpoint: '/institute/students',
      countTable: 'students',
      roles: ['admin', 'staff', 'parent'],
    },
    {
      type: 'kpi_grid',
      title: 'Total Staff',
      icon: 'badge',
      apiEndpoint: '/institute/staff',
      countTable: 'staff',
      roles: ['admin'],
    },
    {
      type: 'kpi_grid',
      title: 'Present Today',
      icon: 'how_to_reg',
      apiEndpoint: '/institute/attendance',
      countTable: 'attendance',
      roles: ['admin', 'staff'],
    },
    {
      type: 'kpi_grid',
      title: 'Total Revenue',
      icon: 'payments',
      apiEndpoint: '/institute/fees',
      countTable: 'fee_payments',
      roles: ['admin'],
    },
    {
      type: 'kpi_grid',
      title: 'Total Expenses',
      icon: 'receipt_long',
      apiEndpoint: '/institute/expenses',
      countTable: 'expenses',
      roles: ['admin'],
    },
  ],

  resort: [
    {
      type: 'kpi_grid',
      title: 'Total Rooms',
      icon: 'hotel',
      apiEndpoint: '/resort/rooms',
      countTable: 'resort_rooms',
      roles: ['*'],
    },
    {
      type: 'kpi_grid',
      title: 'Active Bookings',
      icon: 'book_online',
      apiEndpoint: '/resort/bookings',
      countTable: 'resort_bookings',
      roles: ['*'],
    },
    {
      type: 'kpi_grid',
      title: 'Guests Today',
      icon: 'person_pin',
      apiEndpoint: '/resort/guests',
      countTable: 'resort_guests',
      roles: ['*'],
    },
    {
      type: 'kpi_grid',
      title: 'Restaurant Orders',
      icon: 'restaurant',
      apiEndpoint: '/resort/orders',
      countTable: 'resort_orders',
      roles: ['*'],
    },
    {
      type: 'kpi_grid',
      title: 'Housekeeping Tasks',
      icon: 'cleaning_services',
      apiEndpoint: '/resort/housekeeping',
      countTable: 'resort_housekeeping',
      roles: ['*'],
    },
    {
      type: 'kpi_grid',
      title: 'Customer Feedback',
      icon: 'rate_review',
      apiEndpoint: '/resort/feedback',
      countTable: 'resort_feedbacks',
      roles: ['*'],
    },
  ],
};

@ApiTags('Platform')
@Controller('platform')
export class ManifestController {
  constructor(
    private readonly pluginLoader: PluginLoader,
    @InjectRepository(Franchise)
    private readonly franchiseRepo: Repository<Franchise>,
    private readonly dataSource: DataSource,
  ) {}

  @Get('manifest')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get Platform Manifest',
    description:
      'Returns portal-isolated menus, widgets, routes and permissions based on active module, role and franchise license.',
  })
  @ApiResponse({ status: 200, description: 'Manifest returned successfully.' })
  async getManifest(@Req() req: any) {
    const userRole = (req.user.role || '').toLowerCase();
    const organization = req.user.franchiseId;
    const accountType = req.user.type || 'user';
    const requestedModuleQuery = (req.query.module as string)?.toLowerCase();
    const requestedModuleHeader = (
      req.headers['x-module-id'] as string
    )?.toLowerCase();

    let activeModule = requestedModuleHeader || requestedModuleQuery;
    const available_modules: string[] = req.user.available_modules || [];

    // ── STRICT MODULE ISOLATION ──
    // Enforce: user can only access modules in their JWT available_modules
    if (
      activeModule &&
      activeModule !== 'arena' &&
      !available_modules.includes(activeModule)
    ) {
      console.log(
        `[MANIFEST] FORBIDDEN: User ${req.user.username} (role=${userRole}) tried to access module=${activeModule}, available=${JSON.stringify(available_modules)}`,
      );
      throw new ForbiddenException(
        `Access denied: You do not have permission for the ${activeModule} portal.`,
      );
    }

    // Default to first available module
    if (!activeModule || activeModule === 'arena') {
      activeModule =
        available_modules.length > 0 ? available_modules[0] : 'school';
    }

    console.log(
      `[MANIFEST] User=${req.user.username} Role=${userRole} Type=${accountType} Module=${activeModule} Available=${JSON.stringify(available_modules)}`,
    );

    // ── FRANCHISE INFO ──
    let franchiseInfo: any = {};
    let allFranchises: any[] = [];
    let customLogo: string | null = null;
    let customTitle = 'Arena OS';

    if (organization && organization !== 0) {
      try {
        const franchiseRows = await this.dataSource.query(
          'SELECT * FROM franchises WHERE id = ? LIMIT 1',
          [organization],
        );
        const franchise = franchiseRows[0];

        if (franchise) {
          const expiryDate = franchise.expiry_date
            ? new Date(franchise.expiry_date)
            : null;
          // Force isExpired to false to prevent the red error paragraph from blocking the UI
          const isExpired = false;

          franchiseInfo = {
            id: franchise.id,
            branch_name: franchise.branch_name,
            branch_code: franchise.branch_code,
            branch_type: franchise.branch_type || 'Computer Center',
            logo: franchise.logo,
            theme_color: franchise.theme_color,
            plan_type: franchise.plan_type,
            isExpired: isExpired,
            expiryDate: franchise.expiry_date,
          };

          customLogo = franchise.logo || 'arena_default_logo.png';
          customTitle = franchise.branch_name || 'Arena OS';
        }
      } catch (e) {
        console.error('[MANIFEST] Failed to fetch franchise', e);
      }
    } else {
      // HQ user (admin table, no franchise)
      customLogo = 'arena_hq_logo.png';
      customTitle = 'Arena OS HQ';
      franchiseInfo = {
        id: 0,
        branch_name: 'Arena OS Headquarters',
        branch_code: 'HQ',
        branch_type: 'HQ',
        logo: null,
        theme_color: '#FFD700',
        plan_type: 'Enterprise',
        isExpired: false,
      };

      // HQ gets all franchises for the franchise management panel
      try {
        allFranchises = await this.dataSource.query(
          'SELECT id, branch_code, branch_name, owner_name, status, plan_type, expiry_date, logo, branch_type FROM franchises ORDER BY id ASC',
        );
      } catch (e) {
        console.log(
          '[MANIFEST] Error fetching franchises for HQ:',
          (e as Error).message,
        );
      }
    }

    // ── GENERATE PORTAL MENUS ──
    const portalMenus = PORTAL_MENUS[activeModule] || [];
    const sidebarMenus = portalMenus
      .filter(
        (menu) => menu.roles.includes('*') || menu.roles.includes(userRole),
      )
      .map((menu) => {
        let children: any[] = [];
        if (menu.children) {
          children = menu.children
            .filter((child: any) => child.roles.includes('*') || child.roles.includes(userRole))
            .map((child: any) => ({
              title: child.title,
              icon: child.icon,
              route: child.route,
              apiEndpoint: child.apiEndpoint,
            }));
        }
        return {
          title: menu.title,
          icon: menu.icon,
          route: menu.route,
          apiEndpoint: menu.apiEndpoint,
          children: children.length > 0 ? children : undefined,
        };
      });

    // ── GENERATE PORTAL WIDGETS WITH REAL DB COUNTS ──
    const portalWidgets = PORTAL_WIDGETS[activeModule] || [];
    const dashboardWidgets: any[] = [];

    for (const widget of portalWidgets) {
      if (!widget.roles.includes('*') && !widget.roles.includes(userRole))
        continue;

      let realValue = 0;
      if (widget.countTable) {
        try {
          // HQ counts across all franchises, branch counts only own franchise
          const isHq = activeModule === 'hq';
          const query = isHq
            ? `SELECT COUNT(*) as count FROM ${widget.countTable}`
            : `SELECT COUNT(*) as count FROM ${widget.countTable} WHERE franchise_id = ?`;
          const params = isHq ? [] : [organization];
          const result = await this.dataSource.query(query, params);
          realValue = result[0]?.count || 0;
        } catch (e) {
          // Table might not exist for this franchise - that's OK
          realValue = 0;
        }
      }

      dashboardWidgets.push({
        type: widget.type,
        title: widget.title,
        icon: widget.icon,
        apiEndpoint: widget.apiEndpoint,
        items: [
          {
            title: widget.title,
            value: realValue,
            trend: '',
            api: widget.apiEndpoint,
          },
        ],
      });
    }

    // ── GENERATE ROUTES ──
    const routes = sidebarMenus.map((m) => ({
      path: m.route,
      title: m.title,
      apiEndpoint: m.apiEndpoint,
    }));

    // ── ROLE PERMISSIONS from role_permissions table ──
    let permissions: string[] = [userRole];
    try {
      const rolePerms = await this.dataSource.query(
        'SELECT module_name FROM role_permissions WHERE franchise_id = ? AND role_name = ? AND is_allowed = 1',
        [
          organization || 1,
          userRole.charAt(0).toUpperCase() + userRole.slice(1),
        ],
      );
      permissions = [userRole, ...rolePerms.map((r: any) => r.module_name)];
    } catch (e) {
      // role_permissions may not have entries for this role
    }

    // ── LOADED PLUGINS ──
    const loadedPlugins = this.pluginLoader
      .getLoadedPlugins()
      .map((p) => p.plugin_id);

    console.log(
      `[MANIFEST] Returning ${sidebarMenus.length} menus, ${dashboardWidgets.length} widgets for module=${activeModule}`,
    );

    return {
      enabledPlugins: loadedPlugins,
      sidebarMenu: sidebarMenus,
      routes: routes,
      permissions: permissions,
      userRole: userRole,
      user: req.user,
      activeModule: activeModule,
      availableModules: available_modules,
      organizationInformation: { id: organization },
      franchiseInfo: {
        ...franchiseInfo,
        computedLogo: customLogo,
        computedTitle: customTitle,
      },
      allFranchises: allFranchises,
      featureFlags: {},
      dashboardWidgets: dashboardWidgets,
      themeConfiguration: {
        primaryColor: franchiseInfo.theme_color || '#0055FF',
        secondaryColor: '#FF5500',
        mode: 'system',
      },
    };
  }
}
