import {Module} from "@nestjs/common";
import {DatabaseModule} from "../../database/database.module";
import {GameRepository} from "./game.repository";
import {gameProviders} from "./game.providers";

@Module({
    imports: [DatabaseModule],
    providers: [GameRepository, ...gameProviders],
    exports: [GameRepository]
})
export class GameModule {

}
