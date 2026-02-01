import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { appConfig } from './config/config';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  app.useGlobalInterceptors(new TimeoutInterceptor());

  const prefix = appConfig.prefixApi;
  app.setGlobalPrefix(prefix);

  const port = appConfig.port;
  await app.listen(port);
  console.log(`Server is running on ${port}`);
}
bootstrap(); 