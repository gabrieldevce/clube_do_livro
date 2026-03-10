import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const { passwordHash: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Email ou senha inválidos');
    return { access_token: this.jwtService.sign({ sub: user.id, email: user.email }) };
  }

  async register(name: string, email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new UnauthorizedException('Email já cadastrado');
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: { name, email, passwordHash },
    });
    return { access_token: this.jwtService.sign({ sub: user.id, email: user.email }) };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userBadges: { include: { badge: true } },
      },
    });
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    const { passwordHash: _, ...safe } = user;
    return {
      ...safe,
      points: user.points,
      level: user.level,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      userBadges: user.userBadges?.map((ub) => ({ badge: ub.badge })) ?? [],
    };
  }
}
