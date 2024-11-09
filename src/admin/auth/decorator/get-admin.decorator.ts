import { createParamDecorator, ExecutionContext } from "@nestjs/common";


export const GetAdmin = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx
        .switchToHttp()
        .getRequest()
        
        return request.admin
    }
)