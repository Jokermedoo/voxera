"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Mic, Users, Trophy, Clock } from "lucide-react"

interface DashboardStatsProps {
  userId: string
}

export function DashboardStats({ userId }: DashboardStatsProps) {
  // Mock stats - in real app, fetch from database
  const stats = [
    {
      title: "الغرف المستضافة",
      value: "12",
      change: "+3 هذا الأسبوع",
      icon: Mic,
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "المشاركات",
      value: "48",
      change: "+8 هذا الأسبوع",
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "النقاط",
      value: "1,240",
      change: "+120 هذا الأسبوع",
      icon: Trophy,
      color: "from-yellow-500 to-yellow-600",
    },
    {
      title: "ساعات الاستماع",
      value: "24",
      change: "+6 هذا الأسبوع",
      icon: Clock,
      color: "from-green-500 to-green-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                <p className="text-green-400 text-xs mt-1">{stat.change}</p>
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
