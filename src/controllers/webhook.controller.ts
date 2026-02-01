import { Controller, Get, Post, Body, Param, Query, NotFoundException, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { WebhookService } from '../services/webhook.service';
import { AuthGuard } from '../guards/auth.guard';
import {
  CreateWebhookDto,
  CreateWebhookResponseDto,
  GetAllWebhooksResponseDto,
  WebhookResponseDto
} from '../dto/webhook.dto';
import { BaseResponse, PaginationQueryDto } from 'src/dto/common.dto';

@ApiTags('Webhooks')
@ApiBearerAuth('JWT-auth')
@Controller('webhooks')
@UseGuards(AuthGuard)
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new webhook' })
  @ApiBody({ type: CreateWebhookDto })
  @ApiResponse({ status: 201, description: 'Webhook created successfully', type: CreateWebhookResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid token' })
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
  @ApiOperation({ summary: 'Get all webhooks with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 10)' })
  @ApiResponse({ status: 200, description: 'Webhooks retrieved successfully', type: GetAllWebhooksResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid token' })
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
  @ApiOperation({ summary: 'Get webhook by ID' })
  @ApiParam({ name: 'id', type: String, description: 'Webhook ID' })
  @ApiResponse({ status: 200, description: 'Webhook retrieved successfully', type: WebhookResponseDto })
  @ApiResponse({ status: 401, description: 'Unauthorized - Missing or invalid token' })
  @ApiResponse({ status: 404, description: 'Not found - Webhook not found' })
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
