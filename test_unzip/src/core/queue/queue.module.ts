import { Module } from '@nestjs/common';
import { getQueueToken } from '@nestjs/bullmq';

const mockQueue = {
  add: async () => {},
  process: () => {},
  on: () => {},
};

@Module({
  providers: [
    { provide: getQueueToken('email'), useValue: mockQueue },
    { provide: getQueueToken('sms'), useValue: mockQueue },
    { provide: getQueueToken('push'), useValue: mockQueue },
    { provide: getQueueToken('whatsapp'), useValue: mockQueue },
  ],
  exports: [
    getQueueToken('email'),
    getQueueToken('sms'),
    getQueueToken('push'),
    getQueueToken('whatsapp'),
  ],
})
export class QueueModule {}
