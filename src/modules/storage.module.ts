import { Module, Global } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { UserRepository } from '../repositories/user.repository';
import { WebhookRepository } from '../repositories/webhook.repository';
import { RefreshTokenRepository } from '../repositories/refreshToken.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    UserRepository,
    WebhookRepository,
    RefreshTokenRepository,
  ],
  exports: [
    PrismaService,
    UserRepository,
    WebhookRepository,
    RefreshTokenRepository,
  ],
})
export class StorageModule {}
