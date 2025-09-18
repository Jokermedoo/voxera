"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, MessageSquare, Music, Radio, Mic } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function CreateRoomButton() {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    roomType: "public" as "public" | "private",
    audioMode: "conversation" as "conversation" | "music" | "podcast" | "broadcast",
    maxParticipants: "50",
  })

  const router = useRouter()

  const audioModes = [
    { value: "conversation", label: "محادثة", icon: MessageSquare, description: "للمحادثات العامة والنقاشات" },
    { value: "music", label: "موسيقى", icon: Music, description: "للعروض الموسيقية والغناء" },
    { value: "podcast", label: "بودكاست", icon: Radio, description: "للبودكاست والمحتوى المسموع" },
    { value: "broadcast", label: "بث مباشر", icon: Mic, description: "للبث المباشر والعروض" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createBrowserClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not authenticated")

      const { data: room, error } = await supabase
        .from("rooms")
        .insert({
          title: formData.title,
          description: formData.description || null,
          host_id: user.id,
          room_type: formData.roomType,
          audio_mode: formData.audioMode,
          max_participants: Number.parseInt(formData.maxParticipants),
        })
        .select()
        .single()

      if (error) throw error

      // Add host as participant
      await supabase.from("room_participants").insert({
        room_id: room.id,
        user_id: user.id,
        role: "host",
      })

      setOpen(false)
      router.push(`/rooms/${room.id}`)
    } catch (error) {
      console.error("Error creating room:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          إنشاء غرفة
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>إنشاء غرفة جديدة</DialogTitle>
          <DialogDescription className="text-gray-400">املأ التفاصيل التالية لإنشاء غرفتك الصوتية</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الغرفة</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="اكتب عنوان جذاب للغرفة"
              required
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف (اختياري)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="وصف مختصر عن موضوع الغرفة"
              className="bg-gray-800 border-gray-600 text-white"
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>نوع الغرفة</Label>
            <RadioGroup
              value={formData.roomType}
              onValueChange={(value) => setFormData({ ...formData, roomType: value as "public" | "private" })}
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="public" id="public" />
                <Label htmlFor="public">عامة - يمكن لأي شخص الانضمام</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="private" id="private" />
                <Label htmlFor="private">خاصة - بالدعوة فقط</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-3">
            <Label>نمط الصوت</Label>
            <div className="grid grid-cols-2 gap-3">
              {audioModes.map((mode) => {
                const IconComponent = mode.icon
                return (
                  <div
                    key={mode.value}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      formData.audioMode === mode.value
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-gray-600 bg-gray-800 hover:border-gray-500"
                    }`}
                    onClick={() => setFormData({ ...formData, audioMode: mode.value as any })}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="h-4 w-4" />
                      <span className="font-medium text-sm">{mode.label}</span>
                    </div>
                    <p className="text-xs text-gray-400">{mode.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">الحد الأقصى للمشاركين</Label>
            <Select
              value={formData.maxParticipants}
              onValueChange={(value) => setFormData({ ...formData, maxParticipants: value })}
            >
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                <SelectItem value="10">10 مشاركين</SelectItem>
                <SelectItem value="25">25 مشارك</SelectItem>
                <SelectItem value="50">50 مشارك</SelectItem>
                <SelectItem value="100">100 مشارك</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? "جاري الإنشاء..." : "إنشاء الغرفة"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
