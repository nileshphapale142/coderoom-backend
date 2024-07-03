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
              points: true
            }
          }
        }
      });

      if (!test) return new NotFoundException('Test not found');

      return test;
    } catch (err) {
      throw err;
    }
  }

  updateTest() {}
}
