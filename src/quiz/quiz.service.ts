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

@Injectable()
export class QuizService {
    private readonly logger = new Logger(QuizService.name);

    constructor(private questionRepository: QuestionRepository,
                private userRepository: UserRepository,
                private gameRepository: GameRepository,
                private quizRepository: QuizRepository,
                private webSocketService: WebSocketService) {
    }

    public async send(game: GameModel, questionId: number) {
        const gameQuestion = await this.questionRepository.findById(questionId);

        await this.sendAnswers(gameQuestion);

        await this.webSocketService.sendToAdmin({
            event: 'quiz-dashboard-message',
            data: {category: gameQuestion.category, timerInSec: 60}
        });

        const currentQuestionIndex = 0;

        this.sendNextQuestion(currentQuestionIndex, gameQuestion, async (question, index) => {
            await this.webSocketService.sendToAdmin({
                event: 'quiz-dashboard-hint',
                data: {info: question.hint.info[index]}
            });
        });

        game.sentAt = new Date();
        game.sentQuestionId = questionId;
        await game.save();
    }

    public async evaluate(quiz: QuizModel) {
        const question = await this.questionRepository.findById(quiz.questionId);

        if (question.solution !== quiz.answer) {
            quiz.score = 0;
            await quiz.save();

            return;
        }

        const units = moment(quiz.sentAt).diff(moment(quiz.answeredAt, 'seconds'));

        if (units > 40) {
            quiz.score = 1;
        } else if (units > 20 && units <= 40) {
            quiz.score = 2;
        } else if (units <= 20){
            quiz.score = 3;
        }

        await quiz.save();
    }

    private async sendAnswers(question: QuestionModel) {
        const users = await this.userRepository.findAllRegistered(false);

        const quizModels = [];

        for (const user of users) {
            quizModels.push(
                await new QuizModel({
                    userId: user.id,
                    questionId: question.id,
                    sentAt: new Date()
                })
            );

            this.webSocketService.sendToUser(user.id, {
                event: 'quiz-user-message',
                data: {
                    questionId: question.id,
                    answer: question.answer.options
                }
            });

            const userScore = await this.quizRepository.sumScoreByUser(user.id);

            this.webSocketService.sendToUser(user.id, {
                event: 'quiz-user-score',
                data: {
                    score: userScore
                }
            });
        }

        await Promise.allSettled(quizModels.map(model => model.save()));
    }

    private sendNextQuestion(currentHintIndex, question, callback: (question: QuestionModel, index: number) => void) {
        if (currentHintIndex < question.hint.info.length) {
            callback(question, currentHintIndex);

            currentHintIndex++;

            setTimeout(() => {
                this.sendNextQuestion(currentHintIndex, question, callback);
            }, 20000);
        }
    }
}
