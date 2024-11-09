import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AdminProvider } from './admin.service';
import { SignInDto, TeacherDTO } from './dto';
import { Admin } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { AdminJwtGuard } from './auth/guard';

@Controller('admin')
export class AdminController {
  constructor(private AdminProvider: AdminProvider) {}
  
  @Post('auth/signin')
  async signIn(@Body() dto: SignInDto) {
    return await this.AdminProvider.signIn(dto)
  }
  
  @UseGuards(AdminJwtGuard)
  @Get('getTeachers')
  getUnVerifiedTeachers(@GetUser() admin:Admin) {
    return this.AdminProvider.getUnVerifiedTeachers(admin)
  }
  
  
  @UseGuards(AdminJwtGuard) 
  @Patch('approve/teacher/:id')
  approveTeacher(@GetUser() admin: Admin, @Param() dto: TeacherDTO) {
    return this.AdminProvider.approveTeacher(admin, dto)
  }
}
