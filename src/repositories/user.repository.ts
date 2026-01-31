import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/services/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) { }

  async create<T extends Prisma.UserCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserCreateArgs>
  ): Promise<Prisma.UserGetPayload<T>> {
    return await this.prisma.user.create(args);
  }

  async findUnique<T extends Prisma.UserFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.UserFindUniqueArgs>
  ): Promise<Prisma.UserGetPayload<T> | null> {
    return await this.prisma.user.findUnique(args);
  }

  async findByUsername(username: string) {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  async findById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { username },
    });
    return count > 0;
  }

  async count(): Promise<number> {
    return await this.prisma.user.count();
  }
}
