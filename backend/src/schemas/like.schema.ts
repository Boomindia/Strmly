import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"

export type LikeDocument = Like & Document

@Schema({ timestamps: true })
export class Like {
  @Prop({ required: true })
  userId: string // Reference to PostgreSQL User.id

  @Prop({ required: true })
  videoId: string // Reference to MongoDB Video._id

  @Prop({ enum: ["VIDEO", "COMMENT"], default: "VIDEO" })
  targetType: string

  @Prop()
  targetId?: string // For comment likes
}

export const LikeSchema = SchemaFactory.createForClass(Like)

// Compound index to prevent duplicate likes and for fast lookups
LikeSchema.index({ userId: 1, videoId: 1, targetType: 1, targetId: 1 }, { unique: true })
LikeSchema.index({ videoId: 1, createdAt: -1 })
LikeSchema.index({ userId: 1, createdAt: -1 })
