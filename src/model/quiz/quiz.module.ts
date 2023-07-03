import {Module} from "@nestjs/common";
import {DatabaseModule} from "../../database/database.module";
import {QuizRepository} from "./quiz.repository";
import {quizProviders} from "./quiz.providers";

@Module({
    imports: [DatabaseModule],
    providers: [QuizRepository, ...quizProviders],
    exports: [QuizRepository]
})
export class QuizModule {

}
