import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestProvider } from './test.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [TestController],
  providers: [TestProvider],
  exports: [TestProvider]
})
export class TestModule {}
