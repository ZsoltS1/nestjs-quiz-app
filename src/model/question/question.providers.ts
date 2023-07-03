import {QuestionModel} from "./question.model";

export const questionProviders = [
    {
        provide: 'QuestionRepository',
        useValue: QuestionModel,
    },
];
