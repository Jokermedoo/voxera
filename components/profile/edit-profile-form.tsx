"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createBrowserClient } from "@/lib/supabase/client"
import { Save, Upload } from "lucide-react"

interface EditProfileFormProps {
  profile: any
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    username: profile?.username || "",
    bio: profile?.bio || "",
    location: profile?.location || "",
    website: profile?.website || "",
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from("profiles").update(formData).eq("id", profile.id)

      if (error) throw error

      router.push(`/profile/${formData.username}`)
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white text-center">معلومات الملف الشخصي</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Avatar className="w-24 h-24 border-4 border-white/20">
                <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={formData.display_name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-2xl">
                  {formData.display_name?.charAt(0) || formData.username?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <Button
                type="button"
                size="sm"
                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-purple-500 hover:bg-purple-600"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name" className="text-white">
                الاسم المعروض
              </Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleChange("display_name", e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="أدخل اسمك المعروض"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">
                اسم المستخدم
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="اسم_المستخدم"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-white">
              النبذة الشخصية
            </Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
              placeholder="اكتب نبذة عن نفسك..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-white">
                الموقع
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="المدينة، البلد"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-white">
                الموقع الإلكتروني
              </Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                placeholder="https://example.com"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              <Save className="w-4 h-4 ml-2" />
              {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              إلغاء
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
