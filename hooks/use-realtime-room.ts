"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

interface Participant {
  id: string
  user_id: string
  role: "host" | "co-host" | "speaker" | "listener"
  is_muted: boolean
  is_speaking: boolean
  joined_at: string
  profiles: {
    username: string
    display_name: string
    avatar_url: string | null
    is_verified: boolean
  }
}

interface ChatMessage {
  id: string
  room_id: string
  user_id: string
  message: string
  created_at: string
  profiles: {
    username: string
    display_name: string
    avatar_url: string | null
  }
}

export function useRealtimeRoom(roomId: string, initialParticipants: Participant[] = []) {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const setupRealtimeSubscription = async () => {
      // Create a channel for this room
      channel = supabase.channel(`room:${roomId}`)

      // Listen for participant changes
      channel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "room_participants",
            filter: `room_id=eq.${roomId}`,
          },
          async (payload) => {
            console.log("[v0] Participant change:", payload)

            if (payload.eventType === "INSERT") {
              // Fetch the new participant with profile data
              const { data: newParticipant } = await supabase
                .from("room_participants")
                .select(`
                  *,
                  profiles (username, display_name, avatar_url, is_verified)
                `)
                .eq("id", payload.new.id)
                .single()

              if (newParticipant) {
                setParticipants((prev) => [...prev, newParticipant])
              }
            } else if (payload.eventType === "DELETE") {
              setParticipants((prev) => prev.filter((p) => p.id !== payload.old.id))
            } else if (payload.eventType === "UPDATE") {
              setParticipants((prev) => prev.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } : p)))
            }
          },
        )
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_messages",
            filter: `room_id=eq.${roomId}`,
          },
          async (payload) => {
            console.log("[v0] New chat message:", payload)

            // Fetch the message with profile data
            const { data: newMessage } = await supabase
              .from("chat_messages")
              .select(`
                *,
                profiles (username, display_name, avatar_url)
              `)
              .eq("id", payload.new.id)
              .single()

            if (newMessage) {
              setChatMessages((prev) => [...prev, newMessage])
            }
          },
        )
        .on("presence", { event: "sync" }, () => {
          console.log("[v0] Presence sync")
          setIsConnected(true)
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          console.log("[v0] User joined:", key, newPresences)
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          console.log("[v0] User left:", key, leftPresences)
        })

      // Subscribe to the channel
      await channel.subscribe(async (status) => {
        console.log("[v0] Realtime connection status:", status)
        if (status === "SUBSCRIBED") {
          setIsConnected(true)

          // Track user presence
          const {
            data: { user },
          } = await supabase.auth.getUser()
          if (user) {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            })
          }
        }
      })

      // Load initial chat messages
      const { data: messages } = await supabase
        .from("chat_messages")
        .select(`
          *,
          profiles (username, display_name, avatar_url)
        `)
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(50)

      if (messages) {
        setChatMessages(messages)
      }
    }

    setupRealtimeSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [roomId, supabase])

  const updateParticipantStatus = async (participantId: string, updates: Partial<Participant>) => {
    try {
      const { error } = await supabase.from("room_participants").update(updates).eq("id", participantId)
      if (error) throw error
    } catch (error) {
      console.error("Error updating participant status:", error)
    }
  }

  const sendChatMessage = async (message: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { error } = await supabase.from("chat_messages").insert({
        room_id: roomId,
        user_id: user.id,
        message: message.trim(),
      })

      if (error) throw error
    } catch (error) {
      console.error("Error sending chat message:", error)
    }
  }

  return {
    participants,
    chatMessages,
    isConnected,
    updateParticipantStatus,
    sendChatMessage,
  }
}
