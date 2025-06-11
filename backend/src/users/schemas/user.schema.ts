import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { Document } from "mongoose"

@Schema()
export class User extends Document {
  @Prop({ required: true })
  declare id: string

  @Prop({ required: true })
  email: string

  @Prop({ required: true })
  username: string

  @Prop()
  avatar: string

  @Prop()
  banner: string

  @Prop()
  bio: string

  @Prop({ default: false })
  isVerified: boolean

  @Prop({ default: false })
  isAdmin: boolean

  @Prop({ default: Date.now })
  createdAt: Date

  @Prop({ default: Date.now })
  updatedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User) 