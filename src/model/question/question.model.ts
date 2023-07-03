import {AutoIncrement, Column, CreatedAt, Model, PrimaryKey, Table} from "sequelize-typescript";
import {DataTypes} from "sequelize";

@Table({
    tableName: 'question',
    updatedAt: false
})
export class QuestionModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;
    @Column
    public sequence: number;
    @Column
    public round: number;
    @Column
    public category: string;
    @Column({type: DataTypes.JSONB})
    public hint: any;
    @Column({type: DataTypes.JSONB})
    public answer: any;
    @Column
    public solution: string;
    @CreatedAt
    @Column({ field: 'created_at' })
    public createdAt: Date;
}
