"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Users,
  Settings,
  MessageSquare,
  Music,
  Radio,
  LogOut,
  Wifi,
  WifiOff,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useRealtimeRoom } from "@/hooks/use-realtime-room"
import { LiveChat } from "./live-chat"
import { ParticipantStatus } from "./participant-status"
import { HostControlsPanel } from "./host-controls-panel"
import { ModerationTools } from "./moderation-tools"
import { GiftsPanel } from "../interactive/gifts-panel"
import { SoundEffects } from "../interactive/sound-effects"
import { LivePolls } from "../interactive/live-polls"
import { Leaderboard } from "../interactive/leaderboard"

interface Room {
  id: string
  title: string
  description: string
  room_type: "public" | "private"
  audio_mode: "conversation" | "music" | "podcast" | "broadcast"
  max_participants: number
  host_id: string
  is_active: boolean
  profiles: {
    username: string
    display_name: string
    avatar_url: string | null
    is_verified: boolean
  }
}

interface Participant {
  id: string
  user_id: string
  role: "host" | "co-host" | "speaker" | "listener"
  is_muted: boolean
  is_speaking: boolean
  joined_at: string
  profiles: {
    username: string
    display_name: string
    avatar_url: string | null
    is_verified: boolean
  }
}

interface RoomInterfaceProps {
  room: Room
  participants: Participant[]
  currentUser: any
  isParticipant: boolean
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

export function RoomInterface({
  room,
  participants: initialParticipants,
  currentUser,
  isParticipant,
}: RoomInterfaceProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [isDeafened, setIsDeafened] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [roomData, setRoomData] = useState(room)
  const router = useRouter()

  const { participants, chatMessages, isConnected, updateParticipantStatus, sendChatMessage } = useRealtimeRoom(
    room.id,
    initialParticipants,
  )

  const IconComponent = audioModeIcons[room.audio_mode]
  const isHost = room.host_id === currentUser?.id
  const currentParticipant = participants.find((p) => p.user_id === currentUser?.id)
  const isCoHost = currentParticipant?.role === "co-host"
  const canPlaySounds = isHost || isCoHost || currentParticipant?.role === "speaker"
  const canCreatePolls = isHost || isCoHost

  const handleJoinRoom = async () => {
    setIsJoining(true)
    try {
      const supabase = createClient()
      await supabase.from("room_participants").insert({
        room_id: room.id,
        user_id: currentUser.id,
        role: "listener",
      })
      window.location.reload()
    } catch (error) {
      console.error("Error joining room:", error)
    } finally {
      setIsJoining(false)
    }
  }

  const handleLeaveRoom = async () => {
    try {
      const supabase = createClient()
      await supabase.from("room_participants").delete().eq("room_id", room.id).eq("user_id", currentUser.id)
      router.push("/rooms")
    } catch (error) {
      console.error("Error leaving room:", error)
    }
  }

  const handleToggleMute = async () => {
    const newMutedState = !isMuted
    setIsMuted(newMutedState)

    if (currentParticipant) {
      await updateParticipantStatus(currentParticipant.id, { is_muted: newMutedState })
    }
  }

  const handleToggleDeafen = () => {
    setIsDeafened(!isDeafened)
  }

  const handleUpdateRoom = (updates: Partial<Room>) => {
    setRoomData({ ...roomData, ...updates })
  }

  const handleUpdateParticipant = (participantId: string, updates: Partial<Participant>) => {
    // This will be handled by the realtime hook
    updateParticipantStatus(participantId, updates)
  }

  const handleRemoveParticipant = (participantId: string) => {
    // Participant removal will be handled by realtime updates
  }

  if (!isParticipant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="bg-purple-500/20 p-4 rounded-full w-16 h-16 mx-auto mb-6 flex items-center justify-center">
              <IconComponent className="h-8 w-8 text-purple-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{roomData.title}</h1>
            {roomData.description && <p className="text-purple-200 mb-4">{roomData.description}</p>}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Badge className="bg-purple-500/20 text-purple-300">{audioModeLabels[roomData.audio_mode]}</Badge>
              <div className="flex items-center gap-1 text-purple-200 text-sm">
                <Users className="h-4 w-4" />
                <span>
                  {participants.length}/{roomData.max_participants}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-6 justify-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={roomData.profiles.avatar_url || undefined} />
                <AvatarFallback className="bg-purple-500 text-white">
                  {roomData.profiles.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-white font-medium">{roomData.profiles.display_name}</p>
                <p className="text-purple-200 text-sm">مضيف الغرفة</p>
              </div>
            </div>
            <Button
              onClick={handleJoinRoom}
              disabled={isJoining}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3"
            >
              {isJoining ? "جاري الانضمام..." : "انضم إلى الغرفة"}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <IconComponent className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{roomData.title}</h1>
                <div className="flex items-center gap-3">
                  <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                    {audioModeLabels[roomData.audio_mode]}
                  </Badge>
                  <span className="text-purple-200 text-sm">
                    {participants.length}/{roomData.max_participants} مشارك
                  </span>
                  <div className="flex items-center gap-1">
                    {isConnected ? (
                      <Wifi className="h-4 w-4 text-green-400" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-400" />
                    )}
                    <span className="text-xs text-gray-400">{isConnected ? "متصل" : "غير متصل"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SoundEffects roomId={room.id} canPlaySounds={canPlaySounds} />
              <LivePolls roomId={room.id} currentUserId={currentUser?.id} canCreatePolls={canCreatePolls} />
              {(isHost || isCoHost) && <ModerationTools roomId={room.id} isHost={isHost} isCoHost={isCoHost} />}
              {isHost && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  إعدادات
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleLeaveRoom}
                className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                مغادرة
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Participants Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  المشاركون ({participants.length})
                </h3>
                <div className="space-y-2">
                  {participants.map((participant) => (
                    <ParticipantStatus
                      key={participant.id}
                      participant={participant}
                      isCurrentUser={participant.user_id === currentUser?.id}
                      showControls={isHost && participant.user_id !== currentUser?.id}
                      onToggleMute={handleUpdateParticipant}
                      onChangeRole={handleUpdateParticipant}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {isHost && (
              <HostControlsPanel
                room={roomData}
                participants={participants}
                onUpdateRoom={handleUpdateRoom}
                onUpdateParticipant={handleUpdateParticipant}
                onRemoveParticipant={handleRemoveParticipant}
              />
            )}
          </div>

          {/* Main Stage */}
          <div className="lg:col-span-3">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 h-96">
              <CardContent className="p-8 h-full flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                  <div className="bg-purple-500/20 p-6 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                    <IconComponent className="h-12 w-12 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">منطقة الصوت الرئيسية</h2>
                  <p className="text-purple-200">
                    {roomData.audio_mode === "conversation" && "شارك في المحادثة واستمع للآخرين"}
                    {roomData.audio_mode === "music" && "استمتع بالعروض الموسيقية المباشرة"}
                    {roomData.audio_mode === "podcast" && "استمع إلى المحتوى المسموع عالي الجودة"}
                    {roomData.audio_mode === "broadcast" && "تابع البث المباشر"}
                  </p>
                </div>

                {/* Audio Controls */}
                <div className="flex items-center gap-4">
                  <Button
                    variant={isMuted ? "default" : "outline"}
                    size="lg"
                    onClick={handleToggleMute}
                    className={
                      isMuted
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "border-white/30 text-white hover:bg-white/10"
                    }
                  >
                    {isMuted ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
                    {isMuted ? "إلغاء كتم الصوت" : "كتم الصوت"}
                  </Button>

                  <Button
                    variant={isDeafened ? "default" : "outline"}
                    size="lg"
                    onClick={handleToggleDeafen}
                    className={
                      isDeafened
                        ? "bg-orange-600 hover:bg-orange-700 text-white"
                        : "border-white/30 text-white hover:bg-white/10"
                    }
                  >
                    {isDeafened ? <VolumeX className="h-5 w-5 mr-2" /> : <Volume2 className="h-5 w-5 mr-2" />}
                    {isDeafened ? "تشغيل الصوت" : "إيقاف الصوت"}
                  </Button>

                  <GiftsPanel roomId={room.id} participants={participants} currentUserId={currentUser?.id} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <LiveChat messages={chatMessages} onSendMessage={sendChatMessage} currentUserId={currentUser?.id || ""} />
      <Leaderboard roomId={room.id} />
    </div>
  )
}
