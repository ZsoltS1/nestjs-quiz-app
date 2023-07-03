import {Inject, Injectable} from "@nestjs/common";
import {UserModel} from "./user.model";

@Injectable()
export class UserRepository {

    constructor(
        @Inject('UserRepository')
        private userRepository: typeof UserModel
    ) {
    }

    public async findAll(): Promise<Array<UserModel>> {
        return this.userRepository.findAll();
    }

    public async findById(userId: number): Promise<UserModel> {
        return this.userRepository.findOne({where: {id: userId}});
    }

    public async findByName(name: string): Promise<UserModel> {
        return this.userRepository.findOne({where: {fullname: name}});
    }

    public async findAllRegistered() {
        return this.userRepository.findAll({where: {registered: true}});
    }

    public async findAdmin() {
        return this.userRepository.findOne({where: {admin: true}});
    }
}
