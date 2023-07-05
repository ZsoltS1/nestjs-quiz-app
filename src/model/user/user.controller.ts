import {Body, Controller, Post} from "@nestjs/common";
import {UserRepository} from "./user.repository";

@Controller('/api')
export class UserController {
    constructor(private readonly userRepository: UserRepository) {
    }

    @Post('/users')
    public async listAll(@Body() body: any) {
        const users = await this.userRepository.findAllByAdmin(false);

        return users.map(user => ({
            id: user.id,
            name: user.fullname
        }));
    }
}
