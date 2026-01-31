import { Injectable } from '@nestjs/common';
import { Webhook, WebhookInput } from '../models/types';
import { StorageRepository } from '../repositories/storage';

@Injectable()
export class WebhookService {
  constructor(private readonly storageRepository: StorageRepository) {}

  createWebhook(input: WebhookInput): Webhook {
    const id = Math.random().toString(36).substring(7);
    const webhook: Webhook = {
      id,
      source: input.source,
      event: input.event,
      payload: input.payload,
      receivedAt: new Date()
    };
    this.storageRepository.save(webhook);
    return webhook;
  }

  getAllWebhooks(): Webhook[] {
    return this.storageRepository.getAll();
  }

  getWebhookById(id: string): Webhook | undefined {
    return this.storageRepository.getById(id);
  }
}
