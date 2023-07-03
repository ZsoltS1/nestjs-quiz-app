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
import {UserModel} from "../user/user.model";
import {QuestionModel} from "../question/question.model";

@Table({
    tableName: 'quiz'
})
export class QuizModel extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    public id: number;
    @ForeignKey(() => UserModel)
    @Column({ field: 'user_id' })
    public userId: number;
    @BelongsTo(() => UserModel, 'user_id')
    public user: Promise<UserModel>;
    @ForeignKey(() => QuestionModel)
    @Column({ field: 'question_id' })
    public questionId: number;
    @BelongsTo(() => QuestionModel, 'question_id')
    public question: Promise<QuestionModel>;
    @Column({field: 'sent_at'})
    public sentAt: Date;
    @Column
    public answer: string;
    @Column({field: 'answered_at'})
    public answeredAt: Date;
    @Column
    public score: number;
    @CreatedAt
    @Column({ field: 'created_at' })
    public createdAt: Date;
    @UpdatedAt
    @Column({ field: 'updated_at' })
    public updatedAt: Date;
}
