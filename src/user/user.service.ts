import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientUnknownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserProvider {
  constructor(private prismaService: PrismaService) {}

  async getCourses(user: User) {
    try {
      let courses = [];

      if (user.isTeacher) {
        const userInfo = await this.prismaService.user.findUnique({
          where: { id: user.id },
          include: {
            createdCourses: true,
          },
        });

        courses = userInfo.createdCourses

      } else {
        const userInfo = await this.prismaService.user.findUnique({
          where: { id: user.id },
          include: {
            joinedCourses: {
              select: {
                course: {
                  include: {
                    teacher: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            },
          },
        });

        courses = userInfo.joinedCourses.map((course) => course.course)
      }

      return courses;
      
    } catch (err) {
      if (err instanceof PrismaClientUnknownRequestError)
        throw new NotFoundException('User not fouund');
      throw err;
    }
  }
}
