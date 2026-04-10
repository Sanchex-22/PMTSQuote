"use client"

import type React from "react"

interface CustomCheckboxProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: React.ReactNode
  required?: boolean
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ id, checked, onChange, label, required = false }) => {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <div className="relative flex-shrink-0 mt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required={required}
          className="sr-only peer"
        />
        <div className={`w-5 h-5 rounded-md border-2 transition-all duration-150 flex items-center justify-center
          ${checked ? "bg-orange-500 border-orange-500" : "bg-white border-gray-300 group-hover:border-orange-400"}`}>
          {checked && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      <span className="text-sm text-gray-600 leading-5">{label}</span>
    </label>
  )
}
