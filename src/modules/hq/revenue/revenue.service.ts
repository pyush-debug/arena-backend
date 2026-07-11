import { Injectable } from '@nestjs/common';
import { AddSubscriptionDto, AddPaymentDto } from './revenue.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';
import { Franchise } from '../../iam/entities/franchise.entity';
import { FranchiseSubscription } from '../../iam/entities/franchise-subscription.entity';
import { FranchisePayment } from '../../iam/entities/franchise-payment.entity';
import { SystemNotification } from '../../saas/notification/entities/system-notification.entity';

@Injectable()
export class RevenueService {
  constructor(
    private readonly logger: CustomLoggerService,
    @InjectRepository(Franchise) private franchiseRepo: Repository<Franchise>,
    @InjectRepository(FranchiseSubscription)
    private subscriptionRepo: Repository<FranchiseSubscription>,
    @InjectRepository(FranchisePayment)
    private paymentRepo: Repository<FranchisePayment>,
    @InjectRepository(SystemNotification)
    private notificationRepo: Repository<SystemNotification>,
  ) {}

  async getRevenueDashboards() {
    this.logger.debug('Fetching HQ Revenue Dashboards', 'RevenueService');
    const payments = await this.paymentRepo.find({
      where: { payment_status: 'Success' },
    });
    const franchises = await this.franchiseRepo.find();

    let totalRevenue = 0;
    let monthlyRevenue = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    payments.forEach((p) => {
      totalRevenue += Number(p.amount_paid);
      const pd = new Date(p.payment_date || new Date());
      if (pd.getMonth() === currentMonth && pd.getFullYear() === currentYear) {
        monthlyRevenue += Number(p.amount_paid);
      }
    });

    let pendingMarketDue = 0;
    franchises.forEach((f) => {
      if (Number(f.pending_amount) > 0) {
        pendingMarketDue += Number(f.pending_amount);
      }
    });

    return {
      success: true,
      data: {
        totalRevenue,
        monthlyRevenue,
        pendingMarketDue,
      },
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async syncBillingEngineCron() {
    this.logger.debug('Running CRON: Syncing Billing Engine', 'RevenueService');
    await this.syncBillingEngine();
  }

  async syncBillingEngine() {
    const franchises = await this.franchiseRepo.find();
    const today = new Date();

    for (const franchise of franchises) {
      if (franchise.id === 1) continue; // Skip HQ

      const subscriptions = await this.subscriptionRepo.find({
        where: { franchise_id: franchise.id },
      });
      const payments = await this.paymentRepo.find({
        where: { franchise_id: franchise.id, payment_status: 'Success' },
      });

      let totalBilled = 0;
      let maxEndDate: Date | null = null;

      for (const sub of subscriptions) {
        totalBilled += Number(sub.amount);
        if (sub.end_date) {
          const ed = new Date(sub.end_date);
          if (!maxEndDate || ed > maxEndDate) maxEndDate = ed;
        }
      }

      let totalPaid = 0;
      for (const pay of payments) {
        totalPaid += Number(pay.amount_paid);
      }

      const pending = totalBilled - totalPaid;
      let status = 'Active';

      if (maxEndDate && maxEndDate < today) {
        status = 'Expired';
      } else if (pending > 0) {
        status = 'Payment Due';
      } else if (!maxEndDate && pending === 0 && totalBilled === 0) {
        status = 'No Plan';
      }

      await this.franchiseRepo.update(franchise.id, {
        total_plan_amount: totalBilled,
        paid_amount: totalPaid,
        pending_amount: pending,
        renewal_date: maxEndDate
          ? maxEndDate.toISOString().split('T')[0]
          : null,
        billing_status: status,
      });
    }

    return { success: true, message: 'Billing Engine Synced Successfully' };
  }

  async addSubscription(data: AddSubscriptionDto) {
    const sub = this.subscriptionRepo.create({
      franchise_id: data.franchise_id,
      plan_name: data.plan_name,
      billing_cycle: data.billing_cycle,
      amount: data.amount,
      start_date: data.start_date,
      end_date: data.end_date,
      status: 'Active',
    });
    await this.subscriptionRepo.save(sub);
    await this.syncBillingEngine();
    return { success: true, message: 'Subscription added', data: sub };
  }

  async addPayment(data: AddPaymentDto) {
    const pay = this.paymentRepo.create({
      franchise_id: data.franchise_id,
      amount_paid: data.amount_paid,
      due_amount: data.due_amount || 0,
      payment_date: data.payment_date,
      payment_mode: data.payment_mode,
      payment_status: data.payment_status || 'Success',
      transaction_id: data.transaction_id,
      invoice_no: data.invoice_no,
      receipt_url: data.receipt_url,
      remarks: data.remarks,
      created_by: data.created_by,
    });
    await this.paymentRepo.save(pay);
    await this.syncBillingEngine();
    return { success: true, message: 'Payment recorded', data: pay };
  }

  async getFranchiseBilling(franchiseId: number) {
    const franchise = await this.franchiseRepo.findOne({
      where: { id: franchiseId },
    });
    const subscriptions = await this.subscriptionRepo.find({
      where: { franchise_id: franchiseId },
      order: { id: 'DESC' },
    });
    const payments = await this.paymentRepo.find({
      where: { franchise_id: franchiseId },
      order: { id: 'DESC' },
    });

    return {
      success: true,
      data: {
        franchise,
        subscriptions,
        payments,
      },
    };
  }

  async sendPanelAlert(
    franchiseId: number,
    message: string,
    type: string = 'alert',
  ) {
    const note = this.notificationRepo.create({
      franchise_id: franchiseId,
      type,
      message,
    });
    await this.notificationRepo.save(note);
    return { success: true, message: 'Alert sent to specific branch' };
  }

  async broadcastPanelAlert(message: string, type: string = 'alert') {
    const franchises = await this.franchiseRepo.find();
    const notes = franchises.map((f) =>
      this.notificationRepo.create({
        franchise_id: f.id,
        type,
        message,
      }),
    );
    await this.notificationRepo.save(notes);
    return { success: true, message: 'Alert broadcasted to all branches' };
  }

  async exportRevenueData(type: string) {
    const franchises = await this.franchiseRepo.find();
    // Simplified export: we will return JSON and let the frontend transform it into CSV/PDF/Excel.
    // In a real scenario, use libraries like json2csv or pdfkit.
    return {
      success: true,
      type,
      data: franchises.map((f) => ({
        id: f.id,
        branch_name: f.branch_name,
        billing_status: f.billing_status,
        total_billed: f.total_plan_amount,
        total_paid: f.paid_amount,
        pending: f.pending_amount,
        renewal_date: f.renewal_date,
      })),
    };
  }
}
