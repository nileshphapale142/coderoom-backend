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
      let question = await this.prismaService.question.create({
        data: {
          name: dto.name,
          statement: dto.description,
          points: dto.points,
          testId: dto.testId,
        },
      });

      const solution = await this.prismaService.code.create({
        data: {
          solQueId: question.id,
          code: dto.solutionCode.code,
          language: dto.solutionCode.language,
        },
      });

      const inputs = await this.prismaService.iO.createMany({
        data: dto.inputs.map((input) => {
          return {
            inputQuestionId: question.id,
            type: input.type,
            name: input.name,
          };
        }),
      });

      const output = await  this.prismaService.iO.create({
        data: {
         outputQuestionId: question.id,
         type: dto.output.type,
         name: dto.output.name 
        }
      })

      //todo: add test cases

      question = await this.prismaService.question.findUnique({
        where: {id: question.id},
        include: {
          solution: true,
          inputs: true,
          outputs: true
        }
      })

      return { question };
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
