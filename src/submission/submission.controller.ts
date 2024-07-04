import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { SubmissionProvider } from './submission.service';
import { NewSubmisionDTO } from './dto';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';
import { JwtGuard } from 'src/auth/guard';


@UseGuards(JwtGuard)
@Controller('submission')
export class SubmissionController {
    constructor(private submissionProvider: SubmissionProvider) {}

    @Post('/new') 
    newSubmission(@GetUser() user: User, @Body() dto: NewSubmisionDTO) {
        dto = {
            studentId: user.id, 
            ...dto
        }


        return this.submissionProvider.newSubmission(dto)
    }

    @Get(':id') 
    getSubmission() {

    }

}
