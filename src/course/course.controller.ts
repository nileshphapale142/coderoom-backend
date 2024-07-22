import { Body, Controller, Get, Post, UseGuards, Param, Patch } from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { CourseProvider } from './course.service';
import { AddStudentDTO, CreateCourseDTO, EditCourseDTO, GetCourseDTO } from './dto';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';


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


    @Patch(':id/edit')
    updateCourse(
      @GetUser() user: User, 
      @Param('id') id: number, 
      @Body() dto: EditCourseDTO 
    ) {
      
      dto.courseId = id;
      dto.teacherId = user.id;
      return this.courseProvider.updateCourse(dto);
    }
}
