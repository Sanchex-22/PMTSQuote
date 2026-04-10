"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

interface SelectOption {
  value: string
  label: string
  subtitle?: string
  flag?: string
  surcharge?: number
}

interface CustomSelectProps {
  value?: string
  onChange: (value: string) => void
  placeholder: string
  options: SelectOption[]
  icon?: React.ReactNode
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value, onChange, placeholder, options, icon,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState("")
  const selectRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  // Default to Panama
  useEffect(() => {
    if (!value && options.length > 0) {
      const panama = options.find(opt => opt.value.toLowerCase() === "panama")
      if (panama) onChange(panama.value)
    }
  }, [value, options, onChange])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Focus search when opens
  useEffect(() => {
    if (isOpen) setTimeout(() => searchRef.current?.focus(), 50)
  }, [isOpen])

  const filtered = search.trim()
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options

  return (
    <div className="relative" ref={selectRef}>
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none">
          {icon}
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        className={`w-full h-14 px-4 ${icon ? "pl-11" : ""} pr-10 bg-white border border-gray-200 rounded-2xl
          focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent
          transition-all duration-200 text-left hover:border-gray-300 text-base
          ${selectedOption ? "text-gray-900" : "text-gray-400"}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.flag && <span className="text-lg flex-shrink-0">{selectedOption.flag}</span>}
          <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        </div>
      </button>

      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Search inside dropdown */}
          {options.length > 8 && (
            <div className="p-2 border-b border-gray-100">
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full h-10 px-3 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>
          )}
          <div className="max-h-56 overflow-y-auto overscroll-contain">
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No results</p>
            )}
            {filtered.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => { onChange(option.value); setIsOpen(false); setSearch("") }}
                className={`w-full px-4 py-3.5 text-left text-base transition-colors duration-100
                  ${option.value === value ? "bg-orange-50 text-orange-700 font-medium" : "hover:bg-gray-50 text-gray-900"}`}
              >
                <div className="flex items-center gap-3">
                  {option.flag && <span className="text-xl">{option.flag}</span>}
                  <div>
                    <div>{option.label}</div>
                    {option.subtitle && <div className="text-xs text-gray-400 mt-0.5">{option.subtitle}</div>}
                  </div>
                  {option.value === value && (
                    <svg className="ml-auto w-4 h-4 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
