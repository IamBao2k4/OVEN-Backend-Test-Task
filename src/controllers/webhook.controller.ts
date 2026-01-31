import { Controller, Get, Post, Body, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';
import { AuthGuard } from '../guards/auth.guard';
import type { WebhookInput } from '../models/types';

@Controller('webhooks')
@UseGuards(AuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  createWebhook(@Body() input: WebhookInput) {
    const webhook = this.webhookService.createWebhook(input);
    return {
      id: webhook.id,
      message: 'Webhook received'
    };
  }

  @Get()
  getAllWebhooks() {
    const allWebhooks = this.webhookService.getAllWebhooks();
    return {
      webhooks: allWebhooks,
      count: allWebhooks.length
    };
  }

  @Get(':id')
  getWebhookById(@Param('id') id: string) {
    const webhook = this.webhookService.getWebhookById(id);
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }
    return webhook;
  }
}
