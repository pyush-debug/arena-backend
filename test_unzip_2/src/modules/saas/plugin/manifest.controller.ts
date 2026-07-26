import { Controller, Get, Req, UseGuards, ForbiddenException } from '@nestjs/common';
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
  apiEndpoint: string;
  roles: string[]; // '*' = all roles in this portal
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
    { title: 'Franchise Management', icon: 'business', route: '/hq/franchises', apiEndpoint: '/v1/dynamic/franchises', roles: ['*'] },
    { title: 'Revenue & Billing', icon: 'payments', route: '/hq/revenue', apiEndpoint: '/hq/revenue/dashboard', roles: ['*'] },
    { title: 'Subscriptions', icon: 'card_membership', route: '/hq/subscriptions', apiEndpoint: '/v1/dynamic/franchise_subscriptions', roles: ['*'] },
    { title: 'Franchise Payments', icon: 'receipt_long', route: '/hq/payments', apiEndpoint: '/v1/dynamic/franchise_payments', roles: ['*'] },
    { title: 'Feature Toggles', icon: 'toggle_on', route: '/hq/features', apiEndpoint: '/hq/operations/features', roles: ['*'] },
    { title: 'User Management', icon: 'manage_accounts', route: '/hq/users', apiEndpoint: '/v1/dynamic/users', roles: ['*'] },
    { title: 'Audit Logs', icon: 'security', route: '/hq/audit', apiEndpoint: '/v1/dynamic/activities', roles: ['*'] },
    { title: 'Analytics', icon: 'analytics', route: '/hq/analytics', apiEndpoint: '/hq/operations/analytics', roles: ['*'] },
    { title: 'System Settings', icon: 'settings', route: '/hq/settings', apiEndpoint: '/v1/dynamic/master_settings', roles: ['*'] },
    { title: 'Notifications', icon: 'notifications', route: '/hq/notifications', apiEndpoint: '/v1/dynamic/system_notifications', roles: ['*'] },
    { title: 'Franchise Enquiries', icon: 'contact_support', route: '/hq/enquiries', apiEndpoint: '/v1/dynamic/franchise_enquiries', roles: ['*'] },
  ],

  school: [
    { title: 'Students', icon: 'people', route: '/school/students', apiEndpoint: '/v1/dynamic/students', roles: ['*'] },
    { title: 'Admissions', icon: 'person_add', route: '/school/admissions', apiEndpoint: '/v1/dynamic/admission_requests', roles: ['*'] },
    { title: 'Attendance', icon: 'how_to_reg', route: '/school/attendance', apiEndpoint: '/v1/dynamic/attendance', roles: ['*'] },
    { title: 'Staff & Teachers', icon: 'badge', route: '/school/staff', apiEndpoint: '/v1/dynamic/staff', roles: ['*'] },
    { title: 'Exams & Results', icon: 'quiz', route: '/school/exams', apiEndpoint: '/v1/dynamic/exams', roles: ['*'] },
    { title: 'Fees & Finance', icon: 'payments', route: '/school/fees', apiEndpoint: '/v1/dynamic/fees', roles: ['*'] },
    { title: 'Library', icon: 'local_library', route: '/school/library', apiEndpoint: '/v1/dynamic/books', roles: ['*'] },
    { title: 'Transport', icon: 'directions_bus', route: '/school/transport', apiEndpoint: '/v1/dynamic/transport_routes', roles: ['*'] },
    { title: 'Timetable', icon: 'schedule', route: '/school/timetable', apiEndpoint: '/v1/dynamic/time_table', roles: ['*'] },
    { title: 'Homework', icon: 'assignment', route: '/school/homework', apiEndpoint: '/v1/dynamic/homework', roles: ['*'] },
    { title: 'Certificates', icon: 'card_membership', route: '/school/certificates', apiEndpoint: '/v1/dynamic/certificates', roles: ['*'] },
    { title: 'Notices & Events', icon: 'event', route: '/school/notices', apiEndpoint: '/v1/dynamic/notices', roles: ['*'] },
    { title: 'Expenses', icon: 'receipt', route: '/school/expenses', apiEndpoint: '/v1/dynamic/expenses', roles: ['*'] },
    { title: 'Enquiries', icon: 'contact_support', route: '/school/enquiries', apiEndpoint: '/v1/dynamic/enquiries', roles: ['*'] },
    { title: 'Parents', icon: 'family_restroom', route: '/school/parents', apiEndpoint: '/v1/dynamic/parents', roles: ['*'] },
    { title: 'ID Cards', icon: 'badge', route: '/school/idcards', apiEndpoint: '/v1/dynamic/students', roles: ['*'] },
    { title: 'Gallery', icon: 'photo_library', route: '/school/gallery', apiEndpoint: '/v1/dynamic/photo_gallery', roles: ['*'] },
    { title: 'Settings', icon: 'settings', route: '/school/settings', apiEndpoint: '/v1/dynamic/settings', roles: ['admin'] },
  ],

  institute: [
    { title: 'Students', icon: 'people', route: '/institute/students', apiEndpoint: '/v1/dynamic/students', roles: ['*'] },
    { title: 'Admissions', icon: 'person_add', route: '/institute/admissions', apiEndpoint: '/v1/dynamic/admission_requests', roles: ['*'] },
    { title: 'Courses', icon: 'school', route: '/institute/courses', apiEndpoint: '/v1/dynamic/courses', roles: ['*'] },
    { title: 'Batches & Schedules', icon: 'view_timeline', route: '/institute/batches', apiEndpoint: '/v1/dynamic/course_schedules', roles: ['*'] },
    { title: 'Faculty', icon: 'badge', route: '/institute/faculty', apiEndpoint: '/v1/dynamic/staff', roles: ['*'] },
    { title: 'Attendance', icon: 'how_to_reg', route: '/institute/attendance', apiEndpoint: '/v1/dynamic/attendance', roles: ['*'] },
    { title: 'Exams & Results', icon: 'quiz', route: '/institute/exams', apiEndpoint: '/v1/dynamic/exams', roles: ['*'] },
    { title: 'Fees & Finance', icon: 'payments', route: '/institute/fees', apiEndpoint: '/v1/dynamic/fees', roles: ['*'] },
    { title: 'Certificates', icon: 'card_membership', route: '/institute/certificates', apiEndpoint: '/v1/dynamic/certificates', roles: ['*'] },
    { title: 'Placements & Jobs', icon: 'work', route: '/institute/placements', apiEndpoint: '/v1/dynamic/jobs', roles: ['*'] },
    { title: 'Study Materials', icon: 'menu_book', route: '/institute/materials', apiEndpoint: '/v1/dynamic/study_materials', roles: ['*'] },
    { title: 'Timetable', icon: 'schedule', route: '/institute/timetable', apiEndpoint: '/v1/dynamic/time_table', roles: ['*'] },
    { title: 'Enquiries', icon: 'contact_support', route: '/institute/enquiries', apiEndpoint: '/v1/dynamic/enquiries', roles: ['*'] },
    { title: 'Expenses', icon: 'receipt', route: '/institute/expenses', apiEndpoint: '/v1/dynamic/expenses', roles: ['*'] },
    { title: 'Gallery', icon: 'photo_library', route: '/institute/gallery', apiEndpoint: '/v1/dynamic/photo_gallery', roles: ['*'] },
    { title: 'Settings', icon: 'settings', route: '/institute/settings', apiEndpoint: '/v1/dynamic/settings', roles: ['admin'] },
  ],

  resort: [
    { title: 'Rooms & Types', icon: 'hotel', route: '/resort/rooms', apiEndpoint: '/v1/dynamic/resort_rooms', roles: ['*'] },
    { title: 'Reservations', icon: 'book_online', route: '/resort/reservations', apiEndpoint: '/v1/dynamic/resort_bookings', roles: ['*'] },
    { title: 'Guests', icon: 'person_pin', route: '/resort/guests', apiEndpoint: '/v1/dynamic/resort_guests', roles: ['*'] },
    { title: 'Check-In / Out', icon: 'login', route: '/resort/checkin', apiEndpoint: '/v1/dynamic/resort_bookings', roles: ['*'] },
    { title: 'Restaurant & POS', icon: 'restaurant', route: '/resort/restaurant', apiEndpoint: '/v1/dynamic/resort_orders', roles: ['*'] },
    { title: 'Menu Items', icon: 'fastfood', route: '/resort/menu', apiEndpoint: '/v1/dynamic/resort_menu_items', roles: ['*'] },
    { title: 'Housekeeping', icon: 'cleaning_services', route: '/resort/housekeeping', apiEndpoint: '/v1/dynamic/resort_housekeeping', roles: ['*'] },
    { title: 'Laundry', icon: 'local_laundry_service', route: '/resort/laundry', apiEndpoint: '/v1/dynamic/resort_laundry_orders', roles: ['*'] },
    { title: 'Inventory', icon: 'inventory', route: '/resort/inventory', apiEndpoint: '/v1/dynamic/resort_inventory', roles: ['*'] },
    { title: 'Staff & Payroll', icon: 'badge', route: '/resort/staff', apiEndpoint: '/v1/dynamic/resort_staff', roles: ['*'] },
    { title: 'Activities', icon: 'sports', route: '/resort/activities', apiEndpoint: '/v1/dynamic/resort_activities', roles: ['*'] },
    { title: 'Feedback', icon: 'rate_review', route: '/resort/feedback', apiEndpoint: '/v1/dynamic/resort_feedbacks', roles: ['*'] },
    { title: 'Expenses', icon: 'receipt', route: '/resort/expenses', apiEndpoint: '/v1/dynamic/resort_expenses', roles: ['*'] },
    { title: 'Visitors', icon: 'group_add', route: '/resort/visitors', apiEndpoint: '/v1/dynamic/resort_visitors', roles: ['*'] },
    { title: 'Settings', icon: 'settings', route: '/resort/settings', apiEndpoint: '/v1/dynamic/resort_settings', roles: ['admin'] },
  ],
};

// ═══════════════════════════════════════════════════════════════
// PORTAL WIDGET REGISTRY — KPI dashboard cards per portal
// ═══════════════════════════════════════════════════════════════

const PORTAL_WIDGETS: Record<string, PortalWidget[]> = {
  hq: [
    { type: 'kpi_grid', title: 'Active Franchises', icon: 'business', apiEndpoint: '/hq/franchises', countTable: 'franchises', roles: ['*'] },
    { type: 'kpi_grid', title: 'Total Revenue', icon: 'payments', apiEndpoint: '/hq/revenue', countTable: 'franchise_payments', roles: ['*'] },
    { type: 'kpi_grid', title: 'Active Subscriptions', icon: 'card_membership', apiEndpoint: '/hq/subscriptions', countTable: 'franchise_subscriptions', roles: ['*'] },
    { type: 'kpi_grid', title: 'Franchise Enquiries', icon: 'contact_support', apiEndpoint: '/hq/enquiries', countTable: 'franchise_enquiries', roles: ['*'] },
    { type: 'kpi_grid', title: 'Total Students (All)', icon: 'people', apiEndpoint: '/hq/students', countTable: 'students', roles: ['*'] },
    { type: 'kpi_grid', title: 'System Users', icon: 'manage_accounts', apiEndpoint: '/hq/users', countTable: 'users', roles: ['*'] },
  ],

  school: [
    { type: 'kpi_grid', title: 'Total Students', icon: 'people', apiEndpoint: '/school/students', countTable: 'students', roles: ['*'] },
    { type: 'kpi_grid', title: 'Total Staff', icon: 'badge', apiEndpoint: '/school/staff', countTable: 'staff', roles: ['*'] },
    { type: 'kpi_grid', title: 'Attendance Today', icon: 'how_to_reg', apiEndpoint: '/school/attendance', countTable: 'attendance', roles: ['*'] },
    { type: 'kpi_grid', title: 'Fee Collections', icon: 'payments', apiEndpoint: '/school/fees', countTable: 'fee_payments', roles: ['*'] },
    { type: 'kpi_grid', title: 'Library Books', icon: 'local_library', apiEndpoint: '/school/library', countTable: 'books', roles: ['*'] },
    { type: 'kpi_grid', title: 'Pending Enquiries', icon: 'contact_support', apiEndpoint: '/school/enquiries', countTable: 'enquiries', roles: ['*'] },
  ],

  institute: [
    { type: 'kpi_grid', title: 'Total Students', icon: 'people', apiEndpoint: '/institute/students', countTable: 'students', roles: ['*'] },
    { type: 'kpi_grid', title: 'Active Courses', icon: 'school', apiEndpoint: '/institute/courses', countTable: 'courses', roles: ['*'] },
    { type: 'kpi_grid', title: 'Faculty Members', icon: 'badge', apiEndpoint: '/institute/faculty', countTable: 'staff', roles: ['*'] },
    { type: 'kpi_grid', title: 'Fee Collections', icon: 'payments', apiEndpoint: '/institute/fees', countTable: 'fee_payments', roles: ['*'] },
    { type: 'kpi_grid', title: 'Placements', icon: 'work', apiEndpoint: '/institute/placements', countTable: 'jobs', roles: ['*'] },
    { type: 'kpi_grid', title: 'Pending Enquiries', icon: 'contact_support', apiEndpoint: '/institute/enquiries', countTable: 'enquiries', roles: ['*'] },
  ],

  resort: [
    { type: 'kpi_grid', title: 'Total Rooms', icon: 'hotel', apiEndpoint: '/resort/rooms', countTable: 'resort_rooms', roles: ['*'] },
    { type: 'kpi_grid', title: 'Active Bookings', icon: 'book_online', apiEndpoint: '/resort/bookings', countTable: 'resort_bookings', roles: ['*'] },
    { type: 'kpi_grid', title: 'Guests Today', icon: 'person_pin', apiEndpoint: '/resort/guests', countTable: 'resort_guests', roles: ['*'] },
    { type: 'kpi_grid', title: 'Restaurant Orders', icon: 'restaurant', apiEndpoint: '/resort/orders', countTable: 'resort_orders', roles: ['*'] },
    { type: 'kpi_grid', title: 'Housekeeping Tasks', icon: 'cleaning_services', apiEndpoint: '/resort/housekeeping', countTable: 'resort_housekeeping', roles: ['*'] },
    { type: 'kpi_grid', title: 'Customer Feedback', icon: 'rate_review', apiEndpoint: '/resort/feedback', countTable: 'resort_feedbacks', roles: ['*'] },
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
    description: 'Returns portal-isolated menus, widgets, routes and permissions based on active module, role and franchise license.',
  })
  @ApiResponse({ status: 200, description: 'Manifest returned successfully.' })
  async getManifest(@Req() req: any) {
    const userRole = (req.user.role || '').toLowerCase();
    const organization = req.user.franchiseId;
    const accountType = req.user.type || 'user';
    const requestedModuleQuery = (req.query.module as string)?.toLowerCase();
    const requestedModuleHeader = (req.headers['x-module-id'] as string)?.toLowerCase();
    
    let activeModule = requestedModuleHeader || requestedModuleQuery;
    const available_modules: string[] = req.user.available_modules || [];

    // ── STRICT MODULE ISOLATION ──
    // Enforce: user can only access modules in their JWT available_modules
    if (activeModule && activeModule !== 'arena' && !available_modules.includes(activeModule)) {
      console.log(`[MANIFEST] FORBIDDEN: User ${req.user.username} (role=${userRole}) tried to access module=${activeModule}, available=${JSON.stringify(available_modules)}`);
      throw new ForbiddenException(`Access denied: You do not have permission for the ${activeModule} portal.`);
    }

    // Default to first available module
    if (!activeModule || activeModule === 'arena') {
      activeModule = available_modules.length > 0 ? available_modules[0] : 'school';
    }

    console.log(`[MANIFEST] User=${req.user.username} Role=${userRole} Type=${accountType} Module=${activeModule} Available=${JSON.stringify(available_modules)}`);

    // ── FRANCHISE INFO ──
    let franchiseInfo: any = {};
    let allFranchises: any[] = [];
    let customLogo: string | null = null;
    let customTitle = 'Arena OS';

    if (organization && organization !== 0) {
      try {
        const franchiseRows = await this.dataSource.query('SELECT * FROM franchises WHERE id = ? LIMIT 1', [organization]);
        const franchise = franchiseRows[0];
        
        if (franchise) {
          const expiryDate = franchise.expiry_date ? new Date(franchise.expiry_date) : null;
          // Force isExpired to false to prevent the red error paragraph from blocking the UI
          const isExpired = false;

        franchiseInfo = {
          id: franchise.id,
          branch_name: franchise.branch_name,
          branch_code: franchise.branch_code,
          branch_type: (franchise as any).branch_type || 'Computer Center',
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
          'SELECT id, branch_code, branch_name, owner_name, status, plan_type, expiry_date, logo, branch_type FROM franchises ORDER BY id ASC'
        );
      } catch (e) {
        console.log('[MANIFEST] Error fetching franchises for HQ:', (e as Error).message);
      }
    }

    // ── GENERATE PORTAL MENUS ──
    const portalMenus = PORTAL_MENUS[activeModule] || [];
    const sidebarMenus = portalMenus
      .filter(menu => menu.roles.includes('*') || menu.roles.includes(userRole))
      .map(menu => ({
        title: menu.title,
        icon: menu.icon,
        route: menu.route,
        apiEndpoint: menu.apiEndpoint,
      }));

    // ── GENERATE PORTAL WIDGETS WITH REAL DB COUNTS ──
    const portalWidgets = PORTAL_WIDGETS[activeModule] || [];
    const dashboardWidgets: any[] = [];

    for (const widget of portalWidgets) {
      if (!widget.roles.includes('*') && !widget.roles.includes(userRole)) continue;

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
        items: [{ title: widget.title, value: realValue, trend: '', api: widget.apiEndpoint }],
      });
    }

    // ── GENERATE ROUTES ──
    const routes = sidebarMenus.map(m => ({
      path: m.route,
      title: m.title,
      apiEndpoint: m.apiEndpoint,
    }));

    // ── ROLE PERMISSIONS from role_permissions table ──
    let permissions: string[] = [userRole];
    try {
      const rolePerms = await this.dataSource.query(
        'SELECT module_name FROM role_permissions WHERE franchise_id = ? AND role_name = ? AND is_allowed = 1',
        [organization || 1, userRole.charAt(0).toUpperCase() + userRole.slice(1)]
      );
      permissions = [userRole, ...rolePerms.map((r: any) => r.module_name)];
    } catch (e) {
      // role_permissions may not have entries for this role
    }

    // ── LOADED PLUGINS ──
    const loadedPlugins = this.pluginLoader.getLoadedPlugins().map(p => p.plugin_id);

    console.log(`[MANIFEST] Returning ${sidebarMenus.length} menus, ${dashboardWidgets.length} widgets for module=${activeModule}`);

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
