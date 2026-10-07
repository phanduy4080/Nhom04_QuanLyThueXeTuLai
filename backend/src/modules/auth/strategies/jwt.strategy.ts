import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'super_secret_jwt_key_nhom04_2026'),
    });
  }

  async validate(payload: { sub: string; email: string; roles: string[] }) {
    const user = await this.prisma.user.findUnique({
      where: { publicId: payload.sub },
      include: {
        userRoles: {
          include: { role: true },
        },
        staff: true,
        customer: true,
      },
    });

    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Tài khoản không tồn tại hoặc đã bị khóa');
    }

    const roles = user.userRoles.map((ur) => ur.role.code);
    const fullName = user.staff?.fullName || user.customer?.fullName || user.email || 'Người dùng';

    return {
      userId: user.userId.toString(),
      publicId: user.publicId,
      email: user.email,
      phone: user.phone,
      userType: user.userType,
      roles,
      fullName,
    };
  }
}
