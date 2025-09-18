"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Mic, Flag, TrendingUp, AlertTriangle, UserCheck } from "lucide-react"

export function AdminStatsCards() {
  const stats = [
    {
      title: "إجمالي المستخدمين",
      value: "12,345",
      change: "+234 هذا الأسبوع",
      changeType: "positive",
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "الغرف النشطة",
      value: "89",
      change: "+12 منذ الأمس",
      changeType: "positive",
      icon: Mic,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "البلاغات المعلقة",
      value: "23",
      change: "-5 منذ الأمس",
      changeType: "negative",
      icon: Flag,
      color: "from-red-500 to-red-600",
    },
    {
      title: "المستخدمون المحظورون",
      value: "156",
      change: "+8 هذا الأسبوع",
      changeType: "neutral",
      icon: AlertTriangle,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      title: "المستخدمون المتحققون",
      value: "1,234",
      change: "+45 هذا الأسبوع",
      changeType: "positive",
      icon: UserCheck,
      color: "from-green-500 to-green-600",
    },
    {
      title: "معدل النمو",
      value: "12.5%",
      change: "+2.3% من الشهر الماضي",
      changeType: "positive",
      icon: TrendingUp,
      color: "from-indigo-500 to-indigo-600",
    },
  ]

  const getChangeColor = (type: string) => {
    switch (type) {
      case "positive":
        return "text-green-400"
      case "negative":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                <p className={`text-xs mt-1 ${getChangeColor(stat.changeType)}`}>{stat.change}</p>
              </div>
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
