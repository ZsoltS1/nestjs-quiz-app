import {Controller, Get, HttpCode, HttpStatus, Post, Query} from "@nestjs/common";
import {QuizService} from "./quiz.service";
import {LoginService} from "../login/login.service";

@Controller('/api/quiz')
export class QuizController {

    constructor(private readonly quizService: QuizService) {
    }

    @Post('/start')
    @HttpCode(204)
    public async startQuiz(@Query('round') round: number, @Query('startFrom') startFrom: number = 0) {
        await this.quizService.start(round, startFrom);
    }
}
