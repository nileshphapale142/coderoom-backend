import { Transform, Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsBase64,
  ValidateNested,
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

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  questionId: number;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  studentId?: number;
}

export class SubmissionIDDTO {
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  id: number;
}
