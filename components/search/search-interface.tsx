"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Users, Mic, Hash } from "lucide-react"

interface SearchInterfaceProps {
  initialQuery: string
  initialType: string
}

export function SearchInterface({ initialQuery, initialType }: SearchInterfaceProps) {
  const [query, setQuery] = useState(initialQuery)
  const [activeType, setActiveType] = useState(initialType)
  const router = useRouter()
  const searchParams = useSearchParams()

  const searchTypes = [
    { key: "all", label: "الكل", icon: Search },
    { key: "users", label: "المستخدمون", icon: Users },
    { key: "rooms", label: "الغرف", icon: Mic },
    { key: "topics", label: "المواضيع", icon: Hash },
  ]

  const handleSearch = (newQuery?: string, newType?: string) => {
    const searchQuery = newQuery !== undefined ? newQuery : query
    const searchType = newType !== undefined ? newType : activeType

    const params = new URLSearchParams(searchParams.toString())

    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }

    if (searchType && searchType !== "all") {
      params.set("type", searchType)
    } else {
      params.delete("type")
    }

    router.push(`/explore?${params.toString()}`)
  }

  const handleTypeChange = (type: string) => {
    setActiveType(type)
    handleSearch(undefined, type)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن الغرف، المستخدمين، أو المواضيع..."
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 pr-12 pl-4 h-12 text-lg"
        />
        <Button
          type="submit"
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
        >
          بحث
        </Button>
      </form>

      {/* Search Type Filters */}
      <div className="flex items-center space-x-4 space-x-reverse overflow-x-auto pb-2">
        {searchTypes.map((type) => {
          const Icon = type.icon
          const isActive = activeType === type.key

          return (
            <Button
              key={type.key}
              variant={isActive ? "default" : "outline"}
              onClick={() => handleTypeChange(type.key)}
              className={
                isActive
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 whitespace-nowrap"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20 whitespace-nowrap"
              }
            >
              <Icon className="w-4 h-4 ml-2" />
              {type.label}
            </Button>
          )
        })}
      </div>

      {/* Active Search Info */}
      {query && (
        <div className="flex items-center space-x-2 space-x-reverse">
          <span className="text-gray-300">نتائج البحث عن:</span>
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">"{query}"</Badge>
          {activeType !== "all" && (
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
              {searchTypes.find((t) => t.key === activeType)?.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
