"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Play } from "lucide-react"
import Link from "next/link"

export function ActiveRooms() {
  // Mock active rooms data
  const activeRooms = [
    {
      id: 1,
      title: "نقاش تقني مساء",
      host: "أحمد محمد",
      participants: 23,
      mode: "discussion",
      topic: "الذكاء الاصطناعي",
      avatar: "/placeholder.svg",
    },
    {
      id: 2,
      title: "أمسية شعرية",
      host: "فاطمة علي",
      participants: 45,
      mode: "entertainment",
      topic: "الشعر العربي",
      avatar: "/placeholder.svg",
    },
    {
      id: 3,
      title: "بودكاست الأعمال",
      host: "محمد سالم",
      participants: 67,
      mode: "podcast",
      topic: "ريادة الأعمال",
      avatar: "/placeholder.svg",
    },
  ]

  const getModeColor = (mode: string) => {
    const colors = {
      discussion: "bg-blue-500",
      entertainment: "bg-purple-500",
      podcast: "bg-green-500",
      music: "bg-yellow-500",
    }
    return colors[mode as keyof typeof colors] || "bg-gray-500"
  }

  const getModeLabel = (mode: string) => {
    const labels = {
      discussion: "نقاش",
      entertainment: "ترفيه",
      podcast: "بودكاست",
      music: "موسيقى",
    }
    return labels[mode as keyof typeof labels] || mode
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">الغرف النشطة</CardTitle>
        <Link href="/rooms">
          <Button variant="ghost" className="text-purple-300 hover:text-purple-200">
            عرض الكل
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeRooms.map((room) => (
          <div
            key={room.id}
            className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center space-x-4 space-x-reverse">
              <Avatar className="w-12 h-12">
                <AvatarImage src={room.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                  {room.host.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-medium">{room.title}</h4>
                  <Badge className={`${getModeColor(room.mode)} text-white border-0 text-xs`}>
                    {getModeLabel(room.mode)}
                  </Badge>
                </div>
                <p className="text-gray-300 text-sm">مع {room.host}</p>
                <p className="text-gray-400 text-xs">{room.topic}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="flex items-center text-gray-300 text-sm">
                <Users className="w-4 h-4 ml-1" />
                <span>{room.participants}</span>
              </div>

              <Link href={`/rooms/${room.id}`}>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Play className="w-4 h-4 ml-2" />
                  انضم
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
