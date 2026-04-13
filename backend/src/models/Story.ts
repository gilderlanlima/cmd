import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType
} from "sequelize-typescript";
import Company from "./Company";
import User from "./User";
import Whatsapp from "./Whatsapp";

@Table({ tableName: "Stories" })
class Story extends Model<Story> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => User)
  @Column({ allowNull: true })
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Whatsapp)
  @Column({ allowNull: true })
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @Column({ allowNull: false, defaultValue: "panel" })
  sourceType: string;

  @Column(DataType.TEXT)
  sourceJid: string;

  @Column(DataType.TEXT)
  sourceMessageId: string;

  @Column(DataType.TEXT)
  authorName: string;

  @Column(DataType.TEXT)
  authorAvatar: string;

  @Column(DataType.TEXT)
  caption: string;

  @Column
  mediaPath: string;

  @Column
  mediaName: string;

  @Column
  mediaType: string;

  @Column({ defaultValue: true })
  isActive: boolean;

  @Column
  expiresAt: Date;

  @CreatedAt
  @Column(DataType.DATE(6))
  createdAt: Date;

  @UpdatedAt
  @Column(DataType.DATE(6))
  updatedAt: Date;
}

export default Story;
