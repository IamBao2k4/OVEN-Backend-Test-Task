import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import * as dto from '../dto/auth.dto';
import { BaseResponse } from 'src/dto/common.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
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