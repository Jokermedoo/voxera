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
    
    // Check if room exists and is active
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .select("id, title, is_active, max_participants")
      .eq("id", roomId)
      .single()
    
    if (roomError || !room) {
      return NextResponse.json(
        { success: false, message: "الغرفة غير موجودة" },
        { status: 404 }
      )
    }
    
    if (!room.is_active) {
      return NextResponse.json(
        { success: false, message: "الغرفة غير نشطة" },
        { status: 400 }
      )
    }
    
    // Check if user is already in room
    const { data: existingParticipant } = await supabase
      .from("room_participants")
      .select("id")
      .eq("room_id", roomId)
      .eq("user_id", user.id)
      .single()
    
    if (existingParticipant) {
      return NextResponse.json(
        { success: false, message: "أنت موجود في الغرفة بالفعل" },
        { status: 400 }
      )
    }
    
    // Add participant
    const { data: participant, error: participantError } = await supabase
      .from("room_participants")
      .insert({
        room_id: roomId,
        user_id: user.id,
        role: "listener"
      })
      .select()
      .single()
    
    if (participantError) throw participantError
    
    return NextResponse.json({
      success: true,
      message: "تم الانضمام إلى الغرفة بنجاح",
      data: { participant }
    })
    
  } catch (error) {
    console.error("Error joining room:", error)
    return NextResponse.json(
      { success: false, message: "خطأ في الانضمام للغرفة" },
      { status: 500 }
    )
  }
}