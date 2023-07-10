import {Module} from "@nestjs/common";
import {DatabaseModule} from "../../database/database.module";
import {GameRepository} from "./game.repository";
import {gameProviders} from "./game.providers";
import {GameMessageRepository} from "./game-message.repository";

@Module({
    imports: [DatabaseModule],
    providers: [GameRepository, GameMessageRepository, ...gameProviders],
    exports: [GameRepository, GameMessageRepository]
})
export class GameModule {

}
