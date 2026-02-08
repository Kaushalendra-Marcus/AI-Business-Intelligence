// src/lib/tambo/schemas.ts
import { z } from 'zod'

// Enhanced Zod schemas with better validation
export const metricCardSchema = z.object({
  title: z.string().min(1).describe('Metric title'),
  value: z.string().or(z.number()).describe('Metric value'),
  trend: z.enum(['up', 'down', 'neutral']).default('neutral'),
  change: z.string().optional().describe('Percentage change'),
  description: z.string().optional(),
  icon: z.string().optional().describe('Icon name'),
  color: z.enum(['blue', 'green', 'red', 'yellow', 'purple', 'gray']).default('blue'),
  precision: z.number().min(0).max(4).default(2).describe('Decimal precision'),
  unit: z.string().optional().describe('Unit (%, $, etc)'),
  comparison: z.string().optional().describe('Comparison period')
})

export const graphCardSchema = z.object({
  title: z.string().min(1),
  type: z.enum(['line', 'bar', 'pie', 'area']).default('line'),
  data: z.array(z.object({
    label: z.string(),
    value: z.number(),
    category: z.string().optional(),
    color: z.string().optional()
  })),
  xAxisLabel: z.string().optional(),
  yAxisLabel: z.string().optional(),
  showGrid: z.boolean().default(true),
  showLegend: z.boolean().default(true),
  colorScheme: z.enum(['blue', 'green', 'red', 'purple', 'multi']).default('blue'),
  height: z.number().min(100).max(500).default(300),
  timeRange: z.string().optional().describe('Time range for data')
})

export const businessSummaryTableSchema = z.object({
  title: z.string().min(1),
  columns: z.array(z.string()).min(1),
  rows: z.array(z.object({
    item: z.string(),
    value: z.string().or(z.number()),
    status: z.enum(['success', 'warning', 'error', 'info']).default('info'),
    change: z.string().optional(),
    trend: z.enum(['up', 'down', 'neutral']).optional(),
    description: z.string().optional(),  // Added this line
    lastUpdated: z.string().optional()   // Added this line
  })),
  sortable: z.boolean().default(true),
  pagination: z.boolean().default(false),
  pageSize: z.number().min(5).max(50).default(10),
  highlightRow: z.number().optional().describe('Row index to highlight')
})

export const comparisonCardSchema = z.object({
  title: z.string().min(1),
  leftLabel: z.string(),
  leftValue: z.string().or(z.number()),
  rightLabel: z.string(),
  rightValue: z.string().or(z.number()),
  difference: z.string().or(z.number()),
  percentageChange: z.string(),
  verdict: z.enum(['better', 'worse', 'same', 'improved', 'declined']),
  metrics: z.array(z.object({
    name: z.string(),
    leftValue: z.string().or(z.number()),
    rightValue: z.string().or(z.number()),
    change: z.string()
  })).optional(),
  insights: z.array(z.string()).optional()
})

export const insightCardSchema = z.object({
  title: z.string().min(1),
  insight: z.string().min(10),
  severity: z.enum(['positive', 'neutral', 'negative', 'critical']).default('neutral'),
  recommendations: z.array(z.string()).optional(),
  confidence: z.number().min(0).max(100).default(85),
  sources: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  actionItems: z.array(z.object({
    title: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    deadline: z.string().optional()
  })).optional()
})

export const alertListSchema = z.object({
  title: z.string().min(1),
  alerts: z.array(z.object({
    title: z.string(),
    description: z.string(),
    level: z.enum(['info', 'warning', 'critical']),
    timestamp: z.string(),
    action: z.string().optional(),
    assignedTo: z.string().optional(),
    status: z.enum(['new', 'in-progress', 'resolved', 'acknowledged']).default('new'),
    category: z.string().optional()
  })),
  autoRefresh: z.boolean().default(true),
  refreshInterval: z.number().min(5).max(300).default(60),
  maxAlerts: z.number().min(1).max(100).default(20),
  grouping: z.enum(['level', 'category', 'status']).optional()
})

export const statusBadgeSchema = z.object({
  label: z.string().min(1),
  status: z.enum(['success', 'warning', 'error', 'loading', 'idle']),
  value: z.string().or(z.number()).optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  lastUpdated: z.string().optional(),
  uptime: z.string().optional(),
  metrics: z.array(z.object({
    label: z.string(),
    value: z.string(),
    status: z.enum(['good', 'warning', 'bad'])
  })).optional()
})