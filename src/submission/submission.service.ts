import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetSubmissionDTO, NewSubmisionDTO } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Judge0Service } from '../judge0/judge0.service';
import { CreateSubmissionDTO } from 'src/judge0/dto';
import { languageSupport, SubmisionResult } from '../utils';

@Injectable()
export class SubmissionProvider {
  constructor(
    private prismaService: PrismaService,
    private readonly judge0Service: Judge0Service,
  ) {}

  async newSubmission(dto: NewSubmisionDTO) {
    try {
      const currTime = new Date();

      const question = await this.prismaService.question.findUnique({
        where: { id: dto.questionId },
        select: {
          Test: {
            select: {
              startTime: true,
              endTime: true,
              evaluationScheme: true,
            },
          },
        },
      });

      if (
        currTime < question.Test.startTime ||
        question.Test.endTime < currTime
      ) {
        throw new ForbiddenException('Submissions not allowed');
      }

      const testCases = await this.prismaService.testCase.findUnique({
        where: { questionId: dto.questionId },
      });

      const submissionDTO: CreateSubmissionDTO = {
        language_id: languageSupport[dto.code.language],
        source_code: dto.code.code,
        stdin: testCases.input,
      };

      //todo: handle judge0 rate limit

      const result: SubmisionResult =
        await this.judge0Service.createSubmission(submissionDTO);

      let statusCode: number | null = null;
      let errorMessage: string | null = null;

      if (result.status.id === 3) {
        statusCode = result.stdout === testCases.output ? 1 : 2;
      } else if (result.status.id === 5) {
        statusCode = 3;
      } else if (result.status.id === 6) {
        statusCode = 4;
        errorMessage = result.compile_output;
      } else if ([7, 8, 9, 10, 11, 12].includes(result.status.id)) {
        statusCode = 5;
        errorMessage = result.stderr;
      } else if (result.status.id === 14) {
        statusCode = 6;
      } else statusCode = 7;

      const submission = await this.prismaService.submission.create({
        data: {
          code: dto.code.code,
          language: dto.code.language,
          statusCode: statusCode,
          time: currTime,
        },
      });

      const studentSubmission =
        await this.prismaService.studentSubmission.create({
          data: {
            userId: dto.studentId,
            questionId: dto.questionId,
            submissionId: submission.id,
          },
        });

      if (statusCode === 1) {
        const hasPoints =
          await this.prismaService.studentQuestion.count({
            where: {
              userId: dto.studentId,
              questionId: dto.questionId,
            },
          });

        if (hasPoints === 0) {
          //todo: think about encapsulating logic of this into question service;
          
          const questionPoints =
            await this.prismaService.question.findUnique({
              where: { id: dto.questionId },
              select: {
                points: true,
                availablePoints: true,
              },
            });

          const studentPoints =
            await this.prismaService.studentQuestion.create({
              data: {
                userId: dto.studentId,
                questionId: dto.questionId,
                points: questionPoints.availablePoints,
              },
            });
          
          if (question.Test.evaluationScheme.toLowerCase() === "dynamic") {

            const num_of_submissions = await this.prismaService.studentQuestion.count({
              where: { questionId: dto.questionId }
            });

            const submissions_to_reduce_pts = Math.ceil(200 / questionPoints.points);

            if (num_of_submissions !== 0 && num_of_submissions % submissions_to_reduce_pts === 0) {
              const question_point_update = await this.prismaService.question.update({
                where: {
                  id: dto.questionId
                },
                data: {
                  availablePoints: Math.max(questionPoints.availablePoints - 1, Math.round(questionPoints.points / 2))
                }
              })
            }
          }
        }
      }

      return { submission, errorMessage };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        throw new ConflictException('Submission already exists');

      throw err;
    }
  }

  async getSubmissionsQuestion(dto: GetSubmissionDTO) {
    try {
      const submissions =
        await this.prismaService.studentSubmission.findMany({
          where: { questionId: dto.queId },
          select: {
            submission: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

      return { submissions };
    } catch (err) {
      throw err;
    }
  }

  async getSubmissions(dto: GetSubmissionDTO) {
    try {
      const submissions =
        await this.prismaService.studentSubmission.findMany({
          where: { questionId: dto.queId, userId: dto.userId },
          select: {
            submission: true,
          },
        });
      
      submissions.sort((a, b) => b.submission.id - a.submission.id);

      return { submissions };
    } catch (err) {
      throw err;
    }
  }

  async getSubmissionsUser(dto: { userId: number }) {
    try {
      const submissions =
        await this.prismaService.studentSubmission.findMany({
          where: { userId: dto.userId },
          select: {
            question: {
              select: {
                name: true,
                id: true,
              },
            },
            submission: true,
          },
        });

      return { submissions };
    } catch (err) {
      throw err;
    }
  }
}
