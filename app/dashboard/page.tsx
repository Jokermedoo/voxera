import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { ActiveRooms } from "@/components/dashboard/active-rooms"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { TrendingTopics } from "@/components/dashboard/trending-topics"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default async function DashboardPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-white">مرحباً، {profile?.display_name || profile?.username}</h1>
          <p className="text-gray-300 text-lg">اكتشف الغرف الصوتية وانضم إلى المحادثات المثيرة</p>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Dashboard Stats */}
        <DashboardStats userId={user.id} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ActiveRooms />
            <RecentActivity userId={user.id} />
          </div>

          <div className="space-y-8">
            <TrendingTopics />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
