import { Global, Module } from '@nestjs/common';
import { Judge0Service } from './judge0.service';
import { HttpModule } from '@nestjs/axios';

@Global()
@Module({
  imports: [HttpModule],
  providers: [Judge0Service],
  exports: [Judge0Service]
})
export class Judge0Module {}
