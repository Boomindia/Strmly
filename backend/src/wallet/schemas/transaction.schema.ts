import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

@Schema()
export class Transaction extends Document {
  @Prop({ required: true })
  userId: string

  @Prop({ required: true, enum: ["EARNING", "WITHDRAWAL"] })
  type: string

  @Prop({ required: true })
  amount: number

  @Prop({ required: true, enum: ["PENDING", "COMPLETED", "FAILED"] })
  status: string

  @Prop()
  description: string

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction) 