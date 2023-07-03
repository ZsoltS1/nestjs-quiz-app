import {
    AutoIncrement,
    BelongsTo,
    Column,
    CreatedAt,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt
} from "sequelize-typescript";
import {TeamModel} from "../team/team.model";
import {QuestionModel} from "../question/question.model";

@Table({
    tableName: 'user'
})
export class UserModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;
    @Column
    public fullname: string;
    @ForeignKey(() => TeamModel)
    @Column({ field: 'team_id' })
    public teamId: number;
    @BelongsTo(() => TeamModel, 'team_id')
    public team: Promise<TeamModel>;
    @Column
    public registered: boolean;
    @Column
    public admin: boolean;
    @CreatedAt
    @Column({ field: 'created_at' })
    public createdAt: Date;
    @UpdatedAt
    @Column({ field: 'updated_at' })
    public updatedAt: Date;
}
