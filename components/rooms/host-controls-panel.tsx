"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Settings, Crown, Mic, MicOff, UserX, Lock, Unlock, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Room {
  id: string
  title: string
  description: string
  room_type: "public" | "private"
  audio_mode: "conversation" | "music" | "podcast" | "broadcast"
  max_participants: number
  is_active: boolean
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

interface HostControlsPanelProps {
  room: Room
  participants: Participant[]
  onUpdateRoom: (updates: Partial<Room>) => void
  onUpdateParticipant: (participantId: string, updates: Partial<Participant>) => void
  onRemoveParticipant: (participantId: string) => void
}

export function HostControlsPanel({
  room,
  participants,
  onUpdateRoom,
  onUpdateParticipant,
  onRemoveParticipant,
}: HostControlsPanelProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [roomSettings, setRoomSettings] = useState({
    title: room.title,
    description: room.description,
    maxParticipants: room.max_participants.toString(),
    roomType: room.room_type,
    audioMode: room.audio_mode,
  })

  const handleUpdateRoomSettings = async () => {
    setIsLoading(true)
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase
        .from("rooms")
        .update({
          title: roomSettings.title,
          description: roomSettings.description || null,
          max_participants: Number.parseInt(roomSettings.maxParticipants),
          room_type: roomSettings.roomType,
          audio_mode: roomSettings.audioMode,
        })
        .eq("id", room.id)

      if (error) throw error

      onUpdateRoom({
        title: roomSettings.title,
        description: roomSettings.description,
        max_participants: Number.parseInt(roomSettings.maxParticipants),
        room_type: roomSettings.roomType as any,
        audio_mode: roomSettings.audioMode as any,
      })

      setIsSettingsOpen(false)
    } catch (error) {
      console.error("Error updating room settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleRoomLock = async () => {
    const newType = room.room_type === "public" ? "private" : "public"
    try {
      const supabase = createClient()
      const { error } = await supabase.from("rooms").update({ room_type: newType }).eq("id", room.id)

      if (error) throw error
      onUpdateRoom({ room_type: newType })
    } catch (error) {
      console.error("Error toggling room lock:", error)
    }
  }

  const handleMuteAll = async () => {
    try {
      const supabase = createClient()
      const participantIds = participants.filter((p) => p.role !== "host").map((p) => p.id)

      const { error } = await supabase.from("room_participants").update({ is_muted: true }).in("id", participantIds)

      if (error) throw error

      // Update local state
      participants.forEach((p) => {
        if (p.role !== "host") {
          onUpdateParticipant(p.id, { is_muted: true })
        }
      })
    } catch (error) {
      console.error("Error muting all participants:", error)
    }
  }

  const handleUnmuteAll = async () => {
    try {
      const supabase = createClient()
      const participantIds = participants.filter((p) => p.role !== "host").map((p) => p.id)

      const { error } = await supabase.from("room_participants").update({ is_muted: false }).in("id", participantIds)

      if (error) throw error

      // Update local state
      participants.forEach((p) => {
        if (p.role !== "host") {
          onUpdateParticipant(p.id, { is_muted: false })
        }
      })
    } catch (error) {
      console.error("Error unmuting all participants:", error)
    }
  }

  const handlePromoteToCoHost = async (participantId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("room_participants").update({ role: "co-host" }).eq("id", participantId)

      if (error) throw error
      onUpdateParticipant(participantId, { role: "co-host" })
    } catch (error) {
      console.error("Error promoting participant:", error)
    }
  }

  const handleChangeRole = async (participantId: string, newRole: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("room_participants").update({ role: newRole }).eq("id", participantId)

      if (error) throw error
      onUpdateParticipant(participantId, { role: newRole as any })
    } catch (error) {
      console.error("Error changing participant role:", error)
    }
  }

  const handleKickParticipant = async (participantId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("room_participants").delete().eq("id", participantId)

      if (error) throw error
      onRemoveParticipant(participantId)
    } catch (error) {
      console.error("Error kicking participant:", error)
    }
  }

  const handleEndRoom = async () => {
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.from("rooms").update({ is_active: false }).eq("id", room.id)

      if (error) throw error
      window.location.href = "/rooms"
    } catch (error) {
      console.error("Error ending room:", error)
    }
  }

  const speakerCount = participants.filter(
    (p) => p.role === "speaker" || p.role === "co-host" || p.role === "host",
  ).length
  const listenerCount = participants.filter((p) => p.role === "listener").length
  const mutedCount = participants.filter((p) => p.is_muted).length

  return (
    <Card className="bg-white/10 backdrop-blur-lg border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-400" />
          لوحة تحكم المضيف
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Room Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-white">{participants.length}</div>
            <div className="text-xs text-purple-200">إجمالي المشاركين</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">{speakerCount}</div>
            <div className="text-xs text-purple-200">متحدثون</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-400">{listenerCount}</div>
            <div className="text-xs text-purple-200">مستمعون</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-400">{mutedCount}</div>
            <div className="text-xs text-purple-200">مكتومون</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h4 className="text-white font-medium">إجراءات سريعة</h4>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleRoomLock}
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              {room.room_type === "public" ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
              {room.room_type === "public" ? "قفل الغرفة" : "فتح الغرفة"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleMuteAll}
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <MicOff className="h-4 w-4 mr-2" />
              كتم الجميع
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleUnmuteAll}
              className="border-white/30 text-white hover:bg-white/10 bg-transparent"
            >
              <Mic className="h-4 w-4 mr-2" />
              إلغاء كتم الجميع
            </Button>

            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  إعدادات الغرفة
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
                <DialogHeader>
                  <DialogTitle>إعدادات الغرفة</DialogTitle>
                  <DialogDescription className="text-gray-400">تعديل إعدادات الغرفة الحالية</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">عنوان الغرفة</Label>
                    <Input
                      id="title"
                      value={roomSettings.title}
                      onChange={(e) => setRoomSettings({ ...roomSettings, title: e.target.value })}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">الوصف</Label>
                    <Textarea
                      id="description"
                      value={roomSettings.description}
                      onChange={(e) => setRoomSettings({ ...roomSettings, description: e.target.value })}
                      className="bg-gray-800 border-gray-600 text-white"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">الحد الأقصى للمشاركين</Label>
                    <Select
                      value={roomSettings.maxParticipants}
                      onValueChange={(value) => setRoomSettings({ ...roomSettings, maxParticipants: value })}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="10">10 مشاركين</SelectItem>
                        <SelectItem value="25">25 مشارك</SelectItem>
                        <SelectItem value="50">50 مشارك</SelectItem>
                        <SelectItem value="100">100 مشارك</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleUpdateRoomSettings}
                    disabled={isLoading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Participant Management */}
        <div className="space-y-3">
          <h4 className="text-white font-medium">إدارة المشاركين</h4>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {participants
              .filter((p) => p.role !== "host")
              .map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="text-white text-sm font-medium truncate max-w-24">
                      {participant.profiles.display_name}
                    </div>
                    <Badge
                      className={`text-xs ${
                        participant.role === "co-host"
                          ? "bg-blue-500/20 text-blue-400"
                          : participant.role === "speaker"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {participant.role === "co-host" ? "مساعد" : participant.role === "speaker" ? "متحدث" : "مستمع"}
                    </Badge>
                    {participant.is_muted && <MicOff className="h-3 w-3 text-red-400" />}
                  </div>

                  <div className="flex items-center gap-1">
                    <Select value={participant.role} onValueChange={(value) => handleChangeRole(participant.id, value)}>
                      <SelectTrigger className="h-8 w-20 text-xs bg-gray-800 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-600">
                        <SelectItem value="listener">مستمع</SelectItem>
                        <SelectItem value="speaker">متحدث</SelectItem>
                        <SelectItem value="co-host">مساعد</SelectItem>
                      </SelectContent>
                    </Select>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:bg-red-500/20">
                          <UserX className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-900 border-gray-700">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-white">طرد المشارك</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            هل أنت متأكد من طرد {participant.profiles.display_name} من الغرفة؟
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-800 text-white border-gray-600">
                            إلغاء
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleKickParticipant(participant.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            طرد
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <h4 className="text-red-400 font-medium">منطقة الخطر</h4>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                إنهاء الغرفة
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">إنهاء الغرفة</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400">
                  هل أنت متأكد من إنهاء هذه الغرفة؟ سيتم طرد جميع المشاركين ولن يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-gray-800 text-white border-gray-600">إلغاء</AlertDialogCancel>
                <AlertDialogAction onClick={handleEndRoom} className="bg-red-600 hover:bg-red-700">
                  إنهاء الغرفة
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )
}
