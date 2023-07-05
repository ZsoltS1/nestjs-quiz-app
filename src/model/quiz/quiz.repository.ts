import {Inject, Injectable} from "@nestjs/common";
import {QuizModel} from "./quiz.model";

@Injectable()
export class QuizRepository {
    constructor(
        @Inject('QuizRepository')
        private quizRepository: typeof QuizModel
    ) {
    }

    public findAll(): Promise<Array<QuizModel>> {
        return this.quizRepository.findAll();
    }

    public findByUserIdAndQuestionId(userId: number, questionId: number) {
        return this.quizRepository.findOne({where: {userId, questionId}});
    }

    public sumScoreByUser(userId: number) {
        return this.quizRepository.sum('score', {where: {userId}});
    }

    public async sumScoreByTeam(team?: number) {
        const result = await this.quizRepository.sequelize.query(`
            select t.name as team, coalesce(sum(score), 0) as score
            from team t
            left join "user" u on t.id = u.team_id
            left join quiz q on q.user_id = u.id
            group by t.id, t.name 
        `);

        return result?.[0];
    }

    public async sumScoreByTopUser() {
        const result =  await this.quizRepository.sequelize.query(`
            select u.fullname as user, coalesce(sum(score), 0) as score
            from quiz q
                join "user" u on q.user_id = u.id
            group by u.fullname
            order by coalesce(sum(score), 0) desc
            limit 6;
        `);

        return result?.[0];
    }
}
