import { Controller, Post, Body, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthProvider } from './auth.service';
import { SignUpDto, SignInDto } from './dto';

@Controller('/auth')
export class AuthController {
  constructor(private authProvider: AuthProvider) {}

  @Post('/signup')
  async signUp(@Body() dto: SignUpDto, @Res({passthrough: true}) response: Response) {
    const access_token = await this.authProvider.signUp(dto);
    response.cookie('access_token', access_token.access_token, {
      httpOnly: true,
      secure: true
    })
    return access_token
  }

  @Post('/signin')
  async signIn(@Body() dto: SignInDto, @Res({passthrough: true}) response: Response) {
    const access_token =  await this.authProvider.signIn(dto);
    response.cookie('access_token', access_token.access_token, {
      httpOnly: true,
      secure: true
    })
    return access_token
  }
}
