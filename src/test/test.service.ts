import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTestDTO, GetTestDTO } from './dto';

@Injectable()
export class TestProvider {
  constructor(private prismaService: PrismaService) {}

  async createTest(dto: CreateTestDTO) {
    try {
      const test = await this.prismaService.test.create({
        data: {
          name: dto.name,
          startTime: dto.date + 'T' + dto.startTime + ':00.000z',
          endTime: dto.date + 'T' + dto.endTime + ':00.000z',
          allowedLanguages: dto.languages,
          evaluationScheme: dto.evaluationScheme,
          visibility: dto.visibility,
          courseId: dto.courseId,
        },
      });

      return test;
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
        select: {
          name: true,
          id: true,
          questions: {
            select: {
              id: true,
              name: true,
              points: true,
            },
          },
        },
      });

      if (!test) return new NotFoundException('Test not found');

      return test;
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

  updateTest() {}
}
