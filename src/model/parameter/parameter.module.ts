import {Module} from "@nestjs/common";
import {DatabaseModule} from "../../database/database.module";
import {ParameterRepository} from "./parameter.repository";
import {parameterProviders} from "./parameter.providers";

@Module({
    imports: [DatabaseModule],
    providers: [ParameterRepository, ...parameterProviders],
    exports: [ParameterRepository]
})
export class ParameterModule {

}
