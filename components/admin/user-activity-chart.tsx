"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function UserActivityChart() {
  const data = [
    { name: "السبت", users: 1200, rooms: 45 },
    { name: "الأحد", users: 1100, rooms: 38 },
    { name: "الاثنين", users: 1400, rooms: 52 },
    { name: "الثلاثاء", users: 1300, rooms: 48 },
    { name: "الأربعاء", users: 1500, rooms: 58 },
    { name: "الخميس", users: 1600, rooms: 62 },
    { name: "الجمعة", users: 1800, rooms: 71 },
  ]

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader>
        <CardTitle className="text-white">نشاط المستخدمين الأسبوعي</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                color: "white",
              }}
            />
            <Bar dataKey="users" fill="#8B5CF6" name="المستخدمون النشطون" />
            <Bar dataKey="rooms" fill="#3B82F6" name="الغرف النشطة" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
