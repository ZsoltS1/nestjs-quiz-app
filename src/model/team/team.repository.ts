import {Inject, Injectable} from "@nestjs/common";
import {TeamModel} from "./team.model";
import {UserModel} from "../user/user.model";

@Injectable()
export class TeamRepository {
    constructor(
        @Inject('TeamRepository')
        private teamRepository: typeof TeamModel
    ) {
    }

    public async findAll(): Promise<Array<TeamModel>> {
        return this.teamRepository.findAll();
    }

    public async findById(teamId: number): Promise<TeamModel> {
        return this.teamRepository.findOne({where: {id: teamId}});
    }
}
