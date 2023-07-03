import {Injectable, Logger} from "@nestjs/common";
import {QuestionRepository} from "../model/question/question.repository";
import {WebSocketService} from "../websocket/web-socket.service";
import {QuestionModel} from "../model/question/question.model";
import {QuizModel} from "../model/quiz/quiz.model";
import {UserRepository} from "../model/user/user.repository";
import * as moment from 'moment-timezone';
import {QuizRepository} from "../model/quiz/quiz.repository";

@Injectable()
export class QuizService {
    private readonly logger = new Logger(QuizService.name);

    constructor(private questionRepository: QuestionRepository,
                private userRepository: UserRepository,
                private quizRepository: QuizRepository,
                private webSocketService: WebSocketService) {
    }

    public async listAll() {
        return await this.questionRepository.findAll();
    }

    public async start(round: number, startFrom: number = 0) {
        const gameQuestions = await this.questionRepository.findAllByRound(round);

        this.sendNextQuestion(startFrom, gameQuestions, async (question) => {
            await this.webSocketService.sendToAdmin({
                event: 'quiz-dashboard-message',
                data: {category: question.category, info: question.hint}
            });

            await this.sendAnswers(question);
        });
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
        } else {
            quiz.score = 3;
        }

        await quiz.save();
    }

    private async sendAnswers(question: QuestionModel) {
        const users = await this.userRepository.findAllRegistered();

        for (const user of users) {
            await new QuizModel({
                userId: user.id,
                questionId: question.id,
                sentAt: new Date()
            }).save();

            const userScore = await this.quizRepository.sumScoreByUser(user.id);

            this.webSocketService.sendToUser(user.id, {
                event: 'quiz-user-message',
                data: {id: question.id, answer: question.answer, currentScore: userScore}
            });
        }
    }

    private sendNextQuestion(currentQuestionIndex, questions, callback: (question: QuestionModel) => void) {
        if (currentQuestionIndex < questions.length) {
            const question = questions[currentQuestionIndex];

            callback(question);

            currentQuestionIndex++;

            setTimeout(() => {
                this.sendNextQuestion(currentQuestionIndex, questions, callback);
            }, 60000);
        }
    }
}
