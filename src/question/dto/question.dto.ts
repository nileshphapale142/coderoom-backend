import { Transform } from 'class-transformer';
import { IsInt, isNotEmpty, IsNotEmpty, IsString } from 'class-validator';

export class NewQuestionDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  testId: number;
}

export class GetQuestionDTO {
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  id: number;
}

export class AddStudentPointsDTO {
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  id: number;

  @IsInt()
  @IsNotEmpty()
  @Transform(({value}) => parseInt(value))
  points: number;
}