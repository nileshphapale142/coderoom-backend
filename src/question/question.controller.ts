import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { QuestionProvider } from './question.service';
import {
  AddStudentPointsDTO,
  GetQuestionDTO,
  NewQuestionDTO,
} from './dto';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('question')
export class QuestionController {
  constructor(private questionProvider: QuestionProvider) {}

  @Post('new')
  createQuestion(@Body() dto: NewQuestionDTO) {
    console.log({ dto: dto });
    return this.questionProvider.createQuestion(dto);
  }

  @Get(':id')
  getQuestion(@Param() dto: GetQuestionDTO) {
    return this.questionProvider.getQuestion(dto);
  }

  @Post('addPoints')
  addStudentPoints(
    @GetUser() user: User,
    @Body() dto: AddStudentPointsDTO,
  ) {
    return this.questionProvider.addStudentPoints({
      userId: user.id,
      queId: dto.id,
      points: dto.points,
    });
  }
}