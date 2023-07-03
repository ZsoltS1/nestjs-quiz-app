import {Controller, Get} from "@nestjs/common";
import {UserService} from "./user.service";

@Controller('/api/users')
export class UserController {
    constructor(private userService: UserService) {
    }

    @Get('/')
    public async getAllUsers() {
        return await this.userService.listAll();
    }
}
