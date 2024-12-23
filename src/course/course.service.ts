import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddStudentDTO, CreateCourseDTO, EditCourseDTO, GetCourseDTO } from './dto';
import { CourseCodeGenerator } from '../utils';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UserProvider } from '../user/user.service';

@Injectable()
export class CourseProvider {
  constructor(private prismaService: PrismaService, private  userService: UserProvider) {}

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

  private async getCourseInfo(courseId: number) {
    try {
      const course = await this.prismaService.course.findUnique({
        where: {
          id: courseId,
        },
        select: {
          tests: {
            select: {
              id: true,
              name: true,
              startTime: true,
              endTime: true,
              questions: {
                select: {
                  points: true,
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

      return course;
    } catch (err) {
      throw err;
    }
  }

  private async getShortLeaderboard(courseId: number) {
    const course = await this.getCourseInfo(courseId);

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

    let _ = course.tests.map((test) =>
      test.questions.map((que) =>
        que.studentPoints.map(({ user, points }) => {
          studentPoints[user.id].points += points;
        }),
      ),
    );

    //todo: limit number of students sent

    let leaderboard = Object.entries(studentPoints)
      .map(([uid, user]: [uid: string, user: any]) => {
        return { name: user.name, points: user.points };
      })
      .sort((a, b) => b.points - a.points);

    return leaderboard;
  }

  async createCourse(dto: CreateCourseDTO) {
    let isUserTeacher = await this.userService.isTeacher(dto.teacherId);
    if (!isUserTeacher)
      throw new ForbiddenException('Course creation not allowed');

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
        include: {
          teacher: {
            select: {
              name: true,
            },
          },
        },
      });

      delete course.teacherId;

      return { course };
    } catch (err) {
      throw err;
    }
  }

  async getCourse(dto: GetCourseDTO) {
    //todo: try to minimize databse queries

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
              visibility: true
            },
          },
          enrolledStudents: true,
        },
      });

      if (!course) throw new NotFoundException('Course not found');
      const isUserStudent = course.enrolledStudents
        .some(({ userId }) => dto.userId === userId);
      
      if (course.teacherId !== dto.userId 
        && !isUserStudent)
      throw new ForbiddenException('Not allowed to access course information')
      
      if (isUserStudent) {
        course.tests = course.tests
          .filter(test => test.visibility.toLowerCase() === 'public')
      }
      
      const leaderboard = await this.getShortLeaderboard(dto.id);
      
      
      delete course.enrolledStudents
      
      return {
        course: {
          ...course,
          leaderboard,
        },
      };
    } catch (err) {
      throw err;
    }
  }
  
  async getCourseName(dto: GetCourseDTO) {
    try {
      const course = await this.prismaService.course.findUnique({
        where: { id: dto.id },
        select: {
          name: true,
          enrolledStudents: true,
          teacherId: true
        }
      });
            
      if (dto.userId !== course.teacherId 
        && !course.enrolledStudents.some((student) => student.userId === dto.userId)
        ) {
        throw new ForbiddenException('Not authorized');
      };
      
      return { name: course.name };
    } catch(err) {
      throw err;
    }
  }

  async getLeaderboard(dto: GetCourseDTO) {
    const course = await this.getCourseInfo(dto.id);

    const students = course.enrolledStudents.reduce(
      (prev, { user }) => {
        prev[user.id] = user.name;

        return prev;
      },
      {},
    );
    
    const currTime = new Date();
    
    course.tests = course.tests.filter(test => test.endTime <= currTime)

    const tests = course.tests.reduce((prev, test) => {
      prev[test.id] = {
        name: test.name,
        date: test.startTime,
        totalPoints: 0,
      };

      prev[test.id].totalPoints = test.questions.reduce(
        (acc, que) => acc + que.points,
        0,
      );

      return prev;
    }, {});

    let leaderboard = Object.entries(students).reduce(
      (prev, student) => {
        prev[student[0]] = {
          testPoints: {},
          totalPoints: 0,
        };

        prev[student[0]].testPoints = Object.entries(tests).reduce(
          (acc, test: any) => {
            acc[test[0]] = {
              points: 0,
            };
            return acc;
          },
          {},
        );
        return prev;
      },
      {},
    );

    let _ = course.tests.map((test) =>
      test.questions.map((que) =>
        que.studentPoints.map(({ points, user }) => {
          leaderboard[user.id].testPoints[test.id].points += points;
          leaderboard[user.id].totalPoints += points;
          return;
        }),
      ),
    );

    return {
      students: students,
      tests: tests,
      leaderboard: leaderboard,
    };
  }

  async addStudent(dto: AddStudentDTO) {
    const course = await this.prismaService.course.findUnique({
      where: {
        code: dto.courseCode,
      },
      select: {
        id: true
      }
    });

    if (!course) throw new NotFoundException('Course does not exist');

    try {
      const courseStudent =
        await this.prismaService.courseStudent.create({
          data: {
            courseId: course.id,
            userId: dto.id,
          },
        });


      return { course };
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return { course };
      }
      throw error;
    }
  }

  async updateCourse(dto: EditCourseDTO) {
    try {
        let course = await this.prismaService.course.findUnique({
        where: { id: dto.courseId },
        select: {
          teacherId: true
        }
      });
      
      
      if (!course) throw new NotFoundException('Course not found');
      
      if (course.teacherId !== dto.teacherId)
        throw new ForbiddenException('Unauthorized to edit course info');
      
      course = await this.prismaService.course.update({
        where: { id: dto.courseId },
        data: {
          name: dto.name,
          description: dto.description
        }
      });
      
      return { course };
      
    } catch(err) {
      throw err;
    }
  }
}
