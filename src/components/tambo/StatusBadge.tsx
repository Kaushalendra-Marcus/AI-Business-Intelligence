'use client'

import { z } from 'zod'
import { statusBadgeSchema } from '@/lib/tambo/schemas'
import { useEffect, useState } from 'react'

type StatusBadgeProps = z.infer<typeof statusBadgeSchema>

export default function StatusBadge({
  label = 'System Status',
  status = 'success',
  value = '',
  description = '',
  icon = '',
  lastUpdated = '',
  uptime = '',
  metrics = []
}: StatusBadgeProps) {
  const [currentTime, setCurrentTime] = useState<string>('')
  
  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
    }
    
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])
  
  const config = getStatusConfig(status)
  const displayValue = value || getDefaultValue(status)
  const displayDescription = description || getDefaultDescription(status)
  const displayLastUpdated = lastUpdated || 'just now'
  const displayUptime = uptime || getDefaultUptime(status)
  const displayMetrics = metrics.length > 0 
    ? metrics.slice(0, 3)
    : getDefaultMetrics(status)

  return (
    <div className={`border ${config.border} rounded-lg ${config.bg} shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col h-full min-h-[250px] max-h-[500px]`}>
      {/* Decorative background elements */}
      <div className={`absolute -right-12 -top-12 w-40 h-40 rounded-full ${config.iconBg} opacity-20 blur-2xl`}></div>
      <div className={`absolute -left-8 -bottom-8 w-32 h-32 rounded-full ${config.iconBg} opacity-10 blur-2xl`}></div>
      
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto p-6 relative z-10 min-h-0">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl ${config.iconBg} shadow-sm border ${config.border} backdrop-blur-sm`}>
              <div className={config.iconColor}>{config.icon}</div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2 flex-wrap gap-2">
                <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${config.badgeBg} ${config.badgeText} border ${config.border} min-w-[120px] text-center whitespace-nowrap shadow-sm`}>
                  {config.label}
                </span>
              </div>
              
              {/* Status Value */}
              {displayValue && (
                <div className="text-3xl font-bold text-gray-900 mt-3 mb-1 tracking-tight">{displayValue}</div>
              )}
            </div>
          </div>
          
          {/* Last Updated */}
          <div className="text-sm text-gray-600 bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-200 shadow-sm whitespace-nowrap">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div className="font-medium">{displayLastUpdated}</div>
                {currentTime && <div className="text-xs text-gray-500">{currentTime}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-gray-700 leading-relaxed mb-4">{displayDescription}</p>
          
          {/* Uptime */}
          {displayUptime && (
            <div className="flex items-center text-sm text-gray-600 bg-white/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-200 shadow-sm inline-flex">
              <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-medium mr-1">Uptime:</span>
              <span className="font-semibold">{displayUptime}</span>
            </div>
          )}
        </div>

        {/* Metrics Grid */}
        {displayMetrics.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center mb-3">
              <svg className="w-4 h-4 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h4 className="text-sm font-medium text-gray-700">Key Metrics</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {displayMetrics.map((metric, index) => (
                <div key={index} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="text-xs text-gray-500 mb-1.5">{metric.label}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold text-gray-900 tracking-tight">{metric.value}</div>
                    <div className="flex items-center">
                      <div className={`w-2.5 h-2.5 rounded-full mr-2 ${
                        metric.status === 'good' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}></div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        metric.status === 'good' ? 'bg-green-100 text-green-800' :
                        metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {metric.status === 'good' ? 'Good' :
                         metric.status === 'warning' ? 'Warning' : 'Critical'}
                      </span>
                    </div>
                  </div>
                  {/* Trend indicator (optional) */}
                  <div className="mt-2 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full ${
                      metric.status === 'good' ? 'bg-green-500' :
                      metric.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`} style={{ width: '85%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Indicator (Fixed at bottom, not scrollable) */}
      <div className="pt-5 px-6 pb-6 border-t border-gray-100 relative z-10 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className={`w-3.5 h-3.5 rounded-full mr-2 ${config.dot} shadow-sm`}></div>
              <span className="text-sm font-medium text-gray-700 mr-2">Status:</span>
              <span className={`text-sm font-semibold ${config.text} px-3 py-1 rounded-full ${config.badgeBg} border ${config.border} min-w-[100px] text-center`}>
                {config.label}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-gray-200 shadow-sm">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-medium">Secure</span>
            <svg className="w-4 h-4 ml-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions remain exactly the same
function getStatusConfig(status: string) {
  switch (status.toLowerCase()) {
    case 'success':
      return {
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
        text: 'text-green-700',
        border: 'border-green-200',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        label: 'Operational',
        badgeBg: 'bg-green-100',
        badgeText: 'text-green-700',
        dot: 'bg-green-500'
      }
    case 'warning':
      return {
        bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        label: 'Degraded',
        badgeBg: 'bg-yellow-100',
        badgeText: 'text-yellow-700',
        dot: 'bg-yellow-500'
      }
    case 'error':
      return {
        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
        text: 'text-red-700',
        border: 'border-red-200',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
        label: 'Critical',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-700',
        dot: 'bg-red-500'
      }
    case 'loading':
      return {
        bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        icon: (
          <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
        label: 'Loading',
        badgeBg: 'bg-blue-100',
        badgeText: 'text-blue-700',
        dot: 'bg-blue-500 animate-pulse'
      }
    default:
      return {
        bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Idle',
        badgeBg: 'bg-gray-100',
        badgeText: 'text-gray-700',
        dot: 'bg-gray-500'
      }
  }
}

function getDefaultValue(status: string): string {
  switch (status.toLowerCase()) {
    case 'success': return '99.9%'
    case 'warning': return '85.2%'
    case 'error': return '64.7%'
    case 'loading': return '...'
    default: return '100%'
  }
}

function getDefaultDescription(status: string): string {
  switch (status.toLowerCase()) {
    case 'success':
      return 'All systems operational. Performance metrics within expected ranges. No issues detected.'
    case 'warning':
      return 'Minor performance degradation detected. Some services may experience increased latency.'
    case 'error':
      return 'Critical issues detected. Immediate attention required. Some services may be unavailable.'
    case 'loading':
      return 'Systems are being initialized. Please wait while status checks complete.'
    default:
      return 'System is idle. Ready for operation when needed.'
  }
}

function getDefaultUptime(status: string): string {
  switch (status.toLowerCase()) {
    case 'success': return '99.99% (30 days)'
    case 'warning': return '98.7% (30 days)'
    case 'error': return '95.2% (30 days)'
    default: return '100% (30 days)'
  }
}

function getDefaultMetrics(status: string) {
  const baseMetrics = [
    { label: 'Response Time', value: '125ms', status: 'good' as const },
    { label: 'Error Rate', value: '0.12%', status: 'good' as const },
    { label: 'Throughput', value: '2.4k/s', status: 'good' as const }
  ]
  
  if (status === 'warning') {
    return [
      { label: 'Response Time', value: '425ms', status: 'warning' as const },
      { label: 'Error Rate', value: '1.8%', status: 'warning' as const },
      { label: 'Throughput', value: '1.2k/s', status: 'warning' as const }
    ]
  }
  
  if (status === 'error') {
    return [
      { label: 'Response Time', value: '2.4s', status: 'bad' as const },
      { label: 'Error Rate', value: '12.5%', status: 'bad' as const },
      { label: 'Throughput', value: '340/s', status: 'bad' as const }
    ]
  }
  
  return baseMetrics
}