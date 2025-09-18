import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { TrendingContent } from "@/components/trending/trending-content"

export default async function TrendingPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">الترندات</h1>
          <p className="text-gray-300">اكتشف أحدث المواضيع والغرف الرائجة</p>
        </div>

        <TrendingContent userId={user.id} />
      </div>
    </DashboardLayout>
  )
}
