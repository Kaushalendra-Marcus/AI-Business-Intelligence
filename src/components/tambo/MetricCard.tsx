'use client'

import { z } from 'zod'
import { metricCardSchema } from '@/lib/tambo/schemas'

type MetricCardProps = z.infer<typeof metricCardSchema>

export default function MetricCard({
  title = 'Business Metric',
  value = '$0',
  trend = 'neutral',
  change = '',
  description = '',
  icon = '',
  color = 'blue',
  precision = 2,
  unit = '',
  comparison = ''
}: MetricCardProps) {
  
  const config = getColorConfig(color)
  const trendConfig = getTrendConfig(trend)
  const displayValue = formatValue(value, unit, precision)
  const displayChange = change || getDefaultChange(trend)
  const displayDescription = description || getDefaultDescription(title)
  const displayComparison = comparison || getDefaultComparison()

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 min-h-[125px] max-h-[250px]">
      <div className="px-4 py-3 h-full flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-start space-x-2">
            {icon && (
              <div className={`p-1.5 rounded-lg ${config.iconBg} flex-shrink-0`}>
                <div className={`w-4 h-4 ${config.iconColor}`}>
                  {getIcon(icon)}
                </div>
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-500 mb-1 truncate">{title}</h3>
              <div className="flex items-baseline space-x-2">
                <p className="text-xl font-bold text-gray-900 truncate">{displayValue}</p>
                
                {/* Trend Indicator */}
                {trend !== 'neutral' && (
                  <div className={`flex items-center space-x-1 px-1.5 py-0.5 rounded-full text-xs font-medium 
                                ${trendConfig.bg} ${trendConfig.text} ${trendConfig.border} flex-shrink-0`}>
                    {trendConfig.icon}
                    <span className="capitalize">{trend}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Change indicator */}
        {displayChange && (
          <div className={`flex items-center text-sm font-medium mt-1 ${
            displayChange.startsWith('+') ? 'text-green-600' : 'text-red-600'
          }`}>
            {displayChange}
            <span className="ml-1 text-xs text-gray-500">change</span>
          </div>
        )}
        
        {/* Description - takes remaining space */}
        <div className="mt-2 flex-1 min-h-0 overflow-y-auto">
          <p className="text-xs text-gray-600">{displayDescription}</p>
        </div>
        
        {/* Comparison and footer */}
        <div className="mt-2 pt-2 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-gray-500">
            {displayComparison && (
              <div className="truncate">
                vs {displayComparison}
              </div>
            )}
            
            <div className="flex items-center space-x-1 flex-shrink-0">
              <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></div>
              <span className="capitalize">{color}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper functions (keep same as before)
function getColorConfig(color: string) {
  switch (color.toLowerCase()) {
    case 'blue':
      return {
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        dot: 'bg-blue-500'
      }
    case 'green':
      return {
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        dot: 'bg-green-500'
      }
    case 'red':
      return {
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        dot: 'bg-red-500'
      }
    case 'yellow':
      return {
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-600',
        dot: 'bg-yellow-500'
      }
    case 'purple':
      return {
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
        dot: 'bg-purple-500'
      }
    default:
      return {
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        dot: 'bg-gray-500'
      }
  }
}

function getTrendConfig(trend: string) {
  switch (trend.toLowerCase()) {
    case 'up':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        )
      }
    case 'down':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        )
      }
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: (
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
          </svg>
        )
      }
  }
}

function getIcon(iconName: string) {
  const icons: Record<string, React.ReactNode> = {
    revenue: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    users: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    growth: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    conversion: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    profit: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    clock: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 01118 0z" />
      </svg>
    ),
    chart: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    target: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  }
  
  return icons[iconName] || icons.chart
}

function formatValue(value: string | number, unit: string, precision: number): string {
  const str = String(value)
  
  if (str.startsWith('$') || str.endsWith('%')) return str
  
  const num = parseFloat(str.replace(/[^0-9.-]+/g, ''))
  
  if (isNaN(num)) return str
  
  if (num >= 1000000) {
    return `$${(num / 1000000).toFixed(precision)}M`
  }
  if (num >= 1000) {
    return `$${(num / 1000).toFixed(precision)}K`
  }
  
  if (unit) {
    if (unit === '%') return `${num.toFixed(precision)}%`
    if (unit === '$') return `$${num.toFixed(precision)}`
    return `${num.toFixed(precision)} ${unit}`
  }
  
  return num.toFixed(precision)
}

function getDefaultChange(trend: string): string {
  switch (trend.toLowerCase()) {
    case 'up': return '+12.5%'
    case 'down': return '-5.2%'
    default: return '+0.3%'
  }
}

function getDefaultDescription(title: string): string {
  const lowerTitle = title.toLowerCase()
  
  if (lowerTitle.includes('revenue')) return 'Total revenue generated this period'
  if (lowerTitle.includes('user')) return 'Active user count for current period'
  if (lowerTitle.includes('growth')) return 'Percentage growth from previous period'
  if (lowerTitle.includes('profit')) return 'Net profit after all expenses'
  if (lowerTitle.includes('conversion')) return 'Conversion rate percentage'
  if (lowerTitle.includes('cost')) return 'Total operational costs'
  
  return 'Business performance metric for current period'
}

function getDefaultComparison(): string {
  const comparisons = ['last month', 'previous quarter', 'same period last year', 'industry average']
  return comparisons[Math.floor(Math.random() * comparisons.length)]
}