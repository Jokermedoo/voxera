import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params
    const supabase = createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      )
    }
    
    // Check if user is in room
    const { data: participant, error: participantError } = await supabase
      .from("room_participants")
      .select("id, role")
      .eq("room_id", roomId)
      .eq("user_id", user.id)
      .single()
    
    if (participantError || !participant) {
      return NextResponse.json(
        { success: false, message: "أنت لست في هذه الغرفة" },
        { status: 400 }
      )
    }
    
    // Remove participant
    const { error: deleteError } = await supabase
      .from("room_participants")
      .delete()
      .eq("id", participant.id)
    
    if (deleteError) throw deleteError
    
    // If host is leaving, end the room or transfer ownership
    if (participant.role === "host") {
      // Look for co-host to transfer ownership
      const { data: coHost } = await supabase
        .from("room_participants")
        .select("id, user_id")
        .eq("room_id", roomId)
        .eq("role", "co-host")
        .limit(1)
        .single()
      
      if (coHost) {
        // Transfer ownership to co-host
        await supabase
          .from("room_participants")
          .update({ role: "host" })
          .eq("id", coHost.id)
        
        await supabase
          .from("rooms")
          .update({ host_id: coHost.user_id })
          .eq("id", roomId)
      } else {
        // End room if no co-host available
        await supabase
          .from("rooms")
          .update({ is_active: false })
          .eq("id", roomId)
      }
    }
    
    return NextResponse.json({
      success: true,
      message: "تم مغادرة الغرفة بنجاح"
    })
    
  } catch (error) {
    console.error("Error leaving room:", error)
    return NextResponse.json(
      { success: false, message: "خطأ في مغادرة الغرفة" },
      { status: 500 }
    )
  }
}