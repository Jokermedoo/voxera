"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { UserPlus, UserMinus, Settings, MapPin, Calendar, LinkIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ProfileHeaderProps {
  profile: any
  isOwnProfile: boolean
  isFollowing: boolean
  currentUserId?: string
}

export function ProfileHeader({ profile, isOwnProfile, isFollowing, currentUserId }: ProfileHeaderProps) {
  const [following, setFollowing] = useState(isFollowing)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleFollow = async () => {
    if (!currentUserId) {
      router.push("/auth/login")
      return
    }

    setLoading(true)
    try {
      if (following) {
        await supabase.from("follows").delete().eq("follower_id", currentUserId).eq("following_id", profile.id)
      } else {
        await supabase.from("follows").insert({
          follower_id: currentUserId,
          following_id: profile.id,
        })
      }
      setFollowing(!following)
    } catch (error) {
      console.error("Error updating follow status:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="w-24 h-24 border-4 border-white/20">
            <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.display_name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">
              {profile.display_name?.charAt(0) || profile.username?.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{profile.display_name}</h1>
              <p className="text-purple-200 text-lg">@{profile.username}</p>
              {profile.bio && <p className="text-gray-300 mt-3 leading-relaxed">{profile.bio}</p>}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-4 h-4" />
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-300 hover:text-purple-200 transition-colors"
                  >
                    {profile.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>انضم في {new Date(profile.created_at).toLocaleDateString("ar-SA")}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-white">
                <span className="font-bold">{profile.following?.[0]?.count || 0}</span>
                <span className="text-gray-300 mr-1">متابَع</span>
              </div>
              <div className="text-white">
                <span className="font-bold">{profile.followers?.[0]?.count || 0}</span>
                <span className="text-gray-300 mr-1">متابِع</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {isOwnProfile ? (
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => router.push("/profile/edit")}
              >
                <Settings className="w-4 h-4 ml-2" />
                تعديل الملف الشخصي
              </Button>
            ) : (
              <Button
                onClick={handleFollow}
                disabled={loading}
                className={
                  following
                    ? "bg-gray-600 hover:bg-gray-700 text-white"
                    : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
                }
              >
                {following ? (
                  <>
                    <UserMinus className="w-4 h-4 ml-2" />
                    إلغاء المتابعة
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 ml-2" />
                    متابعة
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
