import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class NewSubmisionDTO {
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsString()
    language: string;

    @IsNumber()
    @IsNotEmpty()
    @Transform(({value}) => parseInt(value))
    questionId: number;

    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    @Transform(({value}) => parseInt(value))
    studentId?: number;
}

export class SubmissionIDDTO {
    @IsNumber()
    @IsNotEmpty()
    @Transform(({value}) => parseInt(value))
    id: number;
}