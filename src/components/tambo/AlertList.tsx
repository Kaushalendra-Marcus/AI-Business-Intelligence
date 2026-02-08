'use client'

import { z } from 'zod'
import { alertListSchema } from '@/lib/tambo/schemas'

type AlertListProps = z.infer<typeof alertListSchema>

export default function AlertList({
  title = 'Business Alerts',
  alerts = [],
  autoRefresh = true,
  refreshInterval = 60,
  maxAlerts = 20,
  grouping
}: AlertListProps) {

  // Ensure we have valid alerts
  const validatedAlerts = Array.isArray(alerts) && alerts.length > 0
    ? alerts.slice(0, maxAlerts)
    : getDefaultAlerts()

  const groupedAlerts = groupAlerts(validatedAlerts, grouping)
  const criticalCount = validatedAlerts.filter(a => a.level === 'critical').length
  const warningCount = validatedAlerts.filter(a => a.level === 'warning').length
  const infoCount = validatedAlerts.filter(a => a.level === 'info').length

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full min-h-[250px] max-h-[500px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              {validatedAlerts.length} active alert{validatedAlerts.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium text-red-700">{criticalCount}</span>
              </div>
            )}
            {warningCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-full">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-xs font-medium text-yellow-700">{warningCount}</span>
              </div>
            )}
            {infoCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-full">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-medium text-blue-700">{infoCount}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alerts Container - Fixed Height with Scroll */}
      <div className="flex-1 overflow-y-auto scrollbar-thin min-h-[150px]">
        {grouping ? (
          Object.entries(groupedAlerts).map(([group, groupAlerts]) => (
            <div key={group} className="p-4 border-b border-gray-100 last:border-b-0">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 capitalize">{group}</h3>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {groupAlerts.length} alert{groupAlerts.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-3">
                {groupAlerts.map((alert, index) => (
                  <div key={index} className="p-3 bg-gray-50/50 rounded-lg border border-gray-200 hover:bg-gray-100/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${getLevelColor(alert.level)}`}></div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900 text-sm">{alert.title}</h4>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getLevelBadgeClass(alert.level)}`}>
                            {alert.level}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{alert.description}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {alert.timestamp}
                          </span>
                          {alert.status && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusClass(alert.status)}`}>
                              {alert.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4">
            <div className="space-y-3">
              {validatedAlerts.map((alert, index) => (
                <div key={index} className="p-3 bg-gray-50/50 rounded-lg border border-gray-200 hover:bg-gray-100/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 ${getLevelColor(alert.level)}`}></div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-900 text-sm">{alert.title}</h4>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getLevelBadgeClass(alert.level)}`}>
                          {alert.level}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1.5 line-clamp-2">{alert.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {alert.timestamp}
                        </span>
                        {alert.status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusClass(alert.status)}`}>
                            {alert.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-600">
            <svg className="w-3.5 h-3.5 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {autoRefresh ? `Auto-refresh: ${refreshInterval}s` : 'Manual refresh'}
          </div>
          <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1 rounded transition-colors">
            View All
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper function to get level color
function getLevelColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'critical': return 'bg-red-500 animate-pulse';
    case 'warning': return 'bg-yellow-500';
    case 'info': return 'bg-blue-500';
    default: return 'bg-gray-400';
  }
}

// Helper function to get level badge class
function getLevelBadgeClass(level: string): string {
  switch (level.toLowerCase()) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'warning': return 'bg-yellow-100 text-yellow-800';
    case 'info': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Helper function to get status class
function getStatusClass(status: string): string {
  switch (status.toLowerCase()) {
    case 'new': return 'bg-blue-100 text-blue-800';
    case 'in-progress': return 'bg-yellow-100 text-yellow-800';
    case 'resolved': return 'bg-green-100 text-green-800';
    case 'acknowledged': return 'bg-purple-100 text-purple-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Helper functions (unchanged)
function getDefaultAlerts() {
  return [
    {
      title: 'Revenue Drop Detected',
      description: 'Monthly revenue decreased by 15% compared to last month. Immediate review recommended.',
      level: 'critical',
      timestamp: '2 hours ago',
      action: 'Review sales pipeline',
      category: 'Finance',
      assignedTo: 'Sales Team',
      status: 'new'
    },
    {
      title: 'High Customer Churn',
      description: 'Customer retention rate dropped to 85%. Investigate customer feedback and satisfaction metrics.',
      level: 'warning',
      timestamp: '5 hours ago',
      action: 'Analyze churn reasons',
      category: 'Customer Success',
      status: 'in-progress'
    },
    {
      title: 'System Monitoring Active',
      description: 'All systems are functioning normally with no critical issues detected.',
      level: 'info',
      timestamp: 'Just now',
      action: 'Continue monitoring',
      category: 'Operations',
      status: 'acknowledged'
    },
    {
      title: 'Data Sync Completed',
      description: 'Latest business data has been synchronized successfully from all sources.',
      level: 'info',
      timestamp: '15 minutes ago',
      action: 'Review data',
      category: 'Data',
      status: 'resolved'
    },
    {
      title: 'API Response Time High',
      description: 'Average API response time increased to 2.5s, exceeding the 1s threshold.',
      level: 'warning',
      timestamp: '1 hour ago',
      action: 'Check server load',
      category: 'Performance',
      status: 'investigating'
    },
    {
      title: 'Security Audit Passed',
      description: 'Monthly security audit completed with no vulnerabilities found.',
      level: 'info',
      timestamp: '1 day ago',
      action: 'Continue monitoring',
      category: 'Security',
      status: 'resolved'
    }
  ]
}

function groupAlerts(alerts: any[], grouping?: 'level' | 'category' | 'status') {
  if (!grouping) return { 'All Alerts': alerts }

  const groups: Record<string, any[]> = {}

  alerts.forEach(alert => {
    const key = alert[grouping] || 'Other'
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(alert)
  })

  return groups
}