import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDTO, GetCourseDTO } from './dto';
import { CourseCodeGenerator } from 'src/utils';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CourseProvider {
  constructor(
    private prismaService: PrismaService,
    // private codeGenerator: CourseCodeGeneratorService
  ) {}

  private async checkCourseExists(code: string) {
    try {
      const course = await this.prismaService.course.findUnique({
        where: { code: code },
      });
      if (course) return true;
      return false;
    } catch (err) {
      throw err;
    }
  }

  private async getShortLeaderboard(courseId: number) {
    try {
      const course = await this.prismaService.course.findUnique({
        where: {
          id: courseId,
        },
        select: {
          tests: {
            select: {
              questions: {
                select: {
                  studentPoints: {
                    select: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                        },
                      },
                      points: true,
                    },
                  },
                },
              },
            },
          },
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
      });

      let studentPoints = course.enrolledStudents.reduce(
        (prev, { user }) => {
          prev[user.id] = {
            id: user.id,
            points: 0,
            name: user.name,
          };

          return prev;
        },
        {},
      );

      course.tests.map((test) =>
        test.questions.map((que) =>
          que.studentPoints.map(({ user, points }) => {
            studentPoints[user.id].points += points;
          }),
        ),
      );

      //todo: limit number of students sent

      let leaderboard = Object.entries(studentPoints)
        .map(([uid, user]: [uid:string, user:any]) => {
          return { name: user.name, points: user.points };
        })
        .sort((a, b) => b.points - a.points);

      return leaderboard;
    } catch (err) {
      throw err;
    }
  }

  async createCourse(dto: CreateCourseDTO) {
    let courseCode;

    do {
      courseCode = await CourseCodeGenerator();
    } while (await this.checkCourseExists(courseCode));

    try {
      const course = await this.prismaService.course.create({
        data: {
          name: dto.name,
          description: dto.description,
          code: courseCode,
          teacherId: dto.teacherId,
        },
      });

      return course;
    } catch (err) {
      throw err;
    }
  }

  async getCourse(dto: GetCourseDTO) {
    try {
      const course = await this.prismaService.course.findUnique({
        where: { id: dto.id },
        include: {
          teacher: {
            select: {
              name: true,
            },
          },
          tests: {
            select: {
              id: true,
              name: true,
              startTime: true,
            },
          },
        },
      });

      if (!course) throw new NotFoundException('Course not found');

      return {
        ...course,
        leaderboard: await this.getShortLeaderboard(dto.id),
      };
    } catch (err) {
      throw err;
    }
  }

  async addStudent(studentId: number, courseCode: string) {
    const course = await this.prismaService.course.findUnique({
      where: {
        code: courseCode,
      },
    });

    if (!course) throw new NotFoundException('Course does not exist');

    try {
      const courseStudent =
        await this.prismaService.courseStudent.create({
          data: {
            courseId: course.id,
            userId: studentId,
          },
        });

      return { courseId: course.id };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return { courseId: course.id };
      }
      throw error;
    }
  }

  updateCourse() {
    return 'course updated';
  }
}
