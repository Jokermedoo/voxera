"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Mic, Users, Heart, MessageCircle } from "lucide-react"

interface RecentActivityProps {
  userId: string
}

export function RecentActivity({ userId }: RecentActivityProps) {
  // Mock activity data
  const activities = [
    {
      id: 1,
      type: "joined_room",
      user: "سارة أحمد",
      action: "انضمت إلى غرفة",
      target: "نقاش التكنولوجيا",
      time: "منذ 5 دقائق",
      avatar: "/placeholder.svg",
      icon: Users,
      color: "text-blue-400",
    },
    {
      id: 2,
      type: "hosted_room",
      user: "محمد علي",
      action: "بدأ غرفة جديدة",
      target: "أمسية شعرية",
      time: "منذ 15 دقيقة",
      avatar: "/placeholder.svg",
      icon: Mic,
      color: "text-purple-400",
    },
    {
      id: 3,
      type: "received_gift",
      user: "فاطمة سالم",
      action: "تلقت هدية",
      target: "وردة ذهبية",
      time: "منذ 30 دقيقة",
      avatar: "/placeholder.svg",
      icon: Heart,
      color: "text-pink-400",
    },
    {
      id: 4,
      type: "comment",
      user: "أحمد محمود",
      action: "علق في غرفة",
      target: "بودكاست الأعمال",
      time: "منذ ساعة",
      avatar: "/placeholder.svg",
      icon: MessageCircle,
      color: "text-green-400",
    },
  ]

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white">النشاط الأخير</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 space-x-reverse">
            <Avatar className="w-10 h-10">
              <AvatarImage src={activity.avatar || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                {activity.user.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 space-x-reverse">
                <activity.icon className={`w-4 h-4 ${activity.color}`} />
                <p className="text-white text-sm">
                  <span className="font-medium">{activity.user}</span>
                  <span className="text-gray-300 mx-1">{activity.action}</span>
                  <span className="text-purple-300">"{activity.target}"</span>
                </p>
              </div>
              <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
