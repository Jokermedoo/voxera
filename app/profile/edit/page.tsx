import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EditProfileForm } from "@/components/profile/edit-profile-form"

export default async function EditProfilePage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">تعديل الملف الشخصي</h1>
          <EditProfileForm profile={profile} />
        </div>
      </div>
    </div>
  )
}
