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

    @Get('/')
    public async listAll() {
        const games = await this.gameService.listAll();

        return games.map(game => this.map(game));
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

        const newGame = await this.gameService.createGame(body.demo, body.scoreType ?? GameScoreType.none);

        return this.map(newGame);
    }

    @Patch('/:id/standing')
    @HttpCode(204)
    public async getStanding(@Param('id') gameId: number) {
        const game = await this.gameService.next(gameId);

        await this.gameService.getStanding(game);
    }

    @Patch('/:id/next')
    public async nextQuestion(@Param('id') gameId: number) {
        const game = await this.gameService.next(gameId);

        return this.map(game);
    }

    @Patch('/:id/stop')
    public async stopGame(@Param('id') gameId: number) {
        const game = await this.gameRepository.findById(gameId);

        if (!game) {
            throw new NotFoundException();
        }

        if (game.stoppedAt) {
            throw new ForbiddenException();
        }

        return this.map(await this.gameService.stop(game));
    }

    private map(game: GameModel) {
        return {
            id: game.id,
            demo: game.demo,
            scoreType: game.scoreType,
            sentQuestion: game.sentQuestionId,
            startedAt: game.startedAt,
            stoppedAt: game.stoppedAt
        }
    }
}
