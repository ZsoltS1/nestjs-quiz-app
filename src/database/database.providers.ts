import {Sequelize} from "sequelize-typescript";
import {UserModel} from "../model/user/user.model";
import {QuestionModel} from "../model/question/question.model";
import {QuizModel} from "../model/quiz/quiz.model";
import {TeamModel} from "../model/team/team.model";
import {ParameterModel} from "../model/parameter/parameter.model";
import {GameModel} from "../model/game/game.model";

export const databaseProviders = [
    {
        provide: 'SEQUELIZE',
        useFactory: async () => {
            const config = require(`${process.cwd()}/config/config.json`);

            const sequelize = new Sequelize({
                ...config.postgres,
                ...{
                    synchronize: false,
                    autoLoadModels: true,
                    define: {
                        timestamps: false,
                    },
                },
            });
            sequelize.addModels([UserModel, QuizModel, TeamModel, QuestionModel, GameModel, ParameterModel]);
            await sequelize.sync();
            return sequelize;
        },
    },
];
