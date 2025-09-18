import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RoomInterface } from "@/components/rooms/room-interface"

interface RoomPageProps {
  params: Promise<{ id: string }>
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get room details
  const { data: room } = await supabase
    .from("rooms")
    .select(`
      *,
      profiles:host_id (username, display_name, avatar_url, is_verified)
    `)
    .eq("id", id)
    .single()

  if (!room) {
    redirect("/rooms")
  }

  // Get room participants
  const { data: participants } = await supabase
    .from("room_participants")
    .select(`
      *,
      profiles (username, display_name, avatar_url, is_verified)
    `)
    .eq("room_id", id)
    .order("joined_at", { ascending: true })

  // Get user profile
  const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Check if user is already in room
  const isParticipant = participants?.some((p) => p.user_id === data.user.id)

  return (
    <RoomInterface
      room={room}
      participants={participants || []}
      currentUser={userProfile}
      isParticipant={isParticipant || false}
    />
  )
}
