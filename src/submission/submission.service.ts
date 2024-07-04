import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewSubmisionDTO } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class SubmissionProvider {
  constructor(private prismaService: PrismaService) {}

  async newSubmission(dto: NewSubmisionDTO) {
    try {
      const date = new Date();

      //todo: submission status to be handled

      const submission = await this.prismaService.submission.create({
        data: {
          code: dto.code,
          language: dto.language,
          status: 'Accepted',
          time: date,
        },
      });

      //todo: student spelling
      //todo: add student points if first accepted submission

      const studentSubmission =
        await this.prismaService.studnetSubmission.create({
          data: {
            userId: dto.studentId,
            questionId: dto.questionId,
            submissionId: submission.id,
          },
        });

      return submission;

    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        throw new ConflictException('Submission already exists');

      throw err;
    }
  }
}
