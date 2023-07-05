import {Body, Controller, Post} from "@nestjs/common";
import {TeamRepository} from "./team.repository";

@Controller('/api')
export class TeamController {
    constructor(private readonly teamRepository: TeamRepository) {
    }

    @Post('/teams')
    public async listAll(@Body() body: any) {
        const teams = await this.teamRepository.findAll();

        return teams.map(team => ({
            id: team.id,
            name: team.name
        }));
    }
}
