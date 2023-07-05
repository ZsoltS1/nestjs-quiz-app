import {Injectable, Logger} from "@nestjs/common";
import {TeamRepository} from "../model/team/team.repository";

@Injectable()
export class TeamService {
    private readonly logger = new Logger(TeamService.name);

    constructor(private teamRepository: TeamRepository) {
    }

    public async listAll() {
        const teams = await this.teamRepository.findAll();

        return teams.map(team => ({
            id: team.id,
            name: team.name,
            text: team.text
        }));
    }

}
