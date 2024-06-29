import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { TestProvider } from './test.service';

@Module({
  controllers: [TestController],
  providers: [TestProvider],
  exports: [TestProvider]
})
export class TestModule {}
