import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { ProfileHeader } from "@/components/profile/profile-header"
import { ProfileStats } from "@/components/profile/profile-stats"
import { ProfileActivity } from "@/components/profile/profile-activity"
import { ProfileRooms } from "@/components/profile/profile-rooms"

interface ProfilePageProps {
  params: {
    username: string
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const supabase = createServerClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get profile data
  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      followers:follows!follows_following_id_fkey(count),
      following:follows!follows_follower_id_fkey(count)
    `)
    .eq("username", params.username)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Check if current user is following this profile
  let isFollowing = false
  if (user) {
    const { data: followData } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", user.id)
      .eq("following_id", profile.id)
      .single()

    isFollowing = !!followData
  }

  const isOwnProfile = user?.id === profile.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <ProfileHeader
          profile={profile}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          currentUserId={user?.id}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-1">
            <ProfileStats profile={profile} />
          </div>

          <div className="lg:col-span-2 space-y-8">
            <ProfileRooms userId={profile.id} />
            <ProfileActivity userId={profile.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
