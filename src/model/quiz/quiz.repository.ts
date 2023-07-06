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

    public async sumScoreGroupByTeam() {
        const result = await this.quizRepository.sequelize.query(`
            select t.id as id, t.text as text, t.name,
                   COUNT(CASE WHEN score = 3 THEN 1 END) AS flash_1,
                   COUNT(CASE WHEN score = 2 THEN 1 END) AS flash_2,
                   COUNT(CASE WHEN score = 1 THEN 1 END) AS flash_3,
                   coalesce(sum(score), 0) as total
            from team t
                     left join "user" u on t.id = u.team_id
                     left join quiz q on q.user_id = u.id
                     left join question qs on qs.id = q.question_id and qs.demo = false
            group by t.id, t.text, t.name
            order by coalesce(sum(score), 0) desc
        `);

        return result?.[0];
    }

    public async sumScoreGroupByUser() {
        const result = await this.quizRepository.sequelize.query(`
            select u.id, u.fullname as user, coalesce(sum(score), 0) as score
            from quiz q
                join "user" u
            on q.user_id = u.id
                join question qs on qs.id = q.question_id and qs.demo = false
            where u.admin = false
            group by u.id, u.fullname
            order by coalesce (sum (score), 0) desc
                limit 5;
        `);

        return result?.[0];
    }

    public async rankingGroupByUser() {
        const result = await this.quizRepository.sequelize.query(`
            select row_number() over (order by coalesce(sum(score), 0) desc ) as rank, u.id as userId,
                   u.fullname              as name,
                   coalesce(sum(score), 0) as score
            from quiz q
                     join "user" u on q.user_id = u.id
                     join question qs on qs.id = q.question_id and qs.demo = false
            where u.admin = false
            group by u.id;
        `)

        return result?.[0];
    }
}
