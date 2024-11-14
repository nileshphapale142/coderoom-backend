import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserProvider } from './user.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
    imports: [MailModule],
    controllers:[UserController],
    providers: [UserProvider],
    exports: [UserProvider]
})
export class UserModule {}
