import { Body, Controller, Get, Post, Put, UseGuards, Param } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { CourseProvider } from './course.service';
import { CreateCourseDTO, GetCourseDTO } from './dto';


//TODO: 3. Create endpoint for updating neccessay course info (PUT/PATCH)
//TODO: 4.  Add guard to all endpoints

// @UseGuards(JwtGuard)
@Controller('course')
export class CourseController {
    constructor(private courseProvider: CourseProvider) {}

    @Post('create') 
    createCourse(@Body() dto: CreateCourseDTO) {
        return this.courseProvider.createCourse(dto)
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
