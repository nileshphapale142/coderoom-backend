import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetQuestionDTO, NewQuestionDTO } from './dto';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';

@Injectable()
export class QuestionProvider {
  constructor(private prismaService: PrismaService) {}

  async createQuestion(dto: NewQuestionDTO) {
    try {
      const question = await this.prismaService.question.create({
        data: {
          name: dto.name,
          statement: 'demo statment',
          points: 100,
          solution: 'demo solution',
          templateCode: 'demo code',
          testId: dto.testId,
        },
      });

      return question;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        throw new ConflictException('Question already exists');

      throw err;
    }
  }

  async getQuestion(dto: GetQuestionDTO) {
    try {
      const question = await this.prismaService.question.findUnique({
        where: { id: dto.id },
      });

      if (!question)
        throw new NotFoundException('Question not found');

      return question;
    } catch (err) {
      if (err instanceof PrismaClientUnknownRequestError)
        throw new NotFoundException('Question not found');
    }
  }

  async addStudentPoints({
    userId,
    queId,
    points,
  }: {
    userId: number;
    queId: number;
    points: number;
  }) {
    try {
      const studentPoints =
        await this.prismaService.studentQuestion.create({
          data: {
            userId: userId,
            questionId: queId,
            points: points,
          },
        });

      return studentPoints;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        throw new ConflictException(
          'Student already has points for the question',
        );

      throw err;
    }
  }
}
