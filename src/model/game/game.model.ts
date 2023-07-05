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
import {QuestionModel} from "../question/question.model";
import {DataTypes} from "sequelize";
import {GameQuestions} from "./game-questions.interface";

@Table({
    tableName: 'game'
})
export class GameModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;
    @Column({ field: 'started_at' })
    public startedAt: Date;
    @Column({ field: 'demo' })
    public demo: boolean;
    @Column({ field: 'score_type' })
    public scoreType: string;
    @Column({ field: 'sent_at' })
    public sentAt: Date;
    @Column({type: DataTypes.JSONB})
    public questions: GameQuestions;
    @ForeignKey(() => QuestionModel)
    @Column({ field: 'sent_question_id' })
    public sentQuestionId: number;
    @BelongsTo(() => QuestionModel, 'sent_question_id')
    public sentQuestion: Promise<QuestionModel>;
    @Column({ field: 'stopped_at' })
    public stoppedAt: Date;
    @CreatedAt
    @Column({ field: 'created_at' })
    public createdAt: Date;
    @UpdatedAt
    @Column({ field: 'updated_at' })
    public updatedAt: Date;

}
