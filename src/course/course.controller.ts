import { Body, Controller, Get, Post, Put, UseGuards, Param } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { CourseProvider } from './course.service';
import { AddStudentDTO, CreateCourseDTO, GetCourseDTO } from './dto';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';


//TODO: 3. Create endpoint for updating neccessay course info (PUT/PATCH)
//TODO: 4.  Add guard to all endpoints

@UseGuards(JwtGuard)
@Controller('course')
export class CourseController {
    constructor(private courseProvider: CourseProvider) {}

    @Post('create') 
    createCourse(@Body() dto: CreateCourseDTO) {
        return this.courseProvider.createCourse(dto)
    }

    @Post('addStudent')
    addStudent(@GetUser() user:User, @Body() dto: AddStudentDTO) {
        return this.courseProvider.addStudent(user.id, dto.courseCode)
    }


    @Get(':id')
    getCourse(@Param() dto: GetCourseDTO) {
        return this.courseProvider.getCourse(dto)
    }


    @Put('update')
    updateCourse() {
        return this.courseProvider.updateCourse()
    }
}
