"use client"

import type React from "react"
import { useState } from "react"

interface SelectOption {
  value: string
  label: string
  subtitle?: string
  flag?: string
  surcharge?: number
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  placeholder: string
  options: SelectOption[]
  icon?: React.ReactNode
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, onChange, placeholder, options, icon }) => {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find((opt) => opt.value === value)

  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">{icon}</div>}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-12 px-4 ${icon ? "pl-10" : ""} pr-10 bg-white border border-gray-200 rounded-xl 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-all duration-200 text-left hover:border-gray-300
                   ${selectedOption ? "text-gray-900" : "text-gray-400"}`}
      >
        <div className="flex items-center gap-2">
          {selectedOption?.flag && <span className="text-lg">{selectedOption.flag}</span>}
          {selectedOption ? selectedOption.label : placeholder}
        </div>
      </button>

      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="flex items-center gap-2">
                {option.flag && <span className="text-lg">{option.flag}</span>}
                <div>
                  <div className="text-gray-900">{option.label}</div>
                  {option.subtitle && <div className="text-sm text-gray-500 mt-1">{option.subtitle}</div>}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
