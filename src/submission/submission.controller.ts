import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SubmissionProvider } from './submission.service';
import { GetSubmissionDTO, NewSubmisionDTO } from './dto';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';
import { JwtGuard } from '../auth/guard';

@UseGuards(JwtGuard)
@Controller('submission')
export class SubmissionController {
  constructor(private submissionProvider: SubmissionProvider) {}

  @Post('/new')
  newSubmission(@GetUser() user: User, @Body() dto: NewSubmisionDTO) {
    dto = {
      studentId: user.id,
      ...dto,
    };

    return this.submissionProvider.newSubmission(dto);
  }

  @Get('/question/:queId/all')
  getSubmissionsQuestion(@Param() dto: GetSubmissionDTO) {
    return this.submissionProvider.getSubmissionsQuestion(dto);
  }

  @Get('/user/question/:queId')
  getSubmissions(
    @GetUser() user: User,
    @Param() dto: GetSubmissionDTO,
  ) {
    dto.userId = user.id;
    return this.submissionProvider.getSubmissions(dto);
  }

  @Get('/user')
  getSubmissionsUser(@GetUser() user: User) {
    return this.submissionProvider.getSubmissionsUser({
      userId: user.id,
    });
  }
}
