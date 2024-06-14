import { ForbiddenException, Injectable } from '@nestjs/common';
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
      const test = await this.prismaService.test.findUnique({
        where: {
          id: dto.id,
        },
      });

      if (!test) return new ForbiddenException('test not found');

      return test;
    } catch (err) {
      throw err;
    }
  }

  updateTest() {}
}
