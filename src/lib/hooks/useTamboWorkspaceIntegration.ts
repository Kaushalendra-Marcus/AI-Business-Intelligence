'use client'

import { useEffect, useRef } from 'react'
import { useTamboThread } from '@tambo-ai/react'
import { useWorkspaceStore, WorkspaceComponentType } from '@/lib/store/workspace-store'

export function useTamboWorkspaceIntegration() {
  const { thread } = useTamboThread()
  const { addComponent } = useWorkspaceStore()
  
  // Track which messages have been successfully processed (extracted components from)
  const processedMessageIds = useRef<Set<string>>(new Set())
  
  // Track message content lengths to detect updates
  const messageContentLengths = useRef<Map<string, number>>(new Map())
  
  // Track processing timers to debounce rapid updates
  const processingTimers = useRef<Map<string, NodeJS.Timeout>>(new Map())

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

  // Helper to extract text content (matching ChatInterface.tsx logic)
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

  useEffect(() => {
    if (!thread?.messages) return

    const messages = thread.messages
    
    // Get assistant messages
    const assistantMessages = messages.filter(msg => msg.role === 'assistant')
    
    console.log(`\n🔍 Checking ${assistantMessages.length} assistant messages for updates`)

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
      // This handles cases where a message gets more components streamed later
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

      // Set new timer - reduced to 800ms for faster response
      const timer = setTimeout(() => {
        console.log(`\n📨 Processing message: ${message.id.substring(0, 20)}...`)
        console.log(`   Final length: ${currentLength} chars`)

        // Extract components from text
        const components = extractComponentsFromText(text)
        
        if (components.length > 0) {
          console.log(`   ✅ Found ${components.length} components to add`)
          
          let successfullyAdded = 0
          components.forEach((component, idx) => {
            console.log(`      ${idx + 1}. ${component.type}: "${component.props.title || 'Untitled'}"`)
            
            try {
              const id = addComponent(component.type, component.props)
              console.log(`         ✅ Added with ID: ${id}`)
              successfullyAdded++
            } catch (error) {
              console.error(`         ❌ Failed:`, error)
            }
          })
          
          // Only mark as processed if we successfully added components
          if (successfullyAdded > 0) {
            processedMessageIds.current.add(message.id)
            console.log(`   ✅ Message marked as processed (${successfullyAdded} components added)`)
          }
        } else {
          console.log(`   ℹ️  No components found - message may still be streaming`)
          // Don't mark as processed - might get more content later
        }

        // Clean up timer
        processingTimers.current.delete(message.id)
      }, 1000) // Reduced from 1000ms to 800ms for faster response

      processingTimers.current.set(message.id, timer)
    })

    // Cleanup function
    return () => {
      processingTimers.current.forEach(timer => clearTimeout(timer))
    }
  }, [thread?.messages, addComponent])

  // Extract components from text
  const extractComponentsFromText = (text: string): Array<{type: WorkspaceComponentType, props: any}> => {
    const components: Array<{type: WorkspaceComponentType, props: any}> = []
    
    // Split by spaces to handle multiple JSON objects on same line
    const potentialJsonStarts: number[] = []
    
    // Find all positions where JSON might start
    for (let i = 0; i < text.length - 20; i++) {
      if (text.substring(i, i + 16) === '{"type":"tool","') {
        potentialJsonStarts.push(i)
      }
    }
    
    console.log(`   🔍 Found ${potentialJsonStarts.length} potential JSON start positions`)
    
    // Extract JSON from each start position
    potentialJsonStarts.forEach((startPos, idx) => {
      // Find matching closing brace
      let braceCount = 0
      let inString = false
      let escapeNext = false
      let endPos = -1
      
      for (let i = startPos; i < text.length; i++) {
        const char = text[i]
        
        if (escapeNext) {
          escapeNext = false
          continue
        }
        
        if (char === '\\') {
          escapeNext = true
          continue
        }
        
        if (char === '"') {
          inString = !inString
        }
        
        if (!inString) {
          if (char === '{') {
            braceCount++
          } else if (char === '}') {
            braceCount--
            if (braceCount === 0) {
              endPos = i + 1
              break
            }
          }
        }
      }
      
      if (endPos > startPos) {
        const jsonStr = text.substring(startPos, endPos)
        
        try {
          const obj = JSON.parse(jsonStr)
          
          if (obj.type === 'tool' && obj.name?.startsWith('show_component_')) {
            const componentName = obj.name.replace('show_component_', '')
            const workspaceType = componentNameMap[componentName]
            
            if (workspaceType && obj.args) {
              console.log(`      ✅ Extracted: ${componentName}`)
              
              components.push({
                type: workspaceType,
                props: cleanTamboArgs(obj.args)
              })
            } else {
              console.log(`      ⚠️  Unknown component: ${componentName}`)
            }
          }
        } catch (error) {
          console.log(`      ❌ JSON parse error at position ${startPos}`)
        }
      } else {
        console.log(`      ⚠️  No closing brace found for JSON at position ${startPos}`)
      }
    })
    
    return components
  }

  // Clean Tambo internal fields
  const cleanTamboArgs = (args: any): any => {
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

  return { processedMessages: processedMessageIds.current.size }
}