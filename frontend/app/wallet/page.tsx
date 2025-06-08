"use client"

import { useState } from "react"
import { Wallet, CreditCard, DollarSign, TrendingUp, ArrowUpRight, ArrowDownLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const mockTransactions = [
  {
    id: 1,
    type: "earning",
    description: "Video monetization - 'Startup Guide'",
    amount: 25.5,
    date: "2024-01-15",
    status: "completed",
  },
  {
    id: 2,
    type: "withdrawal",
    description: "Bank transfer to ****1234",
    amount: -100.0,
    date: "2024-01-14",
    status: "completed",
  },
  {
    id: 3,
    type: "earning",
    description: "Tips from followers",
    amount: 15.75,
    date: "2024-01-13",
    status: "completed",
  },
  {
    id: 4,
    type: "earning",
    description: "Premium content purchase",
    amount: 9.99,
    date: "2024-01-12",
    status: "pending",
  },
]

export default function WalletPage() {
  const [balance] = useState(245.67)
  const [withdrawAmount, setWithdrawAmount] = useState("")

  return (
    <div className="p-4 pb-20 md:pb-4 max-w-4xl mx-auto">
      <div className="flex items-center space-x-3 mb-8">
        <Wallet size={32} className="text-primary" />
        <h1 className="text-3xl font-bold">Wallet</h1>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${balance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Available for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$89.24</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$9.99</div>
            <p className="text-xs text-muted-foreground">Processing payment</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-full ${
                          transaction.type === "earning" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}
                      >
                        {transaction.type === "earning" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${transaction.type === "earning" ? "text-green-600" : "text-red-600"}`}>
                        {transaction.type === "earning" ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                      <p
                        className={`text-xs ${
                          transaction.status === "completed" ? "text-green-600" : "text-yellow-600"
                        }`}
                      >
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw Funds</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount to withdraw</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">Available balance: ${balance.toFixed(2)}</p>
              </div>

              <div>
                <Label>Withdrawal method</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Card className="cursor-pointer hover:bg-accent">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <CreditCard size={24} />
                        <div>
                          <p className="font-medium">Bank Transfer</p>
                          <p className="text-sm text-muted-foreground">2-3 business days</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:bg-accent">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <Wallet size={24} />
                        <div>
                          <p className="font-medium">Digital Wallet</p>
                          <p className="text-sm text-muted-foreground">Instant transfer</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!withdrawAmount || Number.parseFloat(withdrawAmount) > balance}
              >
                Withdraw ${withdrawAmount || "0.00"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
