'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WorkspaceComponentType =
  | 'metric'
  | 'graph'
  | 'table'
  | 'comparison'
  | 'insight'
  | 'alert'
  | 'status'

export interface WorkspaceComponent {
  id: string
  type: WorkspaceComponentType
  props: Record<string, any>
  title?: string
  description?: string
  aiGenerated: boolean
  createdAt: string
  updatedAt: string
}

export interface UploadedFile {
  id: string
  name: string
  type: 'csv' | 'pdf' | 'image' | 'excel'
  size: number
  uploadedAt: string
  processed: boolean
  url?: string
}

interface WorkspaceStore {
  // Components
  components: Record<string, WorkspaceComponent>
  componentOrder: string[]
  activeComponentCount: number

  // Uploads
  uploadedFiles: UploadedFile[]

  // Actions
  addComponent: (type: WorkspaceComponentType, props: Record<string, any>) => string | null
  updateComponent: (id: string, updates: Partial<WorkspaceComponent>) => void
  removeComponent: (id: string) => void
  clearWorkspace: () => void
  reorderComponents: (fromIndex: number, toIndex: number) => void

  // Upload actions
  addUploadedFile: (file: File) => Promise<string>
  removeUploadedFile: (id: string) => void
  markFileProcessed: (id: string) => void

  // Getters
  getComponents: () => WorkspaceComponent[]
  getComponentCountByType: () => Record<WorkspaceComponentType, number>
  getUploadStats: () => { total: number; processed: number; pending: number }
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      components: {},
      componentOrder: [],
      activeComponentCount: 0,
      uploadedFiles: [],

  // ===== ENHANCED workspace - store.ts(Add more logging) =====
  // In the addComponent function, add detailed logging:

  addComponent: (type, props) => {
    const id = `comp_${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const now = new Date().toISOString()

    console.log(`🛠️ ADDING COMPONENT:`, {
      type,
      props,
      id,
      timestamp: now
    })

    const component: WorkspaceComponent = {
      id,
      type,
      props,
      title: props?.title || `Untitled ${type}`,
      description: props?.description || `AI-generated ${type}`,
      aiGenerated: true,
      createdAt: now,
      updatedAt: now
    }

    console.log(`✅ Component created:`, component)

    set((state) => {
      const newComponents = {
        ...state.components,
        [id]: component
      }

      console.log(`📊 Workspace state updated:`, {
        componentCount: Object.keys(newComponents).length,
        componentOrder: [...state.componentOrder, id],
        componentId: id
      })

      return {
        components: newComponents,
        componentOrder: [...state.componentOrder, id],
        activeComponentCount: Object.keys(newComponents).length
      }
    })

    return id
  },
    updateComponent: (id, updates) => {
      const existing = get().components[id]
      if (!existing) {
        console.warn(`⚠️ Cannot update component ${id}: not found`)
        return
      }

      console.log(`🔄 Updating component ${id}`)

      set((state) => ({
        components: {
          ...state.components,
          [id]: {
            ...existing,
            ...updates,
            updatedAt: new Date().toISOString()
          }
        }
      }))
    },

    removeComponent: (id) => {
      console.log(`🗑️ Removing component ${id}`)

      set((state) => {
        const { [id]: removed, ...remainingComponents } = state.components
        const newOrder = state.componentOrder.filter(compId => compId !== id)

        return {
          components: remainingComponents,
          componentOrder: newOrder,
          activeComponentCount: Object.keys(remainingComponents).length
        }
      })
    },

    clearWorkspace: () => {
      console.log('🧹 Clearing entire workspace')

      set({
        components: {},
        componentOrder: [],
        activeComponentCount: 0
      })
    },

    reorderComponents: (fromIndex, toIndex) => {
      console.log(`🔀 Reordering components: ${fromIndex} → ${toIndex}`)

      set((state) => {
        const newOrder = [...state.componentOrder]
        const [moved] = newOrder.splice(fromIndex, 1)
        newOrder.splice(toIndex, 0, moved)

        return { componentOrder: newOrder }
      })
    },

    addUploadedFile: async (file: File) => {
      const id = `file_${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      const fileType = determineFileType(file)

      // Create object URL for preview
      const url = URL.createObjectURL(file)

      const uploadedFile: UploadedFile = {
        id,
        name: file.name,
        type: fileType,
        size: file.size,
        uploadedAt: new Date().toISOString(),
        processed: false,
        url
      }

      console.log(`📁 Adding uploaded file: ${file.name}`)

      set((state) => ({
        uploadedFiles: [uploadedFile, ...state.uploadedFiles]
      }))

      return id
    },

    removeUploadedFile: (id) => {
      console.log(`🗑️ Removing uploaded file: ${id}`)

      set((state) => ({
        uploadedFiles: state.uploadedFiles.filter(file => file.id !== id)
      }))
    },

    markFileProcessed: (id) => {
      console.log(`✅ Marking file as processed: ${id}`)

      set((state) => ({
        uploadedFiles: state.uploadedFiles.map(file =>
          file.id === id ? { ...file, processed: true } : file
        )
      }))
    },

    getComponents: () => {
      const { components, componentOrder } = get()
      return componentOrder
        .map(id => components[id])
        .filter(Boolean)
    },

    getComponentCountByType: () => {
      const components = get().getComponents()
      const counts = {
        metric: 0,
        graph: 0,
        table: 0,
        comparison: 0,
        insight: 0,
        alert: 0,
        status: 0
      }

      components.forEach(comp => {
        counts[comp.type]++
      })

      return counts
    },

    getUploadStats: () => {
      const files = get().uploadedFiles
      const total = files.length
      const processed = files.filter(f => f.processed).length
      const pending = total - processed

      return { total, processed, pending }
    }
    }),
{
  name: 'ai-workspace-store',
    partialize: (state) => ({
      components: state.components,
      componentOrder: state.componentOrder,
      uploadedFiles: state.uploadedFiles
    })
}
  )
)

function determineFileType(file: File): UploadedFile['type'] {
  const name = file.name.toLowerCase()
  const type = file.type

  if (type.includes('csv') || name.endsWith('.csv')) return 'csv'
  if (type.includes('pdf') || name.endsWith('.pdf')) return 'pdf'
  if (type.includes('excel') || type.includes('spreadsheet') ||
    name.endsWith('.xlsx') || name.endsWith('.xls')) return 'excel'
  if (type.includes('image')) return 'image'

  return 'csv' // default
}