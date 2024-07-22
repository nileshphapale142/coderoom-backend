import { Body, Controller, Get, Post, Put, UseGuards, Param } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { CourseProvider } from './course.service';
import { AddStudentDTO, CreateCourseDTO, GetCourseDTO } from './dto';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';


//TODO: 3. Create endpoint for updating neccessay course info (PUT/PATCH)

@UseGuards(JwtGuard)
@Controller('course')
export class CourseController {
    constructor(private courseProvider: CourseProvider) {}

    @Post('create') 
    createCourse(@GetUser() user:User, @Body() dto: CreateCourseDTO) {
        dto.teacherId = user.id;
        return this.courseProvider.createCourse(dto)
    }

    @Post('addStudent')
    addStudent(@GetUser() user:User, @Body() dto: AddStudentDTO) {
        dto.id = user.id;
        return this.courseProvider.addStudent(dto)
    }

    @Get(':id')
    getCourse(@GetUser() user:User, @Param() dto: GetCourseDTO) {
      dto.userId = user.id;
      return this.courseProvider.getCourse(dto);
    }

    @Get(':id/leaderboard')
    getLeaderboard(@Param() dto: GetCourseDTO) {
        return this.courseProvider.getLeaderboard(dto)
    }


    @Put('update')
    updateCourse() {
        return this.courseProvider.updateCourse()
    }
}
