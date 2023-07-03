import {AutoIncrement, Column, CreatedAt, Model, PrimaryKey, Table} from "sequelize-typescript";

@Table({
    tableName: 'team',
    updatedAt: false
})
export class TeamModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;
    @Column
    public name: string;
    @CreatedAt
    @Column({ field: 'created_at' })
    public createdAt: Date;
}
