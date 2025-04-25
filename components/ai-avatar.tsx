"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface AIAvatarProps {
  speaking: boolean
  size?: "sm" | "md" | "lg" | "xl"
  name?: string
}

export function AIAvatar({ speaking, size = "md", name = "AI Assistant" }: AIAvatarProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0)

  // Dynamic sizing based on the size prop
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-24 w-24",
    xl: "h-32 w-32",
  }

  const badgeSizes = {
    sm: "text-[8px] px-1.5 py-0",
    md: "text-xs px-2 py-0.5",
    lg: "text-xs px-2 py-0.5",
    xl: "text-sm px-3 py-1",
  }

  // Simulate speaking animation
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (speaking) {
      interval = setInterval(() => {
        setPulseIntensity(Math.random())
      }, 150)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [speaking])

  return (
    <div className="relative inline-block">
      <Avatar className={`${sizeClasses[size]} ${speaking ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}>
        <AvatarImage src="/placeholder.svg?height=96&width=96" alt={name} />
        <AvatarFallback className="bg-blue-100 text-blue-800">
          {name
            .split(" ")
            .map((word) => word[0])
            .join("")}
        </AvatarFallback>
      </Avatar>

      {speaking && (
        <>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <Badge variant="default" className={`${badgeSizes[size]} animate-pulse`}>
              Speaking...
            </Badge>
          </div>

          {/* Sound wave visualization */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center justify-center space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 bg-blue-500 rounded-full"
                  style={{
                    height: `${4 + (pulseIntensity * 8) + (i % 3) * 2}px`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
