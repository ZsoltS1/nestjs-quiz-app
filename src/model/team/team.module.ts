import {Module} from "@nestjs/common";
import {DatabaseModule} from "../../database/database.module";
import {teamProviders} from "./team.providers";
import {TeamRepository} from "./team.repository";

@Module({
    imports: [DatabaseModule],
    providers: [TeamRepository, ...teamProviders],
    exports: [TeamRepository]
})
export class TeamModule {

}
