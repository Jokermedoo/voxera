"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, MicOff, Crown, Shield, Users } from "lucide-react"

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

interface ParticipantStatusProps {
  participant: Participant
  isCurrentUser?: boolean
  showControls?: boolean
  onToggleMute?: (participantId: string) => void
  onChangeRole?: (participantId: string, newRole: string) => void
}

const roleIcons = {
  host: Crown,
  "co-host": Shield,
  speaker: Mic,
  listener: Users,
}

const roleLabels = {
  host: "مضيف",
  "co-host": "مضيف مساعد",
  speaker: "متحدث",
  listener: "مستمع",
}

const roleColors = {
  host: "bg-yellow-500/20 text-yellow-400",
  "co-host": "bg-blue-500/20 text-blue-400",
  speaker: "bg-green-500/20 text-green-400",
  listener: "bg-gray-500/20 text-gray-400",
}

export function ParticipantStatus({
  participant,
  isCurrentUser = false,
  showControls = false,
  onToggleMute,
  onChangeRole,
}: ParticipantStatusProps) {
  const RoleIcon = roleIcons[participant.role]

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarImage src={participant.profiles.avatar_url || undefined} />
          <AvatarFallback className="bg-purple-500 text-white">
            {participant.profiles.display_name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Speaking indicator */}
        {participant.is_speaking && (
          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 animate-pulse">
            <Mic className="h-3 w-3 text-white" />
          </div>
        )}

        {/* Muted indicator */}
        {participant.is_muted && (
          <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
            <MicOff className="h-3 w-3 text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-white font-medium truncate">
            {participant.profiles.display_name}
            {isCurrentUser && <span className="text-purple-400 text-sm mr-1">(أنت)</span>}
          </p>
          {participant.profiles.is_verified && (
            <div className="bg-blue-500 rounded-full p-0.5">
              <Shield className="h-3 w-3 text-white" />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${roleColors[participant.role]}`}>
            <RoleIcon className="h-3 w-3 mr-1" />
            {roleLabels[participant.role]}
          </Badge>
          <span className="text-gray-400 text-xs">@{participant.profiles.username}</span>
        </div>

        {/* Audio status indicators */}
        <div className="flex items-center gap-2 mt-2">
          <div
            className={`flex items-center gap-1 text-xs ${participant.is_muted ? "text-red-400" : "text-green-400"}`}
          >
            {participant.is_muted ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
            <span>{participant.is_muted ? "مكتوم" : "نشط"}</span>
          </div>
        </div>
      </div>

      {/* Host controls */}
      {showControls && (
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onToggleMute?.(participant.id)}
            className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-white"
          >
            {participant.is_muted ? "إلغاء الكتم" : "كتم"}
          </button>
          {participant.role !== "host" && (
            <select
              value={participant.role}
              onChange={(e) => onChangeRole?.(participant.id, e.target.value)}
              className="text-xs px-1 py-1 rounded bg-gray-700 text-white border-none"
            >
              <option value="listener">مستمع</option>
              <option value="speaker">متحدث</option>
              <option value="co-host">مضيف مساعد</option>
            </select>
          )}
        </div>
      )}
    </div>
  )
}
