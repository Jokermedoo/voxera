"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { BarChart3, Plus, Vote, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Poll {
  id: string
  room_id: string
  creator_id: string
  question: string
  options: string[]
  is_active: boolean
  ends_at: string | null
  created_at: string
  votes?: { [key: number]: number }
  user_vote?: number
}

interface LivePollsProps {
  roomId: string
  currentUserId: string
  canCreatePolls: boolean
}

export function LivePolls({ roomId, currentUserId, canCreatePolls }: LivePollsProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [polls, setPolls] = useState<Poll[]>([])
  const [activePoll, setActivePoll] = useState<Poll | null>(null)
  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""],
    duration: "5",
  })

  useEffect(() => {
    loadPolls()
    subscribeToPolls()
  }, [roomId])

  const loadPolls = async () => {
    try {
      const supabase = createClient()
      const { data: pollsData, error } = await supabase
        .from("polls")
        .select("*")
        .eq("room_id", roomId)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Load votes for each poll
      const pollsWithVotes = await Promise.all(
        (pollsData || []).map(async (poll) => {
          const { data: votes } = await supabase.from("poll_votes").select("option_index").eq("poll_id", poll.id)

          const { data: userVote } = await supabase
            .from("poll_votes")
            .select("option_index")
            .eq("poll_id", poll.id)
            .eq("user_id", currentUserId)
            .single()

          const voteCounts: { [key: number]: number } = {}
          votes?.forEach((vote) => {
            voteCounts[vote.option_index] = (voteCounts[vote.option_index] || 0) + 1
          })

          return {
            ...poll,
            votes: voteCounts,
            user_vote: userVote?.option_index,
          }
        }),
      )

      setPolls(pollsWithVotes)
      const active = pollsWithVotes.find((p) => p.is_active)
      setActivePoll(active || null)
    } catch (error) {
      console.error("Error loading polls:", error)
    }
  }

  const subscribeToPolls = () => {
    const supabase = createClient()
    const channel = supabase
      .channel(`polls:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "polls",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          loadPolls()
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "poll_votes",
        },
        () => {
          loadPolls()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleCreatePoll = async () => {
    if (!newPoll.question.trim() || newPoll.options.some((opt) => !opt.trim())) return

    try {
      const supabase = createClient()
      const endsAt = new Date(Date.now() + Number.parseInt(newPoll.duration) * 60000).toISOString()

      const { error } = await supabase.from("polls").insert({
        room_id: roomId,
        creator_id: currentUserId,
        question: newPoll.question,
        options: newPoll.options.filter((opt) => opt.trim()),
        ends_at: endsAt,
      })

      if (error) throw error

      setIsCreateOpen(false)
      setNewPoll({ question: "", options: ["", ""], duration: "5" })
      loadPolls()
    } catch (error) {
      console.error("Error creating poll:", error)
    }
  }

  const handleVote = async (pollId: string, optionIndex: number) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("poll_votes").insert({
        poll_id: pollId,
        user_id: currentUserId,
        option_index: optionIndex,
      })

      if (error) throw error
      loadPolls()
    } catch (error) {
      console.error("Error voting:", error)
    }
  }

  const handleEndPoll = async (pollId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("polls").update({ is_active: false }).eq("id", pollId)

      if (error) throw error
      loadPolls()
    } catch (error) {
      console.error("Error ending poll:", error)
    }
  }

  const addOption = () => {
    if (newPoll.options.length < 6) {
      setNewPoll({ ...newPoll, options: [...newPoll.options, ""] })
    }
  }

  const removeOption = (index: number) => {
    if (newPoll.options.length > 2) {
      const newOptions = newPoll.options.filter((_, i) => i !== index)
      setNewPoll({ ...newPoll, options: newOptions })
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...newPoll.options]
    newOptions[index] = value
    setNewPoll({ ...newPoll, options: newOptions })
  }

  return (
    <>
      {canCreatePolls && (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
              <BarChart3 className="h-4 w-4 mr-2" />
              إنشاء استطلاع
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                إنشاء استطلاع مباشر
              </DialogTitle>
              <DialogDescription className="text-gray-400">اطرح سؤالاً واحصل على آراء المشاركين</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>السؤال</Label>
                <Input
                  value={newPoll.question}
                  onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                  placeholder="ما رأيكم في...؟"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label>الخيارات</Label>
                {newPoll.options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder={`الخيار ${index + 1}`}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                    {newPoll.options.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {newPoll.options.length < 6 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="border-gray-600 text-white hover:bg-gray-700 bg-transparent"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة خيار
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label>مدة الاستطلاع (بالدقائق)</Label>
                <select
                  value={newPoll.duration}
                  onChange={(e) => setNewPoll({ ...newPoll, duration: e.target.value })}
                  className="w-full p-2 rounded bg-gray-800 border border-gray-600 text-white"
                >
                  <option value="1">دقيقة واحدة</option>
                  <option value="5">5 دقائق</option>
                  <option value="10">10 دقائق</option>
                  <option value="30">30 دقيقة</option>
                </select>
              </div>

              <Button
                onClick={handleCreatePoll}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                إنشاء الاستطلاع
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Active Poll Display */}
      {activePoll && (
        <div className="fixed top-20 right-6 z-50 w-80">
          <Card className="bg-gray-900/95 backdrop-blur-lg border-gray-700 shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Vote className="h-5 w-5" />
                  استطلاع مباشر
                </CardTitle>
                {activePoll.creator_id === currentUserId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEndPoll(activePoll.id)}
                    className="text-red-400 hover:bg-red-500/20 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-white font-medium">{activePoll.question}</h3>
              <div className="space-y-3">
                {activePoll.options.map((option, index) => {
                  const voteCount = activePoll.votes?.[index] || 0
                  const totalVotes = Object.values(activePoll.votes || {}).reduce((a, b) => a + b, 0)
                  const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0
                  const hasVoted = activePoll.user_vote !== undefined
                  const isUserChoice = activePoll.user_vote === index

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-white text-sm">{option}</span>
                        <span className="text-gray-400 text-xs">
                          {voteCount} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      {hasVoted ? (
                        <Progress
                          value={percentage}
                          className={`h-2 ${isUserChoice ? "bg-purple-500/20" : "bg-gray-700"}`}
                        />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVote(activePoll.id, index)}
                          className="w-full border-gray-600 text-white hover:bg-purple-500/20 hover:border-purple-500"
                        >
                          تصويت
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
              {activePoll.user_vote !== undefined && (
                <div className="text-center text-xs text-green-400">تم تسجيل صوتك بنجاح</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}
