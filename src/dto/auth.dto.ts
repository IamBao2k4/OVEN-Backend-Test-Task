import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

class UserResponseDto {
  username: string;
  createdAt: Date;
  updatedAt: Date;
  constructor(user: { username: string; createdAt: Date; updatedAt: Date }) {
    this.username = user.username;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}

export class LoginResponseDto {
  user: UserResponseDto;
  accessToken: string;
  refreshToken: string;

  constructor(user: UserResponseDto, accessToken: string, refreshToken: string) {
    this.user = user;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  static fromModel(user: { username: string; createdAt: Date; updatedAt: Date }, accessToken: string, refreshToken: string): LoginResponseDto {
    return new LoginResponseDto(new UserResponseDto(user), accessToken, refreshToken);
  }
}

export class RegisterResponseDto {
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class RefreshTokenResponseDto {
  accessToken: string;
  refreshToken: string;
}