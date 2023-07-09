import {Controller, Get} from "@nestjs/common";
import {QuestionRepository} from "../model/question/question.repository";

@Controller('/api/questions')
export class QuestionController {
    constructor(private readonly questionRepository: QuestionRepository) {
    }

    @Get('/')
    public async listAll() {
        return await this.questionRepository.findAll();
    }
}
