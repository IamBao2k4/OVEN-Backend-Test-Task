import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TokenHandler } from 'src/helper/token';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      throw new UnauthorizedException('Unauthorized');
    }

    const bearerToken = token.split(' ')[1];
    const isValidToken = TokenHandler.validateToken(bearerToken);

    if (!isValidToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
