'use client'

import { z } from 'zod'
import { insightCardSchema } from '@/lib/tambo/schemas'

type InsightCardProps = z.infer<typeof insightCardSchema>

export default function InsightCard({
  title = 'Business Insight',
  insight = '',
  severity = 'neutral',
  recommendations = [],
  confidence = 85,
  sources = [],
  tags = [],
  actionItems = []
}: InsightCardProps) {

  const config = getSeverityConfig(severity)
  const validatedInsight = insight || getDefaultInsight(severity)
  const validatedRecommendations = recommendations.length > 0
    ? recommendations.slice(0, 3)
    : getDefaultRecommendations(severity)
  const validatedActionItems = actionItems.length > 0
    ? actionItems.slice(0, 3)
    : getDefaultActionItems(severity)

  return (
    <div className={`border ${config.border} rounded-2xl p-6 ${config.bg} shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col min-h-[250px] max-h-[500px]`}>
      {/* Header - Fixed */}
      <div className="flex-shrink-0">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-xl ${config.iconBg} shadow-sm`}>
              <div className={config.iconColor}>{config.icon}</div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bgDark} ${config.text} border ${config.border}`}>
                  {config.label}
                </span>
              </div>

              {/* Tags and Confidence */}
              <div className="flex flex-wrap items-center gap-3">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-0.5 bg-white/50 text-gray-700 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center text-sm">
                  <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                    <div
                      className={`h-1.5 rounded-full ${config.progressColor}`}
                      style={{ width: `${confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-gray-600">{confidence}% confidence</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sources indicator */}
          {sources.length > 0 && (
            <div className="text-xs text-gray-500">
              {sources.length} data source{sources.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto min-h-[150px]">
        {/* Insight Content */}
        <div className="relative mb-6">
          <div className="absolute -left-1 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full"></div>
          <div className="bg-white/90 border border-gray-100 rounded-xl p-5 ml-3 shadow-sm backdrop-blur-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0 p-2 rounded-lg bg-blue-50 mr-4">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-700 leading-relaxed text-base">{validatedInsight}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        {validatedRecommendations.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommendations</h4>
            <ul className="space-y-3">
              {validatedRecommendations.map((rec, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3">
                    <div className={`w-2 h-2 rounded-full ${config.dotColor}`}></div>
                  </div>
                  <div className="bg-white/70 border border-gray-100 rounded-lg p-3 flex-1">
                    <p className="text-gray-700">{rec}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Items */}
        {validatedActionItems.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Action Items</h4>
            <div className="space-y-3">
              {validatedActionItems.map((action, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-gray-900">{action.title}</h5>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${action.priority === 'critical' ? 'bg-red-100 text-red-700' :
                        action.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                      }`}>
                      {action.priority.toUpperCase()}
                    </span>
                  </div>
                  {action.deadline && (
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Deadline: {action.deadline}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

// Helper functions
function getSeverityConfig(severity: string) {
  switch (severity.toLowerCase()) {
    case 'positive':
      return {
        bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
        bgDark: 'bg-gradient-to-r from-green-100 to-emerald-100',
        text: 'text-green-700',
        border: 'border-green-200',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Positive Insight',
        dotColor: 'bg-green-500',
        progressColor: 'bg-green-500'
      }
    case 'neutral':
      return {
        bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
        bgDark: 'bg-gradient-to-r from-blue-100 to-cyan-100',
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Neutral Insight',
        dotColor: 'bg-blue-500',
        progressColor: 'bg-blue-500'
      }
    case 'negative':
      return {
        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
        bgDark: 'bg-gradient-to-r from-red-100 to-rose-100',
        text: 'text-red-700',
        border: 'border-red-200',
        iconBg: 'bg-red-100',
        iconColor: 'text-red-600',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        label: 'Attention Required',
        dotColor: 'bg-red-500',
        progressColor: 'bg-red-500'
      }
    case 'critical':
      return {
        bg: 'bg-gradient-to-r from-orange-50 to-red-50',
        bgDark: 'bg-gradient-to-r from-orange-100 to-red-100',
        text: 'text-orange-700',
        border: 'border-orange-200',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-600',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        ),
        label: 'Critical Finding',
        dotColor: 'bg-orange-500',
        progressColor: 'bg-orange-500'
      }
    default:
      return {
        bg: 'bg-gradient-to-r from-gray-50 to-slate-50',
        bgDark: 'bg-gradient-to-r from-gray-100 to-slate-100',
        text: 'text-gray-700',
        border: 'border-gray-200',
        iconBg: 'bg-gray-100',
        iconColor: 'text-gray-600',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        label: 'Insight',
        dotColor: 'bg-gray-500',
        progressColor: 'bg-gray-500'
      }
  }
}

function getDefaultInsight(severity: string): string {
  switch (severity.toLowerCase()) {
    case 'positive':
      return 'Revenue growth accelerated by 12% this quarter, driven by successful product launches and improved customer retention strategies. Market share increased by 2.3 points in key segments.'
    case 'negative':
      return 'Customer acquisition costs increased by 18% while conversion rates declined by 3.2%. This indicates potential market saturation or competitive pressure requiring strategic adjustment.'
    case 'critical':
      return 'Critical system vulnerabilities detected in payment processing. Immediate action required to prevent potential security breaches and compliance violations.'
    default:
      return 'Analysis of Q3 performance shows stable growth patterns with moderate improvements across most metrics. Customer satisfaction remains high, indicating strong brand loyalty.'
  }
}

function getDefaultRecommendations(severity: string): string[] {
  switch (severity.toLowerCase()) {
    case 'positive':
      return [
        'Scale successful marketing channels by increasing budget allocation by 20%',
        'Expand product features based on customer feedback to maintain competitive edge',
        'Consider geographic expansion into untapped markets showing similar patterns'
      ]
    case 'negative':
      return [
        'Conduct A/B testing to optimize landing pages and reduce acquisition costs',
        'Review competitive pricing strategies and adjust offerings accordingly',
        'Implement customer feedback loop to identify pain points in conversion funnel'
      ]
    case 'critical':
      return [
        'Immediate security audit of payment processing systems',
        'Update security protocols and patch identified vulnerabilities',
        'Notify relevant stakeholders and prepare incident response plan'
      ]
    default:
      return [
        'Continue current growth strategies with minor optimizations',
        'Monitor market trends for early adoption opportunities',
        'Invest in employee training to maintain service quality'
      ]
  }
}

function getDefaultActionItems(severity: string) {
  switch (severity.toLowerCase()) {
    case 'positive':
      return [
        { title: 'Scale Marketing Campaign', priority: 'high', deadline: 'Next week' },
        { title: 'Product Roadmap Review', priority: 'medium', deadline: 'End of month' }
      ]
    case 'negative':
      return [
        { title: 'Cost Analysis Meeting', priority: 'high', deadline: 'Tomorrow' },
        { title: 'Competitor Research', priority: 'medium', deadline: 'This week' },
        { title: 'Conversion Funnel Review', priority: 'critical', deadline: 'ASAP' }
      ]
    case 'critical':
      return [
        { title: 'Security Patch Deployment', priority: 'critical', deadline: 'Today' },
        { title: 'Compliance Audit', priority: 'high', deadline: 'This week' },
        { title: 'Stakeholder Notification', priority: 'critical', deadline: 'Immediate' }
      ]
    default:
      return [
        { title: 'Performance Review Meeting', priority: 'medium', deadline: 'Next week' },
        { title: 'Quarterly Planning Session', priority: 'low', deadline: 'End of month' }
      ]
  }
}