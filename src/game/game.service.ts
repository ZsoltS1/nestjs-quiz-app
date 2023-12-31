import {ForbiddenException, Injectable, Logger} from "@nestjs/common";
import {WebSocketService} from "../websocket/web-socket.service";
import {GameRepository} from "../model/game/game.repository";
import {GameModel} from "../model/game/game.model";
import {GameScoreType} from "../model/game/game-score.type";
import {QuizRepository} from "../model/quiz/quiz.repository";
import {QuestionRepository} from "../model/question/question.repository";
import {UserRepository} from "../model/user/user.repository";
import * as moment from "moment-timezone";
import {GameMessageModel} from "../model/game/game-message.model";
import {GameMessageRepository} from "../model/game/game-message.repository";
import {ParameterRepository} from "../model/parameter/parameter.repository";
import {QuizService} from "../quiz/quiz.service";
import {ParameterType} from "../model/parameter/parameter.type";

@Injectable()
export class GameService {
    private readonly logger = new Logger(GameService.name);

    constructor(private gameRepository: GameRepository,
                private parameterRepository: ParameterRepository,
                private gameMessageRepository: GameMessageRepository,
                private quizRepository: QuizRepository,
                private userRepository: UserRepository,
                private questionRepository: QuestionRepository,
                private quizService: QuizService,
                private webSocketService: WebSocketService) {
    }

    public getActiveGame() {
        return this.gameRepository.findLastActive();
    }

    public async createGame(demo: boolean, scoreType: GameScoreType) {
        const activeGame = await this.gameRepository.findLastActive();

        if (activeGame) {
            activeGame.stoppedAt = new Date();
            await activeGame.save();
        }

        const questions = await this.questionRepository.findByDemo(demo);

        return new GameModel({
            demo,
            scoreType,
            questions: {ids: questions.map(question => question.id)},
        }).save();
    }

    public async nextQuestion(game: GameModel) {
        if (game.stoppedAt) {
            throw new ForbiddenException();
        }

        if (!game.startedAt) {
            game.startedAt = new Date();
        }

        const threshold = +(await this.parameterRepository.findValueByType(ParameterType.QUESTION_TIMER_IN_SEC));
        const units = moment().diff(moment(game.sentAt), 'seconds');

        if (units < threshold) {
            return game;
        }

        await this.quizService.evaluateQuestion(game);

        const nextQuestionId = this.findNextQuestion(game);

        if (nextQuestionId) {
            await this.quizService.send(game, nextQuestionId);
        }

        return await game.save();
    }

    public async getStanding(game: GameModel) {
        await this.quizService.evaluateQuestion(game);

        const teamScore = await this.quizRepository.sumScoreGroupByTeam(game.id);
        const topUsers = await this.quizRepository.sumScoreGroupByUser(game.id);

        await this.webSocketService.sendToAdmin({
            event: 'quiz-dashboard-paused',
            data: {
                teamScore,
                topUsers
            },
        });

        const users = await this.userRepository.findAllConnected(false);

        for (const user of users) {
            const userScore = await this.quizRepository.sumScoreByUserAndGame(user.id, game.id);
            const userRanking = await this.quizRepository.rankingGroupByUser(game.id);

            const ranking = userRanking.find(ranking => ranking['userid'] === user.id)

            await this.webSocketService.sendToUser(user.id, {
                event: 'quiz-user-paused',
                data: {
                    standing: ranking ? ranking['rank'] : null,
                    score: userScore ?? 0
                },
            });
        }

        await new GameMessageModel({
            gameId: game.id,
            eventType: 'quiz-user-paused',
            eventData: {}
        }).save();
    }

    private findNextQuestion(game: GameModel): number | undefined {
        if (!game.sentQuestionId) {
            return game.questions.ids[0];
        }

        const index = game.questions.ids.indexOf(game.sentQuestionId);

        if (index !== -1 && index < game.questions.ids.length - 1) {
            return game.questions.ids[index + 1];
        }

        return null;
    }
}
