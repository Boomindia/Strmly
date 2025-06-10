import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { type Document, Types } from "mongoose"

export type CommentDocument = Comment & Document

@Schema({ timestamps: true })
export class Comment {
  @Prop({ required: true })
  content: string

  @Prop({ required: true })
  userId: string // Reference to PostgreSQL User.id

  @Prop({ required: true })
  videoId: string // Reference to MongoDB Video._id

  @Prop({ type: Types.ObjectId, ref: "Comment" })
  parentId?: Types.ObjectId // For nested comments

  @Prop({ default: 0 })
  likesCount: number

  @Prop({ default: 0 })
  repliesCount: number

  @Prop({ default: false })
  isEdited: boolean
}

export const CommentSchema = SchemaFactory.createForClass(Comment)

// Indexes
CommentSchema.index({ videoId: 1, createdAt: -1 })
CommentSchema.index({ userId: 1, createdAt: -1 })
CommentSchema.index({ parentId: 1, createdAt: -1 })
