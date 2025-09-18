"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Hash } from "lucide-react"

export function TrendingTopics() {
  const trendingTopics = [
    { name: "الذكاء الاصطناعي", posts: 234, trend: "up", growth: "+15%" },
    { name: "ريادة الأعمال", posts: 189, trend: "up", growth: "+8%" },
    { name: "الشعر العربي", posts: 156, trend: "stable", growth: "0%" },
    { name: "التكنولوجيا", posts: 143, trend: "up", growth: "+12%" },
    { name: "البرمجة", posts: 87, trend: "up", growth: "+20%" },
    { name: "الموسيقى العربية", posts: 76, trend: "down", growth: "-3%" },
  ]

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up":
        return "text-green-400"
      case "down":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getTrendIcon = (trend: string) => {
    return <TrendingUp className={`w-4 h-4 ${getTrendColor(trend)}`} />
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Hash className="w-5 h-5 ml-2" />
          المواضيع الرائجة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trendingTopics.map((topic, index) => (
          <div
            key={topic.name}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2 space-x-reverse mb-1">
                <span className="text-gray-400 text-sm">#{index + 1}</span>
                <h4 className="text-white font-medium">#{topic.name}</h4>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <p className="text-gray-400 text-xs">{topic.posts} منشور</p>
                <span className={`text-xs ${getTrendColor(topic.trend)}`}>{topic.growth}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              {getTrendIcon(topic.trend)}
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">رائج</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
