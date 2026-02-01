import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../src/guards/jwt-auth.guard';
import { TokenHandler } from '../src/helper/token';

// Mock the TokenHandler
jest.mock('../src/helper/token');

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    guard = new JwtAuthGuard();

    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn(),
      }),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true for valid Bearer token', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      const mockPayload = {
        userId: 'user-123',
        username: 'testuser',
        type: 'access',
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
      (TokenHandler.validateToken as jest.Mock).mockReturnValue(mockPayload);

      const result = guard.canActivate(mockExecutionContext);

      expect(result).toBe(true);
      expect(TokenHandler.validateToken).toHaveBeenCalledWith('valid-token');
      expect((mockRequest as any).user).toEqual(mockPayload);
    });

    it('should attach user payload to request object', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer valid-token',
        },
      };

      const mockPayload = {
        userId: 'user-456',
        username: 'anotheruser',
        type: 'access',
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
      (TokenHandler.validateToken as jest.Mock).mockReturnValue(mockPayload);

      guard.canActivate(mockExecutionContext);

      expect((mockRequest as any).user).toEqual(mockPayload);
    });

    it('should throw UnauthorizedException when no authorization header is present', () => {
      const mockRequest = {
        headers: {},
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('No authorization header');
      expect(TokenHandler.validateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when authorization header is empty', () => {
      const mockRequest = {
        headers: {
          authorization: '',
        },
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when Bearer keyword is missing', () => {
      const mockRequest = {
        headers: {
          authorization: 'valid-token',
        },
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Invalid authorization header format');
    });

    it('should throw UnauthorizedException when token is missing after Bearer', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer ',
        },
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Invalid authorization header format');
    });

    it('should throw UnauthorizedException when only Bearer keyword is present', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer',
        },
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Invalid authorization header format');
    });

    it('should throw UnauthorizedException when bearer keyword is lowercase but not accepted as Bearer', () => {
      const mockRequest = {
        headers: {
          authorization: 'bearer valid-token',
        },
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Invalid authorization header format');
    });

    it('should throw UnauthorizedException when token validation fails', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer invalid-token',
        },
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
      (TokenHandler.validateToken as jest.Mock).mockImplementation(() => {
        throw new UnauthorizedException('Invalid token');
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Invalid or expired token');
    });

    it('should throw UnauthorizedException for expired token', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer expired-token',
        },
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
      (TokenHandler.validateToken as jest.Mock).mockImplementation(() => {
        throw new Error('Token expired');
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Invalid or expired token');
    });

    it('should handle different token validation errors', () => {
      const mockRequest = {
        headers: {
          authorization: 'Bearer malformed-token',
        },
      };

      (mockExecutionContext.switchToHttp().getRequest as jest.Mock).mockReturnValue(mockRequest);
      (TokenHandler.validateToken as jest.Mock).mockImplementation(() => {
        throw new Error('Malformed token');
      });

      expect(() => guard.canActivate(mockExecutionContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockExecutionContext)).toThrow('Invalid or expired token');
    });
  });
});
