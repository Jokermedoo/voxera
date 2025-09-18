import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { NotificationsList } from "@/components/notifications/notifications-list"
import { NotificationSettings } from "@/components/notifications/notification-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function NotificationsPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select(`
      *,
      sender:sender_id(username, display_name, avatar_url)
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Get notification preferences
  const { data: preferences } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single()

  // Get unread count
  const { count: unreadCount } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">الإشعارات</h1>
          <p className="text-gray-300">
            {unreadCount ? `لديك ${unreadCount} إشعار غير مقروء` : "جميع الإشعارات مقروءة"}
          </p>
        </div>

        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 border-white/20">
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-purple-500">
              الإشعارات
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-white data-[state=active]:bg-purple-500">
              الإعدادات
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-6">
            <NotificationsList notifications={notifications || []} unreadCount={unreadCount || 0} />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <NotificationSettings preferences={preferences} userId={user.id} />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
