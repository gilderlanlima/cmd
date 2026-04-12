import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  Default,
  AllowNull,
  DataType
} from "sequelize-typescript";

import Company from "./Company";
import User from "./User";

@Table({ tableName: "OnCallSettings" })
class OnCallSetting extends Model<OnCallSetting> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @ForeignKey(() => Company)
  @AllowNull(false)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @AllowNull(false)
  @Column
  phone: string;

  @Default(15)
  @AllowNull(false)
  @Column
  intervalMinutes: number;

  @Default(true)
  @AllowNull(false)
  @Column
  active: boolean;

  @AllowNull(false)
  @Column(DataType.JSONB)
  schedules: Record<string, any>;

  @Column(DataType.DATE)
  lastNotificationAt: Date | null;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default OnCallSetting;
