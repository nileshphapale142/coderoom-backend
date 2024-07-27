import { Transform } from "class-transformer";
import { IsBoolean, IsEmail, IsNotEmpty, IsNumberString, IsOptional, IsString,  } from "class-validator";

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
    @Transform(({value}) => value === "true" || value === true)
    isTeacher: boolean;

    @IsOptional()
    @IsNotEmpty()
    @IsNumberString()
    enrollementId?: string;
}


export class SignInDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}