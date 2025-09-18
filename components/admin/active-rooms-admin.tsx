"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, Users, Eye, AlertTriangle, Ban } from "lucide-react"

export function ActiveRoomsAdmin() {
  const activeRooms = [
    {
      id: 1,
      title: "نقاش تقني مساء",
      host: "أحمد محمد",
      participants: 23,
      mode: "discussion",
      status: "active",
      reports: 0,
      duration: "45 دقيقة",
    },
    {
      id: 2,
      title: "أمسية شعرية",
      host: "فاطمة علي",
      participants: 45,
      mode: "entertainment",
      status: "active",
      reports: 2,
      duration: "1 ساعة 20 دقيقة",
    },
    {
      id: 3,
      title: "بودكاست الأعمال",
      host: "محمد سالم",
      participants: 67,
      mode: "podcast",
      status: "flagged",
      reports: 5,
      duration: "2 ساعة 15 دقيقة",
    },
  ]

  const getStatusColor = (status: string, reports: number) => {
    if (status === "flagged" || reports > 3) {
      return "bg-red-500/20 text-red-400 border-red-500/30"
    }
    if (reports > 0) {
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    }
    return "bg-green-500/20 text-green-400 border-green-500/30"
  }

  const getStatusLabel = (status: string, reports: number) => {
    if (status === "flagged" || reports > 3) return "مبلغ عنها"
    if (reports > 0) return "تحت المراقبة"
    return "نشطة"
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
        <CardTitle className="text-white flex items-center">
          <Mic className="w-5 h-5 ml-2" />
          الغرف النشطة
        </CardTitle>
        <Button variant="ghost" className="text-purple-300 hover:text-purple-200">
          إدارة الغرف
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeRooms.map((room) => (
          <div key={room.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center space-x-2 space-x-reverse mb-2">
                  <h4 className="text-white font-medium">{room.title}</h4>
                  <Badge className={getStatusColor(room.status, room.reports)}>
                    {getStatusLabel(room.status, room.reports)}
                  </Badge>
                  {room.reports > 0 && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">{room.reports} بلاغ</Badge>
                  )}
                </div>
                <p className="text-gray-300 text-sm">مع {room.host}</p>
                <div className="flex items-center space-x-4 space-x-reverse text-xs text-gray-400 mt-1">
                  <span>{getModeLabel(room.mode)}</span>
                  <span>•</span>
                  <span>{room.duration}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <div className="flex items-center text-gray-300 text-sm">
                  <Users className="w-4 h-4 ml-1" />
                  <span>{room.participants}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Avatar className="w-6 h-6">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                    {room.host.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-gray-400 text-xs">{room.host}</span>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                  <Eye className="w-4 h-4" />
                </Button>
                {room.reports > 0 && (
                  <Button size="sm" variant="ghost" className="text-yellow-400 hover:text-yellow-300">
                    <AlertTriangle className="w-4 h-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                  <Ban className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
