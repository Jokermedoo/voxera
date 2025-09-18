"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mic, Users, Trophy, Star } from "lucide-react"

interface ProfileStatsProps {
  profile: any
}

export function ProfileStats({ profile }: ProfileStatsProps) {
  const stats = [
    {
      icon: Mic,
      label: "الغرف المستضافة",
      value: "24",
      color: "bg-purple-500",
    },
    {
      icon: Users,
      label: "المشاركات",
      value: "156",
      color: "bg-blue-500",
    },
    {
      icon: Trophy,
      label: "النقاط",
      value: "2,340",
      color: "bg-yellow-500",
    },
    {
      icon: Star,
      label: "التقييم",
      value: "4.8",
      color: "bg-green-500",
    },
  ]

  const achievements = [
    { name: "مضيف محترف", description: "استضاف أكثر من 20 غرفة", color: "bg-purple-500" },
    { name: "نجم الصوت", description: "حصل على أكثر من 100 إعجاب", color: "bg-blue-500" },
    { name: "متحدث نشط", description: "شارك في أكثر من 50 غرفة", color: "bg-green-500" },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-right">الإحصائيات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-300">{stat.label}</span>
              </div>
              <span className="text-white font-bold">{stat.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-right">الإنجازات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full ${achievement.color} mt-2 flex-shrink-0`} />
              <div>
                <h4 className="text-white font-medium">{achievement.name}</h4>
                <p className="text-gray-400 text-sm">{achievement.description}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
