import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    GatewayTimeoutException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import {
    PrismaClientKnownRequestError,
    PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import { CreateSubmissionDTO } from '../judge0/dto';
import { Judge0Service } from '../judge0/judge0.service';
import { PrismaService } from '../prisma/prisma.service';
import { languageSupport, SubmisionResult, toString } from '../utils';
import { EditQuestionDTO, GetQuestionDTO, NewQuestionDTO } from './dto';
import { NotFoundError } from 'rxjs';
import { exit } from 'process';

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
          'Compilation Error: ' + toString(result.compile_output),
        );
      } else if ([7, 8, 9, 10, 11, 12].includes(result.status.id)) {
        throw new BadRequestException(
          'Runtime error: ' + toString(result.stderr),
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

  private async processSubmissionBatch(dto: CreateSubmissionDTO) {
    type batchResult = {
      token: string;
    }
    try {
      const result =
        await this.judge0Service.createSubmissionBactch([dto]);

      // if (result.status.id === 5) {
      //   throw new GatewayTimeoutException(
      //     'Time limit exceeded for the test cases',
      //   );
      // } else if (result.status.id === 6) {
      //   throw new BadRequestException(
      //     'Compilation Error: ' + result.compile_output,
      //   );
      // } else if ([7, 8, 9, 10, 11, 12].includes(result.status.id)) {
      //   throw new BadRequestException(
      //     'Runtime error: ' + result.stderr,
      //   );
      // } else if (result.status.id === 14) {
      //   throw new BadRequestException(
      //     'Code execution failed: Exec format error. Please check your code and try again.',
      //   );
      // }

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
      
      const submissionDTO: CreateSubmissionDTO = {
        language_id: languageSupport[dto.solutionCode.language.toLowerCase()],
        source_code: dto.solutionCode.code,
        stdin: dto.testCases,
      };
      
      //todo: handle judge0 rate limit
      let result: SubmisionResult;
      
      result = await this.processSubmission(submissionDTO);
      

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
              output: testCase.output,
              explaination: testCase.explaination,
            };
          }),
        });
  
      
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
            Test: {
              select: {
                endTime: true, 
                allowedLanguages: true
              }
            }
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
  
  
  async updateQuestion(dto: EditQuestionDTO) {
    try {
      const existingQuestion = await this.prismaService.question.findUnique({
        where: { id: dto.questionId },
        include: {
          solution: true,
          exampleTestCases: true,
          testCases: true,
          Test: {
            select: {
              course: {
                select: {
                  teacherId: true
                }
              }
            }
          }
        }
    });

      if (!existingQuestion) throw new NotFoundException('Question not found');
      if (existingQuestion.Test.course.teacherId !== dto.teacherId) throw new ForbiddenException('Unauthorized to edit question');
      
      const updatedQuestion = await this.prismaService.question.update({
        where: { id: dto.questionId },
        data: {
          name: dto.name,
          points: dto.points,
          statement: dto.description,
        }
      });
      
      //todo: optimize
      if (dto.exampleTestCases.length >= existingQuestion.exampleTestCases.length) {
        const etcUpdates = existingQuestion.exampleTestCases.map(async (etc, idx) => {
          return await this.prismaService.exampleTestCase.update({
            where: {id: etc.id},
            data: {
              ...dto.exampleTestCases[idx]
            }
          })
        })
        
        if (dto.exampleTestCases.length > existingQuestion.exampleTestCases.length) {
          dto.exampleTestCases = dto.exampleTestCases.slice(existingQuestion.exampleTestCases.length);
          
          const etcs =
            await this.prismaService.exampleTestCase.createMany({
              data: dto.exampleTestCases.map((testCase) => {
                return {
                  questionId: dto.questionId,
                  input: testCase.input,
                  output: testCase.output,
                  explaination: testCase.explaination,
                };
              }),
            });
        }
      } else {
        const toBeDeleted = existingQuestion.exampleTestCases.slice(dto.exampleTestCases.length)
        const notDeleted = existingQuestion.exampleTestCases.slice(0, dto.exampleTestCases.length)
        
        const etcDeleted = toBeDeleted.map(async (etc) => {
          return await this.prismaService.exampleTestCase.delete({
            where: { id: etc.id }
          })
        });
        
        const etcUpdated = notDeleted.map(async (etc, idx) => {
          return await this.prismaService.exampleTestCase.update({
            where: { id: etc.id },
            data: { ...dto.exampleTestCases[idx] }
          })
        });
      } 

      if (
        dto.solutionCode.language.toLowerCase() !== existingQuestion.solution[0].language.toLowerCase()
        || dto.solutionCode.code !== existingQuestion.solution[0].code
       || dto.testCases !== existingQuestion.testCases.input 
        ) {
          
          const submissionDTO: CreateSubmissionDTO = {
            language_id: languageSupport[dto.solutionCode.language.toLowerCase()],
            source_code: dto.solutionCode.code,
            stdin: dto.testCases,
          };
          
          const result = await this.processSubmission(submissionDTO); 
          
          const solution = await this.prismaService.code.update({
            where: {id: existingQuestion.solution[0].id},
            data: {
              code: dto.solutionCode.code,
              language: dto.solutionCode.language,
            },
          });
          
          const testCases = await this.prismaService.testCase.update({
            where: {id: existingQuestion.testCases.id},
            data: {
              input: dto.testCases,
              output: result.stdout ? result.stdout : '',
            },
          });
      };
      
      const question = await this.prismaService.question.findUnique({
        where: { id: dto.questionId },
        include: {
          solution: true,
          testCases: true,
          exampleTestCases: true,
        },
      });
      
      
      return { question };
    } catch(err ) {
      throw err;
    }
  }
}
