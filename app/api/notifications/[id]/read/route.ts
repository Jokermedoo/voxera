import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await params
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
      .eq("id", notificationId)
      .eq("user_id", user.id)
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      message: "تم تحديد الإشعار كمقروء"
    })
    
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return NextResponse.json(
      { success: false, message: "خطأ في تحديث الإشعار" },
      { status: 500 }
    )
  }
}