import { Transform } from "class-transformer";
import { IsBase64, IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateSubmissionDTO {
  @IsNotEmpty()
  @IsInt()
  @Transform(({ value }) => parseInt(value))
  language_id: number;

  @IsNotEmpty()
  @IsString()
  @IsBase64()
  source_code: string;

  @IsNotEmpty()
  @IsString()
  @IsBase64()
  stdin: string;
}

export class GetSubmissionDTO {
  @IsNotEmpty()
  @IsString()
  token: string;
}