import { Injectable } from '@nestjs/common';
import { Prisma, Webhook } from '@prisma/client';
import { PrismaService } from '../services/prisma.service';

@Injectable()
export class WebhookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.WebhookCreateInput): Promise<Webhook> {
    return await this.prisma.webhook.create({
      data,
    });
  }

  async findAll(page?: number, limit?: number): Promise<Webhook[]> {
    const skip = page && limit ? (page - 1) * limit : 0;
    const take = limit;

    return await this.prisma.webhook.findMany({
      orderBy: { receivedAt: 'desc' },
      skip,
      take,
    });
  }

  async findById(id: string): Promise<Webhook | null> {
    return await this.prisma.webhook.findUnique({
      where: { id },
    });
  }

  async findBySource(source: string): Promise<Webhook[]> {
    return await this.prisma.webhook.findMany({
      where: { source },
      orderBy: { receivedAt: 'desc' },
    });
  }

  async findByEvent(event: string): Promise<Webhook[]> {
    return await this.prisma.webhook.findMany({
      where: { event },
      orderBy: { receivedAt: 'desc' },
    });
  }

  async count(): Promise<number> {
    return await this.prisma.webhook.count();
  }

  async deleteAll(): Promise<void> {
    await this.prisma.webhook.deleteMany();
  }

  async delete(id: string): Promise<void> {
    await this.prisma.webhook.delete({
      where: { id },
    });
  }
}
