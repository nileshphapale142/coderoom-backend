import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateCourseDTO {
    @IsString()
    @IsNotEmpty()
    name: string
    
    @IsString()
    description: string

    @IsOptional()
    @IsInt()
    @IsNotEmpty()
    @Transform(({value}) => parseInt(value))
    teacherId?: number
}

export class GetCourseDTO {
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  id: number;
  
  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  userId?: number;
}

export class AddStudentDTO {
    @IsString()
    @IsNotEmpty()
    courseCode: string;

    @IsOptional()
    @IsNumber()
    @IsNotEmpty()
    @Transform(({value}) => parseInt(value))
    id?: number;
}

export class EditCourseDTO extends CreateCourseDTO {
  @IsOptional()
  @IsInt()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  courseId?: number;
}