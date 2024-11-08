import { ForbiddenException, Injectable } from '@nestjs/common';
import { SignInDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthProvider } from '../auth/auth.service';
import * as argon from 'argon2';

@Injectable()
export class AdminProvider {
  constructor(
    private prismaService: PrismaService,
  private authProvider: AuthProvider) {}
  
  async signIn(dto: SignInDto) {
    const admin = await this.prismaService.admin.findUnique({
      where: {
        userName: dto.userName,
      },
    });

    if (!admin) throw new ForbiddenException('Credentials not found');

    const pwMatches = await argon.verify(admin.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Wrong password');

    return { at: await this.authProvider.signToken(admin.id, admin.userName) }
  }
  
  getUnVerifiedTeachers() {
    return "get list"
  }
}
