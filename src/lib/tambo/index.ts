// This file should only be imported in client components
import { z } from 'zod'
import type { TamboComponent } from '@tambo-ai/react'

// Import all Tambo components
import MetricCard from '@/components/tambo/MetricCard'
import StatusBadge from '@/components/tambo/StatusBadge'
import GraphCard from '@/components/tambo/GraphCard'
import BusinessSummaryTable from '@/components/tambo/BusinessSummaryTable'
import InsightCard from '@/components/tambo/InsightCard'
import ComparisonCard from '@/components/tambo/ComparisonCard'
import AlertList from '@/components/tambo/AlertList'

// ============ SCHEMA DEFINITIONS ============

export const metricCardSchema = z.object({
  title: z.string().optional().default('Business Metric').describe('Metric title like "Monthly Revenue", "Active Users", or "Conversion Rate"'),
  value: z.string().optional().default('N/A').describe('The metric value like "$125,430", "5,280 users", or "12.5%"'),
  trend: z.string()
    .optional()
    .default('neutral')
    .transform((val) => {
      if (!val) return 'neutral';
      const normalized = val.toLowerCase().trim();
      if (normalized.includes('up') || normalized.includes('increase') || normalized.includes('positive') || normalized.includes('growth') || normalized.includes('rise')) return 'up';
      if (normalized.includes('down') || normalized.includes('decrease') || normalized.includes('negative') || normalized.includes('decline') || normalized.includes('drop')) return 'down';
      return 'neutral';
    })
    .pipe(z.enum(['up', 'down', 'neutral']))
    .describe('Trend direction: up for positive, down for negative, neutral for stable'),
  change: z.string().optional().describe('Change percentage like "+12%" or "-5%"'),
  period: z.string().optional().describe('Time period like "Last quarter" or "This month"'),
})

export const statusBadgeSchema = z.object({
  label: z.string().optional().default('Business Status').describe('Status label like "System Health", "Financial Status", or "Operational Status"'),
  status: z.string()
    .optional()
    .default('success')
    .transform((val) => {
      if (!val) return 'success';
      const normalized = val.toLowerCase().trim();
      if (normalized === 'success' || normalized === 'healthy' || normalized === 'good' || normalized === 'optimal' || normalized === 'excellent') return 'success';
      if (normalized === 'warning' || normalized === 'caution' || normalized === 'moderate' || normalized === 'watch') return 'warning';
      if (normalized === 'error' || normalized === 'critical' || normalized === 'failing' || normalized === 'poor' || normalized === 'bad') return 'error';
      return 'success';
    })
    .pipe(z.enum(['success', 'warning', 'error']))
    .describe('Current status level: success for good, warning for caution, error for critical'),
})

export const graphCardSchema = z.object({
  title: z.string().optional().default('Business Trend').describe('Graph title like "Revenue Growth", "User Acquisition", or "Monthly Performance"'),
  type: z.string()
    .optional()
    .default('line')
    .transform((val) => {
      if (!val) return 'line';
      const normalized = val.toLowerCase().trim();
      if (normalized.includes('pie') || normalized === 'pie chart' || normalized.includes('share') || normalized.includes('percentage') || normalized.includes('proportion')) return 'pie';
      if (normalized.includes('bar') || normalized === 'bar chart' || normalized.includes('column') || normalized.includes('comparison') || normalized.includes('ranking')) return 'bar';
      if (normalized.includes('line') || normalized === 'line chart' || normalized.includes('trend') || normalized.includes('growth') || normalized.includes('time series')) return 'line';
      return 'line';
    })
    .pipe(z.enum(['line', 'bar', 'pie']))
    .describe('Chart type: line for trends over time, bar for comparisons, pie for proportions'),
  data: z.array(
    z.object({
      label: z.string().optional().describe('Data point label like month name, quarter, or category'),
      value: z.number().optional().default(0).describe('Numerical value for the data point'),
    })
  ).optional().describe('Data points for the chart').refine(
    (data) => data && data.length > 0,
    { message: "At least one data point is required" }
  ),
  xAxisLabel: z.string().optional().describe('Label for X-axis like "Months", "Quarters", or "Years"'),
  yAxisLabel: z.string().optional().describe('Label for Y-axis like "Revenue ($)", "Users", or "Percentage"'),
})

export const businessSummaryTableSchema = z.object({
  title: z.string().optional().default('Business Summary').describe('Table title'),
  columns: z.array(z.string()).optional().default(['Metric', 'Value', 'Status']).describe('Table column headers'),
  rows: z.array(
    z.object({
      item: z.string().optional().default('Metric').describe('Metric name'),
      value: z.string().optional().default('N/A').describe('Metric value'),
      status: z.string()
        .optional()
        .default('success')
        .transform((val) => {
          if (!val) return 'success';
          const normalized = val.toLowerCase().trim();
          if (normalized === 'success' || normalized === 'good' || normalized === 'positive' || normalized === 'achieved') return 'success';
          if (normalized === 'warning' || normalized === 'caution' || normalized === 'watch' || normalized === 'moderate') return 'warning';
          if (normalized === 'error' || normalized === 'critical' || normalized === 'negative' || normalized === 'missed') return 'error';
          return 'success';
        })
        .pipe(z.enum(['success', 'warning', 'error']))
        .describe('Status indicator')
    })
  ).optional().describe('Table rows with business metrics'),
})

export const insightCardSchema = z.object({
  title: z.string().optional().default('Business Insight').describe('Insight title like "Key Finding", "Recommendation", or "Analysis"'),
  insight: z.string().optional().default('Analyzing business performance data reveals opportunities for optimization.').describe('Detailed business insight or analysis'),
  severity: z.string()
    .optional()
    .default('neutral')
    .transform((val) => {
      if (!val) return 'neutral';
      const normalized = val.toLowerCase().trim();
      if (normalized === 'positive' || normalized === 'good' || normalized === 'favorable' || normalized === 'opportunity') return 'positive';
      if (normalized === 'negative' || normalized === 'bad' || normalized === 'unfavorable' || normalized === 'risk') return 'negative';
      return 'neutral';
    })
    .pipe(z.enum(['positive', 'neutral', 'negative']))
    .describe('Insight severity: positive for good news, neutral for observations, negative for concerns'),
  recommendations: z.array(z.string()).optional().describe('List of actionable recommendations'),
})

export const comparisonCardSchema = z.object({
  title: z.string().optional().default('Business Comparison').describe('Comparison title like "Month-over-Month", "Year-over-Year", or "Performance Comparison"'),
  leftLabel: z.string().optional().default('Current Period').describe('Label for first value like "This Month", "Q1", or "Current"'),
  leftValue: z.string().optional().default('$50,000').describe('First comparison value'),
  rightLabel: z.string().optional().default('Previous Period').describe('Label for second value like "Last Month", "Q2", or "Previous"'),
  rightValue: z.string().optional().default('$45,000').describe('Second comparison value'),
  difference: z.string().optional().describe('Difference between values like "+$5,000"'),
  percentageChange: z.string().optional().describe('Percentage change like "+11.1%"'),
  verdict: z.string()
    .optional()
    .default('better')
    .transform((val) => {
      if (!val) return 'better';
      const normalized = val.toLowerCase().trim();
      if (normalized === 'better' || normalized === 'improved' || normalized.includes('increase') || normalized.includes('positive')) return 'better';
      if (normalized === 'worse' || normalized === 'declined' || normalized.includes('decrease') || normalized.includes('negative')) return 'worse';
      if (normalized === 'same' || normalized === 'unchanged' || normalized === 'stable' || normalized === 'equal') return 'same';
      return 'better';
    })
    .pipe(z.enum(['better', 'worse', 'same']))
    .describe('Comparison result: better if improved, worse if declined, same if unchanged'),
})

export const alertListSchema = z.object({
  title: z.string().optional().default('Business Alerts').describe('Alert list title'),
  alerts: z.array(
    z.object({
      title: z.string().optional().default('System Alert').describe('Alert title'),
      description: z.string().optional().describe('Detailed alert description'),
      level: z.string()
        .optional()
        .default('info')
        .transform((val) => {
          if (!val) return 'info';
          const normalized = val.toLowerCase().trim();
          if (normalized === 'critical' || normalized === 'urgent' || normalized === 'emergency' || normalized === 'high') return 'critical';
          if (normalized === 'warning' || normalized === 'alert' || normalized === 'caution' || normalized === 'medium') return 'warning';
          return 'info';
        })
        .pipe(z.enum(['info', 'warning', 'critical'])),
      timestamp: z.string().optional().describe('When the alert occurred'),
      action: z.string().optional().describe('Recommended action'),
    })
  ).optional().describe('List of business alerts'),
})

// ============ TYPE DEFINITIONS ============

export type MetricCardProps = z.infer<typeof metricCardSchema>
export type StatusBadgeProps = z.infer<typeof statusBadgeSchema>
export type GraphCardProps = z.infer<typeof graphCardSchema>
export type BusinessSummaryTableProps = z.infer<typeof businessSummaryTableSchema>
export type InsightCardProps = z.infer<typeof insightCardSchema>
export type ComparisonCardProps = z.infer<typeof comparisonCardSchema>
export type AlertListProps = z.infer<typeof alertListSchema>

// ============ COMPONENT REGISTRATION ============

// Define our extended interface that includes examples
interface ExtendedTamboComponent extends Omit<TamboComponent, 'propsSchema'> {
  propsSchema: z.ZodSchema
  examples?: Array<Record<string, any>>
}

export function registerTamboComponents(): TamboComponent[] {
  const components: ExtendedTamboComponent[] = [
    {
      name: 'MetricCard',
      description: 'Display a single business KPI with value and trend indicator',
      component: MetricCard,
      propsSchema: metricCardSchema,
      examples: [
        { title: 'Monthly Revenue', value: '$245,000', trend: 'up', change: '+12%' },
        { title: 'Active Users', value: '15,280', trend: 'up', change: '+8%' }
      ]
    },
    {
      name: 'StatusBadge',
      description: 'Show business health or operational status',
      component: StatusBadge,
      propsSchema: statusBadgeSchema,
      examples: [
        { label: 'System Health', status: 'success' },
        { label: 'Service Status', status: 'warning' }
      ]
    },
    {
      name: 'GraphCard',
      description: 'Visualize business trends or data distributions with charts. Use line for trends, bar for comparisons, pie for proportions.',
      component: GraphCard,
      propsSchema: graphCardSchema,
      examples: [
        { title: 'Revenue Growth', type: 'line', data: [{label: 'Jan', value: 100}, {label: 'Feb', value: 150}] },
        { title: 'Market Share', type: 'pie', data: [{label: 'Product A', value: 40}, {label: 'Product B', value: 60}] }
      ]
    },
    {
      name: 'BusinessSummaryTable',
      description: 'Display multiple business metrics in a table format with status indicators',
      component: BusinessSummaryTable,
      propsSchema: businessSummaryTableSchema,
      examples: [
        {
          title: 'Financial Summary',
          columns: ['Metric', 'Value', 'Status'],
          rows: [
            { item: 'Revenue', value: '$245K', status: 'success' },
            { item: 'Expenses', value: '$85K', status: 'warning' }
          ]
        }
      ]
    },
    {
      name: 'InsightCard',
      description: 'Present AI-generated business insights and recommendations',
      component: InsightCard,
      propsSchema: insightCardSchema,
      examples: [
        {
          title: 'Growth Opportunity',
          insight: 'Customer acquisition cost decreased by 15% while conversion rate increased by 8%',
          severity: 'positive',
          recommendations: ['Scale successful channels', 'Optimize landing pages']
        }
      ]
    },
    {
      name: 'ComparisonCard',
      description: 'Compare two business values side by side with a verdict',
      component: ComparisonCard,
      propsSchema: comparisonCardSchema,
      examples: [
        {
          title: 'Q1 vs Q2 Performance',
          leftLabel: 'Q1 Revenue',
          leftValue: '$200,000',
          rightLabel: 'Q2 Revenue',
          rightValue: '$245,000',
          difference: '+$45,000',
          percentageChange: '+22.5%',
          verdict: 'better'
        }
      ]
    },
    {
      name: 'AlertList',
      description: 'Display business alerts with priority levels, timestamps, and recommended actions.',
      component: AlertList,
      propsSchema: alertListSchema,
      examples: [
        {
          title: 'System Alerts',
          alerts: [
            {
              title: 'Database Latency',
              description: 'Response time exceeds 500ms threshold',
              level: 'warning',
              timestamp: '10 minutes ago',
              action: 'Check database performance'
            }
          ]
        }
      ]
    },
  ]

  // Convert to TamboComponent by removing the examples property
  return components.map(({ examples, ...component }) => component as TamboComponent)
}

// Helper function to map component names to types
export function getComponentType(name: string): string {
  const map: Record<string, string> = {
    'MetricCard': 'metric',
    'GraphCard': 'graph',
    'BusinessSummaryTable': 'table',
    'ComparisonCard': 'comparison',
    'InsightCard': 'insight',
    'AlertList': 'alert',
    'StatusBadge': 'status'
  }
  return map[name] || 'unknown'
}