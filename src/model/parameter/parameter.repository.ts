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

    public findValueByType(name: ParameterType | string) {
        return this.parameterRepository.findOne({
            where: {
                name
            },
        });
    }
}
