import { Global, Module } from '@nestjs/common';

export const REDIS_CLIENT = 'REDIS_CLIENT';

const mockRedis = {
  get: async () => null,
  set: async () => null,
  del: async () => null,
  on: () => null,
  quit: async () => null,
};

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useValue: mockRedis,
    },
  ],
  exports: [REDIS_CLIENT],
})
export class CacheModule {}
