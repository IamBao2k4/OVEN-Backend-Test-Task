import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Webhook } from 'src/models/webhook.type';
import { PaginationMetadata } from './common.dto';

export class CreateWebhookDto {
  @ApiProperty({
    description: 'Source of the webhook',
    example: 'github'
  })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({
    description: 'Event type',
    example: 'push'
  })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({
    description: 'Webhook payload data',
    example: { repository: 'my-repo', branch: 'main', commits: 5 }
  })
  @IsNotEmpty()
  payload: any;
}

export class WebhookResponseDto {
  @ApiProperty({ description: 'Webhook source', example: 'github' })
  source: string;

  @ApiProperty({ description: 'Event type', example: 'push' })
  event: string;

  @ApiProperty({ description: 'Webhook payload', example: { repository: 'my-repo', branch: 'main', commits: 5 } })
  payload: any;

  @ApiProperty({ description: 'Timestamp when webhook was received', example: '2024-01-01T00:00:00.000Z' })
  receivedAt: Date;

  constructor(source: string, event: string, payload: any, receivedAt: Date) {
    this.source = source;
    this.event = event;
    this.payload = payload;
    this.receivedAt = receivedAt;
  }

  static fromModel(webhook: Webhook): WebhookResponseDto {
    return new WebhookResponseDto(
      webhook.source,
      webhook.event,
      webhook.payload,
      webhook.receivedAt
    );
  }
}

export class CreateWebhookResponseDto {
  @ApiProperty({ description: 'Webhook ID', example: 'cm6hp3pvl0000mg0830avrtmp' })
  id: string;

  static fromModel(webhook: Webhook): CreateWebhookResponseDto {
    const dto = new CreateWebhookResponseDto();
    dto.id = webhook.id;
    return dto;
  }
}

export class GetAllWebhooksResponseDto {
  @ApiProperty({ description: 'List of webhooks', type: [WebhookResponseDto] })
  data: WebhookResponseDto[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetadata })
  pagination: PaginationMetadata;

  constructor(webhooks: Webhook[], totalItems: number, page: number, limit: number) {
    this.data = webhooks.map(webhook => WebhookResponseDto.fromModel(webhook));
    this.pagination = new PaginationMetadata(page, limit, totalItems);
  }
}
