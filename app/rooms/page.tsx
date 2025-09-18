import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { RoomsGrid } from "@/components/rooms/rooms-grid"
import { CreateRoomButton } from "@/components/rooms/create-room-button"
import { Mic, Volume2 } from "lucide-react"

export default async function RoomsPage() {
  const supabase = createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get active rooms
  const { data: rooms } = await supabase
    .from("rooms")
    .select(`
      *,
      profiles:host_id (username, display_name, avatar_url),
      room_participants (count)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Mic className="h-8 w-8 text-purple-400" />
                <Volume2 className="h-4 w-4 text-blue-400 absolute -top-1 -right-1" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Voxera</h1>
                <p className="text-purple-200 text-sm">مرحباً، {profile?.display_name}</p>
              </div>
            </div>
            <CreateRoomButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">الغرف النشطة</h2>
          <p className="text-purple-200">اكتشف المحادثات الجارية وانضم إلى المجتمع</p>
        </div>

        <RoomsGrid rooms={rooms || []} />
      </div>
    </div>
  )
}
