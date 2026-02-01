import { Module } from '@nestjs/common';
import { WebhookModule } from './modules/webhook.module';
import { AuthModule } from './modules/auth.module';
import { StorageModule } from './modules/storage.module';
import { ThrottlerConfigModule } from './modules/throttler.module';

@Module({
  imports: [
    ThrottlerConfigModule,
    StorageModule,
    WebhookModule,
    AuthModule,
  ],
})
export class AppModule {}
