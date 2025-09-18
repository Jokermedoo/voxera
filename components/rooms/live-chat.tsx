"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, MessageCircle } from "lucide-react"

interface ChatMessage {
  id: string
  room_id: string
  user_id: string
  message: string
  message_type: "text" | "system" | "gift" | "reaction"
  created_at: string
  profiles: {
    username: string
    display_name: string
    avatar_url: string | null
  }
}

interface LiveChatProps {
  messages: ChatMessage[]
  onSendMessage: (message: string) => void
  currentUserId: string
}

export function LiveChat({ messages, onSendMessage, currentUserId }: LiveChatProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isExpanded, setIsExpanded] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage("")
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (!isExpanded) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsExpanded(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg"
        >
          <MessageCircle className="h-6 w-6" />
          {messages.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center">
              {messages.length > 99 ? "99+" : messages.length}
            </span>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80">
      <Card className="bg-gray-900/95 backdrop-blur-lg border-gray-700 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              الدردشة المباشرة
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-white h-8 w-8 p-0"
            >
              ×
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-80 px-4" ref={scrollAreaRef}>
            <div className="space-y-3 pb-4">
              {messages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 text-sm">لا توجد رسائل بعد</p>
                  <p className="text-gray-500 text-xs mt-1">كن أول من يبدأ المحادثة!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.user_id === currentUserId
                  const isSystemMessage = message.message_type === "system"

                  if (isSystemMessage) {
                    return (
                      <div key={message.id} className="text-center py-2">
                        <p className="text-gray-400 text-xs bg-gray-800 rounded-full px-3 py-1 inline-block">
                          {message.message}
                        </p>
                      </div>
                    )
                  }

                  return (
                    <div key={message.id} className={`flex gap-2 ${isOwnMessage ? "flex-row-reverse" : ""}`}>
                      {!isOwnMessage && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={message.profiles.avatar_url || undefined} />
                          <AvatarFallback className="bg-purple-500 text-white text-xs">
                            {message.profiles.display_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`flex-1 ${isOwnMessage ? "text-right" : ""}`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-300 text-xs font-medium">
                            {isOwnMessage ? "أنت" : message.profiles.display_name}
                          </span>
                          <span className="text-gray-500 text-xs">{formatTime(message.created_at)}</span>
                        </div>
                        <div
                          className={`rounded-lg px-3 py-2 text-sm max-w-xs ${
                            isOwnMessage ? "bg-purple-600 text-white ml-auto" : "bg-gray-700 text-gray-100 mr-auto"
                          }`}
                        >
                          {message.message}
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-gray-700 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="اكتب رسالتك..."
                className="bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 text-sm"
                maxLength={500}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!newMessage.trim()}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
