"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"

import ChatInterface from "@/components/chat/ChatInterface"
import PastChatsSidebar from "@/components/chat/PastChatsSidebar"
import { useWorkspaceStore } from "@/lib/store/workspace-store"
import { ErrorBoundary } from "@/components/ErrorBoundary"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const activeComponentCount = useWorkspaceStore(
    state => state.activeComponentCount
  )

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="h-full flex bg-white">
      {/* Left Sidebar */}
      {sidebarOpen && (
        <div className="w-64 border-r border-gray-200 bg-white flex-shrink-0">
          <ErrorBoundary>
            <PastChatsSidebar onClose={() => setSidebarOpen(false)} />
          </ErrorBoundary>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Show sidebar"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                </button>
              )}

              {/* Logo + Title */}
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  priority
                  className="rounded-md"
                />

                <h1 className="text-lg font-semibold text-gray-900">
                  AI Business Intelligence
                </h1>
              </div>

              {mounted && activeComponentCount > 0 && (
                <div className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                  {activeComponentCount} component
                  {activeComponentCount !== 1 ? "s" : ""}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                New Chat
              </button>
            </div>
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 min-h-0">
          <ErrorBoundary>
            <Suspense fallback={<ChatLoadingSkeleton />}>
              <ChatInterface />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}

function ChatLoadingSkeleton() {
  return (
    <div className="h-full p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div
              className={`h-16 ${
                i % 2 === 0 ? "bg-gray-200" : "bg-gray-100"
              } rounded-lg`}
            ></div>
          </div>
        ))}
      </div>
    </div>
  )
}
