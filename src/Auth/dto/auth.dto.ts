import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsString,  } from "class-validator";

export class SignUpDto {

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsBoolean()
    @Transform(({value}) => value === "true")
    isTeacher: boolean;
}


export class SignInDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}