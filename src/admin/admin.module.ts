import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminProvider } from './admin.service';
import { JwtStrategy } from './auth/strategy';
import { AuthModule } from 'src/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [AuthModule, JwtModule.register({})], 
    controllers: [AdminController],
    providers: [AdminProvider, JwtStrategy],
    exports: [AdminProvider]
})
export class AdminModule {}