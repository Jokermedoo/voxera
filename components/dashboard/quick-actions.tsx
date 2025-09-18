"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, Users, Search, Calendar } from "lucide-react"
import Link from "next/link"

export function QuickActions() {
  const actions = [
    {
      title: "إنشاء غرفة",
      description: "ابدأ غرفة صوتية جديدة",
      icon: Mic,
      href: "/rooms/create",
      color: "from-purple-500 to-purple-600",
    },
    {
      title: "انضم لغرفة",
      description: "اكتشف الغرف النشطة",
      icon: Users,
      href: "/rooms",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "استكشف",
      description: "ابحث عن مستخدمين جدد",
      icon: Search,
      href: "/explore",
      color: "from-green-500 to-green-600",
    },
    {
      title: "الأحداث",
      description: "تصفح الأحداث القادمة",
      icon: Calendar,
      href: "/events",
      color: "from-yellow-500 to-yellow-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Link key={index} href={action.href}>
          <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-colors cursor-pointer">
            <CardContent className="p-6 text-center">
              <div
                className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}
              >
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">{action.title}</h3>
              <p className="text-gray-300 text-sm">{action.description}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
