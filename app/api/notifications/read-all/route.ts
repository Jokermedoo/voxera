import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: "غير مصرح" },
        { status: 401 }
      )
    }
    
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: "تم تحديد جميع الإشعارات كمقروءة"
    })
    
  } catch (error) {
    console.error("Error marking all notifications as read:", error)
    return NextResponse.json(
      { success: false, message: "خطأ في تحديث الإشعارات" },
      { status: 500 }
    )
  }
}