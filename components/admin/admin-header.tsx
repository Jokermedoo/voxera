"use client"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, AlertTriangle, Users, Activity } from "lucide-react"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-30 bg-black/30 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="ابحث في لوحة الإدارة..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-10"
            />
          </div>
        </div>

        {/* Admin Stats */}
        <div className="flex items-center space-x-6 space-x-reverse">
          <div className="flex items-center space-x-2 space-x-reverse">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm">5 بلاغات جديدة</span>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-white text-sm">1,234 مستخدم نشط</span>
          </div>

          <div className="flex items-center space-x-2 space-x-reverse">
            <Activity className="w-4 h-4 text-green-400" />
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">النظام يعمل</Badge>
          </div>
        </div>
      </div>
    </header>
  )
}
