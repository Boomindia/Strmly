import { Controller, Get, Post, Body, Query, UseGuards, Request } from "@nestjs/common"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { WalletService } from "./wallet.service"
import { WithdrawDto } from "./dto/wallet.dto"
import { RequestWithUser } from "../auth/interfaces/request.interface"

@Controller("wallet")
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  getUserWallet(@Request() req: RequestWithUser) {
    return this.walletService.getUserWallet(req.user.id)
  }

  @Get("transactions")
  getTransactionHistory(
    @Request() req: RequestWithUser,
    @Query("page") page: string = "1",
    @Query("limit") limit: string = "10"
  ) {
    return this.walletService.getTransactionHistory(req.user.id, Number(page), Number(limit))
  }

  @Post("withdraw")
  createWithdrawal(@Request() req: RequestWithUser, @Body() withdrawDto: WithdrawDto) {
    return this.walletService.createWithdrawal(req.user.id, withdrawDto.amount)
  }

  @Get("analytics")
  getEarningsAnalytics(
    @Request() req: RequestWithUser,
    @Query("days") days: string = "30"
  ) {
    return this.walletService.getEarningsAnalytics(req.user.id, Number(days))
  }

  @Get("top-earners")
  async getTopEarners(@Query("limit") limit = 10) {
    return this.walletService.getTopEarners(Number(limit))
  }
}
