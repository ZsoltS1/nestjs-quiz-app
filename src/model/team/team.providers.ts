import {TeamModel} from "./team.model";

export const teamProviders = [
    {
        provide: 'TeamRepository',
        useValue: TeamModel,
    },
];
