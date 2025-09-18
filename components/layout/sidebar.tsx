"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Mic, Users, Search, Bell, Settings, TrendingUp, Calendar, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "الرئيسية", href: "/dashboard", icon: Home },
  { name: "الغرف", href: "/rooms", icon: Mic },
  { name: "الاستكشاف", href: "/explore", icon: Search },
  { name: "المتابعون", href: "/following", icon: Users },
  { name: "الإشعارات", href: "/notifications", icon: Bell },
  { name: "الترندات", href: "/trending", icon: TrendingUp },
  { name: "الأحداث", href: "/events", icon: Calendar },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 right-4 z-50 bg-white/10 backdrop-blur-md text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-40 w-64 bg-black/20 backdrop-blur-xl border-l border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link href="/dashboard" className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Voxera</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 space-x-reverse px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-white border border-purple-500/30"
                      : "text-gray-300 hover:text-white hover:bg-white/10",
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/10">
            <Link
              href="/profile/edit"
              className="flex items-center space-x-3 space-x-reverse p-3 rounded-lg hover:bg-white/10 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">U</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">المستخدم</p>
                <p className="text-xs text-gray-400 truncate">@username</p>
              </div>
              <Settings className="w-4 h-4 text-gray-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
