import {Module} from "@nestjs/common";
import {UserRepository} from "./user.repository";
import {userProviders} from "./user.providers";
import {DatabaseModule} from "../../database/database.module";

@Module({
    imports: [DatabaseModule],
    providers: [UserRepository, ...userProviders],
    exports: [UserRepository]
})
export class UserModule {
}
