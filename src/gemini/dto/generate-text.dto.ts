import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GenerateTextDTO {
    @ApiProperty({
        name: 'prompt',
        description: 'prompt of a question',
        type: 'string',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    prompt: string;
}