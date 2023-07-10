import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway as WsGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import {AES, enc} from 'crypto-js';
import {IncomingMessage} from 'http';
import {Server} from 'net';
import * as url from 'url';
import {WebSocketClient} from './web-socket-client.interface';
import {WebSocketService} from './web-socket.service';
import {Logger} from '@nestjs/common';
import {UserModel} from "../model/user/user.model";
import {UserRepository} from "../model/user/user.repository";
import {jwtConstants} from "../common/constants";

@WsGateway({
    path: '/web-socket',
    cors: {origin: '*'},
    transports: ['websocket'],
})
export class WebSocketGateway implements OnGatewayInit, OnGatewayConnection<WebSocketClient>, OnGatewayDisconnect<WebSocketClient> {
    private readonly logger = new Logger(WebSocketGateway.name);
    @WebSocketServer()
    private server: Server;

    constructor(private webSocketService: WebSocketService, private userRepository: UserRepository) {
    }

    public afterInit(server: Server) {
        this.logger.log(`WebSocket server initialized`);
    }

    public async handleConnection(client: WebSocketClient, req: IncomingMessage) {
        const query = url.parse(req.url, true).query;

        if (!query.token) {
            await this.webSocketService.addAdmin(client);
            await this.webSocketService.sendToAdmin({event: 'dashboard-welcome'});

            return;
        }

        let user: UserModel;

        try {
            const decrypted = AES.decrypt(
                query.token as string,
                jwtConstants.secret
            ).toString(enc.Utf8);

            const [id, expiresAt] = decrypted.split('|');

            if (!expiresAt || new Date(expiresAt) <= new Date()) {
                return client.close();
            }

            user = await this.userRepository.findById(+id);
        } catch (error) {
            this.logger.error(`cannot handle web socket connection`, {error});

            return client.close();
        }

        if (!user) {
            return client.close();
        }

        client.user = {model: user};

        await this.webSocketService.addClient(user.id, client);
        this.webSocketService.sendToUser(user.id, {event: 'welcome'});
        await this.webSocketService.sendLastMessage(user);
    }

    public async handleDisconnect(client: WebSocketClient) {
        if (client.user) {
            await this.webSocketService.removeClient(client.user.model.id, client);
        } else {
            await this.webSocketService.removeAdminClient(client);
        }
    }
}
