'use client'

import { useState, useMemo } from 'react'
import { z } from 'zod'
import { graphCardSchema } from '@/lib/tambo/schemas'

type GraphCardProps = z.infer<typeof graphCardSchema>

export default function GraphCard({
  title = 'Business Trends',
  type = 'line',
  data = [],
  xAxisLabel = 'Time',
  yAxisLabel = 'Value',
  showGrid = true,
  showLegend = false,
  colorScheme = 'blue',
  height = 280,
  timeRange
}: GraphCardProps) {
  
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [selectedDataset, setSelectedDataset] = useState(0)
  
  // Check if it's a pie chart for conditional rendering
  const isPieChart = type === 'pie'
  
  // Ensure we have valid data
  const validatedData = useMemo(() => {
    if (Array.isArray(data) && data.length > 0) {
      return data.map(item => ({
        label: item.label || 'Item',
        value: typeof item.value === 'number' ? item.value : 0,
        category: item.category || 'default',
        color: item.color
      }))
    }
    return getDefaultData(type, title)
  }, [data, type, title])
  
  // Prepare datasets for multi-series data
  const datasets = useMemo(() => {
    const categories = [...new Set(validatedData.map(d => d.category))]
    
    if (categories.length > 1) {
      return categories.map(category => ({
        name: category,
        data: validatedData.filter(d => d.category === category),
        color: getCategoryColor(category, categories.indexOf(category), colorScheme)
      }))
    }
    
    return [{
      name: 'Dataset',
      data: validatedData,
      color: getColorScheme(colorScheme)[0]
    }]
  }, [validatedData, colorScheme])
  
  // Current dataset
  const currentDataset = datasets[selectedDataset]
  const currentData = currentDataset.data
  
  // Calculate chart dimensions
  const maxValue = Math.max(...currentData.map(d => d.value), 0)
  const minValue = Math.min(...currentData.map(d => d.value), 0)
  const valueRange = maxValue - minValue || 1
  
  // Calculate bar width for bar charts
  const barWidth = 100 / Math.max(currentData.length, 1)
  const barSpacing = barWidth * 0.2
  const barActualWidth = barWidth * 0.8
  
  // Chart colors
  const colors = getColorScheme(colorScheme)
  
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[250px] max-h-[500px]">
      {/* Header - Compact */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {type.charAt(0).toUpperCase() + type.slice(1)} chart • {currentData.length} data points
              {timeRange && ` • ${timeRange}`}
            </p>
          </div>
          
          <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            type === 'line' ? 'bg-blue-100 text-blue-700' :
            type === 'bar' ? 'bg-green-100 text-green-700' :
            type === 'pie' ? 'bg-purple-100 text-purple-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="relative h-full">
          <div className="relative" style={{ height: `${height}px` }}>
            {/* Y-axis label (only if not pie chart) */}
            {yAxisLabel && !isPieChart && (
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs font-medium text-gray-600">
                {yAxisLabel}
              </div>
            )}
            
            {/* Chart Area */}
            <div className={!isPieChart ? 'ml-6 h-full' : 'h-full'}>
              {type === 'line' && (
                <LineChart 
                  data={currentData}
                  colors={colors}
                  maxValue={maxValue}
                  minValue={minValue}
                  valueRange={valueRange}
                  showGrid={showGrid}
                  hoveredIndex={hoveredIndex}
                  onHover={setHoveredIndex}
                />
              )}
              
              {type === 'bar' && (
                <BarChart 
                  data={currentData}
                  colors={colors}
                  maxValue={maxValue}
                  minValue={minValue}
                  valueRange={valueRange}
                  showGrid={showGrid}
                  barWidth={barActualWidth}
                  barSpacing={barSpacing}
                  hoveredIndex={hoveredIndex}
                  onHover={setHoveredIndex}
                />
              )}
              
              {type === 'pie' && (
                <PieChart 
                  data={currentData}
                  colors={colors}
                  height={height}
                />
              )}
              
              {type === 'area' && (
                <AreaChart 
                  data={currentData}
                  colors={colors}
                  maxValue={maxValue}
                  minValue={minValue}
                  valueRange={valueRange}
                  showGrid={showGrid}
                  hoveredIndex={hoveredIndex}
                  onHover={setHoveredIndex}
                />
              )}
            </div>
          </div>
          
          {/* X-axis labels (only if not pie chart) */}
          {xAxisLabel && !isPieChart && (
            <div className={`mt-2 ${!isPieChart ? 'ml-6' : ''} flex justify-between`}>
              {currentData.map((item, index) => (
                <div
                  key={index}
                  className="text-xs text-gray-500 text-center truncate"
                  style={{ width: `${barWidth}%` }}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend - Only if showLegend is true */}
      {showLegend && datasets.length > 1 && (
        <div className="px-4 py-2.5 border-t border-gray-200">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-xs font-medium text-gray-700">Legend:</div>
            {datasets.map((dataset, index) => (
              <div
                key={index}
                className="flex items-center space-x-1.5 cursor-pointer"
                onClick={() => setSelectedDataset(index)}
              >
                <div 
                  className="w-2.5 h-2.5 rounded"
                  style={{ backgroundColor: dataset.color }}
                ></div>
                <span className={`text-xs ${
                  selectedDataset === index ? 'font-semibold text-gray-900' : 'text-gray-600'
                }`}>
                  {dataset.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data Summary - Compact */}
      <div className="px-4 py-2.5 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="grid grid-cols-4 gap-2">
          <div className="text-center">
            <div className="text-xs text-gray-500">Total</div>
            <div className="text-sm font-semibold text-gray-900">
              {formatNumber(currentData.reduce((sum, d) => sum + d.value, 0))}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-500">Average</div>
            <div className="text-sm font-semibold text-gray-900">
              {formatNumber(currentData.reduce((sum, d) => sum + d.value, 0) / currentData.length)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-500">Max</div>
            <div className="text-sm font-semibold text-gray-900">
              {formatNumber(maxValue)}
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-xs text-gray-500">Min</div>
            <div className="text-sm font-semibold text-gray-900">
              {formatNumber(minValue)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Line Chart Component
function LineChart({ data, colors, maxValue, minValue, valueRange, showGrid, hoveredIndex, onHover }: any) {
  const points = data.map((d: any, i: number) => {
    const x = (i / Math.max(data.length - 1, 1)) * 100
    const y = 100 - ((d.value - minValue) / valueRange) * 80
    return { x, y, value: d.value, label: d.label }
  })

  const pathPoints = points.map((p: any) => `${p.x},${p.y}`).join(' ')

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Grid lines */}
      {showGrid && (
        <>
          <line x1="0" y1="20" x2="100" y2="20" stroke="#e5e7eb" strokeWidth="0.2" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="#e5e7eb" strokeWidth="0.2" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="#e5e7eb" strokeWidth="0.2" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="#e5e7eb" strokeWidth="0.2" />
        </>
      )}

      {/* Area under line */}
      <path
        d={`M ${pathPoints} L 100,100 L 0,100 Z`}
        fill="url(#gradient)"
        fillOpacity="0.3"
      />

      {/* Line */}
      <path
        d={`M ${pathPoints}`}
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {points.map((point: any, i: number) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={hoveredIndex === i ? "3" : "2"}
          fill={colors[0]}
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={() => onHover(i)}
          onMouseLeave={() => onHover(null)}
          className="cursor-pointer transition-all"
        />
      ))}

      {/* Hover line */}
      {hoveredIndex !== null && (
        <line
          x1={points[hoveredIndex].x}
          y1="0"
          x2={points[hoveredIndex].x}
          y2="100"
          stroke="#9ca3af"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
      )}

      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} stopOpacity="0.5" />
          <stop offset="100%" stopColor={colors[1] || colors[0]} stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1] || colors[0]} />
          <stop offset="100%" stopColor={colors[2] || colors[0]} />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Bar Chart Component
function BarChart({ data, colors, maxValue, minValue, valueRange, showGrid, barWidth, barSpacing, hoveredIndex, onHover }: any) {
  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Grid lines */}
      {showGrid && (
        <>
          <line x1="0" y1="20" x2="100" y2="20" stroke="#e5e7eb" strokeWidth="0.2" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="#e5e7eb" strokeWidth="0.2" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="#e5e7eb" strokeWidth="0.2" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="#e5e7eb" strokeWidth="0.2" />
        </>
      )}

      {/* Bars */}
      {data.map((d: any, i: number) => {
        const height = ((d.value - minValue) / valueRange) * 80
        const x = i * (barWidth + barSpacing) + barSpacing / 2
        const y = 100 - height
        const isHovered = hoveredIndex === i
        
        return (
          <g key={i} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(null)}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={height}
              fill={isHovered ? colors[1] || colors[0] : colors[0]}
              rx="2"
              className="transition-all duration-200 cursor-pointer"
            />
            
            {/* Bar value label */}
            {height > 10 && (
              <text
                x={x + barWidth / 2}
                y={y - 3}
                textAnchor="middle"
                fontSize="3"
                fill="#4b5563"
                fontWeight="bold"
              >
                {formatNumber(d.value)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// Pie Chart Component
function PieChart({ data, colors, height }: any) {
  const total = data.reduce((sum: number, d: any) => sum + d.value, 0) || 1
  let startAngle = 0
  
  const centerX = 50
  const centerY = 50
  const radius = 40
  
  return (
    <svg className="w-full h-full" viewBox="0 0 100 100">
      {data.map((d: any, i: number) => {
        const percentage = (d.value / total) * 100
        const angle = (percentage / 100) * 360
        const endAngle = startAngle + angle
        
        const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180)
        const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180)
        const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180)
        const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180)
        
        const largeArcFlag = angle > 180 ? 1 : 0
        
        const pathData = [
          `M ${centerX} ${centerY}`,
          `L ${x1} ${y1}`,
          `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `Z`
        ].join(' ')
        
        // Calculate label position
        const midAngle = startAngle + angle / 2
        const labelRadius = radius * 0.7
        const labelX = centerX + labelRadius * Math.cos((midAngle - 90) * Math.PI / 180)
        const labelY = centerY + labelRadius * Math.sin((midAngle - 90) * Math.PI / 180)
        
        const slice = (
          <g key={i}>
            <path
              d={pathData}
              fill={colors[i % colors.length]}
              stroke="#fff"
              strokeWidth="1"
              className="hover:opacity-80 transition-opacity cursor-pointer"
            />
            
            {/* Percentage label */}
            {percentage > 10 && (
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                fontSize="3"
                fill="#fff"
                fontWeight="bold"
                dy="1.2"
              >
                {Math.round(percentage)}%
              </text>
            )}
          </g>
        )
        
        startAngle = endAngle
        return slice
      })}
      
      {/* Center circle */}
      <circle cx={centerX} cy={centerY} r={radius * 0.3} fill="#fff" />
      <text 
        x={centerX} 
        y={centerY} 
        textAnchor="middle" 
        fontSize="4" 
        fill="#4b5563" 
        fontWeight="bold"
        dy="1.5"
      >
        Total
      </text>
    </svg>
  )
}

// Area Chart Component
function AreaChart({ data, colors, maxValue, minValue, valueRange, showGrid, hoveredIndex, onHover }: any) {
  const points = data.map((d: any, i: number) => {
    const x = (i / Math.max(data.length - 1, 1)) * 100
    const y = 100 - ((d.value - minValue) / valueRange) * 80
    return { x, y, value: d.value, label: d.label }
  })

  const pathPoints = points.map((p: any) => `${p.x},${p.y}`).join(' ')
  const areaPath = `M ${pathPoints} L 100,100 L 0,100 Z`

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* Grid lines */}
      {showGrid && (
        <>
          <line x1="0" y1="20" x2="100" y2="20" stroke="#e5e7eb" strokeWidth="0.2" />
          <line x1="0" y1="40" x2="100" y2="40" stroke="#e5e7eb" strokeWidth="0.2" />
          <line x1="0" y1="60" x2="100" y2="60" stroke="#e5e7eb" strokeWidth="0.2" />
          <line x1="0" y1="80" x2="100" y2="80" stroke="#e5e7eb" strokeWidth="0.2" />
        </>
      )}

      {/* Area */}
      <path
        d={areaPath}
        fill="url(#areaGradient)"
        fillOpacity="0.4"
      />

      {/* Line */}
      <path
        d={`M ${pathPoints}`}
        fill="none"
        stroke={colors[0]}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Data points */}
      {points.map((point: any, i: number) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={hoveredIndex === i ? "3" : "2"}
          fill={colors[0]}
          stroke="#fff"
          strokeWidth="1"
          onMouseEnter={() => onHover(i)}
          onMouseLeave={() => onHover(null)}
          className="cursor-pointer transition-all"
        />
      ))}

      <defs>
        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors[0]} stopOpacity="0.6" />
          <stop offset="100%" stopColor={colors[1] || colors[0]} stopOpacity="0.1" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// Helper functions
function getDefaultData(type: string, title: string) {
  const lowerTitle = title.toLowerCase()
  
  if (lowerTitle.includes('revenue') || lowerTitle.includes('sales')) {
    return Array.from({ length: 8 }, (_, i) => ({
      label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i],
      value: 100000 + (i * 35000) + Math.random() * 30000,
      category: 'Revenue'
    }))
  }
  
  if (lowerTitle.includes('growth') || lowerTitle.includes('users')) {
    return Array.from({ length: 8 }, (_, i) => ({
      label: `Week ${i + 1}`,
      value: 5000 + (i * 2000) + Math.random() * 1500,
      category: 'Growth'
    }))
  }
  
  if (lowerTitle.includes('market share') || type === 'pie') {
    return [
      { label: 'Product A', value: 40, category: 'Products' },
      { label: 'Product B', value: 25, category: 'Products' },
      { label: 'Product C', value: 20, category: 'Products' },
      { label: 'Others', value: 15, category: 'Products' }
    ]
  }
  
  // Default generic data
  return Array.from({ length: 8 }, (_, i) => ({
    label: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i],
    value: 100 + (i * 30) + Math.random() * 50,
    category: 'Default'
  }))
}

function getColorScheme(scheme: string): string[] {
  switch (scheme) {
    case 'blue':
      return ['#0ea5e9', '#3b82f6', '#1d4ed8']
    case 'green':
      return ['#10b981', '#22c55e', '#16a34a']
    case 'red':
      return ['#ef4444', '#dc2626', '#b91c1c']
    case 'purple':
      return ['#8b5cf6', '#7c3aed', '#6d28d9']
    case 'multi':
      return ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    default:
      return ['#0ea5e9', '#3b82f6', '#1d4ed8']
  }
}

function getCategoryColor(category: string, index: number, scheme: string): string {
  const colors = getColorScheme(scheme)
  return colors[index % colors.length]
}

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }
  return Math.round(value).toString()
}