import {UserModel} from "./user.model";

export const userProviders = [
    {
        provide: 'UserRepository',
        useValue: UserModel,
    },
];
