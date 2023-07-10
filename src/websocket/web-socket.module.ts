import {Module} from '@nestjs/common';
import {WebSocketGateway} from './web-socket.gateway';
import {WebSocketService} from './web-socket.service';
import {UserModule} from "../model/user/user.module";
import {GameModule} from "../model/game/game.module";
import {QuizModule} from "../model/quiz/quiz.module";

const services = [WebSocketService];

@Module({
  imports: [UserModule, GameModule, QuizModule],
  providers: [WebSocketGateway, ...services],
  exports: [...services],
})
export class WebSocketModule {}
