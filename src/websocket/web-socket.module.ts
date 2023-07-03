import {Module} from '@nestjs/common';
import {WebSocketGateway} from './web-socket.gateway';
import {WebSocketService} from './web-socket.service';
import {UserModule} from "../model/user/user.module";

const services = [WebSocketService];

@Module({
  imports: [UserModule],
  providers: [WebSocketGateway, ...services],
  exports: [...services],
})
export class WebSocketModule {}
