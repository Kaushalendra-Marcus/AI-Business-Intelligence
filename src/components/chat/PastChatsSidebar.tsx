'use client'

import { useState } from 'react'
import { useTamboThread } from '@tambo-ai/react'

interface ChatMessage {
  id: string
  title: string
  preview: string
  timestamp: string
  unread: boolean
  messageId: string
  role: 'user' | 'assistant' | 'system' | 'tool'
}

interface PastChatsSidebarProps {
  onClose?: () => void
}

export default function PastChatsSidebar({ onClose }: PastChatsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const { thread } = useTamboThread()

  // Convert thread messages to chat list format
  const chatMessages: ChatMessage[] = thread?.messages?.map((message, index) => {
    // Extract text content from message
    const getMessageContent = (content: any): string => {
      if (typeof content === 'string') return content
      if (Array.isArray(content)) {
        return content
          .filter(item => item?.type === 'text')
          .map(item => item.text)
          .join('\n')
      }
      if (content?.type === 'text') return content.text
      return ''
    }

    const content = getMessageContent(message.content)
    const messageDate = new Date(message.createdAt)
    const now = new Date()
    const diffMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60))

    // Format timestamp
    let timestamp: string
    if (diffMinutes < 1) {
      timestamp = 'just now'
    } else if (diffMinutes < 60) {
      timestamp = `${diffMinutes}m ago`
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60)
      timestamp = `${hours}h ago`
    } else {
      const days = Math.floor(diffMinutes / 1440)
      timestamp = `${days}d ago`
    }

    // Create title from first few words
    const words = content.split(' ').slice(0, 4).join(' ')
    const title = words.length > 0 ? `${words}...` : 'Message'

    // Preview (truncated content)
    const preview = content.length > 60
      ? content.substring(0, 60) + '...'
      : content || 'No content'

    return {
      id: message.id,
      title: `${message.role === 'user' ? 'You: ' : 'AI: '}${title}`,
      preview,
      timestamp,
      unread: index === thread.messages.length - 1, // Mark last message as "unread"
      messageId: message.id,
      role: message.role
    }
  }) || []

  // Filter messages based on search
  const filteredMessages = chatMessages.filter(msg =>
    msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    msg.preview.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Scroll to message in chat
  const handleChatClick = (messageId: string) => {
    const messageElement = document.getElementById(`message-${messageId}`)
    if (messageElement) {
      messageElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      })

      // Frosty blue glass effect
      messageElement.classList.add(
        'bg-gradient-to-br',
        'from-blue-50/95',       // Cool blue-white
        'via-sky-50/90',         // Sky blue tint
        'to-white/95',           // Back to white
        'border',
        'border-sky-200/50',     // Sky blue border
        'shadow-[0_0_0_1px_rgba(186,230,253,0.3)]', // Inner light blue border
        'shadow-[0_4px_20px_-2px_rgba(56,189,248,0.15)]', // Blue shadow
        'shadow-[0_8px_32px_0_rgba(14,165,233,0.08)]', // Deeper blue shadow
        'rounded-2xl',
        'backdrop-blur-[2px]'
      )

      // Create a shimmering effect
      const shimmer = document.createElement('div')
      shimmer.className = 'absolute inset-0 rounded-2xl pointer-events-none'
      shimmer.style.background = 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%)'
      shimmer.style.opacity = '0'
      shimmer.style.zIndex = '1'

      messageElement.style.position = 'relative'
      messageElement.appendChild(shimmer)

      // Animate the shimmer
      shimmer.animate(
        [
          { transform: 'translateX(-100%)', opacity: '0' },
          { transform: 'translateX(100%)', opacity: '0.7' },
          { transform: 'translateX(200%)', opacity: '0' }
        ],
        {
          duration: 1500,
          easing: 'ease-in-out'
        }
      )

      // Gentle floating animation
      messageElement.animate(
        [
          { transform: 'translateY(0px)' },
          { transform: 'translateY(-3px)' },
          { transform: 'translateY(0px)' }
        ],
        {
          duration: 1200,
          easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
        }
      )

      setTimeout(() => {
        // Remove shimmer element
        if (shimmer.parentNode) {
          shimmer.parentNode.removeChild(shimmer)
        }

        // Remove all added classes
        messageElement.classList.remove(
          'bg-gradient-to-br',
          'from-blue-50/95',
          'via-sky-50/90',
          'to-white/95',
          'border',
          'border-sky-200/50',
          'shadow-[0_0_0_1px_rgba(186,230,253,0.3)]',
          'shadow-[0_4px_20px_-2px_rgba(56,189,248,0.15)]',
          'shadow-[0_8px_32px_0_rgba(14,165,233,0.08)]',
          'rounded-2xl',
          'backdrop-blur-[2px]'
        )

        // Reset position style
        messageElement.style.position = ''
      }, 2200)
    }
  }
  return (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Hide sidebar"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <span className="text-sm font-semibold text-gray-900">Current Chat</span>
          </div>
          <div className="text-xs text-gray-500">
            {chatMessages.length} messages
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search in chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="p-2">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm text-gray-500">No messages yet</p>
              <p className="text-xs text-gray-400 mt-1">Start chatting to see messages here</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleChatClick(msg.messageId)}
                  className={`p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${msg.unread ? 'bg-blue-50 border border-blue-100' : ''
                    } ${msg.role === 'user' ? 'border-l-2 border-blue-500' : 'border-l-2 border-green-500'}`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${msg.role === 'user' ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                      <h3 className="text-sm font-medium text-gray-900 truncate flex-1">{msg.title}</h3>
                    </div>
                    {msg.unread && (
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full ml-1.5 mt-1"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mb-2">{msg.preview}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">{msg.timestamp}</span>
                    <span className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                      View
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></div>
              <span>User</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
              <span>AI</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {filteredMessages.length} of {chatMessages.length} shown
          </div>
        </div>
      </div>
    </div>
  )
}