import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConf = configService.get('database');
        const dbConfig = {
          type: 'mariadb' as const,
          host: dbConf.host,
          port: dbConf.port,
          username: dbConf.username,
          password: dbConf.password,
          database: dbConf.name,
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
        console.log('[ARENA-DB] Database Connection:', dbConfig.host, 'user:', dbConfig.username, 'db:', dbConfig.database);
        return dbConfig as any;
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
