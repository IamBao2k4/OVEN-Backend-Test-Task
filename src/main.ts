import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { appConfig, corsConfig, swaggerConfig } from './config/config';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: corsConfig.origin,
    methods: corsConfig.methods,
    credentials: corsConfig.credentials,
    allowedHeaders: corsConfig.allowedHeaders,
    exposedHeaders: corsConfig.exposedHeaders,
    maxAge: corsConfig.maxAge,
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
  }));

  app.useGlobalInterceptors(new TimeoutInterceptor());

  const prefix = appConfig.prefixApi;
  app.setGlobalPrefix(prefix);

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);

  const port = appConfig.port;
  await app.listen(port);
  console.log(`Server is running on ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api-docs`);
}
bootstrap(); 