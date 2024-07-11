import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  GatewayTimeoutException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetQuestionDTO, NewQuestionDTO } from './dto';
import {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
} from '@prisma/client/runtime/library';
import { Judge0Service } from '../judge0/judge0.service';
import { CreateSubmissionDTO } from '../judge0/dto';
import { languageSupport, SubmisionResult, toString } from '../utils';

@Injectable()
export class QuestionProvider {
  constructor(
    private prismaService: PrismaService,
    private readonly judge0Service: Judge0Service,
  ) {}

  //   private generateCodePrompt(lang: string, dto: NewQuestionDTO) {
  //     const prompt = `
  //         only generate code, nothing else than that not even explaination and heading

  // code:
  // #include <bits/stdc++.h>

  // <define_solution_function_with_arguments_${dto.inputs.reduce(
  //       (prev, input) => {
  //         prev += `${input.name} and `;
  //         return prev;
  //       },
  //       '',
  //     )} and_return_type_${dto.output.type}>

  // bool ExecuteTestCaes()
  // {
  // ${dto.inputs.reduce((prev, input) => {
  //   prev += `<declare and take_${input.type}_input_named_${input.name}>\n`;
  //   return prev;
  // }, '')}

  // <declare and take_${dto.output.type}_input_named_expectedOutput>

  // <call_solution_function_with_arguments_${dto.inputs.reduce(
  //       (prev, input) => {
  //         prev += `${input.name} and `;
  //         return prev;
  //       },
  //       '',
  //     )}>

  //     <Compare expected output and function output>
  //     <if output is nd-array compare individual elements>
  //     <if output is string compare individual characters>
  //     <else compare directly>

  // }

  // int main()
  // {

  // int numTestCases;
  // cin >> numTestCases;

  // while (numTestCases--)
  // {
  // bool testResult = ExecuteTestCaes();
  // if (!testResult) break;
  // }

  // return 0;
  // }

  // transform above code in equivalent ${lang} code
  // perform required instructions mentioned in angle brackets
  // don't write print statements
  //       `;

  //     return prompt;
  //   }

  //   private async getCodes(languages: string[], dto: NewQuestionDTO) {
  //     const codePromises = languages.map(async (lang) => {
  //       const prompt = this.generateCodePrompt(
  //         lang.toLocaleLowerCase(),
  //         dto,
  //       );
  //       const { text } = await this.geminiService.generateText(prompt);
  //       let code = text.substring(text.indexOf('\n') + 1);
  //       code = code.substring(0, code.lastIndexOf('\n'));

  //       return { language: lang, code };
  //     });

  //     const codes = await Promise.all(codePromises);

  //     return codes;
  //   }

  private async processSubmission(dto: CreateSubmissionDTO) {
    try {
      const result: SubmisionResult =
        await this.judge0Service.createSubmission(dto);

      if (result.status.id === 5) {
        throw new GatewayTimeoutException(
          'Time limit exceeded for the test cases',
        );
      } else if (result.status.id === 6) {
        throw new BadRequestException(
          'Compilation Error: ' + toString(result.compile_output),
        );
      } else if (result.status.id in [7, 8, 9, 10, 11, 12]) {
        throw new BadRequestException(
          'Runtime error: ' + toString(result.stderr),
        );
      } else if (result.status.id === 14) {
        throw new BadRequestException(
          'Code execution failed: Exec format error. Please check your code and try again.',
        );
      }

      return result;
    } catch (err) {
      throw err;
    }
  }

  async createQuestion(dto: NewQuestionDTO) {
    try {
      const test = await this.prismaService.test.findUnique({
        where: { id: dto.testId },
        select: {
          allowedLanguages: true,
          course: {
            select: {
              teacherId: true,
            },
          },
        },
      });

      if (dto.teacherId !== test.course.teacherId)
        throw new ForbiddenException('Unauthorized to add question');

      let question = await this.prismaService.question.create({
        data: {
          name: dto.name,
          statement: dto.description,
          points: dto.points,
          testId: dto.testId,
        },
      });

      const solution = await this.prismaService.code.create({
        data: {
          solQueId: question.id,
          code: dto.solutionCode.code,
          language: dto.solutionCode.language,
        },
      });

      const etcs =
        await this.prismaService.exampleTestCase.createMany({
          data: dto.exampleTestCases.map((testCase) => {
            return {
              questionId: question.id,
              input: testCase.input,
              output: testCase.ouput,
              explaination: testCase.explaination,
            };
          }),
        });

      const submissionDTO: CreateSubmissionDTO = {
        language_id: languageSupport[dto.solutionCode.language],
        source_code: dto.solutionCode.code,
        stdin: dto.testCases,
      };

      const result = await this.processSubmission(submissionDTO)

      const testCases = await this.prismaService.testCase.create({
        data: {
          questionId: question.id,
          input: dto.testCases,
          output: toString(result.stdout),
        },
      });

      // const inputs = await this.prismaService.iO.createMany({
      //   data: dto.inputs.map((input) => {
      //     return {
      //       inputQuestionId: question.id,
      //       type: input.type,
      //       name: input.name,
      //     };
      //   }),
      // });
      //
      // const output = await this.prismaService.iO.create({
      //   data: {
      //     outputQuestionId: question.id,
      //     type: dto.output.type,
      //     name: dto.output.name,
      //   },
      // });

      // const codes = await this.getCodes(test.allowedLanguages, dto);

      // const executionCodes = await this.prismaService.code.createMany(
      //   {
      //     data: codes.map((code) => {
      //       return {
      //         execQueId: question.id,
      //         code: code.code,
      //         language: code.language,
      //       };
      //     }),
      //   },
      // );

      question = await this.prismaService.question.findUnique({
        where: { id: question.id },
        include: {
          solution: true,
          testCases: true,
          exampleTestCases: true,
        },
      });

      return { question };
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        throw new ConflictException('Question already exists');

      throw err;
    }
  }

  async getQuestion(dto: GetQuestionDTO) {
    try {
      const test = await this.prismaService.question.findUnique({
        where: { id: dto.id },
        select: {
          Test: {
            select: {
              course: {
                select: {
                  teacherId: true,
                  enrolledStudents: true,
                },
              },
            },
          },
        },
      });

      if (!test)
        throw new NotFoundException('Question does not exist');

      let question = null;

      if (dto.userId === test.Test.course.teacherId) {
        question = await this.prismaService.question.findUnique({
          where: { id: dto.id },
          include: {
            solution: true,
            testCases: true,
            exampleTestCases: true,
          },
        });
      } else if (
        test.Test.course.enrolledStudents.some(
          ({ userId }) => userId === dto.userId,
        )
      ) {
        question = await this.prismaService.question.findUnique({
          where: { id: dto.id },
          include: {
            exampleTestCases: true,
          },
        });

        if (!question)
          throw new NotFoundException('Question not found');

        return { question };
      } else {
        throw new ForbiddenException(
          'Not allowed to access question',
        );
      }

      if (!question)
        throw new NotFoundException('Question not found');

      return { question };
    } catch (err) {
      if (err instanceof PrismaClientUnknownRequestError)
        throw new ForbiddenException('Question not found');
      throw err;
    }
  }

  async addStudentPoints({
    userId,
    queId,
    points,
  }: {
    userId: number;
    queId: number;
    points: number;
  }) {
    try {
      const studentPoints =
        await this.prismaService.studentQuestion.create({
          data: {
            userId: userId,
            questionId: queId,
            points: points,
          },
        });

      return studentPoints;
    } catch (err) {
      if (err instanceof PrismaClientKnownRequestError)
        throw new ConflictException(
          'Student already has points for the question',
        );

      throw err;
    }
  }
}
