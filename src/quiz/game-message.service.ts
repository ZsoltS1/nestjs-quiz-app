import {WebSocketErrorInterceptor} from "../websocket/web-socket-error.interceptor";
import {Injectable, Logger, UseInterceptors} from "@nestjs/common";
import {MessageBody, SubscribeMessage, WebSocketGateway, WsResponse} from "@nestjs/websockets";
import {UserModel} from "../model/user/user.model";
import {CurrentUser} from "../common/current-user.decorator";
import {WebSocketService} from "../websocket/web-socket.service";
import {UserRepository} from "../model/user/user.repository";
import {QuizRepository} from "../model/quiz/quiz.repository";
import {QuizService} from "./quiz.service";

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
                private quizService: QuizService) {
    }

    @SubscribeMessage('quiz-user-response')
    public async receiveMessage(
        @CurrentUser() currentUser: UserModel,
        @MessageBody() data: { questionId: number, answer: string }): Promise<WsResponse> {
        const user = await this.userRepository.findById(currentUser.id);

        if (!user) {
            return {event: 'quiz-user-score', data: {error: 'not-found'}}
        }

        const quiz = await this.quizRepository.findByUserIdAndQuestionId(user.id, data.questionId);

        if (!quiz) {
            return {event: 'quiz-user-score', data: {error: 'not-found'}}
        }

        quiz.answer = data.answer;
        quiz.answeredAt = new Date();
        await quiz.save();

        await this.quizService.evaluate(quiz);
        const userScore = await this.quizRepository.sumScoreByUser(user.id);

        return {
            event: 'quiz-user-score',
            data: {
                score: userScore
            },
        };
    }

    @SubscribeMessage('quiz-standing')
    public async getStatistic(@MessageBody() data: {round?: number, team?: number}): Promise<WsResponse> {
        const teamScore = await this.quizRepository.sumScoreByTeam(data.team);
        const topUsers = await this.quizRepository.sumScoreByTopUser();

        return {
            event: 'quiz-standing',
            data: {
                teamScore,
                topUsers
            },
        };
    }
}
