import {GameModel} from "./game.model";
import {GameMessageModel} from "./game-message.model";

export const gameProviders = [
    {
        provide: 'GameRepository',
        useValue: GameModel,
    },
    {
        provide: 'GameMessageRepository',
        useValue: GameMessageModel,
    },
];
