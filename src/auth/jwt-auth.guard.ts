import {CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException} from "@nestjs/common";
import {jwtConstants} from "../common/constants";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {
    }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const token = request.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            throw new UnauthorizedException();
        }

        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: jwtConstants.secret
                }
            );

            request['user'] = payload;
        } catch {
            throw new UnauthorizedException();
        }

        return true;
    }
}
