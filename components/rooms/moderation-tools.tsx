"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Ban, Clock, AlertTriangle, UserCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface ModerationToolsProps {
  roomId: string
  isHost: boolean
  isCoHost: boolean
}

interface ModerationSettings {
  autoMuteNewJoins: boolean
  requireApprovalToSpeak: boolean
  profanityFilter: boolean
  slowMode: boolean
  slowModeDelay: number
  maxMessageLength: number
}

export function ModerationTools({ roomId, isHost, isCoHost }: ModerationToolsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<ModerationSettings>({
    autoMuteNewJoins: true,
    requireApprovalToSpeak: false,
    profanityFilter: true,
    slowMode: false,
    slowModeDelay: 5,
    maxMessageLength: 500,
  })
  const [bannedWords, setBannedWords] = useState("")
  const [warningMessage, setWarningMessage] = useState("")

  const canModerate = isHost || isCoHost

  if (!canModerate) {
    return null
  }

  const handleSaveSettings = async () => {
    try {
      const supabase = createClient()

      // Save moderation settings to room metadata
      const { error } = await supabase
        .from("rooms")
        .update({
          metadata: {
            moderation: settings,
            banned_words: bannedWords
              .split(",")
              .map((word) => word.trim())
              .filter(Boolean),
            warning_message: warningMessage,
          },
        })
        .eq("id", roomId)

      if (error) throw error
      setIsOpen(false)
    } catch (error) {
      console.error("Error saving moderation settings:", error)
    }
  }

  const handleSendWarning = async (participantId: string, message: string) => {
    try {
      const supabase = createClient()

      // Send system message as warning
      await supabase.from("chat_messages").insert({
        room_id: roomId,
        user_id: participantId,
        message: `تحذير من الإدارة: ${message}`,
        message_type: "system",
        metadata: { type: "warning", from_moderator: true },
      })
    } catch (error) {
      console.error("Error sending warning:", error)
    }
  }

  const handleTemporaryMute = async (participantId: string, duration: number) => {
    try {
      const supabase = createBrowserClient()

      // Mute participant
      await supabase
        .from("room_participants")
        .update({
          is_muted: true,
          mute_until: new Date(Date.now() + duration * 60000).toISOString(),
        })
        .eq("id", participantId)

      // Schedule unmute (in a real app, you'd use a background job)
      setTimeout(async () => {
        await supabase.from("room_participants").update({ is_muted: false, mute_until: null }).eq("id", participantId)
      }, duration * 60000)
    } catch (error) {
      console.error("Error applying temporary mute:", error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
          <Shield className="h-4 w-4 mr-2" />
          أدوات الإشراف
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            أدوات الإشراف والتحكم
          </DialogTitle>
          <DialogDescription className="text-gray-400">إدارة سلوك المشاركين وضبط قواعد الغرفة</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Auto-Moderation Settings */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">الإشراف التلقائي</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">كتم المنضمين الجدد تلقائياً</Label>
                  <p className="text-sm text-gray-400">يتم كتم المشاركين الجدد عند الانضمام</p>
                </div>
                <Switch
                  checked={settings.autoMuteNewJoins}
                  onCheckedChange={(checked) => setSettings({ ...settings, autoMuteNewJoins: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">طلب الموافقة للتحدث</Label>
                  <p className="text-sm text-gray-400">يحتاج المشاركون لموافقة للتحدث</p>
                </div>
                <Switch
                  checked={settings.requireApprovalToSpeak}
                  onCheckedChange={(checked) => setSettings({ ...settings, requireApprovalToSpeak: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">فلتر الكلمات غير المناسبة</Label>
                  <p className="text-sm text-gray-400">حذف الرسائل التي تحتوي على كلمات محظورة</p>
                </div>
                <Switch
                  checked={settings.profanityFilter}
                  onCheckedChange={(checked) => setSettings({ ...settings, profanityFilter: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-white">الوضع البطيء</Label>
                  <p className="text-sm text-gray-400">تحديد فترة انتظار بين الرسائل</p>
                </div>
                <Switch
                  checked={settings.slowMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, slowMode: checked })}
                />
              </div>

              {settings.slowMode && (
                <div className="space-y-2">
                  <Label>مدة الانتظار (بالثواني)</Label>
                  <Select
                    value={settings.slowModeDelay.toString()}
                    onValueChange={(value) => setSettings({ ...settings, slowModeDelay: Number.parseInt(value) })}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="5">5 ثوان</SelectItem>
                      <SelectItem value="10">10 ثوان</SelectItem>
                      <SelectItem value="30">30 ثانية</SelectItem>
                      <SelectItem value="60">دقيقة واحدة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Filtering */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">فلترة المحتوى</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>الكلمات المحظورة (مفصولة بفواصل)</Label>
                <Textarea
                  value={bannedWords}
                  onChange={(e) => setBannedWords(e.target.value)}
                  placeholder="كلمة1, كلمة2, كلمة3"
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>الحد الأقصى لطول الرسالة</Label>
                <Select
                  value={settings.maxMessageLength.toString()}
                  onValueChange={(value) => setSettings({ ...settings, maxMessageLength: Number.parseInt(value) })}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="100">100 حرف</SelectItem>
                    <SelectItem value="250">250 حرف</SelectItem>
                    <SelectItem value="500">500 حرف</SelectItem>
                    <SelectItem value="1000">1000 حرف</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>رسالة تحذير مخصصة</Label>
                <Input
                  value={warningMessage}
                  onChange={(e) => setWarningMessage(e.target.value)}
                  placeholder="يرجى الالتزام بقواعد الغرفة"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 bg-transparent"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  إرسال تحذير عام
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 bg-transparent"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  كتم مؤقت (5 دقائق)
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  حظر من الغرفة
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  الموافقة على التحدث
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Save Settings */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              إلغاء
            </Button>
            <Button onClick={handleSaveSettings} className="bg-purple-600 hover:bg-purple-700">
              حفظ الإعدادات
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
