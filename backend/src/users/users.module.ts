import { Module } from "@nestjs/common"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"
import { PrismaModule } from "../prisma/prisma.module"
import { DatabaseModule } from "../db/db.module"
import { UploadModule } from "../upload/upload.module"
import { RedisCacheModule } from "../cache/cache.module"

@Module({
  imports: [PrismaModule, DatabaseModule, UploadModule, RedisCacheModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
