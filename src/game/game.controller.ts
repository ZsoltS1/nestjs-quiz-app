import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Patch,
    Post
} from "@nestjs/common";
import {GameService} from "./game.service";
import {GameScoreType} from "../model/game/game-score.type";
import {GameModel} from "../model/game/game.model";
import {GameRepository} from "../model/game/game.repository";

@Controller('/api/game')
export class GameController {
    constructor(private gameService: GameService, private gameRepository: GameRepository) {
    }

    @Get('/active')
    public async getActive() {
        const game = await this.gameService.getActiveGame();

        if (!game) {
            return {};
        }

        return this.map(game);
    }

    @Post('/')
    public async create(@Body() body: any) {
        if (body.demo === undefined) {
            throw new ForbiddenException();
        }

        const newGame = await this.gameService.createGame(body.demo, body.scoreType ?? GameScoreType.continuous);

        return this.map(newGame);
    }

    @Patch('/:id/standing')
    @HttpCode(204)
    public async getStanding(@Param('id') gameId: number) {
        const game = await this.gameRepository.findById(gameId);

        if (!game) {
          throw new NotFoundException();
        }

        await this.gameService.getStanding(game);
    }

    @Patch('/:id/next')
    public async nextQuestion(@Param('id') gameId: number) {
        const game = await this.gameRepository.findById(gameId);

        if (!game) {
            throw new NotFoundException();
        }

        return this.map(await this.gameService.nextQuestion(game));
    }

    private map(game: GameModel) {
        return {
            id: game.id,
            demo: game.demo,
            scoreType: game.scoreType,
            sentAt: game.sentAt,
            sentQuestion: game.sentQuestionId,
            startedAt: game.startedAt,
            stoppedAt: game.stoppedAt
        }
    }
}
