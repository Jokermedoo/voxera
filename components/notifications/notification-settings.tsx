"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Settings, Save, Bell, Smartphone } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface NotificationSettingsProps {
  preferences: any
  userId: string
}

export function NotificationSettings({ preferences: initialPreferences, userId }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState(
    initialPreferences || {
      follow_notifications: true,
      room_invite_notifications: true,
      gift_notifications: true,
      mention_notifications: true,
      room_notifications: true,
      poll_notifications: true,
      achievement_notifications: true,
      admin_notifications: true,
      system_notifications: true,
      email_notifications: false,
      push_notifications: true,
    },
  )
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  const handleToggle = (key: string, value: boolean) => {
    setPreferences((prev: any) => ({
      ...prev,
      [key]: value,
    }))
  }

  const savePreferences = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.from("notification_preferences").upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "تم حفظ الإعدادات",
        description: "تم تحديث تفضيلات الإشعارات بنجاح",
      })
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ أثناء حفظ الإعدادات",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const notificationTypes = [
    {
      key: "follow_notifications",
      title: "المتابعة",
      description: "عندما يتابعك شخص جديد",
    },
    {
      key: "room_invite_notifications",
      title: "دعوات الغرف",
      description: "عندما يدعوك شخص إلى غرفة خاصة",
    },
    {
      key: "gift_notifications",
      title: "الهدايا",
      description: "عندما تتلقى هدية من شخص ما",
    },
    {
      key: "mention_notifications",
      title: "الإشارات",
      description: "عندما يذكرك شخص في محادثة",
    },
    {
      key: "room_notifications",
      title: "أنشطة الغرف",
      description: "عندما ينضم أشخاص إلى غرفك أو تبدأ غرفة جديدة",
    },
    {
      key: "poll_notifications",
      title: "الاستطلاعات",
      description: "عندما يتم إنشاء استطلاع في غرفة تشارك فيها",
    },
    {
      key: "achievement_notifications",
      title: "الإنجازات",
      description: "عندما تحصل على إنجاز أو نقاط جديدة",
    },
    {
      key: "admin_notifications",
      title: "إشعارات الإدارة",
      description: "تحذيرات ورسائل من فريق الإدارة",
    },
    {
      key: "system_notifications",
      title: "إشعارات النظام",
      description: "تحديثات النظام والإعلانات المهمة",
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="w-5 h-5 ml-2" />
            إعدادات الإشعارات
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* App Notifications */}
          <div>
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <Bell className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-medium">إشعارات التطبيق</h3>
            </div>
            <div className="space-y-4">
              {notificationTypes.map((type) => (
                <div key={type.key} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex-1">
                    <Label htmlFor={type.key} className="text-white font-medium cursor-pointer">
                      {type.title}
                    </Label>
                    <p className="text-gray-400 text-sm mt-1">{type.description}</p>
                  </div>
                  <Switch
                    id={type.key}
                    checked={preferences[type.key]}
                    onCheckedChange={(checked) => handleToggle(type.key, checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-white/20" />

          {/* Delivery Methods */}
          <div>
            <div className="flex items-center space-x-2 space-x-reverse mb-4">
              <Smartphone className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-medium">طرق التوصيل</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex-1">
                  <Label htmlFor="push_notifications" className="text-white font-medium cursor-pointer">
                    الإشعارات الفورية
                  </Label>
                  <p className="text-gray-400 text-sm mt-1">إشعارات فورية على المتصفح</p>
                </div>
                <Switch
                  id="push_notifications"
                  checked={preferences.push_notifications}
                  onCheckedChange={(checked) => handleToggle("push_notifications", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                <div className="flex-1">
                  <Label htmlFor="email_notifications" className="text-white font-medium cursor-pointer">
                    الإشعارات عبر البريد الإلكتروني
                  </Label>
                  <p className="text-gray-400 text-sm mt-1">تلقي الإشعارات المهمة عبر البريد الإلكتروني</p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={preferences.email_notifications}
                  onCheckedChange={(checked) => handleToggle("email_notifications", checked)}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <Button
              onClick={savePreferences}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              <Save className="w-4 h-4 ml-2" />
              {loading ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
