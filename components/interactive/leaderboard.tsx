"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, Star, Crown } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface LeaderboardEntry {
  id: string
  user_id: string
  points: number
  achievements: string[]
  profiles: {
    username: string
    display_name: string
    avatar_url: string | null
    is_verified: boolean
  }
}

interface LeaderboardProps {
  roomId: string
}

const achievementIcons: { [key: string]: any } = {
  first_speaker: Crown,
  gift_giver: Star,
  poll_creator: Award,
  active_participant: Medal,
}

const achievementLabels: { [key: string]: string } = {
  first_speaker: "أول متحدث",
  gift_giver: "معطاء",
  poll_creator: "منشئ استطلاعات",
  active_participant: "مشارك نشط",
}

export function Leaderboard({ roomId }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    loadLeaderboard()
    const interval = setInterval(loadLeaderboard, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [roomId])

  const loadLeaderboard = async () => {
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase
        .from("leaderboards")
        .select(`
          *,
          profiles (username, display_name, avatar_url, is_verified)
        `)
        .eq("room_id", roomId)
        .order("points", { ascending: false })
        .limit(10)

      if (error) throw error
      setLeaderboard(data || [])
      setIsVisible((data || []).length > 0)
    } catch (error) {
      console.error("Error loading leaderboard:", error)
    }
  }

  if (!isVisible || leaderboard.length === 0) {
    return null
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-400" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-orange-400" />
      default:
        return <span className="text-white font-bold">{index + 1}</span>
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return "border-yellow-500/50 bg-yellow-500/10"
      case 1:
        return "border-gray-500/50 bg-gray-500/10"
      case 2:
        return "border-orange-500/50 bg-orange-500/10"
      default:
        return "border-white/20 bg-white/5"
    }
  }

  return (
    <div className="fixed top-20 left-6 z-50 w-80">
      <Card className="bg-gray-900/95 backdrop-blur-lg border-gray-700 shadow-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            لوحة الشرف
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-80 overflow-y-auto">
          {leaderboard.map((entry, index) => (
            <div key={entry.id} className={`p-3 rounded-lg border ${getRankColor(index)} transition-all`}>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">{getRankIcon(index)}</div>

                <Avatar className="h-10 w-10">
                  <AvatarImage src={entry.profiles.avatar_url || undefined} />
                  <AvatarFallback className="bg-purple-500 text-white text-sm">
                    {entry.profiles.display_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium truncate">{entry.profiles.display_name}</p>
                    {entry.profiles.is_verified && (
                      <div className="bg-blue-500 rounded-full p-0.5">
                        <Crown className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-300 text-sm font-medium">{entry.points} نقطة</span>
                    {entry.achievements.length > 0 && (
                      <div className="flex gap-1">
                        {entry.achievements.slice(0, 3).map((achievement, i) => {
                          const IconComponent = achievementIcons[achievement] || Star
                          return (
                            <div
                              key={i}
                              className="bg-purple-500/20 p-1 rounded"
                              title={achievementLabels[achievement]}
                            >
                              <IconComponent className="h-3 w-3 text-purple-400" />
                            </div>
                          )
                        })}
                        {entry.achievements.length > 3 && (
                          <Badge className="bg-purple-500/20 text-purple-300 text-xs px-1 py-0">
                            +{entry.achievements.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
