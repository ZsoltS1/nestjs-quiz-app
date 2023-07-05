import {Inject, Injectable} from "@nestjs/common";
import {UserModel} from "./user.model";

@Injectable()
export class UserRepository {

    constructor(
        @Inject('UserRepository')
        private userRepository: typeof UserModel
    ) {
    }

    public findAll(): Promise<Array<UserModel>> {
        return this.userRepository.findAll();
    }

    public findById(userId: number): Promise<UserModel> {
        return this.userRepository.findOne({where: {id: userId}});
    }

    public findByName(name: string): Promise<UserModel> {
        return this.userRepository.findOne({where: {fullname: name}});
    }

    public findAllRegistered() {
        return this.userRepository.findAll({where: {registered: true}});
    }

    public findAdmin() {
        return this.userRepository.findOne({where: {admin: true}});
    }
}
