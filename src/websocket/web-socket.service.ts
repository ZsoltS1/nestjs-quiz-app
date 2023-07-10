import {Injectable} from '@nestjs/common';
import {WebSocketClient} from './web-socket-client.interface';
import * as ws from 'ws';
import {UserRepository} from "../model/user/user.repository";
import {UserModel} from "../model/user/user.model";
import {GameRepository} from "../model/game/game.repository";
import {QuizRepository} from "../model/quiz/quiz.repository";
import {GameMessageRepository} from "../model/game/game-message.repository";

@Injectable()
export class WebSocketService {
    private clients = new Map<number, Set<ws.WebSocket>>();
    private adminClients = new Set<ws.WebSocket>();

    constructor(private userRepository: UserRepository,
                private gameRepository: GameRepository,
                private quizRepository: QuizRepository,
                private gameMessageRepository: GameMessageRepository,) {
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
        }
    }

    public async sendLastMessage(user: UserModel) {
        const game = await this.gameRepository.findLastActive();
        const gameLastMessage = await this.gameMessageRepository.findLastByGame(game.id);

        if (!gameLastMessage) {
            return;
        }

        if (gameLastMessage.eventType === 'quiz-user-paused') {
            const userScore = await this.quizRepository.sumScoreByUserAndGame(user.id, game.id);
            const userRanking = await this.quizRepository.rankingGroupByUser(game.id);

            const ranking = userRanking.find(ranking => ranking['userid'] === user.id)

            this.sendToUser(user.id, {
                event: gameLastMessage.eventType,
                data: {
                    standing: ranking ? ranking['rank'] : null,
                    score: userScore ?? 0
                },
            });
        } else if (gameLastMessage.eventType === 'quiz-user-message') {
            const userScore = await this.quizRepository.sumScoreByUserAndGame(user.id, game.id);

            this.sendToUser(user.id, {
                event: gameLastMessage.eventType,
                data: {
                    ...gameLastMessage.eventData,
                    score: userScore ?? 0
                }
            });
        }
    }
}
