'use client'

import * as React from 'react'
import { Search, LayoutGrid, X, ChevronDown, Check, Clock, Trash2 } from 'lucide-react'
import { Input } from "@/registry/new-york/ui/input"
import { Button } from "@/registry/new-york/ui/button"
import type { SearchEngine, SearchHistoryConfig } from '@/types/site'

interface SearchBarProps {
  onSearch: (query: string, engine: SearchEngine) => void
  searchQuery: string
  engines: SearchEngine[]
  defaultEngineId: string
  historyConfig?: SearchHistoryConfig
}

const HISTORY_KEY = 'search-history'

function getHistory(maxCount: number): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr.slice(0, maxCount)
  } catch {
    return []
  }
}

function saveHistory(items: string[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items))
}

export function SearchBar({ onSearch, searchQuery, engines, defaultEngineId, historyConfig }: SearchBarProps) {
  const [inputValue, setInputValue] = React.useState(searchQuery)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)
  const [iconError, setIconError] = React.useState(false)
  const [isFocused, setIsFocused] = React.useState(false)
  const [history, setHistory] = React.useState<string[]>([])

  const historyEnabled = historyConfig?.enabled ?? true
  const historyMaxCount = historyConfig?.maxCount ?? 5

  const [selectedEngineId, setSelectedEngineId] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('search-engine-id')
      if (saved && engines.find(e => e.id === saved)) return saved
    }
    return defaultEngineId
  })

  const selectedEngine = engines.find(e => e.id === selectedEngineId) || engines[0]
  const siteEngine = engines.find(e => e.isSite)
  const complementEngine = selectedEngine?.isSite
    ? (engines.find(e => !e.isSite) || engines[0])
    : (siteEngine || engines[0])

  React.useEffect(() => {
    setInputValue(searchQuery)
  }, [searchQuery])

  React.useEffect(() => {
    if (typeof window !== 'undefined' && selectedEngineId) {
      localStorage.setItem('search-engine-id', selectedEngineId)
    }
  }, [selectedEngineId])

  React.useEffect(() => {
    if (historyEnabled) {
      setHistory(getHistory(historyMaxCount))
    }
  }, [historyEnabled, historyMaxCount])

  const addToHistory = (query: string) => {
    if (!historyEnabled || !query.trim()) return
    const trimmed = query.trim()
    const current = getHistory(historyMaxCount)
    const filtered = current.filter(h => h !== trimmed)
    const updated = [trimmed, ...filtered].slice(0, historyMaxCount)
    saveHistory(updated)
    setHistory(updated)
  }

  const clearHistory = () => {
    saveHistory([])
    setHistory([])
  }

  const removeHistoryItem = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const updated = history.filter((_, i) => i !== index)
    saveHistory(updated)
    setHistory(updated)
  }

  const handleInputChange = (val: string) => {
    setInputValue(val)
    if (val === '' && siteEngine) {
      onSearch('', siteEngine)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        if (inputValue.trim() && complementEngine) {
          addToHistory(inputValue)
          onSearch(inputValue, complementEngine)
        }
      } else {
        if (inputValue.trim() === '') {
          if (siteEngine) onSearch('', siteEngine)
        } else if (selectedEngine) {
          addToHistory(inputValue)
          onSearch(inputValue, selectedEngine)
        }
      }
    }
  }

  const handleClear = () => {
    setInputValue('')
    if (siteEngine) onSearch('', siteEngine)
    inputRef.current?.focus()
  }

  const handleHistoryClick = (term: string) => {
    setInputValue(term)
    setIsFocused(false)
    if (selectedEngine) {
      addToHistory(term)
      onSearch(term, selectedEngine)
    }
  }

  const doSearch = () => {
    if (selectedEngine && inputValue.trim()) {
      addToHistory(inputValue)
      onSearch(inputValue, selectedEngine)
    } else {
      inputRef.current?.focus()
    }
  }

  const placeholder = `搜索内容，回车${selectedEngine?.name || ''} · Ctrl+回车${complementEngine?.name || ''}`
  const showHistory = historyEnabled && isFocused && inputValue === '' && history.length > 0 && !dropdownOpen

  return (
    <div className="relative group/bar w-full max-w-2xl mx-auto">
      <div className="flex items-center h-11 rounded-full bg-background border border-border/80 shadow-sm hover:shadow-md hover:border-border transition-all duration-200 overflow-hidden">
        {/* 引擎选择器 */}
        <button
          className="flex items-center gap-1.5 h-full pl-4 pr-3 hover:bg-muted/50 transition-colors border-r border-border/60 flex-shrink-0"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {selectedEngine?.isSite ? (
            <LayoutGrid className="h-4 w-4 text-primary flex-shrink-0" />
          ) : selectedEngine?.icon && !iconError ? (
            <img
              src={selectedEngine.icon}
              alt=""
              className="h-4 w-4 rounded-sm flex-shrink-0"
              onError={() => setIconError(true)}
            />
          ) : (
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
          <span className="text-sm font-medium text-foreground/80 max-w-[60px] truncate">{selectedEngine?.name}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* 输入框 */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 150)}
          spellCheck={false}
          className="flex-1 h-full px-4 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground/50 min-w-0"
        />

        {/* 右侧按钮区 */}
        <div className="flex items-center gap-1 pr-2 flex-shrink-0">
          {inputValue && (
            <button
              className="h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground/40 hover:text-foreground hover:bg-muted transition-all"
              onClick={handleClear}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          <button
            className="h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            onClick={doSearch}
            title="搜索"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 搜索历史记录面板 */}
      {showHistory && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 z-50 bg-popover border border-border/60 shadow-lg rounded-xl py-2 animate-in fade-in-0 zoom-in-95 duration-150">
          <div className="flex items-center justify-between px-4 pb-2 border-b border-border/40">
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              搜索历史
            </div>
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              onClick={clearHistory}
            >
              <Trash2 className="h-3 w-3" />
              清空
            </button>
          </div>
          <div className="pt-1">
            {history.map((term, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-foreground/80 hover:bg-muted transition-colors text-left group/history"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleHistoryClick(term)}
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0 group-hover/history:text-primary transition-colors" />
                <span className="flex-1 truncate">{term}</span>
                <span
                  className="opacity-0 group-hover/history:opacity-100 transition-opacity flex-shrink-0"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => removeHistoryItem(i, e)}
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive cursor-pointer" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 引擎下拉菜单 */}
      {dropdownOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
          <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-popover border border-border/60 shadow-lg rounded-xl py-1.5 min-w-[180px] animate-in fade-in-0 zoom-in-95 duration-150">
            {engines.map((engine) => (
              <button
                key={engine.id}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors text-left ${engine.id === selectedEngineId ? 'bg-primary/5 text-primary' : 'hover:bg-muted text-foreground/80'}`}
                onClick={() => {
                  setSelectedEngineId(engine.id)
                  setDropdownOpen(false)
                  setIconError(false)
                  inputRef.current?.focus()
                }}
              >
                {engine.isSite ? (
                  <LayoutGrid className="h-4 w-4 flex-shrink-0" />
                ) : engine.icon ? (
                  <img
                    src={engine.icon}
                    alt=""
                    className="h-4 w-4 rounded-sm flex-shrink-0"
                  />
                ) : (
                  <Search className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="flex-1 font-medium">{engine.name}</span>
                {engine.id === selectedEngineId && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}