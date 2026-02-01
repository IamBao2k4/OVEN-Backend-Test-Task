import { IsString, IsNotEmpty, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Username for login',
    example: 'johndoe',
    maxLength: 30
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  username: string;

  @ApiProperty({
    description: 'Password for login',
    example: 'securePassword123',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;
}

export class RegisterDto {
  @ApiProperty({
    description: 'Username for registration',
    example: 'johndoe',
    maxLength: 30
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  username: string;

  @ApiProperty({
    description: 'Password for registration',
    example: 'securePassword123',
    maxLength: 100
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;
}

class UserResponseDto {
  @ApiProperty({ description: 'Username', example: 'johndoe' })
  username: string;

  @ApiProperty({ description: 'Account creation timestamp', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;

  constructor(user: { username: string; createdAt: Date; updatedAt: Date }) {
    this.username = user.username;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

export class LoginResponseDto {
  @ApiProperty({ description: 'User data', type: UserResponseDto })
  data: UserResponseDto;

  @ApiProperty({ description: 'JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ description: 'JWT refresh token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  constructor(user: UserResponseDto, accessToken: string, refreshToken: string) {
    this.data = user;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  static fromModel(user: { username: string; createdAt: Date; updatedAt: Date }, accessToken: string, refreshToken: string): LoginResponseDto {
    return new LoginResponseDto(new UserResponseDto(user), accessToken, refreshToken);
  }
}

export class RegisterResponseDto {
  @ApiProperty({ description: 'Success message', example: 'User registered successfully' })
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token to get new access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  @ApiProperty({ description: 'New JWT access token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ description: 'New JWT refresh token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;
}