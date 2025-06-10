import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common"
import { WalletService } from "./wallet.service"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import type { WithdrawDto } from "./dto/wallet.dto"
import { Request } from "express";

@Controller("wallet")
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  async getUserWallet(req: Request) {
    return this.walletService.getUserWallet(req.user.id)
  }

  @Get("transactions")
  async getTransactionHistory(
    req: Request,
    @Query("page") page = 1,
    @Query("limit") limit = 20,
  ) {
    return this.walletService.getTransactionHistory(req.user.id, Number(page), Number(limit))
  }

  @Post("withdraw")
  async createWithdrawal(req: Request, @Body() withdrawDto: WithdrawDto) {
    return this.walletService.createWithdrawal(req.user.id, withdrawDto)
  }

  @Get("analytics")
  async getEarningsAnalytics(req: Request, @Query("days") days = 30) {
    return this.walletService.getEarningsAnalytics(req.user.id, Number(days))
  }

  @Get("top-earners")
  async getTopEarners(@Query("limit") limit = 10) {
    return this.walletService.getTopEarners(Number(limit))
  }
}
