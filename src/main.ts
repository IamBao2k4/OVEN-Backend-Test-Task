import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appConfig } from './config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prefix = appConfig.prefixApi;
  app.setGlobalPrefix(prefix);
  
  const port = appConfig.port;
  await app.listen(port);
  console.log(`Server is running on ${port}`);
}
bootstrap(); 