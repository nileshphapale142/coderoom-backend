import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthProvider } from './auth.service';
import { SignInDto, SignUpDto } from './dto';


@Controller('/auth')
export class AuthController {
  constructor(private authProvider: AuthProvider) {}

  @Post('/signup')
  async signUp(@Body() dto: SignUpDto, @Res({passthrough: true}) response: Response) {
    const access_token = await this.authProvider.signUp(dto);

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    response.cookie('access_token', access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        partitioned: true,
        expires: expiryDate
      });
    
      response.cookie('is_teacher', dto.isTeacher, {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        partitioned: true,
        expires: expiryDate
      });
    
    response.header('Content-Type', 'application/json');
    return access_token
  }

  @Post('/signin')
  async signIn(@Body() dto: SignInDto, @Res({passthrough: true}) response: Response) {
    const {at, isTeacher } =  await this.authProvider.signIn(dto);
    const { access_token } = at

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + 30)

    response.cookie('access_token', access_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        partitioned: true,
        expires: expiryDate
      });
    
      response.cookie('is_teacher', isTeacher, {
        httpOnly: false,
        secure: true,
        sameSite: 'none',
        partitioned: true,
        expires: expiryDate
      });
    
    response.header('Content-Type', 'application/json');


    return access_token
  }
}
