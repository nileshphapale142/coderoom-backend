import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthProvider } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthProvider, JwtStrategy],
  exports: [AuthProvider]
})
export class AuthModule {}