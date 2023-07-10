import {Inject, Injectable} from "@nestjs/common";
import {GameModel} from "./game.model";
import {Op} from "sequelize";

@Injectable()
export class GameRepository {
    constructor(
        @Inject('GameRepository')
        private gameRepository: typeof GameModel
    ) {
    }

    public findAll() {
        return this.gameRepository.findAll();
    }

    public findById(gameId: number) {
        return this.gameRepository.findOne({where: {id: gameId}});
    }

    public findLastActive() {
        return this.gameRepository.findOne(
            {
                where: {
                    stoppedAt: {
                        [Op.eq]: null,
                    },
                },
                order: [['startedAt', 'DESC']],
                limit: 1
            })
    }
}
