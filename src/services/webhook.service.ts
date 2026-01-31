import { Injectable } from '@nestjs/common';
import { CreateWebhookDto } from '../dto/webhook.dto';
import { WebhookRepository } from '../repositories/webhook.repository';
import { LogMethod } from '../decorators/log.decorator';

@Injectable()
export class WebhookService {
  constructor(private readonly webhookRepository: WebhookRepository) {}

  @LogMethod()
  async createWebhook(input: CreateWebhookDto) {
    return await this.webhookRepository.create({
      source: input.source,
      event: input.event,
      payload: input.payload,
    });
  }

  @LogMethod()
  async getAllWebhooks() {
    return this.webhookRepository.findAll();
  }

  @LogMethod()
  async getWebhookById(id: string) {
    return this.webhookRepository.findById(id);
  }

  @LogMethod()
  async getWebhookCount(): Promise<number> {
    return this.webhookRepository.count();
  }
}
