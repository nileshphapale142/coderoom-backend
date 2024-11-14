import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignInDto, SignUpDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { env } from 'configs';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthProvider {
  constructor(
    private prismaService: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private mailService: MailService
  ) {}

  async signUp(dto: SignUpDto) {
    const hashPass = await argon.hash(dto.password);

    try {
      let data: any = {
        name: dto.name,
        email: dto.email,
        password: hashPass,
        isTeacher: dto.isTeacher,
      };

      if (!dto.isTeacher) {
        if (!dto.enrollmentId)
          throw new BadRequestException('Provide have enrollment Id');
        
        data.enrollmentNo = dto.enrollmentId;
      }
      
      if (dto.isTeacher) {
        const admin = await this.prismaService.admin.findUnique({
          where: {
            userName: env.ADMIN.USERANME
          }
        })
        
        data = { ...data, isVerified: false, adminId: admin.id }
      }

      const user = await this.prismaService.user.create({
        data,
      });
      
      
      if (dto.isTeacher) {
        
        const subject = "Teacher role request on Coderoom"
        const text = `${user.name} has requested teacher role access.\nApprove or decline it on Coderoom Admin Panel.\n`
        
        const verification_mail = await this.mailService.sendMail(env.ADMIN.MAIL, subject, text);
        
        return { access_token: null, in_verification_queue: true };
      } 
      
      const { access_token } =  await this.signToken(user.id, user.email) 
      
      return { access_token, in_verification_queue:false} ; 
      
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
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials not found');
    
    if (!user.isVerified) 
      throw new HttpException({
        status: HttpStatus.NOT_ACCEPTABLE,
        error: 'Your account is pending verification by an administrator. Please wait until verification is completed.',
      }, HttpStatus.NOT_ACCEPTABLE);
    
    const pwMatches = await argon.verify(user.password, dto.password);

    if (!pwMatches) throw new ForbiddenException('Wrong password');

    return { at: await this.signToken(user.id, user.email), isTeacher: user.isTeacher }
  }

  async signToken(
    userId: number,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '30d',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
