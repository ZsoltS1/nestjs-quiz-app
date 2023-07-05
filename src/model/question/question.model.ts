import {AutoIncrement, Column, CreatedAt, Model, PrimaryKey, Table} from "sequelize-typescript";
import {DataTypes} from "sequelize";
import {QuestionHint} from "./question-hint.interface";
import {QuestionAnswer} from "./question-answer.interface";

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
    public demo: boolean;
    @Column
    public category: string;
    @Column({type: DataTypes.JSONB})
    public hint: QuestionHint;
    @Column({type: DataTypes.JSONB})
    public answer: QuestionAnswer;
    @Column
    public solution: string;
    @CreatedAt
    @Column({ field: 'created_at' })
    public createdAt: Date;
}
