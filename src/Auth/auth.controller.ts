import { Controller, Get, Post } from "@nestjs/common";
import { AuthProvider } from './auth.service'

@Controller('/auth')
export class AuthController {

    constructor(private authProvider: AuthProvider) {

    }

    @Post('/signup')
    singUp() {

    }

    @Post('/signin')
    signIn() {

    }
}