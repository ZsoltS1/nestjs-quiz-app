import {Injectable, UnauthorizedException} from "@nestjs/common";
import {PassportStrategy} from "@nestjs/passport";
import {Strategy, ExtractJwt} from 'passport-jwt';
import {UserRepository} from "../model/user/user.repository";
import {jwtConstants} from "../common/constants";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(private userRepository: UserRepository) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtConstants.secret,
        });
    }

    async validate(payload: any) {
        const user = await this.userRepository.findById(payload.userId);

        if (!user) {
            throw new UnauthorizedException();
        }

        return {
            model: user
        };
    }

}
