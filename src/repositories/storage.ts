import { Injectable } from '@nestjs/common';
import { Webhook } from '../models/types';

@Injectable()
export class StorageRepository {
  private webhooks: Webhook[] = [];

  save(webhook: Webhook): void {
    this.webhooks.push(webhook);
  }

  getAll(): Webhook[] {
    return this.webhooks;
  }

  getById(id: string): Webhook | undefined {
    return this.webhooks.find(w => w.id === id);
  }

  count(): number {
    return this.webhooks.length;
  }

  clear(): void {
    this.webhooks = [];
  }
}