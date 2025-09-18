"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

export function TrendingTopics() {
  const trendingTopics = [
    { name: "الذكاء الاصطناعي", posts: 234, trend: "up" },
    { name: "ريادة الأعمال", posts: 189, trend: "up" },
    { name: "الشعر العربي", posts: 156, trend: "stable" },
    { name: "التكنولوجيا", posts: 143, trend: "up" },
    { name: "الموسيقى العربية", posts: 98, trend: "down" },
    { name: "البرمجة", posts: 87, trend: "up" },
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

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <TrendingUp className="w-5 h-5 ml-2" />
          المواضيع الرائجة
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trendingTopics.map((topic, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-2 space-x-reverse">
                <span className="text-gray-400 text-sm">#{index + 1}</span>
                <h4 className="text-white font-medium">{topic.name}</h4>
              </div>
              <p className="text-gray-400 text-xs mt-1">{topic.posts} منشور</p>
            </div>

            <TrendingUp className={`w-4 h-4 ${getTrendColor(topic.trend)}`} />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
