'use client'

import { z } from 'zod'
import { comparisonCardSchema } from '@/lib/tambo/schemas'

type ComparisonCardProps = z.infer<typeof comparisonCardSchema>

export default function ComparisonCard({
  title = 'Business Comparison',
  leftLabel = 'Current Period',
  leftValue = '$0',
  rightLabel = 'Previous Period',
  rightValue = '$0',
  difference = '$0',
  percentageChange = '0%',
  verdict = 'same',
  metrics = [],
  insights = []
}: ComparisonCardProps) {
  
  const config = getVerdictConfig(verdict)
  const leftNum = parseFloat(String(leftValue).replace(/[^0-9.-]+/g, '')) || 0
  const rightNum = parseFloat(String(rightValue).replace(/[^0-9.-]+/g, '')) || 0
  const diffNum = parseFloat(String(difference).replace(/[^0-9.-]+/g, '')) || 0
  const percentageNum = parseFloat(percentageChange.replace(/[^0-9.-]+/g, '')) || 0
  
  const isPositive = diffNum > 0
  const isNegative = diffNum < 0
  const absoluteDiff = Math.abs(diffNum)
  
  // If metrics not provided, generate default ones
  const displayMetrics = metrics.length > 0 
    ? metrics.slice(0, 4)
    : getDefaultMetrics(leftLabel, rightLabel)

  // If insights not provided, generate default ones
  const displayInsights = insights.length > 0 
    ? insights.slice(0, 3)
    : getDefaultInsights(verdict, percentageChange)

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col min-h-[250px] max-h-[500px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Side-by-side analysis
            </p>
          </div>
          
          <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full ${config.bg} ${config.border}`}>
            <div className={`p-1 rounded-full ${config.iconBg}`}>
              {config.icon}
            </div>
            <span className={`text-xs font-semibold ${config.text}`}>
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 min-h-[150px]">
        {/* Comparison Values */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <div className="text-xs font-medium text-blue-700 mb-2 flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              {leftLabel}
            </div>
            <div className="text-2xl font-bold text-gray-900 truncate">{formatValue(leftValue)}</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4">
            <div className="text-xs font-medium text-purple-700 mb-2 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              {rightLabel}
            </div>
            <div className="text-2xl font-bold text-gray-900 truncate">{formatValue(rightValue)}</div>
          </div>
        </div>

        {/* Change Indicators */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`p-3 rounded-lg border ${
            isPositive ? 'bg-green-50 border-green-200' : 
            isNegative ? 'bg-red-50 border-red-200' : 
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="text-xs font-medium text-gray-600 mb-1">Difference</div>
            <div className={`text-lg font-bold ${
              isPositive ? 'text-green-700' : 
              isNegative ? 'text-red-700' : 
              'text-blue-700'
            }`}>
              {isPositive ? '+' : isNegative ? '-' : ''}{formatValue(String(Math.abs(diffNum)))}
            </div>
          </div>
          
          <div className={`p-3 rounded-lg border ${
            isPositive ? 'bg-green-50 border-green-200' : 
            isNegative ? 'bg-red-50 border-red-200' : 
            'bg-blue-50 border-blue-200'
          }`}>
            <div className="text-xs font-medium text-gray-600 mb-1">Change</div>
            <div className={`text-lg font-bold ${
              isPositive ? 'text-green-700' : 
              isNegative ? 'text-red-700' : 
              'text-blue-700'
            }`}>
              {isPositive ? '+' : isNegative ? '-' : ''}{Math.abs(percentageNum)}%
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span className="truncate">{leftLabel}</span>
            <span className="truncate">{rightLabel}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                isPositive ? 'bg-gradient-to-r from-green-400 to-green-500' : 
                isNegative ? 'bg-gradient-to-r from-red-400 to-red-500' : 
                'bg-gradient-to-r from-blue-400 to-blue-500'
              } transition-all duration-500 rounded-full`}
              style={{ 
                width: `${Math.min(Math.abs(percentageNum) * 2, 100)}%`,
                marginLeft: isPositive ? '0' : 'auto',
                marginRight: isNegative ? '0' : 'auto'
              }}
            ></div>
          </div>
        </div>

        {/* Metrics Grid */}
        {displayMetrics.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Detailed Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              {displayMetrics.map((metric, index) => (
                <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-xs font-medium text-gray-600 mb-2 truncate">{metric.name}</div>
                  <div className="flex justify-between items-center">
                    <div className="text-right">
                      <div className="text-xs text-gray-500 mb-1">Current</div>
                      <div className="text-sm font-semibold text-gray-900 truncate">{metric.leftValue}</div>
                    </div>
                    <div className="text-center mx-2">
                      <div className={`text-xs font-medium ${
                        metric.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {metric.change}
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-500 mb-1">Previous</div>
                      <div className="text-sm font-semibold text-gray-900 truncate">{metric.rightValue}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        {displayInsights.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
              <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI Insights
            </h3>
            <ul className="space-y-2">
              {displayInsights.map((insight, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600 flex items-center">
            <svg className="w-3.5 h-3.5 mr-1.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            AI Analysis
          </div>
          <button className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getVerdictConfig(verdict: string) {
  switch (verdict.toLowerCase()) {
    case 'better':
    case 'improved':
      return {
        bg: 'bg-gradient-to-r from-green-50 to-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
        iconBg: 'bg-green-200',
        iconColor: 'text-green-600',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        ),
        label: 'Improved',
      }
    case 'worse':
    case 'declined':
      return {
        bg: 'bg-gradient-to-r from-red-50 to-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
        iconBg: 'bg-red-200',
        iconColor: 'text-red-600',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        ),
        label: 'Declined',
      }
    case 'same':
    case 'unchanged':
      return {
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-200',
        iconColor: 'text-blue-600',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        ),
        label: 'No Change',
      }
    default:
      return {
        bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        iconBg: 'bg-gray-200',
        iconColor: 'text-gray-600',
        icon: (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        ),
        label: 'Comparison',
      }
  }
}

function getDefaultMetrics(leftLabel: string, rightLabel: string) {
  return [
    { 
      name: 'Revenue', 
      leftValue: '$245,430', 
      rightValue: '$210,500', 
      change: '+16.6%' 
    },
    { 
      name: 'Profit Margin', 
      leftValue: '18.5%', 
      rightValue: '16.2%', 
      change: '+2.3%' 
    },
    { 
      name: 'Customer Growth', 
      leftValue: '2,840', 
      rightValue: '2,450', 
      change: '+15.9%' 
    },
    { 
      name: 'Operational Cost', 
      leftValue: '$85,200', 
      rightValue: '$79,300', 
      change: '+7.4%' 
    }
  ]
}

function getDefaultInsights(verdict: string, percentageChange: string) {
  const insights = [
    `Performance shows a ${verdict} trend with ${percentageChange} change`,
    'Review contributing factors for sustained improvement',
    'Consider scaling successful strategies to other areas'
  ]
  
  if (verdict === 'worse' || verdict === 'declined') {
    return [
      `Performance declined by ${percentageChange}, requires investigation`,
      'Identify root causes and implement corrective actions',
      'Monitor key metrics closely for early warning signs'
    ]
  }
  
  return insights
}

function formatValue(value: string | number): string {
  const str = String(value)
  if (str.startsWith('$')) return str
  if (str.endsWith('%')) return str
  if (!isNaN(Number(str.replace(/[^0-9.-]+/g, '')))) {
    const num = Number(str.replace(/[^0-9.-]+/g, ''))
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    return str
  }
  return str
}