import {Inject, Injectable} from "@nestjs/common";
import {TeamModel} from "./team.model";

@Injectable()
export class TeamRepository {
    constructor(
        @Inject('TeamRepository')
        private teamRepository: typeof TeamModel
    ) {
    }

    public findAll(): Promise<Array<TeamModel>> {
        return this.teamRepository.findAll({order: [['id', 'ASC']]});
    }

    public findById(teamId: number): Promise<TeamModel> {
        return this.teamRepository.findOne({where: {id: teamId}});
    }
}
