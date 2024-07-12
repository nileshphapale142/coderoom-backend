import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsBase64,
  ValidateNested,
  IsInt,
} from 'class-validator';

class Code {
  @IsString()
  @IsNotEmpty()
  language: string;

  @IsNotEmpty()
  @IsString()
  @IsBase64()
  code: string;
}

export class NewSubmisionDTO {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => Code)
  code: Code;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  questionId: number;

  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  studentId?: number;
}

export class GetSubmissionDTO {
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  queId: number;


  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  userId?: number;
}
