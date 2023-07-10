import {Injectable} from '@nestjs/common';
import {WebSocketClient} from './web-socket-client.interface';
import * as ws from 'ws';
import {UserRepository} from "../model/user/user.repository";
import {UserModel} from "../model/user/user.model";

@Injectable()
export class WebSocketService {
    private clients = new Map<number, Set<ws.WebSocket>>();
    private adminClients = new Set<ws.WebSocket>();
    private userMessages = new Map<number, { event: string; data?: any }>();

    constructor(private userRepository: UserRepository) {
    }

    public async addAdmin(client: WebSocketClient) {
        if (!this.adminClients.has(client)) {
            this.adminClients.add(client);
        }
    }

    public async addClient(userId: number, client: WebSocketClient) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            return;
        }

        if (!this.clients.has(userId)) {
            this.clients.set(userId, new Set());
        }

        this.clients.get(userId).add(client);

        user.connected = true;
        await user.save();

        this.sendLastMessages(user);
    }

    public async removeAdminClient(adminClient: WebSocketClient) {
        const clients = this.adminClients.values();

        for (const client of clients) {
            if (client === adminClient) {
                this.adminClients.delete(adminClient);
            }
        }
    }

    public async removeClient(userId: number, client: WebSocketClient) {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            return;
        }

        const clients = this.clients.get(userId);
        clients?.delete(client);

        if (!clients?.size) {
            this.clients.delete(userId);
        }

        user.connected = false;
        await user.save();
    }

    public async sendToAdmin(data: { event: string; data?: any }) {
        const message = JSON.stringify(data);

        for (const client of this.adminClients.values() ?? []) {
            client.send(message);
        }
    }

    public sendToUser(userId: number, data: { event: string; data?: any }) {
        const message = JSON.stringify(data);

        for (const client of this.clients.get(userId)?.values() ?? []) {
            client.send(message);
            this.userMessages.set(userId, data);
        }
    }

    private sendLastMessages(user: UserModel) {
        const lastMessage = this.userMessages.get(user.id);

        if (lastMessage) {
            this.sendToUser(user.id, lastMessage);
        }
    }

    public clearUserMessages() {
        this.userMessages.clear();
    }
}
