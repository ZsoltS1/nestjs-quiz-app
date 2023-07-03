import {Controller, Get, Logger, UseGuards} from '@nestjs/common';
import {AES} from 'crypto-js';
import * as moment from 'moment-timezone';
import {BUDAPEST_TIMEZONE} from "../common/time-zone.const";
import {CurrentUser} from "../common/current-user.decorator";
import {UserModel} from "../model/user/user.model";
import {JwtAuthGuard} from "../auth/jwt-auth.guard";
import {jwtConstants} from "../common/constants";

@Controller('/api/web-socket')
export class WebSocketController {
    private readonly logger = new Logger(WebSocketController.name);

    constructor() {
    }

    @Get('/token')
    @UseGuards(JwtAuthGuard)
    public async auth(@CurrentUser() user: UserModel) {
        return {
            token: AES.encrypt(
                user.id + '|' + moment.tz(BUDAPEST_TIMEZONE).add(10, 'hours').toISOString(),
                jwtConstants.secret
            ).toString(),
        };
    }
}
