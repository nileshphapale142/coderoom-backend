import { Controller, Get, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { UserProvider } from './user.service';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {

    constructor(private userProvider: UserProvider) {}

    @Get('getCourses')
    async getCourses(@GetUser() user: User){      
        return this.userProvider.getCourses(user)
    }
}
