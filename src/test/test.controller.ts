import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { TestProvider } from './test.service';
import { CreateTestDTO, GetTestDTO } from './dto';

@Controller('test')
export class TestController {
    constructor(private testProvider: TestProvider) {}

    @Post('new')
    createTest(@Body() dto:  CreateTestDTO) {
        return this.testProvider.createTest(dto)
    }

    @Get(':id')
    getTest(@Param() dto: GetTestDTO) {
        return this.testProvider.getTest(dto)
    }

    @Put('update')
    updateTest() {
        this.testProvider.updateTest()
    }
}
