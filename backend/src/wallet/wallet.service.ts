import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import type { WithdrawDto } from "./dto/wallet.dto"

@Injectable()
export class WalletService {
  constructor(private prisma: PrismaService) {}

  async getUserWallet(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    // Calculate total earnings
    const earnings = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: "EARNING",
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    })

    // Calculate total withdrawals
    const withdrawals = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: "WITHDRAWAL",
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    })

    const totalEarnings = earnings._sum.amount || 0
    const totalWithdrawals = withdrawals._sum.amount || 0
    const balance = totalEarnings - totalWithdrawals

    // Get pending transactions
    const pendingTransactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    })

    return {
      balance,
      totalEarnings,
      totalWithdrawals,
      pendingTransactions,
    }
  }

  async getTransactionHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit

    const transactions = await this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    })

    const total = await this.prisma.transaction.count({
      where: { userId },
    })

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async createWithdrawal(userId: string, withdrawDto: WithdrawDto) {
    const { amount, method, accountDetails } = withdrawDto

    // Check user balance
    const wallet = await this.getUserWallet(userId)

    if (wallet.balance < amount) {
      throw new BadRequestException("Insufficient balance")
    }

    // Minimum withdrawal amount
    if (amount < 10) {
      throw new BadRequestException("Minimum withdrawal amount is $10")
    }

    // Create withdrawal transaction
    const transaction = await this.prisma.transaction.create({
      data: {
        userId,
        type: "WITHDRAWAL",
        amount,
        description: `Withdrawal via ${method}`,
        status: "PENDING",
        metadata: {
          method,
          accountDetails,
        },
      },
    })

    return transaction
  }

  async addEarning(userId: string, amount: number, description: string, metadata?: any) {
    return this.prisma.transaction.create({
      data: {
        userId,
        type: "EARNING",
        amount,
        description,
        status: "COMPLETED",
        metadata,
      },
    })
  }

  async processVideoEarning(videoId: string, amount: number) {
    const video = await this.prisma.video.findUnique({
      where: { id: videoId },
      include: { user: true },
    })

    if (!video) {
      throw new NotFoundException("Video not found")
    }

    return this.addEarning(
      video.userId,
      amount,
      `Earnings from video: ${video.title}`,
      { videoId, videoTitle: video.title },
    )
  }

  async getEarningsAnalytics(userId: string, days = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const dailyEarnings = await this.prisma.transaction.groupBy({
      by: ["createdAt"],
      where: {
        userId,
        type: "EARNING",
        status: "COMPLETED",
        createdAt: { gte: startDate },
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    // Group by date
    const earningsByDate = dailyEarnings.reduce((acc, earning) => {
      const date = earning.createdAt.toISOString().split("T")[0]
      acc[date] = (acc[date] || 0) + (earning._sum.amount || 0)
      return acc
    }, {} as Record<string, number>)

    return {
      dailyEarnings: earningsByDate,
      totalEarnings: Object.values(earningsByDate).reduce((sum, amount) => sum + amount, 0),
      period: days,
    }
  }

  async getTopEarners(limit = 10) {
    const topEarners = await this.prisma.transaction.groupBy({
      by: ["userId"],
      where: {
        type: "EARNING",
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
      orderBy: {
        _sum: {
          amount: "desc",
        },
      },
      take: limit,
    })

    // Get user details
    const userIds = topEarners.map((earner) => earner.userId)
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        isVerified: true,
      },
    })

    return topEarners.map((earner) => {
      const user = users.find((u) => u.id === earner.userId)
      return {
        user,
        totalEarnings: earner._sum.amount || 0,
      }
    })
  }
}
