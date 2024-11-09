import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { SignInDto, TeacherDTO } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { AuthProvider } from '../auth/auth.service';
import * as argon from 'argon2';
import { env } from 'configs';
import { Admin } from '@prisma/client';
import { UserProvider } from 'src/user/user.service';

@Injectable()
export class AdminProvider {
  constructor(
    private prismaService: PrismaService,
    private authProvider: AuthProvider, 
    private userService: UserProvider) {}
  
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
    try {
      
      const admin = await this.prismaService.admin.findUnique({
        where: {
          userName: dto.userName,
        },
      });

      if (!admin) throw new ForbiddenException('Credentials not found');

      const pwMatches = await argon.verify(admin.password, dto.password);

      if (!pwMatches) throw new ForbiddenException('Wrong password');

      return await this.authProvider.signToken(admin.id, admin.userName)
    } catch(err) {
      throw err;
    }
  }
  
  async getUnVerifiedTeachers(admin: Admin) {
    
    try {
      
      const unverified_teachers = (await this.prismaService.admin.findUnique({
        where: {id: admin.id}, 
        select: {
          unVerifiedTeachers: {
            select: {
              name: true, 
              email: true,
              id: true
            }
          }
        }
      }))?.unVerifiedTeachers
      
      if (!unverified_teachers) throw new NotFoundException('Admin not found')
    
    return { unverified_teachers }
    } catch(err) {
      throw err
    }
  }
  
  
  async approveTeacher(admin:Admin, dto: TeacherDTO) {
    try {      
      const _ = await this.userService.verifyTeacher(dto.id);
      
      return {message: "Teacher verified"}
    } catch(err){
      throw err
    }
  }
}