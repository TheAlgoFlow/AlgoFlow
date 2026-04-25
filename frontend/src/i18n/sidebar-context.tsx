'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'

type SidebarState = {
  isExpanded: boolean
  isMobileOpen: boolean
  toggle: () => void
  openMobile: () => void
  closeMobile: () => void
}

const SidebarContext = createContext<SidebarState | null>(null)

const STORAGE_KEY = 'algoflow_sidebar'

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Initialize from localStorage and detect mobile
  useEffect(() => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      setIsExpanded(false)
      applyDataAttr('collapsed')
      return
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    const expanded = stored !== 'collapsed'
    setIsExpanded(expanded)
    applyDataAttr(expanded ? 'expanded' : 'collapsed')
  }, [])

  const applyDataAttr = (state: 'expanded' | 'collapsed' | 'open') => {
    const root = document.documentElement
    if (state === 'collapsed') {
      root.dataset.sidebar = 'collapsed'
    } else if (state === 'open') {
      root.dataset.sidebar = 'open'
    } else {
      delete root.dataset.sidebar
    }
  }

  const toggle = useCallback(() => {
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      setIsMobileOpen(prev => {
        const next = !prev
        applyDataAttr(next ? 'open' : 'collapsed')
        return next
      })
      return
    }
    setIsExpanded(prev => {
      const next = !prev
      localStorage.setItem(STORAGE_KEY, next ? 'expanded' : 'collapsed')
      applyDataAttr(next ? 'expanded' : 'collapsed')
      return next
    })
  }, [])

  const openMobile = useCallback(() => {
    setIsMobileOpen(true)
    applyDataAttr('open')
  }, [])

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false)
    applyDataAttr('collapsed')
  }, [])

  return (
    <SidebarContext.Provider value={{ isExpanded, isMobileOpen, toggle, openMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar(): SidebarState {
  const ctx = useContext(SidebarContext)
  if (!ctx) throw new Error('useSidebar must be used inside SidebarProvider')
  return ctx
}
