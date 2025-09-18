import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SearchInterface } from "@/components/search/search-interface"
import { DiscoveryFeed } from "@/components/search/discovery-feed"
import { TrendingTopics } from "@/components/search/trending-topics"
import { SuggestedUsers } from "@/components/search/suggested-users"

interface ExplorePageProps {
  searchParams: Promise<{
    q?: string
    type?: string
  }>
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const searchQuery = params.q || ""
  const searchType = params.type || "all"

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">الاستكشاف</h1>
          <p className="text-gray-300">اكتشف غرف جديدة ومستخدمين مثيرين للاهتمام</p>
        </div>

        {/* Search Interface */}
        <SearchInterface initialQuery={searchQuery} initialType={searchType} />

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <DiscoveryFeed searchQuery={searchQuery} searchType={searchType} userId={user.id} />
          </div>

          <div className="space-y-6">
            <TrendingTopics />
            <SuggestedUsers userId={user.id} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
