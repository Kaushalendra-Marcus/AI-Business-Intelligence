'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface QueryGroup {
  id: string
  userQuery: string
  timestamp: string
  company: string
  componentIds: string[]
  collapsed: boolean
  color: string
}

interface QueryGroupsStore {
  queryGroups: QueryGroup[]
  activeQueryId: string | null
  
  // Actions
  addQueryGroup: (userQuery: string, company: string, componentIds: string[]) => string
  updateQueryGroup: (id: string, updates: Partial<QueryGroup>) => void
  removeQueryGroup: (id: string) => void
  toggleQueryGroupCollapsed: (id: string) => void
  setActiveQuery: (id: string | null) => void
  clearAllQueries: () => void
  
  // Getters
  getGroupByComponentId: (componentId: string) => QueryGroup | null
  getGroupComponents: (groupId: string) => string[]
}

export const useQueryGroupsStore = create<QueryGroupsStore>()(
  persist(
    (set, get) => ({
      queryGroups: [],
      activeQueryId: null,
      
      addQueryGroup: (userQuery, company, componentIds) => {
        const id = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        
        const colors = [
          'bg-gradient-to-r from-blue-500 to-blue-600',
          'bg-gradient-to-r from-green-500 to-green-600',
          'bg-gradient-to-r from-orange-500 to-orange-600',
          'bg-gradient-to-r from-purple-500 to-purple-600',
          'bg-gradient-to-r from-red-500 to-red-600',
          'bg-gradient-to-r from-pink-500 to-pink-600',
          'bg-gradient-to-r from-indigo-500 to-indigo-600',
          'bg-gradient-to-r from-teal-500 to-teal-600',
        ]
        
        const group: QueryGroup = {
          id,
          userQuery: userQuery.length > 100 ? userQuery.substring(0, 100) + '...' : userQuery,
          timestamp: new Date().toISOString(),
          company,
          componentIds,
          collapsed: false,
          color: colors[get().queryGroups.length % colors.length]
        }
        
        set((state) => ({
          queryGroups: [group, ...state.queryGroups], // Newest first
          activeQueryId: id
        }))
        
        return id
      },
      
      updateQueryGroup: (id, updates) => {
        set((state) => ({
          queryGroups: state.queryGroups.map(group =>
            group.id === id ? { ...group, ...updates } : group
          )
        }))
      },
      
      removeQueryGroup: (id) => {
        set((state) => ({
          queryGroups: state.queryGroups.filter(group => group.id !== id)
        }))
      },
      
      toggleQueryGroupCollapsed: (id) => {
        set((state) => ({
          queryGroups: state.queryGroups.map(group =>
            group.id === id ? { ...group, collapsed: !group.collapsed } : group
          )
        }))
      },
      
      setActiveQuery: (id) => {
        set({ activeQueryId: id })
      },
      
      clearAllQueries: () => {
        set({ queryGroups: [], activeQueryId: null })
      },
      
      getGroupByComponentId: (componentId) => {
        const state = get()
        return state.queryGroups.find(group =>
          group.componentIds.includes(componentId)
        ) || null
      },
      
      getGroupComponents: (groupId) => {
        const group = get().queryGroups.find(g => g.id === groupId)
        return group ? group.componentIds : []
      }
    }),
    {
      name: 'query-groups-store',
    }
  )
)