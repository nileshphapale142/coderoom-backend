import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsNumber, IsNumberString, IsString } from "class-validator";

export class CreateCourseDTO {
    @IsString()
    @IsNotEmpty()
    name: string
    
    @IsString()
    description: string

    @IsInt()
    @IsNotEmpty()
    @Transform(({value}) => parseInt(value))
    teacherId: number
}

export class GetCourseDTO {
    @IsInt()
    @IsNotEmpty()
    @Transform(({value})  => parseInt(value))
    id: number
}