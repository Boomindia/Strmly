import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

@Schema({ timestamps: true })
export class VideoAnalytics extends Document {
  @Prop({ required: true })
  videoId: string

  @Prop({ required: true, type: Date })
  date: Date

  @Prop({ default: 0 })
  views: number

  @Prop({ default: 0 })
  likes: number

  @Prop({ default: 0 })
  comments: number

  @Prop({ default: 0 })
  shares: number

  @Prop({ default: 0 })
  watchTime: number
}

export const VideoAnalyticsSchema = SchemaFactory.createForClass(VideoAnalytics)
