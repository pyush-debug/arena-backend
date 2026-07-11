import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PluginLoader } from './plugin.loader';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Franchise } from '../../iam/entities/franchise.entity';
interface AuthRequest extends Request {
  user: {
    userId: number;
    type: string;
    role: string;
    franchiseId: number;
    username: string;
    sessionId: number;
  };
}

@ApiTags('Platform')
@Controller('platform')
export class ManifestController {
  constructor(
    private readonly pluginLoader: PluginLoader,
    @InjectRepository(Franchise)
    private readonly franchiseRepo: Repository<Franchise>,
  ) {}

  @Get('manifest')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get Platform Manifest',
    description:
      'Returns enabled plugins and dynamic UI sidebar configuration.',
  })
  @ApiResponse({ status: 200, description: 'Manifest returned successfully.' })
  async getManifest(@Req() req: AuthRequest) {
    const plugins = this.pluginLoader.getLoadedPlugins();
    const userRole = req.user.role;
    const organization = req.user.franchiseId;

    const sidebarMenus: any[] = [];
    const routes: any[] = [];
    const dashboardWidgets: any[] = [];

    // Aggregation logic
    for (const plugin of plugins) {
      if (plugin.ui_menus) {
        sidebarMenus.push(...(plugin.ui_menus as any[]));
      }
    }

    // Dynamic UI logic based on Franchise addons
    if (organization) {
      const franchise = await this.franchiseRepo.findOne({ where: { id: organization } });
      if (franchise) {
        if (franchise.addon_institute_erp === 1) {
          sidebarMenus.push(
            { title: 'Library Desk', icon: 'local_library', route: '/library', apiEndpoint: '/v1/dynamic/library' },
            { title: 'Staff Desk', icon: 'badge', route: '/staff', apiEndpoint: '/v1/dynamic/staff' },
            { title: 'Students', icon: 'people', route: '/students', apiEndpoint: '/v1/institute/institute-students' },
            { title: 'Attendance', icon: 'how_to_reg', route: '/attendance', apiEndpoint: '/v1/institute/institute-attendance' },
            { title: 'Fee Desk', icon: 'payments', route: '/finance', apiEndpoint: '/v1/institute/institute-fees' },
            { title: 'Transport Module', icon: 'directions_bus', route: '/transport', apiEndpoint: '/v1/dynamic/transport_buses' },
            { title: 'Arena Controls', icon: 'settings', route: '/controls', apiEndpoint: '/v1/dynamic/controls' },
            { title: 'Placements', icon: 'work', route: '/placements', apiEndpoint: '/v1/institute/institute-placements' },
            { title: 'Exam Desk', icon: 'quiz', route: '/exam-desk', apiEndpoint: '/v1/institute/institute-exams' },
            { title: 'Exams & Marks', icon: 'grading', route: '/exams-marks', apiEndpoint: '/v1/dynamic/exams_marks' },
            { title: 'Upload Results', icon: 'upload_file', route: '/upload-results', apiEndpoint: '/v1/dynamic/upload_results' },
            { title: 'ID Card Studio', icon: 'badge', route: '/id-cards', apiEndpoint: '/v1/dynamic/id_cards' },
            { title: 'Issue Certificate', icon: 'card_membership', route: '/issue-certificate', apiEndpoint: '/v1/dynamic/issue_certificate' },
            { title: 'Expenses', icon: 'receipt', route: '/expenses', apiEndpoint: '/v1/dynamic/expenses' }
          );

          if (franchise.addon_exam_engine === 1) {
            sidebarMenus.push({ title: 'Exam Engine', icon: 'quiz', route: '/exams', apiEndpoint: '/v1/institute/institute-exams' });
            dashboardWidgets.push({ title: 'Upcoming Exams', type: 'list' });
          }
          if (franchise.addon_qr_attendance === 1) {
            sidebarMenus.push({ title: 'QR Attendance', icon: 'qr_code', route: '/attendance', apiEndpoint: '/v1/institute/institute-attendance' });
          }
          if (franchise.addon_parent_tracker === 1) {
            sidebarMenus.push({ title: 'Parent Portal', icon: 'family_restroom', route: '/parents', apiEndpoint: '/v1/institute/institute-parents' });
          }
          if (franchise.addon_jobs === 1) {
            sidebarMenus.push({ title: 'Placements & Jobs', icon: 'work', route: '/jobs', apiEndpoint: '/v1/institute/institute-placements' });
          }
        }

        if (franchise.addon_resort_erp === 1) {
          sidebarMenus.push(
            { title: 'Resort Housekeeping', icon: 'cleaning_services', route: '/housekeeping', apiEndpoint: '/v1/dynamic/resort_housekeeping' },
            { title: 'Resort Laundry', icon: 'local_laundry_service', route: '/laundry', apiEndpoint: '/v1/dynamic/resort_laundry_orders' },
            { title: 'Rooms & Booking', icon: 'hotel', route: '/rooms', apiEndpoint: '/v1/dynamic/resort_rooms' },
            { title: 'Resort Staff', icon: 'badge', route: '/staff', apiEndpoint: '/v1/dynamic/resort_staff' },
            { title: 'Feedback', icon: 'feedback', route: '/feedback', apiEndpoint: '/v1/dynamic/resort_feedbacks' }
          );
        }
      }
    } else if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'super_admin' || userRole.toLowerCase() === 'hq') {
      sidebarMenus.push(
        { title: 'HQ Dashboard', icon: 'dashboard', route: '/dashboard', apiEndpoint: '/v1/hq/dashboard' },
        { title: 'Franchise Management', icon: 'business', route: '/franchises', apiEndpoint: '/v1/hq/franchises' },
        { title: 'Billing & Subscriptions', icon: 'monetization_on', route: '/billing', apiEndpoint: '/v1/hq/billing' },
        { title: 'Feature Toggles', icon: 'toggle_on', route: '/features', apiEndpoint: '/v1/hq/features' },
        { title: 'Global Settings', icon: 'settings', route: '/settings', apiEndpoint: '/v1/hq/settings' },
        { title: 'User & Role Management', icon: 'manage_accounts', route: '/roles', apiEndpoint: '/v1/hq/roles' },
        { title: 'System Audit Logs', icon: 'security', route: '/logs', apiEndpoint: '/v1/audit' },
        { title: 'API Analytics', icon: 'analytics', route: '/analytics', apiEndpoint: '/v1/hq/analytics' },
      );
      dashboardWidgets.push(
        { title: 'Welcome Admin', type: 'greeting' },
        { title: 'Total Branches', type: 'stat', value: 'N/A' },
      );
    }

    // Build franchise info for the app
    let franchiseInfo: any = {};
    let allFranchises: any[] = [];

    if (organization) {
      const franchise = await this.franchiseRepo.findOne({ where: { id: organization } });
      if (franchise) {
        franchiseInfo = {
          id: franchise.id,
          branch_name: franchise.branch_name,
          branch_code: franchise.branch_code,
          logo: franchise.logo,
          tagline: franchise.tagline,
          theme_color: franchise.theme_color,
          owner_name: franchise.owner_name,
          contact_phone: franchise.contact_phone,
          city: franchise.city,
          plan_type: franchise.plan_type,
        };
      }
    }

    // For HQ users, load all franchises for filtering
    if (userRole.toLowerCase() === 'admin' || userRole.toLowerCase() === 'super_admin' || userRole.toLowerCase() === 'hq') {
      const franchises = await this.franchiseRepo.find({ order: { branch_name: 'ASC' } });
      allFranchises = franchises.map(f => ({
        id: f.id,
        branch_name: f.branch_name,
        branch_code: f.branch_code,
        logo: f.logo,
        city: f.city,
        status: f.status,
        plan_type: f.plan_type,
        owner_name: f.owner_name,
      }));
    }

    return {
      enabledPlugins: plugins.map((p) => p.plugin_id),
      sidebarMenu: sidebarMenus,
      routes: routes,
      permissions: [userRole],
      userRole: userRole,
      organizationInformation: { id: organization },
      franchiseInfo: franchiseInfo,
      allFranchises: allFranchises,
      featureFlags: {},
      dashboardWidgets: dashboardWidgets,
      themeConfiguration: {
        primaryColor: franchiseInfo.theme_color || '#0055FF',
        secondaryColor: '#FF5500',
        mode: 'system',
      },
      localizationConfiguration: {
        defaultLocale: 'en',
        supportedLocales: ['en', 'fr', 'es'],
      },
    };
  }
}
