import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common"
import { InjectModel } from "@nestjs/mongoose"
import { Model } from "mongoose"
import type { TransactionDocument } from "../schemas/transaction.schema"
import { Wallet } from "./schemas/wallet.schema"
import { Transaction } from "./schemas/transaction.schema"

@Injectable()
export class WalletService {
  constructor(
    @InjectModel("Wallet") private readonly walletModel: Model<Wallet>,
    @InjectModel("Transaction") private readonly transactionModel: Model<Transaction>,
  ) {}

  async getUserWallet(userId: string) {
    let wallet = await this.walletModel.findOne({ userId })
    if (!wallet) {
      wallet = await this.walletModel.create({
        userId,
        balance: 0,
        totalEarnings: 0,
        totalWithdrawals: 0,
      })
    }
    return wallet
  }

  async getTransactionHistory(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit
    const transactions = await this.transactionModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const total = await this.transactionModel.countDocuments({ userId })

    return {
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async createWithdrawal(userId: string, amount: number) {
    const wallet = await this.getUserWallet(userId)
    if (wallet.balance < amount) {
      throw new Error("Insufficient balance")
    }

    const transaction = await this.transactionModel.create({
      userId,
      type: "WITHDRAWAL",
      amount,
      status: "PENDING",
    })

    await this.walletModel.findByIdAndUpdate(wallet._id, {
      $inc: { balance: -amount },
    })

    return transaction
  }

  async addEarning(userId: string, amount: number, description: string, metadata?: any) {
    return this.transactionModel.create({
      userId,
      type: "EARNING",
      amount,
      description,
      status: "COMPLETED",
      metadata,
    })
  }

  async processVideoEarning(videoId: string, amount: number) {
    return this.addEarning(
      "someUserId", // Replace with actual userId if available
      amount,
      `Earnings from video: ${videoId}`,
      { videoId }
    )
  }

  async getEarningsAnalytics(userId: string, days: number = 30) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const transactions = await this.transactionModel.find({
      userId,
      type: "EARNING",
      createdAt: { $gte: startDate },
    })

    const earningsByDate = {}
    transactions.forEach((transaction) => {
      const date = transaction.createdAt.toISOString().split("T")[0]
      earningsByDate[date] = (earningsByDate[date] || 0) + transaction.amount
    })

    const totalEarnings = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)

    const topEarners = await this.transactionModel.aggregate([
      {
        $match: {
          type: "EARNING",
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$userId",
          totalEarnings: { $sum: "$amount" },
        },
      },
      {
        $sort: { totalEarnings: -1 },
      },
      {
        $limit: 10,
      },
    ])

    return {
      earningsByDate,
      totalEarnings,
      topEarners,
    }
  }

  async getTopEarners(limit = 10) {
    const topEarners = await this.transactionModel.aggregate([
      {
        $match: {
          type: "EARNING",
          status: "COMPLETED",
        },
      },
      {
        $group: {
          _id: "$userId",
          totalEarnings: { $sum: "$amount" },
        },
      },
      {
        $sort: { totalEarnings: -1 },
      },
      {
        $limit: limit,
      },
    ])

    const userIds = topEarners.map((earner) => earner._id)
    const users = await this.walletModel.find({ _id: { $in: userIds } })
    return topEarners.map((earner) => {
      const user = users.find((u) => String(u._id) === String(earner._id))
      return {
        user,
        totalEarnings: earner.totalEarnings || 0,
      }
    })
  }
}
