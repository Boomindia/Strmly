import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"

export type TransactionDocument = Transaction & Document

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ required: true })
  userId: string // Reference to PostgreSQL User.id

  @Prop({ enum: ["EARNING", "WITHDRAWAL", "TIP", "PURCHASE"], required: true })
  type: string

  @Prop({ required: true })
  amount: number

  @Prop({ required: true })
  description: string

  @Prop({ enum: ["PENDING", "COMPLETED", "FAILED", "CANCELLED"], default: "PENDING" })
  status: string

  @Prop({ type: Object })
  metadata?: Record<string, any>

  @Prop()
  videoId?: string // If transaction is related to a video

  @Prop()
  externalTransactionId?: string // Payment gateway transaction ID
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction)

// Indexes
TransactionSchema.index({ userId: 1, createdAt: -1 })
TransactionSchema.index({ type: 1, status: 1, createdAt: -1 })
TransactionSchema.index({ status: 1, createdAt: -1 })
