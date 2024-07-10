import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NewSubmisionDTO } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Judge0Service } from '../judge0/judge0.service';
import { copyFileSync } from 'fs';

@Injectable()
export class SubmissionProvider {
  constructor(private prismaService: PrismaService, 
    private readonly judge0Service: Judge0Service
  ) {}

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

      //todo: add student points if first accepted submission

      const studentSubmission =
        await this.prismaService.studentSubmission.create({
          data: {
            userId: dto.studentId,
            questionId: dto.questionId,
            submissionId: submission.id,
          },
        });

      console.log(await this.judge0Service.about())

      return {submission};

    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        throw new ConflictException('Submission already exists');

      throw err;
    }
  }
}
