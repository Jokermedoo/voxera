"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, Mic, Play, UserPlus, Hash, Clock, Search } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import Link from "next/link"

interface DiscoveryFeedProps {
  searchQuery: string
  searchType: string
  userId: string
}

export function DiscoveryFeed({ searchQuery, searchType, userId }: DiscoveryFeedProps) {
  const [results, setResults] = useState<any>({
    users: [],
    rooms: [],
    topics: [],
  })
  const [loading, setLoading] = useState(false)
  const supabase = createBrowserClient()

  useEffect(() => {
    if (searchQuery) {
      performSearch()
    } else {
      loadDiscoveryContent()
    }
  }, [searchQuery, searchType])

  const performSearch = async () => {
    setLoading(true)
    try {
      const searchResults: any = { users: [], rooms: [], topics: [] }

      // Search users
      if (searchType === "all" || searchType === "users") {
        const { data: users } = await supabase
          .from("profiles")
          .select("*")
          .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
          .neq("id", userId)
          .limit(10)

        searchResults.users = users || []
      }

      // Search rooms
      if (searchType === "all" || searchType === "rooms") {
        const { data: rooms } = await supabase
          .from("rooms")
          .select(`
            *,
            host:host_id(username, display_name, avatar_url),
            participants:room_participants(count)
          `)
          .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .eq("is_active", true)
          .limit(10)

        searchResults.rooms = rooms || []
      }

      // Mock topics search (in real app, you'd have a topics table)
      if (searchType === "all" || searchType === "topics") {
        const mockTopics = [
          { name: "الذكاء الاصطناعي", count: 234, trend: "up" },
          { name: "ريادة الأعمال", count: 189, trend: "up" },
          { name: "الشعر العربي", count: 156, trend: "stable" },
          { name: "التكنولوجيا", count: 143, trend: "up" },
          { name: "البرمجة", count: 87, trend: "up" },
        ].filter((topic) => topic.name.toLowerCase().includes(searchQuery.toLowerCase()))

        searchResults.topics = mockTopics
      }

      setResults(searchResults)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadDiscoveryContent = async () => {
    setLoading(true)
    try {
      // Load suggested users (not following)
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
        .limit(8)

      // Load active rooms
      const { data: rooms } = await supabase
        .from("rooms")
        .select(`
          *,
          host:host_id(username, display_name, avatar_url),
          participants:room_participants(count)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8)

      // Mock trending topics
      const topics = [
        { name: "الذكاء الاصطناعي", count: 234, trend: "up" },
        { name: "ريادة الأعمال", count: 189, trend: "up" },
        { name: "الشعر العربي", count: 156, trend: "stable" },
        { name: "التكنولوجيا", count: 143, trend: "up" },
        { name: "البرمجة", count: 87, trend: "up" },
      ]

      setResults({
        users: users || [],
        rooms: rooms || [],
        topics,
      })
    } catch (error) {
      console.error("Discovery error:", error)
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
        // Update local state
        setResults((prev: any) => ({
          ...prev,
          users: prev.users.map((user: any) => (user.id === targetUserId ? { ...user, isFollowing: true } : user)),
        }))
      }
    } catch (error) {
      console.error("Follow error:", error)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-white/20 rounded w-3/4"></div>
                <div className="h-4 bg-white/20 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Users Results */}
      {(searchType === "all" || searchType === "users") && results.users.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 ml-2" />
              {searchQuery ? "المستخدمون" : "مستخدمون مقترحون"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.users.map((user: any) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center space-x-4 space-x-reverse">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      {user.display_name?.charAt(0) || user.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <h4 className="text-white font-medium">{user.display_name}</h4>
                      {user.is_verified && <Badge className="bg-blue-500 text-white border-0 text-xs">متحقق</Badge>}
                    </div>
                    <p className="text-gray-400 text-sm">@{user.username}</p>
                    {user.bio && <p className="text-gray-300 text-sm mt-1 line-clamp-2">{user.bio}</p>}
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Link href={`/profile/${user.username}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      عرض الملف
                    </Button>
                  </Link>
                  <Button
                    onClick={() => followUser(user.id)}
                    size="sm"
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <UserPlus className="w-4 h-4 ml-2" />
                    متابعة
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Rooms Results */}
      {(searchType === "all" || searchType === "rooms") && results.rooms.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Mic className="w-5 h-5 ml-2" />
              {searchQuery ? "الغرف" : "غرف نشطة"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.rooms.map((room: any) => (
              <div key={room.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                      <h4 className="text-white font-medium">{room.title}</h4>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">مباشر</Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{room.description}</p>

                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-400">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Users className="w-4 h-4" />
                        <span>{room.participants?.[0]?.count || 0} مشارك</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Clock className="w-4 h-4" />
                        <span>{new Date(room.created_at).toLocaleDateString("ar-SA")}</span>
                      </div>
                    </div>
                  </div>

                  <Link href={`/rooms/${room.id}`}>
                    <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                      <Play className="w-4 h-4 ml-2" />
                      انضم
                    </Button>
                  </Link>
                </div>

                {/* Host Info */}
                <div className="flex items-center space-x-2 space-x-reverse">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={room.host?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                      {room.host?.display_name?.charAt(0) || room.host?.username?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-gray-400 text-sm">مع {room.host?.display_name || room.host?.username}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Topics Results */}
      {(searchType === "all" || searchType === "topics") && results.topics.length > 0 && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Hash className="w-5 h-5 ml-2" />
              {searchQuery ? "المواضيع" : "مواضيع رائجة"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.topics.map((topic: any, index: number) => (
              <div
                key={topic.name}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3 space-x-reverse">
                  <span className="text-gray-400 text-sm">#{index + 1}</span>
                  <div>
                    <h4 className="text-white font-medium">#{topic.name}</h4>
                    <p className="text-gray-400 text-xs">{topic.count} منشور</p>
                  </div>
                </div>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">رائج</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {searchQuery && Object.values(results).every((arr: any) => arr.length === 0) && (
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardContent className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-12 h-12 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">لا توجد نتائج</h3>
              <p>لم نجد أي نتائج لبحثك عن "{searchQuery}"</p>
              <p className="mt-2">جرب كلمات مفتاحية مختلفة أو تصفح المحتوى المقترح</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
