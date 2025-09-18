"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Heart, Star, Zap, Crown, Sparkles } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Participant {
  id: string
  user_id: string
  profiles: {
    username: string
    display_name: string
    avatar_url: string | null
  }
}

interface GiftsPanelProps {
  roomId: string
  participants: Participant[]
  currentUserId: string
}

const giftIcons: { [key: string]: any } = {
  "❤️": Heart,
  "⭐": Star,
  "🔥": Zap,
  "💎": Sparkles,
  "👑": Crown,
  "🚀": Zap,
  "👏": Star,
  "🌹": Heart,
}

export function GiftsPanel({ roomId, participants, currentUserId }: GiftsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [gifts, setGifts] = useState<any[]>([])
  const [selectedGift, setSelectedGift] = useState<any | null>(null)
  const [selectedRecipient, setSelectedRecipient] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [isLoading, setIsLoading] = useState(false)
  const [recentGifts, setRecentGifts] = useState<any[]>([])

  useEffect(() => {
    loadGifts()
    loadRecentGifts()
  }, [])

  const loadGifts = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("gifts").select("*").order("price", { ascending: true })

      if (error) throw error
      setGifts(data || [])
    } catch (error) {
      console.error("Error loading gifts:", error)
    }
  }

  const loadRecentGifts = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("gift_transactions")
        .select(`
          *,
          gifts (name, icon),
          sender:sender_id (display_name, avatar_url),
          receiver:receiver_id (display_name, avatar_url)
        `)
        .eq("room_id", roomId)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      setRecentGifts(data || [])
    } catch (error) {
      console.error("Error loading recent gifts:", error)
    }
  }

  const handleSendGift = async () => {
    if (!selectedGift || !selectedRecipient) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.from("gift_transactions").insert({
        gift_id: selectedGift.id,
        sender_id: currentUserId,
        receiver_id: selectedRecipient,
        room_id: roomId,
        quantity: Number.parseInt(quantity),
      })

      if (error) throw error

      // Send system message about the gift
      const recipient = participants.find((p) => p.user_id === selectedRecipient)
      await supabase.from("chat_messages").insert({
        room_id: roomId,
        user_id: currentUserId,
        message: `أرسل ${selectedGift.name} إلى ${recipient?.profiles.display_name}`,
        message_type: "gift",
        metadata: {
          gift_id: selectedGift.id,
          gift_name: selectedGift.name,
          gift_icon: selectedGift.icon,
          recipient_id: selectedRecipient,
          quantity: Number.parseInt(quantity),
        },
      })

      setIsOpen(false)
      setSelectedGift(null)
      setSelectedRecipient("")
      setQuantity("1")
      loadRecentGifts()
    } catch (error) {
      console.error("Error sending gift:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
            <Heart className="h-5 w-5 mr-2" />
            هدايا
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              إرسال هدية
            </DialogTitle>
            <DialogDescription className="text-gray-400">اختر هدية وأرسلها لأحد المشاركين</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Gift Selection */}
            <div className="space-y-3">
              <h4 className="text-white font-medium">اختر الهدية</h4>
              <div className="grid grid-cols-4 gap-3">
                {gifts.map((gift) => {
                  const IconComponent = giftIcons[gift.icon] || Heart
                  return (
                    <div
                      key={gift.id}
                      className={`p-4 rounded-lg border cursor-pointer transition-all text-center ${
                        selectedGift?.id === gift.id
                          ? "border-purple-500 bg-purple-500/20"
                          : "border-gray-600 bg-gray-800 hover:border-gray-500"
                      }`}
                      onClick={() => setSelectedGift(gift)}
                    >
                      <div className="text-2xl mb-2">{gift.icon}</div>
                      <div className="text-sm font-medium text-white">{gift.name}</div>
                      <div className="text-xs text-purple-400">{gift.price} نقطة</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recipient Selection */}
            {selectedGift && (
              <div className="space-y-3">
                <h4 className="text-white font-medium">اختر المستلم</h4>
                <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="اختر مشارك" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {participants
                      .filter((p) => p.user_id !== currentUserId)
                      .map((participant) => (
                        <SelectItem key={participant.user_id} value={participant.user_id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={participant.profiles.avatar_url || undefined} />
                              <AvatarFallback className="bg-purple-500 text-white text-xs">
                                {participant.profiles.display_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            {participant.profiles.display_name}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity Selection */}
            {selectedGift && selectedRecipient && (
              <div className="space-y-3">
                <h4 className="text-white font-medium">الكمية</h4>
                <Select value={quantity} onValueChange={setQuantity}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-sm text-gray-400">
                  المجموع: {selectedGift.price * Number.parseInt(quantity)} نقطة
                </div>
              </div>
            )}

            {/* Send Button */}
            {selectedGift && selectedRecipient && (
              <Button
                onClick={handleSendGift}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? "جاري الإرسال..." : "إرسال الهدية"}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Recent Gifts Display */}
      {recentGifts.length > 0 && (
        <div className="fixed bottom-20 left-6 z-40">
          <Card className="bg-gray-900/95 backdrop-blur-lg border-gray-700 w-80">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm">الهدايا الأخيرة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-40 overflow-y-auto">
              {recentGifts.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center gap-2 text-xs">
                  <span className="text-lg">{transaction.gifts.icon}</span>
                  <span className="text-white">{transaction.sender.display_name}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-purple-300">{transaction.receiver.display_name}</span>
                  {transaction.quantity > 1 && (
                    <Badge className="bg-purple-500/20 text-purple-300 text-xs">×{transaction.quantity}</Badge>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
