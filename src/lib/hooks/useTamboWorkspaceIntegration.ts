'use client'

import { useEffect, useRef, useState } from 'react'
import { useTamboThread } from '@tambo-ai/react'
import { useWorkspaceStore, WorkspaceComponentType } from '@/lib/store/workspace-store'
import { useQueryGroupsStore } from '@/lib/store/query-groups-store'

export function useTamboWorkspaceIntegration() {
  const { thread } = useTamboThread()
  const { addComponent } = useWorkspaceStore()
  const { addQueryGroup, queryGroups } = useQueryGroupsStore()
  
  // Track which messages have been successfully processed
  const processedMessageIds = useRef<Set<string>>(new Set())
  const messageContentLengths = useRef<Map<string, number>>(new Map())
  const processingTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())
  
  // Track context groups
  const [contextGroups, setContextGroups] = useState<string[]>([])
  const [activeContext, setActiveContext] = useState<string>('')
  const lastProcessedContext = useRef<string>('')

  // Component name mapping
  const componentNameMap: Record<string, WorkspaceComponentType> = {
    'MetricCard': 'metric',
    'GraphCard': 'graph',
    'BusinessSummaryTable': 'table',
    'ComparisonCard': 'comparison',
    'InsightCard': 'insight',
    'AlertList': 'alert',
    'StatusBadge': 'status'
  }

  // Helper to extract text content
  const getMessageContent = (content: any): string => {
    if (typeof content === 'string') return content
    if (Array.isArray(content)) {
      return content
        .filter(item => item?.type === 'text')
        .map(item => item.text)
        .join('\n')
    }
    if (content?.type === 'text') return content.text
    return ''
  }

  // Extract context from user message
  const extractContext = (userMessage: string): {context: string, company: string} => {
    if (!userMessage) return { context: 'general', company: 'general' }
    
    const message = userMessage.toLowerCase().trim()
    
    // Extract company names
    const companies = [
      'amazon', 'microsoft', 'google', 'apple', 'facebook', 'meta', 'tesla', 'nike', 
      'adidas', 'campus x', 'red chief', 'walmart', 'coca-cola', 'pepsi', 'netflix',
      'disney', 'samsung', 'sony', 'intel', 'amd', 'ibm', 'oracle', 'salesforce'
    ]
    
    let foundCompany = ''
    for (const company of companies) {
      if (message.includes(company.toLowerCase())) {
        foundCompany = company
        break
      }
    }
    
    // If no company found, extract potential company from message
    if (!foundCompany) {
      // Look for patterns like "for [company]", "about [company]", "[company] metrics"
      const patterns = [
        /(?:for|about|of|on)\s+(\w+)/i,
        /(\w+)(?:\s+metrics|\s+data|\s+revenue|\s+growth)/i,
        /show\s+(?:\w+\s+)*for\s+(\w+)/i,
        /analyze\s+(?:\w+\s+)*(\w+)/i
      ]
      
      for (const pattern of patterns) {
        const match = message.match(pattern)
        if (match && match[1]) {
          const potentialCompany = match[1].toLowerCase()
          const commonWords = new Set(['the', 'a', 'an', 'my', 'our', 'their', 'this', 'that', 'these', 'those', 'all', 'some', 'any'])
          if (!commonWords.has(potentialCompany) && potentialCompany.length > 2) {
            foundCompany = potentialCompany
            break
          }
        }
      }
    }
    
    const company = foundCompany || 'general'
    const context = company !== 'general' ? company : `context_${simpleHash(message).substring(0, 8)}`
    
    return { context, company }
  }

  // Simple string hash function
  const simpleHash = (str: string): string => {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16)
  }

  useEffect(() => {
    if (!thread?.messages) return

    const messages = thread.messages
    const userMessages = messages.filter(msg => msg.role === 'user')
    const assistantMessages = messages.filter(msg => msg.role === 'assistant')

    // Extract context from the latest user message
    if (userMessages.length > 0) {
      const latestUserMessage = getMessageContent(userMessages[userMessages.length - 1].content)
      const { context: newContext, company } = extractContext(latestUserMessage)
      
      console.log(`📝 Extracted context: "${newContext}", company: "${company}" from message: "${latestUserMessage.substring(0, 50)}..."`)
      
      // Add to context groups if it's new
      setContextGroups(prev => {
        if (!prev.includes(newContext) && newContext !== 'general') {
          return [...prev, newContext]
        }
        return prev
      })
      
      setActiveContext(newContext)
      lastProcessedContext.current = newContext
    }

    console.log(`🔍 Checking ${assistantMessages.length} assistant messages`)
    console.log(`📊 Active context: ${activeContext}`)
    console.log(`📋 Available contexts: ${contextGroups.join(', ')}`)

    assistantMessages.forEach((message) => {
      // Extract text using the SAME logic as ChatInterface
      const text = getMessageContent(message.content)
      const currentLength = text.length
      
      // Get previous length
      const previousLength = messageContentLengths.current.get(message.id) || 0
      
      // Update stored length
      messageContentLengths.current.set(message.id, currentLength)
      
      // Check if this message was already successfully processed
      const alreadyProcessed = processedMessageIds.current.has(message.id)
      
      // Check if message content has changed (grown)
      const contentUpdated = currentLength > previousLength
      
      // CRITICAL FIX: Always process if content updated, even if previously processed
      if (alreadyProcessed && !contentUpdated) {
        return
      }
      
      // Skip if too short
      if (currentLength < 20) {
        return
      }
      
      // Skip if no component definitions
      if (!text.includes('show_component_')) {
        // Only mark as processed if message seems complete (not growing)
        if (!contentUpdated && currentLength > 0) {
          processedMessageIds.current.add(message.id)
        }
        return
      }

      // DEBOUNCE: Clear any existing timer for this message
      const existingTimer = processingTimers.current.get(message.id)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      // Set new timer
      const timer = setTimeout(() => {
        console.log(`📨 Processing message: ${message.id.substring(0, 20)}...`)
        console.log(`   Context: ${activeContext}`)

        // Extract components from text
        const components = extractComponentsFromText(text, activeContext)
        
        if (components.length > 0) {
          console.log(`   ✅ Found ${components.length} components to add`)
          
          let successfullyAdded = 0
          const componentIds: string[] = []
          
          // Deduplicate components within the same message
          const uniqueComponents = deduplicateComponents(components)
          
          uniqueComponents.forEach((component, idx) => {
            console.log(`      ${idx + 1}. ${component.type}: "${component.props.title || 'Untitled'}"`)
            
            try {
              const id = addComponent(component.type, component.props)
              if (id) {
                componentIds.push(id)
                console.log(`         ✅ Added with ID: ${id}`)
                successfullyAdded++
              }
            } catch (error) {
              console.error(`         ❌ Failed:`, error)
            }
          })
          
          // Create query group for this message if we have user message
          if (successfullyAdded > 0 && userMessages.length > 0) {
            const latestUserMessage = userMessages[userMessages.length - 1]
            const userContent = getMessageContent(latestUserMessage.content)
            const { company } = extractContext(userContent)
            
            try {
              // Check if this user message already has a query group by matching the beginning of the query
              const existingGroup = queryGroups.find(group => 
                group.userQuery.includes(userContent.substring(0, 50))
              )
              
              if (!existingGroup && componentIds.length > 0) {
                addQueryGroup(userContent, company, componentIds)
                console.log(`   📝 Created query group for: "${userContent.substring(0, 50)}..."`)
              }
            } catch (error) {
              console.error('   ❌ Failed to create query group:', error)
            }
          }
          
          // Only mark as processed if we successfully added components
          if (successfullyAdded > 0) {
            processedMessageIds.current.add(message.id)
            console.log(`   ✅ Message marked as processed (${successfullyAdded} components added)`)
          }
        } else {
          console.log(`   ℹ️  No components found - message may still be streaming`)
        }

        // Clean up timer
        processingTimers.current.delete(message.id)
      }, 500) // Reduced debounce time

      processingTimers.current.set(message.id, timer)
    })

    // Cleanup function
    return () => {
      processingTimers.current.forEach(timer => clearTimeout(timer))
    }
  }, [thread?.messages, addComponent, activeContext, addQueryGroup, queryGroups])

  // Extract components from text with context
  const extractComponentsFromText = (text: string, context: string): Array<{type: WorkspaceComponentType, props: any}> => {
    const components: Array<{type: WorkspaceComponentType, props: any}> = []
    
    // Split by lines to find JSON objects
    const lines = text.split('\n')
    
    lines.forEach(line => {
      line = line.trim()
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const obj = JSON.parse(line)
          
          if (obj.type === 'tool' && obj.name?.startsWith('show_component_')) {
            const componentName = obj.name.replace('show_component_', '')
            const workspaceType = componentNameMap[componentName]
            
            if (workspaceType && obj.args) {
              const cleanedProps = cleanTamboArgs(obj.args)
              // Add context to props for grouping/filtering
              cleanedProps._context = context
              
              components.push({
                type: workspaceType,
                props: cleanedProps
              })
            }
          }
        } catch (error) {
          console.log(`   ❌ JSON parse error in line:`, line.substring(0, 100), error)
        }
      }
    })
    
    return components
  }

  // Deduplicate components based on type and title
  const deduplicateComponents = (components: Array<{type: WorkspaceComponentType, props: any}>): Array<{type: WorkspaceComponentType, props: any}> => {
    const seen = new Set<string>()
    const unique: Array<{type: WorkspaceComponentType, props: any}> = []
    
    components.forEach(component => {
      const key = `${component.type}:${component.props.title || ''}:${component.props.value || ''}:${component.props._context || ''}`
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(component)
      }
    })
    
    return unique
  }

  // Clean Tambo internal fields
  const cleanTamboArgs = (args: any): any => {
    if (!args) return {}
    
    const cleaned = { ...args }
    
    const tamboInternalFields = [
      '_tambo_displayMessage',
      '_tambo_statusMessage', 
      '_tambo_completionStatusMessage',
      '_tambo_completionStatus',
      '_tambo_type',
      '_tambo_id'
    ]
    
    tamboInternalFields.forEach(field => {
      delete cleaned[field]
    })
    
    return cleaned
  }

  return { 
    processedMessages: processedMessageIds.current.size, 
    activeContext,
    contextGroups
  }
}