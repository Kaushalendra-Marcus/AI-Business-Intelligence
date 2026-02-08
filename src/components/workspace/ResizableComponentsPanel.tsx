'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useWorkspaceStore } from '@/lib/store/workspace-store'
import { useQueryGroupsStore } from '@/lib/store/query-groups-store'
import MetricCard from '@/components/tambo/MetricCard'
import GraphCard from '@/components/tambo/GraphCard'
import BusinessSummaryTable from '@/components/tambo/BusinessSummaryTable'
import ComparisonCard from '@/components/tambo/ComparisonCard'
import InsightCard from '@/components/tambo/InsightCard'
import AlertList from '@/components/tambo/AlertList'
import StatusBadge from '@/components/tambo/StatusBadge'
import QueryGroupCard from './QueryGroupCard'

interface ResizableComponentsPanelProps {
  isOpen: boolean
  onToggle: () => void
  defaultHeight?: number
  minHeight?: number
  maxHeight?: number
}

export default function ResizableComponentsPanel({
  isOpen,
  onToggle,
  defaultHeight = 400,
  minHeight = 200,
  maxHeight = 800
}: ResizableComponentsPanelProps) {
  const [panelHeight, setPanelHeight] = useState(defaultHeight)
  const [isResizing, setIsResizing] = useState(false)
  const [viewMode, setViewMode] = useState<'query' | 'company'>('query') // 'query' or 'company'
  const panelRef = useRef<HTMLDivElement>(null)
  
  // Store hooks
  const componentsMap = useWorkspaceStore(state => state.components)
  const componentOrder = useWorkspaceStore(state => state.componentOrder)
  const removeComponent = useWorkspaceStore(state => state.removeComponent)
  const clearWorkspace = useWorkspaceStore(state => state.clearWorkspace)
  
  const {
    queryGroups,
    activeQueryId,
    toggleQueryGroupCollapsed,
    removeQueryGroup,
    setActiveQuery,
    clearAllQueries,
    getGroupByComponentId
  } = useQueryGroupsStore()

  const components = componentOrder
    .map(id => componentsMap[id])
    .filter(Boolean)

  // Get components filtered by active query
  const getFilteredComponents = () => {
    if (viewMode === 'query' && activeQueryId) {
      const activeGroup = queryGroups.find(g => g.id === activeQueryId)
      if (activeGroup) {
        return components.filter(comp => 
          activeGroup.componentIds.includes(comp.id) && !activeGroup.collapsed
        )
      }
    }
    return components
  }

  const filteredComponents = getFilteredComponents()

  // Extract unique companies from query groups
  const uniqueCompanies = useMemo(() => {
    const companies = new Set<string>()
    queryGroups.forEach(group => {
      companies.add(group.company)
    })
    return Array.from(companies)
  }, [queryGroups])

  // Handle resize mouse down
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }

  // Handle mouse move for resizing
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !isOpen) return
    
    const newHeight = window.innerHeight - e.clientY
    if (newHeight >= minHeight && newHeight <= maxHeight) {
      setPanelHeight(newHeight)
    }
  }, [isResizing, isOpen, minHeight, maxHeight])

  // Handle mouse up to stop resizing
  const handleMouseUp = useCallback(() => {
    setIsResizing(false)
  }, [])

  // Add event listeners for resizing
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'row-resize'
    } else {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
    }
  }, [isResizing, handleMouseMove, handleMouseUp])

  // Helper function to get component size class
  const getComponentSizeClass = (type: string): string => {
    switch (type) {
      case 'metric':
        return 'h-48 min-h-[192px] max-h-[250px]';
      case 'status':
        return 'min-h-[280px] max-h-[350px]';
      case 'graph':
        return 'min-h-[320px] max-h-[400px]';
      case 'insight':
        return 'min-h-[300px] max-h-[380px]';
      case 'comparison':
        return 'min-h-[280px] max-h-[350px]';
      case 'table':
        return 'min-h-[320px] max-h-[420px]';
      case 'alert':
        return 'min-h-[300px] max-h-[400px]';
      default:
        return 'min-h-[250px] max-h-[350px]';
    }
  }

  // Helper function to get grid column span
  const getComponentColSpan = (type: string): string => {
    switch (type) {
      case 'graph':
        return 'sm:col-span-2 lg:col-span-2 xl:col-span-2';
      case 'table':
      case 'alert':
      case 'comparison':
        return 'sm:col-span-2';
      case 'status':
        return 'sm:col-span-2 lg:col-span-2';
      case 'insight':
        return 'sm:col-span-2 lg:col-span-2 xl:col-span-2';
      default:
        return '';
    }
  }

  // Helper function to get grid row span
  const getComponentRowSpan = (type: string): string => {
    switch (type) {
      case 'metric':
        return 'row-span-1';
      case 'status':
      case 'graph':
      case 'comparison':
      case 'insight':
      case 'table':
      case 'alert':
        return 'row-span-2';
      default:
        return 'row-span-1';
    }
  }

  // Render component based on type
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
          return <InsightCard key={component.id} {...component.props} />
        case 'alert':
          return <AlertList key={component.id} {...component.props} />
        case 'status':
          return <StatusBadge key={component.id} {...component.props} />
        default:
          return null
      }
    } catch (error) {
      console.error('Error rendering component:', error)
      return null
    }
  }

  // Get query group for a component
  const getComponentGroup = (componentId: string) => {
    return getGroupByComponentId(componentId)
  }

  // Get color for company badge
  const getCompanyColor = (company: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-orange-100 text-orange-800 border-orange-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-red-100 text-red-800 border-red-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-pink-100 text-pink-800 border-pink-200',
    ]
    
    const hash = company.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return colors[hash % colors.length]
  }

  if (!isOpen) return null

  return (
    <div 
      ref={panelRef}
      className="relative border-t border-gray-300 bg-white shadow-lg"
      style={{ height: `${panelHeight}px` }}
    >
      {/* Resize handle */}
      <div
        className="absolute top-0 left-0 right-0 h-2 bg-transparent hover:bg-blue-300 active:bg-blue-500 cursor-row-resize flex items-center justify-center"
        onMouseDown={handleResizeMouseDown}
      >
        <div className="w-16 h-1 bg-gray-400 rounded-full"></div>
      </div>

      {/* Panel Header */}
      <div className="px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Collapse panel"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <h3 className="text-sm font-semibold text-gray-900">
            {viewMode === 'query' ? 'Query Groups' : 'Company View'} ({components.length} components)
          </h3>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 ml-4">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('query')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'query'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                By Query ({queryGroups.length})
              </button>
              <button
                onClick={() => setViewMode('company')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  viewMode === 'company'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                By Company ({uniqueCompanies.length})
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Fullscreen Toggle */}
          <button
            onClick={() => setPanelHeight(panelHeight === maxHeight ? defaultHeight : maxHeight)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title={panelHeight === maxHeight ? "Normal view" : "Fullscreen"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {panelHeight === maxHeight ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              )}
            </svg>
          </button>
          
          <button
            onClick={() => {
              if (window.confirm('Clear all components and query groups?')) {
                clearWorkspace()
                clearAllQueries()
              }
            }}
            className="px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Query Groups Sidebar (when in query view mode) */}
      {viewMode === 'query' && queryGroups.length > 0 && (
        <div className="flex h-[calc(100%-60px)]">
          {/* Left: Query Groups List */}
          <div className="w-80 border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="space-y-3">
                {queryGroups.map((group) => (
                  <QueryGroupCard
                    key={group.id}
                    group={group}
                    isActive={activeQueryId === group.id}
                    onToggle={() => toggleQueryGroupCollapsed(group.id)}
                    onRemove={() => {
                      // Remove components associated with this group
                      group.componentIds.forEach(id => removeComponent(id))
                      removeQueryGroup(group.id)
                    }}
                    onActivate={() => setActiveQuery(group.id)}
                  />
                ))}
              </div>
              
              {/* No active query selected message */}
              {!activeQueryId && (
                <div className="mt-8 text-center text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-sm">Select a query group to view its components</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right: Components Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeQueryId ? (
              filteredComponents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium">No components in this group</p>
                  <p className="text-sm mt-1">The query group may be collapsed or empty</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[minmax(200px,auto)]">
                  {filteredComponents.map((component) => {
                    const sizeClass = getComponentSizeClass(component.type)
                    const rowSpan = getComponentRowSpan(component.type)
                    const colSpan = getComponentColSpan(component.type)
                    const group = getComponentGroup(component.id)
                    
                    return (
                      <div 
                        key={component.id} 
                        className={`relative group ${rowSpan} ${colSpan}`}
                      >
                        {/* Remove Button */}
                        <button
                          onClick={() => removeComponent(component.id)}
                          className="absolute -top-2 -right-2 z-20 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 flex items-center justify-center border-2 border-white"
                          title="Remove component"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        
                        {/* Component Container */}
                        <div className={`${sizeClass} w-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
                          {renderComponent(component)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <svg className="w-20 h-20 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Select a Query Group</h3>
                  <p className="text-sm text-gray-500">Click on any query group in the sidebar to view its components</p>
                  <div className="mt-4 text-xs text-gray-400">
                    <p>• Each group contains components from one user query</p>
                    <p>• Click the collapse button (↓) to hide components</p>
                    <p>• Hover over a group to see delete option</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Company View Mode */}
      {viewMode === 'company' && (
        <div className="h-[calc(100%-60px)] overflow-y-auto p-4">
          {uniqueCompanies.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium">No components found</p>
              <p className="text-sm mt-1">Generate some components by asking about companies</p>
            </div>
          ) : (
            <>
              {/* Company Filter Tabs */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setActiveQuery(null)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                      !activeQueryId
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Companies ({components.length})
                  </button>
                  
                  {uniqueCompanies.map(company => {
                    const companyComponents = components.filter(comp => 
                      getComponentGroup(comp.id)?.company === company
                    )
                    return (
                      <button
                        key={company}
                        onClick={() => {
                          const group = queryGroups.find(g => g.company === company)
                          if (group) setActiveQuery(group.id)
                        }}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                          activeQueryId === (queryGroups.find(g => g.company === company)?.id || null)
                            ? `${getCompanyColor(company).split(' ')[0]} ${getCompanyColor(company).split(' ')[2]}`
                            : `bg-gray-100 text-gray-700 hover:bg-gray-200`
                        }`}
                      >
                        {company} ({companyComponents.length})
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {/* Components Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[minmax(200px,auto)]">
                {filteredComponents.map((component) => {
                  const sizeClass = getComponentSizeClass(component.type)
                  const rowSpan = getComponentRowSpan(component.type)
                  const colSpan = getComponentColSpan(component.type)
                  const group = getComponentGroup(component.id)
                  
                  return (
                    <div 
                      key={component.id} 
                      className={`relative group ${rowSpan} ${colSpan}`}
                    >
                      {/* Company Badge */}
                      {group && (
                        <div className={`absolute -top-2 left-3 z-10 px-2 py-0.5 text-xs font-medium rounded-full border ${getCompanyColor(group.company)}`}>
                          {group.company}
                        </div>
                      )}
                      
                      {/* Query Preview Tooltip */}
                      {group && (
                        <div className="absolute opacity-0 group-hover:opacity-100 transition-opacity -top-8 left-0 z-30 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap pointer-events-none">
                          {group.userQuery}
                          <div className="absolute bottom-0 left-3 transform translate-y-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeComponent(component.id)}
                        className="absolute -top-2 -right-2 z-20 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600 flex items-center justify-center border-2 border-white"
                        title="Remove component"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      
                      {/* Component Container */}
                      <div className={`${sizeClass} w-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden`}>
                        {renderComponent(component)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}