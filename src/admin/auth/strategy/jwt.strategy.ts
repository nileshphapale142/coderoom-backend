import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import {ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(
    Strategy, 
    'admin-jwt'
){

    constructor(
        config: ConfigService, 
        private prisma: PrismaService) {
        super({
          jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
          secretOrKey: config.get<string>('JWT_SECRET'),
        });
    }

    async validate(payload: { 
        sub: number, 
        userName: string
    }) {

        const admin = await this.prisma.admin.findUnique({ 
            where: { 
                id:payload.sub, 
                userName: payload.userName,
            }
        })
                
        delete admin.password

        return admin;
    }
}