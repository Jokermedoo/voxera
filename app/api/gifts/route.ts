import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data: gifts, error } = await supabase
      .from("gifts")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true })
    
    if (error) throw error
    
    return NextResponse.json({
      success: true,
      data: { gifts: gifts || [] }
    })
    
  } catch (error) {
    console.error("Error fetching gifts:", error)
    return NextResponse.json(
      { success: false, message: "خطأ في جلب الهدايا" },
      { status: 500 }
    )
  }
}