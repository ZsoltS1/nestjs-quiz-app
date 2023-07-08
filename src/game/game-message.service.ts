import {WebSocketErrorInterceptor} from "../websocket/web-socket-error.interceptor";
import {Injectable, Logger, UseInterceptors} from "@nestjs/common";
import {MessageBody, SubscribeMessage, WebSocketGateway, WsResponse} from "@nestjs/websockets";
import {UserModel} from "../model/user/user.model";
import {CurrentUser} from "../common/current-user.decorator";
import {WebSocketService} from "../websocket/web-socket.service";
import {UserRepository} from "../model/user/user.repository";
import {QuizRepository} from "../model/quiz/quiz.repository";
import {QuizService} from "../quiz/quiz.service";
import {GameRepository} from "../model/game/game.repository";

@Injectable()
@WebSocketGateway({
    path: '/web-socket',
    cors: {origin: '*'},
    transports: ['websocket'],
})
@UseInterceptors(WebSocketErrorInterceptor)
export class GameMessageService {
    private readonly logger = new Logger(GameMessageService.name);

    constructor(private webSocketService: WebSocketService,
                private userRepository: UserRepository,
                private quizRepository: QuizRepository,
                private gameRepository: GameRepository,
                private quizService: QuizService) {
    }

    @SubscribeMessage('quiz-user-response')
    public async receiveMessage(
        @CurrentUser() currentUser: UserModel,
        @MessageBody() data: { gameId: number, questionId: number, answer: string }): Promise<WsResponse> {
        this.logger.debug(`receive answer from user: `, [data]);

        const user = await this.userRepository.findById(currentUser.id);

        if (!user) {
            return;
        }

        const game = await this.gameRepository.findById(data.gameId);

        if (!game || game.stoppedAt) {
            return;
        }

        const quiz = await this.quizRepository.findByUserAndQuestionAndGame(user.id, data.questionId, data.gameId);

        if (!quiz || quiz.answeredAt) {
            return;
        }

        quiz.answer = data.answer;
        quiz.answeredAt = new Date();
        await quiz.save();

        await this.quizService.evaluate(quiz);
    }
}
