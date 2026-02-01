import { IsString, IsNotEmpty } from 'class-validator';
import { Webhook } from 'src/models/webhook.type';
import { PaginationMetadata } from './common.dto';

export class CreateWebhookDto {
  @IsString()
  @IsNotEmpty()
  source: string;

  @IsString()
  @IsNotEmpty()
  event: string;

  payload: any;
}

export class WebhookResponseDto {
  source: string;
  event: string;
  payload: any;
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
  id: string;

  static fromModel(webhook: Webhook): CreateWebhookResponseDto {
    const dto = new CreateWebhookResponseDto();
    dto.id = webhook.id;
    return dto;
  }
}

export class GetAllWebhooksResponseDto {
  data: WebhookResponseDto[];
  pagination: PaginationMetadata;

  constructor(webhooks: Webhook[], totalItems: number, page: number, limit: number) {
    this.data = webhooks.map(webhook => WebhookResponseDto.fromModel(webhook));
    this.pagination = new PaginationMetadata(page, limit, totalItems);
  }
}
