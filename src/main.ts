import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { appConfig, corsConfig } from './config/config';
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

  const port = appConfig.port;
  await app.listen(port);
  console.log(`Server is running on ${port}`);
}
bootstrap(); 