import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { PrismaService } from '../../database/prisma.service';

interface RequestWithUser extends Request {
  user?: {
    userId: string;
    email: string;
    roleId?: string;
    roleName?: string;
    employeeId?: string;
    permissions: string[];
  };
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Access token is missing');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.secret'),
      });

      // Fetch fresh permissions from DB to handle stale tokens
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
         throw new UnauthorizedException('User not found');
      }

      const freshPermissions = user.role?.permissions.map(
        (rp: any) => `${rp.permission.resource}:${rp.permission.action}`,
      ) || [];

      request.user = {
        userId: payload.sub,
        email: payload.email,
        roleId: payload.roleId,
        roleName: payload.roleName,
        employeeId: user.employeeId || payload.employeeId,
        permissions: freshPermissions.length > 0 ? freshPermissions : (payload.permissions || []),
      };
    } catch (error) {
      console.error('JwtAuthGuard Error:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
