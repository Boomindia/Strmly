import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import type { Document } from "mongoose"

export type ViewDocument = View & Document

@Schema({ timestamps: true })
export class View {
  @Prop({ required: true })
  userId: string // Reference to PostgreSQL User.id

  @Prop({ required: true })
  videoId: string // Reference to MongoDB Video._id

  @Prop()
  duration?: number // How long the user watched (in seconds)

  @Prop()
  watchPercentage?: number // Percentage of video watched

  @Prop()
  deviceType?: string // 'mobile', 'desktop', 'tablet'

  @Prop()
  ipAddress?: string

  @Prop()
  userAgent?: string
}

export const ViewSchema = SchemaFactory.createForClass(View)

// Indexes
ViewSchema.index({ videoId: 1, createdAt: -1 })
ViewSchema.index({ userId: 1, createdAt: -1 })
ViewSchema.index({ userId: 1, videoId: 1, createdAt: -1 })
