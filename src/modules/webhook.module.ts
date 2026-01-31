import { Module } from '@nestjs/common';
import { WebhookController } from '../controllers/webhook.controller';
import { WebhookService } from '../services/webhook.service';
import { StorageRepository } from '../repositories/storage';

@Module({
  controllers: [WebhookController],
  providers: [WebhookService, StorageRepository],
})
export class WebhookModule {}
