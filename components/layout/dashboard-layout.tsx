"use client"

import type { ReactNode } from "react"
import { Sidebar } from "./sidebar"
import { TopNavigation } from "./top-navigation"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-1 lg:mr-64">
          <TopNavigation />
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
