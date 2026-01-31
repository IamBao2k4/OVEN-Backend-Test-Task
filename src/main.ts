import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const prefix = process.env.PREFIX_API || '/api/v1';
  app.setGlobalPrefix(prefix);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server is running on ${port}`);
}
bootstrap(); 