"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Mic, Music, Radio, MessageSquare, Lock } from "lucide-react"
import Link from "next/link"

interface Room {
  id: string
  title: string
  description: string
  room_type: "public" | "private"
  audio_mode: "conversation" | "music" | "podcast" | "broadcast"
  max_participants: number
  background_image: string | null
  created_at: string
  profiles: {
    username: string
    display_name: string
    avatar_url: string | null
  }
  room_participants: { count: number }[]
}

interface RoomsGridProps {
  rooms: Room[]
}

const audioModeIcons = {
  conversation: MessageSquare,
  music: Music,
  podcast: Radio,
  broadcast: Mic,
}

const audioModeLabels = {
  conversation: "محادثة",
  music: "موسيقى",
  podcast: "بودكاست",
  broadcast: "بث مباشر",
}

const audioModeColors = {
  conversation: "bg-blue-500/20 text-blue-400",
  music: "bg-purple-500/20 text-purple-400",
  podcast: "bg-green-500/20 text-green-400",
  broadcast: "bg-red-500/20 text-red-400",
}

export function RoomsGrid({ rooms }: RoomsGridProps) {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-white/5 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <Mic className="h-12 w-12 text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">لا توجد غرف نشطة حالياً</h3>
        <p className="text-purple-200 mb-6">كن أول من ينشئ غرفة وابدأ المحادثة</p>
      </div>
    )
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {rooms.map((room) => {
        const IconComponent = audioModeIcons[room.audio_mode]
        const participantCount = room.room_participants.length

        return (
          <Card key={room.id} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${audioModeColors[room.audio_mode]}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    {audioModeLabels[room.audio_mode]}
                  </Badge>
                </div>
                {room.room_type === "private" && <Lock className="h-4 w-4 text-yellow-400" />}
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">{room.title}</h3>
              {room.description && <p className="text-purple-200 text-sm mb-4 line-clamp-2">{room.description}</p>}

              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={room.profiles.avatar_url || undefined} />
                  <AvatarFallback className="bg-purple-500 text-white text-xs">
                    {room.profiles.display_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-white text-sm font-medium">{room.profiles.display_name}</p>
                  <p className="text-purple-200 text-xs">@{room.profiles.username}</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-purple-200 text-sm">
                  <Users className="h-4 w-4" />
                  <span>
                    {participantCount}/{room.max_participants}
                  </span>
                </div>
                <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Link href={`/rooms/${room.id}`}>انضم</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
