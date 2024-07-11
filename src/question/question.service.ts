import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetQuestionDTO, NewQuestionDTO } from './dto';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import { Judge0Service } from '../judge0/judge0.service';
import { CreateSubmissionDTO } from '../judge0/dto';
import { languageSupport, SubmisionResult, toString } from '../utils';

@Injectable()
export class QuestionProvider {
  constructor(
    private prismaService: PrismaService,
    private readonly judge0Service: Judge0Service,
  ) {}

  private async processSubmission(dto: CreateSubmissionDTO) {
    try {
      const result: SubmisionResult =
        await this.judge0Service.createSubmission(dto);

      if (result.status.id === 5) {
        throw new GatewayTimeoutException(
          'Time limit exceeded for the test cases',
        );
      } else if (result.status.id === 6) {
        throw new BadRequestException(
          'Compilation Error: ' + result.compile_output,
        );
      } else if ([7, 8, 9, 10, 11, 12].includes(result.status.id)) {
        throw new BadRequestException(
          'Runtime error: ' + result.stderr,
        );
      } else if (result.status.id === 14) {
        throw new BadRequestException(
          'Code execution failed: Exec format error. Please check your code and try again.',
        );
      }

      return result;
    } catch (err) {
      throw err;
    }
  }

  async createQuestion(dto: NewQuestionDTO) {
    try {
      const test = await this.prismaService.test.findUnique({
        where: { id: dto.testId },
        select: {
          allowedLanguages: true,
          course: {
            select: {
              teacherId: true,
            },
          },
        },
      });

      if (dto.teacherId !== test.course.teacherId)
        throw new ForbiddenException('Unauthorized to add question');

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

      const etcs =
        await this.prismaService.exampleTestCase.createMany({
          data: dto.exampleTestCases.map((testCase) => {
            return {
              questionId: question.id,
              input: testCase.input,
              output: testCase.ouput,
              explaination: testCase.explaination,
            };
          }),
        });

      const submissionDTO: CreateSubmissionDTO = {
        language_id: languageSupport[dto.solutionCode.language],
        source_code: dto.solutionCode.code,
        stdin: dto.testCases,
      };

      //todo: handle judge0 rate limit

      const result =
        await this.processSubmission(submissionDTO);

      const testCases = await this.prismaService.testCase.create({
        data: { 
          questionId: question.id,
          input: dto.testCases,
          output: result.stdout ? result.stdout : '',
        },
      });

      question = await this.prismaService.question.findUnique({
        where: { id: question.id },
        include: {
          solution: true,
          testCases: true,
          exampleTestCases: true,
        },
      });

      return { question };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        throw new ConflictException('Question already exists');

      throw err;
    }
  }

  async getQuestion(dto: GetQuestionDTO) {
    try {
      const test = await this.prismaService.question.findUnique({
        where: { id: dto.id },
        select: {
          Test: {
            select: {
              course: {
                select: {
                  teacherId: true,
                  enrolledStudents: true,
                },
              },
            },
          },
        },
      });

      if (!test)
        throw new NotFoundException('Question does not exist');

      let question = null;

      if (dto.userId === test.Test.course.teacherId) {
        question = await this.prismaService.question.findUnique({
          where: { id: dto.id },
          include: {
            solution: true,
            testCases: true,
            exampleTestCases: true,
          },
        });
      } else if (
        test.Test.course.enrolledStudents.some(
          ({ userId }) => userId === dto.userId,
        )
      ) {
        question = await this.prismaService.question.findUnique({
          where: { id: dto.id },
          include: {
            exampleTestCases: true,
          },
        });

        if (!question)
          throw new NotFoundException('Question not found');

        return { question };
      } else {
        throw new ForbiddenException(
          'Not allowed to access question',
        );
      }

      if (!question)
        throw new NotFoundException('Question not found');

      return { question };
    } catch (err) {
      if (err instanceof PrismaClientUnknownRequestError)
        throw new ForbiddenException('Question not found');
      throw err;
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
