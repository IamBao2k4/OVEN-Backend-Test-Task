import { Controller, Get, Post, Body, Param, Query, NotFoundException, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';
import { AuthGuard } from '../guards/auth.guard';
import {
  CreateWebhookDto,
  CreateWebhookResponseDto,
  GetAllWebhooksResponseDto,
  WebhookResponseDto
} from '../dto/webhook.dto';
import { BaseResponse, PaginationQueryDto } from 'src/dto/common.dto';

@Controller('webhooks')
@UseGuards(AuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWebhook(@Body() input: CreateWebhookDto):
  Promise<BaseResponse<CreateWebhookResponseDto>> {
    const webhook = await this.webhookService.createWebhook(input);
    return {
      data: CreateWebhookResponseDto.fromModel(webhook),
      message: 'Webhook received',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString()
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAllWebhooks(@Query() query: PaginationQueryDto): Promise<BaseResponse<GetAllWebhooksResponseDto>> {
    const { page = 1, limit = 10 } = query;
    const allWebhooks = await this.webhookService.getAllWebhooks(page, limit);
    const count = await this.webhookService.getWebhookCount();
    
    return {
      data: new GetAllWebhooksResponseDto(allWebhooks, count, page, limit),
      message: 'All webhooks retrieved',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString()
    };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getWebhookById(@Param('id') id: string): Promise<BaseResponse<WebhookResponseDto>> {
    const webhook = await this.webhookService.getWebhookById(id);
    if (!webhook) {
      throw new NotFoundException('Webhook not found');
    }
    return {
      data: WebhookResponseDto.fromModel(webhook),
      message: 'Webhook retrieved',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString()
    };
  }
}
