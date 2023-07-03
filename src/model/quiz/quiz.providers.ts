import {QuizModel} from "./quiz.model";

export const quizProviders = [
    {
        provide: 'QuizRepository',
        useValue: QuizModel,
    },
];
