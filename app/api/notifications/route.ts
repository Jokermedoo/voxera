import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50)
    const unreadOnly = searchParams.get("unread_only") === "true"
    
    let query = supabase
      .from("notifications")
      .select(`
        *,
        sender:sender_id(username, display_name, avatar_url)
      `)
      .eq("user_id", user.id)
    
    if (unreadOnly) {
      query = query.eq("is_read", false)
    }
    
    const { data: notifications, error } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1)
    
    if (error) throw error
    
    // Get unread count
    const { count: unreadCount } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("is_read", false)
    
    return NextResponse.json({
      success: true,
      data: {
        notifications: notifications || [],
        unread_count: unreadCount || 0
      }
    })
    
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json(
      { success: false, message: "خطأ في جلب الإشعارات" },
      { status: 500 }
    )
  }
}