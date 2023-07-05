import {Controller, Get} from "@nestjs/common";
import {TeamService} from "./team.service";
import {TeamRepository} from "../model/team/team.repository";

@Controller('/api/teams')
export class TeamController {
    constructor(private readonly teamService: TeamService) {
    }

    @Get('/')
    public async listAllTeams() {
        return await this.teamService.listAll();
    }
}
