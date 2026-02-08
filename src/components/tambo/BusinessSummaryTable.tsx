'use client'

import { z } from 'zod'
import { businessSummaryTableSchema } from '@/lib/tambo/schemas'

type BusinessSummaryTableProps = z.infer<typeof businessSummaryTableSchema>

export default function BusinessSummaryTable({
  title = 'Business Summary',
  columns = ['Metric', 'Value', 'Status', 'Trend'],
  rows = [],
  sortable = true,
  pagination = false,
  pageSize = 10,
  highlightRow
}: BusinessSummaryTableProps) {
  
  // Ensure we have valid rows
  const validatedRows = Array.isArray(rows) && rows.length > 0 
    ? rows
    : getDefaultRows()
  
  // Sort rows if sortable
  const sortedRows = sortable 
    ? [...validatedRows].sort((a, b) => {
        const statusOrder = { error: 0, warning: 1, success: 2, info: 3 }
        const aOrder = statusOrder[a.status?.toLowerCase() as keyof typeof statusOrder] ?? 3
        const bOrder = statusOrder[b.status?.toLowerCase() as keyof typeof statusOrder] ?? 3
        return aOrder - bOrder
      })
    : validatedRows
  
  // Paginate if needed
  const displayedRows = pagination ? sortedRows.slice(0, pageSize) : sortedRows

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[250px] max-h-[500px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              {validatedRows.length} metrics • Updated just now
            </p>
          </div>
          
          {sortable && (
            <div className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
              Sorted
            </div>
          )}
        </div>
      </div>

      {/* Table Container - Scrollable */}
      <div className="flex-1 overflow-y-auto min-h-[150px]">
        <div className="min-w-full">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr className="border-b border-gray-200">
                  {columns.map((column, index) => (
                    <th 
                      key={index} 
                      className="text-left py-3 px-3 text-xs font-semibold text-gray-700 tracking-wider"
                    >
                      <div className="flex items-center">
                        <span>{column}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {displayedRows.map((row, index) => {
                  const isHighlighted = highlightRow === index
                  const statusConfig = getStatusConfig(row.status)
                  const trendConfig = getTrendConfig(row.trend)
                  
                  return (
                    <tr 
                      key={index} 
                      className={`hover:bg-gray-50/50 transition-colors ${isHighlighted ? 'bg-yellow-50' : ''}`}
                    >
                      {/* Metric */}
                      <td className="py-3 px-3">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full ${statusConfig.dot} mr-3 flex-shrink-0`} />
                          <div className="min-w-0">
                            <span className="font-medium text-gray-900 text-sm truncate block">{row.item}</span>
                            {row.description && (
                              <p className="text-xs text-gray-500 mt-0.5 truncate">{row.description}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Value */}
                      <td className="py-3 px-3">
                        <div>
                          <span className="font-semibold text-gray-900 text-sm">{row.value}</span>
                          {row.change && (
                            <div className={`flex items-center text-xs mt-1 ${
                              row.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                            }`}>
                              <svg 
                                className={`w-3 h-3 mr-1 flex-shrink-0 ${row.change.startsWith('+') ? '' : 'rotate-180'}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  strokeWidth={2} 
                                  d="M5 10l7-7m0 0l7 7m-7-7v18" 
                                />
                              </svg>
                              <span>{row.change}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium 
                                      ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}">
                          {statusConfig.label}
                        </div>
                      </td>

                      {/* Trend */}
                      <td className="py-3 px-3">
                        {row.trend && (
                          <div className="flex items-center">
                            <div className={`p-1.5 rounded ${trendConfig.bg} mr-2 flex-shrink-0`}>
                              {trendConfig.icon}
                            </div>
                            <span className={`text-xs font-medium ${trendConfig.text} whitespace-nowrap`}>
                              {row.trend.charAt(0).toUpperCase() + row.trend.slice(1)}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">On Track</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">Monitor</span>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-600">Critical</span>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Showing {displayedRows.length} of {sortedRows.length}
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getDefaultRows() {
  return [
    { 
      item: 'Monthly Revenue', 
      value: '$245,430', 
      status: 'success', 
      trend: 'up',
      change: '+12%',
      description: 'Current month'
    },
    { 
      item: 'Customer Acquisition', 
      value: '$45.20', 
      status: 'warning', 
      trend: 'up',
      change: '+8%',
      description: 'Average cost per acquisition'
    },
    { 
      item: 'Profit Margin', 
      value: '18.5%', 
      status: 'success', 
      trend: 'up',
      change: '+2.3%',
      description: 'Net profitability'
    },
    { 
      item: 'Churn Rate', 
      value: '4.2%', 
      status: 'error', 
      trend: 'up',
      change: '+0.8%',
      description: 'Monthly customer attrition rate'
    },
    { 
      item: 'Active Users', 
      value: '28,540', 
      status: 'success', 
      trend: 'up',
      change: '+15%',
      description: 'Monthly active users count'
    },
    { 
      item: 'Average Order Value', 
      value: '$89.50', 
      status: 'success', 
      trend: 'up',
      change: '+5.2%',
      description: 'Average transaction value'
    },
    { 
      item: 'Conversion Rate', 
      value: '3.8%', 
      status: 'warning', 
      trend: 'down',
      change: '-0.4%',
      description: 'Website to purchase conversion'
    },
    { 
      item: 'Customer Satisfaction', 
      value: '4.2/5', 
      status: 'success', 
      trend: 'up',
      change: '+0.3',
      description: 'CSAT score from surveys'
    },
    { 
      item: 'Employee Turnover', 
      value: '8.5%', 
      status: 'warning', 
      trend: 'up',
      change: '+1.2%',
      description: 'Annual employee attrition'
    },
    { 
      item: 'Operating Costs', 
      value: '$182,000', 
      status: 'warning', 
      trend: 'up',
      change: '+6.8%',
      description: 'Monthly operational expenses'
    }
  ]
}

function getStatusConfig(status?: string) {
  const normalized = status?.toLowerCase() || 'info'

  if (normalized === 'success') {
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-green-200',
      dot: 'bg-green-500',
      label: 'Success',
    }
  }

  if (normalized === 'warning') {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      border: 'border-yellow-200',
      dot: 'bg-yellow-500',
      label: 'Warning',
    }
  }

  if (normalized === 'error') {
    return {
      bg: 'bg-red-100',
      text: 'text-red-800',
      border: 'border-red-200',
      dot: 'bg-red-500',
      label: 'Critical',
    }
  }

  return {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    label: 'Info',
  }
}

function getTrendConfig(trend?: string) {
  switch (trend?.toLowerCase()) {
    case 'up':
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: (
          <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        )
      }
    case 'down':
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        icon: (
          <svg className="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )
      }
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        icon: (
          <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        )
      }
  }
}