import {Body, Controller, ForbiddenException, Post} from "@nestjs/common";
import {LoginService} from "./login.service";

@Controller('/api')
export class LoginController {
    constructor(private readonly loginService: LoginService) {}

    @Post('/sign-in')
    public async signIn(@Body() body: any) {
        const user = await this.loginService.signIn(body.userId, body.teamId);

        if (!user) {
            throw new ForbiddenException();
        }

        return {
            token: this.loginService.generateToken(user)
        };
    }
    
}
