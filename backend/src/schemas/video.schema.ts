import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"

export type VideoDocument = Video & Document

@Schema({ timestamps: true })
export class Video {
  @Prop({ required: true })
  title: string

  @Prop()
  description?: string

  @Prop({ enum: ["SHORT", "LONG"], default: "SHORT" })
  type: string

  @Prop({ enum: ["DRAFT", "PROCESSING", "PUBLISHED", "FAILED", "PRIVATE"], default: "DRAFT" })
  status: string

  @Prop()
  videoUrl?: string

  @Prop({ type: Object })
  videoUrls?: Record<string, string> // Multiple quality URLs

  @Prop()
  thumbnailUrl?: string

  @Prop()
  duration?: number

  @Prop({ type: Object })
  metadata?: Record<string, any>

  @Prop({ enum: ["PUBLIC", "UNLISTED", "PRIVATE"], default: "PUBLIC" })
  visibility: string

  @Prop()
  price?: number

  @Prop([String])
  tags: string[]

  @Prop([String])
  hashtags: string[]

  @Prop()
  seriesId?: string

  @Prop()
  episodeNumber?: number

  // References to PostgreSQL
  @Prop({ required: true })
  userId: string // Reference to PostgreSQL User.id

  @Prop()
  communityId?: string // Reference to PostgreSQL Community.id

  // Embedded interaction counts for performance
  @Prop({ default: 0 })
  likesCount: number

  @Prop({ default: 0 })
  commentsCount: number

  @Prop({ default: 0 })
  sharesCount: number

  @Prop({ default: 0 })
  viewsCount: number
}

export const VideoSchema = SchemaFactory.createForClass(Video)

// Add indexes for better performance
VideoSchema.index({ userId: 1, createdAt: -1 })
VideoSchema.index({ status: 1, createdAt: -1 })
VideoSchema.index({ type: 1, status: 1, createdAt: -1 })
VideoSchema.index({ communityId: 1, createdAt: -1 })
VideoSchema.index({ hashtags: 1 })
VideoSchema.index({ tags: 1 })
