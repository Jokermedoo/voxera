"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flag, Eye, CheckCircle, X } from "lucide-react"

export function RecentReports() {
  const reports = [
    {
      id: 1,
      type: "harassment",
      reporter: "سارة أحمد",
      reported: "محمد علي",
      description: "تحرش لفظي في الغرفة الصوتية",
      status: "pending",
      time: "منذ 5 دقائق",
      severity: "high",
    },
    {
      id: 2,
      type: "spam",
      reporter: "أحمد محمود",
      reported: "فاطمة سالم",
      description: "إرسال رسائل مزعجة متكررة",
      status: "investigating",
      time: "منذ 15 دقيقة",
      severity: "medium",
    },
    {
      id: 3,
      type: "inappropriate_content",
      reporter: "علي حسن",
      reported: "نور الدين",
      description: "محتوى غير لائق في الغرفة",
      status: "pending",
      time: "منذ 30 دقيقة",
      severity: "high",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "investigating":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "resolved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: "معلق",
      investigating: "قيد التحقيق",
      resolved: "محلول",
      dismissed: "مرفوض",
    }
    return labels[status as keyof typeof labels] || status
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      harassment: "تحرش",
      spam: "إزعاج",
      inappropriate_content: "محتوى غير لائق",
      fake_account: "حساب وهمي",
      other: "أخرى",
    }
    return labels[type as keyof typeof labels] || type
  }

  return (
    <Card className="bg-white/10 backdrop-blur-md border-white/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center">
          <Flag className="w-5 h-5 ml-2" />
          البلاغات الأخيرة
        </CardTitle>
        <Button variant="ghost" className="text-purple-300 hover:text-purple-200">
          عرض الكل
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2 space-x-reverse">
                <div className={`w-2 h-2 rounded-full ${getSeverityColor(report.severity)}`} />
                <Badge className={getStatusColor(report.status)}>{getStatusLabel(report.status)}</Badge>
                <span className="text-gray-400 text-xs">{getTypeLabel(report.type)}</span>
              </div>
              <span className="text-gray-400 text-xs">{report.time}</span>
            </div>

            <p className="text-white text-sm mb-3">{report.description}</p>

            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-400">
                <span>بلغ عنه: {report.reporter}</span>
                <span className="mx-2">•</span>
                <span>المبلغ عنه: {report.reported}</span>
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-green-400 hover:text-green-300">
                  <CheckCircle className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
