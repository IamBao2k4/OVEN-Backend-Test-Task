import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/services/prisma.service';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create<T extends Prisma.RefreshTokenCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.RefreshTokenCreateArgs>
  ): Promise<Prisma.RefreshTokenGetPayload<T>> {
    return await this.prisma.refreshToken.create(args);
  }

  async findUnique<T extends Prisma.RefreshTokenFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.RefreshTokenFindUniqueArgs>
  ): Promise<Prisma.RefreshTokenGetPayload<T> | null> {
    return await this.prisma.refreshToken.findUnique(args);
  }

  async save(token: string, userId: string, expiresAt: Date): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  async findByToken(token: string) {
    return await this.prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async delete(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    }).catch(() => {
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async deleteExpired(): Promise<number> {
    const result = await this.prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    return result.count;
  }

  async count(): Promise<number> {
    return await this.prisma.refreshToken.count();
  }
}
