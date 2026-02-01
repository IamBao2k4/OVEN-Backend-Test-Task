import { IsString, IsNotEmpty, Max, MaxLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  username: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
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
  data: UserResponseDto;
  accessToken: string;
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