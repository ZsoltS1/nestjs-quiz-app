import {Injectable} from '@nestjs/common';
import {WebSocketClient} from './web-socket-client.interface';
import * as ws from 'ws';
import {UserRepository} from "../model/user/user.repository";

@Injectable()
export class WebSocketService {
    private clients = new Map<number, Set<ws.WebSocket>>();
    private adminClients = new Map<number, Set<ws.WebSocket>>();

    constructor(private userRepository: UserRepository) {
    }

    public async addAdmin(client: WebSocketClient) {
        const admin = await this.userRepository.findAdmin();

        if (!admin) {
            return;
        }

        if (!this.adminClients.has(admin.id)) {
            this.adminClients.set(admin.id, new Set());
        }

        this.adminClients.get(admin.id).add(client);

        admin.registered = true;
        await admin.save();
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

        user.registered = true;
        await user.save();
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

        user.registered = false;
        await user.save();
    }

    public async sendToAdmin(data: { event: string; data?: any }) {
        const admin = await this.userRepository.findAdmin();

        if (!admin) {
            return;
        }

        const message = JSON.stringify(data);

        for (const client of this.adminClients.get(admin.id)?.values() ?? []) {
            client.send(message);
        }
    }

    public sendToUser(userId: number, data: { event: string; data?: any }) {
        const message = JSON.stringify(data);

        for (const client of this.clients.get(userId)?.values() ?? []) {
            client.send(message);
        }
    }
}
