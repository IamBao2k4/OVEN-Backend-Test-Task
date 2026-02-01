import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import * as dto from '../dto/auth.dto';
import { BaseResponse } from 'src/dto/common.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: dto.RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully', type: dto.RegisterResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 409, description: 'Conflict - User already exists' })
  async register(@Body() data: dto.RegisterDto): Promise<BaseResponse<dto.RegisterResponseDto>> {
    await this.authService.register(data);
    return {
      data: new dto.RegisterResponseDto("User registered successfully"),
      message: 'User registered successfully',
      statusCode: HttpStatus.CREATED,
      timestamp: new Date().toISOString()
    };

  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiBody({ type: dto.LoginDto })
  @ApiResponse({ status: 200, description: 'User logged in successfully', type: dto.LoginResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  async login(@Body() data: dto.LoginDto): Promise<BaseResponse<dto.LoginResponseDto>> {
    const res = await this.authService.login(data);
    return {
      data: res,
      message: 'User logged in successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString()
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiBody({ type: dto.RefreshTokenDto })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully', type: dto.RefreshTokenResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or expired refresh token' })
  async refreshToken(@Body() data: dto.RefreshTokenDto): Promise<BaseResponse<dto.RefreshTokenResponseDto>> {
    const res = await this.authService.refreshToken(data);
    return {
      data: res,
      message: 'Token refreshed successfully',
      statusCode: HttpStatus.OK,
      timestamp: new Date().toISOString()
    };
  }
}