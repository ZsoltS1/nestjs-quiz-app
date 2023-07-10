import {Injectable, Logger} from "@nestjs/common";
import {QuestionRepository} from "../model/question/question.repository";
import {WebSocketService} from "../websocket/web-socket.service";
import {QuestionModel} from "../model/question/question.model";
import {QuizModel} from "../model/quiz/quiz.model";
import {UserRepository} from "../model/user/user.repository";
import * as moment from 'moment-timezone';
import {QuizRepository} from "../model/quiz/quiz.repository";
import {GameRepository} from "../model/game/game.repository";
import {GameModel} from "../model/game/game.model";
import {GameScoreType} from "../model/game/game-score.type";
import {ParameterType} from "../model/parameter/parameter.type";
import {ParameterRepository} from "../model/parameter/parameter.repository";

@Injectable()
export class QuizService {
    private readonly logger = new Logger(QuizService.name);

    constructor(private questionRepository: QuestionRepository,
                private userRepository: UserRepository,
                private gameRepository: GameRepository,
                private quizRepository: QuizRepository,
                private parameterRepository: ParameterRepository,
                private webSocketService: WebSocketService) {
    }

    public async send(game: GameModel, questionId: number) {
        const questionTimerInSec = await this.parameterRepository.findValueByType(ParameterType.QUESTION_TIMER_IN_SEC);
        const hintTimerConfig = await this.parameterRepository.findValueByType(ParameterType.QUESTION_HINT_TIMER);
        const gameQuestion = await this.questionRepository.findById(questionId);

        const hintTimer = hintTimerConfig.split(';').map(item => +item);

        await this.webSocketService.sendToAdmin({
            event: 'quiz-dashboard-message',
            data: {category: gameQuestion.category, info: gameQuestion.hint.info[0], timerInSec: questionTimerInSec}
        });

        await this.sendAnswers(gameQuestion, game);

        const currentQuestionIndex = 1;

        setTimeout(() => {
            this.sendNextQuestion(currentQuestionIndex, gameQuestion, hintTimer, async (question, index) => {
                await this.webSocketService.sendToAdmin({
                    event: 'quiz-dashboard-hint',
                    data: {info: question.hint.info[index]}
                });
            });
        }, hintTimer[0]);

        game.sentAt = new Date();
        game.sentQuestionId = questionId;
        await game.save();
    }

    public async evaluate(quiz: QuizModel) {
        const hintTimerConfig = await this.parameterRepository.findValueByType(ParameterType.QUESTION_HINT_TIMER);
        const question = await this.questionRepository.findById(quiz.questionId);

        if (question.solution !== quiz.answer) {
            quiz.score = 0;
            await quiz.save();

            return;
        }

        const hintTimer = hintTimerConfig.split(';').map(item => +item);
        const units = moment(quiz.answeredAt).diff(moment(quiz.sentAt, 'milliseconds'));

        const deadline = hintTimer.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

        if (units < deadline) {
            quiz.score = this.calculateScore(hintTimer, units);
        }

        await quiz.save();
    }

    private calculateScore(hintTimer: number[], units: number) {
        let hintLimit = 0;

        for (let i = 0; i < hintTimer.length; i++) {
            hintLimit += hintTimer[i];

            if (units <= hintLimit) {
                return (3 - i);
            }
        }

        return 0;
    }

    private async sendAnswers(question: QuestionModel, game: GameModel) {
        const users = await this.userRepository.findAllConnected(false);

        const quizModels = [];

        for (const user of users) {
            quizModels.push(
                await new QuizModel({
                    userId: user.id,
                    questionId: question.id,
                    gameId: game.id,
                    sentAt: new Date()
                })
            );

            const userScore = await this.quizRepository.sumScoreByUserAndGame(user.id, game.id);

            this.webSocketService.sendToUser(user.id, {
                event: 'quiz-user-message',
                data: {
                    gameId: game.id,
                    questionId: question.id,
                    answer: question.answer.options,
                    score: userScore ?? 0
                }
            });
        }

        await Promise.allSettled(quizModels.map(model => model.save()));
    }

    private sendNextQuestion(currentHintIndex, question, hintTimer, callback: (question: QuestionModel, index: number) => void) {
        if (currentHintIndex < question.hint.info.length) {
            callback(question, currentHintIndex);

            currentHintIndex++;

            setTimeout(() => {
                this.sendNextQuestion(currentHintIndex, question, hintTimer, callback);
            }, hintTimer[currentHintIndex]);
        }
    }
}
