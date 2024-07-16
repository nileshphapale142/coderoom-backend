import { Transform } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, IsTimeZone } from "class-validator";
import { IsTimeString } from "../validator";

export class CreateTestDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsTimeString()
    @IsNotEmpty()
    startTime: string;

    @IsTimeString()
    @IsNotEmpty()
    endTime: string;

    @IsInt()
    @IsNotEmpty()
    @Transform(({value}) => parseInt(value))
    courseId: number;

    @IsString()
    @IsNotEmpty()
    visibility: string;
    
    //todo: think about type of languages 
    @IsArray()
    @ArrayNotEmpty()
    @IsString({each: true})
    @Transform(({value})=> value.map((str:string) => str.toLowerCase()))
    languages: string[];

    @IsString()
    @IsNotEmpty()
    evaluationScheme: string;

    @IsDateString()
    @IsNotEmpty()
    date: string

    @IsOptional()
    @IsInt()
    @Transform(({value}) => parseInt(value))
    teacherId?: number;
}

export class GetTestDTO {
    @IsInt()
    @IsNotEmpty()
    @Transform(({value}) => parseInt(value))
    id: number;
}