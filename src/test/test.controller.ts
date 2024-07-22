import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TestProvider } from './test.service';
import { CreateTestDTO, EditTestDTO, GetTestDTO } from './dto';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('test')
export class TestController {
    constructor(private testProvider: TestProvider) {}

    @Post('new')
    createTest(@GetUser() user: User, @Body() dto:  CreateTestDTO) {
        dto.teacherId = user.id
        return this.testProvider.createTest(dto)
    }

    @Get(':id')
    getTest(@Param() dto: GetTestDTO) {
        return this.testProvider.getTest(dto)
    }

    @Get(':id/leaderboard') 
    getLeaderboard(@Param() dto: GetTestDTO) {
        return this.testProvider.getLeaderboard(dto)
    }

    @Get(':id/submissions')
    getSubmissions(@Param() dto: GetTestDTO) {
        return this.testProvider.getSubmissions(dto)
    }

    @Patch(':id/edit')
    updateTest(
      @GetUser() user: User, 
      @Param('id') id: number, 
      @Body() dto: EditTestDTO
    ) {
      dto.testId = id;
      dto.teacherId = user.id;
      return this.testProvider.updateTest(dto);
    }
}
