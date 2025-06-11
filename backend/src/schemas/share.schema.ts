import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"

export type ShareDocument = Share & Document

@Schema({ timestamps: true })
export class Share {
  @Prop({ required: true })
  userId: string // Reference to PostgreSQL User.id

  @Prop({ required: true })
  videoId: string // Reference to MongoDB Video._id

  @Prop()
  platform?: string // 'whatsapp', 'instagram', 'telegram', etc.

  @Prop()
  shareUrl?: string
}

export const ShareSchema = SchemaFactory.createForClass(Share)

// Indexes
ShareSchema.index({ videoId: 1, createdAt: -1 })
ShareSchema.index({ userId: 1, createdAt: -1 })
ShareSchema.index({ platform: 1, createdAt: -1 })
