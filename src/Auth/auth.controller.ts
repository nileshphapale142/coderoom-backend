import { Controller, Get, Post, Req, Body, ParseIntPipe } from '@nestjs/common';
import { AuthProvider } from './auth.service';
import { SignUpDto, SignInDto } from './dto';

@Controller('/auth')
export class AuthController {
  constructor(private authProvider: AuthProvider) {}

  @Post('/signup')
  signUp(@Body() dto: SignUpDto) {
    return this.authProvider.signUp(dto);
  }

  @Post('/signin')
  signIn(@Body() dto: SignInDto) {
    return this.authProvider.signIn(dto);
  }
}
