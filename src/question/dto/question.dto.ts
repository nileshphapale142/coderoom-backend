import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// class IO {
//   @IsString()
//   @IsNotEmpty()
//   type: string;

//   @IsString()
//   @IsNotEmpty()
//   name: string;
// }

class ExampleTestCase {
  @IsNotEmpty()
  @IsString()
  input: string;

  @IsNotEmpty()
  @IsString()
  ouput: string;

  @IsNotEmpty()
  @IsString()
  explaination: string;
}

class Code {
  @IsString()
  @IsNotEmpty()
  language: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}

export class NewQuestionDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  points: number;

  @IsString()
  @IsNotEmpty()
  testCases: string;

  @ValidateNested()
  @Type(() => Code)
  solutionCode: Code;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExampleTestCase)
  exampleTestCases: ExampleTestCase[];

  // @ValidateNested({each: true})
  // @Type(() =>IO)
  // inputs: IO[]

  // @ValidateNested()
  // @Type(() => IO)
  // output: IO

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  testId: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  teacherId?: number;
}

export class GetQuestionDTO {
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  id: number;

  // @IsInt()
  // @IsNotEmpty()
  // @Transform(({ value }) => parseInt(value))
  // testId: number;

  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  userId?: number;
}

export class AddStudentPointsDTO {
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  id: number;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  points: number;
}
