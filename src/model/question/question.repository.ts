import {Inject, Injectable} from "@nestjs/common";
import {QuestionModel} from "./question.model";

@Injectable()
export class QuestionRepository {
    constructor(
        @Inject('QuestionRepository')
        private questionRepository: typeof QuestionModel
    ) {
    }

    public findById(questionId: number): Promise<QuestionModel> {
        return this.questionRepository.findOne({where: {id: questionId}});
    }

    public findAll(): Promise<Array<QuestionModel>> {
        return this.questionRepository.findAll();
    }

    public findAllByRound(round: number): Promise<Array<QuestionModel>> {
        return this.questionRepository.findAll({where: {round}, order: ['sequence']});
    }
}
