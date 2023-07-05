import {AutoIncrement, Column, Model, PrimaryKey, Table} from "sequelize-typescript";

@Table({
    tableName: 'parameter',
    updatedAt: false,
    createdAt: false
})
export class ParameterModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;
    @Column
    public name: string;
    @Column
    public value: string;
}
