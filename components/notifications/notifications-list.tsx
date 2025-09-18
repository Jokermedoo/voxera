"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bell, Users, Gift, Mic, Trophy, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { ar } from "date-fns/locale"

interface NotificationsListProps {
  notifications: any[]
  unreadCount: number
}

export function NotificationsList({ notifications: initialNotifications, unreadCount }: NotificationsListProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const getNotificationIcon = (type: string) => {
    const icons = {
      follow: Users,
      room_invite: Mic,
      room_join: Users,
      gift_received: Gift,
      mention: Bell,
      room_started: Mic,
      poll_created: Bell,
      achievement: Trophy,
      admin_warning: AlertTriangle,
      system_announcement: Bell,
    }
    return icons[type as keyof typeof icons] || Bell
  }

  const getNotificationColor = (type: string) => {
    const colors = {
      follow: "text-blue-400",
      room_invite: "text-purple-400",
      room_join: "text-green-400",
      gift_received: "text-pink-400",
      mention: "text-yellow-400",
      room_started: "text-purple-400",
      poll_created: "text-blue-400",
      achievement: "text-yellow-400",
      admin_warning: "text-red-400",
      system_announcement: "text-indigo-400",
    }
    return colors[type as keyof typeof colors] || "text-gray-400"
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId)

      if (!error) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === notificationId ? { ...notif, is_read: true } : notif)),
        )
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("is_read", false)

      if (!error) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })))
        router.refresh()
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase.from("notifications").delete().eq("id", notificationId)

      if (!error) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
  }

  const handleNotificationClick = async (notification: any) => {
    if (!notification.is_read) {
      await markAsRead(notification.id)
    }

    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      {unreadCount > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-gray-300">{unreadCount} إشعار غير مقروء</p>
          <Button
            onClick={markAllAsRead}
            disabled={loading}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <CheckCircle2 className="w-4 h-4 ml-2" />
            تحديد الكل كمقروء
          </Button>
        </div>
      )}

      {/* Notifications List */}
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Bell className="w-5 h-5 ml-2" />
            جميع الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">لا توجد إشعارات</p>
            </div>
          ) : (
            notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type)
              const iconColor = getNotificationColor(notification.type)

              return (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg transition-colors cursor-pointer ${
                    notification.is_read
                      ? "bg-white/5 hover:bg-white/10"
                      : "bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-4 space-x-reverse">
                    {/* Notification Icon */}
                    <div className={`p-2 rounded-lg bg-white/10 ${iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <h4 className="text-white font-medium">{notification.title}</h4>
                          {!notification.is_read && (
                            <Badge className="bg-purple-500 text-white border-0 text-xs">جديد</Badge>
                          )}
                        </div>
                        <span className="text-gray-400 text-xs whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: ar,
                          })}
                        </span>
                      </div>

                      <p className="text-gray-300 text-sm mb-3">{notification.message}</p>

                      {/* Sender Info */}
                      {notification.sender && (
                        <div className="flex items-center space-x-2 space-x-reverse mb-3">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={notification.sender.avatar_url || "/placeholder.svg"} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                              {notification.sender.display_name?.charAt(0) || notification.sender.username?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-gray-400 text-xs">
                            من {notification.sender.display_name || notification.sender.username}
                          </span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-2 space-x-reverse">
                        {!notification.is_read && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id)
                            }}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <CheckCircle2 className="w-4 h-4 ml-1" />
                            تحديد كمقروء
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id)
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4 ml-1" />
                          حذف
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
