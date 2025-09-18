"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mic, Users, Clock, Play } from "lucide-react"

interface ProfileRoomsProps {
  userId: string
}

export function ProfileRooms({ userId }: ProfileRoomsProps) {
  // Mock rooms data - in real app, fetch from database
  const hostedRooms = [
    {
      id: 1,
      title: "نقاش تقني يومي",
      description: "مناقشة أحدث التطورات في عالم التكنولوجيا",
      participants: 23,
      status: "live",
      created_at: "2024-01-15T10:30:00Z",
      mode: "discussion",
    },
    {
      id: 2,
      title: "أمسية شعرية",
      description: "قراءات شعرية من الأدب العربي الحديث",
      participants: 45,
      status: "ended",
      created_at: "2024-01-14T20:00:00Z",
      mode: "entertainment",
    },
  ]

  const getModeLabel = (mode: string) => {
    const modes = {
      discussion: "نقاش",
      music: "موسيقى",
      podcast: "بودكاست",
      entertainment: "ترفيه",
    }
    return modes[mode as keyof typeof modes] || mode
  }

  const getStatusColor = (status: string) => {
    return status === "live" ? "bg-green-500" : "bg-gray-500"
  }

  const getStatusLabel = (status: string) => {
    return status === "live" ? "مباشر" : "انتهت"
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-right">الغرف المستضافة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hostedRooms.map((room) => (
          <div key={room.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-white font-medium">{room.title}</h4>
                  <Badge variant="secondary" className={`${getStatusColor(room.status)} text-white border-0`}>
                    {getStatusLabel(room.status)}
                  </Badge>
                </div>
                <p className="text-gray-300 text-sm mb-2">{room.description}</p>
              </div>

              {room.status === "live" && (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  <Play className="w-4 h-4 ml-2" />
                  انضم
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{room.participants} مشارك</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mic className="w-4 h-4" />
                  <span>{getModeLabel(room.mode)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(room.created_at).toLocaleDateString("ar-SA")}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
