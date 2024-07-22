import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBase64,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';


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

  @IsNotEmpty()
  @IsString()
  @IsBase64()
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

  @IsNotEmpty()
  @IsString()
  @IsBase64()
  testCases: string;

  @ValidateNested()
  @Type(() => Code)
  solutionCode: Code;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExampleTestCase)
  exampleTestCases: ExampleTestCase[];

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
