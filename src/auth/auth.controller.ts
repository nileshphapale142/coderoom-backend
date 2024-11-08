import { Body, Controller, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthProvider } from './auth.service';
import { SignInDto, SignUpDto } from './dto';


@Controller('/auth')
export class AuthController {
  
  constructor(private authProvider: AuthProvider) {}
  
  cookieOptions = {
    secure: false,
    sameSite: 'lax' as boolean | 'none' | 'lax' | 'strict',
    partitioned: true,
  };

  @Post('/signup')
  async signUp(@Body() dto: SignUpDto, @Res({passthrough: true}) response: Response) {
    const access_token = await this.authProvider.signUp(dto);

    
    
    response.header('Content-Type', 'application/json');
    return { access_token: access_token.access_token, isTeacher: dto.isTeacher };
  }

  @Post('/signin')
  async signIn(@Body() dto: SignInDto, @Res({passthrough: true}) response: Response) {
    const {at, isTeacher } =  await this.authProvider.signIn(dto);
    const { access_token } = at;

  
    
    response.header('Content-Type', 'application/json');
    

    return { access_token, isTeacher };
  }
}
