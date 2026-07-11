import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { CustomLoggerService } from './core/logger/custom-logger.service';
import { GlobalExceptionFilter } from './core/exceptions/global.exception-filter';
import { ResponseInterceptor } from './core/interceptors/response.interceptor';
// Uncomment when modules are installed:
// import helmet from 'helmet';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  console.log('[ARENA] bootstrap() called — creating NestJS app...');
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  console.log('[ARENA] NestJS app created successfully!');

  // Logger
  const logger = app.get(CustomLoggerService);
  app.useLogger(logger);

  // Security Middleware
  // app.use(helmet());
  app.enableCors({ origin: '*' });

  // API Versioning (V027)
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global Interceptors & Filters
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter(logger));

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Arena OS API')
    .setDescription('Arena OS V2 Enterprise API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 Arena OS API Foundation running on port ${port}`, 'Bootstrap');
  console.log(`[ARENA] Server listening on port ${port}`);
}
bootstrap().catch((err) => {
  console.error('[ARENA] FATAL: bootstrap() crashed:', err);
  process.exit(1);
});
