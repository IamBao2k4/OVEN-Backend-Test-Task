import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from "@nestjs/common";
import { RefreshTokenRepository } from "src/repositories/refreshToken.repository";

export class TokenHandler {
  static JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  static JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
  static REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

  static generateAccessToken(user: { id: string; username: string }): string {
    return jwt.sign(
      { userId: user.id, username: user.username, type: 'access' },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN } as jwt.SignOptions
    );
  }

  static async generateRefreshToken(user: { id: string }, refreshTokenRepository: RefreshTokenRepository): Promise<string> {
    console.log('Generating refresh token for user:', this.REFRESH_TOKEN_EXPIRES_IN, "/n", this.JWT_SECRET);
    
    const token = jwt.sign(
      { userId: user.id, type: 'refresh' },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN } as jwt.SignOptions
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await refreshTokenRepository.save(token, user.id, expiresAt);

    return token;
  }

  static validateToken(token: string): { userId: string; username: string } {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as { userId: string; username: string; type: string };

      if (payload.type !== 'access') {
        throw new UnauthorizedException('Invalid token type');
      }

      return { userId: payload.userId, username: payload.username };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}