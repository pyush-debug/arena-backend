import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: false });
  const config = new DocumentBuilder()
    .setTitle('Arena OS API')
    .setDescription('Arena OS V2 Enterprise API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('swagger-spec.json', JSON.stringify(document, null, 2));
  await app.close();
  console.log('Swagger spec exported successfully to swagger-spec.json');
}
bootstrap();
