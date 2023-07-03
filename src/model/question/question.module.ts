import {Module} from "@nestjs/common";
import {DatabaseModule} from "../../database/database.module";
import {QuestionRepository} from "./question.repository";
import {questionProviders} from "./question.providers";

@Module({
    imports: [DatabaseModule],
    providers: [QuestionRepository, ...questionProviders],
    exports: [QuestionRepository]
})
export class QuestionModule {

}
