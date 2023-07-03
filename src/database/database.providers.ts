import {Sequelize} from "sequelize-typescript";
import {UserModel} from "../model/user/user.model";
import {QuestionModel} from "../model/question/question.model";
import {QuizModel} from "../model/quiz/quiz.model";
import {TeamModel} from "../model/team/team.model";

export const databaseProviders = [
    {
        provide: 'SEQUELIZE',
        useFactory: async () => {
            const sequelize = new Sequelize({
                dialect: 'postgres',
                host: 'localhost',
                port: 5432,
                schema: "public",
                username: "",
                password: "",
                database: "",
                logging: true
            });
            sequelize.addModels([UserModel, QuizModel, TeamModel, QuestionModel]);
            await sequelize.sync();
            return sequelize;
        },
    },
];
