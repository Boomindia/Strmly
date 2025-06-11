import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { PrismaModule } from "../prisma/prisma.module"
import { DatabaseService } from "./db.service"
import { Video, VideoSchema } from "../schemas/video.schema"
import { Like, LikeSchema } from "../schemas/like.schema"
import { Comment, CommentSchema } from "../schemas/comment.schema"
import { Follow, FollowSchema } from "../schemas/follow.schema"
import { Share, ShareSchema } from "../schemas/share.schema"
import { View, ViewSchema } from "../schemas/view.schema"
import { Transaction, TransactionSchema } from "../schemas/transaction.schema"

@Module({
  imports: [
    PrismaModule,
    MongooseModule.forFeature([
      { name: Video.name, schema: VideoSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Follow.name, schema: FollowSchema },
      { name: Share.name, schema: ShareSchema },
      { name: View.name, schema: ViewSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
