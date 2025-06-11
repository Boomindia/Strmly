import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

@Schema()
export class Wallet extends Document {
  @Prop({ required: true })
  userId: string

  @Prop({ default: 0 })
  balance: number

  @Prop({ default: 0 })
  totalEarnings: number

  @Prop({ default: 0 })
  totalWithdrawals: number

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const WalletSchema = SchemaFactory.createForClass(Wallet) 