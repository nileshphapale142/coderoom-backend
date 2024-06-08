import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCourseDTO, GetCourseDTO } from './dto';
import { CourseCodeGenerator } from 'src/utils';

@Injectable()
export class CourseProvider {
    constructor(private prismaService: PrismaService, 
        // private codeGenerator: CourseCodeGeneratorService
    ) {}

    private async checkCourseExists(code: string) {
        try {
            const course = await this.prismaService.course.findUnique({
                where: {code: code}
            })
            if (course) return true;
            return false;
        } catch (err) {
            throw err
        }
    }

    async createCourse(dto : CreateCourseDTO) {
        let courseCode;

        do {
            courseCode = await CourseCodeGenerator()
            console.log(courseCode)
        } while (await this.checkCourseExists(courseCode));

        try {
            const course = await this.prismaService.course.create({
                data: {
                    name: dto.name,
                    description: dto.description,
                    code: courseCode,
                    teacherId: dto.teacherId
                }
            })
            
            return course;
        }
        catch(err) {
            throw err;
        }
        
    }
    async getCourse(dto: GetCourseDTO) {
        try {
            const course = await this.prismaService.course.findUnique({ 
                where: {id: dto.id}
            })

            if (!course) throw new ForbiddenException('Course not found')

            return course
        } catch (err) {
            throw err;
        }
    }


    updateCourse() {
        return "course updated"
    }
}
