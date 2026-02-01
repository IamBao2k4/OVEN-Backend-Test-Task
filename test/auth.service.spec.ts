import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from '../src/services/auth.service';
import { UserRepository } from '../src/repositories/user.repository';
import { RefreshTokenRepository } from '../src/repositories/refreshToken.repository';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { TokenHandler } from '../src/helper/token';

// Mock the TokenHandler
jest.mock('../src/helper/token');

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let refreshTokenRepository: jest.Mocked<RefreshTokenRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: {
            findByUsername: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: RefreshTokenRepository,
          useValue: {
            save: jest.fn(),
            findByToken: jest.fn(),
            delete: jest.fn(),
            findByUserId: jest.fn(),
            deleteExpired: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(UserRepository);
    refreshTokenRepository = module.get(RefreshTokenRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = {
        username: 'testuser',
        password: 'password123',
      };

      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        id: 'user-123',
        username: 'testuser',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
      } as any);

      const result = await service.register(registerDto);

      expect(result).toEqual({ message: 'User registered successfully' });
      expect(userRepository.findByUsername).toHaveBeenCalledWith('testuser');
      expect(userRepository.create).toHaveBeenCalledWith({
        data: {
          id: expect.any(String),
          username: 'testuser',
          passwordHash: expect.any(String),
        },
      });
    });

    it('should hash the password before storing', async () => {
      const registerDto = {
        username: 'testuser',
        password: 'password123',
      };

      userRepository.findByUsername.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({} as any);

      await service.register(registerDto);

      const createCall = userRepository.create.mock.calls[0][0];
      const hashedPassword = createCall.data.passwordHash;

      expect(hashedPassword).not.toBe('password123');
      expect(await bcrypt.compare('password123', hashedPassword)).toBe(true);
    });

    it('should throw ConflictException if username already exists', async () => {
      const registerDto = {
        username: 'existinguser',
        password: 'password123',
      };

      userRepository.findByUsername.mockResolvedValue({
        id: 'existing-user',
        username: 'existinguser',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
      } as any);

      await expect(service.register(registerDto)).rejects.toThrow(ConflictException);
      await expect(service.register(registerDto)).rejects.toThrow('Username already exists');
      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'password123',
      };

      const user = {
        id: 'user-123',
        username: 'testuser',
        passwordHash: await bcrypt.hash('password123', 10),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findByUsername.mockResolvedValue(user as any);
      (TokenHandler.generateAccessToken as jest.Mock).mockReturnValue('access-token');
      (TokenHandler.generateRefreshToken as jest.Mock).mockResolvedValue('refresh-token');

      const result = await service.login(loginDto);

      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(result.data.username).toBe('testuser');
      expect(result.data.createdAt).toEqual(user.createdAt);
      expect(TokenHandler.generateAccessToken).toHaveBeenCalledWith(user);
      expect(TokenHandler.generateRefreshToken).toHaveBeenCalledWith(user, refreshTokenRepository);
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      const loginDto = {
        username: 'nonexistent',
        password: 'password123',
      };

      userRepository.findByUsername.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const loginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };

      const user = {
        id: 'user-123',
        username: 'testuser',
        passwordHash: await bcrypt.hash('correctpassword', 10),
        createdAt: new Date(),
      };

      userRepository.findByUsername.mockResolvedValue(user as any);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('refreshToken', () => {
    it('should successfully refresh tokens with valid refresh token', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const tokenPayload = {
        userId: 'user-123',
        username: 'testuser',
        type: 'refresh',
      };

      const user = {
        id: 'user-123',
        username: 'testuser',
        passwordHash: 'hashed-password',
        createdAt: new Date(),
      };

      const tokenData = {
        token: 'valid-refresh-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 86400000), // 1 day from now
        createdAt: new Date(),
      };

      (TokenHandler.validateToken as jest.Mock).mockReturnValue(tokenPayload);
      refreshTokenRepository.findByToken.mockResolvedValue(tokenData as any);
      userRepository.findById.mockResolvedValue(user as any);
      (TokenHandler.generateAccessToken as jest.Mock).mockReturnValue('new-access-token');
      (TokenHandler.generateRefreshToken as jest.Mock).mockResolvedValue('new-refresh-token');

      const result = await service.refreshToken(refreshTokenDto);

      expect(result).toEqual({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      });
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith('valid-refresh-token');
    });

    it('should throw UnauthorizedException if token type is not refresh', async () => {
      const refreshTokenDto = {
        refreshToken: 'access-token',
      };

      (TokenHandler.validateToken as jest.Mock).mockReturnValue({
        userId: 'user-123',
        username: 'testuser',
        type: 'access',
      });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow('Invalid token type');
    });

    it('should throw UnauthorizedException if refresh token is not found in database', async () => {
      const refreshTokenDto = {
        refreshToken: 'unknown-token',
      };

      (TokenHandler.validateToken as jest.Mock).mockReturnValue({
        userId: 'user-123',
        username: 'testuser',
        type: 'refresh',
      });
      refreshTokenRepository.findByToken.mockResolvedValue(null);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow('Refresh token not found');
    });

    it('should throw UnauthorizedException if refresh token is expired', async () => {
      const refreshTokenDto = {
        refreshToken: 'expired-token',
      };

      const tokenData = {
        token: 'expired-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() - 86400000), // 1 day ago
        createdAt: new Date(),
      };

      (TokenHandler.validateToken as jest.Mock).mockReturnValue({
        userId: 'user-123',
        username: 'testuser',
        type: 'refresh',
      });
      refreshTokenRepository.findByToken.mockResolvedValue(tokenData as any);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow('Refresh token expired');
      expect(refreshTokenRepository.delete).toHaveBeenCalledWith('expired-token');
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const refreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const tokenData = {
        token: 'valid-refresh-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 86400000),
        createdAt: new Date(),
      };

      (TokenHandler.validateToken as jest.Mock).mockReturnValue({
        userId: 'user-123',
        username: 'testuser',
        type: 'refresh',
      });
      refreshTokenRepository.findByToken.mockResolvedValue(tokenData as any);
      userRepository.findById.mockResolvedValue(null);

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow('User not found');
    });

    it('should handle JWT TokenExpiredError', async () => {
      const refreshTokenDto = {
        refreshToken: 'expired-jwt-token',
      };

      (TokenHandler.validateToken as jest.Mock).mockImplementation(() => {
        throw new jwt.TokenExpiredError('jwt expired', new Date());
      });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow('Refresh token has expired');
    });

    it('should handle JWT JsonWebTokenError', async () => {
      const refreshTokenDto = {
        refreshToken: 'invalid-jwt-token',
      };

      (TokenHandler.validateToken as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError('invalid token');
      });

      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.refreshToken(refreshTokenDto)).rejects.toThrow('Invalid refresh token: invalid token');
    });
  });
});
