"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mic, Heart, Users } from "lucide-react"

interface ProfileActivityProps {
  userId: string
}

export function ProfileActivity({ userId }: ProfileActivityProps) {
  // Mock activity data - in real app, fetch from database
  const activities = [
    {
      id: 1,
      type: "hosted_room",
      title: 'استضاف غرفة "نقاش تقني"',
      description: "غرفة حول أحدث التقنيات في البرمجة",
      timestamp: "2024-01-15T10:30:00Z",
      participants: 23,
      icon: Mic,
      color: "bg-purple-500",
    },
    {
      id: 2,
      type: "joined_room",
      title: 'انضم إلى غرفة "الشعر العربي"',
      description: "أمسية شعرية مع الشعراء المعاصرين",
      timestamp: "2024-01-14T20:15:00Z",
      participants: 45,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      id: 3,
      type: "received_gift",
      title: 'تلقى هدية "وردة ذهبية"',
      description: "من المستخدم أحمد محمد",
      timestamp: "2024-01-14T18:45:00Z",
      icon: Heart,
      color: "bg-pink-500",
    },
  ]

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-right">النشاط الأخير</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className={`p-2 rounded-lg ${activity.color} flex-shrink-0`}>
              <activity.icon className="w-4 h-4 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium mb-1">{activity.title}</h4>
              <p className="text-gray-300 text-sm mb-2">{activity.description}</p>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">
                  {new Date(activity.timestamp).toLocaleDateString("ar-SA", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                {activity.participants && (
                  <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                    {activity.participants} مشارك
                  </Badge>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
