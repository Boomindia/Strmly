import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"

export type FollowDocument = Follow & Document

@Schema({ timestamps: true })
export class Follow {
  @Prop({ required: true })
  followerId: string // Reference to PostgreSQL User.id

  @Prop({ required: true })
  followingId: string // Reference to PostgreSQL User.id
}

export const FollowSchema = SchemaFactory.createForClass(Follow)

// Compound index to prevent duplicate follows
FollowSchema.index({ followerId: 1, followingId: 1 }, { unique: true })
FollowSchema.index({ followerId: 1, createdAt: -1 })
FollowSchema.index({ followingId: 1, createdAt: -1 })
