import {AutoIncrement, BelongsTo, Column, CreatedAt, ForeignKey, Model, PrimaryKey, Table} from "sequelize-typescript";
import {GameModel} from "./game.model";
import {DataTypes, JSONB} from "sequelize";

@Table({
    tableName: 'game_message',
    updatedAt: false
})
export class GameMessageModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;
    @ForeignKey(() => GameModel)
    @Column({field: 'game_id'})
    public gameId: number;
    @BelongsTo(() => GameModel, 'game_id')
    public game: Promise<GameModel>;
    @Column({ field: 'event_type' })
    public eventType: string;
    @Column({ field: 'event_data', type: DataTypes.JSONB })
    public eventData: any;
    @CreatedAt
    @Column({field: 'created_at'})
    public createdAt: Date;
}
