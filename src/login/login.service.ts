import {BadRequestException, ForbiddenException, Injectable, NotFoundException} from "@nestjs/common";
import {UserRepository} from "../model/user/user.repository";
import {UserModel} from "../model/user/user.model";
import {JwtService} from "@nestjs/jwt";
import {jwtConstants} from "../common/constants";
import {TeamRepository} from "../model/team/team.repository";

@Injectable()
export class LoginService {
    constructor(private userRepository: UserRepository, private teamRepository: TeamRepository, private jwtService: JwtService) {
    }

    public async signIn(userId: number, teamId: number) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException();
        }

        const team = await this.teamRepository.findById(teamId);

        if (!team) {
            throw new NotFoundException();
        }

        if (user.loggedIn) {
            throw new ForbiddenException('UserAlreadyLoggedIn');
        }

        user.teamId = team.id;
        user.loggedIn = true;
        await user.save();

        return user;
    }

    public async signOut(userId: number) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundException();
        }

        user.loggedIn = false;
        user.connected = false;
        await user.save();
    }

    public generateToken(user: UserModel) {
        return this.jwtService.sign({model: user}, {secret: jwtConstants.secret, expiresIn: '24h'});
    }
}
