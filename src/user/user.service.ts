import {Injectable, Logger} from "@nestjs/common";
import {UserRepository} from "../model/user/user.repository";

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(private userRepository: UserRepository) {
    }

    public async listAll() {
        const users = await this.userRepository.findAll();

        if (!users) {
            return [];
        }

        return users.map(user =>
            ({
                id: user.id,
                name: user.fullname
            })
        );
    }
}
