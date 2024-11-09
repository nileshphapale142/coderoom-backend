import { ForbiddenException, Injectable } from '@nestjs/common';
import { SignInDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthProvider } from '../auth/auth.service';
import * as argon from 'argon2';
import { env } from 'configs';
import { Admin } from '@prisma/client';

@Injectable()
export class AdminProvider {
  constructor(
    private prismaService: PrismaService,
  private authProvider: AuthProvider) {}
  
  async createAdmin() {
    const adminUserName = env.ADMIN.USERANME;
    const adminPassword = env.ADMIN.PASSWORD; 
    
    const existingAdmin = await this.prismaService.admin.findFirst({
      where: { userName: adminUserName },
    });
  
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
  
    const hashedPassword = await argon.hash(adminPassword);
  
    await this.prismaService.admin.create({
      data: {
        userName: adminUserName,
        password: hashedPassword,
      },
    });
  
    console.log('Admin user created successfully');
  }
  
  
  async signIn(dto: SignInDto) {
    const admin = await this.prismaService.admin.findUnique({
      where: {
        userName: dto.userName,
      },
    });

    if (!admin) throw new ForbiddenException('Credentials not found');

    const pwMatches = await argon.verify(admin.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Wrong password');

    return await this.authProvider.signToken(admin.id, admin.userName)
  }
  
  async getUnVerifiedTeachers(admin: Admin) {
      
    const unverified_teachers = (await this.prismaService.admin.findUnique({
      where: {id: admin.id}, 
      select: {
        unVerifiedTeachers: {
          select: {
            name: true, 
            email: true
          }
        }
      }
    })).unVerifiedTeachers
    
    return { unverified_teachers }
  }
}
