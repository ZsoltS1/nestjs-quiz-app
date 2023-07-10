import {Inject, Injectable} from "@nestjs/common";
import {GameModel} from "./game.model";
import {Op} from "sequelize";
import {GameMessageModel} from "./game-message.model";

@Injectable()
export class GameMessageRepository {
    constructor(
        @Inject('GameMessageRepository')
        private gameMessageRepository: typeof GameMessageModel
    ) {
    }

    public findAll() {
        return this.gameMessageRepository.findAll();
    }

    public findLastByGame(gameId: number) {
        return this.gameMessageRepository.findOne(
            {
                where: {
                    gameId
                },
                order: [['createdAt', 'DESC']],
                limit: 1
            })
    }
}
