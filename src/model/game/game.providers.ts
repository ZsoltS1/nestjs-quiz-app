import {GameModel} from "./game.model";

export const gameProviders = [
    {
        provide: 'GameRepository',
        useValue: GameModel,
    },
];
