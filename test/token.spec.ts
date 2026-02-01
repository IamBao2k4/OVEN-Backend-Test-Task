import * as jwt from 'jsonwebtoken';
import { UnauthorizedException } from '@nestjs/common';
import { TokenHandler } from '../src/helper/token';
import { RefreshTokenRepository } from '../src/repositories/refreshToken.repository';

// Mock the config
jest.mock('../src/config/config', () => ({
  jwtConfig: {
    secret: 'test-secret',
    accessTokenExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
  },
}));

describe('TokenHandler', () => {
  let mockRefreshTokenRepository: jest.Mocked<RefreshTokenRepository>;

  beforeEach(() => {
    mockRefreshTokenRepository = {
      save: jest.fn(),
      findByToken: jest.fn(),
      delete: jest.fn(),
      findByUserId: jest.fn(),
      deleteExpired: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const user = { id: 'user-123', username: 'testuser' };
      const token = TokenHandler.generateAccessToken(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, TokenHandler.JWT_SECRET) as any;
      expect(decoded.userId).toBe(user.id);
      expect(decoded.username).toBe(user.username);
      expect(decoded.type).toBe('access');
    });

    it('should include expiration in the token', () => {
      const user = { id: 'user-123', username: 'testuser' };
      const token = TokenHandler.generateAccessToken(user);

      const decoded = jwt.verify(token, TokenHandler.JWT_SECRET) as any;
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token and save it', async () => {
      const user = { id: 'user-123' };
      mockRefreshTokenRepository.save.mockResolvedValue(undefined);

      const token = await TokenHandler.generateRefreshToken(user, mockRefreshTokenRepository);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, TokenHandler.JWT_SECRET) as any;
      expect(decoded.userId).toBe(user.id);
      expect(decoded.type).toBe('refresh');

      expect(mockRefreshTokenRepository.save).toHaveBeenCalledTimes(1);
      expect(mockRefreshTokenRepository.save).toHaveBeenCalledWith(
        token,
        user.id,
        expect.any(Date),
      );
    });

    it('should set expiration date 7 days in the future', async () => {
      const user = { id: 'user-123' };
      mockRefreshTokenRepository.save.mockResolvedValue(undefined);

      const beforeDate = new Date();
      beforeDate.setDate(beforeDate.getDate() + 7);

      await TokenHandler.generateRefreshToken(user, mockRefreshTokenRepository);

      const afterDate = new Date();
      afterDate.setDate(afterDate.getDate() + 7);

      const [, , expiresAt] = mockRefreshTokenRepository.save.mock.calls[0];
      expect((expiresAt as Date).getTime()).toBeGreaterThanOrEqual(beforeDate.getTime() - 1000);
      expect((expiresAt as Date).getTime()).toBeLessThanOrEqual(afterDate.getTime() + 1000);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid access token', () => {
      const user = { id: 'user-123', username: 'testuser' };
      const token = jwt.sign(
        { userId: user.id, username: user.username, type: 'access' },
        TokenHandler.JWT_SECRET,
        { expiresIn: '15m' },
      );

      const payload = TokenHandler.validateToken(token);

      expect(payload).toBeDefined();
      expect(payload.userId).toBe(user.id);
      expect(payload.username).toBe(user.username);
      expect(payload.type).toBe('access');
    });

    it('should validate a valid refresh token', () => {
      const user = { id: 'user-123', username: 'testuser' };
      const token = jwt.sign(
        { userId: user.id, username: user.username, type: 'refresh' },
        TokenHandler.JWT_SECRET,
        { expiresIn: '7d' },
      );

      const payload = TokenHandler.validateToken(token);

      expect(payload).toBeDefined();
      expect(payload.userId).toBe(user.id);
      expect(payload.type).toBe('refresh');
    });

    it('should throw UnauthorizedException for invalid token', () => {
      const invalidToken = 'invalid-token';

      expect(() => TokenHandler.validateToken(invalidToken)).toThrow(UnauthorizedException);
      expect(() => TokenHandler.validateToken(invalidToken)).toThrow('Invalid token');
    });

    it('should throw UnauthorizedException for expired token', () => {
      const user = { id: 'user-123', username: 'testuser' };
      const expiredToken = jwt.sign(
        { userId: user.id, username: user.username, type: 'access' },
        TokenHandler.JWT_SECRET,
        { expiresIn: '-1s' },
      );

      expect(() => TokenHandler.validateToken(expiredToken)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for token with invalid type', () => {
      const user = { id: 'user-123', username: 'testuser' };
      const token = jwt.sign(
        { userId: user.id, username: user.username, type: 'invalid-type' },
        TokenHandler.JWT_SECRET,
        { expiresIn: '15m' },
      );

      expect(() => TokenHandler.validateToken(token)).toThrow(UnauthorizedException);
      // The error is caught and rethrown as 'Invalid token'
      expect(() => TokenHandler.validateToken(token)).toThrow('Invalid token');
    });

    it('should throw UnauthorizedException for token signed with wrong secret', () => {
      const user = { id: 'user-123', username: 'testuser' };
      const token = jwt.sign(
        { userId: user.id, username: user.username, type: 'access' },
        'wrong-secret',
        { expiresIn: '15m' },
      );

      expect(() => TokenHandler.validateToken(token)).toThrow(UnauthorizedException);
    });
  });
});
