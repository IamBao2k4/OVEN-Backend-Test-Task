import { IsOptional, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationQueryDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class PaginationMetadata {
  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of items', example: 50 })
  totalItems: number;

  @ApiProperty({ description: 'Total number of pages', example: 5 })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page', example: true })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there is a previous page', example: false })
  hasPreviousPage: boolean;

  constructor(page: number, limit: number, totalItems: number) {
    this.page = page;
    this.limit = limit;
    this.totalItems = totalItems;
    this.totalPages = Math.ceil(totalItems / limit);
    this.hasNextPage = page < this.totalPages;
    this.hasPreviousPage = page > 1;
  }
}

export class BaseResponse<T> {
  @ApiProperty({ description: 'Response data' })
  data?: T;

  @ApiProperty({ description: 'Response message', example: 'Operation successful' })
  message?: string;

  @ApiProperty({ description: 'HTTP status code', example: 200 })
  statusCode: number;

  @ApiProperty({ description: 'Response timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  constructor(data?: T, message?: string, statusCode: number = 200) {
    this.data = data;
    this.message = message;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

export class ErrorResponse {
  @ApiProperty({ description: 'Error message', example: 'An error occurred' })
  error: string;

  @ApiProperty({ description: 'HTTP status code', example: 500 })
  statusCode: number;

  @ApiProperty({ description: 'Error timestamp', example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  constructor(error: string, statusCode: number = 500) {
    this.error = error;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}
