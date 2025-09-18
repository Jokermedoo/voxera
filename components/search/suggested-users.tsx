"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

interface SuggestedUsersProps {
  userId: string
}

export function SuggestedUsers({ userId }: SuggestedUsersProps) {
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    loadSuggestedUsers()
  }, [userId])

  const loadSuggestedUsers = async () => {
    try {
      // Get users that the current user is not following
      const { data: users } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", userId)
        .not(
          "id",
          "in",
          `(
          SELECT following_id FROM follows WHERE follower_id = '${userId}'
        )`,
        )
        .limit(5)

      setSuggestedUsers(users || [])
    } catch (error) {
      console.error("Error loading suggested users:", error)
    } finally {
      setLoading(false)
    }
  }

  const followUser = async (targetUserId: string) => {
    try {
      const { error } = await supabase.from("follows").insert({
        follower_id: userId,
        following_id: targetUserId,
      })

      if (!error) {
        // Remove user from suggestions
        setSuggestedUsers((prev) => prev.filter((user) => user.id !== targetUserId))
      }
    } catch (error) {
      console.error("Follow error:", error)
    }
  }

  if (loading) {
    return (
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Users className="w-5 h-5 ml-2" />
            مستخدمون مقترحون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 bg-white/20 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                  <div className="h-3 bg-white/20 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Users className="w-5 h-5 ml-2" />
          مستخدمون مقترحون
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestedUsers.length === 0 ? (
          <p className="text-gray-400 text-center py-4">لا توجد اقتراحات حالياً</p>
        ) : (
          suggestedUsers.map((user) => (
            <div key={user.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3 space-x-reverse">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    {user.display_name?.charAt(0) || user.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-1 space-x-reverse">
                    <p className="text-white font-medium text-sm truncate">{user.display_name}</p>
                    {user.is_verified && <Badge className="bg-blue-500 text-white border-0 text-xs">✓</Badge>}
                  </div>
                  <p className="text-gray-400 text-xs truncate">@{user.username}</p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => followUser(user.id)}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-xs"
              >
                <UserPlus className="w-3 h-3 ml-1" />
                متابعة
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
