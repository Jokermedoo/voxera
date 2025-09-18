"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Bell, Plus } from "lucide-react"
import Link from "next/link"
import { useNotifications } from "@/hooks/use-notifications"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export function TopNavigation() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const { unreadCount } = useNotifications(user?.id)

  return (
    <header className="sticky top-0 z-30 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ابحث عن الغرف أو المستخدمين..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Create Room Button */}
          <Link href="/rooms/create">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white">
              <Plus className="w-4 h-4 ml-2" />
              إنشاء غرفة
            </Button>
          </Link>

          {/* Notifications */}
          <Link href="/notifications">
            <Button variant="ghost" size="icon" className="relative text-gray-300 hover:text-white">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -left-1 w-5 h-5 p-0 bg-red-500 text-white text-xs flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
