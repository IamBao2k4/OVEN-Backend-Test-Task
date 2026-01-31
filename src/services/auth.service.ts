import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { RefreshTokenRepository } from '../repositories/refreshToken.repository';
import * as dto from '../dto/auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { TokenHandler } from '../helper/token';
import { LogMethod } from '../decorators/log.decorator';

@Injectable()
export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) { }

  @LogMethod()
  async register(data: dto.RegisterDto): Promise<dto.RegisterResponseDto> {
    const existingUser = await this.userRepository.findByUsername(data.username);
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    await this.userRepository.create({
      data: {
        id: randomUUID(),
        username: data.username,
        passwordHash,
      },
    });

    return new dto.RegisterResponseDto('User registered successfully');
  }

  @LogMethod()
  async login(data: dto.LoginDto): Promise<dto.LoginResponseDto> {
    const user = await this.userRepository.findByUsername(data.username);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = TokenHandler.generateAccessToken(user);
    const refreshToken = await TokenHandler.generateRefreshToken(user, this.refreshTokenRepository);

    return dto.LoginResponseDto.fromModel(user, accessToken, refreshToken);
  }

  @LogMethod()
  async refreshToken(data: dto.RefreshTokenDto): Promise<dto.RefreshTokenResponseDto> {
    try {
      const payload: any = jwt.verify(data.refreshToken, this.JWT_SECRET);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const tokenData = await this.refreshTokenRepository.findByToken(data.refreshToken);
      if (!tokenData) {
        throw new UnauthorizedException('Refresh token not found');
      }

      if (tokenData.expiresAt < new Date()) {
        await this.refreshTokenRepository.delete(data.refreshToken);
        throw new UnauthorizedException('Refresh token expired');
      }

      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      await this.refreshTokenRepository.delete(data.refreshToken);

      const accessToken = TokenHandler.generateAccessToken(user);
      const newRefreshToken = await TokenHandler.generateRefreshToken(user, this.refreshTokenRepository);

      return {
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new UnauthorizedException('Refresh token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException(`Invalid refresh token: ${error.message}`);
      }
      throw error;
    }
  }
}