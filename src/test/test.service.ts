import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestDTO, EditTestDTO, GetTestDTO } from './dto';
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from '@prisma/client/runtime/library';
import { copyFileSync } from 'fs';
// import { UserProvider } from '../user/user.service';

@Injectable()
export class TestProvider {
  constructor(
    private prismaService: PrismaService,
    // private userService: UserProvider,
  ) {}

  async createTest(dto: CreateTestDTO) {
    try {
      const course = await this.prismaService.course.findUnique({
        where: { id: dto.courseId },
        select: {
          teacherId: true,
        },
      });

      if (!course) throw new NotFoundException('Course not found');

      if (course.teacherId !== dto.teacherId)
        throw new ForbiddenException('Not course creator');

      const test = await this.prismaService.test.create({
        data: {
          name: dto.name,
          startTime: new Date(dto.date + 'T' + dto.startTime + ':00.000'),
          endTime: new Date(dto.date + 'T' + dto.endTime + ':00.000'),
          allowedLanguages: dto.languages,
          evaluationScheme: dto.evaluationScheme,
          visibility: dto.visibility,
          courseId: dto.courseId,
        },
      });

      return { test };
    } catch (err) {
      throw err;
    }
  }

  async getTest(dto: GetTestDTO) {
    try {
      //todo: maximum points and available points of a question

      const test = await this.prismaService.test.findUnique({
        where: {
          id: dto.id,
        },
        include: {
          questions: {
            select: {
              id: true,
              name: true,
              points: true,
            },
          },
        },
      });
      
      if (!test) throw new NotFoundException('Test not found');

      return {test};
    } catch (err) {
      throw err;
    }
  }

  async getLeaderboard(dto: GetTestDTO) {
    try {
      const test = await this.prismaService.test.findUnique({
        where: { id: dto.id },
        select: {
          course: {
            select: {
              enrolledStudents: {
                select: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          questions: {
            select: {
              id: true,
              name: true,
              points: true,
              studentPoints: {
                select: {
                  points: true,
                  user: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      const students = test.course.enrolledStudents.reduce(
        (prev, { user }) => {
          prev[user.id] = user.name;
          return prev;
        },
        {},
      );

      const questions = test.questions.reduce((prev, question) => {
        prev[question.id] = {
          name: question.name,
          maxPoints: question.points,
        };
        return prev;
      }, {});

      const leaderboard = Object.entries(students).reduce(
        (prev, student) => {
          prev[student[0]] = {
            quePoints: {},
            totalPoints: 0,
          };

          prev[student[0]].quePoints = Object.entries(
            questions,
          ).reduce((acc, que) => {
            acc[que[0]] = {
              points: 0,
            };
            return acc;
          }, {});

          return prev;
        },
        {},
      );

      let _ = test.questions.map(({ id, studentPoints }) =>
        studentPoints.map(({ points, user }) => {
          leaderboard[user.id].quePoints[id].points += points;
          leaderboard[user.id].totalPoints += points;
          return;
        }),
      );

      return {
        students: students,
        questions: questions,
        leaderboard: leaderboard,
      };
    } catch (err) {
      throw err;
    }
  }

  async getSubmissions(dto: GetTestDTO) {

    //todo: submission view only for course teacher?
     
    try {
      const test = await this.prismaService.test.findUnique({
        where: { id: dto.id },
        select: {
          questions: {
            select: {
              id: true,
              name: true,
              StudentSubmission: {
                select: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  submission: true,
                },
              },
            },
          },
        },
      });

      if (!test) throw new NotFoundException('Test does not exist');

      const submissions = test.questions.flatMap((question) => {
        return question.StudentSubmission.map(
          ({ submission, user }) => {
            return {
              submission,
              student: user,
              question: {
                id: question.id,
                name: question.name,
              },
            };
          },
        );
      });

      submissions.sort(
        (sub1, sub2) =>
          sub2.submission.time.getTime() -
          sub1.submission.time.getTime(),
      );

      return {submissions};
    } catch (err) {
      throw err;
    }
  }

  async updateTest(dto: EditTestDTO) {
    try  {
      // console.log({ dto });
      const course = await this.prismaService.course.findUnique({
        where: { id: dto.courseId },
        select: {
          teacherId: true,
        },
      });
      
      if (!course) throw new NotFoundException('Course not found');
      
      if (course.teacherId !== dto.teacherId) {
        throw new ForbiddenException('Not authorized to edit test info'); 
      } 
      
      // console.log(course);
      // console.log(dto);
      
      
      const test = await this.prismaService.test.update({
        where: {id: dto.testId},
        data: {
          name: dto.name,
          startTime: new Date(dto.date + 'T' + dto.startTime + ':00.000'),
          endTime: new Date(dto.date + 'T' + dto.endTime + ':00.000'),
          allowedLanguages: dto.languages,
          evaluationScheme: dto.evaluationScheme,
          visibility: dto.visibility,
        },
      });
      
      return { test };
      
    } catch(error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2025') {
          throw new NotFoundException(`Test not found`);
      }
      throw error;
    }
  }
}
