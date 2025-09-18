"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import { AdminStatsCards } from "./admin-stats-cards"
import { RecentReports } from "./recent-reports"
import { ActiveRoomsAdmin } from "./active-rooms-admin"
import { UserActivityChart } from "./user-activity-chart"

export function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">لوحة التحكم الإدارية</h1>
        <p className="text-gray-300">مراقبة وإدارة منصة Voxera</p>
      </div>

      {/* Stats Cards */}
      <AdminStatsCards />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <UserActivityChart />
          <ActiveRoomsAdmin />
        </div>

        <div className="space-y-8">
          <RecentReports />

          {/* System Status */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CheckCircle className="w-5 h-5 ml-2 text-green-400" />
                حالة النظام
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">الخادم الرئيسي</span>
                <span className="text-green-400 text-sm">يعمل بشكل طبيعي</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">قاعدة البيانات</span>
                <span className="text-green-400 text-sm">متصلة</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">الصوت المباشر</span>
                <span className="text-green-400 text-sm">نشط</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">التخزين</span>
                <span className="text-yellow-400 text-sm">85% مستخدم</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
