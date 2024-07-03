import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { SignInDto, SignUpDto } from "./dto";
import * as argon from "argon2"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthProvider {

    constructor(
        private prismaService: PrismaService, 
        private jwt: JwtService, 
        private config: ConfigService
    ) {}

    async signUp(dto: SignUpDto) {
        const hashPass = await argon.hash(dto.password);
        
        try {
            const user = await this.prismaService.user.create({
                data: {
                    name: dto.name, 
                    email: dto.email,
                    password: hashPass,
                    isTeacher: dto.isTeacher
                }
            }) 

            return this.signToken(user.id, user.email)
        } catch (err) {
            if (err instanceof PrismaClientKnownRequestError) {
                if (err.code === 'P2002')
                    throw new ForbiddenException('Credentials taken');
            }
            throw err;
        }
    }

    async signIn(dto: SignInDto) {
        const user = await this.prismaService.user.findUnique({ 
            where: {
                email: dto.email
            }
        })

        if (!user) throw new ForbiddenException('Credentials not found');

        const pwMatches = await argon.verify(user.password, dto.password);
        
        if (!pwMatches) throw new ForbiddenException('Wrong password')

        return this.signToken(user.id, user.email);
    }

    async signToken(userId:number, email:string):Promise<{access_token: string}> {
        const payload = {
            sub: userId, 
            email
        }

        const secret = this.config.get('JWT_SECRET')

        const token = await this.jwt.signAsync(payload, { 
            expiresIn: '30d',
            secret: secret,
        })

        return {
            access_token: token
        }

    }
}