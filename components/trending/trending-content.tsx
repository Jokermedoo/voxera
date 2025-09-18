"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrendingUp, Hash, Mic, Users, Play, Clock, File as Fire } from "lucide-react"
import Link from "next/link"

interface TrendingContentProps {
  userId: string
}

export function TrendingContent({ userId }: TrendingContentProps) {
  // Mock trending data - in real app, fetch from analytics/database
  const trendingTopics = [
    { name: "الذكاء الاصطناعي", posts: 234, growth: "+25%", rooms: 12 },
    { name: "ريادة الأعمال", posts: 189, growth: "+18%", rooms: 8 },
    { name: "الشعر العربي", posts: 156, growth: "+12%", rooms: 15 },
    { name: "التكنولوجيا", posts: 143, growth: "+30%", rooms: 6 },
    { name: "البرمجة", posts: 87, growth: "+45%", rooms: 4 },
  ]

  const trendingRooms = [
    {
      id: 1,
      title: "مستقبل الذكاء الاصطناعي في العالم العربي",
      host: "د. أحمد محمد",
      participants: 156,
      duration: "2 ساعة 30 دقيقة",
      topic: "الذكاء الاصطناعي",
      avatar: "/placeholder.svg",
    },
    {
      id: 2,
      title: "ريادة الأعمال للشباب العربي",
      host: "سارة أحمد",
      participants: 89,
      duration: "1 ساعة 45 دقيقة",
      topic: "ريادة الأعمال",
      avatar: "/placeholder.svg",
    },
    {
      id: 3,
      title: "أمسية شعرية مع الشعراء الشباب",
      host: "محمد الشاعر",
      participants: 234,
      duration: "3 ساعات",
      topic: "الشعر العربي",
      avatar: "/placeholder.svg",
    },
  ]

  const trendingUsers = [
    {
      id: 1,
      username: "ahmed_tech",
      display_name: "أحمد التقني",
      followers: 1234,
      rooms_hosted: 45,
      avatar: "/placeholder.svg",
      verified: true,
    },
    {
      id: 2,
      username: "sara_business",
      display_name: "سارة الأعمال",
      followers: 987,
      rooms_hosted: 32,
      avatar: "/placeholder.svg",
      verified: true,
    },
    {
      id: 3,
      username: "poet_mohammed",
      display_name: "محمد الشاعر",
      followers: 2156,
      rooms_hosted: 78,
      avatar: "/placeholder.svg",
      verified: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-8">
        {/* Trending Topics */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Fire className="w-5 h-5 ml-2 text-orange-400" />
              المواضيع الأكثر رواجاً
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trendingTopics.map((topic, index) => (
              <div
                key={topic.name}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">#{topic.name}</h4>
                    <div className="flex items-center space-x-3 space-x-reverse text-sm text-gray-400">
                      <span>{topic.posts} منشور</span>
                      <span>•</span>
                      <span>{topic.rooms} غرفة نشطة</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">{topic.growth}</Badge>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Trending Rooms */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Mic className="w-5 h-5 ml-2 text-purple-400" />
              الغرف الأكثر شعبية
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trendingRooms.map((room, index) => (
              <div key={room.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 space-x-reverse mb-2">
                      <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                        #{index + 1} رائج
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">مباشر</Badge>
                    </div>
                    <h4 className="text-white font-medium mb-2">{room.title}</h4>
                    <div className="flex items-center space-x-4 space-x-reverse text-sm text-gray-400">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Users className="w-4 h-4" />
                        <span>{room.participants} مشارك</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Clock className="w-4 h-4" />
                        <span>{room.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Hash className="w-4 h-4" />
                        <span>{room.topic}</span>
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

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={room.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                      {room.host.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-gray-400 text-sm">مع {room.host}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Trending Users */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 ml-2 text-blue-400" />
              المستخدمون الأكثر نشاطاً
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {trendingUsers.map((user, index) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <div className="relative">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        {user.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1 space-x-reverse">
                      <p className="text-white font-medium text-sm truncate">{user.display_name}</p>
                      {user.verified && <Badge className="bg-blue-500 text-white border-0 text-xs">✓</Badge>}
                    </div>
                    <p className="text-gray-400 text-xs">@{user.username}</p>
                    <div className="flex items-center space-x-2 space-x-reverse text-xs text-gray-400">
                      <span>{user.followers} متابع</span>
                      <span>•</span>
                      <span>{user.rooms_hosted} غرفة</span>
                    </div>
                  </div>
                </div>

                <Link href={`/profile/${user.username}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs"
                  >
                    عرض
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 ml-2 text-green-400" />
              إحصائيات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">الغرف النشطة الآن</span>
              <span className="text-white font-bold">89</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">المستخدمون المتصلون</span>
              <span className="text-white font-bold">1,234</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">المواضيع الرائجة</span>
              <span className="text-white font-bold">25</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">النمو اليومي</span>
              <span className="text-green-400 font-bold">+12%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
