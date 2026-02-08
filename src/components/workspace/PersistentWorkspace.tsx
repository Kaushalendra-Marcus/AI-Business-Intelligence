'use client'

import { useWorkspaceStore } from '@/lib/store/workspace-store'
import MetricCard from '@/components/tambo/MetricCard'
import GraphCard from '@/components/tambo/GraphCard'
import BusinessSummaryTable from '@/components/tambo/BusinessSummaryTable'
import ComparisonCard from '@/components/tambo/ComparisonCard'
import InsightCard from '@/components/tambo/InsightCard'
import AlertList from '@/components/tambo/AlertList'
import StatusBadge from '@/components/tambo/StatusBadge'
import { useMemo, useState } from 'react'

// Mock user messages for demonstration
const MOCK_USER_MESSAGES = [
  {
    id: 'msg-1',
    content: "Show me the current system status and key metrics",
    timestamp: "10:30 AM",
    role: 'user'
  },
  {
    id: 'msg-2',
    content: "Generate revenue insights for Q4 2024",
    timestamp: "10:45 AM",
    role: 'user'
  },
  {
    id: 'msg-3',
    content: "Create a comparison between Q3 and Q4 performance",
    timestamp: "11:15 AM",
    role: 'user'
  }
];

export default function PersistentWorkspace() {
  // Access store data directly
  const componentsMap = useWorkspaceStore(state => state.components)
  const componentOrder = useWorkspaceStore(state => state.componentOrder)
  const removeComponent = useWorkspaceStore(state => state.removeComponent)
  const clearWorkspace = useWorkspaceStore(state => state.clearWorkspace)
  const [showMessages, setShowMessages] = useState(true)

  // Memoize the components array to prevent infinite re-renders
  const components = useMemo(() => {
    return componentOrder
      .map(id => componentsMap[id])
      .filter(Boolean)
  }, [componentsMap, componentOrder])

  // Function to get grid column span
  const getComponentColSpan = (type: string): string => {
    switch (type) {
      case 'graph':
        return 'md:col-span-2 lg:col-span-2 xl:col-span-2';
      case 'table':
      case 'alert':
      case 'comparison':
        return 'md:col-span-2';
      case 'status':
        return 'md:col-span-2 lg:col-span-2';
      case 'insight':
        return 'md:col-span-2 lg:col-span-2 xl:col-span-2';
      default:
        return '';
    }
  }

  // Function to get component height class
  const getComponentSizeClass = (type: string): string => {
    switch (type) {
      case 'metric':
        // Half-height card
        return 'h-auto min-h-[180px] max-h-[220px]';

      case 'status':
      case 'graph':
      case 'insight':
      case 'comparison':
      case 'table':
      case 'alert':
        // Full-height cards (same for all)
        return 'h-auto min-h-[360px] max-h-[420px]';

      default:
        return 'h-auto min-h-[360px] max-h-[420px]';
    }
  }


  // Function to get grid row span
  const getComponentRowSpan = (type: string): string => {
    switch (type) {
      case 'metric':
        return 'row-span-1';
      case 'status':
        return 'row-span-2';
      case 'graph':
        return 'row-span-3';
      case 'comparison':
        return 'row-span-2';
      case 'insight':
        return 'row-span-2';
      case 'table':
      case 'alert':
        return 'row-span-3';
      default:
        return 'row-span-1';
    }
  }

  const renderComponent = (component: any) => {
    try {
      switch (component.type) {
        case 'metric':
          return <MetricCard key={component.id} {...component.props} />
        case 'graph':
          return <GraphCard key={component.id} {...component.props} />
        case 'table':
          return <BusinessSummaryTable key={component.id} {...component.props} />
        case 'comparison':
          return <ComparisonCard key={component.id} {...component.props} />
        case 'insight':
          return (
            <div className="h-full w-full">
              <InsightCard key={component.id} {...component.props} />
            </div>
          )
        case 'alert':
          return <AlertList key={component.id} {...component.props} />
        case 'status':
          return (
            <div className="w-full h-full">
              <StatusBadge key={component.id} {...component.props} />
            </div>
          )
        default:
          console.warn('⚠️ Unknown component type:', component.type)
          return null
      }
    } catch (error) {
      console.error('❌ Error rendering component:', component.type, error)
      return (
        <div key={component.id} className="p-4 bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl">
          <div className="flex items-center mb-2">
            <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.346 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm font-medium text-red-800">Error rendering {component.type}</p>
          </div>
          <p className="text-xs text-red-600">Please try regenerating this component</p>
        </div>
      )
    }
  }

  // Empty state
  if (components.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
            AI-Powered Business Intelligence
          </h3>
          <p className="text-gray-600 mb-6 leading-relaxed">
            Ask questions in the chat to generate interactive business intelligence components. Your workspace will automatically save all generated components.
          </p>
          <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-sm font-medium text-gray-700 mb-3">💡 Try asking:</p>
            <div className="space-y-2">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm text-gray-600">"Show revenue metrics for this quarter"</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm text-gray-600">"Compare sales performance between regions"</p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <p className="text-sm text-gray-600">"Generate system status dashboard"</p>
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-center text-xs text-gray-500">
            <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Components are automatically saved to your workspace
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden flex flex-col bg-gray-50">
      {/* Header with controls */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse shadow-sm"></div>
            <span className="text-sm font-semibold text-gray-900">
              {components.length} {components.length === 1 ? 'Component' : 'Components'}
            </span>
          </div>

          <div className="hidden md:flex items-center text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <svg className="w-3.5 h-3.5 mr-1.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Auto-saved workspace
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle user messages */}
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="hidden md:flex items-center text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <svg className={`w-4 h-4 mr-2 ${showMessages ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
            {showMessages ? 'Hide Messages' : 'Show Messages'}
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all components from workspace?')) {
                clearWorkspace()
              }
            }}
            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-red-200"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-hidden flex">
        {/* User Messages Panel */}
        {showMessages && components.length > 0 && (
          <div className="hidden md:flex flex-col w-80 border-r border-gray-200 bg-white flex-shrink-0">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
                User Requests
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {MOCK_USER_MESSAGES.map((message) => (
                  <div
                    key={message.id}
                    className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-2 shadow-sm">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="text-sm font-medium text-blue-800">You</span>
                      </div>
                      <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{message.timestamp}</span>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed">{message.content}</p>
                    <div className="mt-3 pt-3 border-t border-blue-200 border-opacity-50">
                      <div className="flex items-center text-xs text-blue-600">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Generated components below
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new message prompt */}
              <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl">
                <p className="text-sm font-medium text-gray-700 mb-2">Want to add more components?</p>
                <p className="text-xs text-gray-600 mb-3">Go back to chat to generate new insights</p>
                <button
                  onClick={() => window.location.href = '/chat'}
                  className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg border border-blue-200 transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Go to Chat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Components Grid */}
        <div className="flex-1 overflow-y-auto p-6 workspace-scroll-container">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[minmax(200px,auto)]">
            {components.map((component) => {
              const sizeClass = getComponentSizeClass(component.type)
              const rowSpan = getComponentRowSpan(component.type)
              const colSpan = getComponentColSpan(component.type)

              return (
                <div
                  key={component.id}
                  className={`relative group ${rowSpan} ${colSpan} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
                >
                  {/* Component type badge */}
                  <div className="absolute -top-2 left-3 z-10">
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg capitalize">
                      {component.type}
                    </span>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => removeComponent(component.id)}
                    className="absolute -top-2 -right-2 z-20 w-7 h-7 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110 hover:shadow-xl flex items-center justify-center"
                    title="Remove component"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  {/* Component container */}
                  <div className={`${sizeClass} w-full h-full bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md overflow-hidden transition-shadow duration-300`}>
                    {renderComponent(component)}
                  </div>

                  {/* Hover overlay effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
                </div>
              )
            })}
          </div>

          {/* Empty space message */}
          {components.length > 0 && (
            <div className="mt-8 max-w-2xl mx-auto text-center">
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600 mb-2">Your workspace is automatically saved</p>
              <p className="text-xs text-gray-500">Add more components by going back to the chat interface</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile bottom bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-gray-900">
            {components.length} items
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMessages(!showMessages)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
            </svg>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Clear all components?')) {
                clearWorkspace()
              }
            }}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}