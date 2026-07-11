import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('franchises')
export class Franchise {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column('varchar', { name: 'branch_code', length: 20 })
  branch_code: string;

  @Column('varchar', { name: 'branch_name', length: 100 })
  branch_name: string;

  @Column('varchar', { name: 'owner_name', length: 100 })
  owner_name: string;

  @Column('varchar', { name: 'contact_phone', length: 15 })
  contact_phone: string;

  @Column('varchar', { name: 'email', length: 100, nullable: true })
  email: string | null;

  @Column('varchar', { name: 'city', length: 50, nullable: true })
  city: string | null;

  @Column('text', { name: 'address', nullable: true })
  address: string | null;

  @Column('varchar', {
    name: 'status',
    length: 20,
    nullable: true,
    default: 'Active',
  })
  status: string | null;

  @Column('date', { name: 'joined_date', nullable: true })
  joined_date: string | null;

  @Column('varchar', { name: 'phone', length: 20, nullable: true })
  phone: string | null;

  @Column('int', { name: 'addon_auto_demand', nullable: true, default: 0 })
  addon_auto_demand: number | null;

  @Column('int', { name: 'addon_expenses', nullable: true, default: 0 })
  addon_expenses: number | null;

  @Column('int', { name: 'addon_id_card', nullable: true, default: 0 })
  addon_id_card: number | null;

  @Column('int', { name: 'addon_qr_attendance', default: 0 })
  addon_qr_attendance: number;

  @Column('int', { name: 'addon_exam_engine', default: 0 })
  addon_exam_engine: number;

  @Column('int', { name: 'addon_face_biometrics', default: 0 })
  addon_face_biometrics: number;

  @Column('int', { name: 'addon_parent_tracker', default: 0 })
  addon_parent_tracker: number;

  @Column('int', { name: 'addon_xp_coupons', default: 0 })
  addon_xp_coupons: number;

  @Column('varchar', { name: 'logo', length: 255, nullable: true })
  logo: string | null;

  @Column('varchar', { name: 'tagline', length: 255, nullable: true })
  tagline: string | null;

  @Column('varchar', { name: 'institute_phone', length: 50, nullable: true })
  institute_phone: string | null;

  @Column('varchar', { name: 'udise_code', length: 50, nullable: true })
  udise_code: string | null;

  @Column('varchar', {
    name: 'auth_designation',
    length: 100,
    nullable: true,
    default: 'Director',
  })
  auth_designation: string | null;

  @Column('varchar', { name: 'auth_name', length: 100, nullable: true })
  auth_name: string | null;

  @Column('varchar', { name: 'signature', length: 255, nullable: true })
  signature: string | null;

  @Column('varchar', { name: 'print_header', length: 255, nullable: true })
  print_header: string | null;

  @Column('int', { name: 'addon_certificate', default: 0 })
  addon_certificate: number;

  @Column('int', { name: 'addon_auto_marketing', default: 0 })
  addon_auto_marketing: number;

  @Column('int', { name: 'addon_ai_tutor', default: 0 })
  addon_ai_tutor: number;

  @Column('int', { name: 'addon_live_tracking', default: 0 })
  addon_live_tracking: number;

  @Column('int', { name: 'addon_institute_erp', default: 1 })
  addon_institute_erp: number;

  @Column('int', { name: 'addon_resort_erp', default: 0 })
  addon_resort_erp: number;

  @Column('varchar', { name: 'subdomain', length: 100, nullable: true })
  subdomain: string | null;

  @Column('varchar', { name: 'custom_domain', length: 100, nullable: true })
  custom_domain: string | null;

  @Column('varchar', {
    name: 'theme_color',
    length: 20,
    nullable: true,
    default: '#3b82f6',
  })
  theme_color: string | null;

  @Column('text', { name: 'about_us', nullable: true })
  about_us: string | null;

  @Column('date', { name: 'expiry_date', nullable: true })
  expiry_date: string | null;

  @Column('int', { name: 'addon_video_gallery', default: 0 })
  addon_video_gallery: number;

  @Column('int', { name: 'addon_pdf_import', default: 0 })
  addon_pdf_import: number;

  @Column('date', { name: 'addon_expiry', nullable: true })
  addon_expiry: string | null;

  @Column('int', { name: 'addon_custom_domain', default: 0 })
  addon_custom_domain: number;

  @Column('int', { name: 'addon_premium_cert', default: 0 })
  addon_premium_cert: number;

  @Column('varchar', {
    name: 'plan_type',
    length: 20,
    nullable: true,
    default: 'Premium',
  })
  plan_type: string | null;

  @Column('varchar', { name: 'username', length: 100, nullable: true })
  username: string | null;

  @Column('varchar', { name: 'password', length: 255, nullable: true })
  password: string | null;

  @Column('varchar', {
    name: 'branch_type',
    length: 50,
    nullable: true,
    default: 'Computer Center',
  })
  branch_type: string | null;

  @Column('varchar', { name: 'affiliation_no', length: 100, nullable: true })
  affiliation_no: string | null;

  @Column('varchar', { name: 'center_code', length: 50, nullable: true })
  center_code: string | null;

  @Column('varchar', {
    name: 'about_feature_1',
    length: 100,
    nullable: true,
    default: 'Practical Labs',
  })
  about_feature_1: string | null;

  @Column('varchar', {
    name: 'about_feature_2',
    length: 100,
    nullable: true,
    default: 'Certified Courses',
  })
  about_feature_2: string | null;

  @Column('varchar', {
    name: 'about_img_1',
    length: 255,
    nullable: true,
    default:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=500&auto=format&fit=crop',
  })
  about_img_1: string | null;

  @Column('varchar', {
    name: 'about_img_2',
    length: 255,
    nullable: true,
    default:
      'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500&auto=format&fit=crop',
  })
  about_img_2: string | null;

  @Column('varchar', {
    name: 'about_heading',
    length: 255,
    nullable: true,
    default: 'Empowering the Next Generation of Tech Leaders.',
  })
  about_heading: string | null;

  @Column('varchar', { name: 'payment_qr', length: 255, nullable: true })
  payment_qr: string | null;

  @Column('varchar', { name: 'payment_upi', length: 255, nullable: true })
  payment_upi: string | null;

  @Column('date', { name: 'trial_end_date', nullable: true })
  trial_end_date: string | null;

  @Column('date', { name: 'renewal_date', nullable: true })
  renewal_date: string | null;

  @Column('decimal', {
    name: 'total_plan_amount',
    precision: 10,
    scale: 2,
    nullable: true,
    default: '0.00',
  })
  total_plan_amount: number | null;

  @Column('decimal', {
    name: 'paid_amount',
    precision: 10,
    scale: 2,
    nullable: true,
    default: '0.00',
  })
  paid_amount: number | null;

  @Column('decimal', {
    name: 'pending_amount',
    precision: 10,
    scale: 2,
    nullable: true,
    default: '0.00',
  })
  pending_amount: number | null;

  @Column('varchar', {
    name: 'billing_status',
    length: 50,
    nullable: true,
    default: 'Active',
  })
  billing_status: string | null;

  @Column('int', { name: 'wa_credits', nullable: true, default: 0 })
  wa_credits: number | null;

  @Column('int', { name: 'is_lifetime', nullable: true, default: 0 })
  is_lifetime: number | null;

  @Column('int', { name: 'addon_jobs', default: 0 })
  addon_jobs: number;

  @Column('varchar', {
    name: 'exam_controller_sign',
    length: 255,
    nullable: true,
  })
  exam_controller_sign: string | null;

  @Column('varchar', {
    name: 'stat_1_num',
    length: 50,
    nullable: true,
    default: '25000',
  })
  stat_1_num: string | null;

  @Column('varchar', {
    name: 'stat_1_text',
    length: 100,
    nullable: true,
    default: '+ Students Enrolled',
  })
  stat_1_text: string | null;

  @Column('varchar', {
    name: 'stat_2_num',
    length: 50,
    nullable: true,
    default: '50',
  })
  stat_2_num: string | null;

  @Column('varchar', {
    name: 'stat_2_text',
    length: 100,
    nullable: true,
    default: '+ Certified Courses',
  })
  stat_2_text: string | null;

  @Column('varchar', {
    name: 'stat_3_num',
    length: 50,
    nullable: true,
    default: '15000',
  })
  stat_3_num: string | null;

  @Column('varchar', {
    name: 'stat_3_text',
    length: 100,
    nullable: true,
    default: '+ Placements',
  })
  stat_3_text: string | null;

  @Column('varchar', {
    name: 'stat_4_num',
    length: 50,
    nullable: true,
    default: '150',
  })
  stat_4_num: string | null;

  @Column('varchar', {
    name: 'stat_4_text',
    length: 100,
    nullable: true,
    default: '+ Expert Instructors',
  })
  stat_4_text: string | null;

  @Column('text', { name: 'top_recruiters', nullable: true })
  top_recruiters: string | null;
}
