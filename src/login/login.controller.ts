import {Body, Controller, ForbiddenException, HttpCode, Post, UseGuards} from "@nestjs/common";
import {LoginService} from "./login.service";
import {CurrentUser} from "../common/current-user.decorator";
import {UserModel} from "../model/user/user.model";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";

@Controller('/api')
export class LoginController {
    constructor(private readonly loginService: LoginService) {
    }

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

    @Post('/sign-out')
    @UseGuards(JwtAuthGuard)
    @HttpCode(204)
    public async signOut(@CurrentUser() user: UserModel) {
        await this.loginService.signOut(user.id);
    }
}
