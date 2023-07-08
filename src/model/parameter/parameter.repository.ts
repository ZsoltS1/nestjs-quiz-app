import {Inject, Injectable} from "@nestjs/common";
import {ParameterModel} from "./parameter.model";
import {ParameterType} from "./parameter.type";

@Injectable()
export class ParameterRepository {

    constructor(
        @Inject('ParameterRepository')
        private parameterRepository: typeof ParameterModel
    ) {
    }

    public findAll() {
        return this.parameterRepository.findAll();
    }

    public findByType(name: ParameterType | string) {
        return this.parameterRepository.findOne({
            where: {
                name
            },
        })
    }

    public async findValueByType(name: ParameterType | string) {
        const parameter = await this.findByType(name);

        return parameter.value;
    }
}
