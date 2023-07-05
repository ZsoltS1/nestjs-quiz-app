import {ForbiddenException, Injectable, Logger, NotFoundException} from "@nestjs/common";
import {WebSocketService} from "../websocket/web-socket.service";
import {GameRepository} from "../model/game/game.repository";
import {GameModel} from "../model/game/game.model";
import {GameScoreType} from "../model/game/game-score.type";
import {QuizService} from "../quiz/quiz.service";
import {GameMessageService} from "./game-message.service";
import {QuizRepository} from "../model/quiz/quiz.repository";
import {QuestionRepository} from "../model/question/question.repository";

@Injectable()
export class GameService {
    private readonly logger = new Logger(GameService.name);

    constructor(private gameRepository: GameRepository,
                private quizService: QuizService,
                private gameMessageService: GameMessageService,
                private quizRepository: QuizRepository,
                private questionRepository: QuestionRepository,
                private webSocketService: WebSocketService) {
    }


    public async listAll() {
        return await this.gameRepository.findAll();
    }

    public async getActiveGame() {
        return await this.gameRepository.findLastActive();
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

    public async next(gameId) {
        const game = await this.gameRepository.findById(gameId);

        if (!game) {
            throw new NotFoundException();
        }

        if (game.stoppedAt) {
            throw new ForbiddenException();
        }

        if (!game.startedAt) {
            game.startedAt = new Date();
        }

        const nextQuestionId = this.findNextQuestion(game);

        if (nextQuestionId) {
            await this.quizService.send(game, nextQuestionId);
        }

        return await game.save();
    }

    public async stop(game: GameModel) {
        await this.sendStoppedMessage(game);

        game.stoppedAt = new Date();
        return await game.save();
    }

    private async sendStoppedMessage(game: GameModel) {
        const teamScore = await this.quizRepository.sumScoreGroupByTeam();
        const topUsers = await this.quizRepository.sumScoreGroupByUser();

        await this.webSocketService.sendToAdmin({
            event: 'quiz-stopped',
            data: {
                teamScore,
                topUsers
            },
        });
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
