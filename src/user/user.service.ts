import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaClientUnknownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class UserProvider {
  constructor(private prismaService: PrismaService, private mailService: MailService) {}

  async isTeacher(id: number): Promise<boolean> {
    const user = await this.prismaService.user.findUnique({
      where: { id: id },
      select: {
        isTeacher: true,
      },
    });

    return user.isTeacher;
  }

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

        courses = userInfo.createdCourses;
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
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        });

        courses = userInfo.joinedCourses.map(
          (course) => course.course,
        );
      }

      return { courses, isTeacher:user.isTeacher };
    } catch (err) {
      if (err instanceof PrismaClientUnknownRequestError)
        throw new NotFoundException('User not fouund');
      throw err;
    }
  }
  
  
  async verifyTeacher(id:number) {
    try {
      const user = await this.prismaService.user.update({
        where: {
          id: id,
          isTeacher: true
        }, data: {
          adminId: null,
          isVerified: true
        }
      });
      
      if (!user) throw new NotFoundException('User not found');
      
      const subject = "Teacher role verification on Coderoom"
      const text = "Your teacher role request on codeoom has been approved by the admin.\nYou can use your credentials to sign-in to Coderoom."
      const verification_mail = await this.mailService.sendMail(user.email, subject, text);
      
    } catch(err) {
      throw err
    }
  }
  
  async deleteTeacher(id:number) {
    try {
      const user = await this.prismaService.user.delete({
        where: {
          id: id,
          isTeacher: true
        }
      });
      
      if (!user) throw new NotFoundException('User not found');
      
      const subject = "Teacher role verification on Coderoom"
      const text = "Your teacher role request on codeoom has been declined by the admin.\nYour credentials has been deleted."
      const verification_mail = await this.mailService.sendMail(user.email, subject, text);
      
      
    } catch(err) {
      throw err
    }
  }
}
