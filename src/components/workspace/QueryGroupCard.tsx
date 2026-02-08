'use client'

import { useState } from 'react'
import { QueryGroup } from '@/lib/store/query-groups-store'

interface QueryGroupCardProps {
  group: QueryGroup
  isActive: boolean
  onToggle: () => void
  onRemove: () => void
  onActivate: () => void
}

export default function QueryGroupCard({
  group,
  isActive,
  onToggle,
  onRemove,
  onActivate
}: QueryGroupCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }
  
  // Truncate long queries
  const truncateQuery = (query: string, maxLength: number = 80) => {
    if (query.length <= maxLength) return query
    return query.substring(0, maxLength) + '...'
  }

  return (
    <div 
      className={`relative rounded-lg border transition-all duration-300 ${
        isActive 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onActivate}
    >
      {/* Color accent */}
      <div className={`absolute top-0 left-0 w-1 h-full rounded-l-lg ${group.color}`}></div>
      
      {/* Header */}
      <div className="pl-4 pr-3 py-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Query text */}
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <div className={`w-3 h-3 rounded-full ${group.color.replace('bg-gradient-to-r', 'bg')}`}></div>
              </div>
              <p className="text-sm font-medium text-gray-900 leading-snug">
                "{truncateQuery(group.userQuery)}"
              </p>
            </div>
            
            {/* Metadata */}
            <div className="flex items-center gap-3 mt-2 ml-5">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{formatTime(group.timestamp)}</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{group.company}</span>
              </div>
              
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                <span>{group.componentIds.length} components</span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {/* Collapse/Expand Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title={group.collapsed ? "Expand" : "Collapse"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {group.collapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                )}
              </svg>
            </button>
            
            {/* Remove button (shown on hover) */}
            {isHovered && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove()
                }}
                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                title="Remove query group"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -top-1 -right-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  )
}