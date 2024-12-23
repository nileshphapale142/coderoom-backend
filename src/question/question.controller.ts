import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post, UseGuards
} from '@nestjs/common';
import { QuestionProvider } from './question.service';
import {
  AddStudentPointsDTO,
  EditQuestionDTO,
  GetQuestionDTO,
  NewQuestionDTO,
} from './dto';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('question')
export class QuestionController {
  constructor(private questionProvider: QuestionProvider) {}

  @Post('new')
  createQuestion(@GetUser() user: User, @Body() dto: NewQuestionDTO) {
    dto.teacherId = user.id
    return this.questionProvider.createQuestion(dto);
  }

  @Get(':id')
  getQuestion(@GetUser() user: User, @Param() dto: GetQuestionDTO) {
    dto.userId = user.id
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
  
  @Patch(':id/edit')
  updateQuestion(
    @GetUser() user: User, 
    @Param('id') id: number, 
    @Body() dto:EditQuestionDTO) {
    dto.questionId = id;
    dto.teacherId = user.id;
    return this.questionProvider.updateQuestion(dto);
  }
}