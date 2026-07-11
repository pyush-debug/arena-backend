import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CustomLoggerService } from '../../../core/logger/custom-logger.service';

/**
 * Notification Infrastructure (Purely agnostic infrastructure - no business logic).
 * Dispatches heavy external I/O requests to Redis-backed queues.
 */
@Injectable()
export class NotificationEngine {
  constructor(
    @InjectQueue('email_queue') private emailQueue: Queue,
    @InjectQueue('sms_queue') private smsQueue: Queue,
    @InjectQueue('whatsapp_queue') private waQueue: Queue,
    @InjectQueue('push_queue') private pushQueue: Queue,
    private readonly logger: CustomLoggerService,
  ) {}

  async queueEmail(
    to: string,
    template: string,
    context: Record<string, unknown>,
  ) {
    this.logger.debug(`Queuing Email to ${to}`, 'NotificationEngine');
    await this.emailQueue.add(
      'send_email',
      { to, template, context },
      { removeOnComplete: true },
    );
  }

  async queueSms(phone: string, message: string) {
    this.logger.debug(`Queuing SMS to ${phone}`, 'NotificationEngine');
    await this.smsQueue.add(
      'send_sms',
      { phone, message },
      { removeOnComplete: true },
    );
  }

  async queueWhatsApp(
    phone: string,
    template: string,
    params: Record<string, unknown>,
  ) {
    this.logger.debug(`Queuing WhatsApp to ${phone}`, 'NotificationEngine');
    await this.waQueue.add(
      'send_wa',
      { phone, template, params },
      { removeOnComplete: true },
    );
  }

  async queuePushNotification(
    deviceTokens: string[],
    payload: Record<string, unknown>,
  ) {
    this.logger.debug(
      `Queuing Push Notification to ${deviceTokens.length} devices`,
      'NotificationEngine',
    );
    await this.pushQueue.add(
      'send_push',
      { deviceTokens, payload },
      { removeOnComplete: true },
    );
  }
}
