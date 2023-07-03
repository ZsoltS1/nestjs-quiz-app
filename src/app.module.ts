import {Module} from '@nestjs/common';
import {LoginController} from "./login/login.controller";
import {LoginService} from "./login/login.service";
import {UserModule} from "./model/user/user.module";
import {QuestionModule} from "./model/question/question.module";
import {WebSocketModule} from "./websocket/web-socket.module";
import {QuizController} from "./quiz/quiz.controller";
import {QuizService} from "./quiz/quiz.service";
import {WebSocketController} from "./websocket/web-socket.controller";
import {JwtStrategy} from "./auth/jwt.strategy";
import {PassportModule} from "@nestjs/passport";
import {JwtModule} from "@nestjs/jwt";
import {jwtConstants} from "./common/constants";
import {GameMessageService} from "./quiz/game-message.service";
import {QuizModule} from "./model/quiz/quiz.module";
import {TeamModule} from "./model/team/team.module";
import {UserController} from "./user/user.controller";
import {UserService} from "./user/user.service";
import {TeamController} from "./team/team.controller";
import {TeamService} from "./team/team.service";

@Module({
    imports: [
        JwtModule.register({
            global: true,
            secret: jwtConstants.secret,
            signOptions: {expiresIn: '24h'},
        }),
        PassportModule,
        UserModule,
        TeamModule,
        QuestionModule,
        QuizModule,
        WebSocketModule
    ],
    controllers: [LoginController, QuizController, UserController, TeamController, WebSocketController],
    providers: [JwtStrategy, LoginService, QuizService, UserService, TeamService, GameMessageService],
})
export class AppModule {
}
