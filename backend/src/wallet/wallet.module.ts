import { Module } from "@nestjs/common"
import { MongooseModule } from "@nestjs/mongoose"
import { WalletService } from "./wallet.service"
import { WalletController } from "./wallet.controller"
import { PrismaModule } from "../prisma/prisma.module"
import { Wallet, WalletSchema } from "./schemas/wallet.schema"
import { Transaction, TransactionSchema } from "./schemas/transaction.schema"

@Module({
  imports: [
    PrismaModule,
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  providers: [WalletService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}
