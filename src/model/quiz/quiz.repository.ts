import {Inject, Injectable} from "@nestjs/common";
import {QuizModel} from "./quiz.model";
import {QueryTypes} from "sequelize";

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

    public findByUserAndQuestionAndGame(userId: number, questionId: number, gameId: number) {
        return this.quizRepository.findOne({where: {userId, questionId, gameId}});
    }

    public sumScoreByUserAndGame(userId: number, gameId: number) {
        return this.quizRepository.sum('score', {where: {userId, gameId}});
    }

    public sumScoreGroupByTeam(gameId: number) {
        return this.quizRepository.sequelize.query(`
            select t.id                                  as id,
                   t.text                                as text,
                   t.name                                as name,
                   COUNT(CASE WHEN score = 3 THEN 1 END) AS flash_3,
                   COUNT(CASE WHEN score = 2 THEN 1 END) AS flash_2,
                   COUNT(CASE WHEN score = 1 THEN 1 END) AS flash_1,
                   coalesce(sum(score), 0)               as total
            from team t
                     left join "user" u on t.id = u.team_id
                     left join quiz q on q.user_id = u.id and q.game_id = :gameId
                     left join question qs on qs.id = q.question_id and qs.demo = false
            group by t.id, t.text, t.name
            order by coalesce(sum(score), 0) desc, flash_3 desc, flash_2 desc, flash_1 desc
        `,  {
            replacements: {gameId},
            type: QueryTypes.SELECT,
        });
    }

    public sumScoreGroupByUser(gameId: number) {
        return this.quizRepository.sequelize.query(`
            select u.id, u.fullname as user, coalesce(sum(score), 0) as score
            from quiz q
                join "user" u
            on q.user_id = u.id
                join question qs on qs.id = q.question_id and qs.demo = false
            where u.admin = false and q.game_id = :gameId
            group by u.id, u.fullname
            order by coalesce (sum (score), 0) desc
                limit 5;
        `, {
            replacements: {gameId},
            type: QueryTypes.SELECT,
        });
    }

    public rankingGroupByUser(gameId: number) {
        return this.quizRepository.sequelize.query(`
            select row_number()               over (order by coalesce(sum(score), 0) desc ) as rank, u.id as userId,
                   u.fullname              as name,
                   coalesce(sum(score), 0) as score
            from quiz q
                     join "user" u on q.user_id = u.id
                     join question qs on qs.id = q.question_id and qs.demo = false
            where u.admin = false
              and q.game_id = :gameId
            group by u.id;
        `, {
            replacements: {gameId},
            type: QueryTypes.SELECT,
        });
    }
}
