import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)
    const roomType = searchParams.get("type")
    const audioMode = searchParams.get("mode")
    const search = searchParams.get("search")
    
    let query = supabase
      .from("rooms")
      .select(`
        *,
        profiles:host_id(username, display_name, avatar_url, is_verified),
        room_participants(count)
      `)
      .eq("is_active", true)
    
    if (roomType) {
      query = query.eq("room_type", roomType)
    }
    
    if (audioMode) {
      query = query.eq("audio_mode", audioMode)
    }
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }
    
    const { data: rooms, error } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: { rooms: rooms || [] }
    })
    
  } catch (error) {
    console.error("Error fetching rooms:", error)
    return NextResponse.json(
      { success: false, message: "خطأ في جلب الغرف" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const {
      title,
      description,
      room_type,
      audio_mode,
      max_participants = 50,
      background_image,
      tags = [],
      language = "ar"
    } = body
    
    // Create room
    const { data: room, error: roomError } = await supabase
      .from("rooms")
      .insert({
        title,
        description,
        host_id: user.id,
        room_type,
        audio_mode,
        max_participants,
        background_image,
        tags,
        language
      })
      .select()
      .single()
    
    if (roomError) throw roomError
    
    // Add host as participant
    const { error: participantError } = await supabase
      .from("room_participants")
      .insert({
        room_id: room.id,
        user_id: user.id,
        role: "host"
      })
    
    if (participantError) throw participantError
    
    return NextResponse.json({
      success: true,
      message: "تم إنشاء الغرفة بنجاح",
      data: { room }
    })
    
  } catch (error) {
    console.error("Error creating room:", error)
    return NextResponse.json(
      { success: false, message: "خطأ في إنشاء الغرفة" },
      { status: 500 }
    )
  }
}