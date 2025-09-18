"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Volume2, Play, Pause } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SoundEffect {
  id: string
  name: string
  audio_url: string
  icon: string
  category: string
}

interface SoundEffectsProps {
  roomId: string
  canPlaySounds: boolean
}

export function SoundEffects({ roomId, canPlaySounds }: SoundEffectsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [soundEffects, setSoundEffects] = useState<SoundEffect[]>([])
  const [playingSound, setPlayingSound] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({})

  useEffect(() => {
    loadSoundEffects()
  }, [])

  const loadSoundEffects = async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.from("sound_effects").select("*").order("category", { ascending: true })

      if (error) throw error
      setSoundEffects(data || [])

      // Preload audio elements
      const audioMap: { [key: string]: HTMLAudioElement } = {}
      data?.forEach((effect) => {
        const audio = new Audio(effect.audio_url)
        audio.preload = "metadata"
        audioMap[effect.id] = audio
      })
      setAudioElements(audioMap)
    } catch (error) {
      console.error("Error loading sound effects:", error)
    }
  }

  const playSound = async (soundEffect: SoundEffect) => {
    if (!canPlaySounds) return

    try {
      const audio = audioElements[soundEffect.id]
      if (!audio) return

      // Stop any currently playing sound
      if (playingSound) {
        const currentAudio = audioElements[playingSound]
        currentAudio?.pause()
        currentAudio.currentTime = 0
      }

      setPlayingSound(soundEffect.id)
      audio.currentTime = 0
      await audio.play()

      audio.onended = () => {
        setPlayingSound(null)
      }

      // Send sound effect to room
      const supabase = createBrowserClient()
      await supabase.from("chat_messages").insert({
        room_id: roomId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        message: `شغل مؤثر صوتي: ${soundEffect.name}`,
        message_type: "system",
        metadata: {
          type: "sound_effect",
          sound_id: soundEffect.id,
          sound_name: soundEffect.name,
          sound_icon: soundEffect.icon,
        },
      })
    } catch (error) {
      console.error("Error playing sound:", error)
      setPlayingSound(null)
    }
  }

  const stopSound = (soundId: string) => {
    const audio = audioElements[soundId]
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setPlayingSound(null)
  }

  const groupedEffects = soundEffects.reduce(
    (acc, effect) => {
      if (!acc[effect.category]) {
        acc[effect.category] = []
      }
      acc[effect.category].push(effect)
      return acc
    },
    {} as { [key: string]: SoundEffect[] },
  )

  const categoryLabels: { [key: string]: string } = {
    reactions: "تفاعلات",
    music: "موسيقى",
    effects: "مؤثرات",
    notifications: "تنبيهات",
  }

  if (!canPlaySounds) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10 bg-transparent">
          <Volume2 className="h-4 w-4 mr-2" />
          مؤثرات صوتية
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            المؤثرات الصوتية
          </DialogTitle>
          <DialogDescription className="text-gray-400">اختر مؤثر صوتي لتشغيله في الغرفة</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(groupedEffects).map(([category, effects]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-white font-medium">{categoryLabels[category] || category}</h4>
              <div className="grid grid-cols-2 gap-3">
                {effects.map((effect) => (
                  <div
                    key={effect.id}
                    className="p-4 rounded-lg border border-gray-600 bg-gray-800 hover:border-gray-500 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{effect.icon}</span>
                        <div>
                          <div className="text-sm font-medium text-white">{effect.name}</div>
                          <div className="text-xs text-gray-400">{categoryLabels[effect.category]}</div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={playingSound === effect.id ? "destructive" : "default"}
                        onClick={() => (playingSound === effect.id ? stopSound(effect.id) : playSound(effect))}
                        className="h-8 w-8 p-0"
                      >
                        {playingSound === effect.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
