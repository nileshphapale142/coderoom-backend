import { Transform } from "class-transformer";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class SignInDto {
    @IsString()
    @IsNotEmpty()
    userName: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class TeacherDTO {
    @IsInt()
    @IsNotEmpty()
    @Transform(({value}) => parseInt(value))
    id: number; 
}