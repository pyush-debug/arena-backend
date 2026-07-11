import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = {
          type: 'mariadb' as const,
          host: 'ictcomputereducation.com',
          port: 3306,
          username: 'admin2',
          password: '%JC9A4o3QvbgjXS%',
          database: 'ict_db',
          entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
          synchronize: false,
          logging: true,
          retryAttempts: 2,
          retryDelay: 3000,
          connectTimeout: 30000,
          extra: {
            connectTimeout: 30000,
            multipleStatements: true
          }
        };
        console.log('[ARENA-DB] Remote CPanel Connection:', dbConfig.host, 'user:', dbConfig.username, 'db:', dbConfig.database);
        return dbConfig;
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
