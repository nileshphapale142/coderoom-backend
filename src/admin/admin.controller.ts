import { Body, Controller, Get, Post } from '@nestjs/common';
import { AdminProvider } from './admin.service';
import { SignInDto } from './dto';

@Controller('admin')
export class AdminController {
  constructor(private AdminProvider: AdminProvider) {}
  
  @Post('/auth/signin')
  async signIn(@Body() dto: SignInDto) {
    return await this.AdminProvider.signIn(dto)
  }
  
  @Get('/getTeachers')
  getUnVerifiedTeachers() {
    return this.AdminProvider.getUnVerifiedTeachers()
  }
}
