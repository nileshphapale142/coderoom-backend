import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminProvider } from './admin.service';
import { JwtStrategy } from './auth/strategy';
import { AuthModule } from '../auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
    imports: [AuthModule, JwtModule.register({}), UserModule], 
    controllers: [AdminController],
    providers: [AdminProvider, JwtStrategy],
    exports: [AdminProvider]
})
export class AdminModule {}