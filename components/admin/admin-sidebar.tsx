"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Shield, Users, Mic, Flag, BarChart3, Settings, Home, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "لوحة التحكم", href: "/admin", icon: BarChart3 },
  { name: "إدارة المستخدمين", href: "/admin/users", icon: Users },
  { name: "إدارة الغرف", href: "/admin/rooms", icon: Mic },
  { name: "البلاغات", href: "/admin/reports", icon: Flag },
  { name: "الإعدادات", href: "/admin/settings", icon: Settings },
  { name: "العودة للتطبيق", href: "/dashboard", icon: Home },
]

export function AdminSidebar() {
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
          "fixed inset-y-0 right-0 z-40 w-64 bg-black/30 backdrop-blur-xl border-l border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">لوحة الإدارة</span>
                <p className="text-xs text-gray-400">Voxera Admin</p>
              </div>
            </div>
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
                      ? "bg-gradient-to-r from-red-500/20 to-orange-500/20 text-white border border-red-500/30"
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

          {/* Admin Info */}
          <div className="p-4 border-t border-white/10">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Shield className="w-4 h-4 text-red-400" />
                <span className="text-red-400 text-sm font-medium">وضع الإدارة</span>
              </div>
              <p className="text-gray-400 text-xs mt-1">لديك صلاحيات إدارية كاملة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
